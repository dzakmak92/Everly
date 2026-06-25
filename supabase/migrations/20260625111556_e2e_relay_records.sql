-- Zero-knowledge shared-records relay (PRD §4). Stores ONLY opaque ciphertext +
-- minimal routing metadata (record id, recipients, version vector). The server
-- cannot read family data: encrypted_payload is XChaCha20-Poly1305 ciphertext;
-- record keys are X25519-wrapped to recipients and never stored in plaintext.
create table public.relay_records (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users (id) on delete cascade,
  recipients      uuid[] not null default '{}',          -- routing only
  version_vector  jsonb not null default '{}'::jsonb,     -- LWW conflict surfacing
  wrapped_keys    jsonb not null default '{}'::jsonb,     -- recipientId -> X25519-wrapped record key
  encrypted_payload text not null,                        -- base64 ciphertext; server cannot read
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index relay_records_owner_idx on public.relay_records (owner_id);
create index relay_records_recipients_idx on public.relay_records using gin (recipients);

create trigger relay_records_set_updated_at
  before update on public.relay_records
  for each row execute function public.set_updated_at();

alter table public.relay_records enable row level security;

-- Owner has full control; recipients can read and write back (sync) ciphertext.
-- NOTE: admins are deliberately NOT granted access — the control plane never
-- touches relay data, even as ciphertext (privacy posture, PRD §3/§21).
create policy relay_select on public.relay_records
  for select using (auth.uid() = owner_id or auth.uid() = any (recipients));

create policy relay_owner_all on public.relay_records
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy relay_recipient_update on public.relay_records
  for update using (auth.uid() = any (recipients))
  with check (auth.uid() = any (recipients));
