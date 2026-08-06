# Bitcode LLM Registry Notes

Status: non-canonical internal note.

## Purpose

LLM registry configuration selects model providers for Bitcode inference without letting provider details define product semantics.

## Current Environment Keys

Examples:
- `BITCODE_LLM_PROVIDER=anthropic` (product default)
- `BITCODE_LLM_MODEL=claude-haiku-4-5` (product default)
- `BITCODE_LLM_PROVIDER=openai`
- `BITCODE_LLM_MODEL=gpt-4.1-mini`

## Rules

- Provider/model selection is execution infrastructure.
- Prompt and tool registries remain separate from provider defaults.
- Read measurement, fit review, DataPack synthesis, and Finish semantics must not depend on provider-specific naming.
- Cost and token accounting should be captured as proof/receipt metadata where available.

