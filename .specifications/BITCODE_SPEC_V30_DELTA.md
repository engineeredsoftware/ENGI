# Bitcode Spec V30 Delta

## Status

- Version: `V30`
- V30 state: canonical promotion complete; this delta records the promoted V29-to-V30 Protocol/BTD hardening and promotion-readiness closure set
- Current canonical/latest target: `V30`
- Canonical proof-source commit: `c5b238b9958430c4611ef396ac8cea248c1aecf4`
- Prior canonical anchor: `BITCODE_SPEC_V29.md`
- Prior generated proof appendix: `BITCODE_SPEC_V29_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v30/spec-family-report.json`, `.proofs/v30/canonical-input-report.json`, `.proofs/v30/canon-posture-drift-report.json`, `.proofs/v30/protocol-telemetry-proof-hooks.json`, V30 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V30_PROVEN.md` as the generated proof appendix for V30 promotion
- Source parity state: V30 source-side Protocol/BTD package APIs, Bitcoin/PSBT, receipts, ledger projection, source-to-shares, bridge-readiness, telemetry/proof hooks, interface regression, workflow, and promotion surfaces are canonicalized in the promoted V30 file family
- State: draft target delta opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V29`
- Scope: V30 canonical delta for Protocol/BTD package API boundaries, Bitcoin/Taproot/PSBT rigor, BTD AssetPack mint/read receipts, testnet ledger projection, source-to-shares proof cleanup, bridge-readiness research boundaries, Protocol telemetry/proof hooks, interface regression, and promotion-ready workflow proof over V29
- Spec companion: `BITCODE_SPEC_V30.md`
- Notes companion: `BITCODE_SPEC_V30_NOTES.md`
- Parity companion: `BITCODE_SPEC_V30_PARITY_MATRIX.md`
- Generated proof appendix: none until V30 promotion

## Why V30 exists

V29 canonically promoted Terminal transaction depth over the commercial Reading system.
It made the operator cockpit more navigable, recoverable, source-safe, repairable, and promotion-proven.

V30 exists because the protocol rails beneath that cockpit now need commercial hardening before Bitcode can responsibly expand into Auxillaries depth, proof depth, interface depth, deployment depth, documentation depth, Exchange, and Conversations.
The focus is not a new product surface.
The focus is making Protocol/BTD packages, Bitcoin/Taproot/PSBT flow, BTD receipts, ledger/database/object-storage projections, source-to-shares proofs, and bridge-readiness boundaries stable enough for enterprise shippability.

## Accepted V30 decisions

- V29 remains active canon during V30 drafting.
- V30 gate branches are opened from `version/v30` and merged back only when their gate acceptance criteria are closed.
- V30 owns Protocol/BTD hardening, not another Terminal redesign.
- V30 preserves the V29 Reading journey: request Read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, buy/settle, and receive paid delivery.
- V30 narrows shared package APIs before they become Exchange, Auxillaries, interface, deployment, or documentation dependencies.
- V30 makes Bitcoin fee, Taproot, PSBT, signer, broadcast, replacement, reorg, blocked-readiness, and finality semantics typed and testable.
- V30 binds BTD-AssetPack mint/read/right-transfer receipts to source-safe preview, paid unlock, delivery, and reconciliation.
- V30 cleans source-to-shares contribution accounting, settlement conservation, zero-cell/refit tail posture, and no-overpayment/no-underpayment proof surfaces.
- V30 records bridge-readiness research without treating any bridge as current `$BTD` chain-of-record truth.
- V30 workflows and scripts must validate V29 active / V30 draft posture.

## Explicitly deferred

- V31 Auxillaries depth remains V31.
- V32 proof-family/provation expansion remains V32.
- V33 interface/MCP/ChatGPT/API depth remains V33 except for Protocol/BTD hooks needed by V30.
- V34 deployment/runtime/storage depth remains V34 except for host-capability facts needed by V30.
- V35 telemetry/documentation depth remains V35 except for Protocol/BTD telemetry hooks needed by V30.
- Exchange product/market depth remains beyond V35.
- Website Conversations product depth remains beyond V35.
- New `$BTD` supply law remains out of scope.
- Value-bearing mainnet launch remains separately approval-gated.
- Bridge integrations remain research posture, not chain-of-record implementation.

## Pre-Implementation Sequence

1. Open `version/v30` from promoted `main`.
2. Open `v30/gate-1-roadmap-and-gating` from `version/v30`.
3. Create the V30 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V29`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V29 is active canon, V30 is draft target, and V31-V37 scopes remain coherent after recent V28/V29 work.
5. Retarget gate-quality and canon-quality workflow posture checks to V29 active / V30 draft.
6. Add `check:v30-gate1` and a V30 Gate 1 checker.
7. Define V30 gates, acceptance criteria, carryforward parity rows, and post-V30 roadmap responsibilities.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v30`.

