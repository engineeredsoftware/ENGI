# Bitcode Spec V38

## Status

- Version: `V38`
- V38 state: canonical promotion complete; V38 is the active inference correctness canon and the V38 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V38`
- Canonical proof-source commit: `57173a81fc05a70b6b4b922ebe88add8bfa7f64e`
- Prior canonical anchor: `BITCODE_SPEC_V37.md`
- Prior generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md`
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V37`
- Generated structured artifact inventory: active canonical `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, `.bitcode/v38-promotion-readiness-report.json`, V38 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V38_PROVEN.md` as the generated proof appendix for V38 promotion
- Source parity state: V38 source-side inference inventory, PTRR Failsafe Thricified stack, prompt benchmark report, inference telemetry disclosure law, ReadNeedComprehensionSynthesis hardening, ReadFitsFindingSynthesis search embeddings, AssetPack synthesis economic traceability, Conversation/tool prompt parity, local/staging inference rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V38 file family
- Notes companion: `BITCODE_SPEC_V38_NOTES.md`
- Delta companion: `BITCODE_SPEC_V38_DELTA.md`
- Parity companion: `BITCODE_SPEC_V38_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md` only after V38 promotion
- Scope: V38 canonical system specification for inference correctness across pipeline execution, PTRR agents, FailsafeGenerationSequences, ThricifiedGenerations, prompt benchmarking, Reading fit-finding search, source-safe telemetry, local/staging rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V38`

## Version executive summary

V38 is the inference-correctness version.
It follows V37 Website Conversations by returning to the agentic foundation beneath Reading, Conversations, tool prompts, telemetry, and depository search.
V38 must make Bitcode's inference call stack commercially exact: pipeline phases invoke PTRR agents; PTRR agents own Plan, Try, Refine, and Retry steps; each practical step uses `FailsafeGenerationSequence` for context preparation, large input handling, large output handling, and typed-output repair; each Failsafe chain delegates final Reason, Judge, and StructuredOutput inference to `ThricifiedGeneration`; provider calls happen only after all prompt registries, PromptParts, context bindings, tool documentation, and output schemas have composed into the final call envelope.

V38 also makes fit-finding commercially reliable.
`ReadFitsFindingSynthesis` must derive search queries from inference, search the Bitcode Depository through lexical, symbolic, path, metadata, measurement, embedding/vector, and provider-specific channels, rank above-threshold candidate deposits, preserve their provenance, and hand selected fits to AssetPack synthesis without leaking unpaid source.
Existing OpenAI embedding policy (`text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors`) is the current source anchor; any LlamaIndex, Pinecone, or additional provider channel added during V38 must define storage, credentials, telemetry, tests, and source-safe boundaries before use.

## V38 inference stack law

V38 uses the existing primitive names precisely:

- `PipelineExecution` owns phase ordering, phase inputs, phase outputs, ancestry state, phase receipts, and pipeline telemetry.
- PTRR agents own `Plan`, `Try`, `Refine`, and `Retry` steps plus agent-level prompt registry composition.
- PTRR steps own their prompt registries, selected tools, Failsafe usage, typed step outputs, step receipts, and step telemetry.
- `FailsafeGenerationSequence` owns context preparation, large input handling, large output handling, stitch or summarization loops, and repair orchestration around the final typed inference chain.
- `ThricifiedGeneration` owns the lowest-level Reason, Judge, and StructuredOutput inference calls.
- `ToolExecution` owns callable tool input, execution, output, errors, and receipts.
- `DocCodeToolPrompt` and `formatUsableTools` own doc-comment-backed tool definitions that are injected into final prompts when tools are available to a step.

Tools are step-owned capabilities.
They are not hidden children of `ThricifiedGeneration`, but tool documentation must still be available to the final prompt material consumed by `ThricifiedGeneration`.
Every inference envelope must preserve template identity, prompt part identity, interpolated prompt, context bindings, selected tools, raw response, parsed typed result, schema verdict, retry or repair state, disclosure tier, proof root, and execution ancestry root at the permitted telemetry tier.

## V38 Reading pipeline focus

`ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` are the primary Reading pipelines under V38.
They must be audited from phase to agent to step to Failsafe substep to Thricified generation to tool to typed output.
The audit must count every inference point separately, name the prompts and PromptParts used by that point, define input context, define output schemas, define failure or repair behavior, and identify where the result is stored and streamed.

`ReadNeedComprehensionSynthesis` must synthesize an enterprise user's Read Request into a reviewable Need that says exactly what should be read, what must not be over-inferred, which repository/deposit constraints apply, and what measurements drive fit-finding.

`ReadFitsFindingSynthesis` must discover many possible fits, not one fit.
It must gather above-threshold deposits from the Depository, rank and verify those candidates, preserve found-fit provenance, and hand the selected fits into AssetPack synthesis.
Before settlement, the Reader may see only source-safe measurements, fit reasons, quality posture, pricing posture, proof roots, and preview metadata.
After settlement, delivery may cross the visibility boundary and provide the full AssetPack source as governed by BTD rights transfer and ledger/database synchronization.

## V38 gate plan

### Gate 1: Inference Stack Roadmap And Spec Opening

Gate 1 opens V38 correctly:

- V38 SPEC, DELTA, NOTES, and PARITY files exist over active V37.
- `BITCODE_SPEC.txt` remains `V37`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V37 active / V38 draft posture.
- `check:v38-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, inference vocabulary, depository-search vocabulary, and promotion boundaries.
- The V38 gate list is explicit before inference implementation begins.

### Gate 2: Inference Surface Inventory And Prompt Registry Map

Gate 2 inventories every active inference surface.
It must count Reading pipeline phases, PTRR agents, Plan/Try/Refine/Retry steps, Failsafe chains, ThricifiedGeneration calls, tool definitions, prompt templates, PromptParts, interpolation bindings, expected context fields, raw outputs, parsed typed outputs, failure surfaces, and storage/streaming destinations.
The inventory must cover `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Website Conversations, tool-definition prompts, and interface-specific inference entrypoints.
Gate 2 is closed by the package-backed `V38InferenceSurfaceInventory` source and the deterministic `.bitcode/v38-inference-surface-inventory.json` artifact.
The artifact has `source-safe-inference-surface-metadata` disclosure posture and records 7 inventory rows, 13 phase or surface groups, 13 PTRR agents, 52 PTRR steps, 156 Failsafe/Thricified chains, 468 provider-call slots, and 9 tool or tool-definition surfaces without serializing protected prompts, protected source, credentials, raw provider payloads, or unpaid AssetPack source.

### Gate 3: PTRR Failsafe And Thricified Execution Stack

