/**
 * Deposit codebase-comprehension agent — Discovery (parallel with search + regurgitation).
 *
 * Rich codebase analysis of **this run’s Host checkout**:
 * - absolute measurements of source material (measure/static-analysis tools)
 * - LSP queries when Setup initialized LSP
 * - full file-tree structure (dirs/names) from sourceCheckoutCatalog
 * - key file reads via Host-bound loader
 * → stores a source-safe knowledge map + measurements for Implementation.
 *
 * Not a “lens” — a distinct procedure/agent. Source-safe: never quote secrets.
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
    'Comprehends Host checkout: measure absolutes, LSP, file-tree structure, key files → source-safe codebase analysis.',
  outputSchema: CodebaseComprehensionOutputSchema,
  // LSP tools when registered on the Host; measure/static-analysis via run wrapper.
  tools: ['lsp-query'],
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
  // Setup already cloned this run's complete tree. Load file bodies for analysis.
  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    input?.sourceCheckoutCatalog ??
      input?.inventory ??
      findValue(execution, 'deposit', 'sourceCheckoutCatalog') ??
      findValue(execution, 'deposit', 'inventory'),
  );
  // Dual-write: sourceCheckoutCatalog is the canonical name; inventory is legacy alias.
  if (sourceCheckoutCatalog) {
    storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', sourceCheckoutCatalog);
    storeCrossPhaseArtifact(execution, 'deposit', 'inventory', sourceCheckoutCatalog);
  }

  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(sourceCheckoutCatalog);

  // Absolute measurements of the checkout material (required AssetPack element later).
  let sourceMeasurements: unknown[] = [];
  try {
    const { measureAssetPackAbsolutes } = await import('../validation/agent-measure-absolutes');
    const bodies = Array.isArray(sourceCheckoutCatalog?.sources)
      ? sourceCheckoutCatalog!.sources
      : [];
    if (bodies.length > 0) {
      const paths = bodies.slice(0, 40).map((f: { path: string }) => f.path);
      sourceMeasurements = await measureAssetPackAbsolutes(
        {
          title: 'Host checkout source measurement',
          summary:
            'Discovery absolute measurements of the depositor Host checkout for this synthesize-deposit run.',
          coveredSourcePaths: paths,
          fileChanges: paths.map((path: string) => ({ path, op: 'modify' })),
          patchSummary: 'Host checkout source measurement for Discovery codebase comprehension.',
        },
        {
          lens: 'deposit',
          execution,
          sources: bodies as { path: string; content: string }[],
        },
      );
      storeCrossPhaseArtifact(execution, 'discovery', 'sourceMeasurements', sourceMeasurements);
    }
  } catch {
    // Measurement best-effort; Implementation/Validation still require pack-level absolutes.
  }

  const lspInitialized = Boolean(findValue(execution, 'setup/lsp', 'initialized'));
  const treePaths = catalogForPrompt?.paths ?? sourceCheckoutCatalog?.paths ?? [];

  const raw = await DepositCodebaseComprehensionAgent(
    {
      ...input,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventory: catalogForPrompt,
      inventoryPaths: treePaths,
      excerpts: catalogForPrompt?.samples ?? sourceCheckoutCatalog?.samples,
      sourceMeasurements,
      lspInitialized,
      fileTreePathCount: Array.isArray(treePaths) ? treePaths.length : 0,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const comprehension: DepositCodebaseComprehension = (result as any)?.comprehension ?? {
    summary:
      'No codebase knowledge map derived; the depositor sourceCheckoutCatalog yielded no source-safe comprehension.',
    capabilities: [],
    knowledgeAreas: [],
    notableModules: [],
  };

  storeCrossPhaseArtifact(execution, 'discovery', 'codebaseComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'discovery', 'codebaseAnalysis', {
    comprehension,
    sourceMeasurements,
    fileTreePathCount: Array.isArray(treePaths) ? treePaths.length : 0,
    lspInitialized,
  });

  return { ...(input || {}), success: true, comprehension, sourceMeasurements };
}
