// The following mocks for Testing Library conflicted with real tests; removed to allow actual RTL behavior
// jest.mock('@testing-library/react', () => ({
//   render: jest.fn(),
//   screen: {},
//   fireEvent: {},
//   waitFor: (fn: Function) => fn(),
// }), { virtual: true });
// jest.mock('@testing-library/jest-dom', () => ({}), { virtual: true });
// Silence logger during tests
// Ensure GitHub env vars exist for tests
process.env.GITHUB_APP_ID = process.env.GITHUB_APP_ID || 'test-app-id';
process.env.GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY || 'private\\nkey';

// jsdom does not implement matchMedia (QuantumOrb, marketing landing, etc.).
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Stub the Next.js "server-only" module to a no-op so that API route files
// importing it don’t fail under Jest’s node environment.
jest.mock('server-only', () => ({}), { virtual: true });
// Enable dry run mode for tests
process.env.DRY_RUN_MODE = 'true';

// Provide a stub for the `ai` package which is referenced by observability
// helpers but is not installed in the test environment.  Only the
// `generateText` function is needed for the affected unit tests.
jest.mock('ai', () => ({
  generateText: jest.fn(async () => ({})),
  tool: jest.fn((fn: any) => fn),
}), { virtual: true });

// Stub the step-name normaliser used deep inside stream helpers so tests don't
// depend on the actual implementation.
jest.doMock('@bitcode/agent-generics/phaseHelpers/normalizeStepName', () => ({
  normalizeStepName: (s: string) => s,
}), { virtual: true });

// Provide lightweight JSON response helpers used across API routes
jest.mock('@bitcode/api/responses', () => ({
  createJsonResponse: (body: any = {}, status = 200) => new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    { status, headers: { 'Content-Type': 'application/json' } }
  ),
  createErrorResponse: (error?: any) => new Response(
    JSON.stringify({ error: typeof error?.message === 'string' ? error.message : 'error' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  ),
  createAuthErrorResponse: () => new Response(
    JSON.stringify({ error: 'unauthenticated' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}), { virtual: true });

// Process-root Execution defaults for tests (spy-able).
jest.doMock('@bitcode/generic-executions', () => {
  const processRoot = {
    repoPath: process.cwd(),
    dataStream: {
      writeData: jest.fn(),
      close: jest.fn()
    }
  };

  return {
    __esModule: true,
    initializeProcessRoot: jest.fn(() => processRoot),
    getProcessRootFields: jest.fn(() => processRoot),
    getProcessRootExecution: jest.fn(() => ({ id: 'process-root' })),
    setProcessRootFields: jest.fn(() => processRoot),
    endProcessRoot: jest.fn(),
    prepareProcessRootForPrompt: jest.fn(() => ({ task: undefined })),
    serializeProcessRootFields: jest.fn(() => ({ repoPath: processRoot.repoPath })),
    PROCESS_ROOT_EXECUTION_ID: 'process-root',
    PROCESS_NAMESPACE: 'process',
  };
});

// Provide default API keys expected by third-party SDKs used during module
// initialization in some libraries (e.g. Exa search / OpenAI).  Supplying
// placeholder values here keeps individual test files lightweight and avoids
// import-time errors.
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
process.env.EXA_API_KEY   = process.env.EXA_API_KEY   || 'test-key';
// Silence logger during tests
// Uses global jest provided by the test environment
jest.mock('@bitcode/logger', () => ({
  log: jest.fn(() => Promise.resolve()),
}));
// Mock NextResponse for API route tests (Next.js)
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number; headers?: any }) => ({
      status: init?.status || 200,
      headers: init?.headers || {},
      json: async () => data,
      text: async () => typeof data === 'object' ? JSON.stringify(data) : String(data),
    }),
  }
}));
// Polyfill TextEncoder
// @ts-ignore
global.TextEncoder = require('util').TextEncoder;
// Polyfill TextDecoder
// @ts-ignore
global.TextDecoder = require('util').TextDecoder;
// Stub 'stream/web' TransformStream import to avoid real streams in tests
jest.mock('stream/web', () => ({
  TransformStream: class {
    readable: any;
    writable: any;
    constructor() {
      this.readable = { getReader: () => ({ read: async () => ({ done: true, value: undefined }) }) };
      this.writable = { getWriter: () => ({ write: async () => {}, close: async () => {} }) };
    }
  }
}), { virtual: true });
// Stub global ReadableStream to immediately invoke start() and allow consuming streams
// @ts-ignore
global.ReadableStream = class {
  constructor(source: any) {
    // Immediately call start with a no-op controller
    const controller = {
      enqueue: (_chunk: any) => {},
      close: () => {}
    };
    if (source && typeof source.start === 'function') {
      source.start(controller);
    }
    this._source = source;
  }
  // Provide a reader to trigger start logic on first read
  getReader() {
    let called = false;
    return {
      read: async () => {
        if (!called) {
          called = true;
          return { done: false, value: new Uint8Array() };
        }
        return { done: true, value: undefined };
      }
    };
  }
};
// Polyfill global Request and Headers for API route tests
class TestHeaders {
  private headers: Record<string, string> = {};
  constructor(init?: Record<string, string> | [string, string][]) {
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => {
        this.headers[key.toLowerCase()] = value;
      });
    } else if (init && typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => {
        this.headers[key.toLowerCase()] = value as string;
      });
    }
  }
  get(name: string): string | null {
    return this.headers[name.toLowerCase()] || null;
  }
}
// @ts-ignore
global.Headers = TestHeaders;

