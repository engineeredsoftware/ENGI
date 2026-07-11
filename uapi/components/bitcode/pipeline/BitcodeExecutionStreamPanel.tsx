'use client';

import React, { forwardRef, useMemo } from 'react';

import { cn } from '@bitcode/styling';

import { PipelineExecutionLog } from './pipeline-execution-log';
import { PipelineExecutionLogHeader } from './pipeline-execution-log-header';
import WorkUpdatePanel, { type WorkUpdatePanelProps } from './WorkUpdatePanel';

type BitcodeExecutionWorkUpdate = NonNullable<WorkUpdatePanelProps['update']>;

interface BitcodeExecutionStreamPanelProps {
  isProcessing: boolean;
  executionState: Record<string, any>;
  isStreamingComplete: boolean;
  generationCount: number;
  error: string | Error | null;
  runId?: string;
  metadataRows?: Array<{ label: string; value: string }>;
  output: string;
  outputDetails?: Record<string, any>;
  onRetry: () => void;
  onDismissError: () => void;
  userHasScrolled: boolean;
  setUserHasScrolled: (value: boolean) => void;
  compact?: boolean;
  latestWorkUpdate?: BitcodeExecutionWorkUpdate | null;
  iterationUpdates?: BitcodeExecutionWorkUpdate[];
  onOpenDetails?: (runId: string) => void;
  onNavigateToExecution?: (runId: string) => void;
  onClose?: () => void;
  className?: string;
  workUpdatesClassName?: string;
  latestWorkUpdateClassName?: string;
  iterationWorkUpdateClassName?: string;
}

function normalizeErrorMessage(error: string | Error | null) {
  if (!error) return null;
  return typeof error === 'string' ? error : error.message || String(error);
}

const BitcodeExecutionStreamPanel = forwardRef<HTMLDivElement, BitcodeExecutionStreamPanelProps>(
  function BitcodeExecutionStreamPanel(
    {
      isProcessing,
      executionState,
      isStreamingComplete,
      generationCount,
      error,
      runId,
      metadataRows = [],
      output,
      outputDetails = {},
      onRetry,
      onDismissError,
      userHasScrolled,
      setUserHasScrolled,
      compact = false,
      latestWorkUpdate = null,
      iterationUpdates = [],
      onOpenDetails,
      onNavigateToExecution,
      onClose,
      className,
      workUpdatesClassName,
      latestWorkUpdateClassName,
      iterationWorkUpdateClassName,
    },
    ref,
  ) {
    const errorMessage = normalizeErrorMessage(error);
    const orderedIterationUpdates = useMemo(
      () => [...iterationUpdates].sort((a, b) => Number(b?.iteration ?? 0) - Number(a?.iteration ?? 0)),
      [iterationUpdates],
    );

    return (
      <div className={cn(className)}>
        <PipelineExecutionLogHeader
          isProcessing={isProcessing}
          executionState={executionState || {}}
          isStreamingComplete={isStreamingComplete}
          generationCount={generationCount}
          error={errorMessage}
          runId={runId}
          metadataRows={metadataRows}
          onOpenDetails={onOpenDetails}
          onNavigateToExecution={onNavigateToExecution}
          onClose={onClose}
        />

        <PipelineExecutionLog
          ref={ref}
          output={output}
          isProcessing={isProcessing}
          error={errorMessage}
          outputDetails={outputDetails}
          onRetry={onRetry}
          onDismissError={onDismissError}
          userHasScrolled={userHasScrolled}
          setUserHasScrolled={setUserHasScrolled}
          compact={compact}
        />

        {(latestWorkUpdate || orderedIterationUpdates.length > 0) && (
          <div className={cn('space-y-4', workUpdatesClassName)}>
            {latestWorkUpdate ? (
              <WorkUpdatePanel
                variant="latest"
                update={latestWorkUpdate}
                className={latestWorkUpdateClassName}
              />
            ) : null}

            {orderedIterationUpdates.map((iterationUpdate) => (
              <WorkUpdatePanel
                key={iterationUpdate?.id || `iteration-${iterationUpdate?.iteration}`}
                variant="iteration"
                update={iterationUpdate}
                className={iterationWorkUpdateClassName}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

export default BitcodeExecutionStreamPanel;
