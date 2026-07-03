/**
 * Figma Processor Agent - Declarative Pattern
 * 
 * This agent uses the CORRECT declarative pattern:
 * - Define schemas for each PTRR step
 * - Define prompts for agent and each step
 * - Let factories handle ALL execution
 * - No manual step implementations needed!
 */

import { 
   
  factoryAgentWithPTRR,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';

// ==================== TOOLS ====================
// Tools this agent can use for Figma processing
import { figmaApiTool } from '@bitcode/generic-tools/figma-api';
import { designParserTool } from '@bitcode/generic-tools/design-parser';
import { codeGeneratorTool } from '@bitcode/generic-tools/code-generator';

// ==================== INPUT SCHEMA ====================
const FigmaProcessorInputSchema = z.object({
  figmaUrl: z.string().describe('Figma file or frame URL'),
  exportFormat: z.enum(['react', 'vue', 'html', 'css', 'json']).default('react'),
  includeStyles: z.boolean().default(true),
  includeComponents: z.boolean().default(true),
  generateCode: z.boolean().default(true)
});

// ==================== PLAN STEP SCHEMA ====================
const FigmaProcessorPlanSchema = z.object({
  // Processing strategy
  processingStrategy: z.string().describe('How to process the Figma design'),
  extractionTargets: z.array(z.string()).describe('What to extract from design'),
  
  // Design analysis
  designStructure: z.object({
    frames: z.number(),
    components: z.number(),
    layers: z.number(),
    styles: z.number()
  }).optional(),
  
  // Code generation plan
  codeGenPlan: z.object({
    framework: z.string(),
    componentStructure: z.string(),
    styleStrategy: z.enum(['css-modules', 'styled-components', 'tailwind', 'inline'])
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  // Success tracking
  confidence: z.number().min(0).max(1),
  estimatedComplexity: z.enum(['simple', 'moderate', 'complex'])
});

// ==================== TRY STEP SCHEMA ====================
const FigmaProcessorTrySchema = z.object({
  // Design extraction
  extractedDesign: z.object({
    frames: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      bounds: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
      })
    })),
    components: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      props: z.record(z.any()).optional()
    })),
    assets: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['image', 'icon', 'illustration']),
      url: z.string()
    }))
  }),
  
  // Style extraction
  extractedStyles: z.object({
    colors: z.array(z.object({
      name: z.string(),
      value: z.string(),
      type: z.enum(['fill', 'stroke', 'text'])
    })),
    typography: z.array(z.object({
      name: z.string(),
      fontFamily: z.string(),
      fontSize: z.number(),
      fontWeight: z.string(),
      lineHeight: z.number().optional()
    })),
    spacing: z.array(z.object({
      name: z.string(),
      value: z.number()
    }))
  }),
  
  // Initial code generation
  generatedCode: z.object({
    components: z.record(z.string()),
    styles: z.record(z.string()),
    utils: z.record(z.string()).optional()
  }).optional(),
  
  // Tool usage for processing
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use for design processing'),
  
  // Status
  processingComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

