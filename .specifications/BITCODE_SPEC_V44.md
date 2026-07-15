# Bitcode Spec V44

## Status

- Version: `V44`
- V44 state: canonical promotion complete; V44 is the active scaled engineering economy canon and the V44 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V44`
- Canonical proof-source commit: `2b08d07590269150d7a8ad658fe97dd99c05616d`
- Prior canonical anchor: `BITCODE_SPEC_V43.md`
- Prior generated proof appendix: `BITCODE_SPEC_V43_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v44-spec-family-report.json`, `.bitcode/v44-canonical-input-report.json`, `.bitcode/v44-canon-posture-drift-report.json`, `.bitcode/v44-economic-domain-model.json`, `.bitcode/v44-packs-portfolio-market-intelligence.json`, `.bitcode/v44-reading-budget-quote-policy.json`, `.bitcode/v44-depositor-earnings-supply-opportunities.json`, `.bitcode/v44-btd-btc-compensation-statements.json`, `.bitcode/v44-organization-policy-wallet-authority.json`, `.bitcode/v44-enterprise-product-ux.json`, `.bitcode/v44-scaled-network-rehearsal.json`, `.bitcode/v44-promotion-readiness-report.json`, V44 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V44_PROVEN.md` as the generated proof appendix for V44 promotion
- Source parity state: V44 source-side economic domain, Packs portfolio market intelligence, Reading budget/quote policy, depositor earnings opportunity, BTD/BTC compensation statements, organization policy and wallet authority, enterprise UX, scaled rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V44 file family
- Notes companion: `BITCODE_SPEC_V44_NOTES.md`
- Delta companion: `BITCODE_SPEC_V44_DELTA.md`
- Parity companion: `BITCODE_SPEC_V44_PARITY_MATRIX.md`
- Scope: V44 canonical system specification for scaled engineering economy across Pack portfolios, Reading procurement budgets and quotes, depositor earnings, BTD/BTC compensation statements, organization policy and wallet authority, enterprise UX, scaled local/staging-testnet rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V44`

## Version executive summary

V44 turns the V43 product route model into a scaled economic operating system.
V43 made AssetPacks legible through `/packs`, `/read`, and `/deposit`; V44
must make many AssetPacks, many Reads, many deposits, many contributors, and
many organizations economically governable.

The guiding note is digitizing and tokenizing scaled engineering economies.
That means Bitcode must expose durable source-safe objects for:

- enterprise AssetPack portfolios across Depository supply, pending deposit
  options, purchased Need-Fit packs, settlement receipts, and delivery state;
- demand/supply market intelligence over Reading activity, failed Reads,
  accepted Needs, found Fits, unfound Needs, and deposit option opportunities;
- BTD range, BTC quote, source-to-shares, contributor compensation, and
  rights-transfer accounting that can be audited without revealing source;
- organization budgets, approval policies, spending limits, earning targets,
  critical-IP constraints, and procurement/deposit governance; and
- scaled local/staging rehearsal proving the network can support many-pack,
  many-organization economic flows before any value-bearing mainnet admission.

## Canonical Bitcode executive summary

Bitcode remains the knowledge commoditization protocol. Depositors contribute
source-derived AssetPacks, Reading synthesizes Needs, Finding Fits searches the
Depository, AssetPack synthesis withholds source until paid settlement, BTC
settlement transfers BTD read rights, contributors are compensated through
source-to-shares accounting, and repository delivery unlocks only after rights
are proven.

V44 does not change that law. It scales the commercial product around it:
portfolio views, budgets, governance, statements, market intelligence, quote
policy, and network rehearsal must make the protocol usable by enterprises
operating many technical knowledge trades.

## V44 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V44`; V44 is the active promoted Bitcode canon.
`BITCODE_SPEC_V44.md` and `BITCODE_SPEC_V44_PROVEN.md` are active canon.
`BITCODE_SPEC_V44_DELTA.md`, `BITCODE_SPEC_V44_NOTES.md`, and
`BITCODE_SPEC_V44_PARITY_MATRIX.md` are promoted V44 companion canon. V43 is
the prior canonical anchor only. `BITCODE_SPEC_V45_NOTES.md` is discussion-prep
draft material only until a V45 version branch and first gate explicitly open.
Implementation remains unversioned in source paths; package, route, component,
test, prompt, script, and telemetry names move in place as the single current
Bitcode system.

## V44 promotion addendum: canonical posture repair

V44 promotion discovered and repaired a source-of-truth prose contradiction:
the promoted V44 status and `BITCODE_SPEC.txt` pointer correctly named V44 as
active canon, while the source-of-truth hierarchy still contained pre-promotion
V43-active / V44-draft language. That was a protocol-law contradiction in the
canon-posture layer, even though it did not change BTC settlement, BTD rights,
source withholding, source-to-shares, or repository delivery law.

The repaired enforcement rule is: promoted spec-family validation fails when a
promoted source-of-truth hierarchy says the active pointer targets an older
version, says the promoted version remains a draft, or classifies the promoted
spec family as draft-only branch material. Canon posture is protocol law.

## V44 full-system, re-implementation, and audit rule

V44 work must be reconstructable from specification, source, generated
artifacts, tests, telemetry, ledger/database/storage readback, and operator
documentation. Economic surfaces cannot be decorative dashboards. Each row
must trace to protocol objects: ReadNeed, deposit AssetPack option, Depository
AssetPack, selected Fit set, AssetPack preview, BTD range, BTC quote,
settlement observation, rights receipt, source-to-shares allocation, delivery
receipt, compensation statement, or repair case.

No V44 economic projection may disclose protected source, unpaid AssetPack
source, raw prompts, raw provider responses, wallet private material,
credentials, private settlement payloads, or value-bearing mainnet secrets.

## V44 totality and precision enforcement rule

V44 must use protocol names precisely. PackActivity is activity and inspection.
BTD is the read-right/range token object. BTC is settlement money. Source-to-
shares is contributor allocation. Deposit options are not minted BTD. Quotes
are not finality. Preview is not source disclosure. Portfolio metrics are not
ledger truth unless they reconcile to receipts.

Every economic number must name whether it is estimate, quote, observed
payment, final settlement, contributor allocation, delivery status, or repair
state. When a value is not yet final, the UI, API, storage projection, and
generated proof must say so.

The canonical V44 economic label list is exactly: estimate, quote, observed payment, final settlement, contributor allocation, delivery, or repair state.

## V44 system goals, non-goals, and design principles

Goals:

- Make `/packs` an enterprise portfolio and market-intelligence surface for
  many AssetPack activities, not only a single transaction inspector.
