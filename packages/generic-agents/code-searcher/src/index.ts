
/**
 * Code Searcher Agent - Declarative Pattern
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

// ==================== TOOLS ====================
// Tools this agent can use for code searching
import {
  workspaceSymbolsTool,
  documentSymbolsTool,
  hoverInfoTool
} from '@bitcode/generic-tools-lsp-query';

// ==================== INPUT SCHEMA ====================
const CodeSearchInputSchema = z.object({
  taskDescription: z.string().describe('Description of what code to search for'),
  files: z.array(z.string()).describe('List of files to search in'),
  maxSnippets: z.number().min(1).max(50).default(20).describe('Maximum number of snippets to return'),
  fileTracker: z.any().describe('File tracker instance for content access')
});

// ==================== PLAN STEP SCHEMA ====================
const CodeSearcherPlanSchema = z.object({
  // Search strategy
  searchStrategy: z.string().describe('Strategy for semantic code search'),
  filesToSearch: z.array(z.string()).describe('Prioritized list of files to search'),
  semanticKeywords: z.array(z.string()).describe('Extracted semantic keywords'),
  searchPriority: z.array(z.string()).describe('File search priority order'),
  
  // Analysis approach
  lspStrategy: z.object({
    useWorkspaceSymbols: z.boolean(),
    useDocumentSymbols: z.boolean(),
    useHoverInfo: z.boolean(),
    keywordPriority: z.array(z.string())
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Expected results
  expectedSnippetCount: z.number().describe('Expected number of snippets to find'),
  confidence: z.number().min(0).max(1)
});

// ==================== TRY STEP SCHEMA ====================
const CodeSearcherTrySchema = z.object({
  // Core search results
  snippets: z.array(z.object({
    file: z.string().describe('Relative file path'),
    snippet: z.string().describe('Code snippet content'),
    startLine: z.number().describe('Starting line number'),
    endLine: z.number().describe('Ending line number'),
    relevance: z.number().min(0).max(1).describe('Relevance score'),
    reason: z.string().describe('Reason for inclusion')
  })).describe('Found code snippets'),
  
  // Search execution metrics
  searchMetrics: z.object({
    totalFilesScanned: z.number(),
    snippetsFound: z.number(),
    lspSearchUsed: z.boolean(),
    fallbackSearchUsed: z.boolean(),
    averageRelevance: z.number(),
    keywordsMatched: z.array(z.string())
  }).describe('Search execution metrics'),
  
  // LSP analysis results
  lspResults: z.object({
    workspaceSymbolsFound: z.number(),
    documentSymbolsAnalyzed: z.number(),
    hoverInfoExtracted: z.number(),
    semanticMatches: z.array(z.object({
      symbol: z.string(),
      file: z.string(),
      relevance: z.number()
    }))
  }).optional(),
  
  // Tool usage for searching
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for code searching'),
  
  // Status
  searchComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const CodeSearcherRefineSchema = z.object({
  // Quality assessment
  snippetQuality: z.object({
    relevance: z.number().min(0).max(1),
    diversity: z.number().min(0).max(1),
    completeness: z.number().min(0).max(1),
    overallScore: z.number().min(0).max(1)
  }).describe('Quality assessment metrics'),
  
  // Filtered results
  filteredSnippets: z.array(z.object({
    file: z.string(),
    snippet: z.string(),
    startLine: z.number(),
    endLine: z.number(),
    relevance: z.number(),
    reason: z.string(),
    qualityScore: z.number(),
    tags: z.array(z.string()).optional()
  })).describe('Quality-filtered and enhanced snippets'),
  
  // Quality analysis
  improvements: z.array(z.string()).describe('Suggested improvements'),
  qualityIssues: z.array(z.string()).describe('Identified quality issues'),
  
  // Enhancement tools
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
const CodeSearcherRetrySchema = z.object({
  // Final processed results
  snippets: z.array(z.object({
    file: z.string(),
    snippet: z.string(),
    startLine: z.number(),
    endLine: z.number(),
    relevance: z.number(),
    reason: z.string()
  })).describe('Final processed code snippets'),
  
  // Code insights and patterns
  insights: z.array(z.string()).describe('Code insights and patterns'),
  codePatterns: z.array(z.object({
    pattern: z.string(),
    description: z.string(),
    examples: z.array(z.string()),
    frequency: z.number()
  })).describe('Identified code patterns'),
  
  // Task alignment
  taskRelevance: z.number().min(0).max(1).describe('Overall task relevance score'),
  implementationGuidance: z.array(z.string()).describe('Implementation guidance'),
  
  // Framework analysis
  frameworkInsights: z.object({
    frameworks: z.array(z.string()),
    patterns: z.array(z.string()),
    bestPractices: z.array(z.string())
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
  feedback: z.string()
});

export type CodeSearchInput = z.infer<typeof CodeSearchInputSchema>;
export type CodeSearchPlanOutput = z.infer<typeof CodeSearcherPlanSchema>;
export type CodeSearchTryOutput = z.infer<typeof CodeSearcherTrySchema>;
export type CodeSearchRefineOutput = z.infer<typeof CodeSearcherRefineSchema>;
export type CodeSearchResult = z.infer<typeof CodeSearcherRetrySchema>;

// ==================== PROMPTS ====================

/**
 * Agent-level prompt - MINIMAL
 * Only what applies to EVERY LLM call in this agent
 * 
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Provide minimal code search context"
 * current_version: "V26.50.0"
 */
