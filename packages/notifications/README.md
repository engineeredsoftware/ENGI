# @bitcode/notifications

Event-driven notification system for the Bitcode platform. Provides email delivery, event processing, and background worker management with automatic startup.

## Core Components

- **Email Delivery**: Template-based email sending via SMTP
- **Event System**: Typed event definitions and processing
- **Background Worker**: Automatic notification processing
- **Template Engine**: HTML template rendering with variable interpolation

## Key Features

- Automatic worker startup in server environments
- Template-based email composition with variable substitution
- Graceful degradation when SMTP not configured
- Event-driven architecture for extensible notifications
- Background processing for reliable delivery

## Email System

```typescript
import { sendEmail } from '@bitcode/notifications';

// Send templated email
await sendEmail({
 to: 'user@example.com',
 subject: 'Welcome to Bitcode',
 template: 'welcome',
 vars: {
 userName: 'John Doe',
 activationLink: 'https://app.bitcode.ai/activate/...'
 }
});
```

## Event Processing

```typescript
import { emitRunLifecycle, startNotificationWorker } from '@bitcode/notifications';

// Worker starts automatically unless DISABLE_NOTIFICATIONS_WORKER=1
// Manual start for custom scenarios
startNotificationWorker();

emitRunLifecycle({
 status: 'STARTED',
 runId: 123,
 runType: 'asset-pack',
 userId: 'user-id'
});
```

Run lifecycle notifications use Bitcode execution semantics:
- `asset-pack` for AssetPack synthesis, stored evidence, Finish, and optional Shippable delivery runs.
- `read-measurement` for Read measurement executions that feed reviewable Read and fit workflows.
- Notification deep links point to the product execution bridge at `/executions/:runId`.

## Configuration

- **EMAIL_SMTP_URL**: SMTP server connection string
- **DISABLE_NOTIFICATIONS_WORKER**: Set to '1' to disable auto-start

## Architecture

Worker automatically processes notification events in background. Template system supports HTML emails with {{variable}} substitution. Graceful fallback ensures development environments work without SMTP.
