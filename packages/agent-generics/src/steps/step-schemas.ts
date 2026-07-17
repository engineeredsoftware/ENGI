/**
 * Canonical PTRR STEP output schemas.
 *
 * Step outputs validate against STEP schemas, not the full agent schema
 * (Garrett, 2026-07-03). Each PTRR step's structured output — and the
 * StitchUntilComplete failsafe guarding it — validates against what THAT step
 * is prompted to produce:
 *
 *  - Plan   → the canonical plan shape below (the execution strategy the
 *             PLAN objective asks for), NOT the agent's output. No `useTools`
 *             field; no tools postprocess. Forcing the agent schema onto Plan
 *             made every run's plan step fail validation and burn stitch repairs
 *             before Try even started.
 *  - Try    → the agent's output schema (the main generation attempt). May
 *             include `useTools`; tools postprocess runs when selected.
 *  - Retry  → the agent's output schema (re-attempt Try using prior errors /
 *             usedTools; tools postprocess when selected).
 *  - Refine → the agent's output schema (LAST step — final agent return;
 *             same type as the agent; no tools postprocess / no useTools
 *             execution).
 *
 * PCC selection SO (first failsafe) is never the step schema: always
 * `{ selectedKeys }` only — never useTools — on every PTRR step.
 *
 * Runtime order: Plan → Try → Retry → Refine.
 * `factoryPTRRAgent` resolves these defaults; each step
 * accepts an explicit `outputSchema` override in its per-step config.
 */

import { z } from 'zod';

// Kept deliberately small and universally satisfiable across every PTRR
// agent (comprehension, search, synthesis, measure, validation …); large
// schemas inflate the structured-output hint and invite truncation.
/** Plan task SO only — no useTools (tools are Try/Retry). */
export const PlanStepOutputSchema = z.object({
  approach: z.string(),
  steps: z.array(z.string()),
  considerations: z.array(z.string()).optional()
  // intentionally no useTools
}).describe('{ "approach": string, "steps": string[], "considerations"?: string[] }');

export type PlanStepOutput = z.infer<typeof PlanStepOutputSchema>;
