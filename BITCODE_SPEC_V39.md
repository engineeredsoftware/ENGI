# Bitcode Spec V39

## Status

- Version: `V39`
- V39 state: canonical promotion complete; V39 is the active commercial Reading readiness canon and the V39 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V39`
- Canonical proof-source commit: `1fe583d781bd24f340e5bb89ecc67ef740cf018c`
- Draft proof-source commit: unbound until V39 promotion
- Prior canonical anchor: `BITCODE_SPEC_V38.md`
- Prior generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md`
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V38`
- Generated structured artifact inventory: active canonical `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, `.bitcode/v39-promotion-readiness-report.json`, V39 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V39_PROVEN.md` as the generated proof appendix for V39 promotion
- Source parity state: V39 source-side Depository supply indexing, enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry repair readback, interface parity, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V39 file family
- Notes companion: `BITCODE_SPEC_V39_NOTES.md`
- Delta companion: `BITCODE_SPEC_V39_DELTA.md`
- Parity companion: `BITCODE_SPEC_V39_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md` only after V39 promotion
- Scope: V39 canonical system specification for commercial Reading readiness across Depository supply indexing, enterprise Reading UX, ReadNeed review, Finding Fits, source-safe AssetPack preview/quote, settlement, BTD rights transfer, delivery, telemetry/repair, interface parity, local/staging rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V39`

## Version executive summary

V39 is the commercial Reading readiness version.
It follows V38 by preserving the inference stack V38 made exact and applying it to the complete enterprise buyer path: request a read, review or resynthesize Bitcode's Need comprehension, request Finding Fits, review a source-safe AssetPack preview and deterministic BTC quote, settle, receive BTD rights, and receive the full AssetPack only after settlement unlock.

V39 must turn the source-safe pipeline surfaces promoted through V28-V38 into a reliable product flow.
Deposits must be indexed and searchable as Depository supply.
`ReadNeedComprehensionSynthesis` must store reviewable Needs and resynthesis history.
`ReadFitsFindingSynthesis` must search many candidate deposits above threshold, rank and verify them, preserve selected-fit provenance, and feed synthesis without leaking unpaid source.
AssetPack preview must expose only measurements, fit reasons, quality posture, proof roots, pricing posture, and non-source metadata before settlement.
Settlement must produce auditable BTC, BTD rights-transfer, source-to-shares compensation, ledger/database/storage, delivery, and repair receipts.
Terminal and Conversation surfaces must present the flow as a clear five-step enterprise Reading experience while keeping expandable source-safe detail for operators.

## V39 commercial Reading law

V39 uses the existing primitive names precisely:

- `PipelineExecution` owns phase ordering, phase inputs, phase outputs, ancestry state, phase receipts, and pipeline telemetry.
- PTRR agents own `Plan`, `Try`, `Refine`, and `Retry` steps plus agent-level prompt registry composition.
- PTRR steps own their prompt registries, selected tools, Failsafe usage, typed step outputs, step receipts, and step telemetry.
- `FailsafeGenerationSequence` owns context preparation, large input handling, large output handling, stitch or summarization loops, and repair orchestration around the final typed inference chain.
- `ThricifiedGeneration` owns the lowest-level Reason, Judge, and StructuredOutput inference calls.
- `ToolExecution` owns callable tool input, execution, output, errors, and receipts.
- `DocCodeToolPrompt` and `formatUsableTools` own doc-comment-backed tool definitions that are injected into final prompts when tools are available to a step.

Tools are step-owned capabilities.
They are not hidden children of `ThricifiedGeneration`, but tool documentation must still be available to the final prompt material consumed by `ThricifiedGeneration`.
Every inference envelope must preserve template identity, prompt part identity, interpolated prompt, context bindings, selected tools, raw response presence, parsed typed result, schema verdict, retry or repair state, disclosure tier, proof root, and execution ancestry root at the permitted telemetry tier.

The enterprise Reading product path has five user-visible stages:

1. Request Read: capture repository/deposit anchors, enterprise intent, constraints, disclosure posture, and target outcome.
2. Review Synthesized Need: run `ReadNeedComprehensionSynthesis`, show a reviewable Need, and allow feedback-driven resynthesis without admitting Finding Fits until accepted.
3. Request Finding Fits: run `ReadFitsFindingSynthesis` against the Depository using accepted Need measurements, query plans, tools, embeddings, and ranking thresholds.
4. Review Synthesized AssetPack Preview: show only source-safe measurements, fit reasons, proof roots, quality posture, pricing quote, selected-fit provenance, and delivery posture.
5. Buy AssetPack And Settle: observe BTC payment, transfer BTD rights, unlock source-bearing delivery, create or repair the pull request, and synchronize ledger/database/storage receipts.

## V39 Reading pipeline focus

`ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` are the primary Reading pipelines under V39.
They must be audited from phase to agent to step to Failsafe substep to Thricified generation to tool to typed output.
The audit must count every inference point separately, name the prompts and PromptParts used by that point, define input context, define output schemas, define failure or repair behavior, and identify where the result is stored and streamed.

`ReadNeedComprehensionSynthesis` must synthesize an enterprise user's Read Request into a reviewable Need that says exactly what should be read, what must not be over-inferred, which repository/deposit constraints apply, and what measurements drive fit-finding.

`ReadFitsFindingSynthesis` must discover many possible fits, not one fit.
It must gather above-threshold deposits from the Depository, rank and verify those candidates, preserve found-fit provenance, and hand the selected fits into AssetPack synthesis.
Before settlement, the Reader may see only source-safe measurements, fit reasons, quality posture, pricing posture, proof roots, and preview metadata.
After settlement, delivery may cross the visibility boundary and provide the full AssetPack source as governed by BTD rights transfer and ledger/database synchronization.

## V39 gate plan

### Gate 1: Commercial Reading Roadmap And Spec Opening

Gate 1 opens V39 correctly:

- V39 SPEC, DELTA, NOTES, and PARITY files exist over active V38.
- `BITCODE_SPEC.txt` remains `V38`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V38 active / V39 draft posture.
- `check:v39-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, inference vocabulary, depository-search vocabulary, and promotion boundaries.
- The V39 gate list is explicit before inference implementation begins.

### Gate 2: Depository Supply Indexing And Searchable Deposit Lifecycle

Gate 2 closes Depository supply reality for Reading.
It must make deposited source materials measurable, indexable, vector-searchable, metadata-searchable, rights-aware, and repairable as the source set that Finding Fits can search.
The gate is closed by package-backed source, deterministic source-safe artifact generation, deposit lifecycle tests, embedding/vector policy tests, Supabase/storage projection readback, and a checker that proves no protected source or credentials enter public artifacts.

Gate 2 introduces `DepositorySupplyIndex` as the package-owned source-safe
index over deposited source supply. Each `DepositorySupplyRecord` binds
repository, branch, commit, proof root, measurement root, reconciliation
readback root, source-safe search documents, vector projection rows, storage
readback posture, repair actions, and the depositor/reader rights boundary.
Its search documents are lexical, metadata, measurement, and vector documents
derived from source-safe metadata only. Raw protected source remains stored
outside the index and is never visible to the Reader before settlement. The
active vector policy remains OpenAI `text-embedding-3-small`, 1536 dimensions,
cosine `match_deliverable_vectors`; rows that are missing or dimension-invalid
produce repair posture rather than pretending the corpus is searchable.
`ReadFitsFindingSynthesis` consumes the index by converting records into
source-safe `DepositoryAsset` candidates for Finding Fits.

### Gate 3: Enterprise Reading UX State Machine

Gate 3 implements the five-step enterprise Reading path in Terminal and connected Conversation handoffs.
The UX must default to clear low-detail guidance while preserving expandable source-safe operational detail for every step, pipeline run, quote, settlement, and delivery state.
The gate is closed by route state contracts, component tests, browser proof, stream-log integration, and source-safe disclosure tests.
The implementation basis is `TerminalEnterpriseReadingUxState`, exported from
`apps/uapi/app/terminal/terminal-enterprise-reading-ux-state.ts`, with five stable
steps: `request-read`, `review-synthesized-need`, `request-fit`,
`review-synthesized-asset-pack`, and `buy-asset-pack-settle`.
Conversation handoffs may carry only source-safe stage intent through the
`readingStage` query parameter and `terminalEnterpriseReadingStage` metadata;
Terminal remains the transaction authority. The generated source-safe proof
artifact is `.bitcode/v39-enterprise-reading-ux-state.json`, checked by
`pnpm run check:v39-gate3`.

### Gate 4: ReadNeed Review, Resynthesis, And Admission Runtime

Gate 4 makes `ReadNeedComprehensionSynthesis` a real review loop.
It must persist Read Requests, synthesized Needs, feedback, resynthesis attempts, Need measurements, accepted-Need admission, rejected-Need posture, and telemetry receipts.
Finding Fits remains blocked until a reviewed Need is accepted.
The implementation basis is `ReadNeedReviewResynthesisRuntime`, exported from
`packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts`. It projects
source-safe storage records for `read_request`, `synthesized_need`, `feedback`,
`resynthesis_attempt`, `need_measurement`, `accepted_need_admission`,
`rejected_need_posture`, and `telemetry_receipt`. The generated source-safe
proof artifact is `.bitcode/v39-read-need-review-resynthesis.json`, checked by
`pnpm run check:v39-gate4`. Rejected or unaccepted Needs must emit Finding Fits
blockers; only `acceptReadNeed` may produce Finding Fits admission.

### Gate 5: ReadFitsFinding Runtime, Ranking, And Replay

Gate 5 makes `ReadFitsFindingSynthesis` search the whole available Depository for many candidate deposits.
It must execute inference-derived query planning, lexical/symbolic/path/metadata/measurement/vector/provider channels, threshold ranking, verification, selected-fit provenance, replay receipts, and repair paths over the accepted Need.
The active vector policy remains OpenAI `text-embedding-3-small`, 1536 dimensions, cosine similarity, and `match_deliverable_vectors` until a tested migration is specified.
The implementation basis is `ReadFitsFindingRuntime`, exported from
`packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts`. It wraps
the depository search result with `ReadFitsFindingReplayReceipt`,
`ReadFitsFindingStorageRecord`, `ReadFitsFindingTelemetryReceipt`, and
`ReadFitsFindingRepairPosture` projections so an accepted Need can replay the
source-safe query plan, ranking root, selected-fit provenance root, embedding
policy, and candidate counts without exposing protected source or unpaid
AssetPack source. The generated source-safe proof artifact is
`.bitcode/v39-read-fits-finding-runtime.json`, checked by
`pnpm run check:v39-gate5`.

### Gate 6: AssetPack Preview, Quote, And Disclosure Boundary

Gate 6 makes source-safe AssetPack preview reviewable and actionable without leaking source.
It must synthesize a preview from selected fits, expose fit measurements, quality reasons, proof roots, deterministic BTC quote, selected-fit provenance, delivery posture, and settlement instructions while withholding source-bearing AssetPack content until paid.
The implementation basis is `AssetPackPreviewBoundary`, exported from
`packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`. It wraps
`AssetPackSourceSafePreview`, `AssetPackPreviewQuoteReceipt`,
`AssetPackDisclosureReview`, `AssetPackPreviewSettlementInstructions`,
`AssetPackPreviewDeliveryPosture`, `AssetPackPreviewReplayReceipt`, and
`AssetPackPreviewRepairPosture` so preview review is sufficient for buyer review
without exposing protected source, raw protected prompts, raw provider
responses, credentials, wallet private material, private settlement payloads,
or unpaid AssetPack source. The deterministic proof artifact is
`.bitcode/v39-assetpack-preview-quote-boundary.json`, checked by
`pnpm run check:v39-gate6`.

### Gate 7: Settlement, BTD Rights Transfer, And Delivery

Gate 7 closes the paid boundary.
It must observe BTC settlement, bind finality, mint or transfer the relevant BTD rights, allocate source-to-shares compensation to contributors, unlock source-bearing AssetPack delivery, create or repair the pull request, and synchronize ledger/database/object-storage receipts.
The implementation basis is `AssetPackSettlementRightsDeliveryBoundary`,
exported from
`packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`.
It composes BTD receipt primitives, source-to-shares compensation,
settlement-unlock readback, and ledger/database/object-storage reconciliation
into a source-safe paid-boundary receipt. It emits
`AssetPackSettlementPaymentObservation`,
`AssetPackSettlementFinalityReceipt`, `SourceToSharesProof`,
`BtdRightsTransferReceipt`, `BtdReadReceipt`,
`AssetPackDeliveryUnlockReceipt`,
`AssetPackSettlementRightsDeliveryReplayReceipt`, and repair posture records
without serializing protected source, private wallet material, private
settlement payloads, credentials, raw protected prompts, or raw provider
responses. The deterministic source-safe proof artifact is
`.bitcode/v39-settlement-rights-delivery.json`, checked by
`pnpm run check:v39-gate7`.

### Gate 8: Operational Telemetry, Repair, And Operator Readback

Gate 8 makes the Reading product observable and repairable.
It must stream source-safe phase, agent, step, Failsafe, ThricifiedGeneration, tool, storage, ledger, wallet, delivery, and UI events into the rich execution log and operator readback surfaces with proof roots and runbook hooks.

The package-owned closure type is `ReadingOperationalTelemetryRepairReadback`
in
`packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts`.
It projects `ReadNeedComprehensionSynthesis` and
`ReadFitsFindingSynthesis` pipeline contracts into
`ReadingOperationalTelemetryEvent` rows for phase, PTRR agent, PTRR step,
`FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`,
storage, ledger, wallet, delivery, UI, and repair posture. Each event carries
`ReadingOperationalExecutionState` with event id, proof root,
prompt-template identity, output schema/return type, redaction posture,
prompt disclosure posture, result disclosure posture, and fail-closed state
where applicable.

The operator readback persists `ReadingOperationalOperatorReadback`,
source-safe stream events, repair runbook hooks, telemetry roots, repair
roots, and readback roots under `reading/operational`. The shared rich
execution log accepts direct operational telemetry payloads and renders
Reading pipeline, phase, PTRR agent, PTRR step, Failsafe, generation, tool,
schema, event, proof, disclosure, and fail-closed metadata in collapsed rows
with expandable details. No operational artifact may serialize protected
source, raw protected prompts, raw interpolated prompts, raw provider
responses, unpaid AssetPack source, wallet private material, private
settlement payloads, or credentials. The deterministic source-safe proof
artifact is `.bitcode/v39-operational-telemetry-repair-readback.json`,
checked by `pnpm run check:v39-gate8`.

### Gate 9: Interface And Conversation Product Parity

Gate 9 brings Conversation, MCP/API, ChatGPT App, and package-facing interfaces into the same Reading contract without creating parallel authority.
Every interface must respect accepted-Need gating, source-safe preview, settlement unlock, BTD rights, and delivery boundaries.

The package-owned closure type is `ReadingInterfaceProductParity` in
`packages/pipelines/asset-pack/src/reading-interface-product-parity.ts`.
It projects Terminal, Conversation, public API, MCP API, ChatGPT App, and
package-consumer surfaces into one source-safe contract. Conversation is a
Terminal-delegated handoff, package consumers receive contract readback only,
and API/MCP/ChatGPT actions compose the existing BTD interface contract,
read-license, AssetPack-rights, telemetry hook, and consumer UX primitives.
Every `ReadingInterfaceProductParityRow` proves accepted-Need gating,
Finding Fits admission, source-safe preview, settlement unlock, BTD rights,
authorized delivery, no parallel authority, and locked source-bearing delivery
before settlement and rights transfer. The deterministic source-safe proof
artifact is `.bitcode/v39-interface-conversation-product-parity.json`,
checked by `pnpm run check:v39-gate9`.

### Gate 10: Local And Staging Commercial Reading Rehearsal

Gate 10 proves V39 locally and in staging-testnet.
It must run the five-step Reading flow with real non-mocked inference where credentials are available, Depository search, source-safe preview, telemetry streaming/readback, ledger/database/storage synchronization, PR delivery posture, and blocked production-mainnet value-bearing admission.

The package-owned closure type is `ReadingLocalStagingRehearsal` in
`packages/pipelines/asset-pack/src/reading-local-staging-rehearsal.ts`. It
binds the local and staging-testnet lanes to the five Reading stages:
request read, review synthesized Need, request Finding Fits, review
source-safe AssetPack preview, and buy/settle. The rehearsal composes
`ReadNeedReviewResynthesisRuntime`, `ReadFitsFindingRuntime`,
`AssetPackPreviewBoundary`, `AssetPackSettlementRightsDeliveryBoundary`,
`ReadingOperationalTelemetryRepairReadback`, and
`ReadingInterfaceProductParity` by proof root and stores source-safe rows
under `reading/rehearsal`.

The staging-testnet lane is explicitly anchored to Supabase project
`tkpyosihuouusyaxtbau` and REST host
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`. Local and staging
rehearsals may use untracked env files or host-provided runtime credentials,
but generated artifacts, stream summaries, and storage projections must never
serialize credentials, protected source, raw protected prompts, raw
interpolated prompts, raw provider responses, unpaid AssetPack source, wallet
private material, private settlement payloads, or live log payloads.
Source-bearing pull-request delivery remains visible only after settlement
and BTD rights transfer; value-bearing mainnet admission remains false. The
deterministic source-safe proof artifact is
`.bitcode/v39-local-staging-reading-rehearsal.json`, checked by
`pnpm run check:v39-gate10`.