- Add source-safe demand/supply intelligence: what Reads need, what deposits
  may satisfy, what Needs were not fit, what deposit options are likely useful.
- Harden quote policy and spend governance for Reading procurement.
- Harden depositor earning visibility, compensation statements, and ROI
  readback for Depository supply.
- Bind BTD/BTC/source-to-shares accounting into auditable portfolio records.
- Add organization-level budgets, approvals, spend limits, and critical-IP
  policies over `/read`, `/deposit`, and `/packs`.
- Rehearse scaled multi-pack, multi-org local/staging economic flows.

Non-goals:

- V44 does not expose unpaid source.
- V44 does not bypass Need review, Finding Fits, BTC settlement, BTD rights
  transfer, or repository delivery reconciliation.
- V44 does not replace V36 Exchange canon; it builds the enterprise operating
  layer for AssetPack economic activity over the product routes.
- V44 does not admit value-bearing mainnet operation without later explicit
  launch gates.

Design principles: AssetPack portfolio truth, source-safe market intelligence,
deterministic economic labels, budgeted Reading, ROI-aware Depositing,
receipt-backed accounting, governance before scale, proof-on-expand, and
enterprise-grade auditability.

## V44 system architecture and layer boundaries

V44 acts through existing layers:

- `/packs`, `/read`, and `/deposit` routes from V43;
- package-owned protocol, BTD, pipeline, prompt, telemetry, storage, and proof
  primitives;
- PackActivity and Depository supply indexes;
- ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis for Reading;
- deposit AssetPack option synthesis, policy, and admission surfaces for
  Depositing;
- BTD/BTC ledger, source-to-shares, quote, settlement, rights, and delivery
  receipt projections;
- organization policy, wallet, budget, and approval state from Auxillaries;
- generated source-safe proof artifacts and local/staging rehearsal scripts.

Demonstration code remains self-contained inside `protocol-demonstration/`.

## V44 canonical domain model

V44 adds or promotes these product objects: EnterprisePackPortfolio,
PackPortfolioPosition, PackMarketSignal, ReadDemandSignal, UnfitNeedSignal,
DepositSupplyOpportunity, ReadingBudgetPolicy, AssetPackQuotePolicy,
ProcurementApprovalReceipt, DepositorEarningStatement, ContributorCompensationStatement,
PackEconomicStatement, OrganizationPackPolicy, PackGovernanceDecision,
ScaledNetworkRehearsalReceipt, and PortfolioRepairCase.

These bind to existing Bitcode objects: PackActivity, DepositAssetPackOption,
Depository AssetPack records, Read Requests, synthesized Needs, candidate Fits,
selected Fit sets, source-safe AssetPack previews, BTD ranges, BTC quotes,
settlement observations, rights receipts, source-to-shares allocations,
repository delivery receipts, telemetry events, and proof roots.

## V44 whole Bitcode operator chain

The V44 operator chain is: connect repositories and organization policy,
synthesize and approve deposit AssetPack options, admit source-safe Depository
supply, observe Reading demand and unfound Needs, request Reads under budget,
review synthesized Needs, request Finding Fits, generate source-safe AssetPack
preview and quote, approve procurement, settle BTC, transfer BTD read rights,
deliver to repository, allocate source-to-shares compensation, issue portfolio
and contributor statements, reconcile ledger/database/storage, repair drift,
and inspect scaled economic truth through `/packs`.

## V44 Gate 1 Scaled Engineering Economy Roadmap Opening

Gate 1 opens the V44 specification family, updates roadmap/docs/workflows from
active V43 to draft V44, defines scaled engineering economy acceptance
criteria, and wires `check:v44-gate1`. It does not implement portfolio
dashboards, policy engines, or economic settlement code.

Gate 1 closes when the V44 spec family, roadmap, README, protocol README,
workflow posture, package script, and checker agree on V43 active / V44 draft
truth and name every V44 gate.

## V44 Gate 2 Economic Domain Model And Receipt Taxonomy

Gate 2 must implement package-backed source-safe economic object contracts for
portfolio positions, market signals, quote states, settlement states,
compensation statements, governance decisions, and repair cases. It must label
estimate, quote, observed payment, final settlement, contributor allocation,
delivery, and repair states distinctly.

Gate 2 closes through `V44EconomicDomainModel` in
`packages/protocol/src/canonical/v44-economic-domain-model.js`, deterministic
`.bitcode/v44-economic-domain-model.json`, `generate:v44-economic-domain-model`,
`check:v44-economic-domain-model`, and `check:v44-gate2`. The artifact names
EnterprisePackPortfolio, PackPortfolioPosition, PackMarketSignal,
ReadDemandSignal, UnfitNeedSignal, DepositSupplyOpportunity,
ReadingBudgetPolicy, AssetPackQuotePolicy, ProcurementApprovalReceipt,
DepositorEarningStatement, ContributorCompensationStatement,
PackEconomicStatement, OrganizationPackPolicy, PackGovernanceDecision,
ScaledNetworkRehearsalReceipt, and PortfolioRepairCase as source-safe economic
objects. The receipt taxonomy names portfolio-position, market-signal,
quote-state, settlement-state, compensation-statement, governance-decision,
repair-case, budget-policy, supply-opportunity, and network-rehearsal. It does
not expose protected source, unpaid AssetPack source, raw prompts, provider
payloads, credentials, wallet private material, private settlement payloads, or
value-bearing mainnet operation.

## V44 Gate 3 Packs Portfolio Search And Market Intelligence

Gate 3 must evolve `/packs` from activity master-detail into portfolio and
market-intelligence operation: saved filters, organization views, demand/supply
signals, unfound Need surfaces, compensation and settlement facets, proof-root
drilldown, and no-source-leak tests.

Gate 3 closes through `V44PacksPortfolioMarketIntelligence` in
`packages/protocol/src/canonical/v44-packs-portfolio-market-intelligence.js`,
deterministic `.bitcode/v44-packs-portfolio-market-intelligence.json`,
`generate:v44-packs-portfolio-market-intelligence`,
`check:v44-packs-portfolio-market-intelligence`, and `check:v44-gate3`. The
`/api/packs/activity` projection now returns `marketIntelligence` with
source-safe portfolio positions, demand/supply/unfit-Need/settlement/
compensation/delivery/repair signals, saved filter presets, and settlement,
compensation, delivery, and repair facets. `/packs` renders those portfolio
positions, saved filters, market signals, and facet filters while retaining
proof-root drilldown and no-source-leak tests.

## V44 Gate 4 Reading Budget, Quote Policy, And Procurement Governance

