# Bitcode Spec V38 Delta

## Status

- Version: `V38`
- V38 state: canonical promotion complete; this delta records the promoted V37-to-V38 inference correctness closure set
- Current canonical/latest target: `V38`
- Canonical proof-source commit: `57173a81fc05a70b6b4b922ebe88add8bfa7f64e`
- Prior canonical anchor: `BITCODE_SPEC_V37.md`
- Prior generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v38-spec-family-report.json`, `.bitcode/v38-canonical-input-report.json`, `.bitcode/v38-canon-posture-drift-report.json`, `.bitcode/v38-inference-surface-inventory.json`, `.bitcode/v38-ptrr-failsafe-thricified-stack.json`, `.bitcode/v38-prompt-benchmark-report.json`, `.bitcode/v38-disclosure-boundary-report.json`, `.bitcode/v38-read-need-comprehension-inference-hardening.json`, `.bitcode/v38-read-fits-finding-search-embeddings.json`, `.bitcode/v38-assetpack-synthesis-economic-traceability.json`, `.bitcode/v38-conversation-tool-prompt-inference-parity.json`, `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`, `.bitcode/v38-promotion-readiness-report.json`, V38 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V38_PROVEN.md` as the generated proof appendix for V38 promotion
- Source parity state: V38 source-side inference inventory, PTRR Failsafe Thricified stack, prompt benchmark report, inference telemetry disclosure law, ReadNeedComprehensionSynthesis hardening, ReadFitsFindingSynthesis search embeddings, AssetPack synthesis economic traceability, Conversation/tool prompt parity, local/staging inference rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V38 file family
- Spec companion: `BITCODE_SPEC_V38.md`
- Notes companion: `BITCODE_SPEC_V38_NOTES.md`
- Parity companion: `BITCODE_SPEC_V38_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md` only after V38 promotion
- Scope: V38 canonical delta for inference correctness over promoted V37 Website Conversations canon

## Why V38 exists

V37 promoted Website Conversations.
That made route-local conversation sessions, streaming UI, writing, source selection, Terminal handoff, persistence, privacy, telemetry, and rehearsal visible enough for enterprise product use.

V38 exists because Bitcode now needs the inference stack beneath Reading, Conversations, tools, and depository search to become explicit, testable, benchmarkable, and commercially reliable.
V38 closes implementation gaps in how PTRR agents, Failsafe chains, ThricifiedGeneration, prompt registries, PromptParts, tool prompts, telemetry, context ancestry, and Reading search/synthesis work together.

## Accepted V38 decisions

- V37 remains active canon during V38 drafting.
- V38 gate branches are opened from `version/v38` and merged back only when their gate acceptance criteria are closed.
- V38 owns inference correctness across Reading pipelines, Website Conversations, tool-definition prompts, and interface-specific inference entrypoints.
- All practical PTRR agent steps should use `FailsafeGenerationSequence` above `ThricifiedGeneration`; any exception must be source-backed, specified, and tested.
- `ThricifiedGeneration` remains the lowest-level Reason, Judge, StructuredOutput chain.
- Tools are step-owned capabilities, and their doc-comment definitions must be injected into final prompt material through `DocCodeToolPrompt` and `formatUsableTools`.
- Prompt registry composition, interpolation bindings, raw responses, parsed typed results, schema verdicts, retries, repairs, and execution ancestry roots must be telemetry-visible at permitted disclosure tiers.
- `ReadFitsFindingSynthesis` must discover many candidate fits above threshold, not merely one candidate, before AssetPack synthesis and settlement handoff.
- Fit-finding must preserve the active OpenAI embedding policy (`text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors`) unless a replacement is explicitly specified, tested, and migrated.

## Explicitly deferred

- Production-mainnet value-bearing launch remains blocked.
- Bridge chain-of-record implementation remains deferred.
- V38 does not reopen BTD supply law, Exchange law, or Bitcoin settlement law except for inference and fit-finding traceability needed by AssetPack preview and post-settlement delivery.
- New LlamaIndex, Pinecone, or provider-specific search channels may be specified only after boundaries, credentials, storage, telemetry, and tests are explicit.

