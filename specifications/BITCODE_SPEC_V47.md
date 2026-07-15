# Bitcode Spec V47

## Status

- Version: `V47`
- V47 state: canonical promotion complete; V47 is the active commercial website testnet launch canon and the V47 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V47`
- Canonical proof-source commit: `0d594d117e7d9f2065c3622dd51c0e5e5456757e`
- Prior canonical anchor: `BITCODE_SPEC_V46.md`
- Prior generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v47-spec-family-report.json`, `.bitcode/v47-canonical-input-report.json`, `.bitcode/v47-canon-posture-drift-report.json`, V47 launch artifacts (`.bitcode/v47-feature-excess-alignment-audit.json`, `.bitcode/v47-seller-buyer-state-machine-law.json`, `.bitcode/v47-depositor-website-completion.json`, `.bitcode/v47-reader-website-completion.json`, `.bitcode/v47-packs-auxillaries-commercial-dashboard.json`, `.bitcode/v47-e2e-ip-selling-buying-tests.json`, `.bitcode/v47-landing-public-launch-messaging.json`, `.bitcode/v47-staging-testnet-deployment-rehearsal.json`), `.bitcode/v47-promotion-readiness-report.json`, V47 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V47_PROVEN.md` as the generated proof appendix for V47 promotion
- Source parity state: V47 source-side measurement law, seller/buyer state machines, depositor and reader route completions, packs/Auxillaries dashboard, E2E IP exchange browser proof, landing/public launch messaging, staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V47 file family
- Notes companion: `BITCODE_SPEC_V47_NOTES.md`
- Delta companion: `BITCODE_SPEC_V47_DELTA.md`
- Parity companion: `BITCODE_SPEC_V47_PARITY_MATRIX.md`
- Scope: V47 canonical system specification for commercial website testnet launch readiness, measurement law, seller/buyer launch state machines, route completion, browser-proven IP exchange, staging-testnet rehearsal, and promotion readiness over promoted V46 protocol comprehension canon
- Last fully realized canonical target preserved in source: `V47`

## Version executive summary

V47 is the final commercial-readiness version before Bitcode can deploy a
complete staging-testnet website experience for the first generally available
MVP. It narrows launch scope to the rich website application: `/deposit`,
`/read`, `/packs`, and Auxillaries for identity, connections, wallets,
organizations, and histories.

V47 does not make mainnet value-bearing claims. In V47, "testnet" means one
thing: BTC amounts and settlement observations are testnet only, making the
commercial transaction economically free while the rest of the system behaves
as production-intended. Source-safe AssetPack synthesis, Depository admission,
Finding Fits, preview, quote, BTD rights, delivery, proof readback,
ledger/database/storage synchronization, and repair states must be real enough
for commercial demonstration.

Measurement is the key commercial primitive. V47 requires a clear measurement
catalog, prompt ownership, typed measurement output, weights, weighted scalar
BTD formula, and seller/buyer visualization so IP sellers can decide what to
deposit and IP buyers can decide what to buy without source leakage.

## Canonical Bitcode executive summary

Bitcode commoditizes knowledge by packaging source, documents, data, workflows,
and other technical materials as AssetPacks. Depositors supply AssetPacks into
the Depository. Readers ask Bitcode to understand a Read Request, synthesize a
Need, find fitting Depository AssetPacks, synthesize a Need-Fit AssetPack,
preview source-safe measurements, settle in BTC, receive BTD rights, and receive
entitled repository delivery.

BTD is the weighted scalar knowledge-volume measured from source bits, bytes,
content, documents, code, and other knowledge-bearing material. BTD can be
estimated for deposit-side AssetPack options, but final BTD size is
Need-relative: it is computed from measurements against a reviewed Need and
bound to settlement, rights, delivery, and source-to-shares compensation.

V47 makes the website experience commercially demonstrable on staging-testnet
by proving both sides of the exchange: IP sellers can deposit AssetPacks, and IP
buyers can buy Need-fitting AssetPacks.

## V47 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V47`; V47 is the active promoted Bitcode canon.
`BITCODE_SPEC_V47.md`, `BITCODE_SPEC_V47_DELTA.md`,
`BITCODE_SPEC_V47_NOTES.md`, and `BITCODE_SPEC_V47_PARITY_MATRIX.md` are the
promoted V47 specification-family material. The V47 formal specification family
is active canon and authorizes implementation behavior only through the
source-safe, measurement-before-price, proof-backed launch boundaries it
states.

Implementation remains unversioned in source paths. Routes, packages,
components, tests, prompts, telemetry, schemas, APIs, and workflows continue to
move in place as the single current Bitcode system after V47 gates authorize
their changes.

## V47 full-system, re-implementation, and audit rule

V47 must be reconstructable from this draft family, source code, generated
artifacts, proof roots, workflow receipts, ledger journals, database
projections, object-storage roots, wallet/provider receipts, repository
delivery receipts, and source-safe telemetry.

No V47 surface may disclose protected source, unpaid AssetPack source, raw
prompts, raw model/provider responses, credentials, wallet private material,
private settlement payloads, private repository access, or source-bearing
delivery contents before entitlement.

## V47 totality and precision enforcement rule

V47 must preserve V46 protocol comprehension while becoming operationally
complete for the website launch. AssetPack is the commodity. BTD is weighted
scalar knowledge-volume and, after settlement, a rights-bearing receipt. BTC is
settlement money, testnet-only in V47 deployment. Source-to-shares is
post-finality contributor allocation. Measurement is the basis for price.
Preview is not source disclosure. Quote is not payment. Payment observation is
not finality. Database projection is not ledger truth when stronger evidence
conflicts.

Every user-visible state must name whether it is estimate, potential, preview,
quote, observed testnet payment, final settlement, rights transfer, delivery,
contributor allocation, compensation, or repair.

## V47 system goals, non-goals, and design principles

Goals:

- Launch-freeze the first generally available website MVP scope.
- Make `/deposit`, `/read`, `/packs`, and Auxillaries commercially coherent on
  staging-testnet.
- Specify seller and buyer user flows with exact state machines.
- Specify measurement law: catalog, prompts, typed outputs, weights, BTD scalar
  formula, proof roots, and source-safe visualizations.
- Audit feature excess and defer or flag anything that distracts from launch.
- Treat `/deposit`, `/read`, and `/packs` as the website launch entrypoints;
  route `/exchange` compatibility into `/packs`; keep `/terminal`,
  `/conversations`, API/MCP, ChatGPT App, Bitcode Chat, value-bearing mainnet,
  and advanced market mechanics out of the launch path unless a later gate
  explicitly reopens them.
