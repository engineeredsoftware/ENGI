/**
 * Mock Middleware - Transparent API-Level Mock Integration
 * 
 * Provides seamless mock integration at the API route level with:
 * - Zero-change integration with existing routes
 * - Intelligent request/response mocking
 * - Real-time streaming simulation
 * - Performance monitoring
 * - Error scenario injection
 * - Type-safe mock responses
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  MockableFeature,
  MockScenarioType,
  MockTimingProfile
} from '../types/core';

import { MockOrchestrator } from '../core/MockOrchestrator';
import { StreamingPipelineEngine, createStreamingPipelineEngine } from '../engines/StreamingPipelineEngine';
import { mockDataGenerator } from '../generators/MockDataGenerators';

// ============================================================================
// Middleware Configuration
// ============================================================================

interface MockMiddlewareConfig {
  feature: MockableFeature;
  scenario?: MockScenarioType;
  timing?: MockTimingProfile;
  streamingSupported?: boolean;
  errorInjection?: {
    enabled: boolean;
    probability: number;
    types: string[];
  };
  cacheControl?: {
    enabled: boolean;
    ttlSeconds: number;
  };
  performanceTracking?: boolean;
}

interface MockRequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  searchParams?: URLSearchParams;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  requestId: string;
}

interface MockResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  streaming?: boolean;
  delay?: number;
  errorScenario?: string;
}

// ============================================================================
// Core Mock Middleware
// ============================================================================

/**
 * Primary middleware function for API route mock integration
 */
export function withMocking(
  config: MockMiddlewareConfig,
  originalHandler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function mockableHandler(request: NextRequest): Promise<NextResponse> {
    const orchestrator = MockOrchestrator.getInstance();
    const startTime = Date.now();
    
    // Check if mocking is enabled for this feature
    if (!orchestrator.shouldMock(config.feature)) {
      return await originalHandler(request);
    }

    const context = createRequestContext(request);
    const scenario = config.scenario || orchestrator.getScenario(config.feature);

    try {
      // Log request for debugging
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
        console.log(`MockMiddleware: Handling ${config.feature} request`, {
          method: context.method,
          url: context.url,
          scenario
        });
      }

      // Check for error injection
      if (shouldInjectError(config.errorInjection)) {
        return createErrorResponse(config.errorInjection!);
      }

      // Handle streaming requests
      if (config.streamingSupported && isStreamingRequest(request)) {
        return await handleStreamingRequest(config, context, scenario);
      }

      // Handle regular requests
      return await handleRegularRequest(config, context, scenario);

    } catch (error) {
      console.error(`MockMiddleware: Error in ${config.feature} handler:`, error);
      return createErrorResponse({
        enabled: true,
        probability: 1,
        types: ['server']
      }, (error as Error).message);
    } finally {
      // Track performance
      if (config.performanceTracking !== false) {
        const duration = Date.now() - startTime;
        trackPerformance(config.feature, context, duration);
      }
    }
  };
}

/**
 * Specialized middleware for streaming endpoints
 */
export function withStreamingMocking(
  config: MockMiddlewareConfig & { 
    pipelineType: 'asset-pack' | 'measure';
  },
  originalHandler: (request: NextRequest) => Promise<NextResponse>
) {
  const streamingConfig = { ...config, streamingSupported: true };
  
  return withMocking(streamingConfig, originalHandler);
}

/**
 * Simplified wrapper for common API endpoints
 */
export const mockAssetPacks = (handler: any) => withMocking({
  feature: 'ASSET_PACKS',
  streamingSupported: true,
  performanceTracking: true
}, handler);

// Read-measurement pipeline placeholder reuses assetPacks mocks until GA-2

export const mockGitHub = (feature: 'GITHUB_ACCOUNTS' | 'GITHUB_REPOS' | 'GITHUB_BRANCHES' | 'GITHUB_COMMITS' | 'GITHUB_ISSUES' | 'GITHUB_FILES') => 
  (handler: any) => withMocking({
    feature,
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }, handler);

export const mockUserData = (feature: 'USER_PROFILE' | 'USER_BTD' | 'USER_NOTIFICATIONS' | 'USER_CONNECTIONS') =>
  (handler: any) => withMocking({
    feature,
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 60 }
  }, handler);

// ============================================================================
// Request/Response Handling
// ============================================================================

