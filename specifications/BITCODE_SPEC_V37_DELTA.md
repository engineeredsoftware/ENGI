# Bitcode Spec V37 Delta

## Status

- Version: `V37`
- V37 state: canonical promotion complete; this delta records the promoted V36-to-V37 Website Conversations closure set
- Current canonical/latest target: `V37`
- Canonical proof-source commit: `3df6b2cae755336067da920abbe8142df487a221`
- Prior canonical anchor: `BITCODE_SPEC_V36.md`
- Prior generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v37-spec-family-report.json`, `.bitcode/v37-canonical-input-report.json`, `.bitcode/v37-canon-posture-drift-report.json`, `.bitcode/v37-conversation-session-route-history.json`, `.bitcode/v37-conversation-stream-event-contract.json`, `.bitcode/v37-conversation-writing-workspace.json`, `.bitcode/v37-conversation-source-selector.json`, `.bitcode/v37-conversation-terminal-handoff.json`, `.bitcode/v37-conversation-persistence-privacy-redaction.json`, `.bitcode/v37-conversation-telemetry-proof-hooks.json`, `.bitcode/v37-conversation-rehearsal.json`, `.bitcode/v37-promotion-readiness-report.json`, V37 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V37_PROVEN.md` as the generated proof appendix for V37 promotion
- Source parity state: V37 source-side ConversationSession route history, ConversationStreamEvent contracts, ConversationWritingWorkspace contracts, ConversationSourceSelector contracts, ConversationTerminalHandoff contracts, ConversationPersistencePrivacyRedaction contracts, ConversationTelemetryProofHooks contracts, ConversationRehearsal evidence, workflow, and promotion surfaces are canonicalized in the promoted V37 file family
- Spec companion: `BITCODE_SPEC_V37.md`
- Notes companion: `BITCODE_SPEC_V37_NOTES.md`
- Parity companion: `BITCODE_SPEC_V37_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md` only after V37 promotion
- Scope: V37 canonical delta for Website Conversations over promoted V36 Exchange canon

## Why V37 exists

V36 promoted Exchange depth.
That made Bitcode's market surface auditable enough for market-wide activity, rights-transfer review, pricing, settlement, repair, revenue route, and Exchange UX.

V37 exists because Bitcode now needs website Conversations to become a first-class enterprise experience instead of deferred interface posture.
Conversations must let enterprise users draft requests, stream assistant work, select source context, move into Terminal transactions, and preserve route-local history while reusing Protocol, Reading, BTD, Exchange, telemetry, and documentation truth.

## Accepted V37 decisions

- V36 remains active canon during V37 drafting.
- V37 gate branches are opened from `version/v37` and merged back only when their gate acceptance criteria are closed.
- V37 owns Website Conversations: conversation sessions, messages, stream events, fullscreen writing mode, source selectors, route-local history, Terminal handoff, persistence/privacy, telemetry/proof hooks, and local/staging rehearsal.
- Conversations contracts must be package-owned before they are exposed by route handlers, UI state, dashboards, runbooks, MCP tools, ChatGPT App actions, public docs, or generated artifacts.
- Conversations previews and streams disclose source-safe summaries, roots, rights posture, source selector metadata, handoff state, retry state, and denial reasons; they must not disclose protected source, raw protected prompts, wallet private material, secrets, or unpaid AssetPack contents.
- Terminal remains the transaction cockpit; Conversations can prepare and hand off transaction intent but must not become a parallel ledger, wallet, settlement, Exchange, or Reading authority.

## Explicitly deferred

- Post-V37 work owns any production-mainnet admission, bridge chain-of-record implementation, and future non-website conversation surfaces not covered by V37.
- Production-mainnet value-bearing launch remains explicitly blocked until a future promoted canon admits it.
- Bridge chain-of-record implementation remains out of V37.
- V37 does not reopen BTD supply law, Reading pipeline product law, V34 deployment law, V35 telemetry/docs law, V36 Exchange law, or AssetPack source disclosure law.

## Pre-Implementation Sequence

1. Open `version/v37` from promoted `main`.
2. Open `v37/gate-1-conversations-roadmap-opening` from `version/v37`.
3. Create the V37 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V36`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V36 is active canon, V37 is draft target, and post-V37 scope remains coherent.
5. Retarget gate-quality and canon-quality workflow posture checks to V36 active / V37 draft.
6. Add `check:v37-gate1` and a V37 Gate 1 checker.
7. Define V37 gates, acceptance criteria, carryforward parity rows, and post-V37 roadmap responsibilities.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v37`.

## Commit-Body Direction

V37 gate commit bodies should describe the closed gate, specification changes, implementation surfaces, tests, proof commands, and accepted boundaries.
The eventual V37 promotion commit body must name all closed V37 gates, generated Conversations proof artifacts, stream and handoff evidence, UI proof, public/internal documentation evidence, telemetry/runbook evidence, local/staging rehearsal proof, and the `BITCODE_SPEC.txt` pointer change from `V36` to `V37`.
It must explicitly defer bridge chain-of-record implementation, value-bearing mainnet launch, and non-website conversation surfaces outside V37.

## Gate Delta

