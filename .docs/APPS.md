# Bitcode Apps (V48)

**Status:** non-canonical orientation for **commercial app surfaces**.  
**Product law:** `.specifications/BITCODE_SPEC.txt` and the draft-target
**V48** family under `.specifications/`. If this file conflicts with the SPEC,
the **SPEC wins**.

This guide describes **what ships as apps** in the monorepo under V48
launch-freeze. Domain packages live under `packages/`. Engineering craft:
[`.docs/AGENTS.md`](./AGENTS.md). Package map:
[`.docs/FAMILIARIZATION.md`](./FAMILIARIZATION.md). Layout:
[`.docs/BITCODE_SOURCE_LAYOUT.md`](./BITCODE_SOURCE_LAYOUT.md). Security:
[`.docs/SECURITY.md`](./SECURITY.md). AssetPack measurement orientation:
[`.docs/ASSET_PACKS.md`](./ASSET_PACKS.md).

---

## 1. V48 commercial posture

| Topic | V48 truth |
| --- | --- |
| Launch surface | Generally available **website MVP** on **staging-testnet** |
| Settlement money | **BTC-testnet** only; value-bearing **mainnet blocked** until future canon |
| Sellable unit | **AssetPack** = synthesized **patch + measurements + metadata** (never raw unpaid source) |
| Product language | **Pipeline** = product runs; **journal** = BTD ledger language |
| Source-safety | No protected/raw source, unpaid pack source, raw prompts/provider bodies, credentials, or private settlement payloads on product surfaces |
| Identity | Wallet (Bitcoin OAuth / Auxillaries), Supabase session, GitHub App for source connections |

**Not V48 launch scope:** value-bearing mainnet; full Conversations commercialization;
API/MCP and ChatGPT/Claude Apps as **primary commercial** paths; advanced market
mechanics; deeper BTD mining cryptography beyond the website contract.

Those monorepo apps may still exist as **compatibility / future-readiness**
surfaces — they must not regress source-safe contracts, but they are **not** the
V48 website launch path unless a later gate reopens them (SPEC goals/non-goals).

---

## 2. Apps in this monorepo

| App | Path | V48 role |
| --- | --- | --- |
| **uapi** | `apps/uapi` | **Primary commercial website** + thin HTTP adapters |
| **mcp** | `apps/mcp` | MCP server — product tool surface; **not** V48 commercial launch path beyond source-safe compatibility |
| **chatgpt** | `apps/chatgpt` | ChatGPT App — deferred commercial surface in V48 |
| **claude** | `apps/claude` | Claude App — deferred commercial surface in V48 |

There is **no** root `uapi/` or `mcp/` symlink. Always use `apps/uapi` /
`apps/mcp` (or pnpm filters).

**Run website (local app + remote/staging DB posture as configured):**

```bash
pnpm run dev:remote
# or
pnpm -C apps/uapi run dev:remote
```

Env, host, and deploy: [`.docs/DEPLOYMENT.md`](./DEPLOYMENT.md),
[`.docs/VERCEL.md`](./VERCEL.md), [`.docs/SUPABASE.md`](./SUPABASE.md),
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## 3. Website: experiences and routes (uapi)

### 3.1 Component architecture (rebuild law)

```
packages/* (domain)
  → apps/uapi/lib, networking, hooks
  → components/shadcn (Shadcn*)
  → components/bitcode (Bitcode*)
  → experiences: Marketing | Packs | Reads | Deposits | Docs | Conversations | Auxillaries
  → app/* thin page shells only
```

Strict dependency direction: **never** experience → experience; **never**
page client → page client; **never** packages → apps.

### 3.2 Canonical product routes

| Route / surface | Owner | V48 commercial role |
| --- | --- | --- |
| `/` | Marketing | Landing / public launch messaging |
| `/deposits` | Deposits | **IP seller:** connect source → **SynthesizeDepositAssetPacks (SDIVF)** → source-safe option review → Depository admission → compensation readback |
| `/reads` | Reads | **IP buyer:** Read Request → Need comprehension/resynthesis → Fits finding → source-safe preview → quote → **BTC-testnet settle** → BTD rights → delivery |
| `/packs` | Packs | Searchable **PackActivity** master-detail (deposits, reads, previews, quotes, settlements, rights, delivery, compensation, repairs, proof roots, history) |
| `/docs` | Docs | Public product documentation |
| Auxillaries | Auxillaries | Identity, org/teams, **wallet**, GitHub/externals, interfaces, histories |
| Conversations | Conversations | Structure retained; **full commercial UX deferred** post-V48 |

**Compatibility (not product homes):**

- Legacy `/exchange` (and similar cockpit paths) route into **`/packs`**.
- Dead cockpit-only modules are deleted; do not rebuild Terminal or exchange
  cockpit as product.

Login / TPS wallet authorize and Supabase callbacks live under app shells such as
`/login` and `app/tps/*` — infrastructure for identity, not separate product
experiences. **TPS is not Stripe:** third-party overlays are wallet OAuth,
Supabase auth callback, GitHub App install/callback, etc. Settlement money is
**BTC-testnet**; prepaid Stripe checkout is **not** a V48 product path.

### 3.3 Commercial loop (website MVP)

```
Depositor (/deposits)
  connect source + Obfuscations
  → SynthesizeDepositAssetPacks (SDIVF)
  → source-safe option select / admit to Depository
  → /packs activity + compensation expectation

Reader (/reads)
  Read Request → Need → Fits
  → source-safe preview → quote
  → BTC-testnet settlement → BTD rights → delivery
  → /packs activity

Operator (Auxillaries + /packs)
  wallet / GitHub authenticity, histories, portfolio readback
```

