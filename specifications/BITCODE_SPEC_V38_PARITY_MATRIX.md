# Bitcode Spec V38 Parity Matrix

## Status

- Version: `V38`
- V38 state: canonical promotion complete; V38 parity truth, generated inference artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V38`
- Canonical proof-source commit: `57173a81fc05a70b6b4b922ebe88add8bfa7f64e`
- Prior canonical anchor: `BITCODE_SPEC_V37.md`
- Prior generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, `.bitcode/v38-promotion-readiness-report.json`, V38 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V38_PROVEN.md` as the generated proof appendix for V38 promotion
- Source parity state: V38 source-side inference inventory, PTRR Failsafe Thricified stack, prompt benchmark report, inference telemetry disclosure law, ReadNeedComprehensionSynthesis hardening, ReadFitsFindingSynthesis search embeddings, AssetPack synthesis economic traceability, Conversation/tool prompt parity, local/staging inference rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V38 file family
- Spec companion: `BITCODE_SPEC_V38.md`
- Notes companion: `BITCODE_SPEC_V38_NOTES.md`
- Delta companion: `BITCODE_SPEC_V38_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md` only after V38 promotion
- Scope: V38 canonical parity ledger for inference correctness over promoted V37 Website Conversations canon
- Last fully realized canonical target preserved in source: `V38`

## Purpose

