# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy (names encode full ancestry)

```
Pipeline # primitive (@bitcode/pipelines-generics)
 ↑
ExecutionPipelineSDIVF # base + primitive (@bitcode/generic-pipelines-sdivf)
ExecutionPipelineSimple # base + primitive (@bitcode/generic-pipelines-simple)
 ↑
ExecutionPipelineSDIVFSynthesizeDepositAssetPacks # asset-packs-pipelines/synthesize-deposits
ExecutionPipelineSDIVFSynthesizeReadAssetPacks # asset-packs-pipelines/synthesize-reads
ExecutionPipelineSimpleSettleAssetPack # asset-packs-pipelines/settle-reads
```

Parity with agents: **ExecutionPipelineSimple** is to **ExecutionPipelineSDIVF** as **QuickAgent** is to **PTRRAgent**.

```
@bitcode/pipelines-generics # factoryPipeline → Pipeline
 ↑
@bitcode/generic-pipelines-sdivf # factoryExecutionPipelineSDIVF → ExecutionPipelineSDIVF
@bitcode/generic-pipelines-simple # factoryExecutionPipelineSimple → ExecutionPipelineSimple
 ↑
@bitcode/asset-packs-pipelines-* # product synthesis / settle pipelines
```

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `SDIVF/` | `@bitcode/generic-pipelines-sdivf` | `ExecutionPipelineSDIVF` base (Setup-[DIV]*-Finish) |
| `Simple/` | `@bitcode/generic-pipelines-simple` | `ExecutionPipelineSimple` base (linear stages) |

Product pipelines supply stage/phase agents; they do not reimplement base loops.
**Naming law:** every type/factory name must express the full inheritance chain
(e.g. `ExecutionPipelineSimpleSettleAssetPack`, not bare `SettlePipeline`).
**No lens:** deposit synthesis, read synthesis, and settle-reads are separate
specific pipelines — never one factory parameterized by deposit|read.
## Nested-package pattern

`packages/generic-pipelines/` is a **family folder** (README only). Each base
pipeline implementation is a nested package under this folder — same rule as
`generic-agents/*`, `generic-tools/*`, and `generic-llms/*`.
