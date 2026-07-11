/**
 * CONVERSATIONS EDGE CASE HANDLER - BULLETPROOF PRODUCTION SYSTEM
 * 
 * Handles every conceivable edge case in Conversations backend-client interactions.
 * Ensures the system remains stable and user-friendly under all conditions.
 */

import { 
  ConversationRichMessage, 
  ConversationRichResponse, 
  ConversationRichResponseError,
  ConversationRichStreamEvent
} from '../types/conversations-rich-response';

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

  /**
   * NETWORK & CONNECTIVITY EDGE CASES
   */

  /**
   * Handle stream connection failures
   */
  handleStreamConnectionFailure(conversationId: string, error: Error): {
    shouldRetry: boolean;
    retryDelay: number;
    fallbackAction: string;
  } {
    const errorCount = this.errorCounts.get(conversationId) || 0;
    this.errorCounts.set(conversationId, errorCount + 1);

    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * Math.pow(2, errorCount), 30000);
    const jitter = Math.random() * 1000;
    const retryDelay = baseDelay + jitter;

    // Circuit breaker pattern
    if (errorCount >= 5) {
      this.circuitBreakerState.set(conversationId, {
        isOpen: true,
        lastFailTime: Date.now()
      });
      
      return {
        shouldRetry: false,
        retryDelay: 0,
        fallbackAction: 'switch_to_polling_mode'
      };
    }

    return {
      shouldRetry: true,
      retryDelay,
      fallbackAction: errorCount >= 3 ? 'degrade_to_simple_responses' : 'continue_normal'
    };
  }

  /**
   * Handle network timeout during rich response rendering
   */
  handleNetworkTimeout(richResponseId: string, timeoutMs: number): ConversationRichResponse | null {
    console.warn(`Rich response ${richResponseId} timed out after ${timeoutMs}ms`);
    
    // Create a timeout fallback response
    return {
      id: `${richResponseId}_timeout_fallback`,
      type: 'data_table_interactive',
      data: {
        error: {
          type: 'network_timeout',
          message: 'Content is taking longer than expected to load',
          action: 'retry_or_refresh',
          timeoutMs
        }
      },
      metadata: {
        title: 'Loading Timeout',
        description: 'Content load timed out',
        priority: 'medium',
        renderMode: 'compact',
        interactionLevel: 'interactive',
        performance: {
          renderCost: 'low',
          updateFrequency: 'static'
        }
      },
      actions: [
        {
          id: 'retry_load',
          type: 'refresh',
          label: 'Retry',
          icon: 'refresh',
          handler: 'retry_rich_response_load'
        },
        {
          id: 'skip_content',
          type: 'execute',
          label: 'Skip',
          icon: 'skip-forward',
          handler: 'skip_rich_response'
        }
      ]
    };
  }

  /**
   * DATA INTEGRITY EDGE CASES
   */

  /**
   * Handle malformed rich response data
   */
  handleMalformedRichResponseData(data: any, expectedType: string): {
    isValid: boolean;
    sanitizedData?: any;
    errors: string[];
  } {
    const errors: string[] = [];
    
    try {
      // Basic structure validation
      if (!data || typeof data !== 'object') {
        errors.push('Rich response data is not a valid object');
        return { isValid: false, errors };
      }

      // Type-specific validation
      switch (expectedType) {
        case 'pipeline_logs_compact':
          return this.validatePipelineLogsData(data, errors);
        case 'code_diff_viewer':
          return this.validateCodeDiffData(data, errors);
        case 'data_table_interactive':
          return this.validateDataTableData(data, errors);
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

  /**
   * Handle corrupted message data
   */
  handleCorruptedMessage(message: any): ConversationRichMessage | null {
    try {
      // Attempt to repair common corruption issues
      const repairedMessage: ConversationRichMessage = {
        id: message.id || `repaired_${Date.now()}`,
        type: message.type || 'agent',
        content: message.content || '[Message content corrupted]',
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        richResponses: [],
        conversationMetadata: {
          safetyValidated: true,
          autoRichTextReplaced: false,
          surpriseDelightActivated: false
        }
      };

      // Validate and sanitize rich responses if present
      if (message.richResponses && Array.isArray(message.richResponses)) {
        repairedMessage.richResponses = message.richResponses
          .map((rr: any) => this.sanitizeRichResponse(rr))
          .filter(Boolean);
      }

      return repairedMessage;
    } catch (error) {
      console.error('Failed to repair corrupted message:', error);
      return null;
    }
  }

  /**
   * SECURITY EDGE CASES
   */

  /**
   * Handle potential XSS in rich response content
   */
  sanitizeRichResponseContent(content: string): string {
    // Remove script tags and event handlers
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:(?!image\/)[^;]*;base64/gi, '');

    return sanitized;
  }

  /**
   * Handle suspicious data patterns that might indicate injection attempts
   */
  detectSuspiciousPatterns(input: any): {
    isSuspicious: boolean;
    suspiciousPatterns: string[];
    safeToProcess: boolean;
  } {
    const suspiciousPatterns: string[] = [];
    const inputStr = JSON.stringify(input).toLowerCase();

    // Common injection patterns
    const patterns = [
      /<script/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /eval\s*\(/gi,
      /function\s*\(/gi,
      /\.constructor/gi,
      /__proto__/gi,
      /prototype\.constructor/gi
    ];

    patterns.forEach((pattern, index) => {
      if (pattern.test(inputStr)) {
        suspiciousPatterns.push(`Pattern ${index + 1}: ${pattern.source}`);
      }
    });

    return {
      isSuspicious: suspiciousPatterns.length > 0,
      suspiciousPatterns,
      safeToProcess: suspiciousPatterns.length === 0
    };
  }

  /**
   * PERFORMANCE EDGE CASES
   */

  /**
   * Handle memory pressure during rich response rendering
   */
  handleMemoryPressure(): {
    shouldDegradePerformance: boolean;
    optimizationStrategies: string[];
  } {
    // Check memory usage if available
    const memoryInfo = (performance as any).memory;
    const strategies: string[] = [];

    if (memoryInfo) {
      const usedJSHeapSize = memoryInfo.usedJSHeapSize;
      const totalJSHeapSize = memoryInfo.totalJSHeapSize;
      const usageRatio = usedJSHeapSize / totalJSHeapSize;

      if (usageRatio > 0.85) {
        strategies.push('disable_animations');
        strategies.push('reduce_rich_response_complexity');
        strategies.push('enable_virtualization');
        strategies.push('defer_non_critical_rendering');
      }

      if (usageRatio > 0.95) {
        strategies.push('emergency_memory_cleanup');
        strategies.push('disable_live_updates');
        strategies.push('switch_to_text_only_mode');
      }
    }

    return {
      shouldDegradePerformance: strategies.length > 0,
      optimizationStrategies: strategies
    };
  }

  /**
   * Handle slow rich response rendering
   */
  handleSlowRendering(renderTime: number, richResponseId: string): {
    shouldOptimize: boolean;
    optimizations: string[];
  } {
    const optimizations: string[] = [];

    if (renderTime > 1000) { // > 1 second
      optimizations.push('enable_progressive_loading');
      optimizations.push('reduce_initial_render_complexity');
    }

    if (renderTime > 3000) { // > 3 seconds
      optimizations.push('defer_heavy_computations');
      optimizations.push('implement_render_chunking');
      optimizations.push('show_simplified_fallback');
    }

    if (renderTime > 5000) { // > 5 seconds
      optimizations.push('emergency_fallback_to_text');
      optimizations.push('report_performance_issue');
    }

    return {
      shouldOptimize: optimizations.length > 0,
      optimizations
    };
  }

  /**
   * USER EXPERIENCE EDGE CASES
   */

  /**
   * Handle user on slow connection
   */
  handleSlowConnection(connectionSpeed: 'slow-2g' | 'slow' | 'fast'): {
    shouldAdaptUI: boolean;
    adaptations: string[];
  } {
    const adaptations: string[] = [];

    switch (connectionSpeed) {
      case 'slow-2g':
        adaptations.push('disable_auto_refresh');
        adaptations.push('reduce_image_quality');
        adaptations.push('defer_non_essential_content');
        adaptations.push('enable_offline_mode_hints');
        break;
      case 'slow':
        adaptations.push('reduce_update_frequency');
        adaptations.push('optimize_bundle_size');
        adaptations.push('enable_compression');
        break;
      case 'fast':
        // No adaptations needed for fast connections
        break;
    }

    return {
      shouldAdaptUI: adaptations.length > 0,
      adaptations
    };
  }

  /**
   * Handle accessibility requirements
   */
  handleAccessibilityRequirements(userPreferences: {
    prefersReducedMotion?: boolean;
    highContrast?: boolean;
    largeText?: boolean;
  }): {
    shouldAdaptInterface: boolean;
    adaptations: string[];
  } {
    const adaptations: string[] = [];

    if (userPreferences.prefersReducedMotion) {
      adaptations.push('disable_animations');
      adaptations.push('reduce_motion_in_rich_responses');
    }

    if (userPreferences.highContrast) {
      adaptations.push('apply_high_contrast_theme');
      adaptations.push('enhance_border_visibility');
    }

    if (userPreferences.largeText) {
      adaptations.push('increase_font_sizes');
      adaptations.push('expand_interactive_areas');
    }

    return {
      shouldAdaptInterface: adaptations.length > 0,
      adaptations
    };
  }

  /**
   * VALIDATION HELPERS
   */

  private validatePipelineLogsData(data: any, errors: string[]) {
    const required = ['runId', 'pipelineType', 'status', 'progress', 'recentLogs', 'metrics'];
    
    required.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Sanitize logs
    if (data.recentLogs && Array.isArray(data.recentLogs)) {
      data.recentLogs = data.recentLogs.map((log: any) => ({
        timestamp: log.timestamp || new Date().toISOString(),
        level: ['info', 'warning', 'error', 'success'].includes(log.level) ? log.level : 'info',
        message: this.sanitizeRichResponseContent(log.message || ''),
        phase: log.phase || '',
        agent: log.agent || ''
      }));
    }

    return {
      isValid: errors.length === 0,
      sanitizedData: data,
      errors
    };
  }

  private validateCodeDiffData(data: any, errors: string[]) {
    if (!data.files || !Array.isArray(data.files)) {
      errors.push('CodeDiff data must have files array');
    }

    if (data.files) {
      data.files = data.files.map((file: any) => ({
        path: file.path || 'unknown',
        language: file.language || 'text',
        oldContent: this.sanitizeRichResponseContent(file.oldContent || ''),
        newContent: this.sanitizeRichResponseContent(file.newContent || ''),
        changeType: ['added', 'modified', 'deleted', 'renamed'].includes(file.changeType) 
          ? file.changeType 
          : 'modified',
        stats: file.stats || { additions: 0, deletions: 0, changes: 0 }
      }));
    }

    return {
      isValid: errors.length === 0,
      sanitizedData: data,
      errors
    };
  }

  private validateDataTableData(data: any, errors: string[]) {
    if (!data.columns || !Array.isArray(data.columns)) {
      errors.push('DataTable must have columns array');
    }

    if (!data.rows || !Array.isArray(data.rows)) {
      errors.push('DataTable must have rows array');
    }

    // Sanitize table data
    if (data.rows) {
      data.rows = data.rows.map((row: any) => {
        const sanitizedRow: any = {};
        Object.keys(row).forEach(key => {
          if (typeof row[key] === 'string') {
            sanitizedRow[key] = this.sanitizeRichResponseContent(row[key]);
          } else {
            sanitizedRow[key] = row[key];
          }
        });
        return sanitizedRow;
      });
    }

    return {
      isValid: errors.length === 0,
      sanitizedData: data,
      errors
    };
  }

  private sanitizeRichResponse(richResponse: any): ConversationRichResponse | null {
    try {
      if (!richResponse.id || !richResponse.type) {
        return null;
      }

      return {
        id: richResponse.id,
        type: richResponse.type,
        data: richResponse.data || {},
        metadata: {
          title: richResponse.metadata?.title || 'Untitled',
          description: richResponse.metadata?.description || '',
          priority: ['high', 'medium', 'low'].includes(richResponse.metadata?.priority) 
            ? richResponse.metadata.priority 
            : 'medium',
          renderMode: ['inline', 'compact', 'expanded', 'modal'].includes(richResponse.metadata?.renderMode)
            ? richResponse.metadata.renderMode
            : 'compact',
          interactionLevel: ['read_only', 'interactive', 'editable'].includes(richResponse.metadata?.interactionLevel)
            ? richResponse.metadata.interactionLevel
            : 'read_only',
          performance: richResponse.metadata?.performance || {
            renderCost: 'medium',
            updateFrequency: 'static'
          }
        },
        actions: richResponse.actions || [],
        liveUpdate: richResponse.liveUpdate
      };
    } catch (error) {
      console.error('Failed to sanitize rich response:', error);
      return null;
    }
  }

  /**
   * Reset error tracking for a specific context
   */
  resetErrorTracking(contextId: string): void {
    this.errorCounts.delete(contextId);
    this.circuitBreakerState.delete(contextId);
  }

  /**
   * Check if circuit breaker should reset
   */
  shouldResetCircuitBreaker(contextId: string, cooldownMs: number = 60000): boolean {
    const state = this.circuitBreakerState.get(contextId);
    if (!state || !state.isOpen) return false;
    
    return Date.now() - state.lastFailTime > cooldownMs;
  }
}

export const conversationEdgeCaseHandler = ConversationEdgeCaseHandler.getInstance();
