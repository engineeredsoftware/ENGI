# `@bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline`

Product **ExecutionPipeline** for reader Need → measured read AssetPack options.

## Hierarchy naming (left → right)

| Layer | Type |
| --- | --- |
| Primitive | `Execution` / `ExecutionPipeline` |
| Base | `ExecutionPipelineSDIVF` |
| Specific | **`ExecutionPipelineSDIVFSynthesizeReadAssetPacks`** |

Factory: `factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks`  
Runner: `runExecutionPipelineSDIVFSynthesizeReadAssetPacks`

## Prompt assembly (raw residence law)

Pipeline/phase system text is assembled only from
`@bitcode/prompts` **raw_promptparts** via domain assembly modules:

| Assembly file | Role |
| --- | --- |
| `execution-pipeline-sdivf-synthesize-asset-packs-prompts` | Shared product identity |
| `execution-pipeline-sdivf-synthesize-reads-asset-packs-prompts` | Read lens + all SDIVF phase specifics |

Call-site attach (SDIVF factory): primitive Execution ⊕ Pipeline ⊕ SDIVF base ⊕ product
specific on the pipeline EE; phase stack without re-emitting Execution.

Law: [`.docs/PROMPTING.md`](../../../.docs/PROMPTING.md).

## Settlement

PR ship / BTC settle is **not** this pipeline — use
`ExecutionPipelineSimpleSettleAssetPack` after the reader buys an option.
