# asset-packs

Product-specific AssetPack **measurement / pipeline product** surfaces
(nested-family pattern). Protocol primitives and the measured-patch base live
elsewhere:

```
@bitcode/asset-pack-generics                      # AssetPack primitive (protocol minimum)
        ↑
@bitcode/generic-asset-packs-measured-patch       # MeasuredPatchAssetPack (only AP base)
        ↑
@bitcode/asset-packs-synthesis / -settle          # product measurement catalogs (this folder)
@bitcode/asset-packs-pipelines-*                  # product pipelines
@bitcode/pipeline-asset-pack                      # agents, tools, domain helpers
```

## Packages in this folder

| Path | Package | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/asset-packs-synthesis` | Measurement catalogs + AbsolutesMeasureAgent + **AssetPackPatchArtifact** |
| `settle/` | `@bitcode/asset-packs-settle` | Settle product measurement surface (stub / Gate 6) |

Prefer importing **MeasuredPatchAssetPack** from
`@bitcode/generic-asset-packs-measured-patch` when constructing pack objects.

Artifact hierarchy for patch payloads:

```
Artifact → PatchArtifact → AssetPackPatchArtifact (synthesis product)
```
