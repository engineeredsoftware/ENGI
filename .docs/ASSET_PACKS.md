# AssetPacks

**Status:** Non-canonical companion / orientation guide for humans and agents.  
**Not rebuild law.** Complete Implementation Derivability lives **only** in the
active/draft `BITCODE_SPEC_*` family (`BITCODE_SPECIFYING.md`). Do not use this
file to recover system semantics omitted from SPEC. If this document and SPEC
diverge, **SPEC wins**.

**Canon (must be complete on their own):**

| File | Role |
|------|------|
| `BITCODE_SPEC.txt` | Active version pointer (promoted on `main`) |
| `BITCODE_SPEC_V48.md` | Draft full-system SPEC — AssetPack + deposit SDIVF law in § measurement + § Gate 3 |
| `BITCODE_SPEC_V48_NOTES.md` | Architecture intent / simplified reading (weaker than SPEC) |
| `BITCODE_SPEC_V48_DELTA.md` | Version decisions |
| `BITCODE_SPEC_V48_PARITY_MATRIX.md` | Spec ↔ implementation ↔ test audit |
| `BITCODE_SPEC_V48_PROVEN.md` | Generated proof appendix |

This document **summarizes** what an AssetPack is and how deposit options are
synthesized for readability. Every normative claim must also appear in
`BITCODE_SPEC_V48.md` (especially Gate 3 G3-1…G3-15 and measurement law).

**Product language**
- **Pipeline** = product run language (Setup → Discovery → Implementation → Validation → Finish).
- **Journal** = BTD ledger language (not “ledger” as UI copy).
- **No lens** in product code: deposit and read are **separate pipelines**, not one lensed pipeline.
- **Host** = the isolated workspace where clone, tools, and measurement run (`LocalHost`, `VercelSandboxHost`, …). Not a product route.

---

## 1. What an AssetPack is

An **AssetPack** is always a **completely synthesized artifact** — never a bare inventory slice and never raw source.

### 1.1 Canonical product shape

```
AssetPack = patch + measurements + metadata
```

| Element | Meaning | Deposit notes |
|--------|---------|----------------|
| **Patch** | Source-safe **descriptor** of digital material: which paths the pack covers and what knowledge shape it encodes | `fileChanges[{ path, op }]`, `patchSummary` — **path + op only**, never code/diffs in prompts or review payloads by default |
| **Measurements** | Formal **absolute** material-property readings of that patch (quantity + quality) | Required before Finish; host attaches via measure stack; LLM does **not** invent volumes |
| **Metadata** | Human-legible, commercially steerable fields | `kind`, `title`, `summary`, `coveredSourcePaths`, `confidence`, optional `needinessSignal` |

Hierarchy in code:

```
AssetPack (primitive, @bitcode/asset-packs-generics)
  └── SynthesisAssetPack (@bitcode/generic-asset-packs-synthesis)
        └── Deposit option / selection-envelope row / durable artifact projection
```

`SynthesisAssetPack` carries protocol identity, source binding, path+op patch, absolute (and optional neediness) measurements, and **provenant source paths** (depositor-owned path list — still no raw source blobs in the commercial object).

### 1.2 Deposit option kinds (v0)

Implementation synthesizes **2–4** distinct candidates. Each candidate `kind` is one of:

| Kind | Intent |
|------|--------|
| `capability-slice` | A bounded capability the repository embodies (what it can do) |
| `implementation-pattern` | A reusable pattern / structure the codebase applies |
| `proof-operations-slice` | Proof, ops, verification, or operational knowledge surface |

These are commercially legible **knowledge groups**, not file dumps.

### 1.3 Source-safety law

- Prompts and review surfaces reason over **paths, samples, measurements, and natural-language summaries**.
- Full checkout **file bodies** live on the Host / `deposit:sourceCheckoutCatalog.sources` for measurement tools — they are **not** dual-written into telemetried `pipeline:input` and are **not** the default durable Finish bundle.
- Obfuscations + Impermissible sources never appear as pack content; violators are dropped or flagged.

### 1.4 Deposit vs read (product split)

| | **Deposit** (this document’s focus) | **Read** (later section outline) |
|--|-------------------------------------|----------------------------------|
| Input | Depositor repository + Obfuscations + Forced In/Exclusions + demand context | Reader Need + depository supply |
| AssetPack base | Measured patch against the **depositing** repo | Measured patch against the **reading** repo, built from fitted deposited packs |
| Measurements | **Absolutes** (+ optional neediness **preview**) | Absolutes **+** fit/relative measurements (BTD from fit-only family) |
| Finish | Store options for **/deposits** review selection | Settle / deliver for the Need (SettleAssetPack / shippables — later) |

