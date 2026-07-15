# Bitcode Spec V45

## Status

- Version: `V45`
- V45 state: canonical promotion complete; V45 is the active knowledge commoditization canon and the V45 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V45`
- Canonical proof-source commit: `23294cc578dcb2148a6b602c3463b3ca01f1fef1`
- Prior canonical anchor: `BITCODE_SPEC_V44.md`
- Prior generated proof appendix: `BITCODE_SPEC_V44_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, `.bitcode/v45-canon-posture-drift-report.json`, all nine V45 proof-family artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`, `.bitcode/v45-promotion-readiness-report.json`, V45 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V45_PROVEN.md` as the generated proof appendix for V45 promotion
- Source parity state: V45 source-side AssetPack commodity lifecycle, BTD scalar-volume, BTC settlement, interface disclosure, proof readback, source-safe rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V45 file family
- Notes companion: `BITCODE_SPEC_V45_NOTES.md`
- Delta companion: `BITCODE_SPEC_V45_DELTA.md`
- Parity companion: `BITCODE_SPEC_V45_PARITY_MATRIX.md`
- Scope: V45 canonical system specification for knowledge commoditization across AssetPack commodity lifecycle, BTD scalar-volume and rights, BTC settlement, interface disclosure, proof readback, source-safe end-to-end rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V45`

## Version executive summary

V45 makes Bitcode's protocol identity explicit before implementation auditing:
Bitcode is the knowledge commoditization protocol and commercial system for
turning source-derived technical knowledge into source-safe, measurable
AssetPacks. The formal V45 law defines AssetPack lifecycle state, BTD scalar
knowledge-volume and settled rights, BTC settlement finality, interface
authority, proof readback, operational repair, and the gate taxonomy that
controls the rest of the version.

V45 replaces V44 as active canon after promotion workflow validation. It is the
current Bitcode source of truth for the AssetPack commodity lifecycle, BTD
scalar-volume and rights, BTC settlement, interface disclosure, proof readback,
source-safe rehearsal, workflow, and promotion-readiness surfaces named here.

## Canonical Bitcode executive summary

Bitcode commoditizes technical knowledge by packaging it as AssetPacks.
Depositors form source-safe supply. Readers form measured demand, review Needs,
request Finding Fits, preview source-safe Need-Fit results, settle in BTC, take
BTD rights, and receive entitled repository delivery. Contributor compensation
flows from source-to-shares after final settlement.

V45 sharpens the law: AssetPack is the commodity, BTC is settlement money, BTD
is Need-relative weighted scalar knowledge-volume whose settled form carries
rights, and proof-backed readback is the only state advancement mechanism.

## V45 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V45`; V45 is the active promoted Bitcode canon.
`BITCODE_SPEC_V45.md`, `BITCODE_SPEC_V45_DELTA.md`,
`BITCODE_SPEC_V45_NOTES.md`, and `BITCODE_SPEC_V45_PARITY_MATRIX.md` are the
promoted V45 specification-family material. The V45 formal specification family
is active canon and authorizes implementation behavior only through the
source-safe, entitlement-bound, proof-backed boundaries it states.

Implementation remains unversioned in source paths. Package, route, component,
test, prompt, script, telemetry, schema, API, and workflow names move in place
as the single current Bitcode system after parity-authorized implementation
gates begin.

## V45 full-system, re-implementation, and audit rule

V45 work must be reconstructable from this formal specification family, source
code, generated artifacts, proof roots, workflow receipts, ledger journals,
database projections, storage roots, wallet/provider receipts, repository
delivery receipts, and operator-safe telemetry.

No V45 surface may disclose protected source, unpaid AssetPack source, raw
prompts, raw model/provider responses, wallet private material, credentials,
private settlement payloads, or private repository access outside entitlement.

## V45 totality and precision enforcement rule

V45 must use protocol words precisely. AssetPack is the traded commodity. BTD
is weighted scalar knowledge-volume and, after settlement, a rights-bearing
receipt. BTC is settlement money. Source-to-shares is post-finality contributor
allocation. Preview is not source disclosure. Quote is not payment. Payment
observation is not finality. Database projection is not ledger truth when it
conflicts with ledger, storage, wallet, provider, or delivery readback.

Every value or state must name whether it is estimate, potential, preview,
quote, observed payment, final settlement, rights transfer, delivery,
contributor allocation, or repair.

## V45 system goals, non-goals, and design principles

Goals:

- Define Bitcode as the world's knowledge commoditization system.
- Consolidate AssetPack lifecycle state from deposit option through delivery
  and compensation.
- Define BTD as Need-relative weighted scalar knowledge-volume whose settled
  form carries rights and source unlock authority.
- Define BTC quote, payment observation, finality, repair, and compensation
  boundaries.
- Define interface authority across `/deposit`, `/read`, `/packs`, API/MCP,
  ChatGPT App, Bitcode Chat, public docs, and landing pages.
- Define proof-backed readback as the only state advancement mechanism.
- Define gate taxonomy before parity and implementation work.

Non-goals:

- V45 active canon does not expose unpaid source.
- V45 active canon does not admit value-bearing mainnet operation.
- V45 active canon does not authorize behavior outside accepted formal parity,
  proof, rehearsal, and promotion evidence.
