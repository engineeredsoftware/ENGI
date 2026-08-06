import {
  ASSET_PACK_HOST_EVIDENCE_TABLES,
  ASSET_PACK_HOST_RESULT_STATES,
  ASSET_PACK_HOST_STAGES,
  buildAssetPackPipelineHostManifest,
  VERCEL_SANDBOX_HOST_CAPABILITIES,
} from '../manifest';

describe('pipeline host manifest', () => {
  it('captures Vercel Sandbox host capabilities and Read/Fit evidence expectations', () => {
    const manifest = buildAssetPackPipelineHostManifest({
      mode: 'host_smoke',
      read: {
        id: 'read-1',
        prompt: 'Read the deposited repository revision.',
      },
      deposit: {
        id: 'deposit-1',
      },
      sourceRevision: {
        repositoryFullName: 'octocat/Spoon-Knife',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      commandEnvironment: {
        OPENAI_API_KEY: 'super-sensitive-token',
        BITCODE_PIPELINE_STREAM_TO_DATABASE: undefined,
      },
      createdAt: '2026-05-16T00:00:00.000Z',
    });

    expect(manifest.schema).toBe('bitcode.pipeline-host.manifest');
    expect(manifest.host.isolationBoundary).toBe('firecracker-microvm');
    expect(manifest.host.defaultWorkingDirectory).toBe('/vercel/sandbox');
    expect(manifest.stages).toEqual(ASSET_PACK_HOST_STAGES);
    expect(manifest.stages).toEqual(
      expect.arrayContaining(['need-synthesis', 'need-review', 'need-fit-search'])
    );
    expect(manifest.requireAcceptedReadNeed).toBe(true);
    expect(manifest.expectedEvidenceTables).toEqual(ASSET_PACK_HOST_EVIDENCE_TABLES);
    // Vocabulary lives once in @bitcode/host-generics — never re-list literals here.
    expect(manifest.resultStates).toBe(ASSET_PACK_HOST_RESULT_STATES);
    expect(manifest.commandEnvironment).toContainEqual({
      name: 'OPENAI_API_KEY',
      provided: true,
      value: '[redacted]',
    });
    expect(JSON.stringify(manifest)).not.toContain('super-sensitive-token');
  });

  it('uses the documented stable Sandbox runtimes without requiring live credentials', () => {
    expect(VERCEL_SANDBOX_HOST_CAPABILITIES.supportedRuntimes).toEqual([
      'node24',
      'node22',
      'python3.13',
    ]);
    expect(VERCEL_SANDBOX_HOST_CAPABILITIES.authentication).toEqual([
      'vercel-oidc-token',
      'vercel-access-token',
    ]);
  });
});
