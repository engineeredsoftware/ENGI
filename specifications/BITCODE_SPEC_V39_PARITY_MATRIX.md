# Bitcode Spec V39 Parity Matrix

## Status

- Version: `V39`
- V39 state: canonical promotion complete; V39 parity truth, generated commercial Reading artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V39`
- Canonical proof-source commit: `1fe583d781bd24f340e5bb89ecc67ef740cf018c`
- Draft proof-source commit: unbound until V39 promotion
- Prior canonical anchor: `BITCODE_SPEC_V38.md`
- Prior generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, `.bitcode/v39-promotion-readiness-report.json`, V39 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V39_PROVEN.md` as the generated proof appendix for V39 promotion
- Source parity state: V39 source-side Depository supply indexing, enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry repair readback, interface parity, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V39 file family
- Spec companion: `BITCODE_SPEC_V39.md`
- Notes companion: `BITCODE_SPEC_V39_NOTES.md`
- Delta companion: `BITCODE_SPEC_V39_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md` only after V39 promotion
- Scope: V39 canonical parity ledger for commercial Reading readiness over promoted V38 inference correctness canon
- Last fully realized canonical target preserved in source: `V39`

## Purpose

The V39 parity matrix prevents commercial Reading from becoming a partial demo, hidden pipeline run, one-off search path, unpriced preview, or settlement/delivery boundary that cannot be audited.
Every V39 gate must name the product stage it closes, primitive stack it uses, source evidence, generated artifacts, tests, prompt identities, disclosure tiers, depository-search channels, typed outputs, quote/settlement/delivery receipts, proof roots, and fail-closed repair posture.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V38.md`
- `BITCODE_SPEC_V38_PROVEN.md`
- `BITCODE_SPEC_V39.md`
- `BITCODE_SPEC_V39_DELTA.md`
- `BITCODE_SPEC_V39_NOTES.md`
- `BITCODE_SPEC_V39_PARITY_MATRIX.md`
- `SPECIFICATIONS_ROADMAP.md`
- `README.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `packages/protocol/README.md`
- `protocol-demonstration/README.md`
- `packages/protocol/src/canon-posture.js`
- `protocol-demonstration/src/canon-posture.js`
- `packages/protocol/data/state.json`
- `packages/agent-generics/src/steps/failsafe-sequence.ts`
- `packages/agent-generics/src/steps/thricified-generation.ts`
- `packages/agent-generics/src/agents/factories.ts`
- `packages/tools-generics/src/Tool.ts`
- `packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts`
- `packages/tools-generics/src/doc-code-tool/formatUsableTools.ts`
- `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`
- `packages/pipelines/asset-pack/src/read-need.ts`
- `packages/pipelines/asset-pack/src/depository-search.ts`
- `packages/pipelines/asset-pack/src/tools/AssetPackLexicalDepositorySearchTool.ts`
- `scripts/check-v39-gate1-commercial-reading-roadmap-opening.mjs`
- later V39 gate-specific generated artifacts, package sources, tests, and checker scripts as added by their gates

No `_legacy/` source is active source truth.

