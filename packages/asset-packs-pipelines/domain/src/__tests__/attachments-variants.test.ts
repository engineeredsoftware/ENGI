// @ts-nocheck
/**
 * Attachment / Definition of Read variants under test-mode SDIVF stubs.
 * Synthesis Finish does not open buyer-repo PRs (settle ships).
 */
import assetPack from '../index';
import { Execution } from '@bitcode/execution-generics';

describe('AssetPack pipeline - attachments and Definition of Read variants (enabled when full SDIVF is active)', () => {
  const baseInput = {
    definitionOfRead: 'Implement feature X',
    repository: { url: 'https://github.com/acme/repo', branch: 'main' },
    requirements: { testCoverage: 20, documentationRequired: true },
    deliveryTarget: 'pr' as const,
  };

  it('accepts no attachments', async () => {
    const exec = new Execution('asset-pack:no-attachments');
    const res = await assetPack({ ...baseInput, attachments: [] }, exec);
    expect(res.success).toBe(true);
    expect(res.shippable?.prUrl).toBeUndefined();
    expect(res.metrics).toBeDefined();
  });

  it('accepts file and url attachments (multimodal simulation)', async () => {
    const exec = new Execution('asset-pack:attachments');
    const attachments = [
      { id: 'a1', type: 'file', content: '/tmp/readme.png', metadata: { contentType: 'image/png' } },
      { id: 'a2', type: 'url', content: 'https://example.com/spec' },
    ];
    const res = await assetPack({ ...baseInput, attachments }, exec);
    expect(res.success).toBe(true);
    expect(res.metrics).toBeDefined();
  });

  it('handles integration/issue attachments', async () => {
    const exec = new Execution('asset-pack:integration');
    const attachments = [
      { id: 'i1', type: 'integration', content: 'github:12345' },
      { id: 'i2', type: 'issue', content: '42' },
    ];
    const res = await assetPack({ ...baseInput, attachments }, exec);
    expect(res.success).toBe(true);
  });
});
