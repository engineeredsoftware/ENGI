/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Last-validation requirements"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Last-validation requirements", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_LASTVALIDATION_REQUIREMENTS_DETAILCONTENT: PromptPart = createPromptPart(
  'Treat prior validation as evidence over the same Read-to-AssetPack corridor, not as a separate delivery-template pipeline.',
);
