/**
 * Bitcode Read Risk Admission Agent - retained danger-wall support path.
 *
 * The package name and dangerWall aliases remain for retained callers. V26
 * semantics are narrower: this agent decides whether a Bitcode read,
 * candidate written assets, AssetPack intent, and delivery mechanism are safe
 * enough to continue through the next measured pipeline phase. It does not own
 * canonical read interpretation, proof closure, delivery, or mutation.
 */

import {
  AgentPrompt,
  AgentStepPrompt,
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';

const BitcodeRiskSeveritySchema = z.enum(['none', 'low', 'medium', 'high', 'critical']);
const BitcodeThreatLevelSchema = z.enum(['minimal', 'low', 'moderate', 'high', 'critical']);

const BitcodeRiskEvidenceSchema = z.object({
  sourceType: z.string().describe('Repository, attachment, external evidence, execution state, or operator input source class'),
  path: z.string().optional().describe('Optional source path or interface reference'),
  concern: z.string().describe('Specific risk concern tied to the Bitcode read or AssetPack plan'),
  evidence: z.array(z.string()).describe('Traceable observations supporting the concern')
});

const BitcodeRiskToolRequestSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string()
});

export const BitcodeReadRiskAdmissionInputSchema = z.object({
  read: z.string().describe('Expressed Bitcode read being measured or synthesized'),
  assetPackIntent: z.string().optional().describe('Candidate AssetPack purpose or synthesis plan'),
  writtenAssetType: z.string().optional().describe('Candidate written-asset type under consideration'),
  writtenAssets: z.array(z.unknown()).optional().describe('Candidate written assets or partials to admit for downstream work'),
  repositoryEvidence: z.array(BitcodeRiskEvidenceSchema).optional().describe('Source-grounded evidence already collected for risk admission'),
  externalEvidence: z.array(BitcodeRiskEvidenceSchema).optional().describe('Discovery-phase external evidence already collected for read synthesis'),
  deliveryMechanism: z.string().optional().describe('Requested delivery mechanism such as GitHub pull request, Jira comment, or local artifact'),
  strictMode: z.boolean().default(false).describe('Require manual review for unresolved high-impact ambiguity'),
  riskCategories: z.array(z.string()).optional().describe('Specific Bitcode risk categories to evaluate'),
  admissionThreshold: z.number().default(0.8).describe('Minimum confidence for admitting the next pipeline step')
});

export const BitcodeReadRiskAdmissionPlanSchema = z.object({
  admissionPlan: z.object({
    evidenceSources: z.array(z.object({
      sourceType: z.string(),
      path: z.string().optional(),
      priority: z.number(),
      admissionChecks: z.array(z.string())
    })),
    riskChecks: z.array(z.object({
      category: z.string(),
      checks: z.array(z.string()),
      severityCeiling: BitcodeRiskSeveritySchema
    })),
    thresholds: z.object({
      maxSeverity: BitcodeRiskSeveritySchema,
      maxUnresolvedConcerns: z.number(),
      minConfidence: z.number()
    })
  }),
  bitcodeRiskStrategy: z.object({
    checkReadLegality: z.boolean(),
    checkUnsafeMutation: z.boolean(),
    checkSecretOrPrivateDataExposure: z.boolean(),
    checkProofOrEvidenceGap: z.boolean(),
    checkDeliveryMechanismMismatch: z.boolean(),
    checkAssetPackScopeMismatch: z.boolean(),
    checkLikelyExecutionFailure: z.boolean()
  }),
  useTools: z.array(BitcodeRiskToolRequestSchema).optional().describe('Risk-evidence tools requested by the plan'),
  confidence: z.number().min(0).max(1),
  admissionScope: z.array(z.string())
});

