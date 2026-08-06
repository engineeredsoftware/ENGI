# Raw Prompts Directory Structure

## Critical Architecture Rules

1. **FLAT STRUCTURE ONLY**: The `/raw_promptparts/generic/` and `/raw_promptparts/specific/` directories must remain completely flat - NO subdirectories
2. **PROPER GRANULARITY**: PromptParts must be meaningful semantic units that can be versioned and optimized
3. **SCALE TO 10,000s**: This architecture is designed to scale to tens of thousands of files
4. **INDUSTRIAL LANGUAGE**: All PromptParts MUST use concrete technical terms
5. **100% DOC-COMMENT COVERAGE**: Every file MUST have @doc-comment-developing-promptpartdevelopment
6. **PBV FORMAT**: All versions use GA<generation>.<quality_score>.<variant> format

## Granularity Guidelines

### What is Properly Granular?

PromptParts should be the smallest meaningful units that can be versioned and optimized:

- **Short semantic units**: `You are`, `Given the following`, `Based on`
- **Field values**: Complete purpose statements, capability descriptions
- **Common phrases**: `Execute the following`, `Analyze and determine`
- **Reusable patterns**: List templates, transition phrases

### What is NOT a PromptPart?

- **Single words**: `and`, `the`, `with` - NO optimization value
- **Single punctuation**: `,`, `.`, `:` - Cannot be versioned
- **Single whitespace**: space, newline - Too granular

### Examples of Proper Granularity

```typescript
// ✅ CORRECT - Meaningful semantic unit
export const PROMPTPART_GENERIC_FORMATTING_YOUARE: PromptPart = 'You are' as PromptPart;

// ✅ CORRECT - Complete field value
export const PROMPTPART_SPECIFIC_TOOL_CODESEARCHER_PURPOSE: PromptPart =
 'Search codebase using semantic pattern matching' as PromptPart;

// ✅ CORRECT - Reusable transition
export const PROMPTPART_GENERIC_FORMATTING_BASEDONTHIS: PromptPart =
 'Based on this analysis,' as PromptPart;

// ❌ WRONG - Single word, no optimization value
export const PROMPTPART_GENERIC_AND: PromptPart = 'and' as PromptPart;

// ❌ WRONG - Too large, should be broken down
export const PROMPT_GENERIC_FULL_PARAGRAPH: PromptPart =
 'This comprehensive tool performs advanced analysis...'; // NO!
```

## V26 Industrial Language Requirements

**FORBIDDEN TERMS** (instant V26 failure):
- ❌ quantum, consciousness, transcendent, multiversal, infinite
- ❌ manifest, dimensional, reality-synthesis, elevated, mystical
- ❌ Any abstract metaphysical concepts

**REQUIRED PATTERNS**:
- ✅ Concrete technical actions: "Execute", "Parse", "Analyze", "Transform"
- ✅ Specific tools/APIs: "LSP analysis", "FFmpeg processing", "Git operations"
- ✅ Measurable outcomes: "Extract symbols", "Generate AST", "Validate schema"
- ✅ Performance metrics: "<100ms latency", "99.9% uptime", "≥0.85 accuracy"
- ✅ Algorithm specifications: "TF-IDF scoring", "BM25 ranking", "AST traversal"

## Naming Convention - FINAL PATTERN

**CRITICAL**: Every PromptPart is a PART of a Prompt class. The naming MUST reflect WHERE it goes.

All files follow this EXACT pattern:
```
promptpart_[generic|specific]_[domain]_[PROMPTCLASSNAME]_[semanticcontext]_[POSITION].ts
```

**Mandatory Components**:
1. `promptpart` - Literal prefix (always lowercase)
2. `[generic|specific]` - Reusability scope
 - `generic`: Used across MANY prompts/parts
 - `specific`: Tied to one Prompt class
3. `[domain]` - One of: tool, agent, pipeline, phase, formatting, validation, system
4. `[PROMPTCLASSNAME]` - Class name WITHOUT "Prompt" suffix (lowercase)
 - `BitcodeSystemPrompt` → `bitcodesystem`
 - `WebSearchToolPrompt` → `websearchtool`
5. `[semanticcontext]` - What content is about (NO underscores)
 - `inherentknowledgeidentity` NOT `inherentknowledge_identity`
6. `[POSITION]` - WHERE in prompt:
 - `opener`/`closer` - Opening/closing statements
 - `header`/`footer` - Section headers/footers
 - `corestatement` - Main statement
 - `detailcontent` - Detailed content
 - `list`/`listitem` - Lists and items

**Examples**:
- `promptpart_specific_system_bitcodesystem_inherentknowledgeidentity_opener.ts`
- `promptpart_specific_agent_codesearchagent_methodology_detailcontent.ts`
- `promptpart_generic_formatting_section_header.ts`
- `promptpart_specific_tool_websearchtool_purpose_corestatement.ts`

This pattern ensures:
- Every PromptPart belongs to a Prompt class (no orphans)
- The POSITION tells exactly where it goes in the prompt
- Grep can find all parts for any Prompt instantly

## Directory Contents

### `/raw_promptparts/generic/`
Contains universally reusable granular parts:
- Formatting patterns (list templates, transitions)
- Common instructions and directives
- Validation patterns
- Reusable semantic phrases
- Generic field templates

### `/raw_promptparts/specific/`
Contains domain-specific granular parts:
- Tool-specific purpose statements
- Agent mission descriptions
- Pipeline phase instructions
- Domain-specific field values
- Specialized semantic units

## Formatting Happens Elsewhere

These granular PromptParts are formatted into larger structures using:
- `Prompt` class (Registry-based formatting)
- Formatting lives with usage (e.g., in pipeline packages)

## Why This Level of Granularity?

1. **Meaningful Versioning**: Each part can be independently optimized
2. **Performance Tracking**: Measure effectiveness of semantic units
3. **Build-time Intelligence**: Doc-comment plugins analyze meaningful chunks
4. **Benchmarking**: Compare variations of purpose statements, instructions
5. **Dynamic Formatting**: Build any prompt from granular parts
6. **Maintainability**: Update specific parts without affecting others

## Doc-Comment Requirements

Every PromptPart must include:
```typescript
/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: tool
 * intent: "Define tool purpose for code searching"
 * current_version: "V26.00.0" // Start unbenchmarked at V26.00.0
 * versions: [] // Empty for new PromptParts
 * benchmarks: [
 * { "name": "technical_accuracy", "test": "Uses specific algorithms?", "score": 0.94 },
 * { "name": "implementation_ready", "test": "Can developers implement?", "score": 0.92 }
 * ]
 */
export const PROMPTPART_SPECIFIC_TOOL_CODESEARCHER_PURPOSE: PromptPart =
 'Search codebase using AST parsing and LSP symbol resolution' as PromptPart;
```

**Required Fields**:
- `domain`: One of the allowed domains
- `intent`: Clear technical description
- `current_version`: PBV format (e.g., V26.94.0)
- `versions`: History array (empty initially)
- `benchmarks`: Quality metrics for industrial standards

## Quality Standards

1. Each file exports exactly ONE PromptPart
2. Names must precisely match the file name pattern
3. Content must be a meaningful semantic unit
4. Doc-comments must specify domain, intent, and PBV version
5. No re-exports or barrel files in /raw_promptparts/
6. ONLY industrial language - zero metaphysical terms
7. Benchmark scores must exceed 0.85 for production
8. Full old version content must be preserved in version history
