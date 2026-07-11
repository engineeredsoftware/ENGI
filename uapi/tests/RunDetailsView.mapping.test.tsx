import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExecutionDetailsView } from '@/components/bitcode/pipeline/ExecutionDetailsView/ExecutionDetailsView';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/usePipelineExecution', () => ({
  usePipelineExecution: () => ({
    execution: { id: 'run-1', created_at: new Date().toISOString(), items: [], context: {} },
    isLoading: false,
    error: null,
    latestWorkUpdate: null,
    iterationUpdates: [],
    events: [
      { id: '1', created_at: new Date().toISOString(), event: { type: 'pipeline', status: 'start', timestamp: Date.now() }},
      { id: '2', created_at: new Date().toISOString(), event: { type: 'phase', phase: 'setup', status: 'start', timestamp: Date.now() }},
      { id: '3', created_at: new Date().toISOString(), event: { type: 'agent', agent: 'vcs:clone', status: 'start', timestamp: Date.now() }},
      { id: '4', created_at: new Date().toISOString(), event: { type: 'agent', agent: 'vcs:clone', status: 'end', timestamp: Date.now() }},
      { id: '5', created_at: new Date().toISOString(), event: { type: 'phase', phase: 'setup', status: 'end', timestamp: Date.now() }},
      { id: '6', created_at: new Date().toISOString(), event: { type: 'completion', timestamp: Date.now() }},
    ],
  })
}));

// Mock PipelineExecutionLog to surface the "output" prop
jest.mock('@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog', () => ({
  PipelineExecutionLog: ({ output }: any) => <pre data-testid="log-output">{output}</pre>
}));

jest.mock('@/components/bitcode/pipeline/PipelineExecutionLogHeader/PipelineExecutionLogHeader', () => ({
  PipelineExecutionLogHeader: () => <div data-testid="log-header" />
}));

describe('RunDetailsView event mapping', () => {
  it('maps structured events to readable log lines', () => {
    render(<ExecutionDetailsView runId="run-1" />);
    const output = screen.getByTestId('log-output').textContent || '';
    expect(output).toContain('[pipeline:start]');
    expect(output).toContain('[phase:start] setup');
    expect(output).toContain('[agent:start] vcs:clone');
    expect(output).toContain('[agent:end] vcs:clone');
    expect(output).toContain('[phase:end] setup');
    expect(output).toContain('[completion]');
  });
});
