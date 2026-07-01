import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface PipelineExecution {
  id: string;
  created_at: string;
  items: any[];
  context: any;
}

interface ExecutionEvent {
  id: string;
  event: any;
  created_at: string;
}

interface UsePipelineExecutionReturn {
  execution: PipelineExecution | null;
  events: ExecutionEvent[];
  latestWorkUpdate: any | null;
  iterationUpdates: any[];
  isLoading: boolean;
  error: string | null;
}

export function usePipelineExecution(runId: string | null): UsePipelineExecutionReturn {
  const [execution, setExecution] = useState<PipelineExecution | null>(null);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestWorkUpdate, setLatestWorkUpdate] = useState<any | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  const recordWorkUpdate = useCallback((event: any) => {
    if (!event || event.type !== 'work-update' || !event.update) return;
    setLatestWorkUpdate(event.update);
  }, []);

  useEffect(() => {
    if (!runId) {
      setExecution(null);
      setEvents([]);
      setLatestWorkUpdate(null);
      streamAbortRef.current?.abort();
      return;
    }

    const fetchExecution = async () => {
      setIsLoading(true);
      setError(null);
      setLatestWorkUpdate(null);

      try {
        const response = await fetch(`/api/executions/history/${runId}`);
        if (!response.ok) throw new Error(`Failed to fetch execution: ${response.status}`);

        const data = await response.json();
        setExecution(data.run);
        const normalizedEvents: ExecutionEvent[] = (data.events || []).map((event: any) => {
          const payload = event.event || event.event_data || {};
          if (payload?.type === 'work-update') {
            recordWorkUpdate(payload);
          }
          return {
            id: event.id,
            created_at: event.created_at,
            event: payload,
          };
        });
        setEvents(normalizedEvents);
        // The live tail below reconnects for as long as the run keeps producing
        // events (potentially many minutes) — isLoading reflects only this
        // initial history hydration, not the tail's lifetime.
        setIsLoading(false);

        try {
          const last = (data.events || []).slice(-1)[0];
          let cursorTs = last?.created_at || '';
          const controller = new AbortController();
          streamAbortRef.current = controller;
          let liveSeq = 0;
          let sawTerminal = false;
          let consecutiveEmptyReconnects = 0;

          // The stream route (`/api/executions/stream`) caps each connection at a
          // fixed tail budget (MAX_TAIL_MS, matching its serverless maxDuration)
          // and closes cleanly — with no terminal `completion`/`error` payload —
          // once that budget elapses, even if the run is still actively
          // producing events. Treating that clean close as "the run is done"
          // (the old behavior) made long-running syntheses look permanently
          // hung once they outlived one tail window: the pipeline kept working
          // for many more minutes, but the UI never received another update.
          // Reconnect with the last-seen cursor instead, and only stop once a
          // terminal payload actually arrives (or reconnecting repeatedly
          // yields nothing, which bounds runaway loops on a persistent error).
          while (!controller.signal.aborted && !sawTerminal) {
            let receivedAnyThisConnection = false;
            try {
              const res = await fetch(`/api/executions/stream?runId=${runId}&lastTs=${encodeURIComponent(cursorTs)}`, {
                signal: controller.signal,
              });
              if (!res.ok) break;
              const contentType = res.headers?.get?.('content-type') || '';
              if (!contentType.includes('text/event-stream')) break;
              const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = (res as any)?.body?.getReader?.();
              if (!reader) break;
              const decoder = new TextDecoder();
              let buffer = '';
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() || '';
                for (const chunk of parts) {
                  // The live SSE tail relays raw `event_data` — the structured onStore
                  // event with namespace/key/executionState intact (already source-safe
                  // filtered server-side). Push it verbatim, identical in shape to the
                  // history path, so the activity builder classifies live events the
                  // same way and the formal log-line contract (F19: only LLM calls +
                  // Tool uses become rows) holds during streaming, not just on reload.
                  // Re-parsing through parseStreamChunk here used to flatten events into
                  // namespace-less `status`/`message` shapes, which leaked every
                  // intermediate store as a fragment row.
                  const lines = chunk.split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.substring(6));
                  for (const line of lines) {
                    let payload: any;
                    try {
                      payload = JSON.parse(line);
                    } catch {
                      continue;
                    }
                    if (!payload || typeof payload !== 'object') continue;
                    if (payload.type === 'work-update') {
                      recordWorkUpdate(payload);
                    }
                    if (payload.type === 'completion' || payload.type === 'error') {
                      sawTerminal = true;
                    }
                    const createdAt = typeof payload.timestamp === 'string' ? payload.timestamp : new Date().toISOString();
                    cursorTs = createdAt;
                    receivedAnyThisConnection = true;
                    setEvents(prev => prev.concat([{ id: `live:${Date.now()}:${liveSeq++}`, event: payload, created_at: createdAt }]));
                  }
                }
              }
            } catch {
              if (controller.signal.aborted) break;
            }

            if (controller.signal.aborted || sawTerminal) break;

            consecutiveEmptyReconnects = receivedAnyThisConnection ? 0 : consecutiveEmptyReconnects + 1;
            if (consecutiveEmptyReconnects > 5) break;
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
        } catch {
          // Persisted execution history remains the fallback when no live stream is available.
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch execution');
        setExecution(null);
        setEvents([]);
        setIsLoading(false);
      }
    };

    fetchExecution();
    return () => streamAbortRef.current?.abort();
  }, [recordWorkUpdate, runId]);

  const iterationUpdates = useMemo(() => {
    const map = new Map<number | string, any>();
    for (const evt of events) {
      const payload = evt.event;
      if (payload?.type === 'work-update' && payload.update && typeof payload.update.iteration !== 'undefined') {
        map.set(payload.update.iteration, payload.update);
      }
    }
    return Array.from(map.values());
  }, [events]);

  return { execution, events, latestWorkUpdate, iterationUpdates, isLoading, error };
}
