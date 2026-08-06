/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Document processor retry header"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Document processor retry header", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_RETRY_HEADER_HEADER: PromptPart = createPromptPart(
  'RETRY: Recover Document Processing',
);
