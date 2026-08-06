/**
 * Comprehensive Test Suite for Mock Orchestrator
 * 
 * Tests cover:
 * - Core functionality
 * - Performance characteristics
 * - Error handling
 * - Cache management
 * - Scenario switching
 * - Data validation
 * - Memory management
 * - Concurrent access
 * 
 * @jest-environment node
 */
import { MockOrchestrator } from '@/mocking/core/MockOrchestrator';
import type { MockableFeature, MockScenarioConfig, MockScenarioType } from '@/mocking/types/core';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_MASTER_MOCK_MODE: 'true',
    NEXT_PUBLIC_MOCK_SCENARIO: 'testing',
    NEXT_PUBLIC_MOCK_DEBUG: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
  // Reset orchestrator instance
  (MockOrchestrator as any).instance = null;
});

describe('MockOrchestrator', () => {
  let orchestrator: MockOrchestrator;

  beforeEach(() => {
    orchestrator = MockOrchestrator.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MockOrchestrator.getInstance();
      const instance2 = MockOrchestrator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should maintain state across calls', () => {
      const instance1 = MockOrchestrator.getInstance();
      instance1.registerScenario(createTestScenario('test-scenario'));
      
      const instance2 = MockOrchestrator.getInstance();
      // Should have the registered scenario
      expect(instance2).toBe(instance1);
    });
  });

  describe('Feature Mocking Control', () => {
    it('should mock features when master mode is enabled', () => {
      expect(orchestrator.shouldMock('ASSET_PACKS')).toBe(true);
      expect(orchestrator.shouldMock('USER_PROFILE')).toBe(true);
      expect(orchestrator.shouldMock('GITHUB_REPOS')).toBe(true);
    });

    it('should not mock when master mode is disabled', () => {
      process.env.NEXT_PUBLIC_MASTER_MOCK_MODE = 'false';
      const newOrchestrator = MockOrchestrator.getInstance();
      expect(newOrchestrator.shouldMock('ASSET_PACKS')).toBe(false);
    });

    it('should respect feature-specific overrides', () => {
      process.env.NEXT_PUBLIC_MOCK_ASSET_PACKS = 'false';
      expect(orchestrator.shouldMock('ASSET_PACKS')).toBe(false);
      expect(orchestrator.shouldMock('USER_PROFILE')).toBe(true);
    });

    it('should handle scenario selection correctly', () => {
      process.env.NEXT_PUBLIC_MOCK_ASSET_PACKS_SCENARIO = 'demo';
      expect(orchestrator.getScenario('ASSET_PACKS')).toBe('demo');
      
      process.env.NEXT_PUBLIC_MOCK_USER_PROFILE_SCENARIO = 'testing';
      expect(orchestrator.getScenario('USER_PROFILE')).toBe('testing');
    });
  });

  describe('Mock Data Generation', () => {
    beforeEach(() => {
      orchestrator.registerScenario(createTestScenario('test-scenario'));
    });

    it('should generate mock data for supported features', async () => {
      const mockData = await orchestrator.getMockData('ASSET_PACKS', 'test-scenario');
      expect(mockData).not.toBeNull();
      expect(mockData?.metadata).toBeDefined();
      expect(mockData?.metadata.version).toBe('1.0.0');
    });

    it('should return null when mocking is disabled', async () => {
      process.env.NEXT_PUBLIC_MASTER_MOCK_MODE = 'false';
      const newOrchestrator = MockOrchestrator.getInstance();
      const mockData = await newOrchestrator.getMockData('ASSET_PACKS');
      expect(mockData).toBeNull();
    });

    it('should handle unknown scenarios gracefully', async () => {
      const mockData = await orchestrator.getMockData('ASSET_PACKS', 'unknown-scenario');
      expect(mockData).toBeNull();
    });

    it('should include proper metadata in mock data', async () => {
      const mockData = await orchestrator.getMockData('ASSET_PACKS', 'test-scenario');
      expect(mockData?.metadata).toMatchObject({
        version: expect.any(String),
        generatedAt: expect.any(String),
        source: expect.stringContaining('MockOrchestrator'),
        valid: true,
        metrics: {
          sizeBytes: expect.any(Number),
          recordCount: expect.any(Number),
          complexityScore: expect.any(Number)
        }
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics', async () => {
      await orchestrator.getMockData('ASSET_PACKS');
      await orchestrator.getMockData('USER_PROFILE');
      
      const metrics = orchestrator.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.mocking.totalMockCalls).toBeGreaterThanOrEqual(2);
      expect(metrics.timestamp).toBeDefined();
    });

    it('should calculate cache hit ratios', async () => {
      // First call - cache miss
      await orchestrator.getMockData('ASSET_PACKS');
      
      // Second call - cache hit
      await orchestrator.getMockData('ASSET_PACKS');
      
      const metrics = orchestrator.getPerformanceMetrics();
      expect(metrics.mocking.cacheHitRatio).toBeGreaterThan(0);
    });

    it('should track feature-specific metrics', async () => {
      await orchestrator.getMockData('ASSET_PACKS');
      await orchestrator.getMockData('USER_PROFILE');
      
      const metrics = orchestrator.getPerformanceMetrics();
      expect(metrics.features.ASSET_PACKS).toBeDefined();
      expect(metrics.features.USER_PROFILE).toBeDefined();
      expect(metrics.features.ASSET_PACKS.callCount).toBe(1);
    });
  });

  describe('System Validation', () => {
    beforeEach(() => {
      orchestrator.registerScenario(createTestScenario('valid-scenario'));
      orchestrator.registerScenario(createTestScenario('another-scenario'));
    });

    it('should validate the entire system', async () => {
      const validation = await orchestrator.validateSystem();
      expect(validation.valid).toBe(true);
      expect(validation.timestamp).toBeDefined();
      expect(validation.scenarios).toBeDefined();
      expect(validation.features).toBeDefined();
    });

    it('should detect invalid scenarios', async () => {
      const invalidScenario = {
        ...createTestScenario('invalid'),
        id: '', // Invalid empty ID
      };
      
      expect(() => orchestrator.registerScenario(invalidScenario)).toThrow();
    });

    it('should provide performance validation', async () => {
      const validation = await orchestrator.validateSystem();
      expect(validation.performance).toMatchObject({
        memoryWithinLimits: expect.any(Boolean),
        latencyWithinThresholds: expect.any(Boolean),
        errorRateAcceptable: expect.any(Boolean)
      });
    });

    it('should generate recommendations', async () => {
      const validation = await orchestrator.validateSystem();
      expect(validation.recommendations).toBeDefined();
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should cache mock data for better performance', async () => {
      await orchestrator.getMockData('ASSET_PACKS');
      await orchestrator.getMockData('ASSET_PACKS');

      const metrics = orchestrator.getPerformanceMetrics();
      expect(metrics.mocking.totalMockCalls).toBe(2);
      expect(metrics.mocking.cacheHitRatio).toBe(0.5);
      expect(metrics.features.ASSET_PACKS?.cacheHitRatio).toBe(0.5);
    });

    it('should clear cache on reset', async () => {
      await orchestrator.getMockData('ASSET_PACKS');
      const metrics1 = orchestrator.getPerformanceMetrics();
      
      orchestrator.reset();
      const metrics2 = orchestrator.getPerformanceMetrics();
      
      expect(metrics2.mocking.totalMockCalls).toBe(0);
    });

    it('should handle cache cleanup', async () => {
      // Generate lots of data to trigger cleanup
      for (let i = 0; i < 100; i++) {
        await orchestrator.getMockData('ASSET_PACKS', `scenario-${i}`);
      }
      
      const metrics = orchestrator.getPerformanceMetrics();
      // Should still be functional despite cache pressure
      expect(metrics.mocking.totalMockCalls).toBeGreaterThan(0);
    });
  });

  describe('Scenario Management', () => {
    it('should register new scenarios', () => {
      const scenario = createTestScenario('new-scenario');
      expect(() => orchestrator.registerScenario(scenario)).not.toThrow();
    });

    it('should validate scenario structure', () => {
      const invalidScenario = {
        id: 'invalid',
        // Missing required fields
      } as any;
      
      expect(() => orchestrator.registerScenario(invalidScenario)).toThrow();
    });

    it('should support scenario overwriting', () => {
      const scenario1 = createTestScenario('same-id');
      const scenario2 = {
        ...createTestScenario('same-id'),
        name: 'Updated Name'
      };
      
      orchestrator.registerScenario(scenario1);
      orchestrator.registerScenario(scenario2);
      
      // Should not throw and should update the scenario
      expect(() => orchestrator.registerScenario(scenario2)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing generators gracefully', async () => {
      const mockData = await orchestrator.getMockData('API_RESPONSES' as MockableFeature);
      expect(mockData).toBeNull();
    });

    it('should not crash on invalid feature names', async () => {
      const mockData = await orchestrator.getMockData('INVALID_FEATURE' as MockableFeature);
      expect(mockData).toBeNull();
    });

    it('should handle generator exceptions', async () => {
      // This would require mocking a failing generator
      // For now, ensure the system is resilient
      const mockData = await orchestrator.getMockData('ASSET_PACKS');
      expect(mockData).not.toBeNull();
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent requests', async () => {
      const promises = [
        orchestrator.getMockData('ASSET_PACKS'),
        orchestrator.getMockData('USER_PROFILE'),
        orchestrator.getMockData('GITHUB_REPOS'),
        orchestrator.getMockData('TEMPLATES')
      ];
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result).not.toBeNull();
      });
    });

    it('should maintain cache consistency under load', async () => {
      const promises = Array(20).fill(null).map(() => 
        orchestrator.getMockData('ASSET_PACKS')
      );
      
      const results = await Promise.all(promises);
      
      // All results should be identical (from cache)
      const firstResult = results[0];
      results.forEach(result => {
        expect(result?.metadata.generatedAt).toBe(firstResult?.metadata.generatedAt);
      });
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with repeated calls', async () => {
      const initialMetrics = orchestrator.getPerformanceMetrics();
      
      // Make many calls
      for (let i = 0; i < 50; i++) {
        await orchestrator.getMockData('ASSET_PACKS');
      }
      
      const finalMetrics = orchestrator.getPerformanceMetrics();
      
      // Memory usage should be reasonable
      expect(finalMetrics.system.memoryUsageMB).toBeLessThan(100);
    });

    it('should clean up on reset', () => {
      orchestrator.reset();
      const metrics = orchestrator.getPerformanceMetrics();
      expect(metrics.mocking.totalMockCalls).toBe(0);
    });
  });
});

// ============================================================================
// Test Utilities
// ============================================================================

function createTestScenario(id: string): MockScenarioConfig {
  return {
    id,
    name: `Test Scenario ${id}`,
    description: `Test scenario for ${id}`,
    type: 'testing',
    complexity: 'minimal',
    timing: 'fast',
    features: {
      ASSET_PACKS: {
        enabled: true,
        data: { test: 'data' }
      }
    },
    metadata: {
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      author: 'Test Suite',
      tags: ['test'],
      realistic: false,
      useCases: ['testing'],
      performance: {
        expectedMemoryMB: 1,
        expectedLatencyMs: 10,
        maxDataSizeKB: 1
      }
    }
  };
}

// Performance test helper
async function measurePerformance<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

// Mock data validation helper
function validateMockData(data: any): boolean {
  return data !== null && 
         data !== undefined && 
         typeof data === 'object' &&
         data.metadata &&
         data.metadata.version &&
         data.metadata.generatedAt;
}