The V38 parity matrix prevents Bitcode inference from becoming hidden prompt folklore, direct provider-call drift, one-off search code, or telemetry that cannot be audited.
Every V38 gate must name the primitive stack it uses, source evidence, generated artifacts, tests, prompt identities, disclosure tiers, depository-search channels, typed outputs, proof roots, and fail-closed repair posture.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V37.md`
- `BITCODE_SPEC_V37_PROVEN.md`
- `BITCODE_SPEC_V38.md`
- `BITCODE_SPEC_V38_DELTA.md`
- `BITCODE_SPEC_V38_NOTES.md`
- `BITCODE_SPEC_V38_PARITY_MATRIX.md`
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
- `scripts/check-v38-gate1-inference-stack-roadmap-opening.mjs`
- `.bitcode/v38-inference-surface-inventory.json`
- `packages/protocol/src/canonical/inference-surface-inventory.js`
- `packages/protocol/test/v38-inference-surface-inventory.test.js`
- `scripts/generate-v38-inference-surface-inventory.mjs`
- `scripts/check-v38-gate2-inference-surface-inventory.mjs`
- `.bitcode/v38-ptrr-failsafe-thricified-stack.json`
- `packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js`
- `packages/protocol/test/v38-ptrr-failsafe-thricified-stack.test.js`
- `scripts/generate-v38-ptrr-failsafe-thricified-stack.mjs`
- `scripts/check-v38-gate3-ptrr-failsafe-thricified-stack.mjs`
- `.bitcode/v38-prompt-benchmark-report.json`
- `packages/protocol/src/canonical/prompt-benchmark-report.js`
- `packages/protocol/test/v38-prompt-benchmark-report.test.js`
- `scripts/generate-v38-prompt-benchmark-report.mjs`
- `scripts/check-v38-gate4-prompt-benchmark-report.mjs`
- `.bitcode/v38-disclosure-boundary-report.json`
- `packages/protocol/src/canonical/inference-telemetry-disclosure-report.js`
- `packages/protocol/test/v38-inference-telemetry-disclosure-report.test.js`
- `scripts/generate-v38-inference-telemetry-disclosure-report.mjs`
- `scripts/check-v38-gate5-inference-telemetry-disclosure-report.mjs`
- `.bitcode/v38-read-need-comprehension-inference-hardening.json`
- `packages/protocol/src/canonical/read-need-comprehension-inference-hardening.js`
- `packages/protocol/test/v38-read-need-comprehension-inference-hardening.test.js`
- `scripts/generate-v38-read-need-comprehension-inference-hardening.mjs`
- `scripts/check-v38-gate6-read-need-comprehension-inference-hardening.mjs`
- `.bitcode/v38-read-fits-finding-search-embeddings.json`
- `packages/protocol/src/canonical/read-fits-finding-search-embeddings.js`
- `packages/protocol/test/v38-read-fits-finding-search-embeddings.test.js`
- `scripts/generate-v38-read-fits-finding-search-embeddings.mjs`
- `scripts/check-v38-gate7-read-fits-finding-search-embeddings.mjs`
- `.bitcode/v38-assetpack-synthesis-economic-traceability.json`
- `packages/protocol/src/canonical/assetpack-synthesis-economic-traceability.js`
- `packages/protocol/test/v38-assetpack-synthesis-economic-traceability.test.js`
- `scripts/generate-v38-assetpack-synthesis-economic-traceability.mjs`
- `scripts/check-v38-gate8-assetpack-synthesis-economic-traceability.mjs`
- `.bitcode/v38-conversation-tool-prompt-inference-parity.json`
- `packages/protocol/src/canonical/conversation-tool-prompt-inference-parity.js`
- `packages/protocol/test/v38-conversation-tool-prompt-inference-parity.test.js`
- `scripts/generate-v38-conversation-tool-prompt-inference-parity.mjs`
- `scripts/check-v38-gate9-conversation-tool-prompt-inference-parity.mjs`
- `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`
- `packages/protocol/src/canonical/local-staging-inference-depository-search-rehearsal.js`
- `packages/protocol/test/v38-local-staging-inference-depository-search-rehearsal.test.js`
- `scripts/generate-v38-local-staging-inference-depository-search-rehearsal.mjs`
- `scripts/check-v38-gate10-local-staging-inference-depository-search-rehearsal.mjs`

No `_legacy/` source is active source truth.

## V38 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V38.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v38/gate-1-inference-stack-roadmap-opening` | closed | V38 family validates in draft mode over active V37 and `check:v38-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V37 active, V38 draft, and coherent post-V38 responsibility. |
| Inference vocabulary | Gate 1 | `PipelineExecution`, PTRR Plan/Try/Refine/Retry, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, `DocCodeToolPrompt` | closed | Spec family uses primitive names without overlapping terminology or replacement abstractions. |
| Reading pipeline scope | Gate 1 | `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Reading pipeline contracts | closed | Gate plan names both Reading pipelines and their inference, storage, telemetry, and source-safe disclosure obligations. |
| Depository search scope | Gate 1 | depository-search source and tools, embedding policy, fit ranking expectations | closed | Gate plan requires many-candidate Finding Fits across lexical, symbolic, path, metadata, measurement, vector, and provider channels. |
| Prompt benchmarking scope | Gate 1 | PromptPart and prompt benchmarking source anchors | closed | Gate plan requires semantically divided PromptParts and complete Prompts to be benchmarkable. |
| Telemetry disclosure scope | Gate 1 | V35 telemetry law, V37 stream UI law, V38 inference notes | closed | Gate plan requires source-safe prompt, raw response, parsed output, schema verdict, retry, and repair visibility at permitted tiers. |
| Inference surface inventory | Gate 2 | `V38InferenceSurfaceInventory`, `.bitcode/v38-inference-surface-inventory.json`, protocol test, generator, checker, workflows | closed | Source-safe inventory covers Reading, Conversation, tool-definition prompt, interface entrypoint, prompt registry, and execution primitive families with 52 PTRR steps and later-gate gaps explicit. |
| PTRR Failsafe and Thricified execution stack | Gate 3 | `V38PtrrFailsafeThricifiedStack`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, protocol test, generator, checker, workflows | closed | Practical PTRR agents prove four steps, three Failsafe stages, three ThricifiedGeneration stages, 69 source predicates, and Gate 2 count binding with step-owned tools. |
| PromptPart and Prompt benchmarking | Gate 4 | `V38PromptBenchmarkReport`, `.bitcode/v38-prompt-benchmark-report.json`, protocol test, generator, checker, workflows | closed | Source-safe benchmark report covers active Reading, Conversation, and tool-definition PromptParts and complete Prompts with 7 rows, 13 fixtures, 24 typed-output quality expectations, and 38 passed source predicates. |
| Inference telemetry and disclosure tiers | Gate 5 | `V38InferenceTelemetryDisclosureReport`, `.bitcode/v38-disclosure-boundary-report.json`, protocol test, generator, checker, workflows | closed | Source-safe telemetry disclosure report covers phase, agent, PTRR step, Failsafe, ThricifiedGeneration, tool, prompt template, interpolated prompt, raw response root, parsed typed output shape, schema verdict, retry, repair, and stream UI projection rows with 8 rows, 13 telemetry levels, 12 disclosure tier ids, and 66 passed predicates. |
| ReadNeedComprehensionSynthesis inference hardening | Gate 6 | `V38ReadNeedComprehensionInferenceHardening`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `ReadNeedComprehensionSynthesisInferenceReceipt`, protocol test, package tests, generator, checker, workflows | closed | Source-safe ReadNeedComprehensionSynthesis report covers request normalization, Need comprehension, measurement, review, and receipt rows with 4 phases, 4 PTRR agents, 16 PTRR steps, 48 Failsafe sequences, 48 ThricifiedGeneration chains, 144 provider-call slots, and 22 passed predicates. |
| ReadFitsFindingSynthesis depository search and embeddings | Gate 7 | `V38ReadFitsFindingSearchEmbeddings`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `ReadFitsFindingSynthesisSearchReceipt`, protocol test, package tests, generator, checker, workflows | closed | Source-safe Finding Fits report covers accepted-Need admission, query planning, many-fit discovery, embedding policy, threshold ranking, selected-fit provenance, and receipt rows with 7 phases, 8 PTRR agents, 32 PTRR steps, 96 Failsafe sequences, 96 ThricifiedGeneration chains, 288 provider-call slots, 4 tool contracts, 7 search channels, 12 default selected-candidate slots, and 23 passed predicates. |
| AssetPack synthesis handoff and economic traceability | Gate 8 | `V38AssetPackSynthesisEconomicTraceability`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, AssetPack preview/disclosure tests, BTD receipt/source-to-shares/reconciliation tests, pipeline harness tests, generator, checker, workflows | closed | Source-safe AssetPack economic traceability report covers selected-fit handoff, preview, leak scan, deterministic BTC quote, BTD receipts, contributor compensation, settlement unlock, post-settlement delivery, ledger/database synchronization, proof receipts, repair paths, and harness projection with 9 rows and 18 receipt fields. |
| Conversation and tool-prompt inference parity | Gate 9 | `V38ConversationToolPromptInferenceParity`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, Conversation stream/telemetry tests, execution-log UI test, ChatGPT App tool prompt/admission tests, generator, checker, workflows | closed | Source-safe Conversation/tool parity report covers Conversation PTRR variations, prompt registries, typed output schemas, stream telemetry, rich execution-log UI, DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App doc-code carriers, and interface no-bypass posture with 8 rows and 34 passed predicates. |
| Local staging inference and depository search rehearsal | Gate 10 | `V38LocalStagingInferenceDepositorySearchRehearsal`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, Vercel Sandbox harness tests, Reading search tests, route preflight tests, Terminal stream tests, generator, checker, workflows | closed | Source-safe rehearsal report covers local and staging-testnet lanes, bounded real-inference gates, ReadNeedComprehensionSynthesis, ReadFitsFindingSynthesis, many-fit depository search, source-safe AssetPack preview, telemetry streaming/readback, ledger/database posture, and blocked value-bearing mainnet admission with 8 rows and 2 lanes. |
| Promotion readiness | Gate 11 | `V38InferencePromotionReadinessReport`, `.bitcode/v38-promotion-readiness-report.json`, `BITCODE_SPEC_V38_PROVEN.md` support, V38 promotion workflow, promotion command dry-run, generator, checker, workflows | closed | Source-safe inference promotion readiness report covers all V38 gate artifacts, generated proof outputs, V38 promotion workflow, promotion scripts, active V38 / draft V39 posture, and blocked value-bearing mainnet admission with 9 gate artifacts and 5 generated proof outputs. |

