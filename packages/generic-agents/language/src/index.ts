/**
 * Language Agent - Declarative Pattern
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

// ==================== TOOLS ====================
// Tools this agent can use for language analysis
import { languageDetectorTool } from '@bitcode/generic-tools/language-detector';
import { sentimentAnalyzerTool } from '@bitcode/generic-tools/sentiment-analyzer';
import { linguisticProcessorTool } from '@bitcode/generic-tools/linguistic-processor';

// ==================== INPUT SCHEMA ====================
const LanguageInputSchema = z.object({
  text: z.string().describe('Text to analyze'),
  analysisDepth: z.enum(['basic', 'comprehensive']).default('comprehensive'),
  detectLanguage: z.boolean().default(true),
  analyzeSentiment: z.boolean().default(true),
  extractEntities: z.boolean().default(true)
});

// ==================== PLAN STEP SCHEMA ====================
const LanguagePlanSchema = z.object({
  // Analysis strategy
  analysisStrategy: z.string().describe('How to analyze the text'),
  linguisticTargets: z.array(z.string()).describe('Linguistic features to extract'),
  
  // Language detection
  expectedLanguages: z.array(z.string()).describe('Potentially detected languages'),
  multilingualStrategy: z.string().optional(),
  
  // Analysis scope
  analysisScope: z.object({
    syntactic: z.boolean(),
    semantic: z.boolean(),
    pragmatic: z.boolean(),
    morphological: z.boolean()
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  estimatedComplexity: z.enum(['low', 'medium', 'high'])
});

// ==================== TRY STEP SCHEMA ====================
const LanguageTrySchema = z.object({
  // Language detection
  detectedLanguages: z.array(z.object({
    language: z.string(),
    confidence: z.number(),
    script: z.string().optional(),
    region: z.string().optional()
  })),
  
  // Linguistic analysis
  linguisticFeatures: z.object({
    tokens: z.array(z.string()),
    sentences: z.number(),
    words: z.number(),
    avgWordLength: z.number(),
    lexicalDiversity: z.number(),
    readabilityScore: z.number().optional()
  }),
  
  // Sentiment analysis
  sentiment: z.object({
    overall: z.enum(['positive', 'negative', 'neutral', 'mixed']),
    score: z.number().min(-1).max(1),
    emotions: z.array(z.object({
      emotion: z.string(),
      confidence: z.number()
    })).optional(),
    subjectivity: z.number().min(0).max(1)
  }),
  
  // Entity extraction
  entities: z.array(z.object({
    text: z.string(),
    type: z.string(),
    startPos: z.number(),
    endPos: z.number(),
    confidence: z.number()
  })).optional(),
  
  // Tool usage for analysis
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for language analysis'),
  
  // Status
  analysisComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const LanguageRefineSchema = z.object({
  // Enhanced linguistic analysis
  deepLinguistics: z.object({
    syntaxTree: z.any().optional(),
    dependencies: z.array(z.object({
      head: z.string(),
      dependent: z.string(),
      relation: z.string()
    })).optional(),
    constituents: z.array(z.string()).optional(),
    namedEntities: z.array(z.object({
      entity: z.string(),
      category: z.string(),
      subcategory: z.string().optional()
    }))
  }),
  
  // Pattern analysis
  patterns: z.object({
    rhetorical: z.array(z.string()),
    stylistic: z.array(z.string()),
    grammatical: z.array(z.string()),
    idiomatic: z.array(z.string())
  }),
  
  // Quality metrics
  qualityMetrics: z.object({
    coherence: z.number(),
    cohesion: z.number(),
    clarity: z.number(),
    complexity: z.number(),
    formality: z.number()
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
const LanguageRetrySchema = z.object({
  // Final comprehensive analysis
  completeAnalysis: z.object({
    primaryLanguage: z.string(),
    languageConfidence: z.number(),
    textStatistics: z.object({
      totalWords: z.number(),
      uniqueWords: z.number(),
      sentences: z.number(),
      paragraphs: z.number(),
      avgSentenceLength: z.number()
    }),
    linguisticProfile: z.object({
      complexity: z.string(),
      style: z.string(),
      tone: z.string(),
      register: z.string()
    })
  }),
  
  // Semantic analysis
  semanticAnalysis: z.object({
    mainTopics: z.array(z.string()),
    keyPhrases: z.array(z.string()),
    concepts: z.array(z.object({
      concept: z.string(),
      relevance: z.number()
    })),
    summary: z.string().optional()
  }),
  
  // Sentiment and emotion
  emotionalProfile: z.object({
    dominantSentiment: z.string(),
    emotionalJourney: z.array(z.object({
      position: z.number(),
      sentiment: z.string(),
      intensity: z.number()
    })),
    overallTone: z.string()
  }),
  
  // Recommendations
  recommendations: z.array(z.string()),
  insights: z.array(z.string()),
  
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

export const languagePrompt = new AgentPrompt({
  name: 'language' as PromptPart,
  identity: 'Linguistic analysis specialist' as PromptPart
});

export const languageStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan language analysis' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute linguistic processing' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance linguistic insights' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete language analysis' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive language analysis agent
 * Uses full PTRR cycle for thorough analysis
 */
