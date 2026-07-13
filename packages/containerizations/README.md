# containerizations

Nested packages for container runtimes (Docker, future Podman, …).

## Hierarchy

```
packages/containerizations/
  docker/     # @bitcode/containerizations-docker
```

| Path | Package | Role |
| --- | --- | --- |
| `docker/` | `@bitcode/containerizations-docker` | Docker container/image/network/volume helpers (MCP primitives) |

BC: `@bitcode/docker` / `@bitcode/dockerUtils` re-export this package.
MCP tools: `@bitcode/generic-tools-mcps-docker` wraps these helpers as Tools.
