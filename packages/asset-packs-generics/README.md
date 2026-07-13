# @bitcode/asset-packs-generics

AssetPack **primitive** contracts for Bitcode Protocol — identity, source-safe
provenance binding, and patch descriptors without embedding raw source.

> BC alias: `@bitcode/asset-pack-generics`

## Hierarchy

```
@bitcode/asset-packs-generics                    # this package (AssetPack primitive)
        ↑
@bitcode/generic-asset-packs-measured-patch      # MeasuredPatchAssetPack base
@bitcode/generic-asset-packs-synthesis           # synthesize product catalogs / agents
@bitcode/generic-asset-packs-settle              # settle product surface
        ↑
@bitcode/asset-packs-pipelines-*                 # deposit/read/settle product pipelines
@bitcode/pipeline-asset-pack                     # agents, tools, deposit options
```

## Primitive surface

| Export area | Role |
| --- | --- |
| `identity` | `AssetPackId`, pack identity fields |
| `source-binding` | Source-safe provenance binding |
| `patch` | Path+op patch descriptor (builds on `@bitcode/files`) |
| root | Composed primitive types |

```ts
import type { AssetPackId } from '@bitcode/asset-packs-generics';
// or BC: from '@bitcode/asset-pack-generics'
```

Prefer hierarchy package names in new code. Product pipelines consume
`MeasuredPatchAssetPack` rather than redefining protocol primitives.
