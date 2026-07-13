# require-prompt-hierarchy

Enforces Bitcode Registry-backed prompt hierarchy for agents:

- `factoryAgentWithPTRR` configs must include a `prompt` (`AgentPrompt`) or `prompts.system` as the Registry-backed prompt carrier.
- `stepPrompts` or `prompts` must include all four step Prompt registries: `plan`, `try`, `refine`, and `retry`.
- Manual assignment to `execution.prompt = ...` is forbidden; prompts must be passed through the factory boundary.

Why: Bitcode agent prompts must remain explainable from explicit `Prompt`/`PromptPart` registry composition. The rule prevents route-local or execution-local hidden prompt mutation and keeps generic base PromptParts plus specific implementation PromptParts flowing through the agent, step, and substep hierarchy.

Examples of incorrect code:

```
factoryAgentWithPTRR({ name: 'x', outputSchema }) // missing prompt and stepPrompts
```

```
execution.prompt = somePrompt // not allowed
```

Correct code:

```
factoryAgentWithPTRR({
  name: 'x',
  outputSchema,
  prompt: agentPrompt,
  stepPrompts: {
    plan: () => stepPrompts.plan,
    try: () => stepPrompts.try,
    refine: () => stepPrompts.refine,
    retry: () => stepPrompts.retry,
  }
})
```

The compatibility `prompts` shape is also accepted when it carries the same Bitcode hierarchy:

```
factoryAgentWithPTRR({
  name: 'x',
  outputSchema,
  prompts: {
    system: agentPrompt,
    plan: () => stepPrompts.plan,
    try: () => stepPrompts.try,
    refine: () => stepPrompts.refine,
    retry: () => stepPrompts.retry,
  }
})
```
