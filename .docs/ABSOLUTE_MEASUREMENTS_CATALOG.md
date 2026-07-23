# Absolute Measurement Catalog & Mechanisms — Exhaustive Design Companion

**Status:** Design / brainstorm companion for humans and agents. **Not rebuild law.**
This expands `§5 Catalog design (target — deposit-first)` of *Absolute measurements
(deposit-first design)*. If this document and `BITCODE_SPEC_*` diverge, **SPEC wins**.

**What this adds to the existing absolutes doc:** that doc audits and scaffolds what
exists. This one postulates the *exhaustive* measurement space — every absolute we could
take with static analysis, execution, corpus comparison, and grounded inference — names a
real mechanism/tool for each, and marks what is an absolute *now* vs deferred and why.
Written in the existing idiom: `kind · label · unit · propertyClass · weight · magnitude ·
volume · evidence · deterministic fallback · measure owner · source-safety · search facet`.

**Laws honored throughout (from the absolutes doc):**
- *Measurement before price.* Every kind grounds in a measured reading, not a model claim.
- *Models do not invent volumes.* Tools are authoritative for structure, behavior, and
  provenance; agents judge **only grounded quality** over source-safe descriptors + counts.
- *DataPack = patch + measurements + metadata.* The unit of measurement is the patch + its
  source-safe descriptor, never raw source.
- *Deposit needinesses = [].* Read-relative kinds stay out. Boundary noted in §7.
- *Weights sum to 1* over `ASSET_PACK_ABSOLUTES_CATALOG`. §8 gives a rebalanced v-next that sums to 1.
- *Absolutes are supply legibility, not settlement.* `absoluteComposite` ≠ BTD; read-side
  need-fit mints BTD and multiplies against this substrate (§7).

**Snapshot:** 2026-07-23. Companion to the 2026-07-22 absolutes audit.

---

## 1. The comprehension thesis — five lenses

"Understand the code we're given better than anyone" decomposes into five orthogonal
lenses. Value, honesty, and discoverability all scale with how many we measure well.

| Lens | Question it answers | Current coverage | Hardest to game? |
| --- | --- | --- | --- |
| **1. Structure** | *How much, and how arranged?* | Strong — the 5 quantity kinds | No (counts are gameable) |
| **2. Behavior** | *Does it actually work?* | **Absent** | **Yes — execution is ground truth** |
| **3. Provenance / Novelty** | *Is it real, original, not-already-public?* | **Absent** | **Yes — fingerprints vs corpus** |
| **4. Semantics** | *What does it do, how well?* | Partial — 3 grounded quality kinds | No (agent judgment) |
| **5. Value / Difficulty** | *How much knowledge, how rare, how teachable?* | **Absent** | Mostly (reference-relative) |

The current catalog covers ~1.5 of 5 lenses (all of Structure, part of Semantics). **The
prize is Behavior + Provenance + Value** — the three absent lenses are simultaneously the
highest-value *and* the hardest-to-game, which is exactly the combination Bitcode's moat
needs. This document is organized so those three become first-class.

---

## 2. The absolute / relative law — what qualifies as an absolute

A reading is an **absolute** (belongs in `ASSET_PACK_ABSOLUTES_CATALOG`, computed at
deposit, carried on every DataPack) iff it is:

1. **Buyer-independent** — no stated Need required to compute it.
2. **Deterministic given fixed references** — same patch + same reference artifacts →
   same reading (modulo declared agent-quality tolerance).
3. **Source-safe** — computable from, and emitting, only source-safe outputs (counts,
   scores, hashes/fingerprints), never raw source.

Everything else is **read-side** (needinesses) and stays out of deposit (§7).

### 2.1 The "reference-relative absolute" pattern (the key unlock)

Three high-value lenses — novelty, contamination, difficulty — look buyer-relative at first
glance but become **absolutes** the moment they are measured against a **fixed,
Bitcode-controlled reference**, not against a buyer:

