/**
 * @param {any} value
 * @param {number} [depth=0]
 * @returns {any}
 */
function summarize(value, depth = 0) {
  if (value == null) return value;
  if (depth > 2) return '[max-depth]';
  if (Array.isArray(value)) {
    return {
      kind: 'array',
      length: value.length,
      sample: value.slice(0, 3).map((item) => summarize(item, depth + 1))
    };
  }
  if (typeof value === 'object') {
    /** @type {Record<string, any>} */
    const out = {};
    for (const [key, entry] of Object.entries(value).slice(0, 12)) {
      if (typeof entry === 'string' && entry.length > 180) {
        out[key] = `${entry.slice(0, 180)}…`;
      } else {
        out[key] = summarize(entry, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/**
 * @param {string} level
 * @param {string} event
 * @param {Record<string, any>} [fields={}]
 * @returns {void}
 */
function emit(level, event, fields = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else console.log(line);
}

/**
 * @param {string} event
 * @param {Record<string, any>} [fields={}]
 * @returns {void}
 */
export function telemetry(event, fields = {}) {
  emit('info', event, summarize(fields));
}

/**
 * @param {string} event
 * @param {any} error
 * @param {Record<string, any>} [fields={}]
 * @returns {void}
 */
export function telemetryError(event, error, fields = {}) {
  emit('error', event, {
    ...summarize(fields),
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 6).join('\n')
    }
  });
}

/**
 * @param {string} event
 * @param {any} input
 * @param {() => any} fn
 * @returns {any}
 */
export function telemetrySpan(event, input, fn) {
  const startedAt = Date.now();
  telemetry(`${event}.start`, { input });
  try {
    const output = /** @type {any} */ (fn());
    if (output && typeof output.then === 'function') {
      return output.then((/** @type {any} */ resolved) => {
        telemetry(`${event}.ok`, { input, output: resolved, durationMs: Date.now() - startedAt });
        return resolved;
      }).catch((/** @type {any} */ error) => {
        telemetryError(`${event}.error`, error, { input, durationMs: Date.now() - startedAt });
        throw error;
      });
    }
    telemetry(`${event}.ok`, { input, output, durationMs: Date.now() - startedAt });
    return output;
  } catch (error) {
    telemetryError(`${event}.error`, error, { input, durationMs: Date.now() - startedAt });
    throw error;
  }
}
