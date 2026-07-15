"use strict";
/**
 * Bitcode Mock System - comprehensive application mocking infrastructure
 *
 * 🎯 COMPLETE SYSTEM COVERAGE (100+ Features):
 * - Auxillaries: onboarding, auth, profile, preferences (25+ features)
 * - Conversations: ChatGPT-style Bitcode experience (10+ features)
 * - AssetPacks/Evidence Documents: main pipeline experiences (16+ features)
 * - Organizations: enterprise team management (8+ features)
 * - Integrations: GitHub, GitLab, Bitbucket, Figma, Notion (25+ features)
 * - Marketplace: business listings and orders (5+ features)
 * - MCP Tools: pure API integrations (4+ features)
 * - System Health: monitoring and admin (15+ features)
 * - Treasury: BTC settlement, $BTD issuance, wallet posture (5+ features)
 * - Vector/AI: embeddings and intelligence (5+ features)
 *
 * 🚀 ENTERPRISE FEATURES:
 * - ✅ Type-safe mock orchestration (100+ mockable features)
 * - ✅ Real-time streaming simulation (pipeline execution)
 * - ✅ Intelligent scenario management (demo, testing, enterprise, etc.)
 * - ✅ Performance monitoring & validation (enterprise scale)
 * - ✅ Component-level integration (React hooks & providers)
 * - ✅ Zero-configuration setup (single flag enablement)
 * - ✅ Production-quality reliability (error handling & fallbacks)
 * - ✅ Extensible plugin architecture (custom generators)
 * - ✅ Area-specific middleware (specialized for each system area)
 * - ✅ Comprehensive data generation (realistic relationships)
 *
 * Usage:
 * ```typescript
 * // Enable master mock mode for entire system
 * NEXT_PUBLIC_MASTER_MOCK_MODE=true
 *
 * // Use in React components
 * const { data } = useMockData('ASSET_PACKS');
 *
 * // Use in API routes
 * export const GET = mockAssetPacks(originalHandler);
 *
 * // Use specialized middleware (recommended)
 * export const GET = mockAreas.pipelines.assetPacks.main()(originalHandler);
 * export const POST = mockAreas.auxillaries.auth.github()(originalHandler);
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_SYSTEM_BUILD = exports.MOCK_SYSTEM_VERSION = exports.createSpecializedMiddleware = exports.mockConvenience = exports.mockAreas = exports.mockAdmin = exports.mockHealth = exports.mockMCP = exports.mockPayments = exports.mockMarketplace = exports.mockIntegrations = exports.mockGitLab = exports.mockGitHubSpecialized = exports.mockOrganizations = exports.mockAssetPacksSpecialized = exports.mockChat = exports.mockConversation = exports.mockOnboarding = exports.mockUser = exports.mockAuth = exports.handlePipelineMockRequest = exports.handleGitHubMockRequest = exports.createMockMiddleware = exports.mockUserData = exports.mockGitHub = exports.mockAssetPacks = exports.withStreamingMocking = exports.withMocking = exports.withMockData = exports.RealOnly = exports.MockOnly = exports.useMockDataMultiple = exports.useMockDataConditional = exports.useMockContext = exports.useMockData = exports.MockProvider = exports.comprehensiveMockGenerator = exports.mockDataGenerator = exports.createStreamingPipelineEngine = exports.StreamingPipelineEngine = exports.MockOrchestrator = void 0;
exports.loadMockConfig = loadMockConfig;
exports.initializeMockSystem = initializeMockSystem;
exports.isMockingEnabled = isMockingEnabled;
exports.getMockConfig = getMockConfig;
exports.createDevMockSetup = createDevMockSetup;
exports.createTestMockSetup = createTestMockSetup;
exports.createProdMockSetup = createProdMockSetup;
// ============================================================================
// Core Exports
// ============================================================================
// Orchestration
var MockOrchestrator_1 = require("./core/MockOrchestrator");
Object.defineProperty(exports, "MockOrchestrator", { enumerable: true, get: function () { return MockOrchestrator_1.MockOrchestrator; } });
// Streaming Engine
var StreamingPipelineEngine_1 = require("./engines/StreamingPipelineEngine");
Object.defineProperty(exports, "StreamingPipelineEngine", { enumerable: true, get: function () { return StreamingPipelineEngine_1.StreamingPipelineEngine; } });
Object.defineProperty(exports, "createStreamingPipelineEngine", { enumerable: true, get: function () { return StreamingPipelineEngine_1.createStreamingPipelineEngine; } });
// Data Generation
var MockDataGenerators_1 = require("./generators/MockDataGenerators");
Object.defineProperty(exports, "mockDataGenerator", { enumerable: true, get: function () { return MockDataGenerators_1.mockDataGenerator; } });
var ComprehensiveMockDataGenerators_1 = require("./generators/ComprehensiveMockDataGenerators");
Object.defineProperty(exports, "comprehensiveMockGenerator", { enumerable: true, get: function () { return ComprehensiveMockDataGenerators_1.comprehensiveMockGenerator; } });
// Component Integration
var MockProvider_1 = require("./integration/MockProvider");
Object.defineProperty(exports, "MockProvider", { enumerable: true, get: function () { return MockProvider_1.MockProvider; } });
Object.defineProperty(exports, "useMockData", { enumerable: true, get: function () { return MockProvider_1.useMockData; } });
Object.defineProperty(exports, "useMockContext", { enumerable: true, get: function () { return MockProvider_1.useMockContext; } });
Object.defineProperty(exports, "useMockDataConditional", { enumerable: true, get: function () { return MockProvider_1.useMockDataConditional; } });
Object.defineProperty(exports, "useMockDataMultiple", { enumerable: true, get: function () { return MockProvider_1.useMockDataMultiple; } });
Object.defineProperty(exports, "MockOnly", { enumerable: true, get: function () { return MockProvider_1.MockOnly; } });
Object.defineProperty(exports, "RealOnly", { enumerable: true, get: function () { return MockProvider_1.RealOnly; } });
Object.defineProperty(exports, "withMockData", { enumerable: true, get: function () { return MockProvider_1.withMockData; } });
// Middleware
var MockMiddleware_1 = require("./middleware/MockMiddleware");
Object.defineProperty(exports, "withMocking", { enumerable: true, get: function () { return MockMiddleware_1.withMocking; } });
Object.defineProperty(exports, "withStreamingMocking", { enumerable: true, get: function () { return MockMiddleware_1.withStreamingMocking; } });
Object.defineProperty(exports, "mockAssetPacks", { enumerable: true, get: function () { return MockMiddleware_1.mockAssetPacks; } });
Object.defineProperty(exports, "mockGitHub", { enumerable: true, get: function () { return MockMiddleware_1.mockGitHub; } });
Object.defineProperty(exports, "mockUserData", { enumerable: true, get: function () { return MockMiddleware_1.mockUserData; } });
Object.defineProperty(exports, "createMockMiddleware", { enumerable: true, get: function () { return MockMiddleware_1.createMockMiddleware; } });
Object.defineProperty(exports, "handleGitHubMockRequest", { enumerable: true, get: function () { return MockMiddleware_1.handleGitHubMockRequest; } });
Object.defineProperty(exports, "handlePipelineMockRequest", { enumerable: true, get: function () { return MockMiddleware_1.handlePipelineMockRequest; } });
// ============================================================================
// SPECIALIZED MIDDLEWARE (Complete System Coverage)
// ============================================================================
// User Auxillaries (Onboarding, Auth, Profile) - 25+ Features
var SpecializedMockMiddleware_1 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockAuth", { enumerable: true, get: function () { return SpecializedMockMiddleware_1.mockAuth; } });
Object.defineProperty(exports, "mockUser", { enumerable: true, get: function () { return SpecializedMockMiddleware_1.mockUser; } });
Object.defineProperty(exports, "mockOnboarding", { enumerable: true, get: function () { return SpecializedMockMiddleware_1.mockOnboarding; } }); // Steps, Progress, Lock
// Conversations (ChatGPT for Engineering) - 10+ Features  
var SpecializedMockMiddleware_2 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockConversation", { enumerable: true, get: function () { return SpecializedMockMiddleware_2.mockConversation; } });
Object.defineProperty(exports, "mockChat", { enumerable: true, get: function () { return SpecializedMockMiddleware_2.mockChat; } }); // Stream, Completions with realistic AI simulation
// Core Pipelines (AssetPacks) - 16+ Features
var SpecializedMockMiddleware_3 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockAssetPacksSpecialized", { enumerable: true, get: function () { return SpecializedMockMiddleware_3.mockAssetPacks; } }); // Full pipeline with streaming
// Organization & Enterprise - 8+ Features
var SpecializedMockMiddleware_4 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockOrganizations", { enumerable: true, get: function () { return SpecializedMockMiddleware_4.mockOrganizations; } }); // Teams, Members, Treasury, Invitations
// External Integrations - 25+ Features
var SpecializedMockMiddleware_5 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockGitHubSpecialized", { enumerable: true, get: function () { return SpecializedMockMiddleware_5.mockGitHub; } });
Object.defineProperty(exports, "mockGitLab", { enumerable: true, get: function () { return SpecializedMockMiddleware_5.mockGitLab; } });
Object.defineProperty(exports, "mockIntegrations", { enumerable: true, get: function () { return SpecializedMockMiddleware_5.mockIntegrations; } }); // Bitbucket, Figma, Notion
// Business Features - 5+ Features
var SpecializedMockMiddleware_6 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockMarketplace", { enumerable: true, get: function () { return SpecializedMockMiddleware_6.mockMarketplace; } });
Object.defineProperty(exports, "mockPayments", { enumerable: true, get: function () { return SpecializedMockMiddleware_6.mockPayments; } }); // BTC settlement, $BTD issuance, Wallets
// MCP Tools (Pure API) - 4+ Features
var SpecializedMockMiddleware_7 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockMCP", { enumerable: true, get: function () { return SpecializedMockMiddleware_7.mockMCP; } }); // AWS, Supabase, Vercel, Generic Tools
// System Health & Admin - 15+ Features
var SpecializedMockMiddleware_8 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockHealth", { enumerable: true, get: function () { return SpecializedMockMiddleware_8.mockHealth; } });
Object.defineProperty(exports, "mockAdmin", { enumerable: true, get: function () { return SpecializedMockMiddleware_8.mockAdmin; } }); // Users, Analytics, Run Monitoring
// Area-Based Organization & Utilities
var SpecializedMockMiddleware_9 = require("./middleware/SpecializedMockMiddleware");
Object.defineProperty(exports, "mockAreas", { enumerable: true, get: function () { return SpecializedMockMiddleware_9.mockAreas; } });
Object.defineProperty(exports, "mockConvenience", { enumerable: true, get: function () { return SpecializedMockMiddleware_9.mockConvenience; } });
Object.defineProperty(exports, "createSpecializedMiddleware", { enumerable: true, get: function () { return SpecializedMockMiddleware_9.createSpecializedMiddleware; } }); // Factory for custom middleware
/**
 * Load configuration from environment variables
 */