Gate 4 must bind Reading spend controls: budget envelopes, approval thresholds,
quote expiry, deterministic share-to-fee policy, buyer authorization, BTC/BTD
settlement readiness, and source-safe pre-purchase review.

Gate 4 closes through `V44ReadingBudgetQuotePolicy` in
`packages/protocol/src/canonical/v44-reading-budget-quote-policy.js`,
deterministic `.bitcode/v44-reading-budget-quote-policy.json`,
`generate:v44-reading-budget-quote-policy`,
`check:v44-reading-budget-quote-policy`, and `check:v44-gate4`. The `/read`
route session now projects `ReadProcurementGovernance` with source-safe budget
policy, quote policy, procurement approval, buyer and wallet authority,
settlement readiness blockers, pre-purchase review roots, and deterministic
measurement-weight-volume share-to-fee calculation. `/read` renders those
budget, quote, approval, wallet authority, and settlement-readiness fields
without exposing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, private settlement payloads, or
value-bearing mainnet admission.

## V44 Gate 5 Depositor Earnings, ROI, And Supply Opportunity Intelligence

Gate 5 must bind deposit-side economic clarity: likely demand, unfit Need
opportunities, ROI posture, source criticality, expected compensation ranges,
earning statements, and source-safe Depository supply recommendations.

Gate 5 closes through `V44DepositorEarningsSupplyOpportunities` in
`packages/protocol/src/canonical/v44-depositor-earnings-supply-opportunities.js`,
deterministic `.bitcode/v44-depositor-earnings-supply-opportunities.json`,
`generate:v44-depositor-earnings-supply-opportunities`,
`check:v44-depositor-earnings-supply-opportunities`, and `check:v44-gate5`.
The `/deposit` route session now projects `DepositorEarningSupplyIntelligence`
with source-safe likely demand, unfit Need opportunity signals, ROI posture,
source criticality posture, estimate-only BTC compensation ranges,
source-to-shares proof boundaries, earning statements, and supply
recommendations. `/deposit` renders those earning, opportunity, compensation,
and recommendation fields without exposing protected source, raw source text,
unpaid AssetPack source, prompts, provider responses, wallet private material,
private settlement payloads, or value-bearing mainnet admission.

## V44 Gate 6 BTD/BTC Accounting And Contributor Compensation Statements

Gate 6 must bind BTD range state, BTC settlement observations, source-to-shares
allocation, contributor statements, depositor earning summaries, treasury
routes, repair states, and ledger/database/object-storage reconciliation.

Gate 6 closes through `V44BtdBtcCompensationStatements` in
`packages/protocol/src/canonical/v44-btd-btc-compensation-statements.js`,
deterministic `.bitcode/v44-btd-btc-compensation-statements.json`,
`generate:v44-btd-btc-compensation-statements`,
`check:v44-btd-btc-compensation-statements`, and `check:v44-gate6`.
The settlement boundary now projects `BtdBtcCompensationStatements` with
source-safe BTD range state, BTC settlement observation, source-to-shares
contributor allocations, depositor earning summaries, treasury routes,
ledger/database/object-storage reconciliation, and repair statements. `/packs`
renders the accounting readback without exposing protected source, raw source
text, unpaid AssetPack source, raw prompts, interpolated prompts, raw provider
responses, wallet private material, private settlement payloads, or
value-bearing mainnet admission.

## V44 Gate 7 Organization Policy, Approval, And Wallet Authority

Gate 7 must bind organization-level policy across `/read`, `/deposit`, and
`/packs`: roles, budget approvals, source criticality approvals, wallet
authority, spend limits, deposit limits, policy receipts, and fail-closed
permission checks.

Gate 7 closes through `V44OrganizationPolicyWalletAuthority` in
`packages/protocol/src/canonical/v44-organization-policy-wallet-authority.js`,
deterministic `.bitcode/v44-organization-policy-wallet-authority.json`,
`generate:v44-organization-policy-wallet-authority`,
`check:v44-organization-policy-wallet-authority`, and `check:v44-gate7`.
The BTD authority layer now recognizes Reading spend, source unlock, delivery,
repair, administration, and deposit option synthesis/approval/submission
actions. `OrganizationPolicyWalletAuthority` composes source-safe budget
approval, deposit approval, wallet authority, per-route action statements,
aggregate blockers, authority roots, and disclosure posture. `/read` and
`/deposit` sessions render organization authority state and fail closed on
missing policy, role grants, wallet binding, explicit approval, spend limits,
deposit limits, or critical-source approval. `/packs` projects the same
metadata as searchable governance readback without protected source, raw
prompts, provider responses, private settlement payloads, credentials, wallet
private material, or value-bearing mainnet admission.

## V44 Gate 8 Enterprise Product UX For Economic Operation

Gate 8 must make portfolio, budget, compensation, market signal, and governance
surfaces legible and polished: dense tables, expandable proof detail, keyboard
navigation, responsive layouts, concise copy, and visual regression coverage.

Gate 8 closes through `V44EnterpriseProductUx` in
`packages/protocol/src/canonical/v44-enterprise-product-ux.js`,
deterministic `.bitcode/v44-enterprise-product-ux.json`,
`generate:v44-enterprise-product-ux`, `check:v44-enterprise-product-ux`,
and `check:v44-gate8`. The shared product route shell now exposes
`ProductRouteEnterpriseSummary`, `ProductRouteKeyboardHint`, and
`ProductRouteProofDetail`. `/packs` renders an enterprise economy overview,
keyboard navigation, a sticky dense economic operation table, and expandable
accounting/governance/proof roots. `/read` renders Reading economy summary,
keyboard navigation, and route/procurement/authority proof detail. `/deposit`
renders Depositing economy summary, keyboard navigation, and synthesis,
policy, admission, earnings, and authority proof detail. Focused tests bind
the visual regression hooks and source-safe expansion controls without
serializing protected source, raw source text, unpaid AssetPack source, raw
prompts, raw provider responses, credentials, wallet private material,
private settlement payloads, or value-bearing mainnet admission.

## V44 Gate 9 Scaled Local/Staging Network Rehearsal

Gate 9 must rehearse many deposits, many Reads, many Fits, many quotes, many
settlements, many contributors, and repair states on local/staging-testnet
lanes without value-bearing mainnet admission or secret serialization.

