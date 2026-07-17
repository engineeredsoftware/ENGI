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
 *  - Refine → agent domain fields only (LAST step — final return). Same
 *             domain type as the agent, but **useTools is always omitted**
 *             from the Refine SO schema (no tools postprocess on Refine).
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

/**
 * Strip optional `useTools` from a Zod object schema for Plan/Refine SO.
 * Identity when the schema has no useTools key (preserves reference equality).
 */
export function omitUseToolsFromSchema<T extends z.ZodTypeAny>(schema: T): T {
  try {
    const def = (schema as any)?._def;
    const rawShape =
      typeof def?.shape === 'function'
        ? def.shape()
        : def?.shape ?? (schema as any)?.shape;
    if (!rawShape || typeof rawShape !== 'object' || !('useTools' in rawShape)) {
      return schema;
    }
    const nextShape: Record<string, z.ZodTypeAny> = {};
    for (const [k, v] of Object.entries(rawShape)) {
      if (k === 'useTools') continue;
      nextShape[k] = v as z.ZodTypeAny;
    }
    let next: z.ZodTypeAny = z.object(nextShape);
    const desc = typeof (schema as any).description === 'string' ? (schema as any).description : '';
    if (desc) {
      // Drop useTools clause from schema hint string if present.
      const cleaned = desc
        .replace(/,?\s*"useTools"\s*\?:?\s*\[[^\]]*\]/g, '')
        .replace(/,?\s*"useTools"\s*\?:?\s*[^,}\]]+/g, '')
        .replace(/,\s*}/g, ' }')
        .replace(/\{\s*,/g, '{ ');
      next = next.describe(cleaned);
    }
    return next as T;
  } catch {
    return schema;
  }
}

/**
 * Refine final-return hygiene: strip any `useTools` the model may have emitted.
 * Refine never runs tools postprocess — only usable/use/used constructs exist
 * on Try/Retry. Domain fields (including free-text `status`) are left alone.
 */
export function sanitizeRefineStepOutput<T>(output: T): T {
  if (!output || typeof output !== 'object' || Array.isArray(output)) return output;
  if (!('useTools' in (output as object))) return output;
  const bag = { ...(output as Record<string, unknown>) };
  delete bag.useTools;
  return bag as T;
}
