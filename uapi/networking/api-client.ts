import type {
  Account,
  Repository,
  IssueOrPR,
  RepoFile,
  InstallationResponse,
  PipelineExecution,
  PostprocessedResult
} from '../types/api';

export const fetchAccounts = async (): Promise<Account[]> => {
  try {
    const response = await fetch('/api/vcs?resource=accounts&provider=github', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      // Graceful fallback on 401/4xx
      return [];
    }
    const data = await response.json();
    const accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    return accounts.map((a: any) => ({
      login: a.login || a.username || a.owner || 'unknown',
      type: a.type || a.kind || 'User',
      id: typeof a.id === 'number' ? a.id : (a.id ? Number(a.id) : 0),
    }));
  } catch {
    return [];
  }
};

export const fetchRepositories = async (owner: string): Promise<Repository[]> => {
  const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}`, {
    headers: { 'Accept': 'application/vnd.github+json' }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch repositories');
  }
  const data = await response.json();
  return data.repositories as Repository[];
};

export const fetchBranchesAndInfo = async (owner: string, repo: string) => {
  const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
  if (!response.ok) throw new Error('Failed to fetch branches and repo info');
  const data = await response.json();
  return {
    branches: data.branches,
    defaultBranch: data.repoInfo?.default_branch
  };
};

export const fetchCommits = async (owner: string, repo: string, branch: string) => {
  const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
  if (!response.ok) throw new Error('Failed to fetch commits');
  const data = await response.json();
  return data.commits;
};

export const fetchIssuesAndPRs = async (owner: string, repo: string): Promise<IssueOrPR[]> => {
  try {
    const response = await fetch(`/api/vcs?resource=issues&provider=github&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return [];
    const data = await response.json();
    const issues = Array.isArray(data?.issues) ? data.issues : [];
    return issues.map((item: any) => ({
      id: String(item.number ?? item.id ?? ''),
      title: item.title || '',
      isPR: Boolean(item.pull_request),
      url: item.html_url || item.url || ''
    }));
  } catch (error) {
    console.warn('Failed to fetch issues/PRs (vcs):', error);
    return [];
  }
};

export const fetchFiles = async (owner: string, repo: string, path: string = ''): Promise<RepoFile[]> => {
  const response = await fetch(`/api/executions?action=files&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`, {
    headers: { 'Accept': 'application/vnd.github+json' }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch files');
  }
  const data = await response.json();
  return data.files as RepoFile[];
};

export const callAssetPackExecutionsAPI = async (
  connectionId: number,
  repoOwner: string,
  repoName: string,
  repoBranch: string,
  commitSha: string,
  issueNumber: string | null,
  definitionOfRead: string,
  userTimezone: string,
  modelProvider: string,
  modelId: string,
  /** Optional attachments provided by user */
  attachments?: { id: string; type: string; content: string }[],
  /** Number of iterations for the pipeline */
  iterationCount: number = 3,
  /** Optional file uploads */
  files?: File[],
  /** Canonical execution type for the AssetPack pipeline substrate. */
  pipelineType: string = 'agentic-execution:asset-pack'
): Promise<ReadableStream<Uint8Array> | null> => {
  let body: BodyInit;
  let headers: HeadersInit = {
    'X-User-Timezone': userTimezone,
  };

  // If we have files, use multipart form data
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // Add JSON data as a field
    formData.append('data', JSON.stringify({
      connectionId,
      repoOwner,
      repoName,
      repoBranch,
      repoCommit: commitSha,
      issueNumber,
      definition_of_read: definitionOfRead,
      modelProvider,
      modelId,
      attachments,
      iterationCount,
      pipeline_type: pipelineType
    }));
    
    // Add files
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    body = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else {
    // Traditional JSON request
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      connectionId,
      repoOwner,
      repoName,
      repoBranch,
      repoCommit: commitSha,
      issueNumber,
      definition_of_read: definitionOfRead,
      modelProvider,
      modelId,
      attachments,
      iterationCount,
      pipeline_type: pipelineType
    });
  }

  const response = await fetch('/api/executions', {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.body;
};

/**
 * Fetch a list of pipeline executions (history) for the current user.
 * Each execution may include AssetPack evidence and Finish-delivered Shippables.
 */
export const fetchPipelineExecutionHistory = async (): Promise<PipelineExecution[]> => {
  const response = await fetch('/api/executions/history');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch execution history');
  }
  return response.json();
};


/**
 * Fetch unified postprocessed result for a run
 */
export const fetchPostprocessed = async (runId: string): Promise<PostprocessedResult | null> => {
  const res = await fetch(`/api/executions/postprocessed?id=${encodeURIComponent(runId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.postprocessed || null;
};

// -----------------------------------------------------------------------------
// Notifications wrappers
// -----------------------------------------------------------------------------
export const notifyBtdTransfer = async (
  params: { recipientEmail: string; recipientName?: string; senderName: string; btdAmount: number; newBtdBalance: number; }
): Promise<void> => {
  const res = await fetch('/api/notifications/btd-transfer', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      senderName: params.senderName,
      btdAmount: params.btdAmount,
      newBtdBalance: params.newBtdBalance,
    }),
  }); if (!res.ok) throw new Error('Notification btd-transfer failed');
};
export const notifyNewsletter = async (
  params: { email: string; name?: string; subject: string; headline: string; body: string; buttonText?: string; buttonUrl?: string; unsubscribeUrl?: string; }
): Promise<void> => {
  const res = await fetch('/api/notifications/newsletter', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }); if (!res.ok) throw new Error('Notification newsletter failed');
};
export const notifyLowBtdReminder = async (
  params: { email: string; name?: string; balance: number; threshold: number; purchaseUrl?: string; }
): Promise<void> => {
  const res = await fetch('/api/notifications/low-btd-reminder', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }); if (!res.ok) throw new Error('Notification low-btd-reminder failed');
};
export const notifyOutOfBtd = async (
  params: { email: string; name?: string; purchaseUrl?: string; }
): Promise<void> => {
  const res = await fetch('/api/notifications/out-of-btd', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }); if (!res.ok) throw new Error('Notification out-of-btd failed');
};