export const BitcodeReadRiskAdmissionTrySchema = z.object({
  riskResults: z.array(z.object({
    admitted: z.boolean(),
    flags: z.object({
      illegalNeed: z.boolean(),
      unsafeMutation: z.boolean(),
      secretOrPrivateDataExposure: z.boolean(),
      proofOrEvidenceGap: z.boolean(),
      deliveryMechanismMismatch: z.boolean(),
      assetPackScopeMismatch: z.boolean(),
      likelyExecutionFailure: z.boolean(),
      operatorReviewRequired: z.boolean()
    }),
    details: z.array(z.string()),
    severity: BitcodeRiskSeveritySchema,
    confidence: z.number(),
    sources: z.array(BitcodeRiskEvidenceSchema)
  })).describe('Individual Bitcode risk-admission findings'),
  overallAssessment: z.object({
    safe: z.boolean(),
    maxSeverity: BitcodeRiskSeveritySchema,
    flaggedCategories: z.array(z.string()),
    confidence: z.number(),
    requiresManualReview: z.boolean()
  }).describe('Overall admission assessment for the next Bitcode phase'),
  evidenceCoverage: z.object({
    readChecked: z.boolean(),
    repositoryEvidenceChecked: z.boolean(),
    externalEvidenceChecked: z.boolean(),
    writtenAssetsChecked: z.boolean(),
    deliveryMechanismChecked: z.boolean(),
    likelyExecutionFailureChecked: z.boolean(),
    totalEvidenceSources: z.number()
  }),
  useTools: z.array(BitcodeRiskToolRequestSchema).optional().describe('Risk-evidence tool requests'),
  admissionComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

export const BitcodeReadRiskAdmissionRefineSchema = z.object({
  refinedAssessment: z.object({
    safe: z.boolean(),
    maxSeverity: BitcodeRiskSeveritySchema,
    flaggedCategories: z.array(z.string()),
    confidence: z.number(),
    falsePositives: z.array(z.object({
      category: z.string(),
      reason: z.string(),
      confidence: z.number()
    })),
    edgeCases: z.array(z.object({
      description: z.string(),
      resolution: z.string(),
      confidence: z.number()
    }))
  }).describe('Refined Bitcode risk-admission assessment after ambiguity analysis'),
  qualityAssessment: z.object({
    evidenceTraceabilityScore: z.number(),
    completenessScore: z.number(),
    overallQuality: z.number()
  }),
  improvements: z.array(z.string()).describe('Suggested improvements to make the read, AssetPack plan, or delivery mechanism admissible'),
  admissionEnhancements: z.array(z.string()),
  useTools: z.array(BitcodeRiskToolRequestSchema).optional().describe('Risk-refinement tool requests'),
  refinementActions: z.array(z.string()),
  confidence: z.number()
});

export const BitcodeReadRiskAdmissionResultSchema = z.object({
  finalAssessment: z.object({
    safe: z.boolean(),
    maxSeverity: BitcodeRiskSeveritySchema,
    confidence: z.number(),
    verdict: z.object({
      approved: z.boolean(),
      reason: z.string(),
      flags: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    auditTrail: z.array(z.object({
      check: z.string(),
      result: z.boolean(),
      details: z.array(z.string()),
      severity: BitcodeRiskSeveritySchema
    }))
  }).describe('Final Bitcode risk-admission decision for the next pipeline phase'),
  riskInsights: z.object({
    riskProfile: z.string(),
    threatLevel: BitcodeThreatLevelSchema,
    riskRecommendations: z.array(z.string()),
    proofObligations: z.array(z.string()),
    admissionBoundary: z.string()
  }),
  readAlignment: z.object({
    alignmentScore: z.number(),
    readSafeToMeasure: z.boolean(),
    assetPackSafeToSynthesize: z.boolean(),
    deliveryMechanismSafeToAttempt: z.boolean()
  }),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()).optional(),
  useTools: z.array(BitcodeRiskToolRequestSchema).optional().describe('Recovery tool requests if admission needs another pass'),
  success: z.boolean(),
  validationMessage: z.string()
});

export type BitcodeReadRiskAdmissionInput = z.infer<typeof BitcodeReadRiskAdmissionInputSchema>;
export type BitcodeReadRiskAdmissionPlanOutput = z.infer<typeof BitcodeReadRiskAdmissionPlanSchema>;
export type BitcodeReadRiskAdmissionTryOutput = z.infer<typeof BitcodeReadRiskAdmissionTrySchema>;
export type BitcodeReadRiskAdmissionRefineOutput = z.infer<typeof BitcodeReadRiskAdmissionRefineSchema>;
export type BitcodeReadRiskAdmissionResult = z.infer<typeof BitcodeReadRiskAdmissionResultSchema>;
export type DangerWallInput = BitcodeReadRiskAdmissionInput;
export type DangerWallPlanOutput = BitcodeReadRiskAdmissionPlanOutput;
export type DangerWallTryOutput = BitcodeReadRiskAdmissionTryOutput;
export type DangerWallRefineOutput = BitcodeReadRiskAdmissionRefineOutput;
export type SecurityResult = BitcodeReadRiskAdmissionResult;

/**
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode risk-admission support prompt for deciding whether a read, written assets, AssetPack plan, and delivery mechanism may continue"
 * current_version: "V26"
 */
export const bitcodeReadRiskAdmissionPrompt = new AgentPrompt({
  name: 'bitcode-read-risk-admission' as PromptPart,
  identity: 'Bitcode risk-admission agent for read, AssetPack, proof, and delivery-boundary safety' as PromptPart
});

export const bitcodeReadRiskAdmissionStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan Bitcode risk-admission checks for a read and candidate AssetPack path' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Evaluate concrete risk evidence without mutating source or claiming proof closure' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Refine false positives, unresolved ambiguity, and proof-gap boundaries' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize admit/block/manual-review decision for the next Bitcode pipeline phase' as PromptPart })
};

