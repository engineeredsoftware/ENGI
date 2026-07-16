import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode risk-admission PromptPart for danger-wall integration details"
 * current_version: "V26"
 * versions: []
 * benchmarks: [
 *   { "name": "integration_boundary", "test": "Integration details do not promote a parallel security product.", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_DANGERWALL_INTEGRATION_DETAILCONTENT: PromptPart =
  `Integrates as admitted support inside retained Bitcode pipeline setup:
- Reads expressed read, repository evidence, external evidence, written-asset hints, AssetPack intent, proof-gap notes, and delivery mechanism requests
- Writes risk-admission evidence into parent AgentExecution or ExecutionPipeline state for reread
- May short-circuit the retained setup corridor when high-severity admission blockers exist
- Does not mutate repository source, deliver third-party artifacts, generate proof closure, or define Exchange/product semantics` as PromptPart;
