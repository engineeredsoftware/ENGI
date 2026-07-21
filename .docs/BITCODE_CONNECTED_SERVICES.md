# Bitcode Connected Services Notes

Status: non-canonical internal note.

## Purpose

Connected services are provider, source, and delivery mechanisms attached to Bitcode Exchange state.

Examples:
- GitHub and other VCS providers,
- Supabase/Postgres,
- wallet and fee-readiness systems for BTC fee liquidity and `$BTD` holding reads,
- Figma and design-context providers,
- Jira and issue systems,
- MCP servers,
- ChatGPT App connectors,
- deployment and observability providers.

## Rules

- Connected services are not separate products.
- Source providers bind evidence and repository scope.
- Delivery providers receive DataPacks or DataPack partials.
- Every write-capable connected interface must fail closed without readiness and admission receipts.
- MCP and ChatGPT App writes must admit against owner-read or licensed-read registry evidence, not aggregate `$BTD` holding thresholds.
- Organization `$BTD` posture must read member wallet bindings through BTD registry ownership and read-license rows.
- Provider payloads must normalize toward Read, fit, DataPack, settlement, proof, or delivery-mechanism semantics.

## Current Source Examples

- `apps/uapi/app/api/vcs/*`
- `packages/vcs-generics/*` + `packages/generic-vcs/*` (sole homes; root `packages/{vcs,github,gitlab,git,bitbucket}` removed)
- `packages/externals/jira/*` (sole home; root `packages/jira` removed)
- `apps/chatgpt/*`
- `packages/mcp-generics/* + apps/mcp/*`
- `packages/api/src/routes/*`
