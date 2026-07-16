# Agent Generics - TLDR

**Agents execute decisions through PTRR methodology with DECLARATIVE PATTERN.**

## The Declarative Revolution

ALL agents now follow the SAME pattern:
- **Define schemas** - WHAT each step produces
- **Define prompts** - WHO the agent is, HOW it thinks
- **Factories handle everything** - Automatic Failsafe×Thinkings execution
- **Zero manual implementation** - Framework does ALL the work

## The Architecture Truth

Each PTRR step runs EXACTLY the same sequence:
1. **3 FailsafeGenerations** (parents) run sequentially
2. **Each parent runs 3 ThinkingsGenerations** (children)
3. **Tools execute AFTER all failsafes complete**

## The Hierarchy

```
Pipeline → Phase → Agent[Variation] → Step → FailsafeGeneration → ThinkingsGeneration
```

Each level creates child executions with accumulated prompts:
```typescript
type Executor<TInput, TOutput> = (input: TInput, execution: Execution) => Promise<TOutput>;
```

## PTRR: The Four Steps

Every agent variation follows PTRR:
1. **Plan** - Understand task and approach
2. **Try** - Execute with tools
3. **Refine** - Improve results  
4. **Retry** - Handle failures

## The Failsafe×Thinkings Architecture

Each PTRR step runs IDENTICALLY:

**3 FailsafeGenerations (PARENTS)**:
- **PrepareConciseContext** - Handles CONTEXT SIGNAL/NOISE
- **ChunkThenSum** - Handles BIG INPUT (parallel chunks by default when chunked)
- **StitchUntilComplete** - Handles CONVERSATIONSUTPUT

**3 ThinkingsGenerations (CHILDREN per parent)**:
- **Reason** - Apply logic, select tools (first thinking)
- **Judge** - Judge reasoning AND tool selections (second thinking)
- **StructuredOutput** - Format to schema with useTools array (no thinking)

**1 Tool Execution (AFTER all failsafes)**:
- **ToolsExecution** - Conditional on output.useTools

## GA Failsafe Behavior and Stop Reason

- ChunkThenSum: if `PrepareConciseContext` returns multiple contexts, chunks run in parallel by default (configurable).
- StitchUntilComplete (output):
  - Schema‑first: if the structured output matches the expected schema, stitching stops immediately.
  - Truncation checks measure only the structured output (not the entire accumulator) to avoid false positives.
  - Default stitch instruction: "Continue and complete the previous JSON output" (refineable via registry/prompt pattern per agent/step).

### Provider‑Agnostic Stop Reason

- Every LLM call returns `LLMOutput` with `metadata.stopReason?: string`.
  - Common values: `'stop' | 'length' | 'content_filter' | 'unknown'`.
  - Providers map native signals; execution registries normalize it at runtime if missing so consumers can always read `metadata.stopReason`.
- Failsafes use `stopReason` plus token usage to distinguish genuine truncation from complete outputs and decide whether to stitch.

## Debug Flags (for full visibility)

Set these env vars for maximum introspection during runs:

- `BITCODE_LOG_TO_FILE=1` - Per-request and per-run log files for AssetPack and execution routes.
- `BITCODE_LOG_FULL_PROMPTS=1` – Log full input prompts and full completions for each LLM call.
- `BITCODE_LOG_FULL_PROMPTS_CORRELATION_IDS=<id1,id2>` – Restrict full logs to specific correlationIds (optional).
- `BITCODE_DEBUG_REGISTRIES=1` – Emit registry debug (LLM/tool/agent lookup with execution paths).

These are pre‑enabled in `.env.local` for local development.

## Debug Filters (targeted execution)

- BITCODE_DEBUG_ONLY_PHASE: string — execute agents only when `execution.findUp('phase','current')` equals this.
- BITCODE_DEBUG_ONLY_AGENT: substring — execute only agents whose name includes this.
- BITCODE_DEBUG_ONLY_STEP: plan|try|refine|retry — execute only that PTRR step.
- BITCODE_DEBUG_ONLY_FAILSAFES: comma list of prepare,chunk,stitch — include only those parent failsafes.
- BITCODE_DEBUG_ONLY_GENERATIONS: comma list of reason,judge,structured_output — include only those Thinkings generations under each parent.

Markers
- Failsafe events log `[failsafe] prepare-context|chunk-then-sum|stitch-until-complete` with start/complete payloads.

