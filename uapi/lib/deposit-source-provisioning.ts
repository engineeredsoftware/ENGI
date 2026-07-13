/**
 * Deposit source provisioning (V48 Gate 3).
 *
 * The deposit harness run provisions the FULL repository checkout on the primitive
 * Host (LocalHost in-process here; the Vercel Sandbox host in prod), then builds the
 * synthesis inventory FROM the checkout — every tracked file's verbatim content for
 * measurement (`sources`), plus bounded representative excerpts for the prompts
 * (`samples`). This retires the GitHub-API sample stopgap; the same `{path, content}`
 * shape works on either Host implementation.
 *
 * Host selection: LocalHost is valid only where the runtime has git + a filesystem
 * (the dev persistent Node server, NOT a serverless function). Prod deposit runs on
 * the Vercel Sandbox host (the standing host loose end); when wired,
 * resolveDepositPipelineHost returns it.
 *
 * Sample picking lives in deposit-source-samples.ts.
 */

import {
  LocalHost,
  VercelSandboxPipelineHost,
  assertVercelSandboxAuthAvailable,
  buildAssetPackSandboxHarness,
  loadVercelSandboxFactory,
  readWorkspaceSources,
  type BitcodeHostKind,
  type BitcodePipelineHost,
  type HostSourceFile,
  type PipelineHarnessHostEvent,
  type PipelineHarnessRunResult,
} from "@bitcode/pipeline-hosts";
import { pickDepositSourceSamples } from "@/lib/deposit-source-samples";

export interface ProvisionedDepositInventory {
  paths: string[];
  samples: { path: string; excerpt: string }[];
  sources: HostSourceFile[];
  truncated: boolean;
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
  // `inline` is a deprecated alias of `local` (LocalHost, formerly InlineHost).
  return "local";
}

/**
 * Resolve the LOCAL deposit Host for provision + in-process SDIVF.
 *
 * Sandbox deposit does NOT use this primitive: the pipeline runs IN the box via
 * `runDepositInBoxHarness` / `VercelSandboxPipelineHost` (Gate-3 #25). Callers
 * that need sandbox must branch on `selectDepositHostKind()` and use the harness
 * path — never treat this as a generic multi-host resolver.
 */
export async function resolveDepositPipelineHost(): Promise<BitcodePipelineHost> {
  if (selectDepositHostKind() === "sandbox") {
    throw new Error(
      "Sandbox deposit uses runDepositInBoxHarness (VercelSandboxPipelineHost), not " +
        "resolveDepositPipelineHost. Set BITCODE_PIPELINE_HOST=local for LocalHost " +
        "provision + in-process SDIVF, or use the route sandbox branch.",
    );
  }
  return new LocalHost();
}

/** A host that can run a harness plan (the VercelSandboxPipelineHost shape). */
export interface DepositInBoxHarnessHost {
  runHarness(plan: unknown): Promise<PipelineHarnessRunResult>;
}

export interface DepositInBoxHarnessResult {
  options: unknown[];
  sandboxId: string | null;
  outcome: PipelineHarnessRunResult["outcome"];
}

/**
 * Run the deposit synthesis IN the sandbox box (#25). Builds an asset-pack harness in
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
export async function runDepositInBoxHarness(input: {
  repositoryFullName: string;
  revision: string;
  branch: string | null;
  commit: string | null;
  token?: string;
  obfuscations: string | null;
  forcedExclusions: string[];
  demandContext: string[];
  onEvent?: (event: PipelineHarnessHostEvent) => void;
  shouldAbort?: () => boolean | Promise<boolean>;
  hostFactory?: () => Promise<DepositInBoxHarnessHost>;
}): Promise<DepositInBoxHarnessResult> {
  const plan = buildAssetPackSandboxHarness({
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
  let host: DepositInBoxHarnessHost;
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

  const result = await host.runHarness(plan);
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
    sandboxId: result?.sandboxId ?? null,
    outcome: result?.outcome ?? "failed",
  };
}

/**
 * Provision the full checkout on the Host and build the deposit inventory from it.
 * Reads every tracked file's verbatim content (`sources`, for measurement), derives
 * bounded `samples` (for prompts), and disposes the workspace. The host is passed in
 * so callers/tests choose the implementation.
 */
export async function provisionDepositSourceInventory(input: {
  host: BitcodePipelineHost;
  repositoryFullName: string;
  url: string;
  revision: string;
  token?: string;
}): Promise<ProvisionedDepositInventory> {
  const workspace = await input.host.provisionRepository({
    repositoryFullName: input.repositoryFullName,
    url: input.url,
    revision: input.revision,
    username: input.token ? "x-access-token" : undefined,
    password: input.token,
  });
  try {
    // Every tracked file, verbatim — the full source the static-analysis measurement reads.
    const sources = await readWorkspaceSources(workspace);
    return {
      paths: sources.map((file) => file.path),
      samples: pickDepositSourceSamples(sources),
      sources,
      truncated: false,
    };
  } finally {
    await workspace.dispose();
  }
}
