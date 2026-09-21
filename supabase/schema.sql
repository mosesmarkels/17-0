-- Run this once in the Supabase SQL editor to create the shared leaderboard.

create table if not exists public.seasons (
  id         bigserial primary key,
  player     text        not null check (char_length(player) between 1 and 18),
  wins       int         not null check (wins between 0 and 17),
  losses     int         not null check (losses between 0 and 17),
  points     int         not null check (points >= 0),
  strength   numeric,
  prize      int,
  mode       text        check (mode in ('classic', 'iq')),
  qb         text,
  created_at timestamptz not null default now()
);

create index if not exists seasons_points_idx on public.seasons (points desc);

alter table public.seasons enable row level security;

-- Anyone can read the board and post their own season. Note what is *not*
-- granted: there is no update or delete policy, so once a season is posted
-- nobody can quietly rewrite or remove it from the browser.
create policy "read the board"
  on public.seasons for select to anon using (true);

create policy "post a season"
  on public.seasons for insert to anon with check (true);
