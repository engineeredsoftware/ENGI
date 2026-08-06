import {
  ASSET_PACK_LIFECYCLE_STATES,
  BTD_SCALAR_VOLUME_STATES,
  BTC_SETTLEMENT_STATES,
  assertAssetPackCommodityStateProjection,
  buildAssetPackCommodityStateProjection,
  projectAssetPackCommodityStateForPayload,
  toSourceSafeAssetPackCommodityStateDisplay,
  type AssetPackCommodityStateInput,
  type AssetPackLifecycleState,
  type BtcSettlementState,
  type BtdScalarVolumeState,
} from '../asset-pack-commodity-state';

describe('AssetPack commodity state vocabulary', () => {
  const assetPackInputs: Record<AssetPackLifecycleState, AssetPackCommodityStateInput> = {
    'deposit-option-synthesized': {},
    'deposit-option-reviewed': { depositOptionReviewed: true },
    'depository-assetpack-admitted': { depositoryAssetPackAdmitted: true },
    'fit-candidates-recalled': { fitCandidatesRecalled: true },
    'fit-set-selected': { selectedFitAssetIds: ['fit-deposit-1'] },
    'need-fit-assetpack-synthesized': { needFitAssetPackSynthesized: true },
    'need-fit-assetpack-quoted': { quoteIssued: true },
    'settlement-observed': { quoteIssued: true, settlementObserved: true, btc: { paymentObserved: true } },
    'btd-settled-rights-transferred': {
      quoteIssued: true,
      settlementObserved: true,
      rightsTransferred: true,
      btd: { rightsTransferred: true },
      btc: { finalityConfirmed: true },
    },
    'source-unlocked-delivery': {
      quoteIssued: true,
      settlementObserved: true,
      rightsTransferred: true,
      sourceUnlockedDelivery: true,
      btd: { rightsTransferred: true },
      btc: { finalityConfirmed: true, settlementFinalized: true },
    },
    'compensated-and-reconciled': {
      quoteIssued: true,
      settlementObserved: true,
      rightsTransferred: true,
      sourceUnlockedDelivery: true,
      compensatedAndReconciled: true,
      btd: { rightsTransferred: true, sourceToSharesAllocated: true },
      btc: { finalityConfirmed: true, settlementFinalized: true, contributorCompensationRoutable: true },
    },
    'repair-required': { repairRequired: true },
  };

  const btdInputs: Record<BtdScalarVolumeState, AssetPackCommodityStateInput> = {
    'btd-not-applicable': {},
    'btd-potential-measured': { btd: { potentialMeasured: true } },
    'need-fit-measurements-admitted': { btd: { measurementsAdmitted: true } },
    'measurement-weight-policy-locked': { btd: { weightPolicyLocked: true } },
    'weighted-scalar-volume-computed': { btd: { weightedScalarVolumeComputed: true } },
    'btd-quantized': { btd: { quantized: true } },
    'measuremint-applied': { btd: { measuremintApplied: true } },
    'btd-range-assigned': { btd: { rangeAssigned: true } },
    'btd-quote-bound': { btd: { quoteBound: true } },
    'btd-rights-pending': { btd: { rightsPending: true } },
    'btd-rights-transferred': {
      rightsTransferred: true,
      btd: { rightsTransferred: true },
      btc: { finalityConfirmed: true },
    },
    'btd-source-to-shares-allocated': {
      rightsTransferred: true,
      sourceUnlockedDelivery: true,
      compensatedAndReconciled: true,
      btd: { rightsTransferred: true, sourceToSharesAllocated: true },
      btc: { finalityConfirmed: true, settlementFinalized: true, contributorCompensationRoutable: true },
    },
    'btd-repair-required': { btd: { repairRequired: true } },
  };

  const btcInputs: Record<BtcSettlementState, AssetPackCommodityStateInput> = {
    'btc-not-quoteable': {},
    'btc-quote-issued': { btc: { quoteIssued: true } },
    'btc-quote-accepted': { btc: { quoteAccepted: true } },
    'btc-quote-inactive': { btc: { quoteInactive: true } },
    'btc-wallet-ready': { btc: { walletReady: true } },
    'btc-psbt-prepared': { btc: { psbtPrepared: true } },
    'btc-psbt-signed': { btc: { psbtSigned: true } },
    'btc-broadcast-submitted': { btc: { broadcastSubmitted: true } },
    'btc-payment-observed': { btc: { paymentObserved: true } },
    'btc-payment-mismatch-repair-required': { btc: { paymentMismatchRepairRequired: true } },
    'btc-finality-confirmed': { settlementObserved: true, btc: { finalityConfirmed: true } },
    'btc-replaced-reorged-or-failed': { btc: { replacedReorgedOrFailed: true } },
    'btc-settlement-finalized': {
      rightsTransferred: true,
      sourceUnlockedDelivery: true,
      btd: { rightsTransferred: true },
      btc: { finalityConfirmed: true, settlementFinalized: true },
    },
    'btc-contributor-compensation-routable': {
      rightsTransferred: true,
      sourceUnlockedDelivery: true,
      compensatedAndReconciled: true,
      btd: { rightsTransferred: true, sourceToSharesAllocated: true },
      btc: { finalityConfirmed: true, settlementFinalized: true, contributorCompensationRoutable: true },
    },
    'btc-refund-or-escalation-required': { btc: { refundOrEscalationRequired: true } },
    'btc-settlement-repair-required': { btc: { repairRequired: true } },
  };

  it('declares the exact current AssetPack, BTD, and BTC state sets', () => {
    expect(ASSET_PACK_LIFECYCLE_STATES).toHaveLength(12);
    expect(BTD_SCALAR_VOLUME_STATES).toHaveLength(13);
    expect(BTC_SETTLEMENT_STATES).toHaveLength(16);
    expect(ASSET_PACK_LIFECYCLE_STATES).toContain('need-fit-assetpack-quoted');
    expect(BTD_SCALAR_VOLUME_STATES).toContain('weighted-scalar-volume-computed');
    expect(BTC_SETTLEMENT_STATES).toContain('btc-psbt-signed');
  });

  it.each(Object.entries(assetPackInputs))('projects AssetPack lifecycle state %s', (state, input) => {
    const projection = buildAssetPackCommodityStateProjection(input);
    expect(projection.states.assetPack).toBe(state);
    expect(assertAssetPackCommodityStateProjection(projection)).toBe(projection);
  });

  it.each(Object.entries(btdInputs))('projects BTD scalar-volume state %s', (state, input) => {
    const projection = buildAssetPackCommodityStateProjection(input);
    expect(projection.states.btd).toBe(state);
    expect(assertAssetPackCommodityStateProjection(projection)).toBe(projection);
  });

  it.each(Object.entries(btcInputs))('projects BTC settlement state %s', (state, input) => {
    const projection = buildAssetPackCommodityStateProjection(input);
    expect(projection.states.btc).toBe(state);
    expect(assertAssetPackCommodityStateProjection(projection)).toBe(projection);
  });

  it('builds source-safe display projection from Pack activity payloads', () => {
    const projection = projectAssetPackCommodityStateForPayload({
      type: 'pipeline:read-fits',
      assetPackLifecycleState: 'need-fit-assetpack-quoted',
      btdScalarVolumeState: 'btd-quote-bound',
      quoteRoot: 'quote-root-abc',
      measurementRoot: 'measurement-root-abc',
      protectedSource: 'protected source body',
    });
    const display = toSourceSafeAssetPackCommodityStateDisplay(projection);

    expect(display).toMatchObject({
      schema: 'bitcode.asset-pack.commodity-state-display',
      assetPackState: 'need-fit-assetpack-quoted',
      btdState: 'btd-quote-bound',
      btcState: 'btc-quote-issued',
      disclosureBoundary: 'after-quote',
      repairRequired: false,
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
      },
    });
    expect(JSON.stringify(display)).not.toContain('protected source body');
  });

  it('rejects source unlock before BTC finality and BTD rights transfer', () => {
    const projection = buildAssetPackCommodityStateProjection({ sourceUnlockedDelivery: true });

    expect(projection.blockers).toEqual(
      expect.arrayContaining([
        'source_unlock_without_btd_rights_transfer',
        'rights_or_delivery_without_btc_finality',
      ]),
    );
    expect(() => assertAssetPackCommodityStateProjection(projection)).toThrow(/source_unlock_without_btd_rights_transfer/);
  });

  it('rejects collapsed quote/payment and observation/finality projections', () => {
    const payment = buildAssetPackCommodityStateProjection({ btc: { paymentObserved: true } });
    const paymentCollapsedWithFinality = {
      ...payment,
      states: { ...payment.states, btc: 'btc-payment-observed' as const },
      evidence: { ...payment.evidence, finalityConfirmed: true },
      blockers: [],
    };
    const quoteCollapsedWithPayment = {
      ...payment,
      states: { ...payment.states, btc: 'btc-quote-issued' as const },
      blockers: [],
    };

    expect(() => assertAssetPackCommodityStateProjection(paymentCollapsedWithFinality)).toThrow(
      /btc_payment_observation_collapsed_with_finality/,
    );
    expect(() => assertAssetPackCommodityStateProjection(quoteCollapsedWithPayment)).toThrow(
      /btc_quote_collapsed_with_payment_observation/,
    );
  });

  it('rejects collapsed AssetPack quote, settlement observation, and source visibility projections', () => {
    const payment = buildAssetPackCommodityStateProjection({ btc: { paymentObserved: true } });
    const assetPackQuoteCollapsedWithObservation = {
      ...payment,
      states: { ...payment.states, assetPack: 'need-fit-assetpack-quoted' as const },
      blockers: [],
    };
    const settlementObservationCollapsedWithRightsTransfer = {
      ...payment,
      states: { ...payment.states, assetPack: 'settlement-observed' as const },
      evidence: { ...payment.evidence, finalityConfirmed: true, rightsTransferred: true },
      blockers: [],
    };
    const sourceVisibleBeforeSettlement = buildAssetPackCommodityStateProjection({
      sourceSafety: { protectedSourceVisible: true },
    });

    expect(() => assertAssetPackCommodityStateProjection(assetPackQuoteCollapsedWithObservation)).toThrow(
      /assetpack_quote_collapsed_with_settlement_observation/,
    );
    expect(() => assertAssetPackCommodityStateProjection(settlementObservationCollapsedWithRightsTransfer)).toThrow(
      /settlement_observation_collapsed_with_rights_transfer/,
    );
    expect(sourceVisibleBeforeSettlement.blockers).toContain('protected_source_visibility_before_settlement');
    expect(() => assertAssetPackCommodityStateProjection(sourceVisibleBeforeSettlement)).toThrow(/not source-safe/);
  });
});
