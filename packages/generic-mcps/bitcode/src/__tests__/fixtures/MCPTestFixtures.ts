/**
 * Bitcode MCP Test Fixtures
 * 
 * Comprehensive test fixtures for MCP testing with customer-focused scenarios,
 * realistic data, and production-like configurations. Built to support the
 * sophisticated testing requirements of Bitcode's MCP server.
 */

import type { 
  MCPTestConfig, 
  MCPAuthContext, 
  RepositoryContext, 
  Attachment,
  PipelineExecutionResult,
  PipelineStreamEvent
} from '../framework/MCPTestFramework';
import { PipelineStatus } from '../../types';

// ============================================================================
// Authentication Context Fixtures
// ============================================================================

/**
 * Standard authentication contexts for different user types
 */
export const AUTH_CONTEXTS = {
  OWNER: {
    userId: 'owner-001',
    organizationId: 'org-001',
    role: 'owner',
    permissions: {
      pipelines: { create: true, read: true, cancel: true, retry: true },
      organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
      resources: { read: true, export: true }
    },
    btdBalance: 10000,
    mcpCredentials: {
      github: { token: 'mock-github-token' },
      aws: { accessKeyId: 'mock-aws-key', secretAccessKey: 'mock-aws-secret' },
      notion: { token: 'mock-notion-token' }
    }
  } as MCPAuthContext,
  
  ADMIN: {
    userId: 'admin-001',
    organizationId: 'org-001',
    role: 'admin',
    permissions: {
      pipelines: { create: true, read: true, cancel: true, retry: true },
      organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: false },
      resources: { read: true, export: true }
    },
    btdBalance: 5000,
    mcpCredentials: {
      github: { token: 'mock-github-token' },
      figma: { token: 'mock-figma-token' }
    }
  } as MCPAuthContext,
  
  DEVELOPER: {
    userId: 'dev-001',
    organizationId: 'org-001',
    role: 'dev',
    permissions: {
      pipelines: { create: true, read: true, cancel: false, retry: false },
      organization: { manageMembers: false, viewAnalytics: false, manageBtdHoldings: false },
      resources: { read: true, export: false }
    },
    btdBalance: 1000,
    mcpCredentials: {
      github: { token: 'mock-github-token' }
    }
  } as MCPAuthContext,
  
  LIMITED_USER: {
    userId: 'limited-001',
    organizationId: 'org-001', 
    role: 'dev',
    permissions: {
      pipelines: { create: false, read: true, cancel: false, retry: false },
      organization: { manageMembers: false, viewAnalytics: false, manageBtdHoldings: false },
      resources: { read: false, export: false }
    },
    btdBalance: 0,
    mcpCredentials: {}
  } as MCPAuthContext
};

// ============================================================================
// Repository Context Fixtures
// ============================================================================

/**
 * Repository contexts for different project types
 */
export const REPOSITORY_CONTEXTS = {
  NEXT_JS_PROJECT: {
    owner: 'bitcode-labs',
    name: 'next-js-ecommerce',
    branch: 'main',
    path: 'src/components',
    connectionId: 12345
  } as RepositoryContext,
  
  REACT_NATIVE_PROJECT: {
    owner: 'bitcode-labs',
    name: 'mobile-app',
    branch: 'develop',
    connectionId: 12346
  } as RepositoryContext,
  
  PYTHON_API_PROJECT: {
    owner: 'bitcode-labs',
    name: 'python-api',
    branch: 'feature/auth-system',
    path: 'src/auth',
    connectionId: 12347
  } as RepositoryContext,
  
  RETIRED_PROJECT: {
    owner: 'bitcode-labs',
    name: 'retired-monolith',
    branch: 'main',
    connectionId: 12348
  } as RepositoryContext
};

// ============================================================================
// Attachment Fixtures
// ============================================================================

/**
 * Multimodal attachment fixtures for testing
 */
