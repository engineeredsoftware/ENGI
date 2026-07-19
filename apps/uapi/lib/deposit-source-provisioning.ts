/**
 * Deposit Host helpers (V48 Gate 3).
 *
 * Pipeline runs always execute on a Host (LocalHost, VercelSandboxHost, …).
 * **Cloning is not initialization.** Dispatch must not clone. Cloning inside a
 * serverless function process is forbidden. Customer-repo clone is Setup only.
 *
 * Host law:
 * - **LocalHost** — developer machine only. Never on serverless/Production.
 *   Clones via `deposit:cloneRepositoryForRun` during Setup on the laptop.
 * - **Sandbox** — always on serverless (Vercel / Lambda). Spawns a microVM from
 *   the Pipeliner image (`BITCODE_PIPELINE_SANDBOX_IMAGE`). Create is **image
 *   only** (no `source: git`) — create-time customer clone is outside the
 *   pipeline and was the production `git clone failed` 400 mode. Clone specs
 *   pass via `BITCODE_HOST_CLONE_*` env; Setup's clone-repository agent
 *   multi-step clones **inside the box**.
 *
 * Host selection: `BITCODE_PIPELINE_HOST` (`local` | `sandbox`); serverless
 * always resolves to `sandbox` even if `local` is misconfigured.
 */

import {
  LocalHost,
  VercelSandboxPipelineHost,
  assertVercelSandboxAuthAvailable,
  buildAssetPackSandboxHostPlan,
  buildHostCloneEnvEntries,
  loadVercelSandboxFactory,
  readWorkspaceSources,
  resolveGitClonePlan,
  type BitcodeHostKind,
  type BitcodeHostWorkspace,
  type BitcodePipelineHost,
  type GitWorkingTreeStrategy,
  type HostSourceFile,
  type PipelineHostEvent,
  type PipelineHostRunResult,
} from "@bitcode/pipeline-hosts";
import {
  DEPOSIT_MAX_SAMPLE_CHARS,
  pickDepositSourceSamplePaths,
  pickDepositSourceSamples,
} from "@/lib/deposit-source-samples";
import { bitcodeServerTelemetry } from "@/lib/bitcode-server-telemetry";
import {
  selectedPipelineHostCommandEnvironment,
  summarizeSelectedLlmCredentials,
} from "@/lib/pipeline-host-command-env";

/**
 * Path/sample catalog for the depositor checkout (scope + prompts).
 * The clone itself already has all files at the SHA; `sources` (in-memory
 * file bodies for measurement) fill in Discovery from that same tree.
 */
export interface DepositCheckoutSourceCatalog {
  paths: string[];
  samples: { path: string; excerpt: string }[];
  /** In-memory file bodies for measurement — loaded from the live checkout in Discovery. */
  sources: HostSourceFile[];
  truncated: boolean;
}


/**
 * Host checkout of the complete working tree at the revision.
 * Kept open until the SDIVF run ends so Setup/Discovery/Impl/Validation share it.
 */
export interface ProvisionedDepositCheckout {
  /** Path list + prompt samples (catalog); tree itself is complete on disk. */
  sourceCatalog: DepositCheckoutSourceCatalog;
  workspace: BitcodeHostWorkspace;
  dispose: () => Promise<void>;
}

/**
 * True when the process is a deployed serverless runtime (not a laptop dev server).
 * Vercel sets `VERCEL=1` / `VERCEL_ENV` on Production and Preview functions.
 */
export function isServerlessPipelineRuntime(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.BITCODE_PIPELINE_RUNTIME?.trim().toLowerCase() === 'serverless') {
    return true;
  }
  if (env.VERCEL === '1') return true;
  if (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview') return true;
  if (env.AWS_LAMBDA_FUNCTION_NAME) return true;
  return false;
}

/**
 * Select deposit HostKind.
 *
 * - **Serverless:** always `sandbox` (LocalHost cannot run pipelines on Vercel).
 *   Explicit `BITCODE_PIPELINE_HOST=local` is ignored on serverless.
 * - **Local machine:** default `local` (LocalHost); set `BITCODE_PIPELINE_HOST=sandbox`
 *   to exercise the sandbox path from a laptop (needs Vercel auth).
 * - Host kinds are only `local` | `sandbox` (no dual names).
 */
