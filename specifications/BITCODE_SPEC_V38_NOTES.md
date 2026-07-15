# Bitcode Spec V38 Notes

## Status

- Version: `V38`
- V38 state: canonical promotion complete; V38 notes record accepted inference stack, prompt benchmark, Reading search, telemetry, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V38`
- Canonical proof-source commit: `57173a81fc05a70b6b4b922ebe88add8bfa7f64e`
- Current active draft target: `V38`
- Prior canonical anchor: `BITCODE_SPEC_V37.md`
- Prior generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, `.bitcode/v38-promotion-readiness-report.json`, V38 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V38_PROVEN.md` as the generated proof appendix for V38 promotion
- Source parity state: V38 source-side inference inventory, PTRR Failsafe Thricified stack, prompt benchmark report, inference telemetry disclosure law, ReadNeedComprehensionSynthesis hardening, ReadFitsFindingSynthesis search embeddings, AssetPack synthesis economic traceability, Conversation/tool prompt parity, local/staging inference rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V38 file family
- Spec companion: `BITCODE_SPEC_V38.md`
- Delta companion: `BITCODE_SPEC_V38_DELTA.md`
- Parity companion: `BITCODE_SPEC_V38_PARITY_MATRIX.md`
- Scope: V38 canonical notes for inference correctness over promoted V37 Website Conversations canon
- Last fully realized canonical target preserved in source: `V38`

This NOTES file does not promote V38. It is binding draft guidance while V38 gates are in flight.

## Notes companion rule

This file is the V38 notes companion.
Requirements are binding for V38 gate work while `BITCODE_SPEC.txt` remains `V37`.

## Simplified-spec reading rule

Read `BITCODE_SPEC.txt` first.
If it points to `V37`, V37 is active canon and V38 is the active draft target only when this V38 SPEC family exists on a V38 branch.
Read `BITCODE_SPEC_V38.md`, this NOTES companion, the V38 DELTA, and the V38 PARITY matrix together before implementing inference work.

## Concise current-system reading

V37 is active canon and Website Conversations are promoted.
V38 is the draft target that focuses on commercial inference correctness across Reading pipelines, Conversations, tool-definition prompts, prompt benchmarking, fit-finding search, and source-safe inference telemetry.

## Deferred from V37

V37 promoted Website Conversations. V38 is inference-focused: it should correct
remaining gaps in the pipeline inference stack, fully use Bitcode's existing
agent, prompt, execution, tool, telemetry, and registry primitives, and bring
all Reading inference surfaces to commercial-readiness without weakening any
runtime boundary.

Source anchors already exist and must be audited before V38 implementation:

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

## Candidate V38 workstreams

- Audit every inference point in Reading pipelines, Website Conversations,
  tool-definition prompts, and interface-specific inference entrypoints. The
  audit must count base primitives and specific implementations separately:
  phase prompts, PTRR agent prompts, step prompts, Failsafe substep prompts,
  ThricifiedGeneration prompts, tool prompt definitions, prompt templates,
  interpolation bindings, expected context fields, raw outputs, parsed typed
  outputs, and repair/failure surfaces.
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
  PromptParts and complete Prompts are both benchmarkable. V38 Gate 1 should
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
  coupled second focus of V38. Fit-finding queries are inference-derived and
  must search throughout the Bitcode Depository using lexical, symbolic, path,
  metadata, measurement, embedding/vector, and provider-specific channels where
  appropriate.
- Harden the depository-search tool and primitive utility stack around source
  embeddings, measurement embeddings, metadata embeddings, query synthesis,
  ranking, verification, and AssetPack synthesis handoff. Existing OpenAI
  embedding policy (`text-embedding-3-small`, 1536 dimensions, cosine
  `match_deliverable_vectors`) is an active source anchor, and V38 may specify
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

The V38 acceptance posture is commercial inference correctness: Bitcode's
ability to maximize inference intelligence must produce reliable technical
intelligence measurement, labeling, fit-finding, AssetPack synthesis, and
mutually beneficial depositing and Reading exchange.

## Gate 1 implementation notes

Gate 1 turns the loose V38 notes committed on `main` into the formal V38 SPEC, DELTA, NOTES, and PARITY family.
The opening must preserve every instruction from those loose notes while grounding them in existing source anchors: `FailsafeGenerationSequence`, `ThricifiedGeneration`, PTRR agent factories, tool doc-comment prompt definitions, Reading pipeline contracts, depository-search tools, embedding policy, and source-safe telemetry boundaries.
Gate 1 adds `check:v38-gate1`, workflow posture updates, README and package documentation posture updates, and roadmap truth for V37 active / V38 draft.

## Gate 2 implementation notes

