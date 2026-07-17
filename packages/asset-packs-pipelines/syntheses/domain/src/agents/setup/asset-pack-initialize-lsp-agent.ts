/**
 * AssetPack Pipeline - Initialize LSP Agent (Setup Phase)
 * 
 * Initializes language server protocol for code intelligence.
 * Critical for discovery, validation, and implementation phases.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { createAssetPackSetupPhaseInitializeLSPAgentPrompt, AssetPackSetupPhaseInitializeLSPAgentPromptSteps } from '../prompts/initialize-lsp-prompt';
import { getAssetPackPipelineToolsForAgent } from '../../tools';
import { z } from 'zod';

/**
 * Input schema for LSP initialization
 */
const InitializeLSPInputSchema = z.object({
  repoPath: z.string(),
  language: z.string().optional(),
  configPath: z.string().optional(),
  capabilities: z.array(z.string()).optional()
});

/**
 * Output schema for LSP initialization
 */
const InitializeLSPOutputSchema = z.object({
  initialized: z.boolean(),
  serverInfo: z.object({
    name: z.string(),
    version: z.string(),
    capabilities: z.array(z.string())
  }),
  
  workspaceInfo: z.object({
    rootUri: z.string(),
    workspaceFolders: z.array(z.string()),
    configuredLanguages: z.array(z.string())
  }),
  
  // Tool usage for LSP operations
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

/**
 * Initialize LSP Agent
 */
const initializeLSPAgent = factoryPTRRAgent<
  z.infer<typeof InitializeLSPInputSchema>,
  z.infer<typeof InitializeLSPOutputSchema>
>({
  prompt: createAssetPackSetupPhaseInitializeLSPAgentPrompt(),
  tools: getAssetPackPipelineToolsForAgent('initialize-lsp'),
  stepPrompts: AssetPackSetupPhaseInitializeLSPAgentPromptSteps,

  name: 'asset-pack-initialize-lsp-agent',
  description: 'Initialize language server for code intelligence',
  
  outputSchema: InitializeLSPOutputSchema,
  
  plan: { chunkThreshold: 500 },
  try: { chunkThreshold: 1000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 3 } // Retry more for critical infrastructure
});

/**
 * Export wrapper that stores LSP state
 */
function findWorkspacePath(execution: any, input: any): string {
  return (
    execution?.get?.('repository', 'workspacePath') ||
    execution?.findUp?.('repository', 'workspacePath') ||
    execution?.get?.('setup/vcs', 'localPath') ||
    execution?.findUp?.('setup/vcs', 'localPath') ||
    input?.repoPath ||
    input?.workspacePath ||
    ''
  );
}

export default async function initializeLSP(input: any, execution: any) {
  // This-run Host checkout from Setup clone (never residual cwd).
  const repoPath = findWorkspacePath(execution, input);

  let result: any;
  try {
    result = await initializeLSPAgent({ ...input, repoPath }, execution);
  } catch {
    // Best-effort LSP: record unavailability without failing Setup (tools may no-op).
    result = {
      initialized: false,
      serverInfo: { name: 'unavailable', version: '0', capabilities: [] },
      workspaceInfo: {
        rootUri: repoPath ? `file://${repoPath}` : '',
        workspaceFolders: repoPath ? [repoPath] : [],
        configuredLanguages: [],
      },
    };
  }

  try {
    execution.store('setup/lsp', 'initialized', result.initialized);
    execution.store('setup/lsp', 'serverInfo', result.serverInfo);
    execution.store('setup/lsp', 'workspaceInfo', result.workspaceInfo);
    execution.store('setup/lsp', 'workspacePath', repoPath);
  } catch {}
  
  // Always register lsp-query for Discovery codebase comprehension (best-effort).
  try {
    const workspacePath = repoPath;
    execution?.tools?.registerTool?.('lsp-query', {
      name: 'lsp-query',
      execute: async (query: any) => {
        // Prefer real LSP engines when generic-tools-lsp-query is available.
        try {
          const m = require('@bitcode/generic-tools-lsp-query');
          if (query?.op === 'workspaceSymbols' && m.workspaceSymbolsTool) {
            return m.workspaceSymbolsTool.use?.({ ...query, workspacePath }) ?? { results: [] };
          }
          if (query?.op === 'documentSymbols' && m.documentSymbolsTool) {
            return m.documentSymbolsTool.use?.({ ...query, workspacePath }) ?? { results: [] };
          }
          if (query?.op === 'definition' && m.definitionTool) {
            return m.definitionTool.use?.({ ...query, workspacePath }) ?? { results: [] };
          }
        } catch {
          /* LSP package optional */
        }
        return {
          results: [],
          workspacePath,
          initialized: Boolean(result.initialized),
          note: result.initialized
            ? 'LSP query surface registered; engine may be stubbed.'
            : 'LSP not fully initialized; query returns empty results.',
        };
      },
    });
  } catch {}

  return result;
}
