/**
 * Core types for the Bitcode mocking system
 * 
 * This file defines the foundational types that power a state-of-the-art
 * mocking infrastructure designed for enterprise-scale applications.
 * 
 * Features:
 * - Type-safe scenario management
 * - Performance monitoring and validation
 * - Extensible plugin architecture
 * - Real-time streaming simulation
 * - Production-quality reliability
 */

import type {
  CompletionData,
  PipelineExecution,
  Account,
  Repository,
  IssueOrPR,
  RepoFile,
  UrlEntry
} from '@/types/api';
import type { ExecutionState, StreamStatusMessage, LlmCallData } from '@/types/stream';
import type { IntegrationOption } from '@/types/integrations';
import type { Issue } from '@/types/issues';
import type { ShippableTemplates } from '@/types/templates';

// ============================================================================
// Core Mocking Framework Types
// ============================================================================

/**
 * All mockable features in the Bitcode system
 * Each feature can be independently controlled and configured
 */
export type MockableFeature = 
  // ============================================================================
  // CORE PIPELINE FEATURES (Main Business Logic)
  // ============================================================================
  
  // AssetPacks Pipeline (Main Creation Flow)
  | 'ASSET_PACKS'
  | 'ASSET_PACK_RUNS'
  | 'ASSET_PACK_HISTORY' 
  | 'ASSET_PACK_ITEMS'
  | 'ASSET_PACK_INSTRUCTIONS'
  | 'ASSET_PACK_STREAM'
  | 'ASSET_PACK_LOGS'
  | 'ASSET_PACK_RUN_EVENTS'
  
  | 'UPGRADES'
  | 'UPGRADE_RUNS'
  | 'UPGRADE_HISTORY'
  | 'UPGRADE_ITEMS' 
  | 'UPGRADE_INSTRUCTIONS'
  | 'UPGRADE_STREAM'
  | 'UPGRADE_LOGS'
  | 'UPGRADE_RUN_EVENTS'
  
  // ============================================================================
  // CONVERSATIONS (ChatGPT for Engineering - Core Feature)
  // ============================================================================
  
  | 'CONVERSATION_CONVERSATIONS'
  | 'CONVERSATION_MESSAGES'
  | 'CONVERSATION_RUNS'
  | 'CONVERSATION_SOURCES'
  | 'CONVERSATION_REPOS'
  | 'CONVERSATION_ACCOUNT'
  | 'CONVERSATION_STREAM'
  | 'CHAT_STREAM'
  | 'CHAT_COMPLETIONS'
  | 'CONVERSATION_ATTACHMENTS'
  | 'CONVERSATION_RESPONSES'
  
  // ============================================================================
  // USER AUXILLARIES (Onboarding, Profile, Configuration)
  // ============================================================================
  
  // Authentication & Sessions
  | 'AUTH_GITHUB'
  | 'AUTH_CHATGPT'
  | 'AUTH_METAMASK'
  | 'AUTH_SESSIONS'
  | 'AUTH_CALLBACKS'
  | 'AUTH_NEXTAUTH'
  | 'AUTH_UNLINK'
  | 'AUTH_CONFIRM'
  
  // User Profile & Data Management
  | 'USER_PROFILE'
  | 'USER_DATA'
  | 'USER_BTD'
  | 'USER_USAGE'
  | 'USER_TRANSACTIONS'
  | 'USER_API_KEYS'
  | 'USER_PREFERENCES'
  | 'USER_MODEL_PREFERENCES'
  | 'USER_TEMPLATE_PREFERENCES'
  | 'USER_NOTIFICATIONS'
  | 'USER_CONNECTIONS'
  | 'USER_REPOSITORIES'
  | 'USER_DATA_SHARE'
  
  // Onboarding Flow & UX
  | 'ONBOARDING_STEPS'
  | 'ONBOARDING_PROGRESS'
  | 'ONBOARDING_LOCK'
  
  // ============================================================================
  // ORGANIZATION & ENTERPRISE FEATURES
  // ============================================================================
  
  | 'ORGANIZATIONS'
  | 'ORGANIZATION_MEMBERS'
  | 'ORGANIZATION_BTD'
  | 'ORGANIZATION_INVITATIONS'
  | 'TEAM_INVITATIONS'
  | 'TEAM_MEMBERSHIPS'
  | 'INVITATION_ACCEPTANCE'
  | 'BTD_TRANSACTIONS'
  
  // ============================================================================
  // EXTERNAL INTEGRATIONS (Git Providers & Tools)
  // ============================================================================
  
  // GitHub Integration (Primary)
  | 'GITHUB_ACCOUNTS'
  | 'GITHUB_REPOS'
  | 'GITHUB_BRANCHES'
  | 'GITHUB_COMMITS'
  | 'GITHUB_ISSUES'
  | 'GITHUB_FILES'
  | 'GITHUB_CONNECTIONS'
  | 'GITHUB_INTERACTIONS'
  
  // GitLab Integration
  | 'GITLAB_OAUTH'
  | 'GITLAB_CONNECTIONS'
  | 'GITLAB_PROJECTS'
  | 'GITLAB_REPOS'
  | 'GITLAB_CALLBACKS'
  
  // Bitbucket Integration
  | 'BITBUCKET_OAUTH'
  | 'BITBUCKET_CONNECTIONS'
  | 'BITBUCKET_REPOSITORIES'
  | 'BITBUCKET_CALLBACKS'
  
  // Figma Integration
  | 'FIGMA_OAUTH'
  | 'FIGMA_CONNECTIONS'
  | 'FIGMA_PROJECTS'
  | 'FIGMA_TEAMS'
  | 'FIGMA_CALLBACKS'
  
  // Notion Integration
  | 'NOTION_OAUTH'
  | 'NOTION_CONNECTIONS'
  | 'NOTION_WORKSPACES'
  | 'NOTION_PAGES'
  | 'NOTION_CALLBACKS'
  
  // ============================================================================
  // MARKETPLACE (Business Features)
  // ============================================================================
  
  | 'MARKETPLACE_LISTINGS'
  | 'MARKETPLACE_STREAM'
  | 'MARKETPLACE_ORDERS'
  | 'MARKETPLACE_TICKER'
  | 'MARKETPLACE_CATEGORIES'
  | 'MARKETPLACE'
  
  // ============================================================================
  // BTC / $BTD TREASURY SYSTEM
  // ============================================================================
  
  | 'BTC_SETTLEMENTS'
  | 'BTD_ISSUANCES'
  | 'WALLET_OBSERVATIONS'
  | 'BTD_ACQUISITIONS'
  | 'WALLET_CONNECTIONS'
  
  // ============================================================================
  // TEMPLATES & PREFERENCES SYSTEM
  // ============================================================================
  
  | 'ASSET_PACK_TEMPLATES'
  | 'UPGRADE_TEMPLATES'
  | 'TEMPLATE_PREFERENCES'
  | 'TEMPLATE_CATEGORIES'
  | 'TEMPLATES'
  | 'USER_TEMPLATES'
  
  // ============================================================================
  // MCP (Model Context Protocol) TOOLS - Pure API
  // ============================================================================
  
  | 'MCP_AWS'
  | 'MCP_SUPABASE'
  | 'MCP_VERCEL'
  | 'MCP_TOOLS'
  | 'INTEGRATIONS_NOTION'
  | 'INTEGRATIONS_FIGMA'
  | 'INTEGRATIONS_SLACK'
  | 'INTEGRATIONS_GITLAB'
  | 'INTEGRATIONS_BITBUCKET'
  
  // ============================================================================
  // TRIGGERS & API SYSTEMS (Non-Interface)
  // ============================================================================
  
  | 'TRIGGERS'
  | 'WEBHOOKS'
  | 'GENERIC_WEBHOOKS'
  | 'API_ENDPOINTS'
  | 'SCRIPTS'
  | 'PIPELINE_LOGS'
  
  // ============================================================================
  // SYSTEM HEALTH & MONITORING
  // ============================================================================
  
  | 'HEALTH_CHECKS'
  | 'HEALTH_LIVE'
  | 'HEALTH_READY'
  | 'HEALTH_SERVICES'
  | 'SYSTEM_HEALTH'
  | 'ERROR_LOGS'
  | 'CLIENT_ERRORS'
  | 'SYSTEM_NOTIFICATIONS'
  | 'EVENTS'
  | 'FEEDBACK'
  | 'ISSUES'
  | 'ISSUE_EVENTS'
  | 'SECURITY_AUDIT'
  
  // ============================================================================
  // VECTOR & AI INTELLIGENCE
  // ============================================================================
  
  | 'ASSET_PACK_VECTORS'
  | 'UPGRADE_VECTORS'
  | 'USER_VECTORS'
  | 'PATTERN_RECOGNITION'
  | 'VECTOR_SEARCH'
  
  // ============================================================================
  // ADMIN & ANALYTICS (Enterprise Dashboards)
  // ============================================================================
  
  | 'ADMIN_USERS'
  | 'ADMIN_ORGANIZATIONS'
  | 'ADMIN_RUNS'
  | 'ADMIN_ANALYTICS'
  | 'USAGE_ANALYTICS'
  | 'FINANCIAL_ANALYTICS'
  | 'RUN_MONITORING'
  
  // Retained generic areas
  | 'COMPLETION_DATA'
  | 'PROCESSING_STATS'
  | 'REPO_SNAPSHOTS'
  | 'API_RESPONSES'
  | 'ERROR_SCENARIOS'
  | 'PERFORMANCE_METRICS';

