/**
 * Network connectivity, stream failure, and timeout edge cases.
 */
import type { ConversationRichResponse } from '../types/conversations-rich-response';

export function handleStreamConnectionFailure(
  errorCounts: Map<string, number>,
  circuitBreakerState: Map<string, { isOpen: boolean; lastFailTime: number }>,
  conversationId: string,
  _error: Error,
): {
  shouldRetry: boolean;
  retryDelay: number;
  fallbackAction: string;
} {
  const errorCount = errorCounts.get(conversationId) || 0;
  errorCounts.set(conversationId, errorCount + 1);

  const baseDelay = Math.min(1000 * Math.pow(2, errorCount), 30000);
  const jitter = Math.random() * 1000;
  const retryDelay = baseDelay + jitter;

  if (errorCount >= 5) {
    circuitBreakerState.set(conversationId, {
      isOpen: true,
      lastFailTime: Date.now(),
    });

    return {
      shouldRetry: false,
      retryDelay: 0,
      fallbackAction: 'switch_to_polling_mode',
    };
  }

  return {
    shouldRetry: true,
    retryDelay,
    fallbackAction: errorCount >= 3 ? 'degrade_to_simple_responses' : 'continue_normal',
  };
}

export function handleNetworkTimeout(
  richResponseId: string,
  timeoutMs: number,
): ConversationRichResponse | null {
  console.warn(`Rich response ${richResponseId} timed out after ${timeoutMs}ms`);

  return {
    id: `${richResponseId}_timeout_fallback`,
    type: 'data_table_interactive',
    data: {
      error: {
        type: 'network_timeout',
        message: 'Content is taking longer than expected to load',
        action: 'retry_or_refresh',
        timeoutMs,
      },
    },
    metadata: {
      title: 'Loading Timeout',
      description: 'Content load timed out',
      priority: 'medium',
      renderMode: 'compact',
      interactionLevel: 'interactive',
      performance: {
        renderCost: 'low',
        updateFrequency: 'static',
      },
    },
    actions: [
      {
        id: 'retry_load',
        type: 'refresh',
        label: 'Retry',
        icon: 'refresh',
        handler: 'retry_rich_response_load',
      },
      {
        id: 'skip_content',
        type: 'execute',
        label: 'Skip',
        icon: 'skip-forward',
        handler: 'skip_rich_response',
      },
    ],
  };
}
