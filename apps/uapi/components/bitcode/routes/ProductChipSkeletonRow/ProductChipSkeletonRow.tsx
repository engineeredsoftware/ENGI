/**
 * Subtle pulsing chip-shaped skeletons for data-driven metric rows.
 *
 * Chip shell geometry must match live metric chips (fixed height, nowrap row)
 * so swapping skeleton → live never shifts vertical layout of already-rendered
 * siblings (title above, body below).
 */

'use client';

import React from 'react';

export type ProductChipSkeletonSpec = {
  /** Tailwind width for the label bar (e.g. w-12). */
  labelWidthClass: string;
  /** Tailwind width for the value bar (e.g. w-6). */
  valueWidthClass: string;
};

const DEFAULT_SPECS: ProductChipSkeletonSpec[] = [
  { labelWidthClass: 'w-10', valueWidthClass: 'w-8' },
  { labelWidthClass: 'w-12', valueWidthClass: 'w-5' },
  { labelWidthClass: 'w-14', valueWidthClass: 'w-6' },
  { labelWidthClass: 'w-11', valueWidthClass: 'w-5' },
  { labelWidthClass: 'w-16', valueWidthClass: 'w-8' },
  { labelWidthClass: 'w-12', valueWidthClass: 'w-7' },
  { labelWidthClass: 'w-14', valueWidthClass: 'w-10' },
];

/** Shared with live route/table metric chips — one row, fixed chip height. */
export const PRODUCT_METRIC_CHIP_ROW_CLASS =
  'flex h-7 w-full max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** Label↔value pair; modest gap (not UA dd margin / space-between). */
export const PRODUCT_METRIC_CHIP_SHELL_CLASS =
  'flex h-7 min-w-0 shrink-0 items-center gap-1.5 border border-white/10 bg-white/[0.045] px-2';

type ProductChipSkeletonRowProps = {
  /** Number of chip placeholders (defaults to specs length). */
  count?: number;
  /** Explicit per-chip dimensions; cycles DEFAULT_SPECS when omitted. */
  specs?: ProductChipSkeletonSpec[];
  className?: string;
  'data-testid'?: string;
};

export function ProductChipSkeletonRow({
  count,
  specs,
  className = '',
  'data-testid': dataTestId,
}: ProductChipSkeletonRowProps) {
  const resolved: ProductChipSkeletonSpec[] = (() => {
    if (specs && specs.length > 0) return specs;
    const n = Math.max(1, count ?? 3);
    return Array.from({ length: n }, (_, i) => DEFAULT_SPECS[i % DEFAULT_SPECS.length]);
  })();

  return (
    <div
      className={`${PRODUCT_METRIC_CHIP_ROW_CLASS} ${className}`.trim()}
      aria-busy="true"
      aria-hidden="true"
      data-testid={dataTestId}
    >
      {resolved.map((spec, index) => (
        <div
          key={`chip-skeleton-${index}`}
          className={`${PRODUCT_METRIC_CHIP_SHELL_CLASS} bg-white/[0.03] motion-safe:animate-pulse`}
          style={
            // Slight stagger so the row feels alive without being noisy.
            { animationDelay: `${index * 90}ms` }
          }
        >
          <span
            className={`inline-block h-2 ${spec.labelWidthClass} bg-white/[0.08]`}
          />
          <span
            className={`inline-block h-2.5 ${spec.valueWidthClass} bg-white/[0.12]`}
          />
        </div>
      ))}
    </div>
  );
}

export default ProductChipSkeletonRow;
