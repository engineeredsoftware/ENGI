"use client";

import React from 'react';

type Variant = 'info' | 'success' | 'warning' | 'error';

const palette: Record<Variant, { glow: string; fill: string; stroke: string }> = {
  info:    { glow: 'drop-shadow(0 0 12px rgba(59, 130, 246, .45))', fill: '#0ea5e9', stroke: 'rgba(14,165,233,.85)' }, // cyan/blue
  success: { glow: 'drop-shadow(0 0 12px rgba(101, 254, 183, .45))', fill: '#65FEB7', stroke: 'rgba(101,254,183,.85)' }, // mint
  warning: { glow: 'drop-shadow(0 0 12px rgba(245, 158, 11, .45))', fill: '#f59e0b', stroke: 'rgba(245,158,11,.85)' },   // amber
  error:   { glow: 'drop-shadow(0 0 12px rgba(244, 63, 94, .45))',  fill: '#f43f5e', stroke: 'rgba(244,63,94,.85)' },    // rose
};

export function BitcodeStatusIcon({ variant = 'info', size = 18, className = '' }: { variant?: Variant; size?: number; className?: string }) {
  const theme = palette[variant];
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
      {variant === 'success' && (
        <path d="M8 12.5l2.5 2.5L16 9.5" stroke={theme.fill} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {variant === 'error' && (
        <g stroke={theme.fill} strokeWidth="2" strokeLinecap="round">
          <path d="M15 9l-6 6" />
          <path d="M9 9l6 6" />
        </g>
      )}
      {variant === 'warning' && (
        <g stroke={theme.fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7v6" />
          <circle cx="12" cy="16.5" r="1" fill={theme.fill} stroke="none" />
        </g>
      )}
      {variant === 'info' && (
        <g stroke={theme.fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="1" fill={theme.fill} stroke="none" />
          <path d="M12 11v6" />
        </g>
      )}
    </svg>
  );
}
