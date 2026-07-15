module.exports = {
  trace: async (_name, fn) => fn(),
  traceRoute: (_name, fn) => fn,
  traceStep: async (_name, fn) => fn(),
  generateTextTraced: async (...args) => {
    if (args.length === 1 && typeof args[0] === 'function') {
      return args[0]();
    }
    return undefined;
  },
};