Gate 3 makes practical PTRR steps use `FailsafeGenerationSequence` above `ThricifiedGeneration` unless a source-backed exception is specified and tested.
It must validate prompt registry composition from phase to agent to step to Failsafe to Thricified generation and provider call, including execution ancestry state preparation and typed-output repair.
Gate 3 is closed by the package-backed `V38PtrrFailsafeThricifiedStack` source and deterministic `.bitcode/v38-ptrr-failsafe-thricified-stack.json` artifact.
The artifact has `source-safe-ptrr-failsafe-thricified-stack-metadata` disclosure posture and proves the current practical call stack with 9 source-backed rows, 69 passed source predicates, all 4 PTRR steps, all 3 Failsafe stages, all 3 ThricifiedGeneration stages, and Gate 2's 52 PTRR steps / 156 Failsafe sequences / 156 ThricifiedGeneration chains / 468 provider-call slots.
Gate 3 confirms tools remain step-owned postprocess capabilities while `FailsafeGenerationSequence` delegates final Reason, Judge, and StructuredOutput production to `ThricifiedGeneration`.

### Gate 4: PromptPart And Prompt Benchmarking

Gate 4 completes prompt and PromptPart benchmarking.
Prompt benchmarking is the source-safe measurement contract for complete Prompt registries and their composed PromptParts.
Semantically divided PromptParts and complete Prompts must be benchmarkable with initial benchmark suites for active Reading, Conversation, and tool-definition inference surfaces.
Benchmarks must preserve prompt identity, fixture inputs, expected typed-output qualities, disclosure tiers, and stable report artifacts.
Gate 4 is closed by the package-backed `V38PromptBenchmarkReport` source and deterministic `.bitcode/v38-prompt-benchmark-report.json` artifact.
The artifact has `source-safe-prompt-benchmark-metadata` disclosure posture and records 7 benchmark rows, 13 source-safe fixtures, 24 typed-output quality expectations, 38 passed source predicates, 443 active PromptPart doc-comments, 39 complete Prompt doc-comments, 465 benchmark definitions, 275 PromptPart exports, and 85 Prompt constructions across Reading, Conversation, and tool-definition inference surfaces without serializing raw prompt text, protected source, credentials, raw provider responses, or unpaid AssetPack source.

### Gate 5: Inference Telemetry And Disclosure Tiers

Gate 5 binds inference execution to source-safe telemetry.
It must stream phase, agent, step, Failsafe, ThricifiedGeneration, tool, prompt-template, interpolated-prompt, raw-response, parsed-output, schema-verdict, retry, repair, and failure evidence at the correct disclosure tier without leaking protected source, credentials, unpaid AssetPack contents, wallet private material, or settlement private payloads.
Gate 5 is closed by the package-backed `V38InferenceTelemetryDisclosureReport` source and deterministic `.bitcode/v38-disclosure-boundary-report.json` artifact.
The artifact has `source-safe-inference-telemetry-disclosure-metadata` disclosure posture and records 8 telemetry/disclosure rows, 13 required telemetry levels, 12 disclosure tier ids, 66 passed source predicates, and upstream proof roots for V35 telemetry taxonomy, V37 stream events, V38 inference inventory, V38 PTRR/Failsafe/Thricified stack, and V38 prompt benchmarking.
The raw provider response boundary is private or root-only: public and reader-visible streams may show raw-response presence, roots, typed output shape, schema verdicts, retry/repair posture, and prompt/template identities, but never raw provider response content, raw protected prompt text, protected source, unpaid AssetPack source, credentials, wallet private material, or private settlement payloads.

### Gate 6: ReadNeedComprehensionSynthesis Inference Hardening

Gate 6 hardens Read Request to Need synthesis.
It must implement PTRR/Failsafe/Thricified parity for the pipeline, store reviewable Need outputs, support resynthesis with feedback, define Need measurements, and prove that the Need is neither under-specified nor over-broad relative to the Read Request.
Gate 6 is closed by the package-backed `V38ReadNeedComprehensionInferenceHardening` source, deterministic `.bitcode/v38-read-need-comprehension-inference-hardening.json` artifact, ReadNeedComprehensionSynthesis inference receipt, and package tests.
The artifact has `source-safe-read-need-comprehension-inference-hardening-metadata` disclosure posture and records 5 lifecycle/receipt rows, 4 phases, 4 PTRR agents, 16 PTRR steps, 48 Failsafe sequences, 48 ThricifiedGeneration chains, 144 provider-call slots, and 22 passed source predicates.
The produced `ReadNeed` now carries a source-safe inference receipt binding phase ids, agent ids, PTRR step ids, Failsafe sequence ids, ThricifiedGeneration ids, prompt template ids, interpolation keys, output schema ids, telemetry ids, and roots without exposing protected source, raw provider response content, unpaid AssetPack source, credentials, wallet private material, or private settlement data.

### Gate 7: ReadFitsFindingSynthesis Depository Search And Embeddings

Gate 7 hardens Finding Fits.
It must use inference-derived search queries, depository-search tools, vector embeddings, metadata and measurement channels, lexical and symbolic channels, ranking, verification, thresholding, and selected-fit provenance.
It must maintain the active `text-embedding-3-small`, 1536 dimension, cosine `match_deliverable_vectors` policy unless a replacement is specified, tested, and migrated.
Gate 7 is closed by the package-backed `V38ReadFitsFindingSearchEmbeddings` source, deterministic `.bitcode/v38-read-fits-finding-search-embeddings.json` artifact, `ReadFitsFindingSynthesisSearchReceipt`, and package tests.
The artifact has `source-safe-read-fits-finding-search-embeddings-metadata` disclosure posture and records 7 lifecycle/search rows, 7 phases, 8 PTRR agents, 32 PTRR steps, 96 Failsafe sequences, 96 ThricifiedGeneration chains, 288 provider-call slots, 4 tool contracts, 7 search channels, 12 default above-threshold selected-candidate carryforward slots, and 23 passed source predicates.
`ReadFitsFindingSynthesis` now emits source-safe query-plan and search receipts binding lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific channels to query roots, ranking roots, selected-fit provenance roots, threshold posture, candidate counts, and the active OpenAI embedding/vector-store policy without exposing protected source, raw provider responses, unpaid AssetPack source, credentials, wallet private material, or private settlement data.

### Gate 8: AssetPack Synthesis Handoff And Economic Traceability

