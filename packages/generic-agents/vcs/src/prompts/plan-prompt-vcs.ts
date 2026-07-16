/**
 * PLAN PROMPT COMPOSITION - VCS AGENT
 *
 * Step-level purpose only. Failsafe/Thinkings injected at generation leaf.
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Plan step prompt for VCS agent"
 * current_version: "V48.0.0"
 * versions: ["V26.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.50 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_CAPABILITIES_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_capabilities_list';
import { PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_purpose_corestatement';

export const VCS_PLAN_PROMPT = new Prompt()
  .set('purpose', PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT)
  .set('capabilities', PROMPTPART_SPECIFIC_AGENT_VCS_CAPABILITIES_LIST)
  .set(
    'step:purpose',
    [
      String(PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT),
      'Plan VCS operations only (no tool execution on Plan).',
    ].join(' ') as any,
  );
