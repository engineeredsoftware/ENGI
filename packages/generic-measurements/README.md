# generic-measurements

Measurement **domain** packages extending `@bitcode/measurement-generics`
(catalogs, category framing). The PTRR **MeasureAgent implementer** lives under
`packages/generic-agents/agent-measure` (`@bitcode/generic-agents-agent-measure`).

## Hierarchy (names encode full ancestry)

```
Measurement # primitive vocabulary (@bitcode/measurement-generics)
 ↑
MeasureAgent # generic-agents/agent-measure — PTRR base measurer
 ↑
AbsolutesMeasureAgent # absolutes/ absolute category base
NeedinessesMeasureAgent # needinesses/ neediness category base
tech-types # tech-types/ stack/signal absolute vocabulary
 ↑
SynthesizeAssetPacksAbsolutesMeasureAgent # generic-asset-packs/synthesis
settle-asset-pack-pipeline → ReadSynthesizedSettledAssetPack
```

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `absolutes/` | `@bitcode/generic-measurements-absolutes` | Absolutes category base + framing; co-located core tests |
| `needinesses/` | `@bitcode/generic-measurements-needinesses` | Needinesses framing + `-fit` catalog surface |
| `tech-types/` | `@bitcode/generic-measurements-tech-types` | Tech/stack signals |

Measure agent implementer (not in this tree):

| Path | Package | Role |
| --- | --- | --- |
| `../generic-agents/agent-measure/` | `@bitcode/generic-agents-agent-measure` | PTRR measure-agent base; tests under `src/__tests__/{core,edges}/` |

Product measure agents and catalogs live under `packages/generic-asset-packs/{synthesis,settle}/`,
not a separate `packages/asset-packs/` tree.
