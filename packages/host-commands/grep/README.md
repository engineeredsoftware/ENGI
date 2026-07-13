# System Grep

## Overview

`@bitcode/system-grep` is the server-only grep primitive used by Bitcode repository-evidence search.
It performs bounded recursive text search from a caller-provided working directory and returns line-level source evidence for read measurement, prompt/tool grounding, proof inspection, and AssetPack planning.

This package does not own product semantics.
It is a low-level support primitive consumed by prompt-bearing generic-tool wrappers and higher Bitcode inference corridors.

## API

```typescript
import { simpleSystemTextSearch } from '@bitcode/system-grep';

const matches = await simpleSystemTextSearch({
  pattern: ['readDescription', 'assetPack'],
  cwd: process.cwd(),
  maxResults: 100,
  ignoreCase: false
});
```

Parameters:

```typescript
{
  pattern: string | string[];
  cwd?: string;
  maxResults?: number;
  ignoreCase?: boolean;
}
```

Return shape:

```typescript
interface GrepMatch {
  file: string;
  line: number;
  text: string;
}
```

`line` is zero-based because downstream Bitcode read models and UI surfaces can choose their own display convention.

## Runtime Boundary

- Imports `server-only` so the primitive is not bundled into browser code.
- Executes `grep -R -n -I --no-color --exclude-dir=.git -E`.
- Treats grep exit code `1` as no matches.
- Returns `[]` for grep execution failures instead of promoting grep errors into product truth.
- Caps parsed output at `maxResults`.

## Bitcode Usage

Use this primitive to collect repository evidence before another owner acts:

- read-comprehension tools can inspect source wording before deriving satisfaction criteria;
- asset-pack synthesis agents can locate local prompt, schema, package, or proof owners;
- proof writers can cite source-bearing implementation lines;
- validation agents can check whether expected terminology is present.

Do not use this package as a replacement for proof generation, file mutation, delivery mechanisms, or canonical read interpretation.
