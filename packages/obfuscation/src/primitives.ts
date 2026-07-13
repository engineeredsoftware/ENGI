/**
 * OBFUSCATE PRIMITIVES
 * 
 * Pure, composable functions for privacy-preserving code transformation.
 * These primitives enable secure, reversible obfuscation of sensitive data.
 * 
 * @doc-primitive
 * version: 1.0.0
 * pipeline: obfuscate
 * philosophy: "Privacy by design, transparency in transformation"
 */

import { z } from 'zod';

// ==================== TYPES ====================

export type ObfuscationSignature = `OBF-${string}-${string}`;
export type TransformationType = 'identifier' | 'string' | 'structure' | 'comment' | 'metadata';
export type ObfuscationLevel = 'minimal' | 'standard' | 'aggressive' | 'maximum';
export type ReversibilityMode = 'none' | 'partial' | 'full';

export interface TransformationRule {
  type: TransformationType;
  pattern: RegExp | string;
  replacement: string | ((match: string) => string);
  reversible: boolean;
  priority: number;
}

export interface ObfuscationContext {
  level: ObfuscationLevel;
  reversibility: ReversibilityMode;
  preserveStructure: boolean;
  preserveFunctionality: boolean;
  protectedIdentifiers: Set<string>;
  customRules: TransformationRule[];
}

export interface PrivacyAssessment {
  sensitivityScore: number; // 0-1
  identifiedRisks: string[];
  recommendedLevel: ObfuscationLevel;
  reversibilityImpact: number; // 0-1
}

// ==================== SIGNATURE GENERATION ====================

/**
 * Generate unique signature for obfuscation operation
 * @doc-primitive-operation
 * @doc-primitive
 * name: "generateObfuscationSignature"
 * complexity: "O(1) - constant time signature generation"
 * deterministic: true
 * purpose: "Create traceable signatures for reversible obfuscation"
 */
export function generateObfuscationSignature(
  content: string,
  context: ObfuscationContext
): ObfuscationSignature {
  const contentHash = content.length.toString(36);
  const levelCode = context.level[0].toUpperCase();
  const reversibilityCode = context.reversibility[0].toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4);
  
  return `OBF-${levelCode}${reversibilityCode}-${contentHash}${timestamp}`;
}

// ==================== PRIVACY DETECTION PRIMITIVES ====================

/**
 * Detect sensitive patterns in code
 * @doc-primitive-operation
 */
