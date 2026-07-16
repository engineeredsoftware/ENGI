// FileDiffViewer pulls react-syntax-highlighter + lucide-react ESM that jest
// can't parse; mock it so the pipeline-execution-log module (which exports the
// pure stall-label builder) loads.
jest.mock('@/components/bitcode/pipeline/FileDiffViewer/FileDiffViewer', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  FAILSAFE_SENTENCE_NAMES,
  describeExecutionContext,
  formatFailsafeName,
  formatFailsafeSentenceName,
  humanizeAgentName,
  normalizeStepName,
  trimPipelineAgentName,
} from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';
import { formatRunClock } from '@/components/bitcode/pipeline/RunClock/RunClock';
import {
  PipelineExecutionLog,
  buildProcessingStallLabel,
} from '@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog';
import { ExecutionContextPillRow, buildFailsafePillLabel } from '@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow';
import { TelemetryExplainerTrigger } from '@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger';
import {
  getTelemetryPillExplainer,
  getTelemetryRowIconExplainer,
} from '@/components/bitcode/pipeline/TelemetryPillExplainers/telemetry-pill-explainers';
import { buildPipelineRunActivityFromEvents } from '@/components/bitcode/pipeline/models/pipeline-run-activity';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
});

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
// PILL reads the normalized 'Prepare Context' name ('Concise' stays internal).
// ---------------------------------------------------------------------------
describe('failsafe naming — sentence vs pill', () => {
  it("maps prepare_concise_context to 'Context' in the sentence", () => {
    expect(FAILSAFE_SENTENCE_NAMES.prepare_concise_context).toBe('Context');
    expect(formatFailsafeSentenceName('prepare_concise_context')).toBe('Context');
    expect(formatFailsafeSentenceName('prepare-concise-context')).toBe('Context');
  });

  it("normalizes the pill name to 'Prepare Context'", () => {
    expect(formatFailsafeName('prepare_concise_context')).toBe('Prepare Context');
    expect(formatFailsafeName('prepare-concise-context')).toBe('Prepare Context');
  });

  it('keeps the large-input/output pill names', () => {
    expect(formatFailsafeName('chunk_then_sum')).toBe('Handle Prompts');
    expect(formatFailsafeName('stitch_until_complete')).toBe('Handle Completions');
  });
});

