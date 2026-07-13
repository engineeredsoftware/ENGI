/**
 * Zod schemas for deposit-mode AssetPack synthesis agent output.
 *
 * Measured-patch options: source-safe descriptors + neediness signal inputs.
 * Absolute measurement volumes are produced later in Validation, not here.
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

// Neediness preview signal (v0): inputs from which neediness is COMPUTED downstream.
export const depositNeedinessSignalSchema = z.object({
  demand: z.coerce.number().min(0).max(1),
  saturation: z.coerce.number().min(0).max(1),
  rationale: z.string().min(10).max(400),
});

export const depositCandidateSchema = z.object({
  kind: z.string().min(1),
  title: z.string().min(8).max(160),
  summary: z.string().min(40).max(900),
  coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
  // Optional legacy record; ignored when Validation attaches formal absolutes.
  measurements: z.record(z.string(), z.coerce.number().min(0).max(1)).optional(),
  measurementRationale: z.string().max(700).optional(),
  confidence: z.coerce.number().min(0).max(1),
  patch: depositPatchSchema,
  needinessSignal: depositNeedinessSignalSchema.optional(),
});

export const depositCandidateSetSchema = z.object({
  options: z.array(depositCandidateSchema).min(1).max(4),
});

export type DepositSynthesisOptions = z.infer<typeof depositCandidateSetSchema>;
