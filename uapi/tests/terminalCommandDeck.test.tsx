import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalCommandDeck from '@/app/terminal/TerminalCommandDeck';

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

jest.mock('@/components/bitcode/execution/BitcodeInlineExplainer', () => ({
  __esModule: true,
  default: function MockBitcodeInlineExplainer() {
    return null;
  },
}));

jest.mock('@/app/terminal/TerminalFlowGuideCard', () => ({
  __esModule: true,
  default: function MockTerminalFlowGuideCard() {
    return null;
  },
}));

jest.mock('@/app/terminal/terminal-workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    controls: [],
    activityMap: [],
  },
  TERMINAL_INLINE_EXPLAINERS: {
    scenario: [],
    projection: [],
    branchMode: [],
    transactionReadiness: [],
  },
}));

jest.mock('@/app/terminal/terminal-experience-architecture', () => ({
  TERMINAL_ACTIONS: [],
}));

jest.mock('@/app/terminal/terminal-shell-sections', () => ({
  TERMINAL_SHELL_SECTIONS: [],
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
    projection: 'reviewer',
    branchMode: 'patch',
    scenarioOptions: [{ value: 'read-1', label: 'priority read · producer' }],
    projectionOptions: [{ value: 'reviewer', label: 'reviewer' }],
    branchOptions: [{ value: 'patch', label: 'patch' }],
    heroLede: 'shell posture',
    heroTip: 'shell tip',
    status: 'ready',
    flowGuideLabel: 'Flow guide',
    flowGuideOpen: false,
    flowGuideStepIndex: 0,
    flowGuideStepCount: 0,
    shellReady: true,
  }),
}));

jest.mock('@/app/terminal/terminal-closure-state', () => ({
  normalizeTerminalClosureState: () => ({
    bundleId: 'bundle-1',
  }),
}));

jest.mock('@/app/terminal/terminal-command-presentation', () => ({
  deriveTerminalCommandPresentation: () => ({
    draftSummary: 'Working flow ready.',
    continuationTip: 'Continue the active flow.',
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

describe('TerminalCommandDeck', () => {
  it('keeps branch creation disabled until settlement readiness is complete', () => {
    const { rerender } = render(
      <TerminalCommandDeck
        repositoryAnchor="bitcode/bitcode"
        transactionReadiness={baseTransactionReadiness}
      />,
    );

    expect(screen.getByRole('button', { name: 'Make Bitcode branch' })).toBeDisabled();
    expect(
      screen.getByText('Signed settlement remains staged until verified wallet-provider signing is present.'),
    ).toBeInTheDocument();

    rerender(
      <TerminalCommandDeck
        repositoryAnchor="bitcode/bitcode"
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

    expect(screen.getByRole('button', { name: 'Make Bitcode branch' })).toBeEnabled();
  });

  it('keeps branch creation disabled when repository scope must be reconnected', () => {
    render(
      <TerminalCommandDeck
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

    expect(screen.getByRole('button', { name: 'Make Bitcode branch' })).toBeDisabled();
    expect(
      screen.getAllByText(/Reconnect GitHub or equivalent repository scope in Externals/i).length,
    ).toBeGreaterThan(0);
  });

  it('keeps branch creation disabled when verified wallet-provider signing must be reconnected', () => {
    render(
      <TerminalCommandDeck
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

    expect(screen.getByRole('button', { name: 'Make Bitcode branch' })).toBeDisabled();
    expect(screen.getAllByText(/Reconnect verified wallet-provider signing access/i).length).toBeGreaterThan(0);
  });
});
