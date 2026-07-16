# LLM call-site prompt composition

**Law:** Every LLM call’s **system** string is built by walking the
**execution tree** root → leaf and formatting each node’s `ExecutionPrompt`,
with a **role filter** for the active failsafe + thinking. **User** string is
built by the generation factory (schema prefix + task body).

## Execution nodes (runtime hierarchy)

```
PipelineExecution.prompt     ← pipeline:primitive + pipeline:base + pipeline:specific
  └─ PhaseDelegation.prompt  ← phase:primitive:{name} + phase:base + phase:specific
       └─ AgentExecution.prompt   ← agent base+specific (flattened at agent start)
            └─ StepExecution.prompt   ← step purpose (plan/try/retry/refine)
                 └─ FailsafeGenerationExecution.prompt  ← active failsafe law
                      └─ ThinkingsGenerationExecution.prompt  ← active thinking law
```

`buildHierarchicalPrompt(leaf)` in
`@bitcode/agent-generics` (`generations/llm-bound-factories.ts`) joins each
node’s formatted parts with `\n\n---\n\n`.

## Content layers (authoring hierarchy)

At **each** node kind, content is authored as:

| Layer | Package family | Example |
| --- | --- | --- |
| **Primitive** | `pipelines-generics`, `agent-generics` | What a pipeline/phase/generation *is* |
| **Base** | `generic-pipelines-sdivf`, `generic-agents/*` | SDIVF pattern; VCS agent |
| **Specific** | `asset-packs-pipelines/*` | synthesize-reads; clone agent |

**Compose rules:**

1. **Authoring:** `Prompt.clone().merge(overlay)` or distinct paths
   (`agent:identity:asset-pack:addendum`) so specific **augments** base.
2. **Attach:** `applyPromptRegistryToExecutionPrompt(target, layer, { namespace })`
   namespaces parts under `specific_execution:{namespace}:…`.
3. **Same path later wins** (override). Prefer additive paths over overwrite.
4. **Role filter** at format time: only active failsafe + active thinking
   generation parts; Plan tool surface default `[]` (no tool docs).

## Pipeline attach (SDIVF)

On SDIVF start (`factorySDIVFPipeline` / `FromExecutors`):

```ts
attachPipelinePromptHierarchy(pipelineExec, {
  base: SDIVF_PIPELINE_PROMPT,           // generic-pipelines-sdivf
  specific: productPipelinePrompt,       // e.g. ASSET_PACKS_SYNTHESIZE_READS_…
});
// always includes PRIMITIVE_PIPELINE_PROMPT
// resolvePipelinePromptHost: attaches on root PipelineExecution, not seq-N child
```

**Sequential caveat:** `sequential(...).child('seq-N')` means the attach step
and later phase steps are **siblings**. Pipeline layers must land on a shared
ancestor (root / `PipelineExecution`), never only on `seq-0`.

On each phase entry:

```ts
const phaseExec = factoryPhaseDelegation(phase, pipelineExec);
attachPhasePromptHierarchy(phaseExec, phase, {
  base: sdivfPhasePromptFor(phase),
  specific: productPhasePrompt,          // e.g. ASSET_PACKS_SETUP_PHASE_READ_…
});
// agents run under phaseExec so the walk includes phase + pipeline
```

## Agent / step / failsafe / thinking (unchanged ownership)

| Node | Who writes Prompt |
| --- | --- |
| Agent | Product agent: base agent Prompt `.merge(specific)`; `factoryPTRRAgent` flattens onto `AgentExecution.prompt` |
| Step | `factoryPlanStep` etc. set `step:purpose` from step Prompt |
| Failsafe | Primitive PromptPart via `getSequencePrompt` / PCC attach |
| Thinking | Primitive PromptPart via `factoryLLMGeneration` |

## Tools (parallel surface, not Prompt registry)

| Level | Behavior |
| --- | --- |
| Pipeline / agent | Tool catalog registration |
| Step | `applyStepToolSurface` allowlist; Plan/Refine default `[]`; Try/Retry default agent catalog |
| Postprocess | Try/Retry only after failsafes if `useTools` |

## First debug call-site (expected system blocks)

Read · setup · clone-vcs · plan · prepare_concise_context · reason:

1. **pipeline:** primitive + SDIVF base + synthesize-reads specific  
2. **phase:** primitive setup + SDIVF setup + read setup specific  
3. **agent:** VCS base + AssetPack clone specific  
4. **step:** Plan purpose (strategy); **tools.usable = []** (Plan default)  
5. **failsafe:** PCC law  
6. **thinking:** Reason law  

User: JSON schema prefix + PCC selection body (`preparation`, `system`, `pipeline_execution_keys`).

**Wire markers to grep in debug dumps** (`systemPrompt` / ledger):

| Marker | Layer |
| --- | --- |
| `Bitcode Pipeline` | pipeline:primitive |
| `follows SDIVF` | pipeline:base |
| `Lens: READ` / `Lens: DEPOSIT` | pipeline:specific |
| `phase "setup"` | phase:primitive:setup |
| `Setup prepares the Host` | phase:base:setup (SDIVF) |
| `Setup (read):` / `Setup (deposit):` | phase:specific:setup |

Debug: `pnpm run debug:read:first-llm` (marker still Plan/PCC/reason).

## Key modules

| Module | Role |
| --- | --- |
| `pipelines-generics/prompts/compose-execution-prompt.ts` | Apply / merge Prompt → ExecutionPrompt |
| `pipelines-generics/prompts/attach-hierarchy-prompts.ts` | Pipeline + phase attach |
| `pipelines-generics/prompts/primitive-*.ts` | Primitive pipeline/phase text |
| `generic-pipelines-sdivf/prompts/*` | SDIVF base pipeline/phase text |
| `asset-packs-pipelines-domain/prompts/*` | Product pipeline/phase text |
| `agent-generics/.../llm-bound-factories.ts` | `buildHierarchicalPrompt` + role filter |
