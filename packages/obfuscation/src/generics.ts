/**
 * OBFUSCATE GENERICS
 * 
 * Composable patterns for privacy-preserving transformations.
 * These generics orchestrate obfuscation workflows with reversibility.
 * 
 * @doc-generic
 * version: 1.0.0
 * pipeline: obfuscate
 * philosophy: "Complex privacy, simple patterns"
 */

import { z } from 'zod';
import {
  ObfuscationSignature,
  TransformationType,
  ObfuscationLevel,
  ReversibilityMode,
  TransformationRule,
  ObfuscationContext,
  PrivacyAssessment,
  generateObfuscationSignature,
  detectSensitivePatterns,
  assessPrivacyRisk,
  generateTransformationRules,
  obfuscateIdentifier,
  obfuscateString,
  createReversibilityMap,
  validateObfuscatedSyntax,
  verifyFunctionalityPreservation,
  composeObfuscationAnalysis
} from './primitives';
import { BaseExecutionContext } from '@bitcode/generics';

// ==================== SCHEMAS ====================

export const ObfuscationRequestSchema = z.object({
  content: z.string(),
  options: z.object({
    level: z.enum(['minimal', 'standard', 'aggressive', 'maximum']).default('standard'),
    reversibility: z.enum(['none', 'partial', 'full']).default('partial'),
    preserveStructure: z.boolean().default(true),
    preserveFunctionality: z.boolean().default(true),
    protectedIdentifiers: z.array(z.string()).default([]),
    customRules: z.array(z.object({
      type: z.enum(['identifier', 'string', 'structure', 'comment', 'metadata']),
      pattern: z.string(),
      replacement: z.string(),
      reversible: z.boolean(),
      priority: z.number()
    })).optional()
  }),
  metadata: z.object({
    language: z.enum(['javascript', 'typescript', 'python', 'general']).default('general'),
    purpose: z.string().optional(),
    author: z.string().optional()
  }).optional()
});

export const TransformationResultSchema = z.object({
  obfuscatedContent: z.string(),
  signature: z.string(),
  transformationCount: z.number(),
  transformationMap: z.array(z.object({
    original: z.string(),
    obfuscated: z.string(),
    type: z.enum(['identifier', 'string', 'structure', 'comment', 'metadata']),
    reversible: z.boolean()
  })),
  privacyReport: z.object({
    sensitivityScore: z.number(),
    identifiedRisks: z.array(z.string()),
    recommendedLevel: z.enum(['minimal', 'standard', 'aggressive', 'maximum']),
    actualLevel: z.enum(['minimal', 'standard', 'aggressive', 'maximum'])
  }),
  validation: z.object({
    syntaxValid: z.boolean(),
    functionalityPreserved: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
  })
});

export const ReversibilityDataSchema = z.object({
  signature: z.string(),
  timestamp: z.string(),
  reversibilityMap: z.record(z.object({
    original: z.string(),
    type: z.enum(['identifier', 'string', 'structure', 'comment', 'metadata'])
  })),
  metadata: z.object({
    originalHash: z.string(),
    transformationCount: z.number(),
    reversibilityScore: z.number(),
    expiresAt: z.string().optional()
  })
});

// ==================== EXECUTION CONTEXTS ====================

export interface ObfuscationExecutionContext extends BaseExecutionContext {
  obfuscationAnalysis?: ReturnType<typeof composeObfuscationAnalysis>;
  transformationResult?: z.infer<typeof TransformationResultSchema>;
  reversibilityData?: z.infer<typeof ReversibilityDataSchema>;
  validationResults?: {
    syntaxValidation: ReturnType<typeof validateObfuscatedSyntax>;
    functionalityValidation: ReturnType<typeof verifyFunctionalityPreservation>;
  };
}

// ==================== TRANSFORMATION GENERICS ====================

/**
 * Apply transformation rules to content
 * @doc-generic-pattern
 */
