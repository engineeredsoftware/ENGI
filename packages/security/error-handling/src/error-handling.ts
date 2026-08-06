/**
 * Secure error handling utilities to prevent information disclosure
 * 
 * Provides safe error message generation that prevents sensitive information
 * leakage while maintaining useful debugging capabilities for development.
 */

import { log } from '@bitcode/logger';

/**
 * Error categories for different types of security-sensitive operations
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RATE_LIMITING = 'rate_limiting',
  CREDENTIAL_MANAGEMENT = 'credential_management',
  ENCRYPTION = 'encryption',
  NETWORK = 'network',
  SYSTEM = 'system'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Secure error response interface
 */
export interface SecureErrorResponse {
  readonly error: string;
  readonly message: string;
  readonly code?: string;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly details?: Record<string, any>;
}

/**
 * Internal error context for logging
 */
export interface ErrorContext {
  readonly originalError: Error;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly userId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly requestId?: string;
  readonly additionalContext?: Record<string, any>;
}

/**
 * Safe error messages that don't reveal sensitive information
 */
const SAFE_ERROR_MESSAGES: Record<ErrorCategory, Record<string, string>> = {
  [ErrorCategory.AUTHENTICATION]: {
    'INVALID_CREDENTIALS': 'Invalid username or password',
    'ACCOUNT_LOCKED': 'Account temporarily locked due to multiple failed attempts',
    'TOKEN_EXPIRED': 'Authentication token has expired',
    'TOKEN_INVALID': 'Invalid authentication token',
    'SESSION_EXPIRED': 'Session has expired, please log in again',
    'MFA_REQUIRED': 'Multi-factor authentication required',
    'MFA_INVALID': 'Invalid verification code',
    'OAUTH_ERROR': 'Authentication with external provider failed',
    'DEFAULT': 'Authentication failed'
  },
  
  [ErrorCategory.AUTHORIZATION]: {
    'INSUFFICIENT_PERMISSIONS': 'Insufficient permissions to perform this action',
    'RESOURCE_NOT_FOUND': 'Requested resource not found',
    'ACCESS_DENIED': 'Access denied',
    'FORBIDDEN_OPERATION': 'Operation not permitted',
    'DEFAULT': 'Access denied'
  },
  
  [ErrorCategory.VALIDATION]: {
    'INVALID_INPUT': 'Invalid input provided',
    'REQUIRED_FIELD': 'Required field missing',
    'FORMAT_ERROR': 'Invalid data format',
    'LENGTH_ERROR': 'Input length exceeds limits',
    'TYPE_ERROR': 'Invalid data type',
    'CONSTRAINT_VIOLATION': 'Data validation failed',
    'DEFAULT': 'Input validation failed'
  },
  
  [ErrorCategory.RATE_LIMITING]: {
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later.',
    'QUOTA_EXCEEDED': 'Usage quota exceeded',
    'THROTTLED': 'Request throttled due to high usage',
    'DEFAULT': 'Too many requests'
  },
  
  [ErrorCategory.CREDENTIAL_MANAGEMENT]: {
    'CREDENTIAL_NOT_FOUND': 'Credential not found',
    'CREDENTIAL_EXPIRED': 'Credential has expired',
    'CREDENTIAL_INVALID': 'Invalid credential format',
    'ROTATION_FAILED': 'Credential rotation failed',
    'ENCRYPTION_FAILED': 'Security operation failed',
    'DECRYPTION_FAILED': 'Security operation failed',
    'DEFAULT': 'Credential operation failed'
  },
  
  [ErrorCategory.ENCRYPTION]: {
    'ENCRYPTION_ERROR': 'Data protection operation failed',
    'DECRYPTION_ERROR': 'Data protection operation failed',
    'KEY_ERROR': 'Security key operation failed',
    'INVALID_FORMAT': 'Invalid security data format',
    'DEFAULT': 'Security operation failed'
  },
  
  [ErrorCategory.NETWORK]: {
    'CONNECTION_ERROR': 'Network connection failed',
    'TIMEOUT': 'Request timed out',
    'SERVICE_UNAVAILABLE': 'Service temporarily unavailable',
    'EXTERNAL_API_ERROR': 'External service error',
    'DEFAULT': 'Network error occurred'
  },
  
  [ErrorCategory.SYSTEM]: {
    'INTERNAL_ERROR': 'An unexpected error occurred',
    'SERVICE_ERROR': 'Service temporarily unavailable',
    'CONFIGURATION_ERROR': 'System configuration error',
    'DATABASE_ERROR': 'Data operation failed',
    'DEFAULT': 'System error occurred'
  }
};