---

## 2. Measurement KINDS (absolutes + needinesses)

**Canonical carrier (nested):**

```
measurements: {
  absolutes: AbsoluteReading[];      // intrinsic material properties
  needinesses: NeedinessReading[];   // reader/Need-relative — READ ONLY
}
```

| Kind | Deposit | Read |
|------|---------|------|
| **absolutes** | Required | Required (from deposit / re-measure) |
| **needinesses** | Always `[]` | Static catalogue + dynamic per-Need; **need-fit** = weighted mean |

**Absolute reading fields (always required):** `measurementKind`, `label`, `weight`,
`volume` (0..1), `magnitude` (quantity = raw count; quality = mirrors volume), `unit`,
`category: 'absolute'`.

Digital material has properties. Bitcode **measures** them; models **do not invent** volumes.

## 2.1 Absolute measurements (the material-property law)

Digital material has properties. Bitcode **measures** them; models **do not invent** absolute volumes.

### 2.1 Catalog: `ASSET_PACK_ABSOLUTES_CATALOG`

Defined in `@bitcode/generic-asset-packs-synthesis` (`measurement-catalogs.ts`). Weights **sum to 1**. Shared across deposit and read for absolute properties.

#### Quantity (Tool-authoritative)

Static analysis + patch descriptor produce **magnitude** (raw count) and **volume** (normalized 0..1).

| `measurementKind` | Label | Unit | Weight | What is measured |
|-------------------|-------|------|--------|------------------|
| `function-count` | Functions | functions | 0.12 | Distinct functions/behaviors the patch encodes |
| `type-count` | Types | types | 0.10 | Distinct types/interfaces/schemas |
| `file-span` | File span | files | 0.08 | Files create/modify/delete in the patch descriptor |
| `symbolic-richness` | Symbolic richness | symbols | 0.12 | Density of distinct symbols/identifiers |
| `modularity` | Modularity | modules | 0.08 | Distinct path modules / top-level packages touched |

#### Quality (measure-agent judgment, grounded in quantities)

Volumes are 0..1 estimates; no free-form invention without the measure stack.

| `measurementKind` | Label | Unit | Weight | What is judged |
|-------------------|-------|------|--------|----------------|
| `correctness-estimate` | Correctness | estimate | 0.18 | Internal coherence / fidelity of synthesized knowledge |
| `objectives-fidelity` | Objectives fidelity | estimate | 0.16 | Serves deposit objectives; honors obfuscations/exclusions |
| `computational-usage` | Computational usage | estimate | 0.16 | Estimated computational demand of the knowledge surface |

### 2.2 Measurement reading shape

Each formal absolute roughly:

```ts
{
  measurementKind: string;  // catalog key
  label: string;
  weight: number;           // catalog weight
  volume: number;           // 0..1
  category: 'absolute';
  magnitude?: number;       // raw count for quantity kinds
  unit?: string;            // functions | types | files | symbols | modules | estimate
  evidenceRoot?: string;    // optional hash/root for audit
}
```

**Absolute composite** (when computed): weighted sum of absolute volumes (Σ weight × volume). Used as commercial legibility for supply; BTD for **reads** uses the **fit** family, not this deposit absolute composite alone.

### 2.3 Who measures what, when

| Phase | Measurement role |
|-------|------------------|
| **Discovery `comprehend-codebase`** | Measures **Host checkout material** (checkout-wide absolutes → `discovery:sourceMeasurements`) to ground the knowledge map |
| **Implementation** | After PTRR: attaches **per-option** `absolutes[]` (Discovery measurements and/or `measureAssetPackAbsolutes` on the pack descriptor + sources) |
| **Validation ready-to-finish** | **Requires** absolutes; may backfill if missing; fails quality if still empty |
| **LLM agents** | Never invent absolute volumes in options JSON |

Stack:

1. **`SourceStaticAnalysisTool`** — deterministic quantity signal from samples/sources.  
2. **`measureAssetPackAbsolutes` / SynthesizeAssetPacksAbsolutesMeasureAgent** — quality volumes grounded in quantity + source-safe descriptor.  
3. Merge: quantity kinds tool-authoritative; quality from agent with deterministic fallback.

### 2.4 Needinesses (read-only measurement KIND)