class TestRequest {
  url: string;
  headers: TestHeaders;
  method: string;
  private _body: any;
  constructor(input: string | { url: string }, init?: { method?: string; headers?: Record<string, string> | TestHeaders; body?: any }) {
    if (typeof input === 'string') {
      this.url = input;
    } else {
      this.url = input.url;
    }
    this.method = init?.method || 'GET';
    this._body = init?.body;
    this.headers =
      init?.headers instanceof TestHeaders
        ? init.headers
        : new TestHeaders(init?.headers as Record<string, string>);
  }
  async json(): Promise<any> {
    if (typeof this._body === 'string') {
      try {
        return JSON.parse(this._body);
      } catch {
        throw new Error('Invalid JSON');
      }
    }
    return this._body;
  }
  async text(): Promise<string> {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
}
// @ts-ignore
global.Request = TestRequest;

// Polyfill ResizeObserver for jsdom environment
if (typeof window !== 'undefined' && !(window as any).ResizeObserver) {
  class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(): void {
      // no-op
    }
    unobserve(): void {
      // no-op
    }
    disconnect(): void {
      // no-op
    }
  }
  (window as any).ResizeObserver = ResizeObserver;
  (global as any).ResizeObserver = ResizeObserver;
}
// Polyfill global Response for API route tests
// @ts-ignore
global.Response = class TestResponse {
  status: number;
  headers: Record<string, string>;
  statusText: string;
  private _body: any;
  constructor(body?: any, init?: { status?: number; headers?: Record<string, string>; statusText?: string }) {
    this._body = body;
    this.status = init?.status || 200;
    this.headers = init?.headers || {};
    this.statusText = init?.statusText || '';
  }
  async json(): Promise<any> {
    if (typeof this._body === 'string') {
      try {
        return JSON.parse(this._body);
      } catch {
        return this._body;
      }
    }
    return this._body;
  }
  async text(): Promise<string> {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }
};
// Conditionally mock Supabase client to avoid requiring env vars in tests
if (process.env.USE_REAL_DB !== 'true') {
  // In-memory store for table-specific responses
  const supabaseResponses: Record<string, { data: any; error: any }> = {};
  // Expose helpers for tests
  // @ts-ignore
  global.clearSupabaseResponses = (): void => {
    Object.keys(supabaseResponses).forEach(k => delete supabaseResponses[k]);
  };
  // @ts-ignore
  global.setSupabaseResponse = (table: string, resp: { data: any; error: any }): void => {
    supabaseResponses[table] = resp;
  };
  // Query builder stub
  // Wrap the query builder factory in `jest.fn` so callers can use Jest helper
  // methods like `.mockImplementation()` in their tests (e.g. route
  // unit tests).  Without this, `supabaseAdmin.from` would be a plain
  // function and attempts to stub it would throw "mockImplementation is not a
  // function" errors.
  const createBuilder = jest.fn(function createBuilder(table: string) {
    const resp = supabaseResponses[table] ?? { data: null, error: null };
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      upsert: () => builder,
      eq: () => builder,
      match: () => builder,
      order: () => builder,
      limit: () => builder,
      gte: () => builder,
      lte: () => builder,
      maybeSingle: () => resp,
      single: () => resp,
      then: (onFulfilled: any) => Promise.resolve(resp).then(onFulfilled),
      data: resp.data,
      error: resp.error,
    };
    return builder;
  });
  // Provide mock supabaseClient module
  jest.doMock('@bitcode/supabase', () => ({
    supabase: { from: createBuilder },
    supabaseAdmin: { from: createBuilder }
  }));
} else {
  // Use real supabaseClient for integration tests
  jest.unmock('@bitcode/supabase');
}
// Mock createClient from utils to avoid Supabase env errors
// Mock both client and server variants of the Supabase helper so that unit
// tests – including ones that explicitly `jest.spyOn` / mutate
// `createClient` – always receive a Jest mock they can interact with.
const mockCreateClient = jest.fn(() => ({
  auth: { getUser: async () => ({ data: { user: {} } }) }
}));

jest.doMock('@bitcode/supabase/ssr/client', () => ({
  createClient: mockCreateClient
}), { virtual: true });

jest.doMock('@bitcode/supabase/ssr/server', () => ({
  createClient: mockCreateClient
}), { virtual: true });
// Stub TransformStream
// @ts-ignore
global.TransformStream = class {
  readable: any;
  writable: any;
  constructor() {
    this.readable = {
      getReader: () => ({
        read: async () => ({ done: true, value: undefined })
      })
    };
    this.writable = {
      getWriter: () => ({
        write: async (_chunk: any) => {},
        close: async () => {}
      })
    };
  }
};
// Stub ReadableStream
// @ts-ignore
global.ReadableStream = class {
  underlyingSource: any;
  constructor(source: any) {
    this.underlyingSource = source;
  }
  getReader() {
    return { read: async () => ({ done: true, value: undefined }) };
  }
};
// Stub HTMLCanvasElement.getContext for chart rendering (only if running in a
// JSDOM environment where the global constructor is present). Some Jest suites
// use the "node" test environment, in which case `HTMLCanvasElement` is
// undefined and attempting to patch its prototype would throw.

if (typeof HTMLCanvasElement !== 'undefined') {
  // @ts-ignore – JSDOM only implements a subset of the Canvas API; we just
  // read enough to keep components from crashing in tests.
  HTMLCanvasElement.prototype.getContext = function () {
    return {
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillRect: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      measureText: () => ({ width: 0 }),
      fillText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      arc: () => {},
    } as any;
  };
}
// Silence React SSR warnings about useLayoutEffect on server
import React from 'react';
React.useLayoutEffect = React.useEffect;
// Filter out known non-critical console errors in tests
const __origConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string' &&
      (msg.includes('useLayoutEffect does nothing on the server') || msg.includes('non-boolean attribute'))) {
    return;
  }
  __origConsoleError(...args);
};
