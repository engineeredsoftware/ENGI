/**
 * Conversation Agent - PTRR-based conversational experience agent
 * 
 * This agent follows the standard agent-generics pattern with:
 * - PTRR methodology (Plan-Try-Refine-Retry)
 * - Declarative schemas for each step
 * - Read-only tools for code exploration
 * - Pipeline triggering capabilities
 * 
 * @doc-comment-developing
 * domain: conversation
 * intent: "Power Bitcode Terminal conversations with repository understanding and admitted pipeline triggers"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPT_REGISTRY.1"
 */

import {
  factoryPTRRAgent,
  AgentPrompt,
  AgentStepPrompt
} from '@bitcode/agent-generics';
import { z } from 'zod';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_IDENTITY_DEFINITION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_identity_definition';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_NAME } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_name';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrplan_purpose';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRTRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrtry_purpose';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRREFINE_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrrefine_purpose';
import { PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrretry_purpose';

// Import VCS tools - we'll register these in the agent
// Note: The actual tools will be imported where the agent is used
// since they require server-side dependencies

// ==================== INPUT SCHEMA ====================
const ConversationInputSchema = z.object({
  message: z.string().describe('User message content'),
  tokens: z.array(z.object({
    type: z.enum(['attachment', 'source', 'pipeline_run']),
    text: z.string(),
    data: z.any().optional()
  })).optional().describe('Rich text tokens'),
  conversationId: z.string().describe('Conversation identifier'),
  userId: z.string().describe('User identifier'),
  repoPath: z.string().optional().describe('Repository path for digest'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('Conversation history')
});

// ==================== PLAN STEP SCHEMA ====================
const ConversationPlanSchema = z.object({
  // Understanding analysis
  messageIntent: z.string().describe('Primary intent of the user message'),
  requiresCodeExploration: z.boolean().describe('Whether code needs to be explored'),
  requiresPipelineExecution: z.boolean().describe('Whether pipeline execution is needed'),
  
  // Strategy
  responseStrategy: z.string().describe('Strategy for generating response'),
  toolsNeeded: z.array(z.string()).describe('Tools that will be needed'),
  
  // Context requirements
  contextNeeded: z.object({
    needsDigest: z.boolean(),
    needsCodeSearch: z.boolean(),
    needsFileReading: z.boolean(),
    needsHistory: z.boolean()
  }),
  
  // Tool planning
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools to use in plan phase'),
  
  confidence: z.number().min(0).max(1)
});

// ==================== TRY STEP SCHEMA ====================
const ConversationTrySchema = z.object({
  // Response generation
  response: z.string().describe('Generated response content'),
  
  // Code findings
  codeFindings: z.array(z.object({
    file: z.string(),
    relevance: z.string(),
    snippet: z.string().optional()
  })).optional(),
  
  // Pipeline suggestions
  pipelineSuggestions: z.array(z.object({
    type: z.enum(['shippable', 'measure']),
    task: z.string(),
    reasoning: z.string(),
    confidence: z.number()
  })).optional(),
  
  // Tool usage
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Tools used for exploration'),
  
  // Metadata
  responseType: z.enum(['informational', 'action-required', 'error']),
  complete: z.boolean()
});

// ==================== REFINE STEP SCHEMA ====================
const ConversationRefineSchema = z.object({
  // Enhanced response
  refinedResponse: z.string().describe('Refined and enhanced response'),
  
  // Formatting improvements
  formatting: z.object({
    hasCodeBlocks: z.boolean(),
    hasMarkdown: z.boolean(),
    hasReferences: z.boolean(),
    clarity: z.number().min(0).max(1)
  }),
  
  // Additional context
  additionalContext: z.array(z.string()).optional(),
  references: z.array(z.object({
    file: z.string(),
    line: z.number().optional(),
    description: z.string()
  })).optional(),
  
  // Quality assessment
  quality: z.object({
    relevance: z.number(),
    completeness: z.number(),
    accuracy: z.number(),
    helpfulness: z.number()
  }),
  
  // Tool usage for enhancement
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional(),
  
  improvements: z.array(z.string())
});

// ==================== RETRY STEP SCHEMA ====================
const ConversationRetrySchema = z.object({
  // Final response
  finalResponse: z.string().describe('Final polished response'),
  
  // Pipeline triggers if needed
  triggeredPipelines: z.array(z.object({
    type: z.enum(['shippable', 'measure']),
    task: z.string(),
    runId: z.string().optional(),
    status: z.enum(['triggered', 'pending', 'failed'])
  })).optional(),
  
  // Code references
  codeReferences: z.array(z.object({
    file: z.string(),
    line: z.number().optional(),
    purpose: z.string()
  })).optional(),
  
  // Next steps
  suggestedNextSteps: z.array(z.string()).optional(),
  
  // Final metadata
  metadata: z.object({
    responseLength: z.number(),
    toolsUsed: z.array(z.string()),
    confidence: z.number(),
    processingTime: z.number().optional()
  }),
  
  // Success indicator
  success: z.boolean(),
  feedback: z.string().optional()
});

export type ConversationInput = z.infer<typeof ConversationInputSchema>;
export type ConversationPlanOutput = z.infer<typeof ConversationPlanSchema>;
export type ConversationTryOutput = z.infer<typeof ConversationTrySchema>;
export type ConversationRefineOutput = z.infer<typeof ConversationRefineSchema>;
export type ConversationResult = z.infer<typeof ConversationRetrySchema>;

// ==================== PROMPTS ====================

/**
 * Agent-level prompt registry.
 * Only what applies to every LLM call in this agent.
 */
export const conversationAgentPrompt = new AgentPrompt({
  name: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_NAME,
  identity: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_IDENTITY_DEFINITION
});

/**
 * PTRR step Prompt registries.
 */
export const conversationStepPrompts = {
  plan: new AgentStepPrompt({
    purpose: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE
  }),
  try: new AgentStepPrompt({
    purpose: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRTRY_PURPOSE
  }),
  refine: new AgentStepPrompt({
    purpose: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRREFINE_PURPOSE
  }),
  retry: new AgentStepPrompt({
    purpose: PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE
  })
};

// ==================== AGENT CONFIGURATION ====================

/**
 * Full conversational variation with PTRR
 * Used for complex queries requiring deep understanding
 */
const comprehensiveConversationVariation = factoryPTRRAgent<
  z.infer<typeof ConversationInputSchema>,
  z.infer<typeof ConversationRetrySchema>
>({
  name: 'comprehensive-conversation',
  description: 'Full PTRR conversation with code understanding and pipeline capabilities',
  prompt: conversationAgentPrompt,
  stepPrompts: conversationStepPrompts,
  
  outputSchema: ConversationRetrySchema,
  
  plan: {
    chunkThreshold: 2000
  },
  try: {
    chunkThreshold: 8000,  // Responses can be long
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 2,
    backoff: 500
  }
});

/**
 * Quick response variation
 * Uses the same PTRR/Failsafe/Thinkings stack as the comprehensive
 * conversation path, with smaller chunk thresholds for lightweight turns.
 */
const quickResponseVariation = factoryPTRRAgent<
  z.infer<typeof ConversationInputSchema>,
  z.infer<typeof ConversationRetrySchema>
>({
  name: 'quick-response',
  description: 'Fast PTRR conversation with code understanding and pipeline capabilities',
  prompt: conversationAgentPrompt,
  stepPrompts: conversationStepPrompts,
  outputSchema: ConversationRetrySchema,
  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 3000
  },
  refine: {
    maxAttempts: 1
  },
  retry: {
    maxAttempts: 1,
    backoff: 250
  }
});

// ==================== AGENT DEFINITION ====================

/**
 * Conversation Agent - Comprehensive PTRR version
 * 
 * This uses the factoryPTRRAgent pattern for full conversation capabilities.
 * The agent-generics pattern creates the complete PTRR execution automatically.
 */
export const conversationAgent = comprehensiveConversationVariation;

/**
 * Export both variations for flexible usage
 */
export { comprehensiveConversationVariation, quickResponseVariation };

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a conversation agent instance
 * This is a convenience wrapper for the PTRR conversation agent
 */
export async function createConversationAgent(
  input: ConversationInput,
  execution?: any
): Promise<ConversationResult> {
  // Create execution if not provided
  if (!execution) {
    const { Execution } = await import('@bitcode/execution-generics/Execution');
    execution = new Execution(`conversation-${input.conversationId}`);
  }
  
  // Run the agent
  return conversationAgent(input, execution);
}

/**
 * Process message with streaming support
 * This wraps the agent execution for streaming responses
 */
export async function* processMessageStream(
  input: ConversationInput,
  execution?: any
): AsyncGenerator<string> {
  // Create execution if not provided
  if (!execution) {
    const { Execution } = await import('@bitcode/execution-generics/Execution');
    execution = new Execution(`conversation-${input.conversationId}`);
  }
  
  // Subscribe to execution events for streaming
  execution.on('llm:token', (token: string) => {
    // This would yield tokens in real implementation
  });
  
  // Run the agent
  const result = await conversationAgent(input, execution);
  
  // Yield the final response
  yield result.finalResponse;
}

/**
 * Pipeline trigger detection
 * Checks if response contains pipeline trigger markers
 */
export function detectPipelineTriggers(response: string): Array<{
  type: 'shippable' | 'measure' | 'evidence_document';
  task: string;
}> {
  const triggers: Array<{ type: 'shippable' | 'measure' | 'evidence_document'; task: string }> = [];
  
  // Look for pipeline trigger markers
  const pipelineMatches = response.matchAll(/\[PIPELINE_TRIGGER:(\w+):(.+?)\]/g);
  
  for (const match of pipelineMatches) {
    const [, type, task] = match;
    if (type === 'shippable' || type === 'measure' || type === 'evidence_document') {
      triggers.push({ type, task });
    }
  }
  
  return triggers;
}

/**
 * Export schemas for external use
 */
export {
  ConversationInputSchema,
  ConversationPlanSchema,
  ConversationTrySchema,
  ConversationRefineSchema,
  ConversationRetrySchema
};
