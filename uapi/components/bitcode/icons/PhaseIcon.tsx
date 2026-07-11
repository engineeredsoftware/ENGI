"use client";

import React from 'react';

type Phase = 'setup' | 'discovery' | 'implementation' | 'validation' | 'finish';

const palette: Record<Phase, { glow: string; fill: string; stroke: string }> = {
  setup:          { glow: 'drop-shadow(0 0 12px rgba(14,165,233,.45))',  fill: '#06b6d4', stroke: 'rgba(14,165,233,.85)' }, // cyan
  discovery:      { glow: 'drop-shadow(0 0 12px rgba(139,92,246,.45))', fill: '#8b5cf6', stroke: 'rgba(139,92,246,.85)' }, // violet
  implementation: { glow: 'drop-shadow(0 0 12px rgba(101,254,183,.45))',fill: '#65FEB7', stroke: 'rgba(101,254,183,.85)' }, // mint
  validation:     { glow: 'drop-shadow(0 0 12px rgba(245,158,11,.45))', fill: '#f59e0b', stroke: 'rgba(245,158,11,.85)' }, // amber
  finish:         { glow: 'drop-shadow(0 0 12px rgba(59,130,246,.45))',  fill: '#3b82f6', stroke: 'rgba(59,130,246,.85)' },  // blue
};

export function BitcodePhaseIcon({ phase, size = 18, className = '' }: { phase: Phase; size?: number; className?: string }) {
  const theme = palette[phase];
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: theme.glow }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="rgba(15,23,42,.85)" stroke={theme.stroke} strokeWidth="1.25" />
      {/* phase marker: concentric orbit */}
      <circle cx="12" cy="12" r="5.5" stroke={theme.fill} strokeWidth="1.25" fill="none" opacity="0.85" />
      <circle cx="17.5" cy="12" r="1.2" fill={theme.fill} />
    </svg>
  );
}
