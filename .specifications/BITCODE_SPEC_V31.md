# Bitcode Spec V31

## Status

- Version: `V31`
- V31 state: canonical promotion complete; V31 is the active Auxillaries support/control canon and the V31 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V31`
- Canonical proof-source commit: `8c711604600afe1d1e477d3c180d653602203d0f`
- Prior canonical anchor: `BITCODE_SPEC_V30.md`
- Prior generated proof appendix: `BITCODE_SPEC_V30_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v31/spec-family-report.json`, `.proofs/v31/canonical-input-report.json`, `.proofs/v31/canon-posture-drift-report.json`, `.proofs/v31/auxillaries-telemetry-proof-hooks.json`, V31 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V31_PROVEN.md` as the generated proof appendix for V31 promotion
- Source parity state: V31 source-side Auxillaries package contracts, route data, client hooks, panes, organization authority, recovery runs, telemetry/proof hooks, UX/accessibility, workflow, and promotion surfaces are canonicalized in the promoted V31 file family
- State: draft target opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V30`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V31'`
- Primary scope: Auxillaries deepening over the promoted V30 Protocol/BTD commercial baseline
- Prior active canon: `BITCODE_SPEC_V30.md`
- Notes companion: `BITCODE_SPEC_V31_NOTES.md`
- Delta companion: `BITCODE_SPEC_V31_DELTA.md`
- Parity companion: `BITCODE_SPEC_V31_PARITY_MATRIX.md`
- Generated proof appendix: none until V31 promotion
- Scope: V31 canonical system specification for Auxillaries support/control surfaces: Profile, account, provider connection, interface admission, Wallet, BTD pane, organization authority, policy decision, readiness diagnostics, recovery runs, accessibility/responsive UX, source-safe telemetry proof hooks, and promotion-ready workflow proof over V30
- Last fully realized canonical target preserved in source: `V31`

V31 begins from promoted V30.
V30 hardened the Protocol and BTD rails beneath promoted Reading, Finding Fits, AssetPack preview, settlement, rights transfer, delivery, projection, proof, and promotion posture.
V31 deepens Auxillaries so enterprise users have a reliable support plane for profile, account, provider, wallet, organization, team, role, policy, connection, interface, readiness, recovery, and accessibility workflows without redefining Terminal transaction law or BTD tokenomics.

## Version executive summary

V31 is an Auxillaries-deepening version.
It does not create a new protocol supply law, a new `$BTD` denomination, or a versioned implementation route family.
It turns V30's promoted Protocol/BTD substrate into a stronger user and organization support plane:

- Profile and account state are typed, persisted, projected, and recoverable;
- Connects expose provider readiness, token posture, repair actions, and fail-closed connection boundaries;
- Interfaces enumerate admitted MCP, ChatGPT App, API, Terminal, Exchange, and future interface hooks without owning their product state;
- Wallet and BTD panes show capability, signer, treasury, read-right, and settlement-readiness posture from package-owned objects;
- team, organization, role, multi-sig, and policy controls become source-safe and testable rather than decorative settings;
- readiness diagnostics and recovery flows tell users exactly what blocks action and which repair path is admitted;
- Auxillaries UX becomes responsive, accessible, low-detail by default, and expandable into full audit detail.

V31 closes only when Auxillaries can safely support the commercial Reading and future Exchange/interface experience with account, wallet, provider, organization, role, policy, recovery, telemetry, and proof posture and when every V31 gate is specified, implemented, tested, documented, and promotion-ready.

## Canonical Bitcode executive summary

Bitcode is a protocol and commercial implementation for measuring technical knowledge, exchanging source-bearing AssetPacks, and settling rights through proof-backed Reading.
The active V30 canon remains:

- a Deposit supplies source material to the Bitcode depository;
- a Read Request is synthesized into a reviewed Need before any Finding Fits run;
- `ReadNeedComprehensionSynthesis` uses PTRR agents and ThricifiedGenerations to synthesize a precise Need;
- `ReadFitsFindingSynthesis` searches the depository for all threshold-passing fit deposits, uses those fits as synthesis context, and produces a source-safe AssetPack preview;
- protected AssetPack source remains hidden before settlement;
- BTC is the fee asset;
- BTD range/read-license/right transfer and delivery are ledgerized;
- paid settlement unlocks the full AssetPack as a pull request against the Reader's repository.

V31 does not redefine those laws.
V31 makes their protocol rails more precise, typed, auditable, and production-hardened.

## V31 source-of-truth hierarchy

