/**
 * Deposit codebase-comprehension agent — Discovery (parallel with search + regurgitation).
 *
 * Precise contract for this run’s Host checkout analysis:
 * 1. Absolute measurements (static-analysis / measure-agent) of checkout material
 * 2. LSP tools Setup primed (lsp-workspace-symbols, lsp-document-symbols, …)
 * 3. Full file-tree structure from sourceCheckoutCatalog.paths
 * 4. Host workspace tools: read-file, list-dir, allowlisted run-command
 * 5. PTRR: Plan (strategy, no tools) → Try (many tool calls) → Retry/Refine
 *
 * Try MUST select many tools via useTools, including the same tool multiple
 * times with different parameters (several file reads, several LSP queries,
 * list-dir, rg/find via run-command).
 *
 * Stores `discovery:codebaseAnalysis` and `discovery:codebaseComprehension`.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { resolveSourceCheckoutCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';
import {
  buildFileTreeStructure,
  pickKeySourceFiles,
  type FileTreeStructure,
  type KeySourceFileRead,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/agents/discovery/codebase-analysis-helpers';
import {
  DISCOVERY_CODEBASE_COMPREHENSION_TOOLS,
  getAssetPackPipelineToolsForAgent,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/index';
import { HOST_WORKSPACE_TOOL_NAMES } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/discovery-host-workspace-tools';
import { LSP_TOOL_NAMES } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/lsp-setup-tools';

const part = (content: string): PromptPart => content as PromptPart;

const UseToolSelectionSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string().optional(),
});

const CodebaseKnowledgeMapSchema = z.object({
  summary: z.string(),
  capabilities: z.array(z.string()).optional(),
  knowledgeAreas: z.array(z.string()).optional(),
  notableModules: z.array(z.string()).optional(),
  measurementInsights: z.array(z.string()).optional(),
  structureInsights: z.array(z.string()).optional(),
  /** Optional notes on which tools were used (names only). */
  toolsUsed: z.array(z.string()).optional(),
});

const CodebaseComprehensionOutputSchema = z
  .object({
    comprehension: CodebaseKnowledgeMapSchema,
    // Try/Retry: select many tools here (or on reason; hoist merges into postprocess).
    useTools: z.array(UseToolSelectionSchema).optional(),
  })
  .describe(
    '{ "comprehension": { "summary": string, "capabilities"?: string[], "knowledgeAreas"?: string[], "notableModules"?: string[], "measurementInsights"?: string[], "structureInsights"?: string[], "toolsUsed"?: string[] }, "useTools"?: [{ "name": string, "input": any, "reason"?: string }] }',
  );

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
    registeredToolNames: string[];
    usableToolNames: string[];
  };
  comprehension: DepositCodebaseComprehension;
};

const IDENTITY = part(
  'You are the SynthesizeAssetPacks Discovery agent that comprehends the depositor ' +
    'Host checkout (sourceCheckoutCatalog). You MUST ground analysis in absolute ' +
    'measurements, multi-call LSP queries, Host workspace tools (read-file, list-dir, ' +
    'allowlisted run-command), the file-tree, and REAL file contents provided in ' +
    'keyFileReads and checkoutSources. Produce a knowledge map for AssetPack synthesis. ' +
    'Provider input includes full source bodies (not redacted for product source-safety). ' +
    'Do not invent modules you did not observe. Avoid amplifying credentials/private keys ' +
    'in the knowledge-map summary when present in source.',
);

const REQUIREMENTS = part(
  [
    'Inputs may include: repository coordinates, sourceCheckoutCatalog (paths + sources with',
    'REAL file bodies), checkoutSources, fileTree, keyFileReads (full/large file contents),',
    'sourceMeasurements, workspacePath/workspaceRoot, and usable tool docs (LSP + host-workspace-*).',
    'Provider input includes real source content — use it. Product source-safety is for user',
    'API surfaces, not this synthesis step.',
    'Derive comprehension.summary / capabilities / knowledgeAreas / notableModules /',
    'measurementInsights / structureInsights from evidence — invent nothing.',
    'On Try/Retry task Thinkings: include useTools with MANY entries when tools can improve',
    'grounding. Prefer diversity: several host-workspace-read-file (different paths),',
    'host-workspace-list-dir (different dirs), host-workspace-run-command (rg/find/ls/git status),',
    'and multiple LSP ops (workspace-symbols, document-symbols, definition, references, hover)',
    'with different path/query/position parameters. Calling the same tool 3–8 times with',
    'different inputs is expected and correct. Plan omits useTools. Return JSON matching',
    'the active schema (comprehension + optional useTools on Try/Retry).',
  ].join(' '),
);

