# Bitcode Spec V30 Parity Matrix

## Status

- Version: `V30`
- V30 state: canonical promotion complete; V30 parity truth, Protocol/BTD gate closure, generated proof, and promotion automation are aligned
- Current canonical/latest target: `V30`
- Canonical proof-source commit: `c5b238b9958430c4611ef396ac8cea248c1aecf4`
- Prior canonical anchor: `BITCODE_SPEC_V29.md`
- Prior generated proof appendix: `BITCODE_SPEC_V29_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v30-spec-family-report.json`, `.bitcode/v30-canonical-input-report.json`, `.bitcode/v30-canon-posture-drift-report.json`, `.bitcode/v30-protocol-telemetry-proof-hooks.json`, V30 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V30_PROVEN.md` as the generated proof appendix for V30 promotion
- Source parity state: V30 source-side Protocol/BTD package APIs, Bitcoin/PSBT, receipts, ledger projection, source-to-shares, bridge-readiness, telemetry/proof hooks, interface regression, workflow, and promotion surfaces are canonicalized in the promoted V30 file family
- State: draft target parity matrix opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V29`
- Scope: V30 canonical parity ledger for Protocol/BTD hardening, local/staging readiness, and promotion automation over V29
- Spec companion: `BITCODE_SPEC_V30.md`
- Notes companion: `BITCODE_SPEC_V30_NOTES.md`
- Delta companion: `BITCODE_SPEC_V30_DELTA.md`
- Generated proof appendix: none until V30 promotion
- Last fully realized canonical target preserved in source: `V30`

## Purpose

The V30 parity matrix prevents Protocol/BTD hardening from becoming vague infrastructure work.
Each gate must name package boundaries, implementation surfaces, tests, generated/proof artifacts, documentation, accepted non-goals, and promotion evidence before it closes.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V29.md`
- `BITCODE_SPEC_V29_DELTA.md`
- `BITCODE_SPEC_V29_NOTES.md`
- `BITCODE_SPEC_V29_PARITY_MATRIX.md`
- `BITCODE_SPEC_V29_PROVEN.md`
- `BITCODE_SPEC_V30.md`
- `BITCODE_SPEC_V30_DELTA.md`
- `BITCODE_SPEC_V30_NOTES.md`
- `BITCODE_SPEC_V30_PARITY_MATRIX.md`
- `SPECIFICATIONS_ROADMAP.md`
- `README.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `packages/protocol/src/canon-posture.js`
- `protocol-demonstration/src/canon-posture.js`

No `_legacy/` source is active source truth.

