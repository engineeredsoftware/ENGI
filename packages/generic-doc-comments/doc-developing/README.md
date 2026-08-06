# @bitcode/generic-doc-comments-doc-developing



Development-time doc-comment plugins for testing and profiling. This package contains utility plugins for development workflows.

V26 status: `reference-only`.
This package is retained for reform analysis and bounded development utilities.
It is not part of the admitted live Bitcode runtime or prompt ownership path.

## Plugins

### @doc-comment-dryrun
Mocked responses for testing without LLM calls:
```typescript
/**
 * @doc-comment-dryrun
 * scenario: "basic_test"
 * response: { "result": "mocked" }
 */
```

### @doc-comment-benchmark
Performance benchmarking for code execution:
```typescript
/**
 * @doc-comment-benchmark
 * name: "critical_path"
 * iterations: 1000
 */
```

### @doc-comment-profile
Profiling markers for performance analysis:
```typescript
/**
 * @doc-comment-profile
 * section: "initialization"
 * measure: true
 */
```

## Important Note

Prompt-specific developing experiments remain prompt-package internal and reference-only.
Retained consumers in this corridor must not treat `packages/prompts/src/*` or `@bitcode/prompts/src/*` locations as public API.
See `scripts/specifying/V26_DOC_COMMENT_REFORM.md` for the active V26 reform boundary.

## Usage

```typescript
import {
 docDryRunPlugin,
 docBenchmarkPlugin,
 docProfilePlugin
} from '@bitcode/generic-doc-comments-doc-developing';
```

## When to Use

Use these plugins for:
- Testing without external dependencies
- Performance measurement
- Development profiling

NOT for production builds.
