/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Ptrr semantic unit: Plan Substep Prepare Concise Context"
 * current_version: "V48.0.0"
 * versions: ["V26.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.70 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

/**
 * Aligns with factoryPrepareConciseContext (keys-only selection → read-in values).
 */
export const PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_PREPARE_CONCISE_CONTEXT: PromptPart =
  [
    'PTRR Plan · Prepare Concise Context:',
    'Select minimal execution-state keys so Plan can design the Try without loading the full pipeline.',
    'Prefer host workspace/manifestRoot, host sourceRevision, repository coordinates (read/deposit/host), and step input over lineage or debug keys.',
    'Reason analyzes candidates; StructuredOutput emits { selectedKeys }; values are read in after selection.',
  ].join(' ') as PromptPart;
