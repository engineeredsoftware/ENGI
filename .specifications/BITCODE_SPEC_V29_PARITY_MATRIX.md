# Bitcode Spec V29 Parity Matrix

## Status

- Version: `V29`
- V29 state: canonical promotion complete; V29 parity truth, product-gate audit, generated proof, and promotion automation are aligned
- Current canonical/latest target: `V29`
- Canonical proof-source commit: `3cfa3e71ef553ecb25221ed7116e29eccbc4df24`
- Prior canonical anchor: `BITCODE_SPEC_V28.md`
- Prior generated proof appendix: `BITCODE_SPEC_V28_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v29/spec-family-report.json`, `.proofs/v29/canonical-input-report.json`, `.proofs/v29/canon-posture-drift-report.json`, V29 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V29_PROVEN.md` as the generated proof appendix for V29 promotion
- Source parity state: V29 source-side Terminal transaction, wallet/BTC, Reading observability, AssetPack disclosure, settlement repair, organization authority, UX proof, workflow, and promotion surfaces are canonicalized in the promoted V29 file family
- State: draft target parity matrix opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V28`
- Scope: V29 canonical parity ledger for Terminal transaction depth, local/staging readiness, and promotion automation over V28
- Spec companion: `BITCODE_SPEC_V29.md`
- Notes companion: `BITCODE_SPEC_V29_NOTES.md`
- Delta companion: `BITCODE_SPEC_V29_DELTA.md`
- Generated proof appendix: none until V29 promotion
- Last fully realized canonical target preserved in source: `V29`

## Purpose

The V29 parity matrix prevents Terminal-depth work from becoming vague product polish.
Each gate must name source surfaces, tests, proof evidence, documentation, and accepted boundaries before it closes.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V28.md`
- `BITCODE_SPEC_V28_DELTA.md`
- `BITCODE_SPEC_V28_NOTES.md`
- `BITCODE_SPEC_V28_PARITY_MATRIX.md`
- `BITCODE_SPEC_V28_PROVEN.md`
- `BITCODE_SPEC_V29_NOTES.md`
- `README.md`
- `AGENTS.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `protocol-demonstration/src/canon-posture.js`
- Terminal, Reading pipeline, BTD, pipeline-host, UAPI, and workflow surfaces named by V28 promotion.

No `_legacy/` source is active source truth.

