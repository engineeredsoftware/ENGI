/**
 * Bitcode Read-Synthesis Web Search Agent - admitted support package.
 *
 * V26 semantics are bounded discovery-phase web search for Bitcode read synthesis:
 * collect source-attributed external evidence, score source quality, surface
 * volatility, and hand unresolved questions to downstream read/proof owners.
 * This package does not own canonical read interpretation, proof generation,
 * mutation, delivery, Exchange product behavior, or Terminal product behavior.
 */

import {
  AgentPrompt,
  AgentStepPrompt,
  factoryPTRRAgent,
  factoryAgentWithSingleStep
} from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  getContents,
  multiProviderSearch,
  search,
  searchWithUrlIntelligence
} from '@bitcode/generic-tools-web-search';
import { z } from 'zod';

export const BitcodeReadSynthesisWebSearchInputSchema = z.object({
  read: z.string().describe('Bitcode read or proof gap requiring external source context'),
  query: z.string().optional().describe('Search query when the caller has not separated read from query text'),
  sourceScope: z.enum(['primary-first', 'official-first', 'broad-context']).default('primary-first'),
  maxResults: z.number().min(1).max(50).default(10),
  dateFilter: z.enum(['any', 'day', 'week', 'month', 'year']).default('any'),
  domainFilter: z.string().optional().describe('Specific source domain to inspect when read synthesis is source-constrained'),
  language: z.string().default('en').describe('Preferred source language'),
  includeSnippets: z.boolean().default(true).describe('Include snippets as traceable source-attributed context'),
  evidenceDepth: z.enum(['surface', 'moderate', 'deep']).default('surface'),
  requirePrimarySources: z.boolean().default(true).describe('Prefer primary, official, standards, repository, or protocol-owner sources'),
  urlAttachments: z.array(z.string()).optional().describe('URLs used only to improve read-synthesis search targeting')
}).describe('BitcodeReadSynthesisWebSearchInput');

export const BitcodeReadSynthesisWebSearchToolRequestSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string()
}).describe('BitcodeReadSynthesisWebSearchToolRequest');

export const BitcodeReadSynthesisWebSearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  domain: z.string(),
  publishDate: z.string().optional(),
  provider: z.string().optional(),
  sourceClass: z.enum(['primary', 'official', 'standard', 'repository', 'paper', 'vendor', 'commentary', 'unknown']),
  relevanceScore: z.number().min(0).max(1),
  sourceQualityScore: z.number().min(0).max(1),
  evidenceUse: z.string().describe('How this result may support Bitcode read synthesis without becoming proof by itself')
}).describe('BitcodeReadSynthesisWebSearchResult');

export const BitcodeReadSynthesisWebSearchPlanSchema = z.object({
  normalizedNeed: z.string(),
  plannedQueries: z.array(z.string()),
  preferredSourceClasses: z.array(z.string()),
  sourceSelectionRationale: z.array(z.string()),
  volatilityQuestions: z.array(z.string()),
  boundaryWarnings: z.array(z.string()),
  useTools: z.array(BitcodeReadSynthesisWebSearchToolRequestSchema).optional(),
  confidence: z.number().min(0).max(1),
  searchComplexity: z.enum(['simple', 'moderate', 'complex'])
}).describe('BitcodeReadSynthesisWebSearchPlan');

export const BitcodeReadSynthesisWebSearchTrySchema = z.object({
  attemptedQueries: z.array(z.string()),
  enginesUsed: z.array(z.string()),
  totalResultsFound: z.number(),
  searchDuration: z.number(),
  searchResults: z.array(BitcodeReadSynthesisWebSearchResultSchema),
  rejectedResults: z.array(z.object({
    url: z.string(),
    reason: z.string()
  })).default([]),
  useTools: z.array(BitcodeReadSynthesisWebSearchToolRequestSchema).optional(),
  searchComplete: z.boolean(),
  errors: z.array(z.string()).optional()
}).describe('BitcodeReadSynthesisWebSearchTry');

