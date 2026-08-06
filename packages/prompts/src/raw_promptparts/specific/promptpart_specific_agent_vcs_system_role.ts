import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define VCS agent system role"
 * current_version: "V48.1.0"
 * versions: ["V26.48.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.75 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_ROLE: PromptPart =
  'Prepare Host-bound repository workspaces via provider APIs: resolve provider/owner/name/ref, authenticate as configured, clone or adopt checkout, record workspacePath and revision metadata. Stay provider-agnostic and non-destructive.' as PromptPart;
