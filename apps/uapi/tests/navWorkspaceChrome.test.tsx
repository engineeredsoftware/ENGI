/* eslint-disable react/no-multi-comp */

import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import Nav from '@/components/bitcode/layout/Nav/Nav';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockOpenOrbital = jest.fn();
const mockPrefetchOrbital = jest.fn();
const mockUseAuth = jest.fn();
const mockUseUserData = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/reads',
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: () => mockUseUserData(),
}));

jest.mock('@/components/auxillaries/AuxillariesProvider/AuxillariesProvider', () => ({
  openAuxillaries: (...args: unknown[]) => mockOpenOrbital(...args),
  prefetchAuxillaries: () => mockPrefetchOrbital(),
}));

jest.mock('@/config/features', () => ({
  FEATURE_FLAGS: {
    HIDE_BTD_TRACKER: false,
    NOTIFICATIONS: true,
    DISABLE_USING: true,
  },
}));

jest.mock('@/components/bitcode/layout/NavBrand/NavBrand', () => ({
  __esModule: true,
  default: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Brand
    </button>
  ),
}));

jest.mock('@/components/bitcode/btd/BtdTracker/BtdTracker', () => ({
  BTDTracker: ({
    onOpenBtdAuxillary,
  }: {
    onOpenBtdAuxillary?: () => void;
  }) => (
    <button
      type="button"
      aria-label="0 BTD; 0 APs. Open BTD wallet auxillary."
      onClick={() => onOpenBtdAuxillary?.()}
    >
      BTD
    </button>
  ),
}));

jest.mock('@/components/bitcode/notifications/NotificationsWidget/NotificationsWidget', () => ({
  NotificationsWidget: () => <div>Notifications</div>,
}));

jest.mock('@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper', () => ({
  DisabledTooltipWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/bitcode/nav/AuxillariesUseButton/AuxillariesUseButton', () => ({
  AuxillariesUseButton: () => <div>Use button</div>,
}));

describe('Nav product chrome', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockOpenOrbital.mockReset();
    mockPrefetchOrbital.mockReset();
    mockUseAuth.mockReturnValue({ user: null });
    mockUseUserData.mockReturnValue({
      data: {},
      hasWalletConnection: false,
      walletConnectionStatus: null,
      btdBalance: 0,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      isLoading: false,
      isRevalidating: false,
    });
  });

  it('shows product-route links and guest Connect Wallet only for unauthenticated product routes', () => {
    render(<Nav />);

    const createButton = screen.getByRole('button', { name: 'Connect Wallet' });

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Exchange' })).toHaveAttribute('href', '/exchange');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open Auxillaries' })).toBeNull();
    fireEvent.mouseEnter(createButton);
    fireEvent.click(createButton);

    expect(screen.queryByText('Use button')).toBeNull();
    expect(mockPrefetchOrbital).toHaveBeenCalledTimes(1);
    expect(mockOpenOrbital).toHaveBeenCalledWith('AuxillariesWindow');
  });

  it('shows wallet readiness loading instead of Connect Wallet before user data settles', () => {
    mockUseUserData.mockReturnValue({
      data: null,
      hasWalletConnection: false,
      walletConnectionStatus: null,
      btdBalance: 0,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      isLoading: true,
      isRevalidating: false,
    });

    render(<Nav />);

    expect(screen.getByTestId('nav-wallet-readiness-loading')).toHaveTextContent('Reading wallet');
    expect(screen.queryByRole('button', { name: 'Connect Wallet' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open Auxillaries' })).toBeNull();
  });

  it('keeps product-route links visible; wallet opens Auxillaries (no right-side account menu)', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'operator@example.com',
      },
    });

    render(<Nav />);

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Exchange' })).toHaveAttribute('href', '/exchange');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open Auxillaries' })).toBeNull();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'User menu' })).toBeNull();

    fireEvent.click(screen.getByLabelText(/Open BTD wallet auxillary/i));

    expect(mockOpenOrbital).toHaveBeenCalledWith('auxillaries', 'wallet');
  });
});
