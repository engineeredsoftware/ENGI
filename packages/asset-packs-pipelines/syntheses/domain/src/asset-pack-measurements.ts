/**
 * Resolve nested AssetPack measurement kinds (absolutes | needinesses).
 *
 * Canonical carrier:
 *   measurements: { absolutes: Reading[], needinesses: Reading[] }
 *
 * Dual-read during migration:
 *   - pack.measurements.absolutes
 *   - pack.absolutes (legacy flat)
 *   - pack.measurements as flat array with category (legacy)
 */

export type AbsoluteLike = {
  measurementKind: string;
  label?: string;
  weight?: number;
  volume: number;
  magnitude?: number;
  unit?: string;
  category?: string;
};

export function resolvePackAbsolutes(pack: unknown): AbsoluteLike[] {
  if (!pack || typeof pack !== 'object') return [];
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const abs = (nested as { absolutes?: unknown }).absolutes;
    if (Array.isArray(abs)) return abs as AbsoluteLike[];
  }
  if (Array.isArray(p.absolutes)) return p.absolutes as AbsoluteLike[];
  if (Array.isArray(nested)) {
    return (nested as AbsoluteLike[]).filter(
      (m) => !m?.category || m.category === 'absolute',
    );
  }
  return [];
}

export function resolvePackNeedinesses(pack: unknown): AbsoluteLike[] {
  if (!pack || typeof pack !== 'object') return [];
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const n = (nested as { needinesses?: unknown }).needinesses;
    if (Array.isArray(n)) return n as AbsoluteLike[];
  }
  if (Array.isArray(nested)) {
    return (nested as AbsoluteLike[]).filter((m) => m?.category === 'neediness');
  }
  return [];
}

/** Attach nested measurements; dual-write legacy pack.absolutes for migration. */
export function attachNestedAbsolutes(
  pack: Record<string, unknown>,
  absolutes: AbsoluteLike[],
): void {
  const prev =
    pack.measurements && typeof pack.measurements === 'object' && !Array.isArray(pack.measurements)
      ? (pack.measurements as Record<string, unknown>)
      : {};
  pack.measurements = {
    ...prev,
    absolutes,
    needinesses: Array.isArray(prev.needinesses) ? prev.needinesses : [],
  };
  // Legacy dual-write (stream / older projections).
  pack.absolutes = absolutes;
}

export function hasRequiredAbsolutes(pack: unknown): boolean {
  const abs = resolvePackAbsolutes(pack);
  return abs.length > 0 && abs.every((m) => typeof m.volume === 'number' && Number.isFinite(m.magnitude));
}
