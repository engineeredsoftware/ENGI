/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "AssetPack validation Retry step"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "AssetPack validation Retry step", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_RETRY_DETAILCONTENT: PromptPart = createPromptPart(
  'Recover by validating the available AssetPack state and explicitly naming missing evidence.',
);