export const ATTACHMENTS = {
  FIGMA_DESIGN: {
    type: 'figma',
    content: 'https://www.figma.com/file/ABC123/Design-System',
    metadata: {
      title: 'E-commerce Design System',
      components: ['Button', 'Card', 'Modal'],
      pages: ['Components', 'Patterns', 'Tokens']
    }
  } as Attachment,
  
  SCREENSHOT: {
    type: 'image',
    content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    metadata: {
      width: 1920,
      height: 1080,
      format: 'png'
    }
  } as Attachment,
  
  REQUIREMENTS_DOC: {
    type: 'document',
    content: 'https://docs.google.com/document/d/123456/requirements',
    metadata: {
      title: 'Feature Requirements',
      sections: ['Overview', 'Acceptance Criteria', 'Technical Specs']
    }
  } as Attachment,
  
  USER_STORY_VIDEO: {
    type: 'video',
    content: 'https://www.loom.com/share/abc123',
    metadata: {
      duration: 120,
      format: 'mp4',
      title: 'User Story Walkthrough'
    }
  } as Attachment
};

// ============================================================================
// Pipeline Execution Results Fixtures
// ============================================================================

/**
 * Pipeline execution results for different scenarios
 */
export const PIPELINE_RESULTS = {
  SUCCESSFUL_ASSET_PACK: {
    pipelineId: 'pipeline-001',
    status: PipelineStatus.COMPLETED,
    pipeline: 'asset-pack' as any,
    subtype: 'pull_request',
    task: 'Create user authentication system',
    repository: REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
    startTime: '2023-12-01T10:00:00Z',
    endTime: '2023-12-01T10:15:00Z',
    duration: 900000,
    results: {
      pullRequestUrl: 'https://github.com/bitcode-labs/next-js-ecommerce/pull/123',
      filesModified: 15,
      testsAdded: 8,
      coverageIncrease: 5.2
    },
    assetPacks: [
      {
        type: 'pull_request',
        url: 'https://github.com/bitcode-labs/next-js-ecommerce/pull/123',
        metadata: { title: 'Add user authentication system', commits: 7 }
      },
      {
        type: 'documentation',
        content: '# Authentication System\n\nThis PR implements...',
        metadata: { format: 'markdown', sections: 3 }
      }
    ],
    metrics: {
      measuredBtd: 150,
      tokensProcessed: 25000,
      confidence: 0.92,
      phases: {
        setup: { duration: 120000, success: true, confidence: 0.95 },
        discovery: { duration: 180000, success: true, confidence: 0.89 },
        implementation: { duration: 450000, success: true, confidence: 0.93 },
        testing: { duration: 90000, success: true, confidence: 0.87 },
        delivery: { duration: 60000, success: true, confidence: 0.96 }
      }
    },
    streamUrl: 'wss://stream.bitcode.dev/pipeline/001'
  } as PipelineExecutionResult,
  
  
};

// ============================================================================
// Streaming Event Fixtures
// ============================================================================

/**
 * Pipeline streaming events for testing real-time functionality
 */
export const STREAMING_EVENTS = {
  PHASE_START: {
    type: 'phase',
    timestamp: '2023-12-01T10:00:00Z',
    pipelineId: 'pipeline-001',
    phase: 'setup',
    data: {
      progress: 0,
      message: 'Starting pipeline setup phase',
      metadata: { estimatedDuration: 120000 }
    }
  } as PipelineStreamEvent,
  
  AGENT_EXECUTION: {
    type: 'agent',
    timestamp: '2023-12-01T10:02:00Z',
    pipelineId: 'pipeline-001',
    phase: 'discovery',
    agent: 'code-analysis-agent',
    data: {
      progress: 25,
      message: 'Analyzing codebase structure',
      metadata: { filesAnalyzed: 42 },
      tokensUsed: 1500,
      confidence: 0.87
    }
  } as PipelineStreamEvent,
  
  TOOL_EXECUTION: {
    type: 'tool',
    timestamp: '2023-12-01T10:05:00Z',
    pipelineId: 'pipeline-001',
    phase: 'implementation',
    agent: 'code-generation-agent',
    tool: 'textEditorTool',
    data: {
      progress: 60,
      message: 'Generating authentication middleware',
      metadata: { 
        file: 'src/middleware/auth.ts',
        linesAdded: 125
      },
      tokensUsed: 3200,
      confidence: 0.92
    }
  } as PipelineStreamEvent,
  
  ERROR_EVENT: {
    type: 'error',
    timestamp: '2023-12-01T10:08:00Z',
    pipelineId: 'pipeline-002',
    phase: 'implementation',
    agent: 'upgrade-agent',
    data: {
      progress: 45,
      message: 'Dependency conflict detected',
      error: {
        message: 'React Native navigation incompatible with React 18',
        recoverable: true
      }
    }
  } as PipelineStreamEvent,
  
  COMPLETION_EVENT: {
    type: 'completion',
    timestamp: '2023-12-01T10:15:00Z',
    pipelineId: 'pipeline-001',
    data: {
      progress: 100,
      message: 'Pipeline completed successfully',
      metadata: {
        totalDuration: 900000,
        measuredBtd: 150,
        assetPacks: 2
      },
      confidence: 0.92
    }
  } as PipelineStreamEvent
};