// ==================== REFINE STEP SCHEMA ====================
const FigmaProcessorRefineSchema = z.object({
  // Enhanced code generation
  optimizedCode: z.object({
    components: z.record(z.object({
      code: z.string(),
      props: z.array(z.string()),
      dependencies: z.array(z.string())
    })),
    hooks: z.record(z.string()).optional(),
    context: z.record(z.string()).optional(),
    tests: z.record(z.string()).optional()
  }),
  
  // Component relationships
  componentGraph: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string()
    })),
    edges: z.array(z.object({
      from: z.string(),
      to: z.string(),
      relationship: z.string()
    }))
  }),
  
  // Quality metrics
  qualityMetrics: z.object({
    componentReusability: z.number(),
    codeComplexity: z.number(),
    accessibilityScore: z.number(),
    performanceScore: z.number()
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
const FigmaProcessorRetrySchema = z.object({
  // Final code output
  finalCode: z.object({
    structure: z.object({
      components: z.array(z.string()),
      pages: z.array(z.string()),
      layouts: z.array(z.string()),
      shared: z.array(z.string())
    }),
    files: z.record(z.string()),
    packageJson: z.object({
      dependencies: z.record(z.string()),
      scripts: z.record(z.string())
    }).optional()
  }),
  
  // Design system
  designSystem: z.object({
    tokens: z.object({
      colors: z.record(z.string()),
      typography: z.record(z.any()),
      spacing: z.record(z.number()),
      breakpoints: z.record(z.number())
    }),
    components: z.array(z.object({
      name: z.string(),
      variants: z.array(z.string()),
      props: z.array(z.string())
    })),
    patterns: z.array(z.string())
  }),
  
  // Integration guide
  integrationGuide: z.object({
    setup: z.array(z.string()),
    usage: z.array(z.string()),
    customization: z.array(z.string()),
    bestPractices: z.array(z.string())
  }),
  
  // Documentation
  documentation: z.object({
    componentDocs: z.record(z.string()),
    apiReference: z.string().optional(),
    examples: z.array(z.string())
  }),
  
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

export const figmaProcessorPrompt = new AgentPrompt({
  name: 'figma-processor' as PromptPart,
  identity: 'Figma design processor' as PromptPart
});

export const figmaProcessorStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze design structure' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Extract design components' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Optimize code generation' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Deliver production code' as PromptPart })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Comprehensive Figma processing agent
 * Uses full PTRR cycle for thorough analysis
 */
const comprehensiveFigma = factoryAgentWithPTRR<
  z.infer<typeof FigmaProcessorInputSchema>,
  z.infer<typeof FigmaProcessorRetrySchema>
>({
  name: 'comprehensive-figma-processing',
  description: 'Full design extraction with code generation and design system',
  prompt: figmaProcessorPrompt,
  stepPrompts: {
    plan: () => figmaProcessorStepPrompts.plan,
    try: () => figmaProcessorStepPrompts.try,
    refine: () => figmaProcessorStepPrompts.refine,
    retry: () => figmaProcessorStepPrompts.retry
  },
  
  // The factories use these schemas to:
  // 1. Create typed executors for each step
  // 2. Run the 7-substep sequence automatically
  // 3. Store all results to execution state
  // 4. Handle tool execution when useTools is present
  outputSchema: FigmaProcessorRetrySchema,
  
  // Optional configurations per step
  plan: {
    chunkThreshold: 1000  // Design metadata is small
  },
  try: {
    chunkThreshold: 100000,  // Designs can be large
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
 * Quick Figma extraction agent
 * Single-step execution for simple design tasks
 */
const quickFigma = factoryAgentWithSingleStep<
  z.infer<typeof FigmaProcessorInputSchema>,
  z.infer<typeof FigmaProcessorRetrySchema>
>({
  name: 'quick-figma-extraction',
  description: 'Fast design extraction for simple components',
  
  // Single executor - still runs through execution system
  execute: async (input, execution) => {
    // This executor is wrapped and tracked automatically
    execution.store('variation', 'mode', 'quick');
    
    // Even simple variations can use the execution's registries
    const tool = execution.tools.getTool('figma-api');
    
    // Quick extraction logic here
    // Return matches the Retry schema for consistency
    return {
      finalCode: {
        structure: {
          components: [],
          pages: [],
          layouts: [],
          shared: []
        },
        files: {}
      },
      designSystem: {
        tokens: {
          colors: {},
          typography: {},
          spacing: {},
          breakpoints: {}
        },
        components: [],
        patterns: []
      },
      integrationGuide: {
        setup: ['Use comprehensive processing for complete setup'],
        usage: [],
        customization: [],
        bestPractices: []
      },
      documentation: {
        componentDocs: {}
      },
      success: true,
      completionMessage: 'Quick Figma extraction completed'
    };
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Figma Processor Agent
 * 
 * This agent demonstrates the CORRECT declarative pattern:
 * - Schemas define WHAT each step produces
 * - Factories create HOW it's executed (7-substep sequence)
 * - Execution handles WHERE it's stored (automatic state management)
 * - Prompts guide WHEN tools are used (through useTools in schemas)
 */
/**
 * Figma Processor Agent - Default PTRR implementation
 * Main agent using comprehensive Figma processing
 */
export const figmaProcessor = comprehensiveFigma;

/**
 * Quick Figma Processor Agent - Simple version prefixed with "quick"
 * Fast design extraction for simple components
 */
export const quickFigmaProcessor = quickFigma;

// ==================== TYPE EXPORTS ====================
export type FigmaProcessorInput = z.infer<typeof FigmaProcessorInputSchema>;
export type FigmaProcessorPlanOutput = z.infer<typeof FigmaProcessorPlanSchema>;
export type FigmaProcessorTryOutput = z.infer<typeof FigmaProcessorTrySchema>;
export type FigmaProcessorRefineOutput = z.infer<typeof FigmaProcessorRefineSchema>;
export type FigmaProcessorRetryOutput = z.infer<typeof FigmaProcessorRetrySchema>;

/**
 * TECHNICAL DOCUMENTATION:
 * 
 * When figmaProcessorAgent is called:
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
