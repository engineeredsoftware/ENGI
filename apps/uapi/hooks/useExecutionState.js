"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExecutionState = void 0;
const react_1 = require("react");
const stream_parser_1 = require("@/streaming/stream-parser");
const api_client_1 = require("../networking/api-client");
const DEFAULT_ASSET_PACK_EXECUTION_TYPE = 'agentic-execution:asset-pack';
// Initial default state for execution processing
const initialExecutionState = {
    definitionOfRead: '',
    isProcessing: false,
    output: '',
    generationCount: 0,
    outputDetails: {},
    executionProgress: {},
    currentGuide: null,
    runId: null,
    isStreamingComplete: false,
    error: null,
    completion: null,
    latestWorkUpdate: null,
    latestIterationUpdate: null,
    iterationUpdates: [],
};
// SSE reconnection constants
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY = 1000; // 1 second
const RECONNECT_MAX_DELAY = 30000; // 30 seconds
const useExecutionState = () => {
    const [state, setState] = (0, react_1.useState)(initialExecutionState);
    const reconnectAttemptsRef = (0, react_1.useRef)(0);
    const isDebug = () => {
        try {
            // eslint-disable-next-line no-undef
            const envFlag = process.env.NEXT_PUBLIC_DEBUG_ASSET_PACK === '1';
            const lsFlag = typeof window !== 'undefined' && window.localStorage?.getItem('DEBUG_ASSET_PACK') === '1';
            // eslint-disable-next-line no-undef
            const devDefault = process.env.NODE_ENV !== 'production';
            return envFlag || lsFlag || devDefault;
        }
        catch {
            return false;
        }
    };
    const dlog = (...args) => { if (isDebug()) {
        try {
            console.debug('[AssetPackPipeline][stream]', ...args);
        }
        catch { }
    } };
    const setDefinitionOfNeed = (definitionOfRead) => {
        setState(prev => ({ ...prev, definitionOfRead }));
    };
    /**
     * Triggers the Bitcode asset-pack pipeline and returns final completion data (or null on error).
     * `definitionOfRead` is bounded to the input key while downstream receipts mirror Bitcode Read and AssetPack semantics.
     */
    const submitAssetPackPipeline = (0, react_1.useCallback)(async (connectionId, repoOwner, repoName, repoBranch, commitSha, issueNumber, userHasScrolled, logContainerRef, userTimezone, modelProvider, modelId, 
    /** Optional attachments provided by the user */
    attachments = [], 
    /** Number of iterations */
    iterationCount = 3, 
    /** Optional file uploads */
    files, options) => {
        setState(prev => ({
            ...prev,
            isProcessing: true,
            output: '',
            executionProgress: {},
            isStreamingComplete: false,
            error: null,
            runId: null,
            latestWorkUpdate: null,
            latestIterationUpdate: null,
            iterationUpdates: [],
        }));
        let hasError = false;
        let finalCompletion = null;
        try {
            dlog('Submitting Bitcode asset-pack pipeline', { connectionId, repoOwner, repoName, repoBranch, commitSha, issueNumber, modelProvider, modelId, attachmentsCount: attachments?.length || 0, iterationCount });
            const pipelineType = options?.pipelineType || DEFAULT_ASSET_PACK_EXECUTION_TYPE;
            const stream = await (0, api_client_1.callAssetPackExecutionsAPI)(connectionId, repoOwner, repoName, repoBranch, commitSha, issueNumber, state.definitionOfRead, userTimezone, modelProvider, modelId, attachments, iterationCount, files, pipelineType);
            if (!stream) {
                dlog('No stream returned from API');
                throw new Error('No stream returned from API');
            }
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            const processStream = async () => {
                try {
                    let streamDone = false;
                    while (!streamDone) {
                        const { done, value } = await reader.read();
                        if (done) {
                            dlog('Stream done signal received');
                            streamDone = true;
                            continue;
                        }
                        const chunk = decoder.decode(value, { stream: true });
                        buffer += chunk;
                        // Process complete messages from buffer
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep incomplete line in buffer
                        for (const line of lines) {
                            if (!line.trim())
                                continue;
                            const parsedChunk = (0, stream_parser_1.parseStreamChunk)(line);
                            dlog('Chunk parsed', { type: parsedChunk.type, hasStatus: Boolean(parsedChunk.status), hasError: Boolean(parsedChunk.error), textLen: (parsedChunk.text || '').length });
                            if (parsedChunk.type === 'generation') {
                                setState(prev => ({ ...prev, generationCount: prev.generationCount + 1 }));
                            }
                            else if (parsedChunk.type === 'work-update' && parsedChunk.update) {
                                const scope = parsedChunk.scope || '';
                                setState(prev => {
                                    const update = parsedChunk.update;
                                    const isIterationScope = scope.startsWith('iteration-') || scope === 'iteration' || scope === 'latest-iteration';
                                    const iterationUpdates = isIterationScope
                                        ? [...prev.iterationUpdates.filter((item) => item?.iteration !== update?.iteration && item?.id !== update?.id), update]
                                        : prev.iterationUpdates;
                                    return {
                                        ...prev,
                                        latestWorkUpdate: update,
                                        latestIterationUpdate: isIterationScope ? update : prev.latestIterationUpdate,
                                        iterationUpdates,
                                    };
                                });
                                continue;
                            }
                            else if (parsedChunk.error) {
                                hasError = true;
                                dlog('Error in stream', parsedChunk.error);
                                setState(prev => ({ ...prev, error: parsedChunk.error }));
                                throw new Error(parsedChunk.error); // Throw to trigger reconnection
                            }
                            if (parsedChunk.status) {
                                // Capture runId from parsed chunk
                                const nextRunId = parsedChunk.runId;
                                if (typeof nextRunId === 'string' && nextRunId) {
                                    dlog('RunId detected', nextRunId);
                                    setState(prev => ({ ...prev, runId: nextRunId }));
                                }
                                if (typeof parsedChunk.guide === 'string') {
                                    setState(prev => ({ ...prev, currentGuide: parsedChunk.guide || prev.currentGuide }));
                                }
                                setState(prev => {
                                    // Store the message directly without embedding execution progress
                                    const message = parsedChunk.status?.message || '';
                                    const timestamp = Date.now();
                                    const uniqueKey = `${message}_${timestamp}`;
                                    return {
                                        ...prev,
                                        executionProgress: parsedChunk.status?.executionState || prev.executionProgress,
                                        output: message ? prev.output + message + '\n' : prev.output,
                                        outputDetails: message ? {
                                            ...prev.outputDetails,
                                            [uniqueKey]: {
                                                ...parsedChunk,
                                                timestamp,
                                                status: {
                                                    ...parsedChunk.status,
                                                    logLine: message
                                                }
                                            }
                                        } : prev.outputDetails
                                    };
                                });
                            }
                            else if (parsedChunk.text) {
                                const lines = parsedChunk.text.split('\n').filter(line => line.trim());
                                lines.forEach(line => {
                                    const chunkKey = line.trim();
                                    setState(prev => ({
                                        ...prev,
                                        output: prev.output + line + '\n',
                                        outputDetails: {
                                            ...prev.outputDetails,
                                            [chunkKey]: parsedChunk
                                        }
                                    }));
                                    if (logContainerRef.current && !userHasScrolled) {
                                        setTimeout(() => {
                                            if (logContainerRef.current) {
                                                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                                            }
                                        }, 0);
                                    }
                                });
                            }
                        }
                    }
                }
                catch (streamError) {
                    // Handle stream interruption
                    dlog('Stream error occurred', streamError);
                    // Check if we should attempt reconnection
                    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && !hasError) {
                        const backoffDelay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current), RECONNECT_MAX_DELAY);
                        dlog(`Attempting reconnection ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS} after ${backoffDelay}ms`);
                        setState(prev => ({
                            ...prev,
                            output: prev.output + `⚠️ Connection interrupted. Reconnecting in ${backoffDelay / 1000}s...\n`
                        }));
                        reconnectAttemptsRef.current += 1;
                        await new Promise(resolve => setTimeout(resolve, backoffDelay));
                        // TODO: Implement actual SSE reconnection with last event ID
                        // For now, just mark as error to prevent infinite loops
                        throw new Error('SSE reconnection not yet implemented - connection lost');
                    }
                    else {
                        throw streamError;
                    }
                }
            };
            await processStream();
            dlog('Stream processing completed');
            reconnectAttemptsRef.current = 0; // Reset reconnection attempts on success
        }
        catch (error) {
            hasError = true;
            dlog('submitAssetPackPipeline caught error', error?.message || error);
            setState(prev => ({
                ...prev,
                error: error.message || 'An unexpected error occurred'
            }));
        }
        dlog('submitAssetPackPipeline finally');
        setState(prev => ({
            ...prev,
            isProcessing: false,
            isStreamingComplete: !hasError
        }));
        return finalCompletion;
    }, [state.definitionOfRead]);
    /**
     * Append a user instruction to the pipeline log immediately
     */
    const appendInstructionToLog = (0, react_1.useCallback)((inst) => {
        setState(prev => {
            const prefix = `📝 Instruction: ${inst.content}`;
            return {
                ...prev,
                output: prev.output + prefix + '\n',
                outputDetails: {
                    ...prev.outputDetails,
                    [prefix]: inst
                }
            };
        });
    }, []);
    // Reset to initial state for a new execution
    const resetState = (0, react_1.useCallback)(() => {
        setState(initialExecutionState);
    }, []);
    return {
        ...state,
        setDefinitionOfNeed,
        submitAssetPackPipeline,
        appendInstructionToLog,
        resetState
    };
};
exports.useExecutionState = useExecutionState;