- V45 active canon does not treat notes, PR bodies, telemetry, or conversations
  as implementation authority.

Design principles: source-safe commodity formation, Need-relative measurement,
BTC finality before rights, proof-backed readback, fail-closed repair,
interface humility, and implementation from formal parity only.

## V45 system architecture and layer boundaries

V45 acts through existing Bitcode layers:

- `/deposit` for source-safe AssetPack supply formation.
- `/read` for Read Request, Need review, Finding Fits, preview, quote, BTC
  settlement, BTD rights transfer, and repository delivery.
- `/packs` for searchable master-detail activity, proof roots, repairs,
  settlement state, delivery state, and compensation state.
- API/MCP, ChatGPT App, and Bitcode Chat as policy-bound windows into the same
  protocol law.
- Package-owned BTD, settlement, source-to-shares, prompt, pipeline, telemetry,
  storage, proof, and workflow primitives.
- Ledger, database, object storage, wallet/provider, and repository readback as
  protocol evidence boundaries.

Demonstration code remains self-contained inside `protocol-demonstration/`.

## V45 canonical domain model

V45 consolidates these canonical objects and states:

- AssetPack, deposit AssetPack option, Depository AssetPack, selected Fit set,
  Need-Fit AssetPack, source-safe preview, withheld source bundle, quote,
  settlement receipt, BTD rights receipt, repository delivery receipt,
  source-to-shares allocation, contributor compensation statement, repair case,
  proof root, execution receipt, ledger journal, database projection, object
  storage root, wallet/provider receipt, and repository delivery receipt.
- AssetPack states: `deposit-option-synthesized`,
  `deposit-option-reviewed`, `depository-assetpack-admitted`,
  `fit-candidates-recalled`, `fit-set-selected`,
  `need-fit-assetpack-synthesized`, `need-fit-assetpack-quoted`,
  `settlement-observed`, `btd-settled-rights-transferred`,
  `source-unlocked-delivery`, `compensated-and-reconciled`, and
  `repair-required`.
- BTD states: `btd-not-applicable`, `btd-potential-measured`,
  `need-fit-measurements-admitted`, `measurement-weight-policy-locked`,
  `weighted-scalar-volume-computed`, `btd-quantized`,
  `measuremint-applied`, `btd-range-assigned`, `btd-quote-bound`,
  `btd-rights-pending`, `btd-rights-transferred`,
  `btd-source-to-shares-allocated`, and `btd-repair-required`.
- BTC states: `btc-not-quoteable`, `btc-quote-issued`,
  `btc-quote-accepted`, `btc-quote-inactive`, `btc-wallet-ready`,
  `btc-psbt-prepared`, `btc-psbt-signed`, `btc-broadcast-submitted`,
  `btc-payment-observed`, `btc-payment-mismatch-repair-required`,
  `btc-finality-confirmed`, `btc-replaced-reorged-or-failed`,
  `btc-settlement-finalized`, `btc-contributor-compensation-routable`,
  `btc-refund-or-escalation-required`, and `btc-settlement-repair-required`.

## V45 whole Bitcode operator chain

The V45 operator chain is: connect source and organization policy, synthesize
deposit AssetPack options, approve source-safe Depository admission, request a
Read, synthesize and review a Need, run Finding Fits, select one or many
Depository AssetPacks above threshold, synthesize a source-bearing but withheld
Need-Fit AssetPack, preview only source-safe measurements and metadata, quote
BTC sats from deterministic BTD scalar-volume and share-to-fee policy, accept
quote, sign through non-custodial wallet flow, observe payment, confirm
Bitcoin finality, transfer BTD rights, unlock source only for the entitled
Reader boundary, deliver to repository, allocate source-to-shares contributor
compensation, reconcile ledger/database/storage, and repair fail-closed drift.

## V45 consolidated protocol law

Bitcode is the knowledge commoditization protocol and commercial system for
turning source-derived technical knowledge into source-safe, measurable
AssetPacks whose measurements can be weighted and summed into BTD scalar
knowledge-volume when evaluated against a reviewed Need. That Need-relative BTD
volume drives deterministic BTC quote and settlement, expresses
post-settlement rights, controls source unlock, routes contributor shares, and
is audited through proof roots, ledgerized journals, telemetry, database and
storage synchronization, and generated canon.

The traded commodity is the AssetPack, not raw source, raw prompts, provider
responses, loose files, screenshots, telemetry logs, private repository access,
or conversational summaries.

## V45 AssetPack lifecycle law

Every AssetPack-like object must occupy exactly one lifecycle state at every
protocol boundary. Interfaces, APIs, pipelines, proofs, and operator tools must
not collapse deposit options into settled BTD, previews into source disclosure,
quotes into payment finality, admitted Depository AssetPacks into delivered
Need-Fit AssetPacks, or repair cases into successful purchases.

Finding Fits recalls many candidates above threshold when available. The
selected Fit set may contain one or many admitted Depository AssetPacks. The
Need-Fit AssetPack is synthesized from the reviewed Need plus selected Fit set
and is a new Need-relative AssetPack, not disclosure of the underlying
Depository source before settlement.

## V45 BTD scalar-volume law

