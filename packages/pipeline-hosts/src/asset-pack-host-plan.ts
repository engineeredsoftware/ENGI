/**
 * AssetPack sandbox host plan builder (deposit + read synthesize modes).
 * Constants and in-box runner templates live in sibling modules.
 */

import { createHash } from 'node:crypto';

import {
  buildAssetPackPipelineHostManifest,
  VERCEL_SANDBOX_HOST_CAPABILITIES,
} from './manifest';
import type {
  PipelineDepositReference,
  PipelineHostCommand,
  PipelineHostMode,
  PipelineHostPlan,
  PipelineNetworkPolicy,
  PipelineReadRequest,
  PipelineSandboxSource,
  PipelineSourceRevision,
  VercelSandboxRuntime,
} from './types';

import {
  DEFAULT_LONG_TIMEOUT_MS,
  EVIDENCE_PATH,
  HOST_RUN_DIRECTORY,
  HOST_SMOKE_RUNNER_PATH,
  LIVE_PIPELINE_RUNNER_PATH,
  MANIFEST_PATH,
  PIPELINE_EXIT_CODE_PATH,
  PIPELINE_IMAGE_ENTRY_DEFAULT,
  PIPELINE_IMAGE_ENTRY_ENV,
  PIPELINE_IMAGE_MONOREPO_ROOT_DEFAULT,
  PIPELINE_SANDBOX_IMAGE_ENV,
  PIPELINE_STDERR_PATH,
  PIPELINE_STDOUT_PATH,
  SANDBOX_PNPM_VERSION,
  SANDBOX_WORKING_DIRECTORY,
  SOURCE_OVERLAY_PATCH_PATH,
  TELEMETRY_PATH,
  TSCONFIG_PATHS_REGISTER_PATH,
} from './asset-pack-host-constants';
import {
  createHostSmokeRunner,
  createLiveAssetPackPipelineRunner,
} from './asset-pack-host-runners';

/**
 * Unique name per host create (Vercel project-scoped). Even non-persistent
 * sandboxes take a name for dashboard/log correlation; names are not reused.
 */
export function buildEphemeralSandboxName(
  synthesizeMode: 'deposit' | 'read',
  depositId?: string | null,
): string {
  const slug = String(depositId || 'host')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `bitcode-${synthesizeMode}-${slug || 'run'}-${stamp}`.slice(0, 96);
}

export interface BuildAssetPackSandboxHostPlanOptions {
  mode?: PipelineHostMode;
  read: PipelineReadRequest;
  readNeed?: unknown;
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  source?: PipelineSandboxSource;
  assumeRepositoryPresent?: boolean;
  runtime?: VercelSandboxRuntime;
  timeoutMs?: number;
  networkPolicy?: PipelineNetworkPolicy;
  commandEnvironment?: Record<string, string>;
  installDependencies?: boolean;
  sourceOverlayPatch?: Buffer | string;
  /** V48 Gate 3 #25: run the in-box synthesis in deposit (vs read) mode. */
  synthesizeMode?: 'deposit' | 'read';
  /** Deposit steering for the in-box deposit synthesis (source-safe). */
  depositSteering?: {
    obfuscations?: string | null;
    forcedExclusions?: string[];
    demandContext?: string[];
  };
  /**
   * Vercel Sandbox v2 defaults to persistent (auto-snapshot + Snapshot Storage
   * billing). Bitcode host runs are one-shot — default `false` unless a
   * caller explicitly opts into a long-lived named workspace.
   */
  persistent?: boolean;
  /** Optional stable name (unique per Vercel project). Auto-generated when omitted. */
  sandboxName?: string;
  /**
   * VCR pipeline appliance image. When set (or when env
   * BITCODE_PIPELINE_SANDBOX_IMAGE is set), createOptions uses `image` and
   * omits stock `runtime`; in-box monorepo install is skipped.
   */
  sandboxImage?: string | null;
  /** Override image entry (default /opt/bitcode/pipeline/run-pipeline.mjs). */
  pipelineImageEntry?: string | null;
}

/** Resolve pipeline appliance image from options or process env. */
export function resolvePipelineSandboxImage(
  optionsImage?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const fromOptions = typeof optionsImage === 'string' ? optionsImage.trim() : '';
  if (fromOptions) return fromOptions;
  const fromEnv = env[PIPELINE_SANDBOX_IMAGE_ENV]?.trim();
  return fromEnv || null;
}

export function resolvePipelineImageEntry(
  optionsEntry?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromOptions = typeof optionsEntry === 'string' ? optionsEntry.trim() : '';
  if (fromOptions) return fromOptions;
  return env[PIPELINE_IMAGE_ENTRY_ENV]?.trim() || PIPELINE_IMAGE_ENTRY_DEFAULT;
}

