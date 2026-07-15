# Bitcode Spec V36

## Status

- Version: `V36`
- V36 state: canonical promotion complete; V36 is the active Exchange depth canon and the V36 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V36`
- Canonical proof-source commit: `8c3eddff851c79ceac5230974e7e1e757093fa37`
- Prior canonical anchor: `BITCODE_SPEC_V35.md`
- Prior generated proof appendix: `BITCODE_SPEC_V35_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v36-spec-family-report.json`, `.bitcode/v36-canonical-input-report.json`, `.bitcode/v36-canon-posture-drift-report.json`, `.bitcode/v36-exchange-activity-book.json`, `.bitcode/v36-exchange-intent-order-contracts.json`, `.bitcode/v36-exchange-rights-transfer-review.json`, `.bitcode/v36-pricing-liquidity-fee-quote.json`, `.bitcode/v36-exchange-settlement-reconciliation.json`, `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, `.bitcode/v36-exchange-ux-proof.json`, `.bitcode/v36-exchange-rehearsal.json`, `.bitcode/v36-promotion-readiness-report.json`, V36 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V36_PROVEN.md` as the generated proof appendix for V36 promotion
- Source parity state: V36 source-side Exchange activity book, intent/order contracts, rights-transfer preview, pricing quote, settlement reconciliation, dispute repair and revenue route, UX proof, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V36 file family
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V35`
- Notes companion: `BITCODE_SPEC_V36_NOTES.md`
- Delta companion: `BITCODE_SPEC_V36_DELTA.md`
- Parity companion: `BITCODE_SPEC_V36_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md` only after V36 promotion
- Scope: V36 canonical system specification for Exchange depth over promoted activity book, intent/order, rights-transfer, pricing, settlement, dispute repair, revenue route, UX, rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V36`

## Version executive summary

V36 is the Exchange-depth version.
It opens Bitcode's market surface after the Terminal, Reading, BTD, interface, deployment, telemetry, and documentation spine has been promoted through V35.
V36 turns Exchange from deferred commercial posture into auditable product law for market-wide activity, buy and sell intent, bid and ask flows, cancel and accept paths, settlement history, AssetPack range trading, BTD rights-transfer review, pricing and liquidity analysis, dispute repair, revenue routing, and Exchange-specific validation.

V36 closes only when Exchange can expose a source-safe, proof-rooted, ledger-synchronized market experience without weakening Bitcode's non-fungible BTD source-share law, BTC fee separation, AssetPack disclosure boundary, paid read/right transfer, or value-bearing mainnet block.

## V36 Exchange spine

V36 adds Exchange contract objects over inherited V35 canon:

- `ExchangeActivityBook`: market-wide activity master-detail rows, filters, proof roots, redaction posture, source-safety class, and ledger/database projection references.
- `ExchangeIntent`: buy, sell, bid, ask, cancel, accept, settle, and history intent envelopes with principal, authority, policy, source-safe preview, and failure posture.
- `ExchangeOrder`: order state for BTD range or AssetPack rights transfer without fungibilizing the underlying source-share cells.
- `ExchangeRightsTransferPreview`: source-safe rights-transfer review, buyer/depositor authority posture, current owner, range identity, settlement quote root, and disclosure limit.
- `ExchangePricingQuote`: deterministic price, fee, volume, measurement-weight, liquidity, wrapper, and BTC settlement analysis.
- `ExchangeSettlementReceipt`: ledger/database/object-storage synchronized settlement and finality receipt for market activity.
- `ExchangeDisputeRepairCase`: dispute, projection drift, underpayment, overpayment, cancelled-order replay, stale ownership, and failed delivery repair posture.
- `ExchangeRevenueRoute`: depositor, reader, treasury, fee, and revenue accounting route that preserves BTC fee separation and BTD range identity.

V36 does not replace V35 telemetry/documentation contracts.
It extends them so Exchange events, dashboards, public docs, operator runbooks, and incident paths derive from package-owned market contracts.

## V36 Gate 2 ExchangeActivityBook canon

Gate 2 implements `ExchangeActivityBook` as the package-owned source of market
activity truth for Exchange master-detail surfaces.
`ExchangeActivityBook` emits `.bitcode/v36-exchange-activity-book.json` with
`source-safe-exchange-activity-book-metadata`, deterministic activity row roots,
deterministic activity detail roots, required filter ids, event ids, proof
roots, ledger/database projection references, and redaction posture.
The activity detail never exposes protected source or unpaid AssetPack content;
it only exposes source-safe activity identity, summaries, measurements, proof
roots, rights and settlement posture, repair posture, revenue posture, and
ledger/database projection references.

The Gate 2 activity coverage is listing, bid, ask, cancellation, acceptance,
settlement, repair, revenue route, and history entry.
Each row binds an AssetPack id, BTD range id, source-safe principal references,
event ids, proof-root fields, detail sections, and fail-closed conditions for
missing proof roots, missing event ids, protected source visibility, unpaid
AssetPack source visibility, and ledger/database projection drift.

## V36 Gate 3 ExchangeIntent And ExchangeOrder canon

Gate 3 implements `ExchangeIntent` and `ExchangeOrder` as the package-owned
contracts for market action envelopes and order transitions.
`ExchangeIntent` owns source-safe buy, sell, bid, ask, cancel, accept, settle,
and history intent fields: actor principal, organization role, wallet posture,
authority proof, idempotency key, policy decision, target order, target BTD
range, source-safe preview, and fail-closed result.
`ExchangeOrder` owns the matching transition state: order identity, AssetPack
id, BTD range id, rights scope, current owner, order state, transition id,
history root, ledger journal reference, database projection reference, and
repair posture.

Gate 3 emits `.bitcode/v36-exchange-intent-order-contracts.json` with
`source-safe-exchange-intent-order-contract-metadata`.
Each transition names actor, organization role, wallet posture, authority proof,
idempotency key, policy decision, and fail-closed result before order mutation.
The order history is replayable without private wallet material or secrets; it
uses source-safe transition ids, intent roots, order roots, authority roots,
policy roots, idempotency roots, ledger journal refs, database projection refs,
and event ids.
The generated contract forbids protected source, unpaid AssetPack source,
wallet private material, provider tokens, raw protected prompts, raw protected
model responses, private buyer repository payloads, and secret values.
Ledger journal state remains stronger than database projection state for
Exchange order history and settlement/finality.

## V36 Gate 4 ExchangeRightsTransferPreview canon

Gate 4 implements `ExchangeRightsTransferPreview` as the package-owned contract
for AssetPack range trading and BTD rights-transfer review.
`ExchangeRightsTransferPreview` names BTD range identity, current owner,
requested buyer, rights scope, settlement unlock condition, disclosure limit,
source visibility, authority posture, proof roots, ledger/database projection
references, and fail-closed conditions before any source-bearing transfer can
be shown or settled.

Gate 4 emits `.bitcode/v36-exchange-rights-transfer-review.json` with
`source-safe-exchange-rights-transfer-review-metadata`.
AssetPack source is hidden until paid settlement and rights transfer are complete.
The preview may expose source-safe preview identity, AssetPack id, BTD
range identity, principal ids, rights scope, settlement unlock condition,
disclosure limit, proof roots, event ids, ledger/database projection refs, and
fail-closed conditions; it must not expose protected source, unpaid AssetPack
source, wallet private material, provider tokens, protected prompts, protected
model responses, private buyer repository payloads, or secret values.

The Gate 4 preview states distinguish owner-read, licensed-read, and blocked transfer.
Owner-read represents the current owner reviewing owned rights while
the Exchange preview itself stays source-safe. Licensed-read represents a buyer
or reader who may receive source only after paid BTC settlement and a BTD
read/right receipt. Blocked transfer represents stale ownership, missing
authority, policy denial, missing rights-transfer receipt, or projection drift
and admits no payment or delivery until repaired.
Ledger journal state remains stronger than database projection state for
rights-transfer preview, owner truth, and unlock state.

## V36 Gate 5 ExchangePricingQuote canon

Gate 5 implements `ExchangePricingQuote` as the package-owned deterministic
pricing contract for Exchange quote review.
`ExchangePricingQuote` names quote identity, quote state, AssetPack id, BTD
range identity, BTC amount, measurement weight, measurement volume, liquidity
band, wrapper analysis, treasury route, depositor route, reader route, quote
root, network posture, settlement window, fail-closed conditions, proof roots,
event ids, and ledger/database projection references before settlement can
continue.

Gate 5 emits `.bitcode/v36-pricing-liquidity-fee-quote.json` with
`source-safe-exchange-pricing-quote-metadata`.
The deterministic quote basis includes measurement weight, measurement volume, liquidity band, wrapper analysis, BTC amount, treasury route, depositor route, reader route, and quote root.
The source-safe quote may expose quote identity, AssetPack id, BTD range
identity, BTC amount, measurement metadata, liquidity metadata, wrapper
metadata, route metadata, proof roots, event ids, ledger/database projection
refs, and fail-closed conditions; it must not expose protected source, unpaid
AssetPack source, wallet private material, provider tokens, protected prompts,
protected model responses, private payment credentials, private buyer
repository payloads, or secret values.

wrapper analysis cannot make BTD range cells fungible chain-of-record assets.
BTD range cells remain non-fungible source-share identities whose chain of
record is the BTD range ledger journal, even when a wrapper is used for
pricing, review, transfer, or market UX metadata.
underpayment, overpayment, stale quote, or unsupported network posture fails closed.
Ledger journal state remains stronger than database projection state for quote
roots, settlement admission, payment matching, route allocation, and network
posture.

## V36 Gate 6 ExchangeSettlementReceipt canon

Gate 6 implements `ExchangeSettlementReceipt` as the package-owned settlement
and reconciliation contract for Exchange completion.
`ExchangeSettlementReceipt` binds payment observation, finality state, rights
transfer receipt, ledger root, database projection root, object storage root,
delivery state, repair id, observer jobs, reconciliation decision, proof roots,
and event ids before source-bearing delivery can be trusted.

Gate 6 emits `.bitcode/v36-exchange-settlement-reconciliation.json` with
`source-safe-exchange-settlement-reconciliation-metadata`.
The settlement binding is payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id.
The source-safe receipt may expose settlement identity, payment observation,
finality state, rights-transfer receipt identity, ledger root, database
projection root, object storage root, delivery state, repair id, observer jobs,
proof roots, and event ids; it must not expose protected source, unpaid
AssetPack source, wallet private material, provider tokens, protected prompts,
protected model responses, private payment credentials, private buyer
repository payloads, object-storage private bytes, or secret values.

observers and repair jobs reconcile database projections to ledger truth.
The ledger journal remains stronger than database and object-storage
projections; repair jobs may rewrite projections toward ledger truth but cannot
rewrite ledger truth toward projection convenience.
settlement finality and delivery are auditable.
Delivery stays blocked while finality, rights-transfer receipt, database
projection, or object-storage projection is missing, stale, or drifted.

## V36 Gate 7 ExchangeDisputeRepairCase and ExchangeRevenueRoute canon

Gate 7 implements `ExchangeDisputeRepairCase` and `ExchangeRevenueRoute` as the
package-owned operational contracts for Exchange failures, repairs, operator
runbooks, and revenue conservation.
`ExchangeDisputeRepairCase` covers stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch.
Each case binds affected order identity, affected settlement receipt identity,
affected projection roots, source-safe repair command, verification command,
proof-rooted runbook, escalation path, proof roots, and event ids.

`ExchangeRevenueRoute` covers depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof.
Each route binds public principal ids, BTC debit/credit amounts, BTD range
identity, rights-transfer receipt identity, source-to-shares proof root, and a
conservation proof that reader debit equals depositor credit plus treasury
credit plus fee credit plus reader refund.

Gate 7 emits `.bitcode/v36-exchange-dispute-repair-revenue-route.json` with
`source-safe-exchange-dispute-repair-revenue-route-metadata`.
runbooks and repair commands are source-safe and proof-rooted.
The artifact may expose dispute identities, incident classes, affected order and
settlement ids, projection roots, source-safe repair commands, verification
commands, runbook ids, escalation status, revenue accounts, BTC amounts, BTD
right-route metadata, source-to-shares roots, conservation proofs, proof roots,
and event ids; it must not expose protected source, unpaid AssetPack source,
wallet private material, provider tokens, protected prompts, protected model
responses, private payment credentials, private buyer repository payloads,
object-storage private bytes, raw disputed source bytes, or secret values.

## V36 Gate 8 ExchangeUxProof canon

Gate 8 implements `ExchangeUxProof` as the package-owned contract binding the
Exchange route, Terminal handoff, and source-safe review surfaces to generated
proof.

`ExchangeUxProof` covers market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state.
It proves that Terminal can hand off to Exchange without losing transaction context.
It also proves that collapsed UI gives readable status and expanded UI exposes source-safe detail.
Exchange telemetry dashboards remain source-safe and proof-rooted.

Gate 8 emits `.bitcode/v36-exchange-ux-proof.json` with
`source-safe-exchange-ux-proof-metadata`.
The artifact may expose route ids, transaction ids, filter ids, order state,
rights-transfer preview state, quote roots, settlement state, repair state,
proof roots, event ids, and source-safe UI detail metadata; it must not expose
protected source, unpaid AssetPack source, wallet private material, provider
tokens, protected prompts, protected model responses, buyer private repository
payloads, or secret values.

## V36 Gate 9 ExchangeRehearsal canon

Gate 9 implements `ExchangeRehearsal` as the package-owned contract binding
local and staging-testnet Exchange rehearsals to generated proof.

`ExchangeRehearsal` proves that local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows.
It proves that rehearsal logs/screenshots are source-safe.
It also proves that ledger/database synchronization and value-bearing mainnet blocking are visible.

Gate 9 emits `.bitcode/v36-exchange-rehearsal.json` with
`source-safe-exchange-rehearsal-metadata`.
The artifact may expose rehearsal ids, lane ids, flow ids, event ids, proof
roots, ledger/database synchronization checks, validation commands, redacted
log/screenshot roots, source evidence, and summary counts; it must not expose
protected source, unpaid AssetPack source, wallet private material, private
payment credentials, object-storage private bytes, provider tokens, protected
prompts, protected model responses, buyer private repository payloads, or secret
values.

## V36 Gate 10 ExchangePromotionReadinessReport canon

Gate 10 implements `ExchangePromotionReadinessReport` as the package-owned
contract that proves V36 can promote from active V35 / draft V36 to active V36 /
draft V37.

`ExchangePromotionReadinessReport` covers every V36 Exchange generated artifact,
the V36 promotion workflow, gate-quality and canon-quality workflow posture,
promotion command planning, dry-run support, generated proof appendix support,
runtime posture rewriting, and source-safe generated promotion evidence.

Gate 10 emits `.bitcode/v36-promotion-readiness-report.json` with
`source-safe-exchange-promotion-readiness-metadata`.
The artifact may expose artifact ids, proof roots, checksums, source-safe source
evidence, documentation evidence, validation commands, promotion workflow
coverage, and pre/post-promotion posture; it must not expose protected source,
unpaid AssetPack source, wallet private material, private payment credentials,
object-storage private bytes, provider tokens, protected prompts, protected
model responses, buyer private repository payloads, or secret values.

The exact post-promotion posture token is V36 active / draft V37.

## Canonical Bitcode executive summary

Bitcode measures technical knowledge, finds deposits that fit reviewed Reads, synthesizes source-bearing AssetPacks, and settles read rights in BTC with BTD range and rights receipts.
The active V35 canon remains:

- Deposits supply source material to the Bitcode depository.
- A Read Request is synthesized into a reviewed ReadNeed by `ReadNeedComprehensionSynthesis`.
- `ReadFitsFindingSynthesis` searches for plural threshold-passing fit deposits and synthesizes source-safe AssetPack preview records.
- Protected AssetPack source remains hidden before paid settlement.
- BTC is the fee asset and BTD range/read-license/right transfer is ledgerized.
- Paid settlement unlocks full AssetPack delivery, including pull-request delivery where applicable.
- Telemetry, documentation, dashboards, runbooks, docs QA, and rollout guides remain source-safe and proof-rooted.

V36 adds a market layer for existing BTD and AssetPack rights.
Exchange may list, quote, bid, ask, accept, cancel, settle, and repair rights-transfer activity, but it must not make BTD cells fungible, leak protected source, bypass paid settlement, or treat database projections as stronger than ledger truth.

## V36 source-of-truth hierarchy

The V36 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V35` until V36 promotion.
2. `BITCODE_SPEC_V36.md` during V36 drafting.
3. `BITCODE_SPEC_V36_NOTES.md`.
4. `BITCODE_SPEC_V36_DELTA.md`.
5. `BITCODE_SPEC_V36_PARITY_MATRIX.md`.
6. generated V36 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V36_PROVEN.md` only after promotion.
8. source implementation, tests, public docs, internal docs, telemetry definitions, and QA evidence that realize this family.

Older specifications are provenance only.
They must not become hidden current-system law.

## V36 full-system, re-implementation, and audit rule

V36 must be re-implementable and auditable from its specification family without reading conversation history.
Every Exchange activity row, order state, intent envelope, pricing quote, rights-transfer preview, settlement receipt, dispute case, repair operation, revenue route, UI state, API payload, telemetry event, proof root, and generated artifact must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, ledger-derived, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V36 totality and precision enforcement rule

V36 fails closed when any Exchange behavior lacks explicit ownership, authority, source-safety class, disclosure posture, ledger/database synchronization rule, BTD range identity rule, BTC fee rule, proof root, telemetry event, and repair path.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions;
- interfaces are contract consumers, not owners of protocol truth;
- Exchange is a product surface over BTD/AssetPack rights, not a replacement tokenomics layer;
- ledger records and journals outrank database projections for settlement and ownership truth.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V36 system goals, non-goals, and design principles

Goals:

- define Exchange market-wide activity master-detail contracts;
- define buy, sell, bid, ask, cancel, accept, settle, and history flows;
- define AssetPack range trading and BTD rights-transfer review without source leakage;
- define deterministic pricing, liquidity, fee quote, wrapper, and measurement-weight analysis;
- define ledger/database/object-storage reconciliation for Exchange settlement;
- define dispute, repair, and revenue-route operations specific to market activity;
- integrate Exchange with Terminal navigation, public docs, telemetry, dashboards, runbooks, and local/staging rehearsal.

Non-goals:

- no new BTD supply or tokenomics law;
- no fungible wrapper as chain-of-record for non-fungible source-share cells;
- no bridge chain-of-record implementation;
- no website Conversations product-depth implementation;
- no rewrite of `ReadNeedComprehensionSynthesis` or `ReadFitsFindingSynthesis`;
- no exposure of protected AssetPack source before settlement;
- no value-bearing production-mainnet approval.

Design principles:

- source-safe preview before market action;
- ledger-derived ownership before database convenience;
- deterministic price and fee roots before UI totals;
- cancel and repair paths before optimistic settlement display;
- revenue routing before operator dashboard polish;
- public Exchange documentation discloses market posture and rights boundaries, not protected source.

## V36 system architecture and layer boundaries

V36 preserves the V35 architecture and adds Exchange ownership:

- `packages/protocol` owns canon posture, spec-family checks, generated-proof helpers, Exchange proof helper APIs, and promotion-governance helper APIs.
- `packages/btd` owns BTD range identity, read-license, rights transfer, wallet capability, fee posture, settlement, access policy, reconciliation primitives, and value-lane admission boundaries.
- `packages/api` owns JSON-safe reusable route contracts over package primitives and must expose Exchange posture only through source-safe schemas.
- `packages/pipelines/asset-pack` owns Reading pipeline contracts and source-safe preview outputs; Exchange may reference settled AssetPack rights but must not redefine Reading law.
- `packages/executions-mcp` owns MCP server contracts and tool exposure; Exchange MCP exposure must derive from package-owned contracts.
- `packages/chatgptapp` owns ChatGPT App action contracts and source-safe response rendering.
- `uapi` owns commercial product routes and user interfaces, including `/exchange`, but not protocol truth or settlement law.
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.
- deployment host services own runtime carriers, queues, observers, broadcasters, repair jobs, object storage, and environment variables through inherited V34/V35 contracts.
- public `/docs` surfaces own enterprise-facing guidance but must derive from protocol/package truth.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- Exchange may show source-safe market, proof, fee, and rights-transfer metadata before settlement; it must not show protected AssetPack source before payment and rights transfer.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Object storage carries source-bearing AssetPacks, proof bundles, generated artifacts, and rollback material only under explicit disclosure and retention policy.
- Value-bearing mainnet activity is blocked until a future canon admits it; V36 may define readiness and dry-run proof, not production value launch.

## V36 proof/test package API and inherited support canon

V36 treats package APIs as the source of Exchange truth.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, generated proof helpers, and V36 Exchange check helpers.
- `@bitcode/btd` owns rights, range, fee, wallet, access, treasury, reconciliation, and value-lane admission primitives.
- `@bitcode/api` owns reusable JSON contracts for public API consumers and source-safe Exchange posture.
- `@bitcode/pipeline-asset-pack` owns Reading pipeline contract surfaces and source-safe preview outputs that Exchange may reference after settlement.
- MCP and ChatGPT App packages consume those contracts rather than inventing interface-local shapes.

The commercial protocol package owns the active/draft posture while V36 is in flight:

- `ACTIVE_CANON_VERSION = 'V35'`;
- `DRAFT_TARGET_VERSION = 'V36'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers remain exported through the package index;
- package tests and V36 checks fail closed on direct demonstration-source imports and source-unsafe Exchange output.