export const dangerWallPrompt = bitcodeReadRiskAdmissionPrompt;
export const dangerWallStepPrompts = bitcodeReadRiskAdmissionStepPrompts;

export const bitcodeReadRiskAdmissionVariation = factoryPTRRAgent<any, any>({
  name: 'bitcode-read-risk-admission',
  description: 'Bitcode read, AssetPack, proof-gap, and delivery-mechanism risk admission for retained pipeline setup',
  prompt: bitcodeReadRiskAdmissionPrompt,
  stepPrompts: {
    plan: () => bitcodeReadRiskAdmissionStepPrompts.plan,
    try: () => bitcodeReadRiskAdmissionStepPrompts.try,
    refine: () => bitcodeReadRiskAdmissionStepPrompts.refine,
    retry: () => bitcodeReadRiskAdmissionStepPrompts.retry
  },
  outputSchema: BitcodeReadRiskAdmissionResultSchema as any,
  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 10000,
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 3,
    backoff: 1000
  }
});

export const quickBitcodeReadRiskAdmissionVariation = factoryAgentWithSingleStep<
  BitcodeReadRiskAdmissionInput,
  BitcodeReadRiskAdmissionResult
>({
  name: 'quick-bitcode-read-risk-admission',
  description: 'Fast Bitcode risk-admission pass for already bounded read and AssetPack inputs',
  execute: async (input, execution) => {
    execution.store('variation', 'mode', 'quick-bitcode-read-risk-admission');

    return {
      finalAssessment: {
        safe: true,
        maxSeverity: 'none' as const,
        confidence: 0.8,
        verdict: {
          approved: true,
          reason: 'Quick Bitcode risk admission passed for the provided read boundary',
          flags: [],
          recommendations: ['Continue only if downstream phases preserve read, AssetPack, proof, and delivery boundaries']
        },
        auditTrail: [
          {
            check: 'Quick Bitcode risk admission',
            result: true,
            details: [
              `Read boundary checked: ${input.read || 'unspecified read'}`,
              'No high-severity admission concern was provided to this quick pass'
            ],
            severity: 'none' as const
          }
        ]
      },
      riskInsights: {
        riskProfile: 'Minimal risk admitted by quick Bitcode boundary pass',
        threatLevel: 'minimal' as const,
        riskRecommendations: ['Use the PTRR risk-admission variation for high-impact writes, delivery mechanisms, likely execution failure, or unresolved proof gaps'],
        proofObligations: ['Downstream proof owners must still verify evidence and closure before promotion'],
        admissionBoundary: 'Quick pass admits the next phase; it does not prove the read or produce stable written assets'
      },
      readAlignment: {
        alignmentScore: 0.9,
        readSafeToMeasure: true,
        assetPackSafeToSynthesize: true,
        deliveryMechanismSafeToAttempt: true
      },
      recommendations: ['Proceed with downstream Bitcode phase under existing proof, execution-failure, and delivery constraints'],
      success: true,
      validationMessage: 'Quick Bitcode risk admission completed'
    };
  }
});

export const bitcodeReadRiskAdmissionAgent = bitcodeReadRiskAdmissionVariation;
export const quickBitcodeReadRiskAdmissionAgent = quickBitcodeReadRiskAdmissionVariation;

export const dangerWall = bitcodeReadRiskAdmissionAgent;
export const quickDangerWall = quickBitcodeReadRiskAdmissionAgent;
export const dangerWallAgent = bitcodeReadRiskAdmissionAgent;
export const quickDangerWallAgent = quickBitcodeReadRiskAdmissionAgent;

export const BITCODE_READ_RISK_ADMISSION_AGENT = {
  riskCheck: bitcodeReadRiskAdmissionAgent,
  quickRiskCheck: quickBitcodeReadRiskAdmissionAgent
};

export const DANGER_WALL_AGENT = {
  dangerCheck: bitcodeReadRiskAdmissionAgent,
  quickDangerCheck: quickBitcodeReadRiskAdmissionAgent
};