## V39 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V39.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v39/gate-1-commercial-reading-roadmap-opening` | closed | V39 family validates in draft mode over active V38 and `check:v39-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V38 active, V39 draft, and coherent post-V39 responsibility. |
| Commercial Reading vocabulary | Gate 1 | five-step Reading UX, `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, AssetPack preview, BTC quote, BTD rights transfer, delivery | closed | Spec family names the product stages without replacing primitive names. |
| Inference vocabulary | Gate 1 | `PipelineExecution`, PTRR Plan/Try/Refine/Retry, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, `DocCodeToolPrompt` | closed | V38 inference law remains binding on V39 product implementation. |
| Depository search scope | Gate 1 | depository-search source and tools, embedding policy, fit ranking expectations | closed | Gate plan requires many-candidate Finding Fits across lexical, symbolic, path, metadata, measurement, vector, and provider channels. |
| Settlement and delivery scope | Gate 1 | BTD receipts, source-to-shares compensation, ledger/database/storage synchronization, pull-request delivery | closed | Gate plan keeps source-bearing AssetPack delivery blocked until settlement unlock. |
| Depository supply indexing | Gate 2 | `packages/pipelines/asset-pack/src/depository-supply-index.ts`, `.bitcode/v39-depository-supply-indexing.json`, `packages/pipelines/asset-pack/src/__tests__/depository-supply-index.test.ts`, `packages/protocol/test/v39-depository-supply-indexing.test.js` | implemented | Deposited source becomes measurable, indexable, rights-aware, searchable, and repairable through source-safe `DepositorySupplyIndex` records. |
| Enterprise Reading UX state machine | Gate 3 | `apps/uapi/app/terminal/terminal-enterprise-reading-ux-state.ts`, `TerminalDepositReadWorkbench.tsx`, Conversation handoff, Terminal route query, `.bitcode/v39-enterprise-reading-ux-state.json`, focused UAPI tests, opt-in browser proof workflow | implemented | The five-step enterprise Reading UX is implemented with low-detail defaults, expandable source-safe detail, route-state handoff, rich execution stream integration, and source-safe disclosure proof. |
| ReadNeed review and resynthesis | Gate 4 | `packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts`, `.bitcode/v39-read-need-review-resynthesis.json`, package tests, route tests, protocol tests | implemented | Finding Fits remains blocked until a reviewed Need is accepted; rejected Needs preserve feedback and stay blocked. |
| ReadFitsFinding runtime and replay | Gate 5 | `packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts`, `depository-search.ts`, `.bitcode/v39-read-fits-finding-runtime.json`, package tests, protocol tests | implemented | Finding Fits searches the whole available Depository for many above-threshold candidates and persists source-safe replay, storage, telemetry, and repair receipts. |
| AssetPack preview and quote boundary | Gate 6 | `packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, package tests, protocol tests | implemented | Preview exposes source-safe measurements, deterministic quote, settlement instructions, and withheld delivery posture without source-bearing AssetPack content. |
| Settlement, BTD rights, and delivery | Gate 7 | `packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`, `.bitcode/v39-settlement-rights-delivery.json`, BTD receipt/source-to-shares/reconciliation primitives, package tests, protocol tests | implemented | Payment unlocks rights and delivery only when finality, source-to-shares, BTD rights, reconciliation, and pull-request delivery agree; repair paths are auditable. |
| Operational telemetry and repair | Gate 8 | `ReadingOperationalTelemetryRepairReadback`, `.bitcode/v39-operational-telemetry-repair-readback.json`, package tests, UI tests, protocol tests | implemented | Reading is observable and repairable end to end through source-safe stream events, operator readback, runbook hooks, proof roots, and repair commands. |
| Interface and Conversation parity | Gate 9 | `ReadingInterfaceProductParity`, `.bitcode/v39-interface-conversation-product-parity.json`, package/Conversation/MCP/ChatGPT/protocol tests | implemented | Terminal, Conversation, public API, MCP API, ChatGPT App, and package consumers share Terminal Reading authority; accepted Need, source-safe preview, settlement, BTD rights, and delivery boundaries cannot be bypassed. |
| Local and staging rehearsal | Gate 10 | `ReadingLocalStagingRehearsal`, `.bitcode/v39-local-staging-reading-rehearsal.json`, package/protocol tests | implemented | The full Reading flow rehearses in local and staging-testnet with production-mainnet value-bearing admission blocked. |
| Promotion readiness | Gate 11 | `V39CommercialReadingPromotionReadinessReport`, `.bitcode/v39-promotion-readiness-report.json`, `BITCODE_SPEC_V39_PROVEN.md`, `v39-canon-promotion.yml`, `check:v39-gate11`, promotion dry-run | closed | V39 promotes only after all commercial Reading gates, source-safety evidence, workflow posture, generated proof support, active V39 / draft V40 posture, and value-bearing mainnet blocking close. |

## V39 implementation checklist

