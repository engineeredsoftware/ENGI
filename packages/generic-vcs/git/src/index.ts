/**
 * Bitcode Git operation bridge.
 *
 * Git is retained in V26 as concrete repository-transport infrastructure under
 * the provider-agnostic VCS layer. This package owns Git-shaped operation names
 * that active tools still consume while routing behavior through Bitcode VCS
 * providers and failing closed for operations the current provider cannot prove.
 */

import {
  VCSConnections,
  VCSProviderFactory,
  type AbstractVCSProvider,
  type CreateIssueData,
  type FileDeleteData,
  type FileUpdateData,
  type VCSAuth,
  type VCSConfig,
  type VCSProviderType,
} from '@bitcode/vcs-generics';
import { supabaseAdmin } from '@bitcode/supabase';

export type BitcodeGitOperationInput = {
  provider?: VCSProviderType;
  connectionId?: string | number;
  installationId?: number;
  userId?: string;
  accessToken?: string;
  auth?: VCSAuth;
  instanceUrl?: string;
  owner?: string;
  repo?: string;
  repository?: string;
  repositoryFullName?: string;
  repoUrl?: string;
  repositoryUrl?: string;
  remoteUrl?: string;
  path?: string;
  filePath?: string;
  branch?: string;
  ref?: string;
  sha?: string;
  from?: string;
  fromSha?: string;
  title?: string;
  body?: string;
  description?: string;
  head?: string;
  base?: string;
  sourceBranch?: string;
  targetBranch?: string;
  draft?: boolean;
  content?: string;
  message?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string | number;
  number?: number;
  issueNumber?: number;
  pullRequestNumber?: number;
  userIds?: string[];
  [key: string]: unknown;
};

type ProviderContext = {
  provider: AbstractVCSProvider;
  auth: VCSAuth;
  providerType: VCSProviderType;
};

type RepositoryCoordinates = {
  owner: string;
  repo: string;
};

const DEFAULT_PROVIDER: VCSProviderType = 'github';

function asOperationInput(input?: BitcodeGitOperationInput | string | number): BitcodeGitOperationInput {
  if (typeof input === 'string' || typeof input === 'number') {
    return { connectionId: input };
  }

  return input ?? {};
}

