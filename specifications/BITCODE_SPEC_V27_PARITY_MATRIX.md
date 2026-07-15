# Bitcode Spec V27 Parity Matrix

## Status

- Version: `V27`
- State: promoted parity matrix, Gates 1-16 closed
- Active canonical pointer: `BITCODE_SPEC.txt` -> `V27`
- Scope: source-to-spec parity for V27 `$BTD` tokenomics and practical crypto-application closure
- Spec companion: `BITCODE_SPEC_V27.md`
- Notes companion: `BITCODE_SPEC_V27_NOTES.md`
- Delta companion: `BITCODE_SPEC_V27_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`

This matrix records the initial V27 source audit.
It intentionally separates V26-implemented baseline from V27 tokenomics and crypto-application gaps.

## Audit Basis

Fresh audit inputs:

- `BITCODE_SPEC.txt`
- `BITCODE_SPECIFYING.md`
- `BITCODE_SPEC_V26.md`
- `BITCODE_SPEC_V26_DELTA.md`
- `BITCODE_SPEC_V26_NOTES.md`
- `BITCODE_SPEC_V26_PARITY_MATRIX.md`
- `BITCODE_SPEC_V27.md`
- `BITCODE_SPEC_V27_DELTA.md`
- `BITCODE_SPEC_V27_NOTES.md`
- `BITCODE_SPEC_V27_PARITY_MATRIX.md`
- `protocol-demonstration/V26_TERMINAL_SYSTEMS.md`
- `protocol-demonstration/V26_PROOF_SURFACES.md`
- `packages/btd/src/constants.ts`
- `packages/btd/src/index.ts`
- `packages/btd/src/supply.ts`
- `packages/btd/src/measuremint.ts`
- `packages/btd/src/semantic-volume.ts`
- `packages/btd/src/range.ts`
- `packages/btd/src/receipts.ts`
- `packages/btd/src/replay.ts`
- `packages/btd/src/allocation.ts`
- `packages/btd/src/access.ts`
- `packages/btd/src/ancestry.ts`
- `packages/btd/src/revenue.ts`
- `packages/btd/src/wallet.ts`
- `packages/btd/src/bitcoin-fees.ts`
- `packages/btd/src/bitcoin-provider.ts`
- `packages/btd/src/deployment-lanes.ts`
- `packages/btd/src/ledger-anchor.ts`
- `packages/btd/src/exchange.ts`
- `packages/btd/src/terminal-journal.ts`
- `packages/btd/src/reconciliation.ts`
- `packages/btd/src/telemetry.ts`
- `packages/btd/src/upgrade.ts`
- `packages/btd/src/plans.ts`
- `packages/btd/README.md`
- `packages/btd/__tests__/btd.test.ts`
- `packages/btd/__tests__/v27-crypto-primitives.test.ts`
- `packages/api/src/index.ts`
- `packages/api/src/routes/user.ts`
- `packages/api/src/routes/auxillaries.ts`
- `packages/api/src/routes/btd-crypto.ts`
- `packages/api/src/routes/__tests__/btd-crypto.test.ts`
- `packages/api/src/routes/__tests__/user-btd-mutation.test.ts`
- `apps/uapi/tests/api/userBtdRoute.test.ts`
- `apps/uapi/app/api/btd/registry/route.ts`
- `apps/uapi/app/api/btd/mint-draft/route.ts`
- `packages/orm/src/models/user-btd-balances.ts`
- `packages/orm/src/models/user-btd-transactions.ts`
- `packages/orm/src/models/organization-btd-treasury.ts`
- `packages/orm/src/models/organization-btd-usage.ts`
- `packages/orm/src/client.ts`
- `packages/orm/src/models/asset-pack-evidence.ts`
- `packages/supabase/src/asset-pack-evidence.ts`
- `supabase/migrations/001_v26_production.sql`
- `supabase/migrations/002_v27_btd_crypto_registry.sql`
- `internal-docs/BITCODE_EXCHANGE_DATABASE.md`
- `protocol-demonstration/src/receipt-schemas.js`
- `protocol-demonstration/src/v27-crypto-primitives.js`
- `protocol-demonstration/src/canonical/settlement.js`
- `protocol-demonstration/src/settlement-structs.js`
- `protocol-demonstration/src/canon-posture.js`
- `protocol-demonstration/data/state.json`
- `protocol-demonstration/src/canonical/proven-generator.js`
- `apps/uapi/components/base/bitcode/btd/btd-tracker.tsx`
- `apps/uapi/components/base/bitcode/btd/BTDPrices.tsx`
- `apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx`
- `apps/uapi/app/(root)/components/MarketingBtdShareMetricsSection.tsx`
- `apps/uapi/app/(root)/components/MarketingCtaContactSection.tsx`
- `apps/uapi/app/(root)/components/MarketingFaqSection.tsx`
- `packages/executions-mcp/src/mcp-server/ARCHITECTURE.md`
- `packages/executions-mcp/src/mcp-server/src/auth/middleware.ts`
- `.bitcode/v27-crypto-primitives-proof.json`
- `.bitcode/v27-gate-1-source-audit-proof.json`
- `.bitcode/v27-gate-2-ontology-cap-proof.json`
- `.bitcode/v27-gate-3-supply-range-proof.json`
- `.bitcode/v27-source-to-shares-mint-admission-proof.json`
- `.bitcode/v27-gate-4-mint-admission-proof.json`
- `.bitcode/v27-receipt-replay-proof.json`
- `.bitcode/v27-gate-5-receipt-replay-proof.json`
- `.bitcode/v27-gate-6-exchange-persistence-proof.json`

