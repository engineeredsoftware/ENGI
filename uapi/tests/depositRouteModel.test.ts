import {
  assertDepositRouteSessionSourceSafe,
  buildDepositRouteSession,
  readDepositRouteStage,
  writeDepositRouteStage,
} from '@/app/deposits/deposit-route-model';

describe('deposit-route-model', () => {
  it('builds a source-safe five-step DepositRouteSession with option synthesis ownership', () => {
    const session = buildDepositRouteSession({
      transactionId: 'deposit-run-1',
      depositStage: 'review-options',
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      obfuscations: 'Create bounded source-safe AssetPack options for review.',
      sourcePathHints: ['uapi/app/deposits/DepositPageClient.tsx'],
      sourceCriticalitySignals: [
        {
          id: 'sub-critical-route-test',
          label: 'Route test source is sub-critical.',
          severity: 'sub-critical',
          weight: 0.75,
        },
      ],
      depositorWalletId: 'wallet-depositor-1',
      optionsRequested: true,
      optionReviewDecisions: [
        {
          optionId: 'will-be-ignored-until-synthesis-option-id-is-known',
          decision: 'pending-depositor-review',
        },
      ],
    });

    expect(session.schema).toBe('bitcode.deposit.route-session');
    expect(session.route).toBe('/deposits');
    expect(session.stageCount).toBe(5);
    expect(session.steps.map((step) => step.id)).toEqual([
      'connect-source',
      'synthesize-options',
      'review-options',
      'submit-deposit',
      'read-depository-state',
    ]);
    expect(session.activeStepId).toBe('review-options');
    expect(session.pipelineOwnership).toMatchObject({
      depositOptionPipeline: 'DepositAssetPackOptionSynthesis',
      depositOptionPolicy: 'DepositAssetPackOptionPolicy',
      depositOptionAdmission: 'DepositAssetPackOptionAdmissionReport',
      depositorEarningSupplyIntelligence: 'DepositorEarningSupplyIntelligence',
      reviewRequiredBeforeDepositAdmission: true,
      sourceCriticalityDemandRoiPolicyPresent: true,
      sourceCriticalityDemandRoiPolicySourceSafe: true,
      admissionAndIndexingPolicyPresent: true,
      retainedTerminalDebugCompatible: true,
    });
    expect(session.synthesis.schema).toBe('bitcode.deposit.asset-pack-option-synthesis');
    expect(session.synthesis.optionCount).toBe(3);
    expect(session.policy.schema).toBe('bitcode.deposit.asset-pack-option-policy-report');
    expect(session.policy.reviewablePositiveRoiCount).toBeGreaterThan(0);
    expect(session.policy.aggregatePolicy.compensationPolicy).toBe('future-reader-btc-source-to-shares-route-preview');
    expect(session.earningSupplyIntelligence.schema).toBe('bitcode.deposit.earning-supply-intelligence');
    expect(session.earningSupplyIntelligence.intelligence).toBe('DepositorEarningSupplyIntelligence');
    expect(session.organizationPolicyWalletAuthority.schema).toBe('bitcode.organization.policy-wallet-authority');
    expect(session.organizationPolicyWalletAuthority.route).toBe('/deposits');
    expect(session.earningSupplyIntelligence.aggregate.valueLabel).toBe('estimate');
    expect(session.earningSupplyIntelligence.earningStatements).toHaveLength(3);
    expect(session.earningSupplyIntelligence.supplyRecommendations).toHaveLength(3);
    expect(session.admission.schema).toBe('bitcode.deposit.asset-pack-option-admission-report');
    expect(session.admission.receipts.every((receipt) => receipt.admission.state === 'not-admitted-pending-review')).toBe(true);
    expect(session.synthesis.options[0].reviewBoundary.state).toBe('reviewable-source-safe-option');
    expect(session.disclosure).toMatchObject({
      sourceSafetyClass: 'source_safe_deposit_option_route_metadata',
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
    });
    expect(session.proofRoot).toMatch(/^deposit-route-session:/u);
    expect(assertDepositRouteSessionSourceSafe(session)).toEqual({
      admitted: true,
      reason: 'source_safe_deposit_option_route_metadata',
    });
  });

  it('keeps deposit submission blocked until option review is present', () => {
    const session = buildDepositRouteSession({
      depositStage: 'submit-deposit',
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourcePathHints: ['packages/pipelines/asset-pack/src/deposit-asset-pack-options.ts'],
      sourceCriticalitySignals: [{ id: 'warning', severity: 'warning', weight: 0.5 }],
      optionsRequested: true,
      hasReviewedOption: false,
    });

    expect(session.activeStepId).toBe('submit-deposit');
    expect(session.steps.find((step) => step.id === 'submit-deposit')?.blockers).toContain(
      'depositor option review required',
    );
    expect(session.steps.find((step) => step.id === 'read-depository-state')?.blockers).toContain(
      'submitted deposit required',
    );
    expect(assertDepositRouteSessionSourceSafe(session).admitted).toBe(true);
  });

  it('keeps critical or negative-value policy blocked before Gate 7 admission', () => {
    const session = buildDepositRouteSession({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourcePathHints: ['packages/pipelines/asset-pack/src/deposit-asset-pack-option-policy.ts'],
      sourceCriticalitySignals: [{ id: 'critical', severity: 'critical', weight: 1 }],
      developmentCostSats: 9000,
      expectedSettlementSats: 1000,
      optionsRequested: true,
    });

    expect(session.policy.blockedCount).toBe(3);
    expect(session.earningSupplyIntelligence.aggregate.blockedCriticalSourceCount).toBe(3);
    expect(
      session.earningSupplyIntelligence.supplyRecommendations.every(
        (recommendation) => recommendation.action === 'withhold-critical-source',
      ),
    ).toBe(true);
    expect(session.policy.evaluations.every((evaluation) => evaluation.policyDecision === 'blocked-before-admission')).toBe(true);
    expect(session.pipelineOwnership.admissionAndIndexingPolicyPresent).toBe(true);
    expect(session.organizationPolicyWalletAuthority.depositApproval.state).toBe('critical-source-blocked');
    expect(assertDepositRouteSessionSourceSafe(session).admitted).toBe(true);
  });

  it('projects source-safe depositor earnings and unfit Need opportunities', () => {
    const session = buildDepositRouteSession({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourcePathHints: ['uapi/app/deposits/DepositPageClient.tsx'],
      sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.9 }],
      unfitNeedOpportunitySignals: [
        {
          id: 'unfit-need-route-proof',
          label: 'Unfit Reads need route proof and source-safe delivery evidence.',
          weight: 0.84,
        },
      ],
      depositorWalletId: 'wallet-depositor-1',
      developmentCostSats: 1500,
      expectedSettlementSats: 6200,
      optionsRequested: true,
    });

    expect(session.earningSupplyIntelligence.likelyDemand.state).toBe('strong-demand-opportunity');
    expect(session.earningSupplyIntelligence.unfitNeedOpportunities.opportunityCount).toBe(1);
    expect(session.earningSupplyIntelligence.aggregate.totalExpectedCompensationSats).toBeGreaterThan(0);
    expect(session.earningSupplyIntelligence.aggregate.expectedCompensationRangeSats.priceAsset).toBe('BTC');
    expect(
      session.earningSupplyIntelligence.earningStatements.every(
        (statement) =>
          statement.valueLabel === 'estimate' &&
          statement.sourceToShares.allocationMethod === 'source-to-shares-largest-remainder',
      ),
    ).toBe(true);
    expect(session.earningSupplyIntelligence.disclosure.protectedSourceVisible).toBe(false);
    expect(session.earningSupplyIntelligence.disclosure.valueBearingMainnetAdmitted).toBe(false);
    expect(assertDepositRouteSessionSourceSafe(session).admitted).toBe(true);
  });

  it('admits approved policy-eligible deposit options into source-safe Depository projections', () => {
    const initial = buildDepositRouteSession({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourcePathHints: ['uapi/app/deposits/DepositPageClient.tsx'],
      sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.85 }],
      depositorWalletId: 'wallet-depositor-1',
      optionsRequested: true,
    });
    const approved = buildDepositRouteSession({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      sourcePathHints: ['uapi/app/deposits/DepositPageClient.tsx'],
      sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.85 }],
      depositorWalletId: 'wallet-depositor-1',
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      organizationPermissionGrants: [
        'deposit:synthesize_options',
        'deposit:approve_option',
        'deposit:submit',
      ],
      optionsRequested: true,
      optionReviewDecisions: [
        {
          optionId: initial.synthesis.options[0].optionId,
          decision: 'approved-for-admission',
          reviewerId: 'depositor-1',
        },
      ],
    });

    expect(approved.admission.approvedCount).toBe(1);
    expect(approved.admission.admittedCount).toBe(1);
    expect(approved.admission.receipts[0].admission.state).toBe('admitted-to-depository');
    expect(approved.admission.receipts[0].depositoryIndexProjection.state).toBe('indexed-for-finding-fits');
    expect(approved.admission.receipts[0].storageProjection.state).toBe('projected-to-object-storage');
    expect(approved.admission.receipts[0].packsActivitySync.state).toBe('synchronized-to-packs');
    expect(approved.organizationPolicyWalletAuthority.depositApproval.state).toBe('sub-critical-approved');
    expect(approved.organizationPolicyWalletAuthority.aggregate.state).toBe('allowed');
    expect(assertDepositRouteSessionSourceSafe(approved).admitted).toBe(true);
  });

  it('reads and writes the route-owned depositStage query parameter', () => {
    const params = new URLSearchParams('transactionId=deposit-run-2');
    const withStage = writeDepositRouteStage(params, 'submit-deposit');

    expect(withStage.get('depositStage')).toBe('submit-deposit');
    expect(readDepositRouteStage(withStage)).toBe('submit-deposit');
    expect(readDepositRouteStage(new URLSearchParams('depositStage=unsafe-stage'))).toBeNull();
    expect(writeDepositRouteStage(withStage, null).has('depositStage')).toBe(false);
  });
});
