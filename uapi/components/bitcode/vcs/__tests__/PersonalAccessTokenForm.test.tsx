import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PersonalAccessTokenForm } from '../PersonalAccessTokenForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Key: () => <div data-testid="key-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />
}));

// Mock UI components
jest.mock('@/components/shadcn/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/shadcn/input', () => ({
  Input: (props: any) => <input {...props} />
}));

jest.mock('@/components/shadcn/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}));

jest.mock('@/components/shadcn/alert', () => ({
  Alert: ({ children, ...props }: any) => <div role="alert" {...props}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
}));

// Mock fetch
global.fetch = jest.fn();

describe('PersonalAccessTokenForm', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    (global.fetch as jest.Mock).mockReset();
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  describe('Initial rendering', () => {
    test('renders form for GitHub', () => {
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      expect(screen.getByText('Connect with Personal Access Token')).toBeInTheDocument();
      expect(screen.getByText(/Create a GitHub personal access token/)).toBeInTheDocument();
      expect(screen.getByLabelText('Personal Access Token')).toBeInTheDocument();
      expect(screen.getByLabelText('Instance URL (optional)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });

    test('renders form for GitLab', () => {
      render(<PersonalAccessTokenForm provider="gitlab" onSuccess={jest.fn()} />);

      expect(screen.getByText(/Create a GitLab personal access token/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your GitLab personal access token')).toBeInTheDocument();
    });

    test('renders form for Bitbucket', () => {
      render(<PersonalAccessTokenForm provider="bitbucket" onSuccess={jest.fn()} />);

      expect(screen.getByText(/Create a Bitbucket app password/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your Bitbucket app password')).toBeInTheDocument();
    });

    test('does not show instance URL for Bitbucket', () => {
      render(<PersonalAccessTokenForm provider="bitbucket" onSuccess={jest.fn()} />);

      expect(screen.queryByLabelText('Instance URL (optional)')).not.toBeInTheDocument();
    });
  });

  describe('Token visibility toggle', () => {
    test('toggles token visibility', () => {
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const toggleButton = screen.getByRole('button', { name: /toggle token visibility/i });

      // Initially password type
      expect(tokenInput).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

      // Click to show
      fireEvent.click(toggleButton);
      expect(tokenInput).toHaveAttribute('type', 'text');
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

      // Click to hide again
      fireEvent.click(toggleButton);
      expect(tokenInput).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    test('submits valid token successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true,
          connection: { id: 'connection-123' }
        })
      });

      const onSuccess = jest.fn();
      render(<PersonalAccessTokenForm provider="github" onSuccess={onSuccess} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'ghp_testtoken123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'ghp_testtoken123',
            instanceUrl: ''
          })
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('Successfully connected!')).toBeInTheDocument();
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    test('submits token with custom instance URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<PersonalAccessTokenForm provider="gitlab" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const urlInput = screen.getByLabelText('Instance URL (optional)');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'glpat-123' } });
      fireEvent.change(urlInput, { target: { value: 'https://gitlab.company.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/vcs/gitlab/connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'glpat-123',
            instanceUrl: 'https://gitlab.company.com'
          })
        });
      });
    });

    test('shows error for invalid token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
          error: 'Invalid token' 
        })
      });

      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Invalid token')).toBeInTheDocument();
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled();
    });

    test('shows generic error on network failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'token123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Failed to connect. Please check your token and try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Form validation', () => {
    test('disables submit button when token is empty', () => {
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const submitButton = screen.getByRole('button', { name: 'Connect' });
      expect(submitButton).toBeDisabled();
    });

    test('enables submit button when token is entered', () => {
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'token123' } });
      expect(submitButton).not.toBeDisabled();
    });

    test('trims whitespace from token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: '  token123  ' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              token: 'token123',
              instanceUrl: ''
            })
          })
        );
      });
    });
  });

  describe('Help text and links', () => {
    test('shows correct help link for GitHub', () => {
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const helpLink = screen.getByRole('link', { name: /here/i });
      expect(helpLink).toHaveAttribute('href', 'https://github.com/settings/tokens/new');
      expect(helpLink).toHaveAttribute('target', '_blank');
      expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('shows correct help link for GitLab', () => {
      render(<PersonalAccessTokenForm provider="gitlab" onSuccess={jest.fn()} />);

      const helpLink = screen.getByRole('link', { name: /here/i });
      expect(helpLink).toHaveAttribute('href', 'https://gitlab.com/-/profile/personal_access_tokens');
    });

    test('shows correct help link for Bitbucket', () => {
      render(<PersonalAccessTokenForm provider="bitbucket" onSuccess={jest.fn()} />);

      const helpLink = screen.getByRole('link', { name: /here/i });
      expect(helpLink).toHaveAttribute('href', 'https://bitbucket.org/account/settings/app-passwords/');
    });

    test('shows required scopes for each provider', () => {
      const { rerender } = render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);
      expect(screen.getByText(/repo, user, admin:repo_hook/)).toBeInTheDocument();

      rerender(<PersonalAccessTokenForm provider="gitlab" onSuccess={jest.fn()} />);
      expect(screen.getByText(/api, read_repository, write_repository/)).toBeInTheDocument();

      rerender(<PersonalAccessTokenForm provider="bitbucket" onSuccess={jest.fn()} />);
      expect(screen.getByText(/repository, pullrequest, webhook/)).toBeInTheDocument();
    });
  });

  describe('User authentication', () => {
    test('handles unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token');
      const submitButton = screen.getByRole('button', { name: 'Connect' });

      fireEvent.change(tokenInput, { target: { value: 'token123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('You must be logged in to connect a VCS account')).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Success state', () => {
    test('clears form after successful connection', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} />);

      const tokenInput = screen.getByLabelText('Personal Access Token') as HTMLInputElement;
      fireEvent.change(tokenInput, { target: { value: 'token123' } });
      fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

      await waitFor(() => {
        expect(screen.getByText('Successfully connected!')).toBeInTheDocument();
      });

      // Wait for success message to disappear
      await waitFor(() => {
        expect(screen.queryByText('Successfully connected!')).not.toBeInTheDocument();
      }, { timeout: 3500 });

      // Form should be cleared
      expect(tokenInput.value).toBe('');
    });

    test('calls onCancel when cancel button clicked', () => {
      const onCancel = jest.fn();
      render(<PersonalAccessTokenForm provider="github" onSuccess={jest.fn()} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
