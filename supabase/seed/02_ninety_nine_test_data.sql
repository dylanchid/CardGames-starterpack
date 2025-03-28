-- Insert test game session for Ninety-Nine
insert into public.game_sessions (
    id,
    created_by,
    game_type,
    status,
    max_players,
    current_round,
    settings
)
values (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'ninety_nine',
    'waiting',
    4,
    0,
    '{
        "max_rounds": 13,
        "timeLimit": 60,
        "allowSpectators": true,
        "autoDeal": true
    }'::jsonb
);

-- Insert test game players for Ninety-Nine
insert into public.game_players (
    session_id,
    user_id,
    position,
    status
)
values
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 1, 'active'),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 2, 'active'),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 3, 'active'),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000004', 4, 'active');

-- Insert test game state for Ninety-Nine
insert into public.game_states (
    session_id,
    round_number,
    current_player_position,
    state
)
values (
    '22222222-2222-2222-2222-222222222222',
    1,
    1,
    '{
        "hand": [
            {"suit": "hearts", "rank": "A"},
            {"suit": "diamonds", "rank": "K"},
            {"suit": "clubs", "rank": "Q"},
            {"suit": "spades", "rank": "J"},
            {"suit": "hearts", "rank": "10"},
            {"suit": "diamonds", "rank": "9"},
            {"suit": "clubs", "rank": "8"},
            {"suit": "spades", "rank": "7"},
            {"suit": "hearts", "rank": "6"},
            {"suit": "diamonds", "rank": "5"},
            {"suit": "clubs", "rank": "4"},
            {"suit": "spades", "rank": "3"},
            {"suit": "hearts", "rank": "2"}
        ],
        "current_trick": [],
        "bid": null,
        "score": 0
    }'::jsonb
);

-- Insert test leaderboard entries for Ninety-Nine
insert into public.leaderboards (user_id, game_type, score)
values
    ('00000000-0000-0000-0000-000000000001', 'ninety_nine', 150),
    ('00000000-0000-0000-0000-000000000002', 'ninety_nine', 120),
    ('00000000-0000-0000-0000-000000000003', 'ninety_nine', 90),
    ('00000000-0000-0000-0000-000000000004', 'ninety_nine', 60); 