/**
 * Specialized Mock Middleware - Area-Specific Mock Integration
 * 
 * Provides specialized middleware functions for each major area of the Bitcode system:
 * - User Auxillaries (onboarding, auth, profile)
 * - Conversations (ChatGPT-style Bitcode usage)
 * - AssetPacks/Evidence Documents (main pipelines)
 * - Organizations (enterprise features)
 * - Integrations (GitHub, GitLab, etc.)
 * - Marketplace (business features)
 * - MCP Tools (pure APIs)
 * - System Health (monitoring)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { MockableFeature, MockScenarioType } from '../types/core';
import { MockOrchestrator } from '../core/MockOrchestrator';
import { comprehensiveMockGenerator } from '../generators/ComprehensiveMockDataGenerators';

/**
 * Configuration for specialized middleware
 */
interface SpecializedMiddlewareConfig {
  readonly feature: MockableFeature;
  readonly scenario?: MockScenarioType;
  readonly timing?: 'instant' | 'fast' | 'realistic' | 'slow';
  readonly streamingSupported?: boolean;
  readonly errorInjection?: {
    readonly enabled: boolean;
    readonly probability: number;
    readonly types: string[];
  };
  readonly performanceTracking?: boolean;
  readonly cacheControl?: {
    readonly enabled: boolean;
    readonly ttlSeconds: number;
  };
}

/**
 * Base middleware factory for creating feature-specific mock middleware
 */
function createSpecializedMiddleware(config: SpecializedMiddlewareConfig) {
  return function (originalHandler: (request: NextRequest) => Promise<NextResponse>) {
    return async function mockMiddleware(request: NextRequest): Promise<NextResponse> {
      const orchestrator = MockOrchestrator.getInstance();
      
      // Check if mocking is enabled for this feature
      if (!orchestrator.shouldMock(config.feature)) {
        return originalHandler(request);
      }

      const scenario = config.scenario || orchestrator.getScenario(config.feature) || 'demo';
      
      try {
        // Apply timing simulation
        if (config.timing && config.timing !== 'instant') {
          const delays = { fast: 50, realistic: 200, slow: 1000 };
          await new Promise(resolve => setTimeout(resolve, delays[config.timing!]));
        }

        // Check for error injection
        if (config.errorInjection?.enabled && Math.random() < config.errorInjection.probability) {
          const errorType = config.errorInjection.types[0] || 'server';
          return NextResponse.json(
            { error: `Mock ${errorType} error for ${config.feature}`, code: 'MOCK_ERROR' },
            { status: errorType === 'timeout' ? 408 : 500 }
          );
        }

        // Generate mock data
        const mockData = await comprehensiveMockGenerator.generateMockData(
          config.feature,
          scenario,
          'moderate'
        );

        // Handle streaming responses
        if (config.streamingSupported && isStreamingRequest(request)) {
          return createStreamingMockResponse(mockData.data, config.feature);
        }

        // Return regular JSON response
        const response = NextResponse.json(mockData.data);
        
        // Add performance tracking headers
        if (config.performanceTracking) {
          response.headers.set('X-Mock-Feature', config.feature);
          response.headers.set('X-Mock-Scenario', scenario);
          response.headers.set('X-Mock-Generation-Time', `${mockData.metadata.performance.generationTimeMs}ms`);
        }

        // Add cache control headers
        if (config.cacheControl?.enabled) {
          response.headers.set('Cache-Control', `max-age=${config.cacheControl.ttlSeconds}`);
        }

        return response;

      } catch (error) {
        console.error(`Mock middleware error for ${config.feature}:`, error);
        // Fallback to original handler on mock errors
        return originalHandler(request);
      }
    };
  };
}

// ============================================================================
// USER AUXILLIARIES MIDDLEWARE (Onboarding, Auth, Profile)
// ============================================================================

/**
 * Authentication-related middleware
 */
