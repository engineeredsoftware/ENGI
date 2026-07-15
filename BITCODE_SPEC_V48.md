# Bitcode Spec V48

## Status

- Version: `V48`
- V48 state: draft implementation pass in progress for Gate 3 synthesis pipeline correctness; full-stack single-canon draft family open for Complete Implementation Derivability
- Current canonical/latest target: `V47`
- Prior canonical anchor: `BITCODE_SPEC_V47.md`
- Prior generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`
- Generated structured artifact inventory: draft V48 family (`.bitcode/v48-spec-family-report.json`, `.bitcode/v48-canonical-input-report.json`, `.bitcode/v48-canon-posture-drift-report.json` when regenerated), Gate 3 depositing parity evidence, and `BITCODE_SPEC_V48_PROVEN.md` as the draft generated proof appendix
- Source parity state: V48 Gate 1–3 source-side identity, deposit SDIVF synthesis, telemetry, demand honesty, organization/wallet authority, and commercial website surfaces are specified for rebuild from this single SPEC; later gates extend reading/settlement without silent inheritance from superseded files
- Notes companion: `BITCODE_SPEC_V48_NOTES.md`
- Delta companion: `BITCODE_SPEC_V48_DELTA.md`
- Parity companion: `BITCODE_SPEC_V48_PARITY_MATRIX.md`
- Scope: V48 full-system Bitcode specification — single-canon rebuild authority for the entire stack through Gate 3 (SynthesizeAssetPacks SDIVF, deposit full-stack, source-safety, identity, packs, reading contracts retained for later gates)
- Last fully realized canonical target preserved in source until promotion: `V47` (pointer on main); draft work targets `V48`


## Version executive summary

V48 is the full-stack draft canon that advances Bitcode from promoted V47
commercial website testnet launch law into a single rebuild-from-SPEC system
through Gate 3: identity/wallet/GitHub authenticity, `/deposits`
SynthesizeAssetPacks SDIVF (algorithmic + telemetric correctness), deposit
full-stack option policy/admission/earnings/authority, settled-Depository demand
honesty, and source-safe telemetry. Later V48 gates extend reading settlement
and organization depth without silent inheritance from superseded version files.

V48 does not make mainnet value-bearing claims. "Testnet" means BTC amounts and
settlement observations are testnet only while the rest of the system behaves as
production-intended. Measurement remains the commercial primitive: absolutes on
deposit, Need-relative fit on read, weighted BTD scalar for quote/rights, and
seller/buyer visualization without source leakage.

Gate 3 product defaults that must appear in any rebuild: Anthropic model
`claude-haiku-4-5`, deposit-native SDIVF roster (no lens), DIV `maxIterations=1`,
LLM call timeout 180s, **sourceCheckoutCatalog** (not inventory), AssetPack =
patch + measurements + metadata with formal **ASSET_PACK_ABSOLUTES_CATALOG**,
empty Obfuscations skip Setup LLM, Forced Inclusions/Exclusions path scope,
Unestimatable demand when settled Depository search cannot ground estimates.

## Canonical Bitcode executive summary

Bitcode commoditizes knowledge by packaging source, documents, data, workflows,
and other technical materials as AssetPacks. Depositors supply AssetPacks into
the Depository. Readers ask Bitcode to understand a Read Request, synthesize a
Need, find fitting Depository AssetPacks, synthesize a Need-Fit AssetPack,
preview source-safe measurements, settle in BTC, receive BTD rights, and receive
entitled repository delivery.

BTD is the weighted scalar knowledge-volume measured from source bits, bytes,
content, documents, code, and other knowledge-bearing material. BTD can be
estimated for deposit-side AssetPack options, but final BTD size is
Need-relative: it is computed from measurements against a reviewed Need and
bound to settlement, rights, delivery, and source-to-shares compensation.

V48 makes the website experience commercially demonstrable on staging-testnet
by proving both sides of the exchange: IP sellers can deposit AssetPacks, and IP
buyers can buy Need-fitting AssetPacks.

## V48 source-of-truth hierarchy

Until promotion, `BITCODE_SPEC.txt` on `main` still points to promoted `V47`.
The V48 **draft** family is the sole rebuild authority for all V48 gate work:

| File | Role |
|---|---|
| `BITCODE_SPEC_V48.md` | **Single full-system SPEC** — Complete Implementation Derivability: the entire Bitcode stack through Gate 3 must be rebuildable from this file alone |
| `BITCODE_SPEC_V48_DELTA.md` | Why V48 / accepted decisions / deferred / commit direction |
| `BITCODE_SPEC_V48_NOTES.md` | Architecture decisions, simplified reading, non-binding working memory (weaker than SPEC) |
| `BITCODE_SPEC_V48_PARITY_MATRIX.md` | Spec ↔ implementation ↔ test audit |
| `BITCODE_SPEC_V48_PROVEN.md` | Generated proof appendix (draft) |

**Non-canonical companions** (`README.md`, `FAMILIARIZATION.md`, `ASSET_PACKS.md`,
`AGENTS.md`, `internal-docs/*` except when explicitly named by this SPEC):
orientation and craft only. They **must not** be required to supply omitted
system semantics. Adjuncts may link SPEC; SPEC must not depend on them.

**No silent inheritance.** Superseded version specs (`BITCODE_SPEC_V47.md` and
earlier) are historical anchors only. V48 implementers must not require reading
prior `BITCODE_SPEC_V*.md` files or non-canonical companions to rebuild deposit
SDIVF, identity, packs, telemetry, or measurement law — those laws are restated
in this SPEC.

Implementation remains unversioned in source paths. Routes, packages,
components, tests, prompts, telemetry, schemas, APIs, and workflows move in place
as the single current Bitcode system after V48 gates authorize their changes.

## V48 full-system, re-implementation, and audit rule

V48 must be reconstructable from this draft family, source code, generated
artifacts, proof roots, workflow receipts, ledger journals, database
projections, object-storage roots, wallet/provider receipts, repository
delivery receipts, and source-safe telemetry.

No V48 surface may disclose protected source, unpaid AssetPack source, raw
prompts, raw model/provider responses, credentials, wallet private material,
private settlement payloads, private repository access, or source-bearing
delivery contents before entitlement.

## V48 totality and precision enforcement rule

V48 must preserve V46 protocol comprehension while becoming operationally
complete for the website launch. AssetPack is the commodity. BTD is weighted
scalar knowledge-volume and, after settlement, a rights-bearing receipt. BTC is
settlement money, testnet-only in V48 deployment. Source-to-shares is
post-finality contributor allocation. Measurement is the basis for price.
Preview is not source disclosure. Quote is not payment. Payment observation is
not finality. Database projection is not ledger truth when stronger evidence
conflicts.

Every user-visible state must name whether it is estimate, potential, preview,
quote, observed testnet payment, final settlement, rights transfer, delivery,
contributor allocation, compensation, or repair.

## V48 system goals, non-goals, and design principles

Goals:

- Launch-freeze the first generally available website MVP scope.
- Make `/deposits`, `/reads`, `/packs`, and Auxillaries commercially coherent on
  staging-testnet.
- Specify seller and buyer user flows with exact state machines.
- Specify measurement law: catalog, prompts, typed outputs, weights, BTD scalar
  formula, proof roots, and source-safe visualizations.
- Audit feature excess and defer or flag anything that distracts from launch.
- Treat `/deposits`, `/reads`, and `/packs` as the website launch entrypoints;
  route `/exchange` compatibility into `/packs`; eradicate the legacy
  `/terminal` cockpit as a product surface (compatibility redirect only during
  migration); keep full Conversations commercialization, API/MCP, ChatGPT App,
  Bitcode Chat, value-bearing mainnet, and advanced market mechanics out of the
  launch path unless a later gate explicitly reopens them.
- Prove E2E IP selling and IP buying through browser-level commercial tests.
- Refurbish the landing page and public launch messaging for V48 testnet
  readiness.

Non-goals:

- V48 does not launch value-bearing mainnet BTC settlement.
- V48 does not commercialize Bitcode Chat, ChatGPT App, or MCP/API beyond
  source-safe compatibility and future-readiness boundaries.
- V48 does not finish deeper BTD mining cryptography beyond the website launch
  contract.
- V48 does not expose unpaid source or source-bearing prompts.
- V48 does not add advanced market mechanics beyond MVP selling and buying.

Design principles: measurement before price, price before settlement,
settlement before source unlock, source safety before convenience, website
clarity before advanced interfaces, proof-backed readback before projection,
and testnet value semantics without weakening production-like system behavior.

## V48 system architecture and layer boundaries

V48 acts through the website application:

- Auxillaries owns user identity, organizations, teams, wallets, source
  connections, target repository connections, and histories.
- `/deposits` owns IP-seller source connection, deposit AssetPack option
  synthesis, source-safe option review, Depository admission, and compensation
  expectation readback.
- `/reads` owns IP-buyer Read Request, ReadNeedComprehensionSynthesis,
  Need review/resynthesis, ReadFitsFindingSynthesis, source-safe preview,
  quote, BTC-testnet settlement, BTD rights transfer, and repository delivery.
- `/packs` owns searchable master-detail PackActivity across deposits, reads,
  previews, quotes, settlements, rights, delivery, compensation, repairs, proof
  roots, and histories.
- Marketing (`/`), Docs (`/docs`), and Conversations (structure retained;
  full commercial conversations experience deferred post-V48) complete the
  website experience set.
- API/MCP, ChatGPT App, and Bitcode Chat remain deferred commercial surfaces in
  V48, though their source-safe contracts must not regress.

### Frontend component and naming architecture (rebuild law)

V48 website UI rebuilds from a three-layer component architecture with seven
experience prefixes. Dependency direction is strict:

```
Shadcn*  →  Bitcode*  →  {Marketing|Packs|Reads|Deposits|Docs|Conversations|Auxillaries}*
```

| Layer | Symbol prefix | Import rule | Owns |
| --- | --- | --- | --- |
| Shadcn | `Shadcn*` | Radix/shadcn primitives only | Root UI primitives re-exported with explicit `Shadcn` prefix |
| Bitcode | `Bitcode*` | Shadcn + Bitcode theme/tokens only | App-wide base: layout, nav, pipeline table/log/telemetry, auth chrome, explainers, route shell |
| Experience (7) | `Marketing*`, `Packs*`, `Reads*`, `Deposits*`, `Docs*`, `Conversations*`, `Auxillaries*` | Bitcode only (not raw Shadcn; not other experiences) | Page-specific composition |

Filesystem and co-location convention (named component directories, hooks/styles/__tests__, packages vs uapi): `internal-docs/BITCODE_SOURCE_LAYOUT.md`.

Canonical directories (under the Next app root `apps/uapi/`):

- `apps/uapi/components/shadcn/`
- `apps/uapi/components/bitcode/`
- `apps/uapi/components/{marketing,packs,reads,deposits,docs,conversations,auxillaries}/`
- Thin page shells under `apps/uapi/app/{packs,deposits,reads,docs,conversations,auxillaries}/` and marketing at `apps/uapi/app/page.tsx` / `(root)`

Naming law (types, classes, files, functions, variables — not only components):

- **Pipeline** is the product run surface language (master-detail tables, live
  stream, history, selection). Prefer `BitcodePipeline*`,
  `BitcodeDepositPipeline*`, `BitcodeReadPipeline*`, and experience-local
  `Deposits*` / `Reads*` forms.
- **Transaction / journal** remains ledger/journal vocabulary (BTD journal
  entries, reconciliation), not the operator cockpit name.
- **Execution** as a product UI name is retired in favor of Pipeline. Low-level
  agent/executor packages (`execution-generics`, PTRR executor primitives) are
  not product Pipeline surfaces and are not blindly renamed.
- **Terminal** as a product surface name is eradicated. Live capabilities that
  still live under `apps/uapi/app/terminal/` must relocate into Bitcode or the
  owning experience; dead cockpit-only modules are deleted. `/terminal` may
  remain only as a compatibility redirect (default `/packs`) during migration.
- HTTP paths under `/api/executions/*` may remain stable during rename waves;
  internal TypeScript modules and UI labels move to Pipeline first.

Package law: generalizable non-React domain logic belongs in `packages/`;
uapi holds Next routes, React, and thin adapters. Shareable pure models that
leave Terminal must land in packages or `components/bitcode` models — not
remain under a Terminal path.

God-client modularization law (Phase 4, active on `version/v48`):

- Experience page clients are **orchestration shells** only. Pure projections
  live under `apps/uapi/components/<experience>/models/`; stateful IO under
  co-located `hooks/`; render units under named `ComponentName/` directories.
- `/deposits` rebuild index: `DepositPageClient` + deposit models/hooks/units
  listed in G3-14. `/packs` uses `PacksPageClient` + portfolio/master/detail
  units. Further thinning of deposit handlers and source-inventory loading
  continues until no deposit-touched module violates SRP.
- Unit tests for pure deposit models register under `apps/uapi/tests/` (and
  `apps/uapi/jest.config.cjs` testMatch) so CI proves modular projections.

### Legacy Terminal eradication completion condition

Terminal eradication is complete when:

1. `apps/uapi/app/terminal/` does not exist.
2. `/terminal` is not a route (no page, no redirect) and is not a nav/login CTA.
3. Shared pipeline selection, history, repository context, and readiness
   models live under Bitcode/experience names without `Terminal*` prefixes.
4. Browser proofs and commercial E2E remain on `/deposits`, `/reads`, `/packs`,
   and Auxillaries — never requiring the Terminal cockpit.
5. BTD journal and operational-health packages use non-Terminal names
   (`journal`, `operational-health`), with temporary Terminal aliases only
   while callers migrate.

## V48 canonical domain model

Canonical V48 launch objects:

- IP seller, IP buyer, organization, team, wallet, BTC-testnet account,
  source connection, target repository connection, deposit source bundle,
  deposit AssetPack option, Depository AssetPack, Read Request, synthesized
  Need, accepted Need, Fit candidate set, selected Fit set, Need-Fit AssetPack,
  source-safe preview, measurement vector, measurement weight policy,
  weighted BTD scalar, BTC-testnet quote, settlement receipt, BTD rights
  receipt, repository delivery receipt, source-to-shares allocation,
  compensation statement, PackActivity row, proof root, repair case, and
  commercial rehearsal receipt.

Canonical V48 states:

- Seller states: `seller-connected`, `source-connected`,
  `deposit-options-synthesizing`, `deposit-option-synthesized`,
  `deposit-option-reviewed`, `deposit-option-approved`,
  `depository-admission-submitted`, `depository-assetpack-admitted`,
  `compensation-eligible`, `seller-repair-required`.
- Buyer states: `buyer-connected`, `target-repository-connected`,
  `read-requested`, `read-need-synthesizing`, `read-need-reviewing`,
  `read-need-accepted`, `finding-fits-running`, `fits-found`,
  `need-fit-assetpack-synthesized`, `source-safe-preview-reviewing`,
  `btc-testnet-quote-issued`, `btc-testnet-settlement-observed`,
  `btd-rights-transferred`, `repository-delivery-created`,
  `buyer-repair-required`.
- Pack states: `pack-activity-created`, `measurement-visualized`,
  `proof-root-bound`, `ledger-projected`, `database-synchronized`,
  `storage-root-bound`, `repair-opened`, `repair-closed`.

## V48 measurement law

Measurement is the singular key to valuable IP commoditization and exchange.
Every V48 sale or deposit decision must be grounded in source-safe measurement
readback. **Models do not invent absolute volumes.** Hosts and tools measure;
agents reason over source-safe descriptors and measured readings.

### AssetPack identity (measurement-bound)

```
AssetPack = patch + measurements + metadata
```

- **Patch** — source-safe descriptor of digital material (`fileChanges[{path,op}]`,
  `patchSummary`). Path+op only; never raw code in prompts or default review payloads.
- **Measurements** — nested **measurement KINDS** object (see below). Measuring is
  the most critical Bitcode subsystem: models do not invent measured values.
- **Metadata** — commercially legible fields: `kind`, `title`, `summary`,
  `coveredSourcePaths`, `confidence`.

An AssetPack is **always** a completely synthesized artifact — never a raw
source slice and never a bare path list. Product hierarchy:

`AssetPack` (primitive) → `SynthesisAssetPack` → deposit option / selection
envelope row / durable artifact projection.

Deposit option `kind` (v0): `capability-slice` | `implementation-pattern` |
`proof-operations-slice`. Implementation synthesizes **2–4** distinct options.

### Measurement KINDS (canonical carrier)

V48 admits **two** measurement kinds (more may be added later). Both are
**kinds of measurements**, not separate commercial objects:

```
measurements: {
  absolutes: AbsoluteReading[];     // intrinsic digital-material properties
  needinesses: NeedinessReading[];  // reader/Need-relative (READ ONLY)
}
```

| Kind | When used | Nature |
|---|---|---|
| **absolutes** | Deposit + read | Intrinsic properties of the patch/material; fixed product catalog |
| **needinesses** | **Reading only** | Dynamic + static-catalogue reader-relative dimensions for a Need |

**Deposit law:** `measurements.needinesses` is always `[]`. No `needinessSignal`,
no deposit neediness preview, no inventing read-demand as a measurement kind on
deposit packs.

**Read law (outline; full Gate 4/read SPEC when that gate is active):**

- Static **needinesses catalogue** includes fixed dimensions (e.g. `language-fit`,
  `domain-fit`, `interface-fit`) with weights.
- **Dynamic** needinesses may be inferred for the specific Read Request / Need
  (additional named dimensions).
- **`need-fit` is a composite**, not a raw catalogue target:  
  `needFitVolume = weightedMean(needinesses[].volume)` using each row’s weight
  (reading weight, else catalogue weight, else equal). BTD on read uses the
  needinesses family / need-fit composite per settlement law.

### Absolute material-property catalog (`ASSET_PACK_ABSOLUTES_CATALOG`)

Canonical catalog in `@bitcode/generic-asset-packs-synthesis`
(`measurement-catalogs.ts`). Weights **sum to 1**. Shared for deposit and read
**absolute** properties. Rebuild implementations must emit one reading per kind.

#### Quantity (tool-authoritative: static analysis + patch descriptor)

| measurementKind | Label | Unit | Weight | Law |
|---|---|---|---|---|
| `function-count` | Functions | functions | 0.12 | Distinct functions/behaviors the patch encodes; magnitude = count |
| `type-count` | Types | types | 0.10 | Distinct types/interfaces/schemas; magnitude = count |
| `file-span` | File span | files | 0.08 | Files create/modify/delete in patch; magnitude = count |
| `symbolic-richness` | Symbolic richness | symbols | 0.12 | Distinct symbols/identifiers; magnitude = unique symbol count |
| `modularity` | Modularity | modules | 0.08 | Distinct path modules / top-level packages; magnitude = module count |

#### Quality (measure-agent judgment grounded in quantities + source-safe descriptor)

| measurementKind | Label | Unit | Weight | Law |
|---|---|---|---|---|
| `correctness-estimate` | Correctness | estimate | 0.18 | 0..1 fidelity/coherence of synthesized knowledge |
| `objectives-fidelity` | Objectives fidelity | estimate | 0.16 | 0..1 serves deposit objectives; honors obfuscations/exclusions |
| `computational-usage` | Computational usage | estimate | 0.16 | 0..1 estimated computational demand of the knowledge surface |

#### Absolute reading shape (rebuild type — all fields always required)

```
{
  measurementKind: string;   // catalog key exactly (e.g. function-count)
  label: string;
  weight: number;            // catalog weight
  volume: number;            // 0..1 normalized — ALWAYS
  magnitude: number;         // ALWAYS (quantity = raw count; quality = mirrors volume)
  unit: string;              // functions|types|files|symbols|modules|estimate
  category: 'absolute';
  rationale?: string;
  evidenceRoot?: string;
}
```

**Who measures when (deposit):**

| Phase | Law |
|---|---|
| Discovery `comprehend-codebase` | Measures **Host checkout material** → `discovery:sourceMeasurements` to ground the knowledge map |
| Implementation | After PTRR, host **must** attach `measurements: { absolutes, needinesses: [] }` (from Discovery measurements and/or `measureAssetPackAbsolutes`) |
| Validation ready-to-finish | **Fail-closed** if any pack lacks non-empty `measurements.absolutes` with magnitude+volume; may backfill then re-check |
| LLM agent JSON | **Must not** invent absolute or neediness volumes on deposit |

Stack: `SourceStaticAnalysisTool` (quantity) → `measureAssetPackAbsolutes` /
`SynthesizeAssetPacksAbsolutesMeasureAgent` (quality grounded in quantity) →
merge (quantity tool-authoritative). Package map:
`@bitcode/measurement-generics`, `@bitcode/generic-measurements-absolutes`,
`@bitcode/generic-measurements-needinesses`, `@bitcode/generic-asset-packs-synthesis`.

### Needinesses (read-only measurement KIND)

Needinesses live under `measurements.needinesses[]` with the **same numeric
field law** (magnitude + volume always; category `'neediness'`).

| Concern | Law |
|---|---|
| Deposit | Always empty `needinesses: []`; no deposit neediness preview |
| Static catalogue | e.g. language-fit, domain-fit, interface-fit (`ASSET_PACK_NEEDINESSES_CATALOG`) |
| Dynamic | Additional dimensions may be inferred for the specific Read/Need |
| need-fit composite | `computeNeedFitVolume(needinesses)` = weighted mean of neediness volumes; **not** a raw measure-agent target |
| BTD (read) | Settlement BTD from needinesses / need-fit family after Need acceptance |

### Relative / commercial visualization (policy, not measurement kinds)

Product UI may still project commercial policy rows (criticality, ROI, settled
demand **Unestimatable** vs grounded estimate for **earnings panels**). Those are
**not** `measurements.needinesses` and must not be confused with the measurement
KIND taxonomy.

### Measurement prompt rule

- Each inference-owned measurement is commanded by named Prompt / PromptPart
  composition through `@bitcode/prompts`.
- Record: input context class, source boundary, prompt template identity,
  source-safe prompt digest, typed output schema, parsed result, proof root,
  telemetry receipt, repair posture.
- Raw protected prompts, raw provider responses, protected source, and unpaid
  AssetPack source remain private. Source-safe prompt identity, digest, typed
  result, and proof root are disclosable.

### Weighted scalar BTD formula

- Each measurement emits `measurementVolume` (or `volume`), `confidence` where
  applicable, `riskAdjustment` where applicable, and `weight`.
- Normalized contribution:
  `volume * confidence * riskAdjustment * weight` (omit factors not present).
- **Deposit-side BTD** is estimated / potential range (no reviewed buyer Need).
- **Read-side / settlement BTD** is the **needinesses-only** weighted scalar
  after Need acceptance and option selection, minted only after BTC settle:

```
needFitVolume = Σ(w_i × clamp01(needinesses_i.volume)) / Σ w_i
amountBaseUnits = floor(needFitVolume × 10^18)   // fungible Bitcode (BTD)
```

- Absolute composite (Σ weight × absolute volume) is commercial legibility of
  supply material only; **absolutes never mint BTD**.
- Fungible BTD max supply is **21,000,000** whole tokens (BitcodeERC1155 id 0).
- AssetPack identity is a separate non-fungible co-ownership unit (ERC1155 ids ≥ 1).

### Seller / buyer visualization

- Depositors must see source-safe absolutes (and neediness or Unestimatable),
  criticality, demand posture, ROI/compensation expectation, source-safety
  blockers, and repair requirements before approving deposit.
- Readers must see Need coverage, Fit confidence, selected Fit provenance,
  novelty, risk, delivery readiness, quote basis, final BTD scalar, and repair
  blockers before paying BTC-testnet settlement.

### Measurement theorem

No measurement, no price. No price, no settlement. No settlement, no market.



## V48 Gate 3 SynthesizeDepositAssetPacks SDIVF and deposit full-stack law

This section is **binding product law** for Gate 3. Together with the rest of
this SPEC it is sufficient to **rebuild deposit synthesis and `/deposits` from
zero** without consulting superseded version files, non-canonical companions
(`ASSET_PACKS.md`, `README.md`, `FAMILIARIZATION.md`), `protocol-demonstration/`,
or implementation tribal knowledge. Paths locate the living system; the **law**
is this SPEC.

**Product law: no lens.** Deposit and read are **separate** SDIVF product
pipelines (not one lensed pipeline). Deposit roster keys below are deposit-native
only — no Fits Finding / Read-Need agents under deposit Setup, no synonym alias
keys for the same agent loader.

### G3-1 Pipeline identity

| Law | Value |
|---|---|
| Product pipeline | **SynthesizeDepositAssetPacks** (deposit-only SDIVF) |
| Domain package | `@bitcode/asset-packs-pipelines-domain` (+ product package under `asset-packs-pipelines/synthesize-deposits-asset-packs-pipeline` when used) |
| Phase roster | `depositPhases` in `packages/asset-packs-pipelines/domain/src/phases/deposit-phases.ts` |
| Phases | **preprocess** → **Setup** → (**Discovery** → **Implementation** → **Validation**) × maxIterations → **Finish** → **postprocess** |
| DIV loop | Substrate supports early exit via `validation:readyToFinish`; product default **maxIterations = 1** (one D→I→V pass) |
| Mode | Deposit-only path stores `pipeline:synthesizeMode = deposit` / `synthesize-asset-packs:mode = deposit` on the **shared root** |
| Dual-entry legacy | Older `synthesizeAssetPacksPipeline` may still resolve deposit vs read by input `mode` — **new product code uses deposit-only factory** |
| Inference | Non-configurable formal hierarchy; real generation at leaf. Tests mock LLM at provider boundary only (F26-A). |
| Default LLM | Provider **`anthropic`**; model **`claude-haiku-4-5`** (`BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` override) |
| Per-call timeout | `BITCODE_LLM_CALL_TIMEOUT_MS` default **180000** |
| Formal hierarchy | Pipeline Execution → Phase → Agent (`factoryPTRRAgent` where LLM) → Step (plan/try/refine/retry) → Failsafe (prepare_concise_context → chunk_then_sum → stitch_until_complete) → Thinkings (reason → judge → structured_output) |
| PTRR unwrap (F27) | Consumers read `finalOutput ?? output ?? raw` — never assume bare schema on factory envelope |

#### G3-1a Target phase sequence (binding)

| Phase | Sequence | Law |
|---|---|---|
| preprocess | deposit-only | Repository coords + steering; catalog may be empty until Host/Setup |
| Setup | (1) **clone alone** → (2) **parallel** {initialize-lsp, initialize-mcps-tools, comprehend-obfuscations} → (3) **danger-wall alone** | Clone first; danger wall last admits obfuscations |
| Discovery | **parallel** {comprehend-codebase, search-depository, inherent-regurgitation} | Measure is **inside** comprehend-codebase, not a separate agent |
| Implementation | `implementation:deposit-asset-pack-synthesis` | Options = patch + measurements + metadata; kinds as § measurement law |
| Validation | **one** agent: `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline` | A prior phases · B pack quality · C obfuscations vs patch |
| Finish | (1) store-artifacts → (2) ledgerize → (3) finish-synthesize-asset-packs-for-deposit-run | Persist · journal roots · selection envelope / cleanup |
| postprocess | normalize | Presentation-safe result for route |

#### G3-1b Optimization for depositor options

Bitcode optimizes **depositor-facing supply quality**, not a claimed global optimum:

1. Scope control — Forced Inclusion/Exclusion + Obfuscations bound admissible knowledge.
2. Measured structure — checkout absolutes + tree + LSP reveal capability density.
3. Demand alignment — depository search + needinessSignal bias toward buyable topics.
4. Pattern prior — inherent regurgitation avoids naive groupings.
5. Multi-option synthesis — 2–4 **distinct** knowledge groups.
6. Fail-closed Validation — missing absolutes, leakage, exclusion hits block ready.
7. DIV substrate — may re-enter Discovery→Implementation when not ready and maxIterations > 1.
8. Human selection — `/deposits` selection envelope; resynthesis with tighter steering is the next human loop.

### G3-2 Data storage schemas (deposit persistence)

Migration authority: `supabase/migrations/20260515010000_terminal_execution_history.sql` (plus RLS/service policies as in that migration family).

#### `public.executions`

| Column | Type | Deposit use |
|---|---|---|
| `id` | uuid PK | `runId` returned to client |
| `user_id` | uuid → auth.users | Owner; cancel/history scoped |
| `type` | text | e.g. deposit synthesis workbench type |
| `status` | text | `pending` → `running` → `completed` \| `failed` \| `cancelled` \| `interrupted` |
| `input` | jsonb | Source-safe request summary (never full monorepo sources) |
| `output` | jsonb | On complete: `depositOptionSynthesis`, `reviewProjections`, `inference`, exclusion violations |
| `context` | jsonb | `source`, `route`, `pipelineCore`, `synthesisMode`, `repositoryFullName`, `sourceBranch`, `sourceCommit`, `optionCount`, `sandboxId` (if any), cancel fields |
| `error` | jsonb | Source-safe `{ message }` on fail/cancel |
| `total_tokens`, `duration_ms` | numbers | Accounting |
| `started_at`, `completed_at`, `created_at`, `updated_at` | timestamptz | Run clock |

RLS: owner select/insert/update; service_role all. Cancel law: once `status=cancelled`, background workers must not overwrite with `failed`/`completed`.

#### `public.execution_events`

| Column | Type | Deposit use |
|---|---|---|
| `id` | uuid PK | Event id |
| `run_id` | uuid → executions | Stream tail / history |
| `event_type` | text | `status`, `generation`, `tool`, `error`, `agent-complete`, `phase-complete`, … |
| `event_data` | jsonb | **Always** passed through `sourceSafeStreamEvent` before persist/stream |
| `agent_name`, `phase` | text | Optional denormalized labels |
| `created_at` | timestamptz | Ordering + RunClock |

Indexes: `(user_id, created_at DESC)` on executions; `(run_id, created_at)` on events.

Settled demand search may scan `executions` for admitted/settled AssetPack rows (`context.admissionState`, `context.settlementState`, `type`, deposit-option-review-admission source) — source-safe metadata only.

### G3-3 HTTP / API surface (rebuild routes)

| Method | Path | Law |
|---|---|---|
| POST | `/api/deposit/synthesize-options` | Auth required. Validate body (`repositoryFullName`, branch, commit, obfuscations, forcedInclusions, forcedExclusions, demand signals). Create `executions` row `running`. Register `waitUntil` continuation. Return `{ runId, status: 'dispatched' }` immediately. `maxDuration` high enough for deposit (800s class). Background: provision host → run SDIVF or sandbox host → validate candidates → build real option synthesis → ground neediness from settled packs → persist `output` **before** completion event. Fail-closed messages on zero options / cancel / timeout. |
| GET | `/api/deposit/demand-estimate` | Auth required. Query settled Depository packs; return `{ ok, estimate, signals }`. `estimatable:false` when corpus thin. |
| GET | `/api/executions/history` | List owner runs (deposit-mode / deposit pipeline filters). |
| GET | `/api/executions/history/[runId]` | Full row + optional event page; support `?tail=N` for last N events. |
| GET | `/api/executions/stream/[runId]` | SSE live tail of source-safe events. |
| POST | `/api/executions/[runId]/cancel` | Owner cancel; set `cancelled`; insert status event; best-effort sandbox stop. |

Dispatch must use Vercel `waitUntil` (QA F31) — bare `void` after response is illegal on serverless.

### G3-4 Hosts and provisioning

| HostKind | Implementation | Law |
|---|---|---|
| `local` | LocalHost + `apps/uapi/lib/deposit-source-provisioning` | Default when `BITCODE_PIPELINE_HOST` unset. Host **adopt this-run tree or clone** complete tree at SHA; Node fs workspace; build **sourceCheckoutCatalog** `{ paths, samples, sources? }`. |
| `sandbox` | VercelSandbox host family | When `BITCODE_PIPELINE_HOST=sandbox`. Auth fail-closed. Deposit boxes **`persistent: false`**. Persist `context.sandboxId` for cancel. |

Scope after provision: Forced Inclusions/Exclusions applied to catalog. Prompt path uses projection of **paths + samples only** — never full `sources` in prompts or telemetried `pipeline:input`.

**Host-only clone law:** Setup clone agent is the checkout authority for the SDIVF run; pre-Setup host provision may seed the Host, but deposit Setup does not use Fits Finding harness keys.

### G3-5 Deposit run inputs and preprocess stores

| Input | Law |
|---|---|
| `repositoryFullName`, `sourceBranch`, `sourceCommit` | Required for synthesis |
| `obfuscations` | Free-text withhold guidance. **Empty/whitespace → skip Setup obfuscation LLM**; store empty guidance (`comprehensionMode: empty-obfuscations-skip-llm`). Forced Exclusions remain authoritative. |
| `forcedInclusions` | Non-empty → only those roots in-scope |
| `forcedExclusions` | Fail-closed exclusion from catalog before prompts/measurement |
| `demandContext` | Optional demand signals; settled-Depository estimate preferred for earnings UI |
| Hooks (optional) | `deposit:persistArtifacts`, `deposit:ledgerWrite` injected by dispatch |

#### Naming: sourceCheckoutCatalog (binding)

| Concept | Store / type key |
|---|---|
| This-run Host checkout catalog | **`deposit:sourceCheckoutCatalog`** (`paths`, `samples`, optional `sources` file bodies) |
| Host workspace | `repository:workspacePath` |
| Legacy alias | `deposit:inventory` **dual-written only** for stream filters until fully migrated — **not** product vocabulary |

#### Preprocess cross-phase stores (shared root)

| Namespace:key | Content |
|---|---|
| `pipeline:input` | Request summary; catalog **without** full `sources` bodies |
| `pipeline:synthesizeMode` | `deposit` |
| `deposit:repository` | `{ url, owner, name, branch, commit, fullName }` |
| `deposit:obfuscations` | string \| null |
| `deposit:forcedInclusions` | string[] |
| `deposit:forcedExclusions` | string[] |
| `deposit:demandContext` | array |
| `deposit:sourceCheckoutCatalog` | Full catalog for measurement tools (when available) |

### G3-6 Agent roster (deposit mode — exactly one key per agent)

Registry keys under `packages/asset-packs-pipelines/domain/src/`. **No synonym
aliases** (e.g. do not also register `discovery:codebase-comprehension` for the
same loader as `discovery:comprehend-codebase`).

#### Setup (`depositSetupPhase`)

| # | Registry key | Module | Objective | Tools / notes |
|---|---|---|---|---|
| 1 | `setup:clone-vcs-repository` | `agents/setup/asset-pack-clone-vcs-repository-agent.ts` | Host adopt/clone full tree at SHA | Host clone tool |
| 2a | `setup:initialize-lsp` | `agents/setup/asset-pack-initialize-lsp-agent.ts` | LSP on workspace | LSP init |
| 2b | `setup:initialize-mcps-tools` | `agents/setup/asset-pack-initialize-mcps-tools-agent.ts` | MCP/tools on Host | MCP helpers |
| 2c | `setup:comprehend-obfuscations` | `agents/setup/deposit-input-comprehension-agent.ts` | Obfuscations → structured guidance vs catalog paths | PTRR; empty skip LLM |
| 3 | `setup:danger-wall` | `agents/setup/deposit-danger-wall-agent.ts` | Admit obfuscation posture; fail-closed | Deterministic; `ShortCircuitError` |

**Setup stores:** `setup:inputComprehension` / `setup:obfuscationComprehension`
`{ summary, obfuscatedPaths?, obfuscatedConcepts?, honorNotes? }`;
`setup:admission` / `setup:dangerWall` `{ safe, reason, flags, … }`;
`setup/lsp:initialized`, workspace path.

**Comprehend-obfuscations output schema:**
`{ comprehension: { summary, obfuscatedPaths?, obfuscatedConcepts?, honorNotes? } }`.

#### Discovery (parallel)

| Registry key | Module | Objective | Tools |
|---|---|---|---|
| `discovery:comprehend-codebase` | `agents/discovery/deposit-codebase-comprehension-agent.ts` | Rich Host analysis → knowledge map for pack groups | LSP `lsp-query`, measure/static-analysis, Host file reads |
| `discovery:search-depository` | `agents/discovery/deposit-depository-search-agent.ts` | Plan queries + demand guidance + tool search | `depository-asset-pack-search` (lexical always; vector when `BITCODE_DEPOSITORY_VECTOR_SEARCH=1` + credentials) |
| `discovery:inherent-regurgitation` | `agents/discovery/deposit-inherent-regurgitation-agent.ts` | Model-inherent patterns (source-safe) | none |

##### Codebase comprehension evidence law (binding)

Before/around PTRR, the agent **must** gather:

1. Absolute measurements of checkout material → `discovery:sourceMeasurements`
2. LSP queries when available
3. Full file-tree structure from catalog paths (`buildFileTreeStructure`)
4. Bounded key file reads (README, manifests, configs, high-signal paths)

**Comprehension schema:**
`{ summary, capabilities?, knowledgeAreas?, notableModules?, measurementInsights?, structureInsights? }`.

**Rich analysis store** `discovery:codebaseAnalysis`:
`schema: bitcode.deposit.discovery.codebase-analysis` with repository,
workspacePath, catalog counts/paths, fileTree, keyFileReads, sourceMeasurements,
lsp queries, comprehension. Also `discovery:codebaseComprehension` (map alone).

##### Depository search output law

`{ guidance: { summary, likelyReadTopics?, demandAlignment?, underservedTopics?, readabilityNotes?, searchQueries? }, searchQueries? }`.
Stores: `discovery:depositorySearch`, `discovery:depositorySearchQueries`,
`discovery:depositorySearchToolResult`.

##### Inherent regurgitation output law

`{ regurgitation: { summary, relevantKnowledge?, patterns?, references? } }` →
`discovery:inherentRegurgitation`.

#### Implementation

| Registry key | Module | Objective |
|---|---|---|
| `implementation:deposit-asset-pack-synthesis` | `agents/implementation/deposit-asset-pack-synthesis-agent.ts` (+ schema/prompts siblings) | 2–4 options; LLM synthesizes patch+metadata; **host attaches absolutes** |

**Candidate set schema (LLM + host):**

```
{
  options: [{
    kind: string;                    // capability-slice | implementation-pattern | proof-operations-slice
    title: string;                   // 8..160
    summary: string;                 // 40..900 source-safe
    coveredSourcePaths: string[];    // 1..40 from catalog only
    confidence: number;              // 0..1
    patch: {
      fileChanges: { path: string; op: 'create'|'modify'|'delete' }[];  // min 1
      patchSummary: string;
    };
    needinessSignal?: { demand: number; saturation: number; rationale: string };
    absolutes?: AbsoluteReading[];   // REQUIRED after host attach
    measurements?: Record<string, number>;  // optional legacy 0..1 map
    measurementRationale?: string;
  }]  // length 1..4
}
```

Tools: `asset-pack-patch-write` (path+op materialization).  
Stores: `implementation:options` **and** `implementation:assetPacks` (same array),
`implementation:summary`, `implementation:assetPack`.

#### Validation (single agent)

| Registry key | Module | Objective |
|---|---|---|
| `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline` | `agents/validation/deposit-ready-to-finish-agent.ts` | Single A/B/C gate |

| Check | Law |
|---|---|
| A Prior phase / tool sanity | workspacePath; danger-wall admission; sourceCheckoutCatalog.paths; Discovery products; non-empty options |
| B Pack quality | Each pack = patch + measurements + metadata; distinctness; source-safety; absolute kinds present |
| C Obfuscations / Forced Exclusions | covered paths + patch paths vs blocked prefixes |

**Qualitative PTRR schema:**
`{ issues: string[]; qualityScore: number; coverageGaps: string[]; recommendation: 'complete'|'iterate' }`.

Stores: `validation/implementation:issues`, `validation:depositQuality`,
`validation:readyToFinish` `{ recommendation: 'finish'|'revise', summary, issues }`;
re-stores measured packs on `implementation:options|assetPacks`.

Compat module `deposit-validation-agent.ts` shares prompts/checks for unit tests;
**deposit phase roster registers only the ready-to-finish key.**

#### Finish (sequential)

| Registry key | Module | Objective |
|---|---|---|
| `finish:store-artifacts` | `agents/finish/deposit-store-artifacts-agent.ts` | Durable source-safe bundle + optional persist hook |
| `finish:ledgerize` | `agents/finish/deposit-ledgerize-agent.ts` | Journal roots + optional ledgerWrite hook |
| `finish:finish-synthesize-asset-packs-for-deposit-run` | `agents/finish/deposit-finish-synthesize-run-agent.ts` | Selection envelope + cleanup posture |

##### store-artifacts bundle schema

```
{
  schema: 'bitcode.deposit.synthesize-asset-packs.artifacts';
  storedAt: string;
  assetPacks: Option[];
  patches: [{ title, kind, patch, coveredSourcePaths, absolutes, metadata }];
  discovery: { codebaseComprehension, codebaseAnalysisSummary, depositorySearch,
               depositorySearchTool, inherentRegurgitation, sourceMeasurements };
  setup: { admission };
  validation: ReadyToFinish;
  sourceCheckoutCatalog: { pathCount, sampleCount, fileBodyCount, paths }; // no sources bodies
}
```

Stores: `finish:storedArtifacts`, `finish:uploadForReview`, `finish:persistResult`.

##### ledgerize (journal)

Requires storedArtifacts. Builds per-option `contentsRoot`, `measurementRoot`,
`metadataRoot` + discovery/validation roots. Optional `deposit:ledgerWrite`.
**Not** full commercial settlement (SettleAssetPack later). Stores:
`finish:ledgerize`, `finish:ledgerReceipt`, `finish:ledgerWriteResult`.

##### selection envelope schema

```
{
  schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope';
  surface: '/deposits';
  purpose: 'user-select-options-to-deposit';
  options: [{ index, kind, title, summary, coveredSourcePaths, confidence,
              patch, measurements /* absolutes */, metadata, selectable: true }],
  readyToPresent, validationSummary
}
```

Stores: `finish:selectionEnvelope`, `finish:completion`, `finish:summary`.
Host dispose is **dispatch-owned** after Finish returns.

### G3-7 Tools, prompts, execution tree, store-visibility

#### Tools (deposit path)

| Tool / capability | Phase | Role |
|---|---|---|
| Host VCS clone/adopt | Setup | Full checkout at SHA |
| LSP init + `lsp-query` | Setup / Discovery | Symbols for comprehension |
| MCP initialize | Setup | Host tool surface |
| Static analysis + measure stack | Discovery / Implementation / Validation backfill | Absolutes quantity + quality |
| `depository-asset-pack-search` | Discovery | Lexical + optional vector settled supply |
| `asset-pack-patch-write` | Implementation | Materialize path+op descriptors |
| `deposit:persistArtifacts` hook | Finish | Durable DB write |
| `deposit:ledgerWrite` hook | Finish | Journal binding |

#### Prompt composition law

LLM deposit agents set Prompt registry parts:

- `agent:identity` → `agent:requirements` → `ptrr:plan` | `ptrr:try` | `ptrr:refine` | `ptrr:retry`

Hierarchical system prompt reaches **every** leaf LLM call (identity before
requirements before PTRR step). Progressive specificity:
Pipeline → Phase → Agent → Step → Failsafe → Thinkings generation.

User/task payload: repository, **projected catalog**, Discovery maps, packs —
**never** full monorepo sources.

Prompt contracts pinned by
`packages/asset-packs-pipelines/domain/src/__tests__/deposit-agent-prompt-contracts.test.ts`.

#### Execution tree and cross-phase store-visibility law (F20 generalized)

```
Execution (ROOT)  ← dispatch / route holds this
  preprocess (seq child)
  setup / discovery / implementation / validation / finish (seq children)
    agent / PTRR step / generation children
  postprocess
