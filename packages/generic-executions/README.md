# @bitcode/generic-executions

Base **Execution** helpers. Process-level defaults that used to be called
`GlobalContext` are a **process-root Execution** — not a second state model.

## Hierarchy

```
@bitcode/execution-generics          Execution primitive
        ↑
@bitcode/generic-executions          process-root + helpers (this package)
        ↑
product pipelines                    synthesize-deposits / reads / settle-reads
```

## Prefer

```ts
import {
  initializeProcessRoot,
  getProcessRootExecution,
  getProcessRootFields,
} from '@bitcode/generic-executions';
```

BC aliases (`initializeContext`, `getGlobalContext`, …) remain for callers that
have not yet switched vocabulary.
