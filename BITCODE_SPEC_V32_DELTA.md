# Bitcode Spec V32 Delta

## Status

- Version: `V32`
- V32 state: canonical promotion complete; this delta records the promoted V31-to-V32 provation/testing closure set
- Current canonical/latest target: `V32`
- Canonical proof-source commit: `1ec49a9ed5fa5db1da5fbd2388e528b91b98321f`
- Prior canonical anchor: `BITCODE_SPEC_V31.md`
- Prior generated proof appendix: `BITCODE_SPEC_V31_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v32-spec-family-report.json`, `.bitcode/v32-canonical-input-report.json`, `.bitcode/v32-canon-posture-drift-report.json`, `.bitcode/v32-proof-coverage-matrix.json`, `.bitcode/v32-artifact-volatility-inventory.json`, `.bitcode/v32-deterministic-replay-report.json`, `.bitcode/v32-reading-pipeline-proof-coverage.json`, `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, `.bitcode/v32-interface-contract-regression-suite.json`, `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`, `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, `.bitcode/v32-promotion-proof-generation-hardening.json`, `.bitcode/v32-promotion-readiness-report.json`, V32 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V32_PROVEN.md` as the generated proof appendix for V32 promotion
- Source parity state: V32 source-side proof/test replay, generated artifacts, Reading pipeline proof coverage, ledger/BTD failure-state proof, interface regression, browser/accessibility/responsive/visual proof, readiness rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V32 file family
- State: draft target delta opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V31`
- Scope: V32 canonical delta for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails
- Spec companion: `BITCODE_SPEC_V32.md`
- Notes companion: `BITCODE_SPEC_V32_NOTES.md`
- Parity companion: `BITCODE_SPEC_V32_PARITY_MATRIX.md`
- Generated proof appendix: none until V32 promotion

## Why V32 exists

V31 canonically promoted Auxillaries support/control over the commercial Reading, Terminal, Protocol/BTD, and interface substrate.
It made profile/account, provider readiness, interface admission, wallet/BTD support, organization authority, recovery, telemetry, accessibility, and promotion posture stronger.

V32 exists because the commercial system now needs deeper proof and testing breadth across every promoted surface.
Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API routes, ledger/database/object-storage projections, and protocol-demonstration must be provable together, not only individually green.
The focus is not new product surface depth.
The focus is proof-family replay, deterministic generated artifacts, scenario and failure-state coverage, cross-surface regression, browser/accessibility/responsive/visual proof, readiness rehearsal, and promotion-proof hardening.

## Accepted V32 decisions

