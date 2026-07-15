# Bitcode Spec V40 Delta

## Status

- Version: `V40`
- V40 state: canonical promotion complete; this delta records the promoted V39-to-V40 exhaustive testing closure set
- Current canonical/latest target: `V40`
- Canonical proof-source commit: `a5d169eda05cceb66b78f268e888b10c42542aaa`
- Prior canonical anchor: `BITCODE_SPEC_V39.md`
- Prior generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v40-spec-family-report.json`, `.bitcode/v40-canonical-input-report.json`, `.bitcode/v40-canon-posture-drift-report.json`, `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, `.bitcode/v40-promotion-readiness-report.json`, V40 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V40_PROVEN.md` as the generated proof appendix for V40 promotion
- Source parity state: V40 source-side test inventory, unit coverage, API integration contracts, Reading pipeline integration, Conversation/Terminal integration, browser E2E visual proof, ledger/database/storage synchronization, local/staging rehearsal automation, prompt benchmark smoke, workflow, and promotion surfaces are canonicalized in the promoted V40 file family
- Scope: V40 canonical delta for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon

## Why V40 exists

V39 made commercial Reading product behavior canonical.
V40 exists because that behavior now needs exhaustive proof through tests: browser E2E, visual/screenshot comparisons, API contracts, pipeline integrations, conversation integrations, ledger/database/storage synchronization, unit coverage, prompt benchmark smoke, and local/staging rehearsal.

## Accepted V40 decisions

- V40 is a testing-focused version, not a prompt-rewriting version.
- V40 must test both primitives and real commercial implementations.
- V40 must make the five-step Reading flow fully browser-proven and contract-proven.
- V40 must add generated artifacts for every major testing surface.
- V40 must keep value-bearing production-mainnet checks opt-in until explicitly promoted.
- V41 is reserved for Prompt and PromptPart excellence after V40 makes benchmark and test lanes reliable.

## V40 gate plan

### Gate 1: Exhaustive Testing Roadmap And Spec Opening

Open the V40 spec family, roadmap, branch posture, workflow posture, checker, and V41 planning boundary.

### Gate 2: Test Inventory And Coverage Matrix

Inventory existing tests, missing critical surfaces, owners, commands, fixtures, and generated artifacts.
Gate 2 closes with package-backed `V40TestInventoryCoverageMatrix`, deterministic `.bitcode/v40-test-inventory-coverage-matrix.json`, protocol exports, source-safe rows for every planned V40 testing surface, and `check:v40-gate2`.

### Gate 3: Unit Coverage For Packages And Primitives

Close unit coverage over protocol, BTD, prompts, agents, tools, executions, pipelines, utilities, and isolated app helpers.
Gate 3 closes with package-backed `V40UnitCoverageInventory`, deterministic `.bitcode/v40-unit-coverage-inventory.json`, protocol exports, source-safe rows for every critical unit surface, and `check:v40-gate3`.

### Gate 4: API And Route Integration Contracts

Close API, UAPI, public route, MCP API, ChatGPT App, persistence, and authorization contract suites.
Gate 4 closes with package-backed `V40ApiIntegrationContracts`, deterministic `.bitcode/v40-api-integration-contracts.json`, protocol exports, source-safe rows for every critical API/interface contract surface, and `check:v40-gate4`.

### Gate 5: Reading Pipeline Integration Coverage

Close primitive and real implementation coverage for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`.
Gate 5 closes with package-backed `V40ReadingPipelineIntegrationCoverage`, deterministic `.bitcode/v40-reading-pipeline-integration-coverage.json`, protocol exports, source-safe rows for real Reading pipeline topology/runtime/search/agent/boundary/telemetry/harness/primitive/rehearsal integration, and `check:v40-gate5`.

### Gate 6: Conversation And Terminal Integration Coverage

Close cross-surface tests for Conversation, Terminal handoff, Reading state, telemetry, and source-safe disclosure.
Gate 6 closes with package-backed `V40ConversationTerminalIntegration`, deterministic `.bitcode/v40-conversation-terminal-integration.json`, protocol exports, a focused Conversation-to-Terminal integration test, source-safe rows for handoff, stream-log projection, route/API contracts, writing/source selector handoff, Terminal Reading state, harness streaming, authority boundaries, docs/rehearsal parity, and `check:v40-gate6`.

