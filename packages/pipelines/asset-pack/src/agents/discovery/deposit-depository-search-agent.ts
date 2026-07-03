/**
 * Deposit depository-search agent — Discovery phase (V48 Gate 3).
 *
 * The second of the three deposit-mode Discovery lenses. It discovers from the
 * DEPOSITORY: it reasons about what reading demand the repository's knowledge is
 * likely to satisfy and produces read-likelihood / demand guidance for the
 * AssetPacks being synthesized — what future readers would want, and how to frame
 * the packs so they are findable and fit. The Implementation synthesis reads this
 * guidance to make candidate options legible to future buyers. Runs on the formal
 * PTRR machinery.
 *
 * Source-safety: reason about demand and framing — never quote raw source.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const part = (content: string): PromptPart => content as PromptPart;

const DepositorySearchInputSchema = z.object({
  repository: z.any().optional(),
  inventory: z.any().optional(),
  demandContext: z.array(z.any()).optional(),
});

const ReadDemandGuidanceSchema = z.object({
  summary: z.string(),
  likelyReadTopics: z.array(z.string()).optional(),
  demandAlignment: z.array(z.string()).optional(),
  // Supply-scarcity signal (feeds deposit neediness, v0): topics the Depository
  // likely under-supplies — high opportunity for a new, needed pack.
  underservedTopics: z.array(z.string()).optional(),
  readabilityNotes: z.array(z.string()).optional(),
});

const DepositorySearchOutputSchema = z.object({
  guidance: ReadDemandGuidanceSchema,
});

export type DepositReadDemandGuidance = z.infer<typeof ReadDemandGuidanceSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering ' +
    'from the DEPOSITORY. Reason about what reading demand the repository’s ' +
    'knowledge is likely to satisfy: produce read-likelihood / demand guidance for ' +
    'the AssetPacks being synthesized — what future readers would want, and how to ' +
    'frame the packs so they are findable and fit. Be source-safe: reason about ' +
    'demand and framing, never quote raw source.',
);

const REQUIREMENTS = part(
  'From the repository coordinates, the inventory, and the depositor demand context, ' +
    'derive: summary (the reading demand the repository is likely to satisfy), ' +
    'likelyReadTopics (Needs/topics future readers would search for), demandAlignment ' +
    '(how the repository knowledge aligns with the provided demand context), ' +
    'underservedTopics (topics the Depository likely UNDER-supplies — where a new ' +
    'pack would be scarce and therefore most needed), and readabilityNotes (how to ' +
    'frame the synthesized packs so they are findable and fit). ' +
    'Ground topics in the actual inventory; stay source-safe. ' +
    'Return ONLY {"guidance": {...}}.',
);

const PLAN = part('Plan: weigh the repository knowledge against likely reader demand and the demand context.');
const TRY = part('Try: produce read-likelihood guidance — likely topics, demand alignment, readability framing.');
const REFINE = part('Refine: ensure the guidance is grounded in the inventory, demand-aligned, and source-safe.');
const RETRY = part('Retry: return minimal demand guidance rather than failing the search.');

function createPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', IDENTITY);
  prompt.set('agent:requirements', REQUIREMENTS);
  prompt.set('ptrr:plan', PLAN);
  prompt.set('ptrr:try', TRY);
  prompt.set('ptrr:refine', REFINE);
  prompt.set('ptrr:retry', RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const prompt = createPrompt();

export const DepositDepositorySearchAgent = factoryAgentWithPTRR<
  z.infer<typeof DepositorySearchInputSchema>,
  z.infer<typeof DepositorySearchOutputSchema>
>({
  name: 'DepositDepositorySearchAgent',
  description:
    'Produces read-likelihood / demand guidance for the AssetPacks being synthesized (deposit discovery: depository lens).',
  outputSchema: DepositorySearchOutputSchema,
  tools: [],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 4000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runDepositDepositorySearchAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const demandContext = input?.demandContext ?? findValue(execution, 'deposit', 'demandContext') ?? [];

  const raw = await DepositDepositorySearchAgent(
    { ...input, repository, inventory, inventoryPaths: inventory?.paths, demandContext },
    execution,
  );
  // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const guidance: DepositReadDemandGuidance = (result as any)?.guidance ?? {
    summary:
      'No read-demand guidance derived; frame synthesized packs by their codebase knowledge until demand signal exists.',
    likelyReadTopics: [],
    demandAlignment: [],
    underservedTopics: [],
    readabilityNotes: [],
  };

  // Cross-phase artifact: the Implementation synthesis agent grounds the
  // neediness signals in this guidance (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearch', guidance);

  return { ...(input || {}), success: true, guidance };
}