// ============================================================================
// Customer Scenario Fixtures
// ============================================================================

/**
 * Customer-focused test scenarios representing real-world usage
 */
export const CUSTOMER_SCENARIOS = {
  STARTUP_DEVELOPER: {
    name: 'Startup Developer Building MVP',
    description: 'A solo developer building an MVP for their startup',
    userContext: AUTH_CONTEXTS.DEVELOPER,
    inputs: {
      task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
      repository: REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
      attachments: [ATTACHMENTS.FIGMA_DESIGN, ATTACHMENTS.REQUIREMENTS_DOC],
      mcpConfig: {
        github: { appId: 'mock-github-app-id' },
        wallet: { provider: 'mock-metamask', network: 'bitcoin-testnet' },
        supabase: { url: 'mock-supabase-url', anonKey: 'mock-anon-key' }
      }
    },
    expectedOutcome: 'success',
    businessValue: 'Accelerate time-to-market by 80% with production-ready code'
  },
  
  ENTERPRISE_TEAM_LEAD: {
    name: 'Enterprise Team Lead Upgrading Retired System',
    description: 'A team lead upgrading a retired monolith to modern architecture',
    userContext: AUTH_CONTEXTS.ADMIN,
    inputs: {
      task: 'Migrate authentication system from custom JWT to OAuth 2.0 with PKCE',
      repository: REPOSITORY_CONTEXTS.RETIRED_PROJECT,
      attachments: [ATTACHMENTS.SCREENSHOT, ATTACHMENTS.REQUIREMENTS_DOC],
      mcpConfig: {
        auth0: { domain: 'mock.auth0.com', clientId: 'mock-client-id' },
        aws: { region: 'us-east-1', lambdaRole: 'mock-lambda-role' }
      }
    },
    expectedOutcome: 'success',
    businessValue: 'Reduce security vulnerabilities by 90% while maintaining compatibility'
  },
  
  MOBILE_DEVELOPER: {
    name: 'Mobile Developer Adding New Feature',
    description: 'A mobile developer adding a complex feature to React Native app',
    userContext: AUTH_CONTEXTS.DEVELOPER,
    inputs: {
      task: 'Implement offline-first real-time chat with push notifications',
      repository: REPOSITORY_CONTEXTS.REACT_NATIVE_PROJECT,
      attachments: [ATTACHMENTS.USER_STORY_VIDEO, ATTACHMENTS.FIGMA_DESIGN],
      mcpConfig: {
        firebase: { projectId: 'mock-firebase-project' },
        pusher: { appId: 'mock-pusher-app' }
      }
    },
    expectedOutcome: 'success',
    businessValue: 'Deliver complex mobile features 3x faster with native performance'
  },
  
  FREELANCER_LIMITED_BTD: {
    name: 'Freelancer with Limited $BTD',
    description: 'A freelancer with limited $BTD trying to complete a project',
    userContext: AUTH_CONTEXTS.LIMITED_USER,
    inputs: {
      task: 'Build a complete landing page with contact form and animations',
      repository: REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
      attachments: [ATTACHMENTS.FIGMA_DESIGN],
      mcpConfig: {
        emailjs: { serviceId: 'mock-email-service' }
      }
    },
    expectedOutcome: 'partial',
    businessValue: 'Enable cost-effective development for budget-conscious users'
  },
  
  SECURITY_AUDIT_SCENARIO: {
    name: 'Security Team Conducting Code Audit',
    description: 'Security team using MCP for comprehensive security analysis',
    userContext: AUTH_CONTEXTS.OWNER,
    inputs: {
      task: 'Conduct comprehensive security audit and generate remediation plan',
      repository: REPOSITORY_CONTEXTS.PYTHON_API_PROJECT,
      attachments: [ATTACHMENTS.REQUIREMENTS_DOC],
      mcpConfig: {
        snyk: { token: 'mock-snyk-token' },
        sonarcloud: { token: 'mock-sonar-token' }
      }
    },
    expectedOutcome: 'success',
    businessValue: 'Identify and fix 95% of security vulnerabilities automatically'
  }
};