const PLAN = part(
  'Plan (no tools): design a multi-tool Host checkout exploration strategy — which files ' +
    'to read, which directories to list, which allowlisted shell inspections (rg/find/ls), ' +
    'and which LSP queries (symbols/definition/references/hover) with distinct parameters. ' +
    'Do not execute tools in Plan; omit useTools on Plan SO.',
);

const TRY = part(
  [
    'Try: EXECUTE multi-tool exploration then synthesize the knowledge map.',
    'emit useTools with a focused set of tool calls (typically 4–10 on large monorepos,',
    'up to ~12 on small repos). Prefer host-workspace tools over LSP when Setup deferred',
    'long-lived language servers (setup/lsp.deferredSession or residual notes).',
    `(1) ${HOST_WORKSPACE_TOOL_NAMES.readFile} a few times for different source paths under workspaceRoot;`,
    `(2) ${HOST_WORKSPACE_TOOL_NAMES.listDir} for root and key subdirs (not recursive dumps);`,
    `(3) ${HOST_WORKSPACE_TOOL_NAMES.runCommand} for bounded inspection (rg/find/ls/git status — never mutate);`,
    `(4) LSP tools (${LSP_TOOL_NAMES.documentSymbols}, ${LSP_TOOL_NAMES.definition},`,
    `${LSP_TOOL_NAMES.hover}) only when a live session is available — avoid workspace-wide`,
    `${LSP_TOOL_NAMES.workspaceSymbols} on monorepos (OOM risk).`,
    'Always pass workspaceRoot (or workspacePath alias) from selected context into host tools.',
    'After tools postprocess, produce comprehension grounded in tool results + keyFileReads +',
    'checkoutSources + seed measurements. Prefer catalog paths; avoid inventing paths.',
  ].join(' '),
);

const REFINE = part(
  'Refine (no tools): ensure the map is grounded in tool results, keyFileReads, checkoutSources, ' +
    'and sourceCheckoutCatalog evidence, and useful for pack synthesis. Omit useTools.',
);

