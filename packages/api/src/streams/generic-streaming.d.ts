/**
 * @doc-generic
 * version: 1.0.0
 * sentience: runtime
 * intelligence: ["stream-orchestration", "pipeline-coordination", "real-time-updates"]
 * philosophy: "Streams are the nervous system of pipeline intelligence"
 */
import { SDIVFPhase } from '@bitcode/pipelines-generics';
import { StreamMessage } from './streams';
/**
 * @doc-generic
 * Pipeline-aware stream configuration
 */
export interface PipelineStreamConfig {
    pipeline: string;
    subtype?: string;
    correlationId: string;
    dataStream?: any;
    metadata?: Record<string, any>;
}
/**
 * @doc-generic
 * Enhanced stream message with pipeline context
 */
export interface PipelineStreamMessage extends StreamMessage {
    pipeline?: string;
    subtype?: string;
    phaseProgress?: {
        current: SDIVFPhase | string;
        completed: (SDIVFPhase | string)[];
        remaining: (SDIVFPhase | string)[];
    };
}
/**
 * @doc-generic
 * Stream event types for pipeline coordination
 */
export declare enum StreamEventType {
    PIPELINE_START = "pipeline-start",
    PIPELINE_COMPLETE = "pipeline-complete",
    PIPELINE_ERROR = "pipeline-error",
    PHASE_START = "phase-start",
    PHASE_COMPLETE = "phase-complete",
    PHASE_ERROR = "phase-error",
    AGENT_START = "agent-start",
    AGENT_COMPLETE = "agent-complete",
    AGENT_PROGRESS = "agent-progress",
    TOOL_INVOKE = "tool-invoke",
    TOOL_RESULT = "tool-result",
    TOOL_ERROR = "tool-error",
    INTELLIGENCE_UPDATE = "intelligence-update",
    CONFIDENCE_UPDATE = "confidence-update",
    RECOMMENDATION_UPDATE = "recommendation-update"
}
/**
 * @doc-generic
 * Generic stream manager for all pipelines
 */
export declare class GenericStreamManager {
    private config;
    private phaseHistory;
    private eventBuffer;
    private startTime;
    constructor(config: PipelineStreamConfig);
    /**
     * @doc-stream
     * Write pipeline-aware stream message
     */
    writeMessage(message: Omit<PipelineStreamMessage, 'pipeline' | 'correlationId'>): Promise<void>;
    /**
     * @doc-stream
     * Pipeline lifecycle events
     */
    pipelineStart(): Promise<void>;
    pipelineComplete(result: any): Promise<void>;
    pipelineError(error: Error): Promise<void>;
    /**
     * @doc-stream
     * Phase transition events
     */
    phaseStart(phase: SDIVFPhase | string): Promise<void>;
    phaseComplete(phase: SDIVFPhase | string, result?: any): Promise<void>;
    /**
     * @doc-stream
     * Agent coordination events
     */
    agentStart(agentName: string, step?: string): Promise<void>;
    agentProgress(agentName: string, progress: string, metadata?: any): Promise<void>;
    agentComplete(agentName: string, result: any, confidence?: number): Promise<void>;
    /**
     * @doc-stream
     * Tool execution events
     */
    toolInvoke(toolName: string, args: any): Promise<void>;
    toolResult(toolName: string, result: any): Promise<void>;
    toolError(toolName: string, error: Error): Promise<void>;
    /**
     * @doc-stream
     * Intelligence update events
     */
    intelligenceUpdate(type: 'analysis' | 'recommendation' | 'decision', data: any): Promise<void>;
    confidenceUpdate(confidence: number, reason?: string): Promise<void>;
    /**
     * @doc-stream
     * Batch event flushing
     */
    flush(): Promise<void>;
    /**
     * @doc-stream
     * Get stream analytics
     */
    getAnalytics(): {
        pipeline: string;
        subtype: string;
        duration: number;
        phaseHistory: string[];
        eventCount: number;
    };
    private getCurrentPhase;
    private getRemainingPhases;
}
/**
 * @doc-factory
 * Create pipeline-specific stream managers
 */
export declare class StreamFactory {
    /**
     * Create stream manager for an AssetPack/Shippable-producing pipeline.
     */
    static createStreamManager(config: PipelineStreamConfig): GenericStreamManager;
    /**
     * Create Shippable-specific stream manager.
     */
    static createShippablesStream(correlationId: string, dataStream?: any): GenericStreamManager;
}
/**
 * @doc-decorator
 * Decorator for automatic stream tracking
 */
export declare function StreamTracked(eventType: StreamEventType, extractDetails?: (args: any[], result: any) => any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