function loadMockConfig() {
    return {
        enabled: process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true',
        defaultScenario: process.env.NEXT_PUBLIC_MOCK_SCENARIO || 'demo',
        timing: process.env.NEXT_PUBLIC_MOCK_TIMING || 'realistic',
        complexity: process.env.NEXT_PUBLIC_MOCK_COMPLEXITY || 'moderate',
        debug: process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true',
        performanceMonitoring: process.env.NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING !== 'false',
        caching: process.env.NEXT_PUBLIC_MOCK_CACHE_ENABLED !== 'false',
        validation: process.env.NEXT_PUBLIC_MOCK_VALIDATION_ENABLED !== 'false',
        features: loadFeatureOverrides(),
        errorInjection: {
            enabled: process.env.NEXT_PUBLIC_MOCK_ERROR_INJECTION === 'true',
            probability: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.01'),
            types: (process.env.NEXT_PUBLIC_MOCK_ERROR_TYPES || 'network,timeout').split(',')
        },
        cache: {
            maxSizeMB: parseInt(process.env.NEXT_PUBLIC_MOCK_CACHE_MAX_SIZE_MB || '100'),
            ttlSeconds: parseInt(process.env.NEXT_PUBLIC_MOCK_CACHE_TTL_SECONDS || '300'),
            cleanupIntervalSeconds: parseInt(process.env.NEXT_PUBLIC_MOCK_CACHE_CLEANUP_INTERVAL || '60')
        },
        performance: {
            maxMemoryMB: parseInt(process.env.NEXT_PUBLIC_MOCK_MAX_MEMORY_MB || '1000'),
            maxLatencyMs: parseInt(process.env.NEXT_PUBLIC_MOCK_MAX_LATENCY_MS || '5000'),
            maxErrorRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_MAX_ERROR_RATE || '0.05')
        }
    };
}
function loadFeatureOverrides() {
    const features = {};
    const allFeatures = [
        // Core Pipeline Features (16 features)
        'ASSET_PACKS', 'ASSET_PACK_RUNS', 'ASSET_PACK_HISTORY', 'ASSET_PACK_ITEMS',
        'ASSET_PACK_INSTRUCTIONS', 'ASSET_PACK_STREAM', 'ASSET_PACK_LOGS', 'ASSET_PACK_RUN_EVENTS',
        'UPGRADES', 'UPGRADE_RUNS', 'UPGRADE_HISTORY', 'UPGRADE_ITEMS',
        'UPGRADE_INSTRUCTIONS', 'UPGRADE_STREAM', 'UPGRADE_LOGS', 'UPGRADE_RUN_EVENTS',
        // Conversations Features (10 features)
        'CONVERSATION_CONVERSATIONS', 'CONVERSATION_MESSAGES', 'CONVERSATION_RUNS', 'CONVERSATION_SOURCES', 'CONVERSATION_REPOS',
        'CONVERSATION_ACCOUNT', 'CONVERSATION_STREAM', 'CHAT_STREAM', 'CHAT_COMPLETIONS', 'CONVERSATION_ATTACHMENTS',
        // User Auxillaries features (25 features)
        'AUTH_GITHUB', 'AUTH_CHATGPT', 'AUTH_METAMASK', 'AUTH_SESSIONS', 'AUTH_CALLBACKS', 'AUTH_NEXTAUTH', 'AUTH_UNLINK', 'AUTH_CONFIRM',
        'USER_PROFILE', 'USER_DATA', 'USER_BTD', 'USER_USAGE', 'USER_TRANSACTIONS', 'USER_API_KEYS',
        'USER_PREFERENCES', 'USER_MODEL_PREFERENCES', 'USER_TEMPLATE_PREFERENCES', 'USER_NOTIFICATIONS',
        'USER_CONNECTIONS', 'USER_REPOSITORIES', 'USER_DATA_SHARE',
        'ONBOARDING_STEPS', 'ONBOARDING_PROGRESS', 'ONBOARDING_LOCK',
        // Organization Features (8 features)
        'ORGANIZATIONS', 'ORGANIZATION_MEMBERS', 'ORGANIZATION_BTD', 'ORGANIZATION_INVITATIONS',
        'TEAM_INVITATIONS', 'TEAM_MEMBERSHIPS', 'INVITATION_ACCEPTANCE', 'BTD_TRANSACTIONS',
        // External Integrations (25 features)
        'GITHUB_ACCOUNTS', 'GITHUB_REPOS', 'GITHUB_BRANCHES', 'GITHUB_COMMITS', 'GITHUB_ISSUES', 'GITHUB_FILES', 'GITHUB_CONNECTIONS', 'GITHUB_INTERACTIONS',
        'GITLAB_OAUTH', 'GITLAB_CONNECTIONS', 'GITLAB_PROJECTS', 'GITLAB_REPOS', 'GITLAB_CALLBACKS',
        'BITBUCKET_OAUTH', 'BITBUCKET_CONNECTIONS', 'BITBUCKET_REPOSITORIES', 'BITBUCKET_CALLBACKS',
        'FIGMA_OAUTH', 'FIGMA_CONNECTIONS', 'FIGMA_PROJECTS', 'FIGMA_TEAMS', 'FIGMA_CALLBACKS',
        'NOTION_OAUTH', 'NOTION_CONNECTIONS', 'NOTION_WORKSPACES', 'NOTION_PAGES', 'NOTION_CALLBACKS',
        // Business Features (10 features)
        'MARKETPLACE_LISTINGS', 'MARKETPLACE_STREAM', 'MARKETPLACE_ORDERS', 'MARKETPLACE_TICKER', 'MARKETPLACE_CATEGORIES',
        'BTC_SETTLEMENTS', 'BTD_ISSUANCES', 'WALLET_OBSERVATIONS', 'BTD_ACQUISITIONS', 'WALLET_CONNECTIONS',
        // Templates & MCP (8 features)
        'ASSET_PACK_TEMPLATES', 'UPGRADE_TEMPLATES', 'TEMPLATE_PREFERENCES', 'TEMPLATE_CATEGORIES',
        'MCP_AWS', 'MCP_SUPABASE', 'MCP_VERCEL', 'MCP_TOOLS',
        // System & Health (20 features)
        'TRIGGERS', 'WEBHOOKS', 'GENERIC_WEBHOOKS', 'API_ENDPOINTS', 'SCRIPTS',
        'HEALTH_CHECKS', 'HEALTH_LIVE', 'HEALTH_READY', 'HEALTH_SERVICES', 'SYSTEM_HEALTH',
        'ERROR_LOGS', 'CLIENT_ERRORS', 'SYSTEM_NOTIFICATIONS', 'EVENTS', 'FEEDBACK',
        'ISSUES', 'ISSUE_EVENTS', 'SECURITY_AUDIT',
        'ADMIN_USERS', 'ADMIN_ORGANIZATIONS', 'ADMIN_RUNS', 'ADMIN_ANALYTICS', 'USAGE_ANALYTICS', 'FINANCIAL_ANALYTICS', 'RUN_MONITORING',
        // Vector & AI (5 features)
        'ASSET_PACK_VECTORS', 'UPGRADE_VECTORS', 'USER_VECTORS', 'PATTERN_RECOGNITION', 'VECTOR_SEARCH',
        // Retained generic areas (6 features) 
        'COMPLETION_DATA', 'PROCESSING_STATS', 'REPO_SNAPSHOTS', 'API_RESPONSES', 'ERROR_SCENARIOS', 'PERFORMANCE_METRICS'
    ];
    allFeatures.forEach(feature => {
        const enabled = process.env[`NEXT_PUBLIC_MOCK_${feature}`];
        const scenario = process.env[`NEXT_PUBLIC_MOCK_${feature}_SCENARIO`];
        const timing = process.env[`NEXT_PUBLIC_MOCK_${feature}_TIMING`];
        if (enabled !== undefined || scenario !== undefined || timing !== undefined) {
            features[feature] = {
                ...(enabled !== undefined && { enabled: enabled === 'true' }),
                ...(scenario && { scenario: scenario }),
                ...(timing && { timing: timing })
            };
        }
    });
    return features;
}
// ============================================================================
// Quick Setup Functions
// ============================================================================
/**
 * Initialize the mock system with default configuration
 */
