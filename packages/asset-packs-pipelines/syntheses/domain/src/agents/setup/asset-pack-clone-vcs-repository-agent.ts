/**
 * AssetPack Pipeline - Clone VCS Repository Agent (Setup).
 *
 * Pipeline executions always run on a **Host** (LocalHost, VercelSandboxHost, …).
 * Cloning is a Setup responsibility only — never pre-pipeline initialization,
 * never inside a serverless function process, and not via Sandbox.create git
 * source (that is outside the pipeline).
 *
 * For this pipeline run the agent ensures a **complete working tree at the
 * requested SHA/ref** (all files; shallow history is fine):
 * 1. If the Host wired `deposit:cloneRepositoryForRun` (LocalHost deposit),
 *    clone into an ephemeral Host workspace for this run only.
 * 2. Else if `BITCODE_HOST_CLONE_*` env is set (sandbox deposit: create with
 *    image only + clone specs in env), multi-step git clone **inside the box**.
 * 3. Else if the Host already has a real checkout for this run (`.git` present
 *    or explicit workspace path), adopt that tree.
 * 4. Else clone via the Setup VCS clone tool on the Host.
 *
 * LocalHost never reads paths outside the workspace cloned for this run.
 * Discovery builds the source catalog from that same tree (not a second clone).
 */

import { execFile } from 'node:child_process';
import { existsSync, statSync, promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import {
  SYSTEM_PROMPT_VCS,
  VCS_PLAN_PROMPT,
  VCS_TRY_PROMPT,
  VCS_REFINE_PROMPT,
  VCS_RETRY_PROMPT,
} from '@bitcode/generic-agents-vcs';
import {
  provisionGitWorkingTree,
  readHostCloneEnv,
  type HostExec,
} from '@bitcode/host-generics';
import {
  DP_CLONE_VCS_SYSTEM_PROMPT,
  DP_CLONE_VCS_PLAN_PROMPT,
  DP_CLONE_VCS_TRY_PROMPT,
  DP_CLONE_VCS_REFINE_PROMPT,
  DP_CLONE_VCS_RETRY_PROMPT,
} from '../prompts/asset-pack-vcs-clone-repository-agent-prompts';
import { z } from 'zod';
import { log } from '@bitcode/logger';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { applyInventoryScope } from '../../asset-packs-synthesis-inventory';

/** Execution key: async () => Host workspace cloned for this deposit run only (LocalHost). */
export const DEPOSIT_CLONE_REPOSITORY_FOR_RUN_KEY = 'cloneRepositoryForRun';

const AssetPackCloneVCSRepoInputSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket']).describe('VCS provider'),
  owner: z.string().describe('Repository owner'),
  name: z.string().describe('Repository name'),
  ref: z.string().optional().default('main').describe('Branch/ref'),
  connectionId: z.number().optional().describe('Connection/installation id'),
});

/** Optional tool selection for Try/Retry task SO (tools postprocess). Omit on Plan/Refine. */
const UseToolSelectionSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string().optional(),
});

const AssetPackCloneVCSRepoOutputSchema = z.object({
  success: z.boolean(),
  repository: z.object({ owner: z.string(), name: z.string(), ref: z.string().optional() }),
  // Models often emit null before tools run; accept and treat as absent.
  workspacePath: z.string().nullish(),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  // Try/Retry: select asset-pack-clone-vcs-repository-tool here (or on reason; hoist merges).
  useTools: z.array(UseToolSelectionSchema).optional(),
}).describe(
  '{ "success": boolean, "repository": { "owner": string, "name": string, "ref"?: string }, "workspacePath"?: string | null, "status"?: string, "metadata"?: Record<string, any>, "useTools"?: [{ "name": string, "input": any, "reason"?: string }] }',
);

export const AssetPackCloneVCSRepositoryAgentSystemPrompt: Prompt = (() => {
  const merged = SYSTEM_PROMPT_VCS.clone();
  merged.merge(DP_CLONE_VCS_SYSTEM_PROMPT);
  merged.require('pipeline').require('phase');
  return merged;
})();

