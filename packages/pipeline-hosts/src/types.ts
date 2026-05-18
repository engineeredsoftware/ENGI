export type PipelineHostKind = 'vercel-sandbox';

export type VercelSandboxRuntime = 'node24' | 'node22' | 'python3.13';

export type PipelineHarnessMode = 'host_smoke' | 'asset_pack_pipeline';

export type BitcodePipelineResultState =
  | 'worthy_fit'
  | 'no_worthy_fit'
  | 'blocked_readiness';

export type PipelineHarnessStage =
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

export interface PipelineHarnessManifest {
  schema: 'bitcode.pipeline-harness.manifest';
  pipelineFamily: 'asset_pack';
  pipelineName: 'asset-pack-read-fit';
  harnessMode: PipelineHarnessMode;
  read: PipelineReadRequest;
  requireAcceptedReadNeed?: boolean;
  readNeed?: unknown;
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  sourceOverlay?: PipelineHarnessSourceOverlay;
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
  stages: readonly PipelineHarnessStage[];
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
  runtime?: VercelSandboxRuntime;
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
}

export interface PipelineHarnessFile {
  path: string;
  content: Buffer;
  mode?: number;
}

export interface PipelineHarnessSourceOverlay {
  path: string;
  patchRoot: '/vercel/sandbox';
  admissibility: 'qa-only-not-source-revision-evidence';
}

export interface PipelineHarnessCommand {
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

export interface PipelineHarnessPlan {
  capabilities: PipelineHostCapabilities;
  createOptions: SandboxCreateOptions;
  manifest: PipelineHarnessManifest;
  files: PipelineHarnessFile[];
  sourceOverlay?: PipelineHarnessSourceOverlay;
  commands: PipelineHarnessCommand[];
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
  sandboxId?: string;
  status?: string;
  writeFiles(files: PipelineHarnessFile[]): Promise<void>;
  runCommand(
    command: string,
    args?: string[],
    opts?: Record<string, unknown>
  ): Promise<SandboxCommandResult>;
  runCommand(params: SandboxRunCommandObject): Promise<SandboxCommandResult>;
  readFileToBuffer(file: { path: string; cwd?: string }): Promise<Buffer | null>;
  stop?(opts?: { blocking?: boolean }): Promise<unknown>;
  snapshot?(opts?: { expiration?: number }): Promise<{ snapshotId: string }>;
}

export interface SandboxFactory {
  create(options: SandboxCreateOptions): Promise<SandboxSession>;
}

export type PipelineHarnessHostEvent =
  | {
      type: 'sandbox-create-started';
      timestamp: string;
      runtime?: VercelSandboxRuntime;
      mode: PipelineHarnessMode;
    }
  | {
      type: 'sandbox-created';
      timestamp: string;
      sandboxId?: string;
      status?: string;
    }
  | {
      type: 'harness-files-written';
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

export interface PipelineHarnessCommandResult {
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

export interface PipelineHarnessRunResult {
  sandboxId?: string;
  finalStatus?: string;
  manifest: PipelineHarnessManifest;
  commands: PipelineHarnessCommandResult[];
  artifacts: {
    evidence: unknown | null;
    telemetry: string | null;
  };
  outcome: 'completed' | 'failed';
  stopped: boolean;
}