Any Exchange object used by more than one runtime lane, interface, package, docs surface, dashboard, or runbook must have a package-owned type, builder, parser, validator, source-safe fixture, example, compatibility row, replay command where relevant, and generated artifact before the gate that depends on it closes.

## V36 canonical domain model

V36 adds Exchange contract objects over V35 protocol and deployment truth:

- `ExchangeActivityBook`: activity id, activity kind, assetPack id, BTD range id, principal ids, state, source-safe summary, proof roots, ledger/database projection refs, event ids, and detail link.
- `ExchangeIntent`: intent id, actor principal, organization role, action kind, target range, quote root, authority proof, policy result, idempotency key, and fail-closed reason.
- `ExchangeOrder`: order id, side, range, AssetPack rights scope, owner posture, price quote, expiration, cancellability, acceptability, settlement state, and repair posture.
- `ExchangeRightsTransferPreview`: source-safe preview of current ownership, requested transfer, price root, fee root, disclosure boundary, settlement unlock condition, and post-settlement delivery condition.
- `ExchangePricingQuote`: BTC amount, measurement weights, measurement volume, liquidity band, wrapper analysis, fee split, treasury route, depositor route, reader route, and deterministic quote root.
- `ExchangeSettlementReceipt`: payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id.
- `ExchangeDisputeRepairCase`: incident class, dispute reason, affected order, affected settlement, affected projection, repair command, verification command, proof root, and escalation path.
- `ExchangeRevenueRoute`: treasury account, depositor account, reader account, fee account, BTC route, BTD right route, source-to-shares route, and conservation proof.

