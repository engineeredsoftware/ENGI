# Bitcode Spec V40 Parity Matrix

## Status

- Version: `V40`
- V40 state: canonical promotion complete; V40 parity truth, generated exhaustive testing artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V40`
- Canonical proof-source commit: `a5d169eda05cceb66b78f268e888b10c42542aaa`
- Prior canonical anchor: `BITCODE_SPEC_V39.md`
- Prior generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v40-spec-family-report.json`, `.bitcode/v40-canonical-input-report.json`, `.bitcode/v40-canon-posture-drift-report.json`, `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, `.bitcode/v40-promotion-readiness-report.json`, V40 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V40_PROVEN.md` as the generated proof appendix for V40 promotion
- Source parity state: V40 source-side test inventory, unit coverage, API integration contracts, Reading pipeline integration, Conversation/Terminal integration, browser E2E visual proof, ledger/database/storage synchronization, local/staging rehearsal automation, prompt benchmark smoke, workflow, and promotion surfaces are canonicalized in the promoted V40 file family
- Scope: V40 canonical parity ledger for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon
- Last fully realized canonical target preserved in source: `V40`

## Purpose

This matrix records the V40 testing surfaces that must become promotion-grade before V40 can replace V39 as active canon.

## Audit basis

- `BITCODE_SPEC.txt` -> `V39`
- `BITCODE_SPEC_V39.md`
- `BITCODE_SPEC_V39_PROVEN.md`
- `BITCODE_SPEC_V40.md`
- existing package, API, UI, workflow, and demonstration tests

## V40 implementation matrix

| Area | Required V40 result | Source evidence | Judgment |
| --- | --- | --- | --- |
| Draft family | V40 SPEC, DELTA, NOTES, and PARITY files exist over active V39 | `BITCODE_SPEC_V40.md` family | closed |
| Roadmap truth | Roadmap states V39 active, V40 draft, V41 prompt-program future | `SPECIFICATIONS_ROADMAP.md` | closed |
| Gate workflow | Gate quality knows active V39 and draft V40 | `.github/workflows/bitcode-gate-quality.yml` | closed |
| Canon workflow | Canon quality knows active V39 and draft V40 | `.github/workflows/bitcode-canon-quality.yml` | closed |
| Browser E2E | Critical website flows have browser proof | `.bitcode/v40-browser-e2e-visual-proof.json` | implemented |
| Visual proof | Screenshot comparisons are deterministic and reviewable | `.bitcode/v40-browser-e2e-visual-proof.json` | implemented |
| API integration | Route and API contracts are parseable and source-safe | `.bitcode/v40-api-integration-contracts.json` | implemented |
| Pipeline integration | Primitive and real Reading pipeline implementations are tested | `.bitcode/v40-reading-pipeline-integration-coverage.json` | implemented |
| Conversation/Terminal integration | Conversation handoff, stream logs, Terminal Reading state, and authority boundaries are tested source-safely | `.bitcode/v40-conversation-terminal-integration.json` | implemented |
| Unit coverage | Packages, primitives, isolated implementations, and real implementations have unit coverage | `.bitcode/v40-unit-coverage-inventory.json` | implemented |
| Prompt benchmark smoke | Prompt and PromptPart benchmarks run before V41 | `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` and `V40PromptBenchmarkSmokeV41Readiness` | implemented |
| Promotion readiness | All V40 artifacts, proof generation, workflows, and promotion scripts are bound into canonical promotion | `.bitcode/v40-promotion-readiness-report.json` and `v40-canon-promotion.yml` | implemented |

## V40 implementation checklist

| Area | Closure requirement | Judgment |
| --- | --- | --- |
| Gate 1 | Open V40 family and check script | closed |
| Gate 2 | Test inventory artifact and coverage matrix | implemented |
| Gate 3 | Unit coverage closure artifact | implemented |
| Gate 4 | API/route integration artifact | implemented |
| Gate 5 | Reading pipeline integration artifact | implemented |
| Gate 6 | Conversation/Terminal integration artifact | implemented |
| Gate 7 | Browser/visual/accessibility/responsive artifact | implemented |
| Gate 8 | Ledger/database/storage/wallet/delivery sync artifact | implemented |
| Gate 9 | Local/staging rehearsal artifact | implemented |
| Gate 10 | Prompt benchmark smoke and V41 readiness artifact | implemented |
| Gate 11 | Promotion readiness artifact and workflow | implemented |

Gate 2 implementation evidence: package-backed `V40TestInventoryCoverageMatrix` emits `.bitcode/v40-test-inventory-coverage-matrix.json` and is wired through `check:v40-gate2`.
Gate 3 implementation evidence: package-backed `V40UnitCoverageInventory` emits `.bitcode/v40-unit-coverage-inventory.json` and is wired through `check:v40-gate3`.
Gate 4 implementation evidence: package-backed `V40ApiIntegrationContracts` emits `.bitcode/v40-api-integration-contracts.json` and is wired through `check:v40-gate4`.
Gate 5 implementation evidence: package-backed `V40ReadingPipelineIntegrationCoverage` emits `.bitcode/v40-reading-pipeline-integration-coverage.json` and is wired through `check:v40-gate5`.
Gate 6 implementation evidence: package-backed `V40ConversationTerminalIntegration` emits `.bitcode/v40-conversation-terminal-integration.json` and is wired through `check:v40-gate6`.
Gate 7 implementation evidence: package-backed `V40BrowserE2eVisualProof` emits `.bitcode/v40-browser-e2e-visual-proof.json` and is wired through `check:v40-gate7`.
Gate 8 implementation evidence: package-backed `V40LedgerStorageSync` emits `.bitcode/v40-ledger-storage-sync.json` and is wired through `check:v40-gate8`.
Gate 9 implementation evidence: package-backed `V40LocalStagingRehearsalAutomation` emits `.bitcode/v40-local-staging-rehearsal-automation.json` and is wired through `check:v40-gate9`.
Gate 10 implementation evidence: package-backed `V40PromptBenchmarkSmokeV41Readiness` emits `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, runs source-safe PromptPart and composed Prompt smoke receipts through `prompt-benchmark:smoke`, binds V38 benchmark inventory evidence, and is wired through `check:v40-gate10`.
Gate 11 implementation evidence: package-backed `V40PromotionReadinessReport` emits `.bitcode/v40-promotion-readiness-report.json`, binds all V40 gate artifacts, `BITCODE_SPEC_V40_PROVEN.md`, `v40-canon-promotion.yml`, promoted V40 / draft V41 workflow posture, promotion scripts, and is wired through `check:v40-gate11`.

## Gate 11 Promotion readiness parity

| Surface | Evidence | Judgment |
| --- | --- | --- |
| Gate artifacts | `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` | closed |
| Promotion artifact | `.bitcode/v40-promotion-readiness-report.json` | closed |
| Promotion workflow | `.github/workflows/v40-canon-promotion.yml` | closed |
| Promotion scripts | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, and `scripts/generate-bitcode-proven.mjs` | closed |
| Workflow posture | `.github/workflows/bitcode-gate-quality.yml` and `.github/workflows/bitcode-canon-quality.yml` validate active V40 / draft V41 posture | closed |
| Validation command | `pnpm run check:v40-gate11` | closed |

## V40 accepted boundaries

V40 may refactor test architecture, fixtures, generated artifacts, workflows, and documentation to make commercial quality greenable.
V40 must not rewrite prompt content as its main work; V41 owns prompt excellence.

## V40 completion condition

V40 closes when exhaustive testing is implemented, documented, generated, and greenable across the commercial product, packages, interfaces, pipelines, state synchronization, local/staging rehearsal, and promotion workflow.
