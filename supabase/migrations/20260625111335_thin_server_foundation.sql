-- Everly thin-server foundation.
-- GOLDEN RULE (PRD §3/§11/§14): the server holds ONLY account, billing, config/flags,
-- audit, and the E2E relay (ciphertext only). NO child/maternal/health data ever.

-- ---- Enums -------------------------------------------------------------------
create type public.plan_tier as enum ('free', 'pro', 'family', 'lifetime');

-- Mirrors Stripe subscription statuses + a 'none' default for free users.
create type public.sub_status as enum (
  'none', 'trialing', 'active', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);

create type public.admin_role as enum ('superadmin', 'admin', 'support');

-- ---- Shared updated_at trigger ----------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- Admin accounts (separate from app users; PRD §10.6) ---------------------
-- Admins are distinct logins (auth.users rows present here). App users live in
-- public.profiles and are never "promoted" — these are separate accounts.
create table public.admin_accounts (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.admin_role not null default 'support',
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- RBAC helpers (security definer to avoid RLS recursion on admin_accounts).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_accounts a where a.id = auth.uid());
$$;

create or replace function public.admin_role_of()
returns public.admin_role language sql stable security definer set search_path = '' as $$
  select role from public.admin_accounts a where a.id = auth.uid();
$$;

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_accounts a
    where a.id = auth.uid() and a.role = 'superadmin'
  );
$$;

-- admin/superadmin can write user lifecycle/billing; support is read-only there.
create or replace function public.is_admin_writer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_accounts a
    where a.id = auth.uid() and a.role in ('superadmin', 'admin')
  );
$$;

alter table public.admin_accounts enable row level security;

create policy admin_accounts_select on public.admin_accounts
  for select using (public.is_admin());

create policy admin_accounts_superadmin_write on public.admin_accounts
  for all using (public.is_superadmin()) with check (public.is_superadmin());
