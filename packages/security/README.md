# security

Production security utilities as **nested packages** under `packages/security/*`.

| Nested | Package | Role |
| --- | --- | --- |
| `encryption/` | `@bitcode/security-encryption` | Encrypt/decrypt credentials |
| `credentials/` | `@bitcode/security-credentials` | Lifecycle, rotation, expiration |
| `rate-limiting/` | `@bitcode/security-rate-limiting` | Sliding-window rate limits |
| `audit/` | `@bitcode/security-audit` | Audit log events |
| `validation/` | `@bitcode/security-validation` | Zod schemas for connections/MCP config |
| `headers/` | `@bitcode/security-headers` | CSP / CSRF / security headers |
| `monitoring/` | `@bitcode/security-monitoring` | Threat thresholds and alerts |
| `error-handling/` | `@bitcode/security-error-handling` | Safe error surfaces |
| `twilio/` | `@bitcode/security-twilio` | Webhook + phone helpers |
| `client/` | `@bitcode/security-client` | React secure-form hooks only |

## Imports

```ts
// Prefer specific subpackages in new code
import { encryptCredential } from '@bitcode/security-encryption';

// composition barrel (server-side only — do not pull client into Node routes)
import { encryptCredential, rateLimitMiddleware } from '@bitcode/security';

// Client hooks
import { useSecureCredentialInput } from '@bitcode/security-client';
// or: from '@bitcode/security/client'
```

`credentials` depends on `encryption` + `audit`. `monitoring` depends on `audit`.
`headers` and `rate-limiting` may use Next.js request/response types.
