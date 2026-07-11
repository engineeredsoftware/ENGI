# Terminal Implementation Module

This module owns the Terminal implementation. The canonical product
route is `/terminal`. No retained compatibility route belongs to this surface;
old route boundaries must be reformed in place into Terminal source.

Its job is to keep one operator route coherent:
- recent Terminal activity as the scoped read surface,
- selected activity detail as the selected result surface,
- deposit and read as the primary write actions,
- fullscreen conversations and auxillaries as adjacent modes entered from the product shell,
- and the mounted demonstration witness available only when dense proof/settlement inspection is required.

## Main experience model

V28 MVP hardening keeps these product experiences route-correct:
- `terminal activity`
- `conversations`
- `auxillaries`

The Terminal keeps two primary write actions:
- `deposit`
- `read`

`/terminal` owns Terminal activity directly and launches the adjacent modes without
presenting them as part of Terminal itself.

## Main route systems

- `TerminalPageClient.tsx`
  Route owner, activity-query state owner, and shell/auxillary/conversation entry owner.
- `TerminalTransactionWorkspace.tsx`
  Main Terminal activity and selected-result shell.
- `terminal-transaction-query.ts`
  Route-owned filter, paging, selected-activity state, and source-safe
  ConversationTerminalHandoff context parsing.
- `terminal-transaction-read-model.ts`
  Typed selected-transaction projection for recoverable route hrefs, low-detail
  operator summary, detail-section availability, and expandable audit posture
  before raw payload inspection.
- `terminal-journal-reconciliation.ts` and `TerminalTransactionJournalReconciliationCard.tsx`
  Selected-activity Journal section owner for ledger observations, database
  projections, canonical root facts, repair receipts, and drift state.
- `terminal-wallet-btc-operation.ts` and `TerminalTransactionWalletBtcCard.tsx`
  Selected-activity Wallet/BTC section owner for signer recovery, fee quote,
  PSBT handoff, transaction id, finality, blocked readiness, and no-custody
  posture.
- `TerminalCommandDeck.tsx`
  Scenario, projection, branch mode, reset, and flow-guide entry posture.
- `TerminalDepositReadWorkbench.tsx`
  Deposit and read write posture inside the route.
- `TerminalPreservedShellSurface.tsx`
  Demonstration witness drawer for proof/settlement follow-through.
- `terminal-shell-bridge.tsx`
  Shared mounted-shell snapshot/control bridge.

## Current V28 checkpoint expectations

MVP checkpoint confidence requires `/terminal` to be:
- renderable in mock-mode review,
- route-query owned for activity selection and filtering,
- user-facing in copy and help posture,
- free of demo/tutorial/gate narration in the visible product surface,
- free of generic settings/configuration language when the live surface is really expressing auxillary or interface posture,
- able to reopen auxillaries as a full-width contained auxillary shell without collapsing the activity ledger into modal-width account furniture,
- supported by shared execution carriers instead of growing page-local duplication,
- documented alongside the root/package/shared-component README family as required Terminal implementation scope,
- and backed by proof/test/doc carriers that reflect the real route shape.

No compatibility route should be added for this surface. Route continuity must
come from current Terminal URLs and current product navigation.

## V37 ConversationTerminalHandoff route context

Website Conversations may open `/terminal` with `conversationHandoff=1` when
the payload is a source-safe `ConversationTerminalHandoff` envelope. Terminal
route context may include conversation id, transaction id, handoff workflow,
policy result, proof root, repository anchor, source selector refs,
source-safe summary, and selected transaction detail. Terminal displays that
context as operator posture only; it does not treat Conversations as ledger,
wallet, settlement, Exchange, delivery, or BTD ownership authority.

The handoff route must not carry protected source, raw protected prompts,
protected model responses with source, provider tokens, wallet private
material, settlement private payloads, unpaid AssetPack source, ledger write
authority, wallet signing authority, or Terminal authority bypass. Gate 6 is
checked by `pnpm run check:v37-gate6`.

## V39 Enterprise Reading UX state

