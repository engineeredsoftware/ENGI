const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function isEnabled(value: string | undefined): boolean {
  return TRUE_VALUES.has(String(value || '').trim().toLowerCase());
}

/**
 * Master real-inference switch (NOT a profile).
 *
 * Product default is **on** when unset: inference runs in the pipeline host /
 * Pipeliner process, not via uapi configuration. Explicit `0`/`false`/`off`
 * still disables for deterministic unit tests and bring-up harnesses.
 * Determinism is provided by mocking the LLM provider at the boundary, never
 * by branches inside the pipeline.
 */
export function isAssetPackRealInferenceEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.BITCODE_ASSET_PACK_REAL_INFERENCE;
  if (raw === undefined || String(raw).trim() === '') return true;
  return isEnabled(raw);
}
