// Unit tests for meta prompt utilities
import '@/tests/setupTests';

import {
  formatJsonRequestMessage,
  defaultChunkPrompt,
  defaultSumPrompt,
  defaultFitPrompt,
  defaultCheckPrompt,
  defaultStitchPrompt
} from '@bitcode/steps/meta';

import type { ChatCompletionRequestMessage } from '@bitcode/steps/meta';

describe('formatJsonRequestMessage', () => {
  it('appends JSON requirement to system messages without it', () => {
    const msg: ChatCompletionRequestMessage = { role: 'system', content: 'Test prompt.' };
    const formatted = formatJsonRequestMessage(msg);
    expect(formatted.content).toMatch(/IMPORTANT: Your response MUST be a valid JSON object/);
  });

  it('does not duplicate requirement if already present', () => {
    const requirement = 'IMPORTANT: Your response MUST be a valid JSON object. Return ONLY the JSON';
    const msg: ChatCompletionRequestMessage = { role: 'system', content: `Base.
${requirement}` };
    const formatted = formatJsonRequestMessage(msg);
    expect(formatted.content).toBe(msg.content);
  });
});

describe('default meta prompts', () => {
  const sampleContext = { a: 1, b: 'two' };
  it('defaultChunkPrompt returns a user message containing the chunk JSON', () => {
    const msgs = defaultChunkPrompt(sampleContext);
    expect(Array.isArray(msgs)).toBe(true);
    const m = msgs[0];
    expect(m.role).toBe('user');
    expect(m.content).toMatch(/Context chunk: .*"a":1.*"b":"two"/);
  });

  it('defaultSumPrompt returns a user message containing the chunk results', () => {
    const chunkResults = [{ foo: 'bar' }];
    const msgs = defaultSumPrompt(chunkResults);
    const m = msgs[0];
    expect(m.role).toBe('user');
    expect(m.content).toMatch(/Chunk results: \[.*\{.*"foo":"bar".*\}.*\]/);
  });

  it('defaultFitPrompt returns a user message containing the context JSON', () => {
    const msgs = defaultFitPrompt(sampleContext);
    const m = msgs[0];
    expect(m.role).toBe('user');
    expect(m.content).toMatch(/Context: .*"a":1.*"b":"two"/);
  });

  it('defaultCheckPrompt returns a user message containing soFar JSON', () => {
    const soFar = { x: 1 };
    const msgs = defaultCheckPrompt(soFar);
    const m = msgs[0];
    expect(m.role).toBe('user');
    expect(m.content).toMatch(/Current output: .*"x":1/);
  });

  it('defaultStitchPrompt returns a user message containing previous output JSON', () => {
    const soFar = { y: 2 };
    const msgs = defaultStitchPrompt(soFar);
    const m = msgs[0];
    expect(m.role).toBe('user');
    expect(m.content).toMatch(/Previous output: .*"y":2/);
  });
});