- V31 remains active canon during V32 drafting.
- V32 gate branches are opened from `version/v32` and merged back only when their gate acceptance criteria are closed.
- V32 owns provation/testing deepening, not another Terminal redesign.
- V32 preserves the V31 Reading journey: request Read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, buy/settle, and receive paid delivery.
- V32 inventories promoted proof families before expanding proof generation.
- V32 expands Reading pipeline test coverage for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` without changing their product law.
- V32 hardens ledger, BTD, BTC fee, settlement, disclosure, rights transfer, reconciliation, and delivery failure-state proof.
- V32 expands route/API/UI/interface regression proof without implementing deferred Exchange or Conversations product depth.
- V32 records proof/test artifacts without exposing protected source, provider tokens, private prompts, wallet secrets, service-role keys, database credentials, or pre-settlement AssetPack contents.
- V32 workflows and scripts must validate V31 active / V32 draft posture.

## Explicitly deferred

- Product feature expansion beyond proof/test seams remains out of V32.
- V33 interface/MCP/ChatGPT/API depth remains V33 except for Protocol/BTD hooks needed by V32.
- V34 deployment/runtime/storage depth remains V34 except for host-capability facts needed by V32.
- V35 telemetry/documentation depth remains V35 except for proof/test documentation needed by V32.
- Exchange product/market depth remains beyond V35.
- Website Conversations product depth remains beyond V35.
- New `$BTD` supply law remains out of scope.
- Value-bearing mainnet launch remains separately approval-gated.
- Bridge integrations remain research posture, not chain-of-record implementation.

## Pre-Implementation Sequence

1. Open `version/v32` from promoted `main`.
2. Open `v32/gate-1-provation-roadmap-opening` from `version/v32`.
3. Create the V32 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V31`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V31 is active canon, V32 is draft target, and V32-V37 scopes remain coherent after recent V28-V31 work.
5. Retarget gate-quality and canon-quality workflow posture checks to V31 active / V32 draft.
6. Add `check:v32-gate1` and a V32 Gate 1 checker.
7. Define V32 gates, acceptance criteria, carryforward parity rows, and post-V32 roadmap responsibilities.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v32`.

## Commit-Body Direction

V32 gate commit bodies should describe the closed gate, specification changes, implementation surfaces, tests, proof commands, and accepted boundaries.
The eventual V32 promotion commit body must name all closed V32 gates, generated proof/test artifacts, source-safe coverage surfaces, and the `BITCODE_SPEC.txt` pointer change from `V31` to `V32`.
It must explicitly defer V32+ scopes, Exchange, Conversations, bridge chain-of-record implementation, and value-bearing mainnet launch.

## Gate Delta

### Gate 1: V32 Roadmap And Spec Opening

Gate 1 opens V32 correctly:

- V32 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V31`.
- README, roadmap, PR template, and workflows describe V31 active / V32 draft posture.
- `check:v32-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, and promotion boundaries.
- The V32 gate list is explicit before product implementation begins.

### Gate 2: Proof Matrix Inventory And Required Contexts

Gate 2 inventories V31 proof families and the exact V32 expansion plan.

Closure acceptance:

- Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger, database, object storage, promotion, and protocol-demonstration proof surfaces are enumerated;
- each proof row names owner package/interface, fixtures, replay command, generated artifact, source-safety class, and failure mode;
- missing proof coverage is represented as planned work, not hidden confidence.

Gate 2 source closure is `.bitcode/v32-proof-coverage-matrix.json`, generated by `pnpm run generate:v32-proof-coverage-matrix` and checked by `pnpm run check:v32-gate2`.
The matrix uses explicit surface ids `terminal`, `reading`, `protocol-btd`, `auxillaries`, `mcp`, `chatgpt-app`, `api`, `ledger`, `database`, `object-storage`, `promotion`, and `protocol-demonstration`.
It also introduces the Gate 2 source-safety vocabulary: `source-safe-public`, `source-safe-internal`, `secret-presence-only`, `protected-source-locked`, `source-safe-generated-proof`, and `deferred-blocker`.
The `planned-gap` coverage status is required for missing proof rows, and such rows must carry blockers and repair posture.

### Gate 3: Deterministic Replay Harness And Artifact Stability

Gate 3 hardens replay and generated artifact determinism.

Closure acceptance:

- proof-generation commands are repeatable locally and in CI;
- generated JSON artifacts have stable ordering, source-safe payloads, and no volatile fields outside explicit volatility inventories;
- promotion proof generation fails closed on missing, stale, or malformed artifacts.

Gate 3 source closure is `.bitcode/v32-artifact-volatility-inventory.json` plus `.bitcode/v32-deterministic-replay-report.json`, generated by `pnpm run generate:v32-deterministic-replay-artifacts` and checked by `pnpm run check:v32-gate3`.
The replay report compares byte digests across two deterministic generated-artifact runs and the volatility inventory records the accepted context-bound `generatedAt` field for every V32 replay artifact.
The checker must fail closed for `missing-path`, `stale-source-commit`, `malformed-schema`, `source-safety-violation`, and `unstable-json-order`, separating those failures so promotion diagnostics are repairable.

### Gate 4: Reading Pipeline Proof Coverage

Gate 4 deepens proof over `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`.

Closure acceptance:

- phases, PTRR agents, PTRR steps, ThricifiedGenerations, prompt-part compositions, tool calls, typed outputs, and telemetry records are covered by mock tests;
- real-inference seams are validated without committing credentials or protected source;
- source-safe AssetPack preview, settlement boundary, and paid delivery proof stay distinct.

Gate 4 source closure is `.bitcode/v32-reading-pipeline-proof-coverage.json`, generated by `pnpm run generate:v32-reading-pipeline-proof-coverage` and checked by `pnpm run check:v32-reading-pipeline-proof-coverage` plus `pnpm run check:v32-gate4`.
The focused test `packages/pipelines/asset-pack/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts` proves every Reading agent is a PTRR agent with plan/try/refine/retry steps, every step has three ThricifiedGeneration sub-steps, every model-structured step exposes prompt-template/interpolated-prompt/raw-response/parsed-output telemetry, Finding Fits discovery stores plural fit deposits, and source-safe preview stays before paid pull-request delivery.

### Gate 5: Ledger BTD Settlement Failure-State Coverage

Gate 5 deepens ledger, BTD, BTC fee, disclosure, rights-transfer, reconciliation, and delivery failure-state proof.

Closure acceptance:

- fee quote, Taproot/PSBT posture, range/read-license/right transfer, ledger/database projection, object-storage delivery, and PR delivery tests cover blocked, repair, and success states;
- no test leaks pre-settlement AssetPack source to a Reader;
- reconciliation tests prove deterministic repair roots.

Gate 5 source closure is `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, generated by `pnpm run generate:v32-ledger-btd-settlement-failure-states` and checked by `pnpm run check:v32-ledger-btd-settlement-failure-states` plus `pnpm run check:v32-gate5`.
The focused test `packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts` covers BTC quote and PSBT phases, blocked-readiness receipts, BTD mint/read/rights-transfer receipts, source-to-shares conservation, settlement drift, projection drift, encrypted protected-source storage, source-safe disclosure, paid unlock, and pull-request delivery readback.
The artifact records source-safe economic proof metadata and source/test digests only.

### Gate 6: Interface Contract Regression Suites

Gate 6 hardens API, MCP, ChatGPT App, Terminal, Auxillaries, and deferred-interface contract tests.

Closure acceptance:

- route schemas, tool contracts, auth boundaries, source-safety classes, and policy denials are covered by shared fixtures;
- deferred Exchange and Conversations hooks remain tested as blocked/deferred, not implemented product depth;
- contract tests are reusable by future interface versions.