- Prove E2E IP selling and IP buying through browser-level commercial tests.
- Refurbish the landing page and public launch messaging for V47 testnet
  readiness.

Non-goals:

- V47 does not launch value-bearing mainnet BTC settlement.
- V47 does not commercialize Bitcode Chat, ChatGPT App, or MCP/API beyond
  source-safe compatibility and future-readiness boundaries.
- V47 does not finish deeper BTD mining cryptography beyond the website launch
  contract.
- V47 does not expose unpaid source or source-bearing prompts.
- V47 does not add advanced market mechanics beyond MVP selling and buying.

Design principles: measurement before price, price before settlement,
settlement before source unlock, source safety before convenience, website
clarity before advanced interfaces, proof-backed readback before projection,
and testnet value semantics without weakening production-like system behavior.

## V47 system architecture and layer boundaries

V47 acts through the website application:

- Auxillaries owns user identity, organizations, teams, wallets, source
  connections, target repository connections, and histories.
- `/deposit` owns IP-seller source connection, deposit AssetPack option
  synthesis, source-safe option review, Depository admission, and compensation
  expectation readback.
- `/read` owns IP-buyer Read Request, ReadNeedComprehensionSynthesis,
  Need review/resynthesis, ReadFitsFindingSynthesis, source-safe preview,
  quote, BTC-testnet settlement, BTD rights transfer, and repository delivery.
- `/packs` owns searchable master-detail PackActivity across deposits, reads,
  previews, quotes, settlements, rights, delivery, compensation, repairs, proof
  roots, and histories.
- API/MCP, ChatGPT App, and Bitcode Chat remain deferred commercial surfaces in
  V47, though their source-safe contracts must not regress.

## V47 canonical domain model

Canonical V47 launch objects:

- IP seller, IP buyer, organization, team, wallet, BTC-testnet account,
  source connection, target repository connection, deposit source bundle,
  deposit AssetPack option, Depository AssetPack, Read Request, synthesized
  Need, accepted Need, Fit candidate set, selected Fit set, Need-Fit AssetPack,
  source-safe preview, measurement vector, measurement weight policy,
  weighted BTD scalar, BTC-testnet quote, settlement receipt, BTD rights
  receipt, repository delivery receipt, source-to-shares allocation,
  compensation statement, PackActivity row, proof root, repair case, and
  commercial rehearsal receipt.

Canonical V47 states:

- Seller states: `seller-connected`, `source-connected`,
  `deposit-options-synthesizing`, `deposit-option-synthesized`,
  `deposit-option-reviewed`, `deposit-option-approved`,
  `depository-admission-submitted`, `depository-assetpack-admitted`,
  `compensation-eligible`, `seller-repair-required`.
- Buyer states: `buyer-connected`, `target-repository-connected`,
  `read-requested`, `read-need-synthesizing`, `read-need-reviewing`,
  `read-need-accepted`, `finding-fits-running`, `fits-found`,
  `need-fit-assetpack-synthesized`, `source-safe-preview-reviewing`,
  `btc-testnet-quote-issued`, `btc-testnet-settlement-observed`,
  `btd-rights-transferred`, `repository-delivery-created`,
  `buyer-repair-required`.
- Pack states: `pack-activity-created`, `measurement-visualized`,
  `proof-root-bound`, `ledger-projected`, `database-synchronized`,
  `storage-root-bound`, `repair-opened`, `repair-closed`.

## V47 measurement law

Measurement is the singular key to valuable IP commoditization and exchange.
Every V47 sale or deposit decision must be grounded in source-safe measurement
readback.

Measurement catalog:

- Coverage measurement: how much of the Need or deposit option is addressed.
- Specificity measurement: how precise the AssetPack is relative to a Need or
  supply opportunity.
- Novelty measurement: how much non-public or hard-to-recreate knowledge the
  AssetPack contains without exposing source.
- Reuse measurement: how likely the AssetPack is to help future Reads.
- Risk measurement: source criticality, leakage risk, rights risk, and repair
  risk.
- Evidence measurement: proof-root, test, benchmark, repository, telemetry, and
  provenance support.
- Fit measurement: Need-relative alignment across candidate Fits.
- Delivery measurement: confidence that the synthesized AssetPack can be
  delivered as a repository PR or equivalent entitled delivery.

Measurement prompt rule:

- Each measurement must be commanded by a named Prompt or PromptPart composition
  through the existing prompt registry.
- Each inference-owned measurement must record its input context class, source
  boundary, prompt template identity, interpolated prompt hash or source-safe
  digest, typed output schema, parsed result, proof root, telemetry receipt,
  and repair posture.
- Raw protected prompts, raw provider responses, protected source, and unpaid
  AssetPack source remain private. Source-safe prompt identity, prompt digest,
  typed measurement result, and proof root are disclosable.

Weighted scalar BTD formula:

- Each measurement emits `measurementVolume`, `confidence`, `riskAdjustment`,
  and `weight`.
- Normalized contribution is
  `measurementVolume * confidence * riskAdjustment * weight`.
- Deposit-side BTD is an estimated or potential BTD range because no reviewed
  buyer Need is bound yet.
- Read-side BTD is the final Need-relative weighted scalar knowledge-volume
  after measurement policy lock, Need acceptance, Fit selection, and quote
  binding.
- The sum of normalized contributions becomes the BTD scalar used for quote,
  rights, delivery, and source-to-shares accounting.

Seller visualization:

- Depositors must see source-safe measurements for criticality, likely demand,
  reuse value, evidence, estimated BTD range, ROI posture, compensation
  expectation, source-safety blockers, and repair requirements before approving
  deposit.

Buyer visualization:

- Readers must see source-safe measurements for Need coverage, Fit confidence,
  selected Fit provenance, novelty, risk, delivery readiness, quote basis,
  final BTD scalar, and repair blockers before paying BTC-testnet settlement.

Measurement theorem:

No measurement, no price. No price, no settlement. No settlement, no market.

## V47 whole Bitcode operator chain

1. Seller connects identity, wallet, organization, and source.
2. Bitcode synthesizes source-safe deposit AssetPack options.
3. Seller reviews measurements and approves an option for Depository admission.
4. Depository indexes admitted AssetPack metadata, measurements, embeddings,
   proof roots, and compensation posture.
