/**
 * @jest-environment node
 *
 * Unit tests for the client-side `parseStreamChunk` helper that converts raw
 * text coming from an SSE connection to a structured object.
 */

import { parseStreamChunk } from '@/streaming/stream-parser';

describe('parseStreamChunk', () => {
  it('parses a chunk that contains a status event', () => {
    const chunk =
      'data: ' +
      JSON.stringify({ type: 'status', step: 'Setup', message: 'initialising' }) +
      '\n\n';

    const parsed = parseStreamChunk(chunk);

    expect(parsed.status).not.toBeNull();
    expect(parsed.status!.step).toBe('Setup');
    expect(parsed.error).toBeNull();
  });

  it('concatenates text for generation events', () => {
    const chunk =
      [
        'data: ' + JSON.stringify({
          type: 'generation',
          message: 'calling model',
          executionState: {
            phase: 'Discovery',
            agent: 'AgentA',
            step: 'Plan',
            failsafe: 'prepare_concise_context',
            generation: 'reason',
          },
        }),
        '',
      ].join('\n');

    const parsed = parseStreamChunk(chunk);
    expect(parsed.text).toContain('🤖 Generation:');
    // The helper tags the execution path – ensure at least agent name appears.
    expect(parsed.text).toContain('AgentA');
    expect(parsed.type).toBe('generation');
  });

  it('parses thinking events with or without executionState', () => {
    const chunk =
      'data: ' +
      JSON.stringify({ type: 'thinking', message: 'considering options' }) +
      '\n\n';

    const parsed = parseStreamChunk(chunk);
    expect(parsed.type).toBe('thinking');
    expect(parsed.text).toContain('💭 Thinking');
  });

  it('does not throw and reports an error field when fed malformed JSON', () => {
    const malformedChunk = 'data: { this is bad json }\n\n';

    const parsed = parseStreamChunk(malformedChunk);

    // Parser should gracefully handle the error and set `error` or leave fields blank
    expect(parsed.error).not.toBeNull();
    // status/text stay empty when the line fails to parse
    expect(parsed.status).toBeNull();
  });
});
