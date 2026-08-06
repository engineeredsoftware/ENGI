import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "List VCS agent tools (lean)"
 * current_version: "V48.1.0"
 * versions: ["V26.44.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.80 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_TOOLS_LIST: PromptPart =
  `- Provider clone/checkout tools (e.g. asset-pack-clone-vcs-repository-tool / host clone adapters)
- Repository status/ref inspection via provider APIs when registered` as PromptPart;
