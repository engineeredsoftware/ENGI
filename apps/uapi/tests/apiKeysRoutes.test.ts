import { GET, POST, DELETE } from '@/app/api/auxillaries/api-keys/route';
import { authenticateRequest } from '@bitcode/auth';
import { supabaseAdmin } from '@bitcode/supabase';

jest.mock('@bitcode/auth', () => ({ authenticateRequest: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));
const mockAuth = authenticateRequest as jest.Mock;
const mockFrom = (supabaseAdmin.from as unknown) as jest.Mock;

describe('API Key Management Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/auxillaries/api-keys', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(new Response(null, { status: 401 }));
      const res = await GET(new Request('http://localhost/api/auxillaries/api-keys'));
      expect(res.status).toBe(401);
    });
    it('lists keys for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 'user-1' });
      const mockData = [{ id: 'k1', name: 'first', expire_at: '2023-01-01T00:00:00Z', created_at: '2022-01-01T00:00:00Z' }];
      // Builder that resolves on await
      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: (onfulfilled: any) => Promise.resolve({ data: mockData, error: null }).then(onfulfilled)
      };
      mockFrom.mockReturnValue(builder);
      const res = await GET(new Request('http://localhost/api/auxillaries/api-keys'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual([
        { id: 'k1', name: 'first', expireAt: '2023-01-01T00:00:00Z', createdAt: '2022-01-01T00:00:00Z' }
      ]);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('user_api_keys');
    });
  });

  describe('POST /api/auxillaries/api-keys', () => {
    const url = 'http://localhost/api/auxillaries/api-keys';
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(new Response(null, { status: 401 }));
      const res = await POST(new Request(url, { method: 'POST', body: '{}' }));
      expect(res.status).toBe(401);
    });
    it('validates missing name', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 'u1' });
      const res = await POST(new Request(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({}) }));
      expect(res.status).toBe(400);
      const txt = await res.json();
      expect(txt.error).toMatch(/Name is required/);
    });
    it('creates a new key', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 'u1' });
      const rawKey = 'abc123deadbeef';
      // stub crypto.randomBytes
      jest.spyOn(require('crypto'), 'randomBytes').mockReturnValue(Buffer.from(rawKey, 'hex'));
      // Builder for insert
      const builder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'k2', key: rawKey }, error: null })
      };
      mockFrom.mockReturnValue(builder);
      const payload = { name: 'test', expireAt: '2025-01-01' };
      const res = await POST(new Request(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({ id: 'k2', apiKey: rawKey });
      expect(supabaseAdmin.from).toHaveBeenCalledWith('user_api_keys');
      // restore
      jest.spyOn(require('crypto'), 'randomBytes').mockRestore();
    });
  });

  describe('DELETE /api/auxillaries/api-keys', () => {
    const base = 'http://localhost/api/auxillaries/api-keys';
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(new Response(null, { status: 401 }));
      const res = await DELETE(new Request(base + '?id=k1', { method: 'DELETE' }));
      expect(res.status).toBe(401);
    });
    it('validates missing id', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 'u1' });
      const res = await DELETE(new Request(base, { method: 'DELETE' }));
      expect(res.status).toBe(400);
    });
    it('deletes key when authenticated', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 'u1' });
      const builder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
      };
      mockFrom.mockReturnValue(builder);
      const res = await DELETE(new Request(base + '?id=k1', { method: 'DELETE' }));
      expect(res.status).toBe(204);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('user_api_keys');
    });
  });
});
