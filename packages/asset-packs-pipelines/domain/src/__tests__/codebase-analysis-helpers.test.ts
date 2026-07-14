/**
 * @jest-environment node
 */
import {
  buildFileTreeStructure,
  pickKeySourceFiles,
} from '../agents/discovery/codebase-analysis-helpers';

describe('codebase-analysis-helpers', () => {
  it('buildFileTreeStructure lists top-level dirs/files and extensions', () => {
    const tree = buildFileTreeStructure([
      'README.md',
      'package.json',
      'src/app.ts',
      'src/util.ts',
      'src/nested/deep.ts',
      'docs/guide.md',
    ]);
    expect(tree.pathCount).toBe(6);
    expect(tree.topLevelFiles).toEqual(expect.arrayContaining(['README.md', 'package.json']));
    expect(tree.topLevelDirs).toEqual(expect.arrayContaining(['src', 'docs']));
    expect(tree.extensionHistogram['.ts']).toBe(3);
    expect(tree.dirs['src']).toEqual(expect.arrayContaining(['app.ts', 'util.ts', 'nested/']));
  });

  it('pickKeySourceFiles prefers README/package.json and returns truncated bodies', () => {
    const reads = pickKeySourceFiles(
      [
        { path: 'README.md', content: '# Demo\n' + 'x'.repeat(20000) },
        { path: 'src/app.ts', content: 'export const a = 1' },
        { path: 'deep/nested/x.ts', content: 'export const deep = 1' },
      ],
      [],
      ['README.md', 'package.json', 'src/app.ts', 'deep/nested/x.ts'],
      8,
      100,
    );
    expect(reads[0]?.path).toBe('README.md');
    expect(reads[0]?.truncated).toBe(true);
    expect(reads[0]?.content.length).toBe(100);
    expect(reads.map((r) => r.path)).toContain('src/app.ts');
  });
});
