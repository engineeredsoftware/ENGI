# Prompt -Developing- Plugins

The actual `@doc-comment-developing-*` plugins for PromptPart and Prompt development metadata.

## Plugins

### @doc-comment-developing-promptpartdevelopment

For individual PromptPart semantic units:

```typescript
/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent|tool|pipeline|phase|formatting|validation|system
 * intent: "Clear description of what this PromptPart does"
 * generation: 1
 * quality_score: 95
 * variant: 0
 * benchmarks: {
 * semantic_clarity: 0.95,
 * token_efficiency: 0.98,
 * model_stability: 0.96
 * }
 */
export const PROMPTPART_GENERIC_YOUARE: PromptPart = 'You are' as PromptPart;
```

### @doc-comment-developing-promptdevelopment

For complete Prompt classes:

```typescript
/**
 * @doc-comment-developing-promptdevelopment
 * domain: tool|agent|pipeline|phase|system
 * intent: "System prompt for WebSearch tool"
 * generation: 1
 * quality_score: 88
 * variant: 0
 * dependencies: ["PROMPTPART_1", "PROMPTPART_2"]
 * benchmarks: {
 * semantic_clarity: 0.90,
 * token_efficiency: 0.85,
 * model_stability: 0.88,
 * task_success: 0.92,
 * response_quality: 0.87
 * }
 */
export class WebSearchToolPrompt extends Prompt { }
```

## Performance-Based Versioning (PBV)

Both plugins support PBV format: `generation.quality_score.variant`

- **generation**: Major version (1, 2, 3...)
- **quality_score**: Performance percentage (0-100)
- **variant**: Different implementations at same quality

Example: `1.95.0` = First generation, 95% quality, initial variant

## Usage

These plugins are auto-registered when imported:

```typescript
import '@bitcode/prompts/src/developing/doc-comment-developing';
```

## Key Features

- Integrated benchmarking for all prompts
- Version history tracking with improvements
- Dependency management for Prompts
- Automatic PBV version formatting
- Build-time metadata extraction

## Implementation

Located in: `/packages/prompts/src/developing/doc-comment-developing.ts`

Contains:
- `DocPromptPartPlugin` class
- `DocPromptPlugin` class
- Auto-registration with doc-comment system
- Full TypeScript types for metadata