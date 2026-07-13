type ToolExecutor<TInput extends Record<string, unknown>, TResult extends Record<string, unknown>> = {
  execute: (input?: TInput) => Promise<TResult>;
};

function createTool<TInput extends Record<string, unknown>, TResult extends Record<string, unknown>>(
  handler: (input?: TInput) => TResult
): ToolExecutor<TInput, TResult> {
  return {
    async execute(input) {
      return handler(input);
    }
  };
}

export const vercelListTeamsTool = createTool(() => ({
  teams: [{ id: 'team_bitcode', name: 'Bitcode Builders' }]
}));

export const vercelListProjectsTool = createTool(() => ({
  projects: [{ id: 'prj_Yapper', name: 'Yapper', framework: 'nextjs' }]
}));

export const vercelGetProjectTool = createTool(() => ({
  id: 'prj_Yapper',
  name: 'Yapper',
  targets: ['production'],
  links: [{ rel: 'repo', href: 'https://github.com/bitcode-labs/yapper' }]
}));

export const vercelListDeploymentsTool = createTool(() => ({
  deployments: [{ id: 'dep_1', readyState: 'READY', target: 'production' }]
}));

export const vercelGetDeploymentTool = createTool(() => ({
  id: 'dep_1',
  readyState: 'READY',
  name: 'yapper-production'
}));

export const vercelGetDeploymentEventsTool = createTool(() => ({
  events: [{ type: 'BUILDING', createdAt: new Date().toISOString() }]
}));

export const vercelGetDeploymentBuildLogsTool = createTool(() => ({
  logs: ['Log line 1', 'Log line 2']
}));

export const vercelSearchDocumentationTool = createTool(() => ({
  hits: [{ title: 'Mock doc', url: 'https://vercel.com/docs/mock' }]
}));

export const vercelDeployProjectTool = createTool(() => ({
  id: 'dep_mock',
  readyState: 'BUILDING',
  inspectorUrl: 'https://vercel.com/mock'
}));

export const vercelBuyDomainTool = createTool(() => ({
  domain: 'yapper.app',
  status: 'PENDING'
}));

export const vercelCheckDomainAvailabilityTool = createTool(() => ({
  available: true,
  domain: 'yapper.app'
}));
