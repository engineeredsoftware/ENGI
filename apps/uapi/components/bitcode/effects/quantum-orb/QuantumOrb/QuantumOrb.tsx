'use client';

/**
 * QuantumOrb — animated energy mark.
 * Silhouette, rings, and glow frames are square; flying ParticleLayer dots stay circular.
 */

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  createContext,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumOrbConfig } from '@/components/bitcode/effects/quantum-orb/QuantumOrbConfig/QuantumOrbConfig';
import { WavyBlobLayer } from '@/components/bitcode/effects/quantum-orb/layers/WavyBlobLayer/WavyBlobLayer';
import { ParticleLayer } from '@/components/bitcode/effects/quantum-orb/layers/ParticleLayer/ParticleLayer';
import { GlowLayer } from '@/components/bitcode/effects/quantum-orb/layers/GlowLayer/GlowLayer';
import { OrbitalRings } from '@/components/bitcode/effects/quantum-orb/layers/OrbitalRings/OrbitalRings';

// ---------------------------------------------------------------------------
// Device capability detection – evaluated once per bundle execution so we
// don’t repeat expensive navigator checks on every component mount.
// ---------------------------------------------------------------------------

const QUALITY_MULTIPLIER: number = (() => {
  if (typeof navigator === 'undefined') return 1;
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

// ---------------------------------------------------------------------------
// Shared rAF loop context – allows every visual layer to subscribe to a single
// requestAnimationFrame, removing the three independent loops we previously
// scheduled per orb.
// ---------------------------------------------------------------------------

type TickSubscriber = (time: number) => void;

export const OrbLoopContext = createContext<(fn: TickSubscriber) => () => void>(() => () => {});

export type QuantumOrbState = 'rest' | 'hover' | 'active';

/** One swallow-event’s three expanding square ripples. */
function SwallowRippleBurst({
  id,
  phase,
  color,
  onDone,
}: {
  id: number;
  phase: 'play' | 'fade';
  color: string;
  onDone: (id: number) => void;
}) {
  // Timers avoid onAnimationComplete races when phase flips mid-play.
  useEffect(() => {
    if (phase === 'play') {
      // 1.85s growth + last ring delay 0.28s + small buffer
      const t = window.setTimeout(() => onDone(id), 2200);
      return () => window.clearTimeout(t);
    }
    // Quick interrupt fade (~0.28s)
    const t = window.setTimeout(() => onDone(id), 320);
    return () => window.clearTimeout(t);
  }, [id, phase, onDone]);

  return (
    <div className="quantum-orb-swallow-ripple-burst">
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={`${id}-${ring}`}
          className="quantum-orb-swallow-ripple"
          initial={{ opacity: 0.55, scale: 0.08 }}
          animate={
            phase === 'fade'
              ? { opacity: 0 }
              : {
                  scale: 0.8,
                  // Hold early, then quick fade so end pose is fully invisible.
                  opacity: [0.55, 0.55, 0, 0],
                }
          }
          transition={
            phase === 'fade'
              ? {
                  opacity: {
                    duration: 0.28,
                    ease: [0.4, 0, 1, 1],
                  },
                }
              : {
                  delay: ring * 0.14,
                  duration: 1.85,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: {
                    delay: ring * 0.14,
                    duration: 1.85,
                    // Start fade earlier + finish faster so every ring is fully
                    // gone before they stack at the end scale (incl. stagger).
                    times: [0, 0.4, 0.58, 1],
                    ease: ['linear', 'easeIn', 'linear'],
                  },
                  scale: {
                    delay: ring * 0.14,
                    duration: 1.85,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }
          }
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '100%',
            height: '100%',
            marginLeft: '-50%',
            marginTop: '-50%',
            borderRadius: 0,
            border: `1px solid ${color}cc`,
            boxShadow: `0 0 6px ${color}55`,
            background: 'transparent',
            transformOrigin: '50% 50%',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </div>
  );
}

interface QuantumOrbProps {
  size?: number;
  config?: Partial<QuantumOrbConfig>;
  initialState?: QuantumOrbState;
  onClick?: () => void;
  className?: string;
  /**
   * When false the component ignores the user’s `prefers-reduced-motion`
   * setting and always shows full animation.  Useful for decorative,
   * non-essential elements on marketing sites where the motion is part of the
   * branding.  Defaults to `true` (respect the setting).
   */
  respectReducedMotion?: boolean;

  /**
   * Disable internal hover/active visual state transitions while still
   * allowing the parent to attach an `onClick` handler.  When `false` the orb
   * remains in the `rest` visual state regardless of user interaction – which
   * is useful when embedding the component inside other interactive UIs (like
   * Conversations) where the heavy animations cause performance issues.  Defaults to
   * `true` (fully interactive).
   */
  interactive?: boolean;
}

function QuantumOrb({
  size = 120,
  config = {},
  initialState = 'rest',
  onClick,
  className = '',
  respectReducedMotion = true,
  interactive = true,
}: QuantumOrbProps) {
  const [state, setState] = useState<QuantumOrbState>(initialState);

  const [isVisible, setIsVisible] = useState(true);

  // -----------------------------------------------------------------------
  // Shared rAF loop management
  // -----------------------------------------------------------------------

  // Using an array avoids the iterator allocation incurred by Set#forEach on
  // every animation frame.  We compact the array on unsubscribe to keep it
  // tight.
  const subscribersRef = useRef<TickSubscriber[]>([]);
  const rAFHandle = useRef<number>();

  const subscribeToTick = useCallback((fn: TickSubscriber) => {
    subscribersRef.current.push(fn);
    // Return an unsubscribe that lazily null-marks the slot so we can compact
    // later without O(n) splice per removal.
    return () => {
      const idx = subscribersRef.current.indexOf(fn);
      if (idx !== -1) subscribersRef.current[idx] = null as unknown as TickSubscriber;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Motion preference detection – needs to be declared before any hooks that
  // depend on `isAnimating` (such as the rAF loop below) to avoid temporal
  // dead-zone errors when the component first renders.
  // -----------------------------------------------------------------------

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationsEnabled = respectReducedMotion ? !prefersReducedMotion : true;
  const isAnimating = animationsEnabled && state !== 'rest';

  // Kick-off / cancel the single rAF based on visibility + animation state
  useEffect(() => {
    const shouldAnimate = isVisible && isAnimating;

    if (!shouldAnimate) {
      if (rAFHandle.current !== undefined) {
        cancelAnimationFrame(rAFHandle.current);
        rAFHandle.current = undefined;
      }
      return;
    }

    const loop = (time: number) => {
      const list = subscribersRef.current;
      for (let i = 0; i < list.length; i++) {
        const fn = list[i];
        if (fn) fn(time);
      }
      // Periodically compact (every ~300 frames) to remove nulls cheaply.
      if (time % (1000 * 5) < 16) {
        subscribersRef.current = list.filter(Boolean);
      }
      rAFHandle.current = requestAnimationFrame(loop);
    };

    rAFHandle.current = requestAnimationFrame(loop);

    return () => {
      if (rAFHandle.current !== undefined) cancelAnimationFrame(rAFHandle.current);
    };
  }, [isAnimating, isVisible]);


  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    // Some browsers still use the older MQList API without .addEventListener
    (mq as any).addEventListener ? mq.addEventListener('change', listener) : mq.addListener(listener);
    return () => {
      (mq as any).removeEventListener ? mq.removeEventListener('change', listener) : mq.removeListener(listener);
    };
  }, []);
  const orbRef = useRef<HTMLDivElement>(null);

  // Visibility tracking via IntersectionObserver
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !orbRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.target === orbRef.current) {
            setIsVisible(entry.isIntersecting);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(orbRef.current);
    return () => observer.disconnect();
  }, []);

  // Merge default config with provided config
  const orbConfig: QuantumOrbConfig = {
    backgroundColors: config.backgroundColors || ['#67feb7', '#4ade80', '#0f766e'],
    glowColor: config.glowColor || '#67feb7',
    particleColor: config.particleColor || '#ffffff',
    coreGlowIntensity: config.coreGlowIntensity ?? 1.0,
    showBackground: config.showBackground ?? true,
    showWavyBlobs: config.showWavyBlobs ?? true,
    showParticles: config.showParticles ?? true,
    showGlowEffects: config.showGlowEffects ?? true,
    showShadow: config.showShadow ?? true,
    speed: config.speed ?? 60,
  };

  // Quality multiplier obtained once at module init
  const qualityMultiplier = QUALITY_MULTIPLIER;

  // Only render dynamic layers when the orb is BOTH animating *and* visible.
  // This prevents off-screen orbs from keeping GPU-heavy canvases alive while
  // still allowing the entry IntersectionObserver to resume animation
  // instantly when they scroll back in.
  const renderDynamic = animationsEnabled && state !== 'rest' && isVisible;

  // Geometry scales with `size`. Fixed-pixel outer frames dominate at
  // telemetry sizes (e.g. 24px); marketing sizes keep the original ratio.
  const isCompactTelemetrySize = size < 48;

  // ---------------------------------------------------------------------
  // Lazy-mount secondary, purely decorative layers after a short delay or
  // during idle time so the first paint is cheaper.  We only defer the
  // GlowLayer and ParticleLayer; the orbital rings + wavy blobs act as the
  // primary silhouette and should appear immediately.
  // ---------------------------------------------------------------------

  const [secondaryReady, setSecondaryReady] = useState(false);
  // Active swallow-ripple bursts. New swallows fade prior bursts out quickly
  // instead of remounting (which looked like an abrupt cut).
  type SwallowRippleBurst = { id: number; phase: 'play' | 'fade' };
  const [swallowRipples, setSwallowRipples] = useState<SwallowRippleBurst[]>(
    [],
  );
  const swallowRippleIdRef = useRef(0);
  const handleParticleSwallowed = useCallback(() => {
    const id = ++swallowRippleIdRef.current;
    setSwallowRipples((prev) => [
      ...prev.map((b) => (b.phase === 'play' ? { ...b, phase: 'fade' as const } : b)),
      { id, phase: 'play' as const },
    ]);
  }, []);
  const dismissSwallowRipple = useCallback((id: number) => {
    setSwallowRipples((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    if (!renderDynamic) {
      setSecondaryReady(false);
      return;
    }

    let cancelled = false;

    const mount = () => {
      if (!cancelled) setSecondaryReady(true);
    };

    // Compact running loaders need glow/particles immediately — idle delay
    // made the status orb look static for hundreds of ms.
    if (isCompactTelemetrySize) {
      mount();
      return () => {
        cancelled = true;
      };
    }

    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(mount, { timeout: 300 });
      return () => {
        cancelled = true;
        (window as any).cancelIdleCallback?.(idleId);
      };
    } else {
      const t = setTimeout(mount, 300);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
  }, [renderDynamic, isCompactTelemetrySize]);

  // Dynamically reduce effects on low-end devices
  // Heavy canvas-based layers only mount when the orb is in the *active*
  // state.  Hover now keeps things lightweight (pure CSS + SVG) so just
  // moving the cursor over multiple orbs doesn’t spike paint time.
  // Compact (size < 48) only: skip wavy blobs (they smear at 24px) and use a
  // slightly lower particle quality floor so telemetry loaders still move on
  // mid-spec devices. Marketing sizes (size ≥ 48) keep the pre-compact gates.
  const showWavyBlobs =
    renderDynamic &&
    !isCompactTelemetrySize &&
    orbConfig.showWavyBlobs &&
    qualityMultiplier >= 0.8 &&
    state === 'active';
  const showParticles =
    renderDynamic &&
    orbConfig.showParticles &&
    qualityMultiplier >= (isCompactTelemetrySize ? 0.5 : 0.6) &&
    state === 'active';

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    if (!interactive) return;
    if (state !== 'active') {
      setState('hover');
    }
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    if (state !== 'active') {
      setState('rest');
    }
  };

  // Handle click
  const handleClick = () => {
    if (interactive) {
      setState(state === 'active' ? 'rest' : 'active');
    }
    if (onClick) onClick();
  };

  // No per-frame cursor tracking – hover state alone drives the visual change.

  // Get state-specific properties
  const getStateProperties = () => {
    switch (state) {
      case 'rest':
        return {
          scale: 1,
          glowOpacity: 0.7,
          particleSpeed: orbConfig.speed * 0.8,
          ringSpeed: orbConfig.speed * 0.6,
          coreIntensity: orbConfig.coreGlowIntensity * 0.8,
        };
      case 'hover':
        return {
          scale: 1.05,
          glowOpacity: 0.9,
          particleSpeed: orbConfig.speed * 1.2,
          ringSpeed: orbConfig.speed * 0.9,
          coreIntensity: orbConfig.coreGlowIntensity * 1.2,
        };
      case 'active':
        return {
          scale: 1.1,
          glowOpacity: 1,
          particleSpeed: orbConfig.speed * 1.5,
          ringSpeed: orbConfig.speed * 1.2,
          coreIntensity: orbConfig.coreGlowIntensity * 1.5,
        };
    }
  };

  const stateProps = getStateProperties();

  // Compact telemetry: fill most of the square (marketing-like soft tile),
  // not a tiny core inside multi-frame chrome.
  // Marketing outer chrome: slightly tighter than the old -10/-15 so the
  // containing frame hugs the same-size inner mark with less empty pad.
  const coreInset = isCompactTelemetrySize ? '0%' : '8%';
  const coreBlurPx = isCompactTelemetrySize ? 0 : 2;
  const outerGlowInsetPx = isCompactTelemetrySize
    ? -Math.max(2, Math.round(size * 0.18))
    : -6;
  const activeFrameInsetPx = isCompactTelemetrySize
    ? -Math.max(1, Math.round(size * 0.06))
    : -9;
  const outerGlowBlurPx = isCompactTelemetrySize
    ? 0
    : state === 'active'
      ? 4
      : 6;
  const compactParticleCount = Math.max(
    5,
    Math.round(8 * qualityMultiplier),
  );

  // Skip heavy visual layers when animations disabled
  // (already computed earlier to feed the rAF loop)

  return (
    <OrbLoopContext.Provider value={subscribeToTick}>
    <motion.div
      ref={orbRef}
      className={`quantum-orb-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: 'pointer',
        // Square silhouette (particles inside stay circular).
        borderRadius: 0,
        overflow: 'visible',
        willChange: 'transform',
      } as React.CSSProperties}
      animate={{
        scale: stateProps.scale,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Main orb body — square clip; flying particles render as circles inside. */}
      <div
        className="quantum-orb-inner"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 0,
          overflow: 'hidden',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Background gradient */}
        {orbConfig.showBackground && (
          <div
            className="quantum-orb-background"
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, ${orbConfig.backgroundColors.join(', ')})`,
              opacity: state === 'active' ? 1 : 0.9,
            }}
          />
        )}
        {!orbConfig.showBackground && (
          <div
            className="quantum-orb-transparent-backdrop"
            style={{
              position: 'absolute',
              inset: coreInset,
              borderRadius: 0,
              // Compact: soft filled mint tile. Marketing: pre-compact halo only.
              background: isCompactTelemetrySize
                ? `radial-gradient(circle at 50% 40%, #ecfdf5 0%, ${orbConfig.glowColor} 42%, ${orbConfig.glowColor}bb 78%, ${orbConfig.glowColor}55 100%)`
                : `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.18) 46%, ${orbConfig.glowColor}22 72%, transparent 88%)`,
              // Compact densifies the tile; marketing keeps pre-compact opacities.
              opacity: isCompactTelemetrySize
                ? state === 'active'
                  ? 0.98
                  : 0.82
                : state === 'active'
                  ? 0.95
                  : 0.8,
              ...(coreBlurPx > 0 ? { filter: `blur(${coreBlurPx}px)` } : null),
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
        )}

        {renderDynamic && (
          <>
            {/* Orbital rings */}
            <OrbitalRings
              color={orbConfig.glowColor}
              speed={stateProps.ringSpeed * qualityMultiplier}
              state={state}
              isAnimating={isAnimating}
              compact={isCompactTelemetrySize}
            />

            {/* Wavy blob layers */}
            {showWavyBlobs && (() => {
              const wavyOffset = state === 'active' ? 0.31 : 0.25;
              return (
                <>
                  <WavyBlobLayer
                    color={orbConfig.glowColor}
                    speed={stateProps.ringSpeed * qualityMultiplier}
                    direction="clockwise"
                    scale={1.875}
                    offset={wavyOffset}
                    state={state}
                    isAnimating={isAnimating}
                  />
                  <WavyBlobLayer
                    color={orbConfig.glowColor}
                    speed={stateProps.ringSpeed * 0.5 * qualityMultiplier}
                    direction="counterClockwise"
                    scale={1.25}
                    offset={-wavyOffset}
                    rotation={90}
                    state={state}
                    isAnimating={isAnimating}
                  />
                </>
              );
            })()}

            {/* Core glow effects */}
            {orbConfig.showGlowEffects && secondaryReady && (
              <GlowLayer
                color={orbConfig.glowColor}
                intensity={stateProps.coreIntensity}
                speed={stateProps.particleSpeed * qualityMultiplier}
                state={state}
                isAnimating={isAnimating}
                compact={isCompactTelemetrySize}
              />
            )}

            {/* Particle effects */}
            {showParticles && secondaryReady && (
              <ParticleLayer
                color={orbConfig.particleColor}
                count={
                  isCompactTelemetrySize
                    ? compactParticleCount
                    : Math.max(
                        1,
                        Math.round(
                          // Sparse shooting discs (deployed marketing look).
                          (state === 'active' ? 3 : state === 'hover' ? 2 : 2) *
                            qualityMultiplier,
                        ),
                      )
                }
                speed={stateProps.particleSpeed * qualityMultiplier}
                state={state}
                isAnimating={isAnimating}
                onSwallowed={handleParticleSwallowed}
              />
            )}

            {/* After a full swallow: three square ripples expand from center.
                Clipped to the lava square. Mid-swallow interrupts fade prior
                bursts out quickly (no hard remount cut). */}
            {!isCompactTelemetrySize && swallowRipples.length > 0 && (
              <div
                className="quantum-orb-swallow-ripple-clip"
                style={{
                  position: 'absolute',
                  // Match GlowLayer content box (padding: 8%).
                  inset: '8%',
                  overflow: 'hidden',
                  borderRadius: 0,
                  pointerEvents: 'none',
                  zIndex: 24,
                }}
              >
                {swallowRipples.map((burst) => (
                  <SwallowRippleBurst
                    key={burst.id}
                    id={burst.id}
                    phase={burst.phase}
                    color={orbConfig.glowColor}
                    onDone={dismissSwallowRipple}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Outer glow — soft falloff, square footprint (inset scales with size). */}
      <motion.div
        className="quantum-orb-outer-glow"
        style={{
          position: 'absolute',
          inset: outerGlowInsetPx,
          borderRadius: 0,
          background: isCompactTelemetrySize
            ? `radial-gradient(circle at 50% 50%, ${orbConfig.glowColor}66 0%, ${orbConfig.glowColor}22 55%, transparent 78%)`
            : `radial-gradient(circle at 50% 50%, ${orbConfig.glowColor}33 0%, transparent 70%)`,
          ...(outerGlowBlurPx > 0 ? { filter: `blur(${outerGlowBlurPx}px)` } : null),
          opacity: stateProps.glowOpacity,
          willChange: 'transform, opacity, background',
          transform: 'translateZ(0)',
          contain: 'paint',
        }}
        animate={
          isAnimating && isCompactTelemetrySize
            ? { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }
            : { opacity: stateProps.glowOpacity }
        }
        transition={
          isAnimating && isCompactTelemetrySize
            ? {
                duration: 1.8,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : { duration: 0.3 }
        }
      />

      {/* Realistic shadow */}
      {orbConfig.showShadow && orbConfig.showBackground && (
        <>
          <div
            className="quantum-orb-shadow-inner"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 0,
              transform: 'translateY(5px)',
              background: `linear-gradient(to top, ${orbConfig.backgroundColors.join(', ')})`,
              filter: 'blur(6px)',
              opacity: 0.5,
              zIndex: -1,
            }}
          />
          <div
            className="quantum-orb-shadow-outer"
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: 0,
              transform: 'translateY(8px)',
              background: `linear-gradient(to top, ${orbConfig.backgroundColors.join(', ')})`,
              filter: 'blur(15px)',
              opacity: 0.3,
              zIndex: -2,
            }}
          />
        </>
      )}

      {/* Square outline for depth — compact: single soft edge (not nested frames). */}
      <div
        className="quantum-orb-outline"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 0,
          boxShadow: isCompactTelemetrySize
            ? `
            inset 0 0 0 1px rgba(255, 255, 255, 0.22),
            0 0 0 1px ${orbConfig.glowColor}33
          `
            : `
            inset 0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 0 0 2px rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          ...(isCompactTelemetrySize ? null : { filter: 'blur(1px)' }),
        }}
      />

      {/* Active indicator — soft outer halo at telemetry sizes (not a second frame). */}
      <AnimatePresence>
        {state === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isCompactTelemetrySize
                ? { opacity: [0.35, 0.75, 0.35], scale: [1, 1.05, 1] }
                : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            transition={
              isCompactTelemetrySize
                ? {
                    duration: 2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'loop',
                  }
                : undefined
            }
            className="quantum-orb-active-indicator"
            style={{
              position: 'absolute',
              inset: activeFrameInsetPx,
              borderRadius: 0,
              border: isCompactTelemetrySize
                ? 'none'
                : `1px solid ${orbConfig.glowColor}33`,
              boxShadow: isCompactTelemetrySize
                ? `0 0 10px ${orbConfig.glowColor}44`
                : `0 0 15px ${orbConfig.glowColor}33`,
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
    </OrbLoopContext.Provider>
  );
}

export default memo(QuantumOrb);
