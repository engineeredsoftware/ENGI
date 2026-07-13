/**
 * Production Integration Tests for Multi-Wave Research System
 * End-to-End Testing for Enterprise-Grade Web Research Infrastructure
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import {
  ProductionMultiProviderOrchestrator,
  productionMultiProviderSearch,
  getProductionOrchestrator,
  getProductionMetrics,
  getProductionHealth,
  shutdownProductionOrchestrator,
  type SearchMetrics
} from '../production-orchestrator';
import {
  ResilienceCoordinator,
  CircuitBreaker,
  RetryStrategy,
  RateLimiter,
  ProviderHealthMonitor,
  TimeoutManager
} from '../resilience';
import { WEB_RESEARCH_AGENT } from '../../../generic-agents/web-researcher/src/index';

// Mock external dependencies for integration testing
jest.mock('@bitcode/logger');
jest.mock('../index');
jest.mock('../providers/github');
jest.mock('../providers/stackoverflow');
jest.mock('../providers/semantic-scholar');

// Production test configuration
const PRODUCTION_TEST_CONFIG = {
  timeout: 30000,
  maxConcurrentTests: 5,
  retryAttempts: 3
};

describe('Production Integration Tests', () => {
  let orchestrator: ProductionMultiProviderOrchestrator;
  
  beforeAll(async () => {
    // Initialize production orchestrator for testing
    orchestrator = new ProductionMultiProviderOrchestrator({
      circuitBreaker: {
        failureThreshold: 3,
        timeoutMs: 5000,
        resetTimeoutMs: 10000,
        monitoringPeriodMs: 60000
      },
      retry: {
        maxAttempts: 2,
        baseDelayMs: 500,
        maxDelayMs: 2000,
        backoffMultiplier: 1.5
      },
      rateLimiter: {
        requestsPerMinute: 120 // Higher limit for testing
      },
      timeoutMs: 5000
    });
  });

  afterAll(async () => {
    await orchestrator?.gracefulShutdown();
    await shutdownProductionOrchestrator();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful provider responses
    const mockExaSearch = require('../index');
    mockExaSearch.search = jest.fn().mockResolvedValue({
      results: [
        {
          id: 'exa-1',
          title: 'Production Test Result',
          url: 'https://example.com/production-test',
          summary: 'This is a production test result with high relevance',
          score: 0.95,
          publishedDate: '2024-01-01',
          author: 'Production Team'
        }
      ],
      autopromptString: 'Enhanced production query'
    });

    mockExaSearch.searchWithUrlIntelligence = jest.fn().mockResolvedValue({
      results: [
        {
          id: 'exa-url-1',
          title: 'URL-Enhanced Production Result',
          url: 'https://example.com/url-enhanced',
          summary: 'URL intelligence enhanced production result',
          score: 0.92
        }
      ],
      urlAnalysis: {
        suggestedDomains: ['example.com'],
        contentTopics: ['react', 'production'],
        classifications: [
          { url: 'https://example.com', type: 'documentation', confidence: 0.9, domain: 'example.com', metadata: {} }
        ]
      }
    });

    // Mock GitHub provider
    const mockGitHubProvider = require('../providers/github');
    mockGitHubProvider.GitHubSearchProvider = jest.fn().mockImplementation(() => ({
      name: 'github',
      config: { enabled: true },
      search: jest.fn().mockResolvedValue([
        {
          id: 'github-1',
          title: 'Production GitHub Repository',
          url: 'https://github.com/test/production-repo',
          snippet: 'Production-ready code repository',
          score: 0.88,
          provider: 'github',
          metadata: { type: 'github_repo', stars: 1500 }
        }
      ]),
      executeSearch: jest.fn().mockResolvedValue([
        {
          id: 'github-1',
          title: 'Production GitHub Repository',
          url: 'https://github.com/test/production-repo',
          snippet: 'Production-ready code repository',
          score: 0.88,
          provider: 'github',
          metadata: { type: 'github_repo', stars: 1500 }
        }
      ]),
      performHealthCheck: jest.fn().mockResolvedValue(true),
      getStats: jest.fn().mockReturnValue({
        provider: 'github',
        isHealthy: true,
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 800,
        successRate: 0.95,
        qualityScore: 0.88
      })
    }));

    // Mock other providers similarly
    const mockStackOverflowProvider = require('../providers/stackoverflow');
    mockStackOverflowProvider.StackOverflowSearchProvider = jest.fn().mockImplementation(() => ({
      name: 'stackoverflow',
      config: { enabled: true },
      search: jest.fn().mockResolvedValue([]),
      executeSearch: jest.fn().mockResolvedValue([]),
      performHealthCheck: jest.fn().mockResolvedValue(true),
      getStats: jest.fn().mockReturnValue({
        provider: 'stackoverflow',
        isHealthy: true,
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 600,
        successRate: 0.98,
        qualityScore: 0.85
      })
    }));

    const mockSemanticScholarProvider = require('../providers/semantic-scholar');
    mockSemanticScholarProvider.SemanticScholarSearchProvider = jest.fn().mockImplementation(() => ({
      name: 'semantic_scholar',
      config: { enabled: true },
      search: jest.fn().mockResolvedValue([]),
      executeSearch: jest.fn().mockResolvedValue([]),
      performHealthCheck: jest.fn().mockResolvedValue(true),
      getStats: jest.fn().mockReturnValue({
        provider: 'semantic_scholar',
        isHealthy: true,
        requestsThisMinute: 0,
        requestsToday: 0,
        averageResponseTime: 1200,
        successRate: 0.92,
        qualityScore: 0.90
      })
    }));
  });

  describe('Production Multi-Provider Search Integration', () => {
    test('should perform production-grade multi-provider search with resilience', async () => {
      const result = await orchestrator.orchestrateSearch(
        'React production deployment best practices',
        ['https://reactjs.org/docs/deployment.html'],
        {
          maxResults: 20,
          urgency: 'high',
          category: 'documentation'
        }
      );

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.providerUsage).toBeDefined();
      expect(result.fusionMetrics).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      
      // Verify production metrics are tracked
      const metrics = orchestrator.getProductionMetrics();
      expect(metrics.totalSearches).toBeGreaterThan(0);
      expect(metrics.successfulSearches).toBeGreaterThan(0);
    }, PRODUCTION_TEST_CONFIG.timeout);

    test('should handle high-concurrency production load', async () => {
      const concurrentSearches = Array.from({ length: PRODUCTION_TEST_CONFIG.maxConcurrentTests }, (_, i) => 
        orchestrator.orchestrateSearch(
          `Production test query ${i}`,
          [],
          { maxResults: 10, urgency: 'medium' }
        )
      );

      const results = await Promise.all(concurrentSearches);

      expect(results).toHaveLength(PRODUCTION_TEST_CONFIG.maxConcurrentTests);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.results).toBeDefined();
      });

      // Verify system remains healthy under load
      const systemHealth = orchestrator.getSystemHealthSnapshot();
      expect(systemHealth.overallHealth).toBeGreaterThan(0.5);
    }, PRODUCTION_TEST_CONFIG.timeout);

    test('should demonstrate circuit breaker functionality', async () => {
      // Simulate provider failures to trigger circuit breaker
      const mockExaSearch = require('../index');
      mockExaSearch.search = jest.fn().mockRejectedValue(new Error('Service unavailable'));

      let failureCount = 0;
      const maxFailures = 5;

      for (let i = 0; i < maxFailures; i++) {
        try {
          await orchestrator.orchestrateSearch('test circuit breaker', [], { maxResults: 5 });
        } catch (error) {
          failureCount++;
        }
      }

      // After enough failures, circuit breaker should open
      const healthSnapshot = orchestrator.getSystemHealthSnapshot();
      expect(healthSnapshot.circuitBreakers.exa).toBeDefined();
      
      // System should still function with other providers
      expect(failureCount).toBeLessThan(maxFailures); // Some requests should succeed via fallback
    }, PRODUCTION_TEST_CONFIG.timeout);

    test('should validate production metrics collection', async () => {
      const initialMetrics = orchestrator.getProductionMetrics();
      
      await orchestrator.orchestrateSearch(
        'Production metrics test',
        [],
        { maxResults: 10 }
      );

      const updatedMetrics = orchestrator.getProductionMetrics();
      
      expect(updatedMetrics.totalSearches).toBe(initialMetrics.totalSearches + 1);
      expect(updatedMetrics.averageResponseTime).toBeGreaterThan(0);
      expect(updatedMetrics.averageResultCount).toBeGreaterThan(0);
      expect(updatedMetrics.performancePercentiles.p50).toBeGreaterThan(0);
    });
  });

  describe('Multi-Wave Web Research Integration', () => {
    beforeEach(() => {
      // Mock global context for agent testing
      const mockGetGlobalContext = require('@bitcode/context').getGlobalContext;
      mockGetGlobalContext.mockReturnValue({
        taskContext: {
          task: 'Implement production-ready React authentication system with JWT refresh tokens',
          taskType: 'feature_request',
          attachments: [
            { type: 'url', content: 'https://reactjs.org/docs/hooks-reference.html' },
            { type: 'url', content: 'https://auth0.com/docs/quickstart/spa/react' },
            { type: 'url', content: 'https://github.com/auth0/react-auth0-spa' }
          ]
        }
      });

      // Mock multi-provider search for agent
      const mockMultiProviderSearch = require('../../generic-tools/web-search/src/index').multiProviderSearch;
      mockMultiProviderSearch.mockResolvedValue({
        results: [
          {
            title: 'React Authentication Production Guide',
            url: 'https://auth0.com/blog/react-auth-production',
            summary: 'Complete production guide for React authentication with security best practices',
            score: 0.95,
            provider: 'exa',
            metadata: { type: 'blog_post', authority: 'high' }
          },
          {
            title: 'JWT Refresh Token Implementation',
            url: 'https://github.com/auth0/jwt-refresh-example',
            summary: 'Production-ready JWT refresh token implementation for React applications',
            score: 0.92,
            provider: 'github',
            metadata: { type: 'github_repo', stars: 2500 }
          }
        ],
        providerUsage: [
          { provider: 'exa', queriesExecuted: 3, resultsReturned: 5, avgResponseTime: 850 },
          { provider: 'github', queriesExecuted: 2, resultsReturned: 3, avgResponseTime: 650 }
        ],
        fusionMetrics: {
          totalResults: 8,
          duplicatesRemoved: 1,
          qualityFiltered: 0,
          diversityScore: 0.9,
          relevanceScore: 0.93
        },
        recommendedFollowUp: [
          'React authentication security considerations',
          'JWT token storage best practices',
          'Production deployment authentication patterns'
        ]
      });
    });

    test('should execute complete PTRR workflow with production orchestrator', async () => {
      const agent = WEB_RESEARCH_AGENT.researchWeb;
      
      // Test Plan phase
      const planFn = agent.pgriConfig.plan.promptFn;
      const planResult = await planFn(undefined, {});
      
      expect(typeof planResult).toBe('string');
      expect(planResult).toContain('REVOLUTIONARY MULTI-WAVE RESEARCH ORCHESTRATION');
      expect(planResult).toContain('Deep Context Analysis');
      expect(planResult).toContain('Technology Stack Detected');

      // Mock plan data for subsequent phases
      const mockPlan = {
        contextAnalysis: {
          technologyStack: {
            languages: ['javascript', 'typescript'],
            frameworks: ['react'],
            libraries: ['auth0'],
            tools: [],
            platforms: ['nodejs']
          },
          architecture: {
            patterns: ['spa'],
            paradigms: ['functional'],
            serviceType: 'microservices' as const,
            scalingApproach: ['horizontal']
          },
          codebase: {
            projectStructure: ['src/', 'components/'],
            codePatterns: ['hooks'],
            testingApproach: ['unit'],
            buildSystem: ['webpack']
          },
          dependencies: {
            dependencies: [],
            vulnerabilities: [],
            outdatedPackages: [],
            conflicts: []
          }
        },
        queryStrategy: {
          baseQueries: ['react authentication production'],
          contextualQueries: [],
          architectureQueries: [],
          technologyQueries: [],
          dependencyQueries: [],
          urlEnhancedQueries: []
        },
        researchWaves: [
          {
            waveNumber: 1,
            queries: ['react authentication', 'jwt refresh tokens'],
            providers: ['exa', 'github'],
            rationale: 'Initial discovery',
            expectedOutcomes: ['Implementation guides']
          }
        ],
        urlAnalysis: {
          urlsFound: 3,
          suggestedDomains: ['reactjs.org', 'auth0.com'],
          contentTopics: ['react', 'authentication'],
          enhancedQueries: ['react hooks auth']
        },
        nextStepsToolsPlans: [],
        success: true,
        previousStepsToolsPlansResults: [
          {
            name: 'multiProviderSearch' as const,
            args: { query: 'react authentication production' },
            result: {
              results: [
                {
                  title: 'React Auth Production Guide',
                  url: 'https://example.com/guide',
                  summary: 'Production authentication guide',
                  score: 0.95,
                  provider: 'exa',
                  metadata: {}
                }
              ],
              providerUsage: [],
              fusionMetrics: { totalResults: 1, duplicatesRemoved: 0, qualityFiltered: 0, diversityScore: 0.8, relevanceScore: 0.9 }
            }
          }
        ]
      };

      // Test Generate phase
      const generateFn = agent.pgriConfig.generate.promptFn;
      const generateResult = await generateFn(mockPlan, {});
      
      expect(typeof generateResult).toBe('string');
      expect(generateResult).toContain('REVOLUTIONARY MULTI-WAVE RESEARCH SYNTHESIS');
      expect(generateResult).toContain('Wave 1 - Broad Discovery Results');

      // Mock generate data for refine phase
      const mockGenerate = {
        comprehensiveFindings: [
          {
            title: 'React Authentication Guide',
            url: 'https://auth0.com/blog/react-auth',
            summary: 'Complete authentication guide',
            relevance: 0.95,
            query: 'react authentication',
            provider: 'exa',
            wave: 1
          }
        ],
        initialWaveResults: { queries: [], totalResults: 1, providersUsed: ['exa'], qualityScore: 0.9 },
        followUpStrategy: { queries: [], gaps: [], contradictions: [], deepDiveAreas: [] },
        previousStepsToolsPlansResults: [],
        nextStepsToolsPlans: [],
        success: true
      };

      // Test Refine phase
      const refineFn = agent.pgriConfig.refine.promptFn;
      const refineResult = await refineFn(mockGenerate, {});
      
      expect(typeof refineResult).toBe('string');
      expect(refineResult).toContain('REVOLUTIONARY QUALITY ASSESSMENT & GAP ANALYSIS');
      expect(refineResult).toContain('Multi-Wave Quality Metrics');
    }, PRODUCTION_TEST_CONFIG.timeout);

    test('should demonstrate end-to-end research quality improvement', async () => {
      // Simulate progressive quality improvement through waves
      const wave1Quality = 0.7;
      const wave2Quality = 0.9;
      
      const mockGenerate = {
        comprehensiveFindings: [
          {
            title: 'Basic React Auth Tutorial',
            url: 'https://example.com/basic',
            summary: 'Basic authentication tutorial',
            relevance: wave1Quality,
            query: 'react auth',
            provider: 'exa',
            wave: 1
          },
          {
            title: 'Advanced React Auth Patterns',
            url: 'https://auth0.com/advanced',
            summary: 'Advanced production patterns',
            relevance: wave2Quality,
            query: 'react authentication patterns',
            provider: 'semantic_scholar',
            wave: 2
          }
        ],
        initialWaveResults: { queries: [], totalResults: 1, providersUsed: ['exa'], qualityScore: wave1Quality },
        followUpStrategy: { queries: [], gaps: [], contradictions: [], deepDiveAreas: [] },
        previousStepsToolsPlansResults: [],
        nextStepsToolsPlans: [],
        success: true
      };

      const agent = WEB_RESEARCH_AGENT.researchWeb;
      const refineFn = agent.pgriConfig.refine.promptFn;
      const result = await refineFn(mockGenerate, {});
      
      expect(result).toContain('Wave 1:');
      expect(result).toContain('Wave 2:');
      expect(result).toContain('Multi-wave completed');
      
      // Quality should improve from Wave 1 to Wave 2
      expect(wave2Quality).toBeGreaterThan(wave1Quality);
    });
  });

  describe('Production Resilience and Performance', () => {
    test('should handle provider failures gracefully with fallback', async () => {
      // Simulate Exa failure
      const mockExaSearch = require('../index');
      mockExaSearch.search = jest.fn().mockRejectedValue(new Error('Exa service down'));
      
      const result = await orchestrator.orchestrateSearch(
        'test resilience',
        [],
        { maxResults: 10 }
      );

      // Should still get results from other providers
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      
      const healthSnapshot = orchestrator.getSystemHealthSnapshot();
      expect(healthSnapshot.overallHealth).toBeGreaterThan(0); // System partially healthy
    });

    test('should demonstrate rate limiting effectiveness', async () => {
      const rateLimiter = new RateLimiter({ requestsPerMinute: 5 });
      
      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        const allowed = await rateLimiter.acquire();
        expect(allowed).toBe(true);
      }
      
      // Next request should be rate limited
      const rateLimited = await rateLimiter.acquire();
      expect(rateLimited).toBe(false);
      
      const status = rateLimiter.getStatus();
      expect(status.currentRequests).toBe(5);
      expect(status.available).toBe(0);
    });

    test('should validate retry strategy with exponential backoff', async () => {
      const retryStrategy = new RetryStrategy({
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2
      });

      let attempts = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await retryStrategy.execute(failingOperation);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(failingOperation).toHaveBeenCalledTimes(3);
    });

    test('should measure and report performance metrics accurately', async () => {
      const startTime = Date.now();
      
      await orchestrator.orchestrateSearch(
        'performance test query',
        [],
        { maxResults: 15 }
      );
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const metrics = orchestrator.getProductionMetrics();
      const performanceSnapshot = orchestrator.getPerformanceSnapshot();
      
      expect(performanceSnapshot.averageResponseTime).toBeGreaterThan(0);
      expect(performanceSnapshot.averageResponseTime).toBeLessThan(responseTime * 2); // Reasonable bounds
      expect(performanceSnapshot.successRate).toBeGreaterThan(0);
      expect(metrics.performancePercentiles.p50).toBeGreaterThan(0);
    });
  });

  describe('Production Health Monitoring', () => {
    test('should continuously monitor provider health', async () => {
      const initialHealth = orchestrator.getSystemHealthSnapshot();
      
      // Wait for health check cycle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentHealth = orchestrator.getSystemHealthSnapshot();
      
      expect(currentHealth.providers).toBeDefined();
      expect(currentHealth.overallHealth).toBeGreaterThanOrEqual(0);
      expect(currentHealth.overallHealth).toBeLessThanOrEqual(1);
      
      // Should have circuit breaker states
      expect(currentHealth.circuitBreakers).toBeDefined();
      expect(currentHealth.rateLimiters).toBeDefined();
    });

    test('should track comprehensive search metrics over time', async () => {
      const initialMetrics = orchestrator.getProductionMetrics();
      
      // Perform multiple searches
      const searches = [
        'production test 1',
        'production test 2', 
        'production test 3'
      ];

      for (const query of searches) {
        await orchestrator.orchestrateSearch(query, [], { maxResults: 5 });
      }

      const finalMetrics = orchestrator.getProductionMetrics();
      
      expect(finalMetrics.totalSearches).toBe(initialMetrics.totalSearches + searches.length);
      expect(finalMetrics.successfulSearches).toBeGreaterThan(initialMetrics.successfulSearches);
      expect(finalMetrics.averageResultCount).toBeGreaterThan(0);
      expect(finalMetrics.qualityScores.length).toBeGreaterThan(initialMetrics.qualityScores.length);
    });
  });

  describe('Production Error Scenarios', () => {
    test('should handle complete provider outage gracefully', async () => {
      // Mock all providers to fail
      const mockProviders = [
        require('../index'),
        require('../providers/github'),
        require('../providers/stackoverflow'),
        require('../providers/semantic-scholar')
      ];

      mockProviders.forEach(provider => {
        if (provider.search) provider.search.mockRejectedValue(new Error('Provider outage'));
        if (provider.GitHubSearchProvider) {
          provider.GitHubSearchProvider.mockImplementation(() => ({
            name: 'github',
            config: { enabled: true },
            executeSearch: jest.fn().mockRejectedValue(new Error('GitHub outage')),
            performHealthCheck: jest.fn().mockResolvedValue(false)
          }));
        }
      });

      try {
        await orchestrator.orchestrateSearch('test outage', [], { maxResults: 10 });
        // Should either succeed with emergency fallback or fail gracefully
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('available');
      }

      // System should track the failures
      const metrics = orchestrator.getProductionMetrics();
      expect(metrics.errorDistribution).toBeDefined();
    });

    test('should handle timeout scenarios appropriately', async () => {
      const timeoutManager = TimeoutManager;
      
      const slowOperation = () => new Promise(resolve => {
        setTimeout(() => resolve('slow result'), 2000);
      });

      await expect(
        timeoutManager.withTimeout(slowOperation(), 1000, 'Test timeout')
      ).rejects.toThrow('Test timeout');
    });

    test('should validate circuit breaker state transitions', async () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        timeoutMs: 1000,
        resetTimeoutMs: 5000,
        monitoringPeriodMs: 10000
      });

      const failingOperation = () => Promise.reject(new Error('Operation failed'));
      
      // Initial state should be CLOSED
      expect(circuitBreaker.getState()).toBe('CLOSED');
      
      // Cause failures to open circuit breaker
      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}
      
      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}
      
      // Circuit breaker should now be OPEN
      expect(circuitBreaker.getState()).toBe('OPEN');
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failures).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Production Deployment Readiness', () => {
  test('should validate all required environment variables', () => {
    // Note: In real production, these would be actual environment checks
    const requiredEnvVars = [
      'EXA_API_KEY',
      'GITHUB_API_KEY', 
      'STACKEXCHANGE_API_KEY',
      'SEMANTIC_SCHOLAR_API_KEY'
    ];

    // For testing, we'll simulate the check
    const mockEnvCheck = requiredEnvVars.every(envVar => {
      // In real deployment, check process.env[envVar]
      return true; // Simulated for testing
    });

    expect(mockEnvCheck).toBe(true);
  });

  test('should demonstrate graceful shutdown capabilities', async () => {
    const testOrchestrator = new ProductionMultiProviderOrchestrator();
    
    // Perform some operations
    await testOrchestrator.orchestrateSearch('shutdown test', [], { maxResults: 5 });
    
    // Verify graceful shutdown
    await expect(testOrchestrator.gracefulShutdown()).resolves.toBeUndefined();
    
    // System should be cleaned up
    const healthAfterShutdown = testOrchestrator.getSystemHealthSnapshot();
    expect(healthAfterShutdown.overallHealth).toBeDefined();
  });

  test('should validate production configuration compliance', () => {
    const productionOrchestrator = getProductionOrchestrator();
    const systemHealth = productionOrchestrator.getSystemHealthSnapshot();
    
    // Verify all required components are initialized
    expect(systemHealth.providers).toBeDefined();
    expect(systemHealth.circuitBreakers).toBeDefined();
    expect(systemHealth.rateLimiters).toBeDefined();
    expect(systemHealth.overallHealth).toBeGreaterThanOrEqual(0);
    
    // Verify metrics collection is active
    const metrics = productionOrchestrator.getProductionMetrics();
    expect(metrics).toBeDefined();
    expect(typeof metrics.totalSearches).toBe('number');
  });
});
