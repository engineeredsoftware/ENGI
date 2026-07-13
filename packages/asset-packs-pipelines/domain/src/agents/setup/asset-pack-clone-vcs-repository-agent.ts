/**
 * AssetPack Pipeline - Clone VCS Repository Agent
 *
 * Pipeline-specific agent that wraps repository cloning via the
 * AssetPack clone tool. Prompts are AssetPack-specific and
 * cumulative over any generic base expectations.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';

// Import generic VCS agent prompts to extend (system + step prompts)
import {
  SYSTEM_PROMPT_VCS,
  VCS_PLAN_PROMPT,
  VCS_TRY_PROMPT,
  VCS_REFINE_PROMPT,
  VCS_RETRY_PROMPT,
} from '@bitcode/generic-agents-vcs';

// AssetPack prompts (system + steps) using registry append semantics
import {
  DP_CLONE_VCS_SYSTEM_PROMPT,
  DP_CLONE_VCS_PLAN_PROMPT,
  DP_CLONE_VCS_TRY_PROMPT,
  DP_CLONE_VCS_REFINE_PROMPT,
  DP_CLONE_VCS_RETRY_PROMPT,
} from '../prompts/asset-pack-vcs-clone-repository-agent-prompts';
import { z } from 'zod';

// Tool mapping happens in tools/index.ts (agentName → assetPackCloneVCSRepositoryTool)

// -------------------- Schemas --------------------

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

// -------------------- Prompts --------------------

// Base minimal prompt (kept local; no direct generic agent import)
// AssetPack-specific system prompt built from PromptParts and placed under
// child paths to append to any base prompt (when available in future).
export const AssetPackCloneVCSRepositoryAgentSystemPrompt: Prompt = (() => {
  // Extend the generic VCS system prompt with AssetPack-specific parts
  const merged = SYSTEM_PROMPT_VCS.clone();
  merged.merge(DP_CLONE_VCS_SYSTEM_PROMPT);
  // Require keys we add so format validation fails loudly if missing
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

// -------------------- Agent --------------------

export const AssetPackCloneVCSRepositoryAgent = factoryAgentWithPTRR<
  z.infer<typeof AssetPackCloneVCSRepoInputSchema>,
  z.infer<typeof AssetPackCloneVCSRepoOutputSchema>
>({
  name: 'asset-pack-clone-vcs-repository-agent',
  description: 'Clone VCS repository (provider-agnostic) for AssetPack pipeline',
  outputSchema: AssetPackCloneVCSRepoOutputSchema,

  // Prompts (cumulative): built from AssetPack PromptParts; when generic base
  // system prompt becomes available, we will clone().merge() it and then merge these additions.
  prompt: AssetPackCloneVCSRepositoryAgentSystemPrompt,
  stepPrompts: {
    plan: () => planPrompt,
    try: () => tryPrompt,
    refine: () => refinePrompt,
    retry: () => retryPrompt
  },

  // Tool is provided via registry mapping (see tools/index.ts)
  // Use the AssetPack wrapper tool registry key
  tools: ['asset-pack-clone-vcs-repository-tool'],

  plan: { chunkThreshold: 1000 },
  try: { chunkThreshold: 2000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 }
});

// Wrapper default export adds execution-state normalization using EE stores.
import { log } from '@bitcode/logger';

function normalizeRepositoryInput(input: any, execution: any): {
  owner: string;
  name: string;
  ref: string;
  provider: string;
  commit?: string;
} | null {
  const repository =
    input?.repository ??
    execution?.get?.('pipeline', 'input')?.repository ??
    {};
  const sourceRevision =
    input?.sourceRevision ??
    execution?.get?.('harness', 'sourceRevision') ??
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

export default async function runAssetPackCloneVCSRepositoryAgent(input: any, execution: any) {
  // Store normalization is best-effort and must never block agent success.
  const safeStore = (ns: string, key: string, val: unknown) => {
    try { execution.store(ns as any, key as any, val as any); }
    catch (err) { try { log('[setup/clone] store failed', 'warn', { ns, key, err: err instanceof Error ? err.message : String(err) }); } catch {} }
  };

  const normalized = normalizeRepositoryInput(input, execution);
  const repositoryAlreadyPresent =
    normalized &&
    (input?.harness || input?.sourceRevision || input?.repository?.fullName);
  const out = repositoryAlreadyPresent
    ? {
        success: true,
        repository: {
          owner: normalized.owner,
          name: normalized.name,
          ref: normalized.ref,
        },
        workspacePath: process.cwd(),
        status: 'source-revision-present',
        metadata: {
          provider: normalized.provider,
          sourceCommit: normalized.commit,
          cloneMode: 'vercel-sandbox-source',
        },
      }
    : await AssetPackCloneVCSRepositoryAgent(input, execution);

  if (out?.workspacePath) safeStore('repository', 'workspacePath', out.workspacePath);
  if (out?.repository?.owner) safeStore('repository', 'owner', out.repository.owner);
  if (out?.repository?.name) safeStore('repository', 'name', out.repository.name);
  if (out?.repository?.ref) safeStore('repository', 'branch', out.repository.ref);
  if ((input as any)?.provider || normalized?.provider) safeStore('repository', 'provider', (input as any)?.provider ?? normalized?.provider);
  if ((input as any)?.connectionId) safeStore('repository', 'connectionId', String((input as any).connectionId));
  if (normalized?.commit) safeStore('repository', 'commit', normalized.commit);

  return out;
}