## V38 implementation checklist

| Area | Required V38 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V37` during V38 gate work | closed |
| Gate branch pattern | V38 work happens on `version/v38` or `v38/gate-N-*` branches | closed |
| Spec-family shape | V38 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v38-gate1` fails closed on stale posture, missing roadmap truth, missing inference scope, missing depository-search scope, or missing workflow wiring | closed |
| Gate-quality workflow | Gate workflow validates V37 active / V38 draft posture and the V38 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V37 canon, V38 draft family when present, and V37/V38 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V37 active / V38 draft workflow | closed |
| Inference surface inventory | `.bitcode/v38-inference-surface-inventory.json` and `V38InferenceSurfaceInventory` are generated, tested, checked, documented, and workflow-wired as `source-safe-inference-surface-metadata` | closed |
| PTRR stack artifact | `.bitcode/v38-ptrr-failsafe-thricified-stack.json` and `V38PtrrFailsafeThricifiedStack` are generated, tested, checked, documented, and workflow-wired as `source-safe-ptrr-failsafe-thricified-stack-metadata` | closed |
| Prompt benchmark artifact | `.bitcode/v38-prompt-benchmark-report.json` and `V38PromptBenchmarkReport` are generated, tested, checked, documented, and workflow-wired as `source-safe-prompt-benchmark-metadata` | closed |
| Inference telemetry disclosure artifact | `.bitcode/v38-disclosure-boundary-report.json` and `V38InferenceTelemetryDisclosureReport` are generated, tested, checked, documented, and workflow-wired as `source-safe-inference-telemetry-disclosure-metadata` with disclosure tier and raw provider response boundaries explicit | closed |
| ReadNeedComprehensionSynthesis hardening artifact | `.bitcode/v38-read-need-comprehension-inference-hardening.json` and `V38ReadNeedComprehensionInferenceHardening` are generated, tested, checked, documented, and workflow-wired as `source-safe-read-need-comprehension-inference-hardening-metadata` with Need receipt and accepted-Need-gated Finding Fits boundary explicit | closed |
| ReadFitsFindingSynthesis search artifact | `.bitcode/v38-read-fits-finding-search-embeddings.json` and `V38ReadFitsFindingSearchEmbeddings` are generated, tested, checked, documented, and workflow-wired as `source-safe-read-fits-finding-search-embeddings-metadata` with many-fit search channels, embedding policy, thresholds, query/ranking roots, and selected-fit provenance explicit | closed |
| AssetPack synthesis economic traceability artifact | `.bitcode/v38-assetpack-synthesis-economic-traceability.json` and `V38AssetPackSynthesisEconomicTraceability` are generated, tested, checked, documented, and workflow-wired as `source-safe-assetpack-synthesis-economic-traceability-metadata` with selected-fit handoff, source-safe preview, BTD receipts, contributor shares, settlement unlock, ledger/database synchronization, repair paths, and harness evidence explicit | closed |
| Local/staging rehearsal artifact | `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json` and `V38LocalStagingInferenceDepositorySearchRehearsal` are generated, tested, checked, documented, and workflow-wired as `source-safe-local-staging-inference-depository-search-rehearsal-metadata` with local/staging lanes, live inference credential gates, many-fit search rehearsal, source-safe preview, telemetry readback, and blocked mainnet posture explicit | closed |
| Promotion readiness artifact | `.bitcode/v38-promotion-readiness-report.json` and `V38InferencePromotionReadinessReport` are generated, tested, checked, documented, and workflow-wired as `source-safe-inference-promotion-readiness-metadata` with V38 proof appendix support, V38 promotion workflow, promotion command dry-run, active V38 / draft V39 posture, and blocked mainnet posture explicit | closed |
| Inference stack vocabulary | V38 spec family names `PipelineExecution`, PTRR agents, Plan, Try, Refine, Retry, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, `DocCodeToolPrompt`, and provider call boundaries | closed |
| Reading vocabulary | V38 spec family names `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` | closed |
| Depository search vocabulary | V38 spec family names lexical, symbolic, path, metadata, measurement, embedding/vector, provider-specific channels, candidate deposits, ranking, thresholds, and selected-fit provenance | closed |
| Embedding policy | V38 spec family preserves `text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors` until a tested migration exists | closed |
| Disclosure boundary | V38 telemetry exposes prompt and inference evidence only by disclosure tier and blocks protected source, credentials, unpaid AssetPack source, wallet private material, and private settlement payloads | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V38 judgment |
| --- | --- | --- |
| V38 draft family exists | `BITCODE_SPEC_V38.md`, `BITCODE_SPEC_V38_DELTA.md`, `BITCODE_SPEC_V38_NOTES.md`, `BITCODE_SPEC_V38_PARITY_MATRIX.md` | drafted |
| Active pointer remains V37 | `BITCODE_SPEC.txt` | drafted |
| Branch posture is correct | `version/v38`, `v38/gate-1-inference-stack-roadmap-opening` | drafted |
| Loose V38 notes are retained | `BITCODE_SPEC_V38_NOTES.md` | drafted |
| Failsafe above Thricified is specified | `packages/agent-generics/src/steps/failsafe-sequence.ts`, `packages/agent-generics/src/steps/thricified-generation.ts`, V38 SPEC/NOTES | drafted |
| PTRR agent naming is precise | `packages/agent-generics/src/agents/factories.ts`, V38 SPEC/DELTA | drafted |
| Tool prompt definitions are included | `packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts`, `packages/tools-generics/src/doc-code-tool/formatUsableTools.ts`, V38 SPEC/NOTES | drafted |
| Reading pipeline scope is exact | `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`, `packages/pipelines/asset-pack/src/read-need.ts`, V38 SPEC/DELTA | drafted |
| Finding Fits is plural and depository-wide | `packages/pipelines/asset-pack/src/depository-search.ts`, V38 SPEC/DELTA | drafted |
| Gate checker is wired | `scripts/check-v38-gate1-inference-stack-roadmap-opening.mjs`, `package.json`, workflows | drafted |

