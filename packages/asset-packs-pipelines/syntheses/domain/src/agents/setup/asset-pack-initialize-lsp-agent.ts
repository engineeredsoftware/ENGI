/**
 * AssetPack Setup — Initialize LSP for subsequent phases.
 *
 * Setup must prime language-intelligence tools so Discovery (codebase
 * comprehension) and Validation can use LSP extensively. Flow:
 * 1) Host-side: start workspace LSP session + register real query Tools
 * 2) PTRR: model validates readiness with workspace/document symbol tools
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import {
  createAssetPackSetupPhaseInitializeLSPAgentPrompt,
  AssetPackSetupPhaseInitializeLSPAgentPromptSteps,
} from '../prompts/initialize-lsp-prompt';
import {
  SETUP_LSP_INITIALIZE_TOOLS,
  setupLspForWorkspace,
  type LspSetupReadiness,
} from '../../tools/lsp-setup-tools';
import { z } from 'zod';

const InitializeLSPInputSchema = z.object({
  repoPath: z.string().optional(),
  workspacePath: z.string().optional(),
  language: z.string().optional(),
  configPath: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

const InitializeLSPOutputSchema = z.object({
  initialized: z.boolean(),
  serverInfo: z.object({
    name: z.string(),
    version: z.string(),
    capabilities: z.array(z.string()),
  }),
  workspaceInfo: z.object({
    rootUri: z.string(),
    workspaceFolders: z.array(z.string()),
    configuredLanguages: z.array(z.string()),
  }),
  registeredToolNames: z.array(z.string()).optional(),
  useTools: z
    .array(
      z.object({
        name: z.string(),
        input: z.any(),
        reason: z.string(),
      }),
    )
    .optional(),
});

const initializeLSPAgent = factoryPTRRAgent<
  z.infer<typeof InitializeLSPInputSchema>,
  z.infer<typeof InitializeLSPOutputSchema>
>({
  prompt: createAssetPackSetupPhaseInitializeLSPAgentPrompt(),
  // Real LSP query tools for Try/Retry validation of the primed session.
  tools: SETUP_LSP_INITIALIZE_TOOLS,
  stepPrompts: AssetPackSetupPhaseInitializeLSPAgentPromptSteps,
  name: 'asset-pack-initialize-lsp-agent',
  description:
    'Prime Host multi-language LSP for this checkout and register query tools for Discovery/Validation',
  outputSchema: InitializeLSPOutputSchema,
  plan: { chunkThreshold: 500 },
  try: { chunkThreshold: 1000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 2 },
});

function findWorkspacePath(execution: any, input: any): string {
  return (
    execution?.get?.('repository', 'workspacePath') ||
    execution?.findUp?.('repository', 'workspacePath') ||
    execution?.get?.('setup/vcs', 'localPath') ||
    execution?.findUp?.('setup/vcs', 'localPath') ||
    execution?.get?.('setup/lsp', 'workspacePath') ||
    input?.repoPath ||
    input?.workspacePath ||
    ''
  );
}

function readinessToAgentOutput(readiness: LspSetupReadiness) {
  return {
    initialized: readiness.initialized,
    serverInfo: readiness.serverInfo,
    workspaceInfo: readiness.workspaceInfo,
    registeredToolNames: readiness.registeredToolNames,
  };
}

/**
 * Setup entry: prime LSP for the Host checkout, then run PTRR so the model can
 * validate with real tools. Tools remain on the pipeline registry for Discovery.
 */
export default async function initializeLSP(input: any, execution: any) {
  const repoPath = findWorkspacePath(execution, input);

  // 1) Host-side setup — subsequent phases depend on this, not on LLM invention.
  const readiness = await setupLspForWorkspace(execution, repoPath);

  // 2) PTRR validates with real LSP tools — but only when a live session was
  // primed. On large monorepos Setup defers tsserver to avoid sandbox OOM
  // (exit 137 / navto during workspaceSymbols refine). Tools remain registered.
  let result: z.infer<typeof InitializeLSPOutputSchema> = readinessToAgentOutput(readiness);
  const skipPtrr =
    readiness.deferredSession === true ||
    readiness.sessionStarted === false ||
    ['1', 'true', 'yes', 'on'].includes(
      String(process.env.BITCODE_LSP_SKIP_PTRR || '')
        .trim()
        .toLowerCase(),
    );

  if (!skipPtrr) {
    try {
      const raw = await initializeLSPAgent(
        {
          ...input,
          repoPath,
          workspacePath: repoPath,
          language: readiness.language,
        },
        execution,
      );
      const out = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
      if (out && typeof out === 'object') {
        // Prefer host readiness for initialized/tools; allow model to enrich notes.
        result = {
          ...result,
          ...out,
          initialized: readiness.initialized || Boolean(out.initialized),
          registeredToolNames:
            readiness.registeredToolNames.length > 0
              ? readiness.registeredToolNames
              : out.registeredToolNames,
          serverInfo: readiness.initialized
            ? readiness.serverInfo
            : out.serverInfo || result.serverInfo,
          workspaceInfo: readiness.workspaceInfo.rootUri
            ? readiness.workspaceInfo
            : out.workspaceInfo || result.workspaceInfo,
        };
      }
    } catch {
      // PTRR failure must not wipe host-side tool registration.
      result = readinessToAgentOutput(readiness);
    }
  } else {
    try {
      execution?.store?.('setup/lsp', 'ptrrSkipped', true);
      execution?.store?.(
        'setup/lsp',
        'ptrrSkipReason',
        readiness.deferredSession
          ? 'deferred-large-workspace'
          : readiness.sessionStarted === false
            ? 'no-session'
            : 'BITCODE_LSP_SKIP_PTRR',
      );
    } catch {
      /* ignore */
    }
  }

  try {
    execution.store('setup/lsp', 'initialized', result.initialized);
    execution.store('setup/lsp', 'serverInfo', result.serverInfo);
    execution.store('setup/lsp', 'workspaceInfo', result.workspaceInfo);
    execution.store('setup/lsp', 'workspacePath', repoPath);
    execution.store('setup/lsp', 'agentOutput', result);
  } catch {
    /* ignore */
  }

  return result;
}