### Gate 7: Browser E2E, Accessibility, Responsive, And Visual Proof

Close Playwright/browser paths, visual baselines, accessibility, responsive viewports, and interaction-state matrices.
Gate 7 closes with package-backed `V40BrowserE2eVisualProof`, deterministic `.bitcode/v40-browser-e2e-visual-proof.json`, protocol exports, app-owned current browser proof contract, source-safe rows for Terminal, Conversations, Auxillaries, Exchange, Docs, responsive viewport overflow, screenshot/trace baselines, keyboard/landmark/status accessibility, a focused browser spec, workflow wiring, and `check:v40-gate7`.

### Gate 8: Ledger, Database, Storage, Wallet, And Delivery Synchronization

Close synchronization and reconciliation tests for settlement, rights transfer, delivery, repair, and storage projections.
Gate 8 closes with package-backed `V40LedgerStorageSync`, deterministic `.bitcode/v40-ledger-storage-sync.json`, protocol exports, app-owned current synchronization contract, source-safe rows for BTC fee finality, BTD rights, source-to-shares compensation, ledger/database/object-storage reconciliation, storage locks, post-settlement pull-request delivery, repair posture, no-custody wallet authority, Terminal readback, workflow wiring, and `check:v40-gate8`.

### Gate 9: Local And Staging-Testnet Rehearsal Automation

Close local/staging rehearsal scripts with lane-bound secrets, no tracked credentials, and reproducible operator receipts.
Gate 9 closes with package-backed `V40LocalStagingRehearsalAutomation`, deterministic `.bitcode/v40-local-staging-rehearsal-automation.json`, source-safe operator dry-run receipts for local and staging-testnet lanes, explicit live-execution opt-in, staging-testnet Supabase project binding, real-inference and database-stream readback checks, workflow wiring, and `check:v40-gate9`.

### Gate 10: Prompt Benchmark Smoke And V41 Readiness

Make prompt and PromptPart benchmark commands runnable and reportable without rewriting prompt content, then hand focused prompt evolution to V41.
Gate 10 closes with package-backed `V40PromptBenchmarkSmokeV41Readiness`, deterministic `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, protocol exports, source-safe PromptPart and composed Prompt smoke receipts, package benchmark report command binding, V38 prompt benchmark inventory binding, workflow wiring, and `check:v40-gate10`.
Gate 10 does not rewrite PromptPart or Prompt content; it proves benchmark infrastructure readiness and hands every semantic prompt-program improvement to V41.

### Gate 11: V40 Promotion Readiness

Bind all V40 artifacts, proof generation, workflows, and promotion commands into the V40 canonical promotion path.
Gate 11 closes with package-backed `V40PromotionReadinessReport`, deterministic `.bitcode/v40-promotion-readiness-report.json`, protocol exports, generated proof support for `BITCODE_SPEC_V40_PROVEN.md`, `v40-canon-promotion.yml`, gate/canon workflow support for active V40 / draft V41 posture, promotion scripts support V40, dry-run promotion validation, source-safe rows for every V40 gate artifact, and `check:v40-gate11`.

## Explicitly deferred

- Prompt and PromptPart semantic rewriting, repartitioning, retitling, catalogue refactoring, benchmark-driven improvement, and excellence auditing are deferred to V41.
- New commercial product features are deferred unless needed to make tests truthful.
- Production-mainnet value-bearing tests remain opt-in until a later promotion mandates them.

## Pre-Implementation Sequence

1. Open `version/v40` and `v40/gate-1-testing-roadmap-opening`.
2. Keep `BITCODE_SPEC.txt` at `V39`.
3. Add the V40 spec family and Gate 1 checker.
4. Update roadmap, docs, package scripts, and workflows for active V39 / draft V40.
5. Validate V40 draft family and V39 active posture.

## Commit-Body Direction

V40 commits should name the testing surface, generated artifact, proof command, and whether the gate closes unit, integration, browser, visual, local/staging, or promotion readiness coverage.
