# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy (names encode full ancestry left→right)

```
ExecutionPipeline                         # primitive (@bitcode/pipelines-generics)
  ↑
ExecutionPipelineSDIVF                    # (@bitcode/generic-pipelines-execution-pipeline-sdivf)
  + ExecutionPipelineSDIVFExecutionPhase
  + ExecutionPipelineSDIVFExecutionPhaseDelegator
ExecutionPipelineSimple                   # (@bitcode/generic-pipelines-execution-pipeline-simple)
  ↑
ExecutionPipelineSDIVFSynthesizeDepositAssetPacks
ExecutionPipelineSDIVFSynthesizeReadAssetPacks
ExecutionPipelineSimpleSettleAssetPack
```

**Architectural split:**
- `pipelines-generics` — ExecutionPipeline primitives only (EE, registries, pipeline prompt attach). **No phases.**
- `execution-pipeline-sdivf` — SDIVF base loop **and** all phase EE/delegator/prompt concepts.
- `execution-pipeline-simple` — linear stages (no phase vocabulary).

Parity with agents: **ExecutionPipelineSimple** is to **ExecutionPipelineSDIVF** as **QuickAgent** is to **PTRRAgent**.

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `execution-pipeline-sdivf/` | `@bitcode/generic-pipelines-execution-pipeline-sdivf` | `ExecutionPipelineSDIVF` + `ExecutionPipelineSDIVFExecutionPhase*` |
| `execution-pipeline-simple/` | `@bitcode/generic-pipelines-execution-pipeline-simple` | `ExecutionPipelineSimple` base (linear stages) |

Product pipelines supply stage/phase agents; they do not reimplement base loops.
**Naming law:** every type/factory/package folder name must express the full
inheritance chain (e.g. `execution-pipeline-sdivf-synthesize-reads-asset-packs`).
**No lens:** deposit synthesis, read synthesis, and settle are separate
specific pipelines — never one factory parameterized by deposit|read.
