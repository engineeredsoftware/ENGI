// Tests for email confirmation route
import '@/tests/setupTests';
// Mock next/navigation redirect
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({ redirect: (url: string) => mockRedirect(url) }));
// Mock Supabase server client
jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));

import { createClient } from '@bitcode/supabase/ssr/server';
import { GET } from '@/app/auth/confirm/route';

describe('GET /auth/confirm', () => {
  const mockVerify = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({ auth: { verifyOtp: mockVerify } });
  });

  it('redirects to next if token and type valid', async () => {
    mockVerify.mockResolvedValue({ error: null });
    const url = 'http://localhost/auth/confirm?token_hash=abc&type=sign_in&next=/dashboard';
    await GET(new Request(url));
    expect(mockVerify).toHaveBeenCalledWith({ type: 'sign_in', token_hash: 'abc' });
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to error if verifyOtp fails', async () => {
    mockVerify.mockResolvedValue({ error: { message: 'fail' } });
    const url = 'http://localhost/auth/confirm?token_hash=abc&type=sign_in';
    await GET(new Request(url));
    expect(mockRedirect).toHaveBeenCalledWith('/error');
  });

  it('redirects to error when missing params', async () => {
    await GET(new Request('http://localhost/auth/confirm'));
    expect(mockRedirect).toHaveBeenCalledWith('/error');
  });
  it('redirects to root when next missing for valid email OTP', async () => {
    mockVerify.mockResolvedValue({ error: null });
    const url = 'http://localhost/auth/confirm?token_hash=hash123&type=email';
    await GET(new Request(url));
    expect(mockVerify).toHaveBeenCalledWith({ type: 'email', token_hash: 'hash123' });
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});