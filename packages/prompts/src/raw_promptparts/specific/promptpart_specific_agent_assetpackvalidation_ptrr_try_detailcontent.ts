/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "AssetPack validation Try step"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "AssetPack validation Try step", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_TRY_DETAILCONTENT: PromptPart = createPromptPart(
  'Return concrete issues only when evidence shows AssetPack incompleteness or unsafe Finish readiness.',
);
