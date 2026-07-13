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
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import { z } from 'zod';
declare const ConversationInputSchema: z.ZodObject<{
    message: z.ZodString;
    tokens: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["attachment", "source", "pipeline_run"]>;
        text: z.ZodString;
        data: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }, {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }>, "many">>;
    conversationId: z.ZodString;
    userId: z.ZodString;
    repoPath: z.ZodOptional<z.ZodString>;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role?: "user" | "assistant";
        content?: string;
    }, {
        role?: "user" | "assistant";
        content?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    tokens?: {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }[];
    conversationId?: string;
    userId?: string;
    repoPath?: string;
    history?: {
        role?: "user" | "assistant";
        content?: string;
    }[];
}, {
    message?: string;
    tokens?: {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }[];
    conversationId?: string;
    userId?: string;
    repoPath?: string;
    history?: {
        role?: "user" | "assistant";
        content?: string;
    }[];
}>;
declare const ConversationPlanSchema: z.ZodObject<{
    messageIntent: z.ZodString;
    requiresCodeExploration: z.ZodBoolean;
    requiresPipelineExecution: z.ZodBoolean;
    responseStrategy: z.ZodString;
    toolsNeeded: z.ZodArray<z.ZodString, "many">;
    contextNeeded: z.ZodObject<{
        needsDigest: z.ZodBoolean;
        needsCodeSearch: z.ZodBoolean;
        needsFileReading: z.ZodBoolean;
        needsHistory: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        needsDigest?: boolean;
        needsCodeSearch?: boolean;
        needsFileReading?: boolean;
        needsHistory?: boolean;
    }, {
        needsDigest?: boolean;
        needsCodeSearch?: boolean;
        needsFileReading?: boolean;
        needsHistory?: boolean;
    }>;
    useTools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        input: z.ZodAny;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        input?: any;
        reason?: string;
    }, {
        name?: string;
        input?: any;
        reason?: string;
    }>, "many">>;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    messageIntent?: string;
    requiresCodeExploration?: boolean;
    requiresPipelineExecution?: boolean;
    responseStrategy?: string;
    toolsNeeded?: string[];
    contextNeeded?: {
        needsDigest?: boolean;
        needsCodeSearch?: boolean;
        needsFileReading?: boolean;
        needsHistory?: boolean;
    };
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    confidence?: number;
}, {
    messageIntent?: string;
    requiresCodeExploration?: boolean;
    requiresPipelineExecution?: boolean;
    responseStrategy?: string;
    toolsNeeded?: string[];
    contextNeeded?: {
        needsDigest?: boolean;
        needsCodeSearch?: boolean;
        needsFileReading?: boolean;
        needsHistory?: boolean;
    };
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    confidence?: number;
}>;
declare const ConversationTrySchema: z.ZodObject<{
    response: z.ZodString;
    codeFindings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        relevance: z.ZodString;
        snippet: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        file?: string;
        relevance?: string;
        snippet?: string;
    }, {
        file?: string;
        relevance?: string;
        snippet?: string;
    }>, "many">>;
    pipelineSuggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["shippable", "measure"]>;
        task: z.ZodString;
        reasoning: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type?: "shippable" | "measure";
        confidence?: number;
        task?: string;
        reasoning?: string;
    }, {
        type?: "shippable" | "measure";
        confidence?: number;
        task?: string;
        reasoning?: string;
    }>, "many">>;
    useTools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        input: z.ZodAny;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        input?: any;
        reason?: string;
    }, {
        name?: string;
        input?: any;
        reason?: string;
    }>, "many">>;
    responseType: z.ZodEnum<["informational", "action-required", "error"]>;
    complete: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    response?: string;
    codeFindings?: {
        file?: string;
        relevance?: string;
        snippet?: string;
    }[];
    pipelineSuggestions?: {
        type?: "shippable" | "measure";
        confidence?: number;
        task?: string;
        reasoning?: string;
    }[];
    responseType?: "error" | "informational" | "action-required";
    complete?: boolean;
}, {
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    response?: string;
    codeFindings?: {
        file?: string;
        relevance?: string;
        snippet?: string;
    }[];
    pipelineSuggestions?: {
        type?: "shippable" | "measure";
        confidence?: number;
        task?: string;
        reasoning?: string;
    }[];
    responseType?: "error" | "informational" | "action-required";
    complete?: boolean;
}>;
declare const ConversationRefineSchema: z.ZodObject<{
    refinedResponse: z.ZodString;
    formatting: z.ZodObject<{
        hasCodeBlocks: z.ZodBoolean;
        hasMarkdown: z.ZodBoolean;
        hasReferences: z.ZodBoolean;
        clarity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hasCodeBlocks?: boolean;
        hasMarkdown?: boolean;
        hasReferences?: boolean;
        clarity?: number;
    }, {
        hasCodeBlocks?: boolean;
        hasMarkdown?: boolean;
        hasReferences?: boolean;
        clarity?: number;
    }>;
    additionalContext: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    references: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        file?: string;
        line?: number;
        description?: string;
    }, {
        file?: string;
        line?: number;
        description?: string;
    }>, "many">>;
    quality: z.ZodObject<{
        relevance: z.ZodNumber;
        completeness: z.ZodNumber;
        accuracy: z.ZodNumber;
        helpfulness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        relevance?: number;
        completeness?: number;
        accuracy?: number;
        helpfulness?: number;
    }, {
        relevance?: number;
        completeness?: number;
        accuracy?: number;
        helpfulness?: number;
    }>;
    useTools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        input: z.ZodAny;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        input?: any;
        reason?: string;
    }, {
        name?: string;
        input?: any;
        reason?: string;
    }>, "many">>;
    improvements: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    refinedResponse?: string;
    formatting?: {
        hasCodeBlocks?: boolean;
        hasMarkdown?: boolean;
        hasReferences?: boolean;
        clarity?: number;
    };
    additionalContext?: string[];
    references?: {
        file?: string;
        line?: number;
        description?: string;
    }[];
    quality?: {
        relevance?: number;
        completeness?: number;
        accuracy?: number;
        helpfulness?: number;
    };
    improvements?: string[];
}, {
    useTools?: {
        name?: string;
        input?: any;
        reason?: string;
    }[];
    refinedResponse?: string;
    formatting?: {
        hasCodeBlocks?: boolean;
        hasMarkdown?: boolean;
        hasReferences?: boolean;
        clarity?: number;
    };
    additionalContext?: string[];
    references?: {
        file?: string;
        line?: number;
        description?: string;
    }[];
    quality?: {
        relevance?: number;
        completeness?: number;
        accuracy?: number;
        helpfulness?: number;
    };
    improvements?: string[];
}>;
declare const ConversationRetrySchema: z.ZodObject<{
    finalResponse: z.ZodString;
    triggeredPipelines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["shippable", "measure"]>;
        task: z.ZodString;
        runId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["triggered", "pending", "failed"]>;
    }, "strip", z.ZodTypeAny, {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }, {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }>, "many">>;
    codeReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        file?: string;
        line?: number;
        purpose?: string;
    }, {
        file?: string;
        line?: number;
        purpose?: string;
    }>, "many">>;
    suggestedNextSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodObject<{
        responseLength: z.ZodNumber;
        toolsUsed: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        processingTime: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    }, {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    }>;
    success: z.ZodBoolean;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    finalResponse?: string;
    triggeredPipelines?: {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }[];
    codeReferences?: {
        file?: string;
        line?: number;
        purpose?: string;
    }[];
    suggestedNextSteps?: string[];
    metadata?: {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    };
    success?: boolean;
    feedback?: string;
}, {
    finalResponse?: string;
    triggeredPipelines?: {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }[];
    codeReferences?: {
        file?: string;
        line?: number;
        purpose?: string;
    }[];
    suggestedNextSteps?: string[];
    metadata?: {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    };
    success?: boolean;
    feedback?: string;
}>;
export type ConversationInput = z.infer<typeof ConversationInputSchema>;
export type ConversationPlanOutput = z.infer<typeof ConversationPlanSchema>;
export type ConversationTryOutput = z.infer<typeof ConversationTrySchema>;
export type ConversationRefineOutput = z.infer<typeof ConversationRefineSchema>;
export type ConversationResult = z.infer<typeof ConversationRetrySchema>;
/**
 * Agent-level prompt registry.
 * Only what applies to every LLM call in this agent.
 */
