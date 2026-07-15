# Bitcode

Bitcode commoditizes technical knowledge as **AssetPacks**: source-safe, measured
supply that depositors put into the Depository and readers settle for on
**BTC-testnet** (testnet value only; production-like protocol behavior).

This repository is the commercial product tree. Source paths are **unversioned** —
always the single current Bitcode system under the active canon.

| | |
|---|---|
| **Active canon on `main`** | **V47** (`.specifications/BITCODE_SPEC.txt`) |
| **Draft target** | **V48** (`version/v48`, full-stack rebuild-alone SPEC) |
| **How to develop** | **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — setup, canon, env, hosts, GitHub App, testing |
| **How the tree is organized** | [`.docs/FAMILIARIZATION.md`](.docs/FAMILIARIZATION.md) |
| **Filesystem / component law** | [`.docs/BITCODE_SOURCE_LAYOUT.md`](.docs/BITCODE_SOURCE_LAYOUT.md) |
| **Agent / craft rules** | [`.docs/AGENTS.md`](.docs/AGENTS.md) (entry: [`Agents.md`](Agents.md)) |

---

## What Bitcode is

| Role | Surface |
| --- | --- |
| **Depositors** | Connect source → synthesize measured AssetPack options → review → admit to Depository |
| **Readers** | Connect target → Need → synthesize options → select → settle (BTC-testnet) → BTD rights → delivery |
| **Operators** | Packs activity, Auxillaries (wallet / GitHub / org), public docs |

**Product run language** is **Pipeline**. **BTD ledger language** is **journal**.
Product routes are `/packs`, `/deposits`, `/reads`, and `/docs`.

### Product routes

| Route | Purpose |
| --- | --- |
| `/deposits` | Deposit MVP — source, SDIVF synthesis, review, admission |
| `/reads` | Read MVP — Need, fit synthesis, select → SettleAssetPack |
| `/packs` | Master-detail PackActivity (admitted / settled packs) |
| Auxillaries | Wallet identity, GitHub App, organization panes |
| `/` · `/docs` | Marketing and public docs |

### Commercial pipelines

| Pipeline | Pattern | UI |
| --- | --- | --- |
| SynthesizeDepositAssetPacks | SDIVF | `/deposits` |
| SynthesizeReadAssetPacks | SDIVF (Need + fit needinesses) | `/reads` |
| SettleAssetPack | Simple (pay → mint BTD → rights → PR ship) | after `/reads` → `/packs` |

---

## Canon (read this first)

| File | Role |
| --- | --- |
| [`.specifications/BITCODE_SPEC.txt`](.specifications/BITCODE_SPEC.txt) | **Active** version pointer (currently **V47**) |
| `.specifications/BITCODE_SPEC_V47.md` (+ DELTA / NOTES / PARITY / PROVEN) | Promoted commercial website testnet-launch canon |
| `.specifications/BITCODE_SPEC_V48.md` (+ family) | **Draft** rebuild-alone SPEC for V48 gate work |
| `.specifications/BITCODE_SPECIFYING.md` | Metaspec: Complete Implementation Derivability |
| [`qa/BITCODE_V48_QA.md`](qa/BITCODE_V48_QA.md) | Interactive QA ledger / gate runbooks |
| [`.docs/FAMILIARIZATION.md`](.docs/FAMILIARIZATION.md) | **Non-canonical** codebase walkthrough |
| [`.docs/ASSET_PACKS.md`](.docs/ASSET_PACKS.md) | **Non-canonical** AssetPack orientation |

**Canonical truth** is only the `.specifications/BITCODE_SPEC_*` family (plus
generated PROVEN / `.bitcode/vN-*` when part of that family). README,
FAMILIARIZATION, ASSET_PACKS, and AGENTS **orient** — they must not be required
to rebuild the system. If any guide conflicts with the active/draft SPEC, the
**SPEC wins**.

**Complete Implementation Derivability:** a competent reader must rebuild
current Bitcode from the active (or draft-target) family alone — no silent
inheritance from older specs or folklore in source.

---

## Source architecture

| Layer | Location | Role |
| --- | --- | --- |
| Domain packages | `packages/*` | Pure domain, APIs, pipelines, BTD, auth, hosts |
| Apps | `apps/{uapi,mcp,chatgpt,claude}` | Product surfaces |
| Next shells | `apps/uapi/app/*` | Thin pages + HTTP adapters |
| UI | `apps/uapi/components/{shadcn,bitcode,<experience>}` | `Shadcn*` → `Bitcode*` → 7 experiences |
| Specs | `.specifications/` | Canon family + roadmap |
| Containers | `containers/images`, `containers/k8` | Pipeliner OCI, long-runner, k8s |
| Proof machine | `scripts/specifying` | Package-native promotion / gate proofs |
| DB | `supabase/` | Migrations, local config, data-health |

**Dependency direction:** `packages` → Bitcode/Shadcn adapters → experiences → page shells.

**Hierarchy law:** `*-generics` primitives pair with `generic-*` implementors,
then product specializations. Full map: FAMILIARIZATION §3–§5.

