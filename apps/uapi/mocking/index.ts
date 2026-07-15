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

// ============================================================================
// Core Exports
// ============================================================================

// Orchestration
export { MockOrchestrator } from './core/MockOrchestrator';
export type { MockPlugin } from './core/MockOrchestrator';

// Streaming Engine
export { StreamingPipelineEngine, createStreamingPipelineEngine } from './engines/StreamingPipelineEngine';

// Data Generation
export { mockDataGenerator } from './generators/MockDataGenerators';
export { comprehensiveMockGenerator } from './generators/ComprehensiveMockDataGenerators';

// Component Integration
export { 
  MockProvider, 
  useMockData, 
  useMockContext, 
  useMockDataConditional,
  useMockDataMultiple,
  MockOnly,
  RealOnly,
  withMockData
} from './integration/MockProvider';
export type { MockContextValue, CacheStats } from './integration/MockProvider';

// Middleware
export { 
  withMocking,
  withStreamingMocking,
  mockAssetPacks,
  mockGitHub,
  mockUserData,
  createMockMiddleware,
  handleGitHubMockRequest,
  handlePipelineMockRequest
} from './middleware/MockMiddleware';
export type { MockMiddlewareConfig, MockRequestContext, MockResponseOptions } from './middleware/MockMiddleware';

// ============================================================================
// SPECIALIZED MIDDLEWARE (Complete System Coverage)
// ============================================================================

// User Auxillaries (Onboarding, Auth, Profile) - 25+ Features
export {
  mockAuth,           // GitHub, ChatGPT, Metamask, NextAuth, Sessions
  mockUser,           // Profile, $BTD, Usage, API Keys, Preferences
  mockOnboarding      // Steps, Progress, Lock
} from './middleware/SpecializedMockMiddleware';

// Conversations (ChatGPT for Engineering) - 10+ Features  
export {
  mockConversation,           // Conversations, Messages, Runs, Sources, Repos
  mockChat            // Stream, Completions with realistic AI simulation
} from './middleware/SpecializedMockMiddleware';

// Core Pipelines (AssetPacks) - 16+ Features
export {
  mockAssetPacks as mockAssetPacksSpecialized  // Full pipeline with streaming
} from './middleware/SpecializedMockMiddleware';

// Organization & Enterprise - 8+ Features
export {
  mockOrganizations   // Teams, Members, Treasury, Invitations
} from './middleware/SpecializedMockMiddleware';

// External Integrations - 25+ Features
export {
  mockGitHub as mockGitHubSpecialized,  // Comprehensive GitHub integration
  mockGitLab,                           // GitLab projects and OAuth
  mockIntegrations                      // Bitbucket, Figma, Notion
} from './middleware/SpecializedMockMiddleware';

// Business Features - 5+ Features
export {
  mockMarketplace,    // Listings, Orders, Ticker, Categories
  mockPayments        // BTC settlement, $BTD issuance, Wallets
} from './middleware/SpecializedMockMiddleware';

// MCP Tools (Pure API) - 4+ Features
export {
  mockMCP            // AWS, Supabase, Vercel, Generic Tools
} from './middleware/SpecializedMockMiddleware';

// System Health & Admin - 15+ Features
export {
  mockHealth,        // Health checks, Live, Ready, Services
  mockAdmin          // Users, Analytics, Run Monitoring
} from './middleware/SpecializedMockMiddleware';

// Area-Based Organization & Utilities
export {
  mockAreas,         // Organized by system area for easy access
  mockConvenience,   // Shortcuts for common mock areas
  createSpecializedMiddleware  // Factory for custom middleware
} from './middleware/SpecializedMockMiddleware';

// Types
export type {
  // Core Types
  MockableFeature,
  MockScenarioType,
  MockScenarioConfig,
  MockDataContainer,
  StreamableMockData,
  MockTimingProfile,
  MockComplexity,
  MockFeatureConfig,
  MockErrorConfig,
  MockErrorType,
  
  // Pipeline Types
  MockPipelineEvent,
  MockPipelineEventType,
  MockPipelineStreamConfig,
  MockPipelinePhase,
  MockLlmCall,
  MockToolUsage,
  
  // Performance Types
  MockPerformanceMetrics,
  MockValidationResult,
  
  // Re-exported API Types
  CompletionData,
  PipelineExecution,
  Account,
  Repository,
  IssueOrPR,
  RepoFile,
  UrlEntry,
  ExecutionState,
  StreamStatusMessage,
  LlmCallData,
  ShippableTemplates,
  IntegrationOption,
  Issue
} from './types/core';

// ============================================================================
// Configuration System
// ============================================================================

/**
 * Global mock system configuration
 */
export interface BitcodeMockConfig {
  /** Master toggle for all mocking */
  enabled: boolean;
  
