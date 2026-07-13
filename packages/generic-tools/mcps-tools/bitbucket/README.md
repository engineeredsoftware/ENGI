# Bitbucket MCP Tool

## Overview

Industrial Model Context Protocol (MCP) integration for Atlassian Bitbucket operations. Provides comprehensive repository management, pull request lifecycle, issue tracking, and collaborative development workflows through standardized MCP protocol interface.

## Core Capabilities

### Repository Management
- Repository listing and metadata retrieval
- Branch and tag lifecycle management
- File content operations and directory browsing
- Commit creation and history analysis

### Pull Request Lifecycle
- Pull request creation and management
- Code review workflow automation
- Merge strategy configuration
- Approval and decline operations

### Issue Tracking System
- Issue creation and status management
- Priority and type classification
- Assignment and collaboration features
- Comment and discussion threads

### Collaboration Features
- Multi-user workspace operations
- Role-based access control
- OAuth and basic authentication support
- Cross-repository operations

## MCP Operations

| Operation Category | Operations | Purpose |
|-------------------|------------|---------|
| **Repository** | `listRepositories`, `getRepository` | Repository discovery and metadata |
| **Branch Management** | `listBranches`, `createBranch` | Branch lifecycle operations |
| **Tag Management** | `listTags`, `createTag` | Release and version tagging |
| **File Operations** | `getFileContent`, `listDirectory`, `commitFiles` | File system operations |
| **Commit Operations** | `listCommits`, `getCommit`, `getCommitDiff` | Version history and analysis |
| **Pull Requests** | `listPullRequests`, `createPullRequest`, `updatePullRequest`, `commentOnPullRequest`, `approvePullRequest`, `mergePullRequest`, `declinePullRequest` | Code review workflow |
| **Issue Tracking** | `listIssues`, `createIssue`, `updateIssue`, `commentOnIssue`, `deleteIssue` | Project management |

## Technical Implementation

### Architecture Pattern
```typescript
import { bitbucketMCPTool } from '@bitcode/generic-tools-mcps-bitbucket';

// Repository operations
const repositories = await bitbucketMCPTool.use('listRepositories', {
 workspace: 'company-workspace',
 role: 'contributor',
 accessToken: process.env.BITBUCKET_TOKEN
});

// Pull request lifecycle
const pullRequest = await bitbucketMCPTool.use('createPullRequest', {
 workspace: 'company-workspace',
 repoSlug: 'main-application',
 title: 'Feature: User authentication system',
 sourceBranch: 'feature/auth-system',
 destinationBranch: 'main',
 description: 'Implements OAuth2 authentication with JWT tokens',
 closeSourceBranch: true,
 accessToken: process.env.BITBUCKET_TOKEN
});

// Issue management
const issue = await bitbucketMCPTool.use('createIssue', {
 workspace: 'company-workspace',
 repoSlug: 'main-application',
 title: 'Database connection timeout',
 content: 'Users experiencing connection timeouts during peak hours',
 kind: 'bug',
 priority: 'major',
 assignee: 'lead-developer',
 accessToken: process.env.BITBUCKET_TOKEN
});
```

### Unified Operation Handler
- Single tool class for all Bitbucket operations
- Operation-based routing with parameter validation
- Comprehensive error handling and recovery
- Metadata enrichment for operation tracking

## Configuration

### Authentication Methods
- OAuth 2.0 access token authentication
- Basic authentication with app passwords
- Workspace-based permission management
- Role-based operation filtering

### Workspace Configuration
- Multi-workspace operation support
- Repository slug resolution
- Project-based organization
- Team collaboration settings

### API Integration Settings
- Bitbucket REST API v2.0 utilization
- Rate limiting and quota management
- Connection pooling for high-throughput operations
- Regional endpoint optimization

## Performance Characteristics

### Operation Optimization
- Batch operation support for multiple repositories
- Concurrent API request processing
- Intelligent caching for frequently accessed data
- Connection reuse across operations

### Scalability Features
- Multi-workspace concurrent operations
- Large repository handling capabilities
- Pagination support for bulk data retrieval
- Memory-efficient data streaming

### Error Recovery
- Automatic retry for transient API failures
- Graceful degradation for partial service outages
- Comprehensive error categorization and reporting
- Circuit breaker patterns for API protection

## Service Integration Patterns

### MCP Protocol Compliance
- Standardized Bitbucket operation interface
- Type-safe parameter validation and routing
- Consistent error handling across all operations
- DocCodeToolPrompt documentation integration

### Development Workflow Integration
- CI/CD pipeline trigger integration
- Automated pull request workflows
- Issue tracking system synchronization
- Code quality gate enforcement

### Version Control System Integration
- Git repository synchronization
- Branch protection rule enforcement
- Merge conflict resolution assistance
- Repository mirroring and backup

## Workflow Automation Patterns

### Pull Request Automation
- Automated PR creation from feature branches
- Code review assignment based on file changes
- Merge strategy enforcement
- Post-merge cleanup operations

### Issue Management Automation
- Automated issue creation from error reports
- Priority escalation based on severity
- Assignment rotation and load balancing
- Status synchronization with external systems

### Repository Maintenance
- Automated branch cleanup after merge
- Tag creation for release management
- Repository health monitoring
- Access control audit and compliance

## Security and Compliance

### Access Control
- Fine-grained permission management
- Role-based operation restrictions
- Audit trail for all operations
- Secure credential handling

### Data Protection
- API token encryption and rotation
- Secure communication protocols
- Data retention policy compliance
- Privacy-focused operation logging

### Compliance Features
- GDPR compliance for user data handling
- SOC2 audit trail generation
- Enterprise security policy enforcement
- Multi-factor authentication support

## Use Case Patterns

### Feature Development Workflow
- Branch creation and management
- Code review and approval process
- Merge and deployment coordination
- Quality assurance integration

### Project Management Integration
- Issue tracking and resolution
- Sprint planning and execution
- Release management and tagging
- Team collaboration and communication

### Repository Operations
- Multi-repository management
- Cross-repository synchronization
- Repository template and standardization
- Backup and disaster recovery