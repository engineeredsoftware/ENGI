import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  factoryLLMRegistryWithProviders,
} from '@bitcode/generic-llms';
import {
  resolveDefaultLLMConfig,
} from '@bitcode/generic-llms-defaults';

describe('factoryLLMRegistryWithProviders', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.BITCODE_LLM_PROVIDER;
    delete process.env.BITCODE_LLM_MODEL;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('registers google provider and supports default selection', () => {
    const registry = factoryLLMRegistryWithProviders();
    // Ensure no error when picking Google explicitly
    const llm = registry.getLLM(['*'], 'google');
    expect(typeof llm).toBe('function');
  });

  test('selects Anthropic defaults when only an Anthropic key is configured', () => {
    const defaults = resolveDefaultLLMConfig({
      ANTHROPIC_API_KEY: 'sk-ant-test',
    });

    expect(defaults).toEqual({
      provider: 'anthropic',
      model: 'claude-haiku-4-5',
    });
  });

  test('prefers xAI when XAI_API_KEY is present among other provider keys', () => {
    const defaults = resolveDefaultLLMConfig({
      ANTHROPIC_API_KEY: 'sk-ant-test',
      XAI_API_KEY: 'xai-test',
      OPENAI_API_KEY: 'sk-test',
    });

    expect(defaults).toEqual({
      provider: 'xai',
      model: 'grok-3-mini',
    });
  });

  test('selects OpenAI defaults when only an OpenAI key is configured', () => {
    const defaults = resolveDefaultLLMConfig({
      OPENAI_API_KEY: 'sk-test',
    });

    expect(defaults).toEqual({
      provider: 'openai',
      model: 'gpt-4.1-mini',
    });
  });

  test('selects xAI / Grok when XAI_API_KEY is configured without Anthropic', () => {
    const defaults = resolveDefaultLLMConfig({
      XAI_API_KEY: 'xai-test',
      OPENAI_API_KEY: 'sk-test',
    });

    expect(defaults).toEqual({
      provider: 'xai',
      model: 'grok-3-mini',
    });
  });

  test('falls back to xAI product default with no keys', () => {
    const defaults = resolveDefaultLLMConfig({});

    expect(defaults).toEqual({
      provider: 'xai',
      model: 'grok-3-mini',
    });
  });

  test('registers xai provider for explicit selection', () => {
    const registry = factoryLLMRegistryWithProviders();
    const llm = registry.getLLM(['*'], 'xai');
    expect(typeof llm).toBe('function');
  });

  test('preserves explicit provider and model overrides', () => {
    const defaults = resolveDefaultLLMConfig({
      OPENAI_API_KEY: 'sk-test',
      BITCODE_LLM_PROVIDER: 'google',
      BITCODE_LLM_MODEL: 'gemini-2.5-flash',
    });

    expect(defaults).toEqual({
      provider: 'google',
      model: 'gemini-2.5-flash',
    });
  });
});