Needinesses are **not** used on deposit. On read: static catalogue (e.g. language-fit,
domain-fit, interface-fit) + dynamic inferred dimensions for the Need; **need-fit**
is the weighted mean of needinesses volumes (`computeNeedFitVolume`). See SPEC
measurement law and `@bitcode/generic-measurements-needinesses`.

---

## 3. Depositing: synthesizing AssetPack **options**

Product pipeline name: **SynthesizeDepositAssetPacks** (SDIVF).

```
Host provision / preprocess
  → Setup
  → (Discovery → Implementation → Validation) × maxIterations   // DIV loop
  → Finish
  → postprocess / route projection
```

**Default `maxIterations = 1`** in the current factory (single DIV pass). The SDIVF substrate **can** re-run DIV when Validation does not signal ready-to-finish (`validation:readyToFinish` / result flags), up to `maxIterations`. Optimization for “best packs for the depositor to consider” is therefore:

1. **Within one pass** — rich Discovery → multi-candidate Implementation → A/B/C Validation.  
2. **Across DIV iterations** — when maxIterations > 1 and Validation returns `recommendation: "iterate"`, Discovery/Implementation re-run with prior evidence still on the shared Execution root.  
3. **Human loop** — Finish presents a **selection envelope** on `/deposits`; the depositor chooses which options to admit (resynthesis with tighter Obfuscations/Forced paths is the human steering loop).

There is **no** separate “inventory agent” and **no** Fits Finding under deposit.

### 3.1 Inputs to a deposit run

| Input | Role |
|-------|------|
| Repository coordinates | owner/name, branch, commit SHA, clone URL |
| Host | Isolated workspace; full-tree clone or adopt |
| **sourceCheckoutCatalog** | Canonical path list + samples + optional full `sources[]` for measurement |
| Obfuscations | Free-text “what to withhold” |
| Permissible sources / Exclusions | Path bounds (exclusions fail-closed) |
| demandContext | Optional demand signals for depository search / neediness |
| Hooks (optional) | `deposit:persistArtifacts`, `deposit:ledgerWrite` |

**Canonical name:** `sourceCheckoutCatalog` (legacy dual-write `inventory` only for old stream filters).

Catalog projection for prompts: **paths + samples only** (`projectInventoryForPrompt`). Full bodies stay on Host/store for tools.

### 3.2 Phase roster (deposit-native keys only)

One roster key per agent — no synonym aliases.

```
Setup:
  sequential(
    setup:clone-vcs-repository,
    parallel(
      setup:initialize-lsp,
      setup:initialize-mcps-tools,
      setup:comprehend-obfuscations
    ),
    setup:danger-wall
  )

Discovery:
  parallel(
    discovery:comprehend-codebase,
    discovery:search-depository,
    discovery:inherent-regurgitation
  )

Implementation:
  implementation:deposit-asset-pack-synthesis

Validation:
  validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline

Finish:
  sequential(
    finish:store-artifacts,
    finish:ledgerize,
    finish:finish-synthesize-asset-packs-for-deposit-run
  )
```

Implementation lives in `packages/asset-packs-pipelines/syntheses/deposit/src/phases/` (one SDIVF ExecutionPhase product file per role + roster bag).

---

## 4. Setup (admit the run)

### 4.1 `setup:clone-vcs-repository`

| | |
|--|--|
| **Objective** | Establish Host workspace: adopt this-run tree or shallow/full clone at SHA |
| **Tools** | Host VCS / clone tool (`asset-pack-clone-vcs-repository-tool` family) |
| **Outputs** | `repository.workspacePath`; Host checkout available for LSP and file loads |
| **PTRR** | Shared clone prompts where LLM path is used; Host-only short-circuit when tree already present |

### 4.2 Parallel bootstrap

#### `setup:initialize-lsp`

| | |
|--|--|
| **Objective** | Start language services on the Host checkout |
| **Outputs** | `setup/lsp.initialized`, workspace path for later `lsp-query` |

#### `setup:initialize-mcps-tools`

| | |
|--|--|
| **Objective** | Register Host MCP / tool surface for the run |

#### `setup:comprehend-obfuscations` (`DepositInputComprehensionAgent`)

| | |
|--|--|
| **Objective** | Map free-text Obfuscations onto **sourceCheckoutCatalog** paths/concepts |
| **Empty Obfuscations** | Skip LLM; empty guidance; Impermissible sources remain authoritative |
| **Prompt parts** | `agent:identity`, `agent:requirements`, `ptrr:plan|try|refine|retry` |
| **Output schema** | `{ comprehension: { summary, obfuscatedPaths?, obfuscatedConcepts?, honorNotes? } }` |
| **Stores** | `setup:inputComprehension`, `setup:obfuscationComprehension` (shared root) |

