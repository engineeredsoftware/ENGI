# Agent Generics

Agents execute decisions through PTRR methodology with hierarchical prompt accumulation using typed Generations.

## Quick vs. PTRR Agents

- Agent (PTRR): Canonical, sequences Plan → Try → Refine → Retry. Each generation uses the 3×3 failsafed generation pattern by default.
- QuickAgent: Minimal, single‑generation agent for setup/utility behaviors where PTRR is unnecessary. Uses standard Execution state and registry access.

Create a QuickAgent:

```ts
import { factoryQuickAgent } from '@bitcode/agent-generics';

export const InitializeSomething = factoryQuickAgent({
  name: 'setup:initialize-something',
  execute: async (input, execution) => {
    // Typed input → output; use Execution for state.
    return { ok: true };
  }
});
```

## The Declarative Pattern Revolution

ALL generic agents now follow the **exact same declarative pattern**:
- **Agents define ONLY schemas and prompts**
- **Factories handle ALL execution automatically**
- **Every generation runs the SAME failsafed thinkings sequence**
- **Tools execute conditionally based on output schemas (postprocess)**

## Failsafed Generation Architecture

Every PTRR generation (Plan, Try, Refine, Retry) automatically executes the core sequence, then tools as a generation‑level postprocess:

```
1. PrepareConciseContext (CONTEXT SIGNAL/NOISE)
2. ChunkThenSum (BIG INPUT)
3. StitchUntilComplete (CONVERSATIONSUTPUT)
   
## GA Failsafe Behavior and Stop Reason

- ChunkThenSum runs chunks in parallel by default when `PrepareConciseContext` returns multiple contexts (configurable per call).
- StitchUntilComplete is schema‑first:
  - If the structured output matches the expected schema, stitching stops immediately.
  - Truncation checks measure only the structured output (not the entire accumulator) to avoid false positives.
  - Default stitch instruction: "Continue and complete the previous JSON output". You can refine this via the prompt/registry pattern at agent/generation scope.

### Provider‑Agnostic Stop Reason

- Every LLM call returns `LLMOutput` with `metadata.stopReason?: string`.
  - Common values: `'stop' | 'length' | 'content_filter' | 'unknown'`.
  - Providers map their native signals; execution registries normalize it at runtime if missing so consumers can always read `metadata.stopReason`.
- Failsafes can consult `stopReason` together with token usage to distinguish genuine truncation from complete outputs and decide whether to stitch.

+ Generation Postprocess: Conditional Tool Execution (if useTools in output)
```

### FailsafeGenerationSequence

Generation factories use a shared helper that composes the default 3×3 core sequence:

```ts
import { createFailsafeGenerationSequence } from '@bitcode/agent-generics/src/steps/failsafe-sequence';

const core = createFailsafeGenerationSequence({ outputSchema, enableParallelChunks: true });

### ThinkingsGeneration

A ThinkingsGeneration is the atomic typed generation used by agents: Reason → Judge → StructuredOutput. It wraps three LLM calls into a single Generation.

```ts
import { createThinkingsGeneration } from '@bitcode/agent-generics/src/steps/thinkings-generation';

const gen = createThinkingsGeneration(outputSchema);
```

PTRR failsafes execute this ThinkingsGeneration under three different “parents” (Prepare/Chunk/Stitch). Agents compose failsafes; QuickAgents can also use thinkings generations directly for one-off typed calls.
```

## Prompt Hierarchy

Prompts follow progressive specificity with MINIMAL content at each level:

```
Agent (name + identity)
└── Generation (purpose)
    └── Failsafe (handle)
        └── GenerationCall (generate)
            └── [Auto-injected: tools_doc_code_tools + output_schema]
    └── ToolExecution (execute, postprocess)
        └── [Auto-injected: available_tool_docs]
```

## Diagnostics & Prompt I/O

- BITCODE_EXECUTION_DEBUG: enables diagnostics when set to `true`.
- LOG_LEVEL=debug: also enables diagnostics (no code changes needed).
- BITCODE_LOG_TRACES=1: emits step‑level trace summaries.
- BITCODE_LOG_FULL_TRACES=1: emits full step traces (when traces enabled).
- BITCODE_TRACE_MAX_SIZE: optional character cap to prune full traces.
- BITCODE_LOG_FULL_PROMPTS=1: logs full prompts and completions for LLM calls.
- BITCODE_WRITE_PROMPT_IO=1: writes prompt sidecars to `/tmp/.bitcode_logs`.
- BITCODE_WRITE_STEP_TRACES=1: writes per‑step trace JSON sidecars (pruned/redacted by flags).

