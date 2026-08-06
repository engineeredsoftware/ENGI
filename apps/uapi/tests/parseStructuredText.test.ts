// Tests for parseStructuredText helper
import '@/tests/setupTests';

import { z } from 'zod';
import { parseStructuredText } from '@bitcode/steps/sub';

// Mock parseResponse and extractJsonFromResponse
jest.mock('@bitcode/parsing', () => ({
  parseResponse: jest.fn(),
  extractJsonFromResponse: jest.fn(),
}));

describe('parseStructuredText', () => {
  const schema = z.object({ foo: z.string(), bar: z.number() }).describe('SchemaName');
  const textValid = JSON.stringify({ foo: 'A', bar: 1 });
  const textPartial = 'noise {' + JSON.stringify({ foo: 'B', bar: 2 }) + '}';

  beforeEach(() => jest.clearAllMocks());

  it('returns parsed data when parseResponse succeeds', async () => {
    const { parseResponse, extractJsonFromResponse } = require('@bitcode/parsing');
    parseResponse.mockResolvedValue({ foo: 'A', bar: 1 });
    const res = await parseStructuredText(textValid, schema, () => ({ foo: 'X', bar: 0 }));
    expect(parseResponse).toHaveBeenCalledWith(
      textValid,
      schema,
      expect.any(Function),
      { maxRetries: 2, retryDelay: 1000 }
    );
    expect(extractJsonFromResponse).not.toHaveBeenCalled();
    expect(res).toEqual({ foo: 'A', bar: 1 });
  });

  it('falls back to extractJsonFromResponse when parseResponse fails', async () => {
    const { parseResponse, extractJsonFromResponse } = require('@bitcode/parsing');
    parseResponse.mockRejectedValue(new Error('fail parse'));    
    extractJsonFromResponse.mockReturnValue(JSON.stringify({ foo: 'B', bar: 2 }));
    const res = await parseStructuredText(textPartial, schema, () => ({ foo: 'X', bar: 0 }));
    expect(parseResponse).toHaveBeenCalled();
    expect(extractJsonFromResponse).toHaveBeenCalledWith(textPartial);
    expect(res).toEqual({ foo: 'B', bar: 2 });
  });

  it('returns fallback when both parseResponse and extract fail', async () => {
    const { parseResponse, extractJsonFromResponse } = require('@bitcode/parsing');
    parseResponse.mockRejectedValue(new Error('parse fail'));    
    extractJsonFromResponse.mockReturnValue('notjson');
    const fallbackVal = { foo: 'FALL', bar: 9 };
    const res = await parseStructuredText('invalid', schema, () => fallbackVal);
    expect(res).toEqual(fallbackVal);
  });
});