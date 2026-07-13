# @bitcode/vcs-generics

VCS **primitive** package: types, `AbstractVCSProvider`, factory, service, connections, cache.

## Hierarchy

```
@bitcode/vcs-generics
        ↑
@bitcode/generic-vcs-{github,gitlab,bitbucket,git}
```

Compatibility: `@bitcode/vcs` re-exports this package.

Providers register lazily via `VCSProviderFactory` into `@bitcode/generic-vcs-*`.
