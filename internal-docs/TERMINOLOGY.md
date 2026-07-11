# Bitcode Terminology Guide

*"Documentation should be a mirror of the source code, not an interpretation."*

This guide provides the precise terminology used in the Bitcode codebase, verified against actual implementation.

## Core Execution Patterns

### PTRR Pattern (Current Implementation)

**Source**: `/packages/agent-generics/src/types.ts`

The codebase uses `AgentVariationStep` enum:
```typescript
export enum AgentVariationStep {
  PLAN = 'plan',      // Failsafe: understand and strategize
  TRY = 'try',        // Generation: initial attempt
  REFINE = 'refine',  // Generation: improve results
  RETRY = 'retry'     // Failsafe: guaranteed completion
}
```

### Sub-Step Architecture

**CRITICAL**: There are **EXACTLY 7 substeps per step** according to `PTRRSubStepArchitecture` interface.

#### Failsafe Meta Sub-Steps (3)
**Source**: `/packages/agent-generics/src/types.ts`
```typescript
export enum FailsafeMetaSubStep {
  PREPARE_CONCISE_CONTEXT = 'prepare_concise_context',  // CONTEXT SIGNAL/NOISE handling
  CHUNK_THEN_SUM = 'chunk_then_sum',                    // BIG INPUT handling  
  STITCH_UNTIL_COMPLETE = 'stitch_until_complete'       // CONVERSATIONSUTPUT handling
}
```

#### Generation Sub Meta Sub-Steps (3)
```typescript
export enum GenerationSubMetaSubStep {
  REASON = 'reason',                    // Apply reasoning and logic
  JUDGE = 'judge',                      // Judge quality of reasoning
  STRUCTURED_OUTPUT = 'structured_output' // Format into typed output
}
```

#### Tool Execution (1)
- `tools_execution` - Direct tool invocation

**Total**: 3 + 3 + 1 = 7 substeps per PTRR step

## Prompt System

### PromptPart
**Source**: `/packages/prompts/src/parts/PromptPart.ts`
- Branded string type: `string & { readonly __brand: 'PromptPart' }`
- Created via `createPromptPart(content: string): PromptPart`
- Zero runtime overhead

### Prompt Class
**Source**: `/packages/prompts/src/prompt.ts`
- Registry-based formatting system
- Hierarchical path organization
- Validates required parts

### Naming Conventions

#### File Naming Pattern (DOCUMENTED but NOT ENFORCED)
Documentation claims this pattern:
```
promptpart_[generic|specific]_[domain]_[PROMPTCLASSNAME]_[semanticcontext]_[POSITION].ts
```

**REALITY**: Multiple patterns exist in `/packages/prompts/src/raw_promptparts_promptparts/`:
- `prompt_generic_*.ts` (e.g., `prompt_generic_and.ts`)
- `engi_system_prompt_*.ts` (e.g., `engi_system_prompt_core_identity.ts`)
- Simple names (e.g., `assumption_validation.ts`)
- `patch_*.ts` files (52+ patch files)

## Doc-Comment System

### Current Implementation Status

**✅ Implemented**:
- Doc-comment parser exists (`/packages/doc-comment/`)
- Plugin system with base classes
- TypeScript transformer factory created
- Individual plugins (doc-prompt, doc-promptpart, etc.)

**❌ NOT Implemented**:
- Transformer not integrated in build process
- Automatic prototype injection not active
- Runtime access functions don't exist
- Build-time processing is aspirational

### Available Annotations

#### @doc-promptpart
Version tracking for PromptParts (plugin exists)

#### @doc-code-tool
Used in MCP tools with `DocCodeToolPrompt` class pattern

#### @doc-prompt
Core prompt intelligence (plugin exists)

## Tool Architecture

### Tool Class Pattern
**Source**: `@bitcode/tools-generics`
- Abstract base class with `.use = primitiveFunction` pattern
- MCP tools have `DocCodeToolPrompt` class with @doc-code-tool
- No more cast patterns from 'ai' package
- ToolUse (plans) → UsedTool (results)

