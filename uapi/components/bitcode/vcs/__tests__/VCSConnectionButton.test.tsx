import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VCSConnectionButton } from '../VCSConnectionButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Github: () => <div data-testid="github-icon" />,
  GitBranch: () => <div data-testid="git-branch-icon" />,
  Loader2: () => <div data-testid="loader-icon" />
}));

describe('VCSConnectionButton', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn()
    }
  };

  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock authenticated user by default
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  describe('Initial state', () => {
    test('shows loading state initially', () => {
      render(<VCSConnectionButton provider="github" />);
      
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('renders GitHub provider correctly', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // Not found
      });

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
        expect(screen.getByTestId('github-icon')).toBeInTheDocument();
      });
    });

    test('renders GitLab provider correctly', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="gitlab" />);

      await waitFor(() => {
        expect(screen.getByText('Connect GitLab')).toBeInTheDocument();
        expect(screen.getByTestId('git-branch-icon')).toBeInTheDocument();
      });
    });

    test('renders Bitbucket provider correctly', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="bitbucket" />);

      await waitFor(() => {
        expect(screen.getByText('Connect Bitbucket')).toBeInTheDocument();
      });
    });
  });

  describe('Connected state', () => {
    test('shows connected state with username', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'github',
          providerUsername: 'octocat'
        },
        error: null
      });

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('octocat')).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveClass('bg-emerald-100');
      });
    });

    test('shows connected state without username', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'gitlab'
        },
        error: null
      });

      render(<VCSConnectionButton provider="gitlab" />);

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });

    test('disconnects when clicked in connected state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'github',
          providerUsername: 'octocat'
        },
        error: null
      });

      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      const onConnectionChange = jest.fn();
      render(
        <VCSConnectionButton 
          provider="github" 
          onConnectionChange={onConnectionChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('octocat')).toBeInTheDocument();
      });

      // Click to disconnect
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockSupabase.delete).toHaveBeenCalled();
        expect(onConnectionChange).toHaveBeenCalledWith(false);
      });
    });

    test('handles disconnect error', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'github',
          providerUsername: 'octocat'
        },
        error: null
      });

      mockSupabase.delete.mockResolvedValueOnce({ 
        error: { message: 'Failed to disconnect' } 
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to disconnect GitHub:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('Disconnected state', () => {
    test('connects when clicked in disconnected state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button'));

      expect(mockRouter.push).toHaveBeenCalledWith('/api/vcs/github/oauth');
    });
  });

  describe('Size variants', () => {
    test('renders small size', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="github" size="sm" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-3 py-1.5 text-sm');
      });
    });

    test('renders medium size', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="github" size="md" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-4 py-2');
      });
    });

    test('renders large size', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSConnectionButton provider="github" size="lg" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-6 py-3 text-lg');
      });
    });
  });

  describe('Loading states', () => {
    test('shows loading state during connection check', () => {
      render(<VCSConnectionButton provider="github" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    test('shows loading state during disconnect', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'github',
          providerUsername: 'octocat'
        },
        error: null
      });

      // Delay the disconnect response
      mockSupabase.delete.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    test('handles connection check error gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to check connection:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    test('handles unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<VCSConnectionButton provider="github" />);

      await waitFor(() => {
        expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
      });

      // Button should still be rendered but clicking won't check connection
      fireEvent.click(screen.getByRole('button'));
      
      // Should still navigate to OAuth
      expect(mockRouter.push).toHaveBeenCalledWith('/api/vcs/github/oauth');
    });
  });

  describe('Callback integration', () => {
    test('calls onConnectionChange when connection status changes', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      const onConnectionChange = jest.fn();

      render(
        <VCSConnectionButton 
          provider="github" 
          onConnectionChange={onConnectionChange}
        />
      );

      await waitFor(() => {
        expect(onConnectionChange).toHaveBeenCalledWith(false);
      });

      // Simulate connection
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'connection-123',
          provider: 'github'
        },
        error: null
      });

      // Force re-check (would normally happen via polling or event)
      fireEvent.click(screen.getByRole('button'));

      // Since we're in disconnected state, this would navigate to OAuth
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });
});