Gate 8 verifies found fits flow into AssetPack synthesis and settlement posture.
Selected fit deposits must remain traceable into source-safe preview, post-settlement delivery, contributor compensation, exact ledger/database synchronization, proof receipts, and repair paths.
Gate 8 is closed by the package-backed `V38AssetPackSynthesisEconomicTraceability` source, deterministic `.bitcode/v38-assetpack-synthesis-economic-traceability.json` artifact, AssetPack source-safe preview tests, BTD receipt/source-to-shares/reconciliation tests, and pipeline harness tests.
The artifact has `source-safe-assetpack-synthesis-economic-traceability-metadata` disclosure posture and records 9 handoff/economic rows, 18 required receipt fields, selected-fit handoff, source-safe preview before settlement, protected-source leak scanning, deterministic share-to-fee BTC quote, BTD mint/read/rights receipts, contributor compensation, settlement unlock, post-settlement delivery boundary, ledger/database synchronization, proof receipts, repair paths, source-to-shares conservation, and harness evidence projection without exposing protected source, raw provider response content, unpaid AssetPack source, credentials, wallet private material, or private settlement payloads.

### Gate 9: Conversation And Tool-Prompt Inference Parity

Gate 9 brings Website Conversations, tool-definition prompts, and interface-specific inference entrypoints to the same registry, Failsafe, Thricified, tool prompt, telemetry, and disclosure posture as Reading.
Conversation inference must reuse the inference primitives without becoming a parallel Protocol authority.
Gate 9 is closed by the package-backed `V38ConversationToolPromptInferenceParity` source, deterministic `.bitcode/v38-conversation-tool-prompt-inference-parity.json` artifact, Conversation stream/telemetry tests, Terminal execution-log rendering test, ChatGPT App tool prompt/admission tests, generator, checker, and workflow wiring.
The artifact has `source-safe-conversation-tool-prompt-inference-parity-metadata` disclosure posture and records 8 parity rows, 34 source predicates, PTRR coverage for comprehensive and quick-response Conversation variations, prompt registry and step prompt coverage, typed output schemas, source-safe stream telemetry, rich execution-log UI projection, DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App doc-code prompt carriers, and interface entrypoint no-bypass posture without exposing protected source, raw prompt text, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, or global ledger authority.

### Gate 10: Local Staging Inference And Depository Search Rehearsal

Gate 10 proves the V38 inference stack locally and in staging-testnet.
It must rehearse ReadNeedComprehensionSynthesis, ReadFitsFindingSynthesis, depository search, AssetPack preview, source-safe telemetry, and blocked value-bearing mainnet posture with real non-mocked inference where credentials are available.
Gate 10 is closed by the package-backed `V38LocalStagingInferenceDepositorySearchRehearsal` source, deterministic `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json` artifact, protocol test, harness/search/route/UI package tests, generator, checker, and workflow wiring.
The artifact has `source-safe-local-staging-inference-depository-search-rehearsal-metadata` disclosure posture and records 8 rehearsal rows across local and staging-testnet lanes: local sandbox harness opt-in, staging-testnet bounded real-inference preflight, ReadNeedComprehensionSynthesis plus ReadFitsFindingSynthesis pipeline exercise, many-fit depository search, source-safe AssetPack preview, rich telemetry streaming and readback, credential-gated live inference, and blocked value-bearing mainnet posture.
Gate 10 binds prior V38 Gates 2 through 9 artifact roots while preserving protected source, raw prompt text, raw provider response content, live rehearsal log payloads, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, and production-mainnet value-bearing admission as unavailable in source-safe evidence.

### Gate 11: V38 Promotion Readiness

Gate 11 closes V38 with promotion readiness.
It must generate V38 proof support, validate every V38 artifact, update promotion workflows, preserve V37 active / V38 draft to V38 active / V39 draft posture, and block promotion if inference, prompt benchmarking, search, telemetry, source-safety, or settlement traceability evidence is incomplete.
Gate 11 is closed by the package-backed `V38InferencePromotionReadinessReport` source, deterministic `.bitcode/v38-promotion-readiness-report.json` artifact, V38 promotion workflow, promotion command dry-run support, generated proof appendix support, protocol test, generator, checker, and workflow wiring.
The artifact has `source-safe-inference-promotion-readiness-metadata` disclosure posture and records all V38 gate artifacts, V38 generated proof outputs, promotion workflow coverage, gate/canon workflow coverage, promotion-script coverage, spec-family/runtime promotion support, V37 active / V38 draft pre-promotion posture, V38 active / draft V39 post-promotion posture, direct-main push denial, and blocked value-bearing mainnet posture without exposing protected source, raw protected prompts, raw provider response content, unpaid AssetPack source, credentials, wallet private material, or private settlement payloads.
Draft-mode Gate 11 freshness checks validate the standalone readiness artifact; promoted-mode Gate 11 checks accept the proof-wrapped readiness artifact generated during canonical promotion while continuing to validate source-safety, posture, and generated-proof coverage.

## V38 non-goals

- V38 does not change BTD supply law, Bitcoin settlement law, Exchange law, or production-mainnet admission unless a later promoted canon explicitly does so.
- V38 does not introduce versioned routes, versioned API paths, or versioned source identifiers.
- V38 does not allow protected source, raw protected prompts, raw provider responses, unpaid AssetPack source, credentials, private wallet material, or private settlement payloads to appear in public telemetry.
- V38 does not replace the existing prompt, registry, execution, agent, tool, and pipeline primitives with a parallel abstraction stack.

## Canonical Bitcode executive summary

Bitcode is the commercial Protocol implementation for depositing, measuring, finding, synthesizing, settling, delivering, and proving technical intelligence as BTD and AssetPack activity.
V38 does not replace V37 canon; it deepens the inference machinery that lets Bitcode understand Read Requests, synthesize Needs, find many fits across the Depository, synthesize source-safe AssetPack previews, and deliver full AssetPacks only after settlement and rights transfer.

## source-of-truth hierarchy

The source-of-truth hierarchy for V38 is:

1. `BITCODE_SPEC.txt` points to active V37 until V38 promotion.
2. `BITCODE_SPEC_V37.md` and `BITCODE_SPEC_V37_PROVEN.md` remain active canon.
3. `BITCODE_SPEC_V38.md`, `BITCODE_SPEC_V38_DELTA.md`, `BITCODE_SPEC_V38_NOTES.md`, and `BITCODE_SPEC_V38_PARITY_MATRIX.md` are the draft target family during V38 gates.
4. Package source, tests, scripts, workflows, generated `.bitcode/*` artifacts, local/staging rehearsal evidence, and promotion checks must converge before V38 promotion.

## full-system, re-implementation, and audit rule

V38 work must preserve full-system auditability.
No implementation may bypass package-owned primitives for executions, pipelines, PTRR agents, prompt registries, tools, telemetry, BTD, ledger/database synchronization, object storage, or source-safe disclosure.
Any re-implementation must prove parity against the active primitive and may not fork an easier parallel path.

## totality and precision enforcement rule

