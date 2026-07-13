# Integrations Architecture

## Overview

Bitcode provides integrations with external services through two primary systems:
1. **VCS Providers** — version control hierarchy (`vcs-generics` + `generic-vcs/*`)
2. **MCP Tools** — Model Context Protocol tools for external services

## VCS hierarchy (required pattern)

```
@bitcode/vcs-generics                      # primitives
        ↑
@bitcode/generic-vcs-github                # packages/generic-vcs/github
@bitcode/generic-vcs-gitlab                # packages/generic-vcs/gitlab
@bitcode/generic-vcs-bitbucket             # packages/generic-vcs/bitbucket
@bitcode/generic-vcs-git                   # git operation bridge
```

| Package | Role |
| --- | --- |
| `packages/vcs-generics/` | Types, `AbstractVCSProvider`, `VCSProvider`, factory, service, connections, cache |
| `packages/generic-vcs/github/` | GitHub provider (+ App auth) |
| `packages/generic-vcs/gitlab/` | GitLab provider |
| `packages/generic-vcs/bitbucket/` | Bitbucket provider (Cloud + Server) |
| `packages/generic-vcs/git/` | Git-shaped bridge over providers |

**Compatibility shims only** (prefer hierarchy packages in new code):

| Shim | Re-exports |
| --- | --- |
| `@bitcode/vcs` | `@bitcode/vcs-generics` |
| `@bitcode/github` | `@bitcode/generic-vcs-github` |
| `@bitcode/gitlab` | `@bitcode/generic-vcs-gitlab` |
| `@bitcode/bitbucket` | `@bitcode/generic-vcs-bitbucket` |
| `@bitcode/git` | `@bitcode/generic-vcs-git` |

### Provider law

```typescript
// Primitive base
abstract class VCSProvider implements Pick<AbstractVCSProvider, 'type'> { … }

// Every provider base
class BitbucketProvider extends VCSProvider implements AbstractVCSProvider {
  readonly type = 'bitbucket';
  // …
}

// Factory registration (in vcs-generics)
VCSProviderFactory.registerProvider('bitbucket', () => import('@bitcode/generic-vcs-bitbucket'));
VCSProviderFactory.registerProvider('github', () => import('@bitcode/generic-vcs-github'));
VCSProviderFactory.registerProvider('gitlab', () => import('@bitcode/generic-vcs-gitlab'));
```

MCP tools for VCS must depend on `@bitcode/vcs-generics` + `@bitcode/generic-vcs-*`,
not on the shim packages alone.

## MCP Tools

See `packages/generic-tools/mcps-tools/` for per-service tools (GitHub, GitLab,
Bitbucket, Supabase, Vercel, …). VCS-shaped MCP adapters bridge to the hierarchy
above (e.g. `generic-tools/mcps-tools/bitbucket` → `generic-vcs-bitbucket`).
