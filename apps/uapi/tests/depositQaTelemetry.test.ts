/**
 * Gate 4 deposit QA telemetry — continuum + materialization + admit N→N.
 */
import {
  buildDepositQaTelemetryReport,
  detectDepositQaImplementationAgents,
  detectDepositQaPhases,
  formatDepositQaTelemetryMarkdown,
} from '@/components/deposits/models/deposit-qa-telemetry';
import type { PipelineRunActivitySnapshot } from '@/components/bitcode/pipeline/models/pipeline-run-activity';

function emptyActivity(
  overrides: Partial<PipelineRunActivitySnapshot> = {},
): PipelineRunActivitySnapshot {
  return {
    output: '',
    outputDetails: {},
    activityRecords: [],
    activityKinds: [],
    executionState: {},
    isStreamingComplete: false,
    generationCount: 0,
    error: null,
    latestWorkUpdate: null,
    iterationUpdates: [],
    mode: 'deposit',
    currentIteration: 1,
    readyToFinishVerdicts: [],
    latestContext: null,
    ...overrides,
  };
}

describe('deposit-qa-telemetry', () => {
  it('detects SDIVF phase continuum and implementation agents from blobs', () => {
    const blobs = [
      'setup',
      'discovery',
      'implementation',
      'deposit-implementation-agent-asset-packs-plan',
      'patchfile',
      'measurements-synthesis',
      'commercial-nl',
      'validation',
      'finish',
    ];
    expect(detectDepositQaPhases(blobs)).toEqual([
      'setup',
      'discovery',
      'implementation',
      'validation',
      'finish',
    ]);
    expect(detectDepositQaImplementationAgents(blobs)).toEqual([
      'patch-plan',
      'patchfile',
      'measurements',
      'commercial-nl',
    ]);
  });

  it('builds a source-safe report with option materialization and N→N admit', () => {
    const activity = emptyActivity({
      generationCount: 4,
      currentIteration: 1,
      latestContext: {
        phase: 'implementation',
        agent: 'deposit-implementation-agent-asset-packs-commercial-nl',
        step: 'structured_output',
        failsafe: null,
        generation: 'try',
      },
      outputDetails: {
        'phase setup complete': { phase: 'setup', agent: 'setup' },
        'phase discovery': { phase: 'discovery' },
        'phase implementation plan': {
          phase: 'implementation',
          agent: 'patch-plan',
        },
        'phase implementation patchfile': {
          phase: 'implementation',
          agent: 'patchfile',
        },
        'phase implementation measure': {
          phase: 'implementation',
          agent: 'measurements',
        },
        'phase implementation commercial': {
          phase: 'implementation',
          agent: 'commercial-nl',
        },
        'phase validation': { phase: 'validation' },
        'phase finish': { phase: 'finish' },
      },
      readyToFinishVerdicts: [
        {
          iteration: 1,
          finalApproval: true,
          recommendation: 'finish',
          qualityScore: 0.91,
          overallConfidence: 0.88,
          warningsCount: 0,
          reasons: [],
          summary: 'Presentable packs ready.',
        },
      ],
    });

    const options = [
      {
        optionId: 'opt-a',
        title: 'Auth slice',
        commercialTitle: 'Auth middleware capability',
        commercialDescription:
          'Extracts and measures the auth middleware path into a commercial DataPack for readers.',
        measurements: [
          { kind: 'function-count', volume: 0.4, weight: 0.1 },
          { kind: 'file-count', volume: 0.2, weight: 0.05 },
        ],
        contents: {
          fileChanges: [
            {
              path: 'src/auth.ts',
              op: 'modify',
              content: 'export function auth() {}\n',
            },
          ],
          unifiedDiff:
            'diff --git a/src/auth.ts b/src/auth.ts\n--- a/src/auth.ts\n+++ b/src/auth.ts\n+export function auth() {}\n',
        },
        patchArtifact: { bodiesComplete: true },
        presentable: true,
      },
      {
        optionId: 'opt-b',
        title: 'Thin',
        commercialTitle: 'Short',
        commercialDescription: 'too short',
        measurements: [],
        contents: { fileChanges: [{ path: 'x.ts', op: 'modify' }] },
        presentable: true,
      },
    ];

    const report = buildDepositQaTelemetryReport({
      runId: 'run-1',
      status: 'complete',
      expectsOptions: true,
      runStartMs: 1_000,
      runEndMs: 61_000,
      activity,
      events: [{ event: { type: 'phase', phase: 'discovery' } }],
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      obfuscations: 'keep secrets out',
      permissibleSources: ['src/'],
      impermissibleSources: [],
      options,
      selectedOptionIds: ['opt-a', 'opt-b'],
      admissionReceipts: [
        {
          optionId: 'opt-a',
          admission: { state: 'admitted-to-depository', warnings: ['soft'] },
        },
        {
          optionId: 'opt-b',
          admission: { state: 'admitted-to-depository', warnings: [] },
        },
      ],
    });

    expect(report.schema).toBe('bitcode.deposit.qa-telemetry-report');
    expect(report.sourceSafetyClass).toBe('source_safe_deposit_qa_metadata');
    expect(report.run.durationMs).toBe(60_000);
    expect(report.continuum.phaseContinuityComplete).toBe(true);
    expect(report.continuum.implementationSequenceComplete).toBe(true);
    expect(report.options.optionCount).toBe(2);
    expect(report.options.presentableCount).toBe(2);
    expect(report.options.commercialBriefCount).toBe(1);
    expect(report.options.unifiedDiffCount).toBe(1);
    expect(report.admission.batchAdmitNtoN).toBe(true);
    expect(report.admission.softWarningCount).toBe(1);
    expect(report.gaps.some((g) => g.includes('commercial brief'))).toBe(true);
    expect(JSON.stringify(report)).not.toContain('export function auth');

    const md = formatDepositQaTelemetryMarkdown(report);
    expect(md).toContain('runId: run-1');
    expect(md).toContain('N→N=true');
    expect(md).not.toContain('export function auth');
  });

  it('flags batch admit N→N failures', () => {
    const report = buildDepositQaTelemetryReport({
      runId: 'run-2',
      status: 'complete',
      activity: emptyActivity(),
      options: [
        {
          optionId: 'a',
          title: 'A pack title here',
          commercialTitle: 'Commercial title A',
          commercialDescription:
            'Long enough commercial description for option A presentable pack.',
          measurements: [{ kind: 'function-count' }],
          contents: {
            fileChanges: [{ path: 'a.ts', op: 'modify', content: 'x' }],
            unifiedDiff: 'diff --git a/a.ts b/a.ts\n+\nx\n',
          },
          presentable: true,
        },
        {
          optionId: 'b',
          title: 'B pack title here',
          commercialTitle: 'Commercial title B',
          commercialDescription:
            'Long enough commercial description for option B presentable pack.',
          measurements: [{ kind: 'function-count' }],
          contents: {
            fileChanges: [{ path: 'b.ts', op: 'modify', content: 'y' }],
            unifiedDiff: 'diff --git a/b.ts b/b.ts\n+\ny\n',
          },
          presentable: true,
        },
      ],
      selectedOptionIds: ['a', 'b'],
      admissionReceipts: [
        { optionId: 'a', admission: { state: 'admitted-to-depository' } },
        {
          optionId: 'b',
          admission: {
            state: 'not-admitted-policy-blocked',
            blockers: ['policy'],
          },
        },
      ],
    });
    expect(report.admission.batchAdmitNtoN).toBe(false);
    expect(report.gaps.some((g) => g.includes('batch admit not N→N'))).toBe(
      true,
    );
  });
});
