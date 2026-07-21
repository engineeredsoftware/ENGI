/**
 * AuxillariesSurface orchestration: route step, onboarding completion,
 * profile/wallet/interface mutations, and auth window state.
 */

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@bitcode/supabase/ssr/client';
import type { Session } from '@supabase/supabase-js';

import { useOnboarding, useProfile, useUser } from '@/hooks/use-auth-query';
import {
  isAuxillariesPath,
  isAuxillariesCompatPath,
  normalizeAuxillaryPane,
  normalizeAuxillarySteps,
  AUXILLARY_FLOW_STEPS,
  AUXILLARY_RING_STEPS,
  type ConcreteAuxillaryPane,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { clearAuthQueries, updateCachedUser } from '@/hooks/use-auth-query';
import { clearSharedAuthUser } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { clearUserDataIdentity, mutateUserData, useUserData } from '@/hooks/useUserData';
import { clearLocalBitcodeWalletIdentity } from '@bitcode/auth/wallet-local';

import { requestGitHubConnectAttention } from '@/components/auxillaries/AuxillariesExternalsPane/models/github-connect-attention';
import { requestWalletConnectAttention } from '@/components/auxillaries/AuxillariesWalletConnectionPanel/models/wallet-connect-attention';

import { parseAuxillaryPath, reportError, trackEvent } from '../models/auxillaries-surface-path';

export interface UseAuxillariesSurfaceArgs {
  windowProp?: 'ConnectWindow' | 'AuxillariesWindow';
  onClose?: () => void;
  initialStep?: AuxillaryPane | null;
}

export function useAuxillariesSurface({
  windowProp = 'ConnectWindow',
  onClose,
  initialStep = null,
}: UseAuxillariesSurfaceArgs) {
  /*
   * Start enabled. Gating entrance behind rAF + useDeferredValue delayed CSS
   * cascade until after framer pane motion finished — looked like a double
   * entrance. Open latency is prefetch/keep-alive, not deferred animation.
   */
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const deferredAnimationsEnabled = animationsEnabled;
  const containerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { data: sessionUser, isLoading: userLoading } = useUser();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { data: onboardingData } = useOnboarding();
  const {
    data: auxillaryData,
    hasWalletConnection,
    hasGitHubConnection,
    hasValidGitHubConnection,
    repositories,
    btdBalance,
    btcFeeBalance,
    recentBtdAssetPacks,
    walletConnectionStatus,
    isLoading: isUserDataLoading,
  } = useUserData();

  const authLoaded = !userLoading;
  // Wallet-native identity: a bound Bitcoin wallet counts as connected even
  // before a Supabase session user is present (Connect / Disconnect chrome).
  const hasConnectedIdentity = Boolean(sessionUser) || hasWalletConnection;
  // Onboarding GitHub step: App install + at least one authorized repository.
  const hasAuthorizedGitHubRepository =
    (hasValidGitHubConnection || hasGitHubConnection) &&
    Array.isArray(repositories) &&
    repositories.length >= 1;
  const needsGitHubConnectAttention = hasWalletConnection && !hasAuthorizedGitHubRepository;
  const [supabaseClient] = useState(() => createClient());
  const router = useRouter();
  const pathname = usePathname();
  const routeStep = useMemo(() => parseAuxillaryPath(pathname), [pathname]);
  const isProductRoute = Boolean(
    pathname?.startsWith('/exchange') || pathname?.startsWith('/packs'),
  );
  const isDedicatedAuxillariesRoute = isAuxillariesPath(pathname) || isAuxillariesCompatPath(pathname);
  const usesProductOverlay = isProductRoute;
  const usesPortalOverlay = Boolean(onClose);
  const usesContainedAuxillariesSurface =
    usesPortalOverlay || usesProductOverlay || isDedicatedAuxillariesRoute || Boolean(sessionUser);
  const treatsContainedSurfaceAsAuxillaries = usesContainedAuxillariesSurface;

  const [activeWindow, setActiveWindow] = useState<'ConnectWindow' | 'AuxillariesWindow'>(windowProp);
  /** Explicit open target (deep link / chrome) — never override with GitHub auto-cue. */
  const explicitOpenStep = normalizeAuxillaryPane(initialStep) ?? routeStep ?? null;
  const [currentStep, setCurrentStep] = useState<ConcreteAuxillaryPane>(
    explicitOpenStep ?? 'wallet',
  );
  /**
   * Hold workspace pane paint until auth + auto-cue step are resolved so we do
   * not entrance-animate Wallet then immediately remount Externals (double trip).
   */
  const [workspaceStepResolved, setWorkspaceStepResolved] = useState(Boolean(explicitOpenStep));
  const [completedSteps, setCompletedSteps] = useState<ConcreteAuxillaryPane[]>([]);
  const [stepCompletionStates, setStepCompletionStates] = useState<Record<ConcreteAuxillaryPane, boolean>>({
    wallet: false,
    externals: false,
    profile: false,
    interfaces: false,
  });
  const [isCompletingStep, setIsCompletingStep] = useState(false);

  const canonicalOnboardingComplete = onboardingData?.isOnboardingComplete || false;
  const isAuxillariesSurface = treatsContainedSurfaceAsAuxillaries || Boolean(sessionUser);
  const shouldPersistOnboardingProgress = !treatsContainedSurfaceAsAuxillaries;
  const isUnlockedSurface = canonicalOnboardingComplete || isAuxillariesSurface || treatsContainedSurfaceAsAuxillaries;
  const visibleSteps: ConcreteAuxillaryPane[] = treatsContainedSurfaceAsAuxillaries
    ? [...AUXILLARY_RING_STEPS]
    : [...AUXILLARY_FLOW_STEPS];

  useEffect(() => {
    requestAnimationFrame(() => {
      containerRef.current?.focus({ preventScroll: true });
      // Keep true; only re-assert if a caller flipped it off.
      setAnimationsEnabled(true);
    });
  }, []);

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event: string, session: Session | null) => {
      queryClient.setQueryData(['auth', 'user'], session?.user ?? null);

      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        queryClient.invalidateQueries({ queryKey: ['auth', 'onboarding'] });
      } else {
        queryClient.removeQueries({ queryKey: ['auth'] });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, queryClient]);

  useEffect(() => {
    setActiveWindow(windowProp);
  }, [windowProp]);

  useEffect(() => {
    const requestedStep = normalizeAuxillaryPane(initialStep) ?? routeStep;
    if (!requestedStep) return;

    if (sessionUser) {
      setActiveWindow('AuxillariesWindow');
    }
    setCurrentStep(requestedStep);
  }, [initialStep, routeStep, sessionUser]);

  useEffect(() => {
    if (sessionUser && activeWindow === 'ConnectWindow') {
      setActiveWindow('AuxillariesWindow');
    }
  }, [activeWindow, sessionUser]);

  useEffect(() => {
    if (!onboardingData) return;

    setCompletedSteps(normalizeAuxillarySteps(onboardingData.completedPanes ?? onboardingData.completedSteps ?? []));

    const currentPane = onboardingData.currentPane ?? onboardingData.currentStep;
    if (!isAuxillariesSurface && currentPane && !initialStep && !routeStep) {
      setCurrentStep(normalizeAuxillaryPane(currentPane) || 'wallet');
    }
  }, [onboardingData, isAuxillariesSurface, initialStep, routeStep]);

  const handleStepCompletionChange = useCallback((step: ConcreteAuxillaryPane, isComplete: boolean) => {
    queueMicrotask(() => {
      startTransition(() => {
        setStepCompletionStates((previous) => ({ ...previous, [step]: isComplete }));
      });
    });
  }, []);

  const availableSteps = useMemo(() => {
    if (treatsContainedSurfaceAsAuxillaries) {
      return visibleSteps;
    }

    const available = Array.from(new Set(completedSteps));
    const nextStep = AUXILLARY_FLOW_STEPS.find((step) => !completedSteps.includes(step));
    if (nextStep && !available.includes(nextStep)) {
      available.push(nextStep);
    }

    if (!available.includes(currentStep)) {
      available.push(currentStep);
    }

    return available;
  }, [completedSteps, currentStep, treatsContainedSurfaceAsAuxillaries, visibleSteps]);

  const updateOnboardingMutation = useMutation({
    mutationFn: async (step: ConcreteAuxillaryPane) => {
      const response = await fetch('/api/auxillaries/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedPane: step }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update onboarding: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'onboarding'], data);
    },
    onError: (_error, step) => {
      setCompletedSteps((previous) => previous.filter((existingStep) => existingStep !== step));
      if (step) {
        setStepCompletionStates((previous) => ({ ...previous, [step]: false }));
      }
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updated: any) => {
      const response = await fetch('/api/auxillaries/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['auth', 'profile'], (old: any) => ({ ...old, ...updated }));
      void mutateUserData();
      void queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });

  const handleSignOut = useCallback(async () => {
    /*
     * Full Disconnect: wipe local wallet + shared user-data + auth cache so
     * chrome flips to Connect immediately. Disconnect Supabase after the
     * optimistic null so a pre-signOut refetch cannot restore the session.
     */
    clearLocalBitcodeWalletIdentity();
    clearUserDataIdentity();
    clearSharedAuthUser();
    await queryClient.cancelQueries({ queryKey: ['auth'] });
    updateCachedUser(queryClient, null);
    setCompletedSteps([]);
    setStepCompletionStates({
      wallet: false,
      externals: false,
      profile: false,
      interfaces: false,
    });
    setActiveWindow('ConnectWindow');

    try {
      await supabaseClient.auth.signOut({ scope: 'local' });
      trackEvent('auth_sign_out');
    } catch (err) {
      reportError(err);
    } finally {
      // Drop profile/onboarding and re-assert user=null after auth listeners.
      updateCachedUser(queryClient, null);
      clearAuthQueries(queryClient);
      try {
        await mutateUserData();
      } catch (err) {
        reportError(err);
      }
      if (pathname && pathname.startsWith('/executions')) {
        router.replace('/');
      }
    }
  }, [pathname, queryClient, router, supabaseClient]);

  const handleStepComplete = useCallback(async (step: ConcreteAuxillaryPane) => {
    if (!shouldPersistOnboardingProgress) {
      trackEvent('auxillaries_step_confirmed', { step });
      return;
    }

    if (completedSteps.includes(step) || isCompletingStep) {
      return;
    }

    setIsCompletingStep(true);
    const newCompletedSteps = [...completedSteps, step];
    setCompletedSteps(newCompletedSteps);
    trackEvent(isAuxillariesSurface ? 'auxillaries_step_completed' : 'onboarding_step_completed', { step });

    try {
      await updateOnboardingMutation.mutateAsync(step);
    } catch (error) {
      console.error('Step completion failed:', error);
    } finally {
      setIsCompletingStep(false);
    }

    if (!isAuxillariesSurface) {
      const nextStep = AUXILLARY_FLOW_STEPS.find((entry) => !newCompletedSteps.includes(entry));
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [
    completedSteps,
    isCompletingStep,
    isAuxillariesSurface,
    shouldPersistOnboardingProgress,
    updateOnboardingMutation,
  ]);

  const handleStepClick = useCallback((step: AuxillaryPane) => {
    if (!step || !availableSteps.includes(step as ConcreteAuxillaryPane)) {
      return;
    }

    setCurrentStep(step as ConcreteAuxillaryPane);
    trackEvent(isAuxillariesSurface ? 'auxillaries_step_click' : 'onboarding_step_click', { step });
  }, [availableSteps, isAuxillariesSurface]);

  /**
   * Chrome Connect: open Wallet auxillary and briefly spotlight the
   * required-wallet section + Connect Xverse/Leather buttons. Connect
   * is not a chrome action — wallet binding is the identity entry.
   *
   * requestWalletConnectAttention sets a pending flag so a Wallet pane that
   * mounts after a cross-pane switch still runs the highlight on mount.
   */
  const handleConnectChrome = useCallback(() => {
    setCurrentStep('wallet');
    trackEvent('auxillaries_connect_focus_wallet');
    requestWalletConnectAttention();
  }, []);

  /**
   * After wallet is bound but GitHub is not: open Externals and purple-spotlight
   * the Repository Connection card + Install GitHub App button.
   * Used by auto-cue after wallet bind and by chrome "Authorize GitHub".
   */
  const focusExternalsGitHubConnect = useCallback(() => {
    setCurrentStep('externals');
    trackEvent('auxillaries_connect_focus_github');
    requestGitHubConnectAttention();
  }, []);

  /** Chrome twin of Connect: Externals pane + purple GitHub attention. */
  const handleAuthorizeGitHubChrome = useCallback(() => {
    focusExternalsGitHubConnect();
  }, [focusExternalsGitHubConnect]);

  const prevWalletConnectedRef = useRef(false);
  const githubCueOnOpenRef = useRef(false);

  useEffect(() => {
    if (!authLoaded) return;

    const walletJustConnected = hasWalletConnection && !prevWalletConnectedRef.current;
    prevWalletConnectedRef.current = hasWalletConnection;

    // Explicit chrome/deep-link targets (BTD tracker → wallet) always win over
    // GitHub auto-cue. Do not treat "wallet already bound on first surface
    // mount" as a fresh connect that hijacks away from the requested pane.
    // (initialStep effect applies the explicit pane; we only skip hijacks here.)
    if (explicitOpenStep) {
      setWorkspaceStepResolved(true);
      return;
    }

    if (walletJustConnected && needsGitHubConnectAttention) {
      focusExternalsGitHubConnect();
      githubCueOnOpenRef.current = true;
      setWorkspaceStepResolved(true);
      return;
    }

    // Opening Auxillaries with wallet already bound and no GitHub attachment:
    // land on Externals *before* first content paint (workspaceStepResolved gate)
    // so Wallet never entrance-animates then gets replaced (double trip).
    if (
      !githubCueOnOpenRef.current &&
      hasWalletConnection &&
      needsGitHubConnectAttention &&
      treatsContainedSurfaceAsAuxillaries
    ) {
      githubCueOnOpenRef.current = true;
      setCurrentStep('externals');
      requestGitHubConnectAttention();
      trackEvent('auxillaries_connect_focus_github');
    }

    setWorkspaceStepResolved(true);
  }, [
    authLoaded,
    explicitOpenStep,
    focusExternalsGitHubConnect,
    hasWalletConnection,
    needsGitHubConnectAttention,
    treatsContainedSurfaceAsAuxillaries,
  ]);

  const toggleWindow = useCallback(() => {
    setActiveWindow((value) => (value === 'ConnectWindow' ? 'AuxillariesWindow' : 'ConnectWindow'));
  }, []);

  const showAuxillariesWorkspace = useCallback(() => {
    setActiveWindow('AuxillariesWindow');
  }, []);

  useEffect(() => {
    if (
      !isAuxillariesSurface &&
      stepCompletionStates[currentStep] &&
      !completedSteps.includes(currentStep) &&
      !isCompletingStep
    ) {
      handleStepComplete(currentStep);
    }
  }, [completedSteps, currentStep, handleStepComplete, isCompletingStep, isAuxillariesSurface, stepCompletionStates]);

  useEffect(() => {
    if (canonicalOnboardingComplete) {
      trackEvent('onboarding_complete');
    }
  }, [canonicalOnboardingComplete]);

  const showConnectPane = activeWindow === 'ConnectWindow' && !sessionUser && !usesContainedAuxillariesSurface;
  /** Wait for auth/cue resolution before mounting pane content (single entrance). */
  const showWorkspacePanes = !showConnectPane && workspaceStepResolved;
  const usesBitcodeAuxillariesSurface = usesContainedAuxillariesSurface;
  const auxillariesSurfaceClass = isDedicatedAuxillariesRoute ? 'orbital-system-route' : 'orbital-system-overlay';
  // Decorative full-bleed field under Auxillaries chrome (wallet product surface
  // and classic overlay both use the same ring language).
  const auxillariesBackgroundClass = showConnectPane
    ? 'login-background-glow'
    : 'account-background-highlight';
  const auxillariesBackgroundAnimationClass = deferredAnimationsEnabled
    ? 'animations-enabled'
    : '';

  const chromeWalletAddress =
    (walletConnectionStatus as { address?: string } | null | undefined)?.address ??
    (typeof profileData?.wallet_address === 'string' ? profileData.wallet_address : null);
  const chromeWalletProvider =
    (walletConnectionStatus as { provider?: string } | null | undefined)?.provider ??
    (typeof profileData?.wallet_provider === 'string' ? profileData.wallet_provider : null);
  const chromeAvatarUrl =
    typeof profileData?.avatar_url === 'string' && profileData.avatar_url.trim()
      ? profileData.avatar_url
      : null;
  const chromeDisplayName =
    typeof profileData?.display_name === 'string' && profileData.display_name.trim()
      ? profileData.display_name
      : null;

  return {
    containerRef,
    deferredAnimationsEnabled,
    sessionUser,
    hasWalletConnection,
    hasConnectedIdentity,
    needsGitHubConnectAttention,
    profileData,
    profileLoading,
    auxillaryData,
    btdBalance,
    btcFeeBalance,
    recentBtdAssetPacks,
    isUserDataLoading,
    chromeWalletAddress,
    chromeWalletProvider,
    chromeAvatarUrl,
    chromeDisplayName,
    authLoaded,
    queryClient,
    currentStep,
    completedSteps,
    availableSteps,
    visibleSteps,
    treatsContainedSurfaceAsAuxillaries,
    usesContainedAuxillariesSurface,
    isDedicatedAuxillariesRoute,
    isAuxillariesSurface,
    isUnlockedSurface,
    shouldPersistOnboardingProgress,
    canonicalOnboardingComplete,
    activeWindow,
    showConnectPane,
    showWorkspacePanes,
    usesBitcodeAuxillariesSurface,
    auxillariesSurfaceClass,
    auxillariesBackgroundClass,
    auxillariesBackgroundAnimationClass,
    handleSignOut,
    handleConnectChrome,
    handleAuthorizeGitHubChrome,
    handleStepComplete,
    handleStepClick,
    handleStepCompletionChange,
    toggleWindow,
    showAuxillariesWorkspace,
    updateProfileMutation,
    onClose,
  };
}