5. Buyer connects identity, wallet, organization, and target repository.
6. Buyer requests a Read.
7. Bitcode synthesizes a Need and the buyer accepts or resynthesizes it.
8. Bitcode runs Finding Fits against the Depository.
9. Bitcode synthesizes a Need-Fit AssetPack and source-safe preview.
10. Buyer reviews measurements, quote, and proof posture.
11. Buyer settles with BTC-testnet.
12. Bitcode transfers BTD rights, unlocks entitled delivery, creates the
    repository PR, journals compensation, and synchronizes `/packs`.
13. Operators repair only through proof-backed state transitions.

## V47 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: deposit source bundle,
  deposit AssetPack option, Depository AssetPack, measurement vector, estimated
  BTD range, admission receipt, compensation expectation, PackActivity row.
- Current algorithms and derivation rules: synthesize options from connected
  source, measure source-safe value, classify criticality, estimate demand,
  admit approved options, index Depository metadata.
- Current invariants and fail-closed conditions: no source exposure before
  entitlement, no critical IP admission without explicit approval, no
  compensation claim without settlement evidence.
- Current proof obligations: source connection receipt, option synthesis
  receipt, measurement receipt, approval receipt, admission receipt, index root.
- Current source-bearing implementation basis: source remains protected behind
  source-safe option review and storage boundaries.
- Current validating commands and parity basis: V47 Gate 4 and Gate 7 tests
  must prove seller flow and deposit-to-read continuity.
- Current accepted boundaries: deposit estimates are not final BTD until a
  Need-relative read binds them.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: Read Request, synthesized
  Need, accepted Need, Prompt/PromptPart measurement commands, typed inference
  results, ReadFitsFindingSynthesis receipt, Need-Fit AssetPack.
- Current algorithms and derivation rules: synthesize Need, review/resynthesize
  Need, find Fits, measure Need-relative value, synthesize preview and delivery.
- Current invariants and fail-closed conditions: no Finding Fits without
  accepted Need, no paid delivery before settlement, no raw prompt/provider
  response disclosure.
- Current proof obligations: prompt identity, source-safe prompt digest, typed
  output, parsed result, telemetry receipt, proof root, repair posture.
- Current source-bearing implementation basis: protected source may inform
  inference only through entitlement-safe execution boundaries.
- Current validating commands and parity basis: V47 Gate 5 and Gate 7 tests
  must prove buyer flow and measurement visualization.
- Current accepted boundaries: inference output is advisory until parsed,
  typed, proof-bound, and state-admitted.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: candidate Fits, selected Fit
  set, recall receipts, ranking receipts, verification receipts, source-safe
  provenance summaries.
- Current algorithms and derivation rules: search Depository metadata,
  embeddings, measurements, lexical indexes, and proof roots; rank above
  threshold; verify candidate usefulness before AssetPack synthesis.
- Current invariants and fail-closed conditions: no candidate source disclosure
  before settlement, no survivor-free AssetPack, no ranking without proofable
  measurement basis.
- Current proof obligations: query synthesis receipt, search receipt, ranking
  receipt, selected Fit receipt, verification receipt.
- Current source-bearing implementation basis: source remains protected while
  measurement metadata and provenance summaries remain source-safe.
- Current validating commands and parity basis: V47 Gate 5 and Gate 7 tests
  must prove Fit search drives buyer preview and delivery.
- Current accepted boundaries: many Fits may contribute to one Need-Fit
  AssetPack and compensation follows source-to-shares after settlement.

### Selection and materialization

- Current canonical objects and emitted artifacts: Need-Fit AssetPack,
  withheld source bundle, preview, delivery branch, repository PR, delivery
  receipt.
- Current algorithms and derivation rules: synthesize source-safe preview
  before settlement, materialize source-bearing delivery only after settlement
  and rights transfer.
- Current invariants and fail-closed conditions: preview is not source; quote
  is not delivery; delivery requires settlement and rights transfer.
- Current proof obligations: preview boundary receipt, quote receipt,
  settlement receipt, BTD rights receipt, delivery receipt.
- Current source-bearing implementation basis: source-bearing output is
  withheld until entitlement.
- Current validating commands and parity basis: V47 Gate 5 and Gate 7 tests
  must prove repository delivery after settlement.
- Current accepted boundaries: failed delivery opens repair, not silent success.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: user identity, organization,
  team, wallet, role, policy, source connection, target repository connection,
  spend/deposit authority receipt.
- Current algorithms and derivation rules: bind actions to identity, wallet,
  org authority, connection authority, and policy.
- Current invariants and fail-closed conditions: no deposit, read, settlement,
  rights transfer, or delivery without authority.
- Current proof obligations: auth receipt, wallet receipt, provider receipt,
  policy receipt, denial receipt.
- Current source-bearing implementation basis: credentials and wallet private
  material remain secret.
- Current validating commands and parity basis: V47 Gate 6 and Gate 7 tests
  must prove Auxillaries and route authority.
- Current accepted boundaries: testnet BTC does not weaken identity or rights
  boundaries.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe preview,
  measurement visualization, proof-root projection, PackActivity projection,
  denied-state projection, repair projection.
- Current algorithms and derivation rules: expose only source-safe
  measurements, summaries, states, proof roots, and repair guidance before
  entitlement.
- Current invariants and fail-closed conditions: public projection
  overexposure blocks state advancement.
- Current proof obligations: disclosure policy receipt, projection receipt,
  no-source/no-secret scan, repair receipt.
- Current source-bearing implementation basis: raw source and raw protected
  prompts remain outside public projection.
- Current validating commands and parity basis: V47 Gate 6, Gate 7, and Gate 8
  tests must prove disclosure boundaries.
- Current accepted boundaries: source-safe value explanation is allowed; source
  transfer is not.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC-testnet quote, payment
  observation, finality receipt, BTD scalar, BTD rights receipt,
  source-to-shares allocation, compensation statement.
- Current algorithms and derivation rules: compute quote from weighted BTD
  scalar, observe BTC-testnet payment, finalize settlement, transfer rights,
  allocate source-to-shares.
- Current invariants and fail-closed conditions: observed payment is not
  finality, finality is required before source unlock, compensation requires
  conservation.
- Current proof obligations: quote receipt, wallet/provider receipt, ledger
  journal, rights receipt, compensation receipt, reconciliation receipt.
- Current source-bearing implementation basis: settlement payloads remain
  private except source-safe receipts.
- Current validating commands and parity basis: V47 Gate 5, Gate 6, and Gate 7
  tests must prove accounting and repair.
- Current accepted boundaries: V47 BTC amounts are testnet; state semantics are
  production-intended.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof root, generated
  artifact, witness, replay receipt, workflow receipt, repair case.
