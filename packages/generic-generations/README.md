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

### Tests co-locate with the owning package

| Unit | Package tests live in |
| --- | --- |
| PrepareConciseContext (PCC) + pure prepared-context helpers | `failsafes/src/__tests__/` |
| Thinkings vocabulary (when suite lands) | `thinkings/src/__tests__/` |
| Agent/PTRR *composition* that uses failsafes | implementing package (e.g. `agent-generics`) |

Do **not** re-host PCC under `agent-generics` because the factory is temporarily
hosted there. Implementer exception: specialization tests stay with the
implementing package. Law: `.docs/AGENTS.md`, `CONTRIBUTING.md` §8.0.

```bash
pnpm --filter @bitcode/generic-generations-failsafes test
```