V38 gates must make every inference edge total enough to audit: inputs, prompts, PromptParts, interpolation bindings, tools, outputs, raw provider responses, parsed typed results, schema verdicts, repairs, failures, storage destinations, streaming destinations, proof roots, and disclosure tiers must be precise before promotion.

## system goals, non-goals, and design principles

Goals: commercial inference correctness, reliable Reading intelligence, benchmarkable prompt materials, source-safe telemetry, depository-wide fit-finding, and settlement-traceable AssetPack synthesis.
Non-goals: value-bearing mainnet admission, BTD supply changes, bridge chain-of-record implementation, versioned routes, or provider-specific shortcuts without tests.
Design principles: reuse primitives, preserve typed receipts, fail closed, expose only permitted disclosure tiers, and make every prompt and search decision auditable.

## system architecture and layer boundaries

The V38 architecture boundary is `PipelineExecution -> PTRR agent -> PTRR step -> FailsafeGenerationSequence -> ThricifiedGeneration -> provider call`.
`ToolExecution` remains step-owned.
Prompt registry and PromptPart composition must flow downward from phase, agent, step, Failsafe, tool documentation, and generation prompt materials into the final provider call.
Ledger, wallet, object storage, GitHub delivery, and settlement operations remain outside inference authority and are invoked only through their existing package or route boundaries.

## canonical domain model

The V38 domain model carries the existing Bitcode objects: deposits, Reads, Read Requests, Needs, candidate fit deposits, AssetPacks, BTD ranges, preview measurements, settlement receipts, delivery receipts, proof roots, execution receipts, prompt receipts, tool receipts, telemetry events, and repair cases.
V38 adds no new chain-of-record object; it makes inference and fit-finding receipts precise enough to support the existing Protocol model.

## whole Bitcode operator chain

The whole operator chain is deposit source, measure deposited material, request a Read, synthesize a Need, review or resynthesize the Need, find many fitting deposits, synthesize a source-safe AssetPack preview, calculate deterministic settlement posture, settle in BTC when admitted, transfer BTD read rights, deliver the full AssetPack, journal database/ledger/object-storage projections, emit telemetry, and preserve proof roots for repair.

## canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: deposits, deposited source metadata, BTD range identity, source-safe proofs, and inherited `.bitcode/asset-pack.lock.json` style artifact roots.
Current algorithms and derivation rules: source measurement, source-to-shares accounting, deposit admissibility, and proof-root derivation remain inherited from V37 and prior canon.
Current invariants and fail-closed conditions: deposits cannot expose secrets or protected source beyond permitted tiers, and invalid deposit fails closed.
Current proof obligations: source measurement, disclosure boundary, static analysis, and proof contract evidence remain required.
Current source-bearing implementation basis: package source and route contracts outside `_legacy/`.
Current validating commands and parity basis: active V37 promoted checks plus V38 gate checks.
Current accepted boundaries: V38 only changes inference/search surfaces that consume deposits.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Request, synthesized Need, prompt registry receipts, PromptPart benchmark fixtures, Failsafe receipts, ThricifiedGeneration receipts, and typed Need outputs.
Current algorithms and derivation rules: PTRR steps compose prompts and delegate to Failsafe and Thricified chains.
Current invariants and fail-closed conditions: prompt contract incompleteness and parsed-envelope inadmissibility fail closed.
Current proof obligations: Inference-synthesis and Prompt-completeness evidence must cover every active inference point.
Current source-bearing implementation basis: `packages/agent-generics`, `packages/prompts`, and `packages/pipelines/asset-pack`.
Current validating commands and parity basis: V38 Gate 2 through Gate 6 checks.
Current accepted boundaries: inference may understand and measure; it may not settle, mint, or deliver protected source.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: query receipts, search channel receipts, candidate deposits, ranking roots, threshold verdicts, selected-fit provenance, and verification evidence.
Current algorithms and derivation rules: inference-derived queries search lexical, symbolic, path, metadata, measurement, embedding/vector, and provider-specific channels before ranking.
Current invariants and fail-closed conditions: no-survivor asset pack and unsupported vector policy fail closed.
Current proof obligations: Selection-and-materialization, Verification-decisions, and Disclosure-boundary proofs.
Current source-bearing implementation basis: `depository-search.ts`, `embedding-config.ts`, and depository-search tools.
Current validating commands and parity basis: V38 Gate 7 checks and later Gate 8 handoff checks.
Current accepted boundaries: source-safe preview before settlement, full source only after paid rights transfer.

### Selection and materialization

Current canonical objects and emitted artifacts: AssetPack preview, AssetPack synthesis receipt, delivery PR receipt, `assetPackEvidence`, selected-source material, verification report, and proof bundle.
Current algorithms and derivation rules: selected fits are synthesized into an AssetPack only after source-safe preview posture and settlement/delivery boundaries are respected.
Current invariants and fail-closed conditions: unpaid AssetPack source cannot cross the Reader visibility boundary.
Current proof obligations: Selection-and-materialization and Settlement-source-to-shares proof evidence.
Current source-bearing implementation basis: Reading pipeline packages, GitHub delivery surfaces, BTD packages, and ledger/database projectors.
Current validating commands and parity basis: V38 Gate 8 through Gate 10 checks.
Current accepted boundaries: V38 can harden handoff and telemetry, not bypass payment.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: organization roles, account principals, wallet posture, policy decisions, signing authority boundaries, and sensitive-flow redaction receipts.
Current algorithms and derivation rules: policy checks gate source, wallet, settlement, delivery, and visibility transitions.
Current invariants and fail-closed conditions: authorization denial and private material exposure fail closed.
Current proof obligations: Authorization-and-sensitive-flow, Disclosure-boundary, and Static-code-analysis proofs.
Current source-bearing implementation basis: API packages, UAPI route boundaries, BTD packages, and V37 privacy redaction.
Current validating commands and parity basis: V38 Gate 5, Gate 8, and Gate 10 checks.
Current accepted boundaries: inference telemetry must never become an authorization bypass.

### Disclosure and projection