const planPrompt = (() => {
  const m = VCS_PLAN_PROMPT.clone();
  m.merge(DP_CLONE_VCS_PLAN_PROMPT);
  m.require('pipeline').require('phase');
  return m;
})();
const tryPrompt = (() => {
  const m = VCS_TRY_PROMPT.clone();
  m.merge(DP_CLONE_VCS_TRY_PROMPT);
  m.require('pipeline').require('phase');
  return m;
})();
const refinePrompt = (() => {
  const m = VCS_REFINE_PROMPT.clone();
  m.merge(DP_CLONE_VCS_REFINE_PROMPT);
  m.require('pipeline').require('phase');
  return m;
})();
const retryPrompt = (() => {
  const m = VCS_RETRY_PROMPT.clone();
  m.merge(DP_CLONE_VCS_RETRY_PROMPT);
  m.require('pipeline').require('phase');
  return m;
})();

export const AssetPackCloneVCSRepositoryAgent = factoryPTRRAgent<
  z.infer<typeof AssetPackCloneVCSRepoInputSchema>,
  z.infer<typeof AssetPackCloneVCSRepoOutputSchema>
>({
  name: 'asset-pack-clone-vcs-repository-agent',
  description:
    'Setup on Host: ensure complete repository working tree at SHA/ref for this pipeline run (adopt Host checkout or clone)',
  outputSchema: AssetPackCloneVCSRepoOutputSchema,
  prompt: AssetPackCloneVCSRepositoryAgentSystemPrompt,
  // Step prompts keyed by name; factoryPTRRAgent runs Plan→Try→Retry→Refine.
  stepPrompts: {
    plan: () => planPrompt,
    try: () => tryPrompt,
    retry: () => retryPrompt,
    refine: () => refinePrompt,
  },
  tools: ['asset-pack-clone-vcs-repository-tool'],
  plan: { chunkThreshold: 1000 },
  try: { chunkThreshold: 2000 },
  retry: { maxAttempts: 1 },
  refine: { maxAttempts: 1 },
});

function findExecutionValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolveHostSourceRevision(input: any, execution: any): Record<string, unknown> | null {
  const fromInput = input?.sourceRevision;
  if (fromInput && typeof fromInput === 'object') return fromInput as Record<string, unknown>;
  const fromHost = findExecutionValue(execution, 'host', 'sourceRevision');
  if (fromHost && typeof fromHost === 'object') return fromHost as Record<string, unknown>;
  return null;
}

function normalizeRepositoryInput(input: any, execution: any): {
  owner: string;
  name: string;
  ref: string;
  provider: string;
  commit?: string;
} | null {
  const repository =
    input?.repository ??
    findExecutionValue(execution, 'deposit', 'repository') ??
    findExecutionValue(execution, 'pipeline', 'input')?.repository ??
    {};
  const sourceRevision = resolveHostSourceRevision(input, execution) ?? {};
  const fullName =
    repository.fullName ??
    repository.repositoryFullName ??
    sourceRevision.repositoryFullName;
  const [ownerFromFullName, nameFromFullName] =
    typeof fullName === 'string' && fullName.includes('/')
      ? fullName.split('/', 2)
      : [undefined, undefined];
  const owner = input?.owner ?? repository.owner ?? ownerFromFullName;
  const name = input?.name ?? repository.name ?? repository.repo ?? nameFromFullName;

  if (!owner || !name) return null;

  return {
    owner: String(owner),
    name: String(name),
    ref: String(input?.ref ?? repository.branch ?? sourceRevision.branch ?? 'main'),
    provider: String(input?.provider ?? repository.provider ?? sourceRevision.provider ?? 'github'),
    commit:
      (typeof repository.commit === 'string' ? repository.commit : undefined) ??
      (typeof sourceRevision.commit === 'string' ? sourceRevision.commit : undefined),
  };
}

/**
 * True when the Host already has this run's repository working tree available.
 * Must be a real checkout — never treat bare `sourceRevision` metadata as proof
 * the customer tree is on disk (that falsely adopted empty sandbox CWD).
 */
function resolveHostAvailableWorkspace(
  input: any,
  execution: any,
): { workspacePath: string; availability: string } | null {
  const explicitPath =
    (typeof input?.workspacePath === 'string' && input.workspacePath.trim()) ||
    (typeof input?.repository?.workspacePath === 'string' && input.repository.workspacePath.trim()) ||
    findExecutionValue(execution, 'host', 'workspacePath') ||
    findExecutionValue(execution, 'repository', 'workspacePath') ||
    null;
  if (typeof explicitPath === 'string' && explicitPath.length > 0) {
    return { workspacePath: explicitPath, availability: 'host-workspace-path' };
  }

  // Legacy create-time git source: only adopt CWD when a real .git exists.
  // (New deposit path uses BITCODE_HOST_CLONE_* + Setup multi-step clone.)
  const cwd = process.cwd();
  if (existsSync(path.join(cwd, '.git'))) {
    return { workspacePath: cwd, availability: 'host-cwd-git-present' };
  }

  return null;
}

