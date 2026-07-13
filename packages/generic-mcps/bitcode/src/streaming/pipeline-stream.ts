/**
 * Bitcode MCP Pipeline Streaming
 * 
 * Real-time streaming support for pipeline execution with Server-Sent Events (SSE)
 * and WebSocket connections for live pipeline monitoring.
 */

import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '@bitcode/logger';
import { createClient as createAdminClient } from '@bitcode/supabase';
import type { PipelineStreamEvent, MCPAuthContext } from '../types';

/**
 * Pipeline stream event types
 */
export enum StreamEventType {
  PHASE_START = 'phase_start',
  PHASE_COMPLETE = 'phase_complete',
  AGENT_START = 'agent_start',
  AGENT_COMPLETE = 'agent_complete',
  STEP_START = 'step_start',
  STEP_COMPLETE = 'step_complete',
  TOOL_EXECUTION = 'tool_execution',
  PROGRESS_UPDATE = 'progress_update',
  ERROR = 'error',
  COMPLETION = 'completion',
  CANCELLATION = 'cancellation'
}

/**
 * Stream connection interface
 */
interface StreamConnection {
  id: string;
  pipelineId: string;
  userId: string;
  organizationId?: string;
  connectionType: 'sse' | 'websocket';
  connection: any; // SSE Response or WebSocket
  lastPing: number;
  subscriptions: Set<string>;
}

/**
 * Pipeline streaming manager
 */
export class PipelineStreamManager extends EventEmitter {
  private connections = new Map<string, StreamConnection>();
  private pipelineSubscriptions = new Map<string, Set<string>>();
  private wsServer?: WebSocketServer;
  private cleanupInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private activeRealtimeSubscriptions = new Map<string, any>();

  constructor() {
    super();
    this.setupCleanupTasks();
  }

  /**
   * Initialize WebSocket server
   */
  initializeWebSocketServer(port = 8080): void {
    this.wsServer = new WebSocketServer({ port });
    
    this.wsServer.on('connection', (ws: WebSocket, request) => {
      this.handleWebSocketConnection(ws, request);
    });

    this.wsServer.on('error', (error) => {
      logger.error('WebSocket server error', { error });
    });

    logger.info('Pipeline streaming WebSocket server initialized', { port });
  }