| Area | Required V39 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V38` during V39 gate work | closed |
| Gate branch pattern | V39 work happens on `version/v39` or `v39/gate-N-*` branches | closed |
| Spec-family shape | V39 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v39-gate1` fails closed on stale posture, missing roadmap truth, missing commercial Reading scope, missing source anchors, or missing workflow wiring | closed |
| Gate-quality workflow | Gate workflow validates V38 active / V39 draft posture and the V39 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V38 canon, V39 draft family when present, and V38/V39 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V38 active / V39 draft workflow | closed |
| Depository supply indexing | Deposits become measurable, embedded, indexable, rights-aware, searchable, and repairable | implemented |
| Enterprise Reading UX | Terminal implements request read, review Need, request Finding Fits, review preview, buy and settle | implemented |
| ReadNeed runtime | `ReadNeedComprehensionSynthesis` persists reviewable Needs, feedback, resynthesis, measurements, accepted-Need admission, and rejected-Need posture | implemented |
| ReadFitsFinding runtime | `ReadFitsFindingSynthesis` searches many above-threshold deposits with replayable query, ranking, threshold, and selected-fit provenance receipts | implemented |
| Preview and quote | AssetPack preview is source-safe and quote is deterministic before settlement | implemented |
| Settlement and delivery | BTC settlement, BTD rights transfer, source-to-shares compensation, ledger/database/storage sync, and delivery are auditable | implemented |
| Operational telemetry and repair | Reading stream events, operator readback, rich log rendering, proof roots, and repair hooks are source-safe and replayable | implemented |
| Telemetry and repair | Reading emits source-safe rich stream events and operator readback with proof roots and repair posture | implemented |
| Interface parity | Conversation, MCP/API, ChatGPT App, and package consumers cannot bypass Terminal Reading authority | implemented |
| Local/staging rehearsal | Full Reading flow rehearses locally and in staging-testnet with mainnet value-bearing admission blocked | implemented |
| Promotion readiness | V39 promotes only after every commercial Reading gate and source-safety proof closes | closed |
| Inference stack vocabulary | V39 spec family names `PipelineExecution`, PTRR agents, Plan, Try, Refine, Retry, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, `DocCodeToolPrompt`, and provider call boundaries | implemented |
| Reading vocabulary | V39 spec family names `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` | implemented |
| Depository search vocabulary | V39 spec family names lexical, symbolic, path, metadata, measurement, embedding/vector, provider-specific channels, candidate deposits, ranking, thresholds, and selected-fit provenance | implemented |
| Embedding policy | V39 spec family preserves `text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors` until a tested migration exists | implemented |
| Disclosure boundary | V39 telemetry exposes prompt and inference evidence only by disclosure tier and blocks protected source, credentials, unpaid AssetPack source, wallet private material, and private settlement payloads | implemented |

## Gate 1 Parity

| Requirement | Source evidence | Current V39 judgment |
| --- | --- | --- |
| V39 draft family exists | `BITCODE_SPEC_V39.md`, `BITCODE_SPEC_V39_DELTA.md`, `BITCODE_SPEC_V39_NOTES.md`, `BITCODE_SPEC_V39_PARITY_MATRIX.md` | drafted |
| Active pointer remains V38 | `BITCODE_SPEC.txt` | drafted |
| Branch posture is correct | `version/v39`, `v39/gate-1-commercial-reading-roadmap-opening` | drafted |
| Loose V39 notes are retained | `BITCODE_SPEC_V39_NOTES.md` | drafted |
| Failsafe above Thricified is specified | `packages/agent-generics/src/steps/failsafe-sequence.ts`, `packages/agent-generics/src/steps/thricified-generation.ts`, V39 SPEC/NOTES | drafted |
| PTRR agent naming is precise | `packages/agent-generics/src/agents/factories.ts`, V39 SPEC/DELTA | drafted |
| Tool prompt definitions are included | `packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts`, `packages/tools-generics/src/doc-code-tool/formatUsableTools.ts`, V39 SPEC/NOTES | drafted |
| Reading pipeline scope is exact | `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`, `packages/pipelines/asset-pack/src/read-need.ts`, V39 SPEC/DELTA | drafted |
| Finding Fits is plural and depository-wide | `packages/pipelines/asset-pack/src/depository-search.ts`, V39 SPEC/DELTA | drafted |
| Gate checker is wired | `scripts/check-v39-gate1-commercial-reading-roadmap-opening.mjs`, `package.json`, workflows | drafted |

## Gate 2 Parity

