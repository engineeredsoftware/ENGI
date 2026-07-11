
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuantumOrbState } from '../QuantumOrb';

interface GlowLayerProps {
  color: string;
  intensity: number;
  speed: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
}

export function GlowLayer({
  color,
  intensity,
  speed,
  state,
  isAnimating = true,
}: GlowLayerProps) {
  // Calculate blur based on state
  // Lower blur radii during the heaviest ("active") phase – GPU samples on
  // larger blurs are disproportionately expensive and the visual difference
  // is negligible once the orb brightens.  This tiny tweak shaves a few ms of
  // paint time on mid-range laptops without impacting perceived quality.
  const getBlur = () => {
    switch (state) {
      case 'rest':
        return '8px';
      case 'hover':
        return '6px';
      case 'active':
        return '4px';
    }
  };

  return (
    <div className="glow-layer" style={{
      position: 'absolute',
      inset: 0,
      padding: '8%',
      willChange: 'transform',
      transform: 'translateZ(0)'
    }}>
      <motion.div
        className="glow-inner"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          filter: `blur(${getBlur()})`,
          opacity: intensity * 0.8,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        }}
        animate={isAnimating ? { rotate: 360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / (speed * 3),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />

      <motion.div
        className="glow-outer"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          filter: `blur(${getBlur()})`,
          opacity: intensity * 0.6,
          mixBlendMode: 'plus-lighter',
        }}
        animate={isAnimating ? { rotate: 360 } : undefined}
        transition={
          isAnimating
            ? {
                duration: 60000 / (speed * 2.3),
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />

      {/* Core pulse effect */}
      <motion.div
        className="core-pulse"
        style={{
          position: 'absolute',
          inset: '25%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.5,
        }}
        animate={
          isAnimating
            ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }
            : undefined
        }
        transition={
          isAnimating
            ? {
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }
            : undefined
        }
      />
    </div>
  );
}