  /**
   * Handle WebSocket connection
   */
  private async handleWebSocketConnection(ws: WebSocket, request: any): Promise<void> {
    const url = new URL(request.url!, 'http://localhost');
    const pipelineId = url.searchParams.get('pipelineId');
    const token = url.searchParams.get('token');

    if (!pipelineId || !token) {
      ws.close(1008, 'Missing pipelineId or token');
      return;
    }

    try {
      // Authenticate the connection
      const context = await this.authenticateStreamConnection(token);
      if (!context) {
        ws.close(1008, 'Authentication failed');
        return;
      }

      // Verify pipeline access
      const hasAccess = await this.verifyPipelineAccess(pipelineId, context);
      if (!hasAccess) {
        ws.close(1008, 'Access denied');
        return;
      }

      // Create connection
      const connectionId = this.generateConnectionId();
      const connection: StreamConnection = {
        id: connectionId,
        pipelineId,
        userId: context.userId,
        organizationId: context.organizationId,
        connectionType: 'websocket',
        connection: ws,
        lastPing: Date.now(),
        subscriptions: new Set([pipelineId])
      };

      this.connections.set(connectionId, connection);
      this.addPipelineSubscription(pipelineId, connectionId);

      // Set up WebSocket handlers
      ws.on('message', (data) => {
        this.handleWebSocketMessage(connectionId, data);
      });

      ws.on('close', () => {
        this.removeConnection(connectionId);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket connection error', { connectionId, error });
        this.removeConnection(connectionId);
      });

      // Send initial status
      const initialStatus = await this.getPipelineStatus(pipelineId);
      this.sendToConnection(connectionId, {
        type: 'connection',
        data: {
          connectionId,
          pipelineId,
          status: 'connected',
          initialStatus
        }
      });

      logger.info('Pipeline stream WebSocket connected', {
        connectionId,
        pipelineId,
        userId: context.userId
      });

    } catch (error) {
      logger.error('Error handling WebSocket connection', { error });
      ws.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(connectionId: string, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      const connection = this.connections.get(connectionId);
      
      if (!connection) return;

      switch (message.type) {
        case 'ping':
          connection.lastPing = Date.now();
          this.sendToConnection(connectionId, { type: 'pong', timestamp: Date.now() });
          break;
          
        case 'subscribe':
          if (message.pipelineId) {
            this.subscribeToPipeline(connectionId, message.pipelineId);
          }
          break;
          
        case 'unsubscribe':
          if (message.pipelineId) {
            this.unsubscribeFromPipeline(connectionId, message.pipelineId);
          }
          break;
          
        default:
          logger.warn('Unknown WebSocket message type', { connectionId, type: message.type });
      }
    } catch (error) {
      logger.error('Error handling WebSocket message', { connectionId, error });
    }
  }

  /**
   * Create SSE connection
   */
  async createSSEConnection(
    pipelineId: string,
    context: MCPAuthContext,
    response: any
  ): Promise<string> {
    // Verify pipeline access
    const hasAccess = await this.verifyPipelineAccess(pipelineId, context);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Set up SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Create connection
    const connectionId = this.generateConnectionId();
    const connection: StreamConnection = {
      id: connectionId,
      pipelineId,
      userId: context.userId,
      organizationId: context.organizationId,
      connectionType: 'sse',
      connection: response,
      lastPing: Date.now(),
      subscriptions: new Set([pipelineId])
    };

    this.connections.set(connectionId, connection);
    this.addPipelineSubscription(pipelineId, connectionId);

    // Handle client disconnect
    response.on('close', () => {
      this.removeConnection(connectionId);
    });

    // Send initial event
    const initialStatus = await this.getPipelineStatus(pipelineId);
    this.sendSSEEvent(response, 'connected', {
      connectionId,
      pipelineId,
      status: 'connected',
      initialStatus
    });

    logger.info('Pipeline stream SSE connected', {
      connectionId,
      pipelineId,
      userId: context.userId
    });

    return connectionId;
  }

  /**
   * Broadcast pipeline event to all subscribers
   */
  async broadcastPipelineEvent(pipelineId: string, event: PipelineStreamEvent): Promise<void> {
    const subscribers = this.pipelineSubscriptions.get(pipelineId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    // Store event in database for replay
    await this.storePipelineEvent(pipelineId, event);

    // Broadcast to all subscribers
    for (const connectionId of subscribers) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.sendToConnection(connectionId, event);
      }
    }

    logger.debug('Pipeline event broadcasted', {
      pipelineId,
      eventType: event.type,
      subscriberCount: subscribers.size
    });
  }

