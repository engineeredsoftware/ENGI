"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOutOfBtd = exports.notifyLowBtdReminder = exports.notifyNewsletter = exports.notifyBtdTransfer = exports.postShippableInstruction = exports.fetchShippableInstructions = exports.fetchPostprocessed = exports.fetchPipelineExecutionHistory = exports.callAssetPackExecutionsAPI = exports.fetchFiles = exports.fetchIssuesAndPRs = exports.fetchCommits = exports.fetchBranchesAndInfo = exports.fetchRepositories = exports.fetchAccounts = void 0;
const fetchAccounts = async () => {
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
        return accounts.map((a) => ({
            login: a.login || a.username || a.owner || 'unknown',
            type: a.type || a.kind || 'User',
            id: typeof a.id === 'number' ? a.id : (a.id ? Number(a.id) : 0),
        }));
    }
    catch {
        return [];
    }
};
exports.fetchAccounts = fetchAccounts;
const fetchRepositories = async (owner) => {
    const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}`, {
        headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch repositories');
    }
    const data = await response.json();
    return data.repositories;
};
exports.fetchRepositories = fetchRepositories;
const fetchBranchesAndInfo = async (owner, repo) => {
    const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
    if (!response.ok)
        throw new Error('Failed to fetch branches and repo info');
    const data = await response.json();
    return {
        branches: data.branches,
        defaultBranch: data.repoInfo?.default_branch
    };
};
exports.fetchBranchesAndInfo = fetchBranchesAndInfo;
const fetchCommits = async (owner, repo, branch) => {
    const response = await fetch(`/api/executions?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`);
    if (!response.ok)
        throw new Error('Failed to fetch commits');
    const data = await response.json();
    return data.commits;
};
exports.fetchCommits = fetchCommits;
const fetchIssuesAndPRs = async (owner, repo) => {
    try {
        const response = await fetch(`/api/vcs?resource=issues&provider=github&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok)
            return [];
        const data = await response.json();
        const issues = Array.isArray(data?.issues) ? data.issues : [];
        return issues.map((item) => ({
            id: String(item.number ?? item.id ?? ''),
            title: item.title || '',
            isPR: Boolean(item.pull_request),
            url: item.html_url || item.url || ''
        }));
    }
    catch (error) {
        console.warn('Failed to fetch issues/PRs (vcs):', error);
        return [];
    }
};
exports.fetchIssuesAndPRs = fetchIssuesAndPRs;
const fetchFiles = async (owner, repo, path = '') => {
    const response = await fetch(`/api/executions?action=files&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`, {
        headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch files');
    }
    const data = await response.json();
    return data.files;
};
exports.fetchFiles = fetchFiles;
const callAssetPackExecutionsAPI = async (connectionId, repoOwner, repoName, repoBranch, commitSha, issueNumber, definitionOfRead, userTimezone, modelProvider, modelId, 
/** Optional attachments provided by user */
attachments, 
/** Number of iterations for the pipeline */
iterationCount = 3, 
/** Optional file uploads */
files, 
/** Canonical execution type for the AssetPack pipeline substrate. */
pipelineType = 'agentic-execution:asset-pack') => {
    let body;
    let headers = {
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
    }
    else {
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
exports.callAssetPackExecutionsAPI = callAssetPackExecutionsAPI;
/**
 * Fetch a list of pipeline executions (history) for the current user.
 * Each execution may include AssetPack evidence and Finish-delivered Shippables.
 */
const fetchPipelineExecutionHistory = async () => {
    const response = await fetch('/api/executions/history');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch execution history');
    }
    return response.json();
};
exports.fetchPipelineExecutionHistory = fetchPipelineExecutionHistory;
/**
 * Fetch unified postprocessed result for a run
 */
const fetchPostprocessed = async (runId) => {
    const res = await fetch(`/api/executions/postprocessed?id=${encodeURIComponent(runId)}`);
    if (!res.ok)
        return null;
    const data = await res.json();
    return data?.postprocessed || null;
};
exports.fetchPostprocessed = fetchPostprocessed;
// -----------------------------------------------------------------------------
// On-the-Fly Instructions
// -----------------------------------------------------------------------------
/**
 * Fetch on-the-fly instructions for an AssetPack/Shippable-producing run.
 */
const fetchShippableInstructions = async (runId) => {
    const response = await fetch(`/api/executions/instructions?runId=${runId}`);
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `Failed to fetch instructions for run ${runId}`);
    }
    return response.json();
};
exports.fetchShippableInstructions = fetchShippableInstructions;
/**
 * Submit an on-the-fly instruction for an AssetPack/Shippable-producing run.
 */
const postShippableInstruction = async (runId, content, attachments) => {
    const response = await fetch('/api/executions/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, content, attachments }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `Failed to post instruction for run ${runId}`);
    }
    return response.json();
};
exports.postShippableInstruction = postShippableInstruction;
// -----------------------------------------------------------------------------
// Notifications wrappers
// -----------------------------------------------------------------------------
const notifyBtdTransfer = async (params) => {
    const res = await fetch('/api/notifications/btd-transfer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipientEmail: params.recipientEmail,
            recipientName: params.recipientName,
            senderName: params.senderName,
            btdAmount: params.btdAmount,
            newBtdBalance: params.newBtdBalance,
        }),
    });
    if (!res.ok)
        throw new Error('Notification btd-transfer failed');
};
exports.notifyBtdTransfer = notifyBtdTransfer;
const notifyNewsletter = async (params) => {
    const res = await fetch('/api/notifications/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok)
        throw new Error('Notification newsletter failed');
};
exports.notifyNewsletter = notifyNewsletter;
const notifyLowBtdReminder = async (params) => {
    const res = await fetch('/api/notifications/low-btd-reminder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok)
        throw new Error('Notification low-btd-reminder failed');
};
exports.notifyLowBtdReminder = notifyLowBtdReminder;
const notifyOutOfBtd = async (params) => {
    const res = await fetch('/api/notifications/out-of-btd', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok)
        throw new Error('Notification out-of-btd failed');
};
exports.notifyOutOfBtd = notifyOutOfBtd;
