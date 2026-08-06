/**
 * Bitcode Read-Synthesis Web Research Agent - Declarative PTRR support pattern.
 *
 * V26 semantics are discovery-phase web research for read synthesis. The agent
 * returns source-attributed external evidence for read measurement, third-party
 * interface constraints, proof-gap question formation, and AssetPack planning.
 * External web findings are auxiliary evidence, not canonical proof.
 */

import {
  AgentPrompt,
  AgentStepPrompt,
  factoryPTRRAgent
} from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  getContents,
  multiProviderSearch,
  search,
  searchWithUrlIntelligence
} from '@bitcode/generic-tools-web-search';
import {
  BitcodeExternalEvidenceResearchInputSchema,
  BitcodeExternalEvidenceResearchResultSchema
} from './schemas';
import type {
  BitcodeExternalEvidenceResearchInput as BitcodeExternalEvidenceResearchInputType,
  BitcodeExternalEvidenceResearchResult as BitcodeExternalEvidenceResearchResultType
} from './schemas';

export const bitcodeReadSynthesisWebResearcherPrompt = new AgentPrompt({
  name: 'bitcode-read-synthesis-web-researcher' as PromptPart,
  identity: 'Bitcode discovery-phase web research agent for read synthesis' as PromptPart
});

export const bitcodeReadSynthesisWebResearcherStepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Plan bounded discovery-phase web research for Bitcode read synthesis' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Collect traceable external evidence for read synthesis without scraping-product ownership' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Refine read-synthesis findings into source-quality and volatility context' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Finalize discovery-phase web research and expose unresolved read gaps without claiming proof closure' as PromptPart })
};

export const bitcodeExternalEvidenceResearcherPrompt = bitcodeReadSynthesisWebResearcherPrompt;
export const bitcodeExternalEvidenceResearcherStepPrompts = bitcodeReadSynthesisWebResearcherStepPrompts;
export const webResearcherPrompt = bitcodeReadSynthesisWebResearcherPrompt;
export const webResearcherStepPrompts = bitcodeReadSynthesisWebResearcherStepPrompts;

export const bitcodeReadSynthesisWebResearcher: any = factoryPTRRAgent<
  BitcodeExternalEvidenceResearchInputType,
  BitcodeExternalEvidenceResearchResultType
>({
  name: 'bitcode-read-synthesis-web-research',
  description: 'Discovery-phase web research for Bitcode read synthesis, third-party context, proof-gap question formation, and AssetPack planning',
  prompt: bitcodeReadSynthesisWebResearcherPrompt,
  stepPrompts: {
    plan: () => bitcodeReadSynthesisWebResearcherStepPrompts.plan,
    try: () => bitcodeReadSynthesisWebResearcherStepPrompts.try,
    refine: () => bitcodeReadSynthesisWebResearcherStepPrompts.refine,
    retry: () => bitcodeReadSynthesisWebResearcherStepPrompts.retry
  },
  tools: [
    search,
    searchWithUrlIntelligence,
    multiProviderSearch,
    getContents
  ],
  outputSchema: BitcodeExternalEvidenceResearchResultSchema,
  plan: {
    chunkThreshold: 1000
  },
  try: {
    chunkThreshold: 5000,
    enableParallelChunks: true
  },
  refine: {
    maxAttempts: 2
  },
  retry: {
    maxAttempts: 1,
    backoff: 1000
  }
});

export const bitcodeExternalEvidenceResearcher = bitcodeReadSynthesisWebResearcher;
export const webResearcherAgent = bitcodeReadSynthesisWebResearcher;
export const WEB_RESEARCH_AGENT = {
  researchWeb: bitcodeReadSynthesisWebResearcher
};

export {
  BitcodeExternalEvidenceDepthSchema,
  BitcodeExternalEvidenceFindingSchema,
  BitcodeExternalEvidenceQualitySchema,
  BitcodeExternalEvidenceResearchInputSchema,
  BitcodeExternalEvidenceResearchPlanSchema,
  BitcodeExternalEvidenceResearchRefineSchema,
  BitcodeExternalEvidenceResearchResultSchema,
  BitcodeExternalEvidenceResearchTrySchema,
  BitcodeExternalEvidenceSourceClassSchema,
  BitcodeExternalEvidenceSynthesisSchema,
  BitcodeExternalEvidenceTemporalRiskSchema,
  BitcodeExternalEvidenceToolRequestSchema,
  ResearchInputSchema,
  ResearchResultSchema,
  WebResearcherAgentRetryStepOutput
} from './schemas';

export type {
  BitcodeExternalEvidenceDepth,
  BitcodeExternalEvidenceFinding,
  BitcodeExternalEvidenceQuality,
  BitcodeExternalEvidenceResearchInput,
  BitcodeExternalEvidenceResearchPlan,
  BitcodeExternalEvidenceResearchRefine,
  BitcodeExternalEvidenceResearchResult,
  BitcodeExternalEvidenceResearchTry,
  BitcodeExternalEvidenceSourceClass,
  BitcodeExternalEvidenceSynthesis,
  BitcodeExternalEvidenceTemporalRisk,
  BitcodeExternalEvidenceToolRequest,
  ResearchInput,
  ResearchResult
} from './schemas';
