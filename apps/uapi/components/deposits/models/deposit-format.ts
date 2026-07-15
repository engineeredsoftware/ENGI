/**
 * Pure formatting helpers for the Deposits experience.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

export function shortIdentifier(value: string | null | undefined) {
  if (!value) return 'pending';
  return value.length > 18 ? `${value.slice(0, 12)}...` : value;
}

export function formatSats(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'pending';
  return `${value.toLocaleString()} sats`;
}

export function readStringField(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

/** Placeholder only — never a prefilled Obfuscations value. */
export const DEPOSIT_OBFUSCATIONS_PLACEHOLDER =
  'Note anything to obfuscate or withhold from the synthesized options: internal names, proprietary framing, or sensitive specifics the source-safe AssetPacks should avoid surfacing.';
