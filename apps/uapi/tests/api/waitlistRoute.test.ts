/**
 * Marketing waitlist API: store roles + render waitlist.html + Resend Edge.
 */

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: { from: jest.fn() },
}));

import { supabaseAdmin } from '@bitcode/supabase';
import { POST } from '@/app/api/waitlist/route';

const mockFrom = supabaseAdmin.from as jest.Mock;

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/waitlist', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://proj.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, id: 're_msg_1' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('rejects invalid email', async () => {
    const res = await POST(jsonRequest({ email: 'bad', roles: ['buyer'] }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: 'invalid_email' });
    expect(mockFrom).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts empty roles (email only)', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    const res = await POST(jsonRequest({ email: 'a@b.co', roles: [] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ok: true,
      alreadyJoined: false,
      emailSent: true,
    });
    expect(insert).toHaveBeenCalledWith({
      email: 'a@b.co',
      roles: [],
      source: 'landing',
    });
  });

  it('honeypot returns ok without store or email', async () => {
    const res = await POST(
      jsonRequest({ email: 'a@b.co', roles: ['seller'], website: 'http://spam' }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockFrom).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders waitlist.html and posts raw html to resend edge', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    const res = await POST(
      jsonRequest({
        email: '  You@Company.COM ',
        roles: ['builder', 'seller'],
        source: 'landing',
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      alreadyJoined: false,
      emailSent: true,
      messageId: 're_msg_1',
    });
    expect(mockFrom).toHaveBeenCalledWith('marketing_waitlist');
    expect(insert).toHaveBeenCalledWith({
      email: 'you@company.com',
      roles: ['seller', 'builder'],
      source: 'landing',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://proj.supabase.co/functions/v1/resend',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer service-role-test-key',
          apikey: 'service-role-test-key',
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.kind).toBe('waitlist');
    expect(body.to).toBe('you@company.com');
    expect(body.subject).toBe('Welcome to the Bitcode waitlist');
    expect(body.html).toContain('Welcome to the Bitcode waitlist');
    expect(body.html).toContain('you@company.com');
    expect(body.html).toContain('Seller · Builder');
    expect(body.html).toContain("unless they're pair-connected");
    expect(body.template).toBeUndefined();
  });

  it('returns alreadyJoined on unique email without re-sending', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key' },
    });
    mockFrom.mockReturnValue({ insert });

    const res = await POST(jsonRequest({ email: 'a@b.co', roles: ['buyer'] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, alreadyJoined: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns email_send_failed when resend edge fails', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, error: 'resend_failed' }),
    });

    const res = await POST(jsonRequest({ email: 'a@b.co', roles: ['seller'] }));

    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({
      ok: false,
      error: 'email_send_failed',
      stored: true,
    });
  });
});
