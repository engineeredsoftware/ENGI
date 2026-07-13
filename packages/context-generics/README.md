# @bitcode/context-generics

**Compatibility** package after the Context package audit.

There is **no separate Context state**. Process-level defaults that used to live
in `@bitcode/context` / `GlobalContext` are a **process-root Execution** in
`@bitcode/generic-executions`.

## Prefer

| Need | Package |
| --- | --- |
| Process defaults | `@bitcode/generic-executions` (`initializeProcessRoot`, …) |
| Execution primitive | `@bitcode/execution-generics` |
| Executor type | `@bitcode/executor-generics` |
| Combinators | `@bitcode/generic-executors` |
| Failsafe prepared keys | `@bitcode/generic-generations-failsafes` |

`@bitcode/context` re-exports this package for unmigrated imports.
