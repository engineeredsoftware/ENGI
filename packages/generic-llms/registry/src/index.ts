/**
 * @bitcode/generic-llms
 *
 * Aggregator registry for nested generic-llms provider packages.
 * Hierarchy: llm-generics (primitives) → generic-llms/* (providers) → this registry.
 *
 * Prefer importing individual providers from their packages when only one is needed:
 *   @bitcode/generic-llms-xai | -openai | -anthropic | -google | -defaults
 */

export { openAIProvider } from '@bitcode/generic-llms-openai';
export { anthropicProvider } from '@bitcode/generic-llms-anthropic';
export { googleProvider } from '@bitcode/generic-llms-google';
export { xaiProvider } from '@bitcode/generic-llms-xai';
export {
  resolveDefaultLLMConfig,
  resolveDefaultLLMModel,
  resolveDefaultLLMProvider,
  type BitcodeLLMEnvironment,
} from '@bitcode/generic-llms-defaults';

import { factoryLLMRegistry, LLMRegistry } from '@bitcode/llm-generics';
import { resolveDefaultLLMConfig } from '@bitcode/generic-llms-defaults';
import { openAIProvider } from '@bitcode/generic-llms-openai';
import { anthropicProvider } from '@bitcode/generic-llms-anthropic';
import { googleProvider } from '@bitcode/generic-llms-google';
import { xaiProvider } from '@bitcode/generic-llms-xai';

/**
 * Build an LLMRegistry with all nested generic-llms providers registered
 * and environment-resolved default provider/model applied.
 */
export function factoryLLMRegistryWithProviders(): LLMRegistry {
  const registry = factoryLLMRegistry();

  // xAI first so the name is available when it is the env-resolved default.
  registry.registerProvider(xaiProvider);
  registry.registerProvider(openAIProvider);
  registry.registerProvider(anthropicProvider);
  registry.registerProvider(googleProvider);

  const defaults = resolveDefaultLLMConfig();
  registry.setDefaultProvider(defaults.provider);
  registry.configure('*', { model: defaults.model }, 0);

  return registry;
}
