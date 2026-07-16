/**
 * Validation phase agents for the AssetPack pipeline.
 *
 * Validation checks AssetPack synthesis artifacts and evidence. It does not
 * branch validation by pull-request, review, issue, or comment request labels;
 * those labels are Finish delivery-mechanism templates only.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import {
  createAssetPackValidationReadyToFinishAgentPrompt,
  AssetPackValidationReadyToFinishAgentPromptSteps,
} from './prompts/asset-pack-validation-ready-to-finish-prompt';
import { storeCrossPhaseArtifact } from '../synthesize-asset-packs';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_PLAN_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_ptrr_plan_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_TRY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_ptrr_try_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_REFINE_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_ptrr_refine_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_RETRY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_ptrr_retry_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_LASTVALIDATION_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_lastvalidation_identity_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_LASTVALIDATION_REQUIREMENTS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_lastvalidation_requirements_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_discovery_identity_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_REQUIREMENTS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_discovery_requirements_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_synthesis_identity_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_REQUIREMENTS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidation_synthesis_requirements_detailcontent';

const ValidateIssuesOutputSchema = z.object({ issues: z.array(z.string()) });

function createValidationPrompt(identity: PromptPart, requirement: PromptPart): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', identity);
  prompt.set('agent:requirements', requirement);
  prompt.set('ptrr:plan', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_PLAN_DETAILCONTENT);
  prompt.set('ptrr:try', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_TRY_DETAILCONTENT);
  prompt.set('ptrr:refine', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_REFINE_DETAILCONTENT);
  prompt.set('ptrr:retry', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_PTRR_RETRY_DETAILCONTENT);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const lastValidationPrompt = createValidationPrompt(
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_LASTVALIDATION_IDENTITY_CORESTATEMENT,
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_LASTVALIDATION_REQUIREMENTS_DETAILCONTENT,
);

const discoveryValidationPrompt = createValidationPrompt(
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_IDENTITY_CORESTATEMENT,
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_DISCOVERY_REQUIREMENTS_DETAILCONTENT,
);

const assetPackValidationPrompt = createValidationPrompt(
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_IDENTITY_CORESTATEMENT,
  PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATION_SYNTHESIS_REQUIREMENTS_DETAILCONTENT,
);

export const AssetPackValidationPhaseValidateLastValidationAgent = factoryPTRRAgent<
  any,
  z.infer<typeof ValidateIssuesOutputSchema>
>({
  name: 'asset-pack-validate-last-iterations-validation-phase-agent',
  description: "Validates prior AssetPack validation evidence for unresolved proof gaps",
  outputSchema: ValidateIssuesOutputSchema,
  prompt: lastValidationPrompt,
  stepPrompts: { plan: () => lastValidationPrompt, try: () => lastValidationPrompt, refine: () => lastValidationPrompt, retry: () => lastValidationPrompt },
  plan: {},
  try: {},
  refine: {},
  retry: {},
});

export const AssetPackValidationPhaseValidateDiscoveryAgent = factoryPTRRAgent<
  any,
  z.infer<typeof ValidateIssuesOutputSchema>
>({
  name: 'asset-pack-validate-discovery-phase-agent',
  description: 'Validates discovery evidence for Read-to-AssetPack synthesis',
  outputSchema: ValidateIssuesOutputSchema,
  prompt: discoveryValidationPrompt,
  stepPrompts: { plan: () => discoveryValidationPrompt, try: () => discoveryValidationPrompt, refine: () => discoveryValidationPrompt, retry: () => discoveryValidationPrompt },
  plan: {},
  try: {},
  refine: {},
  retry: {},
});

export const AssetPackValidationPhaseValidateSynthesisArtifactsAgent = factoryPTRRAgent<
  any,
  z.infer<typeof ValidateIssuesOutputSchema>
>({
  name: 'asset-pack-validate-synthesis-artifacts-agent',
  description: 'Validates synthesized AssetPack artifacts without delivery-template branching',
  outputSchema: ValidateIssuesOutputSchema,
  prompt: assetPackValidationPrompt,
  stepPrompts: { plan: () => assetPackValidationPrompt, try: () => assetPackValidationPrompt, refine: () => assetPackValidationPrompt, retry: () => assetPackValidationPrompt },
  plan: {},
  try: {},
  refine: {},
  retry: {},
});

const ReadyToFinishInputSchema = z.object({
  allValidationResults: z.any().optional(),
  discoveryConfidence: z.number().optional(),
  setupMetrics: z.any().optional(),
  implementationMetrics: z.any().optional(),
});

const ReadyToFinishOutputSchema = z.object({
  finalApproval: z.boolean(),
  overallConfidence: z.number(),
  qualityScore: z.number(),
  criticalChecks: z.object({
    requirementsMet: z.boolean(),
    testsPass: z.boolean(),
    noSecurityIssues: z.boolean(),
    documentationComplete: z.boolean(),
    performanceAcceptable: z.boolean(),
  }),
  finalBlockers: z.array(z.string()),
  finalWarnings: z.array(z.string()),
  recommendation: z.enum(['finish', 'review', 'revise', 'abort']),
  summary: z.string(),
});

const AssetPackValidationReadyToFinishAgentCore = factoryPTRRAgent<
  z.infer<typeof ReadyToFinishInputSchema>,
  z.infer<typeof ReadyToFinishOutputSchema>
>({
  name: 'asset-pack-ready-to-finish-agent',
  description: 'Final AssetPack validation check before Finish',
  prompt: createAssetPackValidationReadyToFinishAgentPrompt(),
  stepPrompts: AssetPackValidationReadyToFinishAgentPromptSteps,
  outputSchema: ReadyToFinishOutputSchema,
  plan: { chunkThreshold: 1500 },
  try: { chunkThreshold: 3000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

export async function AssetPackValidationReadyToFinishAgent(
  input: z.infer<typeof ReadyToFinishInputSchema>,
  execution: any
): Promise<z.infer<typeof ReadyToFinishOutputSchema>> {
  // Inference is non-configurable: always run the formal PTRR validation core.
  const raw = await AssetPackValidationReadyToFinishAgentCore(input, execution);
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output.
  const output = ((raw as any)?.finalOutput ?? (raw as any)?.output ?? raw) as z.infer<typeof ReadyToFinishOutputSchema>;
  // Cross-phase artifact: the run-level surfaces read the readiness verdict
  // from outside the validation sibling (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'validation', 'readyToFinish', output);
  // The gate is the LAST agent in the Validation sequence, so its return value
  // IS the validation phase result. Spread the threaded input (the synthesis
  // artifacts flowing Discovery -> Implementation -> Validation -> Finish)
  // under the typed verdict so the phase result is never starved down to the
  // verdict alone.
  const threaded =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  return { ...threaded, ...output };
}

export function registerValidationAgentsForType(
  _writtenAssetType: string,
  agentRegistry: any
): void {
  agentRegistry.registerAgent(
    'validation:validate-last-iterations-validation-phase',
    async (input: any, execution: any) => {
      const raw = await AssetPackValidationPhaseValidateLastValidationAgent(input, execution);
      const out = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
      const issues = Array.isArray(out?.issues) ? out.issues : [];
      // Cross-phase artifact: the ReadyToFinish gate runs on a different
      // sequential sibling (cross-phase store-visibility law).
      storeCrossPhaseArtifact(execution, 'validation/last', 'issues', issues);
      return { issues };
    }
  );

  agentRegistry.registerAgent(
    'validation:validate-discovery-phase',
    async (input: any, execution: any) => {
      const raw = await AssetPackValidationPhaseValidateDiscoveryAgent(input, execution);
      const out = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
      const issues = Array.isArray(out?.issues) ? out.issues : [];
      // Cross-phase artifact (cross-phase store-visibility law).
      storeCrossPhaseArtifact(execution, 'validation/discovery', 'issues', issues);
      return { issues };
    }
  );

  agentRegistry.registerAgent(
    'validation:validate-asset-pack-synthesis-artifacts',
    async (input: any, execution: any) => {
      const raw = await AssetPackValidationPhaseValidateSynthesisArtifactsAgent(input, execution);
      const out = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
      const issues = Array.isArray(out?.issues) ? out.issues : [];
      // Cross-phase artifact (cross-phase store-visibility law).
      storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', issues);
      return { issues };
    }
  );

  agentRegistry.registerAgent(
    'validation:asset-pack-ready-to-finish-agent',
    AssetPackValidationReadyToFinishAgent
  );
}

export function createValidationExecutorSequence(_writtenAssetType: string): any[] {
  return [
    { agent: 'validation:validate-last-iterations-validation-phase' },
    { agent: 'validation:validate-discovery-phase' },
    { agent: 'validation:validate-asset-pack-synthesis-artifacts' },
    { agent: 'validation:asset-pack-ready-to-finish-agent' },
  ];
}