Inherited V35 objects remain active: `Deposit`, `ReadRequest`, `ReadNeed`, `FindingFitsResult`, `AssetPackPreview`, `SettlementUnlock`, `BtcFeeQuote`, `BtdAssetPackMintReceipt`, `BtdReadReceipt`, `BtdRightsTransferReceipt`, `SourceToSharesProof`, `TerminalTransaction`, `TelemetryTaxonomyCatalog`, `DocumentationSurfaceCatalog`, `DocsQaAlignmentReport`, `OperatorRunbookCatalog`, `TestnetRolloutReadinessGuide`, `McpToolContract`, `ChatGptAppActionContract`, `PublicApiRouteContract`, and `InterfaceTelemetryProofHook`.

## V36 gate plan

V36 closes through ten gates:

1. **Gate 1: V36 Exchange Roadmap And Spec Opening** opens the V36 family over V35 canon, updates `SPECIFICATIONS_ROADMAP.md`, documents V35 active / V36 draft posture, and wires `check:v36-gate1`.
2. **Gate 2: Exchange Activity Book And Market Master Detail** defines `ExchangeActivityBook` source-safe rows for market-wide activity, filters, detail panes, proof roots, and telemetry bindings.
3. **Gate 3: Buy Sell Bid Ask Cancel Accept Intent Contracts** defines `ExchangeIntent` and `ExchangeOrder` action envelopes, authorization, idempotency, cancelability, acceptability, and history transitions.
4. **Gate 4: AssetPack Range Trading And Rights Transfer Review** defines BTD range/AssetPack rights-transfer preview, source-safe disclosure, ownership checks, and settlement unlock boundaries.
5. **Gate 5: Pricing Liquidity Fee Quote And Wrapper Analysis** defines deterministic BTC price, measurement-weight, volume, liquidity, wrapper, fee-split, and quote-root calculations.
6. **Gate 6: Exchange Settlement Ledger Database Reconciliation** defines `ExchangeSettlementReceipt`, finality, ledger/database/object-storage synchronization, projection repair, and observer hooks.
7. **Gate 7: Dispute Repair Revenue Route Operations** defines dispute cases, repair jobs, revenue routes, conservation proofs, escalation, and operator runbooks.
8. **Gate 8: Exchange UX And Terminal Navigation Integration** wires Exchange master-detail, Terminal handoff, source-safe review states, public docs, and telemetry dashboards.
9. **Gate 9: Local Staging Exchange Rehearsal And Proof Coverage** rehearses local/staging-testnet Exchange flows with source-safe logs, proof roots, DB/ledger synchronization checks, and blocked value-bearing mainnet posture.
10. **Gate 10: V36 Promotion Readiness** generates V36 Exchange proof artifacts, promotion readiness, active V36 / draft V37 posture, and canonical promotion support.

