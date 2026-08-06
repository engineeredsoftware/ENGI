"use client";

import React from 'react';
import clsx from 'clsx';
import type {
  AgentStepWorkUpdate,
  ExecutionPipelineSDIVFUpdate,
  ToolUsageUpdate,
  FileChange,
} from '@bitcode/execution-generics';

type WorkUpdateVariant = 'latest' | 'iteration';

export interface WorkUpdatePanelProps {
  variant: WorkUpdateVariant;
  update: AgentStepWorkUpdate | ExecutionPipelineSDIVFUpdate | null;
  className?: string;
}

function formatFileChange(change: FileChange): string {
  const action = change.action === 'modified'
    ? 'Modified'
    : change.action === 'created'
      ? 'Created'
      : 'Deleted';
  const delta = [
    change.linesAdded ? `+${change.linesAdded}` : null,
    change.linesRemoved ? `-${change.linesRemoved}` : null,
  ].filter(Boolean).join(' ');
  return `${action} ${change.path}${delta ? ` (${delta})` : ''}`;
}

function renderTools(tools: ToolUsageUpdate[]): React.ReactNode {
  if (!tools.length) return <span className="text-gray-400">No tools used</span>;
  return (
    <ul className="space-y-1 text-sm text-gray-200">
      {tools.map((tool) => (
        <li key={`${tool.name}-${tool.metadata?.id ?? ''}`} className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-5 px-2 bg-purple-900/30 text-purple-200 text-xs font-medium">
            {tool.name}
          </span>
          <span className="text-gray-300">
            {tool.description ? tool.description : tool.successful === false ? 'Failed' : 'Executed'}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WorkUpdatePanel({ variant, update, className }: WorkUpdatePanelProps) {
  if (!update) return null;

  const isIteration = variant === 'iteration';
  const iterationUpdate = isIteration ? update as ExecutionPipelineSDIVFUpdate : null;
  const title = isIteration
    ? `Iteration ${iterationUpdate?.iteration ?? ''} Self Instruction`
    : 'Latest Work Update';

  const prose = isIteration
    ? iterationUpdate?.selfInstruction || iterationUpdate?.prose || ''
    : update.prose || '';

  return (
    <section
      data-testid="work-update-panel"
      className={clsx(
        ' border border-emerald-500/20 bg-black/40 px-4 py-4 shadow-sm backdrop-blur-sm',
        isIteration ? 'border-indigo-500/20' : 'border-emerald-500/20',
        className
      )}
    >
      <header className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'inline-flex h-2 w-2',
            isIteration ? 'bg-indigo-300' : 'bg-emerald-300'
          )} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200">
            {title}
          </h3>
        </div>
        {isIteration && typeof iterationUpdate?.confidence === 'number' ? (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>Confidence</span>
            <span className="inline-flex min-w-[3rem] justify-end font-semibold text-indigo-200">
              {(iterationUpdate.confidence * 100).toFixed(0)}%
            </span>
          </div>
        ) : null}
      </header>

      {prose ? (
        <p className="text-sm text-gray-100 leading-relaxed mb-4 whitespace-pre-wrap">
          {prose}
        </p>
      ) : null}

      {isIteration && iterationUpdate?.suggestions?.length ? (
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase text-indigo-300 tracking-wide mb-2">
            Suggested Guidance
          </h4>
          <ul className="space-y-1 text-sm text-gray-200">
            {iterationUpdate.suggestions.map((suggestion, idx) => (
              <li key={`${iterationUpdate.id}-suggestion-${idx}`}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            File Changes
          </h4>
          {update.files?.length ? (
            <ul className="space-y-1 text-sm text-gray-200">
              {update.files.slice(0, 6).map((change) => (
                <li key={`${update.id}-${change.path}-${change.action}`}>
                  {formatFileChange(change)}
                </li>
              ))}
              {update.files.length > 6 ? (
                <li className="text-xs text-gray-400">
                  +{update.files.length - 6} more
                </li>
              ) : null}
            </ul>
          ) : (
            <span className="text-gray-400 text-sm">No file changes recorded</span>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Tools Used
          </h4>
          {renderTools(update.tools || [])}
        </div>
      </div>
    </section>
  );
}

export default WorkUpdatePanel;
