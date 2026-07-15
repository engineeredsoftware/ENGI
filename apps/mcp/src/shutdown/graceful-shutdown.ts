/**
 * Graceful Shutdown Handler for MCP Server
 * 
 * Ensures clean shutdown with proper resource cleanup,
 * in-flight request completion, and state persistence.
 */

import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';
import { supabaseAdmin } from '@bitcode/supabase';
import type { BitcodeMCPServer } from '../server';
import { streamManager } from '../streaming/pipeline-stream';
import { productionMonitor } from '../monitoring/alerts';

/**
 * Shutdown configuration
 */
export interface ShutdownConfig {
  gracePeriodMs: number;      // Time to wait for in-flight requests
  forceShutdownMs: number;    // Maximum time before forced shutdown
  persistState: boolean;      // Whether to persist state before shutdown
  notifyClients: boolean;     // Whether to notify connected clients
}

/**
 * Default shutdown configuration
 */
export const DEFAULT_SHUTDOWN_CONFIG: ShutdownConfig = {
  gracePeriodMs: 30000,       // 30 seconds
  forceShutdownMs: 60000,     // 60 seconds
  persistState: true,
  notifyClients: true
};

/**
 * Graceful shutdown manager
 */
export class GracefulShutdownManager {
  private shuttingDown = false;
  private activeRequests = new Set<string>();
  private shutdownPromise?: Promise<void>;
  private forceShutdownTimer?: NodeJS.Timeout;
  private readonly handleSigterm = () => this.shutdown('SIGTERM');
  private readonly handleSigint = () => this.shutdown('SIGINT');
  private readonly handleUncaughtException = (error: unknown) => {
    logger.error('Uncaught exception', { error });
    this.shutdown('uncaughtException', 1);
  };
  private readonly handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled rejection', { reason, promise });
    this.shutdown('unhandledRejection', 1);
  };
  
  constructor(
    private server: BitcodeMCPServer,
    private config: ShutdownConfig = DEFAULT_SHUTDOWN_CONFIG
  ) {
    this.setupSignalHandlers();
  }
  
  /**
   * Setup process signal handlers
   */
  private setupSignalHandlers(): void {
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
  dispose(): void {
    process.off('SIGTERM', this.handleSigterm);
    process.off('SIGINT', this.handleSigint);
    process.off('uncaughtException', this.handleUncaughtException);
    process.off('unhandledRejection', this.handleUnhandledRejection);
  }
  
  /**
   * Track active request
   */
  trackRequest(requestId: string): void {
    this.activeRequests.add(requestId);
  }
  
  /**
   * Complete request
   */
  completeRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
  }
  
  /**
   * Get active request count
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
  
  /**
   * Initiate graceful shutdown
   */
  async shutdown(reason: string, exitCode: number = 0): Promise<void> {
    if (this.shuttingDown) {
      return this.shutdownPromise!;
    }
    
    this.shuttingDown = true;
    logger.info('Initiating graceful shutdown', {
      reason,
      activeRequests: this.activeRequests.size,
      config: this.config
    });
    
    // Record shutdown metric
    observability.recordMetric('server_shutdown', {
      reason,
      activeRequests: this.activeRequests.size
    });
    
    // Start shutdown process
    this.shutdownPromise = this.performShutdown(exitCode);
    
    // Setup force shutdown timer
    this.forceShutdownTimer = setTimeout(() => {
      logger.error('Force shutdown triggered', {
        activeRequests: this.activeRequests.size
      });
      process.exit(exitCode);
    }, this.config.forceShutdownMs);
    
    return this.shutdownPromise;
  }
  
  /**
   * Perform shutdown steps
   */
  private async performShutdown(exitCode: number): Promise<void> {
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
        fn: () => streamManager.shutdown()
      },
      
      // Step 5: Stop monitoring
      {
        name: 'Stop monitoring',
        fn: () => productionMonitor.stop()
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
        logger.info(`Shutdown step: ${step.name}`);
        await step.fn();
        logger.info(`Shutdown step completed: ${step.name}`);
      } catch (error) {
        logger.error(`Shutdown step failed: ${step.name}`, { error });
      }
    }
    
    // Clear force shutdown timer
    if (this.forceShutdownTimer) {
      clearTimeout(this.forceShutdownTimer);
    }
    
    logger.info('Graceful shutdown completed', { exitCode });
    
    // Exit process
    process.exit(exitCode);
  }
  
  /**
   * Notify connected clients about shutdown
   */
  private async notifyConnectedClients(): Promise<void> {
    const connections = streamManager.getConnectionStats();
    
    if (connections.totalConnections === 0) {
      return;
    }
    
    logger.info('Notifying connected clients', {
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
    await Promise.all(
      activePipelines.map(pipelineId =>
        streamManager.broadcastPipelineEvent(pipelineId, shutdownEvent as any)
      )
    );
  }
  
  /**
   * Wait for active requests to complete
   */
  private async waitForActiveRequests(): Promise<void> {
    const startTime = Date.now();
    
    while (this.activeRequests.size > 0) {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > this.config.gracePeriodMs) {
        logger.warn('Grace period exceeded, continuing shutdown', {
          activeRequests: this.activeRequests.size,
          elapsed
        });
        break;
      }
      
      logger.info('Waiting for active requests', {
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
  private async persistServerState(): Promise<void> {
    try {
      const state = {
        timestamp: new Date().toISOString(),
        activeRequests: Array.from(this.activeRequests),
        connections: streamManager.getConnectionStats(),
        monitoring: productionMonitor.getStatus(),
        health: await this.server.getHealthStatus()
      };
      
      // Store state in database
      await supabaseAdmin
        .from('server_state')
        .insert({
          server_id: process.env.SERVER_ID || 'mcp-server',
          state,
          shutdown_reason: 'graceful_shutdown',
          created_at: new Date().toISOString()
        });
        
      logger.info('Server state persisted');
    } catch (error) {
      logger.error('Failed to persist server state', { error });
    }
  }
  
  /**
   * Close database connections
   */
  private async closeDatabaseConnections(): Promise<void> {
    // The Supabase client handles connection pooling internally
    // This is a placeholder for any custom cleanup needed
    logger.info('Database connections closed');
  }
  
  /**
   * Check if server is shutting down
   */
  isShuttingDown(): boolean {
    return this.shuttingDown;
  }
}

/**
 * Create shutdown handler middleware
 */
export function createShutdownMiddleware(
  shutdownManager: GracefulShutdownManager
): (req: any, res: any, next: any) => void {
  return (req: any, res: any, next: any) => {
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
