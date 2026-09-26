-- Presence Hospitality — demo requests ("leads").
-- Writes: server only (secret key bypasses RLS). Reads/updates/deletes: signed-in admins only.

create extension if not exists pgcrypto;

create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- Form fields
  first_name        text not null check (char_length(first_name) between 1 and 80),
  last_name         text not null check (char_length(last_name) between 1 and 80),
  email             text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone             text not null check (char_length(phone) between 6 and 32),
  position          text not null check (position in ('owner', 'general_manager', 'operations_manager', 'front_office_manager', 'other')),
  hotel_name        text not null check (char_length(hotel_name) between 1 and 120),
  pms               text check (pms is null or char_length(pms) <= 80),
  description       text not null check (char_length(description) between 10 and 2000),

  -- Context + GDPR
  language          text not null check (language in ('en', 'nl')),
  gdpr_consent      boolean not null check (gdpr_consent = true),
  gdpr_consent_at   timestamptz not null default now(),
  source            text not null default 'website',

  -- Pipeline (managed in /dashboard)
  status            text not null default 'new' check (status in ('new', 'contacted', 'demo_scheduled', 'won', 'lost')),
  status_updated_at timestamptz,
  notes             text check (notes is null or char_length(notes) <= 5000)
);

comment on table public.leads is 'Demo requests from the website form. Inserted server-side only.';

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_email_idx on public.leads (lower(email));

-- Keep status_updated_at in sync.
create function public.leads_touch_status() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at := now();
  end if;
  return new;
end $$;

create trigger leads_touch_status before update on public.leads
for each row execute function public.leads_touch_status();

-- Light abuse protection: max 3 requests per email address per 10 minutes.
create function public.leads_throttle() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.leads l
      where lower(l.email) = lower(new.email) and l.created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'too_many_requests' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger leads_throttle before insert on public.leads
for each row execute function public.leads_throttle();

-- Admin = signed-in user whose app_metadata.role is 'admin' (only settable server-side).
create function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- RLS: no policies for anon at all; admins may read, update (pipeline columns only) and delete.
alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
grant select, delete on public.leads to authenticated;
grant update (status, notes) on public.leads to authenticated;

create policy "Admins can read leads" on public.leads
  for select to authenticated using (public.is_admin());

create policy "Admins can update lead status and notes" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete leads" on public.leads
  for delete to authenticated using (public.is_admin());
