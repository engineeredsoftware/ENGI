# Bitcode Spec V48

## Status

- Version: `V48`
- V48 state: full-system draft SPEC open for Complete Implementation Derivability
  (sole rebuild law for the system described herein)
- Current canonical/latest target: `V47`
- Prior canonical anchor: `BITCODE_SPEC_V47.md` (historical process only — not
  required for V48 semantic recovery)
- Prior generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md` (historical
  process only — not required for V48 semantic recovery)
- Generated structured artifact inventory: draft V48 family
  (`.proofs/v48/spec-family-report.json`, `.proofs/v48/canonical-input-report.json`,
  `.proofs/v48/canon-posture-drift-report.json` when regenerated) and
  `BITCODE_SPEC_V48_PROVEN.md`
- Source parity state: V48 product surfaces and pipelines are specified for
  rebuild from this SPEC alone; living source under `apps/uapi` and
  `packages/` implements that law
- Notes companion: `BITCODE_SPEC_V48_NOTES.md`
- Delta companion: `BITCODE_SPEC_V48_DELTA.md`
- Parity companion: `BITCODE_SPEC_V48_PARITY_MATRIX.md`
- Scope: entire Bitcode stack described below — deposit SDIVF, read SDIVF,
  settle Simple, Exchange activity, measurement, disclosure/rights, identity,
  BTD/settlement, proofs, promotion
- Posture: **sole-complete draft** — pointer may still name V47 until promotion;
  **all V48 rebuild semantics live only in this family**

### Identity freeze (binding)

| Concept | Canonical term |
|---|---|
| Commodity | **DataPack** (product language). Residual code packages may still use
  `AssetPack*` identifiers; product prose and this SPEC use **DataPack**. |
| Seller route | `/deposits` |
| Buyer route | `/reads` |
| Market / activity route | **`/exchange`** (primary). Any `/packs` path is compatibility
  redirect or retired cockpit — not a launch CTA. |
| Experiences | Marketing, Exchange, Reads, Deposits, Docs, Conversations, Auxillaries |

```
DataPack =
  commercial .patch   // create|modify file material (bodies for entitled viewers)
  + measurements      // absolutes (+ needinesses on read); materialIdentity?; measureReport?
  + metadata          // kind, title, summary, commercialTitle/Description, roots, …
