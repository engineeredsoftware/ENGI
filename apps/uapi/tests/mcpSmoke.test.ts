// Smoke test: generate a canonical auxillaries API key through the active route.
/**
 * @jest-environment node
 */
// Reset modules and set feature flags before imports
process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
jest.resetModules();
// Mock authentication to always succeed
jest.mock('@bitcode/auth', () => ({ authenticateRequest: jest.fn() }));

// Minimal Response polyfill for Node test environment
(global as any).Response = class {
  status: number;
  headers: any;
  private body: string;
  constructor(body: string, init: { status: number; headers: any }) {
    this.body = body;
    this.status = init.status;
    this.headers = init.headers;
  }
  async json() { return JSON.parse(this.body); }
};
// Mock Supabase admin client
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));
import { supabaseAdmin } from '@bitcode/supabase';
import { authenticateRequest } from '@bitcode/auth';
import { POST as createKey } from '@/app/api/auxillaries/api-keys/route';

describe('Auxillaries API key smoke', () => {
  it('creates a canonical auxillaries API key', async () => {
    const mockAuth = (authenticateRequest as jest.Mock);
    mockAuth.mockResolvedValue({ userId: 'user-1' });

    const builderInsert = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'key-1', key: 'deadbeef' }, error: null }),
    };
    const fromMock = (supabaseAdmin.from as jest.Mock);
    fromMock.mockReturnValueOnce(builderInsert);

    try {
      const reqCreate = new Request('http://localhost/api/auxillaries/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'smoke-test', expireAt: null }),
      });
      const resCreate = await createKey(reqCreate);
      expect(resCreate.status).toBe(201);
      const bodyCreate = await resCreate.json();
      expect(bodyCreate).toHaveProperty('id', 'key-1');
      expect(bodyCreate).toHaveProperty('apiKey', 'deadbeef');
      expect(fromMock).toHaveBeenCalledTimes(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});
