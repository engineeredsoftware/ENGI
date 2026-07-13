/**
 * AssetPack Pipeline - Clone VCS Repository Agent (Setup).
 *
 * Cloning is a **Setup** responsibility (not pre-pipeline "initialization").
 * It always produces a **complete working tree at the requested SHA/ref** for
 * *this pipeline run* — all files on disk, shallow history is fine and fast.
 *
 * Deposit LocalHost: dispatch stores `deposit:cloneRepositoryForRun` (a factory
 * that clones into an ephemeral Host workspace for this run only). Setup invokes
 * it here — never reads process.cwd() or any path not cloned for this run.
 *
 * Sandbox harness: the host plan already cloned the source into the box for
 * this run; adopt that checkout (still this-run-specific).
 *
 * Discovery builds the source *catalog* (paths/samples/bodies) from this tree;
 * that is not a second clone.
 */

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

/** Execution key: async () => Host workspace cloned for this deposit run only. */
export const DEPOSIT_CLONE_REPOSITORY_FOR_RUN_KEY = 'cloneRepositoryForRun';

const AssetPackCloneVCSRepoInputSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket']).describe('VCS provider'),
  owner: z.string().describe('Repository owner'),
  name: z.string().describe('Repository name'),
  ref: z.string().optional().default('main').describe('Branch/ref'),
  connectionId: z.number().optional().describe('Connection/installation id'),
});

const AssetPackCloneVCSRepoOutputSchema = z.object({
  success: z.boolean(),
  repository: z.object({ owner: z.string(), name: z.string(), ref: z.string().optional() }),
  workspacePath: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).describe('{ "success": boolean, "repository": { "owner": string, "name": string, "ref"?: string }, "workspacePath"?: string, "status"?: string, "metadata"?: Record<string, any> }');

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
    'Setup: clone the VCS repository working tree at the requested SHA/ref (all files) for this pipeline run',
  outputSchema: AssetPackCloneVCSRepoOutputSchema,
  prompt: AssetPackCloneVCSRepositoryAgentSystemPrompt,
  stepPrompts: {
    plan: () => planPrompt,
    try: () => tryPrompt,
    refine: () => refinePrompt,
    retry: () => retryPrompt,
  },
  tools: ['asset-pack-clone-vcs-repository-tool'],
  plan: { chunkThreshold: 1000 },
  try: { chunkThreshold: 2000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 },
});

function findExecutionValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
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
  const sourceRevision =
    input?.sourceRevision ??
    findExecutionValue(execution, 'harness', 'sourceRevision') ??
    {};
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
    commit: repository.commit ?? sourceRevision.commit,
  };
}

function presentCheckoutResult(
  normalized: NonNullable<ReturnType<typeof normalizeRepositoryInput>>,
  workspacePath: string,
  status: string,
  cloneMode: string,
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
      cloneMode,
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

/** Bounded samples read only from the run's cloned workspace. */
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
 * After a run-scoped clone: list paths from *this* workspace only, scope them,
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
  const inclusions = findExecutionValue(execution, 'deposit', 'forcedInclusions') ?? [];
  const exclusions = findExecutionValue(execution, 'deposit', 'forcedExclusions') ?? [];
  const catalog = applyInventoryScope(
    { paths, samples, sources: [] },
    {
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      exclusions: Array.isArray(exclusions) ? exclusions : [],
    },
  );
  storeCrossPhaseArtifact(execution, 'deposit', 'inventory', catalog);
  // Discovery / measurement may only read bodies from this run's checkout.
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

  // 1) Deposit LocalHost (and any host that wires a run-scoped cloner): ALWAYS clone here.
  const cloneForRun =
    findExecutionValue(execution, 'deposit', DEPOSIT_CLONE_REPOSITORY_FOR_RUN_KEY) ??
    findExecutionValue(execution, 'deposit', 'cloneRepositoryForRun');

  let out: any;
  if (normalized && typeof cloneForRun === 'function') {
    const workspace = await cloneForRun();
    const workspacePath =
      typeof workspace?.workspacePath === 'string' ? workspace.workspacePath.trim() : '';
    if (!workspacePath) {
      throw new Error(
        'Setup cloneRepositoryForRun did not return a workspacePath for this pipeline run',
      );
    }
    if (typeof workspace.listFiles !== 'function' || typeof workspace.readFile !== 'function') {
      throw new Error(
        'Setup cloneRepositoryForRun workspace must expose listFiles/readFile for this run only',
      );
    }
    await recordDepositCatalogFromRunWorkspace(execution, workspace);
    out = presentCheckoutResult(
      normalized,
      workspacePath,
      'cloned-for-run',
      'deposit-run-clone',
    );
  } else if (normalized && Boolean(input?.harness)) {
    // 2) Sandbox host plan already cloned *this run's* source into the box.
    out = presentCheckoutResult(
      normalized,
      process.cwd(),
      'source-revision-present',
      'vercel-sandbox-source',
    );
  } else {
    // 3) Generic Setup clone via VCS tool (non-deposit / no host factory).
    out = await AssetPackCloneVCSRepositoryAgent(input, execution);
    if (out && typeof out === 'object') {
      out = {
        ...out,
        metadata: {
          ...(out.metadata || {}),
          workingTree: 'complete-at-revision',
          cloneMode: 'setup-clone-agent',
        },
      };
    }
  }

  if (out?.workspacePath) safeStore('repository', 'workspacePath', out.workspacePath);
  if (out?.repository?.owner) safeStore('repository', 'owner', out.repository.owner);
  if (out?.repository?.name) safeStore('repository', 'name', out.repository.name);
  if (out?.repository?.ref) safeStore('repository', 'branch', out.repository.ref);
  if ((input as any)?.provider || normalized?.provider) {
    safeStore('repository', 'provider', (input as any)?.provider ?? normalized?.provider);
  }
  if ((input as any)?.connectionId) {
    safeStore('repository', 'connectionId', String((input as any).connectionId));
  }
  if (normalized?.commit) safeStore('repository', 'commit', normalized.commit);

  return out;
}
