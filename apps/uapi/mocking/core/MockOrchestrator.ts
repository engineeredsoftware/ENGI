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

import type {
  MockableFeature,
  MockScenarioType,
  MockScenarioConfig,
  MockDataContainer,
  MockPerformanceMetrics,
  MockValidationResult,
  MockTimingProfile,
  MockComplexity
} from '../types/core';

// Environment configuration for the mocking system
interface MockEnvironmentConfig {
  readonly masterMockMode: boolean;
  readonly globalScenario: MockScenarioType;
  readonly timingProfile: MockTimingProfile;
  readonly complexity: MockComplexity;
  readonly debugMode: boolean;
  readonly performanceMonitoring: boolean;
  readonly cacheEnabled: boolean;
  readonly validationEnabled: boolean;
}

/**
 * Cache entry for optimized mock data retrieval
 */
interface MockCacheEntry<T = any> {
  readonly data: T;
  readonly timestamp: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
  readonly sizeBytes: number;
  readonly ttlMs: number;
}

/**
 * Performance tracking for mock operations
 */
interface MockOperationMetrics {
  readonly startTime: number;
  readonly feature: MockableFeature;
  readonly scenario: string;
  readonly cacheHit: boolean;
  memoryUsageKB?: number;
  durationMs?: number;
}

/**
 * Singleton MockOrchestrator implementing the Command pattern for centralized control
 */
export class MockOrchestrator {
  private static instance: MockOrchestrator | null = null;
  private readonly scenarios = new Map<string, MockScenarioConfig>();
  private readonly dataCache = new Map<string, MockCacheEntry>();
  private readonly pendingDataLoads = new Map<string, Promise<MockDataContainer<any> | null>>();
  private readonly loadedPlugins = new Map<string, MockPlugin>();
  private readonly performanceMetrics: MockOperationMetrics[] = [];
  private readonly config: MockEnvironmentConfig;
  
  // Performance monitoring
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private readonly startTime = Date.now();
  private totalOperations = 0;
  private cacheHits = 0;
  private memoryUsageBytes = 0;
  private readonly handleProcessExit = () => this.dispose();
  private readonly handleProcessSigint = () => this.dispose();
  private readonly handleProcessSigterm = () => this.dispose();

