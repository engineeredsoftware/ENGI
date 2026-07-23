# Absolute measurements (deposit-first design)

**Status:** Living design / audit companion for humans and agents.  
**Not rebuild law.** Complete Implementation Derivability lives only in the
active/draft `BITCODE_SPEC_*` family. If this document and SPEC diverge,
**SPEC wins**.

**Canon (must be complete on their own):**

| File | Role |
|------|------|
| `BITCODE_SPEC.txt` | Active version pointer |
| `BITCODE_SPEC_V48.md` | Draft full-system SPEC — `## V48 measurement law` |
| `BITCODE_SPEC_V48_PARITY_MATRIX.md` | Spec ↔ implementation ↔ test audit |
| `.docs/ASSET_PACKS.md` | DataPack orientation (non-canon) |

**Exhaustive design companion (non-canon):**  
[`.docs/ABSOLUTE_MEASUREMENTS_CATALOG.md`](./ABSOLUTE_MEASUREMENTS_CATALOG.md) —
five-lens catalog, mechanisms/tools, verification + provenance classes, v-next weights
(expands §5 of this doc).

**Scope of this document**

1. Audit the absolute measurement stack against SPEC and known design direction.  
2. Scaffold **every current absolute** with who measures it and how.  
3. Design the absolute catalog we want next (deposit side first).  
4. Brainstorm how better absolutes make DataPacks more discoverable, lucrative, and honestly measured.

**Out of first pass:** needinesses redesign (read-side). Boundary only: deposit
always carries `measurements.needinesses: []`.

**Snapshot date:** 2026-07-22 (working tree may include relocate of MeasureAgent
to `packages/generic-agents/agent-measure`).

---

## 1. Purpose and laws

Measurement is the singular key to valuable IP commoditization on Bitcode.

| Law | Meaning for absolutes |
| --- | --- |
| **Measurement before price** | Deposit options and commercial readback ground decisions in measured readings, not free-form model claims |
| **Models do not invent absolute volumes** | Hosts and tools measure quantity; agents may judge quality only over source-safe descriptors + measured counts |
| **DataPack identity** | `DataPack = patch + measurements + metadata` |
| **Deposit needinesses** | Always empty — reader-relative kinds are **not** deposit absolutes |
| **Weights sum to 1** | `ASSET_PACK_ABSOLUTES_CATALOG` is the fixed product catalog for absolute kinds |

Commercial UI rows (criticality, ROI, earnings policy) are **not** absolute
measurement kinds. They may project from absolutes; they must not replace them.

---

## 2. System map

```
@bitcode/measurement-generics          # primitive: specs, readings, nested carrier
        ↑
@bitcode/generic-agents-agent-measure  # MeasureAgent implementer (PTRR + measure prompts)
        ↑
@bitcode/generic-measurements-absolutes  # category framing (absolute only)
        ↑
@bitcode/generic-asset-packs-synthesis   # product catalog + product factory
        ↑
asset-packs-pipelines/syntheses/domain   # host: static analysis tool + merge
        ↑
asset-packs-pipelines/syntheses/deposit  # Implementation attach; Validation fail-closed
```

| Layer | Path / package | Responsibility |
| --- | --- | --- |
| Primitive | `packages/measurement-generics` | `MeasurementSpec`, `MeasurementReading`, `AssetPackMeasurements` |
| Agent implementer | `packages/generic-agents/agent-measure` | `factoryMeasureAgent` — category-parameterized PTRR measurer |
| Category | `packages/generic-measurements/absolutes` | `factoryAbsolutesMeasureAgent` — locks category + framing |
| Product catalog + factory | `packages/generic-asset-packs/synthesis` | `ASSET_PACK_ABSOLUTES_CATALOG`, `factorySynthesizeAssetPacksAbsolutesMeasureAgent` |
| Pipeline host | `…/domain/src/agents/validation/agent-measure-absolutes.ts` | `SourceStaticAnalysisTool`, `measureAssetPackAbsolutes`, merge |
| Deposit product | `…/syntheses/deposit` | Phase wiring; host attaches `measurements.absolutes` |

