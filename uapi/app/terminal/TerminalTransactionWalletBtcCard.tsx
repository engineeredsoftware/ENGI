'use client';

import React from 'react';

import BitcodeDetailRowList from '@/components/bitcode/pipeline/BitcodeDetailRowList';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';
import BitcodePayloadDetailCard from '@/components/bitcode/pipeline/BitcodePayloadDetailCard';

import type { TerminalWalletBtcOperationProjection } from './terminal-wallet-btc-operation';

interface TerminalTransactionWalletBtcCardProps {
  operation: TerminalWalletBtcOperationProjection;
}

export default function TerminalTransactionWalletBtcCard({
  operation,
}: TerminalTransactionWalletBtcCardProps) {
  return (
    <BitcodePayloadDetailCard
      kicker="Wallet and BTC fee"
      title="Signer session, PSBT, and finality posture"
      summary={operation.summary}
      payload={operation.payload}
      rawLabel="Wallet and BTC payload"
    >
      <div className="space-y-5">
        <BitcodeMetricGrid metrics={operation.metrics} columnsClassName="sm:grid-cols-4" />

        {operation.blockers.length ? (
          <section className="rounded-[1.1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-4">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-amber-100/80">
              Blocked readiness
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50">
              {operation.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <BitcodeDetailRowList rows={operation.rows} />
      </div>
    </BitcodePayloadDetailCard>
  );
}
