# Bitcode Spec V42 Parity Matrix

## Status

- Version: `V42`
- V42 state: canonical promotion complete; V42 parity truth, generated reliable MVP artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V42`
- Canonical proof-source commit: `5c9c0270b9d864fe13b7e0a429700e1c9a7689d9`
- Prior canonical anchor: `BITCODE_SPEC_V41.md`
- Prior generated proof appendix: `BITCODE_SPEC_V41_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v42-spec-family-report.json`, `.bitcode/v42-canonical-input-report.json`, `.bitcode/v42-canon-posture-drift-report.json`, `.bitcode/v42-depositing-shortest-path.json`, `.bitcode/v42-reading-shortest-path-state-machine.json`, `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, `.bitcode/v42-readfitsfinding-preview-quote.json`, `.bitcode/v42-settlement-rights-delivery.json`, `.bitcode/v42-ai-reading-demonstration.json`, `.bitcode/v42-local-staging-mvp-rehearsal.json`, `.bitcode/v42-promotion-readiness-report.json`, V42 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V42_PROVEN.md` as the generated proof appendix for V42 promotion
- Source parity state: V42 source-side Depositing shortest path, Reading shortest path state machine, ReadNeed review/resynthesis closure, ReadFitsFinding preview and quote closure, settlement rights delivery, AI-reading demonstration, local/staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V42 file family
- Scope: V42 canonical parity ledger for reliable MVP experience over promoted V41 prompt-program excellence canon
- Last fully realized canonical target preserved in source: `V42`

## Purpose

This matrix records the reliable MVP product surfaces that must become promotion-grade before V42 can replace V41 as active canon.

## Audit basis

- `BITCODE_SPEC.txt` -> `V41`
- `BITCODE_SPEC_V41.md`
- `BITCODE_SPEC_V41_PROVEN.md`
- `BITCODE_SPEC_V42.md`
- `BITCODE_SPEC_V42_DELTA.md`
- `BITCODE_SPEC_V42_NOTES.md`
- commercial product routes, packages, pipelines, BTD/ledger code, generated artifacts, workflows, and `protocol-demonstration/`

## V42 implementation matrix

| Area | Required V42 result | Source evidence | Judgment |
| --- | --- | --- | --- |
| Draft family | V42 SPEC, DELTA, NOTES, and PARITY files exist over active V41 | `BITCODE_SPEC_V42.md` family | closed |
| Roadmap truth | Roadmap states V41 active and V42 draft reliable MVP experience | `SPECIFICATIONS_ROADMAP.md` | closed |
| Gate workflow | Gate quality knows active V41 / draft V42 posture and V42 Gate 1 | `.github/workflows/bitcode-gate-quality.yml` | closed |
| Canon workflow | Canon quality knows active V41 / draft V42 posture and V42 Gate 1 | `.github/workflows/bitcode-canon-quality.yml` | closed |
| Depositing shortest path | Source material can be admitted with Depository proof and compensation visibility | `.bitcode/v42-depositing-shortest-path.json`, `DepositorySupplyCompensationPreview`, `/api/deposits`, Terminal deposit readback | implemented |
| Reading state machine | Five-step Reading UX is route-owned, persistent, and source-safe | `.bitcode/v42-reading-shortest-path-state-machine.json`, `TerminalEnterpriseReadingRouteState`, `readingStage`, route/retry/failure tests | implemented |
| ReadNeed product closure | Need synthesis, review, feedback, resynthesis, accepted-Need admission, rejected Need blockers, source-safe telemetry, and Terminal runtime readback are product-ready | `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, `ReadNeedReviewResynthesisRuntime`, `/api/read-review`, Terminal Need runtime readback | implemented |
| Finding Fits preview and quote | Many-candidate search, selected-fit provenance, source-safe preview, and quote are product-ready | `.bitcode/v42-readfitsfinding-preview-quote.json`, `ReadFitsFindingRuntime`, `AssetPackPreviewBoundary`, harness preview summary, Terminal preview/quote/provenance readback | implemented |
| Settlement and delivery | BTC/BTD settlement, rights transfer, compensation, and repository PR delivery are synchronized | `.bitcode/v42-settlement-rights-delivery.json`, `AssetPackSettlementRightsDeliveryBoundary`, live harness settlement boundary, route summary, Terminal settlement readback | implemented |
| AI-reading demonstration | Standalone demonstration proves AssetPack improves AI beyond public-data-only baseline | `.bitcode/v42-ai-reading-demonstration.json`, `protocol-demonstration/src/ai-reading-demonstration.js`, `test:v42-ai-reading-mvp` | implemented |
| Local/staging rehearsal | Full MVP path rehearsed locally and in staging-testnet with mainnet blocked | `.bitcode/v42-local-staging-mvp-rehearsal.json`, `ReadingLocalStagingRehearsal`, `rehearse:v42-local-staging`, `check:v42-gate8` | implemented |
| Promotion readiness | V42 proof and workflow promotion ready | `.bitcode/v42-promotion-readiness-report.json`, `BITCODE_SPEC_V42_PROVEN.md`, `.github/workflows/v42-canon-promotion.yml`, `check:v42-gate9` | closed |

