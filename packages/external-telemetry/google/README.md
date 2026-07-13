# @bitcode/google-analytics

Type-safe Google Analytics (GA4) wrapper for the Bitcode platform. Provides robust analytics tracking with graceful degradation and server-side support.

## Core Features

- **Type-Safe Events**: TypeScript interfaces for GA4 event tracking
- **Graceful Degradation**: No-ops in non-browser or SSR contexts
- **Error Handling**: Sentry integration for instrumentation gaps
- **Server-Side Events**: Measurement Protocol fallback for critical events
- **Environment Safety**: Prevents ReferenceErrors in script-blocked environments

## Client-Side API

```typescript
import { trackEvent, setUserProperties, init } from '@bitcode/google-analytics';

// Initialize GA4
init({ measurementId: 'G-XXXXXXXXXX' });

// Track events
trackEvent('page_view', {
  event_category: 'engagement',
  page_title: 'Dashboard'
});

// Set user properties
setUserProperties({
  user_type: 'premium',
  subscription_tier: 'pro'
});
```

## Server-Side API

```typescript
import { sendServerEvent } from '@bitcode/google-analytics';

// Send critical backend events
await sendServerEvent('purchase', {
  transaction_id: 'txn_123',
  value: 99.99,
  currency: 'USD'
});
```

## Configuration

Requires environment variables:
- `GA_MEASUREMENT_ID`: GA4 measurement ID
- `GA_API_SECRET`: Measurement Protocol API secret

## Architecture

Wrapper automatically detects environment context and provides appropriate implementation. Server-side events use Measurement Protocol for reliable tracking of critical business events.
