/**
 * Deposit codebase-comprehension agent — Discovery phase (V48 Gate 3).
 *
 * The first of the three deposit-mode Discovery lenses. It discovers from the
 * CODEBASE: it comprehends the cloned repository source (the inventory) into a
 * source-safe codebase knowledge map — the capabilities, patterns, and distinct
 * knowledge the repository offers for AssetPack synthesis. Downstream Discovery
 * lenses (depository-search demand framing, inherent regurgitation) and the
 * Implementation synthesis read this map. Runs on the formal PTRR machinery.
 *
 * Source-safety: describe knowledge and capability — never quote raw source,
 * secrets, or file contents.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const part = (content: string): PromptPart => content as PromptPart;

const CodebaseComprehensionInputSchema = z.object({
  repository: z.any().optional(),
  inventory: z.any().optional(),
});

const CodebaseKnowledgeMapSchema = z.object({
  summary: z.string(),
  capabilities: z.array(z.string()).optional(),
  knowledgeAreas: z.array(z.string()).optional(),
  notableModules: z.array(z.string()).optional(),
});

const CodebaseComprehensionOutputSchema = z.object({
  comprehension: CodebaseKnowledgeMapSchema,
});

export type DepositCodebaseComprehension = z.infer<typeof CodebaseKnowledgeMapSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering ' +
    'from the CODEBASE. Comprehend the cloned repository source — the inventory — ' +
    'into a codebase knowledge map: the capabilities, patterns, and distinct ' +
    'knowledge the repository offers for AssetPack synthesis. Be source-safe: ' +
    'describe knowledge and capability, never quote raw source, secrets, or file ' +
    'contents.',
);

const REQUIREMENTS = part(
  'From the repository coordinates and the inventory, derive: summary (a source-safe ' +
    'overview of what the codebase knows and can do), capabilities (distinct things the ' +
    'repository can do or enable), knowledgeAreas (domains/topics the codebase embodies), ' +
    'and notableModules (the most significant inventory paths/modules, chosen only from the ' +
    'provided inventory). Stay at the level of knowledge — never reproduce raw source. ' +
    'Return ONLY {"comprehension": {...}}.',
);

const PLAN = part('Plan: survey the inventory to map what knowledge and capability the codebase holds.');
const TRY = part('Try: synthesize the codebase knowledge map — capabilities, knowledge areas, notable modules.');
const REFINE = part('Refine: ensure the map is source-safe, distinct, and grounded in the provided inventory.');
const RETRY = part('Retry: return a minimal source-safe knowledge map rather than failing comprehension.');

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

export const DepositCodebaseComprehensionAgent = factoryPTRRAgent<
  z.infer<typeof CodebaseComprehensionInputSchema>,
  z.infer<typeof CodebaseComprehensionOutputSchema>
>({
  name: 'DepositCodebaseComprehensionAgent',
  description:
    'Comprehends the cloned repository inventory into a source-safe codebase knowledge map (deposit discovery: codebase lens).',
  outputSchema: CodebaseComprehensionOutputSchema,
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

export default async function runDepositCodebaseComprehensionAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const inventoryForPrompt = projectInventoryForPrompt(inventory);

  const raw = await DepositCodebaseComprehensionAgent(
    {
      ...input,
      repository,
      inventory: inventoryForPrompt,
      inventoryPaths: inventoryForPrompt?.paths ?? inventory?.paths,
      excerpts: inventoryForPrompt?.samples ?? inventory?.samples,
    },
    execution,
  );
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput }); unwrap (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const comprehension: DepositCodebaseComprehension = (result as any)?.comprehension ?? {
    summary:
      'No codebase knowledge map derived; the cloned repository inventory yielded no source-safe comprehension.',
    capabilities: [],
    knowledgeAreas: [],
    notableModules: [],
  };

  // Cross-phase artifact: the Implementation synthesis agent reads this from
  // another phase sibling (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'discovery', 'codebaseComprehension', comprehension);

  return { ...(input || {}), success: true, comprehension };
}
