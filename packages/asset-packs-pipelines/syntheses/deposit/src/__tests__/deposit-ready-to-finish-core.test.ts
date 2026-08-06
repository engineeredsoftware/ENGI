/**
 * Pure checks for ready-to-finish A/B/C logic without loading PTRR / tools-generics.
 *
 * @jest-environment node
 */
import {
  asPathList,
  isHallucinatedMissingEvidenceIssue,
  pathHitsAnyBlock,
  sanitizeObfuscatedPathsAgainstCatalog,
  smokeCheckAssetPacks,
} from '../agents/validation/deposit-validation-checks';

function obfuscationComplianceIssues(
  packs: any[],
  impermissibleSources: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  const blocked = [...impermissibleSources, ...obfuscatedPaths];
  for (const pack of packs) {
    const paths = [
      ...asPathList(pack?.coveredSourcePaths),
      ...(Array.isArray(pack?.patch?.fileChanges)
        ? pack.patch.fileChanges.map((c: any) => String(c?.path || ''))
        : []),
    ].filter(Boolean);
    for (const path of paths) {
      if (pathHitsAnyBlock(path, blocked)) {
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

  it('does not treat bare "tests" substring as an obfuscation path block', () => {
    const issues = obfuscationComplianceIssues(
      [
        {
          title: 'Jest config capability slice for deposit',
          coveredSourcePaths: ['tests/jest.setup.cjs'],
          patch: {
            fileChanges: [{ path: 'tests/jest.setup.cjs', op: 'modify' }],
            patchSummary: 'Test env setup.',
          },
          absolutes: [{ measurementKind: 'function-count', volume: 0.1, magnitude: 1 }],
        },
      ],
      [],
      ['tests'], // free-text "Tests." → bare token must not block all tests/*
    );
    expect(issues.some((i) => /Obfuscation/.test(i))).toBe(false);
  });

  it('sanitizes self-defeating obfuscatedPaths covering entire catalog (run 49a2630b)', () => {
    const catalog = [
      'tests/jest-globals.d.ts',
      'tests/jest.base.cjs',
      'tests/jest.setup.cjs',
    ];
    const sanitized = sanitizeObfuscatedPathsAgainstCatalog(catalog, catalog);
    expect(sanitized).toEqual([]);
    const smoke = smokeCheckAssetPacks(
      [
        {
          title: 'Jest Globals Declaration Capability',
          summary: 'Type declarations for test globals.',
          confidence: 0.8,
          coveredSourcePaths: ['tests/jest-globals.d.ts'],
          patch: {
            fileChanges: [{ path: 'tests/jest-globals.d.ts', op: 'modify' }],
            patchSummary: 'Globals.',
          },
          measurements: {
            absolutes: [
              {
                measurementKind: 'function-count',
                volume: 0.1,
                magnitude: 2,
                weight: 0.12,
                label: 'F',
                category: 'absolute',
              },
            ],
          },
        },
      ],
      [],
      sanitized,
    );
    expect(smoke.some((i) => /withheld path/.test(i))).toBe(false);
  });

  it('drops hallucinated missing-phase issues when packs are structured', () => {
    expect(
      isHallucinatedMissingEvidenceIssue(
        'Missing Setup workspacePath and danger-wall admission evidence',
        { priorIssuesEmpty: true, hasStructuredPacks: true },
      ),
    ).toBe(true);
    expect(
      isHallucinatedMissingEvidenceIssue(
        'Implementation produced zero AssetPack options with patch descriptors',
        { priorIssuesEmpty: true, hasStructuredPacks: true },
      ),
    ).toBe(true);
    expect(
      isHallucinatedMissingEvidenceIssue('Obfuscation/exclusion violation: real', {
        priorIssuesEmpty: true,
        hasStructuredPacks: true,
      }),
    ).toBe(false);
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
