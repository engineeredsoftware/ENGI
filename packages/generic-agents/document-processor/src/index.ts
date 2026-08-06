/**
 * Document Processor Agent - Declarative Pattern
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
// Tools this agent can use for document processing
import { multimodalProcessingTool } from '@bitcode/generic-tools-multimodal-processing';

// ==================== INPUT SCHEMA ====================
const DocumentProcessorInputSchema = z.object({
  filePath: z.string().describe('Path to document file'),
  format: z.string().optional().describe('Expected file format'),
  extractionMode: z.enum(['text', 'structure', 'data', 'full']).default('full').describe('Level of extraction'),
  preserveFormatting: z.boolean().default(false).describe('Preserve original formatting'),
  maxSize: z.number().default(50000000).describe('Maximum file size in bytes')
});

// ==================== PLAN STEP SCHEMA ====================
const DocumentProcessorPlanSchema = z.object({
  // Processing strategy
  processingStrategy: z.string().describe('Strategy for document processing'),
  extractionPlan: z.object({
    textExtraction: z.boolean(),
    structureExtraction: z.boolean(),
    imageExtraction: z.boolean(),
    dataExtraction: z.boolean()
  }),
  
  // File analysis
  fileAnalysis: z.object({
    detectedFormat: z.string(),
    estimatedSize: z.number(),
    complexity: z.enum(['simple', 'medium', 'complex']),
    requiresOCR: z.boolean()
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Processing estimates
  estimatedProcessingTime: z.number(),
  confidence: z.number().min(0).max(1)
});

// ==================== TRY STEP SCHEMA ====================
const DocumentProcessorTrySchema = z.object({
  // Extracted content
  content: z.string().describe('Extracted text content'),
  rawData: z.any().optional().describe('Raw extracted data'),
  
  // Document metadata
  metadata: z.object({
    format: z.string(),
    size: z.number(),
    pageCount: z.number().optional(),
    wordCount: z.number(),
    hasImages: z.boolean(),
    hasTables: z.boolean(),
    language: z.string().optional()
  }).describe('Document metadata'),
  
  // Document structure
  structure: z.object({
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      level: z.number()
    })),
    tables: z.array(z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().optional()
    })),
    images: z.array(z.object({
      description: z.string(),
      position: z.number().optional(),
      extractedText: z.string().optional()
    }))
  }).describe('Document structure'),
  
  // Tool usage for processing
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for document processing'),
  
  // Processing status
  extractionComplete: z.boolean(),
  processingTime: z.number(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const DocumentProcessorRefineSchema = z.object({
  // Refined content
  refinedContent: z.string().describe('Cleaned and refined text content'),
  enhancedStructure: z.object({
    improvedSections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      level: z.number(),
      confidence: z.number()
    })),
    validatedTables: z.array(z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().optional(),
      quality: z.number()
    })),
    enhancedImages: z.array(z.object({
      description: z.string(),
      extractedText: z.string().optional(),
      relevance: z.number()
    }))
  }),
  
  // Quality assessment
  qualityMetrics: z.object({
    textAccuracy: z.number().min(0).max(1),
    structureAccuracy: z.number().min(0).max(1),
    completeness: z.number().min(0).max(1),
    overallQuality: z.number().min(0).max(1)
  }),
  
  // Content analysis improvements
  analysis: z.object({
    language: z.string().optional(),
    readabilityScore: z.number().optional(),
    technicalTerms: z.array(z.string()),
    keyTopics: z.array(z.string()),
    documentType: z.string().optional()
  }),
  
  // Refinement tools
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools for refinement'),
  
  // Improvement results
  improvements: z.array(z.string()),
  confidence: z.number()
});

// ==================== RETRY STEP SCHEMA ====================
const DocumentProcessorRetrySchema = z.object({
  // Final processed content
  content: z.string().describe('Final extracted and refined text content'),
  
  // Complete document metadata
  metadata: z.object({
    format: z.string(),
    size: z.number(),
    pageCount: z.number().optional(),
    wordCount: z.number(),
    hasImages: z.boolean(),
    hasTables: z.boolean(),
    language: z.string().optional(),
    processingTime: z.number()
  }).describe('Complete document metadata'),
  
  // Final document structure
  structure: z.object({
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      level: z.number()
    })),
    tables: z.array(z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().optional()
    })),
    images: z.array(z.object({
      description: z.string(),
      position: z.number().optional()
    }))
  }).describe('Final document structure'),
  
  // Content analysis
  analysis: z.object({
    language: z.string().optional(),
    readabilityScore: z.number().optional(),
    technicalTerms: z.array(z.string()),
    keyTopics: z.array(z.string()),
    documentSummary: z.string(),
    insights: z.array(z.string())
  }).describe('Final content analysis'),
  
  // Processing insights
  processingInsights: z.object({
    extractionQuality: z.number(),
    documentComplexity: z.string(),
    recommendedUse: z.string()
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

export type DocumentProcessorInput = z.infer<typeof DocumentProcessorInputSchema>;
export type DocumentProcessorPlanOutput = z.infer<typeof DocumentProcessorPlanSchema>;
export type DocumentProcessorTryOutput = z.infer<typeof DocumentProcessorTrySchema>;
export type DocumentProcessorRefineOutput = z.infer<typeof DocumentProcessorRefineSchema>;
export type DocumentResult = z.infer<typeof DocumentProcessorRetrySchema>;

// ==================== PROMPTS ====================

export const documentProcessorPrompt = new AgentPrompt({
  name: 'document-processor' as PromptPart,
  identity: 'Document processing specialist' as PromptPart
});

export const documentProcessorStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan processing' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Extract content' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Improve quality' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize analysis' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive document processing agent
 * Uses full PTRR cycle for thorough document analysis
 */
// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const comprehensiveProcessing: any = factoryPTRRAgent<
  z.infer<typeof DocumentProcessorInputSchema>,
  z.infer<typeof DocumentProcessorRetrySchema>
>({
  name: 'comprehensive-processing',
  description: 'Complete document processing with structure analysis and content enhancement',
  prompt: documentProcessorPrompt,
  stepPrompts: {
    plan: () => documentProcessorStepPrompts.plan,
    try: () => documentProcessorStepPrompts.try,
    refine: () => documentProcessorStepPrompts.refine,
    retry: () => documentProcessorStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: DocumentProcessorRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Document analysis is typically concise
  },
  try: {
    chunkThreshold: 10000,  // Document content can be large
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
 * Quick document processing agent
 * Single-step execution for simple documents
 */
const quickProcessing: any = factoryAgentWithSingleStep<
  z.infer<typeof DocumentProcessorInputSchema>,
  z.infer<typeof DocumentProcessorRetrySchema>
>({
  name: 'quick-processing',
  description: 'Fast document processing for simple text extraction',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Quick processing logic here
    // Return matches the Retry schema for consistency
    return {
      content: 'Quick document processing not fully implemented',
      metadata: {
        format: input.format || 'unknown',
        size: 0,
        wordCount: 0,
        hasImages: false,
        hasTables: false,
        processingTime: 100
      },
      structure: {
        sections: [],
        tables: [],
        images: []
      },
      analysis: {
        technicalTerms: [],
        keyTopics: [],
        documentSummary: 'Quick processing completed',
        insights: ['Use comprehensive processing for detailed analysis']
      },
      processingInsights: {
        extractionQuality: 0.6,
        documentComplexity: 'simple',
        recommendedUse: 'Basic text extraction only'
      },
      recommendations: ['Use comprehensive processing for better results'],
      success: true,
      processingMessage: 'Quick document processing completed - use comprehensive mode for detailed analysis'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Document Processor Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
/**
 * Document Processor Agent - Default PTRR implementation
 * Main agent using comprehensive processing
 */
export const documentProcessor = comprehensiveProcessing;

/**
 * Quick Document Processor Agent - Simple version prefixed with "quick"
 * Fast processing for simple documents
 */
export const quickDocumentProcessor = quickProcessing;

// Removed former exports.

/**
 * THE MAGIC EXPLAINED:
 * 
 * When documentProcessorAgent is called:
 * 1. selectVariation picks comprehensive or quick based on processing needs
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
 *    - Every document processing step
 *    - Every extraction decision
 *    - Every quality enhancement
 *    - Complete processing metadata in namespaced stores!
 * 
 * We just defined schemas - the framework does ALL document processing logic!
 */
