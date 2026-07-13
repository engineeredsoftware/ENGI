# @bitcode/executor-generics

**Executor** primitive: `(input, execution: Execution) => Promise<output>`.

Sequence lives here; **state** lives on `@bitcode/execution-generics` (`Execution`).

## Hierarchy

```
@bitcode/execution-generics              Execution (state)
@bitcode/executor-generics               Executor (sequence)  ← this package
        ↑
@bitcode/generic-executors               sequential, parallel, pipe, retry, …
@bitcode/generic-executions              Execution base helpers (process root, …)
```

Prefer importing combinators from `@bitcode/generic-executors`.
`@bitcode/execution-generics` re-exports both primitives and combinators for BC.
