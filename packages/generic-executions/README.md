# @bitcode/generic-executions

Base **Execution** helpers. Process-level defaults are a **process-root Execution**
under the `process` namespace — not a second Context state model.

## Hierarchy

```
@bitcode/execution-generics   Execution primitive
  ↑
@bitcode/generic-executions   process-root + helpers (this package)
  ↑
product pipelines (synthesize-deposits / synthesize-reads / settle-asset-packs)
```

## Prefer

```ts
import {
  initializeProcessRoot,
  getProcessRootExecution,
  getProcessRootFields,
  setProcessRootFields,
  endProcessRoot,
  prepareProcessRootForPrompt,
  serializeProcessRootFields,
  type ProcessRootFields,
} from '@bitcode/generic-executions';
```

Failsafe “prepared context” (key selection over Execution for prompts) lives in
`@bitcode/generic-generations-failsafes` (`prepareConciseContext`), not here.

There is **no** `@bitcode/context-generics` package.
