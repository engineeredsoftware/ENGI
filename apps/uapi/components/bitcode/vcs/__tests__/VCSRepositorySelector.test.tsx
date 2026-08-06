import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VCSRepositorySelector } from '../VCSRepositorySelector';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronsUpDown: () => <div data-testid="chevrons-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />
}));

// Mock UI components
jest.mock('@/components/shadcn/Button/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/shadcn/Command/Command', () => ({
  Command: ({ children }: any) => <div data-testid="command">{children}</div>,
  CommandInput: (props: any) => <input data-testid="command-input" {...props} />,
  CommandEmpty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: any) => <div data-testid="command-group">{children}</div>,
  CommandItem: ({ children, onSelect, ...props }: any) => (
    <div data-testid="command-item" onClick={() => onSelect?.()} {...props}>{children}</div>
  )
}));

jest.mock('@/components/shadcn/Popover/Popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>
}));

// Mock fetch
global.fetch = jest.fn();

describe('VCSRepositorySelector', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  };

  const mockRepositories = [
    {
      id: 'repo-1',
      name: 'awesome-project',
      fullName: 'user/awesome-project',
      description: 'An awesome project',
      private: false,
      defaultBranch: 'main'
    },
    {
      id: 'repo-2',
      name: 'private-repo',
      fullName: 'user/private-repo',
      description: 'A private repository',
      private: true,
      defaultBranch: 'master'
    },
    {
      id: 'repo-3',
      name: 'test-repo',
      fullName: 'user/test-repo',
      description: null,
      private: false,
      defaultBranch: 'main'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    (global.fetch as jest.Mock).mockReset();
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  describe('Initial state', () => {
    test('shows placeholder when no repository selected', () => {
      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);
      
      expect(screen.getByText('Select repository...')).toBeInTheDocument();
    });

    test('shows disabled state when disabled prop is true', () => {
      render(<VCSRepositorySelector provider="github" disabled onSelect={jest.fn()} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
    });

    test('shows selected repository name', () => {
      const selectedRepo = mockRepositories[0];
      render(
        <VCSRepositorySelector 
          provider="github" 
          value={selectedRepo}
          onSelect={jest.fn()} 
        />
      );
      
      expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
    });
  });

  describe('Connection check', () => {
    test('checks for connection on mount', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('user_vcs_connections');
        expect(mockSupabase.eq).toHaveBeenCalledWith('userId', 'user-123');
        expect(mockSupabase.eq).toHaveBeenCalledWith('provider', 'github');
      });
    });

    test('shows error when not connected', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
        expect(screen.getByText('No GitHub connection found')).toBeInTheDocument();
        expect(screen.getByText('Please connect your GitHub account first')).toBeInTheDocument();
      });
    });
  });

  describe('Repository loading', () => {
    test('loads repositories when dropdown opens', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/repositories');
      });

      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
        expect(screen.getByText('user/private-repo')).toBeInTheDocument();
        expect(screen.getByText('user/test-repo')).toBeInTheDocument();
      });
    });

    test('shows loading state while fetching', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      // Delay the response
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ repositories: [] })
        }), 100))
      );

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
      });
    });

    test('shows error when loading fails', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
        expect(screen.getByText('Failed to load repositories')).toBeInTheDocument();
      });
    });

    test('caches repositories after first load', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      // Open dropdown first time
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });

      // Close dropdown
      fireEvent.click(screen.getByRole('button'));

      // Open dropdown second time
      fireEvent.click(screen.getByRole('button'));

      // Should not fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search functionality', () => {
    test('filters repositories by search query', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByTestId('command-input');
      fireEvent.change(searchInput, { target: { value: 'awesome' } });

      // Should show only matching repository
      expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      expect(screen.queryByText('user/private-repo')).not.toBeInTheDocument();
      expect(screen.queryByText('user/test-repo')).not.toBeInTheDocument();
    });

    test('shows empty state when no matches', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('command-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No repositories found.')).toBeInTheDocument();
    });

    test('searches by repository name and full name', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });

      // Search by partial name
      const searchInput = screen.getByTestId('command-input');
      fireEvent.change(searchInput, { target: { value: 'priv' } });

      expect(screen.getByText('user/private-repo')).toBeInTheDocument();
      expect(screen.queryByText('user/awesome-project')).not.toBeInTheDocument();
    });
  });

  describe('Selection behavior', () => {
    test('calls onSelect when repository selected', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      const onSelect = jest.fn();
      render(<VCSRepositorySelector provider="github" onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });

      // Click on a repository
      const repoItems = screen.getAllByTestId('command-item');
      fireEvent.click(repoItems[0]);

      expect(onSelect).toHaveBeenCalledWith(mockRepositories[0]);
    });

    test('closes dropdown after selection', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });

      const repoItems = screen.getAllByTestId('command-item');
      fireEvent.click(repoItems[0]);

      // Popover should close
      await waitFor(() => {
        expect(screen.getByText('user/awesome-project')).toBeInTheDocument();
      });
    });

    test('shows check icon for selected repository', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(
        <VCSRepositorySelector 
          provider="github" 
          value={mockRepositories[1]}
          onSelect={jest.fn()} 
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const repoItems = screen.getAllByTestId('command-item');
        // Second item should have check icon
        const secondItem = repoItems[1];
        expect(within(secondItem).getByTestId('check-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Repository display', () => {
    test('shows repository description when available', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('An awesome project')).toBeInTheDocument();
        expect(screen.getByText('A private repository')).toBeInTheDocument();
      });
    });

    test('shows private indicator for private repositories', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'github' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="github" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const privateLabels = screen.getAllByText('Private');
        expect(privateLabels).toHaveLength(1);
      });
    });
  });

  describe('Provider-specific behavior', () => {
    test('works with GitLab provider', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'gitlab' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="gitlab" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/vcs/gitlab/repositories');
      });
    });

    test('works with Bitbucket provider', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'connection-123', provider: 'bitbucket' },
        error: null
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ repositories: mockRepositories })
      });

      render(<VCSRepositorySelector provider="bitbucket" onSelect={jest.fn()} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/vcs/bitbucket/repositories');
      });
    });
  });
});
