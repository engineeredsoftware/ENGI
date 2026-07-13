import {
  assertReadRouteSessionSourceSafe,
  buildReadFitMeasurementReview,
  buildReadProcurementGovernance,
  buildReadRouteSession,
  buildReadSettlementRightsDelivery,
  readReadRouteStage,
  writeReadRouteStage,
} from '@/components/reads/models/read-route-model';

describe('read-route-model', () => {
  it('builds a source-safe five-step ReadRouteSession', () => {
    const session = buildReadRouteSession({
      transactionId: 'read-run-1',
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: true,
      hasSourceSafePreview: true,
    });

    expect(session.schema).toBe('bitcode.read.route-session');
    expect(session.route).toBe('/reads');
    expect(session.stageCount).toBe(5);
    expect(session.steps.map((step) => step.id)).toEqual([
      'request-read',
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ]);
    expect(session.pipelineOwnership.readNeedPipeline).toBe('ReadNeedComprehensionSynthesis');
    expect(session.pipelineOwnership.findingFitsPipeline).toBe('ReadFitsFindingSynthesis');
    expect(session.pipelineOwnership.acceptedNeedRequiredBeforeFindingFits).toBe(true);
    expect(session.pipelineOwnership.previewSourceSafeBeforeSettlement).toBe(true);
    expect(session.pipelineOwnership.deliveryRequiresPaidReadRights).toBe(true);
    expect(session.procurementGovernance.schema).toBe('bitcode.read.procurement-governance');
    expect(session.organizationPolicyWalletAuthority.schema).toBe('bitcode.organization.policy-wallet-authority');
    expect(session.organizationPolicyWalletAuthority.route).toBe('/reads');
    expect(session.procurementGovernance.quotePolicy.pricingVersion).toBe('measurement-weight-volume');
    expect(session.procurementGovernance.quotePolicy.shareToFee.deterministic).toBe(true);
    expect(session.disclosure.protectedSourceVisible).toBe(false);
    expect(session.disclosure.unpaidAssetPackSourceVisible).toBe(false);
    expect(session.disclosure.rawPromptVisible).toBe(false);
    expect(session.disclosure.interpolatedPromptVisible).toBe(false);
    expect(session.disclosure.rawProviderResponseVisible).toBe(false);
    expect(session.proofRoot).toMatch(/^read-route-session:/u);
    expect(assertReadRouteSessionSourceSafe(session)).toEqual({
      admitted: true,
      reason: 'source_safe_read_route_metadata',
    });
  });

  it('projects approved Reading quote readiness without exposing source-bearing payloads', () => {
    const session = buildReadRouteSession({
      transactionId: 'read-run-quote-approved',
      repositoryFullName: 'engineeredsoftware/ENGI',
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: true,
      hasSourceSafePreview: true,
      measuredBtd: 120,
      budgetEnvelopeSats: 50_000,
      approvalThresholdSats: 10_000,
      quoteSats: 12_500,
      procurementApproved: true,
      buyerAuthorized: true,
      walletAuthorityPresent: true,
      walletId: 'wallet-reader',
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      organizationPermissionGrants: ['reading:request', 'settlement:pay_btc_fee'],
    });

    expect(session.procurementGovernance.budgetPolicy.state).toBe('within-budget');
    expect(session.procurementGovernance.budgetPolicy.approvalRequired).toBe(true);
    expect(session.procurementGovernance.quotePolicy.state).toBe('approved');
    expect(session.procurementGovernance.settlement.readiness).toBe('ready-for-testnet-settlement');
    expect(session.procurementGovernance.settlement.btcBtdSettlementReady).toBe(true);
    expect(
      session.organizationPolicyWalletAuthority.actionStatements.find((entry) => entry.action === 'pay_btc_fee')?.allowed,
    ).toBe(true);
    expect(session.organizationPolicyWalletAuthority.aggregate.state).toBe('allowed');
    expect(session.procurementGovernance.prePurchaseReview.protectedSourceVisible).toBe(false);
    expect(session.procurementGovernance.prePurchaseReview.unpaidAssetPackSourceVisible).toBe(false);
    expect(assertReadRouteSessionSourceSafe(session).admitted).toBe(true);
  });

  it('blocks settlement readiness when approval or budget policy is not satisfied', () => {
    const approvalRequired = buildReadProcurementGovernance({
      hasSourceSafePreview: true,
      measuredBtd: 120,
      budgetEnvelopeSats: 50_000,
      approvalThresholdSats: 10_000,
      quoteSats: 12_500,
      buyerAuthorized: true,
      walletAuthorityPresent: true,
    });
    const budgetExceeded = buildReadProcurementGovernance({
      hasSourceSafePreview: true,
      measuredBtd: 120,
      budgetEnvelopeSats: 5_000,
      approvalThresholdSats: 4_000,
      quoteSats: 12_500,
      procurementApproved: true,
      buyerAuthorized: true,
      walletAuthorityPresent: true,
    });
    const expiredQuote = buildReadProcurementGovernance({
      hasSourceSafePreview: true,
      measuredBtd: 120,
      budgetEnvelopeSats: 50_000,
      approvalThresholdSats: 40_000,
      quoteSats: 12_500,
      quoteIssuedAt: '2026-05-29T10:00:00.000Z',
      quoteExpiresAt: '2026-05-29T10:30:00.000Z',
      quoteObservedAt: '2026-05-29T10:31:00.000Z',
      buyerAuthorized: true,
      walletAuthorityPresent: true,
    });

    expect(approvalRequired.budgetPolicy.state).toBe('approval-required');
    expect(approvalRequired.settlement.readiness).toBe('awaiting-approval');
    expect(approvalRequired.settlement.blockers).toContain('procurement approval required');
    expect(budgetExceeded.budgetPolicy.state).toBe('exceeded');
    expect(budgetExceeded.quotePolicy.state).toBe('blocked');
    expect(budgetExceeded.settlement.readiness).toBe('blocked-budget');
    expect(expiredQuote.quotePolicy.state).toBe('expired');
    expect(expiredQuote.settlement.readiness).toBe('blocked-expired-quote');
  });

  it('keeps Finding Fits blocked until a synthesized Need is accepted', () => {
    const session = buildReadRouteSession({
      routeReadingStage: 'request-fit',
      repositoryFullName: 'engineeredsoftware/ENGI',
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: false,
    });

    expect(session.activeStepId).toBe('request-fit');
    expect(session.readObjects.acceptedNeedPresent).toBe(false);
    expect(session.steps.find((step) => step.id === 'request-fit')?.blockers).toContain('accepted Need required');
    expect(session.steps.find((step) => step.id === 'review-synthesized-asset-pack')?.blockers).toContain(
      'accepted Need required',
    );
    expect(assertReadRouteSessionSourceSafe(session).admitted).toBe(true);
  });

  it('renders Need-relative fit measurement review whose contributions decide the quote basis', () => {
    const session = buildReadRouteSession({
      transactionId: 'read-run-measured',
      repositoryFullName: 'engineeredsoftware/ENGI',
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: true,
      hasSourceSafePreview: true,
      measuredBtd: 120,
      selectedFitIds: ['fit-depository-1', 'fit-depository-2'],
    });
    const review = session.fitMeasurementReview;

    expect(review.schema).toBe('bitcode.read.fit-measurement-review');
    expect(review.visible).toBe(true);
    expect(review.measurements.map((row) => row.visualizationId)).toEqual([
      'need-coverage',
      'fit-confidence',
      'specificity',
      'novelty',
      'reuse',
      'risk',
      'evidence',
      'delivery-readiness',
    ]);
    expect(review.measurements.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 5);
    expect(
      review.measurements.reduce((sum, row) => sum + row.normalizedContribution, 0),
    ).toBeCloseTo(review.btdScalarVolume, 2);
    expect(review.btdScalarVolume).toBe(120);
    expect(review.quoteBasis.network).toBe('btc-testnet');
    expect(review.quoteBasis.feeAsset).toBe('BTC');
    expect(review.quoteBasis.grossSats).toBe(
      session.procurementGovernance.quotePolicy.shareToFee.grossSats,
    );
    expect(review.selectedFitProvenance.fitIds).toEqual(['fit-depository-1', 'fit-depository-2']);
    expect(review.selectedFitProvenance.depositoryAssetPackCount).toBe(2);
    expect(review.repairBlockers).toEqual([]);
    expect(assertReadRouteSessionSourceSafe(session).admitted).toBe(true);

    const hiddenReview = buildReadFitMeasurementReview({ hasAcceptedNeed: false });
    expect(hiddenReview.visible).toBe(false);
    expect(hiddenReview.btdScalarVolume).toBe(0);
    expect(hiddenReview.repairBlockers).toContain(
      'accepted Need required before Fit measurement review',
    );
  });

  it('fails closed through payment observation, finality, BTD rights, and delivery ordering', () => {
    const observedOnly = buildReadSettlementRightsDelivery({
      transactionId: 'read-run-settling',
      hasSettlementReadback: true,
    });
    expect(observedOnly.paymentObservation.state).toBe('btc-testnet-payment-observed');
    expect(observedOnly.finality.state).toBe('awaiting-finality');
    expect(observedOnly.btdRights.state).toBe('rights-pending');
    expect(observedOnly.delivery.state).toBe('delivery-locked');
    expect(observedOnly.blockers).toContain('BTC-testnet finality confirmation required');

    const delivered = buildReadSettlementRightsDelivery({
      transactionId: 'read-run-delivered',
      repositoryFullName: 'engineeredsoftware/ENGI',
      hasSettlementReadback: true,
      hasDeliveryReadback: true,
      deliveryPullRequestReference: 'engineeredsoftware/ENGI#412',
    });
    expect(delivered.finality.state).toBe('btc-testnet-finality-confirmed');
    expect(delivered.btdRights.state).toBe('btd-rights-transferred');
    expect(delivered.delivery.state).toBe('repository-pr-delivery-materialized');
    expect(delivered.delivery.pullRequestReference).toBe('engineeredsoftware/ENGI#412');
    expect(delivered.blockers).toEqual([]);
    expect(delivered.network).toBe('btc-testnet');
    expect(delivered.valueBearingMainnetEnabled).toBe(false);

    const skippedChain = buildReadSettlementRightsDelivery({
      transactionId: 'read-run-skip',
      deliveryMaterialized: true,
      rightsTransferred: true,
      finalityConfirmed: true,
    });
    expect(skippedChain.paymentObservation.state).toBe('awaiting-payment');
    expect(skippedChain.finality.state).toBe('awaiting-finality');
    expect(skippedChain.btdRights.state).toBe('rights-pending');
    expect(skippedChain.delivery.state).toBe('delivery-locked');

    const deliveredSession = buildReadRouteSession({
      transactionId: 'read-run-delivered',
      repositoryFullName: 'engineeredsoftware/ENGI',
      hasRepositorySource: true,
      hasReadMeasurement: true,
      hasSynthesizedNeed: true,
      hasAcceptedNeed: true,
      hasSourceSafePreview: true,
      hasSettlementReadback: true,
      hasDeliveryReadback: true,
      measuredBtd: 80,
    });
    expect(deliveredSession.readObjects.deliveryUnlocked).toBe(true);
    expect(deliveredSession.settlementRightsDelivery.delivery.state).toBe(
      'repository-pr-delivery-materialized',
    );
    expect(assertReadRouteSessionSourceSafe(deliveredSession).admitted).toBe(true);
  });

  it('reads and writes the route-owned readingStage query parameter', () => {
    const params = new URLSearchParams('transactionId=read-run-2');
    const withStage = writeReadRouteStage(params, 'review-synthesized-asset-pack');

    expect(withStage.get('readingStage')).toBe('review-synthesized-asset-pack');
    expect(readReadRouteStage(withStage)).toBe('review-synthesized-asset-pack');
    expect(readReadRouteStage(new URLSearchParams('readingStage=unsafe-stage'))).toBeNull();
    expect(writeReadRouteStage(withStage, null).has('readingStage')).toBe(false);
  });
});
