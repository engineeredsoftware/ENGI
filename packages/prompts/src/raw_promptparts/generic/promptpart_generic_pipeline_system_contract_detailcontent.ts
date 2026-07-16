/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Primitive Pipeline contract law"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "contract_clarity", "test": "States phase and Host boundaries", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PIPELINE_SYSTEM_CONTRACT_DETAILCONTENT: PromptPart =
  'Pipeline law: respect phase boundaries; use only tools and context available on the Host; emit structured outputs that match the active schema; never invent Host capabilities or bypass source-safety.' as PromptPart;
