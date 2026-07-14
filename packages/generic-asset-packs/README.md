# generic-asset-packs

Nested AssetPack product types over `@bitcode/asset-packs-generics` (primitives
include measurements from `@bitcode/measurement-generics`).

## Layout

| Nested package | npm name | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/generic-asset-packs-synthesis` | **Base AP of Bitcode** shared by all three products: patch, absolutes, title/summary, provenant paths, catalogs |
| `deposit-synthesized/` | `@bitcode/generic-asset-packs-deposit-synthesized` | Deposit product: no needinesses; never obfuscations on pack |
| `read-synthesized/` | `@bitcode/generic-asset-packs-read-synthesized` | Read product: needinesses + BTD/BTC quote projection |
| `settled-read-synthesized/` | `@bitcode/generic-asset-packs-settled-read-synthesized` | Settled product: BTD rights, BTC finality, ERC1155 co-own, PR delivery |
| `settle/` | `@bitcode/generic-asset-packs-settle` | Settle surface markers (stages list) |
| `measured-patch/` | `@bitcode/generic-asset-packs-measured-patch` | Deprecated re-export of synthesis |

## Hierarchy

```
@bitcode/measurement-generics
@bitcode/asset-packs-generics                 # AssetPack { …, measurements }
  → generic-asset-packs/synthesis             # SynthesisAssetPack  ← base of all 3 products
      → deposit-synthesized                   # DepositSynthesizedAssetPack
      → read-synthesized                      # ReadSynthesizedAssetPack
      → settled-read-synthesized              # SettledReadSynthesizedAssetPack
  → settle
  → asset-packs-pipelines-*
```

### Shared base vs three products

| Field | Synthesis (base) | Deposit | Read | Settled read |
| --- | --- | --- | --- | --- |
| identity, sourceBinding, patch | ✓ | ✓ | ✓ | ✓ |
| measurements.absolutes | ✓ | ✓ | ✓ | ✓ |
| measurements.needinesses | open | always `[]` | *-fit | *-fit (from read) |
| title, summary, provenant | ✓ | ✓ | ✓ | ✓ |
| kind / confidence / covered paths | — | ✓ | optional | from read |
| needFit, settleable (pre-pay) | — | — | ✓ | settleable false |
| btd / btc **quote** | — | — | ✓ | ✓ |
| btdRights (mint + transfer) | — | — | — | ✓ |
| btcSettlement (finality) | — | — | — | ✓ |
| assetPackRights (ERC1155 co-own) | — | — | — | ✓ |
| delivery (PR) | — | — | — | ✓ |
| **obfuscations** | never | never on pack | never | never |

## Pipelines (product names)

| Pipeline | Package dir | Consumes / produces |
| --- | --- | --- |
| `synthesize-deposits-asset-packs-pipeline` | `asset-packs-pipelines/synthesize-deposits-asset-packs-pipeline` | → DepositSynthesizedAssetPack options |
| `synthesize-reads-asset-packs-pipeline` | `asset-packs-pipelines/synthesize-reads-asset-packs-pipeline` | → ReadSynthesizedAssetPack options |
| `settle-asset-pack-pipeline` | `asset-packs-pipelines/settle-asset-pack-pipeline` | Read option → SettledReadSynthesizedAssetPack |
