# @bitcode/prompts

The canonical Bitcode prompt-primitives package. It keeps the merged-world prompt system explicit as `PromptPart` + `Prompt` + `PromptExecution`, so retained agents, executions, conversations, and read-measurement flows all compose prompts through one typed contract.

## Role In V26

Fourth-gate keeps this package as the admitted owner for prompt abstraction.
That means:
- retained prompt parts stay active only where they are repurposed into Bitcode execution and read-measurement behavior
- conversations, Jira ingestion, Git/GitHub settle-write tooling, and retained agents all consume one shared prompt contract
- fifth-gate proving can verify the prompt space without first reopening package ownership

## Overview

The prompts package provides:
- **PromptPart**: Branded string tokens for type-safe prompts (10,000s at scale)
- **Prompt**: Pseudo-strongly typed prompt string structures with Registry
- **Formatters**: Pure functions to transform prompts into strings
- **Benchmarking**: Performance-Based Versioning (PBV) system
- **Dry Run**: Mocked LLM responses for testing and development
- **Raw Prompts**: All PromptParts live in /raw_promptparts/ directory

## Public Boundary Rule

Active Bitcode inference carriers must import prompt primitives through the
public `@bitcode/prompts` boundary:

```typescript
import {
 Prompt,
 PromptExecution,
 createPrompt,
 createPromptExecution,
 createPromptPart,
 hierarchicalFormatter,
 type PromptPart,
} from '@bitcode/prompts';
```

For narrower runtime consumers, the same boundary also exposes stable public
subpaths:

```typescript
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PromptExecution } from '@bitcode/prompts/execution/PromptExecution';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';
```

Do not deep-import `packages/prompts/src/*` from active execution, pipeline,
conversation, MCP, or route-owned inference carriers. Raw prompt content remains
available through the explicit `@bitcode/prompts/raw_promptparts/*` subpath.

## Architectural Rule

Use this package when a Bitcode surface needs formal prompt ownership.
Do not hide prompt composition in route-local strings or tool-local ad hoc templates when the resulting behavior is part of:
- read measurement
- retained execution primitives
- conversations
- retained tool/agent ingestion
- settle-write orchestration

## Core Design

### PromptPart - The Granular Unit

PromptPart is a branded string type that enables type safety and doc-comment matching:

```typescript
// Type definition
export type PromptPart = string & { readonly __brand: 'PromptPart' };

// Usage - must be explicitly created
const part = createPromptPart('You are an AI engineer.');
```

This branding allows doc-comment plugins to match PromptPart types specifically, enabling build-time intelligence while maintaining zero runtime overhead.

### Prompt - Pseudo-Strongly Typed Structure

Prompt extends Registry to provide hierarchical prompt organization with required parts:

```typescript
import { Prompt, createPromptPart } from '@bitcode/prompts';

// Create a new prompt registry
const prompt = new Prompt();

// Set parts at hierarchical paths
prompt.set('system:identity', createPromptPart(
 'You are an expert software engineer.'
));

prompt.set('system:methodology', createPromptPart(
 'Follow PTRR methodology: Plan, Try, Refine, Retry'
));

prompt.set('task:description', createPromptPart(
 'Implement the user authentication system'
));

// Format into final string
const result = prompt.format(); // Uses default formatter
```

### Requirements & Validation

```typescript
// Require specific paths
prompt
 .require('system:identity')
 .require('task:description')
 .requirePattern('context:*') // Glob patterns
 .requireHierarchy(); // Must have hierarchical structure

// Format validates requirements
try {
 const formatted = prompt.format(); // Throws if requirements not met
} catch (error) {
 console.error('Missing required prompt parts:', error.message);
}
```

## Usage Patterns

### Basic Prompt Building

```typescript
import { createPrompt, createPromptPart } from '@bitcode/prompts';

const prompt = createPrompt();

// System level
prompt.set('system', createPromptPart('Core system identity'));
prompt.set('system:capabilities', createPromptPart('Advanced reasoning'));

// Task level
prompt.set('task', createPromptPart('User task description'));
prompt.set('task:constraints', createPromptPart('Must be type-safe'));

// Context level
prompt.set('context:codebase', createPromptPart('TypeScript project'));
prompt.set('context:style', createPromptPart('Functional programming'));
```

