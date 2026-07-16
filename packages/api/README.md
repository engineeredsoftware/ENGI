# @bitcode/api

Unified Bitcode **API orchestration** layer: route handlers, pipeline control
helpers, and shared **HTTP/stream primitives**.

## Layout

```
packages/api/src/
 routes/ # interface-ready route modules (auth, executions, btd, …)
 pipelines/ # cancel, orphan-sweep, branch resume, …
 conversations/ # conversation route helpers
 responses/ # HTTP JSON / error / stream Response helpers → @bitcode/api/responses
 streams/ # Streamer, writeStream*, file-diff helpers → @bitcode/api/streams
 vcs/ # VCS route helpers
```

| Export | Role |
| --- | --- |
| `@bitcode/api` | Barrel for route/orchestration modules |