## Commit-Body Direction

V30 gate commit bodies should describe the closed gate, specification changes, implementation surfaces, tests, proof commands, and accepted boundaries.
The eventual V30 promotion commit body must name all closed V30 gates, generated proof artifacts, Protocol/BTD hardening surfaces, and the `BITCODE_SPEC.txt` pointer change from `V29` to `V30`.
It must explicitly defer V31+ scopes, Exchange, Conversations, bridge chain-of-record implementation, and value-bearing mainnet launch.

## Gate Delta

### Gate 1: V30 Roadmap And Gating

Gate 1 opens V30 correctly:

- V30 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V29`.
- README, roadmap, PR template, and workflows describe V29 active / V30 draft posture.
- `check:v30-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, and promotion boundaries.
- The V30 gate list is explicit before product implementation begins.

### Gate 2: Protocol Package API Boundaries

Gate 2 narrows the commercial Protocol/BTD package API surface.

Closure acceptance:

- shared Protocol/BTD objects used by multiple interfaces have package-owned builders, parsers, validators, tests, and JSON-safe serialization;
- route code delegates policy and receipt derivation to packages rather than duplicating it;
- no commercial runtime code imports `protocol-demonstration/src/*`;
- package READMEs name ownership boundaries and accepted imports.

Gate 2 implementation centers the currently shared BTD route objects in
`packages/btd/src/api-boundaries.ts`. API routes may authenticate, parse request
bodies, resolve registry projections, commit explicit persistence writes, and
serialize responses, but BTD mint drafts, registry snapshots, read-access
decisions, BTC-fee settlements, ledger anchors, Exchange settlements, Terminal
journal settlements, reconciliation settlements, deployment-readiness receipts,
BigInt parsing, and JSON-safe conversion are package-owned.

The package boundary is proven by `packages/btd/__tests__/api-boundaries.test.ts`,
`packages/api/src/routes/__tests__/btd-crypto.test.ts`, and
`scripts/check-v30-gate2-protocol-package-api-boundaries.mjs`.

### Gate 3: Bitcoin Taproot PSBT Fee Rigor

Gate 3 hardens Bitcoin fee and signer semantics.

Closure acceptance:

- BTC fee quote, signer recovery, PSBT handoff, Taproot/script posture, broadcast, replacement, reorg, and finality states are typed;
- server-custody rejection remains explicit;
- testnet/mainnet distinction is policy-enforced and proof-rooted;
- focused BTD/API tests prove fee lifecycle and blocked-readiness behavior.

Gate 3 implementation centers these semantics in
`packages/btd/src/btc-fee-operation.ts` and `packages/btd/src/bitcoin-fees.ts`.
`BtcFeeNetworkPolicy` admits local and staging-testnet fee operation while
blocking value-bearing production-mainnet settlement unless explicit operational
approval is attached. `BtcFeeTaprootPsbtPosture` names the Bitcoin commitment
method, script path, PSBT handoff state, and broadcast observation state so
prepared, signed, broadcast, confirmed, replaced, reorged, and failed receipts
remain distinguishable. Signed receipts require a signed PSBT, quote timestamps
must be usable for PSBT preparation, and server-custody signer sessions remain
fail-closed before handoff.

Gate 3 evidence is covered by
`packages/btd/__tests__/btc-fee-operation.test.ts`,
`packages/api/src/routes/__tests__/btd-crypto.test.ts`, and
`scripts/check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs`.

### Gate 4: BTD AssetPack Mint And Read Receipts

Gate 4 creates typed BTD receipt boundaries.

Closure acceptance:

- `BtdAssetPackMintReceipt`, `BtdReadReceipt`, and `BtdRightsTransferReceipt` are package-owned;
- receipts bind AssetPack ids, BTD ranges, Reader/Depositor identities, source-safe preview roots, paid unlock, delivery admission, and ledger projection roots;
- protected source remains hidden before settlement;
- receipts are stored, streamed, and rendered through existing execution and Terminal surfaces.

Gate 4 implementation centers on `packages/btd/src/receipts.ts` and the
package API boundary in `packages/btd/src/api-boundaries.ts`.
`BtdAssetPackMintReceipt` extends mint evidence with depositor identity,
source-safe preview root, Finding Fits result root, settlement conservation
root, paid unlock root, delivery admission root, and ledger projection root.
`BtdReadReceipt` records the Reader/Depositor boundary for source-safe preview
or paid unlock and rejects protected source visibility before paid unlock.
`BtdRightsTransferReceipt` requires confirmed BTC fee finality, a read license,
paid unlock, delivery admission, range projection, and ledger projection before
protected source can cross to the Reader.

