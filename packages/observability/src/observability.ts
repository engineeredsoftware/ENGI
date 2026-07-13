import { startSpan } from '@bitcode/external-telemetry-sentry';

// Friendly helper to measure a block of async work.  Automatically becomes a
// no-op when the Sentry SDK or DSN is not available.

export async function trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return startSpan({ name }, fn);
}

// ---------------------------------------------------------------------------
// helper: tracedGenerateText (for calls using 'ai' generateText)
// ---------------------------------------------------------------------------

import { generateText as rawGenerateText } from 'ai';

export async function generateTextTraced(args: any): Promise<any> {
  const modelName = (args?.model?.model ?? args?.model?.id ?? 'unknown') as string;
  return trace(`llm:generateText:${modelName}`, () => rawGenerateText(args as any) as Promise<any>);
}

// ---------------------------------------------------------------------------
// Wrapper helper for Next.js route handlers
// ---------------------------------------------------------------------------

import { reportError, toHttpResponse } from '@bitcode/errors';

export function traceRoute<T extends (...args: any[]) => any>(name: string, fn: T): T {
  return (async (...args: any[]) => {
    try {
      return await trace(`api:${name}`, () => fn(...(args as any)));
    } catch (err) {
      const { status, body } = toHttpResponse(reportError(err));
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }) as any;
    }
  }) as unknown as T;
}

// ---------------------------------------------------------------------------
// helper: Step-level tracing (Plan / Generate / Refine / …)
// ---------------------------------------------------------------------------

export async function traceStep<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return trace(`step:${name}`, fn);
}

type ObservabilityPayload = Record<string, unknown> | number | string | boolean | Error | undefined;

function toPayloadObject(payload: ObservabilityPayload): Record<string, unknown> {
  if (payload instanceof Error) {
    return {
      message: payload.message,
      stack: payload.stack,
      name: payload.name,
    };
  }
  if (typeof payload === 'number') {
    return { value: payload };
  }
  if (typeof payload === 'string' || typeof payload === 'boolean') {
    return { value: payload };
  }
  if (payload && typeof payload === 'object') {
    return payload;
  }
  return {};
}

async function init(config?: Record<string, unknown>): Promise<void> {
  void config;
}

function recordMetric(name: string, payload?: ObservabilityPayload): void {
  void name;
  void payload;
}

function recordError(name: string, payload?: ObservabilityPayload): void {
  void name;
  void payload;
}

function recordEvent(name: string, payload?: ObservabilityPayload): void {
  void name;
  void payload;
}

type ObservabilitySpan = {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  recordException: (error: Error) => void;
  setAttribute: (key: string, value: unknown) => void;
  setStatus: (status: string) => void;
  end: () => void;
  finish: () => void;
};

function startNoopSpan(name: string, payload?: ObservabilityPayload): ObservabilitySpan {
  return {
    id: `${name}:${Date.now()}`,
    name,
    payload: toPayloadObject(payload),
    recordException: (_error: Error) => {},
    setAttribute: (_key: string, _value: unknown) => {},
    setStatus: (_status: string) => {},
    end: () => {},
    finish: () => {},
  };
}

function createSpan(name: string, payload?: ObservabilityPayload): ObservabilitySpan {
  return startNoopSpan(name, payload);
}

export const observability = {
  init,
  recordMetric,
  recordError,
  recordEvent,
  startSpan: startNoopSpan,
  createSpan,
};

export const metrics = {
  increment(name: string, value = 1, tags?: Record<string, unknown>) {
    recordMetric(name, { value, ...(tags || {}) });
  },
  recordToolExecution(payload: Record<string, unknown>) {
    recordMetric('tool_execution', payload);
  },
  recordMetric,
  recordEvent,
  recordError,
};

export const telemetry = {
  recordEvent,
  recordMetric,
  recordError,
};