No `_legacy/` source was used as active source truth.

Audit query classes:

- active canonical pointer and current spec family discovery;
- V26 commercial canon, delta, notes, parity, application systems, and proof surfaces;
- V27 draft spec family discovery and synchronization;
- `$BTD`, BTC fee, non-fungible, range, supply, mint, access, revenue, ancestry, and compatibility-storage searches;
- wallet, ledger, Bitcoin, Taproot, Ethereum, testnet, mainnet, telemetry, reconciliation, Exchange, Terminal, order, bid, ask, buy, sell, transfer, and journal searches;
- WDRR findings for semantic volume, PSBT fee signing, signet proof lanes, Ethereum-secondary posture, optional canonical ancestry, and marketplace royalty fragility;
- package source discovery under `packages/btd`, `packages/api`, `packages/orm`, `packages/supabase`, `packages/executions-mcp`;
- commercial interface discovery under `uapi`;
- protocol reference discovery under `protocol-demonstration`;
- database/migration discovery under `supabase` and `internal-docs`.

## Judgment Legend

- `implemented baseline`: present from V26 and suitable as a V27 starting point.
- `partial`: present but not complete enough for V27 closure.
- `gap`: absent or insufficient for V27.
- `deferred`: intentionally later-version work.
- `blocking`: must close before V27 promotion.

## V27 Source Parity Matrix

