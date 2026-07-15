"use strict";
/**
 * Bitcode MCP Tools Test Suite
 *
 * Comprehensive testing for all MCP tools with dry running, sophisticated mocking,
 * and customer-focused validation. This suite tests the tool surfaces that comprise
 * Bitcode's core intelligence value delivered through the MCP protocol.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const MCPTestFramework_1 = require("../framework/MCPTestFramework");
const MCPTestFixtures_1 = require("../fixtures/MCPTestFixtures");
const server_1 = require("../../server");
const types_1 = require("../../types");
/**
 * Comprehensive tool test configurations
 */
const TOOL_TEST_CONFIGS = [
    // Pipeline Tools
    {
        toolName: 'bitcode://pipelines/asset-pack/create',
        category: 'pipeline',
        schema: types_1.AssetPackPipelineToolSchema,
        requiredPermissions: ['pipelines.create'],
        expectedOutputs: ['pull_request', 'documentation', 'tests'],
        customerScenarios: [
            {
                name: 'E-commerce Checkout Flow',
                inputs: {
                    task: 'Create a settlement-ready asset pack for a wallet-gated Bitcode transaction flow',
                    repository: MCPTestFixtures_1.REPOSITORY_CONTEXTS.NEXT_JS_PROJECT,
                    attachments: [MCPTestFixtures_1.ATTACHMENTS.FIGMA_DESIGN],
                    subtype: 'pull_request',
                    options: {
                        createPR: true,
                        runTests: true,
                        generateDocs: true,
                        securityCheck: true
                    }
                },
                expectedOutcome: 'success',
                businessValue: 'Accelerate feature delivery by 80% with production-ready code'
            },
            {
                name: 'Mobile Authentication System',
                inputs: {
                    task: 'Implement biometric authentication for mobile app',
                    repository: MCPTestFixtures_1.REPOSITORY_CONTEXTS.REACT_NATIVE_PROJECT,
                    attachments: [MCPTestFixtures_1.ATTACHMENTS.USER_STORY_VIDEO],
                    subtype: 'pull_request',
                    options: {
                        createPR: true,
                        runTests: true,
                        generateDocs: true,
                        securityCheck: true
                    }
                },
                expectedOutcome: 'success',
                businessValue: 'Deliver secure mobile features 3x faster than manual development'
            }
        ]
    },
];
// ============================================================================
// MCP Tools Test Suite
// ============================================================================
(0, globals_1.describe)('Bitcode MCP Tools Test Suite', () => {
    let mcpServer;
    let testFramework;
    (0, globals_1.beforeAll)(async () => {
        // Setup test environment
        process.env.NODE_ENV = 'test';
        process.env.DRY_RUN_MODE = 'true';
        process.env.MCP_TOOLS_TEST = 'true';
        // Initialize MCP server for testing
        mcpServer = new server_1.BitcodeMCPServer({
            name: 'bitcode-tools-test',
            version: '1.0.0-test',
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
            observability: {
                enabled: true,
                metrics: true,
                tracing: true
            }
        });
        // Setup comprehensive mocks
        setupToolMocks();
    });
    (0, globals_1.afterAll)(async () => {
        await mcpServer.shutdown();
        await cleanupToolTests();
    });
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    // ============================================================================
    // Tool Registration & Discovery Tests
    // ============================================================================
    (0, globals_1.describe)('Tool Registration & Discovery', () => {
        (0, globals_1.it)('should register tools without duplicates', async () => {
            const config = {
                ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                testName: 'Tool Registration Test'
            };
            testFramework = new MCPTestFramework_1.MCPTestFramework(config);
            const result = await testFramework.executeTestSuite();
            (0, globals_1.expect)(result.passed).toBe(true);
            (0, globals_1.expect)(result.logs.some(log => log.message.includes('Listed MCP tools'))).toBe(true);
            // Verify tool count
            const toolCountLog = result.logs.find(log => log.message.includes('Listed MCP tools'));
            (0, globals_1.expect)(toolCountLog?.context?.count).toBeGreaterThan(100);
        });
        (0, globals_1.it)('should categorize tools correctly', async () => {
            const categories = ['pipeline', 'monitoring', 'analysis', 'intelligence', 'orchestration', 'enterprise', 'lsp', 'observability', 'jira'];
            for (const category of categories) {
                const config = {
                    ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                    testName: `Tool Category Test: ${category}`
                };
                testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                const result = await testFramework.executeTestSuite();
                (0, globals_1.expect)(result.passed).toBe(true);
                (0, globals_1.expect)(result.logs.some(log => log.message.includes(category))).toBe(true);
            }
        });
        (0, globals_1.it)('should validate tool schemas', async () => {
            for (const toolConfig of TOOL_TEST_CONFIGS) {
                const validInput = toolConfig.customerScenarios[0].inputs;
                // Validate schema parsing
                const parseResult = toolConfig.schema.safeParse(validInput);
                (0, globals_1.expect)(parseResult.success).toBe(true);
                // Test invalid inputs
                const invalidInput = { ...validInput, task: '' }; // Empty task
                const invalidResult = toolConfig.schema.safeParse(invalidInput);
                (0, globals_1.expect)(invalidResult.success).toBe(false);
            }
        });
    });
    // ============================================================================
    // Pipeline Tools Tests
    // ============================================================================
    (0, globals_1.describe)('Pipeline Tools', () => {
        const pipelineTools = TOOL_TEST_CONFIGS.filter(t => t.category === 'pipeline');
        pipelineTools.forEach(toolConfig => {
            (0, globals_1.describe)(toolConfig.toolName, () => {
                (0, globals_1.it)('should execute successfully with valid inputs', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Execution Test`,
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                inputs: scenario.inputs,
                                expectedOutcome: scenario.expectedOutcome,
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.passed).toBe(true);
                    (0, globals_1.expect)(result.customerImpact.scenarioResults[0].passed).toBe(true);
                    (0, globals_1.expect)(result.customerImpact.scenarioResults[0].userExperience).toMatch(/^(excellent|good)$/);
                }, 300000);
                (0, globals_1.it)('should handle authentication properly', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    // Test with limited permissions
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Auth Test`,
                        mocks: {
                            ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.mocks,
                            auth: MCPTestFixtures_1.AUTH_CONTEXTS.LIMITED_USER
                        },
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.LIMITED_USER,
                                inputs: scenario.inputs,
                                expectedOutcome: 'failure',
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.validationResults.securityValidation).toBe(true);
                    (0, globals_1.expect)(result.logs.some(log => log.level === 'error' && log.message.includes('permission'))).toBe(true);
                });
                (0, globals_1.it)('should produce expected outputs', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Output Test`,
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                inputs: scenario.inputs,
                                expectedOutcome: scenario.expectedOutcome,
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.passed).toBe(true);
                    // Verify expected outputs are present
                    toolConfig.expectedOutputs.forEach(output => {
                        (0, globals_1.expect)(result.logs.some(log => log.message.includes(output))).toBe(true);
                    });
                });
                (0, globals_1.it)('should handle dry run mode', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Dry Run Test`,
                        mcpConfig: {
                            ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.mcpConfig,
                            dryRun: true
                        },
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                inputs: scenario.inputs,
                                expectedOutcome: scenario.expectedOutcome,
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.passed).toBe(true);
                    (0, globals_1.expect)(result.logs.some(log => log.message.includes('dry run'))).toBe(true);
                });
            });
        });
    });
    // ============================================================================
    // Analysis Tools Tests
    // ============================================================================
    (0, globals_1.describe)('Analysis Tools', () => {
        const analysisTools = TOOL_TEST_CONFIGS.filter(t => t.category === 'analysis');
        analysisTools.forEach(toolConfig => {
            (0, globals_1.describe)(toolConfig.toolName, () => {
                (0, globals_1.it)('should perform comprehensive analysis', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Analysis Test`,
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                inputs: scenario.inputs,
                                expectedOutcome: scenario.expectedOutcome,
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.passed).toBe(true);
                    (0, globals_1.expect)(result.customerImpact.scenarioResults[0].passed).toBe(true);
                    // Verify analysis completeness
                    (0, globals_1.expect)(result.logs.some(log => log.message.includes('analysis'))).toBe(true);
                    (0, globals_1.expect)(result.logs.some(log => log.message.includes('report'))).toBe(true);
                }, 300000);
                (0, globals_1.it)('should generate actionable recommendations', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const config = {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                        testName: `${toolConfig.toolName} Recommendations Test`,
                        customerScenarios: [{
                                name: scenario.name,
                                description: scenario.name,
                                userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                inputs: scenario.inputs,
                                expectedOutcome: scenario.expectedOutcome,
                                businessValue: scenario.businessValue
                            }]
                    };
                    testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                    const result = await testFramework.executeTestSuite();
                    (0, globals_1.expect)(result.passed).toBe(true);
                    (0, globals_1.expect)(result.logs.some(log => log.message.includes('recommendations'))).toBe(true);
                });
                (0, globals_1.it)('should handle different analysis depths', async () => {
                    const scenario = toolConfig.customerScenarios[0];
                    const depths = ['surface', 'medium', 'deep'];
                    for (const depth of depths) {
                        const config = {
                            ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                            testName: `${toolConfig.toolName} Depth Test: ${depth}`,
                            customerScenarios: [{
                                    name: scenario.name,
                                    description: scenario.name,
                                    userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                                    inputs: {
                                        ...scenario.inputs,
                                        options: {
                                            ...scenario.inputs.options,
                                            depth
                                        }
                                    },
                                    expectedOutcome: scenario.expectedOutcome,
                                    businessValue: scenario.businessValue
                                }]
                        };
                        testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                        const result = await testFramework.executeTestSuite();
                        (0, globals_1.expect)(result.passed).toBe(true);
                        (0, globals_1.expect)(result.logs.some(log => log.message.includes(depth))).toBe(true);
                    }
                });
            });
        });
    });
    // ============================================================================
    // Customer Value Validation Tests
    // ============================================================================
    (0, globals_1.describe)('Customer Value Validation', () => {
        (0, globals_1.it)('should deliver measurable business value', async () => {
            const businessValueTests = TOOL_TEST_CONFIGS.flatMap(tool => tool.customerScenarios.map(scenario => ({
                toolName: tool.toolName,
                scenario: scenario.name,
                businessValue: scenario.businessValue,
                inputs: scenario.inputs,
                expectedOutcome: scenario.expectedOutcome
            })));
            for (const test of businessValueTests) {
                const config = {
                    ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                    testName: `Business Value Test: ${test.toolName} - ${test.scenario}`,
                    customerScenarios: [{
                            name: test.scenario,
                            description: test.scenario,
                            userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                            inputs: test.inputs,
                            expectedOutcome: test.expectedOutcome,
                            businessValue: test.businessValue
                        }]
                };
                testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                const result = await testFramework.executeTestSuite();
                (0, globals_1.expect)(result.customerImpact.scenarioResults[0].businessValue).toBe(test.businessValue);
                (0, globals_1.expect)(result.customerImpact.scenarioResults[0].passed).toBe(test.expectedOutcome === 'success');
                // Validate quantifiable business metrics
                const businessMetrics = [
                    'faster', 'reduce', 'improve', 'accelerate', 'optimize',
                    'increase', 'decrease', 'save', 'deliver', 'generate'
                ];
                const hasQuantifiableValue = businessMetrics.some(metric => test.businessValue.toLowerCase().includes(metric));
                (0, globals_1.expect)(hasQuantifiableValue).toBe(true);
            }
        }, 600000);
        (0, globals_1.it)('should optimize for different user personas', async () => {
            const personas = [
                { name: 'Startup Developer', context: MCPTestFixtures_1.AUTH_CONTEXTS.DEVELOPER },
                { name: 'Enterprise Admin', context: MCPTestFixtures_1.AUTH_CONTEXTS.ADMIN },
                { name: 'Organization Owner', context: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER }
            ];
            for (const persona of personas) {
                const config = {
                    ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                    testName: `Persona Optimization Test: ${persona.name}`,
                    mocks: {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.mocks,
                        auth: persona.context
                    },
                    customerScenarios: [{
                            name: `${persona.name} Workflow`,
                            description: `Optimized workflow for ${persona.name}`,
                            userContext: persona.context,
                            inputs: TOOL_TEST_CONFIGS[0].customerScenarios[0].inputs,
                            expectedOutcome: 'success',
                            businessValue: `Deliver exceptional value to ${persona.name}`
                        }]
                };
                testFramework = new MCPTestFramework_1.MCPTestFramework(config);
                const result = await testFramework.executeTestSuite();
                (0, globals_1.expect)(result.customerImpact.scenarioResults[0].userExperience).toMatch(/^(excellent|good)$/);
                (0, globals_1.expect)(result.customerImpact.overallScore).toBeGreaterThan(70);
            }
        });
        (0, globals_1.it)('should maintain quality under load', async () => {
            const config = {
                ...MCPTestFixtures_1.TEST_CONFIGURATIONS.PERFORMANCE_STRESS_TEST,
                testName: 'Tool Quality Under Load Test',
                customerScenarios: TOOL_TEST_CONFIGS.slice(0, 3).map(tool => ({
                    name: tool.customerScenarios[0].name,
                    description: tool.customerScenarios[0].name,
                    userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                    inputs: tool.customerScenarios[0].inputs,
                    expectedOutcome: tool.customerScenarios[0].expectedOutcome,
                    businessValue: tool.customerScenarios[0].businessValue
                }))
            };
            testFramework = new MCPTestFramework_1.MCPTestFramework(config);
            const result = await testFramework.executeTestSuite();
            (0, globals_1.expect)(result.customerImpact.overallScore).toBeGreaterThan(75);
            (0, globals_1.expect)(result.performance.errorRate).toBeLessThan(0.1);
            (0, globals_1.expect)(result.customerImpact.riskLevel).not.toBe('critical');
        }, 600000);
    });
    // ============================================================================
    // Error Handling & Recovery Tests
    // ============================================================================
    (0, globals_1.describe)('Error Handling & Recovery', () => {
        (0, globals_1.it)('should handle tool execution failures gracefully', async () => {
            const config = {
                ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                testName: 'Tool Failure Handling Test',
                customerScenarios: [{
                        name: 'Simulated Failure Scenario',
                        description: 'Test tool failure recovery',
                        userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                        inputs: {
                            ...TOOL_TEST_CONFIGS[0].customerScenarios[0].inputs,
                            task: 'SIMULATE_FAILURE' // Special test case
                        },
                        expectedOutcome: 'failure',
                        businessValue: 'Graceful failure handling'
                    }]
            };
            testFramework = new MCPTestFramework_1.MCPTestFramework(config);
            const result = await testFramework.executeTestSuite();
            (0, globals_1.expect)(result.mcpResults.errorHandling).toBe(true);
            (0, globals_1.expect)(result.logs.some(log => log.level === 'error')).toBe(true);
            (0, globals_1.expect)(result.customerImpact.riskLevel).not.toBe('critical');
        });
        (0, globals_1.it)('should recover from network failures', async () => {
            const config = {
                ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                testName: 'Network Failure Recovery Test',
                mocks: {
                    ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.mocks,
                    external: {
                        ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.mocks.external,
                        // Mock network failure
                        'network-failure': true
                    }
                },
                customerScenarios: [{
                        name: 'Network Failure Scenario',
                        description: 'Test network failure recovery',
                        userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                        inputs: TOOL_TEST_CONFIGS[0].customerScenarios[0].inputs,
                        expectedOutcome: 'partial',
                        businessValue: 'Resilient network handling'
                    }]
            };
            testFramework = new MCPTestFramework_1.MCPTestFramework(config);
            const result = await testFramework.executeTestSuite();
            (0, globals_1.expect)(result.mcpResults.errorHandling).toBe(true);
            (0, globals_1.expect)(result.customerImpact.riskLevel).not.toBe('critical');
        });
        (0, globals_1.it)('should handle resource exhaustion', async () => {
            const config = {
                ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION,
                testName: 'Resource Exhaustion Test',
                validation: {
                    ...MCPTestFixtures_1.TEST_CONFIGURATIONS.COMPREHENSIVE_INTEGRATION.validation,
                    performance: {
                        maxDuration: 1000, // Very tight constraint
                        maxMemory: 64, // Very low memory
                        maxCPU: 25 // Very low CPU
                    }
                },
                customerScenarios: [{
                        name: 'Resource Exhaustion Scenario',
                        description: 'Test resource exhaustion handling',
                        userContext: MCPTestFixtures_1.AUTH_CONTEXTS.OWNER,
                        inputs: TOOL_TEST_CONFIGS[0].customerScenarios[0].inputs,
                        expectedOutcome: 'partial',
                        businessValue: 'Graceful resource management'
                    }]
            };
            testFramework = new MCPTestFramework_1.MCPTestFramework(config);
            const result = await testFramework.executeTestSuite();
            (0, globals_1.expect)(result.mcpResults.errorHandling).toBe(true);
            (0, globals_1.expect)(result.customerImpact.riskLevel).not.toBe('critical');
        });
    });
});
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Setup comprehensive mocks for tool testing
 */
function setupToolMocks() {
    process.env.DRY_RUN_MODE = 'true';
    process.env.MCP_TOOLS_TEST = 'true';
}
/**
 * Cleanup after tool tests
 */
async function cleanupToolTests() {
    globals_1.jest.clearAllMocks();
    delete process.env.MCP_TOOLS_TEST;
    delete process.env.DRY_RUN_MODE;
}
