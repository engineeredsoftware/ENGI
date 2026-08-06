/**
 * Minimal stub for @opentelemetry/instrumentation to prevent build-time warnings.
 * The Bitcode runtime does not rely on the automatic instrumentation hooks during
 * Next.js builds, so we can safely expose no-op implementations.
 */
class InstrumentationBase {
  constructor(config = {}) {
    this._config = config;
  }
  setTracerProvider() {}
  setMeterProvider() {}
  setLoggerProvider() {}
  enable() {}
  disable() {}
}

function registerInstrumentations() {
  // No-op
}

module.exports = {
  InstrumentationBase,
  registerInstrumentations,
};
