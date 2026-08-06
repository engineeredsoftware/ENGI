"use client";

import React from 'react';

import LoginForm from '@/components/bitcode/auth/LoginForm/LoginForm';
import {
  AUXILLARIES_ACCESS_LABEL,
  AUXILLARIES_LIST_LABEL,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

interface AuxillariesLoginPaneProps {
  onClose?: () => void;
  onToggle?: () => void;
  surfaceVariant?: 'default' | 'contained';
}

export default function AuxillariesLoginPane({
  onClose,
  onToggle,
  surfaceVariant = 'default',
}: AuxillariesLoginPaneProps) {
  const isContainedSurface = surfaceVariant === 'contained';

  return (
    <div className={`orbital-auth-shell ${isContainedSurface ? 'orbital-auth-shell-contained' : ''}`}>
      <div className="orbital-auth-grid">
        <aside className="orbital-auth-aside">
          <div className="orbital-auth-intro-card rounded-none border border-emerald-400/16 bg-emerald-400/8 px-5 py-5">
            <p className="text-[0.66rem] uppercase tracking-[0.22em] text-emerald-200/78">
              {AUXILLARIES_ACCESS_LABEL}
            </p>
            <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
              Open {AUXILLARIES_LIST_LABEL}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/74">
              Authenticate a wallet in Wallet, then connect GitHub in Externals when Deposit
              or Read work requires repository scope.
            </p>
          </div>

          <div className={`orbital-auth-support-grid ${isContainedSurface ? 'orbital-auth-support-grid-contained' : ''}`}>
            <div className="orbital-auth-support-card rounded-none border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200/74">
                Primary path
              </p>
              <p className="mt-2 text-sm leading-7 text-white/74">
                A Bitcoin wallet is the minimum identity/authentication path for staging. Email
                remains optional notification and recovery contact after wallet identity exists.
              </p>
            </div>

            <div className="orbital-auth-support-card rounded-none border border-white/10 auxillaries-glass-card px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/72">
                Required providers
              </p>
              <p className="mt-2 text-sm leading-7 text-white/74">
                Bitcoin wallet identity authenticates Wallet. GitHub connects repository context
                through Externals after access opens.
              </p>
            </div>

            <div className="orbital-auth-support-card orbital-auth-support-card-wide rounded-none border border-white/10 auxillaries-glass-card px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/72">
                Auxillaries after connect
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-7 text-white/74">
                <li>Transactions and selected detail stay where you left them.</li>
                <li>product stays focused while supporting panes remain one click away.</li>
                <li>Profile, Wallet, Externals, and Interfaces stay available as the four auxillaries.</li>
              </ul>
            </div>
          </div>
        </aside>

        <section className="orbital-auth-form">
          <LoginForm onClose={onClose} onToggle={onToggle} surfaceVariant={surfaceVariant} />
        </section>
      </div>
    </div>
  );
}
