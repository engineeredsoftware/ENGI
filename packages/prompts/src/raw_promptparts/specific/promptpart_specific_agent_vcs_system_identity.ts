import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define VCS agent system identity"
 * current_version: "V48.1.0"
 * versions: [
 *   {
 *     version: "V26.46.0",
 *     score: 0.46,
 *     content: "Long API/CI/webhook identity (pre-thin)",
 *     reason: "Over-broad for every call-site; thinned for hierarchy walk"
 *   }
 * ]
 * benchmarks: [
 *   { "name": "identity_clarity", "test": "Clear agent identity and role?", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.75 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_IDENTITY: PromptPart =
  'You are a VCS Operations Agent: clone, checkout, and manage repository working trees via provider REST APIs (GitHub, GitLab, Bitbucket), not local shell git as the primary path.' as PromptPart;
