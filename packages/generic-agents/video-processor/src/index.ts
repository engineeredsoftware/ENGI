/**
 * Video Processor Agent - Declarative Pattern
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
import { z } from 'zod';

// ==================== IMPORTS ====================
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

// ==================== INPUT SCHEMA ====================
const VideoProcessorInputSchema = z.object({
  videoUrl: z.string().optional().describe('Direct video URL to process'),
  processingMode: z.enum(['comprehensive', 'audio-only', 'visual-only']).default('comprehensive').describe('Video processing mode'),
  extractAudio: z.boolean().default(true).describe('Extract and transcribe audio content'),
  analyzeFrames: z.boolean().default(true).describe('Perform visual frame analysis'),
  detectText: z.boolean().default(true).describe('Extract text from video frames (OCR)'),
  identifyTechnical: z.boolean().default(true).describe('Identify technical content and code'),
  maxDuration: z.number().default(1800).describe('Maximum video duration to process (seconds)'),
  frameCount: z.number().default(10).describe('Number of keyframes to extract for analysis'),
  qualityTarget: z.enum(['high', 'medium', 'low']).default('high'),
  includeScenes: z.boolean().default(true).describe('Extract and analyze scene segments')
});

// ==================== PLAN STEP SCHEMA ====================
const VideoProcessorPlanSchema = z.object({
  // Video discovery
  videoDiscovery: z.object({
    discoveredVideos: z.array(z.object({
      id: z.string(),
      name: z.string(),
      format: z.string(),
      url: z.string(),
      estimatedDuration: z.number().optional(),
      size: z.number().optional()
    })),
    totalVideos: z.number(),
    totalEstimatedSize: z.number()
  }),
  
  // Processing strategy
  processingStrategy: z.object({
    approach: z.string().describe('How to process the videos'),
    audioProcessing: z.boolean(),
    visualProcessing: z.boolean(),
    frameExtraction: z.boolean(),
    sceneAnalysis: z.boolean()
  }),
  
  // Resource planning
  resourcePlanning: z.object({
    estimatedFrames: z.number(),
    processingTime: z.number(),
    diskSpace: z.number(),
    memoryUsage: z.number()
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  qualityTarget: z.enum(['high', 'medium', 'low'])
});

// ==================== TRY STEP SCHEMA ====================
const VideoProcessorTrySchema = z.object({
  // Core video processing
  videoProcessing: z.object({
    processedVideos: z.array(z.object({
      id: z.string(),
      name: z.string(),
      processingStatus: z.enum(['success', 'partial', 'failed']),
      processingTime: z.number()
    })),
    totalProcessed: z.number(),
    successRate: z.number()
  }),
  
  // Video metadata extraction
  videoMetadata: z.array(z.object({
    id: z.string(),
    duration: z.number(),
    resolution: z.object({
      width: z.number(),
      height: z.number()
    }),
    frameRate: z.number(),
    format: z.string(),
    quality: z.enum(['high', 'medium', 'low']),
    hasAudio: z.boolean(),
    fileSize: z.number()
  })),
  
  // Audio transcription
  transcriptions: z.array(z.object({
    videoId: z.string(),
    fullText: z.string(),
    segments: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
      confidence: z.number()
    })),
    language: z.string(),
    confidence: z.number()
  })),
  
  // Visual analysis
  visualAnalysis: z.array(z.object({
    videoId: z.string(),
    scenes: z.array(z.object({
      start: z.number(),
      end: z.number(),
      description: z.string(),
      visualElements: z.array(z.string()),
      confidence: z.number()
    })),
    detectedText: z.array(z.string()),
    technicalElements: z.array(z.string()),
    uiElements: z.array(z.string())
  })),
  
  // Tool usage for processing
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for video processing'),
  
  // Processing status
  processingComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const VideoProcessorRefineSchema = z.object({
  // Enhanced analysis
  enhancedAnalysis: z.object({
    consolidatedContent: z.object({
      mainThemes: z.array(z.string()),
      technicalTopics: z.array(z.string()),
      actionableInsights: z.array(z.string()),
      codePatterns: z.array(z.string())
    }),
    contentClassification: z.object({
      primaryType: z.enum(['tutorial', 'meeting', 'demo', 'presentation', 'code-review', 'other']),
      visualType: z.enum(['presentation', 'demo', 'code', 'ui', 'other']),
      technicalLevel: z.enum(['beginner', 'intermediate', 'advanced'])
    })
  }),
  
  // Quality assessment
  qualityMetrics: z.object({
    visualClarity: z.number().min(0).max(1),
    audioQuality: z.number().min(0).max(1),
    contentRelevance: z.number().min(0).max(1),
    technicalDepth: z.number().min(0).max(1),
    overallScore: z.number().min(0).max(1)
  }),
  
  // Content optimization
  contentOptimization: z.object({
    keyFramesIdentified: z.number(),
    redundantContentFiltered: z.number(),
    qualityImprovements: z.array(z.string()),
    processingOptimizations: z.array(z.string())
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
const VideoProcessorRetrySchema = z.object({
  // Final comprehensive results
  finalAnalysis: z.object({
    videoSummary: z.object({
      totalVideos: z.number(),
      totalDuration: z.number(),
      averageQuality: z.string(),
      processingSuccess: z.boolean()
    }),
    contentAnalysis: z.object({
      transcription: z.string(),
      visualElements: z.array(z.string()),
      technicalContent: z.array(z.string()),
      codeSnippets: z.array(z.string()),
      uiPatterns: z.array(z.string())
    }),
    insights: z.object({
      keyFindings: z.array(z.string()),
      actionableItems: z.array(z.string()),
      technicalRecommendations: z.array(z.string()),
      implementationGuidance: z.array(z.string())
    })
  }),
  
  // Implementation guidance
  implementationDetails: z.object({
    visualRequirements: z.array(z.string()),
    technicalRequirements: z.array(z.string()),
    codePatterns: z.array(z.string()),
    workflowSteps: z.array(z.string())
  }),
  
  // Quality and performance
  qualityAssessment: z.object({
    overallScore: z.number(),
    processingEfficiency: z.number(),
    contentUtility: z.number(),
    implementationValue: z.number()
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
  completionMessage: z.string(),
  processingTime: z.number()
});

// ==================== PROMPTS ====================

/**
 * Agent-level prompt - MINIMAL
 * Only what applies to EVERY LLM call in this agent
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide minimal video processing context"
 * current_version: "V26.50.0"
 */