BTD is the non-fungible, proof-addressed scalar unit of technical knowledge
volume for a Need-Fit AssetPack. Deposit-time measurements may estimate BTD
potential, but final BTD size is computed only after a reviewed Need, selected
Fit set, synthesized Need-Fit AssetPack, deterministic measurement weights,
dedupe proofs, and source-safe proof roots exist.

Every final BTD measurement row must be Need-relative, accepted, deduped,
proof-rooted, and tied to the selected Fit set. Measurement weights are
deterministic protocol policy. Scalar volume uses fixed-point or integer
arithmetic. Rights-bearing BTD exists only after BTC settlement finality and
BTD rights transfer.

## V45 BTC settlement law

BTC is Bitcode settlement money and payment truth. A BTC quote is a source-safe
procurement offer bound to a reviewed Need, selected Fit set, synthesized
Need-Fit AssetPack, BTD scalar-volume/range, deterministic share-to-fee
policy, wallet authority, network, expiry, and proof roots.

Prepared, signed, broadcast, and observed states are not final settlement.
Source unlock, rights-bearing BTD transfer, repository delivery, and
contributor compensation require confirmed BTC finality, quote/payment
conservation, ledger/database/storage readback, and repair-free settlement
receipts.

## V45 interface authority and disclosure law

All Bitcode interfaces are protocol windows into the same AssetPack, BTD, BTC,
proof, ledger, database, storage, and delivery state. No interface is an
independent source of protocol law. `/deposit` forms source-safe supply;
`/read` procures Need-Fit packs; `/packs` inspects activity and proof readback;
API/MCP exposes machine workflows under equivalent policy; ChatGPT App and
Bitcode Chat guide and summarize; public docs and landing pages explain but do
not represent live transaction truth.

Disclosure boundaries are `before-settlement`, `after-preview`, `after-quote`,
`after-payment-observation`, `after-finality`,
`after-btd-rights-transfer`, and `after-repository-delivery`. Each boundary
must fail closed to the narrowest source-safe state when evidence is missing or
contradictory.

## V45 proof readback and operational authority law

Bitcode state advances only by proof-backed readback. No UI row, conversation
message, streamed telemetry item, route response, external provider event, or
workflow log can alone advance AssetPack lifecycle, BTD rights, BTC settlement,
source unlock, delivery, or contributor compensation.

Canonical evidence classes are canonical specification and generated proof
appendix, execution/workflow receipt, ledger journal, database projection,
object storage and protected-source roots, telemetry stream, wallet/provider
receipt, and repository delivery receipt. Telemetry is observability only.
Provider observation is not final settlement until reconciled with quote,
wallet authority, and finality policy.

## V45 gate taxonomy law

V45 gates are classified as `notes-specification-atom`,
`formal-specification-consolidation`, `specification-parity-matrix`,
`proof-only`, `interface-only`, `implementation`, `rehearsal`, or `promotion`.
Formal consolidation follows accepted notes atoms. The parity matrix follows
formal consolidation. Implementation follows accepted parity gaps. Promotion
alone may advance `BITCODE_SPEC.txt`.

## V45 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: deposit AssetPack option,
  Depository AssetPack, protected-source storage root, source-safety proof,
  admission receipt, policy root, and source-safe earning potential.
- Current algorithms and derivation rules: source is measured into deposit
  options, reviewed by depositor authority, admitted only after source-safety
  and policy eligibility, then indexed for Finding Fits.
- Current invariants and fail-closed conditions: no final BTD size, reader
  ownership, final BTC proceeds, or public source visibility before paid
  Need-Fit settlement.
- Current proof obligations: option synthesis root, review decision root,
  policy root, admission root, storage projection root, and Depository index
  root.
- Current source-bearing implementation basis: protected source remains outside
  visible Bitcode surfaces and is represented only by custody roots.
- Current validating commands and parity basis: V45 parity gate must audit
  implementation against this formal specification.
- Current accepted boundaries: source-safe depositor supply formation only.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: Read Request, synthesized
  Need, reviewed Need, Finding Fits receipt, selected Fit set, source-safe
  preview, quote, BTD posture, and delivery receipt.
- Current algorithms and derivation rules: Reading synthesizes a Need from a
  request, accepts or resynthesizes it, searches the Depository, synthesizes a
  Need-Fit AssetPack, and withholds source until payment and rights transfer.
- Current invariants and fail-closed conditions: preview, quote, and observed
  payment are non-final and cannot disclose source.
- Current proof obligations: Read Request root, Need synthesis receipt, review
  root, telemetry summary root, selected Fit root, synthesis root, quote root,
  rights receipt, and repository delivery receipt.
- Current source-bearing implementation basis: source-bearing pack material may
  exist internally only as a withheld bundle root before settlement.
- Current validating commands and parity basis: V45 parity gate must inspect
  ReadNeed and ReadFitsFinding source, tests, proof, telemetry, and UI.
- Current accepted boundaries: Reader entitlement starts only after BTC
  settlement finality and BTD rights transfer.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: search query root, search
  channel roots, candidate provenance roots, ranking root, threshold root,
  selected Fit set root, and verification root.
- Current algorithms and derivation rules: Finding Fits searches broadly over
  admitted Depository AssetPacks and selects one or many candidates above
  threshold for Need-Fit synthesis.
- Current invariants and fail-closed conditions: candidate source remains
  withheld, and provisional BTD contribution is not rights-bearing.