Gate 9 closes through `V44ScaledNetworkRehearsal` in
`packages/protocol/src/canonical/v44-scaled-network-rehearsal.js`,
deterministic `.bitcode/v44-scaled-network-rehearsal.json`,
`generate:v44-scaled-network-rehearsal`,
`check:v44-scaled-network-rehearsal`, `rehearse:v44-scaled-network`, and
`check:v44-gate9`. The operator receipt covers both `local` and
`staging-testnet` lanes; `/deposit`, `/read`, and `/packs`; and the exact
minimum scale of 24 deposits, 18 Reads, 72 Fit candidates, 18 quotes, 12 BTC
settlement observations, 36 contributors, 8 repair cases, and 54 PackActivity
rows. The staging-testnet lane is pinned to Supabase project
`tkpyosihuouusyaxtbau` and Data API host
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`. Dry-run operator receipts
prove environment-family readiness without serializing credential values; live
execution remains explicitly opt-in and delegates to the Vercel Sandbox
AssetPack harness. Gate 9 also binds database stream readback,
ledger/database/object-storage reconciliation, settlement finality readback,
source-to-shares compensation readback, repository delivery readback, and
repair readback while continuing to block protected source, raw source text,
unpaid AssetPack source, raw prompts, raw provider responses, credentials,
wallet private material, private settlement payloads, live rehearsal logs, and
value-bearing mainnet movement.

## V44 Gate 10 Promotion Readiness

V44 promotion readiness canon is source-safe promotion metadata over the
complete scaled engineering economy closure set.

Gate 10 must bind every V44 artifact, source-safety proof, workflow, generated
PROVEN hook, docs update, local/staging rehearsal, and active V44 / draft V45
runtime posture before V44 can be promoted into `main`. The post-promotion
posture is also recorded as V44 active / draft V45 for generated proof checks.

Gate 10 adds package-backed `V44PromotionReadinessReport`, deterministic
`.bitcode/v44-promotion-readiness-report.json`,
`generate:v44-promotion-readiness`, `check:v44-promotion-readiness`,
`check:v44-gate10`, `v44-canon-promotion.yml`, V44 support in
`promote-bitcode-canon.mjs`, spec-family/runtime promotion support, and
`generateCanonicalProvenMarkdown({ version: 'V44' })` support.

## V44 canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: DepositAssetPackOption,
DepositSupplyOpportunity, Depository AssetPack records, PackActivity rows,
source-safe option proofs, and later V44 supply opportunity artifacts.
Current algorithms and derivation rules: demand/supply matching, source
criticality, ROI posture, admitted supply indexing, and contributor allocation
must stay receipt-backed.
Current invariants and fail-closed conditions: critical source remains blocked,
unapproved options do not enter the Depository, and deposits do not mint BTD
until paid Need-Fit settlement.
Current proof obligations: source-safe option roots, policy roots, admission
receipts, demand signal roots, and compensation preview roots.
Current source-bearing implementation basis: V43 deposit route, asset-pack
pipeline package, Depository supply index, BTD/source-to-shares primitives, and
future V44 package helpers.
Current validating commands and parity basis: `pnpm run check:v44-gate1` and
later V44 gate checks.
Current accepted boundaries: no raw source, unpaid AssetPack source, raw
prompts, provider responses, credentials, or wallet private material in
generated economic artifacts.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Request, synthesized
Need, Finding Fits receipts, AssetPack preview, quote, settlement, BTD rights,
delivery, and procurement approvals.
Current algorithms and derivation rules: ReadNeedComprehensionSynthesis and
ReadFitsFindingSynthesis remain the inference authority; V44 adds budgets and
approval policy around quotes.
Current invariants and fail-closed conditions: no source before settlement,
accepted Need before Finding Fits, approval before budgeted purchase, and
rights receipt before delivery.
Current proof obligations: Need review roots, search roots, selected-fit roots,
quote roots, approval roots, settlement roots, and delivery roots.
Current source-bearing implementation basis: V43 `/read`, pipeline host,
pipeline-asset-pack, BTD package, and route storage projections.
Current validating commands and parity basis: V44 gate checks plus inherited
V39/V42/V43 Reading checks.
Current accepted boundaries: budget policy may block purchase but cannot weaken
source-safety or settlement law.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: Depository search documents,
candidate Fits, selected Fit sets, market signals, unfit Need signals, ranking
receipts, and verification verdicts.
Current algorithms and derivation rules: lexical, semantic, metadata, demand,
and vector search channels must remain source-safe and thresholded.
Current invariants and fail-closed conditions: no candidate source leaks to a
Reader before settlement, and no low-quality Fit becomes a quoteable pack.
Current proof obligations: query roots, search channel roots, ranking roots,
selected-fit provenance, and no-fit repair roots.
Current source-bearing implementation basis: V38/V39/V41 search and prompt
hardening plus V43 product surfaces.
Current validating commands and parity basis: inherited search tests and later
V44 market-signal tests.
Current accepted boundaries: market intelligence summarizes demand and supply;
it does not disclose protected source.

### Selection and materialization

Current canonical objects and emitted artifacts: AssetPack preview, withheld
source bundle, repository delivery receipt, delivery pull request, and repair
case.
Current algorithms and derivation rules: only paid rights unlock full source
materialization and delivery.
Current invariants and fail-closed conditions: preview is source-safe; delivery
is blocked until settlement and BTD rights transfer are proven.
Current proof obligations: preview boundary proof, delivery unlock proof,
repository PR proof, and repair proof.
Current source-bearing implementation basis: V42 delivery boundary, V43 route
state, pipeline hosts, and repository delivery adapters.
Current validating commands and parity basis: inherited settlement/delivery
checks and future scaled rehearsal checks.
Current accepted boundaries: enterprise portfolio views may show delivery
state but not unpaid source.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: organization policy, wallet
authority, approval receipts, role checks, account boundaries, and audit rows.
Current algorithms and derivation rules: policy decisions must compose with
organization roles, wallet authority, budget, source criticality, and route
state.
Current invariants and fail-closed conditions: unauthorized spend, deposit
admission, source disclosure, wallet operation, or delivery remains blocked.
Current proof obligations: approval roots, denial roots, wallet authority
roots, and policy replay roots.
Current source-bearing implementation basis: Auxillaries, organization
permission authority, BTD/wallet primitives, and V44 governance helpers.
Current validating commands and parity basis: V31/V39/V42/V43 inherited tests
plus later V44 governance checks.
Current accepted boundaries: no credentials, private keys, tokens, private
settlement payloads, or protected source in generated proofs.

### Disclosure and projection

Current canonical objects and emitted artifacts: source-safe projections,
portfolio rows, market signals, statements, proof roots, and expanded metadata.
Current algorithms and derivation rules: every projected economic field must
map to an estimate, quote, observed payment, final settlement, allocation,
delivery, or repair state.
Current invariants and fail-closed conditions: protected source and unpaid
source remain withheld; proof expansion never becomes payload exposure.
Current proof obligations: no-source-leak scans, redaction posture, projection
roots, and statement roots.
Current source-bearing implementation basis: V35 telemetry/docs, V39/V42/V43
source-safe route and artifact projections.
Current validating commands and parity basis: V44 gate checks and inherited
source-safety scans.
Current accepted boundaries: public docs may explain; product surfaces must
operate with concise labels and proof-on-expand.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTC quote, settlement
observation, BTD rights transfer, source-to-shares allocation, contributor
statement, depositor earning statement, treasury route, and reconciliation
receipt.
Current algorithms and derivation rules: deterministic share-to-fee and
source-to-shares policies must reconcile quote, payment, rights, compensation,
and delivery state.
Current invariants and fail-closed conditions: accounting drift blocks
finality, compensation, delivery, and promotion of scaled rehearsals.
Current proof obligations: quote roots, payment roots, rights roots,
allocation roots, statement roots, and reconciliation roots.
Current source-bearing implementation basis: V27 BTD law, V30 Protocol/BTD
rails, V36 Exchange economics, V42 settlement, and V43 PackActivity.
Current validating commands and parity basis: BTD tests, settlement tests, and
later V44 accounting checks.
Current accepted boundaries: estimates are not settlement; statements are
source-safe projections over receipt-backed ledger truth.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: generated `.bitcode/v44-*`
reports, `BITCODE_SPEC_V44_PROVEN.md`, local/staging rehearsal receipts, and
workflow check logs.
Current algorithms and derivation rules: every V44 gate must produce or bind
source-safe, deterministic proof evidence before promotion.
Current invariants and fail-closed conditions: missing proofs, stale posture,
secret serialization, source leakage, or value-bearing mainnet admission block
gate closure.
Current proof obligations: spec family, generated artifact, test, workflow,
rehearsal, and promotion readiness closure.
Current source-bearing implementation basis: protocol package canonical report
helpers, promotion scripts, gate workflows, and demonstration witness.
Current validating commands and parity basis: `check:v44-gate1`, later V44
checks, and promotion readiness.
Current accepted boundaries: demonstration remains self-contained and
commercial code does not import it.

## V44 proof-family canon

### Inference-synthesis

proofArtifactPath: `.bitcode/v44-inference-economic-policy.json`.
members: ReadNeed, Finding Fits, deposit options, market signals, quote policy.
theoremIds: inference-source-safety, parsed-output-validity.
replayStepIds: prompt registry resolution, PTRR/Failsafe/Thricified receipts.
witnessArtifactPaths: V38/V41 prompt and inference artifacts.
current member closure criteria: every economic inference remains source-safe.
current member verdict shape: pass/fail plus proof roots.
current theorem-by-theorem closure reading: inference supports economic policy
without exposing source or raw provider payloads.
current theorem-to-replay grouping: prompt, context, result, parsed type.
minimum artifact/replay binding set: prompt benchmark root, schema root.
current proof-object fields: family, member, theorem, replay, verdict.
generated-artifact and test bindings: later V44 generated reports.
fail-closed conditions: prompt leak, schema failure, stale context.

### Prompt-completeness

proofArtifactPath: `.bitcode/v44-prompt-economic-coverage.json`.
members: policy prompts, market-signal prompts, statement prompts.
theoremIds: complete-context, no-overlap-vocabulary.
replayStepIds: registry composition, interpolation, parser target.
witnessArtifactPaths: V41 prompt inventory and benchmarks.
current member closure criteria: each prompt has semantic purpose and type.
current member verdict shape: complete/incomplete.
current theorem-by-theorem closure reading: prompts operate as programs.
current theorem-to-replay grouping: PromptPart, Prompt, generation, output.
minimum artifact/replay binding set: inventory row and benchmark fixture.
current proof-object fields: prompt id, part ids, variables, parser.
generated-artifact and test bindings: V44 prompt coverage checks.
fail-closed conditions: missing variable, raw prompt disclosure, weak parser.

### Static-code-analysis

proofArtifactPath: `.bitcode/v44-static-economic-surface.json`.
members: routes, APIs, packages, tests, workflows.
theoremIds: surface-present, no-legacy-authority.
replayStepIds: rg inventory, typecheck, import casing.
witnessArtifactPaths: CI and gate logs.
current member closure criteria: economic surfaces are implemented in place.
current member verdict shape: present/missing/drift.
current theorem-by-theorem closure reading: code matches V44 spec plan.
current theorem-to-replay grouping: file, export, test, workflow.
minimum artifact/replay binding set: source path root and command root.
current proof-object fields: file, symbol, command, verdict.
generated-artifact and test bindings: V44 inventory artifacts.
fail-closed conditions: missing route, versioned source path, stale name.

### Verification-decisions

proofArtifactPath: `.bitcode/v44-verification-decisions.json`.
members: quote verification, budget approval, compensation statement.
theoremIds: admissible, blocked, repairable.
replayStepIds: policy eval, ledger readback, storage readback.
witnessArtifactPaths: generated V44 receipts.
current member closure criteria: each decision records why it is allowed.
current member verdict shape: accepted/rejected/repair-required.
current theorem-by-theorem closure reading: economic actions are auditable.
current theorem-to-replay grouping: input, policy, receipt, output.
minimum artifact/replay binding set: decision root and policy root.
current proof-object fields: decision id, actor, policy, verdict.
generated-artifact and test bindings: package and API tests.
fail-closed conditions: ambiguous authority, missing receipt, drift.

### Selection-and-materialization

proofArtifactPath: `.bitcode/v44-selection-materialization.json`.
members: selected Fits, AssetPack preview, delivery.
theoremIds: source-withheld, paid-unlock.
replayStepIds: candidate selection, preview, settlement, delivery.
witnessArtifactPaths: V42/V43 delivery artifacts.
current member closure criteria: materialization is settlement-gated.
current member verdict shape: locked/unlocked/delivered.
current theorem-by-theorem closure reading: source appears only after rights.
current theorem-to-replay grouping: fit, preview, rights, PR.
minimum artifact/replay binding set: preview root, rights root, delivery root.
current proof-object fields: pack id, state, proof roots.
generated-artifact and test bindings: route and package tests.
fail-closed conditions: unpaid source leak, missing rights, failed PR.

### Authorization-and-sensitive-flow

proofArtifactPath: `.bitcode/v44-authorization-sensitive-flow.json`.
members: budgets, wallet authority, approvals, source policy.
theoremIds: authorized, denied, escalated.
replayStepIds: role check, budget check, wallet check, policy check.
witnessArtifactPaths: organization policy receipts.
current member closure criteria: sensitive operations are actor-bound.
current member verdict shape: allow/deny/escalate.
current theorem-by-theorem closure reading: governance precedes value.
current theorem-to-replay grouping: actor, policy, action, receipt.
minimum artifact/replay binding set: actor root and policy root.
current proof-object fields: actor, org, action, verdict.
generated-artifact and test bindings: V44 governance checks.
fail-closed conditions: no actor, stale role, missing approval.

### Settlement-source-to-shares

proofArtifactPath: `.bitcode/v44-settlement-source-to-shares.json`.
members: BTC settlement, BTD transfer, contributor allocation.
theoremIds: conservation, finality, statement-accuracy.
replayStepIds: quote, observe payment, transfer rights, allocate shares.
witnessArtifactPaths: BTD and ledger artifacts.
current member closure criteria: all sats and shares reconcile.
current member verdict shape: reconciled/drift/repair.
current theorem-by-theorem closure reading: statements derive from receipts.
current theorem-to-replay grouping: quote, payment, allocation, statement.
minimum artifact/replay binding set: quote root, tx root, allocation root.
current proof-object fields: amount, route, owner, contributor, verdict.
generated-artifact and test bindings: BTD and protocol tests.
fail-closed conditions: conservation drift, no finality, wrong owner.

### Disclosure-boundary

proofArtifactPath: `.bitcode/v44-disclosure-boundary.json`.
members: portfolio rows, market signals, statements, proof expansion.
theoremIds: source-safe, prompt-safe, provider-safe.
replayStepIds: projection, redaction, no-source scan.
witnessArtifactPaths: source-safe generated reports.
current member closure criteria: only metadata and proof roots are serialized.
current member verdict shape: source-safe/not-source-safe.
current theorem-by-theorem closure reading: enterprise scale does not reduce
confidentiality.
current theorem-to-replay grouping: payload, classifier, redaction, result.
minimum artifact/replay binding set: payload root and scan root.
current proof-object fields: field, tier, verdict.
generated-artifact and test bindings: no-leak tests.
fail-closed conditions: protected source, raw prompt, provider payload.

### Proof-contract

proofArtifactPath: `.bitcode/v44-proof-contract.json`.
members: gate artifacts, PROVEN appendix, promotion workflow.
theoremIds: deterministic, replayable, complete.
replayStepIds: generate, check, promote, verify.
witnessArtifactPaths: `.bitcode/v44-*`, `BITCODE_SPEC_V44_PROVEN.md`.
current member closure criteria: every gate is generated, checked, and bound.
current member verdict shape: closed/open/blocked.
current theorem-by-theorem closure reading: canon promotion is evidence-backed.
current theorem-to-replay grouping: artifact, command, workflow, commit.
minimum artifact/replay binding set: report root and workflow root.
current proof-object fields: gate, artifact, command, verdict.
generated-artifact and test bindings: V44 promotion readiness.
fail-closed conditions: stale pointer, missing artifact, failing check.

## V44 generated canon

V44 generated canon begins with the spec family. Later gates must add
package-backed `.bitcode/v44-*` artifacts and ultimately
`BITCODE_SPEC_V44_PROVEN.md`.

### Inherited V19 reproducible-canon artifacts

Inherited V19 reproducible-canon artifacts remain binding for deterministic
artifact generation, byte-stable replay, proof-source commit capture, and
fail-closed stale-artifact detection.

### Inherited V20 operator-quality artifacts

Inherited V20 operator-quality artifacts remain binding for operator-facing
quality, accessibility, visual inspectability, and generated quality evidence.

### Exact generated-artifact inventory matrix

| artifact | field | verdict |
| --- | --- | --- |
| `.bitcode/v44-spec-family-report.json` | aggregate proof verdict | draft-required |
| `.bitcode/v44-canonical-input-report.json` | generated artifact inventories | draft-required |
| `.bitcode/v44-canon-posture-drift-report.json` | active/draft posture | draft-required |
| `.bitcode/v44-economic-domain-model.json` | economic domain model | implemented-source-safe |
| `.bitcode/v44-packs-portfolio-market-intelligence.json` | Packs portfolio and market intelligence | implemented-source-safe |
| `.bitcode/v44-reading-budget-quote-policy.json` | Reading budget and quote policy | implemented-source-safe |
| `.bitcode/v44-depositor-earnings-supply-opportunities.json` | depositor earnings and supply opportunities | implemented-source-safe |
| `.bitcode/v44-btd-btc-compensation-statements.json` | BTD/BTC compensation statements | implemented-source-safe |
| `.bitcode/v44-organization-policy-wallet-authority.json` | organization policy and wallet authority | implemented-source-safe |
| `.bitcode/v44-enterprise-product-ux.json` | enterprise product UX | implemented-source-safe |
| `.bitcode/v44-scaled-network-rehearsal.json` | scaled network rehearsal | implemented-source-safe |
| `.bitcode/v44-promotion-readiness-report.json` | promotion readiness | implemented-source-safe |

### V44 generated artifact contract catalog

Required draft artifacts include `.bitcode/v44-economic-domain-model.json`,
`.bitcode/v44-packs-portfolio-market-intelligence.json`,
`.bitcode/v44-reading-budget-quote-policy.json`,
`.bitcode/v44-depositor-earnings-supply-opportunities.json`,
`.bitcode/v44-btd-btc-compensation-statements.json`,
`.bitcode/v44-organization-policy-wallet-authority.json`,
`.bitcode/v44-enterprise-product-ux.json`,
`.bitcode/v44-scaled-network-rehearsal.json`, and
`.bitcode/v44-promotion-readiness-report.json`.

### V44 specifying generated artifacts

V44 starts with `.bitcode/v44-spec-family-report.json`,
`.bitcode/v44-canonical-input-report.json`, and
`.bitcode/v44-canon-posture-drift-report.json`. Later gates add economic,
portfolio, budget, compensation, governance, UX, rehearsal, and promotion
readiness artifacts.

### Shared generated-artifact fields

Shared fields are schema id, version, current canonical/latest target,
artifact digest, source-safety verdict, validation commands, proof-source
commit, generated artifact inventories, and fail closed when stale.

### Artifact-specific generated payload fields

Artifact-specific payloads name portfolio positions, market signals, quote
states, budget decisions, settlement receipts, source-to-shares allocations,
contributor compensation statements, governance approvals, delivery states,
repair states, and proof roots.

### Artifact confidentiality and disclosability taxonomy

All V44 generated artifacts are source-safe metadata unless a later paid
settlement and rights-transfer surface explicitly authorizes source delivery.
They must not serialize protected source, unpaid AssetPack source, raw prompts,
raw provider responses, credentials, wallet private material, or private
settlement payloads.

### Minimum generated appendix rendered contents

The V44 generated appendix must render aggregate proof verdict, exact
proof-family inventory, exact per-family member inventory, exact per-family
theorem inventory, exact replay-step inventories and theorem bindings, witness
artifact inventories, generated artifact inventories, scenario and run coverage
matrices, proof-source commit, and fail closed when any economic or source-safe
proof is missing.

### Canonical regeneration and fail-closed posture

Regeneration must be deterministic. V44 promotion fails closed when artifacts
are stale, source safety is violated, value-bearing mainnet is admitted without
explicit later launch authority, or economic receipts cannot reconcile.

## V44 validation canon

Gate 1 validates with `pnpm run check:v44-gate1`. Gate 2 validates with
`pnpm run generate:v44-economic-domain-model`,
`pnpm run check:v44-economic-domain-model`, and `pnpm run check:v44-gate2`.
Gate 3 validates with
`pnpm run generate:v44-packs-portfolio-market-intelligence`,
`pnpm run check:v44-packs-portfolio-market-intelligence`, and
`pnpm run check:v44-gate3`.
Gate 4 validates with `pnpm run generate:v44-reading-budget-quote-policy`,
`pnpm run check:v44-reading-budget-quote-policy`, and
`pnpm run check:v44-gate4`.
Gate 5 validates with
`pnpm run generate:v44-depositor-earnings-supply-opportunities`,
`pnpm run check:v44-depositor-earnings-supply-opportunities`, and
`pnpm run check:v44-gate5`.
Gate 6 validates with
`pnpm run generate:v44-btd-btc-compensation-statements`,
`pnpm run check:v44-btd-btc-compensation-statements`, and
`pnpm run check:v44-gate6`.
Gate 7 validates with
`pnpm run generate:v44-organization-policy-wallet-authority`,
`pnpm run check:v44-organization-policy-wallet-authority`, and
`pnpm run check:v44-gate7`.
Gate 8 validates with `pnpm run generate:v44-enterprise-product-ux`,
`pnpm run check:v44-enterprise-product-ux`, and `pnpm run check:v44-gate8`.
Gate 9 validates with `pnpm run generate:v44-scaled-network-rehearsal`,
`pnpm run check:v44-scaled-network-rehearsal`,
`pnpm run rehearse:v44-scaled-network -- --lane local --json`,
`pnpm run rehearse:v44-scaled-network -- --lane staging-testnet --json`, and
`pnpm run check:v44-gate9`.
Promoted V44 posture validates with
`node scripts/check-bitcode-spec-family.mjs --version V44 --mode promoted --current-target V44`,
`node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V44 --draft-target V45`,
and `git diff --check`. Historical V43-active / V44-draft checks are retained
only as pre-promotion evidence in gate artifacts and prior branch history; they
are not active V44 canon after promotion.

## V44 promotion canon

V44 promotion must happen only from `version/v44` into `main` after all V44
gates close. The promotion workflow must generate `BITCODE_SPEC_V44_PROVEN.md`,
advance `BITCODE_SPEC.txt` to `V44`, prepare active V44 / draft V45 runtime
posture, and verify canonical inputs plus posture drift.

## V44 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

EnterprisePackPortfolio, PackPortfolioPosition, PackMarketSignal,
ReadDemandSignal, UnfitNeedSignal, DepositSupplyOpportunity, ReadingBudgetPolicy,
AssetPackQuotePolicy, ProcurementApprovalReceipt, DepositorEarningStatement,
ContributorCompensationStatement, PackEconomicStatement,
OrganizationPackPolicy, PackGovernanceDecision, ScaledNetworkRehearsalReceipt,
and PortfolioRepairCase are V44 draft surfaces.

### Appendix B. Proof family closure catalog

V44 proof families are inherited from V43 and extended to scaled economic
operation. Inference-synthesis, Prompt-completeness, Static-code-analysis,
Verification-decisions, Selection-and-materialization,
Authorization-and-sensitive-flow, Settlement-source-to-shares,
Disclosure-boundary, and Proof-contract all remain mandatory.

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v44-inference-economic-policy.json` | economic inference | source-safety | prompt replay | V38/V41 | Reading and deposit inference |
| Prompt-completeness | `.bitcode/v44-prompt-economic-coverage.json` | policy prompts | complete-context | prompt registry | V41 | PromptPart and Prompt catalog |
| Static-code-analysis | `.bitcode/v44-static-economic-surface.json` | code surfaces | surface-present | static checks | CI | Routes/packages/workflows |
| Verification-decisions | `.bitcode/v44-verification-decisions.json` | decisions | admissible | policy replay | V44 receipts | Governance and accounting |
| Selection-and-materialization | `.bitcode/v44-selection-materialization.json` | selected packs | paid-unlock | delivery replay | V42/V43 | AssetPack preview and delivery |
| Authorization-and-sensitive-flow | `.bitcode/v44-authorization-sensitive-flow.json` | authority | authorized | role checks | Auxillaries | Org/wallet/budget policy |
| Settlement-source-to-shares | `.bitcode/v44-settlement-source-to-shares.json` | accounting | conservation | ledger replay | BTD | BTC/BTD/source-to-shares |
| Disclosure-boundary | `.bitcode/v44-disclosure-boundary.json` | projections | source-safe | no-leak scan | V43 | Source-safe UI/API/storage |
| Proof-contract | `.bitcode/v44-proof-contract.json` | gates | deterministic | promote | workflows | Promotion readiness |

