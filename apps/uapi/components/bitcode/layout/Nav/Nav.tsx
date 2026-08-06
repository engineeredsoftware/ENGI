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
import NavBrand, { type NavSurface } from "@/components/bitcode/layout/NavBrand/NavBrand";
import { usePathname, useRouter } from 'next/navigation';
import { DisabledTooltipWrapper } from "@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper";
import { BITCODE_PUBLIC_COPY } from "@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy";
import { getPublicShellSurface, getWorkspaceSurface, usesPublicShellChrome } from "@/components/bitcode/layout/WorkspaceSurface/workspace-surface";
import { bitcodeQaTelemetry, compactBitcodeAddress } from "@bitcode/auth/qa-telemetry";
import BitcodeQuantumChromeButton from "@/components/bitcode/layout/BitcodeQuantumChromeButton/BitcodeQuantumChromeButton";

const MemoBTDTracker = React.memo(BTDTracker);
const MemoNotificationsWidget = React.memo(NotificationsWidget);

const baseShadow = '[text-shadow:_0_0_6px_rgba(255,255,255,0.33)]';
const hoverShadowClass = 'hover:[text-shadow:_0_0_12px_rgba(101,254,183,0.66),_0_0_20px_rgba(101,254,183,0.66)]';

function useScrollPosition(thresholdPx = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const readScrolled = () => window.scrollY > thresholdPx;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = readScrolled();
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    // Sync initial paint (e.g. restore scroll / deep-link mid-page).
    setScrolled(readScrolled());
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholdPx]);

  return scrolled;
}

function shouldApplyCollapseAnimation(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/executions');
}

const DISABLED_FEATURE_TOOLTIPS = {
  exchange:
    'Disabled for launch mode. When enabled, Exchange opens the public activity and DataPack-reading surface.',
  packs:
    'Disabled for launch mode. When enabled, Exchange opens the public activity and DataPack-reading surface.',
  auxillaries:
    'Disabled for launch mode. When enabled, Auxillaries opens profile, connects, interface defaults, and $BTD posture.',
  createAccount:
    'Disabled for launch mode. When enabled, Connect Wallet starts wallet identity and onboarding setup.',
} as const;

const publicActionClassName =
  'flex-1 rounded-none border border-emerald-400/28 bg-emerald-400/12 px-4 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/18 tablet:flex-none';

const publicSecondaryActionClassName =
  'flex-1 rounded-none border border-white/12 bg-white/5 px-4 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/22 hover:bg-white/10 tablet:flex-none';

/**
 * Fixed right-chrome band for product / workspace nav.
 * Phone: content-sized (sits on brand row). Tablet+: reserved width so center
 * route links do not shift when wallet readiness resolves.
 */
/**
 * Clip — never overflow-x-auto. Auto created a 1px green scrollbar next to the
 * BTD tracker on tight phone widths when content was slightly over the slot.
 */
const NAV_RIGHT_CHROME_SLOT_CLASS =
  'nav-right-chrome-slot flex min-w-0 shrink-0 items-center justify-end overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden tablet:w-[21rem] tablet:min-w-[21rem] tablet:max-w-[21rem] tablet:overflow-visible';

const disabledActionClassName =
  'cursor-not-allowed border-white/10 bg-white/[0.025] text-neutral-400 opacity-65 grayscale hover:border-white/10 hover:bg-white/[0.025] hover:text-neutral-400';

