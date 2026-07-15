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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';

// Import our MCP implementations
import { registerPipelineTools } from './tools/pipeline-tools';
import { registerAnalysisTools } from './tools/analysis-tools';
import { registerIntelligenceTools } from './tools/intelligence-tools';
import { registerEnterpriseTools } from './tools/enterprise-tools';
import { registerLspTools } from './tools/lsp-tools';
import { registerObservabilityTools } from './tools/observability-tools';
import { registerPipelineResources } from './resources/pipeline-resources';
import { registerIntelligenceResources } from './resources/intelligence-resources';
import { registerOrganizationResources } from './resources/organization-resources';
import { registerWorkflowPrompts } from './prompts/workflow-prompts';
import { registerAnalysisPrompts } from './prompts/analysis-prompts';
import { registerDevelopmentPrompts } from './prompts/development-prompts';
import { authenticateMCPRequest } from './auth/middleware';
import { enforceResourceLimits } from './middleware/resource-limits';
import { 
  RateLimiter, 
  CircuitBreaker, 
  DEFAULT_RATE_LIMITS, 
  DEFAULT_CIRCUIT_BREAKERS
} from './middleware/rate-limit';
import { prepareLocalRepository } from './local-repository/handler';
import { LRUCache, TTLCache } from './caching-utilities/lru-cache';
import { productionMonitor } from './monitoring/alerts';
import { GracefulShutdownManager } from './shutdown/graceful-shutdown';
import * as fs from 'fs';
import * as path from 'path';
import type { MCPAuthContext } from './types';
import type { RepositoryContext } from './types';

/**
 * Bitcode MCP Server Configuration
 */
interface BitcodeMCPServerConfig {
  name: string;
  version: string;
  description: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    streaming: boolean;
  };
  authentication: {
    required: boolean;
    methods: Array<'api_key' | 'session'>;
  };
  observability: {
    enabled: boolean;
    metrics: boolean;
    tracing: boolean;
  };
}

/**
 * Default server configuration
 */