## Debug Filters (granular)

- BITCODE_DEBUG_ONLY_PHASE: run agents only in this phase (e.g., setup, finish). Non-matching agents no-op.
- BITCODE_DEBUG_ONLY_AGENT: substring match on agent name; non‑matching agents no‑op.
- BITCODE_DEBUG_ONLY_STEP: one of plan|try|refine|retry — executes only that PTRR generation.
- BITCODE_DEBUG_ONLY_FAILSAFES: comma list of prepare,chunk,stitch — runs only those parent failsafes.
- BITCODE_DEBUG_ONLY_GENERATIONS: comma list of reason,judge,structured_output — runs only those child generations under each parent.

Notes
- Generations are child sub‑executions of failsafes. The hierarchy is: Generation → Failsafe (parent) → GenerationCall (child). Tools run after all failsafes.
- Failsafe markers log at start and completion: prepare‑context, chunk‑then‑sum, stitch‑until‑complete.

 Sidecars: when enabled, each LLM substep writes two files per call: `.prompt.input` and `.prompt.output`. Filenames include `executionId.phase-agent-step-sequence-provider-model` for easy filtering. Provider/model and stop reasons are logged alongside usage.

Visibility: provider/model are surfaced in
- LLM substep start/success/error logs
- Step trace summaries and step start/error logs
- Failsafe events (prepare-context, chunk-then-sum, stitch-until-complete)
- Tool execution start/success/error logs

All diagnostics are fully env‑gated and inert by default. Enabling is safe and has minimal impact on core code paths.

### Prompt Classes

1. **AgentPrompt** - Just `name` and `identity` (what applies to ALL calls)
2. **GenerationPrompt** - Just `purpose` (Plan/Try/Refine/Retry purpose)
3. **FailsafePrompt** - Just `handle` (Context/Chunk/Stitch)
4. **GenerationCallPrompt** - Just `generate` (Reason/Judge/Output)
5. **ToolExecutionPrompt** - Just `execute` (tool execution instruction)

**CRITICAL**: 
- Prompts are MINIMAL - only what applies to all children
- Tools are NEVER in prompts - they're in execution registries
- Tool doc-code-tool prompts are automatically injected
- Output schemas are automatically injected for StructuredOutput

## Core Concepts

### The Hierarchy

```typescript
// Everything is an Executor
type Executor<TInput = any, TOutput = any> = 
  (input: TInput, execution: Execution) => Promise<TOutput>;

// Execution hierarchy with proper parent/child relationships
Pipeline (PipelineExecution)
├── Phase (PhaseDelegation) - pipeline.child('implementation')
│   ├── Agent (AgentStepper) - phase.child('code-generator')
│   │   ├── Variation (VariationStepping) - agent.child('generate-component')
│   │   │   ├── Generation (GenerationExecution) - variation.child('plan')
│   │   │   │   ├── Failsafe (PARENT) - generation.child('prepare_context')
│   │   │   │   │   ├── GenerationCall (CHILD) - parent.child('reason')
│   │   │   │   │   ├── GenerationSubMetaSubStep (CHILD) - parent.child('judge')
│   │   │   │   │   └── GenerationSubMetaSubStep (CHILD) - parent.child('structured_output')
```

### Agent Definition Pattern