/**
 * Mock scenario types for different use cases
 */
export type MockScenarioType = 
  | 'demo'          // Rich, engaging demo data
  | 'testing'       // Minimal, predictable test data
  | 'onboarding'    // New user experience data
  | 'enterprise'    // Enterprise-scale data
  | 'empty'         // Empty state scenarios
  | 'error'         // Error and edge case scenarios
  | 'performance'   // Performance testing data
  | 'realistic'     // Production-like data volumes
  | 'chaos'         // Chaos engineering scenarios
  | 'custom';       // User-defined scenarios

/**
 * Timing profiles for mock responses
 */
export type MockTimingProfile = 
  | 'instant'    // Immediate responses (0ms)
  | 'fast'       // Fast responses (10-100ms)
  | 'realistic'  // Production-like timing (100-2000ms)
  | 'slow'       // Slow responses for testing (2000-5000ms)
  | 'variable'   // Variable timing based on complexity
  | 'custom';    // User-defined timing

/**
 * Mock data complexity levels
 */
export type MockComplexity = 
  | 'minimal'    // Bare minimum data
  | 'moderate'   // Typical data volumes
  | 'complex'    // Rich, interconnected data
  | 'enterprise' // Large-scale enterprise data
  | 'stress';    // Stress-testing data volumes

