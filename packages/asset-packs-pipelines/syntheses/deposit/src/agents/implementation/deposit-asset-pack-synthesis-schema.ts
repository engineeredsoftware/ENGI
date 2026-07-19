/**
 * Zod schemas for deposit-mode AssetPack synthesis agent output.
 *
 * AssetPack = patch + measurements + metadata.
 * Nested measurement kinds:
 *   measurements: { absolutes: [...], needinesses: [] }
 * Deposit: needinesses always empty. LLM omits absolutes; Implementation host
 * MUST attach measurements.absolutes before Validation.
 */

import { z } from 'zod';

export const DEPOSIT_OPTION_KINDS = [
  'capability-slice',
  'implementation-pattern',
  'proof-operations-slice',
] as const;

// SOURCE-SAFE patch descriptor: path + op + summary only — never raw code.
export const depositPatchSchema = z.object({
  fileChanges: z
    .array(
      z.object({
        path: z.string(),
        op: z.enum(['create', 'modify', 'delete']),
      }),
    )
    .min(1),
  patchSummary: z.string(),
});

/** Nested measurement kinds (host-attached absolutes on deposit). */
export const depositMeasurementsByKindSchema = z.object({
  absolutes: z.array(z.record(z.any())).optional(),
  needinesses: z.array(z.record(z.any())).optional(),
});

/**
 * Residual model noise only — never deposit product law (neediness is READ-only).
 * Lenient so empty/partial emissions do not fail Refine schema and force stitch
 * death-spirals (live 2026-07-17: rationale "" → options Required).
 */
export const depositNeedinessSignalSchema = z.object({
  demand: z.coerce.number().min(0).max(1).optional(),
  saturation: z.coerce.number().min(0).max(1).optional(),
  rationale: z.string().max(400).optional(),
});

export const depositCandidateSchema = z.object({
  kind: z.string().min(1),
  title: z.string().min(8).max(160),
  summary: z.string().min(40).max(900),
  coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
  /**
   * Nested kinds object (canonical) OR legacy flat 0..1 record (ignored when
   * nested absolutes are present). Host overwrites absolutes after PTRR.
   */
  measurements: z.union([depositMeasurementsByKindSchema, z.record(z.string(), z.coerce.number().min(0).max(1))]).optional(),
  measurementRationale: z.string().max(700).optional(),
  absolutes: z.array(z.record(z.any())).optional(),
  confidence: z.coerce.number().min(0).max(1),
  patch: depositPatchSchema,
  /** Residual — stripped by Implementation host if model still emits. */
  needinessSignal: depositNeedinessSignalSchema.optional(),
});

/**
 * Normalize common model mis-shapes before strict parse (run 34837896: stitch
 * loop never saw `options` because the model returned a bare array / alternate
 * key / single candidate object). Coerce those into `{ options: [...] }`.
 */
export function normalizeDepositCandidateSetInput(raw: unknown): unknown {
  if (raw == null) return raw;
  // Bare array of candidates
  if (Array.isArray(raw)) {
    return { options: raw };
  }
  if (typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;
  // Already has options (including empty — leave for min(1) to reject)
  if (Array.isArray(obj.options)) {
    return obj;
  }
  // Alternate keys models often emit
  for (const key of ['assetPacks', 'candidates', 'packs', 'asset_packs', 'results'] as const) {
    if (Array.isArray(obj[key])) {
      return { ...obj, options: obj[key] };
    }
  }
  // Nested under output / finalOutput (envelope leakage into stitch partial)
  for (const key of ['output', 'finalOutput', 'result'] as const) {
    const nested = obj[key];
    if (nested && typeof nested === 'object') {
      const normalized = normalizeDepositCandidateSetInput(nested);
      if (
        normalized &&
        typeof normalized === 'object' &&
        Array.isArray((normalized as { options?: unknown }).options)
      ) {
        return normalized;
      }
    }
  }
  // Single candidate at the top level (has title + patch)
  if (
    typeof obj.title === 'string' &&
    obj.patch &&
    typeof obj.patch === 'object' &&
    !Array.isArray(obj.patch)
  ) {
    return { options: [obj] };
  }
  return obj;
}

const depositCandidateSetObjectSchema = z.object({
  options: z.array(depositCandidateSchema).min(1).max(4),
});

export const depositCandidateSetSchema = z.preprocess(
  normalizeDepositCandidateSetInput,
  depositCandidateSetObjectSchema,
);

export type DepositSynthesisOptions = z.infer<typeof depositCandidateSetObjectSchema>;
