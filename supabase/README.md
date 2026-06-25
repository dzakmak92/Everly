# Everly — thin server (Supabase)

Project: **FamilyFlow** · ref `ertsbomehtfotflbdndm` · region `eu-west-1`.

This is the **entire** server surface. Per the PRD (§3 / §11 / §14) Everly is
**local-first**: all child / maternal / health data lives on the device, and the
only things that ever reach a server are:

| Concern | Table(s) | Notes |
|---|---|---|
| Accounts | `profiles` (+ Supabase `auth.users`) | Auto-provisioned on signup via `handle_new_user`. |
| Billing mirror | `profiles.plan/sub_status/trial_ends_at/entitlements/stripe_*` | Stripe is the system of record; reconciled by the webhook (service role). User-editable columns are locked by a trigger. |
| Live config | `config` | Public read (bootstrap), superadmin write. Seeded with pricing/trial/i18n. |
| Feature flags | `feature_flags` | Public read, superadmin write. Rollout `{percent,plans,regions,minVersion}`, `kill_switch`, `locked`. |
| Audit | `audit_log` | Append-only (UPDATE/DELETE hard-blocked by trigger). Admin read/insert. |
| Admin RBAC | `admin_accounts` | Separate admin logins: `superadmin` / `admin` / `support` (PRD §10.6). |
| E2E relay | `relay_records` | **Ciphertext only** (XChaCha20-Poly1305) + routing. Owner/recipients access; admins deliberately excluded. The server cannot read it. |

**Never stored here:** child profiles/logs, health records, maternal/postpartum/
fertility data, calendars, routines, timelines. Those are on-device only.

## RLS summary
- `config`, `feature_flags` — public `SELECT` (anon + authenticated); writes superadmin-only.
- `profiles` — owner reads/updates own row; admins read all + writers update billing; billing columns guarded.
- `audit_log` — admin read/insert only; no update/delete for anyone.
- `relay_records` — owner full control; recipients read + sync-update; no admin access.
- `admin_accounts` — admins read; superadmin writes.

## Applying migrations
Migrations live in `supabase/migrations/` and were applied in filename order.
With the Supabase CLI:

```bash
supabase link --project-ref ertsbomehtfotflbdndm
supabase db push
```

Regenerate client types after schema changes into `src/lib/supabase/types.ts`:

```bash
supabase gen types typescript --project-id ertsbomehtfotflbdndm > src/lib/supabase/types.ts
```

## Client wiring
The app connects via `src/lib/supabase/` (client, auth, config/flags bootstrap,
and `<SupabaseProvider>` mounted in `app/_layout.tsx`). Connection comes from
`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`),
falling back to the public project values. The anon/publishable key is safe to
ship — RLS enforces all access.

## Not yet provisioned
- **Stripe** account is empty (no products/prices). Pricing lives in `config.pricing`
  but the matching Stripe Products/Prices + webhook (`/api/webhooks/stripe`) and the
  service-role reconciler still need to be created.
- **Admin accounts** — no rows in `admin_accounts` yet; seed a superadmin to use the
  operator console.
