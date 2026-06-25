-- Live config store + feature flags (PRD §10.1). App reads these at bootstrap
-- (public, cached) and tolerates a stale cache -> safe defaults. Writes are
-- admin-only and audited from the application layer.

create table public.config (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

create table public.feature_flags (
  key         text primary key,
  enabled     boolean not null default false,
  -- rollout: { percent, plans[], regions[], minVersion }
  rollout     jsonb not null default '{"percent":0,"plans":[],"regions":[],"minVersion":null}'::jsonb,
  kill_switch boolean not null default false,
  -- locked flags (e.g. epds_mood_screening) cannot be disabled via the panel.
  locked      boolean not null default false,
  description text,
  updated_by  uuid references auth.users (id),
  updated_at  timestamptz not null default now()
);

create trigger config_set_updated_at
  before update on public.config
  for each row execute function public.set_updated_at();
create trigger feature_flags_set_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

alter table public.config enable row level security;
alter table public.feature_flags enable row level security;

-- Public bootstrap read (GET /api/config is public per §10.1).
create policy config_public_read on public.config
  for select to anon, authenticated using (true);
create policy feature_flags_public_read on public.feature_flags
  for select to anon, authenticated using (true);

-- Only superadmins edit config/flags (§10.6 RBAC matrix).
create policy config_superadmin_write on public.config
  for all using (public.is_superadmin()) with check (public.is_superadmin());
create policy feature_flags_superadmin_write on public.feature_flags
  for all using (public.is_superadmin()) with check (public.is_superadmin());

-- ---- Seed: pricing & runtime config (PRD §13) -------------------------------
insert into public.config (key, value) values
  ('trial_days', '14'::jsonb),
  ('pricing', '{
     "pro":      { "monthly": 399,  "yearly": 3999,  "currency": "EUR" },
     "family":   { "monthly": 499,  "yearly": 4999,  "currency": "EUR" },
     "lifetime": { "oneTime": 14999, "currency": "EUR" }
   }'::jsonb),
  ('enabled_languages', '["en","de","es","fr","tr","it"]'::jsonb),
  ('enabled_currencies', '["EUR","GBP","USD","JPY","CAD","AUD"]'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('announcement_banner', '{"enabled": false, "text": "", "level": "info"}'::jsonb);

-- ---- Seed: feature flags (PRD/build-spec §1.6, §20.7) ------------------------
insert into public.feature_flags (key, enabled, rollout, kill_switch, locked, description) values
  ('maternal_postpartum_module', true,
     '{"percent":40,"plans":[],"regions":[],"minVersion":null}'::jsonb, false, false,
     'Postpartum/maternal module — gradual rollout, kill-switchable.'),
  ('preconception_ttc', true,
     '{"percent":10,"plans":[],"regions":["EU-DE","EU-AT","GB"],"minVersion":null}'::jsonb, false, false,
     'Preconception/TTC beta (EN/DE).'),
  ('epds_mood_screening', true,
     '{"percent":100,"plans":[],"regions":[],"minVersion":null}'::jsonb, false, true,
     'EPDS screening — free duty-of-care safety feature; kill-switch locked.'),
  ('snap_cloud_parse', true,
     '{"percent":100,"plans":[],"regions":[],"minVersion":null}'::jsonb, false, false,
     'Optional PII-free cloud LLM parse for Snap-to-Schedule; kill-switchable.'),
  ('e2e_relay', true,
     '{"percent":100,"plans":["family","lifetime"],"regions":[],"minVersion":null}'::jsonb, false, false,
     'Multi-caregiver E2E relay sync (Family tier).');
