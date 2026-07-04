import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import TerminalTransactionClosureCard from '@/app/terminal/TerminalTransactionClosureCard';
import TerminalTransactionHistoryCard from '@/app/terminal/TerminalTransactionHistoryCard';
import TerminalTransactionIdentityCard from '@/app/terminal/TerminalTransactionIdentityCard';
import TerminalTransactionJournalReconciliationCard from '@/app/terminal/TerminalTransactionJournalReconciliationCard';
import TerminalTransactionOrganizationAuthorityCard from '@/app/terminal/TerminalTransactionOrganizationAuthorityCard';
import TerminalTransactionProofsCard from '@/app/terminal/TerminalTransactionProofsCard';

describe('Terminal transaction detail cards', () => {
  it('renders closure, proofs, and history as distinct activity detail carriers', () => {
    const onOpenVerification = jest.fn();
    const onOpenBranch = jest.fn();
    const onOpenSettlement = jest.fn();
    const onOpenHistory = jest.fn();

    render(
      <div>
        <TerminalTransactionClosureCard
          rows={[
            { label: 'Proof posture', value: 'proof witness ready' },
            { label: 'Closure focus', value: 'bounded disclosure' },
          ]}
          settlementMetrics={[
            { label: 'Credited assets', value: '2' },
            { label: 'Participating assets', value: '3' },
          ]}
          branchArtifacts={['BITCODE_READ.md']}
          payload={{
            closure: {
              rows: [
                { label: 'Proof posture', value: 'proof witness ready' },
                { label: 'Closure focus', value: 'bounded disclosure' },
              ],
              settlementMetrics: [
                { label: 'Credited assets', value: '2' },
                { label: 'Participating assets', value: '3' },
              ],
              branchArtifacts: ['BITCODE_READ.md'],
            },
          }}
          onOpenVerification={onOpenVerification}
          onOpenBranch={onOpenBranch}
          onOpenSettlement={onOpenSettlement}
        />
        <TerminalTransactionIdentityCard
          startedAt="Apr 17, 10:45 AM"
          rows={[
            { label: 'Activity id', value: 'txn-001' },
            { label: 'Status', value: 'completed' },
          ]}
          payload={{
            transaction: {
              id: 'txn-001',
              status: 'completed',
            },
          }}
        />
        <TerminalTransactionProofsCard
          proofFamilies={[
            {
              label: 'selection-materialization',
              artifactPath: '.bitcode/selection-and-materialization-proof.json',
              theoremStatus: 'passed',
              replayArtifacts: '3',
            },
          ]}
          payload={{
            proofFamilies: [
              {
                label: 'selection-materialization',
                artifactPath: '.bitcode/selection-and-materialization-proof.json',
              },
            ],
          }}
          onOpenVerification={onOpenVerification}
          onOpenSettlement={onOpenSettlement}
        />
        <TerminalTransactionHistoryCard
          recentHistory={[
            {
              label: 'run-001',
              summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
            },
          ]}
          payload={{
            recentHistory: [
              {
                label: 'run-001',
                summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
              },
            ],
          }}
          onOpenHistory={onOpenHistory}
        />
        <TerminalTransactionJournalReconciliationCard
          reconciliation={{
            state: 'approval_required',
            stateLabel: 'Approval required',
            summary: 'Observed ledger fact contradicts a projection.',
            metrics: [
              { label: 'State', value: 'Approval required' },
              { label: 'Journal entries', value: '1' },
            ],
            observedFacts: [
              {
                id: 'ledger-anchor-finality',
                label: 'Ledger anchor finality',
                value: 'confirmed',
                state: 'confirmed',
                source: 'ledger_observed',
                blocksContradictoryProjection: true,
              },
            ],
            projectedFacts: [
              {
                id: 'readback-ledgerAnchor',
                label: 'ledgerAnchor',
                value: 'missing',
                state: 'missing',
                source: 'database_projected',
                blocksContradictoryProjection: false,
              },
            ],
            canonicalFacts: [
              {
                id: 'settlement-journal-root',
                label: 'Settlement journal root',
                value: 'sha256:journal',
                state: 'root-bound',
                source: 'metaphysical_canonical',
                blocksContradictoryProjection: false,
              },
            ],
            journalEntries: [
              {
                id: 'journal-anchor-run-1',
                title: 'asset_pack_anchor',
                summary: 'depositor-wallet · 3 · sha256:after',
              },
            ],
            repairReceipts: [],
            repairActions: [
              {
                id: 'ledger-anchor-run-1:project_ledger_fact',
                title: 'project_ledger_fact',
                summary: 'Project the confirmed ledger anchor into the database.',
                supportingText: 'operator approval required',
              },
            ],
            proofRoots: [
              {
                id: 'settlement-journal-root:sha256:journal',
                title: 'Settlement journal root',
                summary: 'sha256:journal',
              },
            ],
            driftKindCounts: [{ label: 'missing_database_projection', value: '1' }],
            blockingReasons: ['Confirmed ledger anchor contradicts the missing database projection.'],
            payload: {
              observedFacts: ['ledger-anchor-finality'],
            },
          }}
        />
        <TerminalTransactionOrganizationAuthorityCard
          authority={{
            state: 'allowed',
            stateLabel: 'Allowed',
            summary: 'Registry-derived authority admits protected-source delivery.',
            metrics: [
              { label: 'State', value: 'Allowed' },
              { label: 'Allowed', value: '1' },
            ],
            decisions: [
              {
                id: 'mcp:deliver',
                title: 'mcp · deliver asset pack',
                summary: 'allowed · role_authorized · protected_source_allowed',
                supportingText: 'github:engineeredsoftware/ENGI/pull/42',
              },
            ],
            blockers: [],
            proofRoots: [
              {
                id: 'mcp:deliver:authorityRoot',
                title: 'mcp · deliver asset pack authorityRoot',
                summary: 'btd-proof-root:organization-interface-authority:abc123',
              },
            ],
            payload: {
              organizationAuthority: [
                {
                  action: 'deliver_asset_pack',
                  decision: 'allowed',
                },
              ],
            },
          }}
        />
      </div>,
    );

    expect(screen.getByText('Closure posture')).toBeTruthy();
    expect(screen.getByText('Selected activity')).toBeTruthy();
    expect(screen.getByText('Proof families')).toBeTruthy();
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.getByText('Journal reconciliation')).toBeTruthy();
    expect(screen.getByText('Ledger observations and database projections')).toBeTruthy();
    expect(screen.getByText('Metaphysical canonical facts')).toBeTruthy();
    expect(screen.getByText('Repair actions')).toBeTruthy();
    expect(screen.getByText('Proof roots')).toBeTruthy();
    expect(screen.getByText('Organization authority')).toBeTruthy();
    expect(screen.getByText('Role, policy, wallet, multi-sig, settlement, and interface permission')).toBeTruthy();
    expect(screen.getByText('Permission decisions')).toBeTruthy();
    expect(screen.getByText('Authority proof roots')).toBeTruthy();
    expect(screen.getAllByText('Structured payload shape').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('selection-materialization').length).toBeGreaterThan(0);
    expect(screen.getAllByText('run-001').length).toBeGreaterThan(0);
    expect(screen.getByText('asset_pack_anchor')).toBeTruthy();

    const closureCard = screen
      .getByText('Closure summary, settlement, and branch follow-through')
      .closest('div.bg-black\\/20');
    const proofsCard = screen
      .getByText('Bounded proof stays with the selected activity')
      .closest('div.bg-black\\/20');

    expect(closureCard).toBeTruthy();
    expect(proofsCard).toBeTruthy();

    fireEvent.click(within(closureCard as HTMLElement).getByRole('button', { name: 'Raw JSON' }));
    expect(screen.getByText(/"settlementMetrics"/)).toBeTruthy();

    fireEvent.click(within(proofsCard as HTMLElement).getByRole('button', { name: 'Raw JSON' }));
    expect(screen.getByText(/"proofFamilies"/)).toBeTruthy();

    fireEvent.click(within(closureCard as HTMLElement).getByRole('button', { name: 'Visual' }));
    fireEvent.click(within(proofsCard as HTMLElement).getByRole('button', { name: 'Visual' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Open verification' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Open settlement' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Open history' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open branch' }));

    expect(onOpenVerification).toHaveBeenCalled();
    expect(onOpenSettlement).toHaveBeenCalled();
    expect(onOpenHistory).toHaveBeenCalled();
    expect(onOpenBranch).toHaveBeenCalled();
  });
});
