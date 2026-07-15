"use strict";
/**
 * Bitcode MCP Server - Bitcode Exchange interface over Model Context Protocol
 *
 * A Model Context Protocol server that exposes one Bitcode Exchange interface
 * surface for read measurement, repository operations, activity continuation,
 * and asset-pack/output workflows defined by the Bitcode Protocol.
 * Now fully integrated with ORM for all database operations.
 *
 * @doc-code
 * type: server
 * category: core
 * pattern: orm-integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCache = exports.BitcodeMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const logger_1 = require("@bitcode/logger");
const observability_1 = require("@bitcode/observability");
// Import our MCP implementations
const pipeline_tools_1 = require("./tools/pipeline-tools");
const analysis_tools_1 = require("./tools/analysis-tools");
const intelligence_tools_1 = require("./tools/intelligence-tools");
const enterprise_tools_1 = require("./tools/enterprise-tools");
const lsp_tools_1 = require("./tools/lsp-tools");
const observability_tools_1 = require("./tools/observability-tools");
const pipeline_resources_1 = require("./resources/pipeline-resources");
const intelligence_resources_1 = require("./resources/intelligence-resources");
const organization_resources_1 = require("./resources/organization-resources");
const workflow_prompts_1 = require("./prompts/workflow-prompts");
const analysis_prompts_1 = require("./prompts/analysis-prompts");
const development_prompts_1 = require("./prompts/development-prompts");
const middleware_1 = require("./auth/middleware");
const resource_limits_1 = require("./middleware/resource-limits");
const rate_limit_1 = require("./middleware/rate-limit");
const handler_1 = require("./local-repository/handler");
const lru_cache_1 = require("./caching-utilities/lru-cache");
const alerts_1 = require("./monitoring/alerts");
const graceful_shutdown_1 = require("./shutdown/graceful-shutdown");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Default server configuration
 */
const DEFAULT_CONFIG = {
    name: 'bitcode-market-infrastructure',
    version: '1.0.0',
    description: 'Bitcode Exchange-facing MCP interface for read measurement, activity continuation, repository workflows, and asset-pack outputs',
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
    observability: {
        enabled: true,
        metrics: true,
        tracing: true
    }
};
function readAuthorizationMeta(meta) {
    if (meta && typeof meta === 'object' && 'authorization' in meta) {
        const authorization = meta.authorization;
        return typeof authorization === 'string' ? authorization : undefined;
    }
    return undefined;
}
/**
 * Bitcode MCP Server Class
 */
