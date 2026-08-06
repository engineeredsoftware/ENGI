/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Code editor apply purpose"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Code editor apply purpose", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_CODEEDITOR_APPLY_PURPOSE_CORESTATEMENT: PromptPart = createPromptPart(
  'Execute the edit plan using atomic file operations, ensuring each edit is applied correctly',
);