export const mockAuth = {
  github: () => createSpecializedMiddleware({
    feature: 'AUTH_GITHUB',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  chatgpt: () => createSpecializedMiddleware({
    feature: 'AUTH_CHATGPT',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  metamask: () => createSpecializedMiddleware({
    feature: 'AUTH_METAMASK',
    timing: 'fast',
    performanceTracking: true
  }),
  
  sessions: () => createSpecializedMiddleware({
    feature: 'AUTH_SESSIONS',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),

  nextauth: () => createSpecializedMiddleware({
    feature: 'AUTH_NEXTAUTH',
    timing: 'realistic',
    performanceTracking: true
  })
};

/**
 * User profile and data middleware
 */
export const mockUser = {
  profile: () => createSpecializedMiddleware({
    feature: 'USER_PROFILE',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  }),
  
  btd: () => createSpecializedMiddleware({
    feature: 'USER_BTD',
    timing: 'fast',
    performanceTracking: true
  }),
  
  usage: () => createSpecializedMiddleware({
    feature: 'USER_USAGE',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  transactions: () => createSpecializedMiddleware({
    feature: 'USER_TRANSACTIONS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  apiKeys: () => createSpecializedMiddleware({
    feature: 'USER_API_KEYS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  notifications: () => createSpecializedMiddleware({
    feature: 'USER_NOTIFICATIONS',
    timing: 'fast',
    streamingSupported: true
  }),
  
  connections: () => createSpecializedMiddleware({
    feature: 'USER_CONNECTIONS',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  preferences: () => createSpecializedMiddleware({
    feature: 'USER_PREFERENCES',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  })
};

/**
 * Onboarding flow middleware
 */
export const mockOnboarding = {
  steps: () => createSpecializedMiddleware({
    feature: 'ONBOARDING_STEPS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  progress: () => createSpecializedMiddleware({
    feature: 'ONBOARDING_PROGRESS',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 60 }
  }),
  
  lock: () => createSpecializedMiddleware({
    feature: 'ONBOARDING_LOCK',
    timing: 'instant',
    performanceTracking: true
  })
};

// ============================================================================
// CONVERSATIONS (ChatGPT for Engineering) MIDDLEWARE
// ============================================================================

/**
 * Conversations chat and conversation middleware
 */
export const mockConversation = {
  conversations: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_CONVERSATIONS',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  messages: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_MESSAGES',
    timing: 'fast',
    streamingSupported: true
  }),
  
  runs: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_RUNS',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  }),
  
  sources: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_SOURCES',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  repos: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_REPOS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  }),
  
  account: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_ACCOUNT',
    timing: 'fast',
    performanceTracking: true
  }),
  
  stream: () => createSpecializedMiddleware({
    feature: 'CONVERSATION_STREAM',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  })
};

/**
 * Chat streaming middleware with realistic AI response simulation
 */
export const mockChat = {
  stream: () => createSpecializedMiddleware({
    feature: 'CHAT_STREAM',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true,
    errorInjection: {
      enabled: false,
      probability: 0.01,
      types: ['timeout', 'rate_limit']
    }
  }),
  
  completions: () => createSpecializedMiddleware({
    feature: 'CHAT_COMPLETIONS',
    timing: 'realistic',
    performanceTracking: true
  })
};

// ============================================================================
// ASSETPACK & SHIPPABLE PIPELINE MIDDLEWARE
// ============================================================================

/**
 * AssetPack pipeline middleware with optional Shippable delivery flow
 */
export const mockAssetPacks = {
  main: () => createSpecializedMiddleware({
    feature: 'ASSET_PACKS',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true,
    errorInjection: {
      enabled: false,
      probability: 0.02,
      types: ['timeout', 'server']
    }
  }),
  
  runs: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_RUNS',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  }),
  
  history: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_HISTORY',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  items: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_ITEMS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  instructions: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_INSTRUCTIONS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  stream: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_STREAM',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  }),
  
  logs: () => createSpecializedMiddleware({
    feature: 'ASSET_PACK_LOGS',
    timing: 'fast',
    streamingSupported: true,
    performanceTracking: true
  })
};

// Evidence Document pipeline removed - not V26

// ============================================================================
// ORGANIZATION & ENTERPRISE MIDDLEWARE
// ============================================================================

/**
 * Organization management middleware
 */
export const mockOrganizations = {
  main: () => createSpecializedMiddleware({
    feature: 'ORGANIZATIONS',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  }),
  
  members: () => createSpecializedMiddleware({
    feature: 'ORGANIZATION_MEMBERS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  btd: () => createSpecializedMiddleware({
    feature: 'ORGANIZATION_BTD',
    timing: 'fast',
    performanceTracking: true
  }),
  
  invitations: () => createSpecializedMiddleware({
    feature: 'ORGANIZATION_INVITATIONS',
    timing: 'realistic',
    performanceTracking: true
  })
};

// ============================================================================
// EXTERNAL INTEGRATIONS MIDDLEWARE
// ============================================================================

/**
 * GitHub integration middleware (primary git provider)
 */
export const mockGitHub = {
  accounts: () => createSpecializedMiddleware({
    feature: 'GITHUB_ACCOUNTS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  }),
  
  repos: () => createSpecializedMiddleware({
    feature: 'GITHUB_REPOS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  branches: () => createSpecializedMiddleware({
    feature: 'GITHUB_BRANCHES',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  commits: () => createSpecializedMiddleware({
    feature: 'GITHUB_COMMITS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  issues: () => createSpecializedMiddleware({
    feature: 'GITHUB_ISSUES',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  files: () => createSpecializedMiddleware({
    feature: 'GITHUB_FILES',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 600 }
  }),
  
  connections: () => createSpecializedMiddleware({
    feature: 'GITHUB_CONNECTIONS',
    timing: 'fast',
    performanceTracking: true
  })
};

/**
 * GitLab integration middleware
 */
export const mockGitLab = {
  oauth: () => createSpecializedMiddleware({
    feature: 'GITLAB_OAUTH',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  connections: () => createSpecializedMiddleware({
    feature: 'GITLAB_CONNECTIONS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  projects: () => createSpecializedMiddleware({
    feature: 'GITLAB_PROJECTS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  })
};

/**
 * Multi-integration middleware for different git providers
 */
export const mockIntegrations = {
  bitbucket: {
    oauth: () => createSpecializedMiddleware({ feature: 'BITBUCKET_OAUTH', timing: 'realistic' }),
    connections: () => createSpecializedMiddleware({ feature: 'BITBUCKET_CONNECTIONS', timing: 'fast' }),
    repositories: () => createSpecializedMiddleware({ feature: 'BITBUCKET_REPOSITORIES', timing: 'realistic' })
  },
  
  figma: {
    oauth: () => createSpecializedMiddleware({ feature: 'FIGMA_OAUTH', timing: 'realistic' }),
    connections: () => createSpecializedMiddleware({ feature: 'FIGMA_CONNECTIONS', timing: 'fast' }),
    projects: () => createSpecializedMiddleware({ feature: 'FIGMA_PROJECTS', timing: 'realistic' }),
    teams: () => createSpecializedMiddleware({ feature: 'FIGMA_TEAMS', timing: 'realistic' })
  },
  
  notion: {
    oauth: () => createSpecializedMiddleware({ feature: 'NOTION_OAUTH', timing: 'realistic' }),
    connections: () => createSpecializedMiddleware({ feature: 'NOTION_CONNECTIONS', timing: 'fast' }),
    workspaces: () => createSpecializedMiddleware({ feature: 'NOTION_WORKSPACES', timing: 'realistic' }),
    pages: () => createSpecializedMiddleware({ feature: 'NOTION_PAGES', timing: 'realistic' })
  }
};

// ============================================================================
// MARKETPLACE MIDDLEWARE
// ============================================================================

/**
 * Marketplace business features middleware
 */
export const mockMarketplace = {
  listings: () => createSpecializedMiddleware({
    feature: 'MARKETPLACE_LISTINGS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  }),
  
  stream: () => createSpecializedMiddleware({
    feature: 'MARKETPLACE_STREAM',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  }),
  
  orders: () => createSpecializedMiddleware({
    feature: 'MARKETPLACE_ORDERS',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  ticker: () => createSpecializedMiddleware({
    feature: 'MARKETPLACE_TICKER',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 60 }
  })
};

// ============================================================================
// BTC / $BTD TREASURY MIDDLEWARE
// ============================================================================

/**
 * Treasury and wallet system middleware
 */
export const mockPayments = {
  treasury: {
    settlements: () => createSpecializedMiddleware({
      feature: 'BTC_SETTLEMENTS',
      timing: 'realistic',
      performanceTracking: true
    }),
    
    issuances: () => createSpecializedMiddleware({
      feature: 'BTD_ISSUANCES',
      timing: 'realistic',
      performanceTracking: true
    }),
    
    observations: () => createSpecializedMiddleware({
      feature: 'WALLET_OBSERVATIONS',
      timing: 'fast',
      performanceTracking: true
    })
  },
  
  acquisitions: () => createSpecializedMiddleware({
    feature: 'BTD_ACQUISITIONS',
    timing: 'realistic',
    performanceTracking: true
  }),

  wallets: () => createSpecializedMiddleware({
    feature: 'WALLET_CONNECTIONS',
    timing: 'realistic',
    performanceTracking: true
  })
};

// ============================================================================
// MCP TOOLS MIDDLEWARE (Pure API)
// ============================================================================

/**
 * MCP (Model Context Protocol) tools middleware
 */
export const mockMCP = {
  aws: () => createSpecializedMiddleware({
    feature: 'MCP_AWS',
    timing: 'realistic',
    performanceTracking: true,
    errorInjection: {
      enabled: true,
      probability: 0.05,
      types: ['timeout', 'auth']
    }
  }),
  
  supabase: () => createSpecializedMiddleware({
    feature: 'MCP_SUPABASE',
    timing: 'fast',
    performanceTracking: true
  }),
  
  vercel: () => createSpecializedMiddleware({
    feature: 'MCP_VERCEL',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  tools: () => createSpecializedMiddleware({
    feature: 'MCP_TOOLS',
    timing: 'fast',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  })
};

// ============================================================================
// SYSTEM HEALTH & MONITORING MIDDLEWARE
// ============================================================================

/**
 * System health and monitoring middleware
 */
export const mockHealth = {
  checks: () => createSpecializedMiddleware({
    feature: 'HEALTH_CHECKS',
    timing: 'fast',
    performanceTracking: true
  }),
  
  live: () => createSpecializedMiddleware({
    feature: 'HEALTH_LIVE',
    timing: 'instant',
    performanceTracking: true
  }),
  
  ready: () => createSpecializedMiddleware({
    feature: 'HEALTH_READY',
    timing: 'fast',
    performanceTracking: true
  }),
  
  services: () => createSpecializedMiddleware({
    feature: 'HEALTH_SERVICES',
    timing: 'realistic',
    performanceTracking: true
  })
};

/**
 * Admin and analytics middleware
 */
export const mockAdmin = {
  users: () => createSpecializedMiddleware({
    feature: 'ADMIN_USERS',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  organizations: () => createSpecializedMiddleware({
    feature: 'ADMIN_ORGANIZATIONS',
    timing: 'realistic',
    performanceTracking: true
  }),
  
  runs: () => createSpecializedMiddleware({
    feature: 'ADMIN_RUNS',
    timing: 'realistic',
    streamingSupported: true,
    performanceTracking: true
  }),
  
  analytics: () => createSpecializedMiddleware({
    feature: 'ADMIN_ANALYTICS',
    timing: 'realistic',
    cacheControl: { enabled: true, ttlSeconds: 300 }
  })
};

// ============================================================================
// CONVENIENCE MIDDLEWARE
// ============================================================================

/**
 * Convenience middleware shortcuts for common mock areas.
 */
export const mockConvenience = {
  assetPacks: () => mockAssetPacks.main(),
  github: (type: 'repos' | 'issues' | 'accounts' = 'repos') => mockGitHub[type](),
  userData: (type: 'profile' | 'btd' | 'usage' = 'profile') => mockUser[type]()
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if the request expects a streaming response
 */
function isStreamingRequest(request: NextRequest): boolean {
  const acceptHeader = request.headers.get('accept') || '';
  const contentType = request.headers.get('content-type') || '';
  
  return acceptHeader.includes('text/event-stream') ||
         acceptHeader.includes('application/stream+json') ||
         contentType.includes('stream') ||
         request.url.includes('/stream');
}

/**
 * Create a streaming response for mock data
 */
function createStreamingMockResponse(data: any, feature: MockableFeature): NextResponse {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Simulate realistic streaming behavior
      const events = Array.isArray(data) ? data : [data];
      let index = 0;
      
      const sendEvent = () => {
        if (index < events.length) {
          const event = {
            type: 'data',
            data: events[index],
            feature,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          index++;
          
          // Simulate realistic delay between events
          setTimeout(sendEvent, 100 + Math.random() * 200);
        } else {
          // Send completion event
          const completion = {
            type: 'complete',
            feature,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`));
          controller.close();
        }
      };
      
      sendEvent();
    }
  });
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Mock-Feature': feature
    }
  });
}

/**
 * High-level area middleware for convenience
 */
export const mockAreas = {
  auxillaries: { auth: mockAuth, user: mockUser, onboarding: mockOnboarding },
  orbital: { auth: mockAuth, user: mockUser, onboarding: mockOnboarding },
  conversation: { chat: mockChat, ...mockConversation },
  pipelines: { assetPacks: mockAssetPacks },
  organizations: mockOrganizations,
  integrations: { github: mockGitHub, gitlab: mockGitLab, ...mockIntegrations },
  marketplace: mockMarketplace,
  payments: mockPayments,
  mcp: mockMCP,
  system: { health: mockHealth, admin: mockAdmin }
};

// Export everything for comprehensive access
export {
  mockAuth,
  mockUser,
  mockOnboarding,
  mockConversation,
  mockChat,
  mockAssetPacks,
  mockOrganizations,
  mockGitHub,
  mockGitLab,
  mockIntegrations,
  mockMarketplace,
  mockPayments,
  mockMCP,
  mockHealth,
  mockAdmin,
  mockConvenience,
  createSpecializedMiddleware
};
