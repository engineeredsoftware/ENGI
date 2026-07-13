/**
 * Finish/Delivering agents for AssetPack shippables.
 *
 * Pattern: AssetPack-named agent carriers own Finish-phase Delivering actions.
 * They deliver shippables, meaning connected-interface wrappers over saved
 * AssetPacks or AssetPackPartials.
 * All agents use PTRR (Plan-Try-Refine-Retry) so delivery evidence remains
 * auditable as part of the source-to-shares pipeline.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { z } from 'zod';
import {
  createAssetPackFinishCreatePullRequestDeliveryAgentPrompt,
  AssetPackFinishCreatePullRequestDeliveryAgentPromptSteps
} from './prompts/create-pull-request-prompt';
import {
  createAssetPackFinishFinalizeDeliveryEvidenceAgentPrompt,
  AssetPackFinishFinalizeDeliveryEvidenceAgentPromptSteps
} from './prompts/finalize-delivery-evidence-prompt';
import { normalizeDeliveryMechanismTemplate } from '../semantic-resolution';

// ==================== CREATE PULL REQUEST AGENT ====================

const CreatePullRequestInputSchema = z.object({
  implementationResults: z.any(), // From implementation phase
  validationResults: z.any(), // From validation phase
  repository: z.object({
    owner: z.string(),
    name: z.string(),
    baseBranch: z.string(),
    headBranch: z.string()
  }),
  changes: z.object({
    files: z.array(z.object({
      path: z.string(),
      content: z.string().optional(),
      patch: z.string().optional(),
      status: z.enum(['added', 'modified', 'deleted'])
    })),
    summary: z.string()
  })
});

const CreatePullRequestOutputSchema = z.object({
  pullRequest: z.object({
    url: z.string(),
    number: z.number(),
    title: z.string(),
    body: z.string(),
    baseBranch: z.string(),
    headBranch: z.string(),
    state: z.string()
  }),
  commit: z.object({
    sha: z.string(),
    message: z.string(),
    author: z.string(),
    timestamp: z.string()
  }),
  statistics: z.object({
    filesChanged: z.number(),
    additions: z.number(),
    deletions: z.number()
  }),
  nextSteps: z.array(z.string())
});

/**
 * AssetPackFinishCreatePullRequestDeliveryAgent
 * 
 * Creates a pull request delivery mechanism for AssetPack code changes.
 * PrepareContext will provide all previous phase results.
 */
export const AssetPackFinishCreatePullRequestDeliveryAgent = factoryAgentWithPTRR<
  z.infer<typeof CreatePullRequestInputSchema>,
  z.infer<typeof CreatePullRequestOutputSchema>
>({
  name: 'finish:asset-pack-create-pull-request-delivery-agent',
  description: 'Creates a pull request delivery mechanism with AssetPack code changes',
  
  prompt: createAssetPackFinishCreatePullRequestDeliveryAgentPrompt(),
  stepPrompts: AssetPackFinishCreatePullRequestDeliveryAgentPromptSteps,
  
  outputSchema: CreatePullRequestOutputSchema,
  
  plan: { chunkThreshold: 1500 },
  try: { chunkThreshold: 3000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 }
});

// ==================== GENERIC FINALIZE AGENT (RUNS LAST) ====================

const FinalizeAssetPackDeliveryEvidenceInputSchema = z.object({
  deliveryResults: z.any(), // From the selected Finish Delivering mechanism agent
  validationResults: z.any(),
  discoveryMetrics: z.any(),
  read: z.string().optional(),
  writtenAssetType: z.string().optional()
});

const FinalizeAssetPackDeliveryEvidenceOutputSchema = z.object({
  success: z.boolean(),
  shippableUrl: z.string(), // PR URL
  summary: z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.string(),
    nextSteps: z.array(z.string())
  }),
  metrics: z.object({
    phaseDurations: z.record(z.string(), z.number()), // ms per phase
    totalDuration: z.number(),
    tokensUsed: z.number(),
    btdConsumed: z.number(),
    qualityScore: z.number() // 0-100
  }),
  artifacts: z.object({
    logs: z.string().optional(),
    reports: z.array(z.string()).optional(),
    notifications: z.array(z.string())
  }),
  feedback: z.string() // AI-generated feedback on the delivered Shippable and its AssetPack evidence.
});

/**
 * AssetPackFinishFinalizeDeliveryEvidenceAgent
 * 
 * Generic final agent that runs after pull-request delivery.
 * This is the last delivery-evidence agent in the Finish phase.
 */
export const AssetPackFinishFinalizeDeliveryEvidenceAgent = factoryAgentWithPTRR<
  z.infer<typeof FinalizeAssetPackDeliveryEvidenceInputSchema>,
  z.infer<typeof FinalizeAssetPackDeliveryEvidenceOutputSchema>
>({
  name: 'finish:asset-pack-finalize-delivery-evidence-agent',
  description: 'Finalizes Finish delivery evidence for pull-request delivery',
  
  prompt: createAssetPackFinishFinalizeDeliveryEvidenceAgentPrompt(),
  stepPrompts: AssetPackFinishFinalizeDeliveryEvidenceAgentPromptSteps,
  
  outputSchema: FinalizeAssetPackDeliveryEvidenceOutputSchema,
  
  plan: { chunkThreshold: 1000 },
  try: { chunkThreshold: 2000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 }
});

// ==================== DYNAMIC AGENT REGISTRATION ====================

/**
 * Registers Finish/Delivering agents.
 * Called after validation phase completes.
 * 
 * Sequence:
 * 1. Pull-request Delivering (CreatePR)
 * 2. Generic finalize (FinalizeAssetPackDeliveryEvidence) - ALWAYS LAST
 */
export function registerFinishDeliveryAgentsForType(
  deliveryMechanismTemplate: string,
  agentRegistry: any // AgentAgentsRegistry from PipelineExecution
): void {
  normalizeDeliveryMechanismTemplate(deliveryMechanismTemplate);
  agentRegistry.registerAgent(
    'finish:asset-pack-create-pull-request-delivery-agent',
    AssetPackFinishCreatePullRequestDeliveryAgent
  );
  
  // ALWAYS register the generic finalize agent LAST.
  agentRegistry.registerAgent(
    'finish:asset-pack-finalize-delivery-evidence-agent',
    AssetPackFinishFinalizeDeliveryEvidenceAgent
  );
}

/**
 * Creates the Finish/Delivering sequence.
 * 
 * @param deliveryMechanismTemplate The delivery mechanism template requested for Finish
 * @returns Array defining the execution order
 */
export function createFinishDeliveryExecutorSequence(
  deliveryMechanismTemplate: string
): any[] {
  normalizeDeliveryMechanismTemplate(deliveryMechanismTemplate);
  
  return [
    { agent: 'finish:asset-pack-create-pull-request-delivery-agent' },
    { agent: 'finish:asset-pack-finalize-delivery-evidence-agent' } // Generic finalize - ALWAYS LAST
  ];
}

export const registerFinishAgentsForType = registerFinishDeliveryAgentsForType;
export const createFinishExecutorSequence = createFinishDeliveryExecutorSequence;
