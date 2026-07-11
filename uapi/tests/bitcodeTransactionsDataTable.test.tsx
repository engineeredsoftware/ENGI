import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import BitcodeTransactionsDataTable from '@/components/bitcode/pipeline/BitcodeTransactionsDataTable/BitcodeTransactionsDataTable';
import type { TransactionRecord } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

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

// PathPill / ExecutionContextPillRow pull explainers that are fine in jsdom;
// only the hover fetch needs a stub.
const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

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

  it('on failed status hover loads the event tail and shows error + last call chain', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        run: {
          id: 'failed-run',
          summary: 'Run failed — host killed mid-pipeline',
          error: { message: 'Run failed — host killed mid-pipeline' },
        },
        events: [
          {
            created_at: '2026-07-09T03:00:00.000Z',
            event: {
              type: 'generation',
              executionState: {
                phase: 'discovery',
                agent: 'DepositCodebaseComprehensionAgent',
                step: 'refine',
                failsafe: 'chunk_then_sum',
                generation: 'structured_output',
              },
            },
          },
        ],
      }),
    });

    render(
      <BitcodeTransactionsDataTable
        records={[
          buildRecord({
            id: 'failed-run',
            status: 'failed',
            errorMessage: 'Run failed — host killed mid-pipeline',
          }),
        ]}
        selectedTransactionId={null}
        onSelectTransaction={jest.fn()}
        isLoading={false}
        error={null}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId('transaction-status-hover'));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/executions/history/failed-run?tail=24',
      ),
    );
    expect(
      await screen.findByTestId('transaction-status-failure-error'),
    ).toHaveTextContent('Run failed — host killed mid-pipeline');
    expect(
      screen.getByTestId('transaction-status-failure-lines'),
    ).toBeInTheDocument();
  });
});
