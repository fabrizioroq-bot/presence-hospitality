-- Test invites (demos, Playwright runs) live in the same database as real ones: flag them so the
-- dashboard hides them by default, submissions don't notify the team, and they can be bulk-deleted
-- (node scripts/intake-invite.mjs --delete-test).
alter table public.onboarding_invites add column is_test boolean not null default false;
create index onboarding_invites_real_idx on public.onboarding_invites (created_at desc) where not is_test;
