/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Code editor agent name"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Code editor agent name", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_CODEEDITOR_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'code-editor',
);
