"use strict";
/**
 * Bitcode MCP Test Fixtures
 *
 * Comprehensive test fixtures for MCP testing with customer-focused scenarios,
 * realistic data, and production-like configurations. Built to support the
 * sophisticated testing requirements of Bitcode's MCP server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_CONFIGURATIONS = exports.MOCK_DATA = exports.MCP_CONFIGURATIONS = exports.CUSTOMER_SCENARIOS = exports.STREAMING_EVENTS = exports.PIPELINE_RESULTS = exports.ATTACHMENTS = exports.REPOSITORY_CONTEXTS = exports.AUTH_CONTEXTS = void 0;
const types_1 = require("../../types");
// ============================================================================
// Authentication Context Fixtures
// ============================================================================
/**
 * Standard authentication contexts for different user types
 */
exports.AUTH_CONTEXTS = {
    OWNER: {
        userId: 'owner-001',
        organizationId: 'org-001',
        role: 'owner',
        permissions: {
            pipelines: { create: true, read: true, cancel: true, retry: true },
            organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
            resources: { read: true, export: true }
        },
        btdBalance: 10000,
        mcpCredentials: {
            github: { token: 'mock-github-token' },
            aws: { accessKeyId: 'mock-aws-key', secretAccessKey: 'mock-aws-secret' },
            notion: { token: 'mock-notion-token' }
        }
    },
    ADMIN: {
        userId: 'admin-001',
        organizationId: 'org-001',
        role: 'admin',
        permissions: {
            pipelines: { create: true, read: true, cancel: true, retry: true },
            organization: { manageMembers: true, viewAnalytics: true, manageBtd: false },
            resources: { read: true, export: true }
        },
        btdBalance: 5000,
        mcpCredentials: {
            github: { token: 'mock-github-token' },
            figma: { token: 'mock-figma-token' }
        }
    },
    DEVELOPER: {
        userId: 'dev-001',
        organizationId: 'org-001',
        role: 'dev',
        permissions: {
            pipelines: { create: true, read: true, cancel: false, retry: false },
            organization: { manageMembers: false, viewAnalytics: false, manageBtd: false },
            resources: { read: true, export: false }
        },
        btdBalance: 1000,
        mcpCredentials: {
            github: { token: 'mock-github-token' }
        }
    },
    LIMITED_USER: {
        userId: 'limited-001',
        organizationId: 'org-001',
        role: 'dev',
        permissions: {
            pipelines: { create: false, read: true, cancel: false, retry: false },
            organization: { manageMembers: false, viewAnalytics: false, manageBtd: false },
            resources: { read: false, export: false }
        },
        btdBalance: 0,
        mcpCredentials: {}
    }
};
// ============================================================================
// Repository Context Fixtures
// ============================================================================
/**
 * Repository contexts for different project types
 */
exports.REPOSITORY_CONTEXTS = {
    NEXT_JS_PROJECT: {
        owner: 'bitcode-labs',
        name: 'next-js-ecommerce',
        branch: 'main',
        path: 'src/components',
        connectionId: 12345
    },
    REACT_NATIVE_PROJECT: {
        owner: 'bitcode-labs',
        name: 'mobile-app',
        branch: 'develop',
        connectionId: 12346
    },
    PYTHON_API_PROJECT: {
        owner: 'bitcode-labs',
        name: 'python-api',
        branch: 'feature/auth-system',
        path: 'src/auth',
        connectionId: 12347
    },
    RETIRED_PROJECT: {
        owner: 'bitcode-labs',
        name: 'retired-monolith',
        branch: 'main',
        connectionId: 12348
    }
};
// ============================================================================
// Attachment Fixtures
// ============================================================================
/**
 * Multimodal attachment fixtures for testing
 */
exports.ATTACHMENTS = {
    FIGMA_DESIGN: {
        type: 'figma',
        content: 'https://www.figma.com/file/ABC123/Design-System',
        metadata: {
            title: 'E-commerce Design System',
            components: ['Button', 'Card', 'Modal'],
            pages: ['Components', 'Patterns', 'Tokens']
        }
    },
    SCREENSHOT: {
        type: 'image',
        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        metadata: {
            width: 1920,
            height: 1080,
            format: 'png'
        }
    },
    REQUIREMENTS_DOC: {
        type: 'document',
        content: 'https://docs.google.com/document/d/123456/requirements',
        metadata: {
            title: 'Feature Requirements',
            sections: ['Overview', 'Acceptance Criteria', 'Technical Specs']
        }
    },
    USER_STORY_VIDEO: {
        type: 'video',
        content: 'https://www.loom.com/share/abc123',
        metadata: {
            duration: 120,
            format: 'mp4',
            title: 'User Story Walkthrough'
        }
    }
};
// ============================================================================
// Pipeline Execution Results Fixtures
// ============================================================================
/**
 * Pipeline execution results for different scenarios
 */
exports.PIPELINE_RESULTS = {
    SUCCESSFUL_ASSET_PACK: {
        pipelineId: 'pipeline-001',
        status: types_1.PipelineStatus.COMPLETED,
        pipeline: 'asset-pack',
        subtype: 'pull_request',
        task: 'Create user authentication system',
        repository: exports.REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
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
    }
  };
// ============================================================================
// Streaming Event Fixtures
// ============================================================================
/**
 * Pipeline streaming events for testing real-time functionality
 */
