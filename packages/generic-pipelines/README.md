# generic-pipelines

Base pipeline implementations that extend `@bitcode/pipelines-generics` primitives.

## Hierarchy

```
@bitcode/pipelines-generics          # Pipeline / PhaseDelegator / composition primitives
        ↑
@bitcode/generic-pipelines-sdivf     # SDIVF base loop (this folder: SDIVF/)
        ↑
@bitcode/pipeline-asset-pack         # SynthesizeAssetPacks (and future SettleAssetPacks)
```

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `SDIVF/` | `@bitcode/generic-pipelines-sdivf` | Setup-[Discovery-Implementation-Validation]*-Finish base |

Product pipelines supply phase agents/executors; they do not reimplement the DIV loop.

## Nested-package pattern

`packages/generic-pipelines/` is a **family folder** (README only). Each base
pipeline implementation is a nested package under this folder — same rule as
`generic-agents/*`, `generic-tools/*`, and `generic-llms/*`.
