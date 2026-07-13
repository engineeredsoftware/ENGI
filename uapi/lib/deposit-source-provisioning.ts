/**
 * Deposit Host helpers (V48 Gate 3).
 *
 * **Cloning is not initialization.** Dispatch must not clone. Setup's
 * `asset-pack-clone-vcs-repository-agent` always clones for *this pipeline run*
 * via `deposit:cloneRepositoryForRun` (wired below for LocalHost).
 *
 * LocalHost only ever reads files from a workspace it cloned for that run —
 * never process.cwd() or residual checkouts.
 *
 * `provisionDepositCheckout` is the Host primitive the Setup factory calls:
 * shallow complete working tree at the SHA + path/sample listing. Discovery
 * later loads in-memory `sources` from that same workspace only.
 *
 * Host selection: `BITCODE_PIPELINE_HOST` (`local` | `sandbox`).
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
 * Select the deposit HostKind by CONFIGURATION (not environment): `BITCODE_PIPELINE_HOST`
 * (`local` | `sandbox`; `inline` = alias of `local`) chooses which HostKind runs the synthesis pipeline; default
 * `local`. (A SandboxHost's provider is `BITCODE_SANDBOX_PROVIDER`, `vercel` | `aws`.)
 * Pure + testable; no dev/prod or local/remote semantics.
 */
export function selectDepositHostKind(
  env: NodeJS.ProcessEnv = process.env,
): BitcodeHostKind {
  const explicit = env.BITCODE_PIPELINE_HOST?.trim().toLowerCase();
  if (explicit === "sandbox") return "sandbox";
  // `inline` is a deprecated alias of `local` (LocalHost, formerly LocalHost).
  return "local";
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
  const plan = buildAssetPackSandboxHostPlan({
    mode: "asset_pack_pipeline",
    synthesizeMode: "deposit",
    // Explicit opt-out of v2 default persistence (one-shot deposit synthesis).
    persistent: false,
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
    source: {
      type: "git",
      url: `https://github.com/${input.repositoryFullName}.git`,
      revision: input.revision,
      username: input.token ? "x-access-token" : undefined,
      password: input.token,
      depth: 1,
    },
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

  const result = await host.runHostPlan(plan);
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
