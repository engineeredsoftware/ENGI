import type {
  BitcodePipelineResultState,
  PipelineDepositReference,
  PipelineHarnessManifest,
  PipelineHarnessMode,
  PipelineHarnessSourceOverlay,
  PipelineHarnessStage,
  PipelineHostCapabilities,
  PipelineReadRequest,
  PipelineSourceRevision,
} from './types';

export const VERCEL_SANDBOX_HOST_CAPABILITIES: PipelineHostCapabilities = {
  hostKind: 'vercel-sandbox',
  provider: 'vercel',
  isolationBoundary: 'firecracker-microvm',
  operatingSystem: 'amazon-linux-2023',
  defaultRuntime: 'node24',
  supportedRuntimes: ['node24', 'node22', 'python3.13'],
  defaultWorkingDirectory: '/vercel/sandbox',
  user: 'vercel-sandbox',
  supportsSudo: true,
  ephemeralFilesystem: true,
  defaultTimeoutMs: 5 * 60 * 1000,
  maximumDocumentedTimeoutMs: {
    hobby: 45 * 60 * 1000,
    proEnterprise: 5 * 60 * 60 * 1000,
  },
  packageManagers: ['npm', 'pnpm', 'pip', 'uv', 'dnf'],
  authentication: ['vercel-oidc-token', 'vercel-access-token'],
  networkPolicyModes: ['allow-all', 'deny-all', 'custom'],
  supports: {
    commandLogs: true,
    fileTransfer: true,
    exposedPorts: true,
    snapshots: true,
    runtimeNetworkPolicyUpdate: true,
  },
  artifactPolicy: {
    mustExportBeforeStop: true,
    durableStorageRequired: true,
  },
  documentation: [
    'https://vercel.com/docs/vercel-sandbox',
    'https://vercel.com/docs/vercel-sandbox/sdk-reference',
    'https://vercel.com/docs/vercel-sandbox/concepts/authentication',
    'https://vercel.com/docs/vercel-sandbox/system-specifications',
  ],
};

export const ASSET_PACK_HARNESS_STAGES: readonly PipelineHarnessStage[] = [
  'need-synthesis',
  'need-review',
  'need-fit-search',
  'deposit-search',
  'candidate-ranking',
  'read-comprehension',
  'asset-pack-synthesis',
  'source-safe-preview',
  'validation',
  'finish',
  'telemetry-readback',
];

export const ASSET_PACK_HARNESS_RESULT_STATES: readonly BitcodePipelineResultState[] = [
  'worthy_fit',
  'no_worthy_fit',
  'blocked_readiness',
];

export const ASSET_PACK_HARNESS_EVIDENCE_TABLES = [
  'executions',
  'execution_events',
  'pipeline_runs',
  'run_jobs',
  'stream_logs',
  'phase_executions',
  'deliverable_pipeline_runs',
  'deliverable_pipeline_events',
  'deliverable_pipeline_phase_delegations',
  'deliverable_pipeline_agent_steps',
  'deliverable_pipeline_generations',
  'deliverable_pipeline_tool_executions',
] as const;

export const ASSET_PACK_PROTOCOL_INVARIANTS = [
  'Deposit, Read, and Fit must share repository_full_name, source_branch, and source_commit.',
  'A worthy Fit cannot be claimed from local posture rows alone; it needs pipeline execution evidence.',
  'No AssetPack range, BTC fee, ledger anchor, settlement, or finality may be claimed without matching readback rows.',
  'Unrelated or overly broad Reads must return no-worthy-fit, clarification, or blocked-readiness evidence.',
  'Routine QA output must not expose wallet signatures, GitHub tokens, model credentials, or provider secrets.',
] as const;

export function redactCommandEnvironment(
  env: Record<string, string | undefined> = {}
): PipelineHarnessManifest['commandEnvironment'] {
  return Object.keys(env)
    .sort()
    .map((name) => ({
      name,
      provided: typeof env[name] === 'string' && String(env[name]).length > 0,
      value: '[redacted]' as const,
    }));
}

export function buildAssetPackPipelineHarnessManifest(input: {
  mode: PipelineHarnessMode;
  read: PipelineReadRequest;
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  sourceOverlay?: PipelineHarnessSourceOverlay;
  commandEnvironment?: Record<string, string | undefined>;
  readNeed?: unknown;
  requireAcceptedReadNeed?: boolean;
  createdAt?: string;
}): PipelineHarnessManifest {
  assertNonEmpty(input.read.id, 'read.id');
  assertNonEmpty(input.read.prompt, 'read.prompt');
  assertNonEmpty(input.deposit.id, 'deposit.id');
  assertSourceRevision(input.sourceRevision);

  return {
    schema: 'bitcode.pipeline-harness.manifest',
    pipelineFamily: 'asset_pack',
    pipelineName: 'asset-pack-read-fit',
    harnessMode: input.mode,
    read: input.read,
    requireAcceptedReadNeed: input.requireAcceptedReadNeed ?? true,
    readNeed: input.readNeed,
    deposit: input.deposit,
    sourceRevision: input.sourceRevision,
    sourceOverlay: input.sourceOverlay,
    host: {
      hostKind: VERCEL_SANDBOX_HOST_CAPABILITIES.hostKind,
      provider: VERCEL_SANDBOX_HOST_CAPABILITIES.provider,
      isolationBoundary: VERCEL_SANDBOX_HOST_CAPABILITIES.isolationBoundary,
      operatingSystem: VERCEL_SANDBOX_HOST_CAPABILITIES.operatingSystem,
      defaultRuntime: VERCEL_SANDBOX_HOST_CAPABILITIES.defaultRuntime,
      defaultWorkingDirectory: VERCEL_SANDBOX_HOST_CAPABILITIES.defaultWorkingDirectory,
      ephemeralFilesystem: VERCEL_SANDBOX_HOST_CAPABILITIES.ephemeralFilesystem,
    },
    stages: ASSET_PACK_HARNESS_STAGES,
    expectedEvidenceTables: ASSET_PACK_HARNESS_EVIDENCE_TABLES,
    resultStates: ASSET_PACK_HARNESS_RESULT_STATES,
    protocolInvariants: ASSET_PACK_PROTOCOL_INVARIANTS,
    commandEnvironment: redactCommandEnvironment(input.commandEnvironment),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function assertSourceRevision(sourceRevision: PipelineSourceRevision): void {
  assertNonEmpty(sourceRevision.repositoryFullName, 'sourceRevision.repositoryFullName');
  assertNonEmpty(sourceRevision.branch, 'sourceRevision.branch');
  assertNonEmpty(sourceRevision.commit, 'sourceRevision.commit');
  if (!sourceRevision.repositoryFullName.includes('/')) {
    throw new Error('sourceRevision.repositoryFullName must be an owner/repository pair.');
  }
}

function assertNonEmpty(value: string | undefined | null, field: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required for a Bitcode pipeline harness manifest.`);
  }
}
