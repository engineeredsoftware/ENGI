# Integrations Architecture

## Overview

Bitcode provides integrations with external services through two primary systems:
1. **VCS Providers** - Version control system abstraction for GitHub, GitLab, Bitbucket
2. **MCP Tools** - Model Context Protocol tools for external services

## VCS (Version Control System) Architecture

### Core Package Structure
- `/packages/vcs/` - VCS service and provider abstraction
  - `provider.ts` - Abstract VCSProvider base class with resilience patterns
  - `service.ts` - VCSService for provider management
  - `interface.ts` - AbstractVCSProvider interface
  - `types.ts` - VCSProviderType, VCSError, VCSConfig types

- `/packages/github/` - GitHub provider implementation
  - Complete implementation with OAuth, installation support
  - Uses Octokit for GitHub API access

- `/packages/bitbucket/` - Bitbucket provider implementation (Partial)
  - BitbucketProvider class exists
  - Implementation appears incomplete

### Provider Abstraction

```typescript
// Base provider with resilience patterns
abstract class VCSProvider implements AbstractVCSProvider {
  abstract readonly type: VCSProviderType;
  
  protected readonly timeouts = {
    auth: 10000,      // 10s for auth operations
    read: 30000,      // 30s for read operations
    write: 60000,     // 60s for write operations
    heavy: 120000     // 120s for heavy operations
  };
  
  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      timeout?: number;
      retryable?: boolean;
      maxAttempts?: number;
    }
  ): Promise<T>
}
```

### Resilience Features
- **Retry Logic**: Exponential backoff with configurable max attempts
- **Timeout Handling**: Operation-specific timeouts (auth/read/write/heavy)
- **Error Normalization**: Standard VCSError type across providers
- **Logging**: Integrated with @bitcode/logger

## Database Schema

### user_connections (V26 Unified Table)
- **Purpose**: Unified storage for all provider connections (GitHub, GitLab, Bitbucket)
- **Key Fields**: user_id, provider, connection_data (JSONB)
- **Connection Data Structure**:
  - `connectionId`: Generic VCS connection identifier (holds provider-specific ID)
    - For GitHub: Contains the GitHub App installation ID
    - For GitLab: Would contain project/namespace ID
    - For Bitbucket: Would contain workspace ID
  - `installation_token`: GitHub App installation access token
  - `installation_token_expires_at`: Token expiry timestamp (auto-refreshes 5 min before expiry)
  - `access_token`: OAuth access token or current active token
  - `refresh_token`: OAuth refresh token
- **Migration**: Replaced provider-specific `user_github_connections` table

### vcs_repositories
- **Purpose**: Unified repository storage across providers
- **Key Fields**: user_id, provider, provider_repo_id, repo_full_name
- **Provider-agnostic**: Designed for multiple VCS providers

## API Integration

### VCS Routes Architecture

#### Primary VCS API (`/api/vcs`)
- **Unified endpoint** for all VCS operations
- **Resources**: connections, accounts, repositories, branches, commits, issues, files
- **Query params**: `?resource=repositories&provider=github&owner=orgname`
- **Token Management**: 
  - Automatic GitHub App token refresh via GitHubService
  - Proactive refresh 5 minutes before expiry
  - Never falls back to expired tokens (prevents "Bad credentials" errors)
  - Cache bypass for expired tokens
  - Pattern-based cache clearing after successful refresh
  - Uses installation's granted permissions (no hardcoded permission requests)

#### Selection Flow (Strict Cascade)
1. **Provider** → Auto-selects GitHub if only option
2. **Organization/Account** → Fetched from GitHub App installation API
3. **Repository** → Listed after org selection (NOT before)
4. **Branch** → Auto-selects default branch
5. **Commit** → Auto-selects latest commit

#### Error Handling
- **401 Auth Errors**: Attempts token refresh automatically
- **User Feedback**: Clear error messages with suggested actions
- **Logging**: Comprehensive debug logging throughout auth flow

## Implementation Status

