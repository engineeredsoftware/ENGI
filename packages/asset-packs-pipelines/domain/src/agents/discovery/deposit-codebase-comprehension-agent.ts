/**
 * Deposit codebase-comprehension agent — Discovery (parallel with search + regurgitation).
 *
 * Precise contract for this run’s Host checkout analysis:
 * 1. Absolute measurements (static-analysis / measure-agent) of checkout material
 * 2. LSP queries when Setup registered `lsp-query` on the Host
 * 3. Full file-tree structure (dirs + file names) from sourceCheckoutCatalog.paths
 * 4. Key file full reads (bounded set) via Host-loaded file bodies
 * 5. PTRR synthesis of a source-safe knowledge map grounded in (1)–(4)
 *
 * Stores `discovery:codebaseAnalysis` (rich) and `discovery:codebaseComprehension` (map).
 * Source-safe: never quote secrets; prompts may use key-file excerpts under policy.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { resolveSourceCheckoutCatalog } from '../../resolve-source-checkout-catalog';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';
import {
  buildFileTreeStructure,
  pickKeySourceFiles,
  type FileTreeStructure,
  type KeySourceFileRead,
} from './codebase-analysis-helpers';

const part = (content: string): PromptPart => content as PromptPart;

const CodebaseKnowledgeMapSchema = z.object({
  summary: z.string(),
  capabilities: z.array(z.string()).optional(),
  knowledgeAreas: z.array(z.string()).optional(),
  notableModules: z.array(z.string()).optional(),
  /** Source-safe notes derived from measurements / tree / LSP (no raw secrets). */
  measurementInsights: z.array(z.string()).optional(),
  structureInsights: z.array(z.string()).optional(),
});

const CodebaseComprehensionOutputSchema = z.object({
  comprehension: CodebaseKnowledgeMapSchema,
});

export type DepositCodebaseComprehension = z.infer<typeof CodebaseKnowledgeMapSchema>;

export type DepositCodebaseAnalysis = {
  schema: 'bitcode.deposit.discovery.codebase-analysis';
  repository: { fullName?: string | null; branch?: string | null; commit?: string | null };
  workspacePath: string | null;
  sourceCheckoutCatalog: {
    pathCount: number;
    sampleCount: number;
    fileBodyCount: number;
    paths: string[];
  };
  fileTree: FileTreeStructure;
  keyFileReads: KeySourceFileRead[];
  sourceMeasurements: unknown[];
  lsp: {
    initialized: boolean;
    queries: Array<{ op: string; ok: boolean; resultSummary: string }>;
  };
  comprehension: DepositCodebaseComprehension;
};

const IDENTITY = part(
  'You are the SynthesizeAssetPacks Discovery agent that comprehends the depositor ' +
    'Host checkout (sourceCheckoutCatalog). You MUST ground analysis in: absolute ' +
    'measurements of the source material, LSP query results when available, the full ' +
    'file-tree structure (directories and file names), and key file contents provided ' +
    'to you. Produce a source-safe knowledge map for AssetPack synthesis. Describe ' +
    'knowledge and capability — never quote secrets, credentials, or private keys.',
);

const REQUIREMENTS = part(
  [
    'You receive: repository coordinates, sourceCheckoutCatalog paths, fileTree structure,',
    'keyFileReads (selected full/excerpt file bodies), sourceMeasurements (absolute property',
    'volumes/magnitudes), and lspQueryResults.',
    'Derive comprehension:',
    '- summary: source-safe overview of what the codebase knows and can do',
    '- capabilities: distinct things the repository can do or enable',
    '- knowledgeAreas: domains/topics embodied',
    '- notableModules: significant paths from the provided path list only',
    '- measurementInsights: source-safe takeaways from absolute measurements',
    '- structureInsights: source-safe takeaways from the file-tree structure',
    'Stay at knowledge level. Do not invent paths. Return ONLY {"comprehension": {...}}.',
  ].join(' '),
);

const PLAN = part(
  'Plan: combine absolute measurements, LSP signals, file-tree structure, and key file ' +
    'reads from the sourceCheckoutCatalog to map capability, structure, and synthesis opportunities.',
);
const TRY = part(
  'Try: synthesize the codebase knowledge map — capabilities, knowledge areas, notable ' +
    'modules, measurementInsights, structureInsights — from measurements + LSP + tree + key files.',
);
const REFINE = part(
  'Refine: ensure the map is source-safe, grounded in provided sourceCheckoutCatalog evidence, and useful for pack synthesis.',
);
const RETRY = part(
  'Retry: return a minimal source-safe knowledge map grounded in path list and measurements rather than failing comprehension.',
);

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
  any,
  z.infer<typeof CodebaseComprehensionOutputSchema>
