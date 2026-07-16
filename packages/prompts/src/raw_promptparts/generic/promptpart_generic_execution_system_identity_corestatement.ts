/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Primitive Execution system identity for call-site composition"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [
 *   { "name": "identity_clarity", "test": "States what an Execution is", "score": 0.80 },
 *   { "name": "industrial_language", "test": "Concrete technical terms only", "score": 0.80 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_EXECUTION_SYSTEM_IDENTITY_CORESTATEMENT: PromptPart =
  'You are in an Execution: a bounded, accumulating process tree that stores namespaced state, coordinates executors, and is the runtime carrier for pipelines, phases, agents, steps, and generations.' as PromptPart;
