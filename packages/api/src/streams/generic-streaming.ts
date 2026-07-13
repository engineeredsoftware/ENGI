/**
 * @doc-generic
 * version: 1.0.0
 * sentience: runtime
 * intelligence: ["stream-orchestration", "pipeline-coordination", "real-time-updates"]
 * philosophy: "Streams are the nervous system of pipeline intelligence"
 */

import { 
  SDIVFPhase
} from '@bitcode/pipelines-generics';
import {
  ExecutionState,
  ExecutionPhase,
  ExecutionStep,
  StreamMessage,
  writeStreamMessage
} from './streams';
import { log } from '@bitcode/logger';

// ==================== GENERIC STREAM TYPES ====================

/**
 * @doc-generic
 * Pipeline-aware stream configuration
 */
export interface PipelineStreamConfig {
  pipeline: string; // Pipeline name like 'asset-pack' or 'measure'
  subtype?: string; // Subtype if applicable
  correlationId: string;
  dataStream?: any; // DataStream from 'ai' package
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
export enum StreamEventType {
  // Pipeline lifecycle
  PIPELINE_START = 'pipeline-start',
  PIPELINE_COMPLETE = 'pipeline-complete',
  PIPELINE_ERROR = 'pipeline-error',
  
  // Phase transitions
  PHASE_START = 'phase-start',
  PHASE_COMPLETE = 'phase-complete',
  PHASE_ERROR = 'phase-error',
  
  // Agent coordination
  AGENT_START = 'agent-start',
  AGENT_COMPLETE = 'agent-complete',
  AGENT_PROGRESS = 'agent-progress',
  
  // Tool execution
  TOOL_INVOKE = 'tool-invoke',
  TOOL_RESULT = 'tool-result',
  TOOL_ERROR = 'tool-error',
  
  // Intelligence updates
  INTELLIGENCE_UPDATE = 'intelligence-update',
  CONFIDENCE_UPDATE = 'confidence-update',
  RECOMMENDATION_UPDATE = 'recommendation-update'
}

// ==================== GENERIC STREAM MANAGER ====================

/**
 * @doc-generic
 * Generic stream manager for all pipelines
 */
export class GenericStreamManager {
  private config: PipelineStreamConfig;
  private phaseHistory: (SDIVFPhase | string)[] = [];
  private eventBuffer: PipelineStreamMessage[] = [];
  private startTime: number;
  
  constructor(config: PipelineStreamConfig) {
    this.config = config;
    this.startTime = Date.now();
  }
  
  /**
   * @doc-stream
   * Write pipeline-aware stream message
   */
  async writeMessage(
    message: Omit<PipelineStreamMessage, 'pipeline' | 'correlationId'>
  ): Promise<void> {
    const enhancedMessage: PipelineStreamMessage = {
      ...message,
      pipeline: this.config.pipeline,
      subtype: this.config.subtype,
      correlationId: this.config.correlationId,
      metadata: {
        ...message.metadata,
        ...this.config.metadata,
        pipeline: this.config.pipeline,
        subtype: this.config.subtype
      }
    };
    
    // Buffer for batching
    this.eventBuffer.push(enhancedMessage);
    
    // Write to stream
    await writeStreamMessage(this.config.dataStream, enhancedMessage);
  }
  
