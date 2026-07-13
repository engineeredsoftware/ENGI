/**
 * @bitcode/generic-generations-failsafes
 *
 * Base failsafe package: prepared-context domain for PrepareConciseContext,
 * plus re-exports of generation vocabulary used by failsafe composition.
 *
 * LLM-bound failsafe factories (factoryPrepareConciseContext, ChunkThenSum,
 * StitchUntilComplete, createFailsafeGenerationSequence) still live in
 * @bitcode/agent-generics until AgentExecution coupling is inverted.
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
  FailsafeMetaSubStep,
  type FailsafeContext,
  type Generation,
} from '@bitcode/generation-generics';
