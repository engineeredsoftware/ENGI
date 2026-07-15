# Bitcode Spec V40

## Status

- Version: `V40`
- V40 state: canonical promotion complete; V40 is the active exhaustive commercial application testing canon and the V40 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V40`
- Canonical proof-source commit: `a5d169eda05cceb66b78f268e888b10c42542aaa`
- Draft proof-source commit: unbound until V40 promotion
- Prior canonical anchor: `BITCODE_SPEC_V39.md`
- Prior generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md`
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V39`
- Generated structured artifact inventory: active canonical `.bitcode/v40-spec-family-report.json`, `.bitcode/v40-canonical-input-report.json`, `.bitcode/v40-canon-posture-drift-report.json`, `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, `.bitcode/v40-promotion-readiness-report.json`, V40 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V40_PROVEN.md` as the generated proof appendix for V40 promotion
- Source parity state: V40 source-side test inventory, unit coverage, API integration contracts, Reading pipeline integration, Conversation/Terminal integration, browser E2E visual proof, ledger/database/storage synchronization, local/staging rehearsal automation, prompt benchmark smoke, workflow, and promotion surfaces are canonicalized in the promoted V40 file family
- Notes companion: `BITCODE_SPEC_V40_NOTES.md`
- Delta companion: `BITCODE_SPEC_V40_DELTA.md`
- Parity companion: `BITCODE_SPEC_V40_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V40_PROVEN.md` only after V40 promotion
- Scope: V40 canonical system specification for exhaustive commercial application testing across browser E2E, visual and screenshot proof, unit coverage, API integration, Reading pipeline integration, Conversation and Terminal integration, ledger/database/storage/wallet synchronization, local/staging rehearsal, prompt benchmark smoke, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V40`

## Version executive summary

V40 exists to make Bitcode's commercial application tests deep enough to sustain enterprise shippability.
V39 promoted the commercial Reading product path; V40 turns that path and the surrounding system into an exhaustively validated product surface.
The version must cover real user interactions, state possibilities, accessible UI behavior, generated proof artifacts, route contracts, package primitives, pipeline integrations, ledger/database/storage synchronization, and local/staging rehearsal.

V40 also prepares V41 by making prompt and PromptPart benchmarks measurable in ordinary quality flows.
V41 remains the singular prompts-as-programs version after V40, focused on every raw PromptPart, composed Prompt, benchmark, semantic division, title, template, interpolation contract, registry binding, and inference callsite.
That version must examine, benchmark, re-divide into meaningfully benchmarkable semantic parts, retitle, rewrite, catalogue, and validate prompts as executable inference programs across Reading first and conversational or other inference surfaces next.

## Canonical Bitcode executive summary

Bitcode remains the protocol and commercial system for depositing technical knowledge, reading needs against the Depository, finding many fitting deposits, synthesizing source-safe AssetPack previews, settling BTC fees, transferring BTD rights, and delivering full source-bearing AssetPacks only after settlement.
V40 does not change that economic or protocol law.
It proves the law through better tests.

## V40 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V39` while V40 is draft.
`BITCODE_SPEC_V39.md` and `BITCODE_SPEC_V39_PROVEN.md` are active canon.
`BITCODE_SPEC_V40.md`, `BITCODE_SPEC_V40_DELTA.md`, `BITCODE_SPEC_V40_NOTES.md`, and `BITCODE_SPEC_V40_PARITY_MATRIX.md` define the draft target only on `version/v40` and `v40/gate-*` branches.
Implementation remains unversioned in source paths; routes, packages, tests, and components must move in place.

## V40 full-system, re-implementation, and audit rule

Every V40 test must bind to source truth, not screenshots or mocks alone.
Browser tests must prove UI behavior and state transitions.
Integration tests must prove that separately owned primitives compose correctly.
Unit tests must prove isolated behavior for packages, primitives, and interface-specific implementations.
Generated artifacts must record what was tested, what was intentionally skipped, and which failures fail closed.

## V40 totality and precision enforcement rule

Testing is not ceremonial in V40.
Each gate must name the product surface, state matrix, source files, commands, generated artifact, and failure mode it closes.
Assertions must be typed or structurally parsed whenever possible.
Snapshot and screenshot comparisons must be deterministic enough to review.
Networked and credentialed checks must have local, staging-testnet, and opt-in production-mainnet lanes.

## V40 system goals, non-goals, and design principles

Goals:

- Expand E2E, visual, screenshot, interaction, accessibility, responsive, API, integration, unit, and proof coverage across the commercial application.
- Make V39 Reading confidence testable from Request Read through Need review, Finding Fits, preview, settlement, rights transfer, delivery, and repair.
- Make pipeline primitives testable both as primitives and as the real `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` implementations.
- Make conversations, Terminal, Auxillaries, Exchange, MCP API, ChatGPT App, public API, ledger/database/storage synchronization, and protocol-demonstration regressions greenable.
- Prepare V41 prompt benchmarking by ensuring prompt fixtures and benchmark commands are runnable in CI lanes.

Non-goals:

- V40 does not rewrite prompts, PromptParts, or inference text as the main work; V41 owns that focused evolution.
- V40 does not change BTD supply law, BTC settlement law, or unpaid AssetPack disclosure boundaries.
- V40 does not introduce versioned source routes.

Design principles: source-grounded tests, deterministic proofs, fail-closed fixtures, clear lane separation, commercial realism, and maintainable test architecture.

