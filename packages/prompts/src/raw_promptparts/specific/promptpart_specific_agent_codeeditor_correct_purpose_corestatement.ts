/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Code editor correct purpose"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Code editor correct purpose", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_CODEEDITOR_CORRECT_PURPOSE_CORESTATEMENT: PromptPart = createPromptPart(
  'Validate all edits, check syntax, and apply corrections if needed',
);
