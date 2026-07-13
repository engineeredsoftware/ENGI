
'use client';

import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import Logo from '@/components/bitcode/branding/Logo/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

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

function formatBtcFeeBalance(balance: number | null | undefined) {
  if (typeof balance !== 'number' || !Number.isFinite(balance)) return '0 BTC';
  return `${balance.toLocaleString(undefined, {
    maximumFractionDigits: balance >= 1 ? 4 : 8,
  })} BTC`;
}

function readNumericField(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
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
  const [displayedBtcFeeBalance, setDisplayedBtcFeeBalance] = useState<number | null>(btcFeeBalance);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const isBalanceLoading = isLoading && btdBalance === 0 && btcFeeBalance === null;
  const shouldShowWalletNow = isHovered && !isBalanceLoading;
  const btcBalanceLabel = formatBtcFeeBalance(displayedBtcFeeBalance);
  const btdBalanceLabel = `${displayedBtdBalance.toLocaleString()} BTD`;
  const balanceLabel = isBalanceLoading ? 'Reading BTC and BTD wallet posture' : `${btcBalanceLabel}; ${btdBalanceLabel}`;
  const walletActionLabel = useMemo(() => {
    const explicitLabel = walletLabel?.trim();
    if (explicitLabel) return explicitLabel;
    return compactBitcodeAddress(walletAddress, 6) ?? 'BTD wallet';
  }, [walletAddress, walletLabel]);
  const recentAssetPackTitle = useMemo(() => {
    const labels = recentBtdAssetPacks
      .slice(0, 5)
      .map(formatAssetPackSummary)
      .filter((label): label is string => Boolean(label));

    if (labels.length === 0) return undefined;
    return `Recent BTD AssetPacks: ${labels.join(', ')}`;
  }, [recentBtdAssetPacks]);

  // Measure the widest hover/rest posture so the tracker does not resize on hover.
  const walletActionRef = useRef<HTMLSpanElement>(null);
  const btdRef = useRef<HTMLSpanElement>(null);
  const loadingRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  useLayoutEffect(() => {
    if (walletActionRef.current && btdRef.current && loadingRef.current) {
      const walletActionW = walletActionRef.current.offsetWidth;
      const btdW = btdRef.current.offsetWidth;
      const loadingW = loadingRef.current.offsetWidth;
      setTextWidth(Math.ceil(Math.max(walletActionW, btdW, loadingW)));
    }
  }, [displayedBtcFeeBalance, displayedBtdBalance, isBalanceLoading, walletActionLabel]);
  // Compute static container min-width: icon + gap + text + horizontal paddings
  const paddingPx = 24; // px-6
  const iconWidthPx = 16; // w-4
  const gapPx = 14; // gap-x-3.5
  const minWidth = iconWidthPx + gapPx + textWidth + paddingPx * 2;

  // Animate balance posture changes
  useEffect(() => {
    if (btdBalance !== displayedBtdBalance) {
      setDisplayedBtdBalance(btdBalance);
    }
    if (btcFeeBalance !== displayedBtcFeeBalance) {
      setDisplayedBtcFeeBalance(typeof btcFeeBalance === 'number' ? btcFeeBalance : null);
    }
  }, [btdBalance, btcFeeBalance, displayedBtdBalance, displayedBtcFeeBalance]);

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
   * Handle BTD wallet click: check identity, refresh the displayed balance,
   * then take the operator into the BTD auxillary wallet posture.
   */
  const handleOpenBtdWallet = async () => {
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
      btcFeeBalance: displayedBtcFeeBalance,
    });

    // Refresh displayed BTD balance from server
    try {
      const res = await fetch('/api/auxillaries/data');
      if (res.ok) {
        const data = await res.json();
        const nextBalance =
          typeof data.btdBalance === 'number' ? data.btdBalance : null;
        if (typeof nextBalance === 'number') {
          setDisplayedBtdBalance(nextBalance);
        }
        const nextBtcFeeBalance =
          typeof data.btcFeeBalance === 'number'
            ? data.btcFeeBalance
            : readNumericField(data.profile, 'btcFeeBalance', 'btc_fee_balance', 'btc_balance');
        if (typeof nextBtcFeeBalance === 'number') {
          setDisplayedBtcFeeBalance(nextBtcFeeBalance);
        }
      }
    } catch (err) {
      console.error('Error fetching user BTC/BTD balance posture:', err);
      bitcodeQaTelemetry('warn', 'btd-tracker', 'balance-refresh-failed', {
        message: err instanceof Error ? err.message : 'unknown',
      });
    }

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
      setActionState('success');
      if (onOpenBtdAuxillary) {
        onOpenBtdAuxillary();
      } else {
        window.location.assign(buildAuxillariesRoutePath('wallet'));
      }
      window.setTimeout(() => setActionState('idle'), 600);
    } catch (err) {
      console.error('Error opening BTD auxillary surface:', err);
      bitcodeQaTelemetry('error', 'btd-tracker', 'open-btd-wallet-failed', {
        message: err instanceof Error ? err.message : 'unknown',
      });
      setActionState('error');
      setTimeout(() => setActionState('idle'), 2000);
    }
  };

  return (
    <motion.div
      className={`relative group inline-block ${canOpenBtdWallet ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={canOpenBtdWallet ? handleOpenBtdWallet : undefined}
      aria-disabled={!canOpenBtdWallet}
      aria-label={`${balanceLabel}. Open BTD wallet auxillary${walletProvider ? ` for ${walletProvider}` : ''}.`}
      title={recentAssetPackTitle}
    >
      <motion.div
        className="relative inline-flex items-center justify-between gap-x-2.5 px-6 h-8 border rounded-full border-emerald-500/30 shadow-[0_0_12px_rgba(103,254,183,0.15)] bg-emerald-500/5 transition-colors transition-shadow duration-500 ease-out overflow-hidden group-hover:border-emerald-400/50 group-hover:shadow-[0_0_18px_rgba(103,254,183,0.25)] group-hover:bg-emerald-500/10"
        style={{ backfaceVisibility: 'hidden', minWidth: `${minWidth}px` }}
      >
        {/* Quantum field effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.07] to-emerald-500/0 animate-shimmer" />
          <div className="absolute inset-0 bg-gradient-radial from-emerald-500/[0.07] to-transparent" />
        </div>

        {/* Orbital rings - appear on hover */}
        {isAnimating && [...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-emerald-400/20 transition-all duration-1000"
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
            className="absolute rounded-full bg-emerald-400 quantum-particle-button"
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

        {/* Icon + Text fixed layout */}
        <div
          className="absolute inset-y-0 left-6 right-6 grid items-center gap-x-3.5 pointer-events-none"
          style={{ gridTemplateColumns: `auto ${textWidth}px` }}
        >
          {/* Hidden measurement spans */}
          <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
            <span ref={walletActionRef} className="whitespace-nowrap font-normal tracking-wide text-sm">{walletActionLabel}</span>
            <span ref={loadingRef} className="whitespace-nowrap font-normal tracking-wide text-sm">Reading wallet</span>
            <span ref={btdRef} className="inline-flex items-center whitespace-nowrap font-medium tracking-wide text-sm">
              <span>{btcBalanceLabel}</span>
              <span
                aria-hidden="true"
                className="mx-3 inline-block h-4 w-[2px] shrink-0 rounded-full"
              />
              <span>{btdBalanceLabel}</span>
            </span>
          </div>
          {/* Icon slot */}
          <AnimatePresence initial={false} mode="wait">
            {actionState === 'loading' ? (
              <motion.div
                key="spinner"
                className="flex items-center justify-center w-4 h-4"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <svg
                  className="animate-spin h-4 w-4 text-emerald-400/90"
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
                className="relative w-4 h-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div
                  className="tracker-logo relative w-4 h-4 transform rotate-0 origin-center transition-all duration-300 ease-out filter group-hover:rotate-90 group-hover:drop-shadow-[0_0_8px_rgba(103,254,183,0.8)]"
                  style={{ backfaceVisibility: 'hidden', willChange: 'transform', transformBox: 'fill-box', transformOrigin: 'center center' }}
                >
                  <Logo height="h-4" width="w-4" fill={isHovered ? '#67feb7' : '#67feb780'} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Text slot */}
          <AnimatePresence initial={false} mode="wait">
            {actionState === 'loading' ? (
              <motion.span
                key="loading"
                className="w-full text-center whitespace-nowrap font-normal tracking-wide text-sm text-emerald-400/90"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >Opening BTD...</motion.span>
            ) : isBalanceLoading ? (
              <motion.span
                key="wallet-loading"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap font-normal tracking-wide text-sm text-emerald-200/78"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-200/80 shadow-[0_0_10px_rgba(103,254,183,0.45)]"
                />
                <span>Reading wallet</span>
              </motion.span>
            ) : actionState === 'idle' && shouldShowWalletNow ? (
              <motion.span
                key="wallet"
                className="w-full text-center whitespace-nowrap font-normal tracking-wide text-sm text-emerald-400/90"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >{walletActionLabel}</motion.span>
            ) : (
              <motion.span
                key="btd"
                className="inline-flex w-full items-center justify-center whitespace-nowrap font-medium tracking-wide text-sm text-emerald-400/90 leading-none"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <span>{btcBalanceLabel}</span>
                <span
                  aria-hidden="true"
                  className="mx-3 inline-block h-4 w-[2px] shrink-0 rounded-full bg-emerald-100/75 shadow-[0_0_8px_rgba(103,254,183,0.6)]"
                />
                <span>{btdBalanceLabel}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced ambient glow effects */}
        <div className="absolute inset-0 -z-10 transition-all duration-500">
          {/* Base ambient glow */}
          <div className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0" />
          <div className="absolute inset-[-1px] rounded-full bg-gradient-radial from-emerald-500/10 to-transparent blur-sm" />
          {/* Subtle pulse effect */}
          <div className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-pulse-subtle" />

          {/* Hover state enhancements */}
          <motion.div
            className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            animate={isHovered ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-shimmer" />
            <div className="absolute inset-0 rounded-full bg-gradient-conic from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-emerald-500/20 to-transparent blur-md" />
          </motion.div>
        </div>

        {/* Click effect ripple */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-full group-active:bg-emerald-500/10 transition-colors duration-150" />
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
