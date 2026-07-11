'use client';

import React from 'react';
import { useMemo, useState } from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';
import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/disabled-tooltip-wrapper';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import {
  buildTerminalClosureAssetPackCompletion,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
} from './terminal-activity-history';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from './terminal-workspace-explainers';
import { jumpToShellSection } from './terminal-shell-reading';
import {
  normalizeTerminalClosureState,
  type TerminalClosureState,
} from './terminal-closure-state';
import {
  normalizeTerminalCommandState,
  type TerminalCommandState,
} from './terminal-command-state';
import { useTerminalShellBridge } from './terminal-shell-bridge';
import {
  normalizeTerminalClosureControlState,
  type TerminalClosureControlState,
} from './terminal-closure-controls';
import type { BitcodeTransactionReadiness } from './bitcode-transaction-readiness';

function toneClasses(tone: TerminalClosureControlState['statusTone']) {
  if (tone === 'settled') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100';
  if (tone === 'running') return 'border-amber-500/25 bg-amber-500/10 text-amber-100';
  if (tone === 'attention') return 'border-red-500/25 bg-red-500/10 text-red-100';
  return 'border-sky-500/25 bg-sky-500/10 text-sky-100';
}

interface TerminalActionButtonProps {
  children: React.ReactNode;
  className: string;
  disabled: boolean;
  disabledTooltip?: string;
  onClick: () => void;
}

function TerminalActionButton({
  children,
  className,
  disabled,
  disabledTooltip,
  onClick,
}: TerminalActionButtonProps) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${className} w-full disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );

  if (!disabled || !disabledTooltip) return button;

  return (
    <DisabledTooltipWrapper tooltip={disabledTooltip} placement="top" className="block w-full">
      {button}
    </DisabledTooltipWrapper>
  );
}

interface TerminalClosureControlDeckProps {
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  transactionReadiness: BitcodeTransactionReadiness;
  showDemonstrationControls?: boolean;
}

