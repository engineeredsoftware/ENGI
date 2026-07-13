# Bitbucket - Bitbucket VCS Provider Implementation

## Overview

Production-grade Bitbucket integration implementing the unified VCS abstraction layer. Provides comprehensive Bitbucket API v2.0 access with support for Bitbucket Cloud, Bitbucket Server (Data Center), and Atlassian enterprise deployments.

## Core Functionality

### Authentication Methods
- **OAuth 2.0**: Standard authorization code flow with refresh tokens
- **App Passwords**: Repository-specific authentication credentials
- **Repository Access Keys**: SSH-based repository access
- **JWT Tokens**: Service-to-service authentication for apps

### Repository Operations
- **Repository Management**: Full lifecycle operations (create, read, update, delete)
- **Branch Operations**: Branch creation, permissions, merging, and branching models
- **File Operations**: Content CRUD with base64 and UTF-8 encoding support
- **Commit Access**: Commit history, diffs, tree traversal, and annotations

### Collaboration Features
- **Pull Request Workflow**: Complete PR lifecycle from creation to merge
- **Review System**: Required reviewers, approval workflows, and status checks
- **Issue Tracking**: Issue creation, assignment, component management
- **Comment System**: Comments on PRs, issues, commits, and inline code

### Advanced Capabilities
- **Pipeline Integration**: Bitbucket Pipelines CI/CD management
- **Deployment Management**: Environment deployments and status tracking
- **Branch Permissions**: Granular branch access control
- **Webhook Management**: Repository and workspace webhook configuration

## Provider Support

### Bitbucket Cloud
- **Public Repositories**: Open source project hosting
- **Private Repositories**: Team and enterprise collaboration
- **Workspaces**: Organization-level operations and team management
- **Rate Limiting**: API rate limit management with tier-based quotas

### Bitbucket Server/Data Center
- **On-Premises**: Self-hosted Bitbucket deployment
- **Enterprise Features**: Advanced security and compliance features
- **Custom Endpoints**: Configurable API endpoints and certificates
- **LDAP Integration**: Enterprise directory authentication

### Atlassian Cloud
- **Atlassian Connect**: App marketplace integration
- **Jira Integration**: Issue tracking and project management linkage
- **Confluence Integration**: Documentation and knowledge management
- **Trello Integration**: Project board and task management

## API Reference

### Provider Initialization
```typescript
import { BitbucketProvider } from '@bitcode/bitbucket';

// Bitbucket Cloud configuration
const provider = new BitbucketProvider({
  clientId: 'bitbucket_client_id',
  clientSecret: 'bitbucket_client_secret',
  redirectUri: 'https://app.example.com/auth/callback'
});

// Bitbucket Server configuration
const serverProvider = new BitbucketProvider({
  instanceUrl: 'https://bitbucket.company.com',
  clientId: 'server_client_id',
  clientSecret: 'server_client_secret',
  redirectUri: 'https://app.example.com/auth/callback'
});

// App password authentication
const appProvider = new BitbucketProvider({
  username: 'developer',
  appPassword: 'app_password_token'
});
```

### Repository Operations
```typescript
// List user repositories
const repositories = await provider.listRepositories(auth, {
  role: 'member',
  sort: 'updated_on',
  pagelen: 50
});

// Get repository details
const repository = await provider.getRepository(auth, 'workspace', 'repo');

// Create repository
const newRepo = await provider.createRepository(auth, {
  name: 'new-repository',
  description: 'Repository description',
  isPrivate: true,
  language: 'typescript',
  hasIssues: true,
  hasWiki: true
});

// Update repository
const updated = await provider.updateRepository(auth, 'workspace', 'repo', {
  description: 'Updated description',
  isPrivate: false,
  website: 'https://project.example.com'
});
```

### Pull Request Management
```typescript
// List pull requests
const pullRequests = await provider.listPullRequests(auth, 'workspace', 'repo', {
  state: 'OPEN',
  sort: 'updated_on',
  pagelen: 25
});

// Create pull request
const pr = await provider.createPullRequest(auth, 'workspace', 'repo', {
  title: 'Feature implementation',
  description: 'Implements new feature X\n\n## Changes\n- Added feature X\n- Updated tests',
  sourceBranch: 'feature/new-feature',
  targetBranch: 'main',
  reviewers: ['reviewer1', 'reviewer2'],
  closeSourceBranch: true
});

// Add pull request reviewers
const reviewers = await provider.addPullRequestReviewers(auth, 'workspace', 'repo', 42, {
  reviewers: ['additional-reviewer']
});

// Merge pull request
const merged = await provider.mergePullRequest(auth, 'workspace', 'repo', 42, {
  mergeStrategy: 'squash',
  message: 'Feature: Add new functionality',
  closeSourceBranch: true
});
```

### Branch Operations
```typescript
// List branches
const branches = await provider.listBranches(auth, 'workspace', 'repo', {
  sort: 'name',
  pagelen: 100
});

// Create branch
const branch = await provider.createBranch(auth, 'workspace', 'repo', {
  name: 'feature/new-feature',
  target: 'main'
});

// Get branch permissions
const permissions = await provider.getBranchPermissions(auth, 'workspace', 'repo');

// Set branch permissions
const protection = await provider.setBranchPermissions(auth, 'workspace', 'repo', {
  pattern: 'main',
  kind: 'push',
  users: ['admin'],
  groups: ['developers']
});
```

