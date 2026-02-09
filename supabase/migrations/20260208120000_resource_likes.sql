-- Create resource_likes table
create table if not exists public.resource_likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.prompts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, resource_id)
);

-- Enable RLS
alter table public.resource_likes enable row level security;

-- RLS Policies
create policy "Public likes are viewable by everyone."
  on public.resource_likes for select
  using ( true );

create policy "Users can insert their own likes."
  on public.resource_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on public.resource_likes for delete
  using ( auth.uid() = user_id );
