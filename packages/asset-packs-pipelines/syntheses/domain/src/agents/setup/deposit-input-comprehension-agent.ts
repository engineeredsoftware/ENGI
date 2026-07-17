/**
 * Deposit input-comprehension agent — Setup phase (V48 Gate 3).
 *
 * Comprehends the depositor's OBFUSCATIONS — free-text declaration of what to
 * obfuscate/withhold — against the Host sourceCheckoutCatalog, producing
 * structured obfuscation guidance that downstream phases honor (alongside
 * Impermissible sources) so synthesized AssetPacks never expose obfuscated material.
 *
 * Setup sequencing: clone alone → parallel {LSP, MCP, this agent} → danger-wall.
 * Runs on formal PTRR machinery. Empty Obfuscations skip the LLM (guidance is
 * empty; Impermissible sources remain authoritative).
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const part = (content: string): PromptPart => content as PromptPart;

const InputComprehensionInputSchema = z.object({
  obfuscations: z.string().nullable().optional(),
  repository: z.any().optional(),
  sourceCheckoutCatalog: z.any().optional(),
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
  'You are the SynthesizeAssetPacks Setup agent that comprehends depositor OBFUSCATIONS. ' +
    "Map the free-text declaration of what to obfuscate or withhold against the Host " +
    'sourceCheckoutCatalog (paths and samples only). Produce structured obfuscation ' +
    'guidance: source paths and concepts to withhold, and how synthesis must honor them. ' +
    'Never expose obfuscated material; describe knowledge, never raw source.',
);

const REQUIREMENTS = part(
  'From the Obfuscations text and the sourceCheckoutCatalog, derive: obfuscatedPaths ' +
    '(paths the depositor wants withheld, chosen ONLY from the provided ' +
    'sourceCheckoutCatalog paths), obfuscatedConcepts (knowledge/topics to obfuscate), ' +
    'and honorNotes (how synthesis must honor them). Be conservative — when in doubt, ' +
    'obfuscate. If no obfuscations are declared, return empty guidance with a summary ' +
    'noting Impermissible sources remain authoritative. Return ONLY {"comprehension": {...}}.',
);

const PLAN = part('Plan: parse the Obfuscations into the dimensions of what to withhold.');
const TRY = part(
  'Try: map the Obfuscations onto concrete sourceCheckoutCatalog paths and concepts.',
);
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

export const DepositInputComprehensionAgent = factoryPTRRAgent<
  z.infer<typeof InputComprehensionInputSchema>,
  z.infer<typeof InputComprehensionOutputSchema>
>({
  name: 'DepositInputComprehensionAgent',
  description:
    'Comprehends depositor Obfuscations against sourceCheckoutCatalog into structured guidance.',
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

const EMPTY_OBFUSCATION_COMPREHENSION: DepositObfuscationComprehension = {
  summary:
    'No explicit obfuscations declared; synthesis honors Impermissible sources as authoritative.',
  obfuscatedPaths: [],
  obfuscatedConcepts: [],
  honorNotes: [],
};

function hasDeclaredObfuscations(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export default async function runDepositInputComprehensionAgent(input: any, execution: any) {
  const obfuscations = input?.obfuscations ?? findValue(execution, 'deposit', 'obfuscations') ?? null;
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const catalog =
    input?.sourceCheckoutCatalog ??
    findValue(execution, 'deposit', 'sourceCheckoutCatalog');

  // Empty Obfuscations: no LLM work. Full monorepo catalog + PTRR plan/try
  // against blank text was burning minutes and timing out (90s per call) with
  // nothing to map. Impermissible sources remain authoritative downstream.
  if (!hasDeclaredObfuscations(obfuscations)) {
    storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', EMPTY_OBFUSCATION_COMPREHENSION);
    storeCrossPhaseArtifact(
      execution,
      'setup',
      'obfuscationComprehension',
      EMPTY_OBFUSCATION_COMPREHENSION,
    );
    return {
      ...(input || {}),
      success: true,
      comprehension: EMPTY_OBFUSCATION_COMPREHENSION,
      comprehensionMode: 'empty-obfuscations-skip-llm',
    };
  }

  // Prompt path: paths + samples only. Full checkout file bodies stay on the
  // shared execution store for measurement; never enter PTRR user prompts
  // (JSON.stringify of monorepo sources → Invalid string length).
  const catalogForPrompt = projectInventoryForPrompt(catalog);
  const raw = await DepositInputComprehensionAgent(
    {
      ...input,
      obfuscations,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
    },
    execution,
  );
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const comprehension: DepositObfuscationComprehension =
    (result as any)?.comprehension ?? EMPTY_OBFUSCATION_COMPREHENSION;

  // Cross-phase artifacts: Implementation and Validation read this guidance
  // from other phase siblings — shared execution (cross-phase store-visibility).
  storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'setup', 'obfuscationComprehension', comprehension);

  return { ...(input || {}), success: true, comprehension };
}
