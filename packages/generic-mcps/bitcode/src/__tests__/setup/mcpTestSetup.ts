/**
 * MCP Test Setup
 * 
 * Comprehensive test setup for Bitcode MCP server testing with advanced mocking,
 * dry run configuration, and performance monitoring.
 */

import { jest } from '@jest/globals';
import '@jest/globals';

// ============================================================================
// Environment Configuration
// ============================================================================

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DRY_RUN_MODE = 'true';
process.env.MCP_TEST_MODE = 'true';
process.env.LOG_LEVEL = 'debug';

// Provide default API keys for third-party SDKs (mock values)
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-github-token';
process.env.FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'test-figma-token';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-supabase-anon-key';

// ============================================================================
// Global Mocks - Core Infrastructure
// ============================================================================

// Mock Bitcode logger
jest.mock('@bitcode/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn()
  },
  log: jest.fn()
}));

// Mock Bitcode observability
jest.mock('@bitcode/observability', () => ({
  observability: {
    init: jest.fn().mockResolvedValue(undefined),
    recordMetric: jest.fn(),
    recordError: jest.fn(),
    startTrace: jest.fn().mockReturnValue({ id: 'test-trace' }),
    endTrace: jest.fn(),
    createSpan: jest.fn().mockReturnValue({ 
      setTag: jest.fn(),
      setStatus: jest.fn(),
      finish: jest.fn()
    })
  }
}));

// ============================================================================
// Global Mocks - MCP SDK
// ============================================================================

// Mock MCP Server SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation((serverInfo, capabilities) => ({
    serverInfo,
    capabilities,
    setRequestHandler: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    onerror: null,
    // Mock request handlers
    handlers: new Map(),
    // Add handler tracking for testing
    _testGetHandlers: function() { return this.handlers; }
  }))
}));

// Mock MCP Transport
jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    onmessage: null,
    onclose: null,
    onerror: null
  }))
}));

// Mock MCP Types and Schemas
jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: { parse: jest.fn() },
  ListResourcesRequestSchema: { parse: jest.fn() },
  ListResourceTemplatesRequestSchema: { parse: jest.fn() },
  ReadResourceRequestSchema: { parse: jest.fn() },
  ListPromptsRequestSchema: { parse: jest.fn() },
  GetPromptRequestSchema: { parse: jest.fn() },
  ListToolsRequestSchema: { parse: jest.fn() },
  // Add schema validation mocks
  McpError: class McpError extends Error {
    constructor(code: string, message: string) {
      super(message);
      this.name = 'McpError';
    }
  }
}));

// ============================================================================
// Global Mocks - External APIs
// ============================================================================

// Mock GitHub API (Octokit)
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      get: jest.fn().mockResolvedValue({
        data: {
          id: 123456,
          name: 'test-repo',
          full_name: 'test-org/test-repo',
          owner: { login: 'test-org' },
          private: false,
          default_branch: 'main',
          language: 'TypeScript'
        }
      }),
      listForOrg: jest.fn().mockResolvedValue({
        data: [
          {
            id: 123456,
            name: 'test-repo',
            full_name: 'test-org/test-repo',
            owner: { login: 'test-org' }
          }
        ]
      }),
      getContent: jest.fn().mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from('test content').toString('base64'),
          encoding: 'base64'
        }
      }),
      createOrUpdateFileContents: jest.fn().mockResolvedValue({
        data: {
          commit: { sha: 'abc123' }
        }
      })
    },
    pulls: {
      create: jest.fn().mockResolvedValue({
        data: {
          number: 123,
          html_url: 'https://github.com/test-org/test-repo/pull/123',
          state: 'open'
        }
      }),
      get: jest.fn().mockResolvedValue({
        data: {
          number: 123,
          state: 'open',
          mergeable: true
        }
      })
    },
    issues: {
      create: jest.fn().mockResolvedValue({
        data: {
          number: 456,
          html_url: 'https://github.com/test-org/test-repo/issues/456'
        }
      })
    }
  }))
}));