### Appendix C. Generated artifact contract catalog

V44 generated artifacts must be source-safe JSON with schema id, version,
current target, artifact roots, predicate rows, source-safety verdict, and
forbidden payload classes. They must never serialize protected source, unpaid
AssetPack source, raw prompts, provider responses, credentials, wallet private
material, or private settlement payloads.

### Inherited V19 reproducible-canon artifacts

Inherited.

### Inherited V20 operator-quality artifacts

Inherited.

### Exact generated-artifact inventory matrix

| artifact | field | verdict |
| --- | --- | --- |
| `.bitcode/v44-spec-family-report.json` | aggregate proof verdict | draft-required |
| `.bitcode/v44-canonical-input-report.json` | exact generated-artifact inventory | draft-required |
| `.bitcode/v44-canon-posture-drift-report.json` | active/draft posture | draft-required |
| `.bitcode/v44-economic-domain-model.json` | economic domain model | implemented-source-safe |
| `.bitcode/v44-packs-portfolio-market-intelligence.json` | portfolio and market intelligence | implemented-source-safe |
| `.bitcode/v44-reading-budget-quote-policy.json` | budget and quote policy | implemented-source-safe |
| `.bitcode/v44-depositor-earnings-supply-opportunities.json` | depositor earning opportunity | implemented-source-safe |
| `.bitcode/v44-btd-btc-compensation-statements.json` | BTD/BTC/source-to-shares statement | implemented-source-safe |
| `.bitcode/v44-organization-policy-wallet-authority.json` | organization policy and wallet authority | implemented-source-safe |
| `.bitcode/v44-enterprise-product-ux.json` | enterprise product UX | implemented-source-safe |
| `.bitcode/v44-scaled-network-rehearsal.json` | scaled rehearsal | implemented-source-safe |
| `.bitcode/v44-promotion-readiness-report.json` | promotion readiness | implemented-source-safe |