export function buildAssetPackSandboxHostPlan(
  options: BuildAssetPackSandboxHostPlanOptions
): PipelineHostPlan {
  const mode = options.mode ?? 'host_smoke';
  if (mode === 'asset_pack_pipeline' && !options.source && !options.assumeRepositoryPresent) {
    throw new Error(
      'asset_pack_pipeline host mode requires a sandbox source or assumeRepositoryPresent=true.'
    );
  }

  const sandboxImage = resolvePipelineSandboxImage(options.sandboxImage);
  const usePipelineImage = Boolean(sandboxImage);
  const pipelineImageEntry = resolvePipelineImageEntry(options.pipelineImageEntry);

  const sourceOverlayPatch = normalizeSourceOverlayPatch(options.sourceOverlayPatch);
  const sourceOverlay = sourceOverlayPatch
    ? {
        path: SOURCE_OVERLAY_PATCH_PATH,
        patchRoot: SANDBOX_WORKING_DIRECTORY,
        admissibility: 'qa-only-not-source-revision-evidence' as const,
      }
    : undefined;
  const commandEnvironment = {
    BITCODE_PIPELINE_HOST_MANIFEST: `${SANDBOX_WORKING_DIRECTORY}/${MANIFEST_PATH}`,
    BITCODE_PIPELINE_HOST_ARTIFACT_DIR: `${SANDBOX_WORKING_DIRECTORY}/${HOST_RUN_DIRECTORY}`,
    BITCODE_PIPELINE_HOST_MODE: mode,
    BITCODE_MONOREPO_ROOT: PIPELINE_IMAGE_MONOREPO_ROOT_DEFAULT,
    ...(sourceOverlay ? { BITCODE_PIPELINE_SOURCE_OVERLAY_APPLIED: '1' } : {}),
    ...options.commandEnvironment,
  };
  const deposit = normalizeDepositReferenceEvidence({
    deposit: options.deposit,
    sourceRevision: options.sourceRevision,
    read: options.read,
  });

  const manifest = buildAssetPackPipelineHostManifest({
    mode,
    read: options.read,
    readNeed: options.readNeed,
    requireAcceptedReadNeed: true,
    deposit,
    sourceRevision: options.sourceRevision,
    sourceOverlay,
    commandEnvironment,
    synthesizeMode: options.synthesizeMode ?? 'read',
    depositSteering: options.depositSteering,
  });

  const commands = usePipelineImage
    ? buildPipelineImageCommands(
        mode,
        commandEnvironment,
        pipelineImageEntry,
        sourceOverlayPatch !== null,
      )
    : buildCommands(
        mode,
        commandEnvironment,
        options.installDependencies ?? true,
        sourceOverlayPatch !== null,
      );

  // Vercel Sandbox v2: persistence is ON by default. Never leave `persistent`
  // undefined for host creates — that would silently bill Snapshot Storage
  // for one-shot deposit/read synthesis. Opt-in only when the caller sets true.
  const persistent = options.persistent === true;
  const sandboxName =
    (typeof options.sandboxName === 'string' && options.sandboxName.trim()) ||
    buildEphemeralSandboxName(options.synthesizeMode ?? 'read', options.deposit?.id);

  // runtime XOR image (Vercel SDK). Image mode = pipeline appliance.
  const createOptions: PipelineHostPlan['createOptions'] = {
    timeout: options.timeoutMs ?? DEFAULT_LONG_TIMEOUT_MS,
    networkPolicy: options.networkPolicy ?? 'allow-all',
    source: options.source,
    persistent,
    name: sandboxName,
    env: commandEnvironment,
    ...(usePipelineImage
      ? { image: sandboxImage! }
      : { runtime: options.runtime ?? VERCEL_SANDBOX_HOST_CAPABILITIES.defaultRuntime }),
  };

  // Always ship the live runner into the sandbox workspace so host plan fixes
  // apply without waiting for a Pipeliner image rebuild. Image mode still uses
  // /opt/bitcode packages; the runner is invoked with tsx from monorepo root.
  const liveRunnerMjsPath = `${HOST_RUN_DIRECTORY}/run-live-asset-pack-pipeline.mjs`;
  const files: PipelineHostPlan['files'] = [
    {
      path: MANIFEST_PATH,
      content: Buffer.from(JSON.stringify(manifest, null, 2)),
      mode: 0o644,
    },
    {
      path: liveRunnerMjsPath,
      content: Buffer.from(createLiveAssetPackPipelineRunner()),
      mode: 0o755,
    },
    ...(usePipelineImage
      ? []
      : [
          {
            path: HOST_SMOKE_RUNNER_PATH,
            content: Buffer.from(createHostSmokeRunner()),
            mode: 0o755,
          },
          {
            path: LIVE_PIPELINE_RUNNER_PATH,
            content: Buffer.from(createLiveAssetPackPipelineRunner()),
            mode: 0o755,
          },
        ]),
    ...(sourceOverlayPatch
      ? [
          {
            path: SOURCE_OVERLAY_PATCH_PATH,
            content: sourceOverlayPatch,
            mode: 0o644,
          },
        ]
      : []),
  ];

  return {
    capabilities: VERCEL_SANDBOX_HOST_CAPABILITIES,
    createOptions,
    manifest,
    files,
    sourceOverlay,
    commands,
    artifactPaths: {
      evidence: EVIDENCE_PATH,
      telemetry: TELEMETRY_PATH,
    },
  };
}

