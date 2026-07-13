/**
 * @jest-environment node
 *
 * Verifies that notifications are skipped unless BITCODE_ENABLE_NOTIFICATIONS==='true'.
 */

// Mock Supabase auth to return a user
jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'u@example.com', user_metadata: {} } }, error: null }) }
  })
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock ORM with notifications.create spy
const notificationsCreate = jest.fn();
const pipelineExecutionsCreate = jest.fn().mockResolvedValue({ id: 'fixed-corr' });
const executionEventsCreate = jest.fn().mockResolvedValue({});
const pipelineRunsUpdate = jest.fn().mockResolvedValue({});
jest.mock('@bitcode/orm', () => ({
  createAdminClient: () => ({
    pipelineExecutions: { create: pipelineExecutionsCreate, update: jest.fn() },
    executionEvents: { create: executionEventsCreate },
    pipelineRuns: { update: pipelineRunsUpdate },
    notifications: { create: notificationsCreate },
    userConnections: { getByUserAndProvider: jest.fn().mockResolvedValue({ connection_data: { installation_id: 1 } }) }
  })
}));

// Mock VCS service factory used by packages/api
jest.mock('@bitcode/vcs', () => ({ VCSService: class { constructor(_: any) {} } }));

// Mock models and wallet/share posture
jest.mock('@bitcode/models', () => ({
  DEFAULT_PROVIDER: 'openai',
  DEFAULT_MODEL_API: 'gpt-4o',
  getUsdPricingForApiModel: jest.fn(() => ({ input: 1, output: 1 })),
  getModelPricing: () => ({ multiplier: 1 }),
  defaultModelPricing: { provider: 'openai', model: 'gpt-4o' },
}));
jest.mock('@bitcode/btd', () => ({
  BITCODE_FEE_ASSET: 'BTC',
  BTD_ASSET_SEMANTICS: 'non_fungible_asset_pack_share_read_right',
}));
jest.mock('@bitcode/logger', () => ({
  log: jest.fn(),
  reinitLoggerFile: jest.fn(),
}));

// Mock GA telemetry to no-op
jest.mock('@bitcode/google-analytics', () => ({ sendServerEvent: jest.fn() }));
jest.mock('@bitcode/email', () => ({ sendEmail: jest.fn() }));
jest.mock('@bitcode/asset-packs-pipelines-domain', () => ({ assetPackPipeline: jest.fn().mockResolvedValue({}) }));
jest.mock('@bitcode/generic-llms', () => ({ factoryLLMRegistryWithProviders: jest.fn(() => ({})) }));
jest.mock('@bitcode/execution-generics', () => ({
  Execution: jest.fn().mockImplementation(() => ({
    id: 'fixed-corr',
    set: jest.fn(),
    store: jest.fn(),
    get: jest.fn(),
  })),
  ExecutionStreamAdapter: jest.fn(),
  NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH: 'validation-rts',
}));
jest.mock('@bitcode/pipelines-generics/src/execution/PipelineExecution', () => ({
  PipelineExecution: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@bitcode/errors', () => ({
  BitcodeError: class BitcodeError extends Error {},
  reportError: jest.fn((error: unknown) =>
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error))
  ),
}));
jest.mock('@bitcode/responses', () => ({
  createJsonResponse: (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  createErrorResponse: (error: any, status = 500) =>
    new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  createAuthErrorResponse: () =>
    new Response(JSON.stringify({ error: 'auth' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
}));
jest.mock('@bitcode/streams', () => ({
  Streamer: jest.fn().mockImplementation(() => ({
    subscribe: jest.fn(),
    push: jest.fn(),
    close: jest.fn(),
    complete: jest.fn(),
    toResponse: () => new Response('', { status: 200 }),
  })),
}));

describe('POST /api/executions notifications gating', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.BITCODE_ENABLE_NOTIFICATIONS;
    process.env.LONG_RUNNER_QUEUE = 'true';
    jest.spyOn(require('crypto'), 'randomUUID').mockReturnValue('fixed-corr');
  });

  it('does not create notifications when flag is not enabled', async () => {
    const { POST } = await import('@/app/api/executions/route');
    const req = new Request('http://localhost/api/executions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        definition_of_read: 'x', repoOwner: 'o', repoName: 'r', repoBranch: 'main', attachments: []
      })
    });
    const res = await POST(req);
    const payload = await res.json();
    expect({ status: res.status, payload }).toEqual({
      status: 202,
      payload: { runId: 'fixed-corr', status: 'queued' },
    });
    expect(notificationsCreate).not.toHaveBeenCalled();
  });
});
