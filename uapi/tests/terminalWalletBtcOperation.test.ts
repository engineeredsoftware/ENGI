import { buildTerminalWalletBtcOperationProjection } from '@/app/terminal/terminal-wallet-btc-operation';
import type { TerminalRunDetailSnapshot } from '@/app/terminal/terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

const selectedRun: WorkspaceRun = {
  id: 'tx-wallet-btc-1',
  created_at: '2026-05-20T12:00:00.000Z',
  type: 'agentic-execution:asset-pack',
  status: 'completed',
  summary: 'AssetPack preview ready for BTC fee settlement.',
  sourceModel: 'execution-history',
};

function detailWithBtcFee(finalityState = 'confirmed'): TerminalRunDetailSnapshot {
  return {
    summary: 'Settlement readback.',
    shippables: null,
    repoSnapshot: null,
    processingStats: {
      time: null,
      tokenTotal: null,
      measuredBtd: null,
      btcFeeUsdEquivalent: null,
      averageLatencyMs: null,
    },
    proofStatus: null,
    closureFocus: null,
    closureFollowThrough: null,
    closureState: null,
    ledgerSettlement: {
      status: 'settled',
      settlementAdmissible: true,
      reason: null,
      assetPackId: 'asset-pack-1',
      btdRange: null,
      ledgerAnchorId: 'anchor-1',
      btcFeeReceiptId: 'btc-fee-1',
      depositorWalletId: 'wallet-depositor',
      readerWalletId: 'wallet-reader',
      btcFee: {
        receiptId: 'btc-fee-1',
        finalityState,
        network: 'testnet',
        satsPaid: '1200',
        confirmations: 2,
        txid: 'txid-1',
        psbt: 'signed-psbt',
        walletSessionId: 'wallet-session-1',
        payerWalletId: 'wallet-reader',
        serverCustody: false,
        operationPosture: {
          phase: finalityState,
          noServerCustody: true,
          nextAction: 'Continue to BTD rights transfer and delivery unlock.',
          quote: {
            quoteId: 'quote-1',
            quoteRoot: 'btc-fee-quote-root',
            sats: '1200',
          },
          signerRecovery: {
            state: 'live_authorized',
            walletSessionId: 'wallet-session-1',
            walletId: 'wallet-reader',
          },
        },
      },
      ownershipBoundary: null,
      readback: {},
      journalEntryIds: [],
      ownershipEventId: 'ownership-1',
      readLicenseId: 'license-1',
    },
    terminalJournal: null,
    organizationAuthority: null,
    bitcodeActivityState: null,
    historyItemCount: 0,
    eventCount: 0,
  };
}

describe('Terminal wallet/BTC operation projection', () => {
  it('projects confirmed BTC fee settlement as unlock-ready without exposing private custody', () => {
    const projection = buildTerminalWalletBtcOperationProjection({
      selectedRun,
      detail: detailWithBtcFee(),
    });

    expect(projection).toMatchObject({
      state: 'confirmed',
      canSettle: true,
      blockers: [],
    });
    expect(projection.metrics).toEqual(
      expect.arrayContaining([
        { label: 'BTC state', value: 'confirmed' },
        { label: 'Sats', value: '1200' },
      ]),
    );
    expect(projection.rows).toEqual(
      expect.arrayContaining([
        { label: 'Wallet session', value: 'wallet-session-1' },
        { label: 'Server custody', value: 'none' },
      ]),
    );
  });

  it('surfaces replacement and missing quote readiness as blocked operational detail', () => {
    const projection = buildTerminalWalletBtcOperationProjection({
      selectedRun,
      detail: {
        ...detailWithBtcFee('replaced'),
        ledgerSettlement: {
          ...detailWithBtcFee('replaced').ledgerSettlement!,
          btcFee: {
            ...detailWithBtcFee('replaced').ledgerSettlement!.btcFee!,
            operationPosture: {
              phase: 'replaced',
              blockedReadiness: {
                summary: 'Replacement transaction must be reconciled.',
              },
            },
          },
        },
      },
    });

    expect(projection.state).toBe('replaced');
    expect(projection.canSettle).toBe(false);
    expect(projection.blockers).toEqual(
      expect.arrayContaining([
        'Replacement transaction must be reconciled.',
        'Replacement transaction must be reconciled before unlock.',
      ]),
    );

    const missing = buildTerminalWalletBtcOperationProjection({
      selectedRun,
      detail: null,
    });
    expect(missing).toMatchObject({
      state: 'not_prepared',
      canSettle: false,
    });
    expect(missing.blockers[0]).toContain('Wallet signer session');
  });
});
