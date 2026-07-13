"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BTDTracker } from "@/components/bitcode/btd/BtdTracker/BtdTracker";
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';
import { openAuxillaries, prefetchAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';
import { NotificationsWidget } from "@/components/bitcode/notifications/NotificationsWidget/NotificationsWidget"
import { AuxillariesUseButton } from "@/components/bitcode/nav/AuxillariesUseButton/AuxillariesUseButton";
import { FEATURE_FLAGS } from "@/config/features"
import { UserMenu } from "@/components/bitcode/layout/UserMenu/UserMenu";
import NavBrand, { type NavSurface } from "@/components/bitcode/layout/NavBrand/NavBrand";
import { usePathname, useRouter } from 'next/navigation';
import { DisabledTooltipWrapper } from "@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper";
import { BITCODE_PUBLIC_COPY } from "@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy";
import { getPublicShellSurface, getWorkspaceSurface, usesPublicShellChrome } from "@/components/bitcode/layout/WorkspaceSurface/workspace-surface";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { BITCODE_PUBLIC_EXPLAINERS } from "@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers";
import { bitcodeQaTelemetry, compactBitcodeAddress } from "@bitcode/auth/qa-telemetry";
import { clearLocalBitcodeWalletIdentity } from "@bitcode/auth/wallet-local";

const MemoBTDTracker = React.memo(BTDTracker);
const MemoNotificationsWidget = React.memo(NotificationsWidget);

const baseShadow = '[text-shadow:_0_0_6px_rgba(255,255,255,0.33)]';
const hoverShadowClass = 'hover:[text-shadow:_0_0_12px_rgba(101,254,183,0.66),_0_0_20px_rgba(101,254,183,0.66)]';

function useScrollPosition() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
}

function shouldApplyCollapseAnimation(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/executions');
}

const DISABLED_FEATURE_TOOLTIPS = {
  exchange:
    'Disabled for launch mode. When enabled, Packs opens the public activity and pack-reading surface.',
  terminal:
    'Disabled for launch mode. When enabled, Terminal opens the full deposit-to-settle ledger, proofs, and history workspace.',
  auxillaries:
    'Disabled for launch mode. When enabled, Auxillaries opens profile, connects, interface defaults, and $BTD posture.',
  createAccount:
    'Disabled for launch mode. When enabled, Connect Wallet starts wallet identity and onboarding setup.',
} as const;

const publicActionClassName =
  'flex-1 rounded-full border border-emerald-400/28 bg-emerald-400/12 px-4 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/18 tablet:flex-none';

const publicSecondaryActionClassName =
  'flex-1 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/22 hover:bg-white/10 tablet:flex-none';

const disabledActionClassName =
  'cursor-not-allowed border-white/10 bg-white/[0.025] text-neutral-400 opacity-65 grayscale hover:border-white/10 hover:bg-white/[0.025] hover:text-neutral-400';

const NAV_ENTRANCE_STORAGE_KEY = 'bitcode.navEntrancePlayed';
let navEntrancePlayedInRuntime = false;

function disabledClassName(className: string) {
  return `${className} ${disabledActionClassName}`;
}

