/**
 * Bitcode AssetPack mark — technical knowledge-in-a-box.
 *
 * - mono: full mark in currentColor (emerald product chrome)
 * - dual: purple top + orange lower washes; green shell + mid box line;
 *   orange lattice (lower half); purple code brackets;
 *   icon shadows are darker shades of each icon tint (not black)
 *
 * Dual parts:
 * 1. Mid box line — matches color crease M12 27 → (32,38) → 52 27
 * 2. Measurement logo — orange upside-down triangle, centered in lower half
 * 3. Code brackets — purple, centered in top half
 *
 * Draw order: fills → shell → mid box line → lattice → brackets
 * (tape strip intentionally hidden in dual)
 */

import React, { useId } from 'react';

type DataPackMarkProps = {
  className?: string;
  /** Tailwind size classes, e.g. h-7 w-7 */
  height?: string;
  width?: string;
  /** Accessible name when used as standalone image; omit when parent is aria-hidden */
  title?: string | null;
  /**
   * mono — single currentColor (default, product UI)
   * dual — green shell / mid line; purple top + brackets; orange lower + lattice
   */
  variant?: 'mono' | 'dual';
};

/** Explicit emerald for dual (currentColor is often white in chrome). */
const GREEN_HEX = '#65FEB7';
const PURPLE = '#e879f9';
/** Matched translucent washes. */
const PURPLE_SOFT = 'rgba(232,121,249,0.52)';
const ORANGE = '#fb923c';
const ORANGE_SOFT = 'rgba(251,146,60,0.52)';
/**
 * Icon drop-shadow floods — darker tints of each icon color (not near-black).
 * Purple #e879f9 → fuchsia-700; orange #fb923c → orange-700.
 */
const PURPLE_SHADOW = '#a21caf';
const ORANGE_SHADOW = '#c2410c';

/**
 * Dual color / mid-line crease — slight bias to larger lower face for optical even.
 */
const DUAL_CREASE = 'M12 27 32 38 52 27';

export default function DataPackMark({
  className = '',
  height = 'h-8',
  width = 'w-8',
  title = 'DataPack',
  variant = 'mono',
}: DataPackMarkProps) {
  const decorative = title == null || title === '';
  const dual = variant === 'dual';
  const uid = useId().replace(/:/g, '');
  const purpleShadowId = `ap-shadow-purple-${uid}`;
  const orangeShadowId = `ap-shadow-orange-${uid}`;
  // Dual always uses explicit green so shell never inherits white text color.
  const shell = dual ? GREEN_HEX : 'currentColor';
  const brackets = dual ? PURPLE : 'currentColor';
  const lattice = dual ? ORANGE : 'currentColor';

  // Measurement triangle — full size; optically centered in orange half.
  const nodeR = 2.2;
  const n1x = 26;
  const n1y = dual ? 43.5 : 34;
  const n2x = 38;
  const n2y = dual ? 50 : 41;
  const latticeLinks = dual
    ? 'M27.8 44.3 30.2 48.3M36.2 44.3 33.8 48.3M28.2 43.5H35.8'
    : 'M27.8 34.8 30.2 39.2M36.2 34.8 33.8 39.2M28.2 34H35.8';
  // Mono front plate only (dual tape strip hidden).
  const plateD = 'M20.5 28.5 32 35l11.5-6.5V42L32 48.5 20.5 42V28.5Z';
  // Brackets centered in top (purple) half.
  const bracketD = dual
    ? 'M27 17 23.5 20.5 27 24M37 17 40.5 20.5 37 24'
    : 'M27 20.5 23.5 24 27 27.5M37 20.5 40.5 24 37 27.5';
  // Mid box line — dual tracks color crease; mono uses original geometric mid belt.
  const midBoxLineD = dual ? DUAL_CREASE : 'M12 32.5 32 44 52 32.5';

  return (
    <svg
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block ${height} ${width} ${className}`.trim()}
    >
      {!decorative ? <title>{title}</title> : null}

      {dual ? (
        <defs>
          <filter
            id={purpleShadowId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.1"
              floodColor={PURPLE_SHADOW}
              floodOpacity="0.72"
            />
          </filter>
          <filter
            id={orangeShadowId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.1"
              floodColor={ORANGE_SHADOW}
              floodOpacity="0.72"
            />
          </filter>
        </defs>
      ) : null}

      {dual ? (
        <>
          {/* Soft washes — matched crease with mid box line */}
          <path
            fill={PURPLE_SOFT}
            d="M32 6 52 17.5 52 27 32 38 12 27 12 17.5 32 6Z"
          />
          <path
            fill={ORANGE_SOFT}
            d="M12 27 32 38 52 27V46.5L32 58 12 46.5V27Z"
          />
        </>
      ) : (
        <path
          fill="currentColor"
          d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
          opacity="0.22"
        />
      )}

      {/* Outer shell */}
      <path
        stroke={shell}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
      />

      {/* Mid box line — dual follows color crease */}
      <path
        stroke={shell}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        d={midBoxLineD}
      />

      {/* Mono only: front plate wash. Dual tape strip is hidden. */}
      {!dual ? (
        <path fill="currentColor" d={plateD} opacity="0.35" />
      ) : null}

      {/* Measurement logo — orange triangle, tinted orange shadow */}
      <g filter={dual ? `url(#${orangeShadowId})` : undefined}>
        <circle cx={n1x} cy={n1y} r={nodeR} fill={lattice} />
        <circle cx={n2x} cy={n1y} r={nodeR} fill={lattice} />
        <circle cx="32" cy={n2y} r={nodeR} fill={lattice} />
        <path
          stroke={lattice}
          strokeWidth="1.6"
          strokeLinecap="round"
          d={latticeLinks}
        />
      </g>

      {/* Code brackets — purple, tinted purple shadow */}
      <path
        stroke={brackets}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={bracketD}
        filter={dual ? `url(#${purpleShadowId})` : undefined}
      />
    </svg>
  );
}
