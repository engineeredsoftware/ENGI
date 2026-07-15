// Tests for structuredLLMCall dry-run and normal behavior
import '@/tests/setupTests';

import { z } from 'zod';
import { structuredLLMCall } from '@bitcode/steps/sub';

// Mock dependencies
jest.mock('@bitcode/generic-executions', () => ({
  getProcessRootFields: jest.fn().mockReturnValue({
    getCurrentIteration: () => ({ correlationId: 'cid', llmCalls: [] }),
    execution: { phases: { setup: { name: 'setup', agents: [] } } }
  })
}));
jest.mock('@bitcode/dryrun', () => ({
  isDryRunEnabled: jest.fn(),
  logDryRunPrompt: jest.fn(),
  logDryRunResponse: jest.fn(),
  generateDefaultResponse: jest.fn((schema) => ({ foo: 'default' }))
}));
jest.mock('ai', () => ({ generateText: jest.fn() }));
jest.mock('@bitcode/parsing', () => ({ extractJsonFromResponse: jest.fn(), parseResponse: jest.fn() }));
jest.mock('@bitcode/api/streams', () => ({ writeStreamMessage: jest.fn(), writeStreamGeneration: jest.fn() }));
jest.mock('@bitcode/generic-llms-models', () => ({ getModelInstance: jest.fn(() => ({ provider: 'testModel' })) }));
jest.mock('@bitcode/btd', () => ({
  estimateTokens: jest.fn(() => 1),
  buildGenerationBitcodeAccounting: jest.fn(),
}));

describe('structuredLLMCall dry-run', () => {
  beforeEach(() => jest.clearAllMocks());
  it('uses fallback in dry-run mode', async () => {
    const { isDryRunEnabled, logDryRunPrompt, logDryRunResponse, generateDefaultResponse } = require('@bitcode/dryrun');
    isDryRunEnabled.mockReturnValue(true);
    const schema = z.object({ foo: z.string() }).describe('test');
    const config = { schema, fallback: () => ({ foo: 'fb' }) };
    const res = await structuredLLMCall([], config as any, 'purpose');
    expect(res).toEqual({ foo: 'fb', _metadata: expect.objectContaining({ dryRun: true, purpose: 'purpose', schema: 'test' }) });
    expect(logDryRunPrompt).toHaveBeenCalled();
    expect(logDryRunResponse).toHaveBeenCalled();
  });
});
/** Tests for non-dry-run parsing behavior */
describe('structuredLLMCall non-dry-run parsing', () => {
  let parseResponse: jest.Mock;
  let extractJsonFromResponse: jest.Mock;
  let generateText: jest.Mock;
  let isDryRunEnabled: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    const dryrun = require('@bitcode/dryrun');
    isDryRunEnabled = dryrun.isDryRunEnabled;
    isDryRunEnabled.mockReturnValue(false);
    parseResponse = require('@bitcode/parsing').parseResponse;
    extractJsonFromResponse = require('@bitcode/parsing').extractJsonFromResponse;
    generateText = require('ai').generateText;
    // Stub context
    require('@bitcode/generic-executions').getProcessRootFields.mockReturnValue({
      getCurrentIteration: () => ({ correlationId: 'cid', llmCalls: [] }),
      execution: { phases: { setup: { name: 'setup', agents: [] } } },
      dataStream: {}
    });
  });

  const schema = z.object({ foo: z.string(), bar: z.number() }).describe('TestSchema');

  it('parses valid JSON via parseResponse', async () => {
    generateText.mockResolvedValue({ text: JSON.stringify({ foo: 'ok', bar: 1 }) });
    parseResponse.mockResolvedValue({ foo: 'ok', bar: 1 });
    const res = await structuredLLMCall([{ role: 'user', content: 'hi' }], { schema, fallback: () => ({ foo: 'fb', bar: 0 }) } as any, 'purpose');
    expect(parseResponse).toHaveBeenCalledWith(
      JSON.stringify({ foo: 'ok', bar: 1 }),
      schema,
      expect.any(Function),
      expect.any(Object)
    );
    expect(extractJsonFromResponse).not.toHaveBeenCalled();
    expect(res).toEqual({ foo: 'ok', bar: 1 });
  });

  it('falls back to extractJsonFromResponse on parseResponse error', async () => {
    const text = 'ignore me {"foo":"baz","bar":2} bye';
    generateText.mockResolvedValue({ text });
    parseResponse.mockImplementation(() => { throw new Error('parse failed'); });
    extractJsonFromResponse.mockReturnValue('{"foo":"baz","bar":2}');
    const res = await structuredLLMCall([], { schema, fallback: () => ({ foo: 'fb', bar: 0 }) } as any, 'purpose');
    expect(parseResponse).toHaveBeenCalled();
    expect(extractJsonFromResponse).toHaveBeenCalledWith(text);
    expect(res).toEqual({ foo: 'baz', bar: 2 });
  });

});
