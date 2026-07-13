import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

const GatherMetricsOutputSchema = z.object({
  metrics: z.object({
    agentsExecuted: z.number().nullable().optional(),
    durationMs: z.number().nullable().optional()
  })
});

export const AssetPackFinishGatherMetricsAgent = factoryAgentWithPTRR<any, z.infer<typeof GatherMetricsOutputSchema>>({
  name: 'finish:asset-pack-gather-metrics-agent',
  description: 'Gather AssetPack execution metrics for Finish evidence',
  outputSchema: GatherMetricsOutputSchema,
  prompt: (() => { const p = new Prompt(); p.set('agent:identity', createPromptPart('You summarize AssetPack source-to-shares execution metrics.')); return p; })(),
  stepPrompts: { plan: () => new Prompt(), try: () => new Prompt(), refine: () => new Prompt(), retry: () => new Prompt() }
});

export default async function assetPackFinishGatherMetricsAgent(_input: any, execution: any) {
  const agentsExecuted = execution?.get?.('metrics', 'agentsExecuted') || null;
  // Duration can be computed from pipeline start/end if available
  const start = execution?.get?.('pipeline','startTime');
  const end = execution?.get?.('pipeline','endTime');
  const durationMs = typeof start === 'number' && typeof end === 'number' ? (end - start) : null;
  return await AssetPackFinishGatherMetricsAgent({ metrics: { agentsExecuted, durationMs } }, execution);
}
