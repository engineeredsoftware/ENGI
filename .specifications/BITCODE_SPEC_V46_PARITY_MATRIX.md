# Bitcode Spec V46 Parity Matrix

## Status

- Version: `V46`
- V46 state: canonical promotion complete; V46 promoted parity truth, generated comprehension artifacts, local interface rehearsal, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V46`
- Canonical proof-source commit: `40a32e9d61a64130c958eda1498812e25a682653`
- Prior canonical anchor: `BITCODE_SPEC_V45.md`
- Prior generated proof appendix: `BITCODE_SPEC_V45_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v46-spec-family-report.json`, `.bitcode/v46-canonical-input-report.json`, `.bitcode/v46-canon-posture-drift-report.json`, V46 protocol-comprehension artifacts, `.bitcode/v46-promotion-readiness-report.json`, V46 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V46_PROVEN.md` as the generated proof appendix for V46 promotion
- Source parity state: V46 source-side protocol comprehension object model, public/operator claim boundaries, route readback, interface claim contracts, proof readback, local rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V46 file family
- Notes companion: `BITCODE_SPEC_V46_NOTES.md`
- Spec companion: `BITCODE_SPEC_V46.md`
- Delta companion: `BITCODE_SPEC_V46_DELTA.md`
- Scope: V46 canonical parity ledger for protocol comprehension and public/operator explanation over promoted V45 knowledge commoditization canon
- Last fully realized canonical target preserved in source: `V46`

## Purpose

This matrix records promoted V46 parity work. It records
the initial audit surface that later V46 gates must turn into source-grounded
implementation, proof, documentation, interface, and rehearsal rows. The
current authority is V46.

Draft judgment vocabulary:

- `draft-required`: V46 must specify and later audit this area.
- `implemented prerequisite`: V45 source already contains material that V46 may
  reuse or clarify, but V46 has not yet audited it for closure.
- `accepted boundary`: V45 law remains active and must not be weakened.
- `pending`: V46 has not yet accepted a parity or implementation gate.

## Audit basis

Gate 1 audit inputs are `BITCODE_SPEC.txt`, `BITCODE_SPEC_V45.md`,
`BITCODE_SPEC_V45_DELTA.md`, `BITCODE_SPEC_V45_NOTES.md`,
`BITCODE_SPEC_V45_PARITY_MATRIX.md`, `BITCODE_SPEC_V45_PROVEN.md`,
`BITCODE_SPEC_V46.md`, `BITCODE_SPEC_V46_DELTA.md`,
`BITCODE_SPEC_V46_NOTES.md`, this draft parity matrix, `SPECIFICATIONS_ROADMAP.md`,
branch/workflow rules, and the existing product surfaces named by V45:
`/deposit`, `/read`, `/packs`, API/MCP, ChatGPT App, Bitcode Chat, public docs,
landing page, proof roots, ledger/database/storage readback, wallet/provider
receipts, and repository delivery receipts.

## Source Evidence Map

Gate 1 does not claim source closure. Later V46 parity gates must inspect the
source files and generated artifacts that implement or explain each row.

| Evidence area | Current source evidence | Audit reading |
| --- | --- | --- |
| Active canon posture | `BITCODE_SPEC.txt`, `BITCODE_SPEC_V45.md`, `BITCODE_SPEC_V45_PROVEN.md`, spec-family and canon-posture checkers | V46 is active canon; V45 is the prior promoted anchor. |
| Product routes | `/deposit`, `/read`, `/packs`, and `/exchange` compatibility redirect | V46 must make route claims commercially legible without source leakage or stale Exchange-first framing. |
| Reading and deposit pipelines | Reading, Finding Fits, AssetPack preview, settlement, deposit option, and admission packages named by V45 | V46 may clarify comprehension and claim boundaries, but implementation parity is pending. |
| Interfaces | API/MCP, ChatGPT App, Bitcode Chat, package consumers, public docs, and landing page | V46 must decide which statements are protocol-authoritative and how each surface exposes proof readback. |
| Proof and operations | Generated proof appendices, `.bitcode` artifacts, workflows, ledger/database/storage readback, wallet/provider receipts, repository receipts | V46 must keep proof-backed state advancement clear to non-operator readers. |

## V46 Implementation Matrix

