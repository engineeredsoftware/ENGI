'use client';

/**
 * Rich Bitcode chrome button — same emerald quantum hover language as the
 * wallet BTD tracker (glow border, shimmer wash, orbital rings, particles).
 * Prefer this for high-attention product CTAs like Connect Wallet.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import Logo from '@/components/bitcode/branding/Logo/Logo';

export interface BitcodeQuantumChromeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'data-testid'?: string;
  type?: 'button' | 'submit' | 'reset';
}

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
};

export default function BitcodeQuantumChromeButton({
  children,
  onClick,
  onMouseEnter,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-busy': ariaBusy,
  'data-testid': dataTestId,
  type = 'button',
}: BitcodeQuantumChromeButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isHovered || disabled) {
      setIsAnimating(false);
      setParticles([]);
      return;
    }

    setIsAnimating(true);
    const next: Particle[] = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      x: 8 + Math.random() * 84,
      y: 15 + Math.random() * 70,
      size: 1.2 + Math.random() * 1.8,
      opacity: 0.35 + Math.random() * 0.45,
    }));
    setParticles(next);

    const interval = window.setInterval(() => {
      setParticles((current) =>
        current.map((particle) => ({
          ...particle,
          x: Math.min(92, Math.max(6, particle.x + (Math.random() - 0.5) * 4)),
          y: Math.min(88, Math.max(10, particle.y + (Math.random() - 0.5) * 3)),
          opacity: 0.3 + Math.random() * 0.5,
        })),
      );
    }, 180);

    return () => {
      window.clearInterval(interval);
    };
  }, [disabled, isHovered]);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      data-testid={dataTestId}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => {
        if (disabled) return;
        setIsHovered(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        'group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-emerald-500/35 bg-emerald-500/8 px-5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-50 shadow-[0_0_14px_rgba(103,254,183,0.18)] transition-[border-color,box-shadow,background-color] duration-500 ease-out',
        'hover:border-emerald-400/55 hover:bg-emerald-500/12 hover:shadow-[0_0_22px_rgba(103,254,183,0.32)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/45',
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:grayscale disabled:hover:border-emerald-500/35 disabled:hover:bg-emerald-500/8 disabled:hover:shadow-[0_0_14px_rgba(103,254,183,0.18)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Quantum field shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-disabled:opacity-0">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.12] to-emerald-500/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,254,183,0.12),transparent_70%)]" />
      </div>

      {/* Orbital rings on hover */}
      {isAnimating &&
        !disabled &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="pointer-events-none absolute inset-0 rounded-none border border-emerald-400/20"
            style={{
              animation: `bitcode-quantum-orbit-${i + 1} 3s infinite linear`,
              opacity: isHovered ? 0.45 : 0,
              transform: `scale(${1 + i * 0.08}) rotate(${i * 45}deg)`,
            }}
          />
        ))}

      {/* Quantum particles */}
      {!disabled &&
        particles.map((particle) => (
          <div
            key={`cq-particle-${particle.id}`}
            className="pointer-events-none absolute rounded-full bg-emerald-400"
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

      <span className="relative z-10 inline-flex items-center gap-2.5">
        <span
          // Mark SSOT is tilted −17.5°. Hover +13.5° CSS (~upright, 4° under full cancel).
          className="relative inline-flex h-3.5 w-3.5 origin-center transition-transform duration-300 ease-out group-hover:rotate-[13.5deg] group-hover:drop-shadow-[0_0_8px_rgba(103,254,183,0.85)] group-disabled:rotate-0"
        >
          <Logo
            height="h-3.5"
            width="w-3.5"
            fill={isHovered && !disabled ? '#67feb7' : '#67feb780'}
          />
        </span>
        <span className="whitespace-nowrap">{children}</span>
      </span>

      {/* Outer glow bloom */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-disabled:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,254,183,0.18),transparent_70%)] blur-md" />
      </div>
    </motion.button>
  );
}

// Inject orbit keyframes once (same pattern as BtdTracker).
const ORBIT_STYLES = `
  @keyframes bitcode-quantum-orbit-1 {
    from { transform: scale(1.05) rotate(0deg); }
    to { transform: scale(1.05) rotate(360deg); }
  }
  @keyframes bitcode-quantum-orbit-2 {
    from { transform: scale(1.12) rotate(120deg); }
    to { transform: scale(1.12) rotate(480deg); }
  }
  @keyframes bitcode-quantum-orbit-3 {
    from { transform: scale(1.2) rotate(240deg); }
    to { transform: scale(1.2) rotate(600deg); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2.2s linear infinite;
  }
`;

if (typeof document !== 'undefined') {
  const existing = document.getElementById('bitcode-quantum-chrome-button-styles');
  if (!existing) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'bitcode-quantum-chrome-button-styles';
    styleSheet.textContent = ORBIT_STYLES;
    document.head.appendChild(styleSheet);
  }
}
