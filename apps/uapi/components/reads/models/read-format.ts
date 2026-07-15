/**
 * Pure formatting helpers for the Reads experience.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

export function shortIdentifier(value: string | null | undefined) {
  if (!value) return 'pending';
  return value.length > 18 ? `${value.slice(0, 12)}...` : value;
}

export function formatSats(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'pending';
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)} sats`;
}
