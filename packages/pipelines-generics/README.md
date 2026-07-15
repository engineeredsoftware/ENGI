# Pipelines Generics

Clean pipeline execution primitives for orchestrating phase sequences.

## What This Package IS

- **Pipeline/PipelineExecution** - The EE (Execution Entity) pair for pipelines
- **PhaseDelegator/PhaseDelegation** - The Executor/Execution pattern for phases delegating to agents
- **SDIVFPhase enum** - The 5 standard phases (Setup, Discovery, Implementation, Validation, Finish)
- **PipelinePrompt** - The generic prompt for Pipeline EE
- **Factory functions** - Clean creation of pipelines and phase delegators

## What This Package IS NOT

- **NOT pipeline implementations** - Those live in `/packages/pipelines/*`
- **NOT agent implementations** - Those live in `/packages/generic-agents/*`
- **NOT tool implementations** - Those live in `/packages/generic-tools/*`
- **NOT business logic** - This is pure generic abstraction

## Core Architecture

### Identity & Namespaces

- Pipelines and phases rely on Execution identity and store namespaces defined in `@bitcode/execution-generics`:
 - Use `execution/id` (not former `runId`) and `execution/correlationId`.
 - Use canonical agent namespaces for pipeline/phase/agent stores: `execution-<pipeline>-pipeline-phase-<phase>-<agent>`.
 - See `.docs/BITCODE_AGENTIC_EXECUTION.md` for SDIVF sequencing, pre/post processing, and the postprocessed SSOT.

### Everything is an Executor

```typescript
// The universal primitive from execution-generics
type Executor<TInput = any, TOutput = any> =
 (input: TInput, execution: Execution) => Promise<TOutput>;

// Pipeline - Top-level Executor that sequences phases
type Pipeline<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

// PhaseDelegator - Executor that delegates work to agents
type PhaseDelegator<TInput = any, TOutput = any> = Executor<TInput, TOutput>;
```

### The EE Pattern

```typescript
// Pipeline/PipelineExecution - The EE pair
export type Pipeline<TInput, TOutput> = Executor<TInput, TOutput>;
export class PipelineExecution extends Execution<PipelinePrompt> {
 constructor(id: string, parent?: Execution) {
 super(id, parent, PipelinePrompt);
 }
}

// PhaseDelegator/PhaseDelegation - The delegation pattern
export type PhaseDelegator<TInput, TOutput> = Executor<TInput, TOutput>;
export class PhaseDelegation extends Execution<PipelinePrompt> {
 constructor(id: string, parent?: Execution) {
 super(id, parent, PipelinePrompt);
 }
}
```

## SDIVF Pattern

The 5 standard phases that power all pipelines:

```typescript
export enum SDIVFPhase {
 SETUP = 'setup',
 DISCOVERY = 'discovery',
 IMPLEMENTATION = 'implementation',
 VALIDATION = 'validation',
 FINISH = 'finish'
}
```

## Quick Pipelines

For non-SDIVF flows that are a single agent sequence or loop, use a QuickPipeline:

```typescript
import { factoryQuickPipeline, type QuickPhase } from '@bitcode/pipelines-generics';

const quickPhase: QuickPhase<any, any> = async (input, exec) => {
 // compose agents/executors freely – no phase semantics
 return input;
};

export const myQuickPipeline = factoryQuickPipeline('my-quick', { phase: quickPhase });
```

Notes:
- QuickPipeline has no Phase concept; Phase is SDIVF-specific.
- Execution still receives `PipelineExecution` and stores under canonical namespaces.

## Usage

### Creating a Pipeline

```typescript
import { factoryPipeline, factoryPhaseDelegator } from '@bitcode/pipelines-generics';

// Create phase delegators
const setupPhase = factoryPhaseDelegator('setup', setupAgent);
const discoveryPhase = factoryPhaseDelegator('discovery', discoveryAgent);
const implementationPhase = factoryPhaseDelegator('implementation', implementationAgent);
const validationPhase = factoryPhaseDelegator('validation', validationAgent);
const finishPhase = factoryPhaseDelegator('finish', finishAgent);

// Create pipeline that sequences phases
const assetPackPipeline = factoryPipeline(
 'asset-pack',
 [setupPhase, discoveryPhase, implementationPhase, validationPhase, finishPhase]
);
```

### Creating a Pipeline with DIV Loop

```typescript
import { factoryPipelineWithDIVFinishLoop } from '@bitcode/pipelines-generics';

// DIV loop iterates Discovery-Implementation-Validation until validation passes
const analysisPipeline = factoryPipelineWithDIVFinishLoop('analysis', {
 setup: setupPhase,
 discovery: discoveryPhase,
 implementation: implementationPhase,
 validation: validationPhase,
 finish: finishPhase,
 maxIterations: 3,
 validationPredicate: (result, execution) => {
 return execution.get('validation', 'score') >= 0.85;
 }
});

### Per-Iteration Hooks (SDIVF Executor)

Use `factorySDIVFExecutorPipeline` when you read a preprocess/postprocess and a per-iteration hook:

```ts
import { factorySDIVFExecutorPipeline } from '@bitcode/pipelines-generics';

const pipeline = factorySDIVFExecutorPipeline('asset-pack', {
 preprocess,
 setup, discovery, implementation, validation, finish,
 iterationPreprocess: async (cur, exec) => {
 // e.g., inject Evidence Document updates for this iteration
 const list = (exec as any).get?.('evidence_documents', 'list') || [];
 (exec as any).store?.('evidence_documents', 'list', list);
 return cur;
 }
});
```
```