Current canonical objects and emitted artifacts: public, buyer, reviewer, internal, operator-only, and source-safe telemetry projections.
Current algorithms and derivation rules: each telemetry row is assigned a disclosure tier before storage, streaming, docs, or UI display.
Current invariants and fail-closed conditions: public projection overexposure fails closed.
Current proof obligations: Disclosure-boundary and Proof-contract evidence.
Current source-bearing implementation basis: V35 telemetry law, V37 stream UI, and V38 inference telemetry contracts.
Current validating commands and parity basis: V38 Gate 5 and Gate 9 checks.
Current accepted boundaries: raw protected prompts and raw provider responses are not public payloads.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTC fee quote, measurement volume, settlement receipt, ledger root, database projection root, BTD right transfer, contributor compensation route, and repair receipt.
Current algorithms and derivation rules: deterministic measurement weight times measurement volume informs pricing posture, and settlement finality governs delivery.
Current invariants and fail-closed conditions: settlement conservation drift, underpayment, stale quote, and projection mismatch fail closed.
Current proof obligations: Settlement-source-to-shares and Proof-contract evidence.
Current source-bearing implementation basis: BTD packages, Exchange settlement canon, Reading pipeline handoff, and repair jobs.
Current validating commands and parity basis: V38 Gate 8, Gate 10, and Gate 11 checks.
Current accepted boundaries: V38 does not change BTC law; it preserves inference-to-settlement traceability.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: generated proof appendix, spec-family reports, canonical-input reports, canon-posture drift reports, benchmark reports, inference receipts, tool receipts, telemetry roots, and rehearsal evidence.
Current algorithms and derivation rules: proof roots derive from deterministic artifacts and replayable command evidence.
Current invariants and fail-closed conditions: stale promoted status truth and missing generated proof evidence fail closed.
Current proof obligations: all nine proof families.
Current source-bearing implementation basis: `packages/protocol`, scripts, workflows, tests, and generated `.bitcode/*` artifacts.
Current validating commands and parity basis: V38 Gate 1 through Gate 11 checks.
Current accepted boundaries: generated proof cannot serialize credentials, protected source, unpaid AssetPack source, or private wallet material.

## proof-family canon

The V38 proof-family canon inherits all nine proof families and adds inference-focused closure criteria.

### Inference-synthesis

proofArtifactPath: `.bitcode/v38-inference-surface-inventory.json` and `.bitcode/v38-ptrr-failsafe-thricified-stack.json`
members: pipeline phases, PTRR agents, Plan/Try/Refine/Retry steps, Failsafe chains, ThricifiedGeneration calls, provider calls
theoremIds: inference-stack-totality, typed-output-admissibility
replayStepIds: run V38 Gate 2 and Gate 3 checks
witnessArtifactPaths: prompt receipts, generation receipts, telemetry receipts
current member closure criteria: every inference point is counted and typed
current member verdict shape: passed, failed, or repair-required with proof root
current theorem-by-theorem closure reading: stack composition and typed output are replayable
current theorem-to-replay grouping: inventory, execution stack, telemetry
minimum artifact/replay binding set: source paths, prompt ids, schema ids, telemetry ids
current proof-object fields: proofRoot, phaseId, agentId, stepId, generationId, schemaVerdict
generated-artifact and test bindings: V38 Gate 2 and Gate 3 artifacts and tests
fail-closed conditions: missing prompt, missing schema, invalid typed output

### Prompt-completeness

proofArtifactPath: `.bitcode/v38-prompt-benchmark-report.json`
members: PromptParts, Prompts, templates, interpolation bindings, tool documentation
theoremIds: prompt-registry-totality, prompt-benchmark-coverage
replayStepIds: run V38 Gate 4 checks
witnessArtifactPaths: benchmark fixtures and reports
current member closure criteria: active prompts and PromptParts are benchmarkable
current member verdict shape: benchmark pass, benchmark fail, or missing fixture
current theorem-by-theorem closure reading: every active prompt has identity and expected qualities
current theorem-to-replay grouping: prompt inventory and benchmark suite
minimum artifact/replay binding set: prompt id, prompt part id, fixture id, result root
current proof-object fields: promptId, promptPartIds, fixtureRoot, qualityVerdict
generated-artifact and test bindings: V38 Gate 4 artifacts and tests
fail-closed conditions: missing prompt identity or unbound interpolation

### Static-code-analysis

proofArtifactPath: `.bitcode/v38-static-inference-boundary-report.json`
members: imports, source casing, route versioning, secret scans, raw prompt boundaries
theoremIds: source-boundary-conformance, no-versioned-route-drift
replayStepIds: run gate-quality static checks
witnessArtifactPaths: workflow logs and scan reports
current member closure criteria: no unsupported imports or versioned API routes
current member verdict shape: passed or failed with source location
current theorem-by-theorem closure reading: static code matches active source discipline
current theorem-to-replay grouping: casing, imports, route scan, redaction scan
minimum artifact/replay binding set: file path, scanner id, verdict
current proof-object fields: scannerId, filePath, verdict, evidenceRoot
generated-artifact and test bindings: gate-quality workflow
fail-closed conditions: versioned route, secret leak, unsupported import

### Verification-decisions

proofArtifactPath: `.bitcode/v38-verification-decision-report.json`
members: search verification, Need adequacy, fit quality, AssetPack preview quality
theoremIds: verification-is-typed, no-unverified-fit-selection
replayStepIds: run V38 Gate 6 through Gate 8 checks
witnessArtifactPaths: verification reports and selected-fit roots
current member closure criteria: verification decisions are typed and proof-rooted
current member verdict shape: accepted, rejected, blocked, or repair-required
current theorem-by-theorem closure reading: no fit or preview is accepted without evidence
current theorem-to-replay grouping: Need verification, fit verification, preview verification
minimum artifact/replay binding set: decision id, input root, output root, proof root
current proof-object fields: decisionId, state, reason, proofRoot
generated-artifact and test bindings: V38 Gate 6 through Gate 8 tests
fail-closed conditions: unsupported evidence, below-threshold fit, unverifiable preview

### Selection-and-materialization

proofArtifactPath: `.bitcode/v38-read-fits-finding-search-embeddings.json`; `.bitcode/v38-assetpack-synthesis-economic-traceability.json`
members: candidate deposits, selected fits, AssetPack synthesis handoff, PR delivery
theoremIds: selected-fits-traceable, materialization-source-safe
replayStepIds: run V38 Gate 7 and Gate 8 checks
witnessArtifactPaths: selected-source material, verification report, AssetPack evidence
current member closure criteria: selected fit provenance survives synthesis handoff
current member verdict shape: selected, rejected, or blocked
current theorem-by-theorem closure reading: materialization follows from verified fits
current theorem-to-replay grouping: search, rank, select, synthesize
minimum artifact/replay binding set: fit id, deposit id, ranking root, synthesis root
current proof-object fields: fitId, depositRef, rankingRoot, synthesisRoot
generated-artifact and test bindings: V38 Gate 7 and Gate 8 artifacts
fail-closed conditions: no-survivor asset pack, untraceable fit, unpaid source exposure

### Authorization-and-sensitive-flow

