# Bitcode V28 QA Ledger

## Purpose

This ledger records collaborative human QA for V28 commercial Protocol implementation and Terminal MVP hardening.
It stays synchronized as manual QA proceeds and separates V28 MVP closure from later deepening versions.

V28 is not a marketing-page review.
V28 focuses on whether the commercial Protocol implementation, Terminal, Auxillaries readiness, BTD-AssetPack mint/read posture, MCP API, ChatGPT App, wallet/BTC/testnet behavior, and ledgerized journal/projection behavior are coherent, readable, navigable, and honest over the V27 `$BTD` and crypto-commercial canon.
Exchange and the website Conversations interface are no longer V28 QA surfaces.

## Session Header

| Field | Value |
| --- | --- |
| Date | 2026-05-08 |
| Latest resume | 2026-05-13 |
| Mock app URL | `http://127.0.0.1:3000` |
| Testnet-readiness app URL | `http://127.0.0.1:3001` when a second dev server is running |
| Live staging URL | `https://bitcode.exchange`; current QA may also enter through `https://www.bitcode.exchange` while host canonicalization is being settled |
| Server mode | manual QA now prioritizes real staging-testnet with mocks off; mock mode remains a deterministic regression harness that must stay synchronized |
| Active canon pointer | `BITCODE_SPEC.txt` -> `V27` |
| Draft target | `V28` |
| Manual QA focus | real staging-testnet natural progression from wallet-backed onboarding to Terminal Read/Fit and Deposit settlement readback, with MCP/ChatGPT parity and docs-sequenced validation |
| Marketing page status | intentionally de-scoped except for navigation-entry regressions |

## V28 MVP Scope

V28 closes when the commercial app can be used and understood at MVP level across the major product surfaces:

| Surface | V28 MVP expectation | Later deepening |
| --- | --- | --- |
| Identity and authentication | Auth/profile/menu/notifications are reachable, legible, and do not block application orientation. | V31 deepens account, team, multi-sig, role, recovery, and organization controls. |
| Terminal | Activity ledger, selected detail, Deposit/Read/Fit/proof/readiness/range signals are readable and route-stable at MVP level. | V29 deepens full Terminal transactions, wallet recovery, BTC lifecycle, journal diff, and reconciliation. |
| Exchange | Not in V28; navigation is disabled/hidden and retained Exchange routes are deferred compatibility/future work. | V36+ owns Exchange MVP/deepening after V35. |
| Auxillaries | Wallet, Externals, Profile, and Interfaces panes are contained, selectable, legible, and free of active old orbital shell collision. | V31 deepens settings, provider readiness, diagnostics, policies, accessibility, and recovery flows. |
| MCP API and ChatGPT App | MVP interface ingress is present, registry-derived, fail-closed, and aligned with Terminal proof/read-right posture. | V33 deepens interfaces beyond the V28 MVP. |
| Website Conversations | Not in V28; route/widget QA is deferred and must not block promotion. | V36+ owns website Conversations after V35. |
| API/interfaces/docs | Docs and interface pages explain current MVP behavior without claiming Exchange or website Conversations readiness. | V33 deepens interfaces; V35 deepens documentation. |
| Provation/testing | E2E coverage proves current MVP route/readability/user-flow stability. | V32 deepens provation and regression breadth. |
| Deployment/telemetry | Dev/testnet readiness is honest; value-bearing mainnet is not silently enabled. | V34 deepens deployment; V35 deepens telemetry and operational documentation. |

## V28 QA Directionality

Manual QA now proceeds on two coordinated tracks instead of isolated surface review.
Every finding should be assigned to the track that revealed it and then mapped back to the owning product surface.
Every pass runs in two environment lanes:

| Lane | Purpose | Expected V28 result |
| --- | --- | --- |
| Mock | Deterministic happy-path and modeled blocked-state validation with `NEXT_PUBLIC_MASTER_MOCK_MODE=true` and provider mocks enabled. | Product behavior, copy, route state, and console cleanliness can be judged without external wallet, GitHub, broadcaster, or database volatility. |
| Testnet-readiness | Same user path with public mock flags disabled and `NEXT_PUBLIC_BITCODE_ENV=testnet`. | The app must stay navigable and honest: live-ready capabilities work when credentials/providers exist, missing credentials surface as blocked readiness, and no value-bearing mainnet behavior is silently enabled. |

The testnet-readiness lane is not a substitute for V34 deployment hardening.
For V28, it exists to catch false-positive mock success, disabled-route regressions, and unclear readiness states while the commercial MVP is still being shaped.

### Track 1: Natural Operator Progression

This track follows the order a reasonable first commercial user would experience before they understand the whole system.
It intentionally starts with prerequisites because unclear readiness blocks every later judgment.

| Step | User progression | V28 MVP questions | Primary surfaces | Later-version boundary |
| --- | --- | --- | --- | --- |
| 1A | Connect wallet, GitHub, identity/profile, and required provider prerequisites. | Can the user see what is connected, what is mocked/testnet, what is missing, and what actions remain blocked? | Auxillaries, nav/profile, Terminal readiness, BTD widget | V31 deepens account/provider recovery; V34 deepens deployment/runtime readiness. |
| 1B | Perform the fastest simple Read and read the Fit/settlement/delivery result. | Can a user express or select a Read, trigger the simplest path, and read back Fit, proof, synthetic measurement, BTD-AssetPack mint/read state, BTC fee posture, ledger journal, and delivery state without guessing? | Terminal, BTD range pages, protocol readback | V29 deepens Terminal transaction choreography; V36+ deepens Exchange market detail. |
| 1C | Perform the fastest simple Deposit and read the earning/settlement result. | Can a user contribute source, see admissibility/readiness, and understand what was earned or why earning is blocked/staged? | Terminal Deposit, Auxillaries Externals, BTD settlement reads, journal/reconciliation | V29 deepens Deposit workflows; V36+ deepens sale/bid/ask/settlement history. |

### Track 2: Docs-Sequenced Product Validation

This track follows the public docs order so the application can be checked against how Bitcode teaches itself.
The objective is not marketing critique; it is whether docs, routes, labels, controls, and visible state agree at MVP depth.

| Docs sequence | Public docs route(s) | Product validation focus | Expected V28 disposition |
| --- | --- | --- | --- |
| 00 Start Here | `/docs/what-is-bitcode`, `/docs/source-shares` | Can a new user connect Source Shares, Exchange, Terminal, Protocol, Deposit, Read, and Read to what the app actually shows? | V28 fixes contradictions; deeper explanatory polish can move to V35. |
| 01 Terminal And Protocol | `/docs/terminal`, `/docs/terminal-actions`, `/docs/read-results`, `/docs/protocol-v26` | Does Terminal own bounded Deposit/Read/operator actions with expected protocol readbacks and no Exchange dependency? | V28 blocker when product/docs disagree about ownership or action consequences. |
| 02 Operator Modes | `/docs/auxillaries`, `/docs/configuration` | Do Auxillaries and configuration/readiness copy match the visible app and fail-closed states? | V28 fixes MVP confusion; V31/V33 deepen feature sets. Website Conversations docs are deferred beyond V35. |
| 03 Protocol And Proof | `/docs/protocol-v26`, `/docs/proofs`, `/docs/settlement-btd` | Do proof, settlement, BTD, BTC, owner/licensed read, and fail-closed claims match visible reads and V27 law? | V28 fixes overclaims and missing MVP proof posture; V32/V35 deepen provation/docs. |
| 04 Commercial Interfaces | `/docs/commercial-interfaces`, `/docs/mcp-api`, `/docs/chatgpt-app` | Are API/MCP/ChatGPT/interface claims honest about V28 MVP readiness and where users verify results? | V28 fixes false commercial claims for MCP API and ChatGPT App MVP; V33 owns interface deepening beyond MVP. |

## Reordered QA Roadmap

Use this roadmap for the interactive workshop from here forward.
Each pass should be small enough to produce actionable screenshots, console observations, and route-state notes before implementation.

| Pass | Track | Scope | Stop condition |
| --- | --- | --- | --- |
| 3A | Natural progression 1A | Wallet, GitHub, profile, notifications, nav balance, Auxillaries Externals/Profile/BTD readiness. | Mock passes deterministic readiness; testnet-readiness either works live or records precise blocked provider/credential states; no console errors. |
| 3A-prereq | Natural progression 1A | Sign-up/sign-in, signed Bitcoin wallet authentication, BTC/BTD chrome, GitHub App installation, and prerequisite clarity before Deposit/Read. | Mock proves the intended prerequisite model; testnet proves or precisely blocks Supabase custom Bitcoin OAuth, wallet proof capture, profile persistence, sign-out clearing, and GitHub installation visibility. |
| 3B | Natural progression 1B | Simplest Deposit path: attach or select source first, run/inspect Deposit flow, and establish source posture before Read/Fit. | User can explain what source was contributed, how it was measured, and whether earning/BTD posture is live, mocked, or blocked. |
| 3C | Natural progression 1C | Simplest Read path after Deposit source posture exists: select/express Read, run or inspect fastest Fit path, read settlement/delivery/result state. | User can explain what matched, which Terminal/protocol readbacks were produced, what is mocked, and what remains staged or blocked in testnet-readiness. |
| 4A | Docs sequence 00 | Docs overview and Source Shares against nav, Terminal, BTD widget, MCP/ChatGPT readiness. | Contradictions between docs and product are logged in both lanes. |
| 4B | Docs sequence 01 | Terminal and Protocol docs against Terminal action/read flows and protocol readback. | Ownership of product patterns is clear in mock and still honest when live/testnet dependencies are absent. |
| 4C | Docs sequence 02 | Auxillaries and Configuration docs against app modes. | MVP readiness and fail-closed states are honest in both lanes; website Conversations is deferred. |
| 4D | Docs sequence 03 | Protocol/proof/settlement docs against visible proof, BTD, BTC, and access-policy reads. | No public docs overclaim proof/source/license/payment behavior; testnet-readiness exposes missing ledger/signer/broadcaster posture plainly. |
| 4E | Docs sequence 04 | Commercial Interfaces, MCP/API, and ChatGPT App docs against available routes/interface claims. | MCP API and ChatGPT App MVP claims are testable in V28; deeper interface claims are staged honestly for V33. |

## 2026-05-13 Real-Deployed Staging-Testnet QA Architecture

Manual QA now starts from the staging-testnet deployment path with mocks disabled.
The objective is to prove the smallest real commercial Bitcode loop:

```text
Wallet identity
  -> GitHub source scope
  -> Terminal Read
  -> Fit result
  -> AssetPack synthesis
  -> BTC/testnet ledger or blocked-readiness receipt
  -> Terminal journal
  -> Supabase/PostgreSQL projection
  -> Terminal readback
  -> Terminal Deposit
  -> earning/settlement or blocked-readiness readback
```

Mock remains required for automated and regression coverage, but human QA should now report staging-testnet evidence first.
Every testnet finding must be classified against one of these source-of-truth areas:

| Area | What QA must prove or precisely block |
| --- | --- |
| BTC/D identity | Bitcoin wallet provider detection, signed challenge, payment/auth address distinction, wallet-backed Supabase session/projection, top-chrome hydration, sign-out clearing. |
| GitHub | GitHub App install/callback, provider-scoped connection persistence, repository inventory, repository selection usable by Deposit and Read. |
| PSQL data realm | Auth users, profiles, provider connections, repository cache, BTD registry projections, Terminal journals, telemetry, and reconciliation rows match visible UI state. |
| Fit-finding | Terminal Read produces readable candidate/quality/rejection state and proof/dedupe roots before settlement. |
| AssetPack synthesis | AssetPack evidence, source manifest, semantic volume, access policy, measuremint/range or zero-cell receipt are generated or blocked with an explicit reason. |
| Ledgerized journaling | BTC fee, ledger anchor, Terminal journal, and reconciliation state are recorded as journal/projection facts rather than local-only UI decoration. |
| Pipeline runtime deployment | Runtime lane, GitHub authority, external realization, branch/source write posture, and deployment blockers are visible. |
| Telemetry and alerting | Client/server verbose logs identify wallet, GitHub, Terminal, Fit, AssetPack, ledger, database, and pipeline transitions without leaking secrets. |
| Legacy residue | Active V28 flows do not depend on Exchange, website Conversations, retired workspace routes, old orbital shell behavior, broad model selection, or explicit source versioning. |

Deterministic model rule for this QA:

- Terminal, Fit-finding, AssetPack synthesis, semantic measurement, measuremint, proof, journal, and settlement may not offer user-selected model choice.
- Protocol-specified model/configuration roots must be used for ledgerized synthesis.
- Conversation-only model preferences are allowed only if they cannot affect ledgerized Terminal/Protocol artifacts.

### Staging-Testnet Milestones

| Milestone | Operator action | Expected acceptance evidence |
| --- | --- | --- |
| 0. Environment readiness | Load `/terminal` with mock flags off, Exchange disabled, website Conversations disabled, verbose QA logging on, and Supabase/GitHub credentials configured. | Top chrome waits for wallet-state resolution before showing `Connect Wallet` or BTC/BTD facts; console has no product errors; server logs identify staging-testnet lane. |
| 1. Wallet identity | Open Wallet, connect Leather or Xverse on testnet/testnet4, approve Bitcode signing, return to app. | Wallet pane shows provider, network, payment/auth addresses, signature/proof state, BTC/BTD readout, and persistence state; top chrome replaces anonymous `Connect Wallet`. |
| 2. GitHub source scope | Open Externals, install/connect GitHub App, return from callback/setup, choose or inspect repositories. | Externals shows connected GitHub identity/installation/repository scope; Terminal can read repository inventory for Deposit/Read. |
| 3. Simple Deposit | In Terminal, attach/select source from GitHub and run the simplest Deposit path first. | Terminal shows admissibility, source root, synthetic measurement posture, earning/settlement/readiness state, journal row, and any database projection. |
| 4. Simple Read and Fit | In Terminal, use the simplest available Read path against the established Deposit/source posture. | Terminal shows Read text/scope, Fit candidate or blocker, review/proof/dedupe roots, semantic volume, and next commitment action/state. |
| 5. AssetPack and journal | Commit or inspect the staged AssetPack/Fit result. | AssetPack range or zero-cell receipt, access policy hash, BTC fee/ledger readiness, Terminal journal row, and Supabase projection are visible and diffable. |
| 6. Interface parity | Query MCP API and ChatGPT App MVP entrypoints for the same wallet/source/AssetPack/read-right state. | Interfaces read the same state as Terminal and fail closed when prerequisites are missing. |

### QA Evidence Packet

For every staging-testnet pass, paste back:

1. The exact URL and route state.
2. Screenshots for Wallet, Externals, Terminal Read result, Terminal Deposit result, and any AssetPack/BTD range readback.
3. Browser console logs, excluding known wallet-extension injection warnings unless they block Bitcode behavior.
4. Server logs for the same actions, with secrets redacted.
5. Network failures, including URL, method, status, and response body when available.
6. Supabase SQL results from the queries below.
7. A short classification for each issue: V28 blocker, V29 Terminal depth, V31 Auxillaries depth, V32 provation/testing, V33 interfaces, V34 deployment, V35 telemetry/docs, or V36+ Exchange/Conversations.

### Live Staging Host And Callback Checks

For wallet onboarding on the deployed staging-testnet host, Supabase Auth must accept both callback hostnames until Bitcode enforces one canonical host:

- `https://bitcode.exchange/tps/supabase/callback`
- `https://www.bitcode.exchange/tps/supabase/callback`

The app-internal `next` target after the callback must be `/terminal?auxillary-open-to=wallet`.
Auxillaries must never arrive as `/auxillaries/<pane>` in the active product. Retained `/auxillaries/*` and `/orbitals/*` paths are compatibility redirects into `/terminal?auxillary-open-to=<pane>`.

When Wallet opens `/tps/wallet/authorize`, the page should show Leather and Xverse if both extensions are installed and unlocked. If it initially says no provider was detected, wait a few seconds or click `Rescan wallets`; provider injection after hydration is a V28-observed browser-extension timing behavior. The fallback button may still open the hinted provider, but the expected MVP state is explicit Leather/Xverse choices plus a working fallback.

After signing, a transient root URL containing `loginError=server_error` and `both auth code and code verifier should be non-empty` is a callback idempotency failure if the session nevertheless exists. V28 expects the callback to treat an already-established Supabase session as success and continue to `/terminal?auxillary-open-to=wallet` without showing a false login error.

### Supabase SQL Checks

Run these in the staging Supabase SQL editor after each milestone and paste the result rows or any table/permission errors.
Errors are useful because missing migrations or RLS drift are V28 parity findings.
Save each query in Supabase with the `v28_qa_` name shown above it so later passes can reuse the same evidence label.

Saved query name: `v28_qa_00_initial_schema_reality`

```sql
select id, email, created_at, last_sign_in_at
from auth.users
order by created_at desc
limit 10;

select id, username, display_name, role, onboarding_step, onboarding_data, updated_at
from public.user_profiles
order by updated_at desc
limit 10;

select user_id, provider, is_active, connection_data, created_at, updated_at
from public.user_connections
order by updated_at desc
limit 20;

select user_id, provider, repo_full_name, repo_default_branch, repo_private, updated_at
from public.vcs_repositories
order by updated_at desc
limit 20;

select *
from public.btd_supply_state;

select measurement_id, asset_pack_id, normalized_bitcode_volume, token_count, created_at
from public.btd_semantic_volume_measurements
order by created_at desc
limit 20;

select receipt_id, asset_pack_id, token_count, range_start, range_end_exclusive,
       zero_cell_reason, total_minted_before, total_minted_after, created_at
from public.btd_measure_mint_receipts
order by created_at desc
limit 20;

select asset_pack_id, range_start, range_end_exclusive, token_count,
       access_policy_hash, created_at
from public.btd_asset_pack_ranges
order by created_at desc
limit 20;

select receipt_id, asset_pack_id, created_at
from public.btd_mint_receipts
order by created_at desc
limit 20;

select receipt_id, fee_purpose, payer_wallet_id, network, finality_state,
       sats_paid, txid, created_at
from public.btc_fee_transactions
order by created_at desc
limit 20;

select journal_entry_id, transaction_kind, actor_id, exchange_sequence,
       receipt_roots, ledger_anchor_ids, created_at
from public.btd_terminal_journal_entries
order by created_at desc
limit 20;

select anchor_id, asset_pack_id, chain, network, finality_state,
       commitment_method, txid_or_hash, created_at
from public.btd_asset_pack_ledger_anchors
order by created_at desc
limit 20;

select event, severity, subject_id, receipt_root, created_at
from public.btd_crypto_telemetry_events
order by created_at desc
limit 20;
```

## Running Manual QA Findings

### 2026-05-07 Pass 1: Big-Picture Identity/Auth And Auxillaries Entry

| Check | Result | Notes |
| --- | --- | --- |
| Top nav shows Exchange, Terminal, Docs, BTC, and BTD | pass | Notifications, profile menu dropdown, and logo/page indicator are present. |
| Auxillaries opens from application entry | pass | Overlay opens and panes are selectable. |
| Console after initial pass | pass | No console errors reported by manual QA. |
| Old orbital shell conflict | pass | No old orbital shell was visible in this pass. |
| Marketing page review | de-scoped | V28 manual QA now focuses on application functionality, not marketing-page critique. |