/**
 * Comprehensive configuration for a mock scenario
 */
export interface MockScenarioConfig {
  /** Unique scenario identifier */
  readonly id: string;
  
  /** Human-readable name */
  readonly name: string;
  
  /** Detailed description of the scenario */
  readonly description: string;
  
  /** Scenario type classification */
  readonly type: MockScenarioType;
  
  /** Data complexity level */
  readonly complexity: MockComplexity;
  
  /** Timing behavior profile */
  readonly timing: MockTimingProfile;
  
  /** Custom timing overrides per feature */
  readonly customTiming?: Partial<Record<MockableFeature, number>>;
  
  /** Feature-specific configuration */
  readonly features: Partial<Record<MockableFeature, MockFeatureConfig>>;
  
  /** Scenario metadata for tooling */
  readonly metadata: {
    /** Version of this scenario */
    readonly version: string;
    
    /** Creation timestamp */
    readonly createdAt: string;
    
    /** Last update timestamp */
    readonly updatedAt: string;
    
    /** Creator/maintainer */
    readonly author: string;
    
    /** Scenario tags for organization */
    readonly tags: readonly string[];
    
    /** Whether this scenario should be realistic */
    readonly realistic: boolean;
    
    /** Expected use cases */
    readonly useCases: readonly string[];
    
    /** Performance expectations */
    readonly performance: {
      readonly expectedMemoryMB: number;
      readonly expectedLatencyMs: number;
      readonly maxDataSizeKB: number;
    };
  };
}

/**
 * Feature-specific mock configuration
 */
export interface MockFeatureConfig {
  /** Whether this feature is enabled in the scenario */
  readonly enabled: boolean;
  
  /** Custom data override for this feature */
  readonly data?: any;
  
  /** Custom timing for this feature */
  readonly timing?: number;
  
  /** Error simulation configuration */
  readonly errors?: MockErrorConfig;
  
