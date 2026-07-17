# Tools in the Agent primitive + PTRR

How tools are **documented**, **selected**, **parameterized**, **executed**, and
**result-interpolated** for Bitcode agents.

Related packages:

| Package | Role |
| --- | --- |
| `@bitcode/tools-generics` | `Tool`, DocCodeToolPrompt, `formatUsableTools` |
| `@bitcode/agent-generics` | AgentExecution tools registry, PTRR step postprocess, interpolations |
| `@bitcode/generic-agents-ptrr` | PTRRAgent base (Plan→Try→Retry→Refine) |
| `@bitcode/generic-doc-comments-doc-code` | Build-time `@doc-code-tool` → prompt attachment |

---

## 1. End-to-end lifecycle

```
Register tools on pipeline / AgentExecution.tools (agent catalog)
        ↓
factoryPTRRAgent resolves per-step tool allowlists:
  plan/refine default []; try/retry default agent catalog
        ↓
PTRR step starts → StepExecution owns tools registry
  applyStepToolSurface(stepExec, stepAllowlist)  // restrictTo
  store tools.usable = Object.keys(getUsableTools())  // step-filtered
        ↓
FailsafeGeneration ×3 (PCC → ChunkThenSum → Stitch)
  each runs ThinkingsGeneration (Reason → Judge → StructuredOutput)
        ↓  [before each Thinkings LLM call]
  Doc interpolation:  auto:tools_doc_code_tools  ← formatUsableTools(step usable)
  Results interpolation: auto:tools_results      ← prior usedTools (if any)
        ↓
Try/Retry StructuredOutput may include:
  useTools: [{ name, input, reason }, ...]   // that step's own selection
        ↓
Step postprocess (Try/Retry only):
  if useTools?.length → factoryToolsExecution()
        ↓
For each selection:
  tool = step.tools.getTool(name)  // step allowlist + hierarchy
  output = tool.execute(input)
  usedTools.push({ tool: name, input, output } | { tool, error })
        ↓
Store tools.use / tools.used; publish agent-step work update
        ↓
Next PTRR step sees usedTools via results interpolation (not Plan's useTools)
```

**Plan** = strategy only (empty tool surface by default; `PlanStepOutputSchema` has
**no** `useTools`; no tools postprocess).
**Try/Retry** each select their own `useTools` on **task** StructuredOutput and
postprocess — **fundamental** to those steps (not optional philosophy).
**Refine** = final agent return (empty tool surface; no tools postprocess).
Refine SO schema is the agent domain shape with **`useTools` always omitted**
(`omitUseToolsFromSchema`); `sanitizeRefineStepOutput` strips any emitted
`useTools`. Tool lifecycle is only **usable → useTools → usedTools** on Try/Retry.

**PCC StructuredOutput** (first failsafe on every step) is unrelated: it emits only
`{ selectedKeys }` and **never** `useTools`, even under Try/Retry. Task SO after PCC
read-in is where Try/Retry `useTools` appears.

| | Plan | Try | Retry | Refine | PCC SO (any step) |
| --- | --- | --- | --- | --- | --- |
| Usable tools | `[]` | agent catalog | agent catalog | `[]` | n/a |
| Task SO may include `useTools` | **no** | **yes** | **yes** | **no** | n/a (`selectedKeys` only) |
| Tools postprocess | no | yes if selected | yes if selected | no | no |

---

## 2. Doc-code → usable tool documentation (doc interpolation)

### Law: DocCode is a **Tool** documentation attachment (not a registration gate)

| Registry level | What registers | DocCode |
| --- | --- | --- |
| **Pipeline / product** (`ExecutionPipelineToolRegistry`) | **Tools only** | **Optional** — improves usable-tool docs; **not** required to register |
| Agent / Step tool registries | Allowlist + hierarchy lookup | Resolve tools already on the pipeline |

Agents, LLMs, and prompt carriers do **not** use `__docCodePrompt`. Only
`@bitcode/tools-generics` **Tool** instances may carry DocCode for PTRR
usable-tool docs (`auto:tools_doc_code_tools`). Missing DocCode still registers
the Tool; interpolation formats less prose.

### Authoring a tool

```ts
/**
 * @doc-code-tool
 * @purpose Search Depository for Need-fitting AssetPack evidence
 * @capabilities lexical search, source-safe snippets, ranked candidates
 * @parameters query: string; limit?: number
 * @output { candidates: Array<{ id, score, summary }> }
 */
class AssetPackLexicalDepositorySearchTool extends ExecutionTool<typeof searchFn> {
  use = searchFn;
}
```

Build-time **doc-code** (`@bitcode/generic-doc-comments-doc-code`) attaches a
`DocCodeToolPrompt` instance to `tool.__docCodePrompt` (and `__promptParts`).
Runtime fallback: `attachDocCodeToolPrompt(tool, prompt)` / `factoryTool({ prompt })`.
Prefer DocCode for production tools; it is **not** a pipeline catalog gate.

### Formatting for the LLM

```ts
import { formatUsableTools } from '@bitcode/tools-generics';
// alias of formatToolsWithDocCodeToolsIntoUsableTools

const docs = formatUsableTools(Object.values(execution.tools.getUsableTools()));
// Sections: metadata, purpose, capabilities, parameters, output
```

### Injection path (automatic)

`factoryLLMGeneration` (Thinkings generations) calls
`injectToolInterpolationsForGeneration` →
`injectUsableToolDocsIntoPrompt`:

| Prompt path | Content |
| --- | --- |
| `auto:tools_doc_code_tools` | Concatenated DocCodeToolPrompt `.format()` for every usable tool |

`buildHierarchicalPrompt` then includes those parts in the system prompt.
`ThinkingsGenerationPrompt.injectToolDocs` is the same semantic slot for
declarative prompt carriers.

