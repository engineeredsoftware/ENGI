'use client';

/**
 * Gate 4 QA telemetry panel — exhaustive source-safe run summary for deposit.
 *
 * Surfaces phase continuum, Implementation agents, option materialization,
 * readiness, and admission N→N checks with one-click copy for the QA ledger.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildDepositQaTelemetryReport,
  formatDepositQaTelemetryMarkdown,
  type DepositQaTelemetryReport,
} from '@/components/deposits/models/deposit-qa-telemetry';
import type { PipelineRunActivitySnapshot } from '@/components/bitcode/pipeline/models/pipeline-run-activity';
import { copyTextToClipboard } from '@/components/bitcode/pipeline/PipelineExecutionLog/pipeline-execution-log-clipboard';
import { bitcodeQaTelemetry } from '@bitcode/auth/qa-telemetry';

export type DepositQaTelemetryPanelProps = {
  runId: string;
  status: string;
  error?: string | null;
  expectsOptions?: boolean;
  runStartMs?: number | null;
  runEndMs?: number | null;
  activity: PipelineRunActivitySnapshot;
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

function Chip({
  ok,
  label,
}: {
  ok: boolean | null;
  label: string;
}) {
  const tone =
    ok === null
      ? 'border-white/10 bg-black/20 text-neutral-400'
      : ok
        ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
        : 'border-amber-300/30 bg-amber-300/10 text-amber-100';
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] ${tone}`}
    >
      {label}
    </span>
  );
}

export function DepositQaTelemetryPanel(props: DepositQaTelemetryPanelProps) {
  const report: DepositQaTelemetryReport = useMemo(
    () =>
      buildDepositQaTelemetryReport({
        runId: props.runId,
        status: props.status,
        error: props.error,
        expectsOptions: props.expectsOptions,
        runStartMs: props.runStartMs,
        runEndMs: props.runEndMs,
        activity: props.activity,
        events: props.events,
        repositoryFullName: props.repositoryFullName,
        sourceBranch: props.sourceBranch,
        sourceCommit: props.sourceCommit,
        obfuscations: props.obfuscations,
        permissibleSources: props.permissibleSources,
        impermissibleSources: props.impermissibleSources,
        options: props.options,
        selectedOptionIds: props.selectedOptionIds,
        admissionReceipts: props.admissionReceipts,
      }),
    [
      props.runId,
      props.status,
      props.error,
      props.expectsOptions,
      props.runStartMs,
      props.runEndMs,
      props.activity,
      props.events,
      props.repositoryFullName,
      props.sourceBranch,
      props.sourceCommit,
      props.obfuscations,
      props.permissibleSources,
      props.impermissibleSources,
      props.options,
      props.selectedOptionIds,
      props.admissionReceipts,
    ],
  );

  const [copied, setCopied] = useState<'md' | 'json' | null>(null);
  const lastConsoleSignatureRef = useRef<string>('');

  // Verbose console trail for Gate 4 QA (enable via ?bitcode_verbose=true or
  // NEXT_PUBLIC_BITCODE_QA_VERBOSE=true / localStorage bitcode.qa.verbose).
  useEffect(() => {
    const signature = [
      report.run.runId,
      report.run.status,
      report.run.eventCount,
      report.options.optionCount,
      report.admission.admittedCount,
      report.gaps.join('|'),
    ].join(':');
    if (signature === lastConsoleSignatureRef.current) return;
    lastConsoleSignatureRef.current = signature;
    bitcodeQaTelemetry('info', 'deposit-qa', 'report', {
      runId: report.run.runId,
      status: report.run.status,
      qaReady: report.qaReady,
      phases: report.continuum.phasesObserved,
      phasesMissing: report.continuum.phasesMissing,
      implAgents: report.continuum.implementationAgentsObserved,
      options: {
        total: report.options.optionCount,
        presentable: report.options.presentableCount,
        commercial: report.options.commercialBriefCount,
        bodies: report.options.bodyCompleteCount,
      },
      admission: {
        selected: report.admission.selectedCount,
        admitted: report.admission.admittedCount,
        batchAdmitNtoN: report.admission.batchAdmitNtoN,
      },
      gaps: report.gaps,
    });
    if (report.gaps.length) {
      bitcodeQaTelemetry('warn', 'deposit-qa', 'gaps', report.gaps);
    }
  }, [report]);

  const copyMarkdown = async () => {
    const ok = await copyTextToClipboard(formatDepositQaTelemetryMarkdown(report));
    if (ok) {
      setCopied('md');
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  const copyJson = async () => {
    const ok = await copyTextToClipboard(JSON.stringify(report, null, 2));
    if (ok) {
      setCopied('json');
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  const durationLabel =
    typeof report.run.durationMs === 'number'
      ? `${Math.round(report.run.durationMs / 1000)}s`
      : '—';

  return (
    <div
      className="mt-3 border border-sky-300/20 bg-sky-300/[0.04] px-3 py-3"
      data-testid="deposit-qa-telemetry-panel"
      aria-label="Deposit QA telemetry"
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sky-100/90">
            QA telemetry · Gate 4 deposit
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-300">
            Source-safe reconstructible report for experiential QA (phases,
            Implementation agents, option materialization, admit N→N). No
            bodies, prompts, or secrets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip ok={report.qaReady} label={report.qaReady ? 'qa ready' : 'qa gaps'} />
          <Chip
            ok={report.continuum.phaseContinuityComplete}
            label={
              report.continuum.phaseContinuityComplete
                ? 'phases complete'
                : `phases missing ${report.continuum.phasesMissing.length}`
            }
          />
          <Chip
            ok={report.continuum.implementationSequenceComplete}
            label={
              report.continuum.implementationSequenceComplete
                ? 'impl agents'
                : `impl missing ${report.continuum.implementationAgentsMissing.length}`
            }
          />
          <button
            type="button"
            data-testid="deposit-qa-telemetry-copy-md"
            onClick={() => {
              void copyMarkdown();
            }}
            className="border border-sky-300/30 bg-sky-300/10 px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200/45 hover:bg-sky-300/18"
          >
            {copied === 'md' ? 'Copied MD' : 'Copy QA MD'}
          </button>
          <button
            type="button"
            data-testid="deposit-qa-telemetry-copy-json"
            onClick={() => {
              void copyJson();
            }}
            className="border border-white/15 bg-black/25 px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-neutral-200 transition hover:border-white/25 hover:bg-black/35"
          >
            {copied === 'json' ? 'Copied JSON' : 'Copy QA JSON'}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-white/8 bg-black/20 px-2.5 py-2">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500">
            Run
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-neutral-200">
            {report.run.status} · {durationLabel}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] text-neutral-500">
            evt {report.run.eventCount} · log {report.run.logLineCount} · gen{' '}
            {report.run.generationCount}
          </p>
        </div>
        <div className="border border-white/8 bg-black/20 px-2.5 py-2">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500">
            Continuum
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-neutral-200">
            {report.continuum.phasesObserved.join(' → ') || '—'}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] text-neutral-500">
            impl:{' '}
            {report.continuum.implementationAgentsObserved.join(', ') || '—'}
          </p>
        </div>
        <div className="border border-white/8 bg-black/20 px-2.5 py-2">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500">
            Options
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-neutral-200">
            {report.options.presentableCount}/{report.options.optionCount}{' '}
            presentable
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] text-neutral-500">
            commercial {report.options.commercialBriefCount} · bodies{' '}
            {report.options.bodyCompleteCount} · diff{' '}
            {report.options.unifiedDiffCount}
          </p>
        </div>
        <div className="border border-white/8 bg-black/20 px-2.5 py-2">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500">
            Admission
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-neutral-200">
            selected {report.admission.selectedCount} · admitted{' '}
            {report.admission.admittedCount}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] text-neutral-500">
            N→N {String(report.admission.batchAdmitNtoN)} · soft warnings{' '}
            {report.admission.softWarningCount}
          </p>
        </div>
      </div>

      {report.gaps.length > 0 ? (
        <ul
          className="mt-3 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-100/90"
          data-testid="deposit-qa-telemetry-gaps"
        >
          {report.gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-emerald-100/85">
          No QA gaps detected on source-safe continuum + materialization
          checks.
        </p>
      )}

      {report.options.materializations.length > 0 ? (
        <div className="mt-3 max-h-40 overflow-auto border border-white/8 bg-black/25">
          <table className="w-full min-w-[40rem] border-collapse text-left text-[0.62rem] text-neutral-300">
            <thead className="sticky top-0 bg-black/80 font-mono uppercase tracking-[0.12em] text-neutral-500">
              <tr>
                <th className="px-2 py-1.5">Option</th>
                <th className="px-2 py-1.5">OK</th>
                <th className="px-2 py-1.5">Commercial</th>
                <th className="px-2 py-1.5">Abs</th>
                <th className="px-2 py-1.5">Diff</th>
                <th className="px-2 py-1.5">Bodies</th>
              </tr>
            </thead>
            <tbody>
              {report.options.materializations.map((m) => (
                <tr key={m.optionId} className="border-t border-white/5">
                  <td
                    className="max-w-[14rem] truncate px-2 py-1 font-mono text-neutral-200"
                    title={m.title}
                  >
                    {/* Prefer optionId in UI so product title text stays unique
                        on the option card (RTL getByText). Full title in title=. */}
                    {m.optionId}
                  </td>
                  <td className="px-2 py-1">{m.presentable ? 'Y' : 'N'}</td>
                  <td className="px-2 py-1">
                    {m.hasCommercialTitle && m.hasCommercialDescription
                      ? 'Y'
                      : 'N'}
                  </td>
                  <td className="px-2 py-1">{m.absoluteCount}</td>
                  <td className="px-2 py-1">{m.hasUnifiedDiff ? 'Y' : 'N'}</td>
                  <td className="px-2 py-1">
                    {m.hasFileBodies || m.bodiesComplete ? 'Y' : 'N'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default DepositQaTelemetryPanel;
