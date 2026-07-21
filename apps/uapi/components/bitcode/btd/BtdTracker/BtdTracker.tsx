
'use client';

import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import Logo from '@/components/bitcode/branding/Logo/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { prefetchAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';

interface BtdAssetPackSummary {
  assetPackId: string;
  label?: string;
  rangeStart?: number;
  rangeEndExclusive?: number;
  acquiredAt?: string | null;
}

interface BTDTrackerProps {
  btdBalance: number;
  btcFeeBalance?: number | null;
  recentBtdAssetPacks?: BtdAssetPackSummary[];
  isLoading?: boolean;
  hasWalletIdentity?: boolean;
  walletLabel?: string | null;
  walletAddress?: string | null;
  walletProvider?: string | null;
  onOpenBtdAuxillary?: () => void;
}

function formatAssetPackSummary(assetPack: BtdAssetPackSummary) {
  const label = assetPack.label?.trim() || assetPack.assetPackId.trim();
  if (!label) return null;
  return label;
}

export function BTDTracker({
  btdBalance,
  btcFeeBalance = null,
  recentBtdAssetPacks = [],
  isLoading = false,
  hasWalletIdentity = false,
  walletLabel = null,
  walletAddress = null,
  walletProvider = null,
  onOpenBtdAuxillary,
}: BTDTrackerProps) {
  const [displayedBtdBalance, setDisplayedBtdBalance] = useState(btdBalance);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // Once wallet identity is known, keep balances visible during background revalidation
  // (product routes remount shell providers and re-fetch without re-connecting).
  const isBalanceLoading =
    isLoading && btdBalance === 0 && !hasWalletIdentity;
  const shouldShowWalletNow = isHovered && !isBalanceLoading;
  const assetPackCount = recentBtdAssetPacks.length;
  // Chrome tokens share "# LABEL" order (e.g. "0 BTD | 0 APs").
  const btdBalanceLabel = `${displayedBtdBalance.toLocaleString()} BTD`;
  const assetPacksLabel = `${assetPackCount.toLocaleString()} APs`;
  const balanceLabel = isBalanceLoading
    ? 'Reading BTD and APs posture'
    : `${btdBalanceLabel}; ${assetPacksLabel}`;
  /** Full hover identity for title/tooltip (never CSS mid-clipped). */
  const walletFullLabel = useMemo(() => {
    const explicitLabel = walletLabel?.trim();
    if (explicitLabel) return explicitLabel;
    return walletAddress?.trim() || 'BTD wallet';
  }, [walletAddress, walletLabel]);
  const recentAssetPackTitle = useMemo(() => {
    const labels = recentBtdAssetPacks
      .slice(0, 5)
      .map(formatAssetPackSummary)
      .filter((label): label is string => Boolean(label));

    if (labels.length === 0) return assetPacksLabel;
    return `${assetPacksLabel}: ${labels.join(', ')}`;
  }, [assetPacksLabel, recentBtdAssetPacks]);

  /**
   * Stable chrome width:
   * - Text slot = max width of *default* content variants only (BTD|APs at current
   *   #s, "Reading wallet", "Opening BTD…").
   * - Hover/alt wallet address is NOT measured into chrome width — it must fit
   *   the existing slot via mid-ellipsis compact (or CSS end-ellipsis fallback)
   *   so flip states never resize the box.
   * - Slot grows only when BTD/APs digit length exceeds that floor.
   */
  const btdMeasureRef = useRef<HTMLSpanElement>(null);
  const readingMeasureRef = useRef<HTMLSpanElement>(null);
  const openingMeasureRef = useRef<HTMLSpanElement>(null);
  const walletFitMeasureRef = useRef<HTMLSpanElement>(null);
  const [textSlotWidth, setTextSlotWidth] = useState(0);
  const [walletActionLabel, setWalletActionLabel] = useState('BTD wallet');
  useLayoutEffect(() => {
    const widths = [
      btdMeasureRef.current?.offsetWidth ?? 0,
      readingMeasureRef.current?.offsetWidth ?? 0,
      openingMeasureRef.current?.offsetWidth ?? 0,
    ];
    setTextSlotWidth(Math.ceil(Math.max(0, ...widths)));
  }, [assetPackCount, displayedBtdBalance]);

  // Fit hover address into the fixed text slot: step mid-ellipsis edge down so
  // the string is never hard-clipped by overflow (center+truncate cutoffs).
  useLayoutEffect(() => {
    const measureEl = walletFitMeasureRef.current;
    const source = walletFullLabel;
    if (!measureEl || !source) {
      setWalletActionLabel('BTD wallet');
      return;
    }
    const measure = (value: string) => {
      measureEl.textContent = value;
      return measureEl.offsetWidth;
    };
    const maxWidth = textSlotWidth > 0 ? textSlotWidth : Number.POSITIVE_INFINITY;
    // Prefer address mid-compact when we have a chain address.
    const addressSource = walletAddress?.trim() || source;
    for (let edge = 6; edge >= 3; edge -= 1) {
      const candidate = compactBitcodeAddress(addressSource, edge) ?? addressSource;
      if (measure(candidate) <= maxWidth) {
        setWalletActionLabel(candidate);
        return;
      }
    }
    // Nickname / last-resort: keep a short compact; CSS ellipsis handles remainder.
    const fallback = compactBitcodeAddress(addressSource, 3) ?? addressSource;
    setWalletActionLabel(fallback);
  }, [textSlotWidth, walletAddress, walletFullLabel]);

  // Icon + gap + text slot + horizontal padding (px-3 = 12px each side).
  // Layout icon column stays 16px + gap-x-2.5 (chrome width floor unchanged).
  // Mark paints larger via transform scale only — does not grow the grid column.
  const paddingPx = 12;
  const iconWidthPx = 16;
  const gapPx = 10; // gap-x-2.5
  const chromeMinWidth =
    iconWidthPx + gapPx + textSlotWidth + paddingPx * 2;

  // Animate BTD balance changes (BTC fee balance is not shown in chrome).
  useEffect(() => {
    if (btdBalance !== displayedBtdBalance) {
      setDisplayedBtdBalance(btdBalance);
    }
  }, [btdBalance, displayedBtdBalance]);

  // Ref to manage hover-end timeout
  const hoverEndTimeoutRef = useRef<number>();
  // Handle hover state
  const handleHoverStart = () => {
    // Cancel any pending hoverEnd timeout
    if (hoverEndTimeoutRef.current) {
      clearTimeout(hoverEndTimeoutRef.current);
    }
    setIsHovered(true);
    setIsAnimating(true);
    // Warm Auxillaries chunks before click so the overlay mounts quickly.
    prefetchAuxillaries();
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    // Delay ending animation
    if (hoverEndTimeoutRef.current) {
      clearTimeout(hoverEndTimeoutRef.current);
    }
    hoverEndTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  // Clean up hover-end timer on unmount
  useEffect(() => {
    return () => {
      if (hoverEndTimeoutRef.current) clearTimeout(hoverEndTimeoutRef.current);
    };
  }, []);

  // Use shared auth context so we don't open duplicate listeners.
  const { user } = useAuth();
  const canOpenBtdWallet = Boolean(user || hasWalletIdentity);

  // Particle state for dynamic burst
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    angle: number;
  }>>([]);
  const particleCount = 12;
  const intervalParticlesRef = useRef<number | null>(null);

  // Generate, animate, and fade particles based solely on hover state
  useEffect(() => {
    const goldenRatio = 1.618033988749895;
    // On hover start: generate initial burst and begin movement
    if (isHovered) {
      // Create new particles in a golden-ratio spiral
      const newParticles = Array.from({ length: particleCount }, (_, i) => {
        const goldenAngle = i * goldenRatio * Math.PI * 2;
        const distance = Math.sqrt(i / particleCount) * 80;
        return {
          id: i,
          x: 50 + Math.cos(goldenAngle) * distance,
          y: 50 + Math.sin(goldenAngle) * distance,
          size: (1 + (i % 3) / 2) * (Math.sin(i * goldenRatio) * 0.5 + 2.5),
          opacity: 0.3 + (Math.sin(i * goldenRatio) * 0.2 + 0.3),
          speed: 0.5 + Math.sin(i * goldenRatio) * 0.5 + 0.5,
          angle: goldenAngle * (180 / Math.PI),
        };
      });
      setParticles(newParticles);
      // Animate outward movement, fade, and shrink
      intervalParticlesRef.current = window.setInterval(() => {
        setParticles(prev =>
          prev.map(p => {
            const angleMod = Math.sin(p.id * goldenRatio) * 0.1;
            return {
              ...p,
              x: p.x + Math.cos((p.angle + angleMod) * (Math.PI / 180)) * p.speed * 0.2,
              y: p.y + Math.sin((p.angle + angleMod) * (Math.PI / 180)) * p.speed * 0.2,
              opacity: p.opacity > 0.1 ? p.opacity - 0.01 : 0.1,
              size: p.size > 0.5 ? p.size - 0.02 : 0.5,
            };
          })
        );
      }, 50);
    } else {
      // On hover end: stop movement and fade out particles
      if (intervalParticlesRef.current) {
        window.clearInterval(intervalParticlesRef.current);
        intervalParticlesRef.current = null;
      }
      // Fade to opacity 0 via CSS transition
      setParticles(prev => prev.map(p => ({ ...p, opacity: 0 })));
      // Remove particles after fade completes
      const timeout = window.setTimeout(() => setParticles([]), 300);
      return () => clearTimeout(timeout);
    }
    // Cleanup on re-run or unmount
    return () => {
      if (intervalParticlesRef.current) {
        window.clearInterval(intervalParticlesRef.current);
        intervalParticlesRef.current = null;
      }
    };
  }, [isHovered]);

  /**
   * Open Auxillaries immediately; balance refresh is background-only so the
   * wallet click is not blocked on /api/auxillaries/data.
   */
  const handleOpenBtdWallet = () => {
    if (actionState !== 'idle') return;
    if (!canOpenBtdWallet) {
      window.dispatchEvent(new Event('start-onboarding'));
      return;
    }
    setActionState('loading');
    bitcodeQaTelemetry('info', 'btd-tracker', 'open-btd-wallet-start', {
      walletProvider,
      walletAddress: compactBitcodeAddress(walletAddress),
      btdBalance: displayedBtdBalance,
      assetPackCount,
      btcFeeBalance:
        typeof btcFeeBalance === 'number' ? btcFeeBalance : null,
    });

    try {
      window.sessionStorage.setItem(
        'bitcode:btd-wallet-intent',
        JSON.stringify({
          source: 'btd-tracker',
          intent: 'open-btd-wallet',
          feeAsset: 'BTC',
          shareAsset: 'BTD',
          btdSemantics: 'non-fungible asset-pack share and read-right',
          paths: [{ mode: 'wallet-auxillary', target: buildAuxillariesRoutePath('wallet') }],
          createdAt: new Date().toISOString(),
        })
      );
      // Open first — never await network before showing the surface.
      if (onOpenBtdAuxillary) {
        onOpenBtdAuxillary();
      } else {
        window.location.assign(buildAuxillariesRoutePath('wallet'));
      }
      setActionState('success');
      window.setTimeout(() => setActionState('idle'), 400);
    } catch (err) {
      console.error('Error opening BTD auxillary surface:', err);
      bitcodeQaTelemetry('error', 'btd-tracker', 'open-btd-wallet-failed', {
        message: err instanceof Error ? err.message : 'unknown',
      });
      setActionState('error');
      setTimeout(() => setActionState('idle'), 2000);
      return;
    }

    // Background posture refresh (chrome labels only; Auxillaries loads its own data).
    void fetch('/api/auxillaries/data')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const nextBalance =
          typeof data.btdBalance === 'number' ? data.btdBalance : null;
        if (typeof nextBalance === 'number') {
          setDisplayedBtdBalance(nextBalance);
        }
      })
      .catch((err) => {
        console.error('Error fetching user BTD/AssetPacks posture:', err);
        bitcodeQaTelemetry('warn', 'btd-tracker', 'balance-refresh-failed', {
          message: err instanceof Error ? err.message : 'unknown',
        });
      });
  };

  return (
    <motion.div
      className={`relative group inline-flex h-9 max-h-9 min-h-9 shrink-0 items-stretch ${canOpenBtdWallet ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={canOpenBtdWallet ? handleOpenBtdWallet : undefined}
      aria-disabled={!canOpenBtdWallet}
      aria-label={`${balanceLabel}. Open BTD wallet auxillary${walletProvider ? ` for ${walletProvider}` : ''}.`}
      title={recentAssetPackTitle}
    >
      {/*
        Height-fixed 36px chrome — matches notifications-bell (36×36) in nav.
        Width is stable across hover/loading flips: text slot = widest *default*
        variant; BTD/APs digit growth expands it; wallet alt text truncates
        inside the slot (never resizes the box).
      */}
      <motion.div
        className="relative box-border inline-flex h-9 max-h-9 min-h-9 items-stretch overflow-hidden rounded-none border border-emerald-500/30 bg-emerald-500/5 px-3 shadow-[0_0_12px_rgba(103,254,183,0.15)] transition-colors transition-shadow duration-500 ease-out group-hover:border-emerald-400/50 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_18px_rgba(103,254,183,0.25)]"
        style={{
          backfaceVisibility: 'hidden',
          width: textSlotWidth > 0 ? `${chromeMinWidth}px` : undefined,
          minWidth: textSlotWidth > 0 ? `${chromeMinWidth}px` : undefined,
        }}
      >
        {/* Quantum field effect */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.07] to-emerald-500/0 animate-shimmer" />
          <div className="absolute inset-0 bg-gradient-radial from-emerald-500/[0.07] to-transparent" />
        </div>

        {/* Orbital rings - appear on hover */}
        {isAnimating && [...Array(3)].map((_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute inset-0 rounded-none border border-emerald-400/20 transition-all duration-1000"
            style={{
              animation: `orbitRotation${i + 1} 3s infinite linear`,
              opacity: isHovered ? 0.4 : 0,
              transform: `scale(${1 + (i * 0.1)}) rotate(${i * 45}deg)`,
            }}
          />
        ))}

        {/* Quantum-style particles */}
        {particles.map(particle => (
          <div
            key={`ct-particle-${particle.id}`}
            className="pointer-events-none absolute rounded-full bg-emerald-400 quantum-particle-button"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.size}px rgba(103,254,183,${particle.opacity})`,
            }}
          />
        ))}

        {/* Fixed icon + text-slot grid — fills h-9; text cell flex-centers ink. */}
        <div
          className="relative z-[1] grid h-full w-full min-h-0 min-w-0 items-center gap-x-2.5"
          style={{
            gridTemplateColumns:
              textSlotWidth > 0 ? `auto ${textSlotWidth}px` : 'auto auto',
          }}
        >
          {/* Hidden measures: default content only (not hover wallet). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0"
          >
            <span
              ref={btdMeasureRef}
              className="inline-flex items-center font-medium tracking-wide text-sm leading-none"
            >
              <span className="inline-block leading-none">{btdBalanceLabel}</span>
              <span className="mx-2.5 inline-block h-3.5 w-[2px] shrink-0 self-center rounded-full" />
              <span className="inline-block leading-none">{assetPacksLabel}</span>
            </span>
            <span
              ref={readingMeasureRef}
              className="inline-flex items-center gap-2 font-normal tracking-wide text-sm leading-none"
            >
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="leading-none">Reading wallet</span>
            </span>
            <span
              ref={openingMeasureRef}
              className="font-normal tracking-wide text-sm leading-none"
            >
              Opening BTD...
            </span>
            {/* Same type metrics as hover wallet so fit measurement matches paint. */}
            <span
              ref={walletFitMeasureRef}
              className="font-normal tracking-wide text-sm leading-none"
            />
          </div>

          <AnimatePresence initial={false} mode="wait">
            {actionState === 'loading' ? (
              <motion.div
                key="spinner"
                className="flex h-4 w-4 shrink-0 items-center justify-center self-center"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <svg
                  className="h-4 w-4 animate-spin text-emerald-400/90"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25" />
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                className="relative flex h-4 w-4 shrink-0 items-center justify-center self-center overflow-visible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div
                  // Layout slot stays 16×16 (width + gap-x-2.5 unchanged). Scale
                  // fills taller h-9 chrome; paint may slightly overspill the
                  // slot without changing grid column or chrome min-width.
                  // Mark SSOT tilt −17.5°; hover +14.875° CSS straighten.
                  className="tracker-logo relative h-4 w-4 origin-center transition-transform duration-300 ease-out group-hover:drop-shadow-[0_0_8px_rgba(103,254,183,0.8)]"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: isHovered
                      ? 'rotate(14.875deg) scale(1.25)'
                      : 'scale(1.25)',
                  }}
                >
                  <Logo height="h-4" width="w-4" fill={isHovered ? '#67feb7' : '#67feb780'} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/*
            Non-icon content: stretch to chrome height and flex-center so
            BTD/APs + wallet alt share true vertical middle of h-9 (no
            translate hacks; leading-none kills default text-sm half-leading).
          */}
          <div className="flex h-full min-h-0 min-w-0 items-center justify-start overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {actionState === 'loading' ? (
                <motion.span
                  key="loading"
                  className="flex w-full items-center justify-start truncate text-left font-normal tracking-wide text-sm leading-none text-emerald-400/90"
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >Opening BTD...</motion.span>
              ) : isBalanceLoading ? (
                <motion.span
                  key="wallet-loading"
                  className="inline-flex w-full items-center justify-start gap-2 whitespace-nowrap font-normal tracking-wide text-sm leading-none text-emerald-200/78"
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-200/80 shadow-[0_0_10px_rgba(103,254,183,0.45)]"
                  />
                  <span className="truncate leading-none">Reading wallet</span>
                </motion.span>
              ) : actionState === 'idle' && shouldShowWalletNow ? (
                <motion.span
                  key="wallet"
                  // Left-align in the fixed text slot so short mid-compact
                  // addresses keep the same logo→ink gap as BTD|APs (center
                  // on a short string opened a false gap after the fit fix).
                  className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left font-normal tracking-wide text-sm leading-none text-emerald-400/90"
                  title={walletFullLabel}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >{walletActionLabel}</motion.span>
              ) : (
                <motion.span
                  key="btd"
                  className="inline-flex w-full items-center justify-start whitespace-nowrap font-medium tracking-wide text-sm leading-none text-emerald-400/90"
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <span className="inline-block leading-none">{btdBalanceLabel}</span>
                  <span
                    aria-hidden="true"
                    className="mx-2.5 inline-block h-3.5 w-[2px] shrink-0 self-center rounded-full bg-emerald-100/75 shadow-[0_0_8px_rgba(103,254,183,0.6)]"
                  />
                  <span className="inline-block leading-none">{assetPacksLabel}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced ambient glow effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 transition-all duration-500">
          {/* Base ambient glow */}
          <div className="absolute inset-[-1px] rounded-none bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0" />
          <div className="absolute inset-[-1px] rounded-none bg-gradient-radial from-emerald-500/10 to-transparent blur-sm" />
          {/* Subtle pulse effect */}
          <div className="absolute inset-[-1px] rounded-none bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-pulse-subtle" />

          {/* Hover state enhancements */}
          <motion.div
            className="absolute inset-[-2px] rounded-none opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            animate={isHovered ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 rounded-none bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-shimmer" />
            <div className="absolute inset-0 rounded-none bg-gradient-conic from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 animate-spin-slow" />
            <div className="absolute inset-0 rounded-none bg-gradient-radial from-emerald-500/20 to-transparent blur-md" />
          </motion.div>
        </div>

        {/* Click effect ripple */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-none transition-colors duration-150 group-active:bg-emerald-500/10" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add these keyframes and styles
const styles = `
  @keyframes orbitRotation1 {
    from { transform: scale(1.1) rotate(0deg); }
    to { transform: scale(1.1) rotate(360deg); }
  }
  @keyframes orbitRotation2 {
    from { transform: scale(1.2) rotate(120deg); }
    to { transform: scale(1.2) rotate(480deg); }
  }
  @keyframes orbitRotation3 {
    from { transform: scale(1.3) rotate(240deg); }
    to { transform: scale(1.3) rotate(600deg); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes ping-slow {
    75%, 100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse-subtle {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.6; }
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Enhanced hover transition */
  .btd-tracker-hover {
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Quantum shimmer effect */
  .quantum-shimmer {
    background: linear-gradient(
      to right,
      transparent,
      rgba(103, 254, 183, 0.1),
      transparent
    );
    animation: shimmer 2s linear infinite;
    transform: translateX(-100%);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
