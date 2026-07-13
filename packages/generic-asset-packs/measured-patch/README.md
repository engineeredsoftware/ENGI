# @bitcode/generic-asset-packs-measured-patch

**MeasuredPatchAssetPack** — the first and only AssetPack base implementation
used across Bitcode product pipelines.

## Hierarchy

```
AssetPack                                 # @bitcode/asset-pack-generics
  → MeasuredPatchAssetPack                # this package
      → deposit options / read packs / settle-reads shippables
```

## What it adds over the primitive

| Field | Role |
| --- | --- |
| `measurements` | Absolute (and optional neediness) measurement rows |
| `absoluteVolume` | Weighted composite when computed |
| `neediness` | Deposit earning / read-demand preview |
| `provenantSourcePaths` | Paths available for later reader settlement |
| `title` / `summary` | Source-safe review copy |

Schema: `bitcode.asset-pack.measured-patch`.

## Usage

```ts
import { buildMeasuredPatchAssetPack } from '@bitcode/generic-asset-packs-measured-patch';

const pack = buildMeasuredPatchAssetPack({
  assetPackId: 'asset-pack-…',
  title: 'Capability slice',
  summary: '…',
  repositoryFullName: 'org/repo',
  fileChanges: [{ path: 'src/x.ts', op: 'modify' }],
  measurements: [/* … */],
});
```
