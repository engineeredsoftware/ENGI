// @ts-nocheck
import { ALL_ASSET_PACK_TOOLS } from '../tools';
import { assetPackCloneVCSRepositoryTool } from '../tools/AssetPackCloneVCSRepositoryTool';
import { ExecutionPipelineClass as PE } from '@bitcode/pipelines-generics';
import {
  assertPipelineToolDocCode,
  initializeAssetPackPipeline,
} from '../preprocess';

describe('pipeline Tool DocCode registration law', () => {
  it('clone tool has name and __docCodePrompt (Tool primitive)', () => {
    expect((assetPackCloneVCSRepositoryTool as any).name).toBe(
      'asset-pack-clone-vcs-repository-tool',
    );
    const names = ALL_ASSET_PACK_TOOLS.map(
      (t) => (t as any).name || t.constructor?.name,
    );
    expect(names).toContain('asset-pack-clone-vcs-repository-tool');
    expect((assetPackCloneVCSRepositoryTool as any).__docCodePrompt).toBeTruthy();
    expect(() =>
      assertPipelineToolDocCode(
        assetPackCloneVCSRepositoryTool as any,
        'asset-pack-clone-vcs-repository-tool',
      ),
    ).not.toThrow();
  });

  it('refuses tools without DocCode (pipeline gate)', () => {
    expect(() =>
      assertPipelineToolDocCode({ name: 'bare' } as any, 'bare'),
    ).toThrow(/DocCode prompt required/);
  });

  it('initializeAssetPackPipeline registers only DocCode-complete Tools on pipeline.tools', async () => {
    const exec = new PE('pipeline-test') as any;
    await initializeAssetPackPipeline(exec);
    const tool =
      exec.tools?.getTool?.('asset-pack-clone-vcs-repository-tool') ||
      exec.tools?.get?.('asset-pack-clone-vcs-repository-tool');
    expect(tool).toBeTruthy();
    const catalog = exec.get?.('tools', 'pipelineCatalog');
    expect(catalog?.registered).toContain('asset-pack-clone-vcs-repository-tool');
    // Refused keys (if any) are Tools missing DocCode — still pipeline-level only.
    expect(Array.isArray(catalog?.refusedDocCode)).toBe(true);
    expect(catalog?.law).toMatch(/docCode|DocCode/i);
  });
});