| Area | V27 expectation | Current source truth | Judgment | Required closure |
| --- | --- | --- | --- | --- |
| Active pointer discipline | V27 is active after proof closure | `BITCODE_SPEC.txt` contains `V27` after promotion | closed | pointer updated only after Gate 16 proof closure |
| V27 notes | future tokenomics note exists | `BITCODE_SPEC_V27_NOTES.md` exists and marks itself non-canonical | implemented baseline | keep synchronized as SPEC/DELTA/PARITY evolve |
| V27 SPEC | complete specification exists | `BITCODE_SPEC_V27.md` records all gates and promotion status | closed | continue future changes in the next target version |
| V27 DELTA | version-local delta exists | `BITCODE_SPEC_V27_DELTA.md` records V27 gate closures | closed | continue future changes in the next target version |
| V27 PARITY | audited source parity exists | this file records V27 parity and no blocking promotion rows remain | closed | continue future changes in the next target version |
| Hard supply cap | cap is exactly 21,000,000 | `packages/btd/src/constants.ts` exports `BTD_MAX_MINTABLE_SUPPLY = 21_000_000`; migration enforces `max_supply = 21000000`; proof family map includes supply/range closure | closed | no V27 blockers remain |
| Cap test | package test proves cap and overflow rejection | `packages/btd/__tests__/btd.test.ts` checks cap and overflow | implemented baseline | extend to full supply state and range allocator |
| BTC fee asset | BTC is fee asset, not `$BTD` | `BITCODE_FEE_ASSET = 'BTC'`, UI and docs state BTC pays fees | implemented baseline | preserve in all V27 copy and receipts |
| Non-fungible semantics | `$BTD` is non-fungible AssetPack share/read-right | `BTD_ASSET_SEMANTICS`, README, UI, FAQ, auxillaries copy state this | implemented baseline | make cell/range identity exact |
| Fungible mutation rejection | generic spend/balance mutation fails closed | package error, user API, auxillary API, and route tests reject mutation | implemented baseline | ensure every V27 mint path bypasses generic mutation |
| Aggregate holding read | users can read current holding posture | `getBtdBalance`, `readBtdHoldings`, user/auxillary APIs read compatibility storage | partial | replace aggregate read with registry-derived read |
| Compatibility storage | old `user_credits` names are storage carriers only | ORM wraps `user_credits` and `user_credit_usages` as non-canonical compatibility read corridors; docs and tests assert they cannot mint, debit, transfer, or settle `$BTD` | partial | Gate 6 noncanonical binding is closed; later product reads still read registry-derived replacement |
| Organization treasury | organization can aggregate holdings | `OrganizationBtdTreasuryModel` aggregates member `user_credits` balances | partial | treasury must read registry holdings and never mint |
| Organization usage | organization BTD usage remains outside V27 core tokenomics | `OrganizationBtdUsageModel` is placeholder and does not mint, transfer, or settle `$BTD` | deferred | broader organization usage/read-license productization is later-version work |
| AssetPack evidence | stored AssetPack evidence layer exists | `AssetPackEvidenceModel` wraps physical `deliverables` storage | partial | bind minted ranges to AssetPack evidence roots |
| Source-to-shares settlement | settlement fit-quality exists | `settlement.js` quantizes source-to-shares fit qualities and settlement accounting; `.bitcode/v27-source-to-shares-mint-admission-proof.json` binds V27 minted range roots to the source-to-shares admission proof trail | partial | Gate 4 source-to-shares mint-admission binding is proved; full settlement output integration and generated proof artifacts remain later-gate work |
| Normalized Bitcode volume | mint quantity uses proof-addressable semantic units | `packages/btd/src/semantic-volume.ts` and `protocol-demonstration/src/v27-crypto-primitives.js` implement semantic-volume receipts; V27 proof map binds accepted proof equivalents | closed | deeper production measurement expansion is later-version work |
| Measureminting decay | primary issuance decays against cumulative admitted measurement | `packages/btd/src/measuremint.ts` and demo witness implement hyperbolic fixed-supply measureminting; gate proofs bind tail behavior | closed | further anti-fragmentation telemetry can expand later |
| Receipt schemas | receipts exist for deposit, licensed bundle, allocation, settlement fit quality, V27 crypto primitives | `packages/btd/src/receipts.ts`, `packages/btd/src/allocation.ts`, and `protocol-demonstration/src/receipt-schemas.js` now cover V27 mint and contributor allocation receipts with replay validation | partial | Gate 5 package/demonstration receipt replay closure is proved; add persisted receipt coverage and generated total proof families later |
| Mint admission | only Read-Fit-Prove-Settle can mint | `packages/btd/src/range.ts` and `packages/api/src/routes/btd-crypto.ts` enforce accepted Read, accepted Fit, required roots, access policy, and positive Exchange sequence before range allocation or mint-draft return; package/API tests prove negative paths | partial | Gate 4 package/API admission closure is proved; integrate package guard into persisted Terminal/Exchange write paths and generated proof families in later gates |
| Supply state | canonical state machine exists | `packages/btd/src/supply.ts` exists; `packages/btd/__tests__/v27-crypto-primitives.test.ts` proves cap/advance behavior and replayable `nextTokenId` through range allocation | partial | Gate 3 package primitive closure is proved; bind to DB singleton and generated proof replay in later gates |
| Range allocator | one AssetPack gets one contiguous range | `packages/btd/src/range.ts` allocates contiguous ranges and validates integrity/placement; package tests cover success, cap exceed, invalid input, duplicate primary range rejection, stale-state overlap rejection, and replay | partial | Gate 3 package primitive closure is proved; add DB insertion and generated no-overlap proof in later gates |
| Allocation algorithm | deterministic contributor allocation conserves token count | `packages/btd/src/allocation.ts` implements weighted Hare-Niemeyer allocation; package/API/demo tests prove range conservation and deterministic remainder ordering | closed for Gate 8 | full source-to-shares write integration and generated proof-family promotion remain later |
| Mint receipt replay | receipts reconstruct supply and range state | `packages/btd/src/replay.ts` reconstructs supply checkpoints, ranges, allocations, total minted, and nextTokenId; `protocol-demonstration/src/v27-crypto-primitives.js` includes the minimal replay witness | partial | Gate 5 receipt replay closure is proved; add persisted receipt tests and total generated proof family later |
| Access policy | owner-read and licensed-read are distinct | `packages/btd/src/access.ts` evaluates owner-read/licensed-read/denied decisions by policy hash; `/api/btd/read-access` can evaluate payload-supplied or registry-derived ownership claims/read licenses; package/API/demo tests cover owner-read, licensed-read, expired license, unauthorized access, and policy mismatch | closed for Gate 7 | live value-bearing access operations and generated proof-family promotion remain later |
| Legal rights disclosure | UI avoids overclaiming `$BTD` rights | `$BTD` auxillary now discloses policy id/hash, AssetPack range posture, and distinct owner/licensed read branches; overclaim scan found no public-surface matches for copyright ownership, guaranteed royalty, dividend, or price-appreciation phrases | closed for Gate 7 | final legal template review remains later |
| Revenue routing | licensed read routes to holders/ancestors/treasury/holdback | `packages/btd/src/revenue.ts`, `/api/btd/licensed-read-revenue`, `protocol-demonstration/src/v27-crypto-primitives.js`, and `btd_licensed_read_revenue_routes` conserve direct, ancestor, treasury, and dispute-holdback sats and record pending/failed routes | closed for Gate 8 | live wallet settlement, broadcaster finality, and generated proof-family promotion remain later |
| Ancestry | late-bound, non-supply ancestry module | `packages/btd/src/ancestry.ts`, `/api/btd/ancestry-review`, `protocol-demonstration/src/v27-crypto-primitives.js`, and `btd_ancestor_edges` review and persist payable, unpaid, and rejected edges with `supplyEffect: 'none'` and `mintCountDelta: 0` | closed for Gate 9 | generated proof-family promotion and live revenue-route consumption remain later |
| Anti-game | dedupe, disputes, loop/collusion checks | ancestry review rejects duplicate edges, duplicate source roots, self edges, child mismatches, pre-fit claims, reciprocal loops, dependency cycles, and claimant/reviewer conflicts; low-confidence, citation-only, and disclosed-conflict edges remain unpaid | closed for Gate 9 | broader graph anomaly telemetry and fragmentation proof remain later |
| Tail behavior | zero-cell receipts then refit-only tail | measuremint package/demo tests cover below-integer zero-cell receipt and the proof appendix records tail policy | closed | richer refit product workflows remain later-version work |
| Exchange DB docs | DB target names BTD registry tables | `internal-docs/BITCODE_EXCHANGE_DATABASE.md` documents V27 registry/projection tables, service-role/RLS posture, and compatibility-table noncanonical limits | partial | Gate 6 documentation closure is proved; keep synchronized as later gates add live writes |
| SQL migration | DB constraints for supply/range/cells/crypto receipts | `supabase/migrations/002_v27_btd_crypto_registry.sql` adds V27 registry, allocation, ancestry, revenue, upgrade, crypto projection, RLS, access-policy, cap, unique token, and no-overlap constraints | partial | Gate 6 migration closure is proved; live migration execution and generated DB type refresh remain later work |
| ORM models | Bitcode-native BTD registry models | `packages/orm/src/models/btd-registry.ts` exposes the V27 registry/allocation/revenue/upgrade boundary; `packages/orm/src/client.ts` exposes `btdRegistry` on standard/admin clients; ORM tests verify table routing | partial | Gate 6 ORM boundary closure is proved; replace raw V27 table boundary with generated types after DB codegen |
| BTD API route boundary | authenticated commercial routes expose registry, mint-draft, fee, anchor, ancestry, revenue, and minimal Exchange projections | `packages/api/src/routes/btd-crypto.ts`, Next wrappers under `apps/uapi/app/api/btd/*`, and `btd-crypto.test.ts` cover registry snapshots, JSON-safe mint drafts, read access, revenue, ancestry, BTC fee, ledger anchor, and minimal Exchange route paths without versioned route paths | closed through Gate 12 | generated proof-family promotion and full live value-bearing rollout remain later |
| Versioned route removal | current app API routes are in-place and unversioned | former version-prefixed corridors are now `apps/uapi/app/api/external-realization` and `apps/uapi/app/api/executors/[interfaceId]`; `find apps/uapi/app/api -path '*v[0-9]*'` returns no routes | closed | future versions must update routes in place |
| UAPI balance widget | top-right balance distinguishes BTC and `$BTD` | `btd-tracker.tsx` shows BTC and `$BTD`; acquisition intent stores Terminal Read and Exchange existing-`$BTD` paths as V27 | closed | registry/range live reads can deepen later |
| UAPI acquisition card | Terminal Read and Exchange minimal acquisition split | `BTDPrices.tsx` labels Terminal Read and Exchange Range as V27 while reserving market depth for later work | closed | broader order-book UX is later-version work |
| Auxillary BTD pane | wallet and holdings are readable | `AuxillariesBTDPane.tsx` shows BTC fee liquidity, holdings, wallet posture | implemented baseline | add range/policy/supply details |
| Public copy | BTC/$BTD distinction visible | marketing metrics, CTA, and FAQ state BTC pays fees and `$BTD` is non-fungible read-right | implemented baseline | add V27 exact range/access language after implementation |
| Token/range route | route shows range, policy, and rights | `apps/uapi/app/btd/[assetPackId]/page.tsx` shows range, policy id/hash, read branch, proof root, and source manifest root | closed | live registry hydration can deepen later |
| MCP holding gate | MCP can require BTD holding | MCP auth middleware checks `minimumBtdHolding` against aggregate balance | partial | switch to registry-derived holding/read-right checks |
| Proof generator | V26 generator knows cap evidence | `proven-generator.js` references `BTD_MAX_MINTABLE_SUPPLY = 21_000_000` | partial | add V27 proof families |
| Wallet signer session | user wallet authorizes crypto operations | `packages/btd/src/wallet.ts` requires address authorization proof before signing; proofless sessions stay prepared and fail closed; `/api/btd/btc-fee-transaction` accepts authorized signer sessions for BTC fee handoff | closed for Gate 10 | live wallet adapter UX remains later |
| PSBT fee transaction | BTC fees are actual user-signed transactions | `packages/btd/src/bitcoin-fees.ts`, `packages/btd/src/bitcoin-provider.ts`, `/api/btd/btc-fee-transaction`, `btc_fee_transactions`, and demonstration receipts cover prepare, signed, broadcast, observed/confirmed, txid, sats, Exchange sequence, Terminal journal root, and signet harness observation | closed for Gate 10 | value-bearing broadcaster credentials and production observer rollout remain later |
| Fee asset separation | `$BTD` cannot pay fees | package/API reject fungible mutation; BTC fee receipts are constrained to `BTC` and tests reject altered `$BTD` fee assets | closed for Gate 10 | continue preserving BTC-only fee receipts in later Exchange/Terminal routes |
| Bitcoin ledger anchor | AssetPack can anchor on selected Bitcoin commitment path | `packages/btd/src/ledger-anchor.ts` selects Taproot for Bitcoin anchors; `/api/btd/asset-pack-ledger-anchor`, `btd_asset_pack_ledger_anchors`, package/API/demo tests cover signet-ready prepare, broadcast, observe, and confirmed states | closed for Gate 11 | live broadcaster credentials and production observer rollout remain later |
| Ethereum ledger anchor | Ethereum is secondary or optional registry/event anchor | `packages/btd/src/ledger-anchor.ts` supports only explicit `ethereum_registry_event` anchors for Ethereum and rejects implicit Ethereum commitment readiness | closed for Gate 11 | value-bearing Ethereum deployment remains later and secondary |
| AssetPack ledger anchor receipt | anchor binds range, roots, policy, and finality | package/API/demo/migration surfaces bind AssetPack id, source manifest root, proof root, access policy hash, `$BTD` range, commitment method, txid/hash, and finality state | closed for Gate 11 | generated proof-family promotion remains later |
| Minimal Exchange orders | buy/sell/bid/ask/cancel/accept/settle exist | `packages/btd/src/exchange.ts`, `/api/btd/asset-pack-exchange`, `btd_exchange_orders`, and package/API tests implement BTC-priced order creation, cancellation, acceptance, settlement, Terminal journal binding, JSON-safe projection, and explicit registry writes | closed for Gate 12 | V28+ market depth, full order-book UX, and live value-bearing settlement remain later |
| Rights transfer | `$BTD` range rights can transfer after settlement | `buildAssetPackRightsTransferReceipt`, `/api/btd/asset-pack-exchange`, `btd_rights_transfer_receipts`, and package/API/demo tests emit BTC-priced rights-transfer receipts and reject transfer without settled order, policy hash, BTC fee receipt, and ledger anchor | closed for Gate 12 | live value-bearing settlement and broader ownership UI remain later |
| Terminal transaction journal | Terminal actions produce replayable transaction journal entries | `packages/btd/src/terminal-journal.ts`, `/api/btd/terminal-journal`, `btd_terminal_journal_entries`, and package/API/demo tests cover required transaction-family coverage, stable journal rows, commit-gated persistence, and missing-family blocking | closed for Gate 13 | broader V28 Terminal product UX and generated proof-family promotion remain later |
| Ledgerized journal diff | journal, ledger, DB, proof, and telemetry can be compared | `diffTerminalJournalProjection` and `/api/btd/terminal-journal` block stale post-state, receipt-root, journal-id, and ledger-anchor projection drift before UI/API can claim finality | closed for Gate 13 | full live ledger observer integration continues in Gate 14/15 |
| Ledger/database reconciliation | DB is ledger-derived plus metaphysical canonical store | `packages/btd/src/reconciliation.ts`, `/api/btd/ledger-database-reconciliation`, repair rows, and package/API/demo tests enforce confirmed-ledger precedence, deterministic repairs, and private canonical fact root binding | closed for Gate 14 | production ledger observer rollout and generated proof-family promotion remain later |
| Signet proof lane | public Bitcoin proof prefers signet | package constants, deployment readiness receipts, `/api/btd/deployment-readiness`, and demo tests enforce signet as the public proof posture while leaving public testnet supplementary | closed for Gate 15 | live public proof transaction credentials remain operational rollout work |
| Mainnet-ready lane | mainnet controls exist without automatic launch | `packages/btd/src/deployment-lanes.ts` models local/regtest/signet/testnet/mainnet-ready/value-bearing lanes, environment keys, rollback roots, and approval roots; tests reject value-bearing mainnet without approval | closed for Gate 15 | value-bearing launch still requires separate operational approval |
| Crypto telemetry | wallet/chain/reconciler failures are observable | `packages/btd/src/telemetry.ts` and `/api/btd/deployment-readiness` classify and optionally persist wallet, fee, ledger, provider, journal, database, access, settlement, and upgrade telemetry | closed for Gate 15 | production alert sinks remain operational rollout work |
| Upgrade receipts | ledgerized migrations/upgrades are versioned | `packages/btd/src/upgrade.ts`, migration table, ORM boundary, API route, and demo schema model planned/applied/verified/rolled-back/failed upgrade receipts with rollback posture | closed for Gate 15 | generated proof-family promotion remains later |
| Library selection proof | external crypto dependencies are researched and rebound | `internal-docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md` and `.bitcode/v27-crypto-library-research-proof.json` bind primary/official sources | closed | library candidates remain adapter-level, not protocol law |
| Marketplace royalty posture | recurring economics are local Exchange settlement, not third-party royalty signaling | `packages/btd/src/revenue.ts`, rights-transfer receipts, and minimal Exchange routes route BTC locally; no third-party royalty dependency is introduced | closed | external marketplace depth is later-version work |
| Threat model | knowledge-market distortion and crypto-finality failures are specified | SPEC/NOTES, telemetry, ancestry anti-game tests, journal diffing, reconciliation repairs, and gate proofs map threats to source behavior | closed | production anomaly analytics can deepen later |
| Demonstration state | draft target points to V27 files | `protocol-demonstration/data/state.json` lists draft V27 paths | implemented baseline | ensure files now exist and tests stay green |
| Crypto primitive proof slice | first V27 package/demo/db proof artifact exists | `.bitcode/v27-crypto-primitives-proof.json` records source surfaces and focused validation commands; `.bitcode/v27-total-closure-proof.json` binds accepted proof-family equivalents | closed | future generated tooling can replace accepted equivalents |
| Generated proof appendix | V27 PROVEN generated | `BITCODE_SPEC_V27_PROVEN.md` exists and points to `.bitcode/v27-total-closure-proof.json` | closed | appendices for later versions remain future work |

