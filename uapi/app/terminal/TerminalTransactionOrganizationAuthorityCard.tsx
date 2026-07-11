'use client';

import React from 'react';

import BitcodeDetailCollection from '@/components/bitcode/execution/BitcodeDetailCollection';
import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';
import BitcodePayloadDetailCard from '@/components/bitcode/execution/BitcodePayloadDetailCard';

import type { TerminalOrganizationAuthorityProjection } from './terminal-organization-authority';

interface TerminalTransactionOrganizationAuthorityCardProps {
  authority: TerminalOrganizationAuthorityProjection;
}

export default function TerminalTransactionOrganizationAuthorityCard({
  authority,
}: TerminalTransactionOrganizationAuthorityCardProps) {
  return (
    <BitcodePayloadDetailCard
      kicker="Organization authority"
      title="Role, policy, wallet, multi-sig, settlement, and interface permission"
      summary={authority.summary}
      payload={authority.payload}
      rawLabel="Organization authority payload"
    >
      <div className="space-y-5">
        <BitcodeMetricGrid metrics={authority.metrics} columnsClassName="sm:grid-cols-4" />

        {authority.blockers.length ? (
          <section className="rounded-[1.1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-4">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-amber-100/80">
              Authority blockers
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50">
              {authority.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Permission decisions
          </p>
          <BitcodeDetailCollection
            items={authority.decisions}
            listClassName="mt-3"
            emptyMessage="No role, read-license, settlement, or interface authority decision is attached yet."
          />
        </section>

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Authority proof roots
          </p>
          <BitcodeDetailCollection
            items={authority.proofRoots}
            listClassName="mt-3"
            emptyMessage="No authority proof root is readable yet."
          />
        </section>
      </div>
    </BitcodePayloadDetailCard>
  );
}
