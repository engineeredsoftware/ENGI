# Bitcode Spec V37 Parity Matrix

## Status

- Version: `V37`
- V37 state: canonical promotion complete; V37 parity truth, generated Conversations artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V37`
- Canonical proof-source commit: `3df6b2cae755336067da920abbe8142df487a221`
- Prior canonical anchor: `BITCODE_SPEC_V36.md`
- Prior generated proof appendix: `BITCODE_SPEC_V36_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v37-spec-family-report.json`, `.bitcode/v37-canonical-input-report.json`, `.bitcode/v37-canon-posture-drift-report.json`, `.bitcode/v37-conversation-session-route-history.json`, `.bitcode/v37-conversation-stream-event-contract.json`, `.bitcode/v37-conversation-writing-workspace.json`, `.bitcode/v37-conversation-source-selector.json`, `.bitcode/v37-conversation-terminal-handoff.json`, `.bitcode/v37-conversation-persistence-privacy-redaction.json`, `.bitcode/v37-conversation-telemetry-proof-hooks.json`, `.bitcode/v37-conversation-rehearsal.json`, `.bitcode/v37-promotion-readiness-report.json`, V37 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V37_PROVEN.md` as the generated proof appendix for V37 promotion
- Source parity state: V37 source-side ConversationSession route history, ConversationStreamEvent contracts, ConversationWritingWorkspace contracts, ConversationSourceSelector contracts, ConversationTerminalHandoff contracts, ConversationPersistencePrivacyRedaction contracts, ConversationTelemetryProofHooks contracts, ConversationRehearsal evidence, workflow, and promotion surfaces are canonicalized in the promoted V37 file family
- Spec companion: `BITCODE_SPEC_V37.md`
- Notes companion: `BITCODE_SPEC_V37_NOTES.md`
- Delta companion: `BITCODE_SPEC_V37_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V37_PROVEN.md` only after V37 promotion
- Scope: V37 canonical parity ledger for Website Conversations over promoted V36 Exchange canon
- Last fully realized canonical target preserved in source: `V37`

## Purpose

The V37 parity matrix prevents Website Conversations from becoming UI-only chat folklore, local-only state, or a parallel product law.
Every V37 gate must name package-owned conversation objects, source-safe payloads, route-local persistence rules, proof roots, generated artifacts, validation commands, disclosure boundaries, telemetry/runbook bindings, Terminal handoff boundaries, and fail-closed repair posture.

## Audit basis

Gate 1 through Gate 6 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V36.md`
- `BITCODE_SPEC_V36_PROVEN.md`
- `BITCODE_SPEC_V37.md`
- `BITCODE_SPEC_V37_DELTA.md`
- `BITCODE_SPEC_V37_NOTES.md`
- `BITCODE_SPEC_V37_PARITY_MATRIX.md`
- `SPECIFICATIONS_ROADMAP.md`
- `README.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `packages/protocol/README.md`
- `protocol-demonstration/README.md`
- `packages/protocol/src/canon-posture.js`
- `protocol-demonstration/src/canon-posture.js`
- `packages/protocol/data/state.json`
- `scripts/check-v37-gate1-conversations-roadmap-opening.mjs`
- `packages/protocol/src/canonical/conversation-session-route-history.js`
- `packages/protocol/test/conversation-session-route-history.test.js`
- `scripts/generate-v37-conversation-session-route-history.mjs`
- `scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs`
- `.bitcode/v37-conversation-session-route-history.json`
- `apps/uapi/app/conversations/conversation-session-route-history.ts`
- `apps/uapi/tests/api/conversationSessionRouteHistory.test.ts`
- `apps/uapi/tests/api/conversationSessionRouteHistoryContract.test.ts`
- `packages/protocol/src/canonical/conversation-stream-event-contract.js`
- `packages/protocol/test/conversation-stream-event-contract.test.js`
- `packages/api/src/conversations/stream-events.ts`
- `packages/api/src/conversations/__tests__/stream-events.test.ts`
- `scripts/generate-v37-conversation-stream-event-contract.mjs`
- `scripts/check-v37-gate3-conversation-stream-event-contracts.mjs`
- `.bitcode/v37-conversation-stream-event-contract.json`
- `apps/uapi/hooks/useConversationStream.ts`
- `apps/uapi/app/conversations/components/hooks/usePipelineState.ts`
- `apps/uapi/components/base/bitcode/execution/pipeline-execution-log.tsx`
- `apps/uapi/components/base/bitcode/execution/pipeline-execution-log-header.tsx`
- `apps/uapi/tests/api/conversationStreamEventContract.test.ts`
- `apps/uapi/tests/conversationStreamPipelineLog.test.tsx`
- `packages/protocol/src/canonical/conversation-writing-workspace.js`
- `packages/protocol/test/conversation-writing-workspace.test.js`
- `scripts/generate-v37-conversation-writing-workspace.mjs`
- `scripts/check-v37-gate4-conversation-writing-workspace.mjs`
- `.bitcode/v37-conversation-writing-workspace.json`
- `apps/uapi/app/conversations/conversation-writing-workspace.ts`
- `apps/uapi/app/conversations/components/ConversationWritingWorkspace.tsx`
- `apps/uapi/tests/conversationWritingWorkspace.test.tsx`
- `packages/protocol/src/canonical/conversation-source-selector.js`
- `packages/protocol/test/conversation-source-selector.test.js`
- `scripts/generate-v37-conversation-source-selector.mjs`
- `scripts/check-v37-gate5-conversation-source-selector.mjs`
- `.bitcode/v37-conversation-source-selector.json`
- `apps/uapi/app/conversations/conversation-source-selector.ts`
- `apps/uapi/app/conversations/components/ConversationSourceSelector.tsx`
- `apps/uapi/tests/conversationSourceSelector.test.tsx`
- `packages/protocol/src/canonical/conversation-terminal-handoff.js`
- `packages/protocol/test/conversation-terminal-handoff.test.js`
- `scripts/generate-v37-conversation-terminal-handoff.mjs`
- `scripts/check-v37-gate6-conversation-terminal-handoff.mjs`
- `.bitcode/v37-conversation-terminal-handoff.json`
- `apps/uapi/app/conversations/conversation-terminal-handoff.ts`
- `apps/uapi/app/conversations/components/ConversationTerminalHandoff.tsx`
- `apps/uapi/tests/conversationTerminalHandoff.test.tsx`
- `apps/uapi/app/terminal/terminal-transaction-query.ts`
- `apps/uapi/app/terminal/TerminalPageClient.tsx`
- `packages/protocol/src/canonical/conversation-persistence-privacy-redaction.js`
- `packages/protocol/test/conversation-persistence-privacy-redaction.test.js`
- `scripts/generate-v37-conversation-persistence-privacy-redaction.mjs`
- `scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs`
- `.bitcode/v37-conversation-persistence-privacy-redaction.json`
- `packages/api/src/conversations/privacy.ts`
- `packages/api/src/conversations/messages.ts`
- `packages/api/src/conversations/__tests__/privacy.test.ts`
- `apps/uapi/app/conversations/components/ConversationPersistencePrivacyPanel.tsx`
- `apps/uapi/tests/conversationPersistencePrivacyPanel.test.tsx`
- `packages/protocol/src/canonical/conversation-telemetry-proof-hooks.js`
- `packages/protocol/test/conversation-telemetry-proof-hooks.test.js`
- `scripts/generate-v37-conversation-telemetry-proof-hooks.mjs`
- `scripts/check-v37-gate8-conversation-telemetry-proof-hooks.mjs`
- `.bitcode/v37-conversation-telemetry-proof-hooks.json`
- `packages/api/src/conversations/telemetry.ts`
- `apps/uapi/app/conversations/components/ConversationTelemetryProofPanel.tsx`
- `apps/uapi/tests/conversationTelemetryProofPanel.test.tsx`
- `packages/protocol/src/canonical/conversation-rehearsal.js`
- `packages/protocol/test/conversation-rehearsal.test.js`
- `scripts/generate-v37-conversation-rehearsal.mjs`
- `scripts/check-v37-gate9-conversation-rehearsal.mjs`
- `.bitcode/v37-conversation-rehearsal.json`
- `apps/uapi/app/conversations/conversation-rehearsal.ts`
- `apps/uapi/app/conversations/components/ConversationRehearsalPanel.tsx`
- `apps/uapi/tests/api/conversationRehearsal.test.ts`
- `apps/uapi/tests/conversationRehearsalPanel.test.tsx`
- `packages/protocol/src/canonical/conversation-promotion-readiness-report.js`
- `packages/protocol/test/v37-promotion-readiness.test.js`
- `scripts/generate-v37-promotion-readiness-report.mjs`
- `scripts/check-v37-gate10-promotion-readiness.mjs`
- `.bitcode/v37-promotion-readiness-report.json`
- `.github/workflows/v37-canon-promotion.yml`

