/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('@bitcode/api/src/vcs/github-service', () => ({
  GitHubService: {
    getValidAuth: jest.fn(async () => ({ accessToken: 'ghs_installation_token' })),
  },
}));

jest.mock('@bitcode/pipelines-generics', () => ({
  createStreamingExecution: jest.fn(),
  emitPhaseTransition: jest.fn(async () => undefined),
}));

jest.mock('@bitcode/execution-generics', () => ({
  ExecutionStreamAdapter: {
    emitEvent: jest.fn(async () => undefined),
    unregisterStreamer: jest.fn(),
  },
}));

// V48-Gate3-F31: the route's background continuations (the sweep + the
// synthesis run itself) must be registered via waitUntil, not dispatched as
// a bare `void promise`, or Vercel is free to freeze this Function instance
// before they finish. The spy passes the promise through unchanged so the
// rest of this suite's behavior (flushBackground) is unaffected.
jest.mock('@vercel/functions', () => ({
  waitUntil: jest.fn((promise: Promise<unknown>) => promise),
}));

jest.mock('@bitcode/pipeline-asset-pack/runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: jest.fn(() => true),
}));

// Mock the heavy pipeline INDEX so its phase graph (phases/*) does not load in the
// uapi jest env. The deposit route runs the full SDIVF pipeline here; we assert it
// is dispatched + that its persisted output is built from the real lens adapter.
// Also stub neediness grounding (settled Depository search) for unit isolation.
jest.mock('@bitcode/pipeline-asset-pack', () => ({
  synthesizeAssetPacksPipeline: jest.fn(async () => undefined),
  groundOptionNeedinessFromSettledDepository: jest.fn((options: unknown[]) => options),
}));

// The Host provisioning (full checkout) is mocked: we assert the route provisions on
// a Host and feeds the full inventory to the pipeline (no real git clone in jest).
jest.mock('@/lib/deposit-source-provisioning', () => ({
  resolveDepositPipelineHost: jest.fn(() => ({ capabilities: { hostKind: 'local' } })),
  provisionDepositSourceInventory: jest.fn(),
  selectDepositHostKind: jest.fn(() => 'local'),
  runDepositInBoxHost: jest.fn(),
}));