## Gate 2 Parity

| Requirement | Source evidence | Current V38 judgment |
| --- | --- | --- |
| Inventory source is package-owned | `packages/protocol/src/canonical/inference-surface-inventory.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Deterministic artifact exists | `.bitcode/v38-inference-surface-inventory.json` | closed |
| Source-safe disclosure posture is explicit | `source-safe-inference-surface-metadata`, forbidden payload classes, disclosure tier catalog | closed |
| Reading pipelines are counted | `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts` | closed |
| Conversation and interface inference rows are counted | Website Conversations, stream-event entrypoints, Gate 9 quick-response PTRR parity repair | closed |
| Tool-definition prompt surfaces are counted | `DocCodeToolPrompt`, `formatUsableTools`, depository-search tool definitions | closed |
| Prompt registry and benchmark carryforward is visible | prompt registry row plus Gate 4 benchmark gap | closed |
| Execution primitive stack is named | `PipelineExecution`, PTRR agents, `FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`, provider call slots | closed |
| Count contract is explicit | 13 phase/surface groups, 13 PTRR agents, 52 PTRR steps, 156 Failsafe/Thricified chains, 468 provider-call slots, 9 tool/tool-definition surfaces | closed |
| Gate checker is wired | `pnpm run check:v38-gate2`, package test, generator check, gate/canon workflows | closed |

## Gate 3 Parity

| Requirement | Source evidence | Current V38 judgment |
| --- | --- | --- |
| Stack source is package-owned | `packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Deterministic artifact exists | `.bitcode/v38-ptrr-failsafe-thricified-stack.json` | closed |
| Source-safe disclosure posture is explicit | `source-safe-ptrr-failsafe-thricified-stack-metadata`, forbidden payload classes, no protected source, credentials, or unpaid AssetPack source | closed |
| PTRR carrier is complete | `factoryAgentWithPTRR`, agent prompt carrier, Plan/Try/Refine/Retry step prompt registries | closed |
| Practical steps delegate through Failsafe | `factoryPlanStep`, `factoryTryStep`, `factoryRefineStep`, `factoryRetryStep`, `createFailsafeGenerationSequence` | closed |
| Failsafe delegates to Thricified | `createFailsafeGenerationSequence`, `createThricifiedGeneration`, prepare-concise-context, chunk-then-sum, stitch-until-complete | closed |
| Thricified remains lowest-level inference chain | Reason, Judge, StructuredOutput, provider-call slots, typed schema output | closed |
| Substep prompt/context telemetry is stored | `factoryLLMSubStep`, FailsafeExecution, GenerationExecution, hierarchical prompt, `llm.input`, `llm.prompt`, `llm.output`, `llm.parsedOutput` | closed |
| Tools are step-owned | Plan/Try/Refine conditional postprocess, Retry after final attempt, `ToolExecution` outside `ThricifiedGeneration` | closed |
| Gate 2 counts are bound | 52 PTRR steps, 156 Failsafe sequences, 156 ThricifiedGeneration chains, 468 provider-call slots | closed |
| Gate checker is wired | `pnpm run check:v38-gate3`, package test, generator check, gate/canon workflows | closed |

