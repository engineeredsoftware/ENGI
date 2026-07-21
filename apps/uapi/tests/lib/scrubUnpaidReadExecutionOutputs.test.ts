/**
 * R2: legacy options-only rows must promote commercial material to fullOptions.
 */

import { scrubReadOutputPreserveFullOptions } from '@/lib/scrub-unpaid-read-execution-outputs';

describe('scrubReadOutputPreserveFullOptions', () => {
  it('copies legacy options with patch into fullOptions then unpaid-projects', () => {
    const legacy = {
      productPipeline: 'synthesize-reads-asset-packs-pipeline',
      catalogSourcePathCount: 10,
      options: [
        {
          index: 0,
          title: 'Slice',
          summary: 'does work',
          coveredSourcePaths: ['src/a.ts'],
          patch: {
            patchSummary: 'edit',
            fileChanges: [{ op: 'modify', path: 'src/a.ts' }],
          },
          measurements: {
            absolutes: [],
            needinesses: [{ measurementKind: 'need-fit', volume: 0.5 }],
          },
        },
      ],
    };
    const next = scrubReadOutputPreserveFullOptions(legacy);
    expect(next).toBeTruthy();
    expect(Array.isArray(next?.fullOptions)).toBe(true);
    expect((next?.fullOptions as unknown[])[0]).toMatchObject({
      patch: expect.objectContaining({ patchSummary: 'edit' }),
    });
    expect((next?.options as Array<{ patch?: unknown }>)[0].patch).toBeUndefined();
    expect((next?.options as Array<{ coveredSourcePaths?: unknown }>)[0].coveredSourcePaths)
      .toBeUndefined();
  });
});
