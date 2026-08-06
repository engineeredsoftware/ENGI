/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Audio processor plan phase"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Audio processor plan phase", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_AUDIOPROCESSOR_PLAN_PHASE_HEADER: PromptPart = createPromptPart(
  'PLAN',
);
