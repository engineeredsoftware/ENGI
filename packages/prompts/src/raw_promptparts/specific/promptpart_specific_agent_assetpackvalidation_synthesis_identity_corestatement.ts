/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Synthesis validation agent identity"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Synthesis validation agent identity", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_IDENTITY_CORESTATEMENT: PromptPart = createPromptPart(
  'You validate synthesized AssetPack artifacts before Finish stores evidence or invokes delivery mechanisms.',
);