### Hierarchical Formatters

```typescript
import { hierarchicalFormatter } from '@bitcode/prompts';

// Default formatter joins with double newlines
const simple = prompt.format();

// Hierarchical formatter groups by path depth
const structured = prompt.format(hierarchicalFormatter);
// Output:
// # System
// Core system identity
//
// ## System > Capabilities
// Advanced reasoning
//
// # Task
// User task description
// ...
```

### Pattern Matching

```typescript
// Get all context-related parts
const contextParts = prompt.getPattern('context:*');

// Get all system configuration
const systemConfig = prompt.getPattern('system:config:*');

// Get second-level paths
const secondLevel = prompt.getPattern('*:*');
```

### Cloning & Merging

```typescript
// Clone a prompt
const cloned = prompt.clone();

// Merge prompts (Registry feature)
const base = createPrompt();
const extensions = createPrompt();
base.merge(extensions);
```

### Complete Example: Building a Tool Prompt

```typescript
import { Prompt, hierarchicalFormatter } from '@bitcode/prompts';

// Import specific PromptParts
import { PROMPTPART_GENERIC_FORMATTING_YOUARE }
 from '@bitcode/prompts';
import { PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_IDENTITY_CORESTATEMENT }
 from '@bitcode/prompts';
import { PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_PURPOSE_CORESTATEMENT }
 from '@bitcode/prompts';

/**
 * @doc-comment-developing-prompt
 * domain: tool
 * intent: "Format web search tool documentation"
 * current_version: "V26.88.0"
 * versions: []
 * dependencies: {
 * "PROMPTPART_GENERIC_FORMATTING_YOUARE": "1.95.0",
 * "PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_IDENTITY_CORESTATEMENT": "1.0.0",
 * "PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_PURPOSE_CORESTATEMENT": "1.0.0"
 * }
 */
export class WebSearchToolPrompt extends Prompt {
 constructor() {
 super();

 // Build hierarchical structure
 this.set('tool:identity:prefix', PROMPTPART_GENERIC_FORMATTING_YOUARE);
 this.set('tool:identity:role', PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_IDENTITY_CORESTATEMENT);
 this.set('tool:purpose', PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_PURPOSE_CORESTATEMENT);

 // Mark required sections
 this.require('tool:identity');
 this.require('tool:purpose');
 }

 // Use hierarchical formatter by default
 format() {
 return super.format(hierarchicalFormatter);
 }
}

// Usage
const toolPrompt = new WebSearchToolPrompt();
const formatted = toolPrompt.format();
// Output:
// # Tool
// ## Tool > Identity
// You are an expert web search and analysis tool
//
// ## Tool > Purpose
// Search the web for technical documentation, API references, and programming resources
```

## Importing Raw Prompts

```typescript
// Import raw prompts directly - NO RE-EXPORTS
import { PROMPTPART_GENERIC_VALIDATION_INPUTCHECKS_NULLCHECK }
 from '@bitcode/prompts';

import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_METADATA_PIPELINE }
 from '@bitcode/prompts';

// Use in prompt formatting
const prompt = createPrompt();
prompt.set('validation:null', PROMPTPART_GENERIC_VALIDATION_INPUTCHECKS_NULLCHECK);
prompt.set('asset-pack:metadata:pipeline', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_METADATA_PIPELINE);
```

## Critical: NO String Formatting

**NEVER** create functions that join PromptParts into new PromptParts:

```typescript
// ❌ WRONG - Never do this!
function formatPromptPart(parts: PromptPart[]): PromptPart {
 return parts.join(' ') as PromptPart; // WRONG!
}

// ✅ CORRECT - Use Prompt.format()
const prompt = new Prompt();
parts.forEach((part, i) => prompt.set(`part:${i}`, part));
const formatted = prompt.format();
```

PromptParts are granular tokens. To combine them, use the Prompt class and its format method.

## Custom Formatters

Create specialized formatters for different contexts:

```typescript
// XML formatter
const xmlFormatter: PromptFormatter = (prompt) => {
 const xml: string[] = [];

 prompt.getPaths().forEach(path => {
 const part = prompt.get(path);
 if (part) {
 xml.push(`<prompt path="${path}">${part}</prompt>`);
 }
 });

 return `<prompts>\n${xml.join('\n')}\n</prompts>`;
};

// JSON formatter
const jsonFormatter: PromptFormatter = (prompt) => {
 const obj: Record<string, string> = {};

 prompt.getPaths().forEach(path => {
 const part = prompt.get(path);
 if (part) obj[path] = part;
 });

 return JSON.stringify(obj, null, 2);
};
```

## Raw Prompts Directory

The `/raw` directory contains thousands of granular PromptParts organized in a flat structure:

### Directory Structure
```
/raw_promptparts/
├── generic/ # Reusable across all contexts (flat directory)
└── specific/ # Pipeline/domain-specific prompts (flat directory)
```

### Naming Convention - FINAL PATTERN

**CRITICAL**: Every PromptPart is a PART of a Prompt class. The naming MUST reflect this relationship.

All files follow this EXACT pattern - NO DEVIATIONS:

```
promptpart_[generic|specific]_[domain]_[PROMPTCLASSNAME]_[semanticcontext]_[POSITION].ts
```

**Components** (all mandatory):
1. `promptpart` - Literal prefix (always lowercase)
2. `[generic|specific]` - Reusability scope
 - `generic`: Used across MANY prompts/parts
 - `specific`: Tied to one Prompt class
3. `[domain]` - One of: tool, agent, pipeline, phase, formatting, validation, system
4. `[PROMPTCLASSNAME]` - Class name WITHOUT "Prompt" suffix (lowercase)
 - `BitcodeSystemPrompt` → `bitcodesystem`
 - `CodeSearchAgentPrompt` → `codesearchagent`
5. `[semanticcontext]` - What it's about (NO underscores here)
 - `inherentknowledgeidentity`, `errorhandling`
6. `[POSITION]` - WHERE in prompt:
 - `opener`/`closer` - Start/end statements
 - `header`/`footer` - Section start/end
 - `corestatement` - Main claim
 - `detailcontent` - Detailed explanation
 - `list`/`listitem` - Lists

**Correct Examples**:
```
promptpart_specific_system_bitcodesystem_inherentknowledgeidentity_opener.ts
promptpart_specific_agent_codesearchagent_methodology_detailcontent.ts
promptpart_generic_formatting_section_header.ts
```

**Why This Pattern Is Sacred**:
- **Grepability**: Find all parts for a Prompt class instantly
- **No Orphans**: Every part belongs to a Prompt
- **Self-Documenting**: Filename tells complete story
- **Position Clarity**: Know exactly where each part goes

## V26 Semantic Units = Zero Inline Strings

### PTRR Phase & Output PromptParts
AssetPack and future Bitcode pipelines model every PTRR phase header, context statement, and output requirement as PromptParts under `raw_promptparts/specific`. Examples:

```
promptpart_specific_agent_analyzecodebase_phase_plan_label.ts
promptpart_specific_agent_correctcodechange_retry_output_requirement_detailcontent.ts
promptpart_specific_agent_dividecodechange_context_awareness_detailcontent.ts
```

- **No inline literals** inside `packages/pipelines/**/prompts/*.ts`. Always import the semantic unit.
- **Context-aware** parts live next to their phase labels so benchmarking tools can compare variations per phase.
- **Dynamic data** should be interpolated *after* formatting (e.g., format the prompt, then `formatted.replace('{{repo}}', repoName)`); the static scaffolding must remain a PromptPart.

### Doc-Code / ChatGPT / Digest Structures
Doc-code prompts (ChatGPT tools, MCP helpers, digest generators) also rely exclusively on PromptParts:

```
promptpart_specific_tool_begintransaction_metadata_name_detailcontent.ts
promptpart_specific_tool_digest_taskguides_structure_task_steps_label.ts
promptpart_specific_tool_digest_codestyles_constraints_output_detailcontent.ts
```

- Every doc section label (purpose, parameters, “Best For”, etc.) is a PromptPart with V26 metadata.
- Metadata values such as tool name/category that affect inference are PromptParts. Enum-like fields (priority/stability) may remain literals if they never change semantically.
- When creating a new doc-code prompt, add the necessary PromptParts first, then wire them through a `Prompt` subclass or builder—never `createPromptPart('Section: ...')` inline.