### 4.3 `setup:danger-wall`

| | |
|--|--|
| **Objective** | **Admit** obfuscation posture before Discovery (deterministic) |
| **Fail-closed** | Text provided but guidance missing/empty → `ShortCircuitError` |
| **Outputs** | `setup:admission`, `setup:dangerWall` `{ safe, reason, flags, ... }` |

---

## 5. Discovery (three parallel knowledge sources)

Three **distinct agents/procedures** — not “lenses.” Together they answer: *What knowledge groups exist, what demand would buy them, and what general patterns apply?*

### 5.1 `discovery:comprehend-codebase` — confident codebase comprehension

**Goal:** Build enough structure-aware, measured, source-safe understanding to **find the right knowledge groups** for AssetPacks.

#### Gathered evidence (host-side, before/around PTRR)

1. **Absolute measurements** of checkout material (`measureAssetPackAbsolutes` over Host-loaded bodies) → `discovery:sourceMeasurements`  
2. **LSP queries** when registered (`lsp-query`: workspace/document symbols, …)  
3. **Full file-tree structure** from `sourceCheckoutCatalog.paths` (`buildFileTreeStructure`: top-level dirs/files, dir children, extension histogram)  
4. **Key file reads** (bounded set: README, package manifests, config roots, high-signal paths; content capped for prompts)

#### PTRR knowledge map

| Prompt layer | Purpose |
|--------------|---------|
| Identity | Comprehend Host checkout; ground in measurements + LSP + tree + key files |
| Requirements | Emit capabilities, knowledgeAreas, notableModules, measurementInsights, structureInsights |
| Plan / Try / Refine / Retry | Combine evidence → source-safe map; never invent paths |

**Output schema (comprehension):**

```ts
{
  summary: string;
  capabilities?: string[];
  knowledgeAreas?: string[];
  notableModules?: string[];      // paths from catalog only
  measurementInsights?: string[];
  structureInsights?: string[];
}
```

**Rich analysis store** (`discovery:codebaseAnalysis`):

```ts
{
  schema: 'bitcode.deposit.discovery.codebase-analysis';
  repository, workspacePath,
  sourceCheckoutCatalog: { pathCount, sampleCount, fileBodyCount, paths },
  fileTree, keyFileReads, sourceMeasurements,
  lsp: { initialized, queries[] },
  comprehension
}
```

Also stores `discovery:codebaseComprehension` (map alone) for Implementation.

#### Why this is “enough” to group knowledge

- **Tree + extensions** → module/package boundaries (natural pack seams).  
- **Key files** → stated product intent and stack.  
- **Absolutes on checkout** → where material density lives (avoid empty or noise packs).  
- **LSP** → symbol-level capability clusters when available.  
- **PTRR refine** → forces source-safety and path grounding before Implementation cuts packs.

### 5.2 `discovery:search-depository`

| | |
|--|--|
| **Objective** | Plan Depository search queries; produce **read-demand guidance** so packs are buyer-aligned |
| **Plan inputs** | Catalog paths/samples, obfuscations, checkout measurements, demandContext |
| **Tool** | `depository-asset-pack-search` — **multi-query hybrid**: lexical over preloaded supply assets + optional vector (`BITCODE_DEPOSITORY_VECTOR_SEARCH=1`); static filters (kind/repo/lifecycle); union-by-assetId rank |
| **Index** | On admit: `POST /api/depository/index` upserts `depository_search_documents` + embeds into `depository_search_vectors` (`match_depository_asset_pack_vectors`) |
| **Runtime** | Deposit + read dispatch **preload** settled/admitted assets onto execution before Discovery |
| **Output** | `{ guidance: { summary, likelyReadTopics?, demandAlignment?, underservedTopics?, readabilityNotes?, searchQueries? }, searchQueries? }` |
| **Stores** | `discovery:depositorySearch`, `discovery:depositorySearchQueries`, `discovery:depositorySearchToolResult` |

**Read product** uses the same tool with `product: 'read-need-fits'` and explicit multi-query fan-out (3–12 Need-grounded queries) so finding fits is real retrieval, not guidance-only.

**Env / ops**

