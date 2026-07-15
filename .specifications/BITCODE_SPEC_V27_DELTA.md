# Bitcode Spec V27 Delta

## Status

- Version: `V27`
- State: promoted canonical delta
- Active canonical pointer: `BITCODE_SPEC.txt` -> `V27`
- Scope: tokenomics and practical crypto-application delta from V26 commercial Bitcode baseline to V27 formal `$BTD` tokenomics and cryptotechnological commercialization
- Spec companion: `BITCODE_SPEC_V27.md`
- Notes companion: `BITCODE_SPEC_V27_NOTES.md`
- Parity companion: `BITCODE_SPEC_V27_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`

This DELTA records what V27 changes relative to V26.
It is the promoted V27 planning, implementation, and closure ledger after generated proof closure.

## Why V27 Exists

V26 commercialized Bitcode as a minimum viable commercial system and deliberately deferred deep tokenomics plus the practical crypto-application surfaces needed to operate `$BTD` as a real ledger-aware commercial asset.

V26 established:

- BTC is the fee asset;
- `$BTD` is non-fungible AssetPack share/read-right posture plus measured Bitcode amount;
- generic `$BTD` balance mutation is closed;
- Terminal Read minting is future V27 work;
- Exchange existing-`$BTD` purchase was staged for V28 before V27's practical crypto scope was expanded;
- `packages/btd` contains the 21,000,000 mintable ceiling as a staged invariant.

V27 exists to make that deferred `$BTD` model exact and to close the minimum wallet, BTC fee, ledgerized AssetPack, minimal Exchange, Terminal transaction, reconciliation, testnet, mainnet-readiness, telemetry, and upgrade path.

The WDRR sharpens V27's draft direction:

- normalized Bitcode volume is proof-addressable semantic volume, not byte count or tokenizer count;
- primary issuance law is fixed-supply measureminting decay, with refit-only demoted to tail behavior;
- zero-cell receipts are valid V27 receipts when decayed entitlement falls below one whole cell;
- BTC fee transactions use PSBT-style user signing and do not place user private keys under Bitcode server custody;
- regtest or equivalent local chain is the deterministic local proof lane;
- signet is the canonical public Bitcoin proof lane;
- public Bitcoin testnet is supplementary rather than canonical proof infrastructure;
- Ethereum anchoring is secondary or optional in V27 and must not redefine `$BTD` issuance law;
- ancestry is optional but canonical, evidence-bound, and non-supply;
- local Exchange settlement and licensed reads own recurring economics, not third-party royalty signaling.

## Delta Contract

V27 changes Bitcode by turning `$BTD` from V26's proved commercial posture into complete tokenomics law and a practical cryptotechnological implementation baseline.

The delta is not a marketing token launch.
The delta is a protocol, package, receipt, database, proof, UI, and parity formalization.

V27 must make all of these implementation-derivable:

- finite global mintable supply;
- non-fungible cell identity;
- AssetPack contiguous range ownership;
- Read-Fit-Prove-Settle mint admission;
- proof-addressable semantic volume quantization;
- deterministic allocation;
- owner-read vs licensed-read;
- revenue routing;
- optional proof-backed ancestry;
- anti-game and dispute posture;
- fixed-supply measureminting decay;
- zero-cell/refit tail behavior.
- wallet authorization and signing posture;
- actual BTC fee transaction receipts;
- PSBT-style signing handoff without server custody of user private keys;
- ledgerized AssetPack anchors;
- minimal buy, sell, bid, ask, cancellation, settlement, and rights-transfer flow;
- Terminal transaction journals;
- ledgerized journal diffing;
- ledger/database reconciliation;
- testnet and mainnet-ready deployment lanes;
- regtest and signet as the required Bitcoin proof lanes;
- crypto telemetry, alerting, and upgrade receipts.

## From V26 To V27