### Gate 11: V39 Promotion Readiness

Gate 11 closes V39 with promotion readiness.
It must generate V39 proof support, validate every V39 artifact, update promotion workflows, preserve V38 active / V39 draft to V39 active / draft V40 posture, and block promotion if Depository supply, Reading UX, Need review, Finding Fits, preview/quote, settlement/delivery, telemetry/repair, interface parity, local/staging rehearsal, or source-safety evidence is incomplete.
The package-owned closure type is `V39CommercialReadingPromotionReadinessReport`; the deterministic source-safe artifact is `.bitcode/v39-promotion-readiness-report.json`, checked by `pnpm run check:v39-gate11`.

## V39 non-goals

- V39 does not change BTD supply law, Bitcoin settlement law, Exchange law, or production-mainnet admission unless a later promoted canon explicitly does so.
- V39 does not introduce versioned routes, versioned API paths, or versioned source identifiers.
- V39 does not allow protected source, raw protected prompts, raw provider responses, unpaid AssetPack source, credentials, private wallet material, or private settlement payloads to appear in public telemetry.
- V39 does not replace the existing prompt, registry, execution, agent, tool, and pipeline primitives with a parallel abstraction stack.

## Canonical Bitcode executive summary

Bitcode is the commercial Protocol implementation for depositing, measuring, finding, synthesizing, settling, delivering, and proving technical intelligence as BTD and AssetPack activity.
V39 does not replace V38 canon; it deepens the inference machinery that lets Bitcode understand Read Requests, synthesize Needs, find many fits across the Depository, synthesize source-safe AssetPack previews, and deliver full AssetPacks only after settlement and rights transfer.

