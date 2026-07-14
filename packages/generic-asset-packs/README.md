# generic-asset-packs

Nested AssetPack product types over `@bitcode/asset-packs-generics` (primitives
include measurements from `@bitcode/measurement-generics`).

## Layout

| Nested package | npm name | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/generic-asset-packs-synthesis` | **Base AP of Bitcode** shared by all three products |
| `deposit-synthesized/` | `@bitcode/generic-asset-packs-deposit-synthesized` | Deposit product |
| `read-synthesized/` | `@bitcode/generic-asset-packs-read-synthesized` | Read product |
| `settled-read-synthesized/` | `@bitcode/generic-asset-packs-settled-read-synthesized` | Settled product after settle-asset-pack-pipeline |
| `settle/` | `@bitcode/generic-asset-packs-settle` | Settle stage markers |

## Hierarchy

```
@bitcode/measurement-generics
@bitcode/asset-packs-generics
  → synthesis/                 # SynthesisAssetPack
      → deposit-synthesized    # DepositSynthesizedAssetPack
      → read-synthesized       # ReadSynthesizedAssetPack
      → settled-read-synthesized  # SettledReadSynthesizedAssetPack
  → settle/
  → asset-packs-pipelines-*
```

Obfuscations are never stored on any AssetPack.

## Pipelines

| Name | Package |
| --- | --- |
| synthesize-deposits-asset-packs-pipeline | `@bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline` |
| synthesize-reads-asset-packs-pipeline | `@bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline` |
| settle-asset-pack-pipeline | `@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline` |
