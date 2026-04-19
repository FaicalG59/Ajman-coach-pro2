-- =======================================================
-- AJMAN COACH PRO v3.0 — Database Schema (Upgraded)
-- Run this in Supabase SQL Editor (replaces v2 schema)
-- =======================================================

create extension if not exists "uuid-ossp";

-- COACHES (added role for admin support)
create table if not exists public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  club_name text default 'Ajman Club',
  phone_whatsapp text,
  role text not null default 'coach' check (role in ('coach','admin')),
  created_at timestamptz default now()
);

-- TEAMS
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  age_group text check (age_group in ('U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior')),
  division text,
  logo_url text,
  created_at timestamptz default now()
);
create index if not exists idx_teams_coach on public.teams(coach_id);

-- PLAYERS
create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  position text not null check (position in ('GK','DEF','MID','FWD')),
  age_group text check (age_group in ('U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior')),
  jersey_number int,
  height_cm numeric,
  weight_kg numeric,
  nationality text,
  whatsapp_number text,
  photo_url text,
  photo_bucket_path text,
  status text not null default 'fit' check (status in ('fit','injured','recovering','inactive')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_players_coach on public.players(coach_id);
create index if not exists idx_players_team on public.players(team_id);

-- INJURIES
create table if not exists public.injuries (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  injury_type text not null,
  body_part text not null,
  severity text not null check (severity in ('minor','moderate','severe')),
  injury_date date not null,
  expected_recovery_days int not null,
  expected_return_date date not null,
  actual_return_date date,
  status text not null default 'active' check (status in ('active','recovered')),
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_injuries_player on public.injuries(player_id);

-- PERFORMANCES
create table if not exists public.performances (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  match_date date not null,
  opponent text not null,
  minutes_played int default 0,
  goals int default 0,
  assists int default 0,
  passes_completed int default 0,
  passes_attempted int default 0,
  tackles int default 0,
  shots int default 0,
  shots_on_target int default 0,
  rating numeric check (rating >= 0 and rating <= 10),
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_performances_player on public.performances(player_id);
create index if not exists idx_performances_team on public.performances(team_id);

-- SESSIONS (added sections JSON for 4-section builder)
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete set null,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  title text not null,
  session_date date not null,
  duration_minutes int not null default 90,
  focus_area text not null,
  location text,
  coach_notes text,
  tactical_setup text,
  sections jsonb default '[]',
  created_at timestamptz default now()
);
create index if not exists idx_sessions_coach on public.sessions(coach_id);

-- SESSION PLAYERS
create table if not exists public.session_players (
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  attended boolean default true,
  individual_notes text,
  primary key (session_id, player_id)
);

-- EVALUATIONS
create table if not exists public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.players(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  evaluation_date date not null default current_date,
  tech_first_touch int check (tech_first_touch between 1 and 10),
  tech_passing int check (tech_passing between 1 and 10),
  tech_shooting int check (tech_shooting between 1 and 10),
  tech_dribbling int check (tech_dribbling between 1 and 10),
  tac_positioning int check (tac_positioning between 1 and 10),
  tac_decision_making int check (tac_decision_making between 1 and 10),
  tac_game_reading int check (tac_game_reading between 1 and 10),
  phy_speed int check (phy_speed between 1 and 10),
  phy_strength int check (phy_strength between 1 and 10),
  phy_endurance int check (phy_endurance between 1 and 10),
  men_concentration int check (men_concentration between 1 and 10),
  men_confidence int check (men_confidence between 1 and 10),
  men_teamwork int check (men_teamwork between 1 and 10),
  strengths text,
  areas_to_improve text,
  general_notes text,
  created_at timestamptz default now()
);
create index if not exists idx_evaluations_player on public.evaluations(player_id);

-- RECRUITMENT with enhanced scouting scores
create table if not exists public.recruitment (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age_group text check (age_group in ('U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior')),
  position text check (position in ('GK','DEF','MID','FWD')),
  phone_number text,
  whatsapp_number text,
  email text,
  club_origin text,
  notes text,
  photo_url text,
  photo_bucket_path text,
  status text default 'interested' check (status in ('interested','contacted','trial','signed','rejected','not_interested')),
  contacted_date date,
  trial_date date,
  -- Scouting evaluation scores (1-10)
  scout_tech_ball_control int check (scout_tech_ball_control between 1 and 10),
  scout_tech_passing int check (scout_tech_passing between 1 and 10),
  scout_tech_shooting int check (scout_tech_shooting between 1 and 10),
  scout_tech_dribbling int check (scout_tech_dribbling between 1 and 10),
  scout_phy_speed int check (scout_phy_speed between 1 and 10),
  scout_phy_strength int check (scout_phy_strength between 1 and 10),
  scout_phy_endurance int check (scout_phy_endurance between 1 and 10),
  scout_phy_agility int check (scout_phy_agility between 1 and 10),
  scout_tac_positioning int check (scout_tac_positioning between 1 and 10),
  scout_tac_awareness int check (scout_tac_awareness between 1 and 10),
  scout_tac_decision int check (scout_tac_decision between 1 and 10),
  scout_psy_confidence int check (scout_psy_confidence between 1 and 10),
  scout_psy_leadership int check (scout_psy_leadership between 1 and 10),
  scout_psy_composure int check (scout_psy_composure between 1 and 10),
  scout_psy_work_ethic int check (scout_psy_work_ethic between 1 and 10),
  scout_overall_rating numeric,
  scout_recommendation text check (scout_recommendation in ('sign','trial_extend','monitor','pass')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_recruitment_coach on public.recruitment(coach_id);
create index if not exists idx_recruitment_status on public.recruitment(status);

-- VIDEO ANALYSIS
create table if not exists public.video_analyses (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  player_id uuid references public.players(id) on delete set null,
  title text not null,
  video_url text,
  video_bucket_path text,
  duration_seconds int,
  annotations jsonb default '[]',
  ai_summary text,
  tags text[] default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_video_coach on public.video_analyses(coach_id);

-- RLS POLICIES
alter table public.coaches enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.injuries enable row level security;
alter table public.performances enable row level security;
alter table public.sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.evaluations enable row level security;
alter table public.recruitment enable row level security;
alter table public.video_analyses enable row level security;

-- Helper: check if user is admin
create or replace function public.is_admin() returns boolean as $$
  select exists(select 1 from public.coaches where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- Coach policies (coach sees own, admin sees all)
drop policy if exists "Coaches view own" on public.coaches;
drop policy if exists "Coaches update own" on public.coaches;
drop policy if exists "Coaches insert own" on public.coaches;
create policy "Coaches view" on public.coaches for select using (auth.uid() = id or public.is_admin());
create policy "Coaches update own" on public.coaches for update using (auth.uid() = id);
create policy "Coaches insert own" on public.coaches for insert with check (auth.uid() = id);

-- All data tables: coach sees own, admin sees all
drop policy if exists "Teams coach access" on public.teams;
drop policy if exists "Players coach access" on public.players;
drop policy if exists "Injuries coach access" on public.injuries;
drop policy if exists "Performances coach access" on public.performances;
drop policy if exists "Sessions coach access" on public.sessions;
drop policy if exists "Evaluations coach access" on public.evaluations;
drop policy if exists "Recruitment coach access" on public.recruitment;
drop policy if exists "Session players coach access" on public.session_players;
drop policy if exists "Video coach access" on public.video_analyses;

create policy "Teams coach access" on public.teams for all using (coach_id = auth.uid() or public.is_admin());
create policy "Players coach access" on public.players for all using (coach_id = auth.uid() or public.is_admin());
create policy "Injuries coach access" on public.injuries for all using (coach_id = auth.uid() or public.is_admin());
create policy "Performances coach access" on public.performances for all using (coach_id = auth.uid() or public.is_admin());
create policy "Sessions coach access" on public.sessions for all using (coach_id = auth.uid() or public.is_admin());
create policy "Evaluations coach access" on public.evaluations for all using (coach_id = auth.uid() or public.is_admin());
create policy "Recruitment coach access" on public.recruitment for all using (coach_id = auth.uid() or public.is_admin());
create policy "Video coach access" on public.video_analyses for all using (coach_id = auth.uid() or public.is_admin());
create policy "Session players coach access" on public.session_players for all
  using (exists (select 1 from public.sessions s where s.id = session_id and (s.coach_id = auth.uid() or public.is_admin())));

-- Triggers
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_players_updated on public.players;
create trigger trg_players_updated before update on public.players
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_recruitment_updated on public.recruitment;
create trigger trg_recruitment_updated before update on public.recruitment
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.coaches (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'coach');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
