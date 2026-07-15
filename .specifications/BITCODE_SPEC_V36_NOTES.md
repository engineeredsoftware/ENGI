# Bitcode Spec V36 Notes

## Status

- Version: `V36`
- V36 state: canonical promotion complete; V36 notes record the accepted Exchange activity, intent, rights transfer, pricing, settlement, repair, UX, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V36`
- Canonical proof-source commit: `8c3eddff851c79ceac5230974e7e1e757093fa37`
- Prior canonical anchor: `BITCODE_SPEC_V35.md`
- Prior generated proof appendix: `BITCODE_SPEC_V35_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v36-spec-family-report.json`, `.bitcode/v36-canonical-input-report.json`, `.bitcode/v36-canon-posture-drift-report.json`, `.bitcode/v36-exchange-activity-book.json`, `.bitcode/v36-exchange-intent-order-contracts.json`, `.bitcode/v36-exchange-rights-transfer-review.json`, `.bitcode/v36-pricing-liquidity-fee-quote.json`, `.bitcode/v36-exchange-settlement-reconciliation.json`, `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, `.bitcode/v36-exchange-ux-proof.json`, `.bitcode/v36-exchange-rehearsal.json`, `.bitcode/v36-promotion-readiness-report.json`, V36 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V36_PROVEN.md` as the generated proof appendix for V36 promotion
- Source parity state: V36 source-side Exchange activity book, intent/order contracts, rights-transfer preview, pricing quote, settlement reconciliation, dispute repair and revenue route, UX proof, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V36 file family
- Spec companion: `BITCODE_SPEC_V36.md`
- Delta companion: `BITCODE_SPEC_V36_DELTA.md`
- Parity companion: `BITCODE_SPEC_V36_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md` only after V36 promotion
- Scope: V36 canonical notes for Exchange depth over promoted V35 telemetry and documentation canon
- Last fully realized canonical target preserved in source: `V36`

## Notes companion rule

This file records working notes for the V36 draft target.
Requirements become binding when copied into `BITCODE_SPEC_V36.md`, `BITCODE_SPEC_V36_DELTA.md`, `BITCODE_SPEC_V36_PARITY_MATRIX.md`, checker scripts, package contracts, tests, or generated artifacts.

## Concise current-system reading

V35 is active canon.
V36 opens Exchange depth without changing Reading, BTD tokenomics, BTC fee separation, deployment law, telemetry/documentation law, or source disclosure law.

Exchange must operate as a market surface over rights and source-safe previews.
It must not become a hidden tokenomics rewrite, a source leakage path, or a database-first settlement system.

## Simplified-spec reading rule

Read V36 as:

1. The active system is V35.
2. V36 adds auditable Exchange product behavior.
3. Exchange actions manipulate market intents, orders, rights-transfer previews, settlement receipts, dispute/repair cases, and revenue routes.
4. BTD range identity remains non-fungible source-share law.
5. Protected source remains hidden before paid settlement.
6. Ledger truth remains stronger than database projection.

## Exchange depth notes

- Market activity needs master-detail clarity: a collapsed row should be enough for status, while expanded detail must include proof roots, safe metadata, and repair posture.
- Buy/sell/bid/ask/cancel/accept/settle/history actions must be typed intents, not route-local ad hoc payloads.
- Pricing must be deterministic and auditable. Initial design uses measurement weight times measurement volume as a source factor, then folds liquidity, fee, and policy factors into a BTC quote root.
- Wrapper analysis is allowed only as analysis. A wrapper cannot become the chain-of-record for BTD ownership.
- Rights-transfer preview must clearly separate current owner, prospective buyer, BTD range identity, source-safe measurements, quote roots, settlement posture, and post-settlement delivery.
- Dispute and repair posture must exist before optimistic market UX is considered complete.

## V36 gate plan

1. Gate 1: V36 Exchange Roadmap And Spec Opening.
2. Gate 2: Exchange Activity Book And Market Master Detail.
3. Gate 3: Buy Sell Bid Ask Cancel Accept Intent Contracts.
4. Gate 4: AssetPack Range Trading And Rights Transfer Review.
5. Gate 5: Pricing Liquidity Fee Quote And Wrapper Analysis.
6. Gate 6: Exchange Settlement Ledger Database Reconciliation.
7. Gate 7: Dispute Repair Revenue Route Operations.
8. Gate 8: Exchange UX And Terminal Navigation Integration.
9. Gate 9: Local Staging Exchange Rehearsal And Proof Coverage.
10. Gate 10: V36 Promotion Readiness.

## Gate 10 closure notes

Gate 10 closes when `ExchangePromotionReadinessReport` is package-owned and
generated through `.bitcode/v36-promotion-readiness-report.json`.
The generated artifact carries
`source-safe-exchange-promotion-readiness-metadata`, covers every V36 Exchange
artifact, proves promotion workflow and proof appendix support, and records that
promotion rewrites runtime posture to active V36 / draft V37 only after
validation succeeds.

## Gate 1 working notes

Gate 1 closes when:

- V36 SPEC, DELTA, NOTES, and PARITY files exist;
- `BITCODE_SPEC.txt` remains `V35`;
- roadmap status marks V35 active and V36 draft;
- README, protocol package README, demonstration README, and PR template name V36 workflow;
- gate-quality and canon-quality workflows understand V36 draft posture;
- `check:v36-gate1` passes locally and in CI.

## Gate 2 closure notes

Gate 2 closes when `ExchangeActivityBook` is package-owned and generated
through `.bitcode/v36-exchange-activity-book.json`.
The generated artifact carries `source-safe-exchange-activity-book-metadata`,
listing/bid/ask/cancellation/acceptance/settlement/repair/revenue route/history
coverage, filter ids, detail sections, proof roots, event ids, source-safe
principal references, ledger/database projection references, and redaction
posture.
The activity detail never exposes protected source or unpaid AssetPack content;
it is a source-safe market row and detail contract for later Exchange UI and API
consumers.

## Gate 3 closure notes

Gate 3 closes when `ExchangeIntent` and `ExchangeOrder` are package-owned and
generated through `.bitcode/v36-exchange-intent-order-contracts.json`.
The generated artifact carries
`source-safe-exchange-intent-order-contract-metadata`, buy/sell/bid/ask/cancel/
accept/settle/history coverage, required intent fields, required order fields,
transition ids, actor principals, organization roles, wallet posture, authority
proofs, idempotency keys, policy decisions, fail-closed results, proof roots,
event ids, ledger journal refs, database projection refs, and repair posture.
The order history is replayable without private wallet material or secrets.
The intent/order contract never exposes protected source, unpaid AssetPack
source, private wallet material, provider tokens, protected prompts, protected
model responses, private buyer repository payloads, or secret values.

## Gate 4 closure notes

Gate 4 closes when `ExchangeRightsTransferPreview` is package-owned and
generated through `.bitcode/v36-exchange-rights-transfer-review.json`.
The generated artifact carries
`source-safe-exchange-rights-transfer-review-metadata`, BTD range identity,
current owner, requested buyer, rights scope, settlement unlock condition,
disclosure limit, source visibility, authority posture, proof roots, event ids,
ledger/database projection refs, and fail-closed conditions.
AssetPack source is hidden until paid settlement and rights transfer are complete.
The preview states distinguish owner-read, licensed-read, and blocked transfer so Exchange can show enough rights-transfer confidence without leaking source or
admitting payment/delivery for stale ownership, missing authority, policy denial,
or missing transfer receipts.

## Gate 5 closure notes

Gate 5 closes when `ExchangePricingQuote` is package-owned and generated
through `.bitcode/v36-pricing-liquidity-fee-quote.json`.
The generated artifact carries `source-safe-exchange-pricing-quote-metadata`,
BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, quote root, proof
roots, event ids, ledger/database projection refs, and fail-closed conditions.
wrapper analysis cannot make BTD range cells fungible chain-of-record assets;
the BTD range ledger journal remains the ownership and range identity record.
underpayment, overpayment, stale quote, or unsupported network posture fails closed so settlement cannot continue with mismatched payment, expired price,
or unsupported network state.

## Gate 6 closure notes

Gate 6 closes when `ExchangeSettlementReceipt` is package-owned and generated
through `.bitcode/v36-exchange-settlement-reconciliation.json`.
The generated artifact carries
`source-safe-exchange-settlement-reconciliation-metadata` and binds payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id.
observers and repair jobs reconcile database projections to ledger truth.
settlement finality and delivery are auditable.
Delivery remains blocked until paid finality, rights-transfer receipt,
projection synchronization, object-storage projection, and delivery state are
all source-safe and proof-rooted.

## Gate 7 closure notes

Gate 7 closes when `ExchangeDisputeRepairCase` and `ExchangeRevenueRoute` are
package-owned and generated through
`.bitcode/v36-exchange-dispute-repair-revenue-route.json`.
The generated artifact carries
`source-safe-exchange-dispute-repair-revenue-route-metadata`.
`ExchangeDisputeRepairCase` covers stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch.
`ExchangeRevenueRoute` covers depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof.
runbooks and repair commands are source-safe and proof-rooted.
Dispute and revenue artifacts remain source-safe: they expose roots, public
principal ids, status, commands, routes, and proof posture, not protected source,
unpaid AssetPack source, private payment credentials, or wallet private
material.

## Gate 8 closure notes

Gate 8 closes when `ExchangeUxProof` is package-owned and generated through
`.bitcode/v36-exchange-ux-proof.json`.
The generated artifact carries `source-safe-exchange-ux-proof-metadata`.
`ExchangeUxProof` covers market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state.
Terminal can hand off to Exchange without losing transaction context.
collapsed UI gives readable status and expanded UI exposes source-safe detail.
Exchange telemetry dashboards remain source-safe and proof-rooted.
Exchange UX artifacts remain source-safe: they expose route state, filter state,
transaction identity, order history, rights-transfer preview, pricing quote,
settlement state, repair state, proof roots, event ids, and redaction posture,
not protected source, unpaid AssetPack source, wallet private material, provider
tokens, protected prompts, protected model responses, buyer private repository
payloads, or secret values.

## Gate 9 closure notes

Gate 9 closes when `ExchangeRehearsal` is package-owned and generated through
`.bitcode/v36-exchange-rehearsal.json`.
The generated artifact carries `source-safe-exchange-rehearsal-metadata`.
`ExchangeRehearsal` proves that local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows.
It proves that rehearsal logs/screenshots are source-safe.
It also proves that ledger/database synchronization and value-bearing mainnet blocking are visible.
Exchange rehearsal artifacts remain source-safe: they expose rehearsal ids,
lane ids, flow ids, event ids, proof roots, ledger/database synchronization
checks, validation commands, redacted log/screenshot roots, source evidence,
and summary counts, not protected source, unpaid AssetPack source, wallet
private material, private payment credentials, object-storage private bytes,
provider tokens, protected prompts, protected model responses, buyer private
repository payloads, or secret values.

## Accepted boundaries

- V36 owns deeper Exchange.
- V37 owns website Conversations.
- V36 does not authorize value-bearing production-mainnet launch.
- V36 does not redefine BTD supply, BTC fee separation, AssetPack range identity, owner-read/licensed-read law, measureminting, ancestry, or Reading pipeline product law.
- Exchange must not expose protected AssetPack source before settlement.