## Gate 4 Parity

| Requirement | Source evidence | Current V38 judgment |
| --- | --- | --- |
| Benchmark report source is package-owned | `packages/protocol/src/canonical/prompt-benchmark-report.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Deterministic artifact exists | `.bitcode/v38-prompt-benchmark-report.json` | closed |
| Source-safe disclosure posture is explicit | `source-safe-prompt-benchmark-metadata`, fixture ids, typed-output quality ids, raw prompt text private, raw provider response private | closed |
| Benchmark runner and suite types are included | `packages/prompts/src/benchmarking/runner.ts`, `packages/prompts/src/benchmarking/types.ts`, `packages/prompts/src/developing/doc-comment-developing.ts` | closed |
| Generic PromptParts are benchmarkable | generic PTRR, Failsafe, ThricifiedGeneration, formatting, and DocCode PromptParts | closed |
| Reading PromptParts are benchmarkable | `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` specific PromptParts and typed-output quality fixtures | closed |
| Complete Reading Prompts are benchmarkable | `packages/pipelines/asset-pack/src/agents/prompts`, `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts` | closed |
| Conversation Prompt is benchmarkable | `BitcodeTerminalConversationSystemPrompt` benchmark row with route-local source-safe fixture | closed |
| Tool-definition Prompts are benchmarkable | `DocCodeToolPrompt`, `formatUsableTools`, web-search, repository-evidence search, and VCS PR tool prompts | closed |
| Count contract is explicit | 7 rows, 13 fixtures, 24 typed-output quality expectations, 38 source predicates, 443 PromptPart doc-comments, 39 complete Prompt doc-comments, 465 benchmark definitions, 275 PromptPart exports, and 85 Prompt constructions | closed |
| Gate checker is wired | `pnpm run check:v38-gate4`, package test, generator check, gate/canon workflows | closed |

## Gate 5 Parity

| Requirement | Source evidence | Current V38 judgment |
| --- | --- | --- |
| Telemetry disclosure source is package-owned | `packages/protocol/src/canonical/inference-telemetry-disclosure-report.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Deterministic artifact exists | `.bitcode/v38-disclosure-boundary-report.json` | closed |
| Source-safe disclosure posture is explicit | `source-safe-inference-telemetry-disclosure-metadata`, disclosure tier ids, forbidden payload classes, no protected source, credentials, private wallet material, private settlement payload, or unpaid AssetPack source | closed |
| Pipeline phase rows are covered | `storePhaseStart`, `storePhaseComplete`, `phase-start`, `phase-complete`, phase input/output summaries | closed |
| PTRR agent step rows are covered | agent start/complete events, Plan/Try/Refine/Retry factories, source-safe step traces | closed |
| Failsafe rows are covered | prepare-context, chunk-then-sum, stitch-until-complete, retry, repair, prompt-pruned trace posture | closed |
| ThricifiedGeneration rows are covered | Reason, Judge, StructuredOutput, prompt template ids, interpolation roots, raw response roots, parsed typed output shape, schema verdicts | closed |
| Tool rows are covered | `ToolExecution`, tools namespace, invocation/result events, tool input/output/error shape telemetry | closed |
| Stream UI projection is covered | Terminal harness stream snapshots, `readingPipelineTelemetry`, `inferenceAudit`, rich execution log metadata, V37 stream UI parity | closed |
| Count contract is explicit | 8 rows, 13 required telemetry levels, 12 disclosure tier ids, 66 source predicates, V35/V37/V38 proof roots | closed |
| Gate checker is wired | `pnpm run check:v38-gate5`, package test, generator check, gate/canon workflows | closed |