No `_legacy/` source is active source truth.

## V37 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V37.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v37/gate-1-conversations-roadmap-opening` | closed | V37 family validates in draft mode over active V36 and `check:v37-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V36 active, V37 draft, and coherent post-V37 responsibility. |
| Conversation session and route history | Gate 2 | `ConversationSession`, `.bitcode/v37-conversation-session-route-history.json`, package source, route contracts, tests, and `check:v37-gate2` | closed | Route-local identity, route-local history, restore, branch, retry, redaction, stream, and proof roots are typed and source-safe. |
| Conversation stream events | Gate 3 | `ConversationStreamEvent`, `.bitcode/v37-conversation-stream-event-contract.json`, route-attached SSE metadata, stream UI tests, telemetry hooks, and `check:v37-gate3` | closed | Model deltas, tool calls, retrieval summaries, completion decisions, retry/error states, proof roots, collapsed readable status, expanded metadata, and disclosure posture are source-safe. |
| Writing workspace | Gate 4 | `ConversationWritingWorkspace`, `.bitcode/v37-conversation-writing-workspace.json`, fullscreen workspace UI tests, accessibility proof, and `check:v37-gate4` | closed | Read Request, Need feedback, AssetPack review notes, and Terminal handoff writing flows are accessible, restorable, and source-safe. |
| Source selectors | Gate 5 | `ConversationSourceSelector`, `.bitcode/v37-conversation-source-selector.json`, policy tests, rights checks, source selector UI tests, and `check:v37-gate5` | closed | Repository, branch, commit, deposit, BTD range, AssetPack preview, document, and prior conversation selectors are policy-gated. |
| Terminal handoff | Gate 6 | `ConversationTerminalHandoff`, `.bitcode/v37-conversation-terminal-handoff.json`, Terminal route context tests, source-safe handoff UI tests, and `check:v37-gate6` | closed | Conversations hand source-safe transaction intent to Terminal without becoming a parallel ledger/wallet authority. |
| Persistence privacy redaction | Gate 7 | `ConversationPersistencePrivacyRedaction`, `.bitcode/v37-conversation-persistence-privacy-redaction.json`, API storage redaction tests, UI privacy tests, and `check:v37-gate7` | closed | Retention, export, delete, replay, incident repair, protected prompt/model response redaction, and disclosure classes are enforced. |
| Telemetry proof hooks docs | Gate 8 | `ConversationTelemetryProofHooks`, `.bitcode/v37-conversation-telemetry-proof-hooks.json`, API stream proof hook metadata, telemetry proof UI tests, public docs, internal runbooks, and `check:v37-gate8` | closed | Conversation sessions, messages, streams, tools, selectors, handoffs, retries, errors, and completions are observable and source-safe. |
| Local staging rehearsal | Gate 9 | `ConversationRehearsal`, `.bitcode/v37-conversation-rehearsal.json`, source-safe screenshot/log roots, route/UI tests, telemetry roots, and `check:v37-gate9` | closed | Local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows; rehearsal logs/screenshots are source-safe; route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible. |
| Promotion readiness | Gate 10 | `ConversationPromotionReadinessReport`, `.bitcode/v37-promotion-readiness-report.json`, promotion workflow, generated proof support, promotion dry-run, and `check:v37-gate10` | closed | V37 can promote only after all Conversations gates pass, generated canon remains source-safe, and runtime posture can move to V37 active / draft V38. |

## V37 implementation checklist

