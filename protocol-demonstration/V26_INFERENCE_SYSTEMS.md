# V26 Inference Systems

## Status

- Scope: supplementary V26 specification for prompts, tools, agents, executions, and pipeline inference carriers
- Canonical pointer: `/Users/garrettmaring/Developer/ENGI/BITCODE_SPEC.txt -> V26`
- Purpose: make every inference-bearing implementation specify its read, prompt substrate, tool boundary, agentic role, execution carrier, evidence, and promotion posture before it can be treated as Bitcode behavior

## Rule

No prompt, tool, agent, phase, pipeline, MCP operation, or execution carrier may define live Bitcode behavior only by code presence.
Each inference system must be specified as an auditable unit with the same canonical terms:

- `read`
  The expressed or measured objective the inference system satisfies.
- `prompt surface`
  The `PromptPart`, `Prompt`, `PromptExecution`, formatter, raw promptpart, or doc-code prompt structure used to shape inference.
- `tool contract`
  The callable operation, parameter schema, output schema, capability boundary, and failure behavior.
- `agentic role`
  The role, phase, step, substep, tool budget, structured output, and delegation boundary if an agent owns the work.
- `execution carrier`
  The `Execution`, `PipelineExecution`, `AgentExecution`, `ToolExecution`, run store, event stream, or persisted row that records the work.
- `asset-pack effect`
  The stable written asset, proof artifact, delivery mechanism, or state transition the system may produce.
- `verification`
  The static, unit, integration, runtime, proof, reread, or generated-artifact evidence required to claim the system is implemented.

## Mandatory Specification Shape

Every active or admitted-support inference system must answer the following before promotion:

| Field | Requirement |
| --- | --- |
| Read | Name the Bitcode read in product terms, not legacy task/deliverable shorthand. |
| Prompt ownership | Identify the exact prompt class, Registry primitive, registry path/key structure, generic base PromptParts, specific implementation PromptParts, formatter, and runtime import boundary. |
| Tool ownership | Identify callable tools, schema inputs/outputs, capability limits, and fail-closed behavior. |
| Agent ownership | Identify agent role, phase, step/substep structure, structured output, tool usage, and retry/refine behavior. |
| Execution ownership | Identify where runtime state is stored, streamed, persisted, reread, and proven. |
| Asset ownership | Identify whether the output is a stable written asset, asset pack, proof artifact, state mutation, or delivery mechanism. |
| Boundary posture | Classify as active, admitted support, ingress, compatibility, reference-only, or cut-target. |
| Verification | Name concrete tests, typechecks, runtime load checks, generated proof artifacts, or manual verification gaps. |

Compatibility names may remain only when the specification states what canonical Bitcode meaning they carry and why destructive rename is deferred.

## Inference Implementation Record

Every active or admitted-support package that owns inference behavior must be describable by a stable implementation record.
The record does not read to live in one source file yet, but the repository must make every field recoverable from specification, package docs, source, tests, and generated proof artifacts.
The current V26 source-visible registry is `protocol-demonstration/src/canonical/inference-implementation-records.js`, verified by `protocol-demonstration/test/v26-inference-implementation-records.test.js` and generated into `.bitcode/inference-implementation-records-proof.json`.
The registry proof is structural, not only declarative: it checks top-level record fields, nested prompt/tool/agent/execution/asset-pack section fields, allowed boundary postures, source-backed implementation owner references, source evidence references, typed verification evidence, and hard executable/generated verification footing.

Required record fields:

- `recordId`
  Stable identifier for the inference system, using Bitcode product terms before compatibility names.
- `canonicalNeed`
  The measured or expressed read the system satisfies.
- `promptImplementation`
  Exact prompt classes, Registry primitive, registry path/key structure, generic base PromptParts, specific implementation PromptParts, prompt formatter, prompt execution carrier, and runtime JavaScript carry-through requirement.
- `toolImplementation`
  Exact tool classes/functions, schemas, permission boundary, mutation boundary, and fail-closed behavior.