- Current algorithms and derivation rules: every state transition must bind to
  a proofable receipt or fail closed.
- Current invariants and fail-closed conditions: proof mismatch opens repair;
  stale promoted status truth is failure.
- Current proof obligations: generated artifact, replay proof, workflow proof,
  diff hygiene, test receipt.
- Current source-bearing implementation basis: proofs must be source-safe unless
  entitlement authorizes source-bearing delivery.
- Current validating commands and parity basis: V47 Gate 7, Gate 9, and Gate 10
  must prove replay and promotion readiness.
- Current accepted boundaries: proof readback decides; UI projection explains.

## V47 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v47-spec-family-report.json` | `measurement-prompt`, `need-synthesis`, `fit-synthesis` | `typed-measurement-output` | `v47-inference-readback` | `BITCODE_SPEC_V47_PROVEN.md` | V46 inference and V47 measurement law |
| Prompt-completeness | `.bitcode/v47-spec-family-report.json` | `measurement-prompts`, `visualization-prompts` | `prompt-identity-bound` | `v47-prompt-readback` | `BITCODE_SPEC_V47_PROVEN.md` | Prompt registry and V41/V46 canon |
| Static-code-analysis | `.bitcode/v47-canonical-input-report.json` | `route-static-contracts`, `workflow-hooks` | `source-safety-static` | `v47-static-readback` | `BITCODE_SPEC_V47_PROVEN.md` | Current website source and workflows |
| Verification-decisions | `.bitcode/v47-spec-family-report.json` | `seller-decision`, `buyer-decision` | `measurement-before-price` | `v47-decision-readback` | `BITCODE_SPEC_V47_PROVEN.md` | V47 state machine law |
| Selection-and-materialization | `.bitcode/v47-spec-family-report.json` | `fit-selection`, `delivery-materialization` | `settlement-before-source` | `v47-materialization-readback` | `BITCODE_SPEC_V47_PROVEN.md` | Reading and delivery packages |
| Authorization-and-sensitive-flow | `.bitcode/v47-canonical-input-report.json` | `identity`, `wallet`, `source-connection` | `authority-required` | `v47-authority-readback` | `BITCODE_SPEC_V47_PROVEN.md` | Auxillaries and route authority |
| Settlement-source-to-shares | `.bitcode/v47-spec-family-report.json` | `quote`, `settlement`, `compensation` | `btctestnet-conservation` | `v47-settlement-readback` | `BITCODE_SPEC_V47_PROVEN.md` | BTD/BTC accounting canon |
| Disclosure-boundary | `.bitcode/v47-canonical-input-report.json` | `preview`, `measurement-visualization` | `no-unpaid-source` | `v47-disclosure-readback` | `BITCODE_SPEC_V47_PROVEN.md` | V45/V46 source-safety canon |
| Proof-contract | `.bitcode/v47-spec-family-report.json` | `proof-root`, `replay`, `repair` | `proof-readback-decides` | `v47-proof-readback` | `BITCODE_SPEC_V47_PROVEN.md` | Generated proof and workflow canon |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: measurement prompts, Need synthesis, deposit option synthesis, Finding Fits, AssetPack synthesis
- theoremIds: typed-measurement-output, inference-source-safety, measurement-before-price
- replayStepIds: v47-inference-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: every inference-owned measurement must have prompt identity, typed output, proof root, and repair posture
- current member verdict shape: source-safe typed receipt
- current theorem-by-theorem closure reading: inference may guide state only after typed parsing and proof binding
- current theorem-to-replay grouping: prompt identity, typed output, and measurement visualization replay together
- minimum artifact/replay binding set: prompt registry id, digest, typed output schema, telemetry receipt
- current proof-object fields: promptId, promptDigest, outputType, measurementId, proofRoot
- generated-artifact and test bindings: V47 Gate 1 checker and later Gate 7 E2E tests
- fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility

### Prompt-completeness

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: measurement PromptParts, seller visualization prompts, buyer visualization prompts
- theoremIds: prompt-identity-bound, prompt-output-typed
- replayStepIds: v47-prompt-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: every measurement prompt must be catalogued and source-safe
- current member verdict shape: prompt contract receipt
- current theorem-by-theorem closure reading: prompt composition must identify source boundaries and output schema
- current theorem-to-replay grouping: prompt registry and measurement output replay together
- minimum artifact/replay binding set: PromptPart ids, Prompt id, interpolation keys, schema id
- current proof-object fields: promptPartIds, promptId, interpolationDigest, outputSchema
- generated-artifact and test bindings: V47 measurement-law parity and prompt tests
- fail-closed conditions: missing prompt part, raw prompt leakage, schema mismatch

### Static-code-analysis

- proofArtifactPath: `.bitcode/v47-canonical-input-report.json`
- members: route contracts, workflow hooks, no-source scans
- theoremIds: source-safety-static, route-state-static
- replayStepIds: v47-static-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: code and workflow changes must align to V47 launch scope
- current member verdict shape: static pass/fail receipt
- current theorem-by-theorem closure reading: static source must not expose protected payloads or stale route names
- current theorem-to-replay grouping: source scan and spec-family scan replay together
- minimum artifact/replay binding set: source paths, route ids, forbidden phrase scan
- current proof-object fields: sourcePath, predicateId, verdict, proofRoot
- generated-artifact and test bindings: gate/canon workflows and check-v47-gate1
- fail-closed conditions: source exposure, stale route, missing workflow hook

