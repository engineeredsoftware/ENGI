# Pipelines Generics

ExecutionPipeline **primitives** only (based on Execution).

## What This Package IS

- **ExecutionPipeline** — EE for top-level pipeline orchestration
- **ExecutionPipelineFn** — Executor form of a pipeline
- **ExecutionPipelineQuick** — single-stage non-SDIVF wrapper
- **Registries** — agents / tools / LLMs / prompts on the pipeline EE
- **Streaming, metrics, resume** — pipeline infrastructure
- **Pipeline prompt attach** — `attachExecutionPipelinePromptHierarchy` (Execution once)

## What This Package IS NOT

- **NOT phases** — `ExecutionPipelineSDIVFExecutionPhase*` live in
  `@bitcode/generic-pipelines-execution-pipeline-sdivf`
- **NOT SDIVF / Simple base loops** — those live under `generic-pipelines/`
- **NOT product pipelines** — `asset-packs-pipelines/syntheses/{deposit,read} and settle/`
- **NOT agents / tools** — `agent-generics` / `tools-generics` + `generic-*`

## Hierarchy

```
pipelines-generics                          # this package (primitives)
  → generic-pipelines/execution-pipeline-sdivf   # SDIVF + phases
  → generic-pipelines/execution-pipeline-simple  # linear stages
    → asset-packs-pipelines/*                    # product
```

## Core types

```typescript
type ExecutionPipelineFn<TInput, TOutput> = Executor<TInput, TOutput>;
class ExecutionPipeline extends Execution { /* … */ }
function factoryExecutionPipeline(name: string, parent?: Execution): ExecutionPipeline;
```

For SDIVF phases and the Setup-[DIV]*-Finish loop, import from
`@bitcode/generic-pipelines-execution-pipeline-sdivf`.
