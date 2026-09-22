-- Run this in the Supabase SQL Editor before deploying.

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  hotel text,
  email text not null,
  phone text,
  message text
);

alter table leads enable row level security;

-- Only authenticated users (dashboard) can read.
-- Inserts happen only via the Vercel Function using the service role key,
-- which bypasses RLS, so no insert policy is needed here.
create policy "Authenticated users can read leads"
  on leads for select
  using (auth.role() = 'authenticated');
