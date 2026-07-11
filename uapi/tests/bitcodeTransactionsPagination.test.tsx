import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodeTransactionsPagination from '@/components/bitcode/pipeline/BitcodeTransactionsPagination';

describe('BitcodeTransactionsPagination', () => {
  it('reports the current range and emits next page plus page-size changes', () => {
    const onPaginationChange = jest.fn();

    render(
      <BitcodeTransactionsPagination
        pagination={{
          page: 2,
          pageSize: 10,
          totalRecords: 23,
          totalPages: 3,
          startRecord: 11,
          endRecord: 20,
        }}
        onPaginationChange={onPaginationChange}
      />,
    );

    expect(screen.getByText('Rows 11-20 of 23')).toBeTruthy();
    expect(screen.getByText('Page 2 of 3')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPaginationChange).toHaveBeenCalledWith({ page: 3, pageSize: 10 });

    fireEvent.change(screen.getByLabelText('Transaction page size'), { target: { value: '25' } });
    expect(onPaginationChange).toHaveBeenCalledWith({ page: 1, pageSize: 25 });
  });
});
