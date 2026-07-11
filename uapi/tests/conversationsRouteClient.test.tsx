import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const mockPush = jest.fn();
const mockOverlayClose = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/app/conversations/components/ConversationsOverlay', () => ({
  __esModule: true,
  default: ({
    forceOpen,
    forceFullscreen,
    onCloseRequest,
    showFloatingOrb,
  }: {
    forceOpen?: boolean;
    forceFullscreen?: boolean;
    onCloseRequest?: () => void;
    showFloatingOrb?: boolean;
  }) => {
    mockOverlayClose.mockImplementation(() => onCloseRequest?.());
    return (
      <div>
        <div>
          Overlay forceOpen={String(forceOpen)} forceFullscreen={String(forceFullscreen)} floatingOrb=
          {String(showFloatingOrb)}
        </div>
        <button onClick={() => onCloseRequest?.()}>Close overlay</button>
      </div>
    );
  },
}));

import ConversationsRouteClient from '@/app/conversations/ConversationsRouteClient';

describe('ConversationsRouteClient', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockOverlayClose.mockReset();
  });

  it('renders first-class terminal-mode copy and returns closed flow to the Bitcode activity ledger', () => {
    render(<ConversationsRouteClient />);

    expect(screen.getByText('Conversations fullscreen')).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        name: /Keep the Bitcode Terminal write path as a first-class Terminal interface mode\./i,
      }),
    ).toBeTruthy();
    expect(screen.getByText(/Step back into the Bitcode activity ledger/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Open Packs/i })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(
      screen.getByText(/Overlay forceOpen=true forceFullscreen=true floatingOrb=false/i),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close overlay' }));

    expect(mockPush).toHaveBeenCalledWith('/packs');
  });
});
