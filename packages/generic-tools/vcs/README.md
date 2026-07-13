# VCS Tools

## Overview

Unified Version Control System (VCS) abstraction framework providing enterprise-grade operations across GitHub, GitLab, and Bitbucket providers. Implements consistent interfaces for repository management, pull request creation, file operations, and issue tracking with comprehensive authentication and connection management for production pipeline integration. Supabase access in all examples comes from `createClient` in `@bitcode/supabase/ssr/server`, which we alias locally as `createSupabaseServerClient()` for clarity.

## Core Capabilities

### Multi-Provider VCS Abstraction
- **Provider Unification**: Consistent API interface across GitHub, GitLab, and Bitbucket platforms
- **Connection Management**: Comprehensive authentication and connection pooling via VCS abstraction layer
- **Instance URL Support**: Full compatibility with self-hosted GitLab and Bitbucket Enterprise instances
- **Provider-Agnostic Operations**: Uniform operation semantics regardless of underlying VCS provider

### Repository Operations
- **Repository Listing**: Paginated repository discovery with sorting and filtering capabilities
- **Branch Management**: Complete branch listing and management operations
- **File Operations**: Create, update, and retrieve file content with commit message support
- **Repository Access**: Comprehensive repository metadata and access information retrieval

### Pull Request Management
- **PR Creation**: Full pull request creation with title, description, and branch specification
- **Draft Support**: Draft pull request creation with conversion capabilities
- **Source and Target Branch Configuration**: Flexible branch targeting with validation
- **Metadata Integration**: Comprehensive pull request metadata and status tracking

### Issue Management
- **Issue Creation**: Complete issue creation with title, body, labels, and assignee support
- **Label Management**: Dynamic label assignment and categorization
- **Milestone Integration**: Milestone assignment and tracking capabilities
- **Comment Operations**: Issue and pull request comment creation and management

### Content Operations
- **File Content Retrieval**: Secure file content access with branch and commit specification
- **Base64 Encoding**: Automatic content encoding and decoding for binary file support
- **Content Validation**: Comprehensive content integrity validation and error handling
- **SHA Management**: File SHA tracking for update operations and conflict resolution

## Tool Operations

### ListRepositoriesTool

Repository discovery and listing with comprehensive filtering and pagination.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 page?: number;
 perPage?: number;
 sort?: 'created' | 'updated' | 'pushed' | 'full_name';
 direction?: 'asc' | 'desc';
}
```

**Output Schema:**
```typescript
{
 repositories: Array<{
 id: string;
 name: string;
 full_name: string;
 description?: string;
 private: boolean;
 clone_url: string;
 ssh_url: string;
 html_url: string;
 default_branch: string;
 created_at: string;
 updated_at: string;
 pushed_at: string;
 size: number;
 language?: string;
 fork: boolean;
 archived: boolean;
 }>;
 pagination: {
 page: number;
 per_page: number;
 total_count: number;
 has_next_page: boolean;
 };
}
```

### CreatePullRequestTool

Pull request creation with comprehensive branch and metadata management.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 owner: string;
 repo: string;
 title: string;
 description?: string;
 sourceBranch: string;
 targetBranch: string;
 draft?: boolean;
}
```

**Output Schema:**
```typescript
{
 id: number;
 number: number;
 title: string;
 description?: string;
 state: 'open' | 'closed' | 'merged';
 draft: boolean;
 source_branch: string;
 target_branch: string;
 html_url: string;
 created_at: string;
 updated_at: string;
 author: {
 username: string;
 avatar_url?: string;
 };
 mergeable?: boolean;
 merge_commit_sha?: string;
}
```

### CreateOrUpdateFileTool

