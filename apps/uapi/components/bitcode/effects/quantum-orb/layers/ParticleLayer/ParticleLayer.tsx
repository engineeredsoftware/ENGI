'use client';

import React, { useEffect, useRef, useContext } from 'react';
import { QuantumOrbState } from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';
import { OrbLoopContext } from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';

interface ParticleLayerProps {
  color: string;
  count: number;
  speed: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
  /** Fired when a particle finishes being swallowed by the inner ring. */
  onSwallowed?: () => void;
}

// Match the old Offscreen worker cadence (~60fps). The shared orb budget
// (30fps) made particles advance half as often → visibly slower.
const PARTICLE_FRAME_BUDGET_MS = 16;

// Innermost hard ring in OrbitalRings uses inset '36%' — keep in sync.
const INNER_RING_LO = 0.36;
const INNER_RING_HI = 0.64;
/** How close (unit square) to the ring line before swallow begins. */
const INNER_RING_HIT_PAD = 0.032;
/** Swallow duration in particle frames (~0.5s at 60fps) — unhurried. */
const SWALLOW_DURATION_FRAMES = 30;
/**
 * Spawn/despawn margin outside [0,1] so the full disc (radius up to ~10% of
 * the orb) is off-screen before enter and after exit.
 */
const VIEW_OUT_MARGIN = 0.14;

/** Unit-square radius for a particle size factor (matches draw formula). */
function unitRadiusForSize(sizeFactor: number) {
  return 0.03 + sizeFactor * 0.035;
}
// ---------------------------------------------------------------------------
// Colour helpers – parse hex once and inject alpha in the hot draw loop.
// ---------------------------------------------------------------------------

function parseHexRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const isShort = clean.length === 3;
  const num = parseInt(clean, 16);

  const r = isShort ? ((num >> 8) & 0xf) * 17 : (num >> 16) & 0xff;
  const g = isShort ? ((num >> 4) & 0xf) * 17 : (num >> 8) & 0xff;
  const b = isShort ? (num & 0xf) * 17 : num & 0xff;

  return [r, g, b];
}