## source-of-truth hierarchy

The source-of-truth hierarchy for V39 is:

1. `BITCODE_SPEC.txt` points to active V38 until V39 promotion.
2. `BITCODE_SPEC_V38.md` and `BITCODE_SPEC_V38_PROVEN.md` remain active canon.
3. `BITCODE_SPEC_V39.md`, `BITCODE_SPEC_V39_DELTA.md`, `BITCODE_SPEC_V39_NOTES.md`, and `BITCODE_SPEC_V39_PARITY_MATRIX.md` are the draft target family during V39 gates.
4. Package source, tests, scripts, workflows, generated `.bitcode/*` artifacts, local/staging rehearsal evidence, and promotion checks must converge before V39 promotion.

## full-system, re-implementation, and audit rule

V39 work must preserve full-system auditability.
No implementation may bypass package-owned primitives for executions, pipelines, PTRR agents, prompt registries, tools, telemetry, BTD, ledger/database synchronization, object storage, or source-safe disclosure.
Any re-implementation must prove parity against the active primitive and may not fork an easier parallel path.

## totality and precision enforcement rule

V39 gates must make every inference edge total enough to audit: inputs, prompts, PromptParts, interpolation bindings, tools, outputs, raw provider responses, parsed typed results, schema verdicts, repairs, failures, storage destinations, streaming destinations, proof roots, and disclosure tiers must be precise before promotion.

## system goals, non-goals, and design principles

Goals: commercial inference correctness, reliable Reading intelligence, benchmarkable prompt materials, source-safe telemetry, depository-wide fit-finding, and settlement-traceable AssetPack synthesis.
Non-goals: value-bearing mainnet admission, BTD supply changes, bridge chain-of-record implementation, versioned routes, or provider-specific shortcuts without tests.
Design principles: reuse primitives, preserve typed receipts, fail closed, expose only permitted disclosure tiers, and make every prompt and search decision auditable.

## system architecture and layer boundaries

The V39 architecture boundary is `PipelineExecution -> PTRR agent -> PTRR step -> FailsafeGenerationSequence -> ThricifiedGeneration -> provider call`.
`ToolExecution` remains step-owned.
Prompt registry and PromptPart composition must flow downward from phase, agent, step, Failsafe, tool documentation, and generation prompt materials into the final provider call.
Ledger, wallet, object storage, GitHub delivery, and settlement operations remain outside inference authority and are invoked only through their existing package or route boundaries.

## canonical domain model

The V39 domain model carries the existing Bitcode objects: deposits, Reads, Read Requests, Needs, candidate fit deposits, AssetPacks, BTD ranges, preview measurements, settlement receipts, delivery receipts, proof roots, execution receipts, prompt receipts, tool receipts, telemetry events, and repair cases.
V39 adds no new chain-of-record object; it makes inference and fit-finding receipts precise enough to support the existing Protocol model.

## whole Bitcode operator chain

The whole operator chain is deposit source, measure deposited material, request a Read, synthesize a Need, review or resynthesize the Need, find many fitting deposits, synthesize a source-safe AssetPack preview, calculate deterministic settlement posture, settle in BTC when admitted, transfer BTD read rights, deliver the full AssetPack, journal database/ledger/object-storage projections, emit telemetry, and preserve proof roots for repair.

## canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: deposits, deposited source metadata, BTD range identity, source-safe proofs, and inherited `.bitcode/asset-pack.lock.json` style artifact roots.
Current algorithms and derivation rules: source measurement, source-to-shares accounting, deposit admissibility, and proof-root derivation remain inherited from V38 and prior canon.
Current invariants and fail-closed conditions: deposits cannot expose secrets or protected source beyond permitted tiers, and invalid deposit fails closed.
Current proof obligations: source measurement, disclosure boundary, static analysis, and proof contract evidence remain required.
Current source-bearing implementation basis: package source and route contracts outside `_legacy/`.
Current validating commands and parity basis: active V38 promoted checks plus V39 gate checks.
Current accepted boundaries: V39 only changes inference/search surfaces that consume deposits.

