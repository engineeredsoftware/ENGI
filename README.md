# Bitcode

Bitcode commoditizes technical knowledge as **AssetPacks**: source-safe, measured
supply that depositors put into the Depository and readers settle for on
BTC-testnet (testnet value only; production-like protocol behavior).

This repository is the commercial product tree. Implementation is **unversioned
in paths** — always the single current Bitcode system under the active canon.

---

## Canon (read this first)

| File | Role |
|---|---|
| `BITCODE_SPEC.txt` | **Active** pointer on `main` (currently **V47**) |
| `BITCODE_SPEC_V47.md` (+ DELTA / NOTES / PARITY / PROVEN) | Promoted commercial website testnet launch canon |
| `BITCODE_SPEC_V48.md` (+ family) | **Draft** full-stack rebuild-alone SPEC for V48 work |
| `BITCODE_SPEC_V48_NOTES.md` | V48 architecture decisions + Gate 3 depositing parity matrix |
| `BITCODE_V48_QA.md` | Interactive QA ledger and Gate 3 runbook |
| `AGENTS.md` | Agent/contributor engineering rules (gates, commits, Bezalel craft) |
| `BITCODE_SPECIFYING.md` | Metaspec: Complete Implementation Derivability |

**V48 Gate 3 (Deposit systems MVP)** is specified for rebuild from
`BITCODE_SPEC_V48.md` alone (§G3-1…G3-15). Do not treat superseded version
files as live law when implementing V48 gates.

---

## Product routes (current)

| Route | Purpose |
|---|---|
| `/deposits` | **Deposit MVP** — connect source, synthesize measured AssetPack options (SynthesizeAssetPacks SDIVF), review, admit to Depository |
| `/reads` | Reading path (Need → Finding Fits → settle → delivery); later V48 gates |
| `/packs` | Master-detail PackActivity / ledgerized history |
| Auxillaries | Wallet identity, GitHub, organization panes (over product routes) |

Legacy `/terminal` and singular `/deposit` / `/read` are compatibility or
migrating surfaces — prefer `/deposits`, `/reads`, `/packs`.

---

## V48 Gate 3 — Deposit systems MVP (what just closed)

Branch: `v48/gate-3-synthesis-pipeline-correctness` → PR into `version/v48`.

| Area | Law |
|---|---|
| Pipeline | `SynthesizeAssetPacks` SDIVF, deposit mode, **maxIterations = 1** |
| Default LLM | xAI **`grok-build-0.1`** when `XAI_API_KEY` set |
| LLM timeout | `BITCODE_LLM_CALL_TIMEOUT_MS` default **180000** |
| Inputs | Obfuscations (empty → skip Setup LLM), Forced Inclusions / Exclusions |
| Demand | Settled Depository search or **Unestimatable** (no hardcoded %) |
| Hosts | Inline (default) or Vercel Sandbox (`persistent: false` deposit boxes) |
| UI | `/deposits` master-detail, option cards, telemetry, cancel, authority/earnings |

Rebuild index: `BITCODE_SPEC_V48.md` §G3-14.

---

## Local development

### Prerequisites

- Node **≥ 21**, **pnpm** (see root `packageManager`)
- Docker (for local Supabase)
- GitHub App + wallet setup for real deposit runs (see `BITCODE_V48_QA.md`)

### Install

```bash
pnpm install
```

### Environment

```bash
# App (Next.js) — copy/adapt; never commit secrets
cp uapi/.env.example uapi/.env.local   # if present; else create from team secrets

# Minimum for deposit synthesis (live inference)
# BITCODE_ASSET_PACK_REAL_INFERENCE=true
# BITCODE_LLM_PROVIDER=xai
# BITCODE_LLM_MODEL=grok-build-0.1
# BITCODE_LLM_CALL_TIMEOUT_MS=180000
# XAI_API_KEY=...
# Supabase URL + keys (local or remote)
# GitHub App credentials for repo selection
```

### Database (local Supabase)

```bash
# From repo root or uapi — follow team Supabase layout
cd uapi && pnpm exec supabase start   # if configured
# Apply migrations under supabase/migrations (executions, execution_events, …)
```

### App server

```bash
cd uapi
pnpm dev:remote    # Next on 127.0.0.1
# or: pnpm dev:local  # supabase start + next (if available)
```