## V36 whole Bitcode operator chain

The V36 whole-system operator chain is:

1. Depositor deposits source material.
2. Reader requests a Read.
3. `ReadNeedComprehensionSynthesis` synthesizes a reviewed ReadNeed.
4. `ReadFitsFindingSynthesis` finds plural fit deposits and synthesizes a source-safe AssetPack preview.
5. Reader pays BTC fee and receives BTD read/right transfer.
6. AssetPack delivery occurs after settlement and rights transfer.
7. Exchange lists eligible BTD range or AssetPack rights only after ownership and disclosure checks pass.
8. Buyer or seller submits source-safe market intent.
9. Exchange quotes price, liquidity, fee, wrapper, and rights-transfer preview.
10. Buyer accepts, cancels, bids, asks, settles, or reviews history through source-safe states.
11. Observers, broadcasters, repair jobs, and storage carriers reconcile settlement, finality, rights, delivery, and proof state through inherited V34/V35 deployment and telemetry law.

## V36 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: `Deposit`, depository records, owner authority, source-to-shares proof, and Exchange eligibility metadata.
- Current algorithms and derivation rules: deposited source is measured and rights-bearing only through inherited Reading and BTD law before it can become Exchange-eligible.
- Current invariants and fail-closed conditions: invalid deposit, missing ownership, revoked policy, or protected source leakage blocks Exchange listing.
- Current proof obligations: source root, owner authority root, BTD range root, and disclosure root.
- Current source-bearing implementation basis: commercial packages and UAPI routes, not demonstration imports.
- Current validating commands and parity basis: V35 spec-family checks plus V36 Gate 1 and later Exchange gate checks.
- Current accepted boundaries: Exchange does not admit raw source as public listing content.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: `ReadRequest`, `ReadNeed`, `FindingFitsResult`, `AssetPackPreview`, pipeline execution records, PTRR agent records, and ThricifiedGeneration records.
- Current algorithms and derivation rules: Reading remains owned by `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`; Exchange references settled rights only.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, or unpaid preview blocks Exchange sale of nonexistent rights.
- Current proof obligations: prompt root, inference root, preview root, settlement unlock root, and disclosure root.
- Current source-bearing implementation basis: `packages/pipelines/asset-pack` and route/API adapters.
- Current validating commands and parity basis: inherited V32/V35 pipeline proof checks plus V36 Exchange checks.
- Current accepted boundaries: Exchange cannot rewrite Reading pipeline result law.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: fit deposits, recall/ranking evidence, verification decisions, AssetPack preview, and rights-transfer eligibility.
- Current algorithms and derivation rules: recall and ranking remain Reading functions; Exchange may sort market entries by source-safe measurements and price metadata.
- Current invariants and fail-closed conditions: no-survivor asset pack, stale verification, or ownership mismatch blocks listing and settlement.
- Current proof obligations: fit root, verification root, measurement root, and order eligibility root.
- Current source-bearing implementation basis: pipeline packages, BTD packages, and API contracts.
- Current validating commands and parity basis: V36 market master-detail and rights-transfer gates.
- Current accepted boundaries: Exchange must not expose fit source or model raw outputs before settlement.