The Sandbox harness now stores typed mint/read receipt payloads in settlement
evidence and emits receipt roots in readback telemetry. Terminal detail
snapshots coerce mint/read/rights-transfer receipts from settlement payloads,
and the Terminal transaction read model counts those receipts in closure and
journal surfaces so operators can inspect them through the existing rich
execution detail UI.

Gate 4 evidence is covered by
`packages/btd/__tests__/api-boundaries.test.ts`,
`apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts`,
`apps/uapi/tests/terminalTransactionReadModel.test.ts`, and
`scripts/check-v30-gate4-btd-assetpack-mint-read-receipts.mjs`.

### Gate 5: Testnet Ledger Projection Hardening

Gate 5 hardens ledger/database/object-storage projection and repair.

Closure acceptance:

- ledger-observed facts, database projections, object-storage artifacts, and private metaphysical facts remain distinct;
- projection repair classes and proof roots are deterministic;
- Supabase staging-testnet readback can prove synchronized or blocked state without secrets in tracked files;
- reconciliation tests cover drift, quarantine, retry, and unlock blocking.

Gate 5 implementation centers on `packages/btd/src/reconciliation.ts`.
`LedgerDatabaseReconciliationReport` now carries distinct ledger-observed
facts, database-projected facts, object-storage artifact facts, private
metaphysical facts, settlement-conservation checks, and optional
`SupabaseStagingTestnetProjectionReadback` evidence. Object-storage facts name
artifact kind, source visibility, durable root, protected-source/encryption
posture, and manifest root. Supabase readback receipts name only safe project
and host identifiers, table counts, synchronized-or-blocked state, credential
presence, and proof roots; secret-looking values are rejected.

The deterministic repair surface now includes
`missing_object_storage_artifact`, `object_storage_root_mismatch`, and
`staging_testnet_readback_blocked` drift classes plus
`retry_object_storage_write`, `retry_staging_testnet_readback`, and
`quarantine_object_storage_artifact` repair actions. Missing durable artifacts
block unlock as retryable repairs, object-storage root mismatches require
quarantine/approval, and staging-testnet readback failures remain blocked until
the table readback proves synchronized.

The Sandbox harness emits object-storage artifact roots and secret-free
staging-testnet readback receipts into settlement reconciliation evidence.
Terminal reconciliation now renders object-storage artifacts as a fourth fact
group beside ledger, database, and metaphysical facts and includes report proof
roots and repair actions in the existing journal repair cockpit.

Gate 5 evidence is covered by
`packages/btd/__tests__/reconciliation.test.ts`,
`packages/api/src/routes/__tests__/btd-crypto.test.ts`,
`packages/pipeline-hosts/src/__tests__/asset-pack-harness.test.ts`,
`apps/uapi/tests/terminalJournalReconciliation.test.ts`,
`apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts`, and
`scripts/check-v30-gate5-testnet-ledger-projection-hardening.mjs`.

### Gate 6: Source-To-Shares Proof Cleanup

Gate 6 cleans contribution measurement and settlement conservation.

Closure acceptance:

- source-to-shares proof surfaces bind measurements, fit deposits, range slices, fee quote, contribution weights, settlement conservation, zero-cell/refit tail posture, and ancestry evidence where available;
- no-overpayment and no-underpayment invariants are testable;
- later Exchange work can reuse the proof without reinterpreting V30 accounting.

Gate 6 implementation centers on `packages/btd/src/source-to-shares.ts`.
`SourceToSharesProof` is package-owned and binds accepted Need roots, Finding
Fits result roots, admitted fit deposits, per-deposit measurement roots,
normalized measurement units, fit/provenance basis points, deterministic
largest-remainder contribution weights, BTD range slices, accepted BTC fee
quote, payment observation, exact source credit allocation, settlement
conservation, zero-cell/refit tail posture, and ancestry review evidence when
available.

The proof separates conservation from settlement admission. It can represent a
balanced, overpayment, underpayment, or drifted settlement without losing the
proof roots needed for repair. `noOverpayment` and `noUnderpayment` are separate
theorem verdicts, while `allocationConserved` proves that source credit
allocation sums to the accepted BTC fee quote. Only a balanced proof is
settlement-admissible. The proof exposes a reconciliation-compatible
`SettlementConservationCheck` so ledger/database repair can consume the same
accounting without route-local reinterpretation.

Gate 6 evidence is covered by `packages/btd/__tests__/source-to-shares.test.ts`,
`packages/api/src/routes/__tests__/btd-crypto.test.ts`,
`apps/uapi/app/api/btd/source-to-shares-proof/route.ts`, and
`scripts/check-v30-gate6-source-to-shares-proof-cleanup.mjs`.

