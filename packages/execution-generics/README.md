# Execution Generics

**Execution** state primitive (namespaced store + tree + registry). Sequence
combinators and process-root helpers are re-exported here; prefer the
leaf packages for new code:

```
@bitcode/execution-generics Execution (this package)
@bitcode/executor-generics Executor type
@bitcode/generic-executors sequential, parallel, pipe, retry, …
@bitcode/generic-executions process-root Execution
```

There is no separate Context state model — process defaults are a process-root
Execution.

## Role In V26

`/executions` stays `executions`.
It does not rename away into `activity`.

Instead:
- `executions` are the low-level primitives and pipeline-run carriers
- `activity` is the broader family that can include transactions, executions, and notifications
- Bitcode read measurement and implementation flows build on these execution primitives instead of bypassing them

Two primitives for AI systems: **state** and **sequence**.

## The Two Primitives

**State = Execution**
A container that holds discoveries, tools, LLMs, and creates child containers.

**Sequence = Executors**
Async functions that take input + execution, do work, return output.

```typescript
// State container
const execution = new Execution('my-pipeline');

// Sequence function
const executor: Executor = async (input, execution) => {
 execution.store('discoveries', 'pattern', 'dark mode CSS variables');
 return processedOutput;
};
```

That's it. Everything else - agents, pipelines, phases, run histories, and read-measurement passes - builds from these two primitives.

## Core Concepts

### Identity & Registry

- Identity and streaming live under `execution/*`:
 - `execution/id` (unique execution id)
 - `execution/correlationId` (trace id)
 - `execution/dataStream` ({ writeData, close? })
- Namespaces are execution store sub‑maps (not TS namespaces). Always use constants from the typed registry rather than string literals.
- See: `@bitcode/execution-generics/src/store/registry.ts` for canonical namespaces (`EXECUTION_NAMESPACES`) and typed helpers.

### The Execution Tree
Every AI operation in Bitcode creates a tree of executions that accumulate state:

```
asset-pack-execution
├── discovery-phase
│ ├── web-search-agent
│ │ ├── plan (what to search for)
│ │ ├── try (search results)
│ │ ├── retry (search results)
│ │ └── refine (synthesized findings)
│ └── code-analysis-agent
│ ├── plan (analysis strategy)
│ └── try (patterns found)
│ └── retry
│ └── refine (patterns found)
└── implementation-phase
 └── code-generator-agent
 └── can access all discoveries above
```

### State = Execution

Execution is a state container with:
- **Namespaced storage**: `store()` and `get()`
- **Parent-child hierarchy**: `child()` and `findUp()`
- **Three registries**: prompts, tools, llms

```typescript
// State flows down the tree
const pipeline = new Execution('pipeline');
pipeline.store('context', 'read', 'add dark mode');

const phase = pipeline.child('discovery');
phase.store('strategy', 'search_terms', ['dark mode', 'theme toggle']);

// Children can find parent state
const agent = phase.child('search-agent');
const read = agent.findUp('context', 'read'); // 'add dark mode'
```

### Sequence = Executors

Executors are async functions that work with state:

```typescript
type Executor<TInput, TOutput> = (input: TInput, execution: Execution) => Promise<TOutput>;

// Executors sequence operations
const searchExecutor: Executor = async (task, execution) => {
 // Read state
 const strategy = execution.get('strategy', 'search_terms');

 // Use tools from registry
 const tool = execution.tools.getTool('web-search', execution);
 const results = await tool.execute(strategy);

 // Write state
 execution.store('results', 'web_findings', results);

 return results;
};
```

### The Three Registries

Every execution carries three registries that define its capabilities:

**1. Prompt Registry** - Builds system prompts hierarchically
```typescript
pipeline.prompt.set('identity', 'You are an AI assistant');
phase.prompt.set('task', 'discovering implementation patterns');
agent.prompt.set('expertise', 'specialized in React');
// Agent sees complete prompt with all context
```

**2. Tool Registry** - Controls what tools each agent can access
```typescript
phase.tools.set('web-search', webSearchTool);
phase.tools.set('code-search', codeSearchTool);
// Specific agents only get tools they should use
searchAgent.tools.set('web-search', webSearchTool);
```

