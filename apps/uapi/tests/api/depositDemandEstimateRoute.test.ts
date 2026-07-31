/**
 * @jest-environment node
 *
 * MVP-E2E L1-D3: GET /api/deposit/demand-estimate session + thin-corpus fail-closed.
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/depository-settled-demand', () => ({
  loadDepositorySettledDemandEstimate: jest.fn(),
  settledDemandEstimateToSignals: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import {
  loadDepositorySettledDemandEstimate,
  settledDemandEstimateToSignals,
} from '@/lib/depository-settled-demand';
import { GET } from '@/app/api/deposit/demand-estimate/route';

const mockCreateClient = createClient as jest.Mock;
const mockLoadEstimate = loadDepositorySettledDemandEstimate as jest.Mock;
const mockToSignals = settledDemandEstimateToSignals as jest.Mock;

function requestFor(query = '') {
  const qs = query.startsWith('?') ? query : query ? `?${query}` : '';
  return new Request(`http://localhost/api/deposit/demand-estimate${qs}`, {
    method: 'GET',
  });
}

function sessionUser(id = 'u-demand-1') {
  mockCreateClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id } }, error: null }) },
  });
}

function emptySignals() {
  return {
    depositoryDemandSignals: [],
    readingDemandSignals: [],
    existingDepositorySignals: [],
    unfitNeedOpportunitySignals: [],
  };
}

describe('GET /api/deposit/demand-estimate (MVP-E2E L1-D3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToSignals.mockImplementation((estimate: { estimatable?: boolean; demand?: number | null }) => {
      if (!estimate?.estimatable || estimate.demand == null) return emptySignals();
      return {
        depositoryDemandSignals: [
          { id: 'settled-depository-topic-demand', label: 'mock', weight: estimate.demand },
        ],
        readingDemandSignals: [],
        existingDepositorySignals: [],
        unfitNeedOpportunitySignals: [],
      };
    });
  });

  it('requires a Bitcode session (fail-closed)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });
    const response = await GET(requestFor());
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        error: 'A Bitcode session is required for demand estimates.',
      }),
    );
    expect(mockLoadEstimate).not.toHaveBeenCalled();
  });

  it('returns estimatable=false when settled corpus is thin (fail-closed honesty)', async () => {
    sessionUser();
    const unestimatable = {
      schema: 'bitcode.depository.settled-demand-estimate',
      estimatable: false,
      state: 'unestimatable-demand',
      demand: null,
      saturation: null,
      needinessVolume: null,
      settledPackCount: 0,
      matchedPackCount: 0,
      rationale:
        'Unestimatable: the Depository has no settled AssetPacks to search for comparable demand.',
      matchedPackIds: [],
    };
    mockLoadEstimate.mockResolvedValue(unestimatable);
    mockToSignals.mockReturnValue(emptySignals());

    const response = await GET(requestFor());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.estimate).toEqual(
      expect.objectContaining({
        estimatable: false,
        state: 'unestimatable-demand',
        demand: null,
        needinessVolume: null,
        settledPackCount: 0,
      }),
    );
    expect(payload.estimate.rationale).toMatch(/^Unestimatable:/);
    expect(payload.signals).toEqual(emptySignals());
  });

  it('forwards focus query params into the settled-demand loader', async () => {
    sessionUser();
    mockLoadEstimate.mockResolvedValue({
      schema: 'bitcode.depository.settled-demand-estimate',
      estimatable: false,
      state: 'unestimatable-demand',
      demand: null,
      saturation: null,
      needinessVolume: null,
      settledPackCount: 1,
      matchedPackCount: 0,
      rationale: 'Unestimatable: only 1 settled AssetPack(s) available; need at least 3 for a defensible estimate.',
      matchedPackIds: [],
    });
    mockToSignals.mockReturnValue(emptySignals());

    const response = await GET(
      requestFor(
        'repositoryFullName=acme%2Fwidgets&title=Auth+slice&summary=Session+tokens&kind=capability-slice',
      ),
    );
    expect(response.status).toBe(200);
    expect(mockLoadEstimate).toHaveBeenCalledWith({
      repositoryFullName: 'acme/widgets',
      focus: {
        repositoryFullName: 'acme/widgets',
        title: 'Auth slice',
        summary: 'Session tokens',
        kind: 'capability-slice',
      },
    });
  });

  it('returns ok envelope with estimate + signals when estimatable', async () => {
    sessionUser();
    const estimate = {
      schema: 'bitcode.depository.settled-demand-estimate',
      estimatable: true,
      state: 'moderate-likely-demand',
      demand: 0.42,
      saturation: 0.3,
      needinessVolume: 0.35,
      settledPackCount: 4,
      matchedPackCount: 2,
      rationale: 'Estimated from 2 of 4 settled Depository AssetPacks.',
      matchedPackIds: ['pack-a', 'pack-b'],
    };
    mockLoadEstimate.mockResolvedValue(estimate);
    mockToSignals.mockReturnValue({
      depositoryDemandSignals: [
        { id: 'settled-depository-topic-demand', label: estimate.rationale, weight: 0.42 },
      ],
      readingDemandSignals: [
        { id: 'settled-reading-demand-from-depository', label: 'reading', weight: 0.42 },
      ],
      existingDepositorySignals: [
        { id: 'settled-depository-supply-saturation', label: 'sat', weight: 0.3 },
      ],
      unfitNeedOpportunitySignals: [],
    });

    const response = await GET(requestFor('title=Auth'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.estimate).toEqual(
      expect.objectContaining({
        estimatable: true,
        demand: 0.42,
        saturation: 0.3,
        needinessVolume: 0.35,
        settledPackCount: 4,
        matchedPackIds: ['pack-a', 'pack-b'],
      }),
    );
    expect(payload.signals.depositoryDemandSignals[0]?.weight).toBe(0.42);
    expect(mockToSignals).toHaveBeenCalledWith(estimate);
  });
});