## V40 system architecture and layer boundaries

V40 tests the existing layers:

- protocol and BTD packages;
- prompt, agent, tool, execution, and pipeline primitives;
- Reading pipeline real implementations;
- API and UAPI route boundaries;
- Terminal, Conversations, Auxillaries, Exchange, MCP API, ChatGPT App, public API, and documentation surfaces;
- ledger, database, object storage, VCS, wallet, sandbox, and deployment lane projections;
- demonstration code as a self-contained minimal implementation.

Tests may depend downward on public package APIs and source-safe fixtures.
Tests may not import demonstration code into commercial code, may not reveal secrets, may not expose unpaid AssetPack source, and may not bypass authorization, settlement, or disclosure controls.

## V40 canonical domain model

V40 keeps the V39 domain model: deposits, Depository supply records, Read Requests, synthesized Needs, accepted Need admission, candidate fit deposits, selected fits, AssetPack previews, quotes, BTC payment observations, BTD rights transfer, source-to-shares compensation, post-settlement delivery, ledger/database/storage receipts, telemetry, repair actions, and generated proof artifacts.
Testing domain objects add scenario matrices, fixture manifests, replay transcripts, screenshot baselines, accessibility reports, API contract receipts, integration receipts, unit coverage maps, benchmark receipts, and promotion-readiness reports.

## V40 whole Bitcode operator chain

The V40 operator chain is: author a scenario, seed source-safe fixtures, run unit tests, run integration tests, run browser and visual tests, run route/API tests, run pipeline and conversation tests, run ledger/database/storage synchronization tests, run local/staging rehearsal, inspect generated artifacts, repair failures, and only then promote canon.
Every chain step must produce a deterministic or explicitly lane-bound receipt.

## V40 Gate 2 Test Inventory And Coverage Matrix

Gate 2 makes the testing scope auditable before V40 closes deeper test implementation.
The package-owned `V40TestInventoryCoverageMatrix` emits `.bitcode/v40-test-inventory-coverage-matrix.json` with ten source-safe surfaces: unit coverage, API and route integration, Reading pipeline integration, Conversation and Terminal integration, browser/visual/accessibility/responsive proof, ledger/database/storage/wallet/delivery synchronization, local/staging rehearsal, prompt benchmark smoke, demonstration parity, and gate/canon promotion quality.
Rows record owners, commands, source roots, generated artifact targets, coverage tier, and the later V40 gate responsible for closure.
The artifact may name test paths, command ids, and source-safe metadata, but must not include secrets, protected source, raw protected prompts, raw provider responses, wallet private material, or unpaid AssetPack source.

## V40 Gate 3 Unit Coverage For Packages And Primitives

Gate 3 closes the unit-coverage foundation beneath later integration and browser gates.
The package-owned `V40UnitCoverageInventory` emits `.bitcode/v40-unit-coverage-inventory.json` with source-safe unit rows for protocol report builders, BTD ledger/settlement/right primitives, Prompt and PromptPart composition primitives, PTRR agent steps, registry-backed tools, execution lineage/events/metrics, generic pipeline primitives, real Reading AssetPack implementation units, pipeline host harnesses, isolated interface helpers, utility/security packages, and the demonstration/commercial boundary.
Rows bind package names, source roots, test paths, command ids, verdicts, and closure requirements.
Gate 3 permits no missing, blocked, or exempt critical unit surface in the artifact; any later discovered critical package unit without a direct test must reopen Gate 3 or be explicitly closed by a later V40 artifact.

## V40 Gate 4 API And Route Integration Contracts

Gate 4 closes API and route integration contract coverage beneath later browser, pipeline, synchronization, and rehearsal gates.
The package-owned `V40ApiIntegrationContracts` emits `.bitcode/v40-api-integration-contracts.json` with source-safe rows for UAPI Reading and pipeline routes, execution stream routes, Conversation routes, Auxillaries and Orbitals routes, VCS/wallet/webhook routes, public activity/template routes, package API route orchestration, package API Conversation and pipeline routes, MCP execution interface contracts, and ChatGPT App action contracts.
Rows bind route families, source roots, test paths, command ids, verdicts, and closure requirements.
Gate 4 permits no missing, blocked, or exempt critical contract row; the artifact must prove route contract coverage while withholding secrets, protected source, raw protected prompts, raw provider responses, wallet private material, and unpaid AssetPack source.

## V40 Gate 5 Reading Pipeline Integration Coverage

Gate 5 closes integration coverage for the real Reading pipeline spine without rewriting prompt content.
The package-owned `V40ReadingPipelineIntegrationCoverage` emits `.bitcode/v40-reading-pipeline-integration-coverage.json` with nine source-safe rows: pipeline contract topology, `ReadNeedComprehensionSynthesis` runtime, `ReadFitsFindingSynthesis` Depository search runtime, PTRR agent implementation integration, AssetPack preview/settlement/delivery boundaries, telemetry/repair readback, Terminal API harness integration, primitive/host integration, and local/staging rehearsal linkage.
The artifact binds the currently expected Reading topology of two pipelines, five UX steps, eleven phases, twelve PTRR agents, forty-eight PTRR steps, twenty model-structured PTRR steps, one hundred forty-four ThricifiedGeneration records, and four tool surfaces.
The focused integration test runs the deterministic commercial Reading spine from accepted Need synthesis through many-fit Depository search, source-safe AssetPack preview, settlement/right-transfer delivery boundary, and source-safe observability coverage.
Gate 5 permits no missing, blocked, or exempt critical Reading integration row; proof rows may include topology, command ids, fixture roots, and coverage flags, but must not include secrets, raw protected prompts, raw provider responses, protected source payloads, or unpaid AssetPack source.

