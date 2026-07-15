"use strict";
/**
 * Streaming Pipeline Mock Engine
 *
 * Provides ultra-realistic pipeline execution simulation with:
 * - Real-time event streaming
 * - Intelligent timing algorithms
 * - Production-accurate phase progression
 * - Dynamic generation simulation
 * - Tool usage modeling
 * - Error injection capabilities
 * - Performance metrics tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStreamingPipelineEngine = exports.StreamingPipelineEngine = void 0;
/**
 * Advanced streaming engine for pipeline simulation
 */
class StreamingPipelineEngine {
    constructor(config) {
        this.eventBuffer = [];
        this.performanceTracker = new PipelinePerformanceTracker();
        this.currentPhaseIndex = 0;
        this.isStreaming = false;
        this.streamController = null;
        this.config = config;
    }
    /**
     * Create a realistic streaming response for pipeline execution
     */
    createStream() {
        const encoder = new TextEncoder();
        return new ReadableStream({
            start: (controller) => {
                this.streamController = controller;
                this.startPipelineSimulation(controller, encoder);
            },
            cancel: () => {
                this.stopStreaming();
            }
        });
    }
    /**
     * Generate a complete pipeline execution asynchronously
     */
    async *generatePipelineEvents() {
        this.isStreaming = true;
        this.performanceTracker.start();
        try {
            // Generate initial connection event
            yield this.createInitialEvent();
            // Execute each phase
            for (let i = 0; i < this.config.phases.length; i++) {
                this.currentPhaseIndex = i;
                const phase = this.config.phases[i];
                yield* this.executePhase(phase);
                // Inter-phase delay for realism
                if (i < this.config.phases.length - 1) {
                    await this.delay(this.calculateInterPhaseDelay());
                }
            }
            // Generate completion event
            yield this.createCompletionEvent();
        }
        catch (error) {
            yield this.createErrorEvent(error);
        }
        finally {
            this.isStreaming = false;
            this.performanceTracker.end();
        }
    }
    /**
     * Get real-time performance metrics for the current simulation
     */
    getPerformanceMetrics() {
        return this.performanceTracker.getMetrics();
    }
    // ============================================================================
    // Private Implementation
    // ============================================================================
    async startPipelineSimulation(controller, encoder) {
        try {
            for await (const event of this.generatePipelineEvents()) {
                if (!this.isStreaming)
                    break;
                const eventData = this.formatEventForStream(event);
                controller.enqueue(encoder.encode(eventData));
                // Add realistic streaming delay
                await this.delay(this.calculateEventDelay(event));
            }
        }
        catch (error) {
            console.error('StreamingPipelineEngine: Error during simulation:', error);
            const errorEvent = this.createErrorEvent(error);
            const errorData = this.formatEventForStream(errorEvent);
            controller.enqueue(encoder.encode(errorData));
        }
        finally {
            controller.close();
        }
    }
    async *executePhase(phase) {
        // Phase start event
        yield this.createPhaseStartEvent(phase);
        const phaseStartTime = Date.now();
        let elapsedTime = 0;
        // Execute phase events with realistic timing
        const events = this.generatePhaseEvents(phase);
        const llmCalls = [...phase.llmCalls];
        const toolUsage = [...phase.toolUsage];
        // Interleave events, generations, and tool usage
        const phaseActions = this.interleavePhaseActions(events, llmCalls, toolUsage);
        for (const action of phaseActions) {
            if (!this.isStreaming)
                break;
            // Check if we should inject an error
            if (this.shouldInjectError(phase)) {
                yield this.createPhaseErrorEvent(phase, 'Simulated error for testing');
                break;
            }
            // Execute the action
            if (action.type === 'event') {
                yield this.createStatusEvent(action.data, phase);
            }
            else if (action.type === 'generation') {
                yield* this.executeLlmCall(action.data, phase);
            }
            else if (action.type === 'tool_usage') {
                yield* this.executeToolUsage(action.data, phase);
            }
            // Update elapsed time and add realistic delay
            const actionDelay = this.calculateActionDelay(action, phase);
            await this.delay(actionDelay);
            elapsedTime += actionDelay;
            // Check phase timeout
            if (elapsedTime >= phase.durationMs) {
                break;
            }
        }
        // Phase completion event
        yield this.createPhaseEndEvent(phase, Date.now() - phaseStartTime);
    }
    async *executeLlmCall(llmCall, phase) {
        // Generation start
        yield this.createLlmCallStartEvent(llmCall, phase);
        // Simulate thinking time
        const thinkingDelay = this.calculateLlmThinkingDelay(llmCall);
        await this.delay(thinkingDelay);
        // Generation response
        yield this.createLlmCallResponseEvent(llmCall, phase);
        // Track performance
        this.performanceTracker.recordLlmCall(llmCall, thinkingDelay);
    }
    async *executeToolUsage(toolUsage, phase) {
        // Tool usage start
        yield this.createToolUsageStartEvent(toolUsage, phase);
        // Simulate tool execution time
        const executionDelay = this.calculateToolExecutionDelay(toolUsage);
        await this.delay(executionDelay);
        // Tool usage result
        yield this.createToolUsageResultEvent(toolUsage, phase);
        // Track performance
        this.performanceTracker.recordToolUsage(toolUsage, executionDelay);
    }
    createInitialEvent() {
        return {
            type: 'status_update',
            timestamp: new Date().toISOString(),
            phase: 'Initializing',
            payload: {
                step: 'Initializing',
                progress: 'in-progress',
                message: 'Connecting to agents...',
                detail: `Engaged at ${this.getFormattedTimestamp()}`
            },
            executionState: {
                phase: 'Setup',
                agent: 'SDIVFAgent'
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createCompletionEvent() {
        const completionData = this.generateCompletionData();
        return {
            type: 'completion',
            timestamp: new Date().toISOString(),
            phase: 'Complete',
            payload: {
                type: 'completion',
                result: completionData,
                duration: this.performanceTracker.getTotalDuration()
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createErrorEvent(error) {
        return {
            type: 'error',
            timestamp: new Date().toISOString(),
            phase: this.getCurrentPhase()?.name || 'Unknown',
            payload: {
                type: 'error',
                message: error.message,
                stack: error.stack
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createPhaseStartEvent(phase) {
        return {
            type: 'phase_start',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'status',
                step: phase.name,
                progress: 'starting',
                message: `Starting ${phase.name} phase...`
            },
            executionState: {
                phase: phase.name,
                agent: 'SDIVFAgent'
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createPhaseEndEvent(phase, duration) {
        return {
            type: 'phase_end',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'status',
                step: phase.name,
                progress: 'completed',
                message: `Completed ${phase.name} phase`
            },
            metrics: {
                durationMs: duration,
                memoryUsageKB: Math.floor(Math.random() * 1000) + 500,
                tokensUsed: this.calculatePhaseTokens(phase)
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createStatusEvent(eventType, phase) {
        const messages = this.getStatusMessages(eventType, phase);
        const message = messages[Math.floor(Math.random() * messages.length)];
        return {
            type: eventType,
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'status',
                step: phase.name,
                progress: 'in-progress',
                message
            },
            executionState: {
                phase: phase.name,
                agent: 'SDIVFAgent',
                step: this.getStepForEvent(eventType)
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createLlmCallStartEvent(llmCall, phase) {
        return {
            type: 'generation',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'generation',
                model: llmCall.model,
                purpose: llmCall.purpose,
                status: 'starting'
            },
            executionState: {
                phase: phase.name,
                agent: 'SDIVFAgent'
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createLlmCallResponseEvent(llmCall, phase) {
        return {
            type: 'generation',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'generation',
                model: llmCall.model,
                purpose: llmCall.purpose,
                status: 'completed',
                result: llmCall.response || this.generateLlmResponse(llmCall),
                tokens: llmCall.tokens
            },
            metrics: {
                durationMs: llmCall.durationMs,
                tokensUsed: llmCall.tokens.total,
                memoryUsageKB: Math.floor(Math.random() * 200) + 100
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createToolUsageStartEvent(toolUsage, phase) {
        return {
            type: 'tool_use',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'tool-use',
                tool: toolUsage.tool,
                operation: toolUsage.operation,
                status: 'starting'
            },
            executionState: {
                phase: phase.name,
                agent: 'SDIVFAgent'
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createToolUsageResultEvent(toolUsage, phase) {
        return {
            type: 'tool_use',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'tool-use',
                tool: toolUsage.tool,
                operation: toolUsage.operation,
                status: 'completed',
                result: toolUsage.result || this.generateToolResult(toolUsage)
            },
            metrics: {
                durationMs: toolUsage.durationMs,
                memoryUsageKB: Math.floor(Math.random() * 500) + 200
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    createPhaseErrorEvent(phase, errorMessage) {
        return {
            type: 'error',
            timestamp: new Date().toISOString(),
            phase: phase.name,
            payload: {
                type: 'error',
                message: errorMessage,
                phase: phase.name
            },
            metadata: {
                correlationId: this.generateCorrelationId(),
                runId: this.generateRunId(),
                userId: 'mock-user-id',
                realistic: this.config.realisticTiming
            }
        };
    }
    generatePhaseEvents(phase) {
        const baseEvents = ['thinking', 'status_update'];
        return [...baseEvents, ...phase.events];
    }
    interleavePhaseActions(events, llmCalls, toolUsage) {
        const actions = [];
        // Add events
        events.forEach(event => {
            actions.push({ type: 'event', data: event });
        });
        // Add generations
        llmCalls.forEach(call => {
            actions.push({ type: 'generation', data: call });
        });
        // Add tool usage
        toolUsage.forEach(tool => {
            actions.push({ type: 'tool_usage', data: tool });
        });
        // Shuffle for realistic interleaving
        return this.shuffleArray(actions);
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    shouldInjectError(phase) {
        if (!this.config.errorInjection?.enabled)
            return false;
        if (!this.config.errorInjection.phases.includes(phase.id))
            return false;
        return Math.random() < this.config.errorInjection.probability;
    }
    calculateEventDelay(event) {
        if (!this.config.realisticTiming)
            return 10;
        const baseDelay = {
            'status_update': 200,
            'thinking': 500,
            'generation': 100,
            'tool_use': 150,
            'completion': 50,
            'error': 10,
            'phase_start': 100,
            'phase_end': 100
        };
        const delay = baseDelay[event.type] || 100;
        return delay + Math.random() * delay * 0.5; // Add 0-50% variance
    }
    calculateActionDelay(action, phase) {
        if (!this.config.realisticTiming)
            return 50;
        const complexity = this.getComplexityFactor();
        const variance = Math.random() * 0.4 + 0.8; // 80-120% of base time
        return Math.floor(500 * complexity * variance);
    }
    calculateInterPhaseDelay() {
        if (!this.config.realisticTiming)
            return 100;
        return Math.floor(Math.random() * 1000) + 500; // 500-1500ms
    }
    calculateLlmThinkingDelay(llmCall) {
        if (!this.config.realisticTiming)
            return llmCall.durationMs;
        const complexityFactor = llmCall.tokens.total / 1000; // Scale by token count
        const baseTime = llmCall.durationMs;
        const variance = Math.random() * 0.4 + 0.8; // 80-120% variance
        return Math.floor(baseTime * complexityFactor * variance);
    }
    calculateToolExecutionDelay(toolUsage) {
        if (!this.config.realisticTiming)
            return toolUsage.durationMs;
        const variance = Math.random() * 0.6 + 0.7; // 70-130% variance
        return Math.floor(toolUsage.durationMs * variance);
    }
    getComplexityFactor() {
        const complexityMap = {
            'minimal': 0.5,
            'moderate': 1.0,
            'complex': 1.5,
            'enterprise': 2.0,
            'stress': 3.0
        };
        return complexityMap[this.config.scenario] || 1.0;
    }
    getCurrentPhase() {
        return this.config.phases[this.currentPhaseIndex];
    }
    calculatePhaseTokens(phase) {
        return phase.llmCalls.reduce((sum, call) => sum + call.tokens.total, 0);
    }
    getStatusMessages(eventType, phase) {
        const messageMap = {
            'thinking': [
                'Analyzing requirements...',
                'Processing context...',
                'Evaluating options...',
                'Synthesizing approach...'
            ],
            'status_update': [
                `Executing ${phase.name} operations...`,
                `Processing ${phase.name} data...`,
                `Advancing ${phase.name} workflow...`
            ]
        };
        return messageMap[eventType] || [`Executing ${eventType} in ${phase.name}`];
    }
    getStepForEvent(eventType) {
        const stepMap = {
            'thinking': 'analysis',
            'status_update': 'execution',
            'generation': 'reasoning',
            'tool_use': 'operations'
        };
        return stepMap[eventType] || 'processing';
    }
    generateLlmResponse(llmCall) {
        return `Mock LLM response for ${llmCall.purpose} using ${llmCall.model}`;
    }
    generateToolResult(toolUsage) {
        return {
            tool: toolUsage.tool,
            operation: toolUsage.operation,
            success: Math.random() > (1 - toolUsage.successProbability),
            result: `Mock result from ${toolUsage.tool}`
        };
    }
    generateCompletionData() {
        const writtenAssets = {
            summary: 'Mock pipeline execution completed successfully',
            fileChanges: {
                edited: 5,
                created: 2,
                deleted: 1,
                paths: ['src/mock.ts', 'README.md']
            }
        };
        const shippables = {
            pullRequest: {
                url: 'https://github.com/mock/repo/pull/123',
                number: 123,
                title: 'Mock Pull Request',
                type: 'pr'
            },
            fileChanges: writtenAssets.fileChanges,
            summary: writtenAssets.summary,
        };
        return {
            summary: writtenAssets.summary,
            display: 'Mock Asset Pack',
            shippables,
            assetPackSynthesisArtifacts: {
                ...shippables,
                proofEvidence: ['mock AssetPack evidence captured for reread'],
                reviewNotes: ['mock Read-satisfaction artifacts synthesized'],
            },
            writtenAssets,
            deliveryMechanism: shippables,
            semanticKind: 'asset-pack-written-asset',
            read: 'Mock retained corridor read',
            writtenAssetType: 'code-change',
            assetPack: {
                read: 'Mock retained corridor read',
                writtenAssetType: 'code-change',
                deliveryTarget: 'pr',
            },
            duration: this.performanceTracker.getTotalDuration(),
            taskType: 'read-satisfaction',
            processingStats: {
                time: `${Math.floor(this.performanceTracker.getTotalDuration() / 1000)}s`,
                tokens: {
                    input: 1000,
                    output: 500,
                    total: 1500
                },
                measuredBtd: 10
            },
            repoSnapshot: {
                org: 'mock-org',
                repo: 'mock-repo',
                branch: 'main',
                commit: 'abc123def456'
            }
        };
    }
    formatEventForStream(event) {
        return `data: ${JSON.stringify(event)}\n\n`;
    }
    generateCorrelationId() {
        return `mock-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateRunId() {
        return `run-${Math.random().toString(36).substr(2, 9)}`;
    }
    getFormattedTimestamp() {
        return new Date().toLocaleString('en-US', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
            hourCycle: 'h12'
        });
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    stopStreaming() {
        this.isStreaming = false;
    }
}
exports.StreamingPipelineEngine = StreamingPipelineEngine;
/**
 * Performance tracking for pipeline simulations
 */
class PipelinePerformanceTracker {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
        this.llmCalls = [];
        this.toolUsage = [];
        this.totalTokens = 0;
        this.memoryPeakKB = 0;
    }
    start() {
        this.startTime = Date.now();
    }
    end() {
        this.endTime = Date.now();
    }
    recordLlmCall(call, duration) {
        this.llmCalls.push({ call, duration });
        this.totalTokens += call.tokens.total;
    }
    recordToolUsage(usage, duration) {
        this.toolUsage.push({ usage, duration });
    }
    getTotalDuration() {
        return this.endTime - this.startTime;
    }
    getMetrics() {
        return {
            totalDurationMs: this.getTotalDuration(),
            generationCount: this.llmCalls.length,
            toolUsageCount: this.toolUsage.length,
            totalTokens: this.totalTokens,
            avgLlmCallDuration: this.llmCalls.length > 0
                ? this.llmCalls.reduce((sum, { duration }) => sum + duration, 0) / this.llmCalls.length
                : 0,
            avgToolUsageDuration: this.toolUsage.length > 0
                ? this.toolUsage.reduce((sum, { duration }) => sum + duration, 0) / this.toolUsage.length
                : 0,
            memoryPeakKB: this.memoryPeakKB
        };
    }
}
// Factory function for common pipeline configurations
exports.createStreamingPipelineEngine = {
    assetPack: (scenario = 'demo') => {
        return new StreamingPipelineEngine({
            scenario,
            pipelineType: 'asset-pack',
            totalDurationMs: 300000, // 5 minutes
            realisticTiming: true,
            phases: [
                {
                    id: 'setup',
                    name: 'Setup',
                    durationMs: 30000,
                    events: ['thinking', 'status_update'],
                    llmCalls: [
                        {
                            model: 'claude-3-sonnet',
                            purpose: 'Read analysis',
                            durationMs: 5000,
                            tokens: { prompt: 200, completion: 100, total: 300 },
                            successProbability: 0.95
                        }
                    ],
                    toolUsage: [
                        {
                            tool: 'git',
                            operation: 'clone',
                            durationMs: 3000,
                            successProbability: 0.98
                        }
                    ],
                    successProbability: 0.95
                },
                {
                    id: 'discovery',
                    name: 'Discovery',
                    durationMs: 60000,
                    events: ['thinking', 'status_update'],
                    llmCalls: [
                        {
                            model: 'claude-3-sonnet',
                            purpose: 'Code analysis',
                            durationMs: 15000,
                            tokens: { prompt: 1000, completion: 500, total: 1500 },
                            successProbability: 0.90
                        }
                    ],
                    toolUsage: [
                        {
                            tool: 'analyzer',
                            operation: 'scan',
                            durationMs: 10000,
                            successProbability: 0.95
                        }
                    ],
                    successProbability: 0.90
                },
                {
                    id: 'implementation',
                    name: 'Implementation',
                    durationMs: 120000,
                    events: ['thinking', 'status_update'],
                    llmCalls: [
                        {
                            model: 'claude-3-sonnet',
                            purpose: 'AssetPack synthesis',
                            durationMs: 25000,
                            tokens: { prompt: 1500, completion: 800, total: 2300 },
                            successProbability: 0.85
                        }
                    ],
                    toolUsage: [
                        {
                            tool: 'editor',
                            operation: 'modify',
                            durationMs: 8000,
                            successProbability: 0.92
                        }
                    ],
                    successProbability: 0.85
                },
                {
                    id: 'validation',
                    name: 'Validation',
                    durationMs: 60000,
                    events: ['thinking', 'status_update'],
                    llmCalls: [
                        {
                            model: 'claude-3-sonnet',
                            purpose: 'Code review',
                            durationMs: 12000,
                            tokens: { prompt: 800, completion: 300, total: 1100 },
                            successProbability: 0.95
                        }
                    ],
                    toolUsage: [
                        {
                            tool: 'linter',
                            operation: 'check',
                            durationMs: 5000,
                            successProbability: 0.98
                        }
                    ],
                    successProbability: 0.95
                },
                {
                    id: 'finish',
                    name: 'Finish',
                    durationMs: 30000,
                    events: ['thinking', 'status_update'],
                    llmCalls: [
                        {
                            model: 'claude-3-sonnet',
                            purpose: 'Shippable delivery evidence',
                            durationMs: 8000,
                            tokens: { prompt: 400, completion: 200, total: 600 },
                            successProbability: 0.98
                        }
                    ],
                    toolUsage: [
                        {
                            tool: 'git',
                            operation: 'push',
                            durationMs: 4000,
                            successProbability: 0.95
                        }
                    ],
                    successProbability: 0.98
                }
            ],
            performance: {
                simulateLatency: true,
                simulateMemoryUsage: true,
                simulateTokenUsage: true
            }
        });
    }
};