| V26 source truth | V27 delta |
| --- | --- |
| `$BTD` is non-fungible AssetPack share/read-right posture | `$BTD` becomes exact cell/range registry law |
| `BTD_MAX_MINTABLE_SUPPLY = 21_000_000` exists in package | cap becomes package, receipt, DB, proof, and UI invariant |
| generic balance mutation fails closed | fungible mutation rejection becomes total V27 law |
| `user_credits` stores aggregate holdings as compatibility carrier | new Exchange BTD registry schema is specified and implemented |
| Terminal minting is future V27 intent | Read-Fit-Prove-Settle mint admission becomes canonical |
| Exchange purchase was V28 intent | V27 now owns minimal existing-`$BTD` acquisition, bid/ask, and rights-transfer closure; V28+ owns broader market depth |
| AssetPack evidence and Shippables are distinct | minted AssetPack ranges bind to stored AssetPack evidence and access policy |
| source-to-shares proof exists | proof artifacts gain minted range and supply/replay roots |
| licensed private reads exist in demonstration receipts | licensed-read policy and revenue routing become V27 tokenomics |
| ancestry is not a V26 requirement | ancestry becomes optional canonical non-supply module for knowledge-economy routing |
| wallet posture is UI/readiness-level | wallet integration becomes signer/session/network/receipt infrastructure |
| BTC fee asset is specified | BTC fees become actual transaction receipts bound to Terminal and Exchange journals |
| AssetPacks are proof/store objects | AssetPacks gain ledger anchors for range, source root, proof root, and policy hash |
| database carries commercial state | database becomes ledger-derived plus metaphysical canonical projection with reconciliation |
| testnet/mainnet are future operational paths | V27 specifies testnet implementation and mainnet-ready controls without automatic value-bearing launch |

## Gate Milestones

### Gate 1: Draft Opening And Source Audit

Status:
Closed as a draft-target source-audit gate.
Closure proof: `.bitcode/v27-gate-1-source-audit-proof.json`.
V26 remained the active canonical pointer during Gate 1.
No generated V27 proof appendix is claimed.

Purpose:
Open the V27 spec family and build an honest source parity baseline without promoting V27.

Closure criteria:

- V27 SPEC, DELTA, NOTES, and PARITY files exist.
- V26 remained the active canonical pointer during draft opening.
- audited surfaces are listed in the parity matrix.
- parity rows classify source truth as implemented, partial, gap, or deferred.
- no generated proof claim is made before proof artifacts exist.

### Gate 2: Ontology And Cap Closure

Status:
Closed as a draft-target ontology and hard-cap gate.
Closure proof: `.bitcode/v27-gate-2-ontology-cap-proof.json`.
Later gates still own registry persistence, range proof, access policy UI, generated proof-family closure, and promotion.

Purpose:
Make `$BTD` identity, non-fungibility, and hard cap exact.

Closure criteria:

- SPEC defines cell, range, and supply state.
- `packages/btd` exports the supply constant through a stable public package boundary.
- tests prove the 21,000,000 ceiling and overflow rejection.
- every API route that could mutate generic `$BTD` balance rejects the mutation.
- UI copy keeps BTC fee and `$BTD` share/read-right separate.

### Gate 3: Supply And Range Primitive Closure

Status:
Closed as a draft-target package primitive gate.
Closure proof: `.bitcode/v27-gate-3-supply-range-proof.json`.
Later gates still own DB persistence, generated no-overlap proof families, and write-committing Exchange integration.

Purpose:
Implement the canonical range allocator.

Closure criteria:

- supply state machine exists.
- range allocation exists.
- one AssetPack receives one primary contiguous range.
- no overlap is possible through package tests.
- invalid input fails closed.
- replay can derive `nextTokenId`.

### Gate 4: Mint Admission Closure

