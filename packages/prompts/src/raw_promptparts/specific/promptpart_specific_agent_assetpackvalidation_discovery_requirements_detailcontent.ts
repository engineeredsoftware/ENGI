/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Discovery validation requirements"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Discovery validation requirements", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_REQUIREMENTS_DETAILCONTENT: PromptPart = createPromptPart(
  'Discovery is sufficient only when it explains Read satisfaction, source evidence, risk, and proof requirements for AssetPack synthesis.',
);
