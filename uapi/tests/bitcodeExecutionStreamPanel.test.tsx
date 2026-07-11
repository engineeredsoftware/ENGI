/* eslint-disable react/no-multi-comp */

import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeExecutionStreamPanel from '@/components/bitcode/execution/BitcodeExecutionStreamPanel';

jest.mock('@/components/bitcode/execution/pipeline-execution-log-header', () => ({
  PipelineExecutionLogHeader: ({ runId, generationCount, error }: any) => (
    <div data-testid="execution-stream-header">{`${runId || 'no-run'} · ${generationCount} · ${error || 'ok'}`}</div>
  ),
}));

jest.mock('@/components/bitcode/execution/pipeline-execution-log', () => {
  const React = require('react');
  return {
    PipelineExecutionLog: React.forwardRef(({ output, compact }: any, ref: React.Ref<HTMLDivElement>) => (
      <div ref={ref} data-testid="execution-stream-log">{`${compact ? 'compact' : 'full'} · ${output}`}</div>
    )),
  };
});

jest.mock('@/components/bitcode/execution/WorkUpdatePanel', () => ({
  __esModule: true,
  default: ({ variant, update, className }: any) => (
    <div data-testid={`work-update-${variant}`} data-class-name={className || ''}>
      {`${variant}:${update?.iteration ?? 'latest'}:${update?.id ?? 'none'}`}
    </div>
  ),
}));

describe('BitcodeExecutionStreamPanel', () => {
  it('renders the shared execution stream shell and sorts iteration updates descending', () => {
    render(
      <BitcodeExecutionStreamPanel
        isProcessing={true}
        executionState={{ phase: 'Discovery' }}
        isStreamingComplete={false}
        generationCount={3}
        error={null}
        runId="run-123"
        output="[phase:running] Discovery"
        outputDetails={{}}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact={true}
        latestWorkUpdate={{ id: 'latest-update', prose: 'latest' } as any}
        iterationUpdates={[
          { id: 'iter-1', iteration: 1, prose: 'one' },
          { id: 'iter-3', iteration: 3, prose: 'three' },
          { id: 'iter-2', iteration: 2, prose: 'two' },
        ] as any[]}
        workUpdatesClassName="mt-4 space-y-4"
      />,
    );

    expect(screen.getByTestId('execution-stream-header').textContent).toContain('run-123 · 3 · ok');
    expect(screen.getByTestId('execution-stream-log').textContent).toContain('compact · [phase:running] Discovery');
    expect(screen.getByTestId('work-update-latest').textContent).toContain('latest:latest:latest-update');

    const iterationPanels = screen.getAllByTestId('work-update-iteration');
    expect(iterationPanels.map((panel) => panel.textContent)).toEqual([
      'iteration:3:iter-3',
      'iteration:2:iter-2',
      'iteration:1:iter-1',
    ]);
  });

  it('omits work updates when none are present', () => {
    render(
      <BitcodeExecutionStreamPanel
        isProcessing={false}
        executionState={{}}
        isStreamingComplete={true}
        generationCount={0}
        error="Done"
        runId="run-456"
        output="[completion]"
        outputDetails={{}}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
      />,
    );

    expect(screen.getByTestId('execution-stream-header').textContent).toContain('run-456 · 0 · Done');
    expect(screen.queryByTestId('work-update-latest')).toBeNull();
    expect(screen.queryByTestId('work-update-iteration')).toBeNull();
  });
});