| Requirement | Source evidence | Current V39 judgment |
| --- | --- | --- |
| Depository supply index type exists | `packages/pipelines/asset-pack/src/depository-supply-index.ts` | implemented |
| Deposited source lifecycle is source-bound | `DepositorySupplyRecord.sourceBinding`, `DepositorySupplyRecord.lifecycle`, `depository-supply-index.test.ts` | implemented |
| Source-safe search documents exist | `DepositorySupplySearchDocument`, lexical/metadata/measurement/vector document kinds | implemented |
| Active vector policy is projected | `DepositorySupplyVectorProjection`, `embedding-config.ts`, `match_deliverable_vectors`, `text-embedding-3-small`, 1536 dimensions | implemented |
| Supabase/storage readback projection exists | `DepositorySupplyStorageProjection`, retained `deliverables` and `deliverable_vectors` storage-edge names | implemented |
| Depositor and Reader rights boundary is explicit | `DepositorySupplyRecord.rightsBoundary`, BTD range, depositor wallet, settlement-required source-bearing unlock | implemented |
| Repair posture is deterministic | lifecycle blockers, warnings, and `repairActions` including `sync-active-embedding-vector-rows` | implemented |
| Finding Fits handoff is source-safe | `depositorySupplyAssetsFromIndex`, `depository-search.ts`, package tests returning `worthy_fit` without raw source text | implemented |
| Gate 2 proof artifact is source-safe | `.bitcode/v39-depository-supply-indexing.json`, `packages/protocol/src/canonical/v39-depository-supply-indexing.js`, `packages/protocol/test/v39-depository-supply-indexing.test.js` | implemented |
| Gate 2 checker is wired | `scripts/check-v39-gate2-depository-supply-indexing.mjs`, `package.json`, canon/gate workflows | implemented |

## Gate 3 Parity

| Requirement | Source evidence | Current V39 judgment |
| --- | --- | --- |
| Five-step Reading state machine exists | `apps/uapi/app/terminal/terminal-enterprise-reading-ux-state.ts`, `apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts` | implemented |
| Terminal renders low-detail and expandable source-safe detail | `apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx`, `apps/uapi/tests/terminalDepositReadWorkbench.test.ts` | implemented |
| Conversation handoff carries source-safe Reading stage intent | `apps/uapi/app/conversations/conversation-terminal-handoff.ts`, `apps/uapi/app/terminal/terminal-transaction-query.ts`, `apps/uapi/tests/conversationTerminalHandoff.test.tsx`, `apps/uapi/tests/terminalTransactionQuery.test.ts` | implemented |
| Rich execution log remains the live Reading pipeline stream | `apps/uapi/app/terminal/terminal-pipeline-harness-client.ts`, `apps/uapi/tests/pipelineExecutionLogHeader.test.tsx` | implemented |
| Proof artifact and checker exist | `.bitcode/v39-enterprise-reading-ux-state.json`, `packages/protocol/src/canonical/v39-enterprise-reading-ux-state.js`, `packages/protocol/test/v39-enterprise-reading-ux-state.test.js`, `scripts/check-v39-gate3-enterprise-reading-ux-state.mjs` | implemented |
| Browser proof remains wired as opt-in gate-quality evidence | `.github/workflows/bitcode-gate-quality.yml`, `apps/uapi/tests/terminalUxBrowserProof.test.tsx`, `apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts` | implemented |

## Gate 4 Parity

| Requirement | Source evidence | Current V39 judgment |
| --- | --- | --- |
| ReadNeed review runtime exists | `packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts`, `packages/pipelines/asset-pack/src/__tests__/read-need-review-resynthesis.test.ts` | implemented |
| Read Requests and synthesized Needs persist as source-safe storage projections | `ReadNeedReviewStorageRecord`, `read_request`, `synthesized_need`, `need_measurement` records | implemented |
| Feedback and resynthesis lineage are preserved | `resynthesis_attempt` record, `previousNeedId`, `feedbackHistory`, route resynthesis tests | implemented |
| Accepted Need is the only Finding Fits admission path | `acceptReadNeed`, `admitReadFitsFinding`, `accepted_need_admission`, route acceptance tests | implemented |
| Rejected Needs block Finding Fits and retain feedback | `rejectReadNeed`, `rejected_need_posture`, route rejection tests | implemented |
| Telemetry receipts count the ReadNeed pipeline stack | `ReadNeedReviewTelemetryReceipt`, 4 phases, 16 PTRR steps, 48 ThricifiedGeneration ids | implemented |
| Read review route exposes all review actions | `apps/uapi/app/api/read-review/route.ts`, `apps/uapi/tests/api/readReviewRoute.test.ts` | implemented |
| Proof artifact and checker exist | `.bitcode/v39-read-need-review-resynthesis.json`, `packages/protocol/src/canonical/v39-read-need-review-resynthesis.js`, `packages/protocol/test/v39-read-need-review-resynthesis.test.js`, `scripts/check-v39-gate4-read-need-review-resynthesis.mjs` | implemented |
| Workflow wiring includes Gate 4 source-safe proof | `.github/workflows/bitcode-gate-quality.yml`, `.github/workflows/bitcode-canon-quality.yml` | implemented |