## V29 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V29.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v29/gate-1-objectives-and-gating` | closed | V29 family validates in draft mode over active V28 and `check:v29-gate1` passes. |
| Workflow retargeting | Gate 1 | `.github/workflows/bitcode-gate-quality.yml`, `.github/workflows/bitcode-canon-quality.yml` | closed | CI checks V28 active / V29 draft posture instead of stale V27/V28 posture. |
| Terminal transaction read models | Gate 2 | `apps/uapi/app/terminal/terminal-transaction-read-model.ts`, `apps/uapi/app/terminal/terminal-transaction-query.ts`, `TerminalTransactionWorkspace.tsx`, `TerminalTransactionDetailSurface.tsx`, UAPI tests, Gate 2 checker | closed | Terminal transaction state is URL-addressable, recoverable, typed, low-detail by default, and expandable without raw JSON as the ordinary operator contract. |
| Wallet signer/BTC operations | Gate 3 | `packages/btd/src/btc-fee-operation.ts`, BTC fee route, Terminal Wallet/BTC detail section, BTD and UAPI tests, Gate 3 checker | closed | Signer session, PSBT, broadcast/finality/reorg/replacement/failure states are ordinary Terminal states. |
| Reading pipeline observability | Gate 4 | `packages/pipelines/asset-pack/src/reading-pipeline-observability.ts`, `packages/pipeline-hosts/src/asset-pack-harness.ts`, Terminal stream components, Gate 4 checker | closed | Pipeline/phase/PTRR/ThricifiedGeneration/tool/prompt/raw-output/parsed-output telemetry is contract-projected, complete, and readable. |
| AssetPack disclosure rights | Gate 5 | `asset-pack-disclosure.ts`, AssetPack postprocess, sandbox harness, BTD access tests, Terminal disclosure review UI, Gate 5 checker | closed | Source-safe preview and paid unlock are proven without protected-source leakage. |
| Settlement reconciliation repair | Gate 6 | BTD journal/reconciliation, Supabase readback, sandbox harness settlement evidence, Terminal repair UI, Gate 6 checker | closed | Ledger, database, and metaphysical state drift is classified, proof-rooted, repair-actioned, and visible. |
| Organization permission authority | Gate 7 | `packages/btd/src/authority.ts`, BTD/API/MCP/ChatGPT App tests, sandbox harness authority evidence, Terminal Authority section, Gate 7 checker | closed | Registry-derived roles, holdings, read-license authority, settlement, confirmation, and interface admission govern actions. |
| Commercial formalization | Gate 8 | `packages/protocol/src/index.js`, `packages/protocol/src/canon-posture.js`, root scripts, protocol package tests, import scans, docs, Gate 8 checker | closed | Demonstration-origin commercial internals are package-native and no direct demonstration-source imports remain in commercial/runtime sources. |
| Terminal UX quality | Gate 9 | Terminal UX contract, Playwright/Jest/a11y/responsive/browser QA | closed | Complete transaction cockpit is usable by default and inspectable in detail. |
| Promotion readiness | Gate 10 | promotion workflow, promotion command plan, V29 QA ledger, runtime posture preparation, `.proofs/v29/*`, `BITCODE_SPEC_V29_PROVEN.md` | closed | `version/v29` can promote to `main` only after all V29 checks pass and promotion automation can commit generated canon. |

## V29 implementation checklist

| Area | Required V29 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V28` during V29 gate work | closed |
| Gate branch pattern | V29 work happens on `version/v29` or `v29/gate-N-*` branches | closed |
| Spec-family shape | V29 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v29-gate1` fails closed on stale posture or missing gates | closed |
| Gate 2 read model | `pnpm run check:v29-gate2` proves typed route-owned Terminal transaction reading | closed |
| Gate 3 wallet/BTC operation | `pnpm run check:v29-gate3` proves quote lifecycle, signer recovery, blocked readiness, API posture, and Terminal Wallet/BTC detail | closed |
| Gate 4 Reading observability | `pnpm run check:v29-gate4` proves contract-aware Reading stream telemetry and Terminal rendering | closed |
| Gate 5 AssetPack disclosure | `pnpm run check:v29-gate5` proves source-safe disclosure review, leakage detection, Terminal preview rendering, and PR title enforcement | closed |
| Gate 7 organization authority | `pnpm run check:v29-gate7` proves shared org/interface authority across BTD, API, MCP, ChatGPT App, harness, and Terminal | closed |
| Gate 8 commercial formalization | `pnpm run check:v29-gate8` proves package-native protocol exports, V28/V29 posture, script import cleanup, docs, tests, and CI wiring | closed |
| Gate 9 Terminal UX browser proof | `pnpm run check:v29-gate9` proves named landmarks, explicit state semantics, responsive browser coverage, focused Jest coverage, and CI wiring | closed |
| Gate 10 promotion readiness | `pnpm run check:v29-gate10` proves local/staging readiness, V29 promotion workflow support, runtime posture preparation, promotion dry-run, and generated-canon automation | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V29 judgment |
| --- | --- | --- |
| Active canon remains V28 during V29 draft opening | `BITCODE_SPEC.txt` contains `V28` | drafted |
| Runtime draft target is V29 | `protocol-demonstration/src/canon-posture.js` declares V28 active and V29 draft | drafted |
| V29 SPEC family exists as draft | `BITCODE_SPEC_V29.md`, DELTA, NOTES, and PARITY | drafted |
| Gate-quality workflow is V29-aware | `.github/workflows/bitcode-gate-quality.yml` | drafted |
| Canon-quality workflow is V29-aware | `.github/workflows/bitcode-canon-quality.yml` | drafted |
| README reflects V28/V29 posture | `README.md` | drafted |
| V29 Gate 1 checker exists | `scripts/check-v29-gate1-objectives-and-gating.mjs` and package script | drafted |

