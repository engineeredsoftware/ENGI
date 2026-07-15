# Bitcode Spec V37 Notes

## Status

- Version: `V37`
- V37 state: canonical promotion complete; V37 notes record the accepted Conversations session, stream, writing, source selector, Terminal handoff, persistence privacy, telemetry proof, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V37`
- Canonical proof-source commit: `3df6b2cae755336067da920abbe8142df487a221`
- Current active draft target: `V37`
- Prior canonical anchor: `BITCODE_SPEC_V36.md`
- Prior generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v37-spec-family-report.json`, `.bitcode/v37-canonical-input-report.json`, `.bitcode/v37-canon-posture-drift-report.json`, `.bitcode/v37-conversation-session-route-history.json`, `.bitcode/v37-conversation-stream-event-contract.json`, `.bitcode/v37-conversation-writing-workspace.json`, `.bitcode/v37-conversation-source-selector.json`, `.bitcode/v37-conversation-terminal-handoff.json`, `.bitcode/v37-conversation-persistence-privacy-redaction.json`, `.bitcode/v37-conversation-telemetry-proof-hooks.json`, `.bitcode/v37-conversation-rehearsal.json`, `.bitcode/v37-promotion-readiness-report.json`, V37 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V37_PROVEN.md` as the generated proof appendix for V37 promotion
- Source parity state: V37 source-side ConversationSession route history, ConversationStreamEvent contracts, ConversationWritingWorkspace contracts, ConversationSourceSelector contracts, ConversationTerminalHandoff contracts, ConversationPersistencePrivacyRedaction contracts, ConversationTelemetryProofHooks contracts, ConversationRehearsal evidence, workflow, and promotion surfaces are canonicalized in the promoted V37 file family
- Scope: V37 canonical notes for Website Conversations over promoted V36 Exchange canon
- Last fully realized canonical target preserved in source: `V37`

This NOTES file does not promote V37. It is binding draft guidance while V37 gates are in flight.

## Notes companion rule

This file is the V37 notes companion.
Requirements are binding for V37 gate work while `BITCODE_SPEC.txt` remains `V36`.

## Simplified-spec reading rule

Read `BITCODE_SPEC.txt` first.
If it points to `V36`, V36 is active canon and V37 is the active draft target only when this V37 SPEC family exists on a V37 branch.
Read `BITCODE_SPEC_V37.md`, this NOTES companion, the V37 DELTA, and the V37 PARITY matrix together before implementing Conversations work.

## Concise current-system reading

V36 promotes Exchange depth after the Terminal, Reading, BTD, Auxillaries, Interfaces, Deployment, Telemetry/Docs, and Exchange spine has matured.
Website Conversations returns in V37 so it can be rebuilt around proven Protocol, Terminal, BTD, Exchange, interface, deployment, telemetry, and documentation truth.

## Intended V37 focus

V37 owns website Conversations:

- website conversation route and route-local state;
- stream UI and failure/retry states;
- fullscreen writing mode;
- conversation-to-Terminal handoff;
- source selectors and GitHub/VCS context integration;
- route-local chat history and branching;
- proof-root, policy, and read-right surfacing inside conversational UX;
- conversation-specific tests, proofs, telemetry, and public documentation.

## Boundaries

V37 must not absorb the V28 ChatGPT App MVP, V33 interface-deepening work, or V36 Exchange law.
It must use the same Protocol/Terminal/BTD registry and access-policy truth rather than becoming a parallel source of product law.

## Gate 2 implementation notes

ConversationSession route-history contracts are source-safe route contracts, not a new ledger.
Gate 2 adds `.bitcode/v37-conversation-session-route-history.json`, `buildConversationSessionRouteHistory`, route contract helpers, package tests, route tests, and `check:v37-gate2`.
The required operations are create, restore, branch, retry, redact, and stream.
Restore, branch, retry, and redaction preserve route-local history and proof roots without exposing protected source, raw protected prompts, protected model responses with source, wallet private material, provider tokens, secrets, settlement private payloads, unpaid AssetPack source, or any global ledger authority claim.

## Gate 3 implementation notes

ConversationStreamEvent stream contracts are source-safe SSE metadata
contracts, not a transcript of raw model or tool payloads. Gate 3 adds
`.bitcode/v37-conversation-stream-event-contract.json`,
`buildConversationStreamEventContract`, the route-facing stream event adapter,
package tests, route tests, UI tests, and `check:v37-gate3`.
The required event rows are model deltas, tool calls, retrieval summaries,
proof roots, retry states, completion decisions, and error rows.
The shared execution log is the canonical stream UI: collapsed rows show a
readable status, expanded rows show source-safe metadata, and the header can
surface event id, proof root, redaction posture, prompt/result disclosure
posture, and fail-closed state.
Gate 3 keeps gate-quality CI greenable by bounding the workflow runtime and
running maintained targeted package tests inside the gate job.

## Gate 4 implementation notes

ConversationWritingWorkspace contracts are source-safe fullscreen composer
contracts, not protected source storage or Terminal authority. Gate 4 adds
`.bitcode/v37-conversation-writing-workspace.json`,
`buildConversationWritingWorkspace`, the route-facing writing workspace helper,
the fullscreen workspace component, package tests, UI tests, and
`check:v37-gate4`.
The required modes are Read Request, Need feedback, AssetPack review note, and
Terminal handoff summary. The required actions are save, restore, summarize,
and handoff. Draft recovery stays route-local; emitted summaries and handoff
messages are redacted source-safe metadata only and must not expose protected
source, provider tokens, private wallet material, unpaid AssetPack source,
settlement private payloads, or global ledger authority claims.

## Gate 5 implementation notes

ConversationSourceSelector contracts are source-safe context-policy
contracts, not source disclosure or rights transfer. Gate 5 adds
`.bitcode/v37-conversation-source-selector.json`,
`buildConversationSourceSelector`, the route-facing source selector helper,
the source selector component, package tests, UI tests, and
`check:v37-gate5`.
The required selector kinds are repository, branch, commit, deposit, BTD
range, AssetPack preview, document, and prior conversation. The required
governance dimensions are account, organization, wallet, rights, settlement,
disclosure, and policy. The preview states are allowed, denied, and
retry-required, and every preview is source-safe metadata only. Full protected
source, unpaid AssetPack source, private BTD material, wallet private material,
provider tokens, protected prompts/responses, settlement private payloads, and
global ledger authority claims remain outside Conversations.

## Gate 6 implementation notes

ConversationTerminalHandoff contracts are source-safe transaction-intent
contracts, not Terminal execution, ledger writes, or wallet signing. Gate 6
adds `.bitcode/v37-conversation-terminal-handoff.json`,
`buildConversationTerminalHandoff`, the route-facing handoff helper, the
handoff component, Terminal route context parsing, package tests, UI tests,
Terminal route tests, and `check:v37-gate6`.

The required workflows are Depositing, Reading, Finding Fits, Exchange,
settlement, and delivery. Handoff envelopes may carry conversation id,
transaction id, repository anchor, source selector summaries, a source-safe
summary, policy result, Terminal route, transaction detail, proof root, and
event id. They must not carry protected source, raw protected prompts,
protected model responses with source, provider tokens, wallet private
material, settlement private payloads, unpaid AssetPack source, ledger write
authority, wallet signing authority, or a Terminal authority bypass. The
Terminal remains the transaction cockpit.

Gate 7 adds `ConversationPersistencePrivacyRedaction` so durable conversation
storage has a precise visibility tier boundary. Public, user-visible,
organization-visible, buyer-visible, reviewer-visible, and operator-only data
are separated before persistence, export, delete, retention, replay, and
incident repair. Message content, attachment metadata, execution input, and
execution metadata pass through redaction before storage. Protected prompts,
protected model responses, protected source payloads, secrets, provider
tokens, wallet private material, settlement private payloads, unpaid AssetPack
source, ledger write authority, and wallet signing authority are blocked or
redacted. Export is source-safe, delete leaves only a tombstone proof,
retention never escalates visibility, replay uses prompt template ids and
parsed result shapes, and incident repair operates over proof roots and
redaction verdicts.
Private-key PEM material is handled by bounded string scanning in the shared
conversation redaction path so malformed or unclosed private-key-shaped input
is redacted without polynomial multiline regular-expression behavior.

Gate 8 adds `ConversationTelemetryProofHooks` so conversation sessions,
messages, streams, tools, source selectors, Terminal handoffs, retries,
errors, and completions have source-safe dashboard/runbook telemetry. The
package source emits `.bitcode/v37-conversation-telemetry-proof-hooks.json`,
the API attaches telemetry proof hooks to conversation stream execution rows,
and the UI exposes a fullscreen telemetry proof panel. Telemetry proof hooks
may expose event ids, conversation ids, message ids, run ids, source selector
refs, Terminal transaction refs, state enums, counts, proof roots, dashboard
panel ids, runbook ids, and redacted error classes only. Protected prompts,
protected model responses, protected source payloads, provider tokens, wallet
private material, settlement private payloads, unpaid AssetPack source,
ledger write authority, and wallet signing authority remain forbidden.
Telemetry uses the same bounded private-key redaction before truncation so
large secret-shaped metadata cannot survive as a preview artifact.

Gate 9 closure adds `ConversationRehearsal` so local and staging-testnet
Conversations are rehearsed before promotion readiness. The package source
emits `.bitcode/v37-conversation-rehearsal.json` with
`source-safe-conversation-rehearsal-metadata`. Local and staging-testnet
rehearsals exercise chat, streaming, writing, source selector, Terminal
handoff, restore, retry, redaction, and error flows. Rehearsal
logs/screenshots are source-safe. Route/UI checks, telemetry roots, and
value-bearing mainnet blocking are visible. The fullscreen Rehearsal Proof
panel previews lane, flow, route/UI root, telemetry root, screenshot/log root,
and value-bearing mainnet blocked posture without exposing protected source,
raw prompts, raw model responses, unpaid AssetPack source, settlement private
payloads, wallet private material, ledger write authority, or wallet signing
authority.

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible.

Gate 10: V37 Promotion Readiness closes the Website Conversations draft with
package-owned `ConversationPromotionReadinessReport` source and
`.bitcode/v37-promotion-readiness-report.json`. The readiness report proves
source-safe coverage for all V37 Conversation artifacts, generated
`BITCODE_SPEC_V37_PROVEN.md` support, `v37-canon-promotion.yml`, V37 promotion
dry-run support, and runtime posture preparation from V36 active / V37 draft
to active V37 / draft V38. It blocks value-bearing mainnet admission and never
serializes credentials, protected source, raw protected prompts, unpaid
AssetPack source, wallet private material, ledger write authority, or wallet
signing authority.

## V37 gate plan

- Gate 1: V37 Conversations Roadmap And Spec Opening
- Gate 2: Conversation Session And Route History Contracts
- Gate 3: Conversation Stream UI And Event Contracts
- Gate 4: Fullscreen Writing Mode And Composer Workspace
- Gate 5: Source Selectors And Context Policy
- Gate 6: Conversation To Terminal Transaction Handoff
- Gate 7: Conversation Persistence Privacy And Redaction
- Gate 8: Conversations Telemetry Proof Hooks And Docs
- Gate 9: Local Staging Conversations Rehearsal
- Gate 10: V37 Promotion Readiness
