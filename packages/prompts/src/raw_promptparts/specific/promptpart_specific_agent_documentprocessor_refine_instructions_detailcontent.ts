/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Document processor refine instructions"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Document processor refine instructions", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_REFINE_INSTRUCTIONS_DETAILCONTENT: PromptPart = createPromptPart(
  'Refine document processing results by improving accuracy of content extraction, enhancing completeness of format conversion, and strengthening output structure and metadata quality.',
);