## accepted boundaries

- Gate 1 does not implement Terminal product depth.
- Gate 1 does not create `BITCODE_SPEC_V29_PROVEN.md`.
- Gate 1 does not promote `BITCODE_SPEC.txt` to V29.
- Gate 1 may retarget workflows to active V28 / draft V29 so later gates are greenable.

## completion condition

Gate 1 is complete when the V29 draft family validates, `check:v29-gate1` passes, workflow posture is V29-aware, README/docs reflect V29 initiation, and the gate branch is committed and pushed for review into `version/v29`.

## Gate 2 Parity

| Requirement | Source evidence | Current V29 judgment |
| --- | --- | --- |
| Selected transactions are URL-addressable | `terminal-transaction-query.ts`, `TerminalPageClient.tsx` | drafted |
| Detail focus is typed and recoverable | `terminal-transaction-read-model.ts`, `TerminalTransactionDetailActionBar.tsx` | drafted |
| Low-detail read model exists before raw payloads | `terminal-transaction-read-model.ts`, `TerminalTransactionDetailHero.tsx` | drafted |
| Section navigation exposes availability and blockers | `terminal-transaction-read-model.ts`, `TerminalTransactionDetailSurface.tsx` | drafted |
| Console is blocked outside live execution-history mode | `terminal-transaction-read-model.ts`, UAPI read-model tests | drafted |
| Gate 2 checker is wired to package scripts and CI | `scripts/check-v29-gate2-terminal-transaction-read-models.mjs`, `package.json`, gate workflow | drafted |

## Gate 2 accepted boundaries

- Gate 2 does not implement wallet signing, PSBT, broadcast, reorg, or replacement depth.
- Gate 2 does not implement deeper Reading pipeline telemetry; Gate 4 owns that work.
- Gate 2 does not expose protected AssetPack source before settlement.
- Gate 2 does not add versioned API routes or source identifiers.

## Gate 2 completion condition

Gate 2 is complete when Terminal selected transaction state rewrites recoverable URLs, a typed read model drives detail navigation and low-detail summaries, focused tests pass, `check:v29-gate2` passes, CI invokes the checker, docs name the implemented source surfaces, and the gate branch is committed and pushed for review into `version/v29`.

## Gate 3 Parity

| Requirement | Source evidence | Current V29 judgment |
| --- | --- | --- |
| BTC fee quote lifecycle is package-owned | `packages/btd/src/btc-fee-operation.ts`, `packages/btd/__tests__/btc-fee-operation.test.ts` | drafted |
| Signer-session recovery is explicit and no-custody | `buildWalletSignerSessionRecovery`, BTD operation tests | drafted |
| Blocked-readiness receipts name blocker and repair path | `buildBtcFeeBlockedReadinessReceipt`, BTD operation tests | drafted |
| Operation posture covers PSBT, broadcast, finality, replacement, reorg, failure | `buildBtcFeeOperationPosture`, BTD operation tests | drafted |
| BTC fee route serializes JSON-safe operation posture | `packages/api/src/routes/btd-crypto.ts`, route typecheck, route tests | drafted |
| Terminal exposes Wallet/BTC detail section | `terminal-transaction-query.ts`, `terminal-transaction-read-model.ts`, `TerminalTransactionWalletBtcCard.tsx`, `terminal-wallet-btc-operation.ts`, UAPI tests | drafted |
| Gate 3 checker is wired to package scripts and CI | `scripts/check-v29-gate3-wallet-signer-btc-operations.mjs`, `package.json`, gate workflow | drafted |