```

Phases are **isolated siblings**. `findUp` walks **ancestors only**.

| Role | API |
|---|---|
| Producer | `storeCrossPhaseArtifact(execution, ns, key, value)` → writes on **`execution.getRoot()`** |
| Consumer | `execution.get(ns, key) ?? execution.findUp(ns, key)` |

Without this law, Setup guidance is invisible to Implementation, Discovery maps
vanish for Validation, and the route cannot read Finish outputs.

#### Complete deposit store index (normative)

| Namespace:key | Producer | Consumers |
|---|---|---|
| `deposit:sourceCheckoutCatalog` | preprocess / clone / ensure helpers | all agents, measure, Finish |
| `deposit:repository` | preprocess | all |
| `deposit:obfuscations` / forced* / demandContext | preprocess | Setup/Discovery/Impl |
| `deposit:persistArtifacts` / `ledgerWrite` | dispatch | Finish |
| `repository:workspacePath` | clone | LSP, Validation A |
| `setup:inputComprehension` | comprehend-obfuscations | danger-wall, Impl, Validation |
| `setup:admission` | danger-wall | Validation A, Finish |
| `discovery:codebaseComprehension` / `codebaseAnalysis` / `sourceMeasurements` | comprehend-codebase | Impl, Validation, Finish |
| `discovery:depositorySearch` (+ queries, tool result) | search-depository | Impl, Finish |
| `discovery:inherentRegurgitation` | inherent-regurgitation | Impl, Finish |
| `implementation:options` / `assetPacks` | Implementation (+ Validation re-store) | Validation, Finish, route |
| `validation:readyToFinish` / `depositQuality` | Validation | DIV gate, Finish, UI |
| `finish:storedArtifacts` / `ledgerize` / `selectionEnvelope` / `completion` | Finish | route, journal, UI |

### G3-8 AssetPack option product shape (route projection)

After pipeline + projection (`buildRealDepositAssetPackOptionSynthesis` +
`validateDepositSynthesisOptions` when used):

| Field | Law |
|---|---|
| `kind` | capability-slice \| implementation-pattern \| proof-operations-slice |
| `title`, `summary` | Source-safe commercial language |
| `absolutes[]` / projected `measurements[]` | Formal absolutes; category absolute; weights Σ=1; sizes have magnitude+unit |
| `contents` | `{ patchSummary, fileChanges[{path,op}], provenantSourcePaths, provenantSourceCount }` — path+op only |
| `neediness` | Preview or Unestimatable |
| `visibility.*` | All raw/source flags **false** |
| Roots | optionRoot, sourceBindingRoot, demandAlignmentRoot, measurementRoot, contentsRoot, needinessRoot, reviewBoundaryRoot |

### G3-9 Full-stack route session after options exist

Rebuild order in `buildDepositRouteSession` / `DepositPageClient`:

1. **Synthesis** — options from precomputed real synthesis or blueprint fallback.
2. **Policy** — criticality, demand (settled-grounded or unestimatable), ROI, BTD potential, compensation, policyDecision.
3. **Admission** — review decisions → receipts (`admitted-to-depository` when approved).
4. **Earning supply intelligence** — likely demand, unfit need, compensation ranges (zeroed when unestimatable), recommendations.
5. **Organization policy + wallet authority** — required actions for `/deposits`.

**Full-stack completeness stats:**

| Stat | Law |
|---|---|
| Option roots | = synthesis.optionCount |
| Positive ROI options | May be >0 when demand Unestimatable (provisional measurement-ranked ROI); earnings **UI** still Unestimatable |
| Admitted options | Increments only after approval → admission |
| Required denials | Must not stick at 2 solely because `depositApproved` is false; sub-critical + under limit + grants + wallet + role ⇒ approve/submit allowed |

**Demand law:** search settled/admitted Depository AssetPacks only (`estimateDepositorySettledDemand`); floor of settled packs; no hardcoded client weights; UI **Unestimatable** when not estimatable.

### G3-10 Telemetry, observability, debugging

| Concern | Law |
|---|---|
| Source-safety gate | `sourceSafeStreamEvent` — metadata allowlist for `llm` stores; withhold message/content; structural summary only |
| Log row kinds | **Only** (1) LLM generation leaves (2) Tool uses — no intermediate store fragment rows |
| Pills | Phase → Agent → Step → Failsafe → Thinkings (generation) |
| Live SSE | Relay raw `event_data` with namespace/key/executionState intact |
| History reload | Paginate events; `?tail=N` for end; RunClock from event timestamps |
| Auto-follow | Pin to bottom unless user scrolled away |
| Failure UX | Banner with error message; hover failed/cancelled rows → last call-chain + error |
| Stall indicator | Amber when silence ≥ LLM call timeout default (180s) |
| Cancel | UI Cancel run → cancel API; cooperative polls in deposit background |

### G3-11 `/deposits` UI MVP completeness

| Surface | Law |
|---|---|
| Master table | Deposit pipeline runs; filters; select → URL `transactionId` |
| Compose (+) | Open new deposit configuration |
| Config | Editable until synthesis dispatched; Obfuscations + Forced Inclusions + Forced Exclusions |
| Telemetry accordion | Source-safe SDIVF stream for attached run |
| Options cards | Kind, title, summary, contents panel, absolutes, neediness, policy, earning estimate, approve/archive |
| Earnings panel | All-repos supply: Likely demand / Unfit Need / Expected compensation — Unestimatable when required |
| Authority panel | Wallet, deposit policy, required denials, roots |
| Activity anchors | Obfuscations anchors; option anchors to ledger |

### G3-12 Error handling and fail-closed postures

| Failure | Posture |
|---|---|
| Zero admissible options | Fail run; clear message; no silent empty complete |
| LLM timeout | Per-call reject; agent/pipeline fails; surface message with model id when known |
| Missing sandbox auth | Fail closed before create |
| Cancel mid-run | `cancelled`; no flip to failed |
| Orphan stuck running | Sweep → `interrupted` (not cancelled) |
| Prompt too large / Invalid string length | Scope sourceCheckoutCatalog; safePromptJson; never put full sources in prompts |
| Empty obfuscations on monorepo | Skip input-comprehension LLM (no thrash) |
| Thin Depository demand | Unestimatable — never invent % |

### G3-13 Environment rebuild checklist

| Variable | Gate 3 law |
|---|---|
| `BITCODE_ASSET_PACK_REAL_INFERENCE` | `true` for live deposit |
| `BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` | `anthropic` / `claude-haiku-4-5` product default |
| `BITCODE_LLM_CALL_TIMEOUT_MS` | `180000` |
| `BITCODE_PIPELINE_HOST` | unset=local; `sandbox`=in-box |
| `BITCODE_DEPOSITORY_VECTOR_SEARCH` | `1` enables embedding + Supabase match RPC when credentials present |
| `XAI_API_KEY` | Required for xAI provider path when selected |
| Vercel sandbox auth | OIDC or token+team+project when sandbox host |
| Supabase | executions + execution_events migrations applied |

### G3-14 Implementation source map (rebuild index)

| Area | Path |
|---|---|
| Pipeline entry / preprocess | `packages/asset-packs-pipelines/domain/src/index.ts` |
| Deposit phase roster | `packages/asset-packs-pipelines/domain/src/phases/deposit-phases.ts` |
| Discovery registration | `packages/asset-packs-pipelines/domain/src/phases/discovery.ts` |
| Cross-phase store law | `packages/asset-packs-pipelines/domain/src/synthesize-asset-packs.ts` |
| sourceCheckoutCatalog resolve | `packages/asset-packs-pipelines/domain/src/resolve-source-checkout-catalog.ts` |
| Deposit agents | `…/agents/{setup,discovery,implementation,validation,finish}/deposit-*.ts` |
| Absolutes catalog | `packages/generic-asset-packs/synthesis/src/measurement-catalogs.ts` |
| Measured patch type | `packages/generic-asset-packs/synthesis/` |
| Measure host | `…/agents/validation/agent-measure-absolutes.ts` |
| Static analysis tool | `…/agents/validation/source-static-analysis-tool.ts` |
| Depository search pure | `…/tools/deposit-depository-asset-pack-search.ts` |
| Real option projection | `deposit-option-real-synthesis.ts` |
| Policy / admission / earnings | `deposit-asset-pack-option-policy.ts`, `deposit-asset-pack-option-admission.ts`, `depositor-earning-supply-intelligence.ts` |
| Settled demand | `depository-settled-demand-estimate.ts`, `apps/uapi/lib/depository-settled-demand.ts` |
| Hosts | `packages/pipeline-hosts/` (LocalHost, VercelSandbox, …) |
| Provisioning | `apps/uapi/lib/deposit-source-provisioning.ts` |
| Synthesize route / dispatch | `apps/uapi/app/api/deposit/synthesize-options/` |
| Demand route | `apps/uapi/app/api/deposit/demand-estimate/route.ts` |
| Cancel | `apps/uapi/lib/execution-cancel.ts`, `apps/uapi/app/api/executions/[runId]/cancel` |
| Stream safety | `packages/pipelines-generics/src/streaming/*` |
| UI page shell | `apps/uapi/app/deposits/page.tsx` (thin mount) |
| UI orchestration | `apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx` |
| UI pure models | `apps/uapi/components/deposits/models/` |
| UI hooks | `apps/uapi/components/deposits/DepositPageClient/hooks/` |
| UI units | `DepositSourceSelection`, `DepositObfuscationsPanel`, `DepositAssetPackOptions`, `DepositPipelinesMaster`, `DepositSynthesisTelemetry`, `DepositActivityLedgerDetail`, `DepositRouteStateAside` under `apps/uapi/components/deposits/` |
| Layout contract | `internal-docs/BITCODE_SOURCE_LAYOUT.md`, `apps/uapi/components/deposits/README.md` |
| LLM defaults | `packages/generic-llms/src/defaults.ts` |
| DB | `supabase/migrations/20260515010000_terminal_execution_history.sql` |
| Prompt contracts (test) | `…/__tests__/deposit-agent-prompt-contracts.test.ts` |
| Parity algorithm rows | `BITCODE_SPEC_V48_PARITY_MATRIX.md` § Deposit SDIVF target algorithm |

**Non-canonical companions (not rebuild law):** `ASSET_PACKS.md`, `README.md`,
`FAMILIARIZATION.md`, `AGENTS.md` — may summarize or link this SPEC; they must
not supply omitted system semantics.

#### G3-14a Deposit experience modularization law (rebuild)

The `/deposits` commercial surface is modular by SRP, not a single god client:

1. **Page shell** (`apps/uapi/app/deposits/`) mounts only; no domain logic.
2. **Orchestration** (`DepositPageClient`) wires state and handlers; pure
   projections and IO belong in `models/` and `hooks/`.
3. **Named component units** own discrete UI responsibilities (source,
   obfuscations, options, pipelines master, telemetry, ledger detail, aside).
4. **Hooks** own live runs, URL navigation, settled demand, network count, and
   synthesis activity/stream clocks.
5. **Models** own activity-ledger projections, route-session input assembly,
   criticality, demand shapes, and run-status mapping — unit-tested without React.
6. Rebuilders must follow `internal-docs/BITCODE_SOURCE_LAYOUT.md`; do not
   reassemble deposit law into a single multi-thousand-line page client.

Package modularization (deposit domain): depository-search, deposit option
policy/admission/options/earnings/demand, depository-supply-index, and
asset-packs-synthesis are split into types/helpers/builders with stable public
entry paths under `@bitcode/asset-packs-pipelines-domain/*`. Host plan builder is
split from in-box runner templates. Agents co-locate schema/prompts/checks.


### G3-15 Gate 3 completion condition

Gate 3 is closed when:

1. This SPEC family states rebuild law for deposit SDIVF end-to-end (measurement law + this section + PARITY matrix rows D-01…D-18) **without** requiring `ASSET_PACKS.md`, `README.md`, `FAMILIARIZATION.md`, or superseded `BITCODE_SPEC_V*.md` files.
2. Implementation matches G3-1…G3-14 (deposit-native roster, sourceCheckoutCatalog, absolutes, Finish schemas, store-visibility).
3. Automated tests for package + uapi deposit/route/telemetry suites pass; Gate Quality CI green on PR into `version/v48`.
4. Demand honesty (Unestimatable or settled-grounded) and full-stack stats (ROI/denials) do not present incomplete zeros for healthy sub-critical options with wallet authority.
5. Every Execution store, agent schema, tool, and UI expectation listed in G3-5…G3-11 is implemented or explicitly bounded as deferred with a SPEC reopen condition.


## V48 Gate 4 SynthesizeReadAssetPacks SDIVF and commercial read full-stack law

Read synthesize is **nearly identical** to deposit synthesize (same SDIVF shape,
many shared agents). Instruction input is **Need** (not Obfuscations). Measurements
include **needinesses** (all kinds end with `-fit`). BTC settle / PR ship are
**not** in this pipeline.

### G4-1 Product split (three commercial pipelines)

| Pipeline | Pattern | Purpose |
|---|---|---|
| **SynthesizeDepositAssetPacks** | SDIVF | Depositor repo + Obfuscations → option selection on `/deposits` |
| **SynthesizeReadAssetPacks** | SDIVF | Reader repo + **Need** → option selection on `/reads` |
| **settle-asset-pack-pipeline** | **Simple** (linear) | **1:1 AssetPack : pipeline run** after buy: settle-btc → mint-btd → settle-btd → settle-asset-pack (ERC1155) → PR-ship → `/packs` |

Synthesize-deposit and synthesize-read look like each other (multi-option). Settle does **not**: each bought option starts its own settle pipeline.

### G4-2 Read SDIVF sequence (mirrors deposit)

| Phase | Sequence |
|---|---|
| preprocess | Need + repository + sourceCheckoutCatalog on shared root (`read:*`) |
| Setup | clone alone → parallel {initialize-lsp, initialize-mcps-tools, **comprehend-needs**} → **danger-wall** (admits Need + dynamic *-fit plan) |
| Discovery | parallel {comprehend-codebase, search-depository, inherent-regurgitation} (shared with deposit) |
| Implementation | `implementation:read-asset-pack-synthesis` — patch + host attaches absolutes + needinesses |
| Validation | `validation:ready-to-finish-asset-packs-synthesis-read-pipeline` — A/B/C + needinesses *-fit |
| Finish | store-artifacts → ledgerize → finish-synthesize-read-run (selection envelope for settle) |

### G4-3 Needinesses measurement law (read)

```
measurements: {
  absolutes: AbsoluteReading[];       // same catalog as deposit
  needinesses: NeedinessReading[];    // all kinds end with "-fit"
}
```

| Subkind | Examples | Law |
|---|---|---|
| Static catalogue | `language-fit`, `domain-fit`, `interface-fit` | Fixed weights; always measured on read options |
| Dynamic (from Need) | `needs-session-refresh-fit` | Planned in Setup comprehend-needs; host measures |
| Composite | `need-fit` | **Not** a raw row — `weightedMean(needinesses)` |

Deposit: `needinesses: []` always. Read: fail-closed if needinesses empty or any kind lacks `-fit` suffix.

### G4-4 User experience parity (`/reads` vs `/deposits`)

| Surface | Deposit | Read |
|---|---|---|
| Instruction | Obfuscations | **Need** |
| Submit | synthesize-options | `POST /api/read/synthesize-options` |
| Review options | master-detail + option cards | master-detail + option cards (same pattern) |
| Next step after select | admit to Depository | **settle-asset-pack-pipeline** (pay → rights → PR) |

### G4-5 SettleAssetPack Simple stages (binding)

**Cardinality:** SynthesizeRead produces multiple options; the buyer may select
one or more. **Each bought option starts its own** `SettleAssetPackSimplePipeline`
run (1:1 AssetPack : settle pipeline). Never settle multiple packs inside one run.

| # | Stage / agent | Law |
|---|---|---|
| 1 | `validate-settlement-readiness` | Exactly one `assetPackOption`; fail-closed if zero or many |
| 2 | `settle-btc` | BTC-testnet payment observation / finality (live mempool when `txId` present; else projected) |
| 3 | `mint-btd` | Mint **fungible BTD** to **master** contract account. Amount = needinesses-only weighted scalar (see below). Absolutes never mint BTD |
| 4 | `settle-btd` | Transfer minted BTD from master → **buyer Ethereum wallet** |
| 5 | `settle-asset-pack` | **BitcodeERC1155**: add buyer as equal AssetPack co-owner; depositor retains; **never remove/burn** AP ownership |
| 6 | `ship-asset-pack-patch-pr` | Open PR on **read** repo applying that option’s `.patch` |
| 7 | `journal-and-pack-activity` | `/packs` settled-assetpack activity row |

#### BTD (Bitcode) fungible token — mint amount

- **BTD** is a finite fungible token named Bitcode with max supply **21,000,000**
  whole tokens (18 decimals base units). Introduced commercially on the **read /
  settle** path (not deposit option synthesis).
- **Mint only after** `settle-btc` finality (or testnet-projected finality when
  productized with projected observation).
- Amount uses **needinesses measurements only**:

```
weightedNeedinessesSum = Σ (w_i × clamp01(volume_i))   // needinesses *-fit only
needFitVolume          = weightedNeedinessesSum / Σ w_i   // ∈ [0,1]
amountBaseUnits        = floor(needFitVolume × 10^18)
```

- `need-fit` composite rows are derived, not double-counted as mint inputs.
- Absolutes and deposit-side estimates never mint settlement BTD.
- Mint destination is the **master** treasury account on BitcodeERC1155; `settle-btd`
  then transfers to the buyer.

#### BitcodeERC1155 (single contract)

One clean ERC1155 hosts both economic objects:

| Token | ID | Kind | Behavior |
|---|---|---|---|
| BTD (Bitcode) | `0` | Fungible | Cap 21M; `mintBtdToMaster` then `settleBtdToBuyer` |
| AssetPack | `≥ 1` | NFT co-ownership | `registerAssetPack` (depositor first); `addAssetPackCoOwner` **adds** buyer; burn/remove **forbidden** |

AssetPack “transfer” is **add-only co-ownership**: the depositor always retains
(source remains theirs; they can re-synthesize the same pack). The buyer becomes
an equal co-owner. Neither party may remove the other. Future re-list/resale is
a later right for both co-owners; not V48 burn semantics.

Sources of truth:

- Solidity: `packages/btd/contracts/BitcodeERC1155.sol`
- TS mirror + receipts: `packages/btd/src/erc1155/`
- Pipeline: `packages/asset-packs-pipelines/settle-asset-pack-pipeline/`

### G4-6 `/packs` master-detail

Network-scope PackActivity: searchable master table + detail for a selected AssetPack
(settled/admitted supply and settled read deliveries). Source-safe measurements +
roots only; no raw source.

### G4-7 Implementation source map (read / settle / packs)

| Area | Path |
|---|---|
| Read phases | `packages/asset-packs-pipelines/domain/src/phases/read-phases.ts` |
| Read product package | `packages/asset-packs-pipelines/synthesize-reads-asset-packs-pipeline/` |
| Need comprehension | `agents/setup/read-need-comprehension-agent.ts` |
| Read synthesis | `agents/implementation/read-asset-pack-synthesis-agent.ts` |
| Needinesses helpers | `read-neediness-measurements.ts`, `@bitcode/generic-measurements-needinesses` |
| Settle package | `packages/asset-packs-pipelines/settle-asset-pack-pipeline/` |
| BitcodeERC1155 | `packages/btd/contracts/BitcodeERC1155.sol`, `packages/btd/src/erc1155/` |
| Needinesses → BTD | `computeSettlementBtdFromNeedinesses` (`@bitcode/btd/erc1155`) |
| Read API | `apps/uapi/app/api/read/synthesize-options/`, `apps/uapi/app/api/read/settle/` |
| UI | `apps/uapi/components/reads/*`, `apps/uapi/components/packs/*` |

## V48 whole Bitcode operator chain

1. Seller connects identity, wallet, organization, and source.
2. Bitcode synthesizes source-safe deposit AssetPack options.
3. Seller reviews measurements and approves an option for Depository admission.
4. Depository indexes admitted AssetPack metadata, measurements, embeddings,
   proof roots, and compensation posture.
5. Buyer connects identity, wallet, organization, and target repository.
6. Buyer requests a Read.
7. Bitcode synthesizes a Need and the buyer accepts or resynthesizes it.
8. Bitcode runs Finding Fits against the Depository.
9. Bitcode synthesizes a Need-Fit AssetPack and source-safe preview.
10. Buyer reviews measurements, quote, and proof posture.
11. Buyer settles with BTC-testnet (**one settle pipeline per bought option**).
12. Bitcode runs settle-btc → mint-btd (needinesses scalar to master) →
    settle-btd (BTD to buyer) → settle-asset-pack (ERC1155 co-ownership) →
    PR delivery, journals compensation, and synchronizes `/packs`.
13. Operators repair only through proof-backed state transitions.

## V48 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: deposit source bundle /
  **sourceCheckoutCatalog**, Host workspace, obfuscation guidance, deposit
  AssetPack option (**patch + measurements + metadata** with formal absolutes),
  Depository AssetPack, measurement vector / absolute readings, neediness
  preview or Unestimatable, selection envelope, storedArtifacts bundle,
  ledgerize journal roots, admission receipt, compensation expectation,
  PackActivity row, execution + execution_events rows.
- Current algorithms and derivation rules: **full law in measurement section +
  Gate 3 G3-1…G3-15** — SynthesizeDepositAssetPacks SDIVF (Setup clone → parallel
  LSP/MCP/obfuscations → danger-wall; Discovery parallel three agents with
  measure-inside-codebase; Implementation 2–4 kinds; Validation A/B/C ready-to-
  finish; Finish store → journal → selection envelope); policy/admission/
  earnings after options; settled-Depository demand estimate.
- Current invariants and fail-closed conditions: no source exposure before
  entitlement; no full catalog bodies in prompts/telemetry; no absolute-volume
  invention by LLMs; no Finish without absolutes; no critical IP admission
  without explicit approval; no compensation claim without settlement evidence;
  danger-wall short-circuit on invalid obfuscations; zero options fails the run.
- Current proof obligations: source connection receipt, option synthesis
  receipt, measurement receipt (absolutes), approval receipt, admission receipt,
  index root, selection-envelope / storedArtifacts schema roots.
- Current source-bearing implementation basis: Host checkout + catalog; source
  remains protected behind source-safe option review and storage boundaries
  (G3-14 source map).
- Current validating commands and parity basis: deposit agent prompt contracts,
  setup/discovery/validation/store-contract tests, PARITY D-01…D-18; later Gate
  4/7 for seller E2E and deposit-to-read continuity.
- Current accepted boundaries: deposit estimates / neediness are not final BTD
  until a Need-relative read binds them; `deposit:inventory` is legacy dual-write
  only.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: Read Request, synthesized
  Need, accepted Need, Prompt/PromptPart measurement commands, typed inference
  results, ReadFitsFindingSynthesis receipt, Need-Fit AssetPack.
- Current algorithms and derivation rules: synthesize Need, review/resynthesize
  Need, find Fits, measure Need-relative value, synthesize preview and delivery.
- Current invariants and fail-closed conditions: no Finding Fits without
  accepted Need, no paid delivery before settlement, no raw prompt/provider
  response disclosure.
- Current proof obligations: prompt identity, source-safe prompt digest, typed
  output, parsed result, telemetry receipt, proof root, repair posture.
- Current source-bearing implementation basis: protected source may inform
  inference only through entitlement-safe execution boundaries.
- Current validating commands and parity basis: V48 Gate 5 and Gate 7 tests
  must prove buyer flow and measurement visualization.
- Current accepted boundaries: inference output is advisory until parsed,
  typed, proof-bound, and state-admitted.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: candidate Fits, selected Fit
  set, recall receipts, ranking receipts, verification receipts, source-safe
  provenance summaries.
- Current algorithms and derivation rules: search Depository metadata,
  embeddings, measurements, lexical indexes, and proof roots; rank above
  threshold; verify candidate usefulness before AssetPack synthesis.
- Current invariants and fail-closed conditions: no candidate source disclosure
  before settlement, no survivor-free AssetPack, no ranking without proofable
  measurement basis.
- Current proof obligations: query synthesis receipt, search receipt, ranking
  receipt, selected Fit receipt, verification receipt.
- Current source-bearing implementation basis: source remains protected while
  measurement metadata and provenance summaries remain source-safe.
- Current validating commands and parity basis: V48 Gate 5 and Gate 7 tests
  must prove Fit search drives buyer preview and delivery.
- Current accepted boundaries: many Fits may contribute to one Need-Fit
  AssetPack and compensation follows source-to-shares after settlement.

### Selection and materialization

- Current canonical objects and emitted artifacts: Need-Fit AssetPack,
  withheld source bundle, preview, delivery branch, repository PR, delivery
  receipt.
- Current algorithms and derivation rules: synthesize source-safe preview
  before settlement, materialize source-bearing delivery only after settlement
  and rights transfer.
- Current invariants and fail-closed conditions: preview is not source; quote
  is not delivery; delivery requires settlement and rights transfer.
- Current proof obligations: preview boundary receipt, quote receipt,
  settlement receipt, BTD rights receipt, delivery receipt.
- Current source-bearing implementation basis: source-bearing output is
  withheld until entitlement.
- Current validating commands and parity basis: V48 Gate 5 and Gate 7 tests
  must prove repository delivery after settlement.
- Current accepted boundaries: failed delivery opens repair, not silent success.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: user identity, organization,
  team, wallet, role, policy, source connection, target repository connection,
  spend/deposit authority receipt.
- Current algorithms and derivation rules: bind actions to identity, wallet,
  org authority, connection authority, and policy.
- Current invariants and fail-closed conditions: no deposit, read, settlement,
  rights transfer, or delivery without authority.
- Current proof obligations: auth receipt, wallet receipt, provider receipt,
  policy receipt, denial receipt.
- Current source-bearing implementation basis: credentials and wallet private
  material remain secret.
- Current validating commands and parity basis: V48 Gate 6 and Gate 7 tests
  must prove Auxillaries and route authority.
- Current accepted boundaries: testnet BTC does not weaken identity or rights
  boundaries.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe preview,
  measurement visualization, proof-root projection, PackActivity projection,
  denied-state projection, repair projection.
- Current algorithms and derivation rules: expose only source-safe
  measurements, summaries, states, proof roots, and repair guidance before
  entitlement.
- Current invariants and fail-closed conditions: public projection
  overexposure blocks state advancement.
- Current proof obligations: disclosure policy receipt, projection receipt,
  no-source/no-secret scan, repair receipt.
- Current source-bearing implementation basis: raw source and raw protected
  prompts remain outside public projection.
- Current validating commands and parity basis: V48 Gate 6, Gate 7, and Gate 8
  tests must prove disclosure boundaries.
- Current accepted boundaries: source-safe value explanation is allowed; source
  transfer is not.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC-testnet quote, payment
  observation, finality receipt, BTD scalar, BTD rights receipt,
  source-to-shares allocation, compensation statement.
- Current algorithms and derivation rules: compute quote from weighted BTD
  scalar, observe BTC-testnet payment, finalize settlement, transfer rights,
  allocate source-to-shares.
- Current invariants and fail-closed conditions: observed payment is not
  finality, finality is required before source unlock, compensation requires
  conservation.
- Current proof obligations: quote receipt, wallet/provider receipt, ledger
  journal, rights receipt, compensation receipt, reconciliation receipt.
- Current source-bearing implementation basis: settlement payloads remain
  private except source-safe receipts.
- Current validating commands and parity basis: V48 Gate 5, Gate 6, and Gate 7
  tests must prove accounting and repair.
- Current accepted boundaries: V48 BTC amounts are testnet; state semantics are
  production-intended.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof root, generated
  artifact, witness, replay receipt, workflow receipt, repair case.
- Current algorithms and derivation rules: every state transition must bind to
  a proofable receipt or fail closed.
- Current invariants and fail-closed conditions: proof mismatch opens repair;
  stale promoted status truth is failure.
- Current proof obligations: generated artifact, replay proof, workflow proof,
  diff hygiene, test receipt.
- Current source-bearing implementation basis: proofs must be source-safe unless
  entitlement authorizes source-bearing delivery.
- Current validating commands and parity basis: V48 Gate 7, Gate 9, and Gate 10
  must prove replay and promotion readiness.
- Current accepted boundaries: proof readback decides; UI projection explains.

## V48 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v48-spec-family-report.json` | `measurement-prompt`, `need-synthesis`, `fit-synthesis` | `typed-measurement-output` | `v48-inference-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V46 inference and V48 measurement law |
| Prompt-completeness | `.bitcode/v48-spec-family-report.json` | `measurement-prompts`, `visualization-prompts` | `prompt-identity-bound` | `v48-prompt-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Prompt registry and V41/V46 canon |
| Static-code-analysis | `.bitcode/v48-canonical-input-report.json` | `route-static-contracts`, `workflow-hooks` | `source-safety-static` | `v48-static-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Current website source and workflows |
| Verification-decisions | `.bitcode/v48-spec-family-report.json` | `seller-decision`, `buyer-decision` | `measurement-before-price` | `v48-decision-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V48 state machine law |
| Selection-and-materialization | `.bitcode/v48-spec-family-report.json` | `fit-selection`, `delivery-materialization` | `settlement-before-source` | `v48-materialization-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Reading and delivery packages |
| Authorization-and-sensitive-flow | `.bitcode/v48-canonical-input-report.json` | `identity`, `wallet`, `source-connection` | `authority-required` | `v48-authority-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Auxillaries and route authority |
| Settlement-source-to-shares | `.bitcode/v48-spec-family-report.json` | `quote`, `settlement`, `compensation` | `btctestnet-conservation` | `v48-settlement-readback` | `BITCODE_SPEC_V48_PROVEN.md` | BTD/BTC accounting canon |
| Disclosure-boundary | `.bitcode/v48-canonical-input-report.json` | `preview`, `measurement-visualization` | `no-unpaid-source` | `v48-disclosure-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V45/V46 source-safety canon |
| Proof-contract | `.bitcode/v48-spec-family-report.json` | `proof-root`, `replay`, `repair` | `proof-readback-decides` | `v48-proof-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Generated proof and workflow canon |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: measurement prompts, Need synthesis, deposit option synthesis, Finding Fits, AssetPack synthesis
- theoremIds: typed-measurement-output, inference-source-safety, measurement-before-price
- replayStepIds: v48-inference-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: every inference-owned measurement must have prompt identity, typed output, proof root, and repair posture
- current member verdict shape: source-safe typed receipt
- current theorem-by-theorem closure reading: inference may guide state only after typed parsing and proof binding
- current theorem-to-replay grouping: prompt identity, typed output, and measurement visualization replay together
- minimum artifact/replay binding set: prompt registry id, digest, typed output schema, telemetry receipt
- current proof-object fields: promptId, promptDigest, outputType, measurementId, proofRoot
- generated-artifact and test bindings: V48 Gate 1 checker and later Gate 7 E2E tests
- fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility

### Prompt-completeness

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: measurement PromptParts, seller visualization prompts, buyer visualization prompts
- theoremIds: prompt-identity-bound, prompt-output-typed
- replayStepIds: v48-prompt-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: every measurement prompt must be catalogued and source-safe
- current member verdict shape: prompt contract receipt
- current theorem-by-theorem closure reading: prompt composition must identify source boundaries and output schema
- current theorem-to-replay grouping: prompt registry and measurement output replay together
- minimum artifact/replay binding set: PromptPart ids, Prompt id, interpolation keys, schema id
- current proof-object fields: promptPartIds, promptId, interpolationDigest, outputSchema
- generated-artifact and test bindings: V48 measurement-law parity and prompt tests
- fail-closed conditions: missing prompt part, raw prompt leakage, schema mismatch

### Static-code-analysis

- proofArtifactPath: `.bitcode/v48-canonical-input-report.json`
- members: route contracts, workflow hooks, no-source scans
- theoremIds: source-safety-static, route-state-static
- replayStepIds: v48-static-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: code and workflow changes must align to V48 launch scope
- current member verdict shape: static pass/fail receipt
- current theorem-by-theorem closure reading: static source must not expose protected payloads or stale route names
- current theorem-to-replay grouping: source scan and spec-family scan replay together
- minimum artifact/replay binding set: source paths, route ids, forbidden phrase scan
- current proof-object fields: sourcePath, predicateId, verdict, proofRoot
- generated-artifact and test bindings: gate/canon workflows and check-v48-gate1
- fail-closed conditions: source exposure, stale route, missing workflow hook

### Verification-decisions

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: seller approval, buyer payment, operator repair
- theoremIds: measurement-before-price, proof-before-state
- replayStepIds: v48-decision-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: decisions must show source-safe measurement and authority
- current member verdict shape: decision receipt
- current theorem-by-theorem closure reading: no decision is valid without measurement and proof
- current theorem-to-replay grouping: measurement, decision, and state transition replay together
- minimum artifact/replay binding set: actor, authority, measurement root, state transition
- current proof-object fields: actorId, authorityId, measurementRoot, transitionId
- generated-artifact and test bindings: V48 E2E seller/buyer tests
- fail-closed conditions: authorization denial, missing measurement, projection mismatch

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: Fit selection, AssetPack preview, repository delivery
- theoremIds: settlement-before-source, selected-fit-proof
- replayStepIds: v48-materialization-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: selected Fits and delivery must have proof roots
- current member verdict shape: materialization receipt
- current theorem-by-theorem closure reading: delivery follows settlement and rights transfer
- current theorem-to-replay grouping: Fit selection, quote, settlement, and delivery replay together
- minimum artifact/replay binding set: fitSetId, assetPackId, quoteId, deliveryId
- current proof-object fields: fitSetId, previewRoot, settlementRoot, deliveryRoot
- generated-artifact and test bindings: V48 Gate 5 and Gate 7
- fail-closed conditions: no-survivor asset pack, settlement mismatch, delivery failure

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v48-canonical-input-report.json`
- members: identity, organization, wallet, source connection, repository connection
- theoremIds: authority-required, secrets-never-projected
- replayStepIds: v48-authority-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: every sensitive action must bind to authority and no-secret projection
- current member verdict shape: authority receipt
- current theorem-by-theorem closure reading: testnet does not weaken authority
- current theorem-to-replay grouping: identity, wallet, connection, and route action replay together
- minimum artifact/replay binding set: identityId, orgId, walletId, providerId, routeActionId
- current proof-object fields: subjectId, policyId, walletReceipt, providerReceipt
- generated-artifact and test bindings: V48 Gate 6 and Gate 7
- fail-closed conditions: authorization denial, secret leakage, missing wallet

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: quote, BTC-testnet observation, finality, BTD rights, compensation
- theoremIds: btctestnet-conservation, source-to-shares-conservation
- replayStepIds: v48-settlement-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: quote, settlement, rights, and compensation must conserve measured BTD and source-to-shares
- current member verdict shape: accounting receipt
- current theorem-by-theorem closure reading: BTC-testnet is free economically but not loose semantically
- current theorem-to-replay grouping: quote, payment, finality, rights, compensation replay together
- minimum artifact/replay binding set: quoteId, paymentId, btdScalar, rightsId, allocationId
- current proof-object fields: quoteAmount, testnetTxid, btdScalar, allocationRoot
- generated-artifact and test bindings: V48 Gate 5, Gate 6, Gate 7
- fail-closed conditions: settlement conservation drift, payment mismatch, compensation mismatch

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v48-canonical-input-report.json`
- members: preview, measurement visualization, proof projection
- theoremIds: no-unpaid-source, measurement-visible-source-hidden
- replayStepIds: v48-disclosure-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: every pre-settlement display must expose value without exposing source
- current member verdict shape: disclosure receipt
- current theorem-by-theorem closure reading: measurements can reveal value, confidence, risk, and fit but not protected source
- current theorem-to-replay grouping: projection policy and UI state replay together
- minimum artifact/replay binding set: projectionId, measurementIds, no-source scan
- current proof-object fields: projectionId, allowedFields, deniedFields, scanRoot
- generated-artifact and test bindings: V48 Gate 6, Gate 7, Gate 8
- fail-closed conditions: public projection overexposure, raw prompt leakage, unpaid source leakage

### Proof-contract

- proofArtifactPath: `.bitcode/v48-spec-family-report.json`
- members: proof root, workflow receipt, replay receipt, repair receipt
- theoremIds: proof-readback-decides, stale-truth-fails
- replayStepIds: v48-proof-readback
- witnessArtifactPaths: `BITCODE_SPEC_V48_PROVEN.md`
- current member closure criteria: every state transition must be proof-readable
- current member verdict shape: proof receipt
- current theorem-by-theorem closure reading: projection explains, proof decides
- current theorem-to-replay grouping: generated artifact, workflow, and repair replay together
- minimum artifact/replay binding set: artifactRoot, workflowRun, stateTransition, repairId
- current proof-object fields: artifactRoot, workflowId, transitionId, repairState
- generated-artifact and test bindings: V48 Gate 10 promotion readiness
- fail-closed conditions: stale promoted status truth, missing proof root, generated artifact drift

## V48 generated canon

### Appendix C. Generated artifact contract catalog

#### Inherited V19 reproducible-canon artifacts

`.bitcode/v19-contract-change-ledger.json`,
`.bitcode/v19-negative-proof-mutation-matrix.json`,
`.bitcode/v19-proof-member-semantic-matrix.json`,
`.bitcode/v19-theorem-evidence-matrix.json`,
`.bitcode/v19-state-machine-matrix.json`,
`.bitcode/v19-deterministic-replay-report.json`, and
`.bitcode/v19-volatility-inventory.json` remain historical reproducibility
inputs.

#### Inherited V20 operator-quality artifacts

`.bitcode/v20-operator-acceptance-transcript.json`,
`.bitcode/v20-visual-regression-report.json`,
`.bitcode/v20-accessibility-report.json`,
`.bitcode/v20-performance-budget-report.json`,
`.bitcode/v20-projection-quality-smoke-matrix.json`,
`.bitcode/v20-quality-summary.json`, and `ENGI_SPEC_V20_PROVEN.md` remain
historical operator-quality inputs.

#### Exact generated-artifact inventory matrix

| artifactPath | role | disclosability |
| --- | --- | --- |
| `.bitcode/v48-spec-family-report.json` | V48 spec-family validation report | source-safe |
| `.bitcode/v48-canonical-input-report.json` | V48 canonical-input validation report | source-safe |
| `BITCODE_SPEC_V48_PROVEN.md` | V48 generated proof appendix after promotion readiness | source-safe |

#### V48 specifying generated artifacts

V48 Gate 1 reserves `.bitcode/v48-spec-family-report.json` and
`.bitcode/v48-canonical-input-report.json`. Later gates may add launch,
measurement, route, and E2E rehearsal artifacts.

#### Shared generated-artifact fields

All V48 generated artifacts must carry artifact id, version, generatedAt or
deterministic marker, source roots, proof root, source-safety verdict,
predicate results, aggregate proof verdict, and repair posture.

#### Artifact-specific generated payload fields

Measurement artifacts must include measurement ids, weights, normalized
contributions, prompt identities, typed output schemas, visualization fields,
and source-safety denials.

#### Artifact confidentiality and disclosability taxonomy

V48 artifacts classify fields as public, operator, buyer, reviewer, internal,
source-bearing, secret, or denied.

#### Minimum generated appendix rendered contents

The generated appendix must render aggregate proof verdict, exact proof-family
inventory, exact per-family member inventory, exact per-family theorem
inventory, exact replay-step inventories and theorem bindings, witness artifact
inventories, generated artifact inventories, scenario and run coverage matrices,
proof-source commit, and fail closed when conditions.

#### Canonical regeneration and fail-closed posture

Regeneration must fail closed when source roots drift, proof roots mismatch,
generated artifact inventories are incomplete, scenario and run coverage
matrices are stale, proof-source commit is missing, or source-safety scans fail.

## V48 validation canon

V48 Gate 1 validation requires:

- `node scripts/check-bitcode-spec-family.mjs --version V46 --mode promoted --current-target V46`
- `node scripts/check-bitcode-spec-family.mjs --version V48 --mode draft --current-target V46`
- `node scripts/check-bitcode-canonical-inputs.mjs --current-target V46`
- `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V46 --draft-target V48`
- `node scripts/check-v48-gate1-scope-measurement-launch-freeze.mjs --skip-branch-check`

Later gates must add focused tests, browser E2E, proof generation, staging
rehearsal, and promotion readiness checks.

## V48 promotion canon

V48 may promote only after all gates close, all generated artifacts are fresh,
all commercial website launch tests are green, staging-testnet rehearsal proves
seller and buyer E2E flows, and the maintained promotion workflow advances
`BITCODE_SPEC.txt` to `V48`.

V48 promotion readiness canon: Gate 10 owns
`.bitcode/v48-promotion-readiness-report.json`, the
`buildV48PromotionReadinessReport` package object, and `check:v48-gate10`
(with `--promotion-mode` accepting V46 pre-promotion or V48 post-promotion
pointer truth). The readiness report binds every accepted V48 launch artifact
(Gates 2 through 9), the generated `BITCODE_SPEC_V48_PROVEN.md` support, the
V48 entries in `promote-bitcode-canon.mjs`,
`prepare-bitcode-spec-family-promotion.mjs`, and the runtime promotion
preparation, `v48-canon-promotion.yml`, gate/canon workflow posture for both
pre- and post-promotion pointers, package exports, focused tests, README
documentation, and the prepared post-promotion `V48 active / draft V48`
posture. Promotion remains blocked while any evidence is missing, stale,
source-unsafe, or while value-bearing mainnet admission is implied.

## V48 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

Canonical surfaces are `/deposits`, `/reads`, `/packs`, Auxillaries, Depository
indexes, proof roots, workflow receipts, ledger journals, database projections,
object-storage roots, wallet/provider receipts, and repository delivery
receipts. API/MCP, ChatGPT App, and Bitcode Chat remain compatibility surfaces
for V48, not commercial launch scope.

### Appendix B. Proof family closure catalog

The nine proof families above close through measurement, state-machine,
disclosure, settlement, delivery, repair, and promotion evidence.

### Appendix D. Validation and checking gate catalog

V48 gates:

1. Scope, Testnet Semantics, Measurement Law, And Launch Freeze.
2. Feature Excess And Gate Alignment Audit. Gate 2 owns
   `.bitcode/v48-feature-excess-alignment-audit.json`, the
   `buildV48FeatureExcessAlignmentAudit` package object, and
   `check:v48-gate2`.
3. Seller And Buyer State Machine Law. Gate 3 owns
   `.bitcode/v48-seller-buyer-state-machine-law.json`, the
   `buildV48SellerBuyerStateMachineLaw` package object, and
   `check:v48-gate3`.
4. Depositor Website Completion. Gate 4 owns
   `.bitcode/v48-depositor-website-completion.json`, the
   `buildV48DepositorWebsiteCompletion` package object, and
   `check:v48-gate4`.
5. Reader Website Completion. Gate 5 owns
   `.bitcode/v48-reader-website-completion.json`, the
   `buildV48ReaderWebsiteCompletion` package object, and
   `check:v48-gate5`.
6. Packs And Auxillaries Commercial Dashboard. Gate 6 owns
   `.bitcode/v48-packs-auxillaries-commercial-dashboard.json`, the
   `buildV48PacksAuxillariesCommercialDashboard` package object, and
   `check:v48-gate6`.
7. E2E IP Selling And Buying Tests. Gate 7 owns
   `.bitcode/v48-e2e-ip-selling-buying-tests.json`, the
   `buildV48E2eIpSellingBuyingTests` package object, and
   `check:v48-gate7`.
8. Landing Page And Public Launch Messaging. Gate 8 owns
   `.bitcode/v48-landing-public-launch-messaging.json`, the
   `buildV48LandingPublicLaunchMessaging` package object, and
   `check:v48-gate8`.
9. Staging-Testnet Deployment Rehearsal. Gate 9 owns
   `.bitcode/v48-staging-testnet-deployment-rehearsal.json`, the
   `buildV48StagingTestnetDeploymentRehearsal` package object, and
   `check:v48-gate9`.
10. Promotion Readiness. Gate 10 owns
    `.bitcode/v48-promotion-readiness-report.json`, the
    `buildV48PromotionReadinessReport` package object, and
    `check:v48-gate10`.

### Appendix E. Current canonical source map

Current source map roots include `uapi`, `packages/btd`,
`packages/pipeline-asset-pack`, `packages/pipeline-hosts`,
`packages/specifying`, `packages/prompts`, `packages/executions-mcp`,
`packages/chatgptapp`, `protocol-demonstration`, `.github/workflows`, and
`.bitcode` generated artifacts.

V48 Gate 2 source-safe generated artifact:
`.bitcode/v48-feature-excess-alignment-audit.json`. It records launch routes,
supporting surfaces, deferred surfaces, feature policies, forbidden launch
entry targets, source-safe payload boundaries, source-root digests, and
predicate results without serializing source, prompt payloads, wallet private
material, settlement private payloads, or mainnet value-bearing authority.

V48 Gate 3 source-safe generated artifact:
`.bitcode/v48-seller-buyer-state-machine-law.json`. It records IP seller
states, IP buyer states, transition guards, measurement ids, source-safe field
ids, forbidden payload classes, source-root digests, and predicate results.
The law requires measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, BTC finality before BTD rights,
BTD rights before source delivery, `/packs` history projection after each
transition, and fail-closed repair on missing evidence.

V48 Gate 4 source-safe generated artifact:
`.bitcode/v48-depositor-website-completion.json`. It records the five-step
`/deposits` route session steps, journaled pipeline and event ids, visible
seller decision ids (measurement catalog, criticality, demand, ROI, BTD
potential, BTC source-to-shares preview, admission, `/packs` activity sync,
and authority states), completion rows for source connection, option-synthesis
journaling, source-safe measurement review, admission and repair actions,
compensation/authority readback, and `/packs` history readback, forbidden
payload classes, source-root digests, and predicate results without
serializing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or settlement private payloads.

V48 Gate 5 source-safe generated artifact:
`.bitcode/v48-reader-website-completion.json`. It records the five-step
`/reads` route session steps, owned pipeline ids, source-safe readback ids
(fit measurement review, quote basis, payment observation, settlement
finality, BTD rights receipt, delivery receipt), visible buyer decision ids
(Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence,
delivery readiness, selected Fit provenance, final BTD scalar, quote basis,
settlement/finality/rights/delivery states, `/packs` activity sync, and
authority states), completion rows for Read request initiation, Need review
acceptance, fit measurement review, quote-before-settlement,
settlement/finality/rights/delivery ordering, and `/packs` history readback,
forbidden payload classes, source-root digests, and predicate results without
serializing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or settlement private payloads.

V48 Gate 6 source-safe generated artifact:
`.bitcode/v48-packs-auxillaries-commercial-dashboard.json`. It records the
`/packs` master-detail dashboard contract (searchable activity table,
type/state facets, saved market-intelligence filters, and a row-owned detail
surface covering overview, measurements, state readback, repair surface,
accounting, governance, and proof roots), the tracked settlement, BTD rights,
compensation, delivery, and repair states with rights derived only from
finality-consistent commodity-state evidence, the fail-closed repair surface
listing commodity-state blockers, the Auxillaries pane coverage (identity
profile, external source connections, interfaces, wallet authority with BTD
history readback, organization team and treasury settings), forbidden payload
classes, source-root digests, and predicate results without serializing
protected source, unpaid AssetPack source, raw prompts, raw provider
responses, wallet private material, or settlement private payloads.

V48 Gate 7 source-safe generated artifact:
`.bitcode/v48-e2e-ip-selling-buying-tests.json`. It records the browser-proof
scenarios (IP seller deposits an AssetPack on `/deposits`; IP buyer reviews
fit measurements, quote basis, settlement finality, BTD rights, and
repository delivery on `/reads`; `/packs` reads back settlement, rights,
compensation, delivery, and the fail-closed repair surface), the
deterministic mock-mode host bindings (stateful execution-history
journaling, VCS/auxillary mocks, browser error trap), the verification ids
covering source-connection-before-synthesis through
fail-closed-repair-surface, forbidden payload classes, source-root digests,
and predicate results without serializing protected source, unpaid AssetPack
source, raw prompts, raw provider responses, wallet private material, or
settlement private payloads. The browser proof runs on BTC-testnet semantics
only.

V48 Gate 8 source-safe generated artifact:
`.bitcode/v48-landing-public-launch-messaging.json`. It records the public
launch narrative law: the landing testnet section stating the meaning of
commercial testnet (BTC amounts are testnet and free; measurements, quotes,
settlement ordering, BTD rights, and repository delivery stay
production-intended), the deposit → read → packs core-flow messaging with
launch-route links, the proof-backed trust and source-safe IP exchange
positioning, the public docs testnet-meaning card with the blocked
value-bearing mainnet posture, the preserved promoted V46 claim-boundary
tokens, surface ids, message ids, forbidden payload classes, source-root
digests, and predicate results without serializing protected source, unpaid
AssetPack source, raw prompts, raw provider responses, wallet private
material, or settlement private payloads.

V48 Gate 9 source-safe generated artifact:
`.bitcode/v48-staging-testnet-deployment-rehearsal.json`. It records the
staging-testnet rehearsal law: dry-run lane receipts for the full-stack
deployment (Vercel website host, Supabase database/ledger projections,
object-storage roots, long-runner pipeline host, BTC-testnet settlement
provider), the realistic-data contract minimums (24 deposit AssetPack
options, 12 admitted Depository AssetPacks, 18 Read requests and accepted
Needs, 12 source-safe previews and BTC-testnet quotes, 9 settlement
observations, finality confirmations, and BTD rights transfers, 6 repository
PR deliveries and compensation statements, 3 repair cases), the settlement
observation ordering law (observation → finality → rights → delivery), the
blocked value-bearing mainnet lane, the deployment truth source digests
(vercel.json, supabase config and migrations, long-runner Dockerfiles and
Kubernetes manifest), the rehearsal validation command catalog, forbidden
payload classes, and predicate results. Lane receipts are dry-run with live
execution operator opt-in; no live service credentials are serialized.

### Appendix F. Subsystem totality and derivability matrix

Required coverage phrases: repo supply and depositing; reading and measured
demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and
ranking; verification decisions; selection and materialization; branch
artifacts and assetPackEvidence; identity, authority, signing, and policy;
sensitive data and confidentiality flows; projection, disclosure, and
redaction; proof families, members, theorems, witnesses, and replay;
settlement, source-to-shares, journals, and exact accounting; telemetry,
persistence, state, and failure semantics; host/runtime capability truth;
operator experience and pedagogy; validation and test stack; generated
artifacts and canonical promotion.

### Appendix G. Canonical file-family and promotion contract catalog

The V48 file family is `BITCODE_SPEC_V48.md`,
`BITCODE_SPEC_V48_DELTA.md`, `BITCODE_SPEC_V48_NOTES.md`,
`BITCODE_SPEC_V48_PARITY_MATRIX.md`, and eventually
`BITCODE_SPEC_V48_PROVEN.md`. Promotion must be workflow-driven.

### Appendix H. Operator surface and quality contract catalog

Operators need source-safe views of seller flow, buyer flow, measurements,
quotes, BTC-testnet observations, BTD rights, delivery, compensation, repair,
proof roots, and workflow receipts. Operator surfaces must remain measurable,
readable, accessible, performant, and repairable.

### Appendix I. Scenario, workflow, and cross-product contract catalog

V48 keeps historical scenario coverage terms auth-issuer-rollback,
privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation,
auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch,
context, public, buyer, reviewer, internal, Openly writable, Measurably
readable, Provable, and Valuable.

New V48 scenarios are IP seller deposits an AssetPack and IP buyer buys a
Need-Fit AssetPack on staging-testnet.

### Appendix J. Fail-closed contract and error posture matrix

V48 fails closed on invalid deposit, prompt contract incompleteness,
parsed-envelope inadmissibility, no-survivor asset pack, authorization denial,
public projection overexposure, settlement conservation drift, stale promoted
status truth, measurement formula drift, BTC-testnet quote mismatch, and
repository delivery failure.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing artifacts include `.bitcode/asset-pack.lock.json`,
`.bitcode/selected-source-material.json`,
`.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`,
`.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and
`BITCODE_SPEC_V48_PROVEN.md`. Source-bearing payloads remain protected until
entitlement; source-safe receipts may be projected.

## V48 accepted boundaries and reopen conditions

- V48 replaced V46 as active canon through the promotion workflow.
- V48 Gate 1 does not authorize runtime behavior changes.
- V48 testnet means BTC amounts are testnet only; system behavior remains
  production-intended.
- Measurement must be visible and source-safe before a user decides to deposit
  or buy.
- Conversation surfaces, ChatGPT App commercialization, MCP/API
  commercialization, deeper BTD mining cryptography, mainnet launch authority,
  and advanced market mechanics are deferred to later versions.
- Any source leakage, measurement ambiguity, quote/finality collapse, rights
  ambiguity, or delivery ambiguity reopens the relevant gate.

## V48 completion condition

V48 Gate 1 is complete when the V48 draft spec family exists over active V46,
testnet semantics and measurement law are specified, the seller/buyer launch
scope and ten-gate plan are recorded, the roadmap names V48 as active draft
target, `check:v48-gate1` exists, gate/canon workflows validate active V46 plus
draft V48, and the gate branch is committed, pushed, and pull-requested into
`version/v48`.

V48 Gate 2 is complete when launch-facing entrypoints resolve to `/deposits`,
`/reads`, and `/packs`; old `/exchange` entrypoints are compatibility redirects
or rewritten into `/packs`; BTD acquisition and detail paths no longer send
users to `/terminal` or `/exchange`; `/terminal` is not a launch CTA and is
scheduled for eradication (compatibility redirect only); Conversations full
commercial experience remains deferred while structure may persist; API/MCP,
ChatGPT App, Bitcode Chat, value-bearing mainnet, source-bearing previews, and
advanced market mechanics are explicitly deferred; `.bitcode/v48-feature-excess-
alignment-audit.json` is generated; `check:v48-gate2` validates the audit; and
gate/canon workflows run the Gate 2 checker under promoted V48 canon.

V48 frontend component architecture and Terminal eradication (implementation
quality workstream on `version/v48`, not a separate product gate number) is
complete when the three-layer / seven-experience component law above is
realized in source, live modules no longer import `apps/uapi/app/terminal/`, product
Pipeline naming replaces Execution/Terminal UI names, generalizable utilities
prefer packages, and parity matrix rows for this workstream are closed.

V48 Gate 3 is complete when the IP seller state machine covers source
connection, deposit AssetPack option synthesis, source-safe measurement review,
Depository admission approval, and compensation/repair tracking; the IP buyer
state machine covers Read request, Need review, Finding Fits, source-safe
AssetPack preview, BTC-testnet settlement, BTD rights, and repository delivery;
the guards enforce measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, BTC finality before BTD rights,
BTD rights before source delivery, `/packs` history projection, and
fail-closed repair; `.bitcode/v48-seller-buyer-state-machine-law.json` is
generated; `check:v48-gate3` validates the law; and gate/canon workflows run
the Gate 3 checker under promoted V48 canon.

V48 Gate 4 is complete when the `/deposits` route binds source connection
before option synthesis; option synthesis, review, and admission decisions are
journaled as source-safe execution rows; depositors review measurements,
criticality, demand, ROI, BTD potential, BTC source-to-shares preview, and
option roots before approval; approved policy-eligible options emit admission
readback synchronized to `/packs`; compensation estimates, supply
recommendations, and organization/wallet authority state are visible as
source-safe metadata; `.bitcode/v48-depositor-website-completion.json` is
generated; `check:v48-gate4` validates the completion; and gate/canon
workflows run the Gate 4 checker under promoted V48 canon.

V48 Gate 5 is complete when the `/reads` route binds Read request initiation
from a connected repository source; a synthesized Need is reviewed and
accepted before Finding Fits; readers review source-safe fit measurements,
selected Fit provenance, final BTD scalar, and BTC-testnet quote basis before
paying; the deterministic quote derives from weighted measurement
contributions; payment observation, BTC-testnet finality, BTD rights transfer
receipt, and repository PR delivery render as ordered fail-closed readback
with delivery locked until rights transfer; Reading activity and settled
AssetPacks remain reachable through `/packs`;
`.bitcode/v48-reader-website-completion.json` is generated; `check:v48-gate5`
validates the completion; and gate/canon workflows run the Gate 5 checker
under promoted V48 canon.

V48 Gate 6 is complete when `/packs` renders searchable master-detail
PackActivity with type, scope, repository, and settlement, compensation,
delivery, and repair facets; the detail surface reads back overview,
measurements, settlement, BTD rights, compensation, delivery, and repair
states, accounting, governance, and proof roots; BTD rights states derive
only from finality-consistent commodity-state evidence; repair-required
activity exposes a fail-closed repair surface listing commodity-state
blockers; Auxillaries panes cover identity profile, external source
connections, interfaces, wallet authority with BTD history readback, and
organization team and treasury settings;
`.bitcode/v48-packs-auxillaries-commercial-dashboard.json` is generated;
`check:v48-gate6` validates the completion; and gate/canon workflows run the
Gate 6 checker under promoted V48 canon.

V48 Gate 7 is complete when browser-level tests prove both sides of Bitcode
in deterministic mock mode: depositing IP through source connection, option
synthesis, source-safe measurement review, and Depository admission on
`/deposits` with journaled execution rows; buying synthesized IP through the
five-step `/reads` session with the fit measurement review, final BTD scalar,
and deterministic BTC-testnet quote basis rendered before payment and with
payment observation, finality, BTD rights receipt, and repository PR delivery
read back in order; auditing settlement, rights, compensation, delivery, and
the fail-closed repair surface on `/packs`; the browser error trap stays
clean; `uapi` exposes `test:e2e:ip-exchange`;
`.bitcode/v48-e2e-ip-selling-buying-tests.json` is generated;
`check:v48-gate7` validates the coverage; and gate/canon workflows run the
Gate 7 checker under promoted V48 canon.

V48 Gate 8 is complete when the landing page renders a commercial-testnet
section explaining that BTC amounts are testnet and free while protocol
behavior stays production-intended; the deposit → read → packs core flow is
documented with launch-route links; proof-backed trust and source-safe IP
exchange positioning are stated; public docs carry the testnet-meaning card
with blocked value-bearing mainnet posture; promoted V46 claim-boundary
tokens and launch navigation remain intact;
`.bitcode/v48-landing-public-launch-messaging.json` is generated;
`check:v48-gate8` validates the messaging; and gate/canon workflows run the
Gate 8 checker under promoted V48 canon.

V48 Gate 9 is complete when the staging-testnet rehearsal law binds the
deployment truth sources for every launch surface; the realistic-data
contract minimums are satisfied by the rehearsed population; the BTC-testnet
settlement observation lane preserves the production ordering law; the
value-bearing mainnet lane rehearses as blocked; lane receipts remain dry-run
with live execution operator opt-in and no serialized live credentials;
`.bitcode/v48-staging-testnet-deployment-rehearsal.json` is generated;
`check:v48-gate9` validates the rehearsal; and gate/canon workflows run the
Gate 9 checker under promoted V48 canon.

V48 Gate 10 is complete when the promotion readiness report binds all accepted
Gate 2-9 artifacts as present, parseable, and source-safe; the promotion
scripts, spec-family and runtime promotion preparation, proven generation, and
`v48-canon-promotion.yml` support V48; gate/canon workflows validate both the
V46 pre-promotion and V48 post-promotion pointer postures; a draft-preview
`BITCODE_SPEC_V48_PROVEN.md` is generated; the V48 promotion dry-run passes;
`.bitcode/v48-promotion-readiness-report.json` is generated; `check:v48-gate10`
validates the readiness; and the prepared post-promotion posture is
V48 active / draft V48 under promoted V48 canon until the promotion
workflow advances `BITCODE_SPEC.txt`.