**Shared base decision:** keep one category-parameterized `MeasureAgent`. Absolutes
and needinesses differ by framing and validation (`-fit` on needinesses), not by
PTRR plumbing. Product code should enter through category factories, not free-form
category strings.

---

## 3. Audit summary

### 3.1 What is solid

| Area | Evidence |
| --- | --- |
| Nested carrier | `measurements: { absolutes, needinesses }` in primitives + deposit Finish |
| Quantity tool | `SourceStaticAnalysisTool` — deterministic counts; source-safe report only |
| Merge law | Quantity kinds tool-authoritative; quality from agent when inference enabled |
| Fail-closed Validation | Ready-to-finish requires non-empty absolutes with magnitude+volume |
| Product hierarchy shape | Measure → Absolutes → product factory is correct ownership |
| Pipeline tests | Stronger coverage under `agent-measure-absolutes.test.ts` than base packages |

### 3.2 Correctness and design gaps

| Gap | Severity | Detail |
| --- | --- | --- |
| **Dual catalogs** | High | `ASSET_PACK_ABSOLUTES_CATALOG` is law; `DEPOSIT_MEASUREMENT_CATALOG` / `READ_MEASUREMENT_CATALOG` (`source-coverage`, `demand-alignment`, `reuse-likelihood`, …) still feed synthesis prompts and tests — confuses absolute KIND taxonomy with commercial / lens-era rows |
| **Prompt identity** | High | SPEC measurement prompt rule wants named Prompt/PromptPart, digest, proof. MeasureAgent builds inline string parts — weak audit trail |
| **Tools off the agent** | Medium | MeasureAgent `tools: []`. Static analysis is host-side only; quality path cannot re-query tools mid-PTRR |
| **Discovery ↔ Implementation bridge** | Medium | SPEC: checkout-wide `discovery:sourceMeasurements` then per-pack Implementation absolutes — product bridge under-documented |
| **Thin base tests** | Medium | `agent-measure` ~3 core tests; `absolutes` ~2; rigor lives in pipeline host |
| **Vocabulary debt** | Low–Med | “lens” in product factory; SPEC package map may lag `generic-agents/agent-measure` relocate |
| **Absolutes underused for search** | Medium | Depository has static filters / lexical / vector; absolute kinds rarely first-class facets for discoverability |
| **Heuristic quality defaults** | Medium | Without real inference, quality volumes derive from confidence + quantity composites — honest fallback, easy to over-trust in UI |

### 3.3 Primitive usage (elegant vs incomplete)

| Primitive | How used | Assessment |
| --- | --- | --- |
| **Execution** | Tool register/resolve on execution; agent invoked with execution context | Elegant host pattern |
| **Tool registry** | `SourceStaticAnalysisTool` registered; `use()` called directly (no raw-arg persistence) | Elegant for quantity; incomplete as agent tools |
| **Prompt / Prompt registry** | Inline `Prompt` keys `agent:identity`, `agent:requirements`, `ptrr:*` | Incomplete vs named raw_promptparts + identity proof |
| **Schemas (Zod)** | Intermediate agent output vs product absolute reading | Solid separation |
| **Registries (general)** | Tools yes; measurement prompt catalog no | Gap for parity “measurement prompt traceability” |
| **Agents / PTRR** | Shared measure base + thin category wrappers | Elegant shape |
| **Legacy catalogs** | Lens-era deposit/read measurement catalogs still live | Failed clarity — quarantine or rename to commercial policy |

---

## 4. Catalog scaffold (current — what we have)

**Source of truth in code:**  
`packages/generic-asset-packs/synthesis/src/measurement-catalogs.ts`  
(`ASSET_PACK_ABSOLUTES_CATALOG`)

**Quantity normalizers** (magnitude → volume, saturate at divisor) in  
`agent-measure-absolutes.ts`:

| Kind | Divisor |
| --- | --- |
| `function-count` | 40 |
| `type-count` | 24 |
| `file-span` | 10 |
| `symbolic-richness` | 200 |
| `modularity` | 12 |

**Who measures stack**

