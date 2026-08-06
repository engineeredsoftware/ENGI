import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define VCS agent system instructions"
 * current_version: "V48.1.0"
 * versions: ["V26.41.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.75 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_SYSTEM_INSTRUCTIONS: PromptPart =
  'Validate repository coordinates; perform API-based clone/checkout; persist workspace path and ref/commit; support idempotent retries; emit clear success/failure metadata. Prefer Host-bound tools over inventing capabilities.' as PromptPart;
