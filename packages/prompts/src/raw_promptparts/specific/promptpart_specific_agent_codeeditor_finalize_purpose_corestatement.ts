/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Code editor finalize purpose"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Code editor finalize purpose", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_CODEEDITOR_FINALIZE_PURPOSE_CORESTATEMENT: PromptPart = createPromptPart(
  'Finalize all edits, summarize changes, and prepare rollback information if needed',
);
