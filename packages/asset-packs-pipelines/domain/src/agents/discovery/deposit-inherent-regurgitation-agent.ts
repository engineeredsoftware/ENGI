/**
 * Deposit inherent-regurgitation agent — Discovery phase (V48 Gate 3).
 *
 * The third of the three deposit-mode Discovery lenses. It discovers from the
 * MODEL itself: from its own training data, it returns any and all information
 * useful to synthesizing AssetPacks from this repository — relevant patterns,
 * best practices, well-known approaches, and domain knowledge. This complements
 * the codebase lens (what the repository holds) and the depository lens (what
 * readers want) with the model's inherent knowledge. Runs on the formal PTRR
 * machinery.
 *
 * Source-safety: regurgitate generally-known patterns and knowledge — never quote
 * the repository's raw source or secrets.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const part = (content: string): PromptPart => content as PromptPart;

const InherentRegurgitationInputSchema = z.object({
  repository: z.any().optional(),
  inventory: z.any().optional(),
});

const InherentKnowledgeSchema = z.object({
  summary: z.string(),
  relevantKnowledge: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
});

const InherentRegurgitationOutputSchema = z.object({
  regurgitation: InherentKnowledgeSchema,
});

export type DepositInherentRegurgitation = z.infer<typeof InherentKnowledgeSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering ' +
    'from the MODEL itself. From your own training data, return any and all ' +
    'information useful to synthesizing AssetPacks from this repository — relevant ' +
    'patterns, best practices, well-known approaches, and domain knowledge. Be ' +
    'source-safe: regurgitate generally-known knowledge and patterns, never quote ' +
    'the repository’s raw source or secrets.',
);

const REQUIREMENTS = part(
  'Given the repository coordinates and the inventory as context for relevance, derive ' +
    'from your training data: summary (what inherent knowledge bears on synthesizing ' +
    'AssetPacks here), relevantKnowledge (facts, domain knowledge, and approaches that ' +
    'help), patterns (well-known patterns and best practices applicable to this kind of ' +
    'repository), and references (named techniques, standards, or bodies of knowledge to ' +
    'draw on). Keep it general and source-safe — do not reproduce repository source. ' +
    'Return ONLY {"regurgitation": {...}}.',
);

const PLAN = part('Plan: identify which of your trained knowledge is relevant to this repository’s domain.');
const TRY = part('Try: regurgitate relevant knowledge, well-known patterns, best practices, and references.');
const REFINE = part('Refine: ensure the knowledge is relevant, generally-known, and source-safe.');
const RETRY = part('Retry: return minimal relevant knowledge rather than failing the regurgitation.');

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

export const DepositInherentRegurgitationAgent = factoryPTRRAgent<
  z.infer<typeof InherentRegurgitationInputSchema>,
  z.infer<typeof InherentRegurgitationOutputSchema>
>({
  name: 'DepositInherentRegurgitationAgent',
  description:
    'Regurgitates model-inherent knowledge, patterns, and best practices useful for AssetPack synthesis (deposit discovery: model lens).',
  outputSchema: InherentRegurgitationOutputSchema,
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

export default async function runDepositInherentRegurgitationAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');

  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const inventoryForPrompt = projectInventoryForPrompt(inventory);
  const raw = await DepositInherentRegurgitationAgent(
    {
      ...input,
      repository,
      inventory: inventoryForPrompt,
      inventoryPaths: inventoryForPrompt?.paths ?? inventory?.paths,
    },
    execution,
  );
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput }); unwrap (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const regurgitation: DepositInherentRegurgitation = (result as any)?.regurgitation ?? {
    summary:
      'No inherent knowledge regurgitated; proceed with the codebase and depository discovery lenses alone.',
    relevantKnowledge: [],
    patterns: [],
    references: [],
  };

  // Cross-phase artifact: the Implementation synthesis agent reads this from
  // another phase sibling (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'discovery', 'inherentRegurgitation', regurgitation);

  return { ...(input || {}), success: true, regurgitation };
}