Gate 2 implementation basis: `packages/pipelines/asset-pack/src/depository-supply-index.ts` owns `DepositorySupplyIndex`, `DepositorySupplyRecord`, `DepositorySupplySearchDocument`, `DepositorySupplyVectorProjection`, and `DepositorySupplyStorageProjection`. The deterministic source-safe proof artifact is `.bitcode/v39-depository-supply-indexing.json`, generated by `pnpm run generate:v39-depository-supply-indexing` and checked by `pnpm run check:v39-gate2`.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Request, synthesized Need, prompt registry receipts, PromptPart benchmark fixtures, Failsafe receipts, ThricifiedGeneration receipts, and typed Need outputs.
Current algorithms and derivation rules: PTRR steps compose prompts and delegate to Failsafe and Thricified chains.
Current invariants and fail-closed conditions: prompt contract incompleteness and parsed-envelope inadmissibility fail closed.
Current proof obligations: Inference-synthesis and Prompt-completeness evidence must cover every active inference point.
Current source-bearing implementation basis: `packages/agent-generics`, `packages/prompts`, and `packages/pipelines/asset-pack`.
Current validating commands and parity basis: V39 Gate 2 through Gate 7 checks.
Current accepted boundaries: inference may understand and measure; settlement, rights transfer, and delivery may proceed only through paid-boundary receipts that agree.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: query receipts, search channel receipts, candidate deposits, ranking roots, threshold verdicts, selected-fit provenance, and verification evidence.
Current algorithms and derivation rules: inference-derived queries search lexical, symbolic, path, metadata, measurement, embedding/vector, and provider-specific channels before ranking.
Current invariants and fail-closed conditions: no-survivor asset pack and unsupported vector policy fail closed.
Current proof obligations: Selection-and-materialization, Verification-decisions, and Disclosure-boundary proofs.
Current source-bearing implementation basis: `depository-search.ts`, `read-fits-finding-runtime.ts`, `asset-pack-settlement-rights-delivery.ts`, `embedding-config.ts`, and depository-search tools.
Current validating commands and parity basis: V39 Gate 5 and Gate 7 checks, plus later Gate 8 handoff checks.
Current accepted boundaries: source-safe preview before settlement, full source only after paid rights transfer.

### Selection and materialization

Current canonical objects and emitted artifacts: AssetPack preview, AssetPack synthesis receipt, delivery PR receipt, `assetPackEvidence`, selected-source material, verification report, and proof bundle.
Current algorithms and derivation rules: selected fits are synthesized into an AssetPack only after source-safe preview posture and settlement/delivery boundaries are respected.
Current invariants and fail-closed conditions: unpaid AssetPack source cannot cross the Reader visibility boundary.
Current proof obligations: Selection-and-materialization and Settlement-source-to-shares proof evidence.
Current source-bearing implementation basis: Reading pipeline packages, GitHub delivery surfaces, BTD packages, and ledger/database projectors.
Current validating commands and parity basis: V39 Gate 8 through Gate 10 checks.
Current accepted boundaries: V39 can harden handoff and telemetry, not bypass payment.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: organization roles, account principals, wallet posture, policy decisions, signing authority boundaries, and sensitive-flow redaction receipts.
Current algorithms and derivation rules: policy checks gate source, wallet, settlement, delivery, and visibility transitions.
Current invariants and fail-closed conditions: authorization denial and private material exposure fail closed.
Current proof obligations: Authorization-and-sensitive-flow, Disclosure-boundary, and Static-code-analysis proofs.
Current source-bearing implementation basis: API packages, UAPI route boundaries, BTD packages, and V38 privacy redaction.
Current validating commands and parity basis: V39 Gate 5, Gate 8, and Gate 10 checks.
Current accepted boundaries: inference telemetry must never become an authorization bypass.

### Disclosure and projection

Current canonical objects and emitted artifacts: public, buyer, reviewer, internal, operator-only, and source-safe telemetry projections.
Current algorithms and derivation rules: each telemetry row is assigned a disclosure tier before storage, streaming, docs, or UI display.
Current invariants and fail-closed conditions: public projection overexposure fails closed.
Current proof obligations: Disclosure-boundary and Proof-contract evidence.
Current source-bearing implementation basis: V35 telemetry law, V38 stream UI, and V39 inference telemetry contracts.
Current validating commands and parity basis: V39 Gate 5 and Gate 9 checks.
Current accepted boundaries: raw protected prompts and raw provider responses are not public payloads.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTC fee quote, measurement volume, settlement receipt, ledger root, database projection root, BTD right transfer, contributor compensation route, and repair receipt.
Current algorithms and derivation rules: deterministic measurement weight times measurement volume informs pricing posture, and settlement finality governs delivery.
Current invariants and fail-closed conditions: settlement conservation drift, underpayment, stale quote, and projection mismatch fail closed.
Current proof obligations: Settlement-source-to-shares and Proof-contract evidence.
Current source-bearing implementation basis: BTD packages, Exchange settlement canon, Reading pipeline handoff, and repair jobs.
Current validating commands and parity basis: V39 Gate 8, Gate 10, and Gate 11 checks.
Current accepted boundaries: V39 does not change BTC law; it preserves inference-to-settlement traceability.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: generated proof appendix, spec-family reports, canonical-input reports, canon-posture drift reports, benchmark reports, inference receipts, tool receipts, telemetry roots, and rehearsal evidence.
Current algorithms and derivation rules: proof roots derive from deterministic artifacts and replayable command evidence.
Current invariants and fail-closed conditions: stale promoted status truth and missing generated proof evidence fail closed.
Current proof obligations: all nine proof families.
Current source-bearing implementation basis: `packages/protocol`, scripts, workflows, tests, and generated `.bitcode/*` artifacts.
Current validating commands and parity basis: V39 Gate 1 through Gate 11 checks.
Current accepted boundaries: generated proof cannot serialize credentials, protected source, unpaid AssetPack source, or private wallet material.

## proof-family canon

The V39 proof-family canon inherits all nine proof families and adds inference-focused closure criteria.

### Inference-synthesis