Gate 3 introduces `TerminalEnterpriseReadingUxState` as the Terminal-owned
state contract for the enterprise Reading path. The five stable stages are
request Read, review synthesized Need, request Finding Fits, review
source-safe AssetPack preview, and buy AssetPack/settle. The default display is
low-detail operator guidance; each stage can expand source-safe detail,
visible metadata fields, and blockers without exposing protected source, raw
protected prompts, raw provider responses, unpaid AssetPack source, wallet
private material, private settlement payloads, or ledger write authority.

`TerminalDepositReadWorkbench.tsx` renders the stage cards with stable
`terminal-enterprise-reading-step-*` test ids and keeps
`BitcodeExecutionStreamPanel` as the live Reading pipeline stream surface.
Conversation handoffs can provide `readingStage` route intent, but Terminal
parses it only as operator posture. The source-safe generated artifact is
`.bitcode/v39-enterprise-reading-ux-state.json`, checked by
`pnpm run check:v39-gate3`.

V42 Gate 3 extends that state into the current Reading shortest path recovery
contract. `TerminalEnterpriseReadingRouteState` binds transaction id presence,
the `readingStage` query parameter, active-stage hydration, retry and restart
posture, source-safe failure kind, and repair actions. Terminal may restore a
later stage from route state after refresh or handoff, but blockers still hold:
accepted Need gates Finding Fits, source-safe AssetPack preview gates
settlement, and settlement readback gates delivery. The source-safe proof
artifact is `.bitcode/v42-reading-shortest-path-state-machine.json`, checked by
`pnpm run check:v42-gate3`.

V42 Gate 4 closes the Terminal ReadNeed review loop. The staged Reading
surface now keeps `ReadNeedReviewResynthesisRuntime`, storage projection rows,
telemetry return type, runtime root, storage root, telemetry root, admission
blockers, and rejected Need posture visible in expandable source-safe detail.
Terminal exposes synthesize, resynthesize, accept, and reject actions before
Finding Fits; accepting the Need is the only admission handoff to
`ReadFitsFindingSynthesis`. The source-safe proof artifact is
`.bitcode/v42-readneed-review-resynthesis-product-closure.json`, checked by
`pnpm run check:v42-gate4`.

V42 Gate 5 closes the Terminal Finding Fits preview and quote readback. The
source-safe preview panel now reads `AssetPackPreviewBoundary` summaries from
pipeline harness evidence, including selected-fit provenance, deterministic
quote receipt, settlement instructions, delivery posture, replay root, and
storage record count. Terminal keeps those rows expandable and metadata-only:
protected source and unpaid AssetPack source stay withheld until settlement
and rights-transfer readback. The source-safe proof artifact is
`.bitcode/v42-readfitsfinding-preview-quote.json`, checked by
`pnpm run check:v42-gate5`.

V42 Gate 6 closes Terminal Settlement rights readback. The paid-boundary panel
now reads `AssetPackSettlementRightsDeliveryBoundary` summaries from pipeline
harness evidence, including BTC payment observation, finality, source-to-shares
compensation, BTD rights transfer, paid read receipt, source-bearing
pull-request delivery unlock, ledger/database/object-storage reconciliation,
replay root, repair posture, and storage record count. Terminal keeps these
rows expandable and source-safe: it may show that delivery is unlocked for the
paid Reader after settlement, but it must not expose unpaid AssetPack source,
protected source, wallet private material, private settlement payloads,
credentials, raw protected prompts, or raw provider responses. The source-safe
proof artifact is `.bitcode/v42-settlement-rights-delivery.json`, checked by
`pnpm run check:v42-gate6`.

V42 Gate 8 closes local/staging full MVP rehearsal readback for Terminal.
The route remains `/terminal` during V42, but the proof now binds the whole
MVP chain: deposit source, request read, review synthesized Need, request
Finding Fits, review source-safe AssetPack preview and quote, buy/settle,
receive repository delivery, and inspect rich stream telemetry/database
readback. The source-safe proof artifact is
`.bitcode/v42-local-staging-mvp-rehearsal.json`, checked by
`pnpm run check:v42-gate8`. Generated rehearsal data may carry lane ids,
stage ids, roots, staging-testnet project `tkpyosihuouusyaxtbau`, and repair
posture; it must not carry protected source, unpaid AssetPack source, raw
prompts, provider responses, credentials, wallet private material, private
settlement payloads, or live logs.

## Live staging-testnet QA