### Verification-decisions

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: seller approval, buyer payment, operator repair
- theoremIds: measurement-before-price, proof-before-state
- replayStepIds: v47-decision-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: decisions must show source-safe measurement and authority
- current member verdict shape: decision receipt
- current theorem-by-theorem closure reading: no decision is valid without measurement and proof
- current theorem-to-replay grouping: measurement, decision, and state transition replay together
- minimum artifact/replay binding set: actor, authority, measurement root, state transition
- current proof-object fields: actorId, authorityId, measurementRoot, transitionId
- generated-artifact and test bindings: V47 E2E seller/buyer tests
- fail-closed conditions: authorization denial, missing measurement, projection mismatch

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: Fit selection, AssetPack preview, repository delivery
- theoremIds: settlement-before-source, selected-fit-proof
- replayStepIds: v47-materialization-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: selected Fits and delivery must have proof roots
- current member verdict shape: materialization receipt
- current theorem-by-theorem closure reading: delivery follows settlement and rights transfer
- current theorem-to-replay grouping: Fit selection, quote, settlement, and delivery replay together
- minimum artifact/replay binding set: fitSetId, assetPackId, quoteId, deliveryId
- current proof-object fields: fitSetId, previewRoot, settlementRoot, deliveryRoot
- generated-artifact and test bindings: V47 Gate 5 and Gate 7
- fail-closed conditions: no-survivor asset pack, settlement mismatch, delivery failure

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v47-canonical-input-report.json`
- members: identity, organization, wallet, source connection, repository connection
- theoremIds: authority-required, secrets-never-projected
- replayStepIds: v47-authority-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: every sensitive action must bind to authority and no-secret projection
- current member verdict shape: authority receipt
- current theorem-by-theorem closure reading: testnet does not weaken authority
- current theorem-to-replay grouping: identity, wallet, connection, and route action replay together
- minimum artifact/replay binding set: identityId, orgId, walletId, providerId, routeActionId
- current proof-object fields: subjectId, policyId, walletReceipt, providerReceipt
- generated-artifact and test bindings: V47 Gate 6 and Gate 7
- fail-closed conditions: authorization denial, secret leakage, missing wallet

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: quote, BTC-testnet observation, finality, BTD rights, compensation
- theoremIds: btctestnet-conservation, source-to-shares-conservation
- replayStepIds: v47-settlement-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: quote, settlement, rights, and compensation must conserve measured BTD and source-to-shares
- current member verdict shape: accounting receipt
- current theorem-by-theorem closure reading: BTC-testnet is free economically but not loose semantically
- current theorem-to-replay grouping: quote, payment, finality, rights, compensation replay together
- minimum artifact/replay binding set: quoteId, paymentId, btdScalar, rightsId, allocationId
- current proof-object fields: quoteAmount, testnetTxid, btdScalar, allocationRoot
- generated-artifact and test bindings: V47 Gate 5, Gate 6, Gate 7
- fail-closed conditions: settlement conservation drift, payment mismatch, compensation mismatch

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v47-canonical-input-report.json`
- members: preview, measurement visualization, proof projection
- theoremIds: no-unpaid-source, measurement-visible-source-hidden
- replayStepIds: v47-disclosure-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: every pre-settlement display must expose value without exposing source
- current member verdict shape: disclosure receipt
- current theorem-by-theorem closure reading: measurements can reveal value, confidence, risk, and fit but not protected source
- current theorem-to-replay grouping: projection policy and UI state replay together
- minimum artifact/replay binding set: projectionId, measurementIds, no-source scan
- current proof-object fields: projectionId, allowedFields, deniedFields, scanRoot
- generated-artifact and test bindings: V47 Gate 6, Gate 7, Gate 8
- fail-closed conditions: public projection overexposure, raw prompt leakage, unpaid source leakage

### Proof-contract

- proofArtifactPath: `.bitcode/v47-spec-family-report.json`
- members: proof root, workflow receipt, replay receipt, repair receipt
- theoremIds: proof-readback-decides, stale-truth-fails
- replayStepIds: v47-proof-readback
- witnessArtifactPaths: `BITCODE_SPEC_V47_PROVEN.md`
- current member closure criteria: every state transition must be proof-readable
- current member verdict shape: proof receipt
- current theorem-by-theorem closure reading: projection explains, proof decides
- current theorem-to-replay grouping: generated artifact, workflow, and repair replay together
- minimum artifact/replay binding set: artifactRoot, workflowRun, stateTransition, repairId
- current proof-object fields: artifactRoot, workflowId, transitionId, repairState
- generated-artifact and test bindings: V47 Gate 10 promotion readiness
- fail-closed conditions: stale promoted status truth, missing proof root, generated artifact drift

## V47 generated canon

### Appendix C. Generated artifact contract catalog

#### Inherited V19 reproducible-canon artifacts

`.bitcode/v19-contract-change-ledger.json`,
`.bitcode/v19-negative-proof-mutation-matrix.json`,
`.bitcode/v19-proof-member-semantic-matrix.json`,
`.bitcode/v19-theorem-evidence-matrix.json`,
`.bitcode/v19-state-machine-matrix.json`,
`.bitcode/v19-deterministic-replay-report.json`, and
`.bitcode/v19-volatility-inventory.json` remain historical reproducibility
inputs.

#### Inherited V20 operator-quality artifacts

`.bitcode/v20-operator-acceptance-transcript.json`,
`.bitcode/v20-visual-regression-report.json`,
`.bitcode/v20-accessibility-report.json`,
`.bitcode/v20-performance-budget-report.json`,
`.bitcode/v20-projection-quality-smoke-matrix.json`,
`.bitcode/v20-quality-summary.json`, and `ENGI_SPEC_V20_PROVEN.md` remain
historical operator-quality inputs.

#### Exact generated-artifact inventory matrix

| artifactPath | role | disclosability |
| --- | --- | --- |
| `.bitcode/v47-spec-family-report.json` | V47 spec-family validation report | source-safe |
| `.bitcode/v47-canonical-input-report.json` | V47 canonical-input validation report | source-safe |
| `BITCODE_SPEC_V47_PROVEN.md` | V47 generated proof appendix after promotion readiness | source-safe |

#### V47 specifying generated artifacts

V47 Gate 1 reserves `.bitcode/v47-spec-family-report.json` and
`.bitcode/v47-canonical-input-report.json`. Later gates may add launch,
measurement, route, and E2E rehearsal artifacts.

#### Shared generated-artifact fields

All V47 generated artifacts must carry artifact id, version, generatedAt or
deterministic marker, source roots, proof root, source-safety verdict,
predicate results, aggregate proof verdict, and repair posture.

#### Artifact-specific generated payload fields

Measurement artifacts must include measurement ids, weights, normalized
contributions, prompt identities, typed output schemas, visualization fields,
and source-safety denials.

#### Artifact confidentiality and disclosability taxonomy

V47 artifacts classify fields as public, operator, buyer, reviewer, internal,
source-bearing, secret, or denied.

#### Minimum generated appendix rendered contents

The generated appendix must render aggregate proof verdict, exact proof-family
inventory, exact per-family member inventory, exact per-family theorem
inventory, exact replay-step inventories and theorem bindings, witness artifact
inventories, generated artifact inventories, scenario and run coverage matrices,
proof-source commit, and fail closed when conditions.

#### Canonical regeneration and fail-closed posture

Regeneration must fail closed when source roots drift, proof roots mismatch,
generated artifact inventories are incomplete, scenario and run coverage
matrices are stale, proof-source commit is missing, or source-safety scans fail.

## V47 validation canon

V47 Gate 1 validation requires:

