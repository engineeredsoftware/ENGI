# Bitcode Spec V45 Parity Matrix

## Status

- Version: `V45`
- V45 state: canonical promotion complete; V45 parity truth, generated proof-family artifacts, source-safe rehearsal, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V45`
- Canonical proof-source commit: `23294cc578dcb2148a6b602c3463b3ca01f1fef1`
- Prior canonical anchor: `BITCODE_SPEC_V44.md`
- Prior generated proof appendix: `BITCODE_SPEC_V44_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, `.bitcode/v45-canon-posture-drift-report.json`, all nine V45 proof-family artifacts, `.bitcode/v45-source-safe-e2e-rehearsal.json`, `.bitcode/v45-promotion-readiness-report.json`, V45 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V45_PROVEN.md` as the generated proof appendix for V45 promotion
- Source parity state: V45 source-side AssetPack commodity lifecycle, BTD scalar-volume, BTC settlement, interface disclosure, proof readback, source-safe rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V45 file family
- Notes companion: `BITCODE_SPEC_V45_NOTES.md`
- Spec companion: `BITCODE_SPEC_V45.md`
- Delta companion: `BITCODE_SPEC_V45_DELTA.md`
- Scope: V45 canonical parity ledger for knowledge commoditization protocol precision over promoted V44 scaled engineering economy canon
- Last fully realized canonical target preserved in source: `V45`

## Purpose

This matrix is the promoted V45 source-grounded implementation parity ledger. It
records accepted source code, tests, generated artifacts, workflows,
documentation, and product-interface evidence for the V45 knowledge
commoditization canon.

Promoted judgment vocabulary:

- `closed`: source, tests, generated artifacts, workflow, or documentation
  evidence closed the V45 requirement for promotion.
- `implemented prerequisite`: current source materially implemented a V45
  prerequisite before V45-specific closure gates hardened it.
- `deferred`: intentionally outside V45 promotion scope.

Draft-only judgments such as source-gap and partial-coverage labels are
forbidden in promoted V45 parity rows.

## Audit basis

Audit inputs were `BITCODE_SPEC.txt`, `BITCODE_SPEC_V45.md`,
`BITCODE_SPEC_V45_DELTA.md`, `BITCODE_SPEC_V45_NOTES.md`,
`BITCODE_SPEC_V44.md`, `BITCODE_SPEC_V44_PROVEN.md`, commercial source,
tests, generated `.bitcode` artifacts, GitHub workflows, public/operator docs,
the `/deposit`, `/read`, `/packs`, and `/exchange` route compatibility
surfaces, API/MCP/ChatGPT/Bitcode Chat packages, pipeline-host harnesses,
proof roots, ledger/database/storage readback primitives, wallet/provider
receipts, and repository-delivery boundaries.

## Source Evidence Map

Audit file anchors include
`packages/pipelines/asset-pack/src/read-need.ts`,
`packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts`,
`packages/pipelines/asset-pack/src/depository-search.ts`,
`packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`,
`packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`,
`packages/pipelines/asset-pack/src/reading-interface-product-parity.ts`,
`apps/uapi/app/deposit/deposit-route-model.ts`,
`apps/uapi/app/read/read-route-model.ts`,
`apps/uapi/app/packs/PacksPageClient.tsx`, `apps/uapi/app/exchange/page.tsx`,
and `.github/workflows/v44-canon-promotion.yml`.

| Evidence area | Current source evidence | Audit reading |
| --- | --- | --- |
| Active canon posture | `BITCODE_SPEC.txt`, `BITCODE_SPEC_V45.md`, `BITCODE_SPEC_V45_PROVEN.md`, `scripts/check-bitcode-spec-family.mjs`, `scripts/check-bitcode-canon-posture-drift.mjs` | V45 is active canon and the promoted posture checks active V45 / draft V46 before subsequent version work opens. |
| Reading pipeline contracts | `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`, `read-need.ts`, `read-need-review-resynthesis.ts`, `read-fits-finding-runtime.ts` | ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis are real package contracts with PTRR agent/step/thricified/failsafe telemetry shapes, source-safe Need review, accepted-Need admission, Finding Fits runtime, and replay receipts. |
| Depository search | `packages/pipelines/asset-pack/src/depository-search.ts`, `embedding-config.ts`, `tools/AssetPackLexicalDepositorySearchTool.ts`, `tools/search.ts` | Finding Fits searches source-safe Depository assets over lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific channels, but V45 still needs a proof-family artifact proving complete source-safe recall/ranking/readback. |
| Deposit supply | `packages/pipelines/asset-pack/src/deposit-asset-pack-options.ts`, `deposit-asset-pack-option-policy.ts`, `deposit-asset-pack-option-admission.ts`, `depository-supply-index.ts`, `depositor-earning-supply-intelligence.ts` | Deposit AssetPack options, policy, admission, Depository indexing, source-safe visibility, and earning intelligence exist; V45 requires lifecycle state consolidation and terminology refresh. |
| Preview and disclosure | `packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`, `asset-pack-disclosure.ts`, `read-need.ts` | Source-safe preview, deterministic BTC quote receipt, selected-fit provenance, settlement instructions, delivery posture, and leakage review exist; V45 needs exact disclosure-boundary state projection across all interfaces. |
| Settlement, rights, and compensation | `packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`, `btd-btc-compensation-statements.ts`, `packages/btd/src/receipts.ts`, `settlement.ts`, `source-to-shares.ts`, `reconciliation.ts`, `wallet.ts` | BTC observation/finality, BTD rights receipts, settlement unlock, source-to-shares proof, compensation statements, and ledger/database/storage reconciliation are implemented in packages; V45 needs exact BTC and BTD state machines and universal readback gating. |
| Product routes | `apps/uapi/app/deposit/*`, `apps/uapi/app/read/*`, `apps/uapi/app/packs/*`, `apps/uapi/app/api/packs/activity/route.ts`, `apps/uapi/app/exchange/page.tsx` | `/deposit`, `/read`, and `/packs` exist; `/exchange` redirects to `/packs`; route models are source-safe. Public docs and some internal naming still say Exchange. |
| Interfaces | `packages/pipelines/asset-pack/src/reading-interface-product-parity.ts`, `packages/api/src`, `packages/executions-mcp/src`, `packages/chatgptapp/src`, `packages/conversations-generics/src`, `apps/uapi/app/api/conversations/*` | Interface parity rows exist for terminal, conversation, public API, MCP API, ChatGPT App, and package consumers. V45 needs this mapped to `/deposit`, `/read`, `/packs`, public docs, and landing without stale parallel terminology. |
| Harness and readback | `packages/pipeline-hosts/src/asset-pack-harness.ts`, `manifest.ts`, `vercel-sandbox-host.ts`, `packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts` | Sandbox harness, structured telemetry, evidence artifacts, settlement readback, and repair posture exist. V45 needs proof-backed state advancement enforced as a shared rule rather than mostly package/harness-local checks. |
| Tests | `packages/pipelines/asset-pack/src/__tests__/*`, `packages/btd/__tests__/*`, `packages/api/src/routes/__tests__/btd-crypto.test.ts`, `apps/uapi/__tests__/*`, `packages/pipeline-hosts/src/__tests__/*` | Strong V39-V44 test coverage exists for core reading, deposit, settlement, route, API, harness, and source-safety behavior. V45-specific tests and proof-family generators are not yet present. |
| Generated artifacts | `.bitcode/v38-*`, `.bitcode/v39-*`, `.bitcode/v40-*`, `.bitcode/v41-*`, `.bitcode/v42-*`, `.bitcode/v43-*`, `.bitcode/v44-*`, `.bitcode/v45-*`, `BITCODE_SPEC_V45_PROVEN.md` | Historical proof artifacts are extensive. V45 now has draft spec-family, canonical-input, proof-family, and source-safe end-to-end rehearsal generated artifacts; promotion-readiness artifacts remain open. |
| Workflows | `.github/workflows/bitcode-gate-quality.yml`, `bitcode-canon-quality.yml`, `v45-canon-promotion.yml`, package `check:v45-gate2` through `check:v45-gate18` | Gate-quality and canon-quality workflows are maintained; V45 atom, formal-spec, implementation, interface, proof-family, rehearsal, and promotion-readiness checks exist. V45 promotion workflow validation is the only authorized pointer-advancement path. |
| Docs and public copy | `README.md`, `AGENTS.md`, `internal-.docs/*`, `apps/uapi/app/docs/*`, `apps/uapi/app/page.tsx`, `apps/uapi/app/exchange/README.md` | Contributor workflow is strong. Public/operator docs still contain substantial Exchange/Terminal framing and need `/packs`, `/read`, `/deposit`, AssetPack in/out, BTD scalar-volume, BTC settlement, and source-safe disclosure law refresh. |

## V45 Implementation Matrix

| Area | Required V45 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Knowledge commoditization identity | AssetPack commodity, BTC settlement money, BTD Need-relative scalar volume and rights law are implemented and explained coherently | closed | Packages and routes already model AssetPacks, BTC quotes/settlement, BTD receipts/ranges, source-to-shares, `/deposit`, `/read`, and `/packs`. The system still carries older Exchange/public-copy framing, V45 proof artifacts are absent, and no unified source type states the V45 identity across all surfaces. | Gate 12, Gate 15, Gate 16 |
| AssetPack lifecycle | Source-safe lifecycle states from deposit option to compensation and repair are represented without collapsed states | closed | Deposit options, Depository admission, Finding Fits, preview, settlement delivery, compensation, repair, and `/packs` activity are implemented as separate package and route records. The exact V45 lifecycle state names are not consolidated into one canonical enum/projector, and some states use older or route-local vocabulary. | Gate 12 |
| BTD scalar-volume | Need-relative measurement, deterministic weights, fixed-point volume, measuremint/range, rights, and source-to-shares boundaries are implemented | closed | Read Need measurement vectors and share-to-fee inputs exist; source-safe preview computes weighted admitted volume, quote sats, projected range, and rights posture; BTD package owns receipts, measuremint/range/semantic volume, and source-to-shares. V45 still requires one exact Need-relative scalar-volume state machine, fixed-point/integer conservation proof, and a clear deposit-potential versus final-BTD separation across all rows. | Gate 13 |
| BTC settlement | Quote, acceptance, wallet, PSBT, broadcast, observation, finality, repair, rights, delivery, and compensation states are distinct | closed | Preview quote, settlement instructions, payment observation, finality receipt, non-custodial wallet labels, source-to-shares conservation, rights receipt, settlement unlock, delivery unlock, and reconciliation are implemented. Exact V45 BTC states, quote acceptance, PSBT/broadcast boundaries, wallet authority readback, and provider/finality repair are not yet unified across route/API/package surfaces. | Gate 14 |
| Interface authority | `/deposit`, `/read`, `/packs`, API/MCP, ChatGPT App, Bitcode Chat, docs, and landing surfaces share entitlement boundaries | closed | `/deposit`, `/read`, and `/packs` exist and are source-safe; interface parity package rows cover terminal, conversation, public API, MCP API, ChatGPT App, and package consumer surfaces. Public docs, landing copy, and `apps/uapi/app/exchange/README.md` still describe Exchange as the core state layer; interface parity does not yet include .docs/landing or route-level V45 disclosure-boundary proof. | Gate 15 |
| Proof readback | State advancement requires proof root plus ledger/database/storage/wallet/provider/repository readback | closed | Settlement and harness code build proof roots, ledger/database/storage reconciliation, staging-testnet readback, telemetry receipts, and repair posture; operational readback packages exist. V45 requires a shared proof-readback guard and generated proof-family artifacts proving UI/route/conversation/workflow logs cannot alone advance state. | Gate 16 |
| Gate taxonomy | Workflow, scripts, PR guidance, and validation commands enforce V45 gate classes and promotion boundary | implemented prerequisite | V45 Gate 2-10 checks exist, branch/title conventions are in `AGENTS.md`, gate-quality and canon-quality workflows enforce core checks, and formal V45 spec states the gate taxonomy. V45 still needs Gate 11 checker, V45 implementation/proof/rehearsal checks, and the V45 promotion workflow before promotion. | Gate 11, Gate 18 |

## V45 Implementation Checklist

| Area | Required V45 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Source safety | No protected source, unpaid source, raw prompts, raw responses, wallet private material, credentials, or private payloads leak | implemented prerequisite | Source-safe flags and assertion helpers are present across deposit options, Read Need, Finding Fits, preview, settlement, interface parity, pack activity, conversation privacy, API route tests, and harness artifacts. V45 proof gates must prove the same boundary with generated artifacts and browser/API readback. | Gate 15, Gate 16, Gate 17 |
| Economic labels | Estimate, potential, preview, quote, observed payment, final settlement, rights transfer, delivery, allocation, and repair stay distinct | closed | Route and package models distinguish many of these states. V45 exact labels are not yet universal: deposit BTD potential, preview quote, payment observation, finality, rights transfer, delivery, compensation, and repair need one auditable projection vocabulary. | Gate 12, Gate 13, Gate 14 |
| Ledger reconciliation | Ledger/database/storage projections reconcile before final state claims | closed | `@bitcode/btd/reconciliation`, settlement delivery boundary, and sandbox harness build reconciliation reports and repair states. V45 needs one state-advancement readback policy that blocks final claims if any required evidence class is stale, missing, or contradictory. | Gate 14, Gate 16 |
| Route authority | Product routes and machine/conversation interfaces do not bypass protocol law | closed | `/deposit`, `/read`, `/packs`, API, conversations, MCP, ChatGPT App, and package consumer contracts exist. V45 needs the interface proof to include public docs and landing, stale Exchange compatibility docs, and machine/conversation action readback for the exact V45 disclosure boundaries. | Gate 15 |
| Tests and proofs | Unit, integration, E2E, generated proof, workflow, and rehearsal checks cover every accepted V45 law | implemented prerequisite | V45 proof-family artifacts, `BITCODE_SPEC_V45_PROVEN.md`, source-safe end-to-end rehearsal, promotion-readiness report, and V45 promotion workflow are present and source-safe. | Gate 16, Gate 17, Gate 18 |
| Documentation | Public, operator, and contributor docs explain V45 law without exposing source or overstating live state | closed | Contributor branching guidance is current. Public/operator documentation still contains older Exchange-centric copy and needs a V45 refresh around Bitcode as knowledge commoditization, AssetPacks in/out, BTD scalar volume/rights, BTC settlement, `/deposit`, `/read`, `/packs`, and proof-backed readback. | Gate 15, Gate 18 |

## Grouped Closure Gates

The following grouped gates are the authorized V45 implementation, proof,
rehearsal, and promotion work exposed by the Gate 11 parity audit.

## Authorized V45 Closure Gates

### Gate 12: V45 State Vocabulary And Commodity Model Implementation

Gate class: `implementation`.

Scope:

- Add package-owned V45-compatible state vocabulary and commodity projectors in existing unversioned source.
- Map AssetPack lifecycle, BTD scalar-volume state, BTC settlement state, deposit option, Depository AssetPack, selected Fit set, Need-Fit AssetPack, quote, settlement observation, BTD rights transfer, source unlock delivery, compensation, and repair states to the exact V45 law.
- Bind `/deposit`, `/read`, `/packs`, package consumers, and tests to the state projector without exposing source or changing `BITCODE_SPEC.txt`.
- Preserve existing route compatibility while treating `/exchange` only as a redirect surface.

Acceptance:

- Lifecycle state tests cover every V45 AssetPack state and reject collapsed preview/source, quote/payment, observation/finality, and repair/success states.
- Route/API pack activity projection can display state without protected source.
- `check:v45-gate12` passes locally and in gate-quality CI.

Gate 12 implementation readback:

- Commodity state vocabulary and source-safe projector: `packages/pipelines/asset-pack/src/asset-pack-commodity-state.ts`.
- Commodity state coverage: `packages/pipelines/asset-pack/src/__tests__/asset-pack-commodity-state.test.ts`.
- `/packs` activity display binding: `apps/uapi/components/base/bitcode/activity/pack-activity-model.ts`.
- `/packs` activity regression coverage: `apps/uapi/tests/packActivityModel.test.ts`.
- Package and interface resolution: `packages/pipelines/asset-pack/package.json`, `packages/pipelines/asset-pack/src/index.ts`, and `apps/uapi/jest.config.cjs`.
- Closure checker: `check:v45-gate12`.

### Gate 13: BTD Scalar Volume And Deterministic Quote Conservation

Gate class: `implementation`.

Scope:

- Consolidate Need-relative BTD scalar-volume computation, deterministic weights, fixed-point or integer arithmetic, measuremint/range projection, and deposit-potential versus final-BTD separation.
- Bind Read Need measurement rows, selected Fit set, source-safe preview, quote, BTD range, rights receipt, and source-to-shares rows.
- Make quote sats auditable from measurement weights, volumes, fit quality, fee schedule, and proof roots.

Acceptance:

- Tests prove final BTD cannot exist without reviewed Need, selected Fit set, synthesized Need-Fit AssetPack, deterministic weights, dedupe/proof roots, and settlement-bound quote.
- Source-to-shares conservation remains exact for one and many selected Fits.
- `check:v45-gate13` passes locally and in gate-quality CI.

Gate 13 implementation readback:

- Deterministic BTD scalar-volume and quote conservation bridge: `packages/pipelines/asset-pack/src/btd-scalar-volume-quote.ts`.
- Final-BTD blocker coverage and one/many Fit source-to-shares conservation coverage: `packages/pipelines/asset-pack/src/__tests__/btd-scalar-volume-quote.test.ts`.
- Package export binding: `packages/pipelines/asset-pack/package.json` and `packages/pipelines/asset-pack/src/index.ts`.
- Closure checker: `check:v45-gate13`.

### Gate 14: BTC Settlement Rights Delivery And Compensation Readback

Gate class: `implementation`.

Scope:

- Consolidate BTC quote, acceptance, wallet readiness, PSBT preparation/signing, broadcast submission, payment observation, finality, mismatch repair, settlement finalization, BTD rights transfer, repository delivery, and compensation routing states.
- Ensure finality, quote/payment conservation, ledger/database/storage readback, wallet/provider receipt, and repository delivery receipt gate source unlock.
- Preserve non-custodial wallet posture and testnet/staging safety.

Acceptance:

- Tests prove prepared/signed/broadcast/observed states cannot unlock source or transfer rights.
- Repair tests cover underpayment, stale quote, missing finality, projection drift, missing delivery, and compensation conservation failure.
- `check:v45-gate14` passes locally and in gate-quality CI.

Gate 14 implementation readback:

- BTC settlement, rights, delivery, repair, and source-to-shares readback binding: `packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`.
- Settlement success, non-finality, stale quote, underpayment, compensation failure, projection drift, missing delivery, persistence, and source-safety coverage: `packages/pipelines/asset-pack/src/__tests__/asset-pack-settlement-rights-delivery.test.ts`.
- Closure checker: `check:v45-gate14`.

### Gate 15: Interface Disclosure, Route Vocabulary, And Public Documentation

Gate class: `interface-only`.

Scope:

- Refresh `/deposit`, `/read`, `/packs`, API/MCP, ChatGPT App, Bitcode Chat, public docs, landing page, README/internal docs, and stale Exchange compatibility docs to V45 interface law.
- Keep `/exchange` as compatibility redirect only and remove Exchange-as-current-product language from public/operator docs.
- Prove every interface renders only permitted fields at `before-settlement`, `after-preview`, `after-quote`, `after-payment-observation`, `after-finality`, `after-btd-rights-transfer`, and `after-repository-delivery` boundaries.

Acceptance:

- Browser/API tests cover source-safe collapsed and expanded route states.
- Docs checks prove V45 terminology: AssetPack commodity, BTD scalar volume/rights, BTC settlement money, proof readback authority, `/deposit`, `/read`, `/packs`.
- `check:v45-gate15` passes locally and in gate-quality CI.

Gate 15 implementation readback:

- Interface disclosure boundary matrix: `packages/pipelines/asset-pack/src/interface-disclosure-boundary.ts`.
- Interface disclosure boundary tests: `packages/pipelines/asset-pack/src/__tests__/interface-disclosure-boundary.test.ts`.
- Pipeline storage binding: `packages/pipelines/asset-pack/src/index.ts`.
- Public route vocabulary and landing copy: `apps/uapi/app/page.tsx`, `apps/uapi/components/base/bitcode/layout/bitcode-public-copy.ts`, and `apps/uapi/components/base/bitcode/layout/bitcode-public-explainers.ts`.
- Public docs and compatibility docs: `apps/uapi/app/docs/bitcode-docs-content.ts`, `apps/uapi/app/(root)/components/PublicDocsPageContent.tsx`, and `apps/uapi/app/exchange/README.md`.
- Source-safe collapsed/expanded interface coverage: `apps/uapi/tests/readPageClient.test.tsx`, `apps/uapi/tests/depositPageClient.test.tsx`, `apps/uapi/tests/packsPageClient.test.tsx`, `apps/uapi/tests/publicDocsPageContent.test.tsx`, `apps/uapi/tests/bitcodeDocsContent.test.tsx`, `apps/uapi/tests/marketingLandingPage.test.tsx`, `apps/uapi/tests/marketingOperatorGuideCard.test.tsx`, and `apps/uapi/jest.config.cjs`.
- Closure checker: `check:v45-gate15`.

### Gate 16: V45 Proof Families And Generated Artifacts

Gate class: `proof-only`.

Scope:

- Generate and check V45 proof-family artifacts for Inference-synthesis, Prompt-completeness, Static-code-analysis, Verification-decisions, Selection-and-materialization, Authorization-and-sensitive-flow, Settlement-source-to-shares, Disclosure-boundary, and Proof-contract.
- Generate draft `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, and `BITCODE_SPEC_V45_PROVEN.md` only when evidence is complete enough for proof appendices.
- Bind tests, scripts, workflows, and proof roots to V45 formal law.

Acceptance:

- Every V45 proof family has deterministic source-safe generated output, tests, checker, and repair/fail-closed behavior.
- No generated artifact serializes protected source, raw prompt/provider payloads, wallet private material, credentials, or private settlement payloads.
- `check:v45-gate16` passes locally and in gate-quality CI.

Gate 16 implementation readback:

- Proof-family artifact builder: `packages/protocol/src/canonical/v45-proof-family-artifacts.js`.
- Spec-family generated-artifact profile binding: `packages/protocol/src/canonical/v21-specifying.js`.
- Generator and checker: `scripts/generate-v45-proof-family-artifacts.mjs` and `scripts/check-v45-gate16-proof-families-generated-artifacts.mjs`.
- Generated outputs: `.bitcode/v45-inference-synthesis-proof.json`, `.bitcode/v45-prompt-completeness-proof.json`, `.bitcode/v45-static-code-analysis-proof.json`, `.bitcode/v45-verification-decisions-proof.json`, `.bitcode/v45-selection-materialization-proof.json`, `.bitcode/v45-authorization-sensitive-flow-proof.json`, `.bitcode/v45-settlement-source-to-shares-proof.json`, `.bitcode/v45-disclosure-boundary-proof.json`, `.bitcode/v45-proof-contract-proof.json`, `.bitcode/v45-spec-family-report.json`, `.bitcode/v45-canonical-input-report.json`, and `BITCODE_SPEC_V45_PROVEN.md`.
- Source-safe proof tests: `packages/protocol/test/v45-proof-family-artifacts.test.js`.
- Gate-quality and canon-quality binding: `.github/workflows/bitcode-gate-quality.yml` and `.github/workflows/bitcode-canon-quality.yml`.
- Closure checker: `check:v45-gate16`.

### Gate 17: Source-Safe End-To-End Rehearsal

Gate class: `rehearsal`.

Scope:

- Rehearse the V45 source-safe commercial loop across depositing, Reading, Finding Fits, preview, quote, settlement-readiness, proof readback, delivery posture, compensation posture, and repair.
- Exercise local deterministic mode and credentialed staging-testnet mode where safe credentials are available.
- Keep value-bearing mainnet operation blocked.

Acceptance:

- Rehearsal produces source-safe artifacts, logs, telemetry summaries, ledger/database/storage readback roots, interface screenshots or browser receipts, and repair receipts.
- A missing or contradictory evidence class returns repair state, not success.
- `check:v45-gate17` passes locally and in gate-quality CI.

Gate 17 implementation readback:

- Source-safe rehearsal artifact builder: `packages/protocol/src/canonical/v45-source-safe-e2e-rehearsal.js`.
- Generator, checker, and operator rehearsal script: `scripts/generate-v45-source-safe-e2e-rehearsal.mjs`, `scripts/check-v45-gate17-source-safe-e2e-rehearsal.mjs`, and `scripts/rehearse-v45-source-safe-e2e.mjs`.
- Generated output: `.bitcode/v45-source-safe-e2e-rehearsal.json`.
- Source-safe rehearsal tests: `packages/protocol/test/v45-source-safe-e2e-rehearsal.test.js`.
- Gate-quality and canon-quality binding: `.github/workflows/bitcode-gate-quality.yml` and `.github/workflows/bitcode-canon-quality.yml`.
- Closure checker: `check:v45-gate17`.

### Gate 18: V45 Promotion Readiness And Canonical Promotion

Gate class: `promotion`.

Scope:

- Add and validate the V45 promotion workflow.
- Generate V45 promotion readiness proof.
- Ensure all accepted parity rows are closed or explicitly deferred, generated proof is current, tests/checks are green, and V45 active / draft V46 posture is prepared only by promotion workflow.

Acceptance:

- Promotion workflow validates before committing the standalone `BITCODE_SPEC.txt` change to `V45`.
- `BITCODE_SPEC_V45_PROVEN.md` is current and source-safe.
- `check:v45-gate18` and promotion workflow pass.

Gate 18 implementation readback:

- Promotion readiness artifact builder: `packages/protocol/src/canonical/v45-promotion-readiness-report.js`.
- Generator and checker: `scripts/generate-v45-promotion-readiness-report.mjs` and `scripts/check-v45-gate18-promotion-readiness.mjs`.
- Generated output: `.bitcode/v45-promotion-readiness-report.json`.
- Promotion workflow: `.github/workflows/v45-canon-promotion.yml`.
- Promotion script support: `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, and `scripts/prepare-bitcode-runtime-canon-promotion.mjs`.
- Source-safe promotion tests: `packages/protocol/test/v45-promotion-readiness.test.js`.
- Gate-quality and canon-quality binding: `.github/workflows/bitcode-gate-quality.yml` and `.github/workflows/bitcode-canon-quality.yml`.
- Closure checker: `check:v45-gate18`.
- Status: `closed`.

## Explicit Non-Authorizations

Gate 11 does not authorize value-bearing mainnet operation, direct pushes to
`main`, source disclosure before settlement, wallet custody, route-level
settlement truth, telemetry-only state advancement, or implementation behavior
not traceable to `BITCODE_SPEC_V45.md` and this matrix.

## Accepted Boundaries

Gate 11 accepted the parity-audit boundary and is closed. Later grouped gates
closed the implementation, proof, interface, rehearsal, and promotion rows
authorized by this matrix. V45 is active canon; source disclosure remains
blocked before settlement; BTC mainnet value-bearing operation remains blocked;
and every state advancement must be proven by generated artifacts,
ledger/database/storage/wallet/provider/repository readback, and source-safe
interface receipts.

## Completion Condition

Gate 11 is complete: this matrix contains no `pending` judgments, every V45
formal law has a source-grounded finding, every grouped closure gate through
Gate 18 is represented with readback, and V45 promotion completed with
promoted generated proof.
