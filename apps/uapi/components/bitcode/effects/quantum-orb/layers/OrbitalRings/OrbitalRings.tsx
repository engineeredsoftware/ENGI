
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuantumOrbState } from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';

interface OrbitalRingsProps {
  color: string;
  speed: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
  /**
   * Telemetry-sized orbs: skip hard concentric borders (they read as a
   * nested-frame stack at 24px). Soft rotating sheen only.
   */
  compact?: boolean;
}

export function OrbitalRings({
  color,
  speed,
  state,
  isAnimating = true,
  compact = false,
}: OrbitalRingsProps) {
  // Get opacity based on state
  const getOpacity = (baseOpacity: number) => {
    switch (state) {
      case 'rest': return baseOpacity * 0.8;
      case 'hover': return baseOpacity * 1.2;
      case 'active': return baseOpacity * 1.5;
    }
  };

  if (compact) {
    return (
      <motion.div
        className="quantum-orb-ring quantum-orb-ring-compact-sheen"
        style={{
          position: 'absolute',
          inset: '4%',
          borderRadius: 0,
          background: `conic-gradient(from 0deg, transparent 0%, ${color}88 22%, transparent 48%, ${color}55 72%, transparent 100%)`,
          opacity: getOpacity(0.55),
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        animate={isAnimating ? { rotate: 360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: Math.max(2.4, 40 / Math.max(speed, 1)),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      {/* Soft fill glow may still spin — lava motion lives in Glow/Wavy layers. */}
      <motion.div
        className="quantum-orb-ring quantum-orb-ring-glow"
        style={{
          position: 'absolute',
          inset: '3%',
          borderRadius: 0,
          background: color,
          filter: `blur(${state === 'active' ? 4 : 6}px)`,
          opacity: getOpacity(0.3),
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        animate={isAnimating ? { rotate: -360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / (speed * 0.75),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />

      {/* Hard border-boxes stay axis-aligned (no rotation).
          Outer 5.5%, middle 12%, inner 36% pure black + dark shadow.
          Paint order unchanged: rings still sit under wavy + glow. */}
      <div
        className="quantum-orb-ring quantum-orb-ring-outer"
        style={{
          position: 'absolute',
          inset: '5.5%',
          borderRadius: 0,
          border: `1px solid ${color}`,
          opacity: getOpacity(0.2),
        }}
      />

      <div
        className="quantum-orb-ring quantum-orb-ring-middle"
        style={{
          position: 'absolute',
          inset: '12%',
          borderRadius: 0,
          border: `1px solid ${color}`,
          opacity: getOpacity(0.3),
        }}
      />

      <div
        className="quantum-orb-ring quantum-orb-ring-inner"
        style={{
          position: 'absolute',
          inset: '36%',
          borderRadius: 0,
          border: '1px solid #000000',
          opacity: 0.5,
          boxShadow:
            '0 0 4px rgba(0, 0, 0, 0.85), 0 0 8px rgba(0, 0, 0, 0.55), inset 0 0 2px rgba(0, 0, 0, 0.9)',
        }}
      />
    </>
  );
}
