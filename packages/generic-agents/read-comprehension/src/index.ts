/**
 * Bitcode Setup Read Comprehension Agent.
 *
 * The generic-tools package owns callable tools. This package owns the PTRR
 * orchestration that uses those tools during setup before risk admission.
 */

import {
  AgentPrompt,
  AgentStepPrompt,
  factoryPTRRAgent
} from '@bitcode/agent-generics';
import {
  analyzeReadSemanticsTool,
  extractReadRequirementsTool,
  identifyReadConstraintsTool,
  generateReadSatisfactionCriteriaTool,
  validateReadComprehensionTool,
  analyzeReadSatisfactionImplementationComplexityTool
} from '@bitcode/generic-tools-read-comprehension';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_ROLE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_role';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_ANALYSIS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_analysis';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_TRY_DIRECTIVES } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_ASSESSMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_assessment';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_ERRORHANDLING } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_errorhandling';
import { z } from 'zod';

const BitcodeSetupReadComprehensionToolRequestSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string()
});

export const BitcodeSetupReadComprehensionInputSchema = z.object({
  read: z.string().optional().describe('Canonical expressed Bitcode Read'),
  expressedRead: z.string().optional().describe('Alias for the expressed Bitcode Read'),
  definitionOfRead: z.string().optional().describe('Canonical Definition of Read used to measure and review the requested outcome'),
  attachments: z.array(z.any()).optional().default([]),
  repository: z.any().optional(),
  context_information: z.any().optional(),
  assetPackIntent: z.string().optional(),
  deliveryMechanism: z.string().optional(),
  phase: z.literal('setup').default('setup'),
  beforeAgent: z.literal('danger-wall').default('danger-wall')
});

export const BitcodeSetupReadComprehensionPlanSchema = z.object({
  expressedRead: z.string(),
  toolPlan: z.array(BitcodeSetupReadComprehensionToolRequestSchema),
  ambiguityQuestions: z.array(z.string()),
  expectedWrittenAssetTypes: z.array(z.string()),
  proofFocus: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export const BitcodeSetupReadComprehensionTrySchema = z.object({
  semanticAnalysis: z.any(),
  requirements: z.any(),
  constraints: z.any(),
  readSatisfactionCriteria: z.any(),
  toolsUsed: z.array(z.string()),
  useTools: z.array(BitcodeSetupReadComprehensionToolRequestSchema).optional()
});

export const BitcodeSetupReadComprehensionRefineSchema = z.object({
  refinedReadModel: z.any(),
  ambiguityClosed: z.boolean(),
  remainingQuestions: z.array(z.string()),
  writtenAssetTypes: z.array(z.string()),
  deliveryMechanismBoundaries: z.array(z.string()),
  proofObligations: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export const BitcodeSetupReadComprehensionResultSchema = z.object({
  read: z.object({
    expressed_read: z.string(),
    primary_intent: z.string().optional(),
    satisfaction_criteria: z.array(z.string()).optional()
  }),
  read_satisfaction_criteria: z.string().optional(),
  written_asset_types: z.array(z.string()).default([]),
  asset_pack_context: z.any().optional(),
  delivery_mechanism_boundaries: z.array(z.string()).default([]),
  source_to_shares_service_questions: z.record(z.string()).optional(),
  service_accountability: z.object({
    provider: z.string().optional(),
    reader_outcome: z.string().optional(),
    infrastructure_standard: z.string().optional()
  }).optional(),
  comprehension: z.object({
    intent: z.string().optional(),
    goals: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    constraints: z.array(z.string()).default([]),
    successCriteria: z.array(z.string()).default([])
  }).optional(),
  entities: z.object({
    files: z.array(z.string()).default([]),
    concepts: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([])
  }).optional(),
  toolEvidence: z.object({
    semanticAnalysis: z.any().optional(),
    requirements: z.any().optional(),
    constraints: z.any().optional(),
    validation: z.any().optional(),
    complexity: z.any().optional()
  }).optional(),
  riskAdmissionInput: z.any().optional(),
  read_definition_analysis: z.string().optional(),
  success: z.boolean().default(true),
  validationMessage: z.string().optional()
});

export type BitcodeSetupReadComprehensionInput = z.infer<typeof BitcodeSetupReadComprehensionInputSchema>;
export type BitcodeSetupReadComprehensionResult = z.infer<typeof BitcodeSetupReadComprehensionResultSchema>;

export const bitcodeSetupReadComprehensionPrompt = new AgentPrompt({
  name: 'bitcode-setup-read-comprehension' as PromptPart,
  identity: PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY
});

bitcodeSetupReadComprehensionPrompt.set(
  'role',
  PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_ROLE
);

export const bitcodeSetupReadComprehensionStepPrompts = {
  plan: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_ANALYSIS }),
  try: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_TRY_DIRECTIVES }),
  refine: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_ASSESSMENT }),
  retry: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_ERRORHANDLING })
};

export const bitcodeSetupReadComprehensionAgent: any = factoryPTRRAgent<
  BitcodeSetupReadComprehensionInput,
  BitcodeSetupReadComprehensionResult
>({
  name: 'bitcode-setup-read-comprehension',
  description: 'Setup-phase PTRR Read comprehension before Bitcode risk admission',
  prompt: bitcodeSetupReadComprehensionPrompt,
  stepPrompts: {
    plan: () => bitcodeSetupReadComprehensionStepPrompts.plan,
    try: () => bitcodeSetupReadComprehensionStepPrompts.try,
    refine: () => bitcodeSetupReadComprehensionStepPrompts.refine,
    retry: () => bitcodeSetupReadComprehensionStepPrompts.retry
  },
  tools: [
    analyzeReadSemanticsTool,
    extractReadRequirementsTool,
    identifyReadConstraintsTool,
    generateReadSatisfactionCriteriaTool,
    validateReadComprehensionTool,
    analyzeReadSatisfactionImplementationComplexityTool
  ],
  outputSchema: BitcodeSetupReadComprehensionResultSchema as any,
  plan: { chunkThreshold: 1500 },
  try: { chunkThreshold: 3000, enableParallelChunks: true },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 }
});

export const readComprehensionPrompt = bitcodeSetupReadComprehensionPrompt;
export const readComprehensionStepPrompts = bitcodeSetupReadComprehensionStepPrompts;
export const readComprehensionAgent = bitcodeSetupReadComprehensionAgent;
export const comprehendReadAgent = bitcodeSetupReadComprehensionAgent;

export const BITCODE_READ_COMPREHENSION_AGENT = {
  comprehendRead: bitcodeSetupReadComprehensionAgent
};
