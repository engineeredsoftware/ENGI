/**
 * VCS-backed GitHub adapter.
 * 
 * This file keeps Octokit-shaped call sites bound to the VCS abstraction
 * without preserving a separate GitHub product implementation.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import {
  VCSService,
  VCSConnections,
  VCSProviderFactory,
  type AbstractVCSProvider,
  type VCSAuth,
  type VCSBranch,
  type VCSComment,
  type VCSIssue,
  type VCSRepository,
} from '@bitcode/vcs-generics';
import { log } from '@bitcode/logger';
import fs from 'fs';
import path from 'path';
import os from 'os';
import decompress from 'decompress';

type VcsGitHubRepositoryLike = {
  name: string;
  owner: {
    login: string;
  };
};

type VcsGitHubIssueLike = {
  number: number;
};

type VcsGitHubConnectionRecord = {
  id: string;
  user_id: string;
};

function createGitHubProvider(): Promise<AbstractVCSProvider> {
  return VCSProviderFactory.create({
    provider: 'github',
    clientId: config.oauth.clientId,
    clientSecret: config.oauth.clientSecret,
    redirectUri: process.env.GITHUB_REDIRECT_URI || process.env.VCS_REDIRECT_URI || '',
  });
}

function requireProviderMethod<T>(
  method: T | undefined,
  capability: string,
): T {
  if (!method) {
    throw new Error(`GitHub provider does not support ${capability}`);
  }
  return method;
}

async function getGitHubConnectionByInstallationId(
  connectionId: number,
): Promise<VcsGitHubConnectionRecord> {
  const { data: connection } = await supabaseAdmin
    .from('user_connections')
    .select('id, user_id')
    .eq('provider', 'github')
    .eq('connection_data->>connectionId', String(connectionId))
    .single();

  if (!connection) {
    throw new Error(`No GitHub connection found for installation ${connectionId}`);
  }

  return connection;
}

async function getGitHubProviderAndAuth(connectionId: number): Promise<{
  auth: VCSAuth;
  provider: AbstractVCSProvider;
  connection: VcsGitHubConnectionRecord;
}> {
  const connection = await getGitHubConnectionByInstallationId(connectionId);
  const auth = await new VCSConnections(supabaseAdmin).getAuthFromConnection(connection.id);

  if (!auth) {
    throw new Error(`No GitHub auth found for installation ${connectionId}`);
  }

  return {
    auth,
    provider: await createGitHubProvider(),
    connection,
  };
}

// VCS adapter configuration for existing GitHub installation callers.
export const config = {
  appId: 244206,
  privateKey: process.env.GITHUB_PRIVATE_KEY || '',
  oauth: {
    clientId: process.env.GITHUB_CLIENT_ID || "91e477521eb83c9b24c3",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
};

// Octokit-shaped adapter over the canonical VCS provider abstraction.
export const app = {
  async getInstallationOctokit(connectionId: number) {
    log('Octokit-shaped GitHub adapter read through VCS abstraction', 'info', { connectionId });
    const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
    const listIssues = requireProviderMethod(provider.listIssues, 'issue listing');
    const listIssueComments = requireProviderMethod(
      provider.listIssueComments,
      'issue comment listing',
    );
    const createIssueComment = requireProviderMethod(
      provider.createIssueComment,
      'issue comment creation',
    );
    const createBranch = requireProviderMethod(provider.createBranch, 'branch creation');
    
    return {
      request: async (route: string, options: any) => {
        // Map common Octokit routes to VCS methods
        if (route === 'GET /repos/{owner}/{repo}/issues') {
          const issues = await listIssues(auth, options.owner, options.repo, {
            state: 'open',
            perPage: 100,
          });
          return { data: issues };
        }
        
        if (route === 'GET /repos/{owner}/{repo}/issues/{issue_number}/comments') {
          const comments = await listIssueComments(
            auth,
            options.owner,
            options.repo,
            options.issue_number,
          );
          return { data: comments };
        }
        
        if (route === 'POST /repos/{owner}/{repo}/issues/{issue_number}/comments') {
          const comment = await createIssueComment(
            auth,
            options.owner,
            options.repo,
            options.issue_number,
            options.body,
          );
          return { data: comment };
        }
        
        if (route === 'GET /repos/{owner}/{repo}/zipball/{ref}') {
          // VCS doesn't have direct zipball support, return GitHub URL
          return { url: `https://api.github.com/repos/${options.owner}/${options.repo}/zipball/${options.ref}` };
        }
        
        if (route === 'GET /repos/{owner}/{repo}/git/ref/{ref}') {
          const branch = await provider.getBranch(auth, options.owner, options.repo, options.ref.replace('heads/', ''));
          return { data: { object: { sha: branch.commit.sha } } };
        }
        
        if (route === 'POST /repos/{owner}/{repo}/git/refs') {
          const branch = await createBranch(
            auth,
            options.owner,
            options.repo,
            options.ref.replace('refs/heads/', ''),
            options.sha,
          );
          return { data: branch };
        }
        
        throw new Error(`Unmapped Octokit route: ${route}`);
      }
    };
  },
  
  eachRepository: {
    async *iterator({ connectionId }: { connectionId: number }) {
      log('Octokit-shaped repository iterator read through VCS abstraction', 'info', { connectionId });
      const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
      const octokit = await app.getInstallationOctokit(connectionId);
      const repos = await provider.listRepositories(auth, { perPage: 100 });
      
      for (const repo of repos) {
        yield {
          octokit,
          repository: {
            name: repo.name,
            owner: { login: repo.owner.username },
            // Map other fields as needed
          }
        };
      }
    }
  }
};

/**
 * Returns all connected users' repositories using VCS abstraction
 */
