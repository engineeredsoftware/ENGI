/**
 * OBFUSCATE TOOLS - PRIVACY TRANSFORMATION EXECUTORS
 * 
 * Tools that leverage obfuscation primitives and generics for
 * secure, reversible code transformation.
 * 
 * @doc-code-tool
 * version: 1.0.0
 * pipeline: obfuscate
 * philosophy: "Powerful privacy, responsible transformation"
 */

import { z } from 'zod';
import {
  detectSensitivePatterns,
  assessPrivacyRisk,
  composeObfuscationAnalysis,
  validateObfuscatedSyntax,
  verifyFunctionalityPreservation,
  ObfuscationContext
} from './primitives';
import {
  createSafeTransformation,
  generateReversibilityData,
  reverseObfuscation,
  batchObfuscate,
  createSecureObfuscationPipeline,
  ObfuscationRequestSchema,
  TransformationResultSchema,
  ReversibilityDataSchema
} from './generics';
import { BaseTool, ToolResult } from '@bitcode/tool-generics';

// ==================== PRIVACY ANALYZER TOOL ====================

export const PrivacyAnalyzerTool: BaseTool<
  z.infer<typeof PrivacyAnalyzerInputSchema>,
  z.infer<typeof PrivacyAnalyzerOutputSchema>
> = {
  name: 'obfuscate-privacy-analyzer',
  description: 'Analyze code for sensitive patterns and privacy risks',
  
  inputSchema: z.object({
    content: z.string().describe('Code content to analyze'),
    options: z.object({
      deepScan: z.boolean().default(true).describe('Perform deep pattern analysis'),
      customPatterns: z.array(z.object({
        name: z.string(),
        pattern: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical'])
      })).optional()
    }).optional()
  }),
  
  outputSchema: z.object({
    sensitivePatterns: z.array(z.object({
      type: z.string(),
      pattern: z.string(),
      locations: z.array(z.number()),
      severity: z.enum(['low', 'medium', 'high', 'critical'])
    })),
    privacyAssessment: z.object({
      sensitivityScore: z.number(),
      identifiedRisks: z.array(z.string()),
      recommendedLevel: z.enum(['minimal', 'standard', 'aggressive', 'maximum']),
      reversibilityImpact: z.number()
    }),
    recommendations: z.array(z.string())
  }),
  
  execute: async (input) => {
    const startTime = Date.now();
    
    // Detect sensitive patterns
    let patterns = detectSensitivePatterns(input.content);
    
    // Add custom patterns if provided
    if (input.options?.customPatterns) {
      for (const custom of input.options.customPatterns) {
        const regex = new RegExp(custom.pattern, 'gi');
        const locations: number[] = [];
        let match;
        
        while ((match = regex.exec(input.content)) !== null) {
          locations.push(match.index);
        }
        
        if (locations.length > 0) {
          patterns.push({
            type: custom.name,
            pattern: custom.pattern,
            locations,
            severity: custom.severity
          });
        }
      }
    }
    
    // Assess privacy risk
    const assessment = assessPrivacyRisk(input.content, patterns);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (assessment.sensitivityScore > 0.7) {
      recommendations.push('Consider maximum obfuscation level for critical sensitive data');
      recommendations.push('Enable full reversibility only with secure key storage');
    } else if (assessment.sensitivityScore > 0.5) {
      recommendations.push('Use aggressive obfuscation for identified patterns');
      recommendations.push('Consider partial reversibility for recovery');
    } else if (assessment.sensitivityScore > 0.3) {
      recommendations.push('Standard obfuscation should be sufficient');
      recommendations.push('Full reversibility can be safely enabled');
    } else {
      recommendations.push('Minimal obfuscation may be adequate');
      recommendations.push('Focus on removing comments and formatting');
    }
    
    // Add pattern-specific recommendations
    const criticalPatterns = patterns.filter(p => p.severity === 'critical');
    if (criticalPatterns.length > 0) {
      recommendations.push(`CRITICAL: Found ${criticalPatterns.length} critical patterns requiring immediate attention`);
    }
    
    return {
      success: true,
      data: {
        sensitivePatterns: patterns,
        privacyAssessment: assessment,
        recommendations
      },
      metadata: {
        executionTime: Date.now() - startTime,
        patternCount: patterns.length,
        sensitivityScore: assessment.sensitivityScore
      }
    };
  }
};

const PrivacyAnalyzerInputSchema = PrivacyAnalyzerTool.inputSchema;
const PrivacyAnalyzerOutputSchema = PrivacyAnalyzerTool.outputSchema;

// ==================== CODE TRANSFORMER TOOL ====================

export const CodeTransformerTool: BaseTool<
  z.infer<typeof CodeTransformerInputSchema>,
  z.infer<typeof CodeTransformerOutputSchema>