## V40 Gate 6 Conversation And Terminal Integration Coverage

Gate 6 closes integration coverage for the Conversation-to-Terminal boundary without changing prompt content.
The package-owned `V40ConversationTerminalIntegration` emits `.bitcode/v40-conversation-terminal-integration.json` with eight source-safe rows: Conversation Terminal handoff route contracts, Conversation stream events projected into rich execution logs, Conversation route/API persistence and branch contracts, writing workspace/source selector handoff, Terminal Reading state handoff readback, Terminal pipeline harness log streaming, Terminal transaction-cockpit authority boundaries, and Conversation/Terminal rehearsal/docs/interface parity.
The focused UAPI integration test carries a source-safe Conversation `finding_fits` handoff into Terminal route readback, verifies the five-stage enterprise Reading state at `request-fit`, adapts a Conversation stream tool event into execution-log metadata, and projects that event through the Terminal harness stream snapshot without serializing protected source, raw prompt payload, or unpaid AssetPack source.
Gate 6 permits no missing, blocked, or exempt critical Conversation/Terminal row; proof rows may include route parameters, proof roots, event ids, telemetry posture, command ids, fixture roots, and coverage flags, but must not include secrets, protected source, raw protected prompts, raw model/provider responses, wallet private material, or unpaid AssetPack source.

## V40 Gate 7 Browser E2E, Accessibility, Responsive, And Visual Proof

Gate 7 closes source-safe browser proof across the rich website product surfaces without making screenshots the only proof.
The package-owned `V40BrowserE2eVisualProof` emits `.bitcode/v40-browser-e2e-visual-proof.json` with eight source-safe rows: Terminal enterprise Reading and transaction browser flow, Conversations writing and stream-log browser flow, Auxillaries contained-pane accessibility flow, Exchange BTD market and rights browser flow, Docs public learning route browser flow, canonical responsive viewport overflow proof, visual screenshot baseline and trace proof, and keyboard/landmark/status accessibility proof.
The app-owned `BITCODE_BROWSER_PROOF_CONTRACT` covers Terminal, Conversations, Auxillaries, Exchange, and Docs, thirteen route states, eighteen interaction states, four canonical viewports, eight accessibility assertions, and a visual strategy that requires deterministic screenshot baselines plus semantic assertions with `no-screenshot-only-approval`.
The focused browser spec exercises five-stage Reading, selected activity detail, Conversation source-safe handoff, Exchange rights review, Docs navigation, Auxillaries live regions, reduced motion, and horizontal-overflow limits under local mock data.
Gate 7 permits no missing, blocked, or exempt critical browser proof row; proof rows may include route ids, viewport ids, screenshot/trace posture, command ids, fixture roots, and source-safe coverage flags, but must not include secrets, protected source, raw protected prompts, raw provider/model responses, wallet private material, or unpaid AssetPack source.

## V40 Gate 8 Ledger, Database, Storage, Wallet, And Delivery Synchronization

Gate 8 closes synchronization coverage for the economic and delivery state that follows a worthy AssetPack preview.
The package-owned `V40LedgerStorageSync` emits `.bitcode/v40-ledger-storage-sync.json` with ten source-safe rows: BTC fee finality and wallet authority, BTD read-right transfer projection, source-to-shares compensation conservation, ledger/database/object-storage reconciliation, artifact locks and source-safe storage projection, post-settlement pull-request delivery unlock, finality/drift/delivery repair posture, no-custody wallet boundary, Terminal route/interface readback, and proof-system wiring.
The app-owned `BITCODE_LEDGER_STORAGE_SYNC_CONTRACT` covers settlement source-to-shares, no-custody wallet authority, and post-settlement pull-request delivery across BTC fee, BTD rights, ledger, database, object storage, wallet, VCS delivery, and Terminal readback systems.
The focused proof test suite exercises the existing `AssetPackSettlementRightsDeliveryBoundary`, BTD wallet and reconciliation primitives, Terminal wallet/journal/detail readbacks, and the app contract without serializing protected source, unpaid AssetPack source, wallet private material, raw prompts, provider responses, or private settlement payloads.
Gate 8 permits no missing, blocked, or lane-skipped critical synchronization row; source-bearing pull-request delivery remains withheld until payment observation, confirmed finality, source-to-shares conservation, BTD rights transfer, and ledger/database/object-storage reconciliation all agree.

## V40 Gate 9 Local And Staging-Testnet Rehearsal Automation

Gate 9 closes local and staging-testnet rehearsal automation for the source-safe operator path that proves the test system can be replayed without tracked credentials.
The package-owned `V40LocalStagingRehearsalAutomation` emits `.bitcode/v40-local-staging-rehearsal-automation.json` with ten source-safe rows: local operator rehearsal, staging-testnet real-inference rehearsal, lane-bound secret-family checks, source-safe operator receipts, Vercel Sandbox harness runner, database stream and route readback, five-stage Reading pipeline rehearsal, ledger/storage/wallet/delivery rehearsal continuity, value-bearing mainnet blocking, and proof-system wiring.
The operator command `rehearse:v40-local-staging` builds local or staging-testnet receipts from environment presence only, writes receipts under ignored harness-run roots when requested, and requires explicit live execution opt-in before delegating to the Vercel Sandbox AssetPack harness.
Staging-testnet automation binds the Supabase project `tkpyosihuouusyaxtbau`, the REST host `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`, real inference, database event streaming, and structured readback while serializing no secret values, protected source, raw prompts, provider responses, unpaid AssetPack source, wallet private material, private settlement payloads, or live log payloads.
Gate 9 permits no missing critical rehearsal automation row and keeps value-bearing mainnet admission blocked.

