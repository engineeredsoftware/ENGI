# Bitcode Spec V29

## Status

- Version: `V29`
- V29 state: canonical promotion complete; V29 is the active Terminal transaction-depth canon and the V29 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V29`
- Canonical proof-source commit: `3cfa3e71ef553ecb25221ed7116e29eccbc4df24`
- Prior canonical anchor: `BITCODE_SPEC_V28.md`
- Prior generated proof appendix: `BITCODE_SPEC_V28_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v29-spec-family-report.json`, `.bitcode/v29-canonical-input-report.json`, `.bitcode/v29-canon-posture-drift-report.json`, V29 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V29_PROVEN.md` as the generated proof appendix for V29 promotion
- Source parity state: V29 source-side Terminal transaction, wallet/BTC, Reading observability, AssetPack disclosure, settlement repair, organization authority, UX proof, workflow, and promotion surfaces are canonicalized in the promoted V29 file family
- State: draft target opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V28`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V29'`
- Primary scope: deeper Terminal workflows and transaction operation over the promoted V28 commercial Reading, Finding Fits, AssetPack, settlement, delivery, and promotion baseline
- Prior active canon: `BITCODE_SPEC_V28.md`
- Notes companion: `BITCODE_SPEC_V29_NOTES.md`
- Delta companion: `BITCODE_SPEC_V29_DELTA.md`
- Parity companion: `BITCODE_SPEC_V29_PARITY_MATRIX.md`
- Generated proof appendix: none until V29 promotion
- Scope: V29 canonical system specification for Terminal transaction depth, operator recovery, wallet/BTC settlement operation, AssetPack disclosure and rights review, ledger/database reconciliation, organization permission decisions, and promotion-ready workflow proof over V28
- Last fully realized canonical target preserved in source: `V29`

V29 begins from promoted V28.
V28 made Depositing, Read Request, Read-Need Comprehension, Finding Fits, AssetPack synthesis, source-safe preview, settlement posture, delivery, and promotion governance coherent enough for canon.
V29 deepens the Terminal as the primary operator surface for that system.

## Version executive summary

V29 is a Terminal-depth version.
It does not create a new protocol supply law, a new `$BTD` denomination, or a versioned implementation route family.
It turns V28's promoted commercial Reading system into a more complete enterprise operator experience:

- transaction state is navigable, recoverable, and explainable;
- wallet, signer session, BTC fee, PSBT, broadcast, replacement, reorg, blocked-readiness, and recovery states are ordinary Terminal states;
- Read Request, synthesized Need, Finding Fits, source-safe AssetPack preview, settlement, rights transfer, and pull-request delivery are presented as one coherent journey;
- proof roots, telemetry, prompt/inference/tool traces, ledger state, database projection, metaphysical state, reconciliation drift, and repair actions are visible at controlled levels of detail;
- organization holdings, roles, read-license usage, and registry-derived permission decisions are first-class Terminal facts;
- V28's demonstration-origin commercial internals continue being formalized into packages and narrow APIs without importing demonstration runtime code.

V29 closes only when the Terminal can be used as a commercial transaction cockpit for the V28 Read/Fit/AssetPack system and when every V29 gate is specified, implemented, tested, documented, and promotion-ready.

## Canonical Bitcode executive summary

Bitcode is a protocol and commercial implementation for measuring technical knowledge, exchanging source-bearing AssetPacks, and settling rights through proof-backed Reading.
The active V28 canon remains:

- a Deposit supplies source material to the Bitcode depository;
- a Read Request is synthesized into a reviewed Need before any Finding Fits run;
- `ReadNeedComprehensionSynthesis` uses PTRR agents and ThricifiedGenerations to synthesize a precise Need;
- `ReadFitsFindingSynthesis` searches the depository for all threshold-passing fit deposits, uses those fits as synthesis context, and produces a source-safe AssetPack preview;
- protected AssetPack source remains hidden before settlement;
- BTC is the fee asset;
- BTD range/read-license/right transfer and delivery are ledgerized;
- paid settlement unlocks the full AssetPack as a pull request against the Reader's repository.

V29 does not redefine those laws.
V29 makes their operation deeper, more recoverable, more legible, and more completely validated in Terminal.

## V29 source-of-truth hierarchy

The V29 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V28` until V29 promotion.
2. `BITCODE_SPEC_V29.md` during V29 drafting.
3. `BITCODE_SPEC_V29_NOTES.md`.
4. `BITCODE_SPEC_V29_DELTA.md`.
5. `BITCODE_SPEC_V29_PARITY_MATRIX.md`.
6. generated V29 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V29_PROVEN.md` only after promotion.
8. source implementation, tests, internal docs, public docs, and QA evidence that realize this file family.

Older specifications are provenance only.
They must not be used as hidden current-system law.

## V29 full-system, re-implementation, and audit rule

V29 must be re-implementable and auditable from its specification family without reading conversation history.
Every Terminal state, pipeline admission boundary, proof root, ledger/database projection, disclosure rule, fee/right transfer state, and promotion gate must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V29 totality and precision enforcement rule

V29 fails closed when a Terminal feature only displays a happy-path summary while hiding missing proof, ledger, database, wallet, or delivery state.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V29 system goals, non-goals, and design principles

Goals:

- make Terminal the complete enterprise operator path for Reading transactions;
- deepen recovery, evidence, prompt/telemetry visibility, and ledger/database synchronization;
- preserve the V28 five-step Reading UX while adding transaction detail without overwhelming the default operator path;
- make BTC settlement and BTD rights transfer readable and repairable;
- make organization permissions and license usage registry-derived;
- keep local and staging validation realistic enough to reveal operational defects before promotion.

Non-goals:

- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no new `$BTD` supply law;
- no value-bearing mainnet approval;
- no broad provider completion beyond Terminal-owned hooks;
- no direct runtime dependency on `protocol-demonstration/`.

Design principles:

- low-detail by default, complete detail on expansion;
- no protected source leakage before settlement;
- typed events over raw JSON as the operator contract;
- ledger truth and database projection remain synchronized but distinct;
- failures must name the blocking primitive and the repair path.

## V29 system architecture and layer boundaries

V29 preserves the V28 architecture:

- `packages/*` own protocol, BTD, pipeline, agent, prompt, tool, storage, and interface primitives;
- `packages/pipelines/asset-pack` owns Reading pipelines and AssetPack synthesis logic;
- `packages/pipeline-hosts` owns Vercel Sandbox and host-lane execution harnesses;
- `packages/btd` owns BTD range, measuremint, BTC fee, wallet, access, ledger, reconciliation, and terminal-journal primitives;
- `uapi` owns commercial API routes and Terminal UI;
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.

Layer boundaries:

- Terminal may call commercial APIs and packages; it must not import demonstration runtime code.
- API routes may orchestrate pipelines; pipeline packages must remain reusable outside a single route.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, and settlement posture; they may not expose protected source before payment.

## V29 demonstration-origin commercial formalization canon

V29 Gate 8 makes demonstration-origin canonical helpers package-native commercial APIs.
The formal package boundary is `packages/protocol` exposed as `@bitcode/protocol`.
Commercial scripts, workflows, API surfaces, Terminal code, and package tests must import canonical posture, spec-family checks, canon-drift checks, canonical-input checks, and proof generation from `packages/protocol/src/index.js` or from the package export.
They must not import `protocol-demonstration/src/*` runtime modules.

`protocol-demonstration/` remains valuable, but it is a standalone minimal witness, not a commercial runtime dependency.
It may be executed by its own test and proof workflows.
It may be cited as historical evidence by generated proof inventories.
It must not be the imported implementation source for gate checks, promotion scripts, commercial APIs, or Terminal runtime code.

The commercial protocol package owns the active/draft posture while V29 is in flight:

- `ACTIVE_CANON_VERSION = 'V28'`;
- `DRAFT_TARGET_VERSION = 'V29'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers are exported through the package index;
- package tests and Gate 8 checks fail closed on direct demonstration-source imports.

This formalization preserves the demonstration boundary while allowing V29 promotion and later gates to operate from package-owned commercial source.

## V29 canonical domain model

The V29 domain model extends V28 operationally:

- `Deposit`: source supply with repository, branch, commit, depositor boundary, depository asset id, measurement, embedding document, and proof roots.
- `ReadRequest`: Reader-authored request with repository target, constraints, non-goals, desired artifact kinds, and context.
- `ReadNeed`: reviewed synthesis of the request, including requirements, exclusions, proof expectations, pricing vector, feedback lineage, and acceptance root.
- `FindingFitsResult`: all threshold-passing fit deposits, search roots, ranking roots, blockers, no-worthy-fit posture, and selected synthesis context.
- `AssetPackPreview`: source-safe measurements, quality score, disclosure policy, access policy, fee quote, range projection, and protected-source lock.
- `SettlementUnlock`: BTC fee proof, BTD range/read-license/right transfer, paid disclosure decision, delivery admission, and reconciliation state.
- `BtcFeeQuote`: deterministic BTC fee quote with quote root, measurement root, purpose, network, sats, pricing version, expiration, and lifecycle state.
- `WalletSignerSessionRecovery`: signer-session posture proving whether the Reader wallet can sign a PSBT without server custody.
- `BtcFeeOperationPosture`: operational state over quote, signer, PSBT, broadcast, finality, replacement, reorg, failure, and blocked readiness.
- `TerminalTransaction`: URL-addressable activity combining execution, pipeline, agent, tool, prompt, ledger, database, delivery, and proof state.
- `TerminalTransactionReadModel`: typed operator projection of a selected `TerminalTransaction`, including route state, active detail section, low-detail summary, section availability, expandable audit posture, and source-safe raw-payload boundary.

## V29 whole Bitcode operator chain

The V29 Terminal operator chain is:

```text
Readiness
  -> Deposit or select deposited source
  -> Request Read
  -> Synthesize and review Need
  -> Request Finding Fits
  -> Review source-safe AssetPack preview
  -> Prepare BTC fee and settlement
  -> Wallet signs or blocks explicitly
  -> Ledger/database/right-transfer reconciliation
  -> Paid delivery as pull request
  -> Terminal journal, proof, and repair follow-through
