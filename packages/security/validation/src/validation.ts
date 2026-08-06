/**
 * Production-grade input validation schemas for credential submissions
 * 
 * Comprehensive validation with security-focused rules for all credential
 * inputs, preventing injection attacks and ensuring data integrity.
 */

import { z } from 'zod';

/**
 * Base validation rules for common credential patterns
 */
const credentialValidationRules = {
  // API tokens and keys - alphanumeric with common separators
  apiToken: z.string()
    .min(8, 'API token must be at least 8 characters')
    .max(512, 'API token cannot exceed 512 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'API token contains invalid characters'),
  
  // API keys - stricter format for sensitive keys
  apiKey: z.string()
    .min(16, 'API key must be at least 16 characters')
    .max(256, 'API key cannot exceed 256 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'API key contains invalid characters'),
  
  // OAuth access tokens - base64 URL safe
  accessToken: z.string()
    .min(20, 'Access token must be at least 20 characters')
    .max(2048, 'Access token cannot exceed 2048 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Access token contains invalid characters'),
  
  // Project/Team IDs - usually alphanumeric with hyphens
  projectId: z.string()
    .min(3, 'Project ID must be at least 3 characters')
    .max(128, 'Project ID cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Project ID contains invalid characters'),
  
  // URLs - strict URL validation
  url: z.string()
    .url('Must be a valid URL')
    .max(512, 'URL cannot exceed 512 characters')
    .refine((url) => {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    }, 'URL must use HTTP or HTTPS protocol'),
  
  // AWS regions - specific format
  awsRegion: z.string()
    .min(8, 'AWS region must be at least 8 characters')
    .max(24, 'AWS region cannot exceed 24 characters')
    .regex(/^[a-z]{2}-[a-z]+-\d+$/, 'Invalid AWS region format'),
  
  // Email addresses
  email: z.string()
    .email('Must be a valid email address')
    .max(254, 'Email cannot exceed 254 characters'),
  
  // Generic identifiers
  identifier: z.string()
    .min(1, 'Identifier cannot be empty')
    .max(128, 'Identifier cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Identifier contains invalid characters')
};

/**
 * Figma connection validation schema
 */
export const FigmaConnectionSchema = z.object({
  access_token: credentialValidationRules.accessToken,
  refresh_token: credentialValidationRules.accessToken.optional(),
  token_expires_at: z.string().datetime().optional(),
  team_id: credentialValidationRules.identifier,
  team_name: z.string()
    .min(1, 'Team name cannot be empty')
    .max(256, 'Team name cannot exceed 256 characters')
    .trim(),
  user_name: z.string()
    .min(1, 'User name cannot be empty')
    .max(256, 'User name cannot exceed 256 characters')
    .trim(),
  user_email: credentialValidationRules.email
}).strict();

/**
 * GitHub connection validation schema
 */
export const GitHubConnectionSchema = z.object({
  access_token: credentialValidationRules.accessToken,
  refresh_token: credentialValidationRules.accessToken.optional(),
  token_expires_at: z.string().datetime().optional(),
  connection_id: z.string()
    .regex(/^\d+$/, 'Installation ID must be numeric')
    .max(32, 'Installation ID cannot exceed 32 characters'),
  user_login: z.string()
    .min(1, 'User login cannot be empty')
    .max(39, 'GitHub username cannot exceed 39 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Invalid GitHub username format'),
  user_email: credentialValidationRules.email.optional()
}).strict();

/**
 * API key generation validation schema
 */
export const ApiKeyGenerationSchema = z.object({
  name: z.string()
    .min(1, 'API key name cannot be empty')
    .max(128, 'API key name cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'API key name contains invalid characters')
    .trim(),
  expire_at: z.string().datetime().optional()
    .refine((date) => {
      if (!date) return true;
      const expiry = new Date(date);
      const now = new Date();
      const maxExpiry = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year max
      return expiry > now && expiry <= maxExpiry;
    }, 'Expiry date must be in the future and within 1 year')
}).strict();

/**
 * MCP configuration validation schemas
 */
export const SupabaseMCPConfigSchema = z.object({
  apiUrl: credentialValidationRules.url
    .refine((url) => url.includes('.supabase.co'), 'Must be a valid Supabase URL'),
  apiKey: credentialValidationRules.apiKey,
  projectId: credentialValidationRules.projectId
}).strict();

export const AWSMCPConfigSchema = z.object({
  accessKeyId: z.string()
    .min(16, 'AWS Access Key ID must be at least 16 characters')
    .max(128, 'AWS Access Key ID cannot exceed 128 characters')
    .regex(/^[A-Z0-9]+$/, 'AWS Access Key ID must be uppercase alphanumeric'),
  secretAccessKey: z.string()
    .min(40, 'AWS Secret Access Key must be at least 40 characters')
    .max(128, 'AWS Secret Access Key cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9\/\+]+$/, 'AWS Secret Access Key contains invalid characters'),
  region: credentialValidationRules.awsRegion
}).strict();

export const VercelMCPConfigSchema = z.object({
  apiToken: credentialValidationRules.apiToken,
  teamId: credentialValidationRules.identifier.optional(),
  projectId: credentialValidationRules.projectId
}).strict();

export const GitHubMCPConfigSchema = z.object({
  token: credentialValidationRules.apiToken,
  owner: z.string()
    .min(1, 'GitHub owner cannot be empty')
    .max(39, 'GitHub owner cannot exceed 39 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Invalid GitHub owner format'),
  repo: z.string()
    .min(1, 'GitHub repository cannot be empty')
    .max(100, 'GitHub repository name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid GitHub repository format')
}).strict();

/**
 * OAuth callback validation schemas
 */
export const OAuthCallbackSchema = z.object({
  code: z.string()
    .min(8, 'OAuth code must be at least 8 characters')
    .max(512, 'OAuth code cannot exceed 512 characters')
    .regex(/^[a-zA-Z0-9_\-\.]+$/, 'OAuth code contains invalid characters'),
  state: z.string()
    .min(8, 'OAuth state must be at least 8 characters')
    .max(512, 'OAuth state cannot exceed 512 characters')
    .regex(/^[a-zA-Z0-9_\-\.\/\+\=]+$/, 'OAuth state contains invalid characters'),
  error: z.string().optional(),
  error_description: z.string().max(512, 'Error description too long').optional()
}).strict();

/**
 * Rate limiting validation schema
 */
export const RateLimitRequestSchema = z.object({
  ip: z.string().ip('Invalid IP address').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  endpoint: z.string()
    .min(1, 'Endpoint cannot be empty')
    .max(256, 'Endpoint cannot exceed 256 characters')
    .regex(/^\/[a-zA-Z0-9_\-\/]*$/, 'Invalid endpoint format'),
  userAgent: z.string()
    .max(512, 'User agent cannot exceed 512 characters')
    .optional()
}).strict();

/**
 * Credential update validation schema
 */
export const CredentialUpdateSchema = z.object({
  operation: z.enum(['encrypt', 'rotate', 'refresh', 'revoke']),
  resourceType: z.enum(['figma_connection', 'github_connection', 'api_key', 'oauth_token']),
  resourceId: z.string().uuid('Invalid resource ID'),
  metadata: z.record(z.any()).optional()
}).strict();

/**
 * Audit log entry validation schema
 */
export const AuditLogEntrySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  eventType: z.string()
    .min(1, 'Event type cannot be empty')
    .max(64, 'Event type cannot exceed 64 characters')
    .regex(/^[a-z_]+$/, 'Event type must be lowercase with underscores'),
  resourceType: z.string()
    .min(1, 'Resource type cannot be empty')
    .max(64, 'Resource type cannot exceed 64 characters')
    .regex(/^[a-z_]+$/, 'Resource type must be lowercase with underscores'),
  resourceId: z.string().uuid('Invalid resource ID').optional(),
  success: z.boolean(),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().max(512, 'User agent cannot exceed 512 characters').optional(),
  requestId: z.string()
    .max(128, 'Request ID cannot exceed 128 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Request ID contains invalid characters')
    .optional(),
  errorCode: z.string()
    .max(64, 'Error code cannot exceed 64 characters')
    .regex(/^[A-Z_]+$/, 'Error code must be uppercase with underscores')
    .optional(),
  metadata: z.record(z.any()).optional()
}).strict();

/**
 * Validation helper functions
 */
export const ValidationHelpers = {
  /**
   * Validate and sanitize input data
   */
  validateAndSanitize: <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    return result.data;
  },

  /**
   * Check if a string contains potentially malicious content
   */
  containsMaliciousContent: (input: string): boolean => {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /\beval\b/i,
      /\bexec\b/i,
      /\.\.\//,
      /[<>'"]/
    ];
    return maliciousPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Sanitize string input by removing dangerous characters
   */
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>'"]/g, '') // Remove HTML/script injection chars
      .replace(/\.\.\//g, '') // Remove path traversal
      .trim();
  },

  /**
   * Validate credential strength (for user-generated credentials)
   */
  validateCredentialStrength: (credential: string): {
    isStrong: boolean;
    score: number;
    reasons: string[];
  } => {
    const reasons: string[] = [];
    let score = 0;

    if (credential.length >= 16) score += 2;
    else if (credential.length >= 12) score += 1;
    else reasons.push('Too short (minimum 12 characters)');

    if (/[a-z]/.test(credential)) score += 1;
    else reasons.push('Missing lowercase letters');

    if (/[A-Z]/.test(credential)) score += 1;
    else reasons.push('Missing uppercase letters');

    if (/\d/.test(credential)) score += 1;
    else reasons.push('Missing numbers');

    if (/[^a-zA-Z0-9]/.test(credential)) score += 1;
    else reasons.push('Missing special characters');

    // Check for common patterns
    if (!/(.)\1{2,}/.test(credential)) score += 1;
    else reasons.push('Contains repeated characters');

    return {
      isStrong: score >= 5,
      score,
      reasons
    };
  }
};

/**
 * Type exports for use in application code
 */
export type FigmaConnectionData = z.infer<typeof FigmaConnectionSchema>;
export type GitHubConnectionData = z.infer<typeof GitHubConnectionSchema>;
export type ApiKeyGenerationData = z.infer<typeof ApiKeyGenerationSchema>;
export type SupabaseMCPConfigData = z.infer<typeof SupabaseMCPConfigSchema>;
export type AWSMCPConfigData = z.infer<typeof AWSMCPConfigSchema>;
export type VercelMCPConfigData = z.infer<typeof VercelMCPConfigSchema>;
export type GitHubMCPConfigData = z.infer<typeof GitHubMCPConfigSchema>;
export type OAuthCallbackData = z.infer<typeof OAuthCallbackSchema>;
export type RateLimitRequestData = z.infer<typeof RateLimitRequestSchema>;
export type CredentialUpdateData = z.infer<typeof CredentialUpdateSchema>;
export type AuditLogEntryData = z.infer<typeof AuditLogEntrySchema>;