function initializeMockSystem(config) {
    const finalConfig = { ...loadMockConfig(), ...config };
    if (finalConfig.debug) {
        console.log('🔧 Bitcode Mock System initialized with config:', finalConfig);
    }
    // Initialize orchestrator
    const orchestrator = MockOrchestrator.getInstance();
    // Register built-in scenarios if they don't exist
    registerBuiltinScenarios();
    if (finalConfig.debug) {
        console.log('✅ Mock system ready');
    }
}
/**
 * Register built-in scenarios
 */
function registerBuiltinScenarios() {
    const orchestrator = MockOrchestrator.getInstance();
    // Demo scenario - rich, engaging data
    orchestrator.registerScenario({
        id: 'demo',
        name: 'Demo Experience',
        description: 'Rich, engaging demo data perfect for showcasing Bitcode capabilities',
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
    // Testing scenario - minimal, predictable data
    orchestrator.registerScenario({
        id: 'testing',
        name: 'Test Data',
        description: 'Minimal, predictable data perfect for automated testing',
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
    // Enterprise scenario - large-scale data
    orchestrator.registerScenario({
        id: 'enterprise',
        name: 'Enterprise Scale',
        description: 'Large-scale data representing enterprise usage patterns',
        type: 'enterprise',
        complexity: 'enterprise',
        timing: 'realistic',
        features: {},
        metadata: {
            version: '1.0.0',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            author: 'Bitcode Team',
            tags: ['enterprise', 'scale', 'performance'],
            realistic: true,
            useCases: ['enterprise-demos', 'load-testing', 'scaling-validation'],
            performance: {
                expectedMemoryMB: 200,
                expectedLatencyMs: 1000,
                maxDataSizeKB: 5000
            }
        }
    });
    // Empty scenario - empty states
    orchestrator.registerScenario({
        id: 'empty',
        name: 'Empty States',
        description: 'Empty data for testing zero-state experiences',
        type: 'empty',
        complexity: 'minimal',
        timing: 'fast',
        features: {},
        metadata: {
            version: '1.0.0',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            author: 'Bitcode Team',
            tags: ['empty', 'zero-state', 'minimal'],
            realistic: true,
            useCases: ['new-user-experience', 'empty-states', 'edge-cases'],
            performance: {
                expectedMemoryMB: 1,
                expectedLatencyMs: 10,
                maxDataSizeKB: 10
            }
        }
    });
}
// ============================================================================
// Utility Functions
// ============================================================================
/**
 * Check if mocking is enabled globally
 */
function isMockingEnabled() {
    return process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true';
}
/**
 * Get current mock configuration
 */
function getMockConfig() {
    return loadMockConfig();
}
/**
 * Create a development-friendly mock setup
 */
function createDevMockSetup() {
    return {
        enabled: true,
        defaultScenario: 'demo',
        debug: true,
        performanceMonitoring: true,
        timing: 'realistic'
    };
}
/**
 * Create a testing-friendly mock setup
 */
function createTestMockSetup() {
    return {
        enabled: true,
        defaultScenario: 'testing',
        debug: false,
        performanceMonitoring: false,
        timing: 'fast'
    };
}
/**
 * Create a production-safe mock setup (disabled by default)
 */
function createProdMockSetup() {
    return {
        enabled: false,
        defaultScenario: 'demo',
        debug: false,
        performanceMonitoring: true,
        timing: 'realistic'
    };
}
// ============================================================================
// Auto-initialization
// ============================================================================
// Auto-initialize if in browser environment and mocking is enabled
if (typeof window !== 'undefined' && isMockingEnabled()) {
    initializeMockSystem();
}
// ============================================================================
// Version and Build Info
// ============================================================================
exports.MOCK_SYSTEM_VERSION = '1.0.0';
exports.MOCK_SYSTEM_BUILD = new Date().toISOString();
// Development tools
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
    window.__bitcodeMockSystem = {
        version: exports.MOCK_SYSTEM_VERSION,
        build: exports.MOCK_SYSTEM_BUILD,
        config: getMockConfig(),
        orchestrator: MockOrchestrator.getInstance(),
        dataGenerator: mockDataGenerator,
        // Utility functions for console debugging
        enableMocking: () => {
            process.env.NEXT_PUBLIC_MASTER_MOCK_MODE = 'true';
            console.log('🟢 Mock system enabled');
        },
        disableMocking: () => {
            process.env.NEXT_PUBLIC_MASTER_MOCK_MODE = 'false';
            console.log('🔴 Mock system disabled');
        },
        switchScenario: (scenario) => {
            process.env.NEXT_PUBLIC_MOCK_SCENARIO = scenario;
            console.log(`🔄 Switched to scenario: ${scenario}`);
        },
        getMetrics: () => MockOrchestrator.getInstance().getPerformanceMetrics(),
        validateSystem: () => MockOrchestrator.getInstance().validateSystem(),
        clearCache: () => MockOrchestrator.getInstance().reset()
    };
    console.log(`🚀 Bitcode Mock System v${exports.MOCK_SYSTEM_VERSION} loaded`);
    console.log('Debug tools available at window.__bitcodeMockSystem');
}
