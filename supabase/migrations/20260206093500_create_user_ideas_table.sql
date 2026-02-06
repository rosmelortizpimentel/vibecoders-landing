create table if not exists public.user_ideas (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_ideas_pkey primary key (id)
);

alter table public.user_ideas enable row level security;

create policy "Users can view their own ideas"
  on public.user_ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ideas"
  on public.user_ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ideas"
  on public.user_ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ideas"
  on public.user_ideas for delete
  using (auth.uid() = user_id);