Open V28 issue from this pass:

| Issue | Severity | V28 disposition |
| --- | --- | --- |
| Auxillaries selector cards render `lane ready` / `lane active` as visible prose. These should become clearer readiness/active indicators rather than text labels. | medium | V28 MVP polish blocker for Auxillaries shell quality. |
| Auxillaries overlay and panes read minor hierarchy, legibility, spacing, and border cleanup. | medium | V28 MVP polish blocker if it impairs commercial readability; deeper settings expansion remains V31. |

Evidence:

- Screenshots supplied in chat for nav/balance/profile-menu/notifications at approximately 2026-05-07 09:41-09:42.
- Auxillaries overlay screenshot supplied in chat at approximately 2026-05-07 09:42 showing contained panes selectable, no old orbitals, and the `connection lane ready` / `identity lane active` wording issue.

### 2026-05-07 Pass 2: Terminal Big-Picture Orientation

| Check | Result | Notes |
| --- | --- | --- |
| Terminal reads as the primary operator surface | pass for V28 MVP | Acceptable at current V28 depth. Deeper Terminal clarity and operational polish belong to V29 unless a finding blocks basic V28 use. |
| Terminal owns current V28 operator flow | fail at the time | The current Terminal copy/architecture overstated master-detail and Exchange ownership. After the May 11 scope reduction, V28 keeps only the Terminal-side correction: Terminal must frame activity as recent Deposit/Read/protocol readback, not whole-Exchange market state. |
| Terminal activity table focuses Terminal results | partial | Terminal should show results of Deposit/Read/closure activity, but limited and framed around recent Terminal activity rather than whole-Exchange master state. |
| Activity ledger, selected activity detail, and support panels | partial | Support panels are broadly acceptable, but Terminal organization needs MVP cleanup before deeper manual QA can judge the dense surface confidently. |
| Deposit / Read / Fit / proof / AssetPack / BTC / BTD concepts | pending deeper manual check | Read to verify that concepts are visible enough for MVP while not claiming V29 transaction depth. |
| Activity search, row selection, and detail tabs | pending deeper manual check | Read to verify route stability, selected context, no confusing state transitions, and that table behavior feels Terminal/protocol-scoped. Exchange-wide behavior is deferred beyond V35. |
| Clickable affordance and dead-click audit | fail | Some Terminal objects appear clickable without action, while others click correctly. V28 must fix known dead targets and distinguish clickable controls from static badges/chips consistently. |
| Dense Terminal organization | partial | Density is expected, but V28 MVP must improve grouping and visual hierarchy enough that the Terminal is digestible before V29 deepens workflows. |
| Console after Terminal pass | pass | No console errors reported by manual QA. |

Open V28 issues from this pass:

| Issue | Severity | V28 disposition |
| --- | --- | --- |
| Terminal incorrectly presents itself as the master-detail surface. | high | V28 blocker only for Terminal wording/structure. Correct product architecture, copy, tests, and visible labels so Terminal is a Deposit/Read operator surface with recent activity results. Exchange product ownership is deferred beyond V35. |
| Terminal activity table should be shared infrastructure but scoped/framed to recent Terminal activity and executed Deposit/Read results. | high | V28 blocker for MVP comprehension. Deeper Terminal transaction flow remains V29. |
| Some Terminal click targets do not visibly perform an action, and static capsules can look too similar to clickable controls. | high | V28 blocker until known no-op jump targets and control/static styling are audited and corrected. |
| Terminal density and grouping are not yet digestible enough to judge deeper behavior confidently. | medium | V28 MVP polish blocker for organization only; full Terminal workflow polish is V29. |
| Active `orbitals` naming remains in source/UI/test carriers around Auxillaries. | medium | V28 cleanup target for active commercial surfaces. Redirect-only `/orbitals/*` compatibility can remain documented as compatibility until explicitly removed, but active UX copy, mock helpers, tests, and component names should converge on Auxillaries where touched. |
| Exchange selected activity detail must be complete enough for QAing activity-system reality. | high historically | No longer a V28 blocker after May 11. Deferred beyond V35 with the rest of Exchange. |
| Source code must not be explicitly versioned or gate-named. | high | V28 blocker for touched source. `AGENTS.md` now records that implementation source is implicitly versioned to active canon/current gate; Terminal runtime stylesheet files/routes/classes/tests were renamed from explicit gate names to `demonstration-witness-*` / `bitcode-demonstration-witness-*`. |

Implemented after Pass 2, pending next manual QA confirmation:

| Fix | Verification state |
| --- | --- |
| Exchange master-detail now uses the table/search/filter pane as master and a named selected activity detail pane as detail. | Historical implementation note only; no longer part of V28 proof after May 11. |
| Exchange selected detail keeps table facts and non-column facts visible through the identity/payload card on every focus. | Historical implementation note only; deferred beyond V35. |
| Terminal no longer claims master-detail; it presents recent/scoped activity plus selected result. | Focused Playwright Terminal spec passes after copy/structure update. |
| Terminal adds compact operator lanes for Recent activity, Deposit, Read, and Closure. | Focused Playwright Terminal spec checks the lane map. |
| Terminal digest actions now change selected detail focus before scrolling, closing the visible no-op class found in QA. | Focused Playwright Terminal spec clicks `Open proof detail` and verifies `transactionDetail=proofs`. |
| `/terminal` is the canonical Terminal route and the prior generic workspace route is fully retired. | Unit and E2E route expectations now point to `/terminal`; active source scans verify the prior generic workspace route is absent rather than retained as a compatibility route. |
| Active demonstration witness stylesheet source uses unversioned names. | `uapi/app/terminal/demonstration-witness-*`, `bitcode-demonstration-witness-root`, and `bitcode-demonstration-witness-stylesheet` replace the explicit gate-named stylesheet route carriers. |
| Static overview badges are quieter than actionable chips/buttons. | Requires next manual visual confirmation. |
| Active touched Auxillaries names moved from orbitals to Auxillaries in mock-mode envs, component callbacks, and commercial tests. | Source search is clean for active renamed identifiers; no route compatibility artifact is retained for the retired generic workspace. |
| Conversations split-pane source selector tolerates missing or variant repository payloads and no longer crashes the route during commercial QA. | Historical implementation note only; website Conversations is deferred beyond V35 after May 11. |
| Conversations streaming no longer aborts itself on ordinary rerenders, so the assistant response bubble completes in split-pane fullscreen QA. | Historical implementation note only; website Conversations is deferred beyond V35. |
| Direct `/conversations` fullscreen exit returns deterministically to `/terminal`. | Historical implementation note only; website Conversations is deferred beyond V35. |
| Bare Terminal route no longer auto-mutates its URL during load, while explicit route context and user selections still remain URL-addressable. | Public stitched navigation route spec passes 5-repeat focused verification and the full commercial MVP suite. |
| Terminal transaction search keeps the typed value stable while URL-backed filter state updates. | Focused Terminal activity-search E2E passes; full commercial MVP E2E passes. |
| Retired generic workspace route/import/runtime compatibility artifacts are absent from commercial source scans. | Source scans show no active retired route, generic workspace subtree, or retired-shell runtime names outside explicit historical spec notes and framework error patterns. |
| Protocol-demonstration client-entry, public mount globals, UAPI demonstration witness mocks, and demonstration state title use demonstration vocabulary rather than retired shell vocabulary. | Runtime/API scans show no retired shell names across active demonstration entrypoints. |
| Standalone demonstration is not a product runtime dependency. | `@bitcode/protocol` is the product dependency, UAPI source/tests no longer import `@bitcode/protocol-demonstration`, Terminal witness routes read `packages/protocol/public`, `protocol-demonstration` is outside `pnpm-workspace.yaml`, and bidirectional boundary tests are added. |
| Embedded demonstration witness no longer overwrites the `/terminal` document title. | Dual-lane Playwright smoke found `/terminal` rendering with the browser title `Bitcode Demonstration`; the protocol witness bundle now skips `document.title` updates when mounted under the product witness host attribute, while standalone demonstration can keep its own title. |

### 2026-05-08 Pass 3A Setup: Dual Environment Lanes

| Lane | URL | Smoke result | Notes |
| --- | --- | --- | --- |
| Mock | `http://127.0.0.1:3000/terminal` | renders HTTP 200 | Deterministic mock server remains the first pass lane. Initial automated smoke exposed a mocked `/api/vcs/github/repositories` 404 while the server was warming; follow-up smoke after the witness-title boundary fix showed no internal 404s. |
| Testnet-readiness | `http://127.0.0.1:3001/terminal` | renders HTTP 200 after cold compile | Server runs with public mock flags disabled and `NEXT_PUBLIC_BITCODE_ENV=testnet`; missing live credentials/providers are expected to appear as blocked readiness, not success. |
| Both | `/terminal` browser title | pass | Follow-up smoke confirms both lanes keep the commercial `Bitcode Terminal` document title after the embedded witness title guard. |
| Both | 2026-05-08 dev-server restart for Pass 3A | pass | Mock server restarted on `3000`; testnet-readiness server restarted on `3001`; curl and Playwright smoke confirm `/terminal` HTTP 200, `Bitcode Terminal` title, no page errors, and no non-HMR internal 404s after reload. |
| Vercel deployment build | pass after fix | Latest deployment failed because the formal `@bitcode/protocol` package exported `packages/protocol/src/index.js`, but the runtime JS source files under `packages/protocol/src/**` were still ignored as generic TS build output and therefore absent from clean Vercel clones. V28 now unignores the protocol package runtime JS and package-boundary tests, verifies required runtime files are present and not ignored, and clean-repro builds pass after those files are present. |
| Mock top chrome during 1A | pass | Manual reconfirmation on 2026-05-08 accepted the fixed mock balance, notification, and profile posture. V28 now treats master mock mode as sufficient for auxillaries mock data in client and server code, explicitly exposes public mock flags through Next config, and revalidates stale module-level user data on new mount so lane transitions cannot keep anonymous/zero cached data. |
| Dual-lane dev artifact isolation | pass | Manual reconfirmation on 2026-05-08 accepted the mock/testnet-readiness separation. V28 QA servers use lane-specific `NEXT_DIST_DIR` values so public mock env compilation is isolated per lane. |
| Mock Terminal data classification | pass | Manual QA clarified that the currently visible Terminal data is mock data because the operator is in the mock lane. This evidence remains mock-lane evidence only, not testnet-readiness evidence. |
| Testnet-readiness Terminal baseline | pass | Port `3001` API returns anonymous/empty readiness rather than mock profile/repos/balances, and browser verification renders `Bitcode Terminal` with `Connect Wallet`, no mock profile strings, no mock balances, and no product console/page errors. |

### 2026-05-13 Staging-Testnet Build Confidence Gate

| Check | Result | Evidence |
| --- | --- | --- |
| Environment file posture | pass | Populated root and UAPI `.env` files were moved out of tracking into `.env.local`; root `.env.example` and `uapi/.env.example` now carry placeholder keys only. |
| Supabase migrations | pass | CLI link was realigned to staging-testnet project `tkpyosihuouusyaxtbau`; `supabase db push --include-all` applied local migrations `001`, `002`, and `003` before the dashboard-origin RLS migration `20260510223914`; `supabase migration list` and `supabase db push --dry-run` report the remote database is up to date. |
| UAPI unit/integration tests | pass | `pnpm -C uapi exec jest --runInBand --silent`: 85 suites passed, 1 skipped; 245 tests passed, 1 skipped. Jest now exits without `--forceExit` after moving ts-jest config out of deprecated `globals`, suppressing mock-orchestrator process hooks in Jest, and unref'ing conversation streaming timers. |
| Package tests | pass | `pnpm -C packages/protocol test`, `pnpm -C packages/protocol run typecheck`, and `pnpm -C packages/orm test` pass. |
| Lint/typecheck | pass | `pnpm run lint`, `pnpm -C uapi run lint`, and `pnpm -C uapi exec tsc --noEmit --pretty false` pass. |
| Staging-testnet build | pass | `pnpm -C uapi run build` passes with staging-testnet flags, Exchange and website Conversations disabled, mocks off, and Next loading `uapi/.env.local`. Auxillaries data routes are dynamic and no longer emit build-time 500s; local Tailwind JIT noise is gone after `DEBUG=false`, and Browserslist/caniuse stale-data warning is gone after the workspace `caniuse-lite` override/install refresh. |
| Diff hygiene | pass | `git diff --check` passes. |

### 2026-05-09 Pass 3A Resume: Wallet Extension And Provider Prerequisites

This pass resumes natural progression `1A` with both lanes already running.
Mock still establishes the expected stable prerequisite posture first.
The non-mock lane then checks the real wallet-extension path, or records precisely where the commercial MVP still exposes only staged/manual wallet identity.

| Lane | URL | Status at resume | Pass intent |
| --- | --- | --- | --- |
| Mock | `http://127.0.0.1:3000/terminal` | HTTP 200 | Reconfirm that top chrome, Auxillaries Profile, Externals, and BTD wallet posture remain deterministic after the deployment-build fix. |
| Non-mock/testnet-readiness | `http://127.0.0.1:3001/terminal` | HTTP 200 | Validate real prerequisite order: Connect Wallet, identity/auth state, wallet-extension prompt if available, GitHub connection posture, and fail-closed Terminal readiness. |

V28 distinction for this pass:

| Finding type | V28 action |
| --- | --- |
| A visible `Connect Wallet` control opens an account/access pane but does not invoke a wallet extension or clearly say wallet-extension signing is staged. | V28 MVP bug: label/copy/action mismatch must be fixed before continuing deeper QA. |
| A wallet extension prompt appears and connection succeeds, but BTC/BTD/top-chrome/Auxillaries Wallet does not reflect the connected address or readiness. | V28 MVP bug: connected identity and readiness state are not coherent. |
| A wallet extension prompt appears but fails because testnet provider/network/permission is absent, while the app reports the blocker clearly and remains usable. | Acceptable V28 blocked-readiness outcome; V29/V34 may deepen live wallet and deployment operations. |
| Source truth confirms wallet-provider signing is intentionally staged and only manual wallet identity is active. | V28 must make that explicit wherever `Connect Wallet` appears; actual extension integration becomes a near-term V29/V34-boundary requirement unless the user elevates it into V28. |

Manual evidence requested for this pass:

- screenshots of mock and non-mock top chrome before interaction;
- screenshots of the non-mock `Connect Wallet` result, including any extension prompt or staged-state copy;
- screenshots of Auxillaries Wallet identity and BTD wallet posture after the attempted connection;
- console errors and network errors after each lane;
- answer whether any wallet-extension permission prompt appeared, which wallet extension/provider it was, which network/account was selected, and whether the app changed state after approval/cancel/failure.

### 2026-05-12 Pass 3A-prereq: Sign-up, Sign-in, Wallet, And GitHub Prerequisites

This pass focuses only on prerequisite reality before Terminal Deposit/Read QA continues.
It validates the V28 rule that signed Bitcoin wallet authentication is the origin point for Supabase user data synchronization, and that GitHub App installation is the next required prerequisite for Depositing and Reading.

Run the same checklist first in mock, then in testnet-readiness.
Mock establishes the intended product language and visual state.
Testnet-readiness establishes whether the live custom OAuth provider, browser wallet, Supabase session, local/server wallet persistence, BTC/BTD chrome, sign-out clearing, and GitHub App install flow are usable or precisely blocked.

Prerequisite pass stop conditions:

| Lane | Stop condition |
| --- | --- |
| Mock | Wallet shows wallet-first identity, Externals shows GitHub as the second prerequisite, Wallet/top chrome show deterministic wallet facts, sign-out clears the signed-in mock posture, and no console errors appear. |
| Testnet-readiness | A Bitcoin wallet proof either creates a Supabase session and persists through `/api/wallet/authenticate`, or fails at a named boundary: wallet provider unavailable, OAuth provider URL not reachable by Supabase, database schema missing, or GitHub App install/session missing. |

V28 prerequisite report fields:

1. Current URLs for both lanes and whether each route loaded at the top of `/terminal`.
2. Mock Wallet/Profile result: wallet-first copy, provider buttons, optional email position, BTC/BTD chrome, sign-out behavior, and console result.
3. Testnet wallet result: provider clicked, wallet prompt seen, network/account selected, signed message approved/cancelled, final URL after Supabase callback, and whether Wallet/top chrome show connected wallet.
4. Testnet network/API result: any failed request URL/status/body for `/tps/wallet/authorize`, `/api/wallet/oauth/authorization-code`, Supabase `/auth/v1/token`, `/api/wallet/oauth/token`, `/api/wallet/oauth/userinfo`, `/api/wallet/authenticate`, `/api/auxillaries/data`, and GitHub callback/setup routes.
5. Testnet sign-out result: whether Supabase session, local wallet identity, top chrome, Wallet, Profile, and Externals prerequisite state all return to unauthenticated/unconnected.
6. GitHub result: whether the install link opens `https://github.com/apps/bitcode-github-app-auxillary`, whether installation callback returns to Externals, and whether connected account/repository scope appears.
7. Screenshots of any blocked/failing state and all console errors/warnings except expected extension-injection noise.

Manual findings from 2026-05-09:

| Lane | Check | Result | V28 disposition |
| --- | --- | --- | --- |
| Mock | Top chrome | pass | Balance/nav/profile chrome is acceptable. Notification dropdown needs text wrapping and legibility polish. |
| Mock | Auxillaries Profile initial scroll | fail | Profile pane is not scrollable on first open but becomes scrollable after switching panes. V28 blocker because prerequisite settings must be reachable on first open. |
| Mock | Auxillaries save model | fail | Visible Save buttons remain in Profile, Wallet, and Interfaces. V28 must use autosave for auxillary edits and remove explicit save buttons from the contained application experience. |
| Mock | Auxillaries selector cards | fail | Cards duplicate the pane title through a top lane label plus centered title. V28 should keep the centered pane name and top-right state indicator only. |
| Mock | Auxillaries controls/layout | fail | Close and Sign Out controls should read as top-right overlay controls, not left-edge controls. The selector-side self-explainer text is unnecessary. |
| Mock | Wallet pane stats | partial | Text overflows in balance and identity cards; BTD/BTC balances read stronger visual emphasis. |
| Mock | BTD activity | missing | The Wallet pane should include the shared Terminal/Protocol activity table filtered for the user's BTD-relevant owned packs, Deposits, Reads, proof closures, ledger anchors, and synthetic measurements. |
| Mock | Console | pass | Manual QA reports clean console. |
| Non-mock/testnet-readiness | Top chrome | pass | Non-mock chrome is acceptable before interaction. |
| Non-mock/testnet-readiness | Connect Wallet entry | fail | `Connect Wallet` opens the broken legacy late-orbital onboarding shell. V28 blocker: all unauthenticated auxillaries portal entry must use the new contained Auxillaries shell and honest staged/live wallet copy. |

Profile onboarding order refined after this finding:

| Order | Required action | V28 rule |
| --- | --- | --- |
| 1 | Connect Bitcoin wallet | This is the first and minimum Bitcode identity/authentication action. It must use a Bitcoin-capable wallet provider when available, capture a Bitcode Bitcoin authentication proof when available, bind the Bitcoin address, and persist wallet-provider posture without opening an Ethereum account prompt. |
| 2 | Connect GitHub | Required for Deposit and Read because those flows read repository/source context. Terminal read-only orientation can proceed from wallet identity alone, but repository/source-scope actions must stay blocked until GitHub is connected. GitHub may be connected through OAuth when configured or through a personal access token in staging. |
| 3 | Add email | Optional. Email is for notifications, updates, and recovery/contact posture. It must not present as the primary V28 identity gate. |

Implemented after the 2026-05-09 findings, pending manual reconfirmation:

| Fix | Verification state |
| --- | --- |
| Notification dropdown wraps title/message text in a wider, more legible two-column layout without breaking item actions, and the redundant bottom `Open Auxillaries fullscreen` link is removed. | Notification unit test updated; production build passes; next manual top-chrome pass should judge visual fit. |
| Auxillaries contained portal, including unauthenticated `Connect Wallet`, uses the contained Auxillaries surface and suppresses the old ring-background onboarding shell. | Browser smoke on `3001` confirms `.auxillaries-bitcode-surface.orbital-system-application`, selector order `Externals`, `Interfaces`, `Profile`, `$BTD`, zero old login/account ring backgrounds, and no page/console errors. |
| Profile, Interfaces, and Wallet panes autosave changes and no longer expose visible auxillary Save/Continue buttons in the contained application experience. | Unit tests cover BTD and Interfaces autosave; focused Auxillaries E2E checks no visible `$BTD` Save button. |
| Auxillaries selector cards remove duplicate top lane titles, keep state as a top-right visual indicator with accessible state metadata, and reserve enough top padding for hover lift without clipping the first card border. | Focused Auxillaries E2E still passes route-card and pane-tab navigation; selector hover padding is source-fixed for next manual confirmation. |
| Overlay controls are aligned as top-right close/sign-out controls and the selector-side self-explainer copy is removed. | Production build passes; next manual Auxillaries pass should judge spacing. |
| First-open Profile scrolling is stabilized by forcing the contained Auxillaries surface out of global `content-visibility:auto` intrinsic sizing. | Non-mock browser smoke scrolls the Profile pane on first portal open; next mock manual pass should confirm the originally reported first-render case. |
| BTD/BTC statistics use a hierarchy matching the QA direction: large BTD balance row, sub-stat row for owned AssetPacks and BTC in wallet, then compact identity/policy cards. | Typecheck, focused unit tests, focused Auxillaries E2E, and production build pass; next manual Wallet pane pass should judge vibrancy/legibility. |
| Auxillaries stat-card explanatory prose is no longer adjacent to user values; each explanation is carried by tooltip/accessible label on the value card. | Wallet pane tests updated to query tooltip/aria descriptions rather than visible prose. |
| Wallet pane includes the shared Terminal/Protocol activity table for BTD-relevant activity and keeps connected-repository consent tests scoped to their own table. | Focused Auxillaries E2E passes all 10 tests. |
| Non-mock prerequisite posture is narrowed to Bitcoin wallet authentication and GitHub repository connection for V28. | Browser smoke on `3001` confirms Profile contains Bitcoin wallet and GitHub, does not expose Google as a prerequisite, and keeps the same contained Auxillaries shell/order as mock. |
| Auxillaries onboarding has been refurbished to Wallet-first, Externals/GitHub-second, Profile optional-email-third. | Typecheck passes; wallet-auth route unit tests pass; next non-mock manual QA must run against real Xverse/Leather and staging/testnet credentials. |
| Bitcoin wallet authentication persists through a dedicated wallet route instead of the generic Profile route. | `/api/wallet/authenticate` accepts Bitcoin-provider proof posture, rejects Ethereum/EVM wallet submissions, saves profile wallet binding when a Bitcode session exists, and stores wallet-provider connection posture; the client stages the Bitcoin identity locally if staging auth is unavailable. |
| Wallet shows provider-specific wallet connect actions instead of one silent generic path. | Source now detects Xverse/Sats Connect and Leather separately, renders direct provider actions, shows the detected-provider status line, adds timeout-backed wallet request errors, and unit-tests that Leather can be selected even when Xverse is installed. Stubbed browser smoke verifies the Leather click calls `getAddresses` and `signMessage`. Live Xverse/Leather extension QA remains pending. |
| Contained Wallet connection must not become progressive onboarding. | Manual QA confirmed Leather worked, then found the route force-bumped to Externals and emitted unauthenticated onboarding/Supabase placeholder errors. Source now treats contained Auxillaries routes as product settings surfaces, suppresses `/api/auxillaries/onboarding` completion there, keeps Wallet selected after wallet connection, and avoids Supabase anonymous signup attempts when staging credentials are placeholders. |
| Staging database can store non-GitHub provider posture in `user_connections`. | Added migration `supabase/migrations/003_user_connections_provider_scope.sql`; staging/testnet verification must apply this before wallet-provider persistence can succeed. |

Manual console classification after Leather connection:

| Console message class | V28 disposition |
| --- | --- |
| `SES Removing unpermitted intrinsics`, Xverse `StacksProvider` redefine warning, React DevTools prompt, and Vercel Analytics/Speed Insights development debug messages | external/dev-tool noise; record only if they correlate with app behavior failure |
| `/api/auxillaries/onboarding 401` after contained Wallet connection | V28 bug, fixed by separating contained Auxillaries from progressive onboarding completion |
| Supabase placeholder signup request to `https://your-project.supabase.co/auth/v1/signup` | V28 bug, fixed by guarding server wallet persistence when staging Supabase env vars are placeholders |

Non-mock prerequisites for the next QA3.1 pass:

- Xverse and Leather installed and unlocked in the Chrome profile. Test Xverse first on Testnet4, then Leather on its documented testnet lane.
- MetaMask alone is not sufficient for this V28 QA path unless it exposes a Bitcoin dapp-provider API; Bitcode must not open the injected Ethereum provider for Bitcoin identity. If only a MetaMask Bitcoin address is available, stage that Bitcoin address manually and record the fallback.
- Staging/testnet Supabase session persistence configured for backend wallet binding. If staging auth is unavailable, Profile should still show the locally staged Bitcoin identity and clearly note backend persistence as pending.
- Latest Supabase migrations applied, including `003_user_connections_provider_scope.sql`.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and service role/server Supabase env values configured for the staging lane.
- GitHub OAuth callback configured for the staging origin, or a GitHub personal access token available for the VCS panel fallback.
- Public mock flags disabled for the non-mock lane.

QA3.1 prerequisite onboarding script:

| Lane | Step | Manual action | Expected V28 observation |
| --- | --- | --- | --- |
| Mock | 1 | Open `/terminal`, then open Auxillaries and select Wallet. | The contained Auxillaries shell opens with the same selector order and visual language as non-mock. Wallet owns Bitcoin wallet identity, Externals owns GitHub, and Profile owns optional email/account metadata. Mock fields may already be populated, but the order must remain visible. |
| Mock | 2 | Scroll Wallet/Profile from first open without switching panes first. | The right pane scrolls immediately, no first-render scroll dead zone appears, and no visible Save/Continue controls are required for auxillary edits. |
| Mock | 3 | Confirm Wallet pane and top chrome remain hydrated. | BTC/BTD values show the mock wallet posture after the loading state, BTD activity is visible through the shared Terminal/Protocol table grammar, and no console errors appear. |
| Non-mock | 1 | Open `/terminal` on the staging/testnet lane with mock flags disabled. | Top chrome is anonymous until a wallet session exists. `Connect Wallet` or Auxillaries opens the contained Auxillaries overlay on Wallet, not the retired direct-route shell. |
| Non-mock | 2 | In Wallet with Xverse and Leather unlocked on Testnet4, confirm the provider status line says `Detected Xverse, Leather` or accurately names the installed Bitcoin wallets. Click `Connect Xverse` first. | Xverse/Sats Connect requests wallet connection for payment plus ordinals addresses and then requests a BIP322 message proof. The app must not ask for email first and must not open an Ethereum account prompt. If no prompt appears, capture the exact provider status line and inline message, then click `Rescan wallets`. |
| Non-mock | 3 | Approve the Xverse connection and proof. | The Wallet state becomes connected, the Taproot/ordinals auth address appears in the wallet field when available, refresh preserves website-side wallet state, and the console remains free of product errors. If backend persistence is unavailable, the UI should say server persistence is pending while local staging remains visible. Capture the exact inline message and Network response for `/api/wallet/authenticate` when a backend request occurs. |
| Non-mock | 4 | Return to Wallet and click `Connect Leather` directly. Do this even if Xverse is installed so the Leather path is verified independently. | Leather returns addresses through `getAddresses`, Bitcode selects the BTC Taproot address when present without relying on array indexes, signs with `signMessage`, and stores the Native SegWit payment address separately from the auth address. |
| Non-mock | 5 | If only MetaMask BTC is available, paste the displayed `bc1...`/`tb1...` address in Wallet and click `Stage Bitcoin address`. | No Ethereum prompt opens. Wallet shows locally staged Bitcoin identity and clearly marks backend/provider proof as pending/manual. |
| Non-mock | 6 | Connect GitHub from Externals using OAuth or the staging token fallback. | GitHub becomes connected for Deposit/Read readiness. Terminal read-only orientation must not be blocked by GitHub, but Terminal Deposit/Read actions should reflect repository scope once connected. |
| Non-mock | 7 | Optionally add email from Profile. | Email is presented only as notifications/updates/recovery posture. It must not replace wallet authentication, and the user can leave it blank without breaking wallet, GitHub, or Terminal readiness. |

QA3.1 reply template:

1. Mock Profile order, first-open scroll, BTD/top-chrome hydration, and console result.
2. Xverse Testnet4 prompt result: connection prompt, BIP322 proof prompt, selected address shown in Bitcode, and whether refresh preserved it.
3. Leather prompt result: `getAddresses` approval/proof result, selected address shown in Bitcode, and whether refresh preserved it.
4. Non-mock `/api/wallet/authenticate` result for each wallet: success, exact inline error, or exact Network response.
5. Non-mock GitHub connection result: OAuth or token fallback, connected account/repo visibility, and any error copy.
6. Optional email result if attempted; otherwise confirm it remained optional and ungating.
7. Screenshots of any visual mismatch, especially Profile ordering, contained shell mismatch, scroll failure, or legacy shell reappearance.

### 2026-05-08 Pass 3A: Auxillaries Profile And Externals Readiness

| Check | Result | Notes |
| --- | --- | --- |
| Auxillaries overlay opens and pane selection works | pass | Manual QA confirmed the overlay opens and panes remain selectable. |
| Inner pane scrolling | fixed | Manual QA found the contained pane could not scroll down. V28 now constrains the overlay shell height, keeps the pane as the scroll container, and verifies the active pane can advance `scrollTop` with `overflowY:auto`. |
| Selector card state rendering | fixed | Manual QA found raw `laneactive` / `laneready` text. V28 replaces visible state prose with active/ready/locked visual indicators and keeps state available through `aria-label`, `title`, and `data-state` for accessibility and tests. |
| Mock profile fields | fixed | Manual QA confirmed email but found display name and bio missing. V28 now hydrates async initial profile props into local editable state and mock data supplies display name, bio, and company posture. |
| Connected repositories | pass | Manual QA confirmed mocked connected repos; browser verification confirms `Connected Repositories (3)` and `bitcode/economic-ledger` render in Externals. |
| BTD/BTC first-load posture | fixed | Manual QA found the top-right widget flashing anonymous zero-state before hydrated values. V28 now surfaces a compact `Reading wallet` posture while fresh lane-specific user data is loading or revalidating stale cached zero-state. |
| Fullscreen overlay viewport fit | fixed | Manual QA found a bottom gap approximately the height of the navigation/chrome after opening Auxillaries fullscreen from Terminal. V28 now lets the overlay shell fill the available viewport height and anchors the shell to the bottom edge while keeping overlay overflow hidden. |
| Profile scroll quality | fixed | Manual QA found Profile auxillary scrolling technically worked but felt poor. V28 now constrains the right pane as a true `height:100%` scroll container, prevents selector/pane grid-row overflow, and tightens Profile vertical rhythm so lower wallet/access/provider controls stay reachable in the contained pane. |
| Auxillaries menu icon | fixed | Manual QA found the account-menu Auxillaries entry had lost the more elegant animated solar-system cue from the late-Engi era. V28 restores the visual language as an Auxillaries-named animated solar icon without reverting product copy or route naming to Orbitals. |
| Console/page errors | pass | Manual QA reported none; focused browser verification reports no product console messages and no page errors. |

Automated verification for this slice:

- `pnpm -C uapi exec jest --runInBand tests/useUserDataHydration.test.tsx tests/btdTrackerLoading.test.tsx tests/auxillariesWorkspacePanels.test.tsx tests/featureFlagsMockMode.test.ts`: pass.
- `pnpm -C uapi exec playwright test tests/e2e/commercial-mvp.auxillaries.spec.ts --project=laptop --workers=1`: 10 passed, including the Terminal fullscreen Auxillaries viewport/scroll assertion and contained portal-entry regression.
- Focused browser verification on the mock lane: raw lane text count `0`, state indicator count `4`, Profile display name `Avery Mercer`, Profile bio `Reviewing the Bitcode commercial surface in deterministic mock mode.`, shell bottom gap `0`, pane bottom overflow `0`, pane `scrollTop` advances, explicit auxillary Save buttons are removed in favor of autosave, Externals repos present, no product console/page errors.

Deferred to V31 from this pass:

| Finding | V31 disposition |
| --- | --- |
| Auxillaries pane hierarchy, spacing, border polish, readiness recovery, and account/provider diagnostics can deepen beyond the V28 MVP shell. | V31 owns full Auxillaries deepening after V28 proves the contained shell, pane selectability, mocked prerequisites, and fail-closed readiness posture. |

Ignored during this setup smoke: Google Analytics network aborts in headless Playwright.
They are external telemetry noise, not product readiness evidence.

Automated verification after this implementation pass:

- `pnpm -C uapi exec tsc --noEmit --pretty false`: pass after the May 9 Auxillaries/Profile/BTD/notification refinements.
- `pnpm -C uapi exec jest --runInBand tests/auxillariesWalletPane.test.tsx tests/notificationsWidget.test.tsx tests/orbitalsInterfacesPane.test.tsx`: 9 passed after the BTD hierarchy, tooltip, notification-footer, and autosave assertions.
- `START_STORYBOOK=false pnpm -C uapi exec playwright test tests/e2e/commercial-mvp.auxillaries.spec.ts --project=laptop --workers=1`: 10 passed after contained shell and pane-state refinements.
- `pnpm -C uapi run build`: pass after the May 9 QA fixes; the prior clean-clone Vercel module-resolution failure remains fixed locally.
- Playwright non-mock browser smoke after the May 9 patch: `Connect Wallet` opens the contained Auxillaries shell, selector order is `Externals`, `Interfaces`, `Profile`, `Wallet`, old-ring count is `0`, Google prerequisite copy is absent, MetaMask and GitHub are present, no visible Save/Continue buttons remain, Profile first-open scroll advances, and no console/page errors occur.
- May 9 live Leather QA: wallet connection persisted, but follow-up findings required V28 fixes for wallet-authenticated nav chrome, Wallet/Profile/Externals ownership, robust connected-wallet readout, Sign Out button styling, BTD tracker wallet identity action, and verbose console telemetry. Source now treats local Bitcoin wallet identity as sufficient chrome identity while backend persistence catches up; Wallet owns crypto wallet identity and BTD/BTC posture; Profile owns optional email/contact/admin posture; Externals owns GitHub; the BTD tracker opens the Wallet auxillary pane; and verbose QA logs are gated behind `NEXT_PUBLIC_BITCODE_QA_VERBOSE=true`, `NEXT_PUBLIC_BITCODE_VERBOSE=true`, `?bitcode_verbose=true`, or `localStorage.bitcode.qa.verbose=true`.
- May 9 follow-up QA found Externals still showing the old signed-in blocker after the Bitcoin wallet was correctly connected. V28 fixes Externals to render GitHub controls from wallet identity or email session, so Wallet completion can progress directly into repository connection without waiting on optional email/Supabase persistence.
- May 11 externality-readiness check validates the provided GitHub App identity without writing secrets to source: the private key parses, GitHub API returns App ID `244206`, app slug `engi-software-agents`, and the supplied client ID matches the app record. The app can list installations and create an installation token for at least one installation. Initial check found it was not installed on `engineeredsoftware/ENGI`.
- May 12 externality-readiness recheck confirms the GitHub App is now installed on `engineeredsoftware/ENGI`: `GET /repos/engineeredsoftware/ENGI/installation` returns 200, installation token creation returns 201, `engineeredsoftware/ENGI` is readable, default branch is `main`, and `BITCODE_SPEC.txt` is readable through the app installation token. GitHub App externality is ready for V28 Terminal Deposit/Read QA against ENGI.
- May 12 Supabase readiness resolves project reachability and key acceptance but remains blocked on database schema. The project URL is reachable, auth settings return 200 with the supplied publishable key, and the secret key is accepted by the Supabase API gateway. Core Bitcode tables including `user_profiles`, `user_connections`, `vcs_repositories`, `btd_asset_pack_ranges`, and `btd_mint_receipts` return `PGRST205` table-not-found responses, so migrations have not been applied to this testnet project yet. Source now accepts both the older `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` names and the newer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` names so the provided testnet variables can be used directly after migration.
- May 12 GitHub App setup/callback hardening: the active install link is now `https://github.com/apps/bitcode-github-app-auxillary` in Auxillaries and docs-facing surfaces. The retained public callback route `/github/callback` redirects to `/tps/github/callback`, and the retained setup route `/github/setup` redirects to `/tps/github/app-install`, preserving query fields. The callback handler collects GitHub App installation fields including `installation_id`, `setup_action`, `state`, `target_id`, and `target_type`; when a Supabase user session exists it exchanges the installation for an installation token and stores the GitHub connection as installation-scoped metadata without exposing tokens in client connection status. The GitHub App description copy for the registration form is: `Connect GitHub repositories to Bitcode so Terminal can measure Reads, synthesize BTD-backed AssetPacks, and return proof-bound delivery status.`
- Recommended GitHub App URLs for production registration: homepage `https://bitcode.exchange`, callback URL `https://bitcode.exchange/github/callback`, setup URL `https://bitcode.exchange/github/setup`, public app link `https://github.com/apps/bitcode-github-app-auxillary`. For local callback QA, add a temporary allowed callback/setup pair for the active local port or use the deployed staging domain; GitHub App setup redirects do not inherit the browser's local origin automatically.
- `pnpm -C uapi exec jest --runInBand tests/api/vcsRoutes.test.ts tests/api/vcsGithubCallbackRoute.test.ts tests/auxillariesConnectsPane.test.tsx tests/publicDocsPageContent.test.tsx`: 11 passed after GitHub App install-link and callback/setup handling.
- `pnpm -C uapi exec jest --runInBand --testMatch '**/tests/userConnectionsGithubRoute.test.ts'`: 6 passed after GitHub connection-status token redaction.
- `pnpm -C uapi exec tsc --noEmit --pretty false`: pass after GitHub App callback/setup and public install-link wiring.
- `pnpm -C uapi run build`: pass after GitHub App callback/setup and public install-link wiring.
- May 12 Bitcoin wallet auth formalization: V28 no longer uses anonymous Supabase sign-in as the wallet persistence origin. Wallet starts Supabase custom OAuth through `custom:bitcode-bitcoin`, `/tps/wallet/authorize` captures the signed wallet proof, `/api/wallet/oauth/token` and `/api/wallet/oauth/userinfo` let Supabase create the user session, and Wallet then synchronizes the same wallet proof into `/api/wallet/authenticate`.
- Supabase custom provider dashboard values for testnet: provider type `OAuth2`, identifier `custom:bitcode-bitcoin`, name `Bitcode Bitcoin Wallet`, authorization URL `<public staging-or-tunnel origin>/tps/wallet/authorize`, token URL `<public staging-or-tunnel origin>/api/wallet/oauth/token`, userinfo URL `<public staging-or-tunnel origin>/api/wallet/oauth/userinfo`, scopes `profile wallet:bitcoin`, PKCE enabled, and email optional enabled. Cloud Supabase cannot call `127.0.0.1` token/userinfo URLs, so local QA needs either a deployed preview/staging origin or a tunnel that uses the same OAuth client secret as the local lane.
- Required matching app env for testnet lane: `BITCODE_BITCOIN_OAUTH_CLIENT_ID=<same client id configured in Supabase>`, `BITCODE_BITCOIN_OAUTH_CLIENT_SECRET=<same client secret configured in Supabase>`, `BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS=https://tkpyosihuouusyaxtbau.supabase.co`, and `BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_URIS=https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback` if the Supabase URL env is unavailable, plus the existing Supabase publishable/secret keys.
- May 13 Leather reconnect QA classified the wallet provider path as working but the Supabase custom-OAuth exchange as blocked: Bitcode issued `wallet-oauth:authorization-code-issued` for Leather on testnet, local wallet identity hydrated in top chrome, but Supabase returned `server_error: Unable to exchange external code` and no `wallet-oauth:token-issued` telemetry appeared. Do not rerun Leather until the Supabase provider token/userinfo URLs are confirmed public-reachable from Supabase and configured with the same Bitcoin OAuth client secret. V28 now surfaces the full `loginErrorDescription` toast and adds a Wallet-pane `Disconnect wallet` action that clears the Bitcode-local wallet/session state while accurately noting that Leather/Xverse extension permissions may read revocation inside the wallet.
- May 13 Leather documentation ingestion closes the adapter contract for V28 implementation preparation. Leather support is through `window.LeatherProvider.request`, with `getAddresses` selected by BTC `symbol`/`type` rather than index, Taproot `p2tr` preferred for Bitcode auth, Native SegWit `p2wpkh` retained for payment, account derived from the returned derivation path, and explicit `signMessage` parameters. V28 source now also exposes tested Leather utilities for `open`, hex `signPsbt`, and `sendTransfer`; Terminal BTC-fee/PSBT work can call those utilities later without redefining the wallet provider contract.
- `pnpm -C uapi exec jest --runInBand tests/api/walletOAuthRoutes.test.ts tests/api/walletAuthenticateRoute.test.ts`: 9 passed after Bitcoin wallet custom OAuth implementation.
- `pnpm -C uapi exec tsc --noEmit --pretty false`: pass after Bitcoin wallet custom OAuth implementation.
- `pnpm -C uapi exec tsc --noEmit --pretty false`: pass after the formal protocol package split.
- `pnpm -C uapi run test:e2e:commercial-mvp`: 50 passed after Conversations streaming, Conversations exit, and Terminal transaction-search stabilization.
- `npm --prefix protocol-demonstration run test:integration`: 58 passed after standalone demonstration/package-boundary cleanup.
- `npm --prefix protocol-demonstration run test:v27-crypto`: 9 passed after standalone demonstration/package-boundary cleanup.
- `npm --prefix protocol-demonstration run test:v28-mvp-qa`: 13 passed after adding the boundary-separation and local Need-Fit witness checks.
- `pnpm -C uapi exec jest --runInBand tests/demonstrationWitnessMount.test.tsx tests/demonstrationWitnessScopedStylesRoute.test.ts tests/terminalPreservedShellSurface.test.tsx tests/terminalShellBridge.test.tsx tests/marketingLandingPage.test.tsx tests/api/readReviewProtocolParity.test.ts tests/api/bitcodeAppContextOptions.test.ts tests/protocolCommercialBoundary.test.ts`: 18 passed after the formal protocol package split.
- `node --test --test-force-exit protocol-demonstration/test/v28-boundary-separation.test.js`: 2 passed after the formal package split.
- `pnpm -C packages/protocol test`: 2 passed after the formal package split and protocol runtime-source deployment fix.
- `pnpm -C packages/protocol run typecheck`: pass after adding the formal package typecheck config.
- `pnpm -C uapi exec jest --runInBand tests/protocolCommercialBoundary.test.ts`: 5 passed after adding the formal protocol deployment-source boundary check.
- `pnpm -C uapi exec jest --runInBand tests/useUserDataHydration.test.tsx tests/featureFlagsMockMode.test.ts tests/protocolCommercialBoundary.test.ts`: 11 passed after the mock top-chrome cache/flag fix, JavaScript companion parity check, and protocol package resolver check.
- Playwright dual-lane browser verification after lane-specific `NEXT_DIST_DIR` restart: mock lane shows `0.042 BTC`, `1,200 BTD`, mock review state, reviewer profile, and populated notifications; testnet-readiness lane shows no mock balances, no mock review state, and the Connect Wallet prerequisite controls; both lanes have no product console/page errors.

Deferred to V29 from this pass:

| Finding | V29 disposition |
| --- | --- |
| Terminal prose clarity can improve while maintaining technical accuracy. | V29 Terminal-focused version should rewrite and refine Terminal copy, explainers, labels, and read/write guidance as part of deeper Terminal workflows. |
| Terminal transaction sequencing, dense workflow hierarchy, and deeper Deposit/Read/Fit/settlement ergonomics read a dedicated version. | V29 owns full Terminal workflow deepening after V28 fixes MVP architecture and obvious clickability/organization problems. |

## Current QA Queue

1. Live staging-testnet Pass 2A: Terminal Deposit/Read/Fit write-read parity after Wallet and GitHub prerequisites.
2. Live staging-testnet branch/settlement blocked-readiness or branch-write proof from the Terminal command deck.
3. Mock-lane regression parity for the same Terminal Deposit/Read/Fit actions after live behavior is clarified.
4. MCP API and ChatGPT App MVP readiness in Mock lane, then Testnet-readiness lane.
5. Docs sequence 00-04 in Mock lane, then Testnet-readiness lane where the route depends on live/provider state.

Exchange and website Conversations are removed from the V28 QA queue.
If they appear through retained routes, footer links, docs, or old E2E files, classify that as deferred compatibility unless it contaminates Terminal, Protocol, BTD, MCP API, or ChatGPT App behavior.

## Environment Lane Commands

Mock lane dev server:

```sh
NEXT_PUBLIC_MASTER_MOCK_MODE=true \
NEXT_DIST_DIR=.next-v28-mock \
NEXT_PUBLIC_ENABLE_MOCKS=true \
NEXT_PUBLIC_MOCK_USER_AUXILLARIES=true \
NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO=demo \
NEXT_PUBLIC_MOCK_SCENARIO=demo \
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=true \
NEXT_PUBLIC_MOCK_GITHUB_REPOS=true \
NEXT_PUBLIC_MOCK_GITHUB_BRANCHES=true \
NEXT_PUBLIC_MOCK_GITHUB_COMMITS=true \
NEXT_PUBLIC_MOCK_CHAT_STREAM=false \
NEXT_PUBLIC_CONVERSATIONS_WIDGET=false \
NEXT_PUBLIC_CONVERSATION_SECTION=false \
NEXT_PUBLIC_DISABLE_EXCHANGE_LINK=true \
NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE=true \
NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE=true \
NEXT_PUBLIC_DISABLE_AUXILLARIES=false \
NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT=false \
NEXT_PUBLIC_MCP_UPGRADES=true \
NEXT_PUBLIC_BITCODE_QA_VERBOSE=true \
pnpm -C uapi dev:remote
```

Testnet-readiness lane dev server:

```sh
NEXT_PUBLIC_BITCODE_ENV=testnet \
NEXT_DIST_DIR=.next-v28-testnet \
NEXT_PUBLIC_SUPABASE_URL=https://tkpyosihuouusyaxtbau.supabase.co \
SUPABASE_URL=https://tkpyosihuouusyaxtbau.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<testnet Supabase publishable key> \
SUPABASE_SECRET_KEY=<testnet Supabase secret key> \
BITCODE_BITCOIN_OAUTH_CLIENT_ID=bitcode-bitcoin-wallet \
BITCODE_BITCOIN_OAUTH_CLIENT_SECRET=<same value configured in Supabase custom provider> \
BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS=https://tkpyosihuouusyaxtbau.supabase.co \
BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_URIS=https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback \
BITCODE_BITCOIN_OAUTH_SUPABASE_CALLBACK_URL=https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback \
GITHUB_APP_CLIENT_ID=<GitHub App client ID> \
GITHUB_APP_CLIENT_SECRET=<GitHub App client secret> \
GITHUB_APP_REDIRECT_URI=http://127.0.0.1:3001/github/callback \
GITHUB_APP_ID=<GitHub App ID> \
GITHUB_PRIVATE_KEY="$(cat /Users/garrettmaring/Downloads/engi-software-agents.2026-05-11.private-key.pem)" \
GITHUB_WEBHOOK_SECRET=<GitHub webhook secret> \
NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL=https://github.com/apps/bitcode-github-app-auxillary \
NEXT_PUBLIC_MASTER_MOCK_MODE=false \
NEXT_PUBLIC_ENABLE_MOCKS=false \
NEXT_PUBLIC_MOCK_USER_AUXILLARIES=false \
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=false \
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false \
NEXT_PUBLIC_MOCK_GITHUB_BRANCHES=false \
NEXT_PUBLIC_MOCK_GITHUB_COMMITS=false \
NEXT_PUBLIC_MOCK_CHAT_STREAM=false \
NEXT_PUBLIC_CONVERSATIONS_WIDGET=false \
NEXT_PUBLIC_CONVERSATION_SECTION=false \
NEXT_PUBLIC_DISABLE_EXCHANGE_LINK=true \
NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE=true \
NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE=true \
NEXT_PUBLIC_DISABLE_AUXILLARIES=false \
NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT=false \
NEXT_PUBLIC_MCP_UPGRADES=true \
NEXT_PUBLIC_BITCODE_QA_VERBOSE=true \
pnpm -C uapi exec next dev --hostname 127.0.0.1 -p 3001
```

When the testnet-readiness lane lacks wallet, GitHub, Supabase, signer, BTC broadcaster, ledger observer, MCP, ChatGPT App, or database projection credentials, the expected V28 behavior is explicit blocked readiness.
It is not acceptable for that lane to silently show a mocked success state.
Exchange and website Conversations should stay disabled or hidden in these V28 lane commands.

## Staging-Testnet Vercel Environment

`bitcode.exchange` is the singular deployed staging-testnet target for the next manual QA pass.
The Supabase custom Bitcoin OAuth provider must use the deployed origin, not localhost:

```text
Authorization URL: https://bitcode.exchange/tps/wallet/authorize
Token URL:         https://bitcode.exchange/api/wallet/oauth/token
UserInfo URL:      https://bitcode.exchange/api/wallet/oauth/userinfo
Callback URL:      https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback
```

Set these Vercel environment variables for the deployment environment used by `bitcode.exchange`:

```sh
NEXT_PUBLIC_APP_URL=https://bitcode.exchange
NEXT_PUBLIC_BITCODE_ENV=testnet
NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4

NEXT_PUBLIC_SUPABASE_URL=https://tkpyosihuouusyaxtbau.supabase.co
SUPABASE_URL=https://tkpyosihuouusyaxtbau.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<testnet Supabase publishable key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same testnet Supabase publishable key if older code path needs it>
SUPABASE_PUBLISHABLE_KEY=<testnet Supabase publishable key>
SUPABASE_SECRET_KEY=<testnet Supabase secret key>
SUPABASE_SERVICE_ROLE_KEY=<testnet Supabase secret key if admin/service-role code path needs it>

BITCODE_BITCOIN_OAUTH_CLIENT_ID=bitcode-bitcoin-wallet
BITCODE_BITCOIN_OAUTH_CLIENT_SECRET=<same custom provider client secret configured in Supabase>
BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS=https://tkpyosihuouusyaxtbau.supabase.co
BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_URIS=https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback
BITCODE_BITCOIN_OAUTH_SUPABASE_CALLBACK_URL=https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback

GITHUB_APP_CLIENT_ID=<GitHub App client ID>
GITHUB_APP_CLIENT_SECRET=<GitHub App client secret>
GITHUB_APP_ID=<GitHub App ID>
GITHUB_PRIVATE_KEY=<GitHub App private key PEM>
GITHUB_WEBHOOK_SECRET=<GitHub webhook secret>
GITHUB_APP_REDIRECT_URI=https://bitcode.exchange/github/callback
VCS_REDIRECT_URI=https://bitcode.exchange/github/callback
NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL=https://github.com/apps/bitcode-github-app-auxillary

NEXT_PUBLIC_MASTER_MOCK_MODE=false
NEXT_PUBLIC_ENABLE_MOCKS=false
NEXT_PUBLIC_MOCK_USER_AUXILLARIES=false
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=false
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false
NEXT_PUBLIC_MOCK_GITHUB_BRANCHES=false
NEXT_PUBLIC_MOCK_GITHUB_COMMITS=false
NEXT_PUBLIC_MOCK_CHAT_STREAM=false
NEXT_PUBLIC_CONVERSATIONS_WIDGET=false
NEXT_PUBLIC_CONVERSATION_SECTION=false
NEXT_PUBLIC_DISABLE_EXCHANGE_LINK=true
NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE=true
NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE=true
NEXT_PUBLIC_DISABLE_AUXILLARIES=false
NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT=false
NEXT_PUBLIC_MCP_UPGRADES=true
NEXT_PUBLIC_BITCODE_QA_VERBOSE=true
BITCODE_QA_VERBOSE=true

BITCODE_ENABLE_PIPELINE_HARNESS_API=1
BITCODE_ASSET_PACK_REAL_INFERENCE=1
BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded
BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS=600000
OPENAI_API_KEY=<OpenAI key for non-mocked Terminal/protocol synthesis>
BITCODE_LLM_PROVIDER=openai
BITCODE_LLM_MODEL=<optional pinned OpenAI generation model>
SENTRY_DSN=<optional V28 alert sink; absence must remain readable blocked readiness>
```

Do not set mock flags true on this deployment.
Do not point the Supabase custom provider token/userinfo URLs at localhost; Supabase cloud must be able to call the deployed Bitcode origin.
Do not deploy staging-testnet Read/Fit QA with `BITCODE_ASSET_PACK_REAL_INFERENCE` unset or false. Per-agent `*_USE_PTRR` flags are only diagnostic overrides; the deployed streaming posture is the global real-inference flag, `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`, and a real server-side model credential. Use `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full` only for long-running sandbox audits outside the deployed route.

## Live Deployment Pass: First-Run Onboarding To Terminal Readiness

Use this pass when onboarding a fresh browser/profile against `https://bitcode.exchange`.
It is intentionally ordered like a real operator's first session.

Preconditions:

- Vercel environment is deployed with mock flags off, Exchange disabled, website Conversations disabled, and verbose QA logging enabled.
- Supabase custom provider `custom:bitcode-bitcoin` points to `https://bitcode.exchange/tps/wallet/authorize`, `/api/wallet/oauth/token`, and `/api/wallet/oauth/userinfo`.
- Leather and/or Xverse are installed, unlocked, and on the intended Bitcoin testnet lane.
- The GitHub App is installed on `engineeredsoftware/ENGI` or is installable through the public app link.
- Use a fresh incognito profile or clear `bitcode.exchange` cookies/local storage before the first pass when validating true first-run behavior.

### Pass 1A: First Page Load And Wallet Identity

1. Open `https://bitcode.exchange/terminal`.
2. Observe the first 5 seconds before clicking anything.
3. Open browser DevTools Console and Network.
4. Confirm top chrome does not flash a settled disconnected state while wallet/user data is still reading.
5. Click `Connect Wallet` or open Auxillaries, then select Wallet.
6. Confirm Wallet is the first prerequisite pane and Profile is not the primary identity pane.
7. Click `Connect Leather` first if available.
8. Approve the Bitcode message signature in Leather.
9. Let the Supabase callback complete without manually editing the URL.
10. Return to `https://bitcode.exchange/terminal` if the callback lands elsewhere.

Expected evidence:

- Wallet pane shows provider `Leather`, network, auth address, payment address, proof/signature state, persistence state, and BTD/BTC posture.
- Top chrome replaces `Connect Wallet` with connected wallet/BTC/BTD posture after the data read settles.
- Browser console shows wallet detection/signing/user-data telemetry and no Bitcode product error.
- Vercel logs show `wallet-oauth:authorization-code-issued`, `wallet-oauth:token-issued`, `wallet-oauth:userinfo-read`, and wallet persistence or a precise blocker.
- Supabase `auth.users`, `auth.identities`, `user_profiles`, and `user_connections` rows reflect the wallet identity, or the exact schema/RLS error is recorded.

Stop after 1A if Supabase returns `server_error`, token/userinfo logs do not appear, the app returns to a login-error URL, or wallet state cannot persist after refresh.

### Pass 1B: GitHub Source Scope

Only continue after Wallet identity is stable across a hard refresh.

1. Open Auxillaries -> Externals.
2. Confirm GitHub controls render because wallet identity exists.
3. Click the GitHub App install/connect action.
4. Complete GitHub authorization/install flow.
5. Return to Bitcode and open Externals again.
6. Inspect repository inventory and connection state.

Expected evidence:

- Externals shows GitHub connected, installation/account posture, and repository/source scope.
- GitHub controls do not appear in Profile.
- Vercel logs show GitHub setup/callback handling with installation fields preserved.
- Supabase `user_connections.provider='github'` and repository inventory rows or connection metadata match the UI.

### Pass 1C: Terminal Readiness For Deposit, Read, And Fit

Only continue after Wallet and GitHub are stable across a hard refresh.

1. Return to `/terminal` at the top of the page.
2. Identify the primary Read/Deposit work area.
3. Confirm no model picker can affect ledgerized Terminal/Fit/AssetPack synthesis.
4. Confirm repository/source scope is visible or selectable from GitHub-derived data.
5. Attempt the simplest Deposit path available without leaving Terminal.
6. Record the first blocker, source root, measurement state, earning state, or settlement state.
7. Attempt the simplest Read path available against that Deposit/source posture without leaving Terminal.
8. Record the first blocker or Fit result.

Expected evidence:

