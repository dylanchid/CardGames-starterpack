-- Create game_sessions table
create table public.game_sessions (
    id uuid default uuid_generate_v4() primary key,
    created_by uuid references public.profiles(id) not null,
    game_type text not null,
    status game_status default 'waiting',
    max_players integer not null,
    current_round integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    started_at timestamptz,
    ended_at timestamptz,
    settings jsonb default '{}'::jsonb
);

-- Create game_players table
create table public.game_players (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.game_sessions(id) on delete cascade not null,
    user_id uuid references public.profiles(id) not null,
    position integer not null,
    status player_status default 'active',
    joined_at timestamptz default now(),
    score integer default 0,
    unique(session_id, user_id),
    unique(session_id, position)
);

-- Create game_states table
create table public.game_states (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.game_sessions(id) on delete cascade not null,
    round_number integer not null,
    current_player_position integer not null,
    state jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(session_id, round_number)
);

-- Create game_actions table
create table public.game_actions (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.game_sessions(id) on delete cascade not null,
    player_id uuid references public.game_players(id) not null,
    action_type text not null,
    action_data jsonb not null,
    created_at timestamptz default now()
);

-- Create game_chat table
create table public.game_chat (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.game_sessions(id) on delete cascade not null,
    user_id uuid references public.profiles(id) not null,
    message text not null,
    created_at timestamptz default now()
);

-- Create leaderboards table
create table public.leaderboards (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    game_type text not null,
    score integer not null,
    created_at timestamptz default now(),
    unique(user_id, game_type)
);

-- Create indexes for performance
create index game_sessions_status_idx on public.game_sessions(status);
create index game_sessions_created_by_idx on public.game_sessions(created_by);
create index game_players_session_id_idx on public.game_players(session_id);
create index game_players_user_id_idx on public.game_players(user_id);
create index game_states_session_id_idx on public.game_states(session_id);
create index game_actions_session_id_idx on public.game_actions(session_id);
create index game_chat_session_id_idx on public.game_chat(session_id);
create index leaderboards_user_id_idx on public.leaderboards(user_id);
create index leaderboards_game_type_idx on public.leaderboards(game_type);

-- Enable Row Level Security
alter table public.game_sessions enable row level security;
alter table public.game_players enable row level security;
alter table public.game_states enable row level security;
alter table public.game_actions enable row level security;
alter table public.game_chat enable row level security;
alter table public.leaderboards enable row level security;

-- Create RLS policies
create policy "Users can view active games"
    on public.game_sessions for select
    to authenticated
    using (true);

create policy "Users can create games"
    on public.game_sessions for insert
    to authenticated
    with check (auth.uid() = created_by);

create policy "Game creator can update game"
    on public.game_sessions for update
    to authenticated
    using (auth.uid() = created_by);

create policy "Users can view game players"
    on public.game_players for select
    to authenticated
    using (true);

create policy "Users can join games"
    on public.game_players for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can view game states"
    on public.game_states for select
    to authenticated
    using (true);

create policy "Only game creator can update game state"
    on public.game_states for update
    to authenticated
    using (
        exists (
            select 1 from public.game_sessions
            where id = session_id
            and created_by = auth.uid()
        )
    );

create policy "Users can view game actions"
    on public.game_actions for select
    to authenticated
    using (true);

create policy "Users can create game actions"
    on public.game_actions for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can view game chat"
    on public.game_chat for select
    to authenticated
    using (true);

create policy "Users can send chat messages"
    on public.game_chat for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can view leaderboards"
    on public.leaderboards for select
    to authenticated
    using (true);

-- Create triggers for updated_at
create trigger handle_game_sessions_updated_at
    before update on public.game_sessions
    for each row
    execute function public.handle_updated_at();

create trigger handle_game_states_updated_at
    before update on public.game_states
    for each row
    execute function public.handle_updated_at(); 