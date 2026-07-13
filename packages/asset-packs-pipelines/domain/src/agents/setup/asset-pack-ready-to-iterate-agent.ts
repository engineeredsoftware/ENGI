/**
 * AssetPack Ready to Iterate Agent (Setup Phase)
 * 
 * Determines if pipeline should continue after setup phase.
 * Can short-circuit with full refund if prerequisites not met.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { createAssetPackSetupPhaseReadyToIterateAgentPrompt, AssetPackSetupPhaseReadyToIterateAgentPromptSteps } from '../prompts/ready-to-iterate-prompt';
import { ShortCircuitSignal } from '@bitcode/execution-generics';
import { getAssetPackPipelineToolsForAgent } from '../../tools';
import { z } from 'zod';
import {
  resolveReadComprehensionFromExecution,
  resolveWrittenAssetTypeFromExecution,
} from '../../semantic-resolution';

/**
 * Input schema - aggregates all setup phase results
 */
const ReadyToIterateInputSchema = z.object({
  cloneResult: z.any(), // From clone-vcs-repository
  lspInitialized: z.boolean(), // From initialize-lsp
  dangerWallResult: z.any(),
  readComprehension: z.any().optional(), // Semantic mirror from comprehend-read
  writtenAssetType: z.union([z.string(), z.array(z.string())]).optional(), // Semantic mirror
  codebaseAnalysis: z.any() // From analyze-codebase
});

/**
 * Output schema with optional short-circuit signal
 */
const ReadyToIterateOutputSchema = z.object({
  ready: z.boolean(),
  confidence: z.number(),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),

  // Short-circuit signal if not ready
  signal: z.object({
    type: z.literal('SHORT_CIRCUIT').optional(),
    reason: z.string().optional(),
    refundType: z.enum(['full', 'partial']).optional(),
    confidence: z.number().optional()
  }).optional()
});

/**
 * Ready to Iterate Agent - PTRR Implementation
 */
const readyToIterateAgent = factoryAgentWithPTRR<
  z.infer<typeof ReadyToIterateInputSchema>,
  z.infer<typeof ReadyToIterateOutputSchema>
>({
  prompt: createAssetPackSetupPhaseReadyToIterateAgentPrompt(),
  tools: getAssetPackPipelineToolsForAgent('asset-pack-ready-to-iterate-agent'),
  stepPrompts: AssetPackSetupPhaseReadyToIterateAgentPromptSteps,

  name: 'asset-pack-ready-to-iterate-agent',
  description: 'Determines if AssetPack written-asset synthesis should continue after setup',

  outputSchema: ReadyToIterateOutputSchema,

  plan: { chunkThreshold: 1000 },
  try: { chunkThreshold: 2000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 }
});

/**
 * Export wrapper that adds short-circuit logic
 */
export default async function readyToIterateWithShortCircuit(input: any, execution: any) {
  // Prepare input from execution context
  const setupInput = {
    cloneResult: execution.get('setup/clone-vcs', 'result'),
    lspInitialized: execution.get('setup/lsp', 'initialized') || false,
    dangerWallResult: execution.get('setup/danger-wall', 'result'),
    readComprehension: resolveReadComprehensionFromExecution(execution),
    writtenAssetType: resolveWrittenAssetTypeFromExecution(execution),
    codebaseAnalysis: execution.get('setup/codebase', 'analysis')
  };

  // Execute the agent
  const result = await readyToIterateAgent(setupInput, execution);

  // Check critical blockers
  const criticalBlockers = [
    'Repository clone failed',
    'LSP initialization failed',
    'Read incomprehensible',
    'Written-asset type unknown',
    'Codebase inaccessible'
  ];

  const hasCriticalBlocker = result.blockers.some(blocker =>
    criticalBlockers.some(critical => blocker.includes(critical))
  );

  // If not ready with critical blockers, signal short-circuit
  if (!result.ready && hasCriticalBlocker) {
    return {
      result,
      signal: {
        type: 'SHORT_CIRCUIT' as const,
        reason: `Setup failed: ${result.blockers.join(', ')}`,
        refundType: 'full' as const, // Full refund for setup failures
        confidence: result.confidence,
        metadata: {
          phase: 'setup',
          agent: 'asset-pack-ready-to-iterate-agent',
          blockers: result.blockers,
          warnings: result.warnings
        }
      } as ShortCircuitSignal
    };
  }

  // Ready to continue
  return result;
}
