# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy (names encode full ancestry)

```
Pipeline                                    # primitive (@bitcode/pipelines-generics)
        ↑
SDIVFPipeline                               # base + primitive (@bitcode/generic-pipelines-sdivf)
        ↑
SynthesizeAssetPacksSDIVFPipeline           # specific + base + primitive (pipeline-asset-pack)
SettleAssetPacksSDIVFPipeline               # future product
```

```
@bitcode/pipelines-generics          # factoryPipeline → Pipeline
        ↑
@bitcode/generic-pipelines-sdivf     # factorySDIVFPipeline / FromExecutors → SDIVFPipeline
        ↑
@bitcode/pipeline-asset-pack         # factorySynthesizeAssetPacksSDIVFPipeline
```

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `SDIVF/` | `@bitcode/generic-pipelines-sdivf` | `SDIVFPipeline` base (Setup-[DIV]*-Finish) |

Product pipelines supply phase agents/executors; they do not reimplement the DIV loop.
**Naming law:** every type/factory name must express the full inheritance chain
(e.g. never call a product pipeline merely `AssetPackPipeline` when it is an
`…SDIVFPipeline`).

## Nested-package pattern

`packages/generic-pipelines/` is a **family folder** (README only). Each base
pipeline implementation is a nested package under this folder — same rule as
`generic-agents/*`, `generic-tools/*`, and `generic-llms/*`.