Status:
Closed as a draft-target package/API admission gate.
Closure proof: `.bitcode/v27-gate-4-mint-admission-proof.json`.
Source-to-shares range binding proof: `.bitcode/v27-source-to-shares-mint-admission-proof.json`.
Later gates still own persisted Exchange mint writes, generated proof-family closure, and ledger finality.

Purpose:
Make Read-Fit-Prove-Settle the only mint path.

Closure criteria:

- mint request requires accepted Read, accepted Fit, proof root, source root, dedupe root, settlement root, access policy, and Exchange sequence.
- negative tests prove no mint before settlement.
- source-to-shares proof artifacts include minted range roots.
- Terminal intent can point to the path without bypassing it.

### Gate 5: Receipt And Replay Closure

Status:
Closed as a draft-target package and demonstration replay gate.
Closure proof: `.bitcode/v27-gate-5-receipt-replay-proof.json`.
Receipt replay proof slice: `.bitcode/v27-receipt-replay-proof.json`.
Later gates still own persisted Exchange receipt writes, database projection replay, ledger finality, and generated total proof-family closure.

Purpose:
Make mint facts reconstructable without trusting runtime memory.

Closure criteria:

- `BtdMintReceipt` schema exists.
- replay reconstructs prior supply, range, allocation, and next supply.
- mutation tests reject altered cap, altered range, missing root, missing policy, and non-conserved allocation.
- proof generator includes V27 receipt replay.

### Gate 6: Exchange Persistence Closure

Status:
Closed as a draft-target migration and ORM boundary gate.
Closure proof: `.bitcode/v27-gate-6-exchange-persistence-proof.json`.
Later gates still own live migration execution, generated DB type refresh, wallet/ledger finality, and value-bearing rollout controls.

Purpose:
Replace aggregate compatibility storage with Exchange registry state.

Closure criteria:

- migration creates or plans supply, semantic-volume, measuremint, range, cell, mint receipt, ownership, read-license, allocation, ancestry, licensed-read revenue, fee, anchor, order, transfer, journal, reconciliation, upgrade, and telemetry tables.
- SQL constraints cover cap, uniqueness, no overlap, access policy, and service-role mutation.
- ORM exposes Bitcode-native model names.
- `user_credits` is no longer canonical tokenomics truth.

### Gate 7: Access And Policy Closure

Closed as a draft-target access and policy gate.
Closure proof: `.bitcode/v27-gate-7-access-policy-proof.json`.
Later gates still own value-bearing access operations, full legal template review, and generated proof-family promotion.

Purpose:
Make owner-read and licensed-read exact.

Closure criteria:

- access policy evaluator exists.
- owner-read, licensed-read, expired license, unauthorized read, and policy mismatch are tested.
- UI discloses policy id/hash and AssetPack range posture.
- legal overclaim text is absent from public surfaces.

### Gate 8: Allocation And Revenue Closure

Closed as a draft-target allocation and revenue gate.
Closure proof: `.bitcode/v27-gate-8-allocation-revenue-proof.json`.
Later gates still own live wallet settlement, broadcaster finality, full source-to-shares write integration, and generated proof-family promotion.

Purpose:
Make deterministic allocation and licensed-read economics exact.

Closure criteria:

- allocation conserves token count.
- settlement rows record direct holder, ancestor pool, treasury, holdback, and failed/pending routes.
- revenue routing receipt exists.
- tests prove deterministic largest-remainder or accepted equivalent allocation.

### Gate 9: Ancestry Closure

