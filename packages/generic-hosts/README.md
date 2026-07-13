# generic-hosts

Nested Host **base implementations** of `@bitcode/host-generics`.

## Hierarchy

```
@bitcode/host-generics
        ↑
@bitcode/generic-hosts-local              # Local/     (was InlineHost)
@bitcode/generic-hosts-vercel-sandbox     # VercelSandbox/
```

| Path | Package | Role |
| --- | --- | --- |
| `Local/` | `@bitcode/generic-hosts-local` | LocalHost — in-process git clone + Node filesystem |
| `VercelSandbox/` | `@bitcode/generic-hosts-vercel-sandbox` | VercelSandboxHost + Vercel capabilities/manifest |

`BITCODE_PIPELINE_HOST`: `local` (default; `inline` accepted as BC alias) | `sandbox`.
