# Pipelines Generics - TLDR

**Pipelines sequence executors into hierarchical execution flows.**

Pipeline → Phase → Agent → Variation → Step → SubStep

## The Execution Hierarchy

Everything is an Executor:
```typescript
type Executor<TInput, TOutput> = (input: TInput, execution: Execution) => Promise<TOutput>;
```

Pipelines create child executions for each level:
- **Pipeline**: Root execution, runs phases
- **Phase**: Delegates work to agents
- **Agent**: Executes variations based on input
- **Variation**: Runs PTRR steps
- **Step**: Runs 7 substeps
- **SubStep**: Atomic operations

## ExecutionPipelinePrompt

Specialized prompt that accumulates through hierarchy:
```typescript
prompt
  .setPipeline('type', 'AssetPack Pipeline')
  .setPhase('current', 'Discovery Phase')
  .setAgent('role', 'Requirements Analyzer')
  .setAgentVariation('approach', 'Deep Analysis')
```

## Creating Pipelines

```typescript
const pipeline = factoryPipeline({
  name: 'asset-pack',
  phases: ['discovery', 'implementation', 'validation']
});

const phase = factoryPhase({
  name: 'discovery',
  delegator: async (input, execution) => {
    const agent = new AgentExecution('analyzer', execution);
    return await analyzerAgent(input, agent);
  }
});
```

## Data Flow

State flows down, lookups go up:
```typescript
// Pipeline stores global config
pipeline.store('config', 'llm', { model: 'gpt-4' });

// Agent finds config from pipeline
const llmConfig = agent.findUp('config', 'llm');
```

## Integration Points

**LLM Access**:
```typescript
const llm = execution.llms.getDefaultLLM(execution);
const result = await llm({
  messages: [{ role: 'system', content: execution.prompt.format() }]
});
```

**Tool Access**:
```typescript
const tool = execution.tools.getTool('search-code', execution);
const results = await tool(query, execution);
```

## Common Patterns

1. **Phase delegation** - Phases create agent executions
2. **Agent selection** - Agents pick variations
3. **Data inheritance** - Children access parent state
4. **Prompt accumulation** - Each level adds context
5. **Registry integration** - Tools and LLMs via registries

## Why This Architecture

1. **Clear hierarchy** - Each level has specific responsibility
2. **State isolation** - Each execution has its own namespace
3. **Context accumulation** - Prompts build through levels
4. **Type safety** - Generics flow through all levels
5. **Pure functions** - Everything is executor composition

## The Mental Model

Think of pipelines as **execution trees**:
- Each node is an Execution with state
- Each edge is an Executor function
- State flows down through children
- Lookups traverse up to parents
- Prompts accumulate at each level

This creates traceable, hierarchical Bitcode execution flows.
