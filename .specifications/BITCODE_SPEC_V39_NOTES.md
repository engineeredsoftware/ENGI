# Bitcode Spec V39 Notes

## Status

- Version: `V39`
- V39 state: canonical promotion complete; V39 notes record accepted Depository, Reading UX, Need review, Finding Fits, preview/quote, settlement, telemetry, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V39`
- Canonical proof-source commit: `1fe583d781bd24f340e5bb89ecc67ef740cf018c`
- Draft proof-source commit: unbound until V39 promotion
- Current active draft target: `V39`
- Prior canonical anchor: `BITCODE_SPEC_V38.md`
- Prior generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, `.bitcode/v39-promotion-readiness-report.json`, V39 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V39_PROVEN.md` as the generated proof appendix for V39 promotion
- Source parity state: V39 source-side Depository supply indexing, enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry repair readback, interface parity, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V39 file family
- Spec companion: `BITCODE_SPEC_V39.md`
- Delta companion: `BITCODE_SPEC_V39_DELTA.md`
- Parity companion: `BITCODE_SPEC_V39_PARITY_MATRIX.md`
- Scope: V39 canonical notes for commercial Reading readiness over promoted V38 inference correctness canon
- Last fully realized canonical target preserved in source: `V39`

This NOTES file does not promote V39. It is binding draft guidance while V39 gates are in flight.

## Notes companion rule

This file is the V39 notes companion.
Requirements are binding for V39 gate work while `BITCODE_SPEC.txt` remains `V38`.

## Simplified-spec reading rule

Read `BITCODE_SPEC.txt` first.
If it points to `V38`, V38 is active canon and V39 is the active draft target only when this V39 SPEC family exists on a V39 branch.
Read `BITCODE_SPEC_V39.md`, this NOTES companion, the V39 DELTA, and the V39 PARITY matrix together before implementing inference work.

## Concise current-system reading

V38 is active canon and inference correctness is promoted.
V39 is the draft target that focuses on commercial Reading readiness across deposited source supply, the five-step enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding many-candidate depository search, source-safe AssetPack preview, deterministic quote, settlement, BTD rights transfer, post-settlement delivery, and operational telemetry/repair.

## Deferred from V38

V38 promoted the inference stack and its source-safe telemetry/disclosure law.
V39 should use that stack to close the commercial Reading product path end to
end, fully using Bitcode's existing pipeline, agent, prompt, execution, tool,
telemetry, registry, ledger, database, storage, wallet, and delivery primitives
without weakening any runtime boundary.

Source anchors already exist and must be audited before V39 implementation:

- `packages/agent-generics/src/steps/failsafe-sequence.ts` defines
  `FailsafeGenerationSequence` as prepare-concise-context, chunk-then-sum, and
  stitch-until-complete wrappers over `ThricifiedGeneration`.
- `packages/agent-generics/src/steps/thricified-generation.ts` defines
  `ThricifiedGeneration` as the strict Reason, Judge, StructuredOutput chain.
- `packages/agent-generics/src/agents/factories.ts` requires
  `factoryAgentWithPTRR` callers to provide an agent prompt plus complete
  Plan, Try, Refine, and Retry step prompt registries.
- `packages/tools-generics/src/Tool.ts`,
  `packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts`, and
  `packages/tools-generics/src/doc-code-tool/formatUsableTools.ts` define the
  doc-comment-backed tool prompt path that inference prompts must consume.
- `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`,
  `packages/pipelines/asset-pack/src/read-need.ts`,
  `packages/pipelines/asset-pack/src/depository-search.ts`, and
  `packages/pipelines/asset-pack/src/tools/*DepositorySearchTool*` define the
  current `ReadNeedComprehensionSynthesis` and
  `ReadFitsFindingSynthesis` contracts, tools, search result shape, and
  source-safe preview boundary.

Thricification remains the lowest-level inference call chain. It is the final
place where phase, agent, step, substep, tool-documentation, and generation
prompt registries are resolved, composed, interpolated, and constrained to the
typed output. Failsafe chains may prepare context, chunk large inputs, summarize
or stitch large outputs, retry repairable typed-output failures, and organize
execution ancestry state around those calls, but inside PTRR agents they must
delegate final reason, judge-reasoning, and structured typed response
production to `ThricifiedGeneration`.