proofArtifactPath: `.bitcode/v38-sensitive-flow-report.json`
members: source visibility, prompt visibility, wallet material, settlement payloads, credentials
theoremIds: sensitive-flow-redacted, authority-boundary-preserved
replayStepIds: run V38 Gate 5, Gate 8, and Gate 9 checks
witnessArtifactPaths: telemetry disclosure reports and redaction receipts
current member closure criteria: protected payloads are blocked or assigned permitted tiers
current member verdict shape: allowed, denied, redacted, or blocked
current theorem-by-theorem closure reading: authority and visibility do not leak through inference
current theorem-to-replay grouping: telemetry, prompt disclosure, delivery boundary
minimum artifact/replay binding set: payload class, visibility tier, redaction verdict
current proof-object fields: payloadClass, tier, verdict, proofRoot
generated-artifact and test bindings: V38 Gate 5 and Gate 9 tests
fail-closed conditions: authorization denial, credential exposure, private wallet exposure

### Settlement-source-to-shares

proofArtifactPath: `.bitcode/v38-assetpack-synthesis-economic-traceability.json`
members: measurement volume, BTC price posture, fit contributor route, ledger/database roots
theoremIds: settlement-traceable-to-fits, compensation-conserved
replayStepIds: run V38 Gate 8 and Gate 10 checks
witnessArtifactPaths: settlement receipts and compensation route roots
current member closure criteria: fits remain traceable into settlement and compensation
current member verdict shape: conserved, blocked, or repair-required
current theorem-by-theorem closure reading: source-to-shares and fees remain exact
current theorem-to-replay grouping: fit provenance, pricing, settlement, rights transfer
minimum artifact/replay binding set: fit ids, fee quote, settlement root, compensation root
current proof-object fields: fitIds, btcAmount, ledgerRoot, databaseRoot
generated-artifact and test bindings: V38 Gate 8 and Gate 10 artifacts
fail-closed conditions: settlement conservation drift, projection mismatch, stale quote

### Disclosure-boundary

proofArtifactPath: `.bitcode/v38-disclosure-boundary-report.json`
members: source-safe preview, public telemetry, buyer telemetry, reviewer telemetry, operator telemetry
theoremIds: preview-does-not-leak-source, telemetry-tier-correct
replayStepIds: run V38 Gate 5 through Gate 10 checks
witnessArtifactPaths: stream events, telemetry roots, redaction receipts
current member closure criteria: every disclosure has a tier and forbidden payload list
current member verdict shape: source-safe, redacted, blocked, or failed
current theorem-by-theorem closure reading: source-safe previews remain non-source until settlement
current theorem-to-replay grouping: prompt disclosure, result disclosure, preview disclosure
minimum artifact/replay binding set: event id, tier, payload class, redaction root
current proof-object fields: eventId, tier, payloadClass, verdict
generated-artifact and test bindings: V38 Gate 5 and Gate 9 checks
fail-closed conditions: public projection overexposure, unpaid AssetPack source leakage

### Proof-contract

proofArtifactPath: `BITCODE_SPEC_V38_PROVEN.md`
members: spec family, generated artifacts, checks, workflows, promotion evidence
theoremIds: promotion-proof-complete, generated-appendix-current
replayStepIds: run V38 Gate 11 promotion readiness checks
witnessArtifactPaths: V38 generated proof appendix and `.bitcode/v38-*` artifacts
current member closure criteria: every closed gate has generated, tested, source-safe proof
current member verdict shape: promoted, draft, blocked, or stale
current theorem-by-theorem closure reading: promotion is accepted only with complete proof
current theorem-to-replay grouping: gate checks, generated proof, promotion workflow
minimum artifact/replay binding set: artifact root, command, commit, verdict
current proof-object fields: artifactRoot, command, commit, verdict
generated-artifact and test bindings: V38 Gate 11 and promotion workflow
fail-closed conditions: stale promoted status truth, missing proof, unsafe generated payload

## generated canon

Generated canon for V38 includes source-safe `.bitcode/v38-*` artifacts, generated reports, benchmark reports, rehearsal evidence, and the eventual `BITCODE_SPEC_V38_PROVEN.md`.
Generated artifacts must be reproducible, deterministic where possible, and blocked when source-safe payload rules fail.
Inherited V19 reproducible-canon artifacts remain the baseline for deterministic generated proof.
Inherited V20 operator-quality artifacts remain the baseline for operator-visible quality.
Exact generated-artifact inventory matrix includes `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, and later `.bitcode/v38-*` gate artifacts.
V38 specifying generated artifacts include inference inventory, prompt benchmark, telemetry disclosure, depository search, AssetPack handoff, rehearsal, and promotion readiness reports.
Shared generated-artifact fields: version, currentTarget, artifactRoot, sourceRoots, proofRoots, disclosureTier, generatedAt, and command.
Artifact-specific generated payload fields: prompt ids, PromptPart ids, phase ids, agent ids, step ids, Failsafe ids, ThricifiedGeneration ids, tool ids, fit ids, ranking roots, and settlement roots.
Artifact confidentiality and disclosability taxonomy: public, source-safe, buyer-visible, reviewer-visible, operator-only, and forbidden.

## validation canon

Validation canon includes `pnpm run check:v38-gate1`, `pnpm run check:v38-gate2`, `pnpm run check:v38-gate3`, `pnpm run check:v38-gate4`, `pnpm run check:v38-gate5`, later V38 gate checks, `node scripts/check-bitcode-spec-family.mjs --version V38 --mode draft --current-target V37`, `node scripts/check-bitcode-canonical-inputs.mjs --current-target V37`, `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V37 --draft-target V38`, package tests, route tests, UI tests, prompt benchmark checks, telemetry redaction checks, and local/staging rehearsal checks.

## promotion canon

Promotion canon requires all V38 gates to close, V38 proof support to exist, a V38 promotion workflow to pass, and the promotion commit to change only accepted canon artifacts and the `BITCODE_SPEC.txt` pointer from V37 to V38.
The V38 promotion readiness canon is `.bitcode/v38-promotion-readiness-report.json`, `BITCODE_SPEC_V38_PROVEN.md`, `v38-canon-promotion.yml`, `check:v38-gate11`, `node scripts/promote-bitcode-canon.mjs --version V38 --commit HEAD --dry-run`, and the V38 active / draft V39 posture checks.

## appendices and canonical supporting material

The appendices below are canonical supporting material for V38 gate work.

## Appendix A. Canonical type and surface catalog

Canonical types include `PipelineExecution`, PTRR agent config, Plan/Try/Refine/Retry step receipts, Failsafe receipts, ThricifiedGeneration receipts, ToolExecution receipts, PromptPart, Prompt, prompt template, interpolation binding, Need, fit candidate, selected fit, AssetPack preview, settlement receipt, and telemetry event.

## Appendix B. Proof family closure catalog

The proof family closure catalog is the nine proof-family canon above.
Each family must close with proofArtifactPath, members, theoremIds, replayStepIds, witnessArtifactPaths, current member closure criteria, current member verdict shape, current theorem-by-theorem closure reading, current theorem-to-replay grouping, minimum artifact/replay binding set, current proof-object fields, generated-artifact and test bindings, and fail-closed conditions.

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v38-inference-surface-inventory.json`; `.bitcode/v38-ptrr-failsafe-thricified-stack.json` | phases, agents, steps, failsafes, generations | inference-stack-totality | v38-gate2, v38-gate3 | prompt receipts, generation receipts | `packages/agent-generics`, `packages/pipelines/asset-pack` |
| Prompt-completeness | `.bitcode/v38-prompt-benchmark-report.json` | PromptParts, Prompts | prompt-registry-totality | v38-gate4 | benchmark fixtures | `packages/prompts` |
| Static-code-analysis | `.bitcode/v38-static-inference-boundary-report.json` | imports, routes, scans | source-boundary-conformance | gate-quality | workflow logs | scripts and workflows |
| Verification-decisions | `.bitcode/v38-verification-decision-report.json` | Need, fits, previews | verification-is-typed | v38-gate6, v38-gate7, v38-gate8 | verification reports | Reading pipeline packages |
| Selection-and-materialization | `.bitcode/v38-read-fits-finding-search-embeddings.json`; `.bitcode/v38-assetpack-synthesis-economic-traceability.json` | candidates, selected fits, AssetPack handoff | selected-fits-traceable | v38-gate7, v38-gate8 | selected-source material | depository search and synthesis packages |
| Authorization-and-sensitive-flow | `.bitcode/v38-sensitive-flow-report.json` | visibility tiers, redaction | sensitive-flow-redacted | v38-gate5, v38-gate9 | redaction receipts | API and UI redaction paths |
| Settlement-source-to-shares | `.bitcode/v38-assetpack-synthesis-economic-traceability.json` | fees, contributors, rights | settlement-traceable-to-fits | v38-gate8, v38-gate10 | settlement receipts | BTD and Reading packages |
| Disclosure-boundary | `.bitcode/v38-disclosure-boundary-report.json` | prompt, result, preview tiers | preview-does-not-leak-source | v38-gate5, v38-gate9 | telemetry events | V35/V37/V38 telemetry surfaces |
| Proof-contract | `BITCODE_SPEC_V38_PROVEN.md` | spec, artifacts, workflows | promotion-proof-complete | v38-gate11 | generated proof appendix | `packages/protocol` |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

