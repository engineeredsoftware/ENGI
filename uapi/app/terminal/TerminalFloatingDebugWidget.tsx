'use client';

import React from 'react';
import { Bug, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

import type { TransactionDataMode } from '@/components/bitcode/pipeline/bitcode-transaction-types';

import type { TerminalEnvironmentMode } from './terminal-transaction-query';

const ENVIRONMENT_MODE_OPTIONS: Array<{
  label: string;
  value: TerminalEnvironmentMode | null;
}> = [
  { label: 'Default', value: null },
  { label: 'Mock', value: 'mock' },
  { label: 'Development', value: 'development' },
  { label: 'Staging', value: 'staging' },
  { label: 'Production', value: 'production' },
];

interface TerminalFloatingDebugWidgetProps {
  debugEnabled: boolean;
  environmentMode: TerminalEnvironmentMode | null;
  transactionDataMode: TransactionDataMode;
  selectedTransactionId: string | null;
  hasRepositoryAnchor: boolean;
  hasVerifiedWalletBinding: boolean;
  onDebugEnabledChange: (enabled: boolean) => void;
  onEnvironmentModeChange: (environmentMode: TerminalEnvironmentMode | null) => void;
}

export default function TerminalFloatingDebugWidget({
  debugEnabled,
  environmentMode,
  transactionDataMode,
  selectedTransactionId,
  hasRepositoryAnchor,
  hasVerifiedWalletBinding,
  onDebugEnabledChange,
  onEnvironmentModeChange,
}: TerminalFloatingDebugWidgetProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!debugEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => onDebugEnabledChange(true)}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-[#06101f]/95 px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-100 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:border-emerald-300/45 hover:bg-[#09172b]"
        >
          <Bug className="h-4 w-4" />
          Debug
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="terminal-floating-debug-widget"
      className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.4rem] border border-emerald-400/18 bg-[#06101f]/96 text-neutral-100 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-emerald-300/80">Debug surface</p>
          <p className="mt-1 text-sm font-semibold text-white">Terminal runtime posture</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={collapsed ? 'Expand debug widget' : 'Collapse debug widget'}
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-200 transition hover:border-white/18 hover:bg-white/10"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Close debug widget"
            onClick={() => onDebugEnabledChange(false)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-200 transition hover:border-white/18 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!collapsed ? (
        <div className="space-y-4 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Route mode</p>
              <p className="mt-2 text-sm font-medium text-white">{environmentMode || 'default'}</p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Data mode</p>
              <p className="mt-2 text-sm font-medium text-white">{transactionDataMode}</p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Repository anchor</p>
              <p className="mt-2 text-sm font-medium text-white">{hasRepositoryAnchor ? 'bound' : 'unbound'}</p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Verified signer</p>
              <p className="mt-2 text-sm font-medium text-white">
                {hasVerifiedWalletBinding ? 'ready' : 'not yet'}
              </p>
            </div>
          </div>

          <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
            <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Selected activity</p>
            <p className="mt-2 break-all text-sm font-medium text-white">
              {selectedTransactionId || 'No activity selected'}
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
            <p className="text-[0.58rem] uppercase tracking-[0.18em] text-neutral-500">Environment override</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ENVIRONMENT_MODE_OPTIONS.map((option) => {
                const active = option.value === environmentMode;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onEnvironmentModeChange(option.value)}
                    className={`rounded-full border px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] transition ${
                      active
                        ? 'border-emerald-300/55 bg-emerald-400/14 text-emerald-100'
                        : 'border-white/10 bg-white/5 text-neutral-200 hover:border-white/18 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
