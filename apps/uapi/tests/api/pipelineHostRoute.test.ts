/**
 * @jest-environment node
 */

const mockGetUser = jest.fn();
const mockBuildAssetPackSandboxHost = jest.fn();
const mockLoadVercelSandboxFactory = jest.fn();
let mockHostOptions: { onEvent?: (event: unknown) => void | Promise<void> } | null = null;
let mockCapturedPlan: any = null;

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

jest.mock('@bitcode/vcs-generics', () => ({
  VCSConnections: jest.fn(),
}));

jest.mock('@bitcode/pipeline-hosts', () => ({
  buildAssetPackSandboxHostPlan: (...args: unknown[]) => mockBuildAssetPackSandboxHost(...args),
  loadVercelSandboxFactory: (...args: unknown[]) => mockLoadVercelSandboxFactory(...args),
  VercelSandboxPipelineHost: class {
    constructor(options: { onEvent?: (event: unknown) => void | Promise<void> }) {
      mockHostOptions = options;
    }

    async runHostPlan(plan: unknown) {
      mockCapturedPlan = plan;
      await mockHostOptions?.onEvent?.({
        type: 'sandbox-created',
        timestamp: '2026-05-18T10:30:00.000Z',
        sandboxId: 'sbx-local-route-test',
        status: 'running',
      });
      return {
        sandboxId: 'sbx-local-route-test',
        finalStatus: 'stopped',
        manifest: (plan as { manifest?: unknown }).manifest,
        commands: [
          {
            label: 'asset-pack-pipeline-run',
            cmd: 'pnpm',
            args: ['qa'],
            exitCode: 0,
            stdout: `used ${process.env.OPENAI_API_KEY}`,
            stderr: `kept ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            startedAt: '2026-05-18T10:30:01.000Z',
            completedAt: '2026-05-18T10:30:02.000Z',
          },
        ],
        artifacts: {
          evidence: {
            schema: 'bitcode.pipeline-host.evidence',
            resultState: 'blocked_readiness',
            output: {
              fitResult: {
                resultState: 'worthy_fit',
                selectedCandidateAssetIds: ['asset-repository-revision'],
              },
              depositorySearch: {
                searchedAssetCount: 1,
              },
              ledgerSettlement: {
                status: 'blocked',
                protectedSourceUnlock: {
                  schema: 'bitcode.asset-pack.settlement-unlock',
                  state: 'denied',
                  sourceAvailable: false,
                  reason: 'settlement blocked in route test',
                },
              },
              sourceSafePreview: {
                schema: 'bitcode.asset-pack.source-safe-preview',
                assetPackId: 'asset-pack-route-test',
                feeQuote: {
                  sats: 546,
                  quoteRoot: 'sha256:route-quote-root',
                },
                unlock: {
                  state: 'denied',
                  sourceAvailable: false,
                  reason: 'settlement blocked in route test',
                },
              },
              assetPackPreviewBoundary: {
                schema: 'bitcode.asset-pack.preview-boundary',
                boundaryId: 'asset-pack-preview-boundary-route-test',
                assetPackId: 'asset-pack-route-test',
                quoteReceipt: {
                  quoteId: 'quote-route-test',
                  deterministic: true,
                  formula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
                  needId: 'need-route-test',
                  admittedFitQuality: 0.91,
                  weightedRequestedVolume: 3,
                  weightedAdmittedVolume: 2.73,
                  sats: 546,
                  finalityState: 'preview_not_paid',
                  payer: 'reader',
                  quoteRoot: 'sha256:route-quote-root',
                  receiptRoot: 'sha256:route-quote-receipt-root',
                },
                selectedFitProvenance: {
                  resultState: 'worthy_fit',
                  selectedCandidateAssetIds: ['asset-repository-revision'],
                  fitDepositAssetIds: ['deposit-route-test'],
                  queryRoot: 'sha256:route-query-root',
                  rankingRoot: 'sha256:route-ranking-root',
                  selectedCandidates: [
                    {
                      assetId: 'asset-repository-revision',
                      finalScore: 0.91,
                      semanticScore: 0.82,
                      proofRoot: 'sha256:route-proof-root',
                      measurementRoot: 'sha256:route-measurement-root',
                      reconciliationReadbackRoot: 'sha256:route-readback-root',
                    },
                  ],
                  provenanceRoot: 'sha256:route-provenance-root',
                },
                settlementInstructions: {
                  state: 'quote_ready_settlement_required',
                  payer: 'reader',
                  payee: 'depositor',
                  btcNetwork: 'testnet',
                  sats: 546,
                  quoteRoot: 'sha256:route-quote-root',
                  serverCustody: false,
                  settlementRequiredBeforeUnlock: true,
                  instructionsRoot: 'sha256:route-instructions-root',
                },
                deliveryPosture: {
                  state: 'withheld_until_settlement',
                  deliveryMechanism: 'pull_request_after_settlement',
                  pullRequestTarget: null,
                  sourceBearingDeliveryVisible: false,
                  availableAfterSettlement: true,
                  blockerCodes: ['btc_fee_unpaid'],
                  deliveryRoot: 'sha256:route-delivery-root',
                },
                replayReceipt: {
                  replayMode: 'source-safe-preview-quote-disclosure-boundary-replay',
                  previewRoot: 'sha256:route-preview-root',
                  quoteRoot: 'sha256:route-quote-root',
                  selectedFitProvenanceRoot: 'sha256:route-provenance-root',
                  settlementInstructionsRoot: 'sha256:route-instructions-root',
                  deliveryPostureRoot: 'sha256:route-delivery-root',
                  storageRoot: 'sha256:route-storage-root',
                  replayRoot: 'sha256:route-replay-root',
                  verified: {
                    protectedSourceLeakageAbsent: true,
                  },
                },
                proofRoots: {
                  previewRoot: 'sha256:route-preview-root',
                  quoteRoot: 'sha256:route-quote-root',
                  selectedFitProvenanceRoot: 'sha256:route-provenance-root',
                  settlementInstructionsRoot: 'sha256:route-instructions-root',
                  deliveryPostureRoot: 'sha256:route-delivery-root',
                  replayRoot: 'sha256:route-replay-root',
                  boundaryRoot: 'sha256:route-boundary-root',
                },
                sourceSafety: {
                  sourceSafeMetadataOnly: true,
                  protectedSourceVisible: false,
                  unpaidAssetPackSourceVisible: false,
                  credentialsSerialized: false,
                },
                storageProjection: [
                  {
                    recordId: 'route-storage-record',
                    recordKind: 'deterministic_btc_quote',
                    namespace: 'asset-pack/preview',
                    key: 'quoteReceipt',
                    root: 'sha256:route-storage-record-root',
                    sourceSafety: {
                      sourceSafeMetadataOnly: true,
                    },
                    payload: {
                      hiddenFromRouteSummary: true,
                    },
                  },
                ],
              },
              assetPackSettlementRightsDeliveryBoundary: {
                schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary',
                boundaryId: 'asset-pack-settlement-rights-delivery-route-test',
                state: 'settlement_delivered',
                assetPackId: 'asset-pack-route-test',
                readId: 'read-route-test',
                orderId: 'order-route-test',
                previewBoundaryRoot: 'sha256:route-boundary-root',
                paymentObservation: {
                  paymentReceiptId: 'btc-fee-route-test',
                  payer: 'reader',
                  payee: 'depositor',
                  payerWalletId: 'reader-wallet-route-test',
                  payeeWalletId: 'depositor-wallet-route-test',
                  btcNetwork: 'testnet',
                  expectedSats: 546,
                  observedDebitSats: 546,
                  observedCreditSats: 546,
                  txid: 'testnet-route-txid',
                  serverCustody: false,
                  paymentReceiptRoot: 'sha256:route-payment-root',
                },
                finalityReceipt: {
                  finalityState: 'confirmed',
                  confirmations: 6,
                  blockHeight: 840000,
                  txid: 'testnet-route-txid',
                  finalityRoot: 'sha256:route-finality-root',
                },
                settlementUnlock: {
                  schema: 'bitcode.asset-pack.settlement-unlock',
                  state: 'licensed_read',
                  sourceAvailable: true,
                  reason: 'settlement delivered in route test',
                  readLicenseId: 'read-license-route-test',
                  pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/42',
                  missingReadbackKeys: [],
                },
                deliveryUnlock: {
                  schema: 'bitcode.asset-pack.delivery-unlock',
                  state: 'source_bearing_pull_request_ready',
                  deliveryMechanism: 'pull_request_after_settlement',
                  pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/42',
                  sourceBearingDeliveryVisibleToReader: true,
                  protectedSourcePayloadSerialized: false,
                  requiredReceipts: ['btc_payment_observation', 'btd_rights_transfer'],
                  blockerCodes: [],
                  deliveryRoot: 'sha256:route-delivery-unlock-root',
                },
                reconciliationReport: {
                  schema: 'bitcode.ledger-database-reconciliation-report',
                  reconciliationId: 'reconciliation-route-test',
                  state: 'aligned',
                  blocking: false,
                  repairActions: [],
                  proofRoots: {
                    repairPlanRoot: 'sha256:route-reconciliation-root',
                  },
                },
                replayReceipt: {
                  schema: 'bitcode.asset-pack.settlement-rights-delivery.replay-receipt',
                  replayMode: 'settlement-rights-delivery-replay',
                  previewBoundaryRoot: 'sha256:route-boundary-root',
                  quoteRoot: 'sha256:route-quote-root',
                  paymentReceiptRoot: 'sha256:route-payment-root',
                  finalityRoot: 'sha256:route-finality-root',
                  sourceToSharesRoot: 'sha256:route-source-to-shares-root',
                  rightsTransferRoot: 'sha256:route-rights-root',
                  readReceiptRoot: 'sha256:route-read-root',
                  deliveryRoot: 'sha256:route-delivery-unlock-root',
                  reconciliationRoot: 'sha256:route-reconciliation-root',
                  replayRoot: 'sha256:route-settlement-replay-root',
                  verified: {
                    paymentMatchesQuote: true,
                    finalityConfirmed: true,
                    sourceToSharesConserved: true,
                    rightsTransferConfirmed: true,
                    reconciliationAligned: true,
                    deliveryUnlockedOnlyAfterSettlement: true,
                    protectedSourcePayloadAbsent: true,
                  },
                },
                sourceSafety: {
                  sourceSafeMetadataOnly: true,
                  protectedSourcePayloadSerialized: false,
                  sourceBearingDeliveryUnlockedToReader: true,
                  walletPrivateMaterialVisible: false,
                  credentialsSerialized: false,
                },
                proofRoots: {
                  previewBoundaryRoot: 'sha256:route-boundary-root',
                  paymentReceiptRoot: 'sha256:route-payment-root',
                  finalityRoot: 'sha256:route-finality-root',
                  sourceToSharesRoot: 'sha256:route-source-to-shares-root',
                  btdReadReceiptRoot: 'sha256:route-read-root',
                  rightsTransferRoot: 'sha256:route-rights-root',
                  settlementUnlockRoot: 'sha256:route-settlement-unlock-root',
                  deliveryRoot: 'sha256:route-delivery-unlock-root',
                  reconciliationRoot: 'sha256:route-reconciliation-root',
                  storageRoot: 'sha256:route-settlement-storage-root',
                  replayRoot: 'sha256:route-settlement-replay-root',
                  boundaryRoot: 'sha256:route-settlement-boundary-root',
                },
                storageProjection: [
                  {
                    recordId: 'route-settlement-storage-record',
                    recordKind: 'btd_rights_transfer',
                    namespace: 'asset-pack/settlement',
                    key: 'rightsTransferReceipt',
                    root: 'sha256:route-settlement-storage-record-root',
                    sourceSafety: {
                      sourceSafeMetadataOnly: true,
                    },
                    payload: {
                      hiddenFromRouteSummary: true,
                    },
                  },
                ],
              },
            },
          },
          telemetry: '{"type":"pipeline-stream-event","runId":"route-run","stage":"asset-pack-synthesis"}\n',
        },
        outcome: 'completed',
        stopped: true,
      };
    }
  },
}));

import { runAssetPackHostRoute } from '@/app/api/pipeline-host/asset-pack/runner';
import { POST } from '@/app/api/pipeline-host/asset-pack/route';

const responseWithJson = Response as typeof Response & {
  json?: (body: unknown, init?: ResponseInit) => Response;
};

if (typeof responseWithJson.json !== 'function') {
  responseWithJson.json = (body: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

function fakeSupabaseJwt(role: string, ref = 'route-test-project'): string {
  return [
    Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ role, ref })).toString('base64url'),
    'route-test-signature',
  ].join('.');
}

const adminCredential = fakeSupabaseJwt('service_role', 'staging-testnet');
const staleAdminCredential = fakeSupabaseJwt('service_role', 'production-mainnet');
const modelCredential = 'model-credential-placeholder';

const ENV_KEYS = [
  'BITCODE_ENABLE_PIPELINE_HOST_API',
  'BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE',
  'BITCODE_ASSET_PACK_REAL_INFERENCE',
  'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE',
  'BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS',
  'BITCODE_LLM_PROVIDER',
  'BITCODE_LLM_MODEL',
  'OPENAI_API_KEY',
  'XAI_API_KEY',
  'GROK_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_ADMIN_KEY',
  'SUPABASE_DB_URL',
  'DATABASE_URL',
  'NODE_ENV',
  'VERCEL',
  'VERCEL_ENV',
] as const;

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function validHostBody(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'asset_pack_pipeline',
    repositoryFullName: 'octocat/Spoon-Knife',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    readId: 'read-activity',
    depositId: 'deposit-activity',
    assumeRepositoryPresent: true,
    ...overrides,
  };
}

function acceptedReadNeed() {
  return {
    schema: 'bitcode.read.need',
    needId: 'need-route-test',
    reviewState: 'accepted',
    measurementRoot: 'sha256:need-measurement-root',
    read: {
      id: 'read-activity',
      prompt: 'Find a source-bound product AssetPack fit.',
    },
    requirements: ['source-bound fit'],
    closureCriteria: ['Candidate is source-bound.'],
    failureModes: ['repository_mismatch'],
    targetArtifactKinds: ['asset-pack-evidence'],
    sourceConstraints: {
      repositoryFullName: 'octocat/Spoon-Knife',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      protectedSourceDisclosure: 'forbidden_before_settlement',
    },
    proofExpectations: ['proof root'],
    pricingMeasurementInputs: {
      measurementVector: [{ dimension: 'semantic_relevance', weight: 1, volume: 1 }],
      weightedRequestedVolume: 1,
      shareToFeeFormula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
    },
    feedbackHistory: [],
    review: {
      status: 'accepted',
      acceptedAt: '2026-05-18T00:00:00.000Z',
      acceptanceRoot: 'sha256:acceptance-root',
      nextStage: 'finding_fits',
    },
  };
}

function requestFor(body: Record<string, unknown>) {
  return new Request('http://localhost/api/pipeline-host/asset-pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/pipeline-host/asset-pack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restoreEnv();
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    // Isolate provider credentials so host env selection is deterministic.
    delete process.env.XAI_API_KEY;
    delete process.env.GROK_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.BITCODE_LLM_PROVIDER;
    delete process.env.BITCODE_LLM_MODEL;
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://staging.example.test';
    process.env.SUPABASE_SERVICE_ROLE_KEY = adminCredential;
    process.env.OPENAI_API_KEY = modelCredential;
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-local-route' } }, error: null });
    mockBuildAssetPackSandboxHost.mockImplementation((input) => ({
      manifest: {
        schema: 'bitcode.pipeline-host.manifest',
        hostMode: input.mode,
      },
      files: [],
      commands: [],
      artifactPaths: {
        evidence: '.proofs/pipeline-host/evidence.json',
        telemetry: '.proofs/pipeline-host/telemetry.jsonl',
      },
    }));
    mockLoadVercelSandboxFactory.mockResolvedValue({ create: jest.fn() });
    mockHostOptions = null;
    mockCapturedPlan = null;
  });

  afterAll(() => {
    restoreEnv();
  });

  it('fails closed in production unless the host API is explicitly enabled', async () => {
    process.env.VERCEL_ENV = 'production';
    delete process.env.BITCODE_ENABLE_PIPELINE_HOST_API;

    const response = await POST(requestFor(validHostBody()) as any);

    await expect(response.json()).resolves.toEqual({ error: 'pipeline_host_disabled' });
    expect(response.status).toBe(404);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated route calls before sandbox execution', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('missing session'),
    });

    const response = await POST(requestFor(validHostBody()) as any);

    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(response.status).toBe(401);
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
  });

  it('rejects incomplete host requests before sandbox execution', async () => {
    const response = await POST(requestFor({}) as any);

    await expect(response.json()).resolves.toEqual({ error: 'repositoryFullName is required' });
    expect(response.status).toBe(400);
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
  });

  it('streams a local strict preflight failure before sandbox creation', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    // Explicit opt-out (unset now means on). Host must not override 0.
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '0';

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody(),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      { runId: 'route-test-run', logErrors: false },
    );

    expect(events.map((event) => event.event)).toEqual([
      'host-started',
      'host-preflight',
      'host-failed',
    ]);
    expect(events[1].data).toMatchObject({
      realInferenceRequired: true,
      realInferenceEnabled: false,
      deployedRuntime: false,
    });
    expect(events[2].data.runId).toBe('route-test-run');
    expect(events[2].data.error).toContain('BITCODE_ASSET_PACK_REAL_INFERENCE=1');
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
    expect(mockLoadVercelSandboxFactory).not.toHaveBeenCalled();
  });

  it('blocks mixed Supabase REST and DB hosts before sandbox creation', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';
    process.env.SUPABASE_DB_URL =
      'postgresql://postgres:password@db.other-staging.example.test:5432/postgres?sslmode=require';

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody(),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      { runId: 'route-test-run', logErrors: false },
    );

    expect(events.map((event) => event.event)).toEqual([
      'host-started',
      'host-preflight',
      'host-failed',
    ]);
    expect(events[1].data).toMatchObject({
      supabaseHost: 'staging.example.test',
      supabaseDbHost: 'db.other-staging.example.test',
      supabaseRestDbHostAligned: false,
    });
    expect(events[2].data.runId).toBe('route-test-run');
    expect(events[2].data.error).toContain('Supabase REST host must match DB readback host');
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
  });

  it('blocks rejected staging Supabase REST credentials before sandbox creation', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody(),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      {
        runId: 'route-test-run',
        logErrors: false,
        fetchImpl: async () => ({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({ message: 'Invalid API key' }),
        } as Response),
      },
    );

    expect(events.map((event) => event.event)).toEqual([
      'host-started',
      'host-preflight',
      'host-failed',
    ]);
    expect(events[2].data.runId).toBe('route-test-run');
    expect(events[2].data.error).toContain('Supabase REST readback credential check failed');
    expect(events[2].data.error).toContain('no admin-capable Supabase credential was accepted');
    expect(events[2].data.error).toContain('Invalid API key');
    expect(mockBuildAssetPackSandboxHost).not.toHaveBeenCalled();
  });

  it('uses the Supabase credential accepted by the staging Data API when stale admin keys are also present', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';
    process.env.SUPABASE_SERVICE_ROLE_KEY = staleAdminCredential;
    process.env.SUPABASE_SECRET_KEY = adminCredential;

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody(),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      {
        runId: 'route-test-run',
        logErrors: false,
        fetchImpl: async (_url, init) => {
          const headers = new Headers(init?.headers);
          const accepted = headers.get('apikey') === adminCredential;
          return {
            ok: accepted,
            status: accepted ? 200 : 401,
            statusText: accepted ? 'OK' : 'Unauthorized',
            json: async () => (accepted ? [] : { message: 'Invalid API key' }),
          } as Response;
        },
      },
    );

    expect(events.map((event) => event.event)).toEqual([
      'host-started',
      'host-preflight',
      'host-event',
      'host-completed',
    ]);
    expect(mockBuildAssetPackSandboxHost).toHaveBeenCalledWith(
      expect.objectContaining({
        commandEnvironment: expect.objectContaining({
          SUPABASE_SERVICE_ROLE_KEY: adminCredential,
        }),
      }),
    );
  });

  it('forwards strict local route context and redacts secrets from completion output', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';
    process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS = '600000';

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody(),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      {
        runId: 'route-test-run',
        logErrors: false,
        fetchImpl: async () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ([]),
        } as Response),
      },
    );
    const eventText = JSON.stringify(events);

    expect(events.map((event) => event.event)).toEqual([
      'host-started',
      'host-preflight',
      'host-event',
      'host-completed',
    ]);
    expect(events[1].data).toMatchObject({
      realInferenceRequired: true,
      realInferenceEnabled: true,
      realInferenceProfile: 'bounded',
      runtimeBudgetMs: 600000,
      supabaseHost: 'staging.example.test',
    });
    expect(events[2].data).toMatchObject({
      type: 'sandbox-created',
      sandboxId: 'sbx-local-route-test',
    });
    expect(events[3].data).toMatchObject({
      outcome: 'completed',
      evidencePresent: true,
      telemetryPresent: true,
      telemetryLineCount: 1,
      evidence: {
        resultState: 'blocked_readiness',
        fitResult: {
          resultState: 'worthy_fit',
        },
        ledgerSettlement: {
          status: 'blocked',
          protectedSourceUnlock: {
            state: 'denied',
            sourceAvailable: false,
          },
        },
        sourceSafePreview: {
          assetPackId: 'asset-pack-route-test',
          unlock: {
            state: 'denied',
            sourceAvailable: false,
          },
        },
        assetPackPreviewBoundary: {
          boundaryId: 'asset-pack-preview-boundary-route-test',
          assetPackId: 'asset-pack-route-test',
          quoteReceipt: {
            sats: 546,
            quoteRoot: 'sha256:route-quote-root',
          },
          selectedFitProvenance: {
            selectedCandidateAssetIds: ['asset-repository-revision'],
            fitDepositAssetIds: ['deposit-route-test'],
            provenanceRoot: 'sha256:route-provenance-root',
          },
          settlementInstructions: {
            state: 'quote_ready_settlement_required',
            serverCustody: false,
          },
          deliveryPosture: {
            state: 'withheld_until_settlement',
            sourceBearingDeliveryVisible: false,
          },
          storageRecordCount: 1,
        },
        assetPackQuoteReceipt: {
          sats: 546,
          deterministic: true,
          quoteRoot: 'sha256:route-quote-root',
        },
        assetPackSettlementInstructions: {
          state: 'quote_ready_settlement_required',
          serverCustody: false,
        },
        assetPackDeliveryPosture: {
          state: 'withheld_until_settlement',
          sourceBearingDeliveryVisible: false,
        },
        assetPackSettlementRightsDeliveryBoundary: {
          state: 'settlement_delivered',
          assetPackId: 'asset-pack-route-test',
          paymentObservation: {
            observedDebitSats: 546,
            expectedSats: 546,
            serverCustody: false,
          },
          finalityReceipt: {
            finalityState: 'confirmed',
          },
          deliveryUnlock: {
            state: 'source_bearing_pull_request_ready',
            sourceBearingDeliveryVisibleToReader: true,
          },
          reconciliationReport: {
            state: 'aligned',
            blocking: false,
          },
          storageRecordCount: 1,
        },
        assetPackDeliveryUnlock: {
          state: 'source_bearing_pull_request_ready',
          sourceBearingDeliveryVisibleToReader: true,
        },
        assetPackLedgerDatabaseStorageReconciliation: {
          state: 'aligned',
          blocking: false,
        },
      },
    });
    expect(eventText).toContain('[redacted]');
    expect(eventText).not.toContain(modelCredential);
    expect(eventText).not.toContain(adminCredential);
    expect(mockBuildAssetPackSandboxHost).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'asset_pack_pipeline',
        assumeRepositoryPresent: true,
        commandEnvironment: expect.objectContaining({
          BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE: '1',
          BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
          BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE: 'bounded',
          BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS: '600000',
          BITCODE_PIPELINE_USER_ID: 'user-local-route',
          BITCODE_PIPELINE_STREAM_TO_DATABASE: '1',
          BITCODE_PIPELINE_STRUCTURED_DB: '1',
          BITCODE_LLM_PROVIDER: 'openai',
        }),
      }),
    );
    expect(mockCapturedPlan).toMatchObject({
      manifest: {
        schema: 'bitcode.pipeline-host.manifest',
      },
    });
  });

  it('forwards accepted Read-Need into the sandbox host plan', async () => {
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'bounded';
    const readNeed = acceptedReadNeed();

    const events: Array<{ event: string; data: any }> = [];
    await runAssetPackHostRoute(
      validHostBody({
        acceptedReadNeed: readNeed,
        requireAcceptedReadNeed: true,
      }),
      'user-local-route',
      (event, data) => events.push({ event, data }),
      {
        runId: 'route-test-run',
        logErrors: false,
        fetchImpl: async () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ([]),
        } as Response),
      },
    );

    expect(events[0]).toMatchObject({
      event: 'host-started',
      data: {
        readNeedId: 'need-route-test',
        requireAcceptedReadNeed: true,
      },
    });
    expect(mockBuildAssetPackSandboxHost).toHaveBeenCalledWith(
      expect.objectContaining({
        readNeed,
      }),
    );
  });
});