Gate 2 closes the first concrete V38 inference audit by making the inventory package-backed, generated, tested, and workflow-checkable.
`V38InferenceSurfaceInventory` and `.bitcode/v38-inference-surface-inventory.json` inventory `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Website Conversations, stream-event interface entrypoints, doc-comment-backed tool prompt definitions, prompt registry and benchmark coverage, and the execution primitive stack as `source-safe-inference-surface-metadata`.
The current generated count is 52 PTRR steps across 156 FailsafeGenerationSequence / ThricifiedGeneration chains and 468 provider-call slots.
The inventory deliberately records known gaps, including quick-response conversation repair, prompt benchmark completion, and later PTRR/Failsafe/Thricified call-stack validation, so later V38 gates cannot hide work outside the parity matrix.

## Gate 3 implementation notes

Gate 3 closes the practical PTRR stack contract by making the existing source-backed call stack generated, tested, and workflow-checkable.
`V38PtrrFailsafeThricifiedStack` and `.bitcode/v38-ptrr-failsafe-thricified-stack.json` record `factoryAgentWithPTRR`, Plan/Try/Refine/Retry factories, `FailsafeGenerationSequence`, `ThricifiedGeneration`, prompt/context/telemetry substeps, and Gate 2 count binding as `source-safe-ptrr-failsafe-thricified-stack-metadata`.
The artifact proves 69 source predicates and binds 52 PTRR steps to 156 Failsafe sequences, 156 ThricifiedGeneration chains, and 468 provider-call slots.
Tools remain step-owned postprocess executions; `ThricifiedGeneration` remains the lowest-level Reason, Judge, StructuredOutput provider-call chain.

## Gate 4 implementation notes

Gate 4 closes the first concrete prompt benchmarking contract by making benchmark coverage package-backed, generated, tested, and workflow-checkable.
Prompt benchmarking remains the complete-Prompt side of the same benchmark law that applies to semantically divided PromptParts.
`V38PromptBenchmarkReport` and `.bitcode/v38-prompt-benchmark-report.json` record prompt benchmark infrastructure, generic PTRR/Failsafe/ThricifiedGeneration PromptParts, `ReadNeedComprehensionSynthesis` PromptParts, `ReadFitsFindingSynthesis` PromptParts, complete Reading Prompt registries, Website Conversation Prompts, and DocCodeToolPrompt surfaces as `source-safe-prompt-benchmark-metadata`.
The artifact deliberately stores prompt identities, source-safe fixture ids, typed-output quality expectations, disclosure tiers, source roots, counts, predicate ids, and proof roots rather than raw prompt text or provider responses.
The current generated report covers 7 benchmark rows, 13 fixtures, 24 typed-output quality expectations, 38 source predicates, 443 active PromptPart doc-comments, 39 complete Prompt doc-comments, 465 benchmark definitions, 275 PromptPart exports, and 85 Prompt constructions.
Later V38 gates must use this report when streaming inference telemetry, hardening the two Reading pipelines, and applying Conversation/tool-prompt parity.

## Gate 5 implementation notes

Gate 5 closes the first source-safe inference telemetry and disclosure-tier contract by making the disclosure boundary package-backed, generated, tested, and workflow-checkable.
`V38InferenceTelemetryDisclosureReport` and `.bitcode/v38-disclosure-boundary-report.json` record pipeline phase lifecycle, PTRR agent step lifecycle, FailsafeGenerationSequence lifecycle, ThricifiedGeneration lifecycle, tool execution lifecycle, prompt template interpolation, raw response to parsed output schema, and stream UI/storage projection rows as `source-safe-inference-telemetry-disclosure-metadata`.
The artifact deliberately stores telemetry level ids, disclosure tier ids, source roots, proof roots, source predicate ids, allowed payload fields, forbidden payload classes, and fail-closed states rather than raw provider response content or raw protected prompt text.
The current generated report covers 8 rows, 13 required telemetry levels, 12 disclosure tier ids, 66 source predicates, V35 telemetry taxonomy roots, V37 stream event roots, V38 inference inventory roots, V38 PTRR/Failsafe/Thricified stack roots, and V38 prompt benchmark roots.
Prompt template identity, interpolated prompt presence, raw response presence, parsed typed output shape, schema verdicts, retry, repair, and inference audit shapes can stream at their disclosure tiers; protected source, unpaid AssetPack source, raw provider response content, credentials, private wallet material, and private settlement payloads remain blocked or private.

## Gate 6 implementation notes

Gate 6 closes the ReadNeedComprehensionSynthesis inference-hardening contract by binding the produced `ReadNeed` to a source-safe `ReadNeedComprehensionSynthesisInferenceReceipt`.
The receipt records phase ids, agent ids, PTRR step ids, Failsafe sequence ids, ThricifiedGeneration ids, prompt template ids, interpolation context keys, output schema ids, telemetry ids, source-safety booleans, review boundary posture, and stable roots.
`V38ReadNeedComprehensionInferenceHardening` and `.bitcode/v38-read-need-comprehension-inference-hardening.json` record request normalization, Need comprehension, Need measurement, Need review, and receipt rows as `source-safe-read-need-comprehension-inference-hardening-metadata`.
The current generated report covers 5 rows, 4 phases, 4 PTRR agents, 16 PTRR steps, 48 FailsafeGenerationSequence ids, 48 ThricifiedGeneration ids, 144 provider-call slots, 22 source predicates, and V38 Gates 2 through 5 roots.
The route and Terminal workbench remain aligned to resynthesis-with-feedback and accepted-Need-gated Finding Fits admission while raw provider responses, protected source, unpaid AssetPack source, credentials, private wallet material, and private settlement payloads remain unavailable in the source-safe receipt.

## Gate 7 implementation notes

Gate 7 closes the ReadFitsFindingSynthesis depository-search and embedding contract by binding Finding Fits to a source-safe `ReadFitsFindingSynthesisSearchReceipt`.
The receipt records phase ids, agent ids, PTRR step ids, Failsafe sequence ids, ThricifiedGeneration ids, tool ids, search channel ids, provider ids, threshold posture, query-plan root, query root, ranking root, candidate counts, selected-fit provenance root, embedding policy, source-safety booleans, and stable roots.
`V38ReadFitsFindingSearchEmbeddings` and `.bitcode/v38-read-fits-finding-search-embeddings.json` record accepted-Need admission, source-safe query planning, many-fit discovery, embedding policy, threshold verification, selected-fit provenance, and receipt rows as `source-safe-read-fits-finding-search-embeddings-metadata`.
The current generated report covers 7 rows, 7 phases, 8 PTRR agents, 32 PTRR steps, 96 FailsafeGenerationSequence ids, 96 ThricifiedGeneration ids, 288 provider-call slots, 4 tool contracts, 7 search channels, default 12 above-threshold selected-candidate slots, 23 source predicates, and V38 Gates 2 through 6 roots.
The active embedding/vector contract remains OpenAI `text-embedding-3-small`, 1536 dimensions, float encoding, cosine distance, `deliverable_vectors.embedding`, and `match_deliverable_vectors`; additional provider channels remain blocked until their storage, credentials, telemetry, and tests are explicit.
Selected fit provenance carries source-binding ids, selected unit ids, proof roots, measurement roots, and reconciliation-readback roots toward AssetPack synthesis while protected source, raw provider responses, unpaid AssetPack source, credentials, private wallet material, and private settlement payloads remain unavailable in the source-safe receipt.

## Gate 8 implementation notes

Gate 8 closes the AssetPack synthesis handoff and economic traceability contract by binding selected fits to source-safe preview, BTD receipts, source-to-shares compensation, settlement unlock, ledger/database reconciliation, repair posture, and harness evidence.
`V38AssetPackSynthesisEconomicTraceability` and `.bitcode/v38-assetpack-synthesis-economic-traceability.json` record selected-fit handoff, source-safe preview, protected-source leak scanning, deterministic share-to-fee BTC quote, BTD mint/read/rights receipts, source-to-shares contributor allocation, settlement unlock, post-settlement delivery, ledger/database/object-storage repair, and harness projection rows as `source-safe-assetpack-synthesis-economic-traceability-metadata`.
The current generated report covers 9 rows, 18 required receipt fields, BTD/AssetPack/harness package tests, 30 source predicates, and V38 Gates 5 through 7 roots.
Before settlement, the Reader may inspect only measurements, roots, fit ids, score posture, proof posture, ownership boundary, settlement boundary, and BTC quote. Protected source, the full AssetPack patch, source-bearing manifests, and licensed read payloads remain withheld.
After settlement, protected source and pull-request delivery become admissible only when BTC fee finality, BTD range, ownership/license rows, journal rows, ledger anchor, database readback, object storage, and reconciliation agree.

## Gate 9 implementation notes

Gate 9 closes Conversation and tool-prompt inference parity by binding Website Conversation variations, tool-definition prompts, interface-specific entrypoints, and ChatGPT App tool carriers to the same V38 prompt registry, PTRR/Failsafe/Thricified, telemetry, and disclosure posture used by Reading.
`V38ConversationToolPromptInferenceParity` and `.bitcode/v38-conversation-tool-prompt-inference-parity.json` record comprehensive and quick-response Conversation PTRR variations, Conversation agent and Plan/Try/Refine/Retry step prompts, typed output schemas, Conversation stream events, telemetry proof hooks, rich execution-log rendering, DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App doc-code prompt carriers, read-access checks, organization-authority checks, and interface no-bypass rows as `source-safe-conversation-tool-prompt-inference-parity-metadata`.
Gate 9 removes the quick-response single-step repair marker from the inference inventory by routing the quick-response variation through `factoryAgentWithPTRR` with the same agent prompt, step prompt registries, and final `ConversationRetrySchema`.
The prompt benchmark report no longer carries the Gate 9 Conversation/tool parity follow-up because the Gate 9 artifact binds prompt benchmark roots to source-safe Conversation/tool prompt parity evidence.
The current generated report covers 8 rows, 34 source predicates, upstream V38 Gate 2 inventory root, Gate 4 prompt benchmark root, Gate 5 disclosure root, and no protected source, raw prompt text, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, global ledger authority claim, or `_legacy/` source roots.

## Gate 10 implementation notes

Gate 10 closes local and staging-testnet inference/depository rehearsal by binding the Vercel Sandbox harness, staging route preflight, Reading pipelines, many-fit search, AssetPack preview, telemetry streaming, and mainnet-value blocking into one source-safe proof artifact.
`V38LocalStagingInferenceDepositorySearchRehearsal` and `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json` record local harness explicit opt-in, local env-file loading, sandbox auth gates, staging-testnet bounded real-inference preflight, Supabase readback validation, database streaming, ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis exercise, depository many-fit discovery, source-safe preview and disclosure review, protected-source settlement unlock, ledger/database reconciliation, rich execution-log projection, and blocked value-bearing mainnet posture as `source-safe-local-staging-inference-depository-search-rehearsal-metadata`.
The artifact deliberately stores lane ids, row ids, source roots, source predicates, previous V38 proof artifact roots, and closure booleans rather than live logs, prompt contents, provider responses, credentials, protected source, unpaid AssetPack patches, wallet private material, or private settlement payloads.
Local live rehearsal remains explicit-opt-in through the sandbox harness; staging-testnet route execution requires bounded real inference when deployed or when real-inference strictness is requested. Production-mainnet value-bearing settlement remains blocked by V38.
The maintained commands are
`pnpm run generate:v38-local-staging-inference-depository-search-rehearsal`,
`pnpm run check:v38-local-staging-inference-depository-search-rehearsal`, and
`pnpm run check:v38-gate10`.

## Gate 11: V38 Promotion Readiness

Gate 11 closes V38 by binding every inference-correctness gate artifact, V38 proof appendix generation, workflow posture, promotion command support, and post-promotion runtime posture into one source-safe promotion-readiness contract.
`V38InferencePromotionReadinessReport` and `.bitcode/v38-promotion-readiness-report.json` record all V38 Gate 2 through Gate 10 artifacts, `BITCODE_SPEC_V38_PROVEN.md` support, V38 promotion command dry-run support, `v38-canon-promotion.yml`, gate/canon workflow postures, spec-family/runtime promotion support, proven-generator support, active V38 / draft V39 post-promotion readiness, direct-main push denial, and blocked value-bearing mainnet posture as `source-safe-inference-promotion-readiness-metadata`.
The artifact deliberately stores artifact paths, digests, byte counts, source-safe closure booleans, validation commands, and posture strings rather than protected source, raw protected prompt text, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, or live rehearsal logs.
Gate 11 distinguishes draft-mode freshness from promoted-mode proof wrapping: before promotion the standalone `.bitcode/v38-promotion-readiness-report.json` must match `generate:v38-promotion-readiness`, and after promotion the proof-wrapped artifact produced by `generate-bitcode-proven --version V38` remains admissible when source-safe fields and posture predicates still pass.
The maintained commands are
`pnpm run generate:v38-promotion-readiness`,
`pnpm run check:v38-promotion-readiness`, and
`pnpm run check:v38-gate11`.
After promotion, runtime posture is active V38 / draft V39 and `BITCODE_SPEC.txt` may point to V38 only through the V38 promotion workflow.

## V38 gate plan

- Gate 1: V38 Inference Stack Roadmap And Spec Opening
- Gate 2: Inference Surface Inventory And Prompt Registry Map
- Gate 3: PTRR Failsafe And Thricified Execution Stack
- Gate 4: PromptPart And Prompt Benchmarking
- Gate 5: Inference Telemetry And Disclosure Tiers
- Gate 6: ReadNeedComprehensionSynthesis Inference Hardening
- Gate 7: ReadFitsFindingSynthesis Depository Search And Embeddings
- Gate 8: AssetPack Synthesis Handoff And Economic Traceability
- Gate 9: Conversation And Tool-Prompt Inference Parity
- Gate 10: Local Staging Inference And Depository Search Rehearsal
- Gate 11: V38 Promotion Readiness

## Non-goals during V38 opening

- No new production route, API version, source package name, or UI label should
  carry V38 in source code during the notes-only opening.
- No Bitcoin, GitHub, compute, storage, or build/process runtime boundary may
  be weakened while the inference execution stack is being clarified.
- No V38 gate may begin until Gate 1 creates the full draft family and updates
  the roadmap from this notes-only posture.
