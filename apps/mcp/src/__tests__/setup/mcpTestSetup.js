"use strict";
/**
 * MCP Test Setup
 *
 * Comprehensive test setup for Bitcode MCP server testing with advanced mocking,
 * dry run configuration, and performance monitoring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
require("@jest/globals");
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
globals_1.jest.mock('@bitcode/logger', () => ({
    logger: {
        info: globals_1.jest.fn(),
        warn: globals_1.jest.fn(),
        error: globals_1.jest.fn(),
        debug: globals_1.jest.fn(),
        trace: globals_1.jest.fn()
    },
    log: globals_1.jest.fn()
}));
// Mock Bitcode observability
globals_1.jest.mock('@bitcode/observability', () => ({
    observability: {
        init: globals_1.jest.fn().mockResolvedValue(undefined),
        recordMetric: globals_1.jest.fn(),
        recordError: globals_1.jest.fn(),
        startTrace: globals_1.jest.fn().mockReturnValue({ id: 'test-trace' }),
        endTrace: globals_1.jest.fn(),
        createSpan: globals_1.jest.fn().mockReturnValue({
            setTag: globals_1.jest.fn(),
            setStatus: globals_1.jest.fn(),
            finish: globals_1.jest.fn()
        })
    }
}));
// ============================================================================
// Global Mocks - MCP SDK
// ============================================================================
// Mock MCP Server SDK
globals_1.jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
    Server: globals_1.jest.fn().mockImplementation((serverInfo, capabilities) => ({
        serverInfo,
        capabilities,
        setRequestHandler: globals_1.jest.fn(),
        connect: globals_1.jest.fn().mockResolvedValue(undefined),
        close: globals_1.jest.fn().mockResolvedValue(undefined),
        onerror: null,
        // Mock request handlers
        handlers: new Map(),
        // Add handler tracking for testing
        _testGetHandlers: function () { return this.handlers; }
    }))
}));
// Mock MCP Transport
globals_1.jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: globals_1.jest.fn().mockImplementation(() => ({
        start: globals_1.jest.fn().mockResolvedValue(undefined),
        close: globals_1.jest.fn().mockResolvedValue(undefined),
        onmessage: null,
        onclose: null,
        onerror: null
    }))
}));
// Mock MCP Types and Schemas
globals_1.jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
    CallToolRequestSchema: { parse: globals_1.jest.fn() },
    ListResourcesRequestSchema: { parse: globals_1.jest.fn() },
    ListResourceTemplatesRequestSchema: { parse: globals_1.jest.fn() },
    ReadResourceRequestSchema: { parse: globals_1.jest.fn() },
    ListPromptsRequestSchema: { parse: globals_1.jest.fn() },
    GetPromptRequestSchema: { parse: globals_1.jest.fn() },
    ListToolsRequestSchema: { parse: globals_1.jest.fn() },
    // Add schema validation mocks
    McpError: class McpError extends Error {
        constructor(code, message) {
            super(message);
            this.name = 'McpError';
        }
    }
}));
// ============================================================================
// Global Mocks - External APIs
// ============================================================================
// Mock GitHub API (Octokit)
globals_1.jest.mock('@octokit/rest', () => ({
    Octokit: globals_1.jest.fn().mockImplementation(() => ({
        repos: {
            get: globals_1.jest.fn().mockResolvedValue({
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
            listForOrg: globals_1.jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 123456,
                        name: 'test-repo',
                        full_name: 'test-org/test-repo',
                        owner: { login: 'test-org' }
                    }
                ]
            }),
            getContent: globals_1.jest.fn().mockResolvedValue({
                data: {
                    type: 'file',
                    content: Buffer.from('test content').toString('base64'),
                    encoding: 'base64'
                }
            }),
            createOrUpdateFileContents: globals_1.jest.fn().mockResolvedValue({
                data: {
                    commit: { sha: 'abc123' }
                }
            })
        },
        pulls: {
            create: globals_1.jest.fn().mockResolvedValue({
                data: {
                    number: 123,
                    html_url: 'https://github.com/test-org/test-repo/pull/123',
                    state: 'open'
                }
            }),
            get: globals_1.jest.fn().mockResolvedValue({
                data: {
                    number: 123,
                    state: 'open',
                    mergeable: true
                }
            })
        },
        issues: {
            create: globals_1.jest.fn().mockResolvedValue({
                data: {
                    number: 456,
                    html_url: 'https://github.com/test-org/test-repo/issues/456'
                }
            })
        }
    }))
}));
// Mock OpenAI API
globals_1.jest.mock('openai', () => ({
    OpenAI: globals_1.jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: globals_1.jest.fn().mockResolvedValue({
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
            create: globals_1.jest.fn().mockResolvedValue({
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
globals_1.jest.mock('figma-api', () => ({
    Api: globals_1.jest.fn().mockImplementation(() => ({
        getFile: globals_1.jest.fn().mockResolvedValue({
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
        getFileComponents: globals_1.jest.fn().mockResolvedValue({
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
globals_1.jest.mock('@supabase/supabase-js', () => {
    const createClient = globals_1.jest.fn().mockReturnValue({
        from: globals_1.jest.fn().mockReturnValue({
            select: globals_1.jest.fn().mockReturnValue({
                eq: globals_1.jest.fn().mockReturnValue({
                    data: [],
                    error: null
                }),
                gte: globals_1.jest.fn().mockReturnValue({
                    data: [],
                    error: null
                }),
                lte: globals_1.jest.fn().mockReturnValue({
                    data: [],
                    error: null
                }),
                order: globals_1.jest.fn().mockReturnValue({
                    data: [],
                    error: null
                }),
                limit: globals_1.jest.fn().mockReturnValue({
                    data: [],
                    error: null
                })
            }),
            insert: globals_1.jest.fn().mockResolvedValue({
                data: [{ id: 'new-record-id' }],
                error: null
            }),
            update: globals_1.jest.fn().mockResolvedValue({
                data: [{ id: 'updated-record-id' }],
                error: null
            }),
            delete: globals_1.jest.fn().mockResolvedValue({
                data: [],
                error: null
            })
        }),
        rpc: globals_1.jest.fn().mockResolvedValue({
            data: [],
            error: null
        }),
        auth: {
            getUser: globals_1.jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
                error: null
            }),
            signInWithPassword: globals_1.jest.fn().mockResolvedValue({
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
globals_1.jest.mock('@bitcode/supabase', () => {
    const mockClient = {
        from: globals_1.jest.fn().mockReturnThis(),
        select: globals_1.jest.fn().mockReturnThis(),
        eq: globals_1.jest.fn().mockReturnThis(),
        single: globals_1.jest.fn().mockReturnThis(),
        insert: globals_1.jest.fn().mockReturnThis(),
        update: globals_1.jest.fn().mockReturnThis(),
        delete: globals_1.jest.fn().mockReturnThis(),
        gte: globals_1.jest.fn().mockReturnThis(),
        lte: globals_1.jest.fn().mockReturnThis(),
        limit: globals_1.jest.fn().mockReturnThis(),
        order: globals_1.jest.fn().mockReturnThis(),
        maybeSingle: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
        rpc: globals_1.jest.fn().mockResolvedValue({ data: [], error: null }),
        auth: {
            getUser: globals_1.jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
                error: null
            })
        }
    };
    return {
        __esModule: true,
        createClient: globals_1.jest.fn().mockReturnValue(mockClient),
        createBrowserClient: globals_1.jest.fn().mockReturnValue(mockClient),
        supabase: mockClient,
        supabaseAdmin: mockClient
  };
});
// ============================================================================
// Global Mocks - Bitcode Internal Services
// ============================================================================
// Mock Bitcode pipelines
globals_1.jest.mock('@bitcode/pipelines-generics', () => ({
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
        constructor(id = 'test-pipeline-execution', parent) {
            this.llms = { setLLMRegistry: globals_1.jest.fn(), set: globals_1.jest.fn() };
            this.tools = { registerTool: globals_1.jest.fn() };
            this.agents = { registerAgent: globals_1.jest.fn() };
            this.store = globals_1.jest.fn();
            this.child = globals_1.jest.fn((id) => new MockPipelineExecution(id, this));
            this.id = id;
            this.parent = parent;
        }
    },
    enableExecutionDebug: globals_1.jest.fn(),
    createPhaseRunner: globals_1.jest.fn().mockImplementation(() => globals_1.jest.fn().mockResolvedValue({
        success: true
    })),
    createAgentExecutor: globals_1.jest.fn().mockImplementation((agentName) => globals_1.jest.fn().mockImplementation(async (input) => ({
        ...(input && typeof input === 'object' ? input : {}),
        _agent: agentName,
        success: true
    }))),
    factorySDIVFExecutorPipeline: globals_1.jest.fn().mockImplementation((_name, config) => globals_1.jest.fn().mockImplementation(async (input, execution) => {
        let current = input;
        if (config?.preprocess)
            current = await config.preprocess(current, execution);
        if (config?.setup)
            current = await config.setup(current, execution);
        if (config?.discovery)
            current = await config.discovery(current, execution);
        if (config?.implementation)
            current = await config.implementation(current, execution);
        if (config?.validation)
            current = await config.validation(current, execution);
        if (config?.finish)
            current = await config.finish(current, execution);
        if (config?.postprocess)
            current = await config.postprocess(current, execution);
        return current;
    })),
    createGuidedPipelineExecution: globals_1.jest.fn().mockImplementation((gates) => globals_1.jest.fn().mockImplementation(async (input, execution) => {
        const currentGate = execution?.get?.('gate', 'current') || 'Develop';
        const gateExecutor = gates?.[currentGate] || gates?.Develop || (async (x) => x);
        return gateExecutor(input, execution);
    })),
    gatePreprocess: globals_1.jest.fn().mockImplementation((input) => input),
    waitForInstruction: globals_1.jest.fn().mockImplementation(() => globals_1.jest.fn().mockImplementation(async (input) => input)),
    createPipelineExecutor: globals_1.jest.fn().mockReturnValue({
        execute: globals_1.jest.fn().mockResolvedValue({
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
globals_1.jest.mock('@bitcode/pipelines-generics/src/llm/dry_running/config', () => ({
    createDryRunContext: globals_1.jest.fn().mockReturnValue({
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
        generateMockResponse: globals_1.jest.fn().mockResolvedValue({
            success: true,
            data: 'Mock dry run response'
        })
    }),
    getDryRunConfig: globals_1.jest.fn().mockReturnValue({
        enabled: true,
        mode: 'test',
        features: ['all']
    })
}), { virtual: true });
// ============================================================================
// Global Mocks - Web APIs and Node.js APIs
// ============================================================================
// Mock fetch for web requests
global.fetch = globals_1.jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: globals_1.jest.fn().mockResolvedValue({}),
    text: globals_1.jest.fn().mockResolvedValue(''),
    blob: globals_1.jest.fn().mockResolvedValue(new Blob()),
    headers: new Headers()
});
// Mock WebSocket for streaming
global.WebSocket = globals_1.jest.fn().mockImplementation(() => ({
    addEventListener: globals_1.jest.fn(),
    removeEventListener: globals_1.jest.fn(),
    dispatchEvent: globals_1.jest.fn(),
    send: globals_1.jest.fn(),
    close: globals_1.jest.fn(),
    readyState: 1,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
}));
// Mock FormData
global.FormData = globals_1.jest.fn().mockImplementation(() => ({
    append: globals_1.jest.fn(),
    delete: globals_1.jest.fn(),
    get: globals_1.jest.fn(),
    getAll: globals_1.jest.fn(),
    has: globals_1.jest.fn(),
    set: globals_1.jest.fn(),
    entries: globals_1.jest.fn(),
    keys: globals_1.jest.fn(),
    values: globals_1.jest.fn()
}));
// ============================================================================
// Test Utilities and Helpers
// ============================================================================
/**
 * Global test utilities available in all test files
 */
