# `@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline`

Product **ExecutionPipelineSimple** for post-purchase settle (BTC → BTD → rights → PR ship).

## Hierarchy naming (left → right)

| Layer | Type |
| --- | --- |
| Primitive | `ExecutionPipeline` |
| Base | `ExecutionPipelineSimple` |
| Specific | **`ExecutionPipelineSimpleSettleAssetPack`** |

Factory: `factoryExecutionPipelineSimpleSettleAssetPack`  
Runner: `runExecutionPipelineSimpleSettleAssetPack`

**Not SDIVF.** One bought option → one settle run.

Law: [`.docs/PROMPTING.md`](../../../.docs/PROMPTING.md).
