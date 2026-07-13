import { PROMPTPART_SPECIFIC_AGENT_DIGESTER_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_digester_identity';
import { PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRPLAN_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_digester_ptrrplan_purpose';
import { PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRTRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_digester_ptrrtry_purpose';
import { PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRREFINE_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_digester_ptrrrefine_purpose';
import { PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRRETRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_digester_ptrrretry_purpose';


/**
 * Digester Agent - Declarative Pattern
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
// TODO: Import actual prompt parts when they exist





import { z } from 'zod';

// ==================== TOOLS ====================
// Tools this agent can use for repository analysis
import { generateDigest as generateDigestCore } from './generate-digest';
import { ExecutionTool } from '@bitcode/execution-generics';
import * as fs from 'fs';

// Create a proper tool wrapper for the digest generation
/**
 * @doc-code-tool
 * name: DigestGeneratorTool
 * intent: "Attach runtime Prompt for digest generation tool"
 * @prompt DOC_CODE_TOOL_DIGEST_GENERATOR_PROMPT
 */
class DigestGeneratorTool extends ExecutionTool<(input: any) => Promise<any>> {
  name = 'generateDigest';
  description = 'Generates a comprehensive digest of a repository';
  
  async execute(input: any) {
    // Store tool execution start
    if (this.execution) {
      this.execution.store('tool', 'generateDigest:start', new Date().toISOString());
    }
    
    // Call the core digest generation function
    const result = await generateDigestCore(input);
    
    // Read the generated digest content
    const digestContent = fs.existsSync(result.digestPath)
      ? fs.readFileSync(result.digestPath, 'utf-8')
      : 'Digest file not found';
    
    // Store result in execution
    if (this.execution) {
      this.execution.store('tool', 'generateDigest:result', {
        digestPath: result.digestPath,
        stats: result.stats
      });
    }
    
    // Return both the result and content for the agent to use
    return {
      ...result,
      digestContent
    };
  }
}

const digestGeneratorTool = new DigestGeneratorTool();

// ==================== INPUT SCHEMA ====================
const DigesterInputSchema = z.object({
  correlationId: z.string().optional().describe('Correlation ID for tracking'),
  connectionId: z.number().optional().describe('Connection ID'),
  owner: z.string().optional().describe('Repository owner'),
  repo: z.string().optional().describe('Repository name'),
  branch: z.string().optional().describe('Branch to analyze'),
  dataStream: z.any().optional().describe('Data stream for results'),
  forceRegenerate: z.boolean().default(false).describe('Force regeneration of digest'),
  maxWorkers: z.number().optional().describe('Maximum worker processes'),
  debug: z.boolean().default(false).describe('Enable debug logging'),
  fileFilter: z.any().optional().describe('File filtering options'),
  usePreClonedRepo: z.boolean().default(false).describe('Use pre-cloned repository'),
  rootDir: z.string().optional().describe('Root directory to analyze'),
  dryRun: z.boolean().default(false).describe('Dry run mode'),
  path: z.string().optional().describe('Specific path to analyze'),
  maxFiles: z.number().optional().describe('Maximum files to process'),
  commit: z.string().optional().describe('Specific commit to analyze')
});

// ==================== PLAN STEP SCHEMA ====================
const DigesterPlanSchema = z.object({
  // Repository analysis strategy
  needsUpdate: z.boolean().describe('Whether digest needs update'),
  existingDigestPath: z.string().optional().describe('Path to existing digest'),
  repositoryStructure: z.object({
    totalFiles: z.number(),
    codeFiles: z.number(),
    configFiles: z.number(),
    documentFiles: z.number()
  }).describe('Repository structure analysis'),
  
  // Processing strategy
  analysisStrategy: z.string().describe('Strategy for digest generation'),
  processingApproach: z.object({
    useParallelProcessing: z.boolean(),
    enableCaching: z.boolean(),
    prioritizeCodeFiles: z.boolean(),
    includeConfiguration: z.boolean()
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Estimates
  estimatedDuration: z.number().describe('Estimated processing time in seconds'),
  confidence: z.number().min(0).max(1)
});

// ==================== TRY STEP SCHEMA ====================
const DigesterTrySchema = z.object({
  // Tool usage REQUIRED for digest generation
  useTools: z.array(z.object({
    name: z.literal('generateDigest').describe('Must use generateDigest tool'),
    input: z.object({
      correlationId: z.string().optional(),
      connectionId: z.number().optional(),
      owner: z.string().optional(),
      repo: z.string().optional(),
      branch: z.string().optional(),
      commit: z.string().optional(),
      rootDir: z.string().optional(),
      usePreClonedRepo: z.boolean().optional(),
      forceRegenerate: z.boolean().optional(),
      maxFiles: z.number().optional(),
      maxWorkers: z.number().optional(),
      debug: z.boolean().optional()
    }).describe('Input parameters for digest generation'),
    reason: z.string().describe('Why generating digest with these parameters')
  })).min(1).describe('MUST use generateDigest tool to create the repository digest'),
  
  // Expected results after tool execution
  digestPath: z.string().describe('Path to generated digest file'),
  digestContent: z.string().describe('Generated digest content preview'),
  processedFiles: z.number().describe('Number of files processed'),
  
  // Processing metrics
  generationMetrics: z.object({
    processingTime: z.number(),
    workerCount: z.number(),
    cacheHits: z.number(),
    errors: z.number(),
    totalBytes: z.number()
  }).describe('Generation performance metrics'),
  
  // Content analysis
  fileCategories: z.record(z.number()).describe('Files by category counts'),
  contentSections: z.array(z.object({
    section: z.string(),
    lines: z.number(),
    quality: z.number()
  })).optional(),
  
  // Status
  generationComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const DigesterRefineSchema = z.object({
  // Quality assessment
  qualityMetrics: z.object({
    completeness: z.number().min(0).max(1),
    accuracy: z.number().min(0).max(1),
    usefulness: z.number().min(0).max(1),
    readability: z.number().min(0).max(1),
    overallScore: z.number().min(0).max(1)
  }).describe('Digest quality assessment'),
  
  // Enhanced content
  enhancedDigest: z.string().describe('Enhanced digest content'),
  missingAreas: z.array(z.string()).describe('Areas not covered'),
  improvements: z.array(z.string()).describe('Suggested improvements'),
  
  // Content enhancements
  addedSections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    priority: z.number()
  })),
  
  // Refinement tools
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools for refinement'),
  
  // Improvement results
  refinementActions: z.array(z.string()),
  confidence: z.number()
});

// ==================== RETRY STEP SCHEMA ====================
const DigesterRetrySchema = z.object({
  // Final digest output
  digestPath: z.string().describe('Path to generated digest file'),
  digestContent: z.string().describe('Final digest content'),
  
  // Repository insights
  repositoryInsights: z.array(z.string()).describe('Key repository insights'),
  architecturalPatterns: z.array(z.string()).describe('Identified architectural patterns'),
  
  // Development guidance
  recommendations: z.array(z.string()).describe('Development recommendations'),
  bestPractices: z.array(z.string()).describe('Identified best practices'),
  
  // Technical analysis
  technologyStack: z.array(z.object({
    technology: z.string(),
    usage: z.string(),
    files: z.array(z.string())
  })),
  
  // Quality metrics
  codeQualityIndicators: z.object({
    organizationScore: z.number(),
    documentationScore: z.number(),
    consistencyScore: z.number()
  }),
  
  // Final metadata
  metadata: z.object({
    generatedAt: z.string(),
    fileCount: z.number(),
    processingTime: z.number(),
    version: z.string(),
    digestSize: z.number()
  }).describe('Digest metadata'),
  
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

export type DigestInput = z.infer<typeof DigesterInputSchema>;
export type DigesterPlanOutput = z.infer<typeof DigesterPlanSchema>;
export type DigesterTryOutput = z.infer<typeof DigesterTrySchema>;
export type DigesterRefineOutput = z.infer<typeof DigesterRefineSchema>;
export type DigestResult = z.infer<typeof DigesterRetrySchema>;

// ==================== PROMPTS ====================

export const digesterPrompt = new AgentPrompt({
  name: 'digester',
  identity: PROMPTPART_SPECIFIC_AGENT_DIGESTER_IDENTITY
});

export const digesterStepPrompts = {
  plan: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRPLAN_PURPOSE }),
  try: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRTRY_PURPOSE }),
  refine: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRREFINE_PURPOSE }),
  retry: new AgentStepPrompt({ purpose: PROMPTPART_SPECIFIC_AGENT_DIGESTER_PTRRRETRY_PURPOSE })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive digest generation agent
 * Uses full PTRR cycle for thorough repository analysis
 */
const comprehensiveDigest: any = factoryPTRRAgent<
  z.infer<typeof DigesterInputSchema>,
  z.infer<typeof DigesterRetrySchema>
>({
  name: 'comprehensive-digest',
  description: 'Complete repository analysis with quality refinement and insights',
  prompt: digesterPrompt,
  stepPrompts: {
    plan: () => digesterStepPrompts.plan,
    try: () => digesterStepPrompts.try,
    refine: () => digesterStepPrompts.refine,
    retry: () => digesterStepPrompts.retry
  },
  
  // The factories use outputSchema to generate step schemas and enforce structured output
  outputSchema: DigesterRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 500  // Repository analysis is typically compact
  },
  try: {
    chunkThreshold: 5000,  // Digest content can be extensive
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 2,
    backoff: 2000
  }
});

/**
 * Quick digest generation agent
 * Single-step execution for simple repositories
 */
const quickDigest: any = factoryAgentWithSingleStep<
  z.infer<typeof DigesterInputSchema>,
  z.infer<typeof DigesterRetrySchema>
>({
  name: 'quick-digest',
  description: 'Fast digest generation for simple repositories',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Get the digest generator tool from registry
    const tool = execution.tools.getTool('generateDigest');
    if (!tool) {
      throw new Error('generateDigest tool not registered');
    }
    
    // Execute the tool with quick settings
    const result = await tool.execute({
      ...input,
      maxFiles: input.maxFiles || 50,  // Limit files for quick mode
      maxWorkers: 2,  // Use fewer workers for quick mode
      forceRegenerate: false  // Use cache in quick mode
    });
    
    // Parse insights from digest content
    const lines = result.digestContent.split('\n');
    const insights = lines
      .filter(line => line.startsWith('- ') || line.startsWith('* '))
      .slice(0, 5)
      .map(line => line.substring(2).trim());
    
    // Return matches the Retry schema for consistency
    return {
      digestPath: result.digestPath,
      digestContent: result.digestContent,
      repositoryInsights: insights.length > 0 ? insights : ['Repository analyzed'],
      architecturalPatterns: [],
      recommendations: ['Full analysis available with comprehensive mode'],
      bestPractices: ['See digest for details'],
      technologyStack: [],
      codeQualityIndicators: {
        organizationScore: 0.7,
        documentationScore: 0.5,
        consistencyScore: 0.6
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        fileCount: result.stats.filesProcessed,
        processingTime: result.stats.totalRuntimeMs / 1000,
        version: '2.0.0',
        digestSize: result.stats.digestSizeBytes
      },
      success: true,
      completionMessage: `Quick digest generated: ${result.stats.filesProcessed} files processed`
    };
  }
});

// ==================== AGENT EXPORTS ====================

/**
 * Digester Agent - Default PTRR implementation
 * Main agent using comprehensive digest generation
 * Creates and maintains comprehensive codebase analysis and documentation
 */
export const digester = comprehensiveDigest;

/**
 * Quick Digester Agent - Simple version prefixed with "quick"
 * Fast digest generation for simple repositories
 */
export const quickDigester = quickDigest;

// Stable agent alias
export const digesterAgent = digester;

/**
 * Helper to select appropriate digester agent based on input
 * Used by pipelines to determine which agent to retrieve from registry
 */
export function selectDigesterAgent(input: DigestInput): string {
  // Always prefer PTRR for comprehensive analysis
  const needsComprehensive = 
    input.forceRegenerate ||
    (input.maxFiles && input.maxFiles > 100) ||
    input.debug ||
    !input.dryRun;
  
  return needsComprehensive ? 'digester' : 'quickDigester';
}

// Removed former class wrappers and instance exports.

/**
 * THE MAGIC EXPLAINED:
 * 
 * When digesterAgent is called:
 * 1. selectVariation picks comprehensive or quick based on repository complexity
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
 *    - Every repository analysis step
 *    - Every digest generation decision
 *    - Every quality enhancement
 *    - Complete processing metadata in namespaced stores!
 * 
 * We just defined schemas - the framework does ALL digest generation logic!
 */

export { generateDigest, callLLMAPI } from './generate-digest';