The V31 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V30` until V31 promotion.
2. `BITCODE_SPEC_V31.md` during V31 drafting.
3. `BITCODE_SPEC_V31_NOTES.md`.
4. `BITCODE_SPEC_V31_DELTA.md`.
5. `BITCODE_SPEC_V31_PARITY_MATRIX.md`.
6. generated V31 artifacts under `.proofs/` when produced.
7. `BITCODE_SPEC_V31_PROVEN.md` only after promotion.
8. source implementation, tests, internal docs, public docs, and QA evidence that realize this file family.

Older specifications are provenance only.
They must not be used as hidden current-system law.

## V31 full-system, re-implementation, and audit rule

V31 must be re-implementable and auditable from its specification family without reading conversation history.
Every Auxillaries account, profile, connection, provider, wallet, BTD, organization, team, role, policy, readiness, recovery, proof, and promotion gate must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V31 totality and precision enforcement rule

V31 fails closed when an Auxillaries feature only displays a happy-path summary while hiding missing proof, account, provider, wallet, role, policy, permission, readiness, recovery, or delivery-support state.
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

## V31 system goals, non-goals, and design principles

Goals:

- make Auxillaries the reliable support plane for enterprise Bitcode accounts;
- type Profile, Connects, Interfaces, Wallet, BTD, team, organization, role, multi-sig, and policy state through package/API boundaries;
- expose provider readiness and connection recovery without leaking tokens, keys, protected source, or private prompts;
- make Wallet and BTD panes consume V30 package-owned wallet, signer, BTD, settlement, and receipt objects rather than route-local approximations;
- make organization policy and role decisions visible, auditable, repairable, and reusable by Terminal and future Exchange flows;
- define source-safe readiness diagnostics and recovery flows for every Auxillaries pane;
- prove responsive, accessible, low-detail/expandable UX over the active Auxillaries surface.

Non-goals:

- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no new `$BTD` supply law;
- no value-bearing mainnet approval;
- no broad provider completion outside the Auxillaries provider-readiness and recovery boundaries admitted by V31 gates;
- no Terminal transaction law redesign;
- no direct runtime dependency on `protocol-demonstration/`.

Design principles:

- typed readiness and policy objects before prose summaries;
- no protected source, provider token, wallet secret, or private prompt leakage;
- typed events over raw JSON as the operator and API contract;
- ledger truth, database projection, provider readback, and UI summaries remain synchronized but distinct;
- failures must name the blocking primitive and the repair path.

## V31 system architecture and layer boundaries

V31 preserves the V30 architecture:

- `packages/*` own protocol, BTD, pipeline, agent, prompt, tool, storage, and interface primitives;
- `packages/api` and `packages/orm` own reusable Auxillaries route contracts, profile/account hydration, organization records, and connection projections;
- `packages/pipelines/asset-pack` owns Reading pipelines and AssetPack synthesis logic;
- `packages/pipeline-hosts` owns Vercel Sandbox and host-lane execution harnesses;
- `packages/btd` owns BTD range, measuremint, BTC fee, wallet, access, ledger, reconciliation, and terminal-journal primitives;
- `uapi` owns commercial API routes, Terminal, Auxillaries, Exchange placeholders, Conversations, and operator UI surfaces;
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- API routes may orchestrate pipelines; pipeline packages must remain reusable outside a single route.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, and settlement posture; they may not expose protected source before payment.
- Auxillaries may expose provider status, account readiness, wallet capability, role/policy decisions, and recovery steps; it may not own Terminal transaction state, Exchange market state, or protected AssetPack source.

## V31 Auxillaries package API and account support canon

V31 treats `packages/api`, `packages/orm`, `packages/btd`, `packages/vcs`, provider packages, and `apps/uapi/app/auxillaries` as the commercial Auxillaries deepening substrate.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, spec-family checks, generated-proof helpers, and promotion-governance helper APIs;
- `@bitcode/orm` owns profile/account hydration, wallet binding fields, user connections, organizations, organization members, BTD treasury rows, usage rows, and registry projections;
- `@bitcode/api` owns JSON-safe Auxillaries route contracts over package primitives, never hidden provider or policy logic;
- `@bitcode/btd` owns BTD range/read-license/right-transfer state, wallet capability, access policy, treasury posture, and reconciliation primitives consumed by Auxillaries panes;
- provider packages own connection capability descriptors and token-readiness evidence for their provider family;
- `apps/uapi/app/auxillaries` owns the product UI and user workflow, not the primitive policy derivation.

The commercial protocol package owns the active/draft posture while V31 is in flight:

- `ACTIVE_CANON_VERSION = 'V30'`;
- `DRAFT_TARGET_VERSION = 'V31'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers are exported through the package index;
- package tests and V31 checks fail closed on direct demonstration-source imports.

V31 must reduce ambiguous cross-package behavior.
Any profile, account, connection, wallet, BTD, organization, team, role, permission, policy, readiness, recovery, or interface object used by more than one route/interface must become a package-owned type, builder, parser, validator, and test fixture before the gate that depends on it closes.

## V31 canonical domain model

The V31 domain model extends V30 operationally:

- `Deposit`: source supply with repository, branch, commit, depositor boundary, depository asset id, measurement, embedding document, and proof roots.
- `ReadRequest`: Reader-authored request with repository target, constraints, non-goals, desired artifact kinds, and context.
- `ReadNeed`: reviewed synthesis of the request, including requirements, exclusions, proof expectations, pricing vector, feedback lineage, and acceptance root.
- `FindingFitsResult`: all threshold-passing fit deposits, search roots, ranking roots, blockers, no-worthy-fit posture, and selected synthesis context.
- `AssetPackPreview`: source-safe measurements, quality score, disclosure policy, access policy, fee quote, range projection, and protected-source lock.
- `SettlementUnlock`: BTC fee proof, BTD range/read-license/right transfer, paid disclosure decision, delivery admission, and reconciliation state.
- `BtcFeeQuote`: deterministic BTC fee quote with quote root, measurement root, purpose, network, sats, pricing version, expiration, and lifecycle state.
- `WalletSignerSessionRecovery`: signer-session posture proving whether the Reader wallet can sign a PSBT without server custody.
- `BtcFeeNetworkPolicy`: proof-rooted environment and network admission posture over local, staging-testnet, and production-mainnet value-bearing BTC settlement.
- `BtcFeeTaprootPsbtPosture`: proof-rooted Taproot commitment, script path, PSBT handoff, broadcast observation, replacement, reorg, and finality posture.
- `BtcFeeOperationPosture`: operational state over quote, signer, network policy, Taproot/script posture, PSBT, broadcast, finality, replacement, reorg, failure, and blocked readiness.
- `BtdAssetPackMintReceipt`: typed receipt binding AssetPack id, BTD range, depositor ownership, source-safe preview root, mint measurement root, settlement conservation root, and ledger projection root.
- `BtdReadReceipt`: typed receipt binding Reader, read request, accepted Need, Finding Fits result root, source-safe preview root, paid/unpaid disclosure state, read-right state, and delivery admission.
- `BtdRightsTransferReceipt`: typed receipt binding BTC fee finality, BTD owner or license transition, range projection, paid unlock, delivery proof, and reconciliation status.
- `SourceToSharesProof`: deterministic contribution and settlement accounting proof over fit deposits, measurements, range slices, fee quote, conservation checks, zero-cell/refit tail state, and no-overpayment/no-underpayment invariants.
- `BridgeReadinessResearchPosture`: non-chain-of-record research record for Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future bridge paths, carrying feasibility, risk, current non-admission, and rereview triggers.
- `TerminalTransaction`: URL-addressable activity combining execution, pipeline, agent, tool, prompt, ledger, database, delivery, and proof state.
- `TerminalTransactionReadModel`: typed operator projection of a selected `TerminalTransaction`, including route state, active detail section, low-detail summary, section availability, expandable audit posture, and source-safe raw-payload boundary.
- `AuxillariesProfileState`: hydrated user profile, account identity, wallet binding, notification posture, model/template preferences, and source-safe profile completeness root.
- `AuxillariesConnectionReadiness`: provider connection capability, installation/account state, credential posture without secrets, required repair action, and provider-readiness root.
- `AuxillariesInterfaceAdmission`: admitted interface id, interface surface, auth mode, policy constraints, allowed actions, source-safe capability projection, and interface-admission root.
- `AuxillariesWalletBtdPaneState`: wallet capability, signer posture, BTD read-right summary, treasury summary, settlement readiness, no-custody posture, and BTD support root.
- `OrganizationPolicyAuthority`: organization, team, member role, explicit permission grants, wallet binding requirement, policy decision, denial reason, and authority root.
- `AuxillariesReadinessDiagnostic`: source-safe pane-scoped diagnostic, blocker id, severity, required action, repair route, retry policy, and proof root.
- `AuxillariesRecoveryRun`: user-initiated recovery attempt with target pane, repair action, before/after readiness roots, execution id, and outcome.
- `AuxillariesTelemetryProofHook`: source-safe telemetry/proof record over profile, connection, interface, wallet, organization, policy, readiness, and recovery subjects.

## V31 gate plan

V31 closes through ten gates:

1. **Gate 1: V31 Roadmap And Spec Opening** opens the V31 family, makes `SPECIFICATIONS_ROADMAP.md` truthful after V30 promotion, and wires V31 Gate 1 checks.
2. **Gate 2: Auxillaries Package And Route Contracts** makes Profile, Connects, Interfaces, Wallet, BTD, organization, readiness, and recovery route contracts package-owned and JSON-safe.
3. **Gate 3: Profile And Account State** deepens profile/account hydration, wallet binding fields, model/template preferences, notifications, and user-facing completeness posture.
4. **Gate 4: Connects Provider Readiness And Recovery** deepens GitHub/provider connection readiness, credential posture without secrets, repair actions, provider diagnostics, and retry semantics.
5. **Gate 5: Wallet And BTD Pane Readiness** connects Wallet and BTD panes to V30 wallet, signer, BTD read-right, treasury, settlement-readiness, and no-custody primitives.
6. **Gate 6: Organization Team Role Policy Authority** deepens organization, team, member role, multi-sig posture, explicit permission grants, policy decisions, and denial/recovery proof.
7. **Gate 7: Interfaces Pane Admission And Cross-Surface Contracts** makes the Interfaces pane enumerate admitted Terminal, API, MCP, ChatGPT App, Exchange, and future interface hooks with action/policy boundaries.
8. **Gate 8: Auxillaries UX Accessibility And Responsive Proof** proves low-detail/expandable Auxillaries UX, keyboard/focus behavior, mobile/desktop layouts, and accessibility expectations.
9. **Gate 9: Auxillaries Telemetry Proof And Recovery Runs** adds source-safe telemetry/proof hooks and recovery-run evidence for account, provider, wallet, policy, readiness, and interface subjects.
10. **Gate 10: V31 Promotion Readiness** validates local/staging proof, generated artifacts, V31 promotion workflow support, and post-promotion V31 active / V32 draft posture.

Gate 2 contract precision:

- Auxillaries API routes may authenticate, parse requests, and persist explicit route writes, but profile/account readiness, connection readiness, interface admission, wallet/BTD pane state, organization authority, readiness diagnostics, and recovery run objects must be built by package-owned helpers.
- JSON-safe output must redact provider tokens, API keys, wallet secrets, private prompts, protected source, and service credentials.
- `apps/uapi/app/auxillaries` components consume these contracts as product state and must not rederive hidden policy logic.
- The package-owned V31 contract builder is `buildAuxillariesContractSnapshot`; its JSON-safe route payload compatibility builder is `buildAuxillaryDataPayload`, and every route/mock bridge must pass through these builders before UI consumption.

Gate 3 profile/account precision:

- Profile state binds user id, display identity, account readiness, wallet binding, model preference, template preference, notification posture, data-sharing posture, and completeness root.
- Account identity is a typed support object containing user id, handle, display name, email, email verification, company, and role; it is not inferred again in UI surfaces.
- Incomplete profile state must name completeness issues, blocking issue ids, repair routes, repair panes, and retry posture rather than rendering as generic missing data.
- Model and template preferences are support readiness posture, with deterministic preference roots and repair actions when missing.
- Notification posture names contact readiness, unread count, latest notification time, and source-safety class without exposing message bodies in the profile readiness summary.
- Data-sharing posture names repository counts and enabled/disabled repository counts without exposing protected source.
- Wallet binding is a capability/readiness field, not a private-key or custody claim.

Gate 4 Connects precision:

- Provider readiness records name provider id, installation/account state, token presence class, scopes class, last readback status, blocker, and repair action.
- Secrets and raw provider tokens are never stored in telemetry, UI metadata, or proof hooks.
- Recovery attempts produce before/after readiness roots and never silently downgrade provider policy.
- `AuxillariesConnectionReadiness` is the canonical provider-readiness object for Connects and VCS routes. It carries `providerId`, `providerName`, `credentialPosture`, `tokenPresenceClass`, `scopesClass`, `lastReadbackStatus`, `blocker`, `repairAction`, source-safe metadata, and `providerReadinessRoot`.
- Provider connection routes may store or validate private provider credentials at the route boundary, but responses, telemetry, proof hooks, and UI metadata can only expose classified token/scope/readback posture and source-safe account labels.
- `AuxillariesRecoveryRun` records provider recovery as before-readiness root, after-readiness root, repair action, execution id, outcome, and source-safety class; it never serializes the provider credential that made the repair possible.

Gate 5 Wallet/BTD precision:

- Wallet panes consume no-custody wallet capability and signer posture from V30 BTD/wallet primitives.
- BTD panes expose range/read-right/treasury/settlement readiness summaries without revealing protected AssetPack source.
- Treasury and organization BTD posture remains distinct from Exchange market state.
- `@bitcode/btd` owns the source-safe `BtdWalletBtdSupportProjection` used by Auxillaries to summarize wallet capability, signer readiness, network readiness, BTD read-right counts, range cell counts, account treasury posture, settlement blockers, and proof roots.
- `AuxillariesWalletBtdPaneState` is the API-facing support object that carries that projection into `/api/auxillaries/data`; UI panes may render it but may not recalculate no-custody, read-right, or settlement law locally.
- The Wallet pane may show account BTC fee posture, BTD range/read-right counts, roots, and blockers, but it must keep protected source visibility false before paid unlock and must identify that the support pane is not an Exchange market state surface.

Gate 6 policy precision:

- Organization authority binds organization id, team/member id, role, grant set, wallet binding requirement, policy id/hash, action, decision, denial reason, and recovery route.
- Multi-sig posture may be represented as readiness and required-action state; it is not value-bearing mainnet approval.
- Protected-source actions fail closed unless account, organization, role, grant, wallet, policy, settlement, and interface admission state all admit them.
- `@bitcode/btd` owns `BtdOrganizationPolicyAuthority`. It wraps the existing `BtdOrganizationInterfaceAuthorityDecision` with account admission, team/member identity, explicit grant set, policy id/hash, wallet binding state, multi-sig posture, policy-level decision, denial reasons, recovery route, source-visibility state, and aggregate authority root.
- `packages/api` maps `BtdOrganizationPolicyAuthority` into `OrganizationPolicyAuthority` for `/api/auxillaries/data`; Auxillaries panes and Terminal detail projections consume that object and may not rederive organization policy law locally.

Gate 7 Interfaces precision:

- Interface admission records enumerate surface id, auth mode, supported actions, required policy, source-safety class, and current readiness.
- Interfaces may point to Terminal, API, MCP, ChatGPT App, Exchange, or future hooks, but V31 does not implement deferred Exchange market law or Conversations product depth.
- `AuxillariesInterfaceAdmission` now distinguishes `supportedActions` from the currently admitted `allowedActions`, so a surface can advertise the product action family it understands while remaining blocked or degraded for the current user/account posture.
- Each admission record carries `policyRequirements`, legacy-compatible `policyConstraints`, blockers, `deferredProductDepth`, source-safety class, and `interfaceAdmissionRoot`.
- The required V31 admission catalog contains `terminal`, `api`, `mcp`, `chatgpt-app`, `exchange-hook`, `conversations-hook`, and `future-interface-hooks`.
- Exchange and Conversations records are present as source-safe hooks only; they remain blocked with explicit deferred-product blockers until later versions implement market law or Conversations product depth.

Gate 8 UX precision:

- Auxillaries default presentation is low-detail and guided, with expandable audit detail for every pane.
- Responsive behavior must be stable on mobile and desktop without overlapping text or decorative card nesting.
- Accessibility proof covers focus order, keyboard operation, labels, state announcement, contrast, and reduced-motion posture where applicable.
- The contained Auxillaries support plane must expose one named main landmark, one skip link to `#auxillaries-active-pane`, one named pane navigation region, and one named active pane region per selected pane.
- The active pane region must announce ready/loading state, show a compact guided summary and source-safe readiness chips, and keep audit metadata behind an expandable control.
- The expandable audit detail may expose pane names, availability counts, completed panes, surface state, and source-safety posture; it must not require ordinary users to read raw JSON.
- Workspace pane controls must be regular buttons with keyboard-native behavior, `aria-current` on the selected pane, `aria-disabled` mirroring disabled state, and screen-reader descriptions for active/ready/locked posture.

Gate 9 telemetry/recovery precision:

- Auxillaries telemetry subjects are profile, account, provider connection, interface admission, wallet, BTD pane, organization authority, policy decision, readiness diagnostic, and recovery run.
- Proof hooks bind theorem id, replay step id, evidence root, telemetry root, source-safety class, and blocker/repair outcome.
- Recovery runs are executions; they may call tools, but the stored evidence must be source-safe and secret-free.
- `AuxillariesTelemetryProofHook` is the package-owned readback object for that proof. It carries subject, subject id, pane, theorem id, replay step id, evidence root, telemetry root, blocker id, repair outcome, source-safety class, and proof root, and is emitted beside the route contract rather than derived by the UI.
- Externals may render compact telemetry proof-hook rows for operator diagnosis, but only theorem/replay/evidence/telemetry roots and classified outcomes may be visible. Raw provider credentials, service keys, wallet secrets, private prompts, and protected source remain prohibited.

V30 Protocol/BTD carryforward precision:

- V31 preserves V30 receipt, source-to-shares, bridge-readiness, and Protocol/BTD telemetry law as active substrate.
- Auxillaries may read V30 BTD, fee, settlement, receipt, source-to-shares, bridge-readiness, and telemetry objects through package-owned interfaces.
- Auxillaries must not rederive or override V30 settlement, receipt, bridge, or source-disclosure law.
- When Auxillaries surfaces V30 substrate state, it must present readiness, blockers, repair actions, and source-safe summaries rather than protected source or secrets.

## V31 whole Bitcode operator chain

The V31 whole-system operator chain is the commercial Reading chain supported by a stronger Auxillaries control plane:

```text
Auxillaries readiness
  -> Profile/account completeness
  -> Provider connection readiness
  -> Interface admission
  -> Wallet/BTD readiness
  -> Organization/team/role/policy authority
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
  -> Auxillaries recovery and readiness follow-through
```

Each transition must be observable as an execution, pipeline, PTRR agent, PTRR step, ThricifiedGeneration, tool call, ledger journal row, database projection, or repair receipt where applicable.

## V31 Auxillaries pane read-model canon

Auxillaries reading is route-owned to the Auxillaries surface.
Profile, Connects, Interfaces, Wallet, BTD, organization, and policy panes each receive typed read models from package/API contracts rather than rederiving readiness, permission, or settlement posture in component-local code.

Each pane read model must contain:

- pane identity, owner/principal, organization scope when present, status, timing, and proof posture;
- low-detail summary, readiness chips, blockers, and next admitted repair action sufficient for ordinary operation;
- expandable audit detail containing package object ids, root ids, projection counts, provider readback status, and route/write availability;
- explicit section availability: available, empty, blocked, retryable, repairable, or approval-required with a readable reason;
- source-safety posture proving provider tokens, wallet secrets, private prompts, service keys, database passwords, and protected AssetPack source are absent;
- deterministic route/query state so reloads return the same selected pane and detail posture.

The read model is deterministic from authenticated account state, package-owned Auxillaries objects, provider readback, ledger/BTD readiness, route query state, and data mode.
It must tolerate partial live readback by showing blockers and retry actions rather than silently downgrading policy.

## V31 Auxillaries UX quality and browser-proof canon

Auxillaries is the enterprise support and control plane.
It must be readable by default, keyboard reachable, responsive, accessible, and browser-proven.

The Auxillaries surface must expose:

- one named `main` landmark for the route;
- a keyboard-reachable skip link to the active support pane;
- a named pane navigation region for Profile, Connects, Interfaces, Wallet, BTD, organization, and policy surfaces;
- a named active pane region for guided low-detail summary, readiness blockers, and admitted actions;
- expandable audit metadata that does not require raw JSON for ordinary operation;
- explicit loading, empty, failed, blocked, retryable, repairable, approval-required, and source-safe states with `status` or `alert` semantics where appropriate;
- stable mobile and desktop layouts without nested cards, text overlap, or document-level horizontal overflow;
- accessible labels, focus order, state announcements, contrast, and reduced-motion posture where applicable.

Gate 8 proves those UX obligations.
Gate 9 then proves the telemetry and recovery evidence that lets users debug Auxillaries readiness from the interface rather than from browser network logs.

## V31 Auxillaries interface admission proof

V31 adds a package-owned proof that interface surfaces consume admitted Auxillaries and V30 Protocol/BTD objects instead of duplicating policy:

- `AuxillariesInterfaceAdmission` covers Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and future interface hooks.
- Each admission record names interface id, surface, auth mode, supported actions, required policy, source-safety class, blockers, readiness, and admission root.
- Terminal, API, MCP, and ChatGPT App may read interface admission to gate source-safe actions and protected actions.
- Exchange and Conversations remain deferred product-depth hooks, not admitted market or conversation implementation.
- The proof fails closed on missing auth mode, unsupported action, protected source, secrets, route-local policy copies, stale readiness, or missing policy root.
- The Auxillaries Interfaces pane renders the same admission records as a catalog: surface, auth mode, readiness, source-safety class, supported actions, currently admitted actions, policy requirements, blockers, and proof root. It does not recalculate policy locally.

## V31 local and staging promotion readiness canon

V31 promotion is admissible only when the version branch can prove both source
closure and promotion automation without relying on unstated operator memory.
Gate 10 owns that closure.

The promotion-readiness contract has five parts:

- all V31 gate scripts are invoked by gate-quality CI while `BITCODE_SPEC.txt`
  remains `V30`;
- gate-quality and canon-quality workflows also accept the promoted state after
  the V31 promotion workflow commits `BITCODE_SPEC.txt -> V31`;
- the canonical promotion command supports `--version V31`, validates the V31
  draft family, runs local proof suites, prepares V31 hand-authored status
  truth, prepares runtime canon posture for V31 active / V32 draft, generates
  `BITCODE_SPEC_V31_PROVEN.md`, writes `.proofs/v31/*` proof artifacts, and
  then validates the promoted V31 family;
- the version-promotion workflow runs only for a `version/v31` pull request into
  `main`, validates the same proof surface, and commits the generated promotion
  artifacts back to the version branch;
- local and staging-testnet QA evidence remains source-safe: environment
  readiness, pipeline readback, Terminal browser proof, ledger/database
  reconciliation posture, protocol package posture, and promotion dry-run are
  named without committing secrets.

`packages/protocol/src/canon-posture.js` and
`packages/protocol/data/state.json` are commercial runtime posture carriers.
They must align to V30 active / V31 draft during Gate 10 work and be rewritten
to V31 active / V32 draft by promotion automation.
The Gate 10 checker is promotion-mode aware: it must accept the V30/V31 package
posture before the generated canon commit and the V31/V32 package posture after
the generated canon commit.

Gate 10 does not itself promote `BITCODE_SPEC.txt`.
It closes when `version/v31` can be pull-requested to `main` and the V31
promotion workflow has enough scripted proof to produce the standalone
canonical promotion commit.

Gate 10's source implementation is the V31 promotion-readiness control surface:
`scripts/check-v31-gate10-promotion-readiness.mjs`,
`scripts/promote-bitcode-canon.mjs`, `scripts/generate-bitcode-proven.mjs`,
`scripts/prepare-bitcode-spec-family-promotion.mjs`,
`scripts/prepare-bitcode-runtime-canon-promotion.mjs`,
`.github/workflows/v31-canon-promotion.yml`, and the generated
`.proofs/v31/*` artifacts must agree on the same V30 active / V31 promoted
transition. The generated telemetry artifact is source-safe and exists to bind
Gate 9 Auxillaries telemetry/proof hooks into promotion proof without exposing
protected source or secrets.

## V31 Wallet/BTD pane support canon

Wallet and BTD support are ordinary Auxillaries panes, not opaque settlement footnotes.
The canonical wallet, signer, range, read-right, treasury, access, and settlement-readiness objects remain owned by `packages/btd`; Auxillaries consumes and explains them.

The pane support model must contain:

- wallet capability and signer posture, including no-custody state and any required reconnect or authorization action;
- network policy posture over local, staging-testnet, and production-mainnet value-bearing approval;
- BTD range/read-right/treasury summary with source-safe roots and counts;
- settlement-readiness blockers, quote roots, finality state, and next admitted repair action when settlement support is relevant;
- organization treasury posture kept distinct from Exchange market state;
- explicit proof that no server component custodies private keys or displays wallet secrets.

Gate 5 binds this model through `BtdWalletBtdSupportProjection` in `@bitcode/btd` and `AuxillariesWalletBtdPaneState` in the package-owned Auxillaries route contract.
The projection carries `walletCapabilityRoot` and `btdSupportRoot`, names signer capabilities such as message signing, PSBT signing, and rights transfer readiness, counts owner-read/licensed-read/pending/denied/unknown AssetPack read-right posture, sums range cells, and always marks `protectedSourceVisible: false` for pre-settlement support views.
Its treasury summary is account-scoped, no-custody, and explicitly `not_exchange_market_state`.

No server component may custody the Reader private key.
Server-side routes may prepare receipts, validate proofs, serialize quote/posture evidence, and persist registry rows only when explicitly requested.
They must not claim signature, broadcast, finality, settlement unlock, or rights transfer without matching receipt and readback evidence.

The Auxillaries Wallet and BTD panes are source-safe.
They may reveal capability labels, quote roots, state labels, txids, and readiness blockers.
They may not expose protected AssetPack source, wallet secrets, provider tokens, or private signing material.

## V31 readiness diagnostics and recovery canon

Readiness and recovery are ordinary Auxillaries workflows, not after-action support tasks.
The canonical diagnostic and recovery model is produced from:

- profile/account facts: user identity, profile completeness, wallet binding, preferences, and notifications;
- provider facts: installation/account state, credential presence class, scopes class, readback state, and repair action;
- interface facts: admitted surface, auth mode, supported actions, required policy, and source-safety class;
- wallet/BTD facts: signer posture, no-custody posture, BTD range/read-right/treasury summary, and settlement-readiness blockers;
- organization facts: organization, team, role, grant set, policy id/hash, wallet binding requirement, decision, denial reason, and recovery route;
- source-safe telemetry facts: execution id, before/after readiness roots, evidence root, blocker, repair outcome, and retry policy.
- proof-hook facts: telemetry subject, theorem id, replay step id, evidence root, telemetry root, source-safety class, blocker id, repair outcome, and proof root.

Readiness is classified before repair:

- `profile_incomplete`;
- `provider_connection_blocked`;
- `interface_not_admitted`;
- `wallet_binding_required`;
- `btd_readiness_blocked`;
- `organization_policy_denied`;
- `role_or_grant_missing`;
- `multi_sig_readiness_blocked`;
- `recovery_readback_blocked`;
- `source_safety_violation`.

Repair actions are canonical and auditable:

- `complete_profile`;
- `repair_provider_connection`;
- `request_interface_admission`;
- `bind_wallet`;
- `refresh_btd_readback`;
- `request_role_or_grant`;
- `review_policy_denial`;
- `prepare_multi_sig_readiness`;
- `retry_recovery_readback`;
- `quarantine_source_unsafe_projection`.

The readiness state is one of ready, incomplete, retryable, repairable, approval-required, denied, or blocked.
Recovery runs are executions and must store source-safe before/after evidence.
They also carry evidence roots and telemetry roots so recovery readback can be joined to `AuxillariesTelemetryProofHook` without replaying private route internals.
They must never store service-role JWTs, Supabase secret keys, OpenAI keys, database passwords, wallet secrets, provider tokens, private prompts, or protected AssetPack source in tracked code, telemetry, UI metadata, or persisted proof payloads.

## V31 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: Deposit, depository asset, repository snapshot, source measurement, embedding document, source proof root, ownership boundary, deposit journal row.
- Current algorithms and derivation rules: repository inventory binds source branch/commit; deposit admission creates searchable lexical/vector evidence; depositor ownership stays separate from later Reader rights.
- Current invariants and fail-closed conditions: invalid deposit, missing repository commit, unavailable source material, or absent depositor boundary blocks Finding Fits.
- Current proof obligations: source measurement root, embedding policy root, repository snapshot root, and depositor boundary proof.
- Current source-bearing implementation basis: `apps/uapi/app/terminal`, commercial API routes, `packages/pipelines/asset-pack`, `packages/btd`, Supabase migrations, and readback scripts.
- Current validating commands and parity basis: V31 gate checks, V30 readback verifier until replaced, package tests, UAPI tests, and staging-testnet SQL/readback evidence.
- Current accepted boundaries: broader provider families remain staged unless Terminal requires a narrow GitHub-adjacent hook.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: ReadRequest, ReadNeed, prompt registry ids, PTRR agent ids, PTRR step ids, ThricifiedGeneration ids, raw output posture, parsed typed output, and acceptance root.
- Current algorithms and derivation rules: the Reader's request is not admitted to Finding Fits until `ReadNeedComprehensionSynthesis` synthesizes a Need and the user accepts it.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing Need review, or feedback lineage mismatch blocks Finding Fits.
- Current proof obligations: prompt template, interpolated prompt, input context, output schema, raw response posture, parsed output, usage, model identity, and acceptance root.
- Current source-bearing implementation basis: Reading pipeline contracts, bounded structured inference, read-review API route, Terminal Read UX, and tests.
- Current validating commands and parity basis: pipeline contract tests, route tests, prompt rendering/audit checks, local live OpenAI validation, and V31 gate checks.
- Current accepted boundaries: full-profile async push completion can deepen in V31 gates but cannot bypass source-safe preview or settlement boundaries.

#### V31 Reading pipeline observability canon

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
- Current validating commands and parity basis: synthesis tests, source-leakage tests, route tests, PR delivery mocks/live checks, and V31 gate checks.
- Current accepted boundaries: full mainnet value delivery remains approval-gated.

#### V31 AssetPack disclosure rights canon

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
Gate PRs into version branches must begin with the uppercase version and gate prefix, for example `V31 Gate 5: AssetPack Disclosure Rights And Preview Depth`, so gate history stays auditable from GitHub alone.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: wallet identity, signer session, GitHub connection, organization role, read-license, access-policy decision, permission proof.
- Current algorithms and derivation rules: registry-derived permissions decide whether an operator can read, pay, unlock, deliver, repair, or administer a transaction.
- Current invariants and fail-closed conditions: authorization denial, stale signer session, missing org role, or sensitive data projection mismatch blocks action.
- Current proof obligations: wallet signature proof, provider installation proof, role/license readback, policy id/hash, and denial reason.
- Current source-bearing implementation basis: wallet API, VCS API, BTD access primitives, Terminal permission UI, MCP/ChatGPT action gates.
- Current validating commands and parity basis: wallet tests, access tests, API route tests, Terminal permission tests, and staging auth readback.
- Current accepted boundaries: broad enterprise RBAC depth can expand inside V31 only when tied to Terminal transaction operation.

#### V31 organization interface authority canon

Organization permission authority is a BTD primitive, not a per-interface convention.
The canonical decision is `BtdOrganizationInterfaceAuthorityDecision`.
It binds actor id, organization id, organization role, organization permission grants, interface surface, action, wallet binding, registry read-access decision, settlement state, explicit confirmation state, repair approval state, target anchor, source visibility, and proof roots.

V31 Gate 6 adds the package-owned `BtdOrganizationPolicyAuthority` projection as the user and support-plane carrier around that decision.
The projection binds actor/account admission, organization id, team id, member id, role, raw permission grants, explicit grant set for the action, wallet-binding requirement/state, policy id/hash, interface surface, action, multi-sig readiness, policy decision, denial reason(s), recovery route, source visibility, and authority root.
Settlement-adjacent and protected-source actions fail closed when any of account admission, organization, role, explicit grant, wallet binding, policy identity/hash, multi-sig readiness, settlement/read-license state, confirmation, repair approval, or interface admission is missing or denied.
Auxillaries Profile/organization support and Terminal selected-activity authority must read the same object so support UI, transaction cockpit, telemetry, and proof hooks explain one shared policy state.

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
- Current validating commands and parity basis: BTD tests, settlement route tests, Terminal wallet/BTC tests, staging ledger/database readback, and V31 gate checks.
- Current accepted boundaries: value-bearing mainnet stays outside V31 unless separately approved.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof family, member, theorem, witness artifact, replay step, generated proof appendix, validation report.
- Current algorithms and derivation rules: every promoted V31 claim needs a generated or executable witness, and every failure must preserve enough context for replay.
- Current invariants and fail-closed conditions: stale promoted status truth, missing witness, inconsistent proof root, or ungreen promotion validation blocks promotion.
- Current proof obligations: proof-family report, canonical input report, canon-posture drift report, promotion dry-run, generated appendix, and gate closure checks.
- Current source-bearing implementation basis: spec-family checker, canonical-input checker, promotion scripts, gate-quality workflows, and protocol-demonstration proof runtime.
- Current validating commands and parity basis: `check:spec-family`, V31 gate scripts, canon-posture drift checks, demonstration tests, package tests, and promotion workflow.
- Current accepted boundaries: V31 promotion automation may be hardened across gates but must be complete before `version/v31` merges to `main`.

## V31 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.proofs/v31/inference-synthesis-proof.json` | prompt, model, parsed-output | prompt-complete, typed-output | render, infer, parse, persist | pipeline telemetry, route tests | Reading pipeline contracts |
| Prompt-completeness | `.proofs/v31/prompt-completeness-proof.json` | prompt parts, templates, interpolations | no-hidden-prompt, context-bound | compose, render, record | prompt render outputs | prompt registry and tests |
| Static-code-analysis | `.proofs/v31/static-code-analysis-proof.json` | source scans, route scans, import scans | no-versioned-routes, no-demo-import | scan, report | lint/typecheck outputs | scripts and CI |
| Verification-decisions | `.proofs/v31/verification-decisions-proof.json` | Fit verification, preview verification | threshold, blocker, no-worthy-fit | search, rank, decide | depository search reports | asset-pack pipeline |
| Selection-and-materialization | `.proofs/v31/selection-and-materialization-proof.json` | selected fits, delivery branch | paid-before-source, pr-delivery | synthesize, settle, deliver | AssetPack evidence, PR receipt | pipeline host and VCS routes |
| Authorization-and-sensitive-flow | `.proofs/v31/authorization-and-sensitive-flow-proof.json` | wallet, org, license, policy | authorized-action, redaction | sign, authorize, project | wallet/access readbacks | BTD and UAPI |
| Settlement-source-to-shares | `.proofs/v31/settlement-source-to-shares-proof.json` | fee, range, license, source shares | conservation, right-transfer | quote, pay, mint, reconcile | source-to-shares, fee receipt | BTD settlement primitives |
| Disclosure-boundary | `.proofs/v31/disclosure-boundary-proof.json` | preview, paid unlock, denied state | no-prepay-source, paid-source | preview, unlock, read | projection-policy, leakage scans | access/projection code |
| Proof-contract | `.proofs/v31/proof-contract.json` | families, theorems, witnesses | complete-family, replayable | generate, validate, promote | spec/proven artifacts | spec-family tools |

### Inference-synthesis

- proofArtifactPath: `.proofs/v31/inference-synthesis-proof.json`
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
- generated-artifact and test bindings: `.proofs/v31/spec-family-report.json`, pipeline tests, route tests, and Terminal stream tests.
- fail-closed conditions: missing prompt, missing typed parse, hidden model id, or missing telemetry blocks promotion.

### Prompt-completeness

- proofArtifactPath: `.proofs/v31/prompt-completeness-proof.json`
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

- proofArtifactPath: `.proofs/v31/static-code-analysis-proof.json`
- members: route version scan, import boundary scan, source casing scan, lint, typecheck.
- theoremIds: no versioned active source, no demonstration runtime import, no casing drift.
- replayStepIds: scan files, compare rules, emit report.
- witnessArtifactPaths: CI logs, local command output, `.proofs` reports.
- current member closure criteria: all required scans pass or name accepted compatibility exceptions.
- current member verdict shape: pass, fail, blocked.
- current theorem-by-theorem closure reading: source shape must match active canon posture.
- current theorem-to-replay grouping: route scan, import scan, lint/typecheck.
- minimum artifact/replay binding set: command, exit code, checked paths, violations.
- current proof-object fields: ruleId, path, result, evidence, blocker.
- generated-artifact and test bindings: gate-quality workflow and local gate scripts.
- fail-closed conditions: active versioned route, stale draft posture, or direct demo import blocks closure.

### Verification-decisions

- proofArtifactPath: `.proofs/v31/verification-decisions-proof.json`
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

- proofArtifactPath: `.proofs/v31/selection-and-materialization-proof.json`
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

- proofArtifactPath: `.proofs/v31/authorization-and-sensitive-flow-proof.json`
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

- proofArtifactPath: `.proofs/v31/settlement-source-to-shares-proof.json`
- members: fee quote, payment observation, BTD range, source-to-shares, read-license, journal.
- theoremIds: fee-conservation, range-conservation, license-transfer.
- replayStepIds: quote, prepare PSBT, observe payment, mint/transfer, reconcile.
- witnessArtifactPaths: `.proofs/_shared/source-to-shares.json`, fee receipt, journal rows, ledger anchors.
- current member closure criteria: settlement must conserve BTC fee, BTD range, source shares, and right transfer.
- current member verdict shape: prepared, signed, broadcast, confirmed, blocked, reconciled.
- current theorem-by-theorem closure reading: no paid source unlock without fee and right-transfer readback.
- current theorem-to-replay grouping: quote root, payment path, ledger observation, BTD state, reconciliation.
- minimum artifact/replay binding set: fee quote root, payment receipt root, txid or blocked receipt, BTD range slice roots, contribution weights, conservation root, license id, journal id.
- current proof-object fields: quote, payment observation, fit deposits, contribution weights, range slices, settlement allocations, no-overpayment, no-underpayment, zero-cell/refit tail, ancestry evidence, reconciliation check, blocker.
- generated-artifact and test bindings: BTD source-to-shares tests, settlement route tests, staging readback.
- fail-closed conditions: settlement conservation drift, stale quote, or chain reorg.

### Disclosure-boundary

- proofArtifactPath: `.proofs/v31/disclosure-boundary-proof.json`
- members: preview, projection policy, redaction, paid unlock, denied state.
- theoremIds: no-prepay-source, paid-reader-source, denied-state-no-source.
- replayStepIds: project preview, redact source, evaluate unlock, read source.
- witnessArtifactPaths: `.proofs/_shared/projection-policy.json`, preview payloads, leakage scan reports.
- current member closure criteria: source-bearing content crosses visibility boundary only after paid unlock.
- current member verdict shape: preview, locked, unlocked, denied, blocked.
- current theorem-by-theorem closure reading: disclosure posture must be explainable from policy, payment, and license state.
- current theorem-to-replay grouping: preview, settlement, license, projection.
- minimum artifact/replay binding set: preview id, projection policy hash, settlement unlock id, license id.
- current proof-object fields: visibility, policy, redactions, unlock, blocker.
- generated-artifact and test bindings: disclosure tests, UI tests, source leakage scans.
- fail-closed conditions: public projection overexposure or unpaid protected-source access.

### Proof-contract

- proofArtifactPath: `.proofs/v31/proof-contract.json`
- members: spec-family report, canonical input report, canon-posture drift report, promotion proof appendix.
- theoremIds: complete-family, valid-draft, valid-promotion.
- replayStepIds: validate family, validate inputs, validate posture, generate proven, promote.
- witnessArtifactPaths: `.proofs/v31/spec-family-report.json`, `.proofs/v31/canonical-input-report.json`, `BITCODE_SPEC_V31_PROVEN.md`.
- current member closure criteria: promotion cannot run unless all gate checks and generated proof inputs are green.
- current member verdict shape: draft-valid, promotion-ready, promoted, blocked.
- current theorem-by-theorem closure reading: generated canon must match the hand-authored spec family and source posture.
- current theorem-to-replay grouping: check, generate, dry-run promote, commit promote.
- minimum artifact/replay binding set: spec family files, generated reports, proof-source commit, promotion command.
- current proof-object fields: version, report, currentTarget, pointer, promotionCommit, verdict.
- generated-artifact and test bindings: spec-family checker, canonical-input checker, promotion workflow.
- fail-closed conditions: stale promoted status truth, missing generated appendix, or failed gate check.

## V31 generated canon

### Inherited V19 reproducible-canon artifacts

V31 continues the reproducible-canon requirement: generated reports must be deterministic, path-addressable, and promotion-bound.

### Inherited V20 operator-quality artifacts

V31 continues operator-quality proof: Terminal workflow claims must be backed by UI, accessibility, responsive, error-state, and browser evidence where applicable.

### Exact generated-artifact inventory matrix

| artifact | required in draft | required at promotion | purpose |
| --- | --- | --- | --- |
| `.proofs/v31/spec-family-report.json` | yes | yes | validates the hand-authored V31 family shape |
| `.proofs/v31/canonical-input-report.json` | yes | yes | records canonical input closure for active V30 plus V31 draft |
| `.proofs/v31/canon-posture-drift-report.json` | gate-dependent | yes | proves runtime/docs active/draft posture |
| `.proofs/v31/auxillaries-telemetry-proof-hooks.json` | gate-dependent | yes | records source-safe Auxillaries telemetry and proof-hook inventory for provation/documentation |
| `BITCODE_SPEC_V31_PROVEN.md` | no | yes | generated proof appendix for promoted V31 |

### V31 specifying generated artifacts

The minimum V31 generated set is `.proofs/v31/spec-family-report.json`, `.proofs/v31/canonical-input-report.json`, `.proofs/v31/canon-posture-drift-report.json`, `.proofs/v31/auxillaries-telemetry-proof-hooks.json`, and promotion-time `BITCODE_SPEC_V31_PROVEN.md`.

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

`BITCODE_SPEC_V31_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any required proof input is absent.

### Canonical regeneration and fail-closed posture

Generated canon must be regenerable from repository state.
Promotion must fail closed when any required report, witness, test, proof family, or source posture is stale.

## V31 validation canon

V31 validation is layered:

- spec-family and canonical-input checks for the V31 draft;
- canon-posture drift checks for V30 active and V31 draft;
- V31 gate-specific scripts;
- package lint, typecheck, and Jest suites;
- UAPI route/component tests;
- Terminal browser, accessibility, responsive, and error-state checks;
- local non-mocked OpenAI/Supabase/Vercel Sandbox validation for gates that touch live pipeline behavior;
- staging-testnet readback where ledger/database synchronization or delivery is claimed.

## V31 promotion canon

V31 promotes only through `version/v31` into `main`.
Promotion must:

1. pass every V31 gate check;
2. pass active V30 and draft V31 posture checks before promotion;
3. generate `.proofs/v31/*` canonical reports;
4. generate `BITCODE_SPEC_V31_PROVEN.md`;
5. update runtime posture carriers from active V30/draft V31 to active V31/next draft;
6. commit `BITCODE_SPEC.txt` changing from `V30` to `V31`;
7. keep main protected by pull request and verified-signature rules.

## V31 appendices and canonical supporting material

The appendices below are binding draft structure for V31.
They name the proof, artifact, validation, source, workflow, and fail-closed surfaces that every later gate must keep synchronized.

## Appendix A. Canonical type and surface catalog

Canonical V31 type families:

- Reading: ReadRequest, ReadNeed, FindingFitsResult, AssetPackPreview, SettlementUnlock.
- Pipeline: execution, pipeline, phase, PTRR agent, PTRR step, ThricifiedGeneration, tool call, prompt record, parsed output.
- Terminal: TerminalTransaction, journal row, stream row, detail accordion, repair action.
- BTD: range, source-to-shares, access policy, read-license, BTC fee quote, payment observation, ledger anchor, reconciliation report.
- Delivery: branch artifact, AssetPack evidence, pull request, delivery repair receipt.

## Appendix B. Proof family closure catalog

Each proof family named in the proof-family canon must have members, theorems, replay steps, witness artifacts, generated artifacts, and fail-closed conditions before V31 promotion.

## Appendix C. Generated artifact contract catalog

The V31 generated-artifact contract is exactly the generated canon section above plus Appendix K source-bearing artifact constraints.

## Appendix D. Validation and checking gate catalog

Gate validation starts with `pnpm run check:v31-gate1`.
Later gates must add focused scripts before claiming implementation closure.
Promotion validation must run all V31 gate scripts, source scans, package tests, UAPI tests, demonstration proof checks, generated report checks, and diff hygiene.

## Appendix E. Current canonical source map

Source map:

- `BITCODE_SPEC.txt`: active canon pointer, still `V30` during V31 drafting.
- `BITCODE_SPEC_V31.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`: draft target family.
- `protocol-demonstration/src/canon-posture.js`: active/draft runtime posture carrier.
- `packages/pipelines/asset-pack`: Reading pipeline and AssetPack synthesis source.
- `packages/pipeline-hosts`: sandbox/harness execution source.
- `packages/btd`: BTD, BTC, rights, journal, and reconciliation primitives.
- `apps/uapi/app/terminal`: Terminal operator surface.
- `.github/workflows`: gate and promotion automation.

## Appendix F. Subsystem totality and derivability matrix

V31 must cover repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

The subsystem sections in the canonical subsystem surfaces chapter are the active derivability matrix rows for V31.

## Appendix G. Canonical file-family and promotion contract catalog

V31 file family:

- `BITCODE_SPEC_V31.md`
- `BITCODE_SPEC_V31_DELTA.md`
- `BITCODE_SPEC_V31_NOTES.md`
- `BITCODE_SPEC_V31_PARITY_MATRIX.md`
- future `BITCODE_SPEC_V31_PROVEN.md`
- `.proofs/v31/spec-family-report.json`
- `.proofs/v31/canonical-input-report.json`
- future `.proofs/v31/canon-posture-drift-report.json`

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

V31 cross-product scenarios include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

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

- `.proofs/_shared/asset-pack.lock.json`
- `.proofs/_shared/selected-source-material.json`
- `.proofs/_shared/verification-report.json`
- `.proofs/_shared/source-to-shares.json`
- `.proofs/_shared/projection-policy.json`
- `.proofs/_shared/system-proof-bundle.json`
- `BITCODE_SPEC_V31_PROVEN.md`

Before settlement, the Reader may see only source-safe preview metadata.
After settlement, the Reader may receive the full AssetPack source according to the paid read-license/right transfer and delivery policy.

## V31 accepted boundaries and reopen conditions

Accepted boundaries:

- V31 remains Auxillaries-deepening over V30 Protocol/BTD rails, not Exchange depth.
- V31 may deepen MCP/ChatGPT only where Terminal transaction authority requires shared permission truth.
- V31 may harden demonstration-origin commercial internals but must keep the demonstration standalone.
- V31 may use staging-testnet and local live validation; value-bearing mainnet remains separately approved.
- V31 promotion automation may be implemented across gates, but it must be complete before promotion.

Reopen conditions:

- V30 promoted law is found inconsistent with source behavior.
- Terminal exposes protected source before settlement.
- ledger/database projection contradicts settlement truth.
- organization permission decisions cannot be derived from registry/access policy state.
- gate workflow cannot fail closed for stale active/draft posture.

## V31 completion condition

V31 is complete only when:

- all gates in the V31 parity matrix are closed;
- Auxillaries supports the Profile, Connects, Interfaces, Wallet/BTD, organization, policy, readiness, and recovery workflows specified here;
- live or bounded-real validation proves the claimed Reading/settlement/delivery paths;
- promotion workflows can promote only `version/v31`;
- generated V31 proof artifacts and `BITCODE_SPEC_V31_PROVEN.md` are produced;
- `BITCODE_SPEC.txt` changes from `V30` to `V31` only in the formal promotion commit.