// Mock OpenAI API
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          id: 'chatcmpl-test',
          object: 'chat.completion',
          created: Date.now(),
          model: 'gpt-4',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'Mock AI response for testing'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        })
      }
    },
    completions: {
      create: jest.fn().mockResolvedValue({
        id: 'cmpl-test',
        object: 'text_completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo-instruct',
        choices: [{
          text: 'Mock completion response',
          index: 0,
          finish_reason: 'stop'
        }]
      })
    }
  }))
}));

// Mock Figma API
jest.mock('figma-api', () => ({
  Api: jest.fn().mockImplementation(() => ({
    getFile: jest.fn().mockResolvedValue({
      data: {
        name: 'Test Design',
        lastModified: new Date().toISOString(),
        thumbnailUrl: 'https://figma.com/thumb/test',
        document: {
          id: 'test-doc',
          name: 'Test Document',
          type: 'DOCUMENT'
        }
      }
    }),
    getFileComponents: jest.fn().mockResolvedValue({
      data: {
        meta: {
          components: [
            {
              key: 'test-component',
              name: 'Test Component',
              description: 'A test component'
            }
          ]
        }
      }
    })
  }))
}), { virtual: true });

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const createClient = jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: [],
          error: null
        }),
        gte: jest.fn().mockReturnValue({
          data: [],
          error: null
        }),
        lte: jest.fn().mockReturnValue({
          data: [],
          error: null
        }),
        order: jest.fn().mockReturnValue({
          data: [],
          error: null
        }),
        limit: jest.fn().mockReturnValue({
          data: [],
          error: null
        })
      }),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: 'new-record-id' }],
        error: null
      }),
      update: jest.fn().mockResolvedValue({
        data: [{ id: 'updated-record-id' }],
        error: null
      }),
      delete: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    }),
    rpc: jest.fn().mockResolvedValue({
      data: [],
      error: null
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } },
        error: null
      })
    }
  });

  return {
    createClient
  };
});

// Mock Bitcode Supabase package root used by retained package callers
jest.mock('@bitcode/supabase', () => {
  const mockClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    }
  };

  return {
    __esModule: true,
    createClient: jest.fn().mockReturnValue(mockClient),
    createBrowserClient: jest.fn().mockReturnValue(mockClient),
    supabase: mockClient,
    supabaseAdmin: mockClient,
  };
});

// ============================================================================
// Global Mocks - Bitcode Internal Services
// ============================================================================

