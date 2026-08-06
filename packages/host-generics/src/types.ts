export type PipelineHostKind = 'vercel-sandbox';

export type VercelSandboxRuntime = 'node24' | 'node22' | 'python3.13';

export type PipelineHostMode = 'host_smoke' | 'asset_pack_pipeline';

/**
 * Pipeline host / evidence result-state vocabulary.
 *
 * Two product families + shared blocked — never dual-read across families:
 * - Deposit candidates: deposit synthesize-options only
 * - Read candidates: read synthesize-options and post-read depository fit
 *   (fit is always a read-candidate outcome; never a separate family)
 * - blocked_readiness: shared terminal blocked posture
 */

/** Deposit synthesize AssetPack options only. Never fit / read-candidate states. */
export const BITCODE_DEPOSIT_CANDIDATE_RESULT_STATES = [
  'worthy_deposit_candidates',
  'no_worthy_deposit_candidates',
] as const;
export type BitcodeDepositCandidateResultState =
  (typeof BITCODE_DEPOSIT_CANDIDATE_RESULT_STATES)[number];

/**
 * Read family: synthesize AssetPack options + post-read depository fit.
 * Fit is entirely a read-candidate posture (worthy_fit / no_worthy_fit).
 */
export const BITCODE_READ_CANDIDATE_RESULT_STATES = [
  'worthy_read_candidates',
  'no_worthy_read_candidates',
  'worthy_fit',
  'no_worthy_fit',
] as const;
export type BitcodeReadCandidateResultState =
  (typeof BITCODE_READ_CANDIDATE_RESULT_STATES)[number];

export const BITCODE_BLOCKED_RESULT_STATE = 'blocked_readiness' as const;

/** Full host-admissible result-state set (single source of truth for manifests). */
export const BITCODE_PIPELINE_RESULT_STATES = [
  ...BITCODE_DEPOSIT_CANDIDATE_RESULT_STATES,
  ...BITCODE_READ_CANDIDATE_RESULT_STATES,
  BITCODE_BLOCKED_RESULT_STATE,
] as const;

export type BitcodePipelineResultState = (typeof BITCODE_PIPELINE_RESULT_STATES)[number];

export function isBitcodePipelineResultState(
  candidate: unknown,
): candidate is BitcodePipelineResultState {
  return (
    typeof candidate === 'string' &&
    (BITCODE_PIPELINE_RESULT_STATES as readonly string[]).includes(candidate)
  );
}

/** Unknown → blocked_readiness. No legacy aliases. */
export function normalizeBitcodePipelineResultState(
  candidate: unknown,
): BitcodePipelineResultState {
  return isBitcodePipelineResultState(candidate)
    ? candidate
    : BITCODE_BLOCKED_RESULT_STATE;
}

export type PipelineHostStage =
  | 'need-synthesis'
  | 'need-review'
  | 'need-fit-search'
  | 'deposit-search'
  | 'candidate-ranking'
  | 'read-comprehension'
  | 'asset-pack-synthesis'
  | 'source-safe-preview'
  | 'validation'
  | 'finish'
  | 'telemetry-readback';

export type PipelineHostAuthentication =
  | 'vercel-oidc-token'
  | 'vercel-access-token';

export type PipelineNetworkPolicy =
  | 'allow-all'
  | 'deny-all'
  | {
      allow?: string[] | Record<string, unknown>;
      subnets?: {
        allow?: string[];
        deny?: string[];
      };
    };

export interface PipelineHostCapabilities {
  hostKind: PipelineHostKind;
  provider: 'vercel';
  isolationBoundary: 'firecracker-microvm';
  operatingSystem: 'amazon-linux-2023';
  defaultRuntime: VercelSandboxRuntime;
  supportedRuntimes: readonly VercelSandboxRuntime[];
  defaultWorkingDirectory: '/vercel/sandbox';
  user: 'vercel-sandbox';
  supportsSudo: boolean;
  ephemeralFilesystem: boolean;
  defaultTimeoutMs: number;
  maximumDocumentedTimeoutMs: {
    hobby: number;
    proEnterprise: number;
  };
  packageManagers: readonly string[];
  authentication: readonly PipelineHostAuthentication[];
  networkPolicyModes: readonly ('allow-all' | 'deny-all' | 'custom')[];
  supports: {
    commandLogs: boolean;
    fileTransfer: boolean;
    exposedPorts: boolean;
    snapshots: boolean;
    runtimeNetworkPolicyUpdate: boolean;
  };
  artifactPolicy: {
    mustExportBeforeStop: boolean;
    durableStorageRequired: boolean;
  };
  documentation: readonly string[];
}

export interface PipelineSourceRevision {
  repositoryFullName: string;
  branch: string;
  commit: string;
}

export interface PipelineReadRequest {
  id: string;
  prompt: string;
}

