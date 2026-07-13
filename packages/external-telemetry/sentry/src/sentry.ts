// Migrated from uapi/lib/sentry.ts – thin wrapper around the Sentry SDK that
// degrades gracefully when SDK/DSN are not present.  No functional changes.

/* eslint-disable @typescript-eslint/no-explicit-any */

type SentryLike = {
  init: (options: any) => void;
  captureException: (err: any, ctx?: any) => void;
  captureMessage: (msg: string, ctx?: any) => void;
  captureEvent?: (event: any) => void;
  flush?: (timeout?: number) => Promise<boolean>;
  withScope: (cb: (scope: any) => void) => void;
  startSpan?: (ctx: any, cb: () => any) => any;
};

function createStub(): SentryLike {
  const fn = () => {};
  const flush = async () => true;
  return {
    init: fn,
    captureException: fn,
    captureMessage: fn,
    withScope: (cb) => cb({}),
    flush,
  } as SentryLike;
}

function loadRealSdk(): SentryLike | null {
  if (typeof require === 'undefined') return null;

  // Check if we're in Edge Runtime - return null immediately (no eval in edge)
  if (process.env.NEXT_RUNTIME === 'edge') return null;
  if (typeof (globalThis as any).EdgeRuntime !== 'undefined') return null;

  // Prevent webpack from trying to bundle these modules during build
  if (typeof window !== 'undefined') return null;
  if (process.env.NODE_ENV === undefined) return null;

  try {
    // Dynamic require (Node.js only, not in edge)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    return Sentry;
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/node');
      return Sentry;
    } catch {
      return null;
    }
  }
}

const sdk: SentryLike = (() => {
  if (!process?.env?.SENTRY_DSN) return createStub();
  const real = loadRealSdk();
  return real ?? createStub();
})();

if (process?.on && !(globalThis as any).__sentry_global_handlers__) {
  (globalThis as any).__sentry_global_handlers__ = true;
  process.on('unhandledRejection', (reason) => {
    captureException(reason, { mechanism: 'unhandledRejection' });
  });
  process.on('uncaughtException', (err) => {
    captureException(err, { mechanism: 'uncaughtException' });
  });
}

export const init = sdk.init.bind(sdk);
export const captureException = sdk.captureException.bind(sdk);
export const captureMessage = sdk.captureMessage.bind(sdk);
export const withScope = sdk.withScope.bind(sdk);
export const flush = (sdk.flush ?? (async () => true)).bind(sdk);
export const startSpan = (sdk.startSpan ?? ((_: any, cb: any) => cb())).bind(sdk);

export default {
  init,
  captureException,
  captureMessage,
  withScope,
  flush,
  startSpan,
};

// Lightweight fetch instrumentation
if (typeof globalThis.fetch === 'function' && process.env.SENTRY_DSN) {
  const originalFetch = globalThis.fetch.bind(globalThis);
  if (!(originalFetch as any).__sentry_wrapped__) {
    const wrapped = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      try {
        const res = await originalFetch(...args);
        if (!res.ok && res.status >= 400) {
          captureMessage(`fetch ${args[0]} -> ${res.status}`, {
            level: res.status >= 500 ? 'error' : 'warning',
            extra: { url: args[0], status: res.status },
          });
        }
        return res;
      } catch (err) {
        captureException(err, { extra: { url: args[0] } });
        throw err;
      }
    };
    (wrapped as any).__sentry_wrapped__ = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.fetch = wrapped;
  }
}

// Browser global error hooks -------------------------------------------------
if (typeof globalThis.addEventListener === 'function' && process.env.SENTRY_DSN) {
  const handler = (event: ErrorEvent) => {
    try {
      // Avoid duplicate reporting when Sentry SDK already captured.
      captureException(event.error ?? new Error(event.message), {
        mechanism: 'window.onerror',
        extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
      });
    } catch {}
  };
  if (!(globalThis as any).__sentry_window_error__) {
    globalThis.addEventListener('error', handler);
    (globalThis as any).__sentry_window_error__ = true;
  }

  const rejection = (event: PromiseRejectionEvent) => {
    try {
      captureException(event.reason, { mechanism: 'unhandledrejection' });
    } catch {}
  };
  if (!(globalThis as any).__sentry_window_rejection__) {
    globalThis.addEventListener('unhandledrejection', rejection);
    (globalThis as any).__sentry_window_rejection__ = true;
  }
}