export default function TerminalClosureControlDeck({
  onRecordActivity,
  transactionReadiness,
  showDemonstrationControls = true,
}: TerminalClosureControlDeckProps) {
  const { snapshot, runControl } = useTerminalShellBridge();
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const commandState = useMemo<TerminalCommandState | null>(
    () => (showDemonstrationControls ? normalizeTerminalCommandState(snapshot) : null),
    [showDemonstrationControls, snapshot],
  );
  const closureState = useMemo<TerminalClosureState | null>(
    () => (showDemonstrationControls ? normalizeTerminalClosureState(snapshot) : null),
    [showDemonstrationControls, snapshot],
  );
  const handleControlAction = async (
    callback: Parameters<typeof runControl>[0],
  ) => {
    setIsActing(true);
    try {
      await runControl(callback);
    } finally {
      setIsActing(false);
    }
  };

  const state = normalizeTerminalClosureControlState(commandState, closureState);
  const settlementReady = transactionReadiness.canSettle;
  const primaryActionDisabled = isActing || !state.shellReady || !settlementReady;
  const witnessActionDisabled = isActing || !state.shellReady;
  const primaryActionDisabledTooltip = isActing
    ? 'Disabled while closure is already running. When it finishes, this button can run the Make Bitcode branch write again.'
    : !state.shellReady
      ? 'Disabled while the Terminal protocol witness is syncing. When enabled, this runs closure from Read review through branch, settlement, and proof.'
      : !settlementReady
        ? `${transactionReadiness.summary} When enabled, this runs the Make Bitcode branch write and records the closure result.`
        : undefined;
  const witnessActionDisabledTooltip = isActing
    ? 'Disabled while another closure action is running. When enabled, this control refreshes or resets the local Terminal protocol witness.'
    : !state.shellReady
      ? 'Disabled while the Terminal protocol witness is syncing. When enabled, this control talks to the proof and settlement witness.'
      : undefined;
  const handlePrimaryClosureAction = async () => {
    if (!settlementReady) {
      setActionError(transactionReadiness.summary);
      return;
    }

    setIsActing(true);
    setActionError(null);

    try {
      const response = await fetch('/api/make-bitcode-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchMode: commandState?.branchMode || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readTerminalRouteError(response, 'Unable to run the closure branch activity.'),
        );
      }

      const payload = (await response.json()) as Record<string, unknown>;
      await runControl((controls) => controls.refresh?.());
      await onRecordActivity?.({
        type: 'agentic-execution:asset-pack',
        detailSection: 'closure',
        summary: state.primaryActionSummary,
        context: {
          source: 'terminal-closure-control-deck',
          branchMode: commandState?.branchMode || null,
          scenario: commandState?.scenario || null,
          specVersion: payload.specVersion ?? null,
        },
          output: {
            protocol: {
              ok: payload.ok ?? true,
              latestRun: payload.latestRun ?? null,
            },
            assetPackCompletion: buildTerminalClosureAssetPackCompletion(closureState),
          },
        });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to run the closure branch activity.',
      );
    } finally {
      setIsActing(false);
    }
  };

  return (
    <TerminalWorkspaceCard
      id="terminalClosureControls"
      kicker="Closure controls"
      title="Run closure and settlement follow-through"
      summary="Keep verification, branch execution, settlement review, and ledger follow-through adjacent to the active Bitcode activity result."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.closureControls}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            { label: 'Scenario', value: state.scenario },
            { label: 'Branch mode', value: state.branchMode },
          ]}
          columnsClassName="tablet:grid-cols-2"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >

      <div className="mt-6 grid gap-5">
        <article className="rounded-[1.6rem] border border-white/8 bg-black/20 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">Closure status</p>
                <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.closureAction} />
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">{state.primaryActionLabel}</h3>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.18em] ${toneClasses(state.statusTone)}`}>
              {state.statusTone}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-neutral-300">{state.primaryActionSummary}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.1rem] border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Visible artifacts</p>
              <p className="mt-2 text-base font-semibold text-white">{state.visibleArtifactCount}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Proof families</p>
              <p className="mt-2 text-base font-semibold text-white">{state.proofFamilyCount}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Credited assets</p>
              <p className="mt-2 text-base font-semibold text-white">{state.creditedAssetCount}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Bundle</p>
              <p className="mt-2 break-all text-base font-semibold text-white">{state.bundleId}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <TerminalActionButton
              disabled={primaryActionDisabled}
              disabledTooltip={primaryActionDisabledTooltip}
              onClick={() => {
                void handlePrimaryClosureAction();
              }}
              className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-left text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
            >
              {isActing ? 'Running closure…' : state.primaryActionLabel}
            </TerminalActionButton>
            <TerminalActionButton
              disabled={witnessActionDisabled}
              disabledTooltip={witnessActionDisabledTooltip}
              onClick={() => {
                void handleControlAction((controls) => controls.refresh?.());
              }}
              className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10"
            >
              Refresh closure
            </TerminalActionButton>
            <TerminalActionButton
              disabled={witnessActionDisabled}
              disabledTooltip={witnessActionDisabledTooltip}
              onClick={() => {
                void handleControlAction((controls) => controls.resetTerminal?.());
              }}
              className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10"
            >
              Reset closure state
            </TerminalActionButton>
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4 text-sm">
            <p className="text-neutral-500">Witness status</p>
            <p className="mt-2 text-neutral-100">{state.status}</p>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-neutral-500">Transaction readiness</p>
              <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.transactionReadiness} />
            </div>
            <p className="mt-1 text-neutral-100">{transactionReadiness.summary}</p>
            <p className="mt-3 text-neutral-500">Flow continuity</p>
            <p className="mt-1 text-neutral-100">{state.flowGuideDetail}</p>
            {actionError ? (
              <>
                <p className="mt-3 text-neutral-500">Ledger write</p>
                <p className="mt-1 text-red-200">{actionError}</p>
              </>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.6rem] border border-white/8 bg-black/20 px-5 py-5">
          <div className="flex items-center gap-2">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Closure follow-through</p>
            <BitcodeInlineExplainer explainer={TERMINAL_WORKSPACE_EXPLAINERS.closureMap} />
          </div>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => jumpToShellSection('panelEvaluations')}
              className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
            >
              Focus live verification detail
            </button>
            <button
              type="button"
              onClick={() => jumpToShellSection('panelBranchArtifacts')}
              className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
            >
              Focus live branch detail
            </button>
            <button
              type="button"
              onClick={() => jumpToShellSection('panelSettlement')}
              className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
            >
              Focus live settlement detail
            </button>
            <button
              type="button"
              onClick={() => jumpToShellSection('panelLedger')}
              className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-neutral-100 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
            >
              Focus live ledger detail
            </button>
          </div>
        </article>
      </div>
    </TerminalWorkspaceCard>
  );
}
