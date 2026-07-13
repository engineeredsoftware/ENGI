# external-apps

Bitcode packages that embed **external AI product surfaces** (ChatGPT App, Claude Code plugin, …).

These are **not** core protocol packages. They consume Bitcode primitives (MCP, VCS, tools, BTD) and present them inside third-party hosts.

## Hierarchy

```
packages/external-apps/
  chatgpt/     # @bitcode/external-apps-chatgpt  (ChatGPT App MCP server)
  claude/      # @bitcode/external-apps-claude   (Claude Code plugin scaffold)
```

| Path | Package | Host | Role |
| --- | --- | --- | --- |
| `chatgpt/` | `@bitcode/external-apps-chatgpt` | OpenAI ChatGPT Apps / MCP | Existing Bitcode ChatGPT App MCP server |
| `claude/` | `@bitcode/external-apps-claude` | Claude Code | Plugin scaffold (skills, agents, MCP wiring) |

BC alias: `@bitcode/chatgptapp` → `external-apps/chatgpt` (compatibility).

Prefer hierarchy package names in new code.