1. `SourceStaticAnalysisTool` → report counts  
2. `computeAbsolutesFromReport` → full catalog deterministic row set  
3. Optional `factorySynthesizeAssetPacksAbsolutesMeasureAgent` → quality volumes  
4. `mergeReportAndReadings` → quantity stays tool-authoritative  

Weights sum to **1.00** (quantity 0.50 + quality 0.50).

---

### 4.1 Quantity kinds (tool-authoritative)

#### `function-count`

| Field | Value |
| --- | --- |
| Label | Functions |
| Unit | `functions` |
| Weight | 0.12 |
| propertyClass | quantity |
| Magnitude | Distinct functions/behaviors encoded by the patch (static analysis estimate) |
| Volume | `clamp01(magnitude / 40)` |
| Evidence | Regex/density analysis over samples × covered paths; path-only heuristic if no samples |
| Fallback | `~ coveredPathCount * 3` when not measured from samples |
| Agent role | Must not invent magnitude; may only reason about consistency |
| Deposit UI | Size / richness panel |
| Search | Candidate facet: min functions |

#### `type-count`

| Field | Value |
| --- | --- |
| Label | Types |
| Unit | `types` |
| Weight | 0.10 |
| propertyClass | quantity |
| Magnitude | Distinct types/interfaces/schemas |
| Volume | `clamp01(magnitude / 24)` |
| Evidence | Same static-analysis tool |
| Fallback | `~ coveredPathCount * 1.5` |
| Deposit UI | Structural density |
| Search | Facet: type surface size |

#### `file-span`

| Field | Value |
| --- | --- |
| Label | File span |
| Unit | `files` |
| Weight | 0.08 |
| propertyClass | quantity |
| Magnitude | Files create/modify/delete in patch descriptor (or covered path count) |
| Volume | `clamp01(magnitude / 10)` |
| Evidence | `fileChanges[]` path+op preferred; else report `targetFileCount` |
| Fallback | Covered path length |
| Deposit UI | Breadth of change |
| Search | Facet: pack size by files |

#### `symbolic-richness`

| Field | Value |
| --- | --- |
| Label | Symbolic richness |
| Unit | `symbols` |
| Weight | 0.12 |
| propertyClass | quantity |
| Magnitude | Unique symbol estimate over covered set |
| Volume | `clamp01(magnitude / 200)` |
| Evidence | Static analysis symbol counts |
| Fallback | `~ coveredPathCount * 8` |
| Deposit UI | Identifier / API surface density |
| Search | Proxy for “how much named knowledge” |

#### `modularity`

| Field | Value |
| --- | --- |
| Label | Modularity |
| Unit | `modules` |
| Weight | 0.08 |
| propertyClass | quantity |
| Magnitude | Distinct top-level path modules / packages touched |
| Volume | `clamp01(magnitude / 12)` |
| Evidence | Path prefix set + report `moduleCount` |
| Fallback | At least 1 module from paths |
| Deposit UI | Cross-cutting vs local slice |
| Search | Multi-module vs single-module packs |

---

### 4.2 Quality kinds (agent judgment, grounded)

#### `correctness-estimate`

| Field | Value |
| --- | --- |
| Label | Correctness |
| Unit | `estimate` |
| Weight | 0.18 |
| propertyClass | quality |
| Magnitude | Mirrors volume (always required) |
| Volume | 0..1 fidelity/coherence of synthesized knowledge |
| Evidence | Source-safe descriptor + tool counts; optional LLM judgment |
| Deterministic fallback | `clamp01(patch.confidence ?? 0.6)` |
| Agent role | Judge coherence; never invent quantity magnitudes |
| Risk | Confidence conflated with correctness without inference |

#### `objectives-fidelity`

| Field | Value |
| --- | --- |
| Label | Objectives fidelity |
| Unit | `estimate` |
| Weight | 0.16 |
| propertyClass | quality |
| Magnitude | Mirrors volume |
| Volume | Serves deposit objectives; honors obfuscations/exclusions |
| Deterministic fallback | `0.55 * correctness + 0.45 * quantityComposite` |
| Agent role | Align pack with depositor steering without leakage |
| Risk | Hard to verify without explicit objectives in descriptor |

