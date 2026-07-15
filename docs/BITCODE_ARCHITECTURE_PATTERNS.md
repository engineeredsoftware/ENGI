# Bitcode Architecture Patterns Notes

Status: non-canonical internal note.

## Architectural Laws Of Bitcode

Functionality in Bitcode must flow through three layers:
- primitive: reusable typed behavior,
- package: bounded implementation owner,
- interface: Terminal, Exchange, API, MCP, ChatGPT App, or connected-interface expression.

## Rules

- Packages own implementation detail.
- Interfaces own operator or external-contract expression.
- Specifications own canonical requirements.
- Proofs own replayable evidence.
- Support paths must be wrapped, bounded, and eventually renamed or removed.

## Pattern Checklist

- Is the concept named in Bitcode terms?
- Is the primitive reusable without product leakage?
- Is the package boundary narrow?
- Is the interface reading/writing Exchange state?
- Is proof generated or testable?
- Is non-Bitcode vocabulary absent or explicitly bounded?
