"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDryRunContext = createDryRunContext;
exports.getDryRunConfig = getDryRunConfig;
function createDryRunContext() {
    return {
        isDryRun: true,
        features: {
            tools: true,
            resources: true,
            prompts: true,
            streaming: true
  },
        authentication: {
            required: false,
            methods: []
  },
        generateMockResponse: async () => ({
            success: true,
            data: 'Mock dry run response'
  })
  };
}
function getDryRunConfig() {
    return {
        enabled: true,
        mode: 'test',
        features: ['all']
  };
}