class BitcodeMCPServer {
    constructor(config = {}) {
        this.isAcceptingRequests = true;
        // Rate limiters
        this.rateLimiters = {
            user: new rate_limit_1.RateLimiter(rate_limit_1.DEFAULT_RATE_LIMITS.user),
            organization: new rate_limit_1.RateLimiter(rate_limit_1.DEFAULT_RATE_LIMITS.organization),
            pipelineCreation: new rate_limit_1.RateLimiter(rate_limit_1.DEFAULT_RATE_LIMITS.pipelineCreation)
        };
        // Circuit breakers
        this.circuitBreakers = {
            externalApi: new rate_limit_1.CircuitBreaker('external-api', rate_limit_1.DEFAULT_CIRCUIT_BREAKERS.externalApi),
            database: new rate_limit_1.CircuitBreaker('database', rate_limit_1.DEFAULT_CIRCUIT_BREAKERS.database),
            pipeline: new rate_limit_1.CircuitBreaker('pipeline', rate_limit_1.DEFAULT_CIRCUIT_BREAKERS.pipeline)
        };
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.server = new index_js_1.Server({
            name: this.config.name,
            version: this.config.version
  }, {
            capabilities: {
                tools: this.config.capabilities.tools ? {} : undefined,
                resources: this.config.capabilities.resources ? {} : undefined,
                prompts: this.config.capabilities.prompts ? {} : undefined
  }
  });
        // Load production config if available
        this.loadProductionConfig();
        // Initialize auth cache with config values
        const cacheConfig = this.productionConfig?.cache?.memory || {};
        this.authContextCache = new lru_cache_1.TTLCache(cacheConfig.maxSize || 10000, cacheConfig.ttl || 5 * 60 * 1000);
        // Initialize shutdown manager
        this.shutdownManager = new graceful_shutdown_1.GracefulShutdownManager(this, this.productionConfig?.shutdown);
        this.setupErrorHandling();
        this.registerHandlers();
        if (this.config.observability.enabled) {
            this.setupObservability();
        }
    }
    /**
     * Load production configuration
     */
    loadProductionConfig() {
        const env = process.env.NODE_ENV || 'development';
        const configPath = path.join(__dirname, '..', 'config', `${env}.json`);
        try {
            if (fs.existsSync(configPath)) {
                this.productionConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                logger_1.logger.info('Loaded production configuration', { env, configPath });
            }
        }
        catch (error) {
            logger_1.logger.warn('Failed to load production config', { error, configPath });
        }
    }
    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        this.server.onerror = (error) => {
            logger_1.logger.error('MCP Server error', { error: error.message, stack: error.stack });
            if (this.config.observability.enabled) {
                observability_1.observability.recordError('mcp_server_error', error);
            }
        };
        // Shutdown manager handles process signals
    }
    /**
     * Setup observability and monitoring
     */
    setupObservability() {
        // Initialize OpenTelemetry tracing
        observability_1.observability.init({
            serviceName: 'bitcode-mcp-server',
            version: this.config.version,
            environment: process.env.NODE_ENV || 'development'
        });
        logger_1.logger.info('MCP Server observability initialized', {
            serviceName: 'bitcode-mcp-server',
            version: this.config.version,
            capabilities: this.config.capabilities
        });
    }
    /**
     * Authenticate and authorize MCP request
     */
    async authenticateRequest(authHeader, requiredPermissions) {
        if (!this.config.authentication.required) {
            // Return a default context for development/testing
            return {
                success: true,
                context: {
                    userId: 'dev-user',
                    role: 'owner',
                    permissions: {
                        pipelines: { create: true, read: true, cancel: true, retry: true },
                        organization: { manageMembers: true, viewAnalytics: true, manageBtd: true },
                        resources: { read: true, export: true }
                    },
                    btdBalance: 10000,
                    mcpCredentials: {}
                }
            };
        }
        // Check cache first
        const cacheKey = authHeader || 'session';
        const cached = this.authContextCache.get(cacheKey);
        if (cached) {
            return { success: true, context: cached };
        }
        // Authenticate request
        const authResult = await (0, middleware_1.authenticateMCPRequest)(authHeader, requiredPermissions);
        if (authResult.success && authResult.context) {
            // Cache successful authentication
            this.authContextCache.set(cacheKey, authResult.context);
        }
        return authResult;
    }
    /**
     * Register all MCP handlers
     */
    registerHandlers() {
        this.registerToolHandlers();
        this.registerResourceHandlers();
        this.registerPromptHandlers();
    }
    /**
     * Execute tool with validation
     */
    async executeToolWithValidation(tool, args, context) {
        if (!tool || !tool.execute) {
            throw new Error(`Tool not found or not executable`);
        }
        // Validate args against schema if available
        if (tool.inputSchema) {
            const validationResult = tool.inputSchema.safeParse(args);
            if (!validationResult.success) {
                const errors = validationResult.error.errors
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', ');
                throw new Error(`Invalid arguments: ${errors}`);
            }
            return tool.execute(validationResult.data, context);
        }
        // No schema, execute directly
        return tool.execute(args, context);
    }
    /**
     * Register tool handlers
     */
    registerToolHandlers() {
        if (!this.config.capabilities.tools)
            return;
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            const tools = [];
            const failedCategories = [];
            // Safely register each tool category
            const toolCategories = [
                { name: 'pipeline', register: pipeline_tools_1.registerPipelineTools },
                { name: 'analysis', register: analysis_tools_1.registerAnalysisTools },
                { name: 'intelligence', register: intelligence_tools_1.registerIntelligenceTools },
                { name: 'enterprise', register: enterprise_tools_1.registerEnterpriseTools },
                { name: 'lsp', register: lsp_tools_1.registerLspTools },
                { name: 'observability', register: observability_tools_1.registerObservabilityTools }
            ];
            for (const category of toolCategories) {
                try {
                    const categoryTools = category.register();
                    tools.push(...categoryTools);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to register ${category.name} tools`, {
                        error: error instanceof Error ? error.message : error
                    });
                    failedCategories.push(category.name);
                }
            }
            if (failedCategories.length > 0) {
                logger_1.logger.warn('Some tool categories failed to register', {
                    failed: failedCategories,
                    successfulTools: tools.length
                });
            }
            logger_1.logger.info('Listed MCP tools', {
                count: tools.length,
                failedCategories: failedCategories.length
            });
            return { tools };
        });
        // Execute tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const authHeader = readAuthorizationMeta(request.params?._meta);
            logger_1.logger.info('MCP tool call received', { tool: name, args: Object.keys(args || {}) });
            // Authenticate request
            const auth = await this.authenticateRequest(authHeader, { pipelines: ['create'] });
            if (!auth.success) {
                throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
            }
            const startTime = Date.now();
            let result;
            let error;
            try {
                // Apply rate limiting
                const rateLimitCheck = await this.rateLimiters.user.checkLimit(auth.context);
                if (!rateLimitCheck.allowed) {
                    throw new Error(`Rate limit exceeded. Retry after ${rateLimitCheck.resetAt}`);
                }
                // Special rate limit for pipeline creation
                if (name.includes('/create') || name.includes('/analyze')) {
                    const pipelineRateLimit = await this.rateLimiters.pipelineCreation.checkLimit(auth.context);
                    if (!pipelineRateLimit.allowed) {
                        throw new Error(`Pipeline creation rate limit exceeded. Retry after ${pipelineRateLimit.resetAt}`);
                    }
                }
                // Execute with resource limits and circuit breaker
                result = await this.circuitBreakers.pipeline.execute(async () => {
                    return await (0, resource_limits_1.enforceResourceLimits)(async () => {
                        // Handle local repository preparation if needed
                        const repository = (args?.repository || null);
                        if (repository?.provider === 'local') {
                            const localPrep = await (0, handler_1.prepareLocalRepository)(repository);
                            if (!localPrep.success) {
                                throw new Error(`Local repository preparation failed: ${localPrep.error}`);
                            }
                            // Update args with prepared local path
                            repository.metadata = {
                                ...repository.metadata,
                                ...localPrep.metadata
                            };
                        }
                        // Route tool execution based on name prefix
                        const toolRoutes = [
                            { prefix: 'bitcode://pipelines/', register: pipeline_tools_1.registerPipelineTools },
                            { prefix: 'bitcode://analysis/', register: analysis_tools_1.registerAnalysisTools },
                            { prefix: 'bitcode://intelligence/', register: intelligence_tools_1.registerIntelligenceTools },
                            { prefix: 'bitcode://enterprise/', register: enterprise_tools_1.registerEnterpriseTools },
                            { prefix: 'bitcode://lsp/', register: lsp_tools_1.registerLspTools },
                            { prefix: 'bitcode://observability/', register: observability_tools_1.registerObservabilityTools }
                        ];
                        let toolExecuted = false;
                        for (const route of toolRoutes) {
                            if (name.startsWith(route.prefix)) {
                                try {
                                    const tools = route.register();
                                    const tool = tools.find(t => t.name === name);
                                    if (tool) {
                                        result = await this.executeToolWithValidation(tool, args, auth.context);
                                        toolExecuted = true;
                                        break;
                                    }
                                }
                                catch (error) {
                                    logger_1.logger.error(`Failed to execute tool from ${route.prefix}`, {
                                        tool: name,
                                        error: error instanceof Error ? error.message : error
                                    });
                                    throw error;
                                }
                            }
                        }
                        if (!toolExecuted) {
                            throw new Error(`Unknown tool: ${name}`);
                        }
                        return result;
                    }, auth.context, `tool-${name}-${Date.now()}`);
                });
                const duration = Date.now() - startTime;
                logger_1.logger.info('MCP tool execution completed', {
                    tool: name,
                    duration,
                    userId: auth.context?.userId
                });
                if (this.config.observability.metrics) {
                    observability_1.observability.recordMetric('mcp_tool_execution', {
                        tool: name,
                        duration,
                        success: true,
                        userId: auth.context?.userId
                    });
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (err) {
                error = err;
                const duration = Date.now() - startTime;
                logger_1.logger.error('MCP tool execution failed', {
                    tool: name,
                    error: err instanceof Error ? err.message : String(err),
                    duration,
                    userId: auth.context?.userId
                });
                if (this.config.observability.metrics) {
                    observability_1.observability.recordMetric('mcp_tool_execution', {
                        tool: name,
                        duration,
                        success: false,
                        error: err instanceof Error ? err.message : String(err),
                        userId: auth.context?.userId
                    });
                }
                throw err;
            }
        });
    }
    /**
     * Register resource handlers
     */
    registerResourceHandlers() {
        if (!this.config.capabilities.resources)
            return;
        // List available resources
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
            const resources = [
                ...(0, pipeline_resources_1.registerPipelineResources)(),
                ...(0, intelligence_resources_1.registerIntelligenceResources)(),
                ...(0, organization_resources_1.registerOrganizationResources)()
            ];
            logger_1.logger.info('Listed MCP resources', { count: resources.length });
            return { resources };
        });
        // List resource templates
        this.server.setRequestHandler(types_js_1.ListResourceTemplatesRequestSchema, async () => {
            const resourceTemplates = [
                {
                    uriTemplate: 'bitcode://resources/pipelines/{id}',
                    name: 'Pipeline Details',
                    description: 'Detailed information about a specific pipeline execution'
                },
                {
                    uriTemplate: 'bitcode://resources/organizations/{id}/analytics',
                    name: 'Organization Analytics',
                    description: 'Analytics and insights for organization-level data'
                }
            ];
            return { resourceTemplates };
        });
        // Read resource content
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            const authHeader = readAuthorizationMeta(request.params?._meta);
            logger_1.logger.info('MCP resource read requested', { uri });
            // Authenticate request
            const auth = await this.authenticateRequest(authHeader, { resources: ['read'] });
            if (!auth.success) {
                throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
            }
            try {
                let content;
                if (uri.startsWith('bitcode://resources/pipelines/')) {
                    const pipelineResources = (0, pipeline_resources_1.registerPipelineResources)();
                    const resource = pipelineResources.find(r => r.uri === uri || uri.match(r.uri));
                    if (!resource || !resource.read) {
                        throw new Error(`Pipeline resource '${uri}' not found or not readable`);
                    }
                    content = await resource.read(uri, auth.context);
                }
                else if (uri.startsWith('bitcode://resources/intelligence/')) {
                    const intelligenceResources = (0, intelligence_resources_1.registerIntelligenceResources)();
                    const resource = intelligenceResources.find(r => r.uri === uri || uri.match(r.uri));
                    if (!resource || !resource.read) {
                        throw new Error(`Intelligence resource '${uri}' not found or not readable`);
                    }
                    content = await resource.read(uri, auth.context);
                }
                else if (uri.startsWith('bitcode://resources/organizations/')) {
                    const organizationResources = (0, organization_resources_1.registerOrganizationResources)();
                    const resource = organizationResources.find(r => r.uri === uri || uri.match(r.uri));
                    if (!resource || !resource.read) {
                        throw new Error(`Organization resource '${uri}' not found or not readable`);
                    }
                    content = await resource.read(uri, auth.context);
                }
                else {
                    throw new Error(`Unknown resource: ${uri}`);
                }
                logger_1.logger.info('MCP resource read completed', {
                    uri,
                    userId: auth.context?.userId
                });
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
                        }
                    ]
                };
            }
            catch (err) {
                logger_1.logger.error('MCP resource read failed', {
                    uri,
                    error: err instanceof Error ? err.message : String(err),
                    userId: auth.context?.userId
                });
                throw err;
            }
        });
    }
    /**
     * Register prompt handlers
     */
    registerPromptHandlers() {
        if (!this.config.capabilities.prompts)
            return;
        // List available prompts
        this.server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
            const prompts = [
                ...(0, workflow_prompts_1.registerWorkflowPrompts)(),
                ...(0, analysis_prompts_1.registerAnalysisPrompts)(),
                ...(0, development_prompts_1.registerDevelopmentPrompts)()
            ];
            logger_1.logger.info('Listed MCP prompts', { count: prompts.length });
            return { prompts };
        });
        // Get prompt content
        this.server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const authHeader = readAuthorizationMeta(request.params?._meta);
            logger_1.logger.info('MCP prompt requested', { prompt: name, args: Object.keys(args || {}) });
            // Authenticate request
            const auth = await this.authenticateRequest(authHeader);
            if (!auth.success) {
                throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
            }
            try {
                let messages;
                if (name.startsWith('bitcode://prompts/workflow/')) {
                    const workflowPrompts = (0, workflow_prompts_1.registerWorkflowPrompts)();
                    const prompt = workflowPrompts.find(p => p.name === name);
                    if (!prompt || !prompt.getMessages) {
                        throw new Error(`Workflow prompt '${name}' not found`);
                    }
                    messages = await prompt.getMessages(args || {});
                }
                else if (name.startsWith('bitcode://prompts/analysis/')) {
                    const analysisPrompts = (0, analysis_prompts_1.registerAnalysisPrompts)();
                    const prompt = analysisPrompts.find(p => p.name === name);
                    if (!prompt || !prompt.getMessages) {
                        throw new Error(`Analysis prompt '${name}' not found`);
                    }
                    messages = await prompt.getMessages(args || {});
                }
                else if (name.startsWith('bitcode://prompts/development/')) {
                    const developmentPrompts = (0, development_prompts_1.registerDevelopmentPrompts)();
                    const prompt = developmentPrompts.find(p => p.name === name);
                    if (!prompt || !prompt.getMessages) {
                        throw new Error(`Development prompt '${name}' not found`);
                    }
                    messages = await prompt.getMessages(args || {});
                }
                else {
                    throw new Error(`Unknown prompt: ${name}`);
                }
                logger_1.logger.info('MCP prompt generated', {
                    prompt: name,
                    messageCount: messages.length,
                    userId: auth.context?.userId
                });
                return {
                    description: `Generated prompt: ${name}`,
                    messages
                };
            }
            catch (err) {
                logger_1.logger.error('MCP prompt generation failed', {
                    prompt: name,
                    error: err instanceof Error ? err.message : String(err),
                    userId: auth.context?.userId
                });
                throw err;
            }
        });
    }
    /**
     * Start the MCP server
     */
    async start() {
        const transport = new stdio_js_1.StdioServerTransport();
        logger_1.logger.info('Starting Bitcode MCP Server', {
            name: this.config.name,
            version: this.config.version,
            capabilities: this.config.capabilities,
            environment: process.env.NODE_ENV
        });
        // Start production monitoring
        if (this.productionConfig?.monitoring?.enabled) {
            alerts_1.productionMonitor.start();
            logger_1.logger.info('Production monitoring started');
        }
        // Start streaming server if configured
        if (this.productionConfig?.streaming?.websocketPort) {
            const { streamManager } = await Promise.resolve().then(() => __importStar(require('./streaming/pipeline-stream')));
            streamManager.initializeWebSocketServer(this.productionConfig.streaming.websocketPort);
            logger_1.logger.info('WebSocket streaming server started', {
                port: this.productionConfig.streaming.websocketPort
            });
        }
        await this.server.connect(transport);
        logger_1.logger.info('Bitcode MCP Server started successfully');
    }
    /**
     * Stop accepting new requests
     */
    stopAcceptingRequests() {
        this.isAcceptingRequests = false;
    }
    /**
     * Get health status
     */
    async getHealthStatus() {
        const { performHealthCheck } = await Promise.resolve().then(() => __importStar(require('./health/health-check')));
        return performHealthCheck(this.circuitBreakers);
    }
    /**
     * Get production monitor instance
     */
    getProductionMonitor() {
        return alerts_1.productionMonitor;
    }
    /**
     * Execute tool with resource limits
     */
    async executeToolWithLimits(tool, args, context, limits) {
        return (0, resource_limits_1.enforceResourceLimits)(() => this.executeToolWithValidation(tool, args, context), context, `tool-exec-${Date.now()}`, limits);
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        // Clean up auth cache
        this.authContextCache.destroy();
        this.shutdownManager?.dispose();
        // Stop monitoring
        alerts_1.productionMonitor.stop();
        // Close streaming connections
        const { streamManager } = await Promise.resolve().then(() => __importStar(require('./streaming/pipeline-stream')));
        streamManager.shutdown();
    }
    /**
     * Shutdown the MCP server
     */
    async shutdown() {
        logger_1.logger.info('Shutting down Bitcode MCP Server');
        // Clean up auth cache
        this.authContextCache.destroy();
        this.shutdownManager?.dispose();
        // Stop monitoring
        alerts_1.productionMonitor.stop();
        // Close streaming connections and stop the retained singleton intervals.
        const { streamManager } = await Promise.resolve().then(() => __importStar(require('./streaming/pipeline-stream')));
        streamManager.shutdown();
        // Close server connection
        await this.server.close();
        logger_1.logger.info('Bitcode MCP Server shutdown complete');
    }
}
exports.BitcodeMCPServer = BitcodeMCPServer;
// Start server if run directly
if (require.main === module) {
    const server = new BitcodeMCPServer();
    // Start the server
    server.start().catch((error) => {
        logger_1.logger.error('Failed to start MCP server', { error });
        process.exit(1);
    });
}
// Export for testing without creating a long-lived timer on module import.
exports.authCache = new lru_cache_1.LRUCache(10000);