## V40 Gate 10 Prompt Benchmark Smoke And V41 Readiness

Gate 10 closes source-safe prompt benchmark smoke coverage before V41 begins focused prompt-program rewriting.
The package-owned `V40PromptBenchmarkSmokeV41Readiness` emits `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` with ten source-safe rows covering the prompt benchmark report command, deterministic PromptPart smoke execution, deterministic composed Prompt smoke execution, V38 benchmark inventory binding, Reading prompt fixtures, Conversation and tool prompt fixtures, the no-prompt-rewrite boundary, the V41 prompt-program worklist, workflow wiring, and proof-system wiring.
The operator command `prompt-benchmark:smoke` runs a local deterministic mock benchmark receipt and confirms the package benchmark report command remains runnable.
Gate 10 serializes no raw prompt text, protected PromptPart source, raw provider response, credential, wallet private material, private settlement payload, or unpaid AssetPack source.
Gate 10 intentionally proves benchmark infrastructure readiness only; V41 owns every raw PromptPart and composed Prompt audit, semantic repartition, retitle, rewrite, catalogue, interpolation binding review, and callsite-quality benchmark.

## V40 Gate 11 Promotion Readiness

Gate 11 closes the V40 promotion readiness canon and binds every V40 testing artifact into the canonical promotion path.
The package-owned `V40PromotionReadinessReport` emits `.bitcode/v40-promotion-readiness-report.json` with source-safe evidence for V40 gate artifacts, `BITCODE_SPEC_V40_PROVEN.md` generation, `v40-canon-promotion.yml`, gate-quality and canon-quality workflow posture, promotion command dry-run support, runtime posture rewriting to V40 active / draft V41, and fail-closed source-safety boundaries.
The report covers `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, and `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`.
Promotion must run through the version branch PR into `main`, validate all Gate 1 through Gate 11 commands, generate `BITCODE_SPEC_V40_PROVEN.md`, rewrite runtime canon posture, and keep `BITCODE_SPEC.txt` at `V39` until promotion automation advances it.
Gate 11 keeps value-bearing production-mainnet admission blocked by default and serializes no secrets, protected source, raw protected prompts, raw provider responses, wallet private material, private settlement payloads, or unpaid AssetPack source.
Use `pnpm run generate:v40-promotion-readiness`, `pnpm run check:v40-promotion-readiness`, `pnpm run check:v40-gate11`, and `node scripts/promote-bitcode-canon.mjs --version V40 --commit HEAD --dry-run`.

## V40 canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: deposits, Depository supply records, measurement roots, source-safe search documents, vector projections, storage readbacks, and test fixtures.
Current algorithms and derivation rules: V39 deposit indexing and measurement derivations remain active; V40 adds unit, integration, API, and browser proofs around deposit workflows.
Current invariants and fail-closed conditions: invalid deposit and missing source-safe projection fail closed.
Current proof obligations: deposit lifecycle coverage, searchable projection coverage, and no protected-source leakage.
Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `uapi`, and protocol artifact generators.
Current validating commands and parity basis: V39 promoted checks plus V40 gate checks.
Current accepted boundaries: source-safe metadata can be tested broadly; protected source requires settlement or internal-only lanes.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Requests, Needs, prompt registry receipts, PromptPart benchmark fixtures, Failsafe receipts, ThricifiedGeneration receipts, and Reading pipeline test matrices.
Current algorithms and derivation rules: V38 and V39 inference stack rules remain active; V40 proves them through mock, integration, and live-lane tests.
Current invariants and fail-closed conditions: prompt contract incompleteness and parsed-envelope inadmissibility fail closed.
Current proof obligations: pipeline phase coverage, PTRR step coverage, Failsafe and Thricified receipt coverage, and source-safe telemetry coverage.
Current source-bearing implementation basis: `packages/agent-generics`, `packages/prompts`, `packages/tools-generics`, `packages/pipelines/asset-pack`, `uapi`, and conversation routes.
Current validating commands and parity basis: prompt/inference tests, benchmark smoke tests, and V40 generated artifacts.
Current accepted boundaries: V40 can add benchmark execution proof; V41 owns prompt rewriting.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: candidate fit deposits, ranking receipts, query plans, provider-channel receipts, vector-search receipts, verification verdicts, and replay transcripts.
Current algorithms and derivation rules: `ReadFitsFindingSynthesis` searches many candidates above threshold and hands selected fits to AssetPack synthesis.
Current invariants and fail-closed conditions: no survivor asset pack or invalid fit provenance blocks preview and settlement.
Current proof obligations: recall and ranking coverage, depository-search integration coverage, and replay determinism.
Current source-bearing implementation basis: asset-pack pipeline packages and depository search tools.
Current validating commands and parity basis: package tests plus local/staging rehearsal suites.
Current accepted boundaries: candidates may be visible only as source-safe preview metadata before settlement.

### Selection and materialization

Current canonical objects and emitted artifacts: selected fits, AssetPack preview, withheld source bundle, PR delivery plan, artifact locks, and repair receipts.
Current algorithms and derivation rules: selected fits materialize preview before settlement and full source-bearing delivery after settlement.
Current invariants and fail-closed conditions: public projection overexposure and unpaid AssetPack source exposure fail closed.
Current proof obligations: branch artifacts and assetPackEvidence must be tested from preview through unlock.
Current source-bearing implementation basis: AssetPack packages, UAPI routes, and VCS delivery boundaries.
Current validating commands and parity basis: V40 browser/API/integration gates.
Current accepted boundaries: preview is source-safe; full delivery is paid-boundary only.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: organization authority, wallet authority, reader/depositor boundaries, credential redaction, policy receipts, and sensitive-flow test reports.
Current algorithms and derivation rules: V39 authority and rights-transfer rules remain active.
Current invariants and fail-closed conditions: authorization denial and credential leakage fail closed.
Current proof obligations: identity, authority, signing, and policy coverage.
Current source-bearing implementation basis: UAPI auth routes, BTD packages, wallet components, and policy helpers.
Current validating commands and parity basis: unit/API/E2E tests plus secret scans.
Current accepted boundaries: tests must never place secrets in tracked files.

### Disclosure and projection

Current canonical objects and emitted artifacts: disclosure tiers, redaction receipts, source-safe telemetry, preview surfaces, and privacy fixtures.
Current algorithms and derivation rules: V38 source-safe inference telemetry and V39 preview law remain active.
Current invariants and fail-closed conditions: public projection overexposure fails closed.
Current proof obligations: projection, disclosure, and redaction coverage across all surfaces.
Current source-bearing implementation basis: shared pipeline log UI, conversation telemetry, Terminal projections, API serializers, and protocol reports.
Current validating commands and parity basis: UI, API, and protocol tests.
Current accepted boundaries: raw protected prompts and raw provider responses are not public payloads.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTC fee quote, payment observation, finality, BTD rights transfer, source-to-shares distribution, ledger entries, database rows, storage receipts, and reconciliation reports.
Current algorithms and derivation rules: V27 and V39 settlement rules remain active.
Current invariants and fail-closed conditions: settlement conservation drift and stale finality fail closed.
Current proof obligations: settlement, source-to-shares, journals, and exact accounting coverage.
Current source-bearing implementation basis: BTD packages, wallet panes, ledger/database/storage synchronizers, and Terminal settlement views.
Current validating commands and parity basis: unit, integration, route, and staging rehearsal tests.
Current accepted boundaries: value-bearing production-mainnet tests are opt-in until promotion criteria make them mandatory.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: proof families, members, theorems, witnesses, replay steps, generated artifacts, and promotion reports.
Current algorithms and derivation rules: generated proof artifacts remain deterministic and source-safe.
Current invariants and fail-closed conditions: stale promoted status truth, missing artifact roots, or unparseable reports fail closed.
Current proof obligations: proof families, members, theorems, witnesses, and replay coverage.
Current source-bearing implementation basis: `packages/protocol/src/canonical`, scripts, `.bitcode`, workflows, and protocol-demonstration.
Current validating commands and parity basis: V40 gate checks, canon quality, and promotion workflow.
Current accepted boundaries: proof artifacts may summarize sensitive facts but cannot disclose secrets or unpaid source.

## V40 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v40-reading-pipeline-integration-coverage.json` | pipeline, agent, step | inference-stack-covered | run-reading-pipeline-tests | prompt receipts, generation receipts | packages/pipelines, packages/agent-generics |
| Prompt-completeness | `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` | PromptParts, Prompts | prompt-benchmark-runnable | run-prompt-benchmark-smoke | benchmark receipts | packages/prompts |
| Static-code-analysis | `.bitcode/v40-unit-coverage-inventory.json` | source packages | source-units-covered | run-unit-suites | coverage maps | packages, uapi |
| Verification-decisions | `.bitcode/v40-api-integration-contracts.json` | routes, contracts | route-contracts-covered | run-api-integration | API receipts | uapi, packages/api |
| Selection-and-materialization | `.bitcode/v40-browser-e2e-visual-proof.json` | browser flows | ux-state-covered | run-browser-visual | screenshot baselines | uapi tests |
| Authorization-and-sensitive-flow | `.bitcode/v40-sensitive-flow-redaction.json` | policies, auth | sensitive-flow-fails-closed | run-sensitive-flow-tests | redaction receipts | auth and serializers |
| Settlement-source-to-shares | `.bitcode/v40-ledger-storage-sync.json` | ledger, db, storage | accounting-synchronized | run-ledger-sync-tests | reconciliation receipts | packages/btd, uapi |
| Disclosure-boundary | `.bitcode/v40-disclosure-visual-api-proof.json` | previews, telemetry | source-safe-disclosure | run-disclosure-tests | UI and API receipts | Terminal, Conversation |
| Proof-contract | `.bitcode/v40-promotion-readiness-report.json` | generated artifacts | promotion-ready | run-promotion-validation | `.bitcode` reports | protocol canonical package |