| Area | Required V46 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Commercial protocol comprehension | Explain Bitcode as knowledge commoditization without reducing BTD to a read-right or AssetPack to raw source | closed | V45 law is precise but launch-facing surfaces need a shared claim taxonomy and readback language. | Gate 2 |
| Claim taxonomy | Separate protocol law, product guidance, operator evidence, investor framing, telemetry, preview, quote, settlement, rights, delivery, compensation, and repair claims | closed | Gate 2 owns package-backed `V46ProtocolComprehensionObjectModel`, deterministic `.bitcode/v46-protocol-comprehension-object-model.json`, object rows, claim rows, evidence-specific authority ids, disclosure boundary ids, forbidden claim collapse ids, source-safe generated artifact freshness, protocol tests, docs, and workflow wiring. | Gate 2 |
| Public and operator docs | Public docs, landing copy, README/operator docs, and route help stay accurate, source-safe, and non-overclaiming | closed | Gate 3 owns package-backed `V46PublicOperatorClaimBoundaries`, deterministic `.bitcode/v46-public-operator-claim-boundaries.json`, public docs, landing, operator docs, README anchors, protocol docs compatibility alias, forbidden overclaim scans, source-safety exclusions, focused tests, package exports, and workflow wiring. | Gate 3 |
| Product route comprehension | `/packs`, `/read`, and `/deposit` expose low-detail default UX with expandable proof and consistent commercial terms | closed | Gate 4 owns package-backed `V46ProductRouteComprehensionReadback`, deterministic `.bitcode/v46-product-route-comprehension-readback.json`, route ids, route paths, low-detail defaults, route-owned state, Packs search/filter/sort, Reading five-step readback, Depositing five-step readback, source-safe proof detail, package exports, focused tests, and workflow wiring. | Gate 4 |
| Machine and conversation interfaces | API/MCP, ChatGPT App, Bitcode Chat, and package consumers expose the same claim boundaries as website routes | closed | Gate 5 owns package-backed `V46InterfaceClaimContracts`, deterministic `.bitcode/v46-interface-claim-contracts.json`, public API schema compatibility, MCP tool contracts, ChatGPT App action contracts, Bitcode Chat conversation/stream/handoff contracts, package-consumer read contracts, proof-root projection, denied-state repair, source-safe disclosure exclusions, focused tests, and workflow wiring. | Gate 5 |
| Proof readback explanation | Users and operators can understand why proof, ledger, database, storage, wallet/provider, and repository receipts have different authority | closed | Gate 6 owns package-backed `V46ProofReadbackOperatorExplanation`, deterministic `.bitcode/v46-proof-readback-operator-explanation.json`, canonical/generated proof rows, execution/workflow receipt rows, ledger journal rows, database projection rows, object-storage root rows, telemetry stream rows, wallet/provider receipt rows, repository delivery receipt rows, repair/reconciliation rows, source-safe operator explanation, focused tests, and workflow wiring. | Gate 6 |
| Local interface rehearsal | A source-safe local rehearsal verifies docs/routes/interfaces explain the protocol without exposing unpaid source | closed | Gate 7 owns package-backed `V46LocalInterfaceComprehensionRehearsal`, deterministic `.bitcode/v46-local-interface-comprehension-rehearsal.json`, local docs/landing, `/packs`, `/read`, `/deposit`, API/MCP, ChatGPT App, Bitcode Chat, proof telemetry, repair readback rows, prior V46 artifact pass checks, source-safe disclosure exclusions, focused tests, package exports, and workflow wiring. | Gate 7 |
| Promotion readiness | V46 can promote only after all accepted comprehension, parity, proof, interface, rehearsal, and source-safety gates close | closed | Gate 8 owns `V46PromotionReadinessReport`, `.bitcode/v46-promotion-readiness-report.json`, `BITCODE_SPEC_V46_PROVEN.md`, V46 promotion script support, `v46-canon-promotion.yml`, shared gate/canon workflow posture, package exports, source-safe generated artifact freshness, focused tests, and V46 active / draft V47 runtime preparation. | Gate 8 |

## V46 Implementation Checklist

