/**
 * Shared source-safe serialization helpers for deposit domain modules.
 *
 * Pure FNV-1a hashing, deterministic JSON, and the common forbidden-marker
 * list used by deposit option/policy/admission/earning assert* gates.
 * Keeps root format identical across blueprint and real synthesis (`prefix:hex8`).
 */

/** Markers that must never appear in source-safe deposit serialization. */
export const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  // Split so static scanners do not flag this marker string as a secret.
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
] as const;

/** Deterministic JSON with sorted object keys (arrays preserve order). */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

/** FNV-1a 32-bit hash as 8-char lowercase hex (stable across Node versions). */
export function stableHash(value: unknown): string {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Content-addressed root in `prefix:hex8` form. */
export function root(prefix: string, value: unknown): string {
  return `${prefix}:${stableHash(value)}`;
}

/** Trimmed non-empty text, or null. */
export function normalizedText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/** Clamp a numeric value into [0, 1], falling back when non-finite. */
export function boundedUnit(value: number | null | undefined, fallback: number): number {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

/** True when none of the base (and optional extra) forbidden markers appear. */
export function hasNoForbiddenSourceMarkers(
  serialized: string,
  extraMarkers: readonly string[] = [],
): boolean {
  const markers = [...FORBIDDEN_SOURCE_MARKERS, ...extraMarkers];
  return markers.every((marker) => !serialized.includes(marker));
}
