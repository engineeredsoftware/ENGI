"use client";

import React from 'react';
import styles from './revealing-soon-overlay.module.css';

interface Props {
  className?: string;
  stretch?: boolean;
  subtle?: boolean;
  rightAlign?: boolean;
  fadeLeft?: boolean;
  dotOnly?: boolean;
  blockInteraction?: boolean;
  deferParticles?: boolean;
  alwaysShowText?: boolean;
}

export default function RevealingSoonOverlay({
  className = '',
  stretch = true,
  subtle = false,
  rightAlign = false,
  fadeLeft = false,
  dotOnly = false,
  blockInteraction = false,
  deferParticles = false,
  alwaysShowText = false,
}: Props) {
  const particles: Array<{ id: number; size: number; left: number; top: number; duration: number; delay: number }> = [];
  if (!deferParticles) {
    for (let i = 0; i < 9; i++) {
      particles.push({ id: i, size: Math.random() * 3 + 2, left: Math.random() * 100, top: Math.random() * 100, duration: Math.random() * 4 + 4, delay: Math.random() * 6 });
    }
  }

  const overlayClass = [
    styles.overlay,
    stretch && styles.stretch,
    subtle && styles.subtle,
    rightAlign && styles.alignRight,
    fadeLeft && styles.fadeLeft,
    dotOnly && styles.dotOnly,
    alwaysShowText && styles.alwaysShowText,
    blockInteraction && styles.blockPointer,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={overlayClass}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <span
        className={styles.text}
        style={{
          background: 'linear-gradient(90deg, #67feb7 0%, #3bb0ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Revealing soon
      </span>
    </div>
  );
}