### Selection and materialization

- Current canonical objects and emitted artifacts: selected AssetPack source, delivery branch, object storage root, BTD range root, Exchange order root, and settlement receipt.
- Current algorithms and derivation rules: materialization remains post-settlement for protected source; Exchange can preview measurements and roots only.
- Current invariants and fail-closed conditions: unpaid source, missing fee quote, stale settlement, storage drift, delivery mismatch, or order cancellation blocks delivery.
- Current proof obligations: selected source root, object storage root, order root, settlement root, and delivery root.
- Current source-bearing implementation basis: API, storage, ledger, and delivery services.
- Current validating commands and parity basis: V36 settlement reconciliation and rehearsal gates.
- Current accepted boundaries: source-bearing AssetPack content crosses visibility only after settlement.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: principal, organization role, wallet capability, owner authority, order authorization, and policy decision.
- Current algorithms and derivation rules: only authorized owners can list or transfer rights; only authorized buyers can settle.
- Current invariants and fail-closed conditions: authorization denial, stale owner, wallet mismatch, revoked org role, or policy failure blocks Exchange intent.
- Current proof obligations: auth root, wallet root, policy root, role root, and signature root.
- Current source-bearing implementation basis: BTD, API, Auth, Terminal, Exchange, and Auxillaries packages/routes.
- Current validating commands and parity basis: inherited V31/V33/V35 auth/interface checks plus V36 intent gates.
- Current accepted boundaries: wallet private material and service-role secrets never enter Exchange payloads.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe market preview, rights-transfer preview, disclosure policy, telemetry event, docs link, and redaction proof.
- Current algorithms and derivation rules: projections expose market metadata, measurements, proof roots, fee roots, settlement posture, and denial reasons.
- Current invariants and fail-closed conditions: public projection overexposure, protected source leakage, raw protected prompt leakage, or unpaid source exposure blocks the response.
- Current proof obligations: disclosure root, redaction root, docs root, and telemetry root.
- Current source-bearing implementation basis: UAPI, public docs, protocol contracts, and telemetry taxonomy.
- Current validating commands and parity basis: V35 docs/telemetry checks plus V36 UX and rehearsal checks.
- Current accepted boundaries: source-safe previews are not source delivery.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: `BtcFeeQuote`, `ExchangePricingQuote`, `ExchangeSettlementReceipt`, `BtdRightsTransferReceipt`, journal, ledger root, database projection root, and revenue route.
- Current algorithms and derivation rules: BTC fee and BTD rights transfer remain separate but correlated by deterministic roots; measurement weight times measurement volume informs price only through auditable quote rules.
- Current invariants and fail-closed conditions: settlement conservation drift, underpayment, overpayment, stale finality, projection drift, or invalid rights transfer blocks completion.
- Current proof obligations: fee quote root, settlement root, rights transfer root, source-to-shares root, and revenue route root.
- Current source-bearing implementation basis: `packages/btd`, ledger/database adapters, observers, repair jobs, and API routes.
- Current validating commands and parity basis: V36 pricing and settlement gates.
- Current accepted boundaries: database projection never overrides ledger truth.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: generated proof appendix, Exchange generated artifacts, proof-family reports, telemetry records, and rehearsal evidence.
- Current algorithms and derivation rules: V36 generated artifacts derive from package-owned builders and fail closed on stale or source-unsafe payloads.
- Current invariants and fail-closed conditions: stale promoted status truth, missing generated artifact, stale proof root, unsupported disclosure, or replay mismatch blocks gate closure.
- Current proof obligations: proof family root, generated artifact root, workflow root, rehearsal root, and promotion root.
- Current source-bearing implementation basis: `packages/protocol`, scripts, workflows, and generated `.bitcode/` artifacts.
- Current validating commands and parity basis: `check:v36-gate1` through `check:v36-gate10`, spec-family checks, canonical-input checks, and canon-posture drift checks.
- Current accepted boundaries: proof artifacts are source-safe unless explicitly private and access-controlled.

## V36 proof-family canon

V36 extends the inherited proof-family set with Exchange-specific evidence.

### Inference-synthesis

