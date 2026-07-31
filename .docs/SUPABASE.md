# Supabase in Bitcode

**Role:** primary application database, auth session store, storage buckets, and
local-dev Postgres for the commercial monorepo. Living product code talks to
Supabase through package adapters—not ad-hoc SDK sprawl.

Related: [`DEPLOYMENT.md`](./DEPLOYMENT.md), [`.docs/BITCODE_EXCHANGE_DATABASE.md`](./BITCODE_EXCHANGE_DATABASE.md),
[`supabase/DATA_HEALTH.md`](../supabase/DATA_HEALTH.md).

---

## 1. What Supabase owns

| Concern | Where | Notes |
| --- | --- | --- |
| Schema / migrations | `supabase/migrations/` | Active SQL only (legacy `migrations-archive/` removed) |
| Local stack | `supabase/config.toml`, `supabase start` | Used by `apps/uapi` `dev:local` / Playwright mocks |
| Seed | `supabase/seed.sql` | Local/dev bootstrap |
| Queries / templates | `supabase/queries/`, `supabase/templates/` | Operator SQL, email templates |
| Data-health docs | `supabase/DATA_HEALTH.md` | Ops posture for DB health |

Product routes and packages must not invent parallel databases for commercial
state. Supabase Postgres is the ordinary persistence plane for uapi, auth,
pipeline run projection, connections, and related tables.

---

## 2. Package surface (`@bitcode/supabase`)

**Package:** `packages/supabase`  
**Public name:** `@bitcode/supabase`

| Export / path | Purpose |
| --- | --- |
| `@bitcode/supabase` | Browser/public client + admin client (`supabase`, `supabaseAdmin`) |
| `@bitcode/supabase/ssr/server` | Next.js server components client |
| `@bitcode/supabase/ssr/client` | Browser SSR-aware client |
| `@bitcode/supabase/ssr/middleware` | Session refresh middleware helpers |
| `@bitcode/supabase/ssr/admin` | Elevated server admin helpers |
| DataPack evidence helpers | Typed DataPack evidence / Evidence Document access |
| Streams / MCP-oriented tools | Query/insert helpers used by tool surfaces |

Dependencies: `@supabase/supabase-js`, `@supabase/ssr`.

### Typical usage

```ts
import { supabase, supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

// Server route / action
const sb = await createClient();
const { data: { user } } = await sb.auth.getUser();

// Privileged server (service role) — never ship to browser
await supabaseAdmin.from('…').select('…');
```

---

## 3. Consumers (by area)

### 3.1 Auth and sessions

| Location | Usage |
| --- | --- |
| `packages/auth` | `createClient` / `supabaseAdmin` for user lookup; `supabase-auth-redirect` builds `/tps/supabase/callback` |
| `apps/uapi/middleware/authentication.ts` | SSR `createClient` + `supabaseAdmin` for request auth |
| `apps/uapi/app/tps/*` | Wallet authorize returns codes to Supabase; callback routes |

### 3.2 ORM / typed tables

| Location | Usage |
| --- | --- |
| `packages/orm` | Data-access models over Postgres; `generate-types` via `supabase gen types typescript --local` |
| `packages/orm` scripts | `data-health`, schema-type refresh against local or configured DB |

### 3.3 Storage (artifacts)

| Location | Usage |
| --- | --- |
| `packages/generic-artifacts/supabase-provider` | Supabase Storage `ArtifactStorage` implementation |
| `packages/generic-artifacts/compose` | Provider order: **AWS S3 → Supabase → Vercel Blob** (first configured wins) |
| Migrations | e.g. `20260705190000_asset_pack_artifacts_bucket.sql` for DataPack artifact buckets |

### 3.4 Email

| Location | Usage |
| --- | --- |
| `packages/email/supabase` | Transactional / product email via Supabase-backed delivery |
| `packages/notifications` | Depends on `@bitcode/supabase` for notification persistence/delivery glue |
| `apps/uapi/app/api/waitlist` | Renders `supabase/templates/waitlist.html` → Edge **`resend`** → Resend |
| `apps/uapi/lib/render-supabase-email-template.ts` | Load + `{{var}}` interpolate app-mail HTML |
| `supabase/functions/resend` | Thin Resend client: raw `{ subject, html, kind }` only |
| `supabase/templates/waitlist.html` | Waitlist SSOT (app-mail vars — not Auth Go templates) |
| `supabase/templates/confirm.html` | Auth Confirm signup only (not waitlist) |

### 3.4.1 Resend via Edge Function (waitlist + product mail)

**Option A (current):** app renders HTML from `supabase/templates/`, Edge only delivers.

1. Insert `marketing_waitlist`.
2. `renderSupabaseEmailTemplate('waitlist', vars)`.
3. `POST /functions/v1/resend` with service role: `{ kind: "waitlist", to, subject, html }`.

