-- Thin-server account + billing mirror (PRD §11 `User`).
-- Account fields the user controls; billing fields the Stripe webhook controls.
create table public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  email                  text,
  name                   text,
  locale                 text not null default 'en',
  currency               text not null default 'EUR',
  -- Billing mirror (system of record is Stripe; reconciled via webhook).
  plan                   public.plan_tier not null default 'free',
  sub_status             public.sub_status not null default 'none',
  trial_ends_at          timestamptz,
  -- Per-user feature entitlement overrides toggled from the admin panel (§10.3).
  entitlements           jsonb not null default '{}'::jsonb,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  suspended              boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index profiles_stripe_customer_idx on public.profiles (stripe_customer_id);
create index profiles_plan_idx on public.profiles (plan);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Users read their own row; admins read everyone (account/billing only).
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Users may update only their own row. Billing/plan/entitlement columns are
-- protected by a trigger below so a user cannot self-upgrade.
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Admin writers manage lifecycle/billing/entitlements (§10.3).
create policy profiles_admin_write on public.profiles
  for update using (public.is_admin_writer()) with check (public.is_admin_writer());

-- Guard: non-admins cannot change billing-controlled columns on their own row.
create or replace function public.guard_profile_billing_columns()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_admin_writer() then
    return new; -- admins (and the service role, which bypasses RLS) may change anything
  end if;
  if new.plan is distinct from old.plan
     or new.sub_status is distinct from old.sub_status
     or new.trial_ends_at is distinct from old.trial_ends_at
     or new.entitlements is distinct from old.entitlements
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id
     or new.suspended is distinct from old.suspended then
    raise exception 'billing/entitlement columns are not user-editable';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_billing
  before update on public.profiles
  for each row execute function public.guard_profile_billing_columns();
