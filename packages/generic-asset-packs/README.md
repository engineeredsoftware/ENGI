# generic-asset-packs

AssetPack product types over `@bitcode/asset-packs-generics` (measurements from
`@bitcode/measurement-generics`).

## Layout

| Nested package | npm name | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/generic-asset-packs-synthesis` | **Base AP** shared by all three products |
| `deposit-synthesized/` | `@bitcode/generic-asset-packs-deposit-synthesized` | Deposit product |
| `read-synthesized/` | `@bitcode/generic-asset-packs-read-synthesized` | Read options (pre-buy) |
| `read-synthesized-settled/` | `@bitcode/generic-asset-packs-read-synthesized-settled` | After settle-asset-pack-pipeline (BTC buy) |

There is **no** generic `settle/` AssetPack base — settlement exists only when a
**read-synthesized** option is bought with BTC (mint BTD, co-own rights, PR).

## Hierarchy

```
@bitcode/measurement-generics
@bitcode/asset-packs-generics
  → synthesis/                    # SynthesisAssetPack
      → deposit-synthesized       # DepositSynthesizedAssetPack
      → read-synthesized          # ReadSynthesizedAssetPack
      → read-synthesized-settled  # ReadSynthesizedSettledAssetPack
  → asset-packs-pipelines-*
```

## Pipelines

| Pipeline | Produces |
| --- | --- |
| synthesize-deposits-asset-packs-pipeline | DepositSynthesizedAssetPack options |
| synthesize-reads-asset-packs-pipeline | ReadSynthesizedAssetPack options |
| settle-asset-pack-pipeline | ReadSynthesizedSettledAssetPack (1:1 per bought option) |