export function selectDepositHostKind(
  env: NodeJS.ProcessEnv = process.env,
): BitcodeHostKind {
  if (isServerlessPipelineRuntime(env)) {
    return 'sandbox';
  }
  const explicit = env.BITCODE_PIPELINE_HOST?.trim().toLowerCase();
  if (explicit === 'sandbox') return 'sandbox';
  // local | unset → LocalHost on developer machines only
  return 'local';
}

/**
 * Resolve the LOCAL deposit Host for provision + in-process SDIVF.
 *
 * Sandbox deposit does NOT use this primitive: the pipeline runs IN the box via
 * `runDepositInBoxHost` / `VercelSandboxPipelineHost` (Gate-3 #25). Callers
 * that need sandbox must branch on `selectDepositHostKind()` and use the host
 * path — never treat this as a generic multi-host resolver.
 */
export async function resolveDepositPipelineHost(): Promise<BitcodePipelineHost> {
  if (selectDepositHostKind() === "sandbox") {
    throw new Error(
      "Sandbox deposit uses runDepositInBoxHost (VercelSandboxPipelineHost), not " +
        "resolveDepositPipelineHost. Set BITCODE_PIPELINE_HOST=local for LocalHost " +
        "provision + in-process SDIVF, or use the route sandbox branch.",
    );
  }
  return new LocalHost();
}

/** A host that can run a host plan (the VercelSandboxPipelineHost shape). */
export interface DepositInBoxHost {
  runHostPlan(plan: unknown): Promise<PipelineHostRunResult>;
}

export interface DepositInBoxHostResult {
  options: unknown[];
  sandboxId: string | null;
  outcome: PipelineHostRunResult["outcome"];
  /** Operator-safe failure summary when outcome is failed (no secrets). */
  failureMessage?: string | null;
}

const HOST_FAILURE_SNIPPET = 800;

/**
 * Build an operator-visible failure message from a sandbox host run.
 * Prefer command stderr, then evidence.error / resultReasons — never invent
 * Validation "zero options" when the host/pipeline never completed.
 */
export function formatDepositHostFailure(result: {
  outcome?: string | null;
  sandboxId?: string | null;
  commands?: Array<{
    label?: string;
    exitCode?: number | null;
    stderr?: string;
    stdout?: string;
  }>;
  artifacts?: {
    evidence?: unknown | null;
    telemetry?: string | null;
  } | null;
}): string {
  const parts: string[] = [];
  const failedCmd = [...(result.commands || [])]
    .reverse()
    .find((c) => c.exitCode != null && c.exitCode !== 0 && c.exitCode !== 130);
  if (failedCmd) {
    parts.push(
      `host command "${failedCmd.label || 'unknown'}" exited ${failedCmd.exitCode}`,
    );
    const errTail = (failedCmd.stderr || failedCmd.stdout || "").trim();
    if (errTail) {
      parts.push(errTail.slice(-HOST_FAILURE_SNIPPET));
    }
  }

  const evidence = result.artifacts?.evidence as {
    error?: { message?: string; name?: string } | null;
    resultReasons?: unknown;
    resultState?: unknown;
    depositOptions?: unknown;
  } | null;

  if (evidence?.error?.message) {
    parts.push(
      `pipeline error: ${String(evidence.error.name || "Error")}: ${String(evidence.error.message).slice(0, 400)}`,
    );
  }
  if (Array.isArray(evidence?.resultReasons) && evidence!.resultReasons!.length > 0) {
    parts.push(
      `resultReasons: ${evidence!.resultReasons!.slice(0, 4).map(String).join("; ")}`.slice(
        0,
        500,
      ),
    );
  }
  if (evidence?.resultState) {
    parts.push(`resultState=${String(evidence.resultState)}`);
  }

  // Last telemetry lines often hold the real Setup/pipeline stack.
  const telemetry = result.artifacts?.telemetry;
  if (typeof telemetry === "string" && telemetry.trim()) {
    const lines = telemetry.trim().split(/\r?\n/).filter(Boolean);
    const tail = lines.slice(-3);
    for (const line of tail) {
      try {
        const parsed = JSON.parse(line) as { type?: string; message?: string; error?: { message?: string } };
        const msg =
          parsed.error?.message ||
          parsed.message ||
          (parsed.type ? `telemetry:${parsed.type}` : null);
        if (msg) parts.push(String(msg).slice(0, 240));
      } catch {
        parts.push(line.slice(0, 240));
      }
    }
  }

  if (parts.length === 0) {
    return `Sandbox deposit host run failed (outcome=${result.outcome || "failed"}, sandboxId=${result.sandboxId || "none"}). No command stderr or evidence was returned — rebuild Pipeliner image if Setup in-box clone is missing.`;
  }
  return `Sandbox deposit host failed: ${parts.join(" | ")}`.slice(0, 1800);
}