| Variable | Role |
| --- | --- |
| `BITCODE_DEPOSITORY_VECTOR_SEARCH=1` | Enable vector channel in search tool |
| `OPENAI_API_KEY` / `BITCODE_OPENAI_API_KEY` | Embed queries + admit-time pack embeds |
| Migration `20260720120000_depository_search_index.sql` | Creates documents + vectors + match RPC |

**Tests:** `deposit-depository-search-tool.test.ts` (multi-query, static filters, hybrid);
`read-neediness-measurements.test.ts` (labels, weight re-norm); `depositoryIndexJob.test.ts`
(embed text + pack→asset map).

### 5.3 `discovery:inherent-regurgitation`

| | |
|--|--|
| **Objective** | Model-inherent patterns/practices relevant to this domain (training knowledge), not repo quotes |
| **Output** | `{ regurgitation: { summary, relevantKnowledge?, patterns?, references? } }` |
| **Store** | `discovery:inherentRegurgitation` |

---

## 6. Implementation (synthesize measured options)

### 6.1 `implementation:deposit-asset-pack-synthesis`

| | |
|--|--|
| **Objective** | Synthesize **2–4** distinct AssetPack candidates as digital material |
| **LLM produces** | Patch descriptors + metadata + optional needinessSignal |
| **Host attaches** | `absolutes[]` per option; materializes path+op via **AssetPackPatchWriteTool** |

#### Prompt parts (`deposit-asset-pack-synthesis-prompts.ts`)

| Part | Content thrust |
|------|----------------|
| Identity | Implementation for deposit; patch + measurements + metadata; host attaches absolutes |
| Requirements | Ground in three Discovery products + obfuscation guidance; kinds; coveredSourcePaths from catalog only; no invented volumes |
| Plan | Identify buyer-legible patches from catalog + Discovery (incl. measurements) |
| Try | Emit options array |
| Refine | Distinct, source-safe, exclusion-honoring |
| Retry | Minimal valid patch rather than fail |

#### Candidate schema (`deposit-asset-pack-synthesis-schema.ts`)

```ts
// depositCandidateSetSchema
{
  options: Array<{
    kind: string;                    // capability-slice | implementation-pattern | proof-operations-slice
    title: string;                   // 8..160
    summary: string;                 // 40..900, source-safe
    coveredSourcePaths: string[];    // 1..40, catalog paths only
    confidence: number;              // 0..1
    patch: {
      fileChanges: { path: string; op: 'create'|'modify'|'delete' }[];  // min 1
      patchSummary: string;
    };
    needinessSignal?: {
      demand: number; saturation: number; rationale: string;
    };
    absolutes?: Record<string, unknown>[];  // attached by host after PTRR
    measurements?: Record<string, number>;  // optional legacy 0..1 map
    measurementRationale?: string;
  }>  // length 1..4
}
```

#### Cross-phase stores

- `implementation:options` **and** `implementation:assetPacks` (same array)  
- `implementation:assetPack`, `implementation:summary`

---

## 7. Validation (single ready-to-finish gate)

### 7.1 `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline`

One agent. Three check families (A/B/C), plus DIV gate.

| Check | Content |
|-------|---------|
| **A Prior phase sanity** | workspacePath; danger-wall admission; sourceCheckoutCatalog.paths; Discovery products; non-empty Implementation options |
| **B Pack quality** | Each pack = patch + measurements + metadata; distinctness; source-safety; absolute kinds present |
| **C Obfuscations / Impermissible sources** | covered paths + patch paths vs blocked prefixes |

#### Qualitative PTRR output schema

```ts
{
  issues: string[];
  qualityScore: number;           // 0..1
  coverageGaps: string[];
  recommendation: 'complete' | 'iterate';
}
```

Merged with deterministic smoke checks → stores:

- `validation/implementation:issues`  
- `validation:depositQuality`  
- `validation:readyToFinish` `{ recommendation: 'finish'|'revise', summary, issues }`  
- Re-stores measured packs on `implementation:options|assetPacks`

**DIV exit:** root `validation:readyToFinish` with finish approval (or result flags) ends the DIV loop early when `maxIterations` would allow more. With `maxIterations: 1`, a single Validation pass always proceeds to Finish after that pass (iterate recommendation still informs humans / future multi-iter config).

---

## 8. Finish (store, journal, present)

### 8.1 `finish:store-artifacts`

Builds durable **source-safe** bundle:

```ts
{
  schema: 'bitcode.deposit.synthesize-asset-packs.artifacts';
  storedAt: string;
  assetPacks: /* full option objects */;
  patches: [{ title, kind, patch, coveredSourcePaths, absolutes, metadata }];
  discovery: { codebase…, depository…, regurgitation, sourceMeasurements, … };
  setup: { admission };
  validation: /* readyToFinish */;
  sourceCheckoutCatalog: { pathCount, sampleCount, fileBodyCount, paths }; // no sources bodies
}
```

| Store | Meaning |
|-------|---------|
| `finish:storedArtifacts` | Bundle for route + ledgerize |
| `finish:uploadForReview` | Review delivery posture (`/deposits`, pending-user-review) |
| `finish:persistResult` | Result of optional `deposit:persistArtifacts` hook (Supabase/DB) |

Default without hook: **execution-store-only** (route upsert owns durability).

### 8.2 `finish:ledgerize` (journal)

| | |
|--|--|
| **Requires** | `finish:storedArtifacts` |
| **Builds** | Per-option `contentsRoot`, `measurementRoot`, `metadataRoot` + discovery/validation roots |
| **Hook** | Optional `deposit:ledgerWrite` (BTD **journal** bridge) |
| **Not** | Full commercial settlement (BTC pay → mint → rights) — that is **settle-asset-pack-pipeline** later |

Stores: `finish:ledgerize`, `finish:ledgerReceipt`, `finish:ledgerWriteResult`.

### 8.3 `finish:finish-synthesize-asset-packs-for-deposit-run`

Presentation envelope for UI selection:

```ts
{
  schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope';
  surface: '/deposits';
  purpose: 'user-select-options-to-deposit';
  options: [{
    index, kind, title, summary, coveredSourcePaths, confidence,
    patch, measurements /* absolutes */, metadata: { needinessSignal, … },
    selectable: true
  }],
  readyToPresent, validationSummary
}
```

Plus `finish:completion` (cleanup posture: Host dispose owned by **dispatch** after Finish).

**Critical distinction — Finish store ≠ product close (do not regress):**

| Layer | Scope | What happens | Stream / UI meaning |
| --- | --- | --- | --- |
| **SDIVF Finish** | Shared substrate (deposit *and* read synth) | Agents store selection envelope + `finish/completion` on the execution tree | Telemetry may show Finish / READY TO FINISH; **not** product-ready option cards |
| **Stream type inference** | **Shared** `ExecutionStreamAdapter` | Must not map store `key=completion` → terminal `completion` | Avoids early tail close for all synth pipelines |
| **Deposit dispatch close** | **Deposit only** (`dispatch-deposit-synthesis`) | Builds `depositOptionSynthesis`, **`finalizeExecutionRow`**, **then** SSE `completion` with `depositOptionsReady` + envelope | **Only then** may `/deposits` hydrate option cards |
| **Read dispatch close** | Read (mirror when implemented) | Same pattern with read envelope — do not assume deposit code covers it | `/reads` option hydrate |

Never map execution **store** keys named `completion` (e.g. `finish`/`completion`) to stream type `completion` — that closes the client tail and hydrates before the row write (deposit false “options not found”). Terminal product completion is **route-owned** `emitEvent(..., 'completion')` after finalize, or store namespace `final` only. Deposit hydrate order: row/event payload first; history GET retry is fallback. Full map: `apps/uapi/components/deposits/README.md` § Product terminal vs stream telemetry.

### 8.4 What is ultimately stored / shipped / journaled

| Layer | What |
|-------|------|
| **Execution root** | Full phase artifacts for the run (including measurements) |
| **Durable store (hook/route)** | Artifact bundle + options for review; **not** monorepo source bodies by default |
| **Journal** | Addressable roots (contents / measurement / metadata) for later BTD binding |
| **Shipped to depositor** | Selection envelope on `/deposits` — human chooses which options become admitted supply |
| **Depository index** | After admission/settlement policies (search projection: measurements + metadata only) |
| **Not shipped as product content** | Raw secrets, full file bodies, private keys, un-obfuscated excluded paths |

---

## 9. Execution tree, access, and prompt interpolation

### 9.1 Run skeleton

```
Execution (ROOT)                          ← dispatch / route holds this
  preprocess (seq-0 child)
  setup      (seq-N child)
  discovery  (seq-N child)  ─┬─ agent children / PTRR steps
  implementation …           │
  validation …               │
  finish …                   │
  postprocess
```

Phases run as **isolated sibling** children under sequential SDIVF composition. `findUp` walks **ancestors only** — siblings cannot see each other’s local stores.