Tools remain step-owned capability executions, not hidden children of
`ThricifiedGeneration`. Tool definitions must still be represented in final
prompts through the doc-comment `DocCodeToolPrompt` path, composed and
interpolated at the lowest inference point with the same source-safe telemetry
discipline as all other prompt material.

## Candidate V39 workstreams

- Make Depository supply operational for Reading: deposited source materials
  must be measured, embedded, indexed, rights-aware, searchable, repairable,
  and source-safe in all generated artifacts and logs.
- Implement the five-step enterprise Reading UX: request read, review
  synthesized Need, request Finding Fits, review source-safe AssetPack preview,
  buy AssetPack and settle.
- Make `ReadNeedComprehensionSynthesis` a persisted review loop with feedback
  and resynthesis. Accepted Need is the only admission path into Finding Fits.
- Make `ReadFitsFindingSynthesis` a runtime search pipeline over the whole
  available Depository, gathering many above-threshold candidate deposits before
  selected-fit provenance is handed into AssetPack synthesis.
- Make source-safe AssetPack preview sufficient for buyer review without IP leakage:
  show measurements, fit reasons, selected-fit provenance, quality posture,
  proof roots, deterministic BTC quote, and delivery posture while withholding
  source-bearing AssetPack content until settlement unlock.
- Make settlement, BTD rights transfer, contributor compensation, post-settlement
  delivery, ledger/database/object-storage synchronization, repair, and replay
  auditable as one paid boundary.
- Preserve V38 inference law throughout every Reading runtime surface. Pipeline
  phases, PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration,
  DocCodeToolPrompt, prompt benchmarking, disclosure tiers, and telemetry roots
  remain binding infrastructure, not optional implementation detail.
- Audit every inference point used by the Reading product. The audit must count
  base primitives and specific implementations separately: phase prompts, PTRR
  agent prompts, step prompts, Failsafe substep prompts, ThricifiedGeneration
  prompts, tool prompt definitions, prompt templates, interpolation bindings,
  expected context fields, raw outputs, parsed typed outputs, and repair/failure
  surfaces.
- Specify the exact execution stack for pipeline agents without overlapping
  names: PipelineExecution owns phases; PTRR agents own Plan, Try, Refine, and
  Retry steps; FailsafeGenerationSequence owns context preparation, large input
  handling, large output handling, and repair orchestration; ThricifiedGeneration
  owns Reason, Judge, and StructuredOutput inference calls; ToolExecution owns
  callable tools and tool input/output receipts.
- Require all PTRR agent steps to use practical FailsafeGenerationSequence
  layers above ThricifiedGeneration unless a source-backed exception is
  specified, tested, and justified. The default Reading stack should be
  PipelineExecution -> PTRR agent -> PTRR step -> FailsafeGenerationSequence ->
  ThricifiedGeneration -> provider call.
- Finish prompt and PromptPart benchmarking so semantically divided
  PromptParts and complete Prompts are both benchmarkable. V39 Gate 1 should
  inventory existing `benchmarks:` doc-comment metadata, the
  `packages/prompts/src/benchmarking/*` runner, and all Reading and
  conversation prompt surfaces, then define initial benchmark suites for every
  prompt part and prompt used by active inference.
- Complete prompt registry composition and interpolation rules from phase
  prompts through agent prompts, step prompts, substep prompts, final generation
  prompts, and tool documentation. The final inference call must expose the
  unrendered template identity, interpolated prompt, context bindings, selected
  tools, raw response, parsed output, and schema verdict to telemetry at the
  proper disclosure tier.
- Integrate this inference work with prior telemetry. Execution ancestry
  state-stack data must be written, read, prepared by Failsafe layers,
  interpolated into prompts, maintained through retries, and streamed as
  source-safe phase, agent, step, Failsafe, ThricifiedGeneration, tool, input,
  output, and typed-result events.
- Complete `ReadFitsFindingSynthesis` depository-search internals as the
  coupled second focus of V39. Fit-finding queries are inference-derived and
  must search throughout the Bitcode Depository using lexical, symbolic, path,
  metadata, measurement, embedding/vector, and provider-specific channels where
  appropriate.
