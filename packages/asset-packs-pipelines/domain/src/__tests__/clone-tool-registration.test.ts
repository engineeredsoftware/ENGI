// @ts-nocheck
import { ALL_ASSET_PACK_TOOLS } from '../tools';
import { assetPackCloneVCSRepositoryTool } from '../tools/AssetPackCloneVCSRepositoryTool';
import { ExecutionPipelineClass as PE } from '@bitcode/pipelines-generics';
import { initializeAssetPackPipeline } from '../preprocess';

describe('pipeline Tool registration (DocCode optional)', () => {
  it('clone tool has stable registry name', () => {
    expect((assetPackCloneVCSRepositoryTool as any).name).toBe(
      'asset-pack-clone-vcs-repository-tool',
    );
    const names = ALL_ASSET_PACK_TOOLS.map(
      (t) => (t as any).name || t.constructor?.name,
    );
    expect(names).toContain('asset-pack-clone-vcs-repository-tool');
  });

  it('initializeAssetPackPipeline registers Tools without DocCode gate', async () => {
    const exec = new PE('pipeline-test') as any;
    await initializeAssetPackPipeline(exec);
    const tool =
      exec.tools?.getTool?.('asset-pack-clone-vcs-repository-tool') ||
      exec.tools?.get?.('asset-pack-clone-vcs-repository-tool');
    expect(tool).toBeTruthy();
    const catalog = exec.get?.('tools', 'pipelineCatalog');
    expect(catalog?.registered).toContain('asset-pack-clone-vcs-repository-tool');
    expect(catalog?.law).toMatch(/optional/i);
    // Tools without DocCode still appear in registered (not refused).
    expect(Array.isArray(catalog?.withoutDocCode)).toBe(true);
    expect(catalog?.refusedDocCode).toBeUndefined();
  });
});