// Mock Bitcode pipelines
jest.mock('@bitcode/pipelines-generics', () => ({
  Pipeline: {
    ASSET_PACK: 'asset-pack'
  },
  PipelinePhase: {
    SETUP: 'setup',
    DISCOVERY: 'discovery',
    IMPLEMENTATION: 'implementation',
    VALIDATION: 'validation',
    FINISH: 'finish'
  },
  PipelineExecution: class MockPipelineExecution {
    id: string;
    parent?: unknown;
    llms = { setLLMRegistry: jest.fn(), set: jest.fn() };
    tools = { registerTool: jest.fn() };
    agents = { registerAgent: jest.fn() };
    store = jest.fn();
    child = jest.fn((id: string) => new MockPipelineExecution(id, this));

    constructor(id = 'test-pipeline-execution', parent?: unknown) {
      this.id = id;
      this.parent = parent;
    }
  },
  enableExecutionDebug: jest.fn(),
  createPhaseRunner: jest.fn().mockImplementation(() => jest.fn().mockResolvedValue({
    success: true
  })),
  createAgentExecutor: jest.fn().mockImplementation((agentName: string) =>
    jest.fn().mockImplementation(async (input: any) => ({
      ...(input && typeof input === 'object' ? input : {}),
      _agent: agentName,
      success: true
    }))
  ),
  factorySDIVFPipelineFromExecutors: jest.fn().mockImplementation((_name: string, config: any) =>
    jest.fn().mockImplementation(async (input: any, execution: any) => {
      let current = input;
      if (config?.preprocess) current = await config.preprocess(current, execution);
      if (config?.setup) current = await config.setup(current, execution);
      if (config?.discovery) current = await config.discovery(current, execution);
      if (config?.implementation) current = await config.implementation(current, execution);
      if (config?.validation) current = await config.validation(current, execution);
      if (config?.finish) current = await config.finish(current, execution);
      if (config?.postprocess) current = await config.postprocess(current, execution);
      return current;
    })
  ),
  // @deprecated alias of factorySDIVFPipelineFromExecutors
  factorySDIVFExecutorPipeline: jest.fn().mockImplementation((_name: string, config: any) =>
    jest.fn().mockImplementation(async (input: any, execution: any) => {
      let current = input;
      if (config?.preprocess) current = await config.preprocess(current, execution);
      if (config?.setup) current = await config.setup(current, execution);
      if (config?.discovery) current = await config.discovery(current, execution);
      if (config?.implementation) current = await config.implementation(current, execution);
      if (config?.validation) current = await config.validation(current, execution);
      if (config?.finish) current = await config.finish(current, execution);
      if (config?.postprocess) current = await config.postprocess(current, execution);
      return current;
    })
  ),
  createGuidedPipelineExecution: jest.fn().mockImplementation((gates: Record<string, any>) =>
    jest.fn().mockImplementation(async (input: any, execution: any) => {
      const currentGate = execution?.get?.('gate', 'current') || 'Develop';
      const gateExecutor = gates?.[currentGate] || gates?.Develop || (async (x: any) => x);
      return gateExecutor(input, execution);
    })
  ),
  gatePreprocess: jest.fn().mockImplementation((input: any) => input),
  waitForInstruction: jest.fn().mockImplementation(() =>
    jest.fn().mockImplementation(async (input: any) => input)
  ),
  createPipelineExecutor: jest.fn().mockReturnValue({
    execute: jest.fn().mockResolvedValue({
      success: true,
      pipelineId: 'test-pipeline-id',
      assetPacks: [],
      metrics: {
        measuredBtd: 100,
        tokensProcessed: 1000,
        confidence: 0.9
      }
    })
  })
}));

// Mock dry run system
jest.mock('@bitcode/pipelines-generics/src/llm/dry_running/config', () => ({
  createDryRunContext: jest.fn().mockReturnValue({
    isDryRun: true,
    features: {
      tools: true,
      resources: true,
      prompts: true,
      streaming: true
    },
    authentication: {
      required: false,
      methods: []
    },
    generateMockResponse: jest.fn().mockResolvedValue({
      success: true,
      data: 'Mock dry run response'
    })
  }),
  getDryRunConfig: jest.fn().mockReturnValue({
    enabled: true,
    mode: 'test',
    features: ['all']
  })
}), { virtual: true });

// ============================================================================
// Global Mocks - Web APIs and Node.js APIs
// ============================================================================

// Mock fetch for web requests
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  blob: jest.fn().mockResolvedValue(new Blob()),
  headers: new Headers()
} as any);

// Mock WebSocket for streaming
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
})) as any;

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn()
})) as any;

// ============================================================================
// Test Utilities and Helpers
// ============================================================================

/**
 * Global test utilities available in all test files
 */
