# Apps

Runnable Bitcode surfaces. Shared domain code lives under `/packages` and is
consumed via `workspace:*` — never the reverse.

| App | Path | Role |
|-----|------|------|
| **uapi** | `apps/uapi` | Next.js product (Marketing, Packs, Reads, Deposits, Docs, …) |
| **mcp** | `apps/mcp` | Bitcode Exchange-facing MCP server (`@bitcode/generic-mcps-bitcode`) |
| **chatgpt** | `apps/chatgpt` | ChatGPT App MCP scaffolding (`@bitcode/external-apps-chatgpt`) |
| **claude** | `apps/claude` | Claude Code plugin stub (`@bitcode/external-apps-claude`) |

## Commands

```bash
# Next.js
pnpm -C apps/uapi run dev
pnpm -C apps/uapi run build
pnpm -C apps/uapi exec jest

# MCP server
pnpm --filter @bitcode/generic-mcps-bitcode test

# ChatGPT app
pnpm --dir apps/chatgpt test
```

## Vercel

Project **Root Directory** must be `apps/uapi`. Monorepo install/build
commands live in `apps/uapi/vercel.json` (install from repo root via pnpm
workspace, then `pnpm run build` in the app).
