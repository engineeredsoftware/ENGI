/**
 * DOC-COMMENT PLUGINS FOR PROMPTS - WITH INTEGRATED BENCHMARKING
 * 
 * This module provides doc-comment plugins specifically for prompt development.
 * These plugins enable build-time intelligence for PromptParts and Prompts.
 * 
 * Two main plugins:
 * 1. DocPromptPartPlugin - For individual PromptParts (@doc-comment-developing-promptpartdevelopment)
 * 2. DocPromptPlugin - For complete Prompts (@doc-comment-developing-promptdevelopment)
 * 
 * Both include integrated Performance-Based Versioning (PBV) and benchmarking!
 */

import { 
  DocCommentPlugin, 
  DocComment, 
  DocCommentMetadata,
  ParseLocation 
} from '@bitcode/doc-comment-generics';

// ==================== TYPES ====================

export interface DevelopingPromptPartDocComment extends DocCommentMetadata {
  type: 'promptpart';
  versions: string[];  // Always starts as []
  domain: 'tool' | 'agent' | 'pipeline' | 'phase' | 'formatting' | 'validation' | 'system';
  intent: string;
  
  // Performance-Based Versioning - integrated!
  generation?: number;     // Current generation (starts at 1)
  quality_score?: number;  // 0-100 quality percentage
  variant?: number;        // Different implementations at same quality
  benchmarks?: {
    semantic_clarity: number;   // 0-1 score
    token_efficiency: number;   // 0-1 score  
    model_stability: number;    // 0-1 score
  };
  improvements?: Record<string, string>; // Version history
}

export interface DevelopingPromptDocComment extends DocCommentMetadata {
  type: 'prompt';
  versions: string[];  // Always starts as []
  domain: 'tool' | 'agent' | 'pipeline' | 'phase' | 'system';
  intent: string;
  
  // Performance-Based Versioning - integrated!
  generation?: number;     // Current generation (starts at 1)
  quality_score?: number;  // 0-100 quality percentage
  variant?: number;        // Different implementations at same quality
  benchmarks?: {
    semantic_clarity: number;   // 0-1 score
    token_efficiency: number;   // 0-1 score  
    model_stability: number;    // 0-1 score
    task_success?: number;      // Goal achievement rate (0-1)
    response_quality?: number;  // Multi-dimensional quality (0-1)
    token_economy?: number;     // Useful token ratio (0-1)
    latency_impact?: number;    // Generation time influence (0-1)
  };
  dependencies?: string[];       // Version-locked dependencies
  improvements?: Record<string, string>; // Version history
}

// Helper to format PBV version string
export function formatPBVersion(doc: DevelopingPromptPartDocComment | DevelopingPromptDocComment): string {
  const gen = doc.generation || 1;
  const score = doc.quality_score || 0;
  const variant = doc.variant || 0;
  return `${gen}.${score}.${variant}`;
}

// Re-export with ultra-clear naming that these are DEVELOPMENT types
export type PromptDevelopingIntelligence = DevelopingPromptDocComment;
export type PromptDevelopingType = DevelopingPromptDocComment['domain'];
export type PromptDevelopingOptimizations = DevelopingPromptDocComment['benchmarks'];
export type PromptPartDevelopingCategory = DevelopingPromptPartDocComment['domain'];
export type DevelopingPriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type DevelopingUsageFrequency = 'constant' | 'frequent' | 'occasional' | 'rare';
export type PromptPartDevelopingPerformance = DevelopingPromptPartDocComment['benchmarks'];

// ==================== BASE PLUGIN CLASS ====================

abstract class BasePromptPlugin {
  
  protected extractValue(comment: string, field: string): string | undefined {
    const match = comment.match(new RegExp(`${field}:\\s*"([^"]+)"`)) ||
                  comment.match(new RegExp(`${field}:\\s*'([^']+)'`)) ||
                  comment.match(new RegExp(`${field}:\\s*(\\S+)`));
    return match ? match[1].trim() : undefined;
  }

