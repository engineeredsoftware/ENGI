/**
 * Shared pure helpers for read route builders (hash, normalize, expiry).
 */

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeSafeNumber(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : fallback;
}

export function isExpired(now: string | null | undefined, expiresAt: string | null | undefined) {
  if (!now || !expiresAt) return false;
  const nowMs = new Date(now).getTime();
  const expiresMs = new Date(expiresAt).getTime();
  return Number.isFinite(nowMs) && Number.isFinite(expiresMs) && nowMs > expiresMs;
}