export type DepositSandboxGitRevisionStrategy = GitWorkingTreeStrategy;

/**
 * Prefer `resolveGitClonePlan` + `buildHostCloneEnvEntries` (Setup in-box clone).
 * Kept as a pure plan helper for tests / diagnostics of the old shape.
 */
export function buildDepositSandboxGitSource(input: {
  repositoryFullName: string;
  revision: string;
  branch: string | null;
  commit: string | null;
  token?: string;
}): {
  source: {
    type: "git";
    url: string;
    revision: string;
    username?: string;
    password?: string;
    depth?: number;
  };
  strategy: DepositSandboxGitRevisionStrategy;
  cloneRevision: string;
  depth: number | null;
} {
  const plan = resolveGitClonePlan({
    branch: input.branch,
    commit: input.commit,
    revision: input.revision,
  });
  const url = `https://github.com/${input.repositoryFullName}.git`;
  const auth = input.token
    ? { username: "x-access-token" as const, password: input.token }
    : {};
  // Diagnostic only — do not pass this to Sandbox.create for deposit.
  const revision = plan.cloneBranch || plan.pinCommit || input.revision || "HEAD";
  return {
    source: {
      type: "git",
      url,
      revision,
      depth: 1,
      ...auth,
    },
    strategy: plan.strategy,
    cloneRevision: plan.cloneRevisionLabel,
    depth: 1,
  };
}

/**
 * Run the deposit synthesis IN the sandbox box (#25).
 *
 * Host law for serverless:
 * - Sandbox.create uses **Pipeliner image only** (no `source: git`).
 * - Customer-repo clone specs go in env (`BITCODE_HOST_CLONE_*`).
 * - Setup's clone-repository agent multi-step clones **inside the box**.
 * - No git clone in the serverless function process.
 *
 * Vercel Sandbox v2: always `persistent: false` for one-shot deposit.
 */
