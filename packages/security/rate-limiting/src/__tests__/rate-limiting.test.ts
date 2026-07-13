import { NextResponse } from 'next/server';
import {
  createRateLimiter,
  rateLimitMiddleware,
  withRateLimit,
  RateLimitPresets,
  type RateLimitStore
} from '../rate-limiting';

jest.mock('next/server', () => {
  class MockNextResponse {
    body: any;
    status: number;
    headers: Record<string, string>;

    constructor(body: string | Record<string, any>, init?: { status?: number; headers?: Record<string, string> }) {
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
      this.body = body;
    }

    static json(data: Record<string, any>, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockNextResponse(data, init);
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      return this.body;
    }
  }

  return {
    NextRequest: class {},
    NextResponse: MockNextResponse
  };
});

const mockHeaders = (values: Record<string, string> = {}) => ({
  get: (key: string) => values[key.toLowerCase()] ?? null
});

const mockRequest = (overrides: Record<string, any> = {}) =>
  ({
    headers: mockHeaders(overrides.headers || {}),
    ip: overrides.ip ?? '127.0.0.1'
  }) as any;

class TestRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: Date }>();

  async increment(key: string, windowMs: number) {
    const now = new Date();
    const record = this.store.get(key);

    if (!record || now >= record.resetTime) {
      const resetTime = new Date(now.getTime() + windowMs);
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    record.count += 1;
    this.store.set(key, record);
    return { count: record.count, resetTime: record.resetTime };
  }
}

describe('rate limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permits requests within the configured limit and blocks when exceeded', async () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
      message: 'Too many',
      headers: true,
      standardHeaders: true,
      store: new TestRateLimitStore()
    });

    const request = mockRequest({
      headers: { 'x-user-id': 'user-1', 'x-forwarded-for': '10.0.0.1' }
    });

    const first = await limiter(request);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(0);

    const second = await limiter(request);
    expect(second.allowed).toBe(false);
    expect(second.remaining).toBe(0);
  });

  it('rateLimitMiddleware returns a 429 response when the limit is exceeded', async () => {
    const middleware = rateLimitMiddleware({
      ...RateLimitPresets.CREDENTIAL_SUBMISSION,
      maxRequests: 1,
      windowMs: 1000,
      store: new TestRateLimitStore()
    });

    const request = mockRequest({
      headers: { 'x-user-id': 'user-2', 'x-forwarded-for': '10.0.0.2' }
    });

    await middleware(request);
    const response = await middleware(request);
    expect(response).not.toBeNull();

    const json = await (response as any).json();
    expect(json).toMatchObject({
      error: 'Rate limit exceeded',
      limit: 1
    });
  });

  it('withRateLimit short-circuits handler with the middleware result on limits', async () => {
    const handler = jest.fn(async () => NextResponse.json({ ok: true }));
    const limitedHandler = withRateLimit(
      {
        windowMs: 500,
        maxRequests: 1,
        message: 'Slow down',
        headers: true,
        standardHeaders: true,
        store: new TestRateLimitStore()
      },
      handler
    );

    const req = mockRequest({ headers: { 'x-forwarded-for': '10.0.0.3' } });

    const allowed = await limitedHandler(req);
    expect(await allowed.json()).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledTimes(1);

    const blocked = await limitedHandler(req);
    expect(handler).toHaveBeenCalledTimes(1);
    const blockedJson = await (blocked as any).json();
    expect(blockedJson.error).toBe('Rate limit exceeded');
  });
});
