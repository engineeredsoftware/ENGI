# @bitcode/generic-executors

Base **Executor** implementations (combinators) over `@bitcode/executor-generics`.

| Combinator | Role |
| --- | --- |
| `sequential` / `pipe` | Ordered composition |
| `parallel` | Concurrent fan-out |
| `conditional` / `branch` / `switchExecutor` | Control flow |
| `repeat` / `dynamic` | Iteration / dynamic dispatch |
| `retry` / `timeout` / `tryExecutor` / resilient | Error handling |
| `cache` / `gate` / `identity` / `transform` | Utilities |

```ts
import { sequential, parallel } from '@bitcode/generic-executors';
import type { Executor } from '@bitcode/executor-generics';
```

`@bitcode/execution-generics` re-exports these for backward compatibility.
