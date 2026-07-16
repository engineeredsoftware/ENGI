# Prompting Bitcode

Living law for PromptPart / Prompt / ExecutionPrompt composition and LLM
**call-site** system strings. Complements [`packages/prompts`](../packages/prompts)
and [`packages/registry`](../packages/registry). Non-canonical vs SPEC; SPEC wins
on product semantics.

---

## Primitives (where implementations live)

| Primitive | Package | Role |
| --- | --- | --- |
| **Registry** | `@bitcode/registry` | Colon paths + priority |
| **PromptPart** | `@bitcode/prompts` | Branded semantic units; **SSOT under** `raw_promptparts/{generic,specific}/` |
| **Prompt** | `@bitcode/prompts` | `RegistryImpl<PromptPart>`; assemble + `format()` / `hierarchicalFormatter` |
| **ExecutionPrompt** | `@bitcode/execution-generics` | Only roots: `generic_system:` · `specific_execution:` |
| **Compose + EE walk** | `@bitcode/execution-generics` | `composePromptLayers`, `applyPromptRegistryToExecutionPrompt`, `applyComposedCallSiteNodePrompt`, `buildExecutionHierarchySystemPrompt` |
| **Pipeline/phase attach** | `@bitcode/pipelines-generics` | `attachExecutionPipelinePromptHierarchy`, `attachExecutionPhasePromptHierarchy` |
| **Role filter (failsafe/thinking)** | `@bitcode/agent-generics` | Thin wrapper over EE walk for active generation only |

**Do not** bury generic hierarchy walk/compose under `agent-generics` only.

**Do not** keep long-lived prose SSOT as `createPromptPart('…')` outside
`raw_promptparts/` (dynamic name crumbs only when unavoidable).

---

## Formatting Execution Hierarchies

### Execution

- **Execution: System** — “You’re in an Execution, which is…”
- Only this layer on pure Execution (no product Execution specialization).

### Pipeline

- **Pipeline: System** — “You’re in a Pipeline, which is…”
- **SDIVF Pipeline: System** — “You’re in an SDIVF pipeline, which is…”
- **Product (e.g. SynthesizeReads…): System** — “You’re in the … pipeline which is…”

**Composed Pipeline** (product-level Prompt = prim ⊕ base ⊕ specific, then
that formatted string is a **PromptPart** of the call-site):

> You’re in a pipeline… You’re in an SDIVF pipeline… You’re in the product pipeline…

**Plus Execution once** (authoring fold into pipeline node only):

> You’re in an Execution… [then pipeline composed]

### Phase

- **Phase: System** — “You’re in a Phase, which is…”
- **SDIVF Phase: System** — “You’re in an SDIVF Setup phase, which is…”
- **Product Phase: System** — “You’re in the product pipeline’s Setup phase…”

**Composed Phase** → one PromptPart on the phase EE. **Does not** re-emit Execution.

### Agent

- **Agent: System** — “You’re in an agent… steps…”
- **PTRR Agent: System** — “You’re in a PTRR Agent…”
- **Product Agent: System** — product identity

### Agent step

- **Step: System** — “You’re in an agent’s step…”
- **PTRR Plan/Try/Retry/Refine: System** — step purpose
- **Product step: System** — product step details

### Generation: Failsafe(s)

Primitive (PCC / ChunkThenSum / Stitch) ⊕ optional base ⊕ specific.

### Generation: Thinking(s)

Primitive (Reason / Judge / StructuredOutput) ⊕ optional base ⊕ specific.

---

## Call-site

Ordered **one block per EE node** root→leaf:

```
[Execution ⊕ Pipeline ⊕ SDIVF ⊕ ProductPipeline]   // pipeline EE only; Execution once
  → [Phase ⊕ SDIVFPhase ⊕ ProductPhase]
  → [Agent ⊕ PTRR ⊕ ProductAgent]
  → [Step ⊕ PTRRStep ⊕ ProductStep]
  → [Failsafe composed]
  → [Thinking composed]
  → Critical Context   // if non-PCC
```

Join separator: `EXECUTION_HIERARCHY_PROMPT_NODE_SEPARATOR` (`\n\n---\n\n`).

When a node has `specific_execution:call_site:*`, the walk **emits only** those
composed blocks (layered audit paths may still be registered for tooling).

### Execution-once law

| Rule | |
| --- | --- |
| Pure `Execution` | Store/tree only — no mandatory system re-format on every `seq-N` child |
| **Only pipeline EE** | Includes Execution system layer in its composed call-site block |
| Child nodes | Override/augment **their kind only** |
| Anti-pattern | Emitting Execution identity on root **and** again on every child |

---

## Naming (types)

Product-first full ancestry with **Execution** as EE primitive where applicable
(see `.docs/BITCODE_SOURCE_LAYOUT.md` §6.0 + plan renames):

| Target | Replaces |
| --- | --- |
| `ExecutionPipeline` | `ExecutionPipeline` |
| `ExecutionPhase` | `ExecutionPhase` |
| `ExecutionPipelineSDIVF` | `ExecutionPipelineSDIVF` |
| `ExecutionPipelineSDIVFSynthesizeReadAssetPacks` | `ExecutionPipelineSDIVFSynthesizeReadAssetPacks` |
| … | (phased renames; pipeline/phase before agent EE renames) |

---

## Authoring recipe

```ts
// 1) PromptParts in packages/prompts/raw_promptparts/...
// 2) Assemble layers
const composed = composePromptLayers([
  PRIMITIVE_EXECUTION_SYSTEM_PROMPT, // pipeline node only
  EXECUTION_PIPELINE_PRIMITIVE_PROMPT,
  EXECUTION_PIPELINE_SDIVF_PROMPT,
  PRODUCT_PIPELINE_PROMPT,
]);
// 3) Attach on root ExecutionPipeline (not seq-0)
applyComposedCallSiteNodePrompt(pipelineEE.prompt, composed, 'pipeline', {
  includesExecution: true,
});
// 4) Call-site
buildExecutionHierarchySystemPrompt(leaf, { pathFilter: agentRoleFilter });
```

---

## Tools (parallel surface)

Catalog at pipeline/agent; **step allowlist** via `applyStepToolSurface`
(Plan/Refine default `[]`). See `packages/agent-generics/TOOLS-IN-PTRR.md`.

---

## Proof

`pnpm run debug:read:first-llm` — marker Plan / prepare_concise_context / reason.
Expect Execution once + Pipeline + SDIVF + product + phase + agent + Plan + PCC + Reason.
