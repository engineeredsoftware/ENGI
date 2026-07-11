import React from 'react';

import {
  BITCODE_LOGO_INTRINSIC_HEIGHT,
  BITCODE_LOGO_INTRINSIC_WIDTH,
  BITCODE_LOGO_PATH,
  BITCODE_LOGO_TRANSFORM,
  BITCODE_LOGO_VIEW_BOX,
  normalizeLogoColor,
} from './bitcode-logo-mark';

type BitcodeSoftwareSvgLogoProps = {
  width?: string;
  height?: string;
  className?: string;
  softwareClassName?: string;
  fill?: string;
  softwareOffsetY?: string;
  glow?: boolean;
};

function computeGlyphHeight(width: string) {
  const numericWidth = Number.parseFloat(width);
  if (Number.isNaN(numericWidth)) return 'auto';
  return `${(numericWidth * BITCODE_LOGO_INTRINSIC_HEIGHT) / BITCODE_LOGO_INTRINSIC_WIDTH}px`;
}

function computeWordmarkMetrics(width: string) {
  const numericWidth = Number.parseFloat(width);
  if (Number.isNaN(numericWidth)) {
    return {
      glyphWidth: '28px',
      fontSize: undefined as string | undefined,
    };
  }

  return {
    glyphWidth: `${Math.max(16, Math.round(numericWidth * 0.26))}px`,
    fontSize: `${Math.max(12, Math.round(numericWidth * 0.24))}px`,
  };
}

export default function BitcodeSoftwareSvgLogo({
  width = '115px',
  height = 'auto',
  className = '',
  softwareClassName =
    'ml-1 inline-block font-semibold tracking-wide align-baseline bg-gradient-to-r from-[#65FEB7] via-white to-[#65FEB7] text-transparent bg-clip-text',
  fill = 'white',
  glow = true,
  softwareOffsetY,
}: BitcodeSoftwareSvgLogoProps) {
  const resolvedFill = normalizeLogoColor(fill);
  const hideWordmark = /\bhidden\b/.test(softwareClassName);
  const glyphWidth = hideWordmark ? width : computeWordmarkMetrics(width).glyphWidth;
  const glyphHeight = height === 'auto' ? computeGlyphHeight(glyphWidth) : height;
  const wordmarkFontSize = hideWordmark
    ? undefined
    : computeWordmarkMetrics(width).fontSize;
  const wordmarkOffset = softwareOffsetY ?? '-2px';

  const glyph = (
    <svg
      className="relative z-10"
      aria-hidden="true"
      viewBox={BITCODE_LOGO_VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'inline-block',
        width: glyphWidth,
        height: glyphHeight,
        color: resolvedFill,
      }}
    >
      <g transform={BITCODE_LOGO_TRANSFORM}>
        <path fill="currentColor" d={BITCODE_LOGO_PATH} />
      </g>
    </svg>
  );

  return (
    <div className={`relative inline-flex items-center gap-[0.18em] align-middle leading-none ${className}`}>
      {glow ? (
        <div
          className="relative"
          style={{
            filter:
              'drop-shadow(0 0 8px rgba(101,254,183,0.55)) drop-shadow(0 0 18px rgba(101,254,183,0.25))',
          }}
        >
          {glyph}
        </div>
      ) : (
        glyph
      )}
      {!hideWordmark ? (
        <span
          className={`${softwareClassName} leading-none`}
          style={{
            transform: `translateY(${wordmarkOffset})`,
            fontSize: wordmarkFontSize,
          }}
        >
          Bitcode
        </span>
      ) : null}
    </div>
  );
}