| Area | Required V37 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V36` during V37 gate work | closed |
| Gate branch pattern | V37 work happens on `version/v37` or `v37/gate-N-*` branches | closed |
| Spec-family shape | V37 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v37-gate1` fails closed on stale posture, missing roadmap truth, missing Conversations scope, or missing workflow wiring | closed |
| Gate-quality workflow | Gate workflow validates V36 active / V37 draft posture and the V37 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V36 canon, V37 draft family when present, and V36/V37 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V36 active / V37 draft workflow | closed |
| Conversations vocabulary | V37 spec family names `ConversationSession`, `ConversationMessage`, `ConversationStreamEvent`, `ConversationWritingWorkspace`, `ConversationSourceSelector`, `ConversationTerminalHandoff`, and `ConversationPersistencePrivacyRedaction` | closed |
| ConversationSession route-history artifact | `ConversationSession` source emits `.bitcode/v37-conversation-session-route-history.json` and `check:v37-gate2` validates it | closed |
| ConversationStreamEvent artifact | `ConversationStreamEvent` source emits `.bitcode/v37-conversation-stream-event-contract.json` and `check:v37-gate3` validates it | closed |
| ConversationStreamEvent event coverage | `source-safe-conversation-stream-event-metadata` covers model deltas, tool calls, retrieval summaries, proof roots, retry states, completion decisions, and error rows | closed |
| ConversationWritingWorkspace artifact | `ConversationWritingWorkspace` source emits `.bitcode/v37-conversation-writing-workspace.json` and `check:v37-gate4` validates it | closed |
| ConversationWritingWorkspace coverage | `source-safe-conversation-writing-workspace-metadata` covers Read Request, Need feedback, AssetPack review note, Terminal handoff summary, save, restore, summarize, handoff, keyboard behavior, responsive layout, recovery state, proof roots, and event ids | closed |
| ConversationSourceSelector artifact | `ConversationSourceSelector` source emits `.bitcode/v37-conversation-source-selector.json` and `check:v37-gate5` validates it | closed |
| ConversationSourceSelector coverage | `source-safe-conversation-source-selector-metadata` covers repository, branch, commit, deposit, BTD range, AssetPack preview, document, prior conversation, account, organization, wallet, rights, settlement, disclosure, policy, allowed, denied, retry-required, proof roots, and event ids | closed |
| ConversationTerminalHandoff artifact | `ConversationTerminalHandoff` source emits `.bitcode/v37-conversation-terminal-handoff.json` and `check:v37-gate6` validates it | closed |
| ConversationTerminalHandoff coverage | `source-safe-conversation-terminal-handoff-metadata` covers Depositing, Reading, Finding Fits, Exchange, settlement, delivery, conversation id, transaction id, repository anchor, source selector refs, source-safe summary, policy result, Terminal route, transaction detail, proof roots, event ids, ledger boundary, wallet boundary, and retry posture | closed |
| ConversationPersistencePrivacyRedaction artifact | `ConversationPersistencePrivacyRedaction` source emits `.bitcode/v37-conversation-persistence-privacy-redaction.json` and `check:v37-gate7` validates it | closed |
| ConversationPersistencePrivacyRedaction coverage | `source-safe-conversation-persistence-privacy-redaction-metadata` covers public, user-visible, organization-visible, buyer-visible, reviewer-visible, operator-only visibility tier separation plus persist, restore, export, delete, retention, replay, incident repair, proof roots, and event ids | closed |
| ConversationTelemetryProofHooks artifact | `ConversationTelemetryProofHooks` source emits `.bitcode/v37-conversation-telemetry-proof-hooks.json` and `check:v37-gate8` validates it | closed |
| ConversationTelemetryProofHooks coverage | `source-safe-conversation-telemetry-proof-hooks-metadata` covers session, message, stream, tool, source selector, Terminal handoff, retry, error, completion, dashboard panels, runbook ids, correlation ids, proof roots, and telemetry roots | closed |
| Disclosure boundary | Conversations expose source-safe stream, selector, proof, handoff, and policy metadata, not protected source, secrets, wallet private material, or unpaid AssetPack contents | closed |
| Terminal handoff boundary | Terminal remains the transaction cockpit and ledger/wallet authority; Conversations prepare and hand off source-safe intent | closed |
| Privacy posture | Conversation persistence, export, delete, retention, replay, and incident repair paths preserve disclosure classes and redaction policy | closed |

