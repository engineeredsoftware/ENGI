/**
 * Pipeline Telemetry Utilities
 * 
 * Provides comprehensive telemetry tracking for pipeline execution events,
 * pipeline step progression, performance metrics, and user interactions.
 */

import { sendServerEvent } from '@bitcode/google-analytics';
import { log } from '@bitcode/logger';

export interface PipelineEventMetadata {
  run_id: string;
  user_id: string;
  entry_point?: 'gui' | 'chat' | 'webhook' | 'api';
  conversation_id?: string;
  correlation_id?: string;
  session_id?: string;
}

export interface PipelineStepMetadata extends PipelineEventMetadata {
  phase?: string;
  agent?: string;
  step?: string;
  meta_step?: string;
  sub_step?: string;
  step_type?: 'plan' | 'generate' | 'refine' | 'intensify' | 'thinking' | 'generation' | 'tool-use' | 'status';
}

export interface PipelinePerformanceMetadata extends PipelineEventMetadata {
  duration_ms?: number;
  tokens_used?: number;
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  api_calls_count?: number;
}

/**
 * Track when a pipeline phase starts
 */
export async function trackPipelinePhaseStart(
  metadata: PipelineStepMetadata & {
    phase: string;
    phase_description?: string;
    expected_agents?: string[];
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_phase_started', {
      ...metadata,
      event_category: 'pipeline_execution',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline phase start telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track when a pipeline phase completes
 */
export async function trackPipelinePhaseComplete(
  metadata: PipelineStepMetadata & PipelinePerformanceMetadata & {
    phase: string;
    success: boolean;
    agents_executed?: string[];
    steps_completed?: number;
    errors_encountered?: number;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_phase_completed', {
      ...metadata,
      event_category: 'pipeline_execution',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline phase complete telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track individual agent execution
 */
export async function trackAgentExecution(
  metadata: PipelineStepMetadata & PipelinePerformanceMetadata & {
    agent: string;
    agent_role?: string;
    action?: string;
    context_size?: number;
    tool_calls?: number;
    success: boolean;
    error_message?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_agent_executed', {
      ...metadata,
      event_category: 'pipeline_execution',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline agent execution telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track generation events (AI model calls) during pipeline execution
 */
export async function trackGeneration(
  metadata: PipelineStepMetadata & {
    model_provider: string;
    model_id: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost_estimate?: number;
    response_time_ms?: number;
    context_window_size?: number;
    tool_use_count?: number;
    success: boolean;
    error_code?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_generation', {
      ...metadata,
      event_category: 'pipeline_ai',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline generation telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track tool usage during pipeline execution
 */
export async function trackToolUse(
  metadata: PipelineStepMetadata & {
    tool_name: string;
    tool_category?: string;
    input_size?: number;
    output_size?: number;
    execution_time_ms?: number;
    success: boolean;
    error_message?: string;
    retry_count?: number;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_tool_used', {
      ...metadata,
      event_category: 'pipeline_tools',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline tool use telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track pipeline errors and failures
 */
export async function trackPipelineError(
  metadata: PipelineEventMetadata & {
    error_type: string;
    error_code?: string;
    error_message: string;
    error_phase?: string;
    error_agent?: string;
    error_step?: string;
    stack_trace?: string;
    recovery_attempted?: boolean;
    recovery_successful?: boolean;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_error_occurred', {
      ...metadata,
      event_category: 'pipeline_errors',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline error telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track user interactions during pipeline execution
 */
export async function trackPipelineUserInteraction(
  metadata: PipelineEventMetadata & {
    interaction_type: 'oty_instruction' | 'pipeline_pause' | 'pipeline_resume' | 'pipeline_cancel';
    content?: string;
    content_length?: number;
    timing_within_pipeline?: number; // ms since pipeline start
    pipeline_phase_during_interaction?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_user_interaction', {
      ...metadata,
      event_category: 'pipeline_interaction',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline user interaction telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track pipeline performance metrics
 */
export async function trackPipelinePerformance(
  metadata: PipelineEventMetadata & PipelinePerformanceMetadata & {
    metric_type: 'memory_peak' | 'cpu_spike' | 'latency_high' | 'throughput_low' | 'token_limit_reached';
    metric_value: number;
    threshold_exceeded?: boolean;
    recovery_action?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_performance_metric', {
      ...metadata,
      event_category: 'pipeline_performance',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline performance telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Track streaming events and connection quality
 */
export async function trackStreamingEvent(
  metadata: PipelineEventMetadata & {
    stream_event_type: 'connection_opened' | 'connection_closed' | 'data_chunk_sent' | 'parse_error' | 'throttle_applied';
    chunk_size?: number;
    parse_duration_ms?: number;
    connection_duration_ms?: number;
    error_message?: string;
    client_info?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_streaming_event', {
      ...metadata,
      event_category: 'pipeline_streaming',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline streaming telemetry failed', 'error', { error: e, metadata });
  }
}

/**
 * Helper to create base metadata from context
 */
export function createPipelineMetadata(
  runId: string,
  userId: string,
  additionalMetadata: Partial<PipelineEventMetadata> = {}
): PipelineEventMetadata {
  return {
    run_id: runId,
    user_id: userId,
    ...additionalMetadata
  };
}

/**
 * Wrapper for tracking pipeline completion with comprehensive metrics
 */
export async function trackPipelineCompletion(
  metadata: PipelineEventMetadata & PipelinePerformanceMetadata & {
    total_phases: number;
    completed_phases: number;
    total_agents: number;
    executed_agents: number;
    total_generations: number;
    total_tool_calls: number;
    files_modified: number;
    files_created: number;
    lines_added: number;
    lines_removed: number;
    success: boolean;
    completion_reason: 'success' | 'error' | 'cancelled' | 'timeout';
    error_summary?: string;
  }
): Promise<void> {
  try {
    await sendServerEvent('pipeline_execution_completed', {
      ...metadata,
      event_category: 'pipeline_completion',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log('Pipeline completion telemetry failed', 'error', { error: e, metadata });
  }
}