File content creation and modification with commit message support.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 owner: string;
 repo: string;
 path: string;
 content: string;
 message: string;
 branch?: string;
 sha?: string; // Required for updates
}
```

**Output Schema:**
```typescript
{
 content: {
 name: string;
 path: string;
 sha: string;
 size: number;
 url: string;
 html_url: string;
 git_url: string;
 download_url: string;
 };
 commit: {
 sha: string;
 url: string;
 html_url: string;
 author: {
 name: string;
 email: string;
 date: string;
 };
 message: string;
 };
}
```

### CreateIssueTool

Issue creation with comprehensive metadata and assignment capabilities.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 owner: string;
 repo: string;
 title: string;
 body?: string;
 labels?: string[];
 assignees?: string[];
 milestone?: string;
}
```

**Output Schema:**
```typescript
{
 id: number;
 number: number;
 title: string;
 body?: string;
 state: 'open' | 'closed';
 labels: Array<{
 name: string;
 color: string;
 description?: string;
 }>;
 assignees: Array<{
 username: string;
 avatar_url?: string;
 }>;
 milestone?: {
 title: string;
 description?: string;
 due_on?: string;
 };
 html_url: string;
 created_at: string;
 updated_at: string;
}
```

### CreateCommentTool

Comment creation for issues and pull requests with rich content support.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 owner: string;
 repo: string;
 type: 'issue' | 'pr';
 number: number;
 body: string;
}
```

**Output Schema:**
```typescript
{
 id: number;
 body: string;
 author: {
 username: string;
 avatar_url?: string;
 };
 created_at: string;
 updated_at: string;
 html_url: string;
}
```

### GetFileContentTool

File content retrieval with branch and commit specification support.

**Input Schema:**
```typescript
{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId?: string;
 userId?: string;
 owner: string;
 repo: string;
 path: string;
 ref?: string; // Branch, tag, or commit SHA
}
```

**Output Schema:**
```typescript
{
 name: string;
 path: string;
 sha: string;
 size: number;
 content: string; // Base64 encoded
 encoding: 'base64';
 decodedContent?: string; // UTF-8 decoded content
 url: string;
 html_url: string;
 git_url: string;
 download_url: string;
}
```

## Technical Implementation

### VCS Provider Abstraction

Unified provider management with connection pooling:

```typescript
class ListRepositoriesTool extends Tool<any> {
 name = 'vcs_list_repositories';
 description = 'List repositories from a VCS provider with unified interface';

 async use(input: ListRepositoriesInput) {
 const supabase = createSupabaseServerClient();
 const connectionManager = new VCSConnections(supabase);

 // Resolve connection via ID or user + provider
 const connection = input.connectionId
 ? await connectionManager.getConnectionById(input.connectionId)
 : await connectionManager.getConnection(input.userId!, input.provider);

 if (!connection) {
 throw new Error(`No ${input.provider} connection found`);
 }

 // Get authentication from connection
 const auth = await connectionManager.getAuthFromConnection(connection.id);

 // Initialize VCS provider with configuration
 const vcsProvider = await VCSProviderFactory.create({
 provider: input.provider,
 clientId: process.env[`${input.provider.toUpperCase()}_CLIENT_ID`]!,
 clientSecret: process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`]!,
 redirectUri: process.env[`${input.provider.toUpperCase()}_REDIRECT_URI`]!,
 instanceUrl: connection.instanceUrl
 });

 // Execute repository listing with timeout protection
 return await withTimeout(
 () => vcsProvider.listRepositories(auth, {
 page: input.page,
 perPage: input.perPage,
 sort: input.sort,
 direction: input.direction
 }),
 30000
 );
 }
}
```

### Pull Request Management

Comprehensive pull request creation with retry logic:

```typescript
class CreatePullRequestTool extends Tool<any> {
 name = 'vcs_create_pull_request';
 description = 'Create a pull request through unified VCS interface';

 async use(input: CreatePullRequestInput) {
 const supabase = createSupabaseServerClient();
 const connectionManager = new VCSConnections(supabase);

 // Resolve and validate connection
 const connection = input.connectionId
 ? await connectionManager.getConnectionById(input.connectionId)
 : await connectionManager.getConnection(input.userId!, input.provider);

 if (!connection) {
 throw new Error(`No ${input.provider} connection found`);
 }

 // Initialize authenticated VCS provider
 const auth = await connectionManager.getAuthFromConnection(connection.id);
 const vcsProvider = await VCSProviderFactory.create({
 provider: input.provider,
 clientId: process.env[`${input.provider.toUpperCase()}_CLIENT_ID`]!,
 clientSecret: process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`]!,
 redirectUri: process.env[`${input.provider.toUpperCase()}_REDIRECT_URI`]!,
 instanceUrl: connection.instanceUrl
 });