### Gate 1: V37 Conversations Roadmap And Spec Opening

Gate 1 opens V37 correctly:

- V37 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V36`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V36 active / V37 draft posture.
- `check:v37-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, Conversations vocabulary, and promotion boundaries.
- The V37 gate list is explicit before Conversations implementation begins.

### Gate 2: Conversation Session And Route History Contracts

Gate 2 defines route-local session and history contracts.

Closure acceptance:

- `ConversationSession` owns route-local identity, user/account posture, source context, policy decision, stream state, history references, and proof roots;
- route-local history supports restore, branch, retry, and redaction without becoming global ledger truth;
- generated source-safe artifact coverage exists in `.bitcode/v37-conversation-session-route-history.json` with `source-safe-conversation-session-route-history-metadata` only after package-owned builders, package tests, and route tests exist;
- `pnpm run check:v37-gate2` validates package source, artifact freshness, route contracts, docs, workflow wiring, source safety, proof roots, event ids, route ids, history operations, and persistence boundaries;
- route contracts cover create, restore, branch, retry, redact, and stream without exposing protected source, raw protected prompts, protected model responses with source, provider tokens, wallet private material, secrets, unpaid AssetPack source, settlement private payloads, or global ledger authority claims.

### Gate 3: Conversation Stream UI And Event Contracts

Gate 3 makes streaming readable and durable.

Closure acceptance:

- `ConversationStreamEvent` covers model deltas, tool calls, retrieval summaries, proof roots, retry states, completion decisions, and error rows;
- the stream UI exposes collapsed readable status and expanded metadata detail without source leakage;
- telemetry carries event ids, proof roots, redaction posture, prompt/result disclosure posture, and fail-closed states;
- `pnpm run check:v37-gate3` validates stream contracts, route tests, UI tests, telemetry binding, source-safety, and workflow wiring.

Gate 3 closure adds package-backed `ConversationStreamEvent` source,
`.bitcode/v37-conversation-stream-event-contract.json`,
`source-safe-conversation-stream-event-metadata`, route-attached SSE event
metadata, rich execution log collapsed/expanded UI binding, package tests,
route tests, UI tests, workflow wiring, and `check:v37-gate3`.

### Gate 4: Fullscreen Writing Mode And Composer Workspace

Gate 4 defines the writing workspace.

Closure acceptance:

- `ConversationWritingWorkspace` owns fullscreen drafting for Read Requests, Need feedback, AssetPack review notes, and Terminal handoff summaries;
- writing state can be saved, restored, summarized, and handed off without leaking protected source;
- accessibility, keyboard behavior, responsive layout, and recovery states are tested;
- `pnpm run check:v37-gate4` validates workspace contracts, UI tests, docs, telemetry, source-safety, and workflow wiring.

Gate 4 closure adds package-backed `ConversationWritingWorkspace` source,
`.bitcode/v37-conversation-writing-workspace.json`,
`source-safe-conversation-writing-workspace-metadata`, fullscreen workspace UI
binding, Read Request, Need feedback, AssetPack review note, and Terminal
handoff summary modes, save/restore/summarize/handoff actions, route-local
draft keys, source-safe handoff summaries, package tests, UI tests, workflow
wiring, and `check:v37-gate4`.

### Gate 5: Source Selectors And Context Policy

Gate 5 defines source selection inside Conversations.

Closure acceptance:

- `ConversationSourceSelector` covers repository, branch, commit, deposit, BTD range, AssetPack preview, document, and prior conversation sources;
- selectors are governed by account, organization, wallet, rights, settlement, disclosure, and policy posture;
- selector previews are source-safe and explain denial/retry states;
- `pnpm run check:v37-gate5` validates selector contracts, rights checks, route tests, UI tests, docs, telemetry, and workflow wiring.

Gate 5 closure adds package-backed `ConversationSourceSelector` source,
`.bitcode/v37-conversation-source-selector.json`,
`source-safe-conversation-source-selector-metadata`, repository, branch,
commit, deposit, BTD range, AssetPack preview, document, and prior
conversation selector kinds, account, organization, wallet, rights,
settlement, disclosure, and policy governance dimensions, allowed, denied, and
retry-required preview states, source-safe selector UI binding, package tests,
UI tests, workflow wiring, and `check:v37-gate5`.

### Gate 6: Conversation To Terminal Transaction Handoff

Gate 6 connects conversation intent to Terminal execution.

Closure acceptance:

- `ConversationTerminalHandoff` can create source-safe Terminal handoff envelopes for Depositing, Reading, Finding Fits, Exchange, settlement, and delivery workflows;
- Terminal remains the transaction cockpit and receives replayable context without protected prompt, source, secret, or unpaid AssetPack leakage;
- handoff routes preserve transaction ids, repository anchors, source selectors, user-readable summary, policy result, and proof roots;
- `pnpm run check:v37-gate6` validates handoff contracts, route tests, Terminal integration tests, docs, telemetry, and workflow wiring.