proofArtifactPath: `.bitcode/v39-inference-surface-inventory.json` and `.bitcode/v39-ptrr-failsafe-thricified-stack.json`
members: pipeline phases, PTRR agents, Plan/Try/Refine/Retry steps, Failsafe chains, ThricifiedGeneration calls, provider calls
theoremIds: commercial-reading-totality, typed-output-admissibility
replayStepIds: run V39 Gate 2 and Gate 3 checks
witnessArtifactPaths: prompt receipts, generation receipts, telemetry receipts
current member closure criteria: every inference point is counted and typed
current member verdict shape: passed, failed, or repair-required with proof root
current theorem-by-theorem closure reading: stack composition and typed output are replayable
current theorem-to-replay grouping: inventory, execution stack, telemetry
minimum artifact/replay binding set: source paths, prompt ids, schema ids, telemetry ids
current proof-object fields: proofRoot, phaseId, agentId, stepId, generationId, schemaVerdict
generated-artifact and test bindings: V39 Gate 2 and Gate 3 artifacts and tests
fail-closed conditions: missing prompt, missing schema, invalid typed output

### Prompt-completeness

proofArtifactPath: `.bitcode/v39-prompt-benchmark-report.json`
members: PromptParts, Prompts, templates, interpolation bindings, tool documentation
theoremIds: prompt-registry-totality, prompt-benchmark-coverage
replayStepIds: run V39 Gate 4 checks
witnessArtifactPaths: benchmark fixtures and reports
current member closure criteria: active prompts and PromptParts are benchmarkable
current member verdict shape: benchmark pass, benchmark fail, or missing fixture
current theorem-by-theorem closure reading: every active prompt has identity and expected qualities
current theorem-to-replay grouping: prompt inventory and benchmark suite
minimum artifact/replay binding set: prompt id, prompt part id, fixture id, result root
current proof-object fields: promptId, promptPartIds, fixtureRoot, qualityVerdict
generated-artifact and test bindings: V39 Gate 4 artifacts and tests
fail-closed conditions: missing prompt identity or unbound interpolation

### Static-code-analysis

proofArtifactPath: `.bitcode/v39-static-inference-boundary-report.json`
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

proofArtifactPath: `.bitcode/v39-verification-decision-report.json`
members: search verification, Need adequacy, fit quality, AssetPack preview quality
theoremIds: verification-is-typed, no-unverified-fit-selection
replayStepIds: run V39 Gate 6 through Gate 8 checks
witnessArtifactPaths: verification reports and selected-fit roots
current member closure criteria: verification decisions are typed and proof-rooted
current member verdict shape: accepted, rejected, blocked, or repair-required
current theorem-by-theorem closure reading: no fit or preview is accepted without evidence
current theorem-to-replay grouping: Need verification, fit verification, preview verification
minimum artifact/replay binding set: decision id, input root, output root, proof root
current proof-object fields: decisionId, state, reason, proofRoot
generated-artifact and test bindings: V39 Gate 6 through Gate 8 tests
fail-closed conditions: unsupported evidence, below-threshold fit, unverifiable preview

### Selection-and-materialization

proofArtifactPath: `.bitcode/v39-read-fits-finding-runtime.json`; `.bitcode/v39-settlement-rights-delivery.json`
members: candidate deposits, selected fits, AssetPack synthesis handoff, PR delivery
theoremIds: selected-fits-traceable, materialization-source-safe
replayStepIds: run V39 Gate 7 and Gate 8 checks
witnessArtifactPaths: selected-source material, verification report, AssetPack evidence
current member closure criteria: selected fit provenance survives synthesis handoff
current member verdict shape: selected, rejected, or blocked
current theorem-by-theorem closure reading: materialization follows from verified fits
current theorem-to-replay grouping: search, rank, select, synthesize
minimum artifact/replay binding set: fit id, deposit id, ranking root, synthesis root
current proof-object fields: fitId, depositRef, rankingRoot, synthesisRoot
generated-artifact and test bindings: V39 Gate 7 and Gate 8 artifacts
fail-closed conditions: no-survivor asset pack, untraceable fit, unpaid source exposure

### Authorization-and-sensitive-flow

proofArtifactPath: `.bitcode/v39-sensitive-flow-report.json`
members: source visibility, prompt visibility, wallet material, settlement payloads, credentials
theoremIds: sensitive-flow-redacted, authority-boundary-preserved
replayStepIds: run V39 Gate 5, Gate 8, and Gate 9 checks
witnessArtifactPaths: telemetry disclosure reports and redaction receipts
current member closure criteria: protected payloads are blocked or assigned permitted tiers
current member verdict shape: allowed, denied, redacted, or blocked
current theorem-by-theorem closure reading: authority and visibility do not leak through inference
current theorem-to-replay grouping: telemetry, prompt disclosure, delivery boundary
minimum artifact/replay binding set: payload class, visibility tier, redaction verdict
current proof-object fields: payloadClass, tier, verdict, proofRoot
generated-artifact and test bindings: V39 Gate 5 and Gate 9 tests
fail-closed conditions: authorization denial, credential exposure, private wallet exposure

### Settlement-source-to-shares

proofArtifactPath: `.bitcode/v39-assetpack-synthesis-economic-traceability.json`
members: measurement volume, BTC price posture, fit contributor route, ledger/database roots
theoremIds: settlement-traceable-to-fits, compensation-conserved
replayStepIds: run V39 Gate 8 and Gate 10 checks
witnessArtifactPaths: settlement receipts and compensation route roots
current member closure criteria: fits remain traceable into settlement and compensation
current member verdict shape: conserved, blocked, or repair-required
current theorem-by-theorem closure reading: source-to-shares and fees remain exact
current theorem-to-replay grouping: fit provenance, pricing, settlement, rights transfer
minimum artifact/replay binding set: fit ids, fee quote, settlement root, compensation root
current proof-object fields: fitIds, btcAmount, ledgerRoot, databaseRoot
generated-artifact and test bindings: V39 Gate 8 and Gate 10 artifacts
fail-closed conditions: settlement conservation drift, projection mismatch, stale quote

### Disclosure-boundary

