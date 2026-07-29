/**
 * Gate 4 QA telemetry — source-safe exhaustive run report for depositor
 * website completion.
 *
 * Builds a reconstructible snapshot from live stream activity, option
 * materialization, and admission state so experiential QA can prove:
 *   connect → synthesize (phases + Implementation agents) → commercial review
 *   → batch admit → exchange projection readiness (counts only here).
 *
 * Never includes protected source bodies, raw prompts, provider payloads, or
 * wallet secrets — only ids, counts, booleans, phase/agent names, roots.
 */

import type { PipelineRunActivitySnapshot } from '@/components/bitcode/pipeline/models/pipeline-run-activity';

/** SDIVF continuum expected for a healthy deposit synthesis run. */
export const DEPOSIT_QA_PHASE_CONTINUUM = [
  'setup',
  'discovery',
  'implementation',
  'validation',
  'finish',
] as const;

export type DepositQaPhaseId = (typeof DEPOSIT_QA_PHASE_CONTINUUM)[number];

/**
 * Implementation agent markers (substring match on agent/step labels).
 * Order matches product law: plan → patchfile → measurements → commercial-nl.
 */
export const DEPOSIT_QA_IMPLEMENTATION_AGENTS = [
  {
    id: 'patch-plan',
    label: 'patch-plan',
    patterns: ['patch-plan', 'patchplan', 'implementation-agent-asset-packs-plan', 'plan'],
  },
  {
    id: 'patchfile',
    label: 'patchfile',
    patterns: ['patchfile', 'patch-file', 'write-artifact', 'asset-packs-patchfile'],
  },
  {
    id: 'measurements',
    label: 'measurements',
    patterns: ['measurements', 'measure', 'absolutes'],
  },
  {
    id: 'commercial-nl',
    label: 'commercial-nl',
    patterns: ['commercial-nl', 'commercial_nl', 'commercialnl', 'commercial-nl-agent'],
  },
] as const;

export type DepositQaImplementationAgentId =
  (typeof DEPOSIT_QA_IMPLEMENTATION_AGENTS)[number]['id'];

export type DepositQaOptionMaterialization = {
  optionId: string;
  title: string;
  presentable: boolean;
  hasCommercialTitle: boolean;
  hasCommercialDescription: boolean;
  absoluteCount: number;
  fileChangeCount: number;
  hasUnifiedDiff: boolean;
  hasFileBodies: boolean;
  bodiesComplete: boolean | null;
  hasDeleteOps: boolean;
};

export type DepositQaAdmissionSnapshot = {
  selectedCount: number;
  selectedOptionIds: string[];
  admittedCount: number;
  admittedOptionIds: string[];
  blockedCount: number;
  pendingCount: number;
  softWarningCount: number;
  /** True when selectedCount > 0 and admittedCount === selectedCount for selected set. */
  batchAdmitNtoN: boolean | null;
};

export type DepositQaTelemetryReport = {
  schema: 'bitcode.deposit.qa-telemetry-report';
  version: 1;
  sourceSafetyClass: 'source_safe_deposit_qa_metadata';
  generatedAt: string;
  run: {
    runId: string;
    status: string;
    error: string | null;
    expectsOptions: boolean;
    durationMs: number | null;
    eventCount: number;
    logLineCount: number;
    generationCount: number;
    currentIteration: number | null;
    livePhase: string | null;
    liveAgent: string | null;
    liveStep: string | null;
  };
  source: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    obfuscationsChars: number;
    permissiblePathCount: number;
    impermissiblePathCount: number;
  };
  continuum: {
    phasesObserved: DepositQaPhaseId[];
    phasesMissing: DepositQaPhaseId[];
    phaseContinuityComplete: boolean;
    implementationAgentsObserved: DepositQaImplementationAgentId[];
    implementationAgentsMissing: DepositQaImplementationAgentId[];
    implementationSequenceComplete: boolean;
  };
  options: {
    optionCount: number;
    presentableCount: number;
    commercialBriefCount: number;
    bodyCompleteCount: number;
    unifiedDiffCount: number;
    deleteOpCount: number;
    materializations: DepositQaOptionMaterialization[];
  };
  readiness: {
    verdictCount: number;
    latestApproved: boolean | null;
    latestRecommendation: string | null;
    latestQualityScore: number | null;
    latestWarningsCount: number | null;
    latestReasons: string[];
  };
  admission: DepositQaAdmissionSnapshot;
  gaps: string[];
  /** True when continuum + (if expects options) materialization bar is green. */
  qaReady: boolean;
};