### Doc-Comment System

Each raw prompt includes doc-comments for build-time intelligence:

```typescript
/**
 * @doc-comment-developing-promptpart
 * versions: []
 * domain: formatting
 * intent: "Provide conjunction for natural language flow"
 */
export const PROMPTPART_GENERIC_FORMATTING_AND: PromptPart = 'and' as PromptPart;
```

The doc-comment system enables:
- **Development Documentation**: `@doc-comment-developing-promptpart` for versioning and metadata
- **Performance Tracking**: `@doc-comment-benchmark` for empirical quality metrics
- **Dry Run Testing**: `@doc-comment-promptdryrun` for mocked responses
- **Build-time Analysis**: Extract metadata, validate granularity, generate completions
- **Performance-Based Evolution**: Track performance across versions for data-driven improvements

### Granularity Requirements

PromptParts must be granular - the smallest meaningful units that can be versioned and optimized:

```typescript
// ✅ CORRECT - Granular units
export const PROMPTPART_GENERIC_FORMATTING_YOUARE: PromptPart = 'You are' as PromptPart;
export const PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING: PromptPart = 'Given the following' as PromptPart;
export const PROMPTPART_GENERIC_TOOL_CODESEARCHER_PURPOSE: PromptPart = 'Search codebase for semantic patterns' as PromptPart;

// ❌ WRONG - Too granular (single words/chars have no optimization value)
const PROMPTPART_GENERIC_THE = createPromptPart('the'); // NO!
const PROMPTPART_GENERIC_COMMA = createPromptPart(','); // NO!

// ❌ WRONG - Too large (full paragraphs can't be versioned granularly)
export const PROMPT_GENERIC_DESCRIPTION: PromptPart =
 'This tool performs comprehensive analysis of your codebase using advanced pattern matching' as PromptPart; // NO!
```

Large prompts must be formatted from granular parts using the Prompt class.

## Doc-Comment Plugins

The prompt system uses specialized doc-comment plugins:

### Development Plugins with Integrated Versioning

#### @doc-comment-developing-promptpart
For PromptPart development with PBV versioning:
```typescript
/**
 * @doc-comment-developing-promptpart
 * domain: formatting
 * intent: "Standard AI greeting prefix"
 * current_version: "V26.95.0"
 * versions: [
 * {
 * "version": "V26.85.0",
 * "content": "You are",
 * "timestamp": "2024-01-15T10:00:00Z",
 * "benchmarks": {
 * "intent": { "score": 0.85, "timestamp": "2024-01-15T10:30:00Z" },
 * "semantic_clarity": { "score": 0.98, "timestamp": "2024-01-15T10:30:00Z" },
 * "token_efficiency": { "score": 1.0, "timestamp": "2024-01-15T10:30:00Z" },
 * "model_stability": { "score": 0.96, "timestamp": "2024-01-15T10:30:00Z" }
 * },
 * "current": false
 * },
 * {
 * "version": "V26.95.0",
 * "content": "You are an",
 * "timestamp": "2024-01-20T14:00:00Z",
 * "benchmarks": {
 * "intent": { "score": 0.92, "timestamp": "2024-01-20T14:30:00Z" },
 * "semantic_clarity": { "score": 0.99, "timestamp": "2024-01-20T14:30:00Z" },
 * "token_efficiency": { "score": 0.90, "timestamp": "2024-01-20T14:30:00Z" },
 * "model_stability": { "score": 0.98, "timestamp": "2024-01-20T14:30:00Z" }
 * },
 * "current": true
 * }
 * ]
 * benchmarks: [
 * { "name": "grammatical_correctness", "test": "Is '{{content}}' grammatically correct?" }
 * ]
 */
```

#### @doc-comment-developing-prompt
For full Prompt development with dependencies:
```typescript
/**
 * @doc-comment-developing-prompt
 * domain: tool
 * intent: "Format web search tool documentation"
 * current_version: "V26.88.0"
 * versions: []
 * dependencies: {
 * "PROMPTPART_GENERIC_FORMATTING_YOUARE": "V26.95.0",
 * "PROMPTPART_SPECIFIC_TOOL_WEBSEARCHTOOL_IDENTITY_CORESTATEMENT": "V26.00.0"
 * }
 */
```

