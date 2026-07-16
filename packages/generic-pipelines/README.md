# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy (names encode full ancestry left→right)

```
Pipeline # primitive (@bitcode/pipelines-generics)
 ↑
ExecutionPipelineSDIVF # (@bitcode/generic-pipelines-execution-pipeline-sdivf)
ExecutionPipelineSimple # (@bitcode/generic-pipelines-execution-pipeline-simple)
 ↑
ExecutionPipelineSDIVFSynthesizeDepositAssetPacks
ExecutionPipelineSDIVFSynthesizeReadAssetPacks
ExecutionPipelineSimpleSettleAssetPack
```

Parity with agents: **ExecutionPipelineSimple** is to **ExecutionPipelineSDIVF** as **QuickAgent** is to **PTRRAgent**.

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `execution-pipeline-sdivf/` | `@bitcode/generic-pipelines-execution-pipeline-sdivf` | `ExecutionPipelineSDIVF` base (Setup-[DIV]*-Finish) |
| `execution-pipeline-simple/` | `@bitcode/generic-pipelines-execution-pipeline-simple` | `ExecutionPipelineSimple` base (linear stages) |

Product pipelines supply stage/phase agents; they do not reimplement base loops.
**Naming law:** every type/factory/package folder name must express the full
inheritance chain (e.g. `execution-pipeline-sdivf-synthesize-reads-asset-packs`).
**No lens:** deposit synthesis, read synthesis, and settle are separate
specific pipelines — never one factory parameterized by deposit|read.