- Harden the depository-search tool and primitive utility stack around source
  embeddings, measurement embeddings, metadata embeddings, query synthesis,
  ranking, verification, and AssetPack synthesis handoff. Existing OpenAI
  embedding policy (`text-embedding-3-small`, 1536 dimensions, cosine
  `match_deliverable_vectors`) is an active source anchor, and V39 may specify
  additional LlamaIndex, Pinecone, or provider-backed channels only when their
  boundaries, storage, credentials, telemetry, and tests are explicit.
- Preserve the economic carry-through from found fits to AssetPack settlement:
  selected fit deposits must remain traceable into source-safe preview,
  post-settlement delivery, contributor compensation, exact ledger/database
  synchronization, and proof receipts.
- Clarify how Bitcoin, GitHub, compute, storage, and build/process boundaries
  are represented in long-running inference and pipeline telemetry.
- Confirm that source-safe telemetry exposes prompt templates, interpolated
  prompts, raw provider responses, parsed typed results, repair attempts, and
  failed-output evidence only at their permitted disclosure tier.

The V39 acceptance posture is commercial Reading readiness: Bitcode's ability
to maximize inference intelligence must become a reliable enterprise experience
for depositing, finding, buying, rights-transferring, and delivering precise
technical intelligence without leaking protected source before settlement.

## Gate 1 implementation notes

Gate 1 turns the loose post-V38 notes committed on `main` plus the promoted V38 posture into the formal V39 SPEC, DELTA, NOTES, and PARITY family.
The opening must preserve every relevant V38 instruction while grounding V39 in existing source anchors: `FailsafeGenerationSequence`, `ThricifiedGeneration`, PTRR agent factories, tool doc-comment prompt definitions, Reading pipeline contracts, depository-search tools, embedding policy, ledger/database/storage receipts, delivery boundaries, and source-safe telemetry boundaries.
Gate 1 adds `check:v39-gate1`, workflow posture updates, README and package documentation posture updates, and roadmap truth for V38 active / V39 draft.

## Gate 2 implementation notes

Gate 2 closes Depository supply indexing and searchable deposit lifecycle. The artifact must prove deposited source can be measured, embedded, indexed, rights-aware, and searched without exposing protected source or credentials.

Gate 2 closure note: `DepositorySupplyIndex` is now the package-owned
source-safe index for deposited supply. It produces `DepositorySupplyRecord`
receipts with source binding, proof roots, measurement roots, reconciliation
readback roots, lexical/metadata/measurement/vector source-safe search
documents, active embedding vector projections, storage projection readback,
depositor/reader BTD rights boundary, and repair actions. The index converts
into `DepositoryAsset` candidates for `ReadFitsFindingSynthesis` through
`depositorySupplyAssetsFromIndex`, so Finding Fits can search deposited supply
without reading source-bearing payloads before settlement. The proof artifact is
`.bitcode/v39-depository-supply-indexing.json`.

## Gate 3 implementation notes

Gate 3 closes the enterprise Reading UX state machine. Terminal and
Conversation handoff expose the five-step Reading path with low-detail guidance
by default and expandable source-safe pipeline detail.
The state carrier is `TerminalEnterpriseReadingUxState`; Conversation can
suggest only a source-safe `readingStage`, and Terminal reads it back as
operator posture while retaining transaction authority.
The generated artifact `.bitcode/v39-enterprise-reading-ux-state.json` binds
stage ids, source-safe disclosure, rich execution stream integration, route
state tests, component tests, and the maintained opt-in browser proof workflow.

## Gate 4 implementation notes

Gate 4 closes `ReadNeedComprehensionSynthesis` as a review, feedback, and resynthesis loop. Finding Fits remains blocked until a reviewed Need is accepted.
The implementation centers on `ReadNeedReviewResynthesisRuntime`: it persists
Read Requests, synthesized Needs, feedback history, resynthesis attempts, Need
measurements, accepted-Need admission, rejected-Need posture, and source-safe
telemetry receipts as PipelineExecution-compatible storage projections. The
rejected-Need posture is explicit so operator feedback can drive resynthesis
without accidentally admitting Finding Fits.

## Gate 5 implementation notes

