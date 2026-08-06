# Absolute Measurement Catalogue (DataPack)

**Status:** Living design companion for humans and agents — **not rebuild law**.  
If this document and `BITCODE_SPEC_*` diverge, **SPEC wins**.

**Canon SSOT (code):**  
`@bitcode/generic-measurements-domain-data-pack-absolutes-catalog`  
→ `DATA_PACK_ABSOLUTE_KIND_SPECS` (full target vocabulary, **46** kinds)  
→ `DATA_PACK_ABSOLUTES_CATALOG` (**all 46** kinds, each weighted, **Σ weights = 1** — full commercial law)  
→ `DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS` (UI filters: Any absolute + all 46 — never hand-list)  
Exchange: `PACKS_ABSOLUTE_KIND_OPTIONS` re-exports that SSOT only.  
Legacy: an 11-kind “weighted subset” no longer exists; `DATA_PACK_WEIGHTED_ABSOLUTE_KINDS` is an alias of all 46.

**Stack (hierarchy):**

```
measurement-generics
  → generic-measurements/absolutes/<kind>     bare pure measure (×46)
  → generic-tools/tool-measure-<kind>         Execution tool (×46)
  → generic-agents/agent-measure-absolutes    base agent + tool registration
  → factoryDeposit|ReadAbsolutesMeasureAgent  product factories
  → measureDataPackAbsolutes (pipeline host)  static analysis + merge law
  → depository index + hybrid search          absolute_kinds / absolute_volumes
  → /exchange buyer chips + deposit cards
```

**Commodity:** a **DataPack** = patch + measurements + metadata (never a raw repository).  
**Deposit needinesses:** always `[]`. Need-relative kinds are read-side only.  
**No `learning-gain`:** BTD / need-fit owns exchange value; learning-gain is not a deposit absolute.  
**Snapshot:** 2026-07-24 (aligned with hierarchy + hybrid search wiring).

---

## 1. Why this catalogue exists

Bitcode sells **measured knowledge**, not guesses. Absolutes are the **supply-side legibility surface**:

| Audience | What absolutes do for them |
| --- | --- |
| **Readers** | Compare packs before settle; filter/search the Depository; trust that size and quality are tool-grounded, not invented |
| **Depositors** | See what the host measured after synthesis; resynthesize when weak; understand gates (secrets/PII) |
| **Search (deposit + read)** | Facets on `absolute_kinds` / `absolute_volumes`; hybrid re-rank with absolute composite |
| **Exchange / activity** | Buyer chips + descriptors without unpaid source |
| **Settlement** | Absolutes are substrate; BTD mint is need-fit × rights, not raw absolute composite alone |

Laws (unchanged):

1. **Measurement before price** — readings first, commercial projection second.  
2. **Models do not invent volumes** — quantity/tool kinds are authoritative; quality is judgment over source-safe descriptors + measured counts.  
3. **Source-safe** — only counts, scores, roots, descriptors leave the measure path.  
4. **Weights sum to 1** over **all 46** commercial absolute kinds. `policyRole` (gate / penalty / flag) is operational and does **not** remove a kind from Σ.

---

## 2. Reading a kind row

Every kind below is described with the same fields:

| Field | Meaning |
| --- | --- |
| **Kind** | Stable `measurementKind` string (SSOT in catalog package) |
| **Family** | `structure` · `verification` · `hygiene` · `provenance` · `semantics` · `value` |
| **Class** | `quantity` · `verification` · `hygiene` · `provenance` · `quality` · `value` |
| **Policy** | Operational role: `weighted` · `gate` · `penalty` · `flag` · `target` (all rows still in Σ) |
| **Weight** | Commercial weight (positive; Σ across 46 = 1) |
| **What it is** | Definition of the material property |
| **Why readers care** | Buy/compare/search motivation |
| **How (now)** | Current bare measure + tool path |
| **Status** | `heuristic` (sources/staticSignals) · `estimated` (descriptor/confidence) · `host-signal` (needs sandbox/corpus) · `gate` |
| **Scale path** | How mechanism improves without changing the kind identity |