- Current proof obligations: query, search, ranking, threshold, verification,
  and selected-fit roots.
- Current source-bearing implementation basis: Fits are represented by
  source-safe provenance and protected-source roots before rights transfer.
- Current validating commands and parity basis: parity must audit search,
  embeddings, ranking, telemetry, and readback.
- Current accepted boundaries: recall and ranking are source-safe evidence,
  not source disclosure.

### Selection and materialization

- Current canonical objects and emitted artifacts: Need-Fit AssetPack,
  source-bearing withheld bundle, source-safe preview, measurement vector, BTD
  posture, quote, source unlock root, and repository delivery receipt.
- Current algorithms and derivation rules: selected Fits plus reviewed Need
  synthesize a new Need-relative AssetPack, then materialize delivery only
  after settlement and rights.
- Current invariants and fail-closed conditions: no materialized source crosses
  to the Reader before entitlement.
- Current proof obligations: synthesis receipt, withheld-source bundle root,
  preview boundary root, measurement root, settlement root, rights root, and
  delivery root.
- Current source-bearing implementation basis: source-bearing output is held in
  protected storage until source unlock.
- Current validating commands and parity basis: parity must audit synthesis,
  preview, storage, delivery, and repair paths.
- Current accepted boundaries: source-bearing materialization is delivery
  authority, not preview authority.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: organization policy, wallet
  authority, budget approval, buyer authorization, depositor approval,
  no-server-custody proof, and entitlement boundary.
- Current algorithms and derivation rules: policies gate quote acceptance,
  wallet readiness, source criticality, deposit approval, delivery, and repair.
- Current invariants and fail-closed conditions: Bitcode never takes custody of
  wallet private material and never lets policy bypass settlement law.
- Current proof obligations: wallet authority root, budget root, policy root,
  authorization root, and entitlement root.
- Current source-bearing implementation basis: secrets, wallet private
  material, and protected source are never serialized into public surfaces.
- Current validating commands and parity basis: parity must audit auth, wallet,
  policy, API/MCP, and conversational authorization.
- Current accepted boundaries: authority enables protocol actions but cannot
  override proof readback.

### Disclosure and projection

- Current canonical objects and emitted artifacts: interface read models,
  disclosure boundary labels, redaction receipts, proof roots, repair cases,
  and source-safe statements.
- Current algorithms and derivation rules: each surface projects only the data
  the actor may see at the current protocol state.
- Current invariants and fail-closed conditions: missing or contradictory
  evidence returns to the narrowest source-safe state.
- Current proof obligations: ledger/database readback, storage roots,
  entitlement roots, redaction roots, and interface tests.
- Current source-bearing implementation basis: unpaid source, protected source,
  raw prompts, raw responses, wallet material, and private payloads remain
  withheld.
- Current validating commands and parity basis: parity must audit `/packs`,
  `/read`, `/deposit`, API/MCP, ChatGPT App, Bitcode Chat, docs, and landing
  surfaces.
- Current accepted boundaries: interfaces guide and inspect; they do not create
  settlement, rights, or source truth.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC quote, quote acceptance,
  PSBT roots, broadcast receipt, payment observation, finality receipt, BTD
  rights receipt, source-to-shares allocation, compensation statement, and
  reconciliation root.
- Current algorithms and derivation rules: deterministic BTD scalar-volume and
  share-to-fee policy generate sats quote; finality authorizes BTD rights and
  delivery; source-to-shares routes contributor compensation after settlement.
- Current invariants and fail-closed conditions: observed payment is not final;
  mismatches enter repair, refund, or escalation.
- Current proof obligations: quote root, wallet root, txid/network/amount
  observation, finality receipt, conservation root, rights receipt,
  compensation root, and reconciliation root.
- Current source-bearing implementation basis: settlement payloads are
  source-safe and do not carry wallet private material or unpaid source.
- Current validating commands and parity basis: parity must audit BTD, BTC,
  settlement, quote, ledger, database, storage, and compensation code.
- Current accepted boundaries: BTC finality precedes rights, unlock, delivery,
  and compensation.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: specification proof,
  execution receipt, workflow receipt, ledger journal, database projection,
  object storage root, telemetry event, wallet/provider receipt, repository
  delivery receipt, and replay report.
- Current algorithms and derivation rules: state advances only by required
  proof root plus readback from the relevant boundary.
- Current invariants and fail-closed conditions: telemetry, UI, conversation,
  provider observation, and workflow logs alone do not advance protocol state.
- Current proof obligations: every state advancement must name required
  readback and repair behavior.
- Current source-bearing implementation basis: proof artifacts are source-safe
  unless they sit behind entitled storage and delivery roots.
- Current validating commands and parity basis: parity must audit generated
  proof, workflows, checks, replay, and repair coverage.
- Current accepted boundaries: proof-backed readback is the only authority.

## V45 proof-family canon

Every proof family below uses the same detail labels so generated proof and
human inspection remain aligned.

### Inference-synthesis

- proofArtifactPath: `.bitcode/v45-inference-synthesis-proof.json`.
- members: ReadNeedComprehension, ReadFitsFinding, deposit option synthesis,
  AssetPack synthesis, conversation guidance.
- theoremIds: source-safe inference, typed output, prompt registry closure.
- replayStepIds: synthesize Need, Finding Fits, synthesize AssetPack, redacted
  telemetry readback.
