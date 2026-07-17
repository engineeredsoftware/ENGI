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
| **Pipeline attach** | `@bitcode/pipelines-generics` | `attachExecutionPipelinePromptHierarchy` |
| **Phase attach (SDIVF-only)** | `@bitcode/generic-pipelines-execution-pipeline-sdivf` | `attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy` |
| **Role filter (failsafe/thinking)** | `@bitcode/agent-generics` | Thin wrapper over EE walk for active generation only |

**Do not** bury generic hierarchy walk/compose under `agent-generics` only.

### PromptPart residence law (absolute)

| Rule | |
| --- | --- |
| **Authored strings** | Written **only** under `packages/prompts/src/raw_promptparts/{generic,specific}/` |
| **Naming** | `promptpart_[generic\|specific]_[domain]_[promptclass]_[semantic]_[position].ts` |
| **Everywhere else** | **Import** `PROMPTPART_*` and assemble into `Prompt` registries |
| **Forbidden** | `createPromptPart('prose…')` outside `raw_promptparts` (any package, agent, pipeline) |
| **`createPromptPart`** | Branding helper for raw_promptparts files only |
| **`createPromptPartFromPrompt`** | Brand a *composed* `Prompt.format()` result as one PromptPart for call-site nodes (no new prose) |

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

“You are in an Execution…” appears **once on the system walk** (pipeline block). Nested
system blocks (phase / agent / step / failsafe / thinking) must **not** re-emit it.
That is **not** the same as “Execution text must be absent from the call-site overall.”

### Full ancestry on every call-site (do not amputate nodes)

Every LLM **system** string walks **full** ancestry root→leaf, including **Agent** and
**Step**. Do **not** drop Agent/Step from the walk to “thin” prompts. If agent capability
prose is too heavy for all call-sites, thin **authored promptparts** on the agent node —
never skip the node.

Slight role adjustments (allowed):

- `pathFilter`: only the **active** failsafe + **active** thinking (Reason | Judge | SO)
- Plan vs Try tool surface (Plan defaults no usable tools)

### System vs user (two laws)

| Channel | Optimal |
| --- | --- |
| **System** | Full hierarchy walk (Execution once on pipeline + Phase + Agent + Step + Failsafe + Thinking) |
| **User** | Task / schema / structured inputs for **this** generation — **do not re-paste** the full system hierarchy |

Anti-pattern: stuffing `preparation` with a second copy of the hierarchical system string
while system already carries the walk.

### PrepareConciseContext (PCC) selection Thinkings

PCC always runs as the first failsafe under a step. Selection Thinkings (Reason → Judge →
StructuredOutput) use:

| Channel | Content |
| --- | --- |
| **System** | Full hierarchy walk as above (Agent/Step included) + PCC failsafe law + active thinking |
| **User (Reason)** | Lean **task** identity (product/phase/agent/step one-liner) + `pipeline_execution_keys` (keys only). PCC law is **not** re-embedded as a second `system` essay when already on hierarchical system. Schema: Reasoning (`analysis`, `reasoningItems`, `conclusion`, `confidence`) — **not** `steps` (reserved for PTRR Step). |
| **User (Judge)** | Prior `reasoning` + keys (+ lean task). No hierarchy re-dump. Schema: Judgment. |
| **User (StructuredOutput)** | Prior `reasoning` + `judgment` + keys (+ lean task). Schema: `{ "selectedKeys": string[] }` only. **Never** instruct `useTools` under PCC selection. JSON/schema envelope appears **once**. |

After SO: host **read-in** of values for selected keys → ChunkThenSum / Stitch / task Try.

### ChunkThenSum (CS) task Thinkings

After PCC value read-in, task Thinkings (Reason → Judge → StructuredOutput against the
**step** output schema) use:

| Channel | Content |
| --- | --- |
| **System** | Full hierarchy walk + **ChunkThenSum failsafe law** + active thinking |
| **User** | **Prepared only:** `selectedKeys` + `selectedContext` (+ `reasoning` / `judgment` as gens advance). **Do not** re-dump the pre-PCC step input envelope (`read` / `host` / `depositoryAssets` / …). |

**Chunked path (canonical):** host **sequentially** loops selectedContext slices. Each LLM
pass receives **this slice** plus **`priorChunkCompletions`** from earlier slices. After all
slices complete, **one** summing Thinkings pass over all completions. (Opt-in parallel slices
without priors are non-canonical.)

Empty `selectedContext` stays prepared-only (lean empty bag) — do not re-dump the envelope
as fail-soft.

---

## Naming (types)

Product-first full ancestry with **Execution** as EE primitive where applicable
(see `.docs/BITCODE_SOURCE_LAYOUT.md` §6.0 + plan renames):

| Target | Replaces |
| --- | --- |
| `ExecutionPipeline` | pipeline primitive |
| `ExecutionPipelineSDIVF` | SDIVF base |
| `ExecutionPipelineSDIVFExecutionPhase` | SDIVF phase EE |
| `ExecutionPipelineSDIVFExecutionPhaseDelegator` | SDIVF phase Executor |
| `ExecutionPipelineSDIVFSynthesizeReadAssetPacks` | product pipeline |
| … | full ancestry left→right; phases are SDIVF-only |

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

Living progressive markers (see `.qa/BITCODE_V48_CANONICAL_PROMOTION_ACCEPTANCE.md` §1):

```bash
# Deposit (current marker often Plan / prepare_concise_context / structured_output)
pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm

# Read (first-reason entry still available)
pnpm --filter @bitcode/pipeline-hosts run qa:read:debug-first-llm
```

Expect on **system**: Execution **once** + Pipeline + SDIVF + product + Phase + **Agent** +
**Plan** + PCC + active Thinking (Reason | Judge | SO).

Expect on **user** (PCC selection): lean task + keys-only tree; **no** full hierarchy re-paste;
SO = `{ selectedKeys }` only (no useTools).