### File Operations
```typescript
// Get file content
const file = await provider.getFile(auth, 'workspace', 'repo', 'src/index.ts', 'main');

// Create file
const created = await provider.createFile(auth, 'workspace', 'repo', 'new-file.ts', {
  content: 'export const greeting = "Hello World";',
  message: 'Add greeting module',
  branch: 'main',
  author: {
    name: 'Developer',
    email: 'dev@example.com'
  }
});

// Update file
const updated = await provider.updateFile(auth, 'workspace', 'repo', 'src/index.ts', {
  content: 'export const greeting = "Hello Universe";',
  message: 'Update greeting message',
  branch: 'main'
});

// Delete file
const deleted = await provider.deleteFile(auth, 'workspace', 'repo', 'old-file.ts', {
  message: 'Remove retired file',
  branch: 'main'
});
```

### Pipeline Integration
```typescript
// List pipelines
const pipelines = await provider.listPipelines(auth, 'workspace', 'repo', {
  sort: '-created_on',
  pagelen: 25
});

// Get pipeline details
const pipeline = await provider.getPipeline(auth, 'workspace', 'repo', 'pipeline-uuid');

// Trigger pipeline
const triggered = await provider.triggerPipeline(auth, 'workspace', 'repo', {
  target: {
    type: 'pipeline_ref_target',
    ref_type: 'branch',
    ref_name: 'main'
  },
  variables: [
    { key: 'DEPLOY_ENV', value: 'staging' }
  ]
});

// Stop pipeline
const stopped = await provider.stopPipeline(auth, 'workspace', 'repo', 'pipeline-uuid');
```

### Webhook Management
```typescript
// Create webhook
const webhook = await provider.createWebhook(auth, 'workspace', 'repo', {
  url: 'https://api.example.com/webhooks/bitbucket',
  events: [
    'repo:push',
    'pullrequest:created',
    'pullrequest:updated',
    'issue:created'
  ],
  active: true,
  skipCertVerification: false
});

// List webhooks
const webhooks = await provider.listWebhooks(auth, 'workspace', 'repo');

// Update webhook
const updated = await provider.updateWebhook(auth, 'workspace', 'repo', webhook.uuid, {
  events: ['repo:push', 'pullrequest:created'],
  active: false
});
```

## Performance Characteristics

### Request Optimization
- **Connection Pooling**: Persistent HTTP connections for API requests
- **Pagination Handling**: Efficient cursor-based pagination
- **Conditional Requests**: ETags and caching for unchanged resources
- **Request Batching**: Multiple operations in single requests where possible

### Rate Limit Management
- **Hourly Limits**: 1,000 requests per hour for standard accounts
- **Per-Resource Limits**: Different limits for different API endpoints
- **Team Account Limits**: Higher limits for team and enterprise accounts
- **Intelligent Backoff**: Automatic retry with exponential backoff

### Caching Strategy
- **Response Caching**: HTTP response caching with TTL
- **Authentication Caching**: Token caching with automatic refresh
- **Repository Metadata**: Repository and workspace metadata caching
- **Branch Information**: Branch and tag information caching

### Error Handling
- **Status Code Mapping**: HTTP status to VCS error translation
- **Bitbucket-Specific Errors**: Custom error handling for Bitbucket responses
- **Network Resilience**: Connection timeout and retry logic
- **Validation Errors**: Comprehensive input validation and feedback

## Security Features

### Authentication Security
- **Token Encryption**: Secure token storage and transmission
- **Scope Management**: OAuth scope validation and enforcement
- **Token Refresh**: Automatic token refresh before expiration
- **HTTPS Enforcement**: Secure communication for all operations

### Repository Security
- **Access Control**: Repository-level permissions and access control
- **Branch Permissions**: Granular branch protection and restrictions
- **IP Restrictions**: Access control by IP address ranges
- **Two-Factor Authentication**: 2FA requirement enforcement

### Webhook Security
- **UUID Verification**: Webhook UUID validation for authenticity
- **SSL Verification**: HTTPS requirement for webhook endpoints
- **Secret Validation**: Webhook secret verification
- **Content Validation**: Webhook payload structure validation

## Bitbucket-Specific Features

### Workspace Management
- **Workspace Settings**: Team and organization configuration
- **Member Management**: User roles and permissions
- **Project Organization**: Repository grouping and management
- **Billing Integration**: Usage tracking and billing management

### Development Workflow
- **Branching Models**: Git Flow, GitHub Flow, and custom models
- **Default Reviewers**: Automatic reviewer assignment rules
- **Pull Request Templates**: Standardized pull request descriptions
- **Status Checks**: External status check integration

### DevOps Integration
- **Bitbucket Pipelines**: Native CI/CD pipeline execution
- **Deployment Environments**: Environment management and tracking
- **Docker Integration**: Container build and deployment
- **Atlassian Marketplace**: Third-party app integration

### Enterprise Features
- **IP Allowlisting**: Network access restrictions
- **SAML SSO**: Single sign-on integration
- **Audit Logs**: Comprehensive audit trail
- **Data Residency**: Regional data storage compliance
