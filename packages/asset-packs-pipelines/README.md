# asset-packs-pipelines

Commercial AssetPack product pipelines. Domain agents/tools live in `domain/`;
each product pipeline package is a thin factory over SDIVF or Simple.

## Product pipelines (folder = inheritance left→right)

| Product run id (store) | Directory | Package | Base | Factory |
| --- | --- | --- | --- | --- |
| `synthesize-deposits-asset-packs-pipeline` | `execution-pipeline-sdivf-synthesize-deposits-asset-packs/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks` |
| `synthesize-reads-asset-packs-pipeline` | `execution-pipeline-sdivf-synthesize-reads-asset-packs/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks` |
| `settle-asset-pack-pipeline` | `execution-pipeline-simple-settle-asset-pack/` | `@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack` | Simple | `factoryExecutionPipelineSimpleSettleAssetPack` |

```
Pipeline (pipelines-generics)
  → ExecutionPipelineSDIVF
      → ExecutionPipelineSDIVFSynthesizeDepositAssetPacks
      → ExecutionPipelineSDIVFSynthesizeReadAssetPacks
  → ExecutionPipelineSimple
      → ExecutionPipelineSimpleSettleAssetPack   # 1:1 AssetPack
```

```ts
import { factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs';
import { factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
import { factoryExecutionPipelineSimpleSettleAssetPack } from '@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack';
```

AssetPack product types: `@bitcode/generic-asset-packs-{synthesis,deposit-synthesized,read-synthesized,read-synthesized-settled}`.