proofArtifactPath: `.bitcode/v39-disclosure-boundary-report.json`
members: source-safe preview, public telemetry, buyer telemetry, reviewer telemetry, operator telemetry
theoremIds: preview-does-not-leak-source, telemetry-tier-correct
replayStepIds: run V39 Gate 5 through Gate 10 checks
witnessArtifactPaths: stream events, telemetry roots, redaction receipts
current member closure criteria: every disclosure has a tier and forbidden payload list
current member verdict shape: source-safe, redacted, blocked, or failed
current theorem-by-theorem closure reading: source-safe previews remain non-source until settlement
current theorem-to-replay grouping: prompt disclosure, result disclosure, preview disclosure
minimum artifact/replay binding set: event id, tier, payload class, redaction root
current proof-object fields: eventId, tier, payloadClass, verdict
generated-artifact and test bindings: V39 Gate 5 and Gate 9 checks
fail-closed conditions: public projection overexposure, unpaid AssetPack source leakage

### Proof-contract

proofArtifactPath: `BITCODE_SPEC_V39_PROVEN.md`
members: spec family, generated artifacts, checks, workflows, promotion evidence
theoremIds: promotion-proof-complete, generated-appendix-current
replayStepIds: run V39 Gate 11 promotion readiness checks
witnessArtifactPaths: V39 generated proof appendix and `.bitcode/v39-*` artifacts
current member closure criteria: every closed gate has generated, tested, source-safe proof
current member verdict shape: promoted, draft, blocked, or stale
current theorem-by-theorem closure reading: promotion is accepted only with complete proof
current theorem-to-replay grouping: gate checks, generated proof, promotion workflow
minimum artifact/replay binding set: artifact root, command, commit, verdict
current proof-object fields: artifactRoot, command, commit, verdict
generated-artifact and test bindings: V39 Gate 11 and promotion workflow
fail-closed conditions: stale promoted status truth, missing proof, unsafe generated payload

## generated canon

Generated canon for V39 includes source-safe `.bitcode/v39-*` artifacts, generated reports, benchmark reports, rehearsal evidence, and the eventual `BITCODE_SPEC_V39_PROVEN.md`.
Generated artifacts must be reproducible, deterministic where possible, and blocked when source-safe payload rules fail.
Inherited V19 reproducible-canon artifacts remain the baseline for deterministic generated proof.
Inherited V20 operator-quality artifacts remain the baseline for operator-visible quality.
Exact generated-artifact inventory matrix includes `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, and `.bitcode/v39-promotion-readiness-report.json`.
V39 specifying generated artifacts include Depository supply indexing, enterprise Reading UX state, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry/repair readback, interface parity, local/staging rehearsal, and promotion readiness reports.
Shared generated-artifact fields: version, currentTarget, artifactRoot, sourceRoots, proofRoots, disclosureTier, generatedAt, and command.
Artifact-specific generated payload fields: prompt ids, PromptPart ids, phase ids, agent ids, step ids, Failsafe ids, ThricifiedGeneration ids, tool ids, fit ids, ranking roots, and settlement roots.
Artifact confidentiality and disclosability taxonomy: public, source-safe, buyer-visible, reviewer-visible, operator-only, and forbidden.

## validation canon

Validation canon includes `pnpm run check:v39-gate1`, `pnpm run check:v39-gate2`, `pnpm run check:v39-gate3`, `pnpm run check:v39-gate4`, `pnpm run check:v39-gate5`, later V39 gate checks, `node scripts/check-bitcode-spec-family.mjs --version V39 --mode draft --current-target V38`, `node scripts/check-bitcode-canonical-inputs.mjs --current-target V38`, `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V38 --draft-target V39`, package tests, route tests, UI tests, prompt benchmark checks, telemetry redaction checks, and local/staging rehearsal checks.

## promotion canon

Promotion canon requires all V39 gates to close, V39 proof support to exist, a V39 promotion workflow to pass, and the promotion commit to change only accepted canon artifacts and the `BITCODE_SPEC.txt` pointer from V38 to V39.
The V39 promotion readiness canon is `.bitcode/v39-promotion-readiness-report.json`, `BITCODE_SPEC_V39_PROVEN.md`, `v39-canon-promotion.yml`, `check:v39-gate11`, `node scripts/promote-bitcode-canon.mjs --version V39 --commit HEAD --dry-run`, and the V39 active / draft V40 posture checks.
`V39CommercialReadingPromotionReadinessReport` is package-backed in `packages/protocol/src/canonical/v39-commercial-reading-promotion-readiness-report.js`.
It proves all Gate 2 through Gate 10 artifacts are present, parseable, source-safe, workflow-wired, and covered by generated proof support; it blocks value-bearing mainnet admission and preserves protected source, raw protected prompts, raw provider responses, unpaid AssetPack source, credentials, wallet private material, and private settlement payloads.

## appendices and canonical supporting material

The appendices below are canonical supporting material for V39 gate work.

## Appendix A. Canonical type and surface catalog

Canonical types include `PipelineExecution`, PTRR agent config, Plan/Try/Refine/Retry step receipts, Failsafe receipts, ThricifiedGeneration receipts, ToolExecution receipts, PromptPart, Prompt, prompt template, interpolation binding, Need, fit candidate, selected fit, AssetPack preview, settlement receipt, and telemetry event.

## Appendix B. Proof family closure catalog

The proof family closure catalog is the nine proof-family canon above.
Each family must close with proofArtifactPath, members, theoremIds, replayStepIds, witnessArtifactPaths, current member closure criteria, current member verdict shape, current theorem-by-theorem closure reading, current theorem-to-replay grouping, minimum artifact/replay binding set, current proof-object fields, generated-artifact and test bindings, and fail-closed conditions.

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v39-read-need-review-resynthesis.json`; `.bitcode/v39-read-fits-finding-runtime.json` | phases, agents, steps, failsafes, generations | commercial-reading-totality | v39-gate4, v39-gate5 | prompt receipts, generation receipts | `packages/agent-generics`, `packages/pipelines/asset-pack` |
| Prompt-completeness | `.bitcode/v39-read-need-review-resynthesis.json`; `.bitcode/v39-read-fits-finding-runtime.json` | PromptParts, Prompts | prompt-registry-totality | v39-gate4, v39-gate5 | benchmark fixtures | `packages/prompts` |
| Static-code-analysis | `.bitcode/v39-static-inference-boundary-report.json` | imports, routes, scans | source-boundary-conformance | gate-quality | workflow logs | scripts and workflows |
| Verification-decisions | `.bitcode/v39-read-need-review-resynthesis.json`; `.bitcode/v39-assetpack-preview-quote-boundary.json` | Need, fits, previews | verification-is-typed | v39-gate4, v39-gate6 | verification reports | Reading pipeline packages |
| Selection-and-materialization | `.bitcode/v39-read-fits-finding-runtime.json`; `.bitcode/v39-settlement-rights-delivery.json` | candidates, selected fits, AssetPack handoff | selected-fits-traceable | v39-gate5, v39-gate7 | selected-source material | depository search and synthesis packages |
| Authorization-and-sensitive-flow | `.bitcode/v39-sensitive-flow-report.json` | visibility tiers, redaction | sensitive-flow-redacted | v39-gate5, v39-gate9 | redaction receipts | API and UI redaction paths |
| Settlement-source-to-shares | `.bitcode/v39-settlement-rights-delivery.json` | fees, contributors, rights | settlement-traceable-to-fits | v39-gate7, v39-gate10 | settlement receipts | BTD and Reading packages |
| Disclosure-boundary | `.bitcode/v39-assetpack-preview-quote-boundary.json`; `.bitcode/v39-operational-telemetry-repair.json` | prompt, result, preview tiers | preview-does-not-leak-source | v39-gate6, v39-gate8 | telemetry events | V35/V38/V39 telemetry surfaces |
| Proof-contract | `BITCODE_SPEC_V39_PROVEN.md` | spec, artifacts, workflows | promotion-proof-complete | v39-gate11 | generated proof appendix | `packages/protocol` |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

