# generic-agents

Base and product Agent implementations that extend `@bitcode/agent-generics` primitives.

## Hierarchy (names encode full ancestry)

```
Agent # primitive (@bitcode/agent-generics)
 ↑
PTRRAgent # base + primitive (@bitcode/generic-agents-ptrr)
 ↑
product / measure / conversation agents # specific + PTRR + Agent
```

```
@bitcode/agent-generics # factoryAgent, factoryQuickAgent, AgentExecution, generations
 ↑
@bitcode/generic-agents-ptrr # factoryPTRRAgent → PTRRAgent
 ↑
@bitcode/generic-agents-agent-measure # MeasureAgent (category-parameterized)
@bitcode/generic-agent-* / agent-* # specialized agents (code-editor, danger-wall, …)
```

**Leaf naming (rolling):** under `generic-agents/`, new packages use the `agent-*`
prefix (`agent-measure/`). Older leaves (`code-editor/`, `danger-wall/`, …) rename
package-by-package.

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `PTRR/` | `@bitcode/generic-agents-ptrr` | `PTRRAgent` base (Plan→Try→Retry→Refine + 7-substep failsafes) |
| `agent-measure/` | `@bitcode/generic-agents-agent-measure` | MeasureAgent PTRR base (shared by absolutes + needinesses category packages) |
| `code-editor/`, `danger-wall/`, … | `@bitcode/generic-agent-*` | Specialized agents (legacy leaf names) |

Product agents supply prompts, tools, and schemas; they do not reimplement PTRR.
**Naming law:** every type/factory name should express ancestry where practical
(`factoryPTRRAgent`, not a leaf-only label for the base).

Category framing for measurements stays in `generic-measurements/{absolutes,needinesses}/`
(domain), not here.