**Package path per kind:**

- Bare: `packages/generic-measurements/absolutes/<kind>/`  
- Tool: `packages/generic-tools/tool-measure-<kind>/` key `measure:absolute:<kind>`

---

## 3. Commercial catalog law — all 46 kinds (Σ = 1)

**Law:** every absolute kind is commercial. `DATA_PACK_ABSOLUTES_CATALOG` **is** the full 46-kind vocabulary; each row has a positive `weight` and **Σ = 1**.

There is **no** separate 11-kind subset. Older docs referring to “weighted 11” are legacy — use the SSOT package.

Approximate family mass (exact weights live only in `DATA_PACK_ABSOLUTE_KIND_SPECS`):

| Family | Kinds | ≈ weight mass |
| --- | ---: | ---: |
| Structure | 14 | 0.30 |
| Verification | 6 | 0.18 |
| Hygiene | 7 | 0.10 |
| Provenance | 6 | 0.12 |
| Semantics | 7 | 0.18 |
| Value | 6 | 0.12 |
| **Σ** | **46** | **1.00** |

`policyRole` (`gate` / `penalty` / `flag` / `weighted`) is **operational** (fail-closed, discount, disclose) — it does **not** remove a kind from Σ. Hygiene gates still fail-closed in Validation even while carrying catalogue weight.

Every deposit option’s host measure path attaches **all 46** readings (missing host signals → honest `insufficient_evidence` / volume 0, still present).

### 3.1 Structure (quantity)

Exact per-kind weights live only in `DATA_PACK_ABSOLUTE_KIND_SPECS` (do not hand-copy).

#### `function-count` — Functions

| | |
| --- | --- |
| **What** | Distinct function / method / arrow-handler surface in the DataPack patch. |
| **Why readers care** | Proxy for *how much operational behavior* they are buying — denser function surface usually means more reusable behavior per pack, not full-repo size. |
| **How now** | Prefer `staticSignals['function-count']` from host static analysis; else heuristic over DP sources (`function`, `=>`). Volume saturates at ~40 functions. |
| **Status** | heuristic / tool-backed when static analysis runs |
| **Scale path** | AST/LSP symbol counts (TS, Python, Go…); language-generic tree-sitter; never LOC alone. |

#### `type-count` — Types

| | |
| --- | --- |
| **What** | Distinct type / interface / schema / class-shape surface in the patch. |
| **Why readers care** | Structural reuse and API contract density without reading unpaid bodies. |
| **How now** | staticSignals or regex heuristics over type-like declarations. |
| **Status** | heuristic / tool-backed |
| **Scale path** | LSP type symbols; protobuf/OpenAPI schema counts when present in patch. |

#### `file-span` — File span · weight 0.05

| | |
| --- | --- |
| **What** | How many files the DataPack patch creates or modifies. |
| **Why readers care** | Review cost and boundary size — compact packs are easier to settle and audit. |
| **How now** | Measured from `fileChanges` / `coveredSourcePaths` (descriptor only; no bodies required). |
| **Status** | measured (descriptor-native) |
| **Scale path** | Weight create vs modify vs delete; exclude pure renames when path-op is richer. |

#### `symbolic-richness` — Symbolic richness · weight 0.09

| | |
| --- | --- |
| **What** | Unique identifier density across DP sources (vocabulary of the slice). |
| **Why readers care** | Transferable structure density; sparse tokens often mean thin stubs. |
| **How now** | staticSignals or unique token set over sources. |
| **Status** | heuristic / tool-backed |
| **Scale path** | Identifier tables from AST (exclude stopwords/imports); language-aware tokenizers. |

#### `modularity` — Modularity · weight 0.05