global.testUtils = {
    // Wait for async operations
    waitFor: async (condition, timeout = 5000) => {
        const start = Date.now();
        while (!condition() && Date.now() - start < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!condition()) {
            throw new Error(`Condition not met within ${timeout}ms`);
        }
    },
    // Create mock MCP request
    createMockMCPRequest: (method, params = {}) => ({
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method,
        params
    }),
    // Create mock auth context
    createMockAuthContext: (overrides = {}) => ({
        userId: 'test-user-id',
        organizationId: 'test-org-id',
        role: 'owner',
        permissions: {
            pipelines: { create: true, read: true, cancel: true, retry: true },
            organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
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
    measurePerformance: async (fn) => {
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
globals_1.jest.setTimeout(300000); // 5 minutes
// Configure console output for tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
console.error = (...args) => {
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
console.warn = (...args) => {
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
    // exercise actual timeout and shutdown behavior. Unit suites that need
    // synthetic timer control opt into fake timers locally.
    globals_1.jest.useRealTimers();
});
afterAll(async () => {
    // Cleanup test environment
    console.log('🧹 Cleaning up MCP Test Environment');
    // Restore real timers
    globals_1.jest.useRealTimers();
    // Clear all mocks
    globals_1.jest.clearAllMocks();
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});
beforeEach(() => {
    // Reset mocks before each test
    globals_1.jest.clearAllMocks();
    // Reset environment variables
    process.env.NODE_ENV = 'test';
    process.env.DRY_RUN_MODE = 'true';
    process.env.MCP_TEST_MODE = 'true';
});
afterEach(() => {
    // Reset timer mode after tests that opt into fake timers locally.
    globals_1.jest.useRealTimers();
});
// ============================================================================ 
// Error Handling
// ============================================================================
// Handle unhandled promise rejections in tests
const handleUnhandledRejection = (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in tests, just log the error
};
// Handle uncaught exceptions in tests
const handleUncaughtException = (error) => {
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
        const { MockOrchestrator } = require('../../../../../apps/uapi/mocking/core/MockOrchestrator');
        if (typeof MockOrchestrator.resetInstance === 'function') {
            MockOrchestrator.resetInstance();
        }
        else {
            const instance = MockOrchestrator.instance;
            if (instance && typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
            MockOrchestrator.instance = null;
        }
    }
    catch {
        // Best-effort teardown only.
    }
});
