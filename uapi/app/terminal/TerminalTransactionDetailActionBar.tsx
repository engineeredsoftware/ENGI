'use client';

import React from 'react';

import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/disabled-tooltip-wrapper';

import type { TerminalTransactionDetailSection } from './terminal-transaction-query';

type DetailAction = {
  id: TerminalTransactionDetailSection;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
};

const DETAIL_ACTIONS: DetailAction[] = [
  { id: 'shippables', label: 'Shippables' },
  { id: 'transaction', label: 'Identity' },
  { id: 'authority', label: 'Authority' },
  { id: 'closure', label: 'Closure' },
  { id: 'proofs', label: 'Proofs' },
  { id: 'history', label: 'History' },
  { id: 'journal', label: 'Journal' },
  { id: 'activity', label: 'Execution stream' },
  { id: 'console', label: 'Console' },
];

interface TerminalTransactionDetailActionBarProps {
  activeSection: TerminalTransactionDetailSection;
  detailActions?: DetailAction[];
  onChangeSection: (section: TerminalTransactionDetailSection) => void;
  onRunClosure: () => void;
  onRefreshDetail: () => void;
  isActing: boolean;
  shellReady: boolean;
  mockMode: boolean;
  surface?: 'terminal' | 'exchange';
}

export default function TerminalTransactionDetailActionBar({
  activeSection,
  detailActions = DETAIL_ACTIONS,
  onChangeSection,
  onRunClosure,
  onRefreshDetail,
  isActing,
  shellReady,
  mockMode,
  surface = 'terminal',
}: TerminalTransactionDetailActionBarProps) {
  const visibleActions = mockMode
    ? detailActions.map((action) =>
        action.id === 'console'
          ? {
              ...action,
              disabled: true,
              disabledReason: action.disabledReason || 'Console detail is available only for live execution-history rows.',
            }
          : action,
      )
    : detailActions;
  const isExchangeSurface = surface === 'exchange';
  const witnessActionDisabled = isActing || !shellReady;
  const witnessActionDisabledTooltip = isActing
    ? 'Disabled while closure is already running. When enabled, this button writes or refreshes the selected activity result.'
    : !shellReady
      ? 'Disabled while the Terminal protocol witness is syncing. When enabled, this button writes or refreshes the selected activity result.'
      : undefined;
  const runClosureButton = (
    <button
      type="button"
      disabled={witnessActionDisabled}
      onClick={onRunClosure}
      className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isActing ? 'Running closure…' : 'Re-run closure'}
    </button>
  );
  const refreshButton = (
    <button
      type="button"
      disabled={witnessActionDisabled}
      onClick={onRefreshDetail}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Refresh result
    </button>
  );

  return (
    <section
      data-testid="terminal-detail-action-bar"
      aria-labelledby="terminalDetailActionBarTitle"
      className="rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">
            {isExchangeSurface ? 'Exchange detail interaction' : 'Activity interaction'}
          </p>
          <h3 id="terminalDetailActionBarTitle" className="mt-1.5 text-lg font-semibold text-white">
            {isExchangeSurface ? 'Route-owned Exchange detail focus' : 'Route-owned result focus and closure actions'}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
            {isExchangeSurface
              ? 'Switch detail focus for the selected Exchange activity while preserving the route-owned master selection.'
              : 'Switch result focus, rerun closure, and refresh the selected Bitcode activity from the same place you read it.'}
          </p>
        </div>

        {!isExchangeSurface ? (
          <div className="flex flex-wrap items-center gap-2">
            {witnessActionDisabled && witnessActionDisabledTooltip ? (
              <DisabledTooltipWrapper tooltip={witnessActionDisabledTooltip} placement="top">
                {runClosureButton}
              </DisabledTooltipWrapper>
            ) : runClosureButton}
            {witnessActionDisabled && witnessActionDisabledTooltip ? (
              <DisabledTooltipWrapper tooltip={witnessActionDisabledTooltip} placement="top">
                {refreshButton}
              </DisabledTooltipWrapper>
            ) : refreshButton}
          </div>
        ) : null}
      </div>

      <div
        data-testid="terminal-detail-section-controls"
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Selected activity detail sections"
      >
        {visibleActions.map((action) => {
          const sectionButton = (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              aria-pressed={activeSection === action.id}
              onClick={() => onChangeSection(action.id)}
              className={`rounded-full border px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-45 ${
                activeSection === action.id
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                  : 'border-white/10 bg-white/5 text-neutral-200 hover:border-emerald-300/35 hover:bg-emerald-400/10'
              }`}
            >
              {action.label}
            </button>
          );

          return action.disabled && action.disabledReason ? (
            <DisabledTooltipWrapper key={action.id} tooltip={action.disabledReason} placement="top">
              {sectionButton}
            </DisabledTooltipWrapper>
          ) : sectionButton;
        })}
      </div>
    </section>
  );
}
