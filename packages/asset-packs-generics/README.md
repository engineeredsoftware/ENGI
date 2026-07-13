# @bitcode/asset-pack-generics

AssetPack **primitive** contracts for Bitcode Protocol — the minimum needed to
identity a pack, bind source-safe provenance, and describe a patch without
embedding raw source.

## Hierarchy

```
@bitcode/asset-pack-generics                         # this package (AssetPack primitive)
        ↑
@bitcode/generic-asset-packs-measured-patch          # MeasuredPatchAssetPack base
        ↑
@bitcode/pipeline-asset-pack / asset-packs-pipelines # product synthesis & settle
```

## Primitive surface

| Concept | Types |
| --- | --- |
| Identity | `AssetPackId`, `AssetPackIdentity`, `ASSET_PACK_SCHEMA_PREFIX` |
| Source binding | `AssetPackSourceBinding` (paths only; raw source external) |
| Patch | `AssetPackPatchDescriptor`, `AssetPackPatchFileChange` |
| Pack | `AssetPack` = identity + sourceBinding + patch + deliveryMechanism |
| Delivery | `AssetPackDeliveryMechanism` (`pull-request`) |

## Law

- Raw source never appears on the protocol pack object.
- Implementations extend `AssetPack`; they do not replace primitives.
