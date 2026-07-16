# Pipeline / phase Prompt assembly (primitives)

**LAW:** Authored PromptPart strings live only under
`packages/prompts/src/raw_promptparts/`. These modules **import** raw parts
and attach them to Execution EE nodes.

| File | Role |
| --- | --- |
| `execution-pipeline-prompt.ts` | `ExecutionPipelinePrompt` class (paths only; no prose) |
| `execution-pipeline-primitive-prompt.ts` | Primitive pipeline Prompt registry |
| `execution-phase-primitive-prompt.ts` | Primitive phase Prompt registry |
| `execution-prompt-compose.ts` | Re-export compose/apply from `execution-generics` |
| `execution-prompt-attach-hierarchy.ts` | Attach Execution-once pipeline + phase call-site blocks |

See monorepo [`.docs/PROMPTING.md`](../../../../.docs/PROMPTING.md).