const DEFAULT_CONFIG: BitcodeMCPServerConfig = {
  name: 'bitcode-market-infrastructure',
  version: '1.0.0',
  description:
    'Bitcode Exchange-facing MCP interface for read measurement, activity continuation, repository workflows, and asset-pack outputs',
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

function readAuthorizationMeta(meta: unknown): string | undefined {
  if (meta && typeof meta === 'object' && 'authorization' in meta) {
    const authorization = (meta as { authorization?: unknown }).authorization;
    return typeof authorization === 'string' ? authorization : undefined;
  }
  return undefined;
}

/**
 * Bitcode MCP Server Class
 */
export class BitcodeMCPServer {
  private server: Server;
  private config: BitcodeMCPServerConfig;
  private authContextCache: TTLCache<string, MCPAuthContext>;
  private shutdownManager?: GracefulShutdownManager;
  private productionConfig?: any;
  private isAcceptingRequests = true;
  
  // Rate limiters
  private rateLimiters = {
    user: new RateLimiter(DEFAULT_RATE_LIMITS.user),
    organization: new RateLimiter(DEFAULT_RATE_LIMITS.organization),
    pipelineCreation: new RateLimiter(DEFAULT_RATE_LIMITS.pipelineCreation)
  };
  
  // Circuit breakers
  private circuitBreakers = {
    externalApi: new CircuitBreaker('external-api', DEFAULT_CIRCUIT_BREAKERS.externalApi),
    database: new CircuitBreaker('database', DEFAULT_CIRCUIT_BREAKERS.database),
    pipeline: new CircuitBreaker('pipeline', DEFAULT_CIRCUIT_BREAKERS.pipeline)
  };

  constructor(config: Partial<BitcodeMCPServerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
      },
      {
        capabilities: {
          tools: this.config.capabilities.tools ? {} : undefined,
          resources: this.config.capabilities.resources ? {} : undefined,
          prompts: this.config.capabilities.prompts ? {} : undefined,
        },
      }
    );
    
    // Load production config if available
    this.loadProductionConfig();
    
    // Initialize auth cache with config values
    const cacheConfig = this.productionConfig?.cache?.memory || {};
    this.authContextCache = new TTLCache<string, MCPAuthContext>(
      cacheConfig.maxSize || 10000,
      cacheConfig.ttl || 5 * 60 * 1000
    );
    
    // Initialize shutdown manager
    this.shutdownManager = new GracefulShutdownManager(
      this,
      this.productionConfig?.shutdown
    );

    this.setupErrorHandling();
    this.registerHandlers();
    
    if (this.config.observability.enabled) {
      this.setupObservability();
    }
  }

  /**
   * Load production configuration
   */
  private loadProductionConfig(): void {
    const env = process.env.NODE_ENV || 'development';
    const configPath = path.join(__dirname, '..', 'config', `${env}.json`);
    
    try {
      if (fs.existsSync(configPath)) {
        this.productionConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        logger.info('Loaded production configuration', { env, configPath });
      }
    } catch (error) {
      logger.warn('Failed to load production config', { error, configPath });
    }
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error('MCP Server error', { error: error.message, stack: error.stack });
      
      if (this.config.observability.enabled) {
        observability.recordError('mcp_server_error', error);
      }
    };

    // Shutdown manager handles process signals
  }

  /**
   * Setup observability and monitoring
   */
  private setupObservability(): void {
    // Initialize OpenTelemetry tracing
    observability.init({
      serviceName: 'bitcode-mcp-server',
      version: this.config.version,
      environment: process.env.NODE_ENV || 'development'
    });

    logger.info('MCP Server observability initialized', {
      serviceName: 'bitcode-mcp-server',
      version: this.config.version,
      capabilities: this.config.capabilities
    });
  }

  /**
   * Authenticate and authorize MCP request
   */
  private async authenticateRequest(
    authHeader?: string,
    requiredPermissions?: any
  ): Promise<{ success: boolean; context?: MCPAuthContext; error?: any }> {
    if (!this.config.authentication.required) {
      // Return a default context for development/testing
      return {
        success: true,
        context: {
          userId: 'dev-user',
          role: 'owner',
          permissions: {
            pipelines: { create: true, read: true, cancel: true, retry: true },
            organization: { manageMembers: true, viewAnalytics: true, manageBtdHoldings: true },
            resources: { read: true, export: true }
          },
          btdBalance: 10000,
          mcpCredentials: {}
        } as MCPAuthContext
      };
    }

    // Check cache first
    const cacheKey = authHeader || 'session';
    const cached = this.authContextCache.get(cacheKey);
    if (cached) {
      return { success: true, context: cached };
    }

    // Authenticate request
    const authResult = await authenticateMCPRequest(authHeader, requiredPermissions);
    
    if (authResult.success && authResult.context) {
      // Cache successful authentication
      this.authContextCache.set(cacheKey, authResult.context);
    }

    return authResult;
  }

  /**
   * Register all MCP handlers
   */
  private registerHandlers(): void {
    this.registerToolHandlers();
    this.registerResourceHandlers();
    this.registerPromptHandlers();
  }

  /**
   * Execute tool with validation
   */
  private async executeToolWithValidation(
    tool: any,
    args: any,
    context: MCPAuthContext
  ): Promise<any> {
    if (!tool || !tool.execute) {
      throw new Error(`Tool not found or not executable`);
    }
    
    // Validate args against schema if available
    if (tool.inputSchema) {
      const validationResult = tool.inputSchema.safeParse(args);
      if (!validationResult.success) {
        const errors = validationResult.error.errors
          .map((e: { path: Array<string | number>; message: string }) => `${e.path.join('.')}: ${e.message}`)
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
  private registerToolHandlers(): void {
    if (!this.config.capabilities.tools) return;

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];
      const failedCategories: string[] = [];
      
      // Safely register each tool category
      const toolCategories = [
        { name: 'pipeline', register: registerPipelineTools },
        { name: 'analysis', register: registerAnalysisTools },
        { name: 'intelligence', register: registerIntelligenceTools },
        { name: 'enterprise', register: registerEnterpriseTools },
        { name: 'lsp', register: registerLspTools },
        { name: 'observability', register: registerObservabilityTools }
      ];
      
      for (const category of toolCategories) {
        try {
          const categoryTools = category.register();
          tools.push(...categoryTools);
        } catch (error) {
          logger.error(`Failed to register ${category.name} tools`, {
            error: error instanceof Error ? error.message : error
          });
          failedCategories.push(category.name);
        }
      }
      
      if (failedCategories.length > 0) {
        logger.warn('Some tool categories failed to register', { 
          failed: failedCategories,
          successfulTools: tools.length 
        });
      }
      
      logger.info('Listed MCP tools', { 
        count: tools.length,
        failedCategories: failedCategories.length 
      });
      
      return { tools };
    });

    // Execute tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const authHeader = readAuthorizationMeta(request.params?._meta);

      logger.info('MCP tool call received', { tool: name, args: Object.keys(args || {}) });

      // Authenticate request
      const auth = await this.authenticateRequest(authHeader, {
        requiredPermissions: { pipelines: ['create'] },
      });
      if (!auth.success) {
        throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
      }

      const startTime = Date.now();
      let result: any;
      let error: any;

      try {
        // Apply rate limiting
        const rateLimitCheck = await this.rateLimiters.user.checkLimit(auth.context!);
        if (!rateLimitCheck.allowed) {
          throw new Error(`Rate limit exceeded. Retry after ${rateLimitCheck.resetAt}`);
        }
        
        // Special rate limit for pipeline creation
        if (name.includes('/create') || name.includes('/analyze')) {
          const pipelineRateLimit = await this.rateLimiters.pipelineCreation.checkLimit(auth.context!);
          if (!pipelineRateLimit.allowed) {
            throw new Error(`Pipeline creation rate limit exceeded. Retry after ${pipelineRateLimit.resetAt}`);
          }
        }
        
        // Execute with resource limits and circuit breaker
        result = await this.circuitBreakers.pipeline.execute(async () => {
          return await enforceResourceLimits(
            async () => {
              // Handle local repository preparation if needed
              const repository = (args?.repository || null) as RepositoryContext | null;
              if (repository?.provider === 'local') {
                const localPrep = await prepareLocalRepository(repository);
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
                { prefix: 'bitcode://pipelines/', register: registerPipelineTools },
                { prefix: 'bitcode://analysis/', register: registerAnalysisTools },
                { prefix: 'bitcode://intelligence/', register: registerIntelligenceTools },
                { prefix: 'bitcode://enterprise/', register: registerEnterpriseTools },
                { prefix: 'bitcode://lsp/', register: registerLspTools },
                { prefix: 'bitcode://observability/', register: registerObservabilityTools }
              ];
              
              let toolExecuted = false;
              
              for (const route of toolRoutes) {
                if (name.startsWith(route.prefix)) {
                  try {
                    const tools = route.register();
                    const tool = tools.find(t => t.name === name);
                    if (tool) {
                      result = await this.executeToolWithValidation(tool, args, auth.context!);
                      toolExecuted = true;
                      break;
                    }
                  } catch (error) {
                    logger.error(`Failed to execute tool from ${route.prefix}`, { 
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
            },
            auth.context!,
            `tool-${name}-${Date.now()}`
          );
        });

        const duration = Date.now() - startTime;
        logger.info('MCP tool execution completed', { 
          tool: name, 
          duration,
          userId: auth.context?.userId 
        });

        if (this.config.observability.metrics) {
          observability.recordMetric('mcp_tool_execution', {
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
      } catch (err) {
        error = err;
        const duration = Date.now() - startTime;
        
        logger.error('MCP tool execution failed', { 
          tool: name, 
          error: err instanceof Error ? err.message : String(err),
          duration,
          userId: auth.context?.userId 
        });

        if (this.config.observability.metrics) {
          observability.recordMetric('mcp_tool_execution', {
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
  private registerResourceHandlers(): void {
    if (!this.config.capabilities.resources) return;

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = [
        ...registerPipelineResources(),
        ...registerIntelligenceResources(),
        ...registerOrganizationResources()
      ];

      logger.info('Listed MCP resources', { count: resources.length });
      return { resources };
    });

    // List resource templates
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
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
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      const authHeader = readAuthorizationMeta(request.params?._meta);

      logger.info('MCP resource read requested', { uri });

      // Authenticate request
      const auth = await this.authenticateRequest(authHeader, { resources: ['read'] });
      if (!auth.success) {
        throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
      }

      try {
        let content: any;

        if (uri.startsWith('bitcode://resources/pipelines/')) {
          const pipelineResources = registerPipelineResources();
          const resource = pipelineResources.find(r => r.uri === uri || uri.match(r.uri));
          if (!resource || !resource.read) {
            throw new Error(`Pipeline resource '${uri}' not found or not readable`);
          }
          content = await resource.read(uri, auth.context!);
        } else if (uri.startsWith('bitcode://resources/intelligence/')) {
          const intelligenceResources = registerIntelligenceResources();
          const resource = intelligenceResources.find(r => r.uri === uri || uri.match(r.uri));
          if (!resource || !resource.read) {
            throw new Error(`Intelligence resource '${uri}' not found or not readable`);
          }
          content = await resource.read(uri, auth.context!);
        } else if (uri.startsWith('bitcode://resources/organizations/')) {
          const organizationResources = registerOrganizationResources();
          const resource = organizationResources.find(r => r.uri === uri || uri.match(r.uri));
          if (!resource || !resource.read) {
            throw new Error(`Organization resource '${uri}' not found or not readable`);
          }
          content = await resource.read(uri, auth.context!);
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }

        logger.info('MCP resource read completed', { 
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
      } catch (err) {
        logger.error('MCP resource read failed', { 
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
  private registerPromptHandlers(): void {
    if (!this.config.capabilities.prompts) return;

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      const prompts = [
        ...registerWorkflowPrompts(),
        ...registerAnalysisPrompts(),
        ...registerDevelopmentPrompts()
      ];

      logger.info('Listed MCP prompts', { count: prompts.length });
      return { prompts };
    });

    // Get prompt content
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const authHeader = readAuthorizationMeta(request.params?._meta);

      logger.info('MCP prompt requested', { prompt: name, args: Object.keys(args || {}) });

      // Authenticate request
      const auth = await this.authenticateRequest(authHeader);
      if (!auth.success) {
        throw new Error(`Authentication failed: ${auth.error?.message || 'Unknown error'}`);
      }

      try {
        let messages: any[];

        if (name.startsWith('bitcode://prompts/workflow/')) {
          const workflowPrompts = registerWorkflowPrompts();
          const prompt = workflowPrompts.find(p => p.name === name);
          if (!prompt || !prompt.getMessages) {
            throw new Error(`Workflow prompt '${name}' not found`);
          }
          messages = await prompt.getMessages(args || {});
        } else if (name.startsWith('bitcode://prompts/analysis/')) {
          const analysisPrompts = registerAnalysisPrompts();
          const prompt = analysisPrompts.find(p => p.name === name);
          if (!prompt || !prompt.getMessages) {
            throw new Error(`Analysis prompt '${name}' not found`);
          }
          messages = await prompt.getMessages(args || {});
        } else if (name.startsWith('bitcode://prompts/development/')) {
          const developmentPrompts = registerDevelopmentPrompts();
          const prompt = developmentPrompts.find(p => p.name === name);
          if (!prompt || !prompt.getMessages) {
            throw new Error(`Development prompt '${name}' not found`);
          }
          messages = await prompt.getMessages(args || {});
        } else {
          throw new Error(`Unknown prompt: ${name}`);
        }

        logger.info('MCP prompt generated', { 
          prompt: name,
          messageCount: messages.length,
          userId: auth.context?.userId 
        });

        return {
          description: `Generated prompt: ${name}`,
          messages
        };
      } catch (err) {
        logger.error('MCP prompt generation failed', { 
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
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    
    logger.info('Starting Bitcode MCP Server', {
      name: this.config.name,
      version: this.config.version,
      capabilities: this.config.capabilities,
      environment: process.env.NODE_ENV
    });

    // Start production monitoring
    if (this.productionConfig?.monitoring?.enabled) {
      productionMonitor.start();
      logger.info('Production monitoring started');
    }
    
    // Start streaming server if configured
    if (this.productionConfig?.streaming?.websocketPort) {
      const { streamManager } = await import('./streaming/pipeline-stream');
      streamManager.initializeWebSocketServer(
        this.productionConfig.streaming.websocketPort
      );
      logger.info('WebSocket streaming server started', {
        port: this.productionConfig.streaming.websocketPort
      });
    }

    await this.server.connect(transport);
    
    logger.info('Bitcode MCP Server started successfully');
  }

  /**
   * Stop accepting new requests
   */
  stopAcceptingRequests(): void {
    this.isAcceptingRequests = false;
  }
  
  /**
   * Get health status
   */
  async getHealthStatus(): Promise<any> {
    const { performHealthCheck } = await import('./health/health-check');
    return performHealthCheck(this.circuitBreakers);
  }
  
  /**
   * Get production monitor instance
   */
  getProductionMonitor(): any {
    return productionMonitor;
  }
  
  /**
   * Execute tool with resource limits
   */
  async executeToolWithLimits(
    tool: any,
    args: any,
    context: MCPAuthContext,
    limits?: any
  ): Promise<any> {
    return enforceResourceLimits(
      () => this.executeToolWithValidation(tool, args, context),
      context,
      `tool-exec-${Date.now()}`,
      limits
    );
  }
  
  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Clean up auth cache
    this.authContextCache.destroy();
    this.shutdownManager?.dispose();
    
    // Stop monitoring
    productionMonitor.stop();
    
    // Close streaming connections
    const { streamManager } = await import('./streaming/pipeline-stream');
    streamManager.shutdown();
  }

  /**
   * Shutdown the MCP server
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Bitcode MCP Server');
    
    // Clean up auth cache
    this.authContextCache.destroy();
    this.shutdownManager?.dispose();
    
    // Stop monitoring
    productionMonitor.stop();

    // Close streaming connections and stop the retained singleton intervals.
    const { streamManager } = await import('./streaming/pipeline-stream');
    streamManager.shutdown();
    
    // Close server connection
    await this.server.close();
    
    logger.info('Bitcode MCP Server shutdown complete');
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new BitcodeMCPServer();
  
  // Start the server
  server.start().catch((error) => {
    logger.error('Failed to start MCP server', { error });
    process.exit(1);
  });
}

// Export for testing without creating a long-lived timer on module import.
export const authCache = new LRUCache<string, MCPAuthContext>(10000);
