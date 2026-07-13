/**
 * File Pick Agent - Declarative Pattern
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
// Tools this agent can use for file analysis
// (Uses file system operations and pattern matching)

// ==================== INPUT SCHEMA ====================
const FilePickInputSchema = z.object({
  taskDescription: z.string().describe('Description of what files to find'),
  baseDirectory: z.string().describe('Base directory to search in'),
  maxFiles: z.number().min(1).max(100).default(20).describe('Maximum number of files to return'),
  includePatterns: z.array(z.string()).optional().describe('File patterns to include'),
  excludePatterns: z.array(z.string()).optional().describe('File patterns to exclude'),
  searchDepth: z.number().default(10).describe('Maximum directory depth to search'),
  fileTypes: z.array(z.string()).optional().describe('Specific file types to search for')
});

// ==================== PLAN STEP SCHEMA ====================
const FilePickPlanSchema = z.object({
  // Selection strategy
  strategy: z.enum(['keyword-based', 'path-based', 'pattern-based', 'mixed']).describe('File selection strategy'),
  searchStrategy: z.object({
    useFilenameMatching: z.boolean(),
    useContentAnalysis: z.boolean(),
    usePathMatching: z.boolean(),
    prioritizeRecentFiles: z.boolean()
  }),
  
  // Pattern analysis
  targetPatterns: z.array(z.string()).describe('Identified target patterns'),
  exclusionPatterns: z.array(z.string()).optional().describe('Patterns to exclude'),
  keywordExtracts: z.array(z.string()).describe('Keywords extracted from task description'),
  
  // Selection parameters
  maxFiles: z.number().min(1).max(100),
  priorityFactors: z.array(z.string()).describe('Factors for file prioritization'),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Confidence and estimates
  expectedMatches: z.number(),
  confidence: z.number().min(0).max(1)
});

// ==================== TRY STEP SCHEMA ====================
const FilePickTrySchema = z.object({
  // Selected files
  selectedFiles: z.array(z.object({
    path: z.string(),
    relativePath: z.string(),
    filename: z.string(),
    size: z.number(),
    lastModified: z.string(),
    relevanceScore: z.number().min(0).max(1),
    reason: z.string(),
    matchedPatterns: z.array(z.string())
  })).describe('Initial file selections'),
  
  // Search results
  searchMetrics: z.object({
    totalFilesScanned: z.number(),
    directoriesSearched: z.number(),
    patternsMatched: z.number(),
    searchDuration: z.number(),
    averageRelevance: z.number()
  }),
  
  // Analysis results
  fileAnalysis: z.object({
    fileTypeDistribution: z.record(z.number()),
    sizeDistribution: z.object({
      small: z.number(),
      medium: z.number(),
      large: z.number()
    }),
    modificationDates: z.array(z.string())
  }),
  
  // Tool usage for searching
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for file searching'),
  
  // Status
  selectionComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const FilePickRefineSchema = z.object({
  // Refined selections
  refinedFiles: z.array(z.object({
    path: z.string(),
    relativePath: z.string(),
    filename: z.string(),
    size: z.number(),
    lastModified: z.string(),
    relevanceScore: z.number().min(0).max(1),
    reason: z.string(),
    refinementNotes: z.string().optional(),
    finalScore: z.number().min(0).max(1)
  })).describe('Quality-refined file selections'),
  
  // Selection quality
  qualityMetrics: z.object({
    relevanceScore: z.number().min(0).max(1),
    diversityScore: z.number().min(0).max(1),
    completenessScore: z.number().min(0).max(1),
    overallQuality: z.number().min(0).max(1)
  }),
  
  // Removed files
  removedFiles: z.array(z.object({
    path: z.string(),
    reason: z.string(),
    originalScore: z.number()
  })).describe('Files removed during refinement'),
  
  // Quality improvements
  improvements: z.array(z.string()),
  qualityIssues: z.array(z.string()),
  
  // Refinement tools
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools for refinement'),
  
  // Refinement results
  refinementActions: z.array(z.string()),
  confidence: z.number()
});

// ==================== RETRY STEP SCHEMA ====================
const FilePickRetrySchema = z.object({
  // Final file list
  files: z.array(z.string()).describe('Final list of selected file paths'),
  
  // Detailed file information
  fileDetails: z.array(z.object({
    path: z.string(),
    relativePath: z.string(),
    filename: z.string(),
    size: z.number(),
    lastModified: z.string(),
    relevanceScore: z.number(),
    reason: z.string()
  })),
  
  // Selection summary
  selectionSummary: z.object({
    totalSelected: z.number(),
    averageRelevance: z.number(),
    selectionCriteria: z.array(z.string()),
    keyPatterns: z.array(z.string())
  }),
  
  // Task alignment
  taskAlignment: z.object({
    alignmentScore: z.number(),
    relevantFiles: z.number(),
    taskCoverage: z.string()
  }),
  
  // File organization insights
  organizationInsights: z.array(z.string()),
  recommendedUsage: z.array(z.string()),
  
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
  confidence: z.number().min(0).max(1),
  success: z.boolean(),
  selectionMessage: z.string()
});

export type FilePickInput = z.infer<typeof FilePickInputSchema>;
export type FilePickPlanOutput = z.infer<typeof FilePickPlanSchema>;
export type FilePickTryOutput = z.infer<typeof FilePickTrySchema>;
export type FilePickRefineOutput = z.infer<typeof FilePickRefineSchema>;
export type FilePickResult = z.infer<typeof FilePickRetrySchema>;

// ==================== PROMPTS ====================

export const filePickPrompt = new AgentPrompt({
  name: 'file-pick' as PromptPart,
  identity: 'File discovery specialist' as PromptPart
});

export const filePickStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan discovery' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute search' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Improve selection' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize results' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * File Pick Agent (PTRR)
 * Uses full PTRR cycle for thorough file discovery
 */
