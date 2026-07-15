# Bitcode Exchange Database Notes

Status: non-canonical internal note. V27 is active canon; this note mirrors the V27 registry and Exchange database posture for implementation review.

## Purpose

The database supports Bitcode Exchange and Bitcode Terminal state:
- identity and readiness,
- source connections,
- conversations and attachments,
- executions and event streams,
- Read review state,
- AssetPack outputs,
- proof and settlement receipts,
- BTC fee accounting and non-fungible `$BTD` holding reads,
- notifications and operational health.

## Source Of Truth

- SQL migrations live under `supabase/migrations/`.
- ORM/database types live under `packages/orm/*`.
- Supabase access lives under `packages/supabase/*` and server route owners.
- Application code should import database types rather than re-declare table shapes.

## Current Storage Families

Core V26 families:
- user profile, auth, onboarding, wallet/readiness state,
- user/provider connections and VCS repository cache,
- conversations, messages, and attachments,
- executions, execution events, and phase executions,
- generated assets and postprocessed execution output,
- BTC fee usage, measured `$BTD` amount, and payment idempotency records,
- notifications, events, stream logs, and error logs.

Some physical table names still preserve compatibility vocabulary at the storage boundary. In V26 product language these rows must be read as AssetPack templates, AssetPack results, execution records, or compatibility storage corridors. Canonical SPEC text must not teach those table names as product concepts.

## Exchange State Requirements

The Exchange state model must support:
- immediate reread of Terminal writes,
- one activity ledger for source-to-shares events,
- selected-detail reconstruction of Read, fit, AssetPack, proof, history, and delivery evidence,
- explicit accept/reject/remeasure decisions for measured Reads,
- settlement receipts with quantized fit-quality rows,
- fail-closed write admission when wallet, repository, provider, or accepted-Read readiness is absent.

## Schema Reform Requirements

Remaining database work should prioritize:
- eliminating stale null-key drift,
- naming new columns/tables after Read, AssetPack, fit, settlement, Finish, and Exchange activity,
- keeping storage-edge table names hidden behind ORM or route adapters,
- generating proof artifacts that show schema, ORM, route, and UI all describe the same Bitcode state.

## V27 BTD Registry And Crypto Projection

V27 introduces `supabase/migrations/002_v27_btd_crypto_registry.sql` as the draft registry/projection migration for cryptographic Bitcode.

The V27 tables are:
- `btd_supply_state`
- `btd_semantic_volume_measurements`
- `btd_measure_mint_receipts`
- `btd_asset_pack_ranges`
- `btd_cells`
- `btd_ownership_events`
- `btd_read_licenses`
- `btd_mint_receipts`
- `btd_contributor_allocations`
- `btd_ancestor_edges`
- `btd_licensed_read_revenue_routes`
- `btc_fee_transactions`
- `btd_asset_pack_ledger_anchors`
- `btd_exchange_orders`
- `btd_rights_transfer_receipts`
- `btd_terminal_journal_entries`
- `btd_ledger_database_reconciliation_repairs`
- `btd_protocol_upgrade_receipts`
- `btd_crypto_telemetry_events`

Required database truths:
- `btd_supply_state.max_supply` is exactly `21000000`.
- `btd_supply_state.next_token_id` equals `total_minted` for the V27 contiguous allocator.
- `btd_supply_state` carries cumulative admitted measurement, residual mint credit, hyperbolic saturation curve, curve parameter, and zero-cell/refit tail policy.
- `btd_measure_mint_receipts` records the decayed issuance target before/after each admitted measurement and permits zero-cell receipts in the practical tail.
- `btd_asset_pack_ranges` owns canonical AssetPack ranges and enforces non-empty ranges under the cap.
- `btd_cells` owns token-level registry identity and points back to AssetPack ranges.
- `btd_ownership_events` projects mint allocation and rights-transfer ownership movement from receipts and ledger anchors.
- `btd_read_licenses` projects scoped licensed-read grants without implying `$BTD` ownership transfer.
- `btd_contributor_allocations` preserves whole-cell allocation conservation for the minted range.
- `btd_ancestor_edges` records late-bound non-supply dependency evidence; low-confidence, citation-only, disclosed-conflict, duplicate-source, reciprocal-loop, dependency-cycle, and claimant/reviewer-conflict outcomes remain auditable without changing supply.
- `btd_licensed_read_revenue_routes` routes BTC sats locally across holders, admitted ancestors, treasury, explicit dispute holdback custody, and pending/failed route metadata.
- `btc_fee_transactions.fee_asset` is always `BTC`; `server_custody` is always `false`; wallet authorization proof, PSBT/signed handoff state, txid, sats, Exchange sequence, and Terminal journal root remain in the receipt projection.
- ledger anchors store commitments and finality projection only; ledgers remain source of truth for cryptographic finality.
- Exchange orders and rights-transfer receipts use BTC prices and access-policy hashes; rights-transfer receipts require non-empty BTC fee and ledger-anchor evidence before ownership projection can move.
- Terminal journal rows constrain the V27 transaction-family set and positive Exchange sequence; journal diffs and reconciliation repairs are projection/proof surfaces that prevent UI or API state from claiming unsupported finality. Reconciliation treats confirmed, reorged, and failed ledger facts as blocking truth when projections disagree, while private/metaphysical canonical database facts must remain hash-bound by canonical roots or receipt roots.
- `btd_protocol_upgrade_receipts` records deployment/migration state roots, approvals, rollback roots, and network scope.
- `btd_crypto_telemetry_events` stores classified operational events from the deployment-readiness boundary; production alert sinks consume this projection and do not define tokenomics truth.
- V27 registry tables enable row-level security without user-facing policies; writes are expected through service-role route/worker boundaries until a narrower policy set is specified.
- `user_credits` and `user_credit_usages` are compatibility read corridors only. They are not canonical tokenomics truth, cannot mint `$BTD`, and cannot settle AssetPack rights.

`packages/orm/src/models/btd-registry.ts` is the V27 ORM boundary until generated Supabase types are refreshed from the migration.
`packages/api/src/routes/btd-crypto.ts` reads registry snapshots, produces deterministic mint/access/settlement projections, and commit-gates V27 registry writes for revenue, ancestry, BTC fee transactions, AssetPack anchors, and minimal AssetPack Exchange receipts.