- `node scripts/check-bitcode-spec-family.mjs --version V46 --mode promoted --current-target V46`
- `node scripts/check-bitcode-spec-family.mjs --version V47 --mode draft --current-target V46`
- `node scripts/check-bitcode-canonical-inputs.mjs --current-target V46`
- `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V46 --draft-target V47`
- `node scripts/check-v47-gate1-scope-measurement-launch-freeze.mjs --skip-branch-check`

Later gates must add focused tests, browser E2E, proof generation, staging
rehearsal, and promotion readiness checks.

## V47 promotion canon

V47 may promote only after all gates close, all generated artifacts are fresh,
all commercial website launch tests are green, staging-testnet rehearsal proves
seller and buyer E2E flows, and the maintained promotion workflow advances
`BITCODE_SPEC.txt` to `V47`.

V47 promotion readiness canon: Gate 10 owns
`.bitcode/v47-promotion-readiness-report.json`, the
`buildV47PromotionReadinessReport` package object, and `check:v47-gate10`
(with `--promotion-mode` accepting V46 pre-promotion or V47 post-promotion
pointer truth). The readiness report binds every accepted V47 launch artifact
(Gates 2 through 9), the generated `BITCODE_SPEC_V47_PROVEN.md` support, the
V47 entries in `promote-bitcode-canon.mjs`,
`prepare-bitcode-spec-family-promotion.mjs`, and the runtime promotion
preparation, `v47-canon-promotion.yml`, gate/canon workflow posture for both
pre- and post-promotion pointers, package exports, focused tests, README
documentation, and the prepared post-promotion `V47 active / draft V48`
posture. Promotion remains blocked while any evidence is missing, stale,
source-unsafe, or while value-bearing mainnet admission is implied.

## V47 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

Canonical surfaces are `/deposit`, `/read`, `/packs`, Auxillaries, Depository
indexes, proof roots, workflow receipts, ledger journals, database projections,
object-storage roots, wallet/provider receipts, and repository delivery
receipts. API/MCP, ChatGPT App, and Bitcode Chat remain compatibility surfaces
for V47, not commercial launch scope.

### Appendix B. Proof family closure catalog

The nine proof families above close through measurement, state-machine,
disclosure, settlement, delivery, repair, and promotion evidence.

### Appendix D. Validation and checking gate catalog

V47 gates:

1. Scope, Testnet Semantics, Measurement Law, And Launch Freeze.
2. Feature Excess And Gate Alignment Audit. Gate 2 owns
   `.bitcode/v47-feature-excess-alignment-audit.json`, the
   `buildV47FeatureExcessAlignmentAudit` package object, and
   `check:v47-gate2`.
3. Seller And Buyer State Machine Law. Gate 3 owns
   `.bitcode/v47-seller-buyer-state-machine-law.json`, the
   `buildV47SellerBuyerStateMachineLaw` package object, and
   `check:v47-gate3`.
4. Depositor Website Completion. Gate 4 owns
   `.bitcode/v47-depositor-website-completion.json`, the
   `buildV47DepositorWebsiteCompletion` package object, and
   `check:v47-gate4`.
5. Reader Website Completion. Gate 5 owns
   `.bitcode/v47-reader-website-completion.json`, the
   `buildV47ReaderWebsiteCompletion` package object, and
   `check:v47-gate5`.
6. Packs And Auxillaries Commercial Dashboard. Gate 6 owns
   `.bitcode/v47-packs-auxillaries-commercial-dashboard.json`, the
   `buildV47PacksAuxillariesCommercialDashboard` package object, and
   `check:v47-gate6`.
7. E2E IP Selling And Buying Tests. Gate 7 owns
   `.bitcode/v47-e2e-ip-selling-buying-tests.json`, the
   `buildV47E2eIpSellingBuyingTests` package object, and
   `check:v47-gate7`.
8. Landing Page And Public Launch Messaging. Gate 8 owns
   `.bitcode/v47-landing-public-launch-messaging.json`, the
   `buildV47LandingPublicLaunchMessaging` package object, and
   `check:v47-gate8`.
9. Staging-Testnet Deployment Rehearsal. Gate 9 owns
   `.bitcode/v47-staging-testnet-deployment-rehearsal.json`, the
   `buildV47StagingTestnetDeploymentRehearsal` package object, and
   `check:v47-gate9`.
10. Promotion Readiness. Gate 10 owns
    `.bitcode/v47-promotion-readiness-report.json`, the
    `buildV47PromotionReadinessReport` package object, and
    `check:v47-gate10`.

### Appendix E. Current canonical source map

Current source map roots include `uapi`, `packages/btd`,
`packages/pipeline-asset-pack`, `packages/pipeline-hosts`,
`packages/protocol`, `packages/prompts`, `packages/executions-mcp`,
`packages/chatgptapp`, `protocol-demonstration`, `.github/workflows`, and
`.bitcode` generated artifacts.

V47 Gate 2 source-safe generated artifact:
`.bitcode/v47-feature-excess-alignment-audit.json`. It records launch routes,
supporting surfaces, deferred surfaces, feature policies, forbidden launch
entry targets, source-safe payload boundaries, source-root digests, and
predicate results without serializing source, prompt payloads, wallet private
material, settlement private payloads, or mainnet value-bearing authority.

V47 Gate 3 source-safe generated artifact:
`.bitcode/v47-seller-buyer-state-machine-law.json`. It records IP seller
states, IP buyer states, transition guards, measurement ids, source-safe field
ids, forbidden payload classes, source-root digests, and predicate results.
The law requires measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, BTC finality before BTD rights,
BTD rights before source delivery, `/packs` history projection after each
transition, and fail-closed repair on missing evidence.

V47 Gate 4 source-safe generated artifact:
`.bitcode/v47-depositor-website-completion.json`. It records the five-step
`/deposit` route session steps, journaled pipeline and event ids, visible
seller decision ids (measurement catalog, criticality, demand, ROI, BTD
potential, BTC source-to-shares preview, admission, `/packs` activity sync,
and authority states), completion rows for source connection, option-synthesis
journaling, source-safe measurement review, admission and repair actions,
compensation/authority readback, and `/packs` history readback, forbidden
payload classes, source-root digests, and predicate results without
serializing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or settlement private payloads.