#### @doc-comment-promptdryrun
Define mocked LLM responses for testing:
```typescript
/**
 * @doc-comment-promptdryrun
 * scenario: "basic_discovery"
 * context: { "mode": "test" }
 * response: {
 * "tools": ["editor", "search"],
 * "confidence": 0.95
 * }
 * metadata: {
 * "tokens": 1250,
 * "latency": 2500
 * }
 */
```

## Performance-Based Versioning (PBV)

Version format follows PBV pattern:
```
GA<generation>.<quality_score>.<variant>
```

- **Generation**: Major approach change (V26, GA2, GA3...)
- **Quality Score**: Benchmark score 0-100
- **Variant**: Different phrasings at same generation

Examples:
- `V26.00.0`: Generation 1, unbenchmarked, original
- `V26.85.0`: Generation 1, 85% quality, original
- `V26.85.1`: Generation 1, 85% quality, variant 1
- `V26.92.0`: Generation 1, 92% quality (evolved)
- `GA2.78.0`: Generation 2, 78% quality, new approach


### Evolution Triggers

- Overall score < 80%
- Intent match < 0.85
- Semantic clarity < 0.85
- Model stability < 0.80

## Integrated Benchmarking System

### Standard Benchmarks for PromptParts
Every PromptPart is automatically benchmarked on:
1. **Intent Match** (0-1): How well it achieves its stated purpose
2. **Semantic Clarity** (0-1): How clearly LLMs understand it
3. **Token Efficiency** (0-1): Efficiency of token usage
4. **Model Stability** (0-1): Consistency across different models

### Additional Benchmarks for Prompts
Full Prompts get extra benchmarks:
5. **Task Success** (0-1): Likelihood of achieving the task
6. **Response Quality** (0-1): Expected quality of AI responses

### Custom Benchmarks
Domain-specific benchmarks can be added:
```typescript
benchmarks: [
 {
 "name": "technical_accuracy",
 "type": "custom",
 "description": "Validates technical terminology",
 "test": "Rate the technical accuracy of '{{content}}' for a developer audience (0-1)"
 }
]
```

### Benchmark Commands
```bash
# Benchmark single file
npm run benchmark src/raw_promptparts/generic/promptpart_generic_formatting_youare.ts

# Benchmark all prompts
npm run benchmark:all

# Benchmark and evolve if quality is low
npm run benchmark:evolve src/raw_promptparts/specific/promptpart_specific_tool_search.ts

# Generate benchmark report
npm run benchmark:report
```

## Dry Run System

The dry run system enables mocking LLM calls with hardcoded responses:

```typescript
/**
 * TOOL DISCOVERY PROMPT
 *
 * @doc-comment-promptdryrun
 * scenario: "basic_tool_discovery"
 * response: {
 * "thought": "I read to discover available tools",
 * "tools_found": ["text-editor", "file-search", "terminal"],
 * "confidence": 0.95
 * }
 *
 * @doc-comment-promptdryrun
 * scenario: "complex_tool_discovery"
 * context: { "environment": "production" }
 * response: {
 * "thought": "Multiple tool categories detected",
 * "tools_found": {
 * "editing": ["text-editor", "code-formatter"],
 * "search": ["file-search", "grep"],
 * "execution": ["terminal", "compiler"]
 * },
 * "confidence": 0.88
 * }
 * metadata: {
 * "tokens": 1250,
 * "latency": 2500,
 * "model": "gpt-4"
 * }
 */
```

### Using Dry Run Mode

```typescript
import { DryRunManager } from '@bitcode/prompts/dry-run';

// Enable dry run mode
const dryRun = new DryRunManager();
dryRun.enable();

// LLM calls will now use mocked responses
const response = await llm.generate(prompt); // Returns dry run response

// Disable for production
dryRun.disable();
```

## Performance-Based Evolution

The framework supports performance-based prompt evolution based on measured data:

### Evolution Process