## Gate 3 accepted boundaries

- Gate 3 does not implement full settlement reconciliation repair; Gate 6 owns drift repair and readback repair actions.
- Gate 3 does not expose protected AssetPack source before settlement.
- Gate 3 does not broadcast value-bearing mainnet transactions.
- Gate 3 does not add versioned API routes or source identifiers.

## Gate 3 completion condition

Gate 3 is complete when package primitives model BTC quotes, signer recovery, operation posture, and blocked readiness; API responses serialize operation posture; Terminal has a Wallet/BTC route-owned detail section; focused package and UAPI tests pass; `check:v29-gate3` passes; CI invokes the checker and tests; docs name the implemented source surfaces; and the gate branch is committed and pushed for review into `version/v29`.

## Gate 4 Parity

| Requirement | Source evidence | Current V29 judgment |
| --- | --- | --- |
| Reading pipeline contracts remain the source of truth | `reading-pipeline-contract.ts`, contract tests | drafted |
| Observability inventory covers both Reading pipelines and all contract levels | `reading-pipeline-observability.ts`, observability tests | drafted |
| Live sandbox harness stamps stream events with contract ids and output posture | `packages/pipeline-hosts/src/asset-pack-harness.ts`, harness tests | drafted |
| Harness evidence exports inventory and coverage readback | `readingPipelineObservabilityInventory`, `readingPipelineObservabilityCoverage`, harness tests | drafted |
| Terminal summaries and execution state expose pipeline, phase, PTRR, ThricifiedGeneration, prompt, tool, and schema fields | `terminal-pipeline-harness-client.ts`, Terminal harness tests | drafted |
| Shared execution log header renders contract-aware identifiers without raw JSON first | `pipeline-execution-log-header.tsx`, header tests | drafted |
| Gate 4 checker is wired to package scripts and CI | `scripts/check-v29-gate4-reading-pipeline-observability.mjs`, `package.json`, gate workflow | drafted |

## Gate 4 accepted boundaries

- Gate 4 does not add a new execution primitive; it projects existing execution, pipeline, PTRR, and ThricifiedGeneration primitives.
- Gate 4 does not expose protected AssetPack source before settlement.
- Gate 4 does not close disclosure-depth unlock, settlement repair, organization authority, or full browser proof.
- Gate 4 does not add versioned API routes or source identifiers.

## Gate 4 completion condition

Gate 4 is complete when Reading pipeline observability is package-owned, stream events are contract-projected in the sandbox harness, Terminal renders the projection through shared execution components, focused package and UAPI tests pass, `check:v29-gate4` passes, CI invokes the checker and tests, docs name the implemented source surfaces, and the gate branch is committed and pushed for review into `version/v29`.

## Gate 5 Parity

| Requirement | Source evidence | Current V29 judgment |
| --- | --- | --- |
| AssetPack disclosure review is package-owned | `asset-pack-disclosure.ts`, package exports, disclosure tests | drafted |
| Source visibility separates pending, paid, owner, licensee, and denied states | `buildAssetPackDisclosureReview`, BTD access tests | drafted |
| Protected source leakage fails closed before preview display | `reviewAssetPackProtectedSourceLeakage`, `assertAssetPackDisclosureSourceSafe`, disclosure tests | drafted |
| Postprocessing persists disclosure review and review root | `postprocess.ts`, postprocess tests | drafted |
| Sandbox harness stores and exports disclosure review evidence | `packages/pipeline-hosts/src/asset-pack-harness.ts`, harness tests | drafted |
| Terminal preview surface renders disclosure policy before raw evidence | `TerminalDepositReadWorkbench.tsx`, Terminal harness client tests | drafted |
| Gate PR title enforcement is automated | `.github/workflows/bitcode-gate-quality.yml`, PR template, AGENTS/README instructions | drafted |
| Gate 5 checker is wired to package scripts and CI | `scripts/check-v29-gate5-assetpack-disclosure-rights.mjs`, `package.json`, gate workflow | drafted |

