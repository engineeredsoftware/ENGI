import { GET, POST } from '@/app/api/auxillaries/model-preferences/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

const mockUser = { id: 'user-1' };
const mockGetUser = jest.fn();

function createQueryBuilder(returnData: any) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: returnData, error: null }),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  } as any;
}

beforeEach(() => {
  jest.resetAllMocks();
  (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
});

describe('POST /api/auxillaries/model-preferences RBAC', () => {
  it('returns stored preferences on GET for an authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const prefsBuilder = createQueryBuilder({ preferences: { defaultModel: 'claude-3-7-sonnet' } });
    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(prefsBuilder);

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      preferences: { defaultModel: 'claude-3-7-sonnet' },
    });
  });

  it('rejects unauthenticated user with 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
    const res = await POST(new Request('http://localhost', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
  });

  it('allows lead to update preferences', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const profileBuilder = createQueryBuilder({ role: 'lead' });
    const prefsBuilder = createQueryBuilder(null);

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(profileBuilder)
      .mockReturnValueOnce(prefsBuilder)
      .mockReturnValueOnce(prefsBuilder);

    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ engine: 'openai' }) }));
    expect(res.status).toBe(200);
  });

  it('forbids dev role with 403', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const profileBuilder = createQueryBuilder({ role: 'dev' });
    (supabaseAdmin.from as jest.Mock).mockReturnValue(profileBuilder);

    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ engine: 'openai' }) }));
    expect(res.status).toBe(403);
  });
});
