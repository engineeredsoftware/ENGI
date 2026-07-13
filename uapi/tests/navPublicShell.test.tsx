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
let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
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
  default: ({
    onClick,
    surface,
  }: {
    onClick: () => void;
    surface: string | null;
  }) => (
    <button type="button" onClick={onClick}>
      Brand {surface ?? 'null'}
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

describe('Nav public shell', () => {
  beforeEach(() => {
    mockPathname = '/';
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

  it('shows stable public-route links and guest workspace access actions', () => {
    render(<Nav />);

    const accessButton = screen.getByRole('button', { name: 'Open Auxillaries' });
    const createButton = screen.getByRole('button', { name: 'Connect Wallet' });

    expect(screen.getByText('Brand home')).toBeInTheDocument();
    // Product order: Read | Packs | Deposit (docs lives in logo-area NavBrand).
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute('href', '/packs');
    expect(screen.getByRole('link', { name: 'Packs' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Explain Packs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Deposit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Read' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Explain Docs' })).toBeNull();

    fireEvent.mouseEnter(accessButton);
    fireEvent.click(accessButton);
    fireEvent.click(createButton);

    expect(screen.queryByText('Use button')).toBeNull();
    expect(mockPrefetchOrbital).toHaveBeenCalledTimes(1);
    expect(mockOpenOrbital).toHaveBeenNthCalledWith(1, 'login');
    expect(mockOpenOrbital).toHaveBeenNthCalledWith(2, 'SignUpWindow');
  });

  it('waits for wallet readiness before showing public guest wallet actions', () => {
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

  it('keeps public-route links visible while preserving signed-in menu and notifications', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'operator@example.com',
      },
    });

    render(<Nav />);

    expect(screen.getByText('Brand home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));

    expect(mockOpenOrbital).toHaveBeenCalledWith('auxillaries', 'profile');
  });

  it('renders docs brand surface on docs routes without a main-nav Docs link', () => {
    mockPathname = '/docs';

    render(<Nav />);

    expect(screen.getByText('Brand docs')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
  });

  it('renders pack brand posture and active nav on pack routes', () => {
    mockPathname = '/packs';

    render(<Nav />);

    // Workspace surface wins over public "network" surface for /packs.
    expect(screen.getByText('Brand packs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute('href', '/packs');
    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders read brand posture and active nav on read routes', () => {
    mockPathname = '/reads';

    render(<Nav />);

    expect(screen.getByText('Brand read')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders deposit brand posture and active nav on deposit routes', () => {
    mockPathname = '/deposits';

    render(<Nav />);

    expect(screen.getByText('Brand deposit')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('href', '/deposits');
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute('aria-current', 'page');
  });

  it('treats /edgetimes as a docs-branded public route without main-nav Docs', () => {
    mockPathname = '/edgetimes';

    render(<Nav />);

    expect(screen.getByText('Brand docs')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
  });
});