  /**
   * @doc-stream
   * Pipeline lifecycle events
   */
  async pipelineStart(): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      executionState: { phase: 'Setup' },
      message: `Starting ${this.config.pipeline} pipeline`,
      detail: `Pipeline: ${this.config.pipeline}, Subtype: ${this.config.subtype || 'default'}`,
      progress: 'in-progress'
    });
  }
  
  async pipelineComplete(result: any): Promise<void> {
    const duration = Date.now() - this.startTime;
    
    await this.writeMessage({
      type: 'completion',
      message: `${this.config.pipeline} pipeline completed`,
      detail: `Duration: ${duration}ms`,
      result,
      duration,
      progress: 'success'
    });
  }
  
  async pipelineError(error: Error): Promise<void> {
    await this.writeMessage({
      type: 'error',
      message: `${this.config.pipeline} pipeline failed`,
      detail: error.stack,
      progress: 'error'
    });
  }
  
  /**
   * @doc-stream
   * Phase transition events
   */
  async phaseStart(phase: SDIVFPhase | string): Promise<void> {
    this.phaseHistory.push(phase);
    
    await this.writeMessage({
      type: 'tool-use',
      executionState: { phase: phase as ExecutionPhase },
      message: `Starting ${phase} phase`,
      phaseProgress: {
        current: phase,
        completed: this.phaseHistory.slice(0, -1),
        remaining: this.getRemainingPhases(phase)
      },
      progress: 'in-progress'
    });
  }
  
  async phaseComplete(phase: SDIVFPhase | string, result?: any): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      executionState: { phase: phase as ExecutionPhase },
      message: `Completed ${phase} phase`,
      result,
      phaseProgress: {
        current: phase,
        completed: this.phaseHistory,
        remaining: this.getRemainingPhases(phase)
      },
      progress: 'success'
    });
  }
  
  /**
   * @doc-stream
   * Agent coordination events
   */
  async agentStart(agentName: string, step?: string): Promise<void> {
    await this.writeMessage({
      type: 'generation',
      executionState: { 
        phase: this.getCurrentPhase(),
        agent: agentName,
        step: step as ExecutionStep
      },
      message: `Agent ${agentName} starting${step ? ` (${step})` : ''}`,
      progress: 'in-progress'
    });
  }
  
  async agentProgress(
    agentName: string, 
    progress: string,
    metadata?: any
  ): Promise<void> {
    await this.writeMessage({
      type: 'thinking',
      executionState: { 
        phase: this.getCurrentPhase(),
        agent: agentName
      },
      message: progress,
      metadata,
      progress: 'in-progress'
    });
  }
  
  async agentComplete(
    agentName: string,
    result: any,
    confidence?: number
  ): Promise<void> {
    await this.writeMessage({
      type: 'generation',
      executionState: { 
        phase: this.getCurrentPhase(),
        agent: agentName
      },
      message: `Agent ${agentName} completed`,
      result,
      metadata: { confidence },
      progress: 'success'
    });
  }
  
  /**
   * @doc-stream
   * Tool execution events
   */
  async toolInvoke(toolName: string, args: any): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      message: `Invoking tool: ${toolName}`,
      detail: JSON.stringify(args),
      progress: 'in-progress'
    });
  }
  
  async toolResult(toolName: string, result: any): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      message: `Tool result: ${toolName}`,
      result,
      progress: 'success'
    });
  }
  
  async toolError(toolName: string, error: Error): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      message: `Tool error: ${toolName}`,
      detail: error.message,
      progress: 'error'
    });
  }
  
  /**
   * @doc-stream
   * Intelligence update events
   */
  async intelligenceUpdate(
    type: 'analysis' | 'recommendation' | 'decision',
    data: any
  ): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      message: `Intelligence update: ${type}`,
      result: data,
      metadata: { intelligenceType: type }
    });
  }
  
  async confidenceUpdate(confidence: number, reason?: string): Promise<void> {
    await this.writeMessage({
      type: 'tool-use',
      message: `Confidence updated: ${(confidence * 100).toFixed(1)}%`,
      detail: reason,
      metadata: { confidence }
    });
  }
  
  /**
   * @doc-stream
   * Batch event flushing
   */
  async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;
    
    // In a real implementation, this would batch send events
    log('Flushing stream event buffer', 'debug', {
      pipeline: this.config.pipeline,
      eventCount: this.eventBuffer.length
    });
    
    this.eventBuffer = [];
  }
  
  /**
   * @doc-stream
   * Get stream analytics
   */
  getAnalytics() {
    return {
      pipeline: this.config.pipeline,
      subtype: this.config.subtype,
      duration: Date.now() - this.startTime,
      phaseHistory: this.phaseHistory,
      eventCount: this.eventBuffer.length
    };
  }
  
  // ==================== PRIVATE HELPERS ====================
  
  private getCurrentPhase(): ExecutionPhase {
    const lastPhase = this.phaseHistory[this.phaseHistory.length - 1];
    // Map SDIVFPhase to ExecutionPhase
    const phaseMap: Record<string, ExecutionPhase> = {
      [SDIVFPhase.SETUP]: 'Setup',
      [SDIVFPhase.DISCOVERY]: 'Discovery',
      [SDIVFPhase.IMPLEMENTATION]: 'Implementation',
      [SDIVFPhase.VALIDATION]: 'Validation',
      [SDIVFPhase.FINISH]: 'Finish'
    };
    return phaseMap[lastPhase as string] || 'Setup';
  }
  
  private getRemainingPhases(currentPhase: SDIVFPhase | string): (SDIVFPhase | string)[] {
    const allPhases = [
      SDIVFPhase.SETUP,
      SDIVFPhase.DISCOVERY,
      SDIVFPhase.IMPLEMENTATION,
      SDIVFPhase.VALIDATION,
      SDIVFPhase.FINISH
    ];
    
    const currentIndex = allPhases.indexOf(currentPhase as SDIVFPhase);
    return allPhases.slice(currentIndex + 1);
  }
}

// ==================== STREAM FACTORY ====================

/**
 * @doc-factory
 * Create pipeline-specific stream managers
 */
export class StreamFactory {
  /**
   * Create stream manager for an AssetPack/Shippable-producing pipeline.
   */
  static createStreamManager(config: PipelineStreamConfig): GenericStreamManager {
    return new GenericStreamManager(config);
  }
  
  /**
   * Create Shippable-specific stream manager.
   */
  static createShippablesStream(
    correlationId: string,
    dataStream?: any
  ): GenericStreamManager {
    return new GenericStreamManager({
      pipeline: 'asset-pack',
      correlationId,
      dataStream,
      metadata: {
        streamType: 'asset-pack-shippable-execution'
      }
    });
  }
}

// ==================== STREAM DECORATORS ====================

/**
 * @doc-decorator
 * Decorator for automatic stream tracking
 */
export function StreamTracked(
  eventType: StreamEventType,
  extractDetails?: (args: any[], result: any) => any
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const streamManager = (this as any).streamManager as GenericStreamManager;
      
      if (!streamManager) {
        // No stream manager, execute normally
        return originalMethod.apply(this, args);
      }
      
      try {
        // Track start
        if (eventType === StreamEventType.AGENT_START) {
          await streamManager.agentStart(propertyKey);
        } else if (eventType === StreamEventType.TOOL_INVOKE) {
          await streamManager.toolInvoke(propertyKey, args[0]);
        }
        
        // Execute
        const result = await originalMethod.apply(this, args);
        
        // Track completion
        if (eventType === StreamEventType.AGENT_COMPLETE) {
          const details = extractDetails ? extractDetails(args, result) : result;
          await streamManager.agentComplete(propertyKey, details);
        } else if (eventType === StreamEventType.TOOL_RESULT) {
          await streamManager.toolResult(propertyKey, result);
        }
        
        return result;
      } catch (error) {
        // Track error
        if (eventType === StreamEventType.TOOL_INVOKE) {
          await streamManager.toolError(propertyKey, error as Error);
        }
        throw error;
      }
    };
    
    return descriptor;
  };
}