- witnessArtifactPaths: execution receipts, telemetry summaries, prompt
  registry reports.
- current member closure criteria: every inference is typed, source-safe, and
  auditable.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: theorem rows tie prompt,
  execution, output type, and redaction.
- current theorem-to-replay grouping: grouped by pipeline and interface.
- minimum artifact/replay binding set: prompt root, execution root, output
  root, telemetry root.
- current proof-object fields: proof id, family, member, theorem, input root,
  output root, status.
- generated-artifact and test bindings: future parity gate must bind tests.
- fail-closed conditions: missing prompt, untyped output, source leak, or stale
  telemetry.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v45-prompt-completeness-proof.json`.
- members: prompt parts, prompts, registries, templates, interpolation.
- theoremIds: total prompt catalog, no raw prompt leakage, benchmarkable parts.
- replayStepIds: registry resolution, interpolation, redaction, benchmark run.
- witnessArtifactPaths: prompt inventory and benchmark receipts.
- current member closure criteria: prompt programs are complete and traceable.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem binds a prompt
  surface to a typed use.
- current theorem-to-replay grouping: prompt family to inference family.
- minimum artifact/replay binding set: prompt part id, prompt id, registry id,
  rendered prompt hash.
- current proof-object fields: prompt ids, interpolation inputs, output type.
- generated-artifact and test bindings: V45 parity determines coverage.
- fail-closed conditions: missing prompt part, unsafe interpolation, raw prompt
  exposure, or unbenchmarked critical prompt.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v45-static-code-analysis-proof.json`.
- members: packages, routes, scripts, workflows, tests, docs.
- theoremIds: source names align with protocol, no forbidden source exposure,
  no versioned source identifiers.
- replayStepIds: lint, typecheck, casing/imports, spec check.
- witnessArtifactPaths: CI logs, local command receipts, diff hygiene.
- current member closure criteria: static checks pass and scope is traced to
  formal spec.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem links code surface
  to spec law.
- current theorem-to-replay grouping: static commands plus source maps.
- minimum artifact/replay binding set: file path, command, result, spec row.
- current proof-object fields: command, status, artifact root, failures.
- generated-artifact and test bindings: future proof-only gates may harden.
- fail-closed conditions: lint/type failure, import drift, or source-safety
  violation.

### Verification-decisions

- proofArtifactPath: `.bitcode/v45-verification-decisions-proof.json`.
- members: Need review, Fit thresholding, quote acceptance, payment finality,
  rights transfer, delivery.
- theoremIds: explicit decision root, actor authority, no collapsed states.
- replayStepIds: approve Need, select Fits, accept quote, confirm finality.
- witnessArtifactPaths: review receipts, verification roots, policy roots.
- current member closure criteria: decisions are typed, authorized, and
  readback-backed.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each decision carries actor,
  input, policy, and proof.
- current theorem-to-replay grouping: workflow boundary by state advancement.
- minimum artifact/replay binding set: decision root, actor root, policy root,
  readback root.
- current proof-object fields: decision id, actor, state, result, blocker.
- generated-artifact and test bindings: parity must bind route and API tests.
- fail-closed conditions: unauthorized actor, stale decision, missing root, or
  evidence conflict.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v45-selection-materialization-proof.json`.
- members: candidate recall, selected Fit set, withheld bundle, source-safe
  preview, repository delivery.
- theoremIds: selected Fits above threshold, source withheld, delivery after
  rights.
- replayStepIds: search, rank, select, synthesize, unlock, deliver.
- witnessArtifactPaths: selected-fit roots, storage roots, PR receipts.
- current member closure criteria: materialization honors disclosure state.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem binds source custody
  to entitlement.
- current theorem-to-replay grouping: Finding Fits and delivery replay.
- minimum artifact/replay binding set: fit root, bundle root, preview root,
  delivery root.
- current proof-object fields: candidate ids, bundle hash, preview hash,
  delivery id.
- generated-artifact and test bindings: parity must bind storage and delivery.
- fail-closed conditions: no survivor, source overexposure, stale storage, or
  delivery mismatch.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v45-authorization-sensitive-flow-proof.json`.
- members: organization policy, wallet authority, depositor approval, buyer
  entitlement, API/MCP, conversations.
- theoremIds: no secret leakage, no server custody, actor entitlement.
- replayStepIds: policy check, wallet ready, authorization denial, redaction.
- witnessArtifactPaths: policy roots, wallet roots, redaction receipts.
- current member closure criteria: sensitive data stays within its boundary.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem maps actor to
  permitted data.
- current theorem-to-replay grouping: human, machine, and conversational
  interfaces.
- minimum artifact/replay binding set: actor root, policy root, redaction root,
  interface root.
