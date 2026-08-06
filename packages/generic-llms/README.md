# generic-llms

Nested LLM provider packages that implement `@bitcode/llm-generics` contracts.

## Nested-package pattern

`packages/generic-*` families are **not** single packages. The family folder holds
only a README (and optional shared docs); each implementor is a nested package:

```
packages/generic-llms/
 README.md
 xAI/ → @bitcode/generic-llms-xai
 OpenAI/ → @bitcode/generic-llms-openai
 Anthropic/ → @bitcode/generic-llms-anthropic
 Google/ → @bitcode/generic-llms-google
 defaults/ → @bitcode/generic-llms-defaults
 registry/ → @bitcode/generic-llms (aggregator registry)
```

Same pattern as `generic-agents/*`, `generic-tools/*`, `generic-pipelines/*`.

## Hierarchy

```
@bitcode/llm-generics # pure LLM / registry primitives
 ↑
@bitcode/generic-llms-{xai|openai|…} # concrete providers
 ↑
@bitcode/generic-llms # registry aggregator (all providers)
```

## Usage

```typescript
// Prefer specific provider when only one is needed:
import { xaiProvider } from '@bitcode/generic-llms-xai';

// Or the full registry used by AgentExecution / AssetPack preprocess:
import {
 factoryLLMRegistryWithProviders,
 resolveDefaultLLMConfig,
} from '@bitcode/generic-llms';
```

## Principles

- Always integrate LLMs through the Execution LLM registry; do not call providers
 from UI or route code.
- Provider SDKs live only on the nested provider package that uses them
 (OpenAI on openai/xai, Anthropic on anthropic, AI SDK on google).

Also nested: `models/` (`@bitcode/generic-llms-models`).