**3. LLM Registry** - Configures models based on context
```typescript
pipeline.llms.set('default', { model: 'claude-3-sonnet', temperature: 0.7 });
codeAgent.llms.set('default', { model: 'claude-3-opus', temperature: 0.2 });
```


## How AI Agents Work in Bitcode

### The PTRR Pattern (Plan-Try-Refine-Retry)
Every agent in Bitcode follows this pattern for reliable intelligence:

```typescript
const agent = sequential(
 plan, // Understand task and create approach
 try, // Execute with tools and LLM calls
 refine, // Improve based on results
 retry // Handle failures gracefully
);
```

### The SDIVF Pattern (Setup-Discovery-Implementation-Validation-Finish)
Pipelines orchestrate phases to satisfy Reads, store AssetPack evidence, and deliver optional Shippables:

```typescript
const pipeline = sequential(
 setup, // Initialize context and requirements
 repeat(
 sequential(discovery, implementation, validation),
 { until: (exec) => exec.get('validation', 'passed') }
 ),
 finish // Store evidence and deliver requested Shippables
);
```

### Multi-Agent Coordination
Phases coordinate multiple specialized agents:

```typescript
const discoveryPhase = parallel(
 webSearchAgent, // Find solutions online
 codeAnalysisAgent, // Analyze existing code
 documentationAgent // Read relevant docs
);
// All agents work simultaneously, findings aggregated
```

## API Reference

### Execution Class

```typescript
class Execution<TPrompt, TTools, TLLMs> {
 // Identity and hierarchy
 readonly id: string;
 readonly parent?: Execution;

 // Three registries for configuration
 readonly prompt: TPrompt; // Prompt parts that build system prompts
 readonly tools: TTools; // Tools this execution can access
 readonly llms: TLLMs; // LLM configurations (model, temperature, etc)

 // State storage and retrieval
 store(namespace: string, key: string, value: StorableValue): void;
 get<T>(namespace: string, key: string): T | undefined;

 // Create child executions and navigate hierarchy
 child(id: string): Execution; // Create isolated child
 findUp<T>(namespace: string, key: string): T | undefined; // Search up parent chain
 getRoot(): Execution; // Get root of tree
 getPath(): string[]; // Path from root to this node
}
```

### Common State Operations

```typescript
// Store discoveries and plans
execution.store('agent', 'plan', 'Implement dark mode using CSS variables');
execution.store('research', 'patterns', ['theme-provider', 'css-in-js', 'system-preference']);
execution.store('validation', 'test_results', { passed: 15, failed: 0 });

// Access from child executions
const plan = childExec.findUp('agent', 'plan');
const patterns = childExec.findUp('research', 'patterns');

// Create isolated children for sub-operations
const planExec = execution.child('plan-step');
const tryExec = execution.child('try-step');
```

### Registry Operations

```typescript
// Prompt accumulation
execution.prompt.set('role', 'You are a code generation expert' as PromptPart);
execution.prompt.set('context', 'Working on React components' as PromptPart);
const systemPrompt = execution.prompt.format();

// Tool access
const tool = execution.tools.getTool('file-edit', execution);
if (tool) {
 const result = await tool.execute('src/App.tsx', newContent);
}

// LLM usage
const llm = execution.llms.getDefaultLLM(execution);
const response = await llm({
 messages: [{ role: 'user', content: 'Generate dark mode implementation' }]
});
```

## Combinators: Building Complex Operations

### Sequential Execution
```typescript
// Run operations in order, output flows to next input
const analyzeAndGenerate = sequential(
 analyzeRequirements, // First: understand what's needed
 generateImplementation, // Second: create solution
 validateOutput // Third: verify correctness
);

// Type-safe piping across different types
const processFile = pipe(
 readFile, // string → FileContent
 parseContent, // FileContent → ParsedData
 transformData, // ParsedData → ProcessedResult
 saveResult // ProcessedResult → SaveConfirmation
);
```

### Parallel Execution
```typescript
// Run multiple operations at the same time
const gatherContext = parallel(
 searchWebForPatterns,
 analyzeExistingCode,
 readDocumentation
);
// Returns array: [webResults, codePatterns, docInsights]
```