## V37 Gate 2 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationSession` route history is package-owned | `packages/protocol/src/canonical/conversation-session-route-history.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated route-history artifact exists | `.bitcode/v37-conversation-session-route-history.json`, `scripts/generate-v37-conversation-session-route-history.mjs`, `pnpm run check:v37-conversation-session-route-history` | closed |
| Required session fields are covered | route-local session id, user/account posture, source context ref, policy decision, stream state, history refs, proof roots, event ids, redaction posture, and persistence boundary | closed |
| Route-local identity is explicit | every row binds route-local identity to a `ConversationSession` route contract without creating global ledger truth | closed |
| Required route contracts are covered | `/api/conversations`, `/api/conversations/[conversationId]`, `/api/conversations/stream`, `/api/conversations/[conversationId]/stream`, `/api/conversations/branch`, and shared route redaction contracts | closed |
| Required history operations are covered | create, restore, branch, retry, redact, and stream | closed |
| Route-local history stays local | every row records `routeLocalHistory: true`, `globalLedgerTruth: false`, and Terminal authority for ledger work | closed |
| Route-history payloads are source-safe | `source-safe-conversation-session-route-history-metadata`; protected source, raw protected prompts, protected model responses with source, provider tokens, wallet private material, secrets, unpaid AssetPack source, settlement private payloads, and global ledger authority claims are forbidden | closed |
| Workflow, package, and route tests are wired | `packages/protocol/test/conversation-session-route-history.test.js`, `apps/uapi/tests/api/conversationSessionRouteHistory.test.ts`, `apps/uapi/tests/api/conversationSessionRouteHistoryContract.test.ts`, `scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## V37 Gate 3 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationStreamEvent` stream metadata is package-owned | `packages/protocol/src/canonical/conversation-stream-event-contract.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated stream event artifact exists | `.bitcode/v37-conversation-stream-event-contract.json`, `scripts/generate-v37-conversation-stream-event-contract.mjs`, `pnpm run check:v37-conversation-stream-event-contract` | closed |
| Required stream event kinds are covered | model delta, tool call, retrieval summary, proof root, retry state, completion decision, and error row | closed |
| Rich stream rows are source-safe | collapsed readable status and expanded metadata carry event ids, proof roots, redaction posture, prompt/result disclosure posture, and fail-closed states without raw prompts, protected source, raw provider responses, provider tokens, wallet private material, unpaid AssetPack source, or ledger authority claims | closed |
| Route and UI stream tests are wired | `packages/api/src/conversations/stream-events.ts`, `packages/api/src/conversations/__tests__/stream-events.test.ts`, `apps/uapi/tests/api/conversationStreamEventContract.test.ts`, `apps/uapi/tests/conversationStreamPipelineLog.test.tsx`, `apps/uapi/tests/pipelineExecutionLogHeader.test.tsx`, `scripts/check-v37-gate3-conversation-stream-event-contracts.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## V37 Gate 4 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationWritingWorkspace` fullscreen composer is package-owned | `packages/protocol/src/canonical/conversation-writing-workspace.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated writing workspace artifact exists | `.bitcode/v37-conversation-writing-workspace.json`, `scripts/generate-v37-conversation-writing-workspace.mjs`, `pnpm run check:v37-conversation-writing-workspace` | closed |
| Required writing modes are covered | Read Request, Need feedback, AssetPack review note, and Terminal handoff summary modes | closed |
| Required workspace actions are covered | save, restore, summarize, and handoff actions with route-local draft keys, recovery states, keyboard behavior, responsive fullscreen layout, proof roots, and event ids | closed |
| Emitted summaries are source-safe | `apps/uapi/app/conversations/conversation-writing-workspace.ts` redacts source blocks, token-shaped values, secret fields, private keys, and JWT-shaped values before preview or handoff | closed |
| Workspace UI is accessible and wired | `apps/uapi/app/conversations/components/ConversationWritingWorkspace.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, `apps/uapi/tests/conversationWritingWorkspace.test.tsx`, `scripts/check-v37-gate4-conversation-writing-workspace.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## V37 Gate 5 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationSourceSelector` context policy is package-owned | `packages/protocol/src/canonical/conversation-source-selector.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated source selector artifact exists | `.bitcode/v37-conversation-source-selector.json`, `scripts/generate-v37-conversation-source-selector.mjs`, `pnpm run check:v37-conversation-source-selector` | closed |
| Required selector kinds are covered | repository, branch, commit, deposit, BTD range, AssetPack preview, document, and prior conversation | closed |
| Governance dimensions are covered | account, organization, wallet, rights, settlement, disclosure, and policy posture | closed |
| Preview states are explainable | allowed, denied, and retry-required previews include source-safe reason/retry metadata | closed |
| Source selector UI is wired | `apps/uapi/app/conversations/conversation-source-selector.ts`, `apps/uapi/app/conversations/components/ConversationSourceSelector.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, and `apps/uapi/tests/conversationSourceSelector.test.tsx` | closed |
| Selector previews are source-safe | protected source, unpaid AssetPack source, private BTD material, provider tokens, wallet private material, settlement private payloads, protected prompts/responses, and global ledger authority claims are forbidden | closed |
| Workflow, package, and UI tests are wired | `packages/protocol/test/conversation-source-selector.test.js`, `scripts/check-v37-gate5-conversation-source-selector.mjs`, `.github/workflows/bitcode-gate-quality.yml`, and `.github/workflows/bitcode-canon-quality.yml` | closed |

## V37 Gate 6 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationTerminalHandoff` transaction handoff is package-owned | `packages/protocol/src/canonical/conversation-terminal-handoff.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated Terminal handoff artifact exists | `.bitcode/v37-conversation-terminal-handoff.json`, `scripts/generate-v37-conversation-terminal-handoff.mjs`, `pnpm run check:v37-conversation-terminal-handoff` | closed |
| Required handoff workflows are covered | Depositing, Reading, Finding Fits, Exchange, settlement, and delivery | closed |
| Terminal remains authoritative | every row keeps Terminal as transaction cockpit and blocks conversation ledger write authority, wallet signing authority, and Terminal authority bypass | closed |
| Handoff route context is preserved | `apps/uapi/app/conversations/conversation-terminal-handoff.ts`, `apps/uapi/app/terminal/terminal-transaction-query.ts`, and `apps/uapi/app/terminal/TerminalPageClient.tsx` preserve transaction id, repository anchor, source selector refs, source-safe summary, policy result, proof root, and transaction detail | closed |
| Handoff UI is wired | `apps/uapi/app/conversations/components/ConversationTerminalHandoff.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, and `apps/uapi/tests/conversationTerminalHandoff.test.tsx` | closed |
| Handoff payloads are source-safe | protected source, raw protected prompts, protected model responses with source, unpaid AssetPack source, provider tokens, wallet private material, settlement private payloads, ledger write authority, wallet signing authority, and Terminal authority bypass are forbidden | closed |
| Workflow, package, UI, and Terminal tests are wired | `packages/protocol/test/conversation-terminal-handoff.test.js`, `scripts/check-v37-gate6-conversation-terminal-handoff.mjs`, `.github/workflows/bitcode-gate-quality.yml`, and `.github/workflows/bitcode-canon-quality.yml` | closed |