Inherited V19 reproducible-canon artifacts remain the baseline for deterministic generated proof.

### Inherited V20 operator-quality artifacts

Inherited V20 operator-quality artifacts remain the baseline for operator-visible quality.

### Exact generated-artifact inventory matrix

Exact generated-artifact inventory matrix includes `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair.json`, `.bitcode/v39-interface-conversation-parity.json`, `.bitcode/v39-local-staging-commercial-reading-rehearsal.json`, and `.bitcode/v39-promotion-readiness-report.json`.

### V39 specifying generated artifacts

V39 specifying generated artifacts include Depository supply indexing, enterprise Reading UX state, ReadNeed review and resynthesis, ReadFitsFinding runtime and replay, AssetPack preview and quote boundary, settlement rights delivery, operational telemetry repair, interface Conversation parity, local and staging commercial Reading rehearsal, and promotion readiness reports.

### Shared generated-artifact fields

Shared generated-artifact fields: version, currentTarget, artifactRoot, sourceRoots, proofRoots, disclosureTier, generatedAt, and command.

### Artifact-specific generated payload fields

Artifact-specific generated payload fields: prompt ids, PromptPart ids, phase ids, agent ids, step ids, Failsafe ids, ThricifiedGeneration ids, tool ids, fit ids, ranking roots, and settlement roots.

### Artifact confidentiality and disclosability taxonomy

Artifact confidentiality and disclosability taxonomy: public, source-safe, buyer-visible, reviewer-visible, operator-only, and forbidden.

### Minimum generated appendix rendered contents

The generated appendix must include aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when generated proof evidence is stale, missing, or unsafe.

### Canonical regeneration and fail-closed posture

Canonical regeneration and fail-closed posture require V39 scripts to regenerate artifacts deterministically and fail closed on missing source roots, missing prompt ids, missing schema verdicts, unsafe telemetry payloads, stale proof-source commit, or mismatched canonical pointer.

## Appendix D. Validation and checking gate catalog

V39 validation begins with `check:v39-gate1` and expands through Gate 11.
Gate checks must be scriptable, workflow-wired, source-safe, and specific enough to identify the missing source or artifact.

## Appendix E. Current canonical source map

Current source map roots include `packages/agent-generics`, `packages/prompts`, `packages/tools-generics`, `packages/pipelines/asset-pack`, `packages/protocol`, `packages/api`, `uapi`, `.github/workflows`, `scripts`, and `protocol-demonstration` as a standalone minimal witness.

## Appendix F. Subsystem totality and derivability matrix

Subsystem totality coverage includes repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The V39 file family is `BITCODE_SPEC_V39.md`, `BITCODE_SPEC_V39_DELTA.md`, `BITCODE_SPEC_V39_NOTES.md`, `BITCODE_SPEC_V39_PARITY_MATRIX.md`, and eventually `BITCODE_SPEC_V39_PROVEN.md`.
Promotion may update `BITCODE_SPEC.txt` only after all gates close and promotion validation succeeds.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include Terminal, Conversations, API, MCP API, ChatGPT App, Auxillaries, Exchange, generated proof reports, dashboards, runbooks, and local/staging rehearsal surfaces.
V39 operator quality requires collapsed readable state and expanded source-safe detail for the full Reading product path, including pipeline telemetry, preview/quote posture, settlement, rights, delivery, and repair.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Scenario and workflow coverage includes auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable workflows.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed conditions include invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack and artifact contracts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V39_PROVEN.md`.
V39 may expose only source-safe preview metadata before settlement.

## accepted boundaries and reopen conditions

Accepted boundaries: V39 can harden inference, prompt benchmarking, search, telemetry, and traceability; V39 cannot change BTD supply law, route versioning discipline, mainnet admission, or settlement finality law without explicit later promotion.
Reopen conditions: evidence of prompt leakage, inference bypassing primitives, untraceable fit selection, unsafe telemetry, broken depository search, or stale generated proof.

## completion condition

V39 is complete only when every V39 gate is implemented, specified, tested, documented, generated, workflow-wired, source-safe, locally/staging rehearsed where applicable, and promotion-ready with `BITCODE_SPEC_V39_PROVEN.md` support.
