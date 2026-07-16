/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Audio processor refine phase"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Audio processor refine phase", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_REFINE_PHASE_HEADER: PromptPart = createPromptPart(
  'REFINE: Enhance Audio Processing Results',
);
