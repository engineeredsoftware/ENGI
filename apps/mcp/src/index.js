"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMCPAuthMiddleware = exports.authenticateMCPRequest = exports.getPipelineMetrics = exports.cancelPipelineExecution = exports.monitorPipelineExecution = exports.queuePipelineJob = exports.isAlive = exports.isReady = exports.performHealthCheck = exports.validateLocalPath = exports.SandboxedFileSystem = exports.CircuitBreaker = exports.RateLimiter = exports.createResourceLimitedExecutor = exports.enforceResourceLimits = exports.PipelineNameValues = exports.IntelligenceSynthesisConfigSchema = exports.PipelineHistoryFilterSchema = exports.AssetPackPipelineToolSchema = exports.BasePipelineToolSchema = exports.PipelineStatus = exports.AttachmentSchema = exports.RepositoryContextSchema = exports.BitcodeMCPServer = void 0;
exports.createServer = createServer;
const server_1 = require("./server");
Object.defineProperty(exports, "BitcodeMCPServer", { enumerable: true, get: function () { return server_1.BitcodeMCPServer; } });
const logger_1 = require("@bitcode/logger");
// Export types for external consumption (no barrel re-exports)
var types_1 = require("./types");
// repository and attachments
Object.defineProperty(exports, "RepositoryContextSchema", { enumerable: true, get: function () { return types_1.RepositoryContextSchema; } });
Object.defineProperty(exports, "AttachmentSchema", { enumerable: true, get: function () { return types_1.AttachmentSchema; } });
// pipeline/result/status and streaming events
Object.defineProperty(exports, "PipelineStatus", { enumerable: true, get: function () { return types_1.PipelineStatus; } });
// tool schemas (supported pipelines only)
Object.defineProperty(exports, "BasePipelineToolSchema", { enumerable: true, get: function () { return types_1.BasePipelineToolSchema; } });
Object.defineProperty(exports, "AssetPackPipelineToolSchema", { enumerable: true, get: function () { return types_1.AssetPackPipelineToolSchema; } });
// filters and configs
Object.defineProperty(exports, "PipelineHistoryFilterSchema", { enumerable: true, get: function () { return types_1.PipelineHistoryFilterSchema; } });
Object.defineProperty(exports, "IntelligenceSynthesisConfigSchema", { enumerable: true, get: function () { return types_1.IntelligenceSynthesisConfigSchema; } });
// pipeline name union used within MCP
Object.defineProperty(exports, "PipelineNameValues", { enumerable: true, get: function () { return types_1.PipelineNameValues; } });
// Export middleware for custom implementations
var resource_limits_1 = require("./middleware/resource-limits");
Object.defineProperty(exports, "enforceResourceLimits", { enumerable: true, get: function () { return resource_limits_1.enforceResourceLimits; } });
Object.defineProperty(exports, "createResourceLimitedExecutor", { enumerable: true, get: function () { return resource_limits_1.createResourceLimitedExecutor; } });
var rate_limit_1 = require("./middleware/rate-limit");
Object.defineProperty(exports, "RateLimiter", { enumerable: true, get: function () { return rate_limit_1.RateLimiter; } });
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return rate_limit_1.CircuitBreaker; } });
var handler_1 = require("./local-repository/handler");
Object.defineProperty(exports, "SandboxedFileSystem", { enumerable: true, get: function () { return handler_1.SandboxedFileSystem; } });
Object.defineProperty(exports, "validateLocalPath", { enumerable: true, get: function () { return handler_1.validateLocalPath; } });
// Export health check utilities
var health_check_1 = require("./health/health-check");
Object.defineProperty(exports, "performHealthCheck", { enumerable: true, get: function () { return health_check_1.performHealthCheck; } });
Object.defineProperty(exports, "isReady", { enumerable: true, get: function () { return health_check_1.isReady; } });
Object.defineProperty(exports, "isAlive", { enumerable: true, get: function () { return health_check_1.isAlive; } });
// Export ORM-based pipeline execution utilities
var adapter_1 = require("./pipeline-execution/adapter");
Object.defineProperty(exports, "queuePipelineJob", { enumerable: true, get: function () { return adapter_1.queuePipelineJob; } });
Object.defineProperty(exports, "monitorPipelineExecution", { enumerable: true, get: function () { return adapter_1.monitorPipelineExecution; } });
Object.defineProperty(exports, "cancelPipelineExecution", { enumerable: true, get: function () { return adapter_1.cancelPipelineExecution; } });
Object.defineProperty(exports, "getPipelineMetrics", { enumerable: true, get: function () { return adapter_1.getPipelineMetrics; } });
// Export ORM-based authentication middleware
var middleware_1 = require("./auth/middleware");
Object.defineProperty(exports, "authenticateMCPRequest", { enumerable: true, get: function () { return middleware_1.authenticateMCPRequest; } });
Object.defineProperty(exports, "createMCPAuthMiddleware", { enumerable: true, get: function () { return middleware_1.createMCPAuthMiddleware; } });
/**
 * Create and start MCP server with production configuration
 */
async function createServer(config) {
    const server = new server_1.BitcodeMCPServer(config);
    // Set up graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger_1.logger.info(`Received ${signal}, starting graceful shutdown`);
        try {
            await server.shutdown();
            process.exit(0);
        }
        catch (err) {
            logger_1.logger.error('Error during shutdown', { error: err });
            process.exit(1);
        }
    };
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.logger.error('Unhandled rejection', { reason, promise });
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
            logger_1.logger.info('Starting Bitcode MCP Server...');
            const server = await createServer();
            await server.start();
            logger_1.logger.info('Bitcode MCP Server is running', {
                version: process.env.npm_package_version || '1.0.0',
                node: process.version,
                environment: process.env.NODE_ENV || 'development'
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to start server', { error });
            process.exit(1);
        }
    })();
}