## V37 Gate 7 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationPersistencePrivacyRedaction` durable storage privacy is package-owned | `packages/protocol/src/canonical/conversation-persistence-privacy-redaction.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated persistence privacy artifact exists | `.bitcode/v37-conversation-persistence-privacy-redaction.json`, `scripts/generate-v37-conversation-persistence-privacy-redaction.mjs`, `pnpm run check:v37-conversation-persistence-privacy-redaction` | closed |
| Required visibility tiers are covered | public, user-visible, organization-visible, buyer-visible, reviewer-visible, and operator-only visibility tier separation | closed |
| Required persistence operations are covered | persist message, restore history, export history, delete history, retain history, replay history, and incident repair | closed |
| API storage path is redacted | `packages/api/src/conversations/privacy.ts`, `packages/api/src/conversations/messages.ts`, `packages/api/src/routes/conversations.ts`, and `packages/api/src/conversations/__tests__/privacy.test.ts` redact message content, attachment metadata, execution input, and execution metadata before storage | closed |
| Persistence privacy UI is wired | `apps/uapi/app/conversations/conversation-persistence-privacy-redaction.ts`, `apps/uapi/app/conversations/components/ConversationPersistencePrivacyPanel.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, `apps/uapi/tests/api/conversationPersistencePrivacyRedaction.test.ts`, and `apps/uapi/tests/conversationPersistencePrivacyPanel.test.tsx` | closed |
| Export, delete, retention, replay, and incident repair are source-safe | export emits source-safe visible tiers, delete leaves tombstone proof, retention does not escalate visibility, replay uses prompt template ids and parsed result shapes, and incident repair uses proof roots/redaction verdicts only | closed |
| Persistence payloads are source-safe | protected prompts, protected model responses with source, protected source payloads, provider tokens, wallet private material, settlement private payloads, private payment credentials, operator private notes, unpaid AssetPack source, ledger write authority, and wallet signing authority are forbidden | closed |
| Workflow, package, API, and UI tests are wired | `packages/protocol/test/conversation-persistence-privacy-redaction.test.js`, `scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs`, `.github/workflows/bitcode-gate-quality.yml`, and `.github/workflows/bitcode-canon-quality.yml` | closed |

## V37 Gate 8 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationTelemetryProofHooks` telemetry proof source is package-owned | `packages/protocol/src/canonical/conversation-telemetry-proof-hooks.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated telemetry proof artifact exists | `.bitcode/v37-conversation-telemetry-proof-hooks.json`, `scripts/generate-v37-conversation-telemetry-proof-hooks.mjs`, `pnpm run check:v37-conversation-telemetry-proof-hooks` | closed |
| Required event families are covered | session, message, stream, tool, source selector, Terminal handoff, retry, error, and completion | closed |
| Dashboard and runbook posture is source-safe | `conversation.dashboard.*` panels and `runbook.conversation.*` ids are emitted with proof roots, telemetry roots, redaction posture, source evidence roots, and replay expectations | closed |
| API stream rows carry telemetry proof hooks | `packages/api/src/conversations/telemetry.ts`, `packages/api/src/conversations/stream-events.ts`, `packages/api/src/conversations/__tests__/telemetry.test.ts`, and `packages/api/src/conversations/__tests__/stream-events.test.ts` attach source-safe dashboard/runbook metadata to execution rows | closed |
| Telemetry proof UI is wired | `apps/uapi/app/conversations/conversation-telemetry-proof-hooks.ts`, `apps/uapi/app/conversations/components/ConversationTelemetryProofPanel.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, `apps/uapi/tests/api/conversationTelemetryProofHooks.test.ts`, and `apps/uapi/tests/conversationTelemetryProofPanel.test.tsx` | closed |
| Public and internal docs are wired | `.docs/conversations.md`, `internal-.docs/BITCODE_CONVERSATIONS.md`, and `internal-.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md` explain route-local history, Terminal handoff, disclosure limits, dashboard panels, and runbook ids | closed |
| Telemetry payloads are source-safe | protected prompts, protected model responses with source, protected source payloads, provider tokens, wallet private material, settlement private payloads, private payment credentials, operator private notes, unpaid AssetPack source, ledger write authority, and wallet signing authority are forbidden | closed |
| Workflow, package, API, and UI tests are wired | `packages/protocol/test/conversation-telemetry-proof-hooks.test.js`, `scripts/check-v37-gate8-conversation-telemetry-proof-hooks.mjs`, `.github/workflows/bitcode-gate-quality.yml`, and `.github/workflows/bitcode-canon-quality.yml` | closed |

## V37 Gate 9 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationRehearsal` local/staging proof source is package-owned | `packages/protocol/src/canonical/conversation-rehearsal.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated rehearsal artifact exists | `.bitcode/v37-conversation-rehearsal.json`, `scripts/generate-v37-conversation-rehearsal.mjs`, `pnpm run check:v37-conversation-rehearsal` | closed |
| Required local/staging flows are covered | chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error | closed |
| Local and staging lanes are source-safe | local and staging-testnet rows include route/UI check roots, telemetry roots, source-safe screenshot/log roots, validation commands, proof roots, and source evidence roots | closed |
| Value-bearing mainnet is visibly blocked | `value_bearing_mainnet_blocked_conversations_rehearsal` records blocked mainnet posture, no ledger write authority, no wallet signing authority, and no source unlock | closed |
| Rehearsal UI is wired | `apps/uapi/app/conversations/conversation-rehearsal.ts`, `apps/uapi/app/conversations/components/ConversationRehearsalPanel.tsx`, `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`, `apps/uapi/tests/api/conversationRehearsal.test.ts`, and `apps/uapi/tests/conversationRehearsalPanel.test.tsx` | closed |
| Public and internal docs are wired | `.docs/conversations.md`, `internal-.docs/BITCODE_CONVERSATIONS.md`, and `internal-.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md` explain local/staging rehearsal, source-safe screenshots/logs, route/UI checks, telemetry roots, and blocked value-bearing mainnet posture | closed |
| Rehearsal payloads are source-safe | protected prompts, protected model responses with source, protected source payloads, provider tokens, wallet private material, settlement private payloads, private payment credentials, operator private notes, unpaid AssetPack source, ledger write authority, and wallet signing authority are forbidden | closed |
| Workflow, package, and UI tests are wired | `packages/protocol/test/conversation-rehearsal.test.js`, `scripts/check-v37-gate9-conversation-rehearsal.mjs`, `.github/workflows/bitcode-gate-quality.yml`, and `.github/workflows/bitcode-canon-quality.yml` | closed |

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, Terminal handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible through `source-safe-conversation-rehearsal-metadata`.

## Gate 10 Parity

