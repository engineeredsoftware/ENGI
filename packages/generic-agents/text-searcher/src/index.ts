// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/**
 * Bitcode Repository Evidence Search Agent - Declarative PTRR support pattern.
 *
 * V26 semantics are repository-evidence collection for read measurement,
 * source-grounding, proof inspection, and AssetPack planning.
 */

import {
  factoryPTRRAgent,
  factoryAgentWithSingleStep,
  AgentPrompt,
  AgentStepPrompt
} from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { simpleSystemTextSearch } from '@bitcode/generic-tools-simple-system-text-search';
import { z } from 'zod';

const BitcodeRepositoryEvidenceSearchInputSchema = z.object({
  query: z.string().describe('Read-grounding evidence pattern or keywords'),
  searchPath: z.string().optional().describe('Repository or package directory path to search'),
  fileTypes: z.array(z.string()).optional().describe('File extensions to treat as evidence candidates'),
  excludePatterns: z.array(z.string()).optional().describe('Patterns to exclude from evidence gathering'),
  caseSensitive: z.boolean().default(false).describe('Case-sensitive evidence search'),
  maxResults: z.number().default(100).describe('Maximum evidence matches to return'),
  includeContext: z.boolean().default(true).describe('Include surrounding context intent when downstream prompts request it'),
  searchDepth: z.enum(['shallow', 'deep']).default('deep'),
  regexMode: z.boolean().default(false).describe('Treat query as a grep-compatible evidence regex')
});

const BitcodeRepositoryEvidenceSearchPlanSchema = z.object({
  searchStrategy: z.string().describe('How to collect repository evidence without claiming final proof'),
  keywordAnalysis: z.object({
    primaryTerms: z.array(z.string()),
    secondaryTerms: z.array(z.string()),
    searchPatterns: z.array(z.string())
  }),
  targetPaths: z.array(z.string()).describe('Repository/package paths to search for evidence'),
  fileFilters: z.object({
    includeTypes: z.array(z.string()),
    excludePatterns: z.array(z.string()),
    sizeLimit: z.number().optional()
  }),
  estimatedMatches: z.number(),
  relevanceCriteria: z.array(z.string()),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Evidence tools to use in plan phase'),
  confidence: z.number().min(0).max(1),
  complexity: z.enum(['simple', 'moderate', 'complex'])
});

const BitcodeRepositoryEvidenceSearchTrySchema = z.object({
  searchExecution: z.object({
    toolsUsed: z.array(z.string()),
    searchCommands: z.array(z.string()),
    executionTime: z.number(),
    filesScanned: z.number()
  }),
  rawMatches: z.array(z.object({
    file: z.string(),
    line: z.number(),
    column: z.number().optional(),
    content: z.string(),
    matchType: z.enum(['exact', 'partial', 'regex']),
    confidence: z.number()
  })),
  initialAnalysis: z.object({
    totalMatches: z.number(),
    uniqueFiles: z.number(),
    fileTypeDistribution: z.record(z.number()),
    searchCoverage: z.number()
  }),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Repository-evidence tool requests'),
  searchComplete: z.boolean(),
  errors: z.array(z.string()).optional()
});

const BitcodeRepositoryEvidenceSearchRefineSchema = z.object({
  refinedMatches: z.array(z.object({
    file: z.string(),
    line: z.number(),
    content: z.string(),
    context: z.object({
      before: z.array(z.string()),
      after: z.array(z.string())
    }).optional(),
    relevanceScore: z.number().min(0).max(1),
    matchQuality: z.enum(['high', 'medium', 'low']),
    tags: z.array(z.string()).optional()
  })),
  qualityMetrics: z.object({
    averageRelevance: z.number(),
    duplicatesRemoved: z.number(),
    contextEnriched: z.number(),
    falsePositivesFiltered: z.number()
  }),
  patterns: z.object({
    commonTerms: z.array(z.string()),
    filePatterns: z.array(z.string()),
    codePatterns: z.array(z.string()).optional(),
    recommendations: z.array(z.string())
  }),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Evidence refinement tools'),
  refinements: z.array(z.string()),
  confidence: z.number()
});

const BitcodeRepositoryEvidenceSearchRetrySchema = z.object({
  searchResults: z.object({
    matches: z.array(z.object({
      file: z.string(),
      line: z.number(),
      content: z.string(),
      context: z.object({
        before: z.array(z.string()),
        after: z.array(z.string())
      }).optional(),
      relevanceScore: z.number()
    })),
    summary: z.object({
      totalMatches: z.number(),
      filesSearched: z.number(),
      filesWithMatches: z.number(),
      topFileTypes: z.array(z.string()),
      keywordsFound: z.array(z.string())
    }),
    analysis: z.object({
      patterns: z.array(z.string()),
      distribution: z.record(z.number()),
      recommendations: z.array(z.string())
    }),
    processingTime: z.number()
  }),
  queryInsights: z.object({
    queryComplexity: z.string(),
    searchEffectiveness: z.number(),
    suggestedRefinements: z.array(z.string()),
    alternativeQueries: z.array(z.string()).optional()
  }),
  performance: z.object({
    searchSpeed: z.number(),
    accuracyScore: z.number(),
    completionRate: z.number()
  }),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()).optional(),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional().describe('Recovery evidence tool requests'),
  success: z.boolean(),
  completionMessage: z.string()
});

export const bitcodeRepositoryEvidenceSearcherPrompt = new AgentPrompt({
  name: 'bitcode-repository-evidence-searcher' as PromptPart,
  identity: 'Bitcode repository-evidence search agent for source-grounded read and AssetPack context' as PromptPart
});

export const bitcodeRepositoryEvidenceSearcherStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan bounded repository-evidence search for a Bitcode read' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute grep-backed evidence search without mutating source' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Refine evidence snippets into source-grounding context' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize repository evidence and expose gaps without claiming proof closure' as PromptPart })
};

export const textSearcherPrompt = bitcodeRepositoryEvidenceSearcherPrompt;
export const textSearcherStepPrompts = bitcodeRepositoryEvidenceSearcherStepPrompts;

// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const bitcodeRepositoryEvidenceSearchVariation: any = factoryPTRRAgent<
  z.infer<typeof BitcodeRepositoryEvidenceSearchInputSchema>,
  z.infer<typeof BitcodeRepositoryEvidenceSearchRetrySchema>
>({
  name: 'bitcode-repository-evidence-search',
  description: 'Repository evidence search for Bitcode read measurement, proof inspection, and AssetPack planning',
  prompt: bitcodeRepositoryEvidenceSearcherPrompt,
  stepPrompts: {
    plan: () => bitcodeRepositoryEvidenceSearcherStepPrompts.plan,
    try: () => bitcodeRepositoryEvidenceSearcherStepPrompts.try,
    refine: () => bitcodeRepositoryEvidenceSearcherStepPrompts.refine,
    retry: () => bitcodeRepositoryEvidenceSearcherStepPrompts.retry
  },
  tools: [simpleSystemTextSearch],
  outputSchema: BitcodeRepositoryEvidenceSearchRetrySchema,
  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 50000,
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 3,
    backoff: 1000
  }
});

const quickBitcodeRepositoryEvidenceSearchVariation: any = factoryAgentWithSingleStep<
  z.infer<typeof BitcodeRepositoryEvidenceSearchInputSchema>,
  z.infer<typeof BitcodeRepositoryEvidenceSearchRetrySchema>
>({
  name: 'quick-bitcode-repository-evidence-search',
  description: 'Bounded grep-backed repository-evidence lookup for simple Bitcode source-grounding needs',
  execute: async (input, execution) => {
    execution.store('variation', 'mode', 'quick-bitcode-repository-evidence-search');

    const startedAt = Date.now();
    const matches = await simpleSystemTextSearch.execute({
      pattern: input.query,
      cwd: input.searchPath ?? process.cwd(),
      maxResults: input.maxResults,
      ignoreCase: !input.caseSensitive
    });
    const filesWithMatches = new Set(matches.map((match) => match.file));
    const distribution = matches.reduce<Record<string, number>>((acc, match) => {
      const extension = match.file.includes('.') ? match.file.split('.').pop() || 'unknown' : 'unknown';
      acc[extension] = (acc[extension] ?? 0) + 1;
      return acc;
    }, {});

    return {
      searchResults: {
        matches: matches.map((match) => ({
          file: match.file,
          line: match.line,
          content: match.text,
          relevanceScore: 1
        })),
        summary: {
          totalMatches: matches.length,
          filesSearched: filesWithMatches.size,
          filesWithMatches: filesWithMatches.size,
          topFileTypes: Object.keys(distribution),
          keywordsFound: input.query.split(/\s+/u).filter(Boolean).slice(0, 5)
        },
        analysis: {
          patterns: [input.query],
          distribution,
          recommendations: [
            'Treat these matches as repository evidence only; read interpretation, mutation, proof generation, and delivery remain owned by downstream Bitcode systems.'
          ]
        },
        processingTime: Date.now() - startedAt
      },
      queryInsights: {
        queryComplexity: input.regexMode ? 'regex-evidence-pattern' : 'literal-evidence-pattern',
        searchEffectiveness: matches.length > 0 ? 1 : 0,
        suggestedRefinements: matches.length > 0 ? [] : ['Try a narrower Bitcode term, package owner, prompt name, or proof identifier.']
      },
      performance: {
        searchSpeed: matches.length,
        accuracyScore: 1,
        completionRate: 1
      },
      recommendations: [
        'Use matched lines as source-grounding context, not as final proof closure.'
      ],
      success: true,
      completionMessage: 'Bitcode repository-evidence search completed'
    };
  }
});

export const bitcodeRepositoryEvidenceSearcher = bitcodeRepositoryEvidenceSearchVariation;
export const quickBitcodeRepositoryEvidenceSearcher = quickBitcodeRepositoryEvidenceSearchVariation;

export const textSearcher = bitcodeRepositoryEvidenceSearcher;
export const quickTextSearcher = quickBitcodeRepositoryEvidenceSearcher;
export const SIMPLE_TEXT_SEARCH_AGENT = bitcodeRepositoryEvidenceSearcher;

export type BitcodeRepositoryEvidenceSearchInput = z.infer<typeof BitcodeRepositoryEvidenceSearchInputSchema>;
export type BitcodeRepositoryEvidenceSearchPlanOutput = z.infer<typeof BitcodeRepositoryEvidenceSearchPlanSchema>;
export type BitcodeRepositoryEvidenceSearchTryOutput = z.infer<typeof BitcodeRepositoryEvidenceSearchTrySchema>;
export type BitcodeRepositoryEvidenceSearchRefineOutput = z.infer<typeof BitcodeRepositoryEvidenceSearchRefineSchema>;
export type BitcodeRepositoryEvidenceSearchRetryOutput = z.infer<typeof BitcodeRepositoryEvidenceSearchRetrySchema>;

export type TextSearcherInput = BitcodeRepositoryEvidenceSearchInput;
export type TextSearcherPlanOutput = BitcodeRepositoryEvidenceSearchPlanOutput;
export type TextSearcherTryOutput = BitcodeRepositoryEvidenceSearchTryOutput;
export type TextSearcherRefineOutput = BitcodeRepositoryEvidenceSearchRefineOutput;
export type TextSearcherRetryOutput = BitcodeRepositoryEvidenceSearchRetryOutput;