## Later Gate Parity

Later V39 gates must add gate-specific parity sections when their implementation begins. Gates 1 through 6 intentionally do not claim closure for paid settlement/delivery, telemetry/repair, interface parity, rehearsal, or promotion readiness.

## accepted boundaries and reopen conditions

V39 Gate 1 accepts only draft-family, roadmap, workflow, branch, and documentation posture closure.
V39 Gate 2 accepts only Depository supply indexing, source-safe search document, vector projection, storage readback posture, rights boundary, repair posture, and Finding Fits handoff closure.
V39 Gate 3 accepts only enterprise Reading UX state, source-safe route handoff/readback, low-detail/expandable Terminal rendering, rich stream-log integration, opt-in browser proof wiring, and generated UX proof artifact closure.
V39 Gate 4 accepts only ReadNeed review runtime storage projection, feedback/resynthesis lineage, accepted-Need admission, rejected-Need posture, source-safe telemetry receipts, route actions, and generated review proof artifact closure.
V39 Gate 5 accepts only ReadFitsFinding runtime storage projection, many-candidate depository search, source-safe query/ranking/provenance evidence, replay receipts, repair posture, active embedding policy, and generated runtime proof artifact closure.
V39 Gate 6 accepts only source-safe AssetPack preview, deterministic share-to-fee quote, disclosure leak scanning, settlement instructions, delivery-withheld posture, replay receipts, repair posture, and generated preview proof artifact closure.
V39 Gate 7 accepts only BTC settlement observation/finality, source-to-shares contributor compensation, BTD rights transfer/read receipts, settlement unlock readback, ledger/database/object-storage synchronization, post-settlement pull-request delivery posture, fail-closed repair, and generated settlement proof artifact closure.
Later gate scope is intentionally pending and must be reopened into gate-specific parity sections before implementation starts.

## Gate 5 Parity

V39 Gate 5 is implemented when `ReadFitsFindingRuntime` wraps the accepted-Need
depository search with source-safe runtime, storage, telemetry, replay, and
repair records. The parity source is
`packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts`; it must not
expose protected source, raw protected prompts, raw provider responses,
credentials, wallet private material, settlement private payloads, or unpaid
AssetPack source. The generated proof artifact is
`.bitcode/v39-read-fits-finding-runtime.json` and the gate check is
`pnpm run check:v39-gate5`.

## Gate 6 Parity

V39 Gate 6 is implemented when `AssetPackPreviewBoundary` wraps
`AssetPackSourceSafePreview` with deterministic BTC quote, disclosure review,
selected-fit provenance, settlement instructions, delivery posture, storage
projection, replay receipt, and repair posture. The parity source is
`packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`; it must not
expose protected source, raw protected prompts, raw provider responses,
credentials, wallet private material, settlement private payloads, or unpaid
AssetPack source. The generated proof artifact is
`.bitcode/v39-assetpack-preview-quote-boundary.json` and the gate check is
`pnpm run check:v39-gate6`.

## Gate 7 Parity

V39 Gate 7 is implemented when `AssetPackSettlementRightsDeliveryBoundary`
wraps the Gate 6 preview boundary with confirmed payment observation, finality
receipt, source-to-shares compensation proof, BTD rights transfer receipt,
paid read receipt, settlement-unlock readback, delivery unlock, storage
projection, reconciliation report, replay receipt, and repair posture. The
parity source is
`packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`;
it must not serialize protected source, raw protected prompts, raw provider
responses, credentials, wallet private material, private settlement payloads,
or unpaid AssetPack source. The generated proof artifact is
`.bitcode/v39-settlement-rights-delivery.json` and the gate check is
`pnpm run check:v39-gate7`.

## Gate 8 Parity

V39 Gate 8 is implemented when
`ReadingOperationalTelemetryRepairReadback` wraps the Reading runtime,
preview, settlement, storage, UI, and repair posture into source-safe
operator readback. The parity source is
`packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts`.
It emits event kinds for phase, PTRR agent, PTRR step,
`FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`,
storage, ledger, wallet, delivery, UI, and repair. It persists
`reading/operational` readback, stream events, runbook hooks, telemetry root,
repair root, and readback root. The shared execution log accepts direct
Reading telemetry payloads and renders event/proof/disclosure metadata without
source leakage. The generated proof artifact is
`.bitcode/v39-operational-telemetry-repair-readback.json` and the gate check
is `pnpm run check:v39-gate8`.

