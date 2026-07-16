import {
  assertDepositorEarningSupplyIntelligenceSourceSafe,
  buildDepositorEarningSupplyIntelligence,
} from '../depositor-earning-supply-intelligence';
import { buildDepositAssetPackOptionPolicyReport } from '../deposit-asset-pack-option-policy';
import { buildDepositAssetPackOptionSynthesis } from '../deposit-asset-pack-options';

function reviewablePolicyReport() {
  const synthesis = buildDepositAssetPackOptionSynthesis({
    repositoryFullName: 'octocat/Spoon-Knife',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    obfuscations: 'Prepare source-safe options likely to satisfy unfit Reading demand.',
    permissibleSources: [
      'apps/uapi/app/deposits/DepositPageClient.tsx',
      'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
    ],
    depositoryDemandSignals: [
      { id: 'portfolio-gap', label: 'Portfolio needs supply for common route operations.', weight: 0.82 },
    ],
    readingDemandSignals: [
      { id: 'unfit-read-demand', label: 'Recent Reads need better source-safe deposit supply.', weight: 0.88 },
    ],
    existingDepositorySignals: [
      { id: 'low-coverage-supply', label: 'Existing Depository coverage is thin for route proof work.', weight: 0.62 },
    ],
  });

  return buildDepositAssetPackOptionPolicyReport({
    synthesis,
    sourceCriticalitySignals: [
      {
        id: 'sub-critical-route-surface',
        label: 'Route surface is sub-critical to expose after settlement.',
        severity: 'sub-critical',
        weight: 0.86,
      },
    ],
    depositorWalletId: 'wallet-depositor-1',
    developmentCostSats: 1500,
    expectedSettlementSats: 5600,
  });
}

describe('Depositor earning supply intelligence', () => {
  it('builds source-safe earning statements and supply recommendations', () => {
    const intelligence = buildDepositorEarningSupplyIntelligence({
      policyReport: reviewablePolicyReport(),
      unfitNeedOpportunitySignals: [
        {
          id: 'unfit-need-route-proof',
          label: 'Unfit Reads need route proof and source-safe delivery evidence.',
          weight: 0.84,
        },
      ],
    });

    expect(intelligence.schema).toBe('bitcode.deposit.earning-supply-intelligence');
    expect(intelligence.intelligence).toBe('DepositorEarningSupplyIntelligence');
    expect(intelligence.route).toBe('/deposits');
    expect(intelligence.likelyDemand.state).toBe('strong-demand-opportunity');
    expect(intelligence.unfitNeedOpportunities.opportunityCount).toBe(1);
    expect(intelligence.earningStatements).toHaveLength(3);
    expect(intelligence.earningStatements[0]).toMatchObject({
      schema: 'bitcode.deposit.depositor-earning-statement',
      valueLabel: 'estimate',
      expectedCompensationRangeSats: {
        priceAsset: 'BTC',
        rangeBasis: 'estimated-future-reader-settlement-share',
      },
      sourceToShares: {
        allocationMethod: 'source-to-shares-largest-remainder',
        proofState: 'not-created-until-accepted-need-fit-and-settlement',
      },
    });
    expect(intelligence.aggregate.eligibleEarningStatementCount).toBeGreaterThan(0);
    expect(intelligence.aggregate.totalExpectedCompensationSats).toBeGreaterThan(0);
    expect(intelligence.supplyRecommendations.length).toBe(3);
    expect(intelligence.roots.intelligenceRoot).toMatch(/^deposit-earning-supply-intelligence:/u);
    expect(assertDepositorEarningSupplyIntelligenceSourceSafe(intelligence)).toEqual({
      admitted: true,
      reason: 'source_safe_depositor_earning_supply_intelligence',
    });
  });

  it('blocks critical source from earning readiness without leaking protected payloads', () => {
    const synthesis = buildDepositAssetPackOptionSynthesis({
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      permissibleSources: ['packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts'],
      readingDemandSignals: [{ id: 'demand', label: 'Demand exists.', weight: 0.8 }],
    });
    const policyReport = buildDepositAssetPackOptionPolicyReport({
      synthesis,
      sourceCriticalitySignals: [{ id: 'critical', severity: 'critical', weight: 1 }],
      developmentCostSats: 9200,
      expectedSettlementSats: 1800,
      depositorWalletId: null,
    });
    const intelligence = buildDepositorEarningSupplyIntelligence({ policyReport });

    expect(intelligence.aggregate.blockedCriticalSourceCount).toBe(3);
    expect(intelligence.earningStatements.every((statement) => statement.state === 'blocked-critical-source')).toBe(true);
    expect(intelligence.supplyRecommendations.every((recommendation) => recommendation.action === 'withhold-critical-source')).toBe(true);
    expect(assertDepositorEarningSupplyIntelligenceSourceSafe(intelligence).admitted).toBe(true);
    expect(JSON.stringify(intelligence)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
  });

  it('marks likely demand and compensation unestimatable without inventing placeholders', () => {
    const intelligence = buildDepositorEarningSupplyIntelligence({
      policyReport: reviewablePolicyReport(),
      demandUnestimatable: true,
      demandUnestimatableRationale:
        'Unestimatable: the Depository has no settled AssetPacks to search for comparable demand.',
      unfitNeedOpportunitySignals: [
        {
          id: 'should-be-ignored',
          label: 'Must not surface when demand is unestimatable.',
          weight: 0.99,
        },
      ],
    });

    expect(intelligence.likelyDemand.state).toBe('unestimatable-demand');
    expect(intelligence.likelyDemand.averageConfidence).toBe(0);
    expect(intelligence.unfitNeedOpportunities.state).toBe('unestimatable-demand');
    expect(intelligence.unfitNeedOpportunities.opportunityCount).toBe(0);
    expect(
      intelligence.earningStatements.every((statement) => statement.state === 'unestimatable-demand'),
    ).toBe(true);
    expect(intelligence.aggregate.totalExpectedCompensationSats).toBe(0);
    expect(intelligence.aggregate.eligibleEarningStatementCount).toBe(0);
  });
});
