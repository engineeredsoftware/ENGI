import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import TerminalPreservedShellSurface from '@/app/terminal/TerminalPreservedShellSurface';

jest.mock('@/components/bitcode/layout/demonstration-witness-runtime', () => ({
  mountBitcodeDemonstrationShell: jest.fn(async () => jest.fn()),
  readBitcodeDemonstrationShellSnapshot: jest.fn(),
  readBitcodeDemonstrationShellControls: jest.fn(),
}));

const { mountBitcodeDemonstrationShell } = jest.requireMock(
  '@/components/bitcode/layout/demonstration-witness-runtime',
) as {
  mountBitcodeDemonstrationShell: jest.Mock;
};

describe('TerminalPreservedShellSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.head.innerHTML = '';
  });

  it('renders the lower-runtime drawer and mount-critical shell elements', async () => {
    render(<TerminalPreservedShellSurface />);

    expect(
      screen.getByRole('heading', {
        name: 'Open the proof and settlement witness only when deeper closure detail is required',
      }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Open proof and settlement witness' })).toBeTruthy();
    expect(document.getElementById('bitcodeDemonstrationRoot')).toBeTruthy();
    expect(document.getElementById('heroEyebrow')).toBeTruthy();
    expect(document.getElementById('flowGuideLayer')).toBeTruthy();
    await waitFor(() => expect(mountBitcodeDemonstrationShell).toHaveBeenCalledTimes(1));

    const stylesheet = document.getElementById('bitcode-demonstration-witness-stylesheet') as HTMLLinkElement | null;
    expect(stylesheet?.getAttribute('href')).toBe('/terminal/demonstration-witness-scoped-styles');
  });
});