Inherited V19 reproducible-canon artifacts remain the baseline for deterministic generated proof.

### Inherited V20 operator-quality artifacts

Inherited V20 operator-quality artifacts remain the baseline for operator-visible quality.

### Exact generated-artifact inventory matrix

Exact generated-artifact inventory matrix includes `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, and later `.bitcode/v38-*` gate artifacts.

### V38InferenceSurfaceInventory

`V38InferenceSurfaceInventory` is the Gate 2 source-safe inference surface inventory.
It is owned by `packages/protocol/src/canonical/inference-surface-inventory.js`, exported by `packages/protocol/src/index.js`, type-declared by `packages/protocol/src/index.d.ts`, tested by `packages/protocol/test/v38-inference-surface-inventory.test.js`, generated by `scripts/generate-v38-inference-surface-inventory.mjs`, checked by `scripts/check-v38-gate2-inference-surface-inventory.mjs`, and serialized to `.bitcode/v38-inference-surface-inventory.json`.
It records the current active Reading and Conversation inference surface map as source-safe metadata: `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Website Conversation inference, stream-event interface entrypoints, doc-comment-backed tool prompt definitions, prompt registry and benchmark coverage, and the execution primitive stack.
Its current count contract is 52 PTRR steps across 156 FailsafeGenerationSequence / ThricifiedGeneration chains and 468 provider-call slots. Gate 9 removes the quick-response Conversation single-step repair marker by routing that variation through the same PTRR/Failsafe/Thricified stack while preserving the inventory row as source-safe metadata.

### V38PtrrFailsafeThricifiedStack

`V38PtrrFailsafeThricifiedStack` is the Gate 3 source-safe stack contract for practical PTRR agents.
It is owned by `packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js`, exported by `packages/protocol/src/index.js`, type-declared by `packages/protocol/src/index.d.ts`, tested by `packages/protocol/test/v38-ptrr-failsafe-thricified-stack.test.js`, generated by `scripts/generate-v38-ptrr-failsafe-thricified-stack.mjs`, checked by `scripts/check-v38-gate3-ptrr-failsafe-thricified-stack.mjs`, and serialized to `.bitcode/v38-ptrr-failsafe-thricified-stack.json`.
It records `source-safe-ptrr-failsafe-thricified-stack-metadata`: the `factoryAgentWithPTRR` prompt carrier, Plan/Try/Refine/Retry step factories, `FailsafeGenerationSequence`, `ThricifiedGeneration`, prompt/context/telemetry substeps, step-owned tool postprocess boundaries, and the Gate 2 count binding.
Its current source-predicate contract is 69/69 passed predicates, 9 rows, 52 PTRR steps, 156 Failsafe sequences, 156 ThricifiedGeneration chains, 468 provider-call slots, and no protected source, credentials, unpaid AssetPack source, or `_legacy/` source roots.

### V38 specifying generated artifacts

V38 specifying generated artifacts include inference inventory, prompt benchmark, telemetry disclosure, depository search, AssetPack handoff, rehearsal, and promotion readiness reports.

### V38InferencePromotionReadinessReport

`V38InferencePromotionReadinessReport` is the Gate 11 source-safe V38 promotion readiness contract.
It is owned by `packages/protocol/src/canonical/inference-promotion-readiness-report.js`, exported by `packages/protocol/src/index.js`, type-declared by `packages/protocol/src/index.d.ts`, tested by `packages/protocol/test/v38-promotion-readiness.test.js`, generated by `scripts/generate-v38-promotion-readiness-report.mjs`, checked by `scripts/check-v38-gate11-promotion-readiness.mjs`, and serialized to `.bitcode/v38-promotion-readiness-report.json`.
It records `source-safe-inference-promotion-readiness-metadata`: all V38 gate artifacts, V38 generated proof outputs, promotion workflow coverage, gate/canon workflow coverage, promotion command support, spec-family/runtime promotion support, proven-generator support, V37 active / V38 draft pre-promotion posture, V38 active / draft V39 post-promotion posture, direct-main push denial, and blocked value-bearing mainnet posture.
Its current source-predicate contract is all V38 Gate 2 through Gate 10 artifacts parseable and source-safe, documentation/source evidence complete, V38 promotion workflow wired, `BITCODE_SPEC_V38_PROVEN.md` generation supported, and no protected source, raw protected prompt, raw provider response content, unpaid AssetPack source, credentials, private wallet material, private settlement payload, or `_legacy/` source roots.