Terminal Deposit/Read QA starts only after Wallet and Externals prerequisites are
green in the live staging deployment. The minimum accepted starting state is a
wallet-authenticated Supabase user, Bitcode wallet binding projection,
GitHub App installation, and at least one `vcs_repositories` row for the source
scope. The current walkthrough fixture uses `engineeredsoftware/ENGI`, but
Terminal implementation remains generic across repository, branch, commit, and
source type.

The first MVP write/read checks are:

- `Record deposit posture` writes `agentic-execution:asset-pack` with deposit state.
- `Record read posture` writes `agentic-execution:read-measurement` after
  Deposit/source posture exists.
- `Record fit posture` writes `agentic-execution:proof-refresh`.
- `Make Bitcode branch` either writes branch/AssetPack follow-through or fails
  closed with an exact transaction-readiness blocker.

Reusable Supabase query files for this pass live in `supabase/queries/`:

- `v28_qa_terminal_01_prerequisites_wallet_github_repo.sql`
- `v28_qa_terminal_02_activity_after_write.sql`
- `v28_qa_terminal_03_btd_ledger_after_terminal.sql`
- `v28_qa_terminal_04_deposit_repository_alignment.sql`

Those queries are the operator evidence path for proving Terminal UI, API
history, GitHub source inventory, and BTD ledger projections stay synchronized
while the MVP is being QAed.

When `transactionDetail=journal` is selected, the detail route must read
Terminal journal rows and reconciliation repair receipts through
`/api/executions/history/[runId]`; the UI may expose the raw payload accordion
for audit, but the operator-facing visual state must make retryable,
repairable, approval-required, blocked, and aligned states distinguishable
without browser-network inspection.

## V29 transaction-depth checkpoint

The selected activity is now modeled as a `TerminalTransactionReadModel`.
Terminal must write `transactionId` into the route for the first selectable row
so a bare `/terminal` load becomes recoverable as soon as live, projected, or
review-fallback activity exists. Detail focus is carried by `transactionDetail`.
Former `runId` links are still accepted on read and rewritten on write.

Ordinary operators should read the low-detail model first: summary, proof
posture, metrics, posture chips, and section availability. Shippables,
identity, Wallet/BTC, closure, proofs, history, journal, activity stream, and
console each declare whether they are available, empty, or blocked. Raw payloads
remain audit material behind expansion, not the normal navigation contract.

The Wallet/BTC section projects BTC fee operation state without exposing wallet
secrets or protected AssetPack source. It should show quote root, wallet session,
payer wallet, PSBT handoff, txid, state, confirmations, blockers, and server
custody posture as ordinary rows before the operator opens raw ledger payloads.

The live Reading harness stream projects `ReadNeedComprehensionSynthesis` and
`ReadFitsFindingSynthesis` telemetry into the shared execution panel. Collapsed
rows should identify the pipeline, phase, PTRR step, ThricifiedGeneration,
prompt/tool/schema posture, and result shape. Expanded metadata remains the
place for prompt templates, interpolated prompts, raw model responses, parsed
typed outputs, tool inputs/outputs, and harness evidence coverage.

The Journal section is also the settlement reconciliation repair cockpit.
It must distinguish ledger-observed facts, database-projected facts,
object-storage artifact facts, and metaphysical canonical root facts; classify
drift; show blocking reasons; surface repair actions; list proof roots; and
keep repair receipts readable. BTC fee conservation drift blocks unlock,
confirmed ledger facts missing from database projection require approval,
object-storage root mismatches require quarantine, missing durable artifacts
are retryable unlock blockers, and settled transactions with missing
pull-request delivery surface delivery recovery without exposing protected
AssetPack source before payment.

Source-to-shares settlement evidence should enter the Terminal as a package
proof, not as route-local accounting. The BTD source-to-shares proof binds
fit-deposit measurements, contribution weights, BTD range slices, exact BTC fee
allocation, conservation verdicts, zero-cell/refit tail posture, ancestry
evidence, and a reconciliation-compatible conservation check. Operators should
read no-overpayment and no-underpayment separately so overpaid, underpaid, and
drifted settlements are repairable without exposing protected AssetPack source.

