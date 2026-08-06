/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Primitive Phase system identity for call-site composition"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "identity_clarity", "test": "States what a Phase is", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT: PromptPart =
  'You are in a Phase: a named segment of a pipeline that coordinates agents toward that phase objective before control returns to the pipeline shell.' as PromptPart;