export const codeSearcherPrompt = new AgentPrompt({
  name: 'code-searcher' as PromptPart,
  identity: 'Search and analyze code' as PromptPart  // Ultra-minimal
});

/**
 * Step-specific prompts - Just the purpose
 * These are progressively more specific
 */
export const codeSearcherStepPrompts = {
  plan: new AgentStepPrompt({
    purpose: 'Analyze search requirements' as PromptPart
  }),
  try: new AgentStepPrompt({
    purpose: 'Execute code search' as PromptPart
  }),
  refine: new AgentStepPrompt({
    purpose: 'Enhance search results' as PromptPart
  }),
  retry: new AgentStepPrompt({
    purpose: 'Complete code analysis' as PromptPart
  })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive code search agent
 * Uses full PTRR cycle for thorough analysis
 */
const comprehensiveSearch: any = factoryPTRRAgent<
  z.infer<typeof CodeSearchInputSchema>,
  z.infer<typeof CodeSearcherRetrySchema>
>({
  name: 'comprehensive-search',
  description: 'Full semantic code search with LSP analysis and quality refinement',
  
  prompt: codeSearcherPrompt,
  stepPrompts: {
    plan: () => codeSearcherStepPrompts.plan,
    try: () => codeSearcherStepPrompts.try,
    refine: () => codeSearcherStepPrompts.refine,
    retry: () => codeSearcherStepPrompts.retry
  },

  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: CodeSearcherRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Planning data is typically small
  },
  try: {
    chunkThreshold: 5000,  // Code snippets can be large
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
 * Quick code search agent
 * Single-step execution for simple searches
 */
const quickSearch: any = factoryAgentWithSingleStep<
  z.infer<typeof CodeSearchInputSchema>,
  z.infer<typeof CodeSearcherRetrySchema>
>({
  name: 'quick-search',
  description: 'Fast code search for simple requirements',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Even simple variations can use the execution's registries
    const llm = execution.llms.getDefaultLLM();
    
    // Quick search logic here
    // Return matches the Retry schema for consistency
    return {
      snippets: [],
      insights: ['Quick search not fully implemented'],
      codePatterns: [],
      taskRelevance: 0.5,
      implementationGuidance: ['Use comprehensive search for better results'],
      frameworkInsights: {
        frameworks: [],
        patterns: [],
        bestPractices: []
      },
      recommendations: ['Consider using comprehensive search mode'],
      success: true,
      feedback: 'Quick search completed - use comprehensive mode for detailed analysis'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Code Searcher Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
/**
 * Code Searcher Agent - Default PTRR implementation
 * Main agent using comprehensive code search
 */
export const codeSearcher = comprehensiveSearch;

/**
 * Quick Code Searcher Agent - Simple version prefixed with "quick"
 * Fast code search for simple requirements
 */
export const quickCodeSearcher = quickSearch;

/**
 * Preferred exports with consistent Agent suffix naming
 */
export const codeSearcherAgent = codeSearcher;
export const quickCodeSearcherAgent = quickCodeSearcher;

// Removed former exports.

/**
 * THE MAGIC EXPLAINED:
 * 
 * When codeSearcherAgent is called:
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
