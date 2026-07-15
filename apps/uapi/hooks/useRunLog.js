"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRunLog = useRunLog;
const react_1 = require("react");
const wsMultiplex_1 = require("packages/client-utils/src/wsMultiplex");
const logStore_1 = require("packages/client-utils/src/state/logStore");
function useRunLog(runId) {
    const { logs, isProcessing, error, append, setProcessing, setError } = (0, logStore_1.useLogStore)();
    (0, react_1.useEffect)(() => {
        if (!runId)
            return;
        setProcessing(runId, true);
        const unsubPromise = wsMultiplex_1.wsMultiplex.subscribe(`/run/${runId}/log`, (payload) => {
            if (typeof payload === 'string') {
                append(runId, payload);
            }
            else if (payload.type === 'status') {
                setProcessing(runId, payload.processing);
            }
            else if (payload.type === 'error') {
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
