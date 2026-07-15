/**
 * Agentic execution state management hook
 * 
 * Manages:
 * - Active agentic executions
 * - Execution logs and status
 * - Execution events from SSE
 * - Thinking logs for UI feedback
 */

import { useState, useCallback } from 'react';

function formatExecutionLabel(value?: string) {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) return 'agentic execution';
  if (normalized.includes('measure')) return 'read-measurement execution';
  if (normalized.includes('asset-pack') || normalized.includes('shippable') || normalized.includes('artifact')) {
    return 'AssetPack execution';
  }

  return normalized.replace('agentic-execution:', '').replace(/^pipeline:/, '') || 'agentic execution';
}

export interface RunRow {
  id: string;
  status: 'running' | 'completed' | 'error';
  started_at: string;
  completed_at?: string;
  pipelineType?: string;
  kind?: string;
}

export interface ThinkingLogEntry {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  content: string;
  timestamp: Date;
}

interface UsePipelineStateOptions {
  onPipelineStart?: (runId: string, type: string) => void;
  onPipelineComplete?: (runId: string, success: boolean) => void;
}

export function usePipelineState(options: UsePipelineStateOptions = {}) {
  const { onPipelineStart, onPipelineComplete } = options;

  // Execution run state
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<string>('');
  const [runLogDetails, setRunLogDetails] = useState<Record<string, any>>({});
  const [latestWorkUpdate, setLatestWorkUpdate] = useState<any | null>(null);
  const [iterationUpdates, setIterationUpdates] = useState<any[]>([]);
  
  // Thinking/status logs
  const [thinkingLog, setThinkingLog] = useState<ThinkingLogEntry[]>([]);
  
  // Execution state
  const [executionState, setExecutionState] = useState<any>(null);
  const [generationCount, setLlmCallCount] = useState(0);

  // Append to thinking log
  const appendThinkingLog = useCallback((entry: Omit<ThinkingLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ThinkingLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setThinkingLog(prev => [...prev, newEntry]);
  }, []);

  // Clear thinking log
  const clearThinkingLog = useCallback(() => {
    setThinkingLog([]);
  }, []);

  // Start a new execution run
  const startPipelineRun = useCallback((
    runId: string,
    pipelineType: string,
  ) => {
    const newRun: RunRow = {
      id: runId,
      status: 'running',
      started_at: new Date().toISOString(),
      pipelineType,
      kind: pipelineType,
    };

    setRuns(prev => [newRun, ...prev]);
    setActiveRunId(runId);
    setRunLog(''); // Clear previous log
    setRunLogDetails({});
    setLatestWorkUpdate(null);
    setIterationUpdates([]);

    // Add to thinking log
    appendThinkingLog({
      type: 'success',
      content: `${formatExecutionLabel(pipelineType)} started`
    });

    // Callback
    if (onPipelineStart) {
      onPipelineStart(runId, pipelineType);
    }
  }, [onPipelineStart, appendThinkingLog]);

  // Complete an execution run
  const completePipelineRun = useCallback((
    runId: string,
    success: boolean,
    summary?: string
  ) => {
    const executionLabel = formatExecutionLabel(runs.find((run) => run.id === runId)?.pipelineType);

    setRuns(prev => prev.map(run => 
      run.id === runId ? {
        ...run,
        status: success ? 'completed' : 'error',
        completed_at: new Date().toISOString()
      } : run
    ));

    // Add to thinking log
    const status = success ? 'completed successfully' : 'failed';
    appendThinkingLog({
      type: success ? 'success' : 'error',
      content: `${executionLabel} ${status}${summary ? ': ' + summary : ''}`
    });

    // Clear active run if it was this one
    if (activeRunId === runId) {
      setActiveRunId(null);
    }

    // Callback
    if (onPipelineComplete) {
      onPipelineComplete(runId, success);
    }
  }, [activeRunId, onPipelineComplete, appendThinkingLog, runs]);

  // Append to run log
  const appendRunLog = useCallback((content: string) => {
    setRunLog(prev => prev + content + '\n');
  }, []);

  // Handle execution event from SSE
  const handlePipelineEvent = useCallback((runId: string, event: any) => {
    if (activeRunId && activeRunId !== runId) return;
    if (!activeRunId) setActiveRunId(runId);

    if (event?.type === 'work-update' && event?.update) {
      setLatestWorkUpdate(event.update);
      const scope = event.scope || '';
      if (scope.includes('iteration') && scope !== 'latest-agent-step' && event.update) {
        setIterationUpdates(prev => {
          const filtered = prev.filter(item => item?.iteration !== event.update?.iteration && item?.id !== event.update?.id);
          return [...filtered, event.update];
        });
      }
      return;
    }

    const logEntry = typeof event === 'string' ? event :
      event?.collapsedStatus || event?.message || event?.summary || JSON.stringify(event);
    
    appendRunLog(logEntry);
    if (typeof event !== 'string') {
      setRunLogDetails(prev => ({
        ...prev,
        [logEntry]: event,
      }));
    }

    // Update execution state if relevant
    if (event?.status?.executionState) {
      setExecutionState(event.status.executionState);
    } else if (event?.executionState) {
      setExecutionState(event.executionState);
    } else if (event.type === 'phase') {
      setExecutionState(event);
    }

    // Update generation count
    if (event.type === 'generation') {
      setLlmCallCount(prev => prev + 1);
    }
  }, [activeRunId, appendRunLog]);

  // Get run by ID
  const getRunById = useCallback((runId: string): RunRow | undefined => {
    return runs.find(r => r.id === runId);
  }, [runs]);

  // Get active run
  const getActiveRun = useCallback((): RunRow | undefined => {
    return activeRunId ? getRunById(activeRunId) : undefined;
  }, [activeRunId, getRunById]);

  // Clear all runs
  const clearRuns = useCallback(() => {
    setRuns([]);
    setActiveRunId(null);
    setRunLog('');
    setRunLogDetails({});
    setExecutionState(null);
    setLlmCallCount(0);
    setLatestWorkUpdate(null);
    setIterationUpdates([]);
  }, []);

  // Reset execution state
  const resetExecutionState = useCallback(() => {
    setExecutionState(null);
    setLlmCallCount(0);
    setRunLogDetails({});
  }, []);

  return {
    // State
    runs,
    activeRunId,
    runLog,
    runLogDetails,
    thinkingLog,
    executionState,
    generationCount,
    latestWorkUpdate,
    iterationUpdates,
    
    // Actions
    startPipelineRun,
    completePipelineRun,
    appendRunLog,
    appendThinkingLog,
    clearThinkingLog,
    handlePipelineEvent,
    clearRuns,
    resetExecutionState,
    setActiveRunId,
    
    // Getters
    getRunById,
    getActiveRun
  };
}