| Area | Required V46 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Active pointer truth | `BITCODE_SPEC.txt` points to V46 after promotion | closed | Gate 1 preserved pre-promotion posture; promotion now records active V46 posture. | Gate 1 |
| Draft files | V46 SPEC, DELTA, NOTES, and PARITY files exist and name draft posture | closed | Gate 1 creates and validates the draft family. | Gate 1 |
| CI posture | Gate and canon workflows validate active V45 plus draft V46 when V46 files exist | closed | Gate 1 wires the checker into workflows. | Gate 1 |
| Source safety | No V46 explanatory surface may expose protected source, unpaid AssetPack source, raw prompts, raw responses, credentials, or wallet-private material | closed | V45 source-safety law remains binding. | Gate 2+ |
| Value-bearing mainnet | V46 launch comprehension work must not imply value-bearing mainnet authority | closed | V45 value-bearing mainnet block remains binding. | Gate 2+ |
| Implementation scope | Runtime work begins only after formal specification and parity gates authorize it | closed | Gate 1 is roadmap/spec/checking only. | Gate 4+ |
| Protocol comprehension object model | V46 explanation surfaces share object ids, claim categories, claim authority ids, disclosure boundaries, and forbidden interpretation ids | closed | `V46ProtocolComprehensionObjectModel` binds AssetPack, BTD, BTC, preview, quote, settlement, rights, delivery, compensation, proof, repair, and InterfaceClaim rows without source-bearing payloads. | Gate 2 |
| Public/operator claim-boundary artifact | Public and operator surfaces expose only source-safe guidance and proof posture while avoiding stale vocabulary and overclaims | closed | `V46PublicOperatorClaimBoundaries` binds landing, docs home, docs content, docs protocol page, operator README, root README, package README, and V46 spec-family rows to required copy anchors, claim authorities, forbidden overclaim scans, and `.bitcode/v46-public-operator-claim-boundaries.json`. | Gate 3 |
| Product route comprehension readback artifact | `/packs`, `/read`, and `/deposit` expose route-specific source-safe readback without collapsing preview, quote, finality, delivery, compensation, or repair claims | closed | `V46ProductRouteComprehensionReadback` binds route rows to claim ids, authority ids, required copy anchors, low-detail defaults, expandable proof readback, route-owned state, no-source/no-secret checks, and `.bitcode/v46-product-route-comprehension-readback.json`. | Gate 4 |
| Interface claim contracts artifact | API/MCP, ChatGPT App, Bitcode Chat, and package consumers expose source-safe contracts without parallel state authority | closed | `V46InterfaceClaimContracts` binds public API, MCP API, ChatGPT App, Bitcode Chat, and package-consumer rows to claim ids, category ids, authority ids, capability ids, source roots, proof-root projection, denied-state repair, no-source/no-secret checks, and `.bitcode/v46-interface-claim-contracts.json`. | Gate 5 |
| Proof readback operator explanation artifact | Proof, ledger, database, storage, wallet/provider, repository, telemetry, execution, and repair evidence classes remain distinct and source-safe | closed | `V46ProofReadbackOperatorExplanation` binds all evidence class ids to Gate 2 authority ids, required operator questions, stronger evidence requirements, conflict behavior, fail-closed repair states, no-source/no-secret checks, and `.bitcode/v46-proof-readback-operator-explanation.json`. | Gate 6 |
| Local interface comprehension rehearsal artifact | Local docs, product routes, machine interfaces, conversation surfaces, proof telemetry, and repair readback rehearse V46 comprehension without external state authority | closed | `V46LocalInterfaceComprehensionRehearsal` binds local surface ids to Gate 2 claim ids, claim categories, authority ids, source roots, copy anchors, prior V46 artifact pass checks, no-source/no-secret checks, and `.bitcode/v46-local-interface-comprehension-rehearsal.json`. | Gate 7 |
| Gate 8 implementation readback | Promotion readiness has source-backed package, generated, workflow, documentation, and promotion-script evidence | closed | `V46PromotionReadinessReport` binds the six accepted V46 comprehension artifacts, `.bitcode/v46-promotion-readiness-report.json`, `BITCODE_SPEC_V46_PROVEN.md`, `check:v46-gate8`, V46 promotion workflow support, V46 promotion dry-run support, and source-safe post-promotion `V46 active / draft V47` posture. | Gate 8 |

## Grouped Closure Gates

The V46 draft-opening plan groups work into eight provisional gates:

