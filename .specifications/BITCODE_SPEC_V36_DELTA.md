# Bitcode Spec V36 Delta

## Status

- Version: `V36`
- V36 state: canonical promotion complete; this delta records the promoted V35-to-V36 Exchange depth closure set
- Current canonical/latest target: `V36`
- Canonical proof-source commit: `8c3eddff851c79ceac5230974e7e1e757093fa37`
- Prior canonical anchor: `BITCODE_SPEC_V35.md`
- Prior generated proof appendix: `BITCODE_SPEC_V35_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v36-spec-family-report.json`, `.bitcode/v36-canonical-input-report.json`, `.bitcode/v36-canon-posture-drift-report.json`, `.bitcode/v36-exchange-activity-book.json`, `.bitcode/v36-exchange-intent-order-contracts.json`, `.bitcode/v36-exchange-rights-transfer-review.json`, `.bitcode/v36-pricing-liquidity-fee-quote.json`, `.bitcode/v36-exchange-settlement-reconciliation.json`, `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, `.bitcode/v36-exchange-ux-proof.json`, `.bitcode/v36-exchange-rehearsal.json`, `.bitcode/v36-promotion-readiness-report.json`, V36 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V36_PROVEN.md` as the generated proof appendix for V36 promotion
- Source parity state: V36 source-side Exchange activity book, intent/order contracts, rights-transfer preview, pricing quote, settlement reconciliation, dispute repair and revenue route, UX proof, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V36 file family
- Spec companion: `BITCODE_SPEC_V36.md`
- Notes companion: `BITCODE_SPEC_V36_NOTES.md`
- Parity companion: `BITCODE_SPEC_V36_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md` only after V36 promotion
- Scope: V36 canonical delta for Exchange depth over promoted V35 telemetry and documentation canon

## Why V36 exists

V35 promoted telemetry and documentation depth.
That made Bitcode understandable, supportable, observable, and testnet-rollout ready.

V36 exists because Bitcode now needs the Exchange surface to become real product law instead of deferred posture.
Exchange must let enterprise users inspect market-wide activity, list or request rights transfers, buy, sell, bid, ask, cancel, accept, settle, and inspect history while preserving BTC fee separation, non-fungible BTD range identity, source-safe AssetPack previews, settlement finality, repair paths, and ledger/database synchronization.

## Accepted V36 decisions

- V35 remains active canon during V36 drafting.
- V36 gate branches are opened from `version/v36` and merged back only when their gate acceptance criteria are closed.
- V36 owns deeper Exchange: `ExchangeActivityBook`, `ExchangeIntent`, `ExchangeOrder`, `ExchangeRightsTransferPreview`, `ExchangePricingQuote`, `ExchangeSettlementReceipt`, `ExchangeDisputeRepairCase`, and `ExchangeRevenueRoute`.
- Exchange contracts must be package-owned before they are exposed by route handlers, UI state, dashboards, runbooks, MCP tools, ChatGPT App actions, public docs, or generated artifacts.
- Exchange previews disclose measurements, roots, rights posture, fee quote roots, owner posture, settlement state, and denial reasons; they must not disclose protected source, raw protected prompts, wallet private material, secrets, or unpaid AssetPack contents.
- Ledger records and journals remain source-of-truth for ownership, settlement, and finality; database projections are repairable projections.
- Exchange pricing may include measurement weights, measurement volume, liquidity bands, wrapper analysis, and BTC fee quotes only through deterministic auditable quote roots.

## Explicitly deferred

- V37 owns website Conversations product behavior.
- Production-mainnet value-bearing launch remains explicitly blocked until a future promoted canon admits it.
- Bridge chain-of-record implementation remains out of V36.
- V36 does not reopen BTD supply law, Reading pipeline product law, V34 deployment law, V35 telemetry/docs law, or AssetPack source disclosure law.

## Pre-Implementation Sequence

1. Open `version/v36` from promoted `main`.
2. Open `v36/gate-1-exchange-roadmap-opening` from `version/v36`.
3. Create the V36 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V35`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V35 is active canon, V36 is draft target, and V37 scope remains coherent.
5. Retarget gate-quality and canon-quality workflow posture checks to V35 active / V36 draft.
6. Add `check:v36-gate1` and a V36 Gate 1 checker.
7. Define V36 gates, acceptance criteria, carryforward parity rows, and post-V36 roadmap responsibilities.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v36`.

