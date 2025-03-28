begin;
select plan(20);

-- Test profile table
select has_table('public', 'profiles', 'profiles table should exist');
select has_column('public', 'profiles', 'id', 'profiles should have id column');
select has_column('public', 'profiles', 'username', 'profiles should have username column');
select col_is_pk('public', 'profiles', 'id', 'profiles id should be primary key');

-- Test game_sessions table
select has_table('public', 'game_sessions', 'game_sessions table should exist');
select has_column('public', 'game_sessions', 'id', 'game_sessions should have id column');
select has_column('public', 'game_sessions', 'created_by', 'game_sessions should have created_by column');
select col_is_pk('public', 'game_sessions', 'id', 'game_sessions id should be primary key');

-- Test game_players table
select has_table('public', 'game_players', 'game_players table should exist');
select has_column('public', 'game_players', 'id', 'game_players should have id column');
select has_column('public', 'game_players', 'session_id', 'game_players should have session_id column');
select col_is_pk('public', 'game_players', 'id', 'game_players id should be primary key');

-- Test game_states table
select has_table('public', 'game_states', 'game_states table should exist');
select has_column('public', 'game_states', 'id', 'game_states should have id column');
select has_column('public', 'game_states', 'session_id', 'game_states should have session_id column');
select col_is_pk('public', 'game_states', 'id', 'game_states id should be primary key');

-- Test functions
select has_function('public', 'deal_cards', array['uuid'], 'deal_cards function should exist');
select has_function('public', 'process_bid', array['uuid', 'uuid', 'integer'], 'process_bid function should exist');
select has_function('public', 'play_card', array['uuid', 'uuid', 'text', 'text'], 'play_card function should exist');

-- Test triggers
select has_trigger('public', 'profiles', 'handle_profiles_updated_at', 'profiles should have updated_at trigger');
select has_trigger('public', 'game_sessions', 'handle_game_sessions_updated_at', 'game_sessions should have updated_at trigger');
select has_trigger('public', 'game_states', 'handle_game_states_updated_at', 'game_states should have updated_at trigger');

select * from finish();
rollback; 