### V44 specifying generated artifacts

`.bitcode/v44-spec-family-report.json`,
`.bitcode/v44-canonical-input-report.json`, and
`.bitcode/v44-canon-posture-drift-report.json` are the opening artifacts.
Gate 2 adds deterministic `.bitcode/v44-economic-domain-model.json`.
Gate 3 adds deterministic
`.bitcode/v44-packs-portfolio-market-intelligence.json`.
Gate 4 adds deterministic `.bitcode/v44-reading-budget-quote-policy.json`.
Gate 5 adds deterministic
`.bitcode/v44-depositor-earnings-supply-opportunities.json`.
Gate 6 adds deterministic `.bitcode/v44-btd-btc-compensation-statements.json`.
Gate 7 adds deterministic `.bitcode/v44-organization-policy-wallet-authority.json`.
Gate 8 adds deterministic `.bitcode/v44-enterprise-product-ux.json`.
Gate 9 adds deterministic `.bitcode/v44-scaled-network-rehearsal.json`.

### Shared generated-artifact fields

Version, digest, sourceSafetyVerdict, validationCommands, proof-source commit,
generated artifact inventories, and fail closed when stale.

### Artifact-specific generated payload fields

Portfolio, market signal, budget, quote, approval, settlement, BTD range,
source-to-shares allocation, compensation statement, delivery, repair, and
proof roots.