## Gate 5 accepted boundaries

- Gate 5 does not reveal protected AssetPack source before settlement.
- Gate 5 does not perform settlement reconciliation repair; Gate 6 owns ledger/database drift and repair.

## Gate 6 Parity

Gate 6 closes the settlement reconciliation slice by making drift ordinary data instead of hidden operator guesswork.

Accepted surfaces:

- `packages/btd/src/reconciliation.ts` is the canonical reconciliation primitive for ledger observed facts, database projected facts, private metaphysical canonical facts, settlement conservation checks, projection repair receipts, repair actions, drift-kind counts, report state, and proof roots.
- `packages/api/src/routes/btd-crypto.ts` accepts settlement conservation checks and binds reconciliation proof roots into the Terminal journal entry for reconciliation settlements.
- `packages/pipeline-hosts/src/asset-pack-harness.ts` stores `asset-pack/settlement.ledgerDatabaseReconciliation`, includes it in evidence, and streams reconciliation state/repair-action count after ledger readback.
- `apps/uapi/app/terminal/terminal-journal-reconciliation.ts` projects the selected transaction into observed facts, projected facts, canonical facts, drift classes, blocking reasons, repair actions, proof roots, and repair receipts.
- `apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx` renders the above as a low-detail operator surface with raw payload still available behind expansion.

Accepted failure states:

- Confirmed ledger facts missing from database projection require operator-approved projection repair.
- Reorged or failed fee/anchor finality blocks settlement unlock.
- Database-only orphan projection blocks until quarantined or matched to a ledger observation.
- BTC fee settlement conservation drift blocks unlock and delivery.
- Post-settlement missing pull-request delivery produces a delivery recovery action without exposing protected source.

Gate 6 completion condition:

- `pnpm run check:v29-gate6` passes.
- Focused BTD, API, pipeline-hosts, and UAPI tests prove repair classification, conservation drift, proof roots, and Terminal repair visibility.

## Gate 5 completion condition

Gate 5 is complete when AssetPack disclosure review is package-owned, postprocess and sandbox harness evidence include source-safe disclosure review roots, protected-source leakage tests fail closed, Terminal renders the disclosure review through the Reading preview surface, gate PR title enforcement is active, focused package and UAPI tests pass, `check:v29-gate5` passes, CI invokes the checker and tests, docs name the implemented source surfaces, and the gate branch is committed and pushed for review into `version/v29`.

## Gate 7 Parity

Gate 7 closes the organization authority slice by making action permission a shared BTD decision instead of interface-local convention.

Accepted surfaces:

- `packages/btd/src/authority.ts` is the canonical organization/interface authority primitive for role checks, explicit grants, wallet binding, registry read access, settlement, explicit confirmation, repair approval, source visibility, and authority proof roots.
- `packages/api/src/routes/btd-crypto.ts` and `apps/uapi/app/api/btd/organization-interface-authority/route.ts` expose JSON-safe authority decisions for application routes.
- `packages/executions-mcp/src/mcp-server/src/auth/middleware.ts` can require interface authority after existing permission and BTD read-access checks.
- `packages/chatgptapp/src/tools.ts` requires explicit confirmation, registry read-access evidence, and organization authority evidence before connected-interface writes.
- `packages/pipeline-hosts/src/asset-pack-harness.ts` stores and emits `organizationAuthority` beside settlement unlock and reconciliation evidence.
- `apps/uapi/app/terminal/terminal-organization-authority.ts` and `TerminalTransactionOrganizationAuthorityCard.tsx` project the selected transaction into authority metrics, blockers, decision rows, proof roots, and raw payload.

Accepted failure states:

