/**
 * Deposit input-comprehension agent — Setup phase (V48 Gate 3).
 *
 * The deposit lens of the SynthesizeAssetPacks Setup input-comprehension: the read
 * lens comprehends the Need; the deposit lens comprehends the depositor's
 * OBFUSCATIONS — the free-text declaration of what to obfuscate/withhold — against
 * the cloned repository inventory, producing structured obfuscation guidance that
 * downstream phases honor (alongside the protected-IP exclusions) so synthesized
 * AssetPacks never expose obfuscated material. Runs on the formal PTRR machinery.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const part = (content: string): PromptPart => content as PromptPart;

const InputComprehensionInputSchema = z.object({
  obfuscations: z.string().nullable().optional(),
  repository: z.any().optional(),
  inventory: z.any().optional(),
});

const ObfuscationGuidanceSchema = z.object({
  summary: z.string(),
  obfuscatedPaths: z.array(z.string()).optional(),
  obfuscatedConcepts: z.array(z.string()).optional(),
  honorNotes: z.array(z.string()).optional(),
});

const InputComprehensionOutputSchema = z.object({
  comprehension: ObfuscationGuidanceSchema,
});

export type DepositObfuscationComprehension = z.infer<typeof ObfuscationGuidanceSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks input-comprehension agent in DEPOSIT mode. ' +
    "Comprehend the depositor's OBFUSCATIONS — their free-text declaration of what to " +
    'obfuscate or withhold from the deposit — against the repository inventory. Produce ' +
    'structured obfuscation guidance: the source paths and concepts to obfuscate, and how ' +
    'downstream synthesis must honor them. Never expose obfuscated material; describe ' +
    'knowledge, never raw source.',
);

const REQUIREMENTS = part(
  'From the Obfuscations text and the inventory, derive: obfuscatedPaths (inventory paths ' +
    'the depositor wants withheld, chosen only from the provided inventory), ' +
    'obfuscatedConcepts (knowledge/topics to obfuscate), and honorNotes (how synthesis must ' +
    'honor them). Be conservative — when in doubt, obfuscate. If no obfuscations are ' +
    'declared, return an empty guidance with a summary noting the protected-IP exclusions ' +
    'remain authoritative. Return ONLY {"comprehension": {...}}.',
);

const PLAN = part('Plan: parse the Obfuscations into the dimensions of what to withhold.');
const TRY = part('Try: map the Obfuscations onto concrete inventory paths and concepts.');
const REFINE = part('Refine: ensure nothing the depositor wants withheld is left exposed.');
const RETRY = part('Retry: return conservative obfuscation guidance when evidence is thin.');

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

export const DepositInputComprehensionAgent = factoryAgentWithPTRR<
  z.infer<typeof InputComprehensionInputSchema>,
  z.infer<typeof InputComprehensionOutputSchema>
>({
  name: 'DepositInputComprehensionAgent',
  description: 'Comprehends the depositor Obfuscations into structured obfuscation guidance.',
  outputSchema: InputComprehensionOutputSchema,
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

export default async function runDepositInputComprehensionAgent(input: any, execution: any) {
  const obfuscations = input?.obfuscations ?? findValue(execution, 'deposit', 'obfuscations') ?? null;
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');

  // Prompt path: paths + samples only. Full inventory.sources stays on the
  // shared execution store for measurement; never enter PTRR user prompts
  // (JSON.stringify of monorepo sources → Invalid string length).
  const inventoryForPrompt = projectInventoryForPrompt(inventory);
  const raw = await DepositInputComprehensionAgent(
    {
      ...input,
      obfuscations,
      repository,
      inventory: inventoryForPrompt,
      inventoryPaths: inventoryForPrompt?.paths ?? inventory?.paths,
    },
    execution,
  );
  // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const comprehension: DepositObfuscationComprehension = (result as any)?.comprehension ?? {
    summary:
      'No explicit obfuscations declared; synthesis honors the protected-IP exclusions as authoritative.',
    obfuscatedPaths: [],
    obfuscatedConcepts: [],
    honorNotes: [],
  };

  // Cross-phase artifacts: the Implementation synthesis agent and the deposit
  // Validation agent read this obfuscation guidance from OTHER phase siblings,
  // so it must live on the SHARED execution (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'setup', 'obfuscationComprehension', comprehension);

  return { ...(input || {}), success: true, comprehension };
}