// ---------------------------------------------------------------------------
// PTRR step labels — 'retry' must normalize to 'Retry', never 'Try'
// ('retry'.includes('try') made the broader match relabel every Retry step as
// Try, which read as a Try-after-Refine sequencing bug in the log).
// ---------------------------------------------------------------------------
describe('normalizeStepName — PTRR step labels', () => {
  it('labels every PTRR step by its own name', () => {
    expect(normalizeStepName('plan')).toBe('Plan');
    expect(normalizeStepName('try')).toBe('Try');
    expect(normalizeStepName('refine')).toBe('Refine');
    expect(normalizeStepName('retry')).toBe('Retry');
  });

  it("normalizes 'retry' variants to 'Retry', not 'Try'", () => {
    expect(normalizeStepName('retry')).toBe('Retry');
    expect(normalizeStepName('Retry')).toBe('Retry');
    expect(normalizeStepName('step:retry')).toBe('Retry');
    expect(normalizeStepName('intensify')).toBe('Retry');
  });

  it("renders the Retry step pill as 'RETRY'", () => {
    render(<ExecutionContextPillRow step="retry" />);
    expect(screen.getByText('RETRY')).toBeInTheDocument();
    expect(screen.queryByText('TRY')).not.toBeInTheDocument();
  });

  it("resolves the Retry step tooltip to the Retry specific copy, not Try's", () => {
    const explainer = getTelemetryPillExplainer('step', 'retry');
    expect(explainer.title).toBe('Retry');
    expect(explainer.specific).toContain('Retry guidance');
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
      'While Depositing, during Discovery, agent Depository Search is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('falls back to the mode latched onto the last line when no prop is given', () => {
    const { label } = buildProcessingStallLabel({ ...lastLine, pipelineMode: 'read' }, 6_000);
    expect(label).toBe(
      'While Reading, during Discovery, agent Depository Search is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('prefers the explicit prop over the latched mode', () => {
    const { label } = buildProcessingStallLabel({ ...lastLine, pipelineMode: 'read' }, 6_000, 'deposit');
    expect(label).toContain('While Depositing, during Discovery');
  });

  it('renders no prefix when the mode is unknown', () => {
    const { label } = buildProcessingStallLabel(lastLine, 6_000);
    expect(label).toBe(
      'During Discovery, agent Depository Search is Trying, by Reasoning over Context · 6s since last update',
    );
  });

  it('describeExecutionContext ignores unrecognized modes', () => {
    expect(
      describeExecutionContext({ phase: 'Setup', agent: 'A', step: 'plan', mode: 'bogus' }),
    ).toBe('During Setup, agent A is Planning');
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
describe('buildPipelineRunActivityFromEvents — mode latch + latest context', () => {
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
    const snapshot = buildPipelineRunActivityFromEvents(events, null, [], null);
    expect(snapshot.mode).toBe('deposit');
    const row = Object.values(snapshot.outputDetails)[0] as any;
    expect(row.executionState.pipelineMode).toBe('deposit');
  });

  it('exposes the current call-chain as latestContext', () => {
    const snapshot = buildPipelineRunActivityFromEvents(events, null, [], null);
    expect(snapshot.latestContext).toMatchObject({
      phase: 'discovery',
      agent: 'DepositDepositorySearchAgent',
      step: 'try',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
    });
  });

  it('keeps mode null and latestContext null before anything streams', () => {
    const snapshot = buildPipelineRunActivityFromEvents([], null, [], null);
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
    expect(screen.getByText('DEPOSITORY SEARCH')).toBeInTheDocument();
    expect(screen.getByText('TRY')).toBeInTheDocument();
    expect(screen.getByText('PREPARE CONTEXT')).toBeInTheDocument();
    expect(screen.getByText('REASON')).toBeInTheDocument();

    // ONE wrapping row, not a top/bottom split.
    const row = container.firstElementChild as HTMLElement;
    expect(row.className).toContain('flex-wrap');
  });

  it('badges failsafe-repair work on the failsafe pill', () => {
    render(
      <ExecutionContextPillRow failsafe="stitch_until_complete" stitchIteration={2} />,
    );
    expect(screen.getByText('HANDLE COMPLETIONS · STITCH ×2')).toBeInTheDocument();
  });

  it('renders nothing when there is no context at all', () => {
    const { container } = render(<ExecutionContextPillRow />);
    expect(container.firstElementChild).toBeNull();
  });

  it('strips the Agent suffix and the :lens qualifier from agent pills', () => {
    render(<ExecutionContextPillRow agent="AssetPackMeasureAbsolutesAgent:deposit" />);
    expect(screen.getByText('ASSET PACK MEASURE ABSOLUTES')).toBeInTheDocument();
  });

  it("displays the regurgitation lens as 'Training Regurgitation'", () => {
    expect(humanizeAgentName('DepositInherentRegurgitationAgent')).toBe('Training Regurgitation');
    render(<ExecutionContextPillRow agent="discovery:inherent-regurgitation" />);
    expect(screen.getByText('TRAINING REGURGITATION')).toBeInTheDocument();
  });

  it("names the Structure pill and badges CS chunks with the shared ×N pattern", () => {
    render(<ExecutionContextPillRow generation="structured_output" />);
    expect(screen.getByText('STRUCTURE')).toBeInTheDocument();
    expect(buildFailsafePillLabel({ failsafe: 'chunk_then_sum', chunkIndex: 2 })).toBe(
      'Handle Prompts · chunk ×2',
    );
    expect(buildFailsafePillLabel({ failsafe: 'stitch_until_complete', stitchIteration: 3 })).toBe(
      'Handle Completions · stitch ×3',
    );
  });
});

// ---------------------------------------------------------------------------
// Tooltip content — the SPECIFIC section states what the exact element is
// PROMPTED to do and what it RETURNS (output-schema shapes), summarized from
// the real agent/step/failsafe sources; the generic type copy is separate.
// ---------------------------------------------------------------------------
describe('getTelemetryPillExplainer — prompt/return-concrete specific copy', () => {
  it('failsafe PCC names its selection input/output shapes', () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'prepare_concise_context');
    expect(explainer.specific).toContain('pipeline_execution_keys');
    expect(explainer.specific).toContain('{selectedKeys}');
    expect(explainer.generic).toContain('Failsafes are the guards');
  });

  it("failsafe PCC tooltip titles as the normalized 'Prepare Context'", () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'prepare_concise_context');
    expect(explainer.title).toBe('Prepare Context');
  });

  it('failsafe handle-large-inputs states the budget measurement + one-vs-chunked generations', () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'chunk_then_sum');
    expect(explainer.specific).toContain('request budget');
    expect(explainer.specific).toContain('ONE task generation');
  });

  it("failsafe handle-large-outputs validates against the STEP's schema, referencing the agent when context is passed", () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'stitch_until_complete', 'deposit', {
      agent: 'DepositValidationAgent',
      step: 'try',
    });
    expect(explainer.specific).toContain("the running STEP's output schema");
    expect(explainer.specific).toContain("the Validation Agent's full output schema");
    expect(explainer.specific).toContain('the plan shape on Plan');
    expect(explainer.specific).toContain('validation error');
  });

  it('deposit agent copy summarizes the prompt purpose + the zod return shape', () => {
    const search = getTelemetryPillExplainer('agent', 'DepositDepositorySearchAgent', 'deposit');
    expect(search.specific).toContain('{guidance}');
    expect(search.specific).toContain('likelyReadTopics');

    const comprehension = getTelemetryPillExplainer('agent', 'DepositInputComprehensionAgent', 'deposit');
    expect(comprehension.specific).toContain('{comprehension}');
    expect(comprehension.specific).toContain('obfuscatedPaths');

    const synthesis = getTelemetryPillExplainer('agent', 'DepositAssetPackSynthesisAgent', 'deposit');
    expect(synthesis.specific).toContain('{options}');
    expect(synthesis.specific).toContain('patchSummary');
  });

  it("PTRR step copy references the agent's output schema, sharpened by row context", () => {
    const withContext = getTelemetryPillExplainer('step', 'try', 'deposit', {
      agent: 'DepositDepositorySearchAgent',
    });
    expect(withContext.specific).toContain("the Depository Search Agent's output schema");

    const withoutContext = getTelemetryPillExplainer('step', 'try');
    expect(withoutContext.specific).toContain("the agent's output schema");
  });

  it("Plan step copy states the step-schema law: a typed plan, not the agent's full output schema", () => {
    const plan = getTelemetryPillExplainer('step', 'plan', 'deposit', {
      agent: 'DepositAssetPackSynthesisAgent',
    });
    expect(plan.specific).toContain('{approach, steps, considerations}');
    expect(plan.specific).toContain("not the Asset Pack Synthesis Agent's full output schema");
  });

  it('generation copy names the Thinkings return shapes', () => {
    expect(getTelemetryPillExplainer('generation', 'reason').specific).toContain(
      '{analysis, steps, conclusion, confidence}',
    );
    expect(getTelemetryPillExplainer('generation', 'judge').specific).toContain(
      '{quality, issues, suggestions, approved}',
    );
    expect(getTelemetryPillExplainer('generation', 'structured_output').specific).toContain(
      'zod output schema',
    );
  });

  it('deposit phase copy states the concrete per-phase SDIVF jobs', () => {
    const discovery = getTelemetryPillExplainer('phase', 'discovery', 'deposit');
    expect(discovery.specific).toContain("The Depositing Pipeline's");
    expect(discovery.specific).toContain('codebase comprehension');
    expect(discovery.specific).toContain('inherent regurgitation');

    const finish = getTelemetryPillExplainer('phase', 'finish', 'deposit');
    expect(finish.specific).toContain('depositor review');
  });

  it('row-icon explainer keeps the specific what-this-row-is copy on the specific field', () => {
    expect(getTelemetryRowIconExplainer('llm').specific).toContain('This row is one LLM call');
    expect(getTelemetryRowIconExplainer('tool').specific).toContain('This row is one Tool use');
  });
});

