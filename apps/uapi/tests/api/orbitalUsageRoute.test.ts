import { GET } from '@/app/api/auxillaries/usage/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

describe('GET /api/auxillaries/usage', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();
  const events = [
    { created_at: '2023-01-01T10:00:00Z', change: 10, balance: 10 },
    { created_at: '2023-01-01T15:00:00Z', change: -3, balance: 7 },
    { created_at: '2023-01-02T12:00:00Z', change: 5, balance: 12 },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
  });

  it('returns 401 if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
    const res = await GET(new Request('http://localhost/api/auxillaries/usage'));
    expect(res.status).toBe(401);
  });

  it('returns daily summary when no aggregate parameter', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis(), lte: jest.fn().mockReturnThis(),
      data: events, error: null,
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const res = await GET(new Request('http://localhost/api/auxillaries/usage'));
    expect(res.status).toBe(200);
    const summary = await res.json();
    expect(summary).toEqual([
      { date: '2023-01-01', purchased: 10, spent: 3, net: 7, balance: 7 },
      { date: '2023-01-02', purchased: 5, spent: 0, net: 5, balance: 12 },
    ]);
  });

  it('returns daily aggregated summary when aggregate=daily', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(), gte: jest.fn().mockReturnThis(), lte: jest.fn().mockReturnThis(),
      data: events, error: null,
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const req = new Request('http://localhost/api/auxillaries/usage?aggregate=daily');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const summary = await res.json();
    expect(summary).toEqual([
      { period: '2023-01-01', purchased: 10, spent: 3, net: 7, balance: 7 },
      { period: '2023-01-02', purchased: 5, spent: 0, net: 5, balance: 12 },
    ]);
  });

  it('returns error when supabase query fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const builder: any = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), data: null, error: { message: 'db error' } };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const res = await GET(new Request('http://localhost/api/auxillaries/usage'));
    expect(res.status).toBe(500);
  });
});
