# Bitcode Specification V27 Proven Appendix

Status: V27 closure appendix generated on 2026-05-06.

This appendix records the V27 proof closure for Bitcode tokenomics and practical cryptographic commercialization. The canonical specification remains `BITCODE_SPEC_V27.md`; this file binds the closure evidence used to promote `BITCODE_SPEC.txt` from `V26` to `V27`.

## Closure Summary

V27 closes the `$BTD` tokenomics and cryptographic implementation gate set:

- `$BTD` is a capped 21,000,000-cell non-fungible source-share/read-right registry.
- AssetPack ranges are the primary commercial transfer object.
- Minting is admitted only through Read-Fit-Prove-Settle.
- Measureminting decays from cumulative admitted semantic volume toward the fixed supply ceiling and emits zero-cell/refit receipts in the tail.
- BTC is the fee asset; `$BTD` is not a spend token.
- Wallet signing is user-controlled and fails closed without authorization proof.
- BTC fee receipts follow a PSBT-style lifecycle.
- Bitcoin AssetPack anchors prefer Taproot; Ethereum registry/event anchors are secondary and explicit.
- Minimal Exchange buy/sell/bid/ask, cancellation, acceptance, settlement, and rights-transfer receipts are V27.
- Terminal transaction journals and ledger/database reconciliation are proof-bearing and drift-blocking.
- Testnet, signet, mainnet-ready, telemetry, and upgrade receipts are specified and implemented.

## Proof Family Map

The accepted proof family mapping is recorded in `.bitcode/v27-total-closure-proof.json`.

Required V27 proof families are satisfied by the gate proof artifacts or accepted equivalents:

- `v27-spec-family-report`
- `v27-canonical-input-report`
- `v27-btd-supply-proof`
- `v27-btd-range-proof`
- `v27-btd-measuremint-proof`
- `v27-btd-mint-admission-proof`
- `v27-btd-receipt-replay-proof`
- `v27-btd-access-rights-proof`
- `v27-btd-settlement-allocation-proof`
- `v27-btd-ancestry-proof`
- `v27-btd-exchange-schema-proof`
- `v27-wallet-integration-proof`
- `v27-btc-fee-transaction-proof`
- `v27-assetpack-ledger-anchor-proof`
- `v27-assetpack-exchange-proof`
- `v27-terminal-transaction-proof`
- `v27-ledger-journal-diff-proof`
- `v27-ledger-database-reconciliation-proof`
- `v27-testnet-mainnet-readiness-proof`
- `v27-telemetry-upgrade-proof`
- `v27-crypto-library-research-proof`
- `v27-total-closure-proof`

## Validation

Promotion validation is represented by the focused package/API/ORM/protocol-demonstration checks recorded in the gate artifacts and rerun at promotion time:

- `pnpm -C packages/api build`
- `pnpm -C packages/orm build`
- `pnpm -C protocol-demonstration test:v27-crypto`
- `node --test --test-force-exit protocol-demonstration/test/api.test.js`
- focused package/API Jest: 62 tests
- focused ORM Jest: 3 tests
- focused UAPI external-realization route Jest: 2 tests
- `pnpm -C apps/uapi build`
- unversioned-route scan of `apps/uapi/app/api`

Duplicate Jest manual mock warnings, the ts-jest globals deprecation warning, Browserslist staleness, and the optional `@ai-sdk/google` warning in generic-llms are pre-existing outside the V27 crypto closure slice and are not V27 blockers.

## Boundaries

V27 promotion does not approve value-bearing mainnet launch. It makes the repository canonically V27-ready for cryptographic law, receipts, API route boundaries, minimum Exchange transfer, Terminal journal families, reconciliation, telemetry, and upgrade posture.

Later versions own broader Terminal workflows, Exchange market depth, external integration rollout, production wallet/broadcaster credentials, generated Supabase type refresh after migration execution, and final legal template review.

Route discipline is part of the closure: V27 keeps API implementations in place and unversioned. The former version-prefixed UAPI corridors were ported to `/api/external-realization` and `/api/executors/[interfaceId]`.
