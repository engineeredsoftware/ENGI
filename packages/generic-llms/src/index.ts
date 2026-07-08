/**
 * Generic LLMs - Provider implementations for the LLM generics
 * 
 * This package provides concrete LLM implementations while llm-generics
 * defines the pure interfaces and types.
 */

// Provider exports
export { openAIProvider } from './providers/openai';
export { anthropicProvider } from './providers/anthropic';
export { googleProvider } from './providers/google';
export { xaiProvider } from './providers/xai';
export {
  resolveDefaultLLMConfig,
  resolveDefaultLLMModel,
  resolveDefaultLLMProvider,
  type BitcodeLLMEnvironment,
} from './defaults';

// Factory for pre-configured registry
import { factoryLLMRegistry, LLMRegistry } from '@bitcode/llm-generics';
import { resolveDefaultLLMConfig } from './defaults';

export function factoryLLMRegistryWithProviders(): LLMRegistry {
  const registry = factoryLLMRegistry();
  
  // Import providers dynamically to avoid circular deps
  const { openAIProvider } = require('./providers/openai');
  const { anthropicProvider } = require('./providers/anthropic');
  const { googleProvider } = require('./providers/google');
  const { xaiProvider } = require('./providers/xai');
  
  // Register providers (xAI/Grok first so name is available for default)
  registry.registerProvider(xaiProvider);
  registry.registerProvider(openAIProvider);
  registry.registerProvider(anthropicProvider);
  registry.registerProvider(googleProvider);

  // Apply environment-resolved default provider + model to the global path.
  const defaults = resolveDefaultLLMConfig();
  registry.setDefaultProvider(defaults.provider);
  registry.configure('*', { model: defaults.model }, 0);
  
  return registry;
}