- current proof-object fields: actor, scope, decision, redaction, blocker.
- generated-artifact and test bindings: parity must cover all interfaces.
- fail-closed conditions: secret exposure, wrong actor, missing policy, or
  wallet custody drift.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v45-settlement-source-to-shares-proof.json`.
- members: BTD scalar-volume, BTC quote, PSBT, finality, rights transfer,
  source-to-shares, compensation.
- theoremIds: deterministic quote, finality-before-rights, conservation,
  allocation after settlement.
- replayStepIds: compute BTD, quote BTC, observe payment, confirm finality,
  allocate shares.
- witnessArtifactPaths: BTD receipts, quote roots, wallet/provider receipts,
  ledger journals, compensation statements.
- current member closure criteria: accounting conserves state and value.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem links quote,
  payment, rights, and allocation.
- current theorem-to-replay grouping: settlement workflow and repair paths.
- minimum artifact/replay binding set: BTD root, quote root, tx root,
  finality root, allocation root.
- current proof-object fields: sats, BTD range, txid, finality, allocation.
- generated-artifact and test bindings: parity must audit settlement packages.
- fail-closed conditions: mismatch, reorg, expired quote, stale readback, or
  compensation drift.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v45-disclosure-boundary-proof.json`.
- members: `/deposit`, `/read`, `/packs`, API/MCP, ChatGPT App, Bitcode Chat,
  public docs, landing page.
- theoremIds: source-safe before entitlement, non-final labels, boundary
  equivalence across interfaces.
- replayStepIds: preview, quote, observation, finality, rights, delivery.
- witnessArtifactPaths: interface tests, redaction roots, read models.
- current member closure criteria: every surface shows only permitted state.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem maps state to
  visible fields.
- current theorem-to-replay grouping: interface by actor and state boundary.
- minimum artifact/replay binding set: interface root, actor root, state root,
  disclosure root.
- current proof-object fields: actor, boundary, visible fields, redactions.
- generated-artifact and test bindings: parity must bind UI/API proof.
- fail-closed conditions: overexposure, finality confusion, source leak, or
  missing entitlement.

### Proof-contract

- proofArtifactPath: `.bitcode/v45-proof-contract-proof.json`.
- members: generated spec proof, workflow receipts, ledger journals, database
  projections, storage roots, telemetry, provider receipts, repository
  receipts.
- theoremIds: proof-backed readback, evidence precedence, repair on conflict.
- replayStepIds: readback join, contradiction, repair, replay.
- witnessArtifactPaths: generated proof appendix, workflow logs, readback
  reports, repair receipts.
- current member closure criteria: protocol state advances only with required
  readback.
- current member verdict shape: pass, repair-required, or blocked.
- current theorem-by-theorem closure reading: each theorem ties evidence class
  to authority and limit.
- current theorem-to-replay grouping: state advancement and repair.
- minimum artifact/replay binding set: proof root, ledger root, database root,
  storage root, external receipt when relevant.
- current proof-object fields: evidence class, authority, limit, readback,
  conflict policy.
- generated-artifact and test bindings: parity must bind proof and workflow
  checks.
- fail-closed conditions: missing, stale, contradictory, or out-of-boundary
  evidence.

## V45 generated canon

V45 generated canon includes spec-family, canonical-input, proof-family,
source-safe end-to-end rehearsal, and promotion-readiness artifacts. Promoted
generated proof is bound through `BITCODE_SPEC_V45_PROVEN.md` and the
promotion-source commit named in this file family.

### Inherited V19 reproducible-canon artifacts

V45 inherits V19 reproducible-canon discipline for deterministic replay,
proof-member matrices, theorem evidence, state machines, volatility, negative
mutation, and contract ledger shape.

### Inherited V20 operator-quality artifacts

V45 inherits V20 operator-quality artifact posture for accessibility,
operator acceptance, performance budget, projection quality, visual regression,
and quality summary.

### Exact generated-artifact inventory matrix

| artifactPath | role | V45 posture |
| --- | --- | --- |
| `.bitcode/v45-spec-family-report.json` | promoted spec-family validation report | active required |
| `.bitcode/v45-canonical-input-report.json` | promoted canonical input report | active required |
| `.bitcode/v45-inference-synthesis-proof.json` | inference proof-family artifact | active required |
| `.bitcode/v45-prompt-completeness-proof.json` | prompt proof-family artifact | active required |
| `.bitcode/v45-static-code-analysis-proof.json` | static-code proof-family artifact | active required |
| `.bitcode/v45-verification-decisions-proof.json` | verification-decision proof-family artifact | active required |
| `.bitcode/v45-selection-materialization-proof.json` | selection and materialization proof-family artifact | active required |
| `.bitcode/v45-authorization-sensitive-flow-proof.json` | authorization and sensitive-flow proof-family artifact | active required |
| `.bitcode/v45-settlement-source-to-shares-proof.json` | settlement and allocation proof-family artifact | active required |
| `.bitcode/v45-disclosure-boundary-proof.json` | disclosure-boundary proof-family artifact | active required |
| `.bitcode/v45-proof-contract-proof.json` | proof-contract proof-family artifact | active required |
| `.bitcode/v45-source-safe-e2e-rehearsal.json` | source-safe end-to-end rehearsal artifact | active required |
| `.bitcode/v45-promotion-readiness-report.json` | promotion-readiness artifact | active required |
| `BITCODE_SPEC_V45_PROVEN.md` | generated proof appendix | active required |

### V45 specifying generated artifacts

