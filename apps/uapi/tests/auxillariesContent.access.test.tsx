import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import {
  AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT,
  summarizeAuxillariesUxAccessibilityProofContract,
} from '@/app/auxillaries/auxillaries-ux-accessibility-proof';
import AuxillariesContent from '@/components/auxillaries/AuxillariesContent/AuxillariesContent';

jest.mock('framer-motion', () => {
  const React = require('react');

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_target, element: string) =>
          React.forwardRef(({ children, ...props }: any, ref: React.Ref<HTMLElement>) =>
            React.createElement(element, { ...props, ref }, children),
          ),
      },
    ),
  };
});

/** Matches AuxillariesContent AUDIT_REVEAL_MS (inner enter + buffer). */
const AUDIT_REVEAL_MS = 560 + 80;

describe('AuxillariesContent contained accessibility shell', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('exports the Auxillaries UX accessibility proof contract', () => {
    expect(summarizeAuxillariesUxAccessibilityProofContract()).toEqual({
      surface: 'Auxillaries support plane',
      landmarkCount: 3,
      stateCount: 4,
      viewportCount: 4,
      evidenceFileCount: 3,
    });
    expect(AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.landmarks.map((landmark) => landmark.id)).toEqual([
      'auxillariesMain',
      'auxillariesPaneNavigation',
      'auxillariesActivePane',
    ]);
    expect(AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.viewports.map((viewport) => viewport.id)).toEqual([
      'phone',
      'tablet',
      'laptop',
      'widescreen',
    ]);
    expect(AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT.evidenceFiles).toContain(
      'apps/uapi/styles/auxillaries-bitcode.css',
    );
  });

  it('exposes named landmarks, skip navigation, active-pane announcements, and expandable audit detail', () => {
    const onStepClick = jest.fn();

    render(
      <AuxillariesContent
        mode="auxillaries"
        steps={['profile', 'wallet', 'externals', 'interfaces']}
        currentStep="interfaces"
        completedSteps={['wallet']}
        availableSteps={['profile', 'wallet', 'interfaces']}
        showContent
        showSuccessAnimation={false}
        navigationMode="tabs"
        surfaceVariant="contained"
        onStepClick={onStepClick}
        renderStepContent={(step) => <div data-testid={`pane-${step}`}>Rendered {step}</div>}
        isOnboardingComplete
      />,
    );

    expect(screen.getByRole('main', { name: 'Bitcode Auxillaries support plane' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to Interfaces content' })).toHaveAttribute(
      'href',
      '#auxillaries-active-pane',
    );
    expect(screen.getByRole('navigation', { name: 'Auxillaries pane navigation' })).toBeInTheDocument();

    const activePane = screen.getByRole('region', { name: 'Interfaces active support pane' });
    expect(activePane).toHaveAttribute('id', 'auxillaries-active-pane');
    expect(activePane).toHaveAttribute('aria-live', 'polite');
    expect(activePane).toHaveAttribute('aria-busy', 'false');
    expect(activePane).toHaveAttribute('data-auxillaries-pane-state', 'ready');

    // Banner summary removed; readiness remains in audit detail + selector cards.
    expect(within(activePane).queryByText('Active support pane')).not.toBeInTheDocument();
    expect(within(activePane).queryByText(/panes available/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('pane-interfaces')).toHaveTextContent('Rendered interfaces');

    expect(screen.getByRole('button', { name: 'Interfaces auxillary' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Externals auxillary' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Externals auxillary' })).toHaveAttribute('aria-disabled', 'true');

    // Audit stays unmounted until pane enter settles (no mid-pane flash).
    expect(screen.queryByTestId('auxillaries-audit-detail')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(AUDIT_REVEAL_MS);
    });

    const auditDetail = screen.getByTestId('auxillaries-audit-detail');
    expect(auditDetail.tagName.toLowerCase()).toBe('details');
    expect(screen.getByText('Audit detail')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Audit detail'));
    expect(auditDetail).toHaveAttribute('open');
    expect(within(auditDetail).getByText('Active pane')).toBeInTheDocument();
    expect(within(auditDetail).getByText('source-safe summary only')).toBeInTheDocument();
  });

  it('announces loading state without rendering raw audit JSON', () => {
    render(
      <AuxillariesContent
        mode="auxillaries"
        steps={['profile', 'wallet', 'externals', 'interfaces']}
        currentStep="wallet"
        completedSteps={[]}
        availableSteps={['wallet']}
        showContent={false}
        showSuccessAnimation={false}
        navigationMode="tabs"
        surfaceVariant="contained"
        onStepClick={jest.fn()}
        renderStepContent={(step) => <div data-testid={`pane-${step}`}>Rendered {step}</div>}
        isOnboardingComplete={false}
      />,
    );

    const activePane = screen.getByRole('region', { name: 'Wallet active support pane' });
    expect(activePane).toHaveAttribute('aria-busy', 'true');
    expect(activePane).toHaveAttribute('data-auxillaries-pane-state', 'loading');
    expect(within(activePane).getByRole('status')).toHaveTextContent('Loading active pane.');
    // Loading: no audit accordion (would float alone mid-column).
    expect(screen.queryByTestId('auxillaries-audit-detail')).not.toBeInTheDocument();
    expect(screen.queryByText(/"currentStep"/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(AUDIT_REVEAL_MS + 100);
    });
    expect(screen.queryByTestId('auxillaries-audit-detail')).not.toBeInTheDocument();
  });
});