export function applyTransformationRules(
  content: string,
  rules: TransformationRule[],
  context: ObfuscationContext
): {
  transformed: string;
  transformations: Array<{
    original: string;
    obfuscated: string;
    type: TransformationType;
    reversible: boolean;
  }>;
} {
  let transformed = content;
  const transformations: Array<{
    original: string;
    obfuscated: string;
    type: TransformationType;
    reversible: boolean;
  }> = [];
  
  // Track already transformed segments to avoid double transformation
  const transformedRanges: Array<[number, number]> = [];
  
  for (const rule of rules) {
    if (typeof rule.pattern === 'string') {
      // Simple string replacement
      const index = transformed.indexOf(rule.pattern);
      if (index !== -1) {
        const replacement = typeof rule.replacement === 'function' 
          ? rule.replacement(rule.pattern)
          : rule.replacement;
        
        transformed = transformed.replace(rule.pattern, replacement);
        transformations.push({
          original: rule.pattern,
          obfuscated: replacement,
          type: rule.type,
          reversible: rule.reversible
        });
      }
    } else {
      // Regex replacement with tracking
      const matches = [...transformed.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags + 'g'))];
      
      // Process matches in reverse to maintain indices
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const start = match.index!;
        const end = start + match[0].length;
        
        // Check if this range overlaps with already transformed content
        const overlaps = transformedRanges.some(([s, e]) => 
          (start >= s && start < e) || (end > s && end <= e)
        );
        
        if (!overlaps) {
          const replacement = typeof rule.replacement === 'function'
            ? rule.replacement(match[0])
            : rule.replacement;
          
          transformed = transformed.slice(0, start) + replacement + transformed.slice(end);
          
          transformations.push({
            original: match[0],
            obfuscated: replacement,
            type: rule.type,
            reversible: rule.reversible
          });
          
          transformedRanges.push([start, start + replacement.length]);
        }
      }
    }
  }
  
  return { transformed, transformations };
}

/**
 * Create safe transformation with validation
 * @doc-generic-pattern
 */
export async function createSafeTransformation(
  request: z.infer<typeof ObfuscationRequestSchema>
): Promise<z.infer<typeof TransformationResultSchema>> {
  const startTime = Date.now();
  
  // Build context
  const context: ObfuscationContext = {
    level: request.options.level,
    reversibility: request.options.reversibility,
    preserveStructure: request.options.preserveStructure,
    preserveFunctionality: request.options.preserveFunctionality,
    protectedIdentifiers: new Set(request.options.protectedIdentifiers),
    customRules: request.options.customRules?.map(r => ({
      ...r,
      pattern: new RegExp(r.pattern, 'g')
    })) || []
  };
  
  // Analyze content
  const analysis = composeObfuscationAnalysis(request.content, context);
  
  // Apply transformations
  const { transformed, transformations } = applyTransformationRules(
    request.content,
    analysis.transformationRules,
    context
  );
  
  // Validate results
  const syntaxValidation = validateObfuscatedSyntax(
    request.content,
    transformed,
    request.metadata?.language || 'general'
  );
  
  const functionalityValidation = verifyFunctionalityPreservation(
    request.content,
    transformed,
    [
      { pattern: /export\s+/g, description: 'exports' },
      { pattern: /import\s+/g, description: 'imports' },
      { pattern: /class\s+\w+/g, description: 'class definitions' },
      { pattern: /function\s+\w+/g, description: 'function definitions' }
    ]
  );
  
  // Build result
  return {
    obfuscatedContent: transformed,
    signature: analysis.signature,
    transformationCount: transformations.length,
    transformationMap: transformations,
    privacyReport: {
      sensitivityScore: analysis.privacyAssessment.sensitivityScore,
      identifiedRisks: analysis.privacyAssessment.identifiedRisks,
      recommendedLevel: analysis.privacyAssessment.recommendedLevel,
      actualLevel: context.level
    },
    validation: {
      syntaxValid: syntaxValidation.valid,
      functionalityPreserved: functionalityValidation.preserved,
      errors: [...syntaxValidation.errors, ...functionalityValidation.violations],
      warnings: context.level !== analysis.privacyAssessment.recommendedLevel
        ? [`Recommended level: ${analysis.privacyAssessment.recommendedLevel}, actual: ${context.level}`]
        : []
    }
  };
}