Purpose:
Add late-bound knowledge ancestry without creating early-token rent seeking.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-9-ancestry-antigame-proof.json`.

Closure criteria:

- ancestry edge schema exists.
- `createdAfterChildFit` is enforced.
- ancestry never affects mint count.
- low-confidence edges are unpaid.
- loop/collusion/duplicate-source mitigations are tested.
- ancestry is optional for base `$BTD` validity.

Closure evidence:

- `packages/btd/src/ancestry.ts` records `supplyEffect: 'none'` and `mintCountDelta: 0` on review receipts and every edge.
- `/api/btd/ancestry-review` is the unversioned commercial route boundary for ancestry review and optional registry commit.
- `btd_ancestor_edges` persists review rows with review id, risk flags, source fingerprint root, claimant/reviewer ids, non-supply constraints, route-weight/status constraints, and reviewer-conflict constraints.
- package, API, ORM, and demonstration tests cover payable, weak unpaid, citation unpaid, disclosed conflict unpaid, reciprocal loop, dependency cycle, duplicate source, and claimant/reviewer conflict outcomes.

### Gate 10: Wallet And BTC Fee Settlement Closure

Purpose:
Make user-controlled wallet authorization and BTC fee payment real enough for V27 commercial operation.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-10-wallet-btc-fee-proof.json`.

Closure criteria:

- wallet/session/network model exists.
- transaction construction and signing handoff do not require server custody of user private keys.
- PSBT-style unsigned/signed/broadcast/confirmed flow or accepted wallet-native equivalent is implemented.
- BTC fee transaction receipt exists and binds txid, network, sats paid, Exchange sequence, and Terminal journal root.
- regtest or equivalent local-chain tests cover broadcast, confirmation, replacement/failure, and replay.
- signet proof covers public-network transaction observation.
- `$BTD` remains rejected as a fee asset.

Closure evidence:

- `packages/btd/src/wallet.ts` requires address authorization proof before a session can sign; sessions without proof remain `prepared` and fail closed.
- `packages/btd/src/bitcoin-fees.ts` emits BTC-only, no-server-custody receipts with wallet authorization proof, PSBT, txid, network, sats paid, Exchange sequence, and Terminal journal root.
- `packages/btd/src/bitcoin-provider.ts` owns the network-checked provider boundary used by the signet harness for prepare, broadcast, and observe.
- `/api/btd/btc-fee-transaction` is the unversioned commercial route boundary for prepare, signed, broadcast, and observed fee receipt transitions.
- `btc_fee_transactions` persists BTC fee receipt projections with wallet authorization proof, fee asset, no-custody, finality, txid, PSBT, sats, Exchange sequence, and Terminal journal root constraints.

### Gate 11: Ledgerized AssetPack Anchor Closure

Purpose:
Make AssetPack ranges, proof roots, and access policy hashes ledger-observable without leaking private source.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-11-ledger-anchor-proof.json`.

Closure criteria:

- `AssetPackLedgerAnchor` schema exists.
- at least one concrete Bitcoin ledger anchor path is implemented in local and signet form.
- Taproot, OP_RETURN, or another standard Bitcoin commitment method is selected by implementation proof.
- Ethereum registry/event anchoring is secondary or optional and either implemented or explicitly bounded as not ready.
- anchors bind AssetPack id, `$BTD` range, source manifest root, proof root, and access policy hash.
- pending, confirmed, reorged, and failed states replay.

Closure evidence:

- `packages/btd/src/ledger-anchor.ts` owns `AssetPackLedgerAnchor` and selects `taproot` by default for Bitcoin anchors.
- Ethereum anchoring is implemented only as an explicit secondary `ethereum_registry_event` commitment path and rejects implicit Ethereum anchor readiness.
- `/api/btd/asset-pack-ledger-anchor` is the unversioned commercial route boundary for prepare, broadcast, and observed anchor transitions.
- `btd_asset_pack_ledger_anchors` persists chain, network, commitment method, txid/hash, output index, roots, policy hash, `$BTD` range, finality, and receipt projection.
- package, API, ORM, and demonstration tests prove Taproot selection, signet posture, secondary Ethereum explicitness, range/root/policy binding, and confirmed-state observation.

### Gate 12: Minimal AssetPack Exchange Closure

Purpose:
Prove that AssetPack rights can be bought, sold, bid, asked, cancelled, settled, and transferred without fungible `$BTD` balances.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-12-minimal-exchange-proof.json`.

