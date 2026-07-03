// FileDiffViewer pulls react-syntax-highlighter + lucide-react ESM that jest can't
// parse; mock it so the pipeline-execution-log module (which exports the pure
// stall-label builder) loads.
jest.mock('@/components/base/bitcode/execution/FileDiffViewer', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ProcessingIndicator } from '@/components/base/bitcode/indicators/ProcessingIndicator';
import { buildProcessingStallLabel } from '@/components/base/bitcode/execution/pipeline-execution-log';

// The live stall wiring (PipelineExecutionLog): the last streamed line + a 1s
// nowTick feed buildProcessingStallLabel, whose result renders as
// <ProcessingIndicator label=… stalled=…/>. This suite drives that pairing with
// fake timers pinned to a system clock, asserting the amber flip at exactly the
// 90s LLM-call-timeout threshold.
describe('ProcessingIndicator — stall label + amber flip at 90s', () => {
  const lastLine = {
    phase: 'Discovery',
    agent: 'DepositDepositorySearchAgent',
    step: 'try',
    failsafe: 'chunk_then_sum',
    generation: 'reason',
    timestamp: '2026-07-01T00:00:00.000Z',
  };
  const lastLineMs = new Date(lastLine.timestamp).getTime();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderIndicatorAtNow() {
    const { label, likelyStalled } = buildProcessingStallLabel(lastLine, Date.now());
    return { label, likelyStalled };
  }

  it('stays emerald (not stalled) at 89s since the last event', () => {
    jest.setSystemTime(lastLineMs + 89_000);
    const { label, likelyStalled } = renderIndicatorAtNow();
    expect(likelyStalled).toBe(false);
    expect(label).toContain('89s since last update');

    render(<ProcessingIndicator label={label} stalled={likelyStalled} />);
    const text = screen.getByText(label);
    expect(text).toHaveClass('text-brand-emerald');
    expect(text).not.toHaveClass('text-amber-400');
  });

  it('flips to the amber warning tone at exactly 90s (the LLM call timeout default)', () => {
    jest.setSystemTime(lastLineMs + 90_000);
    const { label, likelyStalled } = renderIndicatorAtNow();
    expect(likelyStalled).toBe(true);
    expect(label).toContain('90s since last update');

    render(<ProcessingIndicator label={label} stalled={likelyStalled} />);
    const text = screen.getByText(label);
    expect(text).toHaveClass('text-amber-400');
    expect(text).not.toHaveClass('text-brand-emerald');
  });

  it('keeps the amber tone as the silence stretches past the threshold', () => {
    jest.setSystemTime(lastLineMs + 90_000);
    let state = renderIndicatorAtNow();
    const { rerender } = render(
      <ProcessingIndicator label={state.label} stalled={state.likelyStalled} />,
    );

    // Two more minutes of silence: still stalled, elapsed keeps counting.
    jest.setSystemTime(lastLineMs + 210_000);
    state = renderIndicatorAtNow();
    rerender(<ProcessingIndicator label={state.label} stalled={state.likelyStalled} />);

    expect(state.likelyStalled).toBe(true);
    expect(state.label).toContain('210s since last update');
    expect(screen.getByText(state.label)).toHaveClass('text-amber-400');
  });

  it('renders the natural-language sentence label verbatim', () => {
    jest.setSystemTime(lastLineMs + 30_000);
    const { label, likelyStalled } = renderIndicatorAtNow();
    expect(likelyStalled).toBe(false);
    render(<ProcessingIndicator label={label} stalled={likelyStalled} />);
    expect(
      screen.getByText(
        'During Discovery, Deposit Depository Search Agent is Trying, by Reasoning the large inputs · 30s since last update',
      ),
    ).toBeInTheDocument();
  });

  it('falls back to the default "Processing" label with the calm tone when nothing has streamed yet', () => {
    jest.setSystemTime(lastLineMs);
    const { label, likelyStalled } = buildProcessingStallLabel(undefined, Date.now());
    render(<ProcessingIndicator label={label} stalled={likelyStalled} />);
    const text = screen.getByText('Processing');
    expect(text).toHaveClass('text-brand-emerald');
  });
});
