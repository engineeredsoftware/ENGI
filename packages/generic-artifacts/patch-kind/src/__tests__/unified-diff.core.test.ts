import {
  buildUnifiedDiffFromPatchFiles,
  patchFilesHaveBodies,
} from '../unified-diff';

describe('buildUnifiedDiffFromPatchFiles', () => {
  it('emits full-file create hunks with body contents', () => {
    const text = buildUnifiedDiffFromPatchFiles(
      [
        {
          path: 'src/a.ts',
          op: 'create',
          body: 'export const a = 1;\n',
        },
      ],
      { patchSummary: 'add a' },
    );
    expect(text).toMatch(/^# add a/m);
    expect(text).toContain('diff --git a/src/a.ts b/src/a.ts');
    expect(text).toContain('new file mode 100644');
    expect(text).toContain('+export const a = 1;');
    expect(patchFilesHaveBodies([{ path: 'src/a.ts', op: 'create', body: 'x' }])).toBe(
      true,
    );
  });

  it('skips delete ops (commercial deposit patches disallow deletions)', () => {
    const text = buildUnifiedDiffFromPatchFiles([
      { path: 'src/gone.ts', op: 'delete' },
      {
        path: 'src/keep.ts',
        op: 'modify',
        body: 'export const keep = 1;\n',
      },
    ]);
    expect(text).not.toContain('deleted file mode');
    expect(text).not.toContain('src/gone.ts');
    expect(text).toContain('src/keep.ts');
    expect(text).toContain('+export const keep = 1;');
  });
});
