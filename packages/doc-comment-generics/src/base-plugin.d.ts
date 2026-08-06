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
export declare abstract class BaseDocCommentPlugin<T extends BaseDocMetadata> implements DocCommentPlugin {
    abstract name: string;
    abstract pattern: RegExp;
    /**
     * Check if this plugin matches the comment
     */
    matches(comment: DocComment): boolean;
    /**
     * Parse comment into structured metadata
     */
    parse(comment: DocComment): T;
    /**
     * Validate parsed metadata
     */
    validate(parsed: T): boolean;
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
    protected handleValidationErrors(errors: ValidationError[], comment: DocComment): void;
    /**
     * Handle parse errors
     */
    protected handleParseError(error: unknown, comment: DocComment): void;
    /**
     * Parse version with validation
     */
    protected parseVersion(value: unknown, defaultVersion?: string): string;
    /**
     * Parse enum value with validation
     */
    protected parseEnum<E extends string>(value: unknown, validValues: readonly E[], defaultValue: E): E;
    /**
     * Parse array of strings
     */
    protected parseStringArray(value: unknown, defaultValue?: string[]): string[];
    /**
     * Parse boolean value
     */
    protected parseBoolean(value: unknown, defaultValue?: boolean): boolean | undefined;
    /**
     * Parse number value with validation
     */
    protected parseNumber(value: unknown, options?: {
        min?: number;
        max?: number;
        defaultValue?: number;
    }): number | undefined;
    /**
     * Parse object value
     */
    protected parseObject<O extends Record<string, unknown>>(value: unknown, defaultValue: O): O;
    /**
     * Create validation result
     */
    protected createValidationResult(errors?: ValidationError[]): ValidationResult;
    /**
     * Add validation error
     */
    protected addError(errors: ValidationError[], field: string, message: string, severity?: 'error' | 'warning'): void;
    /**
     * Validate required field
     */
    protected validateRequired(errors: ValidationError[], value: unknown, field: string): boolean;
    /**
     * Validate version format
     */
    protected validateVersion(errors: ValidationError[], version: string, field?: string): boolean;
    /**
     * Validate enum value
     */
    protected validateEnum<E extends string>(errors: ValidationError[], value: E, validValues: readonly E[], field: string): boolean;
    /**
     * Validate number range
     */
    protected validateNumberRange(errors: ValidationError[], value: number | undefined, min: number, max: number, field: string): boolean;
}
