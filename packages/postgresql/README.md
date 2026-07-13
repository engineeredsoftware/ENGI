# @bitcode/postgresql

PostgreSQL database management tools for the Bitcode platform. Provides schema introspection and query execution capabilities for PostgreSQL databases.

## Available Tools

- **postgresqlListTablesTool**: List all tables in database
- **postgresqlDescribeTableTool**: Get detailed table schema and metadata
- **postgresqlRunQueryTool**: Execute SQL queries with safety controls

## Usage

```typescript
import {
 postgresqlListTablesTool,
 postgresqlDescribeTableTool,
 postgresqlRunQueryTool
} from '@bitcode/postgresql';

// List database tables
const tables = await postgresqlListTablesTool();

// Describe table structure
const tableInfo = await postgresqlDescribeTableTool({
 table: 'conversations'
});

// Execute query
const results = await postgresqlRunQueryTool({
 sql: 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL \'1 day\''
});
```

## Return Types

- **Tables**: Array of table names with schema information
- **Schema**: Column definitions, data types, constraints, indexes
- **Query Results**: Row data with column metadata and execution stats

## Security Features

- Parameterized query support to prevent SQL injection
- Read-only connection options for introspection
- Query timeout and resource limits

## Architecture

Tools provide PostgreSQL-specific database operations with advanced features like array types, JSON columns, and full-text search. Designed for integration with Bitcode vector search and analytics workflows.
