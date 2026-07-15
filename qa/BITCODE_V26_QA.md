# Bitcode V26 QA Guide

## Purpose

This guide records human QA for the V26 commercial promotion. It focuses on the website product and the commercial implementation of the Bitcode demonstration protocol.

Use this document to collect observations the repository cannot infer locally: browser behavior, wallet/provider account state, live API responses, database rows, network failures, and whether the commercial UI actually teaches Bitcode rather than old Engi or generic agentic SWE concepts.

Do not paste private keys, wallet secrets, OAuth tokens, API keys, or full private repository contents into issues. Redact secrets and preserve ids, timestamps, request paths, status codes, and screenshots.

## Test Session Header

Record this once per QA pass.

| Field | Value |
| --- | --- |
| Date/time | |
| Tester | |
| Browser and version | |
| OS | |
| App URL | |
| Environment mode | testnet |
| Auth state | signed out / signed in |
| Wallet provider | |
| GitHub/provider account | |
| Repository tested | |
| Database/project checked | |
| Commit under test | |

## Primary URL

Use the dev-server URL reported by the agent. For testnet validation, prefer:

```text
/terminal?environmentMode=testnet&bitcodeDebug=1
```

If the server falls back to a different port, keep the same path and query string.

## V26 Acceptance Questions

Every issue should connect to at least one of these questions.

| Area | Acceptance question |
| --- | --- |
| Spec alignment | Does the product behave like a commercial extension of `protocol-demonstration/`, not a separate product or old Engi flow? |
| Inference | Do prompts, contexts, model/provider calls, and completion payloads use Read, AssetPack evidence, Finish, Shippables, BTC fees, and non-fungible `$BTD` precisely? |
| AssetPack pipeline | Are `assetPackSynthesisArtifacts` / `writtenAssets` evidence-only, while `shippables` / `deliveryMechanism` represent GitHub pull-request delivery only? |
| Terminal | Can a user express a Read, anchor repository context, inspect activity, reread evidence, and understand closure without leaving `/terminal`? |
| Exchange | Are existing V26 Exchange surfaces minimum viable and scoped, without pretending V27/V28 tokenomics, Terminal, or market depth is complete? |
| Wallet and balances | Does the top-right balance distinguish BTC fee liquidity from non-fungible `$BTD` share/read-right holdings? |
| Providers | Do GitHub, wallet, MCP, ChatGPT App, and API surfaces fail closed when authorization or repository context is missing? |
| Storage | Do database rows preserve Bitcode fields and avoid resurrecting old deliverable/product vocabulary except as physical retained table identifiers? |
| Proof | Do visible proof/status/readiness claims match actual route, database, network, and UI behavior? |

## Website Product QA

Start at `/terminal?environmentMode=testnet&bitcodeDebug=1`.

1. Load the page signed out.
   - Record load time, visible route, console errors, and whether any old Engi, generic developer-platform, or deprecated "deliverables" language is visible.
   - Confirm `/terminal` is the primary product surface and not a marketing wrapper around a demo.

2. Sign in.
   - Record provider used and whether the app lands back on `/terminal`.
   - Confirm auth, Profile, Connects, Interfaces, and `$BTD` surfaces use Bitcode naming.

3. Inspect the top-right balance widget.
   - Confirm BTC fee liquidity and `$BTD` holdings are distinguishable.
   - Confirm `$BTD` reads as non-fungible AssetPack share/read-right, not a spendable currency token.
   - Test "Acquire $BTD" and record whether it routes toward Terminal Read submission, Exchange preview, or both.

4. Open auxillaries.
   - Check `Connects`, `Interfaces`, `Profile`, and `$BTD`.
   - Record provider readiness, wallet readiness, repository inventory source, and whether reconnect-required states are clear.

5. Use the transaction/activity workspace.
   - Select mock and live/testnet rows if available.
   - Confirm Shippables view shows AssetPack evidence and PR delivery as distinct concepts.
   - Confirm proof, history, activity, and console sections remain coherent for the same selected activity.

## Read And AssetPack Flow QA

Use a small repository or safe test branch.

| Step | Capture |
| --- | --- |
| Enter Read | Exact Read text, repository, branch, selected attachments/context |
| Read review | Review summary, accept/reject/remeasure controls, missing context warnings |
| Repository anchor | Provider, inventory source, selected repo, branch, reconnect state |
| Run start | Request path, payload shape, run id, correlation id |
| Setup/Discovery | Context shown, evidence documents, external evidence basis |
| Implementation | File changes proposed, whether evidence is called AssetPack evidence |
| Validation | Readiness/proof posture, operator-instruction prompts |
| Finish | PR URL if created, `assetPackSynthesisArtifacts`, `writtenAssets`, `shippables`, `deliveryMechanism` |
| Reread | Database row id, UI selected activity, processing stats, measured `$BTD`, BTC fee basis |