export const getUsersRepositories = async () => {
  log('Getting all users repositories via VCS abstraction', 'info');
  
  const { data: connections, error } = await supabaseAdmin
    .from('user_connections')
    .select('*')
    .eq('provider', 'github');
    
  if (error || !connections) {
    log('Error fetching user connections', 'error', { error });
    return {};
  }
  
  const usersRepositories: Record<string, { repositories: Array<{ name: string; owner: { login: string } }> }> = {};
  
  for (const conn of connections) {
    const userId = conn.user_id;
    
    try {
      // Use VCS service to sync repositories
      const vcsService = new VCSService({ supabaseClient: supabaseAdmin });
      const repositories = await vcsService.listRepositories(userId);
      
      // Store in database for caching
      const upsertData = repositories.map((repo: VCSRepository) => ({
        user_id: userId,
        provider: 'github',
        provider_provider_repo_id: repo.id.toString(),
        repo_name: repo.name,
        repo_full_name: repo.fullName,
        repo_owner: repo.owner.username,
        repo_description: repo.description,
        repo_url: repo.url,
        repo_language: repo.language,
        repo_default_branch: repo.defaultBranch,
        repo_private: repo.private,
        repo_created_at: repo.createdAt,
        repo_updated_at: repo.updatedAt,
        repo_data: repo,
        synced_at: new Date().toISOString()
      }));

      await supabaseAdmin
        .from('vcs_repositories')
        .upsert(upsertData, {
          onConflict: 'user_id,provider,provider_provider_repo_id'
        });
      
      if (repositories.length > 0) {
        // Fetch synced repositories from database
        const { data: repos } = await supabaseAdmin
          .from('vcs_repositories')
          .select('*')
          .eq('user_id', userId)
          .eq('provider', 'github');
          
        usersRepositories[userId] = {
          repositories: repos?.map((r: { repo_name: string; repo_owner: string }) => ({
            name: r.repo_name,
            owner: { login: r.repo_owner },
            // Map other fields
          })) || []
        };
      }
    } catch (error) {
      log('Error syncing repositories for user', 'error', { userId, error });
    }
  }
  
  return usersRepositories;
};

