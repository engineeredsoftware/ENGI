type Timestamp = number;

function now(): Timestamp {
  return Date.now();
}

function minutesAgo(minutes: number): Timestamp {
  return now() - minutes * 60 * 1000;
}

export async function getDeployment(params: { idOrUrl: string; teamId: string }): Promise<any> {
  return {
    id: params.idOrUrl,
    projectId: 'prj_Yapper',
    teamId: params.teamId,
    target: 'production',
    createdAt: minutesAgo(42),
    readyState: 'READY',
    url: 'yapper-prod.vercel.app',
    inspectorUrl: 'https://vercel.com/bitcode/yapper/insights',
    meta: {
      gitCommitMessage: 'feat: add waveform recorder',
      gitCommitAuthorName: 'Olivia Builder',
      frameworks: ['nextjs'],
      regions: ['iad1', 'sfo1']
    }
  };
}

export async function getDeploymentEvents(params: { idOrUrl: string; teamId: string }): Promise<any> {
  return {
    id: params.idOrUrl,
    teamId: params.teamId,
    events: [
      { type: 'BUILD_STEP', message: 'Queued build (Next.js)', timestamp: minutesAgo(44) },
      { type: 'LOG', message: 'Compiled successfully in 32s', timestamp: minutesAgo(43) },
      { type: 'DEPLOYMENT_READY', message: 'Deployment promoted to production', timestamp: minutesAgo(42) }
    ]
  };
}

export async function listDeployments(params: { projectId: string; teamId: string; limit?: number }): Promise<any> {
  return {
    projectId: params.projectId,
    teamId: params.teamId,
    deployments: [
      {
        id: 'dpl_ready',
        target: 'production',
        state: 'READY',
        createdAt: minutesAgo(42),
        url: 'yapper-prod.vercel.app'
      },
      {
        id: 'dpl_preview',
        target: 'preview',
        state: 'READY',
        createdAt: minutesAgo(90),
        url: 'preview-yapper-git-feature.vercel.app'
      }
    ].slice(0, params.limit ?? 2)
  };
}

export async function getDeploymentBuildLogs(params: { idOrUrl: string; teamId: string; limit?: number }): Promise<any> {
  const lines = [
    { timestamp: minutesAgo(45), message: 'Cloning repository…', level: 'info' },
    { timestamp: minutesAgo(44), message: 'Installing dependencies with pnpm', level: 'info' },
    { timestamp: minutesAgo(43), message: 'Running next build', level: 'info' },
    { timestamp: minutesAgo(42), message: 'Build completed in 32s', level: 'success' }
  ];

  return {
    id: params.idOrUrl,
    teamId: params.teamId,
    logs: lines.slice(0, params.limit ?? lines.length)
  };
}

export async function listProjects(params: { teamId: string }): Promise<any> {
  return {
    teamId: params.teamId,
    projects: [
      {
        id: 'prj_Yapper',
        name: 'yapper',
        latestDeploymentUrl: 'yapper-prod.vercel.app',
        framework: 'nextjs'
      },
      {
        id: 'prj_Admin',
        name: 'bitcode-admin',
        latestDeploymentUrl: 'admin.bitcode.dev',
        framework: 'remix'
      }
    ]
  };
}

export async function getProject(params: { projectId: string; teamId: string }): Promise<any> {
  return {
    id: params.projectId,
    teamId: params.teamId,
    name: 'yapper',
    framework: 'nextjs',
    linkedGitRepository: {
      provider: 'github',
      org: 'bitcode-demo',
      repository: 'yapper'
    },
    domains: ['yapper.vercel.app', 'yapper-prod.vercel.app'],
    environmentVariables: [
      { key: 'NEXT_PUBLIC_APP_NAME', value: 'Yapper' },
      { key: 'SUPABASE_URL', value: '*****' }
    ]
  };
}

export async function searchDocumentation(params: { topic: string; tokens?: number }): Promise<any> {
  return {
    topic: params.topic,
    tokens: params.tokens ?? 2500,
    results: [
      {
        title: 'Custom Domains | Vercel Docs',
        url: 'https://vercel.com/docs/projects/domains/add-a-domain',
        snippet: 'Learn how to add and configure custom domains for your Vercel project.'
      },
      {
        title: 'Next.js on Vercel – Deployment Primitives',
        url: 'https://vercel.com/docs/frameworks/nextjs',
        snippet: 'Best practices for deploying Next.js applications on Vercel.'
      }
    ]
  };
}

export async function listTeams(): Promise<any> {
  return {
    teams: [
      { id: 'team_personal', name: 'Personal Account' },
      { id: 'team_bitcode', name: 'Bitcode Demo Org' }
    ]
  };
}

export async function deployToVercel(params: { projectId: string; teamId: string; message?: string }): Promise<any> {
  return {
    deploymentId: `dpl_${Date.now()}`,
    projectId: params.projectId,
    teamId: params.teamId,
    url: `https://${params.projectId}-${Date.now()}.vercel.app`,
    readyState: 'BUILDING',
    note: params.message ?? 'Deployment requested via Bitcode ChatGPT App.'
  };
}

export async function buyDomain(params: {
  name: string;
  expectedPrice?: number;
  contact: {
    country: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}): Promise<any> {
  return {
    domain: params.name,
    status: 'PENDING_OWNER_CONFIRMATION',
    chargedAmount: params.expectedPrice ?? 19,
    contact: params.contact,
    renew: true,
    expiresAt: now() + 365 * 24 * 60 * 60 * 1000
  };
}

export async function checkDomainAvailability(params: { names: string[] }): Promise<any> {
  const availability = params.names.map((name) => ({
    name,
    available: !name.includes('taken'),
    price: 19 + name.length
  }));

  return { availability };
}
