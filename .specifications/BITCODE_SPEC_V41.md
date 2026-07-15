# Bitcode Spec V41

## Status

- Version: `V41`
- V41 state: canonical promotion complete; V41 is the active prompt-program excellence canon and the V41 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V41`
- Canonical proof-source commit: `70be3860a54ff3dd3da5c0cac2c5b854a12910e1`
- Prior canonical anchor: `BITCODE_SPEC_V40.md`
- Prior generated proof appendix: `BITCODE_SPEC_V40_PROVEN.md`
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V40`
- Generated structured artifact inventory: active canonical `.bitcode/v41-spec-family-report.json`, `.bitcode/v41-canonical-input-report.json`, `.bitcode/v41-canon-posture-drift-report.json`, `.bitcode/v41-promptpart-prompt-inventory.json`, `.bitcode/v41-registry-interpolation-contracts.json`, `.bitcode/v41-reading-prompt-benchmark-baselines.json`, `.bitcode/v41-readneed-prompt-hardening.json`, `.bitcode/v41-readfitsfinding-prompt-hardening.json`, `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`, `.bitcode/v41-prompt-program-benchmark-report.json`, `.bitcode/v41-promotion-readiness-report.json`, V41 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V41_PROVEN.md` as the generated proof appendix for V41 promotion
- Source parity state: V41 source-side PromptPart and Prompt inventory, registry interpolation contracts, Reading baselines, ReadNeedComprehensionSynthesis prompt hardening, ReadFitsFindingSynthesis prompt hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry report, workflow, and promotion surfaces are canonicalized in the promoted V41 file family
- Notes companion: `BITCODE_SPEC_V41_NOTES.md`
- Delta companion: `BITCODE_SPEC_V41_DELTA.md`
- Parity companion: `BITCODE_SPEC_V41_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V41_PROVEN.md` only after V41 promotion
- Scope: V41 canonical system specification for prompt-program excellence across PromptPart and Prompt inventory, registry interpolation contracts, Reading prompt benchmarks, ReadNeedComprehensionSynthesis rewrite hardening, ReadFitsFindingSynthesis rewrite hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry integration, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V41`

## Version executive summary

V41 exists because V38 made the inference call stack correct and V40 made testing and benchmark lanes reliable enough to treat prompts as executable programs.
The version must examine every raw PromptPart, every composed Prompt, every registry binding, every interpolation variable, every benchmark fixture, every inference callsite, every parsed return type, and every source-safe telemetry projection that participates in Bitcode inference.

V41 prioritizes the Reading pipelines: `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`.
Those pipelines decide whether Bitcode understands a Read Request, whether many Depository fits can be found, whether selected fits support a source-safe AssetPack preview, and whether post-settlement delivery may reveal source-bearing AssetPack content.
Prompt changes must improve that behavior without weakening BTC settlement, BTD rights transfer, source-to-shares accounting, disclosure boundaries, or source-safe telemetry.

## Canonical Bitcode executive summary

Bitcode remains the protocol and commercial system for depositing technical knowledge, reading needs against the Depository, finding many fitting deposits, synthesizing source-safe AssetPack previews, settling BTC fees, transferring BTD rights, and delivering full source-bearing AssetPacks only after settlement.
V41 changes prompt-program quality, not economic law.
Every prompt rewrite must preserve the buyer, reviewer, public, internal, and operator visibility tiers that prevent secrets, protected source, raw provider responses, wallet private material, private settlement payloads, and unpaid AssetPack source from leaking.

## V41 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V40` while V41 is draft.
`BITCODE_SPEC_V40.md` and `BITCODE_SPEC_V40_PROVEN.md` are active canon.
`BITCODE_SPEC_V41.md`, `BITCODE_SPEC_V41_DELTA.md`, `BITCODE_SPEC_V41_NOTES.md`, and `BITCODE_SPEC_V41_PARITY_MATRIX.md` define the draft target only on `version/v41` and `v41/gate-*` branches.
Implementation remains unversioned in source paths; prompt registries, prompt parts, prompt titles, tests, scripts, packages, and components must move in place as the single current Bitcode system.

## V41 full-system, re-implementation, and audit rule

Prompt-program work is not copywriting.
Each prompt and PromptPart must be re-implementable from its catalogue row: semantic purpose, registry path, composed prompt memberships, interpolation inputs, execution context ancestry, inference chain position, expected type, parser, benchmark fixtures, source-safe telemetry shape, allowed disclosure tier, failure behavior, and validating command.
The spec, artifacts, tests, and code must let a future engineer rebuild the prompt stack without using conversation history.

## V41 totality and precision enforcement rule

V41 must make prompt totality enumerable.
No prompt or PromptPart may be rewritten unless it is inventoried, benchmarked, tied to an inference callsite, and checked against the parsed return type it is supposed to produce.
No inferred output may be accepted when its prompt registry binding, context interpolation, or type-parser result is missing.
No generated report may serialize raw protected prompt text, protected PromptPart source, raw provider response, secrets, wallet material, private settlement payloads, protected source, or unpaid AssetPack source.

## V41 system goals, non-goals, and design principles

Goals:

- Catalogue every raw PromptPart and every composed Prompt across Reading, Conversation, tool-definition, and interface inference surfaces.
- Benchmark PromptParts and Prompts as source-safe programs with deterministic smoke, focused, and promotion lanes.
- Audit registry composition from phase to PTRR agent to PTRR step to FailsafeGenerationSequence to ThricifiedGeneration.
- Audit interpolation contracts, execution ancestry context, prompt templates, parser targets, and parsed return types.
- Repartition PromptParts into meaningfully benchmarkable semantic units where current divisions hide testable purpose.
- Rewrite, retitle, or merge PromptParts and Prompts only after catalogue and benchmark evidence supports the change.
- Harden `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` before Conversation and other inference prompts.

Non-goals:

- V41 does not alter BTC fee law, BTD ownership law, source-to-shares compensation, or post-settlement delivery rights.
- V41 does not introduce versioned source routes.
- V41 does not expose protected prompt payloads or unpaid AssetPack source for benchmark convenience.
- V41 does not reopen V40 testing gates unless prompt work reveals a concrete regression.

Design principles: prompts as programs, semantic parts, benchmarkable changes, registry truth, typed outputs, source-safe observability, and commercial Reading excellence.

## V41 system architecture and layer boundaries

V41 acts through existing layers:

- prompt and PromptPart primitives;
- prompt registries, phase registries, agent registries, tool registries, and execution registries;
- PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration, and structured parser outputs;
- `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`;
- Conversation, tool-definition, Terminal, and interface inference surfaces;
- benchmark, telemetry, route, storage, and proof artifacts.

The demonstration directory remains a standalone minimal witness.
Commercial code must not import demonstration code.
Demonstration prompt examples may be updated only inside `protocol-demonstration/` and may not depend on commercial prompt packages.

## V41 canonical domain model

V41 prompt-program domain objects are PromptPart, Prompt, Prompt registry entry, PromptPart registry entry, interpolation variable, composed prompt chain, execution ancestry frame, inference callsite, FailsafeGenerationSequence receipt, ThricifiedGeneration receipt, tool definition prompt, parser target, parsed return envelope, benchmark fixture, benchmark run, prompt quality verdict, rewrite plan, disclosure posture, and generated prompt-program proof artifact.
These objects bind to existing Bitcode objects: deposits, Depository search documents, Read Requests, synthesized Needs, accepted Need admission, candidate fit deposits, selected fits, AssetPack previews, quotes, BTC settlement observations, BTD rights transfer, delivery locks, telemetry, and repair actions.

## V41 whole Bitcode operator chain

The V41 operator chain is: open prompt catalogue, locate every prompt/PromptPart, map registry composition, map callsites and type parsers, build source-safe fixtures, run benchmark baselines, propose semantic repartition, rewrite only admitted prompts, rerun benchmarks, verify pipeline and interface behavior, inspect telemetry redaction, regenerate reports, and promote only when prompt-program artifacts prove the whole stack.

## V41 Gate 1 Prompt Program Roadmap And Spec Opening

Gate 1 opens the V41 spec family, branch posture, workflow posture, checker, roadmap, docs, and proof vocabulary.
It does not rewrite prompt content.
It closes when active V40 / draft V41 truth is visible in the root docs, protocol docs, workflow checks, package scripts, and roadmap, and when V41 has a precise gate plan.

## V41 Gate 2 PromptPart And Prompt Inventory Catalog

Gate 2 must emit a source-safe inventory of every raw PromptPart and every composed Prompt.
Rows must include prompt id, part id, source root, registry owner, semantic purpose, prompt family, composed prompt membership, current title, template variable names, benchmark fixture ids, disclosure tier, and validation command.
The artifact may include ids, hashes, counts, and source-safe previews, but no raw protected prompt text.
Gate 2 is closed by the package-backed `buildV41PromptPartPromptInventory` source, deterministic `.bitcode/v41-promptpart-prompt-inventory.json` artifact, `generate:v41-prompt-inventory`, `check:v41-prompt-inventory`, `check:v41-gate2`, protocol tests, and gate/canon workflow wiring.
The current inventory source-safe count contract is 1,459 raw PromptPart rows, 105 composed Prompt rows, 59 generic PromptPart rows, 1,400 specific PromptPart rows, 49 Reading prompt rows, 2 Conversation prompt rows, 74 tool prompt rows, 10 interface prompt rows, 87 prompt rows with registry paths, 1,135 registry paths, 8 benchmark fixture families, V38 benchmark report binding, and V40 prompt benchmark smoke binding.
Gate 2 also preserves V41 scope and prepares draft V42 only as forward roadmap truth: V42 will focus on shortest-path Depositing, shortest-path Reading, and an AI-reading dominant demonstration MVP.

## V41 Gate 3 Registry Composition And Interpolation Contracts

Gate 3 must prove the composition chain from phase and pipeline context through PTRR agents, PTRR steps, FailsafeGenerationSequence, and ThricifiedGeneration final prompt resolution.
Rows must bind registry ids, execution ancestry frames, interpolation keys, missing-key behavior, tool doc-comment prompt injection, context-size handling, and parser targets.
Gate 3 is closed by the package-backed `buildV41RegistryInterpolationContracts` source, deterministic `.bitcode/v41-registry-interpolation-contracts.json` artifact, `generate:v41-registry-interpolation-contracts`, `check:v41-registry-interpolation-contracts`, `check:v41-gate3`, protocol tests, and gate/canon workflow wiring.
The current source-safe contract covers 12 rows, 65 passing source predicates, Prompt registry totality, TemplatedPromptPart interpolation, PTRR agent prompt composition, PTRR step prompt composition, FailsafeGenerationSequence context handling, ThricifiedGeneration final prompt resolution, execution ancestry overlays, tool doc-code prompt injection, `ReadNeedComprehensionSynthesis` parser targets, `ReadFitsFindingSynthesis` search/parser targets, AssetPack synthesis/finishing parser targets, and Gate 2 prompt inventory binding.

## V41 Gate 4 Reading Pipeline Prompt Benchmark Baselines