Closure criteria:

- `AssetPackExchangeOrder` or equivalent model exists.
- buy, sell, bid, ask, cancel, accept, settle, and transfer are implemented or proof-harnessed.
- ownership and license receipts replay Exchange state.
- rights transfer cannot bypass policy, proof, fee, or ledger requirements.
- V28+ market depth is not needed for V27 closure.

Closure evidence:

- `packages/btd/src/exchange.ts` owns BTC-priced buy, sell, bid, ask, cancel, accept, settle, and rights-transfer primitives.
- `/api/btd/asset-pack-exchange` is the unversioned commercial route boundary for order transitions, rights-transfer receipt construction, Terminal journal binding, and optional registry commit.
- `btd_exchange_orders` and `btd_rights_transfer_receipts` persist range, parties, BTC price, access policy hash, order state, Exchange sequence, receipt projection, and non-empty ledger-anchor evidence.
- package, API, ORM, and demonstration tests prove all order kinds, cancel/accept/settle, rights transfer, JSON-safe route projection, explicit commit behavior, and failure without settled order or ledger anchor.

### Gate 13: Terminal Transaction And Journal Diff Closure

Purpose:
Make Terminal actions accountable from user intent through Exchange settlement and ledger observation.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-13-terminal-journal-proof.json`.

Closure criteria:

- Terminal transaction families cover Read, Fit, proof, mint, fee, anchor, license, order, transfer, dispute, and settlement finalization.
- journal entries carry stable ids, pre-state roots, post-state roots, receipt roots, and ledger anchor references.
- journal diffing detects disagreement among Terminal intent, Exchange journal, ledger observation, database projection, and proof artifacts.
- blocking diffs fail closed before UI or API claims finality.

Closure evidence:

- `packages/btd/src/terminal-journal.ts` owns the required V27 Terminal transaction family list, journal entry validation, coverage receipts, and projection diffing.
- `/api/btd/terminal-journal` is the unversioned commercial route boundary for journal entry commit, projection diff, and transaction-family coverage checks.
- `btd_terminal_journal_entries` persists stable ids, transaction kind, actor, pre/post state roots, receipt roots, ledger anchor ids, and positive Exchange sequence under SQL constraints.
- package, API, ORM, and demonstration tests prove complete family coverage, missing-family blocking, persisted journal commits, and stale post-state drift blocking.

### Gate 14: Ledger/Database Reconciliation Closure

Purpose:
Make ledgers the source of truth for cryptographic finality while preserving Bitcode's canonical private/metaphysical database facts.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-14-ledger-database-reconciliation-proof.json`.

Closure criteria:

- reconciliation can replay ledger and Exchange journal facts into database projections.
- database projections cannot override confirmed ledger facts.
- private source metadata, proof bundles, access policies, disputes, telemetry, and pending state are explicitly non-ledgerized canonical facts.
- reconciler emits repair and alert receipts.
- idempotent replay is tested.

Closure evidence:

- `packages/btd/src/reconciliation.ts` compares ledger-observed facts and database projections, emits deterministic repair receipts, and makes confirmed, reorged, or failed finality mismatches blocking.
- private/metaphysical canonical facts require a canonical root, optional receipt root, and `private: true` posture before they can enter a reconciliation report.
- `/api/btd/ledger-database-reconciliation` is the unversioned commercial route for reconciliation reports, Terminal journal binding, and optional repair-row persistence.
- package, API, ORM, and demonstration tests prove confirmed-ledger precedence, idempotent repair ids, private canonical fact binding, and failure for unmarked/unbound metaphysical facts.

### Gate 15: Testnet, Mainnet-Ready, Telemetry, And Upgrade Closure

Purpose:
Prepare the V27 crypto surfaces for production operation without automatically launching value-bearing mainnet activity.

Status:
Closed for draft-target implementation by `.bitcode/v27-gate-15-testnet-mainnet-telemetry-upgrade-proof.json`.

