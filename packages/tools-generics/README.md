# @bitcode/tools-generics

The foundational tool primitives for Bitcode. This package provides the `Tool` class and related infrastructure for building type-safe, doc-aware tools.

## Overview

Tools in Bitcode are type-safe wrappers around functions that:
- Provide structured documentation via `@doc-code-tool`
- Enable automatic invocation tracking
- Support MCP (Model Context Protocol) integration
- Maintain zero runtime overhead

## Core API

### Tool Class

```typescript
export abstract class Tool<T extends ToolFunction = ToolFunction> {
 abstract use: T;

 // Runtime execution
 async execute(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
 return this.use(...args);
 }
}
```

### Creating a Tool

```typescript
import { Tool } from '@bitcode/tools-generics';
import { z } from 'zod';

// Define the tool function
async function searchCode(query: string, options?: { limit?: number }) {
 // Implementation
 return results;
}

// Create the Tool class
export class SearchCodeTool extends Tool<typeof searchCode> {
 use = searchCode;
}
```

## Doc-Code Integration

Tools use `@doc-code-tool` comments that **are** the LLM documentation surface
(purpose, capabilities, **parameters**, **output**):

```typescript
/**
 * @doc-code-tool
 * @purpose Search through codebase for patterns
 * @capabilities AST-aware search, regex support, file filtering
 * @parameters query: search pattern, options: search configuration
 * @output Array of matched locations with context
 */
export class SearchCodeTool extends Tool<typeof searchCode> {
 use = searchCode;
}
```

Build-time doc-code (`@bitcode/generic-doc-comments-doc-code`) attaches
`DocCodeToolPrompt` to `tool.__docCodePrompt`. Runtime:

```ts
import { formatUsableTools, attachDocCodeToolPrompt } from '@bitcode/tools-generics';

const docsForLlm = formatUsableTools([searchTool, …]);
// Agent PTRR auto-injects this as auto:tools_doc_code_tools (see agent-generics TOOLS-IN-PTRR.md)
```

### Agent + PTRR (parameters and results)

| Concern | Mechanism |
| --- | --- |
| Parameters (how the model fills args) | Doc-code `@parameters` + step schema `useTools: [{ name, input, reason }]` |
| Selection | Structured output `output.useTools` after Failsafe×Thinkings |
| Execution | `factoryToolsExecution` → `execution.tools.getTool(name).execute(input)` |
| Results | `usedTools: [{ tool, input?, output?, error? }]` + `auto:tools_results` interpolation |

Full lifecycle: **`@bitcode/agent-generics` → `TOOLS-IN-PTRR.md`**.

## MCP Integration

The package provides MCP (Model Context Protocol) wrappers for external tools:

```typescript
import { wrapMCPTool } from '@bitcode/tools-generics';

const mcpTool = wrapMCPTool({
 name: 'github-create-pr',
 description: 'Create a pull request',
 inputSchema: { /* zod schema */ },
 handler: async (params) => { /* implementation */ }
});
```

## Best Practices

1. **Always extend Tool class** - Never use raw functions
2. **Include @doc-code-tool** - Documentation IS the prompt
3. **Type-safe parameters** - Use zod schemas for validation
4. **Pure functions** - Tools should be stateless
5. **Error handling** - Return structured errors, don't throw

## Directory Structure

```
/src/
├── Tool.ts # Core Tool class
├── types.ts # Type definitions
├── mcp/ # MCP integration
│ └── MCPToolWrapper.ts
└── doc-code-tool/ # Doc-code prompt + formatter infrastructure
 ├── DocCodeToolPrompt.ts
 ├── DocCodeToolDecorator.ts
 └── formatUsableTools.ts
```

## Philosophy

Tools are the interface between AI systems and concrete capabilities. By maintaining type safety and structured documentation, we enable:
- Automatic tool discovery
- Automated tool selection
- Safe tool composition
- Performance tracking

Every tool in Bitcode follows these patterns for consistency and reliability.
