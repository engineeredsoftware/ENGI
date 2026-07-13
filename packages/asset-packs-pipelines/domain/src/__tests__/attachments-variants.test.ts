// @ts-nocheck
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
    expect(res.shippable.prUrl).toContain('/pull/');
    expect(res.shippables.pullRequest.url).toContain('/pull/');
    expect(res.deliveryMechanism.prUrl).toContain('/pull/');
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
    expect(typeof res.summary).toBe('string');
  });

  it('covers Definition of Read-like good/bad requirements variations', async () => {
    const good = { ...baseInput, requirements: { testCoverage: 80, documentationRequired: true } };
    const bad = { ...baseInput, requirements: { testCoverage: 0, documentationRequired: false } };

    const resGood = await assetPack({ ...good, attachments: [] }, new Execution('asset-pack:good'));
    const resBad = await assetPack({ ...bad, attachments: [] }, new Execution('asset-pack:bad'));

    // Both execute, but shapes remain correct; downstream phases would enforce stricter criteria
    expect(resGood.success).toBe(true);
    expect(resBad.success).toBe(true);
    expect(resGood.metrics).toBeDefined();
    expect(resBad.metrics).toBeDefined();
  });
});
