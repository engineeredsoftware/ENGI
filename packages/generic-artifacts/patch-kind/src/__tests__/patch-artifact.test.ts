import {
  buildPatchArtifact,
  serializePatchArtifactJson,
  PATCH_ARTIFACT_SCHEMA,
  savePatchArtifact,
  type ArtifactStorage,
  type ArtifactInfo,
} from '../index';

describe('PatchArtifact', () => {
  it('builds a path-op patch artifact with protocol schema', () => {
    const pack = buildPatchArtifact({
      artifactId: 'artifact-patch-1',
      patchSummary: 'Auth slice patch',
      files: [
        { path: 'src/auth/index.ts', op: 'modify' },
        { path: 'src/auth/new.ts', op: 'add', body: 'export {}' },
      ],
    });

    expect(pack.identity.schema).toBe(PATCH_ARTIFACT_SCHEMA);
    expect(pack.identity.kind).toBe('patch');
    expect(pack.fileCount).toBe(2);
    expect(pack.storage).toBeNull();

    const json = serializePatchArtifactJson(pack);
    const parsed = JSON.parse(json);
    expect(parsed.schema).toBe(PATCH_ARTIFACT_SCHEMA);
    expect(parsed.files[0].path).toBe('src/auth/index.ts');
  });

  it('saves through ArtifactStorage and attaches ArtifactInfo', async () => {
    const stored: ArtifactInfo = {
      url: 'https://example.test/a.json',
      size: 12,
      name: 'a.json',
    };
    const storage: ArtifactStorage = {
      save: jest.fn(async () => stored),
      putAtKey: jest.fn(async () => stored),
    };

    const pack = buildPatchArtifact({
      artifactId: 'artifact-patch-2',
      files: [{ path: 'a.ts', op: 'modify' }],
    });
    const saved = await savePatchArtifact(storage, pack);

    expect(storage.save).toHaveBeenCalled();
    expect(saved.storage).toEqual(stored);
  });
});
