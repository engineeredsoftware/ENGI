/**
 * Zod schemas and result types for deposit-mode Validation agent.
 *
 * Input is intentionally loose (execution-store shaped); output is the
 * structured quality verdict the ReadyToFinish gate and /deposits surface read.
 */

import { z } from 'zod';

export const DepositValidationInputSchema = z.object({
  assetPacks: z.any().optional(),
  sourceCheckoutCatalog: z.any().optional(),
  obfuscationGuidance: z.any().optional(),
  impermissibleSources: z.any().optional(),
  priorPhaseIssues: z.array(z.string()).optional(),
});

export const DepositValidationOutputSchema = z.object({
  issues: z.array(z.string()),
  qualityScore: z.number().min(0).max(1),
  coverageGaps: z.array(z.string()),
  recommendation: z.enum(['complete', 'iterate']),
});

export type DepositValidationResult = z.infer<typeof DepositValidationOutputSchema>;
export type DepositValidationInput = z.infer<typeof DepositValidationInputSchema>;