Closure criteria:

- local, regtest, signet, supplementary testnet, and mainnet-ready environment lanes are documented.
- signet is the canonical public Bitcoin proof lane; public testnet is supplementary coverage.
- telemetry covers wallet failures, fee estimation drift, broadcast rejection, confirmation lag, reorg, RPC disagreement, projection lag, access failure, settlement failure, and upgrade failure.
- network toggles and deployment variables are named.
- value-bearing mainnet launch requires separate operational approval.
- ledgerized upgrades and migrations emit versioned receipts and rollback posture.

Closure evidence:

- `packages/btd/src/deployment-lanes.ts` models local, regtest, signet, testnet, mainnet-ready, and mainnet-value-bearing lanes, environment-key readiness, and value-bearing operational approval.
- `packages/btd/src/telemetry.ts` builds classified telemetry records across wallet, fee, ledger, provider, journal, database projection, access, settlement, and upgrade failures.
- `packages/btd/src/upgrade.ts` emits planned/applied/verified/rolled-back/failed upgrade receipts with migration roots, state roots, approvals, rollback roots, and ledger anchor ids.
- `/api/btd/deployment-readiness` is the unversioned commercial route for readiness checks, telemetry events, and upgrade receipt plan/transition persistence.
- package, API, ORM, and demonstration tests prove signet readiness, missing-env blocking, critical/warning telemetry classification, upgrade planning, and mainnet value-bearing approval rejection.

### Gate 16: Research Rebinding And Promotion Closure

Purpose:
Promote V27 only after spec, source, tests, proof, parity, and web-rebound crypto/library choices agree.

Status:
Closed by `.bitcode/v27-gate-16-promotion-proof.json` and `.bitcode/v27-total-closure-proof.json`.

Closure criteria:

- web research agenda is complete and normative choices are rebound to durable primary sources.
- V27 generated proof appendix exists.
- `.bitcode/v27-*` artifacts exist.
- parity matrix has no blocking open rows.
- V27 tests pass.
- `BITCODE_SPEC.txt` is updated to `V27` only at promotion.

Closure evidence:

- product acquisition surfaces route Terminal Read minting and minimal Exchange range-right transfer as V27 while leaving broader market depth to later versions;
- `apps/uapi/app/btd/[assetPackId]/page.tsx` provides an unversioned range/policy/read-right disclosure route;
- the former version-prefixed UAPI protocol corridors are ported to unversioned `/api/external-realization` and `/api/executors/[interfaceId]`;
- `internal-.docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md` binds Bitcoin, BIP 174, BIP 341, Filecoin, EIPs, and adapter-library research to V27 implementation choices;
- `BITCODE_SPEC_V27_PROVEN.md`, `.bitcode/v27-crypto-library-research-proof.json`, and `.bitcode/v27-total-closure-proof.json` provide the proof appendix and accepted generated-family map.

## Current Source Audit Summary

Implemented baseline:

- `packages/btd/src/constants.ts` owns V27 `$BTD` constants, Bitcoin network constants, and validation helpers.
- `packages/btd/src/supply.ts` owns strict supply state and cap advancement.
- `packages/btd/src/range.ts` owns Read/Fit/root/policy-guarded contiguous AssetPack range allocation.
- `packages/btd/src/semantic-volume.ts` owns proof-addressable semantic-volume measurement and quantization.
- `packages/btd/src/measuremint.ts` owns fixed-supply hyperbolic measureminting, residual accounting, and zero-cell tail receipts.
- `packages/btd/src/receipts.ts` owns conserved BTD mint receipts.
- `packages/btd/src/allocation.ts` owns Hare-Niemeyer contributor cell allocation.
- `packages/btd/src/access.ts` owns owner-read/licensed-read/denied policy evaluation.
- `packages/btd/src/ancestry.ts` owns late-bound, non-supply ancestry review.
- `packages/btd/src/revenue.ts` owns local licensed-read BTC revenue routing.
- `packages/btd/src/wallet.ts` owns signer-session capability guards without server custody.
- `packages/btd/src/bitcoin-fees.ts` owns PSBT-style BTC fee receipt lifecycle.
- `packages/btd/src/bitcoin-provider.ts` owns the network-checked Bitcoin fee provider boundary.
- `packages/btd/src/deployment-lanes.ts` owns local/regtest/signet/testnet/mainnet-ready lane guards.
- `packages/btd/src/ledger-anchor.ts` owns AssetPack ledger-anchor receipt lifecycle.
- `packages/btd/src/exchange.ts` owns minimal buy/sell/bid/ask order and rights-transfer receipt primitives.
- `packages/btd/src/terminal-journal.ts` owns Terminal journal entries and projection diffing.
- `packages/btd/src/reconciliation.ts` owns ledger/database projection repair reports.
- `packages/btd/src/telemetry.ts` owns V27 crypto telemetry event taxonomy.
- `packages/btd/src/upgrade.ts` owns versioned protocol upgrade receipts.
- `packages/btd/__tests__/v27-crypto-primitives.test.ts` proves the package primitives.
- `packages/api/src/routes/btd-crypto.ts` exposes authenticated registry snapshots and deterministic mint-draft projections without committing mint state.
- `apps/uapi/app/api/btd/registry/route.ts` and `apps/uapi/app/api/btd/mint-draft/route.ts` mount the commercial Next route boundary in place, without versioned route paths.
- `packages/api/src/routes/__tests__/btd-crypto.test.ts` proves route-level authentication injection, registry snapshot projection, and JSON-safe mint drafts.
- `protocol-demonstration/src/v27-crypto-primitives.js` and `test/v27-crypto-primitives.test.js` demonstrate the minimum protocol witness.
- `protocol-demonstration/src/receipt-schemas.js` exposes V27 semantic-volume, mint, allocation, ancestry, revenue-route, BTC fee, ledger-anchor, rights-transfer, reconciliation, and upgrade receipt families.
- `supabase/migrations/002_v27_btd_crypto_registry.sql` defines the V27 registry/projection table set.
- `packages/orm/src/models/btd-registry.ts` gives commercial source a Bitcode-native ORM boundary for V27 tables until generated types refresh.
- `packages/orm/src/client.ts` now exposes `btdRegistry` on standard and admin ORM clients.
- `.bitcode/v27-crypto-primitives-proof.json` records the first V27 proof slice for package, demonstration, registry, and validation surfaces.
- `packages/btd/src/index.ts` exports `BTD_MAX_MINTABLE_SUPPLY = 21_000_000`.
- `packages/btd/src/index.ts` exports BTC fee-basis helpers.
- `packages/btd/src/index.ts` rejects fungible mutation through `BtdFungibleMutationRejectedError`.
- `packages/btd/__tests__/btd.test.ts` proves cap presence and overflow rejection.
- `packages/api/src/routes/user.ts` rejects generic `$BTD` balance mutation.
- `packages/api/src/routes/auxillaries.ts` rejects generic auxillary `$BTD` mutation.
- `apps/uapi/tests/api/userBtdRoute.test.ts` proves API mutation rejection.
- `apps/uapi/components/base/bitcode/btd/btd-tracker.tsx` separates BTC and `$BTD` in user balance posture and records Terminal Read plus Exchange existing-`$BTD` acquisition intent as V27.
- `apps/uapi/components/base/bitcode/btd/BTDPrices.tsx` distinguishes Terminal Read V27 from minimal Exchange Range V27.
- `apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx` displays BTC fee liquidity and non-fungible `$BTD` holdings separately.
- public marketing surfaces disclose BTC fee and non-fungible `$BTD` read-right posture.
- `protocol-demonstration/src/receipt-schemas.js` already has licensed read and allocation receipt families that V27 can extend.
- `protocol-demonstration/src/canonical/settlement.js` already has source-to-shares fit quality and settlement accounting primitives.
- V26 specification and proof surfaces mention wallet readiness, testnet/mainnet posture, telemetry, reconciliation, and ledger-facing future work that V27 now pulls into minimum closure.