```

Each transition must be observable as an execution, pipeline, PTRR agent, PTRR step, ThricifiedGeneration, tool call, ledger journal row, database projection, or repair receipt where applicable.

## V29 Terminal transaction read-model canon

Terminal transaction reading is route-owned.
When Terminal has a selected transaction, `/terminal?transactionId=<id>` is the recoverable address.
`transactionDetail` selects a typed detail section and defaults to source-safe Shippables when omitted.

The Terminal transaction read model must contain:

- selected transaction identity, activity type, lens, status, participant, repository, branch, timing, and proof posture;
- route state with canonical hrefs for each section and with the former `runId` carrier removed on write;
- low-detail default summary, metrics, and posture chips sufficient for ordinary operation without opening raw JSON;
- section read models for Shippables, identity, Wallet/BTC, closure, proofs, history, journal, activity stream, and console;
- explicit section availability: available, empty, or blocked with an operator-readable reason;
- expandable detail metadata preserving row counts, metric counts, payload availability, and target DOM section ids;
- a source-safe disclosure boundary: protected AssetPack source is never displayed before settlement, and raw payloads remain audit detail rather than the default operator contract.

The model is deterministic from execution history, detail readback, route query state, and data mode.
It must tolerate partial live readback by preserving a fallback selected-run projection while naming empty or blocked sections.

## V29 Terminal UX quality and browser-proof canon

The Terminal transaction cockpit is a protocol-facing operator interface.
It must be readable by default, keyboard reachable, responsive, and browser-proven.

The cockpit must expose:

- one named `main` landmark for the Terminal route;
- a keyboard-reachable skip link to the selected transaction workspace;
- a named transaction workspace region for activity selection, filtering, and selected-result digest;
- a named selected activity detail region for the low-detail detail hero, route-owned section controls, and source-safe detail surfaces;
- explicit loading, empty, failed, blocked, and source-safe preview states with `status` or `alert` semantics where appropriate;
- contained table overflow so phone and tablet viewports do not acquire document-level horizontal overflow;
- route-owned detail controls whose current, available, empty, and blocked states are understandable before raw payload expansion.

The browser-proof contract is package-local to Terminal and exported by `apps/uapi/app/terminal/terminal-ux-browser-proof.ts`.
It identifies the required landmarks, viewports, state semantics, route checks, and evidence files.
The focused Jest test proves the contract and state semantics.
The focused Playwright spec proves the cockpit in a real browser in deterministic mock mode across key route and responsive states.

Gate 9 acceptance does not change Reading law, source disclosure law, settlement law, or organization authority law.
It makes the current V29 Terminal cockpit commercially operable enough that later local/staging promotion readiness can debug failures from the UI rather than from browser network logs alone.

## V29 local and staging promotion readiness canon

V29 promotion is admissible only when the version branch can prove both source
closure and promotion automation without relying on unstated operator memory.
Gate 10 owns that closure.

The promotion-readiness contract has five parts:

- all V29 gate scripts are invoked by gate-quality CI while `BITCODE_SPEC.txt`
  remains `V28`;
- gate-quality and canon-quality workflows also accept the promoted state after
  the V29 promotion workflow commits `BITCODE_SPEC.txt -> V29`;
- the canonical promotion command supports `--version V29`, validates the V29
  draft family, runs local proof suites, prepares V29 hand-authored status
  truth, prepares runtime canon posture for V29 active / V30 draft, generates
  `BITCODE_SPEC_V29_PROVEN.md`, writes `.bitcode/v29-*` proof artifacts, and
  then validates the promoted V29 family;
- the version-promotion workflow runs only for a `version/v29` pull request into
  `main`, validates the same proof surface, and commits the generated promotion
  artifacts back to the version branch;
- local and staging-testnet QA evidence remains source-safe: environment
  readiness, pipeline readback, Terminal browser proof, ledger/database
  reconciliation posture, protocol package posture, and promotion dry-run are
  named without committing secrets.

`packages/protocol/src/canon-posture.js` and
`packages/protocol/data/state.json` are commercial runtime posture carriers.
They must align to V28 active / V29 draft during Gate 10 work and be rewritten
to V29 active / V30 draft by promotion automation.
The Gate 10 checker is promotion-mode aware: it must accept the V28/V29 package
posture before the generated canon commit and the V29/V30 package posture after
the generated canon commit.

Gate 10 does not itself promote `BITCODE_SPEC.txt`.
It closes when `version/v29` can be pull-requested to `main` and the V29
promotion workflow has enough scripted proof to produce the standalone
canonical promotion commit.

## V29 Wallet/BTC operation canon

Wallet and BTC fee state is an ordinary Terminal transaction surface, not an opaque settlement footnote.
The canonical wallet/BTC operation model is owned by `packages/btd` and projected by Terminal.

The operation model must contain:

- quote lifecycle: quoted, accepted, expired, superseded, and failed;
- deterministic quote root over quote id, purpose, network, sats, measurement root, issue time, and expiration;
- signer recovery: missing, prepared authorization required, stored authorization requiring live reconnect, expired, revoked, failed, network mismatch, capability missing, server-custody rejected, or live authorized;
- PSBT handoff: accepted quote prepares a PSBT; the wallet signs; the signed PSBT broadcasts;
- finality states: prepared, signed, broadcast, confirmed, replaced, reorged, and failed;
- blocked-readiness receipts naming the blocker id, summary, required action, quote id, wallet session id, receipt id, and no-server-custody posture;
- Terminal read rows and metrics for state, network, sats, confirmations, quote root, wallet session, payer wallet, PSBT handoff, txid, server custody, and next action.

No server component may custody the Reader private key.
Server-side routes may prepare receipts, validate proofs, serialize quote/posture evidence, and persist registry rows only when explicitly requested.
They must not claim signature, broadcast, finality, settlement unlock, or rights transfer without matching receipt and readback evidence.

The Terminal Wallet/BTC section is source-safe before settlement.
It may reveal quote roots, state labels, txids, and readiness blockers.
It may not expose protected AssetPack source, wallet secrets, provider tokens, or private signing material.

## V29 settlement reconciliation repair canon

Settlement reconciliation is an ordinary Terminal workflow, not an after-action database debug task.
The canonical report is produced from:

- ledger observed facts: fee receipts, ledger anchors, journal entries, BTD ranges, ownership events, read licenses, and finality state;
- database projected facts: the Supabase readback rows that claim those ledger facts are durable in the application projection;
- private metaphysical canonical facts: protected source metadata, need/fit context, access policy documents, encrypted storage pointers, disputes, and telemetry context represented only by roots;
- settlement conservation checks: BTC debit/credit and fee/payment roots that must conserve before unlock;
- delivery evidence: post-settlement pull-request visibility and recovery posture.

Drift is classified before repair:

- `missing_database_projection`: the ledger has a fact that the database projection has not read back;
- `ledger_root_mismatch`: the database projection points at a different root than the ledger observation;
- `ledger_finality_mismatch`: the projected finality differs from the observed finality;
- `database_orphan_projection`: the database projects a fact that has no matching ledger observation;
- `settlement_conservation_drift`: BTC debit/credit or fee/payment accounting does not conserve.

Repair actions are canonical and auditable:

- `retry_database_readback`;
- `project_ledger_fact`;
- `update_finality_state`;
- `quarantine_database_projection`;
- `pause_settlement_unlock`;
- `recover_delivery`.

The reconciliation state is one of aligned, retryable, repairable, approval required, or blocked.
Confirmed ledger facts that are missing from the database require operator-approved projection repair.
Reorged or failed finality, database-only orphan projection, or settlement conservation drift blocks unlock and delivery.
Delivery recovery is allowed only when settlement is otherwise aligned and the full AssetPack delivery target is not visible.

Terminal must show drift classes, blockers, repair actions, proof roots, observed facts, projected facts, canonical facts, journal entries, and repair receipts before raw payloads.
The Vercel Sandbox harness must store the reconciliation report as settlement evidence when it claims ledger readback.
The API may persist schema-compatible repair receipts while richer repair actions and proof roots remain report evidence until the registry schema is formally expanded.

## V29 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: Deposit, depository asset, repository snapshot, source measurement, embedding document, source proof root, ownership boundary, deposit journal row.
- Current algorithms and derivation rules: repository inventory binds source branch/commit; deposit admission creates searchable lexical/vector evidence; depositor ownership stays separate from later Reader rights.
- Current invariants and fail-closed conditions: invalid deposit, missing repository commit, unavailable source material, or absent depositor boundary blocks Finding Fits.
- Current proof obligations: source measurement root, embedding policy root, repository snapshot root, and depositor boundary proof.
- Current source-bearing implementation basis: `apps/uapi/app/terminal`, commercial API routes, `packages/pipelines/asset-pack`, `packages/btd`, Supabase migrations, and readback scripts.
- Current validating commands and parity basis: V29 gate checks, V28 readback verifier until replaced, package tests, UAPI tests, and staging-testnet SQL/readback evidence.
- Current accepted boundaries: broader provider families remain staged unless Terminal requires a narrow GitHub-adjacent hook.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: ReadRequest, ReadNeed, prompt registry ids, PTRR agent ids, PTRR step ids, ThricifiedGeneration ids, raw output posture, parsed typed output, and acceptance root.
- Current algorithms and derivation rules: the Reader's request is not admitted to Finding Fits until `ReadNeedComprehensionSynthesis` synthesizes a Need and the user accepts it.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing Need review, or feedback lineage mismatch blocks Finding Fits.
- Current proof obligations: prompt template, interpolated prompt, input context, output schema, raw response posture, parsed output, usage, model identity, and acceptance root.
- Current source-bearing implementation basis: Reading pipeline contracts, bounded structured inference, read-review API route, Terminal Read UX, and tests.
- Current validating commands and parity basis: pipeline contract tests, route tests, prompt rendering/audit checks, local live OpenAI validation, and V29 gate checks.
- Current accepted boundaries: full-profile async push completion can deepen in V29 gates but cannot bypass source-safe preview or settlement boundaries.

#### V29 Reading pipeline observability canon

Reading pipeline observability is contract-projected, not ad hoc.
The asset-pack package owns the inventory for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, and live harness events must project back to that inventory whenever they are emitted.

The observable contract levels are:

- execution;
- phase;
- PTRR agent;
- PTRR step;
- ThricifiedGeneration;
- prompt;
- tool;
- raw output;
- parsed output.

For every live Reading stream event that can be associated with a contract, Terminal-visible telemetry carries:

- pipeline name;
- phase id;
- PTRR agent id;
- PTRR step id and step name;
- ThricifiedGeneration id and failsafe;
- prompt template id and generation prompt ids;
- tool id, input type, and output type when the event is tool-backed;
- declared return type and output schema;
- prompt template/interpolated prompt presence;
- reasoning, judgment, raw model response, and parsed typed output presence.

The Vercel Sandbox harness must export both the observability inventory and an observability coverage summary in its evidence artifact.
Coverage readback is not a settlement proof by itself; it is the operational proof that Terminal can debug a live Reading run without relying on browser network logs.
Failure to observe prompt, raw-output, parsed-output, or tool telemetry in a run that reaches those stages is a blocked-readiness signal for Gate 4+ QA.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: FindingFits query root, lexical search result, vector search result, fit deposit list, candidate score, ranking root, blocker list, and verification decision.
- Current algorithms and derivation rules: `ReadFitsFindingSynthesis` discovery searches the depository for all fits above threshold, ranks them, and uses fit deposits as contextual knowledge for AssetPack synthesis.
- Current invariants and fail-closed conditions: no-survivor asset pack, no-worthy-fit, mock/frontier source leakage, missing embedding policy, or missing candidate source root blocks implementation.
- Current proof obligations: search provider/tool ids, vector embedding policy, threshold, source roots, ranking roots, and selected-context root.
- Current source-bearing implementation basis: depository search tools, embedding configuration, AssetPack pipeline agents, and pipeline host harnesses.
- Current validating commands and parity basis: depository search tests, embedding tests, tool telemetry tests, staging readback, and Terminal stream tests.
- Current accepted boundaries: non-GitHub deposit providers are future unless required for a specific Terminal-owned repair.

### Selection and materialization

- Current canonical objects and emitted artifacts: AssetPack synthesis output, source-safe preview, delivery plan, branch artifact, pull-request delivery, branch artifacts and assetPackEvidence.
- Current algorithms and derivation rules: implementation uses discovered fit deposits as context; protected source is written only behind the paid unlock boundary; delivery materializes as a pull request after settlement.
- Current invariants and fail-closed conditions: unpaid preview cannot expose protected source; delivery cannot proceed without settlement unlock; branch identity must match ReadRequest repository context.
- Current proof obligations: synthesis prompt/output, preview policy, fee quote root, settlement unlock, delivery branch, PR id/url, and assetPackEvidence.
- Current source-bearing implementation basis: AssetPack pipeline postprocess, GitHub/VCS routes, pipeline host runner, Terminal delivery readback, and BTD package primitives.
- Current validating commands and parity basis: synthesis tests, source-leakage tests, route tests, PR delivery mocks/live checks, and V29 gate checks.
- Current accepted boundaries: full mainnet value delivery remains approval-gated.

#### V29 AssetPack disclosure rights canon

AssetPack disclosure is a first-class review object, not an incidental UI summary.
The preview before payment may show Need measurements, Finding Fits measurements, candidate ids, roots, score band, fee quote, range projection, access policy hash, and delivery target.
It must not show protected source content, the full patch, source-bearing manifest entries, or licensed read payload before the paid unlock is proven.

The disclosure review contract carries:

- `AssetPackSourceSafePreview`, which remains the source-safe preview envelope;
- `AssetPackDisclosureReview`, which binds preview id, AssetPack id, read-right state, source visibility, reader action, policy fields, range projection, roots, and protected-source leakage findings;
- owner-read, licensed-read, denied, and pending-settlement distinctions from BTD access primitives;
- paid unlock state from settlement readback;
- leakage review that fails closed when patch markers, source-code markers, or forbidden source-bearing fields appear in preview metadata.

Terminal must render disclosure review as an ordinary Reading stage surface.
Collapsed view shows visibility, reader action, policy root, review root, visible/withheld counts, leakage state, and source unlock state.
Expanded views may show the review metadata and roots, but they still may not reveal protected source before settlement.

Gate pull request titles are part of the same operator-quality posture.
Gate PRs into version branches must begin with the uppercase version and gate prefix, for example `V29 Gate 5: AssetPack Disclosure Rights And Preview Depth`, so gate history stays auditable from GitHub alone.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: wallet identity, signer session, GitHub connection, organization role, read-license, access-policy decision, permission proof.
- Current algorithms and derivation rules: registry-derived permissions decide whether an operator can read, pay, unlock, deliver, repair, or administer a transaction.
- Current invariants and fail-closed conditions: authorization denial, stale signer session, missing org role, or sensitive data projection mismatch blocks action.
- Current proof obligations: wallet signature proof, provider installation proof, role/license readback, policy id/hash, and denial reason.
- Current source-bearing implementation basis: wallet API, VCS API, BTD access primitives, Terminal permission UI, MCP/ChatGPT action gates.
- Current validating commands and parity basis: wallet tests, access tests, API route tests, Terminal permission tests, and staging auth readback.
- Current accepted boundaries: broad enterprise RBAC depth can expand inside V29 only when tied to Terminal transaction operation.

#### V29 organization interface authority canon

Organization permission authority is a BTD primitive, not a per-interface convention.
The canonical decision is `BtdOrganizationInterfaceAuthorityDecision`.
It binds actor id, organization id, organization role, organization permission grants, interface surface, action, wallet binding, registry read-access decision, settlement state, explicit confirmation state, repair approval state, target anchor, source visibility, and proof roots.

Gate 7 defines the current action set:

- `read_transaction`
- `request_read`
- `review_need`
- `request_finding_fits`
- `review_asset_pack_preview`
- `pay_btc_fee`
- `unlock_asset_pack_source`
- `deliver_asset_pack`
- `repair_projection`
- `administer_organization`

Each action has a minimum organization role, optional explicit permission grants, wallet-binding requirement, registry read-access requirement, settled-payment requirement, explicit-confirmation requirement, repair-approval requirement, and source-visibility result.
Protected-source actions fail closed unless role/grant, wallet binding, owner-read or licensed-read registry access, settlement, and interface admission all agree.
Source-safe preview actions may remain visible without protected source.

The same authority primitive must be used by:

- Terminal, as the ordinary permission explainer for selected activity detail;
- API routes, as the JSON-safe route decision for interface owners;
- MCP, as organization-scoped action authority over read-license and delivery operations;
- ChatGPT App, as connected-interface write admission over confirmed delivery writes;
- the sandbox harness, as emitted evidence for live Reading/AssetPack completion readback.

Authority proof roots include role root, permission root, read-access root, interface root, and aggregate authority root.
Terminal renders those roots with blockers and decision rows so operators can understand why a transaction can or cannot pay, unlock, deliver, repair, or administer without opening network logs.

### Disclosure and projection

- Current canonical objects and emitted artifacts: disclosure policy, projection policy, redaction decision, preview metadata, owner-read/licensed-read/denied state.
- Current algorithms and derivation rules: source-safe preview reveals measurements and rights posture, not protected AssetPack source; paid unlock changes the disclosability boundary.
- Current invariants and fail-closed conditions: public projection overexposure, missing projection policy, or unpaid source access blocks display and delivery.
- Current proof obligations: disclosure boundary proof, projection policy hash, redaction decision, and access readback.
- Current source-bearing implementation basis: BTD access/projection primitives, Terminal preview components, API route serializers, and tests.
- Current validating commands and parity basis: disclosure tests, UI tests, readback queries, and source leakage scans.
- Current accepted boundaries: public docs may summarize posture but must not expose private source.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC fee quote, PSBT, payment observation, settlement unlock, BTD range, source-to-shares, journal entry, ledger anchor, reconciliation report.
- Current algorithms and derivation rules: Share-to-Fee pricing is deterministic from measurement weights and measurement volume; BTC fee payment gates protected-source unlock and read-license/right transfer.
- Current invariants and fail-closed conditions: settlement conservation drift, missing payment proof, stale fee quote, unaccepted quote, missing signer capability, reorg, replacement, broadcast failure, or custody ambiguity blocks finality.
- Current proof obligations: quote root, signer recovery state, PSBT state, txid or blocked-readiness receipt, ledger anchor, source-to-shares report, and reconciliation result.
- Current source-bearing implementation basis: `packages/btd` fee/range/journal/reconciliation primitives, UAPI settlement routes, Terminal Wallet/BTC section, and Supabase projections.
- Current validating commands and parity basis: BTD tests, settlement route tests, Terminal wallet/BTC tests, staging ledger/database readback, and V29 gate checks.
- Current accepted boundaries: value-bearing mainnet stays outside V29 unless separately approved.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof family, member, theorem, witness artifact, replay step, generated proof appendix, validation report.
- Current algorithms and derivation rules: every promoted V29 claim needs a generated or executable witness, and every failure must preserve enough context for replay.
- Current invariants and fail-closed conditions: stale promoted status truth, missing witness, inconsistent proof root, or ungreen promotion validation blocks promotion.
- Current proof obligations: proof-family report, canonical input report, canon-posture drift report, promotion dry-run, generated appendix, and gate closure checks.
- Current source-bearing implementation basis: spec-family checker, canonical-input checker, promotion scripts, gate-quality workflows, and protocol-demonstration proof runtime.
- Current validating commands and parity basis: `check:spec-family`, V29 gate scripts, canon-posture drift checks, demonstration tests, package tests, and promotion workflow.
- Current accepted boundaries: V29 promotion automation may be hardened across gates but must be complete before `version/v29` merges to `main`.

## V29 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v29-inference-synthesis-proof.json` | prompt, model, parsed-output | prompt-complete, typed-output | render, infer, parse, persist | pipeline telemetry, route tests | Reading pipeline contracts |
| Prompt-completeness | `.bitcode/v29-prompt-completeness-proof.json` | prompt parts, templates, interpolations | no-hidden-prompt, context-bound | compose, render, record | prompt render outputs | prompt registry and tests |
| Static-code-analysis | `.bitcode/v29-static-code-analysis-proof.json` | source scans, route scans, import scans | no-versioned-routes, no-demo-import | scan, report | lint/typecheck outputs | scripts and CI |
| Verification-decisions | `.bitcode/v29-verification-decisions-proof.json` | Fit verification, preview verification | threshold, blocker, no-worthy-fit | search, rank, decide | depository search reports | asset-pack pipeline |
| Selection-and-materialization | `.bitcode/v29-selection-and-materialization-proof.json` | selected fits, delivery branch | paid-before-source, pr-delivery | synthesize, settle, deliver | AssetPack evidence, PR receipt | pipeline host and VCS routes |
| Authorization-and-sensitive-flow | `.bitcode/v29-authorization-and-sensitive-flow-proof.json` | wallet, org, license, policy | authorized-action, redaction | sign, authorize, project | wallet/access readbacks | BTD and UAPI |
| Settlement-source-to-shares | `.bitcode/v29-settlement-source-to-shares-proof.json` | fee, range, license, source shares | conservation, right-transfer | quote, pay, mint, reconcile | source-to-shares, fee receipt | BTD settlement primitives |
| Disclosure-boundary | `.bitcode/v29-disclosure-boundary-proof.json` | preview, paid unlock, denied state | no-prepay-source, paid-source | preview, unlock, read | projection-policy, leakage scans | access/projection code |
| Proof-contract | `.bitcode/v29-proof-contract.json` | families, theorems, witnesses | complete-family, replayable | generate, validate, promote | spec/proven artifacts | spec-family tools |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v29-inference-synthesis-proof.json`
- members: Reading Need synthesis, Finding Fits discovery, AssetPack synthesis, preview validation, settlement unlock inference.
- theoremIds: prompt-complete, typed-output, model-bound, telemetry-persisted.
- replayStepIds: render prompts, call model or mock, parse type, persist execution telemetry.
- witnessArtifactPaths: pipeline telemetry rows, prompt render artifacts, route test reports, staging readback.
- current member closure criteria: each inference point is a ThricifiedGeneration under a PTRR agent step with a schema-bound output.
- current member verdict shape: pass, fail, blocked, or accepted-boundary with evidence path.
- current theorem-by-theorem closure reading: no theorem is closed without prompt, input, raw output posture, parsed output, model id, and usage state.
- current theorem-to-replay grouping: prompt composition, model call, parse, persist, and UI projection.
- minimum artifact/replay binding set: execution id, pipeline id, phase id, PTRR agent id, PTRR step id, ThricifiedGeneration id, prompt id, model id, output schema id.
- current proof-object fields: proofFamily, memberId, theoremId, replayStepId, evidencePath, verdict, blocker.
- generated-artifact and test bindings: `.bitcode/v29-spec-family-report.json`, pipeline tests, route tests, and Terminal stream tests.
- fail-closed conditions: missing prompt, missing typed parse, hidden model id, or missing telemetry blocks promotion.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v29-prompt-completeness-proof.json`
- members: prompt part registry, prompt template registry, agent prompt registry, step prompt registry, sub-step prompt composition.
- theoremIds: every inference has a prompt template; every interpolated prompt is recorded; every schema is named.
- replayStepIds: collect prompt parts, compose prompt, interpolate context, record prompt payload.
- witnessArtifactPaths: rendered prompt files, telemetry rows, prompt tests.
- current member closure criteria: no inference occurs without a registered prompt path.
- current member verdict shape: pass, fail, blocked, accepted-boundary.
- current theorem-by-theorem closure reading: prompt completeness is required before parsed-envelope admissibility.
- current theorem-to-replay grouping: registry lookup, composition, interpolation, telemetry projection.
- minimum artifact/replay binding set: prompt ids, prompt part ids, context root, template text, interpolated text.
- current proof-object fields: promptId, templateId, contextRoot, inferenceId, schemaId, verdict.
- generated-artifact and test bindings: prompt inventory, prompt rendering tests, pipeline contract tests.
- fail-closed conditions: prompt contract incompleteness blocks the step.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v29-static-code-analysis-proof.json`
- members: route version scan, import boundary scan, source casing scan, lint, typecheck.
- theoremIds: no versioned active source, no demonstration runtime import, no casing drift.
- replayStepIds: scan files, compare rules, emit report.
- witnessArtifactPaths: CI logs, local command output, `.bitcode` reports.
- current member closure criteria: all required scans pass or name accepted compatibility exceptions.
- current member verdict shape: pass, fail, blocked.
- current theorem-by-theorem closure reading: source shape must match active canon posture.
- current theorem-to-replay grouping: route scan, import scan, lint/typecheck.
- minimum artifact/replay binding set: command, exit code, checked paths, violations.
- current proof-object fields: ruleId, path, result, evidence, blocker.
- generated-artifact and test bindings: gate-quality workflow and local gate scripts.
- fail-closed conditions: active versioned route, stale draft posture, or direct demo import blocks closure.

### Verification-decisions

- proofArtifactPath: `.bitcode/v29-verification-decisions-proof.json`
- members: candidate fit verification, preview verification, settlement readiness verification.
- theoremIds: threshold-admitted, no-worthy-fit-is-honest, blocked-readiness-is-explained.
- replayStepIds: search, rank, verify, decide.
- witnessArtifactPaths: search result rows, ranking roots, verification reports.
- current member closure criteria: every Fit decision has candidates, thresholds, roots, and reasons.
- current member verdict shape: worthy_fit, no_worthy_fit, blocked_readiness.
- current theorem-by-theorem closure reading: the decision must be derivable from stored candidates and Need measurements.
- current theorem-to-replay grouping: recall, ranking, scoring, verifier judgment.
- minimum artifact/replay binding set: Need id, deposit ids, scores, threshold, ranking root, verifier output.
- current proof-object fields: decision, candidates, roots, reasons, output schema.
- generated-artifact and test bindings: depository-search tests, staging readback, Terminal preview tests.
- fail-closed conditions: fabricated candidate, missing source root, or absent blocker reason.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v29-selection-and-materialization-proof.json`
- members: selected deposits, AssetPack synthesis, branch artifact, delivery PR.
- theoremIds: context-bound-synthesis, paid-before-source, delivery-target-matches-read.
- replayStepIds: select, synthesize, preview, unlock, deliver.
- witnessArtifactPaths: assetPackEvidence, delivery receipts, PR metadata.
- current member closure criteria: materialized source is never visible to Reader before paid unlock.
- current member verdict shape: preview_locked, unlock_ready, delivered, blocked.
- current theorem-by-theorem closure reading: selection and delivery must read back from settlement and source roots.
- current theorem-to-replay grouping: fit selection, synthesis, settlement unlock, VCS branch, PR creation.
- minimum artifact/replay binding set: fitDepositAssetIds, sourceRoot, settlementUnlockId, branch, pullRequest.
- current proof-object fields: selectedIds, previewPolicy, unlockDecision, deliveryReceipt, blocker.
- generated-artifact and test bindings: pipeline host tests, VCS tests, readback verifier.
- fail-closed conditions: unpaid source exposure, mismatched target repo, missing PR receipt.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v29-authorization-and-sensitive-flow-proof.json`
- members: wallet identity, signer session, provider connection, org role, read-license, policy decision.
- theoremIds: action-authorized, secret-not-projected, redaction-applied.
- replayStepIds: authenticate, authorize, project, redact.
- witnessArtifactPaths: wallet proof, connection rows, policy readback, redaction logs.
- current member closure criteria: sensitive data is only shown to authorized principals and only at the admitted boundary.
- current member verdict shape: authorized, denied, blocked, redacted.
- current theorem-by-theorem closure reading: an action cannot execute from UI intent alone.
- current theorem-to-replay grouping: identity proof, role/license lookup, policy decision, projection.
- minimum artifact/replay binding set: principal id, role/license ids, policy id/hash, decision.
- current proof-object fields: principal, policy, decision, reason, projectedFields.
- generated-artifact and test bindings: wallet/access tests, API tests, Terminal permission tests.
- fail-closed conditions: authorization denial or projection mismatch blocks action.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v29-settlement-source-to-shares-proof.json`
- members: fee quote, payment observation, BTD range, source-to-shares, read-license, journal.
- theoremIds: fee-conservation, range-conservation, license-transfer.
- replayStepIds: quote, prepare PSBT, observe payment, mint/transfer, reconcile.
- witnessArtifactPaths: `.bitcode/source-to-shares.json`, fee receipt, journal rows, ledger anchors.
- current member closure criteria: settlement must conserve BTC fee, BTD range, source shares, and right transfer.
- current member verdict shape: prepared, signed, broadcast, confirmed, blocked, reconciled.
- current theorem-by-theorem closure reading: no paid source unlock without fee and right-transfer readback.
- current theorem-to-replay grouping: quote root, payment path, ledger observation, BTD state, reconciliation.
- minimum artifact/replay binding set: fee quote root, txid or blocked receipt, range id, license id, journal id.
- current proof-object fields: quote, payment, range, license, reconciliation, blocker.
- generated-artifact and test bindings: BTD tests, settlement route tests, staging readback.
- fail-closed conditions: settlement conservation drift, stale quote, or chain reorg.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v29-disclosure-boundary-proof.json`
- members: preview, projection policy, redaction, paid unlock, denied state.
- theoremIds: no-prepay-source, paid-reader-source, denied-state-no-source.
- replayStepIds: project preview, redact source, evaluate unlock, read source.
- witnessArtifactPaths: `.bitcode/projection-policy.json`, preview payloads, leakage scan reports.
- current member closure criteria: source-bearing content crosses visibility boundary only after paid unlock.
- current member verdict shape: preview, locked, unlocked, denied, blocked.
- current theorem-by-theorem closure reading: disclosure posture must be explainable from policy, payment, and license state.
- current theorem-to-replay grouping: preview, settlement, license, projection.
- minimum artifact/replay binding set: preview id, projection policy hash, settlement unlock id, license id.
- current proof-object fields: visibility, policy, redactions, unlock, blocker.
- generated-artifact and test bindings: disclosure tests, UI tests, source leakage scans.
- fail-closed conditions: public projection overexposure or unpaid protected-source access.

### Proof-contract

- proofArtifactPath: `.bitcode/v29-proof-contract.json`
- members: spec-family report, canonical input report, canon-posture drift report, promotion proof appendix.
- theoremIds: complete-family, valid-draft, valid-promotion.
- replayStepIds: validate family, validate inputs, validate posture, generate proven, promote.
- witnessArtifactPaths: `.bitcode/v29-spec-family-report.json`, `.bitcode/v29-canonical-input-report.json`, `BITCODE_SPEC_V29_PROVEN.md`.
- current member closure criteria: promotion cannot run unless all gate checks and generated proof inputs are green.
- current member verdict shape: draft-valid, promotion-ready, promoted, blocked.
- current theorem-by-theorem closure reading: generated canon must match the hand-authored spec family and source posture.
- current theorem-to-replay grouping: check, generate, dry-run promote, commit promote.
- minimum artifact/replay binding set: spec family files, generated reports, proof-source commit, promotion command.
- current proof-object fields: version, report, currentTarget, pointer, promotionCommit, verdict.
- generated-artifact and test bindings: spec-family checker, canonical-input checker, promotion workflow.
- fail-closed conditions: stale promoted status truth, missing generated appendix, or failed gate check.

## V29 generated canon

### Inherited V19 reproducible-canon artifacts

V29 continues the reproducible-canon requirement: generated reports must be deterministic, path-addressable, and promotion-bound.

### Inherited V20 operator-quality artifacts

V29 continues operator-quality proof: Terminal workflow claims must be backed by UI, accessibility, responsive, error-state, and browser evidence where applicable.

### Exact generated-artifact inventory matrix

| artifact | required in draft | required at promotion | purpose |
| --- | --- | --- | --- |
| `.bitcode/v29-spec-family-report.json` | yes | yes | validates the hand-authored V29 family shape |
| `.bitcode/v29-canonical-input-report.json` | yes | yes | records canonical input closure for active V28 plus V29 draft |
| `.bitcode/v29-canon-posture-drift-report.json` | gate-dependent | yes | proves runtime/docs active/draft posture |
| `BITCODE_SPEC_V29_PROVEN.md` | no | yes | generated proof appendix for promoted V29 |

### V29 specifying generated artifacts

The minimum V29 generated set is `.bitcode/v29-spec-family-report.json`, `.bitcode/v29-canonical-input-report.json`, future `.bitcode/v29-canon-posture-drift-report.json`, and `BITCODE_SPEC_V29_PROVEN.md`.

### Shared generated-artifact fields

Every generated artifact must include artifact id, schema id, version, current target, source commit, command, generated timestamp, verdict, inputs, and blockers.

### Artifact-specific generated payload fields

Spec-family reports include required file lists and section counts.
Canonical-input reports include active pointer, family paths, generated artifact paths, and proof appendix posture.
Canon-posture reports include active canon, draft target, runtime carrier paths, and drift failures.
Promotion reports include proof-source commit and promotion command.

### Artifact confidentiality and disclosability taxonomy

Generated artifacts are internal by default, reviewer-visible when they contain no secrets, public only when explicitly projected, buyer-visible only after paid unlock, and never allowed to leak protected source or secrets.

### Minimum generated appendix rendered contents

`BITCODE_SPEC_V29_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any required proof input is absent.

