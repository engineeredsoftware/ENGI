/**
 * Bitcode AssetPack mark — technical knowledge-in-a-box.
 *
 * - mono: currentColor (emerald product chrome)
 * - dual: top purple (code/knowledge) + lower orange (measured pack / coin rail)
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
   * dual — top fuchsia/purple, lower amber/orange (marketing exchange)
   */
  variant?: 'mono' | 'dual';
};

const PURPLE = '#e879f9';
const PURPLE_SOFT = 'rgba(232,121,249,0.35)';
const ORANGE = '#fb923c';
const ORANGE_SOFT = 'rgba(251,146,60,0.4)';

export default function AssetPackMark({
  className = '',
  height = 'h-8',
  width = 'w-8',
  title = 'AssetPack',
  variant = 'mono',
}: AssetPackMarkProps) {
  const decorative = title == null || title === '';
  const mono = variant === 'mono';
  const top = mono ? 'currentColor' : PURPLE;
  const topSoft = mono ? 'currentColor' : PURPLE_SOFT;
  const low = mono ? 'currentColor' : ORANGE;
  const lowSoft = mono ? 'currentColor' : ORANGE_SOFT;
  const topOp = mono ? 0.22 : 1;
  const plateOp = mono ? 0.35 : 1;

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

      {/* Upper vault fill — purple / knowledge */}
      <path
        fill={topSoft}
        d="M32 6 52 17.5 52 32.5 32 44 12 32.5 12 17.5 32 6Z"
        opacity={topOp}
      />
      {/* Lower vault fill — orange / measured pack */}
      <path
        fill={lowSoft}
        d="M12 32.5 32 44l20-11.5V46.5L32 58 12 46.5V32.5Z"
        opacity={plateOp}
      />

      {/* Outer shell stroke: top edges purple, bottom edges orange */}
      <path
        stroke={top}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M12 17.5 32 6l20 11.5"
      />
      <path
        stroke={top}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M12 17.5V32.5M52 17.5V32.5"
      />
      <path
        stroke={low}
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M12 32.5V46.5L32 58l20-11.5V32.5"
      />

      {/* Mid belt seal — blend of both rails */}
      <path
        stroke={mono ? 'currentColor' : PURPLE}
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 32.5 32 44l20-11.5"
        opacity={mono ? 1 : 0.95}
      />
      {!mono ? (
        <path
          stroke={ORANGE}
          strokeWidth="1.2"
          strokeLinejoin="round"
          d="M14 33.6 32 44.2 50 33.6"
          opacity="0.85"
        />
      ) : null}

      {/* Front plate lower — orange mass */}
      <path
        fill={low}
        d="M20.5 34 32 40.5 43.5 34V42L32 48.5 20.5 42V34Z"
        opacity={mono ? 0.35 : 0.55}
      />

      {/* Lattice nodes + edges — orange (measured pack) */}
      <circle cx="26" cy="36.5" r="2.2" fill={low} />
      <circle cx="38" cy="36.5" r="2.2" fill={low} />
      <circle cx="32" cy="43" r="2.2" fill={low} />
      <path
        stroke={low}
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M27.8 37.3 30.2 41.2M36.2 37.3 33.8 41.2M28.2 36.5H35.8"
      />

      {/* Code brackets — purple (technical knowledge) */}
      <path
        stroke={top}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M27 18.5 23.5 22 27 25.5M37 18.5 40.5 22 37 25.5"
      />
    </svg>
  );
}
