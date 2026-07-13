/**
 * Select Files Parallel Agent - Discovery Phase
 * 
 * Parallel file selection combining filtering and picking.
 * Identifies relevant files for the expressed read and its written-asset shape.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { createAssetPackDiscoveryPhaseSelectFilesParallelAgentPrompt, AssetPackDiscoveryPhaseSelectFilesParallelAgentPromptSteps } from '../prompts/select-files-parallel-prompt';
import { getAssetPackPipelineToolsForAgent } from '../../tools';
import { z } from 'zod';
import {
  resolveExpressedReadFromExecution,
  resolveWrittenAssetTypeFromExecution,
} from '../../semantic-resolution';

/**
 * Input schema for file selection
 */
const SelectFilesInputSchema = z.object({
  taskEntities: z.object({
    files: z.array(z.string()),
    functions: z.array(z.string()),
    concepts: z.array(z.string())
  }),
  read: z.string().optional(),
  codebaseStructure: z.object({
    directories: z.array(z.object({
      path: z.string(),
      purpose: z.string(),
      importance: z.string()
    })),
    relevantFiles: z.array(z.object({
      path: z.string(),
      relevance: z.number()
    }))
  }),
  writtenAssetType: z.string().optional(),
  attachmentRequirements: z.array(z.any()).optional()
});

/**
 * Output schema for file selection
 */
const SelectFilesOutputSchema = z.object({
  selectedFiles: z.array(z.object({
    path: z.string(),
    relevance: z.number(),
    reason: z.string(),
    category: z.enum(['core', 'related', 'test', 'config', 'documentation']),
    requiresChange: z.boolean(),
    changeType: z.enum(['create', 'modify', 'delete', 'read-only']).optional()
  })),

  fileGroups: z.object({
    coreFiles: z.array(z.string()),
    relatedFiles: z.array(z.string()),
    testFiles: z.array(z.string()),
    configFiles: z.array(z.string()),
    docFiles: z.array(z.string())
  }),

  selectionStrategy: z.object({
    totalFiles: z.number(),
    filteredOut: z.number(),
    selectionCriteria: z.array(z.string()),
    confidence: z.number()
  }),

  // Parallel execution of filters and pickers
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
});

/**
 * Select Files Parallel Agent
 */
const selectFilesAgent = factoryAgentWithPTRR<
  z.infer<typeof SelectFilesInputSchema>,
  z.infer<typeof SelectFilesOutputSchema>
>({
  prompt: createAssetPackDiscoveryPhaseSelectFilesParallelAgentPrompt(),
  tools: getAssetPackPipelineToolsForAgent('asset-pack-select-files-parallel-agent'),
  stepPrompts: AssetPackDiscoveryPhaseSelectFilesParallelAgentPromptSteps,

  name: 'asset-pack-select-files-parallel-agent',
  description: 'Select relevant files using parallel filtering and picking',

  outputSchema: SelectFilesOutputSchema,

  plan: { chunkThreshold: 1500 },
  try: {
    chunkThreshold: 3000,
    enableParallelChunks: true // Parallel file analysis
  },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 }
});

/**
 * Export wrapper that stores file selection
 */
export default async function selectFilesParallel(input: any, execution: any) {
  // Prepare input from prior phases
  const selectionInput = {
    readEntities: execution.get('setup/read', 'entities'),
    read: resolveExpressedReadFromExecution(execution),
    codebaseStructure: {
      directories: execution.get('setup/codebase', 'structure.directories'),
      relevantFiles: execution.get('setup/codebase', 'relevantFiles')
    },
    writtenAssetType: resolveWrittenAssetTypeFromExecution(execution),
    attachmentRequirements: execution.get('discovery/attachments', 'designRequirements')
  };

  // Execute the agent
  const result = await selectFilesAgent(selectionInput, execution);

  // Store file selection
  execution.store('discovery/files', 'selected', result.selectedFiles);
  execution.store('discovery/files', 'groups', result.fileGroups);
  execution.store('discovery/files', 'strategy', result.selectionStrategy);

  // Store files that read changes for implementation phase
  const filesToChange = result.selectedFiles.filter(f => f.requiresChange);
  execution.store('discovery/files', 'toChange', filesToChange);

  return result;
}
