import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalDepositComposer from '@/app/terminal/TerminalDepositComposer';

jest.mock('@/app/terminal/TerminalWorkspaceCard', () => ({
  __esModule: true,
  default: function MockTerminalWorkspaceCard({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
  },
}));

jest.mock('@/app/auxillaries/components/AuxillariesProvider', () => ({
  openAuxillaries: jest.fn(),
}));

jest.mock('@/components/bitcode/execution/BitcodeInlineExplainer', () => ({
  __esModule: true,
  default: function MockBitcodeInlineExplainer() {
    return null;
  },
}));

jest.mock('@/components/bitcode/execution/BitcodeMetricGrid', () => ({
  __esModule: true,
  default: function MockBitcodeMetricGrid() {
    return null;
  },
}));

jest.mock('@/components/bitcode/execution/BitcodeChipCloud', () => ({
  __esModule: true,
  default: function MockBitcodeChipCloud() {
    return null;
  },
}));

jest.mock('@/app/terminal/terminal-workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    depositComposer: [],
  },
  TERMINAL_INLINE_EXPLAINERS: {
    assetTitleOverride: [],
    authorOverride: [],
    artifactKind: [],
    artifactType: [],
    sourceRepo: [],
    sourceBranch: [],
    sourceCommit: [],
    workflowRunId: [],
    signerAddress: [],
    visualPreview: [],
    workingNote: [],
    tags: [],
    rawFallbackContent: [],
    depositSubmission: [],
    transactionReadiness: [],
  },
}));

jest.mock('@/app/terminal/terminal-shell-reading', () => ({
  jumpToShellSection: jest.fn(),
}));

jest.mock('@/app/terminal/terminal-shell-bridge', () => ({
  useTerminalShellBridge: () => ({
    snapshot: {},
    runControl: jest.fn(),
  }),
}));

jest.mock('@/app/terminal/terminal-deposit-composer', () => ({
  normalizeTerminalDepositComposer: () => ({
    authSessionId: 'session-1',
    selectedInventoryEntryIds: ['entry-1'],
    selectedEntries: [
      {
        inventoryEntryId: 'entry-1',
        title: 'rollback runbook',
      },
    ],
    selectedCount: 1,
    sourceRepo: 'bitcode/bitcode',
    signerAddress: 'bc1qbitcode',
  }),
}));

jest.mock('@/app/terminal/terminal-activity-history', () => ({
  readTerminalRouteError: jest.fn(async () => 'route error'),
}));

const baseTransactionReadiness = {
  status: 'wallet-verification-pending' as const,
  label: 'wallet verification pending',
  summary: 'Signed settlement remains staged until verified wallet-provider signing is present.',
  nextAction: 'Return to Profile for verified signing.',
  blockers: [{ id: 'wallet-verification' as const, label: 'Verified wallet-provider signing access' }],
  canReview: true as const,
  canTransact: true,
  canSettle: false,
  signedIn: true,
  hasRepositoryProvider: true,
  hasValidRepositoryProvider: true,
  hasWalletBinding: true,
  hasVerifiedWalletBinding: false,
  hasStoredVerifiedWalletBinding: false,
  hasRepositoryAnchor: true,
  requiresRepositoryAnchor: true,
};

