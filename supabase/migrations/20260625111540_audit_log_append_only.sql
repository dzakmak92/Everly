-- Immutable, append-only audit log (PRD §10.6). Both an ops tool and the GDPR
-- accountability record. No update/delete is ever permitted.
create table public.audit_log (
  id              bigint generated always as identity primary key,
  actor_admin_id  uuid references auth.users (id),
  actor_role      public.admin_role,
  action          text not null,
  subject_user_id uuid,
  before          jsonb,
  after           jsonb,
  ip              inet,
  at              timestamptz not null default now()
);

create index audit_log_subject_idx on public.audit_log (subject_user_id, at desc);
create index audit_log_actor_idx on public.audit_log (actor_admin_id, at desc);
create index audit_log_action_idx on public.audit_log (action, at desc);

alter table public.audit_log enable row level security;

-- Admins read; admins append. No update/delete policy exists -> denied for all.
create policy audit_log_admin_read on public.audit_log
  for select using (public.is_admin());
create policy audit_log_admin_insert on public.audit_log
  for insert with check (public.is_admin());

-- Belt-and-braces: hard-block UPDATE/DELETE even for the service role.
create or replace function public.block_audit_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

create trigger audit_log_no_update
  before update on public.audit_log
  for each row execute function public.block_audit_mutation();
create trigger audit_log_no_delete
  before delete on public.audit_log
  for each row execute function public.block_audit_mutation();
