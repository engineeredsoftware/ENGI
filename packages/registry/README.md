# Registry

Hierarchical key-value store with priority-based resolution.

## What This Package Does

Registry enables you to:
- **Build configurations at runtime** instead of hardcoding inheritance hierarchies
- **Filter capabilities by context** - agents only see tools they should use
- **Build prompts progressively** - from general identity to specific expertise
- **Override with clear precedence** - higher priority numbers always win

## Core Concept

Registry is a hierarchical key-value store where:
- **Paths** create namespaces: `pipeline:asset-pack:phase:implementation`
- **Priorities** determine winners when same path has multiple values
- **Cascading** combines values from multiple paths into final configuration

## Core API

```typescript
interface Registry<T extends object> {
 // Set with priority (higher wins)
 set(path: string, value: T, priority?: number, metadata?: Record<string, any>): this;

 // Get single path or cascade multiple
 get(path: string): T | undefined;
 get(paths: string[], merger?: (base: T, override: T) => T): T | undefined;

 // Query operations
 getAll(path: string): RegistryEntry<T>[];
 has(path: string): boolean;
 getPaths(): string[];

 // Mutations
 clear(path?: string): this;
 merge(other: Registry<T>): this;
}
```

## How Bitcode Uses Registry

### 1. Tool Access Control
Agents only see tools appropriate for their context:

```typescript
// Phase registers all available tools
phase.tools.set('code-search', codeSearchTool);
phase.tools.set('file-edit', fileEditTool);
phase.tools.set('terminal', terminalTool);
phase.tools.set('git', gitTool);

// Specific agent only gets safe subset
codeAgent.tools.set('code-search', codeSearchTool);
codeAgent.tools.set('file-edit', fileEditTool);
// No terminal or git - prevents dangerous operations

// Runtime enforcement
const tool = codeAgent.tools.getTool('terminal', codeAgent); // undefined
const allowed = codeAgent.tools.getUsableTools(codeAgent); // Only registered tools
```

### 2. Progressive Prompt Building
Prompts accumulate context as they flow down the hierarchy:

```typescript
// Prompt extends Registry<PromptPart>
const prompt = new Prompt();

// Base identity
prompt.set('system:identity', 'You are an AI assistant' as PromptPart);

// Add methodology
prompt.set('system:methodology', 'Follow PTRR pattern: Plan, Try, Refine, Retry' as PromptPart);

// Add specialization
prompt.set('agent:expertise', 'Expert in TypeScript and React' as PromptPart);
prompt.set('agent:context', 'Building a dark mode feature' as PromptPart);

// Format into complete prompt
const systemPrompt = prompt.format(hierarchicalFormatter);
// Result: Organized sections with all context
```

### 3. Context-Aware LLM Configuration
```typescript
// Global defaults
registry.set('default', {
 model: 'claude-3-sonnet',
 temperature: 0.7,
 maxTokens: 4096
});

// Pipeline overrides
registry.set('pipeline:asset-pack', {
 model: 'claude-3-opus', // Higher tier model
 temperature: 0.5 // More focused
});

// Agent specialization
registry.set('agent:code-generator', {
 temperature: 0.2, // Very precise for code
 stopSequences: ['```'] // Stop at code blocks
});

// Cascade to get final config
const config = registry.get([
 'default',
 'pipeline:asset-pack',
 'agent:code-generator'
]);
// Result: { model: 'claude-3-opus', temperature: 0.2, maxTokens: 4096, stopSequences: ['```'] }
```

## Path Utilities

All utilities prefixed with `RegistryPath` for clarity:

```typescript
// Path manipulation
splitRegistryPath('a:b:c'); // ['a', 'b', 'c']
joinRegistryPath('a', 'b', 'c'); // 'a:b:c'
getParentRegistryPath('a:b:c'); // 'a:b'
getParentRegistryPaths('a:b:c'); // ['a', 'a:b']
isParentRegistryPath('a:b', 'a:b:c'); // true

// Path builder for complex hierarchies
const path = RegistryPathBuilder
 .from('pipeline', 'asset-pack')
 .add('phase').add('implementation')
 .add('agent').add('code-generator')
 .build();
// 'pipeline:asset-pack:phase:implementation:agent:code-generator'
```

## Priority Resolution

Higher priority numbers always win:

```typescript
registry
 .set('config', { temp: 0.7 }, 0) // Base: priority 0
 .set('config', { temp: 0.5 }, 10) // Override: priority 10
 .set('config', { temp: 0.2 }, 20); // Final: priority 20

registry.get('config'); // { temp: 0.2 } - highest priority wins
```

## Custom Merge Logic

Control how values combine during cascading:

```typescript
interface ToolSet {
 tools: string[];
 disabled?: string[];
}

