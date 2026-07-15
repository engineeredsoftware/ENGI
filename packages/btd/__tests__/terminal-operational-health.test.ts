import {
  aggregateOperationalTelemetrySeverity,
  buildOperationalHealthRead,
} from '../src/operational-health';
import { buildV27CryptoTelemetryRecord } from '../src/telemetry';

const issuedAt = 'terminal-operational-health-test';

describe('product operational health read', () => {
  it('surfaces all deployment lanes and blocks value-bearing mainnet without approval root', () => {
    const read = buildOperationalHealthRead({ issuedAt });

    expect(read.lanes.map((lane) => lane.lane)).toEqual([
      'local',
      'regtest',
      'signet',
      'testnet',
      'mainnet-ready',
      'mainnet-value-bearing',
    ]);
    expect(read.lanes.find((lane) => lane.lane === 'testnet')).toMatchObject({
      label: 'Public testnet',
      state: 'ready',
      bitcoinNetwork: 'testnet',
    });
    expect(read.lanes.find((lane) => lane.lane === 'mainnet-value-bearing')).toMatchObject({
      state: 'blocked',
      valueBearing: true,
      operationalApprovalRoot: null,
      missingEnvironmentKeys: ['BITCODE_OPERATIONAL_APPROVAL_ROOT'],
      readinessReceipt: null,
    });
  });

  it('admits value-bearing mainnet only when an operational approval root is present', () => {
    const read = buildOperationalHealthRead({
      issuedAt,
      operationalApprovalRoots: {
        'mainnet-value-bearing': 'approval-root',
      },
    });
    const mainnetValueLane = read.lanes.find((lane) => lane.lane === 'mainnet-value-bearing');

    expect(mainnetValueLane).toMatchObject({
      state: 'ready',
      operationalApprovalRoot: 'approval-root',
      valueBearing: true,
    });
    expect(mainnetValueLane?.readinessReceipt?.mainnetValueBearingBlocked).toBe(false);
  });

  it('aggregates telemetry into broadcaster and observer health', () => {
    const telemetryRecords = [
      buildV27CryptoTelemetryRecord({
        event: 'btc_fee.broadcast_rejected',
        subjectId: 'fee-1',
        issuedAt,
      }),
      buildV27CryptoTelemetryRecord({
        event: 'ledger_provider.disagreement',
        subjectId: 'anchor-1',
        issuedAt,
      }),
    ];
    const read = buildOperationalHealthRead({ issuedAt, telemetryRecords });

    expect(aggregateOperationalTelemetrySeverity(telemetryRecords)).toBe('critical');
    expect(read.telemetry.severity).toBe('critical');
    expect(read.broadcaster).toMatchObject({
      state: 'review',
      severity: 'warning',
    });
    expect(read.observer).toMatchObject({
      state: 'blocked',
      severity: 'critical',
    });
  });

  it('keeps upgrade, rollback, migration, and generated type refresh visible', () => {
    const read = buildOperationalHealthRead({
      issuedAt,
      rollbackPlanRoot: 'rollback-root',
      generatedTypeRefreshState: 'current',
    });

    expect(read.upgrade).toMatchObject({
      state: 'planned',
      migrationRoot: 'operational-migration-root',
      rollbackPlanRoot: 'rollback-root',
      approvalReceiptRoot: 'operational-approval-root',
      generatedTypeRefresh: {
        state: 'current',
        source: 'packages/orm/src/types/database.generated.ts',
      },
    });
    expect(read.upgrade.receipt.kind).toBe('btd.protocol_upgrade');
  });

  it('declares GitHub as the active VCS path and leaves broader providers future-scoped', () => {
    const read = buildOperationalHealthRead({ issuedAt });

    expect(read.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provider: 'github', state: 'ready' }),
        expect.objectContaining({ provider: 'gitlab', state: 'future' }),
        expect.objectContaining({ provider: 'bitbucket', state: 'future' }),
        expect.objectContaining({ provider: 'generic-git', state: 'future' }),
      ]),
    );
  });

  it('uses Bitcoin Taproot/PSBT as first-class and keeps Binance-family pilots disabled', () => {
    const read = buildOperationalHealthRead({ issuedAt });

    expect(read.settlementNetworks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'bitcoin-taproot-psbt', state: 'ready' }),
        expect.objectContaining({ id: 'bsc', state: 'disabled' }),
        expect.objectContaining({ id: 'opbnb', state: 'disabled' }),
        expect.objectContaining({ id: 'binance-web3-wallet', state: 'disabled' }),
      ]),
    );
  });

  it('builds a synthetic testnet minting readback that can be ledger/database diffed', () => {
    const read = buildOperationalHealthRead({ issuedAt });

    expect(read.testnetMinting.measurementReceipt.kind).toBe('btd.measure_mint');
    expect(read.testnetMinting.measurementReceipt.tokenCount).toBe(1);
    expect(read.testnetMinting.mintReceipt.kind).toBe('btd.asset_pack_mint');
    expect(read.testnetMinting.assetPackRange.tokenCount).toBe(1);
    expect(read.testnetMinting.ledgerAnchor).toMatchObject({
      chain: 'bitcoin',
      network: 'signet',
      commitmentMethod: 'taproot',
      finalityState: 'prepared',
    });
    // Canonical field names (journalRows); product-era terminalJournalRows removed.
    expect(read.testnetMinting.journalRows.map((row) => row.transactionKind)).toEqual([
      'asset_pack_mint',
      'asset_pack_anchor',
    ]);
    expect(read.testnetMinting.journalDiff.blocking).toBe(false);
    expect(read.testnetMinting.ledgerDatabaseReconciliation.blocking).toBe(false);
    expect(read.testnetMinting.ledgerObservedFacts).toEqual(read.testnetMinting.databaseProjectedFacts.map((fact) => ({
      factId: fact.factId,
      ledgerRoot: fact.projectedLedgerRoot,
      finalityState: fact.projectedFinalityState,
    })));
  });
});
