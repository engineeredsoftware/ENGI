/**
 * Bitcode AssetPack mark — technical knowledge-in-a-box.
 * Monochrome (currentColor) for emerald product chrome and marketing glows.
 *
 * Geometry: isometric vault + lattice nodes (measured pack) + code brackets.
 */

import React from 'react';

type AssetPackMarkProps = {
  className?: string;
  /** Tailwind size classes, e.g. h-7 w-7 */
  height?: string;
  width?: string;
  /** Accessible name when used as standalone image; omit when parent is aria-hidden */
  title?: string | null;
};

export default function AssetPackMark({
  className = '',
  height = 'h-8',
  width = 'w-8',
  title = 'AssetPack',
}: AssetPackMarkProps) {
  const decorative = title == null || title === '';
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
      {/* Outer isometric vault shell */}
      <path
        fill="currentColor"
        d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
        opacity="0.22"
      />
      {/* Shell edges */}
      <path
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        d="M32 6 52 17.5v29L32 58 12 46.5v-29L32 6Z"
      />
      {/* Mid belt (pack seal) */}
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 32.5 32 44l20-11.5"
      />
      {/* Front face knowledge plate */}
      <path
        fill="currentColor"
        d="M20.5 28.5 32 35l11.5-6.5V42L32 48.5 20.5 42V28.5Z"
        opacity="0.35"
      />
      {/* Lattice: measured knowledge nodes */}
      <circle cx="26" cy="34" r="2.2" fill="currentColor" />
      <circle cx="38" cy="34" r="2.2" fill="currentColor" />
      <circle cx="32" cy="41" r="2.2" fill="currentColor" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M27.8 34.8 30.2 39.2M36.2 34.8 33.8 39.2M28.2 34H35.8"
      />
      {/* Code brackets — technical knowledge cue */}
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M27 20.5 23.5 24 27 27.5M37 20.5 40.5 24 37 27.5"
      />
    </svg>
  );
}