**Without docs:** tools still execute if selected by name, but the model has no
parameter schema — always attach DocCodeToolPrompt for production tools.

---

## 3. Parameters (how the model fills `input`)

| Layer | Contract |
| --- | --- |
| Doc-code `@parameters` | Human/LLM-readable parameter description in usable tools block |
| Structured schema | Agent/step Zod schema may declare `useTools: z.array(z.object({ name, input, reason }))` |
| Reason shape | Default ReasoningSchema allows optional `useTools` |
| Runtime selection | `output.useTools[].name` + `output.useTools[].input` |

Canonical selection object:

```json
{
  "name": "bitcode.asset-pack.verification",
  "input": { "repositoryFullName": "org/repo" },
  "reason": "verify source-bound candidate evidence"
}
```

`factoryToolsExecution` also accepts:

- `parameters` as synonym for `input`
- `tool` as string name (legacy) when `name` omitted

Lookup: **`AgentToolsRegistry.getTool(name)`** — current level, then parent
pipeline/agent registries. `restrictTo(keys)` can deny non-allowed names.

`ExecutionTool.execute` stores under a child execution:

- `tool.name`, `tool.input` (args), `tool.result` / `tool.error`, timings

---

## 4. Results (how outputs re-enter the agent)

### usedTools shape

```ts
type UsedTool = {
  tool: string;      // registry key / name
  input?: unknown;   // args passed to execute
  output?: unknown;  // success payload
  error?: string;    // failure message
};
```

### Telemetry stores (streaming / DB)

| Store | Meaning |
| --- | --- |
| `tools.usable` | Keys available at step start |
| `tools.use` / `tools.invocation` | Selected useTools (planned) |
| `tools.used` / `tools.result` | Per-tool success/failure + summarized I/O |
| Agent step work update | Normalized tool names for UI pipeline log |

Summarization bounds large objects (`type`/`keys`) so streams stay source-safe.

### Results interpolation (automatic)

`injectUsedToolResultsIntoPrompt` writes prior `usedTools` to:

| Prompt path | Content |
| --- | --- |
| `auto:tools_results` | Markdown blocks: name, status, input, truncated output/error |

Sources (first match):

1. `input.usedTools`
2. `input.output.usedTools`

Refine/Retry Thinkings therefore “see” prior tool outcomes in the system prompt
hierarchy without re-parsing telemetry stores.

Optional specialized formatting: `ToolPromptRegistry.formatOutput(name, output)` /
`formatInput` / `formatError` (`tool:{name}:output` with fallback `tool:output`).

---

## 5. PTRR placement

| PTRR step (order) | Failsafe×Thinkings | Tools postprocess |
| --- | --- | --- |
| Plan (1) | yes | **no** — strategy only; empty tool surface by default |
| Try (2) | yes | if **this step's** `output.useTools?.length` |
| Retry (3) | yes | if **this step's** `output.useTools?.length` (prior usedTools via interpolation) |
| Refine (4) | yes | **no** — final agent-typed return; empty tool surface |

**Not the old handoff model:** tools are **not** selected on step N and passed as
parameters for step N+1 to run. Each Try/Retry selects `useTools` in **its own**
structured output; **postprocess on that same step** executes them. Downstream
steps may *see results* (`usedTools` / `auto:tools_results`), not a deferred
invocation list.

Composition for Try/Retry (simplified):

```ts
sequential(
  createFailsafeGenerationSequence({ outputSchema }),
  conditional(
    (input) => input?.output?.useTools?.length > 0,
    factoryToolsExecution(),
    (input) => input,
  ),
);
```

`ToolExecutionPrompt` holds the execute instruction (`tool:execute`) and can
receive injected docs via `injectAvailableTools(docs[])`.

---

## 6. Registration patterns

```ts
const agentExec = new AgentExecution('agent:my-agent', pipelineExecution);

// Instance
agentExec.tools.registerTool('bitcode.search', searchTool);

// Class
agentExec.tools.registerToolClass('bitcode.verify', VerifyTool);

// Parent pipeline tools are visible via hierarchy getTool / getUsableTools
// Optional: agentExec.tools.restrictTo(['bitcode.search']);
```

Gate-aware file tools may bind `executionContext` so edits honor pipeline gates.

---

## 7. Checklist for new tools

1. Extend `Tool` or `ExecutionTool`; implement `use`.
2. Author `@doc-code-tool` with purpose / capabilities / **parameters** / **output**.
3. Ensure build-time doc-code loader runs (or `attachDocCodeToolPrompt`).
4. Register under a stable string key on the agent or pipeline tools registry.
5. Include `useTools` in the step/agent output schema when the LLM should select the tool.
6. Read `usedTools` / stream `tools.result` for UI and proof telemetry.
7. Do not bypass `factoryToolsExecution` with ad-hoc tool calls inside Reason.

---

## 8. Source map

| Concern | Primary source |
| --- | --- |
| Tool primitive | `packages/tools-generics/src/Tool.ts` |
| DocCodeToolPrompt | `packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts` |
| formatUsableTools | `packages/tools-generics/src/doc-code-tool/formatUsableTools.ts` |
| AgentToolsRegistry / ExecutionTool | `packages/agent-generics/src/execution/AgentToolsRegistry.ts` |
| Doc + results interpolation | `packages/agent-generics/src/execution/tool-prompt-interpolation.ts` |
| factoryToolsExecution | `packages/agent-generics/src/generations/llm-bound-factories.ts` |
| PTRR step wiring | `packages/agent-generics/src/steps/factories.ts` |
| ToolExecutionPrompt | `packages/agent-generics/src/prompts/ToolExecutionPrompt.ts` |