const comprehensiveLanguage = factoryPTRRAgent<
  z.infer<typeof LanguageInputSchema>,
  z.infer<typeof LanguageRetrySchema>
>({
  name: 'comprehensive-language-analysis',
  description: 'Full linguistic analysis with NLP and sentiment detection',
  prompt: languagePrompt,
  stepPrompts: {
    plan: () => languageStepPrompts.plan,
    try: () => languageStepPrompts.try,
    refine: () => languageStepPrompts.refine,
    retry: () => languageStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: LanguageRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Language metadata is small
  },
  try: {
    chunkThreshold: 100000,  // Text can be large
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
 * Quick language detection agent
 * Single-step execution for simple language tasks
 */
const quickLanguageAgent = factoryAgentWithSingleStep<
  z.infer<typeof LanguageInputSchema>,
  z.infer<typeof LanguageRetrySchema>
>({
  name: 'quick-language-detection',
  description: 'Fast language detection and basic analysis',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Even simple variations can use the execution's registries
    const tool = execution.tools.getTool('language-detector');
    
    // Quick detection logic here
    // Return matches the Retry schema for consistency
    return {
      completeAnalysis: {
        primaryLanguage: 'unknown',
        languageConfidence: 0,
        textStatistics: {
          totalWords: input.text.split(' ').length,
          uniqueWords: 0,
          sentences: 0,
          paragraphs: 0,
          avgSentenceLength: 0
        },
        linguisticProfile: {
          complexity: 'unknown',
          style: 'unknown',
          tone: 'unknown',
          register: 'unknown'
        }
      },
      semanticAnalysis: {
        mainTopics: [],
        keyPhrases: [],
        concepts: [],
        summary: 'Quick analysis performed'
      },
      emotionalProfile: {
        dominantSentiment: 'neutral',
        emotionalJourney: [],
        overallTone: 'neutral'
      },
      recommendations: ['Use comprehensive analysis for detailed insights'],
      insights: [],
      success: true,
      completionMessage: 'Quick language detection completed'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Language Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
/**
 * Language Agent - Default PTRR implementation
 * Main agent using comprehensive language analysis
 * Advanced linguistic analysis with NLP and sentiment detection
 */
export const language = comprehensiveLanguage;

/**
 * Quick Language Agent - Simple version prefixed with "quick"
 * Fast language detection and basic analysis
 */
export const quickLanguage = quickLanguageAgent;

/**
 * Helper to select appropriate language agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectLanguageAgent(input: LanguageInput): string {
  // Always prefer PTRR for comprehensive analysis
  const needsComprehensive = 
    input.analysisDepth === 'comprehensive' ||
    input.extractEntities ||
    input.text.length > 500;
  
  return needsComprehensive ? 'language' : 'quickLanguage';
}

// ==================== TYPE EXPORTS ====================
export type LanguageInput = z.infer<typeof LanguageInputSchema>;
export type LanguagePlanOutput = z.infer<typeof LanguagePlanSchema>;
export type LanguageTryOutput = z.infer<typeof LanguageTrySchema>;
export type LanguageRefineOutput = z.infer<typeof LanguageRefineSchema>;
export type LanguageRetryOutput = z.infer<typeof LanguageRetrySchema>;

/**
 * TECHNICAL DOCUMENTATION:
 * 
 * When languageAgent is called:
 * 1. selectVariation picks comprehensive or quick based on input
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
 *    - All in namespaced stores
 * 
 * We just defined schemas - the framework handles ALL execution automatically.
 */