- Missing role, insufficient role, or missing explicit grant blocks authority.
- Missing wallet binding blocks fee payment, source unlock, and delivery when those actions require Reader wallet proof.
- Missing or denied registry read access blocks protected-source unlock and delivery.
- Pending settlement blocks protected-source visibility even when role evidence exists.
- Missing explicit confirmation blocks payment, delivery, repair, and administration actions that cross sensitive boundaries.
- Interfaces may deny actions even when the organization role could authorize them elsewhere.

Gate 7 completion condition:

- `pnpm run check:v29-gate7` passes.
- Focused BTD, API, MCP, ChatGPT App, pipeline-hosts, and UAPI tests prove organization holdings, active/expired/revoked license usage, paid delivery admission, unpaid denial, interface denial, connected-interface write gating, harness evidence, and Terminal visibility.
- Gate-quality CI invokes the Gate 7 checker and focused tests.
- Gate 7 does not add broad enterprise RBAC administration beyond Terminal transaction authority; later versions may deepen team policy authoring.
- Gate 7 does not reveal protected source before settlement and does not add versioned API routes or source identifiers.

## Gate 8 Parity

Gate 8 closes the demonstration-origin commercial formalization slice by moving gate-critical helpers behind the protocol package boundary.

Accepted surfaces:

- `packages/protocol/src/index.js` exports canonical posture, spec-family validation, canonical-input validation, canon-posture-drift validation, generated artifact builders, and canonical proven-generation helpers.
- `packages/protocol/src/index.d.ts` declares the same package-native API surface for consumers that type-check against the protocol package.
- `packages/protocol/src/canon-posture.js` declares active V28 and draft V29 while V29 gates are in progress.
- Root scripts for spec-family checks, canonical-input checks, canon-posture drift, spec quality, pre-commit posture, and proven generation import through the protocol package source boundary.
- `packages/protocol/test/protocol-package-boundary.test.js` proves package exports, posture, provenance-helper availability, repository-revision deposit behavior, and direct demonstration-source import boundaries.
- `apps/uapi/tests/protocolCommercialBoundary.test.ts` remains the commercial application boundary scan proving UAPI depends on `@bitcode/protocol` and not the standalone demonstration package.
- `.github/workflows/bitcode-gate-quality.yml` runs the Gate 8 checker, protocol package typecheck/test, and the commercial protocol boundary test.

Accepted boundaries:

- Gate 8 does not delete the standalone protocol demonstration.
- Gate 8 does not forbid generated proof inventories or historical documentation from citing `protocol-demonstration/` as evidence.
- Gate 8 forbids direct imports from standalone demonstration source in commercial/runtime source and root scripts.
- Gate 8 does not promote `BITCODE_SPEC.txt` to V29.
- Gate 8 does not add versioned API routes or source identifiers.

Gate 8 completion condition:

- `pnpm run check:v29-gate8` passes.
- Focused protocol package typecheck/test and the UAPI commercial protocol boundary test pass.
- V29 SPEC, DELTA, NOTES, PARITY, protocol package README, package scripts, and gate-quality workflow name the formalized package-native boundary.
- Root scripts use protocol package exports for canonical helpers and do not directly import `protocol-demonstration/src/*`.

## Gate 9 Parity

Gate 9 closes the Terminal UX quality and browser-proof slice by making the transaction cockpit readable, keyboard reachable, responsive, and test-proven.

Accepted surfaces:

- `apps/uapi/app/terminal/terminal-ux-browser-proof.ts` exports the typed contract for Gate 9 landmarks, viewports, states, route checks, and evidence files.
- `TerminalPageClient.tsx` exposes a named `main` cockpit region and skip link to the selected transaction workspace.
- `TerminalTransactionWorkspace.tsx` exposes a named transaction workspace region, selected activity status, and explicit loading, empty, and error states.
- `TerminalTransactionDetailSurface.tsx`, `TerminalTransactionDetailHero.tsx`, and `TerminalTransactionDetailActionBar.tsx` expose a named selected activity detail region, source-safe low-detail detail hero, route-owned section controls, blocked Console posture, and action error alerts.
- `BitcodeTransactionsTable.tsx` and `BitcodeTransactionsDataTable.tsx` expose table state semantics while containing table overflow inside the table scroller.
- `apps/uapi/tests/terminalUxBrowserProof.test.tsx` proves the contract and UI state semantics.
- `apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts` proves the cockpit through a real browser in deterministic mock mode.
- `.github/workflows/bitcode-gate-quality.yml` runs the Gate 9 checker, focused Jest test, Playwright browser install, and focused Terminal browser proof.

Accepted boundaries:

- Gate 9 does not redesign Reading into a different flow.
- Gate 9 does not reveal protected AssetPack source before settlement.
- Gate 9 does not add versioned API routes or gate/work-in-progress runtime identifiers.
- Gate 9 does not perform non-mocked staging promotion readiness; Gate 10 owns that slice.

Gate 9 completion condition:

- `pnpm run check:v29-gate9` passes.
- Focused UAPI Jest coverage and Playwright Terminal browser proof pass.
- V29 SPEC, DELTA, NOTES, PARITY, Terminal README, package scripts, and gate-quality workflow name the browser-proof contract.

## Gate 10 Parity

Gate 10 closes the local/staging and promotion-readiness slice by proving that
the version branch can become canon through automation rather than operator
memory.

Accepted surfaces:

- `scripts/check-v29-gate10-local-staging-promotion-readiness.mjs` validates
  the Gate 10 specification, QA ledger, scripts, workflow wiring, runtime
  posture, and promotion-mode behavior before and after the generated V29/V30
  protocol package posture rewrite.
- `.github/workflows/bitcode-gate-quality.yml` runs all V29 gate checks in
  draft posture and switches to promoted V29 checks after the promotion commit.
- `.github/workflows/bitcode-canon-quality.yml` accepts both V28 active / V29
  draft and V29 active / V30 draft states.
- `.github/workflows/v29-canon-promotion.yml` is the version promotion workflow
  for `version/v29` pull requests into `main`; it validates, promotes,
  generates `BITCODE_SPEC_V29_PROVEN.md`, writes `.proofs/v29/*`, and commits
  the pointer update back to the version branch.
- `scripts/promote-bitcode-canon.mjs` supports `--version V29`, includes every
  V29 gate check, local proof suites, staging-testnet readback verifier,
  Terminal browser proof, runtime/spec preparation, generated proof creation,
  and promoted-family validation.
- `scripts/prepare-bitcode-spec-family-promotion.mjs` rewrites V29
  hand-authored status truth and the promoted V29 implementation
  matrix/checklist judgments for promoted mode.
- `scripts/prepare-bitcode-runtime-canon-promotion.mjs` rewrites standalone
  demonstration posture and commercial `packages/protocol` posture/data for V29
  active / V30 draft.
- `BITCODE_V29_QA.md` names the local and staging-testnet evidence packet
  without storing environment secrets.

Accepted boundaries:

- Gate 10 does not merge `version/v29` to `main`; it prepares the version branch
  for that pull request.
- Gate 10 does not commit `BITCODE_SPEC_V29_PROVEN.md`; the promotion workflow
  owns generated canon.
- Gate 10 does not require value-bearing mainnet behavior.
- Gate 10 does not add versioned runtime routes or source identifiers.

Gate 10 completion condition:

- `pnpm run check:v29-gate10` passes.
- `npm run promote:canon -- --version V29 --commit HEAD --dry-run` produces a
  V29 command plan.
- Gate-quality CI invokes the Gate 10 checker.
- V29 SPEC, DELTA, NOTES, PARITY, QA ledger, README, package scripts, promotion
  scripts, runtime posture preparation, and workflows name the promotion
  readiness boundary.
