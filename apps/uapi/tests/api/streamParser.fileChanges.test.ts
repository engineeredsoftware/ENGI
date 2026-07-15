/**
 * @jest-environment node
 */

import { parseStreamChunk } from '@/streaming/stream-parser';

describe('parseStreamChunk completion.fileChanges mapping', () => {
  it('prefers top-level fileChanges and mirrors them into AssetPack evidence only', () => {
    const chunk =
      'data: ' +
      JSON.stringify({
        type: 'completion',
        duration: 1234,
        result: {
          actions: {
            files: { created: ['a'], modified: ['b'], deleted: ['c'] },
          },
        },
        fileChanges: { created: ['x'], modified: ['y'], deleted: ['z'] },
      }) +
      '\n\n';

    const parsed = parseStreamChunk(chunk);
    expect(parsed.completion).not.toBeNull();
    expect(parsed.completion).not.toHaveProperty('deliverables');
    expect(parsed.completion!.writtenAssets.fileChanges).toEqual({
      created: ['x'],
      modified: ['y'],
      deleted: ['z'],
    });
    expect(parsed.completion!.assetPackSynthesisArtifacts!.fileChanges).toEqual({
      created: ['x'],
      modified: ['y'],
      deleted: ['z'],
    });
    expect(parsed.completion!.shippables).toBeNull();
    expect(parsed.completion!.deliveryMechanism).toBeNull();
  });
});
