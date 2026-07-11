import { buildPacksHref, buildTerminalHref } from '@/components/bitcode/routes/product-routes';
import {
  writeTerminalTransactionDetailSection,
  writeTerminalTransactionId,
} from '@/components/bitcode/pipeline/models/pipeline-selection-query';
import { buildTerminalTransactionReadModel } from '@/app/terminal/terminal-transaction-read-model';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

const selectedRun: WorkspaceRun = {
  id: 'tx-exchange-handoff',
  created_at: '2026-05-20T12:00:00.000Z',
  type: 'agentic-execution:asset-pack',
  status: 'completed',
  summary: 'AssetPack preview ready for Exchange review.',
  repository: 'engineeredsoftware/ENGI',
  branch: 'main',
  sourceModel: 'execution-history',
  participant: 'engineeredsoftware',
  isOwnTransaction: true,
  transactionLens: 'closure',
  itemCount: 4,
  tokenTotal: 3200,
  measuredBtd: 64,
  btcFeeUsdEquivalent: 7.25,
  proofStatus: 'source-safe exchange preview',
  closureFocus: 'rights and settlement review',
};

describe('Packs and Terminal transaction handoff', () => {
  it('builds Packs links that preserve transaction, detail, filters, and unknown context', () => {
    const baseParams = new URLSearchParams(
      'transactionId=old-run&transactionDetail=history&provider=github&repo=engineeredsoftware%2FENGI&transactionSearch=AssetPack&transactionOwnership=network',
    );
    const nextParams = writeTerminalTransactionDetailSection(
      writeTerminalTransactionId(baseParams, selectedRun.id),
      'journal',
    );

    const packsHref = buildPacksHref(nextParams);
    const terminalHref = buildTerminalHref(nextParams);

    expect(packsHref).toContain('/packs?');
    expect(packsHref).toContain('transactionId=tx-exchange-handoff');
    expect(packsHref).toContain('transactionDetail=journal');
    expect(packsHref).toContain('provider=github');
    expect(packsHref).toContain('repo=engineeredsoftware%2FENGI');
    expect(packsHref).toContain('transactionSearch=AssetPack');
    expect(packsHref).toContain('transactionOwnership=network');
    expect(terminalHref).toContain('/packs?');
    expect(terminalHref).toContain('transactionId=tx-exchange-handoff');
  });

  it('adds a source-safe Packs handoff to the transaction read model', () => {
    const model = buildTerminalTransactionReadModel({
      selectedRun,
      detail: null,
      detailSection: 'proofs',
      dataMode: 'live',
      searchParams: new URLSearchParams(
        'runId=legacy-run&provider=github&repo=engineeredsoftware%2FENGI&transactionSearch=settlement',
      ),
    });

    expect(model.route.href).toContain('/packs?');
    expect(model.route.exchangeHref).toContain('/packs?');
    expect(model.route.exchangeHref).toContain('transactionId=tx-exchange-handoff');
    expect(model.route.exchangeHref).toContain('transactionDetail=proofs');
    expect(model.route.exchangeHref).toContain('provider=github');
    expect(model.route.exchangeHref).toContain('repo=engineeredsoftware%2FENGI');
    expect(model.route.exchangeHref).toContain('transactionSearch=settlement');
    expect(model.route.exchangeHref).not.toContain('runId=legacy-run');
  });
});