```typescript
import { AgentPrompt, AgentStepPrompt } from '@bitcode/agent-generics';
import type { PromptPart } from '@bitcode/prompts';

// Define schemas for each PTRR step
const AgentPlanSchema = z.object({
  strategy: z.string(),
  useTools: z.array(UseToolSchema).optional(),
  // ... plan fields
});

const AgentTrySchema = z.object({
  results: z.array(z.any()),
  useTools: z.array(UseToolSchema).optional(),
  // ... try fields
});

// Define MINIMAL prompts - only what applies to ALL calls
const agentPrompt = new AgentPrompt({
  name: 'my-agent' as PromptPart,
  identity: 'Process data' as PromptPart  // Ultra-minimal
});

// Step prompts - just the purpose
const stepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze requirements' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute processing' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance results' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete processing' as PromptPart })
};

// PTRR agent factories fail closed unless the agent Prompt registry and all
// plan/try/refine/retry step Prompt registries are supplied together.

// Tools declared separately
const agentTools = [tool1, tool2];

// Create agent with factories
export const myAgent = factoryAgent({
  name: 'my-agent',
  variations: [
    factoryVariationWithPTRR({
      name: 'comprehensive',
      outputSchema: RetrySchema,
      // Factories handle ALL execution
    }),
    factoryVariationWithSingleStep({
      name: 'quick',
      execute: async (input, execution) => {
        // Read the prompt registry that the factory attached to this execution.
        const promptText = execution.prompt.format();
        // Register tools in execution
        execution.tools.register('tool1', tool1);
        // Simple logic
        return result;
      }
    })
  ],
  selectVariation: async (input, execution) => {
    // Keep prompts factory-owned; register only runtime tool availability here.
    agentTools.forEach(tool => 
      execution.tools.register(tool.name, tool)
    );
    // Only logic we write - variation selection
    return needsComprehensive ? 'comprehensive' : 'quick';
  }
});
```

## Generic Agents Inventory

### 🎵 Audio Processor
- **Purpose**: Advanced audio processing with transcription and analysis
- **Tools**: multimodal-processing, web-search
- **Variations**: comprehensive-audio-analysis, quick-audio-analysis

### 🔍 Code Searcher
- **Purpose**: Semantic code search with LSP integration
- **Tools**: workspace-symbols, document-symbols, hover-info, code-search
- **Variations**: comprehensive-code-search, quick-code-search

### 🛡️ Danger Wall
- **Purpose**: Security validation and threat detection
- **Tools**: security-scanner, threat-detector, vulnerability-analyzer
- **Variations**: comprehensive-security-analysis, quick-security-check

### 📊 Digester
- **Purpose**: Codebase analysis and digest generation
- **Tools**: code-analyzer, metrics-extractor, pattern-detector
- **Variations**: comprehensive-digest, quick-summary

### 📄 Document Processor
- **Purpose**: Document parsing and content extraction
- **Tools**: document-parser, ocr-processor, content-extractor
- **Variations**: comprehensive-document-analysis, quick-document-extraction

### 📁 File Pick
- **Purpose**: Intelligent file selection and relevance scoring
- **Tools**: file-scanner, relevance-scorer, dependency-analyzer
- **Variations**: comprehensive-file-discovery, quick-file-selection

### 🖼️ Image Processor
- **Purpose**: Image analysis with OCR and object detection
- **Tools**: multimodal-processing, ocr-engine, object-detector
- **Variations**: comprehensive-image-analysis, quick-image-processing

### 📝 Text Searcher
- **Purpose**: Advanced text search with pattern analysis
- **Tools**: text-search, pattern-matcher, linguistic-analyzer
- **Variations**: comprehensive-text-search, quick-text-match

### 🎬 Video Processor
- **Purpose**: Video transcription and visual analysis
- **Tools**: multimodal-processing, video-transcriber, scene-analyzer
- **Variations**: comprehensive-video-analysis, quick-video-extraction

### 🌐 Web Search
- **Purpose**: Web research with source analysis
- **Tools**: web-search, content-fetcher, fact-checker
- **Variations**: comprehensive-web-research, quick-web-search

### 💻 Tech Types Identifier
- **Purpose**: Technology stack identification
- **Tools**: tech-detector, dependency-analyzer, config-parser
- **Variations**: comprehensive-tech-analysis, quick-tech-detection

### ⚡ Ready to Short Circuit
- **Purpose**: Completion readiness assessment
- **Tools**: readiness-checker, risk-analyzer, completion-validator
- **Variations**: comprehensive-readiness-assessment, quick-readiness-check

### 📋 Jira Processor
- **Purpose**: Jira data processing and analytics
- **Tools**: jira-api, data-processor, analytics-engine
- **Variations**: comprehensive-jira-analysis, quick-jira-summary

