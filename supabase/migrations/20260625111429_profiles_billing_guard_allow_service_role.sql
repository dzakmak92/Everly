-- The Stripe webhook reconciles billing columns using the service role, which
-- bypasses RLS but still fires triggers. Allow service_role (and admin writers)
-- through the guard; everyone else is blocked from editing billing columns.
create or replace function public.guard_profile_billing_columns()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if current_user = 'service_role' or public.is_admin_writer() then
    return new;
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
