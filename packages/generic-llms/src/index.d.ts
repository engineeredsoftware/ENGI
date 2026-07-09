/**
 * Generic LLMs - Provider implementations for the LLM generics
 *
 * This package provides concrete LLM implementations while llm-generics
 * defines the pure interfaces and types.
 */
export { openAIProvider } from './providers/openai';
export { anthropicProvider } from './providers/anthropic';
export { googleProvider } from './providers/google';
export { xaiProvider } from './providers/xai';
export { resolveDefaultLLMConfig, resolveDefaultLLMModel, resolveDefaultLLMProvider, type BitcodeLLMEnvironment, } from './defaults';
import { LLMRegistry } from '@bitcode/llm-generics';
export declare function factoryLLMRegistryWithProviders(): LLMRegistry;