Gate 5 closes `ReadFitsFindingSynthesis` as a runtime many-candidate search pipeline with replayable query, ranking, threshold, and selected-fit provenance receipts across lexical, symbolic, path, metadata, measurement, vector, and provider-specific channels.
The package-owned runtime is `ReadFitsFindingRuntime`. It persists
source-safe storage records for accepted-Need admission, query plan, search
channels, candidate ranking, selected-fit provenance, fit result, telemetry,
repair posture, and source-safe replay receipt. The source-safe replay receipt
verifies query-plan, query, ranking, selected-fit provenance, embedding policy,
and candidate-count roots so an operator can diagnose blocked or no-worthy
Finding Fits runs without raw source, raw provider responses, credentials,
wallet private material, settlement payloads, or unpaid AssetPack source.

## Gate 6 implementation notes

Gate 6 closes the source-safe AssetPack preview and deterministic BTC quote boundary. Preview can show measurements, fit reasons, quality posture, proof roots, quote, and delivery posture, but not source-bearing AssetPack content.
The package-owned `AssetPackPreviewBoundary` is the source-safe AssetPack preview boundary runtime
projection for this boundary. It composes the source-safe preview, selected-fit
provenance, `AssetPackPreviewQuoteReceipt`, disclosure review, settlement
instructions, delivery posture, storage records, replay receipt, and repair
posture. The quote is deterministic over the accepted Need measurement vector,
admitted fit quality, weighted volume, minimum sats, dust floor, and active fee
schedule. Settlement instructions require reader wallet authorization before
broadcast, BTC fee payment readback, settlement finality readback, BTD rights
transfer readback, and ledger/database/storage reconciliation before source
unlock. Pull-request delivery is projected as available only after settlement;
unpaid source-bearing AssetPack content remains invisible.

## Gate 7 implementation notes

