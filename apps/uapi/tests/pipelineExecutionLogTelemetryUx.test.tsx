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
  TELEMETRY_PILL_CATALOG,
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

  it("resolves the Retry step tooltip to the Retry product copy, not Try's", () => {
    const explainer = getTelemetryPillExplainer('step', 'retry');
    expect(explainer.title).toBe('Retry');
    expect(explainer.specific).toContain('is Retrying');
    expect(explainer.specific).not.toContain('is Trying');
    expect(explainer.generic).toContain('Retry is the last bounded re-run');
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

  it('surfaces Setup/Validation phase decisions as formal rows (no LLM/tool)', () => {
    const phaseEvents = [
      {
        id: 'setup-decision',
        event: {
          type: 'status',
          namespace: 'setup',
          key: 'phaseDecision',
          data: {
            formalPhaseDecision: true,
            phase: 'setup',
            agent: 'clone-vcs-repository',
            step: 'decide',
            failsafe: 'host-env-clone',
            generation: 'structure',
            summary:
              'Setup clone complete (setup-in-box-branch-shallow): working tree ready at revision for this run.',
            message:
              'Setup clone complete (setup-in-box-branch-shallow): working tree ready at revision for this run.',
          },
        },
        created_at: '2026-07-01T00:00:01.000Z',
      },
      {
        id: 'validation-ready',
        event: {
          type: 'status',
          namespace: 'validation',
          key: 'readyToFinish',
          data: {
            formalPhaseDecision: true,
            finalApproval: true,
            recommendation: 'finish',
            summary: 'Deposit synthesis ready to finish.',
            message: 'Deposit synthesis ready to finish.',
            phase: 'validation',
            agent: 'ready-to-finish-asset-packs-synthesis-deposit-pipeline',
            step: 'decide',
          },
        },
        created_at: '2026-07-01T00:00:10.000Z',
      },
    ];
    const snapshot = buildPipelineRunActivityFromEvents(phaseEvents, null, [], null);
    const texts = Object.keys(snapshot.outputDetails);
    expect(texts.some((t) => /Setup clone complete/i.test(t))).toBe(true);
    expect(texts.some((t) => /ready to finish/i.test(t))).toBe(true);
    expect(snapshot.readyToFinishVerdicts).toHaveLength(1);
    expect(snapshot.readyToFinishVerdicts[0].finalApproval).toBe(true);
    expect(snapshot.readyToFinishVerdicts[0].recommendation).toBe('finish');
  });

  it('de-dupes formal rows that arrive twice (sandbox legacy + host bridge)', () => {
    const duped = [
      ...events,
      {
        id: '3',
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
        created_at: '2026-07-01T00:00:06.000Z',
      },
    ];
    const snapshot = buildPipelineRunActivityFromEvents(duped, null, [], null);
    expect(Object.keys(snapshot.outputDetails)).toHaveLength(1);
  });

  it('de-dupes legacy+bridge pairs that differ only by executionNodeId (run 8ecbd11a)', () => {
    // LEGACY stream rows carry executionNodeId=`thinkings:reason`; the host
    // telemetry bridge re-emits the same path ~1s later without nodeId.
    const path = [
      'pipeline:synthesize_deposit_asset_packs',
      'seq-3',
      'phase:validation',
      'agent:DepositReadyToFinishAssetPacksSynthesisDepositPipeline',
      'try',
      'seq-0',
      'failsafe:prepare_concise_context',
      'selection',
      'seq-0',
      'thinkings:reason',
    ];
    const state = {
      phase: 'validation',
      agent: 'DepositReadyToFinishAssetPacksSynthesisDepositPipeline',
      step: 'try',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
    };
    const dual = [
      {
        id: 'legacy',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'output',
          message: '[content withheld — source-safe]',
          executionNodeId: 'thinkings:reason',
          executionPath: path,
          executionState: state,
        },
        created_at: '2026-07-19T21:37:50.803Z',
      },
      {
        id: 'bridge',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'output',
          message: '[content withheld — source-safe]',
          executionPath: path,
          executionState: state,
        },
        created_at: '2026-07-19T21:37:52.636Z',
      },
    ];
    const snapshot = buildPipelineRunActivityFromEvents(dual, null, [], null);
    expect(Object.keys(snapshot.outputDetails)).toHaveLength(1);
  });

  it('never stamps DIV iter on Setup formal rows even after currentIteration=1', () => {
    // Late dual-write: Setup refine STRUCTURE after Discovery latched iter 1
    // used to paint "iter 1" on the last Setup log line (run 9d8bcf0f UX).
    const mixed = [
      {
        id: 's1',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'output',
          message: '[content withheld — source-safe]',
          executionState: {
            phase: 'setup',
            agent: 'DepositInputComprehensionAgent',
            step: 'refine',
            failsafe: 'prepare_concise_context',
            generation: 'reason',
          },
        },
        created_at: '2026-07-01T00:00:01.000Z',
      },
      {
        id: 'iter',
        event: {
          type: 'status',
          namespace: 'pipeline',
          key: 'currentIteration',
          data: 1,
        },
        created_at: '2026-07-01T00:00:02.000Z',
      },
      {
        id: 's2-late',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'output',
          message: '[content withheld — source-safe]',
          executionState: {
            phase: 'setup',
            agent: 'DepositInputComprehensionAgent',
            step: 'refine',
            failsafe: 'handle_prompts',
            generation: 'structured_output',
          },
        },
        created_at: '2026-07-01T00:00:03.000Z',
      },
      {
        id: 'd1',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'output',
          message: '[content withheld — source-safe]',
          executionState: {
            phase: 'discovery',
            agent: 'DepositCodebaseComprehensionAgent',
            step: 'plan',
            failsafe: 'prepare_concise_context',
            generation: 'reason',
          },
        },
        created_at: '2026-07-01T00:00:04.000Z',
      },
    ];
    const snapshot = buildPipelineRunActivityFromEvents(mixed, null, [], null);
    const rows = Object.values(snapshot.outputDetails) as any[];
    const setupRows = rows.filter((r) =>
      String(r?.executionState?.phase || '').toLowerCase().includes('setup'),
    );
    const discoveryRows = rows.filter((r) =>
      String(r?.executionState?.phase || '').toLowerCase().includes('discovery'),
    );
    expect(setupRows.length).toBe(2);
    for (const row of setupRows) {
      expect(row.executionState.iteration ?? null).toBeNull();
    }
    expect(discoveryRows.length).toBe(1);
    expect(discoveryRows[0].executionState.iteration).toBe(1);
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
// Tooltip content — gold standard (Setup-approved product UX):
//   (a) specific (TOP/white): product job on THIS pipeline (+ stack when known)
//   (b) generic (GREY): kind + this value as a concept only — never mechanism-
//       only tops, never sibling laundry lists as the only grey body.
// ---------------------------------------------------------------------------
describe('getTelemetryPillExplainer — Setup gold standard product/concept copy', () => {
  it('Setup phase is the gold-standard template for white product + grey concept', () => {
    const deposit = getTelemetryPillExplainer('phase', 'setup', 'deposit');
    expect(deposit.specific).toContain('On the Depositing Pipeline');
    expect(deposit.specific).toContain('clones the selected repository');
    expect(deposit.specific).toContain('Obfuscations');
    expect(deposit.generic).toMatch(/^A phase is one stage/);
    expect(deposit.generic).toContain('Setup is the opening stage');
    // Grey is concept-only — not deposit-only product jobs.
    expect(deposit.generic).not.toContain('clones the selected repository');
    expect(deposit.generic).not.toContain('On the Depositing Pipeline');

    const read = getTelemetryPillExplainer('phase', 'setup', 'read');
    expect(read.specific).toContain('On the Reading Pipeline');
    expect(read.specific).toContain('Need');
    expect(read.generic).toBe(deposit.generic);
  });

  it("failsafe PCC titles as 'Prepare Context'; white is product focus, grey is concept", () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'prepare_concise_context', 'deposit', {
      agent: 'DepositInputComprehensionAgent',
      step: 'try',
    });
    expect(explainer.title).toBe('Prepare Context');
    expect(explainer.specific).toContain('On the Depositing Pipeline');
    expect(explainer.specific).toContain('Input Comprehension Agent');
    expect(explainer.specific).toContain('Trying');
    expect(explainer.specific).toContain('source-safe');
    // White is product purpose, not raw key/shape mechanism.
    expect(explainer.specific).not.toContain('pipeline_execution_keys');
    expect(explainer.specific).not.toContain('{selectedKeys}');
    expect(explainer.generic).toMatch(/^A failsafe guards/);
    expect(explainer.generic).toContain('Prepare Context');
  });

  it('Chunk Then Sum white names oversized product payloads; mechanism stays grey', () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'chunk_then_sum', 'deposit', {
      agent: 'DepositAssetPackSynthesisAgent',
      step: 'try',
    });
    expect(explainer.specific).toContain('On the Depositing Pipeline');
    expect(explainer.specific).toContain('Asset Pack Synthesis Agent');
    expect(explainer.specific).toContain('Trying');
    expect(explainer.specific).toContain('oversized product payloads');
    expect(explainer.specific).toContain('large synthesized pack content');
    // Mechanism (fit → one pass; else chunk+sum) is concept/grey — not white top.
    expect(explainer.specific).not.toContain('fit → one pass');
    expect(explainer.specific).not.toContain('ONE task generation');
    expect(explainer.generic).toContain('fit → one pass');
    expect(explainer.generic).toContain('chunked task generations');
  });

  it('Stitch Until Complete white is product completion; stack names agent when known', () => {
    const explainer = getTelemetryPillExplainer('failsafe', 'stitch_until_complete', 'deposit', {
      agent: 'DepositValidationAgent',
      step: 'try',
    });
    expect(explainer.specific).toContain('On the Depositing Pipeline');
    expect(explainer.specific).toContain('Validation Agent');
    expect(explainer.specific).toContain('Trying');
    expect(explainer.specific).toContain('structured product output');
    // Not pure schema/error mechanism as the only white body.
    expect(explainer.specific).not.toContain('validation error');
    expect(explainer.specific).not.toContain('{approach, steps, considerations}');
    expect(explainer.generic).toContain('schema-repair');
  });

  it('deposit agent white is product job, not zod field laundry lists', () => {
    const search = getTelemetryPillExplainer('agent', 'DepositDepositorySearchAgent', 'deposit');
    expect(search.specific).toContain('On the Depositing Pipeline');
    expect(search.specific).toContain('reading demand');
    expect(search.specific).not.toContain('{guidance}');
    expect(search.specific).not.toContain('likelyReadTopics');
    expect(search.generic).toMatch(/^An agent is a worker/);

    const comprehension = getTelemetryPillExplainer('agent', 'DepositInputComprehensionAgent', 'deposit');
    expect(comprehension.specific).toContain('Obfuscations');
    expect(comprehension.specific).not.toContain('{comprehension}');
    expect(comprehension.specific).not.toContain('obfuscatedPaths');

    const synthesis = getTelemetryPillExplainer('agent', 'DepositAssetPackSynthesisAgent', 'deposit');
    expect(synthesis.specific).toContain('2–4 distinct');
    expect(synthesis.specific).toContain('DataPack');
    expect(synthesis.specific).not.toContain('{options}');
    expect(synthesis.specific).not.toContain('patchSummary');
  });

  it('PTRR step white is product role on this stack; schema law stays grey', () => {
    const withContext = getTelemetryPillExplainer('step', 'try', 'deposit', {
      agent: 'DepositDepositorySearchAgent',
      step: 'try',
    });
    // Agent lead only — no double "is Trying while … is Trying".
    expect(withContext.specific).toBe(
      'On the Depositing Pipeline, the Depository Search Agent is Trying: running the main attempt to produce this agent’s product result for the pipeline.',
    );
    expect(withContext.generic).toContain("agent’s output schema");

    const withoutContext = getTelemetryPillExplainer('step', 'try');
    expect(withoutContext.specific).toContain('this agent is Trying');
    expect(withoutContext.generic).toContain('Try is the main generation attempt');
  });

  it('Plan step white is drafting approach; plan shape stays grey', () => {
    const plan = getTelemetryPillExplainer('step', 'plan', 'deposit', {
      agent: 'DepositAssetPackSynthesisAgent',
      step: 'plan',
    });
    expect(plan.specific).toContain('Asset Pack Synthesis Agent is Planning');
    expect(plan.specific).toContain('drafting how this agent will approach');
    expect(plan.specific).not.toContain('{approach, steps, considerations}');
    expect(plan.generic).toContain('plan shape');
  });

  it('generation white is product Thinkings role; return shapes stay grey', () => {
    const reason = getTelemetryPillExplainer('generation', 'reason', 'deposit', {
      agent: 'DepositAssetPackSynthesisAgent',
      step: 'try',
    });
    expect(reason.specific).toContain('On the Depositing Pipeline');
    expect(reason.specific).toContain('Asset Pack Synthesis Agent');
    expect(reason.specific).toContain('Trying');
    expect(reason.specific).toContain('product problem');
    expect(reason.specific).not.toContain('{analysis, reasoningItems');
    expect(reason.generic).toContain('free-form analysis');

    const judge = getTelemetryPillExplainer('generation', 'judge');
    expect(judge.specific).toContain('product step');
    expect(judge.specific).not.toContain('{quality, issues');
    expect(judge.generic).toContain('advisory quality');

    const structure = getTelemetryPillExplainer('generation', 'structured_output');
    expect(structure.specific).toContain('typed product result');
    expect(structure.specific).not.toContain('zod output schema');
    expect(structure.generic).toContain('typed step result');
  });

  it('deposit phase white states concrete product SDIVF jobs', () => {
    const discovery = getTelemetryPillExplainer('phase', 'discovery', 'deposit');
    expect(discovery.specific).toContain('On the Depositing Pipeline');
    expect(discovery.specific).toContain('codebase comprehension');
    expect(discovery.specific).toContain('inherent regurgitation');
    expect(discovery.generic).toMatch(/^A phase is one stage/);

    const finish = getTelemetryPillExplainer('phase', 'finish', 'deposit');
    expect(finish.specific).toContain('depositor review');
    expect(finish.specific).toContain('Depository admission');
  });

  it('row-icon explainer keeps product what-this-row-is on specific', () => {
    expect(getTelemetryRowIconExplainer('llm', 'deposit').specific).toContain(
      'On the Depositing Pipeline',
    );
    expect(getTelemetryRowIconExplainer('llm', 'deposit').specific).toContain(
      'one model inference',
    );
    expect(getTelemetryRowIconExplainer('tool', 'read').specific).toContain(
      'On the Reading Pipeline',
    );
    expect(getTelemetryRowIconExplainer('tool', 'read').specific).toContain('one tool invocation');
  });
});

