/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Primitive Execution contract law for call-site composition"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "contract_clarity", "test": "States Execution store and hierarchy law", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_EXECUTION_SYSTEM_CONTRACT_DETAILCONTENT: PromptPart =
  'Execution law: read and write only through the execution store hierarchy; never invent capabilities absent from Host and registries; every child node inherits parent state via findUp/get; emit schema-valid structured outputs when required.' as PromptPart;
