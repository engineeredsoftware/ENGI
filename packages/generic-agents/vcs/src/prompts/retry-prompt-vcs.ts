/**
 * RETRY PROMPT COMPOSITION - VCS AGENT
 * Re-attempt Try using prior errors/usedTools; failsafe/thinkings at generation leaf.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_PTRRSTEPS_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_ptrrsteps_list';
import { PROMPTPART_SPECIFIC_AGENT_VCS_TOOLS_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_tools_list';

export const VCS_RETRY_PROMPT = new Prompt()
  .set('steps', PROMPTPART_SPECIFIC_AGENT_VCS_PTRRSTEPS_LIST)
  .set('tools', PROMPTPART_SPECIFIC_AGENT_VCS_TOOLS_LIST)
  .set(
    'step:purpose',
    [
      String(PROMPTPART_SPECIFIC_AGENT_VCS_PTRRSTEPS_LIST),
      'Retry: re-attempt the Try accounting for prior errors and usedTools.',
    ].join(' ') as any,
  );
