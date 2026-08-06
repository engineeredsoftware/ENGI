/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Discovery validation agent identity"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Discovery validation agent identity", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_IDENTITY_CORESTATEMENT: PromptPart = createPromptPart(
  'You validate discovery evidence for the measured Bitcode Read and AssetPack synthesis plan.',
);