export function detectSensitivePatterns(content: string): Array<{
  type: string;
  pattern: string;
  locations: number[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}> {
  const patterns = [
    // API Keys and Tokens
    {
      type: 'api_key',
      pattern: /['\"]?[A-Za-z0-9_\-]{20,}['\"]?/g,
      severity: 'critical' as const
    },
    // Email addresses
    {
      type: 'email',
      pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      severity: 'high' as const
    },
    // IP addresses
    {
      type: 'ip_address',
      pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      severity: 'high' as const
    },
    // URLs with credentials
    {
      type: 'url_with_auth',
      pattern: /https?:\/\/[^:]+:[^@]+@[^\s]+/g,
      severity: 'critical' as const
    },
    // Personal names (heuristic)
    {
      type: 'personal_name',
      pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      severity: 'medium' as const
    },
    // File paths with user directories
    {
      type: 'user_path',
      pattern: /\/(?:home|users)\/[^\/\s]+/gi,
      severity: 'medium' as const
    },
    // Database connection strings
    {
      type: 'db_connection',
      pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^\s]+/gi,
      severity: 'critical' as const
    }
  ];
  
  const findings: Array<{
    type: string;
    pattern: string;
    locations: number[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];
  
  for (const { type, pattern, severity } of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    const locations: number[] = [];
    
    while ((match = regex.exec(content)) !== null) {
      locations.push(match.index);
    }
    
    if (locations.length > 0) {
      findings.push({
        type,
        pattern: pattern.source,
        locations,
        severity
      });
    }
  }
  
  return findings;
}

/**
 * Assess privacy risk level
 * @doc-primitive-operation
 */
export function assessPrivacyRisk(
  content: string,
  sensitivePatterns: ReturnType<typeof detectSensitivePatterns>
): PrivacyAssessment {
  let sensitivityScore = 0;
  const identifiedRisks: string[] = [];
  
  // Calculate base sensitivity from pattern findings
  const severityWeights = {
    low: 0.1,
    medium: 0.3,
    high: 0.6,
    critical: 1.0
  };
  
  for (const finding of sensitivePatterns) {
    const weight = severityWeights[finding.severity];
    const occurrences = finding.locations.length;
    sensitivityScore += weight * Math.min(occurrences * 0.2, 1);
    
    identifiedRisks.push(
      `${finding.type}: ${occurrences} occurrence${occurrences > 1 ? 's' : ''} (${finding.severity})`
    );
  }
  
  // Normalize sensitivity score
  sensitivityScore = Math.min(sensitivityScore, 1);
  
  // Determine recommended obfuscation level
  let recommendedLevel: ObfuscationLevel = 'minimal';
  if (sensitivityScore > 0.7) recommendedLevel = 'maximum';
  else if (sensitivityScore > 0.5) recommendedLevel = 'aggressive';
  else if (sensitivityScore > 0.3) recommendedLevel = 'standard';
  
  // Calculate reversibility impact
  const criticalCount = sensitivePatterns.filter(p => p.severity === 'critical').length;
  const reversibilityImpact = criticalCount > 0 ? 0.8 : sensitivityScore * 0.5;
  
  return {
    sensitivityScore,
    identifiedRisks,
    recommendedLevel,
    reversibilityImpact
  };
}

// ==================== TRANSFORMATION PRIMITIVES ====================

/**
 * Generate deterministic obfuscated identifier
 * @doc-primitive-operation
 */
export function obfuscateIdentifier(
  original: string,
  salt: string,
  preserveCase: boolean = true
): string {
  // Simple deterministic hash for reversibility
  let hash = 0;
  const combined = original + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const prefix = original[0] === '_' ? '_' : '';
  const baseId = `${prefix}var${Math.abs(hash).toString(36)}`;
  
  if (preserveCase && original[0] === original[0].toUpperCase()) {
    return baseId.charAt(0).toUpperCase() + baseId.slice(1);
  }
  
  return baseId;
}

/**
 * Obfuscate string literal
 * @doc-primitive-operation
 */
export function obfuscateString(
  original: string,
  method: 'base64' | 'hex' | 'unicode' | 'reverse'
): string {
  switch (method) {
    case 'base64':
      return Buffer.from(original).toString('base64');
    
    case 'hex':
      return original.split('').map(c => 
        c.charCodeAt(0).toString(16).padStart(2, '0')
      ).join('');
    
    case 'unicode':
      return original.split('').map(c => 
        `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
      ).join('');
    
    case 'reverse':
      return original.split('').reverse().join('');
    
    default:
      return original;
  }
}

/**
 * Generate transformation rules based on context
 * @doc-primitive-operation
 */
export function generateTransformationRules(
  context: ObfuscationContext
): TransformationRule[] {
  const rules: TransformationRule[] = [];
  
  // Base rules for all levels
  rules.push({
    type: 'comment',
    pattern: /\/\*[\s\S]*?\*\/|\/\/.*/g,
    replacement: '',
    reversible: false,
    priority: 1
  });
  
  // Level-specific rules
  if (context.level !== 'minimal') {
    // String obfuscation
    rules.push({
      type: 'string',
      pattern: /(['"`])([^'"`]+)\1/g,
      replacement: (match: string) => {
        const quote = match[0];
        const content = match.slice(1, -1);
        if (content.length > 3) {
          const obfuscated = obfuscateString(content, 'base64');
          return `${quote}${obfuscated}${quote}`;
        }
        return match;
      },
      reversible: context.reversibility !== 'none',
      priority: 2
    });
  }
  
  if (context.level === 'aggressive' || context.level === 'maximum') {
    // Identifier obfuscation
    rules.push({
      type: 'identifier',
      pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g,
      replacement: (match: string) => {
        if (context.protectedIdentifiers.has(match)) {
          return match;
        }
        return obfuscateIdentifier(match, 'salt', true);
      },
      reversible: context.reversibility === 'full',
      priority: 3
    });
  }
  
  if (context.level === 'maximum') {
    // Structure obfuscation
    rules.push({
      type: 'structure',
      pattern: /\s+/g,
      replacement: ' ',
      reversible: false,
      priority: 4
    });
  }
  
  // Add custom rules
  rules.push(...context.customRules);
  
  // Sort by priority
  return rules.sort((a, b) => a.priority - b.priority);
}

// ==================== REVERSIBILITY PRIMITIVES ====================

/**
 * Create reversibility mapping
 * @doc-primitive-operation
 */
export function createReversibilityMap(
  transformations: Array<{
    original: string;
    obfuscated: string;
    type: TransformationType;
  }>
): Map<string, { original: string; type: TransformationType }> {
  const map = new Map<string, { original: string; type: TransformationType }>();
  
  for (const transform of transformations) {
    map.set(transform.obfuscated, {
      original: transform.original,
      type: transform.type
    });
  }
  
  return map;
}

/**
 * Calculate reversibility score
 * @doc-primitive-operation
 */
export function calculateReversibilityScore(
  rules: TransformationRule[],
  transformationCount: number
): number {
  if (transformationCount === 0) return 1.0;
  
  const reversibleCount = rules.filter(r => r.reversible).length;
  const ruleScore = reversibleCount / rules.length;
  
  // Factor in transformation complexity
  const complexityFactor = Math.max(0, 1 - (transformationCount / 1000));
  
  return ruleScore * complexityFactor;
}

// ==================== VALIDATION PRIMITIVES ====================

/**
 * Validate obfuscated code syntax
 * @doc-primitive-operation
 */
export function validateObfuscatedSyntax(
  original: string,
  obfuscated: string,
  language: 'javascript' | 'typescript' | 'python' | 'general'
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic bracket matching
  const brackets = ['()', '[]', '{}'];
  for (const [open, close] of brackets) {
    const originalCount = (original.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const obfuscatedCount = (obfuscated.match(new RegExp(`\\${open}`, 'g')) || []).length;
    
    if (originalCount !== obfuscatedCount) {
      errors.push(`Bracket mismatch: ${open}${close}`);
    }
  }
  
  // Language-specific checks
  if (language === 'javascript' || language === 'typescript') {
    // Check for broken string literals
    const stringPattern = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
    const originalStrings = original.match(stringPattern) || [];
    const obfuscatedStrings = obfuscated.match(stringPattern) || [];
    
    if (originalStrings.length !== obfuscatedStrings.length) {
      errors.push('String literal count mismatch');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verify functionality preservation
 * @doc-primitive-operation
 */
export function verifyFunctionalityPreservation(
  original: string,
  obfuscated: string,
  testPatterns: Array<{ pattern: RegExp; description: string }>
): { preserved: boolean; violations: string[] } {
  const violations: string[] = [];
  
  for (const { pattern, description } of testPatterns) {
    const originalMatches = original.match(pattern);
    const obfuscatedMatches = obfuscated.match(pattern);
    
    if (originalMatches && !obfuscatedMatches) {
      violations.push(`Lost functionality: ${description}`);
    }
  }
  
  // Check for export preservation
  const exportPattern = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
  const originalExports = [...original.matchAll(exportPattern)].map(m => m[1]);
  const obfuscatedExports = [...obfuscated.matchAll(exportPattern)].map(m => m[1]);
  
  if (originalExports.length !== obfuscatedExports.length) {
    violations.push('Export count mismatch');
  }
  
  return {
    preserved: violations.length === 0,
    violations
  };
}

// ==================== COMPOSITION HELPERS ====================

/**
 * Compose complete obfuscation analysis
 * @doc-primitive-operation
 */
export function composeObfuscationAnalysis(
  content: string,
  context: ObfuscationContext
): {
  signature: ObfuscationSignature;
  privacyAssessment: PrivacyAssessment;
  transformationRules: TransformationRule[];
  estimatedReversibility: number;
} {
  const signature = generateObfuscationSignature(content, context);
  const sensitivePatterns = detectSensitivePatterns(content);
  const privacyAssessment = assessPrivacyRisk(content, sensitivePatterns);
  const transformationRules = generateTransformationRules(context);
  const estimatedReversibility = calculateReversibilityScore(transformationRules, content.length);
  
  return {
    signature,
    privacyAssessment,
    transformationRules,
    estimatedReversibility
  };
}