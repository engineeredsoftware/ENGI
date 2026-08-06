"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockMiddleware = exports.mockUserData = exports.mockGitHub = exports.mockAssetPacks = void 0;
exports.withMocking = withMocking;
exports.withStreamingMocking = withStreamingMocking;
exports.handleGitHubMockRequest = handleGitHubMockRequest;
exports.handlePipelineMockRequest = handlePipelineMockRequest;
exports.createRequestContext = createRequestContext;
exports.isStreamingRequest = isStreamingRequest;
const server_1 = require("next/server");
const MockOrchestrator_1 = require("../core/MockOrchestrator");
const StreamingPipelineEngine_1 = require("../engines/StreamingPipelineEngine");
// ============================================================================
// Core Mock Middleware
// ============================================================================
/**
 * Primary middleware function for API route mock integration
 */
function withMocking(config, originalHandler) {
    return async function mockableHandler(request) {
        const orchestrator = MockOrchestrator_1.MockOrchestrator.getInstance();
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
                return createErrorResponse(config.errorInjection);
            }
            // Handle streaming requests
            if (config.streamingSupported && isStreamingRequest(request)) {
                return await handleStreamingRequest(config, context, scenario);
            }
            // Handle regular requests
            return await handleRegularRequest(config, context, scenario);
        }
        catch (error) {
            console.error(`MockMiddleware: Error in ${config.feature} handler:`, error);
            return createErrorResponse({
                enabled: true,
                probability: 1,
                types: ['server']
            }, error.message);
        }
        finally {
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
function withStreamingMocking(config, originalHandler) {
    const streamingConfig = { ...config, streamingSupported: true };
    return withMocking(streamingConfig, originalHandler);
}
/**
 * Simplified wrapper for common API endpoints
 */
const mockAssetPacks = (handler) => withMocking({
    feature: 'ASSET_PACKS',
    streamingSupported: true,
    performanceTracking: true
}, handler);
exports.mockAssetPacks = mockAssetPacks;
// Read-measurement pipeline placeholder reuses assetPacks mocks until GA-2
const mockGitHub = (feature) => (handler) => withMocking({
    feature,
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 300 }
}, handler);
exports.mockGitHub = mockGitHub;
const mockUserData = (feature) => (handler) => withMocking({
    feature,
    performanceTracking: true,
    cacheControl: { enabled: true, ttlSeconds: 60 }
}, handler);
exports.mockUserData = mockUserData;
// ============================================================================
// Request/Response Handling
// ============================================================================
async function handleStreamingRequest(config, context, scenario) {
    const engine = StreamingPipelineEngine_1.createStreamingPipelineEngine.assetPack(scenario);
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
    return new server_1.NextResponse(stream, {
        status: 200,
        headers
    });
}
async function handleRegularRequest(config, context, scenario) {
    const orchestrator = MockOrchestrator_1.MockOrchestrator.getInstance();
    // Generate mock data based on feature and scenario
    const mockData = await orchestrator.getMockData(config.feature, scenario);
    if (!mockData) {
        return new server_1.NextResponse(JSON.stringify({ error: 'Mock data not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    // Apply timing simulation
    const delay = calculateResponseDelay(config.timing, context);
    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    // Determine response format based on request
    const responseData = formatResponseData(mockData.data, context);
    const headers = {
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
    return new server_1.NextResponse(JSON.stringify(responseData), {
        status: 200,
        headers
    });
}
// ============================================================================
// Specialized Mock Handlers
// ============================================================================
/**
 * Handle GitHub-style API responses
 */
async function handleGitHubMockRequest(feature, context) {
    const orchestrator = MockOrchestrator_1.MockOrchestrator.getInstance();
    const scenario = orchestrator.getScenario(feature);
    const mockData = await orchestrator.getMockData(feature, scenario);
    if (!mockData)
        return null;
    // Handle different GitHub endpoint patterns
    const url = new URL(context.url);
    const path = url.pathname;
    if (path.includes('/installations')) {
        return { accounts: mockData.data };
    }
    else if (path.includes('/repositories')) {
        return { repositories: mockData.data };
    }
    else if (path.includes('/issues')) {
        return { issues: mockData.data };
    }
    else if (path.includes('/commits')) {
        return { commits: mockData.data };
    }
    else if (path.includes('/files')) {
        return { files: mockData.data };
    }
    return mockData.data;
}
/**
 * Handle AssetPack and Evidence Document pipeline responses.
 */
async function handlePipelineMockRequest(feature, context, method) {
    const orchestrator = MockOrchestrator_1.MockOrchestrator.getInstance();
    const scenario = orchestrator.getScenario(feature);
    if (method === 'GET') {
        // Return historical data
        const mockData = await orchestrator.getMockData(feature, scenario);
        return mockData?.data || [];
    }
    else if (method === 'POST') {
        // Handle pipeline execution
        if (isStreamingRequest({ method })) {
            // Return streaming response
            const engine = StreamingPipelineEngine_1.createStreamingPipelineEngine.assetPack(scenario);
            return engine.createStream();
        }
        else {
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
function createRequestContext(request) {
    const headers = {};
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
function isStreamingRequest(request) {
    if ('headers' in request) {
        const accept = request.headers.get('accept') || '';
        return accept.includes('text/event-stream') || accept.includes('application/stream');
    }
    return request.method === 'POST'; // Assume POST requests might be streaming
}
function shouldInjectError(config) {
    if (!config?.enabled)
        return false;
    return Math.random() < config.probability;
}
function createErrorResponse(config, customMessage) {
    const errorType = config.types[Math.floor(Math.random() * config.types.length)];
    const errorMap = {
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
    return new server_1.NextResponse(JSON.stringify({
        error: message,
        type: errorType,
        timestamp: new Date().toISOString(),
        mock: true
    }), {
        status: error.status,
        headers: {
            'Content-Type': 'application/json',
            'X-Mock-Error': 'true',
            'X-Mock-Error-Type': errorType
        }
    });
}
function calculateResponseDelay(timing, context) {
    if (!timing || timing === 'instant')
        return 0;
    const delayMap = {
        'fast': [10, 100],
        'realistic': [100, 2000],
        'slow': [2000, 5000],
        'variable': [50, 1000]
    };
    const [min, max] = delayMap[timing] || [0, 0];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatResponseData(data, context) {
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
function generateETag(data) {
    const content = JSON.stringify(data);
    return `"${Buffer.from(content).toString('base64').slice(0, 16)}"`;
}
function generateRequestId() {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function trackPerformance(feature, context, duration) {
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
exports.createMockMiddleware = {
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
    github: (subFeature) => {
        const featureMap = {
            'accounts': 'GITHUB_ACCOUNTS',
            'repos': 'GITHUB_REPOS',
            'issues': 'GITHUB_ISSUES',
            'commits': 'GITHUB_COMMITS',
            'branches': 'GITHUB_BRANCHES',
            'files': 'GITHUB_FILES'
        };
        return withMocking({
            feature: featureMap[subFeature],
            timing: 'fast',
            performanceTracking: true,
            cacheControl: { enabled: true, ttlSeconds: 600 }
        });
    },
    user: (subFeature) => {
        const featureMap = {
            'profile': 'USER_PROFILE',
            'btd': 'USER_BTD',
            'notifications': 'USER_NOTIFICATIONS',
            'connections': 'USER_CONNECTIONS'
        };
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