export declare const conversationAgentPrompt: AgentPrompt;
/**
 * PTRR step Prompt registries.
 */
export declare const conversationStepPrompts: {
    plan: AgentStepPrompt;
    try: AgentStepPrompt;
    refine: AgentStepPrompt;
    retry: AgentStepPrompt;
};
/**
 * Full conversational variation with PTRR
 * Used for complex queries requiring deep understanding
 */
declare const comprehensiveConversationVariation: import("@bitcode/agent-generics").Agent<{
    message?: string;
    tokens?: {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }[];
    conversationId?: string;
    userId?: string;
    repoPath?: string;
    history?: {
        role?: "user" | "assistant";
        content?: string;
    }[];
}, {
    finalResponse?: string;
    triggeredPipelines?: {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }[];
    codeReferences?: {
        file?: string;
        line?: number;
        purpose?: string;
    }[];
    suggestedNextSteps?: string[];
    metadata?: {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    };
    success?: boolean;
    feedback?: string;
}>;
/**
 * Quick response variation
 * Uses the same PTRR/Failsafe/Thinkings stack as the comprehensive
 * conversation path, with smaller chunk thresholds for lightweight turns.
 */
declare const quickResponseVariation: import("@bitcode/agent-generics").Agent<{
    message?: string;
    tokens?: {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }[];
    conversationId?: string;
    userId?: string;
    repoPath?: string;
    history?: {
        role?: "user" | "assistant";
        content?: string;
    }[];
}, {
    finalResponse?: string;
    triggeredPipelines?: {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }[];
    codeReferences?: {
        file?: string;
        line?: number;
        purpose?: string;
    }[];
    suggestedNextSteps?: string[];
    metadata?: {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    };
    success?: boolean;
    feedback?: string;
}>;
/**
 * Conversation Agent - Comprehensive PTRR version
 *
 * This uses the factoryAgentWithPTRR pattern for full conversation capabilities.
 * The agent-generics pattern creates the complete PTRR execution automatically.
 */