| | |
| --- | --- |
| **What** | How many top-level module roots the patch spans. |
| **Why readers care** | Multi-module packs signal clearer seams; single-module packs are tightly scoped. |
| **How now** | Distinct first path segments of covered paths / fileChanges. |
| **Status** | measured (path-native) |
| **Scale path** | Package-boundary graphs (package.json workspaces, go modules); import-module clusters. |

#### `lang-span` — Language span · weight 0.06

| | |
| --- | --- |
| **What** | Distinct languages (by extension) touched by the patch. |
| **Why readers care** | Cross-stack capability vs single-language focus; filters monorepo noise. |
| **How now** | Unique file extensions on covered paths. |
| **Status** | measured |
| **Scale path** | Linguist/GitHub language map; content sniff for extension-less files. |

#### `test-surface` — Test surface · weight 0.07

| | |
| --- | --- |
| **What** | Test files + test/assertion ops co-located with the patch. |
| **Why readers care** | Verification material that travels with the knowledge — *not* a runtime pass rate. |
| **How now** | Path heuristics (`__tests__`, `.test.`, `.spec.`) + `it`/`test`/`describe` counts; staticSignals preferred. |
| **Status** | heuristic / tool-backed |
| **Scale path** | tree-sitter test frameworks; assertion density; pair with `test-pass-rate` when sandbox exists. |

#### `api-surface` — API surface · weight 0.07

| | |
| --- | --- |
| **What** | Public export / entrypoint surface of the pack. |
| **Why readers care** | Integration seams — what can be imported/called without internal spelunking. |
| **How now** | staticSignals export counts or `\bexport\b` heuristics. |
| **Status** | heuristic / tool-backed |
| **Scale path** | `export` graph via AST; OpenAPI/GraphQL operation counts when artifacts are in-pack. |

### 3.2 Semantics (weighted quality)

#### `correctness-estimate` — Correctness · weight 0.16

| | |
| --- | --- |
| **What** | Estimated internal consistency / coherence of the synthesized pack (honesty class: **estimate**). |
| **Why readers care** | Highest commercial quality weight today — “does this look self-consistent?” before settle. |
| **How now** | Deterministic bare estimate from pack `confidence` (and optional MeasureAgent refine when inference enabled). **Not** a formal proof. |
| **Status** | estimated (+ optional agent refine) |
| **Scale path** | Ground on static counts + verification scores when available; never invent magnitude that contradicts tools. |

#### `objectives-fidelity` — Objectives fidelity · weight 0.15

| | |
| --- | --- |
| **What** | How well the pack serves deposit objectives while honoring exclusions / source-safety. |
| **Why readers care** | Steer quality — low scores mean resynthesize before admit. |
| **How now** | Confidence-blended deterministic estimate; agent may refine over source-safe descriptor. |
| **Status** | estimated |
| **Scale path** | Explicit objectives object on descriptor; exclusion-path checks as hard inputs. |

#### `computational-usage` — Computational usage · weight 0.14

| | |
| --- | --- |
| **What** | Estimated cost to apply / reason over the pack (delivery & planning proxy). |
| **Why readers care** | Settlement/runtime budgeting without executing unpaid code. |
| **How now** | Heuristic from covered path span + confidence; quality bare estimate. |
| **Status** | estimated |
| **Scale path** | Complexity + data-flow proxies; optional sandbox CPU/time when verification tool exists. |

---

## 4. Full target vocabulary (all 46)

Target kinds are first-class packages. **Policy roles:**

- **weighted** — commercial Σ=1 (above)  
- **target** — measured when possible; search facets; not in Σ yet  
- **gate** — fail-closed / blocking hygiene  
- **penalty** — discount modifiers (do not inflate composite)  
- **flag** — descriptive only (never price alone)

### 4.A Structure targets (quantity, policy `target`)

