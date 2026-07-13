# @bitcode/sentry

Error monitoring and performance tracking for the Bitcode platform. Provides graceful Sentry SDK wrapper with automatic instrumentation and environment detection.

## Core Features

- **Graceful Degradation**: Works without Sentry SDK or DSN configured
- **Automatic Instrumentation**: Fetch requests, global errors, unhandled rejections
- **Environment Detection**: Edge runtime and build-time compatibility
- **Universal Error Handling**: Browser and Node.js support

## Error Tracking

```typescript
import { captureException, captureMessage, withScope } from '@bitcode/sentry';

// Capture exceptions
try {
  riskyOperation();
} catch (error) {
  captureException(error, { 
    extra: { context: 'user-action' } 
  });
}

// Capture messages
captureMessage('Important event occurred', {
  level: 'info',
  extra: { userId: '123' }
});

// Scoped context
withScope(scope => {
  scope.setTag('feature', 'authentication');
  captureException(authError);
});
```

## Performance Monitoring

```typescript
import { startSpan } from '@bitcode/sentry';

const result = await startSpan(
  { name: 'database-query', op: 'db' },
  async () => {
    return await executeQuery(sql);
  }
);
```

## Configuration

Automatic initialization when `SENTRY_DSN` environment variable is set. No configuration required - works as no-op stub when Sentry is not available.

## Architecture

SDK detection automatically chooses appropriate Sentry package (`@sentry/nextjs` or `@sentry/node`). Automatic global error handlers capture unhandled exceptions. Fetch instrumentation provides request monitoring without manual setup.
