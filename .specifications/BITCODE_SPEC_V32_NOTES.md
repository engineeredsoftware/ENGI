# Bitcode Spec V32 Notes

## Status

- Version: `V32`
- V32 state: canonical promotion complete; V32 notes record the accepted proof/test, readiness rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V32`
- Canonical proof-source commit: `1ec49a9ed5fa5db1da5fbd2388e528b91b98321f`
- Current active draft target: `V32`
- Prior canonical anchor: `BITCODE_SPEC_V31.md`
- Prior generated proof appendix: `BITCODE_SPEC_V31_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v32/spec-family-report.json`, `.proofs/v32/canonical-input-report.json`, `.proofs/v32/canon-posture-drift-report.json`, `.proofs/v32/proof-coverage-matrix.json`, `.proofs/v32/artifact-volatility-inventory.json`, `.proofs/v32/deterministic-replay-report.json`, `.proofs/v32/reading-pipeline-proof-coverage.json`, `.proofs/v32/ledger-btd-settlement-failure-state-coverage.json`, `.proofs/v32/interface-contract-regression-suite.json`, `.proofs/v32/browser-accessibility-responsive-visual-proof.json`, `.proofs/v32/testnet-mainnet-readiness-rehearsal.json`, `.proofs/v32/promotion-proof-generation-hardening.json`, `.proofs/v32/promotion-readiness-report.json`, V32 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V32_PROVEN.md` as the generated proof appendix for V32 promotion
- Source parity state: V32 source-side proof/test replay, generated artifacts, Reading pipeline proof coverage, ledger/BTD failure-state proof, interface regression, browser/accessibility/responsive/visual proof, readiness rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V32 file family
- Scope: V32 canonical notes for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails
- Last fully realized canonical target preserved in source: `V32`

This NOTES file does not promote V32.
It binds the working V32 gate plan while `BITCODE_SPEC.txt` remains `V31`.

## Notes companion rule

This file is a working companion to `BITCODE_SPEC_V32.md`.
When a V32 gate finds that proof/test architecture needs a clearer algorithm, object, fixture, command, or failure boundary, the SPEC, DELTA, PARITY, ROADMAP, implementation, and tests must be updated together.

## Simplified-spec reading rule

V32 should be read as: promoted V31 already owns the commercial surfaces; V32 proves those surfaces deeply enough to trust future enterprise shippability.
V32 does not add product surface depth for its own sake.
It adds proof, replay, regression, scenario, failure-state, browser, accessibility, visual, readiness, and promotion evidence where promoted behavior needs stronger confidence.

## Concise current-system reading

The current system is V31 active canon with V32 open as a proof/testing draft target.
Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and the standalone demonstration are already promoted surfaces.
V32 asks whether those promoted surfaces can be replayed, tested, diffed, and promoted with enough source-safe evidence to support enterprise shippability.

## V32 gate plan

### Gate 1: V32 Roadmap And Spec Opening

Open the V32 draft family over active V31:

- create `BITCODE_SPEC_V32.md`, DELTA, NOTES, and PARITY;
- preserve `BITCODE_SPEC.txt -> V31`;
- update roadmap, README, PR template, workflow posture, package scripts, and Gate 1 checker;
- keep V33-V37 scopes coherent after V31 promotion.

### Gate 2: Proof Matrix Inventory And Required Contexts

Inventory all promoted proof/test surfaces and define required V32 coverage:

- Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger, database, object storage, promotion, and protocol-demonstration;
- explicit surface ids `terminal`, `reading`, `protocol-btd`, `auxillaries`, `mcp`, `chatgpt-app`, `api`, `ledger`, `database`, `object-storage`, `promotion`, and `protocol-demonstration`;
- owner package/interface, fixture, replay command, artifact path, source-safety class, and failure mode per row;
- source-safety class vocabulary `source-safe-public`, `source-safe-internal`, `secret-presence-only`, `protected-source-locked`, `source-safe-generated-proof`, and `deferred-blocker`;
- generated artifact `.proofs/v32/proof-coverage-matrix.json` checked by `pnpm run check:v32-gate2`;
- explicit planned work for every coverage gap.

### Gate 3: Deterministic Replay Harness And Artifact Stability

Harden generated artifact repeatability:

- stable JSON ordering and source-safe payloads;
- volatility inventories for accepted variable fields;
- fail-closed checks for stale, missing, malformed, or non-regenerable artifacts.
- generated artifacts `.proofs/v32/artifact-volatility-inventory.json` and `.proofs/v32/deterministic-replay-report.json`;
- generator command `pnpm run generate:v32-deterministic-replay-artifacts` and closure checker `pnpm run check:v32-gate3`;
- required failure modes `missing-path`, `stale-source-commit`, `malformed-schema`, `source-safety-violation`, and `unstable-json-order`.

### Gate 4: Reading Pipeline Proof Coverage

Deepen `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` coverage:

