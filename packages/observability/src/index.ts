export * from './telemetry';
export * from './dryrun';

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

function startTrace(name: string, payload?: ObservabilityPayload): { id: string; name: string; payload: Record<string, unknown> } {
  return {
    id: `${name}:${Date.now()}`,
    name,
    payload: toPayloadObject(payload),
  };
}

function endTrace(_trace?: unknown): void {}

function createSpan(name: string, payload?: ObservabilityPayload) {
  return {
    id: `${name}:${Date.now()}`,
    name,
    payload: toPayloadObject(payload),
    setTag: (_key: string, _value: unknown) => {},
    setStatus: (_status: string) => {},
    finish: () => {},
  };
}

export const observability = {
  init,
  recordMetric,
  recordError,
  recordEvent,
  startTrace,
  endTrace,
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
export * from './product-analytics';