- `agentImplementation`
  Exact agent role, phase, step/substep factory, structured output contract, registry requirements, and retry/refinement limit.
- `executionImplementation`
  Exact execution carrier, persisted/read model, stream event family, registry hydration, and reread/proof witness.
- `assetPackImplementation`
  The written asset, asset pack, proof artifact, delivery mechanism, state transition, or wrapper payload that can be produced.
- `boundaryPosture`
  One of active, admitted support, ingress, compatibility, reference-only, or cut-target.
- `verificationSet`
  Concrete command, test, typecheck, runtime load, static proof, generated artifact, or manual gap.

The record is incomplete if any field can only be inferred from old naming.
For example, `read-comprehension` is accepted only because package docs, prompt metadata, raw PromptParts, source primitives, package-local typecheck, and proof witnesses all state that the live meaning is Bitcode Read comprehension rather than pre-reform planning, and because the corridor answers why/how/when/where/what/who the code serves Bitcode source-to-shares for an Advanced Engineered Software, Inc. customer.
The same corridor now also requires local read-first code owners so prompt reform and runtime/tool reform cannot drift apart: `AnalyzeReadSemanticsTool`, `ExtractReadRequirementsTool`, `IdentifyReadConstraintsTool`, `GenerateReadSatisfactionCriteriaTool`, `ValidateReadComprehensionTool`, `AnalyzeReadSatisfactionImplementationComplexityTool`, `read-comprehension-primitives`, and `read-comprehension-schemas` own the active generic-tool implementation while `ReadComprehensionToolset` only collects those individually defined tools.
The setup-phase agent is separate: `packages/generic-agents/read-comprehension` owns the PTRR agent that registers and composes those tools before `danger-wall` risk admission, and both read-comprehension packages must remain TypeScript-only source rather than carrying generated JavaScript beside TypeScript.
Likewise, retained support tools such as `repository-setup` are acceptable only when their active contracts resolve `expressedRead` / `readDescription` before `taskDescription` and when their DocCode prompt metadata states Bitcode repository-preparation support instead of older task-first or pre-Bitcode lineage.
Retained grep-backed search tools such as `simple-system-text-search` and their agentic consumers such as `generic-agents/text-searcher` are acceptable only when their canonical prompt owners state Bitcode repository-evidence search for read measurement, source-grounding, proof inspection, and AssetPack planning, while old system-text-search and text-searcher names remain compatibility carriers.
Retained external search agents such as `generic-agents/web-researcher` are acceptable only when their canonical prompt owners state discovery-phase Bitcode read-synthesis web research for auxiliary source context, third-party interface planning, proof-gap question formation, and AssetPack planning, while old web-researcher names remain compatibility carriers and never become scraping-product, canonical-read, proof, delivery, or live product ownership.
Retained lower-level web-search agents and tools such as `generic-agents/web-search` and `generic-tools/web-search` are acceptable only when their agent prompts, DocCode tool prompts, raw PromptParts, package docs, and runtime JS mirrors state source-attributed external evidence support for that same discovery-phase read-synthesis corridor, with explicit source-quality, volatility, unresolved-gap, and proof-boundary behavior.
Retained admission agents such as `generic-agents/danger-wall` are acceptable only when their canonical prompt owners state Bitcode read/AssetPack risk admission for unsafe mutation, private-data exposure, proof/evidence gaps, AssetPack scope mismatch, delivery-mechanism mismatch, likely execution failure, and manual-review triggers, while old danger-wall names remain compatibility carriers and never become generic security-product, canonical-read, proof, mutation, delivery, or live product ownership.
Retained file mutation tools such as `files-maintaining` are acceptable only when their tool prompts state Bitcode written-asset mutation support, asset-pack synthesis use, and proof-facing transaction evidence instead of generic file-system ownership.
The canonical protocol runtime now also treats Read review as a required inference boundary rather than a UI afterthought: after measurement synthesizes the Read and before candidate recall/ranking/fitting begins, `.bitcode/read-review.json` must expose the reviewable Read, allowed `accept` / `reject` / `remeasure-with-feedback` decisions, reviewer feedback, source-to-shares focus, and fit-search admission state.
Records may state that no independent tool or agent is promoted, but the supporting contract must say so explicitly; prompt and execution owners must remain concrete source-backed references.
Verification entries are classified as `executable-command`, `generated-artifact`, `source-test`, or `declared-gap`; generated artifacts and source tests must resolve to files, and declared gaps expose blockers rather than satisfying a passing implementation record.