>({
  name: 'DepositCodebaseComprehensionAgent',
  description:
    'Rich Host-checkout analysis: absolute measurements, LSP, file-tree, key files → source-safe knowledge map.',
  outputSchema: CodebaseComprehensionOutputSchema,
  tools: ['lsp-query'],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2500 },
  try: { chunkThreshold: 6000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

async function runLspQueries(
  execution: any,
  workspacePath: string | null,
  samplePaths: string[],
): Promise<Array<{ op: string; ok: boolean; resultSummary: string }>> {
  const queries: Array<{ op: string; ok: boolean; resultSummary: string }> = [];
  const tool =
    execution?.tools?.getTool?.('lsp-query') ||
    (execution?.tools as any)?.tools?.get?.('lsp-query');
  if (!tool || typeof tool.execute !== 'function') {
    return [
      {
        op: 'availability',
        ok: false,
        resultSummary: 'lsp-query tool not registered on Host execution',
      },
    ];
  }
  const ops: Array<{ op: string; input: Record<string, unknown> }> = [
    { op: 'workspaceSymbols', input: { op: 'workspaceSymbols', query: '', workspacePath } },
    {
      op: 'documentSymbols',
      input: {
        op: 'documentSymbols',
        path: samplePaths[0] || '',
        workspacePath,
      },
    },
  ];
  for (const { op, input } of ops) {
    try {
      const result = await tool.execute(input);
      const resultSummary =
        result == null
          ? 'null'
          : typeof result === 'object'
            ? `keys=${Object.keys(result as object).join(',')}`
            : String(result).slice(0, 80);
      queries.push({ op, ok: true, resultSummary });
    } catch (err) {
      queries.push({
        op,
        ok: false,
        resultSummary: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return queries;
}

export default async function runDepositCodebaseComprehensionAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const workspacePath =
    findValue(execution, 'repository', 'workspacePath') ||
    findValue(execution, 'setup/lsp', 'workspacePath') ||
    null;

  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(
      execution,
      input?.sourceCheckoutCatalog ?? input?.inventory,
    ),
  );
  if (sourceCheckoutCatalog) {
    storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', sourceCheckoutCatalog);
    // Legacy dual-write for streaming/filter callers still keyed on inventory.
    storeCrossPhaseArtifact(execution, 'deposit', 'inventory', sourceCheckoutCatalog);
  }

  const paths = Array.isArray(sourceCheckoutCatalog?.paths) ? sourceCheckoutCatalog!.paths : [];
  const bodies = Array.isArray(sourceCheckoutCatalog?.sources)
    ? (sourceCheckoutCatalog!.sources as { path: string; content: string }[])
    : [];
  const samples = Array.isArray(sourceCheckoutCatalog?.samples)
    ? sourceCheckoutCatalog!.samples
    : [];

  // 1) File-tree structure (dirs + names)
  const fileTree = buildFileTreeStructure(paths);

  // 2) Key file full/bounded reads
  const keyFileReads = pickKeySourceFiles(bodies, samples, paths);

  // 3) Absolute measurements of the Host checkout (static analysis — full catalog).
  // Discovery must not burn host budget on measure-agent PTRR; Implementation
  // attaches per-option path-scoped absolutes for depositor selection.
  let sourceMeasurements: unknown[] = [];
  try {
    const {
      analyzeStaticSource,
      computeAbsolutesFromReport,
      computeDeterministicAbsolutes,
    } = await import('../validation/agent-measure-absolutes');
    const measurePaths =
      bodies.length > 0
        ? bodies.slice(0, 40).map((f) => f.path)
        : paths.slice(0, 40);
    const patchDescriptor = {
      title: 'Host checkout source measurement',
      summary:
        'Absolute measurements of the depositor Host checkout for codebase comprehension.',
      coveredSourcePaths: measurePaths,
      fileChanges: measurePaths.map((path) => ({ path, op: 'modify' as const })),
      patchSummary: 'Discovery codebase absolute measurements.',
    };
    if (measurePaths.length > 0) {
      const report = analyzeStaticSource({
        files: bodies.slice(0, 40),
        targetPaths: measurePaths,
      });
      const measured = computeAbsolutesFromReport(report, patchDescriptor);
      sourceMeasurements =
        Array.isArray(measured) && measured.length > 0
          ? measured
          : computeDeterministicAbsolutes(patchDescriptor);
    }
  } catch {
    sourceMeasurements = [];
  }
  storeCrossPhaseArtifact(execution, 'discovery', 'sourceMeasurements', sourceMeasurements);

  // 4) LSP queries (when available)
  const lspInitialized = Boolean(findValue(execution, 'setup/lsp', 'initialized'));
  const lspQueries = await runLspQueries(
    execution,
    workspacePath,
    keyFileReads.map((k) => k.path),
  );

  // 5) PTRR knowledge map grounded in gathered analysis
  const raw = await DepositCodebaseComprehensionAgent(
    {
      ...input,
      repository,
      sourceCheckoutCatalog: {
        paths,
        pathCount: paths.length,
        samples,
        sampleCount: samples.length,
        fileBodyCount: bodies.length,
      },
      fileTree,
      keyFileReads: keyFileReads.map((k) => ({
        path: k.path,
        // Bounded for prompt budget; full content already measured offline.
        content: k.content.slice(0, 6000),
        truncated: k.truncated,
      })),
      sourceMeasurements,
      lspInitialized,
      lspQueryResults: lspQueries,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const comprehension: DepositCodebaseComprehension = (result as any)?.comprehension ?? {
    summary:
      'No codebase knowledge map derived; sourceCheckoutCatalog analysis produced no source-safe comprehension.',
    capabilities: [],
    knowledgeAreas: [],
    notableModules: paths.slice(0, 8),
    measurementInsights: [],
    structureInsights: fileTree.topLevelDirs.slice(0, 8).map((d) => `top-level dir: ${d}`),
  };

  const analysis: DepositCodebaseAnalysis = {
    schema: 'bitcode.deposit.discovery.codebase-analysis',
    repository: {
      fullName: repository.fullName ?? null,
      branch: repository.branch ?? null,
      commit: repository.commit ?? null,
    },
    workspacePath,
    sourceCheckoutCatalog: {
      pathCount: paths.length,
      sampleCount: samples.length,
      fileBodyCount: bodies.length,
      paths,
    },
    fileTree,
    keyFileReads,
    sourceMeasurements,
    lsp: { initialized: lspInitialized, queries: lspQueries },
    comprehension,
  };

  storeCrossPhaseArtifact(execution, 'discovery', 'codebaseComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'discovery', 'codebaseAnalysis', analysis);

  return {
    ...(input || {}),
    success: true,
    comprehension,
    sourceMeasurements,
    codebaseAnalysis: analysis,
  };
}
