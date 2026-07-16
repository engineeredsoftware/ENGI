# asset-packs-pipelines

Commercial AssetPack product pipelines. Domain agents/tools live in `domain/`;
each product pipeline package is a thin factory over SDIVF or Simple.

## Product pipelines

| Target name | Directory | Package | Base | Factory |
| --- | --- | --- | --- | --- |
| **synthesize-deposits-asset-packs-pipeline** | `synthesize-deposits-asset-packs-pipeline/` | `@bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks` |
| **synthesize-reads-asset-packs-pipeline** | `synthesize-reads-asset-packs-pipeline/` | `@bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks` |
| **settle-asset-pack-pipeline** | `settle-asset-pack-pipeline/` | `@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline` | Simple | `factoryExecutionPipelineSimpleSettleAssetPack` |

```
Pipeline (pipelines-generics)
  → ExecutionPipelineSDIVF
      → ExecutionPipelineSDIVFSynthesizeDepositAssetPacks
      → ExecutionPipelineSDIVFSynthesizeReadAssetPacks
  → ExecutionPipelineSimple
      → ExecutionPipelineSimpleSettleAssetPack   # 1:1 AssetPack
```

```ts
import { factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks } from '@bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline';
import { factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline';
import { factoryExecutionPipelineSimpleSettleAssetPack } from '@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline';
```

AssetPack product types: `@bitcode/generic-asset-packs-{synthesis,deposit-synthesized,read-synthesized,read-synthesized-settled}`.