| Requirement | Source evidence | Current V37 judgment |
| --- | --- | --- |
| `ConversationPromotionReadinessReport` promotion source is package-owned | `packages/protocol/src/canonical/conversation-promotion-readiness-report.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated Conversations promotion readiness artifact exists | `.bitcode/v37-promotion-readiness-report.json`, `scripts/generate-v37-promotion-readiness-report.mjs`, `pnpm run check:v37-promotion-readiness` | closed |
| All Conversations artifacts are promotion-covered | Gate 10 readiness report covers Gate 2 through Gate 9 generated Conversation artifacts plus V37 proof outputs | closed |
| V37 generated proof support exists | `packages/protocol/src/canonical/proven-generator.js`, `packages/protocol/test/v37-promotion-readiness.test.js`, and `BITCODE_SPEC_V37_PROVEN.md` generation support | closed |
| Promotion automation supports V37 | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, and `.github/workflows/v37-canon-promotion.yml` | closed |
| Runtime posture is promotable | V37 promotion rewrites V36 active / V37 draft to V37 active / draft V38 only after validation | closed |
| Promotion payloads are source-safe | credentials, protected source, raw protected prompts, unpaid AssetPack source, wallet private material, ledger write authority, and wallet signing authority are forbidden | closed |
| Static security findings block promotion | Conversation persistence and telemetry private-key redaction use bounded scanning with API tests for closed and unclosed PEM-shaped input | closed |
| Workflow and package tests are wired | `scripts/check-v37-gate10-promotion-readiness.mjs`, `.github/workflows/bitcode-gate-quality.yml`, `.github/workflows/bitcode-canon-quality.yml`, and `.github/workflows/v37-canon-promotion.yml` | closed |

## Inherited V36 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V36.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v36/gate-1-exchange-roadmap-opening` | closed | V36 family validates in draft mode over active V35 and `check:v36-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V35 active, V36 draft, and coherent V37 responsibility. |
| Exchange activity book | Gate 2 | `ExchangeActivityBook`, `.bitcode/v36-exchange-activity-book.json`, package source, tests, and `check:v36-gate2` | closed | Market-wide source-safe activity rows, filters, details, proof roots, event ids, redaction posture, and telemetry bindings exist. |
| Exchange intent and order contracts | Gate 3 | `ExchangeIntent`, `ExchangeOrder`, `.bitcode/v36-exchange-intent-order-contracts.json`, package source, tests, and `check:v36-gate3` | closed | Buy, sell, bid, ask, cancel, accept, settle, and history transitions are typed, authorized, idempotent, policy-gated, source-safe, and replayable. |
| Rights-transfer review | Gate 4 | `ExchangeRightsTransferPreview`, `.bitcode/v36-exchange-rights-transfer-review.json`, package source, tests, and `check:v36-gate4` | closed | BTD range identity, ownership, buyer, rights scope, disclosure boundary, settlement unlock, owner-read, licensed-read, and blocked transfer states are source-safe. |
| Pricing quote | Gate 5 | `ExchangePricingQuote`, `.bitcode/v36-pricing-liquidity-fee-quote.json`, package source, tests, and `check:v36-gate5` | closed | BTC price, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury/depositor/reader routes, quote roots, and fail-closed payment/network posture are deterministic. |
| Settlement reconciliation | Gate 6 | `ExchangeSettlementReceipt`, `.bitcode/v36-exchange-settlement-reconciliation.json`, observers, repair tests, and `check:v36-gate6` | closed | Payment observation, finality state, rights-transfer receipt, ledger root, database projection root, object storage root, delivery state, repair id, observer jobs, and repair jobs reconcile. |
| Dispute repair revenue routes | Gate 7 | `ExchangeDisputeRepairCase`, `ExchangeRevenueRoute`, `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, tests, and `check:v36-gate7` | closed | Disputes, repairs, revenue routes, conservation proofs, runbooks, and escalation paths exist. |
| Exchange UX and Terminal integration | Gate 8 | `ExchangeUxProof`, `/exchange`, Terminal handoff, public docs, telemetry dashboards, `.bitcode/v36-exchange-ux-proof.json`, tests, and `check:v36-gate8` | closed | Master-detail UX, filters, order history, rights-transfer review, pricing quote, settlement state, repair state, Terminal navigation, collapsed status, and source-safe expanded detail are validated. |
| Local staging rehearsal | Gate 9 | `.bitcode/v36-exchange-rehearsal.json`, local/staging logs, proof roots, and `check:v36-gate9` | closed | Local and staging-testnet list/bid/ask/cancel/accept/settle/repair/history flows are rehearsed. |
| Promotion readiness | Gate 10 | `.bitcode/v36-promotion-readiness-report.json`, promotion workflow, generated proof support, and `check:v36-gate10` | closed | V36 can promote only after all Exchange gates pass and generated canon remains source-safe. |

## V36 implementation checklist

| Area | Required V36 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V35` during V36 gate work | closed |
| Gate branch pattern | V36 work happens on `version/v36` or `v36/gate-N-*` branches | closed |
| Spec-family shape | V36 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v36-gate1` fails closed on stale posture, missing roadmap truth, missing Exchange scope, or missing workflow wiring | closed |
| Gate-quality workflow | Gate workflow validates V35 active / V36 draft posture and the V36 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V35 canon, V36 draft family when present, and V35/V36 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V35 active / V36 draft workflow | closed |
| Exchange vocabulary | V36 spec family names `ExchangeActivityBook`, `ExchangeIntent`, `ExchangeOrder`, `ExchangeRightsTransferPreview`, `ExchangePricingQuote`, `ExchangeSettlementReceipt`, `ExchangeDisputeRepairCase`, and `ExchangeRevenueRoute` | closed |
| Disclosure boundary | Exchange previews expose source-safe market, proof, fee, rights, and settlement metadata, not protected source, secrets, wallet private material, or unpaid AssetPack contents | closed |
| Ledger projection boundary | Ledger records and journals outrank Supabase/PostgreSQL projections for ownership, settlement, and finality | closed |
| Pricing determinism | Measurement weight, measurement volume, liquidity band, wrapper analysis, and BTC fee roots are auditable before settlement | closed |
| Repair posture | Dispute and repair paths exist before optimistic Exchange settlement UX is promotion-ready | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| Active canon remains V35 during V36 draft opening | `BITCODE_SPEC.txt` contains `V35` | closed |
| Runtime draft target is V36 | `packages/protocol/src/canon-posture.js` and `protocol-demonstration/src/canon-posture.js` declare V35 active and V36 draft | closed |
| V36 SPEC family exists as draft | `BITCODE_SPEC_V36.md`, DELTA, NOTES, and PARITY | closed |
| Roadmap is current | `SPECIFICATIONS_ROADMAP.md` states V35 active canon, V36 active draft target, and V37 scope | closed |
| Gate-quality workflow is V36-aware | `.github/workflows/bitcode-gate-quality.yml` | closed |
| Canon-quality workflow is V36-aware | `.github/workflows/bitcode-canon-quality.yml` | closed |
| README reflects V35/V36 posture | `README.md` | closed |
| PR template reflects V36 gate titles | `.github/pull_request_template.md` | closed |
| V36 Gate 1 checker exists | `scripts/check-v36-gate1-exchange-roadmap-opening.mjs` and package script | closed |

