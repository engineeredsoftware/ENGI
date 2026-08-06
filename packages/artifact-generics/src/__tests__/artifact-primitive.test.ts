import {
  assertArtifactId,
  createArtifactIdentity,
  ARTIFACT_SCHEMA_PREFIX,
  DEFAULT_ARTIFACT_STORAGE_REQUIREMENTS,
  type Artifact,
} from '../index';

describe('artifact-generics primitives', () => {
  it('builds a minimal Artifact without storage', () => {
    const artifact: Artifact = {
      identity: createArtifactIdentity({
        artifactId: 'artifact-test-1',
        kind: 'blob',
      }),
      contentType: 'application/octet-stream',
      name: 'out.bin',
      storage: null,
    };

    expect(artifact.identity.schema).toBe(`${ARTIFACT_SCHEMA_PREFIX}.blob`);
    expect(artifact.storage).toBeNull();
    expect(DEFAULT_ARTIFACT_STORAGE_REQUIREMENTS.contentOpaque).toBe(true);
  });

  it('rejects empty artifact ids', () => {
    expect(() => assertArtifactId('')).toThrow(/non-empty/);
  });
});
