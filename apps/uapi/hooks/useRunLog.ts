"use client";

import { useEffect } from 'react';
import { wsMultiplex } from 'packages/client-utils/src/wsMultiplex';
import { useLogStore } from 'packages/client-utils/src/state/logStore';

export function useRunLog(runId: string | null) {
  const { logs, isProcessing, error, append, setProcessing, setError } = useLogStore();

  useEffect(() => {
    if (!runId) return;
    setProcessing(runId, true);
    const unsubPromise = wsMultiplex.subscribe(`/run/${runId}/log`, (payload) => {
      if (typeof payload === 'string') {
        append(runId, payload);
      } else if (payload.type === 'status') {
        setProcessing(runId, payload.processing);
      } else if (payload.type === 'error') {
        setError(runId, new Error(payload.message));
      }
    });

    return () => {
      unsubPromise.then((unsub) => unsub());
    };
  }, [runId, append, setProcessing, setError]);

  return {
    output: runId ? logs[runId] || '' : '',
    isProcessing: runId ? isProcessing[runId] || false : false,
    error: runId ? error[runId] || null : null,
  };
}
