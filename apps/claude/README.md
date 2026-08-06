# @bitcode/external-apps-claude

**Claude Code plugin scaffold** for Bitcode.

## Hierarchy

```
packages/external-apps/
 chatgpt/ # ChatGPT App MCP (existing product surface)
 claude/ # this package — Claude Code plugin scaffold
```

## Layout (Claude Code plugin convention)

```
claude/
├── .claude-plugin/
│ └── plugin.json # manifest only
├── skills/
│ └── bitcode-operator/
│ └── SKILL.md
├── agents/
│ └── bitcode-assistant.md
├── hooks/
│ └── hooks.json
├── .mcp.json # optional Bitcode MCP wiring
└── README.md
```

Components sit at the **plugin root**, not inside `.claude-plugin/` (Claude Code layout law).

## Install (local / team)

From a Claude Code marketplace or local path source, point at this directory.
Omit `version` for commit-SHA updates during active development, or bump
`plugin.json` `version` for explicit releases.

## Related

- ChatGPT App: `@bitcode/external-apps-chatgpt`
- Bitcode Exchange MCP: `@bitcode/generic-mcps-bitcode`
