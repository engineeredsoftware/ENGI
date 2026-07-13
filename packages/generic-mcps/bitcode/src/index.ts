/**
 * Bitcode MCP Server - Main Entry Point with ORM Integration
 *
 * Bitcode Exchange-facing MCP interface surface exposed through Model Context
 * Protocol. Admits read measurement, repository operations, activity
 * continuation, and retained execution families through one machine interface.
 * Now integrated with ORM for database-backed operations.
 * 
 * @doc-code
 * type: entry
 * category: server
 * pattern: orm-integration
 */

import { BitcodeMCPServer } from './server';
import { logger } from '@bitcode/logger';

// Export the server class for programmatic usage
export { BitcodeMCPServer };

// Export types for external consumption (no barrel re-exports)
export {
  // core auth/context/types
  type MCPAuthContext,
  // repository and attachments
  RepositoryContextSchema,
  type RepositoryContext,
  AttachmentSchema,
  type Attachment,
  // pipeline/result/status and streaming events
  PipelineStatus,
  type PipelineStreamEvent,
  // tool schemas (supported pipelines only)
  BasePipelineToolSchema,
  AssetPackPipelineToolSchema,
  // filters and configs
  PipelineHistoryFilterSchema,
  IntelligenceSynthesisConfigSchema,
  // prompt template
  type PromptTemplate,
  // pipeline name union used within MCP
  PipelineNameValues,
  type PipelineName
} from './types';

// Export middleware for custom implementations
export { enforceResourceLimits, createResourceLimitedExecutor } from './middleware/resource-limits';
export { RateLimiter, CircuitBreaker } from './middleware/rate-limit';
export { SandboxedFileSystem, validateLocalPath } from './local-repository/handler';
export { buildMcpInterfaceIntegrationRecord } from './interface-integration';

// Export health check utilities
export { performHealthCheck, isReady, isAlive } from './health/health-check';

// Export ORM-based pipeline execution utilities
export { 
  queuePipelineJob, 
  monitorPipelineExecution, 
  cancelPipelineExecution,
  getPipelineMetrics,
  type PipelineJobOptions,
  type PipelineExecutionResult
} from './pipeline-execution/adapter';

// Export ORM-based authentication middleware
export {
  authenticateMCPRequest,
  createMCPAuthMiddleware,
  type AuthResult,
  type MCPAuthOptions
} from './auth/middleware';

/**
 * Create and start MCP server with production configuration
 */
export async function createServer(config?: Partial<any>) {
  const server = new BitcodeMCPServer(config);
  
  // Set up graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`);
    try {
      await server.shutdown();
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err });
      process.exit(1);
    }
  };
  
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  
  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
  });
  
  return server;
}

/**
 * Start server if run directly
 */
if (require.main === module) {
  (async () => {
    try {
      logger.info('Starting Bitcode MCP Server...');
      
      const server = await createServer();
      await server.start();
      
      logger.info('Bitcode MCP Server is running', {
        version: process.env.npm_package_version || '1.0.0',
        node: process.version,
        environment: process.env.NODE_ENV || 'development'
      });
      
    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  })();
}
