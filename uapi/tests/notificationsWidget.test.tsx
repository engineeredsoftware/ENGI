/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock fetch for initial notifications and PATCH/DELETE calls
global.fetch = jest.fn();
const mockOpenOrbital = jest.fn();

// Mock Supabase client
jest.mock('@bitcode/supabase/ssr/client', () => ({
  createClient: jest.fn()
}));
jest.mock('@/app/auxillaries/components/AuxillariesProvider', () => ({
  openAuxillaries: (...args: unknown[]) => mockOpenOrbital(...args),
}));
import { createClient } from '@bitcode/supabase/ssr/client';

import { NotificationsWidget } from '@/components/bitcode/notifications/NotificationsWidget';

describe('NotificationsWidget', () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  };

  const mockSupabase = {
    auth: { getUser: jest.fn() },
    channel: jest.fn().mockReturnValue(mockChannel),
    removeChannel: jest.fn()
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockOpenOrbital.mockReset();
    mockChannel.on.mockReturnThis();
    mockChannel.subscribe.mockReturnThis();
    // Default fetch to return empty list
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });
    // Supabase auth returns a user
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('renders bell icon with no badge when no notifications', async () => {
    render(<NotificationsWidget />);
    // Wait for useEffect
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // No badge
    expect(screen.queryByText(/\d+/)).toBeNull();
  });

  it('renders unread count and dropdown items', async () => {
    const notifications = [
      { id: 'n1', user_id: 'user-1', type: 'foo', message: 'Hello', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' },
      { id: 'n2', user_id: 'user-1', type: 'bar', message: 'World', data: {}, read: true, created_at: '2023-01-02T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => notifications });
    render(<NotificationsWidget />);
    // badge shows unread count 1
    expect(await screen.findByText('1')).toBeInTheDocument();
    // Dropdown hidden initially
    expect(screen.queryByText('Hello')).toBeNull();
    // Click bell to open
    fireEvent.click(screen.getByRole('button'));
    // Items appear
    expect(await screen.findByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('sends PATCH request when toggling read status', async () => {
    const notifications = [
      { id: 'n1', user_id: 'user-1', type: 'foo', message: 'Test', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => notifications });
    render(<NotificationsWidget />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('Test')).toBeInTheDocument();
    const markBtn = await screen.findByText('Read');
    fireEvent.click(markBtn);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auxillaries/notifications/n1',
        expect.objectContaining({ method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        })
      );
    });
  });

  it('sends DELETE request when deleting a notification', async () => {
    const notifications = [
      { id: 'n1', user_id: 'user-1', type: 'foo', message: 'DeleteMe', data: {}, read: true, created_at: '2023-01-01T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => notifications });
    render(<NotificationsWidget />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('DeleteMe')).toBeInTheDocument();
    const deleteBtn = await screen.findByText('Dismiss');
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auxillaries/notifications/n1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('shows operator-facing header copy, presents typed rows, and marks every unread notification as read', async () => {
    const notifications = [
      { id: 'n1', user_id: 'user-1', type: 'proof', title: 'Witness bundle', message: 'Proof bundle ready', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' },
      { id: 'n2', user_id: 'user-1', type: 'repo', message: 'Repository needs review', data: {}, read: false, created_at: '2023-01-02T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => notifications });
    render(<NotificationsWidget />);
    expect(await screen.findByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Personal activity queue for proof closure, repository activity, and review prompts')).toBeInTheDocument();
    expect(screen.getByText('Witness bundle')).toBeInTheDocument();
    expect(screen.getByText('Repository event')).toBeInTheDocument();
    expect(screen.getAllByText('Personal activity')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auxillaries/notifications/n1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auxillaries/notifications/n2',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        })
      );
    });
  });

  it('keeps the dropdown focused on notifications without a footer route action', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] });

    render(<NotificationsWidget />);
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    await screen.findByText('All caught up! No notifications yet.');
    expect(screen.queryByRole('button', { name: 'Open Auxillaries fullscreen' })).not.toBeInTheDocument();
    expect(mockOpenOrbital).not.toHaveBeenCalled();
  });
});
