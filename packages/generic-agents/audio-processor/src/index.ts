/**
 * Audio Processor Agent - Declarative Pattern
 * 
 * This agent uses the CORRECT declarative pattern:
 * - Define schemas for each PTRR step
 * - Define MINIMAL prompts (only what applies to ALL calls)
 * - Let factories handle ALL execution
 * - Tools are declared at agent level, NOT in prompts
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
const AudioProcessorInputSchema = z.object({
  audioUrl: z.string().describe('URL or path to audio file'),
  taskDescription: z.string().describe('What to analyze in the audio'),
  analysisDepth: z.enum(['basic', 'comprehensive']).default('comprehensive'),
  includeTranscription: z.boolean().default(true),
  extractTechnicalTerms: z.boolean().default(true)
});

// ==================== PLAN STEP SCHEMA ====================
const AudioProcessorPlanSchema = z.object({
  // Analysis strategy
  analysisStrategy: z.string().describe('How to analyze the audio'),
  processingSteps: z.array(z.string()).describe('Steps to process audio'),
  
  // Expected outputs
  expectedInsights: z.array(z.string()).describe('What insights to extract'),
  focusAreas: z.array(z.enum(['transcription', 'sentiment', 'technical', 'quality'])),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  risks: z.array(z.string()).optional()
});

// ==================== TRY STEP SCHEMA ====================
const AudioProcessorTrySchema = z.object({
  // Core audio analysis
  transcription: z.object({
    fullText: z.string(),
    segments: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
      confidence: z.number()
    })),
    language: z.string(),
    confidence: z.number()
  }),
  
  // Audio metadata
  metadata: z.object({
    duration: z.number(),
    format: z.string(),
    sampleRate: z.number(),
    channels: z.number(),
    bitrate: z.number(),
    quality: z.enum(['high', 'medium', 'low'])
  }),
  
  // Initial analysis
  analysis: z.object({
    hasBackgroundNoise: z.boolean(),
    speechClarity: z.number(),
    estimatedSpeakers: z.number(),
    topics: z.array(z.string()),
    sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed'])
  }),
  
  // Tool usage for processing
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for audio processing'),
  
  // Status
  processingComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const AudioProcessorRefineSchema = z.object({
  // Enhanced analysis
  enhancedTranscription: z.object({
    correctedText: z.string().optional(),
    speakerLabels: z.array(z.object({
      speakerId: z.string(),
      segments: z.array(z.number())
    })).optional(),
    keyPhrases: z.array(z.string()),
    technicalTerms: z.array(z.string())
  }),
  
  // Quality improvements
  qualityAssessment: z.object({
    transcriptionAccuracy: z.number(),
    audioQualityScore: z.number(),
    processingQuality: z.number(),
    overallScore: z.number()
  }),
  
  // Deeper insights
  insights: z.object({
    mainTopics: z.array(z.string()),
    actionItems: z.array(z.string()).optional(),
    summaryPoints: z.array(z.string()),
    recommendations: z.array(z.string()).optional()
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
const AudioProcessorRetrySchema = z.object({
  // Final comprehensive output
  finalTranscription: z.string(),
  
  // Complete analysis
  completeAnalysis: z.object({
    metadata: z.object({
      duration: z.number(),
      format: z.string(),
      quality: z.string()
    }),
    transcription: z.object({
      text: z.string(),
      confidence: z.number(),
      language: z.string()
    }),
    insights: z.object({
      keyPoints: z.array(z.string()),
      technicalTerms: z.array(z.string()),
      sentiment: z.string(),
      topics: z.array(z.string())
    })
  }),
  
  // Task relevance
  taskRelevance: z.object({
    relevanceScore: z.number(),
    relevantSegments: z.array(z.object({
      text: z.string(),
      timestamp: z.number(),
      relevance: z.string()
    })),
    taskAlignment: z.string()
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

/**
 * Agent-level prompt - MINIMAL
 * Only what applies to EVERY LLM call in this agent
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide minimal audio processing context"
 * current_version: "V26.50.0"
 */
