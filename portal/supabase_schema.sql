-- Run this in Supabase Dashboard → SQL Editor

-- Table: one row per user per training pathway. Progress stored as JSON.
create table if not exists public.training_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  training_type text not null check (training_type in ('induction', 'swimming')),
  progress jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, training_type)
);

-- RLS: users can only read/update their own rows
alter table public.training_progress enable row level security;

create policy "Users can read own progress"
  on public.training_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.training_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.training_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Example progress shape: { "pct": 45, "lastModule": "module-3", "sections": { "module-2": ["overview","block1"], "module-3": [] } }
