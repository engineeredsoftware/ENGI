# generic-vcs

Nested VCS **provider** implementations of `@bitcode/vcs-generics` primitives.

## Hierarchy

```
@bitcode/vcs-generics                 # types, AbstractVCSProvider, factory, service, cache
        ↑
@bitcode/generic-vcs-github           # github/
@bitcode/generic-vcs-gitlab           # gitlab/
@bitcode/generic-vcs-bitbucket        # bitbucket/
@bitcode/generic-vcs-git              # git/  (operation bridge over providers)
```

## Packages

| Path | Package | Role |
| --- | --- | --- |
| `github/` | `@bitcode/generic-vcs-github` | GitHub provider (+ App auth) |
| `gitlab/` | `@bitcode/generic-vcs-gitlab` | GitLab provider |
| `bitbucket/` | `@bitcode/generic-vcs-bitbucket` | Bitbucket provider |
| `git/` | `@bitcode/generic-vcs-git` | Git-shaped operation bridge via VCS providers |

Compatibility shims at `packages/{github,gitlab,bitbucket,git,vcs}/` re-export the
new package names (`@bitcode/github`, `@bitcode/vcs`, …). Prefer hierarchy package names in new code.

Related (not providers): `@bitcode/generic-tools-vcs` / `@bitcode/generic-agents-vcs`
are tools/agents over the VCS layer, not provider implementations.
