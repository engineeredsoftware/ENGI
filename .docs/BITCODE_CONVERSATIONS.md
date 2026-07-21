# Bitcode Conversations Notes

Status: non-canonical internal note.

## Role

Conversations are a rich Bitcode input surface. They can collect source evidence, attachments, context, Read/Deposit intent, output destinations, and follow-up instructions without becoming a separate product model.

The conversation surface must write into the same Exchange activity and execution model as product.
V37 Gate 8 adds `ConversationTelemetryProofHooks` so route-local sessions,
messages, streams, tools, source selectors, product handoffs, retries,
errors, and completions emit source-safe dashboard and runbook telemetry.
Those hooks expose ids, counts, states, redacted error classes, and proof
roots only; they do not expose protected prompts, protected source, unpaid
DataPack source, wallet private material, provider tokens, or settlement
private payloads.
V37 Gate 9 adds `ConversationRehearsal` so local and staging-testnet
conversation flows are promotion-rehearsed before V37 closure. Local and
staging-testnet rehearsals exercise chat, streaming, writing, source selector,
product handoff, restore, retry, redaction, and error flows. Rehearsal
logs/screenshots are source-safe. Route/UI checks, telemetry roots, and
value-bearing mainnet blocking are visible in
`.proofs/v37/conversation-rehearsal.json` through
`source-safe-conversation-rehearsal-metadata`.

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, product handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible.

## Required Semantics

Conversations can:
- gather Read or Deposit context,
- attach files, URLs, repository references, and connected-interface context,
- start or continue Bitcode executions,
- show execution state and proof receipts,
- route final DataPacks to delivery mechanisms,
- reread persisted state.

Conversations must not:
- own a parallel pipeline model,
- invoke removed multi-pipeline controls,
- hide Read review,
- bypass source-to-shares fit review,
- create connected-interface writes without admission receipts.

## Mention and Slash Concepts

If conversation shortcuts exist, they should name Bitcode concepts:
- `/read` for measured Read creation,
- `/asset-pack` for DataPack synthesis,
- `/fit-review` for fit-quality review,
- `/delivery` for destination and delivery-mechanism state,
- `/proof` for proof and settlement receipts.

Former-name aliases should be hidden from operator copy and bounded in tests/proofs until removed.
