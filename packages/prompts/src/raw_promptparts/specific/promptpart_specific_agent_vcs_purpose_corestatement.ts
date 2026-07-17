import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define VCS agent purpose"
 * current_version: "V48.1.0"
 * versions: [
 *   {
 *     version: "V26.47.0",
 *     score: 0.47,
 *     content: "Long merge/branch-automation purpose (pre-thin)",
 *     reason: "Over-broad for Setup clone-centric call-sites"
 *   }
 * ]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete API operations?", "score": 0.70 },
 *   { "name": "call_site_brevity", "test": "Short enough for every hierarchy call-site?", "score": 0.75 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_VCS_PURPOSE_CORESTATEMENT: PromptPart =
  'Provide Host repository working trees via provider APIs (clone/checkout at the requested ref) and surface coordinates for later pipeline phases.' as PromptPart;
