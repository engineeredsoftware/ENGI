/**
 * Setup Plan Agent (PTRR)
 *
 * Minimal PTRR agent used in Setup phase to derive a concise plan for the
 * expressed read and AssetPack written-asset synthesis corridor.
 *
 * Env for bring-up:
 * - BITCODE_DEBUG_ONLY_FAILSAFES=prepare
 * - BITCODE_DEBUG_ONLY_GENERATIONS=reason
 */

import { z } from 'zod';
import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_objective';
import { PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_objective';
import { PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_objective';
import { PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_objective';
import { PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_giventhefollowing';
import { PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_executethe_following';
import { PROMPTPART_GENERIC_FORMATTING_BASEDONTHE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_basedonthe';
import { PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_afterencountering';

const PlanSchema = z.object({
  plan: z.string().describe('High-level plan for Setup context')
});

export const ReadFitsFindingSynthesisSetupPlanAgent = factoryAgentWithPTRR<any, z.infer<typeof PlanSchema>>({
  name: 'ReadFitsFindingSynthesisSetupPlanAgent',
  description: 'Derive concise setup plan from repository context and expressed read',
  outputSchema: PlanSchema,
  // Minimal prompt hierarchy to satisfy lint and provide usable strings.
  prompt: (() => {
    const p = new Prompt();
    p.set('pipeline', 'asset-pack' as any);
    p.set('phase', 'setup' as any);
    p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
    p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
    p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
    p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return p;
  })(),
  stepPrompts: {
    plan: () => {
      const p = new Prompt();
      p.set('pipeline', 'asset-pack' as any);
      p.set('phase', 'setup' as any);
      p.set('context_lead', PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING);
      p.set('objective', PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE);
      p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
      p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
      p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
      p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
      p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
      p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
      return p;
    },
    try: () => {
      const p = new Prompt();
      p.set('pipeline', 'asset-pack' as any);
      p.set('phase', 'setup' as any);
      p.set('directive', PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING);
      p.set('objective', PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE);
      p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
      p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
      p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
      p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
      p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
      p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
      p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
      return p;
    },
    refine: () => {
      const p = new Prompt();
      p.set('pipeline', 'asset-pack' as any);
      p.set('phase', 'setup' as any);
      p.set('context_lead', PROMPTPART_GENERIC_FORMATTING_BASEDONTHE);
      p.set('objective', PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE);
      p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
      p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
      p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
      p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
      p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
      p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
      return p;
    },
    retry: () => {
      const p = new Prompt();
      p.set('pipeline', 'asset-pack' as any);
      p.set('phase', 'setup' as any);
      p.set('context_lead', PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING);
      p.set('objective', PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE);
      p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
      p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
      p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
      p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
      p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
      p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
      p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
      return p;
    }
  },
  plan: { },
  try: { },
  refine: { },
  retry: { }
});
// Default runner: ALWAYS run the formal PTRR agent. A fast lifecycle stub is
// kept ONLY under NODE_ENV==='test' (or the explicit debug-only env) so unit
// tests never reach a live provider; real determinism comes from a boundary
// LLM mock, never from an inference profile.
export default async function runReadFitsFindingSynthesisSetupPlanAgent(input: any, execution: any) {
  const onlyFails = String(process?.env?.BITCODE_DEBUG_ONLY_FAILSAFES || '');
  const onlyGens = String(process?.env?.BITCODE_DEBUG_ONLY_GENERATIONS || '');
  const isTest = String(process?.env?.NODE_ENV || '').toLowerCase() === 'test';
  const emitStubLifecycle =
    process?.env?.BITCODE_ENABLE_ASSET_PACK_SETUP_PHASE_RUNTIME_IN_TEST === '1';
  const useStub = isTest || (onlyFails.length > 0 && onlyGens.length > 0);

  let result: z.infer<typeof PlanSchema>;
  if (useStub) {
    if (emitStubLifecycle) {
      try {
        execution?.store?.('agent:ReadFitsFindingSynthesisSetupPlanAgent', 'start', {
          phase: 'setup',
          agent: 'ReadFitsFindingSynthesisSetupPlanAgent',
          step: 'Plan'
        } as any);
      } catch {}
    }
    result = { plan: 'Prepare concise context; Reason about setup; Return minimal plan.' };
    if (emitStubLifecycle) {
      try {
        execution?.store?.('agent:ReadFitsFindingSynthesisSetupPlanAgent', 'complete', {
          phase: 'setup',
          agent: 'ReadFitsFindingSynthesisSetupPlanAgent',
          step: 'Plan'
        } as any);
      } catch {}
    }
  } else {
    const raw = await ReadFitsFindingSynthesisSetupPlanAgent(input, execution);
    // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
    // unwrap it to the agent's typed structured output.
    const unwrapped = ((raw as any)?.finalOutput ?? (raw as any)?.output ?? raw) as z.infer<typeof PlanSchema>;
    result = { plan: typeof unwrapped?.plan === 'string' ? unwrapped.plan : '' };
  }

  try {
    execution?.store?.('setup', 'plan', result.plan);
    execution?.store?.('setup/plan', 'result', result);
  } catch {}

  return result;
}
