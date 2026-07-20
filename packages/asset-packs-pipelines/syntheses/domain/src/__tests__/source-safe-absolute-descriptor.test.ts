import { buildSourceSafeAbsoluteDescriptor } from '../source-safe-absolute-descriptor';

describe('buildSourceSafeAbsoluteDescriptor', () => {
  it('binds magnitude and volume for this AssetPack title (source-safe)', () => {
    const text = buildSourceSafeAbsoluteDescriptor({
      measurementKind: 'function-count',
      label: 'Functions',
      unit: 'functions',
      magnitude: 6,
      volume: 0.15,
      weight: 0.12,
      packTitle: 'Repo capability slice',
    });
    expect(text).toContain('"Repo capability slice"');
    expect(text).toContain('6 functions');
    expect(text).toContain('volume 15%');
    expect(text).toContain('weight 0.12');
    expect(text).not.toMatch(/unpaid source bodies are leaked|raw source/i);
  });

  it('falls back when title missing', () => {
    const text = buildSourceSafeAbsoluteDescriptor({
      measurementKind: 'file-span',
      label: 'File span',
      unit: 'files',
      magnitude: 1,
      volume: 0.1,
      weight: 0.08,
    });
    expect(text).toMatch(/this AssetPack option/);
    expect(text).toContain('1 files');
  });
});
