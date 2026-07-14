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
| `BITCODE_SPEC_V48.md` (+ family) | **Draft** full-stack rebuild-alone SPEC for V48 work (sole Gate 3 rebuild law) |
| `BITCODE_SPEC_V48_NOTES.md` | V48 architecture decisions + Gate 3 depositing parity matrix |
| `BITCODE_SPEC_V48_PARITY_MATRIX.md` | Spec ↔ source ↔ tests (incl. deposit SDIVF algorithm rows) |
| `BITCODE_V48_QA.md` | Interactive QA ledger and Gate 3 runbook |
| `BITCODE_SPECIFYING.md` | Metaspec: Complete Implementation Derivability |
| `AGENTS.md` | Agent/contributor engineering rules (gates, commits, Bezalel craft) |
| `FAMILIARIZATION.md` | **Non-canonical** codebase walkthrough — packages, uapi, hierarchies |
| `ASSET_PACKS.md` | **Non-canonical** AssetPack / deposit-synthesis orientation summary |

**Canonical truth:** only `BITCODE_SPEC_*` (and generated PROVEN / `.bitcode/vN-*`
when part of the family). `README.md`, `FAMILIARIZATION.md`, `ASSET_PACKS.md`,
and `AGENTS.md` must **not** be required to rebuild the system; they link and
orient only.

**V48 Gate 3 (Deposit systems MVP)** is specified for rebuild from
`BITCODE_SPEC_V48.md` alone (measurement law + §G3-1…G3-15). Do not treat
superseded version files or non-canonical companions as live law when
implementing V48 gates.

---

## Product routes (current)

| Route | Purpose |
|---|---|
| `/deposits` | **Deposit MVP** — connect source, synthesize measured AssetPack options (SynthesizeAssetPacks SDIVF), review, admit to Depository |
| `/reads` | **Read MVP** — connect target repo, Need instruction, synthesize measured options (SynthesizeReadAssetPacks SDIVF, same shape as deposit), select → SettleAssetPack |
| `/packs` | Master-detail PackActivity (settled/admitted AssetPacks; searchable table + detail) |
| Auxillaries | Wallet identity, GitHub, organization panes |
| `/` · `/docs` | Marketing and public docs |

**Terminal is deleted** — there is no `/terminal` product surface. Prefer plural
product routes (`/deposits`, `/reads`, `/packs`).

---

## Source architecture (modular)

| Layer | Location | Role |
|---|---|---|
| Domain packages | `packages/*` | Pure domain, APIs, pipelines, BTD, auth, analytics |
| Next app | `uapi/app/*` | Thin page shells + HTTP adapters |
| UI layers | `uapi/components/{shadcn,bitcode,<experience>}` | `Shadcn*` → `Bitcode*` → 7 experiences |

**Dependency direction:** packages ← Bitcode/Shadcn ← experiences ← page shells.

**Component units:** `ComponentName/ComponentName.tsx` (not `index.tsx`) with
co-located `hooks/`, `styles/`, `__tests__/`. Full contract:
[`internal-docs/BITCODE_SOURCE_LAYOUT.md`](internal-docs/BITCODE_SOURCE_LAYOUT.md).

**Conventions for agents:** [`AGENTS.md`](AGENTS.md) · [`FAMILIARIZATION.md`](FAMILIARIZATION.md) · [`uapi/ARCHITECTURE.md`](uapi/ARCHITECTURE.md) · [`uapi/components/README.md`](uapi/components/README.md).

---

## V48 Gate 3 — Deposit systems MVP (what just closed)

Branch: `v48/gate-3-synthesis-pipeline-correctness` → PR into `version/v48`.

| Area | Law |
|---|---|
| Pipeline | **SynthesizeDepositAssetPacks** SDIVF (deposit-native roster, no lens), **maxIterations = 1** |
| AssetPack | **patch + measurements + metadata**; formal `ASSET_PACK_ABSOLUTES_CATALOG` |
| Catalog | `deposit:sourceCheckoutCatalog` (paths/samples/sources); inventory is legacy dual-write only |
| Default LLM | Anthropic **`claude-haiku-4-5`** (`BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` override) |
| LLM timeout | `BITCODE_LLM_CALL_TIMEOUT_MS` default **180000** |
| Inputs | Obfuscations (empty → skip Setup LLM), Forced Inclusions / Exclusions |
| Demand | Settled Depository search or **Unestimatable** (no hardcoded %) |
| Hosts | LocalHost (default) or Vercel Sandbox (`persistent: false` deposit boxes) |
| UI | `/deposits` master-detail, option cards, telemetry, cancel, authority/earnings |

Rebuild law: `BITCODE_SPEC_V48.md` measurement law + §G3 (deposit) + **§G4 (read/settle/packs)**.
Orientation only: [`ASSET_PACKS.md`](ASSET_PACKS.md) (non-canonical).

### Three commercial pipelines

| Pipeline | Pattern | UI |
|---|---|---|
| SynthesizeDepositAssetPacks | SDIVF | `/deposits` |
| SynthesizeReadAssetPacks | SDIVF (Need + *-fit needinesses) | `/reads` |
| SettleAssetPack | Simple (pay → mint BTD → rights → **PR ship**) | after `/reads` select → activity on `/packs` |

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
cp uapi/.env.example uapi/.env.local # if present; else create from team secrets

# Minimum for deposit synthesis (live inference)
# BITCODE_ASSET_PACK_REAL_INFERENCE=true
# BITCODE_LLM_PROVIDER=anthropic
# BITCODE_LLM_MODEL=claude-haiku-4-5
# BITCODE_LLM_CALL_TIMEOUT_MS=180000
# XAI_API_KEY=...
# Supabase URL + keys (local or remote)
# GitHub App credentials for repo selection
```

### Database (local Supabase)

```bash
# From repo root or uapi — follow team Supabase layout
cd uapi && pnpm exec supabase start # if configured
# Apply migrations under supabase/migrations (executions, execution_events, …)
```

### App server

```bash
cd uapi
pnpm dev:remote # Next on 127.0.0.1
# or: pnpm dev:local # supabase start + next (if available)
```

Open `http://127.0.0.1:3000/deposits` after wallet + GitHub connect.

### Deposit smoke (recommended)

1. Connect with wallet (testnet).
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
| `packages/asset-packs-pipelines/domain/` | SynthesizeAssetPacks SDIVF, deposit agents, policy, demand estimate |
| `packages/asset-packs-pipelines/` | Product pipelines (synthesize-deposits/reads, settle-reads) |
| `packages/asset-packs-generics/` | AssetPack protocol primitive |
| `packages/generic-asset-packs/` | synthesis base + synthesis/settle product surfaces |
| `packages/pipeline-hosts/` | AssetPack host orchestration over `generic-hosts/*` |
| `packages/host-generics/` + `generic-hosts/*` | Host primitive + Local / VercelSandbox bases |
| `packages/agent-generics/` | Agent = Executor + PTRR composition |
| `packages/generic-agents/*` | Nested base agents |
| `packages/generic-llms/*` | xAI/Grok and other LLM providers + models pricing |
| `packages/execution-generics/` | Execution state tree |
| `packages/pipelines-generics/` | Pipeline primitive, phase runners, source-safe stream hooks |
| `packages/api/` | Route orchestration + **primitives** (`src/responses/`, `src/streams/`) |
| `packages/files/` + `file-editing/` + `file-refactoring/` | File primitives and mutations |
| `packages/vcs-generics/` + `generic-vcs/*` | VCS primitives + providers (`@bitcode/vcs-generics`, `@bitcode/generic-vcs-*`) |
| `packages/security/*` | Split security utilities (encryption, credentials, …) |
| `packages/externals/*` | Figma, Jira, Notion, Vercel deploy APIs |
| `packages/external-telemetry/*` | Google Analytics, Sentry, Vercel analytics |
| `packages/containerizations/*` | Docker, Kubernetes |
| `packages/web-search/*` | Multi-provider search + Exa |
| `packages/web-scrapers/firecrawl/` | Firecrawl client |
| `packages/conversations/` | Conversation domain (`@bitcode/conversations`) |
| `packages/obfuscation/` | Privacy transforms (`@bitcode/obfuscation`) |
| `supabase/migrations/` | `executions`, `execution_events`, RLS |
| `scripts/` | Spec quality, canon checks, promotion |
| `_legacy/`, `protocol-demonstration/` | **Not** active product canon for V48 gates |

**Hierarchy law:** `*-generics` primitives pair with `generic-*/*` implementors.
Plain names (`obfuscation`, `conversations`, `file-editing`) when there is no
parallel implementor family. The current tree is the **sole canon** — import
hierarchy package names only (no dual package homes or compatibility package aliases).

Full package walkthrough: [`FAMILIARIZATION.md`](FAMILIARIZATION.md) §3–§5.
Filesystem contract: [`internal-docs/BITCODE_SOURCE_LAYOUT.md`](internal-docs/BITCODE_SOURCE_LAYOUT.md).

---

## Contributor workflow (V48)

1. Read `AGENTS.md` and `BITCODE_SPEC_V48.md` for the gate you touch.
2. Branch from `version/v48`: `v48/gate-N-<topic>`.
3. Commit subjects (≤72 chars): `V48 Gate N (spec-only|impl-only|spec-impl): …` — put detail in the body
4. Do not push straight to `main`. Gate PR → `version/v48`; version PR → `main` only at promotion.
5. Keep CI green: Gate Quality, lint/typecheck, unit tests, Spec Basics.