## Gate 2 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeActivityBook` is package-owned | `packages/protocol/src/canonical/exchange-activity-book.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated activity artifact exists | `.bitcode/v36-exchange-activity-book.json`, `scripts/generate-v36-exchange-activity-book.mjs`, `pnpm run check:v36-exchange-activity-book` | closed |
| Activity coverage is complete | listing, bid, ask, cancellation, acceptance, settlement, repair, revenue route, and history entry rows | closed |
| Activity rows are source-safe | `source-safe-exchange-activity-book-metadata`; activity detail never exposes protected source or unpaid AssetPack content | closed |
| Rows bind master-detail filters and detail sections | required filter ids and detail section ids in package source, generated artifact, and tests | closed |
| Rows bind proof roots and event ids | deterministic row roots, detail roots, proof roots, event ids, and source evidence in generated artifact | closed |
| Ledger/database projection posture is explicit | ledger references outrank database projection references in every row | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-activity-book.test.js`, `scripts/check-v36-gate2-exchange-activity-book-market-master-detail.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 3 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeIntent` and `ExchangeOrder` are package-owned | `packages/protocol/src/canonical/exchange-intent-order-contracts.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated intent/order artifact exists | `.bitcode/v36-exchange-intent-order-contracts.json`, `scripts/generate-v36-exchange-intent-order-contracts.mjs`, `pnpm run check:v36-exchange-intent-order-contracts` | closed |
| Market action coverage is complete | buy, sell, bid, ask, cancel, accept, settle, and history transition rows | closed |
| Each transition names required authority posture | actor principal, organization role, wallet posture, authority proof, idempotency key, policy decision, and fail-closed result | closed |
| Order history is source-safe and replayable | order history is replayable without private wallet material or secrets; replay material uses roots, refs, event ids, and transition identity only | closed |
| Intent/order payloads are source-safe | `source-safe-exchange-intent-order-contract-metadata`; protected source, unpaid AssetPack source, private wallet material, provider tokens, protected prompts, protected model responses, private buyer payloads, and secret values are forbidden | closed |
| Ledger/database projection posture is explicit | ledger journal refs outrank database projection refs in every order transition | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-intent-order-contracts.test.js`, `scripts/check-v36-gate3-exchange-intent-order-contracts.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 4 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeRightsTransferPreview` is package-owned | `packages/protocol/src/canonical/exchange-rights-transfer-review.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated rights-transfer artifact exists | `.bitcode/v36-exchange-rights-transfer-review.json`, `scripts/generate-v36-exchange-rights-transfer-review.mjs`, `pnpm run check:v36-exchange-rights-transfer-review` | closed |
| Required preview identity fields are covered | BTD range identity, current owner, requested buyer, rights scope, settlement unlock condition, disclosure limit, source visibility, authority posture, proof roots, event ids, and projection refs | closed |
| AssetPack source remains hidden | AssetPack source is hidden until paid settlement and rights transfer are complete | closed |
| Preview states are distinct | owner-read, licensed-read, and blocked transfer states are represented and fail closed on missing authority, stale owner, policy denial, missing receipt, or source visibility attempts | closed |
| Rights-transfer payloads are source-safe | `source-safe-exchange-rights-transfer-review-metadata`; protected source, unpaid AssetPack source, private wallet material, provider tokens, protected prompts, protected model responses, private buyer payloads, and secret values are forbidden | closed |
| Ledger/database projection posture is explicit | ledger journal refs outrank database projection refs for rights-transfer preview and owner truth | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-rights-transfer-review.test.js`, `scripts/check-v36-gate4-exchange-rights-transfer-review.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 5 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangePricingQuote` is package-owned | `packages/protocol/src/canonical/exchange-pricing-quote.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated pricing artifact exists | `.bitcode/v36-pricing-liquidity-fee-quote.json`, `scripts/generate-v36-exchange-pricing-quote.mjs`, `pnpm run check:v36-exchange-pricing-quote` | closed |
| Deterministic quote inputs are covered | BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, and quote root | closed |
| Wrapper non-fungibility boundary is enforced | wrapper analysis cannot make BTD range cells fungible chain-of-record assets | closed |
| Payment and network failures close safely | underpayment, overpayment, stale quote, or unsupported network posture fails closed | closed |
| Pricing payloads are source-safe | `source-safe-exchange-pricing-quote-metadata`; protected source, unpaid AssetPack source, private wallet material, provider tokens, protected prompts, protected model responses, private payment credentials, private buyer payloads, and secret values are forbidden | closed |
| Ledger/database projection posture is explicit | ledger journal refs outrank database projection refs for quote roots, settlement admission, route allocation, and network posture | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-pricing-quote.test.js`, `scripts/check-v36-gate5-exchange-pricing-quote.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 6 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeSettlementReceipt` is package-owned | `packages/protocol/src/canonical/exchange-settlement-reconciliation.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated settlement artifact exists | `.bitcode/v36-exchange-settlement-reconciliation.json`, `scripts/generate-v36-exchange-settlement-reconciliation.mjs`, `pnpm run check:v36-exchange-settlement-reconciliation` | closed |
| Required settlement fields are covered | payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id | closed |
| Projection reconciliation is explicit | observers and repair jobs reconcile database projections to ledger truth | closed |
| Finality and delivery are auditable | settlement finality and delivery are auditable | closed |
| Settlement payloads are source-safe | `source-safe-exchange-settlement-reconciliation-metadata`; protected source, unpaid AssetPack source, private wallet material, provider tokens, protected prompts, protected model responses, private payment credentials, object-storage private bytes, private buyer payloads, and secret values are forbidden | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-settlement-reconciliation.test.js`, `scripts/check-v36-gate6-exchange-settlement-reconciliation.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 7 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeDisputeRepairCase` and `ExchangeRevenueRoute` are package-owned | `packages/protocol/src/canonical/exchange-dispute-repair-revenue-route.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated dispute and revenue artifact exists | `.bitcode/v36-exchange-dispute-repair-revenue-route.json`, `scripts/generate-v36-exchange-dispute-repair-revenue-route.mjs`, `pnpm run check:v36-exchange-dispute-repair-revenue-route` | closed |
| Required dispute classes are covered | stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch | closed |
| Required revenue route fields are covered | depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof | closed |
| Repair operations are source-safe | runbooks and repair commands are source-safe and proof-rooted | closed |
| Escalation and verification are explicit | repair commands, verification commands, escalation paths, proof roots, and event ids are present for every dispute case | closed |
| Revenue conservation is explicit | every revenue route proves BTC debits equal credits while BTD rights and source-to-shares roots remain conserved | closed |
| Dispute and revenue payloads are source-safe | `source-safe-exchange-dispute-repair-revenue-route-metadata`; protected source, unpaid AssetPack source, private wallet material, private payment credentials, raw disputed source bytes, provider tokens, protected prompts, protected model responses, private buyer payloads, object-storage private bytes, and secret values are forbidden | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-dispute-repair-revenue-route.test.js`, `scripts/check-v36-gate7-exchange-dispute-repair-revenue-route.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 8 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeUxProof` is package-owned | `packages/protocol/src/canonical/exchange-ux-proof.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated Exchange UX artifact exists | `.bitcode/v36-exchange-ux-proof.json`, `scripts/generate-v36-exchange-ux-proof.mjs`, `pnpm run check:v36-exchange-ux-proof` | closed |
| Exchange route exposes market review | `/exchange` exposes market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state | closed |
| Terminal handoff preserves context | `buildExchangeHref`, `TerminalTransactionDetailHero`, and `apps/uapi/tests/exchangeTerminalHandoff.test.ts`; Terminal can hand off to Exchange without losing transaction context | closed |
| Collapsed and expanded disclosure is source-safe | collapsed UI gives readable status and expanded UI exposes source-safe detail | closed |
| Telemetry binding is source-safe | `source-safe-exchange-ux-proof-metadata`; Exchange telemetry dashboards remain source-safe and proof-rooted | closed |
| Workflow, package, and UI tests are wired | `packages/protocol/test/v36-exchange-ux-proof.test.js`, `apps/uapi/tests/exchangePageClient.test.tsx`, `apps/uapi/tests/exchangeTerminalHandoff.test.ts`, `scripts/check-v36-gate8-exchange-ux-proof.mjs`, `.github/workflows/bitcode-gate-quality.yml` | closed |

