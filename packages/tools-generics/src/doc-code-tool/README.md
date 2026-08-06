# Doc-Code-Tool Implementation

The `@doc-code-tool` pattern is implemented through the webpack loader in the `@bitcode/generic-doc-comments-doc-code` package. This document describes how to use it with Tool classes.

## Pattern

```typescript
/**
 * @doc-code-tool
 * @prompt MY_TOOL_PROMPT
 */
class MyTool extends Tool {
 // Tool implementation
}
```

## Requirements

1. **Single Field Only**: The comment must ONLY contain the `@prompt` field
2. **Import Required**: The prompt constant must be imported in the same file
3. **Tool Instance**: The pattern works on tool instantiations

## How It Works

The webpack loader transforms:

```typescript
// Before build
export const myTool = new MyTool();
```

Into:

```typescript
// After build
export const myTool = new MyTool();
myTool.__docCodePrompt = MY_TOOL_PROMPT;
myTool.__promptParts = MY_TOOL_PROMPT;
```

## DocCodeToolPrompt Class

All descriptive fields belong in the `DocCodeToolPrompt` class, NOT in the comment:

```typescript
export class MyToolPrompt extends DocCodeToolPrompt {
 name = "My Tool";
 category = "utility";
 description = "Does something useful";
 // ... other fields
}

export const MY_TOOL_PROMPT = new MyToolPrompt();
```

## Integration

The `formatUsableTools` function automatically uses the attached prompts:

```typescript
import { formatUsableTools } from '@bitcode/tools-generics';

const tools = [myTool, otherTool];
const documentation = formatUsableTools(tools);
// Returns formatted documentation from __docCodePrompt

The same prompt is also attached to `__promptParts` as a support carrier for older prompt-part-aware paths.
```

## Type Safety

The Tool base class includes:

```typescript
export abstract class Tool<T extends ToolFunction = ToolFunction> {
 /**
 * DocCodeToolPrompt attached by build-time transform.
 * @internal
 */
 __docCodePrompt?: any;
}
```

## Current Status

- 28 of 53 tools use the correct pattern
- Transformation happens automatically during webpack build
- No manual steps required