/** In-image commands: no monorepo install; single dispatcher entry. */
function buildPipelineImageCommands(
  mode: PipelineHostMode,
  commandEnvironment: Record<string, string>,
  pipelineImageEntry: string,
  hasSourceOverlayPatch: boolean,
): PipelineHostCommand[] {
  const commands: PipelineHostCommand[] = [
    {
      label: 'runtime-readiness',
      cmd: 'node',
      args: ['--version'],
      required: true,
    },
  ];

  if (hasSourceOverlayPatch) {
    commands.push({
      label: 'apply-source-overlay',
      cmd: 'git',
      args: ['apply', '--whitespace=nowarn', SOURCE_OVERLAY_PATCH_PATH],
      required: true,
    });
  }

  const maxWaitMs =
    Number(commandEnvironment.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || DEFAULT_LONG_TIMEOUT_MS) +
    120000;

  if (mode === 'asset_pack_pipeline') {
    // Prefer sandbox-uploaded runner (hot-fixed) over image-baked copy.
    // tsx loads monorepo .ts package sources under BITCODE_MONOREPO_ROOT.
    const sandboxLiveRunner = `${SANDBOX_WORKING_DIRECTORY}/${HOST_RUN_DIRECTORY}/run-live-asset-pack-pipeline.mjs`;
    const monorepoRoot = PIPELINE_IMAGE_MONOREPO_ROOT_DEFAULT;
    const pipelineRunScript = [
      `cd ${shellQuote(monorepoRoot)}`,
      // tsx loads monorepo .ts package sources (plain node cannot).
      `if ! node --import tsx -e "process.exit(0)" >/dev/null 2>&1; then`,
      `  npm install -g tsx@4.19.3 || npm install --no-save --prefix ${shellQuote(monorepoRoot)} tsx@4.19.3`,
      `fi`,
      `RUNNER=${shellQuote(sandboxLiveRunner)}`,
      `if [ ! -f "$RUNNER" ]; then RUNNER=${shellQuote(`${monorepoRoot}/.bitcode/pipeline-host/run-live-asset-pack-pipeline.mjs`)}; fi`,
      `if [ ! -f "$RUNNER" ]; then echo "live runner missing; falling back to image dispatcher" >&2; node ${shellQuote(pipelineImageEntry)}; else node --import tsx "$RUNNER"; fi`,
    ].join(' && ');
    commands.push({
      label: 'asset-pack-pipeline-run',
      cmd: 'sh',
      args: [
        '-lc',
        [
          `( ${pipelineRunScript} ) > ${shellQuote(PIPELINE_STDOUT_PATH)} 2> ${shellQuote(PIPELINE_STDERR_PATH)}`,
          'code=$?',
          `printf "%s" "$code" > ${shellQuote(PIPELINE_EXIT_CODE_PATH)}`,
          'exit "$code"',
        ].join('; '),
      ],
      env: commandEnvironment,
      detached: true,
      exitCodePath: PIPELINE_EXIT_CODE_PATH,
      stdoutPath: PIPELINE_STDOUT_PATH,
      stderrPath: PIPELINE_STDERR_PATH,
      maxWaitMs,
      pollIntervalMs: 2000,
      required: true,
    });
    return commands;
  }

  commands.push({
    label: 'host-smoke-run',
    cmd: 'node',
    args: [pipelineImageEntry],
    env: commandEnvironment,
    required: true,
  });
  return commands;
}

