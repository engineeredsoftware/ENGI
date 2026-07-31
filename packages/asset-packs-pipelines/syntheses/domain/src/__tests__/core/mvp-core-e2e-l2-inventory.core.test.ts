/**
 * MVP-E2E L2 inventory: CI-fast SDIVF integration suites exist for deposit + read.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Relative to syntheses/ (sibling deposit/ + read/). */
const L2_FROM_SYNTHESES = [
  {
    id: 'L2-DEP',
    rel: 'deposit/src/__tests__/deposit-sdivf-pipeline-integration.test.ts',
  },
  {
    id: 'L2-READ',
    rel: 'read/src/__tests__/read-sdivf-pipeline-integration.test.ts',
  },
];

describe('MVP-E2E L2 inventory', () => {
  // domain/src/__tests__/core → syntheses/
  const synthesesRoot = path.resolve(__dirname, '../../../../');

  it('lists deposit + read SDIVF CI-fast integration suites on disk', () => {
    for (const row of L2_FROM_SYNTHESES) {
      const abs = path.join(synthesesRoot, row.rel);
      expect({ id: row.id, path: abs, exists: existsSync(abs) }).toEqual(
        expect.objectContaining({ id: row.id, exists: true }),
      );
    }
  });
});