| Signal | Naïvely relative to… | Becomes absolute when measured against a fixed… |
| --- | --- | --- |
| Novelty / originality | "what's already out there" | **reference corpus index** (public code + admitted packs), versioned |
| Contamination | "what models already saw" | **reference training-corpus / benchmark set**, versioned |
| Difficulty / irreducibility | "what a model can already do" | **reference frontier model**, pinned by version |

Pin the references as versioned constants (e.g. `REFERENCE_CORPUS@v1`,
`REFERENCE_FRONTIER@v1`) and record the version in each reading's evidence root. Re-measure
on reference bumps. This makes novelty/difficulty **honest, reproducible absolutes** rather
than free-form judgments — and it's the mechanism that lets us measure "knowledge the
frontier doesn't already have" at deposit time.

### 2.2 What stays read-side (needinesses, not absolutes)

Buyer/model-relative by nature: `need-fit`, `language-fit`, coverage of a stated Need,
submodular marginal fit given what a buyer already holds, constraint satisfaction, and
**model-novelty vs the buyer's own model** (membership-inference against *their* weights).
These draw on absolutes but are computed at read. Boundary preserved.

---

## 3. propertyClass — extend the grounding, keep the law

Today `propertyClass ∈ {quantity, quality}`. That binary conflates *grounding* (tool vs
agent) with *lens*. Two new tool-authoritative classes make the honesty story explicit and
give finer weight governance:

| propertyClass | Grounding | Authority | Examples | Gameability |
| --- | --- | --- | --- | --- |
| `quantity` | tool | deterministic counts | function-count, api-surface | medium |
| **`verification`** *(new)* | tool (sandbox) | deterministic pass/score | test-pass-rate, mutation-strength, buildability | **very low** |
| **`provenance`** *(new)* | tool (corpus/index) | deterministic vs fixed refs | originality, contamination | **very low** |
| `quality` | agent (PTRR) | grounded judgment + fallback | coherence, completeness | high |

**Recommended posture:** tool-authoritative classes (`quantity` + `verification` +
`provenance`) hold **≥ 0.65** of weight; `quality` **≤ 0.35**. This strengthens the
existing law — *models do not invent volumes* — into: **agents may only move the ≤0.35 they
are grounded to judge; everything structural, behavioral, and provenance-bearing is
tool-owned.** (If you prefer to avoid new enum values now, keep `quantity`/`quality` and add
a `grounding: tool|agent` + `dimension` tag per row; see Decision Q6.)

---

## 4. The exhaustive catalog

Each family lists a **menu table** (every kind we could take, with mechanism and posture)
then **detailed field tables** for the headline / novel kinds in the existing doc's format.
Legend — **Now**: implementable deposit-side today · **Exec**: needs the sandbox tool
(§5.2) · **Corpus**: needs the reference index (§5.3) · **Defer**: read-side or research.

### 4.A Structure (extend `quantity`) — tool: tree-sitter / lizard / radon / AST-LSP / Joern

Existing kinds (`function-count`, `type-count`, `file-span`, `symbolic-richness`,
`modularity`) stay. Candidate additions, richest-first:

| Kind | Magnitude (count of…) | Volume | Tool | Anti-game | Status |
| --- | --- | --- | --- | --- | --- |
| `api-surface` | exported/public entrypoints | `/16` | AST/LSP export scan | med (padding) | Now |
| `test-surface` | test fns + assertions/proof ops | `/30` | tree-sitter + path heuristics | med | Now |
| `lang-span` | distinct languages in covered set | `/4` | ext/path (already in report) | high | Now |
| `dependency-span` | external deps bound by patch | `/20` | manifest + import graph | high | Now |
| `doc-signal` | doc/comment density supporting patch | ratio | static scan | med | Now |
| `data-flow-depth` | def-use / dataflow path depth | `/24` | **Joern CPG** | **high** (semantic, not textual) | Now |
| `symbol-connectivity` | call-graph fan-in+fan-out (coupling) | `/32` | Joern CPG | high | Now |
| `control-complexity` | cognitive complexity (not cyclomatic) | `/60` | SonarSource/lizard | low–med (cap weight) | Now |
| `config-surface` | config keys touched (`configKeyCount`) | `/24` | static scan | med | Now |