// ==================== REVERSIBILITY GENERICS ====================

/**
 * Generate reversibility data for storage
 * @doc-generic-pattern
 */
export function generateReversibilityData(
  signature: ObfuscationSignature,
  transformations: Array<{
    original: string;
    obfuscated: string;
    type: TransformationType;
    reversible: boolean;
  }>,
  originalContent: string,
  reversibilityScore: number
): z.infer<typeof ReversibilityDataSchema> {
  // Filter only reversible transformations
  const reversibleTransforms = transformations.filter(t => t.reversible);
  
  // Create reversibility map
  const reversibilityMap: Record<string, { original: string; type: TransformationType }> = {};
  for (const transform of reversibleTransforms) {
    reversibilityMap[transform.obfuscated] = {
      original: transform.original,
      type: transform.type
    };
  }
  
  // Calculate content hash for integrity
  const originalHash = Buffer.from(originalContent).toString('base64').slice(0, 16);
  
  // Set expiration (30 days by default)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  return {
    signature,
    timestamp: new Date().toISOString(),
    reversibilityMap,
    metadata: {
      originalHash,
      transformationCount: transformations.length,
      reversibilityScore,
      expiresAt: expiresAt.toISOString()
    }
  };
}

/**
 * Reverse obfuscated content using reversibility data
 * @doc-generic-pattern
 */
export function reverseObfuscation(
  obfuscatedContent: string,
  reversibilityData: z.infer<typeof ReversibilityDataSchema>
): {
  success: boolean;
  reversedContent: string;
  reversedCount: number;
  errors: string[];
} {
  let reversedContent = obfuscatedContent;
  let reversedCount = 0;
  const errors: string[] = [];
  
  // Check expiration
  if (reversibilityData.metadata.expiresAt) {
    const expirationDate = new Date(reversibilityData.metadata.expiresAt);
    if (new Date() > expirationDate) {
      errors.push('Reversibility data has expired');
      return { success: false, reversedContent, reversedCount, errors };
    }
  }
  
  // Sort by length descending to avoid partial replacements
  const sortedEntries = Object.entries(reversibilityData.reversibilityMap)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [obfuscated, { original, type }] of sortedEntries) {
    const regex = new RegExp(escapeRegExp(obfuscated), 'g');
    const occurrences = (reversedContent.match(regex) || []).length;
    
    if (occurrences > 0) {
      reversedContent = reversedContent.replace(regex, original);
      reversedCount += occurrences;
    }
  }
  
  return {
    success: reversedCount > 0,
    reversedContent,
    reversedCount,
    errors
  };
}

/**
 * Escape special regex characters
 * @doc-generic-pattern
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== BATCH PROCESSING GENERICS ====================

/**
 * Process multiple files with consistent obfuscation
 * @doc-generic-pattern
 */
