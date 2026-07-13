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
  BTDTracker: () => <div>BTD</div>,
}));

jest.mock('@/components/bitcode/notifications/NotificationsWidget/NotificationsWidget', () => ({
  NotificationsWidget: () => <div>Notifications</div>,
}));

jest.mock('@/components/bitcode/layout/UserMenu/UserMenu', () => ({
  UserMenu: ({
    onOpenAuxillaries,
  }: {
    onOpenAuxillaries: () => void;
  }) => (
    <button type="button" onClick={onOpenAuxillaries}>
      User menu
    </button>
  ),
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

  it('shows product-route links and guest access actions for unauthenticated product routes', () => {
    render(<Nav />);

    const accessButton = screen.getByRole('button', { name: 'Open Auxillaries' });
    const createButton = screen.getByRole('button', { name: 'Connect Wallet' });

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute('href', '/packs');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    fireEvent.mouseEnter(accessButton);
    fireEvent.click(accessButton);
    fireEvent.click(createButton);

    expect(screen.queryByText('Use button')).toBeNull();
    expect(mockPrefetchOrbital).toHaveBeenCalledTimes(1);
    expect(mockOpenOrbital).toHaveBeenNthCalledWith(1, 'login');
    expect(mockOpenOrbital).toHaveBeenNthCalledWith(2, 'SignUpWindow');
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

  it('keeps product-route links visible while reopening auxillaries from the signed-in menu', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'operator@example.com',
      },
    });

    render(<Nav />);

    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute('href', '/packs');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open Auxillaries' })).toBeNull();
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));

    expect(mockOpenOrbital).toHaveBeenCalledWith('auxillaries', 'profile');
  });
});