// ---------------------------------------------------------------------------
// Catalog completeness — every legal chip value has distinct product white +
// concept grey for both pipeline modes (Setup law applied throughout).
// ---------------------------------------------------------------------------
describe('TELEMETRY_PILL_CATALOG — completeness under Setup gold standard', () => {
  const stackCtx = {
    agent: 'DepositAssetPackSynthesisAgent',
    step: 'try',
  } as const;

  /** Mechanism-ish tokens that must not own the white (specific) top alone. */
  const MECHANISM_WHITE_BANS = [
    'pipeline_execution_keys',
    '{selectedKeys}',
    '{guidance}',
    '{comprehension}',
    '{options}',
    '{approach, steps, considerations}',
    '{analysis, reasoningItems',
    '{quality, issues',
    'ONE task generation',
    'fit → one pass',
  ];

  it('every catalog phase has mode-specific product white and shared concept grey', () => {
    for (const phase of TELEMETRY_PILL_CATALOG.phases) {
      for (const mode of TELEMETRY_PILL_CATALOG.modes) {
        const e = getTelemetryPillExplainer('phase', phase, mode);
        expect(e.specific.length).toBeGreaterThan(40);
        expect(e.generic.length).toBeGreaterThan(40);
        expect(e.generic).toMatch(/^A phase is one stage/);
        if (mode === 'deposit') {
          expect(e.specific).toContain('On the Depositing Pipeline');
        } else {
          expect(e.specific).toContain('On the Reading Pipeline');
        }
        // Deposit vs read white must differ for known product phases.
        const other = getTelemetryPillExplainer(
          'phase',
          phase,
          mode === 'deposit' ? 'read' : 'deposit',
        );
        expect(e.specific).not.toBe(other.specific);
        expect(e.generic).toBe(other.generic);
        for (const ban of MECHANISM_WHITE_BANS) {
          expect(e.specific).not.toContain(ban);
        }
      }
    }
  });

  it('every catalog step has product white with agent lead and concept grey', () => {
    for (const step of TELEMETRY_PILL_CATALOG.steps) {
      const e = getTelemetryPillExplainer('step', step, 'deposit', {
        agent: 'DepositDepositorySearchAgent',
        step,
      });
      expect(e.specific).toContain('On the Depositing Pipeline');
      expect(e.specific).toContain('Depository Search Agent');
      expect(e.generic).toMatch(/^A step is one ordered PTRR move/);
      // No double gerund from stacking step into stackClause.
      expect(e.specific).not.toMatch(/is Trying is Trying/);
      expect(e.specific).not.toMatch(/is Planning is Planning/);
      for (const ban of MECHANISM_WHITE_BANS) {
        expect(e.specific).not.toContain(ban);
      }
    }
  });

  it('every catalog failsafe has product white + concept grey (mechanism in grey)', () => {
    for (const failsafe of TELEMETRY_PILL_CATALOG.failsafes) {
      for (const mode of TELEMETRY_PILL_CATALOG.modes) {
        const e = getTelemetryPillExplainer('failsafe', failsafe, mode, stackCtx);
        expect(e.specific).toMatch(/On the (Depositing|Reading) Pipeline/);
        expect(e.specific).toContain('Asset Pack Synthesis Agent');
        expect(e.specific).toContain('Trying');
        expect(e.generic).toMatch(/^A failsafe guards/);
        for (const ban of MECHANISM_WHITE_BANS) {
          expect(e.specific).not.toContain(ban);
        }
      }
    }
    // Chunk Then Sum: product payload language in white; fit/chunk algorithm in grey.
    const cts = getTelemetryPillExplainer('failsafe', 'chunk_then_sum', 'deposit', stackCtx);
    expect(cts.specific).toContain('oversized product payloads');
    expect(cts.generic).toContain('fit → one pass');
  });

  it('every catalog generation has product white + concept grey', () => {
    for (const gen of TELEMETRY_PILL_CATALOG.generations) {
      const e = getTelemetryPillExplainer('generation', gen, 'deposit', stackCtx);
      expect(e.specific).toContain('On the Depositing Pipeline');
      expect(e.specific).toContain('Asset Pack Synthesis Agent');
      expect(e.generic).toMatch(/^A generation is one Thinkings pass/);
      for (const ban of MECHANISM_WHITE_BANS) {
        expect(e.specific).not.toContain(ban);
      }
    }
  });

  it('every catalog agent match key resolves product white for deposit and read', () => {
    // Representative raw agent names that hit each match key.
    const samples: Array<[string, string]> = [
      ['inputcomprehension', 'DepositInputComprehensionAgent'],
      ['clonevcsrepository', 'DepositCloneVCSRepositoryAgent'],
      ['codebasecomprehension', 'DepositCodebaseComprehensionAgent'],
      ['depositorysearch', 'DepositDepositorySearchAgent'],
      ['inherentregurgitation', 'DepositInherentRegurgitationAgent'],
      ['assetpacksynthesis', 'DepositAssetPackSynthesisAgent'],
      ['measureabsolutes', 'AssetPackMeasureAbsolutesAgent:deposit'],
      ['validation', 'DepositValidationAgent'],
      ['uploadassetpacksforreview', 'DepositUploadAssetPacksForReviewAgent'],
      ['uploadforreview', 'UploadForReviewAgent'],
    ];
    expect(samples.map(([k]) => k).sort()).toEqual(
      [...TELEMETRY_PILL_CATALOG.agentMatchKeys].sort(),
    );
    for (const [, raw] of samples) {
      for (const mode of TELEMETRY_PILL_CATALOG.modes) {
        const e = getTelemetryPillExplainer('agent', raw, mode);
        expect(e.specific.length).toBeGreaterThan(40);
        expect(e.generic).toMatch(/^An agent is a worker/);
        if (mode === 'deposit') {
          expect(e.specific).toContain('On the Depositing Pipeline');
        } else {
          expect(e.specific).toContain('On the Reading Pipeline');
        }
        for (const ban of MECHANISM_WHITE_BANS) {
          expect(e.specific).not.toContain(ban);
        }
      }
    }
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

describe('PipelineExecutionLog — compact rich telemetry containment', () => {
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

  it('compact layout: title row then wrapping pills (no shared nowrap row)', () => {
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

    // Shell: title meta line + pill cluster as stacked children so long
    // uppercase call-chain labels cannot page-x-overflow historical runs.
    const shell = pillRow.parentElement as HTMLElement;
    expect(shell.className).toContain('flex-col');
    expect(shell.className).toContain('min-w-0');
    expect(shell.contains(title)).toBe(true);

    // Pills still follow the title in document order (below, not above).
    expect(
      title.compareDocumentPosition(pillRow) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Pill row itself wraps and is width-capped.
    expect(pillRow.className).toMatch(/flex-wrap/);
    expect(pillRow.className).toMatch(/max-w-full|w-full/);
  });
});
