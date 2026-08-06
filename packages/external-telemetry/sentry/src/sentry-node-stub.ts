// Stub for @sentry/node to prevent Edge Runtime bundling issues

const stub = {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  withScope: (cb: any) => cb({}),
  flush: async () => true,
  startSpan: (_: any, cb: any) => cb(),
};

export default stub;
export const init = stub.init;
export const captureException = stub.captureException;
export const captureMessage = stub.captureMessage;
export const withScope = stub.withScope;
export const flush = stub.flush;
export const startSpan = stub.startSpan;