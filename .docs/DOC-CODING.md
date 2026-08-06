# Doc-Coding System

## Overview

The doc-coding system provides infrastructure for attaching metadata to code through TypeScript comments. While the system has sophisticated design goals, the current implementation is foundational infrastructure without build-time integration.

## Current Implementation Status

### ✅ What Exists

#### Infrastructure Packages
- **`@bitcode/doc-comment-generics`** - Pure plugin infrastructure
 - Base plugin classes and interfaces
 - Plugin registry system
 - Parser foundations
 - TypeScript transformer factory (not integrated)

- **`@bitcode/generic-doc-comments-doc-code`** - Runtime injection system
 - Transform interface for build tools
 - Prompt injection pattern definitions
 - Build integration helpers (not active)

- **`@bitcode/generic-doc-comments-doc-developing`** - Development annotation base
 - Base class for development-time annotations
 - Validation framework

#### Plugin Implementations
- **`@bitcode/generic-doc-comments-doc-developing-prompt`** - Prompt development plugin
- **`@bitcode/generic-doc-comments-doc-developing-promptpart`** - PromptPart development plugin
- **`@bitcode/doc-field`** - Field injection plugin
- **`@bitcode/doc-typescript`** - TypeScript introspection
- **`@bitcode/doc-dryrun`** - Dry-run capabilities

#### Co-located Plugins
Plugins that enhance specific packages live with those packages:
- `@bitcode/prompts/src/doc-plugins/` - doc-prompt and doc-promptpart
- `@bitcode/pipelines-generics/src/doc-plugins/` - doc-pgri

### ❌ What Doesn't Exist

#### Build Integration
- TypeScript transformer not configured in build
- No webpack/rollup integration
- No automatic prototype injection
- No build-time processing

#### Runtime Features
- No `hasPromptIntelligence()` function
- No `getPromptIntelligence()` function
- No `hasSientKnowledge()` function
- No automatic metadata access

## How It Works (When Fully Implemented)

### The Vision

```typescript
// You write:
/**
 * @doc-promptpart
 * version: 1.0.0
 * category: base_system_identity
 * priority: critical
 */
export const BITCODE_IDENTITY: PromptPart = `You are Bitcode...`;

// Build process WOULD inject:
BITCODE_IDENTITY.__proto__.docPromptPart = {
 version: '1.0.0',
 category: 'base_system_identity',
 priority: 'critical'
};

// Runtime access (when implemented):
const metadata = BITCODE_IDENTITY.__proto__.docPromptPart;
```

### Current Reality

The system provides classes and interfaces but requires manual integration:

```typescript
import { BaseDocCommentPlugin } from '@bitcode/doc-comment-generics';

// Plugins must be manually registered
class MyPlugin extends BaseDocCommentPlugin {
 // Implementation
}

// Manual injection required
const metadata = { version: '1.0.0' };
Object.defineProperty(target.prototype, 'docMetadata', {
 value: metadata
});
```

## Available Annotations

### Core Annotations

#### @doc-promptpart
For PromptPart version tracking:
```typescript
/**
 * @doc-promptpart
 * version: 1.0.0
 * category: agent_definition
 * priority: critical
 */
```

#### @doc-prompt
For prompt intelligence:
```typescript
/**
 * @doc-prompt
 * is: programming
 * capabilities: ["code-generation", "analysis"]
 */
```

#### @doc-code-tool
Used in MCP tools with DocCodeToolPrompt pattern:
```typescript
/**
 * @doc-code-tool
 * name: "Tool Name"
 * version: "1.0.0"
 * capabilities: ["capability1", "capability2"]
 */
```

### Development Annotations

#### @doc-comment-developing
Base development annotation:
```typescript
/**
 * @doc-comment-developing
 * status: in-progress
 * author: team-member
 * notes: implementation details
 */
```

#### @doc-dryrun
For dry-run capabilities:
```typescript
/**
 * @doc-dryrun
 * enabled: true
 * simulate: true
 * rollback: true
 */
```

## Tool and Agent Patterns

### Tools (MCP Pattern)
MCP tools in `generic-tools/mcps-tools/` use:
- `DocCodeToolPrompt` class with @doc-code-tool annotation
- Tool class extending base Tool
- Example: Vercel, PostgreSQL, MySQL MCP tools

### Agents (Prompt Pattern)
Agents in `generic-agents/` use:
- **NO @doc-code-agent** - This annotation doesn't exist
- `Prompt` class with PromptParts for PTRR steps
- Registry-based prompt formatting
- All 20+ agents follow this pattern

## Plugin Architecture

### Plugin Registration

```typescript
// In package that owns the plugin
import { registerPlugin } from '@bitcode/doc-comment-generics';
import { docPromptPlugin } from './doc-prompt';

// Auto-register when module imported
registerPlugin(docPromptPlugin);
```

### Plugin Usage

```typescript
// Import plugins you read - they auto-register
import '@bitcode/prompts/doc-plugins';
import '@bitcode/doc-typescript';

// Use the doc-comment system
import { createParser } from '@bitcode/doc-comment-generics';
const parser = createParser();
```

## Philosophy vs Reality

### The Philosophy
- "Comments ARE prompts" - They contain executable intelligence
- "Build-time processing, zero runtime cost" - All processing at compile time
- "Self-documenting code" - Code carries its own intelligence

### The Reality
- Comments are parsed but not automatically injected
- Build integration exists but isn't configured
- Manual processes required for most features
- Foundation is solid but automation is incomplete

## Best Practices

### For Current System
1. Use doc-comments for documentation even without automation
2. Structure comments to be parser-ready for future
3. Follow annotation patterns consistently
4. Prepare for build-time integration

### When System Is Complete
1. Every significant element gets doc-comments
2. Use appropriate @doc-* annotations
3. Let build process handle injection
4. Access metadata at runtime as needed

## Migration Path

### Current State
```typescript
// Manual documentation
/**
 * This component does X
 */
export class Component {
 // Manual metadata if needed
 static metadata = { version: '1.0.0' };
}
```

### Future State
```typescript
/**
 * @doc-component
 * version: 1.0.0
 * capabilities: ["feature1", "feature2"]
 */
export class Component {
 // Metadata auto-injected at build time
 // Access via Component.prototype.__proto__.docComponent
}
```

## Key Takeaways

1. **Infrastructure exists** - Parser, plugins, transformer factory ready
2. **Build integration missing** - Not wired into TypeScript compilation
3. **Manual process works** - Can use the patterns without automation
4. **Foundation is solid** - When integrated, system will work as designed
5. **Philosophy guides development** - Even without automation, the patterns improve code quality

## Implementation Locations

- **Core Infrastructure**: `/packages/doc-comment-generics/` (`@bitcode/doc-comment-generics`)
- **Runtime Injection**: `/packages/generic-doc-comments/doc-code/`
- **Development Plugins**: `/packages/generic-doc-comments/doc-developing/`
- **File editing**: `/packages/file-editing/` (`@bitcode/file-editing`)
- **Co-located Plugins**: Within respective packages' `/src/doc-plugins/`
- **MCP Tool Examples**: `/packages/generic-tools/mcps-tools/*/`

---

*Last Updated: 2025-01-19*
*Status: Infrastructure complete, build integration pending*