exports.STREAMING_EVENTS = {
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
    },
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
    },
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
    },
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
    },
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
    }
};
// ============================================================================
// Customer Scenario Fixtures
// ============================================================================
/**
 * Customer-focused test scenarios representing real-world usage
 */
exports.CUSTOMER_SCENARIOS = {
    STARTUP_DEVELOPER: {
        name: 'Startup Developer Building MVP',
        description: 'A solo developer building an MVP for their startup',
        userContext: exports.AUTH_CONTEXTS.DEVELOPER,
        inputs: {
            task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
            repository: exports.REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
            attachments: [exports.ATTACHMENTS.FIGMA_DESIGN, exports.ATTACHMENTS.REQUIREMENTS_DOC],
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
        userContext: exports.AUTH_CONTEXTS.ADMIN,
        inputs: {
            task: 'Migrate authentication system from custom JWT to OAuth 2.0 with PKCE',
            repository: exports.REPOSITORY_CONTEXTS.RETIRED_PROJECT,
            attachments: [exports.ATTACHMENTS.SCREENSHOT, exports.ATTACHMENTS.REQUIREMENTS_DOC],
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
        userContext: exports.AUTH_CONTEXTS.DEVELOPER,
        inputs: {
            task: 'Implement offline-first real-time chat with push notifications',
            repository: exports.REPOSITORY_CONTEXTS.REACT_NATIVE_PROJECT,
            attachments: [exports.ATTACHMENTS.USER_STORY_VIDEO, exports.ATTACHMENTS.FIGMA_DESIGN],
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
        userContext: exports.AUTH_CONTEXTS.LIMITED_USER,
        inputs: {
            task: 'Build a complete landing page with contact form and animations',
            repository: exports.REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
            attachments: [exports.ATTACHMENTS.FIGMA_DESIGN],
            mcpConfig: {
                emailjs: { serviceId: 'mock-email-service' }
            }
        },
        expectedOutcome: 'partial',
        businessValue: 'Enable cost-effective development for budget-conscious users'
    },
    FREELANCER_LIMITED_CREDITS: {
        name: 'Freelancer with Limited $BTD',
        description: 'A freelancer with limited $BTD trying to complete a project',
        userContext: exports.AUTH_CONTEXTS.LIMITED_USER,
        inputs: {
            task: 'Build a complete landing page with contact form and animations',
            repository: exports.REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
            attachments: [exports.ATTACHMENTS.FIGMA_DESIGN],
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
        userContext: exports.AUTH_CONTEXTS.OWNER,
        inputs: {
            task: 'Conduct comprehensive security audit and generate remediation plan',
            repository: exports.REPOSITORY_CONTEXTS.PYTHON_API_PROJECT,
            attachments: [exports.ATTACHMENTS.REQUIREMENTS_DOC],
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
exports.MCP_CONFIGURATIONS = {
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
exports.MOCK_DATA = {
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
                    credits_balance: 50000,
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
exports.TEST_CONFIGURATIONS = {
    COMPREHENSIVE_INTEGRATION: {
        testName: 'Comprehensive MCP Integration Test',
        description: 'Full integration test covering all MCP capabilities with customer scenarios',
        category: 'external',
        mcpConfig: exports.MCP_CONFIGURATIONS.FULL_FEATURED,
        execution: {
            timeout: 300000, // 5 minutes
            retries: 3,
            parallel: false,
            streaming: true,
            metrics: true
        },
        mocks: {
            auth: exports.AUTH_CONTEXTS.OWNER,
            tools: exports.MOCK_DATA.GITHUB_REPOS,
            resources: exports.MOCK_DATA.SUPABASE_RESPONSES,
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
            exports.CUSTOMER_SCENARIOS.STARTUP_DEVELOPER,
            exports.CUSTOMER_SCENARIOS.ENTERPRISE_TEAM_LEAD,
            exports.CUSTOMER_SCENARIOS.MOBILE_DEVELOPER
        ]
    },
    PERFORMANCE_STRESS_TEST: {
        testName: 'MCP Performance Stress Test',
        description: 'High-load performance testing with concurrent requests',
        category: 'performance',
        mcpConfig: exports.MCP_CONFIGURATIONS.PERFORMANCE_TEST,
        execution: {
            timeout: 600000, // 10 minutes
            retries: 1,
            parallel: true,
            streaming: true,
            metrics: true
        },
        mocks: {
            auth: exports.AUTH_CONTEXTS.OWNER,
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
            exports.CUSTOMER_SCENARIOS.STARTUP_DEVELOPER
        ]
    },
    SECURITY_AUDIT_TEST: {
        testName: 'MCP Security Audit Test',
        description: 'Comprehensive security testing with attack scenarios',
        category: 'security',
        mcpConfig: exports.MCP_CONFIGURATIONS.FULL_FEATURED,
        execution: {
            timeout: 300000,
            retries: 1,
            parallel: false,
            streaming: false,
            metrics: true
        },
        mocks: {
            auth: exports.AUTH_CONTEXTS.LIMITED_USER,
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
            exports.CUSTOMER_SCENARIOS.SECURITY_AUDIT_SCENARIO,
            exports.CUSTOMER_SCENARIOS.FREELANCER_LIMITED_BTD
        ]
    }
};
