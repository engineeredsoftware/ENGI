
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuantumOrbState } from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';

interface OrbitalRingsProps {
  color: string;
  speed: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
}

export function OrbitalRings({
  color,
  speed,
  state,
  isAnimating = true,
}: OrbitalRingsProps) {
  // Get opacity based on state
  const getOpacity = (baseOpacity: number) => {
    switch (state) {
      case 'rest': return baseOpacity * 0.8;
      case 'hover': return baseOpacity * 1.2;
      case 'active': return baseOpacity * 1.5;
    }
  };

  return (
    <>
      {/* Concentric square frames (still rotate for motion). */}
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

      <motion.div
        className="quantum-orb-ring quantum-orb-ring-outer"
        style={{
          position: 'absolute',
          inset: '3%',
          borderRadius: 0,
          border: `1px solid ${color}`,
          opacity: getOpacity(0.2),
        }}
        animate={isAnimating ? { rotate: 360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / (speed * 0.25),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />

      <motion.div
        className="quantum-orb-ring quantum-orb-ring-middle"
        style={{
          position: 'absolute',
          inset: '15%',
          borderRadius: 0,
          border: `1px solid ${color}`,
          opacity: getOpacity(0.3),
        }}
        animate={isAnimating ? { rotate: -360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / (speed * 0.5),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />

      <motion.div
        className="quantum-orb-ring quantum-orb-ring-inner"
        style={{
          position: 'absolute',
          inset: '30%',
          borderRadius: 0,
          border: `1px solid ${color}`,
          opacity: getOpacity(0.4),
        }}
        animate={isAnimating ? { rotate: 360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / speed,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />
    </>
  );
}