  protected extractArray(comment: string, field: string): string[] | undefined {
    const match = comment.match(new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`));
    if (!match) return undefined;
    
    const content = match[1].trim();
    if (!content) return [];
    
    return content.split(',').map(s => s.trim().replace(/['"]/g, ''));
  }
  
  protected extractNumber(comment: string, field: string): number | undefined {
    const match = comment.match(new RegExp(`${field}:\\s*(\\d+(?:\\.\\d+)?)`));
    return match ? parseFloat(match[1]) : undefined;
  }
  
  protected extractBenchmarks(comment: string, metrics: string[]): any | undefined {
    const benchmarks: any = {};
    let found = false;
    
    // First check if there's a benchmarks object
    const benchmarkBlock = comment.match(/benchmarks:\s*{([^}]+)}/s);
    if (benchmarkBlock) {
      const block = benchmarkBlock[1];
      for (const metric of metrics) {
        const value = this.extractNumberFromBlock(block, metric);
        if (value !== undefined) {
          benchmarks[metric] = value;
          found = true;
        }
      }
    }
    
    return found ? benchmarks : undefined;
  }
  
  protected extractNumberFromBlock(block: string, field: string): number | undefined {
    const match = block.match(new RegExp(`${field}:\\s*(\\d+(?:\\.\\d+)?)`));
    return match ? parseFloat(match[1]) : undefined;
  }
  
  protected extractImprovements(comment: string): Record<string, string> | undefined {
    const match = comment.match(/improvements:\s*{([^}]+)}/s);
    if (!match) return undefined;
    
    const improvements: Record<string, string> = {};
    const block = match[1];
    
    // Match version: "description" pairs
    const versionMatches = block.matchAll(/(\d+\.\d+\.\d+):\s*"([^"]+)"/g);
    for (const [, version, description] of versionMatches) {
      improvements[version] = description;
    }
    
    return Object.keys(improvements).length > 0 ? improvements : undefined;
  }
}

// ==================== PROMPTPART PLUGIN ====================

export class DocPromptPartPlugin extends BasePromptPlugin implements DocCommentPlugin {
  name = 'doc-comment-developing-promptpartdevelopment';
  pattern = /@doc-comment-developing-promptpartdevelopment/;

  matches(comment: string): boolean {
    return this.pattern.test(comment);
  }

  parse(comment: DocComment, context: ParseLocation): DocCommentMetadata | null {
    if (!this.matches(comment.raw)) {
      return null;
    }

    // Parse required fields
    const versions = this.extractArray(comment.raw, 'versions') || [];
    const domain = this.extractValue(comment.raw, 'domain');
    const intent = this.extractValue(comment.raw, 'intent');

    if (!domain || !intent) {
      console.warn(`Missing required fields in @doc-comment-developing-promptpartdevelopment: domain=${domain}, intent=${intent}`);
      return null;
    }

    // Parse optional PBV fields
    const generation = this.extractNumber(comment.raw, 'generation');
    const quality_score = this.extractNumber(comment.raw, 'quality_score');
    const variant = this.extractNumber(comment.raw, 'variant');
    const benchmarks = this.extractBenchmarks(comment.raw, ['semantic_clarity', 'token_efficiency', 'model_stability']);
    const improvements = this.extractImprovements(comment.raw);
    
    const metadata: DevelopingPromptPartDocComment = {
      type: 'promptpart',
      version: '1.0.0',
      versions,
      domain: domain as DevelopingPromptPartDocComment['domain'],
      intent
    };
    
    // Add optional fields if present
    if (generation !== undefined) metadata.generation = generation;
    if (quality_score !== undefined) metadata.quality_score = quality_score;
    if (variant !== undefined) metadata.variant = variant;
    if (benchmarks) metadata.benchmarks = benchmarks;
    if (improvements) metadata.improvements = improvements;
    
    // Update version to PBV format if we have the data
    if (generation !== undefined && quality_score !== undefined && variant !== undefined) {
      metadata.version = formatPBVersion(metadata);
    }

    return metadata;
  }

  transform(metadata: DocCommentMetadata, context: ParseLocation): string {
    const promptMeta = metadata as DevelopingPromptPartDocComment;
    
    const lines = [
      `// PROMPTPART: ${promptMeta.domain}`,
      `// Intent: ${promptMeta.intent}`,
      `// Version: ${promptMeta.version}`
    ];
    
    // Add benchmark info if present
    if (promptMeta.quality_score !== undefined) {
      lines.push(`// Quality Score: ${promptMeta.quality_score}%`);
    }
    
    if (promptMeta.benchmarks) {
      lines.push(`// Benchmarks:`);
      if (promptMeta.benchmarks.semantic_clarity !== undefined) {
        lines.push(`//   - Semantic Clarity: ${(promptMeta.benchmarks.semantic_clarity * 100).toFixed(0)}%`);
      }
      if (promptMeta.benchmarks.token_efficiency !== undefined) {
        lines.push(`//   - Token Efficiency: ${(promptMeta.benchmarks.token_efficiency * 100).toFixed(0)}%`);
      }
      if (promptMeta.benchmarks.model_stability !== undefined) {
        lines.push(`//   - Model Stability: ${(promptMeta.benchmarks.model_stability * 100).toFixed(0)}%`);
      }
    }
    
    return lines.join('\n');
  }
}

