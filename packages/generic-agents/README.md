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
@bitcode/agent-generics # factoryAgent, factoryQuickAgent, AgentExecution, substeps
 ↑
@bitcode/generic-agents-ptrr # factoryPTRRAgent / factoryPTRRAgent → PTRRAgent
 ↑
@bitcode/generic-agent-* # specialized agents (code-editor, danger-wall, …)
@bitcode/generic-measurements-*-agent # measurement agents over PTRR
```

## Packages

| Path | Package name | Role |
| --- | --- | --- |
| `PTRR/` | `@bitcode/generic-agents-ptrr` | `PTRRAgent` base (Plan→Try→Refine→Retry + 7-substep failsafes) |
| `code-editor/`, `danger-wall/`, … | `@bitcode/generic-agent-*` | Specialized agents |

Product agents supply prompts, tools, and schemas; they do not reimplement PTRR.
**Naming law:** every type/factory name should express ancestry where practical
(`factoryPTRRAgent`, not a leaf-only label for the base).