const RETRY = part(
  'Retry: if prior Try missed tools or evidence, select additional useTools with new ' +
    'parameters (different files, queries, dirs) then return a minimal source-safe map. ' +
    'Prefer more tool diversity over inventing structure.',
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

const agentTools = getAssetPackPipelineToolsForAgent('DepositCodebaseComprehensionAgent');

export const DepositCodebaseComprehensionAgent = factoryPTRRAgent<
  any,
  z.infer<typeof CodebaseComprehensionOutputSchema>
>({
  name: 'DepositCodebaseComprehensionAgent',
  description:
    'Rich Host-checkout analysis via multi-tool Try (LSP + file read + list + shell) → source-safe knowledge map.',
  outputSchema: CodebaseComprehensionOutputSchema,
  tools: agentTools,
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2500 },
  try: { chunkThreshold: 8000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

/** Ensure every product tool is on the execution registry before PTRR Try. */
function ensureDiscoveryToolsRegistered(execution: any): string[] {
  const names: string[] = [];
  const tools =
    agentTools.length > 0 ? agentTools : DISCOVERY_CODEBASE_COMPREHENSION_TOOLS;
  for (const tool of tools) {
    const key = (tool as any)?.name || tool?.constructor?.name;
    if (!key) continue;
    try {
      execution?.tools?.registerTool?.(key, tool as any);
      names.push(key);
    } catch {
      /* ignore */
    }
  }
  return names;
}

export default async function runDepositCodebaseComprehensionAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const workspacePath =
    findValue(execution, 'repository', 'workspacePath') ||
    findValue(execution, 'setup/lsp', 'workspacePath') ||
    findValue(execution, 'setup', 'lsp')?.workspacePath ||
    null;

  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );
  if (sourceCheckoutCatalog) {
    storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', sourceCheckoutCatalog);
  }

  const paths = Array.isArray(sourceCheckoutCatalog?.paths) ? sourceCheckoutCatalog!.paths : [];
  const bodies = Array.isArray(sourceCheckoutCatalog?.sources)
    ? (sourceCheckoutCatalog!.sources as { path: string; content: string }[])
    : [];
  const samples = Array.isArray(sourceCheckoutCatalog?.samples)
    ? sourceCheckoutCatalog!.samples
    : [];

  const fileTree = buildFileTreeStructure(paths);
  // Prefer large real reads for discovery grounding (not path-only samples).
  const keyFileReads = pickKeySourceFiles(bodies, samples, paths, 80, 100_000);

  // Seed absolutes (offline) — Try tools deepen; do not replace multi-tool Try.
  let sourceMeasurements: unknown[] = [];
  try {
    const {
      analyzeStaticSource,
      computeAbsolutesFromReport,
      computeDeterministicAbsolutes,
    } = await import(
      '../../../../domain/src/agents/validation/agent-measure-absolutes'
    );
    const measurePaths =
      bodies.length > 0
        ? bodies.slice(0, 120).map((f) => f.path)
        : paths.slice(0, 120);
    const patchDescriptor = {
      title: 'Host checkout source measurement',
      summary:
        'Absolute measurements of the depositor Host checkout for codebase comprehension.',
      coveredSourcePaths: measurePaths,
      fileChanges: measurePaths.map((p) => ({ path: p, op: 'modify' as const })),
      patchSummary: 'Discovery codebase absolute measurements.',
    };
    if (measurePaths.length > 0) {
      const report = analyzeStaticSource({
        files: bodies.slice(0, 120),
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

  const registeredToolNames = ensureDiscoveryToolsRegistered(execution);
  const setupLsp = findValue(execution, 'setup', 'lsp') || findValue(execution, 'setup/lsp', 'initialized');
  const lspInitialized = Boolean(
    findValue(execution, 'setup/lsp', 'initialized') ??
      (typeof setupLsp === 'object' && setupLsp ? (setupLsp as any).initialized : false),
  );
  storeCrossPhaseArtifact(execution, 'discovery', 'usableToolNames', registeredToolNames);

  const { projectInventoryForSynthesisProvider } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis'
  );
  const synthesisCatalog = projectInventoryForSynthesisProvider(sourceCheckoutCatalog, {
    maxSourceFiles: 200,
    maxCharsPerFile: 100_000,
    maxTotalChars: 2_500_000,
  });

  const raw = await DepositCodebaseComprehensionAgent(
    {
      ...input,
      repository,
      workspacePath,
      workspaceRoot: workspacePath,
      // Full synthesis-provider catalog (real bodies) — not path-only projection.
      sourceCheckoutCatalog: synthesisCatalog || {
        paths,
        pathCount: paths.length,
        samples,
        sampleCount: samples.length,
        fileBodyCount: bodies.length,
        sources: bodies,
      },
      checkoutSources: synthesisCatalog?.sources ?? bodies,
      fileTree,
      // Full key-file bodies already bounded by pickKeySourceFiles (100k chars).
      keyFileReads: keyFileReads.map((k) => ({
        path: k.path,
        content: k.content,
        truncated: k.truncated,
        byteLength: k.byteLength,
      })),
      sourceMeasurements,
      lspInitialized,
      usableToolNames: registeredToolNames,
      toolHints: {
        hostWorkspace: Object.values(HOST_WORKSPACE_TOOL_NAMES),
        lsp: Object.values(LSP_TOOL_NAMES),
        multiCallLaw:
          'Call tools many times with different parameters on Try/Retry; Plan omits useTools.',
      },
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
    lsp: {
      initialized: lspInitialized,
      registeredToolNames,
      usableToolNames: registeredToolNames,
    },
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
