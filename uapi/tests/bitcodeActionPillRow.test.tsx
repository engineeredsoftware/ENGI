import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodeActionPillRow from '@/components/bitcode/execution/BitcodeActionPillRow';

describe('BitcodeActionPillRow', () => {
  it('renders reusable action pills and dispatches clicks', () => {
    const onDefault = jest.fn();
    const onAccent = jest.fn();

    render(
      <BitcodeActionPillRow
        actions={[
          { label: 'Open verification', onClick: onDefault },
          { label: 'Open settlement', onClick: onAccent, tone: 'accent' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open verification' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open settlement' }));

    expect(onDefault).toHaveBeenCalled();
    expect(onAccent).toHaveBeenCalled();
  });
});