```


## Version executive summary

V48 is the **complete** Bitcode system specification for commercial website
testnet readiness: identity/wallet/GitHub authenticity; `/deposits`
SynthesizeDepositDataPacks SDIVF; deposit full-stack option
policy/admission/earnings/authority; settled-Depository demand honesty;
`/reads` synthesize + multi-rail settle; `/exchange` activity ledger; source-safe
telemetry; measurement excellence (full absolute catalogue with honesty).

V48 does not make mainnet value-bearing claims. "Testnet" means BTC (and other
pay-rail) amounts and settlement observations are testnet-class while the rest of
the system behaves as production-intended. Measurement is the commercial
primitive: absolutes on deposit, Need-relative fit on read, weighted BTD scalar
for quote/rights, seller/buyer visualization without unpaid source leakage.

Product defaults that must appear in any rebuild: Anthropic model
`claude-haiku-4-5` (overridable), deposit-native SDIVF roster (no lens), DIV
`maxIterations=1`, LLM call timeout 180s, **sourceCheckoutCatalog**, DataPack =
patch + measurements + metadata with formal **DATA_PACK_ABSOLUTES_CATALOG**
(65 kinds, Σ weights = 1, honesty `status` + optional materialIdentity +
measureReport), empty Obfuscations skip Setup LLM, Permissible sources/Exclusions
path scope, Unestimatable demand when settled Depository search cannot ground
estimates, **four** deposit Implementation agents (plan → patchfile with hybrid
bodies → measurements → commercial-nl).

## Canonical Bitcode executive summary

Bitcode commoditizes knowledge by packaging source, documents, data, workflows,
and other technical materials as **DataPacks**. Depositors supply DataPacks into
the Depository. Readers ask Bitcode to understand a Read Request, synthesize a
Need, find fitting Depository DataPacks, synthesize a Need-Fit DataPack,
preview source-safe measurements and commercial prose, settle on a pay rail,
receive BTD volume/rights, and receive entitled repository delivery (`.patch` /
PR).

BTD is the weighted scalar knowledge-volume measured from knowledge-bearing
material. Deposit-side options may show estimated BTD; final commercial volume
for settle is Need-relative (needinesses-weighted) and bound to settlement,
rights, delivery, and source-to-shares compensation.

V48 makes the website commercially demonstrable on staging-testnet by proving
both sides of the exchange: IP sellers deposit DataPacks on `/deposits`; IP
buyers purchase Need-fitting DataPacks on `/reads`; network activity rereads on
`/exchange`.

## V48 source-of-truth hierarchy

This V48 family is the **sole rebuild authority** for the system described here:

| File | Role |
|---|---|
| `BITCODE_SPEC_V48.md` | **Single full-system SPEC** — Complete Implementation Derivability |
| `BITCODE_SPEC_V48_DELTA.md` | Why V48 / accepted decisions / deferred / commit direction |
| `BITCODE_SPEC_V48_NOTES.md` | Architecture decisions, simplified reading (weaker than SPEC) |
| `BITCODE_SPEC_V48_PARITY_MATRIX.md` | Spec ↔ implementation ↔ test audit |
| `BITCODE_SPEC_V48_PROVEN.md` | Generated proof appendix (draft) |

**Non-canonical companions** (README, FAMILIARIZATION, AGENTS, layout docs, etc.):
orientation and craft only. They **must not** be required to supply omitted
system semantics. Adjuncts may link SPEC; SPEC must not depend on them.

**Sole-completeness law.** This SPEC must restate all system meaning required
to rebuild Bitcode. Readers must not need other versioned SPEC files to recover
design or implementation law. Companions sharpen or evidence; they do not
replace omitted chapters.

Implementation remains unversioned in source paths. Routes, packages,
components, tests, prompts, telemetry, schemas, APIs, and workflows move in place
as the single current Bitcode system.

## V48 full-system, re-implementation, and audit rule

V48 must be reconstructable from this draft family, source code, generated
artifacts, proof roots, workflow receipts, ledger journals, database
projections, object-storage roots, wallet/provider receipts, repository
delivery receipts, and source-safe telemetry.

No **product/API/UI** surface may disclose protected source, unpaid DataPack
file bodies, raw prompts, raw model/provider responses, credentials, wallet
private material, private settlement payloads, private repository access, or
source-bearing delivery contents before entitlement.

**Disclosure boundary (binding):** source-safety is a **product and API
projection** law (what users and unpaid clients may see). It is **not** a ban
on sending full checkout or patch bodies to synthesis LLM providers. Pre-launch
third-party providers and launch self-hosted models both receive real material
for plan, measure, create, commercial-nl, and validation quality. Unpaid
Exchange/read surfaces still withhold bodies until rights unlock.

## V48 totality and precision enforcement rule

V48 is operationally complete for commercial website testnet launch. **DataPack**
is the commodity. BTD is weighted scalar knowledge-volume and, after settlement,
a rights-bearing receipt. Pay rails settle money (testnet-class in V48).
Source-to-shares is post-finality contributor allocation. Measurement is the
basis for price. Preview is not source disclosure. Quote is not payment.
Payment observation is not finality. Database projection is not ledger truth
when stronger evidence conflicts.

Every user-visible state must name whether it is estimate, potential, preview,
quote, observed testnet payment, final settlement, rights transfer, delivery,
contributor allocation, compensation, or repair.

## V48 system goals, non-goals, and design principles

Goals:

- Launch-freeze the first generally available website MVP scope.
- Make `/deposits`, `/reads`, `/exchange`, and Auxillaries commercially coherent
  on staging-testnet.
- Specify seller and buyer user flows with exact state machines.
- Specify measurement law: catalog, prompts, typed outputs, weights, BTD scalar
  formula, proof roots, and source-safe visualizations.
- Audit feature excess and defer or flag anything that distracts from launch.
- Treat `/deposits`, `/reads`, and `/exchange` as website launch entrypoints;
  keep full Conversations commercialization, API/MCP, ChatGPT App, Bitcode Chat,
  value-bearing mainnet, and advanced market mechanics out of the launch path
  unless a later gate explicitly reopens them.
- Prove E2E IP selling and IP buying through browser-level commercial tests.
- Refurbish the landing page and public launch messaging for V48 testnet
  readiness.

Non-goals:

- V48 does not launch value-bearing mainnet BTC settlement.
- V48 does not commercialize Bitcode Chat, ChatGPT App, or MCP/API beyond
  source-safe compatibility and future-readiness boundaries.
- V48 does not finish deeper BTD mining cryptography beyond the website launch
  contract.
- V48 does not expose unpaid DataPack file bodies or source-bearing prompts on
  product surfaces.
- V48 does not add advanced market mechanics beyond MVP selling and buying.

Design principles: measurement before price, price before settlement,
settlement before source unlock, product disclosure before convenience, website
clarity before advanced interfaces, proof-backed readback before projection,
and testnet value semantics without weakening production-like system behavior.

## V48 system architecture and layer boundaries

V48 acts through the website application:

- Auxillaries owns user identity, organizations, teams, wallets, source
  connections, target repository connections, and histories.
- `/deposits` owns IP-seller source connection, deposit DataPack option
  synthesis, commercial + measurement review, Depository admission, and
  compensation expectation readback.
- `/reads` owns IP-buyer Read Request, Need comprehension, Need
  review/resynthesis, fit finding, source-safe preview, quote, multi-rail
  settlement, BTD rights transfer, and repository delivery.
- `/exchange` owns searchable master-detail network activity across deposits,
  reads, previews, quotes, settlements, rights, delivery, compensation,
  repairs, proof roots, and histories (purchase CTA may continue to `/reads`
  settle with intent params).
- Marketing (`/`), Docs (`/docs`), and Conversations (structure retained;
  full commercial conversations experience deferred) complete the website
  experience set.
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

Filesystem and co-location convention (named component directories, hooks/styles/__tests__, packages vs uapi): `internal-.docs/BITCODE_SOURCE_LAYOUT.md`.

Canonical directories (under the Next app root `apps/uapi/`):

- `apps/uapi/components/shadcn/`
- `apps/uapi/components/bitcode/`
- `apps/uapi/components/{marketing,exchange,reads,deposits,docs,conversations,auxillaries,datapacks}/`
- Thin page shells under `apps/uapi/app/{exchange,deposits,reads,docs,conversations,auxillaries}/`
  and marketing at `apps/uapi/app/page.tsx`

Naming law (types, classes, files, functions, variables — not only components):

- **Pipeline** is the product run surface language (master-detail tables, live
  stream, history, selection). Prefer `BitcodePipeline*`,
  `BitcodeDepositPipeline*`, `BitcodeReadPipeline*`, and experience-local
  `Deposits*` / `Reads*` forms.
- **Transaction / journal** remains ledger/journal vocabulary (BTD journal
  entries, reconciliation), not a product cockpit name.
- **Execution** as a product UI name is retired in favor of Pipeline. Low-level
  agent/executor packages (`execution-generics`, PTRR executor primitives) are
  not product Pipeline surfaces and are not blindly renamed.
- Product route SSOT: `EXCHANGE_ROUTE = '/exchange'`, `DEPOSITS_ROUTE`,
  `READS_ROUTE` under product-routes. Residual `/packs` is not a launch CTA.
- HTTP paths under `/api/executions/*` may remain stable during rename waves;
  internal TypeScript modules and UI labels move to Pipeline first.

Package law: generalizable non-React domain logic belongs in `packages/`;
uapi holds Next routes, React, and thin adapters. Shareable pure models that
leave product must land in packages or `components/bitcode` models — not
remain under a product path.

God-client modularization law:

- Experience page clients are **orchestration shells** only. Pure projections
  live under `apps/uapi/components/<experience>/models/`; stateful IO under
  co-located `hooks/`; render units under named `ComponentName/` directories.
- `/deposits` rebuild index: `DepositPageClient` + deposit models/hooks/units
  listed in G3-14. `/exchange` uses Exchange page client + master/detail units.
- Unit tests for pure deposit models register under `apps/uapi/tests/` (and
  `apps/uapi/jest.config.cjs` testMatch) so CI proves modular projections.

### Legacy cockpit eradication completion condition

cockpit eradication is complete when:

1. No live product cockpit tree under `apps/uapi/app/` for retired surfaces.
2. Launch nav/login CTAs use `/deposits`, `/reads`, `/exchange` only.
3. Shared pipeline selection, history, repository context, and readiness
   models live under Bitcode/experience names without retired product prefixes.
4. Browser proofs and commercial E2E remain on `/deposits`, `/reads`,
   `/exchange`, and Auxillaries.
5. BTD journal and operational-health packages use non-product names
   (`journal`, `operational-health`).

## V48 canonical domain model

Canonical V48 launch objects:

- IP seller, IP buyer, organization, team, wallet, testnet pay account,
  source connection, target repository connection, deposit source bundle
  (**sourceCheckoutCatalog**), deposit DataPack option, Depository DataPack,
  Read Request, synthesized Need, accepted Need, Fit candidate set, selected
  Fit set, Need-Fit DataPack, source-safe preview, commercial brief,
  measurement vector, measurement weight policy, weighted BTD scalar,
  multi-rail quote, settlement receipt, BTD rights receipt, repository
  delivery receipt, source-to-shares allocation, compensation statement,
  Exchange activity row, proof root, repair case, and commercial rehearsal
  receipt.

Canonical V48 states:

- Seller states: `seller-connected`, `source-connected`,
  `deposit-options-synthesizing`, `deposit-option-synthesized`,
  `deposit-option-reviewed`, `deposit-option-approved`,
  `depository-admission-submitted`, `depository-datapack-admitted`,
  `compensation-eligible`, `seller-repair-required`.
- Buyer states: `buyer-connected`, `target-repository-connected`,
  `read-requested`, `read-need-synthesizing`, `read-need-reviewing`,
  `read-need-accepted`, `finding-fits-running`, `fits-found`,
  `need-fit-datapack-synthesized`, `source-safe-preview-reviewing`,
  `quote-issued`, `settlement-observed`, `btd-rights-transferred`,
  `repository-delivery-created`, `buyer-repair-required`.
- Exchange activity states: `activity-created`, `measurement-visualized`,
  `proof-root-bound`, `ledger-projected`, `database-synchronized`,
  `storage-root-bound`, `repair-opened`, `repair-closed`.

## V48 measurement law

Measurement is the singular key to valuable IP commoditization and exchange.
Every V48 sale or deposit decision must be grounded in measured readback that
product surfaces may show under disclosure law. **Models do not invent absolute
volumes.** Hosts and tools measure; agents reason over measured readings and
(when synthesizing) full patch material.

### DataPack identity (measurement-bound)

```
DataPack = commercial .patch + measurements + metadata
```

- **Patch** — commercial change set: plan descriptor
  (`fileChanges[{path, op: create|modify}]`, `patchSummary`) plus formal
  **patchArtifact** with full file **bodies** when bound, `unifiedDiff`
  (depositor/entitled `.patch` text), and `bodiesComplete`. **No delete ops.**
- **Measurements** — nested **measurement KINDS** object (see below). Measuring is
  the most critical Bitcode subsystem: models do not invent measured values.
- **Metadata** — commercially legible fields: `kind`, `title`, `summary`,
  `coveredSourcePaths`, `confidence`, plus **`commercialTitle`** /
  **`commercialDescription`** (buyer-facing brief grounded in real patch
  material).

A **DataPack** is **always** a completely synthesized artifact — never a raw
source slice and never a bare path list. **Absolute measurements measure the
DataPack** (after synthesis), not the depositor repository as the commercial object.
Product hierarchy:

`DataPack` (primitive) → synthesis pack → deposit option / selection
envelope row / durable artifact projection.

(Legacy code identifiers may still say AssetPack until package renames complete;
product language and this SPEC use **DataPack**.)

Deposit option `kind` (v0): `capability-slice` | `implementation-pattern` |
`proof-operations-slice`. Implementation synthesizes **2–4** distinct options.

### Measurement KINDS (canonical carrier)

V48 admits **three** formal measurement surfaces on the DataPack carrier
(kinds of measurements / identity bags — not separate commercial objects):

```
measurements: {
  absolutes: AbsoluteReading[];           // full commercial catalogue (Σ weights = 1)
  needinesses: NeedinessReading[];        // reader/Need-relative (READ ONLY)
  materialIdentity?: MaterialIdentityBag; // multi-valued buyer-visible identity
  measureReport?: DataPackMeasureReport;  // measure-session honesty telemetry
}
```

| Surface | When used | Nature |
|---|---|---|
| **absolutes** | Deposit + read | Intrinsic properties of the DataPack; **full** product catalogue (all kinds, Σ weights = 1) |
| **needinesses** | **Reading only** | Dynamic + static-catalogue reader-relative dimensions for a Need |
| **materialIdentity** | Deposit + read + Exchange | Source-safe multi-valued compositions, inventories (deps by usage), tags, companion scalar volumes |
| **measureReport** | Deposit + read + Exchange | Bodies measured, coverage ratio, expanded-fill count, mode (`deep` \| `thin` \| `path-only`) |

**Deposit law:** `measurements.needinesses` is always `[]` (or omitted). No
`needinessSignal`, no deposit neediness preview, no inventing read-demand as a
measurement kind on deposit packs. Legal deposit bag keys:
`absolutes` (required), `materialIdentity?`, `measureReport?`, empty `needinesses?`.

**Read law (Gate 5 needinesses + depository search):**

- Static **needinesses catalogue** includes fixed dimensions (e.g. `language-fit`,
  `domain-fit`, `interface-fit`) with weights (`ASSET_PACK_NEEDINESSES_CATALOG`).
- **Dynamic** needinesses are planned per Need (and grounded in checkout paths /
  topics) as first-class plan rows:

  ```
  dynamicNeedinesses: Array<{
    measurementKind: string;  // MUST end with -fit
    label: string;            // human title, not slug-only
    guidance: string;         // how to score pack vs Need
    weight: number;           // relative among dynamic; re-normalized with static
  }>
  ```

- Setup `comprehend-needs` produces the plan; Implementation host-attaches
  measured volumes for **static + dynamic** rows onto each option.
- **Weight re-normalization:** when both static and dynamic rows are present,
  static mass = 0.6 and dynamic mass = 0.4, each family re-normalized internally
  so all neediness weights sum to 1 before composite.
- **`need-fit` is a composite**, not a raw catalogue target:
  `needFitVolume = weightedMean(needinesses[].volume)` using each row’s weight
  (reading weight, else catalogue weight, else equal). BTD on settle uses the
  needinesses family / need-fit composite only (never absolutes).
- Final synthesized-read options **must** carry:

  ```
  measurements: { absolutes: AbsoluteReading[]; needinesses: NeedinessReading[] }
  needFit: number
  ```

### Depository search law (shared low-level tool)

Deposit and read Discovery share **`depository-asset-pack-search`**
(`runDepositDepositoryAssetPackSearch`):

| Channel | Law |
| --- | --- |
| **Static filters** | Optional kind / repository / lifecycle / absoluteKinds on supply rows |
| **Lexical** | Phrase-weighted term match over source-safe asset text (always) |
| **Vector** | Optional: embed query → cosine match when `BITCODE_DEPOSITORY_VECTOR_SEARCH=1` |
| **Multi-query** | Explicit `queries[]` fan-out; union by `assetId` (max score + multi-query boost) |
| **Product lens** | `deposit-relevants` vs `read-need-fits` (query framing only; same ranker) |

**Index on admit:** when a deposit option is admitted to the Depository, the
product enqueues indexing:

1. Upsert source-safe row in `depository_search_documents` (structured metadata + embed text).
2. Embed `embed_text` with open-source **gte-small (384 dims)** via Supabase Edge
   Function (`Supabase.ai.Session`) — **not** the OpenAI Embeddings API.
3. Upsert into `depository_search_vectors` (Postgres **pgvector** only).
4. Search uses `match_depository_asset_pack_vectors` (cosine).

**Store law:** depository vectors live only in Supabase Postgres/pgvector.
OpenAI is not a vector database for Bitcode depository search.

**Runtime preload:** both deposit and read synthesize dispatch load admitted /
settled supply into execution stores (`depository.settledAssets` /
`deposit.settledDepositoryAssets`) **before** Discovery so lexical search is not empty.

### Absolute measurement hierarchy (rebuild law)

```
measurement-generics                         # carrier + AbsoluteReadingStatus + measureReport
  → generic-measurements/absolutes/<kind>     # bare pure measure (one package per kind)
  → generic-measurements/domain/
       data-pack-absolutes-catalog            # full commercial catalogue Σ=1
       data-pack-material-identity            # multi-valued identity extract
  → generic-tools/tool-measure-<kind>         # ExecutionTool wrapper
  → generic-agents/agent-measure-absolutes    # registers all absolute tools / bare measures
  → deposit|read pipelines                    # attach after DataPack synthesis
```

**Commercial catalogue size:** **65 kinds**, **Σ weights = 1** (single full
catalogue — there is no smaller “weighted subset”). Enumerated in
`@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` and
`BITCODE_SPEC_V48_ABSOLUTE_MEASUREMENT_PARITY_MATRIX.md`. Families: structure,
verification, hygiene, provenance, semantics, value, plus material-identity
companions. **`learning-gain` is not an absolute** — exchange value scalar is BTD
via needinesses / need-fit on read.

Hygiene kinds are first-class absolute packages; product policy may treat them as
hard gates or penalties. **Honesty law:** volume `1` (“clean”) is illegal without
bodies or a real scan; empty evidence → `status: insufficient_evidence` (or
`not_run`) with volume `0` — never claim measured-clean zeros from catalogue fill.

### Absolute commercial catalogue (`DATA_PACK_ABSOLUTES_CATALOG`)

Canonical **full** commercial catalogue in
`@bitcode/generic-measurements-domain-data-pack-absolutes-catalog`
(re-exported by product synthesis). **Every kind has a commercial weight; Σ = 1.**
Shared for deposit and read. Rebuild implementations must emit **one reading per
catalogue kind** (catalog-complete bag) with finite `volume` + `magnitude`.

**Catalogue completeness ≠ measurement quality.** Expanding a partial bag to the
full catalogue is legal UI/law fill only when each fill row is tagged
`status: expanded-fill` (volume/magnitude 0). Models and hosts **must not** present
expanded-fill zeros as measured cleanliness.

Structure **quantity** kinds are tool/bare-authoritative when static analysis or
identity extract supplies signals. Representative structure kinds (not exhaustive;
full list is SSOT in the catalogue package):

| Family slice | Examples | Authority |
|---|---|---|
| Classic structure | `function-count`, `type-count`, `file-span`, `symbolic-richness`, `modularity`, `lang-span`, `test-surface`, `api-surface` | Static analysis report (report-owned) |
| Extended structure | `dependency-span`, `doc-signal`, `config-surface`, data-flow / control / connectivity | Static analysis + bare heuristics |
| Identity companions | `language-concentration`, `framework-surface`, `dependency-class-balance`, `capability-surface`, `purpose-clarity`, … | Material-identity extract → `scalarVolumes` |
| Quality estimates | `correctness-estimate`, `objectives-fidelity`, `computational-usage`, … | Optional measure-agent refine; never invent in synthesis LLMs |

#### Absolute reading shape (rebuild type)

```
{
  measurementKind: string;   // catalogue key exactly (e.g. function-count)
  label: string;
  weight: number;            // catalogue weight (SSOT wins over legacy weights)
  volume: number;            // 0..1 normalized — ALWAYS
  magnitude: number;         // ALWAYS (quantity = raw count; quality = mirrors volume)
  unit: string;
  category: 'absolute';
  status: AbsoluteReadingStatus;  // REQUIRED honesty class
  descriptor?: string;       // instance prose when measured; short placeholder when fill
  rationale?: string;
  evidenceRoot?: string;
}

AbsoluteReadingStatus =
  | 'measured'                 // host/tool produced this reading from evidence
  | 'estimated'                // heuristic / soft estimate over partial evidence
  | 'insufficient_evidence'    // kind ran but lacked bodies/signals
  | 'expanded-fill'            // catalogue completeness only — NOT measured
  | 'not_run'                  // scanner/tool not invoked
  | 'not_implemented';         // package scaffold without mechanism
```

#### measureReport (product-visible measure telemetry)

```
measureReport: {
  measuredFromBodies: number;      // content-bearing files used
  coveredPathCount: number;        // path scope size
  bodyCoverageRatio: number;       // 0..1
  expandedFillCount: number;       // rows with status expanded-fill
  mode: 'deep' | 'thin' | 'path-only';
  toolInvocations?: number;
  measuredKindCount?: number;      // measured | estimated rows
}
```

Mode law (host defaults): `deep` when bodies ≥ 8 and coverage ≥ 0.5; `thin` when
bodies > 0; else `path-only`. Prefer fail-soft thin measure over silent zeros.

#### materialIdentity (buyer-visible multi-valued bag)

Schema `bitcode.data-pack.material-identity` v1. Source-safe only: compositions
(language mix, …), inventories (dependencies ranked by **usageShare** /
`fileHitCount`, frameworks, services), tag sets (purpose, runtimes, patterns,
capabilities), and companion `scalarVolumes` for identity absolute kinds.
**Models never invent dep lists.** Host extract is authoritative.

#### Deep measure source set (`resolveMeasureSourceSet`)

Measure unit remains the **DataPack**. Tools may read checkout bodies **only**
for paths that ground that DP:

1. All `coveredSourcePaths` + `fileChanges[].path` with bodies when available.
2. Always include measure-critical manifests if present in the checkout catalog
   (`package.json`, lockfiles, `go.mod`, `Cargo.toml`, `pyproject.toml`,
   `requirements.txt`, `pom.xml`, Gradle/Gemfile/composer, Dockerfiles, …)
   within obfuscation-allowed roots.
3. Optionally include sibling test files for covered production paths.
4. Cap by `BITCODE_DEPOSIT_MAX_MEASURE_BODIES` (default 80) with truncation
   telemetry — never silent truncate.
5. Never read paths outside run checkout / obfuscation allowlist.

Deposit **and** read Implementation must call `resolveMeasureSourceSet` before
`measureDataPackAbsolutesAndIdentity`.

#### Host merge law (report-owned quantities)

Static-analysis reports that expand the full catalogue to volume 0 **must not**
override bare/identity measures. Prefer report magnitudes only for **report-owned**
kinds: classic structure + `dependency-span` + `doc-signal` + `config-surface`
(and any kind the analyzer explicitly materializes). Material-identity
`scalarVolumes` win for companion kinds. Bare packages fill the rest.

#### ToolsExecution waves (Try/Retry postprocess)

PTRR still has only **Try** and **Retry** as tool-capable steps. Tool postprocess
must support **sequenced Executor waves**:

- Flat `useTools: [{ name, input, reason }]` ≡ one sequential wave (backward compat).
- Optional `toolPlan: ToolWave[]` where each wave has `sequential?: UseTool[]`
  and/or `parallel?: UseTool[]`. Waves run in order; `usedTools` accumulate with
  `waveIndex`. Later waves may use prior results.
- Host may run the same Executor graph **deterministically** (no LLM) for deep
  measure fan-out.

#### Absolute display and review artifact

| Surface | Law |
|---|---|
| Deposit option card | Measure report strip; material identity + deps-by-usage; honesty badge per absolute; prefer instance descriptor; fill rows show “Not measured — catalogue placeholder” |
| Exchange detail | Same honesty (status badges, measureReport strip, deps inventory); source-safe only |
| Pack activity projection | Carry `status` on absolute rows; project `materialIdentity` + `measureReport` into detail |
| Path-op patch download | `bitcode.artifact.patch` path-op-json (protocol) |
| **DataPack review artifact** (depositor) | `bitcode.datapack.review-artifact` v1: path-op + metadata + absolutes (with status) + materialIdentity + measureReport + honesty counts — **no unpaid raw source bodies** |

**Who measures when (deposit):**

| Phase | Law |
|---|---|
| Discovery `comprehend-codebase` | Measures **Host checkout material** → `discovery:sourceMeasurements` to ground the knowledge map |
| Implementation measurements agent | `resolveMeasureSourceSet` → static analysis + material identity + bare registry → `measureReport`; attach `measurements: { absolutes, materialIdentity?, measureReport? }` |
| Validation ready-to-finish | **Fail-closed** if pack lacks catalog-complete `measurements.absolutes` with magnitude+volume; **must not** re-measure |
| LLM agent JSON | **Must not** invent absolute, neediness, or identity volumes |

Stack: `resolveMeasureSourceSet` → static analysis + material-identity extract →
bare `generic-measurements/absolutes/<kind>` (+ staticSignals) →
`measureDataPackAbsoluteReadings` / optional quality PTRR refine →
merge (report-owned + identity + bare) → attach. Package map: absolute measurement
parity matrix. Needinesses remain `@bitcode/generic-measurements-needinesses` (read).

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

This section is **binding product law** for deposit synthesis. Together with the
rest of this SPEC it is sufficient to **rebuild deposit synthesis and `/deposits`
from zero** without consulting non-canonical companions or implementation tribal
knowledge. Paths locate the living system; the **law** is this SPEC.

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
| Implementation | **sequential** (1) `…-patch-plan` → (2) `…-patchfile` → (3) `…-measurements-synthesis` → (4) `…-commercial-nl` | Same DataPack(s): **plan** → **write hybrid-body patch artifact** → **measure** → **commercial NL**; deposit = descriptor + patchArtifact (bodies) + absolutes + commercialTitle/Description |
| Validation | **one** agent: `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline` | A prior phases · B pack quality · C obfuscations vs patch. **Validate only** — never measure/repair; weak Implementation → **iterate** |
| Finish | (1) store-artifacts → (2) ledgerize → (3) finish-synthesize-asset-packs-for-deposit-run | Persist · journal roots · selection envelope / cleanup |
| postprocess | normalize | Presentation-safe result for route |

#### G3-1b Optimization for depositor options

Bitcode optimizes **depositor-facing supply quality**, not a claimed global optimum:

1. Scope control — Permissible sources/Exclusion + Obfuscations bound admissible knowledge.
2. Measured structure — checkout absolutes + tree + LSP reveal capability density.
3. Demand alignment — depository search (underserved/likely topics) biases buyable slices (topic guidance only; **not** Read neediness).
4. Pattern prior — inherent regurgitation avoids naive groupings.
5. Multi-option synthesis — 2–4 **distinct** knowledge groups (patchfile agent).
6. Tool-rich measurements — Implementation agent 2/2: static analysis (quantity) + quality inference into `DATA_PACK_ABSOLUTES_CATALOG` only.
7. Fail-closed Validation — **validate only** (no re-measure); missing absolutes, salvage, leakage, exclusion → **iterate**.
8. DIV substrate — re-enter Discovery→Implementation when not ready and maxIterations > 1.
9. Human selection — `/deposits` selection envelope only when `readyToPresent` (measured + presentable + Validation finish).

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
| POST | `/api/deposit/synthesize-options` | Auth required. Validate body (`repositoryFullName`, branch, commit, obfuscations, permissibleSources, impermissibleSources, demand signals). Create `executions` row `running`. Register `waitUntil` continuation. Return `{ runId, status: 'dispatched' }` immediately. `maxDuration` high enough for deposit (800s class). Background: provision host → run SDIVF or sandbox host → validate candidates → build real option synthesis → ground neediness from settled packs → persist `output` **before** completion event. Fail-closed messages on zero options / cancel / timeout. |
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

Scope after provision: Permissible sources/Exclusions applied to catalog. Prompt path uses projection of **paths + samples only** — never full `sources` in prompts or telemetried `pipeline:input`.

**Host-only clone law:** Setup clone agent is the checkout authority for the SDIVF run; pre-Setup host provision may seed the Host, but deposit Setup does not use Fits Finding harness keys.

### G3-5 Deposit run inputs and preprocess stores

| Input | Law |
|---|---|
| `repositoryFullName`, `sourceBranch`, `sourceCommit` | Required for synthesis |
| `obfuscations` | Free-text withhold guidance. **Empty/whitespace → skip Setup obfuscation LLM**; store empty guidance (`comprehensionMode: empty-obfuscations-skip-llm`). Impermissible sources remain authoritative. |
| `permissibleSources` | Non-empty → only those roots in-scope |
| `impermissibleSources` | Fail-closed exclusion from catalog before prompts/measurement |
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
| `deposit:permissibleSources` | string[] |
| `deposit:impermissibleSources` | string[] |
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

#### Implementation (four sequential agents — same DataPacks)

Deposit DataPack =
  **plan metadata + commercial .patch (bodies) + absolute measurements + commercial NL**.
Neediness is **Read-pipeline only** and is never a deposit Implementation product field.

| Order | Registry key | Module | Objective |
|---|---|---|---|
| 1 | `implementation:deposit-implementation-agent-asset-packs-patch-plan` | `…/deposit-implementation-agent-asset-packs-patch-plan.ts` (+ schema/prompts) | 2–4 options; LLM **six fields only**; host catalog/exclusion gates; **no artifact write**; LLM input may include **full checkout bodies** via synthesis-provider inventory projection |
| 2 | `implementation:deposit-implementation-agent-asset-packs-patchfile` | `…/deposit-implementation-agent-asset-packs-patchfile.ts` (+ create-body hydrate) | For each planned pack: **write one** formal patch artifact; **hybrid bodies**: **modify** = depositor checkout full file; **create** = LLM (or deterministic) full new-file body; **no delete**; attach `patchArtifact` with `files[{path,op,body?}]`, `unifiedDiff`, `bodiesComplete` |
| 3 | `implementation:deposit-implementation-agent-asset-packs-measurements-synthesis` | `…/deposit-implementation-agent-asset-packs-measurements-synthesis.ts` | Requires `patchArtifact`; `resolveMeasureSourceSet` → host measure (absolutes + materialIdentity + measureReport); full catalogue + honesty |
| 4 | `implementation:deposit-implementation-agent-asset-packs-commercial-nl` | `…/deposit-implementation-agent-asset-packs-commercial-nl.ts` | **Full patch bodies + measurements** to LLM; emit `commercialTitle` + rich `commercialDescription` for purchase consideration; product surfaces may show commercial prose unpaid; bodies remain rights-gated |

**Agent 1 (patch-plan) LLM output (allowlist — no other keys):**

```
{
  options: [{
    kind: 'capability-slice'|'implementation-pattern'|'proof-operations-slice';
    title: string;                   // 8..160
    summary: string;                 // 40..900 product language
    coveredSourcePaths: string[];    // 1..40 from catalog only
    confidence: number;              // 0..1
    patch: {
      fileChanges: { path: string; op: 'create'|'modify' }[];  // min 1; NEVER delete
      patchSummary: string;
    };
  }]  // length 1..4
}
```

Plan step **output** is path+op only (staging). Plan step **input** includes real
checkout file bodies so titles/summaries/path choices are grounded.

**Agent 2 (patchfile write) host output (per pack):** same six fields with optional
`fileChanges[].content` (full bodies) +
`patchArtifact: { artifactId, assetPackId, format:'unified-diff'|'path-op-json',
files[{path,op,body?}], unifiedDiff?, bodiesComplete, envelopeJson, … }`
— **exactly one** formal artifact per pack; commercial law **create|modify only**.

**Agent 3 (measurements) host output (per pack):** agent-2 pack +
`measurements: { absolutes: AbsoluteReading[]; materialIdentity?; measureReport? }`
(catalog-complete absolutes with `status` + magnitude+volume; identity optional; report optional but required when bodies were available).

**Agent 4 (commercial-nl) host/LLM output (per pack):** agent-3 pack +
`commercialTitle` (8..160) + `commercialDescription` (80..6000, exhaustive buyer brief
grounded in real patch bodies and honesty telemetry). Deterministic fallback prose
is allowed when LLM fails; preferred path is model grounded on full material.

**Presentable gate (binding):** a pack is presentable only if not salvaged, has
formal patchArtifact, has required catalog absolutes, has **no delete** ops, and
when `bodiesComplete === false` it is **not** presentable.

**Host salvage (patch-plan only):** continuity packs with `salvaged: true` may be written as
artifacts but are **never presentable**; Validation **must iterate**.

**Product projection:** route validate must preserve file bodies, `patchArtifact`,
commercial fields, and measure honesty; rehydrate modify bodies from checkout
inventory when needed; rebuild `unifiedDiff` for depositor `.patch` download/view.

**Stores (after commercial-nl):**
`implementation:options` / `assetPacks` (commercial packs), `implementation:patchedPlans`,
`implementation:patchArtifacts`, `implementation:patchfileWritten`,
`implementation:measured`, `implementation:presentable`,
`implementation:commercialNlComplete`, salvage flags, measurementReports.

#### Validation (single agent — validate only)

| Registry key | Module | Objective |
|---|---|---|
| `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline` | `agents/validation/deposit-ready-to-finish-agent.ts` | Single A/B/C gate; **never measures or repairs packs** |

| Check | Law |
|---|---|
| A Prior phase / tool sanity | workspacePath; danger-wall; catalog.paths; Discovery products; non-empty options; `implementation:measured === true`; **no salvaged packs** |
| B Pack quality | Each pack = commercial patch (bodies when claimed) + `measurements.absolutes` (+ optional materialIdentity/measureReport) + metadata + commercial NL when present; no non-empty needinesses; no delete ops; distinctness; full catalogue kinds; magnitude+volume; honesty status preserved; qualitative PTRR may read real patch bodies |
| C Obfuscations / Impermissible sources | covered paths + patch paths vs blocked prefixes (shared path law) |

Weak Implementation (missing absolutes, salvage, incomplete measure, empty options) →
`recommendation: iterate` so DIV re-enters Discovery→Implementation. Validation **must not**
call `measureDataPackAbsolutes` or `attachDepositAbsolutes`.

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
| Config | Editable until synthesis dispatched; Obfuscations + Permissible sources + Impermissible sources |
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
| Layout contract | `internal-.docs/BITCODE_SOURCE_LAYOUT.md`, `apps/uapi/components/deposits/README.md` |
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
6. Rebuilders must follow `internal-.docs/BITCODE_SOURCE_LAYOUT.md`; do not
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


## SynthesizeRead DataPacks SDIVF and commercial read full-stack law (product Gate 5)

> **Product gate numbering:** this chapter is **read/buyer pipeline law** and
> belongs to product **Gate 5 (Reader Website Completion)**. Product **Gate 4**
> is **Depositor Website Completion** only (seller deposit UX + tradable
> DataPack packaging).

Read synthesize is **nearly identical** to deposit synthesize (same SDIVF shape,
many shared agents). Instruction input is **Need** (not Obfuscations). Measurements
include **needinesses** (all kinds end with `-fit`). BTC settle / PR ship are
**not** in this pipeline.

### G4-1 Product split (three commercial pipelines)

| Pipeline | Pattern | Purpose |
|---|---|---|
| **SynthesizeDepositAssetPacks** | SDIVF | Depositor repo + Obfuscations → option selection on `/deposits` |
| **SynthesizeReadAssetPacks** | SDIVF | Reader repo + **Need** → option selection on `/reads` |
| **settle-asset-pack-pipeline** | **Simple** (linear) | **1:1 DataPack : pipeline run** after buy: pay → mint BTD → rights → PR-ship → `/exchange` activity |

Synthesize-deposit and synthesize-read look like each other (multi-option). Settle does **not**: each bought option starts its own settle pipeline.

### G4-2 Read SDIVF sequence (mirrors deposit)

| Phase | Sequence |
|---|---|
| preprocess | Need + repository + sourceCheckoutCatalog on shared root (`read:*`) |
| Setup | clone alone → parallel {initialize-lsp, initialize-mcps-tools, **comprehend-needs**} → **danger-wall** (admits Need + dynamic *-fit plan) |
| Discovery | parallel {comprehend-codebase, search-depository, inherent-regurgitation} (shared with deposit) |
| Implementation | `implementation:read-asset-pack-synthesis` — patch + `resolveMeasureSourceSet` + host attaches absolutes + materialIdentity + measureReport + needinesses |
| Validation | `validation:ready-to-finish-asset-packs-synthesis-read-pipeline` — A/B/C + needinesses *-fit |
| Finish | store-artifacts → ledgerize → finish-synthesize-read-run (selection envelope for settle) |

### G4-3 Needinesses measurement law (read)

```
measurements: {
  absolutes: AbsoluteReading[];       // same full catalogue as deposit (+ status)
  needinesses: NeedinessReading[];    // all kinds end with "-fit"
  materialIdentity?: MaterialIdentityBag;
  measureReport?: DataPackMeasureReport;
}
```

| Subkind | Examples | Law |
|---|---|---|
| Static catalogue | `language-fit`, `domain-fit`, `interface-fit` | Fixed weights; always measured on read options |
| Dynamic (from Need) | `needs-session-refresh-fit` | Planned in Setup comprehend-needs; host measures |
| Composite | `need-fit` | **Not** a raw row — `weightedMean(needinesses)` |

Deposit: `needinesses: []` always. Read: fail-closed if needinesses empty or any kind lacks `-fit` suffix.
Read absolute measure path **must** share deposit deep source-set + honesty law.

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

**Pay / earn law:** Buyers **never pay in BTD**. Buyers pay **ETH, BTC, or SOL**
at spot vs BTD (mock spots allowed on testnet). Depositors **earn BTD** via mint
on settle (needinesses volume after supply decay), split by source-to-shares and
depositor `btdBps` / `coinBps` (coin leg takes protocol fee; BTD leg has no fee).
Unchosen BTD is not minted. Buyer receipt is **AssetPack co-own NFT + delivery**.

| # | Stage / agent | Law |
|---|---|---|
| 1 | `validate-settlement-readiness` | Exactly one `assetPackOption`; fail-closed if zero or many |
| 2 | `settle-payment` | Observe / project pay rail (ETH on-chain; BTC/SOL attested) |
| 3 | `quote-btd-volume` | Needinesses → rawV → residual-supply **decay** → V; multi-rail spot options |
| 4 | `finalize-settle` | `BitcodeERC1155`: mint **100% V BTD to escrow (master)**; add buyer co-owner; burn AP forbidden. Seller payout not yet distributed. |
| 5 | `ship-asset-pack-patch-pr` | Open PR on **read** repo applying that option’s `.patch` |
| 6 | `journal-and-exchange-activity` | `/exchange` settled DataPack activity row + `pendingPayout` for seller review |

#### Seller payout finalize (Exchange detail)

After settle, the **seller** opens the settled DataPack on `/exchange` and sets
`sellerBtdBps` with a slider (BTD % vs pay-asset %; **ETH for V0**):

```
seller receives:     sellerBtdBps/10000 of BTD + (10000-sellerBtdBps)/10000 of ETH
treasury receives:   inverse remainder of each asset
```

Example: sellerBtdBps=1000 → seller 10% BTD + 90% ETH; treasury 90% BTD + 10% ETH.

Buyer (entitled co-owner) may view the **patch summary** on pack detail after settle.
`POST /api/exchange/payout/finalize` (or packs-compat payout route) persists the split.

#### BTD (Bitcode) fungible token — volume and mint

- **BTD** is a finite fungible token named Bitcode with max supply **21,000,000**
  whole tokens (18 decimals). Freely transferable for external markets.
- **Volume uses needinesses only** (absolutes never set V):

```
weightedNeedinessesSum = Σ (w_i × clamp01(volume_i))   // needinesses *-fit only
needFitVolume          = weightedNeedinessesSum / Σ w_i   // ∈ [0,1]
rawV                   = floor(needFitVolume × 10^18)
V                      = floor(rawV × decay)   // decay from residual 21M supply
```

- Mint destination is **depositor share recipient(s)** per `btdBps`, only on finalize.
- Buyers do **not** receive fungible BTD mint as purchase receipt.

#### BitcodeERC1155 (single contract)

| Token | ID | Kind | Behavior |
|---|---|---|---|
| BTD (Bitcode) | `0` | Fungible | Cap 21M; mint on settle to depositor slices; free transfer |
| AssetPack | `≥ 1` | NFT co-ownership | `registerAssetPack`; add-only co-own; burn **forbidden** |

Pay entrypoints: `settleReadWithEth` (ETH); `settleReadWithExternalPay` (BTC/SOL + attestor).

Sources of truth:

- Solidity: `packages/btd/contracts/BitcodeERC1155.sol`
- TS mirror + decay + spot: `packages/btd/src/erc1155/`
- Pipeline: `packages/asset-packs-pipelines/settle/`

### G4-6 `/exchange` master-detail

Network-scope activity: searchable master table + detail for a selected DataPack
(settled/admitted supply and settled read deliveries). Unpaid viewers see
measurements + commercial prose + proof roots only; entitled viewers may download
`.patch` bodies after rights. Purchase CTA may deep-link to `/reads?intent=purchase`.

### G4-7 Implementation source map (read / settle / exchange)

| Area | Path |
|---|---|
| Read phases | `packages/asset-packs-pipelines/syntheses/domain` + read product package |
| Read product package | `packages/asset-packs-pipelines/syntheses/read/` |
| Need comprehension | `agents/setup/read-need-comprehension-agent.ts` |
| Read synthesis | `agents/implementation/read-*-synthesis-agent.ts` |
| Needinesses helpers | `@bitcode/generic-measurements-needinesses` |
| Settle package | `packages/asset-packs-pipelines/` settle Simple pipeline |
| BitcodeERC1155 | `packages/btd/contracts/BitcodeERC1155.sol`, `packages/btd/src/erc1155/` |
| Needinesses → BTD | `computeSettlementBtdFromNeedinesses` (`@bitcode/btd/erc1155`) |
| Read API | `apps/uapi/app/api/read/synthesize-options/`, `apps/uapi/app/api/read/settle/` |
| UI | `apps/uapi/components/reads/*`, `apps/uapi/components/exchange/*` |

## V48 whole Bitcode operator chain

1. Seller connects identity, wallet, organization, and source.
2. Bitcode synthesizes deposit DataPack options (full `.patch` material +
   absolutes + commercial brief).
3. Seller reviews commercial brief, measurements, and full `.patch` (owner rights)
   and approves an option for Depository admission.
4. Depository indexes admitted DataPack metadata, measurements, embeddings,
   proof roots, and compensation posture.
5. Buyer connects identity, wallet, organization, and target repository.
6. Buyer requests a Read (or continues from `/exchange` purchase CTA).
7. Bitcode synthesizes a Need and the buyer accepts or resynthesizes it.
8. Bitcode runs Finding Fits against the Depository.
9. Bitcode synthesizes a Need-Fit DataPack and unpaid-safe preview
   (commercial + measurements; no file bodies).
10. Buyer reviews commercial prose, measurements, quote, and proof posture.
11. Buyer settles on a pay rail (**one settle pipeline per bought option**).
12. Bitcode observes payment → mints BTD volume → transfers rights →
    entitled delivery (PR / `.patch`), journals compensation, and synchronizes
    `/exchange`.
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

- Current canonical objects and emitted artifacts: unpaid commercial brief,
  measurement visualization, proof-root projection, Exchange activity
  projection, rights-gated downloads, denied-state projection, repair projection.
- **Viewer rights (binding per DataPack):**

| Role | May see / download |
|---|---|
| **Depositor (owner)** | Full `.patch` bodies, path-op, metadata review, commercial brief |
| **Pre-purchase buyer** | Commercial title/description, measurements, material identity, quote posture — **not** file bodies |
| **Post-settled purchaser** | Entitled `.patch` / delivery artifact + commercial + measurements |
| **Anonymous** | Commercial brief only (if listed) |

- **LLM synthesis providers** may receive full checkout and patch bodies (see
  totality disclosure boundary). That is not an unpaid UI disclosure.
- Current algorithms and derivation rules: project by rights; rebuild
  `unifiedDiff` for entitled viewers; strip bodies on unpaid API rows.
- Current invariants and fail-closed conditions: public projection
  overexposure blocks state advancement; zero bodies on unpaid listings.
- Current proof obligations: disclosure policy receipt, projection receipt,
  no-body/no-secret scan on unpaid paths, repair receipt.
- Current source-bearing implementation basis: raw source, unpaid DataPack file
  bodies, and raw protected prompts remain outside unpaid public projection;
  synthesis LLM providers may still receive full material for rebuild quality.
- Current validating commands and parity basis: living website and deposit
  disclosure tests must prove rights gates.
- Current accepted boundaries: commercial prose and measurements may be public;
  file bodies unlock only after depositor ownership or post-settle rights.

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
| Inference-synthesis | `.proofs/v48/spec-family-report.json` | `measurement-prompt`, `need-synthesis`, `fit-synthesis` | `typed-measurement-output` | `v48-inference-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V46 inference and V48 measurement law |
| Prompt-completeness | `.proofs/v48/spec-family-report.json` | `measurement-prompts`, `visualization-prompts` | `prompt-identity-bound` | `v48-prompt-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Prompt registry and V41/V46 canon |
| Static-code-analysis | `.proofs/v48/canonical-input-report.json` | `route-static-contracts`, `workflow-hooks` | `source-safety-static` | `v48-static-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Current website source and workflows |
| Verification-decisions | `.proofs/v48/spec-family-report.json` | `seller-decision`, `buyer-decision` | `measurement-before-price` | `v48-decision-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V48 state machine law |
| Selection-and-materialization | `.proofs/v48/spec-family-report.json` | `fit-selection`, `delivery-materialization` | `settlement-before-source` | `v48-materialization-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Reading and delivery packages |
| Authorization-and-sensitive-flow | `.proofs/v48/canonical-input-report.json` | `identity`, `wallet`, `source-connection` | `authority-required` | `v48-authority-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Auxillaries and route authority |
| Settlement-source-to-shares | `.proofs/v48/spec-family-report.json` | `quote`, `settlement`, `compensation` | `btctestnet-conservation` | `v48-settlement-readback` | `BITCODE_SPEC_V48_PROVEN.md` | BTD/BTC accounting canon |
| Disclosure-boundary | `.proofs/v48/canonical-input-report.json` | `preview`, `measurement-visualization` | `no-unpaid-source` | `v48-disclosure-readback` | `BITCODE_SPEC_V48_PROVEN.md` | V45/V46 source-safety canon |
| Proof-contract | `.proofs/v48/spec-family-report.json` | `proof-root`, `replay`, `repair` | `proof-readback-decides` | `v48-proof-readback` | `BITCODE_SPEC_V48_PROVEN.md` | Generated proof and workflow canon |

### Inference-synthesis

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

- proofArtifactPath: `.proofs/v48/canonical-input-report.json`
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

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

- proofArtifactPath: `.proofs/v48/canonical-input-report.json`
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

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

- proofArtifactPath: `.proofs/v48/canonical-input-report.json`
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

- proofArtifactPath: `.proofs/v48/spec-family-report.json`
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

Historical reproducibility evidence inventories may exist under
`.proofs/v19/*` (contract-change ledger, negative-proof mutation matrix,
proof-member semantic matrix, theorem-evidence matrix, state-machine matrix,
deterministic-replay report, volatility inventory). They are **optional
historical evidence**, not a source of omitted V48 system semantics.

#### Inherited V20 operator-quality artifacts

Historical operator-quality evidence inventories may exist under
`.proofs/v20/*` (operator acceptance, visual regression, accessibility,
performance budget, projection quality smoke, quality summary). They are
**optional historical evidence**, not a source of omitted V48 system semantics.

#### Exact generated-artifact inventory matrix

| artifactPath | role | disclosability |
| --- | --- | --- |
| `.proofs/v48/spec-family-report.json` | V48 spec-family validation report | product-safe |
| `.proofs/v48/canonical-input-report.json` | V48 canonical-input validation report | product-safe |
| `.proofs/v48/canon-posture-drift-report.json` | Draft posture drift report (when regenerated) | product-safe |
| `BITCODE_SPEC_V48_PROVEN.md` | V48 generated proof appendix | product-safe |
| `.proofs/v48/*` launch/E2E/promotion reports | Gate closure evidence as generated | product-safe |

#### V48 specifying generated artifacts

V48 reserves `.proofs/v48/spec-family-report.json` and
`.proofs/v48/canonical-input-report.json`. Launch, measurement, route, E2E
rehearsal, and promotion-readiness artifacts under `.proofs/v48/` bind to the
validation and promotion canons below. Each artifact must be regenerable from
this SPEC's obligations without recovering missing meaning from other version
SPEC files.

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

V48 draft family validation (living checks; exact flags follow repository CI):

- Spec-family validation for **draft V48** (`check-bitcode-spec-family` / local
  CI canon steps for the V48 draft family)
- Canonical-input and posture-drift reports under `.proofs/v48/` when regenerated
- Gate-focused checkers `check:v48-gate*` as bound by promotion readiness
- Living product CI: monorepo typecheck/build/Jest for website + pipeline packages

Promotion-time validation additionally advances the pointer file and regenerates
`BITCODE_SPEC_V48_PROVEN.md`. Historical version-bound checkers for other
version numbers remain immutable and are not required green for V48 draft work.

Later gates add focused tests, browser E2E, proof generation, staging rehearsal,
and promotion readiness checks as listed in the promotion canon.

## V48 promotion canon

V48 may promote only after all gates close, all generated artifacts are fresh,
all commercial website launch tests are green, staging-testnet rehearsal proves
seller and buyer E2E flows, and the maintained promotion workflow advances
`BITCODE_SPEC.txt` to `V48`.

V48 promotion readiness canon: Gate 10 owns
`.proofs/v48/promotion-readiness-report.json`, the
`buildV48PromotionReadinessReport` package object, and `check:v48-gate10`
(with `--promotion-mode` accepting pre-promotion pointer truth or post-promotion V48 pointer truth
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

Canonical surfaces are `/deposits`, `/reads`, `/exchange`, Auxillaries,
Depository indexes, proof roots, workflow receipts, ledger journals, database
projections, object-storage roots, wallet/provider receipts, and repository
delivery receipts. API/MCP, ChatGPT App, and Bitcode Chat remain compatibility
surfaces for V48, not commercial launch scope.

### Appendix B. Proof family closure catalog

The nine proof families above close through measurement, state-machine,
disclosure, settlement, delivery, repair, and promotion evidence.

### Appendix D. Validation and checking gate catalog

V48 gates:

1. Scope, Testnet Semantics, Measurement Law, And Launch Freeze.
2. Feature Excess And Gate Alignment Audit. Gate 2 owns
   `.proofs/v48/feature-excess-alignment-audit.json`, the
   `buildV48FeatureExcessAlignmentAudit` package object, and
   `check:v48-gate2`.
3. Seller And Buyer State Machine Law. Gate 3 owns
   `.proofs/v48/seller-buyer-state-machine-law.json`, the
   `buildV48SellerBuyerStateMachineLaw` package object, and
   `check:v48-gate3`.
4. Depositor Website Completion (tradable DataPack seller UX). Gate 4 owns
   `.proofs/v48/depositor-website-completion.json`, the
   `buildV48DepositorWebsiteCompletion` package object, and
   `check:v48-gate4`. This gate closes production-ready deposit packaging of
   code as a measured, commercially narrated, rights-gated commodity.
5. Reader Website Completion. Gate 5 owns
   `.proofs/v48/reader-website-completion.json`, the
   `buildV48ReaderWebsiteCompletion` package object, and
   `check:v48-gate5`.
6. Packs And Auxillaries Commercial Dashboard. Gate 6 owns
   `.proofs/v48/packs-auxillaries-commercial-dashboard.json`, the
   `buildV48PacksAuxillariesCommercialDashboard` package object, and
   `check:v48-gate6`.
7. E2E IP Selling And Buying Tests. Gate 7 owns
   `.proofs/v48/e2e-ip-selling-buying-tests.json`, the
   `buildV48E2eIpSellingBuyingTests` package object, and
   `check:v48-gate7`.
8. Landing Page And Public Launch Messaging. Gate 8 owns
   `.proofs/v48/landing-public-launch-messaging.json`, the
   `buildV48LandingPublicLaunchMessaging` package object, and
   `check:v48-gate8`.
9. Staging-Testnet Deployment Rehearsal. Gate 9 owns
   `.proofs/v48/staging-testnet-deployment-rehearsal.json`, the
   `buildV48StagingTestnetDeploymentRehearsal` package object, and
   `check:v48-gate9`.
10. Promotion Readiness. Gate 10 owns
    `.proofs/v48/promotion-readiness-report.json`, the
    `buildV48PromotionReadinessReport` package object, and
    `check:v48-gate10`.

### Appendix E. Current canonical source map

Current source map roots include `uapi`, `packages/btd`,
`packages/pipeline-asset-pack`, `packages/pipeline-hosts`,
`packages/specifying`, `packages/prompts`, `packages/executions-mcp`,
`packages/chatgptapp`, `protocol-demonstration`, `.github/workflows`, and
`.proofs` generated artifacts.

V48 Gate 2 source-safe generated artifact:
`.proofs/v48/feature-excess-alignment-audit.json`. It records launch routes,
supporting surfaces, deferred surfaces, feature policies, forbidden launch
entry targets, source-safe payload boundaries, source-root digests, and
predicate results without serializing source, prompt payloads, wallet private
material, settlement private payloads, or mainnet value-bearing authority.

V48 Gate 3 source-safe generated artifact:
`.proofs/v48/seller-buyer-state-machine-law.json`. It records IP seller
states, IP buyer states, transition guards, measurement ids, source-safe field
ids, forbidden payload classes, source-root digests, and predicate results.
The law requires measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, BTC finality before BTD rights,
BTD rights before source delivery, `/exchange` history projection after each
transition, and fail-closed repair on missing evidence.

V48 Gate 4 source-safe generated artifact:
`.proofs/v48/depositor-website-completion.json`. It records the five-step
`/deposits` route session steps, journaled pipeline and event ids, visible
seller decision ids (commercial brief, absolute measurements, owner `.patch`
download, criticality, demand, ROI, BTD potential, BTC source-to-shares
preview, admission, `/exchange` activity sync, and authority states),
completion rows for source connection, option-synthesis journaling (four-agent
Implementation), commercial + measurement review, batch admission with
per-pack measurement projection, compensation/authority readback, and
`/exchange` history readback, forbidden payload classes, source-root digests,
and predicate results without serializing protected source, unpaid DataPack
file bodies, raw prompts, raw provider responses, wallet private material, or
settlement private payloads.

V48 Gate 5 source-safe generated artifact:
`.proofs/v48/reader-website-completion.json`. It records the five-step
`/reads` route session steps, owned pipeline ids, source-safe readback ids
(fit measurement review, quote basis, payment observation, settlement
finality, BTD rights receipt, delivery receipt), visible buyer decision ids
(Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence,
delivery readiness, selected Fit provenance, final BTD scalar, quote basis,
settlement/finality/rights/delivery states, `/exchange` activity sync, and
authority states), completion rows for Read request initiation, Need review
acceptance, fit measurement review, quote-before-settlement,
settlement/finality/rights/delivery ordering, and `/exchange` history readback,
forbidden payload classes, source-root digests, and predicate results without
serializing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or settlement private payloads.

V48 Gate 6 source-safe generated artifact:
`.proofs/v48/packs-auxillaries-commercial-dashboard.json`. It records the
`/exchange` master-detail dashboard contract (searchable activity table,
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
`.proofs/v48/e2e-ip-selling-buying-tests.json`. It records the browser-proof
scenarios (IP seller deposits an AssetPack on `/deposits`; IP buyer reviews
fit measurements, quote basis, settlement finality, BTD rights, and
repository delivery on `/reads`; `/exchange` reads back settlement, rights,
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
`.proofs/v48/landing-public-launch-messaging.json`. It records the public
launch narrative law: the landing testnet section stating the meaning of
commercial testnet (BTC amounts are testnet and free; measurements, quotes,
settlement ordering, BTD rights, and repository delivery stay
production-intended), the deposit → read → packs core-flow messaging with
launch-route links, the proof-backed trust and source-safe IP exchange
positioning, the public docs testnet-meaning card with the blocked
value-bearing mainnet posture, the preserved claim-boundary
tokens, surface ids, message ids, forbidden payload classes, source-root
digests, and predicate results without serializing protected source, unpaid
AssetPack source, raw prompts, raw provider responses, wallet private
material, or settlement private payloads.

V48 Gate 9 source-safe generated artifact:
`.proofs/v48/staging-testnet-deployment-rehearsal.json`. It records the
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

Source-bearing artifacts include `.proofs/_shared/asset-pack.lock.json`,
`.proofs/_shared/selected-source-material.json`,
`.proofs/_shared/verification-report.json`, `.proofs/_shared/source-to-shares.json`,
`.proofs/_shared/projection-policy.json`, `.proofs/_shared/system-proof-bundle.json`, and
`BITCODE_SPEC_V48_PROVEN.md`. Source-bearing payloads remain protected until
entitlement; source-safe receipts may be projected.

## V48 accepted boundaries and reopen conditions

- V48 is the full-system draft SPEC for commercial website testnet readiness.
- Formal promotion advances `BITCODE_SPEC.txt` only after promotion canon is
  green (see promotion section).
- V48 testnet means pay-rail amounts are testnet-class; system behavior remains
  production-intended.
- Measurement and commercial brief must be visible under disclosure law before
  a user decides to deposit or buy; file bodies remain rights-gated.
- Conversation full commercialization, ChatGPT App commercialization, MCP/API
  commercialization, deeper BTD mining cryptography, mainnet launch authority,
  and advanced market mechanics are deferred (compatibility surfaces must not
  regress).
- Any unpaid body leakage, measurement ambiguity, quote/finality collapse,
  rights ambiguity, or delivery ambiguity reopens the relevant workstream.

## V48 completion condition

V48 Gate 1 is complete when the V48 draft SPEC family exists as sole rebuild
law, testnet semantics and measurement law are specified, seller/buyer launch
scope and gate plan are recorded, draft family checks exist, and the gate
branch is merged into `version/v48`.

V48 Gate 2 is complete when launch-facing entrypoints resolve to `/deposits`,
`/reads`, and `/exchange`; residual cockpit paths are not launch CTAs;
Conversations full commercial experience remains deferred; API/MCP, ChatGPT
App, Bitcode Chat, value-bearing mainnet, unpaid body previews, and advanced
market mechanics are explicitly deferred; feature-excess audit evidence exists
under `.proofs/v48/`; and Gate 2 checkers pass.

V48 frontend component architecture and cockpit eradication (implementation
quality workstream on `version/v48`, not a separate product gate number) is
complete when the three-layer / seven-experience component law above is
realized in source, live modules no longer import `apps/uapi/app/ (removed cockpit tree) `, product
Pipeline naming replaces Execution/product UI names, generalizable utilities
prefer packages, and parity matrix rows for this workstream are closed.

V48 Gate 3 is complete when the IP seller state machine covers source
connection, deposit DataPack option synthesis, measurement + commercial review,
Depository admission approval, and compensation/repair tracking; the IP buyer
state machine covers Read request, Need review, Finding Fits, unpaid-safe
DataPack preview, multi-rail settlement, BTD rights, and repository delivery;
the guards enforce measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, finality before BTD rights,
BTD rights before source delivery, `/exchange` history projection, and
fail-closed repair; `.proofs/v48/seller-buyer-state-machine-law.json` is
generated; and `check:v48-gate3` validates the law.

V48 Gate 4 is complete when the `/deposits` route binds source connection
before option synthesis; real deposit synthesis produces presentable DataPacks
(plan → hybrid-body patchfile → measurements → commercial-nl); option
synthesis, review, and admission decisions are journaled as source-safe
execution rows; depositors review commercial brief, absolute measurements,
criticality, demand, ROI, BTD potential, source-to-shares preview, option
roots, and (as owner) full `.patch` material before approval; batch admission
emits N receipts and N `/exchange` depository rows with per-pack absolutes
only; soft compensation incompleteness does not drop confirmed deposits;
compensation estimates, supply recommendations, and organization/wallet
authority state are visible as disclosure-safe metadata;
`.proofs/v48/depositor-website-completion.json` is generated; and
`check:v48-gate4` validates the completion.

V48 Gate 5 is complete when the `/reads` route binds Read request initiation
from a connected repository source; a synthesized Need is reviewed and
accepted before Finding Fits; readers review unpaid-safe fit measurements and
commercial prose, selected Fit provenance, final BTD scalar, and multi-rail
quote basis before paying; the deterministic quote derives from weighted
measurement contributions; payment observation, finality, BTD rights transfer
receipt, and repository PR delivery render as ordered fail-closed readback
with delivery locked until rights transfer; Reading activity and settled
DataPacks remain reachable through `/exchange`;
`.proofs/v48/reader-website-completion.json` is generated; and
`check:v48-gate5` validates the completion.

V48 Gate 6 is complete when `/exchange` renders searchable master-detail
activity with type, scope, repository, and settlement, compensation,
delivery, and repair facets; the detail surface reads back overview,
measurements, settlement, BTD rights, compensation, delivery, and repair
states, accounting, governance, and proof roots; rights-gated downloads
respect depositor / pre-purchase / post-settle roles; BTD rights states derive
only from finality-consistent commodity-state evidence; repair-required
activity exposes a fail-closed repair surface; Auxillaries panes cover identity
profile, external source connections, interfaces, wallet authority with BTD
history readback, and organization team and treasury settings;
`.proofs/v48/packs-auxillaries-commercial-dashboard.json` (or successor exchange
dashboard artifact) is generated; and `check:v48-gate6` validates the
completion.

V48 Gate 7 is complete when browser-level tests prove both sides of Bitcode
in deterministic mock mode: depositing IP through source connection, option
synthesis, measurement + commercial review, and Depository admission on
`/deposits` with journaled execution rows; buying synthesized IP through the
`/reads` session with fit measurement review, final BTD scalar, and
deterministic quote basis rendered before payment and with payment observation,
finality, BTD rights receipt, and repository PR delivery read back in order;
auditing settlement, rights, compensation, delivery, and the fail-closed repair
surface on `/exchange`; the browser error trap stays clean; `uapi` exposes
`test:e2e:ip-exchange`; `.proofs/v48/e2e-ip-selling-buying-tests.json` is
generated; and `check:v48-gate7` validates the coverage.

V48 Gate 8 is complete when the landing page renders a commercial-testnet
section explaining that pay-rail amounts are testnet-class while protocol
behavior stays production-intended; the deposit → read → exchange core flow is
documented with launch-route links; proof-backed trust and disclosure-safe IP
exchange positioning are stated; public docs carry the testnet-meaning card
with blocked value-bearing mainnet posture; claim-boundary tokens and launch
navigation remain intact; `.proofs/v48/landing-public-launch-messaging.json` is
generated; and `check:v48-gate8` validates the messaging.

V48 Gate 9 is complete when the staging-testnet rehearsal law binds the
deployment truth sources for every launch surface; the realistic-data
contract minimums are satisfied by the rehearsed population; the settlement
observation lane preserves production ordering law; the value-bearing mainnet
lane rehearses as blocked; lane receipts remain dry-run with live execution
operator opt-in and no serialized live credentials;
`.proofs/v48/staging-testnet-deployment-rehearsal.json` is generated; and
`check:v48-gate9` validates the rehearsal.

V48 Gate 10 is complete when the promotion readiness report binds all accepted
Gate 2–9 artifacts as present, parseable, and product-safe; the promotion
scripts, spec-family and runtime promotion preparation, proven generation, and
`v48-canon-promotion.yml` support V48; gate/canon workflows validate both
pre-promotion and post-promotion pointer postures; a draft-preview
`BITCODE_SPEC_V48_PROVEN.md` is generated; the V48 promotion dry-run passes;
`.proofs/v48/promotion-readiness-report.json` is generated; `check:v48-gate10`
validates the readiness; and the prepared post-promotion posture advances
`BITCODE_SPEC.txt` to `V48` only through the promotion workflow.
