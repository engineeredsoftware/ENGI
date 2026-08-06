/**
 * Shared Host git working-tree provisioner.
 *
 * Host law:
 * - Serverless must never clone (no git in Vercel/Lambda process memory).
 * - Vercel Sandbox.create({ source: git }) is also not Setup — it clones
 *   outside the pipeline. Prefer create({ image }) only, then clone **inside**
 *   the sandbox during Setup (this helper).
 * - LocalHost uses the same multi-step strategy on developer machines.
 *
 * Why multi-step (not create-time single-shot):
 * `git clone --depth 1 <url> <sha>` often fails (unadvertised objects). We
 * clone an advertised ref (branch) shallowly, then optionally fetch+checkout
 * a pin commit — matching what works on GitHub with install tokens.
 */

import type { HostExec } from './host';

/** Full or abbreviated git object id (7–40 hex). */
export const GIT_COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i;

/** Env keys for in-box Setup clone (passed via Sandbox createOptions.env). */
export const BITCODE_HOST_CLONE_ENV = {
  URL: 'BITCODE_HOST_CLONE_URL',
  BRANCH: 'BITCODE_HOST_CLONE_BRANCH',
  COMMIT: 'BITCODE_HOST_CLONE_COMMIT',
  USERNAME: 'BITCODE_HOST_CLONE_USERNAME',
  PASSWORD: 'BITCODE_HOST_CLONE_PASSWORD',
  /** Parent directory for the checkout (default: os tmp or /vercel/sandbox). */
  ROOT: 'BITCODE_HOST_CLONE_ROOT',
  REPOSITORY: 'BITCODE_HOST_CLONE_REPOSITORY',
} as const;

export type GitWorkingTreeStrategy =
  | 'branch-shallow'
  | 'branch-shallow-pin-commit'
  | 'commit-fetch'
  | 'ref-shallow';

export interface GitClonePlan {
  strategy: GitWorkingTreeStrategy;
  /** Passed to `git clone --branch` when set. */
  cloneBranch: string | null;
  /** After clone, shallow-fetch + checkout this commit when set. */
  pinCommit: string | null;
  /** Human/debug label for the clone target. */
  cloneRevisionLabel: string;
}

export interface HostCloneEnvSpec {
  url: string;
  branch: string | null;
  commit: string | null;
  username: string | null;
  password: string | null;
  root: string | null;
  repositoryFullName: string | null;
}

export function isGitCommitSha(value: string): boolean {
  return GIT_COMMIT_SHA_RE.test((value || '').trim());
}

/**
 * Resolve how to clone: prefer advertised branch for shallow clone; pin commit
 * via post-clone fetch when needed.
 */
export function resolveGitClonePlan(input: {
  branch?: string | null;
  commit?: string | null;
  revision?: string | null;
}): GitClonePlan {
  const branch = (input.branch || '').trim();
  const commit = (input.commit || '').trim();
  const revision = (input.revision || '').trim();

  if (branch && !isGitCommitSha(branch)) {
    const pin = commit && isGitCommitSha(commit) ? commit : null;
    return {
      strategy: pin ? 'branch-shallow-pin-commit' : 'branch-shallow',
      cloneBranch: branch,
      pinCommit: pin,
      cloneRevisionLabel: pin ? `${branch}@${pin.slice(0, 12)}` : branch,
    };
  }

  const effective = commit || revision || 'HEAD';
  if (isGitCommitSha(effective)) {
    return {
      strategy: 'commit-fetch',
      cloneBranch: null,
      pinCommit: effective,
      cloneRevisionLabel: effective,
    };
  }

  return {
    strategy: 'ref-shallow',
    cloneBranch: effective,
    pinCommit: null,
    cloneRevisionLabel: effective,
  };
}

