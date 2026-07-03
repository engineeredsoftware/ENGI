/**
 * llm-generics - Pure LLM primitives with zero framework awareness
 * 
 * LLMs are simple async functions that transform input to output.
 * Configuration cascades through registries.
 */

import { Registry, factoryRegistry, RegistryPathBuilder } from '@bitcode/registry';

// ====================
// Core Types
// ====================

export interface LLMInput {
  messages: LLMMessage[];
  config?: Partial<LLMConfig>;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  [key: string]: any; // Allow additional properties for StorableObject shape support
}

export interface LLMOutputMetadata {
  /**
   * Provider-agnostic stop reason for the completion.
   * Examples: 'stop', 'length', 'content_filter', 'unknown'.
   */
  stopReason?: string;
  // Allow providers to attach additional metadata without breaking consumers
  [key: string]: any;
}

export interface LLMOutput {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  metadata?: LLMOutputMetadata;
}

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  responseFormat?: 'text' | 'json';
  seed?: number;
  [key: string]: any;
}

// The fundamental primitive
export type LLM = (input: LLMInput) => Promise<LLMOutput>;

// ====================
// Provider Types
// ====================

export interface LLMProvider {
  name: string;
  createLLM(config: LLMConfig): LLM;
  validateConfig?(config: LLMConfig): boolean;
  getDefaultConfig?(): Partial<LLMConfig>;
}

// ====================
// LLM Registry
// ====================

export class LLMRegistry {
  private configRegistry: Registry<LLMConfig>;
  private providers = new Map<string, LLMProvider>();
  private defaultProvider = 'openai';

  constructor() {
    this.configRegistry = factoryRegistry<LLMConfig>();
  }

  // Register a provider
  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  // Configure at any level
  configure(path: string, config: Partial<LLMConfig>, priority: number = 0): void {
    this.configRegistry.set(path, config as LLMConfig, priority);
  }

  // Get LLM with cascading config
  getLLM(hierarchy: string[], provider?: string): LLM {
    const providerName = provider || this.defaultProvider;
    const llmProvider = this.providers.get(providerName);
    
    if (!llmProvider) {
      throw new Error(`LLM provider '${providerName}' not found`);
    }

    // Get cascading configuration
    const config = this.configRegistry.get(hierarchy) || {};

    // Create the LLM
    return llmProvider.createLLM(config);
  }

  // Get configured LLM for a specific sequence
  getSequenceLLM(
    pipeline: string,
    phase: string,
    agent: string,
    sequence: string,
    provider?: string
  ): LLM {
    const builder = RegistryPathBuilder.from('pipeline', pipeline)
      .add('phase').add(phase)
      .add('agent').add(agent)
      .add('sequence').add(sequence);
    
    const hierarchy = builder.buildHierarchy();

    // Add global config to hierarchy
    hierarchy.unshift('*');

    return this.getLLM(hierarchy, provider);
  }

  setDefaultProvider(provider: string): void {
    this.defaultProvider = provider;
  }
}

// ====================
// Factory Functions
// ====================

export function factoryLLMRegistry(): LLMRegistry {
  return new LLMRegistry();
}

// ================
// Generation Primitives
// ================
export type { Generation, GenerationPrompt } from './generation';
export { createGeneration } from './generation';
export type { ThinkingsGeneration } from './thinkings-generation';
export { createThinkingsGeneration } from './thinkings-generation';
