/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Document processor try focus"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Document processor try focus", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_TRY_EXECUTIONFOCUS_DETAILCONTENT: PromptPart = createPromptPart(
  'Execute document processing using selected tools and methodologies. Focus on comprehensive content extraction, format conversion, and structured data output generation.',
);
