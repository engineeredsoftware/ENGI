/**
 * OBFUSCATE PACKAGE - PRIVACY-PRESERVING TRANSFORMATION
 * 
 * This package provides comprehensive code obfuscation capabilities
 * with reversibility support and security-focused transformations.
 * 
 * @doc-package
 * version: 1.0.0
 * pipeline: obfuscate
 * exports: primitives, generics, tools
 */

// Export all primitives
export * from './primitives';
export * as ObfuscatePrimitives from './primitives';

// Export all generics
export * from './generics';
export * as ObfuscateGenerics from './generics';

// Export all tools
export * from './tools';
export * as ObfuscateTools from './tools';

// Re-export key types for convenience
export type {
  ObfuscationSignature,
  TransformationType,
  ObfuscationLevel,
  ReversibilityMode,
  TransformationRule,
  ObfuscationContext,
  PrivacyAssessment
} from './primitives';

export type {
  ObfuscationExecutionContext
} from './generics';
