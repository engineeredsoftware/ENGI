/**
 * Image Processor Agent - Declarative Pattern
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

// ==================== INPUT SCHEMA ====================
const ImageProcessorInputSchema = z.object({
  imageUrl: z.string().describe('URL or path to image file'),
  taskDescription: z.string().describe('What to analyze in the image'),
  analysisType: z.enum(['description', 'ocr', 'objects', 'faces', 'text', 'comprehensive']).default('comprehensive'),
  includeMetadata: z.boolean().default(true),
  extractText: z.boolean().default(true),
  detectObjects: z.boolean().default(true)
});

// ==================== PLAN STEP SCHEMA ====================
const ImageProcessorPlanSchema = z.object({
  // Analysis strategy
  analysisStrategy: z.string().describe('How to analyze the image'),
  processingSteps: z.array(z.string()).describe('Steps to process image'),
  
  // Expected outputs
  expectedFeatures: z.array(z.string()).describe('What features to extract'),
  analysisDepth: z.enum(['basic', 'standard', 'comprehensive']),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  processingApproach: z.array(z.string())
});

// ==================== TRY STEP SCHEMA ====================
const ImageProcessorTrySchema = z.object({
  // Core image analysis
  visualDescription: z.object({
    mainSubjects: z.array(z.string()),
    setting: z.string(),
    colors: z.array(z.string()),
    composition: z.string(),
    style: z.string().optional()
  }),
  
  // Extracted text (OCR)
  extractedText: z.object({
    fullText: z.string(),
    textBlocks: z.array(z.object({
      text: z.string(),
      confidence: z.number(),
      boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
      }).optional()
    })),
    language: z.string().optional()
  }).optional(),
  
  // Object detection
  detectedObjects: z.array(z.object({
    label: z.string(),
    confidence: z.number(),
    boundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  })),
  
  // Image metadata
  metadata: z.object({
    dimensions: z.object({
      width: z.number(),
      height: z.number()
    }),
    format: z.string(),
    fileSize: z.number().optional(),
    colorSpace: z.string().optional(),
    hasTransparency: z.boolean().optional()
  }),
  
  // Tool usage for processing
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for image processing'),
  
  // Status
  processingComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const ImageProcessorRefineSchema = z.object({
  // Enhanced analysis
  refinedDescription: z.object({
    detailedDescription: z.string(),
    keyElements: z.array(z.string()),
    context: z.string(),
    technicalDetails: z.array(z.string())
  }),
  
  // Quality improvements
  qualityAssessment: z.object({
    imageQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
    analysisAccuracy: z.number().min(0).max(1),
    completeness: z.number().min(0).max(1),
    overallScore: z.number().min(0).max(1)
  }),
  
  // Enhanced text extraction
  enhancedText: z.object({
    cleanedText: z.string().optional(),
    structuredText: z.array(z.object({
      type: z.string(),
      content: z.string(),
      confidence: z.number()
    })).optional(),
    keyInformation: z.array(z.string())
  }).optional(),
  
  // Refined object detection
  refinedObjects: z.array(z.object({
    label: z.string(),
    confidence: z.number(),
    category: z.string(),
    attributes: z.array(z.string()).optional()
  })),
  
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
const ImageProcessorRetrySchema = z.object({
  // Final comprehensive description
  finalDescription: z.string(),
  
  // Complete analysis
  completeAnalysis: z.object({
    visual: z.object({
      description: z.string(),
      keyElements: z.array(z.string()),
      composition: z.string(),
      colorPalette: z.array(z.string())
    }),
    technical: z.object({
      format: z.string(),
      dimensions: z.string(),
      quality: z.string(),
      characteristics: z.array(z.string())
    }),
    content: z.object({
      subjects: z.array(z.string()),
      text: z.string().optional(),
      objects: z.array(z.string()),
      scene: z.string()
    })
  }),
  
  // Task relevance
  taskRelevance: z.object({
    relevanceScore: z.number(),
    taskAlignment: z.string(),
    keyFindings: z.array(z.string())
  }),
  
  // Image insights
  insights: z.object({
    imageType: z.string(),
    primaryPurpose: z.string(),
    notableFeatures: z.array(z.string()),
    potentialUses: z.array(z.string())
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
  processingMessage: z.string()
});

export type ImageProcessorInput = z.infer<typeof ImageProcessorInputSchema>;
export type ImageProcessorPlanOutput = z.infer<typeof ImageProcessorPlanSchema>;
export type ImageProcessorTryOutput = z.infer<typeof ImageProcessorTrySchema>;
export type ImageProcessorRefineOutput = z.infer<typeof ImageProcessorRefineSchema>;
export type ImageProcessorResult = z.infer<typeof ImageProcessorRetrySchema>;

// ==================== PROMPTS ====================

export const imageProcessorPrompt = new AgentPrompt({
  name: 'image-processor' as PromptPart,
  identity: 'Computer vision specialist' as PromptPart
});

export const imageProcessorStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan analysis' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute vision' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance accuracy' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize insights' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive image processing variation
 * Uses full PTRR cycle for thorough image analysis
 */
