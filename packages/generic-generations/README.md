# generic-generations

Base generation implementations that extend `@bitcode/generation-generics` primitives.

## Hierarchy (names encode full ancestry)

```
Generation # primitive (@bitcode/generation-generics)
 ↑
FailsafeGeneration # base kinds: PCC / ChunkThenSum / Stitch
ThinkingsGeneration # base kinds: Reason → Judge → StructuredOutput
 ↑
(createFailsafeGenerationSequence / createThinkingsGeneration — composition)
 ↑
PTRRAgent steps # each step: 3 FailsafeGenerations × Thinkings + tools
```

```
@bitcode/generation-generics # Generation / FailsafeGeneration / ThinkingsGeneration
 ↑
@bitcode/generic-generations-failsafes # failsafes/ (prepared-context + Failsafe surface)
@bitcode/generic-generations-thinkings # thinkings/ (Thinkings vocabulary surface)
 ↑
@bitcode/agent-generics # Agent primitive; hosts LLM-bound factories today
 ↑
@bitcode/generic-agents-ptrr # PTRRAgent steps compose Failsafe + Thinkings
 ↑
product # specialized agents (no reimplementation)
```

**Legacy naming (do not use in new code):** `ThricifiedGeneration` → prefer
`ThinkingsGeneration`; `SubStep` was the old term for Generation within a Step.
`FailsafeGeneration` is already modern. Meta is not a term.

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `failsafes/` | `@bitcode/generic-generations-failsafes` | FailsafeGeneration base + prepared-context types |
| `thinkings/` | `@bitcode/generic-generations-thinkings` | ThinkingsGeneration base vocabulary |

### Ownership note (LLM-bound factories)

`factoryPrepareConciseContext`, `factoryChunkThenSum`, `factoryStitchUntilComplete`,
`factoryReason` / `factoryJudge` / `factoryStructuredOutput`, and
`createFailsafeGenerationSequence` currently still execute through
`AgentExecution` registries inside `@bitcode/agent-generics`. Those factories
are **logically** generic-generation bases; physical extraction continues as
execution dependencies invert onto pure `Execution` + LLM registry.