**Component units:** `ComponentName/ComponentName.tsx` (not `index.tsx`) with
co-located `hooks/`, `styles/`, `__tests__/`. Contract:
[`.docs/BITCODE_SOURCE_LAYOUT.md`](.docs/BITCODE_SOURCE_LAYOUT.md).

There is **no** root `uapi/` or `mcp/` symlink — always use `apps/uapi` and
`apps/mcp` (or `pnpm --filter bitcode-uapi` / `@bitcode/generic-mcps-bitcode`).

---

## Quick start

```bash
# Prerequisites: Node ≥ 21, pnpm (see packageManager), Docker (local Supabase)
pnpm install

# Env (never commit secrets)
cp apps/uapi/.env.example apps/uapi/.env.local
# fill Supabase, LLM keys, GitHub App, wallet testnet4 as needed

# Fully local: Supabase + Next
pnpm run dev:local
# or Next only (remote Supabase / staging project):
pnpm run dev:remote

# Open product surfaces
open http://127.0.0.1:3000/deposits
```

**Common quality commands**

```bash
pnpm run typecheck:uapi
pnpm run lint:uapi
pnpm --filter bitcode-uapi test
pnpm --filter @bitcode/btd test
pnpm --filter @bitcode/specifying test
node scripts/check-bitcode-canonical-inputs.mjs --current-target V47
node scripts/check-bitcode-spec-family.mjs --version V47 --mode promoted --current-target V47
```

Deep setup (hosts, Pipeliner, GitHub App, preview vs local, mock modes, gate
workflow): **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

Infrastructure depth: [`.docs/SUPABASE.md`](.docs/SUPABASE.md) ·
[`.docs/VERCEL.md`](.docs/VERCEL.md) · [`.docs/ETHEREUM.md`](.docs/ETHEREUM.md) ·
[`.docs/DEPLOYMENT.md`](.docs/DEPLOYMENT.md) ·
[`containers/images/pipeliner/README.md`](containers/images/pipeliner/README.md).

---

## Source-safety (non-negotiable)

Never product-expose: protected/raw source, unpaid AssetPack source, raw prompts,
raw provider responses, credentials, wallet private material, private settlement
payloads. Telemetry goes through `sourceSafeStreamEvent`. Demand that cannot be
grounded is **Unestimatable**, not invented.

---

## What not to do

- Do not version source paths (`api/v1`, `v48-*` product modules) unless directed.
- Do not treat removed demo trees (`protocol-demonstration`) as product law.
- Do not open value-bearing mainnet settlement in V48 draft work.
- Do not push product work straight to `main` — version + gate branches only.
- Product routes: `/packs`, `/deposits`, `/reads`, `/docs`.

---

## Docs map

| Doc | Audience |
| --- | --- |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | New developers — day-to-day development |
| [`.docs/FAMILIARIZATION.md`](.docs/FAMILIARIZATION.md) | Full package / experience map |
| [`.docs/APPS.md`](.docs/APPS.md) | Commercial apps orientation |
| [`.docs/AGENTS.md`](.docs/AGENTS.md) | Engineering craft + gate/commit law |
| [`.docs/BITCODE_SOURCE_LAYOUT.md`](.docs/BITCODE_SOURCE_LAYOUT.md) | Filesystem / modularity contract |
| [`.docs/TERMINOLOGY.md`](.docs/TERMINOLOGY.md) | Product vs agent vocabulary |
| [`qa/`](qa/) | Version QA ledgers |
| [`scripts/specifying/README.md`](scripts/specifying/README.md) | Specifying package / proof machine |

---

## Historical CI verification anchors

> **For humans:** use sections above and [`CONTRIBUTING.md`](CONTRIBUTING.md).
> The compact list below preserves exact tokens that promoted-gate package tests
> and promotion-readiness reports still assert against this file. Do not delete
> a token without updating the corresponding `scripts/specifying` evidence
> sources.

```
check:v35-gate10  v35-canon-promotion.yml
check:v36-gate10  v36-canon-promotion.yml
check:v37-gate10  v37-canon-promotion.yml
check:v38-gate11  v38-canon-promotion.yml
check:v39-gate11  v39-canon-promotion.yml
check:v40-gate11  v40-canon-promotion.yml
check:v41-gate9   v41-canon-promotion.yml
check:v42-gate9   v42-canon-promotion.yml
check:v43-gate10  v43-canon-promotion.yml
check:v44-gate10  v44-canon-promotion.yml
check:v45-gate18  v45-canon-promotion.yml
check:v46-gate8   v46-canon-promotion.yml
check:v47-gate10  v47-canon-promotion.yml

V39 Gate 3  V39 Gate 4  V39 Gate 5  V39 Gate 6  V39 Gate 7  V39 Gate 8  V39 Gate 9  V39 Gate 10
V40 Gate 2  V40 Gate 6  V40 Gate 7  V40 Gate 8 adds  V40 Gate 9 adds
V42 Gate 3  V42 Gate 4  V42 Gate 5  V42 Gate 6  V42 Gate 7  V42 Gate 8
V43 Gate 2
```