### Canonical regeneration and fail-closed posture

Generated canon must be regenerable from repository state.
Promotion must fail closed when any required report, witness, test, proof family, or source posture is stale.

## V29 validation canon

V29 validation is layered:

- spec-family and canonical-input checks for the V29 draft;
- canon-posture drift checks for V28 active and V29 draft;
- V29 gate-specific scripts;
- package lint, typecheck, and Jest suites;
- UAPI route/component tests;
- Terminal browser, accessibility, responsive, and error-state checks;
- local non-mocked OpenAI/Supabase/Vercel Sandbox validation for gates that touch live pipeline behavior;
- staging-testnet readback where ledger/database synchronization or delivery is claimed.

## V29 promotion canon

V29 promotes only through `version/v29` into `main`.
Promotion must:

1. pass every V29 gate check;
2. pass active V28 and draft V29 posture checks before promotion;
3. generate `.bitcode/v29-*` canonical reports;
4. generate `BITCODE_SPEC_V29_PROVEN.md`;
5. update runtime posture carriers from active V28/draft V29 to active V29/next draft;
6. commit `BITCODE_SPEC.txt` changing from `V28` to `V29`;
7. keep main protected by pull request and verified-signature rules.

## V29 appendices and canonical supporting material

The appendices below are binding draft structure for V29.
They name the proof, artifact, validation, source, workflow, and fail-closed surfaces that every later gate must keep synchronized.

