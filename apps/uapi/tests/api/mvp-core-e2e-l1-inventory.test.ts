/**
 * @jest-environment node
 *
 * MVP-E2E-1 inventory lock: maps L1 core commercial API contracts to existing
 * suites / new route contracts. Update this table when filling gaps
 * (L1-S2 hybrid search still lib/package-level). Not a substitute for route behavior tests.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

type L1Row = {
  id: string;
  surface: string;
  coverage: 'route-suite' | 'lib-model' | 'gap' | 'partial';
  proofPath: string;
};

const L1_MATRIX: L1Row[] = [
  {
    id: 'L1-D1',
    surface: 'POST /api/deposit/synthesize-options',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/depositSynthesizeOptionsRoute.test.ts',
  },
  {
    id: 'L1-D2',
    surface: 'Deposit admit → activity journal',
    coverage: 'lib-model',
    // Unit: depositAdmissionActivity; spine also asserts activity source-safe (L4).
    proofPath: 'apps/uapi/tests/depositAdmissionActivity.test.ts',
  },
  {
    id: 'L1-D3',
    surface: 'GET /api/deposit/demand-estimate session + thin-corpus fail-closed',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/depositDemandEstimateRoute.test.ts',
  },
  {
    id: 'L1-R1',
    surface: 'POST /api/read/synthesize-options',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/readSynthesizeOptionsRoute.test.ts',
  },

  {
    id: 'L1-R2',
    surface: 'POST /api/read/settle/quote',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/readSettleQuoteRoute.test.ts',
  },
  {
    id: 'L1-R3',
    surface: 'POST /api/read/settle rehydrate + fail-closed',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/readSettleRoute.test.ts',
  },
  {
    id: 'L1-X1',
    surface: 'GET /api/packs/activity source-safe projection',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/packsActivityRoute.test.ts',
  },
  {
    id: 'L1-P1',
    surface: 'POST /api/packs/payout/finalize session + ownership + pending state',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/packsPayoutFinalizeRoute.test.ts',
  },
  {
    id: 'L1-S1',
    surface: 'POST /api/depository/index',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/depositoryIndexRoute.test.ts',
  },

  {
    id: 'L1-S2',
    surface: 'Hybrid search hit shape (field-weighted lexical)',
    coverage: 'lib-model',
    proofPath:
      'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/core/field-weighted-lexical.core.test.ts',
  },
  {
    id: 'L1-V1',
    surface: 'VCS GitHub connection / repair metadata',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/vcsRoutes.test.ts',
  },
  {
    id: 'L1-A1',
    surface: 'Unauthenticated commercial mutate → 401',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/depositoryIndexRoute.test.ts',
  },
  {
    id: 'L1-HOST',
    surface: 'POST /api/pipeline-host/asset-pack',
    coverage: 'route-suite',
    proofPath: 'apps/uapi/tests/api/pipelineHostRoute.test.ts',
  },
];

describe('MVP-E2E L1 inventory', () => {
  const repoRoot = path.resolve(__dirname, '../../../..');

  it('lists every required L1 id with a proof path on disk', () => {
    const ids = L1_MATRIX.map((r) => r.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'L1-D1',
        'L1-D2',
        'L1-D3',
        'L1-R1',
        'L1-R2',
        'L1-R3',
        'L1-X1',
        'L1-P1',
        'L1-S1',
        'L1-S2',
        'L1-V1',
        'L1-A1',
        'L1-HOST',
      ]),
    );
    for (const row of L1_MATRIX) {
      const abs = path.join(repoRoot, row.proofPath);
      expect({ id: row.id, exists: existsSync(abs), path: row.proofPath }).toEqual(
        expect.objectContaining({ id: row.id, exists: true }),
      );
    }
  });

  it('marks remaining non-route gaps explicitly', () => {
    const gaps = L1_MATRIX.filter((r) => r.coverage === 'gap' || r.coverage === 'partial');
    expect(gaps.map((g) => g.id)).not.toContain('L1-R3');
    expect(gaps.map((g) => g.id)).not.toContain('L1-X1');
    expect(gaps.map((g) => g.id)).not.toContain('L1-D3');
    expect(gaps.map((g) => g.id)).not.toContain('L1-P1');
    const x1 = L1_MATRIX.find((r) => r.id === 'L1-X1');
    expect(x1?.coverage).toBe('route-suite');
    const d3 = L1_MATRIX.find((r) => r.id === 'L1-D3');
    expect(d3?.coverage).toBe('route-suite');
    const p1 = L1_MATRIX.find((r) => r.id === 'L1-P1');
    expect(p1?.coverage).toBe('route-suite');
    // Hybrid search ranking remains package/lib coverage (L1-S2 / L3-Q).
    const s2 = L1_MATRIX.find((r) => r.id === 'L1-S2');
    expect(s2?.coverage).toBe('lib-model');
  });
});


