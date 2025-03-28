-- Insert test profiles
insert into public.profiles (id, username, avatar_url)
values
    ('00000000-0000-0000-0000-000000000001', 'test_user_1', 'https://example.com/avatar1.png'),
    ('00000000-0000-0000-0000-000000000002', 'test_user_2', 'https://example.com/avatar2.png'),
    ('00000000-0000-0000-0000-000000000003', 'test_user_3', 'https://example.com/avatar3.png'),
    ('00000000-0000-0000-0000-000000000004', 'test_user_4', 'https://example.com/avatar4.png');

-- Insert test game session
insert into public.game_sessions (
    id,
    created_by,
    game_type,
    status,
    max_players,
    settings
)
values (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'ninety_nine',
    'waiting',
    4,
    '{"timeLimit": 30, "allowSpectators": true}'::jsonb
);

-- Insert test game players
insert into public.game_players (
    session_id,
    user_id,
    position,
    status
)
values
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 1, 'active'),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 2, 'active'),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 3, 'active'),
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', 4, 'active');

-- Insert test leaderboard entries
insert into public.leaderboards (user_id, game_type, score)
values
    ('00000000-0000-0000-0000-000000000001', 'ninety_nine', 100),
    ('00000000-0000-0000-0000-000000000002', 'ninety_nine', 95),
    ('00000000-0000-0000-0000-000000000003', 'ninety_nine', 90),
    ('00000000-0000-0000-0000-000000000004', 'ninety_nine', 85); 