/**
 * PLAN PROMPT COMPOSITION - VCS AGENT
 *
 * Step-level purpose only. Do not re-list agent capabilities here — those
 * belong on the agent system carrier (hierarchy walk already includes Agent).
 * Failsafe/Thinkings injected at generation leaf.
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Plan step prompt for VCS agent"
 * current_version: "V48.1.0"
 * versions: ["V26.50.0", "V48.0.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.70 },
 *   { "name": "no_duplicate_capabilities", "test": "Plan does not re-emit agent capability walls", "score": 0.90 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_purpose_corestatement';

export const VCS_PLAN_PROMPT = new Prompt().set(
  'step:purpose',
  [
    String(PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT),
    'Plan VCS operations only (no tool execution on Plan). Decide provider, owner/name, ref, and Try tool inputs; note fallbacks for Retry.',
  ].join(' ') as any,
);