export type DepositQaTelemetryInput = {
  runId: string;
  status: string;
  error?: string | null;
  expectsOptions?: boolean;
  runStartMs?: number | null;
  runEndMs?: number | null;
  nowMs?: number;
  activity: Pick<
    PipelineRunActivitySnapshot,
    | 'outputDetails'
    | 'generationCount'
    | 'currentIteration'
    | 'readyToFinishVerdicts'
    | 'latestContext'
    | 'error'
  >;
  events?: unknown[] | null;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  obfuscations?: string | null;
  permissibleSources?: string[] | null;
  impermissibleSources?: string[] | null;
  options?: unknown[] | null;
  selectedOptionIds?: string[] | null;
  admissionReceipts?: Array<{
    optionId?: string;
    admission?: {
      state?: string;
      blockers?: string[];
      warnings?: string[];
    };
  }> | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function lower(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function collectTextBlobs(input: {
  activity: DepositQaTelemetryInput['activity'];
  events: unknown[] | null | undefined;
}): string[] {
  const blobs: string[] = [];
  const ctx = input.activity.latestContext;
  if (ctx) {
    blobs.push(lower(ctx.phase), lower(ctx.agent), lower(ctx.step));
  }
  for (const [key, detail] of Object.entries(input.activity.outputDetails || {})) {
    blobs.push(lower(key));
    const row = asRecord(detail);
    if (!row) continue;
    blobs.push(lower(row.phase), lower(row.agent), lower(row.step), lower(row.message));
    const es = asRecord(row.executionState);
    if (es) {
      blobs.push(lower(es.phase), lower(es.agent), lower(es.step));
    }
  }
  for (const event of input.events || []) {
    const envelope = asRecord(event);
    const payload = asRecord(envelope?.event) ?? envelope;
    if (!payload) continue;
    blobs.push(lower(payload.type), lower(payload.phase), lower(payload.agent), lower(payload.step));
    const data = asRecord(payload.data);
    if (data) {
      blobs.push(lower(data.phase), lower(data.agent), lower(data.step), lower(data.name));
    }
    const es = asRecord(payload.executionState);
    if (es) {
      blobs.push(lower(es.phase), lower(es.agent), lower(es.step));
    }
    const store = asRecord(payload.store) ?? asRecord(payload);
    if (store) {
      blobs.push(lower(store.namespace), lower(store.key), lower(store.value));
    }
  }
  return blobs.filter(Boolean);
}

export function detectDepositQaPhases(blobs: string[]): DepositQaPhaseId[] {
  const joined = blobs.join(' | ');
  const observed: DepositQaPhaseId[] = [];
  for (const phase of DEPOSIT_QA_PHASE_CONTINUUM) {
    if (joined.includes(phase)) observed.push(phase);
  }
  return observed;
}

export function detectDepositQaImplementationAgents(
  blobs: string[],
): DepositQaImplementationAgentId[] {
  const joined = blobs.join(' | ');
  const observed: DepositQaImplementationAgentId[] = [];
  for (const agent of DEPOSIT_QA_IMPLEMENTATION_AGENTS) {
    // Prefer specific markers first; "plan" alone is last resort for patch-plan.
    const hit = agent.patterns.some((pattern) => {
      if (pattern === 'plan') {
        return (
          joined.includes('patch-plan') ||
          (joined.includes('implementation') && joined.includes('plan'))
        );
      }
      if (pattern === 'measure') {
        return joined.includes('measure') || joined.includes('measurements');
      }
      return joined.includes(pattern);
    });
    if (hit) observed.push(agent.id);
  }
  return observed;
}

function projectOptionMaterialization(option: unknown): DepositQaOptionMaterialization | null {
  const row = asRecord(option);
  if (!row) return null;
  const optionId =
    (typeof row.optionId === 'string' && row.optionId.trim()) ||
    (typeof row.id === 'string' && row.id.trim()) ||
    '';
  if (!optionId) return null;

  const commercialTitle =
    typeof row.commercialTitle === 'string' ? row.commercialTitle.trim() : '';
  const commercialDescription =
    typeof row.commercialDescription === 'string'
      ? row.commercialDescription.trim()
      : '';
  const title =
    commercialTitle ||
    (typeof row.title === 'string' ? row.title.trim() : '') ||
    optionId;

  const measurements = Array.isArray(row.measurements)
    ? row.measurements
    : Array.isArray(asRecord(row.measurements)?.absolutes)
      ? (asRecord(row.measurements)?.absolutes as unknown[])
      : [];

  const contents = asRecord(row.contents);
  const fileChanges = Array.isArray(contents?.fileChanges)
    ? (contents?.fileChanges as unknown[])
    : [];
  const unifiedDiff =
    typeof contents?.unifiedDiff === 'string' ? contents.unifiedDiff : '';
  const hasUnifiedDiff =
    unifiedDiff.includes('diff --git') &&
    (unifiedDiff.includes('\n+') || unifiedDiff.includes('\n-'));
  const hasFileBodies = fileChanges.some((change) => {
    const c = asRecord(change);
    return typeof c?.content === 'string' && c.content.length > 0;
  });
  const hasDeleteOps = fileChanges.some((change) => {
    const c = asRecord(change);
    return lower(c?.op) === 'delete';
  });

  const patchArtifact = asRecord(row.patchArtifact);
  const bodiesComplete =
    typeof patchArtifact?.bodiesComplete === 'boolean'
      ? patchArtifact.bodiesComplete
      : typeof contents?.bodiesComplete === 'boolean'
        ? (contents.bodiesComplete as boolean)
        : hasFileBodies
          ? true
          : null;

  const salvaged = row.salvaged === true;
  const presentable =
    row.presentable === true ||
    (!salvaged &&
      fileChanges.length > 0 &&
      !hasDeleteOps &&
      (bodiesComplete === true || hasFileBodies || hasUnifiedDiff));

  return {
    optionId,
    title,
    presentable,
    hasCommercialTitle: commercialTitle.length >= 8,
    hasCommercialDescription: commercialDescription.length >= 40,
    absoluteCount: measurements.length,
    fileChangeCount: fileChanges.length,
    hasUnifiedDiff,
    hasFileBodies,
    bodiesComplete,
    hasDeleteOps,
  };
}

function projectAdmission(input: {
  selectedOptionIds: string[];
  receipts: NonNullable<DepositQaTelemetryInput['admissionReceipts']>;
}): DepositQaAdmissionSnapshot {
  const selected = [...new Set(input.selectedOptionIds.filter(Boolean))];
  const admittedOptionIds: string[] = [];
  let blockedCount = 0;
  let pendingCount = 0;
  let softWarningCount = 0;

  for (const receipt of input.receipts || []) {
    const optionId = typeof receipt.optionId === 'string' ? receipt.optionId : '';
    const state = lower(receipt.admission?.state);
    if (state === 'admitted-to-depository') {
      if (optionId) admittedOptionIds.push(optionId);
    } else if (state.includes('blocked') || state.includes('rejected')) {
      blockedCount += 1;
    } else if (state.includes('pending') || !state) {
      pendingCount += 1;
    }
    softWarningCount += Array.isArray(receipt.admission?.warnings)
      ? receipt.admission!.warnings!.length
      : 0;
  }

  const selectedAdmitted =
    selected.length === 0
      ? null
      : selected.every((id) => admittedOptionIds.includes(id)) &&
        admittedOptionIds.filter((id) => selected.includes(id)).length ===
          selected.length;

  return {
    selectedCount: selected.length,
    selectedOptionIds: selected,
    admittedCount: admittedOptionIds.length,
    admittedOptionIds,
    blockedCount,
    pendingCount,
    softWarningCount,
    batchAdmitNtoN: selectedAdmitted,
  };
}

export function buildDepositQaTelemetryReport(
  input: DepositQaTelemetryInput,
): DepositQaTelemetryReport {
  const nowMs = input.nowMs ?? Date.now();
  const events = Array.isArray(input.events) ? input.events : [];
  const blobs = collectTextBlobs({ activity: input.activity, events });
  const phasesObserved = detectDepositQaPhases(blobs);
  const phasesMissing = DEPOSIT_QA_PHASE_CONTINUUM.filter(
    (phase) => !phasesObserved.includes(phase),
  );
  const implementationAgentsObserved = detectDepositQaImplementationAgents(blobs);
  const implementationAgentsMissing = DEPOSIT_QA_IMPLEMENTATION_AGENTS.map((a) => a.id).filter(
    (id) => !implementationAgentsObserved.includes(id),
  );

  const materializations = (Array.isArray(input.options) ? input.options : [])
    .map(projectOptionMaterialization)
    .filter((row): row is DepositQaOptionMaterialization => Boolean(row));

  const admission = projectAdmission({
    selectedOptionIds: Array.isArray(input.selectedOptionIds)
      ? input.selectedOptionIds
      : [],
    receipts: Array.isArray(input.admissionReceipts) ? input.admissionReceipts : [],
  });

  const latestVerdict =
    input.activity.readyToFinishVerdicts[
      input.activity.readyToFinishVerdicts.length - 1
    ] ?? null;

  const durationMs =
    typeof input.runStartMs === 'number'
      ? Math.max(
          0,
          (typeof input.runEndMs === 'number' ? input.runEndMs : nowMs) -
            input.runStartMs,
        )
      : null;

  const gaps: string[] = [];
  if (phasesMissing.length) {
    gaps.push(`phase continuum missing: ${phasesMissing.join(', ')}`);
  }
  if (implementationAgentsMissing.length && phasesObserved.includes('implementation')) {
    gaps.push(
      `implementation agents missing: ${implementationAgentsMissing.join(', ')}`,
    );
  }
  if (input.expectsOptions !== false) {
    if (materializations.length === 0 && lower(input.status) === 'complete') {
      gaps.push('no option materializations after complete');
    }
    const thinCommercial = materializations.filter(
      (m) => m.presentable && (!m.hasCommercialTitle || !m.hasCommercialDescription),
    );
    if (thinCommercial.length) {
      gaps.push(`${thinCommercial.length} presentable option(s) lack commercial brief`);
    }
    const thinBodies = materializations.filter(
      (m) => m.presentable && !m.hasUnifiedDiff && !m.hasFileBodies,
    );
    if (thinBodies.length) {
      gaps.push(`${thinBodies.length} presentable option(s) lack patch bodies/diff`);
    }
    const withDeletes = materializations.filter((m) => m.hasDeleteOps);
    if (withDeletes.length) {
      gaps.push(`${withDeletes.length} option(s) include delete ops (non-commercial)`);
    }
  }
  if (admission.selectedCount > 0 && admission.batchAdmitNtoN === false) {
    gaps.push(
      `batch admit not N→N (selected=${admission.selectedCount}, admitted-selected=${admission.admittedOptionIds.filter((id) => admission.selectedOptionIds.includes(id)).length})`,
    );
  }
  if (input.error || input.activity.error) {
    gaps.push('run error present');
  }

  const phaseContinuityComplete = phasesMissing.length === 0;

  const commercialBriefCount = materializations.filter(
    (m) => m.hasCommercialTitle && m.hasCommercialDescription,
  ).length;
  const bodyCompleteCount = materializations.filter(
    (m) => m.bodiesComplete === true || m.hasFileBodies || m.hasUnifiedDiff,
  ).length;

  const qaReady =
    gaps.filter((g) => !g.startsWith('batch admit')).length === 0 &&
    (lower(input.status) !== 'complete' ||
      input.expectsOptions === false ||
      materializations.some((m) => m.presentable));

  return {
    schema: 'bitcode.deposit.qa-telemetry-report',
    version: 1,
    sourceSafetyClass: 'source_safe_deposit_qa_metadata',
    generatedAt: new Date(nowMs).toISOString(),
    run: {
      runId: input.runId,
      status: input.status,
      error: input.error || input.activity.error || null,
      expectsOptions: input.expectsOptions !== false,
      durationMs,
      eventCount: events.length,
      logLineCount: Object.keys(input.activity.outputDetails || {}).length,
      generationCount: input.activity.generationCount || 0,
      currentIteration: input.activity.currentIteration,
      livePhase: input.activity.latestContext?.phase ?? null,
      liveAgent: input.activity.latestContext?.agent ?? null,
      liveStep: input.activity.latestContext?.step ?? null,
    },
    source: {
      repositoryFullName: input.repositoryFullName ?? null,
      sourceBranch: input.sourceBranch ?? null,
      sourceCommit: input.sourceCommit ?? null,
      obfuscationsChars: (input.obfuscations || '').trim().length,
      permissiblePathCount: (input.permissibleSources || []).length,
      impermissiblePathCount: (input.impermissibleSources || []).length,
    },
    continuum: {
      phasesObserved,
      phasesMissing,
      phaseContinuityComplete,
      implementationAgentsObserved,
      implementationAgentsMissing,
      implementationSequenceComplete:
        phasesObserved.includes('implementation')
          ? implementationAgentsMissing.length === 0
          : true,
    },
    options: {
      optionCount: materializations.length,
      presentableCount: materializations.filter((m) => m.presentable).length,
      commercialBriefCount,
      bodyCompleteCount,
      unifiedDiffCount: materializations.filter((m) => m.hasUnifiedDiff).length,
      deleteOpCount: materializations.filter((m) => m.hasDeleteOps).length,
      materializations,
    },
    readiness: {
      verdictCount: input.activity.readyToFinishVerdicts.length,
      latestApproved:
        latestVerdict == null
          ? null
          : latestVerdict.finalApproval === true ||
            lower(latestVerdict.recommendation) === 'finish' ||
            lower(latestVerdict.recommendation) === 'complete',
      latestRecommendation: latestVerdict?.recommendation ?? null,
      latestQualityScore: latestVerdict?.qualityScore ?? null,
      latestWarningsCount: latestVerdict?.warningsCount ?? null,
      latestReasons: latestVerdict?.reasons ?? [],
    },
    admission,
    gaps,
    qaReady,
  };
}

/** Markdown ledger blob for copy-paste into `.qa/` notes. */
export function formatDepositQaTelemetryMarkdown(
  report: DepositQaTelemetryReport,
): string {
  const lines: string[] = [
    '### Gate 4 deposit QA telemetry',
    `- generatedAt: ${report.generatedAt}`,
    `- runId: ${report.run.runId}`,
    `- status: ${report.run.status}`,
    `- durationMs: ${report.run.durationMs ?? '—'}`,
    `- events/logLines/generations: ${report.run.eventCount}/${report.run.logLineCount}/${report.run.generationCount}`,
    `- live: phase=${report.run.livePhase ?? '—'} agent=${report.run.liveAgent ?? '—'} step=${report.run.liveStep ?? '—'}`,
    `- source: ${report.source.repositoryFullName ?? '—'} @ ${report.source.sourceBranch ?? '—'} @ ${report.source.sourceCommit ?? '—'}`,
    `- paths: permissible=${report.source.permissiblePathCount} impermissible=${report.source.impermissiblePathCount} obfuscationsChars=${report.source.obfuscationsChars}`,
    `- phases observed: ${report.continuum.phasesObserved.join(', ') || '—'}`,
    `- phases missing: ${report.continuum.phasesMissing.join(', ') || 'none'}`,
    `- implementation agents: ${report.continuum.implementationAgentsObserved.join(', ') || '—'}`,
    `- implementation missing: ${report.continuum.implementationAgentsMissing.join(', ') || 'none'}`,
    `- options: total=${report.options.optionCount} presentable=${report.options.presentableCount} commercial=${report.options.commercialBriefCount} bodies=${report.options.bodyCompleteCount} unifiedDiff=${report.options.unifiedDiffCount} deletes=${report.options.deleteOpCount}`,
    `- readiness: verdicts=${report.readiness.verdictCount} approved=${String(report.readiness.latestApproved)} rec=${report.readiness.latestRecommendation ?? '—'}`,
    `- admission: selected=${report.admission.selectedCount} admitted=${report.admission.admittedCount} blocked=${report.admission.blockedCount} softWarnings=${report.admission.softWarningCount} N→N=${String(report.admission.batchAdmitNtoN)}`,
    `- qaReady: ${report.qaReady}`,
    `- gaps: ${report.gaps.length ? report.gaps.join('; ') : 'none'}`,
  ];
  if (report.options.materializations.length) {
    lines.push('- options detail:');
    for (const m of report.options.materializations) {
      lines.push(
        `  - ${m.optionId}: presentable=${m.presentable} commercial=${m.hasCommercialTitle && m.hasCommercialDescription} absolutes=${m.absoluteCount} files=${m.fileChangeCount} diff=${m.hasUnifiedDiff} bodies=${m.hasFileBodies} bodiesComplete=${String(m.bodiesComplete)} deletes=${m.hasDeleteOps} · ${m.title}`,
      );
    }
  }
  if (report.run.error) {
    lines.push(`- error: ${report.run.error}`);
  }
  lines.push('');
  return lines.join('\n');
}