export interface PipelineDepositReference {
  id: string;
  assetId?: string | null;
  hasWalletOrAttestationProof?: boolean;
  hasAssetMeasurementEvidence?: boolean;
  proofRoot?: string | null;
  measurementRoot?: string | null;
  reconciliationReadbackRoot?: string | null;
}

export interface PipelineHostManifest {
  schema: 'bitcode.pipeline-host.manifest';
  pipelineFamily: 'asset_pack';
  pipelineName: 'asset-pack-read-fit';
  hostMode: PipelineHostMode;
  read: PipelineReadRequest;
  requireAcceptedReadNeed?: boolean;
  readNeed?: unknown;
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  sourceOverlay?: PipelineHostSourceOverlay;
  /** V48 Gate 3 #25: the synthesis lens the in-box pipeline runs (deposit | read). */
  synthesizeMode?: 'deposit' | 'read';
  /** Deposit steering for the in-box deposit synthesis (source-safe). */
  depositSteering?: {
    obfuscations?: string | null;
    permissibleSources?: string[];
    impermissibleSources?: string[];
    demandContext?: string[];
  };
  host: Pick<
    PipelineHostCapabilities,
    | 'hostKind'
    | 'provider'
    | 'isolationBoundary'
    | 'operatingSystem'
    | 'defaultRuntime'
    | 'defaultWorkingDirectory'
    | 'ephemeralFilesystem'
  >;
  stages: readonly PipelineHostStage[];
  expectedEvidenceTables: readonly string[];
  resultStates: readonly BitcodePipelineResultState[];
  protocolInvariants: readonly string[];
  commandEnvironment: readonly {
    name: string;
    provided: boolean;
    value: '[redacted]';
  }[];
  createdAt: string;
}

export interface PipelineSandboxSourceGit {
  type: 'git';
  url: string;
  username?: string;
  password?: string;
  depth?: number;
  revision?: string;
}

export interface PipelineSandboxSourceTarball {
  type: 'tarball';
  url: string;
}

export interface PipelineSandboxSourceSnapshot {
  type: 'snapshot';
  snapshotId: string;
}

export type PipelineSandboxSource =
  | PipelineSandboxSourceGit
  | PipelineSandboxSourceTarball
  | PipelineSandboxSourceSnapshot;

export interface SandboxCreateOptions {
  /**
   * Stock Sandbox runtime (node24 / node22 / …). Mutually exclusive with `image`
   * per Vercel Sandbox SDK — do not set both.
   */
  runtime?: VercelSandboxRuntime;
  /**
   * VCR custom image reference for Pipeliner, e.g.
   * `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest` or
   * `…/pipeliner:v48-<sha>`. When set, the host plan uses the pipeline
   * appliance image instead of a stock runtime (mutually exclusive with
   * `runtime`).
   */
  image?: string;
  timeout?: number;
  ports?: number[];
  resources?: {
    vcpus?: number;
  };
  source?: PipelineSandboxSource;
  networkPolicy?: PipelineNetworkPolicy;
  env?: Record<string, string>;
  teamId?: string;
  projectId?: string;
  token?: string;
  /**
   * Vercel Sandbox v2: persistence is DEFAULT (auto-snapshot on stop, billed
   * Snapshot Storage). Bitcode pipeline hostes are one-shot CI-style work —
   * always pass `false` unless a caller explicitly opts into a long-lived
   * named workspace. See Vercel docs: Persistent sandboxes / Opt out.
   */
  persistent?: boolean;
  /**
   * Unique name within the Vercel project (v2 primary identity; v1 used
   * sandboxId). Ephemeral deposit runs still set a unique name for logs/
   * dashboard correlation even when `persistent: false`.
   */
  name?: string;
  /**
   * Optional TTL for automatic snapshots when persistent (ms from last use).
   * Only relevant when `persistent: true`.
   */
  snapshotExpiration?: number;
  /**
   * Retention for persistent sandboxes (keep N most recent snapshots).
   * Only relevant when `persistent: true`.
   */
  keepLastSnapshots?: {
    count: number;
    expiration?: number;
    deleteEvicted?: boolean;
  };
}

export interface PipelineHostFile {
  path: string;
  content: Buffer;
  mode?: number;
}

export interface PipelineHostSourceOverlay {
  path: string;
  patchRoot: '/vercel/sandbox';
  admissibility: 'qa-only-not-source-revision-evidence';
}

export interface PipelineHostCommand {
  label: string;
  cmd: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  sudo?: boolean;
  detached?: boolean;
  exitCodePath?: string;
  stdoutPath?: string;
  stderrPath?: string;
  maxWaitMs?: number;
  pollIntervalMs?: number;
  required?: boolean;
}

export interface PipelineHostPlan {
  capabilities: PipelineHostCapabilities;
  createOptions: SandboxCreateOptions;
  manifest: PipelineHostManifest;
  files: PipelineHostFile[];
  sourceOverlay?: PipelineHostSourceOverlay;
  commands: PipelineHostCommand[];
  artifactPaths: {
    evidence: string;
    telemetry: string;
  };
}

