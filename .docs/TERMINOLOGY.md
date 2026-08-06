# Bitcode Terminology Guide

*"Documentation should be a mirror of the source code, not an interpretation."*

This guide provides the precise terminology used in the Bitcode codebase, verified against actual implementation.

## Core Execution Patterns

### PTRR Pattern (Current Implementation)

**Source**: `/packages/agent-generics/src/types.ts`, `/packages/generic-agents/PTRR`

The codebase uses `AgentVariationStep` enum:
```typescript
export enum AgentVariationStep {
 PLAN = 'plan',
 TRY = 'try',
 REFINE = 'refine',
 RETRY = 'retry'
}
```

Preferred factory: `factoryPTRRAgent` (`factoryPTRRAgent` is ).

### Generation hierarchy within a PTRR step

**Source**: `/packages/generation-generics/src/types.ts`

```
Generation (primitive)
 → FailsafeGeneration (base kinds — parents)
 → ThinkingsGeneration (base kinds — children of each failsafe)
```

#### FailsafeGeneration kinds (3)
```typescript
export enum FailsafeGeneration {
 PREPARE_CONCISE_CONTEXT = 'prepare_concise_context', // CONTEXT SIGNAL/NOISE
 CHUNK_THEN_SUM = 'chunk_then_sum', // BIG INPUT
 STITCH_UNTIL_COMPLETE = 'stitch_until_complete' // BIG OUTPUT repair
}
```

#### ThinkingsGeneration kinds (3)
```typescript
export enum ThinkingsGeneration {
 REASON = 'reason',
 JUDGE = 'judge',
 STRUCTURED_OUTPUT = 'structured_output'
}
```

#### Tools (postprocess, not a Failsafe/Thinkings generation)
- `tools_execution` — after all failsafes, **once**, if structured output includes `useTools`

**Total per PTRR step**: 3 FailsafeGenerations × Thinkings composition + optional tools postprocess.

Architecture interface: `PTRRStepGenerationArchitecture`.

### Tools: parameters, docs, results

| Term | Meaning |
| --- | --- |
| **Usable tools** | Tools visible via `AgentToolsRegistry.getUsableTools()` (hierarchy). |
| **Doc interpolation** | `formatUsableTools` → `auto:tools_doc_code_tools` on Thinkings prompts. |
| **useTools** | LLM selection: `{ name, input, reason }[]` on step structured output. |
| **usedTools** | Execution results: `{ tool, input?, output?, error? }[]`. |
| **Results interpolation** | Prior `usedTools` → `auto:tools_results` on later generations. |
| **DocCodeToolPrompt** | Prompt carrier for purpose/capabilities/**parameters**/**output** sections. |

Full guide: `packages/agent-generics/TOOLS-IN-PTRR.md`.

### Legacy names (do not use in new code)

| Legacy | Prefer |
| --- | --- |
| `ThricifiedGeneration` | `ThinkingsGeneration` |
| `SubStep` / `GenerationExecution` | `Generation` / `GenerationExecution` |
| `FailsafeExecution` | `FailsafeGenerationExecution` |
| `PTRRSubStepArchitecture` | `PTRRStepGenerationArchitecture` |
| `AgentGenerationSubStepPrompt` | `ThinkingsGenerationPrompt` |

`FailsafeGeneration` and `FailsafeGenerationPrompt` are already the modern
names (no rename). "SubStep" was the old term for Generation within a Step.
"Meta" is not a term.

## Prompt System

### PromptPart
**Source**: `/packages/prompts/src/parts/PromptPart.ts`
- Branded string type: `string & { readonly __brand: 'PromptPart' }`
- Created via `createPromptPart(content: string): PromptPart`

### Prompt Class
**Source**: `/packages/prompts/src/prompt.ts`
- Registry-based formatting system
- Hierarchical path organization

### Generation prompt levels
1. `AgentPrompt` — name + identity
2. `AgentStepPrompt` — Plan/Try/Refine/Retry purpose
3. `FailsafeGenerationPrompt` — failsafe handling instruction
4. `ThinkingsGenerationPrompt` — Reason/Judge/Output instruction
5. `ToolExecutionPrompt` — tool postprocess

## Hosts

Use **Host** for pipeline execution boxes (LocalHost, SandboxHost). Do not use
"Harness" for Host.
