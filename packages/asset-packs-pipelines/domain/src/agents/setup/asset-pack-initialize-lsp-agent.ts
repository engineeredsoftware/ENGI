/**
 * AssetPack Pipeline - Initialize LSP Agent (Setup Phase)
 * 
 * Initializes language server protocol for code intelligence.
 * Critical for discovery, validation, and implementation phases.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
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
const initializeLSPAgent = factoryAgentWithPTRR<
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
export default async function initializeLSP(input: any, execution: any) {
  // Get repo path from clone result
  const repoPath = execution.get('setup/vcs', 'localPath') || input.repoPath;
  
  // Execute the agent
  const result = await initializeLSPAgent({ ...input, repoPath }, execution);
  
  // Store LSP state for other phases
  execution.store('setup/lsp', 'initialized', result.initialized);
  execution.store('setup/lsp', 'serverInfo', result.serverInfo);
  execution.store('setup/lsp', 'workspaceInfo', result.workspaceInfo);
  
  // Register LSP tool for other phases if initialized
  if (result.initialized) {
    execution.tools.registerTool('lsp-query', {
      execute: async (query: any) => {
        // LSP query implementation
        return { results: [] };
      }
    });
  }
  
  return result;
}
