/**
 * GENERIC LLMS PROVIDERS UNIT TESTS
 *
 * Pins nested provider packages (OpenAI, Anthropic) against the llm-generics
 * LLMProvider contract. SDK clients are manual-mocked via jest moduleNameMapper
 * so nested-package require() paths resolve without hanging on real network I/O.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { openAIProvider } from '@bitcode/generic-llms-openai';
import { anthropicProvider } from '@bitcode/generic-llms-anthropic';
import type { LLMInput } from '@bitcode/llm-generics';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenAI = require('openai');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Anthropic = require('@anthropic-ai/sdk');

describe('OpenAI Provider', () => {
  beforeEach(() => {
    OpenAI.mockClear();
    OpenAI.__create.mockReset();
  });

  describe('provider interface', () => {
    test('should have correct provider name', () => {
      expect(openAIProvider.name).toBe('openai');
    });

    test('should create LLM function', () => {
      const llm = openAIProvider.createLLM({ model: 'gpt-4' });
      expect(llm).toBeDefined();
      expect(typeof llm).toBe('function');
    });
  });

  describe('config validation', () => {
    test('should validate config if validator provided', () => {
      if (openAIProvider.validateConfig) {
        const valid = openAIProvider.validateConfig({
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        });
        expect(valid).toBe(true);
      }
    });

    test('should provide default config', () => {
      if (openAIProvider.getDefaultConfig) {
        const defaults = openAIProvider.getDefaultConfig();
        expect(defaults).toHaveProperty('model');
        expect(defaults.temperature).toBeGreaterThanOrEqual(0);
        expect(defaults.temperature).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('LLM execution', () => {
    test('should transform input to API format', async () => {
      OpenAI.__create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Test response' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
        model: 'gpt-4',
      });

      const llm = openAIProvider.createLLM({ model: 'gpt-4' });
      const input: LLMInput = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' },
        ],
      };

      const result = await llm(input);

      expect(OpenAI.__create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
        })
      );
      expect(result).toEqual({
        content: 'Test response',
        usage: {
          inputTokens: 10,
          outputTokens: 5,
          totalTokens: 15,
        },
        metadata: expect.any(Object),
      });
    });

    test('should return structured mock when API unavailable in test mode', async () => {
      OpenAI.__create.mockRejectedValue(new Error('API Error'));

      const llm = openAIProvider.createLLM({ model: 'gpt-4' });
      const input: LLMInput = {
        messages: [{ role: 'user', content: 'Test' }],
      };

      const result = await llm(input);
      expect(result).toMatchObject({
        content: expect.stringContaining('OpenAI (mock) response'),
        metadata: { mocked: true, model: 'gpt-4' },
      });
    });
  });
});

describe('Anthropic Provider', () => {
  beforeEach(() => {
    Anthropic.mockClear();
    Anthropic.__create.mockReset();
  });

  describe('provider interface', () => {
    test('should have correct provider name', () => {
      expect(anthropicProvider.name).toBe('anthropic');
    });

    test('should create LLM function', () => {
      const llm = anthropicProvider.createLLM({ model: 'claude-3-opus-20240229' });
      expect(llm).toBeDefined();
      expect(typeof llm).toBe('function');
    });
  });

  describe('message transformation', () => {
    test('should separate system message from user messages', async () => {
      Anthropic.__create.mockResolvedValue({
        content: [{ text: 'Claude response' }],
        usage: {
          input_tokens: 20,
          output_tokens: 10,
        },
        model: 'claude-3-opus-20240229',
        stop_reason: 'end_turn',
      });

      const llm = anthropicProvider.createLLM({ model: 'claude-3-opus-20240229' });
      const input: LLMInput = {
        messages: [
          { role: 'system', content: 'You are Claude' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'How are you?' },
        ],
      };

      await llm(input);

      expect(Anthropic.__create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-opus-20240229',
          system: 'You are Claude',
          messages: [{ role: 'user', content: 'Hello\n\nHi there!\n\nHow are you?' }],
        })
      );
    });
  });

  describe('response handling', () => {
    test('should handle text content blocks', async () => {
      Anthropic.__create.mockResolvedValue({
        content: [
          { type: 'text', text: 'Part 1' },
          { type: 'text', text: 'Part 2' },
        ],
        usage: {
          input_tokens: 30,
          output_tokens: 15,
        },
        model: 'claude-3-opus-20240229',
        stop_reason: 'end_turn',
      });

      const llm = anthropicProvider.createLLM({ model: 'claude-3-opus-20240229' });
      const result = await llm({
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(result.content).toBe('Part 1');
      expect(result.usage).toEqual({
        inputTokens: 30,
        outputTokens: 15,
        totalTokens: 45,
      });
    });
  });
});