// Settled-Depository demand grounding after synthesis (empty corpus → Unestimatable).
jest.mock('@/lib/depository-settled-demand', () => ({
  loadSettledDepositoryPacks: jest.fn(async () => []),
  loadDepositorySettledDemandEstimate: jest.fn(async () => ({
    estimatable: false,
    state: 'unestimatable-demand',
    demand: null,
    saturation: null,
    needinessVolume: null,
    settledPackCount: 0,
    matchedPackCount: 0,
    rationale: 'Unestimatable: test fixture has no settled packs.',
    matchedPackIds: [],
  })),
  settledDemandEstimateToSignals: jest.fn(() => ({
    depositoryDemandSignals: [],
    readingDemandSignals: [],
    existingDepositorySignals: [],
    unfitNeedOpportunitySignals: [],
  })),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { createStreamingExecution } from '@bitcode/pipelines-generics';
import { synthesizeAssetPacksPipeline } from '@bitcode/pipeline-asset-pack';
import { isAssetPackRealInferenceEnabled } from '@bitcode/pipeline-asset-pack/runtime-inference-policy';
import {
  provisionDepositSourceInventory,
  runDepositInBoxHost,
  selectDepositHostKind,
} from '@/lib/deposit-source-provisioning';
import { waitUntil } from '@vercel/functions';
import { POST } from '@/app/api/deposit/synthesize-options/route';

const mockRealInference = isAssetPackRealInferenceEnabled as jest.Mock;
const mockPipeline = synthesizeAssetPacksPipeline as jest.Mock;
const mockCreateExecution = createStreamingExecution as jest.Mock;
const mockProvision = provisionDepositSourceInventory as jest.Mock;
const mockSelectKind = selectDepositHostKind as jest.Mock;
const mockRunHost = runDepositInBoxHost as jest.Mock;
const mockWaitUntil = waitUntil as jest.Mock;

// The synthesized options the pipeline leaves at implementation:options. The route's
// validateDepositSynthesisOptions (real) turns these into measured deposit options.
const RAW_OPTIONS = [
  {
    kind: 'capability-slice',
    title: 'Demo Python capability slice',
    summary:
      'A source-safe slice describing the demo application capability, its entry points, and operational behavior for future reading demand.',
    coveredSourcePaths: ['README.md', 'src/app.py'],
    // Formal absolutes (Validation measure-agent) are required by product projection.
    absolutes: [
      {
        measurementKind: 'function-count',
        label: 'Functions',
        weight: 0.12,
        volume: 0.5,
        category: 'absolute',
        magnitude: 6,
        unit: 'functions',
      },
      {
        measurementKind: 'correctness-estimate',
        label: 'Correctness',
        weight: 0.18,
        volume: 0.72,
        category: 'absolute',
        unit: 'estimate',
      },
    ],
    measurementRationale: 'Covers the primary application path and documentation.',
    confidence: 0.8,
    patch: {
      fileChanges: [{ path: 'src/app.py', op: 'modify' }],
      patchSummary: 'Encodes the demo application capability and its entry points.',
    },
  },
];

function installExecutionMock(options: { failPipeline?: boolean } = {}) {
  if (options.failPipeline) {
    mockPipeline.mockRejectedValueOnce(new Error('pipeline boom'));
  } else {
    mockPipeline.mockResolvedValueOnce(undefined);
  }
  const execution = {
    id: 'streaming-execution-1',
    store: jest.fn(),
    child: jest.fn(),
    get: jest.fn((namespace: string, key: string) =>
      namespace === 'implementation' && key === 'options' ? RAW_OPTIONS : undefined,
    ),
    findUp: jest.fn(),
  };
  mockCreateExecution.mockReturnValue(execution);
  return execution;
}

function installSupabaseMocks(options: {
  user?: { id: string } | null;
  ownedRepository?: Record<string, unknown> | null;
  githubConnection?: Record<string, unknown> | null;
}) {
  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: Object.prototype.hasOwnProperty.call(options, 'user') ? options.user : { id: 'user-1' },
        },
        error: null,
      }),
    },
  });

  // Executions builder: the dispatch guard SELECTs the runId first (no
  // existing row by default), then the dispatch/finalize upserts write rows.
  const executionRow = {
    upsert: jest.fn().mockResolvedValue({ error: null }),
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  executionRow.select.mockReturnValue(executionRow);
  executionRow.eq.mockReturnValue(executionRow);

  (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'vcs_repositories') {
      const builder = {
        select: jest.fn(),
        eq: jest.fn(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: Object.prototype.hasOwnProperty.call(options, 'ownedRepository')
            ? options.ownedRepository
            : { repo_full_name: 'engineeredsoftware/demo-python' },
          error: null,
        }),
      };
      builder.select.mockReturnValue(builder);
      builder.eq.mockReturnValue(builder);
      return builder;
    }
    if (table === 'user_connections') {
      const builder = {
        select: jest.fn(),
        eq: jest.fn(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: Object.prototype.hasOwnProperty.call(options, 'githubConnection')
            ? options.githubConnection
            : { connection_data: { connectionId: '139922918', access_token: 'token' } },
          error: null,
        }),
      };
      builder.select.mockReturnValue(builder);
      builder.eq.mockReturnValue(builder);
      return builder;
    }
    if (table === 'executions') return executionRow;
    throw new Error(`Unexpected table ${table}`);
  });

  return { executionRow };
}

// The full checkout the Host provisions (incl. an excluded secret/ path the route
// must withhold). The route applies protected-IP exclusions to it.
const PROVISIONED = {
  paths: ['README.md', 'src/app.py', 'secret/keys.py'],
  samples: [{ path: 'README.md', excerpt: 'A demo python project.' }],
  sources: [
    { path: 'README.md', content: 'A demo python project.' },
    { path: 'src/app.py', content: 'def main():\n    pass' },
    { path: 'secret/keys.py', content: 'KEY = 1' },
  ],
  truncated: false,
};

