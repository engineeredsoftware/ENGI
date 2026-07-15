/**
 * Deposit Host helpers (V48 Gate 3).
 *
 * Pipeline runs always execute on a Host (LocalHost, VercelSandboxHost, …).
 * **Cloning is not initialization.** Dispatch must not clone. Setup's
 * clone-repository agent ensures the repository for this run: if the Host
 * already has the tree (e.g. VercelSandboxHost image source), adopt it;
 * otherwise LocalHost clones via `deposit:cloneRepositoryForRun`.
 *
 * Host law:
 * - **LocalHost** — developer machine only (full system access). Never on
 *   serverless/Production. Used when iterating locally with the monorepo on disk.
 * - **Sandbox (VercelSandboxHost)** — always on serverless (Vercel / Lambda).
 *   Synthesis spawns a microVM; optional VCR pipeline image via
 *   `BITCODE_PIPELINE_SANDBOX_IMAGE`.
 *
 * Host selection: `BITCODE_PIPELINE_HOST` (`local` | `sandbox`); serverless
 * runtimes always resolve to `sandbox` even if `local` is misconfigured.
 */

import {
  LocalHost,
  VercelSandboxPipelineHost,
  assertVercelSandboxAuthAvailable,
  buildAssetPackSandboxHostPlan,
  loadVercelSandboxFactory,
  readWorkspaceSources,
  type BitcodeHostKind,
  type BitcodeHostWorkspace,
  type BitcodePipelineHost,
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

/** @deprecated Use DepositCheckoutSourceCatalog */
export type ProvisionedDepositInventory = DepositCheckoutSourceCatalog;

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
 * - `inline` is a deprecated alias of `local`.
 */
export function selectDepositHostKind(
  env: NodeJS.ProcessEnv = process.env,
): BitcodeHostKind {
  if (isServerlessPipelineRuntime(env)) {
    return 'sandbox';
  }
  const explicit = env.BITCODE_PIPELINE_HOST?.trim().toLowerCase();
  if (explicit === 'sandbox') return 'sandbox';
  // local | inline | unset → LocalHost on developer machines only
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
}

/** Full or abbreviated git object id (7–40 hex). */
const GIT_COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i;

export type DepositSandboxGitRevisionStrategy =
  | "branch-shallow"
  | "commit-full"
  | "ref-shallow";

/**
 * Git source for `Sandbox.create` deposit clones.
 *
 * Vercel Sandbox performs a single git clone at create time. A common failure
 * is `bad_request: git clone failed` when `revision` is a commit SHA with
 * `depth: 1` — shallow clones fetch advertised refs (branches/tags), not
 * arbitrary SHAs (GitHub often rejects unadvertised objects).
 *
 * Strategy (mirrors LocalHost intent, adapted for create-time-only clone):
 * 1. **Branch present** → shallow clone that branch tip (`depth: 1`).
 * 2. **Commit SHA only** → full clone at that revision (omit `depth`).
 * 3. **Other ref** (tag / symbolic) → shallow clone that ref.
 *
 * Evidence still records the exact `commit` via `sourceRevision`; only the
 * create-time clone ref is adjusted for Vercel reachability.
 */
export function buildDepositSandboxGitSource(input: {
  repositoryFullName: string;
  /** Preferred product revision (often the selected commit SHA). */
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
  /** Ref actually passed to Sandbox.create (branch, SHA, or other). */
  cloneRevision: string;
  depth: number | null;
} {
  const branch = input.branch?.trim() || "";
  const commit = (input.commit || "").trim();
  const revision = (input.revision || "").trim();
  const url = `https://github.com/${input.repositoryFullName}.git`;
  const auth =
    input.token
      ? { username: "x-access-token" as const, password: input.token }
      : {};

  // Prefer a non-SHA branch name even when revision/commit is a full SHA.
  if (branch && !GIT_COMMIT_SHA_RE.test(branch)) {
    return {
      source: {
        type: "git",
        url,
        revision: branch,
        depth: 1,
        ...auth,
      },
      strategy: "branch-shallow",
      cloneRevision: branch,
      depth: 1,
    };
  }

  const effective = commit || revision || "HEAD";
  if (GIT_COMMIT_SHA_RE.test(effective)) {
    // Omit depth: shallow + bare SHA is the create failure mode we hit in prod.
    return {
      source: {
        type: "git",
        url,
        revision: effective,
        ...auth,
      },
      strategy: "commit-full",
      cloneRevision: effective,
      depth: null,
    };
  }

  return {
    source: {
      type: "git",
      url,
      revision: effective,
      depth: 1,
      ...auth,
    },
    strategy: "ref-shallow",
    cloneRevision: effective,
    depth: 1,
  };
}

/**
 * Run the deposit synthesis IN the sandbox box (#25). Builds an asset-pack host in
 * DEPOSIT mode (git source for the revision + steering), dispatches it on the sandbox
 * host (the pipeline runs in the box, reading its local checkout), and returns the
 * synthesized options surfaced in the evidence (`depositOptions`). The host is
 * injectable so the dispatch is unit-tested without a real sandbox.
 *
 * Cooperative cancel: pass `shouldAbort` (typically polling executions.status).
 *
 * Vercel Sandbox v2 defaults to *persistent* sandboxes (auto-snapshot on stop,
 * Snapshot Storage billed separately). Deposit synthesis is a one-shot CI-style
 * workload — always `persistent: false` so stop discards the FS and we do not
 * accrue snapshot storage. The host also best-effort `delete()`s after stop.
 */
export async function runDepositInBoxHost(input: {
  repositoryFullName: string;
  revision: string;
  branch: string | null;
  commit: string | null;
  token?: string;
  obfuscations: string | null;
  forcedExclusions: string[];
  demandContext: string[];
  onEvent?: (event: PipelineHostEvent) => void;
  shouldAbort?: () => boolean | Promise<boolean>;
  hostFactory?: () => Promise<DepositInBoxHost>;
}): Promise<DepositInBoxHostResult> {
  const gitSource = buildDepositSandboxGitSource({
    repositoryFullName: input.repositoryFullName,
    revision: input.revision,
    branch: input.branch,
    commit: input.commit,
    token: input.token,
  });
  const plan = buildAssetPackSandboxHostPlan({
    mode: "asset_pack_pipeline",
    synthesizeMode: "deposit",
    // Explicit opt-out of v2 default persistence (one-shot deposit synthesis).
    persistent: false,
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
    source: gitSource.source,
    depositSteering: {
      obfuscations: input.obfuscations,
      forcedExclusions: input.forcedExclusions,
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
    synthesizeMode: plan.manifest.synthesizeMode ?? null,
    repositoryFullName: input.repositoryFullName,
    gitRevisionStrategy: gitSource.strategy,
    gitCloneRevision: gitSource.cloneRevision,
    gitDepth: gitSource.depth,
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
  bitcodeServerTelemetry("info", "deposit-sandbox-host", "run-complete", {
    ...createSummary,
    outcome: result?.outcome ?? null,
    sandboxId: result?.sandboxId ?? null,
    optionCount: Array.isArray(
      (result?.artifacts?.evidence as { depositOptions?: unknown[] } | null)?.depositOptions,
    )
      ? (result!.artifacts!.evidence as { depositOptions: unknown[] }).depositOptions.length
      : null,
  });
  if (result?.outcome === "cancelled") {
    return {
      options: [],
      sandboxId: result.sandboxId ?? null,
      outcome: "cancelled",
    };
  }
  const evidence = result?.artifacts?.evidence as {
    depositOptions?: unknown;
  } | null;
  const options =
    evidence && Array.isArray(evidence.depositOptions)
      ? evidence.depositOptions
      : [];
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

/** @deprecated Prefer readDepositCheckoutSourceFiles */
export const materializeDepositInventorySources = readDepositCheckoutSourceFiles;

/**
 * @deprecated Prefer provisionDepositCheckout + Discovery source-file load.
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
