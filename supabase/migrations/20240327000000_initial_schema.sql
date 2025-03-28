-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_jsonschema";
create extension if not exists "pg_stat_statements";
create extension if not exists "pg_net";

-- Create custom types
create type game_status as enum ('waiting', 'in_progress', 'completed', 'cancelled');
create type player_status as enum ('active', 'inactive', 'spectator');
create type card_suit as enum ('hearts', 'diamonds', 'clubs', 'spades');
create type card_rank as enum ('2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A');

-- Create base tables
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_seen timestamptz default now(),
    games_played integer default 0,
    games_won integer default 0,
    total_score integer default 0
);

-- Create indexes for performance
create index profiles_username_idx on public.profiles(username);
create index profiles_created_at_idx on public.profiles(created_at);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create RLS policies
create policy "Users can view all profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for profiles
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at(); 