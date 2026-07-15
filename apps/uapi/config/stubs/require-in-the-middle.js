/**
 * Stub for `require-in-the-middle` used to silence webpack warnings when bundling
 * server instrumentation packages.  The real module is only needed when hooking
 * into Node's module loader; for our build we can safely provide a no-op.
 */
module.exports = function requireInTheMiddleStub() {
  return {
    // Provide minimal interface expected by dependents
    register() {},
    unregister() {},
  };
};
