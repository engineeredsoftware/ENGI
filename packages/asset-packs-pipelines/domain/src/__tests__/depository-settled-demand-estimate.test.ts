import {
  estimateDepositorySettledDemand,
  groundOptionNeedinessFromSettledDepository,
  settledDemandEstimateToNeediness,
  settledDemandEstimateToSignals,
  type SettledDepositoryPackSummary,
} from '../depository-settled-demand-estimate';

function pack(
  id: string,
  overrides: Partial<SettledDepositoryPackSummary> = {},
): SettledDepositoryPackSummary {
  return {
    id,
    title: overrides.title ?? `Settled pack ${id}`,
    summary: overrides.summary ?? 'Source-safe settled AssetPack summary for demand search.',
    kind: overrides.kind ?? 'capability-slice',
    repositoryFullName: overrides.repositoryFullName ?? 'acme/widgets',
    lifecycleState: overrides.lifecycleState ?? 'settled',
    topics: overrides.topics ?? ['auth', 'routing'],
  };
}

describe('depository settled demand estimate', () => {
  it('returns unestimatable when the settled corpus is empty', () => {
    const estimate = estimateDepositorySettledDemand({ settledPacks: [] });
    expect(estimate.estimatable).toBe(false);
    expect(estimate.state).toBe('unestimatable-demand');
    expect(estimate.demand).toBeNull();
    expect(estimate.needinessVolume).toBeNull();
    expect(estimate.rationale).toMatch(/^Unestimatable:/);
    expect(settledDemandEstimateToSignals(estimate).depositoryDemandSignals).toEqual([]);
    expect(settledDemandEstimateToNeediness(estimate).estimatable).toBe(false);
  });

  it('returns unestimatable when below the settled floor', () => {
    const estimate = estimateDepositorySettledDemand({
      settledPacks: [pack('a'), pack('b')],
      minSettledPacks: 3,
    });
    expect(estimate.estimatable).toBe(false);
    expect(estimate.settledPackCount).toBe(2);
    expect(estimate.rationale).toMatch(/need at least 3/);
  });

  it('estimates aggregate demand from a settled corpus without inventing strong placeholders', () => {
    const settledPacks = [
      pack('1', { title: 'Auth capability slice', summary: 'Reusable authentication capability' }),
      pack('2', { title: 'Routing pattern', summary: 'HTTP routing implementation pattern' }),
      pack('3', { title: 'Proof ops', summary: 'Operations proof for deposit route' }),
      pack('4', { title: 'Telemetry slice', summary: 'Telemetry collection capability' }),
    ];
    const estimate = estimateDepositorySettledDemand({ settledPacks });
    expect(estimate.estimatable).toBe(true);
    expect(estimate.demand).not.toBeNull();
    expect(estimate.demand!).toBeGreaterThan(0);
    expect(estimate.demand!).toBeLessThanOrEqual(1);
    expect(estimate.saturation).not.toBeNull();
    expect(estimate.needinessVolume).not.toBeNull();
    expect(estimate.rationale).toMatch(/settled Depository AssetPack/i);
    const signals = settledDemandEstimateToSignals(estimate);
    expect(signals.depositoryDemandSignals[0]?.weight).toBe(estimate.demand);
  });

  it('returns unestimatable for a focused topic with no matching settled packs', () => {
    const settledPacks = [
      pack('1', { title: 'Auth capability', summary: 'login session tokens' }),
      pack('2', { title: 'Auth middleware', summary: 'session cookies' }),
      pack('3', { title: 'Identity bridge', summary: 'oauth providers' }),
    ];
    const estimate = estimateDepositorySettledDemand({
      settledPacks,
      focus: {
        title: 'Quantum ledger warp core',
        summary: 'Hyperdimensional quantum entanglement settlement primitives',
        kind: 'proof-operations-slice',
        repositoryFullName: 'other/org',
      },
    });
    expect(estimate.estimatable).toBe(false);
    expect(estimate.state).toBe('unestimatable-demand');
    expect(estimate.rationale).toMatch(/no settled Depository AssetPacks match/i);
  });

  it('raises demand for topic-aligned settled packs with low corpus coverage', () => {
    const settledPacks = [
      pack('1', {
        title: 'Deposit route proof operations',
        summary: 'Source-safe deposit route proof and admission',
        kind: 'proof-operations-slice',
        repositoryFullName: 'engineeredsoftware/ENGI',
        topics: ['deposit', 'route', 'proof'],
      }),
      pack('2', {
        title: 'Deposit admission receipt',
        summary: 'Depository admission for deposit options',
        kind: 'proof-operations-slice',
        repositoryFullName: 'engineeredsoftware/ENGI',
        topics: ['deposit', 'admission'],
      }),
      pack('3', {
        title: 'Unrelated widget inventory',
        summary: 'Inventory of garden widgets and tools',
        kind: 'capability-slice',
        repositoryFullName: 'acme/widgets',
        topics: ['garden', 'widgets'],
      }),
      pack('4', {
        title: 'Widget shipping labels',
        summary: 'Shipping label generation for widgets',
        kind: 'implementation-pattern',
        repositoryFullName: 'acme/widgets',
        topics: ['shipping'],
      }),
      pack('5', {
        title: 'Widget color palette',
        summary: 'Color tokens for the widget catalog',
        kind: 'capability-slice',
        repositoryFullName: 'acme/widgets',
        topics: ['design'],
      }),
    ];
    const estimate = estimateDepositorySettledDemand({
      settledPacks,
      focus: {
        title: 'Deposit route proof operations slice',
        summary: 'Source-safe deposit route proof and Depository admission evidence',
        kind: 'proof-operations-slice',
        repositoryFullName: 'engineeredsoftware/ENGI',
        coveredSourcePaths: ['apps/uapi/app/deposits/DepositPageClient.tsx'],
      },
    });
    expect(estimate.estimatable).toBe(true);
    expect(estimate.matchedPackCount).toBeGreaterThan(0);
    expect(estimate.demand).toBeGreaterThan(0);
    expect(settledDemandEstimateToNeediness(estimate).estimatable).toBe(true);
  });

  it('grounds option neediness from settled packs or marks Unestimatable', () => {
    const options = [
      {
        title: 'Auth capability slice',
        summary: 'Reusable authentication capability from the repository',
        kind: 'capability-slice',
        neediness: { volume: 0.86, demand: 0.9, saturation: 0.1, rationale: 'LLM invented' },
        contents: { provenantSourcePaths: ['src/auth.ts'] },
        sourceBinding: { repositoryFullName: 'acme/widgets' },
      },
    ];

    const thin = groundOptionNeedinessFromSettledDepository(options, []);
    expect(thin[0].neediness?.rationale).toMatch(/^Unestimatable:/);
    expect(thin[0].neediness?.demand).toBe(0);

    const settledPacks = [
      pack('1', { title: 'Auth capability', summary: 'authentication sessions' }),
      pack('2', { title: 'Auth middleware', summary: 'login authentication middleware' }),
      pack('3', { title: 'Session store', summary: 'authentication session store pattern' }),
    ];
    const grounded = groundOptionNeedinessFromSettledDepository(options, settledPacks);
    expect(grounded[0].neediness?.rationale).not.toBe('LLM invented');
    // Either estimatable from matches or honest Unestimatable — never silent invent.
    expect(
      grounded[0].neediness?.rationale?.includes('settled') ||
        grounded[0].neediness?.rationale?.startsWith('Unestimatable'),
    ).toBe(true);
  });
});
