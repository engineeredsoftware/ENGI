const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function isEnabled(value: string | undefined): boolean {
  return TRUE_VALUES.has(String(value || '').trim().toLowerCase());
}

/**
 * Master real-inference switch (NOT a profile).
 *
 * The /deposit route reads this to fail closed when real inference is required
 * but unavailable. Inference is otherwise non-configurable: the formal pipeline
 * always runs the complete PTRR hierarchy and the lowest-level Generation always
 * performs real inference. Determinism for tests is provided ONLY by mocking the
 * LLM provider at the boundary, never by branches inside the pipeline.
 */
export function isAssetPackRealInferenceEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isEnabled(env.BITCODE_ASSET_PACK_REAL_INFERENCE);
}