- Terminal uses Wallet/GitHub readiness rather than mock success.
- Deposit and Read either progress to source/Fit/measurement readback or fail closed with exact missing capability.
- Any AssetPack, BTD range, zero-cell receipt, BTC fee, ledger anchor, Terminal journal, or reconciliation state is internally consistent with Supabase rows.
- If a pipeline/runtime/deployment prerequisite is missing, the blocker is named and belongs to V34 or later only when the V28 MVP readback remains truthful.

Paste back after each subpass:

- screenshots for the active pane/surface;
- browser console `[Bitcode QA]` lines;
- Vercel logs for the same timestamps;
- Network tab failures with method, URL, status, and response body;
- Supabase SQL results from the required wallet/GitHub/Terminal queries;
- a short note naming each issue as V28 blocker, V28 polish, or deferred version focus.

### Pass 2A: Terminal Deposit/Read MVP Write-Read QA

Run this pass from `https://www.bitcode.exchange/terminal` after Pass 1A and 1B are green.
The current live staging baseline is the Leather-authenticated wallet plus GitHub App installation on `engineeredsoftware`, with `engineeredsoftware/ENGI` present in `public.vcs_repositories`.

Before touching Terminal controls, run saved query `v28_qa_terminal_01_prerequisites_wallet_github_repo`.
The row for the current user should report `terminal_prerequisite_state='ready_for_terminal_deposit_read'`.
If it reports `warning:ENGI_repo_not_in_inventory`, continue only if another connected repository is intentionally selected in the UI and paste that repository name with the SQL result.
If wallet profile projection warnings report missing `network`, `authAddress`, or `paymentAddress` while the active wallet `user_connections` row contains those values, run `v28_qa_01b_backfill_profile_wallet_projection_from_connection` once and rerun query 01 before continuing.
If it reports any `blocker:*`, stop and repair that prerequisite before Terminal write QA.
If Terminal visibly reports `Failed to fetch execution history`, `/api/executions/history` is not green. Run the execution-history migration in `supabase/migrations/20260515010000_terminal_execution_history.sql`, redeploy or rerun the app against the migrated database, then refresh Terminal before recording Deposit.

Deposit path:

1. Hard refresh `/terminal` and wait for top chrome wallet state and Terminal sync to settle.
2. In the top Terminal activity area, confirm there is no visible red or amber `Failed to fetch execution history` error. Empty activity is acceptable; a 500/error banner is not.
3. In `Repository supply`, confirm `Connection posture` says GitHub is connected, `Mode` is `live connection`, and `Inventory source` is `stored protocol inventory` or `live provider inventory`.
4. In the repository selector, choose the repository intended for this Deposit. The current walkthrough fixture uses `engineeredsoftware/ENGI`, but the Terminal flow must not special-case that repository.
5. In `Deposit-side supply`, confirm the auth/session label and inventory cards use `engineeredsoftware/*`. If any `frontier/*`, `gh_inst_bitcode_001`, or other protocol-demo repository appears in the live staging lane, stop and classify as a V28 blocker.
6. In `Deposit-side supply`, use the search box only to filter connected repositories. Search must not replace live inventory with protocol demo artifacts. Select/confirm one repository card; the selected card should match the `Repository supply` selector.
7. Click `Record deposit selection`. Confirm the UI reports that selected deposit-side supply was recorded.
8. Run `v28_qa_terminal_02_activity_after_write` and `v28_qa_terminal_04_deposit_repository_alignment`. Confirm query 04 reports `frontier_count=0` for current repository inventory and `frontier_reference_detected=false` for recent Terminal deposit activity.
9. Confirm no model picker can affect ledgerized Deposit/Fit/AssetPack synthesis.
10. In `Deposit + read chain`, inspect the `deposit` card and capture selected source entries, artifact kinds, repository row, provider account, addressing root, and auth root.
11. Click `Record deposit posture`.
12. Confirm the UI reports that deposit-side share posture was recorded.
13. In Network, capture the `/api/executions/history` request and response. Expected status is `201`.
14. Run `v28_qa_terminal_02_activity_after_write` and confirm an `executions_recent` row with `type='agentic-execution:asset-pack'`, `context_summary.source='terminal-deposit-read-workbench'`, `context_summary.workbench='deposit'`, and a non-empty `output_summary.deposit`.
15. Rerun `v28_qa_terminal_04_deposit_repository_alignment`; recent Deposit activity must reference the connected repository and must not reference `frontier/*`.
16. Before `Submit deposit to Bitcode`, run `v28_qa_terminal_05_wallet_signer_gate`. For the current Leather staging path, `terminal_deposit_signer_gate_state` should be `wallet_signer_pending_signed_proof_accepted_for_v28_staging` or `wallet_signer_verified`.
17. Click `Submit deposit to Bitcode`. The browser wallet should open a Bitcoin message-signing prompt for a `Bitcode deposit authorization` message before the API request is sent.
18. Approve the signature. The request body must include a wallet authorization proof, and the UI should report a successful deposit submission rather than the staged-settlement error.
19. If `/api/deposits` returns `Bitcode can draft transaction-bearing activity...`, rerun query 05 and paste the row with the Network response; this is a V28 signer-gate blocker.

Read path:

1. Continue only after the Deposit selection and Deposit posture rows above exist. Read/Fit QA requires an established Deposit/source posture first.
2. Keep the same Terminal session and the same repository/source posture used for Deposit.
3. In `Deposit + read chain`, inspect the `read` card and capture the summary, scenario, parser, closure criteria count, target kinds count, and repository row.
4. Confirm the Read repository row matches the Deposit repository. If it falls back to `frontier/*`, stop before recording Read.
5. Click `Record read posture`.
6. Confirm the UI reports that read-measurement posture was recorded.
7. In Network, capture the `/api/executions/history` request and response. Expected status is `201`.
8. Run `v28_qa_terminal_02_activity_after_write` and confirm an `executions_recent` row with `type='agentic-execution:read-measurement'`, `context_summary.source='terminal-read-scenario-panel'`, and the same scenario/repository shown in the UI.

Fit and closure path:

1. Inspect `Asset-pack fit and settlement intent`.
2. Confirm the Fit surface is evaluating against the recorded Deposit/source posture and the recorded Read posture.
3. Click `Record fit posture`.
4. Confirm the UI reports that fit and settlement posture was recorded.
5. Run `v28_qa_terminal_02_activity_after_write` and confirm an `executions_recent` row with `type='agentic-execution:proof-refresh'`, `context_summary.workbench='fit'`, and a non-empty `output_summary.fit`.
6. In `Flow controls`, inspect `Transaction readiness`.
7. If `Make Bitcode branch` is enabled, click it once and capture `/api/make-bitcode-branch` plus the follow-up `/api/executions/history` write. Then run `v28_qa_terminal_02_activity_after_write` and `v28_qa_terminal_03_btd_ledger_after_terminal`.
8. If `Make Bitcode branch` is disabled, capture the disabled tooltip/readiness text. This is acceptable for V28 only when it names the exact missing capability and the Deposit/Read/Fit posture rows above still persisted and reread correctly.

BTD/ledger readback:

1. Run `v28_qa_terminal_03_btd_ledger_after_terminal` after any fit, branch, BTC fee, mint, or ledger action.
2. For early V28 posture-only writes, empty `recent_measuremint_receipts`, `recent_asset_pack_ranges`, `recent_btc_fee_transactions`, and `recent_ledger_anchors` rows are acceptable if `consistency_summary` reports zero missing journals, zero missing anchors, and zero blocking repairs.
3. If Terminal claims an AssetPack mint, BTC fee, ledger anchor, settlement, or reconciliation happened, the matching row must appear in the corresponding BTD section of query 03.

Pass criteria:

- Wallet/Auth/Profile/GitHub/repository prerequisites are ready in query 01.
- Terminal activity history loads without a visible `/api/executions/history` error.
- Live Terminal Deposit inventory references connected `engineeredsoftware/*` repositories, not protocol-demo `frontier/*` repositories.
- Deposit, Read, and Fit record actions write user-scoped rows in that order and reread in query 02.
- Query `v28_qa_terminal_04_deposit_repository_alignment` shows no `frontier_reference_detected` rows for recorded Terminal Deposit activity.
- The Terminal activity UI shows those rows after refresh or activity reload.
- Branch/settlement either progresses with explicit network and SQL evidence or fails closed with a precise blocker.
- No Terminal control routes through Exchange or website Conversations.
- No user-facing model selection can change ledgerized Read/Fit/AssetPack synthesis.
- Query 03 shows no ledger/database drift for any BTD state that Terminal claims.

V28 blockers:

- `/api/executions/history` returns 500 or query 02 reports `public.executions` missing after a Terminal write is expected to persist.
- Terminal shows mock repository, mock wallet, or mock GitHub state in the deployed staging-testnet lane.
- A recorded Deposit/Read/Fit row is not tied to the authenticated wallet user.
- Terminal claims mint/settlement/anchor/finality without matching BTD projection rows.
- GitHub access tokens or wallet signatures appear unredacted in browser-visible UI, query output intended for routine QA, or client telemetry.
- A broad model selector can alter ledgerized Terminal/Fit/AssetPack synthesis.

### Pass 2B: Single-Deposit Read/Fit QA

Purpose:
Validate Bitcode's most value-critical flow against the smallest real
data-space now available in staging: a single deposited repository revision.
This pass asks whether Reading can find a worthy Fit, synthesize the right
AssetPack posture, and fail closed when evidence is not strong enough.
The current walkthrough fixture is `engineeredsoftware/ENGI` because that is the
repository already deposited, but Terminal code and operator flow must remain
fully generic across repository owner, repository, branch, commit, signer, and
source type.

First-run execution boundary:

- A recorded Fit posture is not yet a worthy Fit unless the deployed
  pipeline has actually executed and written its evidence.
- The AssetPack pipeline must now emit depository search evidence in execution
  storage: `depository/search.result`, `depository/search.candidateRanking`,
  `depository/search.selectedCandidates`, `depository/search.embeddingPolicy`,
  `fit.result`, `fit.resultState`, and `fit.resultReasons`.
- The deployed pipeline host must also emit structured execution rows for the
  run, event stream, SDIVF phase delegations, PTRR agent steps, model
  generations, and tool executions. The minimum database readback surface is
  `deliverable_pipeline_runs`, `deliverable_pipeline_events`,
  `deliverable_pipeline_phase_delegations`,
  `deliverable_pipeline_agent_steps`, `deliverable_pipeline_generations`, and
  `deliverable_pipeline_tool_executions`.
- Generation telemetry must preserve the interpolated model input messages when
  available, the raw generation payload, the parsed/typed response shape, model
  provider/name, usage tokens, phase, agent, step, failsafe, and generation
  context. Missing prompts, missing parsed outputs, or uncorrelated
  generation/tool rows are blockers for debugging live Read/Fit execution.
- Structured tool telemetry must include both direct tool-use events and stored
  `tools/*` status results emitted by delivery work. Depository search,
  evidence verification, branch creation, file writes, and pull-request
  creation must be visible in the stream and, when database streaming is on,
  in `deliverable_pipeline_tool_executions` without secret-bearing inputs.
- Failed harness runs must still export `evidence.json` with the execution tree
  and the last visible stream event summaries. A failing command with no
  prompt/context, raw output, parsed/cast output, or phase/agent correlation is
  not enough visibility for live staging-testnet debugging.
- The Terminal live-run panel must show the active Read id, Deposit id,
  source commit, sandbox id when available, pipeline run id when available, and
  incremental `telemetry.jsonl` line summaries while the sandbox command is
  still running. It must use the canonical Bitcode execution stream component,
  with run identifiers in the header metadata and each host/telemetry event as
  an expandable line carrying raw payload metadata. A state visible only in
  browser Network logs fails V28 QA.
- Depository vector recall uses `text-embedding-3-small` by default with
  `encoding_format='float'`, `dimensions=1536`, Supabase
  `deliverable_vectors.embedding vector(1536)`, `ivfflat`,
  `vector_cosine_ops`, and `match_deliverable_vectors` cosine similarity.
  A different model or dimension is a new vector space and is a blocker unless
  all candidate vectors and query vectors are regenerated under that same
  policy.
- Until real pipeline execution exists, the honest positive-control result is
  `blocked_readiness`: Deposit, Read admission, source binding, and Fit posture
  are reviewable, but AssetPack range, ledger anchor, BTC fee, settlement, and
  finality readback must not be claimed.
- `worthy_fit` and `no_worthy_fit` become admissible only when the
  result is derived from pipeline execution evidence rather than local posture
  rows alone.

Starting condition:

- Pass 2A Deposit submission has succeeded.
- Query `v28_qa_terminal_02_activity_after_write` shows a completed
  `agentic-execution:asset-pack` from `terminal-deposit-composer`.
- Query `v28_qa_terminal_04_deposit_repository_alignment` shows the recent
  deposit activity is for the selected deposited repository, with `source_branch` and
  `source_commit` present, `wallet_authorization_signed='true'`, and
  `frontier_reference_detected=false`.
- Query `v28_qa_terminal_03_btd_ledger_after_terminal` still shows no claimed
  mint/anchor/finality without matching projection rows.

Read scenario:

Use this as the first manual Read frame, whether entered directly or selected
from the closest Terminal scenario:

```text
Read the deposited repository revision and determine whether it contains a
complete, non-mock Terminal path from Bitcoin wallet identity and GitHub source
scope through Deposit, Read/Fit, AssetPack evidence, proof/finality readback,
and Supabase/ledger reconciliation. If there is a worthy fit, synthesize the
minimal proof-bearing AssetPack. If there is not, return explicit no-worthy-fit
or blocked-readiness evidence.
```

Positive-control expectation:

- Candidate recall should point at deposited source surfaces that actually
  explain the path, not generic product copy. Expected evidence families include
  Terminal Deposit/Read components, repository/branch/commit source selection,
  execution-history persistence, wallet/GitHub readiness, saved QA SQL, BTD
  ledger readback, and proof/finality/admission primitives.
- Candidate ranking should expose query root, ranking root, searched asset
  count, selected candidate ids, rejected candidates, blocked candidates,
  semantic score, source revision score, proof score, measurement score,
  embedding model, embedding dimensions, vector table/RPC, and distance metric.
- The Fit result must name why the selected deposited source evidence is
  decisive or why it is insufficient. A decorative Fit summary with no
  source/proof linkage is a failure.
- The result must produce one of two honest outcomes:
  - `worthy_fit`: a minimal AssetPack candidate with source revision, evidence
    roots, proof/dedupe/materialization posture, and settlement/finality state;
  - `no_worthy_fit` or `blocked_readiness`: explicit reasons such as source
    materialization unavailable, no live branch materialization, missing ledger
    anchor, no accepted Read review, or no settlement proof.

Negative controls:

1. Run or simulate a Read unrelated to the deposited source, such as
   "Find a Solana wallet settlement AssetPack." Expected: no-worthy-fit or
   clarification, not a confident AssetPack.
2. Run or simulate an overly broad Read, such as "Make Bitcode better."
   Expected: clarification or blocked measurement, not a confident Fit.
3. Run or simulate a Read that would require unavailable source material outside
   the deposited revision. Expected: no-worthy-fit or source-scope blocker.

Manual steps:

1. Hard refresh `/terminal`.
2. Confirm the Activity area shows the successful latest Deposit row and no
   execution-history error.
3. Confirm the repository selector still shows the deposited repository, the
   selected branch, and the selected commit from the successful Deposit.
4. In the Deposit + read chain, confirm the Read state panel starts at
   `draft` and explains that recording a Read does not mean Bitcode found a
   fit.
5. Record the measured Read. Capture the `/api/executions/history` request and
   response; expected status is `201`, and the page must remain in the Read
   chain with a `measured` next-state message.
6. Admit the measured Read for fit search. Capture the `/api/executions/history`
   request and response; expected status is `201` with
   `fitSearchAdmission.admitted=true`.
7. Record Fit result posture. Capture the `/api/executions/history` request and
   response; expected status is `201`.
8. If a branch, AssetPack, BTC fee, ledger anchor, or settlement control becomes
   enabled, inspect the preview first. Only click it if the preview names source
   revision, proof/finality posture, wallet authorization, and expected database
   readback.
9. Run saved query `v28_qa_terminal_06_read_fit_quality_after_read`. Before the
   first deployed pipeline execution, expect `latest_fit_result_state` to be
   `blocked_readiness`, not `worthy_fit`.
10. If the Vercel Sandbox pipeline harness is run, save the exported
    `evidence.json` and `telemetry.jsonl` summaries and verify that
    `depositorySearch`, `fitResult`, `queryRoot`, `rankingRoot`, and
    `selectedCandidateAssetIds` are present in the pipeline output or execution
    storage summary. Also verify `embeddingPolicy.model`,
    `embeddingPolicy.dimensions`, and `embeddingPolicy.vectorStore.rpc`.
    Inspect `fitResult.selectionTrace` for selected and blocked candidates,
    source binding, use tier, score channels, selected unit hashes,
    proof/measurement evidence, provider recall, blockers, warnings, and
    rejection reasons.
11. Run saved query `v28_qa_terminal_07_pipeline_harness_after_fit`. It must
    show at least one recent pipeline run or deliverable pipeline run, event
    telemetry, phase trace rows, agent-step rows, and generation/tool rows
    before a `worthy_fit` or `no_worthy_fit` classification can graduate from
    posture into result review.
12. Rerun `v28_qa_terminal_02_activity_after_write` and
    `v28_qa_terminal_03_btd_ledger_after_terminal`.
13. Paste screenshots, Network payload summaries, Vercel logs for the same
    timestamps, and all three query outputs.

Pass criteria:

- `v28_qa_terminal_06_read_fit_quality_after_read` reports
  `critical_read_gate_state='critical_read_fit_sequence_ready_for_result_review'`
  for the positive-control run.
- Query 06 also reports `latest_fit_result_state` as one of `worthy_fit`,
  `no_worthy_fit`, or `blocked_readiness`. Before deployed pipeline execution is
  wired, the accepted result is `blocked_readiness`.
- The observed repository matches the latest deposited repository.
- Branch and commit are present on Deposit, Read, and Fit activity.
- Deposit precedes Read, and Read precedes Fit.
- No `frontier/*` repository or mock repository appears in staging-testnet
  activity.
- Fit evidence is source-bound and quality-explained, not just a summary.
- Fit evidence includes a compact selection trace with candidate source
  binding, use tier, score channels, selected unit hashes, proof/measurement
  evidence, provider recall, blockers, warnings, and rejection reasons.
- Real `worthy_fit` or `no_worthy_fit` classification is backed by deployed
  pipeline execution rows, events, logs, depository search evidence, candidate
  ranking roots, embedding policy, and result evidence.
- Query `v28_qa_terminal_07_pipeline_harness_after_fit` reports
  `pipeline_harness_ready_for_result_review`; a
  `blocker:pipeline_harness_run_missing`,
  `blocker:pipeline_event_telemetry_missing`, or
  `blocker:pipeline_phase_trace_missing` result means the Fit must remain
  blocked-readiness.
- Settlement, finality, BTC fee, BTD range, or ledger anchor claims appear only
  when query 03 shows matching projection rows; otherwise the Terminal result
  labels the exact blocked-readiness state.