  /** Performance characteristics */
  readonly performance?: {
    readonly latencyMs?: number;
    readonly memorySizeKB?: number;
    readonly cpuIntensive?: boolean;
  };
  
  /** Dependencies on other features */
  readonly dependencies?: readonly MockableFeature[];
  
  /** Custom metadata for this feature */
  readonly metadata?: Record<string, any>;
}

/**
 * Error simulation configuration
 */
export interface MockErrorConfig {
  /** Probability of errors (0-1) */
  readonly probability: number;
  
  /** Types of errors to simulate */
  readonly types: readonly MockErrorType[];
  
  /** Custom error messages */
  readonly messages?: readonly string[];
  
  /** Error timing configuration */
  readonly timing?: {
    readonly minDelayMs: number;
    readonly maxDelayMs: number;
  };
}

/**
 * Types of errors that can be simulated
 */
export type MockErrorType = 
  | 'network'        // Network connectivity errors
  | 'timeout'        // Request timeout errors
  | 'auth'           // Authentication/authorization errors
  | 'validation'     // Data validation errors
  | 'server'         // Server-side errors
  | 'rate_limit'     // Rate limiting errors
  | 'maintenance'    // Maintenance mode errors
  | 'permission'     // Permission denied errors
  | 'not_found'      // Resource not found errors
  | 'conflict'       // Resource conflict errors
  | 'custom';        // Custom error scenarios

// ============================================================================
// Mock Data Container Types
// ============================================================================

/**
 * Type-safe container for mock data with validation and metadata
 */
export interface MockDataContainer<T = any> {
  /** The actual mock data */
  readonly data: T;
  
  /** Container metadata */
  readonly metadata: {
    /** Data schema version */
    readonly version: string;
    
    /** Generation timestamp */
    readonly generatedAt: string;
    
    /** Data source/generator */
    readonly source: string;
    
    /** Validation status */
    readonly valid: boolean;
    
    /** Validation errors if any */
    readonly validationErrors?: readonly string[];
    
    /** Data size metrics */
    readonly metrics: {
      readonly sizeBytes: number;
      readonly recordCount: number;
      readonly complexityScore: number;
    };
    
    /** Related scenarios */
    readonly scenarios: readonly string[];
    
    /** Performance characteristics */
    readonly performance: {
      readonly generationTimeMs: number;
      readonly memoryUsageKB: number;
      readonly serializationTimeMs: number;
    };
  };
}

/**
 * Enhanced mock data with streaming capabilities
 */
export interface StreamableMockData<T = any> extends MockDataContainer<T> {
  /** Streaming configuration */
  readonly streaming: {
    /** Whether this data supports streaming */
    readonly supported: boolean;
    
    /** Chunk size for streaming */
    readonly chunkSizeBytes?: number;
    
    /** Streaming delay between chunks */
    readonly chunkDelayMs?: number;
    
    /** Total estimated chunks */
    readonly estimatedChunks?: number;
  };
}

// ============================================================================
// Pipeline Streaming Types
// ============================================================================

/**
 * Mock pipeline event for streaming simulations
 */
export interface MockPipelineEvent {
  /** Event type identifier */
  readonly type: MockPipelineEventType;
  
  /** Event timestamp */
  readonly timestamp: string;
  
  /** Pipeline phase */
  readonly phase: string;
  
  /** Current agent */
  readonly agent?: string;
  
  /** Event payload */
  readonly payload: any;
  
  /** Execution state */
  readonly executionState?: ExecutionState;
  
  /** Performance metrics */
  readonly metrics?: {
    readonly durationMs: number;
    readonly memoryUsageKB: number;
    readonly tokensUsed?: number;
  };
  
  /** Event metadata */
  readonly metadata: {
    readonly correlationId: string;
    readonly runId: string;
    readonly userId: string;
    readonly realistic: boolean;
  };
}

/**
 * Types of pipeline events that can be mocked
 */
export type MockPipelineEventType = 
  | 'status_update'
  | 'thinking'
  | 'generation'
  | 'tool_use'
  | 'completion'
  | 'error'
  | 'phase_start'
  | 'phase_end'
  | 'agent_switch'
  | 'progress_update'
  | 'debug_info'
  | 'performance_metric'
  | 'custom';

