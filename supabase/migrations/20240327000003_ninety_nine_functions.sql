-- Function to validate and process a bid for Ninety-Nine
create or replace function public.process_ninety_nine_bid(
    game_session_id uuid,
    player_id uuid,
    bid_amount integer
)
returns boolean as $$
declare
    current_state jsonb;
    player_position integer;
    total_bids integer;
begin
    -- Get current game state and player position
    select gs.state, gp.position
    into current_state, player_position
    from public.game_states gs
    join public.game_players gp on gp.session_id = gs.session_id
    where gs.session_id = game_session_id
    and gp.user_id = player_id
    and gs.round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    );

    -- Get total bids so far
    select count(*)
    into total_bids
    from public.game_states
    where session_id = game_session_id
    and round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    )
    and state->>'bid' is not null;

    -- Validate bid
    if bid_amount < 0 or bid_amount > 13 then
        return false;
    end if;

    -- Check if this is the last bid and validate total
    if total_bids = 3 then
        if (select sum((state->>'bid')::integer)
            from public.game_states
            where session_id = game_session_id
            and round_number = (
                select max(round_number)
                from public.game_states
                where session_id = game_session_id
            )) + bid_amount = 13 then
            return false; -- Total bids cannot equal 13
        end if;
    end if;

    -- Update player's bid
    current_state := jsonb_set(
        current_state,
        '{bid}',
        to_jsonb(bid_amount)
    );

    -- Update game state
    update public.game_states
    set state = current_state,
        updated_at = now()
    where session_id = game_session_id
    and round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    );

    return true;
end;
$$ language plpgsql;

-- Function to play a card in Ninety-Nine
create or replace function public.play_ninety_nine_card(
    game_session_id uuid,
    player_id uuid,
    card_suit text,
    card_rank text
)
returns boolean as $$
declare
    current_state jsonb;
    player_position integer;
    current_player_position integer;
    hand jsonb;
    played_card jsonb;
    trick jsonb;
    trick_count integer;
    current_score integer;
begin
    -- Get current game state
    select gs.state, gp.position, gs.current_player_position
    into current_state, player_position, current_player_position
    from public.game_states gs
    join public.game_players gp on gp.session_id = gs.session_id
    where gs.session_id = game_session_id
    and gp.user_id = player_id
    and gs.round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    );

    -- Validate turn
    if player_position != current_player_position then
        return false;
    end if;

    -- Get player's hand and current trick
    hand := current_state->'hand';
    trick := coalesce(current_state->'current_trick', '[]'::jsonb);
    trick_count := jsonb_array_length(trick);
    current_score := coalesce((current_state->>'score')::integer, 0);

    -- Find and remove played card
    played_card := jsonb_build_object(
        'suit', card_suit,
        'rank', card_rank,
        'player', player_position
    );

    -- Remove card from hand
    hand := (
        select jsonb_agg(card)
        from jsonb_array_elements(hand) as card
        where card != jsonb_build_object('suit', card_suit, 'rank', card_rank)
    );

    -- Add card to current trick
    trick := trick || played_card;

    -- If trick is complete (4 cards), process it
    if jsonb_array_length(trick) = 4 then
        -- Calculate trick winner and update score
        -- (This is a simplified version - you'll need to implement the actual trick-winning logic)
        current_score := current_score + 1;
        trick := '[]'::jsonb;
    end if;

    -- Update game state
    current_state := jsonb_set(
        jsonb_set(
            jsonb_set(
                current_state,
                '{hand}',
                hand
            ),
            '{current_trick}',
            trick
        ),
        '{score}',
        to_jsonb(current_score)
    );

    -- Update current player position
    current_state := jsonb_set(
        current_state,
        '{current_player_position}',
        to_jsonb((current_player_position % 4) + 1)
    );

    -- Update game state
    update public.game_states
    set state = current_state,
        updated_at = now()
    where session_id = game_session_id
    and round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    );

    return true;
end;
$$ language plpgsql;

-- Function to calculate round score
create or replace function public.calculate_round_score(
    game_session_id uuid,
    player_id uuid
)
returns integer as $$
declare
    player_state jsonb;
    player_bid integer;
    tricks_won integer;
begin
    -- Get player's state
    select state
    into player_state
    from public.game_states
    where session_id = game_session_id
    and round_number = (
        select max(round_number)
        from public.game_states
        where session_id = game_session_id
    )
    and exists (
        select 1
        from public.game_players
        where session_id = game_session_id
        and user_id = player_id
    );

    -- Get player's bid and tricks won
    player_bid := (player_state->>'bid')::integer;
    tricks_won := (player_state->>'score')::integer;

    -- Calculate score based on bid and tricks
    if tricks_won = player_bid then
        return 20 + (tricks_won * 10);
    else
        return abs(tricks_won - player_bid) * -10;
    end if;
end;
$$ language plpgsql;

-- Function to handle round completion
create or replace function public.handle_round_completion(game_session_id uuid)
returns void as $$
declare
    current_round integer;
    max_rounds integer;
    player record;
    round_score integer;
begin
    -- Get current round and max rounds
    select current_round, max_rounds
    into current_round, max_rounds
    from public.game_sessions
    where id = game_session_id;

    -- Calculate scores for each player
    for player in (
        select user_id
        from public.game_players
        where session_id = game_session_id
    ) loop
        -- Calculate round score
        round_score := public.calculate_round_score(game_session_id, player.user_id);
        
        -- Update player's total score
        update public.game_players
        set score = score + round_score
        where session_id = game_session_id
        and user_id = player.user_id;
    end loop;

    -- Check if game is complete
    if current_round >= max_rounds then
        -- Update game status to completed
        update public.game_sessions
        set status = 'completed',
            ended_at = now()
        where id = game_session_id;

        -- Update leaderboard
        for player in (
            select user_id, score
            from public.game_players
            where session_id = game_session_id
        ) loop
            perform public.update_leaderboard(
                player.user_id,
                'ninety_nine',
                player.score
            );
        end loop;
    else
        -- Start next round
        perform public.deal_cards(game_session_id);
        
        -- Update round number
        update public.game_sessions
        set current_round = current_round + 1
        where id = game_session_id;
    end if;
end;
$$ language plpgsql;

-- Function to validate game settings
create or replace function public.validate_game_settings(settings jsonb)
returns boolean as $$
begin
    -- Validate max players
    if (settings->>'max_players')::integer not in (2, 3, 4) then
        return false;
    end if;

    -- Validate max rounds
    if (settings->>'max_rounds')::integer < 1 or (settings->>'max_rounds')::integer > 13 then
        return false;
    end if;

    -- Validate time limit (if specified)
    if settings->>'timeLimit' is not null then
        if (settings->>'timeLimit')::integer < 30 or (settings->>'timeLimit')::integer > 300 then
            return false;
        end if;
    end if;

    return true;
end;
$$ language plpgsql;

-- Create trigger to validate game settings on insert/update
create or replace function public.validate_game_settings_trigger()
returns trigger as $$
begin
    if not public.validate_game_settings(new.settings) then
        raise exception 'Invalid game settings';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger validate_game_settings
    before insert or update on public.game_sessions
    for each row
    execute function public.validate_game_settings_trigger(); 