## V30 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V30.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v30/gate-1-roadmap-and-gating` | closed | V30 family validates in draft mode over active V29 and `check:v30-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V29 active, V30 draft, and coherent V31-V37 responsibilities. |
| Protocol package API boundaries | Gate 2 | `packages/btd/src/api-boundaries.ts`, `packages/api/src/routes/btd-crypto.ts`, package READMEs/tests | closed | Shared Protocol/BTD objects have package-owned builders, parsers, validators, JSON-safe serializers, and tests. |
| Bitcoin Taproot PSBT fee rigor | Gate 3 | `packages/btd/src/btc-fee-operation.ts`, `packages/btd/src/bitcoin-fees.ts`, BTD/API tests, gate checker | closed | BTC fee and signer states are typed, testnet/mainnet-safe, no-custody, Taproot/PSBT aware, and proof-rooted. |
| BTD AssetPack mint/read receipts | Gate 4 | `packages/btd/src/receipts.ts`, `packages/btd/src/api-boundaries.ts`, asset-pack harness evidence, Terminal detail snapshot/read model tests, gate checker | closed | Mint, read, and rights-transfer receipts bind BTD range, preview, paid unlock, delivery, and ledger projection. |
| Testnet ledger projection hardening | Gate 5 | `packages/btd/src/reconciliation.ts`, API route tests, asset-pack harness evidence, Terminal journal reconciliation UI/tests, gate checker | closed | Ledger/database/object-storage/private facts are distinct; staging-testnet readback is secret-free; drift, quarantine, retry, and unlock blocking are tested. |
| Source-to-shares proof cleanup | Gate 6 | `packages/btd/src/source-to-shares.ts`, API route boundary, focused BTD/API tests, gate checker | closed | Measurement contribution, fee allocation, zero-cell/refit tail, ancestry evidence, and conservation invariants are testable. |
| Bridge-readiness research boundaries | Gate 7 | `packages/btd/src/bridge-readiness.ts`, BTD/API tests, route boundary, docs, gate checker | closed | Bridge paths are typed research-only records until admitted by explicit future proof and policy. |
| Protocol telemetry/proof hooks | Gate 8 | `packages/btd/src/telemetry.ts`, API route boundary, focused BTD/API tests, gate checker | closed | Receipts, fee states, projections, source-to-shares proofs, and bridge-readiness posture emit source-safe telemetry and proof hooks. |
| Interface integration regression | Gate 9 | `packages/btd/src/interface-integration.ts`, `packages/api/src/routes/btd-crypto.ts`, Terminal/MCP/ChatGPT adapters and tests, gate checker | closed | Existing interfaces consume package-owned objects without regressing V29 behavior. |
| Promotion readiness | Gate 10 | V30 promotion workflow, generated `.bitcode/v30-*`, `BITCODE_SPEC_V30_PROVEN.md` | closed | `version/v30` can promote to `main` only after all V30 checks pass and promotion automation can commit generated canon. |

## V30 implementation checklist

| Area | Required V30 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V29` during V30 gate work | closed |
| Gate branch pattern | V30 work happens on `version/v30` or `v30/gate-N-*` branches | closed |
| Spec-family shape | V30 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v30-gate1` fails closed on stale posture, missing roadmap truth, or missing gates | closed |
| Gate-quality workflow | Gate workflow validates V29 active / V30 draft posture and V30 Gate 1 | closed |
| Canon-quality workflow | Canon workflow validates V29 active / V30 draft posture and V30 draft family | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Active canon remains V29 during V30 draft opening | `BITCODE_SPEC.txt` contains `V29` | drafted |
| Runtime draft target is V30 | `packages/protocol/src/canon-posture.js` and `protocol-demonstration/src/canon-posture.js` declare V29 active and V30 draft | drafted |
| V30 SPEC family exists as draft | `BITCODE_SPEC_V30.md`, DELTA, NOTES, and PARITY | drafted |
| Roadmap is current | `SPECIFICATIONS_ROADMAP.md` states V29 active canon, V30 active draft target, and V31-V37 scopes | drafted |
| Gate-quality workflow is V30-aware | `.github/workflows/bitcode-gate-quality.yml` | drafted |
| Canon-quality workflow is V30-aware | `.github/workflows/bitcode-canon-quality.yml` | drafted |
| README reflects V29/V30 posture | `README.md` | drafted |
| V30 Gate 1 checker exists | `scripts/check-v30-gate1-roadmap-and-gating.mjs` and package script | drafted |

## accepted boundaries

- Gate 1 does not implement Protocol/BTD package hardening.
- Gate 1 does not create `BITCODE_SPEC_V30_PROVEN.md`.
- Gate 1 does not promote `BITCODE_SPEC.txt` to V30.
- Gate 1 may retarget workflows to active V29 / draft V30 so later gates are greenable.
- Gate 1 may update roadmap scope for V31-V37 to align with V28/V29 promotion learning without opening those versions.

