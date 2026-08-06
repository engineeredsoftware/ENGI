/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auxillaries/transactions/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

describe('GET /api/auxillaries/transactions', () => {
  const mockUser = { id: 'user-1' };

  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
    });
  });

  it('returns paged normalized transactions', async () => {
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'usage-1',
            created_at: '2026-04-19T10:00:00.000Z',
            amount: 5,
            operation_type: 'purchase',
            metadata: { description: 'Purchased BTD' },
          },
          {
            id: 'usage-2',
            created_at: '2026-04-19T11:00:00.000Z',
            amount: 2,
            operation_type: 'usage',
            metadata: { description: 'Measured read' },
          },
        ],
        error: null,
        count: 2,
      }),
    };
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);

    const res = await GET(new Request('http://localhost/api/auxillaries/transactions?page=1&pageSize=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(2);
    expect(body.transactions).toEqual([
      expect.objectContaining({
        id: 'usage-1',
        description: 'Purchased BTD',
        change: 5,
      }),
      expect.objectContaining({
        id: 'usage-2',
        description: 'Measured read',
        change: -2,
      }),
    ]);
  });
});
