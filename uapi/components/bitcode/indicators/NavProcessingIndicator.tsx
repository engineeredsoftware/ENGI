"use client";

import { useMemo } from 'react';

interface NavProcessingIndicatorProps {
  className?: string;
}

export const NavProcessingIndicator = ({ className = '' }: NavProcessingIndicatorProps) => {
  const { rings, particles } = useMemo(() => {
    const rings = [0, 1, 2].map((i) => {
      const size = 12 + i * 6;
      return { key: i, size, border: 0.5 + i * 0.3, glow: 0.2 - i * 0.03, spinDuration: 8 + i * 2, glowDuration: 4 + i, delaySpin: i * 0.5, delayGlow: i * 0.3 } as const;
    });
    const particleCount = 8;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 10;
      return { key: i, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, delay: i * 0.06 } as const;
    });
    return { rings, particles };
  }, []);

  return (
    <div className={`flex items-center group/indicator relative max-w-fit nav-processing-container ${className}`}>
      <div className="relative mr-1 z-10">
        <div className="relative w-1.5 h-1.5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400 nav-processing-core" />
          {rings.map((ring) => (
            <div
              key={ring.key}
              className="absolute rounded-full nav-processing-ring"
              style={{
                width: `${ring.size}px`,
                height: `${ring.size}px`,
                top: '50%',
                left: '50%',
                marginLeft: `-${ring.size / 2}px`,
                marginTop: `-${ring.size / 2}px`,
                border: `${ring.border}px solid rgba(103, 254, 183, ${ring.glow})`,
                animation: `elegant-orbital-spin-only ${ring.spinDuration}s linear infinite ${ring.delaySpin}s, orbital-glow ${ring.glowDuration}s ease-in-out infinite ${ring.delayGlow}s`,
              }}
            />
          ))}
          {particles.map((p) => (
            <div
              key={p.key}
              className="absolute w-0.5 h-0.5 rounded-full bg-emerald-400/40"
              style={{
                top: `calc(50% + ${p.y}px + 3px)`,
                left: `calc(50% + ${p.x}px - 1px)`,
                boxShadow: '0 0 3px rgba(103, 254, 183, 0.5)',
                animation: `particle-entrance 0.5s ease-out ${p.delay}s forwards` as string,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

