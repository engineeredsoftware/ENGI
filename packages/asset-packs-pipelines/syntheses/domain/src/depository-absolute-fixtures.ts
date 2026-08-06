/**
 * Absolute measurement fixtures for depository search index + embed.
 *
 * Source-safe only: kind, label, short descriptor, volume, status.
 * Full catalogue volumes stay in absolute_volumes jsonb; fixtures are the
 * sparse commercial language layer (measured/estimated rows with prose).
 */

export type DepositoryAbsoluteFixture = {
  measurementKind: string;
  label?: string;
  descriptor?: string;
  volume: number;
  status?: string;
  category?: string;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function truncate(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

/**
 * Extract sparse fixtures from pack measurements (nested or flat absolutes).
 * Prefers measured/estimated with descriptors; drops pure expanded-fill zeros.
 */
export function extractAbsoluteFixturesFromMeasurements(
  measurements: unknown,
  opts?: { maxFixtures?: number; maxDescriptorLen?: number },
): DepositoryAbsoluteFixture[] {
  const maxFixtures = Math.max(1, Math.min(65, opts?.maxFixtures ?? 32));
  const maxDescriptorLen = Math.max(40, Math.min(400, opts?.maxDescriptorLen ?? 240));

  let rows: unknown[] = [];
  if (Array.isArray(measurements)) {
    rows = measurements;
  } else if (measurements && typeof measurements === 'object') {
    const nested = (measurements as { absolutes?: unknown }).absolutes;
    if (Array.isArray(nested)) rows = nested;
  }

  const out: DepositoryAbsoluteFixture[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const kind = asString(r.measurementKind || r.kind || r.id).toLowerCase();
    if (!kind) continue;
    const volume = clamp01(Number(r.volume));
    const status = asString(r.status || r.honestyStatus).toLowerCase() || undefined;
    const label = asString(r.label) || undefined;
    const descriptorRaw =
      asString(r.descriptor) ||
      asString(r.description) ||
      asString(r.rationale) ||
      asString(r.evidenceSummary) ||
      '';
    const isFill = status === 'expanded-fill' || status === 'fill' || status === 'insufficient';
    // Skip zero pure-fills from fixture prose (volumes still in full map).
    if (isFill && volume <= 0 && !descriptorRaw) continue;
    if (volume <= 0 && !descriptorRaw && !label) continue;

    const fixture: DepositoryAbsoluteFixture = {
      measurementKind: kind,
      volume,
    };
    if (label) fixture.label = label;
    if (descriptorRaw) fixture.descriptor = truncate(descriptorRaw, maxDescriptorLen);
    if (status) fixture.status = status;
    const category = asString(r.category);
    if (category) fixture.category = category;
    out.push(fixture);
    if (out.length >= maxFixtures) break;
  }

  // Prefer higher volume / has descriptor first when over cap was applied above
  // (already capped during push). Stable sort for determinism.
  return out.sort((a, b) => {
    const aScore = (a.descriptor ? 2 : 0) + a.volume;
    const bScore = (b.descriptor ? 2 : 0) + b.volume;
    return bScore - aScore || a.measurementKind.localeCompare(b.measurementKind);
  });
}

/** Lexical/embed corpus line for fixtures (source-safe). */
export function absoluteFixturesCorpusText(
  fixtures: DepositoryAbsoluteFixture[] | null | undefined,
  maxChars = 2500,
): string {
  if (!Array.isArray(fixtures) || fixtures.length === 0) return '';
  const lines: string[] = [];
  let used = 0;
  for (const f of fixtures) {
    const head = f.label || f.measurementKind;
    const vol = Number.isFinite(f.volume) ? f.volume.toFixed(3) : '0';
    const body = f.descriptor
      ? `${head}: ${f.descriptor} (${vol})`
      : `${head}:${vol}`;
    if (used + body.length + 1 > maxChars) break;
    lines.push(body);
    used += body.length + 1;
  }
  return lines.join(' ');
}