### Inference-synthesis

proofArtifactPath: `.bitcode/v40-pipeline-integration-coverage.json`
members: pipeline executions, PTRR agents, Failsafe sequences, Thricified generations
theoremIds: inference-stack-covered
replayStepIds: run-reading-pipeline-tests
witnessArtifactPaths: prompt receipts, generation receipts, pipeline receipts
current member closure criteria: every real Reading pipeline has mock and integration coverage
current member verdict shape: pass, fail, skipped-lane, or blocked
current theorem-by-theorem closure reading: no inference path bypasses primitives
current theorem-to-replay grouping: Reading, Conversation, and tool-call inference suites
minimum artifact/replay binding set: phase id, agent id, step id, generation id, prompt id
current proof-object fields: pipelineId, coverageKind, receiptRoot, verdict
generated-artifact and test bindings: V40 pipeline artifact and test commands
fail-closed conditions: missing prompt, invalid typed output, or unbound tool receipt

### Prompt-completeness

proofArtifactPath: `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`
members: PromptParts, Prompts, templates, interpolation bindings
theoremIds: prompt-benchmark-runnable
replayStepIds: run-prompt-benchmark-smoke
witnessArtifactPaths: benchmark receipts and fixture roots
current member closure criteria: every active prompt can be located and benchmarked
current member verdict shape: pass, fail, missing fixture, or deferred-to-V41
current theorem-by-theorem closure reading: V40 proves benchmark execution, V41 improves prompt content
current theorem-to-replay grouping: PromptPart and composed Prompt suites
minimum artifact/replay binding set: prompt id, PromptPart id, fixture id, result root
current proof-object fields: promptId, promptPartIds, fixtureRoot, qualityVerdict, v41WorkItemIds
generated-artifact and test bindings: `V40PromptBenchmarkSmokeV41Readiness`, prompt benchmark smoke artifact, and V41 prompt-program handoff
fail-closed conditions: missing prompt identity or unbound interpolation