## Complete Coverage Ledger

Fifth-gate prompt closure requires every prompt/tool/agent/execution system to land in this ledger before it is treated as live Bitcode behavior.

| System family | Required prompt implementation | Required tool implementation | Required agentic implementation | Required execution implementation | Required verification |
| --- | --- | --- | --- | --- | --- |
| Prompt primitives | `PromptPart`, `Prompt`, `PromptExecution`, formatters, raw PromptParts, and TS/JS carry-through | none directly; prompt primitives must remain import-safe support for tools | none directly | `PromptExecution` binds prompt material to execution evidence | prompt package tests, prompt runtime loadability, prompt-system proof |
| Tool prompt infrastructure | `DocCodeToolPrompt`, `formatUsableTools`, doc-code prompt labels, tool prompt registries | `Tool`, `ToolExecution`, `ToolPromptRegistry`, doc-code decorators/loaders | tool descriptions can be injected into agent runs but do not own the agent | `ToolExecution` and prompt registry evidence | support package subpath tests, doc-code transform tests, package manifests |
| Agent infrastructure | `AgentPrompt`, `AgentStepPrompt`, generation/failsafe/tool prompt overlays | tool registries and bounded callable capabilities | agent factories, substeps, structured outputs, retry/refine limits | `AgentExecution`, agent registries, diagnostics, file-diff evidence | prompt boundary tests, agent/pipeline typechecks, proof artifacts |
| Execution infrastructure | `ExecutionPrompt` and public prompt primitive imports | execution-level tool registry support, with mutating tool behavior owned by tool records | none directly; agents layer above base execution | `Execution`, execution registry, storage/stream adapters, typed stores, and work updates | execution package typecheck, prompt boundary tests, runs-pipelines proof |
| Pipeline infrastructure | `PipelinePrompt`, phase prompts, prompt registries | pipeline tool registries and MCP-facing callable adapters | phase factory, meta-phase orchestrator, setup/discovery/implementation/validation/finish agents | `PipelineExecution`, phase/subexecution, metrics, resume, streams | runs-pipelines proof, deliverable reform tests, package-local checks |
| Conversation inference | `BitcodeTerminalConversationSystemPrompt` and `apps/uapi/prompts/bitcode-terminal-system-prompt.ts` | conversation tool registration and attachment/destination tool posture | `ConversationAgent` and rich-input write surface | conversation persistence, stream events, ad hoc execution continuity | conversation tests, prompt surface tests, persistence proof |
| Asset-pack synthesis compatibility | AssetPack-run prompts, `comprehend-read` overlays, repository-evidence search prompt owners, raw PromptParts, prompt renderer | clone/VCS, repository-evidence search, written-asset file mutation, pull-request Shippable, template, and delivery-mechanism tools | setup, repository-evidence search, ready-to-iterate, validation, Finish, asset-pack completion agents | registry-bearing pipeline runtime, postprocess/read models, execution history | `v26-shippable-reform`, `v26-pipeline-finish-reform`, repository-evidence search witness, text-searcher agent witness, files-maintaining prompt witness, package typecheck boundary, prompt-system proof |
| Read-comprehension support | read-first local DocCode prompt owners such as `AnalyzeReadSemantics`, `ExtractReadRequirements`, `IdentifyReadConstraints`, `GenerateReadSatisfactionCriteria`, `ValidateReadComprehension`, and `AnalyzeReadSatisfactionImplementationComplexity`, all with `read-comprehension` metadata and reformed raw PromptParts | individually defined local read-first tool owners `AnalyzeReadSemanticsTool`, `ExtractReadRequirementsTool`, `IdentifyReadConstraintsTool`, `GenerateReadSatisfactionCriteriaTool`, `ValidateReadComprehensionTool`, and `AnalyzeReadSatisfactionImplementationComplexityTool`, collected by `ReadComprehensionToolset`, with `read-comprehension-primitives` and `read-comprehension-schemas` keeping pure behavior | `packages/generic-agents/read-comprehension` owns the setup/pre-danger-wall PTRR agent that registers those tools and emits a reviewable Read model plus risk-admission input | `AgentExecution`, composed `ToolExecution` evidence, and setup `read-comprehension` execution-store mirrors; package sources are TypeScript-only and generated JavaScript must not live beside TS in `src/` | package-local no-emit typecheck, prompt boundary test, read-comprehension reform test, inference-record proof |
| Read review before fit search | measured Read surfaces and review-decision payloads emitted by `protocol-demonstration/src/canonical/read-measurement.js`; feedback is bound to remeasurement requests rather than hidden operator notes | no independent external tool; the review gate is a protocol admission decision over the measured Read | no independent agent promotion; live local review is deterministic fifth-gate baseline and later gates may add operator/agent assistance | `.bitcode/read-review.json`, pipeline telemetry `read-review`, and branch artifact required-path closure record the pre-fit admission state | `protocol-demonstration/test/v26-read-review-source-to-shares.test.js`, branch artifact contract checks, and proof-witness digest coverage |
| Read-synthesis web research/search support | `web-researcher` and `web-search` prompt owners, `WEBRESEARCHER`, `WEBSEARCH`, `WEB_SEARCH`, `WEBSEARCHTOOL`, `WEBSEARCH_DOCCODE`, `GETCONTENTS_DOCCODE`, and `MULTIPROVIDERSEARCH_DOCCODE` compatibility raw PromptParts, generic generation/failsafe PromptParts, DocCode tool prompts, and public prompt subpaths | admitted web-search/content tools only for source-attributed read-synthesis evidence | `bitcodeReadSynthesisWebResearcher` PTRR agent plus `bitcodeReadSynthesisWebSearch` lower-level support agent with compatibility aliases | parent `AgentExecution`/pipeline execution evidence and downstream proof/read-model references | web-researcher and web-search compatibility witnesses, inference implementation record, prompt-system proof, raw PromptPart TS/JS carry-through |
| Read/AssetPack risk-admission support | `danger-wall` prompt owners, `DANGERWALL` compatibility raw PromptParts, generic generation/failsafe PromptParts, and public prompt subpaths | evidence tools only when needed to resolve admission ambiguity; no mutation, delivery, or proof-generation tools | `bitcodeReadRiskAdmissionAgent` PTRR agent with `dangerWall*` compatibility aliases | parent `AgentExecution`/pipeline execution evidence and retained setup short-circuit state | danger-wall compatibility witness, inference implementation record, prompt-system proof, raw PromptPart TS/JS carry-through |
| MCP and external ingress | MCP prompt/tool descriptions where admitted | narrowed Exchange-facing tool families and fail-closed create admission | no invisible agent promotion without a record | queue/run/execution creation, provider/repository ingress, operator reread | MCP tests, package-local typechecks, retained-package admissibility proof |

