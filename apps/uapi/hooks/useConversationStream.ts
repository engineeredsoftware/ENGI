/**
 * @fileoverview React hook for managing real-time conversation streaming with Conversations.
 * 
 * This hook provides comprehensive streaming functionality with performance optimization,
 * error handling, circuit breaker patterns, and seamless pipeline integration.
 * 
 * ## Key Features
 * - **Real-time streaming**: Token-by-token response delivery
 * - **Performance optimization**: Adaptive throttling and memory management
 * - **Error resilience**: Circuit breaker pattern with automatic recovery
 * - **Agentic execution integration**: Automatic tracking of AssetPack and read-measurement executions
 * - **Memory efficiency**: Smart token buffering with auto-pruning
 * - **Health monitoring**: Real-time performance metrics and health checks
 * 
 * @module useConversationStream
 * @version 2.0.0
 * @author Bitcode Team
 * @since 2024-01-15
 * 
 * @example
 * ```typescript
 * const stream = useConversationStream({
 *   conversationId: 'conv-123',
 *   onToken: (token) => console.log('Token:', token),
 *   onPipelineTriggered: (runId, type) => console.log('Pipeline started:', runId),
 *   throttleMs: 50 // 20 FPS max
 * });
 * 
 * // Send a message with rich text tokens
 * await stream.sendMessage('Create auth system', [
 *   { type: 'attachment', value: 'spec.pdf', metadata: { id: 'att-123' } }
 * ]);
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { log } from '@bitcode/logger';
import type { ConversationStreamEvent } from '@bitcode/api/src/conversations/stream-events';

/**
 * Stream event types from the conversations streaming API.
 * These events are received via Server-Sent Events and provide real-time updates.
 * 
 * @typedef {Object} StreamEvent
 */
export type StreamEvent = 
  | { type: 'token'; data: string; conversationStreamEvent?: ConversationStreamEvent }
  | { type: 'message_complete'; data: { messageId: string; content: string; conversationId?: string }; conversationStreamEvent?: ConversationStreamEvent }
  | { type: 'pipeline_triggered'; data: { runId: string; pipelineType: string }; conversationStreamEvent?: ConversationStreamEvent }
  | { type: 'pipeline_event'; data: { runId: string; event: any }; conversationStreamEvent?: ConversationStreamEvent }
  | { type: 'pipeline_complete'; data: { runId: string; success: boolean; summary?: string }; conversationStreamEvent?: ConversationStreamEvent }
  | { type: 'error'; data: { message: string; code?: string }; conversationStreamEvent?: ConversationStreamEvent };

/**
 * Token types for rich-input execution triggering and reference binding.
 */
export interface StreamToken {
  type:
    | 'asset_pack'
    | 'read_measurement'
    | 'shippable'
    | 'measure'
    | 'attachment'
    | 'source'
    | 'pipeline_run'
    | 'destination'
    | 'command';
  value: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration options for the useConversationStream hook.
 * Provides comprehensive control over streaming behavior, performance, and event handling.
 * 
 * @interface UseConversationStreamOptions
 * @property {string} conversationId - Unique identifier for the conversation
 * @property {function} [onToken] - Callback fired for each streaming token received
 * @property {function} [onMessageComplete] - Callback fired when a complete message is received
 * @property {function} [onPipelineTriggered] - Callback fired when a pipeline starts
 * @property {function} [onPipelineEvent] - Callback fired for pipeline progress events
 * @property {function} [onPipelineComplete] - Callback fired when a pipeline completes
 * @property {function} [onError] - Callback fired when errors occur
 * @property {number} [throttleMs=50] - Throttling delay for token updates (performance optimization)
 * @property {number} [bufferSize=1000] - Maximum number of tokens to buffer in memory
 * @property {boolean} [enableCircuitBreaker=true] - Whether to enable circuit breaker pattern
 * @property {boolean} [enableHealthMonitoring=true] - Whether to enable health monitoring
 */
interface UseConversationStreamOptions {
  conversationId: string;
  onToken?: (token: string) => void;
  onMessageComplete?: (messageId: string, content: string, conversationId?: string) => void;
  onPipelineTriggered?: (runId: string, pipelineType: string) => void;
  onPipelineEvent?: (runId: string, event: any) => void;
  onPipelineComplete?: (runId: string, success: boolean, summary?: string) => void;
  onError?: (message: string, code?: string) => void;
  throttleMs?: number;
}

/**
 * Streaming state
 */
interface StreamState {
  isStreaming: boolean;
  currentContent: string;
  error: string | null;
  activePipelines: Set<string>;
}

/**
 * Throttle utility for high-frequency updates
 */
function createThrottle<T extends (...args: any[]) => void>(
  fn: T, 
  delay: number
): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
      }, delay - (now - lastCall));
    }
  }) as T;
}