## Gate 9 Parity

V39 Gate 9 is implemented when `ReadingInterfaceProductParity` binds Terminal,
Conversation, public API, MCP API, ChatGPT App, and package-consumer surfaces
to the same Reading authority. Conversation is a Terminal-delegated handoff,
package consumers receive source-safe contract readback only, and API/MCP/
ChatGPT rows reuse BTD interface catalog, read-license/AssetPack-rights,
telemetry hook, and consumer UX proof roots. Each row proves accepted-Need
gating, Finding Fits admission, source-safe preview, settlement unlock, BTD
rights, delivery authorization, no parallel authority, and source-bearing
delivery locked before settlement and rights transfer. The parity source is
`packages/pipelines/asset-pack/src/reading-interface-product-parity.ts`; it
persists `reading/interfaces` productParity, parityRows, noBypassReadback,
interfaceRoots, sourceSafety, and parityRoot. The generated proof artifact is
`.bitcode/v39-interface-conversation-product-parity.json` and the gate check
is `pnpm run check:v39-gate9`.

## Gate 10 Parity

V39 Gate 10 is implemented when `ReadingLocalStagingRehearsal` binds the local
and staging-testnet lanes to the five Reading stages: request read, review
synthesized Need, request Finding Fits, review source-safe AssetPack preview,
and buy/settle. The parity source is
`packages/pipelines/asset-pack/src/reading-local-staging-rehearsal.ts`.
It composes `ReadNeedReviewResynthesisRuntime`, `ReadFitsFindingRuntime`,
`AssetPackPreviewBoundary`, `AssetPackSettlementRightsDeliveryBoundary`,
`ReadingOperationalTelemetryRepairReadback`, and
`ReadingInterfaceProductParity` by proof root and persists
`reading/rehearsal` rows, lane readback, stage readback, source safety, and
proof roots. Staging-testnet is bound to Supabase project
`tkpyosihuouusyaxtbau` and REST host
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`. The generated proof
artifact is `.bitcode/v39-local-staging-reading-rehearsal.json` and the gate
check is `pnpm run check:v39-gate10`.

## completion condition

V39 Gate 10 is complete when `check:v39-gate10`, focused AssetPack rehearsal
package tests, protocol artifact tests, generated artifact freshness checks,
V39 draft spec-family validation, V38/V39 canon-posture drift validation,
promoted V38 spec-family validation, and Gate Quality pass on a
`v39/gate-10-*` branch.

## Gate 11 Promotion readiness parity

V39 Gate 11 is implemented when `V39CommercialReadingPromotionReadinessReport`
binds all commercial Reading artifacts, generated proof appendix support,
promotion workflow posture, promotion command dry-run support, and active V39 /
draft V40 runtime posture into one source-safe promotion-readiness contract.
The parity source is
`packages/protocol/src/canonical/v39-commercial-reading-promotion-readiness-report.js`.
It covers `.bitcode/v39-depository-supply-indexing.json`,
`.bitcode/v39-enterprise-reading-ux-state.json`,
`.bitcode/v39-read-need-review-resynthesis.json`,
`.bitcode/v39-read-fits-finding-runtime.json`,
`.bitcode/v39-assetpack-preview-quote-boundary.json`,
`.bitcode/v39-settlement-rights-delivery.json`,
`.bitcode/v39-operational-telemetry-repair-readback.json`,
`.bitcode/v39-interface-conversation-product-parity.json`,
`.bitcode/v39-local-staging-reading-rehearsal.json`,
`BITCODE_SPEC_V39_PROVEN.md`, `v39-canon-promotion.yml`, and
`check:v39-gate11`. The generated proof artifact is
`.bitcode/v39-promotion-readiness-report.json` and its judgment is closed only
when every artifact is present, parseable, source-safe, workflow-wired,
promotion-script-wired, and value-bearing mainnet admission remains blocked.

V39 Gate 11 is complete when `check:v39-gate11`, focused promotion readiness
protocol tests, promotion dry-run, generated artifact freshness checks, V39
draft spec-family validation, V38/V39 canon-posture drift validation, promoted
V38 spec-family validation, and Gate Quality pass on a `v39/gate-11-*` branch.