### ✅ Working
- GitHub provider fully implemented with OAuth + App installation
- VCS abstraction layer with provider interface
- Resilience patterns (retry, timeout, error normalization)
- Repository listing and selection in Terminal and Exchange execution surfaces
- Automatic GitHub App token refresh (with fallback)
- Organization name fetching from GitHub App installation API
- Comprehensive error handling and user feedback
- Cache management with pattern-based clearing

### 🚧 Partial
- Bitbucket provider exists but implementation incomplete
- GitLab provider not started

### ❌ Not Implemented
- Azure DevOps provider
- Generic Git provider
- Webhook abstraction across providers
- Provider-specific feature detection

## Security Considerations
- OAuth tokens stored in database (should be encrypted)
- Provider-specific IDs stored as `connectionId` in JSONB (generic field name)
- Row Level Security on VCS tables
- Scoped access to user's installations only
- Automatic token refresh for expired GitHub App tokens
- Token expiry tracked with `installation_token_expires_at`

## GitHub App Permission Strategy
- **No hardcoded permissions**: System requests tokens without specifying permissions
- **Uses installation's granted permissions**: Whatever the user approved during installation
- **Avoids 422 errors**: No "permissions not granted" failures
- **Graceful degradation**: App works with minimal permissions if that's what's granted
- **Why this matters**: Different installations may have different permission sets based on:
  - Organization policies
  - User preferences during installation
  - Changes to permissions after installation

## Future Roadmap
- Complete Bitbucket provider implementation
- Add GitLab provider
- Implement webhook abstraction
- Add provider capability detection
- ~~Implement caching layer for API responses~~ ✅ Done with VCSCache
- ~~Improve token refresh reliability~~ ✅ Fixed with proper JWT generation
- ~~Add retry mechanism for token refresh~~ ✅ Implemented with proactive refresh
- Implement token encryption at rest

---

## MCP (Model Context Protocol) Tools

### Overview

Bitcode provides 20+ MCP tool integrations through the `packages/generic-tools/mcps-tools/` directory. Each tool follows a standardized architecture with Tool objects, Zod validation, and comprehensive error handling.

### Available MCP Tools

#### Cloud Infrastructure
1. **AWS MCP tools** (`generic-tools/mcps-tools/aws/`) - AWS service tool stubs
   - Lambda, S3 get/put, Dynamo, CloudWatch placeholders
   - Artifact S3 storage is **not** here — use `@bitcode/generic-artifacts-aws`

2. **AWS Location** (`aws-location/`) - AWS Location Services
   - Geospatial data management
   - Maps and routing services
   - Geofencing capabilities

3. **AWS Terraform** (`aws-terraform/`) - Infrastructure as Code
   - Terraform state management
   - Resource provisioning
   - Configuration validation

4. **Vercel** (`vercel/`) - Deployment platform
   - Project deployment
   - Environment variable management
   - Domain configuration

5. **Cloudflare** (`cloudflare/`) - CDN and security
   - DNS management
   - Worker deployment
   - Security rules configuration

6. **Firebase** (`firebase/`) - Google's app platform
   - Realtime database operations
   - Authentication management
   - Cloud Functions deployment

#### Databases
7. **PostgreSQL** (`postgresql/`) - Relational database
   - Query execution
   - Schema management
   - Performance monitoring

8. **MySQL** (`mysql/`) - Relational database
   - Database operations
   - User management
   - Replication configuration

9. **Supabase** (`supabase/`) - Backend as a Service (product data plane)
    - Database operations
    - Auth management
    - Realtime subscriptions

#### Version Control & CI/CD
11. **GitHub** (`github/`) - Version control and collaboration
    - Repository management
    - Issue and PR operations
    - Actions workflow management

12. **GitLab** (`gitlab/`) - DevOps platform
    - Project management
    - CI/CD pipeline configuration
    - Merge request handling

13. **Bitbucket** (`bitbucket/`) - Atlassian version control
    - Repository operations
    - Pipeline configuration
    - Pull request management

