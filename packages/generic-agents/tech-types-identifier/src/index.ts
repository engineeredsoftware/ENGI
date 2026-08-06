/**
 * Tech Types Identifier Agent - Declarative Pattern
 * 
 * This agent uses the CORRECT declarative pattern:
 * - Define schemas for each PTRR step
 * - Define prompts for agent and each step
 * - Let factories handle ALL execution
 * - No manual step implementations needed!
 */

import { 
   
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import {
  type CanonicalTechnologyProfile,
  buildEmptyTechnologyProfile,
} from './technology-profile-contract';

// ==================== TOOLS ====================
// Tools this agent can use for tech identification
// TODO: Import actual tools when they exist
// import { codeAnalysisTool } from '@bitcode/generic-tools/code-analysis';
// import { packageAnalysisTool } from '@bitcode/generic-tools/package-analysis';
// import { frameworkDetectionTool } from '@bitcode/generic-tools/framework-detection';
const codeAnalysisTool = null;
const packageAnalysisTool = null;
const frameworkDetectionTool = null;

// ==================== INPUT SCHEMA ====================
const TechTypesIdentifierInputSchema = z.object({
  content: z.string().describe('Code, text, or file content to analyze'),
  contentType: z.enum(['code', 'package-file', 'documentation', 'mixed']).default('mixed'),
  analysisDepth: z.enum(['surface', 'deep']).default('deep'),
  includeVersions: z.boolean().default(true).describe('Identify specific versions when possible'),
  includeConfidence: z.boolean().default(true).describe('Include confidence scores'),
  focusAreas: z.array(z.enum(['languages', 'frameworks', 'libraries', 'tools', 'platforms', 'databases'])).optional(),
  contextHints: z.array(z.string()).optional().describe('Additional context about the technology stack')
});

const CanonicalTechnologyProfileSchema = z.object({
  // `technologyProfile` is the canonical Bitcode envelope for normalized stack evidence.
  stackHints: z.array(z.string()),
  languages: z.array(z.string()),
  technologies: z.array(z.string()),
  brands: z.array(z.string()),
});

// ==================== PLAN STEP SCHEMA ====================
const TechTypesIdentifierPlanSchema = z.object({
  // Analysis strategy
  analysisStrategy: z.object({
    approach: z.string().describe('How to analyze the content'),
    contentClassification: z.enum(['code', 'package-file', 'documentation', 'mixed']),
    analysisMethod: z.enum(['pattern-matching', 'syntax-analysis', 'dependency-analysis', 'hybrid']),
    focusAreas: z.array(z.string())
  }),
  
  // Detection planning
  detectionPlan: z.object({
    languageDetection: z.boolean(),
    frameworkDetection: z.boolean(),
    libraryDetection: z.boolean(),
    toolDetection: z.boolean(),
    platformDetection: z.boolean(),
    databaseDetection: z.boolean()
  }),
  
  // Pattern analysis
  patternAnalysis: z.object({
    keyPatterns: z.array(z.string()),
    fileExtensions: z.array(z.string()),
    syntaxMarkers: z.array(z.string()),
    importStatements: z.array(z.string())
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  complexity: z.enum(['simple', 'moderate', 'complex'])
});

// ==================== TRY STEP SCHEMA ====================
const TechTypesIdentifierTrySchema = z.object({
  // Core identification results
  identificationResults: z.object({
    languages: z.array(z.object({
      name: z.string(),
      version: z.string().optional(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string())
    })),
    frameworks: z.array(z.object({
      name: z.string(),
      category: z.string(),
      version: z.string().optional(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string())
    })),
    libraries: z.array(z.object({
      name: z.string(),
      purpose: z.string(),
      version: z.string().optional(),
      confidence: z.number().min(0).max(1),
      packageManager: z.string().optional()
    })),
    tools: z.array(z.object({
      name: z.string(),
      category: z.enum(['build', 'test', 'deploy', 'development', 'other']),
      confidence: z.number().min(0).max(1)
    }))
  }),
  
  // Analysis metadata
  analysisMetadata: z.object({
    contentSize: z.number(),
    analysisMethod: z.string(),
    patternsMatched: z.number(),
    processingTime: z.number()
  }),
  
  // Pattern matches
  patternMatches: z.array(z.object({
    pattern: z.string(),
    matches: z.array(z.string()),
    technology: z.string(),
    confidence: z.number()
  })),
  
  // Tool usage for identification
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for tech identification'),
  
  // Status
  analysisComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const TechTypesIdentifierRefineSchema = z.object({
  // Enhanced identification
  enhancedResults: z.object({
    techStack: z.object({
      primaryLanguage: z.string().optional(),
      secondaryLanguages: z.array(z.string()),
      mainFramework: z.string().optional(),
      supportingFrameworks: z.array(z.string()),
      keyLibraries: z.array(z.string()),
      developmentTools: z.array(z.string())
    }),
    stackClassification: z.object({
      stackType: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'desktop', 'embedded', 'data', 'ml', 'unknown']),
      architecture: z.enum(['monolithic', 'microservices', 'serverless', 'hybrid', 'unknown']),
      paradigm: z.array(z.enum(['oop', 'functional', 'reactive', 'event-driven', 'mvc', 'mvvm']))
    })
  }),
  
  // Quality improvements
  qualityEnhancements: z.object({
    duplicatesRemoved: z.number(),
    conflictsResolved: z.number(),
    confidenceImproved: z.number(),
    versionsIdentified: z.number()
  }),
  
  // Relationship analysis
  relationshipAnalysis: z.object({
    dependencies: z.array(z.object({
      parent: z.string(),
      child: z.string(),
      relationship: z.enum(['depends-on', 'extends', 'implements', 'uses'])
    })),
    ecosystemCohesion: z.number().min(0).max(1),
    compatibilityIssues: z.array(z.string())
  }),
  
  // Refinement tools
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools for refinement'),
  
  // Improvements made
  refinements: z.array(z.string()),
  confidence: z.number()
});

// ==================== RETRY STEP SCHEMA ====================
const TechTypesIdentifierRetrySchema = z.object({
  // Final comprehensive results
  finalResults: z.object({
    technologyProfile: CanonicalTechnologyProfileSchema.describe(
      'Canonical Bitcode technology profile derived from repo and config evidence'
    ),
    identifiedTechnologies: z.array(z.object({
      name: z.string(),
      category: z.enum(['language', 'framework', 'library', 'tool', 'platform', 'database']),
      version: z.string().optional(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string()),
      purpose: z.string(),
      ecosystem: z.string()
    })),
    techStackSummary: z.object({
      primaryStack: z.string(),
      stackDescription: z.string(),
      maturityLevel: z.enum(['experimental', 'emerging', 'mature', 'retired']),
      complexityScore: z.number().min(0).max(1)
    })
  }),
  
  // Analysis insights
  analysisInsights: z.object({
    stackCoherence: z.number().min(0).max(1),
    modernityScore: z.number().min(0).max(1),
    popularityIndicators: z.array(z.string()),
    potentialIssues: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  
  // Classification results
  classification: z.object({
    primaryCategory: z.string(),
    developmentType: z.enum(['web', 'mobile', 'desktop', 'server', 'embedded', 'data', 'ai-ml', 'game', 'other']),
    targetPlatforms: z.array(z.string()),
    deploymentTargets: z.array(z.string())
  }),
  
  // Final recommendations
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()).optional(),
  
  // Recovery tools if needed
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Recovery tools if retry needed'),
  
  // Overall success
  success: z.boolean(),
  completionMessage: z.string()
});

// ==================== PROMPTS ====================

export const techTypesIdentifierPrompt = new AgentPrompt({
  name: 'tech-types-identifier' as PromptPart,
  identity: 'Technology stack analyzer' as PromptPart
});

export const techTypesIdentifierStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze tech strategy' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute tech identification' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance tech accuracy' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize tech analysis' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive tech identification agent
 * Uses full PTRR cycle for thorough analysis
 */
// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const comprehensiveTechIdentification: any = factoryPTRRAgent<
  z.infer<typeof TechTypesIdentifierInputSchema>,
  z.infer<typeof TechTypesIdentifierRetrySchema>
>({
  name: 'comprehensive-identification',
  description: 'Full technology stack analysis with relationship mapping and insights',
  prompt: techTypesIdentifierPrompt,
  stepPrompts: {
    plan: () => techTypesIdentifierStepPrompts.plan,
    try: () => techTypesIdentifierStepPrompts.try,
    refine: () => techTypesIdentifierStepPrompts.refine,
    retry: () => techTypesIdentifierStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: TechTypesIdentifierRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Tech analysis plans are typically small
  },
  try: {
    chunkThreshold: 30000,  // Code content can be large
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

/**
 * Quick tech identification agent
 * Single-step execution for simple identification tasks
 */
const quickTechIdentification: any = factoryAgentWithSingleStep<
  z.infer<typeof TechTypesIdentifierInputSchema>,
  z.infer<typeof TechTypesIdentifierRetrySchema>
>({
  name: 'quick-identification',
  description: 'Fast technology identification for basic analysis',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Even simple variations can use the execution's registries
    const llm = (execution as any).llms?.getDefaultLLM?.();
    const codeAnalysisTool = (execution as any).tools?.getTool?.('code-analysis');
    
    // Quick identification logic here
    // Return matches the Retry schema for consistency
    return {
      finalResults: {
        technologyProfile: buildEmptyTechnologyProfile(),
        identifiedTechnologies: [],
        techStackSummary: {
          primaryStack: 'Unknown',
          stackDescription: 'Quick analysis - comprehensive identification needed',
          maturityLevel: 'unknown' as any,
          complexityScore: 0.5
        }
      },
      analysisInsights: {
        stackCoherence: 0.5,
        modernityScore: 0.5,
        popularityIndicators: [],
        potentialIssues: ['Quick analysis performed - detailed analysis recommended'],
        recommendations: ['Use comprehensive identification for accurate results']
      },
      classification: {
        primaryCategory: 'unknown',
        developmentType: 'other',
        targetPlatforms: [],
        deploymentTargets: []
      },
      recommendations: ['Use comprehensive technology identification for detailed analysis'],
      success: true,
      completionMessage: 'Quick technology identification completed'
    };
  }
});

// ==================== AGENT EXPORTS ====================

/**
 * Tech Types Identifier Agent - Default PTRR implementation
 * Main agent using comprehensive tech identification
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
export const techTypesIdentifier = comprehensiveTechIdentification;

/**
 * Quick Tech Types Identifier Agent - Simple version prefixed with "quick"
 * Fast technology identification for basic analysis
 */
export const quickTechTypesIdentifier = quickTechIdentification;

/**
 * Helper to select appropriate tech identification agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectTechTypesIdentifierAgent(input: TechTypesIdentifierInput): string {
  // Always prefer PTRR for comprehensive analysis
  const needsComprehensive = 
    input.analysisDepth === 'deep' ||
    input.contentType === 'code' ||
    input.includeVersions ||
    input.content.length > 1000 ||
    (input.focusAreas && input.focusAreas.length > 2);
  
  // Return agent registry keys
  return needsComprehensive ? 'techTypesIdentifier' : 'quickTechTypesIdentifier';
}

// ==================== TYPE EXPORTS ====================
export type TechTypesIdentifierInput = z.infer<typeof TechTypesIdentifierInputSchema>;
export type TechTypesIdentifierPlanOutput = z.infer<typeof TechTypesIdentifierPlanSchema>;
export type TechTypesIdentifierTryOutput = z.infer<typeof TechTypesIdentifierTrySchema>;
export type TechTypesIdentifierRefineOutput = z.infer<typeof TechTypesIdentifierRefineSchema>;
export type TechTypesIdentifierRetryOutput = z.infer<typeof TechTypesIdentifierRetrySchema>;
export type { CanonicalTechnologyProfile } from './technology-profile-contract';
export { CanonicalTechnologyProfileSchema };
export {
  buildEmptyTechnologyProfile,
  isCanonicalTechnologyProfile,
} from './technology-profile-contract';

/**
 * THE MAGIC EXPLAINED:
 * 
 * When techTypesIdentifierAgent is called:
 * 1. selectVariation picks comprehensive or quick
 * 2. If comprehensive:
 *    - factoryPlanGeneration(schema) creates Plan generation (failsafed thinkings)
 *    - factoryTryGeneration(schema) creates Try generation (failsafed thinkings)
 *    - factoryRefineGeneration(schema) creates Refine generation (failsafed thinkings)
 *    - factoryRetryGeneration(schema) creates Retry generation (failsafed thinkings)
 * 3. Each executor automatically:
 *    - Runs PrepareConciseContext→ChunkThenSum→StitchUntilComplete
 *    - Each parent runs Reason→Judge→StructuredOutput
 *    - Stores everything to execution.store()
 *    - Executes tools if useTools is in output
 * 4. The execution tree accumulates:
 *    - Every LLM call result
 *    - Every tool execution
 *    - Every substep output
 *    - All in namespaced stores!
 * 
 * We just defined schemas - the framework does EVERYTHING else!
 */
