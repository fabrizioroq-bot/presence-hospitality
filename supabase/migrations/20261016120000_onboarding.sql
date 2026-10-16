-- Presence Hospitality — client onboarding intake (/intake/<token>).
-- An admin creates an invite; the client fills the form through a link that carries a random token.
-- Only the token's SHA-256 hash is stored. The public page never talks to the database directly:
-- server code (secret key) calls the functions below, which check the token on every call.
-- Admins read and manage everything from the dashboard (RLS, same is_admin() as leads).

create table public.onboarding_invites (
  id                uuid primary key default gen_random_uuid(),
  token_hash        text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  lead_id           uuid references public.leads (id) on delete set null,
  property_name     text not null check (char_length(property_name) between 1 and 120),
  contact_email     text check (contact_email is null or (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(contact_email) <= 254)),
  language          text not null check (language in ('en', 'nl')),
  -- "expired" is normally derived from expires_at (see onboarding_invite_state); it is allowed here
  -- so an admin can also set it explicitly.
  status            text not null default 'sent'
                    check (status in ('sent', 'opened', 'in_progress', 'submitted', 'expired', 'revoked')),
  expires_at        timestamptz not null,
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  opened_at         timestamptz,
  submitted_at      timestamptz,
  last_activity_at  timestamptz
);

comment on table public.onboarding_invites is 'Onboarding intake links. Only the SHA-256 of the token is stored.';

create index onboarding_invites_created_at_idx on public.onboarding_invites (created_at desc);
create index onboarding_invites_lead_idx on public.onboarding_invites (lead_id);

create table public.onboarding_responses (
  id                 uuid primary key default gen_random_uuid(),
  invite_id          uuid not null unique references public.onboarding_invites (id) on delete cascade,
  answers            jsonb not null default '{}'::jsonb
                     check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 65536),
  progress           smallint not null default 0 check (progress between 0 and 100),
  updated_at         timestamptz not null default now(),
  submitted_at       timestamptz,
  -- Autosave rate limit (per invite, fixed one-minute window).
  save_window_start  timestamptz not null default now(),
  save_count         integer not null default 0
);

comment on table public.onboarding_responses is 'Autosaved intake answers, keyed by the stable field keys in src/content/onboarding-form.ts.';

-- ---- RLS: no anonymous access at all; admins manage everything -----------------------------
alter table public.onboarding_invites enable row level security;
alter table public.onboarding_responses enable row level security;

revoke all on public.onboarding_invites from anon, authenticated;
revoke all on public.onboarding_responses from anon, authenticated;
grant select, insert, update, delete on public.onboarding_invites to authenticated;
grant select, update, delete on public.onboarding_responses to authenticated;

create policy "Admins manage onboarding invites" on public.onboarding_invites
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage onboarding responses" on public.onboarding_responses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Token-gated functions for the public page (server only) --------------------------------

-- 'ok' | 'revoked' | 'submitted' | 'expired' for an invite row.
create function public.onboarding_invite_state(inv public.onboarding_invites) returns text
language sql stable set search_path = '' as $$
  select case
    when inv.status = 'revoked' then 'revoked'
    when inv.status = 'submitted' then 'submitted'
    when inv.status = 'expired' or inv.expires_at <= now() then 'expired'
    else 'ok'
  end
$$;

-- Called by the form once it runs in a browser (not on GET, so link previews don't count as opened).
create function public.onboarding_open(p_token_hash text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  inv public.onboarding_invites;
  state text;
begin
  select * into inv from public.onboarding_invites where token_hash = p_token_hash for update;
  if not found then return 'not_found'; end if;
  state := public.onboarding_invite_state(inv);
  if state <> 'ok' then return state; end if;
  update public.onboarding_invites
     set opened_at = coalesce(opened_at, now()),
         status = case when status = 'sent' then 'opened' else status end,
         last_activity_at = now()
   where id = inv.id;
  return 'ok';
end $$;

-- Autosave: replaces the answers (the server validated them against the form schema).
create function public.onboarding_save(
  p_token_hash text, p_answers jsonb, p_progress smallint, p_max_per_minute integer default 90
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  inv public.onboarding_invites;
  resp public.onboarding_responses;
  state text;
begin
  select * into inv from public.onboarding_invites where token_hash = p_token_hash for update;
  if not found then return 'not_found'; end if;
  state := public.onboarding_invite_state(inv);
  if state <> 'ok' then return state; end if;

  insert into public.onboarding_responses (invite_id) values (inv.id) on conflict (invite_id) do nothing;
  select * into resp from public.onboarding_responses where invite_id = inv.id for update;
  if resp.save_window_start <= now() - interval '1 minute' then
    resp.save_window_start := now();
    resp.save_count := 0;
  end if;
  if resp.save_count >= p_max_per_minute then return 'rate_limited'; end if;

  update public.onboarding_responses
     set answers = p_answers,
         progress = p_progress,
         updated_at = now(),
         save_window_start = resp.save_window_start,
         save_count = resp.save_count + 1
   where id = resp.id;
  update public.onboarding_invites
     set status = case when status in ('sent', 'opened') then 'in_progress' else status end,
         opened_at = coalesce(opened_at, now()),
         last_activity_at = now()
   where id = inv.id;
  return 'ok';
end $$;

-- Final submit: stores the answers once more and locks the invite.
create function public.onboarding_submit(p_token_hash text, p_answers jsonb, p_progress smallint) returns text
language plpgsql security definer set search_path = '' as $$
declare
  inv public.onboarding_invites;
  state text;
begin
  select * into inv from public.onboarding_invites where token_hash = p_token_hash for update;
  if not found then return 'not_found'; end if;
  state := public.onboarding_invite_state(inv);
  if state <> 'ok' then return state; end if;

  insert into public.onboarding_responses (invite_id, answers, progress, submitted_at)
  values (inv.id, p_answers, p_progress, now())
  on conflict (invite_id) do update
     set answers = excluded.answers, progress = excluded.progress, updated_at = now(), submitted_at = now();
  update public.onboarding_invites
     set status = 'submitted', submitted_at = now(), opened_at = coalesce(opened_at, now()), last_activity_at = now()
   where id = inv.id;
  return 'ok';
end $$;

revoke all on function public.onboarding_invite_state(public.onboarding_invites) from public, anon, authenticated;
revoke all on function public.onboarding_open(text) from public, anon, authenticated;
revoke all on function public.onboarding_save(text, jsonb, smallint, integer) from public, anon, authenticated;
revoke all on function public.onboarding_submit(text, jsonb, smallint) from public, anon, authenticated;
grant execute on function public.onboarding_invite_state(public.onboarding_invites) to service_role;
grant execute on function public.onboarding_open(text) to service_role;
grant execute on function public.onboarding_save(text, jsonb, smallint, integer) to service_role;
grant execute on function public.onboarding_submit(text, jsonb, smallint) to service_role;