/**
 * Patterns that should never appear in user-facing error messages
 */
const SENSITIVE_PATTERNS = [
  // Database and SQL patterns
  /sql/i,
  /database/i,
  /table/i,
  /column/i,
  /constraint/i,
  /foreign key/i,
  /primary key/i,
  
  // File system patterns
  /file not found/i,
  /permission denied/i,
  /access denied/i,
  /directory/i,
  /path/i,
  
  // Internal system patterns
  /stack trace/i,
  /exception/i,
  /internal server error/i,
  /null pointer/i,
  /undefined/i,
  
  // Network and infrastructure
  /connection refused/i,
  /port/i,
  /hostname/i,
  /ip address/i,
  /socket/i,
  
  // Security-sensitive patterns
  /token/i,
  /key/i,
  /secret/i,
  /password/i,
  /credential/i,
  /hash/i,
  /cipher/i,
  /encryption/i,
  /decrypt/i
];

/**
 * Secure error handler class
 */
export class SecureErrorHandler {
  private readonly environment: 'development' | 'staging' | 'production';
  private readonly errorCounter = new Map<string, number>();
  
  constructor(environment: 'development' | 'staging' | 'production' = 'production') {
    this.environment = environment;
  }

  /**
   * Create a secure error response that doesn't leak sensitive information
   */
  createSecureErrorResponse(
    context: ErrorContext,
    customMessage?: string
  ): SecureErrorResponse {
    const errorId = this.generateErrorId();
    const category = context.category;
    const originalMessage = context.originalError.message;
    
    // Log detailed error internally
    this.logInternalError(context, errorId);
    
    // Determine safe message for user
    const safeMessage = this.getSafeErrorMessage(
      category, 
      originalMessage, 
      customMessage
    );
    
    const details =
      this.environment !== 'production'
        ? {
            originalError: originalMessage,
            errorId,
            category: context.category,
            severity: context.severity
          }
        : undefined;

    // Create response
    const response: SecureErrorResponse = {
      error: category,
      message: safeMessage,
      code: this.getErrorCode(context),
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      ...(details ? { details } : {})
    };
    
    return response;
  }

  /**
   * Get safe error message that doesn't expose sensitive information
   */
  private getSafeErrorMessage(
    category: ErrorCategory,
    originalMessage: string,
    customMessage?: string
  ): string {
    // Use custom message if provided and safe
    if (customMessage && !this.containsSensitiveInformation(customMessage)) {
      return customMessage;
    }
    
    // Try to find specific safe message based on original error
    const categoryMessages = SAFE_ERROR_MESSAGES[category];
    
    // Look for specific error patterns
    for (const [errorType, safeMessage] of Object.entries(categoryMessages)) {
      if (errorType !== 'DEFAULT' && 
          originalMessage.toLowerCase().includes(errorType.toLowerCase().replace('_', ' '))) {
        return safeMessage;
      }
    }
    
    // Return default message for category
    return categoryMessages.DEFAULT;
  }