export const videoProcessorPrompt = new AgentPrompt({
  name: 'video-processor' as PromptPart,
  identity: 'Process video content' as PromptPart  // Ultra-minimal
});

/**
 * Step-specific prompts - Just the purpose
 * These are progressively more specific
 */
export const videoProcessorStepPrompts = {
  plan: new AgentStepPrompt({
    purpose: 'Analyze video requirements' as PromptPart
  }),
  try: new AgentStepPrompt({
    purpose: 'Execute video processing' as PromptPart
  }),
  refine: new AgentStepPrompt({
    purpose: 'Enhance video analysis' as PromptPart
  }),
  retry: new AgentStepPrompt({
    purpose: 'Complete video processing' as PromptPart
  })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive video processing agent
 * Uses full PTRR cycle for thorough video analysis
 */
// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const comprehensiveVideo: any = factoryPTRRAgent<
  z.infer<typeof VideoProcessorInputSchema>,
  z.infer<typeof VideoProcessorRetrySchema>
>({
  name: 'comprehensive-video',
  description: 'Full video processing with transcription, visual analysis, and technical content extraction',
  prompt: videoProcessorPrompt,
  stepPrompts: {
    plan: () => videoProcessorStepPrompts.plan,
    try: () => videoProcessorStepPrompts.try,
    refine: () => videoProcessorStepPrompts.refine,
    retry: () => videoProcessorStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: VideoProcessorRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Video metadata is typically small
  },
  try: {
    chunkThreshold: 100000,  // Video analysis can be large
    enableParallelChunks: false  // Video processing is sequential
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 3,
    backoff: 2000
  }
});

/**
 * Quick video processing agent
 * Single-step execution for simple video tasks
 */
const quickVideo: any = factoryAgentWithSingleStep<
  z.infer<typeof VideoProcessorInputSchema>,
  z.infer<typeof VideoProcessorRetrySchema>
>({
  name: 'quick-video',
  description: 'Fast video processing for basic content extraction',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Quick processing logic here
    // Return matches the Retry schema for consistency
    return {
      finalAnalysis: {
        videoSummary: {
          totalVideos: 0,
          totalDuration: 0,
          averageQuality: 'unknown',
          processingSuccess: false
        },
        contentAnalysis: {
          transcription: 'Quick processing - no transcription available',
          visualElements: [],
          technicalContent: [],
          codeSnippets: [],
          uiPatterns: []
        },
        insights: {
          keyFindings: ['Quick video processing completed'],
          actionableItems: ['Use comprehensive processing for detailed analysis'],
          technicalRecommendations: [],
          implementationGuidance: ['Manual video review recommended']
        }
      },
      implementationDetails: {
        visualRequirements: [],
        technicalRequirements: [],
        codePatterns: [],
        workflowSteps: ['Review video manually', 'Extract key insights', 'Plan implementation']
      },
      qualityAssessment: {
        overallScore: 0.5,
        processingEfficiency: 1.0,
        contentUtility: 0.3,
        implementationValue: 0.2
      },
      recommendations: ['Use comprehensive video processing for better analysis'],
      success: true,
      completionMessage: 'Quick video processing completed',
      processingTime: 1000
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Video Processor Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
/**
 * Video Processor Agent - Default PTRR implementation
 * Main agent using comprehensive video processing
 */
export const videoProcessor = comprehensiveVideo;

/**
 * Quick Video Processor Agent - Simple version prefixed with "quick"
 * Fast video processing for simple video tasks
 */
export const quickVideoProcessor = quickVideo;

// ==================== TYPE EXPORTS ====================
export type VideoProcessorInput = z.infer<typeof VideoProcessorInputSchema>;
export type VideoProcessorPlanOutput = z.infer<typeof VideoProcessorPlanSchema>;
export type VideoProcessorTryOutput = z.infer<typeof VideoProcessorTrySchema>;
export type VideoProcessorRefineOutput = z.infer<typeof VideoProcessorRefineSchema>;
export type VideoProcessorRetryOutput = z.infer<typeof VideoProcessorRetrySchema>;

/**
 * THE MAGIC EXPLAINED:
 * 
 * When videoProcessorAgent is called:
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
 *    - Every generation call output
 *    - All in namespaced stores!
 * 
 * We just defined schemas - the framework does EVERYTHING else!
 */