Expected V26 behavior:
- File changes and evidence live under `assetPackSynthesisArtifacts` and `writtenAssets`.
- GitHub PR delivery lives under `shippables` and `deliveryMechanism`.
- Issues, comments, and PR reviews are not separate V26 delivery mechanisms.
- No active UI or API response should expose `deliverables` as a current product field.

## Inference And Prompt QA

When a run uses model/provider infrastructure, capture:

| Field | Value |
| --- | --- |
| Provider | |
| Model | |
| Prompt/system identity visible in logs | |
| Context sources used | |
| Evidence search behavior | |
| Missing-key behavior | |
| Completion payload fields | |
| Any old vocabulary | |

Check for:
- Read-first context, not generic task execution.
- AssetPack synthesis, not generic deliverable generation.
- Finish-delivered Shippables as PR delivery only.
- BTC as fee asset and `$BTD` as measured non-fungible share/read-right.
- Fail-closed behavior when provider keys, wallet, or repository authorization are absent.

## Provider And Interface QA

Validate the minimum V26 interface set.

| Interface | What to validate | Evidence to collect |
| --- | --- | --- |
| GitHub | repo inventory, branch/PR write readiness, stale token behavior | screenshots, request paths, status codes, run ids |
| Wallet | signed wallet readiness, BTC fee liquidity display, reconnect-required states | screenshots, wallet provider, no secrets |
| MCP API | admission receipt, repository/provider ingress, permission failure | tool response, redacted payload |
| ChatGPT App | confirmation-gated writes, Bitcode naming, writeAdmission metadata | transcript excerpt, tool result |
| API routes | `/api/executions/history`, `/api/read-review`, `/api/vcs/*`, `/api/auxillaries/data` | response shape, redacted JSON |

## Storage And ORM QA

If you inspect Supabase or local database state, collect row ids and field names.

| Storage area | Expected V26 read |
| --- | --- |
| `pipeline_runs` and execution rows | Bitcode activity state, run id, status, timestamps |
| execution output | `asset_pack_completion`, `assetPackSynthesisArtifacts`, `writtenAssets`, `shippables`, `deliveryMechanism` |
| generated assets | AssetPack evidence and file-change metadata |
| vector storage | AssetPack evidence embeddings; retained physical table names are acceptable only as storage identifiers |
| user BTD tables | `$BTD` holdings/read-rights, not fungible credit spend |
| notifications/email rows | AssetPack completion, measured `$BTD`, BTC fee posture, `/terminal?transactionId=...` links |

Flag any current API/UI field named `deliverables`, `finalWorkSummary`, `credits` as product denomination, `$ENGI`, or `ENGI`.

## Demonstration Parity QA

Compare commercial behavior to `protocol-demonstration/`:

| Demonstration witness | Commercial expectation |
| --- | --- |
| Read expression | Same conceptual Read can be represented in Terminal |
| Measurement | Commercial UI explains measured Bitcode / `$BTD` without changing semantics |
| AssetPack evidence | Commercial pipeline stores richer evidence but does not change meaning |
| Finish | Commercial Finish delivers PR Shippable when available |
| Proof/reread | Commercial activity can be reread with proof/history/status |

Record any place where the commercial app contradicts the demonstration protocol rather than extending it.

## Issue Template

Use this shape for each issue.

```md
### Title

### Area
Website / inference / AssetPack / provider / wallet / storage / MCP / ChatGPT App / docs

### Expected V26 Behavior

### Actual Behavior

### Evidence
- URL:
- Screenshot:
- Console/network:
- Run id:
- Database row id:
- Redacted payload:

### Spec Link
BITCODE_SPEC_V26.md section or V26 QA section:

### Severity
Blocking / high / medium / low

### Notes
```

## Pass/Fail Summary

| Area | Pass / fail | Blocking issue ids |
| --- | --- | --- |
| Website product | | |
| Read review | | |
| AssetPack run | | |
| Finish PR delivery | | |
| Activity reread | | |
| BTC / `$BTD` balances | | |
| Provider readiness | | |
| Storage rows | | |
| MCP API | | |
| ChatGPT App | | |
| Demonstration parity | | |
