# @bitcode/mcp-generics

MCP **primitive** contracts: configuration types and runtime validation.

## Hierarchy

```
@bitcode/mcp-generics # this package (McpConfig, schema, validate)
 ↑
@bitcode/generic-mcps-bitcode # generic-mcps/bitcode — Bitcode Exchange MCP server
```

Compatibility barrels:

- `@bitcode/mcp-generics` → re-exports this package
- `@bitcode/generic-mcps-bitcode` → re-exports `@bitcode/generic-mcps-bitcode`

## Spec-aligned role

This package is product-neutral. It does **not** own the Bitcode Exchange MCP server.

| Package | Role |
| --- | --- |
| `@bitcode/mcp-generics` | Primitive config + validation |
| `@bitcode/generic-mcps-bitcode` | Bitcode Exchange-facing MCP tools, auth, streaming, resources |
| Third-party MCPs | Admitted external ingress (attachments, repo connections, config) |

## Usage

```ts
import { McpConfigSchema, validateMcpConfig, type McpConfig } from '@bitcode/mcp-generics';

const config: McpConfig = {
 id: 'filesystem-mcp',
 type: 'filesystem',
 config: { rootPath: '/project/data' },
};

const validation = validateMcpConfig(config);
if (!validation.success) {
 throw new Error(validation.reasons.join(', '));
}

const parsed = McpConfigSchema.parse(config);
```

## API

- `McpConfig` — `{ id, type, config? }`
- `McpConfigSchema.parse` / `.safeParse`
- `validateMcpConfig` — `{ success, reasons }`