## V42 implementation checklist

| Area | Closure requirement | Judgment |
| --- | --- | --- |
| Gate 1 | Open V42 family, roadmap, docs, workflow posture, package script, and checker | closed |
| Gate 2 | Depositing shortest path and compensation visibility artifact | implemented |
| Gate 3 | Reading shortest path state machine artifact | implemented |
| Gate 4 | ReadNeed review and resynthesis product closure artifact | implemented |
| Gate 5 | ReadFitsFinding AssetPack preview and quote closure artifact | implemented |
| Gate 6 | Settlement rights transfer and repository delivery closure artifact | implemented |
| Gate 7 | AI-reading dominant demonstration MVP artifact | implemented |
| Gate 8 | Local and staging-testnet full MVP rehearsal artifact | implemented |
| Gate 9 | Promotion readiness artifact and workflow | closed |

## Gate 9 Promotion readiness parity

| Area | Closure evidence | Judgment |
| --- | --- | --- |
| V42 gate artifacts | Gates 2 through 8 generated artifacts are covered, parseable, and source-safe | closed |
| Promotion workflow | `.github/workflows/v42-canon-promotion.yml` validates V42 before canon promotion and prepares the V42 active / V43 draft posture | closed |
| Promotion scripts | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, and runtime canon promotion support V42 | closed |
| Generated proof appendix | `BITCODE_SPEC_V42_PROVEN.md` generation includes `.bitcode/v42-promotion-readiness-report.json` | closed |
| Value-bearing mainnet | V42 promotion readiness keeps value-bearing mainnet blocked | closed |

## V42 accepted boundaries

V42 Gate 1 may open specification, workflow, docs, and validation posture.
It may not implement route, pipeline, settlement, or demonstration behavior.

V42 later gates may implement product behavior only if source-safe disclosure, Need review, BTD/BTC settlement, depositor compensation, repository delivery, telemetry, and generated proof obligations are represented in tests and artifacts.

V42 may not split `/terminal` into `/read` and `/deposit`, and may not rename `/exchange` to `/packs`; those are V43+ roadmap items unless explicitly reopened.
The V43+ parity target is stricter than a route rename: `/packs` must become the searchable master-detail activity route for AssetPacks in and out, `/deposit` must propose and admit reviewable deposit AssetPack options from connected source and Bitcode demand, `/read` must own the Reading purchase path, and product UX outside public documentation must be self-explanatory without self-referential copy.

## V42 completion condition

V42 closes when reliable MVP Depositing, Reading, Finding Fits, AssetPack preview, BTD/BTC settlement, repository delivery, compensation visibility, AI-reading demonstration, local/staging rehearsal, and promotion readiness are all specified, implemented, tested, generated, workflow-bound, source-safe, and promotion-ready.
