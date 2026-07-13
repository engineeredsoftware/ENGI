# generic-measurements

Base measurement implementations extending `@bitcode/measurement-generics`.

## Hierarchy (names encode full ancestry)

```
Measurement                              # primitive vocabulary
        ↑
MeasureAgent                             # measure-agent/  PTRR base measurer
AbsolutesMeasureAgent                    # absolutes/      absolute category base
NeedinessesMeasureAgent                  # needinesses/    neediness category base (Gate 4)
        ↑
SynthesizeAssetPacksAbsolutesMeasureAgent  # packages/asset-packs/synthesis
SettleAssetPacks…                          # packages/asset-packs/settle (future)
```

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `measure-agent/` | `@bitcode/generic-measurements-measure-agent` | PTRR measure-agent base |
| `absolutes/` | `@bitcode/generic-measurements-absolutes` | Absolutes category base |
| `needinesses/` | `@bitcode/generic-measurements-needinesses` | Needinesses framing surface (Gate 4) |