## Gate 1 Closure Evidence

Gate 1 closed as the initial V27 source-audit pass.
Promotion later closed in Gate 16.

| Gate 1 expectation | Closure evidence | Status |
| --- | --- | --- |
| V27 SPEC, DELTA, NOTES, and PARITY files exist | `BITCODE_SPEC_V27.md`, `BITCODE_SPEC_V27_DELTA.md`, `BITCODE_SPEC_V27_NOTES.md`, and this matrix are present | closed |
| V26 remained the active canonical pointer at Gate 1 | `BITCODE_SPEC.txt` contained `V26` during Gate 1 | closed |
| audited surfaces are listed in the parity matrix | Audit basis and source map list the V27 spec family, package, API, ORM, migration, UAPI, MCP, demonstration, and proof-slice surfaces used for the baseline | closed |
| parity rows classify source truth | matrix rows used `implemented baseline`, `partial`, `gap`, `deferred`, and `blocking` judgments during draft audit | closed |
| no generated proof claim is made before proof artifacts exist | `.bitcode/v27-gate-1-source-audit-proof.json` records only source-audit closure; generated proof appendix is a Gate 16 artifact | closed |

## Gate 2 Closure Evidence

Gate 2 is closed as of the V27 ontology and hard-cap pass.
This does not close later registry, persistence, range-proof, access-policy UI, or generated-proof-family work.