## Prompt Requirements

Prompt-bearing systems must:

- import prompt primitives through public `@bitcode/prompts` package boundaries or stable narrow subpaths;
- treat `Prompt` as `RegistryImpl<PromptPart>` and specify the Registry path/key strategy, priority/merge expectation, and inheritance-by-registry behavior for every live/admitted prompt implementation;
- classify `raw_promptparts/generic` / `PROMPTPART_GENERIC_*` as reusable base PromptPart layers and `raw_promptparts/specific` / `PROMPTPART_SPECIFIC_*` as concrete implementation PromptPart layers;
- prove that generic base PromptParts and specific implementation PromptParts compose through explicit Registry-backed carriers rather than hidden strings or unspecific filesystem inference;
- enforce agent prompt hierarchy through verifier code and runtime/type boundaries where available: `factoryAgentWithPTRR` must receive a Registry-backed agent prompt carrier plus complete plan/try/refine/retry step Prompt registries, must fail closed when that carrier is absent or partial, and direct `execution.prompt` mutation remains invalid;
- require active Terminal conversation agents to source agent identity and PTRR step purposes from specific raw PromptParts, not inline string-cast prompt fragments;
- keep active documentation and source comments aligned with that verifier by describing factory-owned prompt attachment rather than manual `execution.prompt = ...` assignment;
- keep raw promptpart TypeScript and runtime JavaScript content equivalent;
- keep package-local prompt typecheck configs source-backed and no-emit when they verify retained prompt reservoirs without owning emitted artifacts;
- prefer semantic aliases such as `read`, `writtenAssetType`, `writtenAssets`, `assetPack`, `readSatisfactionCriteria`, and `deliveryMechanism` before legacy compatibility aliases;
- preserve doc-comment/doc-code prompt injection where tools read build-time tool descriptions in agentic runs;
- reject non-Bitcode prompt content that teaches parallel product semantics, hidden task-first planning, PR-first delivery, or experimental cognitive/transcendent language as live Bitcode behavior.