V47 Gate 5 source-safe generated artifact:
`.bitcode/v47-reader-website-completion.json`. It records the five-step
`/read` route session steps, owned pipeline ids, source-safe readback ids
(fit measurement review, quote basis, payment observation, settlement
finality, BTD rights receipt, delivery receipt), visible buyer decision ids
(Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence,
delivery readiness, selected Fit provenance, final BTD scalar, quote basis,
settlement/finality/rights/delivery states, `/packs` activity sync, and
authority states), completion rows for Read request initiation, Need review
acceptance, fit measurement review, quote-before-settlement,
settlement/finality/rights/delivery ordering, and `/packs` history readback,
forbidden payload classes, source-root digests, and predicate results without
serializing protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or settlement private payloads.

V47 Gate 6 source-safe generated artifact:
`.bitcode/v47-packs-auxillaries-commercial-dashboard.json`. It records the
`/packs` master-detail dashboard contract (searchable activity table,
type/state facets, saved market-intelligence filters, and a row-owned detail
surface covering overview, measurements, state readback, repair surface,
accounting, governance, and proof roots), the tracked settlement, BTD rights,
compensation, delivery, and repair states with rights derived only from
finality-consistent commodity-state evidence, the fail-closed repair surface
listing commodity-state blockers, the Auxillaries pane coverage (identity
profile, external source connections, interfaces, wallet authority with BTD
history readback, organization team and treasury settings), forbidden payload
classes, source-root digests, and predicate results without serializing
protected source, unpaid AssetPack source, raw prompts, raw provider
responses, wallet private material, or settlement private payloads.

V47 Gate 7 source-safe generated artifact:
`.bitcode/v47-e2e-ip-selling-buying-tests.json`. It records the browser-proof
scenarios (IP seller deposits an AssetPack on `/deposit`; IP buyer reviews
fit measurements, quote basis, settlement finality, BTD rights, and
repository delivery on `/read`; `/packs` reads back settlement, rights,
compensation, delivery, and the fail-closed repair surface), the
deterministic mock-mode harness bindings (stateful execution-history
journaling, VCS/auxillary mocks, browser error trap), the verification ids
covering source-connection-before-synthesis through
fail-closed-repair-surface, forbidden payload classes, source-root digests,
and predicate results without serializing protected source, unpaid AssetPack
source, raw prompts, raw provider responses, wallet private material, or
settlement private payloads. The browser proof runs on BTC-testnet semantics
only.

V47 Gate 8 source-safe generated artifact:
`.bitcode/v47-landing-public-launch-messaging.json`. It records the public
launch narrative law: the landing testnet section stating the meaning of
commercial testnet (BTC amounts are testnet and free; measurements, quotes,
settlement ordering, BTD rights, and repository delivery stay
production-intended), the deposit → read → packs core-flow messaging with
launch-route links, the proof-backed trust and source-safe IP exchange
positioning, the public docs testnet-meaning card with the blocked
value-bearing mainnet posture, the preserved promoted V46 claim-boundary
tokens, surface ids, message ids, forbidden payload classes, source-root
digests, and predicate results without serializing protected source, unpaid
AssetPack source, raw prompts, raw provider responses, wallet private
material, or settlement private payloads.

V47 Gate 9 source-safe generated artifact:
`.bitcode/v47-staging-testnet-deployment-rehearsal.json`. It records the
staging-testnet rehearsal law: dry-run lane receipts for the full-stack
deployment (Vercel website host, Supabase database/ledger projections,
object-storage roots, long-runner pipeline host, BTC-testnet settlement
provider), the realistic-data contract minimums (24 deposit AssetPack
options, 12 admitted Depository AssetPacks, 18 Read requests and accepted
Needs, 12 source-safe previews and BTC-testnet quotes, 9 settlement
observations, finality confirmations, and BTD rights transfers, 6 repository
PR deliveries and compensation statements, 3 repair cases), the settlement
observation ordering law (observation → finality → rights → delivery), the
blocked value-bearing mainnet lane, the deployment truth source digests
(vercel.json, supabase config and migrations, long-runner Dockerfiles and
Kubernetes manifest), the rehearsal validation command catalog, forbidden
payload classes, and predicate results. Lane receipts are dry-run with live
execution operator opt-in; no live service credentials are serialized.

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

The V47 file family is `BITCODE_SPEC_V47.md`,
`BITCODE_SPEC_V47_DELTA.md`, `BITCODE_SPEC_V47_NOTES.md`,
`BITCODE_SPEC_V47_PARITY_MATRIX.md`, and eventually
`BITCODE_SPEC_V47_PROVEN.md`. Promotion must be workflow-driven.

### Appendix H. Operator surface and quality contract catalog

Operators need source-safe views of seller flow, buyer flow, measurements,
quotes, BTC-testnet observations, BTD rights, delivery, compensation, repair,
proof roots, and workflow receipts. Operator surfaces must remain measurable,
readable, accessible, performant, and repairable.

### Appendix I. Scenario, workflow, and cross-product contract catalog

V47 keeps historical scenario coverage terms auth-issuer-rollback,
privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation,
auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch,
context, public, buyer, reviewer, internal, Openly writable, Measurably
readable, Provable, and Valuable.

New V47 scenarios are IP seller deposits an AssetPack and IP buyer buys a
Need-Fit AssetPack on staging-testnet.

### Appendix J. Fail-closed contract and error posture matrix

