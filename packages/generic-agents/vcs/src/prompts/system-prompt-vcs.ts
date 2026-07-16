/**
 * System prompt for VCS agent — identity / role / instructions only.
 * Failsafe + Thinkings parts are injected at the active generation leaf.
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "System prompt for VCS agent"
 * current_version: "V48.0.0"
 * versions: ["1.0.0", "2.0.0", "V26.43.0", "V26.50.0"]
 * benchmarks: [
 *   { "name": "system_coherence", "test": "Does the system prompt provide coherent instructions? Rate 0-1", "score": 0.94 },
 *   { "name": "vcs_completeness", "test": "Does it cover all version control requirements? Rate 0-1", "score": 0.93 },
 *   { "name": "operational_clarity", "test": "Are operational boundaries and capabilities clearly defined? Rate 0-1", "score": 0.92 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_ROLE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_system_role';
import { PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_vcs_system_instructions';

export const SYSTEM_PROMPT_VCS = new Prompt()
  .set('identity', PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_IDENTITY)
  .set('role', PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_ROLE)
  .set('instructions', PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS);