### 9.2 Cross-phase store-visibility law

| Role | API |
|------|-----|
| Producer | `storeCrossPhaseArtifact(execution, namespace, key, value)` → writes on **`execution.getRoot()`** |
| Consumer | `execution.get(ns, key) ?? execution.findUp(ns, key)` |

Without this law, Setup obfuscation guidance would be invisible to Implementation, Discovery maps would vanish for Validation, and the route could not read Finish outputs.

### 9.3 Key namespaces (deposit run)

| Namespace | Examples |
|-----------|----------|
| `pipeline` | `input` (projected), `synthesizeMode` |
| `deposit` | `repository`, `obfuscations`, `impermissibleSources`, `permissibleSources`, `demandContext`, **`sourceCheckoutCatalog`**, hooks |
| `repository` | `workspacePath` |
| `setup` | `inputComprehension`, `admission`, `dangerWall` |
| `setup/lsp` | `initialized`, `workspacePath` |
| `discovery` | `codebaseComprehension`, `codebaseAnalysis`, `sourceMeasurements`, `depositorySearch`, `inherentRegurgitation`, tool results |
| `implementation` | `options`, `assetPacks`, `summary` |
| `validation` | `readyToFinish`, `depositQuality` |
| `validation/implementation` | `issues` |
| `finish` | `storedArtifacts`, `ledgerize`, `selectionEnvelope`, `completion`, `persistResult` |
| `tools` | tool telemetry rows |

### 9.4 PTRR agent execution (sub-schema)

Most LLM deposit agents use **`factoryPTRRAgent`**:

```
Plan → Try → Refine → Retry
  each step: Failsafe × Thinkings generations
```

**Prompt composition (hierarchical system prompt):**

1. Pipeline / phase layers (when present)  
2. **`agent:identity`**  
3. **`agent:requirements`**  
4. **`ptrr:plan` | `ptrr:try` | `ptrr:refine` | `ptrr:retry`** (step layer for the current step)

Registry keys are set with `prompt.set('agent:identity', …)` etc. The composed string is what every boundary LLM call receives (prompt-contract tests pin this).

**User / task payload:** agent input object (repository, projected catalog, discovery maps, packs, …) — **not** full monorepo sources.

**Envelope unwrap:** `finalOutput ?? output ?? raw` (F27) before typed consumption.

### 9.5 Sub-executions

| Level | What it is |
|-------|------------|
| Pipeline run | Root Execution + SDIVF loop |
| Phase | Sibling child executor (setup / discovery / …) |
| Agent | Registered roster function; may spawn tool registry on Host |
| PTRR step | Plan/Try/Refine/Retry sub-executions with generation accounting |
| Tool call | Host tools (`lsp-query`, static analysis, depository search, patch-write, clone) |

---

## 10. Tools used on the deposit path

| Tool / capability | Phase | Role |
|-------------------|-------|------|
| Host VCS clone / adopt | Setup | Full checkout at SHA |
| LSP initialize + `lsp-query` | Setup / Discovery | Symbols for comprehension |
| MCP initialize | Setup | Host tool surface |
| Static analysis / measure stack | Discovery, Implementation, Validation backfill | Absolutes quantity + quality |
| `depository-asset-pack-search` | Discovery | Vector (optional) + lexical settled supply search |
| `asset-pack-patch-write` | Implementation | Materialize path+op descriptors |
| `deposit:persistArtifacts` (hook) | Finish | Durable DB write |
| `deposit:ledgerWrite` (hook) | Finish | Journal binding |

Tools map (roster keys) lives under `packages/asset-packs-pipelines/syntheses/domain/src/tools/index.ts`.

---

## 11. Optimization story (making “optimal” options)

Bitcode does **not** claim a global optimum. It optimizes **depositor-facing supply quality** through stacked constraints:

1. **Scope control** — Permissible sources/Exclusion + Obfuscations shrink admissible knowledge.  
2. **Measured structure** — Checkout absolutes + tree + LSP reveal real capability density.  
3. **Demand alignment** — Depository search + needinessSignal bias packs toward underserved, buyable topics.  
4. **Pattern prior** — Inherent regurgitation avoids naive or anti-pattern groupings.  
5. **Multi-option synthesis** — 2–4 **distinct** kinds/slices, not one mega-pack.  
6. **Fail-closed Validation** — Missing measurements, source leakage, exclusion hits, empty patches block “ready.”  
7. **DIV loop** — Substrate can re-enter Discovery→Implementation when not ready (when `maxIterations` > 1).  
8. **Human selection** — Depositor picks which measured options enter supply; resynthesis is the next optimization step with better steering.

