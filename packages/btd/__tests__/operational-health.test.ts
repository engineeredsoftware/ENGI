/**
 * Operational health — non-Terminal naming for deployment/telemetry readback.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  aggregateOperationalTelemetrySeverity,
  buildOperationalHealthRead,
} from '../src/operational-health';
import { buildTerminalOperationalHealthRead } from '../src/terminal-operational-health';
import { buildV27CryptoTelemetryRecord } from '../src/telemetry';

const issuedAt = 'operational-health-test';

describe('operational-health', () => {
  it('surfaces deployment lanes and blocks value-bearing mainnet without approval', () => {
    const read = buildOperationalHealthRead({ issuedAt });

    expect(read.lanes.map((lane) => lane.lane)).toEqual([
      'local',
      'regtest',
      'signet',
      'testnet',
      'mainnet-ready',
      'mainnet-value-bearing',
    ]);
    expect(read.lanes.find((lane) => lane.lane === 'mainnet-value-bearing')).toMatchObject({
      state: 'blocked',
      valueBearing: true,
      operationalApprovalRoot: null,
    });
  });

  it('aggregates telemetry severity for observer health', () => {
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
  });

  it('keeps Terminal-named shim equivalent to canonical builder', () => {
    const canonical = buildOperationalHealthRead({ issuedAt });
    const shim = buildTerminalOperationalHealthRead({ issuedAt });
    expect(shim.lanes.map((l) => l.lane)).toEqual(canonical.lanes.map((l) => l.lane));
  });
});
