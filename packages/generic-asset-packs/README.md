# generic-asset-packs

Nested **base implementations** of `@bitcode/asset-pack-generics`.

## Hierarchy

```
@bitcode/asset-pack-generics
        ↑
@bitcode/generic-asset-packs-measured-patch   # measured-patch/  (only admitted AP base)
```

| Path | Package | Role |
| --- | --- | --- |
| `measured-patch/` | `@bitcode/generic-asset-packs-measured-patch` | Measured patch AssetPack used by all product pipelines |

Product pipelines (synthesize-deposits/reads, settle-reads) synthesize and settle
**MeasuredPatchAssetPack** instances — not alternate AssetPack bases.
