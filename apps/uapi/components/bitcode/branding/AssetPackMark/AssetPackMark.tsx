/**
 * Bitcode AssetPack mark — technical knowledge-in-a-box.
 *
 * - mono: full mark in currentColor (emerald product chrome)
 * - dual: soft purple top + soft orange lower fills; green shell + mid tape;
 *   purple code brackets; orange measurements lattice (lower half only)
 */

import React from 'react';

type AssetPackMarkProps = {
  className?: string;
  /** Tailwind size classes, e.g. h-7 w-7 */
  height?: string;
  width?: string;
  /** Accessible name when used as standalone image; omit when parent is aria-hidden */
  title?: string | null;
  /**
   * mono — single currentColor (default, product UI)
   * dual — green shell/belt; soft purple top; soft orange lower + lattice
   */
  variant?: 'mono' | 'dual';
};

/** Explicit emerald for dual (currentColor is often white in chrome). */
const GREEN_HEX = '#65FEB7';
const PURPLE = '#e879f9';
/** First coloring pass opacity — soft wash, not solid. */
const PURPLE_SOFT = 'rgba(232,121,249,0.32)';
const ORANGE = '#fb923c';
const ORANGE_SOFT = 'rgba(251,146,60,0.32)';

export default function AssetPackMark({
  className = '',
  height = 'h-8',
  width = 'w-8',
  title = 'AssetPack',
  variant = 'mono',
}: AssetPackMarkProps) {
  const decorative = title == null || title === '';
  const dual = variant === 'dual';
  // Dual always uses explicit green so shell never inherits white text color.
  const shell = dual ? GREEN_HEX : 'currentColor';
  const brackets = dual ? PURPLE : 'currentColor';
  const lattice = dual ? ORANGE : 'currentColor';

  // Mid tape stays on the geometric mid belt (close corner at 32,44).
  // Measurements plate + lattice sit well below that corner in the orange half.
  const n1y = dual ? 44 : 34;
  const n2y = dual ? 51.5 : 41;
  const plateD = dual
    ? 'M20.5 41 32 47.5 43.5 41V49.5L32 56 20.5 49.5V41Z'
    : 'M20.5 28.5 32 35l11.5-6.5V42L32 48.5 20.5 42V28.5Z';
  const plateOp = dual ? 0.42 : 0.35;
  const latticeLinks = dual
    ? 'M27.8 44.8 30.2 49.5M36.2 44.8 33.8 49.5M28.2 44H35.8'
    : 'M27.8 34.8 30.2 39.2M36.2 34.8 33.8 39.2M28.2 34H35.8';
  const bracketD = dual
    ? 'M27 18.5 23.5 22 27 25.5M37 18.5 40.5 22 37 25.5'
    : 'M27 20.5 23.5 24 27 27.5M37 20.5 40.5 24 37 27.5';

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
        <>
          {/* Soft fills only — lower opacity like first coloring pass */}
          <path
            fill={PURPLE_SOFT}
            d="M32 6 52 17.5 52 32.5 32 44 12 32.5 12 17.5 32 6Z"
          />
          <path
            fill={ORANGE_SOFT}
            d="M12 32.5 32 44l20-11.5V46.5L32 58 12 46.5V32.5Z"
          />
        </>
      ) : (
        <path
          fill="currentColor"
          d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
          opacity="0.22"
        />
      )}

      {/* Outer shell — green in dual (never white from currentColor) */}
      <path
        stroke={shell}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
      />

      {/* Front plate mass — lower half only (below mid tape) */}
      <path fill={dual ? ORANGE : 'currentColor'} d={plateD} opacity={plateOp} />

      {/* Measurements lattice — further below the mid tape */}
      <circle cx="26" cy={n1y} r="2.2" fill={lattice} />
      <circle cx="38" cy={n1y} r="2.2" fill={lattice} />
      <circle cx="32" cy={n2y} r="2.2" fill={lattice} />
      <path
        stroke={lattice}
        strokeWidth="1.6"
        strokeLinecap="round"
        d={latticeLinks}
      />

      {/* Mid belt / tape — drawn last so green sits above fills/plate at the close corner */}
      <path
        stroke={shell}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M12 32.5 32 44l20-11.5"
      />

      {/* Code brackets — purple in dual */}
      <path
        stroke={brackets}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={bracketD}
      />
    </svg>
  );
}