V45 specifying generated artifacts must include `.bitcode/v45-spec-family-report.json`,
`.bitcode/v45-canonical-input-report.json`, all nine V45 proof-family
artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`,
`.bitcode/v45-promotion-readiness-report.json`, and active
`BITCODE_SPEC_V45_PROVEN.md`; promotion readiness binds the promoted proof
outputs to the proof-source commit.

### Shared generated-artifact fields

Shared generated-artifact fields include report id, version, generatedAt,
source commit, input roots, artifact roots, pass/fail status, failures,
warnings, source-safe posture, and repair instructions.

### Artifact-specific generated payload fields

Artifact-specific generated payload fields include BTD scalar-volume rows, BTC
quote and finality rows, source-to-shares rows, disclosure boundary rows,
interface authority rows, readback evidence rows, and gate taxonomy rows.

### Artifact confidentiality and disclosability taxonomy

Artifacts classify fields as public, source-safe actor-scoped, operator-safe,
entitled-source, secret, wallet-private, provider-private, or repair-only.

### Minimum generated appendix rendered contents

The minimum generated appendix rendered contents must include aggregate proof
verdict, exact proof-family inventory, exact per-family member inventory, exact
per-family theorem inventory, exact replay-step inventories and theorem
bindings, witness artifact inventories, generated artifact inventories,
scenario and run coverage matrices, proof-source commit, and fail closed when
required evidence is missing, stale, contradictory, or unsafe.

### Canonical regeneration and fail-closed posture

Canonical regeneration and fail-closed posture require deterministic outputs,
clean worktree proofs when promotion requires them, and repair states for
missing generated artifacts or stale proof roots.

## V45 validation canon

V45 validation proceeded in order: notes atom checks, formal specification
consolidation check, V45 spec-family checks, prior promoted-canon checks,
canon posture drift checks, V45 parity audit, grouped implementation tests,
proof-only checks, interface proofs, rehearsal, promotion readiness, and the
promotion workflow. The active promoted posture now checks V45 active / draft
V46 before subsequent version work opens.

## V45 promotion canon

V45 promotion required every accepted parity row to be closed or explicitly
deferred, source-safety to be preserved, implementation and proof gates to be
green, rehearsal receipts to be replayable, and the promotion workflow to
validate before committing the standalone `BITCODE_SPEC.txt` pointer change to
`V45`.

### V45 promotion readiness canon

V45 promotion readiness is represented by
`.bitcode/v45-promotion-readiness-report.json`, `check:v45-gate18`, and
`v45-canon-promotion.yml`. The readiness proof binds all V45 proof-family
artifacts, the source-safe end-to-end rehearsal artifact, active
`BITCODE_SPEC_V45_PROVEN.md`, promotion script support, gate/canon workflow
posture, direct-main-push blocking, and source-safety exclusions. Promotion
converted the prior canon posture into V45 active / draft V46 posture after the
workflow validated and committed the standalone pointer change.

## V45 appendices and canonical supporting material

V45 supporting material consists of `BITCODE_SPEC_V45.md`,
`BITCODE_SPEC_V45_DELTA.md`, `BITCODE_SPEC_V45_NOTES.md`,
`BITCODE_SPEC_V45_PARITY_MATRIX.md`, active `BITCODE_SPEC_V45_PROVEN.md`,
`BITCODE_SPECIFYING.md`, `BITCODE_SPEC_TEMPLATEGUIDE.md`, V45 checkers, and
future generated `.bitcode` reports.

## V45 accepted boundaries and reopen conditions

Accepted boundaries:

- V45 is active canon.
- V45 formal spec is active runtime law only inside the source-safe,
  entitlement-bound, proof-backed boundaries it states.
- No protected source or wallet private material is exposed.
- BTC finality precedes BTD rights, source unlock, delivery, and compensation.
- Proof-backed readback advances state; telemetry observes state.

Reopen conditions:

- A formal V45 section contradicts accepted notes law.
- A parity audit finds a protocol impossibility or unsafe implementation gap.
- A proof, ledger, database, storage, wallet, provider, or delivery evidence
  class cannot satisfy readback law.
- A product surface requires source disclosure before entitlement.

## V45 completion condition

V45 is complete: formal specification is consolidated, implementation parity is
audited, grouped source gaps are closed, proof and interface gates are green,
rehearsal proves source-safe end-to-end operation, generated proof is current,
and the promotion workflow advanced `BITCODE_SPEC.txt` to `V45` only after
validations passed.

## Appendix A. Canonical type and surface catalog

Canonical types and surfaces include AssetPack, deposit AssetPack option,
Depository AssetPack, Read Request, Need, selected Fit set, Need-Fit AssetPack,
BTD scalar-volume, BTC quote, settlement receipt, rights receipt, delivery
receipt, compensation statement, repair case, `/deposit`, `/read`, `/packs`,
API/MCP, ChatGPT App, Bitcode Chat, public docs, landing page, proof roots,
ledger journals, database projections, storage roots, wallet/provider receipts,
and repository delivery receipts.

## Appendix B. Proof family closure catalog

The V45 proof family closure catalog binds inference, prompts, static code,
decisions, materialization, authorization, settlement, disclosure, and proof
contracts to generated artifacts and replay.

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v45-inference-synthesis-proof.json` | Reading, deposit, conversation | typed inference, source safety | synthesize, search, preview | execution receipts | formal V45 law |
| Prompt-completeness | `.bitcode/v45-prompt-completeness-proof.json` | prompts, registries | total prompt catalog | resolve, interpolate | prompt inventory | formal V45 law |
| Static-code-analysis | `.bitcode/v45-static-code-analysis-proof.json` | packages, routes, workflows | source alignment | lint, typecheck | CI logs | formal V45 law |
| Verification-decisions | `.bitcode/v45-verification-decisions-proof.json` | review, quote, finality | actor authority | approve, select, settle | decision roots | formal V45 law |
| Selection-and-materialization | `.bitcode/v45-selection-materialization-proof.json` | Fits, bundle, preview, delivery | source withheld | search, synthesize, deliver | storage roots | formal V45 law |
| Authorization-and-sensitive-flow | `.bitcode/v45-authorization-sensitive-flow-proof.json` | policy, wallet, entitlement | no secret leakage | authorize, redact | policy roots | formal V45 law |
| Settlement-source-to-shares | `.bitcode/v45-settlement-source-to-shares-proof.json` | BTD, BTC, allocation | finality before rights | quote, observe, allocate | ledger roots | formal V45 law |
| Disclosure-boundary | `.bitcode/v45-disclosure-boundary-proof.json` | interfaces | source-safe boundary | preview, quote, delivery | interface roots | formal V45 law |
| Proof-contract | `.bitcode/v45-proof-contract-proof.json` | evidence classes | proof-backed readback | readback, repair | proof roots | formal V45 law |