### Conditional Execution
```typescript
// Branch based on runtime conditions
const smartAgent = conditional(
 (input) => input.requiresWebSearch,
 searchThenAnalyze, // If true: search web first
 directAnalysis // If false: analyze immediately
);

// Multi-branch selection
const routeByType = switch(
 (input) => input.fileType,
 {
 'typescript': typeScriptAnalyzer,
 'python': pythonAnalyzer,
 'rust': rustAnalyzer
 },
 genericAnalyzer // default
);
```

### Resilience Patterns
```typescript
// Retry with exponential backoff
const reliableApiCall = retry(
 callExternalAPI,
 {
 times: 3,
 backoff: 2, // 1s, 2s, 4s
 shouldRetry: (err) => err.code === 'RATE_LIMIT'
 }
);

// Time-bounded operations
const quickAnalysis = timeout(
 deepCodeAnalysis,
 30000, // 30 second limit
 () => ({ status: 'timeout', partial: true })
);

// Error boundaries
const safeOperation = tryExecutor(
 riskyOperation,
 (error, input) => ({
 status: 'error',
 fallback: true,
 reason: error.message
 })
);
```

### Iteration Patterns
```typescript
// Repeat until condition met
const improveUntilGood = repeat(
 improveQuality,
 {
 until: (exec) => exec.get('quality', 'score') > 0.9,
 maxIterations: 5
 }
);

// Fixed iterations
const collectSamples = repeat(gatherSample, { times: 10 });
```

## Building Complex AI Systems

### Example: Code Generation Agent with PTRR
```typescript
import { sequential, conditional, retry } from '@bitcode/execution-generics';

const codeGeneratorAgent = sequential(
 // Plan: Understand requirements
 async (input, execution) => {
 const context = execution.findUp('phase', 'requirements');
 const llm = execution.llms.getDefaultLLM(execution);

 const plan = await llm({
 messages: [{
 role: 'user',
 content: `Plan implementation for: ${context.description}`
 }]
 });

 execution.store('agent', 'plan', plan);
 return { ...input, plan };
 },

 // Try: Generate code with tools
 conditional(
 (input) => input.plan.requiresResearch,
 sequential(
 // Research existing patterns
 async (input, execution) => {
 const searchTool = execution.tools.getTool('code-search', execution);
 const patterns = await searchTool.execute(input.plan.searchQuery);
 execution.store('research', 'patterns', patterns);
 return { ...input, patterns };
 },
 generateFromPatterns
 ),
 directGeneration
 ),

 // Refine: Improve based on context
 refineWithContext,

 // Retry: Handle failures
 retry(validateAndFinalize, { times: 3 })
);
```