> = {
  name: 'obfuscate-code-transformer',
  description: 'Transform code with configurable obfuscation levels and reversibility',
  
  inputSchema: ObfuscationRequestSchema,
  
  outputSchema: TransformationResultSchema,
  
  execute: async (input) => {
    const startTime = Date.now();
    
    try {
      // Perform safe transformation
      const result = await createSafeTransformation(input);
      
      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          transformationCount: result.transformationCount,
          compressionRatio: result.obfuscatedContent.length / input.content.length
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          obfuscatedContent: input.content,
          signature: 'OBF-ERROR-' + Date.now(),
          transformationCount: 0,
          transformationMap: [],
          privacyReport: {
            sensitivityScore: 0,
            identifiedRisks: ['Transformation failed'],
            recommendedLevel: 'minimal',
            actualLevel: input.options.level
          },
          validation: {
            syntaxValid: false,
            functionalityPreserved: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            warnings: []
          }
        },
        error: error instanceof Error ? error.message : 'Transformation failed'
      };
    }
  }
};

const CodeTransformerInputSchema = CodeTransformerTool.inputSchema;
const CodeTransformerOutputSchema = CodeTransformerTool.outputSchema;

// ==================== REVERSIBILITY MANAGER TOOL ====================

export const ReversibilityManagerTool: BaseTool<
  z.infer<typeof ReversibilityManagerInputSchema>,
  z.infer<typeof ReversibilityManagerOutputSchema>
> = {
  name: 'obfuscate-reversibility-manager',
  description: 'Manage reversibility data and perform deobfuscation',
  
  inputSchema: z.object({
    operation: z.enum(['generate', 'reverse', 'verify']),
    data: z.union([
      // For generate operation
      z.object({
        signature: z.string(),
        transformations: z.array(z.object({
          original: z.string(),
          obfuscated: z.string(),
          type: z.enum(['identifier', 'string', 'structure', 'comment', 'metadata']),
          reversible: z.boolean()
        })),
        originalContent: z.string(),
        reversibilityScore: z.number()
      }),
      // For reverse operation
      z.object({
        obfuscatedContent: z.string(),
        reversibilityData: ReversibilityDataSchema
      }),
      // For verify operation
      z.object({
        originalContent: z.string(),
        reversedContent: z.string(),
        reversibilityData: ReversibilityDataSchema
      })
    ])
  }),
  
  outputSchema: z.object({
    operation: z.string(),
    result: z.union([
      // Generate result
      ReversibilityDataSchema,
      // Reverse result
      z.object({
        success: z.boolean(),
        reversedContent: z.string(),
        reversedCount: z.number(),
        errors: z.array(z.string())
      }),
      // Verify result
      z.object({
        valid: z.boolean(),
        matchPercentage: z.number(),
        differences: z.array(z.object({
          position: z.number(),
          expected: z.string(),
          actual: z.string()
        }))
      })
    ])
  }),
  
  execute: async (input) => {
    const startTime = Date.now();
    
    switch (input.operation) {
      case 'generate': {
        const data = input.data as any;
        const reversibilityData = generateReversibilityData(
          data.signature,
          data.transformations,
          data.originalContent,
          data.reversibilityScore
        );
        
        return {
          success: true,
          data: {
            operation: 'generate',
            result: reversibilityData
          },
          metadata: {
            executionTime: Date.now() - startTime,
            reversibleCount: Object.keys(reversibilityData.reversibilityMap).length
          }
        };
      }
      
      case 'reverse': {
        const data = input.data as any;
        const reverseResult = reverseObfuscation(
          data.obfuscatedContent,
          data.reversibilityData
        );
        
        return {
          success: reverseResult.success,
          data: {
            operation: 'reverse',
            result: reverseResult
          },
          metadata: {
            executionTime: Date.now() - startTime,
            reversedCount: reverseResult.reversedCount
          }
        };
      }
      
      case 'verify': {
        const data = input.data as any;
        const originalLines = data.originalContent.split('\n');
        const reversedLines = data.reversedContent.split('\n');
        const differences: Array<{ position: number; expected: string; actual: string }> = [];
        
        let matchCount = 0;
        const maxLines = Math.max(originalLines.length, reversedLines.length);
        
        for (let i = 0; i < maxLines; i++) {
          const original = originalLines[i] || '';
          const reversed = reversedLines[i] || '';
          
          if (original === reversed) {
            matchCount++;
          } else {
            differences.push({
              position: i,
              expected: original,
              actual: reversed
            });
          }
        }
        
        const matchPercentage = (matchCount / maxLines) * 100;
        
        return {
          success: true,
          data: {
            operation: 'verify',
            result: {
              valid: matchPercentage > 90, // 90% threshold for validity
              matchPercentage,
              differences: differences.slice(0, 10) // Limit to first 10 differences
            }
          },
          metadata: {
            executionTime: Date.now() - startTime,
            totalLines: maxLines,
            matchingLines: matchCount
          }
        };
      }
      
      default:
        throw new Error(`Unknown operation: ${input.operation}`);
    }
  }
};