## Appendix C. Generated artifact contract catalog

Generated artifacts must be deterministic, source-safe by default, explicit
about confidentiality, and fail closed when proof roots or readback evidence
are missing. The draft generated artifacts are `.bitcode/v45-spec-family-report.json`,
`.bitcode/v45-canonical-input-report.json`, all nine V45 proof-family
artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`, and
`.bitcode/v45-promotion-readiness-report.json`, and
`BITCODE_SPEC_V45_PROVEN.md`; promotion later refreshes promotion-readiness
proof outputs.

### Minimum generated appendix rendered contents

Minimum generated appendix rendered contents are aggregate proof verdict, exact
proof-family inventory, exact per-family member inventory, exact per-family
theorem inventory, exact replay-step inventories and theorem bindings, witness
artifact inventories, generated artifact inventories, scenario and run coverage
matrices, proof-source commit, and fail closed when evidence cannot be trusted.

### Canonical regeneration and fail-closed posture

Canonical regeneration and fail-closed posture require deterministic generation,
source-safe output, current proof-source commit, and repair on stale or missing
artifact roots.

## Appendix D. Validation and checking gate catalog

Validation commands include `check:v45-gate2` through `check:v45-gate18`,
promoted V45 spec-family checks, active V45 / draft V46 canon posture drift
checks, parity, proof, implementation, rehearsal, and promotion commands.

## Appendix E. Current canonical source map

The current source map is V45 active canon with V46 draft target posture
prepared. Implementation source remains unversioned and is audited from the
promoted `BITCODE_SPEC_V45.md` family until V46 opens.

## Appendix F. Subsystem totality and derivability matrix

Required subsystem coverage includes repo supply and depositing, reading and
measured demand, prompt/inference/evaluator ownership, deposit-to-read fit,
recall and ranking, verification decisions, selection and materialization,
branch artifacts and assetPackEvidence, identity, authority, signing, and
policy, sensitive data and confidentiality flows, projection, disclosure, and
redaction, proof families, members, theorems, witnesses, and replay,
settlement, source-to-shares, journals, and exact accounting, telemetry,
persistence, state, and failure semantics, host/runtime capability truth,
operator experience and pedagogy, validation and test stack, generated
artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The V45 file family is `BITCODE_SPEC_V45.md`,
`BITCODE_SPEC_V45_DELTA.md`, `BITCODE_SPEC_V45_NOTES.md`,
`BITCODE_SPEC_V45_PARITY_MATRIX.md`, future `BITCODE_SPEC_V45_PROVEN.md`, and
supporting Bitcode specifying files. Promotion may update `BITCODE_SPEC.txt`
only through the promotion gate.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include website routes, ChatGPT App, Bitcode Chat, API/MCP,
public docs, landing page, workflow checks, proof reports, and repair readback.
Quality contracts require accessible, source-safe, performant, replayable, and
operator-legible outputs.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Scenario coverage inherits auth-issuer-rollback, privacy-boundary-proof-export,
polyglot-gateway-benchmark-remediation, and auth-many-asset-normalization.
Workflow coverage includes Targeted deposit and Normalization deposit across
patch and context branches and public, buyer, reviewer, and internal
principals. The contract remains Openly writable, Measurably readable,
Provable, and Valuable.

## Appendix J. Fail-closed contract and error posture matrix

Fail closed on invalid deposit, prompt contract incompleteness,
parsed-envelope inadmissibility, no-survivor asset pack, authorization denial,
public projection overexposure, settlement conservation drift, stale promoted
status truth, missing proof readback, contradictory evidence, source leak,
wallet custody drift, or delivery mismatch.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts include `.bitcode/asset-pack.lock.json`,
`.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`,
`.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`,
`.bitcode/system-proof-bundle.json`,
`.bitcode/v45-source-safe-e2e-rehearsal.json`,
`.bitcode/v45-promotion-readiness-report.json`, and
`BITCODE_SPEC_V45_PROVEN.md`. V45 requires protected source custody,
source-safe preview, entitlement-based unlock, and repository delivery receipt
before Reader-visible source.