function normalizeDepositReferenceEvidence({
  deposit,
  sourceRevision,
  read,
}: {
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  read: PipelineReadRequest;
}): PipelineDepositReference {
  const basis = {
    depositId: deposit.id,
    assetId: deposit.assetId,
    readId: read.id,
    repositoryFullName: sourceRevision.repositoryFullName,
    branch: sourceRevision.branch,
    commit: sourceRevision.commit,
  };
  const hasProof = deposit.hasWalletOrAttestationProof === true;
  const hasMeasurement = deposit.hasAssetMeasurementEvidence === true;

  return {
    ...deposit,
    proofRoot:
      deposit.proofRoot ||
      (hasProof ? evidenceRoot('deposit-proof', basis) : deposit.proofRoot),
    measurementRoot:
      deposit.measurementRoot ||
      (hasMeasurement ? evidenceRoot('deposit-measurement', basis) : deposit.measurementRoot),
    reconciliationReadbackRoot:
      deposit.reconciliationReadbackRoot ||
      (hasProof && hasMeasurement
        ? evidenceRoot('deposit-reconciliation-readback', basis)
        : deposit.reconciliationReadbackRoot),
  };
}

function evidenceRoot(kind: string, basis: Record<string, unknown>): string {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify({ kind, ...basis }))
    .digest('hex')}`;
}

function buildCommands(
  mode: PipelineHostMode,
  commandEnvironment: Record<string, string>,
  installDependencies: boolean,
  hasSourceOverlayPatch: boolean
): PipelineHostCommand[] {
  const commands: PipelineHostCommand[] = [
    {
      label: 'runtime-readiness',
      cmd: 'node',
      args: ['--version'],
      required: true,
    },
  ];

  if (mode === 'asset_pack_pipeline') {
    if (hasSourceOverlayPatch) {
      commands.push({
        label: 'apply-source-overlay',
        cmd: 'git',
        args: ['apply', '--whitespace=nowarn', SOURCE_OVERLAY_PATCH_PATH],
        required: true,
      });
    }

    commands.push({
      label: 'package-manager-readiness',
      cmd: 'corepack',
      args: ['prepare', `pnpm@${SANDBOX_PNPM_VERSION}`, '--activate'],
      required: true,
    });

    if (installDependencies) {
      commands.push({
        label: 'workspace-install',
        cmd: 'pnpm',
        args: ['install', '--frozen-lockfile'],
        required: true,
      });
    }

    commands.push({
      label: 'host-runtime-install',
      cmd: 'npm',
      args: ['install', '--prefix', HOST_RUN_DIRECTORY, 'tsconfig-paths@4.2.0'],
      required: true,
    });

    const pipelineArgs = [
      'pnpm',
      '--filter',
      '@bitcode/pipeline-hosts',
      'exec',
      'ts-node',
      '--project',
      '../../tsconfig.json',
      '-r',
      `../../${TSCONFIG_PATHS_REGISTER_PATH}`,
      '--transpile-only',
      `../../${LIVE_PIPELINE_RUNNER_PATH}`,
    ];
    const maxWaitMs = Number(commandEnvironment.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || DEFAULT_LONG_TIMEOUT_MS) + 120000;
    commands.push({
      label: 'asset-pack-pipeline-run',
      cmd: 'sh',
      args: [
        '-lc',
        [
          `${pipelineArgs.map(shellQuote).join(' ')} > ${shellQuote(PIPELINE_STDOUT_PATH)} 2> ${shellQuote(PIPELINE_STDERR_PATH)}`,
          'code=$?',
          `printf "%s" "$code" > ${shellQuote(PIPELINE_EXIT_CODE_PATH)}`,
          'exit "$code"',
        ].join('; '),
      ],
      env: commandEnvironment,
      detached: true,
      exitCodePath: PIPELINE_EXIT_CODE_PATH,
      stdoutPath: PIPELINE_STDOUT_PATH,
      stderrPath: PIPELINE_STDERR_PATH,
      maxWaitMs,
      pollIntervalMs: 2000,
      required: true,
    });

    return commands;
  }

  commands.push({
    label: 'host-smoke-run',
    cmd: 'node',
    args: [HOST_SMOKE_RUNNER_PATH],
    env: commandEnvironment,
    required: true,
  });

  return commands;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function normalizeSourceOverlayPatch(sourceOverlayPatch?: Buffer | string): Buffer | null {
  if (typeof sourceOverlayPatch === 'string') {
    return sourceOverlayPatch.trim().length > 0 ? Buffer.from(sourceOverlayPatch) : null;
  }
  if (Buffer.isBuffer(sourceOverlayPatch)) {
    return sourceOverlayPatch.length > 0 && sourceOverlayPatch.toString('utf8').trim().length > 0
      ? sourceOverlayPatch
      : null;
  }
  return null;
}

