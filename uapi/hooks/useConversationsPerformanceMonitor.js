/**
 * CONVERSATIONS PERFORMANCE MONITOR - PRODUCTION-GRADE PERFORMANCE TRACKING
 *
 * Monitors and optimizes Conversations rich response performance for production deployment.
 * Ensures the conversations interface remains responsive under load.
 */
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConversationsPerformanceMonitor = useConversationsPerformanceMonitor;
const react_1 = require("react");
const edge_case_handler_1 = require("@/components/conversations/utilities/edge-case-handler");
const DEFAULT_CONFIG = {
    maxRenderTime: 1000, // 1 second max render time
    memoryThreshold: 0.8, // 80% memory usage threshold
    fpsTarget: 60, // Target 60 FPS
    enableReporting: true
};
function useConversationsPerformanceMonitor(config = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const [metrics, setMetrics] = (0, react_1.useState)(new Map());
    const [performanceState, setPerformanceState] = (0, react_1.useState)({
        isOptimized: true,
        currentFPS: 60,
        memoryUsage: 0,
        renderingRichResponses: 0
    });
    const renderStartTimes = (0, react_1.useRef)(new Map());
    const frameTimestamps = (0, react_1.useRef)([]);
    const observerRef = (0, react_1.useRef)(null);
    /**
     * Start monitoring a rich response render
     */
    const startRichResponseRender = (0, react_1.useCallback)((richResponseId) => {
        renderStartTimes.current.set(richResponseId, performance.now());
        setPerformanceState(prev => ({
            ...prev,
            renderingRichResponses: prev.renderingRichResponses + 1
        }));
    }, []);
    /**
     * End monitoring a rich response render
     */
    const endRichResponseRender = (0, react_1.useCallback)((richResponseId, successful = true) => {
        const startTime = renderStartTimes.current.get(richResponseId);
        if (!startTime)
            return;
        const renderTime = performance.now() - startTime;
        renderStartTimes.current.delete(richResponseId);
        // Update metrics
        setMetrics(prev => {
            const newMetrics = new Map(prev);
            const existing = newMetrics.get(richResponseId) || {
                richResponseId,
                renderTime: 0,
                updateTime: 0,
                memoryUsage: 0,
                interactionCount: 0,
                errorCount: 0
            };
            newMetrics.set(richResponseId, {
                ...existing,
                renderTime,
                errorCount: successful ? existing.errorCount : existing.errorCount + 1
            });
            return newMetrics;
        });
        // Check for slow rendering
        if (renderTime > finalConfig.maxRenderTime) {
            const optimization = edge_case_handler_1.conversationEdgeCaseHandler.handleSlowRendering(renderTime, richResponseId);
            if (optimization.shouldOptimize) {
                console.warn(`Slow rich response render detected: ${renderTime}ms`, optimization.optimizations);
                // Apply optimizations
                optimization.optimizations.forEach(opt => {
                    switch (opt) {
                        case 'show_simplified_fallback':
                            // Trigger simplified fallback
                            break;
                        case 'defer_heavy_computations':
                            // Defer heavy operations
                            break;
                        case 'emergency_fallback_to_text':
                            // Emergency text-only fallback
                            break;
                    }
                });
            }
        }
        setPerformanceState(prev => ({
            ...prev,
            renderingRichResponses: Math.max(0, prev.renderingRichResponses - 1)
        }));
    }, [finalConfig.maxRenderTime]);
    /**
     * Monitor FPS and performance
     */
    (0, react_1.useEffect)(() => {
        let animationFrameId;
        const updateFPS = () => {
            const now = performance.now();
            frameTimestamps.current.push(now);
            // Keep only last second of frames
            const oneSecondAgo = now - 1000;
            frameTimestamps.current = frameTimestamps.current.filter(time => time > oneSecondAgo);
            const currentFPS = frameTimestamps.current.length;
            setPerformanceState(prev => ({
                ...prev,
                currentFPS,
                isOptimized: currentFPS >= finalConfig.fpsTarget * 0.9 // 90% of target FPS
            }));
            animationFrameId = requestAnimationFrame(updateFPS);
        };
        updateFPS();
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [finalConfig.fpsTarget]);
    /**
     * Monitor memory usage
     */
    (0, react_1.useEffect)(() => {
        const monitorMemory = () => {
            if ('memory' in performance) {
                const memoryInfo = performance.memory;
                const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
                setPerformanceState(prev => ({
                    ...prev,
                    memoryUsage: usageRatio
                }));
                // Handle memory pressure
                if (usageRatio > finalConfig.memoryThreshold) {
                    const optimization = edge_case_handler_1.conversationEdgeCaseHandler.handleMemoryPressure();
                    if (optimization.shouldDegradePerformance) {
                        console.warn('Memory pressure detected, applying optimizations:', optimization.optimizationStrategies);
                        // Apply memory optimizations
                        optimization.optimizationStrategies.forEach(strategy => {
                            switch (strategy) {
                                case 'disable_animations':
                                    document.documentElement.style.setProperty('--animation-duration', '0s');
                                    break;
                                case 'reduce_rich_response_complexity':
                                    // Signal to reduce rich response complexity
                                    window.dispatchEvent(new CustomEvent('conversations-reduce-complexity'));
                                    break;
                                case 'enable_virtualization':
                                    // Enable virtualization for large lists
                                    window.dispatchEvent(new CustomEvent('conversations-enable-virtualization'));
                                    break;
                                case 'emergency_memory_cleanup':
                                    // Force garbage collection if available
                                    if ('gc' in window) {
                                        window.gc();
                                    }
                                    break;
                            }
                        });
                    }
                }
            }
        };
        const memoryInterval = setInterval(monitorMemory, 5000); // Check every 5 seconds
        return () => {
            clearInterval(memoryInterval);
        };
    }, [finalConfig.memoryThreshold]);
    /**
     * Setup performance observer for detailed metrics
     */
    (0, react_1.useEffect)(() => {
        if (!finalConfig.enableReporting || !('PerformanceObserver' in window)) {
            return;
        }
        try {
            observerRef.current = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name.includes('conversations-rich-response')) {
                        // Track rich response performance
                        const richResponseId = entry.name.split('-').pop() || '';
                        setMetrics(prev => {
                            const newMetrics = new Map(prev);
                            const existing = newMetrics.get(richResponseId) || {
                                richResponseId,
                                renderTime: entry.duration,
                                updateTime: 0,
                                memoryUsage: 0,
                                interactionCount: 0,
                                errorCount: 0
                            };
                            newMetrics.set(richResponseId, {
                                ...existing,
                                renderTime: entry.duration
                            });
                            return newMetrics;
                        });
                    }
                });
            });
            observerRef.current.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        }
        catch (error) {
            console.warn('Performance Observer not fully supported:', error);
        }
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [finalConfig.enableReporting]);
    /**
     * Record rich response interaction
     */
    const recordInteraction = (0, react_1.useCallback)((richResponseId) => {
        setMetrics(prev => {
            const newMetrics = new Map(prev);
            const existing = newMetrics.get(richResponseId) || {
                richResponseId,
                renderTime: 0,
                updateTime: 0,
                memoryUsage: 0,
                interactionCount: 0,
                errorCount: 0
            };
            newMetrics.set(richResponseId, {
                ...existing,
                interactionCount: existing.interactionCount + 1
            });
            return newMetrics;
        });
    }, []);
    /**
     * Record rich response error
     */
    const recordError = (0, react_1.useCallback)((richResponseId, error) => {
        setMetrics(prev => {
            const newMetrics = new Map(prev);
            const existing = newMetrics.get(richResponseId) || {
                richResponseId,
                renderTime: 0,
                updateTime: 0,
                memoryUsage: 0,
                interactionCount: 0,
                errorCount: 0
            };
            newMetrics.set(richResponseId, {
                ...existing,
                errorCount: existing.errorCount + 1
            });
            return newMetrics;
        });
        // Report error to monitoring service
        if (finalConfig.enableReporting) {
            console.error(`Conversations Rich Response Error [${richResponseId}]:`, error);
        }
    }, [finalConfig.enableReporting]);
    /**
     * Get performance summary
     */
    const getPerformanceSummary = (0, react_1.useCallback)(() => {
        const allMetrics = Array.from(metrics.values());
        return {
            totalRichResponses: allMetrics.length,
            averageRenderTime: allMetrics.reduce((sum, m) => sum + m.renderTime, 0) / allMetrics.length || 0,
            totalInteractions: allMetrics.reduce((sum, m) => sum + m.interactionCount, 0),
            totalErrors: allMetrics.reduce((sum, m) => sum + m.errorCount, 0),
            errorRate: allMetrics.length > 0 ? (allMetrics.reduce((sum, m) => sum + m.errorCount, 0) / allMetrics.length) : 0,
            currentPerformance: performanceState
        };
    }, [metrics, performanceState]);
    /**
     * Optimize rich response based on performance data
     */
    const optimizeRichResponse = (0, react_1.useCallback)((richResponse) => {
        const metric = metrics.get(richResponse.id);
        // Apply performance-based optimizations
        if (metric && (metric.renderTime > finalConfig.maxRenderTime || metric.errorCount > 2)) {
            return {
                ...richResponse,
                metadata: {
                    ...richResponse.metadata,
                    renderMode: 'compact', // Force compact mode for slow responses
                    performance: {
                        renderCost: 'low',
                        updateFrequency: 'static'
                    }
                }
            };
        }
        // Optimize based on memory pressure
        if (performanceState.memoryUsage > finalConfig.memoryThreshold) {
            return {
                ...richResponse,
                metadata: {
                    ...richResponse.metadata,
                    renderMode: richResponse.metadata.renderMode === 'expanded' ? 'compact' : richResponse.metadata.renderMode,
                    performance: {
                        renderCost: 'low',
                        updateFrequency: 'static'
                    }
                },
                liveUpdate: undefined // Disable live updates under memory pressure
            };
        }
        return richResponse;
    }, [metrics, performanceState, finalConfig]);
    /**
     * Reset metrics for a specific rich response
     */
    const resetMetrics = (0, react_1.useCallback)((richResponseId) => {
        setMetrics(prev => {
            const newMetrics = new Map(prev);
            newMetrics.delete(richResponseId);
            return newMetrics;
        });
    }, []);
    return {
        // Performance monitoring
        startRichResponseRender,
        endRichResponseRender,
        recordInteraction,
        recordError,
        // Performance state
        performanceState,
        metrics: Object.fromEntries(metrics),
        // Analysis and optimization
        getPerformanceSummary,
        optimizeRichResponse,
        resetMetrics,
        // Health checks
        isHealthy: performanceState.isOptimized && performanceState.memoryUsage < finalConfig.memoryThreshold,
        shouldDegradePerformance: performanceState.currentFPS < finalConfig.fpsTarget * 0.7 || performanceState.memoryUsage > finalConfig.memoryThreshold
    };
}
exports.default = useConversationsPerformanceMonitor;