| Secret / env | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | **Edge Function secrets** (required) | Resend API key `re_…` |
| `RESEND_WAITLIST_FROM_EMAIL` | Edge secrets | **Waitlist-only** From (`waitlist@bitcode.exchange`) when `kind=waitlist` |
| `RESEND_FROM_EMAIL` | Edge secrets | **General/product** From (`noreply@…`) when `kind` omitted/general |
| `RESEND_FROM_NAME` | Edge secrets | Display name (`Bitcode`) |
| `RESEND_*` | `apps/uapi/.env.local` | Local reference / future app-side API |
| `EMAIL_SMTP_URL` | uapi env optional | Nodemailer for `@bitcode/notifications` |
| `BITCODE_RESEND_FUNCTION_URL` | uapi env optional | Override function URL |

Do not put `waitlist@` in `RESEND_FROM_EMAIL` — that key is general only.

**Deploy**

```bash
supabase secrets set RESEND_API_KEY=re_... \
  RESEND_WAITLIST_FROM_EMAIL=waitlist@bitcode.exchange \
  RESEND_FROM_EMAIL=noreply@bitcode.exchange \
  RESEND_FROM_NAME=Bitcode
supabase functions deploy resend
```

**Invoke body (after app render)**

```json
{
  "kind": "waitlist",
  "to": "you@company.com",
  "subject": "Welcome to the Bitcode waitlist",
  "html": "<!DOCTYPE html>…"
}
```

**Test:** `pnpm -C apps/uapi dev:remote` → Request access → inbox / Resend dashboard.

**Auth email** (confirm / recovery) is separate — Dashboard Auth templates. Waitlist does not use that path.

Guide: [Send emails with Supabase Edge Functions](https://resend.com/docs/send-with-supabase-edge-functions).

### 3.5 VCS / connections / templates

| Location | Usage |
| --- | --- |
| `packages/generic-vcs/*`, `packages/vcs-generics` | Persist VCS connection/session rows via Supabase |
| `packages/templates-generics` | Template storage/query via Supabase client |
| `packages/generic-vcs/git` | Workspace dependency on `@bitcode/supabase` |

### 3.6 Product app (`apps/uapi`)

| Location | Usage |
| --- | --- |
| `next.config.mjs` | Forwards `NEXT_PUBLIC_SUPABASE_*` and server `SUPABASE_*` into the Next env |
| `app/api/waitlist/route.ts` | Waitlist store + Edge Function `resend` trigger |
| `lib/depository-settled-demand.ts` | Admin client reads settled-demand projections |
| `scripts/sync-asset-pack-evidence-embeddings.ts` | Admin client fetch/upsert for evidence embeddings |
| `data/mcpDefinitions.ts` | Optional **mcp-supabase** external MCP definition (user-supplied URL/key) |
| `package.json` scripts | `dev:local` runs `supabase start`; e2e scripts pin local URL/keys |

### 3.7 Rehearsal / gate tooling

Scripts under `scripts/rehearse-*` and some `check-v*` gates accept or inject:

- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / publishable variants
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ADMIN_KEY`
- Occasionally `SUPABASE_DB_URL` for Postgres-direct health/readback

Source-safe rehearsals must never serialize real secret values into proof artifacts.

---

## 4. Environment variables

| Variable | Client? | Role |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Public URL | Project REST/API host |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` | Public | Anon/publishable key for browser/SSR user scope |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | Public | Alternate publishable key name |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` / `SUPABASE_ADMIN_KEY` | **Server only** | Admin/service role |
| `SUPABASE_DB_URL` | Server/ops | Direct Postgres URL for typegen / health |

**Rules:**

- Never put service-role keys in `NEXT_PUBLIC_*` or client bundles.
- Prefer `@bitcode/supabase` factories so key selection and SSR cookies stay consistent.
- Local e2e often uses `http://127.0.0.1:54321` with mock keys.

---

## 5. Migrations (living)

Active family under `supabase/migrations/` includes (non-exhaustive):

- `001_v26_production.sql`, `002_v27_btd_crypto_registry.sql`
- Pipeline run / RLS enablement (`20260514*`, `20260515*`)
- Deposit/read data contracts (`20260515143000_v28_*`)
- DataPack artifacts bucket (`20260705190000_*`)

Historical `supabase/migrations-archive/` was removed with the legacy cleanup;
do not reintroduce archived trees.

---

## 6. What Supabase is **not**

- Not the Bitcoin fee rail or BTC wallet authority.
- Not the Vercel Sandbox pipeline host (that is Vercel infrastructure; see `VERCEL.md`).
- Not the on-chain ERC1155 settlement contract (that is Ethereum / dual TS mirror; see `ETHEREUM.md`).
- Not a place for protected DataPack source before settlement—use disclosure/storage law from SPEC.

---

## 7. Operational commands (common)

```bash
# Local Supabase (from apps/uapi or with CLI on PATH)
pnpm -C apps/uapi run dev:local   # starts supabase + next
pnpm -C apps/uapi run dev:stop

# Types from local DB (via packages/orm scripts)
pnpm -C packages/orm run generate-types
pnpm -C packages/orm run data-health
```

---

## 8. Traceability checklist

When adding Supabase usage:

1. Prefer `@bitcode/supabase` (or a domain package that already wraps it).
2. Add migrations under `supabase/migrations/` with RLS considered.
3. Document new env keys here and in deploy docs.
4. Keep secrets out of proofs, logs, and client bundles.
5. Update `packages/orm` models/types when schema changes.