  /** Default scenario for all features */
  defaultScenario: MockScenarioType;
  
  /** Timing profile for responses */
  timing: MockTimingProfile;
  
  /** Data complexity level */
  complexity: MockComplexity;
  
  /** Enable debug mode */
  debug: boolean;
  
  /** Enable performance monitoring */
  performanceMonitoring: boolean;
  
  /** Enable caching */
  caching: boolean;
  
  /** Enable validation */
  validation: boolean;
  
  /** Feature-specific overrides */
  features: Partial<Record<MockableFeature, {
    enabled?: boolean;
    scenario?: MockScenarioType;
    timing?: MockTimingProfile;
  }>>;
  
  /** Error injection settings */
  errorInjection: {
    enabled: boolean;
    probability: number;
    types: MockErrorType[];
  };
  
  /** Cache configuration */
  cache: {
    maxSizeMB: number;
    ttlSeconds: number;
    cleanupIntervalSeconds: number;
  };
  
  /** Performance thresholds */
  performance: {
    maxMemoryMB: number;
    maxLatencyMs: number;
    maxErrorRate: number;
  };
}

/**
 * Load configuration from environment variables
 */
export function loadMockConfig(): BitcodeMockConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true',
    defaultScenario: (process.env.NEXT_PUBLIC_MOCK_SCENARIO as MockScenarioType) || 'demo',
    timing: (process.env.NEXT_PUBLIC_MOCK_TIMING as MockTimingProfile) || 'realistic',
    complexity: (process.env.NEXT_PUBLIC_MOCK_COMPLEXITY as MockComplexity) || 'moderate',
    debug: process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true',
    performanceMonitoring: process.env.NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING !== 'false',
    caching: process.env.NEXT_PUBLIC_MOCK_CACHE_ENABLED !== 'false',
    validation: process.env.NEXT_PUBLIC_MOCK_VALIDATION_ENABLED !== 'false',
    features: loadFeatureOverrides(),
    errorInjection: {
      enabled: process.env.NEXT_PUBLIC_MOCK_ERROR_INJECTION === 'true',
      probability: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.01'),
      types: (process.env.NEXT_PUBLIC_MOCK_ERROR_TYPES || 'network,timeout').split(',') as MockErrorType[]
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

function loadFeatureOverrides(): Partial<Record<MockableFeature, any>> {
  const features: Partial<Record<MockableFeature, any>> = {};
  
  const allFeatures: MockableFeature[] = [
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
        ...(scenario && { scenario: scenario as MockScenarioType }),
        ...(timing && { timing: timing as MockTimingProfile })
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
export function initializeMockSystem(config?: Partial<BitcodeMockConfig>): void {
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
function registerBuiltinScenarios(): void {
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
export function isMockingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MASTER_MOCK_MODE === 'true';
}

/**
 * Get current mock configuration
 */
export function getMockConfig(): BitcodeMockConfig {
  return loadMockConfig();
}

/**
 * Create a development-friendly mock setup
 */
export function createDevMockSetup() {
  return {
    enabled: true,
    defaultScenario: 'demo' as MockScenarioType,
    debug: true,
    performanceMonitoring: true,
    timing: 'realistic' as MockTimingProfile
  };
}

/**
 * Create a testing-friendly mock setup
 */
export function createTestMockSetup() {
  return {
    enabled: true,
    defaultScenario: 'testing' as MockScenarioType,
    debug: false,
    performanceMonitoring: false,
    timing: 'fast' as MockTimingProfile
  };
}

/**
 * Create a production-safe mock setup (disabled by default)
 */
export function createProdMockSetup() {
  return {
    enabled: false,
    defaultScenario: 'demo' as MockScenarioType,
    debug: false,
    performanceMonitoring: true,
    timing: 'realistic' as MockTimingProfile
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

export const MOCK_SYSTEM_VERSION = '1.0.0';
export const MOCK_SYSTEM_BUILD = new Date().toISOString();

// Development tools
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
  (window as any).__bitcodeMockSystem = {
    version: MOCK_SYSTEM_VERSION,
    build: MOCK_SYSTEM_BUILD,
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
    
    switchScenario: (scenario: MockScenarioType) => {
      process.env.NEXT_PUBLIC_MOCK_SCENARIO = scenario;
      console.log(`🔄 Switched to scenario: ${scenario}`);
    },
    
    getMetrics: () => MockOrchestrator.getInstance().getPerformanceMetrics(),
    validateSystem: () => MockOrchestrator.getInstance().validateSystem(),
    clearCache: () => MockOrchestrator.getInstance().reset()
  };
  
  console.log(`🚀 Bitcode Mock System v${MOCK_SYSTEM_VERSION} loaded`);
  console.log('Debug tools available at window.__bitcodeMockSystem');
}