| Kind | What | Why readers care | How now | Scale path |
| --- | --- | --- | --- | --- |
| `dependency-span` | External import surface bound by the pack | Integration risk & reuse cost | Import/require heuristics; staticSignals | Manifest + resolved dep graph |
| `doc-signal` | Comment/doc density supporting the patch | Teachability & reviewability | Comment-line ratio over sources | Docstring AST; README co-coverage |
| `data-flow-depth` | Nesting / async chain depth proxy | Semantic thickness vs flat glue | Brace depth + await/then heuristics | Joern/CodeQL data-flow CPG |
| `symbol-connectivity` | Import/export/call edge density | Coupling & composability | Import/export/call regex edges | Call-graph fan-in/out tools |
| `control-complexity` | Branch/control keyword density | Cognitive load of the slice | if/for/switch/&& heuristics | Cognitive complexity (Sonar/lizard) |
| `config-surface` | Config keys/paths touched | Ops surface area | Config path + key-line heuristics | Structured config parsers |

### 4.B Verification (host-signal until sandbox)

All six are **honest empty** (`insufficient_evidence`) until host staticSignals/context provide scores. They must **never** invent pass rates from confidence.

| Kind | What | Why readers care | How now | Scale path |
| --- | --- | --- | --- | --- |
| `buildability` | Targets that build cleanly | “Does it compile?” | host signal only | Language toolchains in sandbox |
| `test-pass-rate` | Tests pass under harness | Strongest anti-game signal | host signal only | SWE-bench-style apply→test |
| `test-coverage` | Lines/branches exercised | Completeness of verification | host signal only | coverage.py / Istanbul / JaCoCo |
| `test-strength` | Mutants killed | Real tests vs coverage theater | host signal only | PIT / Stryker / mutmut |
| `runtime-cleanliness` | Clean runs (no crash/leak) | Operational safety | host signal only | Sanitizers + sample inputs |
| `reproducibility` | Identical outputs across N runs | Determinism for training/RL | host signal only | Multi-run harness |

**Reader product:** badges (“Verified”, “Runnable”) and search filters when scores exist; absence is **visible**, not silently 0.5.

### 4.C Hygiene (gates & penalties)

| Kind | Policy | What | Why readers / system care | How now | Scale path |
| --- | --- | --- | --- | --- | --- |
| `secret-safety` | **gate** | Live secret-like material in DP sources | Source-safety law; fail closed | Pattern scan (keys, PEM, cloud tokens) | TruffleHog verified + gitleaks |
| `pii-exposure` | **gate** | PII-like material (email/phone/SSN/card) | Compliance & buyer trust | PII pattern scan (not secret patterns) | Dedicated PII scanners |
| `security-cleanliness` | **penalty** | Common risky code patterns | Risk discount without blocking always | Heuristic SAST-like patterns | Semgrep / CodeQL severity weights |
| `dependency-health` | **penalty** | CVE posture of deps | Supply-chain risk | host CVE count or neutral healthy | OSV-Scanner |
| `license-cleanliness` | **gate** | Restrictive license markers | License compatibility | License string heuristics | SPDX + OSV license graph |
| `duplication-internal` | **penalty** | Intra-pack copy-paste | Anti-padding | Repeated substantial lines | jscpd / PMD CPD |
| `dead-code-ratio` | **penalty** | Unreferenced exports | Waste / noise | Export vs reference proxy | Vulture / knip / unused export tools |

**Law:** hygiene can **block or discount**, never inflate commercial Σ.

### 4.D Provenance (host-signal / corpus)

| Kind | Policy | What | Why readers care | How now | Scale path |
| --- | --- | --- | --- | --- | --- |
| `originality` | target | Novelty vs fixed public+admitted corpus | “Is this already free elsewhere?” | host signal | MinHash/LSH + `REFERENCE_CORPUS@v` |
| `semantic-novelty` | target | Embedding distance to nearest corpus neighbor | Non-duplicate knowledge regions | host signal | Code embeddings + ANN |
| `contamination` | target | Overlap with training/benchmark corpora | Training-value honesty | host signal | N-gram + canary sets |
| `authorship-consistency` | target | Single-source stylometric coherence | Homogeneous authorship | host signal | Stylometry on descriptors |
| `provenance-integrity` | target | History/proof chain integrity | Tamper resistance | host signal | Commit-graph / evidence roots |
| `ai-generated-likelihood` | **flag** | Classifier score that material is AI-generated | Disclosure, not price | host signal | AI-code detectors (weight 0) |

