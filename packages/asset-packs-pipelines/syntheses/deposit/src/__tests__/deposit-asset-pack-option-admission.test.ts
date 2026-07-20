import {
  buildDepositAssetPackOptionAdmissionReport,
  assertDepositAssetPackOptionAdmissionReportSourceSafe,
} from '../deposit-asset-pack-option-admission';
import { buildDepositAssetPackOptionPolicyReport } from '../deposit-asset-pack-option-policy';
import { buildDepositAssetPackOptionSynthesis } from '../deposit-asset-pack-options';

describe('deposit-asset-pack-option-admission', () => {
  it('admits approved policy-eligible options with source-safe index, storage, telemetry, and packs activity receipts', () => {
    const synthesis = buildDepositAssetPackOptionSynthesis({
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      permissibleSources: ['apps/uapi/app/deposits/DepositPageClient.tsx'],
      depositoryDemandSignals: [{ id: 'depository-demand', weight: 0.8 }],
      readingDemandSignals: [{ id: 'reading-demand', weight: 0.86 }],
    });
    const policy = buildDepositAssetPackOptionPolicyReport({
      synthesis,
      sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.82 }],
      developmentCostSats: 1200,
      expectedSettlementSats: 6800,
      depositorWalletId: 'wallet-1',
    });

    const report = buildDepositAssetPackOptionAdmissionReport({
      synthesis,
      policy,
      reviewerId: 'depositor-1',
      telemetryRunId: 'deposit-run-1',
      decisions: [
        {
          optionId: synthesis.options[0].optionId,
          decision: 'approved-for-admission',
          feedback: 'Approve bounded route extraction option.',
        },
      ],
    });
    const admitted = report.receipts[0];

    expect(report.schema).toBe('bitcode.deposit.asset-pack-option-admission-report');
    expect(report.report).toBe('DepositAssetPackOptionAdmissionReport');
    expect(report.approvedCount).toBe(1);
    expect(report.admittedCount).toBe(1);
    expect(admitted.admission.state).toBe('admitted-to-depository');
    expect(admitted.admission.depositoryAssetPackId).toMatch(/^depository-assetpack-/u);
    expect(admitted.depositoryIndexProjection).toMatchObject({
      state: 'indexed-for-finding-fits',
      vectorEmbeddingState: 'projection-ready',
      searchDisclosure: 'measurements-and-metadata-only',
    });
    expect(admitted.storageProjection).toMatchObject({
      state: 'projected-to-object-storage',
      rawSourceStoredExternally: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    });
    expect(admitted.compensationPreview).toMatchObject({
      state: 'compensation-preview-ready',
      priceAsset: 'BTC',
      allocationMethod: 'source-to-shares-largest-remainder',
    });
    expect(admitted.packsActivitySync).toMatchObject({
      state: 'synchronized-to-packs',
      route: '/packs',
      activityType: 'depository-assetpack',
    });
    expect(admitted.telemetry).toMatchObject({
      eventType: 'deposit-option-admission',
      channel: 'execution-stream',
      sourceSafeMetadataOnly: true,
    });
    expect(assertDepositAssetPackOptionAdmissionReportSourceSafe(report)).toEqual({
      admitted: true,
      reason: 'source_safe_deposit_asset_pack_option_admission_report',
    });
  });

  it('keeps rejected, resynthesis, pending, and policy-blocked options out of the Depository', () => {
    const synthesis = buildDepositAssetPackOptionSynthesis({
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      permissibleSources: ['packages/asset-packs-pipelines/syntheses/domain/src/deposit-asset-pack-option-admission.ts'],
    });
    const policy = buildDepositAssetPackOptionPolicyReport({
      synthesis,
      sourceCriticalitySignals: [{ id: 'critical', severity: 'critical', weight: 1 }],
      developmentCostSats: 7000,
      expectedSettlementSats: 1000,
    });

    const report = buildDepositAssetPackOptionAdmissionReport({
      synthesis,
      policy,
      decisions: [
        { optionId: synthesis.options[0].optionId, decision: 'approved-for-admission' },
        { optionId: synthesis.options[1].optionId, decision: 'rejected-by-depositor' },
        { optionId: synthesis.options[2].optionId, decision: 'resynthesis-requested' },
      ],
    });

    expect(report.admittedCount).toBe(0);
    expect(report.blockedCount).toBe(1);
    expect(report.receipts[0].admission.state).toBe('not-admitted-policy-blocked');
    expect(report.receipts[0].admission.blockers).toContain('policy-blocked-before-admission');
    expect(report.receipts[1].admission.state).toBe('not-admitted-rejected');
    expect(report.receipts[2].admission.state).toBe('not-admitted-resynthesis-requested');
    expect(report.receipts.every((receipt) => receipt.packsActivitySync.state === 'not-synchronized')).toBe(true);
    expect(assertDepositAssetPackOptionAdmissionReportSourceSafe(report).admitted).toBe(true);
  });

  it('admits depositor-confirmed options even when compensation route is soft-incomplete', () => {
    // Solo testnet depositors often lack org/wallet compensation eligibility.
    // Soft compensation incompleteness must not silently drop a confirmed deposit.
    const synthesis = buildDepositAssetPackOptionSynthesis({
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      permissibleSources: ['apps/uapi/app/deposits/DepositPageClient.tsx'],
      depositoryDemandSignals: [{ id: 'depository-demand', weight: 0.8 }],
      readingDemandSignals: [{ id: 'reading-demand', weight: 0.86 }],
    });
    const policy = buildDepositAssetPackOptionPolicyReport({
      synthesis,
      sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.82 }],
      developmentCostSats: 1200,
      expectedSettlementSats: 6800,
      // No depositorWalletId → compensation soft-incomplete
    });

    const report = buildDepositAssetPackOptionAdmissionReport({
      synthesis,
      policy,
      reviewerId: 'depositor-1',
      decisions: synthesis.options.map((option) => ({
        optionId: option.optionId,
        decision: 'approved-for-admission' as const,
      })),
    });

    expect(report.admittedCount).toBe(synthesis.options.length);
    expect(
      report.receipts.every((receipt) => receipt.admission.state === 'admitted-to-depository'),
    ).toBe(true);
    expect(
      report.receipts.every((receipt) =>
        receipt.packsActivitySync.state === 'synchronized-to-packs',
      ),
    ).toBe(true);
  });
});
