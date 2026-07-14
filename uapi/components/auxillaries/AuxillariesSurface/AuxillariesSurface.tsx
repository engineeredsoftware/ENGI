"use client";

/**
 * Auxillaries surface shell — auth windows, orbital chrome, and pane routing.
 * State/mutations live in hooks/; dynamic pane imports in auxillaries-surface-dynamic.
 */

import React from 'react';
import { motion } from 'framer-motion';

import OrbitalRings from '@/components/bitcode/orbitals/OrbitalRings/OrbitalRings';
import { GPUAcceleration } from '@/components/bitcode/perf/GPUAcceleration/GPUAcceleration';
import { ContentVisibility } from '@/components/bitcode/perf/ContentVisibility/ContentVisibility';
import { getAuxillaryRingIndex, type AuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

import {
  AuxillariesContent,
  AuxillariesLoginPane,
  FlipText,
} from './auxillaries-surface-dynamic';
import { useAuxillariesSurface } from './hooks/use-auxillaries-surface';
import { useAuxillariesStepContent } from './hooks/use-auxillaries-step-content';

export type { ConcreteAuxillaryPane, AuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export interface AuxillariesSurfaceProps {
  window?: 'SignInWindow' | 'SignUpWindow';
  onClose?: () => void;
  className?: string;
  initialStep?: AuxillaryPane | null;
}

export default function AuxillariesSurface({
  window: windowProp = 'SignInWindow',
  onClose,
  className = '',
  initialStep = null,
}: AuxillariesSurfaceProps) {
  const surface = useAuxillariesSurface({ windowProp, onClose, initialStep });
  const renderStepContent = useAuxillariesStepContent({
    profileLoading: surface.profileLoading,
    profileData: surface.profileData,
    sessionUser: surface.sessionUser,
    auxillaryData: surface.auxillaryData,
    isUnlockedSurface: surface.isUnlockedSurface,
    shouldPersistOnboardingProgress: surface.shouldPersistOnboardingProgress,
    handleStepCompletionChange: surface.handleStepCompletionChange,
    handleStepComplete: surface.handleStepComplete,
    updateProfileMutation: surface.updateProfileMutation,
    queryClient: surface.queryClient,
  });

  // Contained workspace: mount Close / Disconnect above the left selector column.
  // Login + non-contained shells keep the surface-level header chrome.
  const placeChromeAboveLeftPane =
    surface.usesContainedAuxillariesSurface && !surface.showLoginPane;

  const chromeActions = (
    <>
      {onClose && (
        <button
          data-auxillaries-testid="auxillaries-close-button"
          onClick={onClose}
          className="orbital-close-button auxillaries-close-button"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}

      {/*
        Wallet-native chrome: Connect when no session/wallet identity;
        Disconnect when either Supabase session or Bitcoin wallet is bound
        (mirrors Sign in → Connect / Sign out → Disconnect product language).
      */}
      {surface.authLoaded && !surface.hasConnectedIdentity && (
        <button
          type="button"
          data-auxillaries-testid="auxillaries-toggle-button"
          onClick={surface.toggleWindow}
          className="auxillaries-action-button auxillaries-connect-button auxillaries-toggle-button orbital-toggle-button inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-950/85 px-4 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50 shadow-[0_14px_32px_rgba(0,0,0,0.24),0_0_0_1px_rgba(101,254,183,0.1)_inset] transition hover:-translate-y-px hover:border-emerald-200/50 hover:bg-emerald-900/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
          aria-label={surface.activeWindow === 'SignInWindow' ? 'Create Account' : 'Connect'}
        >
          <FlipText
            text={surface.activeWindow === 'SignInWindow' ? 'Create Account' : 'Connect'}
            className="inline-block"
          />
        </button>
      )}

      {surface.authLoaded && surface.hasConnectedIdentity && (
        <button
          type="button"
          onClick={surface.handleSignOut}
          className="auxillaries-action-button auxillaries-signout-button orbital-signout-button inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-none border border-red-300/32 bg-red-950/80 px-4 text-xs font-bold uppercase tracking-[0.12em] text-red-100 shadow-[0_14px_32px_rgba(0,0,0,0.24),0_0_0_1px_rgba(248,113,113,0.08)_inset] transition hover:-translate-y-px hover:border-red-200/45 hover:bg-red-900/84 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/45"
          aria-label="Disconnect"
        >
          Disconnect
        </button>
      )}
    </>
  );

  return (
    <div
      ref={surface.containerRef}
      className={`orbital-system ${surface.auxillariesSurfaceClass} ${surface.usesBitcodeAuxillariesSurface ? 'auxillaries-bitcode-surface' : ''} ${surface.activeWindow === 'SignUpWindow' && !surface.isAuxillariesSurface && !surface.usesContainedAuxillariesSurface ? 'orbital-system-onboarding' : ''} ${surface.usesContainedAuxillariesSurface ? 'orbital-system-application' : ''} ${surface.isDedicatedAuxillariesRoute ? 'orbital-system-route-surface auxillaries-bitcode-route-surface' : ''} ${surface.deferredAnimationsEnabled ? '' : 'animations-disabled'} ${className}`}
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Escape' && onClose?.()}
    >
      {!placeChromeAboveLeftPane ? (
        <div className="orbital-header-buttons">{chromeActions}</div>
      ) : null}

      {!surface.usesContainedAuxillariesSurface ? (
        <GPUAcceleration>
          <OrbitalRings
            count={4}
            baseSize={30}
            sizeIncrement={15}
            activeIndex={surface.showLoginPane ? 0 : getAuxillaryRingIndex(surface.currentStep)}
            className={`${surface.auxillariesBackgroundClass} ${surface.auxillariesBackgroundAnimationClass}`.trim()}
          />
        </GPUAcceleration>
      ) : null}

      <ContentVisibility containSize="600px 400px">
        {surface.showLoginPane ? (
          <motion.div
            key="login"
            className="orbital-content-container orbital-auth-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <AuxillariesLoginPane
              onClose={onClose}
              onToggle={surface.showSignup}
              surfaceVariant={surface.usesContainedAuxillariesSurface ? 'contained' : 'default'}
            />
          </motion.div>
        ) : (
          <AuxillariesContent
            mode={surface.treatsContainedSurfaceAsAuxillaries ? 'auxillaries' : 'onboarding'}
            steps={surface.visibleSteps}
            currentStep={surface.currentStep}
            completedSteps={surface.completedSteps}
            availableSteps={surface.availableSteps}
            showContent
            showSuccessAnimation={surface.shouldPersistOnboardingProgress}
            navigationMode="tabs"
            surfaceVariant={surface.usesContainedAuxillariesSurface ? 'contained' : 'default'}
            chromeActions={placeChromeAboveLeftPane ? chromeActions : null}
            onStepClick={surface.handleStepClick}
            renderStepContent={renderStepContent}
            isOnboardingComplete={surface.canonicalOnboardingComplete}
          />
        )}
      </ContentVisibility>
    </div>
  );
}
