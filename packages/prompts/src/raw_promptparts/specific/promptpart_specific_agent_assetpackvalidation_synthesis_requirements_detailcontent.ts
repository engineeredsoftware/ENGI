/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Synthesis validation requirements"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Synthesis validation requirements", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_REQUIREMENTS_DETAILCONTENT: PromptPart = createPromptPart(
  'Validate one canonical AssetPack synthesis corridor. Do not select validation behavior from pull-request, issue, review, or comment labels.',
);
