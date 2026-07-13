# @bitcode/jira

Comprehensive Jira integration package for the Bitcode platform. Provides OAuth-authenticated client with full issue management, project operations, and JQL query capabilities.

## Core Components

- **JiraClient**: Full-featured Jira REST API client
- **JiraAuth**: OAuth 2.0 authentication flow management
- **JiraConnections**: User connection persistence and validation
- **Helper Functions**: Convenience methods for common operations
- **URL Utilities**: Issue/project key extraction from Jira URLs

## Key Features

- Complete issue lifecycle management (create, update, transition, assign)
- Project and user management operations
- Advanced JQL query support with pre-built queries
- Issue linking and comment management
- OAuth connection handling with token refresh
- Type-safe interfaces for all Jira entities

## Usage

```typescript
import { 
  createJiraClientFromUser,
  jiraSearchIssues,
  JQL_QUERIES 
} from '@bitcode/jira';

// Create authenticated client
const client = await createJiraClientFromUser(userId);

// Search for issues
const results = await jiraSearchIssues(
  connection,
  JQL_QUERIES.myOpenIssues,
  25
);

// Create new issue
await jiraCreateIssue(
  connection,
  'PROJ',
  'Bug',
  'Critical bug report',
  'Detailed description...'
);
```

## URL Processing

```typescript
import { extractIssueKeyFromUrl, parseJiraBaseUrl } from '@bitcode/jira';

const issueKey = extractIssueKeyFromUrl(
  'https://company.atlassian.net/browse/PROJ-123'
); // Returns: 'PROJ-123'
```

## Architecture

OAuth-based authentication ensures secure access to user's Jira instances. Connection management handles token refresh and validation. Comprehensive API coverage supports full Jira workflow integration.
