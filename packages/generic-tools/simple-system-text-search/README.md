# Bitcode Repository Evidence Search Tool

## Overview

This package admits the retained `simpleSystemTextSearch` callable as Bitcode repository-evidence search support.
It wraps `@bitcode/system-grep` in the generic tool abstraction so agentic Bitcode runs can search source text while measuring a read, grounding written-asset choices, and preparing AssetPack synthesis.

The package name remains a stable support surface.
The active V26 meaning is not generic codebase intelligence, task analysis, or a standalone search product.
It is a bounded support tool that returns line-level repository evidence to prompt-bearing tools and agents.

## Canonical V26 Role

- `packages/generic-tools/simple-system-text-search/src/index.ts` owns the callable generic-tool wrapper.
- `src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts` owns the canonical DocCode prompt injected into Bitcode runs.
- `src/prompts/SimpleSystemTextSearchDocCodeToolPrompt.ts` is only a stable export path for old imports.
- `packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_*` still have stable filenames, but their content and metadata describe Bitcode repository evidence search.
- `packages/host-commands/grep/src/index.ts` owns the server-only grep primitive and returns relative file paths, zero-based line numbers, and matched line text.

## API

```typescript
import { simpleSystemTextSearch } from '@bitcode/generic-tools-simple-system-text-search';

const evidence = await simpleSystemTextSearch.use({
 pattern: ['readDescription', 'assetPack', 'writtenAsset'],
 cwd: process.cwd(),
 maxResults: 100,
 ignoreCase: false
});
```

The wrapped primitive accepts:

```typescript
{
 pattern: string | string[];
 cwd?: string;
 maxResults?: number;
 ignoreCase?: boolean;
}
```

It returns:

```typescript
Array<{
 file: string;
 line: number;
 text: string;
}>
```

## Prompt Contract

The DocCode prompt must teach:

- search is for source-grounded evidence collection during Bitcode inference;
- search results inform read measurement, proof inspection, and AssetPack or written-asset planning;
- returned lines are evidence snippets, not final conclusions;
- callers must keep mutation, delivery, and proof production in their owning tools, agents, or pipelines;
- the `simpleSystemTextSearch` support name does not define Bitcode ontology.

The prompt uses generic DocCode metadata labels as base PromptParts and specific system-text-search PromptParts as the concrete implementation layer.
That Registry layering is intentional: generic labels remain reusable prompt infrastructure, while the specific PromptParts carry this tool's V26 support semantics.

## Boundary

Allowed:

- locate source references that explain a read;
- find package-local prompt, tool, or schema owners before synthesis;
- gather line evidence for validation, proof-writing, or AssetPack planning;
- support setup, discovery, implementation, validation, and Finish agents as an admitted tool.

Not allowed:

- infer canonical requirements without read-comprehension owners;
- mutate files or deliver third-party artifacts;
- claim broad repository intelligence beyond returned grep evidence;
- bypass package-local prompt/tool ownership by treating grep output as a proof by itself.

## Verification

The V26 proof family checks this package through:

- `protocol-demonstration/test/v26-simple-system-text-search-compatibility.test.js`
- `protocol-demonstration/test/v26-active-product-naming.test.js`
- `protocol-demonstration/test/v26-inference-implementation-records.test.js`
- `.proofs/_shared/prompt-space-completeness-proof.json`
- `.proofs/_shared/inference-implementation-records-proof.json`
