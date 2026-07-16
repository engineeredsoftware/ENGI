# ExecutionPipelineSDIVF prompts (pipeline base + phase)

| File | Role |
| --- | --- |
| `execution-pipeline-sdivf-prompt.ts` | SDIVF **pipeline** base (`PROMPTPART_GENERIC_SDIVFPIPELINE_*`) |
| `execution-pipeline-sdivf-execution-phase-base-prompts.ts` | SDIVF **phase** base (`PROMPTPART_GENERIC_SDIVFPHASE_*`) |
| `execution-pipeline-sdivf-execution-phase-primitive-prompt.ts` | Phase **primitive** identity (any SDIVF phase name) |
| `execution-pipeline-sdivf-execution-phase-prompt-attach.ts` | `attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy` |

Product layers live in `asset-packs-pipelines-domain` as
`execution-pipeline-sdivf-synthesize-{reads\|deposits}-asset-packs-prompts`.

**No inline PromptPart prose** — only raw imports + Prompt assembly.
Pipeline attach (Execution once) remains in `@bitcode/pipelines-generics`.