### Static-code-analysis

proofArtifactPath: `.bitcode/v40-unit-coverage-inventory.json`
members: packages, primitives, utilities, route units
theoremIds: source-units-covered
replayStepIds: run-unit-suites
witnessArtifactPaths: coverage reports
current member closure criteria: core packages have direct unit coverage
current member verdict shape: covered, missing, exempt, or blocked
current theorem-by-theorem closure reading: no critical primitive remains untested without an explicit exemption
current theorem-to-replay grouping: package and app unit suites
minimum artifact/replay binding set: file path, test path, command id
current proof-object fields: sourcePath, testPath, coverageTier, verdict
generated-artifact and test bindings: unit coverage inventory
fail-closed conditions: source unit without required tests

### Verification-decisions

proofArtifactPath: `.bitcode/v40-api-integration-contracts.json`
members: API routes, schemas, persistence adapters, conversations
theoremIds: route-contracts-covered
replayStepIds: run-api-integration
witnessArtifactPaths: request/response receipts
current member closure criteria: commercial routes have contract tests
current member verdict shape: pass, fail, missing route test, or lane skipped
current theorem-by-theorem closure reading: API behavior is parseable and source-safe
current theorem-to-replay grouping: route, schema, and persistence suites
minimum artifact/replay binding set: route id, schema id, fixture id
current proof-object fields: routeId, schemaId, status, verdict
generated-artifact and test bindings: API integration artifact
fail-closed conditions: untyped response or unsafe payload

### Selection-and-materialization

proofArtifactPath: `.bitcode/v40-browser-e2e-visual-proof.json`
members: Terminal, Conversations, Auxillaries, Exchange, docs surfaces
theoremIds: ux-state-covered
replayStepIds: run-browser-visual
witnessArtifactPaths: screenshots, accessibility reports, trace files
current member closure criteria: stateful product flows have browser proof
current member verdict shape: pass, visual-diff, accessibility-fail, or skipped-lane
current theorem-by-theorem closure reading: major product interactions are user-visible and stable
current theorem-to-replay grouping: E2E, visual, accessibility, responsive
minimum artifact/replay binding set: route, viewport, scenario, screenshot root
current proof-object fields: route, scenarioId, viewport, verdict
generated-artifact and test bindings: browser E2E and visual proof artifact
fail-closed conditions: incoherent UI overlap or broken critical flow

### Authorization-and-sensitive-flow

proofArtifactPath: `.bitcode/v40-sensitive-flow-redaction.json`
members: credentials, wallet material, private source, protected prompts
theoremIds: sensitive-flow-fails-closed
replayStepIds: run-sensitive-flow-tests
witnessArtifactPaths: redaction reports and leak scans
current member closure criteria: sensitive values never enter tracked files or public payloads
current member verdict shape: pass, leak, blocked, or exempt-internal
current theorem-by-theorem closure reading: secrecy and authorization boundaries are testable
current theorem-to-replay grouping: secret scans, redaction tests, authorization tests
minimum artifact/replay binding set: source path, payload kind, redaction id
current proof-object fields: payloadKind, exposureTier, verdict
generated-artifact and test bindings: sensitive-flow artifact
fail-closed conditions: credential leak or authorization bypass

### Settlement-source-to-shares

proofArtifactPath: `.bitcode/v40-ledger-storage-sync.json`
members: BTC fee, BTD rights, ledger, database, object storage
theoremIds: accounting-synchronized
replayStepIds: run-ledger-sync-tests
witnessArtifactPaths: reconciliation receipts
current member closure criteria: settlement projections reconcile across systems
current member verdict shape: pass, drift, pending-finality, or lane-skipped
current theorem-by-theorem closure reading: economic state is auditable before and after delivery
current theorem-to-replay grouping: settlement, rights, reconciliation, repair
minimum artifact/replay binding set: transaction id, ledger id, storage id, proof root
current proof-object fields: transactionId, finalityState, reconciliationVerdict
generated-artifact and test bindings: ledger/storage synchronization artifact
fail-closed conditions: settlement conservation drift