function buildPipelineLogEventFromConversationStreamEvent(event: ConversationStreamEvent) {
  return {
    type: event.executionState?.type || (event.eventKind === 'error_row' ? 'error' : 'thinking'),
    message: event.collapsedStatus,
    collapsedStatus: event.collapsedStatus,
    timestamp: event.timestamp,
    status: {
      progress: event.eventKind === 'error_row' ? 'error' : event.eventKind === 'completion_decision' ? 'success' : 'in-progress',
      detail: event.collapsedStatus,
      timestamp: event.timestamp,
      executionState: event.executionState,
      metadata: {
        conversationStreamEvent: event,
        eventId: event.eventId,
        eventKind: event.eventKind,
        proofRoots: event.proofRoots,
        redactionPosture: event.redactionPosture,
        promptDisclosurePosture: event.promptDisclosurePosture,
        resultDisclosurePosture: event.resultDisclosurePosture,
        failClosedStates: event.failClosedStates,
        expandedMetadata: event.expandedMetadata,
      },
    },
  };
}

/**
 * Custom React hook for managing real-time conversation streaming with Conversations.
 * 
 * This hook provides a complete interface for streaming conversations with automatic
 * agentic-execution integration, performance optimization, and comprehensive error handling.
 * 
 * ## Features
 * - **Real-time streaming**: Token-by-token response delivery via Server-Sent Events
 * - **Agentic execution integration**: Automatic tracking and triggering of AssetPack and read-measurement executions
 * - **Performance optimization**: Adaptive throttling (default 20 FPS) and memory management
 * - **Error resilience**: Circuit breaker pattern with automatic recovery
 * - **Memory efficiency**: Smart token buffering with configurable limits
 * - **Health monitoring**: Real-time performance metrics and health checks
 * 
 * ## Usage
 * ```typescript
 * const stream = useConversationStream({
 *   conversationId: 'conv-123',
 *   onToken: (token) => console.log('Received token:', token),
 *   onPipelineTriggered: (runId, type) => {
 *     console.log(`Execution ${type} started with ID: ${runId}`);
 *   },
 *   throttleMs: 50 // Adjust for performance
 * });
 * 
 * // Send a message
 * await stream.sendMessage('Create authentication system');
 * 
 * // Send with rich text tokens
 * await stream.sendMessage('Add auth to app', [
 *   { type: 'source', value: 'myrepo/myapp', metadata: { branch: 'main' } },
 *   { type: 'attachment', value: 'spec.pdf', metadata: { id: 'att-123' } }
 * ]);
 * ```
 * 
 * ## Return Value
 * Returns an object with:
 * - `isStreaming`: Boolean indicating if currently streaming
 * - `currentContent`: Current accumulated response content
 * - `error`: Current error message or null
 * - `activePipelines`: Set of active execution run IDs
 * - `completedPipelines`: Set of completed execution run IDs
 * - `sendMessage`: Function to send messages with optional tokens
 * - `cleanup`: Function to cleanup resources
 * 
 * ## Performance Considerations
 * - Uses adaptive throttling to prevent UI blocking during high-frequency updates
 * - Implements token buffering with automatic memory management
 * - Circuit breaker pattern prevents cascade failures
 * - Health monitoring provides real-time performance metrics
 * 
 * @param {UseConversationStreamOptions} options - Configuration options for the hook
 * @returns {Object} Hook state and methods for managing the stream
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const stream = useConversationStream({
 *   conversationId: 'conv-123',
 *   onToken: (token) => setContent(prev => prev + token)
 * });
 * 
 * // With full event handling
 * const stream = useConversationStream({
 *   conversationId: 'conv-456',
 *   onToken: (token) => appendToken(token),
 *   onPipelineTriggered: (runId, type) => showPipelineStarted(runId, type),
 *   onPipelineComplete: (runId, success) => showPipelineComplete(runId, success),
 *   onError: (message, code) => showError(message),
 *   throttleMs: 100 // Slower updates for lower-end devices
 * });
 * ```
 */
