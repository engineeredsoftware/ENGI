import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalClosureControlDeck from '@/app/terminal/TerminalClosureControlDeck';

jest.mock('@/components/bitcode/pipeline/cards/BitcodeWorkspaceCard', () => ({
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

jest.mock('@/components/bitcode/pipeline/BitcodeInlineExplainer', () => ({
  __esModule: true,
  default: function MockBitcodeInlineExplainer() {
    return null;
  },
}));

jest.mock('@/components/bitcode/pipeline/BitcodeMetricGrid', () => ({
  __esModule: true,
  default: function MockBitcodeMetricGrid() {
    return null;
  },
}));

jest.mock('@/components/bitcode/pipeline/models/workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    closureControls: [],
    closureMap: [],
  },
  TERMINAL_INLINE_EXPLAINERS: {
    closureAction: [],
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

jest.mock('@/app/terminal/terminal-command-state', () => ({
  normalizeTerminalCommandState: () => ({
    scenario: 'read-1',
    branchMode: 'patch',
    shellReady: true,
  }),
}));

jest.mock('@/app/terminal/terminal-closure-state', () => ({
  normalizeTerminalClosureState: () => ({
    bundleId: 'bundle-1',
  }),
}));

jest.mock('@/app/terminal/terminal-closure-controls', () => ({
  normalizeTerminalClosureControlState: () => ({
    primaryActionLabel: 'Run closure',
    primaryActionSummary: 'Close and settle the active Bitcode branch.',
    statusTone: 'settled',
    scenario: 'read-1',
    branchMode: 'patch',
    visibleArtifactCount: 3,
    proofFamilyCount: 2,
    creditedAssetCount: 1,
    bundleId: 'bundle-1',
    shellReady: true,
    status: 'ready',
    flowGuideDetail: 'guide ready',
  }),
}));

jest.mock('@/app/terminal/terminal-activity-history', () => ({
  buildTerminalClosureAssetPackCompletion: jest.fn(() => null),
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

describe('TerminalClosureControlDeck', () => {
  it('keeps closure-bearing actions disabled until settlement readiness is complete', () => {
    const { rerender } = render(
      <TerminalClosureControlDeck transactionReadiness={baseTransactionReadiness} />,
    );

    expect(screen.getByRole('button', { name: 'Run closure' })).toBeDisabled();
    expect(
      screen.getByText('Signed settlement remains staged until verified wallet-provider signing is present.'),
    ).toBeInTheDocument();

    rerender(
      <TerminalClosureControlDeck
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

    expect(screen.getByRole('button', { name: 'Run closure' })).toBeEnabled();
  });

  it('keeps closure-bearing actions disabled when repository scope must be reconnected', () => {
    render(
      <TerminalClosureControlDeck
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

    expect(screen.getByRole('button', { name: 'Run closure' })).toBeDisabled();
    expect(screen.getAllByText(/Reconnect GitHub or equivalent repository scope in Externals/i).length).toBeGreaterThan(0);
  });

  it('keeps closure-bearing actions disabled when verified wallet-provider signing must be reconnected', () => {
    render(
      <TerminalClosureControlDeck
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

    expect(screen.getByRole('button', { name: 'Run closure' })).toBeDisabled();
    expect(screen.getAllByText(/live wallet-provider signing session is no longer available/i).length).toBeGreaterThan(0);
  });
});
