/**
 * SSE (Server-Sent Events) connection hook for real-time streaming
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Event type handlers
 * - Cleanup on unmount
 * - Abort signal support
 */

import { useEffect, useRef } from 'react';

interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: any) => void;
  eventHandlers?: Record<string, (event: MessageEvent) => void>;
  enabled?: boolean;
  reconnect?: boolean;
  maxRetryMs?: number;
}

export function useSSEConnection(
  url: string | null,
  options: SSEOptions = {}
) {
  const {
    onMessage,
    onError,
    eventHandlers = {},
    enabled = true,
    reconnect = true,
    maxRetryMs = 30000
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000);
  const abortedRef = useRef(false);

  useEffect(() => {
    if (!url || !enabled) return;

    abortedRef.current = false;

    const connect = () => {
      if (abortedRef.current) return;

      try {
        // Close existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Handle message events
        if (onMessage) {
          eventSource.onmessage = onMessage;
        }

        // Handle custom event types
        Object.entries(eventHandlers).forEach(([type, handler]) => {
          eventSource.addEventListener(type, handler as EventListener);
        });

        // Handle errors and reconnection
        eventSource.onerror = (error) => {
          if (onError) {
            onError(error);
          }

          eventSource.close();
          eventSourceRef.current = null;

          // Attempt reconnection if enabled
          if (reconnect && !abortedRef.current) {
            retryDelayRef.current = Math.min(maxRetryMs, retryDelayRef.current * 2);
            
            retryTimeoutRef.current = setTimeout(() => {
              if (!abortedRef.current) {
                connect();
              }
            }, retryDelayRef.current);
          }
        };

        // Reset retry delay on successful connection
        eventSource.onopen = () => {
          retryDelayRef.current = 1000;
        };

      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup function
    return () => {
      abortedRef.current = true;

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [url, enabled, onMessage, onError, eventHandlers, reconnect, maxRetryMs]);

  // Manual close function
  const close = () => {
    abortedRef.current = true;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return {
    close,
    isConnected: !!eventSourceRef.current
  };
}

/**
 * Helper to create a reconnecting EventSource (standalone function)
 */
export function createReconnectingEventSource(
  url: string,
  options: {
    onEvent?: (ev: MessageEvent) => void;
    eventHandlers?: Record<string, (ev: MessageEvent) => void>;
    onError?: (err: any) => void;
    signal?: AbortSignal;
  }
) {
  let es: EventSource | null = null;
  let retryMs = 1000;
  const maxRetry = 30000;

  const { onEvent, onError, signal } = options;

  const connect = () => {
    if (signal?.aborted) return;
    es = new EventSource(url);

    if (options.onEvent) es.onmessage = options.onEvent;

    if (options.eventHandlers) {
      for (const [type, handler] of Object.entries(options.eventHandlers)) {
        es.addEventListener(type, handler as any);
      }
    }

    es.onerror = (e) => {
      es?.close();
      if (onError) onError(e);
      // schedule reconnect
      retryMs = Math.min(maxRetry, retryMs * 2);
      setTimeout(connect, retryMs);
    };
  };

  connect();

  const cleanup = () => {
    es?.close();
  };

  if (signal) signal.addEventListener('abort', cleanup);

  return cleanup;
}