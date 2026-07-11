
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  createContext,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumOrbConfig } from './QuantumOrbConfig';
import { WavyBlobLayer } from './layers/WavyBlobLayer';
import { ParticleLayer } from './layers/ParticleLayer';
import { GlowLayer } from './layers/GlowLayer';
import { OrbitalRings } from './layers/OrbitalRings';

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

  // ---------------------------------------------------------------------
  // Lazy-mount secondary, purely decorative layers after a short delay or
  // during idle time so the first paint is cheaper.  We only defer the
  // GlowLayer and ParticleLayer; the orbital rings + wavy blobs act as the
  // primary silhouette and should appear immediately.
  // ---------------------------------------------------------------------

  const [secondaryReady, setSecondaryReady] = useState(false);

  useEffect(() => {
    if (!renderDynamic) {
      setSecondaryReady(false);
      return;
    }

    let cancelled = false;

    const mount = () => {
      if (!cancelled) setSecondaryReady(true);
    };

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
  }, [renderDynamic]);

  // Dynamically reduce effects on low-end devices
  // Heavy canvas-based layers only mount when the orb is in the *active*
  // state.  Hover now keeps things lightweight (pure CSS + SVG) so just
  // moving the cursor over multiple orbs doesn’t spike paint time.
  const showWavyBlobs =
    renderDynamic && orbConfig.showWavyBlobs && qualityMultiplier >= 0.8 && state === 'active';
  const showParticles =
    renderDynamic && orbConfig.showParticles && qualityMultiplier >= 0.6 && state === 'active';

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
        borderRadius: '50%',
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
      {/* Main orb container with mask */}
      <div
        className="quantum-orb-inner"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          mask: 'radial-gradient(circle, white 100%, transparent 100%)',
          WebkitMask: 'radial-gradient(circle, white 100%, transparent 100%)',
          /* Performance optimizations */
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
              inset: '8%',
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.18) 46%, ${orbConfig.glowColor}22 72%, transparent 88%)`,
              opacity: state === 'active' ? 0.95 : 0.8,
              filter: 'blur(2px)',
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
              />
            )}

            {/* Particle effects */}
            {showParticles && secondaryReady && (
              <ParticleLayer
                color={orbConfig.particleColor}
                count={Math.round((state === 'active' ? 20 : state === 'hover' ? 15 : 10) * qualityMultiplier)}
                speed={stateProps.particleSpeed * qualityMultiplier}
                state={state}
                isAnimating={isAnimating}
              />
            )}
          </>
        )}
      </div>

      {/* Outer glow effect */}
      <motion.div
        className="quantum-orb-outer-glow"
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, ${orbConfig.glowColor}33 0%, transparent 70%)`,
          // Cheaper blur when the orb is in its most demanding phase.
          filter: `blur(${state === 'active' ? 4 : 6}px)`,
          opacity: stateProps.glowOpacity,
          willChange: 'transform, opacity, background',
          transform: 'translateZ(0)',
          contain: 'paint',
        }}
        animate={{
          opacity: stateProps.glowOpacity,
        }}
        transition={{
          duration: 0.3
        }}
      />

      {/* Realistic shadow */}
      {orbConfig.showShadow && orbConfig.showBackground && (
        <>
          <div
            className="quantum-orb-shadow-inner"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
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
              borderRadius: '50%',
              transform: 'translateY(8px)',
              background: `linear-gradient(to top, ${orbConfig.backgroundColors.join(', ')})`,
              filter: 'blur(15px)',
              opacity: 0.3,
              zIndex: -2,
            }}
          />
        </>
      )}

      {/* Orb outline for depth */}
      <div
        className="quantum-orb-outline"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: `
            inset 0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 0 0 2px rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          filter: 'blur(1px)',
        }}
      />

      {/* State indicator (active/hover) */}
      <AnimatePresence>
        {state === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="quantum-orb-active-indicator"
            style={{
              position: 'absolute',
              inset: -15,
              borderRadius: '50%',
              border: `1px solid ${orbConfig.glowColor}33`,
              boxShadow: `0 0 15px ${orbConfig.glowColor}33`,
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
