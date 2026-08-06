"use strict";
/**
 * Graceful Shutdown Handler for MCP Server
 *
 * Ensures clean shutdown with proper resource cleanup,
 * in-flight request completion, and state persistence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GracefulShutdownManager = exports.DEFAULT_SHUTDOWN_CONFIG = void 0;
exports.createShutdownMiddleware = createShutdownMiddleware;
const logger_1 = require("@bitcode/logger");
const observability_1 = require("@bitcode/observability");
const supabase_1 = require("@bitcode/supabase");
const pipeline_stream_1 = require("../streaming/pipeline-stream");
const alerts_1 = require("../monitoring/alerts");
/**
 * Default shutdown configuration
 */
exports.DEFAULT_SHUTDOWN_CONFIG = {
    gracePeriodMs: 30000, // 30 seconds
    forceShutdownMs: 60000, // 60 seconds
    persistState: true,
    notifyClients: true
};
/**
 * Graceful shutdown manager
 */
class GracefulShutdownManager {
    constructor(server, config = exports.DEFAULT_SHUTDOWN_CONFIG) {
        this.server = server;
        this.config = config;
        this.shuttingDown = false;
        this.activeRequests = new Set();
        this.handleSigterm = () => this.shutdown('SIGTERM');
        this.handleSigint = () => this.shutdown('SIGINT');
        this.handleUncaughtException = (error) => {
            logger_1.logger.error('Uncaught exception', { error });
            this.shutdown('uncaughtException', 1);
        };
        this.handleUnhandledRejection = (reason, promise) => {
            logger_1.logger.error('Unhandled rejection', { reason, promise });
            this.shutdown('unhandledRejection', 1);
        };
        this.setupSignalHandlers();
    }
    /**
     * Setup process signal handlers
     */
    setupSignalHandlers() {
        // Handle termination signals
        process.on('SIGTERM', this.handleSigterm);
        process.on('SIGINT', this.handleSigint);
        // Handle uncaught exceptions
        process.on('uncaughtException', this.handleUncaughtException);
        // Handle unhandled promise rejections
        process.on('unhandledRejection', this.handleUnhandledRejection);
    }
    /**
     * Remove installed process handlers so test-created managers do not leak
     * listeners across repeated retained MCP server construction.
     */
    dispose() {
        process.off('SIGTERM', this.handleSigterm);
        process.off('SIGINT', this.handleSigint);
        process.off('uncaughtException', this.handleUncaughtException);
        process.off('unhandledRejection', this.handleUnhandledRejection);
    }
    /**
     * Track active request
     */
    trackRequest(requestId) {
        this.activeRequests.add(requestId);
    }
    /**
     * Complete request
     */
    completeRequest(requestId) {
        this.activeRequests.delete(requestId);
    }
    /**
     * Get active request count
     */
    getActiveRequestCount() {
        return this.activeRequests.size;
    }
    /**
     * Initiate graceful shutdown
     */
    async shutdown(reason, exitCode = 0) {
        if (this.shuttingDown) {
            return this.shutdownPromise;
        }
        this.shuttingDown = true;
        logger_1.logger.info('Initiating graceful shutdown', {
            reason,
            activeRequests: this.activeRequests.size,
            config: this.config
        });
        // Record shutdown metric
        observability_1.observability.recordMetric('server_shutdown', {
            reason,
            activeRequests: this.activeRequests.size
        });
        // Start shutdown process
        this.shutdownPromise = this.performShutdown(exitCode);
        // Setup force shutdown timer
        this.forceShutdownTimer = setTimeout(() => {
            logger_1.logger.error('Force shutdown triggered', {
                activeRequests: this.activeRequests.size
            });
            process.exit(exitCode);
        }, this.config.forceShutdownMs);
        return this.shutdownPromise;
    }
    /**
     * Perform shutdown steps
     */
    async performShutdown(exitCode) {
        const shutdownSteps = [
            // Step 1: Stop accepting new requests
            {
                name: 'Stop accepting requests',
                fn: () => this.server.stopAcceptingRequests()
            },
            // Step 2: Notify connected clients
            {
                name: 'Notify clients',
                fn: () => this.notifyConnectedClients(),
                condition: () => this.config.notifyClients
            },
            // Step 3: Wait for active requests
            {
                name: 'Wait for active requests',
                fn: () => this.waitForActiveRequests()
            },
            // Step 4: Close streaming connections
            {
                name: 'Close streaming connections',
                fn: () => pipeline_stream_1.streamManager.shutdown()
            },
            // Step 5: Stop monitoring
            {
                name: 'Stop monitoring',
                fn: () => alerts_1.productionMonitor.stop()
            },
            // Step 6: Persist state
            {
                name: 'Persist state',
                fn: () => this.persistServerState(),
                condition: () => this.config.persistState
            },
            // Step 7: Close database connections
            {
                name: 'Close database connections',
                fn: () => this.closeDatabaseConnections()
            },
            // Step 8: Final cleanup
            {
                name: 'Final cleanup',
                fn: () => this.server.cleanup()
            }
        ];
        // Execute shutdown steps
        for (const step of shutdownSteps) {
            if (step.condition && !step.condition()) {
                continue;
            }
            try {
                logger_1.logger.info(`Shutdown step: ${step.name}`);
                await step.fn();
                logger_1.logger.info(`Shutdown step completed: ${step.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Shutdown step failed: ${step.name}`, { error });
            }
        }
        // Clear force shutdown timer
        if (this.forceShutdownTimer) {
            clearTimeout(this.forceShutdownTimer);
        }
        logger_1.logger.info('Graceful shutdown completed', { exitCode });
        // Exit process
        process.exit(exitCode);
    }
    /**
     * Notify connected clients about shutdown
     */
    async notifyConnectedClients() {
        const connections = pipeline_stream_1.streamManager.getConnectionStats();
        if (connections.totalConnections === 0) {
            return;
        }
        logger_1.logger.info('Notifying connected clients', {
            connections: connections.totalConnections
        });
        // Broadcast shutdown notification
        const shutdownEvent = {
            type: 'server_shutdown',
            timestamp: new Date().toISOString(),
            message: 'Server is shutting down',
            gracePeriodMs: this.config.gracePeriodMs
        };
        // Send to all active pipelines
        const activePipelines = Object.keys(connections.connectionsByPipeline);
        await Promise.all(activePipelines.map(pipelineId => pipeline_stream_1.streamManager.broadcastPipelineEvent(pipelineId, shutdownEvent)));
    }
    /**
     * Wait for active requests to complete
     */
    async waitForActiveRequests() {
        const startTime = Date.now();
        while (this.activeRequests.size > 0) {
            const elapsed = Date.now() - startTime;
            if (elapsed > this.config.gracePeriodMs) {
                logger_1.logger.warn('Grace period exceeded, continuing shutdown', {
                    activeRequests: this.activeRequests.size,
                    elapsed
                });
                break;
            }
            logger_1.logger.info('Waiting for active requests', {
                count: this.activeRequests.size,
                elapsed,
                remaining: this.config.gracePeriodMs - elapsed
            });
            // Wait a bit before checking again
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    /**
     * Persist server state
     */
    async persistServerState() {
        try {
            const state = {
                timestamp: new Date().toISOString(),
                activeRequests: Array.from(this.activeRequests),
                connections: pipeline_stream_1.streamManager.getConnectionStats(),
                monitoring: alerts_1.productionMonitor.getStatus(),
                health: await this.server.getHealthStatus()
            };
            // Store state in database
            await supabase_1.supabaseAdmin
                .from('server_state')
                .insert({
                server_id: process.env.SERVER_ID || 'mcp-server',
                state,
                shutdown_reason: 'graceful_shutdown',
                created_at: new Date().toISOString()
            });
            logger_1.logger.info('Server state persisted');
        }
        catch (error) {
            logger_1.logger.error('Failed to persist server state', { error });
        }
    }
    /**
     * Close database connections
     */
    async closeDatabaseConnections() {
        // The Supabase client handles connection pooling internally
        // This is a placeholder for any custom cleanup needed
        logger_1.logger.info('Database connections closed');
    }
    /**
     * Check if server is shutting down
     */
    isShuttingDown() {
        return this.shuttingDown;
    }
}
exports.GracefulShutdownManager = GracefulShutdownManager;
/**
 * Create shutdown handler middleware
 */
function createShutdownMiddleware(shutdownManager) {
    return (req, res, next) => {
        if (shutdownManager.isShuttingDown()) {
            res.status(503).json({
                error: 'Server is shutting down',
                message: 'Please retry your request'
            });
            return;
        }
        // Track request
        const requestId = req.id || `req_${Date.now()}_${Math.random()}`;
        shutdownManager.trackRequest(requestId);
        // Complete request on finish
        res.on('finish', () => {
            shutdownManager.completeRequest(requestId);
        });
        next();
    };
}