Gate 4 must establish benchmark baselines for Reading prompt surfaces before rewrites.
It covers `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, Need review, Finding Fits, depository query synthesis, many-candidate ranking, AssetPack preview, quote explanation, telemetry summaries, and failure/repair prompts.
Gate 4 is closed by the package-backed `buildV41ReadingPromptBenchmarkBaselines` source, deterministic `.bitcode/v41-reading-prompt-benchmark-baselines.json` artifact, `generate:v41-reading-prompt-benchmark-baselines`, `check:v41-reading-prompt-benchmark-baselines`, `check:v41-gate4`, protocol tests, and gate/canon workflow wiring.
The current source-safe baseline covers 10 rows, 120 passing source predicates, all five Reading UX steps, both Reading pipeline ids, Gate 2 PromptPart/Prompt inventory roots, Gate 3 registry/interpolation roots, V38 benchmark fixture roots, V40 prompt smoke roots, 36 parser target ids, 9 registry contract ids, deterministic baseline scores, and source-safe disclosure tiers.
The artifact may include ids, hashes, counts, fixture ids, metric ids, parser target ids, baseline scores, source path roots, and verdicts, but no raw prompt text, interpolated prompts, raw provider responses, protected source, private context, credentials, or unpaid AssetPack source.

## V41 Gate 5 ReadNeedComprehensionSynthesis Prompt Rewrite And Return-Type Hardening

Gate 5 may repartition, retitle, and rewrite ReadNeedComprehensionSynthesis PromptParts and Prompts after Gate 2 through Gate 4 evidence exists.
It must prove that synthesized Needs describe exactly and only the user's Read Request, preserve repository and policy context, produce valid parsed return types, support review/resynthesis, and keep source-safe telemetry.
Gate 5 is closed by the package-backed `buildV41ReadNeedPromptHardening` source, deterministic `.bitcode/v41-readneed-prompt-hardening.json` artifact, `generate:v41-readneed-prompt-hardening`, `check:v41-readneed-prompt-hardening`, `check:v41-gate5`, protocol tests, focused ReadNeed tests, and gate/canon workflow wiring.
The current source-safe hardening report covers 7 rows and 63 passing source predicates for ReadNeed PromptPart rewrites, PTRR/Failsafe/Thricified composition preservation, strict Zod return-type parsing, source-constraint preservation, review/resynthesis admission, telemetry redaction, and read-comprehension tool prompt alignment.
The artifact may include ids, source hashes, counts, prompt surface ids, parser target ids, fixture ids, predicate verdicts, dependency roots, and redaction posture, but no raw prompt text, interpolated prompts, raw provider responses, protected source, private context, credentials, or unpaid AssetPack source.

## V41 Gate 6 ReadFitsFindingSynthesis Prompt Rewrite Search And AssetPack Context Hardening

Gate 6 may repartition, retitle, and rewrite ReadFitsFindingSynthesis PromptParts and Prompts after Gate 2 through Gate 4 evidence exists.
It must improve query synthesis, Depository search breadth, embeddings usage, ranking, selected-fit provenance, AssetPack synthesis context, preview boundaries, quote explanation, and post-settlement delivery posture without exposing unpaid source.
Gate 6 is closed by the package-backed `buildV41ReadFitsFindingPromptHardening` source, deterministic `.bitcode/v41-readfitsfinding-prompt-hardening.json` artifact, `generate:v41-readfitsfinding-prompt-hardening`, `check:v41-readfitsfinding-prompt-hardening`, `check:v41-gate6`, protocol tests, focused Finding Fits package tests, and gate/canon workflow wiring.
The current source-safe hardening report covers 8 rows and 76 passing source predicates for AssetPack synthesis PromptPart rewrites, bounded inference prompt context, many-candidate Depository query/ranking/embedding policy, runtime replay telemetry, search tool prompt output boundaries, source-safe preview and quote disclosure, settlement/delivery/rights boundaries, and tests/docs/workflow proof.
The artifact may include ids, source hashes, counts, prompt surface ids, parser target ids, fixture ids, predicate verdicts, dependency roots, query/ranking/provenance root metadata, and redaction posture, but no raw prompt text, interpolated prompts, raw provider responses, protected source, private context, credentials, settlement private payloads, wallet private material, or unpaid AssetPack source.

## V41 Gate 7 Conversation Tool And Interface Prompt Rewrite

Gate 7 applies the same prompt-program discipline to Conversation, tool-definition, MCP API, ChatGPT App, public API, Terminal summaries, and interface prompts.
It must preserve route authority, source selection policy, rich stream log disclosure, tool schemas, and parsed return types.
Gate 7 is closed by the package-backed `buildV41ConversationToolInterfacePromptRewrite` source, deterministic `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json` artifact, `generate:v41-conversation-tool-interface-prompt-rewrite`, `check:v41-conversation-tool-interface-prompt-rewrite`, `check:v41-gate7`, protocol tests, focused prompt-part rewrites, and gate/canon workflow wiring.
The current source-safe rewrite report covers 9 rows and 60 passing source predicates for Conversation PTRR PromptParts, Terminal system prompt composition, rich execution-log prompt/result disclosure metadata, DocCodeToolPrompt composition, ToolPromptRegistry hierarchy, MCP API/public API tool schema posture, ChatGPT App action/tool prompt boundaries, Terminal/public summaries, V38 Conversation/tool parity, and Gate 2 through Gate 6 prompt-program dependency roots.
The artifact may include ids, source hashes, counts, prompt surface ids, parser target ids, tool schema ids, fixture ids, predicate verdicts, dependency roots, and redaction posture, but no raw prompt text, interpolated prompts, raw provider responses, protected source, private context, credentials, settlement private payloads, wallet private material, or unpaid AssetPack source.

## V41 Gate 8 Prompt Benchmark Report And Telemetry Integration

Gate 8 must emit source-safe benchmark and telemetry artifacts after prompt rewrites.
It binds benchmark deltas, prompt lineage, prompt registry versions, inference receipts, Failsafe and Thricified receipts, parsed outputs, redaction posture, and repair hooks without serializing raw provider responses or protected prompts.
Gate 8 is closed by the package-backed `buildV41PromptProgramBenchmarkReport` source, deterministic `.bitcode/v41-prompt-program-benchmark-report.json` artifact, `generate:v41-prompt-program-benchmark-report`, `check:v41-prompt-program-benchmark-report`, `check:v41-gate8`, protocol tests, and gate/canon workflow wiring.
The current source-safe benchmark telemetry report covers 9 rows for post-rewrite PromptPart and Prompt deltas, ReadNeedComprehensionSynthesis benchmark deltas, ReadFitsFindingSynthesis benchmark deltas, Conversation/tool/interface prompt deltas, registry lineage and version telemetry, PTRR/Failsafe/Thricified inference receipt projection, rich stream telemetry projection, repair hooks, parsed-output redaction posture, and tests/docs/workflow proof.
The report binds V38 prompt benchmark, V38 inference telemetry disclosure, V38 PTRR/Failsafe/Thricified stack, V38 ReadFitsFinding search embeddings, V39 operational telemetry repair readback, V40 prompt benchmark smoke readiness, and V41 Gate 2 through Gate 7 artifacts.
The artifact may include ids, source hashes, counts, prompt-program artifact ids, telemetry receipt ids, metric ids, predicate verdicts, dependency roots, source-safe benchmark deltas, parser/schema names, and disclosure posture, but no raw prompt text, interpolated prompts, raw provider responses, protected prompts, protected source, private context, credentials, settlement private payloads, wallet private material, or unpaid AssetPack source.

## V41 Gate 9 Promotion Readiness

Gate 9 closes V41 promotion readiness.
It must bind all V41 prompt-program artifacts, generated proof support, workflow support, promotion commands, post-promotion active V41 / draft V42 posture, source-safe generated appendix output, and value-bearing mainnet blocking where relevant.

V41 promotion readiness canon is package-backed by `buildV41PromotionReadinessReport`, emits `.bitcode/v41-promotion-readiness-report.json`, and covers every V41 prompt-program gate artifact from PromptPart/Prompt inventory through post-rewrite benchmark telemetry integration.
The report must prove the V41 gate artifacts are present, parseable, source-safe, workflow-covered, generated-proof-covered, promotion-command-covered, and dry-run-promotable while `BITCODE_SPEC.txt` remains `V40`.
The V41 promotion workflow is `.github/workflows/v41-canon-promotion.yml`; it validates all V41 gate checks, runs `node scripts/promote-bitcode-canon.mjs --version V41 --commit HEAD --dry-run`, and, on a version-branch PR into `main`, commits the standalone canonical promotion that rewrites the active runtime posture to V41 active / draft V42.
Public V41 promotion artifacts may serialize ids, hashes, counts, paths, verdicts, proof roots, and source-safe summaries only; they may not serialize raw prompt text, interpolated prompts, raw provider responses, protected prompts, protected source, private context, credentials, private settlement payloads, wallet private material, or unpaid AssetPack source.

## V41 canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: deposits, Depository supply records, source-safe search documents, measurement roots, embedding projections, and prompt-program search fixtures.
Current algorithms and derivation rules: deposit prompt changes may improve source-safe metadata extraction and search-document labelling but may not alter ownership, settlement, or disclosure law.
Current invariants and fail-closed conditions: invalid deposit and prompt-derived metadata leakage fail closed.
Current proof obligations: prompt catalogue coverage, benchmark fixture coverage, and no protected-source leakage.
Current source-bearing implementation basis: `packages/prompts`, `packages/pipelines/asset-pack`, `packages/tools-generics`, `packages/btd`, and `uapi`.
Current validating commands and parity basis: V41 gate checks, prompt benchmark commands, V40 testing commands, and generated prompt-program artifacts.
Current accepted boundaries: source-safe metadata can be benchmarked broadly; protected source requires internal-only or post-settlement lanes.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Requests, synthesized Needs, PromptParts, Prompts, prompt registry receipts, Failsafe receipts, ThricifiedGeneration receipts, parser envelopes, benchmark fixtures, and prompt-program reports.
Current algorithms and derivation rules: PTRR agents use registry-composed Prompts, FailsafeGenerationSequence delegates inference to ThricifiedGeneration, and every final output must parse to its typed return envelope.
Current invariants and fail-closed conditions: prompt contract incompleteness and parsed-envelope inadmissibility fail closed.
Current proof obligations: every Reading prompt surface must have catalogue, registry, interpolation, benchmark, parser, telemetry, and source-safe disclosure proof.
Current source-bearing implementation basis: `packages/agent-generics`, `packages/prompts`, `packages/tools-generics`, `packages/pipelines/asset-pack`, and `uapi`.
Current validating commands and parity basis: V41 checks plus V38 inference and V40 integration/benchmark checks.
Current accepted boundaries: benchmark artifacts may use hashes and source-safe summaries but not raw protected prompt payloads.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: candidate fit deposits, query plans, embedding receipts, provider-channel receipts, ranking receipts, selected-fit provenance, verification verdicts, and replay transcripts.
Current algorithms and derivation rules: `ReadFitsFindingSynthesis` must search many candidates above threshold, rank them with source-safe evidence, and hand selected fits into AssetPack synthesis context.
Current invariants and fail-closed conditions: no-survivor asset pack or missing fit provenance blocks preview and settlement.
Current proof obligations: prompt-driven query synthesis, vector-search usage, threshold ranking, many-fit search breadth, and source-safe replay determinism.
Current source-bearing implementation basis: depository search tools, asset-pack pipeline packages, prompt registries, and benchmark fixtures.
Current validating commands and parity basis: V41 Gate 4 and Gate 6 checks plus V39/V40 search and integration artifacts.
Current accepted boundaries: pre-settlement fit visibility is source-safe metadata only.

### Selection and materialization

Current canonical objects and emitted artifacts: selected fits, AssetPack preview, withheld source bundle, PR delivery plan, artifact locks, benchmark receipts, and repair receipts.
Current algorithms and derivation rules: prompt rewrites may improve synthesis instructions and preview explanations but cannot reveal source-bearing AssetPack content before settlement.
Current invariants and fail-closed conditions: public projection overexposure and unpaid AssetPack source exposure fail closed.
Current proof obligations: source-safe prompt outputs, preview source-safety, quote clarity, and post-settlement delivery unlock proof.
Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `uapi`, and VCS delivery boundaries.
Current validating commands and parity basis: V41 checks plus V39 settlement/delivery and V40 browser/API/integration tests.
Current accepted boundaries: full source-bearing delivery unlock remains payment, finality, rights-transfer, and reconciliation gated.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: account, organization, wallet, policy decision, source selector, prompt visibility tier, and redaction receipt.
Current algorithms and derivation rules: prompt context preparation must include only authorized source-safe context for the active principal.
Current invariants and fail-closed conditions: authorization denial and prompt-context overreach fail closed.
Current proof obligations: prompt fixtures must encode principal visibility and redaction posture.
Current source-bearing implementation basis: UAPI authorization helpers, Terminal state, Conversation source selector, and BTD rights primitives.
Current validating commands and parity basis: V41 checks plus V33/V39/V40 interface and settlement tests.
Current accepted boundaries: private keys, credentials, private settlement payloads, and unauthorized source never enter prompts.

### Disclosure and projection

Current canonical objects and emitted artifacts: prompt disclosure tier, output disclosure tier, redaction result, benchmark public projection, and telemetry projection.
Current algorithms and derivation rules: prompt-program reports serialize ids, hashes, counts, verdicts, and source-safe summaries instead of protected payloads.
Current invariants and fail-closed conditions: public projection overexposure fails closed.
Current proof obligations: source-safe generated artifacts and stream UI metadata.
Current source-bearing implementation basis: prompt benchmark scripts, telemetry projectors, rich execution log components, and generated artifacts.
Current validating commands and parity basis: V41 checks plus V35 telemetry/docs and V40 browser proof.
Current accepted boundaries: raw provider responses and protected prompts are never stored in public artifacts.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTC quote, payment observation, BTD rights transfer, source-to-shares allocation, ledger journal, database projection, and delivery unlock.
Current algorithms and derivation rules: prompt rewrites may explain quote and settlement state but may not change deterministic fee calculation or source-to-shares conservation.
Current invariants and fail-closed conditions: settlement conservation drift fails closed.
Current proof obligations: quote prompt outputs must stay source-safe and typed.
Current source-bearing implementation basis: `packages/btd`, ledger/database/storage synchronization helpers, and Terminal settlement routes.
Current validating commands and parity basis: V39/V40 settlement tests and V41 prompt parser checks.
Current accepted boundaries: value-bearing mainnet remains explicit-lane only.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: prompt catalogue artifact, benchmark artifact, parser contract artifact, proof family report, replay transcript, and promotion proof.
Current algorithms and derivation rules: every prompt rewrite needs pre/post benchmark evidence, parser validation, source-safe telemetry, and replayable proof roots.
Current invariants and fail-closed conditions: stale promoted status truth and stale generated prompt artifacts fail closed.
Current proof obligations: generated artifacts, tests, and promotion checks must prove no prompt surface is omitted.
Current source-bearing implementation basis: protocol canonical generators, prompt packages, benchmark scripts, and workflow checks.
Current validating commands and parity basis: V41 gate checks and spec-family checks.
Current accepted boundaries: generated artifacts may report hashes and verdicts, not raw protected payloads.

## V41 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v41-prompt-program-benchmark-report.json` | prompt-catalogue, registry-chain, parsed-return | inference-output-typed, context-prepared | benchmark-baseline, benchmark-postrewrite | `.bitcode/v41-promptpart-prompt-inventory.json` | prompt registries and pipeline tests |
| Prompt-completeness | `.bitcode/v41-promptpart-prompt-inventory.json` | every-part, every-prompt, every-callsite | no-prompt-omitted | catalogue-scan | `.bitcode/v41-registry-interpolation-contracts.json` | prompt package inventory |
| Static-code-analysis | `.bitcode/v41-registry-interpolation-contracts.json` | imports, casing, registry-ids | registry-closed | static-scan | `.bitcode/v41-promptpart-prompt-inventory.json` | source checks |
| Verification-decisions | `.bitcode/v41-reading-prompt-benchmark-baselines.json` | benchmark-verdicts, parser-verdicts | typed-output-valid | benchmark-run | `.bitcode/v41-prompt-program-benchmark-report.json` | benchmark scripts |
| Selection-and-materialization | `.bitcode/v41-readfitsfinding-prompt-hardening.json` | fit-selection, assetpack-context | no-unpaid-source | search-replay | `.bitcode/v41-readfitsfinding-prompt-hardening.json` | Reading pipeline |
| Authorization-and-sensitive-flow | `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json` | visibility-tier, redaction | no-sensitive-prompt-context | redaction-check | `.bitcode/v41-registry-interpolation-contracts.json` | UAPI and prompt projectors |
| Settlement-source-to-shares | `.bitcode/v41-readfitsfinding-prompt-hardening.json` | quote-explanation, rights-boundary | conservation-preserved | settlement-replay | `.bitcode/v41-prompt-program-benchmark-report.json` | BTD and Terminal tests |
| Disclosure-boundary | `.bitcode/v41-prompt-program-benchmark-report.json` | no-raw-prompt, no-raw-response | public-safe | artifact-scan | `.bitcode/v41-promotion-readiness-report.json` | generated artifacts |
| Proof-contract | `.bitcode/v41-promotion-readiness-report.json` | gate-artifacts, workflows, proof | promotion-ready | promotion-dry-run | `BITCODE_SPEC_V41_PROVEN.md` | protocol proof generators |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v41-prompt-program-benchmark-report.json`
- members: prompt-catalogue, registry-chain, parsed-return
- theoremIds: inference-output-typed, context-prepared
- replayStepIds: benchmark-baseline, benchmark-postrewrite
- witnessArtifactPaths: `.bitcode/v41-promptpart-prompt-inventory.json`, `.bitcode/v41-reading-prompt-benchmark-baselines.json`
- current member closure criteria: every inference output has typed parser and benchmark witness
- current member verdict shape: closed, blocked, or reopened with source-safe reason
- current theorem-by-theorem closure reading: every prompt program composes, interpolates, infers, parses, and redacts correctly
- current theorem-to-replay grouping: benchmark fixture to parsed output to telemetry row
- minimum artifact/replay binding set: inventory, benchmark, parser, telemetry, replay
- current proof-object fields: promptIds, partIds, callsiteIds, parserIds, verdicts, proofRoots
- generated-artifact and test bindings: V41 prompt benchmark artifacts, package tests, gate checks
- fail-closed conditions: missing prompt, missing parser, raw provider response, protected prompt serialization

### Prompt-completeness

- proofArtifactPath: `.bitcode/v41-promptpart-prompt-inventory.json`
- members: every-part, every-prompt, every-callsite
- theoremIds: no-prompt-omitted
- replayStepIds: catalogue-scan
- witnessArtifactPaths: `.bitcode/v41-registry-interpolation-contracts.json`
- current member closure criteria: every raw PromptPart and composed Prompt appears once with registry and callsite ownership
- current member verdict shape: inventoried, duplicate, missing, or blocked
- current theorem-by-theorem closure reading: prompt registry totality is complete before rewrite
- current theorem-to-replay grouping: source scan to registry row to callsite row
- minimum artifact/replay binding set: source root, registry id, callsite id, prompt hash
- current proof-object fields: promptId, promptPartIds, owner, sourceRoot, disclosureTier
- generated-artifact and test bindings: inventory generator and check:v41-gate2
- fail-closed conditions: unowned prompt, duplicate id, missing benchmark fixture

### Static-code-analysis

- proofArtifactPath: `.bitcode/v41-registry-interpolation-contracts.json`
- members: imports, casing, registry-ids
- theoremIds: registry-closed
- replayStepIds: static-scan
- witnessArtifactPaths: `.bitcode/v41-promptpart-prompt-inventory.json`
- current member closure criteria: registry imports, casing, and interpolation keys are deterministic
- current member verdict shape: pass, fail, or blocked with source-safe path
- current theorem-by-theorem closure reading: every composition edge is statically visible
- current theorem-to-replay grouping: file scan to registry graph to interpolation contract
- minimum artifact/replay binding set: source path, registry id, prompt id, interpolation keys
- current proof-object fields: sourcePath, registryId, promptId, variableNames, verdict
- generated-artifact and test bindings: source casing checks and registry contract checks
- fail-closed conditions: missing registry edge, mismatched casing, unknown interpolation key

### Verification-decisions

- proofArtifactPath: `.bitcode/v41-reading-prompt-benchmark-baselines.json`
- members: benchmark-verdicts, parser-verdicts
- theoremIds: typed-output-valid
- replayStepIds: benchmark-run
- witnessArtifactPaths: `.bitcode/v41-prompt-program-benchmark-report.json`
- current member closure criteria: benchmark output validates against expected parser and disclosure posture
- current member verdict shape: pass, improve, regress, blocked
- current theorem-by-theorem closure reading: prompt quality is evaluated against typed downstream needs
- current theorem-to-replay grouping: fixture input to model/mock output to parser result to score
- minimum artifact/replay binding set: fixture id, prompt id, parser id, score, verdict
- current proof-object fields: fixtureId, promptId, parserId, metricIds, score, verdict
- generated-artifact and test bindings: benchmark report and gate checks
- fail-closed conditions: parser failure, low benchmark score, source-safety failure

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v41-readfitsfinding-prompt-hardening.json`
- members: fit-selection, assetpack-context
- theoremIds: no-unpaid-source
- replayStepIds: search-replay
- witnessArtifactPaths: `.bitcode/v41-reading-prompt-benchmark-baselines.json`
- current member closure criteria: Finding Fits prompts preserve many-candidate search and source-safe AssetPack context
- current member verdict shape: pass, regress, blocked, repair-required
- current theorem-by-theorem closure reading: selected fits support AssetPack preview without disclosure violation
- current theorem-to-replay grouping: Need to queries to candidates to selected fits to preview
- minimum artifact/replay binding set: need id, query ids, candidate ids, selected fit ids, preview verdict
- current proof-object fields: needId, queryIds, candidateCount, selectedFitCount, disclosureVerdict
- generated-artifact and test bindings: Reading pipeline tests and V41 Gate 6 checks
- fail-closed conditions: no-survivor asset pack, fit provenance gap, unpaid source exposure

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`
- members: visibility-tier, redaction
- theoremIds: no-sensitive-prompt-context
- replayStepIds: redaction-check
- witnessArtifactPaths: `.bitcode/v41-registry-interpolation-contracts.json`
- current member closure criteria: prompt context never includes unauthorized source or secret-shaped payloads
- current member verdict shape: pass, redact, deny, blocked
- current theorem-by-theorem closure reading: source selection and prompt context follow principal policy
- current theorem-to-replay grouping: principal to source selector to prompt context to redaction report
- minimum artifact/replay binding set: principal tier, source selector, redaction result, prompt id
- current proof-object fields: principalTier, promptId, sourceSelectorId, redactionVerdict
- generated-artifact and test bindings: Conversation/tool/interface prompt checks
- fail-closed conditions: authorization denial, secret-shaped prompt context, private settlement payload

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v41-readfitsfinding-prompt-hardening.json`
- members: quote-explanation, rights-boundary
- theoremIds: conservation-preserved
- replayStepIds: settlement-replay
- witnessArtifactPaths: `.bitcode/v41-prompt-program-benchmark-report.json`
- current member closure criteria: prompt outputs explain settlement without altering deterministic accounting
- current member verdict shape: pass, blocked, regress
- current theorem-by-theorem closure reading: BTC fee, BTD rights, and source-to-shares remain exact
- current theorem-to-replay grouping: preview to quote to settlement posture to rights transfer text
- minimum artifact/replay binding set: quote id, BTD range, source-to-shares root, disclosure verdict
- current proof-object fields: quoteId, btcFeeSummary, rightsSummary, conservationVerdict
- generated-artifact and test bindings: BTD tests, Terminal tests, prompt parser checks
- fail-closed conditions: settlement conservation drift, quote mismatch, rights overclaim

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v41-prompt-program-benchmark-report.json`
- members: no-raw-prompt, no-raw-response
- theoremIds: public-safe
- replayStepIds: artifact-scan
- witnessArtifactPaths: `.bitcode/v41-promotion-readiness-report.json`
- current member closure criteria: public artifacts contain source-safe prompt metadata only
- current member verdict shape: pass, blocked, redacted
- current theorem-by-theorem closure reading: protected prompt and provider payloads never leave allowed scope
- current theorem-to-replay grouping: benchmark output to artifact scan to telemetry projection
- minimum artifact/replay binding set: artifact path, prompt hash, redaction verdict, disclosure tier
- current proof-object fields: artifactPath, promptHash, disclosureTier, redactionVerdict
- generated-artifact and test bindings: source-safety scans and gate checks
- fail-closed conditions: raw protected prompt, raw provider response, unpaid AssetPack source

### Proof-contract

- proofArtifactPath: `.bitcode/v41-promotion-readiness-report.json`
- members: gate-artifacts, workflows, proof
- theoremIds: promotion-ready
- replayStepIds: promotion-dry-run
- witnessArtifactPaths: `BITCODE_SPEC_V41_PROVEN.md`, `.bitcode/v41-promotion-readiness-report.json`
- current member closure criteria: all V41 prompt-program gates are implemented, generated, tested, and source-safe
- current member verdict shape: closed, blocked, reopened
- current theorem-by-theorem closure reading: promotion proves V41 prompt-program completeness
- current theorem-to-replay grouping: gate checks to proof generation to promotion workflow
- minimum artifact/replay binding set: gate artifacts, check commands, proof appendix, workflow
- current proof-object fields: gateIds, artifactPaths, commandIds, workflowIds, verdict
- generated-artifact and test bindings: promotion workflow and proven generator
- fail-closed conditions: stale promoted status truth, missing artifact, failed workflow

## V41 generated canon

### Appendix C. Generated artifact contract catalog

#### Inherited V19 reproducible-canon artifacts

V41 preserves reproducible-canon expectations for replay, hashes, generated artifact inventories, and proof-source commit recording.

#### Inherited V20 operator-quality artifacts

V41 preserves operator-quality expectations for visual, accessibility, performance, projection, and quality summaries where prompt changes affect product surfaces.

#### Exact generated-artifact inventory matrix

| Artifact | Purpose | Gate |
| --- | --- | --- |
| `.bitcode/v41-spec-family-report.json` | spec-family structural report | Gate 1 |
| `.bitcode/v41-canonical-input-report.json` | canonical input report | Gate 1 |
| `.bitcode/v41-promptpart-prompt-inventory.json` | PromptPart and Prompt inventory | Gate 2 |
| `.bitcode/v41-registry-interpolation-contracts.json` | registry and interpolation contract report | Gate 3 |
| `.bitcode/v41-reading-prompt-benchmark-baselines.json` | Reading benchmark baseline report | Gate 4 |
| `.bitcode/v41-readneed-prompt-hardening.json` | ReadNeed prompt rewrite report | Gate 5 |
| `.bitcode/v41-readfitsfinding-prompt-hardening.json` | ReadFitsFinding prompt rewrite report | Gate 6 |
| `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json` | Conversation, tool, and interface prompt rewrite report | Gate 7 |
| `.bitcode/v41-prompt-program-benchmark-report.json` | post-rewrite benchmark and telemetry report | Gate 8 |
| `.bitcode/v41-promotion-readiness-report.json` | V41 promotion readiness report | Gate 9 |

#### V41 specifying generated artifacts

The minimum V41 specifying generated artifacts are `.bitcode/v41-spec-family-report.json` and `.bitcode/v41-canonical-input-report.json`.
Later V41 gates add prompt-program artifacts after their source-safe generators exist.

#### Shared generated-artifact fields

All V41 generated artifacts must carry aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when source-safety or completeness checks fail.

#### Artifact-specific generated payload fields

Prompt artifacts may carry prompt ids, PromptPart ids, hashes, semantic labels, registry ids, callsite ids, parser ids, benchmark fixture ids, scores, verdicts, and disclosure tiers.
They may not carry raw protected prompt text.

#### Artifact confidentiality and disclosability taxonomy

Allowed public fields are ids, counts, hashes, redacted summaries, verdicts, command ids, and proof roots.
Protected fields are raw prompt payloads, raw PromptPart source, raw provider responses, private context, protected source, secrets, wallet private material, private settlement payloads, and unpaid AssetPack source.

#### Minimum generated appendix rendered contents

The generated appendix must render prompt-program gate results, source-safe artifact summaries, proof-family closure, command evidence, and promotion posture.

#### Canonical regeneration and fail-closed posture

Generation must fail closed when artifact freshness, source-safety, benchmark completeness, parser typing, or promoted status truth drifts.

## V41 validation canon

### Appendix D. Validation and checking gate catalog

V41 Gate 1 validates with `pnpm run check:v41-gate1`, `node scripts/check-bitcode-spec-family.mjs --version V41 --mode draft --current-target V40`, `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V40 --draft-target V41`, and `node scripts/check-bitcode-canonical-inputs.mjs --current-target V40`.
V41 Gate 2 validates with `pnpm run generate:v41-prompt-inventory`, `pnpm run check:v41-prompt-inventory`, `pnpm run check:v41-gate2`, and `node --test --test-force-exit packages/protocol/test/v41-promptpart-prompt-inventory.test.js`.
V41 Gate 3 validates with `pnpm run generate:v41-registry-interpolation-contracts`, `pnpm run check:v41-registry-interpolation-contracts`, `pnpm run check:v41-gate3`, and `node --test --test-force-exit packages/protocol/test/v41-registry-interpolation-contracts.test.js`.
V41 Gate 4 through Gate 8 validate with their focused generator, checker, and package tests for Reading baselines, ReadNeed hardening, ReadFitsFinding hardening, Conversation/tool/interface prompt rewrite, and prompt benchmark telemetry.
V41 Gate 9 validates with `pnpm run generate:v41-promotion-readiness`, `pnpm run check:v41-promotion-readiness`, `pnpm run check:v41-gate9`, `node --test --test-force-exit packages/protocol/test/v41-promotion-readiness.test.js`, and `node scripts/promote-bitcode-canon.mjs --version V41 --commit HEAD --dry-run`.

## V41 promotion canon

### Appendix G. Canonical file-family and promotion contract catalog

V41 promotion will be a version-branch PR into `main`.
The promotion workflow must validate every V41 gate, generate `BITCODE_SPEC_V41_PROVEN.md`, prepare active V41 / draft V42 runtime posture, and update `BITCODE_SPEC.txt` only after checks pass.

## V41 appendices and canonical supporting material

### Appendix A. Canonical type and surface catalog

Canonical prompt-program types include PromptPart, Prompt, registry entry, interpolation contract, FailsafeGenerationSequence receipt, ThricifiedGeneration receipt, parser target, parsed return envelope, benchmark fixture, benchmark result, rewrite plan, telemetry projection, and proof artifact.

### Appendix B. Proof family closure catalog

The exact proof-family inventory matrix above is normative for V41.
Each proof family must map prompt-program objects to artifacts, commands, and fail-closed checks.

### Appendix E. Current canonical source map

Current source-bearing prompt work lives in `packages/prompts`, `packages/generic-agents`, `packages/agent-generics`, `packages/tools-generics`, `packages/pipelines/asset-pack`, `uapi`, `packages/protocol`, and benchmark scripts.
Demonstration-only prompt examples live only under `protocol-demonstration/`.

### Appendix F. Subsystem totality and derivability matrix

| Subsystem or concern | Current canonical contracts or artifacts | Current closure basis | Generated/runtime evidence | Validating commands | Accepted boundary |
| --- | --- | --- | --- | --- | --- |
| repo supply and depositing | source-safe prompt metadata | V41 catalogue | prompt inventory | check:v41-gate2 | protected source withheld |
| reading and measured demand | Need prompts and parser outputs | V41 Gate 5 | benchmark reports | check:v41-gate5 | exact user need only |
| prompt/inference/evaluator ownership | registry and callsite rows | V41 Gate 3 | registry contracts | check:v41-gate3 | no raw provider payload |
| deposit-to-read fit | query synthesis prompt rows | V41 Gate 6 | search benchmark | check:v41-gate6 | many fits above threshold |
| recall and ranking | ranking prompts and embeddings | V41 Gate 6 | selected-fit provenance | check:v41-gate6 | source-safe candidate data |
| verification decisions | parser and benchmark verdicts | V41 Gate 4 | benchmark baselines | check:v41-gate4 | typed outputs required |
| selection and materialization | AssetPack context prompts | V41 Gate 6 | preview verdicts | check:v41-gate6 | no unpaid source |
| branch artifacts and assetPackEvidence | delivery prompt summaries | V41 Gate 6 | delivery posture | check:v41-gate6 | post-settlement only |
| identity, authority, signing, and policy | visibility-tier prompt context | V41 Gate 7 | redaction proof | check:v41-gate7 | unauthorized context denied |
| sensitive data and confidentiality flows | protected prompt exclusions | V41 Gate 8 | source-safety scan | check:v41-gate8 | secrets never serialized |
| projection, disclosure, and redaction | telemetry prompt projections | V41 Gate 8 | benchmark report | check:v41-gate8 | source-safe metadata only |
| proof families, members, theorems, witnesses, and replay | proof-family matrix | V41 Gate 9 | proven appendix | check:v41-gate9 | generated proof required |
| settlement, source-to-shares, journals, and exact accounting | quote explanation prompts | V41 Gate 6 | BTD checks | check:v41-gate6 | no law change |
| telemetry, persistence, state, and failure semantics | rich stream prompt metadata | V41 Gate 8 | telemetry rows | check:v41-gate8 | no raw responses |
| host/runtime capability truth | benchmark lanes | V41 Gate 4 | run receipts | check:v41-gate4 | opt-in live lanes |
| operator experience and pedagogy | prompt report docs | V41 Gate 8 | docs/readback | check:v41-gate8 | source-safe summaries |
| validation and test stack | gate checks | V41 Gate 9 | workflow proof | check:v41-gate9 | greenable CI |
| generated artifacts and canonical promotion | V41 artifact family | V41 Gate 9 | promotion report | check:v41-gate9 | no stale status truth |

### Appendix H. Operator surface and quality contract catalog

Operators must be able to run prompt inventory, benchmark baseline, rewrite validation, and promotion readiness commands locally without tracked credentials.
Live provider benchmarks and staging-testnet prompt rehearsals require explicit opt-in and environment checks.

### Appendix I. Scenario, workflow, and cross-product contract catalog

V41 scenario classes include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.
Each scenario must specify the principal visibility tier, source-safe prompt context, benchmark fixture, expected parsed type, telemetry projection, and settlement/disclosure boundary.

### Appendix J. Fail-closed contract and error posture matrix

Fail-closed triggers include invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, stale promoted status truth, missing benchmark fixture, missing prompt registry edge, unknown interpolation variable, parser mismatch, and raw protected payload serialization.

### Appendix K. Source-bearing AssetPack and artifact contract catalog

V41 prompt work must preserve `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V41_PROVEN.md` as source-bearing or proof-bearing artifact contract references.
Prompt outputs may describe AssetPack measurements, quote posture, fit provenance, and delivery state before settlement.
Prompt outputs may not expose source-bearing AssetPack content before BTC payment, finality, BTD rights transfer, and ledger/database/object-storage reconciliation agree.

## V41 accepted boundaries and reopen conditions

V41 opens by specifying prompt-program work before changing prompt content.
If a later gate finds an unowned prompt, an untyped inference output, a hidden interpolation dependency, a benchmark that serializes protected content, or a Reading regression, the relevant earlier V41 gate must reopen.

## V41 completion condition

V41 closes when every PromptPart and Prompt is catalogued, benchmarked, semantically partitioned where useful, retitled or rewritten where evidence supports it, validated against registry composition and parsed return types, integrated into Reading and Conversation inference, proven source-safe in telemetry and artifacts, documented, tested, generated, workflow-checked, and promoted as active canon.
