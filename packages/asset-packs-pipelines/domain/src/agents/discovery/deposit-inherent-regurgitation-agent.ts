/**
 * Deposit inherent-regurgitation agent — Discovery (parallel).
 *
 * From model training knowledge (not repository quotes): patterns, practices,
 * and domain knowledge useful for synthesizing AssetPacks from this checkout.
 * Complements codebase comprehension and depository search — three distinct
 * agents/procedures, not “lenses”.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { resolveSourceCheckoutCatalog } from '../../resolve-source-checkout-catalog';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';

const part = (content: string): PromptPart => content as PromptPart;

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
  'You are the SynthesizeAssetPacks Discovery agent that contributes model-inherent ' +
    'knowledge for deposit AssetPack synthesis. From your training data, return patterns, ' +
    'best practices, and domain knowledge useful for this repository (grounded by ' +
    'sourceCheckoutCatalog path context for relevance only). Source-safe: never quote ' +
    'the repository’s raw source or secrets.',
);

const REQUIREMENTS = part(
  'Given repository coordinates and sourceCheckoutCatalog path context, derive from ' +
    'training knowledge: summary, relevantKnowledge, patterns, and references. Keep it ' +
    'general and source-safe. Return ONLY {"regurgitation": {...}}.',
);

const PLAN = part(
  'Plan: identify which of your trained knowledge is relevant to this repository domain.',
);
const TRY = part(
  'Try: regurgitate relevant knowledge, well-known patterns, best practices, and references.',
);
const REFINE = part(
  'Refine: ensure the knowledge is relevant, generally-known, and source-safe.',
);
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
  any,
  z.infer<typeof InherentRegurgitationOutputSchema>
>({
  name: 'DepositInherentRegurgitationAgent',
  description:
    'Regurgitates model-inherent knowledge, patterns, and best practices for deposit AssetPack synthesis.',
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
  const catalog = resolveSourceCheckoutCatalog(
    execution,
    input?.sourceCheckoutCatalog ?? input?.inventory,
  );
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  const raw = await DepositInherentRegurgitationAgent(
    {
      ...input,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const regurgitation: DepositInherentRegurgitation = (result as any)?.regurgitation ?? {
    summary:
      'No inherent knowledge regurgitated; proceed with codebase comprehension and depository search alone.',
    relevantKnowledge: [],
    patterns: [],
    references: [],
  };

  storeCrossPhaseArtifact(execution, 'discovery', 'inherentRegurgitation', regurgitation);
  return { ...(input || {}), success: true, regurgitation };
}
