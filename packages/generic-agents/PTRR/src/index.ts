/**
 * @bitcode/generic-agents-ptrr
 *
 * Base PTRRAgent (hierarchy: PTRR + Agent primitive).
 * Product agents specialize prompts/tools/schemas — they do not reimplement
 * Plan→Try→Retry→Refine or the 7-substep failsafe sequence.
 *
 * Step factories remain in @bitcode/agent-generics (`factoryPlanStep` / …);
 * this package owns the PTRRAgent assembly factory.
 */

export type { PTRRAgent } from './ptrr-factory';

export {
  factoryPTRRAgent,
  factoryPTRRAgentWithGenerations,
  type BitcodePTRRFactoryConfig,
  type BitcodePTRRPromptCarrier,
  type BitcodePTRRPromptValue,
  type BitcodePTRRStepName,
  type BitcodePTRRStepPromptCarrier,
  type BitcodePTRRStepPromptRegistry,
} from './ptrr-factory';
