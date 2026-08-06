// Provide a default mock for the shared logger so tests can safely depend on it.
if (typeof jest !== 'undefined') {
  jest.mock('@bitcode/logger', () => ({
    log: jest.fn(async () => ({ level: 'info', handled: true })),
    logger: jest.fn(async () => undefined),
    reinitLoggerFile: jest.fn(() => undefined),
    writePromptIO: jest.fn(async () => undefined),
    writeRawLLMIO: jest.fn(async () => undefined),
    writeStepTraceJSON: jest.fn(async () => undefined),
  }));
}
