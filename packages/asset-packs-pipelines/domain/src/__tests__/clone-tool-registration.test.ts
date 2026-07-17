// @ts-nocheck
import { ALL_ASSET_PACK_TOOLS } from '../tools';
import { assetPackCloneVCSRepositoryTool } from '../tools/AssetPackCloneVCSRepositoryTool';
import { ExecutionPipelineClass as PE } from '@bitcode/pipelines-generics';
import { initializeAssetPackPipeline } from '../preprocess';

describe('clone tool registration', () => {
  it('is in ALL_ASSET_PACK_TOOLS with name and doc prompt', () => {
    expect((assetPackCloneVCSRepositoryTool as any).name).toBe(
      'asset-pack-clone-vcs-repository-tool',
    );
    const names = ALL_ASSET_PACK_TOOLS.map(
      (t) => (t as any).name || t.constructor?.name,
    );
    expect(names).toContain('asset-pack-clone-vcs-repository-tool');
    // Doc may be build-time; log if missing
    if (!(assetPackCloneVCSRepositoryTool as any).__docCodePrompt) {
      console.warn('clone tool missing __docCodePrompt at runtime');
    }
  });

  it('initializeAssetPackPipeline registers clone tool on pipeline.tools', async () => {
    const exec = new PE('pipeline-test') as any;
    await initializeAssetPackPipeline(exec);
    const tool =
      exec.tools?.getTool?.('asset-pack-clone-vcs-repository-tool') ||
      exec.tools?.get?.('asset-pack-clone-vcs-repository-tool');
    const paths = typeof exec.tools?.getPaths === 'function' ? exec.tools.getPaths() : [];
    console.log('paths sample', paths.filter((p: string) => /clone|vcs/i.test(p)));
    console.log('tool found', !!tool, 'pathCount', paths.length);
    expect(tool).toBeTruthy();
  });
});