### Disclosure-boundary

proofArtifactPath: `.bitcode/v40-disclosure-visual-api-proof.json`
members: previews, telemetry, conversations, API projections
theoremIds: source-safe-disclosure
replayStepIds: run-disclosure-tests
witnessArtifactPaths: UI and API disclosure receipts
current member closure criteria: source-safe projections stay source-safe in every interface
current member verdict shape: pass, leak, overexposed, or blocked
current theorem-by-theorem closure reading: disclosure law is visible and machine-verifiable
current theorem-to-replay grouping: preview, telemetry, and public response tests
minimum artifact/replay binding set: surface id, disclosure tier, payload root
current proof-object fields: surfaceId, disclosureTier, verdict
generated-artifact and test bindings: disclosure proof artifact
fail-closed conditions: public projection overexposure

### Proof-contract

proofArtifactPath: `.bitcode/v40-promotion-readiness-report.json`
members: generated artifacts, scripts, workflows, promotion files
theoremIds: promotion-ready
replayStepIds: run-promotion-validation
witnessArtifactPaths: V40 generated reports and `BITCODE_SPEC_V40_PROVEN.md`
current member closure criteria: every V40 gate artifact is parseable and workflow-wired
current member verdict shape: closed, missing, stale, or blocked
current theorem-by-theorem closure reading: V40 can be promoted only after exhaustive testing gates close
current theorem-to-replay grouping: gate checks, canon checks, promotion workflow
minimum artifact/replay binding set: artifact path, checker id, workflow id
current proof-object fields: artifactPath, checkerId, verdict
generated-artifact and test bindings: promotion readiness report
fail-closed conditions: stale promoted status truth

## V40 generated canon

### Inherited V19 reproducible-canon artifacts

V40 inherits reproducible canon requirements from prior promoted Bitcode and ENGI specs.

### Inherited V20 operator-quality artifacts

V40 inherits operator-quality artifact expectations for readable proof and repair evidence.

### Exact generated-artifact inventory matrix

| Artifact | Owner | Purpose |
| --- | --- | --- |
| `.bitcode/v40-spec-family-report.json` | protocol canonical package | draft spec family validation |
| `.bitcode/v40-canonical-input-report.json` | protocol canonical package | draft canonical input accounting |
| `.bitcode/v40-test-inventory-coverage-matrix.json` | protocol canonical package | Gate 2 source-safe test inventory and coverage matrix |
| `.bitcode/v40-unit-coverage-inventory.json` | protocol canonical package | Gate 3 source-safe unit coverage inventory |
| `.bitcode/v40-api-integration-contracts.json` | protocol canonical package | Gate 4 source-safe API and route integration contract inventory |
| `.bitcode/v40-reading-pipeline-integration-coverage.json` | protocol canonical package | Gate 5 source-safe Reading pipeline integration coverage |
| `.bitcode/v40-conversation-terminal-integration.json` | protocol canonical package | Gate 6 source-safe Conversation/Terminal integration coverage |
| `.bitcode/v40-browser-e2e-visual-proof.json` | protocol canonical package | Gate 7 source-safe browser, visual, accessibility, and responsive proof |
| `.bitcode/v40-ledger-storage-sync.json` | protocol canonical package | Gate 8 source-safe ledger, database, storage, wallet, and delivery synchronization proof |
| `.bitcode/v40-local-staging-rehearsal-automation.json` | protocol canonical package | Gate 9 source-safe local and staging-testnet rehearsal automation proof |
| `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` | protocol canonical package | Gate 10 source-safe PromptPart and Prompt benchmark smoke plus V41 prompt-program readiness proof |
| `.bitcode/v40-promotion-readiness-report.json` | future V40 promotion gate | promotion readiness |

### V40 specifying generated artifacts

V40 generated artifacts begin with `.bitcode/v40-spec-family-report.json` and `.bitcode/v40-canonical-input-report.json`.
Closed gates now add unit, API, pipeline, Conversation/Terminal, browser, synchronization, local/staging rehearsal, and prompt benchmark smoke artifacts; later gates add promotion-readiness artifacts.

### Shared generated-artifact fields

Shared fields include artifact id, schema id, version, current target, source roots, generated timestamp, proof-source commit, aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, and fail closed when a required source or artifact is missing.

### Artifact-specific generated payload fields

Artifact-specific fields include scenario ids, route ids, component ids, package ids, primitive ids, pipeline ids, prompt ids, PromptPart ids, benchmark ids, screenshot roots, coverage roots, ledger roots, storage roots, and repair roots.

### Artifact confidentiality and disclosability taxonomy

Artifacts are public, buyer, reviewer, internal, or secret-bearing.
No V40 public artifact may include credentials, protected source, unpaid AssetPack source, raw protected prompts, raw provider responses, or private wallet material.

### Minimum generated appendix rendered contents

The generated appendix must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when required evidence is missing.

### Canonical regeneration and fail-closed posture

Canonical regeneration must be deterministic.
Missing generated artifacts, stale reports, malformed JSON, invalid screenshots, unparseable route responses, unbound tests, stale promoted status truth, or uncovered critical surfaces fail closed.

