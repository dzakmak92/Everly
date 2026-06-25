-- Pin search_path on the remaining trigger functions.
alter function public.set_updated_at() set search_path = '';
alter function public.block_audit_mutation() set search_path = '';

-- Trigger functions must never be callable as RPC endpoints. Triggers still fire
-- (they run in the table-owner context), so revoking EXECUTE is safe.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.block_audit_mutation() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_billing_columns() from public, anon, authenticated;

-- RBAC helpers are used inside RLS policies, so `authenticated` must keep EXECUTE
-- (they only ever reveal the *caller's own* admin status). anon never needs them.
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_superadmin() from anon;
revoke execute on function public.is_admin_writer() from anon;
revoke execute on function public.admin_role_of() from anon;
