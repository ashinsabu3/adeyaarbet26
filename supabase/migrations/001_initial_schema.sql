-- AdeYaar 26 — Initial Schema
-- Run this in Supabase SQL Editor (or via supabase db push)

-- ╔══════════════════════════════════════════════════════════╗
-- ║ PROFILES                                                 ║
-- ║ Auto-created on Google OAuth signup via trigger           ║
-- ╚══════════════════════════════════════════════════════════╝
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  balance integer not null default 10000,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_name text;
  base_username text;
  final_username text;
  suffix integer := 0;
begin
  raw_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  base_username := lower(regexp_replace(raw_name, '[^a-zA-Z0-9]', '', 'g'));

  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', base_username),
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ╔══════════════════════════════════════════════════════════╗
-- ║ ACTIVITY                                                 ║
-- ║ Friend activity feed — bets placed, wins, joins, etc.    ║
-- ╚══════════════════════════════════════════════════════════╝
create table if not exists public.activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('bet_placed', 'bet_won', 'bet_lost', 'joined')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_activity_created_at on public.activity(created_at desc);
create index idx_activity_user_id on public.activity(user_id);

alter table public.activity enable row level security;

create policy "Activity is viewable by authenticated users"
  on public.activity for select
  to authenticated
  using (true);

create policy "Users can insert own activity"
  on public.activity for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ╔══════════════════════════════════════════════════════════╗
-- ║ BETS                                                     ║
-- ║ Actual bet records                                       ║
-- ╚══════════════════════════════════════════════════════════╝
create table if not exists public.bets (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id text not null,
  pick text not null check (pick in ('home', 'away', 'draw')),
  amount integer not null check (amount > 0),
  odds numeric(5,2) not null default 2.0,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'cancelled')),
  created_at timestamptz not null default now()
);

create index idx_bets_user_id on public.bets(user_id);
create index idx_bets_match_id on public.bets(match_id);

alter table public.bets enable row level security;

create policy "Users can view all bets"
  on public.bets for select
  to authenticated
  using (true);

create policy "Users can insert own bets"
  on public.bets for insert
  to authenticated
  with check (auth.uid() = user_id);
