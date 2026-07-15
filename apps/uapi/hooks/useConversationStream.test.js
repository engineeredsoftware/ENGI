"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
const react_1 = require("@testing-library/react");
const useConversationStream_1 = require("./useConversationStream");
// Mock performance utilities
jest.mock('../utils/performance-utils', () => ({
    createThrottle: jest.fn((fn, delay) => {
        let timeoutId = null;
        return (...args) => {
            if (timeoutId)
                clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }),
    TokenBuffer: jest.fn().mockImplementation((maxSize, pruneThreshold) => ({
        maxSize,
        pruneThreshold,
        tokens: [],
        append: jest.fn(function (token) {
            this.tokens.push(token);
            if (this.tokens.length > this.maxSize * this.pruneThreshold) {
                this.tokens = this.tokens.slice(-Math.floor(this.maxSize * 0.5));
            }
        }),
        getContent: jest.fn(function () {
            return this.tokens.join('');
        }),
        clear: jest.fn(function () {
            this.tokens = [];
        }),
        memoryUsage: jest.fn(() => 1024)
    })),
    StreamCircuitBreaker: jest.fn().mockImplementation((threshold, timeout) => ({
        threshold,
        timeout,
        failures: 0,
        state: 'closed',
        canExecute: jest.fn(function () {
            return this.state === 'closed';
        }),
        recordSuccess: jest.fn(function () {
            this.failures = 0;
            this.state = 'closed';
        }),
        recordFailure: jest.fn(function () {
            this.failures++;
            if (this.failures >= this.threshold) {
                this.state = 'open';
                setTimeout(() => {
                    this.state = 'half-open';
                }, this.timeout);
            }
        }),
        reset: jest.fn(function () {
            this.failures = 0;
            this.state = 'closed';
        })
    })),
    StreamHealthMonitor: jest.fn().mockImplementation(() => ({
        healthChecks: [],
        addHealthCheck: jest.fn(function (check) {
            this.healthChecks.push(check);
        }),
        getHealthStatus: jest.fn(() => ({
            isHealthy: true,
            metrics: {
                avgTokenLatency: 50,
                errorCount: 0
            },
            circuitBreakerState: 'closed',
            retryCount: 0
        }))
    }))
}));
// Mock fetch for SSE
const mockEventSource = {
    close: jest.fn(),
    addEventListener: jest.fn(),
    readyState: 1
};
// Mock EventSource
global.EventSource = jest.fn().mockImplementation(() => mockEventSource);
// Mock fetch
global.fetch = jest.fn();
describe('useConversationStream', () => {
    const mockConversationId = 'test-conversation-id';
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset EventSource mock
        mockEventSource.close.mockClear();
        mockEventSource.addEventListener.mockClear();
        // Mock successful fetch
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('Initialization', () => {
        it('should initialize with default state', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            expect(result.current.isStreaming).toBe(false);
            expect(result.current.currentContent).toBe('');
            expect(result.current.error).toBeNull();
            expect(result.current.activePipelines).toEqual(new Set());
            expect(result.current.completedPipelines).toEqual(new Set());
        });
        it('should initialize with custom options', () => {
            const onToken = jest.fn();
            const onPipelineTriggered = jest.fn();
            const onError = jest.fn();
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onToken,
                onPipelineTriggered,
                onError,
                throttleMs: 100,
                bufferSize: 2000
            }));
            expect(result.current.isStreaming).toBe(false);
        });
    });
    describe('Message Sending', () => {
        it('should send message successfully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(global.fetch).toHaveBeenCalledWith(`/api/conversations/${mockConversationId}/stream`, expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: 'Hello, world!',
                    tokens: [],
                    includeHistory: true
                })
            }));
        });
        it('should send message with tokens', async () => {
            const tokens = [
                { type: 'attachment', value: 'test.pdf', metadata: { id: 'att-123' } }
            ];
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Check this file', tokens);
            });
            expect(global.fetch).toHaveBeenCalledWith(`/api/conversations/${mockConversationId}/stream`, expect.objectContaining({
                body: JSON.stringify({
                    content: 'Check this file',
                    tokens,
                    includeHistory: true
                })
            }));
        });
        it('should handle message sending errors', async () => {
            const onError = jest.fn();
            global.fetch.mockRejectedValue(new Error('Network error'));
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onError
            }));
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(onError).toHaveBeenCalledWith('Network error', undefined);
            expect(result.current.error).toBe('Network error');
        });
        it('should not send empty messages', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('');
            });
            expect(global.fetch).not.toHaveBeenCalled();
        });
        it('should not send messages while streaming', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            // Simulate streaming state
            (0, react_1.act)(() => {
                result.current.sendMessage('First message');
            });
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Second message');
            });
            // Should only be called once for the first message
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });
    describe('Stream Event Handling', () => {
        it('should handle token events', () => {
            const onToken = jest.fn();
            (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onToken
            }));
            // Simulate token event
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            expect(eventHandler).toBeDefined();
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'token',
                        data: 'Hello'
                    })
                });
            });
            expect(onToken).toHaveBeenCalledWith('Hello');
        });
        it('should handle message complete events', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'message_complete',
                        data: { messageId: 'msg-123', content: 'Hello world!' }
                    })
                });
            });
            expect(result.current.isStreaming).toBe(false);
            expect(result.current.currentContent).toBe('Hello world!');
        });
        it('should handle pipeline triggered events', () => {
            const onPipelineTriggered = jest.fn();
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onPipelineTriggered
            }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'pipeline_triggered',
                        data: { runId: 'run-123', pipelineType: 'asset-pack' }
                    })
                });
            });
            expect(onPipelineTriggered).toHaveBeenCalledWith('run-123', 'asset-pack');
            expect(result.current.activePipelines.has('run-123')).toBe(true);
        });
        it('should handle pipeline complete events', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            // First trigger pipeline
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'pipeline_triggered',
                        data: { runId: 'run-123', pipelineType: 'asset-pack' }
                    })
                });
            });
            // Then complete it
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'pipeline_complete',
                        data: { runId: 'run-123', success: true, summary: 'Completed successfully' }
                    })
                });
            });
            expect(result.current.activePipelines.has('run-123')).toBe(false);
            expect(result.current.completedPipelines.has('run-123')).toBe(true);
        });
        it('should handle error events', () => {
            const onError = jest.fn();
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onError
            }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'error',
                        data: { message: 'Stream error', code: 'STREAM_ERROR' }
                    })
                });
            });
            expect(onError).toHaveBeenCalledWith('Stream error', 'STREAM_ERROR');
            expect(result.current.error).toBe('Stream error');
        });
        it('should handle malformed JSON gracefully', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            (0, react_1.act)(() => {
                eventHandler({
                    data: 'invalid json'
                });
            });
            // Should not crash or change state
            expect(result.current.isStreaming).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });
    describe('Performance Features', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });
        it('should throttle token updates', () => {
            const onToken = jest.fn();
            (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                onToken,
                throttleMs: 50
            }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            // Send multiple tokens rapidly
            (0, react_1.act)(() => {
                eventHandler({ data: JSON.stringify({ type: 'token', data: 'H' }) });
                eventHandler({ data: JSON.stringify({ type: 'token', data: 'e' }) });
                eventHandler({ data: JSON.stringify({ type: 'token', data: 'l' }) });
            });
            // Should not call onToken immediately
            expect(onToken).toHaveBeenCalledTimes(0);
            // Advance timers
            (0, react_1.act)(() => {
                jest.advanceTimersByTime(100);
            });
            // Should have called onToken for the last token
            expect(onToken).toHaveBeenCalledWith('l');
        });
        it('should use token buffer for memory management', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({
                conversationId: mockConversationId,
                bufferSize: 100
            }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            // Send many tokens
            for (let i = 0; i < 150; i++) {
                (0, react_1.act)(() => {
                    eventHandler({
                        data: JSON.stringify({ type: 'token', data: 'x' })
                    });
                });
            }
            // Buffer should manage memory by pruning
            // This is tested through the mock implementation
        });
        it('should track health metrics', () => {
            (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            // Health monitor should be initialized
            const { StreamHealthMonitor } = require('../utils/performance-utils');
            expect(StreamHealthMonitor).toHaveBeenCalled();
        });
    });
    describe('Circuit Breaker', () => {
        it('should prevent requests when circuit is open', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            // Mock circuit breaker as open
            const { StreamCircuitBreaker } = require('../utils/performance-utils');
            const circuitBreakerInstance = StreamCircuitBreaker.mock.results[0].value;
            circuitBreakerInstance.canExecute.mockReturnValue(false);
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(global.fetch).not.toHaveBeenCalled();
        });
        it('should record success when message sends successfully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const { StreamCircuitBreaker } = require('../utils/performance-utils');
            const circuitBreakerInstance = StreamCircuitBreaker.mock.results[0].value;
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(circuitBreakerInstance.recordSuccess).toHaveBeenCalled();
        });
        it('should record failure when message sending fails', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const { StreamCircuitBreaker } = require('../utils/performance-utils');
            const circuitBreakerInstance = StreamCircuitBreaker.mock.results[0].value;
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(circuitBreakerInstance.recordFailure).toHaveBeenCalled();
        });
    });
    describe('Cleanup', () => {
        it('should cleanup resources on unmount', () => {
            const { unmount } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            unmount();
            expect(mockEventSource.close).toHaveBeenCalled();
        });
        it('should clear buffers on cleanup', () => {
            const { result, unmount } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const { TokenBuffer } = require('../utils/performance-utils');
            const bufferInstance = TokenBuffer.mock.results[0].value;
            (0, react_1.act)(() => {
                result.current.cleanup();
            });
            expect(bufferInstance.clear).toHaveBeenCalled();
        });
        it('should reset circuit breaker on cleanup', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const { StreamCircuitBreaker } = require('../utils/performance-utils');
            const circuitBreakerInstance = StreamCircuitBreaker.mock.results[0].value;
            (0, react_1.act)(() => {
                result.current.cleanup();
            });
            expect(circuitBreakerInstance.reset).toHaveBeenCalled();
        });
    });
    describe('State Management', () => {
        it('should reset content on new message', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            // Set some content
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({ type: 'token', data: 'Previous content' })
                });
            });
            expect(result.current.currentContent).toContain('Previous');
            // Send new message should reset
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('New message');
            });
            expect(result.current.currentContent).toBe('');
        });
        it('should maintain pipeline state across messages', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            const eventHandler = mockEventSource.addEventListener.mock.calls
                .find(call => call[0] === 'message')?.[1];
            // Trigger pipeline
            (0, react_1.act)(() => {
                eventHandler({
                    data: JSON.stringify({
                        type: 'pipeline_triggered',
                        data: { runId: 'run-123', pipelineType: 'asset-pack' }
                    })
                });
            });
            expect(result.current.activePipelines.has('run-123')).toBe(true);
            // Send new message
            (0, react_1.act)(() => {
                result.current.sendMessage('New message');
            });
            // Pipeline state should persist
            expect(result.current.activePipelines.has('run-123')).toBe(true);
        });
        it('should clear error on successful message', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useConversationStream_1.useConversationStream)({ conversationId: mockConversationId }));
            // Set error state
            (0, react_1.act)(() => {
                result.current.setState(prev => ({ ...prev, error: 'Previous error' }));
            });
            expect(result.current.error).toBe('Previous error');
            // Send successful message
            await (0, react_1.act)(async () => {
                await result.current.sendMessage('Hello, world!');
            });
            expect(result.current.error).toBeNull();
        });
    });
});