Gate 6 closure adds package-backed `ConversationTerminalHandoff` source,
`.bitcode/v37-conversation-terminal-handoff.json`,
`source-safe-conversation-terminal-handoff-metadata`, Depositing, Reading,
Finding Fits, Exchange, settlement, and delivery handoff workflow rows,
Terminal route context parsing, source-safe handoff UI binding, package tests,
UI tests, Terminal route tests, workflow wiring, and `check:v37-gate6`.

### Gate 7: Conversation Persistence Privacy And Redaction

Gate 7 defines durable storage and privacy controls.

Gate 7 closure adds package-backed `ConversationPersistencePrivacyRedaction`
source, `.bitcode/v37-conversation-persistence-privacy-redaction.json`,
`source-safe-conversation-persistence-privacy-redaction-metadata`, public,
user-visible, organization-visible, buyer-visible, reviewer-visible, and
operator-only visibility tier separation, persist/restore/export/delete/
retention/replay/incident repair operation rows, API storage redaction for
messages, attachment metadata, execution input, and execution metadata,
source-safe UI preview controls, package tests, API tests, UI tests, workflow
wiring, and `check:v37-gate7`.

Closure acceptance:

- conversation persistence separates public, user-visible, organization-visible, buyer-visible, reviewer-visible, and operator-only data;
- protected prompts, protected model responses, source-bearing context, secrets, wallet private material, and unpaid AssetPack source are redacted or blocked;
- export, delete, retention, replay, and incident repair postures are specified and tested;
- `pnpm run check:v37-gate7` validates storage contracts, privacy tests, redaction tests, docs, telemetry, and workflow wiring.

### Gate 8: Conversations Telemetry Proof Hooks And Docs

Gate 8 binds Conversations to telemetry, proof, dashboards, and public/internal docs.

Gate 8 closure adds package-backed `ConversationTelemetryProofHooks` source,
`.bitcode/v37-conversation-telemetry-proof-hooks.json`,
`source-safe-conversation-telemetry-proof-hooks-metadata`, session/message/
stream/tool/source selector/Terminal handoff/retry/error/completion event
families, source-safe dashboard panels, runbook ids, proof roots, telemetry
roots, API stream proof hook metadata, fullscreen telemetry proof preview UI,
public conversation docs, internal operator runbook docs, package tests, API
tests, UI tests, workflow wiring, and `check:v37-gate8`.

Closure acceptance:

- conversation event families bind sessions, messages, streams, tools, source selectors, handoffs, retries, errors, and completions to source-safe telemetry;
- dashboards and runbooks expose failure and quality posture without protected payloads;
- public docs explain Conversations use, disclosure limits, Terminal handoff, and route-local history;
- `pnpm run check:v37-gate8` validates telemetry taxonomy, documentation, generated proof hooks, dashboards/runbooks, tests, and workflow wiring.

### Gate 9: Local Staging Conversations Rehearsal

Gate 9 proves Conversations locally and in staging-testnet.

Gate 9 closure adds package-backed `ConversationRehearsal` source,
`.bitcode/v37-conversation-rehearsal.json`,
`source-safe-conversation-rehearsal-metadata`, local/staging/value-bearing
mainnet blocked lanes, chat/streaming/writing/source selector/Terminal handoff/
restore/retry/redaction/error flow rows, route/UI check roots, telemetry roots,
source-safe screenshot/log roots, fullscreen Rehearsal Proof UI, package tests,
UI tests, workflow wiring, and `check:v37-gate9`.

Closure acceptance:

- local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows;
- rehearsal logs/screenshots are source-safe;
- route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible;
- `pnpm run check:v37-gate9` validates rehearsal artifacts, route/UI tests, telemetry evidence, source-safe logs/screenshots, proof roots, and blocked value-bearing mainnet posture.

### Gate 10: V37 Promotion Readiness

Gate 10 owns final generated proof, promotion workflow support, source-safe V37 promotion readiness reporting, and V37 closure.

Gate 10 closure adds package-backed `ConversationPromotionReadinessReport`
source, `.bitcode/v37-promotion-readiness-report.json`,
`source-safe-conversation-promotion-readiness-metadata`, source-safe coverage
for all V37 Conversation artifacts, `BITCODE_SPEC_V37_PROVEN.md` generation
support, promotion command dry-run support, `v37-canon-promotion.yml`, active
V37 / draft V38 posture preparation, package tests, workflow wiring, and
`check:v37-gate10`.

Closure acceptance:

- V37 promotion checks validate all Conversations artifacts, contracts, UI proof, telemetry/docs/runbook bindings, privacy/redaction evidence, handoff evidence, rehearsal proof, and generated proof appendix support;
- V37 promotion security checks require persistence and telemetry redaction to use bounded private-key PEM scanning rather than unbounded multiline regular expressions, with closed and unclosed PEM-shaped payloads covered by API tests;
- promotion scripts support V37 command planning, dry-run, generated proof output, and derived promotion commit body generation;
- promotion rewrites runtime posture to active V37 / draft V38 only after validations pass.

## Inherited V36 gate delta

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

This delta is complete for Gate 1 when `version/v37` contains the V37 spec family, roadmap posture, workflow posture, README/package docs posture, PR template title guidance, `check:v37-gate1`, and validations proving V36 active / V37 draft readiness.
