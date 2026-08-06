/**
 * Production-grade audit logging for credential operations
 * 
 * Provides comprehensive audit trails for all credential-related operations
 * without exposing sensitive data in logs.
 */

import { log } from '@bitcode/logger';

/**
 * Audit event types for credential operations
 */
export enum AuditEventType {
  // Credential lifecycle events
  CREDENTIAL_CREATED = 'credential_created',
  CREDENTIAL_ACCESSED = 'credential_accessed', 
  CREDENTIAL_UPDATED = 'credential_updated',
  CREDENTIAL_DELETED = 'credential_deleted',
  CREDENTIAL_ENCRYPTED = 'credential_encrypted',
  CREDENTIAL_DECRYPTED = 'credential_decrypted',
  CREDENTIAL_ROTATION = 'credential_rotation',
  
  // Authentication events
  AUTHENTICATION_ATTEMPT = 'authentication_attempt',
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILED = 'authentication_failed',
  OAUTH_CALLBACK = 'oauth_callback',
  API_KEY_USAGE = 'api_key_usage',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  VALIDATION_FAILED = 'validation_failed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  
  // MCP events
  MCP_CONFIGURATION = 'mcp_configuration',
  MCP_TOOL_ACCESS = 'mcp_tool_access',
  MCP_PROVIDER_AUTH = 'mcp_provider_auth'
}

/**
 * Resource types for audit logging
 */
export enum ResourceType {
  FIGMA_CONNECTION = 'figma_connection',
  GITHUB_CONNECTION = 'github_connection',
  API_KEY = 'api_key',
  OAUTH_TOKEN = 'oauth_token',
  MCP_CONFIG = 'mcp_config',
  USER_SESSION = 'user_session'
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  readonly id?: string;
  readonly userId: string;
  readonly eventType: AuditEventType;
  readonly resourceType: ResourceType;
  readonly resourceId?: string;
  readonly success: boolean;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly requestId?: string;
  readonly errorCode?: string;
  readonly metadata: Record<string, any>;
  readonly timestamp: Date;
}

/**
 * Audit context for capturing request information
 */
export interface AuditContext {
  readonly userId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly additionalMetadata?: Record<string, any>;
}

/**
 * Audit logging configuration
 */
interface AuditConfig {
  readonly enabled: boolean;
  readonly logLevel: 'info' | 'warn' | 'error';
  readonly includeMetadata: boolean;
  readonly sanitizeData: boolean;
  readonly maxMetadataSize: number;
  readonly retentionDays: number;
}

/**
 * Default audit configuration
 */
const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  logLevel: 'info',
  includeMetadata: true,
  sanitizeData: true,
  maxMetadataSize: 1024, // 1KB max metadata
  retentionDays: 90
};

/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const keyLower = key.toLowerCase();
    
    // Skip sensitive fields
    if (keyLower.includes('token') || 
        keyLower.includes('secret') || 
        keyLower.includes('password') ||
        keyLower.includes('key') ||
        keyLower.includes('credential')) {
      // Provide a hint about the data type without exposing it
      if (typeof value === 'string' && value.length > 0) {
        sanitized[key] = `[REDACTED:${value.length}chars]`;
      } else {
        sanitized[key] = '[REDACTED]';
      }
      continue;
    }
    
    // Truncate long strings
    if (typeof value === 'string' && value.length > 256) {
      sanitized[key] = value.substring(0, 256) + '...[TRUNCATED]';
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
      continue;
    }
    
    // Keep safe values as-is
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Truncate metadata if it exceeds size limit
 */
function truncateMetadata(metadata: Record<string, any>, maxSize: number): Record<string, any> {
  const serialized = JSON.stringify(metadata);
  
  if (serialized.length <= maxSize) {
    return metadata;
  }
  
  // If too large, keep only essential fields
  const essential = {
    operation_type: metadata.operation_type,
    resource_type: metadata.resource_type,
    timestamp: metadata.timestamp,
    success: metadata.success,
    truncated: true,
    original_size: serialized.length
  };
  
  return essential;
}

/**
 * Create an audit log entry
 */
