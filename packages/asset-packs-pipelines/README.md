# asset-packs-pipelines

Product AssetPack **pipelines** and shared domain. There is **no** `packages/pipelines/`
tree — domain + product pipelines live only under this family.

## Hierarchy

```
Pipeline
  → SDIVFPipeline
      → SynthesizeDepositAssetPacksSDIVFPipeline   # synthesize-deposits/
      → SynthesizeReadAssetPacksSDIVFPipeline      # synthesize-reads/
  → SimplePipeline
      → SettleAssetPacksSimplePipeline             # settle-asset-packs/
```

| Path | Package | Type (full hierarchy name) |
| --- | --- | --- |
| `domain/` | `@bitcode/asset-packs-pipelines-domain` | Shared phases, agents, tools, deposit/read domain (BC `@bitcode/pipeline-asset-pack`) |
| `synthesize-deposits/` | `@bitcode/asset-packs-pipelines-synthesize-deposits` | `SynthesizeDepositAssetPacksSDIVFPipeline` |
| `synthesize-reads/` | `@bitcode/asset-packs-pipelines-synthesize-reads` | `SynthesizeReadAssetPacksSDIVFPipeline` |
| `settle-asset-packs/` | `@bitcode/asset-packs-pipelines-settle-asset-packs` | `SettleAssetPacksSimplePipeline` |
| `settle-reads/` | `@bitcode/asset-packs-pipelines-settle-reads` | BC → settle-asset-packs |

**No lens:** three separate product pipelines — never one factory with deposit|read mode.

```ts
import { factorySynthesizeDepositAssetPacksSDIVFPipeline } from '@bitcode/asset-packs-pipelines-synthesize-deposits';
import { factorySynthesizeReadAssetPacksSDIVFPipeline } from '@bitcode/asset-packs-pipelines-synthesize-reads';
import { factorySettleAssetPacksSimplePipeline } from '@bitcode/asset-packs-pipelines-settle-asset-packs';
```
