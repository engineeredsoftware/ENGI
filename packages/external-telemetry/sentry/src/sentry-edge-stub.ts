/**
 * Sentry stub for Edge Runtime
 * Provides no-op functions so logger can work in middleware
 */

const noop = () => {};
const asyncNoop = async () => true;

export const init = noop;
export const captureException = noop;
export const captureMessage = noop;
export const withScope = (cb: any) => cb({});
export const flush = asyncNoop;
export const startSpan = (_: any, cb: any) => cb();

export default {
  init,
  captureException,
  captureMessage,
  withScope,
  flush,
  startSpan
};