## V40 validation canon

Validation canon includes `pnpm run check:v40-gate1`, `pnpm run check:v40-gate2`, `pnpm run check:v40-gate3`, `pnpm run check:v40-gate4`, `pnpm run check:v40-gate5`, `pnpm run check:v40-gate6`, `pnpm run check:v40-gate7`, `pnpm run check:v40-gate8`, `pnpm run check:v40-gate9`, `pnpm run check:v40-gate10`, `pnpm run check:v40-browser-e2e-visual-proof`, `pnpm run prompt-benchmark:smoke`, `pnpm run generate:v40-prompt-benchmark-smoke-v41-readiness`, `pnpm run check:v40-prompt-benchmark-smoke-v41-readiness`, `pnpm run rehearse:v40-local-staging --lane local --dry-run --json`, `pnpm run rehearse:v40-local-staging --lane staging-testnet --dry-run --json`, `node scripts/check-bitcode-spec-family.mjs --version V40 --mode draft --current-target V39`, `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V39 --draft-target V40`, package typechecks, protocol tests, route/API tests, browser E2E suites, visual/screenshot proof suites, integration suites, unit suites, prompt benchmark smoke tests, local/staging rehearsal commands, and diff hygiene.

## V40 promotion canon

V40 promotion requires all V40 gates to close, V40 proof support to exist, V40 workflows to be green, and the promotion commit to update `BITCODE_SPEC.txt` from `V39` to `V40`.
Promotion must also leave V41 as the next draft target focused on prompts as programs.

## V40 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

Canonical types include deposits, Reads, Needs, fits, AssetPacks, BTD ranges, ledger receipts, database projections, object-storage receipts, `PipelineExecution`, PTRR receipts, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, PromptParts, Prompts, tests, fixtures, screenshots, traces, coverage reports, and generated proof artifacts.

### Appendix B. Proof family closure catalog

The proof family closure catalog is the V40 proof-family canon above and is enforced by generated artifacts and gate checkers.

### Exact proof-family inventory matrix

The exact proof-family inventory matrix is repeated in the V40 proof-family canon and binds every proofFamily to proofArtifactPath, memberIds, theoremIds, replayStepIds, witnessArtifactPaths, and Current source basis.

### Appendix C. Generated artifact contract catalog

The generated artifact contract catalog is the V40 generated canon above.

### Minimum generated appendix rendered contents

Minimum contents are aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when required evidence is missing.

### Canonical regeneration and fail-closed posture

Regeneration fails closed on malformed artifacts, stale reports, missing source roots, or stale promoted status truth.

### Appendix D. Validation and checking gate catalog

V40 gates must progressively add greenable commands for browser E2E, visual screenshots, API integration, pipeline integration, conversation integration, ledger/storage synchronization, unit coverage, prompt benchmark smoke, local/staging rehearsal, and promotion readiness.

### Appendix E. Current canonical source map

Current source map roots include `packages/btd`, `packages/protocol`, `packages/prompts`, `packages/agent-generics`, `packages/tools-generics`, `packages/pipelines/asset-pack`, `packages/pipeline-hosts`, `uapi`, `packages/api`, `packages/chatgptapp`, `packages/executions-mcp`, `.github/workflows`, `scripts`, `.bitcode`, and `protocol-demonstration`.

### Appendix F. Subsystem totality and derivability matrix

Subsystem totality coverage includes repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, generated artifacts and canonical promotion.

### Appendix G. Canonical file-family and promotion contract catalog

The V40 file family is `BITCODE_SPEC_V40.md`, `BITCODE_SPEC_V40_DELTA.md`, `BITCODE_SPEC_V40_NOTES.md`, `BITCODE_SPEC_V40_PARITY_MATRIX.md`, and future `BITCODE_SPEC_V40_PROVEN.md`.

### Appendix H. Operator surface and quality contract catalog

Operator surfaces include Terminal, Conversations, Auxillaries, Exchange, MCP API, ChatGPT App, public API, documentation, dashboards, generated proof artifacts, and local/staging runbooks.

### Appendix I. Scenario, workflow, and cross-product contract catalog

Scenario and workflow coverage includes auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, Valuable.

### Appendix J. Fail-closed contract and error posture matrix

Fail-closed conditions include invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, stale promoted status truth, broken browser flow, visual regression, missing route contract, missing unit test, unparseable artifact, and unsafe fixture.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing and proof artifacts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V40_PROVEN.md`.

## V40 accepted boundaries and reopen conditions

Accepted boundaries: V40 may expand test architecture, coverage, artifacts, fixtures, browser proof, visual proof, integration suites, and unit suites. V40 may add prompt benchmark smoke coverage, but V41 owns the focused prompt and PromptPart audit, repartitioning, retitling, rewriting, and benchmark-quality elevation.

Reopen conditions: evidence of untested critical flows, brittle visual tests, route contract gaps, source leakage in tests, secrets in tracked files, pipeline primitive bypass, ungreenable CI, stale generated artifacts, or V41 prompt work leaking backward into V40 as unbounded scope.

## V40 completion condition

V40 is complete only when its gates make exhaustive commercial application testing greenable and promotion-grade across browser E2E, visual/screenshot, API, integration, unit, pipeline, conversation, ledger/database/storage, local/staging, prompt benchmark smoke, proof artifact, and promotion workflow surfaces, while leaving V41 clearly scoped to prompts as programs.