| Gate 2 expectation | Closure evidence | Status |
| --- | --- | --- |
| `$BTD` cell/range ontology is complete in SPEC | `BITCODE_SPEC_V27.md` defines supply state, cell/range model, mint lifecycle, measureminting, access rights, and non-fungible semantics | closed |
| `BTD_MAX_MINTABLE_SUPPLY = 21_000_000` is package-owned | `packages/btd/src/constants.ts` owns the constant and `packages/btd/src/index.ts` exports it through the package boundary | closed |
| tests prove cap existence and overflow rejection | `packages/btd/__tests__/btd.test.ts` proves the 21,000,000 ceiling and overflow rejection | closed |
| fungible mutation remains rejected in API and package surfaces | `BtdFungibleMutationRejectedError`, `rejectBtdBalanceMutation`, `buildPostAuxillaryBtdRoute`, `user-btd-mutation.test.ts`, and `userBtdRoute.test.ts` prove generic mutation is fail-closed | closed |
| UI copy keeps BTC fee and `$BTD` share/read-right separate | BTD tracker, price card, auxillary BTD pane, marketing share metrics, and FAQ state BTC pays fees while `$BTD` remains non-fungible share/read-right posture | closed |

## Gate 3 Closure Evidence

Gate 3 is closed as of the V27 package supply/range primitive pass.
This does not close DB persistence, generated no-overlap proof families, persisted Exchange write paths, or V27 promotion.

