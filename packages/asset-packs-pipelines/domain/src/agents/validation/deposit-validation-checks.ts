/**
 * Deterministic AssetPack smoke/sanity checks for deposit Validation.
 *
 * Ground the gate so structurally broken or non-compliant synthesis output
 * always surfaces an issue, independent of the model's qualitative pass.
 * Operates on source-safe descriptors (paths + confidence + measurements) only.
 */

import type { DepositValidationResult } from './deposit-validation-schema';

export function isNum01(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function asPathList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is string => typeof p === 'string' && p.length > 0);
}

// A path violates an exclusion/obfuscation entry when it equals it or sits beneath
// it as a directory prefix. Source-safe: operates on paths only, never contents.
export function pathViolates(path: string, entry: string): boolean {
  if (!path || !entry) return false;
  if (path === entry) return true;
  const dir = entry.endsWith('/') ? entry : `${entry}/`;
  return path.startsWith(dir);
}

export function dedupeIssues(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => typeof v === 'string' && v.length > 0)));
}

/**
 * Deterministic smoke/sanity checks over source-safe AssetPack descriptors.
 */
export function smokeCheckAssetPacks(
  assetPacks: any[],
  forcedExclusions: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  if (!Array.isArray(assetPacks) || assetPacks.length === 0) {
    issues.push('No AssetPacks were synthesized to validate.');
    return issues;
  }
  const forbidden = [...forcedExclusions, ...obfuscatedPaths];
  const seenTitles = new Map<string, number>();

  assetPacks.forEach((pack: any, index: number) => {
    const label = pack?.title ? `"${pack.title}"` : `#${index + 1}`;

    if (!isNum01(pack?.confidence)) {
      issues.push(`AssetPack ${label} has a missing or out-of-range confidence (expected 0..1).`);
    }

    // Nested kinds: measurements.absolutes[] (deposit needinesses must be empty/absent).
    const nested = pack?.measurements;
    const absolutes = Array.isArray(nested?.absolutes)
      ? nested.absolutes
      : Array.isArray(pack?.absolutes)
        ? pack.absolutes
        : null;
    if (!absolutes || absolutes.length === 0) {
      issues.push(`AssetPack ${label} is missing measurements.absolutes (required absolute kind).`);
    } else {
      for (const row of absolutes) {
        if (!isNum01(row?.volume)) {
          issues.push(
            `AssetPack ${label} absolute "${row?.measurementKind || '?'}" volume is not honest 0..1.`,
          );
        }
        if (typeof row?.magnitude !== 'number' || !Number.isFinite(row.magnitude)) {
          issues.push(
            `AssetPack ${label} absolute "${row?.measurementKind || '?'}" missing required magnitude.`,
          );
        }
      }
    }
    // Legacy flat 0..1 map (only when nested absolutes absent)
    if (
      nested &&
      typeof nested === 'object' &&
      !Array.isArray(nested) &&
      !Array.isArray((nested as any).absolutes)
    ) {
      for (const [key, value] of Object.entries(nested)) {
        if (key === 'absolutes' || key === 'needinesses') continue;
        if (!isNum01(value)) {
          issues.push(`AssetPack ${label} measurement "${key}" is not an honest 0..1 volume.`);
        }
      }
    }

    const coveredPaths = asPathList(pack?.coveredSourcePaths);
    if (coveredPaths.length === 0) {
      issues.push(`AssetPack ${label} declares no coveredSourcePaths.`);
    }

    const fileChanges = pack?.patch?.fileChanges;
    if (!Array.isArray(fileChanges) || fileChanges.length === 0) {
      issues.push(`AssetPack ${label} has no patch descriptor with fileChanges (patch coherence).`);
    } else if (typeof pack?.patch?.patchSummary !== 'string' || pack.patch.patchSummary.length === 0) {
      issues.push(`AssetPack ${label} patch descriptor is missing a source-safe patchSummary.`);
    }

    const patchPaths = Array.isArray(fileChanges)
      ? fileChanges.map((fc: any) => fc?.path).filter((p: any): p is string => typeof p === 'string')
      : [];
    for (const path of [...coveredPaths, ...patchPaths]) {
      const hit = forbidden.find((entry) => pathViolates(path, entry));
      if (hit) {
        issues.push(`AssetPack ${label} touches withheld path "${path}" (violates exclusion/obfuscation "${hit}").`);
      }
    }

    if (typeof pack?.title === 'string' && pack.title.length > 0) {
      const norm = pack.title.trim().toLowerCase();
      seenTitles.set(norm, (seenTitles.get(norm) ?? 0) + 1);
    }
  });

  for (const [title, count] of seenTitles) {
    if (count > 1) {
      issues.push(`AssetPacks are not distinct: ${count} packs share the title "${title}".`);
    }
  }

  return issues;
}

/**
 * Merge agent qualitative verdict with deterministic smoke issues.
 * Any concrete issue forces recommendation "iterate".
 */
export function mergeDepositValidationVerdict(
  agentOutput: unknown,
  smokeIssues: string[],
): DepositValidationResult {
  const structured =
    agentOutput && typeof agentOutput === 'object' && Array.isArray((agentOutput as any).issues);
  const base: DepositValidationResult = structured
    ? {
        issues: Array.isArray((agentOutput as any).issues) ? (agentOutput as any).issues : [],
        qualityScore: isNum01((agentOutput as any).qualityScore) ? (agentOutput as any).qualityScore : 1,
        coverageGaps: Array.isArray((agentOutput as any).coverageGaps)
          ? (agentOutput as any).coverageGaps
          : [],
        recommendation: (agentOutput as any).recommendation === 'iterate' ? 'iterate' : 'complete',
      }
    : { issues: [], qualityScore: 1, coverageGaps: [], recommendation: 'complete' };

  const issues = dedupeIssues([...base.issues, ...smokeIssues]);
  return {
    issues,
    qualityScore: base.qualityScore,
    coverageGaps: base.coverageGaps,
    recommendation: issues.length > 0 ? 'iterate' : base.recommendation,
  };
}