async function handleStreamingRequest(
  config: MockMiddlewareConfig,
  context: MockRequestContext,
  scenario: MockScenarioType
): Promise<NextResponse> {
  const engine = createStreamingPipelineEngine.assetPack(scenario);
  const stream = engine.createStream();

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Add custom headers
  if (config.cacheControl) {
    headers['Cache-Control'] = `max-age=${config.cacheControl.ttlSeconds}`;
  }

  return new NextResponse(stream, {
    status: 200,
    headers
  });
}

async function handleRegularRequest(
  config: MockMiddlewareConfig,
  context: MockRequestContext,
  scenario: MockScenarioType
): Promise<NextResponse> {
  const orchestrator = MockOrchestrator.getInstance();
  
  // Generate mock data based on feature and scenario
  const mockData = await orchestrator.getMockData(config.feature, scenario);
  
  if (!mockData) {
    return new NextResponse(
      JSON.stringify({ error: 'Mock data not available' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Apply timing simulation
  const delay = calculateResponseDelay(config.timing, context);
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Determine response format based on request
  const responseData = formatResponseData(mockData.data, context);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Mock-Feature': config.feature,
    'X-Mock-Scenario': scenario,
    'X-Mock-Generated': mockData.metadata.generatedAt
  };

  // Add cache control headers
  if (config.cacheControl?.enabled) {
    headers['Cache-Control'] = `max-age=${config.cacheControl.ttlSeconds}`;
    headers['ETag'] = generateETag(responseData);
  }

  return new NextResponse(
    JSON.stringify(responseData),
    { 
      status: 200, 
      headers 
    }
  );
}

// ============================================================================
// Specialized Mock Handlers
// ============================================================================

/**
 * Handle GitHub-style API responses
 */
export async function handleGitHubMockRequest(
  feature: MockableFeature,
  context: MockRequestContext
): Promise<any> {
  const orchestrator = MockOrchestrator.getInstance();
  const scenario = orchestrator.getScenario(feature);
  const mockData = await orchestrator.getMockData(feature, scenario);
  
  if (!mockData) return null;

  // Handle different GitHub endpoint patterns
  const url = new URL(context.url);
  const path = url.pathname;
  
  if (path.includes('/installations')) {
    return { accounts: mockData.data };
  } else if (path.includes('/repositories')) {
    return { repositories: mockData.data };
  } else if (path.includes('/issues')) {
    return { issues: mockData.data };
  } else if (path.includes('/commits')) {
    return { commits: mockData.data };
  } else if (path.includes('/files')) {
    return { files: mockData.data };
  }
  
  return mockData.data;
}

/**
 * Handle AssetPack/Evidence Document pipeline responses
 */
export async function handlePipelineMockRequest(
  feature: 'ASSET_PACKS' | 'UPGRADES',
  context: MockRequestContext,
  method: string
): Promise<any> {
  const orchestrator = MockOrchestrator.getInstance();
  const scenario = orchestrator.getScenario(feature);
  
  if (method === 'GET') {
    // Return historical data
    const mockData = await orchestrator.getMockData(feature, scenario);
    return mockData?.data || [];
  } else if (method === 'POST') {
    // Handle pipeline execution
    if (isStreamingRequest({ method } as any)) {
      // Return streaming response
      const engine = createStreamingPipelineEngine.assetPack(scenario);
      return engine.createStream();
    } else {
      // Return immediate completion data
      const completionData = await orchestrator.getMockData('COMPLETION_DATA', scenario);
      return completionData?.data;
    }
  }
  
  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

function createRequestContext(request: NextRequest): MockRequestContext {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    method: request.method,
    url: request.url,
    headers,
    searchParams: new URL(request.url).searchParams,
    userAgent: headers['user-agent'],
    ip: headers['x-forwarded-for'] || headers['x-real-ip'],
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };
}

function isStreamingRequest(request: { method: string } | NextRequest): boolean {
  if ('headers' in request) {
    const accept = request.headers.get('accept') || '';
    return accept.includes('text/event-stream') || accept.includes('application/stream');
  }
  return request.method === 'POST'; // Assume POST requests might be streaming
}

function shouldInjectError(config?: MockMiddlewareConfig['errorInjection']): boolean {
  if (!config?.enabled) return false;
  return Math.random() < config.probability;
}

function createErrorResponse(
  config: NonNullable<MockMiddlewareConfig['errorInjection']>,
  customMessage?: string
): NextResponse {
  const errorType = config.types[Math.floor(Math.random() * config.types.length)];
  
  const errorMap: Record<string, { status: number; message: string }> = {
    'network': { status: 503, message: 'Network connectivity error' },
    'timeout': { status: 408, message: 'Request timeout' },
    'auth': { status: 401, message: 'Authentication required' },
    'validation': { status: 400, message: 'Invalid request data' },
    'server': { status: 500, message: 'Internal server error' },
    'rate_limit': { status: 429, message: 'Rate limit exceeded' },
    'maintenance': { status: 503, message: 'Service under maintenance' },
    'permission': { status: 403, message: 'Permission denied' },
    'not_found': { status: 404, message: 'Resource not found' },
    'conflict': { status: 409, message: 'Resource conflict' }
  };

  const error = errorMap[errorType] || errorMap['server'];
  const message = customMessage || error.message;

  return new NextResponse(
    JSON.stringify({ 
      error: message,
      type: errorType,
      timestamp: new Date().toISOString(),
      mock: true
    }),
    {
      status: error.status,
      headers: { 
        'Content-Type': 'application/json',
        'X-Mock-Error': 'true',
        'X-Mock-Error-Type': errorType
      }
    }
  );
}

function calculateResponseDelay(timing?: MockTimingProfile, context?: MockRequestContext): number {
  if (!timing || timing === 'instant') return 0;
  
  const delayMap = {
    'fast': [10, 100],
    'realistic': [100, 2000],
    'slow': [2000, 5000],
    'variable': [50, 1000]
  };
  
  const [min, max] = delayMap[timing] || [0, 0];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatResponseData(data: any, context: MockRequestContext): any {
  // Format based on request context
  const url = new URL(context.url);
  const searchParams = url.searchParams;
  
  // Handle pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (Array.isArray(data) && (searchParams.has('page') || searchParams.has('limit'))) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      }
    };
  }
  
  return data;
}

function generateETag(data: any): string {
  const content = JSON.stringify(data);
  return `"${Buffer.from(content).toString('base64').slice(0, 16)}"`;
}

function generateRequestId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function trackPerformance(
  feature: MockableFeature,
  context: MockRequestContext,
  duration: number
): void {
  if (process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
    console.log(`MockMiddleware Performance: ${feature}`, {
      method: context.method,
      url: context.url,
      duration: `${duration}ms`,
      timestamp: context.timestamp
    });
  }
  
  // Could integrate with actual performance monitoring here
}

// ============================================================================
// Route-specific Middleware Factories
// ============================================================================

/**
 * Create middleware for specific API routes with predefined configurations
 */
export const createMockMiddleware = {
  assetPacks: () => withMocking({
    feature: 'ASSET_PACKS',
    streamingSupported: true,
    timing: 'realistic',
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  evidenceDocuments: () => withMocking({
    feature: 'UPGRADES',
    streamingSupported: true,
    timing: 'realistic',
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  github: (subFeature: 'accounts' | 'repos' | 'issues' | 'commits' | 'branches' | 'files') => {
    const featureMap = {
      'accounts': 'GITHUB_ACCOUNTS',
      'repos': 'GITHUB_REPOS',
      'issues': 'GITHUB_ISSUES',
      'commits': 'GITHUB_COMMITS',
      'branches': 'GITHUB_BRANCHES',
      'files': 'GITHUB_FILES'
    } as const;
    
    return withMocking({
      feature: featureMap[subFeature],
      timing: 'fast',
      performanceTracking: true,
      cacheControl: { enabled: true, ttlSeconds: 600 }
    });
  },
  
  user: (subFeature: 'profile' | 'btd' | 'notifications' | 'connections') => {
    const featureMap = {
      'profile': 'USER_PROFILE',
      'btd': 'USER_BTD',
      'notifications': 'USER_NOTIFICATIONS',
      'connections': 'USER_CONNECTIONS'
    } as const;
    
    return withMocking({
      feature: featureMap[subFeature],
      timing: 'fast',
      performanceTracking: true,
      cacheControl: { enabled: true, ttlSeconds: 60 }
    });
  },
  
  templates: () => withMocking({
    feature: 'TEMPLATES',
    timing: 'fast',
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 3600 }
  }),
  
  chat: () => withMocking({
    feature: 'CHAT_STREAM',
    streamingSupported: true,
    timing: 'realistic',
    performanceTracking: true
  })
};

// Export everything for easy integration
export type { MockMiddlewareConfig, MockRequestContext, MockResponseOptions };
export { 
  handleGitHubMockRequest, 
  handlePipelineMockRequest,
  createRequestContext,
  isStreamingRequest
};
