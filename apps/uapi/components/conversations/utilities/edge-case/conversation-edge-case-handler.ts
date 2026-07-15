/**
 * Conversations edge-case handler facade.
 * Concern implementations live in network / data-integrity / performance / validation modules.
 * Public import path remains utilities/edge-case-handler.ts.
 */
import type {
  ConversationRichMessage,
  ConversationRichResponse,
} from '../types/conversations-rich-response';
import {
  handleNetworkTimeout,
  handleStreamConnectionFailure,
} from './network';
import {
  detectSuspiciousPatterns,
  handleCorruptedMessage,
  sanitizeRichResponse,
  sanitizeRichResponseContent,
} from './data-integrity';
import {
  handleAccessibilityRequirements,
  handleMemoryPressure,
  handleSlowConnection,
  handleSlowRendering,
} from './performance';
import {
  validateCodeDiffData,
  validateDataTableData,
  validatePipelineLogsData,
} from './validation';

export class ConversationEdgeCaseHandler {
  private static instance: ConversationEdgeCaseHandler;
  private errorCounts = new Map<string, number>();
  private circuitBreakerState = new Map<string, { isOpen: boolean; lastFailTime: number }>();

  static getInstance(): ConversationEdgeCaseHandler {
    if (!ConversationEdgeCaseHandler.instance) {
      ConversationEdgeCaseHandler.instance = new ConversationEdgeCaseHandler();
    }
    return ConversationEdgeCaseHandler.instance;
  }

  handleStreamConnectionFailure(conversationId: string, error: Error) {
    return handleStreamConnectionFailure(
      this.errorCounts,
      this.circuitBreakerState,
      conversationId,
      error,
    );
  }

  handleNetworkTimeout(richResponseId: string, timeoutMs: number) {
    return handleNetworkTimeout(richResponseId, timeoutMs);
  }

  handleMalformedRichResponseData(
    data: unknown,
    expectedType: string,
  ): {
    isValid: boolean;
    sanitizedData?: unknown;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      if (!data || typeof data !== 'object') {
        errors.push('Rich response data is not a valid object');
        return { isValid: false, errors };
      }

      const record = data as Record<string, unknown>;
      switch (expectedType) {
        case 'pipeline_logs_compact':
          return validatePipelineLogsData(record, errors);
        case 'code_diff_viewer':
          return validateCodeDiffData(record, errors);
        case 'data_table_interactive':
          return validateDataTableData(record, errors);
        default:
          errors.push(`Unknown rich response type: ${expectedType}`);
          return { isValid: false, errors };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Validation failed: ${message}`);
      return { isValid: false, errors };
    }
  }

  handleCorruptedMessage(message: unknown): ConversationRichMessage | null {
    return handleCorruptedMessage(
      (message || {}) as Record<string, unknown>,
      (rr) => sanitizeRichResponse(rr as Record<string, unknown>),
    );
  }

  sanitizeRichResponseContent(content: string): string {
    return sanitizeRichResponseContent(content);
  }

  detectSuspiciousPatterns(input: unknown) {
    return detectSuspiciousPatterns(input);
  }

  handleMemoryPressure() {
    return handleMemoryPressure();
  }

  handleSlowRendering(renderTime: number, richResponseId: string) {
    return handleSlowRendering(renderTime, richResponseId);
  }

  handleSlowConnection(connectionSpeed: 'slow-2g' | 'slow' | 'fast') {
    return handleSlowConnection(connectionSpeed);
  }

  handleAccessibilityRequirements(userPreferences: {
    prefersReducedMotion?: boolean;
    highContrast?: boolean;
    largeText?: boolean;
  }) {
    return handleAccessibilityRequirements(userPreferences);
  }

  resetErrorTracking(contextId: string): void {
    this.errorCounts.delete(contextId);
    this.circuitBreakerState.delete(contextId);
  }

  shouldResetCircuitBreaker(contextId: string, cooldownMs: number = 60000): boolean {
    const state = this.circuitBreakerState.get(contextId);
    if (!state || !state.isOpen) return false;
    return Date.now() - state.lastFailTime > cooldownMs;
  }
}

export const conversationEdgeCaseHandler = ConversationEdgeCaseHandler.getInstance();
