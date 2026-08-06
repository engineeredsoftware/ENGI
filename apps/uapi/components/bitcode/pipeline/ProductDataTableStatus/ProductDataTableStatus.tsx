/**
 * Shared body status for product data tables (Deposit / Read / Packs).
 *
 * Loading, empty, and error share one DOM shape and one fixed inner height so
 * the table shell never jumps until real data rows render.
 */

'use client';

import React from 'react';

/**
 * Fixed status-body height. Applied on an inner div (not tr/td — table layout
 * ignores height on rows/cells and caused load↔empty jumps).
 */
export const PRODUCT_DATA_TABLE_STATUS_INNER_CLASS =
  'box-border flex h-14 w-full min-h-14 max-h-14 items-center overflow-hidden px-3 text-sm text-neutral-400';

/** Pulse widths cycle so skeleton columns read as a real row, not a blob. */
const SKELETON_WIDTH_PCT = [72, 48, 56, 40, 64, 52, 44] as const;

export type ProductDataTableLoadingRowProps = {
  colCount: number;
  /** Screen-reader / status label (e.g. "Loading pack activity"). */
  label: string;
  'data-testid'?: string;
};

/**
 * Column-aligned pulse bars inside the same fixed-height box as empty/error.
 */
export function ProductDataTableLoadingRow({
  colCount,
  label,
  'data-testid': dataTestId,
}: ProductDataTableLoadingRowProps) {
  const n = Math.max(1, colCount);
  return (
    <tr>
      <td colSpan={n} className="p-0">
        <div
          data-testid={dataTestId}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={label}
          className={PRODUCT_DATA_TABLE_STATUS_INNER_CLASS}
        >
          <div className="flex w-full min-w-0 items-center gap-3">
            {Array.from({ length: n }, (_, index) => (
              <span
                key={`skeleton-col-${index}`}
                className="block h-2.5 min-w-0 flex-1 motion-safe:animate-pulse rounded-sm bg-white/[0.08]"
                style={{
                  maxWidth: `${SKELETON_WIDTH_PCT[index % SKELETON_WIDTH_PCT.length]}%`,
                  animationDelay: `${index * 75}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

export type ProductDataTableMessageRowProps = {
  colCount: number;
  children: React.ReactNode;
  tone?: 'neutral' | 'error';
  role?: 'status' | 'alert';
  'data-testid'?: string;
};

/** Empty / error message — same fixed-height box as loading skeleton. */
export function ProductDataTableMessageRow({
  colCount,
  children,
  tone = 'neutral',
  role = 'status',
  'data-testid': dataTestId,
}: ProductDataTableMessageRowProps) {
  return (
    <tr>
      <td colSpan={Math.max(1, colCount)} className="p-0">
        <div
          data-testid={dataTestId}
          role={role}
          className={`${PRODUCT_DATA_TABLE_STATUS_INNER_CLASS} ${
            tone === 'error' ? 'text-red-200' : ''
          }`}
        >
          <span className="min-w-0 truncate">{children}</span>
        </div>
      </td>
    </tr>
  );
}