## Gate 9 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangeRehearsal` is package-owned | `packages/protocol/src/canonical/exchange-rehearsal.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated Exchange rehearsal artifact exists | `.bitcode/v36-exchange-rehearsal.json`, `scripts/generate-v36-exchange-rehearsal.mjs`, `pnpm run check:v36-exchange-rehearsal` | closed |
| Local and staging-testnet flows are complete | local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows | closed |
| Rehearsal evidence is source-safe | rehearsal logs/screenshots are source-safe through redacted screenshot/log roots and `source-safe-exchange-rehearsal-metadata` | closed |
| Ledger/database synchronization is visible | ledger/database synchronization and value-bearing mainnet blocking are visible through sync checks, projection roots, and blocked mainnet row posture | closed |
| Workflow and package tests are wired | `packages/protocol/test/v36-exchange-rehearsal.test.js`, `scripts/check-v36-gate9-exchange-rehearsal.mjs`, `.github/workflows/bitcode-gate-quality.yml`, `.github/workflows/bitcode-canon-quality.yml` | closed |

## Gate 10 Parity

| Requirement | Source evidence | Current V36 judgment |
| --- | --- | --- |
| `ExchangePromotionReadinessReport` is package-owned | `packages/protocol/src/canonical/exchange-promotion-readiness-report.js`, `packages/protocol/src/index.js`, `packages/protocol/src/index.d.ts` | closed |
| Generated Exchange promotion readiness artifact exists | `.bitcode/v36-promotion-readiness-report.json`, `scripts/generate-v36-promotion-readiness-report.mjs`, `pnpm run check:v36-promotion-readiness` | closed |
| All Exchange artifacts are promotion-covered | Gate 10 readiness report covers Gate 2 through Gate 9 generated Exchange artifacts plus V36 proof outputs | closed |
| Promotion scripts and workflows are V36-aware | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `.github/workflows/v36-canon-promotion.yml`, gate/canon quality workflows | closed |
| Runtime posture advances only after validation | promotion dry-run and runtime promotion support move from active V35 / draft V36 to active V36 / draft V37 only after checks pass | closed |
| Source safety and value boundaries remain enforced | `source-safe-exchange-promotion-readiness-metadata`, blocked value-bearing mainnet posture, no protected source, no unpaid AssetPack source, no wallet private material, and no secret serialization | closed |

## V37 accepted boundaries

- V37 owns Website Conversations.
- V37 inherits promoted V36 Exchange law and must not reopen Exchange ownership, pricing, settlement, rights-transfer, or disclosure rules.
- V37 does not authorize value-bearing production-mainnet launch.
- V37 does not expose protected AssetPack source before settlement through any runtime carrier, generated proof, log, interface, stream, source selector, or handoff.
- V37 does not redefine BTD supply, BTC fee separation, AssetPack range identity, owner-read/licensed-read law, measureminting, ancestry, or Reading pipeline product law.
- V37 does not replace the V28 ChatGPT App or V33 interface contract canon.

## V37 completion condition

V37 parity is complete when each Conversations gate row has source evidence, tests, generated artifacts where required, workflow/checker support, documentation, local/staging rehearsal evidence, and closed parity judgment, and when V37 promotion can rewrite `BITCODE_SPEC.txt` from `V36` to `V37` only after promotion-grade validations pass.
