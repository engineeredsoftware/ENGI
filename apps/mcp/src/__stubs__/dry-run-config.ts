export function createDryRunContext() {
  return {
    isDryRun: true,
    features: {
      tools: true,
      resources: true,
      prompts: true,
      streaming: true,
    },
    authentication: {
      required: false,
      methods: [],
    },
    generateMockResponse: async () => ({
      success: true,
      data: 'Mock dry run response',
    }),
  };
}

export function getDryRunConfig() {
  return {
    enabled: true,
    mode: 'test',
    features: ['all'],
  };
}