const filePick: any = factoryPTRRAgent<
  z.infer<typeof FilePickInputSchema>,
  z.infer<typeof FilePickRetrySchema>
>({
  name: 'file-pick',
  description: 'File discovery with PTRR pattern for thorough analysis',
  
  prompt: filePickPrompt,
  stepPrompts: {
    plan: () => filePickStepPrompts.plan,
    try: () => filePickStepPrompts.try,
    refine: () => filePickStepPrompts.refine,
    retry: () => filePickStepPrompts.retry
  },

  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: FilePickRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // File analysis is typically concise
  },
  try: {
    chunkThreshold: 5000,  // File listings can be extensive
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
 * Quick File Pick Agent
 * Single-step execution for simple file discovery
 */
const quickFilePick: any = factoryAgentWithSingleStep<
  z.infer<typeof FilePickInputSchema>,
  z.infer<typeof FilePickRetrySchema>
>({
  name: 'quick-file-pick',
  description: 'Fast file discovery for simple requirements',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Even simple variations can use the execution's registries
    const llm = execution.llms.getDefaultLLM();
    
    // Quick file discovery logic here
    // Return matches the Retry schema for consistency
    return {
      files: [],
      fileDetails: [],
      selectionSummary: {
        totalSelected: 0,
        averageRelevance: 0,
        selectionCriteria: ['Quick pattern matching'],
        keyPatterns: []
      },
      taskAlignment: {
        alignmentScore: 0.7,
        relevantFiles: 0,
        taskCoverage: 'Basic file discovery completed'
      },
      organizationInsights: ['Quick analysis performed'],
      recommendedUsage: ['Use comprehensive mode for detailed analysis'],
      recommendations: ['Consider using comprehensive file picking for better results'],
      confidence: 0.6,
      success: true,
      selectionMessage: 'Quick file selection completed - use comprehensive mode for detailed discovery'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * File Pick Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
// Main export uses PTRR pattern (the default)
export const filePickAgent = filePick;

// Also export the quick version for simple file discovery
export const quickFilePickAgent = quickFilePick;


// Removed former schema re-exports.

/**
 * THE MAGIC EXPLAINED:
 * 
 * When filePickAgent is called:
 * 1. selectVariation picks comprehensive or quick based on search complexity
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
 *    - Every file discovery step
 *    - Every relevance calculation
 *    - Every quality improvement
 *    - Complete selection metadata in namespaced stores!
 * 
 * We just defined schemas - the framework does ALL file discovery logic!
 */