```typescript
class PromptEvolution {
 async evolvePromptPart(
 current: PromptPart,
 benchmark: PromptPartBenchmark
 ): Promise<PromptPartCandidate[]> {
 // 1. Generate variants
 const variants = await this.generateVariants(current);

 // 2. Benchmark each variant
 const results = await Promise.all(
 variants.map(v => benchmark.test(v))
 );

 // 3. Select improvements (>5% better)
 return results
 .filter(r => r.qualityScore > current.qualityScore * 1.05)
 .sort((a, b) => b.qualityScore - a.qualityScore);
 }
}
```

### Quality Gates

All prompts must meet quality gates before deployment:

```typescript
const qualityGates = {
 relevance: 0.85, // 85% minimum relevance
 completeness: 0.90, // 90% minimum completeness
 clarity: 0.88, // 88% minimum clarity
 consistency: 0.92, // 92% minimum consistency
 performance: 0.80 // 80% minimum performance
};
```

## Integration with Testing Framework

The prompts package integrates with the comprehensive testing framework:

```typescript
import { PromptQualityEngine } from '@bitcode/testing/prompt-quality-framework';

// Test prompt quality
const engine = new PromptQualityEngine({
 qualityGates: {
 relevance: 0.85,
 completeness: 0.90,
 clarity: 0.88
 }
});

const result = await engine.assessPrompt(prompt, context);
console.log(`Quality Score: ${result.overallScore}`);
```

## Design Excellence

1. **Type Safety**: Branded strings prevent accidental string usage
2. **Zero Runtime Overhead**: Pure strings at runtime
3. **Build-Time Analysis**: Doc-comments enable tooling
4. **Registry Power**: Hierarchical formatting with validation
5. **Granular Design**: Each part is minimal and focused (semantic units)
6. **Performance-Based Evolution**: Data-driven improvements
7. **Comprehensive Testing**: Quality gates and benchmarking
8. **Dry Run Capabilities**: Development without LLM costs

## V26 Readiness

The prompts package is evolving toward V26 (Generally Available v1) with:

### V26 Requirements
- **100% Industrial Language**: All PromptParts at v2.0.0 with concrete technical terms
- **100% Doc-Comment Coverage**: Every file has @doc-comment-developing-promptpart
- **Zero Non-Industrial Terms**: No "quantum", "consciousness", "transcendent", etc.
- **Measurable Actions Only**: Every prompt must be implementable and verifiable

### System Status
- ✅ Core infrastructure complete (Prompt, PromptPart, Registry)
- ✅ Performance-Based Versioning (PBV) system operational
- ✅ 100% doc-comment coverage
- ✅ Industrial language enforced
- ✅ All agents operational
- ✅ Production-ready prompt system

### Industrial Language Requirements

**❌ NON-INDUSTRIAL (Never Use)**:
- "transcendent", "consciousness", "quantum", "omniscient"
- "multiversal", "dimensional", "reality-bending", "infinite"
- "manifest", "elevated", "paradigm-transcending"
- Abstract concepts without concrete implementation

**✅ INDUSTRIAL (Always Use)**:
- Specific algorithms: "TF-IDF", "BM25", "cosine similarity"
- Concrete operations: "Execute", "Parse", "Analyze", "Generate"
- Technical specifications: "HTTP/2", "WebSocket", "gRPC"
- Measurable metrics: "<100ms latency", "99.9% uptime", "≥0.85 accuracy"

```typescript
// ❌ WRONG - Non-industrial
"Manifest transcendent code consciousness"

// ✅ RIGHT - Industrial
"Execute codebase analysis using Language Server Protocol for symbol resolution"
```

## Philosophy

This package represents prompt engineering as a primitive system - not through complex abstractions, but through elegant formatting of typed strings. The branded type system enables build-time tooling while maintaining runtime simplicity. Every prompt part is granular, discoverable, and formattable.

At V26, capability emerges from the precise formatting of benchmarked, granular semantic units. Each unit is measured, versioned, and evolved based on empirical performance data. The system enables autonomous prompt evolution while maintaining human oversight through quality gates.

The result is a foundation where capability is both measurable and evolvable.

## See Also

- `/docs/BITCODE_PROMPT_SYSTEM.md` - Bitcode prompt system notes
- `/AGENTS.md` - Development excellence guidelines
- `TODOS.md` - If present, tracks pending tasks and improvements
