import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';

import DemonstrationWitnessMount from '@/app/terminal/DemonstrationWitnessMount';

jest.mock('@/components/bitcode/layout/demonstration-witness-runtime', () => ({
  mountBitcodeDemonstrationShell: jest.fn(async () => jest.fn()),
}));

const { mountBitcodeDemonstrationShell } = jest.requireMock(
  '@/components/bitcode/layout/demonstration-witness-runtime',
) as {
  mountBitcodeDemonstrationShell: jest.Mock;
};

describe('DemonstrationWitnessMount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.head.innerHTML = '';
  });

  it('defaults to the scoped demonstration witness stylesheet so demo CSS cannot leak into the app page', async () => {
    const { unmount } = render(<DemonstrationWitnessMount />);

    await waitFor(() => expect(mountBitcodeDemonstrationShell).toHaveBeenCalledTimes(1));

    const stylesheet = document.getElementById('bitcode-demonstration-witness-stylesheet') as HTMLLinkElement | null;
    expect(stylesheet?.getAttribute('href')).toBe('/terminal/demonstration-witness-scoped-styles');

    unmount();
  });

  it('injects the requested stylesheet and mounts the built shell bundle', async () => {
    const cleanup = jest.fn();
    mountBitcodeDemonstrationShell.mockResolvedValueOnce(cleanup);

    const { unmount } = render(
      <DemonstrationWitnessMount
        className="test-demonstration-witness-host"
        stylesheetId="test-demonstration-witness-stylesheet"
        stylesheetHref="/terminal/demonstration-witness-scoped-styles"
      />,
    );

    await waitFor(() => expect(mountBitcodeDemonstrationShell).toHaveBeenCalledTimes(1));

    const stylesheet = document.getElementById('test-demonstration-witness-stylesheet') as HTMLLinkElement | null;
    expect(stylesheet).toBeTruthy();
    expect(stylesheet?.rel).toBe('stylesheet');
    expect(stylesheet?.getAttribute('href')).toBe('/terminal/demonstration-witness-scoped-styles');
    expect(document.getElementById('bitcodeDemonstrationRoot')).toHaveClass('test-demonstration-witness-host');
    expect(document.getElementById('bitcodeDemonstrationRoot')).toHaveAttribute(
      'data-bitcode-demonstration-witness-host',
      'mounted-demonstration-witness',
    );

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(document.getElementById('test-demonstration-witness-stylesheet')).toBeNull();
  });
});