## Gate 2 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Package-owned BTD builders and parsers exist | `packages/btd/src/api-boundaries.ts` exports mint, registry, read-access, fee, ledger-anchor, Exchange, journal, reconciliation, deployment-readiness builders plus `parseBtdRequiredBigInt`, `parseBtdOptionalBigInt`, and `toBtdJsonSafe` | drafted |
| API route delegates BTD policy and receipt derivation | `packages/api/src/routes/btd-crypto.ts` imports package builders from `@bitcode/btd` and keeps route code scoped to auth, request parsing, registry projection reads/writes, and responses | drafted |
| Package tests cover the boundary | `packages/btd/__tests__/api-boundaries.test.ts` proves mint drafts, registry snapshots, read-access decisions, parsers, and JSON-safe serialization | drafted |
| Route tests consume package-owned builders | `packages/api/src/routes/__tests__/btd-crypto.test.ts` imports BTD builders from `@bitcode/btd` and route handlers from the API route module | drafted |
| Commercial runtime avoids standalone demonstration imports | `scripts/check-v30-gate2-protocol-package-api-boundaries.mjs` scans runtime source import statements for `protocol-demonstration/src` and `@bitcode/protocol-demonstration` | drafted |
| Package READMEs state accepted imports | `packages/btd/README.md`, `packages/api/README.md`, and `packages/protocol/README.md` name package ownership and accepted import direction | drafted |
| Gate checker protects the seam | `pnpm run check:v30-gate2` and gate-quality workflow call `scripts/check-v30-gate2-protocol-package-api-boundaries.mjs` | drafted |

## Gate 2 accepted boundaries

- Gate 2 does not change the active canon pointer.
- Gate 2 does not introduce bridge chain-of-record behavior.
- Gate 2 does not admit value-bearing mainnet settlement.
- Gate 2 does not remove existing API route persistence adapters; it narrows their policy and receipt derivation responsibilities to package calls.

## Gate 3 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| BTC fee quotes validate PSBT-usable timestamp windows | `packages/btd/src/btc-fee-operation.ts`, `packages/btd/__tests__/btc-fee-operation.test.ts` | drafted |
| Wallet signer recovery rejects server custody explicitly | `buildWalletSignerSessionRecovery`, `packages/btd/__tests__/btc-fee-operation.test.ts` | drafted |
| PSBT handoff is typed across prepared, signed, broadcast, finality, replacement/reorg repair, and failure | `BtcFeePsbtHandoffState`, `deriveBtcFeePsbtHandoffState`, `BtcFeeOperationPosture` | drafted |
| Taproot/script posture is proof-rooted and attached to fee operation posture | `BtcFeeTaprootPsbtPosture`, `buildBtcFeeTaprootPsbtPosture`, API route tests | drafted |
| Testnet/mainnet distinction blocks value-bearing production-mainnet settlement unless explicitly approved | `BtcFeeNetworkPolicy`, `buildBtcFeeNetworkPolicy`, `network-policy` blocked-readiness tests | drafted |
| Signed receipts require signed PSBT evidence before broadcast | `packages/btd/src/bitcoin-fees.ts`, `packages/btd/__tests__/btc-fee-operation.test.ts` | drafted |
| API settlement route serializes the added operation posture safely | `packages/api/src/routes/__tests__/btd-crypto.test.ts` | drafted |
| Gate checker protects the BTC fee rigor surface | `scripts/check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs`, `pnpm run check:v30-gate3`, gate-quality workflow | drafted |

## Gate 3 accepted boundaries

- Gate 3 does not admit value-bearing production-mainnet settlement by default.
- Gate 3 does not implement a bridge chain-of-record path.
- Gate 3 does not custody Reader private keys or sign PSBTs server-side.
- Gate 3 does not replace later Gate 4 BTD mint, read, and rights-transfer receipts.

