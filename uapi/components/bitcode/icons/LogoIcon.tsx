"use client";

import React from 'react';

import {
  BITCODE_LOGO_PATH,
  BITCODE_LOGO_TRANSFORM,
  BITCODE_LOGO_VIEW_BOX,
  normalizeLogoColor,
} from '@/components/bitcode/branding/bitcode-logo-mark';

export interface LogoIconProps {
  /** Fill color for the logo */
  fill?: string;
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * LogoIcon: Bitcode icon sourced from the shared Bitcode mark, themable via fill color.
 */
const LogoIcon: React.FC<LogoIconProps & React.SVGProps<SVGSVGElement>> = ({
  fill = '#65FEB7',
  width = 24,
  height = 24,
  className = '',
  style,
  ...props
}) => {
  const resolvedFill = normalizeLogoColor(fill);

  return (
    <svg
      role="img"
      aria-label="Bitcode icon"
      viewBox={BITCODE_LOGO_VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      {...props}
      className={className}
      style={{
        display: 'inline-block',
        width,
        height,
        color: resolvedFill,
        ...style,
      }}
    >
      <g transform={BITCODE_LOGO_TRANSFORM}>
        <path fill="currentColor" d={BITCODE_LOGO_PATH} />
      </g>
    </svg>
  );
};

export default LogoIcon;