## Agent Architecture

### Agent Interface
**Source**: `/packages/agent-generics/src/types.ts`
```typescript
export interface Agent<TInput = any, TOutput = any> extends Executor<TInput, TOutput>
```

### Agent Prompts
- **NO @doc-code-agent** - This annotation doesn't exist
- Agents use `Prompt` class with PromptParts
- All agents use `new Prompt()` pattern for PTRR steps

## Package Structure

### Execution Packages
- `/packages/execution-generics/` - Base Execution and Executor types
- `/packages/agent-generics/` - Agent implementation with PTRR
- `/packages/tools-generics/` - Tool abstraction

### Prompt Packages
- `/packages/prompts/` - PromptPart and Prompt implementations
- `/packages/doc-comment/` - Doc-comment infrastructure (no implementations)
- `/packages/doc-code/` - Runtime injection system

## Frontend and product surface terms (V48)

Layout contract: `internal-docs/BITCODE_SOURCE_LAYOUT.md`.

### Experiences (7)

Marketing, Packs, Reads, Deposits, Docs, Conversations, Auxillaries — each with
matching component prefixes (`Marketing*`, `Packs*`, …) under
`uapi/components/<experience>/`.

### Component layers

- `Shadcn*` — root primitives (`uapi/components/shadcn/`).
- `Bitcode*` — shared base over Shadcn (`uapi/components/bitcode/`).
- Experience prefixes — page-specific composition over Bitcode.

### Component unit

Non-trivial UI lives in `ComponentName/ComponentName.tsx` (not `index.tsx`) with
optional co-located `hooks/`, `styles/`, `__tests__/`.

### Pipeline vs Execution vs Terminal

| Term | Meaning |
| --- | --- |
| **Pipeline** | Product run surface: synthesis/read runs, master-detail tables, stream/log, selection (`BitcodePipeline*`). |
| **Execution** (agent packages) | Low-level PTRR/agent executor primitives in packages such as `execution-generics`. Not the product UI name. |
| **Journal / transaction** | BTD ledger journal rows and reconciliation vocabulary (`JournalEntry`, journal transaction kinds). |
| **Terminal** | **Deleted**. No `/terminal` route or `app/terminal` tree. Do not reintroduce. |

### ❌ NEVER Use These Terms:
- "FAILSAFE GROUP" or "GENERATION GROUP" - Use the actual enum names
- "PTRRStep" - It's `AgentVariationStep`
- "FailsafeSubStep" - It's `FailsafeMetaSubStep`
- "GenerationSubStep" - It's `GenerationSubMetaSubStep`
- "@doc-code-agent" - This doesn't exist
- "Former patterns" - Just document current state
- New product UI named "Terminal" or product-facing "Executions page" for pipeline runs

### ✅ ALWAYS Use These Terms:
- `AgentVariationStep` for PTRR steps
- `FailsafeMetaSubStep` for failsafe operations
- `GenerationSubMetaSubStep` for generation operations
- Exact class/type/enum names from source
- File paths when referencing code
- **Pipeline** for product run surfaces; **journal** for BTD ledger rows

## Mathematical Foundation

The documentation describes this unification theorem, though it's more philosophical than implemented:

```
THEOREM: Finite(Type) ∪ Infinite(Prompt) = Unified(Program)
```

This represents the aspiration that TypeScript types can carry prompt intelligence through doc-comments, though the build-time transformation is not currently active.

## Key Takeaway

Always verify documentation against source code. The Bitcode codebase has evolved rapidly, and documentation often describes aspirational states rather than current implementation. When in doubt:

1. `grep` for the actual usage
2. Check the exports in package index files
3. Look at real implementations, not just interfaces
4. Verify enum values match documentation claims

---

*Last Updated: 2026-07-11*
*Version: Aligned to V48 frontend component + Terminal eradication workstream*
