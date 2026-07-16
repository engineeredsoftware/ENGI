/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Primitive Phase contract law"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "contract_clarity", "test": "States phase-local objective law", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT: PromptPart =
  'Phase law: complete only this phase objective; store cross-phase artifacts for later phases; do not assume later phases have already run.' as PromptPart;
