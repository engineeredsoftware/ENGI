/**
 * @jest-environment node
 */

import { createSupabaseSSEPollStream } from '@bitcode/sse';

// Helper: collect chunks for up to `durationMs` or until the predicate returns true
async function collectUntil(
  stream: ReadableStream<Uint8Array>,
  predicate: (txt: string) => boolean,
  durationMs = 200
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = '';
  const start = Date.now();
  while (Date.now() - start < durationMs) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value);
    if (predicate(out)) break;
  }
  return out;
}

describe.skip('createSupabaseSSEPollStream', () => {
  it('emits heartbeat pings when idle', async () => {
    const rows = [{ id: 1, payload: { foo: 'bar' } }];
    // fetchRows returns rows once, then empty for subsequent polls
    const fetchSpy = jest.fn().mockImplementation((cursor: number) => {
      if (cursor < 1) return Promise.resolve(rows);
      return Promise.resolve([]);
    });

    const stream = createSupabaseSSEPollStream({
      initialCursor: 0,
      fetchRows: fetchSpy,
      formatRow: (row: any) => ({ id: row.id, payload: row.payload }),
      pollIntervalMs: 5,
      heartbeatIntervalMs: 15,
    });

    // Wait a tick so the stream can start & fetchRows invoked
    await new Promise((r) => setTimeout(r, 20));

    const text = await collectUntil(
      stream,
      (txt) => txt.includes('event: ping'),
      500
    );

    expect(text).toMatch(/id: 1/);
    expect(text).toMatch(/event: ping/);
    expect(fetchSpy).toHaveBeenCalled();
  });
});