Gate 7 closes settlement, BTD rights transfer, contributor compensation, and post-settlement delivery. Source-bearing delivery is unlocked only after settlement finality and rights transfer are auditable.
The package-owned boundary is `AssetPackSettlementRightsDeliveryBoundary`.
It observes reader BTC payment against the Gate 6 quote, binds finality,
allocates source-to-shares compensation across selected fit deposits,
builds BTD rights transfer and paid read receipts, verifies settlement unlock
readback, reconciles ledger/database/object-storage projection roots, and
admits pull-request delivery only when all paid-boundary receipts agree. The
boundary is source-safe metadata: it can record that source-bearing delivery is
visible to the paid Reader, but it does not serialize protected source,
credentials, private wallet material, private settlement payloads, raw
protected prompts, raw provider responses, or unpaid AssetPack source. Staging
readback binds to project ref `tkpyosihuouusyaxtbau` and REST host
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/` without serializing any
credential value.

## Gate 8 implementation notes

Gate 8 closes operational telemetry, repair, and operator readback for Reading.
`ReadingOperationalTelemetryRepairReadback` is the package-owned seam that
turns Reading pipeline contracts, storage projections, settlement facts, UI
stage states, and repair posture into source-safe operator telemetry. Every
phase, PTRR agent, PTRR step, `FailsafeGenerationSequence`,
`ThricifiedGeneration`, `ToolExecution`, storage, ledger, wallet, delivery,
UI, and repair event is proof-rooted and carries the execution-state metadata
needed by the rich log component. Prompt visibility is template-id only;
result visibility is parsed shape and proof roots only; raw interpolated
prompts and raw provider responses stay absent. Repair hooks include rich-log
inspection, source-safe metadata inspection, Need resynthesis, Depository
search repair, BTC finality observation, projection repair, and pull-request
delivery recovery.

The operator readback persists under `reading/operational` as readback,
operatorReadback, streamEvents, runbookHooks, telemetryRoot, repairRoot, and
readbackRoot records. Gate 8 also extends the shared execution log to accept
direct operational telemetry payloads so live Reading runs can display a
compact row-by-row stream while preserving expandable source-safe metadata.

## Gate 9 implementation notes

Gate 9 closes interface and Conversation product parity. Conversation, MCP/API, ChatGPT App, and package consumers may assist the flow but cannot bypass accepted-Need gating, preview disclosure, settlement, rights, or delivery law.
`ReadingInterfaceProductParity` is the package-owned readback for that law. It
binds Terminal, Conversation, public API, MCP API, ChatGPT App, and package
consumer rows to the same Terminal Reading authority. Conversation remains a
source-safe Terminal handoff rather than a second Reading authority. Package
consumers can read contract roots and no-bypass posture but cannot authorize
delivery. API/MCP/ChatGPT rows reuse BTD interface catalog,
read-license/AssetPack-rights, telemetry-hook, and consumer-UX roots. The
runtime and generated artifact both forbid protected source, raw protected
prompts, raw interpolated prompts, raw provider responses, unpaid AssetPack
source, wallet private material, private settlement payloads, and credentials.

## Gate 10 implementation notes

Gate 10 closes local and staging Reading rehearsal through
`ReadingLocalStagingRehearsal`. The rehearsal composes the already closed
Reading package objects instead of inventing a parallel runner:
`ReadNeedReviewResynthesisRuntime`, `ReadFitsFindingRuntime`,
`AssetPackPreviewBoundary`, `AssetPackSettlementRightsDeliveryBoundary`,
`ReadingOperationalTelemetryRepairReadback`, and
`ReadingInterfaceProductParity`.

The artifact is `.bitcode/v39-local-staging-reading-rehearsal.json`. It proves
local and staging-testnet lanes, all five Reading stages, many-fit Depository
search, source-safe preview/quote, settlement/BTD rights delivery,
ledger/database/storage synchronization, rich log readback, and blocked
value-bearing mainnet admission. Staging-testnet is bound to Supabase project
`tkpyosihuouusyaxtbau`; secrets remain outside tracked files and outside
generated artifacts.

## Gate 11 implementation notes

Gate 11 closes V39 by binding every commercial Reading gate artifact, V39 proof appendix generation, workflow posture, promotion command support, and post-promotion runtime posture into one source-safe promotion-readiness contract. After promotion, runtime posture must become active V39 / draft V40 and `BITCODE_SPEC.txt` may point to V39 only through the V39 promotion workflow.
The Gate 11 contract is `V39CommercialReadingPromotionReadinessReport` with generated artifact `.bitcode/v39-promotion-readiness-report.json`. It binds all commercial Reading closure artifacts, source-safety evidence, `BITCODE_SPEC_V39_PROVEN.md` support, `v39-canon-promotion.yml`, `pnpm run check:v39-gate11`, and active V39 / draft V40 runtime posture.

## Post-V39 planning notes

The next specification target should focus on exhaustive commercial application testing depth: browser E2E across all rich website interactions and state possibilities, visual and screenshot comparison coverage, integration tests for pipeline primitives and the real Reading implementations, Conversation/API tests, and unit coverage for packages, primitives, isolated implementations, and real commercial implementations.

The following specification target should focus singularly on Prompt and PromptPart excellence, treating prompts as programs. V38's inference correctness hardening in commercial systems and V40's testing and benchmarking depth should make V41's prompt work measurable: every raw PromptPart and every composed Prompt should be audited, benchmarked, semantically repartitioned where useful, retitled or rewritten where optimal, catalogued with registry and interpolation contracts, and validated against the inference callsites they serve. Reading pipelines are the primary focus, with Conversation inference points covered as well.

## V39 gate plan

- Gate 1: V39 Commercial Reading Roadmap And Spec Opening
- Gate 2: Depository Supply Indexing And Searchable Deposit Lifecycle
- Gate 3: Enterprise Reading UX State Machine
- Gate 4: ReadNeed Review, Resynthesis, And Admission Runtime
- Gate 5: ReadFitsFinding Runtime, Ranking, And Replay
- Gate 6: AssetPack Preview, Quote, And Disclosure Boundary
- Gate 7: Settlement, BTD Rights Transfer, And Delivery
- Gate 8: Operational Telemetry, Repair, And Operator Readback
- Gate 9: Interface And Conversation Product Parity
- Gate 10: Local And Staging Commercial Reading Rehearsal
- Gate 11: V39 Promotion Readiness

## Non-goals during V39 opening

- No new production route, API version, source package name, or UI label should
  carry V39 in source code during the notes-only opening.
- No Bitcoin, GitHub, compute, storage, wallet, ledger, delivery, or
  build/process runtime boundary may be weakened while commercial Reading is
  being made product-ready.
- No later V39 gate may begin until Gate 1 creates the full draft family,
  updates the roadmap, and wires `check:v39-gate1`.
