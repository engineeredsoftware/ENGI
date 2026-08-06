# @bitcode/supabase

Supabase client utilities and MCP tools for the Bitcode platform. Provides centralized database access with SSR support and administrative operations.

## Client Types

- **supabase**: Public client for browser/authenticated operations
- **supabaseAdmin**: Admin client with elevated privileges for server operations
- **SSR Clients**: Server-side rendering support with middleware integration

## Core Features

- **Centralized Configuration**: Environment-aware client creation
- **SSR Support**: Server-side rendering with Next.js integration
- **MCP Tools**: Model Control Protocol database tools
- **AssetPack Evidence Management**: Typed AssetPack evidence and Evidence Document entities
- **Security**: Automatic key sanitization and safe defaults

## Client Usage

```typescript
import { supabase, supabaseAdmin } from '@bitcode/supabase';

// Public client (browser)
const { data: user } = await supabase.auth.getUser();

// Admin client (server)
const { data: users } = await supabaseAdmin
 .from('users')
 .select('*')
 .limit(10);
```

## SSR Integration

```typescript
// Server components
import { createClient } from '@bitcode/supabase/ssr/server';
const supabase = createClient();

// Middleware
import { updateSession } from '@bitcode/supabase/ssr/middleware';
export const middleware = updateSession;
```

## MCP Tools

```typescript
import {
 supabaseMcpTool,
 supabaseQueryTool,
 supabaseInsertTool
} from '@bitcode/supabase';

// Template matching
const templates = await supabaseMcpTool({
 userId: 'user-123',
 query: 'authentication',
 count: 5
});
```

## Architecture

Provides unified Supabase access across browser and server environments. SSR helpers ensure proper session management in Next.js applications. MCP tools enable Model Control Protocol integration for database operations.