  /**
   * Check if a message contains sensitive information
   */
  private containsSensitiveInformation(message: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ERR_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Get standardized error code
   */
  private getErrorCode(context: ErrorContext): string {
    const category = context.category.toUpperCase();
    const severity = context.severity.toUpperCase();
    const hash = this.hashString(context.originalError.message).substring(0, 4);
    return `${category}_${severity}_${hash}`;
  }

  /**
   * Simple string hash for error codes
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Log detailed error information internally
   */
  private logInternalError(context: ErrorContext, errorId: string): void {
    const errorKey = `${context.category}_${context.originalError.constructor.name}`;
    const currentCount = this.errorCounter.get(errorKey) || 0;
    this.errorCounter.set(errorKey, currentCount + 1);

    log(`Secure error handled: ${errorId}`, 'error', {
      errorId,
      category: context.category,
      severity: context.severity,
      errorType: context.originalError.constructor.name,
      errorMessage: context.originalError.message,
      userId: context.userId,
      ipAddress: context.ipAddress ? context.ipAddress.substring(0, 8) + '***' : undefined,
      userAgent: context.userAgent ? context.userAgent.substring(0, 50) + '...' : undefined,
      requestId: context.requestId,
      errorCount: currentCount + 1,
      stack: this.environment === 'development' ? context.originalError.stack : undefined,
      additionalContext: context.additionalContext
    });
  }

  /**
   * Handle authentication errors securely
   */
  handleAuthenticationError(
    error: Error,
    userId?: string,
    ipAddress?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      userId,
      ipAddress,
      requestId
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Handle authorization errors securely
   */
  handleAuthorizationError(
    error: Error,
    userId?: string,
    requestedResource?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      userId,
      requestId,
      additionalContext: { requestedResource }
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Handle validation errors securely
   */
  handleValidationError(
    error: Error,
    fieldName?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      requestId,
      additionalContext: { fieldName }
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Handle credential management errors securely
   */
  handleCredentialError(
    error: Error,
    operation: string,
    userId?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.CREDENTIAL_MANAGEMENT,
      severity: ErrorSeverity.HIGH,
      userId,
      requestId,
      additionalContext: { operation }
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Handle rate limiting errors
   */
  handleRateLimitError(
    error: Error,
    userId?: string,
    ipAddress?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.RATE_LIMITING,
      severity: ErrorSeverity.LOW,
      userId,
      ipAddress,
      requestId
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Handle system errors securely
   */
  handleSystemError(
    error: Error,
    component?: string,
    requestId?: string
  ): SecureErrorResponse {
    const context: ErrorContext = {
      originalError: error,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      requestId,
      additionalContext: { component }
    };

    return this.createSecureErrorResponse(context);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Record<string, number> {
    return Object.fromEntries(this.errorCounter.entries());
  }

  /**
   * Clear error statistics
   */
  clearStatistics(): void {
    this.errorCounter.clear();
  }
}

/**
 * Utility functions for secure error handling
 */
export const ErrorUtils = {
  /**
   * Sanitize error message for safe display
   */
  sanitizeErrorMessage: (message: string): string => {
    let sanitized = message;
    
    // Remove sensitive patterns
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    // Remove file paths
    sanitized = sanitized.replace(/[A-Za-z]:[\\\\/][^\s]+/g, '[PATH]');
    sanitized = sanitized.replace(/\/[^\s]+/g, '[PATH]');
    
    // Remove IP addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
    
    // Remove UUIDs
    sanitized = sanitized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[UUID]');
    
    // Remove email addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
    
    return sanitized;
  },

  /**
   * Check if error should be logged at higher severity
   */
  isHighSeverityError: (error: Error): boolean => {
    const highSeverityPatterns = [
      /security/i,
      /authentication/i,
      /authorization/i,
      /credential/i,
      /token/i,
      /permission/i,
      /access denied/i
    ];
    
    return highSeverityPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.constructor.name)
    );
  },

  /**
   * Extract safe context from error for logging
   */
  extractSafeContext: (error: Error): Record<string, any> => {
    return {
      name: error.constructor.name,
      messageLength: error.message.length,
      hasStack: !!error.stack,
      timestamp: new Date().toISOString()
    };
  }
};

// Default instance for easy usage
export const secureErrorHandler = new SecureErrorHandler(
  (process.env.NODE_ENV as any) || 'production'
);
