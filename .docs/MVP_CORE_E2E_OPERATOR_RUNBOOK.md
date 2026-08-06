# MVP core E2E — operator runbook (live lanes)

**Audience:** core operators validating packages, APIs, DB, pipeline hosts,
and settle contracts on a machine (not browser chrome / wallet UX).

**Companion:** payload handoff for crypto/UX agents →
[`.docs/MVP_CORE_E2E_HANDOFF.md`](./MVP_CORE_E2E_HANDOFF.md).

## Lanes at a glance

| Lane | What it proves | Required every commit? |
| --- | --- | --- |
| **L0** `pnpm run ci:local` | Living monorepo green (lint/tsc/build/Jest bar) | **Yes** before shared commit |
| **CI-fast MVP** `pnpm run test:mvp-core-e2e` | L1–L5 contracts + L2 SDIVF mocks + L3 pure units | Recommended for commercial core diffs |
| **L2 live LLM** | Real deposit/read SDIVF with provider keys | **Opt-in** operator only |
| **L3 live Supabase** | Index / search against local or CI DB | **Opt-in** (service role + migrations) |

CI-fast never requires live LLM keys or a running Supabase. Live lanes do not
replace `ci:local`.

## 1. CI-fast (default)

```bash
# Full core ladder (uapi L1/L3/L4/L5 + deposit/read SDIVF + domain L2/L3)
pnpm run test:mvp-core-e2e

# UAPI slice only
pnpm --filter bitcode-uapi run test:mvp-core-e2e

# Spine unit (L4/L5 fail modes)
pnpm --filter bitcode-uapi exec jest --config jest.config.cjs \
  --testPathPattern='mvp-core-e2e-spine'
```

Expect: all suites green. Spine `failMode` covers
`reject-admission`, `empty-needinesses-quote`, `empty-search-corpus`.

### L1 inventory (route contracts)

Locked by `apps/uapi/tests/api/mvp-core-e2e-l1-inventory.test.ts`. Highlights:

| ID | Surface |
| --- | --- |
| L1-D1 / D2 / D3 | Deposit synthesize, admit journal, demand-estimate |
| L1-R1 / R2 / R3 | Read synthesize, settle quote, settle rehydrate |
| L1-X1 / P1 | Packs activity source-safe; payout finalize owner-only |
| L1-S1 / S2 | Depository index route; hybrid search (package-level) |
| L1-HOST / V1 / A1 | Pipeline host, VCS, auth gates |

**L1-S2** stays package/lib coverage by design (ranking unit, not an HTTP route).

## 2. L2 live LLM (opt-in)

Prerequisites:

- Provider key (`XAI_API_KEY` default; or Anthropic/OpenAI if overridden)
- Optional: monorepo root `.env` / `apps/uapi/.env.local` loaded by host scripts
- Disk under `.tmp/` for workspaces and LLM debug ledgers

```bash
# Deposit — full local host path
pnpm --filter @bitcode/pipeline-hosts run qa:deposit:local

# Deposit — first-LLM / PCC debug marker
pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm

# Read — first-LLM debug
pnpm --filter @bitcode/pipeline-hosts run qa:read:debug-first-llm
# root alias for read:
pnpm run debug:read:first-llm
```

Useful env (see script headers under `packages/pipeline-hosts/src/dev/`):

| Env | Role |
| --- | --- |
| `BITCODE_ASSET_PACK_REAL_INFERENCE=1` | Allow live model calls |
| `BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` | Default xAI / grok-class |
| `BITCODE_DEPOSIT_REPO_URL` | Clone target for local deposit |
| `BITCODE_DEPOSIT_DISCOVERY_PROFILE=full` | Full three-agent Discovery (costly) |
| `BITCODE_LLM_CALL_DEBUG=1` | Wire ledger under `.tmp/llm-call-debug` |

**Bounded Discovery is product default** (codebase PTRR only; search/regurgitation
stubs). Use `full` only when validating depository-anchor quality.

### Pass criteria (live L2)

- Deposit finishes without host timeout; options include commercial NL + honesty
  status on absolutes (no volume-0 “estimated” as measured).
- Read path carries Need → needinesses `*-fit`; validation store is Need-first.
- No unpaid/protected source bodies in journaled activity projections.

## 3. L3 live Supabase (opt-in)

```bash
# Local stack (from monorepo conventions — see .docs/SUPABASE.md)
pnpm -C apps/uapi run dev:local   # starts supabase + Next when configured
```

Then exercise:

1. Admit a deposit option (or insert admitted execution fixture).
2. `POST /api/depository/index` with commercial NL + absolute fixtures.
3. Confirm `depository_search_documents` row (title, commercial fields, embed_text
   NL-first sections).
4. Read Discovery search ranks commercial NL above path-only noise (hybrid).

CI-fast already covers upsert shape + hybrid ranking + reembed dry-run without
a container. Live L3 is for regression after migration/RLS changes.

## 4. What this runbook does **not** own

- Browser chrome / marketing / waitlist
- Wallet connect, mainnet finality, BTC rail observation UI
- Gate 7 mock Playwright commercial MVP (UI joint; keep API mocks aligned with L1)

## 5. Failure triage

| Symptom | First check |
| --- | --- |
| L1 401/400 failures in CI-fast | Route suite mocks; session shape |
| Spine `search_path_noise_outranked_nl` | Field-weighted lexical / embed §nl |
| Live deposit host timeout | Discovery profile (prefer bounded); monorepo size |
| Live unestimatable demand % | Thin settled corpus — expected fail-closed |
| Payout finalize 404 | Owner mismatch or missing settle run |
| Unpaid source leak | `assertPackActivitySourceSafe` / scrub unpaid outputs |

## 6. Pre-commit reminder

```bash
pnpm run hooks:install   # once per clone
pnpm run ci:local        # full living bar before commit
```

Never commit red. Never push unless explicitly authorized for that turn.
