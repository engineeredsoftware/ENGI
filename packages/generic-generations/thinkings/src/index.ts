/**
 * @bitcode/generic-generations-thinkings
 *
 * ThinkingsGeneration base: Reason → Judge → StructuredOutput.
 *
 * Hierarchy: Generation → ThinkingsGeneration (this layer's kinds).
 * Composition helper `createThinkingsGeneration` and the LLM-bound
 * factoryReason / factoryJudge / factoryStructuredOutput currently execute
 * through AgentExecution in @bitcode/agent-generics. This package owns the
 * generation-vocabulary re-export surface for the Thinkings layer so product
 * code and agent-generics share one hierarchy entrypoint.
 *
 * Prefer:
 *   import { ThinkingsGeneration, type Reasoning, type Judgment } from
 *     '@bitcode/generic-generations-thinkings'
 * and factory/create helpers from @bitcode/agent-generics until factories move.
 */

export type { Generation, Reasoning, Judgment } from '@bitcode/generation-generics';
export {
  ThinkingsGeneration,
} from '@bitcode/generation-generics';
