# Bitcode Supabase Data Health

Supabase/PostgreSQL is Bitcode's secondary data realm: it stores authenticated
profile, wallet, GitHub, BTD registry, telemetry, and reconciliation
projections. It is not the source of cryptographic finality. Ledgerized journals,
anchors, signed wallet proofs, and canonical receipts remain authoritative.

The tools in `packages/orm/src/data-health` make that boundary inspectable.
They are designed for three uses:

- Daily staging/production checks against live Supabase databases.
- CI/CD checks for schema, ORM, generated type, and projection parity.
- Local QA validation while manually testing onboarding, Deposit/Read, Fit
  admission, synthetic measurement, AssetPack minting, and ledger anchoring.

## Connection

The runner reads the first available connection string:

```bash
SUPABASE_DB_URL
SUPABASE_DATABASE_URL
DATABASE_URL
POSTGRES_URL
```

Use a Supabase Postgres connection string with a role allowed to read
`information_schema`, `pg_catalog`, `supabase_migrations`, and the public
projection tables. Do not paste this string into source files.

## Commands

Run the daily live check:

```bash
SUPABASE_DB_URL='<postgres-connection-string>' pnpm db:data-health:daily
```

Run the CI suite:

```bash
SUPABASE_DB_URL='<postgres-connection-string>' pnpm db:data-health:ci
```

Run the QA suite and write JSON:

```bash
SUPABASE_DB_URL='<postgres-connection-string>' \
  pnpm -C packages/orm run data-health -- \
  --suite qa \
  --fail-on warning \
  --format json \
  --output ../../.tmp/data-health/qa-report.json
```

List checks without connecting:

```bash
pnpm -C packages/orm run data-health -- --suite all --list
```

Run contract and optional live E2E tests:

```bash
pnpm -C packages/orm run test:data-health

BITCODE_RUN_DB_HEALTH_E2E=true \
BITCODE_RUN_SCHEMA_TYPES_E2E=true \
SUPABASE_DB_URL='<postgres-connection-string>' \
pnpm -C packages/orm run test:data-health:live
```

Check generated schema type coverage:

```bash
pnpm db:schema-types:check
```

If this reports missing generated tables, refresh Supabase types from the
intended project after migrations have been applied:

```bash
supabase gen types typescript --project-id '<project-ref>' --schema public > .tmp/database.types.ts
pnpm -C packages/orm run schema-types:refresh -- --input ../../.tmp/database.types.ts
pnpm db:schema-types:check
```

## Suites

| Suite | Purpose |
| --- | --- |
| `schema` | Required tables, required columns, extensions, migrations, RLS, provider-scope readiness. |
| `identity` | Custom Bitcoin Auth projection, wallet profile/connection parity, signed Bitcoin wallet row shape, GitHub installation row shape, repository cache addressability. |
| `journal` | BTD journal replay order and AssetPack mint journal coverage. |
| `ledger` | BTD supply, measuremint receipts, AssetPack ranges, cells, anchors, BTC fees, revenue conservation, reconciliation repairs. |
| `operational` | Recent critical crypto telemetry and application error rows. |
| `ci` | Schema + identity + journal + ledger checks. |
| `daily` | CI checks plus operational checks. |
| `qa` | Daily checks, normally with `--fail-on warning` during manual QA. |

## Saved Supabase Query Names

These files are intended to be copied into the Supabase SQL editor as named,
reusable checks:

- `Bitcode Data Health - Projection Overview`:
  `supabase/queries/data_health_projection_overview.sql`
- `Bitcode Data Health - Wallet and GitHub Readiness`:
  `supabase/queries/data_health_wallet_github_readiness.sql`
- `Bitcode Data Health - BTD Ledger Reconciliation`:
  `supabase/queries/data_health_btd_ledger_reconciliation.sql`
- `v28_qa_staging_hard_reset`:
  `supabase/queries/v28_qa_staging_hard_reset.sql` is a destructive,
  staging-only reset for early QA. It preserves schema/migrations, deletes
  Supabase Auth users, truncates Bitcode-owned public projection data, and
  reseeds `public.btd_supply_state`.
- `v28_qa_terminal_01_prerequisites_wallet_github_repo`:
  `supabase/queries/v28_qa_terminal_01_prerequisites_wallet_github_repo.sql`
  confirms Supabase Auth, wallet binding, GitHub installation, and repository
  inventory before Deposit/Read QA.
- `v28_qa_01b_backfill_profile_wallet_projection_from_connection`:
  `supabase/queries/v28_qa_01b_backfill_profile_wallet_projection_from_connection.sql`
  is a targeted staging repair that copies non-secret wallet metadata from the
  active wallet `user_connections` row back into the profile wallet binding
  projection when a later profile write has dropped network/auth/payment fields.
- `v28_qa_terminal_02_activity_after_write`:
  `supabase/queries/v28_qa_terminal_02_activity_after_write.sql` checks
  product activity, execution events, pipeline rows, stream logs, and errors
  after each product write action.
- `v28_qa_terminal_04_deposit_repository_alignment`:
  `supabase/queries/v28_qa_terminal_04_deposit_repository_alignment.sql` confirms
  the Deposit source is the connected GitHub repository inventory and
  flags any live-lane leakage from specifying machine `frontier/*` data.
- `v28_qa_terminal_08_depository_evidence_after_deposit`:
  `supabase/queries/v28_qa_terminal_08_depository_evidence_after_deposit.sql`
  checks Gate 9 deposited-source evidence after a Deposit: candidate
  asset id, proof root, measurement root, reconciliation readback root,
  lexical/vector document roots, aggregate depository search root, depositor
  wallet boundary, and vector embedding policy posture.
- `v28_qa_terminal_03_btd_ledger_after_terminal`:
  `supabase/queries/v28_qa_terminal_03_btd_ledger_after_terminal.sql` checks
  BTD measuremint, ranges, BTC fee receipts, BTD journal, ledger anchors,
  reconciliation repairs, and crypto telemetry after product closure actions.

The script runner is authoritative for pass/fail automation. The saved queries
are for operator inspection and QA narration.

## Failure Policy

Critical failures mean the projection is not promotion-safe. Do not proceed to
staging or production promotion until the drift is repaired or explicitly
deferred into the active specification notes with an owner and follow-up gate.

Warnings are allowed during exploratory QA, but daily production checks should
still page or create an operator task when warnings persist.