describe('TerminalDepositComposer', () => {
  it('projects the live repository anchor into the visible deposit source', () => {
    render(
      <TerminalDepositComposer
        repositoryAnchor="engineeredsoftware/ENGI"
        repositoryProvider="github"
        repositoryBranch="main"
        repositoryCommit="abc123456789"
        repositoryBranches={[
          {
            name: 'main',
            commit: {
              sha: 'abc123456789',
              message: 'head',
              author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            },
            protected: false,
          },
        ]}
        repositoryCommits={[
          {
            sha: 'abc123456789',
            message: 'feat: source selector',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
        ]}
        transactionReadiness={baseTransactionReadiness}
      />,
    );

    expect(screen.getByDisplayValue('engineeredsoftware/ENGI')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Deposit source branch' })).toHaveValue('main');
    expect(screen.getByRole('combobox', { name: 'Deposit source commit' })).toHaveValue('abc123456789');
    expect(screen.getByText('Selected from deposit-side supply')).toBeInTheDocument();
    expect(screen.getByText('Full deposit preview')).toBeInTheDocument();
    expect(screen.getByText(/Bitcode will bind engineeredsoftware\/ENGI on main at abc123456789/i)).toBeInTheDocument();
  });

  it('defaults the signer address from the connected wallet when available', () => {
    render(
      <TerminalDepositComposer
        repositoryAnchor="engineeredsoftware/ENGI"
        repositoryProvider="github"
        repositoryBranch="main"
        repositoryCommit="abc123456789"
        preferredSignerAddress="tb1pwalletsigner"
        preferredSignerLabel="Leather wallet"
        transactionReadiness={baseTransactionReadiness}
      />,
    );

    expect(screen.getByDisplayValue('tb1pwalletsigner')).toBeInTheDocument();
    expect(screen.getByText('Defaulted from Leather wallet')).toBeInTheDocument();
  });

  it('keeps deposit submission disabled until settlement readiness is complete', () => {
    const { rerender } = render(
      <TerminalDepositComposer
        repositoryAnchor="bitcode/bitcode"
        repositoryBranch="main"
        repositoryCommit="abc123456789"
        repositoryBranches={[
          {
            name: 'main',
            commit: {
              sha: 'abc123456789',
              message: 'head',
              author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            },
            protected: false,
          },
        ]}
        repositoryCommits={[
          {
            sha: 'abc123456789',
            message: 'feat: source selector',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
        ]}
        transactionReadiness={baseTransactionReadiness}
      />,
    );

    expect(screen.getByRole('button', { name: 'Submit deposit to Bitcode' })).toBeDisabled();
    expect(
      screen.getByText('Signed settlement remains staged until verified wallet-provider signing is present.'),
    ).toBeInTheDocument();

    rerender(
      <TerminalDepositComposer
        repositoryAnchor="bitcode/bitcode"
        repositoryBranch="main"
        repositoryCommit="abc123456789"
        repositoryBranches={[
          {
            name: 'main',
            commit: {
              sha: 'abc123456789',
              message: 'head',
              author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            },
            protected: false,
          },
        ]}
        repositoryCommits={[
          {
            sha: 'abc123456789',
            message: 'feat: source selector',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
        ]}
        transactionReadiness={{
          ...baseTransactionReadiness,
          status: 'ready',
          label: 'ready',
          summary: 'Wallet identity, verified signing, and repository scope are ready.',
          blockers: [],
          canSettle: true,
          hasVerifiedWalletBinding: true,
          hasStoredVerifiedWalletBinding: true,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Submit deposit to Bitcode' })).toBeEnabled();
  });

  it('keeps deposit submission disabled when repository scope must be reconnected', () => {
    render(
      <TerminalDepositComposer
        repositoryAnchor="bitcode/bitcode"
        transactionReadiness={{
          ...baseTransactionReadiness,
          status: 'repository-provider-pending',
          label: 'repository reconnect required',
          summary:
            'Bitcode is in review-only mode. Reconnect GitHub or equivalent repository scope in Externals before you transact, settle, or sign Bitcode activity.',
          nextAction: 'Open Externals and restore a valid repository-provider connection.',
          blockers: [
            {
              id: 'repository-provider',
              label: 'Reconnect GitHub or equivalent repository scope in Externals',
            },
          ],
          canTransact: false,
          canSettle: false,
          hasValidRepositoryProvider: false,
          hasVerifiedWalletBinding: true,
          hasStoredVerifiedWalletBinding: true,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Submit deposit to Bitcode' })).toBeDisabled();
    expect(
      screen.getAllByText(/Reconnect GitHub or equivalent repository scope in Externals/i).length,
    ).toBeGreaterThan(0);
  });

  it('keeps deposit submission disabled when verified wallet-provider signing must be reconnected', () => {
    render(
      <TerminalDepositComposer
        repositoryAnchor="bitcode/bitcode"
        transactionReadiness={{
          ...baseTransactionReadiness,
          label: 'wallet reconnect required',
          summary:
            'Bitcode can reread the saved verified wallet signer posture in Profile, but the live wallet-provider signing session is no longer available. Reconnect the wallet provider before you settle or sign Bitcode activity.',
          nextAction: 'Reconnect the wallet provider so verified signing access is live again.',
          blockers: [
            {
              id: 'wallet-verification',
              label: 'Reconnect verified wallet-provider signing access',
            },
          ],
          hasStoredVerifiedWalletBinding: true,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Submit deposit to Bitcode' })).toBeDisabled();
    expect(screen.getAllByText(/Reconnect verified wallet-provider signing access/i).length).toBeGreaterThan(0);
  });
});