export async function batchObfuscate(
  files: Array<{
    path: string;
    content: string;
    metadata?: { language?: string };
  }>,
  options: z.infer<typeof ObfuscationRequestSchema>['options']
): Promise<{
  results: Map<string, z.infer<typeof TransformationResultSchema>>;
  summary: {
    totalFiles: number;
    successCount: number;
    failureCount: number;
    totalTransformations: number;
    averageSensitivity: number;
  };
  globalReversibilityData: Map<string, z.infer<typeof ReversibilityDataSchema>>;
}> {
  const results = new Map<string, z.infer<typeof TransformationResultSchema>>();
  const globalReversibilityData = new Map<string, z.infer<typeof ReversibilityDataSchema>>();
  
  let successCount = 0;
  let failureCount = 0;
  let totalTransformations = 0;
  let totalSensitivity = 0;
  
  // Process each file
  for (const file of files) {
    try {
      const request: z.infer<typeof ObfuscationRequestSchema> = {
        content: file.content,
        options,
        metadata: {
          language: (file.metadata?.language as any) || 'general'
        }
      };
      
      const result = await createSafeTransformation(request);
      results.set(file.path, result);
      
      // Generate reversibility data if needed
      if (options.reversibility !== 'none') {
        const context: ObfuscationContext = {
          level: options.level,
          reversibility: options.reversibility,
          preserveStructure: options.preserveStructure,
          preserveFunctionality: options.preserveFunctionality,
          protectedIdentifiers: new Set(options.protectedIdentifiers),
          customRules: []
        };
        
        const analysis = composeObfuscationAnalysis(file.content, context);
        const reversibilityData = generateReversibilityData(
          result.signature as ObfuscationSignature,
          result.transformationMap,
          file.content,
          analysis.estimatedReversibility
        );
        
        globalReversibilityData.set(file.path, reversibilityData);
      }
      
      successCount++;
      totalTransformations += result.transformationCount;
      totalSensitivity += result.privacyReport.sensitivityScore;
    } catch (error) {
      failureCount++;
      // Store error result
      results.set(file.path, {
        obfuscatedContent: file.content,
        signature: 'OBF-ERROR-' + Date.now(),
        transformationCount: 0,
        transformationMap: [],
        privacyReport: {
          sensitivityScore: 0,
          identifiedRisks: ['Processing failed'],
          recommendedLevel: 'minimal',
          actualLevel: options.level
        },
        validation: {
          syntaxValid: false,
          functionalityPreserved: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      });
    }
  }
  
  return {
    results,
    summary: {
      totalFiles: files.length,
      successCount,
      failureCount,
      totalTransformations,
      averageSensitivity: totalSensitivity / Math.max(successCount, 1)
    },
    globalReversibilityData
  };
}

// ==================== SECURITY PATTERNS ====================

/**
 * Create secure obfuscation pipeline with defense in depth
 * @doc-generic-pattern
 */
export function createSecureObfuscationPipeline(
  stages: Array<{
    name: string;
    level: ObfuscationLevel;
    customRules?: TransformationRule[];
  }>
): (content: string) => Promise<{
  finalContent: string;
  stageResults: Array<{
    stage: string;
    transformations: number;
    validation: { valid: boolean; errors: string[] };
  }>;
  totalTransformations: number;
  securityScore: number;
}> {
  return async (content: string) => {
    let currentContent = content;
    const stageResults: Array<{
      stage: string;
      transformations: number;
      validation: { valid: boolean; errors: string[] };
    }> = [];
    let totalTransformations = 0;
    let securityScore = 0;
    
    for (const stage of stages) {
      const context: ObfuscationContext = {
        level: stage.level,
        reversibility: 'none', // Security-focused, no reversibility
        preserveStructure: false,
        preserveFunctionality: true,
        protectedIdentifiers: new Set(['module', 'exports', 'require']),
        customRules: stage.customRules || []
      };
      
      const { transformed, transformations } = applyTransformationRules(
        currentContent,
        generateTransformationRules(context),
        context
      );
      
      const validation = validateObfuscatedSyntax(currentContent, transformed, 'general');
      
      stageResults.push({
        stage: stage.name,
        transformations: transformations.length,
        validation
      });
      
      if (validation.valid) {
        currentContent = transformed;
        totalTransformations += transformations.length;
        
        // Calculate stage security contribution
        const stageWeight = {
          minimal: 0.1,
          standard: 0.3,
          aggressive: 0.6,
          maximum: 1.0
        };
        securityScore += stageWeight[stage.level] * (transformations.length > 0 ? 1 : 0);
      }
    }
    
    // Normalize security score
    securityScore = Math.min(securityScore / stages.length, 1);
    
    return {
      finalContent: currentContent,
      stageResults,
      totalTransformations,
      securityScore
    };
  };
}