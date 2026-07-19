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
  const p = path.replace(/^\.\//, '').toLowerCase();
  const e = entry.replace(/^\.\//, '').toLowerCase();
  if (!p || !e) return false;
  if (p === e) return true;
  const dir = e.endsWith('/') ? e : `${e}/`;
  return p.startsWith(dir);
}

/**
 * Drop empty / over-broad block tokens (e.g. bare "tests" from free-text
 * "Tests.") that would substring-match every path under tests/.
 */
export function normalizeBlockedPathEntries(entries: string[]): string[] {
  return asPathList(entries)
    .map((e) => e.replace(/^\.\//, '').trim())
    .filter((e) => {
      if (e.length < 2) return false;
      // Bare labels without a path separator or file extension are too broad.
      if (!e.includes('/') && !e.includes('.')) return false;
      return true;
    });
}

export function pathHitsAnyBlock(path: string, blocked: string[]): boolean {
  const normalized = normalizeBlockedPathEntries(blocked);
  return normalized.some((entry) => pathViolates(path, entry));
}

/**
 * When Setup maps vague obfuscations (e.g. "Tests.") onto every remaining
 * catalog path, Validation would reject every pack even though that catalog
 * is the admitted deposit surface. Drop those self-defeating path blocks.
 */
export function sanitizeObfuscatedPathsAgainstCatalog(
  obfuscatedPaths: string[],
  catalogPaths: string[],
): string[] {
  const catalog = asPathList(catalogPaths).map((p) => p.replace(/^\.\//, ''));
  const obfuscated = normalizeBlockedPathEntries(obfuscatedPaths);
  if (catalog.length === 0 || obfuscated.length === 0) return obfuscated;

  const catalogLower = new Set(catalog.map((p) => p.toLowerCase()));
  // Exact catalog-path blocks that cover the whole deposit surface.
  const exactBlocks = obfuscated.filter((o) => catalogLower.has(o.toLowerCase()));
  const nonExact = obfuscated.filter((o) => !catalogLower.has(o.toLowerCase()));
  const everyCatalogBlocked =
    catalog.length > 0 &&
    catalog.every((path) => pathHitsAnyBlock(path, obfuscated));

  if (everyCatalogBlocked && exactBlocks.length >= catalog.length) {
    // Self-defeating: every catalog path was listed as obfuscated. Keep only
    // non-catalog block entries (if any).
    return nonExact;
  }
  if (everyCatalogBlocked && nonExact.length === 0) {
    return [];
  }
  return obfuscated;
}

/**
 * LLM ReadyToFinish often invents "missing Setup/Discovery/Implementation"
 * when deterministic priorIssues is empty and packs already carry structure
 * (run 49a2630b: priorIssueCount=0, packCount=3, structureReady false only
 * due to self-defeating obfuscation path hits).
 */
export function isHallucinatedMissingEvidenceIssue(
  issue: string,
  opts: { priorIssuesEmpty: boolean; hasStructuredPacks: boolean },
): boolean {
  if (!opts.priorIssuesEmpty || !opts.hasStructuredPacks) return false;
  const text = String(issue || '').toLowerCase();
  if (!text) return false;
  if (text.includes('missing setup') || text.includes('danger-wall admission')) return true;
  if (text.includes('no discovery') || text.includes('missing codebasecomprehension')) return true;
  if (text.includes('depositorysearch outputs present')) return true;
  if (text.includes('implementation produced zero')) return true;
  if (text.includes('zero assetpack options')) return true;
  if (text.includes('no assetpacks contain measurements')) return true;
  if (text.includes('no metadata (title, summary, kind')) return true;
  return false;
}

export function dedupeIssues(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => typeof v === 'string' && v.length > 0)));
}

/**
 * Deterministic smoke/sanity checks over source-safe AssetPack descriptors.
 */
export function smokeCheckAssetPacks(
  assetPacks: any[],
  impermissibleSources: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  if (!Array.isArray(assetPacks) || assetPacks.length === 0) {
    issues.push('No AssetPacks were synthesized to validate.');
    return issues;
  }
  const forbidden = normalizeBlockedPathEntries([
    ...impermissibleSources,
    ...obfuscatedPaths,
  ]);
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