Partial baseline:

- `packages/orm/src/models/user-btd-balances.ts` and `user-btd-transactions.ts` wrap compatibility tables `user_credits` and `user_credit_usages`.
- `packages/orm/src/models/organization-btd-treasury.ts` aggregates user holdings but does not own registry supply.
- `internal-.docs/BITCODE_EXCHANGE_DATABASE.md` now names the V27 registry/projection table set, but deployment must still apply and prove it.
- `supabase/migrations/001_v26_production.sql` contains compatibility storage and RLS; `002_v27_btd_crypto_registry.sql` starts the V27 range/cell registry and crypto projection constraints.
- UI surfaces can now show holdings, intent, policy id/hash, and AssetPack range posture in the $BTD auxillary.
- auxillary wallet UI can display wallet posture; the V27 signer/session/transaction lifecycle exists in package primitives but is not wired to live adapters.
- BTC fee receipt and PSBT-style lifecycle primitives exist, but no broadcaster or confirmation reconciler is wired yet.
- demonstration settlement primitives can account for source-to-shares value and now witness V27 crypto receipts, but not external chain observations.
- V27 drafts previously left normalized Bitcode volume as an open scalar class; WDRR closes it as proof-addressable semantic volume while leaving exact measurement algorithm as implementation work.
- V27 drafts previously treated public testnet/signet generically; WDRR makes signet canonical for public Bitcoin proof and public testnet supplementary.
- V27 drafts previously treated Bitcoin and Ethereum anchor paths as peer candidates; WDRR makes Bitcoin primary and Ethereum secondary or optional.

Post-promotion deferrals:

- no persisted/generated total V27 minted range proof family;
- no persisted/generated total V27 receipt replay proof family;
- no live wallet adapter over the V27 signer-session boundary;
- no Bitcoin transaction broadcaster/reconciler for fee payment;
- no Taproot or other Bitcoin AssetPack anchor path;
- no Ethereum AssetPack registry/event path;
- no signet proof lane harness;
- no explicit Ethereum-secondary boundary in implementation code;

Promotion closure covers the generated proof appendix, research rebinding, token/range route, unversioned route posture, minimal API persistence boundaries, and proof-family accepted equivalents. Remaining items are operational rollout or later-version implementation depth, not V27 promotion blockers.

## Accepted Deferrals

The following are not V27 blockers unless a V27 invariant requires a minimal hook:

- full Exchange trading product beyond minimal rights transfer and buy/sell/bid/ask;
- high-volume order books or external markets;
- wrapper liquidity;
- value-bearing mainnet launch before operational approval;
- broad external interface propagation;
- complete Terminal product redesign beyond V27 transaction families;
- final legal templates for every future access policy class.

The following were V27 blockers and are closed by Gates 10-16:

- no actual BTC fee broadcaster/observer proof path;
- no live PSBT user signing adapter proof path;
- no ledgerized AssetPack anchor proof path;
- no proof-addressable semantic volume measurement proof;
- no minimal existing-`$BTD` acquisition or rights-transfer proof path;
- no Terminal journal diff proof;
- no ledger/database reconciliation proof;
- no testnet and mainnet-ready operational controls;
- no web-rebound crypto/library selection proof before normative dependency choices are finalized.

## Promotion Discipline

V27 may not be promoted by draft prose alone.

Promotion requires:

- complete spec family;
- implementation parity;
- tests;
- generated proof artifacts;
- generated proof appendix;
- no blocking parity rows;
- and deliberate `BITCODE_SPEC.txt` pointer update.
