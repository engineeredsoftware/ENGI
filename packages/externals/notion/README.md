# @bitcode/notion

Production-grade Notion integration package for Bitcode, providing comprehensive OAuth authentication, API client functionality, and tool interfaces for AI agents.

## Overview

This package provides:

- **OAuth Authentication**: Complete Notion OAuth 2.0 flow implementation
- **API Client**: Type-safe Notion API client with error handling and rate limiting
- **Tool Functions**: Ready-to-use functions for AI agent integration
- **Utilities**: Helper functions for content processing and data transformation
- **Connection Management**: Persistent storage and validation of user connections

## Architecture

```
@bitcode/notion/
├── src/
│   ├── auth.ts          # OAuth authentication flows
│   ├── client.ts        # Main Notion API client
│   ├── connections.ts   # Database operations for user connections
│   ├── tools.ts         # AI agent tool functions
│   ├── types.ts         # TypeScript type definitions
│   ├── utils.ts         # Utility functions
│   └── index.ts         # Public API exports
├── __tests__/           # Test suite
└── package.json
```

## Installation

This package is part of the Bitcode monorepo and uses workspace dependencies:

```json
{
  "dependencies": {
    "@bitcode/notion": "workspace:*"
  }
}
```

## Environment Variables

Required environment variables for OAuth:

```bash
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=https://yourdomain.com/api/integrations/notion/callback
```

## Usage

### Basic Usage

```typescript
import { createNotionClient, NotionConnections } from '@bitcode/notion';

// Create authenticated client for a user
const client = await createNotionClient(userId);
if (client) {
  const pages = await client.search({ query: 'project' });
  console.log(pages);
}
```

### OAuth Integration

```typescript
import { NotionAuth } from '@bitcode/notion';

const auth = new NotionAuth(clientId, clientSecret, redirectUri);

// Generate authorization URL
const authUrl = auth.getAuthorizationUrl(state);

// Exchange code for token
const oauthData = await auth.exchangeCodeForToken(code, state);

// Save connection
const connection = NotionAuth.oauthDataToConnection(userId, oauthData);
await NotionConnections.saveConnection(connection);
```

### AI Agent Tools

```typescript
import { 
  notionGetPageTool, 
  notionSearchTool, 
  notionCreatePageTool 
} from '@bitcode/notion';

const context = { user_id: 'user123' };

// Search workspace
const searchResult = await notionSearchTool(context, {
  query: 'meeting notes',
  filter: { value: 'page', property: 'object' }
});

// Get page content
const pageResult = await notionGetPageTool(context, pageId);

// Create new page
const newPage = await notionCreatePageTool(context, {
  parent: { database_id: databaseId },
  properties: {
    Name: {
      title: [{ text: { content: 'New Page Title' } }]
    }
  }
});
```

### Content Processing

```typescript
import { 
  pageToText, 
  blocksToMarkdown, 
  extractTitle,
  extractPlainText 
} from '@bitcode/notion';

// Convert page to readable text
const pageText = pageToText(page, blocks);

// Convert blocks to markdown
const markdown = blocksToMarkdown(blocks);

// Extract page title
const title = extractTitle(page);
```

## API Reference

### Client Methods

#### Pages
- `getPage(pageId)` - Retrieve page details
- `createPage(input)` - Create new page
- `updatePage(pageId, updates)` - Update page properties

#### Databases  
- `getDatabase(databaseId)` - Retrieve database schema
- `queryDatabase(input)` - Query database entries
- `createDatabase(pageId, schema)` - Create new database

#### Blocks
- `getBlockChildren(blockId)` - Get child blocks
- `appendBlockChildren(input)` - Add blocks to page
- `updateBlock(blockId, updates)` - Update block content

#### Search & Users
- `search(input)` - Search workspace content
- `getUsers()` - List workspace users
- `getComments(pageId)` - Get page comments

### Tool Functions

All tool functions follow the pattern:
```typescript
async function toolName(
  context: NotionToolContext,
  ...parameters
): Promise<NotionToolResult<T>>
```

Available tools:
- `notionGetPageTool` - Get page details
- `notionCreatePageTool` - Create page
- `notionUpdatePageTool` - Update page
- `notionGetDatabaseTool` - Get database
- `notionQueryDatabaseTool` - Query database  
- `notionSearchTool` - Search workspace
- `notionGetPageContentTool` - Get page with full content

### Connection Management

```typescript
// Get user connection
const connection = await NotionConnections.getConnection(userId);

// Validate connection
const validConnection = await NotionConnections.validateConnection(userId);

// Delete connection
await NotionConnections.deleteConnection(userId);
```

## Database Schema

The package requires a `user_notion_connections` table:

```sql
CREATE TABLE user_notion_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  bot_id text NOT NULL,
  workspace_id text NOT NULL,
  workspace_name text NOT NULL,
  workspace_icon text,
  owner_type text NOT NULL CHECK (owner_type IN ('user', 'workspace')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
```

## Error Handling

The package provides structured error handling:

```typescript
const result = await notionGetPageTool(context, pageId);

if (!result.success) {
  console.error('Tool failed:', result.error);
  // Handle specific error types:
  // - 'No valid Notion connection found'
  // - 'Invalid page ID format'
  // - 'The requested page could not be found'
  // - 'Rate limit exceeded'
  // etc.
}
```

## Content Types

The package handles all Notion content types:

- **Pages**: Regular Notion pages with properties and content blocks
- **Databases**: Structured data with schemas and entries
- **Blocks**: All block types (paragraphs, headings, lists, etc.)
- **Properties**: All property types (text, select, date, etc.)
- **Media**: Images, files, videos, and embeds

## Rate Limiting

The client handles Notion's rate limits automatically:
- Exponential backoff on rate limit errors
- Request queuing for high-volume operations
- Automatic retry with appropriate delays

## Security

- OAuth tokens are stored securely in the database
- All API requests use HTTPS
- Token validation prevents stale connections
- Row-level security policies protect user data

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Type checking
npm run type-check
```

## Integration with Bitcode Pipelines

This package can be integrated with Bitcode's existing pipeline system by adding Notion source handlers to discovery phases. For example, in AssetPack execution:

```typescript
import { createNotionClient, notionSearchTool, notionGetPageContentTool } from '@bitcode/notion';

// Add to discovery phase for content comprehension
const client = await createNotionClient(userId);
if (client) {
  const searchResult = await notionSearchTool({ user_id: userId }, {
    query: 'project requirements',
    filter: { value: 'page', property: 'object' }
  });
  
  // Process pages for pipeline context
  // ... integrate with existing discovery agents
}
```

## Contributing

When contributing to this package:

1. Follow Bitcode's TypeScript conventions
2. Add tests for new functionality
3. Update type definitions
4. Ensure OAuth flows remain secure
5. Test with real Notion workspaces

## Related Packages

- `@bitcode/mcps-tools-notion` - MCP tool exports
- `@bitcode/supabase` - Database operations
- `@bitcode/logger` - Logging infrastructure