## Commit-Body Direction

V36 gate commit bodies should describe the closed gate, specification changes, implementation surfaces, tests, proof commands, and accepted boundaries.
The eventual V36 promotion commit body must name all closed V36 gates, generated Exchange proof artifacts, settlement/reconciliation evidence, UI proof, public/internal documentation evidence, telemetry/runbook evidence, local/staging rehearsal proof, and the `BITCODE_SPEC.txt` pointer change from `V35` to `V36`.
It must explicitly defer V37 Conversations depth, bridge chain-of-record implementation, and value-bearing mainnet launch.

## Gate Delta

### Gate 1: V36 Exchange Roadmap And Spec Opening

Gate 1 opens V36 correctly:

- V36 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V35`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V35 active / V36 draft posture.
- `check:v36-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, Exchange vocabulary, and promotion boundaries.
- The V36 gate list is explicit before Exchange implementation begins.

### Gate 2: Exchange Activity Book And Market Master Detail

Gate 2 inventories source-safe market activity.

Closure acceptance:

- `ExchangeActivityBook` owns market-wide activity rows, filters, detail payloads, proof roots, event ids, and redaction posture;
- activity rows cover listings, bids, asks, cancellations, acceptances, settlements, repairs, revenue routes, and history entries;
- activity detail never exposes protected source or unpaid AssetPack content;
- `.bitcode/v36-exchange-activity-book.json` is generated from the package-owned builder with `source-safe-exchange-activity-book-metadata`;
- `pnpm run check:v36-gate2` validates package source, artifact freshness, package tests, docs, workflow wiring, source-safety, proof roots, event ids, filters, details, and ledger/database projection posture.

### Gate 3: Buy Sell Bid Ask Cancel Accept Intent Contracts

Gate 3 defines market action envelopes.

Closure acceptance:

- `ExchangeIntent` and `ExchangeOrder` own buy, sell, bid, ask, cancel, accept, settle, and history transition contracts;
- each transition names actor, organization role, wallet posture, authority proof, idempotency key, policy decision, and fail-closed result;
- order history is replayable without private wallet material or secrets;
- `.bitcode/v36-exchange-intent-order-contracts.json` is generated from the package-owned builder with `source-safe-exchange-intent-order-contract-metadata`;
- `pnpm run check:v36-gate3` validates package source, artifact freshness, package tests, docs, workflow wiring, action-kind coverage, transition coverage, authority, idempotency, policy, fail-closed, replay, source-safety, and ledger/database projection posture.

### Gate 4: AssetPack Range Trading And Rights Transfer Review

Gate 4 defines rights-transfer preview.

Closure acceptance:

- `ExchangeRightsTransferPreview` names BTD range identity, current owner, requested buyer, rights scope, settlement unlock condition, and disclosure limit;
- AssetPack source is hidden until paid settlement and rights transfer are complete;
- previews distinguish owner-read, licensed-read, and blocked transfer states;
- `.bitcode/v36-exchange-rights-transfer-review.json` is generated from the package-owned builder with `source-safe-exchange-rights-transfer-review-metadata`;
- `pnpm run check:v36-gate4` validates package source, artifact freshness, package tests, docs, workflow wiring, BTD range identity, current owner, requested buyer, rights scope, settlement unlock, disclosure limits, source-safety, owner-read, licensed-read, blocked transfer, proof roots, event ids, and ledger/database projection posture.

### Gate 5: Pricing Liquidity Fee Quote And Wrapper Analysis

Gate 5 defines deterministic price and fee roots.

Closure acceptance:

- `ExchangePricingQuote` includes BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, and quote root;
- wrapper analysis cannot make BTD range cells fungible chain-of-record assets;
- underpayment, overpayment, stale quote, or unsupported network posture fails closed;
- `.bitcode/v36-pricing-liquidity-fee-quote.json` is generated from the package-owned builder with `source-safe-exchange-pricing-quote-metadata`;
- `pnpm run check:v36-gate5` validates package source, artifact freshness, package tests, docs, workflow wiring, BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury/depositor/reader routes, quote roots, wrapper non-fungibility, payment mismatch closure, stale quote closure, unsupported network closure, source-safety, proof roots, event ids, and ledger/database projection posture.