**Design rule (from the audit):** don't add > ~3 quantity kinds without demoting weaker
ones. Recommended first three: **`lang-span` + `test-surface` + `api-surface`** (facet
value + capability legibility), then `data-flow-depth` as the first *semantic* structure
signal (much harder to game than LOC/counts). Prefer **cognitive** complexity over
cyclomatic; prefer **Joern data-flow** over raw token counts wherever the host can afford it.

### 4.B Behavior / Verification (new `verification`) — tool: `ExecutionVerificationTool` (sandbox)

The biggest unlock and the strongest anti-gaming lens: you cannot fake a passing test suite.
Runs in an isolated container over raw source; **emits only scores** (source-safe). Gated by
a runnability tier — if the pack isn't runnable in isolation, these degrade to deterministic
fallbacks and Structure carries more weight for that pack.

| Kind | Magnitude | Volume | Mechanism | Status |
| --- | --- | --- | --- | --- |
| `buildability` | targets built / total | ratio | language toolchain in sandbox | Exec |
| `test-pass-rate` | FAIL→PASS flipped + PASS→PASS held | ratio | **SWE-bench-style apply→test harness** | Exec |
| `test-coverage` | lines/branches exercised | ratio | coverage.py / JaCoCo / Istanbul / llvm-cov | Exec |
| `test-strength` | mutants killed / injected | ratio | **mutation testing** (PIT / Stryker / mutmut / Cosmic Ray) | Exec |
| `runtime-cleanliness` | clean runs (no crash/leak/sanitizer hit) / total | ratio | sanitizers, sample inputs | Exec |
| `reproducibility` | identical outputs across N runs | ratio | re-run determinism check | Exec |

#### `test-pass-rate`
| Field | Value |
| --- | --- |
| Label | Verified pass rate |
| Unit | `ratio` · propertyClass `verification` |
| Weight | **0.14** (proposed) |
| Magnitude | bundled tests that pass under the harness (FAIL_TO_PASS flipped, PASS_TO_PASS held) |
| Volume | `passed / total` (0 if unrunnable) |
| Measure owner | `ExecutionVerificationTool` (host, sandboxed) |
| Evidence | container digest + test IDs + pass/fail vector; **scores only leave the sandbox** |
| Deterministic fallback | `0` with `runnable:false` flag (NOT confidence-derived — absence of proof is not proof) |
| Source-safety | source stays in the container; only counts/IDs emitted |
| Anti-game | **very high** — requires genuinely working code |
| Deposit UI / search | "Verified" badge; facet: `verified-only` |

