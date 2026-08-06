/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "AssetPack validation Refine step"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "AssetPack validation Refine step", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_REFINE_DETAILCONTENT: PromptPart = createPromptPart(
  'Refine findings to remove delivery-mechanism assumptions and preserve proof traceability.',
);