| Gate 3 expectation | Closure evidence | Status |
| --- | --- | --- |
| supply state machine exists | `packages/btd/src/supply.ts` defines `BtdSupplyState`, `createBtdSupplyState`, `assertBtdSupplyState`, `assertCanMintBtdRange`, and `advanceBtdSupply` | closed |
| range allocation exists | `packages/btd/src/range.ts` defines `allocateAssetPackRange` over validated mint admission and supply state | closed |
| one AssetPack receives one primary contiguous range | `assertAssetPackRangePlacement` rejects a second primary range for the same `assetPackId`; package tests cover duplicate primary range rejection | closed |
| no overlap is possible through package tests | `assertAssetPackRangePlacement` rejects stale-state overlapping ranges; package tests cover overlap rejection | closed |
| invalid input fails closed | `assertMintAdmission`, `assertAssetPackRangeIntegrity`, and supply cap checks reject invalid roots, token counts, volume, stale state, and cap overflow before returning an allocation | closed |
| replay can derive `nextTokenId` | `replayBtdMintReceipts` derives `nextTokenId` from sequential mint receipts; package tests prove replay reaches the expected next token id | closed |

## Gate 4 Closure Evidence

Gate 4 is closed as of the V27 package/API mint-admission pass.
This does not close persisted Exchange writes, generated V27 proof-family closure, ledger finality, or V27 promotion.

| Gate 4 expectation | Closure evidence | Status |
| --- | --- | --- |
| mint request requires accepted Read, accepted Fit, proof root, source root, dedupe root, settlement root, access policy, and Exchange sequence | `packages/btd/src/range.ts` and `packages/api/src/routes/btd-crypto.ts` validate the admission roots before range allocation or mint-draft return | closed |
| negative tests prove no mint before settlement | package tests reject absent Read, absent Fit, missing proof root, missing settlement root, and non-positive Exchange sequence; API route tests reject absent Read, absent Fit, missing proof root, and non-positive Exchange sequence | closed |
| source-to-shares proof artifacts include minted range roots | `.bitcode/v27-source-to-shares-mint-admission-proof.json` carries `mintedRangeRoot`, range boundaries, source root, proof root, settlement root, Exchange root, policy hash, supply replay root, and Terminal receipt roots | closed |
| Terminal intent can point to the path without bypassing it | `buildBtdMintDraft` emits Terminal journal entries only after admission, measurement, measureminting, range allocation, mint receipt, and optional contributor allocation; API tests assert exchange sequence and receipt roots | closed |

## Gate 5 Closure Evidence

Gate 5 is closed as of the V27 package and demonstration receipt replay pass.
This does not close persisted Exchange receipt writes, database projection replay, ledger finality, generated total proof-family closure, or V27 promotion.

| Gate 5 expectation | Closure evidence | Status |
| --- | --- | --- |
| `BtdMintReceipt` schema exists | `packages/btd/src/receipts.ts` defines and validates the V27 mint receipt; `protocol-demonstration/src/receipt-schemas.js` exposes `btd_asset_pack_mint` with the V27 receipt family posture | closed |
| replay reconstructs prior supply, range, allocation, and next supply | `packages/btd/src/replay.ts` reconstructs supply checkpoints, AssetPack ranges, contributor allocation receipts, total minted supply, and `nextTokenId`; package tests prove the exact reconstructed state | closed |
| mutation tests reject altered cap, altered range, missing root, missing policy, and non-conserved allocation | package tests block missing proof root, altered range boundary, altered max supply, missing access policy hash, and non-conserved allocation; demonstration tests block missing proof root | closed |
| proof generator includes V27 receipt replay | `.bitcode/v27-receipt-replay-proof.json` records the proof slice and `protocol-demonstration/test/v27-crypto-primitives.test.js` includes the V27 demonstration receipt replay assertion | closed |

