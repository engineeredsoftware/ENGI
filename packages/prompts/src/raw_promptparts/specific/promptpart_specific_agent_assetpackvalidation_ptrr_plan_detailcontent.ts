/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "AssetPack validation Plan step"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "AssetPack validation Plan step", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_PLAN_DETAILCONTENT: PromptPart = createPromptPart(
  'Plan validation against Read, source evidence, AssetPack content, and proof obligations.',
);
