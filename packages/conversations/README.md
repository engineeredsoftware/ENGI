# Conversations Generics

Bitcode conversation-domain package for shared prompt and type ownership.

## Role

This package remains admitted because fullscreen conversations are a commercial
Bitcode interface and read explicit prompt/type ownership across Terminal,
Exchange, Auxillaries, MCP, and ChatGPT App contexts.

It owns:
- conversation domain types and validation helpers
- the retained conversation agent abstraction
- the canonical conversation system prompt composition

It does not own:
- route orchestration
- persistence writes
- UI composition

Those remain with the commercial route and API owners.

## Architectural Rule

Use this package when a Bitcode conversation surface needs:
- shared conversation types
- validation helpers
- retained agent behavior
- prompt-system composition that should survive into proof-bearing Bitcode

Do not duplicate those contracts in route-local code.