### Artifact confidentiality and disclosability taxonomy

Source-safe metadata only until settlement unlock and rights transfer.

### Minimum generated appendix rendered contents

V44 PROVEN must render aggregate proof verdict, exact proof-family inventory,
exact per-family member inventory, exact per-family theorem inventory, exact
replay-step inventories and theorem bindings, witness artifact inventories,
generated artifact inventories, scenario and run coverage matrices,
proof-source commit, and fail closed when any required proof is absent.

### Canonical regeneration and fail-closed posture

All V44 generators must be deterministic and checkable. Promotion fails closed
on stale artifacts, missing source-safety verdicts, secret serialization,
ledger drift, or value-bearing mainnet admission.

### Appendix D. Validation and checking gate catalog

Gate checks are `check:v44-gate1` through `check:v44-gate9` plus later V44
promotion checks. Gate 1 is specification and workflow posture; Gates 2 through
9 add generated reports, implementation tests, and scaled rehearsal receipts.

### Appendix E. Current canonical source map

Current V43 source basis includes `/packs`, `/read`, `/deposit`, PackActivity,
deposit AssetPack options, Reading state, pipeline hosts, BTD settlement,
protocol generated reports, gate workflows, and demonstration witness.

### Appendix F. Subsystem totality and derivability matrix