1. Commercial Protocol Comprehension Roadmap Opening.
2. Protocol Comprehension Object Model And Claim Taxonomy.
3. Public Docs, Landing, And Operator Claim Boundaries.
4. `/packs`, `/read`, And `/deposit` Comprehension UX Readback.
5. API/MCP, ChatGPT App, And Bitcode Chat Claim Contracts.
6. Proof Readback And Source-Safe Operator Explanation.
7. Local Interface Comprehension Rehearsal.
8. Promotion Readiness And Canonical Promotion.

Later V46 gates may split these rows if specification work reveals a safer or
more maintainable closure order.

## Accepted boundaries

- V46 is active canon after promotion workflow validation.
- Gate 1 does not authorize runtime behavior changes.
- V46 public or product comprehension may simplify language but must not
  simplify protocol law.
- AssetPack remains the commodity, BTD remains Need-relative scalar
  knowledge-volume and settled rights, BTC remains settlement money, and proof
  readback remains state authority.
- Source-safe preview is not source disclosure; quote is not payment; payment
  observation is not finality; database projection is not ledger truth when it
  conflicts with stronger readback.

## Current completion condition

V46 Gate 8 is complete when `V46PromotionReadinessReport`,
`.bitcode/v46-promotion-readiness-report.json`, `BITCODE_SPEC_V46_PROVEN.md`,
`v46-canon-promotion.yml`, V46 promotion scripts, gate/canon workflows,
package exports, focused tests, source-safe generated artifact freshness,
`check:v46-gate8`, and
`node scripts/promote-bitcode-canon.mjs --version V46 --commit HEAD --dry-run`
validated pre-promotion V46 draft posture, prepare V46 active / draft V47 posture, and
the gate branch is committed, pushed, and pull-requested into `version/v46`.

Historical Gate 7 completion condition: V46 Gate 7 is complete when `V46LocalInterfaceComprehensionRehearsal`,
`.bitcode/v46-local-interface-comprehension-rehearsal.json`, docs/landing,
`/packs`, `/read`, `/deposit`, API/MCP, ChatGPT App, Bitcode Chat, proof
telemetry, repair readback rows, prior V46 artifact pass checks, package
exports, workflow checks, focused tests, and `check:v46-gate7` validate active
V45 plus draft V46 and the gate branch is committed, pushed, and pull-requested
into `version/v46`.

Historical Gate 6 completion condition: V46 Gate 6 is complete when `V46ProofReadbackOperatorExplanation`, `.bitcode/v46-proof-readback-operator-explanation.json`, proof/ledger/database/storage/wallet/provider/repository/telemetry/execution/repair evidence authority anchors, package exports, workflow checks, focused tests, and `check:v46-gate6` validated pre-promotion V46 draft posture and the gate branch is committed, pushed, and pull-requested into `version/v46`.

Historical Gate 5 completion condition: V46 Gate 5 is complete when `V46InterfaceClaimContracts`, `.bitcode/v46-interface-claim-contracts.json`, public API, MCP API, ChatGPT App, Bitcode Chat, and package-consumer claim contract anchors, package exports, workflow checks, focused tests, and `check:v46-gate5` validated pre-promotion V46 draft posture and the gate branch is committed, pushed, and pull-requested into `version/v46`.

Historical Gate 4 completion condition: V46 Gate 4 is complete when `V46ProductRouteComprehensionReadback`, `.bitcode/v46-product-route-comprehension-readback.json`, `/packs`, `/read`, and `/deposit` route readback anchors, package exports, workflow checks, focused tests, and `check:v46-gate4` validated pre-promotion V46 draft posture and the gate branch is committed, pushed, and pull-requested into `version/v46`.

Historical Gate 3 completion condition: V46 Gate 3 is complete when `V46PublicOperatorClaimBoundaries`, `.bitcode/v46-public-operator-claim-boundaries.json`, public docs, landing copy, operator docs, README anchors, route compatibility docs, package exports, workflow checks, focused tests, and `check:v46-gate3` validated pre-promotion V46 draft posture and the gate branch is committed, pushed, and pull-requested into `version/v46`.

Historical Gate 1 completion condition: V46 Gate 1 is complete when the V46 draft spec family, roadmap, package script, Gate 1 checker, and CI workflow hooks validated pre-promotion V46 draft posture and the gate branch is committed, pushed, and pull-requested into `version/v46`.
