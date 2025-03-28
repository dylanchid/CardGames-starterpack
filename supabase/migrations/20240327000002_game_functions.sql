-- Function to deal cards
create or replace function public.deal_cards(game_session_id uuid)
returns void as $$
declare
    player record;
    deck jsonb;
    hand jsonb;
begin
    -- Generate deck
    deck := (
        select jsonb_agg(
            jsonb_build_object(
                'suit', suit::text,
                'rank', rank::text
            )
        )
        from (
            select unnest(enum_range(null::card_suit)) as suit,
                   unnest(enum_range(null::card_rank)) as rank
        ) as cards
    );

    -- Shuffle deck
    deck := (
        select jsonb_agg(card)
        from (
            select card
            from jsonb_array_elements(deck) as card
            order by random()
        ) as shuffled
    );

    -- Deal cards to each player
    for player in (
        select id, position
        from public.game_players
        where session_id = game_session_id
        order by position
    ) loop
        -- Deal 13 cards to each player
        hand := (
            select jsonb_agg(card)
            from (
                select card
                from jsonb_array_elements(deck) as card
                limit 13
                offset (player.position - 1) * 13
            ) as player_hand
        );

        -- Store player's hand in game state
        insert into public.game_states (
            session_id,
            round_number,
            current_player_position,
            state
        ) values (
            game_session_id,
            1,
            player.position,
            jsonb_build_object(
                'hand', hand,
                'tricks', 0,
                'bid', null
            )
        );
    end loop;
end;
$$ language plpgsql;

-- Function to validate and process a bid
create or replace function public.process_bid(
    game_session_id uuid,
    player_id uuid,
    bid_amount integer
)
returns boolean as $$
declare
    current_state jsonb;
    player_position integer;
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

    -- Validate bid
    if bid_amount < 0 or bid_amount > 13 then
        return false;
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

-- Function to play a card
create or replace function public.play_card(
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

    -- Get player's hand
    hand := current_state->'hand';

    -- Find and remove played card
    played_card := jsonb_build_object(
        'suit', card_suit,
        'rank', card_rank
    );

    -- Remove card from hand
    hand := (
        select jsonb_agg(card)
        from jsonb_array_elements(hand) as card
        where card != played_card
    );

    -- Update game state
    current_state := jsonb_set(
        current_state,
        '{hand}',
        hand
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

-- Function to handle player join/leave
create or replace function public.handle_player_status_change()
returns trigger as $$
begin
    if new.status != old.status then
        -- Update game session status based on player count
        update public.game_sessions
        set status = case
            when (select count(*) from public.game_players where session_id = new.session_id) = max_players
            then 'in_progress'
            else 'waiting'
        end
        where id = new.session_id;
    end if;
    return new;
end;
$$ language plpgsql;

-- Create trigger for player status changes
create trigger handle_player_status_change
    after update on public.game_players
    for each row
    execute function public.handle_player_status_change();

-- Function to update leaderboard
create or replace function public.update_leaderboard(
    user_id uuid,
    game_type text,
    score integer
)
returns void as $$
begin
    insert into public.leaderboards (user_id, game_type, score)
    values (user_id, game_type, score)
    on conflict (user_id, game_type)
    do update set score = leaderboards.score + excluded.score;
end;
$$ language plpgsql; 