/**
 * Mock pipeline stream generator configuration
 */
export interface MockPipelineStreamConfig {
  /** Scenario to simulate */
  readonly scenario: MockScenarioType;
  
  /** Pipeline type */
  readonly pipelineType: 'asset-pack' | 'measure';
  
  /** Total duration of the pipeline */
  readonly totalDurationMs: number;
  
  /** Phases to simulate */
  readonly phases: readonly MockPipelinePhase[];
  
  /** Realistic timing between events */
  readonly realisticTiming: boolean;
  
  /** Error injection configuration */
  readonly errorInjection?: {
    readonly enabled: boolean;
    readonly probability: number;
    readonly phases: readonly string[];
  };
  
  /** Performance simulation */
  readonly performance: {
    readonly simulateLatency: boolean;
    readonly simulateMemoryUsage: boolean;
    readonly simulateTokenUsage: boolean;
  };
}

/**
 * Mock pipeline phase configuration
 */
export interface MockPipelinePhase {
  /** Phase identifier */
  readonly id: string;
  
  /** Phase display name */
  readonly name: string;
  
  /** Estimated duration */
  readonly durationMs: number;
  
  /** Events to generate in this phase */
  readonly events: readonly MockPipelineEventType[];
  
  /** LLM calls in this phase */
  readonly llmCalls: readonly MockLlmCall[];

  /** Stable mirror for mock callers that still read generations. */
  readonly generations?: readonly MockGeneration[];
  
  /** Tool usage in this phase */
  readonly toolUsage: readonly MockToolUsage[];
  
  /** Success probability */
  readonly successProbability: number;
}

/**
 * Mock generation configuration
 */
export interface MockGeneration {
  /** Model identifier */
  readonly model: string;
  
  /** Call purpose */
  readonly purpose: string;
  
  /** Estimated duration */
  readonly durationMs: number;
  
  /** Token usage simulation */
  readonly tokens: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  
  /** Success probability */
  readonly successProbability: number;
  
  /** Mock response */
  readonly response?: string;
}

export type MockLlmCall = MockGeneration;

/**
 * Mock tool usage configuration
 */
export interface MockToolUsage {
  /** Tool identifier */
  readonly tool: string;
  
  /** Tool operation */
  readonly operation: string;
  
  /** Estimated duration */
  readonly durationMs: number;
  
  /** Success probability */
  readonly successProbability: number;
  
  /** Mock result */
  readonly result?: any;
}

// ============================================================================
// Performance and Monitoring Types
// ============================================================================

/**
 * Mock system performance metrics
 */
export interface MockPerformanceMetrics {
  /** Overall system performance */
  readonly system: {
    readonly memoryUsageMB: number;
    readonly cpuUsagePercent: number;
    readonly diskUsageMB: number;
    readonly networkBytesPerSec: number;
  };
  
  /** Mock-specific performance */
  readonly mocking: {
    readonly dataGenerationTimeMs: number;
    readonly serializationTimeMs: number;
    readonly cacheHitRatio: number;
    readonly activeScenarios: number;
    readonly totalMockCalls: number;
  };
  
  /** Feature performance breakdown */
  readonly features: Record<MockableFeature, {
    readonly avgLatencyMs: number;
    readonly callCount: number;
    readonly errorRate: number;
    readonly cacheHitRatio: number;
  }>;
  
  /** Timestamp of metrics collection */
  readonly timestamp: string;
}

/**
 * Mock system validation results
 */
export interface MockValidationResult {
  /** Overall validation status */
  readonly valid: boolean;
  
  /** Validation timestamp */
  readonly timestamp: string;
  
  /** Scenario validation results */
  readonly scenarios: Record<string, {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
  }>;
  
  /** Feature validation results */
  readonly features: Record<MockableFeature, {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly dataIntegrity: boolean;
    readonly typeCompliance: boolean;
  }>;
  
  /** Performance validation */
  readonly performance: {
    readonly memoryWithinLimits: boolean;
    readonly latencyWithinThresholds: boolean;
    readonly errorRateAcceptable: boolean;
  };
  
  /** Recommendations for improvements */
  readonly recommendations: readonly string[];
}

// ============================================================================
// Export all types for type-safe mocking
// ============================================================================

export type {
  // Re-export core types for convenience
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
};