## Gate 6 Closure Evidence

Gate 6 is closed as of the V27 Exchange persistence migration and ORM boundary pass.
This does not close live Supabase migration execution, generated DB type refresh, wallet/ledger finality, or value-bearing rollout.

| Gate 6 expectation | Closure evidence | Status |
| --- | --- | --- |
| migration creates or plans the registry/projection table family | `supabase/migrations/002_v27_btd_crypto_registry.sql` creates supply, semantic-volume, measuremint, range, cell, mint receipt, ownership, read-license, allocation, ancestry, licensed-read revenue, fee, anchor, order, transfer, journal, reconciliation, upgrade, and telemetry tables | closed |
| SQL constraints cover cap, uniqueness, no overlap, access policy, and service-role mutation | migration enforces cap, unique token/range identities, GiST no-overlap range exclusion, access-policy checks, and RLS-enabled service-role-only projection writes | closed |
| ORM exposes Bitcode-native model names | `BtdRegistryModel` exposes Bitcode-native registry methods and `btdRegistry` is available from ORM clients | closed |
| `user_credits` is no longer canonical tokenomics truth | compatibility balance/transaction models and database docs state those storage carriers are noncanonical read corridors only and cannot mint, debit, transfer, or settle `$BTD` | closed |

## Gate Closure Matrix

| Gate | Current status | Blocking rows |
| --- | --- | --- |
| Gate 1: Draft Opening And Source Audit | closed | no Gate 1 blockers remain; later-gate blockers remain below |
| Gate 2: Ontology And Hard Cap | closed | no Gate 2 blockers remain; registry persistence, range proof, access policy UI, and generated proof families remain later-gate work |
| Gate 3: Supply And Range Primitives | closed | no Gate 3 package primitive blockers remain; DB persistence, generated no-overlap proof, and write-committing Exchange integration remain later-gate work |
| Gate 4: Read-Fit Mint Admission | closed | no Gate 4 package/API admission blockers remain; persisted Exchange writes and generated proof-family closure remain later-gate work |
| Gate 5: Receipt And Replay | closed | no Gate 5 package/demonstration replay blockers remain; persisted receipt writes, database projection replay, and generated total proof closure remain later-gate work |
| Gate 6: Exchange Persistence | closed | no Gate 6 migration/ORM boundary blockers remain; live migration execution, generated DB type refresh, and value-bearing rollout controls remain later work |
| Gate 7: Access And Policy | closed | no Gate 7 blockers remain; live value-bearing access operation rollout and final legal templates remain later |
| Gate 8: Allocation And Revenue | closed | no Gate 8 blockers remain; live wallet settlement and generated proof-family promotion remain later |
| Gate 9: Ancestry And Anti-Game | closed | no Gate 9 blockers remain; graph anomaly telemetry, live revenue-route consumption, and generated proof-family promotion remain later |
| Gate 10: Wallet And BTC Fee Settlement | closed | no Gate 10 blockers remain; live wallet adapter UX, value-bearing broadcaster credentials, and production observer rollout remain later |
| Gate 11: Ledgerized AssetPack Anchoring | closed | no Gate 11 blockers remain; live broadcaster credentials, production observer rollout, and generated proof-family promotion remain later |
| Gate 12: Minimal AssetPack Exchange | closed | no Gate 12 blockers remain; V28+ market depth, full order-book UX, live value-bearing settlement, and generated proof-family promotion remain later |
| Gate 13: Terminal Transactions And Journal Diffing | closed | no Gate 13 blockers remain; broader V28 Terminal workflows, live UX, and generated proof-family promotion remain later |
| Gate 14: Ledger/Database Reconciliation | closed | no Gate 14 blockers remain; production observer rollout, operational alert sinks, and generated proof-family promotion remain later |
| Gate 15: Testnet/Mainnet Telemetry And Upgrades | closed | no Gate 15 blockers remain; production alert sinks, value-bearing launch approval, and generated proof-family promotion remain later |
| Gate 16: Product Surfaces, Research Rebinding, And Promotion Proof | closed | no Gate 16 blockers remain; value-bearing launch approval and broader product depth are post-promotion work |

## Initial Source Map