- phase/agent/step/sub-step/tool/prompt telemetry assertions;
- PTRR agent and ThricifiedGeneration typed output coverage;
- mock coverage for every inference point and real-inference seam validation without committing secrets;
- source-safe preview, paid unlock, and PR delivery proof boundaries.
- generated artifact `.proofs/v32/reading-pipeline-proof-coverage.json`;
- generator command `pnpm run generate:v32-reading-pipeline-proof-coverage`, checker command `pnpm run check:v32-reading-pipeline-proof-coverage`, and gate closure command `pnpm run check:v32-gate4`;
- exact current counts: two Reading pipelines, eleven phases, twelve PTRR agents, forty-eight PTRR steps, one hundred forty-four ThricifiedGenerations, twenty model-structured PTRR steps, five prompt templates, and four tools.

### Gate 5: Ledger BTD Settlement Failure-State Coverage

Deepen proof over economic and ownership state:

- BTC fee quotes, Taproot/PSBT posture, network policy, broadcast/finality states;
- BTD range/read-license/right-transfer receipts;
- ledger/database/object-storage/PR delivery synchronization;
- settlement repair and reconciliation roots.
- generated artifact `.proofs/v32/ledger-btd-settlement-failure-state-coverage.json`;
- generator command `pnpm run generate:v32-ledger-btd-settlement-failure-states`, checker command `pnpm run check:v32-ledger-btd-settlement-failure-states`, and gate closure command `pnpm run check:v32-gate5`;
- focused test `packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts` covering success, blocked, and repair paths without exposing protected AssetPack source before paid unlock.

### Gate 6: Interface Contract Regression Suites

Harden API, MCP, ChatGPT App, Terminal, Auxillaries, and deferred-interface contracts:

- route schemas, tool contracts, auth boundaries, policy denials, and source-safety classes;
- shared fixtures and reusable contract tests;
- Exchange and Conversations remain deferred product-depth hooks with tested blockers.
- generated artifact `.proofs/v32/interface-contract-regression-suite.json`;
- generator command `pnpm run generate:v32-interface-contract-regression-suites`, checker command `pnpm run check:v32-interface-contract-regression-suites`, and gate closure command `pnpm run check:v32-gate6`;
- focused test `packages/btd/__tests__/v32-interface-contract-regression.test.ts` proving active interface contracts plus `exchange_hook` and `conversations_hook` blocked/deferred rows.

### Gate 7: Browser Accessibility Responsive Visual Coverage

Expand operator-facing proof:

- Terminal and Terminal-hosted Auxillaries default/guided/detail states across desktop and mobile;
- keyboard, labels, focus, contrast, reduced motion, overflow, and visual regression evidence;
- semantic browser assertions where they are more stable than screenshots.
- generated artifact `.proofs/v32/browser-accessibility-responsive-visual-proof.json`;
- generator command `pnpm run generate:v32-browser-accessibility-responsive-visual-proof`, checker command `pnpm run check:v32-browser-accessibility-responsive-visual-proof`, and gate closure command `pnpm run check:v32-gate7`;
- focused Jest test `apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts` and browser proof `apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts` proving `no-screenshot-only-approval` visual semantics.

### Gate 8: Testnet And Mainnet Readiness Rehearsal

Rehearse environment readiness without admitting value-bearing launch:

- local, staging-testnet, production-mainnet, and disabled/offline lanes;
- secret presence classes, provider connectivity, ledger/database/object-storage posture, BTC network posture, rollback, and repair;
- production-mainnet remains blocked unless a future explicit launch gate admits it.
- generated artifact `.proofs/v32/testnet-mainnet-readiness-rehearsal.json`;
- generator command `pnpm run generate:v32-testnet-mainnet-readiness-rehearsal`, checker command `pnpm run check:v32-testnet-mainnet-readiness-rehearsal`, and gate closure command `pnpm run check:v32-gate8`;
- focused package test `packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts` proving typed lanes, secret-presence-only handling, staging-testnet and production-mainnet project boundaries, disabled/offline fixture posture, and production-mainnet value-bearing block posture.

### Gate 9: Promotion Proof Generation Hardening

Make promotion evidence easier to debug:

- dry-run and check modes for generated V32 proof;
- clear stale-posture, proven-stale, missing-artifact, and artifact-drift failures;
- source-safe generated artifact diffs;
- branch-protection friendly promotion commits;
- generated artifact `.proofs/v32/promotion-proof-generation-hardening.json`;
- generator command `pnpm run generate:v32-promotion-proof-generation-hardening`, checker command `pnpm run check:v32-promotion-proof-generation-hardening`, and gate closure command `pnpm run check:v32-gate9`;
- focused protocol test `packages/protocol/test/v32-promotion-proof-generation.test.js` proving V32 proof package hardening and direct-main-push denial.

### Gate 10: V32 Promotion Readiness

Close V32:

- `check:v32-gate10`;
- V32 promotion workflow;
- V32 generated `.proofs/v32/*` artifacts;
- `.proofs/v32/promotion-readiness-report.json`;
- `BITCODE_SPEC_V32_PROVEN.md`;
- active V32 / draft V33 runtime posture after promotion.

## Carryforward boundaries

- V32 does not redefine V31 Reading, Finding Fits, AssetPack preview, settlement, delivery, BTD, or BTC fee law.
- V32 does not implement Exchange market depth or website Conversations product depth.
- V32 does not approve production-mainnet value-bearing launch.
- V32 may add test-only fixtures, source-safe proof objects, generated artifacts, scripts, and workflow coverage needed to prove existing behavior.