function defaultSetupHostExec(): HostExec {
  return (cmd, args, opts) =>
    new Promise((resolve) => {
      execFile(
        cmd,
        args,
        {
          cwd: opts?.cwd,
          env: opts?.env ? { ...process.env, ...opts.env } : process.env,
          maxBuffer: 64 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          const code =
            error && typeof (error as NodeJS.ErrnoException & { code?: unknown }).code === 'number'
              ? (error as unknown as { code: number }).code
              : error
                ? 1
                : 0;
          resolve({
            exitCode: code,
            stdout: stdout?.toString() ?? '',
            stderr: stderr?.toString() ?? '',
          });
        },
      );
    });
}

function slugRepo(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'repo';
}

/**
 * Setup in-box clone using BITCODE_HOST_CLONE_* env (sandbox deposit law path).
 * Multi-step git — not Vercel Sandbox.create source.
 */
async function cloneFromHostEnvForRun(execution: any): Promise<{
  workspacePath: string;
  listFiles: () => Promise<string[]>;
  readFile: (p: string) => Promise<string | null>;
  strategy: string;
} | null> {
  const spec = readHostCloneEnv();
  if (!spec) return null;

  const repoName = spec.repositoryFullName || 'customer/repo';
  const root =
    spec.root ||
    process.env.BITCODE_PIPELINE_HOST_ARTIFACT_DIR?.replace(/\/\.bitcode\/pipeline-host\/?$/, '') ||
    (existsDir('/vercel/sandbox') ? '/vercel/sandbox' : os.tmpdir());
  const workspacePath = path.join(
    root,
    `customer-source-${slugRepo(repoName)}-${Date.now().toString(36)}`,
  );

  log('[setup/clone] in-box host-env clone starting', 'info', {
    repository: repoName,
    branch: spec.branch,
    commit: spec.commit ? `${spec.commit.slice(0, 12)}…` : null,
    hasToken: Boolean(spec.password),
    root,
  });

  const exec = defaultSetupHostExec();
  const result = await provisionGitWorkingTree({
    url: spec.url,
    username: spec.username,
    password: spec.password,
    branch: spec.branch,
    commit: spec.commit,
    revision: spec.commit || spec.branch || 'HEAD',
    workspacePath,
    exec,
  });

  log('[setup/clone] in-box host-env clone complete', 'info', {
    strategy: result.strategy,
    workspacePath: result.workspacePath,
  });

  return {
    workspacePath: result.workspacePath,
    strategy: result.strategy,
    listFiles: async () => {
      const listed = await exec('git', ['-C', result.workspacePath, 'ls-files']);
      if (listed.exitCode !== 0) return [];
      return listed.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    },
    readFile: async (relativePath: string) => {
      const absRoot = path.resolve(result.workspacePath);
      const absolute = path.resolve(result.workspacePath, relativePath);
      if (absolute !== absRoot && !absolute.startsWith(absRoot + path.sep)) return null;
      try {
        return await fs.readFile(absolute, 'utf8');
      } catch {
        return null;
      }
    },
  };
}

