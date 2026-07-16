/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Document processor plan strategy"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Document processor plan strategy", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_PLAN_STRATEGY_DETAILCONTENT: PromptPart = createPromptPart(
  'Analyze document structure and format, determine processing methodology, establish content extraction priorities, and define output formats for comprehensive document analysis.',
);
