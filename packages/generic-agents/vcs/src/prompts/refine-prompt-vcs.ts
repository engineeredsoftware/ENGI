/**
 * REFINE PROMPT COMPOSITION - VCS AGENT
 * Final agent return synthesis (no tools); failsafe/thinkings at generation leaf.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_EXECUTIONPATTERN_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_executionpattern_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_VCS_INTEGRATION_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_integration_detailcontent';

export const VCS_REFINE_PROMPT = new Prompt()
  .set('execution', PROMPTPART_SPECIFIC_AGENT_VCS_EXECUTIONPATTERN_DETAILCONTENT)
  .set('integration', PROMPTPART_SPECIFIC_AGENT_VCS_INTEGRATION_DETAILCONTENT)
  .set(
    'step:purpose',
    [
      String(PROMPTPART_SPECIFIC_AGENT_VCS_EXECUTIONPATTERN_DETAILCONTENT),
      'Refine: synthesize Plan/Try/Retry into the final VCS agent return (no tools).',
    ].join(' ') as any,
  );