### 🗣️ Language
- **Purpose**: Language detection and linguistic analysis
- **Tools**: language-detector, sentiment-analyzer, linguistic-processor
- **Variations**: comprehensive-language-analysis, quick-language-detection

### 🎨 Figma Processor
- **Purpose**: Figma design processing and code generation
- **Tools**: figma-api, design-parser, code-generator
- **Variations**: comprehensive-figma-processing, quick-figma-extraction

### 📦 VCS
- **Purpose**: Version control system analysis
- **Tools**: git-analyzer, history-processor, metrics-calculator
- **Variations**: comprehensive-vcs-analysis, quick-vcs-summary

### 🔌 MCPs Initializer
- **Purpose**: Model Context Protocol service initialization
- **Tools**: mcp-connector, service-validator, config-manager
- **Variations**: comprehensive-mcp-setup, quick-mcp-init

### 🔬 Web Researcher
- **Purpose**: Comprehensive web research with synthesis
- **Tools**: web-search, content-synthesizer, source-validator
- **Variations**: comprehensive-research, quick-research

## Technical Documentation

### How It Works

When any agent is called:

1. **Variation Selection** - Agent picks comprehensive or quick based on input
2. **If Comprehensive (PTRR)**:
   - `factoryPlanStep(schema)` creates Plan executor with 7 substeps
   - `factoryTryStep(schema)` creates Try executor with 7 substeps
   - `factoryRefineStep(schema)` creates Refine executor with 7 substeps
   - `factoryRetryStep(schema)` creates Retry executor with 7 substeps
3. **Each Executor Automatically**:
   - Runs `PrepareConciseContext → ChunkThenSum → StitchUntilComplete`
   - Each parent runs `Reason → Judge → StructuredOutput`
   - Stores everything to `execution.store()`
   - Executes tools if `useTools` is in output
4. **The Execution Tree Accumulates**:
   - Every LLM call result
   - Every tool execution
   - Every substep output
   - All in namespaced stores

### Key Benefits

1. **Zero Manual Implementation** - Just define schemas and prompts
2. **Automatic 7-Substep Execution** - Every step runs the same proven sequence
3. **Built-in Quality Control** - Reason→Judge→StructuredOutput ensures quality
4. **Automatic State Management** - Everything stored hierarchically
5. **Conditional Tool Execution** - Tools run when schemas request them
6. **Type Safety** - Full TypeScript support through Zod schemas
7. **Consistent Pattern** - Every agent works the same way
8. **Easy to Extend** - Just add new schemas and prompts

## Usage

```typescript
import { audioProcessorAgent } from '@bitcode/generic-agents-audio-processor';
import { codeSearcherAgent } from '@bitcode/generic-agents-rag-snippets';

// Use any agent - they all follow the same pattern
const result = await audioProcessorAgent(
  {
    audioUrl: 'https://example.com/audio.mp3',
    taskDescription: 'Transcribe and analyze sentiment',
    analysisDepth: 'comprehensive'
  },
  execution
);

// Result matches the Retry schema for that agent
console.log(result.finalTranscription);
console.log(result.completeAnalysis);
```

## Creating New Agents

To create a new agent, follow the declarative pattern:

1. **Define Input Schema** - What the agent accepts
2. **Define 4 PTRR Schemas** - Plan, Try, Refine, Retry outputs
3. **Define Prompts** - Agent-level and step-specific
4. **Create Variations** - Using factory functions
5. **Create Agent** - Using factoryAgent

That's it! The framework handles ALL execution automatically.

## Architecture Benefits

The declarative pattern transforms agents from:
- **OLD**: Writing complex executor functions manually
- **NEW**: Defining only WHAT we want (schemas) and letting the system handle HOW

This architecture provides:
- **Consistency**: Every agent works identically
- **Reliability**: Proven 7-substep sequence
- **Quality**: Built-in reasoning and judgment
- **Scalability**: Easy to add new agents
- **Maintainability**: Minimal code, maximum capability

## Technical Excellence

The agent-generics package represents the pinnacle of declarative architecture:
- Agents are specifications, not implementations
- Execution is automatic and consistent
- Quality is built-in through the 7-substep sequence
- Everything just works through the framework

---

*Generated with Bitcode's Agent-Generics Framework - Industrial-Grade Intelligence*