## The Declarative Pattern

```typescript
// 1. Define schemas
const PlanSchema = z.object({
  strategy: z.string(),
  useTools: z.array(UseToolSchema).optional()
});

// 2. Define MINIMAL prompts using Prompt classes
const agentPrompt = new AgentPrompt({
  name: 'my-agent' as PromptPart,
  identity: 'Process data' as PromptPart  // Ultra-minimal
});

const stepPrompts = {
  plan: new AgentStepPrompt({ purpose: 'Analyze requirements' as PromptPart }),
  try: new AgentStepPrompt({ purpose: 'Execute processing' as PromptPart }),
  refine: new AgentStepPrompt({ purpose: 'Enhance results' as PromptPart }),
  retry: new AgentStepPrompt({ purpose: 'Complete processing' as PromptPart })
};

// PTRR factories require the agent Prompt registry and every step Prompt
// registry; missing prompt carriers fail before execution starts.

// 3. Create with factories - NO manual implementation
export const myAgent = factoryAgent({
  name: 'my-agent',
  variations: [
    factoryVariationWithPTRR({
      outputSchema: RetrySchema
      // Factories handle ALL execution
    })
  ],
  selectVariation: async (input, execution) => {
    // Prompts are attached by the factory; register only runtime tool availability.
    execution.tools.register('tool1', tool1);
    return 'comprehensive';
  }
});
```

## Tool Flow

Tools move through three states:
1. **Usable** - Available from registry
2. **Use** - Selected by Reason, validated by Judge, in output.useTools
3. **Used** - Executed AFTER all failsafes complete

## Prompt Accumulation

Each LLM call accumulates prompts UP the execution tree:
```
Pipeline prompt
└── Phase prompt
    └── Agent prompt
        └── Step prompt (Plan/Try/Refine/Retry)
            └── FailsafeGeneration prompt
                └── ThinkingsGeneration prompt
```

Result: 1000s of contextualized LLM calls from combinatorial explosion.

## Output Schema Pattern

Step output schemas MUST include useTools for tool execution:
```typescript
const StepOutputSchema = z.object({
  result: z.string(),
  confidence: z.number(),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()  // REQUIRED for tool execution
});
```

## All Generic Agents

18 production-ready agents, ALL using declarative pattern:
- **audio-processor** - Audio transcription and analysis
- **code-searcher** - LSP-powered semantic search
- **danger-wall** - Security validation
- **digester** - Codebase analysis
- **document-processor** - Document extraction
- **file-pick** - Intelligent file selection
- **image-processor** - Computer vision analysis
- **text-searcher** - Pattern-based search
- **video-processor** - Video analysis
- **web-search** - Web research
- **tech-types-identifier** - Stack detection
- **ready-to-short-circuit** - Readiness assessment
- **jira-processor** - Jira analytics
- **language** - Linguistic analysis
- **figma-processor** - Design to code
- **vcs** - Version control analysis
- **mcps-initializer** - MCP setup
- **web-researcher** - Research synthesis

## Why This Architecture

1. **Declarative > Imperative** - Define WHAT, not HOW
2. **Three universal concerns** - Context/Input/Output handled by failsafes
3. **Atomic intelligence unit** - Reason→Judge→StructuredOutput
4. **Hierarchical prompt context** - Each execution inherits parent context
5. **Tool validation** - Tools selected by reasoning, validated by judgment
6. **Scalable robustness** - Same pattern at every level

## Critical Implementation Notes

1. **Judge runs SECOND** - After Reason, before StructuredOutput
2. **Tools run LAST** - After ALL failsafes complete
3. **ChunkThenSum runs PARALLEL** - Chunks process simultaneously
4. **Prompts ACCUMULATE** - Walk up execution tree
5. **useTools in OUTPUT** - Not in reasoning subdocument
6. **NO MANUAL EXECUTORS** - Factories handle everything

## The Mental Model

Think of agents as **declarations**:
1. **Schemas declare** - What each step produces
2. **Prompts declare** - How the agent thinks
3. **Factories execute** - The Failsafe×Thinkings sequence automatically
4. **Framework handles** - All complexity, state, and tool execution

This creates reliable, validated, tool-augmented decision-making at scale with MINIMAL code and MAXIMUM capability.

---

*The declarative pattern is now reality - every agent just works.*