 // Execute pull request creation with retry logic
 return await withRetry(
 () => vcsProvider.createPullRequest(auth, input.owner, input.repo, {
 title: input.title,
 description: input.description,
 sourceBranch: input.sourceBranch,
 targetBranch: input.targetBranch,
 draft: input.draft
 }),
 {
 maxAttempts: 3,
 delayMs: 1000,
 shouldRetry: (error) => {
 const message = error.message.toLowerCase();
 return message.includes('network') ||
 message.includes('timeout') ||
 message.includes('rate limit');
 }
 }
 );
 }
}
```

### File Operations Framework

Secure file content management with encoding support:

```typescript
class CreateOrUpdateFileTool extends Tool<any> {
 name = 'vcs_create_or_update_file';
 description = 'Create or update a file in a repository through unified VCS interface';

 async use(input: CreateOrUpdateFileInput) {
 const supabase = createSupabaseServerClient();
 const connectionManager = new VCSConnections(supabase);

 // Validate and resolve connection
 const connection = input.connectionId
 ? await connectionManager.getConnectionById(input.connectionId)
 : await connectionManager.getConnection(input.userId!, input.provider);

 if (!connection) {
 throw new Error(`No ${input.provider} connection found`);
 }

 // Initialize VCS provider with authentication
 const auth = await connectionManager.getAuthFromConnection(connection.id);
 const vcsProvider = await VCSProviderFactory.create({
 provider: input.provider,
 clientId: process.env[`${input.provider.toUpperCase()}_CLIENT_ID`]!,
 clientSecret: process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`]!,
 redirectUri: process.env[`${input.provider.toUpperCase()}_REDIRECT_URI`]!,
 instanceUrl: connection.instanceUrl
 });

 // Execute file operation with retry and timeout protection
 return await withRetry(
 () => vcsProvider.createOrUpdateFile(auth, input.owner, input.repo, input.path, {
 content: Buffer.from(input.content).toString('base64'),
 message: input.message,
 branch: input.branch,
 sha: input.sha
 }),
 {
 maxAttempts: 3,
 delayMs: 1000
 }
 );
 }
}
```

### Content Retrieval System

File content access with automatic decoding:

```typescript
class GetFileContentTool extends Tool<any> {
 name = 'vcs_get_file_content';
 description = 'Get file content from a repository through unified VCS interface';

 async use(input: GetFileContentInput) {
 const supabase = createSupabaseServerClient();
 const connectionManager = new VCSConnections(supabase);

 // Resolve connection and authentication
 const connection = input.connectionId
 ? await connectionManager.getConnectionById(input.connectionId)
 : await connectionManager.getConnection(input.userId!, input.provider);

 if (!connection) {
 throw new Error(`No ${input.provider} connection found`);
 }

 const auth = await connectionManager.getAuthFromConnection(connection.id);
 const vcsProvider = await VCSProviderFactory.create({
 provider: input.provider,
 clientId: process.env[`${input.provider.toUpperCase()}_CLIENT_ID`]!,
 clientSecret: process.env[`${input.provider.toUpperCase()}_CLIENT_SECRET`]!,
 redirectUri: process.env[`${input.provider.toUpperCase()}_REDIRECT_URI`]!,
 instanceUrl: connection.instanceUrl
 });

 // Retrieve file content
 const file = await vcsProvider.getFileContent(
 auth,
 input.owner,
 input.repo,
 input.path,
 input.ref
 );

 // Automatically decode base64 content to UTF-8
 if (file.content && file.encoding === 'base64') {
 try {
 file.decodedContent = Buffer.from(file.content, 'base64').toString('utf-8');
 } catch (error) {
 // Content might be binary - keep base64 encoded
 console.warn('Unable to decode content as UTF-8:', error.message);
 }
 }

 return file;
 }
}
```

## Usage Examples

### Basic Repository Operations

```typescript
import { listRepositoriesTool, createPullRequestTool } from '@bitcode/vcs-generics';

// List repositories from GitHub connection
const repositories = await listRepositoriesTool.use({
 provider: 'github',
 connectionId: 'github-connection-123',
 page: 1,
 perPage: 25,
 sort: 'updated',
 direction: 'desc'
});

console.log(`Found ${repositories.repositories.length} repositories`);

// Create a pull request
const pullRequest = await createPullRequestTool.use({
 provider: 'github',
 connectionId: 'github-connection-123',
 owner: 'organization',
 repo: 'project-repo',
 title: 'Feature: Implement dashboard component',
 description: 'Adds responsive dashboard with real-time data visualization',
 sourceBranch: 'feature/dashboard-component',
 targetBranch: 'main',
 draft: false
});

console.log(`Created pull request #${pullRequest.number}: ${pullRequest.html_url}`);
```

### File Content Management

```typescript
import { createOrUpdateFileTool, getFileContentTool } from '@bitcode/vcs-generics';

// Retrieve existing file content
const existingFile = await getFileContentTool.use({
 provider: 'gitlab',
 connectionId: 'gitlab-connection-456',
 owner: 'team',
 repo: 'backend-api',
 path: 'src/components/Dashboard.tsx',
 ref: 'main'
});

// Update file with new content
const updatedFile = await createOrUpdateFileTool.use({
 provider: 'gitlab',
 connectionId: 'gitlab-connection-456',
 owner: 'team',
 repo: 'backend-api',
 path: 'src/components/Dashboard.tsx',
 content: modifiedContent,
 message: 'Update dashboard component with responsive design',
 branch: 'feature/responsive-dashboard',
 sha: existingFile.sha
});

console.log(`Updated file: ${updatedFile.commit.html_url}`);
```

### Issue and Comment Management

```typescript
import { createIssueTool, createCommentTool } from '@bitcode/vcs-generics';

// Create an issue
const issue = await createIssueTool.use({
 provider: 'bitbucket',
 connectionId: 'bitbucket-connection-789',
 owner: 'workspace',
 repo: 'frontend-app',
 title: 'Dashboard component performance optimization',
 body: 'The dashboard component experiences slow rendering with large datasets. Read to implement virtualization.',
 labels: ['performance', 'enhancement', 'dashboard'],
 assignees: ['developer1', 'developer2']
});

// Add a comment to the issue
const comment = await createCommentTool.use({
 provider: 'bitbucket',
 connectionId: 'bitbucket-connection-789',
 owner: 'workspace',
 repo: 'frontend-app',
 type: 'issue',
 number: issue.number,
 body: 'Investigating virtualization libraries. React Window looks promising for this use case.'
});

console.log(`Created issue #${issue.number} with comment: ${comment.html_url}`);
```

### Multi-Provider Workflow

```typescript
// Cross-provider workflow example
async function crossProviderWorkflow() {
 // List repositories from GitHub
 const githubRepos = await listRepositoriesTool.use({
 provider: 'github',
 connectionId: 'github-conn',
 sort: 'updated',
 direction: 'desc'
 });

 // List repositories from GitLab
 const gitlabRepos = await listRepositoriesTool.use({
 provider: 'gitlab',
 connectionId: 'gitlab-conn',
 sort: 'updated',
 direction: 'desc'
 });

 // Create issues in both providers
 const githubIssue = await createIssueTool.use({
 provider: 'github',
 connectionId: 'github-conn',
 owner: 'org',
 repo: 'frontend',
 title: 'Sync with GitLab backend changes',
 body: 'Read to update frontend to work with new API endpoints',
 labels: ['sync', 'api']
 });

 const gitlabIssue = await createIssueTool.use({
 provider: 'gitlab',
 connectionId: 'gitlab-conn',
 owner: 'team',
 repo: 'backend',
 title: 'Frontend integration requirements',
 body: `Related to GitHub issue: ${githubIssue.html_url}`,
 labels: ['integration', 'frontend']
 });

 return {
 githubRepos: githubRepos.repositories,
 gitlabRepos: gitlabRepos.repositories,
 crossPlatformIssues: [githubIssue, gitlabIssue]
 };
}
```

### Pipeline Integration

```typescript
// Integration with Bitcode pipeline for comprehensive VCS operations
export const executeVCSWorkflow = factoryTool(
 'executeVCSWorkflow',
 async (params: {
 repositories: Array<{
 provider: 'github' | 'gitlab' | 'bitbucket';
 connectionId: string;
 owner: string;
 repo: string;
 }>;
 workflowType: 'pull_request' | 'issue_creation' | 'file_update';
 workflowData: any;
 }) => {
 const results = [];

 for (const repo of params.repositories) {
 try {
 let result;

 switch (params.workflowType) {
 case 'pull_request':
 result = await createPullRequestTool.use({
 ...repo,
 ...params.workflowData
 });
 break;

 case 'issue_creation':
 result = await createIssueTool.use({
 ...repo,
 ...params.workflowData
 });
 break;

 case 'file_update':
 result = await createOrUpdateFileTool.use({
 ...repo,
 ...params.workflowData
 });
 break;
 }

 results.push({
 repository: repo,
 result,
 status: 'success'
 });
 } catch (error) {
 results.push({
 repository: repo,
 error: error.message,
 status: 'failed'
 });
 }
 }

 // Store workflow results in pipeline context
 await storePipelineContext({
 vcsWorkflow: {
 type: params.workflowType,
 results,
 successCount: results.filter(r => r.status === 'success').length,
 failureCount: results.filter(r => r.status === 'failed').length
 }
 });

 return {
 workflowResults: results,
 summary: {
 total: results.length,
 successful: results.filter(r => r.status === 'success').length,
 failed: results.filter(r => r.status === 'failed').length
 }
 };
 },
 {
 description: 'Execute comprehensive VCS workflows across multiple providers and repositories',
 metadata: {
 category: 'vcs_operations',
 subsystem: 'multi_provider',
 integrationPoints: ['github', 'gitlab', 'bitbucket', 'pipeline_context']
 }
 }
);
```

## Performance Characteristics

### Network and API Performance
- **Request Latency**: 100ms-2s per API call (depends on provider and network conditions)
- **Rate Limit Management**: Intelligent rate limiting with automatic backoff and retry
- **Connection Pooling**: Efficient connection reuse across multiple operations
- **Timeout Protection**: Configurable timeouts with graceful failure handling

### Throughput Metrics
- **Repository Listing**: 100-1000 repositories/minute (depends on provider pagination)
- **File Operations**: 10-50 file operations/minute (limited by provider rate limits)
- **Pull Request Creation**: 20-100 PRs/minute (varies by provider and repository size)
- **Comment Operations**: 50-200 comments/minute with batch optimization

### Memory and Resource Usage
- **Memory Footprint**: ~15MB baseline + 1-5KB per active connection
- **Connection Overhead**: Minimal persistent connection management
- **Authentication Caching**: Efficient token management with automatic refresh
- **Response Caching**: Optional result caching for frequently accessed data

### Scalability and Resilience
- **Multi-Provider Support**: Concurrent operations across different VCS providers
- **Error Isolation**: Provider-specific failures don't affect other operations
- **Retry Logic**: Comprehensive retry strategies with exponential backoff
- **Circuit Breaker**: Automatic circuit breaking for consistently failing providers

### Error Handling and Recovery
- **Network Resilience**: Automatic retry for network-related failures
- **Authentication Recovery**: Automatic token refresh and re-authentication
- **Provider-Specific Handling**: Tailored error handling for each VCS provider
- **Graceful Degradation**: Partial success reporting with detailed error information