### Example: Discovery Phase with Parallel Agents
```typescript
const discoveryPhase = async (requirements, execution) => {
 // Run multiple agents in parallel
 const discoveries = await parallel(
 // Web search agent
 async (reqs, exec) => {
 const tool = exec.tools.getTool('web-search', exec);
 const results = await tool.execute({
 query: `${reqs.tech} ${reqs.feature} implementation`,
 limit: 10
 });
 exec.store('findings', 'web', results);
 return results;
 },

 // Code analysis agent
 async (reqs, exec) => {
 const tool = exec.tools.getTool('code-search', exec);
 const patterns = await tool.execute({
 pattern: `**/*.${reqs.fileType}`,
 query: reqs.feature
 });
 exec.store('findings', 'code', patterns);
 return patterns;
 },

 // Documentation agent
 async (reqs, exec) => {
 const tool = exec.tools.getTool('docs-reader', exec);
 const docs = await tool.execute({
 source: reqs.framework,
 topic: reqs.feature
 });
 exec.store('findings', 'docs', docs);
 return docs;
 }
 )(requirements, execution);

 // Aggregate findings
 const synthesis = synthesizeDiscoveries(discoveries);
 execution.store('phase', 'discovery_complete', true);
 execution.store('phase', 'synthesis', synthesis);

 return synthesis;
};
```

## Understanding the Execution Tree

### How State Flows Through the Tree

```
pipeline (stores: task, requirements, context)
│
├── discovery-phase (stores: search strategy)
│ ├── web-search-agent
│ │ ├── llm-call (what to search)
│ │ ├── tool-use (search results)
│ │ └── stores: patterns found
│ │
│ └── code-analysis-agent
│ ├── llm-call (analysis plan)
│ ├── tool-use (code search)
│ └── stores: existing patterns
│
└── implementation-phase (can access all above)
 └── code-generator-agent
 ├── findUp('discovery', 'patterns') // Gets patterns from discovery
 ├── llm-call (generate based on patterns)
 └── tool-use (write files)
```

### State Isolation and Sharing

```typescript
// Parent stores shared context
phaseExecution.store('context', 'framework', 'React');
phaseExecution.store('context', 'requirements', requirements);

// Child agents have isolated state
const agent1 = phaseExecution.child('agent-1');
agent1.store('local', 'attempts', 0); // Only agent1 sees this

// But can access parent state
const framework = agent1.findUp('context', 'framework'); // 'React'

// Sibling agents can't see each other's local state
const agent2 = phaseExecution.child('agent-2');
agent2.get('local', 'attempts'); // undefined - can't see agent1's state
```

## Integration Points

### With @bitcode/agent-generics
- Provides `AgentSubStepperFailsafes` and `AgentSubStepperGenerations`
- Implements PTRR pattern using execution combinators
- Each substep creates child execution for tracking

### With @bitcode/tools-generics
- Every tool extends `ExecutionTool` for automatic tracking
- Tool execution creates child with metrics (duration, status, errors)
- Tools registered in `ExecutionToolRegistry` for hierarchical access

### With @bitcode/pipelines-generics
- Phases are executors that coordinate agents
- Pipeline is top-level executor orchestrating phases
- Execution tree preserves full intelligence history

### With @bitcode/prompts
- `ExecutionPrompt` extends `Prompt` from prompts package
- Hierarchical prompt accumulation through Registry pattern
- Format at any level to get accumulated system prompt

## Performance Characteristics

- **Memory**: O(n) where n = stored values across all namespaces
- **Child creation**: O(1) - just creates new Execution instance
- **findUp**: O(depth) worst case for hierarchical lookup
- **Registry operations**: O(1) for get/set in underlying Maps
- **Prompt formatting**: O(m) where m = number of prompt parts

## Thread Safety

- Execution instances are NOT thread-safe
- Each async branch should use `child()` for isolation
- Combinators like `parallel` automatically create children
- Storage operations are synchronous unless using PERSISTENT destination

## Best Practices

1. **Always create children for isolation**
 ```typescript
 const childExec = execution.child(`operation-${id}`);
 ```

2. **Use namespaces for organization**
 ```typescript
 execution.store('agent', 'plan', plan);
 execution.store('metrics', 'tokens', count);
 ```

3. **Leverage hierarchical lookup**
 ```typescript
 const context = execution.findUp('phase', 'context');
 ```

4. **Type your storage access**
 ```typescript
 const plan = execution.get<AgentPlan>('agent', 'plan');
 ```

5. **Use registries for configuration**
 ```typescript
 // Don't hardcode - use registries
 const llm = execution.llms.getDefaultLLM(execution);
 const tool = execution.tools.getTool('web-search', execution);
 ```

## When to Use This Package

### Perfect For:
- **Multi-agent AI systems** where agents read to coordinate and share discoveries
- **Complex pipelines** with phases that build on each other's work
- **Retry-heavy operations** like API calls, tool usage, LLM interactions
- **Hierarchical configuration** where context determines behavior
- **Stateful workflows** that accumulate knowledge over time

### Not Needed For:
- Simple one-shot LLM calls without state
- Basic sequential operations without coordination
- Stateless data transformations

## Key Principles

1. **Agents are just functions** - No complex classes or frameworks
2. **State flows down, lookups go up** - Children inherit but don't pollute parent state
3. **Configuration cascades naturally** - More specific contexts override general ones
4. **Failures are isolated** - Errors in children don't break parents
5. **Everything is typed** - Compile-time safety for runtime reliability