Bridge-readiness research evidence should also enter Terminal through the BTD
package boundary. Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future
distribution paths are visible only as research posture: each path names
feasibility, risks, rereview triggers, required proof, and required policy, and
the selected-activity detail must preserve `no_bridge_chain_of_record` as the
current `$BTD` truth until a future promoted spec admits otherwise.

Protocol telemetry proof hooks should enter Terminal through
`/btd/protocol-telemetry`, not through route-local log projection. The BTD
package emits `BtdProtocolTelemetryEnvelope` objects with source-safe telemetry
records and proof hooks for receipts, BTC fee states, ledger projections,
source-to-shares proofs, and bridge-readiness posture. Collapsed rows should
show event, subject kind, subject id, severity, and proof compatibility;
expanded metadata may show roots, theorem ids, replay steps, witness artifact
paths, and generated artifact paths, but never protected source or secrets.

Interface integration regression proof enters Terminal through the client-safe
`@bitcode/btd/interface-integration-contract` subpath and the server-side
`/btd/interface-integration-regression` route. Terminal records the current
Terminal, API, MCP, ChatGPT App, Auxillaries hook, and Exchange hook consumers
as package-owned BTD object consumers. The low-detail cockpit must remain
source-safe, and the proof must reject route-local BTD policy copies, source
leakage, or selected-transaction behavior regression before Gate 10 promotion
readiness.

## V35 telemetry documentation integration

Terminal consumes the package-owned `TelemetryDocumentationInterfaceIntegration`
contract and the generated source-safe artifact
`.bitcode/v35-telemetry-documentation-interface-integration.json`.
Terminal activity rows and execution-log details may expose event ids, proof
roots, docs links, runbook links, and redaction posture so operators can move
from a visible row to its documentation and repair path without browser-network
inspection.

Terminal must still keep protected source, secret values, wallet private
material, raw protected prompts, and unpaid AssetPack source out of visible
payloads. Expanded metadata can show source-safe correlation ids, state labels,
summary counts, and proof roots, but source-bearing AssetPack contents cross to
the reader only after settlement and rights transfer.

`LocalStagingTelemetryDocumentationRehearsal` is the Gate 9 rehearsal contract
Terminal follows before promotion. Its source-safe artifact
`.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json` ties the
Terminal log stream to local/staging-testnet documentation discovery,
telemetry event emission, dashboard/runbook lookup, docs QA, incident drills,
redacted screenshot/log roots, proof-root review, and blocked value-bearing
mainnet posture.

The Organization Authority section is the selected-activity permission
explainer. It projects registry-derived organization role, explicit grants,
wallet binding, owner-read or licensed-read access, policy id/hash, multi-sig
readiness, settlement state, confirmation state, interface admission, blockers,
and proof roots before raw authority payload inspection. Terminal projects the
same `BtdOrganizationPolicyAuthority` object that Auxillaries receives as
`organizationAuthority`, including the wrapped interface decision when present.
Terminal may show source-safe previews without a paid unlock, but
protected-source unlock and delivery remain blocked until the same authority
evidence admits the action.

## V29 Terminal UX browser proof checkpoint

The Terminal cockpit is now browser-proofed as a transaction operation surface,
not only a collection of panels. The route must expose a named `main` landmark,
a keyboard-reachable skip link into `#terminalTransactionWorkspace`, named
workspace/detail regions, explicit loading/empty/error/blocked state semantics,
and contained table overflow for phone through widescreen viewports.

The browser-proof contract lives in `terminal-ux-browser-proof.ts`. It names the
required landmarks, state semantics, viewport set, route checks, and evidence
files used by Gate 9. The focused Jest test proves the contract and UI state
semantics; the focused Playwright spec proves the cockpit through a real browser
in deterministic mock mode. Playwright readiness waits on the Terminal route
itself through `PLAYWRIGHT_READY_URL` so an open dev-server port is not mistaken
for a rendered cockpit. Gate 9 does not reveal protected AssetPack source, does
not redesign Reading, and does not add versioned routes.

## Related shared systems

- [../../components/bitcode/execution/README.md](../../components/bitcode/execution/README.md)
- [../auxillaries/README.md](../auxillaries/README.md)
- [../../../protocol-demonstration/README.md](../../../protocol-demonstration/README.md)