const ReversibilityManagerInputSchema = ReversibilityManagerTool.inputSchema;
const ReversibilityManagerOutputSchema = ReversibilityManagerTool.outputSchema;

// ==================== BATCH OBFUSCATOR TOOL ====================

export const BatchObfuscatorTool: BaseTool<
  z.infer<typeof BatchObfuscatorInputSchema>,
  z.infer<typeof BatchObfuscatorOutputSchema>
> = {
  name: 'obfuscate-batch-processor',
  description: 'Process multiple files with consistent obfuscation settings',
  
  inputSchema: z.object({
    files: z.array(z.object({
      path: z.string(),
      content: z.string(),
      metadata: z.object({
        language: z.string().optional()
      }).optional()
    })).min(1).max(100),
    options: ObfuscationRequestSchema.shape.options
  }),
  
  outputSchema: z.object({
    results: z.array(z.object({
      path: z.string(),
      result: TransformationResultSchema
    })),
    summary: z.object({
      totalFiles: z.number(),
      successCount: z.number(),
      failureCount: z.number(),
      totalTransformations: z.number(),
      averageSensitivity: z.number()
    }),
    reversibilityPackage: z.object({
      enabled: z.boolean(),
      dataCount: z.number()
    }).optional()
  }),
  
  execute: async (input) => {
    const startTime = Date.now();
    
    const batchResult = await batchObfuscate(input.files, input.options);
    
    // Convert results to array format
    const resultsArray = Array.from(batchResult.results.entries()).map(([path, result]) => ({
      path,
      result
    }));
    
    return {
      success: batchResult.summary.failureCount === 0,
      data: {
        results: resultsArray,
        summary: batchResult.summary,
        reversibilityPackage: input.options.reversibility !== 'none' ? {
          enabled: true,
          dataCount: batchResult.globalReversibilityData.size
        } : undefined
      },
      metadata: {
        executionTime: Date.now() - startTime,
        filesPerSecond: (input.files.length / ((Date.now() - startTime) / 1000)).toFixed(2)
      }
    };
  }
};

const BatchObfuscatorInputSchema = BatchObfuscatorTool.inputSchema;
const BatchObfuscatorOutputSchema = BatchObfuscatorTool.outputSchema;

// ==================== SECURITY PIPELINE TOOL ====================

export const SecurityPipelineTool: BaseTool<
  z.infer<typeof SecurityPipelineInputSchema>,
  z.infer<typeof SecurityPipelineOutputSchema>
> = {
  name: 'obfuscate-security-pipeline',
  description: 'Create multi-stage obfuscation pipeline for defense in depth',
  
  inputSchema: z.object({
    content: z.string(),
    stages: z.array(z.object({
      name: z.string(),
      level: z.enum(['minimal', 'standard', 'aggressive', 'maximum']),
      customRules: z.array(z.object({
        type: z.enum(['identifier', 'string', 'structure', 'comment', 'metadata']),
        pattern: z.string(),
        replacement: z.string(),
        reversible: z.boolean(),
        priority: z.number()
      })).optional()
    })).min(1).max(5)
  }),
  
  outputSchema: z.object({
    finalContent: z.string(),
    stageResults: z.array(z.object({
      stage: z.string(),
      transformations: z.number(),
      validation: z.object({
        valid: z.boolean(),
        errors: z.array(z.string())
      })
    })),
    totalTransformations: z.number(),
    securityScore: z.number()
  }),
  
  execute: async (input) => {
    const startTime = Date.now();
    
    // Create and execute pipeline
    const pipeline = createSecureObfuscationPipeline(input.stages);
    const result = await pipeline(input.content);
    
    return {
      success: result.stageResults.every(r => r.validation.valid),
      data: result,
      metadata: {
        executionTime: Date.now() - startTime,
        stageCount: input.stages.length,
        compressionRatio: result.finalContent.length / input.content.length
      }
    };
  }
};

const SecurityPipelineInputSchema = SecurityPipelineTool.inputSchema;
const SecurityPipelineOutputSchema = SecurityPipelineTool.outputSchema;

// ==================== EXPORT ALL TOOLS ====================

export const ObfuscateTools = {
  PrivacyAnalyzer: PrivacyAnalyzerTool,
  CodeTransformer: CodeTransformerTool,
  ReversibilityManager: ReversibilityManagerTool,
  BatchObfuscator: BatchObfuscatorTool,
  SecurityPipeline: SecurityPipelineTool
};

// Export tool array for easy registration
export const OBFUSCATE_TOOLS = [
  PrivacyAnalyzerTool,
  CodeTransformerTool,
  ReversibilityManagerTool,
  BatchObfuscatorTool,
  SecurityPipelineTool
];