export const BitcodeReadSynthesisWebSearchRefineSchema = z.object({
  refinedResults: z.array(BitcodeReadSynthesisWebSearchResultSchema),
  quality: z.object({
    totalSources: z.number(),
    primarySourceCount: z.number(),
    averageSourceQuality: z.number(),
    coverageBreadth: z.number(),
    temporalRisk: z.enum(['low', 'medium', 'high', 'unknown'])
  }),
  synthesisSupport: z.object({
    readRelevance: z.array(z.string()),
    sourceBackedClaims: z.array(z.string()),
    contradictions: z.array(z.string()),
    unresolvedGaps: z.array(z.string())
  }),
  proofBoundaryWarnings: z.array(z.string()),
  useTools: z.array(BitcodeReadSynthesisWebSearchToolRequestSchema).optional(),
  confidence: z.number().min(0).max(1)
}).describe('BitcodeReadSynthesisWebSearchRefine');

export const BitcodeReadSynthesisWebSearchRetrySchema = z.object({
  searchResults: z.object({
    topResults: z.array(BitcodeReadSynthesisWebSearchResultSchema),
    totalResults: z.number(),
    searchSummary: z.string(),
    keyInsights: z.array(z.string())
  }),
  searchAnalysis: z.object({
    queryEffectiveness: z.number().min(0).max(1),
    resultsDiversity: z.number().min(0).max(1),
    sourceCoverage: z.number().min(0).max(1),
    sourceCredibility: z.number().min(0).max(1)
  }),
  searchMetadata: z.object({
    searchDuration: z.number(),
    enginesUsed: z.array(z.string()),
    totalQueries: z.number(),
    finalResultCount: z.number(),
    confidenceScore: z.number().min(0).max(1)
  }),
  downstreamReadSynthesisActions: z.array(z.string()),
  proofBoundaryWarnings: z.array(z.string()),
  useTools: z.array(BitcodeReadSynthesisWebSearchToolRequestSchema).optional(),
  success: z.boolean(),
  completionMessage: z.string()
}).describe('BitcodeReadSynthesisWebSearchRetry');

export const WebSearchInputSchema = BitcodeReadSynthesisWebSearchInputSchema;
export const WebSearchPlanSchema = BitcodeReadSynthesisWebSearchPlanSchema;
export const WebSearchTrySchema = BitcodeReadSynthesisWebSearchTrySchema;
export const WebSearchRefineSchema = BitcodeReadSynthesisWebSearchRefineSchema;
export const WebSearchRetrySchema = BitcodeReadSynthesisWebSearchRetrySchema;

export const bitcodeReadSynthesisWebSearchPrompt = new AgentPrompt({
  name: 'bitcode-read-synthesis-web-search' as PromptPart,
  identity: 'Bitcode discovery-phase web search support for read synthesis' as PromptPart
});

export const bitcodeReadSynthesisWebSearchStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan source-bounded web search for Bitcode read synthesis' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Collect source-attributed external evidence without claiming proof closure' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Refine search results into source quality, volatility, and read-relevance context' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize web-search evidence support and expose unresolved downstream questions' as PromptPart })
};

export const webSearchPrompt = bitcodeReadSynthesisWebSearchPrompt;
export const webSearchStepPrompts = bitcodeReadSynthesisWebSearchStepPrompts;

// @ts-expect-error TS2589: deep generic instantiation under monorepo path-mapped typecheck
const bitcodeReadSynthesisWebSearchAgent: any = factoryPTRRAgent<
  z.infer<typeof BitcodeReadSynthesisWebSearchInputSchema>,
  z.infer<typeof BitcodeReadSynthesisWebSearchRetrySchema>
