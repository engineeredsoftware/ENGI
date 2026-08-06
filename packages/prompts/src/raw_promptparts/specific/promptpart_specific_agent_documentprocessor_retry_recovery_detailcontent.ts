/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Document processor retry recovery"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Document processor retry recovery", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_DOCUMENTPROCESSOR_RETRY_RECOVERY_DETAILCONTENT: PromptPart = createPromptPart(
  'When document processing fails, analyze failure patterns, adjust processing parameters, select alternative extraction methods, and implement enhanced document parsing strategies.',
);