// ============================================================================
// MCP Configuration Fixtures
// ============================================================================

/**
 * MCP server configuration fixtures for different testing scenarios
 */
export const MCP_CONFIGURATIONS = {
  FULL_FEATURED: {
    name: 'bitcode-market-infrastructure-full',
    version: '1.0.0',
    capabilities: {
      tools: true,
      resources: true,
      prompts: true,
      streaming: true
    },
    authentication: {
      required: true,
      methods: ['api_key', 'session']
    },
    dryRun: false
  },
  
  TOOLS_ONLY: {
    name: 'bitcode-market-infrastructure-tools',
    version: '1.0.0',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
      streaming: false
    },
    authentication: {
      required: true,
      methods: ['api_key']
    },
    dryRun: false
  },
  
  DEVELOPMENT: {
    name: 'bitcode-market-infrastructure-dev',
    version: '1.0.0-dev',
    capabilities: {
      tools: true,
      resources: true,
      prompts: true,
      streaming: true
    },
    authentication: {
      required: false,
      methods: []
    },
    dryRun: true
  },
  
  PERFORMANCE_TEST: {
    name: 'bitcode-market-infrastructure-perf',
    version: '1.0.0',
    capabilities: {
      tools: true,
      resources: true,
      prompts: true,
      streaming: true
    },
    authentication: {
      required: true,
      methods: ['api_key']
    },
    dryRun: false
  }
};

// ============================================================================
// Mock Data Fixtures
// ============================================================================

/**
 * Mock data for external services and APIs
 */
export const MOCK_DATA = {
  GITHUB_REPOS: [
    {
      id: 123456,
      name: 'next-js-ecommerce',
      full_name: 'bitcode-labs/next-js-ecommerce',
      owner: { login: 'bitcode-labs' },
      private: false,
      default_branch: 'main',
      language: 'TypeScript',
      stargazers_count: 245,
      forks_count: 32
    },
    {
      id: 123457,
      name: 'mobile-app',
      full_name: 'bitcode-labs/mobile-app',
      owner: { login: 'bitcode-labs' },
      private: true,
      default_branch: 'develop',
      language: 'TypeScript',
      stargazers_count: 15,
      forks_count: 3
    }
  ],
  
  FIGMA_DESIGNS: [
    {
      key: 'ABC123',
      name: 'E-commerce Design System',
      thumbnail_url: 'https://www.figma.com/thumb/ABC123',
      last_modified: '2023-11-15T10:30:00Z',
      components: [
        { id: 'btn-001', name: 'Primary Button', type: 'COMPONENT' },
        { id: 'card-001', name: 'Product Card', type: 'COMPONENT' },
        { id: 'modal-001', name: 'Checkout Modal', type: 'COMPONENT' }
      ]
    }
  ],
  
  SUPABASE_RESPONSES: {
    pipelines: {
      data: [
        {
          id: 'pipeline-001',
          user_id: 'owner-001',
          status: 'completed',
          created_at: '2023-12-01T10:00:00Z',
          updated_at: '2023-12-01T10:15:00Z',
          type: 'asset-pack',
          repository: 'bitcode-labs/next-js-ecommerce'
        }
      ],
      error: null
    },
    
    organizations: {
      data: [
        {
          id: 'org-001',
          name: 'Bitcode Labs',
          subscription_tier: 'enterprise',
          btd_holding_amount: 50000,
          created_at: '2023-01-01T00:00:00Z'
        }
      ],
      error: null
    }
  },
  
  OPENAI_RESPONSES: {
    'gpt-4': {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652288,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'I\'ll help you implement the authentication system...'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 500,
        total_tokens: 650
      }
    }
  }
};