>({
  name: 'bitcode-read-synthesis-web-search',
  description: 'Discovery-phase web search for source-attributed Bitcode read-synthesis evidence',
  prompt: bitcodeReadSynthesisWebSearchPrompt,
  stepPrompts: {
    plan: () => bitcodeReadSynthesisWebSearchStepPrompts.plan,
    try: () => bitcodeReadSynthesisWebSearchStepPrompts.try,
    refine: () => bitcodeReadSynthesisWebSearchStepPrompts.refine,
    retry: () => bitcodeReadSynthesisWebSearchStepPrompts.retry
  },
  tools: [
    search,
    searchWithUrlIntelligence,
    multiProviderSearch,
    getContents
  ],
  outputSchema: BitcodeReadSynthesisWebSearchRetrySchema,
  plan: {
    chunkThreshold: 500
  },
  try: {
    chunkThreshold: 20000,
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

const quickBitcodeReadSynthesisWebSearchAgent: any = factoryAgentWithSingleStep<
  z.infer<typeof BitcodeReadSynthesisWebSearchInputSchema>,
  z.infer<typeof BitcodeReadSynthesisWebSearchRetrySchema>
>({
  name: 'quick-bitcode-read-synthesis-web-search',
  description: 'Fast stable web-search evidence support for Bitcode read synthesis',
  execute: async (input, execution) => {
    execution.store('variation', 'mode', 'quick-bitcode-read-synthesis-web-search');

    return {
      searchResults: {
        topResults: [],
        totalResults: 0,
        searchSummary: `Quick Bitcode read-synthesis web search queued for: ${input.read || input.query || 'unspecified read'}`,
        keyInsights: ['Quick mode records the search read; use PTRR mode for source-attributed evidence.']
      },
      searchAnalysis: {
        queryEffectiveness: 0.5,
        resultsDiversity: 0,
        sourceCoverage: 0,
        sourceCredibility: 0
      },
      searchMetadata: {
        searchDuration: 0,
        enginesUsed: ['quick-support-placeholder'],
        totalQueries: input.query ? 1 : 0,
        finalResultCount: 0,
        confidenceScore: 0.5
      },
      downstreamReadSynthesisActions: ['Run full Bitcode read-synthesis web search before relying on external evidence.'],
      proofBoundaryWarnings: ['Quick web-search output is not source-attributed proof evidence.'],
      success: true,
      completionMessage: 'Quick Bitcode read-synthesis web search support output completed'
    };
  }
});

export const bitcodeReadSynthesisWebSearch = bitcodeReadSynthesisWebSearchAgent;
export const quickBitcodeReadSynthesisWebSearch = quickBitcodeReadSynthesisWebSearchAgent;
export const webSearch = bitcodeReadSynthesisWebSearchAgent;
export const quickWebSearch = quickBitcodeReadSynthesisWebSearchAgent;

export type BitcodeReadSynthesisWebSearchInput = z.infer<typeof BitcodeReadSynthesisWebSearchInputSchema>;
export type BitcodeReadSynthesisWebSearchPlanOutput = z.infer<typeof BitcodeReadSynthesisWebSearchPlanSchema>;
export type BitcodeReadSynthesisWebSearchTryOutput = z.infer<typeof BitcodeReadSynthesisWebSearchTrySchema>;
export type BitcodeReadSynthesisWebSearchRefineOutput = z.infer<typeof BitcodeReadSynthesisWebSearchRefineSchema>;
export type BitcodeReadSynthesisWebSearchRetryOutput = z.infer<typeof BitcodeReadSynthesisWebSearchRetrySchema>;

export type WebSearchInput = BitcodeReadSynthesisWebSearchInput;
export type WebSearchPlanOutput = BitcodeReadSynthesisWebSearchPlanOutput;
export type WebSearchTryOutput = BitcodeReadSynthesisWebSearchTryOutput;
export type WebSearchRefineOutput = BitcodeReadSynthesisWebSearchRefineOutput;
export type WebSearchRetryOutput = BitcodeReadSynthesisWebSearchRetryOutput;
