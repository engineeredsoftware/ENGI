/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auxillaries/usage/route';
import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

// Helper to create GET Request
function makeRequest(query: string) {
  return new Request(`https://example.com/api/auxillaries/usage${query}`, { method: 'GET' });
}

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn()
}));
jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

describe('User Usage GET', () => {
  const mockUser = { id: 'u1' };
  beforeEach(() => {
    jest.resetAllMocks();
    // Authenticated user
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
    });
  });

  it('returns daily summary for a single event without aggregate param', async () => {
    // Mock raw events builder
    const events = [
      { created_at: '2023-01-01T05:00:00Z', change: 10, balance: 10 }
    ];
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: events, error: null })
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const res = await GET(makeRequest('')); // no aggregate
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    const summary = data[0];
    expect(summary.date).toBe('2023-01-01');
    expect(summary.purchased).toBe(10);
    expect(summary.spent).toBe(0);
    expect(summary.net).toBe(10);
    expect(summary.balance).toBe(10);
  });

  it('returns aggregated daily summary when aggregate=daily', async () => {
    const events = [
      { created_at: '2023-02-01T01:00:00Z', change: -5, balance: 95 },
      { created_at: '2023-02-01T12:00:00Z', change: 20, balance: 115 }
    ];
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: events, error: null })
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
    const res = await GET(makeRequest('?aggregate=daily&from=2023-02-01&to=2023-02-02'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    const summary = data[0];
    expect(summary.period).toBe('2023-02-01');
    expect(summary.purchased).toBe(20);
    expect(summary.spent).toBe(5);
    expect(summary.net).toBe(15);
    expect(summary.balance).toBe(115);
  });

  it('returns 401 if unauthenticated', async () => {
    // Mock auth fail
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('no auth') }) }
    });
    const res = await GET(makeRequest(''));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