Every user-visible money or rights state must name its honesty class (estimate,
potential, preview, quote, observed testnet payment, final settlement, rights
transfer, delivery, compensation, repair) — see SPEC.

---

## 4. Pipelines on the website (not V26 “instrument” folklore)

V48 product pipelines that the website drives:

| Pipeline | Pattern | Purpose |
| --- | --- | --- |
| **SynthesizeDepositAssetPacks** | **SDIVF** | Depositor repo (+ Obfuscations) → measured AssetPack **options** on `/deposits` |
| **SynthesizeReadAssetPacks** | **SDIVF** | Reader repo + **Need** → option path on `/reads` |
| **settle-asset-pack** (and related) | Linear / simple | Post-buy: BTC settle → BTD mint/rights → delivery; **1:1 AssetPack : run** where SPEC requires |

**SDIVF** = Setup → Discovery → Implementation → Validation → Finish — the
**phased corridor** for synthesis pipelines (`packages/asset-packs-pipelines`).
It is **not** a V26 “Code Change → PR / Design Document → Issue” product matrix.

Agent composition inside steps (when used): **PTRR** (Plan → Try → Refine →
Retry) with **FailsafeGeneration** parents and **ThinkingsGeneration** children
(Reason → Judge → StructuredOutput). Vocabulary:
[`.docs/TERMINOLOGY.md`](./TERMINOLOGY.md).

**Hosts:** long synthesis runs on **pipeline hosts** — Vercel **sandbox**
(Pipeliner image) on serverless; LocalHost only on developer machines. See
[`.docs/VERCEL.md`](./VERCEL.md) and `packages/pipeline-hosts`.

**Streaming:** source-safe pipeline telemetry to the UI (Pipeline language);
never stream secrets or protected source.

---

## 5. Auxillaries (operator panes)

V48 Auxillaries are the **operator / authenticity** side of the website MVP —
not a separate “Orbitals product suite” and not a prepaid usage dashboard.

Typical concerns (names follow components under
`apps/uapi/components/auxillaries/`):

| Concern | Role |
| --- | --- |
| Profile / identity | Session user, org membership |
| Wallet | Bitcoin wallet bind, **testnet4** network default, fee-readiness posture |
| Externals / GitHub | GitHub App connection for deposit/read source workspaces |
| Interfaces | Connected interface posture where SPEC admits it |
| Organization | Org policy / treasury only as SPEC admits (solo vs org) |

Wallet and GitHub authenticity gate commercial deposit/read actions. Do not
invent bootstrap org authority the SPEC denies.

---

## 6. Public Docs and Marketing

| Surface | Role |
| --- | --- |
| `/` | Marketing landing — V48 testnet-ready claims; claim honesty markers must match SPEC / public-claim gates |
| `/docs` | Public documentation experience (`Docs*` components + content models) |

Marketing is **not** product law. Do not treat landing copy as SPEC.

---

## 7. Conversations, MCP, ChatGPT, Claude (deferred commercial)

| Surface | Monorepo path | V48 stance |
| --- | --- | --- |
| Conversations | `apps/uapi` experience + routes | Structure retained; full commercial conversations UX **deferred** |
| MCP | `apps/mcp` | Product tools exist (measure, synthesize deposit/read packs, packs, auxiliary profile/wallet/interfaces/externals); **not** the website launch commercial path beyond source-safe compatibility |
| ChatGPT App | `apps/chatgpt` | Deferred commercial surface |
| Claude App | `apps/claude` | Deferred commercial surface |

Do not market these as the V48 GA website entrypoints. Do not regress
source-safety or auth boundaries while they remain in-tree.

---

## 8. HTTP adapters and middleware (uapi)

- Thin App Router handlers under `apps/uapi/app/api/*` (and related) adapt
  **packages** domain — they are not a second product.
- Edge middleware stack: telemetry → security headers → CORS → rate-limit →
  authentication → … (see [`.docs/SECURITY.md`](./SECURITY.md)).
- Service-role Supabase clients are **server only**.

---

## 9. What this file is not

- Not the SPEC (no gate acceptance law here).
- Not a V26 / GA‑1 / “precision instrument” feature catalog (PR automation,
  design-doc issue bots, Stripe prepaid usage, exponential “network effect”
  marketing copy, fake latency/SLA tables).
- Not package domain depth (use FAMILIARIZATION + ASSET_PACKS + package READMEs).
- Not env/deploy runbooks (use DEPLOYMENT / VERCEL / SUPABASE / CONTRIBUTING).

---

## 10. Where to go next

| Question | Look first |
| --- | --- |
| Product law for a gate | `.specifications/BITCODE_SPEC_V48.md` (+ NOTES / PARITY / DELTA) |
| UI component homes | `.docs/BITCODE_SOURCE_LAYOUT.md`, `apps/uapi/components/README.md` |
| Package inheritance | `.docs/FAMILIARIZATION.md` |
| Deposit measurement / SDIVF options | SPEC G3 + `.docs/ASSET_PACKS.md` |
| Interactive QA | `.qa/BITCODE_V48_QA.md` |
| Secrets / source-safety | `.docs/SECURITY.md`, CONTRIBUTING §8.4 |

---

**V48 website launch entrypoints:** `/deposits`, `/reads`, `/packs`, Auxillaries  
**Settlement:** BTC-testnet · **Rights:** BTD · **Unit:** AssetPack · **Safety:** source-safe always