### Gate 6: Exchange Settlement Ledger Database Reconciliation

Gate 6 synchronizes settlement.

Closure acceptance:

- `ExchangeSettlementReceipt` binds payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id;
- observers and repair jobs reconcile database projections to ledger truth;
- settlement finality and delivery are auditable;
- `.bitcode/v36-exchange-settlement-reconciliation.json` is generated from the package-owned builder with `source-safe-exchange-settlement-reconciliation-metadata`;
- `pnpm run check:v36-gate6` validates package source, artifact freshness, package tests, docs, workflow wiring, payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, repair id, observer jobs, repair jobs, projection reconciliation to ledger truth, delivery auditability, source-safety, proof roots, and event ids.

### Gate 7: Dispute Repair Revenue Route Operations

Gate 7 turns failure into operator action.

Closure acceptance:

- `ExchangeDisputeRepairCase` covers stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch;
- `ExchangeRevenueRoute` covers depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof;
- runbooks and repair commands are source-safe and proof-rooted.
- `.bitcode/v36-exchange-dispute-repair-revenue-route.json` is generated from the package-owned builder with `source-safe-exchange-dispute-repair-revenue-route-metadata`;
- `pnpm run check:v36-gate7` validates package source, artifact freshness, package tests, docs, workflow wiring, dispute coverage, revenue route coverage, repair commands, verification commands, proof-rooted runbooks, escalation paths, conservation proofs, source-safety, proof roots, and event ids.

### Gate 8: Exchange UX And Terminal Navigation Integration

Gate 8 makes Exchange usable.

Closure acceptance:

- `/exchange` exposes market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state;
- Terminal can hand off to Exchange without losing transaction context;
- collapsed UI gives readable status and expanded UI exposes source-safe detail.
- Exchange telemetry dashboards remain source-safe and proof-rooted.
- `.bitcode/v36-exchange-ux-proof.json` is generated from the package-owned `ExchangeUxProof` builder with `source-safe-exchange-ux-proof-metadata`;
- `pnpm run check:v36-gate8` validates package source, artifact freshness, package tests, route handoff tests, docs, workflow wiring, master-detail UX, filters, order history, rights-transfer review, pricing quote, settlement state, repair state, Terminal handoff, collapsed/expanded disclosure, telemetry binding, proof roots, and event ids.

### Gate 9: Local Staging Exchange Rehearsal And Proof Coverage

Gate 9 proves Exchange locally and in staging-testnet.

Closure acceptance:

- `ExchangeRehearsal` is package-owned by `@bitcode/protocol`;
- local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows;
- rehearsal logs/screenshots are source-safe;
- ledger/database synchronization and value-bearing mainnet blocking are visible;
- `.bitcode/v36-exchange-rehearsal.json` is generated from the package-owned `ExchangeRehearsal` builder with `source-safe-exchange-rehearsal-metadata`;
- `pnpm run check:v36-gate9` validates package source, artifact freshness, package tests, docs, workflow wiring, local lane flow coverage, staging-testnet lane flow coverage, source-safe logs/screenshots, ledger/database synchronization checks, proof roots, and blocked value-bearing mainnet posture.

### Gate 10: V36 Promotion Readiness

Gate 10 owns final generated proof, promotion workflow support, source-safe `.bitcode/v36-promotion-readiness-report.json`, and V36 closure.

Closure acceptance:

- V36 promotion checks validate all Exchange artifacts, contracts, UI proof, telemetry/docs/runbook bindings, settlement/reconciliation evidence, repair evidence, rehearsal proof, and generated proof appendix support;
- `.bitcode/v36-promotion-readiness-report.json` is generated from the package-owned `ExchangePromotionReadinessReport` builder with `source-safe-exchange-promotion-readiness-metadata`;
- promotion scripts support V36 command planning, dry-run, generated proof output, and derived promotion commit body generation;
- promotion rewrites runtime posture to active V36 / draft V37 only after validations pass.

## Delta completion condition

This delta is complete for Gate 1 when `version/v36` contains the V36 spec family, roadmap posture, workflow posture, README/package docs posture, PR template title guidance, `check:v36-gate1`, and validations proving V35 active / V36 draft readiness.