Open `http://127.0.0.1:3000/deposits` after wallet + GitHub connect.

### Deposit smoke (recommended)

1. Sign in with wallet (testnet).
2. Connect GitHub; pick a **small** repo **or** set **Forced Inclusions** on a monorepo.
3. Leave Obfuscations empty or set withhold text; set Forced Exclusions for secrets.
4. **Synthesize** — watch SDIVF telemetry; options appear on completion.
5. Demand panel may show **Unestimatable** until settled Depository supply exists (honest).
6. Optional: **Cancel run** mid-flight to verify cooperative cancel.

Full QA checklist: `BITCODE_V48_QA.md` → Gate 3 depositing runbook.

---

## Monorepo layout (contributor map)

| Path | Role |
|---|---|
| `uapi/` | Next.js app — `/deposits`, `/reads`, `/packs`, APIs |
| `packages/pipelines/asset-pack/` | SynthesizeAssetPacks SDIVF, deposit agents, policy, demand estimate |
| `packages/pipeline-hosts/` | InlineHost, VercelSandbox, harness |
| `packages/agent-generics/` | PTRR, failsafes, Thinkings, LLM call timeout |
| `packages/generic-llms/` | xAI/Grok and other LLM providers |
| `packages/execution-generics/` | Execution tree, streaming adapters |
| `packages/pipelines-generics/` | Phase runners, `sourceSafeStreamEvent` |
| `supabase/migrations/` | `executions`, `execution_events`, RLS |
| `scripts/` | Spec quality, canon checks, promotion |
| `_legacy/`, `protocol-demonstration/` | **Not** active product canon for V48 gates |

---

## Contributor workflow (V48)

1. Read `AGENTS.md` and `BITCODE_SPEC_V48.md` for the gate you touch.
2. Branch from `version/v48`: `v48/gate-N-<topic>`.
3. Commit titles: `V48 Gate N (specification-only|implementation-only|specification-implementation): …`
4. Do not push straight to `main`. Gate PR → `version/v48`; version PR → `main` only at promotion.
5. Keep CI green: Gate Quality, lint/typecheck, unit tests, Spec Basics.

```bash
# Spec quality (active V47 + draft V48)
pnpm exec node scripts/run-bitcode-spec-quality.mjs

# Focused package tests (examples)
pnpm --filter @bitcode/pipeline-asset-pack test
cd uapi && pnpm exec jest --testPathPattern='deposit'
```

---

## Source-safety (non-negotiable)

Never product-expose: protected/raw source, unpaid AssetPack source, raw prompts,
raw provider responses, credentials, wallet private material, private settlement
payloads. Telemetry goes through `sourceSafeStreamEvent`. Demand that cannot be
grounded is **Unestimatable**, not invented.

---

## What not to do

- Do not version source paths (`api/v1`, `v48-*` product modules) unless directed.
- Do not implement from `protocol-demonstration/` or `_legacy/` as product law.
- Do not open value-bearing mainnet settlement in V48 draft work.
- Do not expand Gate 3 into full Reading settlement product (later gates).

---

## Promoted V47 verification (active pointer on `main`)

Active canon on `main` is **V47**. Gate-quality CI still validates V47 promotion
surfaces. Documented entrypoints:

```bash
# V47 Gate 10 promotion readiness (commercial website testnet launch close)
pnpm run check:v47-gate10
# or: node scripts/check-v47-gate10-promotion-readiness.mjs --promotion-mode --skip-branch-check

# V47 canon promotion workflow (CI): .github/workflows/v47-canon-promotion.yml
```

Related: `generate:v47-promotion-readiness`, `.bitcode/v47-promotion-readiness-report.json`,
`BITCODE_SPEC_V47_PROVEN.md`. Draft work after V47 uses **V48** (`BITCODE_SPEC_V48.md`).

## Helpful links

- Spec family (draft): `BITCODE_SPEC_V48.md`
- Spec family (active): `BITCODE_SPEC_V47.md`
- QA: `BITCODE_V48_QA.md`
- Agent rules: `AGENTS.md`
- Specifying standard: `BITCODE_SPECIFYING.md`
- Internal architecture notes: `internal-docs/` (supporting, not stronger than SPEC)
