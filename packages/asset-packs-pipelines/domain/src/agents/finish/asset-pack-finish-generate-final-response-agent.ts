import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';

const FinalResponseOutputSchema = z.object({ message: z.string(), summary: z.any().optional() });

export const AssetPackFinishGenerateFinalResponseAgent = factoryAgentWithPTRR<any, z.infer<typeof FinalResponseOutputSchema>>({
  name: 'finish:asset-pack-generate-final-response-agent',
  description: 'Generate final AssetPack response payload for API and Terminal surfaces',
  outputSchema: FinalResponseOutputSchema,
  prompt: (() => { 
    const p = new Prompt(); 
    p.set('agent:identity', createPromptPart('You prepare a concise AssetPack Finish response for Bitcode API and Terminal surfaces.'));
    p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return p; 
  })(),
  stepPrompts: { plan: () => new Prompt(), try: () => new Prompt(), refine: () => new Prompt(), retry: () => new Prompt() }
});

export default async function assetPackFinishGenerateFinalResponseAgent(input: any, execution: any) {
  return await AssetPackFinishGenerateFinalResponseAgent({ message: 'AssetPack delivery completed', summary: input?.summary || {} }, execution);
}