V47 fails closed on invalid deposit, prompt contract incompleteness,
parsed-envelope inadmissibility, no-survivor asset pack, authorization denial,
public projection overexposure, settlement conservation drift, stale promoted
status truth, measurement formula drift, BTC-testnet quote mismatch, and
repository delivery failure.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing artifacts include `.bitcode/asset-pack.lock.json`,
`.bitcode/selected-source-material.json`,
`.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`,
`.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and
`BITCODE_SPEC_V47_PROVEN.md`. Source-bearing payloads remain protected until
entitlement; source-safe receipts may be projected.

## V47 accepted boundaries and reopen conditions

- V47 replaced V46 as active canon through the promotion workflow.
- V47 Gate 1 does not authorize runtime behavior changes.
- V47 testnet means BTC amounts are testnet only; system behavior remains
  production-intended.
- Measurement must be visible and source-safe before a user decides to deposit
  or buy.
- Conversation surfaces, ChatGPT App commercialization, MCP/API
  commercialization, deeper BTD mining cryptography, mainnet launch authority,
  and advanced market mechanics are deferred to later versions.
- Any source leakage, measurement ambiguity, quote/finality collapse, rights
  ambiguity, or delivery ambiguity reopens the relevant gate.

## V47 completion condition

V47 Gate 1 is complete when the V47 draft spec family exists over active V46,
testnet semantics and measurement law are specified, the seller/buyer launch
scope and ten-gate plan are recorded, the roadmap names V47 as active draft
target, `check:v47-gate1` exists, gate/canon workflows validate active V46 plus
draft V47, and the gate branch is committed, pushed, and pull-requested into
`version/v47`.

V47 Gate 2 is complete when launch-facing entrypoints resolve to `/deposit`,
`/read`, and `/packs`; old `/exchange` entrypoints are compatibility redirects
or rewritten into `/packs`; BTD acquisition and detail paths no longer send
users to `/terminal` or `/exchange`; `/terminal` and `/conversations` direct
entry are retained or flaggable rather than launch CTAs; API/MCP, ChatGPT App,
Bitcode Chat, value-bearing mainnet, source-bearing previews, and advanced
market mechanics are explicitly deferred; `.bitcode/v47-feature-excess-
alignment-audit.json` is generated; `check:v47-gate2` validates the audit; and
gate/canon workflows run the Gate 2 checker under promoted V47 canon.

V47 Gate 3 is complete when the IP seller state machine covers source
connection, deposit AssetPack option synthesis, source-safe measurement review,
Depository admission approval, and compensation/repair tracking; the IP buyer
state machine covers Read request, Need review, Finding Fits, source-safe
AssetPack preview, BTC-testnet settlement, BTD rights, and repository delivery;
the guards enforce measurement-before-price, proof-before-state, accepted Need
before Finding Fits, quote-before-settlement, BTC finality before BTD rights,
BTD rights before source delivery, `/packs` history projection, and
fail-closed repair; `.bitcode/v47-seller-buyer-state-machine-law.json` is
generated; `check:v47-gate3` validates the law; and gate/canon workflows run
the Gate 3 checker under promoted V47 canon.

V47 Gate 4 is complete when the `/deposit` route binds source connection
before option synthesis; option synthesis, review, and admission decisions are
journaled as source-safe execution rows; depositors review measurements,
criticality, demand, ROI, BTD potential, BTC source-to-shares preview, and
option roots before approval; approved policy-eligible options emit admission
readback synchronized to `/packs`; compensation estimates, supply
recommendations, and organization/wallet authority state are visible as
source-safe metadata; `.bitcode/v47-depositor-website-completion.json` is
generated; `check:v47-gate4` validates the completion; and gate/canon
workflows run the Gate 4 checker under promoted V47 canon.

V47 Gate 5 is complete when the `/read` route binds Read request initiation
from a connected repository source; a synthesized Need is reviewed and
accepted before Finding Fits; readers review source-safe fit measurements,
selected Fit provenance, final BTD scalar, and BTC-testnet quote basis before
paying; the deterministic quote derives from weighted measurement
contributions; payment observation, BTC-testnet finality, BTD rights transfer
receipt, and repository PR delivery render as ordered fail-closed readback
with delivery locked until rights transfer; Reading activity and settled
AssetPacks remain reachable through `/packs`;
`.bitcode/v47-reader-website-completion.json` is generated; `check:v47-gate5`
validates the completion; and gate/canon workflows run the Gate 5 checker
under promoted V47 canon.

V47 Gate 6 is complete when `/packs` renders searchable master-detail
PackActivity with type, scope, repository, and settlement, compensation,
delivery, and repair facets; the detail surface reads back overview,
measurements, settlement, BTD rights, compensation, delivery, and repair
states, accounting, governance, and proof roots; BTD rights states derive
only from finality-consistent commodity-state evidence; repair-required
activity exposes a fail-closed repair surface listing commodity-state
blockers; Auxillaries panes cover identity profile, external source
connections, interfaces, wallet authority with BTD history readback, and
organization team and treasury settings;
`.bitcode/v47-packs-auxillaries-commercial-dashboard.json` is generated;
`check:v47-gate6` validates the completion; and gate/canon workflows run the
Gate 6 checker under promoted V47 canon.

V47 Gate 7 is complete when browser-level tests prove both sides of Bitcode
in deterministic mock mode: depositing IP through source connection, option
synthesis, source-safe measurement review, and Depository admission on
`/deposit` with journaled execution rows; buying synthesized IP through the
five-step `/read` session with the fit measurement review, final BTD scalar,
and deterministic BTC-testnet quote basis rendered before payment and with
payment observation, finality, BTD rights receipt, and repository PR delivery
read back in order; auditing settlement, rights, compensation, delivery, and
the fail-closed repair surface on `/packs`; the browser error trap stays
clean; `uapi` exposes `test:e2e:ip-exchange`;
`.bitcode/v47-e2e-ip-selling-buying-tests.json` is generated;
`check:v47-gate7` validates the coverage; and gate/canon workflows run the
Gate 7 checker under promoted V47 canon.

V47 Gate 8 is complete when the landing page renders a commercial-testnet
section explaining that BTC amounts are testnet and free while protocol
behavior stays production-intended; the deposit → read → packs core flow is
documented with launch-route links; proof-backed trust and source-safe IP
exchange positioning are stated; public docs carry the testnet-meaning card
with blocked value-bearing mainnet posture; promoted V46 claim-boundary
tokens and launch navigation remain intact;
`.bitcode/v47-landing-public-launch-messaging.json` is generated;
`check:v47-gate8` validates the messaging; and gate/canon workflows run the
Gate 8 checker under promoted V47 canon.

V47 Gate 9 is complete when the staging-testnet rehearsal law binds the
deployment truth sources for every launch surface; the realistic-data
contract minimums are satisfied by the rehearsed population; the BTC-testnet
settlement observation lane preserves the production ordering law; the
value-bearing mainnet lane rehearses as blocked; lane receipts remain dry-run
with live execution operator opt-in and no serialized live credentials;
`.bitcode/v47-staging-testnet-deployment-rehearsal.json` is generated;
`check:v47-gate9` validates the rehearsal; and gate/canon workflows run the
Gate 9 checker under promoted V47 canon.

V47 Gate 10 is complete when the promotion readiness report binds all accepted
Gate 2-9 artifacts as present, parseable, and source-safe; the promotion
scripts, spec-family and runtime promotion preparation, proven generation, and
`v47-canon-promotion.yml` support V47; gate/canon workflows validate both the
V46 pre-promotion and V47 post-promotion pointer postures; a draft-preview
`BITCODE_SPEC_V47_PROVEN.md` is generated; the V47 promotion dry-run passes;
`.bitcode/v47-promotion-readiness-report.json` is generated; `check:v47-gate10`
validates the readiness; and the prepared post-promotion posture is
V47 active / draft V48 under promoted V47 canon until the promotion
workflow advances `BITCODE_SPEC.txt`.
