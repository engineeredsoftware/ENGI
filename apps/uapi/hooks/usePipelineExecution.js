"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePipelineExecution = usePipelineExecution;
const react_1 = require("react");
const stream_parser_1 = require("@/streaming/stream-parser");
function usePipelineExecution(runId) {
    const [execution, setExecution] = (0, react_1.useState)(null);
    const [events, setEvents] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [latestWorkUpdate, setLatestWorkUpdate] = (0, react_1.useState)(null);
    const streamAbortRef = (0, react_1.useRef)(null);
    const recordWorkUpdate = (0, react_1.useCallback)((event) => {
        if (!event || event.type !== 'work-update' || !event.update)
            return;
        setLatestWorkUpdate(event.update);
    }, []);
    (0, react_1.useEffect)(() => {
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
                if (!response.ok)
                    throw new Error(`Failed to fetch execution: ${response.status}`);
                const data = await response.json();
                setExecution(data.run);
                const normalizedEvents = (data.events || []).map((event) => {
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
                try {
                    // eslint-disable-next-line no-console
                    console.log('[usePipelineExecution] starting stream');
                    const last = (data.events || []).slice(-1)[0];
                    const lastTs = encodeURIComponent(last?.created_at || '');
                    const controller = new AbortController();
                    streamAbortRef.current = controller;
                    const res = await fetch(`/api/executions/stream?runId=${runId}&lastTs=${lastTs}`, { signal: controller.signal });
                    const reader = res?.body?.getReader?.();
                    if (!reader)
                        return;
                    const decoder = new TextDecoder();
                    let buffer = '';
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        buffer += decoder.decode(value, { stream: true });
                        const parts = buffer.split('\n\n');
                        buffer = parts.pop() || '';
                        for (const chunk of parts) {
                            const parsed = (0, stream_parser_1.parseStreamChunk)(chunk + '\n');
                            if (parsed.type === 'work-update' && parsed.update) {
                                recordWorkUpdate(parsed);
                                setEvents(prev => prev.concat([{ id: `${Date.now()}:work-update`, event: parsed, created_at: new Date().toISOString() }]));
                                continue;
                            }
                            if (parsed.status) {
                                const ev = { type: 'status', status: parsed.status };
                                setEvents(prev => prev.concat([{ id: `${Date.now()}:status`, event: ev, created_at: new Date().toISOString() }]));
                            }
                            if (parsed.text && !parsed.status && !parsed.error && !parsed.completion) {
                                const ev = { type: 'message', message: parsed.text };
                                setEvents(prev => prev.concat([{ id: `${Date.now()}:msg`, event: ev, created_at: new Date().toISOString() }]));
                            }
                            if (parsed.error) {
                                const ev = { type: 'error', message: parsed.error };
                                setEvents(prev => prev.concat([{ id: `${Date.now()}:err`, event: ev, created_at: new Date().toISOString() }]));
                            }
                            if (parsed.type) {
                                const ev = parsed.event || parsed;
                                if (ev?.type === 'work-update') {
                                    recordWorkUpdate(ev);
                                    setEvents(prev => prev.concat([{ id: `${Date.now()}:work-update`, event: ev, created_at: new Date().toISOString() }]));
                                    continue;
                                }
                                if (ev) {
                                    setEvents(prev => prev.concat([{ id: `${Date.now()}:ev`, event: ev, created_at: new Date().toISOString() }]));
                                }
                            }
                            const lines = chunk.split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.substring(6));
                            for (const line of lines) {
                                try {
                                    const payload = JSON.parse(line);
                                    if (payload?.type === 'work-update') {
                                        recordWorkUpdate(payload);
                                    }
                                    if (payload &&
                                        (payload.type === 'pipeline' ||
                                            payload.type === 'phase' ||
                                            payload.type === 'agent' ||
                                            payload.type === 'completion' ||
                                            payload.type === 'error')) {
                                        setEvents(prev => prev.concat([{ id: `${Date.now()}:ev`, event: payload, created_at: new Date().toISOString() }]));
                                    }
                                }
                                catch { }
                            }
                        }
                    }
                }
                catch (streamErr) {
                    console.warn('[usePipelineExecution] streaming failed', streamErr);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch execution');
                setExecution(null);
                setEvents([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchExecution();
        return () => streamAbortRef.current?.abort();
    }, [recordWorkUpdate, runId]);
    const iterationUpdates = (0, react_1.useMemo)(() => {
        const map = new Map();
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