// ---------------------------------------------------------------------------
// Tooltip ordering — the SPECIFIC section renders on TOP, the generic type
// copy BELOW it.
// ---------------------------------------------------------------------------
describe('TelemetryExplainerTrigger — specific section above generic', () => {
  it('renders specific before generic in the tooltip', () => {
    render(
      <TelemetryExplainerTrigger
        explainer={{
          kicker: 'Failsafe',
          title: 'Prepare Context',
          specific: 'SPECIFIC-SECTION-COPY',
          generic: 'GENERIC-SECTION-COPY',
        }}
      >
        <span>trigger</span>
      </TelemetryExplainerTrigger>,
    );

    fireEvent.mouseEnter(screen.getByText('trigger').parentElement as HTMLElement);
    const tooltip = screen.getByRole('tooltip');
    const text = tooltip.textContent || '';
    expect(text.indexOf('SPECIFIC-SECTION-COPY')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('SPECIFIC-SECTION-COPY')).toBeLessThan(text.indexOf('GENERIC-SECTION-COPY'));
  });
});

// ---------------------------------------------------------------------------
// Pill placement — the pills render to the RIGHT of the chevron + title on
// the SAME line (one flex row), not on a row above the title.
// ---------------------------------------------------------------------------
describe('PipelineExecutionLog — pre-first-row processing indicator', () => {
  it('reads the live call-chain sentence before any row lands, matching the header pills', () => {
    render(
      <PipelineExecutionLog
        output=""
        isProcessing
        error={null}
        outputDetails={{}}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        pipelineMode="deposit"
        liveContext={{
          phase: 'setup',
          agent: 'DepositInputComprehensionAgent',
          step: 'plan',
          failsafe: null,
          generation: null,
        }}
      />,
    );
    expect(
      screen.getByText('While Depositing, during Setup, agent Input Comprehension is Planning'),
    ).toBeInTheDocument();
  });

  it("falls back to bare 'Processing' when no live context exists yet", () => {
    render(
      <PipelineExecutionLog
        output=""
        isProcessing
        error={null}
        outputDetails={{}}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        pipelineMode="deposit"
      />,
    );
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });
});