## Gate 4 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| BTD package owns typed AssetPack mint, read, and rights-transfer receipts | `packages/btd/src/receipts.ts` exports `BtdAssetPackMintReceipt`, `BtdReadReceipt`, `BtdRightsTransferReceipt`, and their builders/assertions | drafted |
| Receipts bind AssetPack ids, BTD ranges, Reader/Depositor identities, source-safe preview roots, paid unlock, delivery admission, and ledger projection roots | Receipt interfaces/builders require those roots and identities, with BTD range conservation checks | drafted |
| Protected source remains hidden before paid unlock | `assertReadDisclosureBoundary` rejects protected source visibility before `paid_unlocked`; `BtdAssetPackMintReceipt` is always `source_safe_preview` | drafted |
| Rights transfer requires confirmed BTC finality before protected source unlock | `buildBtdRightsTransferReceipt` and API-boundary tests require `btcFeeFinalityState: 'confirmed'` | drafted |
| API boundary exposes package-owned receipt construction | `buildBtdMintDraft`, `buildBtdReadReceiptBoundarySettlement`, and `buildBtdAssetPackExchangeSettlement` compose receipt builders | drafted |
| Sandbox harness stores and streams receipt evidence | `packages/pipeline-hosts/src/asset-pack-harness.ts` stores mint/read receipt payloads in ledger settlement evidence and emits receipt roots in readback telemetry | drafted |
| Terminal renders receipt readback through existing detail surfaces | `terminal-transaction-detail-snapshot.ts` coerces receipt payloads and `terminal-transaction-read-model.ts` counts them in closure/journal sections | drafted |
| Tests cover package and Terminal receipt posture | `packages/btd/__tests__/api-boundaries.test.ts`, `apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts`, and `apps/uapi/tests/terminalTransactionReadModel.test.ts` | drafted |
| Gate checker protects the receipt surface | `scripts/check-v30-gate4-btd-assetpack-mint-read-receipts.mjs`, `pnpm run check:v30-gate4`, gate-quality workflow | drafted |

## Gate 5 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Ledger projection report separates four fact classes | `packages/btd/src/reconciliation.ts`, `apps/uapi/app/terminal/terminal-journal-reconciliation.ts`, `apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx` | drafted |
| Object-storage and staging-testnet repair classes are deterministic | `packages/btd/__tests__/reconciliation.test.ts`, `packages/api/src/routes/__tests__/btd-crypto.test.ts` | drafted |
| Harness and Terminal consume the same report evidence | `packages/pipeline-hosts/src/asset-pack-harness.ts`, `packages/pipeline-hosts/src/__tests__/asset-pack-harness.test.ts`, `apps/uapi/tests/terminalJournalReconciliation.test.ts`, `apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts` | drafted |
| Gate checker protects projection hardening | `scripts/check-v30-gate5-testnet-ledger-projection-hardening.mjs`, `pnpm run check:v30-gate5`, gate-quality workflow | drafted |

## Gate 4 accepted boundaries

- Gate 4 does not require production-mainnet BTC settlement.
- Gate 4 does not broadcast Bitcoin transactions or custody wallet keys.
- Gate 4 does not make protected source visible before paid unlock and delivery admission.
- Gate 4 does not harden all ledger/database/object-storage projection repair; Gate 5 owns that.
- Gate 4 does not finish source-to-shares contribution cleanup; Gate 6 owns that.

## Gate 5 accepted boundaries

- Gate 5 does not expand the physical reconciliation repair registry schema.
- Gate 5 does not store or print Supabase service-role JWTs, `sb_secret__` keys, OpenAI keys, database passwords, or Vercel tokens.
- Gate 5 does not make protected AssetPack source visible before paid unlock and delivery admission.
- Gate 5 does not implement source-to-shares contribution accounting; Gate 6 owns that.
- Gate 5 does not promote V30 or change the active canon pointer.

## Gate 6 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Source-to-shares proof is package-owned | `packages/btd/src/source-to-shares.ts`, `packages/btd/src/api-boundaries.ts` | drafted |
| Contribution weights, range slices, BTC fee allocation, and conservation are deterministic | `packages/btd/__tests__/source-to-shares.test.ts` | drafted |
| API and Next route consume the package proof without route-local accounting | `packages/api/src/routes/btd-crypto.ts`, `apps/uapi/app/api/btd/source-to-shares-proof/route.ts`, `packages/api/src/routes/__tests__/btd-crypto.test.ts` | drafted |
| Gate checker protects source-to-shares cleanup | `scripts/check-v30-gate6-source-to-shares-proof-cleanup.mjs`, `pnpm run check:v30-gate6`, gate-quality workflow | drafted |

## Gate 6 accepted boundaries