/** Inject clone credentials into an https URL (token in password). */
export function withGitAuthUrl(
  url: string,
  username?: string | null,
  password?: string | null,
): string {
  if (!password) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return url;
    parsed.username = username || 'x-access-token';
    parsed.password = password;
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Redact credentialed URLs from error text. */
export function redactGitCredentialText(text: string): string {
  return text.replace(/https:\/\/[^@\s]+@/g, 'https://***@');
}

/**
 * Read in-box Setup clone specs from process env (no secrets returned to callers
 * that log — callers must not put password in telemetry).
 */
export function readHostCloneEnv(
  env: NodeJS.ProcessEnv = process.env,
): HostCloneEnvSpec | null {
  const url = env[BITCODE_HOST_CLONE_ENV.URL]?.trim();
  if (!url) return null;
  return {
    url,
    branch: env[BITCODE_HOST_CLONE_ENV.BRANCH]?.trim() || null,
    commit: env[BITCODE_HOST_CLONE_ENV.COMMIT]?.trim() || null,
    username: env[BITCODE_HOST_CLONE_ENV.USERNAME]?.trim() || null,
    password: env[BITCODE_HOST_CLONE_ENV.PASSWORD]?.trim() || null,
    root: env[BITCODE_HOST_CLONE_ENV.ROOT]?.trim() || null,
    repositoryFullName: env[BITCODE_HOST_CLONE_ENV.REPOSITORY]?.trim() || null,
  };
}

/**
 * Build source-safe env entries for Sandbox createOptions.env (password included
 * only for the box process — never log the returned map).
 */
export function buildHostCloneEnvEntries(input: {
  repositoryFullName: string;
  url?: string;
  branch: string | null;
  commit: string | null;
  token?: string;
  root?: string | null;
}): Record<string, string> {
  const url =
    input.url?.trim() || `https://github.com/${input.repositoryFullName}.git`;
  const entries: Record<string, string> = {
    [BITCODE_HOST_CLONE_ENV.URL]: url,
    [BITCODE_HOST_CLONE_ENV.REPOSITORY]: input.repositoryFullName,
  };
  if (input.branch?.trim()) {
    entries[BITCODE_HOST_CLONE_ENV.BRANCH] = input.branch.trim();
  }
  if (input.commit?.trim()) {
    entries[BITCODE_HOST_CLONE_ENV.COMMIT] = input.commit.trim();
  }
  if (input.root?.trim()) {
    entries[BITCODE_HOST_CLONE_ENV.ROOT] = input.root.trim();
  }
  if (input.token) {
    entries[BITCODE_HOST_CLONE_ENV.USERNAME] = 'x-access-token';
    entries[BITCODE_HOST_CLONE_ENV.PASSWORD] = input.token;
  }
  return entries;
}

/**
 * Clone a complete working tree at branch tip and/or pin commit into workspacePath.
 * Multi-step so bare SHA shallow clones (Vercel create-time failure mode) are avoided.
 */
export async function provisionGitWorkingTree(input: {
  url: string;
  username?: string | null;
  password?: string | null;
  branch?: string | null;
  commit?: string | null;
  revision?: string | null;
  workspacePath: string;
  exec: HostExec;
}): Promise<{ strategy: GitWorkingTreeStrategy; workspacePath: string }> {
  const plan = resolveGitClonePlan({
    branch: input.branch,
    commit: input.commit,
    revision: input.revision,
  });
  const authUrl = withGitAuthUrl(input.url, input.username, input.password);
  const cloneArgs = ['clone', '--depth', '1', '--single-branch'];
  if (plan.cloneBranch) {
    cloneArgs.push('--branch', plan.cloneBranch);
  }
  cloneArgs.push(authUrl, input.workspacePath);

  const clone = await input.exec('git', cloneArgs);
  if (clone.exitCode !== 0) {
    throw new Error(
      `Host git clone failed (exit ${clone.exitCode}, strategy=${plan.strategy}): ${redactGitCredentialText(clone.stderr).trim()}`,
    );
  }

  if (plan.pinCommit) {
    const head = await input.exec('git', ['-C', input.workspacePath, 'rev-parse', 'HEAD']);
    const headSha = (head.stdout || '').trim().toLowerCase();
    const pin = plan.pinCommit.toLowerCase();
    const alreadyPinned =
      head.exitCode === 0 &&
      headSha.length > 0 &&
      (headSha === pin || headSha.startsWith(pin) || pin.startsWith(headSha));

    if (!alreadyPinned) {
      const fetch = await input.exec('git', [
        '-C',
        input.workspacePath,
        'fetch',
        '--depth',
        '1',
        'origin',
        plan.pinCommit,
      ]);
      if (fetch.exitCode !== 0) {
        throw new Error(
          `Host git fetch ${plan.pinCommit.slice(0, 12)} failed (exit ${fetch.exitCode}): ${redactGitCredentialText(fetch.stderr).trim()}`,
        );
      }
      const checkout = await input.exec('git', [
        '-C',
        input.workspacePath,
        'checkout',
        plan.pinCommit,
      ]);
      if (checkout.exitCode !== 0) {
        throw new Error(
          `Host git checkout ${plan.pinCommit.slice(0, 12)} failed (exit ${checkout.exitCode}): ${redactGitCredentialText(checkout.stderr).trim()}`,
        );
      }
    }
  }

  return { strategy: plan.strategy, workspacePath: input.workspacePath };
}
