// FileDiffViewer pulls react-syntax-highlighter + lucide-react ESM that jest
// can't parse; mock it so the pipeline-execution-log module (which exports the
// pure stall-label builder) loads.
jest.mock('@/components/base/bitcode/execution/FileDiffViewer', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import {
  FAILSAFE_SENTENCE_NAMES,
  describeExecutionContext,
  formatFailsafeName,
  formatFailsafeSentenceName,
  humanizeAgentName,
  trimPipelineAgentName,
} from '@/components/base/bitcode/execution/execution-telemetry-format';
import { formatRunClock } from '@/components/base/bitcode/execution/RunClock';
import { buildProcessingStallLabel } from '@/components/base/bitcode/execution/pipeline-execution-log';
import { ExecutionContextPillRow } from '@/components/base/bitcode/execution/ExecutionContextPillRow';
import { buildTerminalRunActivityFromEvents } from '@/app/terminal/terminal-run-activity';

// ---------------------------------------------------------------------------
// Item 3 — trim the pipeline-name prefix from AGENT names (display only)
// ---------------------------------------------------------------------------
describe('trimPipelineAgentName — client-side pipeline prefix trim', () => {
  it('trims the CamelCase Deposit/Read pipeline prefix', () => {
    expect(trimPipelineAgentName('DepositDepositorySearchAgent')).toBe('DepositorySearchAgent');
    expect(trimPipelineAgentName('ReadFitsFindingSynthesisSetupPlanAgent')).toBe(
      'FitsFindingSynthesisSetupPlanAgent',
    );
  });

  it('trims kebab pipeline prefixes', () => {
    expect(trimPipelineAgentName('deposit-depository-search')).toBe('depository-search');
    expect(trimPipelineAgentName('read-comprehension-agent')).toBe('comprehension-agent');
  });

  it("trims 'setup:'-style namespace prefixes", () => {
    expect(trimPipelineAgentName('setup:asset-pack-initialize-mcps-tools-agent')).toBe(
      'asset-pack-initialize-mcps-tools-agent',
    );
    expect(trimPipelineAgentName('finish:asset-pack-gather-metrics-agent')).toBe(
      'asset-pack-gather-metrics-agent',
    );
  });

  it('leaves non-prefixed names and suffix-style qualifiers alone', () => {
    expect(trimPipelineAgentName('candidate-recall')).toBe('candidate-recall');
    // 'Depository…' is not the 'Deposit' pipeline prefix — must stay intact.
    expect(trimPipelineAgentName('DepositorySearchAgent')).toBe('DepositorySearchAgent');
    // ':deposit' here is a lens SUFFIX, not a namespace prefix.
    expect(trimPipelineAgentName('AssetPackMeasureAbsolutesAgent:deposit')).toBe(
      'AssetPackMeasureAbsolutesAgent:deposit',
    );
  });

  it('feeds the humanized sentence agent name', () => {
    expect(humanizeAgentName('DepositDepositorySearchAgent')).toBe('Depository Search');
    expect(humanizeAgentName('ReadFitsFindingSynthesisSetupPlanAgent')).toBe(
      'Fits Finding Synthesis Setup Plan',
    );
  });
});

// ---------------------------------------------------------------------------
// Item 1 — prepare_concise_context reads 'Context' in the SENTENCE while the
// PILL keeps the full 'Prepare Concise Context' name.
// ---------------------------------------------------------------------------
describe('failsafe naming — sentence vs pill', () => {
  it("maps prepare_concise_context to 'Context' in the sentence", () => {
    expect(FAILSAFE_SENTENCE_NAMES.prepare_concise_context).toBe('Context');
    expect(formatFailsafeSentenceName('prepare_concise_context')).toBe('Context');
    expect(formatFailsafeSentenceName('prepare-concise-context')).toBe('Context');
  });

  it("keeps the pill name 'Prepare Concise Context'", () => {
    expect(formatFailsafeName('prepare_concise_context')).toBe('Prepare Concise Context');
  });

  it('keeps the large-input/output pill names', () => {
    expect(formatFailsafeName('chunk_then_sum')).toBe('handle large inputs');
    expect(formatFailsafeName('stitch_until_complete')).toBe('handle large outputs');
  });
});

// ---------------------------------------------------------------------------
// Items 2 + 11 — the 'While <Pipeline>, ' prefix composes with the trimmed
// agent name and the 'Context' failsafe sentence name.
// ---------------------------------------------------------------------------
describe("processing sentence — 'While Depositing, during …' prefix", () => {
  const lastLine = {
    phase: 'Discovery',
    agent: 'DepositDepositorySearchAgent',
    step: 'try',
    failsafe: 'prepare_concise_context',
    generation: 'reason',
    timestamp: new Date(0).toISOString(),
  };

  it('composes the full item-11 sentence with an explicit pipelineMode prop', () => {
    const { label } = buildProcessingStallLabel(lastLine, 6_000, 'deposit');
    expect(label).toBe(
      'While Depositing, during Discovery, Depository Search Agent is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('falls back to the mode latched onto the last line when no prop is given', () => {
    const { label } = buildProcessingStallLabel({ ...lastLine, pipelineMode: 'read' }, 6_000);
    expect(label).toBe(
      'While Reading, during Discovery, Depository Search Agent is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('prefers the explicit prop over the latched mode', () => {
    const { label } = buildProcessingStallLabel({ ...lastLine, pipelineMode: 'read' }, 6_000, 'deposit');
    expect(label).toContain('While Depositing, during Discovery');
  });

  it('renders no prefix when the mode is unknown', () => {
    const { label } = buildProcessingStallLabel(lastLine, 6_000);
    expect(label).toBe(
      'During Discovery, Depository Search Agent is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('describeExecutionContext ignores unrecognized modes', () => {
    expect(
      describeExecutionContext({ phase: 'Setup', agent: 'A', step: 'plan', mode: 'bogus' }),
    ).toBe('During Setup, A Agent is Planning');
  });
});

// ---------------------------------------------------------------------------
// Item 10 — the total-run-time clock format (m:ss under an hour, h:mm:ss from
// one hour up).
// ---------------------------------------------------------------------------
describe('formatRunClock', () => {
  it('formats m:ss under an hour', () => {
    expect(formatRunClock(0)).toBe('0:00');
    expect(formatRunClock(7_000)).toBe('0:07');
    expect(formatRunClock(293_000)).toBe('4:53');
    expect(formatRunClock(3_599_000)).toBe('59:59');
  });

  it('formats h:mm:ss from one hour up', () => {
    expect(formatRunClock(3_600_000)).toBe('1:00:00');
    expect(formatRunClock(3_849_000)).toBe('1:04:09');
  });

  it('clamps negative and non-finite inputs to 0:00', () => {
    expect(formatRunClock(-5_000)).toBe('0:00');
    expect(formatRunClock(Number.NaN)).toBe('0:00');
  });
});

// ---------------------------------------------------------------------------
// Item 2 mechanism — the activity builder latches the mode from the
// 'synthesize-asset-packs'/'mode' store, stamps it onto rows, and exposes the
// CURRENT call-chain for the live header tracker (item 5).
// ---------------------------------------------------------------------------
describe('buildTerminalRunActivityFromEvents — mode latch + latest context', () => {
  const events = [
    {
      id: '1',
      event: { type: 'status', namespace: 'synthesize-asset-packs', key: 'mode', data: 'deposit' },
      created_at: '2026-07-01T00:00:00.000Z',
    },
    {
      id: '2',
      event: {
        type: 'generation',
        namespace: 'llm',
        key: 'output',
        message: '[content withheld — source-safe]',
        executionState: {
          phase: 'discovery',
          agent: 'DepositDepositorySearchAgent',
          step: 'try',
          failsafe: 'prepare_concise_context',
          generation: 'reason',
        },
      },
      created_at: '2026-07-01T00:00:05.000Z',
    },
  ];

  it('latches the mode and stamps it onto row executionState', () => {
    const snapshot = buildTerminalRunActivityFromEvents(events, null, [], null);
    expect(snapshot.mode).toBe('deposit');
    const row = Object.values(snapshot.outputDetails)[0] as any;
    expect(row.executionState.pipelineMode).toBe('deposit');
  });

  it('exposes the current call-chain as latestContext', () => {
    const snapshot = buildTerminalRunActivityFromEvents(events, null, [], null);
    expect(snapshot.latestContext).toMatchObject({
      phase: 'discovery',
      agent: 'DepositDepositorySearchAgent',
      step: 'try',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
    });
  });

  it('keeps mode null and latestContext null before anything streams', () => {
    const snapshot = buildTerminalRunActivityFromEvents([], null, [], null);
    expect(snapshot.mode).toBeNull();
    expect(snapshot.latestContext).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Items 3 + 8 + 9 — the shared pill row renders ONE inline row of all pills in
// canonical order with the pipeline prefix trimmed from the agent pill.
// ---------------------------------------------------------------------------
describe('ExecutionContextPillRow', () => {
  it('renders all five pills inline with the trimmed agent label', () => {
    const { container } = render(
      <ExecutionContextPillRow
        phase="discovery"
        agent="DepositDepositorySearchAgent"
        step="try"
        failsafe="prepare_concise_context"
        generation="reason"
        mode="deposit"
      />,
    );

    // Pill labels render uppercase (PathPill uppercases string labels).
    expect(screen.getByText('DISCOVERY')).toBeInTheDocument();
    expect(screen.getByText('DEPOSITORYSEARCHAGENT')).toBeInTheDocument();
    expect(screen.getByText('TRY')).toBeInTheDocument();
    expect(screen.getByText('PREPARE CONCISE CONTEXT')).toBeInTheDocument();
    expect(screen.getByText('REASON')).toBeInTheDocument();

    // ONE wrapping row, not a top/bottom split.
    const row = container.firstElementChild as HTMLElement;
    expect(row.className).toContain('flex-wrap');
  });

  it('badges failsafe-repair work on the failsafe pill', () => {
    render(
      <ExecutionContextPillRow failsafe="stitch_until_complete" stitchIteration={2} />,
    );
    expect(screen.getByText('HANDLE LARGE OUTPUTS · STITCH ×2')).toBeInTheDocument();
  });

  it('renders nothing when there is no context at all', () => {
    const { container } = render(<ExecutionContextPillRow />);
    expect(container.firstElementChild).toBeNull();
  });
});
