import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';

const FinalizeOutputSchema = z.object({ status: z.literal('finalized').default('finalized') });

export const AssetPackFinishFinalizeDeliveryEvidenceAgent = factoryAgentWithPTRR<any, z.infer<typeof FinalizeOutputSchema>>({
  name: 'finish:asset-pack-finalize-delivery-evidence-agent',
  description: 'Finalize AssetPack Finish delivery evidence bookkeeping',
  outputSchema: FinalizeOutputSchema,
  prompt: (() => { 
    const p = new Prompt(); 
    p.set('agent:identity', createPromptPart('You finalize AssetPack Finish delivery evidence for source-to-shares auditability.'));
    p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return p; 
  })(),
  stepPrompts: { plan: () => new Prompt(), try: () => new Prompt(), refine: () => new Prompt(), retry: () => new Prompt() }
});

export default async function assetPackFinishFinalizeDeliveryEvidenceAgent(_input: any, execution: any) {
  const out = await AssetPackFinishFinalizeDeliveryEvidenceAgent({}, execution);
  try {
    execution?.store?.('finish', 'finalized', true);
  } catch {}
  return out;
}
