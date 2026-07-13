# LLM Generics

Pure LLM primitives with zero framework awareness: the foundation for AI integration in Bitcode.

## Why LLM Generics?

LLMs in Bitcode are simple async functions: `(input) => Promise<output>`. This radical simplicity enables:

- **Zero Coupling**: LLMs know nothing about execution, pipelines, or agents
- **Provider Agnostic**: Swap between OpenAI, Anthropic, Google, or custom
- **Cascading Config**: Configuration inherits through hierarchical registries
- **Type Safety**: Full TypeScript typing for inputs and outputs

## Core Concept

```typescript
// The fundamental primitive
export type LLM = (input: LLMInput) => Promise<LLMOutput>;
```

That's it. Everything else is configuration and organization.

## Usage

```typescript
import { LLMRegistry, factoryLLMRegistry } from '@bitcode/llm-generics';

// Create registry
const registry = factoryLLMRegistry();

// Register a provider
registry.registerProvider({
 name: 'openai',
 createLLM: (config) => async (input) => {
 // Call OpenAI API with config
 return {
 content: 'response',
 usage: {
 inputTokens: 10,
 outputTokens: 20,
 totalTokens: 30
 }
 };
 }
});

// Configure at different levels
registry.configure('pipeline:asset-pack', { model: 'gpt-4', temperature: 0.7 });
registry.configure('pipeline:asset-pack:phase:implementation', { temperature: 0.2 });

// Get LLM with cascading config
const llm = registry.getLLM([
 'pipeline:asset-pack',
 'pipeline:asset-pack:phase:implementation'
]);

// Use it
const output = await llm({
 messages: [
 { role: 'system', content: 'You are a helpful assistant.' },
 { role: 'user', content: 'Write a function to add two numbers' }
 ]
});
```

## API

### Core Types

```typescript
export interface LLMInput {
 messages: LLMMessage[];
 temperature?: number;
 maxTokens?: number;
 // ... other config
}

export interface LLMMessage {
 role: 'system' | 'user' | 'assistant' | 'function';
 content: string;
 name?: string;
 functionCall?: {
 name: string;
 arguments: string;
 };
}

export interface LLMOutputMetadata {
 /**
 * Provider-agnostic stop reason reported by the model.
 * Common values: 'stop', 'length', 'content_filter', 'unknown'.
 */
 stopReason?: string;
 [key: string]: any;
}

export interface LLMOutput {
 content: string;
 usage?: LLMUsage;
 metadata?: LLMOutputMetadata;
 functionCall?: {
 name: string;
 arguments: string;
 };
}

export interface LLMUsage {
 inputTokens: number;
 outputTokens: number;
 totalTokens: number;
}
```

### Core Components

```typescript
// LLM Provider interface
export interface LLMProvider {
 name: string;
 createLLM(config: LLMConfig): LLM;
 validateConfig?(config: LLMConfig): boolean;
 getDefaultConfig?(): Partial<LLMConfig>;
}

// LLM Registry using Registry pattern
export class LLMRegistry {
 // Register a provider
 registerProvider(provider: LLMProvider): void;

 // Configure at any path with priority
 configure(path: string, config: Partial<LLMConfig>, priority?: number): void;

 // Get LLM with cascading config lookup
 getLLM(hierarchy: string[], provider?: string): LLM;

 // Get sequence-specific LLM
 getSequenceLLM(
 pipeline: string,
 phase: string,
 agent: string,
 sequence: string,
 provider?: string
 ): LLM;
}
```

## Hierarchical Configuration

LLM configurations cascade through the Registry pattern:

```typescript
// Configure at different hierarchy levels
registry.configure('*', {
 model: 'gpt-3.5-turbo',
 temperature: 0.7
}, 0); // Global default, priority 0

registry.configure('pipeline:asset-pack', {
 model: 'gpt-4' // Higher tier model for AssetPack synthesis
}, 10);

registry.configure('pipeline:asset-pack:phase:implementation:agent:coder', {
 temperature: 0.2, // Precise for code generation
 maxTokens: 8192 // More tokens for code
}, 20);
```

When requesting an LLM, the registry searches from most specific to least specific:

```typescript
// Looks for LLM at:
// 1. ['pipeline', 'asset-pack', 'phase', 'implementation', 'agent', 'coder']
// 2. ['pipeline', 'asset-pack', 'phase', 'implementation', 'agent']
// 3. ['pipeline', 'asset-pack', 'phase', 'implementation']
// 4. ['pipeline', 'asset-pack', 'phase']
// 5. ['pipeline', 'asset-pack']
// 6. ['pipeline']
// 7. []
const llm = registry.getLLM(
 ['pipeline', 'asset-pack', 'phase', 'implementation', 'agent', 'coder']
);
```

## Provider Pattern

Different providers can be registered at each level:

```typescript
// Use Anthropic for safety-critical agents
registry.register(
 ['pipeline', 'safety', 'agent', 'validator'],
 'anthropic',
 anthropicLLM,
 100 // High priority
);

// Use local model for development
registry.register(
 ['pipeline', 'development'],
 'local',
 localLLM,
 50
);

// Get with specific provider
const anthropic = registry.getLLM(hierarchy, 'anthropic');

// Get with default provider
const llm = registry.getLLM(hierarchy); // Uses default provider
```

## Integration with Execution

**IMPORTANT**: This package provides PRIMITIVES. The actual integration with execution-generics happens in ExecutionLLMRegistry, not here.

```typescript
// In execution context (NOT in this package)
const llmRegistry = execution.llms; // ExecutionLLMRegistry
const llm = llmRegistry.getDefaultLLM(execution);

const output = await llm({
 messages: [
 { role: 'system', content: execution.prompt.format() },
 { role: 'user', content: userPrompt }
 ]
});
```

This package only provides the pure LLM primitives that ExecutionLLMRegistry uses.

## Design Excellence

1. **Pure Functions**: LLMs are just `(input) => Promise<output>`
2. **Zero Dependencies**: Only depends on registry for organization
3. **Provider Agnostic**: Same interface for all LLM providers
4. **Hierarchical Config**: Natural cascading through execution tree
5. **Type Safe**: Full typing for safety and intellisense

## Philosophy

This package embodies radical simplicity: LLMs are just async functions. No framework coupling, no execution awareness, no pipeline knowledge. Just:

```typescript
type LLM = (input: LLMInput) => Promise<LLMOutput>;
```

By maintaining this purity:
- **Testing**: Swap in mock LLMs trivially
- **Providers**: Change providers without touching code
- **Configuration**: Cascade through Registry pattern
- **Integration**: Other packages compose these primitives

The intelligence isn't in the LLM primitive - it's in how execution-generics, agent-generics, and pipelines-generics orchestrate these simple functions into intelligent systems.