- proofArtifactPath: `.bitcode/v36-exchange-inference-synthesis-proof.json`
- members: market analysis, pricing reasoning, rights-transfer review, dispute classification.
- theoremIds: exchange-inference-source-safe, exchange-pricing-reasoning-rooted.
- replayStepIds: exchange-intent-fixture, pricing-fixture, dispute-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-activity-book.json`, `.bitcode/v36-pricing-liquidity-fee-quote.json`.
- current member closure criteria: inference-derived Exchange conclusions must be source-safe and typed.
- current member verdict shape: passed, failed, blocked, with proof root and redaction posture.
- current theorem-by-theorem closure reading: each theorem binds prompt/output roots where inference is used.
- current theorem-to-replay grouping: pricing, intent, rights review, dispute.
- minimum artifact/replay binding set: intent id, order id, quote root, proof root.
- current proof-object fields: proofFamily, memberIds, theoremIds, replayStepIds, proofArtifactPath.
- generated-artifact and test bindings: V36 pricing, rights-transfer, and rehearsal artifacts.
- fail-closed conditions: prompt contract incompleteness, raw protected output, or missing typed parse.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v36-exchange-prompt-completeness-proof.json`
- members: prompt-part registry coverage, prompt-template coverage, context interpolation, output schema.
- theoremIds: exchange-prompt-context-complete, exchange-output-schema-enforced.
- replayStepIds: quote-prompt-fixture, rights-review-prompt-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-rehearsal.json`.
- current member closure criteria: prompts name allowed market context and forbidden source-bearing fields.
- current member verdict shape: complete, incomplete, blocked with missing prompt parts.
- current theorem-by-theorem closure reading: every inference point has reason, judge, and final typed output.
- current theorem-to-replay grouping: intent, pricing, dispute, repair.
- minimum artifact/replay binding set: prompt root, context root, schema root, output root.
- current proof-object fields: promptRoot, contextRoot, schemaRoot, outputRoot.
- generated-artifact and test bindings: Exchange rehearsal and pricing gates.
- fail-closed conditions: prompt contract incompleteness or untyped model output.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v36-exchange-static-code-analysis-proof.json`
- members: route scan, import boundary scan, source-safety scan, secret scan.
- theoremIds: exchange-routes-unversioned, exchange-no-demo-imports.
- replayStepIds: route-scan, import-scan, secret-scan.
- witnessArtifactPaths: `.bitcode/v36-exchange-promotion-readiness-report.json`.
- current member closure criteria: Exchange implementation follows current source names and package boundaries.
- current member verdict shape: passed, failed, blocked with file roots.
- current theorem-by-theorem closure reading: every source boundary theorem has a scan witness.
- current theorem-to-replay grouping: source, routes, packages, docs.
- minimum artifact/replay binding set: file root, command, output root.
- current proof-object fields: scanId, sourceRoot, result, failureCodes.
- generated-artifact and test bindings: gate checks and canon quality workflows.
- fail-closed conditions: versioned routes, demo imports, secrets, or protected source in public files.

### Verification-decisions

- proofArtifactPath: `.bitcode/v36-exchange-verification-decisions-proof.json`
- members: ownership verification, order authority, payment verification, finality verification.
- theoremIds: exchange-owner-authorized, exchange-payment-finalized.
- replayStepIds: owner-fixture, payment-fixture, cancel-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-settlement-reconciliation.json`.
- current member closure criteria: every market transition has an authority and verification result.
- current member verdict shape: accepted, denied, blocked with denial reason.
- current theorem-by-theorem closure reading: verification decisions are explicit before settlement.
- current theorem-to-replay grouping: list, bid, ask, accept, settle, cancel.
- minimum artifact/replay binding set: principal id, order id, policy root, ledger root.
- current proof-object fields: decisionId, decision, authorityRoot, ledgerRoot.
- generated-artifact and test bindings: intent, rights-transfer, settlement gates.
- fail-closed conditions: authorization denial, stale owner, or invalid finality.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v36-exchange-selection-materialization-proof.json`
- members: market selection, order detail projection, post-settlement delivery, history materialization.
- theoremIds: exchange-source-hidden-before-settlement, exchange-history-rooted.
- replayStepIds: preview-fixture, settlement-fixture, delivery-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-rights-transfer-review.json`.
- current member closure criteria: market detail can be rendered without protected source and delivery occurs only after settlement.
- current member verdict shape: previewed, delivered, blocked.
- current theorem-by-theorem closure reading: preview and source delivery are distinct.
- current theorem-to-replay grouping: activity, order, preview, delivery.
- minimum artifact/replay binding set: preview root, settlement root, delivery root.
- current proof-object fields: activityId, orderId, previewRoot, deliveryRoot.
- generated-artifact and test bindings: rights-transfer and UX gates.
- fail-closed conditions: unpaid source, missing fee quote, storage drift, or delivery mismatch.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v36-exchange-authorization-sensitive-flow-proof.json`
- members: wallet authorization, organization role, rights owner, secret redaction.
- theoremIds: exchange-wallet-private-material-absent, exchange-role-authorized.
- replayStepIds: wallet-fixture, role-fixture, secret-redaction-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-activity-book.json`.
- current member closure criteria: Exchange payloads include proof roots but never private wallet or secret values.
- current member verdict shape: passed, denied, blocked.
- current theorem-by-theorem closure reading: every sensitive field is either absent or redacted.
- current theorem-to-replay grouping: wallet, org, order, settlement.
- minimum artifact/replay binding set: actor id, role root, wallet root, redaction root.
- current proof-object fields: principalId, roleRoot, walletRoot, redactionRoot.
- generated-artifact and test bindings: intent and UX gates.
- fail-closed conditions: secret value, wallet private material, or unauthorized role.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v36-exchange-settlement-source-to-shares-proof.json`
- members: BTC fee settlement, BTD rights transfer, revenue route, source-to-shares conservation.
- theoremIds: exchange-settlement-conserved, exchange-rights-transfer-ledgered.
- replayStepIds: payment-fixture, rights-transfer-fixture, revenue-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-settlement-reconciliation.json`.
- current member closure criteria: BTC and BTD movements are separate, correlated, and conserved.
- current member verdict shape: settled, pending, blocked, repaired.
- current theorem-by-theorem closure reading: ledger roots and database roots reconcile.
- current theorem-to-replay grouping: quote, payment, transfer, revenue.
- minimum artifact/replay binding set: fee root, ledger root, rights root, revenue root.
- current proof-object fields: btcFeeRoot, btdRightsRoot, ledgerRoot, revenueRouteRoot.
- generated-artifact and test bindings: pricing, settlement, and repair gates.
- fail-closed conditions: settlement conservation drift, underpayment, overpayment, or projection drift.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v36-exchange-disclosure-boundary-proof.json`
- members: public market preview, buyer-visible preview, operator evidence, post-settlement source.
- theoremIds: exchange-public-preview-source-safe, exchange-source-unlocks-after-payment.
- replayStepIds: public-preview-fixture, buyer-preview-fixture, unlock-fixture.
- witnessArtifactPaths: `.bitcode/v36-exchange-ux-proof.json`.
- current member closure criteria: every preview names allowed and forbidden fields.
- current member verdict shape: source-safe, blocked, delivered.
- current theorem-by-theorem closure reading: disclosure limit is preserved across UI, API, docs, and logs.
- current theorem-to-replay grouping: activity, preview, telemetry, delivery.
- minimum artifact/replay binding set: disclosure root, redaction root, delivery root.
- current proof-object fields: disclosureRoot, redactionRoot, allowedFields, forbiddenFields.
- generated-artifact and test bindings: UX and rehearsal gates.
- fail-closed conditions: public projection overexposure or protected source leakage.

