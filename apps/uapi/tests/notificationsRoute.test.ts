import { GET as getNotifications } from '@/app/api/auxillaries/notifications/route';
import {
  PATCH as patchNotification,
  DELETE as deleteNotification,
} from '@/app/api/auxillaries/notifications/[notificationId]/route';
import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

// Mock createClient to provide supabase auth and from
jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));
const mockCreateClient = createClient as jest.Mock;

describe('Notifications API Routes', () => {
  const mockGetUser = jest.fn();
  let supabase: any;

  beforeEach(() => {
    jest.resetAllMocks();
    // Set up default supabase client mock
    supabase = {
      auth: { getUser: mockGetUser },
    };
    mockCreateClient.mockResolvedValue(supabase);
  });

  describe('GET /api/auxillaries/notifications', () => {
    it('fails closed to an empty list if unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
      const res = await getNotifications(new Request('http://localhost/api/auxillaries/notifications'));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('returns notifications for authenticated user', async () => {
      const user = { id: 'user-1' };
      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      const notifications = [
        { id: 'n1', user_id: 'user-1', type: 'foo', message: 'hello', data: {}, read: false, created_at: '2023-01-01T00:00:00Z' }
      ];
      // Build a thenable builder with chain methods
      const builder = Object.assign(
        Promise.resolve({ data: notifications, error: null }),
        {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
        }
      );
      (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
      const res = await getNotifications(new Request('http://localhost/api/auxillaries/notifications'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(notifications);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
    });

    it('filters unread_only parameter', async () => {
      const user = { id: 'user-2' };
      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      const notifications: any[] = [];
      const builder = Object.assign(
        Promise.resolve({ data: notifications, error: null }),
        {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
        }
      );
      (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
      const res = await getNotifications(new Request('http://localhost/api/auxillaries/notifications?unread_only=1'));
      expect(res.status).toBe(200);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-2');
    });
  });

  describe('PATCH /api/auxillaries/notifications/:notificationId', () => {
    it('returns 401 if unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
      const res = await patchNotification(new Request('http://localhost'), { params: { notificationId: 'x' } });
      expect(res.status).toBe(401);
    });

    it('updates read status and returns the updated notification', async () => {
      const user = { id: 'user-3' };
      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      const builder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'n1',
            user_id: 'user-3',
            type: 'foo',
            title: null,
            message: 'hello',
            data: {},
            is_read: true,
            created_at: '2023-01-01T00:00:00Z',
          },
          error: null,
        }),
      } as any;
      (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
      const req = new Request('http://localhost', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) });
      const res = await patchNotification(req, { params: { notificationId: 'n1' } });
      expect(res.status).toBe(200);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
      expect(builder.update).toHaveBeenCalledWith({ is_read: true });
      expect(builder.eq).toHaveBeenCalledWith('id', 'n1');
    });
  });

  describe('DELETE /api/auxillaries/notifications/:notificationId', () => {
    it('returns 401 if unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
      const res = await deleteNotification(new Request('http://localhost'), { params: { notificationId: 'x' } });
      expect(res.status).toBe(401);
    });

    it('deletes notification and returns the deleted id payload', async () => {
      const user = { id: 'user-4' };
      mockGetUser.mockResolvedValue({ data: { user }, error: null });
      const builder = Object.assign(
        Promise.resolve({ error: null }),
        {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        }
      );
      (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
      const res = await deleteNotification(new Request('http://localhost'), { params: { notificationId: 'n2' } });
      expect(res.status).toBe(200);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('id', 'n2');
    });
  });
});