### V38ConversationToolPromptInferenceParity

`V38ConversationToolPromptInferenceParity` is the Gate 9 source-safe Conversation and tool-definition prompt parity contract.
It is owned by `packages/protocol/src/canonical/conversation-tool-prompt-inference-parity.js`, exported by `packages/protocol/src/index.js`, type-declared by `packages/protocol/src/index.d.ts`, tested by `packages/protocol/test/v38-conversation-tool-prompt-inference-parity.test.js`, generated by `scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs`, checked by `scripts/check-v38-gate9-conversation-tool-prompt-inference-parity.mjs`, and serialized to `.bitcode/v38-conversation-tool-prompt-inference-parity.json`.
It records `source-safe-conversation-tool-prompt-inference-parity-metadata`: comprehensive and quick-response Conversation PTRR variations, Conversation agent and step prompt registries, typed output schemas, stream events, telemetry proof hooks, execution-log rendering, DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App doc-code prompt carriers, read-access and organization-authority checks, and interface entrypoint no-bypass posture.
Its current source-predicate contract is 34/34 passed predicates, 8 rows, upstream roots from V38 Gates 2, 4, and 5, and no protected source, raw prompt text, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, global ledger authority claim, or `_legacy/` source roots.

### V38InferenceTelemetryDisclosureReport

`V38InferenceTelemetryDisclosureReport` is the Gate 5 source-safe inference telemetry and disclosure tier contract.
It is generated to `.bitcode/v38-disclosure-boundary-report.json` as `source-safe-inference-telemetry-disclosure-metadata`.
It binds phase, agent, PTRR step, Failsafe, ThricifiedGeneration, tool, prompt template, interpolated prompt, raw response, parsed output, schema verdict, retry, repair, and stream UI projection rows to allowed payload fields, forbidden payload classes, proof roots, storage targets, stream event kinds, fail-closed states, and source predicates.
Its current count contract is 8 rows, 13 required telemetry levels, 12 disclosure tier ids, 66 passed predicates, no legacy source roots, and no public raw provider response, protected source, credential, wallet private material, private settlement payload, or unpaid AssetPack source visibility.

### V38ReadNeedComprehensionInferenceHardening

`V38ReadNeedComprehensionInferenceHardening` is the Gate 6 source-safe ReadNeedComprehensionSynthesis inference-hardening contract.
It is owned by `packages/protocol/src/canonical/read-need-comprehension-inference-hardening.js`, exported by `packages/protocol/src/index.js`, type-declared by `packages/protocol/src/index.d.ts`, tested by `packages/protocol/test/v38-read-need-comprehension-inference-hardening.test.js`, generated by `scripts/generate-v38-read-need-comprehension-inference-hardening.mjs`, checked by `scripts/check-v38-gate6-read-need-comprehension-inference-hardening.mjs`, and serialized to `.bitcode/v38-read-need-comprehension-inference-hardening.json`.
It records `source-safe-read-need-comprehension-inference-hardening-metadata`: request normalization, Need comprehension, Need measurement, Need review, source-safe inference receipt fields, route/UI resynthesis support, accepted-Need admission boundary, and upstream roots from V38 Gates 2 through 5.
Its current source-predicate contract is 22/22 passed predicates, 5 rows, 4 phases, 4 PTRR agents, 16 PTRR steps, 48 Failsafe sequences, 48 ThricifiedGeneration chains, 144 provider-call slots, and no protected source, raw provider response content, credentials, unpaid AssetPack source, private wallet material, private settlement payload, or `_legacy/` source roots.

### Shared generated-artifact fields

Shared generated-artifact fields: version, currentTarget, artifactRoot, sourceRoots, proofRoots, disclosureTier, generatedAt, and command.

### Artifact-specific generated payload fields

Artifact-specific generated payload fields: prompt ids, PromptPart ids, phase ids, agent ids, step ids, Failsafe ids, ThricifiedGeneration ids, tool ids, fit ids, ranking roots, and settlement roots.

### Artifact confidentiality and disclosability taxonomy

Artifact confidentiality and disclosability taxonomy: public, source-safe, buyer-visible, reviewer-visible, operator-only, and forbidden.

### Minimum generated appendix rendered contents

The generated appendix must include aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when generated proof evidence is stale, missing, or unsafe.

### Canonical regeneration and fail-closed posture

Canonical regeneration and fail-closed posture require V38 scripts to regenerate artifacts deterministically and fail closed on missing source roots, missing prompt ids, missing schema verdicts, unsafe telemetry payloads, stale proof-source commit, or mismatched canonical pointer.

## Appendix D. Validation and checking gate catalog

V38 validation begins with `check:v38-gate1` and expands through Gate 11.
Gate checks must be scriptable, workflow-wired, source-safe, and specific enough to identify the missing source or artifact.

## Appendix E. Current canonical source map

Current source map roots include `packages/agent-generics`, `packages/prompts`, `packages/tools-generics`, `packages/pipelines/asset-pack`, `packages/protocol`, `packages/api`, `uapi`, `.github/workflows`, `scripts`, and `protocol-demonstration` as a standalone minimal witness.

## Appendix F. Subsystem totality and derivability matrix

Subsystem totality coverage includes repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The V38 file family is `BITCODE_SPEC_V38.md`, `BITCODE_SPEC_V38_DELTA.md`, `BITCODE_SPEC_V38_NOTES.md`, `BITCODE_SPEC_V38_PARITY_MATRIX.md`, and eventually `BITCODE_SPEC_V38_PROVEN.md`.
Promotion may update `BITCODE_SPEC.txt` only after all gates close and promotion validation succeeds.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include Terminal, Conversations, API, MCP API, ChatGPT App, Auxillaries, Exchange, generated proof reports, dashboards, runbooks, and local/staging rehearsal surfaces.
V38 operator quality requires collapsed readable state and expanded source-safe detail for inference telemetry.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Scenario and workflow coverage includes auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable workflows.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed conditions include invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack and artifact contracts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V38_PROVEN.md`.
V38 may expose only source-safe preview metadata before settlement.

## accepted boundaries and reopen conditions

Accepted boundaries: V38 can harden inference, prompt benchmarking, search, telemetry, and traceability; V38 cannot change BTD supply law, route versioning discipline, mainnet admission, or settlement finality law without explicit later promotion.
Reopen conditions: evidence of prompt leakage, inference bypassing primitives, untraceable fit selection, unsafe telemetry, broken depository search, or stale generated proof.

## completion condition

V38 is complete only when every V38 gate is implemented, specified, tested, documented, generated, workflow-wired, source-safe, locally/staging rehearsed where applicable, and promotion-ready with `BITCODE_SPEC_V38_PROVEN.md` support.
