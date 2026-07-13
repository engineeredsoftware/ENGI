# generic-generations

Base generation implementations that extend `@bitcode/generation-generics` primitives.

## Nested-package pattern

`packages/generic-generations/` is a **family folder** (README only). Each base
implementation is a nested package — same rule as `generic-llms/*`,
`generic-pipelines/*`, `generic-agents/*`.

```
@bitcode/generation-generics                 # Generation / failsafe / thinkings vocabulary
        ↑
@bitcode/generic-generations-failsafes       # failsafes/  (PCC, ChunkThenSum, Stitch + context types)
@bitcode/generic-generations-thinkings       # thinkings/  (Reason → Judge → StructuredOutput)
        ↑
@bitcode/agent-generics                      # Agent + PTRR composition (hosts LLM-bound factories today)
        ↑
@bitcode/pipeline-asset-pack                 # product synthesis / phase agents
```

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `failsafes/` | `@bitcode/generic-generations-failsafes` | Failsafe base + **prepared-context types** (formerly `@bitcode/context` concise helpers) |
| `thinkings/` | `@bitcode/generic-generations-thinkings` | Thinkings base composition |

### Ownership note (LLM-bound factories)

`factoryPrepareConciseContext`, `factoryChunkThenSum`, `factoryStitchUntilComplete`,
`factoryReason` / `factoryJudge` / `factoryStructuredOutput`, and
`createFailsafeGenerationSequence` currently still execute through
`AgentExecution` registries inside `@bitcode/agent-generics`. Those factories
are **logically** generic-generation bases; physical extraction continues as
execution dependencies invert onto pure `Execution` + LLM registry. Prefer
importing pure failsafe **context types** from
`@bitcode/generic-generations-failsafes` and generation **vocabulary** from
`@bitcode/generation-generics` in new code.