describe('PipelineExecutionLog — error banner (QA F19: errors live in telemetry)', () => {
  it('renders the error as a dismissible, retryable alert', () => {
    const onRetry = jest.fn();
    const onDismissError = jest.fn();
    render(
      <PipelineExecutionLog
        output=""
        isProcessing={false}
        error="Deposit option synthesis failed."
        outputDetails={{}}
        onRetry={onRetry}
        onDismissError={onDismissError}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        pipelineMode="deposit"
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Deposit option synthesis failed.');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it('renders no alert when there is no error', () => {
    render(
      <PipelineExecutionLog
        output=""
        isProcessing={false}
        error={null}
        outputDetails={{}}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
        pipelineMode="deposit"
      />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('PipelineExecutionLog — pills inline with the title line', () => {
  const line = 'LLM call observed';
  const outputDetails = {
    [line]: {
      type: 'generation',
      status: {
        executionState: {
          phase: 'discovery',
          agent: 'DepositDepositorySearchAgent',
          step: 'try',
          failsafe: 'prepare_concise_context',
          generation: 'reason',
          pipelineMode: 'deposit',
        },
        timestamp: '2026-07-01T00:00:05.000Z',
      },
    },
  };

  it('compact layout: title and pill row share ONE flex row, pills after the title', () => {
    render(
      <PipelineExecutionLog
        output={`${line}\n`}
        isProcessing={false}
        error={null}
        outputDetails={outputDetails}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={false}
        setUserHasScrolled={() => {}}
        compact
      />,
    );

    const title = screen.getByText(line);
    const pillRow = screen.getByText('DISCOVERY').closest('.flex-wrap') as HTMLElement;
    expect(pillRow).not.toBeNull();

    // Same parent row — NOT a separate pill line above the title.
    expect(pillRow.parentElement).toBe(title.parentElement);
    const row = title.parentElement as HTMLElement;
    expect(row.className).toContain('items-center');
    expect(row.className).not.toContain('flex-col');

    // Pills come AFTER the title in document order (to its right).
    expect(
      title.compareDocumentPosition(pillRow) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
