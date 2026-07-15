# Bitcode Conversations Telemetry Runbook

Status: internal operational runbook for V37 `ConversationTelemetryProofHooks`.

Gate 9 adds `ConversationRehearsal` as the local/staging proof companion to
telemetry hooks. Local and staging-testnet rehearsals exercise chat, streaming,
writing, source selector, product handoff, restore, retry, redaction, and
error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks,
telemetry roots, and value-bearing mainnet blocking are visible through
`.bitcode/v37-conversation-rehearsal.json` and
`source-safe-conversation-rehearsal-metadata`.

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, product handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible.

## Source-Safe Boundary

Conversation telemetry may expose event ids, conversation ids, message ids,
run ids, source selector refs, product transaction refs, counts, state enums,
proof roots, dashboard panel ids, runbook ids, and redacted error classes.

Conversation telemetry must not expose secret values, provider tokens, wallet
private material, protected source payloads, raw protected prompts, raw model
responses with protected source, unpaid AssetPack source, settlement private
payloads, private payment credentials, operator private notes, ledger write
authority, or wallet signing authority.

## Dashboard Panels

- `conversation.dashboard.session-health`: restore, branch, delete, and
 route-local history proof posture.
- `conversation.dashboard.message-storage`: persistence, visibility tier,
 retention, export, delete, and redaction proof posture.
- `conversation.dashboard.stream-quality`: stream sequence, completion,
 orphaned stream, and unsafe metadata posture.
- `conversation.dashboard.tool-policy`: tool admission, denial, completion,
 and policy proof posture.
- `conversation.dashboard.source-policy`: source selector policy, rights, and
 disclosure posture.
- `conversation.dashboard.terminal-handoff`: handoff proof, product route
 context, and authority boundary posture.
- `conversation.dashboard.retry-recovery`: retry admission, loop detection,
 branch repair, and history-root posture.
- `conversation.dashboard.error-recovery`: redacted error class, incident
 proof root, and recovery state.
- `conversation.dashboard.completion-quality`: persisted assistant message,
 handoff readiness, and completion proof posture.

## Runbook Families

- `runbook.conversation.session-repair`: route-local session restore, branch,
 delete, and repair posture.
- `runbook.conversation.message-redaction`: message visibility, redaction,
 retention, export, delete, and replay posture.
- `runbook.conversation.stream-debug`: stream continuity, orphaned stream,
 completion, and source-safe expanded metadata posture.
- `runbook.conversation.tool-policy-denial`: tool admission, denial,
 completion, and policy proof posture.
- `runbook.conversation.source-selector-policy`: source selector policy,
 rights posture, and disclosure limit posture.
- `runbook.conversation.terminal-handoff-repair`: product route handoff,
 transaction context, and authority repair posture.
- `runbook.conversation.retry-loop`: retry admission, loop detection, and
 route-local history repair posture.
- `runbook.conversation.error-recovery`: redacted error class, incident root,
 and recovery posture.
- `runbook.conversation.completion-repair`: persisted assistant message,
 handoff readiness, and completion repair posture.

Each runbook family follows the same operator sequence:

1. Locate the event family, event id, conversation id, proof root, and
 redaction posture.
2. Confirm dashboard metadata contains only source-safe ids, counts, states,
 proof roots, dashboard ids, runbook ids, and redacted error classes.
3. Use the family-specific proof root to replay source-safe route state.
4. Repair by writing a source-safe event row, redacted error row, completion
 row, or deletion tombstone proof.
5. Update public docs only with user-visible posture; never disclose protected
 payloads during incident repair.

## Family-Specific Notes

- Session repair checks route-local history roots and branch roots.
- Message redaction checks visibility tier, retention posture, and redaction
 proof roots before any export.
- Stream debug checks sequence continuity and completion/error closure.
- Tool policy denial checks tool call ids and policy roots, not raw arguments.
- Source selector policy checks selector kind, rights posture, and denied
 states without source samples.
- product handoff repair checks handoff roots while preserving product as
 the only transaction authority.
- Retry loop repair branches from the last source-safe checkpoint.
- Error recovery serializes only redacted error class and incident root.
- Completion repair emits a redacted completion or error row when assistant
 persistence fails.