### Proof-contract

- proofArtifactPath: `.bitcode/v36-exchange-proof-contract.json`
- members: generated artifacts, workflow checks, promotion readiness, replay evidence.
- theoremIds: exchange-proof-generated, exchange-promotion-safe.
- replayStepIds: gate1-check, gate10-check, promotion-dry-run.
- witnessArtifactPaths: `.bitcode/v36-promotion-readiness-report.json`.
- current member closure criteria: each Exchange gate has generated evidence and validation commands.
- current member verdict shape: passed, failed, blocked.
- current theorem-by-theorem closure reading: proof-source commit and generated artifacts match source.
- current theorem-to-replay grouping: gates, artifacts, workflows, promotion.
- minimum artifact/replay binding set: source commit, artifact root, workflow root, promotion root.
- current proof-object fields: proofSourceCommit, generatedArtifacts, validationCommands, promotionState.
- generated-artifact and test bindings: all V36 gates.
- fail-closed conditions: stale promoted status truth, missing generated artifact, or workflow drift.

## V36 generated canon

V36 generated canon consists of source-safe `.bitcode/` artifacts generated by package-owned builders and checked by scripts.

### Inherited V19 reproducible-canon artifacts

V36 inherits deterministic replay, volatility, theorem-evidence, proof-member, state-machine, and contract-change artifact expectations.

### Inherited V20 operator-quality artifacts

V36 inherits operator quality, visual/accessibility/performance posture, projection-quality smoke checks, and generated quality report expectations.

### Exact generated-artifact inventory matrix

| artifactPath | owning gate | disclosure posture | source basis |
| --- | --- | --- | --- |
| `.bitcode/v36-spec-family-report.json` | Gate 1 | source-safe | spec-family checker |
| `.bitcode/v36-canonical-input-report.json` | Gate 1 | source-safe | canonical-input checker |
| `.bitcode/v36-exchange-activity-book.json` | Gate 2 | source-safe | Exchange activity contracts |
| `.bitcode/v36-exchange-intent-order-contracts.json` | Gate 3 | source-safe | Exchange intent/order contracts |
| `.bitcode/v36-exchange-rights-transfer-review.json` | Gate 4 | source-safe | BTD rights-transfer preview |
| `.bitcode/v36-pricing-liquidity-fee-quote.json` | Gate 5 | source-safe | deterministic pricing |
| `.bitcode/v36-exchange-settlement-reconciliation.json` | Gate 6 | source-safe | ledger/database reconciliation |
| `.bitcode/v36-exchange-dispute-repair-revenue-route.json` | Gate 7 | source-safe | repair and revenue routes |
| `.bitcode/v36-exchange-ux-proof.json` | Gate 8 | source-safe | UI/API/docs integration |
| `.bitcode/v36-exchange-rehearsal.json` | Gate 9 | source-safe | local/staging rehearsal |
| `.bitcode/v36-promotion-readiness-report.json` | Gate 10 | source-safe | promotion readiness |

### V36 specifying generated artifacts

Gate 1 requires `.bitcode/v36-spec-family-report.json` and `.bitcode/v36-canonical-input-report.json` readiness.
Gate 2 adds `.bitcode/v36-exchange-activity-book.json` from the package-owned `ExchangeActivityBook` builder and source-safe package tests.
Later gates add the remaining Exchange generated artifacts only when their package-owned builders and tests exist.

### Shared generated-artifact fields

Every V36 generated artifact includes version, artifact id, generated at, source evidence, proof roots, disclosure posture, forbidden payload classes, validation commands, and deterministic row roots where rows exist.

### Artifact-specific generated payload fields

Exchange artifacts add activity ids, intent ids, order ids, range ids, quote roots, rights-transfer roots, settlement roots, dispute ids, repair commands, revenue routes, dashboard/runbook ids, and rehearsal evidence roots.

### Artifact confidentiality and disclosability taxonomy

V36 artifacts are public, internal, buyer-visible, reviewer-visible, or operator-only.
No source-safe public artifact may carry secrets, wallet private material, raw protected prompts, raw protected model responses with source, buyer private repository data, or unpaid AssetPack source.

### Minimum generated appendix rendered contents

