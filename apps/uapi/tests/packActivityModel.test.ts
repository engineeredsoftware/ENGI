import {
  assertPackActivitySourceSafe,
  buildPackActivityDetailProjection,
  buildPackPortfolioMarketIntelligence,
  normalizePackActivityRecord,
  queryPackActivityRecords,
} from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import type { BitcodeActivityRecord } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';

describe('pack-activity-model', () => {
  const baseRecord: BitcodeActivityRecord = {
    id: 'pack-activity-1',
    kind: 'execution',
    scope: 'network',
    channel: 'system-surface',
    label: 'Executions',
    title: 'ReadFitsFindingSynthesis preview',
    summary: 'Synthesized a source-safe AssetPack preview for accepted Need.',
    timestamp: '2026-05-28T10:00:00.000Z',
    state: 'completed',
    read: null,
    payload: {
      type: 'pipeline:read-fits',
      repo_snapshot: {
        org: 'engineeredsoftware',
        repo: 'ENGI',
      },
      assetPackTitle: 'Auth rollback proof pack',
      measuredBtd: 42,
      btcFeeSats: 3200,
      finalityState: 'quote_ready',
      compensationState: 'source_to_shares_preview_ready',
      deliveryState: 'locked_until_settlement',
      repairState: 'not_required',
      btdBtcCompensationStatements: {
        schema: 'bitcode.asset-pack.btd-btc-compensation-statements',
        statements: 'BtdBtcCompensationStatements',
        state: 'settlement-accounted',
        btdRange: {
          rangeState: 'transferred-to-reader',
        },
        btcSettlement: {
          state: 'final-settlement-observed',
        },
        treasuryRoutes: [
          {
            schema: 'bitcode.asset-pack.treasury-route-statement',
            routeState: 'routed',
          },
        ],
        reconciliation: {
          state: 'aligned',
        },
        aggregate: {
          contributorCount: 2,
          depositorCount: 2,
          finalSettlementSats: 3200,
          allocatedContributorSats: 3200,
        },
        roots: {
          accountingRoot: 'btd-btc-accounting-root-abc',
        },
      },
      organizationPolicyWalletAuthority: {
        schema: 'bitcode.organization.policy-wallet-authority',
        statement: 'OrganizationPolicyWalletAuthority',
        route: '/reads',
        walletAuthority: {
          state: 'verified',
        },
        budgetApproval: {
          state: 'within-limit',
        },
        depositApproval: {
          state: 'not-applicable',
        },
        aggregate: {
          state: 'allowed',
          requiredDeniedActionCount: 0,
          blockerCount: 0,
        },
        roots: {
          authorityRoot: 'organization-authority-root-abc',
        },
      },
      assetPackMeasurementRoot: 'measurement-root-abc',
      quoteRoot: 'quote-root-abc',
      settlementReceiptRoot: 'settlement-root-def',
      protectedSource: 'protected source body',
      rawPrompt: 'raw prompt text',
      interpolatedPrompt: 'interpolated prompt text',
      rawProviderResponse: 'raw provider response',
      sourceSnippet: 'source snippet',
      patch: 'diff --git a/protected b/protected',
    },
  };

  it('normalizes source-safe PackActivity records with measurements, values, and proof roots', () => {
    const record = normalizePackActivityRecord(baseRecord);

    expect(record).toMatchObject({
      id: 'pack-activity-1',
      type: 'read-need-fit-preview',
      repository: 'engineeredsoftware/ENGI',
      assetPackTitle: 'Auth rollback proof pack',
      settlementState: 'quote_ready',
      compensationState: 'source_to_shares_preview_ready',
      deliveryState: 'locked_until_settlement',
    });
    expect(record.commodityState).toMatchObject({
      assetPackState: 'need-fit-assetpack-quoted',
      btdState: 'btd-quote-bound',
      btcState: 'btc-quote-issued',
      disclosureBoundary: 'after-quote',
      repairRequired: false,
    });
    expect(record.measurements.some((measurement) => measurement.id === 'measured-btd')).toBe(true);
    expect(record.values.some((value) => value.id === 'btc-fee')).toBe(true);
    expect(record.proofRoots.map((proofRoot) => proofRoot.root)).toContain('settlement-root-def');
    expect(record.accounting).toMatchObject({
      state: 'settlement-accounted',
      btdRangeState: 'transferred-to-reader',
      btcSettlementState: 'final-settlement-observed',
      treasuryRouteState: 'routed',
      contributorCount: 2,
      allocatedContributorSats: 3200,
      statementRoot: 'btd-btc-accounting-root-abc',
    });
    expect(record.governance).toMatchObject({
      state: 'allowed',
      route: '/reads',
      walletState: 'verified',
      spendState: 'within-limit',
      authorityRoot: 'organization-authority-root-abc',
    });
    expect(assertPackActivitySourceSafe(record)).toBe(true);
    expect(JSON.stringify(record)).not.toContain('protected source body');
    expect(JSON.stringify(record)).not.toContain('raw prompt text');
    expect(JSON.stringify(record)).not.toContain('raw provider response');
  });

  it('searches, filters, sorts, and projects source-safe detail', () => {
    const records = [
      normalizePackActivityRecord(baseRecord),
      normalizePackActivityRecord({
        ...baseRecord,
        id: 'pack-activity-2',
        title: 'Deposit option repair',
        summary: 'Repair state opened for a deposit AssetPack option.',
        timestamp: '2026-05-28T09:00:00.000Z',
        state: 'running',
        payload: {
          type: 'deposit option synthesis',
          assetPackTitle: 'Vector index cleanup pack',
          repairState: 'open_reconciliation',
          sourceToSharesRoot: 'source-shares-root-xyz',
        },
      }),
    ];

    const result = queryPackActivityRecords(records, {
      search: 'rollback',
      filters: { type: 'read-need-fit-preview' },
      sort: { key: 'value', direction: 'desc' },
    });

    expect(result.records.map((record) => record.id)).toEqual(['pack-activity-1']);
    expect(result.summary.total).toBe(1);

    const detail = buildPackActivityDetailProjection(result.records[0]);
    expect(detail.states.settlement).toBe('quote_ready');
    expect(detail.states.rights).toBeNull();
    expect(detail.commodityState.assetPackState).toBe('need-fit-assetpack-quoted');
    expect(detail.commodityState.sourceSafety.protectedSourceVisible).toBe(false);
    expect(detail.accounting?.statementRoot).toBe('btd-btc-accounting-root-abc');
    expect(detail.governance?.authorityRoot).toBe('organization-authority-root-abc');
    expect(detail.proofRoots.length).toBeGreaterThan(0);
    expect(assertPackActivitySourceSafe(detail)).toBe(true);
  });

  it('tracks BTD rights transfer state from explicit fields and commodity-state readback', () => {
    const explicitRights = normalizePackActivityRecord({
      ...baseRecord,
      id: 'pack-activity-rights-explicit',
      payload: {
        ...(baseRecord.payload as Record<string, unknown>),
        rightsState: 'btd-rights-transferred',
      },
    });
    expect(explicitRights.rightsState).toBe('btd-rights-transferred');
    expect(buildPackActivityDetailProjection(explicitRights).states.rights).toBe(
      'btd-rights-transferred',
    );

    const commodityRights = normalizePackActivityRecord({
      ...baseRecord,
      id: 'pack-activity-rights-commodity',
      payload: {
        ...(baseRecord.payload as Record<string, unknown>),
        btdState: 'btd-rights-transferred',
        btcState: 'btc-finality-confirmed',
      },
    });
    expect(commodityRights.commodityState.btdState).toBe('btd-rights-transferred');
    expect(commodityRights.rightsState).toBe('btd-rights-transferred');
  });

  it('projects approved deposit admission receipts as Depository AssetPack activity', () => {
    const record = normalizePackActivityRecord({
      ...baseRecord,
      id: 'pack-activity-deposit-admission',
      title: 'Pipeline execution',
      summary: 'Admitted Repository capability AssetPack option to the Depository.',
      state: 'completed',
      payload: {
        type: 'pipeline:deposit-option-admission',
        assetPackTitle: 'Repository capability AssetPack option',
        optionCount: 3,
        admittedCount: 1,
        admissionState: 'admitted-to-depository',
        compensationState: 'compensation-preview-ready',
        packActivitySyncState: 'synchronized-to-packs',
        admissionReportRoot: 'deposit-admission-report-root',
        protectedSource: 'protected source body',
        rawProviderResponse: 'raw provider response',
      },
    });

    expect(record.type).toBe('depository-assetpack');
    expect(record.assetPackTitle).toBe('Repository capability AssetPack option');
    expect(record.measurements.some((measurement) => measurement.id === 'admitted-count')).toBe(true);
    expect(record.compensationState).toBe('compensation-preview-ready');
    expect(record.proofRoots.map((proofRoot) => proofRoot.root)).toContain('deposit-admission-report-root');
    expect(assertPackActivitySourceSafe(record)).toBe(true);
    expect(JSON.stringify(record)).not.toContain('protected source body');
    expect(JSON.stringify(record)).not.toContain('raw provider response');
  });

  it('fails malformed Pack commodity state closed into source-safe repair activity', () => {
    const record = normalizePackActivityRecord({
      ...baseRecord,
      id: 'pack-activity-unsafe-collapse',
      payload: {
        type: 'pipeline:read-fits',
        assetPackTitle: 'Unsafe source unlock observation',
        sourceAvailable: true,
        protectedSource: 'protected source body',
      },
    });

    expect(record.commodityState).toMatchObject({
      assetPackState: 'repair-required',
      btdState: 'btd-repair-required',
      btcState: 'btc-settlement-repair-required',
      disclosureBoundary: 'after-repository-delivery',
      repairRequired: true,
    });
    expect(record.repairState).toBe('repair-required');
    expect(record.commodityState.blockers).toEqual(
      expect.arrayContaining([
        'source_unlock_without_btd_rights_transfer',
        'rights_or_delivery_without_btc_finality',
      ]),
    );
    expect(assertPackActivitySourceSafe(record)).toBe(true);
    expect(JSON.stringify(record)).not.toContain('protected source body');
  });

  it('projects SettleAssetPack executions as settled-assetpack with nested measurements and PR delivery', () => {
    const settleRecord = normalizePackActivityRecord({
      id: 'settle-run-1',
      kind: 'execution',
      scope: 'network',
      channel: 'system-surface',
      label: 'Executions',
      title: 'AssetPack execution',
      summary: 'Settled AssetPack: Auth rollback proof pack. SettleAssetPack completed.',
      timestamp: '2026-07-14T12:00:00.000Z',
      state: 'completed',
      read: null,
      payload: {
        type: 'agentic-execution:asset-pack',
        status: 'completed',
        context: {
          source: 'read-settle-asset-pack',
          packActivityType: 'settled-assetpack',
          activityType: 'settled-assetpack',
          repositoryFullName: 'engineeredsoftware/ENGI',
          optionCount: 1,
          settlementState: 'settled',
          rightsState: 'btd-rights-projected',
          deliveryState: 'opened',
          deliveryReference: 'https://github.com/engineeredsoftware/ENGI/pull/42',
          prUrl: 'https://github.com/engineeredsoftware/ENGI/pull/42',
          assetPackTitle: 'Auth rollback proof pack',
        },
        output: {
          productPipeline: 'settle-asset-pack-pipeline',
          summary: 'Settled AssetPack: Auth rollback proof pack. SettleAssetPack completed.',
          assetPackTitle: 'Auth rollback proof pack',
          optionCount: 1,
          settlementState: 'settled',
          rightsState: 'btd-rights-projected',
          deliveryState: 'opened',
          prUrl: 'https://github.com/engineeredsoftware/ENGI/pull/42',
          amountSats: 4500,
          measurements: [
            {
              kind: 'functions',
              category: 'absolute',
              volume: 0.42,
              magnitude: 12,
              unit: 'functions',
              weight: 0.18,
            },
            {
              kind: 'language-fit',
              category: 'neediness',
              volume: 0.88,
              magnitude: null,
              unit: null,
              weight: 0.25,
            },
            {
              kind: 'need-fit',
              category: 'neediness',
              volume: 0.81,
              magnitude: null,
              unit: null,
              weight: null,
            },
          ],
          packActivity: {
            schema: 'bitcode.packs.activity',
            packActivityType: 'settled-assetpack',
            prUrl: 'https://github.com/engineeredsoftware/ENGI/pull/42',
          },
          // Must be redacted if present
          protectedSource: 'protected source body',
          patch: 'diff --git a/secret b/secret',
        },
      },
    });

    expect(settleRecord.type).toBe('settled-assetpack');
    expect(settleRecord.repository).toBe('engineeredsoftware/ENGI');
    expect(settleRecord.assetPackTitle).toBe('Auth rollback proof pack');
    expect(settleRecord.title).toContain('Auth rollback proof pack');
    expect(settleRecord.settlementState).toBe('settled');
    expect(settleRecord.rightsState).toBe('btd-rights-projected');
    expect(settleRecord.deliveryState).toBe('opened');
    expect(settleRecord.deliveryReference).toBe(
      'https://github.com/engineeredsoftware/ENGI/pull/42',
    );
    expect(settleRecord.measurements.some((m) => m.id === 'absolute:functions')).toBe(true);
    expect(settleRecord.measurements.some((m) => m.id === 'neediness:language-fit')).toBe(true);
    expect(settleRecord.measurements.some((m) => m.id === 'neediness:need-fit')).toBe(true);
    expect(settleRecord.values.some((v) => v.id === 'settlement-price' && v.amount === 4500)).toBe(
      true,
    );
    expect(assertPackActivitySourceSafe(settleRecord)).toBe(true);
    expect(JSON.stringify(settleRecord)).not.toContain('protected source body');
    expect(JSON.stringify(settleRecord)).not.toContain('diff --git');

    const detail = buildPackActivityDetailProjection(settleRecord);
    expect(detail.deliveryReference).toBe(
      'https://github.com/engineeredsoftware/ENGI/pull/42',
    );
    expect(detail.states.delivery).toBe('opened');
    expect(detail.states.settlement).toBe('settled');
    expect(detail.measurements.length).toBeGreaterThanOrEqual(3);
  });

  it('infers settled-assetpack from summary word-gap form without explicit type', () => {
    const record = normalizePackActivityRecord({
      id: 'settle-summary-only',
      kind: 'execution',
      scope: 'network',
      channel: 'system-surface',
      label: 'Executions',
      title: 'AssetPack execution',
      summary: 'Settled 2 AssetPack option(s)',
      timestamp: '2026-07-14T12:00:00.000Z',
      state: 'completed',
      read: null,
      payload: {
        type: 'agentic-execution:asset-pack',
        context: { source: 'read-settle-asset-pack' },
        optionCount: 2,
      },
    });
    expect(record.type).toBe('settled-assetpack');
  });

  it('supports My AssetPacks ownership filters: bought, deposited unsettled, deposited settled', () => {
    const bought = normalizePackActivityRecord({
      id: 'mine-bought',
      kind: 'execution',
      scope: 'network',
      channel: 'system-surface',
      label: 'Executions',
      title: 'Settled AssetPack',
      summary: 'Settled AssetPack: Buyer pack',
      timestamp: '2026-07-14T12:00:00.000Z',
      state: 'completed',
      read: null,
      payload: {
        context: {
          source: 'read-settle-asset-pack',
          packActivityType: 'settled-assetpack',
          settlementState: 'settled',
        },
        packActivityType: 'settled-assetpack',
      },
    });
    const depositedUnsettled = normalizePackActivityRecord({
      id: 'mine-deposit-open',
      kind: 'execution',
      scope: 'network',
      channel: 'system-surface',
      label: 'Executions',
      title: 'Depository AssetPack',
      summary: 'Admitted to the Depository',
      timestamp: '2026-07-14T11:00:00.000Z',
      state: 'completed',
      read: null,
      payload: {
        context: {
          source: 'deposit-option-review-admission',
          admissionState: 'admitted-to-depository',
          packActivityType: 'depository-assetpack',
          settlementState: 'awaiting_buyer',
        },
        packActivityType: 'depository-assetpack',
      },
    });
    const depositedSettled = normalizePackActivityRecord({
      id: 'mine-deposit-sold',
      kind: 'execution',
      scope: 'network',
      channel: 'system-surface',
      label: 'Executions',
      title: 'Depository AssetPack sold',
      summary: 'Depository AssetPack with settlement finality',
      timestamp: '2026-07-14T10:00:00.000Z',
      state: 'completed',
      read: null,
      payload: {
        context: {
          source: 'deposit-option-review-admission',
          admissionState: 'admitted-to-depository',
          packActivityType: 'depository-assetpack',
          settlementState: 'settled',
          rightsState: 'btd-rights-transferred',
        },
        packActivityType: 'depository-assetpack',
      },
    });
    const previewNoise = normalizePackActivityRecord(baseRecord);
    const records = [bought, depositedUnsettled, depositedSettled, previewNoise];

    expect(
      queryPackActivityRecords(records, { filters: { type: 'my-assetpacks' } }).records.map(
        (row) => row.id,
      ),
    ).toEqual(['mine-bought', 'mine-deposit-open', 'mine-deposit-sold']);

    expect(
      queryPackActivityRecords(records, {
        filters: { type: 'my-read-bought' },
      }).records.map((row) => row.id),
    ).toEqual(['mine-bought']);

    expect(
      queryPackActivityRecords(records, {
        filters: { type: 'my-deposited-unsettled' },
      }).records.map((row) => row.id),
    ).toEqual(['mine-deposit-open']);

    expect(
      queryPackActivityRecords(records, {
        filters: { type: 'my-deposited-settled' },
      }).records.map((row) => row.id),
    ).toEqual(['mine-deposit-sold']);
  });

  it('builds source-safe portfolio positions, saved filters, market signals, and facets', () => {
    const records = [
      normalizePackActivityRecord(baseRecord),
      normalizePackActivityRecord({
        ...baseRecord,
        id: 'pack-activity-supply',
        title: 'Deposit option admitted',
        summary: 'Supply opportunity admitted to the Depository.',
        state: 'completed',
        payload: {
          type: 'pipeline:deposit-option-admission',
          assetPackTitle: 'Auth rollback proof pack',
          repositoryFullName: 'engineeredsoftware/ENGI',
          admittedCount: 1,
          compensationState: 'allocation_ready',
          settlementState: 'quote_ready',
          deliveryState: 'locked_until_settlement',
          sourceToSharesRoot: 'source-to-shares-root',
          protectedSource: 'protected source body',
        },
      }),
      normalizePackActivityRecord({
        ...baseRecord,
        id: 'pack-activity-unfit',
        title: 'No worthy fit found',
        summary: 'Unfit Need signal preserved for future supply opportunity.',
        state: 'completed',
        payload: {
          type: 'pipeline:read-fits',
          assetPackTitle: 'Latency repair opportunity',
          repositoryFullName: 'engineeredsoftware/ENGI',
          fitResult: 'no_worthy_fit',
          repairState: 'open_reconciliation',
          unfitNeedRoot: 'unfit-need-root',
          rawPrompt: 'raw prompt text',
        },
      }),
    ];

    const market = buildPackPortfolioMarketIntelligence(records);

    expect(market.positions.length).toBeGreaterThanOrEqual(2);
    expect(market.positions[0].sourceSafety.sourceSafeMetadataOnly).toBe(true);
    expect(market.savedFilters.map((filter) => filter.id)).toEqual(
      expect.arrayContaining(['market-demand', 'market-supply', 'economic-settlement']),
    );
    expect(market.signals.map((signal) => signal.kind)).toEqual(
      expect.arrayContaining(['demand', 'supply', 'unfit-need', 'settlement', 'compensation']),
    );
    expect(market.facets.settlement.quote_ready).toBeGreaterThanOrEqual(1);
    expect(market.facets.compensation.allocation_ready).toBe(1);
    expect(JSON.stringify(market)).not.toContain('protected source body');
    expect(JSON.stringify(market)).not.toContain('raw prompt text');
  });
});
