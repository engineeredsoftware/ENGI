/**
 * Canonical PTRR STEP output schemas.
 *
 * Step outputs validate against STEP schemas, not the full agent schema
 * (Garrett, 2026-07-03). Each PTRR step's structured output — and the
 * StitchUntilComplete failsafe guarding it — validates against what THAT step
 * is prompted to produce:
 *
 *  - Plan   → the canonical plan shape below (the execution strategy the
 *             PLAN objective asks for), NOT the agent's output. Forcing the
 *             agent schema onto Plan made every run's plan step fail
 *             validation and burn stitch repairs before Try even started.
 *  - Try    → the agent's output schema (the main generation attempt).
 *  - Refine → the agent's output schema (improves the Try output in place).
 *  - Retry  → the agent's output schema (the last bounded chance at a valid
 *             output — the agent's final result is the last step's output,
 *             so the run's typed contract is preserved).
 *
 * `factoryAgentWithPTRR` resolves these defaults; each step accepts an
 * explicit `outputSchema` override in its per-step config.
 */

import { z } from 'zod';

// Kept deliberately small and universally satisfiable across every PTRR
// agent (comprehension, search, synthesis, measure, validation …); large
// schemas inflate the structured-output hint and invite truncation.
export const PlanStepOutputSchema = z.object({
  approach: z.string(),
  steps: z.array(z.string()),
  considerations: z.array(z.string()).optional()
}).describe('{ "approach": string, "steps": string[], "considerations"?: string[] }');

export type PlanStepOutput = z.infer<typeof PlanStepOutputSchema>;