## Completion condition

Gate 5 closes when `pnpm run check:v38-gate5`, the V38 inference telemetry disclosure report generator check, Gate 4 prompt benchmark checks, Gate 3 PTRR/Failsafe/Thricified stack checks, Gate 2 inventory checks, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, strict V38 spec quality, protocol tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-5-inference-telemetry-disclosure-tiers`.

## Gate 6 ReadNeedComprehensionSynthesis inference hardening closure

| Area | Required result | Judgment |
| --- | --- | --- |
| ReadNeed receipt | Produced `ReadNeed` values carry `ReadNeedComprehensionSynthesisInferenceReceipt` with phase, agent, PTRR step, Failsafe, ThricifiedGeneration, prompt, interpolation, output-schema, telemetry, source-safety, review-boundary, and root fields | closed |
| Real inference stack | `synthesizeReadNeedForPipelineInputWithInference` delegates to bounded structured inference when enabled, stores Failsafe sequence and ThricifiedGeneration stages, and stores the source-safe receipt on execution state | closed |
| Resynthesis boundary | Feedback history and previous Need id flow into resynthesized Needs and their receipts | closed |
| Acceptance boundary | `acceptReadNeed` refreshes the receipt to accepted review state and `admitReadFitsFinding` continues to block strict Finding Fits without accepted Need | closed |
| Source-safe artifact | `V38ReadNeedComprehensionInferenceHardening` and `.bitcode/v38-read-need-comprehension-inference-hardening.json` bind Gate 6 implementation to V38 Gates 2 through 5 roots without protected payloads | closed |
| Gate checker is wired | `pnpm run check:v38-gate6`, package tests, protocol test, generator check, gate/canon workflows, docs, and package exports are wired | closed |

## Completion condition

Gate 6 closes when `pnpm run check:v38-gate6`, the Gate 6 artifact generator check, Gate 5 telemetry disclosure check, Gate 4 prompt benchmark check, Gate 3 PTRR/Failsafe/Thricified stack check, Gate 2 inventory check, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, strict V38 spec quality, protocol and pipeline tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-6-readneedcomprehensionsynthesis-inference-hardening`.