## Appendix A. Canonical type and surface catalog

Canonical V29 type families:

- Reading: ReadRequest, ReadNeed, FindingFitsResult, AssetPackPreview, SettlementUnlock.
- Pipeline: execution, pipeline, phase, PTRR agent, PTRR step, ThricifiedGeneration, tool call, prompt record, parsed output.
- Terminal: TerminalTransaction, journal row, stream row, detail accordion, repair action.
- BTD: range, source-to-shares, access policy, read-license, BTC fee quote, payment observation, ledger anchor, reconciliation report.
- Delivery: branch artifact, AssetPack evidence, pull request, delivery repair receipt.

## Appendix B. Proof family closure catalog

Each proof family named in the proof-family canon must have members, theorems, replay steps, witness artifacts, generated artifacts, and fail-closed conditions before V29 promotion.

## Appendix C. Generated artifact contract catalog

The V29 generated-artifact contract is exactly the generated canon section above plus Appendix K source-bearing artifact constraints.

## Appendix D. Validation and checking gate catalog

Gate validation starts with `pnpm run check:v29-gate1`.
Later gates must add focused scripts before claiming implementation closure.
Promotion validation must run all V29 gate scripts, source scans, package tests, UAPI tests, demonstration proof checks, generated report checks, and diff hygiene.

