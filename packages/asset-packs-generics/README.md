# @bitcode/asset-packs-generics

AssetPack **primitive** contracts for Bitcode Protocol — identity, source-safe
provenance binding, path+op patch, and **measurements** (via
`@bitcode/measurement-generics`).

## Hierarchy

```
@bitcode/measurement-generics          # MeasurementReading, AssetPackMeasurements
@bitcode/asset-packs-generics          # AssetPack primitive (this package)
  → @bitcode/generic-asset-packs-synthesis           # shared synthesize base
      → @bitcode/generic-asset-packs-deposit-synthesized
      → @bitcode/generic-asset-packs-read-synthesized
  → @bitcode/generic-asset-packs-settle              # settle surface
  → @bitcode/asset-packs-pipelines-*                 # product pipelines
```

Measurements are **part of the AssetPack shape**, not an optional product add-on:

```ts
measurements: {
  absolutes: MeasurementReading[];
  needinesses: MeasurementReading[];  // always [] on deposit; populated on read
}
```

**Never** store obfuscations on an AssetPack (sensitive deposit input only).

## Primitive surface

| Export area | Role |
| --- | --- |
| `identity` | `AssetPackId`, pack identity fields |
| `source-binding` | Source-safe provenance binding |
| `patch` | Path+op patch descriptor (`@bitcode/files`) |
| root | `AssetPack` + `emptyAssetPackMeasurements` + measurement re-exports |

```ts
import type { AssetPack } from '@bitcode/asset-packs-generics';
import { emptyAssetPackMeasurements } from '@bitcode/asset-packs-generics';
```
