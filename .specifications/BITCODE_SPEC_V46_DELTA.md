# Bitcode Spec V46 Delta

## Status

- Version: `V46`
- V46 state: canonical promotion complete; this delta records the promoted V45-to-V46 protocol-comprehension closure set
- Current canonical/latest target: `V46`
- Canonical proof-source commit: `40a32e9d61a64130c958eda1498812e25a682653`
- Prior canonical anchor: `BITCODE_SPEC_V45.md`
- Prior generated proof appendix: `BITCODE_SPEC_V45_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v46-spec-family-report.json`, `.bitcode/v46-canonical-input-report.json`, `.bitcode/v46-canon-posture-drift-report.json`, V46 protocol-comprehension artifacts, `.bitcode/v46-promotion-readiness-report.json`, V46 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V46_PROVEN.md` as the generated proof appendix for V46 promotion
- Source parity state: V46 source-side protocol comprehension object model, public/operator claim boundaries, route readback, interface claim contracts, proof readback, local rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V46 file family
- Notes companion: `BITCODE_SPEC_V46_NOTES.md`
- Spec companion: `BITCODE_SPEC_V46.md`
- Parity companion: `BITCODE_SPEC_V46_PARITY_MATRIX.md`
- Scope: V46 canonical delta for protocol comprehension and public/operator explanation over promoted V45 knowledge commoditization canon
- Last fully realized canonical target preserved in source: `V45`

## Why V46 exists

V45 made Bitcode's knowledge commoditization law explicit: AssetPack is the
commodity, BTD is Need-relative weighted scalar knowledge-volume whose settled
form carries rights, BTC is settlement money, source-to-shares routes
contributor compensation, and proof-backed readback advances state. V46 exists
to make that law commercially legible across public, operator, product,
machine, and conversational surfaces without weakening source-safety or
overstating live value-bearing posture.

## Accepted V46 decisions

- V46 is active canon after promotion workflow validation.
- V46 opens as a specification-first version; Gate 1 is roadmap/spec-family
  opening only.
- V46 focuses on external protocol comprehension and launch-facing claim
  readiness before it authorizes implementation changes.
- Public docs, landing copy, `/packs`, `/read`, `/deposit`, API/MCP, ChatGPT
  App, and Bitcode Chat must explain the same protocol law with source-safe
  boundaries.
- Investor or pitch material may inform wording, but it is not protocol law
  unless reconciled into the formal V46 specification family.
- All V46 work must preserve V45's source-safe preview, BTC finality before
  source unlock, BTD rights, proof readback, repair, and value-bearing mainnet
  blocks.

## Explicitly deferred

- V46 replaces V45 after the maintained promotion workflow validates and
  advances `BITCODE_SPEC.txt`.
- Gate 8 does not authorize runtime behavior, schema changes, route changes,
  settlement behavior, proof-family artifacts, separate source-safe
  end-to-end rehearsal artifacts, value-bearing settlement, or source
  disclosure.
- Value-bearing mainnet operation remains deferred.
- Generated V46 proof appendix material is source-safe promotion evidence, not
  live operation evidence.

## Accepted Pre-Implementation Sequence

1. Open the V46 draft family over active V45 and validate draft posture.
2. Specify commercial protocol comprehension atoms in small gates.
3. Consolidate accepted atoms into the formal V46 specification family.
4. Audit implementation parity from the formal V46 family.
5. Group implementation, proof, interface, rehearsal, and documentation work
   by accepted parity gaps.
6. Close promotion readiness only after all scoped gates are green.
7. Promote V46 only through the maintained promotion workflow.

## Gate 1: V46 Commercial Protocol Comprehension Roadmap Opening

Gate 1 closes when the V46 spec family exists as draft material over active
V45, the roadmap names the V46 focus and tentative gates, the branch/check
contract is present, CI knows how to validate active V45 plus draft V46, and no
V46 file claims promoted authority.

## Gate 2: Protocol Comprehension Object Model And Claim Taxonomy

Gate 2 adds `V46ProtocolComprehensionObjectModel` as a source-safe generated
artifact at `.bitcode/v46-protocol-comprehension-object-model.json`. It
formalizes the object vocabulary and claim taxonomy that every public,
product, operator, API/MCP, ChatGPT App, Bitcode Chat, telemetry, and
investor-facing surface must use when explaining Bitcode.

Accepted Gate 2 decisions:

- AssetPack, BTD, BTC, Finding Fits, source-safe preview, quote, settlement,
  rights transfer, delivery, compensation, proof, repair, and interface claims
  are distinct comprehension objects.
- Every explanation is an `InterfaceClaim` with a category, authority source,
  disclosure boundary, required evidence class, and forbidden interpretation.
- Claim categories are `protocol-law`, `product-guidance`,
  `operator-evidence`, `investor-framing`, `telemetry-observability`,
  `preview-claim`, `quote-claim`, `settlement-claim`, `rights-claim`,
  `delivery-claim`, `compensation-claim`, and `repair-claim`.
- Claim authority is evidence-specific: generated proof, ledger readback,
  database projection, object storage root, wallet/provider receipt,
  repository delivery receipt, telemetry, interface guidance, and public
  education do not have interchangeable authority.
- Gate 2 is still specification/proof metadata work. It does not authorize
  route, API, settlement, delivery, or value-bearing mainnet behavior changes.

## Gate 3: Public Docs, Landing, And Operator Claim Boundaries

Gate 3 adds `V46PublicOperatorClaimBoundaries` as a source-safe generated
artifact at `.bitcode/v46-public-operator-claim-boundaries.json`. It binds
public docs, landing copy, README surfaces, and operator notes to Gate 2 claim
authority so launch-facing statements are readable, source-safe, and
non-overclaiming.

Accepted Gate 3 decisions:

- Public docs explain; proof readback decides.
- Landing copy may teach AssetPacks, BTD scalar volume and rights, BTC
  settlement, and product routes, but it cannot claim protocol-law authority.
- Public docs may expose route links, state labels, source-safe measurements,
  claim categories, proof roots, and compatibility redirects.
- Operator notes may name proof roots and repair commands, but must not record
  secret values, wallet private material, protected source, raw protected
  prompts, provider responses with source, or unpaid AssetPack source.
- The legacy `protocol-v26` docs route is only a compatibility alias to the
  current `/docs/protocol` article.
- Gate 3 does not authorize runtime, route-state, settlement, delivery, or
  value-bearing mainnet behavior changes.

## Gate 4: `/packs`, `/read`, And `/deposit` Comprehension UX Readback

Gate 4 adds `V46ProductRouteComprehensionReadback` as a source-safe generated
artifact at `.bitcode/v46-product-route-comprehension-readback.json`. It binds
the three product routes to Gate 2 claim authority and Gate 3 public/operator
boundaries so route UX can stay low-detail by default while preserving
expandable proof readback.

Accepted Gate 4 decisions:

- `/packs` is the searchable PackActivity master-detail readback for
  source-safe market, portfolio, settlement, compensation, delivery, repair,
  governance, and proof-root activity.
- `/read` remains the five-step Reading route: request Read, review
  synthesized Need, request Finding Fits, review source-safe AssetPack preview,
  and buy/settle.
- `/deposit` remains the five-step source-supply route: connect source,
  synthesize AssetPack options, review source-safe options, submit deposit, and
  read Depository state.
- Low-detail route summaries are allowed only when expandable source-safe
  detail preserves route-owned state, proof roots, disclosure boundaries, and
  repair blockers.
- Gate 4 does not expose protected source, unpaid AssetPack source, raw
  prompts, raw provider responses, credentials, wallet private material,
  private settlement payloads, or value-bearing mainnet authority.

## Gate 5: API/MCP, ChatGPT App, And Bitcode Chat Claim Contracts

Gate 5 adds `V46InterfaceClaimContracts` as a source-safe generated artifact
at `.bitcode/v46-interface-claim-contracts.json`. It binds public API, MCP
API, ChatGPT App, Bitcode Chat, and package-consumer surfaces to the Gate 2
`InterfaceClaim` taxonomy, Gate 3 public/operator claim boundaries, and Gate 4
product-route readback law.

Accepted Gate 5 decisions:

- The public API exposes versionless source-safe schema compatibility, proof
  roots, denied repair states, and compatibility posture without protected
  source or private payload serialization.
- MCP exposes package-owned tool contracts, permission requirements, provider
  binding blockers, write-admission posture, proof roots, queue metadata, and
  denied repair states; it does not settle BTC, transfer BTD rights, unlock
  source, or deliver source-bearing AssetPacks by itself.
- The ChatGPT App exposes package-owned Reading and delivery-adjacent action
  contracts, source-safe rendering, explicit write admission, proof roots, and
  settlement/right/delivery denied states until proof readback authorizes the
  next boundary.
- Bitcode Chat exposes route-local conversation, stream, proof-root, and
  terminal-delegated handoff metadata; it does not advance protocol state or
  create parallel state authority.
- Package consumers receive stable source-safe contracts and generated
  readback metadata, not a separate state machine or disclosure boundary.
- Gate 5 remains source-safe metadata and contract readback work. It does not
  authorize runtime behavior changes, source disclosure, settlement, delivery,
  or value-bearing mainnet behavior.

## Gate 6: Proof Readback And Source-Safe Operator Explanation

Gate 6 adds `V46ProofReadbackOperatorExplanation` as a source-safe generated
artifact at `.bitcode/v46-proof-readback-operator-explanation.json`. It binds
canonical/generated proof, execution/workflow receipts, ledger journals,
database projections, object-storage roots, telemetry streams,
wallet/provider receipts, repository delivery receipts, and
repair/reconciliation receipts into one operator-readable evidence authority
ladder.

Accepted Gate 6 decisions:

- Every evidence class answers the same operator questions: what evidence is
  this, what can it authorize, what can it not authorize, what stronger
  evidence must agree, and what repair happens on conflict.
- Proof-backed readback remains the only state advancement mechanism.
- Telemetry streams remain observability only.
- Database projections remain queryable read models, not ledger truth.
- Wallet/provider receipts prove non-custodial payment observation posture,
  not final settlement.
- Repository delivery receipts prove entitled source unlock only after
  finality, BTD rights, source-to-shares compensation, storage, and
  reconciliation agree.
- Evidence conflict fails closed into source-safe repair rather than partial
  success.
- Gate 6 remains source-safe metadata and explanation work. It does not
  authorize source disclosure, settlement, delivery, rights transfer, or
  value-bearing mainnet behavior.

## Gate 7: Local Interface Comprehension Rehearsal

Gate 7 adds `V46LocalInterfaceComprehensionRehearsal` as a source-safe
generated artifact at `.bitcode/v46-local-interface-comprehension-rehearsal.json`.
It rehearses local docs/landing, `/packs`, `/read`, `/deposit`, API/MCP,
ChatGPT App, Bitcode Chat, proof telemetry, and repair readback surfaces
against the Gate 2 through Gate 6 claim and authority artifacts.

Accepted Gate 7 decisions:

- The rehearsal is local-only and does not run value-bearing mainnet,
  live BTC finality, source-bearing delivery, or external settlement.
- Each rehearsed surface binds to Gate 2 claim ids, claim categories, and
  authority ids.
- Gate 2 through Gate 6 generated artifacts must pass before the rehearsal
  can pass.
- Public and product routes may explain source-safe state, but proof readback
  remains state authority.
- API/MCP, ChatGPT App, and Bitcode Chat remain source-safe guidance or machine
  interfaces; they cannot create parallel protocol authority.
- Proof telemetry and repair readback can show phases, steps, proof roots,
  disclosure posture, and metadata, but telemetry remains observability only.
- Gate 7 does not expose protected source, unpaid AssetPack source, prompts,
  provider responses, credentials, wallet private material, private settlement
  payloads, or private repository access.

## Gate 8: V46 Promotion Readiness

Gate 8 adds `V46PromotionReadinessReport` as a source-safe generated artifact
at `.bitcode/v46-promotion-readiness-report.json`. It binds the six accepted
V46 protocol comprehension artifacts, generated `BITCODE_SPEC_V46_PROVEN.md`
support, `v46-canon-promotion.yml`, V46 gate/canon workflow posture, and
promotion scripts support V46 before a version-promotion pull request can ask
`main` to advance from V45 to V46.

Accepted Gate 8 decisions:

- Gate 8 covers V46 promotion readiness only; it does not add runtime route,
  settlement, delivery, proof-family, value-bearing mainnet, or source
  disclosure behavior.
- The report must prove source-safe promotion metadata over Gate 2 through
  Gate 7 artifacts and generated proof outputs.
- The promotion workflow must validate pre-promotion V45-to-V46 draft before
  promotion generation and V46 active / draft V47 after generation.
- `BITCODE_SPEC_V46_PROVEN.md` is the generated proof appendix for V46
  promotion readiness, not evidence of live payment or delivery.
- `node scripts/promote-bitcode-canon.mjs --version V46 --commit HEAD --dry-run`
  must be greenable before the gate can close.

## Commit-Body Direction

V46 commit bodies should name the gate class, protocol law or interface claim
being clarified, validation command, source-safety posture, and whether the
change is specification-only, parity-only, proof-only, interface-only,
implementation, rehearsal, or promotion work.
