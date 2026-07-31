/**
 * MVP-E2E L3 inventory: index/search/reembed contract suites on disk.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

const L3_FROM_REPO = [
  {
    id: 'L3-IDX',
    // relative to monorepo root via climb from domain/src/__tests__/core
    viaSyntheses: null as string | null,
    viaUapi: '../../../../../../../apps/uapi/tests/lib/depositoryIndexJob.upsert.contract.test.ts',
  },
  {
    id: 'L3-Q',
    viaSyntheses: 'mvp-core-e2e-l3-hybrid-search.core.test.ts',
    viaUapi: null,
  },
  {
    id: 'L3-RE',
    viaSyntheses: 'depository-reembed.core.test.ts',
    viaUapi: null,
  },
  {
    id: 'L3-EMBED',
    viaSyntheses: null,
    viaUapi: '../../../../../../../apps/uapi/tests/lib/depositoryIndexJob.test.ts',
  },
];

describe('MVP-E2E L3 inventory', () => {
  const coreDir = __dirname;

  it('lists index upsert, hybrid ranking, reembed, and embed helper suites', () => {
    for (const row of L3_FROM_REPO) {
      const candidates = [
        row.viaSyntheses ? path.join(coreDir, row.viaSyntheses) : '',
        row.viaUapi ? path.resolve(coreDir, row.viaUapi) : '',
      ].filter(Boolean);
      const exists = candidates.some((p) => existsSync(p));
      expect({ id: row.id, exists, candidates }).toEqual(
        expect.objectContaining({ id: row.id, exists: true }),
      );
    }
  });
});
