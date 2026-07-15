# Bitcode Spec V31 Notes

## Status

- Version: `V31`
- V31 state: canonical promotion complete; V31 notes record the accepted Auxillaries support/control, local/staging, and promotion-readiness evidence
- Current canonical/latest target: `V31`
- Canonical proof-source commit: `8c711604600afe1d1e477d3c180d653602203d0f`
- Prior canonical anchor: `BITCODE_SPEC_V30.md`
- Prior generated proof appendix: `BITCODE_SPEC_V30_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v31-spec-family-report.json`, `.bitcode/v31-canonical-input-report.json`, `.bitcode/v31-canon-posture-drift-report.json`, `.bitcode/v31-auxillaries-telemetry-proof-hooks.json`, V31 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V31_PROVEN.md` as the generated proof appendix for V31 promotion
- Source parity state: V31 source-side Auxillaries package contracts, route data, client hooks, panes, organization authority, recovery runs, telemetry/proof hooks, UX/accessibility, workflow, and promotion surfaces are canonicalized in the promoted V31 file family
- Scope: V31 canonical notes for Auxillaries support/control surfaces, source-safe recovery, telemetry proof hooks, UX proof, local/staging readiness, and promotion automation over V30
- Last fully realized canonical target preserved in source: `V31`

This NOTES file does not promote V31.
`BITCODE_SPEC.txt` remains `V30` until formal V31 promotion.

## Notes companion rule

This file is the concise companion to `BITCODE_SPEC_V31.md`.
It is binding while V31 is the active draft target, but the full specification, delta, parity matrix, source, tests, and workflow checks remain the proof-bearing closure surface.

## Concise current-system reading

V30 is active canon and hardened the Protocol/BTD rails beneath commercial Reading, Finding Fits, AssetPack preview, settlement, rights transfer, delivery, telemetry, and promotion proof.
V31 uses those rails as substrate.
The V31 product responsibility is Auxillaries: the enterprise support/control plane for account, profile, provider connection, interface admission, wallet, BTD, organization, role, policy, readiness, recovery, and source-safe support evidence.

## Simplified-spec reading rule

Read V31 in this order:

1. Confirm `BITCODE_SPEC.txt -> V30`; V31 is draft until promotion.
2. Read the V31 gate plan in `BITCODE_SPEC_V31.md`.
3. Read this NOTES file for the concise product shape.
4. Read `BITCODE_SPEC_V31_DELTA.md` for gate-by-gate change intent.
5. Read `BITCODE_SPEC_V31_PARITY_MATRIX.md` for closure evidence and accepted boundaries.
6. Use the gate checker and workflow evidence before treating any V31 claim as closed.

## V31 gate plan

V31 closes through ten gates:

1. Gate 1: V31 Roadmap And Spec Opening.
2. Gate 2: Auxillaries Package And Route Contracts.
3. Gate 3: Profile And Account State.
4. Gate 4: Connects Provider Readiness And Recovery.
5. Gate 5: Wallet And BTD Pane Readiness.
6. Gate 6: Organization Team Role Policy Authority.
7. Gate 7: Interfaces Pane Admission And Cross-Surface Contracts.
8. Gate 8: Auxillaries UX Accessibility And Responsive Proof.
9. Gate 9: Auxillaries Telemetry Proof And Recovery Runs.
10. Gate 10: V31 Promotion Readiness.

## Product focus

V31 owns deeper Auxillaries:

- Profile and account completeness become typed, persisted, projected, and recoverable.
- Connects show provider readiness, credential posture without secrets, repair actions, retry semantics, and readback evidence.
- Interfaces enumerate admitted commercial surfaces with auth modes, supported actions, currently admitted actions, policy requirements, blockers, readiness, source-safety posture, deferred-product boundaries, and proof roots. The V31 catalog includes Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and future interface hooks; Exchange market law and Conversations product depth remain explicitly blocked.
- Wallet and BTD panes consume V30 wallet, signer, BTD range, read-right, treasury, settlement, and no-custody primitives.
- Organization, team, member role, multi-sig readiness, explicit grants, policy decisions, denial reasons, and recovery routes become package-owned and UI-visible.
- Readiness diagnostics and recovery runs are executions with source-safe before/after evidence.
- Auxillaries UX is guided, low-detail by default, keyboard/focus usable, responsive, and expandable into full audit detail.

## Boundaries

- V31 must not redefine Reading, Finding Fits, AssetPack preview, settlement, delivery, BTC fee, or BTD tokenomics law.
- V31 must not implement Exchange market depth or website Conversations product depth.
- V31 must not store or display provider tokens, wallet secrets, OpenAI keys, service-role keys, database passwords, private prompts, or protected AssetPack source.
- V31 must not import `protocol-demonstration/src/*` from commercial runtime code.
- V31 may expose source-safe V30 Protocol/BTD posture in Auxillaries panes, but it must not rederive or override V30 settlement, receipt, access, or disclosure law.

## Gate 1 closure note

Gate 1 is closed only when the V31 draft family validates over V30, the roadmap is truthful, V31 workflows are greenable, contributor docs show the V31 gate workflow, and `check:v31-gate1` fails closed on stale posture or missing Auxillaries scope.

## Gate 2 closure note

Gate 2 is closed only when Auxillaries support-state contracts are package-owned and JSON-safe.
Routes may still authenticate, read/write explicit storage rows, and return framework responses, but readiness and policy objects for Profile, Connects, Interfaces, Wallet, BTD, organization, diagnostics, and recovery must be built through `packages/api/src/routes/auxillaries-contract.ts`.
The route payload can preserve existing UI fields for compatibility, but provider tokens, wallet secrets, service keys, database credentials, private prompts, and protected source must be redacted before any UI, telemetry, or proof-hook consumption.

## Gate 3 closure note

Gate 3 is closed only when Profile/account state is not just a form payload.
It must be a package-owned support state that binds account identity, profile completeness issues, repair routes, wallet binding posture, model/template preference posture, notification posture, data-sharing posture, and proof roots.
The Profile pane may present and link repairs, but it must consume the package contract and must not locally rederive account readiness or completeness law.
Route hydration must include template preference and notification readback where available, while missing storage rows degrade into explicit repair posture rather than generic missing data.

## Gate 4 closure note

Gate 4 is closed only when Connects provider state is a source-safe readiness contract rather than a raw OAuth/VCS status blob.
That source-safe provider connection posture remains closed after later V31 gates advance the roadmap.
Provider readiness must name provider id/name, installation state, credential posture, token presence class, scopes class, last readback status, blocker, repair action, and proof root without exposing raw provider credentials.
VCS and GitHub Auxillaries routes may use credentials internally to validate or repair a connection, but responses, UI metadata, telemetry, and recovery proof hooks must carry only classified posture and before/after readiness roots.
The Externals pane can display compact provider proof detail, but it must consume `connectionReadiness` and `recoveryRuns` from the package-owned Auxillaries contract instead of locally deciding provider law.

## Gate 5 closure note

Gate 5 is closed only when Wallet/BTD support is package-owned and source-safe.
`@bitcode/btd` must derive no-custody wallet capability, signer posture, network readiness, BTD range/read-right counts, account treasury posture, settlement blockers, and support roots.
`packages/api` may map that projection into `AuxillariesWalletBtdPaneState`, but UI and routes must not rederive BTD read-access, settlement, rights-transfer, or no-custody law locally.
The Wallet pane must consume `walletBtdPaneState` from `/api/auxillaries/data`, render signer/network/range/read-right/settlement/treasury readiness, keep protected source invisible before paid unlock, and state that account treasury support is not Exchange market state.

## Gate 6 closure note

Gate 6 is closed only when organization policy authority is package-owned, source-safe, and shared by Auxillaries and Terminal.
`@bitcode/btd` must own `BtdOrganizationPolicyAuthority` and derive it from account admission, organization/team/member identity, role, explicit grants, wallet binding, policy id/hash, multi-sig readiness, interface surface, action, settlement/read-license/confirmation posture, denial reasons, recovery route, source visibility, and proof root.
Protected-source and settlement-adjacent actions must fail closed unless every required authority input admits the action.
`packages/api` may map the BTD object into `OrganizationPolicyAuthority`, but routes, Profile panes, Terminal detail cards, telemetry, and proof hooks must not rederive the authority decision from local heuristics.
The support UI may show policy measurements, blockers, recovery routes, and roots; it must not reveal protected source or treat multi-sig readiness as value-bearing mainnet approval.

## Gate 7 closure note

Gate 7 is closed only when Interfaces admission is package-owned and cross-surface.
The admission catalog must cover Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and future interface hooks with auth mode, supported actions, currently admitted actions, policy requirements, source-safety class, blockers, readiness, deferred-product depth, and interface-admission roots.
Exchange and Conversations may appear as source-safe hooks, but their market and product depth must stay explicitly blocked until later versions implement those surfaces.

## Gate 8 closure note

Gate 8 is closed only when Auxillaries UX is usable before audit expansion and provable after expansion.
The contained support plane must expose a named main landmark, keyboard skip link, named pane navigation, active-pane state announcement, readable loading/ready posture, and expandable audit detail for every pane without raw JSON.
The panel controls must be keyboard-native, focus-visible, labelled, and state-described, and route-scoped CSS must prove responsive mobile/desktop layout, no horizontal overflow pressure, contrast-preserving readiness chips, and reduced-motion posture.

## Gate 9 closure note

Gate 9 is closed only when Auxillaries telemetry is a package-owned proof
surface rather than an ad hoc console trace.
`AuxillariesTelemetryProofHook` must cover profile, account, provider
connection, interface admission, wallet, BTD pane, organization authority,
policy decision, readiness diagnostic, and recovery run subjects.
Each hook binds theorem id, replay step id, evidence root, telemetry root,
source-safety class, blocker id, repair outcome, and proof root.
Recovery runs must carry source-safe before/after readiness roots plus
evidence/telemetry roots and must be readable through the API route, shared
client hook, and Externals UI without exposing credentials, prompts, wallet
secrets, service keys, database credentials, or protected AssetPack source.

## Gate 10 promotion-readiness notes

Gate 10 is closed only when V31 promotion is scripted enough to be replayed by
CI and locally without hidden operator memory.
`check:v31-gate10` must verify the V31 gate checker set, Gate Quality and Canon
Quality workflow posture, the `version/v31` promotion workflow, V31 support in
the canonical promotion command, V31 spec-family status rewriting, V31 runtime
posture rewriting, generated appendix support, and source-safe generated
artifacts.
The staging-testnet readback evidence is intentionally summarized as roots,
checker names, workflow names, and readiness posture; no provider tokens, wallet
secrets, OpenAI keys, service-role keys, database passwords, private prompts, or
protected AssetPack source may enter the committed QA ledger.