export async function runDepositInBoxHost(input: {
  repositoryFullName: string;
  revision: string;
  branch: string | null;
  commit: string | null;
  token?: string;
  /** Product user id for BITCODE_PIPELINE_USER_ID + DB streaming attribution. */
  userId?: string;
  /** Run id for BITCODE_PIPELINE_RUN_ID correlation. */
  runId?: string;
  obfuscations: string | null;
  permissibleSources: string[];
  impermissibleSources: string[];
  demandContext: string[];
  onEvent?: (event: PipelineHostEvent) => void;
  shouldAbort?: () => boolean | Promise<boolean>;
  hostFactory?: () => Promise<DepositInBoxHost>;
}): Promise<DepositInBoxHostResult> {
  const clonePlan = resolveGitClonePlan({
    branch: input.branch,
    commit: input.commit || input.revision,
    revision: input.revision,
  });
  const hostCloneEnv = buildHostCloneEnvEntries({
    repositoryFullName: input.repositoryFullName,
    branch: input.branch,
    commit: input.commit || input.revision,
    token: input.token,
    root: "/vercel/sandbox",
  });
  // Same trusted host env as /api/pipeline-host/asset-pack: LLM keys (XAI_*),
  // Supabase streaming, real-inference defaults. Clone env overlays last so
  // BITCODE_HOST_CLONE_* always wins for Setup in-box clone.
  const trustedHostEnv = selectedPipelineHostCommandEnvironment(
    input.userId || "deposit-anonymous",
  );
  const commandEnvironment: Record<string, string> = {
    ...trustedHostEnv,
    ...hostCloneEnv,
    ...(input.runId ? { BITCODE_PIPELINE_RUN_ID: input.runId } : {}),
  };

  const plan = buildAssetPackSandboxHostPlan({
    mode: "asset_pack_pipeline",
    synthesizeMode: "deposit",
    // Explicit opt-out of v2 default persistence (one-shot deposit synthesis).
    persistent: false,
    // Create image only — Setup clones customer repo in-box (not create-time git).
    assumeRepositoryPresent: true,
    // Production: BITCODE_PIPELINE_SANDBOX_IMAGE → VCR appliance (no stock runtime).
    read: {
      id: `deposit-read-${input.repositoryFullName}`,
      prompt: "Deposit synthesis (no read need).",
    },
    deposit: { id: `deposit-${input.repositoryFullName}` },
    sourceRevision: {
      repositoryFullName: input.repositoryFullName,
      branch: input.branch || "main",
      commit: input.commit || input.revision,
    },
    // Never pass source: git here — that clones outside the pipeline and failed
    // production runs with bad_request: git clone failed.
    commandEnvironment,
    depositSteering: {
      obfuscations: input.obfuscations,
      permissibleSources: input.permissibleSources,
      impermissibleSources: input.impermissibleSources,
      demandContext: input.demandContext,
    },
  });
  let host: DepositInBoxHost;
  if (input.hostFactory) {
    host = await input.hostFactory();
  } else {
    assertVercelSandboxAuthAvailable();
    host = new VercelSandboxPipelineHost({
      sandboxFactory: await loadVercelSandboxFactory(),
      onEvent: input.onEvent,
      shouldAbort: input.shouldAbort,
    });
  }

  // Source-safe create summary for always-on logs (no tokens / no full env).
  const createSummary = {
    image: plan.createOptions.image ?? null,
    runtime: plan.createOptions.runtime ?? null,
    name: plan.createOptions.name ?? null,
    persistent: plan.createOptions.persistent === true,
    timeoutMs: plan.createOptions.timeout ?? null,
    hasGitSource: Boolean(plan.createOptions.source),
    cloneLocation: "setup-in-box" as const,
    hasHostCloneEnv: Boolean(hostCloneEnv.BITCODE_HOST_CLONE_URL),
    hasHostCloneToken: Boolean(input.token),
    ...summarizeSelectedLlmCredentials(commandEnvironment),
    realInference: commandEnvironment.BITCODE_ASSET_PACK_REAL_INFERENCE ?? null,
    synthesizeMode: plan.manifest.synthesizeMode ?? null,
    repositoryFullName: input.repositoryFullName,
    gitRevisionStrategy: clonePlan.strategy,
    gitCloneRevision: clonePlan.cloneRevisionLabel,
    sourceCommit: input.commit || null,
    sourceBranch: input.branch || null,
  };
  bitcodeServerTelemetry("info", "deposit-sandbox-host", "plan-ready", createSummary);

  let result: Awaited<ReturnType<DepositInBoxHost["runHostPlan"]>>;
  try {
    result = await host.runHostPlan(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    bitcodeServerTelemetry("error", "deposit-sandbox-host", "run-failed", {
      ...createSummary,
      message: message.slice(0, 500),
    });
    throw error;
  }
  const evidenceRaw = result?.artifacts?.evidence as {
    depositOptions?: unknown;
    error?: { message?: string } | null;
    resultState?: unknown;
  } | null;
  const optionCount = Array.isArray(evidenceRaw?.depositOptions)
    ? evidenceRaw!.depositOptions!.length
    : null;
  const failedCommands = (result?.commands || []).filter(
    (c) => c.exitCode != null && c.exitCode !== 0 && c.exitCode !== 130,
  );

  bitcodeServerTelemetry("info", "deposit-sandbox-host", "run-complete", {
    ...createSummary,
    outcome: result?.outcome ?? null,
    sandboxId: result?.sandboxId ?? null,
    optionCount,
    failedCommandLabels: failedCommands.map((c) => c.label).slice(0, 8),
    failedExitCodes: failedCommands.map((c) => c.exitCode).slice(0, 8),
    evidenceResultState: evidenceRaw?.resultState ?? null,
    evidenceError: evidenceRaw?.error?.message
      ? String(evidenceRaw.error.message).slice(0, 300)
      : null,
    hasEvidence: evidenceRaw != null,
    hasTelemetry: Boolean(result?.artifacts?.telemetry),
  });

  if (result?.outcome === "cancelled") {
    return {
      options: [],
      sandboxId: result.sandboxId ?? null,
      outcome: "cancelled",
    };
  }

  if (result?.outcome === "failed") {
    const failureMessage = formatDepositHostFailure(result);
    bitcodeServerTelemetry("error", "deposit-sandbox-host", "host-outcome-failed", {
      ...createSummary,
      sandboxId: result.sandboxId ?? null,
      message: failureMessage.slice(0, 800),
      failedCommandLabels: failedCommands.map((c) => c.label).slice(0, 8),
    });
    const err = new Error(failureMessage) as Error & { hostOutcome?: string };
    err.hostOutcome = "failed";
    throw err;
  }

  const options =
    evidenceRaw && Array.isArray(evidenceRaw.depositOptions)
      ? evidenceRaw.depositOptions
      : [];

  // Completed host with no options is a pipeline/product miss — not Validation
  // path-admission (that path only applies when options were produced).
  if (options.length === 0) {
    const detail = formatDepositHostFailure({
      ...result,
      outcome: "completed-empty-options",
    });
    const message =
      `Sandbox deposit pipeline completed with zero depositOptions. ${detail}`.slice(
        0,
        1800,
      );
    bitcodeServerTelemetry("error", "deposit-sandbox-host", "empty-deposit-options", {
      ...createSummary,
      sandboxId: result?.sandboxId ?? null,
      message: message.slice(0, 800),
    });
    throw new Error(message);
  }

  return {
    options,
    sandboxId: result.sandboxId ?? null,
    outcome: result?.outcome ?? "failed",
  };
}

/**
 * Host primitive used by Setup (`deposit:cloneRepositoryForRun`): clone the
 * complete working tree at the revision for **this run only**, list paths +
 * prompt samples from that tree. Not for pre-pipeline / "Initializing" work.
 */
export async function provisionDepositCheckout(input: {
  host: BitcodePipelineHost;
  repositoryFullName: string;
  url: string;
  revision: string;
  token?: string;
}): Promise<ProvisionedDepositCheckout> {
  const workspace = await input.host.provisionRepository({
    repositoryFullName: input.repositoryFullName,
    url: input.url,
    revision: input.revision,
    username: input.token ? "x-access-token" : undefined,
    password: input.token,
  });
  const paths = await workspace.listFiles();
  const samplePaths = pickDepositSourceSamplePaths(paths);
  const samples: { path: string; excerpt: string }[] = [];
  for (const samplePath of samplePaths) {
    // Only files from this run's clone — never residual paths.
    const content = await workspace.readFile(samplePath);
    if (content == null) continue;
    samples.push({
      path: samplePath,
      excerpt: content.slice(0, DEPOSIT_MAX_SAMPLE_CHARS),
    });
  }
  return {
    sourceCatalog: {
      paths,
      samples,
      sources: [],
      truncated: false,
    },
    workspace,
    dispose: () => workspace.dispose(),
  };
}

/**
 * Build the Setup-phase `deposit:cloneRepositoryForRun` factory for LocalHost.
 * Invoked **only** from Setup's clone-repository agent — never during route init.
 * Returns a Host workspace cloned for this pipeline run; Setup lists paths from it.
 */
export function createDepositLocalHostCloneForRun(input: {
  host: BitcodePipelineHost;
  repositoryFullName: string;
  url: string;
  revision: string;
  token?: string;
  onWorkspace?: (workspace: BitcodeHostWorkspace) => void;
}): () => Promise<BitcodeHostWorkspace> {
  let cloned: BitcodeHostWorkspace | null = null;
  return async () => {
    if (cloned) return cloned;
    const workspace = await input.host.provisionRepository({
      repositoryFullName: input.repositoryFullName,
      url: input.url,
      revision: input.revision,
      username: input.token ? "x-access-token" : undefined,
      password: input.token,
    });
    cloned = workspace;
    input.onWorkspace?.(workspace);
    return workspace;
  };
}

/**
 * Read full verbatim file bodies from a live Host checkout.
 * Used by Discovery (codebase comprehension) to fill the source catalog's `sources`.
 */
export async function readDepositCheckoutSourceFiles(
  workspace: BitcodeHostWorkspace,
): Promise<HostSourceFile[]> {
  return readWorkspaceSources(workspace);
}


/**
 * One-shot full catalog load (disposes workspace). Kept for tests.
 */
export async function provisionDepositSourceInventory(input: {
  host: BitcodePipelineHost;
  repositoryFullName: string;
  url: string;
  revision: string;
  token?: string;
}): Promise<DepositCheckoutSourceCatalog> {
  const checkout = await provisionDepositCheckout(input);
  try {
    const sources = await readDepositCheckoutSourceFiles(checkout.workspace);
    return {
      paths: sources.map((file) => file.path),
      samples: pickDepositSourceSamples(sources),
      sources,
      truncated: false,
    };
  } finally {
    await checkout.dispose();
  }
}
