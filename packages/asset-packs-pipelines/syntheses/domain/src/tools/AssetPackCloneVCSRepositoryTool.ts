import { PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_metadata_label';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PIPELINE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_pipeline';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PHASE_SETUP } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_phase_setup';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_PURPOSE_ADDENDUM } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_purpose_addendum';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_CAPABILITIES_ADDENDUM } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_capabilities_addendum';
/**
 * AssetPack Pipeline - Clone VCS Repository Tool
 *
 * Accepts agent Try/Retry useTools selection shape
 * `{ provider, owner, name, ref, ... }` and clones via public HTTPS git
 * (provider-agnostic URL). Returns agent-friendly
 * `{ success, repository, workspacePath, status, metadata }`.
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { Tool } from '@bitcode/tools-generics';
import type { Prompt } from '@bitcode/prompts/prompt';

import { REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT } from '@bitcode/generic-tools-repository-setup';

const execFileAsync = promisify(execFile);

const ASSET_PACK_CLONE_REPOSITORY_TOOL_OVERLAY_PROMPT: Prompt = (() => {
  const p = REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT.clone();
  p.set('metadata:label', PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL as any, 5);
  p.set('metadata:pipeline', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PIPELINE as any, 5);
  p.set('metadata:phase', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PHASE_SETUP as any, 5);
  p.set('purpose:asset-pack:addendum', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_PURPOSE_ADDENDUM as any, 5);
  p.set('capabilities:asset-pack:addendum', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_CAPABILITIES_ADDENDUM as any, 5);
  return p;
})();

export const ASSET_PACK_CLONE_REPOSITORY_TOOL_PROMPT: Prompt = (() => {
  const merged = REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT.clone();
  merged.merge(ASSET_PACK_CLONE_REPOSITORY_TOOL_OVERLAY_PROMPT);
  return merged;
})();

export type AssetPackCloneToolInput = {
  provider?: string;
  owner?: string;
  name?: string;
  ref?: string;
  branch?: string;
  commit?: string;
  targetPath?: string;
  workspacePath?: string;
  shallow?: boolean;
  /** Legacy multi-repo setup shape (ignored if owner/name present). */
  repositories?: Array<{
    provider?: string;
    owner: string;
    name: string;
    ref?: string;
    commit?: string;
  }>;
  [key: string]: unknown;
};

export type AssetPackCloneToolOutput = {
  success: boolean;
  repository: { owner: string; name: string; ref?: string };
  workspacePath?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
  /** Alias for consumers that read `path`. */
  path?: string;
  error?: string;
};

function cloneUrl(provider: string, owner: string, name: string): string {
  switch (String(provider || 'github').toLowerCase()) {
    case 'gitlab':
      return `https://gitlab.com/${owner}/${name}.git`;
    case 'bitbucket':
      return `https://bitbucket.org/${owner}/${name}.git`;
    default:
      return `https://github.com/${owner}/${name}.git`;
  }
}

function normalizeTargets(input: AssetPackCloneToolInput): Array<{
  provider: string;
  owner: string;
  name: string;
  ref: string;
  commit?: string;
}> {
  if (Array.isArray(input.repositories) && input.repositories.length > 0) {
    return input.repositories.map((r) => ({
      provider: String(r.provider || input.provider || 'github'),
      owner: String(r.owner),
      name: String(r.name),
      ref: String(r.ref || input.ref || input.branch || 'main'),
      commit: r.commit || (typeof input.commit === 'string' ? input.commit : undefined),
    }));
  }
  const owner = input.owner;
  const name = input.name;
  if (!owner || !name) return [];
  return [
    {
      provider: String(input.provider || 'github'),
      owner: String(owner),
      name: String(name),
      ref: String(input.ref || input.branch || 'main'),
      commit: typeof input.commit === 'string' ? input.commit : undefined,
    },
  ];
}

function looksLikeCommitSha(value: string): boolean {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

async function gitCloneOne(target: {
  provider: string;
  owner: string;
  name: string;
  ref: string;
  commit?: string;
}, dest: string, shallow: boolean): Promise<void> {
  const url = cloneUrl(target.provider, target.owner, target.name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const checkout = target.commit || target.ref;
  const isSha = checkout ? looksLikeCommitSha(checkout) : false;

  // SHA checkouts need history; branch names can be shallow.
  const useShallow = shallow && !isSha;
  const args = ['clone', url, dest];
  if (useShallow) {
    args.splice(1, 0, '--depth', '1');
    if (checkout && checkout !== 'HEAD') {
      args.splice(1, 0, '--branch', checkout);
    }
  }
  await execFileAsync('git', args, { maxBuffer: 64 * 1024 * 1024 });

  if (checkout && checkout !== 'HEAD' && !useShallow) {
    await execFileAsync('git', ['-C', dest, 'checkout', checkout], {
      maxBuffer: 16 * 1024 * 1024,
    });
  } else if (isSha && useShallow) {
    // Should not happen (useShallow false for sha); keep safe path.
    await execFileAsync('git', ['-C', dest, 'fetch', '--depth', '1', 'origin', checkout], {
      maxBuffer: 64 * 1024 * 1024,
    });
    await execFileAsync('git', ['-C', dest, 'checkout', 'FETCH_HEAD'], {
      maxBuffer: 16 * 1024 * 1024,
    });
  }
}

/**
 * Clone one repository for AssetPack Setup. Prefer agent single-repo shape.
 */
export async function assetPackCloneVCSRepositoryUse(
  input: AssetPackCloneToolInput,
): Promise<AssetPackCloneToolOutput> {
  const targets = normalizeTargets(input || {});
  if (!targets.length) {
    return {
      success: false,
      repository: { owner: '', name: '' },
      workspacePath: null,
      status: 'invalid_input',
      error: 'owner and name (or repositories[]) required',
      metadata: { inputKeys: Object.keys(input || {}) },
    };
  }

  const target = targets[0];
  const dest =
    (typeof input.targetPath === 'string' && input.targetPath.trim()) ||
    (typeof input.workspacePath === 'string' && input.workspacePath.trim()) ||
    path.join(
      os.tmpdir(),
      `bitcode-clone-${target.owner}-${target.name}-${Date.now().toString(36)}`,
    );
  const shallow = input.shallow !== false; // default shallow for speed

  try {
    await gitCloneOne(target, dest, shallow);
    return {
      success: true,
      repository: {
        owner: target.owner,
        name: target.name,
        ref: target.commit || target.ref,
      },
      workspacePath: dest,
      path: dest,
      status: 'cloned',
      metadata: {
        provider: target.provider,
        checkoutMethod: 'git-https',
        shallow,
        url: cloneUrl(target.provider, target.owner, target.name),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      repository: {
        owner: target.owner,
        name: target.name,
        ref: target.ref,
      },
      workspacePath: null,
      status: 'clone_failed',
      error: message,
      metadata: {
        provider: target.provider,
        message,
      },
    };
  }
}

/**
 * @doc-code-tool
 * @prompt ASSET_PACK_CLONE_REPOSITORY_TOOL_PROMPT
 */
export class AssetPackCloneVCSRepositoryTool extends Tool<typeof assetPackCloneVCSRepositoryUse> {
  use = assetPackCloneVCSRepositoryUse;
}

export const assetPackCloneVCSRepositoryTool = new AssetPackCloneVCSRepositoryTool();
(assetPackCloneVCSRepositoryTool as any).name = 'asset-pack-clone-vcs-repository-tool';
(assetPackCloneVCSRepositoryTool as any).__docCodePrompt = ASSET_PACK_CLONE_REPOSITORY_TOOL_PROMPT;