#### `test-strength` (mutation score)
| Field | Value |
| --- | --- |
| Label | Test strength |
| Unit | `ratio` · propertyClass `verification` |
| Weight | 0.06 (proposed) |
| Magnitude | injected mutants killed by the pack's own tests |
| Volume | `killed / injected` (sample mutants to bound cost) |
| Measure owner | `ExecutionVerificationTool` → PIT/Stryker/mutmut |
| Evidence | mutant operator set + kill matrix digest |
| Deterministic fallback | `0` with `measured:false`; only meaningful when tests exist |
| Anti-game | **very high** — distinguishes real tests from coverage-theater (tests that execute but don't assert) |
| Note | Expensive (≈ one run per mutant) → tiered: only for packs above a candidate-value threshold |

**Upgrade move (novel, §7):** when a pack ships **without** tests, the host can *generate*
them (EvoSuite / Pynguin / CodaMosa), oracle-validate against observed behavior, and
promote an unverified pack into a **verifiable RL object** — raising its measured value.
Measurement becomes *synthesis*, not just scoring.

### 4.C Hygiene & Safety — tool: `SecurityHygieneTool` (Semgrep/CodeQL · gitleaks/TruffleHog · OSV · Vulture · jscpd)

Mostly **gates and penalties**, not additive value — these belong to fail-closed Validation
and to the source-safety law, not to positive weight (keeps them out of "commercial rows"
confusion). Two of them (`secret-safety`, `pii-exposure`) *operationalize* the audit's
`source-safety-confidence` candidate as **tool-checkable**, not agent-asserted.

| Kind | Signal | Role | Mechanism |
| --- | --- | --- | --- |
| `secret-safety` | verified live secrets present | **hard gate** (fail-closed) | **TruffleHog verified** + gitleaks |
| `pii-exposure` | PII / sensitive data present | hard gate | PII scanners |
| `security-cleanliness` | SAST findings, severity-weighted | penalty modifier | Semgrep Pro / CodeQL / Infer / Bandit |
| `dependency-health` | dep CVEs, severity-weighted | penalty modifier | OSV-Scanner |
| `license-cleanliness` | dep license compatibility | gate/flag | OSV + license scan |
| `duplication-internal` | intra-pack copy-paste | **anti-padding penalty** | jscpd / PMD CPD |
| `dead-code-ratio` | unreachable/unused fraction | penalty | Vulture |

**Recommendation:** represent hygiene as **multiplicative modifiers / validation gates**,
not weighted catalog rows, so `Σ weights = 1` stays clean and hygiene can only *discount* or
*block*, never inflate. `secret-safety` and `pii-exposure` are **blocking** by the
source-safety law.

#### `secret-safety` (grounds `source-safety-confidence`)
| Field | Value |
| --- | --- |
| Label | Source-safety (secrets) |
| Unit | `gate` |
| Magnitude | count of **verified** live credentials + PII hits |
| Volume | `1` if zero, else `0` → **fail-closed** |
| Measure owner | `SecurityHygieneTool` (host) |
| Evidence | detector IDs + locations (redacted); **never the secret value** |
| Anti-game | high — verified (not pattern-guessed) secrets; blocks deposit |
| Why | the obfuscation/source-safety law needs a *tool* check, not an agent's word |

### 4.D Provenance & Novelty (new `provenance`) — tool: `CorpusProvenanceTool` + `REFERENCE_CORPUS@v`

Deterministic against a fixed, versioned index of public code (e.g. a Stack-style corpus)
plus already-admitted packs. **Emits fingerprints/similarities, never matched source.** This
is how we answer "is this actually new, or already public / already sold / padded."

| Kind | Magnitude | Volume | Mechanism | Status |
| --- | --- | --- | --- | --- |
| `originality` | `1 − max containment vs corpus` | 0..1 | **MinHash/LSH + winnowing (MOSS)** | Corpus |
| `semantic-novelty` | embedding distance to nearest corpus neighbor | 0..1 | code embeddings + ANN; **SemDeDup** | Corpus |
| `contamination` | `1 − known-corpus/benchmark overlap` | 0..1 | n-gram/substring overlap + canary grep | Corpus |
| `authorship-consistency` | single-source stylometric coherence | 0..1 | stylometry over descriptors | Now |
| `provenance-integrity` | git-history authenticity (if provided) | 0..1 | commit-graph checks | Now |
| `ai-generated-likelihood` | classifier score | **descriptor only, weight 0** | AI-code detectors | Flag |

#### `originality` (corpus novelty)
| Field | Value |
| --- | --- |
| Label | Originality |
| Unit | `ratio` · propertyClass `provenance` |
| Weight | **0.10** (proposed) |
| Magnitude | `1 − max(Jaccard/containment)` vs `REFERENCE_CORPUS@v` and admitted packs |
| Volume | the magnitude directly (already 0..1) |
| Measure owner | `CorpusProvenanceTool` |
| Evidence | MinHash signature + nearest-neighbor id + corpus version; **no source echoed** |
| Deterministic fallback | conservative `0.5` with `corpus:unavailable` flag |
| Anti-game | **very high** — survives renaming/reformatting; catches "scraped & re-deposited" |
| Search / UI | facet: `original-only`; "not already public" badge |

> **Caveat carried from research:** `ai-generated-likelihood` detectors are unreliable
> (defeated by light edits, cross-model brittle). Keep it a **descriptor, never a gate or a
> weighted kind** — do not let payment depend on it.

### 4.E Semantics (refine `quality`) — MeasureAgent (PTRR) over source-safe descriptor + counts

Keep the grounded-quality discipline; sharpen the kinds. Split the overloaded
`correctness-estimate`; ground `computational-usage` in real complexity proxies instead of
free judgment.

| Kind | Replaces / adds | Grounding constraint |
| --- | --- | --- |
| `coherence` | half of `correctness-estimate` | internal consistency of the synthesized knowledge |
| `completeness` | half of `correctness-estimate` | does it fully realize the described capability |
| `objectives-fidelity` | keep | honors obfuscations/exclusions; needs objectives in descriptor |
| `capability-clarity` | new | how cleanly the capability summarizes/tags (legibility proxy) |
| `documentation-alignment` | new | do docs/comments match measured behavior |
| `computational-usage` | **demote or ground** | blend of complexity/dataflow proxies, not raw guess |

**Grounding law:** every quality reading must cite the measured counts / verification
scores it rests on (evidence root), carry a deterministic fallback, and never move a volume
a tool already owns. Prefer **self-consistency** (ensemble the PTRR judgment, take median)
over single-shot.

### 4.F Value, Difficulty & Information (mixed) — reference-relative absolutes + calibration anchor

The "knowledge volume" core, and the most novel. Intrinsic properties of the code
(buyer-independent) → legitimately absolute; the frontier-relative ones use
`REFERENCE_FRONTIER@v` (§2.1). These inform value; they are **not** BTD (read-side).

| Kind | Magnitude | Volume | Mechanism | Status |
| --- | --- | --- | --- | --- |
| `difficulty` | `1 − reference-frontier solve rate` on the task | 0..1 | pinned frontier model attempts the task; harness scores | Exec+Corpus |
| `irreducibility` | edit-distance between frontier zero-shot attempt and the real patch | 0..1 | frontier generate → diff | Exec+Corpus |
| `information-content` | incompressibility / coherent surprise | 0..1 | compression ratio; coherent-perplexity vs `REFERENCE_FRONTIER` | Corpus |
| `rl-object-completeness` | # present of {task stmt, env, patch, passing test, difficulty} | `/5` | assembled from B + descriptor | Exec |
| `trajectory-richness` | process artifacts (commits/reasoning/intermediate states) present | `/N` | deposit descriptor scan | Now |
| `diversity-contribution` | sparsity of the region of code-space it fills | 0..1 | embedding density vs corpus | Corpus |
| `learning-gain` | measured downstream-eval delta from training on it | — | **DsDm-lite / TRAK** — *calibration only, not a per-deposit row* | Defer/offline |

#### `rl-object-completeness` (the SWE-bench-lineage kind)
| Field | Value |
| --- | --- |
| Label | RL-object completeness |
| Unit | `components` · propertyClass `verification` |
| Weight | 0.05 (proposed) |
| Magnitude | how many of {task statement, runnable env, patch, passing test, difficulty label} the pack carries |
| Volume | `magnitude / 5` |
| Measure owner | host (composes Family B outputs + descriptor) |
| Why it matters | a complete verifiable RL object is the highest-value training artifact; this measures — and, with the §7 upgrade move, *drives* — how close a pack is to one |

#### `difficulty` (frontier-gap)
| Field | Value |
| --- | --- |
| Label | Difficulty |
| Unit | `ratio` · propertyClass `verification` |
| Magnitude | `1 − pass rate of REFERENCE_FRONTIER@v` attempting the task under the harness |
| Volume | the magnitude (0..1); high = current models fail it = worth most |
| Measure owner | `ExecutionVerificationTool` + pinned reference model |
| Evidence | reference-model version + attempt transcripts digest (source-safe) |
| Deterministic fallback | complexity-proxy estimate with `estimated:true` |
| Anti-game | high — grounded in real solve/fail, not self-claim |

**`learning-gain` is the ground truth that makes the whole catalog honest.** You cannot put
it on every deposit (it needs training runs), but you can **calibrate the catalog's weights
against it periodically**: train a small reference model with vs. without a candidate slice,
measure the downstream-eval delta (DsDm-lite; TRAK for attribution), and refit weights so
the cheap composite predicts realized gain. This closes the loop between "what we measure"
and "what actually makes models better" — and it compounds as a moat (§5.4).

> **Research caveat carried forward:** "looks high-quality" ≠ valuable. Data-selection work
> (DsDm) shows textual-similarity/quality-classifier selection can *underperform random*.
> So never let agent-quality or perplexity alone stand in for value — anchor value in
> **verified-correct + corpus-novel + non-trivial-difficulty**, calibrated to `learning-gain`.

---

## 5. Mechanisms, loops, prompts

### 5.1 Tool layer (addresses the audit's "tools off the agent" gap)

Four host-side, source-safe tools. Quantity/verification/provenance stay
**tool-authoritative on merge** even when the MeasureAgent may *query* them mid-PTRR for
quality grounding.

| Tool | Emits (source-safe) | Backs families |
| --- | --- | --- |
| `SourceStaticAnalysisTool` *(exists)* | counts, complexity, symbol/graph metrics | A |
| `ExecutionVerificationTool` *(new)* | build/test/mutation/runtime scores | B, F |
| `SecurityHygieneTool` *(new)* | findings counts, severities, verified-secret flags | C |
| `CorpusProvenanceTool` *(new)* | fingerprints, similarities, corpus/ref versions | D, F |

All four: raw source enters the tool (sandbox/index), **only measurements leave**. Register
on the active Execution; pass Execution into `measureAssetPackAbsolutes` so tools + quality
inference share root stores (matches the audit's §6.1 direction).

### 5.2 The measurement pipeline (deposit)

```
Discovery  comprehend-codebase → checkout-wide absolutes → discovery:sourceMeasurements
   │            (document the store shape in code + tests — audit gap #5)
Implementation  patch plan + patchfile → host measures pack:
   │   ├─ SourceStaticAnalysisTool      (A, always)
   │   ├─ ExecutionVerificationTool     (B, F — if runnable; else fallback + runnable:false)
   │   ├─ SecurityHygieneTool           (C — gates/penalties)
   │   ├─ CorpusProvenanceTool          (D, F — vs REFERENCE_CORPUS@v)
   │   └─ MeasureAgent (PTRR)           (E — grounded quality, ≤0.35 weight)
   │   → mergeReportAndReadings (tool-authoritative for quantity/verification/provenance)
Validation  ready-to-finish: fail-closed if absolutes empty OR secret/PII gate tripped
Finish  store selection envelope with measured options (source-safe only)
```

### 5.3 Reference artifacts (new, versioned constants)

`REFERENCE_CORPUS@v` (public-code index + admitted packs, for `provenance`), 
`REFERENCE_TRAINING_SETS@v` (for `contamination`), `REFERENCE_FRONTIER@v` (pinned model, for
`difficulty`/`irreducibility`/`information-content`). Version recorded in every dependent
reading's evidence root; reference bump ⇒ scheduled re-measure. These references are
themselves a compounding moat asset.

### 5.4 Loops

1. **Verification loop** — apply patch → run harness → (optional) generate+validate tests →
   score. Deterministic; cached by patch digest.
2. **Quality self-consistency** — ensemble PTRR judgments; take median; record variance as
   confidence. Never single-shot for a weighted quality kind.
3. **Tiered measurement** — cheap static/provenance on *every* pack; expensive
   execution/mutation/frontier-difficulty **gated** on a candidate-value threshold (static +
   originality). Bounds cost without blinding the market.
4. **Calibration loop (DsDm-lite)** — periodically refit catalog weights against measured
   `learning-gain` / realized sale outcomes. The measurement engine *learns which signals
   predict value* — the honesty flywheel and the moat.
5. **Adversarial / anti-gaming loop** — actively probe for padding, duplication, synthetic
   inflation, contamination-farming; discount or gate (see §6).

### 5.5 Prompts & proof (addresses the audit's "prompt identity" gap)

Replace inline PTRR strings with **named PromptParts** through `@bitcode/prompts`, one per
measure step and one rubric per quality kind:

```
promptpart_generic_agent_measure_identity
promptpart_generic_agent_measure_requirements
promptpart_generic_agent_measure_ptrr_{perceive|think|reason|repair}
promptpart_absolutes_quality_{coherence|completeness|objectives_fidelity|capability_clarity}
```

Each measurement records, per the SPEC prompt rule: context class · source boundary ·
prompt-template identity + **digest** · typed (Zod) schema · parsed result · **proof root** ·
telemetry receipt · repair posture. This makes measurement prompts greppable and
proof-bindable (parity row) without inventing a third registry — reuse tool + prompt
registries only.

### 5.6 Golden fixtures (honesty regression)

Curate known small repos → **expected magnitude/volume bands** per kind. Run in CI as
regression + honesty tests. Publish `measuredFromSamples` / `coverageRatio` /
`runnable` / `corpus` flags into the descriptor so UI can show **measured vs estimated**
(audit §8.3) — never present a fallback as a measurement.

---

## 6. Anti-gaming & honesty (threat model)

| Attack | Defended by |
| --- | --- |
| Pad LOC / split functions to inflate counts | cap quantity weight; `duplication-internal` penalty; weight `data-flow-depth` (semantic) over token counts |
| Ship copied/scraped code as "new" | `originality` (MinHash/winnowing vs corpus) — very hard to game |
| Re-deposit already-public or already-sold code | `originality` + admitted-pack index; `contamination` |
| Tests that execute but don't assert (coverage theater) | `test-strength` (mutation score) — kills coverage-only gaming |
| Fake "it works" | `test-pass-rate` under hidden/held harness — requires real behavior |
| Leak secrets/PII (violate source-safety) | `secret-safety` / `pii-exposure` **fail-closed gates** (verified detectors) |
| Prompt-inject the quality agent | quality capped ≤0.35; tool-authoritative merge; grounded evidence roots |
| Contamination-farming (deposit known benchmark data) | `contamination` vs `REFERENCE_TRAINING_SETS@v` + canary grep |

**Backbone:** verification + provenance are the two hardest-to-game lenses, so the weight
posture (§3) and the calibration loop (§5.4) deliberately push value onto them. The existing
law "models do not invent volumes" is itself an anti-gaming rule; §3 extends it to cover
behavior and provenance, not just counts.

---

## 7. Ideas you may not have listed (novel, high-leverage)

1. **Verified correctness as a first-class absolute.** Execution pass/fail on
   held/generated tests is the single strongest, hardest-to-game signal — and it's exactly
   the "measured patch = verifiable RL object" thesis made into a number. Absent today; §4.B.
2. **Mutation-tested test-strength.** Measure whether bundled tests *actually* verify
   behavior, not just execute it. Kills the biggest gaming vector in code-quality data.
3. **Corpus-originality gate.** Fingerprint every deposit against a reference corpus +
   already-admitted packs. "Is this genuinely new?" becomes a cheap, rename-proof number.
4. **Contamination / frontier-known discount.** Code already in public training sets has
   near-zero marginal training value. Measuring "already-known-to-models" protects buyers and
   prices novelty correctly — a differentiator no labor marketplace can offer.
5. **Difficulty via frontier-gap, and `irreducibility` (cost-to-reproduce).** If a pinned
   reference model reproduces it zero-shot, it's low-value; if it took real experimentation,
   high. Directly measures "knowledge the frontier lacks."
6. **`rl-object-completeness` + the upgrade move.** Measure how close a pack is to a complete
   verifiable RL object — then, when tests/task-statement are missing, **generate and
   oracle-validate them** to *raise* the pack into one. Measurement that increases value, not
   just scores it.
7. **`learning-gain` calibration (DsDm-lite / TRAK).** The ground truth. Can't run per
   deposit, but calibrating catalog weights against realized training-gain makes every cheap
   measurement honest — and compounds into a moat as outcomes accrue.
8. **The reference-relative-absolute pattern (§2.1).** Pinning corpus + frontier as
   versioned constants converts "novelty/difficulty" from squishy judgment into reproducible
   absolutes — arguably the single most important design decision in this document.
9. **Absolutes as first-class search facets.** Verified-only, original-only, min-difficulty,
   lang-span, capability-slice fingerprints — turn measurements into discoverability
   (addresses audit §8.1) so richer measurement directly grows the read market.

**Boundary reminder:** all of the above are deposit-side **absolutes** (or offline
calibration). Read-side `needinesses` (need-fit, coverage, submodular marginal value,
model-novelty vs the *buyer's* model) remain out of scope and empty at deposit — the richer
the absolutes here, the sharper read-side fit and BTD become.

---

## 8. Recommended v-next catalog (Σ weights = 1) + phasing

Positive-value kinds only (hygiene = gates/modifiers, §4.C, not rows). Illustrative weights
for discussion with product — rebalance only with rationale, per the audit's law.

| Kind | propertyClass | Weight | Phase |
| --- | --- | --- | --- |
| function-count | quantity | 0.05 | now (demoted) |
| symbolic-richness | quantity | 0.05 | now (demoted) |
| type-count | quantity | 0.04 | now |
| api-surface | quantity | 0.04 | P1 |
| test-surface | quantity | 0.03 | P1 |
| data-flow-depth | quantity | 0.04 | P2 |
| lang-span | quantity | 0.02 | P1 |
| file-span + modularity | quantity | 0.02 | now (demoted) |
| **test-pass-rate** | verification | **0.14** | **P2 (sandbox)** |
| **test-strength** | verification | **0.06** | P3 |
| buildability | verification | 0.04 | P2 |
| rl-object-completeness | verification | 0.05 | P3 |
| difficulty | verification | 0.05 | P3 |
| **originality** | provenance | **0.10** | **P2 (corpus)** |
| contamination | provenance | 0.03 | P3 |
| coherence | quality | 0.08 | now (split) |
| completeness | quality | 0.07 | now (split) |
| objectives-fidelity | quality | 0.06 | now |
| capability-clarity | quality | 0.03 | P1 |
| **Σ** | | **1.00** | |

Tool-authoritative (quantity 0.29 + verification 0.34 + provenance 0.13) = **0.76**; quality
= **0.24** — satisfies the ≥0.65 posture, and verification is the single largest class. Hygiene (`secret-safety`, `pii-exposure` blocking;
`security-cleanliness`, `dependency-health`, `duplication-internal` as multiplicative
discounts) sits outside the sum.

**Phasing** (maps to the audit's backlog §10): **P1** static/agent-only kinds shippable now
(api/test/lang surface, quality split) — no new infra. **P2** stand up
`ExecutionVerificationTool` + `REFERENCE_CORPUS` → `test-pass-rate`, `buildability`,
`originality` (the value inflection). **P3** mutation, difficulty, rl-object-completeness,
contamination + the calibration loop. Catalog-law changes go through the **SPEC gate**;
tool/prompt hygiene can be impl-only (audit Q5).

---

## 9. Open questions (extends the audit's §9)

| ID | Question | Lean |
| --- | --- | --- |
| Q6 | Add `verification` + `provenance` propertyClasses, or keep `quantity/quality` + `grounding` tag? | **Add classes** — distinct weight governance + honesty story |
| Q7 | Build `ExecutionVerificationTool` next? | **Yes — highest value/§8 inflection**; gate by runnability tier |
| Q8 | Stand up `REFERENCE_CORPUS@v` (which corpus, refresh cadence)? | Yes; version-pin; scheduled re-measure |
| Q9 | Pin a `REFERENCE_FRONTIER@v` for difficulty/irreducibility? | Yes; a fixed, disclosed model constant |
| Q10 | Hygiene as gates/modifiers vs weighted rows? | **Gates/modifiers** — keeps Σ=1 clean, can't inflate |
| Q11 | Calibrate weights against `learning-gain` (DsDm-lite)? cadence? | Yes; start once `ExecutionVerificationTool` lands |
| Q12 | Auto-generate+validate tests to upgrade packs to RL objects? | Prototype behind a flag; measure honesty via mutation score |

---

*Design/brainstorm companion to “Absolute measurements (deposit-first design).” Not rebuild
law — promote any catalog-law change through the `BITCODE_SPEC_*` gate. Every proposed kind
names a real, current mechanism; none require the measurement agent to invent a volume.*