global.testUtils = {
  // Wait for async operations
  waitFor: async (condition: () => boolean, timeout = 5000): Promise<void> => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },
  
  // Create mock MCP request
  createMockMCPRequest: (method: string, params: any = {}) => ({
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000),
    method,
    params
  }),
  
  // Create mock auth context
  createMockAuthContext: (overrides: any = {}) => ({
    userId: 'test-user-id',
    organizationId: 'test-org-id',
    role: 'owner',
    permissions: {
      pipelines: { create: true, read: true, cancel: true, retry: true },
      organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
      resources: { read: true, export: true }
    },
    btdBalance: 10000,
    mcpCredentials: {},
    ...overrides
  }),
  
  // Generate test data
  generateTestRepository: () => ({
    owner: 'test-org',
    name: 'test-repo',
    branch: 'main',
    connectionId: 12345
  }),
  
  // Performance measurement
  measurePerformance: async (fn: () => Promise<any>) => {
    const start = process.hrtime.bigint();
    const memStart = process.memoryUsage();
    
    const result = await fn();
    
    const end = process.hrtime.bigint();
    const memEnd = process.memoryUsage();
    
    return {
      result,
      duration: Number(end - start) / 1000000, // Convert to milliseconds
      memoryDelta: {
        heapUsed: memEnd.heapUsed - memStart.heapUsed,
        heapTotal: memEnd.heapTotal - memStart.heapTotal,
        external: memEnd.external - memStart.external
      }
    };
  }
};

// ============================================================================
// Test Environment Setup
// ============================================================================

// Increase test timeout for integration tests
jest.setTimeout(300000); // 5 minutes

// Configure console output for tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Suppress expected error messages in tests
  const message = args[0]?.toString() || '';
  const suppressedMessages = [
    'Warning: ReactDOM.render is depre' + 'cated',
    'Warning: componentWillReceiveProps has been renamed',
    'ExperimentalWarning: The Fetch API is an experimental feature'
  ];
  
  if (!suppressedMessages.some(msg => message.includes(msg))) {
    originalConsoleError(...args);
  }
};

console.warn = (...args: any[]) => {
  // Suppress expected warning messages in tests
  const message = args[0]?.toString() || '';
  const suppressedMessages = [
    'depre' + 'cated',
    'experimental'
  ];
  
  if (!suppressedMessages.some(msg => message.toLowerCase().includes(msg))) {
    originalConsoleWarn(...args);
  }
};

// ============================================================================
// Global Setup and Teardown Hooks
// ============================================================================

beforeAll(async () => {
  // Initialize test environment
  console.log('🚀 Initializing MCP Test Environment');

  // Keep real timers by default so retained integration-style suites can
  // exercise actual timeout and shutdown behavior. Unit suites that read
  // synthetic timer control opt into fake timers locally.
  jest.useRealTimers();
});

afterAll(async () => {
  // Cleanup test environment
  console.log('🧹 Cleaning up MCP Test Environment');

  // Restore real timers
  jest.useRealTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  
  // Reset environment variables
  process.env.NODE_ENV = 'test';
  process.env.DRY_RUN_MODE = 'true';
  process.env.MCP_TEST_MODE = 'true';
});

afterEach(() => {
  // Reset timer mode after tests that opt into fake timers locally.
  jest.useRealTimers();
});

// ============================================================================ 
// Error Handling
// ============================================================================

// Handle unhandled promise rejections in tests
const handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log the error
};

// Handle uncaught exceptions in tests
const handleUncaughtException = (error: unknown) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in tests, just log the error
};

process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

afterAll(() => {
  process.off('unhandledRejection', handleUnhandledRejection);
  process.off('uncaughtException', handleUncaughtException);

  try {
    // The mocking module eagerly instantiates a singleton with timers/listeners.
    // Reset it explicitly so retained MCP Jest workers can exit cleanly.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MockOrchestrator } = require('../../../../../../../uapi/mocking/core/MockOrchestrator');
    if (typeof MockOrchestrator.resetInstance === 'function') {
      MockOrchestrator.resetInstance();
    } else {
      const instance = (MockOrchestrator as any).instance;
      if (instance && typeof instance.cleanup === 'function') {
        instance.cleanup();
      }
      (MockOrchestrator as any).instance = null;
    }
  } catch {
    // Best-effort teardown only.
  }
});

export {};
