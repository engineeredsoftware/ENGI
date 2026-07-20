import {
  buildSourceSafeAbsoluteDescriptor,
  buildSourceSafePackStructureProfile,
} from '../source-safe-absolute-descriptor';

describe('buildSourceSafeAbsoluteDescriptor', () => {
  const structure = buildSourceSafePackStructureProfile({
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts', 'lib/crypto.ts'],
    fileChanges: [
      { path: 'src/auth/session.ts', op: 'modify' },
      { path: 'src/auth/token.ts', op: 'modify' },
      { path: 'lib/crypto.ts', op: 'create' },
    ],
    languages: ['ts'],
    functionCount: 0,
    typeCount: 0,
    fileSpan: 3,
    symbolCount: 6,
    moduleCount: 2,
    measuredFromSamples: true,
  });

  it('binds this pack’s numbers and structure (not catalog glossary)', () => {
    const text = buildSourceSafeAbsoluteDescriptor({
      measurementKind: 'symbolic-richness',
      label: 'Symbolic richness',
      unit: 'symbols',
      magnitude: 6,
      volume: 0.03,
      weight: 0.12,
      packTitle: 'Auth rollback proof pack',
      structure,
    });
    expect(text).toContain('"Auth rollback proof pack"');
    expect(text).toContain('6 unique symbols');
    expect(text).toContain('volume 3%');
    expect(text).toContain('weight 0.12');
    expect(text).toMatch(/Symbology of this pack is/);
    expect(text).toMatch(/hierarchical|shallow|flat/);
    expect(text).toMatch(/connected|separated|mixed/);
    expect(text).toMatch(/covering areas of \[/);
    expect(text).toMatch(/modules:lib,src|modules:src,lib/);
    expect(text).toMatch(/languages:ts/);
    expect(text).toMatch(/kinds:symbols×6/);
    // Must not be generic catalog filler.
    expect(text).not.toMatch(/transferable structure without protected bodies/i);
    expect(text).not.toMatch(/Source-safe symbol density for this option's patch graph/i);
  });

  it('characterizes path topology for this pack', () => {
    expect(structure.topology).toBe('hierarchical');
    expect(structure.moduleRoots).toEqual(expect.arrayContaining(['src', 'lib']));
    expect(structure.ops.modify).toBe(2);
    expect(structure.ops.create).toBe(1);
  });
});
