# security

Security utilities as subpackages under `packages/security/*`.

| Nested | Package |
| --- | --- |
| `encryption/` | `@bitcode/security-encryption` |
| `credentials/` | `@bitcode/security-credentials` |
| `rate-limiting/` | `@bitcode/security-rate-limiting` |
| `audit/` | `@bitcode/security-audit` |
| `validation/` | `@bitcode/security-validation` |
| `headers/` | `@bitcode/security-headers` |
| `monitoring/` | `@bitcode/security-monitoring` |
| `error-handling/` | `@bitcode/security-error-handling` |
| `twilio/` | `@bitcode/security-twilio` |
| `client/` | `@bitcode/security-client` |

BC barrel: `@bitcode/security` re-exports the server-side subpackages.
Client hooks: `@bitcode/security/client` or `@bitcode/security-client`.