export interface SandboxCommandResult {
  exitCode: number | null;
  cmdId?: string;
  wait?: () => Promise<SandboxCommandResult>;
  stdout?: () => Promise<string>;
  stderr?: () => Promise<string>;
  output?: (stream: 'stdout' | 'stderr' | 'both') => Promise<string>;
}

export interface SandboxRunCommandObject {
  cmd: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  sudo?: boolean;
  detached?: boolean;
}

export interface SandboxSession {
  /** v1 identity; still present on many SDK builds. */
  sandboxId?: string;
  /** v2 primary identity (unique per project). */
  name?: string;
  status?: string;
  writeFiles(files: PipelineHostFile[]): Promise<void>;
  runCommand(
    command: string,
    args?: string[],
    opts?: Record<string, unknown>
  ): Promise<SandboxCommandResult>;
  runCommand(params: SandboxRunCommandObject): Promise<SandboxCommandResult>;
  readFileToBuffer(file: { path: string; cwd?: string }): Promise<Buffer | null>;
  /**
   * End the current session. Persistent sandboxes auto-snapshot; non-persistent
   * discard the filesystem. Does not permanently remove the sandbox entity.
   */
  stop?(opts?: { blocking?: boolean }): Promise<unknown>;
  /** Permanent remove (sandbox + snapshots + sessions). Prefer after ephemeral stop. */
  delete?(): Promise<unknown>;
  snapshot?(opts?: { expiration?: number }): Promise<{ snapshotId: string }>;
  update?(opts: Record<string, unknown>): Promise<unknown>;
}

export interface SandboxFactory {
  create(options: SandboxCreateOptions): Promise<SandboxSession>;
  /** Resume/retrieve by name (v2) or sandboxId (v1). */
  get?(options: {
    sandboxId?: string;
    name?: string;
    teamId?: string;
    projectId?: string;
    token?: string;
    resume?: boolean;
  }): Promise<SandboxSession>;
  getOrCreate?(options: SandboxCreateOptions & {
    onCreate?: (sandbox: SandboxSession) => void | Promise<void>;
    onResume?: (sandbox: SandboxSession) => void | Promise<void>;
    resume?: boolean;
  }): Promise<SandboxSession>;
}

export type PipelineHostEvent =
  | {
      type: 'sandbox-create-started';
      timestamp: string;
      runtime?: VercelSandboxRuntime;
      /** VCR image ref when using Pipeliner (source-safe). */
      image?: string | null;
      mode: PipelineHostMode;
      hasSource?: boolean;
      persistent?: boolean;
      name?: string;
      timeoutMs?: number;
    }
  | {
      type: 'sandbox-create-failed';
      timestamp: string;
      mode: PipelineHostMode;
      image?: string | null;
      runtime?: VercelSandboxRuntime;
      hasSource?: boolean;
      name?: string;
      /** Expanded API error (no secrets). */
      message: string;
      httpStatus?: number | null;
    }
  | {
      type: 'sandbox-created';
      timestamp: string;
      sandboxId?: string;
      /** v2 name when available. */
      name?: string;
      persistent?: boolean;
      status?: string;
      image?: string | null;
    }
  | {
      type: 'sandbox-cancelled';
      timestamp: string;
      sandboxId?: string;
      name?: string;
      reason?: string;
    }
  | {
      type: 'sandbox-deleted';
      timestamp: string;
      sandboxId?: string;
      name?: string;
    }
  | {
      type: 'host-files-written';
      timestamp: string;
      fileCount: number;
    }
  | {
      type: 'command-started';
      timestamp: string;
      label: string;
      cmd: string;
      args: string[];
      cwd?: string;
    }
  | {
      type: 'command-completed';
      timestamp: string;
      label: string;
      exitCode: number | null;
      stdoutLength: number;
      stderrLength: number;
      startedAt: string;
      completedAt: string;
    }
  | {
      type: 'telemetry-artifact-event';
      timestamp: string;
      label: string;
      telemetryPath: string;
      lineNumber: number;
      telemetryEvent: unknown;
    }
  | {
      type: 'artifacts-read';
      timestamp: string;
      evidencePresent: boolean;
      telemetryPresent: boolean;
    }
  | {
      type: 'sandbox-stopped';
      timestamp: string;
      stopped: boolean;
    };

export interface PipelineHostCommandResult {
  label: string;
  cmd: string;
  args: string[];
  cwd?: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  startedAt: string;
  completedAt: string;
}

export interface PipelineHostRunResult {
  sandboxId?: string;
  finalStatus?: string;
  manifest: PipelineHostManifest;
  commands: PipelineHostCommandResult[];
  artifacts: {
    evidence: unknown | null;
    telemetry: string | null;
  };
  outcome: 'completed' | 'failed' | 'cancelled';
  stopped: boolean;
}