function parseRepositoryUrl(url?: string): Partial<RepositoryCoordinates> {
  if (!url) {
    return {};
  }

  const cleanUrl = url.replace(/\.git$/u, '');
  const match = cleanUrl.match(/[:/]([^/:]+)\/([^/]+)$/u);
  if (!match) {
    return {};
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function resolveRepository(input: BitcodeGitOperationInput): RepositoryCoordinates {
  const fromUrl = parseRepositoryUrl(
    input.repoUrl || input.repositoryUrl || input.remoteUrl,
  );
  const fullName =
    typeof input.repositoryFullName === 'string'
      ? input.repositoryFullName
      : typeof input.repository === 'string' && input.repository.includes('/')
        ? input.repository
        : undefined;
  const [fullNameOwner, fullNameRepo] = fullName?.split('/') ?? [];

  const owner = input.owner || fullNameOwner || fromUrl.owner;
  const repo =
    input.repo ||
    fullNameRepo ||
    (typeof input.repository === 'string' && !input.repository.includes('/')
      ? input.repository
      : undefined) ||
    fromUrl.repo;

  if (!owner || !repo) {
    throw new Error(
      'Bitcode Git operation requires repository coordinates: owner and repo, repositoryFullName, or repoUrl.',
    );
  }

  return { owner, repo };
}

function resolvePath(input: BitcodeGitOperationInput): string {
  const path = input.path || input.filePath;
  if (!path) {
    throw new Error('Bitcode Git file operation requires a path.');
  }

  return path;
}

function resolveProviderType(input: BitcodeGitOperationInput): VCSProviderType {
  return input.provider || input.auth?.provider || DEFAULT_PROVIDER;
}

function buildProviderConfig(
  provider: VCSProviderType,
  instanceUrl?: string,
): VCSConfig {
  const envPrefix = provider.toUpperCase();
  return {
    provider,
    clientId:
      provider === 'github' && process.env.GITHUB_APP_CLIENT_ID
        ? process.env.GITHUB_APP_CLIENT_ID
        : process.env[`${envPrefix}_CLIENT_ID`] || '',
    clientSecret:
      provider === 'github' && process.env.GITHUB_APP_CLIENT_SECRET
        ? process.env.GITHUB_APP_CLIENT_SECRET
        : process.env[`${envPrefix}_CLIENT_SECRET`] || '',
    redirectUri: process.env[`${envPrefix}_REDIRECT_URI`] || process.env.VCS_REDIRECT_URI || '',
    instanceUrl,
    ...(provider === 'github'
      ? {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY,
          webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
        }
      : {}),
  };
}

async function resolveAuth(input: BitcodeGitOperationInput): Promise<VCSAuth> {
  const provider = resolveProviderType(input);

  if (input.auth?.accessToken) {
    return {
      ...input.auth,
      provider,
    };
  }

  if (input.accessToken) {
    return {
      accessToken: input.accessToken,
      provider,
      connectionId: typeof input.connectionId === 'string' ? input.connectionId : undefined,
    };
  }

  const connections = new VCSConnections(supabaseAdmin);
  let auth: VCSAuth | null = null;

  if (typeof input.installationId === 'number') {
    auth = await connections.getAuthFromConnectionByInstallationId(input.installationId);
  }

  if (!auth && input.connectionId !== undefined) {
    auth = await connections.getAuthFromConnection(String(input.connectionId));
  }

  if (!auth && input.userId) {
    const connection = await connections.getConnection(input.userId, provider);
    if (connection) {
      auth = await connections.getAuthFromConnection(connection.id);
    }
  }

  if (!auth?.accessToken) {
    throw new Error(
      `Bitcode Git operation requires ${provider} auth through auth, accessToken, connectionId, installationId, or userId.`,
    );
  }

  return {
    ...auth,
    provider: auth.provider || provider,
  };
}

async function createProviderContext(
  operationInput?: BitcodeGitOperationInput | string | number,
): Promise<ProviderContext> {
  const input = asOperationInput(operationInput);
  const providerType = resolveProviderType(input);
  const auth = await resolveAuth(input);
  const provider = await VCSProviderFactory.create(
    buildProviderConfig(providerType, input.instanceUrl),
  );

  return { provider, auth, providerType };
}

function unsupported(operation: string, providerType: VCSProviderType): never {
  throw new Error(
    `Bitcode Git operation "${operation}" is not implemented by the current ${providerType} VCS provider boundary.`,
  );
}

export async function getRepository(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  return provider.getRepository(auth, owner, repo);
}

export async function getAllRepositories(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  return provider.listRepositories(auth);
}

export async function syncUserGithubRepos(input: BitcodeGitOperationInput | string) {
  const operationInput =
    typeof input === 'string'
      ? { userId: input, provider: 'github' as const }
      : { ...input, provider: input.provider || ('github' as const) };
  return getAllRepositories(operationInput);
}

export async function syncAllGithubUsers(input: BitcodeGitOperationInput = {}) {
  const userIds = input.userIds || [];
  if (userIds.length === 0) {
    throw new Error('Bitcode Git syncAllGithubUsers requires explicit userIds for V26 bounded sync.');
  }

  return Promise.all(userIds.map(userId => syncUserGithubRepos({ userId })));
}

export async function getInstallationAccessToken(input: BitcodeGitOperationInput | number) {
  const operationInput =
    typeof input === 'number' ? { installationId: input, provider: 'github' as const } : input;
  const auth = await resolveAuth(operationInput);
  return {
    token: auth.accessToken,
    accessToken: auth.accessToken,
    provider: auth.provider || 'github',
    connectionId: auth.connectionId,
  };
}

export async function getInstallationAccounts(input: BitcodeGitOperationInput = {}) {
  const repositories = await getAllRepositories({ ...input, provider: input.provider || 'github' });
  const owners = new Map<string, { username: string; type: string }>();

  for (const repository of repositories) {
    owners.set(repository.owner.username, {
      username: repository.owner.username,
      type: repository.owner.type,
    });
  }

  return Array.from(owners.values());
}

export async function listGitFiles(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (!provider.listFiles) {
    unsupported('listGitFiles', providerType);
  }

  return provider.listFiles(auth, owner, repo, input.path, input.ref || input.branch);
}

export async function cloneRepository(input: BitcodeGitOperationInput) {
  const repository = await getRepository(input);
  return {
    repository,
    cloneUrl: repository.cloneUrl,
    sshUrl: repository.sshUrl,
    defaultBranch: repository.defaultBranch,
    destination: input.destination,
  };
}

export async function createPullRequest(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const sourceBranch = input.sourceBranch || input.head;
  const targetBranch = input.targetBranch || input.base;

  if (!input.title || !sourceBranch || !targetBranch) {
    throw new Error('Bitcode Git pull request creation requires title, sourceBranch/head, and targetBranch/base.');
  }

  return provider.createPullRequest(auth, owner, repo, {
    title: input.title,
    description: input.description || input.body,
    sourceBranch,
    targetBranch,
    draft: input.draft,
  });
}

export async function createReference(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const branch = input.branch || input.ref;
  const from = input.from || input.fromSha || input.sha;

  if (!branch || !from) {
    throw new Error('Bitcode Git branch creation requires branch/ref and from/fromSha/sha.');
  }

  if (!provider.createBranch) {
    unsupported('createReference', providerType);
  }

  return provider.createBranch(auth, owner, repo, branch, from);
}

export async function getReferenceInfo(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const branch = input.branch || input.ref;

  if (!branch) {
    throw new Error('Bitcode Git reference lookup requires branch or ref.');
  }

  return provider.getBranch(auth, owner, repo, branch);
}

export async function getAllBranches(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  return provider.listBranches(auth, owner, repo);
}

export async function getFileInfo(input: BitcodeGitOperationInput) {
  return getFileContent(input);
}

export async function getFileContent(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  return provider.getFileContent(auth, owner, repo, resolvePath(input), input.ref || input.branch);
}

export async function createFileContent(input: BitcodeGitOperationInput) {
  return createOrUpdateFileContent(input);
}

export async function updateFileContent(input: BitcodeGitOperationInput) {
  return createOrUpdateFileContent(input);
}

async function createOrUpdateFileContent(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (typeof input.content !== 'string' || !input.message) {
    throw new Error('Bitcode Git file write requires content and message.');
  }

  const updateData: FileUpdateData = {
    content: input.content,
    message: input.message,
    branch: input.branch,
    sha: input.sha,
  };

  return provider.createOrUpdateFile(auth, owner, repo, resolvePath(input), updateData);
}

export async function deleteFileContent(input: BitcodeGitOperationInput) {
  const { provider, auth } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (!input.message || !input.sha) {
    throw new Error('Bitcode Git file delete requires message and sha.');
  }

  const deleteData: FileDeleteData = {
    message: input.message,
    sha: input.sha,
    branch: input.branch,
  };

  return provider.deleteFile(auth, owner, repo, resolvePath(input), deleteData);
}

export async function createIssue(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (!provider.createIssue) {
    unsupported('createIssue', providerType);
  }

  if (!input.title) {
    throw new Error('Bitcode Git issue creation requires title.');
  }

  const issueData: CreateIssueData = {
    title: input.title,
    body: input.body || input.description,
    labels: input.labels,
    assignees: input.assignees,
    milestone: typeof input.milestone === 'number' ? input.milestone : undefined,
  };

  return provider.createIssue(auth, owner, repo, issueData);
}

export async function leaveCommentOnIssue(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const number = input.issueNumber || input.number;

  if (!provider.createIssueComment) {
    unsupported('leaveCommentOnIssue', providerType);
  }

  if (!number || !input.body) {
    throw new Error('Bitcode Git issue commenting requires issueNumber/number and body.');
  }

  return provider.createIssueComment(auth, owner, repo, number, input.body);
}

export async function reviewPullRequest(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const number = input.pullRequestNumber || input.number;

  if (!provider.createPullRequestComment) {
    unsupported('reviewPullRequest', providerType);
  }

  if (!number || !input.body) {
    throw new Error('Bitcode Git pull-request review requires pullRequestNumber/number and body.');
  }

  return provider.createPullRequestComment(auth, owner, repo, number, input.body);
}

export async function getIssueWithComments(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const number = input.issueNumber || input.number;

  if (!number) {
    throw new Error('Bitcode Git issue lookup requires issueNumber or number.');
  }

  if (!provider.getIssue || !provider.listIssueComments) {
    unsupported('getIssueWithComments', providerType);
  }

  const [issue, comments] = await Promise.all([
    provider.getIssue(auth, owner, repo, number),
    provider.listIssueComments(auth, owner, repo, number),
  ]);

  return { issue, comments };
}

export async function isLatestCommentFromBot(input: BitcodeGitOperationInput) {
  const { comments } = await getIssueWithComments(input);
  const latest = comments[comments.length - 1];
  const username = latest?.author?.username || '';
  return /\[bot\]$|bot$/iu.test(username);
}

export async function getCommit(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);
  const sha = input.sha || input.ref;

  if (!provider.getCommit) {
    unsupported('getCommit', providerType);
  }

  if (!sha) {
    throw new Error('Bitcode Git commit lookup requires sha or ref.');
  }

  return provider.getCommit(auth, owner, repo, sha);
}

export async function getAllCommits(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (!provider.listCommits) {
    unsupported('getAllCommits', providerType);
  }

  return provider.listCommits(auth, owner, repo, {
    branch: input.branch,
  });
}

export async function getRepositoryIssues(input: BitcodeGitOperationInput) {
  const { provider, auth, providerType } = await createProviderContext(input);
  const { owner, repo } = resolveRepository(input);

  if (!provider.listIssues) {
    unsupported('getRepositoryIssues', providerType);
  }

  return provider.listIssues(auth, owner, repo);
}

export { createProviderContext as createBitcodeGitProviderContext };
