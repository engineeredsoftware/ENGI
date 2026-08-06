/**
 * TRY PROMPT COMPOSITION - VCS AGENT
 * Step purpose only; failsafe/thinkings injected at generation leaf.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_system_instructions';
import { PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_CONTEXT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_system_context';

export const VCS_TRY_PROMPT = new Prompt()
  .set('instructions', PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS)
  .set('context', PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_CONTEXT)
  .set(
    'step:purpose',
    [
      String(PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS),
      'Try: execute planned VCS operations via tools when selected.',
    ].join(' ') as any,
  );
