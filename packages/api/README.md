# @bitcode/api

Unified Bitcode **API orchestration** layer: route handlers, pipeline control
helpers, and shared **HTTP/stream primitives**.

## Layout

```
packages/api/src/
 routes/ # interface-ready route modules (auth, shippables, btd, …)
 pipelines/ # cancel, orphan-sweep, branch resume, …
 conversations/ # conversation route helpers
 responses/ # HTTP JSON / error / stream Response helpers → @bitcode/api/responses
 streams/ # Streamer, writeStream*, file-diff helpers → @bitcode/api/streams
 vcs/ # VCS route helpers
```

| Export | Role |
| --- | --- |
| `@bitcode/api` | Barrel for route/orchestration modules |
| `@bitcode/api/responses` | `createJsonResponse`, `createErrorResponse`, … |
| `@bitcode/api/streams` | Pipeline streaming primitives |
| `@bitcode/api/responses` | → `api/responses` |
| `@bitcode/api/streams` | → `api/streams` |

## Dependency direction

```
apps/uapi/app/api/* thin Next route bindings
 ↓
@bitcode/api orchestration + response/stream primitives
 ↓
@bitcode/{orm,auth,btd,execution-generics,conversations,vcs-generics,…}
```

Interface-owned route bindings (`apps/uapi/app/api/*`) stay thin. They import handlers
from this package; handlers import narrower domain packages — not the reverse.

## Principles

- Route ownership lives here; filesystem interface bindings stay thin
- Deeper product law lives in domain packages (`btd`, `pipeline-asset-pack`, …)
- All database operations use `@bitcode/orm`
- All auth uses `@bitcode/auth`
- Prefer `@bitcode/vcs-generics` / `generic-vcs-*` over legacy VCS names in new code
- User scoping is enforced at the route-orchestration layer

## BTD routes

Route code imports builders, parsers, validators, and JSON serializers from
`@bitcode/btd`. Route-owned behavior is limited to authentication, request body
parsing, registry projection reads, explicit persistence commits, and response
shaping via `@bitcode/api/responses`.
