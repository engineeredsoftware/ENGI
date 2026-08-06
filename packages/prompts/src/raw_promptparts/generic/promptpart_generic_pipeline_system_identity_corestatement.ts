/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Primitive Pipeline system identity for call-site composition"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "identity_clarity", "test": "States what a Pipeline is", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PIPELINE_SYSTEM_IDENTITY_CORESTATEMENT: PromptPart =
  'You are in a Pipeline: a bounded, observable product run that sequences phases, agents, and generations to produce typed outcomes on a Host.' as PromptPart;
