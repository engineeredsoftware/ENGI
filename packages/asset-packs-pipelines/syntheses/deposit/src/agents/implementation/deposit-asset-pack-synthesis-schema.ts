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

export const depositCandidateSetSchema = z.object({
  options: z.array(depositCandidateSchema).min(1).max(4),
});

export type DepositSynthesisOptions = z.infer<typeof depositCandidateSetSchema>;