## Appendix E. Current canonical source map

Source map:

- `BITCODE_SPEC.txt`: active canon pointer, still `V28` during V29 drafting.
- `BITCODE_SPEC_V29.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`: draft target family.
- `protocol-demonstration/src/canon-posture.js`: active/draft runtime posture carrier.
- `packages/pipelines/asset-pack`: Reading pipeline and AssetPack synthesis source.
- `packages/pipeline-hosts`: sandbox/harness execution source.
- `packages/btd`: BTD, BTC, rights, journal, and reconciliation primitives.
- `apps/uapi/app/terminal`: Terminal operator surface.
- `.github/workflows`: gate and promotion automation.

## Appendix F. Subsystem totality and derivability matrix

V29 must cover repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

The subsystem sections in the canonical subsystem surfaces chapter are the active derivability matrix rows for V29.

## Appendix G. Canonical file-family and promotion contract catalog

V29 file family:

- `BITCODE_SPEC_V29.md`
- `BITCODE_SPEC_V29_DELTA.md`
- `BITCODE_SPEC_V29_NOTES.md`
- `BITCODE_SPEC_V29_PARITY_MATRIX.md`
- future `BITCODE_SPEC_V29_PROVEN.md`
- `.bitcode/v29-spec-family-report.json`
- `.bitcode/v29-canonical-input-report.json`
- future `.bitcode/v29-canon-posture-drift-report.json`

