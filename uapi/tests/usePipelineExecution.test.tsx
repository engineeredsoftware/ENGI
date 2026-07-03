import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { usePipelineExecution } from '@/hooks/usePipelineExecution';

function Harness({ runId, onResult }: { runId: string; onResult: (state: any) => void }) {
  const state = usePipelineExecution(runId);
  React.useEffect(() => {
    onResult(state);
  }, [state, onResult]);
  return null;
}

describe('usePipelineExecution', () => {
  const originalFetch = global.fetch;
  const encoder = new TextEncoder();

  afterEach(() => {
    global.fetch = originalFetch as any;
    jest.clearAllMocks();
  });

  it('hydrates execution, events, and work updates from history + stream', async () => {
    const historyResponse = {
      run: { id: 'r1', user_id: 'user-1', created_at: new Date().toISOString(), items: [], context: {} },
      events: [
        { id: '1', event: { type: 'pipeline', status: 'start' }, created_at: new Date().toISOString() },
        { id: '2', event: { type: 'work-update', update: { iteration: 1, confidence: 0.4 } }, created_at: new Date().toISOString() },
      ],
    };

    const streamReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: encoder.encode(
            'data: {"type":"work-update","scope":"iteration-2","update":{"iteration":2,"confidence":0.9,"prose":"Iteration 2"}}\n\n'
          ),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        return Promise.resolve({
          ok: true,
          json: async () => historyResponse,
        } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'text/event-stream; charset=utf-8' },
          body: { getReader: () => streamReader },
        } as any);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r1" onResult={(state) => (latest = state)} />);

    await waitFor(() => expect(latest?.isLoading).toBe(false));
    expect(latest.execution?.id).toBe('r1');
    expect(latest.events.length).toBeGreaterThanOrEqual(1);
    expect(latest.latestWorkUpdate).toBeTruthy();
    await waitFor(() => expect(latest.iterationUpdates.some((u: any) => u.iteration === 1)).toBe(true));
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(streamReader.read).toHaveBeenCalled();
    await waitFor(() => expect(latest.iterationUpdates.some((u: any) => u.iteration === 2)).toBe(true));
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/executions/history/r1');
  });

  it('relays raw live event_data with namespace/key intact (F19 fragment fix)', async () => {
    const historyResponse = {
      run: { id: 'r3', user_id: 'user-1', created_at: new Date().toISOString(), items: [], context: {} },
      events: [],
    };

    // A namespaced fragment store and an llm/output generation, exactly as the
    // server persists them. The live tail must push these verbatim (namespace
    // preserved) rather than flattening them through parseStreamChunk.
    const streamReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: encoder.encode(
            'data: {"type":"status","namespace":"step","key":"name","message":"try","executionState":{}}\n\n' +
              'data: {"type":"generation","namespace":"llm","key":"output","message":"[content withheld — source-safe]","executionState":{"phase":"setup","agent":"A","step":"plan","failsafe":"prepare","generation":"reason"}}\n\n',
          ),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        return Promise.resolve({ ok: true, json: async () => historyResponse } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'text/event-stream; charset=utf-8' },
          body: { getReader: () => streamReader },
        } as any);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r3" onResult={(state) => (latest = state)} />);

    await waitFor(() => expect(latest?.isLoading).toBe(false));
    await waitFor(() =>
      expect(latest.events.some((e: any) => e.event?.namespace === 'llm' && e.event?.key === 'output')).toBe(true),
    );
    const stepEvent = latest.events.find((e: any) => e.event?.namespace === 'step');
    const llmEvent = latest.events.find((e: any) => e.event?.namespace === 'llm');
    // Namespace/key survive — the activity builder can classify and suppress the
    // `step/name=try` fragment while keeping the llm/output as a formal row.
    expect(stepEvent?.event?.key).toBe('name');
    expect(llmEvent?.event?.executionState).toMatchObject({ phase: 'setup', step: 'plan', generation: 'reason' });
  });

  // ---------------------------------------------------------------------------
  // Live-tail reconnect contract (V48 Gate 3, commit df9d2d08): the stream route
  // caps each connection at a fixed budget and closes cleanly WITHOUT a terminal
  // payload; the hook must reconnect with its last-seen cursor and keep tailing
  // instead of freezing. Only a terminal completion/error payload (or a bounded
  // run of empty reconnects) ends the loop.
  // ---------------------------------------------------------------------------
  function sseResponse(chunks: string[]) {
    let index = 0;
    return {
      ok: true,
      headers: { get: () => 'text/event-stream; charset=utf-8' },
      body: {
        getReader: () => ({
          read: async () =>
            index < chunks.length
              ? { done: false, value: encoder.encode(chunks[index++]) }
              : { done: true, value: undefined },
        }),
      },
    } as any;
  }

  it('reconnects after a budget close (no terminal payload) and resumes rows without duplicating them', async () => {
    const historyResponse = {
      run: { id: 'r4', user_id: 'user-1', created_at: '2026-07-01T00:00:00.000Z', items: [], context: {} },
      events: [],
    };
    const streamUrls: string[] = [];

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        return Promise.resolve({ ok: true, json: async () => historyResponse } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        streamUrls.push(url);
        if (streamUrls.length === 1) {
          // First tail window: one LLM row, then the server's clean budget close
          // (reader done, no completion/error payload). The frame carries the
          // row's INSERT-time created_at as the SSE `id:` line — deliberately
          // later than the payload's emit-time `timestamp`, exactly the drift
          // that used to duplicate rows on reconnect.
          return Promise.resolve(
            sseResponse([
              'id: 2026-07-01T00:00:01.500Z\ndata: {"type":"generation","namespace":"llm","key":"output","message":"call one","timestamp":"2026-07-01T00:00:01.000Z"}\n\n',
            ]),
          );
        }
        // Reconnected window: the server resumes strictly after the cursor —
        // a new row plus the terminal completion.
        return Promise.resolve(
          sseResponse([
            'id: 2026-07-01T00:00:02.500Z\ndata: {"type":"generation","namespace":"llm","key":"output","message":"call two","timestamp":"2026-07-01T00:00:02.000Z"}\n\n' +
              'id: 2026-07-01T00:00:03.500Z\ndata: {"type":"completion","timestamp":"2026-07-01T00:00:03.000Z"}\n\n',
          ]),
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r4" onResult={(state) => (latest = state)} />);

    // The clean close is NOT treated as terminal: a second connection opens,
    // carrying a non-empty lastTs cursor from the already-seen tail.
    await waitFor(() => expect(streamUrls.length).toBe(2));
    const secondUrl = new URL(streamUrls[1], 'http://localhost');
    expect(secondUrl.searchParams.get('runId')).toBe('r4');
    // The reconnect cursor is the server row's INSERT-time created_at (the SSE
    // `id:` line the stream route filters on), NOT the payload's emit-time
    // timestamp — emit-time drift against the `created_at > lastTs` filter is
    // what produced duplicated/skipped rows across reconnects.
    expect(secondUrl.searchParams.get('lastTs')).toBe('2026-07-01T00:00:01.500Z');

    await waitFor(() =>
      expect(latest.events.some((e: any) => e.event?.type === 'completion')).toBe(true),
    );
    // Rows resumed across the reconnect without duplication.
    expect(latest.events.filter((e: any) => e.event?.message === 'call one')).toHaveLength(1);
    expect(latest.events.filter((e: any) => e.event?.message === 'call two')).toHaveLength(1);
    // Every live event id is unique (no key collisions in the accordion).
    const ids = latest.events.map((e: any) => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    // The terminal completion ends the loop: no further reconnects.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(streamUrls.length).toBe(2);
  });

  it('stops tailing immediately once a terminal error payload arrives', async () => {
    const historyResponse = {
      run: { id: 'r5', user_id: 'user-1', created_at: '2026-07-01T00:00:00.000Z', items: [], context: {} },
      events: [],
    };
    const streamUrls: string[] = [];

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        return Promise.resolve({ ok: true, json: async () => historyResponse } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        streamUrls.push(url);
        return Promise.resolve(
          sseResponse([
            'data: {"type":"error","message":"synthesis failed","timestamp":"2026-07-01T00:00:01.000Z"}\n\n',
          ]),
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r5" onResult={(state) => (latest = state)} />);

    await waitFor(() =>
      expect(latest?.events.some((e: any) => e.event?.type === 'error')).toBe(true),
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(streamUrls.length).toBe(1);
  });

  it('bounds the reconnect loop after repeated empty tail windows', async () => {
    const historyResponse = {
      run: { id: 'r6', user_id: 'user-1', created_at: '2026-07-01T00:00:00.000Z', items: [], context: {} },
      events: [],
    };
    const streamUrls: string[] = [];

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        return Promise.resolve({ ok: true, json: async () => historyResponse } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        streamUrls.push(url);
        // Every window closes empty: no payloads at all.
        return Promise.resolve(sseResponse([]));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r6" onResult={(state) => (latest = state)} />);

    // 6 consecutive empty connections exhaust the bound (> 5 empties breaks).
    await waitFor(() => expect(streamUrls.length).toBe(6), { timeout: 5000 });
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(streamUrls.length).toBe(6);
    // The dead tail is not an error condition — history remains the fallback.
    expect(latest.error).toBeNull();
    expect(latest.events).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Dispatch->history 404 race: dispatch returns the runId before the
  // executions row lands, so the first history fetch can 404. The hook retries
  // that status (bounded) instead of throwing — a thrown 404 also skipped the
  // live tail entirely.
  // ---------------------------------------------------------------------------
  it('retries the initial history 404 (dispatch race) and still opens the live tail', async () => {
    const historyResponse = {
      run: { id: 'r7', user_id: 'user-1', created_at: '2026-07-01T00:00:00.000Z', items: [], context: {} },
      events: [],
    };
    let historyCalls = 0;
    const streamUrls: string[] = [];

    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        historyCalls += 1;
        if (historyCalls <= 2) {
          return Promise.resolve({ ok: false, status: 404 } as any);
        }
        return Promise.resolve({ ok: true, json: async () => historyResponse } as any);
      }
      if (url.startsWith('/api/executions/stream')) {
        streamUrls.push(url);
        return Promise.resolve(
          sseResponse(['id: 2026-07-01T00:00:01.000Z\ndata: {"type":"completion"}\n\n']),
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r7" onResult={(state) => (latest = state)} />);

    await waitFor(() => expect(latest?.execution?.id).toBe('r7'), { timeout: 5000 });
    expect(historyCalls).toBe(3);
    expect(latest.error).toBeNull();
    // The tail opened after the retried hydration succeeded.
    await waitFor(() => expect(streamUrls.length).toBe(1), { timeout: 5000 });
    await waitFor(() => expect(latest.events.some((e: any) => e.event?.type === 'completion')).toBe(true));
  });

  it('surfaces an error once the bounded 404 retries are exhausted', async () => {
    let historyCalls = 0;
    global.fetch = jest.fn((request: RequestInfo) => {
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? '';
      if (url.startsWith('/api/executions/history/')) {
        historyCalls += 1;
        return Promise.resolve({ ok: false, status: 404 } as any);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as any;

    let latest: any;
    render(<Harness runId="r8" onResult={(state) => (latest = state)} />);

    await waitFor(() => expect(latest?.error).toContain('404'), { timeout: 8000 });
    // Initial attempt + HISTORY_RETRY_LIMIT retries, then it stops for good.
    expect(historyCalls).toBe(6);
    expect(latest.execution).toBeNull();
    expect(latest.isLoading).toBe(false);
  }, 10000);

  it('handles history fetch failure gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    let latest: any;
    render(<Harness runId="r2" onResult={(state) => (latest = state)} />);

    await waitFor(() => expect(latest?.isLoading).toBe(false));

    expect(latest.error).toContain('Failed to fetch execution');
    expect(latest.execution).toBeNull();
    expect(latest.events).toEqual([]);
    expect(latest.latestWorkUpdate).toBeNull();
    expect(latest.iterationUpdates).toEqual([]);
  });
});