- Gate 6 does not create a new physical source-to-shares registry table; the API route returns proof payloads and Terminal journal entries until schema admission.
- Gate 6 does not expose protected source before paid unlock and delivery admission.
- Gate 6 does not alter `$BTD` supply law or measureminting curve.
- Gate 6 does not admit bridge chain-of-record semantics; Gate 7 owns bridge-readiness boundaries.
- Gate 6 does not promote V30 or change the active canon pointer.

## Gate 7 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Bridge-readiness posture is package-owned | `packages/btd/src/bridge-readiness.ts`, `packages/btd/src/index.ts` | drafted |
| Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future distribution paths are covered | `BRIDGE_READINESS_RESEARCH_PATHS`, `packages/btd/__tests__/bridge-readiness.test.ts` | drafted |
| Every bridge path remains research-only and not current BTD chain-of-record truth | `assertNoBridgeChainOfRecordAdmission`, `bridgeChainOfRecordTruth: no_bridge_chain_of_record` | drafted |
| API and Terminal boundary expose source-safe research posture only | `buildBtdBridgeReadinessResearchSettlement`, `buildPostBtdBridgeReadinessResearchRoute`, `apps/uapi/app/api/btd/bridge-readiness-research/route.ts` | drafted |
| Gate checker protects bridge research boundaries | `scripts/check-v30-gate7-bridge-readiness-research-boundaries.mjs`, `pnpm run check:v30-gate7`, gate-quality workflow | drafted |

## Gate 7 accepted boundaries

- Gate 7 does not implement a bridge chain-of-record path.
- Gate 7 does not mint, wrap, transfer, settle, unlock, or deliver `$BTD` through Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, or any future distribution path.
- Gate 7 does not store secrets or protected source in bridge-readiness records.
- Gate 7 may expose source-safe research posture to Terminal/API callers for operator review.
- Gate 7 does not promote V30 or change the active canon pointer.

## Gate 8 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Protocol telemetry is package-owned | `packages/btd/src/telemetry.ts`, `packages/btd/src/index.ts` | drafted |
| Receipt, BTC fee, ledger projection, source-to-shares, and bridge-readiness subjects are typed | `BTD_PROTOCOL_TELEMETRY_SUBJECT_KINDS`, `packages/btd/__tests__/telemetry.test.ts` | drafted |
| Telemetry rows and proof hooks reject protected source and secrets | `sourceSafety`, metadata source-safety tests | drafted |
| Proof hooks carry theorem, replay, witness, generated artifact, evidence, and telemetry roots | `BtdProtocolProofHook`, `buildBtdProtocolProofHook`, focused tests | drafted |
| API and Terminal boundary expose JSON-safe proof-admission telemetry | `buildBtdProtocolTelemetrySettlement`, `buildPostBtdProtocolTelemetryRoute`, `apps/uapi/app/api/btd/protocol-telemetry/route.ts` | drafted |
| Gate checker protects telemetry/proof-hook boundaries | `scripts/check-v30-gate8-protocol-telemetry-proof-hooks.mjs`, `pnpm run check:v30-gate8`, gate-quality workflow | drafted |

## Gate 8 accepted boundaries

- Gate 8 does not expose protected source, prompt bodies, private source text, private keys, service-role keys, OpenAI keys, JWT-looking secrets, or database passwords in telemetry.
- Gate 8 does not replace deployment-readiness crypto telemetry persistence; it adds Protocol/BTD source-safe proof hooks that later V32 and V35 work can consume.
- Gate 8 does not generate promotion artifacts yet; it reserves `.bitcode/v30-protocol-telemetry-proof-hooks.json` as a source-safe generated inventory.
- Gate 8 may expose telemetry/proof hooks to Terminal/API callers for operator review.
- Gate 8 does not promote V30 or change the active canon pointer.

## Gate 9 Parity