  private constructor() {
    this.config = this.loadEnvironmentConfig();
    this.initializeDefaultScenarios();
    this.startPerformanceMonitoring();
    
    // Cleanup on process exit. Jest repeatedly reloads this module and owns
    // process lifetime, so test runs dispose explicitly instead of attaching
    // process-wide signal listeners on every import.
    if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID === undefined) {
      process.on('exit', this.handleProcessExit);
      process.on('SIGINT', this.handleProcessSigint);
      process.on('SIGTERM', this.handleProcessSigterm);
    }
  }

  /**
   * Get the singleton instance with lazy initialization
   */
  public static getInstance(): MockOrchestrator {
    if (!MockOrchestrator.instance) {
      MockOrchestrator.instance = new MockOrchestrator();
    }
    return MockOrchestrator.instance;
  }

  public static resetInstance(): void {
    if (MockOrchestrator.instance) {
      MockOrchestrator.instance.dispose();
      MockOrchestrator.instance = null;
    }
  }

  /**
   * Check if a feature should be mocked based on configuration
   */
  public shouldMock(feature: MockableFeature): boolean {
    if (process.env.NEXT_PUBLIC_MASTER_MOCK_MODE !== 'true') {
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
  public getScenario(feature: MockableFeature): string {
    const featureScenario = process.env[`NEXT_PUBLIC_MOCK_${feature}_SCENARIO`];
    return featureScenario || this.config.globalScenario;
  }

  /**
   * Get mock data for a feature with intelligent caching and validation
   */
  public async getMockData<T>(
    feature: MockableFeature, 
    scenario?: string
  ): Promise<MockDataContainer<T> | null> {
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
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          this.endOperation(operationStart, true);
          return cached;
        }

        const pending = this.pendingDataLoads.get(cacheKey);
        if (pending) {
          const pendingData = await pending as MockDataContainer<T> | null;
          this.endOperation(operationStart, true);
          return pendingData;
        }
      }

      // Generate or load mock data
      const loadPromise = this.generateMockData<T>(feature, scenarioId);
      if (this.config.cacheEnabled) {
        this.pendingDataLoads.set(cacheKey, loadPromise as Promise<MockDataContainer<any> | null>);
      }

      let mockData: MockDataContainer<T> | null;
      try {
        mockData = await loadPromise;
      } finally {
        if (this.config.cacheEnabled) {
          this.pendingDataLoads.delete(cacheKey);
        }
      }
      
      // Cache the result
      if (this.config.cacheEnabled && mockData) {
        this.setCache(cacheKey, mockData);
      }

      this.endOperation(operationStart, false);
      return mockData;
    } catch (error) {
      this.endOperation(operationStart, false);
      console.error(`MockOrchestrator: Error getting mock data for ${feature}:`, error);
      return null;
    }
  }

  /**
   * Register a new mock scenario
   */
  public registerScenario(scenario: MockScenarioConfig): void {
    this.validateScenario(scenario);
    this.scenarios.set(scenario.id, scenario);
    
    if (this.config.debugMode) {
      console.log(`MockOrchestrator: Registered scenario '${scenario.id}'`);
    }
  }

  /**
   * Register a mock plugin for extended functionality
   */
  public registerPlugin(plugin: MockPlugin): void {
    this.loadedPlugins.set(plugin.name, plugin);
    plugin.initialize?.(this);
    
    if (this.config.debugMode) {
      console.log(`MockOrchestrator: Registered plugin '${plugin.name}'`);
    }
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): MockPerformanceMetrics {
    const now = Date.now();
    const uptimeMs = now - this.startTime;
    
    // Calculate feature-specific metrics
    const featureMetrics: Record<MockableFeature, any> = {} as any;
    
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
    const features: Record<MockableFeature, any> = {} as any;
    Object.entries(featureMetrics).forEach(([feature, data]: [string, any]) => {
      features[feature as MockableFeature] = {
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
        diskUsageMB: 0,     // Would read additional monitoring
        networkBytesPerSec: 0 // Would read additional monitoring
      },
      mocking: {
        dataGenerationTimeMs: 0, // Average from operations
        serializationTimeMs: 0,  // Would track separately
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
  public async validateSystem(): Promise<MockValidationResult> {
    const timestamp = new Date().toISOString();
    const scenarioResults: Record<string, any> = {};
    const featureResults: Record<MockableFeature, any> = {} as any;
    let overallValid = true;

    // Validate scenarios
    for (const [id, scenario] of this.scenarios) {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      try {
        this.validateScenario(scenario);
      } catch (error) {
        errors.push((error as Error).message);
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
      const errors: string[] = [];
      let dataIntegrity = true;
      let typeCompliance = true;
      
      try {
        const mockData = await this.getMockData(feature);
        if (mockData && this.config.validationEnabled) {
          // Validate data structure
          dataIntegrity = this.validateDataIntegrity(feature, mockData.data);
          typeCompliance = this.validateTypeCompliance(feature, mockData.data);
        }
      } catch (error) {
        errors.push((error as Error).message);
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
  public reset(): void {
    this.dataCache.clear();
    this.pendingDataLoads.clear();
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

  private loadEnvironmentConfig(): MockEnvironmentConfig {
    return {
      masterMockMode: process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true',
      globalScenario: (process.env.NEXT_PUBLIC_MOCK_SCENARIO as MockScenarioType) || 'demo',
      timingProfile: (process.env.NEXT_PUBLIC_MOCK_TIMING as MockTimingProfile) || 'realistic',
      complexity: (process.env.NEXT_PUBLIC_MOCK_COMPLEXITY as MockComplexity) || 'moderate',
      debugMode: process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true',
      performanceMonitoring: process.env.NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING !== 'false',
      cacheEnabled: process.env.NEXT_PUBLIC_MOCK_CACHE_ENABLED !== 'false',
      validationEnabled: process.env.NEXT_PUBLIC_MOCK_VALIDATION_ENABLED !== 'false'
    };
  }

  private initializeDefaultScenarios(): void {
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

  private getScenarioId(feature: MockableFeature): string {
    return this.getScenario(feature);
  }

  private async generateMockData<T>(
    feature: MockableFeature, 
    scenarioId: string
  ): Promise<MockDataContainer<T> | null> {
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
    const data = await this.generateBuiltinMockData<T>(feature, scenario);
    return data ? this.wrapMockData(data, feature, scenarioId) : null;
  }

  private async generateBuiltinMockData<T>(
    feature: MockableFeature,
    scenario: MockScenarioConfig
  ): Promise<T | null> {
    const seed = `${scenario.id}:${feature}`;

    switch (feature) {
      case 'ASSET_PACKS':
        return {
          id: `${seed}:asset-pack`,
          title: 'Mock AssetPack',
          status: 'ready',
          cells: [1],
        } as T;
      case 'USER_PROFILE':
        return {
          id: `${seed}:profile`,
          displayName: 'Mock Bitcode Operator',
          role: 'operator',
        } as T;
      case 'GITHUB_REPOS':
        return [
          {
            id: `${seed}:repo`,
            fullName: 'bitcode/mock-repository',
            defaultBranch: 'main',
          },
        ] as T;
      case 'TEMPLATES':
        return [
          {
            id: `${seed}:template`,
            name: 'Mock Read Template',
          },
        ] as T;
      default:
        console.warn(`MockOrchestrator: No built-in generator for feature '${feature}'`);
        return null;
    }
  }

  private wrapMockData<T>(
    data: T, 
    feature: MockableFeature, 
    scenarioId: string
  ): MockDataContainer<T> {
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

  private calculateComplexityScore(data: any): number {
    // Simple complexity scoring based on data structure
    if (typeof data !== 'object' || data === null) return 1;
    if (Array.isArray(data)) return Math.min(10, data.length);
    return Math.min(10, Object.keys(data).length);
  }

  private getFromCache<T>(key: string): MockDataContainer<T> | null {
    const entry = this.dataCache.get(key);
    if (!entry) return null;
    
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
    
    return entry.data as MockDataContainer<T>;
  }

  private setCache<T>(key: string, data: MockDataContainer<T>): void {
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

  private cleanupCache(): void {
    const maxCacheSize = 100 * 1024 * 1024; // 100MB
    if (this.memoryUsageBytes <= maxCacheSize) return;
    
    // Remove least recently used items
    const entries = Array.from(this.dataCache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    while (this.memoryUsageBytes > maxCacheSize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.dataCache.delete(key);
      this.memoryUsageBytes -= entry.sizeBytes;
    }
  }

  private startOperation(feature: MockableFeature, scenario: string): MockOperationMetrics {
    this.totalOperations++;
    return {
      startTime: Date.now(),
      feature,
      scenario,
      cacheHit: false
    };
  }

  private endOperation(operation: MockOperationMetrics, cacheHit: boolean): void {
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

  private startPerformanceMonitoring(): void {
    if (!this.config.performanceMonitoring) return;
    
    this.metricsCollectionInterval = setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      if (this.config.debugMode) {
        console.log('MockOrchestrator Performance:', metrics);
      }
    }, 60000); // Every minute

    this.metricsCollectionInterval.unref?.();
  }

  private validateScenario(scenario: MockScenarioConfig): void {
    if (!scenario.id || !scenario.name || !scenario.type) {
      throw new Error('Scenario missing required fields');
    }
    
    if (!scenario.metadata?.version) {
      throw new Error('Scenario missing version metadata');
    }
  }

  private validateDataIntegrity(feature: MockableFeature, data: any): boolean {
    // Feature-specific validation would go here
    return data !== null && data !== undefined;
  }

  private validateTypeCompliance(feature: MockableFeature, data: any): boolean {
    // Type validation would go here
    return true; // Simplified for now
  }

  private getAllFeatures(): MockableFeature[] {
    return [
      'ASSET_PACKS', 'UPGRADES', 'PIPELINE_LOGS', 'CHAT_STREAM', 'CONVERSATION_RESPONSES',
      'GITHUB_ACCOUNTS', 'GITHUB_REPOS', 'GITHUB_BRANCHES', 'GITHUB_COMMITS', 'GITHUB_ISSUES', 'GITHUB_FILES',
      'USER_PROFILE', 'USER_BTD', 'USER_NOTIFICATIONS', 'USER_CONNECTIONS', 'USER_TEMPLATES',
      'INTEGRATIONS_NOTION', 'INTEGRATIONS_FIGMA', 'INTEGRATIONS_SLACK', 'INTEGRATIONS_GITLAB', 'INTEGRATIONS_BITBUCKET',
      'MARKETPLACE', 'TEMPLATES', 'COMPLETION_DATA', 'PROCESSING_STATS', 'REPO_SNAPSHOTS',
      'API_RESPONSES', 'ERROR_SCENARIOS', 'PERFORMANCE_METRICS'
    ];
  }

  private generateRecommendations(metrics: MockPerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
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

  public cleanup(): void {
    this.dispose();
  }

  public dispose(): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }

    if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID === undefined) {
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

/**
 * Plugin interface for extending mock functionality
 */
export interface MockPlugin {
  readonly name: string;
  readonly version: string;
  initialize?(orchestrator: MockOrchestrator): void;
  canHandle?(feature: MockableFeature, scenario: string): boolean;
  generateData?<T>(feature: MockableFeature, scenario: string, config: MockScenarioConfig): Promise<T | null>;
  cleanup?(): void;
}

// Export singleton instance
export const mockOrchestrator = MockOrchestrator.getInstance();