function rgbToRgbaString(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

/** Distance from (x,y) to the perimeter of axis-aligned square [lo, hi]². */
function distToSquarePerimeter(x: number, y: number, lo: number, hi: number) {
  const inside = x >= lo && x <= hi && y >= lo && y <= hi;
  if (inside) {
    return Math.min(x - lo, hi - x, y - lo, hi - y);
  }
  const cx = Math.min(hi, Math.max(lo, x));
  const cy = Math.min(hi, Math.max(lo, y));
  return Math.hypot(x - cx, y - cy);
}

/**
 * True if a ray from (ox,oy) in direction (dx,dy) intersects the filled
 * square [lo,hi]² (hence must cross its ring/perimeter). Slab method.
 */
function rayHitsSquare(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  lo: number,
  hi: number,
): boolean {
  // Already inside → path is over the ring interior (must have crossed or is on it).
  if (ox >= lo && ox <= hi && oy >= lo && oy <= hi) return true;

  let tMin = 0;
  let tMax = Infinity;

  const slab = (o: number, d: number) => {
    if (Math.abs(d) < 1e-8) {
      if (o < lo || o > hi) {
        tMax = -1; // parallel and outside
      }
      return;
    }
    let t1 = (lo - o) / d;
    let t2 = (hi - o) / d;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
  };

  slab(ox, dx);
  if (tMax < tMin) return false;
  slab(oy, dy);
  return tMax >= tMin && tMax >= 0;
}

/**
 * Main-thread canvas particles only.
 *
 * An earlier OffscreenCanvas + Worker path transferred the canvas once and then
 * failed under React Strict Mode (dev double-invoke): cleanup terminated the
 * worker without clearing the ref, the re-run posted to a dead worker, and the
 * main-thread path bailed because the ref was still set — so particles only
 * appeared in production. With ~10–20 dots, main-thread draw is enough.
 */
export function ParticleLayer({
  color,
  count,
  speed,
  state,
  isAnimating = true,
  onSwallowed,
}: ParticleLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onSwallowedRef = useRef(onSwallowed);
  useEffect(() => {
    onSwallowedRef.current = onSwallowed;
  }, [onSwallowed]);

  // Struct-of-arrays for particle properties (locality, no per-dot objects).
  const positionsX = useRef<Float32Array | null>(null);
  const positionsY = useRef<Float32Array | null>(null);
  const sizes = useRef<Float32Array | null>(null);
  const speeds = useRef<Float32Array | null>(null);
  const angles = useRef<Float32Array | null>(null);
  const opacities = useRef<Float32Array | null>(null);
  const life = useRef<Uint16Array | null>(null);
  const maxLife = useRef<Uint16Array | null>(null);
  /**
   * 0 = free flight;
   * (0,1] = swallow progress into the inner ring/center.
   */
  const swallow = useRef<Float32Array | null>(null);
  /**
   * 1 = trajectory hits the inner ring (always swallow on contact);
   * 0 = geometric miss (cool red, never swallow).
   */
  const hitsRing = useRef<Float32Array | null>(null);
  const lastFrameRef = useRef<number>(0);
  const speedRef = useRef(speed);

  const rgbRef = useRef<[number, number, number]>(parseHexRGB(color));

  useEffect(() => {
    rgbRef.current = parseHexRGB(color);
  }, [color]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const subscribe = useContext(OrbLoopContext);

  const getParticleBuffers = () => {
    if (
      !positionsX.current ||
      !positionsY.current ||
      !sizes.current ||
      !speeds.current ||
      !angles.current ||
      !opacities.current ||
      !life.current ||
      !maxLife.current ||
      !swallow.current ||
      !hitsRing.current
    ) {
      return null;
    }

    return {
      positionsX: positionsX.current,
      positionsY: positionsY.current,
      sizes: sizes.current,
      speeds: speeds.current,
      angles: angles.current,
      opacities: opacities.current,
      life: life.current,
      maxLife: maxLife.current,
      swallow: swallow.current,
      hitsRing: hitsRing.current,
    };
  };

  /**
   * Point fully outside one side of the unit square so the disc starts/ends
   * off-screen (margin ≥ max particle radius).
   */
  const randomPointOutsideEdge = (edge: number, margin = VIEW_OUT_MARGIN) => {
    const u = Math.random();
    switch (edge) {
      case 0:
        return { x: u, y: -margin }; // above top
      case 1:
        return { x: 1 + margin, y: u }; // right of right
      case 2:
        return { x: u, y: 1 + margin }; // below bottom
      default:
        return { x: -margin, y: u }; // left of left
    }
  };

  const initParticle = (i: number) => {
    const buffers = getParticleBuffers();
    if (!buffers) return;

    const {
      positionsX: positionsXData,
      positionsY: positionsYData,
      sizes: sizesData,
      speeds: speedsData,
      angles: anglesData,
      opacities: opacitiesData,
      life: lifeData,
      maxLife: maxLifeData,
      swallow: swallowData,
      hitsRing: hitsRingData,
    } = buffers;
    const spd = speedRef.current;

    // Chord across the square: independent entry + exit *outside* the view.
    // (Old center-diameter spawn forced every path through the inner ring.)
    const entryEdge = Math.floor(Math.random() * 4);
    let exitEdge = Math.floor(Math.random() * 3);
    if (exitEdge >= entryEdge) exitEdge += 1;
    const start = randomPointOutsideEdge(entryEdge);
    const end = randomPointOutsideEdge(exitEdge);
    let tdx = end.x - start.x;
    let tdy = end.y - start.y;
    const len = Math.hypot(tdx, tdy) || 1;
    tdx /= len;
    tdy /= len;

    positionsXData[i] = start.x;
    positionsYData[i] = start.y;

    sizesData[i] = 0.5 + Math.random() * 1.5;
    // Wide speed variance (~5× span), with a slightly higher floor so the
    // slowest still clearly crosses (not a crawl).
    // ~0.018–0.063 × (spd/60) at marketing speeds.
    speedsData[i] = (0.018 + Math.random() * 0.045) * (spd / 60);
    anglesData[i] = Math.atan2(tdy, tdx);
    // Full opacity off-screen; disc is already out of view at spawn.
    opacitiesData[i] = 0.7;
    lifeData[i] = 0;
    // Long enough to clear entry→exit including outer margin; some still
    // expire mid-view by design.
    maxLifeData[i] = 90 + Math.floor(Math.random() * 120);
    swallowData[i] = 0;
    // Geometric fate: chord over the inner ring → always swallow; else pass through.
    hitsRingData[i] = rayHitsSquare(
      start.x,
      start.y,
      tdx,
      tdy,
      INNER_RING_LO,
      INNER_RING_HI,
    )
      ? 1
      : 0;
  };

  // Allocate / reallocate typed arrays when the particle count changes.
  useEffect(() => {
    positionsX.current = new Float32Array(count);
    positionsY.current = new Float32Array(count);
    sizes.current = new Float32Array(count);
    speeds.current = new Float32Array(count);
    angles.current = new Float32Array(count);
    opacities.current = new Float32Array(count);
    life.current = new Uint16Array(count);
    maxLife.current = new Uint16Array(count);
    swallow.current = new Float32Array(count);
    hitsRing.current = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      initParticle(i);
      // Stagger so they don't all launch together (sparse sequential streaks).
      const buffers = getParticleBuffers();
      if (buffers) {
        const maxL = buffers.maxLife[i] || 100;
        buffers.life[i] = Math.floor((i / Math.max(count, 1)) * maxL * 0.85);
      }
    }
  }, [count]);

  // Animation loop via shared rAF provided by OrbLoopContext
  useEffect(() => {
    if (!canvasRef.current) return;
    const buffers = getParticleBuffers();
    if (!buffers) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return;
    const {
      positionsX: positionsXData,
      positionsY: positionsYData,
      sizes: sizesData,
      speeds: speedsData,
      angles: anglesData,
      opacities: opacitiesData,
      life: lifeData,
      maxLife: maxLifeData,
      swallow: swallowData,
      hitsRing: hitsRingData,
    } = buffers;

    // Identity transform: device-pixel backing store, CSS box scales the bitmap.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Smoothing keeps large discs soft (hard edges + tiny radius → star spikes).
    ctx.imageSmoothingEnabled = true;

    const drawFrame = () => {
      const now = performance.now();
      if (now - lastFrameRef.current < PARTICLE_FRAME_BUDGET_MS) return;
      lastFrameRef.current = now;

      const w = canvas.width;
      const h = canvas.height;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);

      const len = positionsXData.length;
      const [rr, gg, bb] = rgbRef.current;
      const minSide = Math.min(w, h);
      // Soft discs: sizes ∈ [0.5, 2] → radius ≈ 4.5%–11% of the orb.
      for (let i = 0; i < len; i++) {
        let px = positionsXData[i];
        let py = positionsYData[i];
        let swallowT = swallowData[i];
        const willHit = hitsRingData[i] >= 0.5;

        // --- Swallow: pulled into center of the inner square, shrinking ---
        if (swallowT > 0) {
          swallowT += 1 / SWALLOW_DURATION_FRAMES;
          if (swallowT >= 1) {
            onSwallowedRef.current?.();
            initParticle(i);
            continue;
          }
          swallowData[i] = swallowT;

          // Smoothstep ease — slow capture, then decisive sink.
          const ease = swallowT * swallowT * (3 - 2 * swallowT);
          const pull = 0.1 + ease * 0.42;
          px += (0.5 - px) * pull;
          py += (0.5 - py) * pull;
          positionsXData[i] = px;
          positionsYData[i] = py;

          // Shrink into a point; brief soft brightening mid-way, then vanish.
          const sizeMul = Math.pow(1 - ease, 1.45);
          const glowPulse = 1 + 0.35 * Math.sin(ease * Math.PI);
          const o = 0.72 * (1 - ease * ease) * glowPulse;
          opacitiesData[i] = o;

          const baseSz = unitRadiusForSize(sizesData[i]) * minSide;
          const sz = Math.max(0.15, baseSz * sizeMul);
          if (sz < 0.35 && ease > 0.92) {
            onSwallowedRef.current?.();
            initParticle(i);
            continue;
          }

          const rgba = rgbToRgbaString(rr, gg, bb, Math.min(1, o));
          ctx.save();
          ctx.shadowBlur = sz * (1.1 + ease * 1.4);
          ctx.shadowColor = rgba;
          ctx.fillStyle = rgba;
          ctx.beginPath();
          ctx.arc(px * w, py * h, sz, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        // --- Free flight ---
        lifeData[i]++;

        const l = lifeData[i];
        const maxL = maxLifeData[i];

        // Steady opacity (spawn/exit are fully off-screen — no edge pop-in).
        // Soft fade only near maxLife for mid-view expires.
        let o: number;
        if (l > maxL * 0.88) {
          o = 0.7 * (1 - (l - maxL * 0.88) / (maxL * 0.12));
        } else {
          o = 0.7;
        }

        opacitiesData[i] = o;

        px += Math.cos(anglesData[i]) * speedsData[i];
        py += Math.sin(anglesData[i]) * speedsData[i];
        positionsXData[i] = px;
        positionsYData[i] = py;

        // Despawn only once the full disc is outside the view (not at the rim).
        const unitR = unitRadiusForSize(sizesData[i]);
        const outM = Math.max(VIEW_OUT_MARGIN, unitR + 0.02);
        const fullyOut =
          px < -outM || px > 1 + outM || py < -outM || py > 1 + outM;

        if (l >= maxL || fullyOut) {
          initParticle(i);
          continue;
        }

        // Path over the inner ring → always swallow on contact. Misses never.
        // Only arm swallow once the particle is in/near the visible square.
        if (willHit && px > -unitR && px < 1 + unitR && py > -unitR && py < 1 + unitR) {
          const ringDist = distToSquarePerimeter(
            px,
            py,
            INNER_RING_LO,
            INNER_RING_HI,
          );
          if (ringDist <= INNER_RING_HIT_PAD) {
            swallowData[i] = 1 / SWALLOW_DURATION_FRAMES;
          }
        }

        const x = px * w;
        const y = py * h;
        const sz = unitRadiusForSize(sizesData[i]) * minSide;

        const rgba = rgbToRgbaString(rr, gg, bb, o);

        ctx.save();
        // Soft bloom; keep blur ≤ radius so we don't get cross-shaped spikes.
        ctx.shadowBlur = sz * 1.25;
        ctx.shadowColor = rgba;
        ctx.fillStyle = rgba;

        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    let unsubscribe: () => void = () => {};

    if (isAnimating && state !== 'rest') {
      unsubscribe = subscribe(drawFrame);
    } else {
      drawFrame();
    }

    return () => unsubscribe();
  }, [color, speed, state, subscribe, isAnimating, count]);

  // Handle canvas resize using ResizeObserver
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateCanvasSize = () => {
      // Prefer clientWidth like the old worker (CSS box, not fractional rect).
      const width = parent.clientWidth || parent.getBoundingClientRect().width;
      const height = parent.clientHeight || parent.getBoundingClientRect().height;
      if (width <= 0 || height <= 0) return;

      const deviceDpr = window.devicePixelRatio || 1;
      const lowEnd =
        (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
      const dynamicCap = state === 'active' ? 1 : 1.5;
      const dprCap = lowEnd ? 1 : dynamicCap;
      const dpr = Math.min(deviceDpr, dprCap);
      const ctx2 = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
      } as any) as CanvasRenderingContext2D | null;
      if (!ctx2) return;

      // Device-pixel backing store; draw with identity transform (worker parity).
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx2.setTransform(1, 0, 0, 1, 0, 0);
      ctx2.imageSmoothingEnabled = false;
    };

    updateCanvasSize();

    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(parent);

    return () => ro.disconnect();
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        mixBlendMode: 'plus-lighter',
        willChange: 'transform',
        transform: 'translateZ(0)',
        contain: 'paint',
      }}
    />
  );
}