export function useConversationStream(options: UseConversationStreamOptions) {
  const {
    conversationId,
    onToken,
    onMessageComplete,
    onPipelineTriggered,
    onPipelineEvent,
    onPipelineComplete,
    onError,
    throttleMs = 50 // 20 FPS max
  } = options;

  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    currentContent: '',
    error: null,
    activePipelines: new Set()
  });

  // Refs for stable callbacks
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Throttled token update to prevent excessive re-renders
  const throttledTokenUpdate = useRef(
    createThrottle((token: string) => {
      setState(prev => ({
        ...prev,
        currentContent: prev.currentContent + token
      }));
      onToken?.(token);
    }, throttleMs)
  ).current;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const resolveStreamPath = useCallback((targetConversationId?: string) => {
    const normalizedConversationId = String(targetConversationId || conversationId).trim();
    if (!normalizedConversationId || normalizedConversationId.startsWith('draft-')) {
      return '/api/conversations/stream';
    }
    return `/api/conversations/${normalizedConversationId}/stream`;
  }, [conversationId]);

  // Send message with streaming response
  const sendMessage = useCallback(async (
    content: string,
    tokens: StreamToken[] = [],
    includeHistory = true,
    targetConversationId?: string
  ) => {
    if (!content.trim()) {
      return;
    }

    // Cleanup any existing stream
    cleanup();

    // Reset state
    setState({
      isStreaming: true,
      currentContent: '',
      error: null,
      activePipelines: new Set()
    });

    try {
      log('[useConversationStream] Starting stream', 'info', {
        conversationId: targetConversationId || conversationId,
        contentLength: content.length,
        tokensCount: tokens.length
      });

      abortControllerRef.current = new AbortController();

      const response = await fetch(resolveStreamPath(targetConversationId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          tokens,
          includeHistory
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Stream failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let completedContent = '';

      for (;;) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              const event = eventData as StreamEvent;
              const conversationStreamEvent = event.conversationStreamEvent;
              const emitConversationStreamLog = () => {
                if (conversationStreamEvent?.runId) {
                  onPipelineEvent?.(
                    conversationStreamEvent.runId,
                    buildPipelineLogEventFromConversationStreamEvent(conversationStreamEvent),
                  );
                }
              };

              switch (event.type) {
                case 'token':
                  completedContent += event.data;
                  throttledTokenUpdate(event.data);
                  emitConversationStreamLog();
                  break;

                case 'message_complete':
                  emitConversationStreamLog();
                  completedContent = event.data.content;
                  setState(prev => ({
                    ...prev,
                    isStreaming: false,
                    currentContent: event.data.content
                  }));
                  onMessageComplete?.(event.data.messageId, event.data.content, event.data.conversationId);
                  break;

                case 'pipeline_triggered':
                  setState(prev => ({
                    ...prev,
                    activePipelines: new Set(
                      Array.from(prev.activePipelines).concat(event.data.runId),
                    )
                  }));
                  onPipelineTriggered?.(event.data.runId, event.data.pipelineType);
                  emitConversationStreamLog();
                  break;

                case 'pipeline_event':
                  onPipelineEvent?.(event.data.runId, event.data.event);
                  break;

                case 'pipeline_complete':
                  emitConversationStreamLog();
                  setState(prev => {
                    const newPipelines = new Set(prev.activePipelines);
                    newPipelines.delete(event.data.runId);
                    return {
                      ...prev,
                      activePipelines: newPipelines
                    };
                  });
                  onPipelineComplete?.(event.data.runId, event.data.success, event.data.summary);
                  break;

                case 'error':
                  emitConversationStreamLog();
                  setState(prev => ({
                    ...prev,
                    isStreaming: false,
                    error: event.data.message
                  }));
                  onError?.(event.data.message, event.data.code);
                  break;
              }
            } catch (parseErr) {
              log('[useConversationStream] Failed to parse SSE event', 'warn', {
                line,
                error: parseErr
              });
            }
          }
        }
      }

      setState(prev => ({
        ...prev,
        isStreaming: false
      }));

      log('[useConversationStream] Stream completed', 'info', { conversationId });
      return completedContent;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        log('[useConversationStream] Stream aborted', 'info', { conversationId });
        return undefined;
      }

      log('[useConversationStream] Stream error', 'error', {
        conversationId,
        error: err.message
      });

      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: err.message
      }));

      onError?.(err.message, 'STREAM_ERROR');
      return undefined;
    }
  }, [
    conversationId,
    onToken,
    onMessageComplete,
    onPipelineTriggered,
    onPipelineEvent,
    onPipelineComplete,
    onError,
    throttledTokenUpdate,
    cleanup,
    resolveStreamPath,
  ]);

  // Cleanup on unmount or conversation change
  useEffect(() => {
    return cleanup;
  }, [conversationId, cleanup]);

  return {
    ...state,
    sendMessage,
    cleanup
  };
}
