import {
  ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
  buildAssetPackPatchArtifact,
  serializeAssetPackPatchArtifactJson,
} from '../asset-pack-patch-artifact';

describe('AssetPackPatchArtifact', () => {
  it('binds assetPackId to a PatchArtifact base', () => {
    const artifact = buildAssetPackPatchArtifact({
      artifactId: 'art-1',
      assetPackId: 'asset-pack-auth',
      patchSummary: 'Auth slice',
      fileChanges: [
        { path: 'src/auth.ts', op: 'modify' },
        { path: 'src/auth/new.ts', op: 'add' },
      ],
    });

    expect(artifact.productSchema).toBe(ASSET_PACK_PATCH_ARTIFACT_SCHEMA);
    expect(artifact.assetPackId).toBe('asset-pack-auth');
    expect(artifact.identity.kind).toBe('patch');
    expect(artifact.fileCount).toBe(2);

    const parsed = JSON.parse(serializeAssetPackPatchArtifactJson(artifact));
    expect(parsed.assetPackId).toBe('asset-pack-auth');
    expect(parsed.schema).toBe(ASSET_PACK_PATCH_ARTIFACT_SCHEMA);
  });

  it('rejects empty assetPackId', () => {
    expect(() =>
      buildAssetPackPatchArtifact({
        artifactId: 'art-2',
        assetPackId: '',
      }),
    ).toThrow(/assetPackId/);
  });
});
