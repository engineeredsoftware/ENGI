# BTD Core

Canonical `$BTD` / Bitcode registry, settlement token law, read-right, BTC-fee,
and measureminting utilities for Bitcode.

## V48 settlement token law (BitcodeERC1155)

Commercial **read settle** uses a single ERC1155:

| Token | ID | Kind | Cap / behavior |
| --- | --- | --- | --- |
| **BTD (Bitcode)** | `0` | Fungible | Max **21,000,000** whole tokens (18 decimals). Minted from **needinesses-only** weighted scalar after BTC settle → master, then transferred to buyer. |
| **AssetPack** | `≥ 1` | NFT co-ownership | Add-only co-owners; depositor retains; burn forbidden. |

### Dual maintain: `contracts/` and `src/erc1155/` (not generated)

These are **two hand-maintained sources of the same law**. Neither is built from
the other. **Edit both when settlement token behavior changes.**

| Path | Language | Role | Why it exists |
| --- | --- | --- | --- |
| `packages/btd/contracts/BitcodeERC1155.sol` | Solidity | On-chain deployable contract | Chain truth: supply cap, mint-to-master, settle-to-buyer, add-only co-ownership, burn forbidden |
| `packages/btd/src/erc1155/` | TypeScript | Executable mirror + needinesses mint math | Tests, projected settlement receipts, pipeline stages, JSON-safe artifacts without requiring solc |

**Why dual is optimal for Bitcode today**

1. **Different runtimes** — Settlement product code runs in Node/Next; the chain
   contract runs under EVM. One language cannot serve both without a heavy
   codegen/toolchain commitment the monorepo does not yet carry.
2. **Fail-closed product without deploy** — `/reads` settle, `/packs` projection,
   and unit tests must exercise mint/transfer/co-own law before any network
   deployment. The TS mirror is the product authority for receipts.
3. **Needinesses math is off-chain** — BTD amount is
   `needinesses-weighted scalar × 10^18`. Measurement weighting is not on-chain;
   Solidity only enforces supply and transfers. Keeping mint math in TS next to
   measurement packages avoids duplicating measurement catalogs in Solidity.
4. **No silent codegen drift** — Auto-generating `.sol` from TS (or vice versa)
   without a locked compiler pipeline invites unnoticed divergence. Explicit dual
   maintain + tests on the TS side + review of `.sol` on token-law changes is
   the current control.

**Maintenance rule**

- Token id layout, max supply, mint destination, co-ownership add-only, and burn
  ban must match between `BitcodeERC1155.sol` and `src/erc1155/bitcode-erc1155.ts`.
- Needinesses → amount formula lives only in `src/erc1155/settlement-btd-from-needinesses.ts`
  (and SPEC); Solidity accepts the resulting `amount`.
- Do **not** treat `contracts/` as a build output of `src/erc1155/`. Commit both.

Pipeline consumer: `@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline`.

This package also owns (historical + continuing surfaces):
- the 21,000,000 fixed supply ceiling (cells / whole-token cap narrative)
- fixed-supply measureminting decay and zero-cell tail receipts
- proof-addressable semantic volume measurement
- contiguous AssetPack range allocation and mint receipts
- contributor allocation, access evaluation, ancestry review, and revenue routing
- wallet-signed BTC fee receipts, ledger anchors, Exchange rights transfers,
 Terminal journals, reconciliation, telemetry, and upgrade receipts
- typed AssetPack mint/read/rights-transfer receipts that bind BTD ranges,
 Reader and Depositor identities, source-safe preview roots, paid unlock,
 delivery admission, and ledger projection roots without leaking protected
 source before settlement
- source-to-shares proof cleanup: contribution measurement, deterministic
 largest-remainder share weights, BTD range slices, exact BTC fee allocation,
 settlement conservation, zero-cell/refit tail posture, ancestry evidence, and
 no-overpayment/no-underpayment theorem verdicts
- bridge-readiness research boundaries for Taproot, BitVM, BSC/opBNB,
 Binance Web3 Wallet, and future distribution paths; every bridge posture is
 research-only and cannot become current `$BTD` chain-of-record truth without
 explicit future proof and policy admission
- Protocol telemetry proof hooks through `BtdProtocolTelemetryEnvelope`,
 source-safe `BtdProtocolTelemetryRecord` rows, and
 `BtdProtocolProofHook` bindings for receipts, BTC fee states, ledger
 projections, source-to-shares proofs, and bridge-readiness posture
- Interface integration regression proof through
 `BtdInterfaceIntegrationRegressionProof`, the client-safe
 `@bitcode/btd/interface-integration-contract` subpath, and source-safe
 records proving Terminal, API, MCP, ChatGPT App, Auxillaries hooks, and
 Exchange hooks consume package-owned Protocol/BTD objects without local
 policy copies