export async function auditLog(
  eventType: AuditEventType,
  resourceType: ResourceType,
  context: AuditContext,
  options: {
    resourceId?: string;
    success?: boolean;
    errorCode?: string;
    metadata?: Record<string, any>;
    config?: Partial<AuditConfig>;
  } = {}
): Promise<void> {
  const config = { ...DEFAULT_AUDIT_CONFIG, ...options.config };
  
  if (!config.enabled) {
    return;
  }
  
  try {
    let metadata = options.metadata || {};
    
    // Add context information to metadata
    metadata = {
      ...metadata,
      event_type: eventType,
      resource_type: resourceType,
      timestamp: new Date().toISOString(),
      user_agent: context.userAgent,
      session_id: context.sessionId,
      ...context.additionalMetadata
    };
    
    // Sanitize sensitive data if enabled
    if (config.sanitizeData) {
      metadata = sanitizeMetadata(metadata);
    }
    
    // Truncate if too large
    if (config.includeMetadata) {
      metadata = truncateMetadata(metadata, config.maxMetadataSize);
    }
    
    const auditEntry: AuditLogEntry = {
      userId: context.userId,
      eventType,
      resourceType,
      resourceId: options.resourceId,
      success: options.success ?? true,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      errorCode: options.errorCode,
      metadata: config.includeMetadata ? metadata : {},
      timestamp: new Date()
    };
    
    // Log to application logger
    log(`Audit: ${eventType}`, config.logLevel, {
      userId: context.userId,
      eventType,
      resourceType,
      resourceId: options.resourceId,
      success: auditEntry.success,
      ipAddress: context.ipAddress ? context.ipAddress.substring(0, 8) + '***' : undefined,
      requestId: context.requestId,
      errorCode: options.errorCode,
      metadataKeys: Object.keys(metadata)
    });
    
    // TODO: In production, also store in database
    // await storeAuditEntry(auditEntry);
    
  } catch (error) {
    // Never let audit logging break the main flow
    log('Audit logging failed', 'error', {
      eventType,
      resourceType,
      userId: context.userId,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Create audit context from request
 */
export function createAuditContext(
  userId: string,
  request?: {
    ip?: string;
    headers?: Record<string, string | string[] | undefined>;
    requestId?: string;
  },
  additionalMetadata?: Record<string, any>
): AuditContext {
  return {
    userId,
    ipAddress: request?.ip || 
               (Array.isArray(request?.headers?.['x-forwarded-for']) 
                ? request.headers['x-forwarded-for'][0] 
                : request?.headers?.['x-forwarded-for']) ||
               (Array.isArray(request?.headers?.['x-real-ip'])
                ? request.headers['x-real-ip'][0]
                : request?.headers?.['x-real-ip']) ||
               undefined,
    userAgent: Array.isArray(request?.headers?.['user-agent'])
               ? request.headers['user-agent'][0]
               : request?.headers?.['user-agent'] || undefined,
    requestId: request?.requestId ||
               (Array.isArray(request?.headers?.['x-request-id'])
                ? request.headers['x-request-id'][0]
                : request?.headers?.['x-request-id']) ||
               undefined,
    additionalMetadata
  };
}

/**
 * Audit credential operation wrapper
 */
export async function auditCredentialOperation<T>(
  operation: () => Promise<T>,
  eventType: AuditEventType,
  resourceType: ResourceType,
  context: AuditContext,
  resourceId?: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    await auditLog(eventType, resourceType, context, {
      resourceId,
      success: true,
      metadata: {
        operation_duration_ms: Date.now() - startTime,
        result_type: typeof result
      }
    });
    
    return result;
    
  } catch (error) {
    await auditLog(eventType, resourceType, context, {
      resourceId,
      success: false,
      errorCode: error instanceof Error ? error.constructor.name : 'UnknownError',
      metadata: {
        operation_duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : String(error)
      }
    });
    
    throw error;
  }
}

/**
 * Audit authentication attempt
 */
export async function auditAuthAttempt(
  context: AuditContext,
  success: boolean,
  authMethod: string,
  errorCode?: string
): Promise<void> {
  await auditLog(
    success ? AuditEventType.AUTHENTICATION_SUCCESS : AuditEventType.AUTHENTICATION_FAILED,
    ResourceType.USER_SESSION,
    context,
    {
      success,
      errorCode,
      metadata: {
        auth_method: authMethod,
        timestamp: new Date().toISOString()
      }
    }
  );
}

/**
 * Audit MCP configuration change
 */
export async function auditMCPConfig(
  context: AuditContext,
  mcpProvider: string,
  operation: 'create' | 'update' | 'delete',
  success: boolean,
  errorCode?: string
): Promise<void> {
  await auditLog(
    AuditEventType.MCP_CONFIGURATION,
    ResourceType.MCP_CONFIG,
    context,
    {
      success,
      errorCode,
      metadata: {
        mcp_provider: mcpProvider,
        operation,
        timestamp: new Date().toISOString()
      }
    }
  );
}

/**
 * Audit rate limit exceeded
 */
export async function auditRateLimitExceeded(
  context: AuditContext,
  endpoint: string,
  limit: number,
  current: number
): Promise<void> {
  await auditLog(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    ResourceType.USER_SESSION,
    context,
    {
      success: false,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      metadata: {
        endpoint,
        limit,
        current,
        timestamp: new Date().toISOString()
      }
    }
  );
}