## Appendix H. Operator surface and quality contract catalog

Terminal quality must include:

- URL-addressable transaction state;
- guided low-detail default path;
- expandable complete detail;
- readable live stream rows for pipeline, agent, tool, prompt, ledger, and delivery activity;
- keyboard and screen-reader usable controls;
- responsive layout;
- explicit empty, loading, blocked, failed, repaired, paid, and delivered states.

## Appendix I. Scenario, workflow, and cross-product contract catalog

V29 cross-product scenarios include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

These names are scenario/workflow coverage labels, not new product brands.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed states:

- invalid deposit blocks Finding Fits;
- prompt contract incompleteness blocks inference;
- parsed-envelope inadmissibility blocks typed pipeline output;
- no-survivor asset pack blocks preview and settlement;
- authorization denial blocks protected action;
- public projection overexposure blocks display;
- settlement conservation drift blocks unlock and delivery;
- stale promoted status truth blocks promotion.

Every fail-closed state must carry a readable Terminal blocker and a repair or retry posture when repair is allowed.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts include:

- `.bitcode/asset-pack.lock.json`
- `.bitcode/selected-source-material.json`
- `.bitcode/verification-report.json`
- `.bitcode/source-to-shares.json`
- `.bitcode/projection-policy.json`
- `.bitcode/system-proof-bundle.json`
- `BITCODE_SPEC_V29_PROVEN.md`

