/**
 * STREAMER - Clean event emission for pipeline streaming
 * 
 * A minimal streamer focused on emitting events to subscribers without product
 * domain coupling.
 */

export type StreamEventHandler = (event: any) => void | Promise<void>;

export interface StreamerConfig {
  streamId: string;
  userId?: string;
}

/**
 * Clean streamer for pipeline event emission
 */
export class Streamer {
  private config: StreamerConfig;
  private subscribers = new Set<StreamEventHandler>();
  private isComplete = false;

  constructor(config: StreamerConfig) {
    this.config = config;
  }

  /**
   * Subscribe to stream events
   */
  subscribe(handler: StreamEventHandler): () => void {
    this.subscribers.add(handler);
    // Return unsubscribe function
    return () => this.subscribers.delete(handler);
  }

  /**
   * Emit an event to all subscribers
   */
  async emit(event: any): Promise<void> {
    if (this.isComplete) {
      console.warn('Attempting to emit on completed stream:', this.config.streamId);
      return;
    }

    // Add stream metadata
    const enrichedEvent = {
      ...event,
      streamId: this.config.streamId,
      userId: this.config.userId,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Emit to all subscribers
    const promises = Array.from(this.subscribers).map(handler => {
      try {
        return Promise.resolve(handler(enrichedEvent));
      } catch (error) {
        console.error('Stream handler error:', error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Serialized-payload entrypoint for callers that write stream data directly.
   */
  async writeData(data: string | Record<string, unknown>): Promise<void> {
    let event = data;

    if (typeof data === 'string') {
      try {
        event = JSON.parse(data);
      } catch {
        event = { type: 'data', payload: data };
      }
    }

    await this.emit(event);
  }

  /**
   * Mark stream as complete
   */
  complete(): void {
    this.isComplete = true;
    this.subscribers.clear();
  }

  /**
   * Check if stream is complete
   */
  get completed(): boolean {
    return this.isComplete;
  }
}