| Surface | Current V27 relevance |
| --- | --- |
| `packages/btd/src/index.ts` | cap, semantics, BTC fee basis, measured amount, mutation rejection |
| `packages/btd/__tests__/btd.test.ts` | cap and mutation baseline tests |
| `packages/btd/README.md` | package human contract |
| `packages/api/src/routes/user.ts` | generic `$BTD` mutation rejection and acquisition paths |
| `packages/api/src/routes/auxillaries.ts` | auxillary mutation rejection and acquisition paths |
| `packages/api/src/routes/btd-crypto.ts` | authenticated registry snapshot and mint-draft route builders |
| `packages/api/src/routes/__tests__/btd-crypto.test.ts` | route tests for snapshot projection and JSON-safe mint drafts |
| `packages/api/src/routes/__tests__/user-btd-mutation.test.ts` | package-route tests proving `/user/btd` generic mutation fails closed |
| `apps/uapi/app/api/btd/registry/route.ts` | commercial Next route wrapper for registry snapshots |
| `apps/uapi/app/api/btd/mint-draft/route.ts` | commercial Next route wrapper for mint drafts |
| `packages/orm/src/models/user-btd-balances.ts` | compatibility holding reads |
| `packages/orm/src/models/user-btd-transactions.ts` | compatibility holding history |
| `packages/orm/src/models/organization-btd-treasury.ts` | aggregate treasury read |
| `packages/orm/src/models/organization-btd-usage.ts` | placeholder usage owner |
| `packages/orm/src/models/asset-pack-evidence.ts` | AssetPack evidence storage-edge translation |
| `supabase/migrations/001_v26_production.sql` | V26 compatibility tables and RLS |
| `internal-docs/BITCODE_EXCHANGE_DATABASE.md` | Exchange DB note that needs V27 registry expansion |
| `protocol-demonstration/src/receipt-schemas.js` | current receipt family to extend |
| `protocol-demonstration/src/canonical/settlement.js` | current source-to-shares fit and settlement primitive |
| `protocol-demonstration/src/settlement-structs.js` | settlement participation structures |
| `apps/uapi/components/base/bitcode/btd/btd-tracker.tsx` | balance/acquisition intent widget |
| `apps/uapi/components/base/bitcode/btd/BTDPrices.tsx` | Terminal Read and minimal Exchange range acquisition split |
| `apps/uapi/app/auxillaries/components/AuxillariesBTDPane.tsx` | auxillary wallet and holding posture |
| `apps/uapi/app/(root)/components/MarketingBtdShareMetricsSection.tsx` | public 21M/read-right explanation |
| `apps/uapi/app/(root)/components/MarketingFaqSection.tsx` | public BTC vs `$BTD` distinction |
| `packages/executions-mcp/src/mcp-server/src/auth/middleware.ts` | aggregate holding gate for MCP authorization |
| future wallet integration module | V27 signer/session/network owner |
| future Bitcoin transaction module | V27 BTC fee payment, broadcast, and confirmation owner |
| future ledger anchor module | V27 AssetPack Bitcoin/Ethereum/internal anchor owner |
| future Exchange order module | V27 buy/sell/bid/ask and rights-transfer owner |
| future Terminal journal module | V27 transaction journal and diff owner |
| future reconciliation module | V27 ledger/database projection owner |
| future telemetry module | V27 crypto event taxonomy and alert owner |

## Immediate Implementation Queue

Completed implementation seeds:

- `packages/btd/src/constants.ts`
- `packages/btd/src/supply.ts`
- `packages/btd/src/range.ts`
- `packages/btd/src/semantic-volume.ts`
- `packages/btd/src/receipts.ts`
- `packages/btd/src/measuremint.ts`
- `packages/btd/src/access.ts`
- `packages/btd/src/allocation.ts`
- `packages/btd/src/ancestry.ts`
- `packages/btd/src/revenue.ts`
- `packages/btd/src/wallet.ts`
- `packages/btd/src/bitcoin-fees.ts`
- `packages/btd/src/bitcoin-provider.ts`
- `packages/btd/src/deployment-lanes.ts`
- `packages/btd/src/ledger-anchor.ts`
- `packages/btd/src/exchange.ts`
- `packages/btd/src/terminal-journal.ts`
- `packages/btd/src/reconciliation.ts`
- `packages/btd/src/replay.ts`
- `packages/btd/src/telemetry.ts`
- `packages/btd/src/upgrade.ts`
- `packages/btd/__tests__/v27-crypto-primitives.test.ts`
- `protocol-demonstration/src/v27-crypto-primitives.js`
- `protocol-demonstration/test/v27-crypto-primitives.test.js`
- `supabase/migrations/002_v27_btd_crypto_registry.sql`
- `packages/orm/src/models/btd-registry.ts`
- `packages/orm/src/client.ts`
- `packages/orm/src/__tests__/btd-registry.test.ts`
- `packages/api/src/routes/btd-crypto.ts`
- `packages/api/src/routes/__tests__/btd-crypto.test.ts`
- `apps/uapi/app/api/btd/registry/route.ts`
- `apps/uapi/app/api/btd/mint-draft/route.ts`
- `.bitcode/v27-crypto-primitives-proof.json`

Remaining queue:

1. Expand replay coverage into generated V27 proof families.
2. Integrate semantic-volume/range/mint admission into source-to-shares settlement.
3. Apply/test V27 migration and refresh generated Supabase types.
4. Broaden DB route-write tests from closed V27 registry rows into live migration execution and generated DB type refresh.
5. Add remaining range/policy UI disclosure surfaces beyond the current access route and Auxillary pane.
6. Add live wallet adapter UX and value-bearing PSBT provider credentials.
7. Add regtest and signet broadcaster/observer harnesses.
8. Connect production alert sinks and live value-bearing operator credentials.
9. Complete dispute holdback persistence and live route consumption.
10. Complete web research rebinding for selected crypto standards and libraries.

## Promotion Risk

The highest-risk V27 gap is not the cap.
The cap already exists.

The highest-risk gaps are:

- defining normalized Bitcode volume precisely enough to drive mint count;
- proving semantic-volume measurement resists byte/tokenizer/fragmentation inflation;
- moving from aggregate compatibility balances to registry cell/range state;
- proving live value-bearing BTC fee transactions and ledgerized AssetPack anchors beyond the closed receipt/provider boundary;
- rebinding selected crypto libraries from current primary-source research;
- reconciling external ledger finality with Bitcode database and private canonical facts;
- proving minimal Exchange transfers without reintroducing fungible `$BTD` balance semantics;
- avoiding legal overclaim in read-right UI;
- proving allocation conservation;
- keeping ancestry useful without creating rent-seeking by age or broad claims.
