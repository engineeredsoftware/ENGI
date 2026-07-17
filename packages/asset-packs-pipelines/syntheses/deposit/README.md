# `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs`

Product **ExecutionPipeline** for depositor repo → measured deposit AssetPack options.

## Hierarchy naming (left → right)

| Layer | Type |
| --- | --- |
| Primitive | `Execution` / `ExecutionPipeline` |
| Base | `ExecutionPipelineSDIVF` |
| Specific | **`ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`** |

Factory: `factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks`  
Runner: `runExecutionPipelineSDIVFSynthesizeDepositAssetPacks`

## Prompt assembly (raw residence law)

| Assembly file | Role |
| --- | --- |
| `execution-pipeline-sdivf-synthesize-asset-packs-prompts` | Shared product identity |
| `execution-pipeline-sdivf-synthesize-deposits-asset-packs-prompts` | Deposit lens + all SDIVF phase specifics |

All PromptPart **strings** are imported from `packages/prompts/.../raw_promptparts/`.
Assembly modules only `.set(path, PROMPTPART_…)`.

Law: [`.docs/PROMPTING.md`](../../../.docs/PROMPTING.md).

## Finish vs settle

Finish stores options for `/deposits` review/admission. PR shipping is
`ExecutionPipelineSimpleSettleAssetPack`, not this SDIVF Finish phase.