function readStringField(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: userData,
    hasWalletConnection,
    walletConnectionStatus,
    btdBalance,
    btcFeeBalance,
    recentBtdAssetPacks,
    isLoading: isUserDataLoading,
    isRevalidating: isUserDataRevalidating,
  } = useUserData();
  const hasResolvedUserData = userData !== null;

  const [showNavUse, setShowNavUse] = useState(false);
  const [showNavEntrance, setShowNavEntrance] = useState(navEntrancePlayedInRuntime);
  const [shouldAnimateNavEntrance, setShouldAnimateNavEntrance] = useState(false);

  // Decorative elements for use button
  const orbitalElements = useMemo(() => [...Array(3)].map((_, i) => (
    <div key={i} className="orbital-neo" style={{ '--index': i } as React.CSSProperties} />
  )), []);
  const particleElements = useMemo(() => [...Array(5)].map((_, i) => (
    <div key={i} className="neo-particle" style={{ '--index': i } as React.CSSProperties} />
  )), []);

  // Initialize nav use visibility
  useEffect(() => {
    if (localStorage.getItem('hasVisitedSite')) {
      setShowNavUse(true);
    } else {
      localStorage.setItem('hasVisitedSite', 'true');
    }
  }, []);

  // Global event listeners for opening Auxillaries
  useEffect(() => {
    const openLogin = () => openAuxillaries('SignInWindow');
    const openOnboarding = () => openAuxillaries('SignUpWindow');
    document.addEventListener('open-auxillaries', openLogin);
    document.addEventListener('start-onboarding', openOnboarding);
    return () => {
      document.removeEventListener('open-auxillaries', openLogin);
      document.removeEventListener('start-onboarding', openOnboarding);
    };
  }, []);

  // Entrance animation should happen once per tab/session, not on every route remount.
  useEffect(() => {
    let shouldAnimate = !navEntrancePlayedInRuntime;

    try {
      const hasPlayedInSession = window.sessionStorage.getItem(NAV_ENTRANCE_STORAGE_KEY) === 'true';
      shouldAnimate = shouldAnimate && !hasPlayedInSession;
      if (shouldAnimate) {
        window.sessionStorage.setItem(NAV_ENTRANCE_STORAGE_KEY, 'true');
      }
    } catch {
      shouldAnimate = !navEntrancePlayedInRuntime;
    }

    navEntrancePlayedInRuntime = true;

    if (!shouldAnimate) {
      setShowNavEntrance(true);
      setShouldAnimateNavEntrance(false);
      return;
    }

    setShouldAnimateNavEntrance(true);
    const timer = setTimeout(() => setShowNavEntrance(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isScrolled = useScrollPosition();
  const shouldCollapse = shouldApplyCollapseAnimation(pathname);
  const navSurface: NavSurface = getWorkspaceSurface(pathname);
  const publicSurface = getPublicShellSurface(pathname);
  const usesWorkspaceChrome = navSurface !== null;
  const usesPublicChrome = usesPublicShellChrome(pathname);
  const usesProductChrome =
    usesPublicChrome || navSurface === 'packs';
  const usesWorkspaceOnlyChrome = usesWorkspaceChrome && !usesProductChrome;
  const profileRecord =
    userData?.profile && typeof userData.profile === 'object'
      ? (userData.profile as Record<string, unknown>)
      : null;
  const profileSettings =
    profileRecord?.settings && typeof profileRecord.settings === 'object'
      ? (profileRecord.settings as Record<string, unknown>)
      : null;
  const bitcodeProfileSettings =
    profileSettings?.bitcodeProfile && typeof profileSettings.bitcodeProfile === 'object'
      ? (profileSettings.bitcodeProfile as Record<string, unknown>)
      : null;
  const walletBinding =
    profileRecord?.wallet_binding && typeof profileRecord.wallet_binding === 'object'
      ? (profileRecord.wallet_binding as Record<string, unknown>)
      : null;
  const chromeWalletAddress =
    walletConnectionStatus?.address ??
    readStringField(profileRecord, 'wallet_address') ??
    readStringField(walletBinding, 'address');
  const chromeWalletProvider =
    walletConnectionStatus?.provider ??
    readStringField(profileRecord, 'wallet_provider') ??
    readStringField(walletBinding, 'provider');
  const chromeWalletLabel =
    readStringField(bitcodeProfileSettings, 'walletNickname', 'wallet_nickname') ??
    readStringField(profileRecord, 'wallet_nickname') ??
    compactBitcodeAddress(chromeWalletAddress, 6);
  const hasChromeWalletIdentity = Boolean(user || hasWalletConnection);
  const isWalletReadinessLoading = !hasResolvedUserData && isUserDataLoading;

  useEffect(() => {
    bitcodeQaTelemetry('info', 'nav', 'chrome-identity', {
      hasUser: Boolean(user),
      hasWalletConnection,
      hasResolvedUserData,
      isUserDataLoading,
      isUserDataRevalidating,
      isWalletReadinessLoading,
      walletProvider: chromeWalletProvider ?? null,
      walletAddress: compactBitcodeAddress(chromeWalletAddress, 6),
      btdBalance,
      btcFeeBalance,
    });
  }, [
    btdBalance,
    btcFeeBalance,
    chromeWalletAddress,
    chromeWalletProvider,
    hasResolvedUserData,
    hasWalletConnection,
    isUserDataLoading,
    isUserDataRevalidating,
    isWalletReadinessLoading,
    user,
  ]);

  // Determine if the nav should be fixed
  const shouldBeFixed = useMemo(() => {
    if (usesWorkspaceOnlyChrome) return false;
    if (usesProductChrome) return true;
    if (user) return true;
    if (!pathname) return true;
    return true;
  }, [usesWorkspaceOnlyChrome, usesProductChrome, user, pathname]);

  // Determine if the nav should be visually collapsed
  const isCollapsed = shouldCollapse && isScrolled;
  const disableAuxillaries = Boolean(FEATURE_FLAGS.DISABLE_AUXILLARIES);
  const disableCreateAccount = Boolean(FEATURE_FLAGS.DISABLE_CREATE_ACCOUNT);
  const disableExchangeLink = Boolean(FEATURE_FLAGS.DISABLE_EXCHANGE_LINK);
  const disableTerminalLink = Boolean(FEATURE_FLAGS.DISABLE_TERMINAL_LINK);
  const containerEntranceClassName = showNavEntrance
    ? shouldAnimateNavEntrance
      ? 'nav-container-animated'
      : 'opacity-100'
    : 'opacity-0';
  const controlsEntranceClassName = showNavEntrance
    ? shouldAnimateNavEntrance
      ? 'nav-controls-animated'
      : 'opacity-100'
    : 'opacity-0';
  const navItemEntranceClassName = showNavEntrance && shouldAnimateNavEntrance
    ? 'nav-item-animated'
    : '';

  // Compute positioning class
  const positionClass = usesWorkspaceOnlyChrome
    ? 'sticky inset-x-0 top-0'
    : shouldBeFixed
      ? 'fixed inset-x-0 top-0 mx-auto'
      : 'relative';

  // Compute translateY for expanded (offset) or collapsed (pinned) state
  const transformValue = usesWorkspaceOnlyChrome
    ? 'none'
    : usesProductChrome
      ? 'translateY(0)'
    : isCollapsed
      ? 'translateY(0)'
      : 'translateY(calc(var(--banner-offset,0px) + 4rem))';

  const handleLogoClick = () => {
    router.push('/')
  }

  const walletReadinessLoadingActions =
    (usesProductChrome || usesWorkspaceOnlyChrome) && isWalletReadinessLoading ? (
      <div
        className={`${controlsEntranceClassName} flex items-center justify-end`}
        data-testid="nav-wallet-readiness-loading"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.06)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
          Reading wallet
        </span>
      </div>
    ) : null;

  const workspaceGuestActions = usesWorkspaceOnlyChrome && !hasChromeWalletIdentity && !isWalletReadinessLoading ? (
    <div className={`${controlsEntranceClassName} flex items-center gap-2.5`}>
      {disableAuxillaries ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.auxillaries}>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={disabledClassName('rounded-full border border-emerald-400/28 bg-emerald-400/12 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/18')}
          >
            Open Auxillaries
          </button>
        </DisabledTooltipWrapper>
      ) : (
        <button
          type="button"
          onMouseEnter={() => prefetchAuxillaries()}
          onClick={() => openAuxillaries('login')}
          className="rounded-full border border-emerald-400/28 bg-emerald-400/12 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/18"
        >
          Open Auxillaries
        </button>
      )}
      {disableCreateAccount ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.createAccount}>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={disabledClassName('rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/22 hover:bg-white/10')}
          >
            Connect Wallet
          </button>
        </DisabledTooltipWrapper>
      ) : (
        <button
          type="button"
          onMouseEnter={() => prefetchAuxillaries()}
          onClick={() => openAuxillaries('SignUpWindow')}
          className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/22 hover:bg-white/10"
        >
          Connect Wallet
        </button>
      )}
    </div>
  ) : null;

  const publicGuestActions = usesProductChrome && !hasChromeWalletIdentity && !isWalletReadinessLoading ? (
    <div className={`${controlsEntranceClassName} flex w-full flex-wrap items-center gap-2 tablet:w-auto tablet:flex-nowrap tablet:justify-end tablet:gap-2.5`}>
      {disableAuxillaries ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.auxillaries} className="flex-1 tablet:flex-none">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={disabledClassName(publicActionClassName)}
          >
            {BITCODE_PUBLIC_COPY.publicNav.guestPrimaryCta}
          </button>
        </DisabledTooltipWrapper>
      ) : (
        <button
          type="button"
          onMouseEnter={() => prefetchAuxillaries()}
          onClick={() => openAuxillaries('login')}
          className={publicActionClassName}
        >
          {BITCODE_PUBLIC_COPY.publicNav.guestPrimaryCta}
        </button>
      )}
      {disableCreateAccount ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.createAccount} className="flex-1 tablet:flex-none">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={disabledClassName(publicSecondaryActionClassName)}
          >
            {BITCODE_PUBLIC_COPY.publicNav.guestSecondaryCta}
          </button>
        </DisabledTooltipWrapper>
      ) : (
        <button
          type="button"
          onMouseEnter={() => prefetchAuxillaries()}
          onClick={() => openAuxillaries('SignUpWindow')}
          className={publicSecondaryActionClassName}
        >
          {BITCODE_PUBLIC_COPY.publicNav.guestSecondaryCta}
        </button>
      )}
    </div>
  ) : null;

  const publicRouteLinks = usesProductChrome ? (
    <ul className="flex w-full flex-wrap items-center gap-2 phone:gap-3 tablet:ml-8 tablet:w-auto tablet:flex-1 tablet:flex-nowrap tablet:justify-center tablet:gap-4 laptop:ml-12 laptop:gap-6">
      {BITCODE_PUBLIC_COPY.publicNav.links.map(({ href, label }, index) => {
        const isPacksRoute = href === '/packs';
        const isDepositRoute = href === '/deposits';
        const isReadRoute = href === '/reads';
        const isDisabledRoute = isPacksRoute && disableExchangeLink;
        const isActiveRoute = isPacksRoute
          ? pathname === '/packs' ||
            pathname?.startsWith('/packs/') ||
            pathname === '/exchange' ||
            pathname?.startsWith('/exchange/')
          : pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <li
            key={href}
            className={navItemEntranceClassName}
            style={{ '--item-index': index } as React.CSSProperties}
          >
            <span className="inline-flex items-center gap-1.5">
              {isDisabledRoute ? (
                <DisabledTooltipWrapper
                  tooltip={DISABLED_FEATURE_TOOLTIPS.exchange}
                >
                  <span
                    role="link"
                    aria-disabled="true"
                    aria-current={isActiveRoute ? 'page' : undefined}
                    className={`
                      inline-flex cursor-not-allowed rounded-full border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition
                      ${isActiveRoute
                        ? 'border-emerald-300/20 bg-emerald-400/[0.06] text-emerald-100/55'
                        : 'border-white/10 bg-white/[0.025] text-neutral-500'}
                    `}
                  >
                    {label}
                  </span>
                </DisabledTooltipWrapper>
              ) : (
                <Link
                  href={href}
                  aria-current={isActiveRoute ? 'page' : undefined}
                  className={`
                    rounded-full border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition
                    ${isActiveRoute
                      ? 'border-emerald-300/38 bg-emerald-400/14 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.16)]'
                      : 'border-white/10 bg-white/[0.025] text-neutral-400 hover:border-emerald-300/24 hover:bg-emerald-400/[0.08] hover:text-emerald-100'}
                  `}
                >
                  {label}
                </Link>
              )}
              {isPacksRoute ? (
                <BitcodeInlineExplainer
                  explainer={BITCODE_PUBLIC_EXPLAINERS.network}
                  side="bottom"
                  triggerClassName="h-4.5 w-4.5 border-white/10 bg-white/[0.03] text-[0.58rem] text-neutral-300 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                />
              ) : isDepositRoute ? (
                <BitcodeInlineExplainer
                  explainer={BITCODE_PUBLIC_EXPLAINERS.deposit}
                  side="bottom"
                  triggerClassName="h-4.5 w-4.5 border-white/10 bg-white/[0.03] text-[0.58rem] text-neutral-300 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                />
              ) : isReadRoute ? (
                <BitcodeInlineExplainer
                  explainer={BITCODE_PUBLIC_EXPLAINERS.read}
                  side="bottom"
                  triggerClassName="h-4.5 w-4.5 border-white/10 bg-white/[0.03] text-[0.58rem] text-neutral-300 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                />
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div className="relative">
      <div
        className={`nav-container-global ${positionClass} z-50 ${usesWorkspaceOnlyChrome ? 'border-b border-white/8 bg-[rgba(4,8,18,0.92)] shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl' : ''} ${usesProductChrome ? 'bg-transparent shadow-none' : ''} ${!usesWorkspaceOnlyChrome && !usesProductChrome && isCollapsed ? 'nav-scrolled-bg' : ''} ${containerEntranceClassName} ${!usesWorkspaceOnlyChrome && !usesProductChrome && isCollapsed ? 'w-[80%]' : 'w-full'}`}
        style={{
          transformOrigin: 'center top',
          transform: transformValue,
          width: !usesWorkspaceOnlyChrome && !usesProductChrome && isCollapsed ? '80%' : '100%',
          transition: usesWorkspaceOnlyChrome
            ? 'opacity 250ms ease-out'
            : usesProductChrome
              ? 'opacity 250ms ease-out'
            : shouldCollapse
            ? isCollapsed
              ? 'transform 500ms ease-in-out, width 250ms ease-in-out'
              : 'transform 250ms ease-in-out, width 500ms ease-in-out'
            : undefined,
          padding: usesWorkspaceOnlyChrome ? '0px' : '2px',
          paddingBottom: usesWorkspaceOnlyChrome ? '0px' : usesProductChrome ? '0px' : '16px',
          isolation: 'isolate',
          border: 'none',
        }}
      >
        <div className={`max-w-7xl mx-auto px-4 tablet:px-6 laptop:px-8 desktop:px-12 wide:px-16 ${usesProductChrome ? 'flex w-full flex-col gap-3 py-3 tablet:flex-row tablet:items-center tablet:justify-between' : `flex items-center justify-between ${usesWorkspaceOnlyChrome ? 'py-3.5' : 'py-4 pb-6'}`}`}>
          <div className={usesProductChrome ? 'flex w-full flex-col gap-3 tablet:min-w-0 tablet:flex-1 tablet:flex-row tablet:items-center' : 'flex items-center w-full'}>
            <NavBrand
              animated={showNavEntrance && shouldAnimateNavEntrance}
              visible={showNavEntrance}
              onClick={handleLogoClick}
              surface={navSurface ?? publicSurface}
            />
            {usesProductChrome ? publicRouteLinks : null}
            {!usesProductChrome && !hasChromeWalletIdentity && <div className="flex-1" />}
            {!usesProductChrome && hasChromeWalletIdentity && (
              <ul className={`flex items-center space-x-2 phone:space-x-4 tablet:space-x-6 text-sm phone:text-base tablet:text-lg w-full justify-center ${usesWorkspaceOnlyChrome ? 'tablet:ml-10' : 'tablet:ml-[130px]'}`}>
                {[
                  { href: '/packs', label: 'packs' },
                ].map(({ href, label }, index) => {
                  const isDisabled = disableTerminalLink;
                  const shouldAnimate = showNavEntrance && shouldAnimateNavEntrance;
                  const isActiveRoute =
                    pathname === '/packs' || pathname === '/terminal' ||
                    pathname?.startsWith('/executions') ||
                    pathname?.startsWith('/conversations');
                  return (
                    <li key={href}
                      className={`${shouldAnimate ? 'nav-item-animated' : ''}`.trim()}
                      style={{ '--item-index': index } as React.CSSProperties}
                    >
                      <div className="group relative">
                        {isDisabled ? (
                          <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.terminal}>
                            <span
                              data-testid={`nav-${label}-link`}
                              role="link"
                              aria-disabled="true"
                              className={`
                          text-xl font-light text-neutral-700 dark:text-neutral-300
                          relative transition-all duration-200 ease-in-out
                          px-1 py-2 inline-block origin-left
                          ${baseShadow} opacity-50 pointer-events-none
                        `}
                            >
                              <span className="inline-block">{label}</span>
                            </span>
                          </DisabledTooltipWrapper>
                        ) : (
                          <a
                            data-testid={`nav-${label}-link`}
                            aria-current={isActiveRoute ? 'page' : undefined}
                            href={href}
                            className={`
                          text-xl font-light relative transition-all duration-200 ease-in-out 
                          px-1 py-2 inline-block origin-left 
                          ${isActiveRoute
                                ? 'nav-item-active !text-emerald-400'
                                : `text-neutral-700 dark:text-neutral-300 nav-item-hover-effect ${hoverShadowClass}`}
                          ${!isActiveRoute && baseShadow}
                        `}
                          >
                            <span className={`
                          inline-block transition-transform duration-200 ease-in-out
                          ${isActiveRoute ? 'nav-item-active-text' : ''}
                        `}>
                              {label}
                            </span>
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={usesProductChrome ? 'flex w-full flex-wrap items-center gap-2 tablet:w-auto tablet:flex-nowrap tablet:justify-end tablet:gap-4' : 'flex items-center justify-center space-x-4'}>
            {walletReadinessLoadingActions ? (
              walletReadinessLoadingActions
            ) : workspaceGuestActions ? (
              workspaceGuestActions
            ) : publicGuestActions ? (
              publicGuestActions
            ) : hasChromeWalletIdentity ? (
              <div className={`${controlsEntranceClassName} flex items-center space-x-3.5`}>
                {!FEATURE_FLAGS.HIDE_BTD_TRACKER && (
                  <MemoBTDTracker
                    btdBalance={btdBalance}
                    btcFeeBalance={btcFeeBalance}
                    recentBtdAssetPacks={recentBtdAssetPacks}
                    isLoading={isUserDataLoading || isUserDataRevalidating}
                    hasWalletIdentity={hasWalletConnection}
                    walletLabel={chromeWalletLabel}
                    walletAddress={chromeWalletAddress}
                    walletProvider={chromeWalletProvider}
                    onOpenBtdAuxillary={() => openAuxillaries('auxillaries', 'wallet')}
                  />
                )}

                {FEATURE_FLAGS.NOTIFICATIONS && user && (
                  <MemoNotificationsWidget />
                )}

                {user ? (
                  <UserMenu
                    user={user}
                    onOpenAuxillaries={() => openAuxillaries('auxillaries', 'profile')}
                    onSignOut={() => {
                      import('@bitcode/supabase/ssr/client').then(({ createClient }) => {
                        const client = createClient();
                        client.auth.signOut().finally(() => {
                          clearLocalBitcodeWalletIdentity();
                          // Show login pane after sign out
                          openAuxillaries('login');
                          // Redirect from authenticated pages
                          if (pathname && pathname.startsWith('/upgrades')) {
                            router.replace('/');
                          }
                        });
                      });
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onMouseEnter={() => prefetchAuxillaries()}
                    onClick={() => openAuxillaries('auxillaries', 'profile')}
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/22 hover:bg-white/10"
                  >
                    Profile
                  </button>
                )}
              </div>
            ) : (
              showNavUse && (
                <div className={showNavEntrance ? 'opacity-100 transition-opacity duration-500 delay-300' : 'opacity-0'}>
                  {FEATURE_FLAGS.DISABLE_USING ? (
                    <DisabledTooltipWrapper tooltip="Auxillaries access is refreshing" className="inline-block">
                      <AuxillariesUseButton isDisabled auxillaries={orbitalElements} particles={particleElements} />
                    </DisabledTooltipWrapper>
                  ) : (
                    <AuxillariesUseButton
                      onHoverPrefetch={() => prefetchAuxillaries()}
                      onClick={() => openAuxillaries(user ? 'auxillaries' : 'login')}
                      auxillaries={orbitalElements}
                      particles={particleElements}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Spacer below the nav */}
      <div
        className={`transition-all duration-500 ease-out ${shouldBeFixed ? (usesProductChrome ? 'h-0' : isCollapsed ? 'h-28' : 'h-36') : 'h-0'
          }`}
      />
    </div>
  );
}