// ============================================================================
// Complete Test Configuration Templates
// ============================================================================

/**
 * Complete test configuration templates for different testing scenarios
 */
export const TEST_CONFIGURATIONS = {
  COMPREHENSIVE_INTEGRATION: {
    testName: 'Comprehensive MCP Integration Test',
    description: 'Full integration test covering all MCP capabilities with customer scenarios',
    category: 'integration',
    mcpConfig: MCP_CONFIGURATIONS.FULL_FEATURED,
    execution: {
      timeout: 300000, // 5 minutes
      retries: 3,
      parallel: false,
      streaming: true,
      metrics: true
    },
    mocks: {
      auth: AUTH_CONTEXTS.OWNER,
      tools: MOCK_DATA.GITHUB_REPOS,
      resources: MOCK_DATA.SUPABASE_RESPONSES,
      prompts: {},
      external: {
        '@octokit/rest': { Octokit: jest.fn() },
        'openai': { OpenAI: jest.fn() },
        'figma-api': { Api: jest.fn() }
      }
    },
    validation: {
      performance: {
        maxDuration: 180000,
        maxMemory: 512,
        maxCPU: 80
      },
      security: {
        validateAuth: true,
        validatePermissions: true,
        validateInputSanitization: true
      }
    },
    customerScenarios: [
      CUSTOMER_SCENARIOS.STARTUP_DEVELOPER,
      CUSTOMER_SCENARIOS.ENTERPRISE_TEAM_LEAD,
      CUSTOMER_SCENARIOS.MOBILE_DEVELOPER
    ]
  } as MCPTestConfig,
  
  PERFORMANCE_STRESS_TEST: {
    testName: 'MCP Performance Stress Test',
    description: 'High-load performance testing with concurrent requests',
    category: 'performance',
    mcpConfig: MCP_CONFIGURATIONS.PERFORMANCE_TEST,
    execution: {
      timeout: 600000, // 10 minutes
      retries: 1,
      parallel: true,
      streaming: true,
      metrics: true
    },
    mocks: {
      auth: AUTH_CONTEXTS.OWNER,
      tools: {},
      resources: {},
      prompts: {},
      external: {}
    },
    validation: {
      performance: {
        maxDuration: 5000, // 5 seconds per request
        maxMemory: 1024,
        maxCPU: 90
      },
      security: {
        validateAuth: true,
        validatePermissions: true,
        validateInputSanitization: true
      }
    },
    customerScenarios: [
      CUSTOMER_SCENARIOS.STARTUP_DEVELOPER
    ]
  } as MCPTestConfig,
  
  SECURITY_AUDIT_TEST: {
    testName: 'MCP Security Audit Test',
    description: 'Comprehensive security testing with attack scenarios',
    category: 'security',
    mcpConfig: MCP_CONFIGURATIONS.FULL_FEATURED,
    execution: {
      timeout: 300000,
      retries: 1,
      parallel: false,
      streaming: false,
      metrics: true
    },
    mocks: {
      auth: AUTH_CONTEXTS.LIMITED_USER,
      tools: {},
      resources: {},
      prompts: {},
      external: {}
    },
    validation: {
      performance: {
        maxDuration: 60000,
        maxMemory: 256,
        maxCPU: 50
      },
      security: {
        validateAuth: true,
        validatePermissions: true,
        validateInputSanitization: true
      }
    },
    customerScenarios: [
      CUSTOMER_SCENARIOS.SECURITY_AUDIT_SCENARIO,
      CUSTOMER_SCENARIOS.FREELANCER_LIMITED_BTD
    ]
  } as MCPTestConfig
};

// ============================================================================
// Exports
// ============================================================================

export {
  AUTH_CONTEXTS,
  REPOSITORY_CONTEXTS,
  ATTACHMENTS,
  PIPELINE_RESULTS,
  STREAMING_EVENTS,
  CUSTOMER_SCENARIOS,
  MCP_CONFIGURATIONS,
  MOCK_DATA,
  TEST_CONFIGURATIONS
};
