import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodeTransactionsDataTable from '@/components/base/bitcode/execution/BitcodeTransactionsDataTable';
import type { TransactionRecord } from '@/components/base/bitcode/execution/bitcode-transaction-types';

function buildRecord(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: 'run-branch-remediation',
    summary: 'Deposit option synthesis for engineeredsoftware/ENGI',
    type: 'agentic-execution:asset-pack',
    status: 'completed',
    participant: 'engineeredsoftware',
    repository: 'engineeredsoftware/ENGI',
    branch: 'main',
    proofStatus: 'depository proof ready',
    closureFocus: 'deposit posture',
    createdAt: '2026-07-06T10:00:00.000Z',
    isOwnTransaction: true,
    transactionLens: 'deposit',
    ...overrides,
  };
}

describe('BitcodeTransactionsDataTable — fully clickable rows', () => {
  it('selects the transaction when any cell in the row is clicked, not only the first', () => {
    const onSelectTransaction = jest.fn();
    render(
      <BitcodeTransactionsDataTable
        records={[buildRecord()]}
        selectedTransactionId={null}
        onSelectTransaction={onSelectTransaction}
        isLoading={false}
        error={null}
      />,
    );

    // Click a cell far from the legacy per-cell button (Repository column).
    fireEvent.click(screen.getByText('engineeredsoftware/ENGI'));
    expect(onSelectTransaction).toHaveBeenCalledWith('run-branch-remediation');
  });

  it('exposes the row as a keyboard-activatable button (Enter/Space select it)', () => {
    const onSelectTransaction = jest.fn();
    render(
      <BitcodeTransactionsDataTable
        records={[buildRecord()]}
        selectedTransactionId={null}
        onSelectTransaction={onSelectTransaction}
        isLoading={false}
        error={null}
      />,
    );

    const row = screen.getByRole('button', {
      name: /run-branch-remediation/,
    });
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onSelectTransaction).toHaveBeenCalledWith('run-branch-remediation');

    fireEvent.keyDown(row, { key: ' ' });
    expect(onSelectTransaction).toHaveBeenCalledTimes(2);
  });

  it('marks the selected row aria-pressed', () => {
    render(
      <BitcodeTransactionsDataTable
        records={[buildRecord({ id: 'selected-run' })]}
        selectedTransactionId="selected-run"
        onSelectTransaction={jest.fn()}
        isLoading={false}
        error={null}
      />,
    );

    expect(
      screen.getByRole('button', { name: /selected-run/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
