# Bitcode Spec V48 Notes

## Status

- Version: `V48`
- Canonical pointer on `main`: `BITCODE_SPEC.txt` -> `V47` until V48 promotion
- Draft family anchor: `BITCODE_SPEC_V48.md` (single-canon rebuild authority for the full stack through Gate 3)
- Draft generated proof appendix: `BITCODE_SPEC_V48_PROVEN.md`
- Current canonical/latest target: `V47`
- Prior canonical anchor: `BITCODE_SPEC_V47.md`
- Prior generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`
- V48 state: draft full-stack single-canon family open; Gate 3 synthesis pipeline correctness closing
- Generated structured artifact inventory: draft V48 family (`.bitcode/v48-spec-family-report.json`, `.bitcode/v48-canonical-input-report.json`, `.bitcode/v48-canon-posture-drift-report.json` when regenerated), Gate 3 depositing parity evidence, and `BITCODE_SPEC_V48_PROVEN.md`
- Source parity state: V48 Gate 1–3 identity, deposit SDIVF synthesis, telemetry, demand honesty, organization/wallet authority, and commercial website surfaces are specified for rebuild from `BITCODE_SPEC_V48.md`; this notes companion records architecture decisions and the depositing parity matrix
- Scope: V48 full-system draft notes companion for Complete Implementation Derivability through Gate 3
- QA findings ledger: `BITCODE_V48_QA.md`
- Spec companion: `BITCODE_SPEC_V48.md`
- Delta companion: `BITCODE_SPEC_V48_DELTA.md`
- Parity companion: `BITCODE_SPEC_V48_PARITY_MATRIX.md`

## Notes companion rule

These notes accompany the V48 draft specification family. They are not stronger
than `BITCODE_SPEC_V48.md`. Binding rebuild law for the entire Bitcode stack
through Gate 3 lives in the single SPEC file. Notes record architecture
decisions, Gate 3 SDIVF details, the depositing parity matrix, and QA-driven
intent. Do not treat superseded version files as live V48 product law when
implementing V48 gates.

## Concise current-system reading

V48 is the full-stack draft target: wallet/GitHub identity, `/deposits`
SynthesizeAssetPacks SDIVF (maxIterations 1, grok-build-0.1 default, settled
demand honesty), `/reads` reading contracts retained for later gates, `/packs`
activity master-detail, Auxillaries, source-safe telemetry, and testnet-only
value semantics. Gate 3 closes synthesis pipeline algorithmic + telemetric
correctness and deposit full-stack option stats (roots, positive ROI,
admission, required denials).

## Simplified-spec reading rule

If a surface does not help a depositor synthesize measured AssetPack options,
review them source-safely, admit them, track authority/earnings honestly, or
help a reader later settle Need-fit AssetPacks, it is out of Gate 3 scope.
Unestimatable demand must say Unestimatable — never invent demand percentages.

## Deferred from V47

V47 promoted commercial website testnet launch readiness. It launch-froze
`/deposit`, `/read`, `/packs`, and Auxillaries, made measurement law and the
IP seller/buyer state machines exact, completed the depositor and reader
websites, the packs/Auxillaries commercial dashboard, browser-proven E2E IP
selling and buying, landing/public launch messaging, the staging-testnet
deployment rehearsal, and promotion readiness — all over the preserved
Bitcoin/BTC settlement language, BTD scalar-volume and rights language,
GitHub delivery boundaries, compute constraints, storage boundaries, and
build/process validation carried from the promoted V46 comprehension canon.

V48 begins from the remaining question: what does the first live commercial
(testnet) experience still need before real users can walk every core step
without friction. The opening posture is intentionally experiential: run the
deployed staging-testnet system end to end, step by step, and fix what breaks.

## Candidate V48 workstreams

- Environment preparation: staging Supabase database readiness, wallet-fauceted
  testnet BTC, local telemetry expectations, and a step-by-step debugging
  experience that validates each core user step.
- Identity and authentication: sign up/in, and Auxillaries readiness for
  connecting GitHub, wallet(s), and other external surfaces.
- Depositing: connecting knowledge, requesting AssetPack syntheses to review,
  reviewing, and depositing.
- Reading: connecting knowledge, requesting a Read, reviewing the synthesized
  Need, reviewing potential Fits, and buying Fit(s).
- Ledgerized journaling: replayability, auditability, `/packs` page UX/UI, and
  the personal (Auxillaries) history of work.

## V48 Gate 1 in progress: identity and authentication interactive QA

Gate 1 exercises the live commercial testnet experience exactly as the
notes-only rule directs: interactively, recording accepted findings in
`BITCODE_V48_QA.md` (F1-F10 so far), and landing fail-closed repairs on the
gate branch. The full draft family is authored at Gate 1 closure from this
QA-driven specification intent.

Accepted findings converted to repairs so far:

- Supabase `redirect_to` law: GoTrue validates the Auth redirect allow-list by
  exact string match, so `redirect_to` must stay query-free. The post-auth
  destination travels through origin-local storage
  (`uapi/lib/supabase-auth-redirect.ts`) and is consumed once by the callback.
  This repaired wallet sign-in from both localhost and production www, which
  previously stranded the PKCE verifier and never minted a session.
- Identity-derived wallet binding: the canonical wallet sign-up signs on the
  OAuth provider authorize page, so nothing is staged client-side to replay.
  `/api/wallet/authenticate` now derives the binding server-side from the
  session's GoTrue-verified `custom:bitcode-bitcoin` identity
  (`source: 'oauth-identity'`), and `WalletSessionPersistenceBridge` triggers
  it whenever a wallet-backed session has no replayable local proof.
- Post-auth landing is `/packs`, not the legacy `/terminal` overlay route.

Specification intent surfaced for the eventual V48 family (decisions, not yet
law): eradicate legacy email/phone authentication residue (`/login`,
`LoginForm`, PhoneSSO) and the legacy `/terminal` route after verifying its
capabilities ported to `/packs`, `/read`, and `/deposit`; decide the
solo-operator organization-authority posture (personal-organization bootstrap
at wallet sign-up versus a neutral unconfigured state); complete the GitHub
App sessionless install staging path, whose pending-installation cookie
currently has no consumer.

## V48 Gate 2 in progress: depositing interactive QA and the AssetPacksSynthesis refactor

Gate 2 (branch `v48/gate-2-depositing-interactive-qa`) is explicitly the
significant-refactoring gate and a critical gate for the commercial viability
of Bitcode: interactive depositing QA exposed that deposit AssetPack option
"synthesis" was deterministic blueprint scaffolding (`BITCODE_V48_QA.md`
F12), and the accepted repair is architectural, not cosmetic. Gate 2's
charter (Garrett, 2026-06-12): consolidate Bitcode's pipelines into the
single AssetPacksSynthesis pipeline (plural Packs — one run can create
multiple packs), clean all legacy terminal code, and correct the incomplete
pipeline-execution actualities (real data, the Vercel sandbox actually
running pipelines, real accounting) so V48 QA reaches real demonstrability
of information commoditization — the ability to exchange knowledge,
fundamentally unlocked by measurement. The implementation builds maturely on
the existing strong primitives (prompts, registries, executions) and
generics (agents, pipelines) rather than inventing parallel machinery.

Accepted V48 architecture law (decided 2026-06-12):

- Bitcode has a single synthesis/measurement pipeline: **AssetPacksSynthesis**
  (`packages/pipelines/asset-pack/src/asset-packs-synthesis.ts`). Depositing
  and Reading are the same operation at the core — measuring source knowledge
  into commercially legible AssetPack candidates — with variance carried
  entirely by the lens: steering prompts (depositor instructions versus read
  Need), the available measurement catalog (deposit: source-coverage /
  demand-alignment / reuse-likelihood; read adds need-fit), and candidate
  framing. Measurement is the heart of Bitcode's commodification capability,
  so it is centralized in this one pipeline; lens adapters translate
  lens-specific contracts to and from the core. The deposit lens shipped in
  Gate 2; the reading lens migrates onto the core when Track 3 opens.
- Deposit option synthesis is real: `POST /api/deposit/synthesize-options`
  builds an exclusion-filtered source inventory from the depositor's
  connected GitHub source, runs bounded structured inference, persists the
  execution with real token/duration accounting, and emits options that keep
  the promoted V43/V47 option law (schema, roots, review boundaries,
  source-safety posture) so policy and admission consume them unchanged.
- Protected-IP exclusions are first-class synthesis steering: excluded paths
  and concepts never enter measurement, prompts, or option summaries, and
  candidates that touch them are dropped fail-closed (F14).
- Legacy `/terminal` code is refactored out as it is encountered during gate
  work (rule accepted 2026-06-12), with the dedicated F8 sweep retiring the
  remainder.

## V48 Gate 3 closed (specification + implementation): Deposit systems MVP

**Canon:** `BITCODE_SPEC_V48.md` is the **single full-system SPEC** for Complete
Implementation Derivability through Gate 3 — rebuild the **deposit systems MVP**
(`/deposits`, SynthesizeAssetPacks SDIVF, storage, hosts, agents/tools/prompts/
telemetry, option full-stack) from that file alone (§ Gate 3 G3-1…G3-15). This
notes companion records architecture history and the depositing parity matrix;
it is not stronger than the SPEC.

Gate 3 (branch `v48/gate-3-synthesis-pipeline-correctness`) is the **deposit
systems MVP** gate: algorithmic + telemetric correctness of deposit synthesis
driven by interactive QA on `/deposits`. It pursues both algorithmic correctness (the pipeline runs on the
real Bitcode execution/agent/prompt primitives rather than a hand-rolled
inference loop) and telemetric correctness (every LLM call renders decipherably
in the rich SDIVF telemetry), and in doing so unifies and formalizes the
pipeline.

Accepted V48 architecture law (decided 2026-06-25):

- The Gate-2 AssetPacksSynthesis measurement core is generalized into the
  one-and-only Bitcode synthesis pipeline: **SynthesizeAssetPacks** — a full
  **SDIVF** pipeline (Setup -> Discovery -> Implementation -> Validation ->
  Finish, with the Discovery/Implementation/Validation loop iterating up to a
  bounded maxIterations) executed in one of two **modes**: deposit or read.
  The mode is resolved once and stored on the **shared pipeline execution** (the
  parent of all phase children), NOT on a phase sibling — `sequential` runs
  preprocess and each phase on isolated sibling child executions
  (`execution.child('seq-N')`) and mode resolution only walks ancestors, so a
  mode stored inside preprocess is invisible to the phases (QA F20: they default
  to read and run the read-lens agents during a deposit run). All variance is
  carried by **conditional runtime registries** — each phase registers and
  resolves the mode-appropriate agents, tools, and prompts under the same phase
  keys (the registry is shared up the execution tree, so a phase's registrations
  are visible to its agent resolution). Renamed SynthesizeAssetPacks for parity with the future
  Gate-6 **SettleAssetPacks** pipeline; it subsumes the legacy, poorly-named
  "Develop" gate (which remains a thin alias so its `develop.*` observability
  is unchanged).
- Every LLM call builds upwards the prompt registry of
  Pipeline+Phase+Agent+Step+Generation and runs on the formal primitives, not
  hand-rolled inference: `PipelineExecution` -> phase -> `factoryAgent`/
  `factoryAgentWithPTRR` -> step -> Failsafe(prepare|chunk|stitch) of
  **Thinkings**(reason|judge|structured_output) — renamed from "Thricified"
  (2026-07-02): the reason and judge[-reasoning] generations are the thinking
  generations of that sequence. The pipeline is N agents
  (mostly PTRR, some Simple — both are base `Agent` implementations) across the
  5 phases; each PTRR agent renders 4 steps x 3 failsafe x 3 thinkings = 36
  formal LLM calls (the Failsafes-sequence clarification below revises the
  per-step shape to selection → task(×chunks) → repair-only). Every call renders in the rich SDIVF telemetry with correct
  phase/agent/step/failsafe/generation labels, because the formal executors
  populate the execution state (the lightweight path's `undefined` labels were
  a symptom of bypassing them).
- **Inference is non-configurable** (Garrett, 2026-06-26; removes the PROFILE
  concept entirely). There are NO inference profiles (no bounded/full, no
  `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE`, no per-agent `*_USE_PTRR` flags,
  no in-agent deterministic/bounded fallbacks). The formal pipeline ALWAYS runs
  the complete hierarchy and the lowest-level Generation ALWAYS performs real
  inference — the hierarchy is fixed, not env-switched. Determinism for tests is
  provided ONLY by mocking the LLM provider at the boundary (test infrastructure),
  never by branches inside the pipeline. This retires
  `runtime-inference-policy` (the profile/`shouldUsePtrr` functions),
  `bounded-structured-inference`, and the read-lens agents' deterministic
  branches; every agent resolves to its `factoryAgent*` formal executor.
- **SynthesizeAssetPacks executes via the pipeline HOST, decoupled from the
  dispatching request** (Garrett, 2026-06-26). Because the pipeline always runs
  the full hierarchy (many LLM calls), it must not be bound to a single HTTP
  request's `maxDuration`. The route VALIDATES + DISPATCHES a run and returns the
  `runId` immediately; the host runs the full pipeline to completion while
  source-safe telemetry streams to `execution_events`; the client detects the
  completion event (already streamed) and reads the persisted synthesis from the
  execution row `output`. Two execution hosts behind one host interface:
  **local in-process** (dev — the persistent Node server runs the dispatched
  pipeline as a background task) and the **Vercel Sandbox** (prod — durable
  isolated execution via the existing `pipeline-hosts` host). The `/deposit`
  synthesize-options surface stops awaiting the pipeline inline; the LLM-call
  timeout (QA F25) remains a per-call safety bound within the host run.
- Per-phase jobs (Garrett, 2026-06-25): **Setup** clones the repository and
  runs a danger-wall (safety/risk admission); **Discovery** explores the
  source; **Implementation** synthesizes the AssetPacks; **Validation**
  determines synthesis quality, corrections/additions, and the iterate-vs-
  complete decision; **Finish** uploads the synthesized artifacts.
- **Finish uploads the synthesized artifacts to Bitcode for user review in
  BOTH modes** (deposit: before Depository admission; read: before purchase).
  Opening a pull request is NO LONGER part of synthesis — PR / settlement
  delivery moves to the future Gate-6 SettleAssetPacks pipeline (confirm BTC
  payment, mint BTD, transfer rights to the reader). Develop-gate consumers
  degrade gracefully to no-PR.
- The deposit lens now RUNS the full SDIVF pipeline inline from
  `POST /api/deposit/synthesize-options` against the streaming execution, so the
  SDIVF telemetry renders end to end; the bounded-structured-inference path
  remains a resilience fallback when the pipeline yields no admissible options.
- Source-safety is enforced universally by `sourceSafeStreamEvent`, the single
  content-withholding gate every persisted/streamed pipeline event passes through.
  It withholds by **metadata allowlist**, not a content-key denylist: every `llm`
  store is content-withheld (message → `[content withheld — source-safe]`, data →
  a structural summary of {stage, generation, provider, model, contentChars,
  phase, agent, step}) EXCEPT a fixed source-safe metadata set
  (`startTime/endTime/duration/usage/status/provider/model/configKey/stopReason/
  error`). The allowlist is required because the two LLM-call paths name their
  content keys differently — the Thricified substeps use `input/prompt/output/
  parsedOutput`, while `AgentLLMsRegistry`/`PipelineLLMRegistry` (direct `getLLM`)
  use `messages/config/response` — and a denylist silently leaked `llm/response`
  (the raw provider response) as a status-event message (QA F18). A
  synthesis-local defense-in-depth candidate assertion remains; `rawPromptVisible`
  / `rawProviderResponseVisible` stay false by law.
- Telemetry rendering is single-line and bounded: the activity builder collapses
  every event to exactly one bounded line (one streamed event = one accordion
  row, never fragmented by embedded newlines) and the log row title spans carry
  `min-w-0` so a long line truncates within its row rather than x-overflowing the
  page (QA F18). The log auto-follows: it pins to the latest line as rows stream
  in unless the user has scrolled away from the bottom (then it respects their
  position and resumes only when they return to the bottom) (QA F23).
- **Formal telemetry log-line contract** (QA F19): the rich telemetry renders
  EXACTLY two formal log-line kinds — the ultimate LLM-call layer and Tool uses,
  nothing else (informational status, phase banners, and completion/error notices
  are NOT rows: run completion shows via the processing indicator and errors via
  the log's error banner). (1) **LLM calls** — the inference leaf, canonically the
  Thricified substep output (`llm/output`, stream type `generation`), carrying the
  full hierarchy Phase→Agent→Step→Failsafe→Thricified + source-safe content +
  provider/model/usage, each level its own pill. (2) **Tool uses** —
  `tool|tools:result|error`, carrying Phase→Agent→Step + tool name/arguments (no
  Failsafe/Thricified). Pills map by fixed role: Phase (grey, phase icon) top-left,
  Agent (blue, agent icon) top-2nd; Step / Failsafe / Thricified bottom 1-2-3, each
  with a guaranteed icon (per-type default refined by a label substring match).
  Every other store event (step/agent/phase name stores,
  prompt-side llm keys, the `llm/response` registry copy, cwd paths, generation
  markers, tool sub-keys) is intermediate CONTEXT: the activity builder folds it
  into a rolling `{phase, agent, step, failsafe, generation}` context (so the next
  LLM/tool row is stamped with its full hierarchy) but never emits it as a row.
  Distinct calls that share withheld text stay distinct rows via a unique
  null-separated row key; the renderer displays the text before the separator,
  keys details by the full key, and bypasses de-dup for uniquely-keyed rows. This
  is what removes the `try`/`setup-plan`/`thricified-generation`/path fragments
  and stabilizes the pipeline↔UI payload contract. The contract depends on the
  client seeing the SAME structured event shape live as on reload: the live SSE
  tail (`usePipelineExecution`) therefore relays raw `event_data` verbatim
  (namespace/key/executionState intact) rather than re-parsing it — re-parsing
  flattened events into namespace-less status frames, which defeated the
  classifier and leaked every store as a fragment row during streaming.
- **OTF (on-the-fly instructions) is eradicated entirely** as legacy residue:
  the dead telemetry types (`otf_instructions`/`otf_adherence`), the unused
  `setOnTheFly` prompt primitive, the live instruction-injection feature (the
  instructions API + the `run_otf_instructions` ORM model + the submit UI + the
  `waitForInstruction` Validation-phase pause), and the physical
  `deliverable_pipeline_otf_instructions` table (drop migration).

AssetPack model (decided 2026-06-25):

- An **AssetPack is ALWAYS a completely synthesized artifact** — never a slice of
  existing source. It comprises: the synthesized **patch** (new content written
  as code edits to the repo — deposit: the depositing repo; read: the reading
  repo), its **measurements**, and its **metadata** (e.g., the contributing
  AssetPacks for a pack synthesized for a Need). Implementation synthesizes the
  patch into the Setup-cloned workspace (via a code-edit/write tool), measures it,
  and attaches the metadata; the patch CONTENT is withheld pre-settlement.
- **Deposit** AssetPacks are "Readless/Needless": patches against the
  **depositing** repo carrying only **absolute** measurements (taken by looking
  at the content directly, independent of any Need). Depositing produces them as
  Depository supply.
- **Read** AssetPacks are patches against the **reading** repo, synthesized from
  the deposited AssetPacks that fit-finding selects from the Depository (the
  deposited packs are the synthesis input). A read AssetPack carries the absolute
  measurements PLUS the **fit** measurements (how well the pack fits the read
  Need). Its **BTD** — what is bought for Bitcoin — is the **normalized scalar
  weighted sum of all fit-only measurements**; the reader's Need unlocks the
  additional fit measurements that finalize the pack's BTD content.
- Measurement + BTD grounding (mapped 2026-06-25): the canonical V48 measurement
  catalogs live in `packages/pipelines/asset-pack/src/asset-packs-synthesis.ts`.
  **Absolute** (deposit): source-coverage (0.36) / demand-alignment (0.40) /
  reuse-likelihood (0.24). The read catalog adds the **fit-only `need-fit`**
  (0.44) alongside source-coverage (0.28) / reuse-likelihood (0.28). The BTD
  scalar is computed in `btd-scalar-volume-quote.ts` under the fixed-point
  weighted-volume policy `need-relative-fixed-point-weighted-volume`
  (weightScaleBps 10000, volumeScale 1e6, floor-row-remainder-rooted):
  `scalarMicroBtd = volume × weightBps × admittedFitQualityBps / 1e8` per
  measurement, summed and normalized — a read AssetPack's BTD is this sum over its
  fit-only measurements. The read Need pricing vector
  (semantic_relevance / source_binding / artifact_kind_fit / closure_specificity)
  is in `read-need.ts`. The patch is carried as `fileChanges` + the source binding
  (covered paths) with the actual patch CONTENT withheld pre-settlement (the
  source-safe preview boundary; content unlocks to owner_read / licensed_read on
  settlement). `protocol-demonstration/` is the V47 realization framework (type
  contracts, receipt schemas), NOT the V48 measurement source of truth.

Lens inputs (decided 2026-06-25): the single-prompt user input is
**Obfuscations** when depositing (what to obfuscate/withhold — supersedes the
"depositor instructions" naming) and a **Need** when reading. Depositing and
reading run ~the same agents; the lens carries the variance by adding the Need
(read) or the Obfuscations (deposit).

The five phases (same agents in both modes, lens-varied — decided 2026-06-25):

- **Setup**: clone the repository, the danger-wall (the Bitcode **read**
  risk-admission), and **input-comprehension** (comprehend the Need when reading /
  the Obfuscations when depositing). The deposit input-comprehension produces
  structured obfuscation guidance — the source paths and concepts to withhold and
  how synthesis must honor them — stored at `setup:inputComprehension` for the
  downstream phases (authoritative alongside the protected-IP exclusions). Two
  Setup agents are **read-lens** and are punted under the deposit lens (each a
  passthrough — no LLM call, no telemetry row): (1) the Setup-plan agent (planning
  Finding Fits from an accepted Read-Need) — its fits-finding planning moves to the
  read-lens **Discovery** phase in the read gate (QA F22); and (2) the danger-wall,
  whose contract is purely read-framed (`readSafeToMeasure` /
  `assetPackSafeToSynthesize` / `deliveryMechanismSafeToAttempt`, proof- and
  delivery-boundary gates) and which has no Read to admit on a deposit — left
  running it flails to `safe:false`/`high` and its short-circuit wrapper blocks
  synthesis outright. The depositor's source-safety is enforced instead by the
  streaming source-safe filter + the obfuscation comprehension; a deposit-lens
  admission is a later-gate `…ForDepositor`/`…ForReader` split (QA F25, 2026-06-30).
- **Discovery** — three agents discovering from the codebase, the Depository, and
  the model itself respectively, for the synthesis lens:
  - `discovery:codebase-comprehension` — comprehends the cloned source.
  - `discovery:depository-search` — deposit: guides likely-to-be-read framing for
    the packs being synthesized; read: finds the deposited AssetPacks from the
    Depository that fit (will help synthesize the read AssetPack).
  - `discovery:inherent-regurgitation` — the model returns, from its training
    data, any and all information useful to the deposit/read synthesis.
  - Deposit stores each agent's comprehension for the Implementation phase:
    `discovery:codebaseComprehension` (capabilities / knowledge-areas / modules),
    `discovery:depositorySearch` (likely-read topics / demand-alignment /
    readability), `discovery:inherentRegurgitation` (relevant knowledge / patterns
    / references).
- **Implementation**: synthesize the AssetPack patch(es) with their absolute
  measurements (read additionally computes the fit measurements and the BTD).
  Each candidate is a measured patch — the measured option fields plus a
  SOURCE-SAFE patch descriptor (`fileChanges` [path + change-op] and a
  natural-language `patchSummary`), recorded via the `AssetPackPatchWriteTool`
  (a formal `ExecutionTool`) which the synthesis agent reads from the Discovery
  stores (`discovery:codebaseComprehension` / `:depositorySearch` /
  `:inherentRegurgitation`) and the obfuscation comprehension. Pre-settlement the
  RAW patch content is never produced — only the descriptor + measurements are
  reviewable (stored at `implementation:assetPacks`; the reviewable face at
  `implementation:options`). Physical materialization of the raw content into the
  cloned workspace is the delivery/settlement context.
- **Neediness (deposit preview of read Need-fit; v0)**: a deposit-lens AssetPack
  PREVIEW measurement (0..1) estimating the reading demand the pack would satisfy
  — the depositor's preview of its future read-side `need-fit` (and ultimately
  BTD / earnings), which guides which packs are worth synthesizing. It is SEPARATE
  from the absolute deposit composite (source-coverage / demand-alignment /
  reuse-likelihood) — an estimate of a different (read) lens, shown alongside but
  not folded in. Computed deterministically per pack as
  `neediness = clamp01(demand × (0.5 + 0.5 × (1 − saturation)))` from two
  source-safe signals the depository-search lens supplies: `demand` ∈ [0,1]
  (estimated reading demand for the pack's knowledge — v0: the Discovery
  `depository-search` demand guidance / `demandAlignment`, grounded in the
  depositor `demandContext`) and `saturation` ∈ [0,1] (how much the Depository
  already supplies the topic — v0: the depository-search `underservedTopics`
  signal). Demand gates, scarcity boosts: a demanded, underserved pack scores
  highest (a future Need would have few alternatives, you the supplier); a
  saturated or undemanded pack scores low. The deposit synthesis agent emits the
  per-pack `needinessSignal {demand, saturation, rationale}`; `computeNeediness`
  derives the scalar in the shared lib (`asset-packs-synthesis.ts`); the `/deposit`
  option cards preview it as earning potential. Source-safe: derived scalars +
  topic descriptors only, never raw source. **v1 is deferred to Gate 7**: replace
  `saturation` with a real embedding-vector probe of the pack against the
  Depository supply index, and `demand` with a search against an accrued
  Read-Need / demand corpus; once the pack is read, the realized read `need-fit`
  + BTD calibrate the estimate.
- **Validation**: quality thresholds, coverage/corrections/fixes, and AssetPack
  smoke/sanity checks; the Discovery/Implementation/Validation loop iterates until
  complete or maxIterations. The deposit validator (`validation:deposit-quality`)
  validates the synthesized AssetPacks — measurement honesty (0..1), distinctness,
  source-safety, obfuscation/exclusion compliance, patch-descriptor coherence, and
  coverage — emitting `{issues, qualityScore, coverageGaps, recommendation}`. Its
  issues are stored at `validation/implementation:issues` (the key the canonical
  ReadyToFinish gate reads); any issue forces `iterate`.
- **Finish**: upload the synthesized AssetPack(s) to Bitcode for review.

Implementation status vs this model (Gate-3 build-down): the deposit pipeline now
runs the canonical agents (mode propagated to the phases — F20), the measured
PATCH descriptor (F-series), Obfuscations + Setup input-comprehension, neediness
v0 (F24); inference is non-configurable (profiles removed — F26-A), the synthesis
runs decoupled via the host (F26-B), and the PTRR envelope is unwrapped so real
output flows (F26-A/F27). The remaining Gate-3 measurement obligation is the formal
**absolutes** measurement category (see the roadmap below) — the catalog grounded
in `protocol-demonstration/`; the current source-coverage / demand-alignment /
reuse-likelihood are placeholders to be superseded.

Measurement formalization + the `measure-agent` hierarchy (Gates 3-5 roadmap;
Garrett, 2026-06-27):

- AssetPack measurements form TWO formal CATEGORIES (pluralized): **absolutes** and
  **needinesses**. Absolutes are intrinsic content measures — sizes (functions,
  types, etc.), a correctness estimate, and others drawn from the demonstration
  implementation (`protocol-demonstration/`). Needinesses are the read-demand / fit
  measures (the deposit-side neediness preview [F24 v0] + the read-side Need-fit;
  the BTD is the scalar over the needinesses). The legacy
  source-coverage / demand-alignment / reuse-likelihood placeholders are superseded
  by the formalized absolutes.
- The measurers are a base-class hierarchy of formal PTRR agents. In
  `generic-agents`: a base **measure-agent** (PTRR); from it two bases —
  **measure-agent-absolutes** and **measure-agent-needinesses**. In the asset-pack
  pipeline those base the two concrete measurers — **agent-measure-absolutes** and
  **agent-measure-needinesses** — each respecting the pipeline lens/mode
  (deposit | read) in Gate 4 (two lens-parameterized agents covering the four
  lens×category measurements).
- **Gate 3 (current)** formalizes the **absolutes** category (the non-needinesses):
  `measure-agent` + `measure-agent-absolutes` -> `agent-measure-absolutes`, with the
  absolutes catalog (sizes, correctness, …) grounded in `protocol-demonstration/`.
- **Gate 4 (read)** is lens FINALIZATIONS of the SAME SynthesizeAssetPacks pipeline
  (not a new pipeline — finalize the read lens) and MOSTLY the **needinesses**
  formalization: `measure-agent-needinesses` -> `agent-measure-needinesses`, beyond
  the F24 v0 preview. (Neediness v1 — the real embedding-vector supply-index probe +
  Read-Need/demand-corpus search — remains Gate 7.)
- **Gate 5** removes the lens/mode concept and splits SynthesizeAssetPacks into two
  pipelines — **SynthesizeAssetPacksForDepositor** and **SynthesizeAssetPacksForReader**
  — breaking the lens-configured implementations into per-role variants
  (`agent-measure-asset-packs-absolutes-for-depositor`,
  `agent-measure-asset-packs-needinesses-for-reader`, etc.).

### The Failsafes sequence — formal clarification + the PrepareConciseContext contract (Garrett, 2026-07-02)

A Step's generation is the Failsafes sequence: THREE failsafes in fixed order, each
with a DISTINCT trigger and a DISTINCT job. "Thricified" is RENAMED **Thinkings** —
the atomic typed generation-sequence Reason → Judge → StructuredOutput, named for the
thinking generations (reason and judge[-reasoning]) that precede the typed output.

1. **PrepareConciseContext (PCC — the context failsafe; ALWAYS runs; selection-only).**
   The pipeline's full execution context accumulates without bound (every phase,
   agent, step, and generation stores state below the root), so inference quality
   demands state-cleaning: PCC is the FILTER that reduces noisy context to exactly
   what the task at hand needs. Its contract:
   - INPUT: `{ preparation, system, pipeline_execution_keys }` where
     `preparation` = the composed task prompt(s) it is preparing for (pipeline system
     prompt + agent system prompt + step prompt — e.g.
     `Implement-WriteAssetPacksDiffs-Refine`), `system` = PCC's own instructions
     (what is PCC requesting to be inferred?), and `pipeline_execution_keys` = the
     FULL root execution state tree rendered as **keys only**
     (`{ phase1: { agent1: { step1: ... } ... } ... }`) — never the values.
   - OUTPUT: the selected KEYS. PCC's inference is a Thinkings generation against the
     key-selection schema — NOT the step's output schema (PCC never attempts the task).
   - READ-IN: the host then reads the VALUES of exactly the selected keys from the
     execution state and provides them as the task context to the subsequent
     generations (CS, SC).
2. **ChunkThenSum (CS — the input failsafe; trigger = the composed request exceeds the
   request/context limit).** Non-triggering (the composed prompt — hierarchical system
   prompt + task input including the PCC-selected values — fits the request limit):
   exactly ONE Thinkings task generation, no chunking. Triggering: split the selected
   context values into chunks that each fit, run the task generation per chunk, then
   ONE summing generation over the chunk results.
3. **StitchComplete (SC, `factoryStitchUntilComplete` — the output failsafe; trigger =
   the response is schema-INCOMPLETE, i.e. missing expected keys of the output schema,
   or truncated).** Non-triggering (the response parses complete against the expected
   schema): zero additional generations — the CS result passes through. Triggering:
   stitch-repair generations, each carrying the EXACT validation failure (the schema
   error names the missing/invalid fields — a repair prompted only with "continue"
   cannot fix a schema gap), bounded, with the final attempt validated rather than
   discarded.

Testing law: CS and SC are each tested on BOTH paths — triggering (input exceeds the
request limit; response missing expected schema keys) and non-triggering (input fits;
response schema-complete) — with deterministic boundary LLM mocks.

AUDIT (2026-07-02, of the shipped implementation vs this contract): SC conforms after
the stitch corrections (schema-incomplete trigger, error-carrying repairs, bounded with
final-attempt validation). PCC and CS do NOT yet conform: PCC snapshots a FIXED set of
root namespaces (repository/source/read/config/attachments/instructions/
evidence_documents/pipeline.input) with full VALUES — no keys-only tree, no selection
inference (its generation runs the step's output schema, producing a discarded full
task attempt), and the deterministic size-based `prepareConciseContext` chunker stands
in for selection; CS triggers on that snapshot's serialized size (against the model's
max-OUTPUT tokens, not the request limit) instead of measuring the composed request,
and its chunked path threads the full accumulated input into every chunk call. The
Gate-3 correction aligns the implementation to this contract: PCC becomes the keys-only
selection inference + value read-in; CS measures the actual composed request and chunks
only the selected values; the three failsafes stop wrapping three identical task
generations (the current 3×3 shape) and become selection → task(×chunks) → repair-only.

**Cross-phase store-visibility law (same decision).** SDIVF phases execute on isolated
sibling child nodes (`seq-N`), and `findUp` walks ANCESTORS only — so any artifact one
phase produces for another (or for the dispatching route) MUST be stored on the SHARED
outer pipeline execution (the F20 mode-propagation precedent), never on the producer's
own sibling subtree. The 2026-07-02 sweep found the deposit flow violating this
end-to-end (implementation options, discovery comprehensions, preprocess
inventory/exclusions, setup obfuscation guidance — all invisible to their consumers and
to the route's completion read); the Gate-3 correction re-homes cross-phase artifacts
onto the shared execution and pins the producer/consumer store contract with tests.

### Product routes pluralize + master-detail pipelines (Garrett, 2026-07-03)

The lens routes RENAME to plural — `/deposit` → `/deposits`, `/read` → `/reads`
(param-preserving redirect shims stay at the old paths for stale links and
in-flight auth next-paths; `/api/*` route paths are unchanged). Both pages
become MASTER-DETAIL:

- **Master: a pipelines table** (the shared transactions-table stack,
  lens-preset filters) over the account's executions rows; row selection is
  the URL `transactionId` (runId alias), so selection survives reload.
- **Drill-in sub-page:** the detail REPLACES the table on selection, with a
  Back button returning to the table (Back clears the URL selection and
  detaches the run). Selection is EXPLICIT — no auto-recovery to the newest
  run and no first-row fallback; with nothing selected the master table
  shows. On /reads a selected non-pipeline run (no streamed telemetry)
  renders a run-summary detail instead.
- **Detail: selection connects to the run.** Selecting a RUNNING synthesis
  run reattaches its live stream (the history+stream tail attaches to any
  runId); selecting a COMPLETED run resumes its persisted results from the
  execution row output; failed/interrupted runs surface their terminal state
  with the historical log attached. On /deposits the detail is the Telemetry
  + Options review; /reads gains the same Telemetry stack (log, pills, run
  clock, iteration marker, readiness verdict) for the selected pipeline run.
- **Lens identity at dispatch:** the deposit dispatch route stamps the
  synthesis context (source/workbench/route/pipelineCore/synthesisMode +
  repository coordinates) onto the executions row AT DISPATCH (upsert), so
  running rows are lens-identifiable in the tables instead of context-null
  until completion. New rows stamp `route: '/deposits'`. Because the client
  may supply the runId, the route guards the id BEFORE any write: an id
  colliding with an existing row (any owner) is rejected 409
  `run_id_conflict` — no hijack, no double-dispatch into one row.
- **Terminal-state attribution:** the run tail resets on every runId change
  and the detail only trusts terminal signals attributed to the attached run
  (execution-row match), with the persisted row status as the terminal
  fallback (completed rows without a completion event; interrupted rows via
  the orphan sweeper — 'interrupted' is now a terminal status for the SSE
  tail).
- **Selection ALWAYS loads the execution's telemetry:** selecting ANY
  pipeline run adopts it into the detail — a live run [re-]connects its
  stream, a historic run replays its persisted events (the tail hook skips
  the SSE tail entirely when the history row is already terminal). A
  synthesis run additionally resumes its synthesized AssetPack options into
  review; any other run is a telemetry-only detail (kicker 'Pipeline run')
  that completes without an options fetch. Terminal rows adopt AT their
  terminal status — never through a transient 'running' (which would
  disable the dispatch button and animate the orb until hydration). An
  actively dispatched run owns the detail until the user actually changes
  selection. On /reads, a completed run's persisted output additionally
  surfaces a 'Synthesized AssetPacks' summary linking back to the /deposits
  review detail.
- **Nav route labels are plural** ('Deposits', 'Reads') — matching the
  routes they open; action verbs elsewhere (terminal actions, footer flow
  steps, docs prose) stay singular.
- **Known read-gate gap:** read-lens pipeline runs dispatched through the
  sandbox host do not yet persist their own lens-stamped executions rows
  (structured mode); the /reads table lists what exists and the telemetry
  detail attaches to any asset-pack pipeline row, labeled by the RUN's lens.
  Read dispatch persistence lands with the read gate.

Checker posture: all gate checkers literal-matching the old routes are
era-pinned (V43–V47) and do not run at the current pointer; frozen `.bitcode/`
era artifacts and promoted spec families keep the historical route names. The
standalone `.mjs` gate checkers are pointer-gated in the workflow; the
`@bitcode/protocol` **test suite** (`node --test test/*.test.js`, run
unconditionally by Gate Quality) was NOT — its V43–V47 route-realization proofs
read the historical singular-route source in place and moved to `false !== true`
once the pluralization moved the files to `uapi/app/deposits|reads`. Those 16
superseded proof files import `test` from
`packages/protocol/test/era-pinned-superseded-routes.js` (a `node:test` shim)
instead of `node:test`: it skips every test WITH A REASON when the current
plural realization is present (`uapi/app/deposits/DepositPageClient.tsx` exists)
and runs them unchanged on the promoted V47 canon where the singular
realization still stands. The proofs are NOT re-pointed at the plural routes —
Gate 3 rewrote those files, so their historical content predicates would not
match, and the frozen proofs attest their own era.

### Legacy terminal browser-proof eradication (Garrett, 2026-07-05)

The legacy `/terminal` cockpit **browser proofs** are eradicated and the active
browser-proof coverage is repointed at the current product surfaces:

- The two ACTIVE browser-proof contracts (`uapi/app/bitcode-browser-proof.ts`,
  `uapi/app/bitcode-browser-accessibility-responsive-proof.ts`) drop the
  `terminal` surface (routes `/terminal…`) and instead prove `deposits`
  (`/deposits`) and `reads` (`/reads`) — real routes, real testids
  (`route-shell-deposit`/`deposits-pipelines-table`/`deposit-synthesis-telemetry`,
  `route-shell-read`/`reads-pipelines-table`/`reads-synthesized-packs`) — with the
  Auxillaries routes moved from `/terminal?auxillary-open-to=` to
  `/packs?auxillary-open-to=`. Their jest contract tests and the (opt-in,
  gate-var-guarded) Playwright specs are repointed to match.
- The V29-era terminal-ux browser proof is DELETED:
  `uapi/app/terminal/terminal-ux-browser-proof.ts`,
  `uapi/tests/terminalUxBrowserProof.test.tsx`, and
  `uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts` — removed from the Gate
  Quality jest step, the `jest.config.cjs` allowlist, and the `test:e2e:terminal-ux`
  package script; the accessibility script is renamed
  `test:e2e:v32-browser-proof` → `test:e2e:accessibility-responsive-proof`, and the
  CI step names drop "Terminal".
- Frozen V39/V40 canonical proofs that read those deleted files as evidence
  (`v39-enterprise-reading-ux-state`, `v40-browser-e2e-visual-proof`,
  `v40-test-inventory-coverage-matrix`) are era-pinned via a second shim,
  `packages/protocol/test/era-pinned-superseded-browser-proofs.js`, which skips
  WITH A REASON once the terminal-ux proof is absent (and runs unchanged on the
  promoted V39/V40 canon). The era-pinned V29/V32 `.mjs` checker scripts and the
  historical canon-promotion workflows keep their references (inert at the current
  pointer) — their deep removal belongs to the broader F8 `/terminal` eradication.

### Deposit/Read product-surface presentation laws (Garrett, 2026-07-04)

The 2026-07-04 UI wave on the product surfaces (/deposits, /reads, and the
shared transactions/telemetry components) is governed by these laws:

- **All-square theme.** Product surfaces use square corners — no `rounded-*`
  chrome on cards, inputs, pills, tooltips, tables, buttons, or popovers.
  The only circles are genuinely circular effects (the orb, orbital
  background, blurred glow effects).
- **No double-nesting.** One level of card chrome. A surface rendered inside
  a carded section renders FLAT: the pipelines table shell has no second
  border/title/summary under the page section (the section owns the card
  and the header), filter cells and branch/commit cells put no card around
  already-bordered controls, telemetry detail wrappers are chrome-less
  inside their section, and stat rows (session, authority, earning, proof
  roots) are divider rows, not boxes-in-cards.
- **One-row layouts.** Horizontal space before vertical: the filter bar is
  a mosaic with SEARCH as the FIRST same-size card (2 cols base / 4 at
  tablet / 8 at xl); the table overview (stat chips + state pills) is one
  wrapping row ABOVE the table; pagination is one row; active filters are
  one row (count · removable chips · clear-all) replacing the posture card
  and the filter bar's duplicate reset button; provider · repository ·
  branch · commit form one four-column row; source path hints + protected
  IP exclusions pair on one row; the deposit route-state cards (Earnings /
  Governance / Session) are one row of three columns from tablet up
  (single column in the narrow xl rail).
- **Compact route header.** The ProductRouteShell header is one wrapping
  row — eyebrow + title + one-line summary left, metrics as inline
  label·value CHIPS right — never a stacked metric-card grid. The route
  step grid is REMOVED from /deposits (the header, the pipelines
  drill-in, and the flow sections carry the journey).
- **Every stat explains itself (rich-tooltip law).** Header metric chips,
  session/authority/earning/opportunity rows, proof-detail roots,
  disclosure summaries, table overview chips and state pills all carry the
  shared rich hover tooltip (the telemetry-pill trigger, generalized), each
  leading with what the specific value means and where it comes from
  (copy: `uapi/app/deposits/deposit-stat-explainers.ts`). Tooltips are
  viewport-height capped and INTERACTIVE: overflow scrolls inside the
  tooltip (pointer can travel in; inner scrolls do not dismiss it).
- **All tooltips carry ALL their sections.** BOTH tooltip families carry
  the same complete six-section set — kicker, title, specific/summary,
  generic/detail, 'Use this to' points, and references (current source
  files + current canon):
  - Hover stat/pill tooltips (`TelemetryPillExplainer`): `generic`,
    `points`, and `references` are TYPE-REQUIRED — a tooltip missing any
    section does not compile. Telemetry pill kinds get their sections from
    a per-kind table (PILL_SECTIONS); stat families (session state,
    governance, earning intelligence, proof/opportunity roots, route
    metrics, panels, table stats/state) from per-family section consts.
  - Inline (i) explainers (`BitcodeExplainer`): every explainer entry on
    the product surfaces (transaction filters/table, deposit sections,
    terminal workspace, auxillary panes, public nav/footer) carries all
    six sections.
- **The one rich dropdown.** Every pick-one control is the shared
  SearchableSelect combobox (square, text-searchable): all seven table
  filters, provider, repository, branch, and commit. The deposit source
  selection LEADS with a Provider dropdown (providers listed via
  TERMINAL_REPOSITORY_PROVIDERS with live connection state as the item
  description; switching provider rewrites the provider param and clears
  repo/branch/commit).
- **Examples are placeholders.** Form fields never prefill example values.
- **Path inputs are file-tree pickers.** Source path hints and Protected IP
  exclusions are picked from the repository FILE TREE fetched at the
  selected repository·branch·commit (new VCS `tree` resource →
  `VCSService.getRepositoryContent`, lazy per-directory), never typed:
  a file selects its exact path, a directory selects its prefix (`dir/`).
  The two selections are MUTUALLY EXCLUSIVE — a path picked on one side is
  disabled on the other, labeled with why. The dispatch payload carries the
  exclusions as an array (the route accepts arrays or newline strings).
  Concept-level withholding belongs to the Obfuscations field, not the
  exclusion picker.
- **Aside cards are non-collapsible.** The Earnings / Governance / Session
  cards are plain sections; only their inner disclosures (Opportunity
  roots, Authority blockers, Disclosure boundary, Deposit proof detail)
  collapse. The 'Open pack activity' shortcut button is removed from the
  pipelines section.
- **Camel-cased ids word-space in pills** (e.g. 'DEPOSIT ASSET PACK OPTION
  SYNTHESIS'), matching the telemetry pill-label law.

### Product analytics — source-safe baseline + depositing funnel (Garrett, 2026-07-05)

Rich product analytics over the commercial surfaces, in two layers:

- **Baseline.** Vercel Web Analytics (pageviews) + Speed Insights mount in the
  root layout; the Analytics component is the Next-specific entry
  (`@vercel/analytics/next`) so Web Analytics reports the framework ROUTE
  pattern alongside the page path (the Route dimension). GA4 keeps its
  `page_view` + delegated-click safety net unchanged.
- **Custom events go through ONE audited module** —
  `uapi/lib/product-analytics.ts`: a TYPED event union (`ProductEvent`)
  fanned out to Vercel Web Analytics (`track`) and GA4 (`trackEvent`) under
  the same snake_case event names, so both dashboards carry the same funnel.
  Direct `track` calls outside the module are prohibited; the union is the
  audit surface for what leaves Bitcode.
- **Source-safety law for third-party telemetry.** Analytics events leave
  Bitcode for third-party dashboards, so payloads are FLAT source-safe
  scalars — counts, booleans, enum states, durations — NEVER repository
  names/paths, obfuscation or prompt text, option contents/measurements,
  wallet material, or user/run identifiers. (The legacy landing-CTA event's
  user-id payload is retired under this law; the CTA reports presence
  booleans only, as `landing_use_bitcode_click`.) Tracking failures are
  swallowed — analytics never breaks the product surface — and the module
  no-ops outside the browser.
- **Depositing funnel events** (the Gate-3 instrumentation):
  `deposit_source_selected` (provider + branch/commit pin shape; once per
  distinct repository per mount), `deposit_synthesis_dispatched`
  (obfuscations-authored boolean [the field starts EMPTY — its guidance is a
  PLACEHOLDER per the examples-are-placeholders law, so only depositor-authored
  text reaches synthesis], protected-exclusion count, demand-signal count),
  `deposit_synthesis_completed` (optionCount + durationMs),
  `deposit_synthesis_failed` (stage `dispatch` | `run` | `resume` +
  durationMs), `deposit_option_review` (decision enum + admitted),
  `deposit_admission` (selected vs admitted counts).
- **Dispatch-attribution law.** Funnel completion/failure events fire ONLY
  for runs dispatched in the CURRENT session (the dispatch timestamp is
  stamped at dispatch and cleared on table adoption) — adopting a historical
  row into the master-detail never emits funnel telemetry.
- The reading lens receives the mirrored funnel (`read_*`) when the read
  gate opens its surfaces.

### PTRR step output schemas — steps validate against STEP schemas (Garrett, 2026-07-03)

Step outputs validate against STEP schemas, not the full agent schema — for all
PTRR steps. Each step's Thinkings structured output (and its StitchComplete
guard) validates against what THAT step is prompted to produce:

- **Plan** → the canonical plan-step schema `{ approach: string, steps: string[],
  considerations?: string[] }` (`PlanStepOutputSchema`,
  `agent-generics/src/steps/step-schemas.ts`) — the execution strategy the Plan
  objective asks for, kept small so the structured-output hint stays whole.
- **Try / Refine / Retry** → the agent's output schema. Try is the main typed
  attempt; Refine improves it against the same schema; Retry is the last bounded
  chance — and because an agent's result is its LAST step's output, the agent's
  typed output contract is preserved.
- Every step accepts an explicit `outputSchema` override in its per-step config
  (`config.plan.outputSchema` etc.); the defaults above are the law.

Observed defect this corrects (run `61c3b0cf`, 2026-07-03): every step was handed
the agent's full schema, so the synthesis agent's PLAN step was required to emit
`{"options": [...]}`, failed schema validation BY CONSTRUCTION, and burned SC
stitch repairs before Try even started — a standing repair tax on every PTRR
agent's plan step in every run.

### Failsafe chunk/stitch precision — recursive, size-variable N (later V48 gate roadmap; Garrett, 2026-06-27)

The Failsafe substeps `chunk` (`factoryChunkThenSum`) and `stitch`
(`factoryStitchUntilComplete`) are RECURSIVE failsafes whose count N is VARIABLE to the
DATA SIZE. A later, appropriate V48 gate must complete the PRECISION around those N:

- **chunk N is variable to the INPUT size** (input-overflow guard): split the input
  into exactly enough chunks that no single chunk overflows the model's INPUT context,
  recursing (re-chunk a chunk that still overflows) until every chunk fits. N derives
  from the input token size vs the context budget — not a fixed threshold.
- **stitch N is variable to the OUTPUT size** (output-overflow guard): produce the full
  result across exactly enough stitched continuations that it completes despite the
  model's max-OUTPUT-token limit, recursing (continue stitching) until the output is
  complete. N derives from the output size vs the max-output budget.

Today these are approximated by a fixed `chunkThreshold` on the plan/try steps. The
later gate FORMALIZES the precise, recursive N for BOTH axes, so the Failsafe is robust
to inputs and outputs of ANY size (neither input- nor output-overflow can occur). This
is a generic-primitive hardening (`agent-generics` / `pipelines-generics`); gate
placement is flexible — naturally alongside the formal-primitive work (e.g. the Gate-4
read / needinesses formalization that runs on the same Failsafe ∘ Thricified machinery,
or a dedicated primitive-robustness chunk).

### Obfuscation handling — knowledge boundary, implicit, decided + steerable (later V48 gate roadmap; Garrett, 2026-06-29)

Today deposit obfuscation handling is fail-closed PATH exclusion (excluded/obfuscated
paths are removed from the inventory before any prompt; any candidate covering an
excluded/unknown path is dropped; the synthesis agent is told to honor obfuscations +
protected-IP exclusions absolutely). A later, appropriate V48 gate (deposit lens —
naturally the Gate-5 ForDepositor finalization, or a deposit-policy gate) enriches it to
a principled, steerable model:

- **Knowledge boundary (fair game).** Knowledge that CAN be derived from the
  UNOBFUSCATED source is fair game to synthesize into AssetPacks; knowledge that CANNOT
  be known without the obfuscated material is NOT — it is withheld. The test is
  derivability from the non-obfuscated remainder, not mere path membership.
- **Implicit obfuscations.** Handle not only the depositor's EXPLICIT
  obfuscations/exclusions but IMPLICIT ones — anything that, though unlisted, would
  reveal or reconstruct an obfuscated thing (a derivation, a tell, a unique signature).
  Detect + withhold these too.
- **Error on the side of obfuscating.** When it is uncertain whether something falls
  inside the boundary, default to OBFUSCATING (withholding) — conservative / fail-closed.
- **Decided + reported for steering.** Resynthesis REPORTS the obfuscation decisions:
  WHAT was obfuscated/withheld and HOW each decision was reached (the reasoning), so the
  depositor can clearly STEER obfuscation on resynthesize (tighten, relax, or correct
  specific decisions). The decisions ride the option / synthesis report alongside the
  measurements + contents.
- **Source-safety.** The decision report is itself source-safe — it names what was
  withheld + the rationale at a topic/path level, never the obfuscated material.

### Gate-3 absolutes formalization — implementable contract (Garrett, 2026-06-27)

This is the implementable detail for the Gate-3 obligation above. Measurement is
made a FORMAL, SEPARATE step: an AssetPack is a *measured patch* = a patch
(synthesized by the Implementation agent) **measured by a dedicated measure-agent**.
Today the synthesis agent self-scores its own placeholder catalog inline; the
formalization moves absolute measurement out of synthesis into `agent-measure-absolutes`,
run in the **Validation** phase over each synthesized patch.

- **The absolutes catalog (v0).** Intrinsic, reader-independent measures of the
  synthesized patch. Each is grounded in the demonstration's static-measurement
  notion (`protocol-demonstration/`: `normalizedBitcodeVolume` / semantic volume,
  the static measurement report). The Gate-3 v0 catalog:
  - **sizes** — a set of structural magnitudes: `function-count`, `type-count`,
    `file-span` (the count of files the patch touches, deterministic from the patch
    descriptor's `fileChanges`). Each carries a raw `magnitude` (a count) AND a
    normalized 0..1 `volume`.
  - **correctness-estimate** — a 0..1 estimate of the synthesized knowledge's
    fidelity/buildability (the patch is internally coherent and faithful to the
    comprehension it was synthesized from).
  - **semantic-volume** — the demonstration analog (`normalizedBitcodeVolume`): a
    normalized 0..1 scalar of *how much* commercially-legible knowledge the pack
    encodes, a monotone function of the sizes. This is the absolute "amount" measure
    the BTD volume later grounds on.
- **Measurement shape.** `AssetPackCandidateMeasurement` gains `category:
  'absolute' | 'neediness'`, optional `magnitude` (raw count) and `unit`
  (`functions` | `types` | `files` | `estimate` | `normalized`). `volume` stays the
  normalized 0..1 the composite uses; `magnitude` is display/provenance only. The
  neediness preview (F24) is re-tagged `category:'neediness'`; the absolutes are
  `category:'absolute'`. The weighted composite is the weighted sum over the
  **absolutes'** `volume` (needinesses are never in the absolute composite).
- **The measure-agent factory hierarchy.** Realized as LAYERED FACTORIES (the
  codebase idiom — each "base" is a factory that configures the more general one,
  bottoming out in `factoryAgentWithPTRR`; there is no class inheritance):
  - `generic-agents/agents/measure-agent.ts` → **`factoryMeasureAgent`**: the base.
    Given `{ subject, measurements: MeasurementSpec[], category, name, description }`
    it builds a PTRR agent (identity = "you MEASURE an already-synthesized artifact;
    you do not synthesize or alter it; emit an honest measurement per spec with a
    source-safe rationale") whose output is
    `{ measurements: [{ measurementKind, magnitude?, volume, rationale }], summary }`.
  - `generic-agents/agents/measure-agent-absolutes.ts` →
    **`factoryMeasureAgentAbsolutes`**: calls `factoryMeasureAgent` with
    `category:'absolute'` and the absolutes framing ("absolutes are INTRINSIC — they
    depend only on the artifact itself, never on any reader, demand, or market").
    (The sibling `factoryMeasureAgentNeedinesses` is Gate 4.)
  - `pipelines/asset-pack/.../agent-measure-absolutes.ts` →
    **`agent-measure-absolutes`**: calls `factoryMeasureAgentAbsolutes` with the
    asset-pack absolutes catalog, lens-parameterized now (deposit | read) so Gate 4
    only finalizes the read lens — it does not restructure. Wrapper unwraps the PTRR
    envelope (F27) and stores to the execution.
- **Source-safety.** The measurer reasons over the source-safe patch DESCRIPTOR
  (`fileChanges` path+op, `patchSummary`) and Discovery comprehension — NEVER raw
  source. Size magnitudes are estimates/derivations, not AST reads of protected
  code. Telemetry withholds content as ever (`sourceSafeStreamEvent`).
- **Deterministic fallback.** When real inference is disabled
  (`isAssetPackRealInferenceEnabled() === false`), the absolutes are computed
  deterministically from the patch descriptor (`file-span` = `fileChanges` length;
  function/type counts estimated from covered-path and summary signal; correctness =
  confidence; semantic-volume = normalized size composite), preserving the
  source-safe, no-network test/preview path.

### Gate-3 depositing closure — tool-measured absolutes, decision-grade cards, config cleanup (Garrett, 2026-06-27)

Closes Gate-3 depositing: the absolutes are MEASURED by real static analysis (not
model guesses), the `/deposit` cards carry everything a technical knowledge-owner
needs for the deposit / no-deposit decision, and the superfluous pipeline config is
removed. All depositing agents/prompts/step-schemas must synthesize legitimately
informed AssetPacks, generically across repositories of all shapes and sizes.

- **Legitimate tool-based absolutes.** Sizes are MEASURED, not estimated by the model.
  A `SourceStaticAnalysisTool` (an `ExecutionTool`) parses the available source with
  language-generic regex fact-extraction inspired by the demonstration
  (`protocol-demonstration/src/bitcode-demo.js`: symbol / path / config-key
  extraction + per-unit token counts), producing measured counts — functions, types,
  symbols, config keys, lines, tokens — and per-language densities
  (functions/types per file). Individual analyses, composed together in the measurer.
- **Source reality.** The deposit-options run has NO full clone (the clone agent
  short-circuits when `repositoryFullName` is supplied), so the available source is
  the inventory SAMPLES (real, truncated source) + the path list. The tool therefore
  MEASURES density from the sampled source and applies it to the AP's EXACT covered
  file set: `file-span` exact; function/type counts = measured-density × covered-file
  count by language; `coverageRatio` reported for honesty. The SAME tool parses richer
  source verbatim when present (a future full-clone delivery path), so the measurement
  is generic across repo shapes/sizes and degrades honestly on sparse source.
- **Registry add/replace hierarchy (the primitive).** Tools register through
  `AgentToolsRegistry.registerTool(key, tool, priority)` — priority-keyed: same
  priority REPLACES, higher priority OVERRIDES; resolution is local-then-parent
  (children override parents). The base generic analyzer registers at priority 0;
  specialized / augmenting analyzers register at higher priority WITHOUT replacing the
  base. `agent-measure-absolutes` resolves the tool (local-then-parent) and runs it.
- **The measurer uses the tool.** `agent-measure-absolutes` now grounds on the
  static-analysis report: sizes come from the report (authoritative — the agent
  reports measured counts, it does not invent them); `correctness-estimate` and
  `semantic-volume` are the agent's grounded judgment over the report + the Discovery
  comprehension. The deterministic fallback computes ALL absolutes from the report.
- **Decision-grade AP cards.** Each `/deposit` card maximizes the deposit / no-deposit
  decision by showing what Bitcode RECEIVES if the AssetPack is deposited:
  1. the synthesized AP CONTENTS — the source-safe patch descriptor (`fileChanges`
     path+op + `patchSummary`): what knowledge/edits the AP encodes; and
  2. the PROVENANT SOURCE — the covered source files (`coveredSourcePaths`, raw paths)
     that become available to Bitcode for future reader settlement.
  Both surfaced prominently (not buried), framed as "if deposited, Bitcode receives."
  Shown to the DEPOSITOR, who owns the source — the source-safety law constrains
  leakage to readers/telemetry, NOT the owner reviewing their own repository. The
  candidate / option projection carries the patch descriptor + covered paths to the
  client (front+back synchronized).
- **Config cleanup.** The full SDIVF pipeline is the ONLY deposit synthesis path:
  remove `BITCODE_DEPOSIT_SYNTHESIS_PIPELINE`, the bounded-synthesis branch, and the
  zero-options bounded fallback in the deposit route; Setup → Discovery →
  Implementation → Validation → Finish always runs (Validation — measurement +
  quality — is never optional). Correct the route's dead `PROFILE=bounded` phrasing
  in the real-inference-required message (profiles were removed in F26-A).

### Gate-3 HOST architecture — the primitive Host, its kinds, in-host execution (Garrett, 2026-06-27)

The synthesis pipeline runs WITHIN a HOST — a real box with git, a filesystem, and
command exec. (Every host has these; there is no "git-less" host. The earlier
dev/prod, serverless-can't-clone, and read-files-out-per-file framings were WRONG and
are superseded by this section.)

The Host is a PRIMITIVE — `BitcodePipelineHost` (`@bitcode/host-generics`; BC barrel
`@bitcode/pipeline-hosts`):
- `capabilities`: a HOST CAPABILITIES descriptor — `hostKind` (`'local' | 'sandbox'`),
  `clone` + `filesystem` + `exec` (TRUE for every host), `ephemeralFilesystem`,
  `defaultWorkingDirectory`; a SandboxHost additionally carries `sandboxProvider`
  (`'vercel' | 'aws'`).
- `provisionRepository(source)` → checks out the FULL working tree at the revision
  (every blob, verbatim) into the host working directory → a `BitcodeHostWorkspace`:
  `listFiles()` (tracked source files), `readFile(path)` (verbatim content),
  `runCommand(...)`, `dispose()`.
Because the pipeline runs WITHIN the host, the workspace is the host's LOCAL checkout —
read locally, NEVER across a process/network boundary. The pipeline (Setup → … →
Validation) speaks only to the primitive, so its behavior is identical on every host.

**Hierarchy (primitive → base):**
```
@bitcode/host-generics                         # BitcodePipelineHost, SandboxHost
  → @bitcode/generic-hosts-local               # LocalHost (was InlineHost)
  → @bitcode/generic-hosts-vercel-sandbox      # VercelSandboxHost + host surface
```

**HostKinds — two implementations of the primitive:**
- **LocalHost** (`@bitcode/generic-hosts-local`) — runs the pipeline in the current box;
  provisions via a real `git clone` of the full tree to a local working dir (Node-fs).
- **SandboxHost** (`@bitcode/host-generics`) — abstract sandbox base; runs the pipeline
  inside a provisioned, isolated box that has git + FS, so within it the checkout is
  local exactly as for LocalHost. Providers:
  - **Vercel** (`VercelSandboxHost` in `@bitcode/generic-hosts-vercel-sandbox`, IMPLEMENTED)
  - **AWS** (`AwsSandboxHost`, STUBBED) — provider seam; not yet implemented.
  Provisioning AND the pipeline both run IN the box; nothing is read out of it per-file.

**Selection** is by CONFIGURED HostKind — not by environment, and with no dev/prod /
local/remote terminology. `selectDepositHostKind(env)` returns `'local' | 'sandbox'`
from `BITCODE_PIPELINE_HOST` (explicit), defaulting to `local` (`inline` accepted as a
deprecated alias of `local`); a SandboxHost's provider comes from
`BITCODE_SANDBOX_PROVIDER` (`'vercel' | 'aws'`, default `vercel`).
`resolveDepositPipelineHost()` constructs LocalHost for hostKind `local`. The
operator chooses which host runs the pipeline.

**Source provisioning + measurement:** the host run provisions the full checkout on
the configured host at run start (consistent with a box being created WITH its git
source — provisioning precedes the pipeline phases); the Setup clone agent then
confirms source-present. The inventory is built FROM the checkout:
`AssetPacksSynthesisSourceInventory` = `paths` (all tracked files) + `samples` (bounded
excerpts for the prompts) + `sources` (every tracked file's verbatim content, type
`AssetPacksSynthesisSourceFile {path, content}`, for measurement). `readWorkspaceSources(workspace, {paths?})`
bridges the checkout to `{path, content}[]`; `provisionDepositSourceInventory({host, …})`
(`uapi/lib/deposit-source-provisioning.ts`) orchestrates provision → read → dispose.
`applyExclusionsToInventory` filters `paths` + `samples` + `sources` fail-closed
(protected-IP paths are never measured, sampled, or carried). The GitHub-API sample
inventory (`buildSourceInventory`) is RETIRED; the `cloneRepository` metadata stub and
the Setup clone-agent short-circuit are superseded by the primitive's real provisioning.
Source-safety unchanged: the checkout lives ON the host; only source-safe measurements +
the source-safe patch/contents descriptors leave it. "Every blob, verbatim" = the full
WORKING TREE at the revision; `depth: 1` already yields it (full history `depth: 0` is a
separate, unneeded axis).

### Gate-3 implementation index — concrete artifacts (gate-closure completeness; Garrett, 2026-06-27)

The concrete artifacts implementing the Gate-3 spec above (so every G3 implementation
is named in spec for closure):

- **Measurement — absolutes.** `packages/agent-generics`: `factoryMeasureAgent` (base) +
  `factoryMeasureAgentAbsolutes`; `MeasureAgentOutputSchema` (reading
  `{measurementKind, magnitude?, volume, rationale}`). `packages/pipelines/asset-pack`:
  `factoryAssetPackMeasureAbsolutesAgent(lens)` → `agent-measure-absolutes`;
  `measureAssetPackAbsolutes(patch, {lens, execution, sources})` (sizes authoritative
  from the tool; correctness/semantic-volume the agent's grounded judgment;
  `computeAbsolutesFromReport` deterministic fallback; `mergeReportAndReadings`).
  `ASSET_PACK_ABSOLUTES_CATALOG` (function-count, type-count, file-span,
  correctness-estimate, semantic-volume; weights sum to 1).
  `AssetPackCandidateMeasurement {measurementKind, label, weight, volume, category, magnitude?, unit?}`.
- **Measurement — static analysis.** `SourceStaticAnalysisTool`
  (`agents/validation/source-static-analysis-tool.ts`): `analyzeStaticSource` /
  `analyzeStaticSourceFile` (language-generic regex by extension ts/js/py/rs/go/java/rb +
  generic fallback; functions/types/symbols/config-keys/lines/tokens; density applied to
  the covered set; `coverageRatio`). Registry: `registerSourceStaticAnalysisTool` /
  `resolveSourceStaticAnalysisTool` (priority add/replace, local-then-parent).
- **Validation wiring.** `runDepositValidationAgent` measures each pack via
  `measureAssetPackAbsolutes` (sources = `inventory.sources`), attaches `pack.absolutes`
  in place, re-stores `implementation:options`/`implementation:assetPacks`.
  `validateDepositSynthesisOptions` PREFERS `option.absolutes` (else the legacy catalog)
  and carries `candidate.patch`.
- **Neediness.** `computeNeediness(demand, saturation)` + `buildNeedinessFromSignal`
  (asset-packs-synthesis.ts); the Implementation `deposit-asset-pack-synthesis-agent`
  emits `needinessSignal`, grounded in the Discovery `deposit-depository-search-agent`
  (likelyReadTopics / demandAlignment / underservedTopics).
- **Decision-grade card.** `AssetPackPatchDescriptor {fileChanges:[{path,op}], patchSummary}`;
  `AssetPackCandidate.patch`; `DepositAssetPackOption.contents
  {patchSummary, fileChanges, provenantSourcePaths, provenantSourceCount}` + `roots.contentsRoot`,
  built by `buildRealDepositAssetPackOptionSynthesis`; the `/deposit` card renders the
  "If deposited, Bitcode receives" panel.
- **Host + provisioning.** `packages/pipeline-hosts`: `BitcodePipelineHost` /
  `BitcodeHostWorkspace` / `BitcodeHostCapabilities` (`host.ts`); `LocalHost`;
  `SandboxHost` + `VercelSandboxHost` (Vercel provider) + `AwsSandboxHost` (stub);
  `readWorkspaceSources`. `uapi/lib/deposit-source-provisioning.ts`:
  `selectDepositHostKind`, `resolveDepositPipelineHost`, `provisionDepositSourceInventory`.
- **Config.** `BITCODE_DEPOSIT_SYNTHESIS_PIPELINE` removed (full SDIVF pipeline only;
  Validation — measurement + quality — never skipped).

### Gate-3 #25 — SandboxHost in-box deposit dispatch (Garrett, 2026-06-27; cancel+auth hardened 2026-07-08)

SandboxHost deposit runs the synthesis pipeline INSIDE the box (the asset-pack
host already runs `assetPackPipeline` in-box for read-fit via a runner that imports
the live packages and executes the full SDIVF). Deposit reuses that mechanism:

- **Host deposit mode.** `buildAssetPackSandboxHostPlan` accepts `synthesizeMode`
  (`'deposit' | 'read'`) + the deposit STEERING (obfuscations, protected-IP exclusions,
  demand context); these flow into `PipelineHostManifest` and the in-box runner
  INPUT (`synthesizeMode`, steering). The in-box pipeline resolves deposit mode
  (`resolveSynthesizeAssetPacksMode` reads `input.synthesizeMode`) and runs the deposit
  SDIVF, reading the box's LOCAL checkout (the box was created WITH the git source, so
  the working tree is present — the clone agent confirms source-present). The runner
  surfaces the synthesized `implementation:options` in `evidence.json` as
  `depositOptions` (source-safe option metadata; the measure-agent's absolutes are
  already attached by the Validation phase IN the box).
- **Ephemeral boxes.** Deposit one-shots create sandboxes with `persistent: false`
  (no snapshot storage on stop). Auth: prefer `VERCEL_OIDC_TOKEN` (local: `vercel env
  pull`; automatic on Vercel); fallback `VERCEL_TOKEN` + `VERCEL_TEAM_ID` +
  `VERCEL_PROJECT_ID`. `assertVercelSandboxAuthAvailable` fails closed before create.
- **Route dispatch.** When `BITCODE_PIPELINE_HOST=sandbox`, the deposit route
  dispatches via `runDepositInBoxHost` → `VercelSandboxPipelineHost.runHostPlan`
  instead of LocalHost provision + in-process SDIVF; it reads `evidence.depositOptions`,
  runs the SAME pure projection (`validateDepositSynthesisOptions` +
  `buildRealDepositAssetPackOptionSynthesis`) and persists the deposit option
  synthesis. `resolveDepositPipelineHost` is **inline-only** (throws if hostKind is
  sandbox — callers must use the host path). On `sandbox-created`, the route
  persists `context.sandboxId` on the running execution row for cancel.
- **Cooperative cancel.** See Gate-3 #26.
- **Parity of result.** LocalHost and SandboxHost produce the SAME deposit option
  synthesis; only WHERE the pipeline runs differs. Real-sandbox execution is verified
  against deployed sandbox infra; host plan-building + route dispatch + projection
  are unit-tested with a mocked host.

### Gate-3 #26 — Cooperative run cancel (Garrett, 2026-07-08)

Deposit (and any agentic) runs are cancelable without killing mid-token LLM streams.

**Law**

1. **User authority.** A depositor who owns the `executions` row may cancel while
   `status === 'running'`. Terminal rows (`completed` | `failed` | `interrupted` |
   `cancelled`) are not re-cancelled (already-cancelled is idempotent 200).
2. **Row is authority.** Cancel writes `executions.status = 'cancelled'`,
   `completed_at`, source-safe `error.message`, and `context.cancelledAt` /
   `context.cancelReason`. Background workers MUST NOT overwrite a cancelled row
   with `failed` or `completed`.
3. **Event.** A source-safe `execution_events` status row (`message`, `cancelled: true`)
   is inserted so the deposit telemetry accordion shows the cancel.
4. **Cooperative abort.** Background deposit `runSynthesis` polls
   `assertExecutionNotCancelled` between major stages (auth, provision, pipeline,
   validate). Sandbox detached command polls call `shouldAbort` each interval and
   return exit code 130 / outcome `'cancelled'`, then `sandbox.stop()`.
5. **Sandbox stop.** If `context.sandboxId` is present, cancel best-effort stops the
   box via `Sandbox.get` + `stop` (in addition to host `finally` stop).
6. **UI.** While a synthesis is running, Telemetry shows **Cancel run**; on success
   the detail shows a Cancelled badge and analytics fires
   `deposit_synthesis_cancelled` (duration only — no identifiers).
7. **Not cancel.** Orphan sweep still maps silent stuck rows → `interrupted` (not
   cancelled). Deleting activity anchors is unrelated.

**API**

- `POST /api/executions/[runId]/cancel` body optional `{ reason?: string }` (≤280 chars)
- Auth: session user must own the row
- Responses: 200 cancelled (or already cancelled), 401 unauthenticated, 404 not
  found/not owned, 409 not running

**Implementation symbols**

- `uapi/lib/execution-cancel.ts` — `cancelUserExecution`, `assertExecutionNotCancelled`,
  `ExecutionCancelledError`, `isExecutionCancelled`
- `uapi/app/api/executions/[runId]/cancel/route.ts`
- Deposit route cooperative checks + sandbox `shouldAbort`
- `VercelSandboxPipelineHost` `shouldAbort` + `sandbox-cancelled` events
- `DepositPageClient` Cancel run control

### Gate-3 depositing PARITY MATRIX (gate-closure audit; Garrett, 2026-06-27)

Spec ↔ implementation ↔ tests parity for every Gate-3 depositing capability.
Parity: ✅ specified + implemented + tested · 🟦 specified + implemented as a stub
(intentional) · ⚠️ specified, implementation partial · ❌ specified, not implemented.

| # | Capability | Implementation (symbol) | Tests | Parity |
|---|---|---|---|---|
| 1 | measure-agent base | `agent-generics` `factoryMeasureAgent` | measure-agent.test | ✅ |
| 2 | measure-agent-absolutes | `factoryMeasureAgentAbsolutes` | measure-agent.test | ✅ |
| 3 | concrete absolutes measurer | `factoryAssetPackMeasureAbsolutesAgent(lens)` | agent-measure-absolutes.test | ✅ |
| 4 | absolutes catalog (5 measures, Σweights=1) | `ASSET_PACK_ABSOLUTES_CATALOG` | agent-measure-absolutes.test | ✅ |
| 5 | measurement shape (category/magnitude/unit) | `AssetPackCandidateMeasurement` | agent-measure-absolutes.test | ✅ |
| 6 | size-authoritative + judgment + fallback | `measureAssetPackAbsolutes` / `computeAbsolutesFromReport` / `mergeReportAndReadings` | agent-measure-absolutes.test | ✅ |
| 7 | static analysis (language-generic) | `SourceStaticAnalysisTool` / `analyzeStaticSource` | source-static-analysis-tool.test | ✅ |
| 8 | tools registry add/replace | `register/resolveSourceStaticAnalysisTool` | source-static-analysis-tool.test | ✅ |
| 9 | Validation measures + attaches absolutes | `runDepositValidationAgent` | asset-pack suite (validation) | ✅ |
| 10 | options prefer formal absolutes + carry patch | `validateDepositSynthesisOptions` | agent-measure-absolutes.test, asset-packs-synthesis.test | ✅ |
| 11 | neediness (preview) | `computeNeediness` / `buildNeedinessFromSignal` | neediness.test | ✅ |
| 12 | neediness signal grounded in depository search | `deposit-asset-pack-synthesis-agent` / `deposit-depository-search-agent` | depository-search(.tool).test | ✅ |
| 13 | patch descriptor carried to candidate | `AssetPackPatchDescriptor` / `AssetPackCandidate.patch` | asset-packs-synthesis.test | ✅ |
| 14 | option decision payload | `DepositAssetPackOption.contents` + `roots.contentsRoot` | asset-packs-synthesis.test | ✅ |
| 15 | card "If deposited, Bitcode receives" | `DepositPageClient.tsx` | depositPageClient.test | ✅ |
| 16 | full SDIVF pipeline only; Validation never skipped | deposit route (flag removed) | depositSynthesizeOptionsRoute.test | ✅ |
| 17 | primitive Host + capabilities + workspace | `BitcodePipelineHost` / `BitcodeHostWorkspace` | inline/sandbox-host.test | ✅ |
| 18 | LocalHost (real clone + Node fs) | `LocalHost` | local-host.test | ✅ |
| 19 | SandboxHost + Vercel provider | `SandboxHost` / `VercelSandboxHost` | sandbox-host.test | ✅ |
| 20 | AWS provider seam | `AwsSandboxHost` (stub: provision throws) | sandbox-host.test | 🟦 |
| 21 | checkout → sources bridge | `readWorkspaceSources` | inline/sandbox-host.test | ✅ |
| 22 | HostKind selection (configured, not env) | `selectDepositHostKind` / `resolveDepositPipelineHost` | depositSourceProvisioning.test | ✅ |
| 23 | full inventory (sources+samples) + fail-closed exclusions | `provisionDepositSourceInventory` / `applyExclusionsToInventory` | depositSourceProvisioning.test, asset-packs-synthesis.test | ✅ |
| 24 | deposit provisions full checkout via Host | deposit route + `LocalHost` path | depositSynthesizeOptionsRoute.test | ✅ |
| 25 | SandboxHost IN-BOX deposit dispatch (run the pipeline in the box) | host deposit mode (`synthesizeMode` + steering → in-box runner; `depositOptions` in evidence) + `runDepositInBoxHost` + route hostKind branch; ephemeral `persistent:false`; OIDC/token auth fail-closed | asset-pack-host.test, depositSourceProvisioning.test, depositSynthesizeOptionsRoute.test, vercel-sandbox-host.test | ✅* |
| 26 | Cooperative run cancel | `POST /api/executions/[runId]/cancel` + `execution-cancel.ts` + deposit route polls + sandbox `shouldAbort` + UI Cancel run + `deposit_synthesis_cancelled` analytics | executionCancelRoute.test, vercel-sandbox-host.test (abort), depositPageClient (cancel control) | ✅ |
| 27 | Run configuration locked above telemetry in run detail | `DepositPageClient` config above telemetry; `disabled` when `synthesisRunId` set | depositPageClient.test | ✅ |
| 28 | Formal absolutes fail-closed (no placeholder catalog fallback) | `validateDepositSynthesisOptions` requires `absolutes[]` | agent-measure-absolutes.test, asset-packs-synthesis.test | ✅ |
| 29 | Map-tree LLM token rollup | `sumLlmTokensFromExecutionTree` | asset-packs-synthesis-pipeline.test | ✅ |
| 30 | Full deposit SDIVF integration under test (boundary LLM mock) | `BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST` + deposit-sdivf-pipeline-integration.test | deposit-sdivf-pipeline-integration.test | ✅ |
| 31 | Deposit implementation agent key (telemetry clarity) | `implementation:deposit-asset-pack-synthesis` | synthesize-asset-packs-phase-rosters.test | ✅ |

✅* = wired + unit-tested with a mocked host (host plan-building, the dispatch, the
option projection); real in-sandbox execution is verified against deployed sandbox infra.

**Gate-3 product defaults (closing wave):**
- Default xAI model: **`grok-build-0.1`** (`packages/generic-llms` defaults + xAI provider).
- DIV **maxIterations = 1** (single Discovery→Implementation→Validation pass).
- LLM call timeout default **180s** (`BITCODE_LLM_CALL_TIMEOUT_MS`).
- Empty Obfuscations: **skip** Setup input-comprehension LLM (empty guidance stored).
- Settled-Depository demand: estimatable or **Unestimatable** (no hardcoded demand).
- Full-stack: unestimatable demand does not force Positive ROI options = 0; sub-critical
  deposit authority does not force permanent Required denials = 2 before review.

**Gate 3 closed for product law + implementation.** Remaining ops (optional):
- **Deployment config**: set `BITCODE_PIPELINE_HOST=sandbox` on prod when durable
  in-box runs are desired (`@vercel/sandbox`, OIDC or token+team+project).
- **Live operator smoke**: one scoped deposit (Forced Inclusions recommended on
  large monorepos) + cancel smoke; fill `BITCODE_V48_QA.md` §6 runbook when convenient.

These ops items do **not** block Gate 3 PR merge into `version/v48` once CI is green.

## Non-goals during V48 opening

- Do not implement V48 product behavior from this notes-only opening.
- Do not rewrite V47 promoted canon except through an explicit addendum.
- Do not expose raw source, unpaid AssetPack source, secrets, wallet private
  material, private settlement payloads, raw prompts, or raw provider responses.
- Do not collapse estimate, quote, observed payment, final settlement,
  contributor allocation, delivery, compensation, and repair states.
- Do not launch value-bearing mainnet settlement in V48 opening work.
- Do not treat notes-only V48 material as stronger than active V47 protocol law.

## Frontend component architecture + Terminal eradication workstream (Garrett, 2026-07-11)

**Status:** active on `version/v48` (direct version-branch workstream, not a
numbered product gate). Every commit for this workstream is
`(specification-implementation)`: specify in the V48 family + implement in the
same commit.

**Objective:** extraordinary maintainability — modular packages, type
enforcement, tests, and clear naming targets (7 experiences + base layers).

### Accepted decisions

1. **Seven experiences:** Marketing (`/`), Packs (`/packs`), Reads (`/reads`),
   Deposits (`/deposits`), Docs (`/docs`), Conversations (structure persists;
   full commercial UX deferred post-V48), Auxillaries.
2. **Three base layers:** `Shadcn*` (root re-exports) → `Bitcode*` (theme +
   app-wide) → experience-specific prefixes. Strict import direction; no
   experience imports another experience.
3. **Directories:** `uapi/components/{shadcn,bitcode,marketing,packs,reads,
   deposits,docs,conversations,auxillaries}/` (not under App Router pages as
   routes). Thin page shells remain under `uapi/app/...`.
4. **Pipeline** replaces product **Execution** / **Terminal** UI and domain
   names for run surfaces (`BitcodePipeline*`, experience extensions). Ledger
   **journal/transaction** vocabulary stays for BTD journal rows.
   `execution-generics` (agent/PTRR) is not product Pipeline — do not blind-rename.
5. **Terminal eradication:** ~96 modules under `uapi/app/terminal/`; only ~15
   are live-imported by deposits/reads/auxillaries/conversations. Relocate live
   modules first, then delete cockpit-only residue. `/terminal` becomes
   redirect-only (default `/packs`) then removable.
6. **Package-first:** generalizable pure logic leaves uapi for `packages/`
   (wallet, cancel/orphan-sweep, analytics, pipeline read-models when non-React).
7. **HTTP:** keep `/api/executions/*` stable until consumer audit; rename
   internal modules and UI first.
8. **Conversations redirect target** after Terminal death: `/packs` (matches
   post-auth landing law) unless a later conversations shell ships.
9. **God clients:** explode `DepositPageClient` / `ReadPageClient` / large
   marketing sections into experience subcomponents + hooks + models (SRP).

### Phased plan (implementation sequence)

| Phase | Outcome |
| --- | --- |
| 0 | Law in SPEC/NOTES/DELTA/PARITY + docs; component dir scaffold; product routes + BTD journal/operational-health de-terminal naming with temporary aliases |
| 1 | `components/base/{shadcn,bitcode}` → `components/{shadcn,bitcode}`; `Shadcn*` exports |
| 2 | `bitcode/execution` → `bitcode/pipeline`; Pipeline naming in shared UI |
| 3 | Relocate 15 live terminal modules into Bitcode/experience homes; deposits/reads import zero `@/app/terminal/*` |
| 4 | Modularize god clients; move experience components into `components/{experience}` |
| 5 | Kill Terminal page; redirects; delete ~81 dead modules + terminal-only tests |
| 6 | Executions corridor → Pipeline (UI + internal API modules) |
| 7 | Package extractions + hygiene |
| 8 | Parity closeout + eslint bans on new Terminal imports |

### Live terminal modules (must relocate, not delete first)

`terminal-activity-history`, `terminal-run-data`, `terminal-run-activity`,
`terminal-repository-context`, `terminal-transaction-query`, `terminal-routes`,
`terminal-deposit-read-workbench`, `terminal-enterprise-reading-ux-state`,
`bitcode-transaction-readiness`, `terminal-shell-bridge`,
`TerminalTransactionsTable`, `TerminalRepositoryContextPanel`,
`TerminalReadScenarioPanel`, `TerminalDepositReadWorkbench`,
`TerminalOpenAuxillariesButton`.

### Phase 0 landing

- SPEC: frontend component + Terminal eradication law.
- DELTA/NOTES/PARITY: workstream recorded.
- Docs: `internal-docs/BITCODE_FRONTEND_ARCHITECTURE.md`,
  `uapi/ARCHITECTURE.md`, `internal-docs/TERMINOLOGY.md` updated.
- Scaffold: `uapi/components/{shadcn,bitcode,...}` READMEs.
- Implementation: `product-routes` as Bitcode-owned route helpers;
  `@bitcode/btd` `journal` + `operational-health` as canonical names with
  Terminal-named shims for callers.

### Phase 1 landing (tree move)

- Moved `uapi/components/base/shadcn/*` → `uapi/components/shadcn/*`.
- Moved `uapi/components/base/bitcode/*` → `uapi/components/bitcode/*`.
- Rewrote imports (`@/components/base/{shadcn,bitcode}` →
  `@/components/{shadcn,bitcode}`) across uapi/packages/docs.
- Removed empty `uapi/components/base/`.
- Deferred: `Shadcn*` export renames; `execution/` → `pipeline/` (Phase 2).

### Phase 3 progress (live Terminal module relocate)

- `repository-context` → `bitcode/pipeline/models/repository-context.ts`
- `pipeline-run-data`, `pipeline-run-activity`, `pipeline-transactions`,
  `transaction-readiness` → `bitcode/pipeline/models/`
- `BitcodePipelinesTable` (was TerminalTransactionsTable) →
  `bitcode/pipeline/`
- `AuxillariesOpenButton` (was TerminalOpenAuxillariesButton) →
  `components/auxillaries/`
- Deposits / Reads / Auxillaries product surfaces import the Bitcode paths for
  the above; `app/terminal/*` retains shims for residual cockpit callers.
- `pipeline-selection-query` (was terminal-transaction-query) →
  `bitcode/pipeline/models/pipeline-selection-query.ts`
- `enterprise-reading-ux-state` → `components/reads/models/`
- `pipeline-activity-history` (was terminal-activity-history) →
  `bitcode/pipeline/models/pipeline-activity-history.ts`
- `bitcode-shell-bridge` (was terminal-shell-bridge) →
  `bitcode/layout/bitcode-shell-bridge.tsx` (`BitcodeShellBridgeProvider`)
- Reads workbench stack relocated:
  - `reads/models/{deposit-read-workbench,read-scenarios,enterprise-reading-ux-state}`
  - `reads/panels/{ReadsDepositReadWorkbench,ReadsRepositoryContextPanel,ReadsReadScenarioPanel}`
  - supporting `bitcode/pipeline/{shell-reading,cards/*}`
- **Still Terminal-only for product surfaces:** conversations
  `buildTerminalHref` until Phase 5 redirect/eradication. Deposits/reads
  product pages no longer import Terminal modules except via residual
  transitive deps inside relocated panels (workspace explainers, pipeline
  host client, protocol projection).

### Phase 5 landing (Terminal eradication)

- `/terminal` page redirects to `/packs` (query-preserving); next.config also
  redirects `/terminal` and `/executions` → `/packs`.
- Auxillary overlay root, nav, login default, conversations, orbitals links,
  OAuth mock, and handoff hrefs target `/packs`.
- Residual shared modules relocated: workspace-explainers, pipeline-host-client,
  transaction-route-readiness, demonstration-witness-runtime.
- `TERMINAL_ROUTE` / `buildTerminalHref` alias Packs in product-routes.
- Cockpit modules may remain as shims/dead residual under `app/terminal/` until
  fully deleted; no product surface depends on the Terminal page client.

### Phase 2 landing (execution → pipeline UI tree)

- Moved `uapi/components/bitcode/execution/*` into `uapi/components/bitcode/pipeline/`.
- Rewrote imports `@/components/bitcode/execution/` → `.../pipeline/`.
- Agent/package `execution-generics` intentionally unchanged (not product Pipeline).

### Phase 4 landing (god-client modularization start)

- Extracted deposit/read format helpers to experience `models/*-format.ts`.
- Moved deposit route model, explainers, obfuscations icons, and
  DepositSourceSelection into `components/deposits/`.
- Moved read-route-model into `components/reads/models/`.
- App-route files retain shims; page clients remain orchestration shells
  (further section extraction continues as follow-up).

### Phase 4 progress — deposits + packs modular units (Garrett, 2026-07-13)

Deposit experience (SRP models/hooks/units; page client thinned):

| Extract | Path |
| --- | --- |
| Activity-ledger projections | `deposits/models/deposit-activity-ledger.ts` |
| Source criticality signals | `deposits/models/deposit-source-criticality.ts` |
| Settled demand shapes | `deposits/models/deposit-settled-demand.ts` |
| Route-session input builder | `deposits/models/deposit-route-input-builder.ts` |
| Preferred signer resolve | `deposits/models/deposit-preferred-signer.ts` |
| Run status mapping | `deposits/models/deposit-run-status.ts` |
| Source path/JSON helpers | `deposits/models/deposit-source-helpers.ts` |
| Live runs hook | `DepositPageClient/hooks/use-deposit-live-runs.ts` |
| Settled demand hook | `…/use-deposit-settled-demand.ts` |
| Network depository count | `…/use-deposit-network-depository-count.ts` |
| URL navigation hook | `…/use-deposit-url-navigation.ts` |
| Source list refresh button | `DepositSourceSelection/DepositSourceListRefreshButton.tsx` |
| Unit tests | `uapi/tests/depositActivityLedger.test.ts`, `depositSourceCriticality.test.ts`, `depositRunStatus.test.ts` |

Packs experience (thin page client):

| Extract | Path |
| --- | --- |
| Activity fetch hook | `PacksPageClient/hooks/use-packs-activity.ts` |
| Portfolio overview | `PacksPortfolioOverview/` |
| Activity master table | `PacksActivityMaster/` |
| Activity detail aside | `PacksActivityDetail/` |
| Payload types | `packs/models/packs-activity-types.ts` |

**Deposit experience modularization status:** `DepositPageClient` is
orchestration (~677 LOC) with models + hooks covering live runs, demand, URL,
VCS inventory, option actions, activity recording, and synthesis lifecycle.
Remaining markup density lives in single-purpose units (`DepositAssetPackOptions`
~749, `DepositSourceSelection` render ~682, aside/obfuscations panels) —
SRP-valid; further card splits optional. Shared bitcode/pipeline and
`packages/pipelines/asset-pack` deposit domain files are already package-shaped
and not page god-clients.

**Further landings (same modularization pass):**

| Extract | Path |
| --- | --- |
| VCS inventory hook | `DepositSourceSelection/hooks/use-deposit-source-vcs.ts` |
| Option review/admission | `DepositPageClient/hooks/use-deposit-option-actions.ts` |
| Activity ledger record/anchor | `DepositPageClient/hooks/use-deposit-activity-recording.ts` |
| Synthesis lifecycle (resume/adopt/dispatch) | `DepositPageClient/hooks/use-deposit-synthesis-lifecycle.ts` |

### Phase 6 landing (executions corridor)

- `/executions` and `/executions/:runId` redirect to `/packs` (next.config +
  app router pages).

### Workstream status (through all planned phases)

| Phase | Status |
| --- | --- |
| 0 Law + product-routes + BTD journal | closed |
| 1 shadcn/bitcode tree move | closed |
| 2 execution → pipeline UI tree | closed |
| 3 live Terminal module relocate | closed |
| 4 god-client modularization | in progress — deposits models/hooks + packs shell landed; deposit handlers/source inventory still thinning |
| 5 Terminal product eradication | closed (redirect + entrypoint rewire; residual shims/dead cockpit files remain) |
| 6 Executions → Packs redirects | closed |
| 7 Package extractions | deferred follow-up (wallet/lib package-ify still planned) |
| 8 Spec/parity ledger | updated in lockstep each commit |

### Phase 5 complete — Terminal deleted (no redirect)

- **`uapi/app/terminal/` removed entirely** — no page, no redirect, no shims.
- Product entrypoints use Packs/Deposits/Reads only; `TERMINAL_ROUTE` /
  `buildTerminalHref` removed from product-routes.
- Workspace surface no longer recognizes `/terminal`.
- Terminal-only jest tests and e2e specs deleted; jest allowlist cleaned.
- Residual type coupling removed from pipeline-activity-history (local
  processing-stats type; dead draft builders removed).

### Phase 7 package extractions

| Module | Package path |
| --- | --- |
| execution cancel | `@bitcode/api/pipelines/cancel` (`packages/api/src/pipelines/cancel.ts`) |
| orphan sweep | `@bitcode/api/pipelines/orphan-sweep` |
| product analytics | `@bitcode/observability/product-analytics` (+ uapi/lib copy for app/jest) |
| wallet local/client/oauth | `@bitcode/auth/{wallet-local,bitcoin-wallet-client,bitcoin-wallet-oauth-provider}` |
| supabase auth redirect | `@bitcode/auth/supabase-auth-redirect` |
| QA telemetry | `@bitcode/auth/qa-telemetry` |

uapi/lib retains thin re-export shims (or full analytics copy) for import stability.

### Modular source layout convention (Garrett, 2026-07-11)

Canonical filesystem and co-location rules live in
`internal-docs/BITCODE_SOURCE_LAYOUT.md` (also pointed from README, AGENTS.md,
`uapi/ARCHITECTURE.md`, `uapi/components/README.md`).

- Seven experiences + Shadcn/Bitcode bases
- Component units: `ComponentName/ComponentName.tsx` (not `index.tsx`) with
  co-located `hooks/`, `styles/`, `__tests__/`
- Domain pure logic prefers `packages/`; pages stay thin
- Terminal remains deleted


### Deposit full-stack modularization landing (Garrett, 2026-07-13 — aggressive pass)

**packages/pipelines/asset-pack**
- `depository-search` → types / scoring / evidence / normalize / run + barrel (1898→43)
- deposit option domain → types + helpers + shared `deposit-source-safe-utils`
- `depository-supply-index` → types / helpers / build-record / projections
- `asset-packs-synthesis` → types / catalogs / neediness / inventory / validate + barrel
- deposit agents → schema / prompts / checks co-located under agents/

**packages/pipeline-hosts**
- `asset-pack-host` → constants + runners templates + plan builder

**uapi deposits**
- Option card, source field grid, aside panels, obfuscations controls
- synthesize-options: parse body + dispatch modules; thin route

**uapi reads (deposit workbench)**
- ReadsDepositReadWorkbench orchestrator + hooks + stage panels
- deposit-read-workbench models split; evidence types/extract/row-builders

Public package export paths preserved. Jest deposit/depository/synthesis suites green.



## FAMILIARIZATION maintenance law (Garrett, 2026-07-13)

`BITCODE_SPECIFYING.md` §16.3.1 now requires `FAMILIARIZATION.md` to stay
current with structural changes (package families, inheritance hierarchy,
experience entry paths, product routes). Operational mirror: `AGENTS.md`.
This is part of Complete Implementation Derivability teaching surfaces, not a
parallel product-semantics canon.

## FAMILIARIZATION.md (codebase walkthrough)

`FAMILIARIZATION.md` is the in-repo deep map of packages, uapi, and inheritance
hierarchies (`*-generics` → `generic-*` → product specializations). It is a
teaching/navigation document, not stronger than `BITCODE_SPEC_V48.md`. Update it
when package families or experience entry paths change.


## Experience modularization wave (Garrett, 2026-07-13)

Working groups modularized remaining commercial experiences on `version/v48`:

| Experience | Result |
| --- | --- |
| Packs | Filter bar / table / detail sections; pure packs-format; thin page client |
| Reads | ReadPageClient ~273; repository field grid; read-route model facade; workbench hooks |
| Auxillaries | All panes ≤400 LOC; wallet/profile/org/interfaces/externals/surface units |
| Marketing | Large landing sections split into data/hooks/subcomponents |
| Docs | bitcode-docs-content → content modules + Docs* section components |
| Conversations | Overlay/rich-text/edge-case modularization (structure retained; commercial UX deferred) |

### Further god-module modularization (Garrett, 2026-07-13 — pass 2)

Remaining large marketing and conversations shells thinned further under
SOURCE_LAYOUT:

| Unit | Direction |
| --- | --- |
| `MarketingScreenshotSection` | Hero gallery, floating trio, how-it-works, entrance hook |
| `MarketingMarketplaceSection` | Candles, ticker, order book, detail, narrative, action pad |
| `MarketingCompletionCelebration` / `MarketingPipelinePhasePoetry` | Data modules |
| `MarketingBtdInvestmentExperience` | Value / coaching / projection panels |
| `ConversationsOverlay` | Header, main content, send + view-mode hooks (orchestration <500) |
| `ConversationsEnhancedRichTextInput` | Serialize/render helpers expanded |
| `ConversationsGithubSourceSelector` | Selection cascade hook |
| Edge-case handler | Real concern modules + thin class facade |

Navigation map: `FAMILIARIZATION.md`. Layout contract: `internal-docs/BITCODE_SOURCE_LAYOUT.md`.


## generic-* nested-package rule (Garrett, 2026-07-13)

Every `packages/generic-*` family is nested packages only (no family-root
`package.json`), matching `generic-agents/*`, `generic-tools/*`,
`generic-pipelines/*`.

`packages/generic-llms/` was flattened into:

```
xAI/ OpenAI/ Anthropic/ Google/ defaults/ registry/
```

`@bitcode/generic-llms` remains the registry aggregator for compatibility;
prefer `@bitcode/generic-llms-{xai|openai|anthropic|google|defaults}` when a
single surface is enough. Workspace globs include `packages/generic-llms/*`
and `packages/generic-doc-comment-plugins/*`.

## SDIVF base package (Garrett, 2026-07-13)

Pipeline inheritance hierarchy is now explicit:

```
@bitcode/pipelines-generics              # Pipeline / PhaseDelegator primitives
  → @bitcode/generic-pipelines-sdivf     # packages/generic-pipelines/SDIVF
    → @bitcode/pipeline-asset-pack       # SynthesizeAssetPacks (future SettleAssetPacks)
```

`factorySDIVFExecutorPipeline` / `factorySDIVFPipeline` / `SDIVFPhase` live in
`@bitcode/generic-pipelines-sdivf`. AssetPack imports the base package directly.
`pipelines-generics` re-exports for compatibility.

## Generation hierarchy + context/failsafes audit (Garrett, 2026-07-13)

Audit: `@bitcode/context` mixed process-global `GlobalContext` with failsafe
prepared-context types (`PreparedContext`, `prepareConciseContext`, chunking).
Those failsafe types now live with failsafes.

```
@bitcode/generation-generics
  → @bitcode/generic-generations-failsafes   # packages/generic-generations/failsafes
  → @bitcode/generic-generations-thinkings   # packages/generic-generations/thinkings
    → @bitcode/agent-generics                # PTRR agents; still hosts LLM-bound factories
      → @bitcode/pipeline-asset-pack         # product uses bases; does not reimplement
```

Physical move of `createFailsafeGenerationSequence` / Thinkings factories out of
agent-generics remains gated on inverting AgentExecution LLM coupling.

## Execution / Executor modularization + Context retirement (Garrett, 2026-07-13)

There is **no separate Context state**. Execution is the large state holder.

```
@bitcode/execution-generics              # Execution class + storage + registry
@bitcode/executor-generics               # Executor type primitive
  → @bitcode/generic-executors           # sequential, parallel, pipe, retry, resilient, …
  → @bitcode/generic-executions          # process-root Execution (was GlobalContext)
      → product pipelines / agents
```

- Combinators moved out of `execution-generics/src/executors` into
  `@bitcode/generic-executors` (stubs remain for BC deep paths).
- Process defaults: `initializeProcessRoot` / `getProcessRootExecution` on a
  registered process-root Execution (`process` namespace). BC aliases
  `initializeContext` / `getGlobalContext` remain on
  `@bitcode/generic-executions` and `@bitcode/context-generics`.
- `@bitcode/context` is a deprecated barrel over context-generics.
- Failsafe "prepared context" remains key-selection over Execution state
  (not a parallel bag).

## Pipeline hierarchy naming law (Garrett, 2026-07-13)

Type and factory names must always express full inheritance ancestry:

```
Pipeline                              # primitive
SDIVFPipeline                         # base + primitive
SynthesizeAssetPacksSDIVFPipeline     # specific + base + primitive
```

Canonical factories:
- `factoryPipeline` → `Pipeline`
- `factorySDIVFPipeline` / `factorySDIVFPipelineFromExecutors` → `SDIVFPipeline`
- `factorySynthesizeAssetPacksSDIVFPipeline` → `SynthesizeAssetPacksSDIVFPipeline`

Short aliases (`factorySDIVFExecutorPipeline`, `synthesizeAssetPacksPipeline`,
`runSDIVFPipeline`) are deprecated compatibility shims only.

## Measurement hierarchy modularization (Garrett, 2026-07-13)

```
Measurement                              # @bitcode/measurement-generics
  → MeasureAgent                         # generic-measurements/measure-agent
  → AbsolutesMeasureAgent                # generic-measurements/absolutes
  → NeedinessesMeasureAgent              # generic-measurements/needinesses (Gate 4 surface)
    → SynthesizeAssetPacksAbsolutesMeasureAgent  # asset-packs/synthesis
    → SettleAssetPacks…                  # asset-packs/settle (Gate 6 surface)
      → pipeline-asset-pack              # SDIVF host + static-analysis tools
```

Prepared catalogs (`ASSET_PACK_ABSOLUTES_CATALOG`, lens catalogs) live in
`@bitcode/asset-packs-synthesis`. `agent-generics` re-exports measure factories
for compatibility; prefer package-direct imports in new code.

## VCS hierarchy modularization (Garrett, 2026-07-13)

```
@bitcode/vcs-generics                      # packages/vcs-generics (was packages/vcs)
  → @bitcode/generic-vcs-github            # packages/generic-vcs/github
  → @bitcode/generic-vcs-gitlab
  → @bitcode/generic-vcs-bitbucket
  → @bitcode/generic-vcs-git               # Git operation bridge
```

Compatibility shims remain at `@bitcode/vcs`, `@bitcode/github`, `@bitcode/gitlab`,
`@bitcode/bitbucket`, `@bitcode/git`. Prefer hierarchy package names in new code.
`generic-tools/vcs` and `generic-agents-vcs` are tools/agents over the VCS layer,
not provider packages.

## Host hierarchy modularization + Local rename (Garrett, 2026-07-13)

```
@bitcode/host-generics                         # primitives (BitcodePipelineHost, SandboxHost)
  → @bitcode/generic-hosts-local               # LocalHost (renamed from InlineHost)
  → @bitcode/generic-hosts-vercel-sandbox      # VercelSandboxHost + PipelineHost host
    → @bitcode/pipeline-hosts                  # AssetPack host barrel + BC re-exports
```

HostKind `local` replaces `inline` (BITCODE_PIPELINE_HOST; `inline` accepted as alias).
Spec G3-4 tables updated to LocalHost / hostKind `local`.


## AssetPack hierarchy: generics + measured-patch (Garrett, 2026-07-13)

```
@bitcode/asset-pack-generics                         # primitive (protocol minimum)
  → @bitcode/generic-asset-packs-measured-patch      # MeasuredPatchAssetPack (only base)
      → asset-packs-pipelines / pipeline-asset-pack  # product
```

Measured-patch is the sole AssetPack implementation used by synthesize-deposits,
synthesize-reads, and settle-reads. Deposit option `contents` projects from
MeasuredPatchAssetPack (path+op patch + provenant paths; never raw source).

## Artifact hierarchy: generics + patch + product (Garrett, 2026-07-13)

```
@bitcode/artifact-generics                           # Artifact + ArtifactStorage contract
  → @bitcode/generic-artifacts-patch                 # PatchArtifact (path+op patchfiles)
      → @bitcode/asset-packs-synthesis               # AssetPackPatchArtifact (product)
@bitcode/artifacts                                   # S3/Supabase ArtifactStorage backend (BC)
```

Primitive storage requirements live in artifact-generics. Patch base stores
AssetPack path+op envelopes without requiring raw source. Product binds
`assetPackId`. Existing `saveArtifact` / `putArtifactAtKey` callers keep
`@bitcode/artifacts`.

## AssetPack product pipelines: no lens; Simple settle-reads (Garrett, 2026-07-13)

Removed the deposit|read **lens** on a single SynthesizeAssetPacks factory.
Three specific product pipelines (hierarchy names encode base):

```
@bitcode/generic-pipelines-sdivf / -simple
  → synthesize-deposits   SynthesizeDepositsSDIVFPipeline
  → synthesize-reads      SynthesizeReadsSDIVFPipeline
  → settle-reads          SettleReadsSimplePipeline
```

- **synthesize-deposits** — depositor repo → measured packs for Depository
- **synthesize-reads** — accepted Need → packs from Depository (for a read repo)
- **settle-reads** — Simple (linear) stages: validate → finalize BTC/BTD/rights →
  ship AssetPacks as PRs against the repository supplied when reading

`@bitcode/pipeline-asset-pack` retains agents/tools/domain helpers + a BC dual
entry for legacy callers. Prefer product packages for new routes.

## Generation vocabulary: FailsafeGeneration / ThinkingsGeneration (Garrett, 2026-07-13)

Legacy `FailsafeMetaSubStep` / `GenerationSubMetaSubStep` / `SubStep` naming retired
for active vocabulary. SubStep was the old term for Generation within a PTRR step;
Meta is not a term.

```
Generation (primitive)
  → FailsafeGeneration   # PCC / ChunkThenSum / Stitch kinds
  → ThinkingsGeneration  # Reason → Judge → StructuredOutput kinds
```

BC aliases remain on enums and execution classes. Prefer hierarchy names in new code.
Architecture interface: `PTRRStepGenerationArchitecture`.

## Host vocabulary: no "Harness" for Host (Garrett, 2026-07-13)

Product/runtime Host-domain identifiers no longer use the word **Harness**
(that term is reserved for other agentic meanings). Active renames include:

- `PipelineHarness*` → `PipelineHost*` (plan, manifest, mode, events, results)
- `runHarness` → `runHostPlan`
- `buildAssetPackSandboxHarness` → `buildAssetPackSandboxHostPlan`
- `runDepositInBoxHarness` → `runDepositInBoxHost`
- API route `/api/pipeline-harness` → `/api/pipeline-host`
- Paths `.bitcode/pipeline-harness` → `.bitcode/pipeline-host`
- Env: `BITCODE_*_HARNESS_*` → `BITCODE_*_HOST_*` / `BITCODE_PIPELINE_HOST_*` for run settings

Historical V2x–V47 specs retain prior wording.

## PTRR base Agent extraction (Garrett, 2026-07-13)

```
@bitcode/agent-generics                        # Agent primitive (factoryAgent, QuickAgent, substeps)
  → @bitcode/generic-agents-ptrr               # packages/generic-agents/PTRR (PTRRAgent base)
```

Preferred hierarchy names: `PTRRAgent`, `factoryPTRRAgent`.
BC: `factoryAgentWithPTRR` / `factoryAgentWithPTRRGenerations` re-exported from agent-generics.
Mirrors SDIVF extraction: pipelines-generics → generic-pipelines/SDIVF.

## MCP hierarchy modularization (Garrett, 2026-07-13)

```
@bitcode/mcp-generics                          # packages/mcp-generics (was executions-mcp primitives)
  → @bitcode/generic-mcps-bitcode              # packages/generic-mcps/bitcode (was executions-mcp/mcp-server)
```

Compatibility barrels: `@bitcode/mcp` → mcp-generics; `@bitcode/mcp-server` → generic-mcps-bitcode.
Active proof/catalog path strings and docs:refresh scripts point at the new layout.