Commercial honesty: **absolute measurements** make packs comparable as digital material; **neediness** is only a preview of future read demand.

---

## 12. End-to-end data flow (deposit)

```
Depositor UI (/deposits)
  → API dispatch (Host provision, catalog build, hooks)
  → preprocessDepositMode → deposit:* stores
  → Setup: clone → {LSP, MCP, obfuscations} → danger-wall
  → Discovery ∥ {codebase analysis+map, depository guidance, regurgitation}
  → Implementation: options[] + absolutes[]
  → Validation A/B/C → readyToFinish
  → Finish: artifacts → journal projection → selection envelope
  → Route projects options for review cards
  → (Later) depositor admits → depository supply index / settlement
```

---

## 13. Reading: synthesizing AssetPack options (deposit twin)

**Canon:** `BITCODE_SPEC_V48.md` §G4. Product package:
`@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs`.

| Topic | Law |
|-------|-----|
| Shape | **Same SDIVF** as deposit: Setup (clone → LSP/MCP/**comprehend-needs** → danger-wall) → Discovery ∥ three agents → Implementation → Validation ready-to-finish → Finish selection envelope |
| Instruction | **Need** free text (deposit uses Obfuscations) |
| Measurements | `absolutes` + `needinesses` (every neediness kind ends with **`-fit`**; static catalogue + dynamic from Need; **need-fit** = weighted mean) |
| API | `POST /api/read/synthesize-options` |
| UI | `/reads` master-detail + option review (deposit twin) |
| After select | **settle-asset-pack-pipeline** Simple (not SDIVF), **1:1 per bought option**: settle-btc → mint-btd (needinesses scalar → master) → settle-btd (master→buyer) → settle-asset-pack (ERC1155 co-own) → **PR** → `/packs` |

## 14. SettleAssetPack (not a synthesize pipeline)

Linear stages: validate → observe BTC finality → mint BTD / transfer rights →
ship AssetPack patch PR → journal PackActivity. Package:
`@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack`.

---

## 14. Package and file map

| Concern | Location |
|---------|----------|
| Deposit SDIVF ExecutionPhase product roster | `packages/asset-packs-pipelines/syntheses/deposit/src/phases/execution-pipeline-sdivf-execution-phase-synthesis-deposit-asset-packs.ts` (+ per-role siblings) |
| Discovery registration | `…/phases/discovery.ts` |
| Absolutes catalog | `packages/generic-asset-packs/synthesis/src/measurement-catalogs.ts` |
| Measured patch type | `packages/generic-asset-packs/synthesis/` |
| Deposit synthesis agent | `…/agents/implementation/deposit-asset-pack-synthesis-*.ts` |
| Validation ready-to-finish | `…/agents/validation/deposit-ready-to-finish-agent.ts` |
| Measure host | `…/agents/validation/agent-measure-absolutes.ts` |
| Finish agents | `…/agents/finish/deposit-*.ts` |
| Cross-phase store law | `…/synthesize-asset-packs.ts` (`storeCrossPhaseArtifact`) |
| Parity algorithm rows | `BITCODE_SPEC_V48_PARITY_MATRIX.md` (Deposit SDIVF target algorithm) |
| Prompt contracts | `…/__tests__/deposit-agent-prompt-contracts.test.ts` |

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **AssetPack** | Completely synthesized artifact = patch + measurements + metadata |
| **Absolute** | Intrinsic material property (quantity/quality); shared catalog |
| **Neediness** | Deposit-side preview of read demand (not an absolute) |
| **sourceCheckoutCatalog** | This-run Host path/sample/source material index |
| **PTRR** | Plan → Try → Refine → Retry agent loop |
| **SDIVF** | Setup, Discovery, Implementation, Validation, Finish |
| **DIV loop** | Discovery→Implementation→Validation iterated up to maxIterations |
| **Selection envelope** | Finish product for depositor option pick on `/deposits` |
| **Journal** | BTD ledger binding of synthesis roots (not full settlement) |
| **Host** | Isolated execution environment for clone/tools/measure |

---

*Document owner: product + pipeline maintainers. Prefer updating this file when deposit agent roster keys, absolute catalog kinds, or Finish schemas change — keep it aligned with deposit/read `execution-pipeline-sdivf-execution-phase-*` product phase files and `ASSET_PACK_ABSOLUTES_CATALOG`.*