## Tool Requirements

Tool-bearing systems must:

- declare their package dependencies rather than relying on transitive workspace reach-through;
- expose public package subpaths for any support primitive they expect others to consume;
- describe exact parameter and output shapes in prompt content or schema source;
- define fail-closed behavior for missing auth, readiness, repository anchoring, permissions, or provider bindings where the tool can mutate state or spend `$BTD`;
- separate stable written assets from connected-interface Shippables.

## Agentic Requirements

Agentic systems must:

- name the phase, step, substep, prompt overlay, and tool registry they use;
- bind structured outputs to semantic Bitcode fields before compatibility fields;
- answer the source-to-shares service questions: why, how, when, where, what, and who this code serves for an Advanced Engineered Software, Inc. customer, plus what evidence makes the answer auditable;
- record tool/prompt/llm/agent registry state when running inside retained compatibility corridors;
- emit enough execution store evidence for reread, proof, and operator-visible diagnostics;
- keep retries/refinement bounded by the expressed read and satisfaction criteria.

## Execution Requirements

Execution systems must:

- use `Execution`, `PipelineExecution`, `AgentExecution`, `ToolExecution`, and `PromptExecution` as explicit carriers rather than route-local hidden state;
- persist or expose enough state for Terminal reread, Exchange route coherence, event streams, run history, and generated proof witnesses;
- keep read models, mock fallback projections, and persisted rows semantically aligned on the same `read` / `assetPack` / `writtenAsset` meaning;
- avoid pulling storage/logging/runtime reservoirs through broad package barrels when only base execution ancestry is required.

## Current Package Matrix

