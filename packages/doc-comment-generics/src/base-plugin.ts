/**
 * BASE DOC-COMMENT PLUGIN - Production Excellence Foundation
 * 
 * This abstract base class provides the foundational architecture for all
 * doc-comment plugins. It ensures consistency, type safety, and production
 * readiness across the entire plugin ecosystem.
 * 
 * @doc-plugin-meta
 * version: 1.0.0
 * pattern: plugin-excellence
 * architecture: "Base class ensuring consistent plugin implementation patterns"
 */

import { DocCommentPlugin, DocComment } from './types';

/**
 * Base metadata that all doc-comments must provide
 */
export interface BaseDocMetadata {
  /** Version of the documented entity */
  version: string;
  /** Category or type classification */
  category: string;
  /** Optional description */
  description?: string;
  /** Additional metadata fields */
  [key: string]: unknown;
}

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Structured validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Abstract base class for all doc-comment plugins
 */
export abstract class BaseDocCommentPlugin<T extends BaseDocMetadata> implements DocCommentPlugin {
  abstract name: string;
  abstract pattern: RegExp;
  
  /**
   * Check if this plugin matches the comment
   */
  matches(comment: DocComment): boolean {
    return this.pattern.test(comment.label);
  }
  
  /**
   * Parse comment into structured metadata
   */
  parse(comment: DocComment): T {
    try {
      const metadata = this.parseMetadata(comment);
      const validation = this.validateMetadata(metadata);
      
      if (!validation.valid) {
        this.handleValidationErrors(validation.errors, comment);
      }
      
      return metadata;
    } catch (error) {
      this.handleParseError(error, comment);
      return this.getDefaultMetadata(comment);
    }
  }
  
  /**
   * Validate parsed metadata
   */
  validate(parsed: T): boolean {
    const validation = this.validateMetadata(parsed);
    return validation.valid;
  }
  
  /**
   * Abstract method: Parse comment into metadata
   */
  protected abstract parseMetadata(comment: DocComment): T;
  
  /**
   * Abstract method: Validate metadata structure
   */
  protected abstract validateMetadata(metadata: T): ValidationResult;
  
  /**
   * Abstract method: Get default metadata when parsing fails
   */
  protected abstract getDefaultMetadata(comment: DocComment): T;
  
  /**
   * Handle validation errors
   */
  protected handleValidationErrors(errors: ValidationError[], comment: DocComment): void {
    for (const error of errors) {
      if (error.severity === 'error') {
        console.error(`[${this.name}] ${error.field}: ${error.message}`);
      } else {
        console.warn(`[${this.name}] ${error.field}: ${error.message}`);
      }
    }
  }
  
  /**
   * Handle parse errors
   */
  protected handleParseError(error: unknown, comment: DocComment): void {
    console.error(`[${this.name}] Parse error at ${comment.pos || 'unknown'}:`, error);
  }
  
  // ==================== COMMON PARSERS ====================
  
  /**
   * Parse version with validation
   */
  protected parseVersion(value: unknown, defaultVersion = '1.0.0'): string {
    const version = String(value || defaultVersion);
    if (!/^\d+\.\d+\.\d+/.test(version)) {
      console.warn(`[${this.name}] Invalid version format: ${version}`);
      return defaultVersion;
    }
    return version;
  }
  
  /**
   * Parse enum value with validation
   */
  protected parseEnum<E extends string>(
    value: unknown,
    validValues: readonly E[],
    defaultValue: E
  ): E {
    const parsed = String(value || defaultValue).toLowerCase() as E;
    if (!validValues.includes(parsed)) {
      console.warn(`[${this.name}] Invalid enum value: ${parsed}`);
      return defaultValue;
    }
    return parsed;
  }
  
  /**
   * Parse array of strings
   */
  protected parseStringArray(value: unknown, defaultValue: string[] = []): string[] {
    if (!value) return defaultValue;
    
    if (Array.isArray(value)) {
      return value.map(v => String(v));
    }
    
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(v => String(v));
        }
      } catch {
        // Try splitting by common delimiters
        if (value.includes(',')) {
          return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [value.trim()].filter(Boolean);
      }
    }
    
    return defaultValue;
  }
  
  /**
   * Parse boolean value
   */
  protected parseBoolean(value: unknown, defaultValue?: boolean): boolean | undefined {
    if (value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return defaultValue;
  }
  
  /**
   * Parse number value with validation
   */
  protected parseNumber(
    value: unknown,
    options: {
      min?: number;
      max?: number;
      defaultValue?: number;
    } = {}
  ): number | undefined {
    if (value === undefined) return options.defaultValue;
    
    const parsed = Number(value);
    if (isNaN(parsed)) {
      console.warn(`[${this.name}] Invalid number: ${value}`);
      return options.defaultValue;
    }
    
    if (options.min !== undefined && parsed < options.min) {
      console.warn(`[${this.name}] Number ${parsed} below minimum ${options.min}`);
      return options.min;
    }
    
    if (options.max !== undefined && parsed > options.max) {
      console.warn(`[${this.name}] Number ${parsed} above maximum ${options.max}`);
      return options.max;
    }
    
    return parsed;
  }
  
  /**
   * Parse object value
   */
  protected parseObject<O extends Record<string, unknown>>(
    value: unknown,
    defaultValue: O
  ): O {
    if (!value) return defaultValue;
    
    if (typeof value === 'object' && value !== null) {
      return value as O;
    }
    
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as O;
        }
      } catch {
        console.warn(`[${this.name}] Invalid JSON object: ${value}`);
      }
    }
    
    return defaultValue;
  }
  
  // ==================== VALIDATION HELPERS ====================
  
  /**
   * Create validation result
   */
  protected createValidationResult(errors: ValidationError[] = []): ValidationResult {
    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }
  
  /**
   * Add validation error
   */
  protected addError(
    errors: ValidationError[],
    field: string,
    message: string,
    severity: 'error' | 'warning' = 'error'
  ): void {
    errors.push({ field, message, severity });
  }
  
  /**
   * Validate required field
   */
  protected validateRequired(
    errors: ValidationError[],
    value: unknown,
    field: string
  ): boolean {
    if (value === undefined || value === null || value === '') {
      this.addError(errors, field, `${field} is required`);
      return false;
    }
    return true;
  }
  
  /**
   * Validate version format
   */
  protected validateVersion(
    errors: ValidationError[],
    version: string,
    field = 'version'
  ): boolean {
    if (!/^\d+\.\d+\.\d+/.test(version)) {
      this.addError(errors, field, `Invalid version format: ${version}`);
      return false;
    }
    return true;
  }
  
  /**
   * Validate enum value
   */
  protected validateEnum<E extends string>(
    errors: ValidationError[],
    value: E,
    validValues: readonly E[],
    field: string
  ): boolean {
    if (!validValues.includes(value)) {
      this.addError(
        errors,
        field,
        `Invalid ${field}: ${value}. Must be one of: ${validValues.join(', ')}`
      );
      return false;
    }
    return true;
  }
  
  /**
   * Validate number range
   */
  protected validateNumberRange(
    errors: ValidationError[],
    value: number | undefined,
    min: number,
    max: number,
    field: string
  ): boolean {
    if (value === undefined) return true;
    
    if (value < min || value > max) {
      this.addError(
        errors,
        field,
        `${field} must be between ${min} and ${max}, got ${value}`
      );
      return false;
    }
    return true;
  }
}