### Creating Phase Delegators

```typescript
import { factoryPhaseDelegator, factorySequentialPhaseDelegator } from '@bitcode/pipelines-generics';
import { codeAnalyzerAgent, codeGeneratorAgent } from '@bitcode/generic-agents';

// Single agent delegation
const analysisPhase = factoryPhaseDelegator('discovery', codeAnalyzerAgent);

// Multiple agents in sequence
const implementationPhase = factorySequentialPhaseDelegator(
 'implementation',
 [codeAnalyzerAgent, codeGeneratorAgent]
);

// Multiple agents in parallel with combiner
const validationPhase = factoryParallelPhaseDelegator(
 'validation',
 [lintAgent, testAgent, securityAgent],
 (results) => ({
 lint: results[0],
 test: results[1],
 security: results[2],
 passed: results.every(r => r.passed)
 })
);
```

### Using SDIVF Factory

```typescript
import { factorySDIVFPhaseDelegators } from '@bitcode/pipelines-generics';

// Create all 5 phases at once
const phases = factorySDIVFPhaseDelegators({
 setup: setupAgent,
 discovery: discoveryAgent,
 implementation: implementationAgent,
 validation: validationAgent,
 finish: finishAgent
});

// Use with pipeline factory
const pipeline = factoryPipeline('measure', phases);
```

## PipelinePrompt

The generic prompt for Pipeline EE:

```typescript
import { PipelinePrompt } from '@bitcode/pipelines-generics';

// Create pipeline-specific prompt
const prompt = PipelinePrompt.create('asset-pack');

// Prompts flow through Registry pattern
prompt.registry.set('pipeline.type', 'asset-pack');
prompt.registry.set('phase.current', 'implementation');
```

## Factory Functions

```typescript
// Pipeline factories
factoryPipeline(name: string, phases: PhaseDelegator[])
factoryPipelineWithDIVFinishLoop(name: string, config: DIVFinishConfig)

// Phase factories
factoryPhaseDelegator(name: string, agent: Agent)
factorySequentialPhaseDelegator(name: string, agents: Agent[])
factoryParallelPhaseDelegator(name: string, agents: Agent[], combiner: (results: any[]) => TOutput)
factorySDIVFPhaseDelegators(config: SDIVFConfig)

// Execution factories
factoryPipelineExecution(name: string, parent?: Execution)
factoryPhaseDelegation(phase: string, parent: Execution)
```

## Integration with Other Packages

- **execution-generics**: Provides Executor and Execution primitives
- **agent-generics**: Provides Agent implementations that phases delegate to
- **prompts**: Base Prompt class that PipelinePrompt extends
- **registry**: Registry pattern for hierarchical configuration

## Key Design Decisions

1. **Minimal surface area** - Only 6 files, 409 lines of clean code
2. **Pure Executor pattern** - Everything is just functions
3. **No specific implementations** - Only generic abstractions
4. **Clean EE pattern** - Pipeline/PipelineExecution, PhaseDelegator/PhaseDelegation
5. **Standard phases** - SDIVFPhase enum for the 5 phases

## Streaming Integration

Enable real-time streaming of pipeline execution progress:

```typescript
import { createStreamingExecution, emitPhaseTransition, emitAgentActivity } from '@bitcode/pipelines-generics';
import { createClient } from '@supabase/supabase-js';

// Example: starting AssetPack execution with streaming
async function runPipelineWithStreaming(userId: string, read: string) {
 const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 );

 // Create pipeline execution record
 const { data: run } = await supabase
 .from('pipeline_runs')
 .insert({
 user_id: userId,
 status: 'running',
 context: { read },
 created_at: new Date().toISOString(),
 })
 .select()
 .single();

 // Create execution with streaming enabled
 const execution = createStreamingExecution({
 runId: run.id,
 userId,
 supabase,
 streamToDatabase: true, // Persist events to database
 streamToSSE: true, // Enable SSE streaming
 });

 // Run pipeline phases with streaming
 emitPhaseTransition(execution, 'Discovery', 'start');
 // ... run discovery agents ...
 emitAgentActivity(execution, 'ResearchAgent', 'start');
 // ... agent work ...
 emitAgentActivity(execution, 'ResearchAgent', 'complete', {
 foundIssues: 12
 });
 emitPhaseTransition(execution, 'Discovery', 'complete');

 return run;
}
```

### Stream Event Types

- `phase-start` / `phase-complete` - Phase transitions
- `agent-start` / `agent-complete` - Agent activity
- `tool-use` - Tool execution
- `generation` - LLM invocations (generation steps)
- `thinking` - Reasoning steps
- `error` - Error events
- `status` - General status updates

### Integration with Execution Storage

The streaming adapter automatically hooks into the Execution's `store()` method to emit events:

```typescript
// Any store operation automatically emits a stream event
execution.store('agent', 'plan', planData); // Emits agent activity event
execution.store('phase', 'complete', { phase: 'discovery' }); // Emits phase completion
execution.store('tools', 'usage', toolResult); // Emits tool-use event
```

## Philosophy

This package provides the MINIMAL abstractions for pipeline-based execution. Pipelines sequence phases. Phases delegate to agents. That's it.

Concrete pipelines in `/packages/pipelines/*` USE these primitives to implement actual software development workflows. The separation ensures the primitives remain pure while implementations can evolve independently.

**Clean. Simple. Powerful.**
