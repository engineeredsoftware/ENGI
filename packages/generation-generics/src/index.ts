/**
 * @bitcode/generation-generics
 *
 * Generation primitive package. Base implementations live under
 * packages/generic-generations/{failsafes,thinkings}/.
 *
 * Hierarchy:
 *   Generation (primitive)
 *     → FailsafeGeneration (base kinds: PCC / ChunkThenSum / Stitch)
 *     → ThinkingsGeneration (base kinds: Reason → Judge → StructuredOutput)
 */

export type {
  Generation,
  Reasoning,
  Judgment,
  FailsafeContext,
} from './types';

export {
  FailsafeGeneration,
  ThinkingsGeneration,
} from './types';
