"use client";

/**
 * Auxillaries surface shell — auth windows, orbital chrome, and pane routing.
 * State/mutations live in hooks/; dynamic pane imports in auxillaries-surface-dynamic.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { AuxillariesSolarIcon } from '@/components/bitcode/layout/AuxillariesSolarIcon/AuxillariesSolarIcon';
import { ContentVisibility } from '@/components/bitcode/perf/ContentVisibility/ContentVisibility';
import type { AuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

import {
  AuxillariesContent,
  AuxillariesLoginPane,
} from './auxillaries-surface-dynamic';
import { useAuxillariesSurface } from './hooks/use-auxillaries-surface';
import { useAuxillariesStepContent } from './hooks/use-auxillaries-step-content';

export type { ConcreteAuxillaryPane, AuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export interface AuxillariesSurfaceProps {
  window?: 'ConnectWindow' | 'AuxillariesWindow';
  onClose?: () => void;
  className?: string;
  initialStep?: AuxillaryPane | null;
}

export default function AuxillariesSurface({
  window: windowProp = 'ConnectWindow',
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

  /*
   * Solar starts almost with the surface — tiny delay so chrome paints first,
   * then a slightly slower opacity enter; live clears will-change.
   */
  const SOLAR_ENTER_DELAY_MS = 180;
  const SOLAR_ENTER_MS = 1040;
  type SolarPhase = 'pending' | 'enter' | 'live';
  const [solarPhase, setSolarPhase] = useState<SolarPhase>(() => {
    if (typeof window === 'undefined') return 'pending';
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'live'
        : 'pending';
    } catch {
      return 'pending';
    }
  });
  useEffect(() => {
    if (solarPhase === 'live') return;

    if (solarPhase === 'pending') {
      const enterTimeout = window.setTimeout(() => {
        setSolarPhase('enter');
      }, SOLAR_ENTER_DELAY_MS);
      return () => {
        window.clearTimeout(enterTimeout);
      };
    }

    const liveTimeout = window.setTimeout(() => {
      setSolarPhase('live');
    }, SOLAR_ENTER_MS);
    return () => {
      window.clearTimeout(liveTimeout);
    };
  }, [solarPhase]);

  // Contained workspace: mount Close / Disconnect above the left selector column.
  // Connect + non-contained shells keep the surface-level header chrome.
  const placeChromeAboveLeftPane =
    surface.usesContainedAuxillariesSurface && !surface.showConnectPane;

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
        Wallet-native chrome:
        - Connect → Wallet pane + orange connect CTAs (identity entry)
        - Authorize GitHub → Externals pane + purple GitHub card/button
          (only after wallet bind, before App + ≥1 authorized repository)
        - Disconnect when session or Bitcoin wallet is bound
      */}
      {surface.authLoaded && !surface.hasConnectedIdentity && (
        <button
          type="button"
          data-auxillaries-testid="auxillaries-connect-button"
          data-testid="auxillaries-connect-button"
          onClick={surface.handleConnectChrome}
          className="auxillaries-action-button auxillaries-connect-button auxillaries-toggle-button orbital-toggle-button inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-950/85 px-4 text-xs font-bold uppercase tracking-[0.12em] text-emerald-50 shadow-[0_14px_32px_rgba(0,0,0,0.24),0_0_0_1px_rgba(101,254,183,0.1)_inset] transition hover:-translate-y-px hover:border-emerald-200/50 hover:bg-emerald-900/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
          aria-label="Connect"
        >
          Connect
        </button>
      )}

      {surface.authLoaded && surface.needsGitHubConnectAttention && (
        <button
          type="button"
          data-auxillaries-testid="auxillaries-authorize-github-button"
          data-testid="auxillaries-authorize-github-button"
          onClick={surface.handleAuthorizeGitHubChrome}
          className="auxillaries-action-button auxillaries-authorize-github-button auxillaries-toggle-button orbital-toggle-button inline-flex h-10 min-w-[11.5rem] items-center justify-center rounded-none border border-fuchsia-300/40 bg-fuchsia-950/85 px-4 text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-50 shadow-[0_14px_32px_rgba(0,0,0,0.24),0_0_0_1px_rgba(232,121,249,0.12)_inset] transition hover:-translate-y-px hover:border-fuchsia-200/55 hover:bg-fuchsia-900/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/50"
          aria-label="Authorize GitHub"
        >
          Authorize GitHub
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
      className={`orbital-system ${surface.auxillariesSurfaceClass} ${surface.usesBitcodeAuxillariesSurface ? 'auxillaries-bitcode-surface' : ''} ${surface.activeWindow === 'AuxillariesWindow' && !surface.isAuxillariesSurface && !surface.usesContainedAuxillariesSurface ? 'orbital-system-onboarding' : ''} ${surface.usesContainedAuxillariesSurface ? 'orbital-system-application' : ''} ${surface.isDedicatedAuxillariesRoute ? 'orbital-system-route-surface auxillaries-bitcode-route-surface' : ''} ${surface.deferredAnimationsEnabled ? '' : 'animations-disabled'} ${className}`}
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Escape' && onClose?.()}
    >
      {/*
        Full-bleed solar — short delay (~180ms), then ~1040ms opacity enter.
        Hidden while pending so it does not flash early.
      */}
      {solarPhase !== 'pending' ? (
        <div
          className={[
            'auxillaries-solar-backdrop-host pointer-events-none absolute z-0',
            solarPhase === 'enter' ? 'auxillaries-solar-backdrop-enter' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-solar-phase={solarPhase}
          aria-hidden="true"
        >
          <AuxillariesSolarIcon variant="backdrop" />
        </div>
      ) : null}

      {!placeChromeAboveLeftPane ? (
        <div className="orbital-header-buttons relative z-[2]">{chromeActions}</div>
      ) : null}

      <ContentVisibility containSize="600px 400px" className="relative z-[2] h-full min-h-0 w-full">
        {surface.showConnectPane ? (
          <motion.div
            key="login"
            className="orbital-content-container orbital-auth-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <AuxillariesLoginPane
              onClose={onClose}
              onToggle={surface.showAuxillariesWorkspace}
              surfaceVariant={surface.usesContainedAuxillariesSurface ? 'contained' : 'default'}
            />
          </motion.div>
        ) : surface.showWorkspacePanes ? (
          <motion.div
            key="auxillaries-workspace"
            className="relative z-[2] h-full min-h-0 w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        ) : (
          /* Auth/cue gate: avoid mounting Wallet then remounting Externals. */
          <div className="relative z-[2] h-full min-h-0 w-full" aria-hidden="true" />
        )}
      </ContentVisibility>
    </div>
  );
}