`BITCODE_SPEC_V36_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when generated evidence is stale or source-unsafe.

### Canonical regeneration and fail-closed posture

V36 generated canon must be regenerated through package scripts and workflow checks.
The system fails closed when generated artifacts are missing, stale, source-unsafe, or inconsistent with `BITCODE_SPEC.txt`, the V36 family, or the proof-source commit.

## V36 validation canon

V36 validation consists of:

- `pnpm run check:v36-gate1`;
- `pnpm run check:v36-gate2`;
- `node scripts/check-bitcode-spec-family.mjs --version V36 --mode draft --current-target V35`;
- `node scripts/check-bitcode-canonical-inputs.mjs --current-target V35`;
- `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V35 --draft-target V36`;
- package typechecks and tests touched by each gate;
- Exchange-specific tests added by Gates 2 through 10;
- workflow checks for gate PRs and promotion PRs;
- source-safe diff hygiene.

## V36 promotion readiness canon

V36 promotion readiness canon is carried by `ExchangePromotionReadinessReport`
and `.bitcode/v36-promotion-readiness-report.json`.

## V36 promotion canon

V36 promotion may occur only after all ten gates close and the version promotion workflow validates:

- all V36 gate checks;
- generated V36 Exchange artifacts;
- source-safe public documentation and telemetry;
- local/staging-testnet rehearsal evidence;
- generated `BITCODE_SPEC_V36_PROVEN.md`;
- promotion dry-run;
- `BITCODE_SPEC.txt` pointer rewrite from `V35` to `V36`.

Promotion rewrites runtime posture from `V35` active / `V36` draft to `V36` active / `V37` draft only after validations pass.

## V36 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

V36 canonical type surfaces are `ExchangeActivityBook`, `ExchangeIntent`, `ExchangeOrder`, `ExchangeRightsTransferPreview`, `ExchangePricingQuote`, `ExchangeSettlementReceipt`, `ExchangeDisputeRepairCase`, and `ExchangeRevenueRoute`.
Public surfaces include `/exchange`, Terminal handoff panels, source-safe API payloads, public docs, telemetry dashboards, and operator runbooks.

### Appendix B. Proof family closure catalog

#### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v36-exchange-inference-synthesis-proof.json` | market-analysis, pricing-reasoning | exchange-inference-source-safe | exchange-intent-fixture | `.bitcode/v36-exchange-activity-book.json` | package builders and tests |
| Prompt-completeness | `.bitcode/v36-exchange-prompt-completeness-proof.json` | prompt-parts, schemas | exchange-prompt-context-complete | quote-prompt-fixture | `.bitcode/v36-exchange-rehearsal.json` | prompt registries |
| Static-code-analysis | `.bitcode/v36-exchange-static-code-analysis-proof.json` | route-scan, import-scan | exchange-routes-unversioned | route-scan | `.bitcode/v36-promotion-readiness-report.json` | scripts and workflows |
| Verification-decisions | `.bitcode/v36-exchange-verification-decisions-proof.json` | ownership, finality | exchange-owner-authorized | owner-fixture | `.bitcode/v36-exchange-settlement-reconciliation.json` | BTD and ledger |
| Selection-and-materialization | `.bitcode/v36-exchange-selection-materialization-proof.json` | preview, delivery | exchange-source-hidden-before-settlement | delivery-fixture | `.bitcode/v36-exchange-rights-transfer-review.json` | UAPI and storage |
| Authorization-and-sensitive-flow | `.bitcode/v36-exchange-authorization-sensitive-flow-proof.json` | wallet, role | exchange-role-authorized | wallet-fixture | `.bitcode/v36-exchange-activity-book.json` | auth and wallet |
| Settlement-source-to-shares | `.bitcode/v36-exchange-settlement-source-to-shares-proof.json` | payment, transfer | exchange-settlement-conserved | payment-fixture | `.bitcode/v36-exchange-settlement-reconciliation.json` | ledger and BTD |
| Disclosure-boundary | `.bitcode/v36-exchange-disclosure-boundary-proof.json` | preview, unlock | exchange-public-preview-source-safe | public-preview-fixture | `.bitcode/v36-exchange-ux-proof.json` | UI/API/docs |
| Proof-contract | `.bitcode/v36-exchange-proof-contract.json` | artifacts, workflows | exchange-proof-generated | promotion-dry-run | `.bitcode/v36-promotion-readiness-report.json` | protocol package |

### Appendix C. Generated artifact contract catalog

The V36 generated artifact contract catalog is defined in the generated canon section and includes `.bitcode/v36-spec-family-report.json`, `.bitcode/v36-canonical-input-report.json`, and all Exchange gate artifacts.

### Appendix D. Validation and checking gate catalog

| gate | command | required posture |
| --- | --- | --- |
| Gate 1 | `pnpm run check:v36-gate1` | V35 active / V36 draft |
| Gate 2 | `pnpm run check:v36-gate2` | Exchange activity book implemented |
| Gate 3 | `pnpm run check:v36-gate3` | intent/order contracts implemented |
| Gate 4 | `pnpm run check:v36-gate4` | rights-transfer review implemented |
| Gate 5 | `pnpm run check:v36-gate5` | pricing quote implemented |
| Gate 6 | `pnpm run check:v36-gate6` | settlement reconciliation implemented |
| Gate 7 | `pnpm run check:v36-gate7` | dispute/repair/revenue implemented |
| Gate 8 | `pnpm run check:v36-gate8` | UX integration implemented |
| Gate 9 | `pnpm run check:v36-gate9` | rehearsal implemented |
| Gate 10 | `pnpm run check:v36-gate10` | promotion readiness implemented |

### Appendix E. Current canonical source map

V36 source map roots include `packages/protocol`, `packages/btd`, `packages/api`, `packages/pipelines/asset-pack`, `apps/uapi/app/exchange`, `apps/uapi/app/terminal`, `apps/uapi/app/api`, public docs, workflows, scripts, and generated `.bitcode/` artifacts.
`_legacy/` is historical only.

### Appendix F. Subsystem totality and derivability matrix

V36 subsystem totality covers repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, generated artifacts and canonical promotion.

### Appendix G. Canonical file-family and promotion contract catalog

V36 file family: `BITCODE_SPEC_V36.md`, `BITCODE_SPEC_V36_DELTA.md`, `BITCODE_SPEC_V36_NOTES.md`, `BITCODE_SPEC_V36_PARITY_MATRIX.md`, and generated `BITCODE_SPEC_V36_PROVEN.md` after promotion.
Promotion requires a version PR into `main`, promotion workflow validation, generated proof output, and `BITCODE_SPEC.txt` pointer update.

### Appendix H. Operator surface and quality contract catalog

Operator surfaces include Exchange market dashboard, activity detail, order history, settlement review, dispute repair, revenue route review, Terminal handoff, telemetry dashboards, alert runbooks, local/staging rehearsal, and public docs.
Quality gates require accessible master-detail navigation, source-safe collapsed/expanded detail, deterministic state labels, repair instructions, and proof-root visibility.

### Appendix I. Scenario, workflow, and cross-product contract catalog

Required cross-product scenarios remain active for auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, and auth-many-asset-normalization.
V36 Exchange scenarios must preserve Targeted deposit and Normalization deposit readings, patch/context/public asset types, buyer/reviewer/internal audiences, and Openly writable, Measurably readable, Provable, Valuable posture.

### Appendix J. Fail-closed contract and error posture matrix

V36 preserves existing fail-closed causes: invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, stale promoted status truth, stale owner, cancelled order, underpayment, overpayment, projection drift, source leakage, missing rights transfer, and missing proof root.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing material includes `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V36_PROVEN.md`.
Exchange may reference those roots but must not disclose protected source before settlement.

## V36 accepted boundaries and reopen conditions

- V36 owns deeper Exchange.
- V37 owns website Conversations.
- V36 does not authorize value-bearing production-mainnet launch.
- V36 does not redefine BTD supply, BTC fee separation, AssetPack range identity, owner-read/licensed-read law, measureminting, ancestry, or Reading pipeline product law.
- V36 may reopen Exchange gate scope only through a documented parity row, accepted boundary, and checker update.

## V36 completion condition

V36 is complete only when all ten Exchange gates have package-owned contracts, source-safe generated artifacts, tests, documentation, workflow checks, parity closure, local/staging rehearsal evidence, and promotion readiness sufficient to rewrite `BITCODE_SPEC.txt` from `V35` to `V36` through the version promotion workflow.