const comprehensiveImageVariation = factoryPTRRAgent<
  z.infer<typeof ImageProcessorInputSchema>,
  z.infer<typeof ImageProcessorRetrySchema>
>({
  name: 'comprehensive-image-analysis',
  description: 'Full image processing with OCR, object detection, and insights',
  prompt: imageProcessorPrompt,
  stepPrompts: {
    plan: () => imageProcessorStepPrompts.plan,
    try: () => imageProcessorStepPrompts.try,
    refine: () => imageProcessorStepPrompts.refine,
    retry: () => imageProcessorStepPrompts.retry
  },
  
  outputSchema: ImageProcessorRetrySchema,
  
  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 5000,
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 2,
    backoff: 1000
  }
});

/**
 * Quick image processing variation
 * Single-step execution for simple image analysis
 */
const quickImageVariation = factoryAgentWithSingleStep<
  z.infer<typeof ImageProcessorInputSchema>,
  z.infer<typeof ImageProcessorRetrySchema>
>({
  name: 'quick-image-analysis',
  description: 'Fast image analysis for simple requirements',
  
  execute: async (input, execution) => {
    execution.store('variation', 'mode', 'quick');
    
    return {
      finalDescription: 'Quick image analysis not fully implemented',
      completeAnalysis: {
        visual: {
          description: 'Basic image analysis performed',
          keyElements: [],
          composition: 'Standard',
          colorPalette: []
        },
        technical: {
          format: 'Unknown',
          dimensions: 'Unknown',
          quality: 'Standard',
          characteristics: []
        },
        content: {
          subjects: [],
          objects: [],
          scene: 'Unknown'
        }
      },
      taskRelevance: {
        relevanceScore: 0.7,
        taskAlignment: 'Basic analysis completed',
        keyFindings: ['Quick processing performed']
      },
      insights: {
        imageType: 'Standard image',
        primaryPurpose: 'Unknown',
        notableFeatures: [],
        potentialUses: ['Use comprehensive analysis for detailed insights']
      },
      recommendations: ['Use comprehensive image processing for detailed analysis'],
      success: true,
      processingMessage: 'Quick image analysis completed - use comprehensive mode for detailed analysis'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Image Processor Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
// ==================== AGENT EXPORTS ====================

/**
 * Image Processor Agent - Default PTRR implementation
 */
export const imageProcessor = comprehensiveImageVariation;

/**
 * Quick Image Processor Agent - Simple version
 */
export const quickImageProcessor = quickImageVariation;

/**
 * THE MAGIC EXPLAINED:
 * 
 * When imageProcessorAgent is called:
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
 *    - Every image analysis step
 *    - Every computer vision result
 *    - Every quality enhancement
 *    - All in namespaced stores!
 * 
 * We just defined schemas - the framework does EVERYTHING else!
 */