## Gate 7 ReadFitsFindingSynthesis depository search and embeddings closure

| Area | Required result | Judgment |
| --- | --- | --- |
| Search receipt | `DepositorySearchResult` carries `ReadFitsFindingSynthesisSearchReceipt` with phase, agent, PTRR step, Failsafe, ThricifiedGeneration, tool, channel, provider, threshold, query, ranking, provenance, embedding, source-safety, and root fields | closed |
| Query plan | Finding Fits derives a source-safe query plan from the accepted Need with lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific channels | closed |
| Many-fit selection | Above-threshold selected candidates carry forward up to the default 12-candidate limit, preserving every selected fit deposit id and selected unit id for implementation context | closed |
| Embedding policy | Active vector policy remains OpenAI `text-embedding-3-small`, 1536 dimensions, float encoding, cosine distance, `deliverable_vectors.embedding`, and `match_deliverable_vectors` | closed |
| Selected-fit provenance | Selected fit provenance root binds source-binding ids, selected units, proof roots, measurement roots, reconciliation readback roots, and ranking posture without source leakage | closed |
| Source-safe artifact | `V38ReadFitsFindingSearchEmbeddings` and `.bitcode/v38-read-fits-finding-search-embeddings.json` bind Gate 7 implementation to V38 Gates 2 through 6 roots without protected payloads | closed |
| Gate checker is wired | `pnpm run check:v38-gate7`, package tests, protocol test, generator check, gate/canon workflows, docs, and package exports are wired | closed |

## Completion condition

Gate 7 closes when `pnpm run check:v38-gate7`, the Gate 7 artifact generator check, Gate 6 ReadNeedComprehensionSynthesis hardening check, Gate 5 telemetry disclosure check, Gate 4 prompt benchmark check, Gate 3 PTRR/Failsafe/Thricified stack check, Gate 2 inventory check, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, strict V38 spec quality, protocol and pipeline tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-7-readfitsfindingsynthesis-search-embeddings`.

## Gate 8 AssetPack synthesis handoff and economic traceability closure

| Area | Required result | Judgment |
| --- | --- | --- |
| Selected-fit handoff | Selected fit ids, selected candidate ids, proof roots, query roots, ranking roots, and selected-fit provenance roots remain available to AssetPack synthesis and preview construction | closed |
| Source-safe preview | AssetPack preview exposes measurements, roots, score posture, fit ids, ownership boundary, settlement boundary, and BTC quote while withholding protected source and full AssetPack patch before settlement | closed |
| Disclosure review | AssetPack disclosure review scans preview metadata for protected source fields, patch markers, credentials, and unpaid source markers and fails closed on leakage | closed |
| Deterministic BTC quote | Share-to-fee preview derives sats from Need measurement vector, admitted fit quality, minimum sats, and dust floor with stable quote root | closed |
| BTD receipts | AssetPack mint, read, and rights transfer receipts bind source-safe preview root, finding-fits result root, range, access policy, paid unlock, delivery admission, BTC fee finality, and ledger projection root | closed |
| Contributor compensation | Source-to-shares proof allocates contribution basis points and BTC sats across selected fit deposits with settlement conservation and zero-cell refit posture | closed |
| Settlement delivery boundary | Protected source and PR delivery unlock only after settlement readback proves BTC fee, range, ownership/license, journal, ledger anchor, database readback, and delivery agree | closed |
| Ledger/database repair | Reconciliation report covers ledger facts, database projections, object storage artifacts, private facts, staging-testnet readback, conservation checks, and repair actions | closed |
| Gate checker is wired | `pnpm run check:v38-gate8`, package tests, protocol test, generator check, gate/canon workflows, docs, and package exports are wired | closed |

Gate 8 closes when `pnpm run check:v38-gate8`, the Gate 8 artifact generator check, Gate 7 ReadFitsFindingSynthesis search check, Gate 6 ReadNeedComprehensionSynthesis hardening check, Gate 5 telemetry disclosure check, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, strict V38 spec quality, protocol tests, BTD receipt/source-to-shares/reconciliation tests, AssetPack preview/disclosure tests, pipeline harness tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-8-assetpack-synthesis-economic-traceability`.