Required coverage phrases: repo supply and depositing; reading and measured
demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and
ranking; verification decisions; selection and materialization; branch
artifacts and assetPackEvidence; identity, authority, signing, and policy;
sensitive data and confidentiality flows; projection, disclosure, and
redaction; proof families, members, theorems, witnesses, and replay;
settlement, source-to-shares, journals, and exact accounting; telemetry,
persistence, state, and failure semantics; host/runtime capability truth;
operator experience and pedagogy; validation and test stack; generated
artifacts and canonical promotion.

### Appendix G. Canonical file-family and promotion contract catalog

The V44 file family is `BITCODE_SPEC_V44.md`,
`BITCODE_SPEC_V44_DELTA.md`, `BITCODE_SPEC_V44_NOTES.md`,
`BITCODE_SPEC_V44_PARITY_MATRIX.md`, later `BITCODE_SPEC_V44_PROVEN.md`,
and generated `.bitcode/v44-*` artifacts.

### Appendix H. Operator surface and quality contract catalog

Operators need portfolio, market signal, budget, compensation, governance,
proof, repair, and settlement surfaces that are readable by default and deeply
inspectable on demand.

### Appendix I. Scenario, workflow, and cross-product contract catalog

Scenarios must include auth-issuer-rollback, privacy-boundary-proof-export,
polyglot-gateway-benchmark-remediation, auth-many-asset-normalization,
Targeted deposit, Normalization deposit, patch, context, public, buyer,
reviewer, internal, Openly writable, Measurably readable, Provable, and
Valuable.

### Appendix J. Fail-closed contract and error posture matrix

Invalid deposit, prompt contract incompleteness, parsed-envelope
inadmissibility, no-survivor asset pack, authorization denial, public
projection overexposure, settlement conservation drift, stale promoted status
truth, missing budget approval, missing wallet authority, and compensation
reconciliation drift all block completion.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts remain withheld until settlement and rights
transfer. Portfolio and statement artifacts carry metadata, proof roots,
settlement roots, delivery state, and repair state only.

Source-bearing artifact paths remain inherited and protected:
`.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`,
`.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`,
`.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and
the later `BITCODE_SPEC_V44_PROVEN.md` generated appendix. V44 portfolio and
statement surfaces may cite their proof roots but must not disclose protected
payloads before paid settlement and rights transfer.

## V44 accepted boundaries and reopen conditions

Accepted boundaries: V44 scales economic operation without changing unpaid
source disclosure, BTD ownership, BTC settlement, source-to-shares, repository
delivery, demonstration isolation, or staging/mainnet lane boundaries.

Reopen V44 when portfolio projections cannot reconcile to ledger receipts,
governance can be bypassed, source-safe market intelligence leaks protected
payloads, or scaled rehearsal cannot prove many-pack economic flows.

## V44 completion condition

V44 completes when Bitcode can operate a scaled enterprise technical knowledge
economy over `/packs`, `/read`, and `/deposit`: many AssetPacks, Reads,
quotes, settlements, contributors, compensation statements, budgets,
governance decisions, repair states, and proof roots are source-safe,
auditable, tested, rehearsed locally/staging-testnet, and ready for canonical
promotion.