14. **CircleCI** (`circleci/`) - Continuous integration
    - Pipeline execution
    - Job monitoring
    - Configuration management

#### Collaboration & Design
15. **Figma** (`figma/`) - Design collaboration
    - File operations
    - Component management
    - Comment handling
    - Export functionality

16. **Notion** (`notion/`) - Workspace platform
    - Page operations
    - Database queries
    - Block manipulation

17. **Jira** (`jira/`) - Project management
    - Issue tracking
    - Sprint management
    - Workflow automation

#### Development Tools
18. **Docker** (`docker/`) - Container management
    - Container operations
    - Image management
    - Network configuration

19. **Kubernetes** (`kubernetes/`) - Container scheduling and management
    - Cluster management
    - Deployment operations
    - Service configuration

20. **Git Repo Research** (`git-repo-research/`) - Repository analysis
    - Code search
    - History analysis
    - Pattern detection

### MCP Tool Architecture

Each MCP tool follows a standardized structure:

```typescript
// Standard Tool implementation pattern
import { Tool } from '@bitcode/tools-generics';
import { z } from 'zod';

export class ServiceNameTool extends Tool {
  // Zod schema for parameter validation
  private readonly schema = z.object({
    param1: z.string(),
    param2: z.number().optional()
  });

  // Execute method with resilience patterns
  async execute(params: unknown): Promise<Result> {
    const validated = this.schema.parse(params);
    return this.executeWithResilience(
      () => this.performOperation(validated),
      { timeout: 30000, retryable: true }
    );
  }
}
```

### Configuration

Each MCP tool requires specific environment variables:

```env
# Figma
FIGMA_ACCESS_TOKEN=your_token

# Notion
NOTION_API_KEY=your_key

# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# Vercel
VERCEL_TOKEN=your_token

# GitHub (for MCP tool, not OAuth)
GITHUB_TOKEN=your_pat

# Add others as needed...
```

### Tool Features

All MCP tools provide:
- **Type Safety**: Full TypeScript with Zod validation
- **Error Handling**: Comprehensive error catching and reporting
- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Management**: Configurable timeouts per operation type
- **Logging**: Structured logging with context
- **Metrics**: Performance monitoring and usage tracking

### Usage in Pipelines

MCP tools integrate with Bitcode pipelines through the agent system:

```typescript
// Example in a pipeline agent
const figmaTool = new FigmaTool();
const result = await agent.executeTool(figmaTool, {
  operation: 'getFile',
  fileId: 'abc123'
});
```

### Security Considerations

- All credentials stored as environment variables
- No hardcoded secrets in code
- API keys never logged
- Scoped permissions per tool
- Rate limiting awareness

### Testing

Each MCP tool includes:
- Unit tests for core functionality
- Integration tests with mocked APIs
- E2E tests in development environment
- Performance benchmarks

### Adding New MCP Tools

To add a new MCP tool:
1. Create directory in `packages/generic-tools/mcps-tools/`
2. Implement Tool class extending `@bitcode/tools-generics`
3. Add Zod schemas for validation
4. Implement resilience patterns
5. Add comprehensive tests
6. Document environment variables
7. Update this documentation

### MCP Tool Status

| Tool | Status | Coverage | Notes |
|------|--------|----------|-------|
| AWS | ✅ Production | High | Full SDK integration |
| Figma | ✅ Production | High | Complete API coverage |
| GitHub | ✅ Production | High | Octokit integration |
| Notion | ✅ Production | Medium | Core operations |
| Vercel | ✅ Production | High | Deployment APIs |
| PostgreSQL | ✅ Production | High | pg client |
| Docker | ✅ Production | Medium | Container ops |
| Kubernetes | ✅ Production | Medium | kubectl wrapper |
| GitLab | 🚧 Beta | Medium | Core APIs |
| Bitbucket | 🚧 Beta | Low | Basic operations |
| Others | ✅ Production | Varies | See individual tools |