## Gate 10 Local staging inference and depository search rehearsal closure

| Area | Required result | Judgment |
| --- | --- | --- |
| Local lane | The local Vercel Sandbox harness loads only untracked local env files, requires explicit live opt-in, requires sandbox authentication, redacts known secrets, and writes local artifacts under `.bitcode/pipeline-harness-runs` | closed |
| Staging-testnet lane | The staging route preflight requires bounded real inference when strictness is active, validates Supabase REST readback, streams to database storage, and returns source-safe completion summaries | closed |
| Reading pipeline rehearsal | ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis run through the harness with accepted Need state, Failsafe/Thricified telemetry, prompt/output presence flags, and typed output shapes | closed |
| Depository search rehearsal | Finding Fits rehearses many-candidate recall across lexical, symbolic, path, metadata, measurement, embedding-vector, and provider-specific channels with active embedding policy and selected-fit provenance | closed |
| AssetPack preview rehearsal | Found fits carry into source-safe AssetPack preview, disclosure review, deterministic fee quote posture, and protected-source unlock only after settlement evidence | closed |
| Telemetry readback | Pipeline stream events expose phase, agent, PTRR step, Failsafe, ThricifiedGeneration, tool, inference audit, reading pipeline telemetry, and rich execution-log metadata without live payload leakage | closed |
| Value boundary | Local and staging-testnet rehearsal proves ledger/database synchronization and ownership boundaries while production-mainnet value-bearing admission remains blocked | closed |
| Gate checker is wired | `pnpm run check:v38-gate10`, package tests, protocol test, generator check, gate/canon workflows, docs, and package exports are wired | closed |

Gate 10 closes when `pnpm run check:v38-gate10`, the Gate 10 artifact generator check, Gate 9 Conversation/tool parity check, Gate 8 AssetPack economic traceability check, Gate 7 ReadFitsFindingSynthesis search check, Gate 6 ReadNeedComprehensionSynthesis hardening check, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, strict V38 spec quality, protocol tests, Vercel Sandbox harness tests, Reading search tests, route preflight and harness route tests, Terminal stream UI tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-10-local-staging-inference-depository-search-rehearsal`.

## Gate 11 Promotion readiness parity

| Area | Required result | Judgment |
| --- | --- | --- |
| Promotion artifact | `V38InferencePromotionReadinessReport` and `.bitcode/v38-promotion-readiness-report.json` cover V38 artifacts, generated proof outputs, source evidence, documentation evidence, workflow evidence, and source-safe value-boundary posture | closed |
| Generated proof support | `BITCODE_SPEC_V38_PROVEN.md`, `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, and `.bitcode/v38-promotion-readiness-report.json` are generated by the V38 proven package | closed |
| Promotion workflow | `.github/workflows/v38-canon-promotion.yml` validates V38 draft/promoted posture, runs Gate 11, dry-runs promotion, and commits only accepted canon artifacts back to `version/v38` | closed |
| Promotion scripts | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, and runtime promotion preparation support V38 active / draft V39 posture | closed |
| Source-safety | The promotion report blocks protected source, raw protected prompts, raw provider responses, unpaid AssetPack source, credentials, wallet private material, private settlement payloads, and value-bearing mainnet admission | closed |
| Gate checker is wired | `pnpm run check:v38-gate11`, package test, generator check, promotion dry-run, gate/canon workflows, docs, and package exports are wired | closed |

Gate 11 closes when `pnpm run check:v38-gate11`, the Gate 11 artifact generator check, V38 Gate 10 rehearsal check, V38 Gate 9 Conversation/tool parity check, V38 Gate 8 AssetPack economic traceability check, V38 Gate 7 ReadFitsFindingSynthesis search check, V38 Gate 6 ReadNeedComprehensionSynthesis hardening check, V38 draft spec-family validation over V37, V37/V38 canon-posture drift validation, canonical input validation for V37, V38 promotion dry-run, protocol tests, workflow wiring checks, secret scans, and diff hygiene all pass on `v38/gate-11-promotion-readiness`.

## accepted boundaries

- V38 draft work may specify and implement inference stack, prompt benchmarking, Reading search, telemetry, rehearsal, and promotion-readiness surfaces.
- V38 draft work may not change BTD supply law, production-mainnet admission, route versioning discipline, settlement finality law, or source visibility rights without a later explicit promoted canon.
- V38 parity rows begin as drafted during Gate 1 and must become closed only as each gate's source, tests, generated artifacts, and workflow evidence land.