| Requirement | Source evidence | Current V30 judgment |
| --- | --- | --- |
| Interface integration proof is package-owned | `packages/btd/src/interface-integration.ts`, `packages/btd/src/interface-integration-contract.ts`, `packages/btd/src/index.ts` | drafted |
| Terminal can consume client-safe package contracts | `apps/uapi/app/terminal/terminal-interface-integration-regression.ts`, `apps/uapi/app/terminal/terminal-protocol-projection.ts` | drafted |
| API exposes JSON-safe proof admission | `buildBtdInterfaceIntegrationRegressionSettlement`, `buildPostBtdInterfaceIntegrationRegressionRoute`, `apps/uapi/app/api/btd/interface-integration-regression/route.ts` | drafted |
| MCP and ChatGPT App declare package-owned object records | `packages/executions-mcp/src/mcp-server/src/interface-integration.ts`, `packages/chatgptapp/src/interface-integration.ts` | drafted |
| Source-safe low-detail and transaction cockpit regression are tested | BTD interface-integration tests, BTD crypto route tests, Terminal projection tests, MCP auth test, ChatGPT tools test | drafted |
| Gate checker protects interface integration boundaries | `scripts/check-v30-gate9-interface-integration-regression-proof.mjs`, `pnpm run check:v30-gate9`, gate-quality workflow | drafted |

## Gate 10 Parity

| Gate 10 surface | Source evidence | Judgment | Closure signal |
| --- | --- | --- | --- |
| V30 promotion checker | `scripts/check-v30-gate10-promotion-readiness.mjs`, `package.json`, gate-quality workflow | drafted | `pnpm run check:v30-gate10` validates V29/V30 draft state and V30/V31 promoted state. |
| V30 promotion workflow | `.github/workflows/v30-canon-promotion.yml` | drafted | `version/v30` pull requests into `main` run V30 proof, generate canon artifacts, and commit promotion output. |
| Promotion command support | `scripts/promote-bitcode-canon.mjs` | drafted | `--version V30` plans all V30 gate checks, package proof, UAPI/browser proof, generated appendix, and post-promotion validations. |
| Hand-authored status rewriting | `scripts/prepare-bitcode-spec-family-promotion.mjs` | drafted | V30 SPEC, DELTA, NOTES, and PARITY status lines are rewritten to promoted truth with proof-source commit. |
| Runtime posture rewriting | `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, `packages/protocol/src/canon-posture.js`, `packages/protocol/data/state.json` | drafted | Promotion rewrites runtime posture from V29/V30 to V30/V31. |
| Generated artifact support | `packages/protocol/src/canonical/proven-generator.js`, `packages/protocol/src/canonical/v21-specifying.js`, `.bitcode/v30-*` | drafted | Spec-family, canonical-input, canon-posture, and Protocol telemetry proof-hook reports are generated and source-safe. |
| Source-safe QA ledger | `BITCODE_V30_QA.md` | drafted | Local and staging-testnet readiness evidence is recorded without secrets or protected source. |

## Gate 10 completion condition

Gate 10 is complete when `check:v30-gate10` passes, V30 promotion dry-run prints a full command plan, V30 generated artifacts are present and valid, local proof commands pass, documentation and specification files name the generated proof surface, the gate branch is committed and pushed, and the pull request into `version/v30` is green.

## Gate 9 accepted boundaries

- Gate 9 does not redesign Reading, settlement, source disclosure, organization authority, MCP, ChatGPT App, Auxillaries, or Exchange.
- Gate 9 does not expose protected AssetPack source, prompts, raw source, private keys, service keys, model keys, JWT-looking secrets, or database passwords.
- Gate 9 admits only source-safe interface integration records and a proof-admission route; it does not commit ledger state or deliver AssetPacks.
- Gate 9 proves current interfaces consume package-owned BTD object families without route-local policy copies.
- Gate 9 does not promote V30 or change the active canon pointer.

## completion condition

Gate 1 is complete when the V30 draft family validates, `check:v30-gate1` passes, workflow posture is V30-aware, README and roadmap reflect V30 initiation, V31-V37 scopes are current enough to guide future gates, diff hygiene passes, and the gate branch is committed and pushed for review into `version/v30`.
