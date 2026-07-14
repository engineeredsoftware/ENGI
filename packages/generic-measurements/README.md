# generic-measurements

Base measurement implementations extending `@bitcode/measurement-generics`.

## Hierarchy (names encode full ancestry)

```
Measurement # primitive vocabulary
 ↑
MeasureAgent # measure-agent/ PTRR base measurer
AbsolutesMeasureAgent # absolutes/ absolute category base
NeedinessesMeasureAgent # needinesses/ neediness category base (Gate 4)
tech-types # tech-types/ stack/signal absolute vocabulary
 ↑
SynthesizeAssetPacksAbsolutesMeasureAgent # generic-asset-packs/synthesis
settle-asset-pack-pipeline… # generic-asset-packs/settle
```

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `measure-agent/` | `@bitcode/generic-measurements-measure-agent` | PTRR measure-agent base |
| `absolutes/` | `@bitcode/generic-measurements-absolutes` | Absolutes category base |
| `needinesses/` | `@bitcode/generic-measurements-needinesses` | Needinesses framing surface (Gate 4) |
| `tech-types/` | `@bitcode/generic-measurements-tech-types` | Tech/stack signals |

Product measure agents and catalogs live under `packages/generic-asset-packs/{synthesis,settle}/`,
not a separate `packages/asset-packs/` tree.