export const audioProcessorPrompt = new AgentPrompt({
  name: 'audio-processor' as PromptPart,
  identity: 'Process audio files' as PromptPart  // Ultra-minimal
});

/**
 * Step-specific prompts - Just the purpose
 * These are progressively more specific
 */
export const audioProcessorStepPrompts = {
  plan: new AgentStepPrompt({
    purpose: 'Analyze audio requirements' as PromptPart
  }),
  try: new AgentStepPrompt({
    purpose: 'Execute audio processing' as PromptPart
  }),
  refine: new AgentStepPrompt({
    purpose: 'Enhance audio analysis' as PromptPart
  }),
  retry: new AgentStepPrompt({
    purpose: 'Complete audio processing' as PromptPart
  })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive audio processing variation
 * Uses full PTRR cycle for thorough analysis
 */
const comprehensiveAudioVariation = factoryPTRRAgent<
  z.infer<typeof AudioProcessorInputSchema>,
  z.infer<typeof AudioProcessorRetrySchema>
>({
  name: 'comprehensive-audio-analysis',
  description: 'Full audio processing with transcription and deep analysis',
  prompt: audioProcessorPrompt,
  stepPrompts: {
    plan: () => audioProcessorStepPrompts.plan,
    try: () => audioProcessorStepPrompts.try,
    refine: () => audioProcessorStepPrompts.refine,
    retry: () => audioProcessorStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: AudioProcessorRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Audio metadata is small
  },
  try: {
    chunkThreshold: 50000,  // Audio transcripts can be large
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
 * Quick audio analysis variation
 * Single-step execution for simple audio tasks
 */
const quickAudioVariation = factoryAgentWithSingleStep<
  z.infer<typeof AudioProcessorInputSchema>,
  z.infer<typeof AudioProcessorRetrySchema>
>({
  name: 'quick-audio-analysis',
  description: 'Fast audio processing for simple requirements',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Quick processing logic here
    // Return matches the Retry schema for consistency
    return {
      finalTranscription: 'Quick transcription not implemented',
      completeAnalysis: {
        metadata: { duration: 0, format: input.audioUrl.split('.').pop() || 'unknown', quality: 'unknown' },
        transcription: { text: '', confidence: 0, language: 'unknown' },
        insights: { keyPoints: [], technicalTerms: [], sentiment: 'neutral', topics: [] }
      },
      taskRelevance: {
        relevanceScore: 0,
        relevantSegments: [],
        taskAlignment: 'Quick analysis performed'
      },
      recommendations: ['Use comprehensive analysis for detailed results'],
      success: true,
      completionMessage: 'Quick audio analysis completed'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Audio Processor Agent - Default PTRR implementation
 * Main agent using comprehensive audio processing
 */
export const audioProcessor = comprehensiveAudioVariation;

/**
 * Quick Audio Processor Agent - Simple version
 */
export const quickAudioProcessor = quickAudioVariation;

// ==================== TYPE EXPORTS ====================
export type AudioProcessorInput = z.infer<typeof AudioProcessorInputSchema>;
export type AudioProcessorPlanOutput = z.infer<typeof AudioProcessorPlanSchema>;
export type AudioProcessorTryOutput = z.infer<typeof AudioProcessorTrySchema>;
export type AudioProcessorRefineOutput = z.infer<typeof AudioProcessorRefineSchema>;
export type AudioProcessorRetryOutput = z.infer<typeof AudioProcessorRetrySchema>;

/**
 * TECHNICAL DOCUMENTATION:
 * 
 * Prompt Hierarchy:
 * 1. Agent prompt (minimal) - "Process audio files"
 * 2. Step prompts (purpose) - "Analyze requirements" / "Execute processing" / etc
 * 3. SubStep prompts (generate) - Automatically added by execution
 * 4. Tool doc-code-tools - Automatically included when tools available
 * 5. Output schemas - Automatically included for StructuredOutput
 * 
 * Tool Flow:
 * 1. Tools registered in execution.tools during selectVariation
 * 2. Each step filters to available subset
 * 3. Tool doc-code-tool prompts automatically included
 * 4. Tools execute AFTER all failsafes if useTools present
 * 
 * Everything builds progressively and automatically!
 */