Before settlement, the Reader may see only source-safe preview metadata.
After settlement, the Reader may receive the full AssetPack source according to the paid read-license/right transfer and delivery policy.

## V29 accepted boundaries and reopen conditions

Accepted boundaries:

- V29 remains Terminal-depth, not Exchange depth.
- V29 may deepen MCP/ChatGPT only where Terminal transaction authority requires shared permission truth.
- V29 may harden demonstration-origin commercial internals but must keep the demonstration standalone.
- V29 may use staging-testnet and local live validation; value-bearing mainnet remains separately approved.
- V29 promotion automation may be implemented across gates, but it must be complete before promotion.

Reopen conditions:

- V28 promoted law is found inconsistent with source behavior.
- Terminal exposes protected source before settlement.
- ledger/database projection contradicts settlement truth.
- organization permission decisions cannot be derived from registry/access policy state.
- gate workflow cannot fail closed for stale active/draft posture.

## V29 completion condition

V29 is complete only when:

- all gates in the V29 parity matrix are closed;
- the Terminal supports the deep transaction workflows specified here;
- live or bounded-real validation proves the claimed Reading/settlement/delivery paths;
- promotion workflows can promote only `version/v29`;
- generated V29 proof artifacts and `BITCODE_SPEC_V29_PROVEN.md` are produced;
- `BITCODE_SPEC.txt` changes from `V28` to `V29` only in the formal promotion commit.