### Gate 7: Bridge Readiness Research Boundaries

Gate 7 records bridge-readiness without false chain-of-record claims.

Closure acceptance:

- Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future distribution paths have research posture records;
- each record names feasibility, risks, current non-admission, rereview triggers, and required proof before admission;
- no bridge path is treated as current `$BTD` chain-of-record truth.

Gate 7 implementation centers `BridgeReadinessResearchPosture` in
`packages/btd/src/bridge-readiness.ts`.
It deliberately models bridge and distribution candidates as research facts,
not as live chain-of-record adapters.
The package builder synthesizes the required Taproot, BitVM, BSC/opBNB,
Binance Web3 Wallet, and future-distribution records, rejects duplicate paths,
rejects secret-looking posture text, and fails closed when a caller attempts
`chainOfRecordAdmitted`.
The BTD API boundary exposes `/btd/bridge-readiness-research` as a source-safe
route for policy/readiness posture only; it returns a Terminal journal
`proof_admission` entry and never writes bridge ownership, settlement, or fee
state.

### Gate 8: Protocol Telemetry And Proof Hooks

Gate 8 adds Protocol/BTD telemetry and proof hooks.

Closure acceptance:

- BTD receipts, BTC fee states, ledger projection, source-to-shares proofs, and bridge-readiness posture emit typed telemetry;
- telemetry avoids protected source and secrets;
- proof hooks are compatible with V32 provation and V35 documentation/observability work.

Gate 8 implementation centers:

- `packages/btd/src/telemetry.ts` owns `BtdProtocolTelemetryEnvelope`,
  `BtdProtocolTelemetryRecord`, `BtdProtocolProofHook`, source-safety checks,
  event/subject matching, and V32/V35 proof compatibility markers.
- `packages/btd/src/api-boundaries.ts` owns
  `buildBtdProtocolTelemetrySettlement`, binding telemetry envelopes into a
  Terminal journal `proof_admission` row without committing source-bearing
  artifacts.
- `packages/api/src/routes/btd-crypto.ts` and
  `/btd/protocol-telemetry` expose the JSON-safe route boundary.
- `packages/btd/__tests__/telemetry.test.ts` and the BTD crypto route tests
  prove typed emission, source/secret rejection, proof-hook replay facts, and
  route JSON safety.
- `.proofs/v30/protocol-telemetry-proof-hooks.json` is reserved as a
  generated source-safe inventory artifact for promotion proof; it is not a
  protected-source carrier.

### Gate 9: Interface Integration And Regression Proof

Gate 9 proves existing interfaces can consume the hardened Protocol/BTD rails.

Closure acceptance:

- Terminal, API, MCP, ChatGPT App, and future Auxillaries/Exchange hooks consume package-owned objects without route-local reinvention;
- low-detail source-safe UX remains intact;
- focused regression tests prove no V29 transaction cockpit behavior regresses.

Gate 9 implementation centers on:

- `packages/btd/src/interface-integration-contract.ts` for client-safe
  surface and object-family contracts;
- `packages/btd/src/interface-integration.ts` for
  `BtdInterfaceIntegrationRegressionProof` and source-safe fail-closed
  record validation;
- `buildBtdInterfaceIntegrationRegressionSettlement` and
  `/btd/interface-integration-regression` for JSON-safe API admission;
- Terminal, MCP, and ChatGPT App adapter records proving package-owned
  consumption without route-local BTD policy copies;
- focused BTD, API, MCP, ChatGPT App, and Terminal tests for source-safe
  low-detail regression closure.

### Gate 10: V30 Promotion Readiness

Gate 10 owns final local/staging proof, generated artifacts, and V30 promotion workflow support.

Closure acceptance:

- `check:v30-gate10` validates promoted-readiness posture;
- V30 promotion workflow validates source branch, local proof commands, staging-testnet readback evidence, generated `.proofs/v30/*` reports, and `BITCODE_SPEC_V30_PROVEN.md`;
- promotion scripts support V30 and rewrite post-promotion active V30 / draft V31 posture;
- `version/v30` can be requested into `main` only after all V30 gates close.

Gate 10 implementation centers:

- `scripts/check-v30-gate10-promotion-readiness.mjs`;
- `.github/workflows/v30-canon-promotion.yml`;
- V30 support in `scripts/promote-bitcode-canon.mjs`;
- V30 status rewriting in `scripts/prepare-bitcode-spec-family-promotion.mjs`;
- V30 generated appendix/artifact support in `packages/protocol/src/canonical/proven-generator.js`;
- generated `.proofs/v30/*` artifacts and source-safe `BITCODE_V30_QA.md`.
