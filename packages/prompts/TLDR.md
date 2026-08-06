# Prompts - TLDR

**Two primitives: PromptPart (semantic units) and Prompt (Registry-based formatter).**

## The Two Layers

1. **PromptPart** - Branded strings representing semantic units
2. **Prompt** - Registry that formats PromptParts into strings

That's the entire abstraction. No "tokens", no product-specific composition layer - only semantic units.

## PromptPart: Semantic Units

```typescript
// Meaningful phrases that can be versioned
export const PROMPTPART_GENERIC_FORMATTING_YOUARE: PromptPart = 'You are' as PromptPart;
export const PROMPTPART_GENERIC_FORMATTING_BASEDONTHIS: PromptPart = 'Based on this analysis,' as PromptPart;
```

**NOT single words**: "and", "the"  
**NOT punctuation**: ",", "."  
**NOT paragraphs**: Full sentences lose granular optimization

## Prompt: Registry-Based Formatting

```typescript
const prompt = new Prompt();
prompt.set('system:identity', PROMPTPART_GENERIC_FORMATTING_YOUARE);
prompt.set('system:role', PROMPTPART_SPECIFIC_AGENT_ANALYZER_IDENTITY);
prompt.require('system:identity');

const formatted = prompt.format(); // Validates and formats
```

## The /raw_promptparts/ Directory

10,000+ PromptParts at V26 scale:
```
/raw_promptparts/
├── generic/     # Reusable across contexts (flat)
└── specific/    # Domain-specific (flat)
```

Naming: `promptpart_[generic|specific]_[domain]_[promptclass]_[semantic]_[position].ts`

## Doc-Comment Intelligence

Every PromptPart has metadata:
```typescript
/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Define agent identity for code analysis"
 * current_version: "V26.92.0"
 */
```

## Performance-Based Versioning (PBV)

Format: `GA<generation>.<quality>.<variant>`
- V26.92.0 = Generation 1, 92% quality, original
- Quality from benchmarks: intent match, clarity, efficiency, stability

## Key Rules

1. **NEVER string concatenation** - Use Prompt.format() only
2. **NEVER re-export PromptParts** - Import directly from /raw_promptparts/
3. **Industrial language only** - Concrete operations, no metaphysics
4. **Semantic unit granularity** - Meaningful phrases, not tokens

## Integration Points

- **execution-generics**: ExecutionPrompt extends Prompt
- **pipelines-generics**: ExecutionPipelinePrompt for hierarchy
- **agent-generics**: AgentPrompt for PTRR context
- **tools-generics**: ToolPrompt for capabilities

## Why This Design

- **Type safety** through branding prevents string accidents
- **Build-time intelligence** via doc-comments
- **Zero runtime cost** - just strings after compilation
- **Registry pattern** enables validation and hierarchical formatting
- **Semantic units** enable meaningful versioning and optimization

The system achieves industrial-strength prompt engineering through precise formatting of versioned semantic units.