**Reference-relative absolute pattern:** novelty/contamination/difficulty become honest only against **Bitcode-pinned** references, not the buyer’s private weights.

### 4.E Semantics targets (quality, non-weighted)

| Kind | What | Why readers care | How now | Scale path |
| --- | --- | --- | --- | --- |
| `coherence` | Internal consistency (split of correctness) | Finer quality facet | confidence estimate | Agent over counts + verification |
| `completeness` | Capability fully realized | “Is the slice whole?” | confidence estimate | Checklist vs descriptor objectives |
| `capability-clarity` | How cleanly capability tags/summarize | Search & browse legibility | estimate | Tagging quality + title/summary discipline |
| `documentation-alignment` | Docs match measured behavior | Trust & teachability | estimate | Doc-signal × behavior proxies |

### 4.F Value / difficulty (host-signal)

| Kind | What | Why readers care | How now | Scale path |
| --- | --- | --- | --- | --- |
| `difficulty` | Hard for pinned frontier | Scarcity of knowledge | host signal | `REFERENCE_FRONTIER@v` solve rate |
| `irreducibility` | Residual after frontier attempt | Not regenerable for free | host signal | Frontier generate → diff |
| `information-content` | Incompressibility / surprise | Information density | host signal | Compression + perplexity |
| `rl-object-completeness` | RL components present | Trainability as RL object | host signal | {task, env, patch, tests, difficulty} |
| `trajectory-richness` | Process artifacts richness | How the knowledge was produced | host signal | Commits/reasoning/log richness |
| `diversity-contribution` | Sparsity of region in code-space | Portfolio diversity for buyers | host signal | Embedding density vs corpus |

**Explicitly excluded:** `learning-gain` — calibration research only; BTD path owns exchange value.

---

## 5. How measurement runs (deposit & read)

```
Implementation synthesizes patch (LLM never invents absolute volumes)
        ↓
Host scopes checkout bodies to covered paths only
        ↓
SourceStaticAnalysisTool → staticSignals (counts)
        ↓
Bare packages measureDataPackWeightedAbsoluteReadings (commercial 11)
  + full registry available for gates/targets
        ↓
Optional quality inference: product AbsolutesMeasureAgent
  (tools registered: measure:absolute:* quantity keys on Try/Retry)
        ↓
Merge law: quantity tool/bare-authoritative; quality agent may refine
        ↓
Validation fail-closed if weighted absolutes missing magnitude+volume
        ↓
Admit → depository_search_documents.absolute_kinds / absolute_volumes
        ↓
Hybrid search: lexical + vector + absolute facet filters & re-rank
```

**Read path:** same host measure for synthesized options; needinesses computed separately for Need-fit.

---

## 6. Depository search & facets

| Surface | Absolute use |
| --- | --- |
| **Index** | `absolute_kinds text[]`, `absolute_volumes jsonb` on `depository_search_documents` |
| **Embed text** | kinds + `kind:volume` pairs (gte-small 384) |
| **Static filters** | kinds OR/AND, min volumes, min composite |
| **Vector RPC** | optional `filter_absolute_kinds`, lifecycle, kind |
| **Hybrid re-rank** | blend lexical/vector with absolute facet score (capped so empty lexical ≠ free win) |
| **Ranking channel** | `measurement` blends evidence presence + absolute composite/coverage |

Code: `depository-search-absolute-facets.ts`, `deposit-depository-asset-pack-search.ts`, migration `20260724120000_depository_search_absolute_facets.sql`.

---

## 7. Reader UX