function createRequest(overrides: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/deposit/synthesize-options', {
    method: 'POST',
    body: JSON.stringify({
      repositoryFullName: 'engineeredsoftware/demo-python',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      obfuscations: 'demo instructions',
      forcedExclusions: 'secret/',
      ...overrides,
    }),
  });
}

// The route dispatches the synthesis as a background run (void runSynthesis()).
// Flush macrotasks until the predicate holds (or give up after a bound).
async function flushBackground(predicate: () => boolean, max = 50) {
  for (let i = 0; i < max; i += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
}

describe('POST /api/deposit/synthesize-options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset queued .once() implementations (clearAllMocks does not) so a pipeline/
    // host mock queued by one test never leaks into the next.
    mockPipeline.mockReset();
    mockRunHost.mockReset();
    mockRealInference.mockReturnValue(true);
    mockProvision.mockResolvedValue(PROVISIONED);
    mockSelectKind.mockReturnValue('local');
  });

  it('requires a session', async () => {
    installSupabaseMocks({ user: null });
    const response = await POST(createRequest());
    expect(response.status).toBe(401);
  });

  it('fails closed when real inference is disabled', async () => {
    installSupabaseMocks({});
    mockRealInference.mockReturnValue(false);
    const response = await POST(createRequest());
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'real_inference_required' }),
    );
  });

  it('rejects repositories outside the connected inventory', async () => {
    installSupabaseMocks({ ownedRepository: null });
    const response = await POST(createRequest());
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'repository_not_connected' }),
    );
  });

  it('dispatches the full pipeline and persists measured options with decision payload', async () => {
    const { executionRow } = installSupabaseMocks({});
    installExecutionMock();

    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.status).toBe('dispatched');
    expect(payload.runId).toMatch(/^[0-9a-f-]{36}$/i);

    // The background run completes: the full pipeline ran, options were validated +
    // built from the real lens adapter, and the completed row was persisted.
    await flushBackground(() =>
      executionRow.upsert.mock.calls.some((call) => call[0]?.status === 'completed'),
    );
    expect(mockPipeline).toHaveBeenCalledTimes(1);
    // The route provisioned the full checkout on the Host (clone URL + revision + token).
    expect(mockProvision).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://github.com/engineeredsoftware/demo-python.git',
        revision: 'abc123',
        token: 'ghs_installation_token',
      }),
    );
    // The pipeline received the exclusion-filtered inventory (secret/ withheld) —
    // both the path list AND the full verbatim source.
    const pipelineInput = mockPipeline.mock.calls[0][0];
    expect(pipelineInput.mode).toBe('deposit');
    expect(pipelineInput.inventory.paths).toEqual(['README.md', 'src/app.py']);
    expect(pipelineInput.inventory.sources.map((s: any) => s.path)).toEqual(['README.md', 'src/app.py']);
    expect(pipelineInput.forcedExclusions).toEqual(['secret/']);
    expect(pipelineInput.forcedInclusions).toEqual([]);

    const completed = executionRow.upsert.mock.calls.find((call) => call[0]?.status === 'completed')![0];
    expect(completed.context.pipelineCore).toBe('AssetPacksSynthesis');
    expect(completed.output.depositOptionSynthesis.optionCount).toBe(1);
    // The deposit-decision payload: synthesized contents + provenant source.
    const option = completed.output.depositOptionSynthesis.options[0];
    expect(option.contents.provenantSourcePaths).toEqual(['README.md', 'src/app.py']);
    expect(option.contents.fileChanges).toEqual([{ path: 'src/app.py', op: 'modify' }]);
    expect(completed.output.reviewProjections[0].coveredSourcePaths).toEqual(['README.md', 'src/app.py']);
  });

  it('scopes inventory by Forced Inclusion roots before the pipeline runs', async () => {
    const { executionRow } = installSupabaseMocks({});
    // Options must only cover in-scope paths so Validation admits them.
    mockPipeline.mockResolvedValueOnce(undefined);
    const execution = {
      id: 'streaming-execution-scope',
      store: jest.fn(),
      child: jest.fn(),
      get: jest.fn((namespace: string, key: string) =>
        namespace === 'implementation' && key === 'options'
          ? [
              {
                ...RAW_OPTIONS[0],
                coveredSourcePaths: ['src/app.py'],
                patch: {
                  fileChanges: [{ path: 'src/app.py', op: 'modify' }],
                  patchSummary: 'Scoped capability under Forced Inclusion.',
                },
              },
            ]
          : undefined,
      ),
      findUp: jest.fn(),
    };
    mockCreateExecution.mockReturnValue(execution);

    const response = await POST(
      createRequest({
        forcedInclusions: ['src/'],
        forcedExclusions: [],
      }),
    );
    expect(response.status).toBe(200);
    await flushBackground(() =>
      executionRow.upsert.mock.calls.some((call) => call[0]?.status === 'completed'),
    );
    const pipelineInput = mockPipeline.mock.calls[0][0];
    expect(pipelineInput.forcedInclusions).toEqual(['src/']);
    expect(pipelineInput.inventory.paths).toEqual(['src/app.py']);
    expect(pipelineInput.inventory.sources.map((s: any) => s.path)).toEqual(['src/app.py']);
  });

  it('registers both the orphan sweep and the synthesis run via waitUntil (V48-Gate3-F31)', async () => {
    const { executionRow } = installSupabaseMocks({});
    installExecutionMock();

    await POST(createRequest());
    await flushBackground(() =>
      executionRow.upsert.mock.calls.some((call) => call[0]?.status === 'completed'),
    );

    // Bare `void promise` dispatch (no waitUntil) is exactly what let a
    // Vercel Function instance be frozen/recycled mid-run before this fix —
    // the run's own execution row is the evidence trail, but nothing forced
    // the box to stay alive to write it. Pin that both continuations go
    // through waitUntil so this can't silently regress back to bare void.
    expect(mockWaitUntil).toHaveBeenCalledTimes(2);
    mockWaitUntil.mock.calls.forEach(([passed]) => {
      expect(passed).toBeInstanceOf(Promise);
    });
  });

  it('runs the synthesis in-box on the sandbox host when configured (#25)', async () => {
    const { executionRow } = installSupabaseMocks({});
    installExecutionMock();
    mockSelectKind.mockReturnValue('sandbox');
    mockRunHost.mockResolvedValue({
      options: RAW_OPTIONS,
      sandboxId: 'sbx_deposit_test',
      outcome: 'completed',
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);

    await flushBackground(() =>
      executionRow.upsert.mock.calls.some((call) => call[0]?.status === 'completed'),
    );
    // Dispatched to the in-box host; the in-process pipeline + provisioning were NOT run.
    expect(mockRunHost).toHaveBeenCalledTimes(1);
    expect(mockPipeline).not.toHaveBeenCalled();
    expect(mockProvision).not.toHaveBeenCalled();
    const completed = executionRow.upsert.mock.calls.find((call) => call[0]?.status === 'completed')![0];
    expect(completed.output.depositOptionSynthesis.optionCount).toBe(1);
    expect(completed.output.depositOptionSynthesis.options[0].contents.provenantSourcePaths).toEqual([
      'README.md',
      'src/app.py',
    ]);
  });

  it('persists a failed row when the background synthesis throws', async () => {
    const { executionRow } = installSupabaseMocks({});
    installExecutionMock({ failPipeline: true });

    const response = await POST(createRequest());
    // The route still dispatches; the failure is handled in the background run.
    expect(response.status).toBe(200);

    await flushBackground(() =>
      executionRow.upsert.mock.calls.some((call) => call[0]?.status === 'failed'),
    );
    const failed = executionRow.upsert.mock.calls.find((call) => call[0]?.status === 'failed')![0];
    expect(failed.status).toBe('failed');
    expect(failed.error.message).toContain('pipeline boom');
  });
});