function existsDir(dirPath: string): boolean {
  try {
    return existsSync(dirPath) && statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function presentCheckoutResult(
  normalized: NonNullable<ReturnType<typeof normalizeRepositoryInput>>,
  workspacePath: string,
  status: string,
  hostProvision: string,
) {
  return {
    success: true,
    repository: {
      owner: normalized.owner,
      name: normalized.name,
      ref: normalized.ref,
    },
    workspacePath,
    status,
    metadata: {
      provider: normalized.provider,
      sourceCommit: normalized.commit,
      hostProvision,
      workingTree: 'complete-at-revision',
    },
  };
}

const SAMPLE_MAX_FILES = 24;
const SAMPLE_MAX_CHARS = 4000;
const SAMPLE_PRIORITY = [
  /^readme/i,
  /^package\.json$/i,
  /^pyproject\.toml$/i,
  /^cargo\.toml$/i,
  /^go\.mod$/i,
];

/** Bounded samples read only from the run's Host workspace. */
async function pickSamplesFromWorkspace(workspace: {
  readFile: (path: string) => Promise<string | null>;
}, allPaths: string[]): Promise<{ path: string; excerpt: string }[]> {
  const prioritized = allPaths.filter((path) =>
    SAMPLE_PRIORITY.some((pattern) => pattern.test(path.split('/').pop() || '')),
  );
  const sourceLike = allPaths.filter(
    (path) =>
      !prioritized.includes(path) &&
      /\.(ts|tsx|js|jsx|py|rs|go|rb|java|cs|swift|sol|md)$/i.test(path) &&
      path.split('/').length <= 3,
  );
  const samplePaths = [...prioritized, ...sourceLike].slice(0, SAMPLE_MAX_FILES);
  const samples: { path: string; excerpt: string }[] = [];
  for (const samplePath of samplePaths) {
    const content = await workspace.readFile(samplePath);
    if (content == null) continue;
    samples.push({ path: samplePath, excerpt: content.slice(0, SAMPLE_MAX_CHARS) });
  }
  return samples;
}

/**
 * After Host clone/adopt: list paths from *this* workspace only, scope them,
 * store the source catalog, and bind Discovery's file-body loader to this tree.
 */
async function recordDepositCatalogFromRunWorkspace(
  execution: any,
  workspace: {
    workspacePath: string;
    listFiles: () => Promise<string[]>;
    readFile: (path: string) => Promise<string | null>;
  },
): Promise<void> {
  const paths = await workspace.listFiles();
  const samples = await pickSamplesFromWorkspace(workspace, paths);
  const permissibleSources =
    findExecutionValue(execution, 'deposit', 'permissibleSources') ?? [];
  const impermissibleSources =
    findExecutionValue(execution, 'deposit', 'impermissibleSources') ?? [];
  const catalog = applyInventoryScope(
    { paths, samples, sources: [] },
    {
      permissibleSources: Array.isArray(permissibleSources) ? permissibleSources : [],
      impermissibleSources: Array.isArray(impermissibleSources) ? impermissibleSources : [],
    },
  );
  storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', catalog);
  storeCrossPhaseArtifact(execution, 'deposit', 'loadSourceCheckoutFileBodies', async () => {
    const allPaths = await workspace.listFiles();
    const sources: { path: string; content: string }[] = [];
    for (const path of allPaths) {
      const content = await workspace.readFile(path);
      if (content == null) continue;
      sources.push({ path, content });
    }
    return sources;
  });
  storeCrossPhaseArtifact(execution, 'deposit', 'loadCheckoutSourceFiles', async () => {
    const allPaths = await workspace.listFiles();
    const sources: { path: string; content: string }[] = [];
    for (const path of allPaths) {
      const content = await workspace.readFile(path);
      if (content == null) continue;
      sources.push({ path, content });
    }
    return sources;
  });
}

function forceClonePtrr(): boolean {
  const v = String(process.env.BITCODE_DEBUG_FORCE_CLONE_PTRR || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export default async function runAssetPackCloneVCSRepositoryAgent(input: any, execution: any) {
  const safeStore = (ns: string, key: string, val: unknown) => {
    try {
      execution.store(ns as any, key as any, val as any);
    } catch (err) {
      try {
        log('[setup/clone] store failed', 'warn', {
          ns,
          key,
          err: err instanceof Error ? err.message : String(err),
        });
      } catch {
        /* ignore */
      }
    }
  };

  const normalized = normalizeRepositoryInput(input, execution);
  const cloneForRun =
    findExecutionValue(execution, 'deposit', DEPOSIT_CLONE_REPOSITORY_FOR_RUN_KEY) ??
    findExecutionValue(execution, 'deposit', 'cloneRepositoryForRun');

  let out: any;

  // Debug: force the real PTRR clone agent (Plan→Try→Retry→Refine + clone tool)
  // so LLM call-by-call passes can exercise the agent instead of host short-circuits.
  if (forceClonePtrr()) {
    log('[setup/clone] BITCODE_DEBUG_FORCE_CLONE_PTRR — using PTRR agent path', 'info', {
      hasNormalized: Boolean(normalized),
      hasCloneForRun: typeof cloneForRun === 'function',
      hasHostCloneEnv: Boolean(readHostCloneEnv()),
    });
    out = await AssetPackCloneVCSRepositoryAgent(input, execution);
    if (out && typeof out === 'object') {
      out = {
        ...out,
        metadata: {
          ...(out.metadata || {}),
          workingTree: 'complete-at-revision',
          hostProvision: 'debug-force-clone-ptrr',
        },
      };
    }
  } else if (normalized && typeof cloneForRun === 'function') {
    // 1) LocalHost deposit: Host-wired factory always clones for this run.
    const workspace = await cloneForRun();
    const workspacePath =
      typeof workspace?.workspacePath === 'string' ? workspace.workspacePath.trim() : '';
    if (!workspacePath) {
      throw new Error(
        'Setup cloneRepositoryForRun did not return a Host workspacePath for this pipeline run',
      );
    }
    if (typeof workspace.listFiles !== 'function' || typeof workspace.readFile !== 'function') {
      throw new Error(
        'Setup Host workspace must expose listFiles/readFile for this run only',
      );
    }
    await recordDepositCatalogFromRunWorkspace(execution, workspace);
    out = presentCheckoutResult(
      normalized,
      workspacePath,
      'cloned-for-run',
      'localhost-clone-for-run',
    );
  } else if (normalized) {
    // 2) Sandbox deposit: clone customer repo inside the box from host env
    //    (Sandbox.create had image only — no create-time git source).
    const hostEnvClone = await cloneFromHostEnvForRun(execution);
    if (hostEnvClone) {
      await recordDepositCatalogFromRunWorkspace(execution, hostEnvClone);
      out = presentCheckoutResult(
        normalized,
        hostEnvClone.workspacePath,
        'cloned-for-run',
        `setup-in-box-${hostEnvClone.strategy}`,
      );
    } else {
      // 3) Host already has a real checkout for this run.
      const hostAvailable = resolveHostAvailableWorkspace(input, execution);
      if (hostAvailable) {
        out = presentCheckoutResult(
          normalized,
          hostAvailable.workspacePath,
          'host-source-present',
          hostAvailable.availability,
        );
      } else {
        // 4) Clone on the Host via Setup VCS tool (real PTRR agent).
        log('[setup/clone] falling back to Setup VCS clone tool', 'info', {
          hasNormalized: Boolean(normalized),
          hasHostCloneEnv: Boolean(readHostCloneEnv()),
        });
        out = await AssetPackCloneVCSRepositoryAgent(input, execution);
        if (out && typeof out === 'object') {
          out = {
            ...out,
            metadata: {
              ...(out.metadata || {}),
              workingTree: 'complete-at-revision',
              hostProvision: 'setup-clone-on-host',
            },
          };
        }
      }
    }
  } else {
    out = await AssetPackCloneVCSRepositoryAgent(input, execution);
  }

  // Cross-phase store (shared root): Validation/Finish findUp must see workspacePath
  // after Setup ends. Plain execution.store only lands on the agent child node.
  const { storeCrossPhaseArtifact } = await import('../../synthesize-asset-packs');
  if (out?.workspacePath) {
    storeCrossPhaseArtifact(execution, 'repository', 'workspacePath', out.workspacePath);
    safeStore('repository', 'workspacePath', out.workspacePath);
  }
  if (out?.repository?.owner) {
    storeCrossPhaseArtifact(execution, 'repository', 'owner', out.repository.owner);
    safeStore('repository', 'owner', out.repository.owner);
  }
  if (out?.repository?.name) {
    storeCrossPhaseArtifact(execution, 'repository', 'name', out.repository.name);
    safeStore('repository', 'name', out.repository.name);
  }
  if (out?.repository?.ref) {
    storeCrossPhaseArtifact(execution, 'repository', 'branch', out.repository.ref);
    safeStore('repository', 'branch', out.repository.ref);
  }
  if ((input as any)?.provider || normalized?.provider) {
    const provider = (input as any)?.provider ?? normalized?.provider;
    storeCrossPhaseArtifact(execution, 'repository', 'provider', provider);
    safeStore('repository', 'provider', provider);
  }
  if ((input as any)?.connectionId) {
    storeCrossPhaseArtifact(execution, 'repository', 'connectionId', String((input as any).connectionId));
    safeStore('repository', 'connectionId', String((input as any).connectionId));
  }
  if (normalized?.commit) {
    storeCrossPhaseArtifact(execution, 'repository', 'commit', normalized.commit);
    safeStore('repository', 'commit', normalized.commit);
  }

  return out;
}
