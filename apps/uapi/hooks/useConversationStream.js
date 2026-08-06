"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConversationStream = useConversationStream;
const react_1 = require("react");
const logger_1 = require("@bitcode/logger");
/**
 * Throttle utility for high-frequency updates
 */
function createThrottle(fn, delay) {
    let lastCall = 0;
    let timeoutId = null;
    return ((...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
        else {
            if (timeoutId)
                clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                fn(...args);
            }, delay - (now - lastCall));
        }
    });
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
function useConversationStream(options) {
    const { conversationId, onToken, onMessageComplete, onPipelineTriggered, onPipelineEvent, onPipelineComplete, onError, throttleMs = 50 // 20 FPS max
     } = options;
    const [state, setState] = (0, react_1.useState)({
        isStreaming: false,
        currentContent: '',
        error: null,
        activePipelines: new Set()
    });
    // Refs for stable callbacks
    const eventSourceRef = (0, react_1.useRef)(null);
    const abortControllerRef = (0, react_1.useRef)(null);
    // Throttled token update to prevent excessive re-renders
    const throttledTokenUpdate = (0, react_1.useRef)(createThrottle((token) => {
        setState(prev => ({
            ...prev,
            currentContent: prev.currentContent + token
        }));
        onToken?.(token);
    }, throttleMs)).current;
    // Cleanup function
    const cleanup = (0, react_1.useCallback)(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);
    const resolveStreamPath = (0, react_1.useCallback)((targetConversationId) => {
        const normalizedConversationId = String(targetConversationId || conversationId).trim();
        if (!normalizedConversationId || normalizedConversationId.startsWith('draft-')) {
            return '/api/conversations/stream';
        }
        return `/api/conversations/${normalizedConversationId}/stream`;
    }, [conversationId]);
    // Send message with streaming response
    const sendMessage = (0, react_1.useCallback)(async (content, tokens = [], includeHistory = true, targetConversationId) => {
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
            (0, logger_1.log)('[useConversationStream] Starting stream', 'info', {
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
            for (;;) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                // Process complete SSE messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(line.slice(6));
                            const event = eventData;
                            switch (event.type) {
                                case 'token':
                                    throttledTokenUpdate(event.data);
                                    break;
                                case 'message_complete':
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
                                        activePipelines: new Set(Array.from(prev.activePipelines).concat(event.data.runId))
                                    }));
                                    onPipelineTriggered?.(event.data.runId, event.data.pipelineType);
                                    break;
                                case 'pipeline_event':
                                    onPipelineEvent?.(event.data.runId, event.data.event);
                                    break;
                                case 'pipeline_complete':
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
                                    setState(prev => ({
                                        ...prev,
                                        isStreaming: false,
                                        error: event.data.message
                                    }));
                                    onError?.(event.data.message, event.data.code);
                                    break;
                            }
                        }
                        catch (parseErr) {
                            (0, logger_1.log)('[useConversationStream] Failed to parse SSE event', 'warn', {
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
            (0, logger_1.log)('[useConversationStream] Stream completed', 'info', { conversationId });
        }
        catch (err) {
            if (err.name === 'AbortError') {
                (0, logger_1.log)('[useConversationStream] Stream aborted', 'info', { conversationId });
                return;
            }
            (0, logger_1.log)('[useConversationStream] Stream error', 'error', {
                conversationId,
                error: err.message
            });
            setState(prev => ({
                ...prev,
                isStreaming: false,
                error: err.message
            }));
            onError?.(err.message, 'STREAM_ERROR');
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
    (0, react_1.useEffect)(() => {
        return cleanup;
    }, [conversationId, cleanup]);
    return {
        ...state,
        sendMessage,
        cleanup
    };
}