Blockers:

- Read/Fit runs against a repository other than the deposited repository revision.
- Read/Fit produces a "fit" without source evidence, proof posture, rejection
  reasons, or explicit blocker.
- Negative controls produce a confident AssetPack instead of no-worthy-fit or
  clarification.
- Fit search proceeds before Read review/admission.
- Pipeline output lacks `fit.resultState`, `fit.resultReasons`, query root, or
  ranking root after the AssetPack pipeline entrypoint reports completion.
- Pipeline output uses an embedding model or dimensions that do not match the
  stored depository vectors, or it lacks embedding policy readback.
- Terminal claims delivery, settlement, mint, anchor, or finality that SQL
  readback cannot verify.
- Any staging-testnet Read/Fit row contains `frontier/*`, mock provider, or
  protocol-demo source as if it were live deposited source.

### Pass 2C: Vercel Sandbox Pipeline Harness QA

Purpose:
Prove that the Read/Fit path can run inside the first lightweight deployment
host before QA treats a Fit result as meaningful. This pass checks
the harness itself: sandbox creation, command execution, manifest binding,
artifact export, telemetry, database persistence, and cleanup.
It also checks the first finding layer: manifest Deposit supply is
converted into depository search input, candidates are ranked, and the pipeline
stores query/ranking roots before any result state is reviewed.

Prerequisites:

- Vercel project is linked and local OIDC credentials are current:
  `vercel link && vercel env pull`.
- `@vercel/sandbox` is installed in the workspace running the harness.
- Pass 2B has produced a Deposit, Read, and Fit posture for the same repository,
  branch, and commit.
- No wallet, GitHub, Supabase, model, or provider secret is passed into the
  sandbox unless it is explicitly named in `BITCODE_SANDBOX_ENV_KEYS` for this
  run and the network policy is understood.

Host smoke command:

```bash
BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1 \
BITCODE_SANDBOX_MODE=host_smoke \
BITCODE_SANDBOX_REPOSITORY=engineeredsoftware/ENGI \
BITCODE_SANDBOX_SOURCE_BRANCH=main \
BITCODE_SANDBOX_SOURCE_COMMIT=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
pnpm run qa:pipeline-harness:sandbox
```

Expected host smoke result:

- The script creates a Vercel Sandbox, runs `node --version`, writes a harness
  manifest, writes `evidence.json` and `telemetry.jsonl`, reads both artifacts
  back, and stops the sandbox unless `BITCODE_SANDBOX_LEAVE_RUNNING=1`.
- The returned result state is `blocked_readiness`; this is correct because
  host smoke proves only the host lifecycle.

Repository pipeline command:

Use the repository, branch, commit, Read id, Deposit id, and Deposit AssetPack id
from the latest successful Deposit/Read/Fit QA query output. The commit values
below are examples only and must not replace the source revision recorded in
staging for the current Read.

```bash
BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1 \
BITCODE_SANDBOX_MODE=asset_pack_pipeline \
BITCODE_SANDBOX_SOURCE_GIT_URL=https://github.com/engineeredsoftware/ENGI.git \
BITCODE_SANDBOX_SOURCE_BRANCH=main \
BITCODE_SANDBOX_SOURCE_COMMIT=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
BITCODE_SANDBOX_SOURCE_REVISION=31bbc0c5227b6b3aed5d107fd8507d35ec22970a \
BITCODE_SANDBOX_DEPOSIT_HAS_PROOF=1 \
BITCODE_SANDBOX_DEPOSIT_HAS_MEASUREMENT=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded \
BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1 \
BITCODE_SANDBOX_ENV_KEYS=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY,BITCODE_ASSET_PACK_REAL_INFERENCE,BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE,BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS,GITHUB_TOKEN \
BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS=600000 \
pnpm run qa:pipeline-harness:sandbox
```

`BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1` is only for trusted local/staging
operator runs where the stored GitHub App installation token has expired and
cannot be refreshed from app credentials. It lets VCS tools read `GITHUB_TOKEN`
from process environment without adding the token to tool input payloads,
artifact telemetry, or database stream rows. Product runtime should still use
the authenticated user's GitHub App connection whenever possible.

Before promotion, operators may add `BITCODE_SANDBOX_APPLY_LOCAL_PATCH=1` to
overlay the current worktree on the cloned source revision. This is only for
debugging the harness and pipeline implementation before deployment. Overlay
evidence must remain QA-only, must report
`sourceOverlay.admissibility='qa-only-not-source-revision-evidence'`,
and must not be used for source-revision settlement, ledger finality, or a
`worthy_fit` claim.
If the heavyweight pipeline exceeds the staging function window, set
`BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS` below that window. The deployed
streaming route declares an 800 second ceiling, so staging should start with
`BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS=600000`; the expected timeout result is
a `PipelineHarnessTimeoutError` artifact with the last execution and stream
events, not a missing artifact.

Omit `BITCODE_SANDBOX_DEPOSIT_HAS_PROOF` and
`BITCODE_SANDBOX_DEPOSIT_HAS_MEASUREMENT` when the manifest Deposit proof or
measurement posture has not been independently verified; expected result then
remains `blocked_readiness`.

If database streaming is intentionally being tested, pass only the required
keys by name:

```bash
BITCODE_PIPELINE_STREAM_TO_DATABASE=1 \
BITCODE_PIPELINE_STRUCTURED_DB=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE=1 \
BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded \
BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1 \
BITCODE_SANDBOX_ENV_KEYS=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY,BITCODE_ASSET_PACK_REAL_INFERENCE,BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE,BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS,GITHUB_TOKEN
```

These Supabase values must be real staging credentials. Placeholder hosts such
as `your-project.supabase.co`, anon-only keys in admin slots, and mixed REST/DB
project refs are preflight blockers, because otherwise the sandbox can execute
but stream-event, settlement, and readback evidence may land in different
projects.

On Vercel staging/preview, prefer the deployed streaming trigger because it
uses Vercel automatic OIDC instead of a local Vercel token:
the deployed route preflight-fails when `BITCODE_ASSET_PACK_REAL_INFERENCE` is
unset, when `OPENAI_API_KEY` is missing, or when
`BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS` exceeds `600000`.
When no profile is configured, the deployed route injects
`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`.
The current deployed route also preflight-fails if
`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full`. Full profile is a later V28
gate: the sandbox can run for dozens of minutes, but final state must be pushed
from the sandbox execution to a server-side stream/socket handler or durable
queue instead of waiting synchronously inside the route request.

```bash
curl -N "$BITCODE_UAPI_URL/api/pipeline-harness/asset-pack" \
  -H "Content-Type: application/json" \
  -H "Cookie: $BITCODE_STAGING_SESSION_COOKIE" \
  --data '{
    "repositoryFullName": "engineeredsoftware/ENGI",
    "sourceBranch": "main",
    "sourceCommit": "31bbc0c5227b6b3aed5d107fd8507d35ec22970a",
    "sourceGitUrl": "https://github.com/engineeredsoftware/ENGI.git",
    "readId": "1c4f1f50-ac8b-4d83-8d2d-dc9c96d238b0",
    "depositId": "3f68d845-d910-41ef-835a-89cf0103ac0a",
    "depositAssetId": "asset_repository-revision-deposit-engineeredsoftware-engi_aece31322e",
    "depositHasWalletOrAttestationProof": true,
    "depositHasAssetMeasurementEvidence": true,
    "depositProofRoot": "sha256:<proof-root-when-known>",
    "depositMeasurementRoot": "sha256:<measurement-root-when-known>",
    "depositReconciliationReadbackRoot": "sha256:<readback-root-when-known>"
  }'
```

The route streams `harness-started`, `harness-preflight`, `harness-event`,
`harness-completed`, and `harness-failed` events. It is authenticated by the
normal Supabase session and is disabled on production deployments unless
`BITCODE_ENABLE_PIPELINE_HARNESS_API=1`. Private repository clone credentials
come from explicit source token env when present, otherwise from the
authenticated user's GitHub installation token; these credentials must not
appear in the streamed events.
The route allocates the pipeline `runId` before sandbox creation, forwards it as
`BITCODE_PIPELINE_RUN_ID`, and includes it in every harness SSE event so the
Terminal stream header can show a stable run id before artifact telemetry starts.
Its preflight SSE payload also includes the sanitized Supabase host, real
inference profile, and runtime budget so operators can catch an empty or wrong
database project before waiting on the sandbox.

After either harness run:

1. Save the command JSON summary, sandbox id, command exit codes, and artifact
   presence fields.
2. Inspect exported `evidence.json` for `fitResult.resultState`,
   `fitResult.resultReasons`, `depositorySearch.queryRoot`,
   `depositorySearch.rankingRoot`, `depositorySearch.searchedAssetCount`, and
   `depositorySearch.selectedCandidateAssetIds`. Verify
   `depositorySearch.embeddingPolicy.model='text-embedding-3-small'`,
   `depositorySearch.embeddingPolicy.dimensions=1536`,
   `depositorySearch.embeddingPolicy.vectorStore.rpc='match_deliverable_vectors'`,
   and `depositorySearch.embeddingPolicy.vectorStore.distanceMetric='cosine'`
   unless the entire vector store was intentionally rebuilt under a different
   matching policy.
3. Inspect exported `telemetry.jsonl` and database rows for phase, agent,
   generation, and tool visibility. Generation rows must include interpolated
   messages when available, raw response content, parsed/cast output when the
   generation was parsed, provider/model identity, usage tokens when supplied,
   and phase/agent/step/failsafe/generation correlation.
4. Inspect the Terminal live-run panel for the same run id and sandbox id. The
   panel must include host lifecycle events and incremental telemetry artifact
   event summaries, not only the final harness completion payload. Read/Fit
   live harness streams should render in the same execution stream UX used by
   persisted Bitcode activity.
5. Run saved query
   `supabase/queries/v28_qa_terminal_07_pipeline_harness_after_fit.sql`.
6. Rerun `v28_qa_terminal_06_read_fit_quality_after_read` and
   `v28_qa_terminal_03_btd_ledger_after_terminal`.
7. Capture Vercel Sandbox dashboard/log evidence for the same timestamps.
8. Run the sanitized closure verifier against the same staging project:

```bash
pnpm qa:v28:pipeline-readback -- \
  --env-file .env.local \
  --expected-host tkpyosihuouusyaxtbau.supabase.co \
  --lookback-hours 48
```

This command must print `ready_for_v28_result_review` before Pass 2C may be
closed. It prints only host identity, row counts, blockers, and warnings; it
must not print Supabase keys, model keys, wallet secrets, or GitHub tokens.

Pass criteria:

- Host smoke returns exported evidence and telemetry artifacts and stops the
  sandbox cleanly.
- The repository pipeline run either produces source-bound AssetPack pipeline
  evidence or an explicit `blocked_readiness` error artifact.
- The Terminal live stream shows run id, Read id, Deposit id, source commit,
  sandbox id when available, and current telemetry line in the execution stream
  header/metadata area while the run is still active.
- Repository pipeline evidence contains depository search result state,
  candidate ranking, selected candidate ids, query root, ranking root, and
  embedding policy.
- Query 07 reports `pipeline_harness_ready_for_result_review`, or reports a
  precise blocker/warning that Terminal also shows as blocked-readiness.
- Query 07 shows recent pipeline runtime evidence in at least the base runtime
  surfaces (`pipeline_runs` or `deliverable_pipeline_runs`) plus event/log
  telemetry (`execution_events` or `stream_logs`).
- Phase and agent-step telemetry appear before any result can be promoted past
  blocked-readiness.
- Generation/tool rows appear before any model/tool-mediated Fit quality claim
  can be accepted.
- For the staging-testnet pass, generation rows must be non-zero
  because `BITCODE_ASSET_PACK_REAL_INFERENCE=1` is required. A completed run
  with zero generation rows is only deterministic bring-up evidence.
- Parsed/cast generation output is stored when a ThriceifiedGeneration parser
  runs, so operators can compare raw model text with typed Fit/search evidence.
- Query 03 still shows no AssetPack range, BTC fee, ledger anchor, settlement,
  or finality claim without matching projection rows.
- If `ledgerSettlement` is present in evidence, it uses
  `settlementAdmissible`, `ownershipBoundary`, `btcFee`, and `readback`.
  Depositor ownership, reader fee/license posture, and server custody are
  explicit even when settlement is blocked.

Blockers:

- The harness cannot create a sandbox or authenticate with Vercel.
- The harness runs but cannot export evidence artifacts before sandbox stop.
- A `worthy_fit` or `no_worthy_fit` result is claimed without query 07 runtime
  evidence.
- The pipeline completed without depository search/ranking evidence.
- Provider tokens, wallet signatures, GitHub credentials, model keys, or
  Supabase service-role secrets appear unredacted in command output, artifacts,
  browser telemetry, or routine QA query rows.
- Terminal enables settlement, minting, branch materialization, BTC fee
  broadcast, or ledger finality from a host smoke result.

Subsequent V28 Reading gates prepared by this pass:

These gates are scoped after the current bounded-inference closure gate. They
must not weaken the current requirement to observe a complete source-bound
Read/Fit -> AssetPack -> Finish -> ledger readback path. They define the next
Terminal product shape so the current implementation does not paint itself into
a synchronous route, raw-prompt Read, or source-leaking preview model.

| Gate | Scope | Acceptance boundary |
| --- | --- | --- |
| Need synthesis review | Split "What is the need?" from Fit search. The Read request enters a Need pipeline, producing requirements, closure criteria, failure modes, target artifact kinds, proof expectations, pricing measurement inputs, and a Need measurement root. | User can accept the Need or request resynthesis with feedback. No Fit search, source preview, BTC fee, or BTD settlement is allowed before Need acceptance. The accepted Need id, feedback history, telemetry, and measurement root become the only valid input to Fit search. |
| Need-Fit search and synthesis | Input is the accepted Read-Need, not raw prompt text. The AssetPack synthesis pipeline searches deposited supply, ranks candidates, measures Fit against the Need, and synthesizes the candidate AssetPack. | Result is `worthy_fit`, `no_worthy_fit`, or `blocked_readiness` with query root, ranking root, selected ids, proof/measurement posture, embedding policy, model/tool telemetry, and a source-safe candidate AssetPack id. |
| Source-safe preview | Show enough proof to decide whether to pay without leaking source. | Preview may show Need/Fit measurements, score bands, roots, candidate ids, proof posture, ownership boundary, settlement boundary, and BTC quote. It must not expose protected AssetPack source before settlement. |
| Settle and unlock | Deterministic Share-to-Fee and BTD settlement. | Price is derived from `sum(measurement_weight * measurement_volume * admitted_fit_quality)` and the staging fee schedule. Reader pays BTC fee, BTD range/ownership/license/journal/anchor rows are written and read back, then full AssetPack source/right surface is unlocked. |
| Full-profile async pipeline | Run the full PTRR profile for long-running audits. | Vercel Sandbox execution may run for dozens of minutes and must push completion artifacts to a server-side stream/socket handler or durable queue; the push is run-id correlated, authenticated, idempotent, and durable before sandbox stop. Terminal can reattach and read final state without the starter route waiting. |

2026-05-18 implementation start for the staged Reading gate:

- `@bitcode/pipeline-asset-pack` now owns a typed `bitcode.read.need`
  contract with `needId`, `measurementRoot`, requirements, closure criteria,
  failure modes, target artifact kinds, source constraints, proof
  expectations, pricing measurement inputs, review state, and feedback
  history.
- Strict Need-Fit search blocks before depository candidate recall unless an
  accepted Need is present. The blocked state is explicit
  `blocked_readiness` with `accepted_read_need_missing`.
- The depository search path consumes accepted Need source constraints and
  measurement roots as the Fit search input, rather than raw prompt text, when
  `acceptedReadNeed` is supplied.
- The Vercel Sandbox harness now lists Need stages in the manifest and
  synthesizes plus accepts a Need before invoking the existing source-bound
  AssetPack pipeline. This preserves the current proven staging-testnet path
  while Terminal is split into user-visible Need review and Need-Fit execution
  steps.
- `buildShareToFeePreview` provides the initial source-safe quote shape from
  accepted Need measurement vector and admitted Fit quality:
  `sum(measurement.weight * measurement.volume * admitted_fit_quality)`.

Observed staging-testnet harness evidence on 2026-05-17:

- Vercel Sandbox run `sbx_ktb5Z6VnP5A16m9k4a0FkBcJg1d3` completed all six
  host commands and exported artifacts to
  `.bitcode/pipeline-harness-runs/2026-05-17T16-37-38-466Z-sbx_ktb5Z6VnP5A16m9k4a0FkBcJg1d3/`.
- Pipeline run `d21240bd-ebc7-41ae-b082-06d7beb244a7` returned
  `pipelineResultState='worthy_fit'` and final `resultState='blocked_readiness'`
  because the run used `BITCODE_SANDBOX_APPLY_LOCAL_PATCH=1`.
- The synthesized AssetPack evidence was source-bound to
  `engineeredsoftware/ENGI@main@4ced69180958143254639a8a5af94c0991545a91`,
  selected candidate `manual-deposit-qa`, query root
  `sha256:1d58f3d0e16af0700a702b2b307c744145a9196ac63841345a20ff597f5a3ca3`,
  ranking root
  `sha256:c04599ac4782dadf3b63842381dd20c76f577401cc35d82fbee4a63797496aa1`,
  and embedding policy `openai text-embedding-3-small`, 1536 dimensions,
  `match_deliverable_vectors`, cosine.
- Supabase readback showed `pipeline_runs.status='completed'`,
  `deliverable_pipeline_runs.status='completed'`, 603 deliverable pipeline
  events, 12 completed phase rows, 40 completed agent-step rows, and no running
  phase or agent rows for the run.
- The default harness path previously used deterministic setup/discovery/
  synthesis/validation/finish branches unless a phase-specific `*_USE_PTRR=1`
  flag was set; therefore this observed run had zero generation rows and zero
  tool execution rows. The V28 staging posture is now
  `BITCODE_ASSET_PACK_REAL_INFERENCE=1`. On the deployed streaming route,
  `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded` is now the required
  profile: setup, synthesis, validation, and Finish produce model-generation
  telemetry while deterministic source-bound discovery preserves budget for a
  complete AssetPack run. Full discovery PTRR is now scoped to the later
  async-completion V28 gate; the current deployed route must reject `full`
  until sandbox completion pushes finished state to a server-side stream/socket
  handler or durable queue.
- Ledger readback correctly showed zero BTD range, BTC fee, journal, anchor, and
  crypto telemetry rows, and `btd_supply_state.total_minted=0`, because source
  overlay QA evidence cannot mint BTD, claim BTC fee settlement, or anchor
  finality.
- The next promotion step is a clean source-revision run after these pipeline
  harness changes are deployed in the deposited source revision. Only a clean
  no-overlay run may write and read back ledger settlement rows.

Later staging-testnet evidence on 2026-05-17 after the no-overlay deployment:

- A new Deposit/Read/Fit harness run against
  `engineeredsoftware/ENGI@main:ee1481634c985afbc349f8d8b837cd1c43a254ac`
  reached real model-backed setup execution. Umbrella pipeline run
  `44a05fd7-f337-42cf-ad3c-d4a607d54a2b` and deliverable pipeline run
  `b1b04a2d-0376-4200-b08c-7936076f2566` failed before candidate recall or
  AssetPack synthesis.
- Database readback showed real execution progress: 2 setup phase delegation
  rows, 16 agent-step rows, 72 model-generation rows, 1634 deliverable pipeline
  events, and 0 tool-execution rows. This confirms real inference and telemetry
  persistence were active, but the run did not reach depository search,
  synthesis, Finish, shipping, or ledger settlement.
- Failure root cause was a setup risk-admission output contract mismatch:
  `asset-pack-danger-wall-agent.ts` read `finalAssessment.safe` directly from
  the PTRR envelope, while the full PTRR path returns the typed risk result
  under `output`/`finalOutput`. The fix is to normalize the risk-admission
  envelope before safety evaluation and fail closed if the typed final
  assessment is absent.
- Terminal live-run visibility must now render harness lifecycle events and
  `telemetry.jsonl` events through the canonical execution stream component so
  future failures show the same phase/agent/step/generation metadata operators
  already use for persisted Bitcode activity.

Follow-up local Vercel Sandbox overlay evidence on 2026-05-17:

- Vercel Sandbox run `sbx_GLXzpbkAjP6sIceauReWGdp0GWTE` exported artifacts to
  `.bitcode/pipeline-harness-runs/2026-05-17T20-08-16-548Z-sbx_GLXzpbkAjP6sIceauReWGdp0GWTE/`.
- The run progressed past setup risk admission and into real model-backed
  discovery, exporting 3237 telemetry lines with prompt/context, response,
  usage, phase, agent, step, failsafe, and generation correlation.
- The run failed closed with `resultState='blocked_readiness'` because
  `applyResearchApproachSemanticMirrors` assumed `approach.phases` existed on
  the top-level return value, while full PTRR returns envelope-shaped typed
  output. The V28 fix is to normalize PTRR envelopes for discovery mirrors
  before reading semantic aliases.
- The run also exposed an overclaim risk: manifest-only Deposit evidence with
  wallet/measurement booleans was being treated as enough for a Read requiring
  proof/finality and reconciliation readback. V28 now requires proof-root and
  reconciliation readback roots, or explicit blocked-readiness, before such a
  candidate can become `worthy_fit`.

Second local overlay evidence on 2026-05-17:

- Vercel Sandbox run `sbx_XO602gYd3F57rYSyc8NzkPsXIDb7` exported artifacts to
  `.bitcode/pipeline-harness-runs/2026-05-17T20-34-37-584Z-sbx_XO602gYd3F57rYSyc8NzkPsXIDb7/`.
- The run found and ranked the deposited repository candidate with real
  OpenAI-backed setup and discovery telemetry, 3565 stream lines, prompt/context
  input, raw responses, parsed output, usage, phase, agent, step, failsafe, and
  generation correlation.
- The run failed closed with `PipelineHarnessTimeoutError` after the configured
  1200000 ms harness budget while still in discovery
  (`asset-pack-plan-implementation-agent`). It did not reach synthesis,
  validation, Finish, shipping, or ledger settlement.
- The root cause is not a source crash; it is a runtime-shape mismatch between
  the deployed streaming route budget and full PTRR discovery. V28 now separates
  route-streaming real inference (`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`)
  from full PTRR audits (`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full`) so
  staging can complete the value-producing Read/Fit -> AssetPack -> Finish path
  inside the Vercel Function window.
- The run also exposed agent-visible tool registry drift: a risk-admission
  generation requested `lexical-depository-search`, but the PTRR tool executor
  reported `Tool not found: lexical-depository-search`. The deterministic
  depository search had already run before setup agents, so the search result
  was present as pipeline context; V28 still needs agent-visible depository
  search/readback tool registration or prompt tightening before full PTRR audits
  can be considered clean.

Third local overlay evidence on 2026-05-17 after bounded real-inference and
manifest-bound Deposit evidence root fixes:

- Vercel Sandbox run `sbx_rLVfPTD3HuITtCbrR0AmZ26spEYO` exported artifacts to
  `.bitcode/pipeline-harness-runs/2026-05-17T21-19-26-275Z-sbx_rLVfPTD3HuITtCbrR0AmZ26spEYO/`.
- The run intentionally passed only the UI-shaped Deposit proof and measurement
  flags, with no manual `BITCODE_SANDBOX_DEPOSIT_*_ROOT` overrides. The harness
  materialized manifest-bound `proofRoot`, `measurementRoot`, and
  `reconciliationReadbackRoot` values before pipeline execution.
- Pipeline run `3b3339b4-5695-46fa-9ce4-2163c7eb1f11` reached candidate recall,
  model-backed setup, model-backed Read comprehension, model-backed synthesis,
  `pipeline-complete`, and `ledger-settlement-readback`.
- The pipeline selected the proof-bearing candidate `manual-deposit-qa`,
  searched 1 deposited candidate, returned `pipelineResultState='worthy_fit'`,
  and synthesized `AssetPack:read-satisfaction-summary` with query root
  `sha256:d989394a41b1956b45988066165fc4c8be3063028cad8dd1367c3038456d5212`,
  ranking root
  `sha256:00307ab87da48266ee346d5ccae1d06dd228c3441610277d73015cb5e9250d3a`,
  and embedding policy `openai text-embedding-3-small`.
- The exported telemetry contained 698 lines. Bounded real-inference statuses
  were `success` for setup plan, Read comprehension, and synthesis, and
  telemetry included `llm.input`, `llm.output`, `llm.usage`, and
  `llm.parsedOutput` for the model-backed stages.
- Final harness `resultState` remained `blocked_readiness` for the correct
  reason: `BITCODE_SANDBOX_APPLY_LOCAL_PATCH=1` means the run cannot mint BTD,
  claim reader BTC fee settlement, or anchor finality. The reason text now
  distinguishes that settlement block from missing pipeline output:
  "Pipeline produced worthy_fit evidence; final settlement remains blocked by
  harness readiness constraints."
- The remaining V28 closure gate is a clean no-overlay staging run at the
  deposited source revision, with Supabase database streaming enabled, so the
  same worthy fit can write and read back BTD range, BTC fee, ownership,
  license, journal, ledger anchor, and crypto telemetry rows.
- Local sanitized environment validation after this run found root
  `.env.local` REST configuration pointing at the production-mainnet Supabase
  project while the DB URL pointed at the staging-testnet project. That is a
  branch/lane split, not staging closure evidence. The accepted V28 lane is
  staging-testnet project `tkpyosihuouusyaxtbau`, with Data API
  `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/` and DB readback host
  `db.tkpyosihuouusyaxtbau.supabase.co`.
- After correcting the root `.env.local` URLs to staging-testnet, `pnpm
  qa:v28:pipeline-readback -- --env-file .env.local --expected-host
  tkpyosihuouusyaxtbau.supabase.co --readback-source rest --lookback-hours 48`
  now reaches the staging-testnet Data API origin but is blocked by
  `supabase_admin_credential_rejected_by_rest` with `Invalid API key`. This
  means the local REST admin-shaped keys are not accepted by the staging-testnet
  project even though the host is correct.
- `pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host
  tkpyosihuouusyaxtbau.supabase.co --readback-source db --lookback-hours 48`
  reaches the DB project and currently reports 1 `pipeline_runs` row, 1
  `stream_logs` row, 1 `deliverable_pipeline_runs` row, 1634
  `deliverable_pipeline_events`, 2
  `deliverable_pipeline_phase_delegations`, 16
  `deliverable_pipeline_agent_steps`, 72
  `deliverable_pipeline_generations`, and 0
  `deliverable_pipeline_tool_executions` in the lookback window. The generic
  `phase_executions` table is absent, but this is a warning because the
  deliverable phase delegation table is populated. The stricter DB verifier now
  also inspects the latest deliverable run coherently: latest run
  `b1b04a2d-0376-4200-b08c-7936076f2566` is `failed`, has 1634 events, 2
  phases, 16 agent steps, 72 generations, and 0 tool rows. The hard blockers
  are missing tool execution telemetry for the latest run plus zero BTD range,
  BTC fee, journal, anchor, ownership, license, and crypto telemetry settlement
  rows.
- `pnpm qa:v28:pipeline-readback -- --env-file uapi/.env.local --expected-host
  tkpyosihuouusyaxtbau.supabase.co` correctly returns blocked locally with a
  placeholder Supabase URL and `supabase_admin_credential_missing_or_not_service_role`.
- `pnpm test:qa:v28:pipeline-readback` passes 12 Node tests covering pnpm
  argument forwarding, placeholder/admin credential rejection, host-mismatch
  no-network behavior, explicit env-file precedence over inherited
  production-mainnet shell values, REST/DB host mismatch, ready state when all
  counts are present, DB URL counting, optional `phase_executions`
  substitution, ledger-row blockers, hard blocking for missing tool execution
  rows, latest-run status/readback coherence, and REST credential rejection
  without cascading false missing-row blockers.

2026-05-18 local-only implementation pass:

- No live deployment is part of this pass. V28 route, stream, and harness work
  is validated through local application deployment only.
- Local Terminal application deployment must start with `pnpm -C uapi
  dev:staging -- --port 3010`. That script sets
  `BITCODE_ENABLE_PIPELINE_HARNESS_API=1`,
  `BITCODE_PIPELINE_HARNESS_REQUIRE_REAL_INFERENCE=1`,
  `BITCODE_ASSET_PACK_REAL_INFERENCE=1`,
  `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`,
  `BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS=600000`, and
  `BITCODE_UAPI_ENV_FILE=../.env.local` so package-local placeholders cannot
  override root staging-testnet env during local route QA.
- Local strict route preflight now reports whether real inference is required,
  whether OpenAI and Supabase service-role credentials are present, the
  inference profile, the runtime budget, and the database host before sandbox
  creation. The canonical Terminal execution stream panel remains the operator
  surface for sandbox id, run id, phase, agent, generation/tool, and parsed
  output metadata.
- The pipeline harness route now delegates execution to a route runner boundary,
  keeping the Next route responsible only for auth, validation, and SSE framing.
  Focused local tests call the same runner directly, proving strict preflight
  failure before sandbox creation, strict success event order, command
  environment forwarding, summarized evidence shape, and secret redaction.
  The same test file also covers wrapper fail-closed behavior for production
  disablement, missing auth, and incomplete request bodies before sandbox work.
- Local application deployment evidence can close route wiring, UI streaming,
  preflight, and readback-verifier acceptance criteria. It cannot close the
  clean source-revision settlement/finality gate while live deployment is
  intentionally out of scope; that gate still requires BTD range, BTC fee,
  ownership/license, Terminal journal, ledger anchor, and crypto telemetry rows
  to be written and read back in the accepted environment.
- Re-running the readback verifier on 2026-05-18 with `.env.local`,
  `--readback-source db`, and a 48 hour lookback remains correctly blocked:
  one pipeline run and deliverable stream telemetry are visible in
  staging-testnet, but the latest deliverable run is failed, tool rows are
  zero, and settlement rows remain zero.
- Read-only DB inspection of the latest staging-testnet deliverable run
  `b1b04a2d-0376-4200-b08c-7936076f2566` shows status `failed` after setup:
  clone/source checkout, setup plan, Read comprehension, and risk-admission
  PTRR steps ran with real `gpt-4.1-mini-2025-04-14` generations, but
  `setup:asset-pack-danger-wall-agent` crashed with `Cannot read properties of
  undefined (reading 'safe')`. The danger-wall wrapper now guards that boundary
  and converts malformed risk-admission output into typed blocked-readiness
  instead of a TypeError, so the next clean run can either proceed with a valid
  final assessment or stop auditably.
- The same run also showed risk-admission tool requests for
  `bitcode.asset-pack.verification` but zero
  `deliverable_pipeline_tool_executions` rows because agent executions could
  not resolve tools registered at the parent pipeline execution. The shared
  agent/pipeline tool registries now support base tool instances and parent
  pipeline fallback, and the AssetPack pipeline registers
  `bitcode.asset-pack.verification` as an evidence-only depository verification
  readback tool. Tool-result telemetry now persists summarized input plus
  output/error, including registry misses, so stream/database readback can show
  what each tool was asked and returned. The harness artifact telemetry
  summarizer and Terminal stream adapter now preserve tool name, ok/error
  state, and input/output/error posture for the canonical execution log.
  Focused tests cover parent tool
  lookup, base Tool lookup, result-event telemetry, missing-tool telemetry, and
  verification-tool readback shape.
- `.env.local` and `uapi/.env.local` now point `SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_URL` at staging-testnet. The route, readback verifier,
  and standalone dev harness fail closed when production-mainnet refs are used
  in staging mode, when REST and DB hosts differ, when an anon JWT is placed
  in an admin key slot, or when staging-testnet REST rejects every
  admin-shaped key. The current gate can only close from a clean no-overlay run
  using staging-testnet REST/admin credentials plus the staging-testnet DB
  readback URL.
- Post-fix readback remains correctly blocked until new staging credentials and
  a fresh run exist: REST readback still reports `Invalid API key` for the
  current admin-shaped credentials, while DB readback still sees the prior
  failed run with 72 generation rows, 0 tool rows, and 0 settlement/finality
  rows.
- Sanitized local env inspection shows the REST/DB hosts are correctly aligned
  to staging-testnet, `SUPABASE_SECRET_KEY` is present with an `sb_secret`
  shape, and `SUPABASE_SERVICE_ROLE_KEY` is currently an `anon` JWT. Because
  the staging Data API rejects the present `sb_secret` value, route preflight
  must continue to block sandbox creation until a staging-testnet admin key
  accepted by `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/` is supplied.
- Local validation after the registry/tool telemetry patch:
  `pnpm -C packages/agent-generics test`,
  `pnpm -C packages/agent-generics exec tsc --noEmit --pretty false`,
  `pnpm -C packages/pipelines-generics test`,
  `pnpm -C packages/pipelines-generics exec tsc --noEmit --pretty false`,
  `pnpm -C packages/pipelines/asset-pack test -- setup-agents discovery-semantic-mirrors depository-search depository-search-tool asset-pack-synthesize-artifacts-agent runtime-inference-policy bounded-structured-inference`,
  `pnpm -C packages/pipelines/asset-pack exec tsc --noEmit --pretty false`,
  `pnpm -C packages/pipeline-hosts test -- asset-pack-harness`,
  `pnpm -C packages/pipeline-hosts exec tsc --noEmit --pretty false`,
  `pnpm -C uapi exec jest --runInBand tests/terminalPipelineHarnessClient.test.ts`,
  `pnpm -C uapi exec tsc --noEmit --pretty false`,
  `pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host tkpyosihuouusyaxtbau.supabase.co --readback-source rest --lookback-hours 48`,
  `pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host tkpyosihuouusyaxtbau.supabase.co --readback-source db --lookback-hours 48`,
  and `git diff --check`. That pass was correctly blocked before the
  staging-testnet credential refresh and fresh no-overlay settlement run below.

2026-05-18 source-bound staging-testnet closure evidence:

- Staging-testnet Supabase is the accepted branch/lane for this gate:
  `tkpyosihuouusyaxtbau`, Data API
  `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`, and DB host
  `db.tkpyosihuouusyaxtbau.supabase.co`. Production-mainnet remains project
  `rinalyjfecxnmyczrpzo`.
- Vercel Sandbox run `sbx_gsVSO3LCl4JvX3IT9elA2aBofg02` executed the
  no-overlay source revision
  `engineeredsoftware/ENGI@main@dc641f9ffd0f68caece9ed24ede30d7a5d947976`
  and exported local artifacts to
  `.bitcode/pipeline-harness-runs/2026-05-18T15-44-08-076Z-sbx_gsVSO3LCl4JvX3IT9elA2aBofg02/`.
- The run completed source-bound, with no source overlay, and wrote umbrella
  pipeline row `13bc9a38-0f94-446f-98d7-14474d13467a` plus deliverable
  stream run `c38a98cf-403e-4fc7-9c9e-ba615d4af024`. The pipeline result was
  `worthy_fit`.
- Depository search selected the proof-bearing candidate `manual-deposit-qa`
  from one searched deposited asset, with query root
  `sha256:cd1b839c183e14e923cbb2832ff7a54207a4b6da3d744fd81e1faec60e7c1728`,
  ranking root
  `sha256:baacafd02e1358936de9a958df77b407f620e0304e49af56bf617b7b8d1cc6bf`,
  final score `0.8837`, and embedding policy `openai
  text-embedding-3-small`, 1536 dimensions, `match_deliverable_vectors`,
  cosine.
- Bounded inference and stream persistence were visible in both artifacts and
  database readback: the local artifact exported 702 telemetry lines, and
  staging-testnet structured rows showed 695 stream events, 13 phase
  delegations, 42 agent steps, 5 generation rows, and 4 structured tool rows.
  The structured tool rows were `bitcode.depository.search`,
  `vcs_create_branch`, `vcs_create_or_update_file`, and
  `vcs_create_pull_request`; every row had sanitized input and output and no
  tool error.
- Finish shipped the synthesized AssetPack as GitHub PR #6:
  `https://github.com/engineeredsoftware/ENGI/pull/6`, branch
  `bitcode/asset-pack-c38a98cf-403e-4fc7-9c9e-ba615d4af024`, path
  `.bitcode/asset-packs/c38a98cf-403e-4fc7-9c9e-ba615d4af024.md`.
- Ledger/database readback settled asset pack
  `asset-pack-c38a98cf-403e-4fc7-9c9e-ba615d4af024`: one BTD range
  `[5, 6)`, one reader BTC fee row with `546` sats, `finality_state='prepared'`
  and `server_custody=false`, one confirmed ledger anchor, one depositor
  ownership event, one reader license, one crypto telemetry event, and four
  Terminal journal rows (`asset_pack_mint`, `btc_fee_payment`,
  `asset_pack_anchor`, `settlement_finalization`).
- The ownership boundary readback remained explicit: the depositor wallet owns
  the minted BTD range for the deposited source evidence, while the reader
  wallet pays the BTC fee and receives the read license for this Read/Fit
  result. The server does not take custody of the BTC fee.
- `pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host
  tkpyosihuouusyaxtbau.supabase.co --lookback-hours 48` now reports
  `ready_for_v28_result_review`. The only remaining warning is the substituted
  missing generic `phase_executions` table; the current canonical structured
  pipeline hierarchy is populated through
  `deliverable_pipeline_phase_delegations`, agent steps, generations, and tool
  executions.
- Deterministic validation no longer emits source-overlay warnings for
  source-bound runs. The source-overlay warning is now present only when
  overlay evidence exists in the harness input, manifest, execution context, or
  `BITCODE_PIPELINE_SOURCE_OVERLAY_APPLIED=1`.

Pass 2C prompt-to-artifact closure audit:

| Requirement | Current artifact/evidence | Gate state |
| --- | --- | --- |
| Vercel Sandbox harness creates a host, runs commands, exports evidence, exports telemetry, and cleans up. | `packages/pipeline-hosts` host/manifest/harness tests pass; local sandbox artifacts were exported for `sbx_rLVfPTD3HuITtCbrR0AmZ26spEYO`. | implemented and locally verified |
| Route-started run id is visible before telemetry starts. | The route runner allocates `BITCODE_PIPELINE_RUN_ID`; Terminal stream snapshot and metadata rows consume `runId`; focused UAPI tests cover the stream adapter and runner event order. | implemented and tested |
| Staging route uses real bounded inference, not deterministic bring-up or full-profile blocking. | Route preflight requires real inference, OpenAI key, `bounded`, and runtime budget `<=600000`; Terminal summarizes full-profile async blocker. | implemented and tested |
| Local application deployment can enforce the same route strictness without deploying. | `BITCODE_PIPELINE_HARNESS_REQUIRE_REAL_INFERENCE=1` makes local `next dev` require real bounded inference, OpenAI, aligned Supabase admin credentials, REST/DB host alignment, and route budget `<=600000`. `uapi/tests/api/pipelineHarnessRoute.test.ts` proves local strict failure, mixed-host failure, and strict success without live deployment. | implemented and tested |
| Operators can see sanitized preflight context before waiting on the sandbox. | SSE preflight includes Supabase host, profile, and runtime budget; Terminal stream metadata renders database/profile/budget; route-runner tests assert secret redaction in completion tails. | implemented and tested |
| A repeatable readback verifier exists for staging operators. | `pnpm qa:v28:pipeline-readback -- --env-file .env.local --expected-host tkpyosihuouusyaxtbau.supabase.co --lookback-hours 48` checks sanitized REST/DB host identity, admin credential posture, pipeline telemetry tables, latest deliverable run coherence, generation/tool rows, and ledger settlement rows. The 2026-05-18 source-bound run now reports `ready_for_v28_result_review`; `pnpm test:qa:v28:pipeline-readback` passes 12 verifier tests. | implemented and verified on staging-testnet |
| Deposited proof/measurement flags become manifest-bound roots before Fit evaluation. | Harness materializes deterministic proof, measurement, and reconciliation roots; focused harness test asserts root shapes. | implemented and tested |
| Search/finding produces query root, ranking root, selected candidate ids, and embedding policy. | Source-bound staging run `13bc9a38-0f94-446f-98d7-14474d13467a` selected `manual-deposit-qa` from one searched deposited asset with query root `sha256:cd1b839c183e14e923cbb2832ff7a54207a4b6da3d744fd81e1faec60e7c1728`, ranking root `sha256:baacafd02e1358936de9a958df77b407f620e0304e49af56bf617b7b8d1cc6bf`, selected candidate ids, proof/readback roots, and OpenAI `text-embedding-3-small` vector policy. | implemented and verified on staging-testnet |
| Model-backed telemetry records prompt/context input, raw output, usage, and parsed output for each model-backed stage. | The source-bound sandbox artifact exported 702 telemetry lines; database readback showed 695 stream events, 13 phase delegations, 42 agent steps, and 5 generation rows for the latest deliverable run. | implemented and verified on staging-testnet |
| Evidence tool requests from PTRR agents execute and persist tool telemetry. | Agent tool lookup falls back to parent pipeline registries; stored `tools/*` events now also create structured tool rows. The source-bound run wrote four structured tool executions with sanitized input/output and no errors: depository search, branch creation, file upsert, and PR creation. | implemented and verified on staging-testnet |
| Clean deployed no-overlay run writes and rereads pipeline rows from the populated staging-testnet database. | Latest source-bound run `c38a98cf-403e-4fc7-9c9e-ba615d4af024` completed without source overlay and wrote/read back umbrella pipeline run `13bc9a38-0f94-446f-98d7-14474d13467a`, deliverable stream rows, phases, agent steps, generation rows, and structured tool rows. | closed for current gate |
| Settlement writes and rereads BTD range, BTC fee, ownership/license, journal, anchor, and crypto telemetry rows. | AssetPack `asset-pack-c38a98cf-403e-4fc7-9c9e-ba615d4af024` was settled with BTD range `[5, 6)`, 546 sat reader BTC fee prepared without server custody, confirmed ledger anchor, depositor ownership event, reader license, crypto telemetry, and four Terminal journal rows. | closed for current gate |
| Full-profile inference may run for dozens of minutes without route wait. | Scoped as a subsequent V28 gate requiring sandbox-pushed async completion to a server-side stream/socket handler or durable queue. The push must be run-id correlated, authenticated, idempotent, and durable before sandbox stop. | intentionally out of current gate |
| Demonstration remains a self-contained minimal Reading witness. | `protocol-demonstration/src/local-fit-finding.js` now models Need synthesis, Need acceptance, Need-Fit ranking, source-safe preview, and deterministic BTC fee quote without importing product pipeline code. `npm --prefix protocol-demonstration run test:v28-mvp-qa` passes 13 tests. | implemented and tested |

## 2026-05-13 Staging Deployment Readiness Gate

Purpose:
Validate that `bitcode.exchange` can be deployed under the V28 staging-testnet environment before first-run live QA.

Environment posture checked:

- `NEXT_PUBLIC_APP_URL=https://bitcode.exchange`
- `NEXT_PUBLIC_BITCODE_ENV=testnet`
- `NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4`
- Supabase project `https://tkpyosihuouusyaxtbau.supabase.co`
- `custom:bitcode-bitcoin` OAuth env present for the Bitcode wallet provider
- GitHub App env present for callback/setup at `https://bitcode.exchange/github/callback`
- all mock flags false
- Exchange and website Conversations disabled
- Auxillaries, Create Account, MCP upgrades, and QA telemetry enabled

Automated checks passed:

- `find uapi/app/api -path '*v[0-9]*' -print | sort`: no versioned API routes.
- `pnpm -C uapi exec jest --runInBand tests/bitcoinWalletClient.test.ts tests/api/walletOAuthRoutes.test.ts tests/api/walletAuthenticateRoute.test.ts tests/auxillariesWalletConnectionPanel.test.tsx tests/publicDocsPageContent.test.tsx tests/protocolCommercialBoundary.test.ts`: 19 passed across the matched suites.
- `pnpm -C uapi exec jest --runInBand --testMatch '**/tests/auxillariesWalletConnectionPanel.test.tsx'`: 1 passed.
- `pnpm -C uapi exec tsc --noEmit --pretty false`: pass.
- `pnpm -C packages/protocol test`: 2 passed.
- `pnpm -C packages/protocol run typecheck`: pass.
- `pnpm -C packages/orm test`: 19 passed, with live data-health E2E tests skipped unless enabled by env flags.
- `pnpm -C packages/orm run test:data-health`: data-health contract tests passed; live DB and schema-type E2E tests are gated by env flags.
- `BITCODE_RUN_DB_HEALTH_E2E=true BITCODE_RUN_SCHEMA_TYPES_E2E=true pnpm -C packages/orm run test:data-health:live`: 6 passed against the staging-testnet Supabase project.
- `pnpm -C packages/orm run schema-types:check`: generated Supabase and ORM database types cover canonical public tables.
- `pnpm -C packages/orm run build`: pass after generated type refresh.
- `pnpm -C uapi run build` with the staging-testnet env block: Next.js production build passed.
- `git diff --check`: pass.
- Supabase Security Advisor RLS class probe: direct SQL returned zero public tables with policies or browser-role grants while RLS is disabled.

Build warnings and interpretation:

- Browserslist/caniuse stale-data warning is closed by the workspace `caniuse-lite` override and refreshed install.
- Tailwind/JIT `JIT TOTAL` label warnings are closed locally by keeping `DEBUG=false` in `uapi/.env.local`; Vercel should not set broad `DEBUG=true` for staging builds unless intentionally debugging Tailwind.
- The production build no longer logs `auxillaries-data:read-finish { status: 500, mockMode: false }` during static generation; the data routes are dynamic and fail open to anonymous readiness during prerender.

External Supabase readiness check:

The staging Supabase migration history now contains the required V28 tables from local migrations `001`, `002`, and `003`, followed by dashboard-origin RLS migration `20260510223914` and repository RLS migrations `20260514173000_enable_pipeline_runs_rls.sql` and `20260514175000_enable_pipeline_runtime_rls.sql`.
`scripts/supabase.sh migration list` reports local and remote migration history aligned.
The added repository migrations enable RLS on `public.pipeline_runs`, `public.run_jobs`, `public.stream_logs`, and server-managed `public.deliverable_pipeline_*` runtime internals, closing the live data-health finding and the Supabase Security Advisor criticals shown during QA.

Data-health tooling added for repeatable Supabase/PostgreSQL validation:

- `packages/orm/src/data-health/checks.ts` defines schema, identity, Terminal, ledger, and operational checks.
- `packages/orm/scripts/run-data-health.ts` runs live checks with `SUPABASE_DB_URL`, `DATABASE_URL`, or equivalent Postgres connection env.
- `packages/orm/scripts/check-schema-types.ts` checks generated Supabase/ORM type coverage against canonical public tables.
- `supabase/DATA_HEALTH.md` documents daily, CI, and QA usage.
- Saved Supabase SQL query files are available under `supabase/queries/` with reusable names for projection overview, wallet/GitHub readiness, and BTD ledger reconciliation.

Required next validation before live onboarding QA:

1. Run saved Supabase queries from `supabase/queries/` and paste result excerpts into this QA log during first-run onboarding.
2. Rebuild/redeploy if Vercel env changed after the build.
3. Re-run Pass 1A from a fresh browser profile on `bitcode.exchange`.

Deployment judgment:

- Code/build readiness: pass.
- Wallet/OAuth/GitHub source readiness in code: pass.
- Formal protocol and ORM migration source readiness: pass.
- Live staging data-plane readiness: pass baseline. `pnpm db:data-health:daily` checked 25 and passed 25 against `tkpyosihuouusyaxtbau`; the advisor-style RLS probe returned zero rows; saved-query verification still belongs in the first-run onboarding QA evidence.
- Manual first-run onboarding may proceed after deployment env is confirmed; capture saved-query evidence during the pass.

2026-05-14 first live deployment onboarding evidence:

- The first Leather-auth callback initially fell back to `http://localhost:3000/?code=...` because Supabase Auth URL Configuration still had localhost as the Site URL. V28 now treats `https://bitcode.exchange` as the staging deployment Site URL and keeps `/tps/supabase/callback` in the allowlist.
- After correcting the Site URL, Supabase Auth created `auth.users` and `auth.identities` rows with `provider='custom:bitcode-bitcoin'` and the Bitcoin testnet subject.
- The matching Bitcode application projection exists in `public.user_profiles` under `settings.bitcodeProfile.walletBinding`, with the same user UUID as `auth.users.id`, and `public.user_connections` has a matching `provider='leather'` wallet row.
- The saved `v28_qa_03_user_profiles_wallet_binding` query was corrected to read wallet binding from JSON settings rather than nonexistent flat `wallet_address`, `wallet_provider`, and `wallet_binding_status` columns.
- Fresh staging nuke/re-onboarding showed the intended first two Auth rows immediately but left `user_profiles.settings` empty until the app replayed the signed wallet proof from local storage. V28 now treats this as a first-run integrity gap: any active route must persist the signed local wallet proof once a Supabase session exists, so a callback-to-root landing still converges on `settings.bitcodeProfile.walletBinding` and `user_connections` before GitHub onboarding.
- The next clean deploy showed correct wallet-provider discovery and data projection, but the callback still targeted `/auxillaries/wallet`. V28 now requires the callback `next` target and compatibility routes to use `/terminal?auxillary-open-to=wallet`; `/auxillaries/*` must only redirect and must never render the retired direct-route page, old Terminal navigation, or disabled AssetPacks sidebar tab.

## Issue Template

```md
### Title

### Surface
Identity/Auth / Terminal / Protocol / Auxillaries / BTD / MCP API / ChatGPT App / Docs/API / Deployment / Deferred Exchange / Deferred Conversations

### Environment Lane
Mock / Testnet-readiness

### Expected V28 MVP Behavior

### Actual Behavior

### Evidence
- URL:
- Screenshot:
- Console/network:
- Route/query state:

### V28 vs Later-Version Disposition
V28 blocker / V28 polish / V29+ deferred

### Notes
```

## Required QA Telemetry And Database Evidence

Every V28 manual pass from this point forward must capture three evidence layers.

1. Browser console with `NEXT_PUBLIC_BITCODE_QA_VERBOSE=true`.
   Capture `[Bitcode QA]` lines after each interaction group, plus warnings/errors from wallet extensions, Supabase, GitHub, and route fetches.

2. Dev server console with `BITCODE_QA_VERBOSE=true`.
   Capture `[Bitcode QA Server]` lines for wallet OAuth, token/userinfo, wallet persistence, auxillary data reads, and GitHub callback/setup routes.

3. Supabase SQL results.
   Run the relevant SQL queries below after sign-in, sign-out, GitHub install, and any Terminal write that claims to sync identity/source state.
   Paste both successful rows and SQL/table/permission errors into the QA notes.
   Save each query in Supabase with the `v28_qa_` name shown above it so later passes can reuse the same evidence label.

Wallet-authentication baseline:

Saved query name: `v28_qa_01_auth_users_recent`

```sql
select
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
from auth.users
order by created_at desc
limit 5;
```

Saved query name: `v28_qa_02_auth_identities_bitcoin`

```sql
select
  user_id,
  provider,
  identity_data,
  created_at,
  updated_at
from auth.identities
where provider = 'custom:bitcode-bitcoin'
order by updated_at desc
limit 10;
```

Bitcode profile and wallet binding:

Saved query name: `v28_qa_03_user_profiles_wallet_binding`

```sql
select
  id,
  username,
  settings #>> '{bitcodeProfile,walletBinding,address}' as wallet_address,
  settings #>> '{bitcodeProfile,walletBinding,provider}' as wallet_provider,
  settings #>> '{bitcodeProfile,walletBinding,status}' as wallet_binding_status,
  settings #>> '{bitcodeProfile,walletBinding,network}' as wallet_network,
  settings #>> '{bitcodeProfile,walletBinding,paymentAddress}' as payment_address,
  settings #>> '{bitcodeProfile,walletBinding,authAddress}' as auth_address,
  settings #> '{bitcodeProfile,walletBinding}' as wallet_binding,
  updated_at
from public.user_profiles
order by updated_at desc
limit 10;
```

Wallet and GitHub provider connections:

Saved query name: `v28_qa_04_user_connections_wallet_github`

```sql
select
  user_id,
  provider,
  is_active,
  connection_data->>'address' as wallet_address,
  connection_data->>'network' as wallet_network,
  connection_data->>'verification_state' as verification_state,
  connection_data->>'auth_source' as auth_source,
  connection_data->>'account_login' as github_account,
  updated_at
from public.user_connections
where provider in ('xverse', 'leather', 'unisat', 'okx-bitcoin', 'github')
order by updated_at desc
limit 20;
```

GitHub repository inventory:

Saved query name: `v28_qa_05_vcs_repositories_recent`

```sql
select
  user_id,
  provider,
  repo_full_name,
  repo_default_branch,
  updated_at
from public.vcs_repositories
order by updated_at desc
limit 20;
```

If `vcs_repositories` is not present in the current schema, run:

Saved query name: `v28_qa_05b_github_connection_repository_payload`

```sql
select
  user_id,
  provider,
  connection_data->'repositories' as installation_repositories,
  updated_at
from public.user_connections
where provider = 'github'
order by updated_at desc
limit 10;
```

Terminal Deposit/Read prerequisite consolidation:

Saved query name: `v28_qa_terminal_01_prerequisites_wallet_github_repo`

Use `supabase/queries/v28_qa_terminal_01_prerequisites_wallet_github_repo.sql`.
This is the preferred single-row readiness query before Terminal Deposit/Read QA. `v28_qa_05_vcs_repositories_recent` remains the direct repository inventory check, and `v28_qa_05b_github_connection_repository_payload` is only a fallback inspection when repository rows are unexpectedly absent.

Saved query name: `v28_qa_01b_backfill_profile_wallet_projection_from_connection`

Use `supabase/queries/v28_qa_01b_backfill_profile_wallet_projection_from_connection.sql` only when query 01 shows profile wallet projection warnings but the active wallet connection row has the missing non-secret wallet metadata. Rerun query 01 after this repair and proceed only when the projection warnings clear or are intentionally documented.

Terminal activity write/readback:

Saved query name: `v28_qa_terminal_02_activity_after_write`

Use `supabase/queries/v28_qa_terminal_02_activity_after_write.sql` after every `Record deposit posture`, `Record read posture`, `Record fit posture`, or `Make Bitcode branch` action. This query reports optional runtime tables as missing instead of hard-erroring, so a missing `public.executions` or `public.execution_events` row becomes explicit QA evidence.

Terminal Deposit source alignment:

Saved query name: `v28_qa_terminal_04_deposit_repository_alignment`

Use `supabase/queries/v28_qa_terminal_04_deposit_repository_alignment.sql` after Terminal loads and after each Deposit recording. The query confirms live repository inventory belongs to the connected GitHub account and flags any protocol-demo `frontier/*` reference in recent Terminal Deposit activity.

V28 Deposit/Read data-contract closure:

Saved query name: `v28_qa_data_contract_deposit_read_migration`

Use `supabase/queries/v28_qa_data_contract_deposit_read_migration.sql` after migrations or staging resets. Expected `data_contract_state` is `v28_deposit_read_data_contract_closed`.

- Migration `20260515143000_v28_deposit_read_data_contract` is applied to the linked staging Supabase project.
- `public.btd_asset_pack_ranges` now projects range linkage through `read_id`; the previous live column is absent after migration.
- `public.btd_terminal_journal_entries` accepts `read_submission` as the Terminal journal transaction kind.
- ORM schema types, data-health checks, saved QA SQL, OpenAPI conversation payload docs, protocol demonstration fixtures, and API conversation-stream internals use the current Deposit/Read contract.
- `pnpm db:schema-types:check`, `pnpm db:data-health:daily`, ORM data-health tests, UAPI Terminal/conversation tests, UAPI lint/build, API build, and protocol demonstration V28 QA are the closure evidence for this rename pass.

BTD and ledger projection readback:

Saved query name: `v28_qa_terminal_03_btd_ledger_after_terminal`

Use `supabase/queries/v28_qa_terminal_03_btd_ledger_after_terminal.sql` after any Terminal action that claims Fit closure, AssetPack minting, BTC fee payment, ledger anchoring, settlement, or reconciliation.

### Top Chrome Wallet Readiness

Expected V28 behavior:

- first page load renders an integrated `Reading wallet` indicator while `/api/auxillaries/data` and local wallet identity state are unresolved;
- `Connect Wallet` renders only after the data read has settled with no wallet identity;
- the BTC/BTD widget renders only after a stored or locally staged wallet identity is known;
- a later background revalidation may make the BTC/BTD widget show its own loading posture, but it must not regress to the disconnected CTA while a known wallet exists;
- client telemetry must include `nav:chrome-identity`, `user-data:fetch-start`, `user-data:read` or `user-data:anonymous-read`, and any fetch failure;
- server telemetry must include `auxillaries-data:read-start` and `auxillaries-data:read-finish` or `auxillaries-data:read-failed`.