// Merger that combines arrays intelligently
const toolMerger = (base: ToolSet, override: ToolSet): ToolSet => ({
 tools: [...new Set([...base.tools, ...override.tools])],
 disabled: override.disabled || base.disabled
});

registry
 .set('phase', { tools: ['search', 'analyze'] })
 .set('agent', { tools: ['search', 'deep-search'], disabled: ['analyze'] });

const tools = registry.get(['phase', 'agent'], toolMerger);
// { tools: ['search', 'analyze', 'deep-search'], disabled: ['analyze'] }
```

## Metadata Tracking

Attach metadata to any registry entry:

```typescript
registry.set('config', value, priority, {
 source: 'environment',
 timestamp: Date.now(),
 version: '2.0',
 author: 'system'
});

const entries = registry.getAll('config');
entries.forEach(entry => {
 console.log(`Value from ${entry.metadata?.source} at priority ${entry.priority}`);
});
```

## How Other Packages Extend Registry

Registry provides the base pattern that other packages build on:

```typescript
// ExecutionPrompt - Adds validation and formatting
class ExecutionPrompt extends Prompt {
 require('generic_system'); // Required paths
 require('specific_execution'); // Must be set

 setGenericSystem(path: string, prompt: PromptPart): this {
 return this.set(`generic_system:${path}`, prompt);
 }
}

// ExecutionToolRegistry - Adds hierarchical lookup
class ExecutionToolRegistry extends RegistryImpl<ExecutionTool> {
 getTool(key: string, execution: Execution): ExecutionTool | undefined {
 // Search up execution hierarchy
 let tool = this.get(key);
 if (!tool && execution.parent) {
 tool = execution.parent.tools.getTool(key, execution.parent);
 }
 return tool?.bindExecution(execution);
 }
}

// ExecutionLLMRegistry - Adds execution tracking
class ExecutionLLMRegistry extends RegistryImpl<LLMConfig> {
 getDefaultLLM(execution: Execution): LLM {
 const config = this.get('default');
 return wrapWithExecutionTracking(createLLM(config), execution);
 }
}
```

For Bitcode prompt implementations, this Registry pattern is the practical
inheritance model. `Prompt` is a `RegistryImpl<PromptPart>`, so generic prompt
layers and specific prompt implementations compose through registry paths,
priorities, and merges rather than through hidden class hierarchies.

- `raw_promptparts/generic` and `PROMPTPART_GENERIC_*` are base reusable
 PromptPart layers.
- `raw_promptparts/specific` and `PROMPTPART_SPECIFIC_*` are concrete
 implementations of PromptPart types for Bitcode tools, agents, phases,
 pipelines, products, proof corridors, and compatibility overlays.
- Closure evidence for a prompt-bearing Bitcode corridor must identify both
 layers and the registry carrier that composes them.

## Design Principles

1. **Pure Primitive** - No domain knowledge, just hierarchical storage
2. **Generic Constraint** - `T extends object` ensures type safety
3. **Protected Internals** - `entries` Map is protected for extension
4. **Method Chaining** - All mutations return `this`
5. **Predictable Resolution** - Higher priority always wins
6. **Zero Dependencies** - Pure TypeScript implementation

## How Registry Replaces Inheritance

Traditional inheritance:
```typescript
class BaseConfig { temperature = 0.7; }
class PipelineConfig extends BaseConfig { model = 'claude'; }
class AgentConfig extends PipelineConfig { temperature = 0.2; }
```

Registry approach:
```typescript
registry
 .set('base', { temperature: 0.7 })
 .set('pipeline', { model: 'claude' })
 .set('agent', { temperature: 0.2 });

const config = registry.get(['base', 'pipeline', 'agent']);
```

Benefits:
- **Dynamic** - Change hierarchy at runtime
- **Flexible** - Multiple inheritance through paths
- **Explicit** - See exactly what overrides what
- **Composable** - Mix and match configurations

## Performance Characteristics

- **set()**: O(n log n) where n = entries at path (due to sort)
- **get()**: O(1) for single path, O(m*n) for cascade (m paths, n entries)
- **Memory**: O(p*e) where p = paths, e = entries per path
- **merge()**: O(p*e) where p = paths in other registry

## When to Use Registry

### Perfect For:
- **Dynamic configuration** that changes based on runtime context
- **Capability management** where different contexts read different tools/features
- **Progressive enhancement** building complex configs from simple parts
- **Multi-source configuration** combining environment, user, and system settings

### Use Plain Objects When:
- Configuration is static and never changes
- No hierarchy or inheritance needed
- Simple key-value pairs suffice
- No priority resolution required

## Key Design Decisions

1. **Colon separators** (`:`) create clear visual hierarchy in paths
2. **Higher priority wins** makes override behavior predictable
3. **Protected entries Map** allows extensions like Prompt to add behavior
4. **Generic constraint** `T extends object` ensures type safety
5. **Method chaining** enables fluent configuration building