#### `computational-usage`

| Field | Value |
| --- | --- |
| Label | Computational usage |
| Unit | `estimate` |
| Weight | 0.16 |
| propertyClass | quality |
| Magnitude | Mirrors volume |
| Volume | Estimated computational demand of the knowledge surface |
| Deterministic fallback | Weighted blend of symbol/function/file normalizers |
| Agent role | Bound “how heavy is this knowledge to run/use” |
| Risk | Not runtime-measured; estimate only |

---

### 4.3 Absolute composite (derived, not a catalog row)

```
absoluteComposite = Σ (weight_i × volume_i)   // over ASSET_PACK_ABSOLUTES_CATALOG
```

- Used for **supply legibility** and depositor comparison.  
- **Not** settlement BTD. Read-side BTD uses needinesses / need-fit family only.

---

### 4.4 Not absolutes (do not promote by accident)

| Name | Status | Correct home |
| --- | --- | --- |
| `source-coverage`, `demand-alignment`, `reuse-likelihood` | Legacy `DEPOSIT_MEASUREMENT_CATALOG` | Commercial / synthesis prompt policy — **not** `measurements.absolutes` |
| `need-fit`, `language-fit`, … | Needinesses | Read-only measurement KIND |
| Criticality, ROI, earnings estimates | Product policy projections | UI / earnings intelligence — may *use* absolutes as inputs |

---

## 5. Catalog design (target — deposit-first)

Goals for the next absolute catalog revision:

1. Prefer **tool-measurable** quantity over new free-form quality.  
2. Keep weights summing to 1; rebalance only with explicit rationale.  
3. Every new kind must declare: measure owner, evidence, normalizer, fail posture.  
4. SPEC delta required before commercial law changes land as rebuild truth.

### 5.1 Proposed quantity expansions (candidates)

| Candidate kind | Intent | Measure owner (ideal) | Why deposit-first |
| --- | --- | --- | --- |
| `test-surface` | Tests / proofs touched or provided | Static analysis + path heuristics | Proof-operations-slice packs differentiate |
| `api-surface` | Exported APIs / public entrypoints | AST/LSP or export scan | Capability-slice discoverability |
| `dependency-span` | External deps the patch binds | Manifest + import graph | Integration risk honesty |
| `doc-signal` | Doc/comment density supporting the patch | Static scan | Human transferability |
| `lang-span` | Distinct languages in covered set | Path/ext already in report | Search facets |

**Design rule:** do not add more than ~3 quantity kinds without retiring or demoting weight on weaker signals. Prefer elevating existing tool signals (`configKeyCount`, `lineCount`, language breakdown) into first-class kinds only if product UI and search need them.

### 5.2 Quality refinements (candidates)

| Candidate | Intent | Constraint |
| --- | --- | --- |
| Split `correctness-estimate` into coherence vs completeness | Better depositor trust | Requires stronger descriptors + tools |
| `source-safety-confidence` | Explicit non-leakage of obfuscations | Must be tool-checkable where possible |
| Keep `objectives-fidelity` | Core deposit steering | Needs objectives in source-safe descriptor |
| Revisit `computational-usage` | Often weak without runtime | Consider demote weight or tool-ground with complexity proxies |

### 5.3 Target posture (v1 design intent)

| Class | Target share of weight | Rationale |
| --- | --- | --- |
| Quantity (tool) | ≥ 0.55 | Honesty and discoverability scale with measurable structure |
| Quality (grounded agent) | ≤ 0.45 | Judgment remains valuable; never outruns tools |

Exact weights deferred until candidate set is chosen with product (deposits UX + depository search).

### 5.4 Kill list (clarity)

| Item | Action |
| --- | --- |
| `DEPOSIT_MEASUREMENT_CATALOG` as “measurement” | Rename to **deposit commercial / synthesis policy catalog** or delete once prompts use absolutes language only |
| `measurementCatalogForLens` | Replace with explicit `absolutesCatalog` + separate policy rows |
| Dual naming MeasureAgent package | Finish relocate to `generic-agents/agent-measure`; update SPEC package map on next SPEC touch |