export declare const conversationAgent: import("@bitcode/agent-generics").Agent<{
    message?: string;
    tokens?: {
        type?: "attachment" | "source" | "pipeline_run";
        text?: string;
        data?: any;
    }[];
    conversationId?: string;
    userId?: string;
    repoPath?: string;
    history?: {
        role?: "user" | "assistant";
        content?: string;
    }[];
}, {
    finalResponse?: string;
    triggeredPipelines?: {
        type?: "shippable" | "measure";
        status?: "triggered" | "pending" | "failed";
        task?: string;
        runId?: string;
    }[];
    codeReferences?: {
        file?: string;
        line?: number;
        purpose?: string;
    }[];
    suggestedNextSteps?: string[];
    metadata?: {
        confidence?: number;
        responseLength?: number;
        toolsUsed?: string[];
        processingTime?: number;
    };
    success?: boolean;
    feedback?: string;
}>;
/**
 * Export both variations for flexible usage
 */
export { comprehensiveConversationVariation, quickResponseVariation };
/**
 * Create a conversation agent instance
 * This is a convenience wrapper for the PTRR conversation agent
 */
export declare function createConversationAgent(input: ConversationInput, execution?: any): Promise<ConversationResult>;
/**
 * Process message with streaming support
 * This wraps the agent execution for streaming responses
 */
export declare function processMessageStream(input: ConversationInput, execution?: any): AsyncGenerator<string>;
/**
 * Pipeline trigger detection
 * Checks if response contains pipeline trigger markers
 */
export declare function detectPipelineTriggers(response: string): Array<{
    type: 'shippable' | 'measure' | 'evidence_document';
    task: string;
}>;
/**
 * Export schemas for external use
 */
export { ConversationInputSchema, ConversationPlanSchema, ConversationTrySchema, ConversationRefineSchema, ConversationRetrySchema };