  /**
   * Send event to specific connection
   */
  private sendToConnection(connectionId: string, data: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      if (connection.connectionType === 'websocket') {
        const ws = connection.connection as WebSocket;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      } else if (connection.connectionType === 'sse') {
        const response = connection.connection;
        this.sendSSEEvent(response, data.type || 'event', data);
      }
    } catch (error) {
      logger.error('Error sending to connection', { connectionId, error });
      this.removeConnection(connectionId);
    }
  }

  /**
   * Send SSE event
   */
  private sendSSEEvent(response: any, eventType: string, data: any): void {
    const eventData = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    response.write(eventData);
  }

  /**
   * Subscribe connection to pipeline
   */
  private subscribeToPipeline(connectionId: string, pipelineId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.add(pipelineId);
    this.addPipelineSubscription(pipelineId, connectionId);

    logger.debug('Connection subscribed to pipeline', { connectionId, pipelineId });
  }

  /**
   * Unsubscribe connection from pipeline
   */
  private unsubscribeFromPipeline(connectionId: string, pipelineId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.delete(pipelineId);
    this.removePipelineSubscription(pipelineId, connectionId);

    logger.debug('Connection unsubscribed from pipeline', { connectionId, pipelineId });
  }

  /**
   * Add pipeline subscription
   */
  private addPipelineSubscription(pipelineId: string, connectionId: string): void {
    if (!this.pipelineSubscriptions.has(pipelineId)) {
      this.pipelineSubscriptions.set(pipelineId, new Set());
    }
    this.pipelineSubscriptions.get(pipelineId)!.add(connectionId);
  }

  /**
   * Remove pipeline subscription
   */
  private removePipelineSubscription(pipelineId: string, connectionId: string): void {
    const subscribers = this.pipelineSubscriptions.get(pipelineId);
    if (subscribers) {
      subscribers.delete(connectionId);
      if (subscribers.size === 0) {
        this.pipelineSubscriptions.delete(pipelineId);
      }
    }
  }

  /**
   * Remove connection
   */
  private removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all pipeline subscriptions
    for (const pipelineId of connection.subscriptions) {
      this.removePipelineSubscription(pipelineId, connectionId);
    }

    this.connections.delete(connectionId);

    logger.debug('Connection removed', { connectionId });
  }

  /**
   * Authenticate stream connection
   */
  private async authenticateStreamConnection(token: string): Promise<MCPAuthContext | null> {
    try {
      // Import auth middleware dynamically to avoid circular dependencies
      const { authenticateMCPRequest } = await import('../auth/middleware');
      
      // Authenticate using Bearer token or API key
      const authResult = await authenticateMCPRequest(
        token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        { requiredPermissions: { resources: ['read'] } } // Minimal permissions for streaming
      );
      
      if (!authResult.success || !authResult.context) {
        logger.warn('Stream authentication failed', { 
          error: authResult.error,
          tokenPrefix: token.substring(0, 10) + '...'
        });
        return null;
      }
      
      return authResult.context;
    } catch (error) {
      logger.error('Stream authentication error', { 
        error: error instanceof Error ? error.message : error 
      });
      return null;
    }
  }

  /**
   * Verify pipeline access
   */
  private async verifyPipelineAccess(pipelineId: string, context: MCPAuthContext): Promise<boolean> {
    const supabase = createAdminClient();

    try {
      const { data: pipeline, error } = await supabase
        .from('executions')
        .select('user_id, organization_id')
        .eq('id', pipelineId)
        .maybeSingle();

      if (error || !pipeline) {
        return false;
      }

      // Check access permissions
      return (
        context.permissions.organization.viewAnalytics ||
        pipeline.user_id === context.userId ||
        Boolean(context.organizationId && pipeline.organization_id === context.organizationId)
      );
    } catch (error) {
      logger.error('Error verifying pipeline access', { pipelineId, error });
      return false;
    }
  }

  /**
   * Get pipeline status
   */
  private async getPipelineStatus(pipelineId: string): Promise<any> {
    const supabase = createAdminClient();

    try {
      const { data: pipeline, error } = await supabase
        .from('executions')
        .select('id, status, pipeline, created_at, metrics')
        .eq('id', pipelineId)
        .maybeSingle();

      if (error || !pipeline) {
        return null;
      }

      return {
        id: pipeline.id,
        status: pipeline.status,
        pipeline: pipeline.pipeline,
        startTime: pipeline.created_at,
        progress: this.calculateProgress(pipeline.status, pipeline.metrics)
      };
    } catch (error) {
      logger.error('Error getting pipeline status', { pipelineId, error });
      return null;
    }
  }

  /**
   * Calculate pipeline progress
   */
  private calculateProgress(statusOrExecutionState: string | any, metrics?: any): number {
    // Handle both status string and execution state object
    if (typeof statusOrExecutionState === 'string') {
      const status = statusOrExecutionState;
      switch (status) {
        case 'pending':
          return 0;
        case 'running':
          const phases = ['setup', 'discovery', 'implementation', 'validation', 'finish'];
          const completedPhases = Object.keys(metrics?.phases || {}).length;
          return Math.min((completedPhases / phases.length) * 80, 80);
        case 'completed':
          return 100;
        case 'failed':
        case 'cancelled':
          return -1;
        default:
          return 0;
      }
    } else {
      // Calculate progress from execution state
      const executionState = statusOrExecutionState;
      const phaseWeights = {
        'Setup': 10,
        'Discovery': 20,
        'Implementation': 40,
        'Validation': 20,
        'Finish': 10
      };
      
      let progress = 0;
      const currentPhase = executionState?.phase;
      
      // Add completed phase weights
      for (const [phase, weight] of Object.entries(phaseWeights)) {
        if (phase === currentPhase) {
          // Add partial progress for current phase
          progress += weight * 0.5;
          break;
        }
        progress += weight;
      }
      
      return Math.min(progress, 100);
    }
  }

  /**
   * Store pipeline event in database
   */
  private async storePipelineEvent(pipelineId: string, event: PipelineStreamEvent): Promise<void> {
    const supabase = createAdminClient();

    try {
      await supabase.from('pipeline_events').insert({
        pipeline_id: pipelineId,
        type: event.type,
        timestamp: event.timestamp,
        phase: event.phase,
        agent: event.agent,
        step: event.step,
        tool: event.tool,
        data: event.data
      });
    } catch (error) {
      logger.error('Error storing pipeline event', { pipelineId, event, error });
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup cleanup tasks
   */
  private setupCleanupTasks(): void {
    // Clean up dead connections every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupDeadConnections();
    }, 30000);
    this.cleanupInterval.unref?.();

    // Send heartbeat every 10 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 10000);
    this.heartbeatInterval.unref?.();
  }

  /**
   * Clean up dead connections
   */
  private cleanupDeadConnections(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    for (const [connectionId, connection] of this.connections) {
      if (now - connection.lastPing > timeout) {
        logger.debug('Cleaning up dead connection', { connectionId });
        this.removeConnection(connectionId);
      }
    }
  }

  /**
   * Send heartbeat to connections
   */
  private sendHeartbeat(): void {
    for (const connectionId of this.connections.keys()) {
      this.sendToConnection(connectionId, {
        type: 'heartbeat',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): any {
    const connectionsByType = { sse: 0, websocket: 0 };
    const connectionsByPipeline = new Map<string, number>();

    for (const connection of this.connections.values()) {
      connectionsByType[connection.connectionType]++;
      
      for (const pipelineId of connection.subscriptions) {
        connectionsByPipeline.set(pipelineId, (connectionsByPipeline.get(pipelineId) || 0) + 1);
      }
    }

    return {
      totalConnections: this.connections.size,
      connectionsByType,
      activePipelines: this.pipelineSubscriptions.size,
      connectionsByPipeline: Object.fromEntries(connectionsByPipeline)
    };
  }

  /**
   * Subscribe to real-time pipeline events from stream_logs
   */
  private async subscribeToPipelineEvents(pipelineId: string): Promise<void> {
    const supabase = createAdminClient();
    
    // Subscribe to stream_logs table for this pipeline
    const channel = supabase
      .channel(`pipeline-stream-${pipelineId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_logs',
          filter: `run_id=eq.${pipelineId}`
        },
        (payload) => {
          const log = payload.new as any;
          
          // Convert stream log to pipeline event
          const event: PipelineStreamEvent = {
            type: this.mapLogTypeToEventType(log.type),
            timestamp: log.timestamp || new Date().toISOString(),
            pipelineId,
            phase: log.execution_state?.phase,
            agent: log.execution_state?.agent,
            step: log.execution_state?.step,
            data: {
              progress: this.calculateProgress(log.execution_state),
              message: log.message || '',
              metadata: log.metadata || {},
              tokensUsed: log.llm_call?.tokens?.totalTokens,
              confidence: log.metadata?.confidence
            }
          };
          
          // Handle errors
          if (log.type === 'error') {
            event.data.error = {
              message: log.error || log.message || 'Unknown error',
              recoverable: log.metadata?.recoverable !== false
            };
          }
          
          this.broadcastPipelineEvent(pipelineId, event);
        }
      )
      .subscribe();
      
    // Store channel reference for cleanup
    this.activeRealtimeSubscriptions.set(pipelineId, channel);
    
    logger.info('Subscribed to real-time pipeline events', { pipelineId });
  }
  
  /**
   * Unsubscribe from pipeline events
   */
  private unsubscribeFromPipelineEvents(pipelineId: string): void {
    const channel = this.activeRealtimeSubscriptions.get(pipelineId);
    if (channel) {
      channel.unsubscribe();
      this.activeRealtimeSubscriptions.delete(pipelineId);
      logger.info('Unsubscribed from pipeline events', { pipelineId });
    }
  }
  
  /**
   * Map stream log types to event types
   */
  private mapLogTypeToEventType(logType: string): StreamEventType {
    switch (logType) {
      case 'generation':
        return StreamEventType.AGENT_START;
      case 'tool-use':
        return StreamEventType.TOOL_EXECUTION;
      case 'error':
        return StreamEventType.ERROR;
      case 'completion':
        return StreamEventType.COMPLETION;
      case 'thinking':
        return StreamEventType.STEP_START;
      default:
        return StreamEventType.PROGRESS_UPDATE;
    }
  }

  /**
   * Shutdown the stream manager
   */
  shutdown(): void {
    // Clear intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    for (const connectionId of this.connections.keys()) {
      this.removeConnection(connectionId);
    }

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    logger.info('Pipeline stream manager shutdown complete');
  }
}

// Global stream manager instance
export const streamManager = new PipelineStreamManager();