| Surface | Behavior |
| --- | --- |
| Deposit option cards | Magnitude + unit + volume/weight tiles |
| Exchange activity | Absolute chips via `exchange-measurement-descriptors` (full weighted 11) |
| Marketing | Absolute axes list mirrors weighted commercial kinds |
| Honesty class | Quality volumes labeled estimate; verification absence is not a fake pass |

Descriptors must stay **source-safe** (prose about the pack, never unpaid bodies).

---

## 8. Anti-gaming (short threat model)

| Attack | Mitigation |
| --- | --- |
| Padding LOC / empty functions | Prefer AST counts; pair with verification when available; duplication-internal penalty |
| Fake tests that never assert | `test-strength` (mutation) when sandbox lands; until then `test-surface` is structure-only |
| Invented quality volumes | Merge law + fail-closed Validation; confidence fallbacks are labeled estimated |
| Secret/PII smuggling | Gate kinds fail-closed; Validation/source-safety |
| Duplicate of public code | Originality/contamination vs `REFERENCE_CORPUS@v` |
| Gaming commercial Σ with hygiene | Hygiene is gate/penalty, never weighted rows |

---

## 9. Scaling roadmap (mechanism, not kind inflation)

1. **Now** — structure heuristics + hygiene gates + quality estimates; full package/tool tree.  
2. **P2** — `ExecutionVerificationTool` sandbox → build/test/coverage/mutation.  
3. **P2** — `REFERENCE_CORPUS@v` → originality / semantic-novelty / contamination.  
4. **P3** — `REFERENCE_FRONTIER@v` → difficulty / irreducibility; RL-object completeness.  
5. **Continuous** — AST/LSP for quantity; calibrate weights only with SPEC-gate when changing Σ.

**Rule:** improve **how** a kind is measured before inventing new commercial rows. Catalog-law weight changes go through SPEC.

---

## 10. Package map (grep targets)

| Layer | Path / package |
| --- | --- |
| Specs | `.specifications/BITCODE_SPEC_V48.md` measurement law |
| Design audit | `.docs/ABSOLUTE_MEASUREMENTS.md` |
| This catalogue | `.docs/ABSOLUTE_MEASUREMENTS_CATALOG.md` |
| Kind SSOT | `packages/generic-measurements/domain/data-pack-absolutes-catalog` |
| Bare ×46 | `packages/generic-measurements/absolutes/<kind>` |
| Tools ×46 | `packages/generic-tools/tool-measure-<kind>` |
| Base agent | `packages/generic-agents/agent-measure-absolutes` |
| Product factories | `packages/generic-asset-packs/synthesis` |
| Host | `…/domain/src/agents/validation/agent-measure-absolutes.ts` |
| Search facets | `…/domain/src/depository-search-absolute-facets.ts` |
| Buyer descriptors | `apps/uapi/components/exchange/models/exchange-measurement-descriptors.ts` |

---

## 11. Completeness checklist (46)

**Structure (14):** function-count, type-count, file-span, symbolic-richness, modularity, lang-span, test-surface, api-surface, dependency-span, doc-signal, data-flow-depth, symbol-connectivity, control-complexity, config-surface  

**Verification (6):** buildability, test-pass-rate, test-coverage, test-strength, runtime-cleanliness, reproducibility  

**Hygiene (7):** secret-safety, pii-exposure, security-cleanliness, dependency-health, license-cleanliness, duplication-internal, dead-code-ratio  

**Provenance (6):** originality, semantic-novelty, contamination, authorship-consistency, provenance-integrity, ai-generated-likelihood  

**Semantics (7):** correctness-estimate, objectives-fidelity, computational-usage, coherence, completeness, capability-clarity, documentation-alignment  

**Value (6):** difficulty, irreducibility, information-content, rl-object-completeness, trajectory-richness, diversity-contribution  

**Total: 46.** **Weighted commercial: 11.** **learning-gain: excluded.**

---

*Companion to “Absolute measurements (deposit-first design).” Promote catalog-law changes through `BITCODE_SPEC_*`. Every kind names a real package and a real next mechanism — none require the measurement agent to invent a volume.*
