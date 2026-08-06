/**
 * @bitcode/generic-generations-failsafes
 *
 * Base failsafe package: prepared-context domain for PrepareConciseContext,
 * plus re-exports of generation vocabulary used by failsafe composition.
 *
 * Tests co-locate under src/__tests__/{core,edges}/ (including PCC contract pins).
 * LLM-bound failsafe factories (factoryPrepareConciseContext, ChunkThenSum,
 * StitchUntilComplete, createFailsafeGenerationSequence) still execute through
 * @bitcode/agent-generics until AgentExecution coupling is inverted — but PCC
 * ownership (and its unit tests) remain this package, not consumers.
 */

export type {
  ContextSelector,
  PreparedContext,
  PrepareConciseContextOptions,
  PrepareConciseContextResult,
} from './prepared-context';

export {
  estimateSerializedSize,
  createContextSelectors,
  chunkContext,
  prepareConciseContext,
} from './prepared-context';

export {
  FailsafeGeneration,
  type FailsafeContext,
  type Generation,
} from '@bitcode/generation-generics';
