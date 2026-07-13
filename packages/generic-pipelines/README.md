# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy (names encode full ancestry)

```
Pipeline # primitive (@bitcode/pipelines-generics)
 ↑
SDIVFPipeline # base + primitive (@bitcode/generic-pipelines-sdivf)
SimplePipeline # base + primitive (@bitcode/generic-pipelines-simple)
 ↑
SynthesizeDepositAssetPacksSDIVFPipeline # asset-packs-pipelines/synthesize-deposits
SynthesizeReadAssetPacksSDIVFPipeline # asset-packs-pipelines/synthesize-reads
SettleAssetPacksSimplePipeline # asset-packs-pipelines/settle-reads
```

Parity with agents: **SimplePipeline** is to **SDIVFPipeline** as **QuickAgent** is to **PTRRAgent**.

```
@bitcode/pipelines-generics # factoryPipeline → Pipeline
 ↑
@bitcode/generic-pipelines-sdivf # factorySDIVFPipeline → SDIVFPipeline
@bitcode/generic-pipelines-simple # factorySimplePipeline → SimplePipeline
 ↑
@bitcode/asset-packs-pipelines-* # product synthesis / settle pipelines
```

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `SDIVF/` | `@bitcode/generic-pipelines-sdivf` | `SDIVFPipeline` base (Setup-[DIV]*-Finish) |
| `Simple/` | `@bitcode/generic-pipelines-simple` | `SimplePipeline` base (linear stages) |

Product pipelines supply stage/phase agents; they do not reimplement base loops.
**Naming law:** every type/factory name must express the full inheritance chain
(e.g. `SettleAssetPacksSimplePipeline`, not bare `SettlePipeline`).
**No lens:** deposit synthesis, read synthesis, and settle-reads are separate
specific pipelines — never one factory parameterized by deposit|read.
## Nested-package pattern

`packages/generic-pipelines/` is a **family folder** (README only). Each base
pipeline implementation is a nested package under this folder — same rule as
`generic-agents/*`, `generic-tools/*`, and `generic-llms/*`.