/**
 * Module flag only (not sessionStorage): full page reloads re-run the entrance.
 * Survives SPA remounts of Nav so client route changes don’t replay it.
 * Must not be set until the entrance actually starts — React Strict Mode
 * double-invokes effects and would otherwise skip the real play.
 */
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
  const { user, loading: isAuthLoading } = useAuth();
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
    const openConnect = () => openAuxillaries('ConnectWindow');
    const openOnboarding = () => openAuxillaries('AuxillariesWindow');
    document.addEventListener('open-auxillaries', openConnect);
    document.addEventListener('start-onboarding', openOnboarding);
    return () => {
      document.removeEventListener('open-auxillaries', openConnect);
      document.removeEventListener('start-onboarding', openOnboarding);
    };
  }, []);

  // Hold opacity-0, then cascade brand → links → wallet with marketing ease.
  // Full reload always animates; SPA remounts of Nav are suppressed by the module flag.
  useEffect(() => {
    // Drop legacy session gate so reloads actually show the entrance again.
    try {
      window.sessionStorage.removeItem('bitcode.navEntrancePlayed');
    } catch {
      /* ignore */
    }

    if (navEntrancePlayedInRuntime) {
      setShowNavEntrance(true);
      setShouldAnimateNavEntrance(false);
      return;
    }

    let cancelled = false;
    setShouldAnimateNavEntrance(true);

    // Align with marketing hero start so the bar feels part of the same sequence.
    const startTimer = setTimeout(() => {
      if (cancelled) return;
      navEntrancePlayedInRuntime = true;
      setShowNavEntrance(true);
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, []);

  const isScrolled = useScrollPosition();
  const shouldCollapse = shouldApplyCollapseAnimation(pathname);
  const navSurface: NavSurface = getWorkspaceSurface(pathname);
  const publicSurface = getPublicShellSurface(pathname);
  const usesWorkspaceChrome = navSurface !== null;
  const usesPublicChrome = usesPublicShellChrome(pathname);
  // getWorkspaceSurface maps /exchange and /exchange → 'exchange'.
  const usesProductChrome = usesPublicChrome || navSurface === 'exchange';
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
  // Session user and/or verified wallet binding. Connected chrome never falls
  // back to a text "Profile" CTA — only the notification + account icons.
  const hasChromeWalletIdentity = Boolean(user || hasWalletConnection);
  // Cold first paint only. Background revalidation / Auth remounts must not
  // replace connected chrome with "Reading wallet" on every product route change.
  const isWalletReadinessLoading =
    !hasChromeWalletIdentity &&
    ((isUserDataLoading && !hasResolvedUserData) || (isAuthLoading && !user));

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
  const disablePacksLink = Boolean(FEATURE_FLAGS.DISABLE_PACKS_LINK);
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
  // Hold links invisible until stagger starts (avoids flash before delay).
  const navItemEntranceClassName = !showNavEntrance
    ? 'opacity-0'
    : shouldAnimateNavEntrance
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
        className={`${controlsEntranceClassName} flex h-8 items-center justify-end`}
        data-testid="nav-wallet-readiness-loading"
        aria-live="polite"
      >
        <span className="inline-flex h-8 max-h-8 min-h-8 items-center gap-2 rounded-none border border-white/10 bg-white/[0.045] px-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.06)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
          Reading wallet
        </span>
      </div>
    ) : null;

  // Guests (no session / wallet identity): rich quantum Connect Wallet CTA
  // matching the BTD tracker chrome (not the flat emerald outline).
  // ButtonShimmer (marketing) is the other rich button family — reserved for
  // landing CTAs; nav/wallet chrome uses this quantum tracker language.
  const renderConnectWalletCta = () => (
    <BitcodeQuantumChromeButton
      disabled={disableCreateAccount}
      aria-label={BITCODE_PUBLIC_COPY.publicNav.guestSecondaryCta}
      onMouseEnter={() => {
        if (!disableCreateAccount) prefetchAuxillaries();
      }}
      onClick={() => {
        if (disableCreateAccount) return;
        openAuxillaries('AuxillariesWindow');
      }}
      className="h-8 min-h-8 px-5"
    >
      {BITCODE_PUBLIC_COPY.publicNav.guestSecondaryCta}
    </BitcodeQuantumChromeButton>
  );

  const workspaceGuestActions = usesWorkspaceOnlyChrome && !hasChromeWalletIdentity && !isWalletReadinessLoading ? (
    <div className={`${controlsEntranceClassName} flex h-8 items-center justify-end`}>
      {disableCreateAccount ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.createAccount}>
          {renderConnectWalletCta()}
        </DisabledTooltipWrapper>
      ) : (
        renderConnectWalletCta()
      )}
    </div>
  ) : null;

  const publicGuestActions = usesProductChrome && !hasChromeWalletIdentity && !isWalletReadinessLoading ? (
    <div className={`${controlsEntranceClassName} flex h-8 items-center justify-end`}>
      {disableCreateAccount ? (
        <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.createAccount}>
          {renderConnectWalletCta()}
        </DisabledTooltipWrapper>
      ) : (
        renderConnectWalletCta()
      )}
    </div>
  ) : null;

  /** Right-chrome body (wallet / tracker) — shared phone brand-row + tablet slot. */
  const productRightChromeBody = walletReadinessLoadingActions
    ? walletReadinessLoadingActions
    : workspaceGuestActions
      ? workspaceGuestActions
      : publicGuestActions
        ? publicGuestActions
        : hasChromeWalletIdentity
          ? (
            <div className={`${controlsEntranceClassName} flex h-8 items-center justify-end gap-2 phone:gap-3.5`}>
              {FEATURE_FLAGS.NOTIFICATIONS && (
                <MemoNotificationsWidget />
              )}
              {!FEATURE_FLAGS.HIDE_BTD_TRACKER && (
                <MemoBTDTracker
                  btdBalance={btdBalance}
                  btcFeeBalance={btcFeeBalance}
                  recentBtdAssetPacks={recentBtdAssetPacks}
                  isLoading={isUserDataLoading && !hasChromeWalletIdentity}
                  hasWalletIdentity={hasChromeWalletIdentity}
                  walletLabel={chromeWalletLabel}
                  walletAddress={chromeWalletAddress}
                  walletProvider={chromeWalletProvider}
                  onOpenBtdAuxillary={() => openAuxillaries('auxillaries', 'wallet')}
                />
              )}
            </div>
          )
          : showNavUse
            ? (
              <div className={showNavEntrance ? 'opacity-100 transition-opacity duration-500 delay-300' : 'opacity-0'}>
                {FEATURE_FLAGS.DISABLE_USING ? (
                  <DisabledTooltipWrapper tooltip="Auxillaries access is refreshing" className="inline-block">
                    <AuxillariesUseButton isDisabled auxillaries={orbitalElements} particles={particleElements} />
                  </DisabledTooltipWrapper>
                ) : (
                  <AuxillariesUseButton
                    onHoverPrefetch={() => prefetchAuxillaries()}
                    onClick={() => openAuxillaries(user ? 'auxillaries' : 'connect')}
                    auxillaries={orbitalElements}
                    particles={particleElements}
                  />
                )}
              </div>
            )
            : null;

  // Product nav themes match pillar language: Read orange · Exchange green · Deposit purple.
  // Idle hover border/glow strength is matched across all three (Deposit was the reference).
  const publicRouteLinkThemes = {
    read: {
      active:
        'border-orange-300/42 bg-orange-400/16 text-orange-100 shadow-[0_0_20px_rgba(251,146,60,0.22)]',
      idle:
        'border-white/10 bg-white/[0.025] text-neutral-400 hover:border-orange-300/42 hover:bg-orange-400/[0.12] hover:text-orange-100 hover:shadow-[0_0_18px_rgba(251,146,60,0.16)]',
      disabledActive:
        'border-orange-300/20 bg-orange-400/[0.06] text-orange-100/55',
    },
    exchange: {
      active:
        'border-emerald-300/42 bg-emerald-400/16 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.20)]',
      idle:
        'border-white/10 bg-white/[0.025] text-neutral-400 hover:border-emerald-300/42 hover:bg-emerald-400/[0.12] hover:text-emerald-100 hover:shadow-[0_0_18px_rgba(16,185,129,0.16)]',
      disabledActive:
        'border-emerald-300/20 bg-emerald-400/[0.06] text-emerald-100/55',
    },
    // Match Deposit pillar: purple/fuchsia (not Tailwind violet, which reads blue).
    deposit: {
      active:
        'border-purple-300/42 bg-purple-500/16 text-purple-100 shadow-[0_0_20px_rgba(192,132,252,0.22)]',
      idle:
        'border-white/10 bg-white/[0.025] text-neutral-400 hover:border-purple-300/42 hover:bg-purple-500/[0.12] hover:text-purple-100 hover:shadow-[0_0_18px_rgba(192,132,252,0.16)]',
      disabledActive:
        'border-purple-300/22 bg-purple-500/[0.07] text-purple-100/55',
    },
  } as const;

  const publicRouteLinks = usesProductChrome ? (
    <ul className="flex w-full min-w-0 flex-wrap items-center gap-1.5 phone:gap-2 tablet:ml-6 tablet:w-auto tablet:flex-1 tablet:flex-nowrap tablet:justify-center tablet:gap-3 laptop:ml-10 laptop:gap-5">
      {BITCODE_PUBLIC_COPY.publicNav.links.map(({ href, label }, index) => {
        // Public nav SSOT uses /exchange only; /exchange is compat path active state.
        const isExchangeRoute = href === '/exchange';
        const isDepositRoute = href === '/deposits';
        const isReadRoute = href === '/reads';
        const routeTheme = isReadRoute
          ? publicRouteLinkThemes.read
          : isDepositRoute
            ? publicRouteLinkThemes.deposit
            : publicRouteLinkThemes.exchange;
        const isDisabledRoute = isExchangeRoute && disableExchangeLink;
        const isActiveRoute = isExchangeRoute
          ? pathname === '/exchange' ||
            pathname?.startsWith('/exchange/') ||
            pathname === '/packs' ||
            pathname?.startsWith('/packs/')
          : pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <li
            key={href}
            className={navItemEntranceClassName}
            style={{ '--item-index': index } as React.CSSProperties}
          >
            {isDisabledRoute ? (
              <DisabledTooltipWrapper
                tooltip={DISABLED_FEATURE_TOOLTIPS.exchange}
              >
                <span
                  role="link"
                  aria-disabled="true"
                  aria-current={isActiveRoute ? 'page' : undefined}
                  className={`
                    inline-flex cursor-not-allowed rounded-none border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition
                    ${isActiveRoute
                      ? routeTheme.disabledActive
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
                  rounded-none border px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em]
                  transition-[color,background-color,border-color,box-shadow] duration-200
                  ${isActiveRoute ? routeTheme.active : routeTheme.idle}
                `}
              >
                {label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div className="relative">
      <div
        className={`nav-container-global ${positionClass} z-50 ${usesWorkspaceOnlyChrome ? 'border-b border-white/8 bg-[rgba(4,8,18,0.92)] shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl' : ''} ${usesProductChrome ? (isScrolled ? 'nav-product-scrolled-bg shadow-none' : 'bg-transparent shadow-none') : ''} ${!usesWorkspaceOnlyChrome && !usesProductChrome && isCollapsed ? 'nav-scrolled-bg' : ''} ${containerEntranceClassName} ${!usesWorkspaceOnlyChrome && !usesProductChrome && isCollapsed ? 'w-[80%]' : 'w-full'}`}
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
          // Product chrome: no outer pad — equal vertical rhythm lives on the inner row (py-3).
          // Non-product keeps the legacy 2px shell + larger bottom pad when expanded.
          padding: usesWorkspaceOnlyChrome || usesProductChrome ? '0px' : '2px',
          paddingBottom: usesWorkspaceOnlyChrome || usesProductChrome ? '0px' : '16px',
          isolation: 'isolate',
          border: 'none',
        }}
      >
        <div
          className={`mx-auto max-w-7xl px-3 phone:px-4 tablet:px-6 laptop:px-8 desktop:px-12 wide:px-16 ${
            usesProductChrome
              ? // Single DOM chrome: phone brand|wallet then links; tablet brand+links | wallet.
                'flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2.5 py-2 phone:gap-y-3 phone:py-2.5 tablet:flex-nowrap tablet:justify-between'
              : `flex w-full min-w-0 items-center justify-between ${usesWorkspaceOnlyChrome ? 'py-3.5' : 'py-4 pb-6'}`
          }`}
        >
          {usesProductChrome ? (
            <>
              <div className="order-1 min-w-0 shrink-0">
                <NavBrand
                  animated={showNavEntrance && shouldAnimateNavEntrance}
                  visible={showNavEntrance}
                  onClick={handleLogoClick}
                  surface={navSurface ?? publicSurface}
                />
              </div>
              <div className="order-3 w-full min-w-0 tablet:order-2 tablet:w-auto tablet:flex-1 tablet:px-0">
                {publicRouteLinks}
              </div>
              <div
                data-testid="nav-right-chrome"
                className={`order-2 ml-auto shrink-0 tablet:order-3 tablet:ml-0 ${NAV_RIGHT_CHROME_SLOT_CLASS}`}
              >
                {productRightChromeBody}
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full min-w-0 items-center">
                <NavBrand
                  animated={showNavEntrance && shouldAnimateNavEntrance}
                  visible={showNavEntrance}
                  onClick={handleLogoClick}
                  surface={navSurface ?? publicSurface}
                />
                {!hasChromeWalletIdentity && <div className="flex-1" />}
                {hasChromeWalletIdentity && (
                  <ul className={`flex items-center space-x-2 phone:space-x-4 tablet:space-x-6 text-sm phone:text-base tablet:text-lg w-full justify-center ${usesWorkspaceOnlyChrome ? 'tablet:ml-10' : 'tablet:ml-[130px]'}`}>
                    {[
                      { href: '/exchange', label: 'exchange' },
                    ].map(({ href, label }, index) => {
                      const isDisabled = disablePacksLink || disableExchangeLink;
                      const shouldAnimate = showNavEntrance && shouldAnimateNavEntrance;
                      const isActiveRoute =
                        pathname === '/exchange' ||
                        pathname?.startsWith('/exchange/') ||
                        pathname === '/packs' ||
                        pathname?.startsWith('/packs/') ||
                        pathname?.startsWith('/executions') ||
                        pathname?.startsWith('/conversations');
                      return (
                        <li key={href}
                          className={`${shouldAnimate ? 'nav-item-animated' : ''}`.trim()}
                          style={{ '--item-index': index } as React.CSSProperties}
                        >
                          <div className="group relative">
                            {isDisabled ? (
                              <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.packs}>
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
              <div
                data-testid="nav-right-chrome"
                className={
                  usesWorkspaceOnlyChrome
                    ? NAV_RIGHT_CHROME_SLOT_CLASS
                    : 'flex items-center justify-center space-x-4'
                }
              >
                {walletReadinessLoadingActions
                  ? walletReadinessLoadingActions
                  : workspaceGuestActions
                    ? workspaceGuestActions
                    : publicGuestActions
                      ? publicGuestActions
                      : hasChromeWalletIdentity
                        ? (
                          <div className={`${controlsEntranceClassName} flex h-8 w-full items-center justify-end gap-3.5`}>
                            {FEATURE_FLAGS.NOTIFICATIONS && (
                              <MemoNotificationsWidget />
                            )}
                            {!FEATURE_FLAGS.HIDE_BTD_TRACKER && (
                              <MemoBTDTracker
                                btdBalance={btdBalance}
                                btcFeeBalance={btcFeeBalance}
                                recentBtdAssetPacks={recentBtdAssetPacks}
                                isLoading={isUserDataLoading && !hasChromeWalletIdentity}
                                hasWalletIdentity={hasChromeWalletIdentity}
                                walletLabel={chromeWalletLabel}
                                walletAddress={chromeWalletAddress}
                                walletProvider={chromeWalletProvider}
                                onOpenBtdAuxillary={() => openAuxillaries('auxillaries', 'wallet')}
                              />
                            )}
                          </div>
                        )
                        : showNavUse
                          ? (
                            <div className={showNavEntrance ? 'opacity-100 transition-opacity duration-500 delay-300' : 'opacity-0'}>
                              {FEATURE_FLAGS.DISABLE_USING ? (
                                <DisabledTooltipWrapper tooltip="Auxillaries access is refreshing" className="inline-block">
                                  <AuxillariesUseButton isDisabled auxillaries={orbitalElements} particles={particleElements} />
                                </DisabledTooltipWrapper>
                              ) : (
                                <AuxillariesUseButton
                                  onHoverPrefetch={() => prefetchAuxillaries()}
                                  onClick={() => openAuxillaries(user ? 'auxillaries' : 'connect')}
                                  auxillaries={orbitalElements}
                                  particles={particleElements}
                                />
                              )}
                            </div>
                          )
                          : null}
              </div>
            </>
          )}
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
