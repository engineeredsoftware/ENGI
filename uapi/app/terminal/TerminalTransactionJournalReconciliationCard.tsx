'use client';

import React from 'react';

import BitcodeDetailCollection from '@/components/bitcode/pipeline/BitcodeDetailCollection';
import BitcodeDetailRowList from '@/components/bitcode/pipeline/BitcodeDetailRowList';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';
import BitcodePayloadDetailCard from '@/components/bitcode/pipeline/BitcodePayloadDetailCard';

import type {
  TerminalJournalReconciliationFact,
  TerminalJournalReconciliationSnapshot,
} from './terminal-journal-reconciliation';

interface TerminalTransactionJournalReconciliationCardProps {
  reconciliation: TerminalJournalReconciliationSnapshot;
}

function factRows(facts: readonly TerminalJournalReconciliationFact[] = []) {
  return facts.map((fact) => ({
    label: fact.label,
    value: `${fact.value} · ${fact.state}${fact.blocksContradictoryProjection ? ' · blocks contradictory projection' : ''}`,
  }));
}

function FactSection({
  title,
  summary,
  facts,
}: {
  title: string;
  summary: string;
  facts?: readonly TerminalJournalReconciliationFact[];
}) {
  return (
    <section className="border-t border-white/8 pt-4">
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-neutral-400">{summary}</p>
      <BitcodeDetailRowList rows={factRows(facts)} className="mt-3" />
    </section>
  );
}

export default function TerminalTransactionJournalReconciliationCard({
  reconciliation,
}: TerminalTransactionJournalReconciliationCardProps) {
  return (
    <BitcodePayloadDetailCard
      kicker="Journal reconciliation"
      title="Ledger observations and database projections"
      summary={reconciliation.summary}
      payload={reconciliation.payload}
      rawLabel="Journal reconciliation payload"
    >
      <div className="space-y-5">
        <BitcodeMetricGrid metrics={reconciliation.metrics} columnsClassName="sm:grid-cols-4" />

        {reconciliation.driftKindCounts.length ? (
          <section className="border-t border-amber-300/20 pt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-amber-200/80">
              Drift classes
            </p>
            <BitcodeMetricGrid
              metrics={reconciliation.driftKindCounts}
              columnsClassName="sm:grid-cols-3"
              className="mt-3"
            />
          </section>
        ) : null}

        {reconciliation.blockingReasons.length ? (
          <section className="border-t border-red-400/20 pt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-red-200/80">
              Blocking drift reasons
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-red-100">
              {reconciliation.blockingReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <FactSection
          title="Ledger observed facts"
          summary="Facts read from journal, fee, anchor, and repair rows. Confirmed, reorged, and failed observations block contradictory projections."
          facts={reconciliation.observedFacts}
        />
        <FactSection
          title="Database projected facts"
          summary="Readback projection booleans reported by the pipeline settlement path."
          facts={reconciliation.projectedFacts}
        />
        <FactSection
          title="Object storage artifacts"
          summary="Durable source-safe artifact roots for evidence, telemetry, preview, delivery, and ledger projection payloads."
          facts={reconciliation.objectStorageFacts}
        />
        <FactSection
          title="Metaphysical canonical facts"
          summary="Root-bound identifiers and hashes that define the canonical settlement shape without exposing protected source."
          facts={reconciliation.canonicalFacts}
        />

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Terminal journal entries
          </p>
          <BitcodeDetailCollection
            items={reconciliation.journalEntries}
            listClassName="mt-3"
            emptyMessage="No Terminal journal entries are readable for this activity yet."
          />
        </section>

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Repair actions
          </p>
          <BitcodeDetailCollection
            items={reconciliation.repairActions}
            listClassName="mt-3"
            emptyMessage="No repair action is currently required for this activity."
          />
        </section>

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Proof roots
          </p>
          <BitcodeDetailCollection
            items={reconciliation.proofRoots}
            listClassName="mt-3"
            emptyMessage="No proof roots are readable for this reconciliation yet."
          />
        </section>

        <section className="border-t border-white/8 pt-4">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Repair receipts
          </p>
          <BitcodeDetailCollection
            items={reconciliation.repairReceipts}
            listClassName="mt-3"
            emptyMessage="No reconciliation repair receipts are attached to this activity."
          />
        </section>
      </div>
    </BitcodePayloadDetailCard>
  );
}