/**
 * Get issues for repository using VCS abstraction
 */
export const getIssuesForRepository = async (
  connectionId: number,
  repository: VcsGitHubRepositoryLike,
): Promise<VCSIssue[]> => {
  log('Getting issues via VCS abstraction', 'info', { 
    connectionId, 
    repo: `${repository.owner.login}/${repository.name}` 
  });
  
  const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
  const listIssues = requireProviderMethod(provider.listIssues, 'issue listing');
  return await listIssues(auth, repository.owner.login, repository.name, {
    state: 'open',
    perPage: 100,
  });
};

/**
 * Get comments for issue using VCS abstraction
 */
export const getCommentsForIssue = async (
  connectionId: number,
  repository: VcsGitHubRepositoryLike,
  issue: VcsGitHubIssueLike,
): Promise<VCSComment[]> => {
  log('Getting issue comments via VCS abstraction', 'info', { 
    connectionId, 
    repo: `${repository.owner.login}/${repository.name}`,
    issue: issue.number 
  });
  
  const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
  const listIssueComments = requireProviderMethod(
    provider.listIssueComments,
    'issue comment listing',
  );
  return await listIssueComments(auth, repository.owner.login, repository.name, issue.number);
};

/**
 * Leave issue comment using VCS abstraction
 */
export const leaveIssueComment = async (
  connectionId: number,
  repository: VcsGitHubRepositoryLike,
  issue: VcsGitHubIssueLike,
  body: string,
): Promise<void> => {
  log('Creating issue comment via VCS abstraction', 'info', { 
    connectionId, 
    repo: `${repository.owner.login}/${repository.name}`,
    issue: issue.number 
  });
  
  const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
  const createIssueComment = requireProviderMethod(
    provider.createIssueComment,
    'issue comment creation',
  );

  await createIssueComment(
    auth,
    repository.owner.login,
    repository.name,
    issue.number,
    body,
  );
};

/**
 * Download repository - This remains GitHub-specific as VCS doesn't provide zipball
 */
export const downloadRepository = async (
  connectionId: number,
  repository: VcsGitHubRepositoryLike,
): Promise<string> => {
  log('Downloading repository', 'info', { 
    connectionId, 
    repo: `${repository.owner.login}/${repository.name}` 
  });
  
  // For download, we still read to use GitHub API directly
  // VCS abstraction doesn't cover file downloads
  const downloadUrl = `https://api.github.com/repos/${repository.owner.login}/${repository.name}/zipball/main`;
  
  const zipDirPath = path.join(os.homedir(), `.bitcode/memory/${repository.name}`);
  fs.mkdirSync(zipDirPath, { recursive: true });
  
  const zipPath = path.join(zipDirPath, `${repository.name}.zip`);
  
  // Get auth token for download
  const { auth } = await getGitHubProviderAndAuth(connectionId);
  
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  fs.writeFileSync(zipPath, Buffer.from(await response.arrayBuffer()));
  
  const unzipPath = path.join(os.homedir(), `.bitcode/memory/${repository.name}/${repository.name}`);
  await decompress(zipPath, unzipPath);
  
  return unzipPath;
};

/**
 * Create branch using VCS abstraction
 */
export const createBranch = async (
  connectionId: number,
  repository: VcsGitHubRepositoryLike,
  name: string,
): Promise<VCSBranch> => {
  log('Creating branch via VCS abstraction', 'info', { 
    connectionId, 
    repo: `${repository.owner.login}/${repository.name}`,
    branch: name 
  });
  
  const { auth, provider } = await getGitHubProviderAndAuth(connectionId);
  const createBranchMethod = requireProviderMethod(provider.createBranch, 'branch creation');
  
  // Get the SHA of the source branch first
  const sourceBranch = await provider.getBranch(auth, repository.owner.login, repository.name, 'main');
  
  return await createBranchMethod(
    auth,
    repository.owner.login,
    repository.name,
    name,
    sourceBranch.commit.sha,
  );
};
