import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VCSConnectionCard } from '../VCSConnectionCard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock VCSConnectionButton
jest.mock('../VCSConnectionButton', () => ({
  VCSConnectionButton: ({ provider, onConnectionChange }: any) => (
    <button 
      data-testid={`vcs-connection-button-${provider}`}
      onClick={() => onConnectionChange(true)}
    >
      Connect {provider}
    </button>
  )
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  GitCommit: () => <div data-testid="git-commit-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />
}));

describe('VCSConnectionCard', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  };

  const mockRouter = {
    refresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  describe('GitHub provider card', () => {
    test('renders disconnected state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('GitHub')).toBeInTheDocument();
        expect(screen.getByText('Connect your GitHub account to sync repositories')).toBeInTheDocument();
        expect(screen.getByTestId('vcs-connection-button-github')).toBeInTheDocument();
      });
    });

    test('renders connected state with details', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date('2024-01-01').toISOString(),
        metadata: {
          repoCount: 42,
          lastSync: new Date('2024-01-14').toISOString()
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('GitHub')).toBeInTheDocument();
        expect(screen.getByText('octocat')).toBeInTheDocument();
        expect(screen.getByText('42 repositories')).toBeInTheDocument();
        expect(screen.getByText(/Connected since/)).toBeInTheDocument();
        expect(screen.getByText(/Last synced/)).toBeInTheDocument();
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });
    });
  });

  describe('GitLab provider card', () => {
    test('renders with custom instance URL', async () => {
      const mockConnection = {
        id: 'connection-456',
        provider: 'gitlab',
        providerUsername: 'gitlab-user',
        instanceUrl: 'https://gitlab.company.com',
        createdAt: new Date('2024-01-01').toISOString()
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="gitlab" />);

      await waitFor(() => {
        expect(screen.getByText('GitLab')).toBeInTheDocument();
        expect(screen.getByText('gitlab.company.com')).toBeInTheDocument();
        expect(screen.getByText('gitlab-user')).toBeInTheDocument();
      });
    });

    test('renders without custom instance URL', async () => {
      const mockConnection = {
        id: 'connection-456',
        provider: 'gitlab',
        providerUsername: 'gitlab-user',
        createdAt: new Date('2024-01-01').toISOString()
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="gitlab" />);

      await waitFor(() => {
        expect(screen.getByText('GitLab')).toBeInTheDocument();
        expect(screen.queryByText('gitlab.company.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bitbucket provider card', () => {
    test('renders disconnected state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionCard provider="bitbucket" />);

      await waitFor(() => {
        expect(screen.getByText('Bitbucket')).toBeInTheDocument();
        expect(screen.getByText('Connect your Bitbucket account to sync repositories')).toBeInTheDocument();
      });
    });

    test('renders connected state', async () => {
      const mockConnection = {
        id: 'connection-789',
        provider: 'bitbucket',
        providerUsername: 'bitbucket-user',
        createdAt: new Date('2024-01-01').toISOString(),
        metadata: {
          repoCount: 10
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="bitbucket" />);

      await waitFor(() => {
        expect(screen.getByText('Bitbucket')).toBeInTheDocument();
        expect(screen.getByText('bitbucket-user')).toBeInTheDocument();
        expect(screen.getByText('10 repositories')).toBeInTheDocument();
      });
    });
  });

  describe('Connection state changes', () => {
    test('handles connection status change', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      const onConnectionChange = jest.fn();
      render(
        <VCSConnectionCard 
          provider="github" 
          onConnectionChange={onConnectionChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('vcs-connection-button-github')).toBeInTheDocument();
      });

      // Simulate connection
      fireEvent.click(screen.getByTestId('vcs-connection-button-github'));

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
        expect(onConnectionChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Date formatting', () => {
    test('formats recent dates correctly', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
        expect(screen.getByText(/30 minutes ago/)).toBeInTheDocument();
      });
    });

    test('formats old dates correctly', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date('2023-01-01').toISOString(),
        metadata: {
          lastSync: new Date('2023-12-01').toISOString()
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
        expect(screen.getByText(/Dec 1, 2023/)).toBeInTheDocument();
      });
    });
  });

  describe('Error states', () => {
    test('handles connection check error', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('GitHub')).toBeInTheDocument();
        // Should show disconnected state on error
        expect(screen.getByTestId('vcs-connection-button-github')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to check connection:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    test('shows error icon when connection has issues', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date('2024-01-01').toISOString(),
        metadata: {
          hasError: true,
          errorMessage: 'Token expired'
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Metadata display', () => {
    test('handles missing metadata gracefully', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date('2024-01-01').toISOString()
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('GitHub')).toBeInTheDocument();
        expect(screen.getByText('octocat')).toBeInTheDocument();
        // Should not show repo count if not in metadata
        expect(screen.queryByText(/repositories/)).not.toBeInTheDocument();
      });
    });

    test('displays zero repositories correctly', async () => {
      const mockConnection = {
        id: 'connection-123',
        provider: 'github',
        providerUsername: 'octocat',
        createdAt: new Date('2024-01-01').toISOString(),
        metadata: {
          repoCount: 0
        }
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockConnection,
        error: null
      });

      render(<VCSConnectionCard provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('0 repositories')).toBeInTheDocument();
      });
    });
  });
});