Gate 6 source closure is `.bitcode/v32-interface-contract-regression-suite.json`, generated by `pnpm run generate:v32-interface-contract-regression-suites` and checked by `pnpm run check:v32-interface-contract-regression-suites` plus `pnpm run check:v32-gate6`.
The focused test `packages/btd/__tests__/v32-interface-contract-regression.test.ts` proves active `terminal`, `api`, `mcp`, `chatgpt_app`, and `auxillaries_hook` contracts and blocked `exchange_hook` plus `conversations_hook` deferred contracts from shared source-safe fixtures.
The artifact records interface contract metadata and source/test digests only.

### Gate 7: Browser Accessibility Responsive Visual Coverage

Gate 7 expands operator-facing proof.

Closure acceptance:

- Terminal and Auxillaries guided/default/detail states are covered across desktop and mobile, with Auxillaries proved through the active Terminal-hosted support-plane entry points (`/terminal?auxillary-open-to=<pane>`);
- keyboard, labels, focus, contrast, reduced motion, overflow, and visual regression evidence are deterministic enough for CI;
- browser proofs avoid brittle screenshots where semantic assertions can prove the same behavior.

Gate 7 source closure is `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`, generated by `pnpm run generate:v32-browser-accessibility-responsive-visual-proof` and checked by `pnpm run check:v32-browser-accessibility-responsive-visual-proof` plus `pnpm run check:v32-gate7`.
The focused Jest test `apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts` and Playwright proof `apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts` cover Terminal and Auxillaries default/guided/detail states, phone and desktop browser execution, accessibility assertions, overflow proof, reduced motion, and `no-screenshot-only-approval`.
The artifact records browser proof metadata and source/test digests only.

### Gate 8: Testnet And Mainnet Readiness Rehearsal

Gate 8 rehearses environment readiness without approving value-bearing launch.

Closure acceptance:

- local, staging-testnet, production-mainnet, and disabled/offline lanes have typed readiness records;
- secret presence, provider connectivity, ledger/database/object-storage posture, BTC network posture, and rollback/repair checks are source-safe;
- production-mainnet remains blocked unless a future explicit launch gate admits it.

Gate 8 source closure is `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, generated by `pnpm run generate:v32-testnet-mainnet-readiness-rehearsal` and checked by `pnpm run check:v32-testnet-mainnet-readiness-rehearsal` plus `pnpm run check:v32-gate8`.
The implementation centers on `packages/btd/src/testnet-mainnet-readiness-rehearsal.ts` and `packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts`.
The record set binds local, staging-testnet, production-mainnet, and offline-disabled lanes; classifies credentials as secret-presence-only; names staging-testnet project `tkpyosihuouusyaxtbau` and production-mainnet project `rinalyjfecxnmyczrpzo`; and keeps production-mainnet value-bearing settlement blocked for V32.

### Gate 9: Promotion Proof Generation Hardening

Gate 9 hardens V32 promotion proof generation and workflow debuggability.

Closure acceptance:

- `BITCODE_SPEC_V32_PROVEN.md` generation can be dry-run, checked, and promoted with clear failure messages;
- promotion workflows surface source-safe generated artifact diffs and stale-posture causes;
- generated artifact `.bitcode/v32-promotion-proof-generation-hardening.json` records dry-run, check, and promotion-plan modes, failure taxonomy, branch-protection posture, and direct-main-push denial;
- generator command `pnpm run generate:v32-promotion-proof-generation-hardening`, checker command `pnpm run check:v32-promotion-proof-generation-hardening`, and gate closure command `pnpm run check:v32-gate9` fail closed on stale, incomplete, undocumented, or source-unsafe proof hardening;
- focused protocol test `packages/protocol/test/v32-promotion-proof-generation.test.js` proves V32 proof package generation, hardening artifact production, and source-safe generated artifact diffs;
- branch protection and promotion commits do not require unsafe direct pushes to `main`.

### Gate 10: V32 Promotion Readiness

Gate 10 owns final local/staging proof, generated artifacts, and V32 promotion workflow support.

Closure acceptance:

- `check:v32-gate10` validates promoted-readiness posture and `.bitcode/v32-promotion-readiness-report.json`;
- V32 promotion workflow validates source branch, local proof commands, proof/test evidence, generated `.bitcode/v32-*` reports, and `BITCODE_SPEC_V32_PROVEN.md`;
- promotion scripts support V32 and rewrite post-promotion active V32 / draft V33 posture;
- `version/v32` can be requested into `main` only after all V32 gates close.

Gate 10 implementation centers:

- `scripts/check-v32-gate10-promotion-readiness.mjs`;
- `.github/workflows/v32-canon-promotion.yml`;
- V32 support in `scripts/promote-bitcode-canon.mjs`;
- V32 status rewriting in `scripts/prepare-bitcode-spec-family-promotion.mjs`;
- V32 generated appendix/artifact support in `packages/protocol/src/canonical/proven-generator.js`;
- generated `.bitcode/v32-*` artifacts, `.bitcode/v32-promotion-readiness-report.json`, and source-safe `BITCODE_V32_QA.md`.
