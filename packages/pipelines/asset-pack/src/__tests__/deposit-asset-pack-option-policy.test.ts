import {
  buildDepositAssetPackOptionPolicyReport,
  assertDepositAssetPackOptionPolicyReportSourceSafe,
} from '../deposit-asset-pack-option-policy';
import { buildDepositAssetPackOptionSynthesis } from '../deposit-asset-pack-options';

function reviewableSynthesis() {
  return buildDepositAssetPackOptionSynthesis({
    repositoryFullName: 'engineeredsoftware/ENGI',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    obfuscations: 'Prepare source-safe deposit AssetPack options for non-critical reusable proof infrastructure.',
    sourcePathHints: [
      'uapi/app/deposits/DepositPageClient.tsx',
      'packages/pipelines/asset-pack/src/deposit-asset-pack-options.ts',
    ],
    depositoryDemandSignals: [{ id: 'depository-gap', label: 'Depository needs reviewable source supply', weight: 0.8 }],
    readingDemandSignals: [{ id: 'reading-fit-demand', label: 'Reading demand needs proof-bearing source fits', weight: 0.84 }],
    existingDepositorySignals: [{ id: 'supply-route', label: 'Existing supply uses compensation preview roots', weight: 0.62 }],
  });
}

describe('Deposit AssetPack option policy', () => {
  it('scores reviewable options for criticality, demand, ROI, BTD potential, and BTC compensation route', () => {
    const report = buildDepositAssetPackOptionPolicyReport({
      synthesis: reviewableSynthesis(),
      sourceCriticalitySignals: [
        {
          id: 'sub-critical-proof-surface',
          label: 'Reusable proof surface is sub-critical to expose after settlement.',
          severity: 'sub-critical',
          weight: 0.82,
        },
      ],
      depositorWalletId: 'wallet-depositor-1',
      developmentCostSats: 1500,
      expectedSettlementSats: 5200,
    });

    expect(report.schema).toBe('bitcode.deposit.asset-pack-option-policy-report');
    expect(report.policy).toBe('DepositAssetPackOptionPolicy');
    expect(report.route).toBe('/deposits');
    expect(report.optionCount).toBe(3);
    expect(report.reviewablePositiveRoiCount).toBeGreaterThan(0);
    expect(report.aggregatePolicy).toMatchObject({
      criticalityPolicy: 'source-safe-criticality-signals-with-depositor-review',
      demandPolicy: 'weighted-depository-reading-and-existing-supply-signals',
      roiPolicy: 'deterministic-estimated-gross-minus-development-cost',
      compensationPolicy: 'future-reader-btc-source-to-shares-route-preview',
      admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review',
    });
    for (const evaluation of report.evaluations) {
      expect(evaluation.sourceCriticality.state).not.toBe('blocked-critical-source');
      expect(evaluation.demand.weightedDemand).toBeGreaterThan(0.5);
      expect(evaluation.roi.estimatedGrossSats).toBeGreaterThan(0);
      expect(evaluation.btdPotential.estimateOnly).toBe(true);
      expect(evaluation.btdPotential.btdMintBoundary).toBe('not-minted-until-future-need-fit-settlement');
      expect(evaluation.compensation).toMatchObject({
        payer: 'future-reader-after-settlement',
        payee: 'depositing-wallet',
        priceAsset: 'BTC',
        allocationMethod: 'source-to-shares-largest-remainder',
        sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement',
      });
      expect(evaluation.admissionBoundary).toMatchObject({
        depositApprovalRequired: true,
        admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review',
        sourceBearingDisclosureBeforeSettlementVisible: false,
      });
      expect(evaluation.visibility.rawSourceTextVisible).toBe(false);
      expect(evaluation.roots.policyEvaluationRoot).toMatch(/^deposit-policy-evaluation:/);
    }
    expect(assertDepositAssetPackOptionPolicyReportSourceSafe(report)).toEqual({
      admitted: true,
      reason: 'source_safe_deposit_asset_pack_option_policy',
    });
    expect(JSON.stringify(report)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
  });

  it('blocks critical or negative-value options before Gate 7 admission without leaking source', () => {
    const report = buildDepositAssetPackOptionPolicyReport({
      synthesis: reviewableSynthesis(),
      sourceCriticalitySignals: [
        {
          id: 'critical-core-warning',
          label: 'Core IP would be critical to expose.',
          severity: 'critical',
          weight: 0.95,
        },
      ],
      developmentCostSats: 9000,
      expectedSettlementSats: 1800,
      depositorWalletId: null,
    });

    expect(report.blockedCount).toBe(3);
    expect(report.evaluations.every((evaluation) => evaluation.policyDecision === 'blocked-before-admission')).toBe(true);
    expect(report.evaluations.every((evaluation) => evaluation.sourceCriticality.state === 'blocked-critical-source')).toBe(true);
    expect(report.evaluations.every((evaluation) => evaluation.compensation.state === 'blocked-before-compensation')).toBe(true);
    expect(assertDepositAssetPackOptionPolicyReportSourceSafe(report).admitted).toBe(true);
    expect(JSON.stringify(report)).not.toContain('Core IP');
  });
});
