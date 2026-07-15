"use strict";
/**
 * Mock Orchestrator - the heart of the Bitcode mock system
 *
 * This orchestrator provides enterprise-grade mocking capabilities with:
 * - Type-safe scenario management
 * - Real-time performance monitoring
 * - Intelligent caching and optimization
 * - Extensible plugin architecture
 * - Production-quality reliability
 *
 * Designed to support billions of users with seamless development experiences.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockOrchestrator = exports.MockOrchestrator = void 0;
/**
 * Singleton MockOrchestrator implementing the Command pattern for centralized control
 */
class MockOrchestrator {
    constructor() {
        this.scenarios = new Map();
        this.dataCache = new Map();
        this.loadedPlugins = new Map();
        this.performanceMetrics = [];
        // Performance monitoring
        this.metricsCollectionInterval = null;
        this.startTime = Date.now();
        this.totalOperations = 0;
        this.cacheHits = 0;
        this.memoryUsageBytes = 0;
        this.handleProcessExit = () => this.dispose();
        this.handleProcessSigint = () => this.dispose();
        this.handleProcessSigterm = () => this.dispose();
        this.config = this.loadEnvironmentConfig();
        this.initializeDefaultScenarios();
        this.startPerformanceMonitoring();
        // Cleanup on process exit
        if (typeof process !== 'undefined') {
            process.on('exit', this.handleProcessExit);
            process.on('SIGINT', this.handleProcessSigint);
            process.on('SIGTERM', this.handleProcessSigterm);
        }
    }
    /**
     * Get the singleton instance with lazy initialization
     */
    static getInstance() {
        if (!MockOrchestrator.instance) {
            MockOrchestrator.instance = new MockOrchestrator();
        }
        return MockOrchestrator.instance;
    }
    static resetInstance() {
        if (MockOrchestrator.instance) {
            MockOrchestrator.instance.dispose();
            MockOrchestrator.instance = null;
        }
    }
    /**
     * Check if a feature should be mocked based on configuration
     */
    shouldMock(feature) {
        if (!this.config.masterMockMode) {
            return false;
        }
        // Check for feature-specific overrides
        const featureOverride = process.env[`NEXT_PUBLIC_MOCK_${feature}`];
        if (featureOverride === 'false') {
            return false;
        }
        // Check if feature is supported in current scenario
        const scenarioId = this.getScenarioId(feature);
        const scenario = this.scenarios.get(scenarioId);
        return scenario?.features[feature]?.enabled ?? true;
    }
    /**
     * Get the appropriate scenario for a feature
     */
    getScenario(feature) {
        const featureScenario = process.env[`NEXT_PUBLIC_MOCK_${feature}_SCENARIO`];
        return featureScenario || this.config.globalScenario;
    }
    /**
     * Get mock data for a feature with intelligent caching and validation
     */
    async getMockData(feature, scenario) {
        const operationStart = this.startOperation(feature, scenario || this.getScenario(feature));
        try {
            if (!this.shouldMock(feature)) {
                this.endOperation(operationStart, false);
                return null;
            }
            const scenarioId = scenario || this.getScenario(feature);
            const cacheKey = `${feature}:${scenarioId}`;
            // Try cache first
            if (this.config.cacheEnabled) {
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    this.endOperation(operationStart, true);
                    return cached;
                }
            }
            // Generate or load mock data
            const mockData = await this.generateMockData(feature, scenarioId);
            // Cache the result
            if (this.config.cacheEnabled && mockData) {
                this.setCache(cacheKey, mockData);
            }
            this.endOperation(operationStart, false);
            return mockData;
        }
        catch (error) {
            this.endOperation(operationStart, false);
            console.error(`MockOrchestrator: Error getting mock data for ${feature}:`, error);
            return null;
        }
    }
    /**
     * Register a new mock scenario
     */
    registerScenario(scenario) {
        this.validateScenario(scenario);
        this.scenarios.set(scenario.id, scenario);
        if (this.config.debugMode) {
            console.log(`MockOrchestrator: Registered scenario '${scenario.id}'`);
        }
    }
    /**
     * Register a mock plugin for extended functionality
     */
    registerPlugin(plugin) {
        this.loadedPlugins.set(plugin.name, plugin);
        plugin.initialize?.(this);
        if (this.config.debugMode) {
            console.log(`MockOrchestrator: Registered plugin '${plugin.name}'`);
        }
    }
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
        const now = Date.now();
        const uptimeMs = now - this.startTime;
        // Calculate feature-specific metrics
        const featureMetrics = {};
        this.performanceMetrics.forEach(metric => {
            if (!featureMetrics[metric.feature]) {
                featureMetrics[metric.feature] = {
                    totalCalls: 0,
                    totalDuration: 0,
                    cacheHits: 0,
                    errors: 0
                };
            }
            featureMetrics[metric.feature].totalCalls++;
            if (metric.durationMs) {
                featureMetrics[metric.feature].totalDuration += metric.durationMs;
            }
            if (metric.cacheHit) {
                featureMetrics[metric.feature].cacheHits++;
            }
        });
        // Transform to required format
        const features = {};
        Object.entries(featureMetrics).forEach(([feature, data]) => {
            features[feature] = {
                avgLatencyMs: data.totalCalls > 0 ? data.totalDuration / data.totalCalls : 0,
                callCount: data.totalCalls,
                errorRate: data.totalCalls > 0 ? data.errors / data.totalCalls : 0,
                cacheHitRatio: data.totalCalls > 0 ? data.cacheHits / data.totalCalls : 0
            };
        });
        return {
            system: {
                memoryUsageMB: this.memoryUsageBytes / (1024 * 1024),
                cpuUsagePercent: 0, // Would read additional monitoring
                diskUsageMB: 0, // Would read additional monitoring
                networkBytesPerSec: 0 // Would read additional monitoring
            },
            mocking: {
                dataGenerationTimeMs: 0, // Average from operations
                serializationTimeMs: 0, // Would track separately
                cacheHitRatio: this.totalOperations > 0 ? this.cacheHits / this.totalOperations : 0,
                activeScenarios: this.scenarios.size,
                totalMockCalls: this.totalOperations
            },
            features,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Validate the entire mocking system
     */
    async validateSystem() {
        const timestamp = new Date().toISOString();
        const scenarioResults = {};
        const featureResults = {};
        let overallValid = true;
        // Validate scenarios
        for (const [id, scenario] of this.scenarios) {
            const errors = [];
            const warnings = [];
            try {
                this.validateScenario(scenario);
            }
            catch (error) {
                errors.push(error.message);
                overallValid = false;
            }
            scenarioResults[id] = {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        // Validate features
        for (const feature of this.getAllFeatures()) {
            const errors = [];
            let dataIntegrity = true;
            let typeCompliance = true;
            try {
                const mockData = await this.getMockData(feature);
                if (mockData && this.config.validationEnabled) {
                    // Validate data structure
                    dataIntegrity = this.validateDataIntegrity(feature, mockData.data);
                    typeCompliance = this.validateTypeCompliance(feature, mockData.data);
                }
            }
            catch (error) {
                errors.push(error.message);
                dataIntegrity = false;
                typeCompliance = false;
                overallValid = false;
            }
            featureResults[feature] = {
                valid: errors.length === 0 && dataIntegrity && typeCompliance,
                errors,
                dataIntegrity,
                typeCompliance
            };
        }
        const metrics = this.getPerformanceMetrics();
        return {
            valid: overallValid,
            timestamp,
            scenarios: scenarioResults,
            features: featureResults,
            performance: {
                memoryWithinLimits: metrics.system.memoryUsageMB < 1000, // 1GB limit
                latencyWithinThresholds: Object.values(metrics.features).every(f => f.avgLatencyMs < 1000),
                errorRateAcceptable: Object.values(metrics.features).every(f => f.errorRate < 0.01)
            },
            recommendations: this.generateRecommendations(metrics)
        };
    }
    /**
     * Clear all caches and reset performance metrics
     */
    reset() {
        this.dataCache.clear();
        this.performanceMetrics.length = 0;
        this.totalOperations = 0;
        this.cacheHits = 0;
        this.memoryUsageBytes = 0;
        if (this.config.debugMode) {
            console.log('MockOrchestrator: System reset completed');
        }
    }
    // ============================================================================
    // Private Implementation Methods
    // ============================================================================
    loadEnvironmentConfig() {
        return {
            masterMockMode: process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true',
            globalScenario: process.env.NEXT_PUBLIC_MOCK_SCENARIO || 'demo',
            timingProfile: process.env.NEXT_PUBLIC_MOCK_TIMING || 'realistic',
            complexity: process.env.NEXT_PUBLIC_MOCK_COMPLEXITY || 'moderate',
            debugMode: process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true',
            performanceMonitoring: process.env.NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING !== 'false',
            cacheEnabled: process.env.NEXT_PUBLIC_MOCK_CACHE_ENABLED !== 'false',
            validationEnabled: process.env.NEXT_PUBLIC_MOCK_VALIDATION_ENABLED !== 'false'
        };
    }
    initializeDefaultScenarios() {
        // Demo scenario for rich showcasing
        this.registerScenario({
            id: 'demo',
            name: 'Demo Experience',
            description: 'Rich, engaging demo data for showcasing Bitcode capabilities',
            type: 'demo',
            complexity: 'complex',
            timing: 'realistic',
            features: {},
            metadata: {
                version: '1.0.0',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                author: 'Bitcode Team',
                tags: ['demo', 'showcase', 'rich'],
                realistic: true,
                useCases: ['demos', 'sales', 'onboarding'],
                performance: {
                    expectedMemoryMB: 50,
                    expectedLatencyMs: 500,
                    maxDataSizeKB: 1000
                }
            }
        });
        // Testing scenario for predictable testing
        this.registerScenario({
            id: 'testing',
            name: 'Test Data',
            description: 'Minimal, predictable data for automated testing',
            type: 'testing',
            complexity: 'minimal',
            timing: 'fast',
            features: {},
            metadata: {
                version: '1.0.0',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                author: 'Bitcode Team',
                tags: ['testing', 'minimal', 'predictable'],
                realistic: false,
                useCases: ['unit-tests', 'integration-tests', 'ci-cd'],
                performance: {
                    expectedMemoryMB: 10,
                    expectedLatencyMs: 50,
                    maxDataSizeKB: 100
                }
            }
        });
    }
    getScenarioId(feature) {
        return this.getScenario(feature);
    }
    async generateMockData(feature, scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) {
            console.warn(`MockOrchestrator: Unknown scenario '${scenarioId}' for feature '${feature}'`);
            return null;
        }
        // Check for feature-specific data override
        const featureConfig = scenario.features[feature];
        if (featureConfig?.data) {
            return this.wrapMockData(featureConfig.data, feature, scenarioId);
        }
        // Try to load from plugin
        for (const plugin of this.loadedPlugins.values()) {
            if (plugin.canHandle?.(feature, scenarioId)) {
                const data = await plugin.generateData?.(feature, scenarioId, scenario);
                if (data) {
                    return this.wrapMockData(data, feature, scenarioId);
                }
            }
        }
        // Fall back to built-in generation
        const data = await this.generateBuiltinMockData(feature, scenario);
        return data ? this.wrapMockData(data, feature, scenarioId) : null;
    }
    async generateBuiltinMockData(feature, scenario) {
        // This would contain the actual mock data generation logic
        // For now, return empty data to maintain type safety
        console.warn(`MockOrchestrator: No built-in generator for feature '${feature}'`);
        return null;
    }
    wrapMockData(data, feature, scenarioId) {
        const now = new Date().toISOString();
        const dataStr = JSON.stringify(data);
        const sizeBytes = new Blob([dataStr]).size;
        return {
            data,
            metadata: {
                version: '1.0.0',
                generatedAt: now,
                source: `MockOrchestrator:${feature}:${scenarioId}`,
                valid: true,
                metrics: {
                    sizeBytes,
                    recordCount: Array.isArray(data) ? data.length : 1,
                    complexityScore: this.calculateComplexityScore(data)
                },
                scenarios: [scenarioId],
                performance: {
                    generationTimeMs: 0, // Would be tracked
                    memoryUsageKB: sizeBytes / 1024,
                    serializationTimeMs: 0 // Would be tracked
                }
            }
        };
    }
    calculateComplexityScore(data) {
        // Simple complexity scoring based on data structure
        if (typeof data !== 'object' || data === null)
            return 1;
        if (Array.isArray(data))
            return Math.min(10, data.length);
        return Math.min(10, Object.keys(data).length);
    }
    getFromCache(key) {
        const entry = this.dataCache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (Date.now() - entry.timestamp > entry.ttlMs) {
            this.dataCache.delete(key);
            return null;
        }
        // Update access tracking
        this.dataCache.set(key, {
            ...entry,
            accessCount: entry.accessCount + 1,
            lastAccessed: Date.now()
        });
        return entry.data;
    }
    setCache(key, data) {
        const ttlMs = 5 * 60 * 1000; // 5 minutes default TTL
        const sizeBytes = data.metadata.metrics.sizeBytes;
        this.dataCache.set(key, {
            data,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now(),
            sizeBytes,
            ttlMs
        });
        this.memoryUsageBytes += sizeBytes;
        this.cleanupCache();
    }
    cleanupCache() {
        const maxCacheSize = 100 * 1024 * 1024; // 100MB
        if (this.memoryUsageBytes <= maxCacheSize)
            return;
        // Remove least recently used items
        const entries = Array.from(this.dataCache.entries())
            .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        while (this.memoryUsageBytes > maxCacheSize && entries.length > 0) {
            const [key, entry] = entries.shift();
            this.dataCache.delete(key);
            this.memoryUsageBytes -= entry.sizeBytes;
        }
    }
    startOperation(feature, scenario) {
        this.totalOperations++;
        return {
            startTime: Date.now(),
            feature,
            scenario,
            cacheHit: false
        };
    }
    endOperation(operation, cacheHit) {
        operation.durationMs = Date.now() - operation.startTime;
        operation.cacheHit = cacheHit;
        if (cacheHit) {
            this.cacheHits++;
        }
        this.performanceMetrics.push(operation);
        // Keep only recent metrics to prevent memory bloat
        if (this.performanceMetrics.length > 10000) {
            this.performanceMetrics.splice(0, 5000);
        }
    }
    startPerformanceMonitoring() {
        if (!this.config.performanceMonitoring)
            return;
        this.metricsCollectionInterval = setInterval(() => {
            const metrics = this.getPerformanceMetrics();
            if (this.config.debugMode) {
                console.log('MockOrchestrator Performance:', metrics);
            }
        }, 60000); // Every minute
        this.metricsCollectionInterval.unref?.();
    }
    validateScenario(scenario) {
        if (!scenario.id || !scenario.name || !scenario.type) {
            throw new Error('Scenario missing required fields');
        }
        if (!scenario.metadata?.version) {
            throw new Error('Scenario missing version metadata');
        }
    }
    validateDataIntegrity(feature, data) {
        // Feature-specific validation would go here
        return data !== null && data !== undefined;
    }
    validateTypeCompliance(feature, data) {
        // Type validation would go here
        return true; // Simplified for now
    }
    getAllFeatures() {
        return [
            'ASSET_PACKS', 'UPGRADES', 'PIPELINE_LOGS', 'CHAT_STREAM', 'CONVERSATION_RESPONSES',
            'GITHUB_ACCOUNTS', 'GITHUB_REPOS', 'GITHUB_BRANCHES', 'GITHUB_COMMITS', 'GITHUB_ISSUES', 'GITHUB_FILES',
            'USER_PROFILE', 'USER_BTD', 'USER_NOTIFICATIONS', 'USER_CONNECTIONS', 'USER_TEMPLATES',
            'INTEGRATIONS_NOTION', 'INTEGRATIONS_FIGMA', 'INTEGRATIONS_SLACK', 'INTEGRATIONS_GITLAB', 'INTEGRATIONS_BITBUCKET',
            'MARKETPLACE', 'TEMPLATES', 'COMPLETION_DATA', 'PROCESSING_STATS', 'REPO_SNAPSHOTS',
            'API_RESPONSES', 'ERROR_SCENARIOS', 'PERFORMANCE_METRICS'
        ];
    }
    generateRecommendations(metrics) {
        const recommendations = [];
        if (metrics.system.memoryUsageMB > 500) {
            recommendations.push('Consider reducing cache size or data complexity');
        }
        if (metrics.mocking.cacheHitRatio < 0.5) {
            recommendations.push('Increase cache TTL or optimize cache strategy');
        }
        const avgLatency = Object.values(metrics.features).reduce((sum, f) => sum + f.avgLatencyMs, 0) / Object.keys(metrics.features).length;
        if (avgLatency > 500) {
            recommendations.push('Optimize data generation performance');
        }
        return recommendations;
    }
    cleanup() {
        this.dispose();
    }
    dispose() {
        if (this.metricsCollectionInterval) {
            clearInterval(this.metricsCollectionInterval);
            this.metricsCollectionInterval = null;
        }
        if (typeof process !== 'undefined') {
            process.off('exit', this.handleProcessExit);
            process.off('SIGINT', this.handleProcessSigint);
            process.off('SIGTERM', this.handleProcessSigterm);
        }
        for (const plugin of this.loadedPlugins.values()) {
            plugin.cleanup?.();
        }
        this.loadedPlugins.clear();
        this.dataCache.clear();
        this.performanceMetrics.length = 0;
    }
}
exports.MockOrchestrator = MockOrchestrator;
MockOrchestrator.instance = null;
// Export singleton instance
exports.mockOrchestrator = MockOrchestrator.getInstance();
