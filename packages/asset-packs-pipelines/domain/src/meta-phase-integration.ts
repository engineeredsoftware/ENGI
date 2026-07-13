/**
 * Gate integration for the AssetPack Pipeline
 *
 * Minimal, surgical integration of Design → Develop → Digest meta-phases.
 * Wraps the AssetPack pipeline with meta-phase awareness.
 *
 * @package @bitcode/pipelines/asset-pack
 */

import { Execution, Executor } from '@bitcode/execution-generics';
import {
  getCurrentMetaPhase,
  storeMetaPhaseState,
  attemptMetaPhaseTransition,
  initializeMetaPhaseState,
  metaPhasePreprocess,
} from '@bitcode/pipelines-generics';

type MetaPhaseConfig = {
  collaborative?: boolean;
  primaryDocument?: string;
  allowedFilePatterns?: string[];
};

/**
 * Add meta-phase support to the AssetPack pipeline.
 *
 * This is a minimal wrapper that:
 * 1. Initializes meta-phase state (default: Develop)
 * 2. Runs meta-phase preprocess before each DIV iteration
 * 3. Checks for transitions after validation
 * 4. Continues DIV loop within current meta-phase
 */
export function withMetaPhaseSupport<TInput, TOutput>(
  basePipeline: Executor<TInput, TOutput>,
  options?: {
    /**
     * Starting meta-phase (default: Develop for single-phase AssetPack runs)
     */
    initialMetaPhase?: 'Design' | 'Develop' | 'Digest';

    /**
     * Enable full DDD flow (default: false)
     * When false, stays in single meta-phase
     * When true, transitions through Design → Develop → Digest
     */
    enableDDDFlow?: boolean;
  }
): Executor<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Initialize meta-phase state
    const initialPhase = options?.initialMetaPhase || 'Develop';
    const state = initializeMetaPhaseState(initialPhase);
    storeMetaPhaseState(execution, state);

    // Run meta-phase preprocess (sets file gates, collaborative flags)
    metaPhasePreprocess(input, execution);

    // Run base pipeline
    const result = await basePipeline(input, execution);

    // Check for meta-phase transition (only if DDD flow enabled)
    if (options?.enableDDDFlow) {
      const transitioned = attemptMetaPhaseTransition(execution);

      if (transitioned) {
        const newMetaPhase = getCurrentMetaPhase(execution);
        console.log(`[DDD] Transitioned to ${newMetaPhase} phase`);

        // Re-run preprocess for new meta-phase
        metaPhasePreprocess(input, execution);

        // Note: In full DDD implementation, would recursively run pipeline
        // In single-execution mode, mark the transition and let UI handle next execution.
        execution.store('meta', 'transitionedTo', newMetaPhase);
        execution.store('meta', 'requiresNewExecution', true);
      }
    }

    return result;
  };
}

/**
 * Create meta-phase aware iteration preprocessor
 *
 * Extends the existing iteration preprocessor to respect meta-phase.
 * Merges attachments and ensures file gates are enforced.
 */
export function createMetaPhaseIterationPreprocessor<T>(
  basePreprocessor?: Executor<T, T>
): Executor<T, T> {
  return async (input: T, execution: Execution): Promise<T> => {
    // Run base preprocessor if exists
    let current = basePreprocessor ? await basePreprocessor(input, execution) : input;

    // Apply meta-phase configuration
    const metaPhase = getCurrentMetaPhase(execution);
    const config = execution.get<MetaPhaseConfig>('meta', 'config') || {};

    // Store meta-phase info for agents to access
    execution.store('meta', 'currentPhase', metaPhase);
    execution.store('meta', 'collaborative', config.collaborative || false);

    // Add meta-phase context to input
    (current as any).metaPhaseContext = {
      phase: metaPhase,
      collaborative: config.collaborative,
      primaryDocument: config.primaryDocument,
      allowedFiles: config.allowedFilePatterns,
    };

    return current;
  };
}