---

## 6. Primitive contracts (required direction)

### 6.1 Execution

- Register measurement tools on the active Execution (or resolve parent).  
- Prefer `tool.use(...)` with in-memory source-safe args over telemetry-persisting execute paths for raw source.  
- Pass execution into `measureAssetPackAbsolutes` so tools and quality inference share root stores.

### 6.2 Tools

- **Today:** static analysis is host-owned.  
- **Target:** MeasureAgent may accept optional measurement tools (static analysis, LSP query) while merge law still treats quantity kinds as tool-authoritative when a report exists.  
- New tools: language-generic first; AST/LSP where hosted.

### 6.3 Prompts / registry

SPEC measurement prompt rule:

- Named Prompt / PromptPart composition through `@bitcode/prompts`.  
- Record: context class, source boundary, prompt template identity, source-safe digest, typed schema, parsed result, proof root, telemetry receipt, repair posture.

**Target:** replace inline measure identity/requirements/PTRR strings with registered raw_promptparts (e.g. `promptpart_generic_agent_measure_*`).

### 6.4 Schemas and proof

- Intermediate: `MeasurementOutputSchema` (flat readings + summary).  
- Product: absolute reading with `measurementKind`, `label`, `weight`, `volume`, `magnitude`, `unit`, `category: 'absolute'`, optional `descriptor` / `evidenceRoot`.  
- Always complete catalog order; missing agent readings fall back to deterministic rows.

### 6.5 Registries

- Tools: continue Execution tool registry.  
- Prompts: measurement prompt identity must become greppable and proof-bindable.  
- Avoid inventing a third parallel “measurement registry” until prompts+tools are clean.

---

## 7. Deposit pipeline binding

| Phase | Absolute role | Status / gap |
| --- | --- | --- |
| **Setup** | No absolute volumes on options yet | OK |
| **Discovery `comprehend-codebase`** | Checkout-wide absolutes → `discovery:sourceMeasurements` ground knowledge map | Ensure product still writes this store; document shape in code |
| **Implementation** | After patch plan + patchfile: host measures pack → `measurements.absolutes` | Primary path: `measureAssetPackAbsolutes` |
| **Validation ready-to-finish** | Fail-closed if absolutes empty / missing magnitude+volume; may backfill | Keep tests green; no LLM invent |
| **Finish** | Store selection envelope with measured options | Source-safe only |

**LLM deposit agents** synthesize patch + metadata; they **must not** emit absolute volumes in options JSON. Host attaches measurements.

---

## 8. Brainstorm: better DataPacks via better absolutes

### 8.1 Discoverability

- **Faceted depository search** on absolute kinds (min `function-count`, language span, modularity ≥ N).  
- **Material richness score** = absolute composite for browse sort (not price).  
- **Fingerprint clusters** — capability-slice vs implementation-pattern vs proof-operations-slice should show distinct absolute signatures (tests + API surface vs core modules).  
- **Compare mode** on `/deposits` and `/packs` — side-by-side absolute radar for 2–4 options.  
- Index admitted packs with structured absolute columns in `depository_search_documents` (not only embed text).

### 8.2 Lucrative / commercial legibility (deposit)

- Map absolute composite + pack kind → **earnings panel grounding** (policy projection, explicitly non-measurement).  
- Sell “measured knowledge volume” narrative on landing without inventing BTD on deposit.  
- Distinct fingerprints reduce “all options look the same” → higher selection quality → better admit quality → better read market.  
- Never put demand-alignment into absolutes; demand is market/read context.

### 8.3 More measured (honesty)

- Prefer LSP/AST over regex for function/type counts where Host can afford it.  
- Publish `coverageRatio` / `measuredFromSamples` into descriptor so UI can show “measured vs estimated.”  
- Evidence roots per reading for repair and disputes.  
- Expand quantity before adding soft quality.  
- Golden fixtures: known small repos → expected magnitude bands.

### 8.4 Elegant primitives

