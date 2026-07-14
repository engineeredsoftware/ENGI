/**
 * Pure checks for ready-to-finish A/B/C logic without loading PTRR / tools-generics.
 *
 * @jest-environment node
 */
import {
  asPathList,
  smokeCheckAssetPacks,
} from '../agents/validation/deposit-validation-checks';

function obfuscationComplianceIssues(
  packs: any[],
  forcedExclusions: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  const blocked = [...forcedExclusions, ...obfuscatedPaths].map((p) => p.toLowerCase());
  for (const pack of packs) {
    const paths = [
      ...asPathList(pack?.coveredSourcePaths),
      ...(Array.isArray(pack?.patch?.fileChanges)
        ? pack.patch.fileChanges.map((c: any) => String(c?.path || ''))
        : []),
    ].filter(Boolean);
    for (const path of paths) {
      const lower = path.toLowerCase();
      if (blocked.some((b) => b && lower.includes(b.replace(/^\.\//, '')))) {
        issues.push(
          `Obfuscation/exclusion violation: pack "${pack?.title || '?'}" covers path ${path}.`,
        );
      }
    }
    if (!pack?.patch || !Array.isArray(pack.patch.fileChanges) || pack.patch.fileChanges.length === 0) {
      issues.push(`Pack "${pack?.title || '?'}" missing patch.fileChanges.`);
    }
    if (!Array.isArray(pack?.absolutes) || pack.absolutes.length === 0) {
      issues.push(`Pack "${pack?.title || '?'}" missing required measurements (absolutes).`);
    }
  }
  return issues;
}

describe('deposit ready-to-finish compliance (pure)', () => {
  it('requires patch + measurements on each pack', () => {
    const issues = obfuscationComplianceIssues(
      [{ title: 'Incomplete pack option for deposit review here', coveredSourcePaths: ['a.ts'] }],
      [],
      [],
    );
    expect(issues.some((i) => /patch\.fileChanges/.test(i))).toBe(true);
    expect(issues.some((i) => /measurements/.test(i))).toBe(true);
  });

  it('flags obfuscated path coverage', () => {
    const issues = obfuscationComplianceIssues(
      [
        {
          title: 'Leaks secret path capability slice',
          coveredSourcePaths: ['secret/keys.ts'],
          patch: { fileChanges: [{ path: 'secret/keys.ts', op: 'modify' }], patchSummary: 'x' },
          absolutes: [{ measurementKind: 'function-count', volume: 0.1 }],
        },
      ],
      [],
      ['secret/'],
    );
    expect(issues.some((i) => /Obfuscation|secret/.test(i))).toBe(true);
  });

  it('smokeCheckAssetPacks flags exclusion hits', () => {
    const issues = smokeCheckAssetPacks(
      [
        {
          title: 'Excluded path pack',
          coveredSourcePaths: ['secret/a.ts'],
          patch: { fileChanges: [{ path: 'secret/a.ts', op: 'modify' }], patchSummary: 'x' },
        },
      ],
      ['secret/'],
      [],
    );
    expect(issues.length).toBeGreaterThan(0);
  });
});
