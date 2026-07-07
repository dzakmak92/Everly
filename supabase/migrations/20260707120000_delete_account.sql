-- Self-service account deletion (PRD §11 — user controls their own account).
-- A signed-in user may permanently delete their own auth account; the
-- `public.profiles` row cascades away via its FK to `auth.users`. On-device
-- data (children, health, activity) never touches the server and is wiped
-- client-side. No service-role key is exposed to the client.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  -- Cascades to public.profiles (and any other tables FK'd to auth.users).
  delete from auth.users where id = uid;
end;
$$;

-- Callable only by a signed-in user, and it only ever deletes the *caller*.
revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