- MeasureAgent: optional tools + named prompts.  
- Single absolute catalog; commercial policy catalog clearly named.  
- Category packages stay thin; product catalogs own weights.  
- Core/edges tests co-located at each layer (base agent, category, product host).

### 8.5 Future measurement kinds (beyond absolutes)

Out of scope for this doc’s implementation, but design boundary:

| Future KIND | Role |
| --- | --- |
| needinesses | Read fit (exists) |
| marketness? | Demand-grounded commercial dynamics (if ever) — **not** absolute |
| runtime-performance | Could become absolute quantity if tool-measured |

Do not overload absolutes with market or Need-relative signal.

---

## 9. Open questions and decisions log

| ID | Question | Options | Decision |
| --- | --- | --- | --- |
| Q1 | Keep shared `agent-measure` base? | Shared vs split absolute/neediness packages | **Shared** — PTRR plumbing is identical |
| Q2 | Should quality inference be default on deposit Implementation? | Always when execution present vs flag | Prefer always with deterministic fallback (align with `preferQualityInference`) |
| Q3 | Retire `DEPOSIT_MEASUREMENT_CATALOG` when? | Immediate vs after prompt rewrite | After prompts no longer depend on it |
| Q4 | Next quantity kinds priority? | test-surface / api-surface / lang-span | **TBD with product** — default lean: `lang-span` + `test-surface` first |
| Q5 | SPEC promotion of catalog changes | Impl-only experiment vs SPEC delta first | Catalog law changes → SPEC gate; tooling/prompt hygiene can be impl-only |

---

## 10. Implementation backlog (ordered)

| # | Work | Package(s) | SPEC? |
| --- | --- | --- | --- |
| 0 | Finish `generic-agents/agent-measure` relocate + commit | agent-measure + dependents | No (layout) |
| 1 | Elevate core/edges tests for measure-agent + absolutes | agent-measure, absolutes | No |
| 2 | Named measure PromptParts | prompts + agent-measure | Prefer prompt identity binding |
| 3 | Optional tools on MeasureAgent (static analysis) | agent-measure, domain host | No if merge law unchanged |
| 4 | Quarantine/rename legacy deposit/read measurement catalogs | generic-asset-packs/synthesis, domain, deposit | No if behavior preserved |
| 5 | Document Discovery `sourceMeasurements` shape in code + tests | deposit discovery | Align with SPEC |
| 6 | Depository absolute facets (filter/sort) | depository search + index | Possibly parity row |
| 7 | Candidate new quantity kinds (lang-span, test-surface) | catalog + tool + SPEC | **Yes** for law |
| 8 | UI: absolute radar / measured-vs-estimated on deposits | apps/uapi deposits | Product |
| 9 | Needinesses deep pass | later | Gate read |

---

## 11. Related files (quick index)

| Path | Why |
| --- | --- |
| `.specifications/BITCODE_SPEC_V48.md` § measurement law | Rebuild law |
| `.docs/ASSET_PACKS.md` §2 | Orientation catalog tables |
| `packages/measurement-generics/src/types.ts` | Primitive schemas |
| `packages/generic-agents/agent-measure/src/measure-agent.ts` | Base factory |
| `packages/generic-measurements/absolutes/src/absolutes-measure-agent.ts` | Category framing |
| `packages/generic-asset-packs/synthesis/src/measurement-catalogs.ts` | Product catalog |
| `packages/generic-asset-packs/synthesis/src/synthesize-asset-packs-absolutes-measure-agent.ts` | Product factory |
| `packages/asset-packs-pipelines/syntheses/domain/src/agents/validation/agent-measure-absolutes.ts` | Host measure + merge |
| `packages/asset-packs-pipelines/syntheses/domain/src/agents/validation/source-static-analysis-tool.ts` | Quantity tool |
| `packages/asset-packs-pipelines/syntheses/deposit/src/phases/*implementation*` | Deposit attach |

---

*Document owner: measurement + deposit pipeline maintainers. Update when absolute kinds, weights, measure stack, or deposit phase binding change. Promote catalog law changes through SPEC gates — do not treat this file as rebuild law.*