- ledger/database/object-storage projection reconciliation, including
 deterministic repair classes, source-safe object artifact roots,
 secret-free Supabase staging-testnet readback receipts, quarantine/retry
 actions, and settlement-unlock blocking posture
- BTC fee operation posture, including quote lifecycle, signer recovery,
 no-server-custody PSBT handoff, Taproot/script posture, broadcast/finality
 observation, replacement/reorg repair, and testnet/mainnet network policy
- Auxillaries Wallet/BTD support projection through
 `BtdWalletBtdSupportProjection`, which derives no-custody wallet capability,
 signer posture, network readiness, source-safe BTD range/read-right counts,
 account treasury posture, settlement blockers, and roots without exposing
 protected source or wallet private material
- Terminal operational health reads that compose deployment lanes, telemetry,
 upgrade posture, provider readiness, settlement-network posture, synthetic
 testnet minting, journal rows, ledger anchors, and reconciliation state
- testnet/mainnet readiness rehearsal records that type local, staging-testnet,
 production-mainnet, and offline-disabled lanes; classify credential readiness
 as secret-presence-only; preserve the `tkpyosihuouusyaxtbau`
 staging-testnet and `rinalyjfecxnmyczrpzo` production-mainnet project
 boundary; and prove production-mainnet remains blocked for value-bearing
 settlement until a future explicit launch gate admits it
- `api-boundaries.ts`, the framework-agnostic BTD API boundary for shared route
 objects, BigInt parsers, validators, settlement builders, registry snapshot
 builders, read-access decision builders, and JSON-safe serialization

`$BTD` is not a fungible fee token. BTC pays fees. `$BTD` represents a
non-fungible AssetPack share/read-right and the measured Bitcode amount in
content. V27 issuance follows measured Read-Fit-Prove-Settle admission through
the measureminting curve; valid tail events may emit zero-cell receipts rather
than failing the measurement.

The current database layer still exposes `user_credits` as a storage carrier
for aggregate holding reads until the persistence schema is re-cut. This
package must not mutate it as a spendable balance bucket.

```ts
import {
 buildGenerationBitcodeAccounting,
 BTD_MAX_MINTABLE_SUPPLY,
 applyBtdMeasureMint,
 buildBtdMintDraft,
 buildBtdReadReceiptBoundarySettlement,
 buildBtdRightsTransferReceipt,
 buildBtdRegistrySnapshot,
 buildSupabaseStagingTestnetProjectionReadback,
 buildSourceToSharesProof,
 buildBridgeReadinessResearchPosture,
 buildBtdProtocolTelemetryEnvelope,
 buildBtdInterfaceIntegrationRegressionProof,
 buildBtdWalletBtdSupportProjection,
 buildV32TestnetMainnetReadinessRehearsal,
 reconcileLedgerDatabaseProjection,
 sourceToSharesProofToSettlementConservationCheck,
 toBtdJsonSafe,
 calculateLlmBtcFeeEstimate,
 buildLicensedReadRevenueRoute,
 getBtdBalance,
 measureProofAddressableSemanticVolume,
 readBtdHoldings,
} from '@bitcode/btd';
```

Accepted imports point into `@bitcode/btd` or the documented
`@bitcode/btd/terminal-operational-health` subpath. API routes, Terminal, MCP,
ChatGPT App, Auxillaries, and Exchange must not copy BTD admission, receipt,
settlement, parser, validator, or serializer logic locally when this package
exports the boundary object.

Auxillaries is an accepted BTD consumer, not a BTD policy owner. Wallet and BTD
support panes can surface range, read-right, treasury, signer, settlement, and
no-custody posture from this package through source-safe summaries, but they
must not rederive `$BTD` mint, read-access, rights-transfer, BTC fee, bridge,
or source-disclosure law locally.
The Auxillaries support projection is account-treasury support, not Exchange
market state, and always keeps protected source invisible before paid unlock.

Organization policy authority is also package-owned. Auxillaries and Terminal
should consume `BtdOrganizationPolicyAuthority` from this package, including
organization/team/member identity, role, explicit grant set, wallet binding,
policy id/hash, multi-sig readiness, policy decision, denial reasons, recovery
route, source visibility, and authority root. Settlement-adjacent and
protected-source actions must fail closed here before any interface renders or
ships source-bearing output.

Terminal should consume the operational-health subpath when it needs the
client-safe read model without importing storage-backed package entry points:

```ts
import { buildTerminalOperationalHealthRead } from '@bitcode/btd/terminal-operational-health';
```

Terminal and other browser-facing interfaces should consume
`@bitcode/btd/interface-integration-contract` when they only need source-safe
surface and object-family contracts. Server-side boundaries can use
`buildBtdInterfaceIntegrationRegressionProof` or
`buildBtdInterfaceIntegrationRegressionSettlement` to prove those records
without reimplementing BTD receipt, fee, ledger, telemetry, access, authority,
or journal policy in route-local code.
