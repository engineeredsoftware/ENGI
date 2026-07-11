import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExecutionDetailsView } from '@/app/executions/components/ExecutionDetailsView';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/usePipelineExecution', () => ({
  usePipelineExecution: jest.fn(),
}));

jest.mock('@/components/bitcode/execution/pipeline-execution-log', () => ({
  PipelineExecutionLog: () => <div data-testid="log" />,
}));

jest.mock('@/components/bitcode/execution/pipeline-execution-log-header', () => ({
  PipelineExecutionLogHeader: () => <div data-testid="log-header" />,
}));

const { usePipelineExecution } = require('@/hooks/usePipelineExecution');

describe('ExecutionDetailsView work updates', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders latest and iteration work updates when present', () => {
    (usePipelineExecution as jest.Mock).mockReturnValue({
      execution: { id: 'run-42', created_at: new Date().toISOString(), items: [], context: {} },
      events: [],
      latestWorkUpdate: { id: 'wu-1', prose: 'Reads instruction', iteration: 3 },
      iterationUpdates: [
        { id: 'iter-1', iteration: 1, prose: 'Iteration 1 summary' },
        { id: 'iter-2', iteration: 2, prose: 'Iteration 2 summary' },
      ],
      isLoading: false,
      error: null,
    });

    render(<ExecutionDetailsView runId="run-42" />);

    expect(screen.getAllByTestId('work-update-panel').length).toBeGreaterThanOrEqual(3);
  });
});
