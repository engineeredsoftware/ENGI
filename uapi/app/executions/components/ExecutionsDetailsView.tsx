"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { usePipelineExecution } from '@/hooks/usePipelineExecution';
import BitcodeExecutionStreamPanel from '@/components/bitcode/execution/BitcodeExecutionStreamPanel';
import {
  getHeaderShippables,
  getHeaderWrittenAssets,
  mergeHeaderShippables,
} from '@/app/executions/components/ExecutionsCompleteHeaderContent';

interface ExecutionDetailsViewProps {
  runId?: string;
  executionId?: string;
}

export function ExecutionDetailsView({ runId, executionId }: ExecutionDetailsViewProps) {
  const router = useRouter();
  const id = executionId || runId || null;
  const { execution: run, events, isLoading, error, latestWorkUpdate, iterationUpdates } = usePipelineExecution(id);

  const panelClass = 'bg-gray-800/50 rounded-lg p-4';
  const loadingPanelClass = 'bg-gray-800/50 rounded-lg p-8';
  const headerBarClass = 'bg-gray-900/50 p-4';

  if (isLoading) {
    return (
      <div className={loadingPanelClass}>
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-400">Loading execution details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
        <p className="text-red-400">Error loading execution: {error}</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className={panelClass}>
        <p className="text-gray-400">Execution not found</p>
      </div>
    );
  }

  const runOutput = (run as any).output || (run as any).output_data || {};
  const assetPackCompletion = runOutput?.asset_pack_completion || (run as any).asset_pack_completion || null;
  const writtenAssets = getHeaderWrittenAssets(assetPackCompletion);
  const shippables = getHeaderShippables(assetPackCompletion);
  const deliveryMechanism = shippables;
  const mergedAssetPackSurface = mergeHeaderShippables(writtenAssets, shippables);
  const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

  // Extract execution state and output from events
  const statusEvents = events.filter(e => e.event?.type === 'status');
  const completionEvent = events.find(e => e.event?.type === 'completion');
  const errorEvents = events.filter(e => e.event?.type === 'error');

  // Build output lines from structured events for PipelineExecutionLog
  const lines: Array<{ text: string; key: string; ev: any }> = [];
  const workUpdates: any[] = [];
  for (const e of events) {
    const ev = e.event || {};
    if (ev?.type === 'work-update') {
      workUpdates.push(ev);
      continue;
    }
    if (ev?.status?.message) {
      const text = String(ev.status.message);
      lines.push({ text, key: `status:${text}`, ev });
      continue;
    }
    if (ev?.message) {
      const text = String(ev.message);
      lines.push({ text, key: `msg:${text}`, ev });
      continue;
    }
    if (ev?.type === 'pipeline') {
      const text = `[pipeline:${ev.status}]`;
      lines.push({ text, key: `pipeline:${ev.status}:${ev.timestamp || ''}`, ev });
      continue;
    }
    if (ev?.type === 'phase') {
      const text = `[phase:${ev.status}] ${ev.phase}`;
      lines.push({ text, key: `phase:${ev.phase}:${ev.status}:${ev.timestamp || ''}`, ev });
      continue;
    }
    if (ev?.type === 'agent') {
      const text = `[agent:${ev.status}] ${ev.agent}`;
      lines.push({ text, key: `agent:${ev.agent}:${ev.status}:${ev.timestamp || ''}`, ev });
      continue;
    }
    if (ev?.type === 'error') {
      const text = `[error] ${ev.error || 'Unknown error'}`;
      lines.push({ text, key: `error:${ev.error || ''}:${ev.timestamp || ''}`, ev });
      continue;
    }
    if (ev?.type === 'completion') {
      const text = `[completion]`;
      lines.push({ text, key: `completion:${ev.timestamp || ''}`, ev });
      continue;
    }
  }
  const output = lines.map(l => l.text).join('\n');
  const processLogOutputDetails = Object.fromEntries(lines.map(l => [l.text, l.ev]));

  const derivedLatestWorkUpdate = latestWorkUpdate ?? (workUpdates.length ? workUpdates[workUpdates.length - 1]?.update ?? null : null);
  const iterationUpdateList = iterationUpdates.length
    ? iterationUpdates
    : workUpdates
        .map((ev) => ev.update)
        .filter((update) => update && typeof update.iteration === 'number');

  // Get latest execution state
  const latestStatusEvent = statusEvents[statusEvents.length - 1];
  const executionState = latestStatusEvent?.event?.status?.executionState || {};

  // Determine if complete
  const isComplete = !!completionEvent;
  const hasError = errorEvents.length > 0;
  const generationCount = events.filter(e => e.event?.type === 'generation').length;

  return (
    <div className="space-y-6">
      {/* AssetPack completion summary (Markdown + TL;DR chips) */}
      {assetPackCompletion && (
        <div className={panelClass}>
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          {(writtenAssets?.summary || mergedAssetPackSurface?.summary) && (
            <div className="prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 text-sm">
              <ReactMarkdown>{String(writtenAssets?.summary || mergedAssetPackSurface?.summary)}</ReactMarkdown>
            </div>
          )}
          {/* TL;DR chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {deliveryMechanism?.pullRequest && (
              <a
                href={deliveryMechanism.pullRequest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs"
              >PR: {deliveryMechanism.pullRequest.title || 'Open'}</a>
            )}
          </div>
          {/* Processing Stats */}
          {assetPackCompletion.processingStats && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div>
                <span className="text-gray-500">Time: </span>
                <span className="text-gray-300">{assetPackCompletion.processingStats.time}</span>
              </div>
              {assetPackCompletion.processingStats.tokens && (
                <div>
                  <span className="text-gray-500">Tokens: </span>
                  <span className="text-gray-300">{assetPackCompletion.processingStats.tokens.total} (in {assetPackCompletion.processingStats.tokens.input} / out {assetPackCompletion.processingStats.tokens.output})</span>
                </div>
              )}
              {typeof assetPackCompletion.processingStats.measuredBtd === 'number' && (
                <div>
                  <span className="text-gray-500">Measured $BTD: </span>
                  <span className="text-gray-300">{assetPackCompletion.processingStats.measuredBtd}</span>
                </div>
              )}
              {assetPackCompletion.repoSnapshot && (
                <div>
                  <span className="text-gray-500">Repo: </span>
                  <span className="text-gray-300">{`${assetPackCompletion.repoSnapshot.org}/${assetPackCompletion.repoSnapshot.repo} (${assetPackCompletion.repoSnapshot.branch}@${(assetPackCompletion.repoSnapshot.commit || '').slice(0,7)})`}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Execution Metadata */}
      <div className={panelClass}>
        <h2 className="text-lg font-semibold mb-3">Execution Information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Execution ID</dt>
            <dd className="text-gray-300 font-mono">{run.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="text-gray-300">{new Date(run.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className={`font-medium ${completionEvent ? 'text-emerald-400' : errorEvents.length ? 'text-red-400' : 'text-yellow-400'}`}>
              {completionEvent ? 'Completed' : errorEvents.length ? 'Failed' : 'In Progress'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Events</dt>
            <dd className="text-gray-300">{events.length}</dd>
          </div>
        </dl>
      </div>

      {/* Execution Log */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className={headerBarClass}>
          <h2 className="text-lg font-semibold">Execution Log</h2>
        </div>
        <div className="relative">
          <BitcodeExecutionStreamPanel
            isProcessing={!completionEvent && !errorEvents.length}
            executionState={executionState || {}}
            isStreamingComplete={!!completionEvent}
            generationCount={events.filter(e => e.event?.type === 'generation').length}
            error={errorEvents.length ? errorEvents[0]?.event?.message : null}
            runId={run.id}
            output={output}
            outputDetails={processLogOutputDetails}
            onRetry={() => {}}
            onDismissError={() => {}}
            userHasScrolled={false}
            setUserHasScrolled={() => {}}
            compact={true}
            latestWorkUpdate={derivedLatestWorkUpdate}
            iterationUpdates={iterationUpdateList as any[]}
            onNavigateToExecution={(target) => router.push(`/executions?runId=${target}`)}
            workUpdatesClassName="px-4 pb-4 space-y-4 border-t border-gray-700/60 bg-gray-900/40"
          />
        </div>
      </div>
    </div>
  );
}

// Optional alias for exact naming symmetry
export const PipelineExecutionDetailsView = ExecutionDetailsView;
export const ExecutionsDetailsView = ExecutionDetailsView;