## Pre-Implementation Sequence

1. Open `version/v38` from promoted `main`.
2. Open `v38/gate-1-inference-stack-roadmap-opening` from `version/v38`.
3. Create the V38 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V37`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V37 is active canon, V38 is draft target, and post-V38 work remains coherent.
5. Retarget gate-quality and canon-quality workflow posture checks to V37 active / V38 draft.
6. Add `check:v38-gate1` and a V38 Gate 1 checker.
7. Define V38 gates, acceptance criteria, carryforward parity rows, and promotion boundaries.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v38`.

## Commit-Body Direction

V38 gate commit bodies should describe the closed gate, inference surfaces, prompt/promptpart changes, pipeline or tool changes, generated proof artifacts, tests, telemetry/disclosure boundaries, and accepted deferrals.
The eventual V38 promotion commit body must name all closed V38 gates, generated inference proof artifacts, prompt benchmark reports, Reading pipeline evidence, depository-search evidence, source-safe telemetry evidence, local/staging rehearsal proof, promotion workflow evidence, and the `BITCODE_SPEC.txt` pointer change from `V37` to `V38`.

## Gate Delta

### Gate 1: V38 Inference Stack Roadmap And Spec Opening

Gate 1 opens V38 correctly:

- V38 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V37`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V37 active / V38 draft posture.
- `check:v38-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, inference vocabulary, depository-search vocabulary, and promotion boundaries.
- The V38 gate list is explicit before inference implementation begins.

### Gate 2: Inference Surface Inventory And Prompt Registry Map

Closure acceptance:

- every active Reading, Conversation, tool-definition, and interface inference point is counted;
- phase, PTRR agent, step, Failsafe, ThricifiedGeneration, tool, prompt, PromptPart, interpolation binding, context field, output schema, failure surface, storage target, and stream target inventories are package-backed and generated;
- `pnpm run check:v38-gate2` validates inventory freshness, source coverage, prompt registry coverage, source-safety boundaries, and workflow wiring.

Closure implementation:

- `V38InferenceSurfaceInventory` is now package-backed in `packages/protocol/src/canonical/inference-surface-inventory.js` and generated to `.bitcode/v38-inference-surface-inventory.json`.
- The generated artifact is `source-safe-inference-surface-metadata` and covers `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Website Conversations, tool-definition prompts, interface entrypoints, prompt registry coverage, and execution primitive rows.
- The current inventory count is 52 PTRR steps, 156 Failsafe/Thricified chains, 468 provider-call slots, and 9 tool/tool-definition surfaces, with known follow-on gaps carried to later V38 gates.

### Gate 3: PTRR Failsafe And Thricified Execution Stack

Closure acceptance:

- practical PTRR steps use `FailsafeGenerationSequence` over `ThricifiedGeneration`;
- Plan, Try, Refine, Retry steps preserve agent, step, Failsafe, generation, and provider-call ancestry;
- exceptions are source-backed and tested;
- `pnpm run check:v38-gate3` validates stack composition, typed output repair, and telemetry events.

Closure implementation:

- `V38PtrrFailsafeThricifiedStack` is now package-backed in `packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js` and generated to `.bitcode/v38-ptrr-failsafe-thricified-stack.json`.
- The generated artifact is `source-safe-ptrr-failsafe-thricified-stack-metadata` and proves `factoryAgentWithPTRR`, all four PTRR step factories, `FailsafeGenerationSequence`, `ThricifiedGeneration`, substep prompt/context/telemetry storage, step-owned tool postprocess boundaries, and Gate 2 count binding.
- The current stack contract passes 69 source predicates and binds 52 PTRR steps to 156 Failsafe sequences, 156 ThricifiedGeneration chains, and 468 provider-call slots without serializing protected source, credentials, raw protected prompts, or unpaid AssetPack source.

### Gate 4: PromptPart And Prompt Benchmarking

Closure acceptance:

- PromptParts and complete Prompts are benchmarkable;
- Prompt benchmarking remains source-safe and registry-backed;
- active Reading, Conversation, and tool-definition prompts have initial benchmark suites;
- benchmark artifacts preserve prompt identities, fixtures, typed-output quality expectations, and disclosure tiers;
- `pnpm run check:v38-gate4` validates benchmark runner, fixtures, reports, and source-safe metadata.

Closure implementation:

- `V38PromptBenchmarkReport` is now package-backed in `packages/protocol/src/canonical/prompt-benchmark-report.js` and generated to `.bitcode/v38-prompt-benchmark-report.json`.
- The generated artifact is `source-safe-prompt-benchmark-metadata` and covers benchmark infrastructure, generic PTRR/Failsafe/ThricifiedGeneration PromptParts, `ReadNeedComprehensionSynthesis` PromptParts, `ReadFitsFindingSynthesis` PromptParts, complete Reading Prompt registries, Website Conversation Prompts, and DocCodeToolPrompt surfaces.
- The current benchmark report records 7 rows, 13 source-safe fixtures, 24 typed-output quality expectations, 38 passed source predicates, 443 active PromptPart doc-comments, 39 complete Prompt doc-comments, 465 benchmark definitions, 275 PromptPart exports, and 85 Prompt constructions without serializing raw prompt text, protected source, raw provider responses, credentials, or unpaid AssetPack source.

### Gate 5: Inference Telemetry And Disclosure Tiers

Closure acceptance:

- inference telemetry emits phase, agent, step, Failsafe, ThricifiedGeneration, tool, prompt template, interpolated prompt, raw response, parsed output, schema verdict, retry, repair, and failure events;
- each event has disclosure-tier rules;
- protected payloads remain blocked or redacted;
- `pnpm run check:v38-gate5` validates event contracts, UI stream compatibility, API contracts, and redaction tests.

Closure implementation:

- `V38InferenceTelemetryDisclosureReport` is now package-backed in `packages/protocol/src/canonical/inference-telemetry-disclosure-report.js` and generated to `.bitcode/v38-disclosure-boundary-report.json`.
- The generated artifact is `source-safe-inference-telemetry-disclosure-metadata` and covers pipeline phase, PTRR agent step, Failsafe sequence, ThricifiedGeneration, tool execution, prompt template interpolation, raw response to parsed output schema, and stream UI/storage projection rows.
- The report binds 13 required telemetry levels and 12 disclosure tier ids to allowed payload fields, forbidden payload classes, proof roots, fail-closed states, V35 telemetry taxonomy roots, V37 stream-event roots, V38 Gate 2 inventory roots, V38 Gate 3 PTRR/Failsafe/Thricified roots, and V38 Gate 4 prompt benchmark roots.
- The raw provider response boundary is private or root-only: public rows can expose raw response presence, roots, typed output shape, schema verdict, retry/repair posture, and source-safe inference audit shapes, but not raw provider response content, raw protected prompts, protected source, unpaid AssetPack source, credentials, private wallet material, or private settlement payloads.

### Gate 6: ReadNeedComprehensionSynthesis Inference Hardening

Closure acceptance:

- Read Request to Need synthesis uses the V38 inference stack and emits a `ReadNeedComprehensionSynthesisInferenceReceipt` on the produced Need;
- synthesized Needs are reviewable, resynthesizable with feedback, measurement-backed, and bounded to the original request;
- storage and telemetry are source-safe and typed, including phase ids, agent ids, PTRR step ids, Failsafe sequence ids, ThricifiedGeneration ids, prompt template ids, interpolation keys, output schema ids, telemetry ids, and proof roots;
- `V38ReadNeedComprehensionInferenceHardening` is now package-backed in `packages/protocol/src/canonical/read-need-comprehension-inference-hardening.js` and generated to `.bitcode/v38-read-need-comprehension-inference-hardening.json`;
- the generated artifact is `source-safe-read-need-comprehension-inference-hardening-metadata` and covers request normalization, Need comprehension, Need measurement, Need review, source-safe inference receipts, route/UI resynthesis support, accepted-Need admission boundary, and V38 Gates 2 through 5 roots;
- the current count contract is 5 rows, 4 phases, 4 PTRR agents, 16 PTRR steps, 48 Failsafe sequences, 48 ThricifiedGeneration chains, 144 provider-call slots, 22 passed source predicates, and no protected source, raw provider response content, credentials, unpaid AssetPack source, private wallet material, private settlement payload, or `_legacy/` source roots;
- `pnpm run check:v38-gate6` validates pipeline contracts, agents, prompts, outputs, tests, docs, artifact freshness, and workflow wiring.

### Gate 7: ReadFitsFindingSynthesis Depository Search And Embeddings

Closure acceptance:

- Finding Fits uses inference-derived queries and depository search tools across lexical, symbolic, path, metadata, measurement, embedding/vector, and provider-specific channels;
- candidate deposits above threshold are ranked, verified, and traceable;
- embedding policy, vector dimensions, similarity metric, storage, credentials, and telemetry are explicit;
- `V38ReadFitsFindingSearchEmbeddings` is now package-backed in `packages/protocol/src/canonical/read-fits-finding-search-embeddings.js` and generated to `.bitcode/v38-read-fits-finding-search-embeddings.json`;
- the generated artifact is `source-safe-read-fits-finding-search-embeddings-metadata` and covers accepted-Need admission, source-safe query planning, many-fit discovery, embedding/vector policy, threshold ranking, selected-fit provenance, and the source-safe search receipt;
- the current count contract is 7 rows, 7 phases, 8 PTRR agents, 32 PTRR steps, 96 Failsafe sequences, 96 ThricifiedGeneration chains, 288 provider-call slots, 4 tool contracts, 7 search channels, default 12 above-threshold selected-candidate slots, active OpenAI `text-embedding-3-small` / 1536 dimensions / cosine / `match_deliverable_vectors`, 23 passed source predicates, and no protected source, raw provider response content, credentials, unpaid AssetPack source, private wallet material, private settlement payload, or `_legacy/` source roots;
- `pnpm run check:v38-gate7` validates search tools, embeddings, ranking, thresholding, tests, and generated evidence.

### Gate 8: AssetPack Synthesis Handoff And Economic Traceability

Closure acceptance:

- selected fits remain traceable into AssetPack synthesis;
- source-safe preview and post-settlement delivery preserve visibility boundaries;
- contributor compensation, ledger/database synchronization, proof receipts, and repair paths are specified and tested;
- `V38AssetPackSynthesisEconomicTraceability` is now package-backed in `packages/protocol/src/canonical/assetpack-synthesis-economic-traceability.js` and generated to `.bitcode/v38-assetpack-synthesis-economic-traceability.json`;
- the generated artifact is `source-safe-assetpack-synthesis-economic-traceability-metadata` and covers selected-fit handoff, source-safe preview, disclosure leak scanning, deterministic BTC quote, BTD receipts, source-to-shares compensation, settlement unlock, post-settlement delivery, ledger/database reconciliation, repair paths, and harness evidence projection;
- the current closure contract is 9 rows, 18 required receipt fields, BTD/AssetPack/harness package tests, and no protected source, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payload, or `_legacy/` source roots;
- `pnpm run check:v38-gate8` validates fit-to-AssetPack receipts, settlement traceability, source-safety, and repair posture.

### Gate 9: Conversation And Tool-Prompt Inference Parity

Closure acceptance:

- Website Conversations and tool-definition prompts use V38 prompt registry, Failsafe, Thricified, tool prompt, telemetry, and disclosure posture;
- interface-specific inference entrypoints do not bypass the stack;
- `V38ConversationToolPromptInferenceParity` is package-backed in `packages/protocol/src/canonical/conversation-tool-prompt-inference-parity.js` and generated to `.bitcode/v38-conversation-tool-prompt-inference-parity.json`;
- the generated artifact is `source-safe-conversation-tool-prompt-inference-parity-metadata` and covers comprehensive and quick-response Conversation PTRR variations, prompt registries, typed output schemas, source-safe stream telemetry, rich execution-log rendering, DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App doc-code prompt carriers, and interface no-bypass posture;
- the current closure contract is 8 rows, 34 passed source predicates, Conversation/API/uapi/ChatGPT App tests, no protected source, raw prompt text, raw provider response content, unpaid AssetPack source, credentials, private wallet material, private settlement payload, global ledger authority claim, or `_legacy/` source roots;
- `pnpm run check:v38-gate9` validates Conversation/tool parity, route contracts, UI surfaces, prompt disclosure rules, package tests, artifact freshness, and workflow wiring.

### Gate 10: Local Staging Inference And Depository Search Rehearsal

Closure acceptance:

- local and staging-testnet rehearsals run Reading inference, depository search, source-safe AssetPack preview, telemetry streaming, and blocked mainnet posture;
- real non-mocked inference is exercised where credentials are available;
- logs/screenshots/proofs are source-safe;
- `pnpm run check:v38-gate10` validates rehearsal evidence and workflow wiring.

Closure implementation:

- `V38LocalStagingInferenceDepositorySearchRehearsal` is now package-backed in `packages/protocol/src/canonical/local-staging-inference-depository-search-rehearsal.js` and generated to `.bitcode/v38-local-staging-inference-depository-search-rehearsal.json`.
- The generated artifact is `source-safe-local-staging-inference-depository-search-rehearsal-metadata` and covers local Vercel Sandbox harness opt-in, staging-testnet bounded real-inference preflight, ReadNeedComprehensionSynthesis plus ReadFitsFindingSynthesis exercise, many-fit depository search, source-safe AssetPack preview, telemetry streaming and database readback, live credential gates, ledger/database synchronization posture, and blocked value-bearing mainnet posture.
- The current closure contract is 8 rehearsal rows, 2 lanes, V38 Gates 2 through 9 proof roots, harness/search/route/UI package tests, and no protected source, raw prompt text, raw provider response content, live rehearsal log payload, unpaid AssetPack source, credentials, wallet private material, private settlement payload, production-mainnet value-bearing admission, or `_legacy/` source roots.

### Gate 11: V38 Promotion Readiness

Closure acceptance:

- all V38 gates are closed;
- V38 generated proof appendix support exists;
- promotion workflow validates V38 and commits only the canonical pointer and generated promotion artifacts;
- `pnpm run check:v38-gate11` validates promotion readiness, source-safety, generated artifacts, and V39 draft posture preparation.

Closure implementation:

- `V38InferencePromotionReadinessReport` is now package-backed in `packages/protocol/src/canonical/inference-promotion-readiness-report.js` and generated to `.bitcode/v38-promotion-readiness-report.json`.
- The generated artifact is `source-safe-inference-promotion-readiness-metadata` and covers all V38 Gate 2 through Gate 10 artifacts, `BITCODE_SPEC_V38_PROVEN.md` support, V38 promotion command dry-run support, `v38-canon-promotion.yml`, gate/canon workflow postures, spec-family/runtime promotion support, proven-generator support, active V38 / draft V39 post-promotion readiness, and blocked value-bearing mainnet posture.
- promotion scripts support V38 through `node scripts/promote-bitcode-canon.mjs --version V38 --commit HEAD --dry-run`, `scripts/prepare-bitcode-spec-family-promotion.mjs --version V38`, and `scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V38 --next-draft V39`.
- draft-mode Gate 11 freshness validates the standalone readiness artifact, while promoted-mode Gate 11 accepts the proof-wrapped readiness artifact emitted by the V38 canonical promotion generator.
- The current closure contract is 9 V38 gate artifacts, 5 generated proof outputs, source-safe promotion evidence, and no protected source, raw protected prompt text, raw provider response content, unpaid AssetPack source, credentials, wallet private material, private settlement payload, production-mainnet value-bearing admission, or `_legacy/` source roots.