```bash
# Spec quality (active V47 + draft V48)
pnpm exec node scripts/run-bitcode-spec-quality.mjs

# Focused package tests (examples)
pnpm --filter @bitcode/asset-packs-pipelines-domain test
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

---

## Historical CI verification anchors (do not delete)

> **For humans:** use the sections above. The block below preserves exact gate
> documentation strings that promoted-gate package tests and Gate Quality still
> assert against this file. Do not delete without updating those checks.

# Historical product canon changelog (CI verification anchors)


`BITCODE_SPEC.txt` is the canonical pointer for active-system work. It currently
resolves to `V46`; V47 is the active draft target after commercial protocol
comprehension was promoted as canon in V46.

## Current Product Posture

Bitcode is the protocol and the commercial source tree implements it in-place.
The promoted V43 enterprise routes are:

- `/packs` for searchable master-detail pack activity.
- `/read` for the five-step Reading path from Read Request to settlement-gated delivery.
- `/deposit` for connected-source deposit AssetPack option synthesis, review, and admission.

The promoted V46 canon makes those routes easier to explain and audit:
public docs, landing, and operator docs must teach AssetPack commodity flow,
BTD scalar knowledge volume and rights, BTC settlement money, proof readback
authority, and source-safe claim boundaries without turning public guidance into
protocol law.

V46 Gate 3 adds `V46PublicOperatorClaimBoundaries` through
`packages/specifying/src/canonical/v46-public-operator-claim-boundaries.js`,
`.bitcode/v46-public-operator-claim-boundaries.json`,
`generate:v46-public-operator-claim-boundaries`,
`check:v46-public-operator-claim-boundaries`, and `check:v46-gate3`. It binds
public docs, landing, and operator docs to source-safe claim categories,
evidence authority, compatibility redirects, and forbidden overclaims while
keeping protected source, unpaid AssetPack source, raw prompts, raw provider
responses, credentials, wallet private material, and value-bearing mainnet
operation out of generated metadata.

V46 Gate 4 adds `V46ProductRouteComprehensionReadback` through
`packages/specifying/src/canonical/v46-product-route-comprehension-readback.js`,
`.bitcode/v46-product-route-comprehension-readback.json`,
`generate:v46-product-route-comprehension-readback`,
`check:v46-product-route-comprehension-readback`, and `check:v46-gate4`. It
binds `/packs`, `/read`, and `/deposit` to low-detail route defaults,
route-owned state, searchable PackActivity readback, Reading and Depositing
five-step flows, expandable proof detail, settlement/delivery boundaries,
compensation readback, and no-source/no-secret route metadata.

V46 Gate 5 adds `V46InterfaceClaimContracts` through
`packages/specifying/src/canonical/v46-interface-claim-contracts.js`,
`.bitcode/v46-interface-claim-contracts.json`,
`generate:v46-interface-claim-contracts`,
`check:v46-interface-claim-contracts`, and `check:v46-gate5`. It binds public
API, MCP API, ChatGPT App, Bitcode Chat, and package-consumer surfaces to
source-safe `InterfaceClaim` contracts, proof-root projection, denied-state
repair, no parallel state authority, and no-source/no-secret interface
metadata.

V46 Gate 6 adds `V46ProofReadbackOperatorExplanation` through
`packages/specifying/src/canonical/v46-proof-readback-operator-explanation.js`,
`.bitcode/v46-proof-readback-operator-explanation.json`,
`generate:v46-proof-readback-operator-explanation`,
`check:v46-proof-readback-operator-explanation`, and `check:v46-gate6`. It
binds canonical/generated proof, execution/workflow receipts, ledger journals,
database projections, object-storage roots, telemetry streams,
wallet/provider receipts, repository delivery receipts, and repair
reconciliation receipts into a source-safe operator authority ladder.

V46 Gate 7 adds `V46LocalInterfaceComprehensionRehearsal` through
`packages/specifying/src/canonical/v46-local-interface-comprehension-rehearsal.js`,
`.bitcode/v46-local-interface-comprehension-rehearsal.json`,
`generate:v46-local-interface-comprehension-rehearsal`,
`check:v46-local-interface-comprehension-rehearsal`, and `check:v46-gate7`.
It rehearses local docs/landing, `/packs`, `/read`, `/deposit`, API/MCP,
ChatGPT App, Bitcode Chat, proof telemetry, and repair readback against the
V46 claim and authority artifacts without exposing protected source, unpaid
AssetPack source, prompts, provider responses, credentials, wallet private
material, private settlement payloads, or value-bearing mainnet behavior.

V41 Gate 1 opens the prompts-as-programs specification family over active V40
with `check:v41-gate1`. V41 will catalogue every raw PromptPart and composed
Prompt, map registry composition and interpolation contracts, benchmark Reading
prompt baselines, then harden `ReadNeedComprehensionSynthesis`,
`ReadFitsFindingSynthesis`, Conversation, tool-definition, and interface prompts
without exposing protected prompt payloads, raw provider responses, secrets,
protected source, or unpaid AssetPack source.
V41 Gate 2 adds the package-backed `buildV41PromptPartPromptInventory` and
generated source-safe artifact `.bitcode/v41-promptpart-prompt-inventory.json`.
The inventory currently covers 1,459 raw PromptPart rows and 105 composed Prompt
rows across Reading, Conversation, tool-definition, interface, and benchmark
surfaces, with `generate:v41-prompt-inventory`, `check:v41-prompt-inventory`,
and `check:v41-gate2`.
V41 Gate 3 adds the package-backed `buildV41RegistryInterpolationContracts` and
generated source-safe artifact `.bitcode/v41-registry-interpolation-contracts.json`.
The contract currently covers 12 registry/interpolation rows and 65 source
predicates for Prompt registry totality, PromptPart interpolation, PTRR
agent/step composition, Failsafe and Thricified prompt resolution, execution
ancestry overlays, tool doc-code prompt injection, Reading parser targets,
Finding Fits search contracts, AssetPack synthesis/finishing parser targets,
and Gate 2 inventory binding with `check:v41-gate3`.
V41 Gate 4 adds the package-backed `buildV41ReadingPromptBenchmarkBaselines`
and generated source-safe artifact
`.bitcode/v41-reading-prompt-benchmark-baselines.json`. The baseline currently
covers 10 Reading prompt benchmark rows, 120 source predicates, all five Reading
UX steps, both Reading pipelines, Gate 2 inventory, Gate 3 registry contracts,
V38 benchmark fixtures, V40 prompt smoke readiness, parser targets, and
source-safe disclosure tiers with `check:v41-gate4`.
V41 Gate 5 adds the package-backed `buildV41ReadNeedPromptHardening` and
generated source-safe artifact `.bitcode/v41-readneed-prompt-hardening.json`.
The hardening report currently covers 7 ReadNeedComprehensionSynthesis rows and
63 source predicates for exact Read Request boundary, source constraints, strict
return types, review/resynthesis gates, telemetry redaction, PTRR/Failsafe/
Thricified composition, and read-comprehension tool prompt alignment with
`check:v41-gate5`.
V41 Gate 6 adds the package-backed
`buildV41ReadFitsFindingPromptHardening` and generated source-safe artifact
`.bitcode/v41-readfitsfinding-prompt-hardening.json`. The hardening report
currently covers 8 ReadFitsFindingSynthesis rows and 76 source predicates for
many-candidate Depository search, embeddings and provider-ranking policy,
selected-fit provenance, AssetPack context synthesis, source-safe preview and
quote disclosure, post-settlement rights/delivery boundaries, and redacted
telemetry with `check:v41-gate6`.
V41 Gate 7 adds the package-backed
`buildV41ConversationToolInterfacePromptRewrite` and generated source-safe
artifact `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`. The
rewrite report currently covers 9 Conversation/tool/interface rows and 60 source
predicates for Conversation PTRR PromptParts, Terminal system prompt
composition, rich execution-log prompt/result disclosure, DocCodeToolPrompt and
ToolPromptRegistry hierarchy, MCP API/public API schemas, ChatGPT App action
prompt boundaries, Terminal/public summaries, V38 Conversation/tool parity, and
Gate 2 through Gate 6 dependency roots with `check:v41-gate7`.
V41 Gate 8 adds the package-backed `buildV41PromptProgramBenchmarkReport` and
generated source-safe artifact `.bitcode/v41-prompt-program-benchmark-report.json`.
The report binds post-rewrite PromptPart/Prompt deltas, Reading benchmark
baselines, Conversation/tool/interface deltas, prompt registry lineage,
Failsafe and ThricifiedGeneration receipts, parsed-output schema verdicts, rich
stream telemetry, repair hooks, V38/V39/V40 proof roots, and V41 Gate 2 through
Gate 7 dependency roots with `check:v41-gate8`, without serializing raw prompts,
interpolated prompts, provider responses, protected source, or unpaid AssetPack
source.
V41 Gate 9 adds the package-backed `buildV41PromotionReadinessReport` and
generated source-safe artifact `.bitcode/v41-promotion-readiness-report.json`.
The report binds every V41 prompt-program artifact, `BITCODE_SPEC_V41_PROVEN.md`
generation support, `.github/workflows/v41-canon-promotion.yml`, promotion
dry-run support, gate/canon workflow posture, active V41 / draft V42 runtime
preparation, and source-safe value-bearing mainnet blocking through
`generate:v41-promotion-readiness`, `check:v41-promotion-readiness`, and
`check:v41-gate9`.
V42 Gate 1 opens the reliable MVP experience specification family over active
V41 with `check:v42-gate1`. V42 is scoped to shortest-path Depositing with
later BTC compensation, shortest-path Reading through Need review/resynthesis,
Finding Fits, source-safe AssetPack preview, BTD/BTC settlement, repository
delivery, and an AI-reading dominant demonstration whose AssetPack measurably
improves an AI system beyond public-data-only performance.
V42 Gate 2 adds source-safe Depositing compensation visibility with
`DepositorySupplyCompensationPreview`, deposit route compensation evidence,
Terminal compensation roots, `.bitcode/v42-depositing-shortest-path.json`,
and `check:v42-gate2`. Deposit admission remains pre-mint and pre-rights
transfer; BTC source-to-shares allocation is only a later paid AssetPack
settlement route.
V42 Gate 3 adds the Reading shortest path state machine with
`TerminalEnterpriseReadingRouteState`, recoverable transaction ids,
`readingStage` hydration, retry/restart posture, source-safe failure repair,
accepted-Need blockers, source-safe preview blockers,
`.bitcode/v42-reading-shortest-path-state-machine.json`, and
`check:v42-gate3`.
V42 Gate 4 adds ReadNeed product closure with
`ReadNeedReviewResynthesisRuntime`, source-safe storage projection,
feedback/resynthesis lineage, accepted-Need Finding Fits admission,
rejected Need blockers, PTRR/Failsafe/Thricified telemetry receipts,
Terminal Need runtime readback,
`.bitcode/v42-readneed-review-resynthesis-product-closure.json`, and
`check:v42-gate4`.
V42 Gate 5 adds Finding Fits preview and quote closure with
accepted-Need-gated `ReadFitsFindingRuntime`, many-channel Depository search,
selected-fit provenance, `AssetPackPreviewBoundary`, deterministic
share-to-fee quote receipts, disclosure review, settlement instructions,
delivery lock, host evidence summaries, Terminal preview/quote/provenance
readback, `.bitcode/v42-readfitsfinding-preview-quote.json`, and
`check:v42-gate5`. The preview remains metadata-only before settlement:
protected source, unpaid AssetPack source, wallet private material, private
settlement payloads, credentials, raw protected prompts, and raw provider
responses stay out of route and UI readback.
V42 Gate 6 adds paid settlement, BTD rights transfer, source-to-shares
compensation, and repository delivery closure with
`AssetPackSettlementRightsDeliveryBoundary`,
`.bitcode/v42-settlement-rights-delivery.json`, and `check:v42-gate6`.
The boundary observes the quote payment, confirms BTC/testnet finality,
allocates depositor compensation, records BTD read-right receipts, reconciles
ledger/database/object-storage projections, and unlocks source-bearing
pull-request delivery only after paid readback agrees. Route summaries and
Terminal detail remain source-safe metadata: unpaid AssetPack source, wallet
private material, private settlement payloads, credentials, raw protected
prompts, and raw provider responses are withheld.
V42 Gate 7 adds the AI-reading dominant demonstration MVP with
`protocol-demonstration/src/ai-reading-demonstration.js`,
`.bitcode/v42-ai-reading-demonstration.json`, and `check:v42-gate7`.
It compares a public-data-only AI remediation answer against an
AssetPack-enhanced answer after a reviewed local Need and local Finding Fits
step select the deposited runbook AssetPack. The benchmark uplift is
deterministic, the demonstration stays self-contained, and protected source
remains withheld before settlement.
V42 Gate 8 adds the local/staging-testnet full MVP rehearsal with
`ReadingLocalStagingRehearsal`,
`scripts/rehearse-v42-local-staging-mvp.mjs`,
`.bitcode/v42-local-staging-mvp-rehearsal.json`, and `check:v42-gate8`.
It binds Gates 2 through 7 into one source-safe operator path: deposit source,
request read, review synthesized Need, request Finding Fits, review source-safe
AssetPack preview and quote, buy/settle, receive repository delivery, and
verify AI-reading uplift. The staging lane is bound to Supabase project
`tkpyosihuouusyaxtbau`; operator receipts and generated artifacts never
serialize secrets, protected source, raw prompts, provider responses, unpaid
AssetPack source, wallet private material, private settlement payloads, or
live rehearsal logs.
V42 Gate 9 adds promotion readiness with `buildV42PromotionReadinessReport`,
`.bitcode/v42-promotion-readiness-report.json`,
`BITCODE_SPEC_V42_PROVEN.md`, `.github/workflows/v42-canon-promotion.yml`,
`generate:v42-promotion-readiness`, `check:v42-promotion-readiness`, and
`check:v42-gate9`.
The report binds every V42 product artifact, workflow posture, promotion
script, generated proof path, source-safety result, value-bearing mainnet
block, and post-promotion V42 active / draft V43 runtime preparation.
V43 Gate 1 opens the Packs, Read, Deposit roadmap over active V42 with
`check:v43-gate1`. V43 owns the agentic depositing evolution: repository
agents synthesize deposit AssetPack options from connected enterprise code,
Depository state, and Reading demand; enterprises approve or reject
sub-critical positive-ROI options; `/terminal` separates into `/read` and
`/deposit`; and `/exchange` is renamed to `/packs` across routes, component
prefixes, tests, docs, telemetry labels, and product naming.
The V43 route model treats AssetPacks as the product object in and out:
`/deposit` proposes deposit AssetPack options from source and Bitcode demand,
`/read` buys synthesized Need-Fit AssetPacks, and `/packs` becomes the
searchable master-detail activity surface for pack measurements, values,
settlement posture, compensation, delivery, proofs, and repair.
The `/packs` master view should sort, filter, and search over measurements,
synthesized AssetPack titles and descriptions, values, activity or transaction
type, settlement posture, compensation state, and proof roots, while its detail
view exposes source-safe activity data, telemetry, ledger/database/storage
synchronization, and expandable proof metadata.
That later UX cleanup should remove self-referential product copy outside
public docs and make Depositing, Reading, and Pack activity understandable
through route structure, concise labels, progressive disclosure, and rich
themed reusable components.
V43 Gate 2 adds `V43RouteVocabularyInventory`,
`.bitcode/v43-route-vocabulary-inventory.json`,
`generate:v43-route-vocabulary-inventory`,
`check:v43-route-vocabulary-inventory`, and `check:v43-gate2`. It inventories
`/exchange`, Exchange, `/terminal`, Terminal, `/packs`, `/read`, `/deposit`,
Reading, Depositing, PackActivity, DepositAssetPackOption, and
self-referential copy references as source-safe file/token counts. It also
records the migration matrix for `/packs`, `/read`, `/deposit`, retained debug
cockpit boundaries, redirect compatibility, and later copy cleanup without
renaming routes in Gate 2 or serializing source snippets, protected source, raw
prompts, provider responses, unpaid AssetPack source, credentials, or wallet
and settlement private material.
V43 Gate 3 adds `V43PacksActivityMasterDetail`,
`.bitcode/v43-packs-activity-master-detail.json`,
`generate:v43-packs-activity-master-detail`,
`check:v43-packs-activity-master-detail`, and `check:v43-gate3`. It implements
`PackActivityRecord`, `/api/packs/activity`, `/packs`, `/exchange` to `/packs`
compatibility redirection, search, type/state filtering, column sorting,
detail projection, proof-root display, settlement/compensation/delivery/repair
state readback, and no-source leak tests. The Packs projection remains
source-safe metadata only and does not serialize protected source, unpaid
AssetPack source, raw prompts, provider responses, credentials, wallet private
material, or private settlement payloads.
V43 Gate 4 adds `V43ReadRouteFiveStepUx`,
`.bitcode/v43-read-route-five-step-ux.json`,
`generate:v43-read-route-five-step-ux`,
`check:v43-read-route-five-step-ux`, and `check:v43-gate4`. It implements
`ReadRouteSession`, `/read`, source-safe route state, the five-step Reading UX,
Need review, accepted-Need-gated Finding Fits, source-safe AssetPack preview,
BTC settlement/delivery posture, retained execution stream readback, nav/footer
route ownership, and focused tests. `/read` does not expose protected source,
unpaid AssetPack source, raw prompts, interpolated prompts, raw provider
responses, wallet private material, or private settlement payloads before paid
read rights are proven.

V43 Gate 5 adds `V43DepositRouteOptions`,
`.bitcode/v43-deposit-route-options.json`,
`generate:v43-deposit-route-options`,
`check:v43-deposit-route-options`, and `check:v43-gate5`. It implements
`DepositRouteSession`, `/deposit`, source-safe connected-source AssetPack option
synthesis, option measurements, demand signal roots, retained deposit composer
reuse, navigation/footer route ownership, and focused UAPI/package/protocol
tests. `/deposit` does not decide source criticality, ROI, compensation policy,
admission, or indexing; those stay deferred to V43 Gates 6 and 7.

V43 Gate 6 adds `DepositAssetPackOptionPolicyReport`,
`.bitcode/v43-deposit-policy-compensation.json`,
`generate:v43-deposit-policy-compensation`,
`check:v43-deposit-policy-compensation`, and `check:v43-gate6`. It implements
source-safe policy scoring for source criticality, likely demand, estimated
ROI, estimate-only BTD potential, and future-reader BTC source-to-shares
compensation route. Critical source is blocked before admission, negative
expected value is not treated as positive-ROI supply, and Gate 7 still owns
approval, admission, indexing, storage projection, telemetry, and `/packs`
activity synchronization.

V43 Gate 7 adds `DepositAssetPackOptionAdmissionReport`,
`.bitcode/v43-deposit-option-admission.json`,
`generate:v43-deposit-option-admission`,
`check:v43-deposit-option-admission`, and `check:v43-gate7`. It implements
depositor approve/reject/resynthesis decisions, source-safe admission receipts,
Depository index and storage projections, BTC source-to-shares compensation
preview continuity, execution-stream telemetry, and `/packs`
`depository-assetpack` synchronization for approved policy-eligible deposit
options. It still does not mint BTD, transfer rights, or reveal unpaid
AssetPack source.

V43 Gate 8 adds `ProductRouteShell`, `ProductRouteStepGrid`,
`ProductRouteStatePanel`, `ProductRouteDisclosure`,
`.bitcode/v43-route-ux-product-excellence.json`,
`generate:v43-route-ux-product-excellence`,
`check:v43-route-ux-product-excellence`, and `check:v43-gate8`. It refines
`/packs`, `/read`, and `/deposit` into a shared themed route frame with concise
copy, source-safe route metrics, keyboard current-step semantics, loading/
empty/error states, and progressive disclosure boundaries while keeping every
Reading, Depositing, settlement, and source-safety invariant intact.

V43 Gate 9 adds `V43CrossRouteRehearsalTelemetryRepair`,
`.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`,
`scripts/rehearse-v43-cross-route-product-flow.mjs`,
`generate:v43-cross-route-rehearsal`, and `check:v43-gate9`. It binds the
local and staging-testnet product route rehearsal across `/deposit`, `/read`,
and `/packs`: deposit option synthesis/admission, Reading Need review, Finding
Fits, source-safe AssetPack preview, BTC/BTD settlement, repository delivery,
source-to-shares compensation readback, pack activity inspection, telemetry
database readback, ledger/database/storage synchronization, and repair posture.
The staging lane is bound to Supabase project `tkpyosihuouusyaxtbau`; receipts
and generated artifacts remain source-safe metadata only.

V43 Gate 10 adds `V43PromotionReadinessReport`,
`.bitcode/v43-promotion-readiness-report.json`,
`generate:v43-promotion-readiness`, `check:v43-promotion-readiness`,
`check:v43-gate10`, and `v43-canon-promotion.yml`. It binds every V43 gate
artifact, promotion script, generated PROVEN hook, workflow, source-safety
boundary, documentation update, and post-promotion V43 active / draft V44
runtime posture before the version branch can promote canon.

V44 Gate 1 opens scaled engineering economy work over active V43 with
`check:v44-gate1`. V44 is scoped to digitizing and tokenizing scaled
engineering economies: enterprise AssetPack portfolios, Pack market signals,
Reading demand signals, deposit supply opportunities, Reading budgets,
AssetPack quote policy, BTD/BTC/source-to-shares accounting, contributor
compensation statements, organization policy, wallet/spend authority, scaled
local/staging-testnet rehearsal, and polished economic operation through
`/packs`, `/read`, and `/deposit`. Gate 1 is specification, roadmap,
documentation, workflow, and checker posture only.

V44 Gate 2 adds `V44EconomicDomainModel`,
`.bitcode/v44-economic-domain-model.json`,
`generate:v44-economic-domain-model`, `check:v44-economic-domain-model`, and
`check:v44-gate2`. It defines source-safe contracts for portfolio positions,
market signals, quote states, settlement states, compensation statements,
governance decisions, and repair cases while keeping economic values labeled
as estimate, quote, observed payment, final settlement, contributor
allocation, delivery, or repair state. Gate 2 does not expose protected source,
unpaid AssetPack source, raw prompts, provider payloads, credentials, wallet
private material, private settlement payloads, or value-bearing mainnet
operation.

V44 Gate 3 adds `V44PacksPortfolioMarketIntelligence`,
`.bitcode/v44-packs-portfolio-market-intelligence.json`,
`generate:v44-packs-portfolio-market-intelligence`,
`check:v44-packs-portfolio-market-intelligence`, and `check:v44-gate3`.
It evolves `/packs` from PackActivity master-detail into source-safe portfolio
and market intelligence with saved filters, organization views, demand/supply
signals, unfit Need signals, settlement and compensation facets, proof-root
drilldown, API/UI projection tests, and no-source-leak checks.

V44 Gate 4 adds `V44ReadingBudgetQuotePolicy`,
`.bitcode/v44-reading-budget-quote-policy.json`,
`generate:v44-reading-budget-quote-policy`,
`check:v44-reading-budget-quote-policy`, and `check:v44-gate4`. It binds
`/read` to source-safe `ReadProcurementGovernance`: budget envelopes, approval
thresholds, quote expiry, deterministic measurement-weight-volume
share-to-fee policy, buyer authorization, wallet authority, BTC/BTD
settlement readiness blockers, pre-purchase review boundaries, route UI
readback, and tests that continue withholding protected source, unpaid
AssetPack source, raw prompts, provider payloads, wallet private material,
private settlement payloads, and value-bearing mainnet operation.

V44 Gate 5 adds `V44DepositorEarningsSupplyOpportunities`,
`.bitcode/v44-depositor-earnings-supply-opportunities.json`,
`generate:v44-depositor-earnings-supply-opportunities`,
`check:v44-depositor-earnings-supply-opportunities`, and `check:v44-gate5`.
It binds `/deposit` to source-safe `DepositorEarningSupplyIntelligence`:
likely demand, unfit Need opportunities, source criticality, ROI posture,
estimate-only BTC compensation ranges, source-to-shares proof boundaries,
earning statements, supply recommendations, route UI readback, and tests that
continue withholding protected source, raw source text, unpaid AssetPack
source, prompts, provider payloads, wallet private material, private
settlement payloads, and value-bearing mainnet operation.

V44 Gate 6 adds `V44BtdBtcCompensationStatements`,
`.bitcode/v44-btd-btc-compensation-statements.json`,
`generate:v44-btd-btc-compensation-statements`,
`check:v44-btd-btc-compensation-statements`, and `check:v44-gate6`. It binds
settlement rights delivery boundaries to source-safe
`BtdBtcCompensationStatements`: BTD range state, BTC settlement observations,
source-to-shares contributor allocations, depositor earning summaries,
treasury routes, ledger/database/object-storage reconciliation, repair
statements, `/packs` accounting readback, and tests that continue withholding
protected source, raw source text, unpaid AssetPack source, prompts, provider
payloads, wallet private material, private settlement payloads, and
value-bearing mainnet operation.

V44 Gate 7 adds `V44OrganizationPolicyWalletAuthority`,
`.bitcode/v44-organization-policy-wallet-authority.json`,
`generate:v44-organization-policy-wallet-authority`,
`check:v44-organization-policy-wallet-authority`, and `check:v44-gate7`. It
binds BTD Reading and deposit authority actions to source-safe organization
budget approval, source criticality approval, spend and deposit limits, wallet
authority, `/read` authority readback, `/deposit` authority readback, `/packs`
governance readback, and tests that continue withholding protected source, raw
source text, unpaid AssetPack source, prompts, provider payloads, credentials,
wallet private material, private settlement payloads, and value-bearing
mainnet operation.

V44 Gate 8 adds `V44EnterpriseProductUx`,
`.bitcode/v44-enterprise-product-ux.json`,
`generate:v44-enterprise-product-ux`,
`check:v44-enterprise-product-ux`, and `check:v44-gate8`. It makes the scaled
engineering economy operable through shared `ProductRouteEnterpriseSummary`,
`ProductRouteKeyboardHint`, and `ProductRouteProofDetail` primitives;
source-safe enterprise economy summaries on `/packs`, `/read`, and `/deposit`;
keyboard navigation hints; a sticky dense Pack activity table; expandable
proof detail roots for portfolio, Reading procurement, deposit synthesis,
earnings, and organization authority; focused route tests; protocol tests; and
workflow wiring while continuing to withhold protected source, raw source text,
unpaid AssetPack source, prompts, provider payloads, credentials, wallet
private material, private settlement payloads, and value-bearing mainnet
operation.

V44 Gate 9 adds `V44ScaledNetworkRehearsal`,
`.bitcode/v44-scaled-network-rehearsal.json`,
`generate:v44-scaled-network-rehearsal`,
`check:v44-scaled-network-rehearsal`, `rehearse:v44-scaled-network`, and
`check:v44-gate9`. It binds source-safe local and staging-testnet rehearsal
receipts for `/deposit`, `/read`, and `/packs`; 24 deposits, 18 Reads, 72 Fit
candidates, 18 quotes, 12 BTC settlement observations, 36 contributors, 8
repair cases, and 54 PackActivity rows; the staging-testnet Supabase project
`tkpyosihuouusyaxtbau`; database stream readback; ledger/database/storage
reconciliation; repair readback; protocol tests; and workflow wiring while
continuing to withhold protected source, raw source text, unpaid AssetPack
source, prompts, provider payloads, credentials, wallet private material,
private settlement payloads, live rehearsal logs, and value-bearing mainnet
operation.

V44 Gate 10 adds `V44PromotionReadinessReport`,
`.bitcode/v44-promotion-readiness-report.json`,
`generate:v44-promotion-readiness`, `check:v44-promotion-readiness`,
`check:v44-gate10`, and `v44-canon-promotion.yml`. It binds all V44 scaled
engineering economy artifacts, source-safe promotion metadata, generated
`BITCODE_SPEC_V44_PROVEN.md` support, gate/canon workflow posture, promotion
scripts, protocol tests, and the promoted `V44` active, `V45` draft runtime
posture while continuing to withhold protected source, unpaid AssetPack source,
raw prompts, provider payloads, credentials, wallet private material, private
settlement payloads, live rehearsal logs, and value-bearing mainnet operation.

V45 Gate 17 adds the source-safe end-to-end rehearsal closure artifact:
`V45SourceSafeEndToEndRehearsal`,
`.bitcode/v45-source-safe-e2e-rehearsal.json`,
`generate:v45-source-safe-e2e-rehearsal`,
`check:v45-source-safe-e2e-rehearsal`, `rehearse:v45-source-safe-e2e`, and
`check:v45-gate17`. It rehearses depositing, Reading, Finding Fits, source-safe
preview, deterministic quote readiness, BTC observation posture, BTD
rights-delivery posture, source-to-shares compensation posture,
ledger/database/storage readback, browser receipt posture, and repair receipts
across local deterministic, staging-testnet credentialed, and value-bearing
mainnet-blocked lanes while withholding protected source, raw source text,
unpaid AssetPack source, raw or interpolated prompts, provider payloads,
credentials, wallet private material, private settlement payloads, live logs,
and value-bearing mainnet admission.

V45 Gate 18 adds `V45PromotionReadinessReport`,
`.bitcode/v45-promotion-readiness-report.json`,
`generate:v45-promotion-readiness`, `check:v45-promotion-readiness`,
`check:v45-gate18`, and `v45-canon-promotion.yml`. It binds V45 proof-family
artifacts, source-safe end-to-end rehearsal, draft `BITCODE_SPEC_V45_PROVEN.md`
support, promotion scripts, gate/canon workflow posture, and the promoted
`V45` active, `V46` draft runtime posture while continuing to block direct main
promotion, protected source, unpaid AssetPack source, raw prompts, provider
payloads, credentials, wallet private material, private settlement payloads,
live logs, and value-bearing mainnet operation.

V46 Gate 1 opens commercial protocol comprehension work over the promoted
`V45` active, `V46` draft posture with the V46 specification family and
`check:v46-gate1`. It keeps `BITCODE_SPEC.txt` pointed at `V45` while naming
V46's launch-facing focus: public/operator explanation, `/packs`, `/read`,
`/deposit`, API/MCP, ChatGPT App, Bitcode Chat, proof readback, and source-safe
claim boundaries for Bitcode as the knowledge commoditization system.

V46 Gate 2 adds `V46ProtocolComprehensionObjectModel`,
`.bitcode/v46-protocol-comprehension-object-model.json`,
`generate:v46-protocol-comprehension-object-model`,
`check:v46-protocol-comprehension-object-model`, and `check:v46-gate2`.
It binds source-safe object rows for AssetPack, deposit options, Depository
AssetPacks, Read Requests, reviewed Needs, Finding Fits, selected Fit sets,
Need-Fit AssetPacks, previews, BTD scalar volume, BTC quotes/settlement,
rights, delivery, source-to-shares compensation, proof, repair, and
`InterfaceClaim`; it also separates protocol law, product guidance, operator
evidence, investor framing, telemetry, preview, quote, settlement, rights,
delivery, compensation, and repair claims without exposing protected source,
unpaid AssetPack source, prompts, provider payloads, credentials, wallet
private material, private settlement payloads, or value-bearing mainnet
authority.

V46 Gate 8 adds `V46PromotionReadinessReport`,
`.bitcode/v46-promotion-readiness-report.json`,
`generate:v46-promotion-readiness`, `check:v46-promotion-readiness`,
`check:v46-gate8`, and `v46-canon-promotion.yml`. It binds the accepted V46
protocol comprehension artifacts, generated `BITCODE_SPEC_V46_PROVEN.md`
support, V46 promotion scripts, gate/canon workflow posture, package exports,
focused tests, and the promoted `V46` active, `V47` draft runtime posture while
continuing to withhold protected source, unpaid AssetPack source, raw prompts,
provider payloads, credentials, wallet private material, private settlement
payloads, live logs, and value-bearing mainnet operation.

V47 Gate 10 adds `V47PromotionReadinessReport`,
`.bitcode/v47-promotion-readiness-report.json`,
`generate:v47-promotion-readiness`, `check:v47-promotion-readiness`,
`check:v47-gate10`, and `v47-canon-promotion.yml`. It binds the accepted V47
commercial website testnet launch artifacts, generated
`BITCODE_SPEC_V47_PROVEN.md` support, V47 promotion scripts, gate/canon
workflow posture, package exports, focused tests, and the promoted `V47`
active, `V48` draft runtime posture while continuing to withhold protected
source, unpaid AssetPack source, raw prompts, provider payloads, credentials,
wallet private material, private settlement payloads, and value-bearing
mainnet authority.

Exchange is inherited V36 canon: market-wide activity master-detail, buy/sell/
bid/ask/cancel/accept/settle/history flows, AssetPack range trading,
rights-transfer review, pricing/liquidity/wrapper analysis, settlement
reconciliation, dispute/repair/revenue routes, Exchange UX, local/staging
rehearsal, and Exchange-specific proofs.
Website Conversations are promoted V37 canon: conversation sessions, route-local
history, stream UI/event contracts, fullscreen writing mode, source selectors,
conversation-to-Terminal handoff, persistence/privacy/redaction,
telemetry/proof/docs, local/staging rehearsal, and promotion readiness.
V37 Gate 1 opens the Conversations spec family and `check:v37-gate1` over
active V36.
V37 Gate 2 anchors `ConversationSession` route-local identity and history
through the package-owned source-safe generated artifact
`.bitcode/v37-conversation-session-route-history.json`, including create,
restore, branch, retry, redact, and stream operations. Conversation route
history remains route-local projection state; Terminal and the ledger remain
authoritative for transaction, settlement, wallet, Exchange, and BTD ownership
work.
V37 Gate 3 anchors `ConversationStreamEvent` stream rows through the
package-owned source-safe generated artifact
`.bitcode/v37-conversation-stream-event-contract.json`, including model
deltas, tool calls, retrieval summaries, proof roots, retry states, completion
decisions, and error rows. The rich execution log is the stream UI: collapsed
rows show readable status and expanded rows show event ids, proof roots,
redaction posture, prompt/result disclosure posture, fail-closed states, and
source-safe metadata without protected source or raw model payloads.
V37 Gate 4 anchors `ConversationWritingWorkspace` fullscreen drafting through
the package-owned source-safe generated artifact
`.bitcode/v37-conversation-writing-workspace.json`, including Read Request,
Need feedback, AssetPack review note, and Terminal handoff summary modes plus
save, restore, summarize, and handoff actions. Draft recovery is route-local;
emitted summaries and handoff messages are redacted source-safe metadata and
do not claim Terminal, wallet, settlement, or ledger authority.
V37 Gate 5 anchors `ConversationSourceSelector` context policy through the
package-owned source-safe generated artifact
`.bitcode/v37-conversation-source-selector.json`, including repository,
branch, commit, deposit, BTD range, AssetPack preview, document, and prior
conversation selectors governed by account, organization, wallet, rights,
settlement, disclosure, and policy posture.
V37 Gate 6 anchors `ConversationTerminalHandoff` transaction handoff through
the package-owned source-safe generated artifact
`.bitcode/v37-conversation-terminal-handoff.json`, including Depositing,
Reading, Finding Fits, Exchange, settlement, and delivery handoff workflows.
Conversation handoff preserves transaction id, repository anchor, source
selector refs, source-safe summary, policy result, Terminal route, transaction
detail, proof roots, and event ids while Terminal remains the ledger, wallet,
settlement, and delivery cockpit.
V37 Gate 7 anchors `ConversationPersistencePrivacyRedaction` durable
conversation storage privacy through the package-owned source-safe generated
artifact `.bitcode/v37-conversation-persistence-privacy-redaction.json`.
It separates public, user-visible, organization-visible, buyer-visible,
reviewer-visible, and operator-only visibility tier data while covering
persist message, restore history, export, delete, retention, replay, and
incident repair. The API storage path redacts message content, attachment
metadata, execution input, and execution metadata before persistence, and the
conversation UI exposes source-safe privacy previews without protected source,
secrets, wallet private material, or unpaid AssetPack source.
V37 Gate 8 anchors `ConversationTelemetryProofHooks` through the
package-owned source-safe generated artifact
`.bitcode/v37-conversation-telemetry-proof-hooks.json`. Conversation sessions,
messages, streams, tools, source selectors, Terminal handoffs, retries,
errors, and completions now bind to dashboard panels, runbook ids,
correlation ids, proof roots, redaction posture, and source-safe visibility
tiers. API stream rows and the conversation UI expose telemetry proof posture
without protected prompts, protected source, raw provider responses, provider
tokens, wallet private material, settlement private payloads, or unpaid
AssetPack source.
V37 Gate 9 anchors `ConversationRehearsal` through the package-owned
source-safe generated artifact `.bitcode/v37-conversation-rehearsal.json`.
Local and staging-testnet rehearsals exercise chat, streaming, writing, source
selector, Terminal handoff, restore, retry, redaction, and error flows.
Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots,
and value-bearing mainnet blocking are visible through source-safe proof
metadata and the fullscreen Rehearsal Proof panel.

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible.
V37 Gate 10 anchors `ConversationPromotionReadinessReport` through the
package-owned source-safe generated artifact
`.bitcode/v37-promotion-readiness-report.json`. It covers every V37
Conversation artifact, generated `BITCODE_SPEC_V37_PROVEN.md` support,
`v37-canon-promotion.yml`, promotion dry-run support, and runtime posture
preparation from V36 active / V37 draft to V37 active / draft V38 without
serializing credentials, protected source, raw protected prompts, unpaid
AssetPack source, or wallet private material.
Promotion hardening also keeps Conversation persistence and telemetry redaction
on bounded private-key PEM scanning with closed/unclosed PEM tests so static
security findings block promotion instead of being waived.
V38 Gate 1 opened the inference stack draft family and `check:v38-gate1` over
active V37. V38 promoted commercial inference correctness: PTRR agents,
Plan/Try/Refine/Retry steps, `FailsafeGenerationSequence`,
`ThricifiedGeneration`, prompt registry composition, prompt and PromptPart
benchmarking, tool doc-comment prompts, source-safe inference telemetry,
`ReadNeedComprehensionSynthesis`, and `ReadFitsFindingSynthesis` depository
search. Finding Fits remains plural and depository-wide, preserving the active
`text-embedding-3-small`, 1536 dimension, cosine `match_deliverable_vectors`
embedding policy until a tested migration exists.
V38 Gate 2 adds the package-backed `V38InferenceSurfaceInventory` and generated
source-safe artifact `.bitcode/v38-inference-surface-inventory.json`. The
inference surface inventory records `ReadNeedComprehensionSynthesis`,
`ReadFitsFindingSynthesis`, Website Conversations, tool-definition prompts,
interface entrypoints, prompt registry coverage, and execution primitives as
`source-safe-inference-surface-metadata`; its current count contract is 52 PTRR
steps, 156 Failsafe/Thricified chains, and 468 provider-call slots. Use
`pnpm run generate:v38-inference-surface-inventory`,
`pnpm run check:v38-inference-surface-inventory`, and
`pnpm run check:v38-gate2` before closing the gate.
V38 Gate 3 adds the package-backed `V38PtrrFailsafeThricifiedStack` and
generated source-safe artifact `.bitcode/v38-ptrr-failsafe-thricified-stack.json`.
The stack contract records `factoryPTRRAgent`, Plan/Try/Refine/Retry,
`FailsafeGenerationSequence`, `ThricifiedGeneration`, substep prompt/context
telemetry, step-owned tool postprocess boundaries, and Gate 2's 52 PTRR steps /
156 Failsafe sequences / 156 ThricifiedGeneration chains / 468 provider-call
slots as `source-safe-ptrr-failsafe-thricified-stack-metadata`. Use
`pnpm run generate:v38-ptrr-failsafe-thricified-stack`,
`pnpm run check:v38-ptrr-failsafe-thricified-stack`, and
`pnpm run check:v38-gate3` before closing the gate.
V38 Gate 4 adds the package-backed `V38PromptBenchmarkReport` and generated
source-safe artifact `.bitcode/v38-prompt-benchmark-report.json`. The Prompt
benchmarking report covers benchmark infrastructure, generic PTRR/Failsafe/
ThricifiedGeneration PromptParts, `ReadNeedComprehensionSynthesis`
PromptParts, `ReadFitsFindingSynthesis` PromptParts, complete Reading Prompt
registries, Website Conversation Prompts, and DocCodeToolPrompt surfaces as
`source-safe-prompt-benchmark-metadata`. The current source-safe count contract
is 7 rows, 13 fixtures, 24 typed-output quality expectations, 38 source
predicates, 443 PromptPart doc-comments, 39 complete Prompt doc-comments, 465
benchmark definitions, 275 PromptPart exports, and 85 Prompt constructions.
Prompt benchmarking artifacts never serialize raw prompt text or raw provider
responses.
Use `pnpm run generate:v38-prompt-benchmark-report`,
`pnpm run check:v38-prompt-benchmark-report`, and `pnpm run check:v38-gate4`
before closing the gate.
V38 Gate 5 adds the package-backed `V38InferenceTelemetryDisclosureReport` and
generated source-safe artifact `.bitcode/v38-disclosure-boundary-report.json`.
The inference telemetry disclosure report covers pipeline phase, PTRR agent
step, FailsafeGenerationSequence, ThricifiedGeneration, tool execution, prompt
template interpolation, raw provider response root, parsed typed output shape,
schema verdict, retry, repair, and stream UI/storage projection rows as
`source-safe-inference-telemetry-disclosure-metadata`. Its disclosure tier
contract keeps raw provider response content, raw protected prompts, protected
source, unpaid AssetPack source, credentials, private wallet material, and
private settlement payloads out of public or reader-visible streams while still
surfacing roots, presence flags, typed shapes, and proof metadata for audit.
Use `pnpm run generate:v38-inference-telemetry-disclosure-report`,
`pnpm run check:v38-inference-telemetry-disclosure-report`, and
`pnpm run check:v38-gate5` before closing the gate.
V38 Gate 6 adds the package-backed
`V38ReadNeedComprehensionInferenceHardening` report and generated source-safe
artifact `.bitcode/v38-read-need-comprehension-inference-hardening.json`.
The ReadNeedComprehensionSynthesis hardening report binds produced Needs to
`ReadNeedComprehensionSynthesisInferenceReceipt` metadata covering 4 phases, 4
PTRR agents, 16 PTRR steps, 48 Failsafe sequences, 48
ThricifiedGeneration chains, 144 provider-call slots, prompt/template ids,
interpolation keys, output schemas, telemetry ids, and roots. The receipt keeps
protected source, raw provider response content, unpaid AssetPack source,
credentials, private wallet material, and private settlement payloads private
or blocked while preserving resynthesis-with-feedback and accepted-Need-gated
Finding Fits admission.
Use `pnpm run generate:v38-read-need-comprehension-inference-hardening`,
`pnpm run check:v38-read-need-comprehension-inference-hardening`, and
`pnpm run check:v38-gate6` before closing the gate.
V38 Gate 7 adds the package-backed `V38ReadFitsFindingSearchEmbeddings` report
and generated source-safe artifact
`.bitcode/v38-read-fits-finding-search-embeddings.json`. The Finding Fits
report binds `ReadFitsFindingSynthesisSearchReceipt` metadata across accepted
Need admission, query planning, many-fit depository discovery, embedding
policy, threshold ranking, selected-fit provenance, and source-safe receipt
rows. Its count contract is 7 phases, 8 PTRR agents, 32 PTRR steps, 96
Failsafe sequences, 96 ThricifiedGeneration chains, 288 provider-call slots, 4
tool contracts, 7 search channels, and default 12 above-threshold selected-fit
carryforward slots. The active vector policy remains OpenAI
`text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors`,
and no protected source, raw provider response content, unpaid AssetPack source,
credentials, private wallet material, or private settlement payloads may enter
the source-safe receipt.
Use `pnpm run generate:v38-read-fits-finding-search-embeddings`,
`pnpm run check:v38-read-fits-finding-search-embeddings`, and
`pnpm run check:v38-gate7` before closing the gate.
V38 Gate 8 adds the package-backed
`V38AssetPackSynthesisEconomicTraceability` report and generated source-safe
artifact `.bitcode/v38-assetpack-synthesis-economic-traceability.json`. The
AssetPack handoff report binds selected fit provenance into AssetPack
synthesis, source-safe preview, deterministic share-to-fee BTC quote, BTD
mint/read/rights receipts, source-to-shares contributor compensation,
settlement unlock, post-settlement pull-request delivery, ledger/database
reconciliation, repair posture, and host evidence projection without
exposing protected source, raw provider response content, unpaid AssetPack
source, credentials, wallet private material, or private settlement payloads.
Use `pnpm run generate:v38-assetpack-synthesis-economic-traceability`,
`pnpm run check:v38-assetpack-synthesis-economic-traceability`, and
`pnpm run check:v38-gate8` before closing the gate.
V38 Gate 9 adds the package-backed
`V38ConversationToolPromptInferenceParity` report and generated source-safe
artifact `.bitcode/v38-conversation-tool-prompt-inference-parity.json`.
The parity report binds Website Conversation comprehensive and quick-response
variations to PTRR/Failsafe/Thricified inference, prompt registries, typed
schemas, source-safe stream telemetry, rich execution-log rendering,
DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App
doc-code prompt carriers, read-access and organization-authority admission,
and interface no-bypass posture without exposing protected source, raw prompt
text, raw provider response content, unpaid AssetPack source, credentials,
wallet private material, or private settlement payloads.
Use `pnpm run generate:v38-conversation-tool-prompt-inference-parity`,
`pnpm run check:v38-conversation-tool-prompt-inference-parity`, and
`pnpm run check:v38-gate9` before closing the gate.
V38 Gate 10 adds the package-backed
`V38LocalStagingInferenceDepositorySearchRehearsal` report and generated
source-safe artifact
`.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`.
The rehearsal report binds local and staging-testnet lanes to Vercel Sandbox
harness opt-in, bounded real-inference preflight, Supabase readback validation,
ReadNeedComprehensionSynthesis, ReadFitsFindingSynthesis, many-fit depository
search, source-safe AssetPack preview, telemetry streaming/readback,
ledger/database synchronization posture, and blocked production-mainnet
value-bearing admission without exposing protected source, raw prompt text, raw
provider response content, live rehearsal log payloads, unpaid AssetPack
source, credentials, wallet private material, or private settlement payloads.
Use `pnpm run generate:v38-local-staging-inference-depository-search-rehearsal`,
`pnpm run check:v38-local-staging-inference-depository-search-rehearsal`, and
`pnpm run check:v38-gate10` before closing the gate.
V38 Gate 11 adds the package-backed `V38InferencePromotionReadinessReport`
and generated source-safe artifact `.bitcode/v38-promotion-readiness-report.json`.
The promotion readiness report binds all V38 inference artifacts,
`BITCODE_SPEC_V38_PROVEN.md` support, `v38-canon-promotion.yml`, promotion
command dry-run support, gate/canon workflow posture, active V38 / draft V39
runtime preparation, and blocked value-bearing mainnet posture without exposing
protected source, raw protected prompts, raw provider responses, unpaid
AssetPack source, credentials, wallet private material, or private settlement
payloads. Use `pnpm run generate:v38-promotion-readiness`,
`pnpm run check:v38-promotion-readiness`, and `pnpm run check:v38-gate11`
before closing the gate.
V39 Gate 1 opens the commercial Reading readiness draft family and
`check:v39-gate1` over active V38. V39 focuses on Depository supply indexing,
the five-step enterprise Reading UX, ReadNeed review/resynthesis,
ReadFitsFinding runtime and replay, source-safe AssetPack preview and
deterministic BTC quote, settlement, BTD rights transfer, post-settlement
delivery, ledger/database/storage synchronization, telemetry/repair, interface
parity, local/staging rehearsal, and promotion readiness.
V39 Gate 11 adds the package-backed `V39CommercialReadingPromotionReadinessReport`
and generated source-safe artifact `.bitcode/v39-promotion-readiness-report.json`.
The promotion readiness report binds all V39 commercial Reading artifacts,
`BITCODE_SPEC_V39_PROVEN.md` support, `v39-canon-promotion.yml`, promotion
command dry-run support, gate/canon workflow posture, active V39 / draft V40
runtime preparation, and blocked value-bearing mainnet posture without exposing
protected source, raw protected prompts, raw provider responses, unpaid
AssetPack source, credentials, wallet private material, or private settlement
payloads. Use `pnpm run generate:v39-promotion-readiness`,
`pnpm run check:v39-promotion-readiness`, and `pnpm run check:v39-gate11`
before closing the gate.
V40 Gate 1 opens the exhaustive commercial application testing draft family and
`check:v40-gate1` over active V39. V40 focuses on browser E2E, visual and
screenshot proof, accessibility, responsive behavior, API and route integration,
Reading pipeline integration, Conversation and Terminal integration,
ledger/database/storage/wallet/delivery synchronization, local/staging rehearsal,
unit coverage across packages and primitives, prompt benchmark smoke, and V41
prompt-program readiness.
V39 Gate 2 adds the package-owned `DepositorySupplyIndex` and source-safe
generated artifact `.bitcode/v39-depository-supply-indexing.json`. Deposited
source supply is normalized into rights-aware records with repository, branch,
commit, proof, measurement, reconciliation readback, BTD range, depositor
wallet, source-safe search documents, active embedding/vector projection,
Supabase storage readback posture, deterministic repair actions, and a
source-safe Finding Fits handoff. Use `pnpm run generate:v39-depository-supply-indexing`
and `pnpm run check:v39-gate2` before closing the gate.
V39 Gate 3 adds the package-owned `TerminalEnterpriseReadingUxState` and
source-safe generated artifact `.bitcode/v39-enterprise-reading-ux-state.json`.
Terminal now owns the five-stage enterprise Reading state machine: request
Read, review synthesized Need, request Finding Fits, review source-safe
AssetPack preview, and buy AssetPack/settle. Conversation handoffs may pass
only source-safe `readingStage` intent, Terminal parses it as posture, and the
rich execution stream remains the live Reading pipeline log. Use
`pnpm run generate:v39-enterprise-reading-ux-state` and
`pnpm run check:v39-gate3` before closing the gate.
V39 Gate 4 adds the package-owned `ReadNeedReviewResynthesisRuntime` and
source-safe generated artifact `.bitcode/v39-read-need-review-resynthesis.json`.
ReadNeedComprehensionSynthesis now projects Read Requests, synthesized Needs,
feedback history, resynthesis attempts, Need measurements, accepted-Need
admission, rejected-Need posture, and source-safe telemetry receipts into
PipelineExecution-compatible storage records. Finding Fits remains blocked
until an accepted Need is present. Use
`pnpm run generate:v39-read-need-review-resynthesis` and
`pnpm run check:v39-gate4` before closing the gate.
V39 Gate 5 adds the package-owned `ReadFitsFindingRuntime` and source-safe
generated artifact `.bitcode/v39-read-fits-finding-runtime.json`.
ReadFitsFindingSynthesis now projects accepted-Need admission, source-safe
query plans, seven search channels, many-candidate ranking, selected-fit
provenance, active embedding policy, replay receipts, repair posture, and
telemetry receipts into PipelineExecution-compatible storage records. Use
`pnpm run generate:v39-read-fits-finding-runtime` and
`pnpm run check:v39-gate5` before closing the gate.
V39 Gate 6 adds the package-owned `AssetPackPreviewBoundary` and source-safe
generated artifact `.bitcode/v39-assetpack-preview-quote-boundary.json`.
AssetPack preview now projects source-safe measurements, selected-fit
provenance, deterministic share-to-fee BTC quote, disclosure leak review,
settlement instructions, withheld pull-request delivery posture, replay
receipt, and repair posture without exposing unpaid source-bearing AssetPack
content. Use `pnpm run generate:v39-assetpack-preview-quote-boundary` and
`pnpm run check:v39-gate6` before closing the gate.
V39 Gate 7 adds the package-owned `AssetPackSettlementRightsDeliveryBoundary`
and source-safe generated artifact `.bitcode/v39-settlement-rights-delivery.json`.
The boundary projects BTC payment observation/finality, source-to-shares
compensation, BTD rights transfer and paid read receipts, settlement unlock,
ledger/database/object-storage reconciliation, delivery unlock, replay, and
repair posture without serializing protected source, private wallet material,
private settlement payloads, credentials, raw protected prompts, raw provider
responses, or unpaid AssetPack source. Use
`pnpm run generate:v39-settlement-rights-delivery` and
`pnpm run check:v39-gate7` before closing the gate.
V39 Gate 8 adds the package-owned
`ReadingOperationalTelemetryRepairReadback` and source-safe generated artifact
`.bitcode/v39-operational-telemetry-repair-readback.json`. Reading now
projects phase, PTRR agent, PTRR step, Failsafe, ThricifiedGeneration,
ToolExecution, storage, ledger, wallet, delivery, UI, and repair events into
operator readback with proof roots, runbook hooks, prompt/result disclosure
posture, and rich execution-log rendering. Use
`pnpm run generate:v39-operational-telemetry-repair-readback` and
`pnpm run check:v39-gate8` before closing the gate.
V39 Gate 9 adds the package-owned `ReadingInterfaceProductParity` and
source-safe generated artifact
`.bitcode/v39-interface-conversation-product-parity.json`. Terminal,
Conversation, public API, MCP API, ChatGPT App, and package consumers now share
the same Reading authority: accepted Need, Finding Fits, source-safe preview,
settlement unlock, BTD rights, and delivery boundaries cannot be bypassed, and
source-bearing delivery remains locked until settlement and rights transfer.
Use `pnpm run generate:v39-interface-conversation-product-parity` and
`pnpm run check:v39-gate9` before closing the gate.
V39 Gate 10 adds the package-owned `ReadingLocalStagingRehearsal` and
source-safe generated artifact
`.bitcode/v39-local-staging-reading-rehearsal.json`. Local and
staging-testnet lanes now rehearse the five Reading stages, many-fit
Depository search, source-safe preview, settlement/BTD rights delivery, rich
telemetry readback, ledger/database/storage synchronization, and blocked
value-bearing mainnet admission. Staging-testnet is bound to Supabase project
`tkpyosihuouusyaxtbau`. Use
`pnpm run generate:v39-local-staging-reading-rehearsal` and
`pnpm run check:v39-gate10` before closing the gate.
V36 Gate 2 anchors market-wide activity through the package-owned
`ExchangeActivityBook` and the source-safe generated artifact
`.bitcode/v36-exchange-activity-book.json`, including listing, bid, ask,
cancellation, acceptance, settlement, repair, revenue route, and history rows.
The activity detail never exposes protected source or unpaid AssetPack content.
V36 Gate 3 anchors market action through package-owned `ExchangeIntent` and
`ExchangeOrder` contracts plus the source-safe generated artifact
`.bitcode/v36-exchange-intent-order-contracts.json`, including buy, sell, bid,
ask, cancel, accept, settle, and history transitions. Each transition names
actor principal, organization role, wallet posture, authority proof,
idempotency key, policy decision, and fail-closed result; order history is
replayable without private wallet material or secrets.
V36 Gate 4 anchors rights-transfer review through package-owned
`ExchangeRightsTransferPreview` and the source-safe generated artifact
`.bitcode/v36-exchange-rights-transfer-review.json`, including BTD range
identity, current owner, requested buyer, rights scope, settlement unlock,
disclosure limit, and owner-read, licensed-read, and blocked transfer states.
AssetPack source is hidden until paid settlement and rights transfer are
complete.
V36 Gate 5 anchors pricing through package-owned `ExchangePricingQuote` and the
source-safe generated artifact `.bitcode/v36-pricing-liquidity-fee-quote.json`.
The quote covers BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, and
quote root. The source-safe verdict is
`source-safe-exchange-pricing-quote-metadata`; wrapper analysis cannot make BTD range cells fungible chain-of-record assets, and underpayment, overpayment, stale quote, or unsupported network posture fails closed.
V36 Gate 6 anchors settlement through package-owned `ExchangeSettlementReceipt`
and the source-safe generated artifact
`.bitcode/v36-exchange-settlement-reconciliation.json`.
The receipt binds payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id.
The source-safe verdict is
`source-safe-exchange-settlement-reconciliation-metadata`; observers and repair jobs reconcile database projections to ledger truth, and settlement finality and delivery are auditable.
V36 Gate 7 anchors dispute repair and revenue routing through package-owned
`ExchangeDisputeRepairCase`, `ExchangeRevenueRoute`, and the source-safe
generated artifact `.bitcode/v36-exchange-dispute-repair-revenue-route.json`.
`ExchangeDisputeRepairCase` covers stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch.
`ExchangeRevenueRoute` covers depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof.
The source-safe verdict is
`source-safe-exchange-dispute-repair-revenue-route-metadata`; runbooks and repair commands are source-safe and proof-rooted.
V36 Gate 8 anchors Exchange route usability through package-owned
`ExchangeUxProof` and the source-safe generated artifact
`.bitcode/v36-exchange-ux-proof.json`.
`ExchangeUxProof` covers market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state.
Terminal can hand off to Exchange without losing transaction context.
collapsed UI gives readable status and expanded UI exposes source-safe detail.
Exchange telemetry dashboards remain source-safe and proof-rooted.
The source-safe verdict is `source-safe-exchange-ux-proof-metadata`.
V36 Gate 9 anchors Exchange rehearsal through package-owned
`ExchangeRehearsal` and the source-safe generated artifact
`.bitcode/v36-exchange-rehearsal.json`.
`ExchangeRehearsal` proves that local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows.
It proves that rehearsal logs/screenshots are source-safe.
It also proves that ledger/database synchronization and value-bearing mainnet blocking are visible.
The source-safe verdict is `source-safe-exchange-rehearsal-metadata`.
V36 Gate 10 anchors Exchange promotion readiness through package-owned
`ExchangePromotionReadinessReport` and the source-safe generated artifact
`.bitcode/v36-promotion-readiness-report.json`.
`ExchangePromotionReadinessReport` covers every V36 Exchange artifact, V36 proof
appendix generation, `v36-canon-promotion.yml`, promotion dry-run support,
workflow posture, and runtime promotion from active V35 / draft V36 to active
V36 / draft V37.
Run `pnpm run check:v36-gate10` to validate the Gate 10 closure contract.
Promoted V35 closure owns telemetry and documentation depth over promoted V34:
internal codebase docs, public `/docs`, telemetry taxonomy, dashboards, alert
runbooks, incident response, operator escalation, documentation QA, developer
onboarding, operator guides, and testnet-rollout readiness.
V35 Gate 2 now anchors documentation surfaces through the package-owned
`DocumentationSurfaceCatalog` and the source-safe generated artifact
`.bitcode/v35-documentation-surface-catalog.json`.
V35 Gate 3 now anchors telemetry event families through the package-owned
`TelemetryTaxonomyCatalog` and the source-safe generated artifact
`.bitcode/v35-telemetry-taxonomy-catalog.json`.
V35 Gate 4 now anchors public usage guidance through the package-owned
`PublicDocsUsageGuideCatalog` and the source-safe generated artifact
`.bitcode/v35-public-docs-usage-guides.json`, including the public docs
disclosure boundary that blocks protected source, raw protected prompts, wallet
private material, provider tokens, and unpaid AssetPack source.
V35 Gate 5 now anchors operator action through the package-owned
`OperatorRunbookCatalog` and the source-safe generated artifact
`.bitcode/v35-operator-runbook-catalog.json`, binding telemetry-derived
dashboard panels, alerts, runbooks, incident classes, escalation paths,
commands, proof roots, repair references, and post-incident documentation
updates.
V35 Gate 6 now anchors documentation QA through the package-owned
`DocsQaAlignmentReport` and the source-safe generated artifact
`.bitcode/v35-docs-qa-alignment-report.json`, failing closed on stale tokens,
missing source roots, missing generated artifacts, unsupported disclosure
claims, or docs/proof/workflow drift.
V35 Gate 7 now anchors rollout guidance through the package-owned
`TestnetRolloutReadinessGuide` and the source-safe generated artifact
`.bitcode/v35-testnet-rollout-readiness-guide.json`, covering contributors,
local development, operators, enterprise readers, depositors, interface
consumers, environment lanes, wallet/settlement caveats, known blockers, and
rehearsal evidence while keeping value-bearing mainnet visible and blocked.
V35 Gate 8 now anchors interface integration through the package-owned
`TelemetryDocumentationInterfaceIntegration` and the source-safe generated
artifact `.bitcode/v35-telemetry-documentation-interface-integration.json`,
binding Terminal, Auxillaries, API, MCP API, ChatGPT App, package READMEs,
internal docs, and public docs to event ids, proof roots, docs links, runbook
links, and redaction posture without exposing protected source, secrets, wallet
private material, or unpaid AssetPack source.
V35 Gate 9 now anchors rehearsal through the package-owned
`LocalStagingTelemetryDocumentationRehearsal` and the source-safe generated
artifact `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json`,
proving local/staging-testnet documentation discovery, telemetry event
emission, dashboard/runbook lookup, docs QA, incident drills, redacted
screenshot/log roots, source-safe proof-root review, and visible blocked
value-bearing mainnet posture.

The protocol demonstration remains the minimal deterministic reference for the
same protocol. Commercial code may mount or compare against demonstration
runtime facts, but commercial source should name the owning product surface
directly: Terminal, Exchange, Auxillaries, Conversations, API, MCP, or ChatGPT
App.

## Repository Rules

- Ground new work in `BITCODE_SPEC.txt` and the active specification family.
- Treat `_legacy/` as non-canonical.
- Do not add explicit versioned source routes or compatibility source names.
- Update source in-place to match the active canon and current draft target.
- Keep specification notes, QA ledgers, tests, and implementation synchronized.

## Contributor Workflow

The default branch is protected by the active `Bitcode Core Contributions`
ruleset. Direct pushes to `main` are not part of the normal workflow; expect
them to be rejected because changes must arrive through pull requests and
verified signatures.

Use a version branch and gate-numbered branches:

1. Create one base branch per draft target, such as `version/v39`.
2. Create scoped gate branches from the version branch. Prefix every gate branch
 with the gate number, for example `v39/gate-1-commercial-reading-roadmap-opening`
 or `v39/gate-5-read-fits-finding-runtime-replay`.
3. Group related work into clear commits with quality commit messages whose
 titles and bodies describe the proof, implementation, or documentation
 change.
4. Continue on the gate branch until that gate's acceptance criteria are
 implemented, specified, tested, documented, committed, pushed, and ready for
 closure review.
5. Open pull requests from gate branches into the version branch as gates close.
 Title gate PRs with the uppercase version and gate prefix plus a topical
 title, for example `V39 Gate 5: ReadFitsFinding Runtime And Replay`.
6. Open the version branch back into `main` only after all gates close and the
 version is formally promoted as canon.

Gate pull requests into `version/**` run the Bitcode gate-quality workflow:
active/draft canon checks, casing/import checks, relevant package typechecks and
Jest suites, protocol-demonstration QA, and diff hygiene. The repository-wide
canon quality workflow stays green during draft work by checking active/draft
posture and promoted-spec proof posture, while full promoted-suite closure is
reserved for the version promotion workflow. Version pull requests into `main`
run the version promotion workflow. For V38, `v38-canon-promotion.yml` validates the
inference stack, Reading pipeline, depository-search, prompt benchmark,
telemetry, and rehearsal posture, generate `BITCODE_SPEC_V38_PROVEN.md`, and
commit promotion artifacts plus the `BITCODE_SPEC.txt` pointer change from
`V37` to `V38` on the version branch.
For V39, Gate 1 opens `version/v39` and the gate-quality posture through
`pnpm run check:v39-gate1` before later gates add generated commercial Reading
artifacts and the V39 promotion workflow.
V39 Gate 2 is wired through `pnpm run check:v39-gate2`; V39 Gate 3 is wired
through `pnpm run check:v39-gate3` and its generated
`.bitcode/v39-enterprise-reading-ux-state.json` artifact. V39 Gate 4 is wired
through `pnpm run check:v39-gate4`; V39 Gate 5 is wired through
`pnpm run check:v39-gate5` and its generated
`.bitcode/v39-read-fits-finding-runtime.json` artifact. V39 Gate 6 is wired
through `pnpm run check:v39-gate6` and its generated
`.bitcode/v39-assetpack-preview-quote-boundary.json` artifact. V39 Gate 7 is
wired through `pnpm run check:v39-gate7` and its generated
`.bitcode/v39-settlement-rights-delivery.json` artifact. V39 Gate 8 is wired
through `pnpm run check:v39-gate8` and its generated
`.bitcode/v39-operational-telemetry-repair-readback.json` artifact. V39 Gate 9
is wired through `pnpm run check:v39-gate9` and its generated
`.bitcode/v39-interface-conversation-product-parity.json` artifact.
For V40, Gate 1 opens `version/v40` and the gate-quality posture through
`pnpm run check:v40-gate1` before later gates add generated exhaustive testing
artifacts and the V40 promotion workflow.
V40 Gate 2 adds the package-backed `V40TestInventoryCoverageMatrix`, generated
`.bitcode/v40-test-inventory-coverage-matrix.json`, and `check:v40-gate2` to
inventory unit, API/route, Reading pipeline, Conversation/Terminal,
browser/visual/accessibility/responsive, ledger/database/storage/wallet/delivery,
local/staging, prompt benchmark smoke, demonstration, and CI/promotion testing
surfaces before deeper V40 gates close their implementations.
V40 Gate 3 adds the package-backed `V40UnitCoverageInventory`, generated
`.bitcode/v40-unit-coverage-inventory.json`, and `check:v40-gate3` to close
critical unit coverage for packages, primitives, isolated implementations,
Reading AssetPack units, interface helpers, and demonstration boundary tests.
V40 Gate 4 adds the package-backed `V40ApiIntegrationContracts`, generated
`.bitcode/v40-api-integration-contracts.json`, and `check:v40-gate4` to close
source-safe API, UAPI, MCP, ChatGPT App, persistence, authorization, and
response-schema route integration contract coverage before later browser and
pipeline gates.
V40 Gate 5 adds the package-backed `V40ReadingPipelineIntegrationCoverage`,
generated `.bitcode/v40-reading-pipeline-integration-coverage.json`, and
`check:v40-gate5` to close source-safe integration coverage for
`ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, many-fit
Depository search, PTRR agent wiring, AssetPack preview/settlement/delivery,
telemetry/readback, Terminal hosts, pipeline primitives, hosts, and local
staging rehearsal linkage.
V40 Gate 6 adds the package-backed `V40ConversationTerminalIntegration`,
generated `.bitcode/v40-conversation-terminal-integration.json`, and
`check:v40-gate6` to close source-safe integration coverage for Conversation
handoff route contracts, Conversation stream-to-rich-log projection,
Conversation route/API persistence and branch contracts, writing/source
selector handoff, Terminal Reading state readback, Terminal host log
streaming, transaction-cockpit authority boundaries, and rehearsal/docs parity.
V40 Gate 7 adds the package-backed `V40BrowserE2eVisualProof`, generated
`.bitcode/v40-browser-e2e-visual-proof.json`, and `check:v40-gate7` to close
source-safe browser proof coverage for Terminal, Conversations, Auxillaries,
Exchange, Docs, responsive viewport overflow, screenshot/trace baselines, and
keyboard/landmark/status accessibility. The current app browser proof contract
binds five product surfaces, thirteen route states, eighteen interaction
states, four canonical viewports, and no screenshot-only approval.
V40 Gate 8 adds the package-backed `V40LedgerStorageSync`, generated
`.bitcode/v40-ledger-storage-sync.json`, and `check:v40-gate8` to close
source-safe synchronization proof for BTC fee finality, BTD read-right
projection, source-to-shares compensation, ledger/database/object-storage
reconciliation, storage locks, no-custody wallet authority, Terminal readback,
repair posture, and post-settlement pull-request delivery. The current app
ledger/storage sync contract keeps source-bearing AssetPack delivery invisible
until settlement, BTD rights, compensation, and projection readbacks agree.
V40 Gate 9 adds the package-backed `V40LocalStagingRehearsalAutomation`,
generated `.bitcode/v40-local-staging-rehearsal-automation.json`,
`rehearse:v40-local-staging`, and `check:v40-gate9` to close source-safe local
and staging-testnet rehearsal automation. Operator receipts use lane-bound
secret-family readiness rather than secret values, are dry-run by default, bind
staging-testnet to Supabase project `tkpyosihuouusyaxtbau`, and require explicit
live execution opt-in before delegating to the Vercel Sandbox AssetPack host.
V40 Gate 10 adds the package-backed `V40PromptBenchmarkSmokeV41Readiness`,
generated `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`,
`prompt-benchmark:smoke`, and `check:v40-gate10` to close source-safe PromptPart
and composed Prompt benchmark smoke coverage before V41. The artifact binds the
package benchmark report command, deterministic smoke receipts, V38 prompt
benchmark inventory evidence, workflow wiring, and the V41 prompt-program
worklist without rewriting prompt content or serializing raw prompt/provider
payloads.
V40 Gate 11 adds the package-backed `V40PromotionReadinessReport`, generated
`.bitcode/v40-promotion-readiness-report.json`,
`generate:v40-promotion-readiness`, `check:v40-promotion-readiness`,
`check:v40-gate11`, and `.github/workflows/v40-canon-promotion.yml` to close
canonical promotion readiness. The report binds every V40 testing artifact,
`BITCODE_SPEC_V40_PROVEN.md`, gate/canon workflow posture, promotion scripts,
active V40 / draft V41 runtime preparation, and source-safe value-bearing
mainnet blocking without serializing secrets or protected payloads.
V38 Gates 1 through 11 are wired through `pnpm run check:v38-gate1`,
`pnpm run check:v38-gate2`, `pnpm run check:v38-gate3`,
`pnpm run check:v38-gate4`, `pnpm run check:v38-gate5`,
`pnpm run check:v38-gate6`, `pnpm run check:v38-gate7`,
`pnpm run check:v38-gate8`, `pnpm run check:v38-gate9`, and
`pnpm run check:v38-gate10`, and `pnpm run check:v38-gate11`. The promoted V37
gate closure remains reproducible through
`pnpm run check:v37-gate1`; V37 Gate 2 is wired through
`pnpm run check:v37-gate2` and
`pnpm run check:v37-conversation-session-route-history`; V37 Gate 3 is wired
through `pnpm run check:v37-gate3`; and V37 Gate 4 is wired through
`pnpm run check:v37-gate4` and
`pnpm run check:v37-conversation-writing-workspace`. V37 Gate 5 is wired
through `pnpm run check:v37-gate5` and
`pnpm run check:v37-conversation-source-selector`, covering source-safe
repository, branch, commit, deposit, BTD range, AssetPack preview, document,
and prior conversation selectors with account, organization, wallet, rights,
settlement, disclosure, and policy posture. V37 Gate 9 is wired through
`pnpm run check:v37-gate9` and `pnpm run check:v37-conversation-rehearsal`,
covering `ConversationRehearsal`,
`source-safe-conversation-rehearsal-metadata`, local/staging rehearsal proof,
source-safe screenshots/logs, route/UI checks, telemetry roots, and blocked
value-bearing mainnet posture. V37 Gate 10 adds promotion readiness before
the V37 promotion workflow can promote; it is wired through
`pnpm run check:v37-gate10`, `pnpm run check:v37-promotion-readiness`, and
[v37-canon-promotion.yml](.github/workflows/v37-canon-promotion.yml).
The promoted V35 closure remains reproducible through `pnpm run check:v35-gate10`
and [v35-canon-promotion.yml](.github/workflows/v35-canon-promotion.yml).
The application CI workflow uses the root pnpm workspace install, runs uapi
lint/typecheck/build plus mocked Jest coverage, and keeps heavier legacy scans
explicitly opt-in until their catalogs are refurbished: set
`BITCODE_ENABLE_GATE_BROWSER_PROOF`, `ENABLE_FULL_DB_E2E`, `ENABLE_STORYBOOK_BUILD`, `ENABLE_SUPER_LINTER`, or
`ENABLE_ADVANCED_CODEQL` when those checks are intentionally part of a branch
or promotion validation.

## Key Surfaces

- [BITCODE_SPEC.txt](BITCODE_SPEC.txt) is the canonical version pointer.
- [BITCODE_SPEC_V43.md](BITCODE_SPEC_V43.md) is the active promoted spec family.
- [BITCODE_SPEC_V44.md](BITCODE_SPEC_V44.md) is the active draft target.
- [BITCODE_SPEC_V44_PARITY_MATRIX.md](BITCODE_SPEC_V44_PARITY_MATRIX.md) tracks V44 gate parity.
- [uapi/README.md](uapi/README.md) documents the commercial website/API surface.
- [uapi/app/packs](uapi/app/packs) is the PackActivity and portfolio inspection route.
- [uapi/app/read](uapi/app/read) is the Reading route.
- [uapi/app/deposit](uapi/app/deposit) is the Depositing route.
- [uapi/app/auxillaries/README.md](uapi/app/auxillaries/README.md) documents Auxillaries.
- [protocol-demonstration/README.md](protocol-demonstration/README.md) documents
 the deterministic demonstration.

## Repository Map

- `uapi/`: commercial website, API routes, Terminal, Exchange, Auxillaries,
 Conversations, public docs, and shared UI systems.
- `protocol-demonstration/`: deterministic Bitcode demonstration, proof
 generator inputs, and standalone validation runtime.
- `packages/*`: protocol, storage, inference, conversation, BTD, API, MCP,
 ChatGPT App, and integration package owners.
- `.bitcode/`: generated proof, checkpoint, and spec-family artifacts.

## Common Commands

Mock-mode commercial review:

```bash
cd uapi
NEXT_PUBLIC_MASTER_MOCK_MODE=true \
NEXT_PUBLIC_ENABLE_MOCKS=true \
NEXT_PUBLIC_MOCK_USER_ORBITAL=true \
NEXT_PUBLIC_MOCK_USER_ORBITAL_SCENARIO=demo \
NEXT_PUBLIC_MOCK_SCENARIO=demo \
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=true \
NEXT_PUBLIC_MOCK_GITHUB_REPOS=true \
HOST=127.0.0.1 PORT=3000 pnpm dev:remote
```

Commercial verification:

```bash
cd uapi
pnpm exec tsc --noEmit --pretty false
pnpm run test:e2e:commercial-mvp
```

Demonstration verification:

```bash
cd protocol-demonstration
pnpm test:integration
pnpm test:v48-mvp-qa
# Historical (promotion-era only; era-pinned/skip under current layout):
# pnpm test:v28-mvp-qa
# pnpm test:v42-ai-reading-mvp
```