| Corridor | Required V26 inference specification |
| --- | --- |
| `packages/prompts/*` | canonical `PromptPart`, Registry-backed `Prompt`, `PromptExecution`, formatter, generic base raw PromptPart layer, specific implementation raw PromptPart layer, and runtime carry-through ownership |
| `packages/tools-generics/*` | tool primitive, `ToolExecution`, `ToolPromptRegistry`, doc-code prompt injection, and public support subpaths |
| `packages/doc-comment-generics/*`, `packages/generic-doc-comments/doc-code/*` | build-time annotation and tool prompt attachment support, with examples/plugins remaining reference-only unless promoted |
| `packages/agent-generics/*` | agent prompt hierarchy, structured output, step/substep, retry/refine, tool/llm registry, and agent execution ownership |
| `packages/execution-generics/*`, `packages/pipelines-generics/*` | execution tree, prompt-aware registry, pipeline/phase hierarchy, streaming, metrics, and resume ownership |
| `packages/asset-packs-pipelines/domain/*` | retained asset-pack written-asset synthesis corridor with `read`, `writtenAssetType`, `writtenAssets`, `assetPack`, `deliveryMechanism`, and compatibility wrappers |
| `packages/generic-tools/simple-system-text-search/*`, `packages/host-commands/grep/*` | retained grep-backed search corridor now specified as Bitcode repository-evidence search support for read measurement, source-grounding, proof inspection, and AssetPack planning |
| `packages/generic-agents/text-searcher/*` | retained text-searcher corridor now specified as an admitted Bitcode repository-evidence search agent with canonical exports and compatibility aliases |
| `packages/generic-agents/web-researcher/*`, `packages/generic-agents/web-search/*`, `packages/generic-tools/web-search/*`, `packages/web-search/*` | retained external search corridor now specified as admitted discovery-phase read-synthesis web research/search support for source-attributed read context, third-party interface planning, proof-gap question formation, source-quality review, volatility, unresolved evidence gaps, and AssetPack planning |
| `packages/generic-agents/danger-wall/*` | retained danger-wall corridor now specified as admitted Bitcode read/AssetPack risk admission for unsafe mutation, private-data exposure, proof gaps, AssetPack scope fit, delivery-mechanism fit, likely execution failure, and manual-review triggers |
| `packages/generic-tools/read-comprehension/*` | individually owned Bitcode read-comprehension prompt/tool primitives with local read-first code ownership, source-to-shares service-question evidence, TypeScript-only source, and read-first raw PromptPart families |
| `packages/generic-agents/read-comprehension/*` | setup/pre-danger-wall PTRR Read-comprehension agent that registers and composes the individual generic-tools before risk admission |
| `packages/conversations/*`, `apps/uapi/prompts/*` | rich-input conversation prompt and Terminal-facing inference binding |
| `packages/mcp-generics/*` | admitted Exchange-facing MCP inference ingress, narrowed to currently admitted tool families and fail-closed create admission |

## Promotion Control

An inference corridor is not fifth-gate complete when it merely typechecks or has prompt text.
It is complete only when:

- its canonical read and implementation boundary are specified;
- its prompt/tool/agent/execution carrier is source-visible;
- its Prompt-type Registry carrier, generic base PromptParts, and specific implementation PromptParts are explicitly mapped;
- its compatibility names are explicitly mapped or removed;
- its package dependencies and public subpaths are honest;
- its runtime and proof evidence can be regenerated from source.

Later gates may refine quality, viability, and commercial launch posture, but fifth-gate must establish this baseline for every active and admitted-support inference system.

## Prompt-Space Witness Baseline

The prompt-space completeness proof is generated during fifth-gate but remains an eighth-gate closure proof.
Its fifth-gate job is narrower and concrete: prove that the prompt substrate is source-visible enough to support active and admitted-support inference records without hidden prompt ownership.

The generated `.bitcode/prompt-space-completeness-proof.json` witness must cover, at minimum:

- primitive `PromptPart`, `Prompt`, `PromptExecution`, formatter, and raw PromptPart public contracts
- active agent, execution, pipeline, and conversation prompt carriers
- `doc-comment` and `doc-code` tool prompt injection support
- retained asset-pack compatibility prompts and read-comprehension read-first prompt owners
- retained read-synthesis web research/search compatibility prompts
- TypeScript and runtime JavaScript raw PromptPart carry-through for reformed compatibility prompts
- Terminal conversation prompt binding and admitted Bitcode MCP prompt/tool ingress
- specification, implementation-record, and test witnesses tying the prompt surface to generated proof

`baselinePassed: true` supports fifth-gate progress only when those witness sets are present.
`passed: true` is required after eighth-gate prompt-space saturation proves every live inference path across the retained repository is explainable from the explicit prompt substrate.
