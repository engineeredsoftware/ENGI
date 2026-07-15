# Bitcode Spec V41 Delta

## Status

- Version: `V41`
- V41 state: canonical promotion complete; this delta records the promoted V40-to-V41 prompt-program excellence closure set
- Current canonical/latest target: `V41`
- Canonical proof-source commit: `70be3860a54ff3dd3da5c0cac2c5b854a12910e1`
- Prior canonical anchor: `BITCODE_SPEC_V40.md`
- Prior generated proof appendix: `BITCODE_SPEC_V40_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v41-spec-family-report.json`, `.bitcode/v41-canonical-input-report.json`, `.bitcode/v41-canon-posture-drift-report.json`, `.bitcode/v41-promptpart-prompt-inventory.json`, `.bitcode/v41-registry-interpolation-contracts.json`, `.bitcode/v41-reading-prompt-benchmark-baselines.json`, `.bitcode/v41-readneed-prompt-hardening.json`, `.bitcode/v41-readfitsfinding-prompt-hardening.json`, `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`, `.bitcode/v41-prompt-program-benchmark-report.json`, `.bitcode/v41-promotion-readiness-report.json`, V41 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V41_PROVEN.md` as the generated proof appendix for V41 promotion
- Source parity state: V41 source-side PromptPart and Prompt inventory, registry interpolation contracts, Reading baselines, ReadNeedComprehensionSynthesis prompt hardening, ReadFitsFindingSynthesis prompt hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry report, workflow, and promotion surfaces are canonicalized in the promoted V41 file family
- Scope: V41 canonical delta for prompt-program excellence over promoted V40 exhaustive commercial application testing canon

## Why V41 exists

V38 hardened inference architecture and V40 hardened testing and benchmark lanes.
V41 uses that base to treat prompts as programs: enumerable, benchmarkable, typed, source-safe, and registry-bound.

## Accepted V41 decisions

- V41 is singularly focused on Prompt and PromptPart implementation quality.
- Reading prompts are the priority, especially `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`.
- Prompt rewrites require prior inventory, registry composition proof, interpolation proof, benchmark baselines, parsed return-type checks, and source-safe telemetry proof.
- Prompt artifacts may carry ids, hashes, metrics, verdicts, and redacted summaries, but not raw protected prompt text, raw provider responses, secrets, wallet material, protected source, private settlement payloads, or unpaid AssetPack source.
- V41 preserves V27 BTC/BTD law, V38 inference call-stack law, V39 Reading product law, and V40 testing law.

## V41 gate plan

### Gate 1: Prompt Program Roadmap And Spec Opening

Open the V41 full specification family, roadmap, package script, workflow posture, documentation posture, branch convention, and checker.

### Gate 2: PromptPart And Prompt Inventory Catalog

Inventory every raw PromptPart and composed Prompt across Reading, Conversation, tool-definition, and interface inference surfaces.
Gate 2 is package-backed by `buildV41PromptPartPromptInventory`, emits `.bitcode/v41-promptpart-prompt-inventory.json`, covers 1,459 raw PromptPart rows and 105 composed Prompt rows, binds V38/V40 benchmark handoff artifacts, and records only source-safe metadata.
It also records V42 as the subsequent MVP experience version for shortest-path Depositing, shortest-path Reading, and an AI-reading dominant demonstration without expanding V41 beyond prompt-program work.

### Gate 3: Registry Composition And Interpolation Contracts

Prove registry composition, prompt context interpolation, execution ancestry, tool prompt injection, and parsed return type bindings.
Gate 3 is package-backed by `buildV41RegistryInterpolationContracts`, emits `.bitcode/v41-registry-interpolation-contracts.json`, and currently covers 12 source-safe contract rows with 65 passing source predicates across Prompt registry totality, PromptPart interpolation, PTRR agent/step composition, FailsafeGenerationSequence context handling, ThricifiedGeneration final prompt resolution, execution ancestry overlays, tool doc-code prompt injection, Reading parser targets, Finding Fits search contracts, and AssetPack synthesis/finishing parser targets.
It preserves V42 as subsequent reliable MVP experience planning while keeping V41 focused on prompt-program correctness.

### Gate 4: Reading Pipeline Prompt Benchmark Baselines

Create source-safe baseline benchmarks for Reading prompt surfaces before rewriting them.
Gate 4 is package-backed by `buildV41ReadingPromptBenchmarkBaselines`, emits `.bitcode/v41-reading-prompt-benchmark-baselines.json`, and covers 10 source-safe baseline rows with 120 passing predicates across Read Request-to-Need synthesis, Need review/resynthesis, Need measurement and quote posture, Finding Fits query synthesis, many-candidate ranking, AssetPack synthesis context, source-safe AssetPack preview, settlement/rights/delivery, telemetry summaries, and failure/repair prompts.
It binds Gate 2 PromptPart/Prompt inventory, Gate 3 registry/interpolation contracts, V38 benchmark fixtures, V40 prompt smoke readiness, both Reading pipelines, all five Reading UX steps, parser target ids, disclosure tiers, and source-safe score metadata without serializing raw prompt text, interpolated prompts, provider responses, protected source, private context, credentials, or unpaid AssetPack source.

### Gate 5: ReadNeedComprehensionSynthesis Prompt Rewrite And Return-Type Hardening

Rewrite and repartition ReadNeed prompts only after evidence proves the rewrite improves exact Need comprehension and typed output reliability.
Gate 5 is package-backed by `buildV41ReadNeedPromptHardening`, emits `.bitcode/v41-readneed-prompt-hardening.json`, and covers 7 source-safe hardening rows with 63 passing predicates across exact Read Request boundary, source constraints, strict typed return parsing, review/resynthesis admission, telemetry redaction, PTRR/Failsafe/Thricified composition, and read-comprehension tool prompt alignment.
It binds Gate 2 PromptPart/Prompt inventory, Gate 3 registry/interpolation contracts, Gate 4 Reading prompt benchmark baselines, focused ReadNeed tests, and workflow checks without serializing raw prompt text, interpolated prompts, provider responses, protected source, private context, credentials, or unpaid AssetPack source.

### Gate 6: ReadFitsFindingSynthesis Prompt Rewrite Search And AssetPack Context Hardening

Rewrite and repartition Finding Fits prompts only after evidence proves the rewrite improves Depository search, ranking, selected-fit provenance, and AssetPack context source-safely.
Gate 6 is package-backed by `buildV41ReadFitsFindingPromptHardening`, emits `.bitcode/v41-readfitsfinding-prompt-hardening.json`, and covers 8 source-safe hardening rows with 76 passing predicates across accepted-Need integrity, query synthesis breadth, embeddings and provider-ranking policy, many-candidate fit selection, selected-fit provenance traceability, AssetPack source-safe context synthesis, preview/quote disclosure, settlement/delivery/rights boundaries, runtime replay telemetry, search tool prompt boundaries, and tests/docs/workflow wiring.
It binds Gate 2 PromptPart/Prompt inventory, Gate 3 registry/interpolation contracts, Gate 4 Reading prompt benchmark baselines, Gate 5 ReadNeed hardening, focused Finding Fits tests, and workflow checks without serializing raw prompt text, interpolated prompts, provider responses, protected source, private context, credentials, settlement private payloads, wallet private material, or unpaid AssetPack source.

### Gate 7: Conversation Tool And Interface Prompt Rewrite

Apply the same prompt-program discipline to Conversation, tool-definition, MCP API, ChatGPT App, public API, Terminal, and other interface prompts.
Gate 7 is package-backed by `buildV41ConversationToolInterfacePromptRewrite`, emits `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`, and covers 9 source-safe rewrite rows with 60 passing predicates across Conversation PTRR PromptParts, Terminal conversation system prompt boundaries, rich execution-log prompt/result disclosure, DocCodeToolPrompt and ToolPromptRegistry hierarchy, MCP API/public API prompt contract posture, ChatGPT App action/tool prompt boundaries, Terminal/public summary source-safety, V38 Conversation/tool parity, and Gate 2 through Gate 6 prompt-program dependency roots.

### Gate 8: Prompt Benchmark Report And Telemetry Integration

Close post-rewrite benchmark deltas, prompt lineage, telemetry integration, and source-safe rich stream projections.
Gate 8 is package-backed by `buildV41PromptProgramBenchmarkReport`, emits `.bitcode/v41-prompt-program-benchmark-report.json`, and covers 9 source-safe rows across post-rewrite PromptPart/Prompt deltas, Reading benchmark deltas, Conversation/tool/interface benchmark deltas, prompt registry lineage, Failsafe and ThricifiedGeneration receipts, parsed-output schema verdicts, rich stream projections, repair hooks, and workflow proof.
It binds V38 prompt benchmark and inference telemetry reports, V38 ReadFitsFinding search embeddings, V39 operational telemetry repair readback, V40 prompt benchmark smoke readiness, and V41 Gate 2 through Gate 7 artifacts without serializing raw prompt text, interpolated prompts, provider responses, protected prompts, protected source, private context, credentials, settlement private payloads, wallet private material, or unpaid AssetPack source.

### Gate 9: V41 Promotion Readiness

Bind all V41 prompt artifacts, tests, workflow checks, generated proof support, promotion commands, and active V41 / draft V42 posture.
Gate 9 is package-backed by `buildV41PromotionReadinessReport`, emits `.bitcode/v41-promotion-readiness-report.json`, and proves all V41 prompt-program artifacts are present, parseable, source-safe, covered by source/documentation/workflow evidence, and bound to `BITCODE_SPEC_V41_PROVEN.md` generation support.
The promotion scripts support V41 through `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, and `.github/workflows/v41-canon-promotion.yml`.
The promotion remains blocked when any V41 prompt-program artifact, source-safety proof, workflow check, generated proof support, promotion dry-run, or value-bearing mainnet block is missing.

## Explicitly deferred

- No prompt content is rewritten during Gate 1.
- New commercial product behavior is deferred unless needed to make prompt-program tests truthful.
- Production-mainnet value-bearing prompt rehearsals remain opt-in.
- V43+ agentic enterprise depositing is deferred: deposit AssetPack option synthesis, repository-installed deposit agents, sub-critical/positive-ROI IP filtering, `/read` and `/deposit` route separation, and `/exchange` to `/packs` renaming are planning notes only until a later version explicitly opens that scope.

## Pre-Implementation Sequence

1. Open `version/v41` and `v41/gate-1-prompt-program-roadmap-opening`.
2. Keep `BITCODE_SPEC.txt` at `V40`.
3. Add the V41 spec family and Gate 1 checker.
4. Update roadmap, docs, package scripts, and workflows for active V40 / draft V41.
5. Validate V41 draft family and V40 active posture.

## Commit-Body Direction

V41 commits should name the prompt-program surface, generated artifact or checker, benchmark posture, registry/callsite scope, source-safety boundary, and tests run.
