/**
 * @jest-environment node
 */
import {
  depositCandidateSetSchema,
  normalizeDepositCandidateSetInput,
} from '../agents/implementation/deposit-asset-pack-synthesis-schema';

const validOption = {
  kind: 'capability-slice',
  title: 'Primary public API surface pack',
  summary:
    'Source-safe knowledge slice describing the repository public entrypoints for deposit review.',
  coveredSourcePaths: ['src/index.ts'],
  confidence: 0.7,
  patch: {
    fileChanges: [{ path: 'src/index.ts', op: 'modify' as const }],
    patchSummary: 'Encodes the public entry surface as a depositable AssetPack descriptor.',
  },
};

describe('normalizeDepositCandidateSetInput / depositCandidateSetSchema', () => {
  it('accepts canonical { options: [...] }', () => {
    const parsed = depositCandidateSetSchema.parse({ options: [validOption] });
    expect(parsed.options).toHaveLength(1);
    expect(parsed.options[0].title).toMatch(/Primary public/);
  });

  it('coerces a bare array into options (model mis-shape)', () => {
    expect(normalizeDepositCandidateSetInput([validOption])).toEqual({ options: [validOption] });
    const parsed = depositCandidateSetSchema.parse([validOption]);
    expect(parsed.options).toHaveLength(1);
  });

  it('coerces assetPacks / candidates alternate keys', () => {
    expect(
      depositCandidateSetSchema.parse({ assetPacks: [validOption] }).options,
    ).toHaveLength(1);
    expect(
      depositCandidateSetSchema.parse({ candidates: [validOption] }).options,
    ).toHaveLength(1);
  });

  it('coerces a single candidate object at the top level', () => {
    const parsed = depositCandidateSetSchema.parse(validOption);
    expect(parsed.options).toHaveLength(1);
    expect(parsed.options[0].kind).toBe('capability-slice');
  });

  it('still rejects when options is truly missing / empty', () => {
    expect(() => depositCandidateSetSchema.parse({})).toThrow();
    expect(() => depositCandidateSetSchema.parse({ options: [] })).toThrow();
  });
});
