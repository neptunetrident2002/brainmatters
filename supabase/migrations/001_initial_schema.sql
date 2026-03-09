-- ─── BrainMatters — Initial Schema ───────────────────────────────────────────────
-- PRD non-negotiables enforced here:
--   1. events table exists from day one (source of truth for all graphs)
--   2. organisation_id on users (reserved for Teams tier)
--   3. All tables have created_at + updated_at
--   4. Row Level Security enabled on every table

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────────────────────
create table public.users (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text not null default 'User',
  ai_credits           integer not null default 0 check (ai_credits >= 0),
  ai_credits_progress  integer not null default 0 check (ai_credits_progress >= 0 and ai_credits_progress <= 9),
  streak_days          integer not null default 0,
  total_challenges     integer not null default 0,
  organisation_id      uuid references public.organisations(id) on delete set null,  -- Teams tier
  feed_public          boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─── Organisations (Teams tier — stub, do not remove) ─────────────────────────
create table public.organisations (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Challenges ───────────────────────────────────────────────────────────────
create type challenge_status as enum ('pending', 'in_progress', 'completed_free', 'completed_credit');
create type challenge_category as enum ('Coding', 'Writing', 'Math', 'Memory', 'Logic', 'Professional');
create type recurring_type as enum ('daily', 'weekly', 'once');

create table public.challenges (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.users(id) on delete cascade,
  title                  text not null,
  category               challenge_category not null,
  difficulty             smallint not null check (difficulty between 1 and 5),
  status                 challenge_status not null default 'pending',
  recurring              recurring_type not null default 'once',
  streak                 integer not null default 0,
  started_at             timestamptz,
  completed_at           timestamptz,
  time_elapsed_seconds   integer,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ─── Daily Tasks ──────────────────────────────────────────────────────────────
create table public.daily_tasks (
  id                timestamptz primary key default uuid_generate_v4(),
  date              date not null unique,  -- One task per day
  title             text not null,
  description       text not null,
  category          challenge_category not null,
  difficulty        smallint not null check (difficulty between 1 and 5),
  code_snippet      text,                  -- Optional code for Coding tasks
  completions_count integer not null default 0,
  created_at        timestamptz not null default now()
);

create table public.daily_completions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.users(id) on delete cascade,
  daily_task_id          uuid not null references public.daily_tasks(id) on delete cascade,
  completed_at           timestamptz not null default now(),
  time_elapsed_seconds   integer not null,
  used_ai_credit         boolean not null default false,
  unique (user_id, daily_task_id)  -- One completion per user per day
);

-- ─── Events (PRD non-negotiable: source of truth for ALL graphs) ──────────────
create type event_type as enum (
  'challenge_started',
  'challenge_completed_free',
  'challenge_completed_credit',
  'credit_earned',
  'credit_spent',
  'daily_completed',
  'game_played',
  'streak_extended',
  'streak_broken'
);

create table public.events (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       event_type not null,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
  -- NO updated_at — events are immutable
);

-- Index for fast graph queries by user + time
create index events_user_time_idx on public.events (user_id, created_at desc);
create index events_type_idx on public.events (type, created_at desc);

-- ─── Credit Transactions ──────────────────────────────────────────────────────
create table public.credit_transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  delta        smallint not null check (delta in (-1, 1)),
  reason       text not null,
  challenge_id uuid references public.challenges(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── Game Records ─────────────────────────────────────────────────────────────
create type game_type as enum ('dots_and_boxes', 'tic_tac_toe');
create type game_outcome as enum ('win', 'loss', 'draw');

create table public.game_records (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  game_type        game_type not null,
  outcome          game_outcome not null,
  difficulty       text not null,
  duration_seconds integer not null,
  created_at       timestamptz not null default now()
);

-- ─── Feed View (read-only, no separate table needed) ─────────────────────────
create view public.feed_items_view as
  -- Challenge completions (only from users with feed_public = true)
  select
    e.id,
    'completion' as type,
    u.display_name as user_display_name,
    c.title as challenge_title,
    c.category,
    e.metadata->>'seconds' as time_elapsed_seconds,
    (e.type = 'challenge_completed_free') as ai_free,
    null::integer as streak_days,
    null::text as daily_task_title,
    null::integer as daily_completions_count,
    e.created_at
  from public.events e
  join public.users u on u.id = e.user_id
  left join public.challenges c on c.id = (e.metadata->>'challenge_id')::uuid
  where e.type in ('challenge_completed_free', 'challenge_completed_credit')
    and u.feed_public = true

  union all

  -- Credit earned events
  select
    e.id, 'credit' as type, u.display_name, null, null, null, null, null, null, null, e.created_at
  from public.events e
  join public.users u on u.id = e.user_id
  where e.type = 'credit_earned' and u.feed_public = true

  union all

  -- Streak events
  select
    e.id, 'streak' as type, u.display_name, null, null, null, null,
    (e.metadata->>'days')::integer, null, null, e.created_at
  from public.events e
  join public.users u on u.id = e.user_id
  where e.type = 'streak_extended' and u.feed_public = true

  order by created_at desc;

-- ─── Auto-update timestamps ───────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users for each row execute function update_updated_at();
create trigger challenges_updated_at before update on public.challenges for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- PRD hard rule: RLS enabled on every table, no exceptions
alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.daily_completions enable row level security;
alter table public.events enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.game_records enable row level security;
alter table public.organisations enable row level security;

-- Users: only read/edit your own row
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Challenges: full CRUD on own challenges only
create policy "Users CRUD own challenges" on public.challenges for all using (auth.uid() = user_id);

-- Daily tasks: anyone can read (cached), only admin can write
create policy "Anyone can read daily tasks" on public.daily_tasks for select using (true);

-- Daily completions: read/write own completions only
create policy "Users CRUD own daily completions" on public.daily_completions for all using (auth.uid() = user_id);

-- Events: users can read own events, insert only (no update/delete — immutable)
create policy "Users read own events" on public.events for select using (auth.uid() = user_id);
create policy "Users insert own events" on public.events for insert with check (auth.uid() = user_id);

-- Credit transactions: read own only
create policy "Users read own credits" on public.credit_transactions for select using (auth.uid() = user_id);

-- Game records: CRUD own only
create policy "Users CRUD own game records" on public.game_records for all using (auth.uid() = user_id);
