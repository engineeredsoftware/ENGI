import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "List VCS agent capabilities (lean — every call-site sees this when attached)"
 * current_version: "V48.1.0"
 * versions: ["V26.43.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.80 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_CAPABILITIES_LIST: PromptPart =
  `- Clone/checkout via provider APIs (owner, name, ref/branch)
- Record workspacePath and source revision for downstream phases
- Honor auth and source-safety constraints from execution context
- Idempotent retries with clear operation status` as PromptPart;
