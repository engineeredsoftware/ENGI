// @ts-nocheck
import { assetPackCloneVCSRepositoryUse } from '../tools/AssetPackCloneVCSRepositoryTool';
import { existsSync } from 'fs';

describe('assetPackCloneVCSRepositoryUse', () => {
  it('clones public github repo from agent useTools shape', async () => {
    const out = await assetPackCloneVCSRepositoryUse({
      provider: 'github',
      owner: 'sindresorhus',
      name: 'is-plain-obj',
      ref: 'main',
      shallow: true,
    });
    expect(out.success).toBe(true);
    expect(out.workspacePath).toBeTruthy();
    expect(existsSync(out.workspacePath!)).toBe(true);
    expect(existsSync(`${out.workspacePath}/package.json`)).toBe(true);
  }, 60000);

  it('rejects missing owner/name without throwing on .length', async () => {
    const out = await assetPackCloneVCSRepositoryUse({ provider: 'github' } as any);
    expect(out.success).toBe(false);
    expect(out.status).toBe('invalid_input');
  });
});