// ==================== PROMPT PLUGIN ====================

export class DocPromptPlugin extends BasePromptPlugin implements DocCommentPlugin {
  name = 'doc-comment-developing-promptdevelopment';
  pattern = /@doc-comment-developing-promptdevelopment/;

  matches(comment: string): boolean {
    return this.pattern.test(comment);
  }

  parse(comment: DocComment, context: ParseLocation): DocCommentMetadata | null {
    if (!this.matches(comment.raw)) {
      return null;
    }

    // Parse required fields
    const versions = this.extractArray(comment.raw, 'versions') || [];
    const domain = this.extractValue(comment.raw, 'domain');
    const intent = this.extractValue(comment.raw, 'intent');

    if (!domain || !intent) {
      console.warn(`Missing required fields in @doc-comment-developing-promptdevelopment: domain=${domain}, intent=${intent}`);
      return null;
    }

    // Parse optional PBV fields
    const generation = this.extractNumber(comment.raw, 'generation');
    const quality_score = this.extractNumber(comment.raw, 'quality_score');
    const variant = this.extractNumber(comment.raw, 'variant');
    const benchmarks = this.extractBenchmarks(comment.raw, [
      'semantic_clarity', 'token_efficiency', 'model_stability',
      'task_success', 'response_quality', 'token_economy', 'latency_impact'
    ]);
    const dependencies = this.extractArray(comment.raw, 'dependencies');
    const improvements = this.extractImprovements(comment.raw);

    const metadata: DevelopingPromptDocComment = {
      type: 'prompt',
      version: '1.0.0',
      versions,
      domain: domain as DevelopingPromptDocComment['domain'],
      intent
    };
    
    // Add optional fields if present
    if (generation !== undefined) metadata.generation = generation;
    if (quality_score !== undefined) metadata.quality_score = quality_score;
    if (variant !== undefined) metadata.variant = variant;
    if (benchmarks) metadata.benchmarks = benchmarks;
    if (dependencies) metadata.dependencies = dependencies;
    if (improvements) metadata.improvements = improvements;
    
    // Update version to PBV format if we have the data
    if (generation !== undefined && quality_score !== undefined && variant !== undefined) {
      metadata.version = formatPBVersion(metadata);
    }

    return metadata;
  }

  transform(metadata: DocCommentMetadata, context: ParseLocation): string {
    const promptMeta = metadata as DevelopingPromptDocComment;
    
    const lines = [
      `// PROMPT: ${promptMeta.domain}`,
      `// Intent: ${promptMeta.intent}`,
      `// Version: ${promptMeta.version}`
    ];
    
    // Add benchmark info if present
    if (promptMeta.quality_score !== undefined) {
      lines.push(`// Quality Score: ${promptMeta.quality_score}%`);
    }
    
    if (promptMeta.benchmarks) {
      lines.push(`// Benchmarks:`);
      const b = promptMeta.benchmarks;
      
      // Core metrics
      if (b.semantic_clarity !== undefined) {
        lines.push(`//   - Semantic Clarity: ${(b.semantic_clarity * 100).toFixed(0)}%`);
      }
      if (b.token_efficiency !== undefined) {
        lines.push(`//   - Token Efficiency: ${(b.token_efficiency * 100).toFixed(0)}%`);
      }
      if (b.model_stability !== undefined) {
        lines.push(`//   - Model Stability: ${(b.model_stability * 100).toFixed(0)}%`);
      }
      
      // Extended metrics for Prompts
      if (b.task_success !== undefined) {
        lines.push(`//   - Task Success: ${(b.task_success * 100).toFixed(0)}%`);
      }
      if (b.response_quality !== undefined) {
        lines.push(`//   - Response Quality: ${(b.response_quality * 100).toFixed(0)}%`);
      }
    }
    
    return lines.join('\n');
  }
}

// ==================== SINGLETON INSTANCES ====================

export const docPromptPartPlugin = new DocPromptPartPlugin();
export const docPromptPlugin = new DocPromptPlugin();

// ==================== AUTO-REGISTRATION ====================

// Auto-register when imported
import { registerPlugin } from '@bitcode/doc-comment-generics';
registerPlugin(docPromptPartPlugin);
registerPlugin(docPromptPlugin);

// ==================== EXPORTS ====================

// Explicit exports from dryrun module - no re-exports
export type {
  PromptDryRunScenario,
  PromptDryRunMetadata
} from '../dryrunning/doc-comment-dryrun';

export {
  DocPromptDryRunPlugin,
  docPromptDryRunPlugin
} from '../dryrunning/doc-comment-dryrun';