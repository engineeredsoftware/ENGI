# Bitcode Spec V28 Notes

## Status

- Version: `V28`
- V28 state: canonical promotion complete; V28 notes record the accepted commercial-product and metadevelopment closure evidence
- Current canonical/latest target: `V28`
- Canonical proof-source commit: `1153286d0785b0d760ea392918575f0083cd570f`
- Prior canonical anchor: `BITCODE_SPEC_V27.md`
- Prior generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v28-spec-family-report.json`, `.bitcode/v28-canonical-input-report.json`, `.bitcode/v28-canon-posture-drift-report.json`, V28 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V28_PROVEN.md` as the generated proof appendix for V28 promotion
- Source parity state: V28 source-side Protocol, Terminal, Reading pipeline, MCP/ChatGPT App, proof, workflow, and promotion surfaces are canonicalized in the promoted V28 file family
- Scope: V28 canonical notes for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment
- Active canonical pointer: `BITCODE_SPEC.txt` -> `V27`.
- Draft target: `V28`.
- Primary V28 focus: commercial Protocol implementation and Terminal MVP QA across Terminal, Auxillaries, BTD range disclosure, MCP API, ChatGPT App, auth/readiness, wallet/BTC/testnet flows, ledgerized journals, and navigation. Exchange and website Conversations are not V28 closure surfaces.
- Adjacent later-version focus: V29 owns deeper Terminal workflows; V30 is reserved for post-V29 Protocol/BTD hardening discovered during V28/V29; V31 owns deeper Auxillaries; V32 owns deeper provation and testing; V33 owns deeper Interfaces beyond the V28 MCP API and ChatGPT App MVP; V34 owns deeper Deployment; V35 owns deeper telemetry and documenting; V36+ owns deeper Exchange and website Conversations.
- Last fully realized canonical target preserved in source: `V28`

This NOTES file does not promote V28.
It records the deep-review handoff from V26 and V27 promotion so V28 starts with known source/spec/proof issues rather than rediscovering them during implementation.

## Notes companion rule

This NOTES file is a drafting companion.
It can capture review findings, discovered source truth, and future-version handoffs, but requirements become binding only when promoted into the V28 SPEC, DELTA, PARITY, proof artifacts, or accepted implementation tests.

## Concise current-system reading

V27 is active canon.
V28 is open as draft target.
V27 provides exact `$BTD` law and crypto primitives; V28 must make the active commercial Protocol implementation and Terminal MVP-operable.

## Simplified-spec reading rule

When V28 docs use simplified product wording, read it through V27 law:
BTC pays fees, `$BTD` is non-fungible, AssetPack ranges are commercial units, Terminal reads are registry-derived, and ledger/database drift must fail closed.

## May 11 Scope Reduction

V28 is narrowed from broad commercial application MVP QA to commercial Protocol implementation plus Terminal MVP QA.
The MCP API and ChatGPT App remain in V28 because they are protocol/interface ingress points that must read the same registry, wallet, access-policy, and proof truths as Terminal.
Exchange and the website Conversations interface are removed from V28 acceptance criteria and deferred beyond V35.

This means:

- V28 QA does not read Exchange route, Exchange master-detail, order-book, bid/ask/buy/sell, range trading, wrapper liquidity, or Exchange acquisition behavior.
- V28 QA does not read the website Conversations route, conversation stream UI, fullscreen conversation editor, or conversation-to-Terminal handoff.
- V28 keeps Terminal, Auxillaries readiness, BTD range disclosure, wallet/BTC/testnet, synthetic measurement, BTD-AssetPack minting, ledgerized journals, database projection, reconciliation, MCP API, and ChatGPT App MVP.
- any retained Exchange or Conversations code is compatibility/future source and must not be a V28 promotion blocker unless it contaminates active Terminal/Protocol/MCP/ChatGPT behavior.

## May 13 Staging-Testnet QA Recalibration

V28 QA now resumes from the real deployed staging-testnet path, not from an isolated mock surface tour.
Mock mode remains important for deterministic regression testing, but manual acceptance must primarily validate the live staging-testnet flow from first onboarding through Terminal transactions.

The V28 natural path is:

1. Wallet first: detect Xverse/Leather/other Bitcoin-capable providers, sign the Bitcode Bitcoin challenge, persist the wallet-backed session through Bitcode's custom Bitcoin-auth boundary, and reflect wallet identity in top chrome and the Wallet pane.
2. Externals second: connect the GitHub App, capture installation/callback state, and read repository inventory needed by Deposit and Read.
3. Profile third: collect optional email/contact/admin posture without treating email as the primary identity primitive.
4. Deposit path: contribute source from the connected repository scope first, synthesize or stage the AssetPack/source-share posture with protocol-specified model and pipeline configuration, and read earning, settlement, or blocked-readiness state.
5. Read/Fit path: express or select the simplest Read after Deposit/source posture exists, run Fit-finding against that available source posture, expose source/proof/dedupe roots, and read the Fit result.
6. AssetPack/journal path: inspect the staged AssetPack/Fit result, synthetic measurement, measuremint/range or zero-cell receipt, access policy, ledger anchor/readiness, and Terminal journal state.
7. Reconciliation path: query Supabase/PostgreSQL projections and compare them to Terminal journal, ledger anchor, wallet, GitHub, AssetPack, and telemetry state.

This recalibration means the QA document, parity matrix, and implementation work should now classify every finding by the lowest-level source-of-truth it affects: wallet identity, GitHub/source scope, Fit-finding, AssetPack synthesis, ledgerized journal, PostgreSQL projection, pipeline runtime, telemetry/alerting, or legacy residue.

Supabase/PostgreSQL data-health checks are part of the V28 acceptance apparatus, not a separate operator convenience. The ORM package now owns reusable schema, identity, Terminal, ledger, and operational check manifests plus live runners for daily staging/production validation, CI E2E validation, local QA reports, and generated schema-type coverage. These checks must preserve the core boundary: Supabase rows are ledger-derived or Bitcode-canonical projections, while ledger anchors, signed wallet proofs, Terminal journal receipts, and canonical receipts remain the source of cryptographic truth.

May 14 staging-testnet verification added the first repository-owned RLS repairs after the dashboard-origin RLS bootstrap. `20260514173000_enable_pipeline_runs_rls.sql` enables RLS on `public.pipeline_runs`, and `20260514175000_enable_pipeline_runtime_rls.sql` enables RLS on server-managed pipeline runtime tables reported by Supabase Security Advisor. These preserve existing service-role pipeline posture and move runtime internals to deny-by-default for browser roles unless a narrower policy is later specified. The live daily data-health suite now passes 25/25 checks against the staging Supabase project, live ORM E2E tests can load `.env.local` directly for local QA parity with the CLI runner, and the advisory-style RLS probe returns no public tables with policies/browser grants while RLS is disabled.

May 14 live deployment QA proved the custom Bitcoin OAuth path through Supabase Auth after the project Site URL was corrected from localhost to `https://bitcode.exchange`. The Supabase custom provider created the expected `auth.users` and `auth.identities` rows for `custom:bitcode-bitcoin`; Bitcode then projected the same user into `public.user_profiles.settings.bitcodeProfile.walletBinding` and `public.user_connections.provider='leather'`. V28 QA SQL and data-health checks therefore read wallet binding through the canonical JSON settings path, not nonexistent flat `user_profiles.wallet_*` columns.

Fresh-nuke onboarding then exposed a timing gap: Supabase Auth and the empty trigger-created profile existed immediately, while Bitcode's wallet projection appeared only after the app remounted the Wallet pane and replayed the locally signed proof. V28 now treats that gap as unacceptable for first-run readiness. A route-global wallet session persistence bridge must replay any locally signed Bitcoin wallet proof once a Supabase session exists, so callback-to-root, hard refresh, or Terminal landing all converge on the same `user_profiles.settings.bitcodeProfile.walletBinding` and `user_connections` projection before GitHub onboarding proceeds.

Live staging OAuth also exposed two callback hardening requirements. First, the custom wallet authorize page must not rely on a single provider scan at first render because browser wallet extensions can inject provider globals after the route has already hydrated; `/tps/wallet/authorize` must retry discovery, expose an explicit rescan, and preserve the provider hint fallback so Leather/Xverse can still open even when the first scan is empty. Second, the Supabase callback exchange must be idempotent: if the first exchange succeeds and hydration recovery or remount tries to exchange the same code again after the PKCE verifier was consumed, the callback must prefer the already-established session over redirecting to a false login error. Staging URL configuration must also allow both `https://bitcode.exchange` and `https://www.bitcode.exchange` callback routes until a single canonical host redirect is enforced.

The same clean-deploy pass removed Auxillaries as a standalone page destination. Supabase and GitHub callbacks, retained `/auxillaries/*` compatibility paths, and retained `/orbitals/*` paths must land on `/terminal?auxillary-open-to=<pane>` so Auxillaries opens as the global overlay and never renders the retired late-Engi workspace page or left-sidebar navigation. The left execution sidebar and disabled AssetPacks tab are not part of the V28 website application surface; retained sidebar components may remain for future repurposing but must not be mounted by the active layout.

May 14 GitHub App onboarding then closed the second live prerequisite. The first staging callback failed because Vercel received an unsupported private-key representation; the GitHub JWT helper now accepts PEM with real newlines, escaped-newline PEM, base64-encoded PEM, or a single-line PEM with markers, and rejects local `.pem` file paths as deployment misconfiguration. The follow-up pass connected installation `132358627` for `engineeredsoftware`, persisted the provider-scoped `user_connections.provider='github'` row, and backfilled `public.vcs_repositories` from live GitHub inventory when the connection payload carried an empty repository array. For V28 Terminal QA, `public.vcs_repositories` is the authoritative GitHub source inventory projection; `connection_data.repositories=[]` is not a blocker once `vcs_repositories` contains the installed repositories.

Terminal Deposit/Read QA now starts from a real deployed staging-testnet prerequisite state: Leather wallet-authenticated Supabase user, Bitcode wallet binding projection, GitHub App installation, and repository inventory containing `engineeredsoftware/ENGI`. The next acceptance step is write/read parity for Terminal Deposit, Read, Fit, and branch/settlement posture, in that order, because Read/Fit cannot be meaningfully validated until a Deposit/source posture exists as candidate supply. Saved Supabase queries `v28_qa_terminal_01_prerequisites_wallet_github_repo`, `v28_qa_terminal_02_activity_after_write`, and `v28_qa_terminal_03_btd_ledger_after_terminal` are the current operator evidence set for this phase.

The first Terminal prerequisite pass also exposed a profile round-trip drift: later Profile writes could preserve wallet address/provider/status while dropping `network`, `authAddress`, `paymentAddress`, `proofKind`, and `addressType` from `settings.bitcodeProfile.walletBinding`. V28 treats `user_connections` as the active provider connection record, but the profile projection must retain the same non-secret wallet metadata for UI/readiness parity. The profile contract and profile write path now preserve those fields, and `v28_qa_01b_backfill_profile_wallet_projection_from_connection` repairs existing staging rows from the active wallet connection before Terminal write QA continues.

## May 15 Single-Deposit Reading/Fit QA Focus

The first successful staging Deposit placed a live repository revision into the
Bitcode data-space. That makes the next QA step commercially sharper: Reading
must prove whether Bitcode can discover, rank, synthesize, and explain a worthy
Fit from the only available deposited source, not from protocol-demo fixtures or
broad mock state.

The active QA fixture currently uses ENGI because that is the deposited source
available in staging. That fixture must not become a commercial Terminal
special case. Product logic must remain generic across user, provider,
repository, branch, commit, and deposited source.

The active QA scenario is therefore single-deposit:

- data-space: the latest deposited repository revision row, currently exercised
  with the `engineeredsoftware/ENGI` fixture, with repository, branch, commit,
  signer, wallet authorization, and asset fit deposit evidence;
- Read: determine whether the deposited repository contains a complete
  Terminal-backed path from wallet/GitHub readiness through Deposit, Read/Fit,
  AssetPack evidence, proof/finality readback, and Supabase/ledger
  reconciliation;
- expected positive outcome: a minimal, proof-bearing AssetPack fit that cites
  exact deposited source revision evidence and names any settlement/finality
  blockers honestly;
- expected negative outcome: no-worthy-fit or clarification when the Read is
  unrelated to ENGI's deposited source or too broad to measure.

Saved query `v28_qa_terminal_06_read_fit_quality_after_read` is the QA readback
for this focus. It is intentionally stricter than the generic activity query:
it checks Deposit before Read, Read before Fit, repository/branch/commit
alignment, frontier/mock leakage, and visibility of proof or measurement
posture in the execution rows.

## May 16 Pipeline Harness Telemetry Boundary

Read/Fit review now requires proof that the deployed AssetPack pipeline host
actually executed, not only that Terminal wrote a Fit posture row.

The active harness target is Vercel Sandbox: ephemeral Amazon Linux microVMs
with Node/Python runtimes, isolated filesystem/process/network scope, exported
artifacts, and database readback. Local development authenticates through
`vercel link && vercel env pull` OIDC credentials; deployed Vercel code receives
OIDC automatically; external hosts need `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and
`VERCEL_PROJECT_ID`.

The staging API surface for this harness is
`POST /api/pipeline-harness/asset-pack`. It is authenticated by the normal
Supabase session, disabled on production deployments unless
`BITCODE_ENABLE_PIPELINE_HARNESS_API=1`, and returns server-sent events for host
lifecycle, command, artifact, completion, and failure visibility. For private
repository sources it may reuse the authenticated user's GitHub installation
token as clone credentials; the token must never be returned in streamed events.
Local pre-promotion harness debugging may upload
`git diff --binary $BITCODE_SANDBOX_SOURCE_REVISION` as a source overlay, but
such runs are explicitly QA-only and cannot serve as source-revision settlement
or finality evidence.
For generation, `BITCODE_LLM_PROVIDER` and `BITCODE_LLM_MODEL` may pin the
commercial model; if absent, V28 staging selects OpenAI when `OPENAI_API_KEY` is
the only configured model credential rather than silently requiring Google. A
provider pin without its matching credential is ignored by the harness command
environment.
The runner must also terminate itself before caller timeout by emitting a
`PipelineHarnessTimeoutError` blocked-readiness artifact with the last
execution and stream events.

The minimum commercial telemetry record for a Read/Fit pipeline run is:

- one run row in `pipeline_runs` or `deliverable_pipeline_runs`;
- event rows in `execution_events`, `stream_logs`, or
  `deliverable_pipeline_events`;
- SDIVF phase rows in `deliverable_pipeline_phase_delegations`;
- PTRR agent-step rows in `deliverable_pipeline_agent_steps`;
- generation rows in `deliverable_pipeline_generations`, including
  interpolated messages/prompts when available, model provider/name, raw
  response, parsed/typed output, usage tokens, phase, agent, step, failsafe, and
  generation context;
- tool rows in `deliverable_pipeline_tool_executions`, including input, output,
  error, timing, phase, and agent context;
- fit/depository output carrying `depositorySearch`, fit deposit ranking,
  `fitResult`, `queryRoot`, `rankingRoot`, selected candidate asset ids, and the
  embedding policy.

Depository vector recall remains one canonical vector space until explicitly
remigrated: OpenAI `text-embedding-3-small`, float embeddings, 1536 dimensions,
`deliverable_vectors.embedding vector(1536)`, `ivfflat`,
`vector_cosine_ops`, and `match_deliverable_vectors` cosine similarity. Any
different embedding model, dimension, metric, table, or RPC is a blocker unless
all stored candidate vectors and query vectors for the compared space were
regenerated under the same policy.

Saved query `v28_qa_terminal_07_pipeline_harness_after_fit` is the pipeline
harness gate. `blocker:pipeline_harness_run_missing`,
`blocker:pipeline_event_telemetry_missing`, and
`blocker:pipeline_phase_trace_missing` all keep the commercial Fit in
blocked-readiness even when Deposit, Read admission, and source-bound Fit
posture rows exist.

The May 17 continuation makes the closure criterion stricter: V28 is not closed
by proving the sandbox can start. It closes only when the commercial harness can
reliably run the AssetPack pipeline against the deposited depository asset
space, perform candidate finding/ranking, emit `fitResult` and
`depositorySearch` roots, synthesize a source-bound AssetPack when the evidence
is worthy, and journal/read back the result without claiming BTC fee, range,
settlement, or finality rows that do not exist. Failed runs remain useful
evidence only if they export the execution tree, phase/agent/generation/tool
telemetry, prompt/context inputs, raw outputs, parsed/cast outputs, and exact
blocked-readiness reasons.

The May 18 source-bound staging-testnet run closes that current harness gate:
Vercel Sandbox executed the deposited ENGI revision without a source overlay,
selected candidate `manual-deposit-qa`, wrote `depositorySearch` and
`fitResult` roots, synthesized a `worthy_fit` AssetPack, shipped it as a
GitHub pull request, and read back synchronized pipeline telemetry plus BTD
range, reader BTC fee, depositor ownership, reader license, Terminal journal,
ledger anchor, and crypto telemetry rows. The accepted branch/lane for this
evidence is staging-testnet Supabase project `tkpyosihuouusyaxtbau`; production
mainnet remains project `rinalyjfecxnmyczrpzo`.

## May 15 Terminal Terminology Closure

V28 now retires user-facing Deposit/Depositing and Read/Reading language in favor of Deposit/Depositing and Read/Reading.
Deposit is the source-supply act: repository inventory, branch, commit, signer, selected source, and candidate AssetPack posture.
Read is the demand/measurement act: the demand frame that reads against deposited source posture before Fit, proofs, finalities, ledgerization, and reconciliation.

Implementation parity is judged at the visible copy boundary.
Persisted/API compatibility carriers containing `deposit`, `read`, or `read-measurement` remain acceptable only when they are route names, schema fields, enum values, proof IDs, artifact IDs, component filenames, or test fixture IDs whose immediate rename would require a separate schema/API migration.
Active Terminal UI, public docs, QA instructions, tooltip prose, and test-visible assertions must translate those carriers to Deposit/Read language.

### Deterministic Model Boundary

V28 must remove the idea that a user can choose ledgerized Bitcode synthesis models.
User model selection breaks replay and parity when the selected model can affect Fit-finding, AssetPack synthesis, semantic measurement, measureminting, proof admission, or journaled settlement.

The allowed boundary is narrow:

- conversation UX may offer user-facing model preferences only for draft, non-ledgerized conversation behavior;
- ledgerized Terminal/Protocol behavior must use protocol-specified model identities, versions, prompts, thresholds, toolchains, and receipt-bound configuration;
- any "apply to all" model control visible in active Auxillaries/Interfaces must be removed, disabled, or scoped to non-ledgerized conversation interfaces before V28 promotion.

Current source audit flags `apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx` and `apps/uapi/app/auxillaries/components/models/GlobalModelSelection.tsx` as likely V28 cleanup points because they still present broad user-driven model preference behavior.

## QA Scope Refinement

Screenshots captured on May 6, 2026 show the active Auxillaries experience mixing the old orbital shell with the newer contained tabs-left approach.
The issue appears in sign-in, create-account, and signed-in profile states: large orbital backgrounds and layout wrappers push or obscure the active contained pane, and old card styling conflicts with the simpler commercial app shell.

This is V28 work.
It should not wait for V31 Auxillaries expansion because it affects the current commercial MVP experience.

V28 therefore starts as commercial Protocol/Terminal MVP QA:

- clean active Auxillaries auth/profile/readiness states to the contained tabs-left model;
- keep any old orbital aesthetic only as isolated styling reference or inactive retained route behavior;
- QA `/`, `/terminal`, `/auxillaries/*`, `/btd/[assetPackId]`, MCP API routes, ChatGPT App entrypoints, and Protocol routes, with Exchange and website Conversations disabled/hidden for V28 QA;
- then advance Terminal transaction depth once the application shell is commercially coherent.

## QA Workshop Notes

### Top-right BTD balance widget

Manual QA on May 6, 2026 showed the signed-in balance widget rendering `0.042 BTC | 1,200 $BTD`, using a raw pipe separator, explaining BTC/BTD ontology in the native hover title, and presenting `Acquire BTD` as the hover action.

V28 refinement:

- render BTC and BTD as peer wallet facts: `BTC` and `BTD`, not `BTC` and `$BTD`;
- replace the literal pipe character with a styled vertical divider;
- use hover title context for the user's most recent BTD AssetPacks when known;
- leave hover title absent when no recent AssetPack facts are known instead of showing explanatory copy;
- use the hover action for the connected wallet label: show the wallet nickname when one exists and otherwise show a middle-truncated Bitcoin address;
- click the widget into the Wallet auxillary pane, leaving Exchange acquisition/trading deferred beyond V35 and any BTD-relevant activity visible through Terminal/Protocol activity readbacks;
- keep the demonstration protocol aligned with a source-reading V28 MVP QA proof.

Manual follow-up QA on May 6, 2026 passed after tightening the divider and icon spacing:

- resting state reads `0.042 BTC | 1,200 BTD` visually with a styled divider rather than a literal pipe;
- hover state reads wallet identity without layout shift;
- hover title lists recent BTD AssetPacks and does not explain BTC/BTD ontology;
- click opens the Wallet auxillary pane without console errors.

Follow-up Exchange landing QA previously revealed that the Exchange client was appending `transactionId=mock-run-branch-remediation` and scrolling to the lower `Finish-delivered Shippables` section after the widget click. That work is no longer V28 closure after the May 11 scope reduction. The V28 rule is now that the BTD widget opens the `$BTD` wallet auxillary pane and Exchange is disabled/hidden for V28 QA; deeper Exchange behavior moves beyond V35.

Manual QA is now paused while V28 moves the same product-experience granularity into Playwright.

The automated V28 commercial-MVP suite must be product-experiential, not generic smoke testing:

- each active commercial route is asserted as a readable product surface;
- each micro-interface receives local assertions for visible state, copy, interaction, and route consequence;
- stitched flows bind micro-interactions across active V28 product surfaces, such as BTD widget -> `$BTD` auxillary, BTD range -> Terminal/protocol readback, Docs -> Terminal, MCP/ChatGPT readiness -> Terminal proof posture, and Auxillaries pane navigation;
- activity controls are tested as URL-addressable commercial state, including Terminal filters, active-filter chips, reset behavior, and BTD/protocol readback parameters;
- configuration controls are tested as persisted commercial consent, including the BTD auxillary data-share toggle path through `/api/auxillaries/user/data-share`;
- public docs coverage includes the guide home plus each shipped article route so commercial product learning does not regress into dead or unreadable pages;
- responsive checks run inside the commercial suite so obvious phone/widescreen regressions surface before manual QA resumes;
- every test captures console errors, uncaught page errors, framework overlays, route readability, and visible main content.

The initial implementation target is `apps/uapi/tests/e2e/commercial-mvp*.spec.ts`, with the deterministic mock-mode runner `pnpm -C apps/uapi run test:e2e:commercial-mvp`.
That runner should remain serial unless the shared Next dev server and route-level mock harness are proven concurrency-stable; the purpose is product-experience proof, not parallel load testing. The harness owns Auxillaries profile/model-preference/data-share state and conversation streaming so QA can distinguish UI regressions from unavailable local wallets, provider accounts, or database sessions.
Commercial QA also exposed a provider-package dependency boundary issue: `@bitcode/generic-llms` directly requires AI SDK, Google, OpenAI, and Anthropic bindings, so V28 declares those runtime dependencies in that package rather than relying on the UAPI host dependency tree. Module-resolution warnings from provider packages are not acceptable QA noise.

Manual QA resumed on May 7, 2026 as a big-picture commercial application MVP pass.
The running collaborative QA document is `BITCODE_V28_QA.md`.
This pass explicitly de-scopes marketing-page critique except for navigation-entry regressions and now focuses on identity/auth, Terminal, Protocol/BTD, Auxillaries, MCP API, ChatGPT App, .docs/API/interface claims, and testnet-readiness honesty.
The first resumed pass confirmed the top navigation, notifications, profile menu, logo/page indicator, BTD/BTC balance posture, Auxillaries opening, pane selectability, no console errors, and no old orbital shell collision.
It also opened an Auxillaries V28 polish issue: selector cards must replace visible `lane ready` / `lane active` prose with clearer indicators, and the overlay/panes read minor hierarchy, legibility, spacing, and border cleanup before Auxillaries shell closure.
The first Terminal big-picture pass found the Terminal acceptable as the primary operator surface for V28 MVP orientation and reported no console errors.
Detailed checks for activity ledger comprehension, selected detail, support panels, Deposit/Read/Fit/proof/AssetPack/BTC/BTD visibility, row selection, and detail-tab stability remain in the V28 QA queue.
Terminal prose clarity and deeper copy refinement are explicitly deferred to V29 unless a wording issue blocks basic V28 use.

The next Terminal pass refined that judgment: Terminal is acceptable as the primary operator surface, but the master-detail concept was assigned to the wrong product surface in current copy and visible structure.
V28 must correct this before closure.
Exchange owns the master-detail experience: the master is the searchable activity table over whole-Exchange or user-owned activity, and detail is the selected activity state.
Terminal owns Deposit, Read, closure, and operator transaction work; it may reuse the same activity table, but it must frame that table as recent/scoped Terminal activity and executed Deposit/Read results rather than the whole Exchange master.
The pass also opened V28 issues for dead or ambiguous click targets, static capsules that visually resemble buttons, and Terminal grouping/legibility that is dense enough to slow judgment.
V28 should fix the architectural copy, obvious no-op targets, and clickable/static affordance boundary now; V29 should deepen Terminal transaction sequencing, prose, and full workflow organization.

Exchange master-detail is now specified more precisely for V28 QA: the master is the searchable/filterable activity table containing all Exchange-visible activity types, including Reads, Deposits, closures, proof refreshes, and later marketplace events.
Selecting a master row opens rich selected-activity detail.
The detail must carry all facts from the master row plus relevant non-column facts that belong to the activity: summary, status, participant, ownership, repository/branch, action lens, proof posture, closure focus, timing, measured BTD, BTC fee basis, token/latency/accounting metrics, payload, proofs, AssetPack evidence, history, and any activity-specific Deposit/Read/closure state available at MVP depth.
V28 does not read V30-level market depth, but it must be sufficiently complete to QA the activity system as a real commercial primitive rather than a decorative table.

Implementation refinement after the clarified Exchange master-detail design:

- Exchange now renders the activity table/search/filter controls as the master pane and the selected activity detail as a named detail pane.
- Exchange selected detail includes the identity/payload card on every detail focus so table-column facts and non-column facts remain visible while the operator reads Shippables, proofs, closure, history, or execution-stream detail.
- Exchange route synchronization is guarded against stale route writes so generic entry, BTD widget entry, row selection, and detail tab focus do not unexpectedly redirect or scroll.
- Terminal no longer presents itself as the Exchange master-detail surface. It uses the shared activity table as a recent/scoped Terminal result surface and adds a compact operator-lane map for Recent Activity, Deposit, Read, and Closure.
- Terminal result digest actions now change the active detail section before scrolling, which closes the known no-op detail-card action class found in manual QA.
- Static overview badges were visually quieted relative to actionable chips/buttons so clickability is more apparent during the next manual QA pass.
- Bare `/terminal` no longer writes default provider/repository/transaction query state during route load. Explicit route context and user selections remain URL-addressable, the old Terminal route redirects to `/terminal`, and public navigation can move Terminal -> Docs without being overwritten by hydration-time route synchronization.
- Conversations split-pane QA now uses stable commercial mocks for execution pickers and stream responses, and the source selector treats missing or variant repository/branch/commit payloads as empty collections rather than crashing the fullscreen route.
- Demonstration witness stylesheet source paths and identifiers are unversioned and precise: `demonstration-witness-scoped-styles`, `demonstration-witness-styles`, `demonstration-witness-theme-overrides`, `bitcode-demonstration-witness-root`, and `bitcode-demonstration-witness-stylesheet` replace explicit gate-named source carriers. `AGENTS.md` now records that implementation source is implicitly versioned to the active canon and current gate, not explicitly versioned by route/file/CSS/test names.
- The prior automated V28 commercial MVP baseline was `pnpm -C apps/uapi run test:e2e:commercial-mvp`, which passed 50 laptop-project tests after the earlier Exchange, Terminal, Auxillaries, Conversations, BTD, docs, responsive, and stitched-nav fixes. After the May 11 scope reduction, V28 proof must narrow or split that runner so Exchange and website Conversations are not required for closure.

The same pass also reclassified active `orbitals` naming as legacy residue when it appears in current commercial Auxillaries source, visible copy, mock-mode naming, or test names.
Redirect-only `/orbitals/*` compatibility can remain documented as compatibility until it is removed, and old stylesheet class names can remain temporarily only where they are inert styling carriers.
Active product language and touched implementation should converge on Auxillaries.

V28 also owns the first hard separation between the standalone protocol demonstration and commercial Bitcode runtime source.
The demonstration remains a sibling reference implementation and proof witness, not a workspace package that commercial UAPI can import.
Commercial source must import formal protocol primitives from `packages/protocol` / `@bitcode/protocol`, and the UAPI Terminal witness must read formal protocol package assets rather than `protocol-demonstration/public`.
The standalone `protocol-demonstration` runtime must not import UAPI or commercial packages; proof tests may continue to read commercial source as audit material only when the read is explicitly a parity/proof source-read, not a runtime dependency.
V28 closes this as a boundary baseline; V29 must continue commercializing freshly ported protocol internals into cleaner packages and narrower APIs.
Dual-lane setup smoke also found that the embedded demonstration witness could overwrite the commercial Terminal browser title with `Bitcode Demonstration`.
That is a commercial/demonstration boundary leak, so V28 now requires the mounted witness bundle to guard document-title writes when hosted inside `/terminal`; standalone demonstration may keep its demonstration title.
The same deployment-readiness pass found a Vercel production build failure in `lib/bitcode-app-context.ts` because the newly formalized `@bitcode/protocol` package exported runtime JS from `packages/protocol/src/**`, while those files were still ignored by the generic "package TS build output" rule.
V28 treats this as a commercial MVP blocker: formal protocol package imports must resolve from a clean git clone during local and Vercel `next build`.
The repository now explicitly unignores the `@bitcode/protocol` runtime JS source and package-boundary tests, the commercial protocol boundary test asserts required protocol runtime files are present and not ignored, and clean-repro builds pass after those runtime files are present in the clone.

V28 also synchronizes demonstration fit-finding as a strict local witness. The
demonstration may rank local deposited fixtures and synthesize a minimal proof
root for a source-bound Read, but it must remain deliberately small and must not
import commercial pipeline, registry, prompt, agent, tool, Vercel, Supabase, or
UAPI packages. Commercial code remains the maximal implementation and must
reuse Bitcode's formal packages for pipeline hosts, pipeline primitives,
registries, prompts, PTRR agents, tools, depository search, embedding policy,
BTD receipts, journals, ledgers, and interface-specific API/UI integration.

Manual QA was re-ordered on May 8, 2026 into two directionalities and narrowed again on May 11, 2026.
The first is natural operator progression: connect wallet/GitHub/identity prerequisites, perform the fastest simple Read through Fit/settlement/delivery readback, then perform the fastest simple Deposit through measurement/earning/settlement readback.
The second follows public documentation order: Start Here, Terminal and Protocol, Operator Modes, Protocol and Proof, and Commercial Interfaces.
This is now the V28 workshop roadmap because it tests the application the way a user learns it while also validating the docs against the product.
Surface-by-surface QA still matters, but it is subordinate to these flows: every issue should name the flow that revealed it, the product surface that owns it, and whether V28 must fix it or a later focused version owns it.

Each V28 manual QA pass now runs in two environment lanes.
The Mock lane runs first with deterministic mocks enabled so visual behavior, copy, route state, and happy-path interaction can be judged without external-service volatility.
The Testnet-readiness lane follows with public mock flags disabled and `NEXT_PUBLIC_BITCODE_ENV=testnet`, preserving Terminal/Auxillaries/Create Account entry while exposing real provider, signer, GitHub, database, BTC broadcaster, ledger observer, MCP API, ChatGPT App, and interface readiness.
V28 does not require that every live credential already be provisioned, but it does require that missing live/testnet dependencies fail closed with readable readiness rather than silent mocked success.
This dual-lane process is intentionally earlier than V34 deployment deepening: it guards V28 MVP QA against mock-only confidence while leaving production deployment, host capabilities, distributed execution, CI/CD promotion, and operational rollback to V34.
The first restarted 1A mock-lane pass showed a readiness/cache edge case: Auxillaries indicated mock mode, but the top chrome rendered zero BTC/BTD and an empty notification tray after prior mock values had been visible.
V28 closes this as an MVP QA bug, not a user-data polish item.
Master mock mode must activate auxillaries mock data consistently in client and server code, public mock flags must be visible to the Next client bundle, and shared user-data cache must revalidate on fresh mounts so environment-lane changes cannot preserve anonymous or zero-valued state.
The same 1A verification also found that simultaneous mock and testnet-readiness dev servers must not share the same Next build artifact directory.
V28 QA therefore requires lane-specific `NEXT_DIST_DIR` values for local dual-lane runs, because the client bundle compiles public env values while the server routes read process env at request time.
Without isolated artifacts, the testnet-readiness lane can appear mock-authenticated even while its `/api/auxillaries/data` response correctly returns anonymous zero-state.

The next 1A Auxillaries/Profile/Externals slice exposed four MVP shell issues and closed them in source and tests.
The active contained pane must own vertical scrolling; the overlay shell may constrain height, but it must not trap the operator above lower profile, wallet, or repository controls.
Selector-card state must render as visual indicators rather than `laneactive` / `laneready` prose, while retaining accessible labels and machine-readable state for tests.
Async profile props must hydrate into editable local fields after mock/live data arrives, so display name, bio, company, avatar, and team data do not remain blank after the email field has already loaded.
The BTC/BTD widget must render a compact wallet-reading posture while fresh lane-specific data loads or while stale anonymous zero-state is being revalidated; zero BTC/BTD may be shown only as a settled data state, not as an unceremonious hydration flash.
Terminal-opened Auxillaries fullscreen must fill the operator viewport as a working overlay, not as a centered modal that leaves a navigation-height dead band below it.
The contained selector/pane grid must use a single bounded row, with selector cards and the active pane owning their own internal scroll surfaces.
Profile must remain long-form enough to expose identity, wallet, access-provider, and save controls, but its vertical rhythm must be tightened so scrolling feels like a contained product pane rather than a legacy onboarding form dropped into the commercial shell.
The account-menu Auxillaries entry may reuse the pre-V26 solar-system visual language when it improves product legibility and polish, but the source and visible product naming must remain Auxillaries/Bitcode rather than restoring Orbitals as a commercial construct.

The following 1A resume exposed a second Auxillaries MVP shell slice.
All portal entry into Auxillaries, including unauthenticated `Connect Wallet` from the non-mock top chrome, must use the contained Auxillaries shell rather than falling back into the old onboarding/orbital shell.
The contained selector should not duplicate pane names with both lane labels and centered titles; the centered pane title plus top-right visual state indicator is the V28 pattern.
Auxillaries edits are application settings and should auto-save; visible Save buttons belong to legacy/onboarding behavior and should be removed from the contained commercial panes.
The Wallet pane must highlight BTD and BTC balances strongly, avoid long-address overflow, and include the shared Terminal/Protocol activity-table grammar for BTD-relevant activity even when testnet-readiness has no ledger-derived events yet.
The notification dropdown is part of prerequisite trust and must keep titles, timestamps, pills, messages, and actions legible without awkward line breaks.

The next May 9 1A patch tightened this into implementation-level V28 expectations.
The notification dropdown should not contain a redundant Auxillaries launcher in its footer after the top chrome and profile menu already own that entry.
The contained Auxillaries surface must avoid global intrinsic-size rendering shortcuts that can make Profile unscrollable on first open.
Selector-card hover motion may remain, but the selector rail must reserve enough top space that the first card border is never clipped.
The `$BTD` pane hierarchy is now: one large BTD balance row; one sub-stat row for owned AssetPack count and BTC wallet liquidity; then compact identity, membership, policy, range, and read-branch cards.
System explanations for these cards belong in tooltips and accessible labels, not as visible description cards competing with the user's values.
The V28 prerequisite posture is narrowed to Bitcoin wallet authentication and GitHub repository connection; Google and broader identity/provider surfaces are outside the primary V28 prerequisite path.
Mock and testnet-readiness Auxillaries must keep the same pane order and shell regardless of which caller opens the overlay.

The May 9 wallet-first onboarding correction makes Bitcoin wallet identity the first and minimum authentication action.
Email is no longer allowed to present as the primary Profile authentication path.
The Profile onboarding order is now:

1. Bitcoin wallet authentication connects a Bitcoin-capable wallet provider, captures a Bitcode Bitcoin authentication proof when available, and establishes wallet identity for the staging profile. Xverse is preferred through Sats Connect provider discovery and `wallet_connect`; Leather is supported through `window.LeatherProvider.request('getAddresses')` plus `signMessage`; UniSat/OKX remain fallback providers; MetaMask BTC remains manual-staging-only until a documented Bitcoin dapp provider or Snap bridge is implemented.
2. GitHub repository connection follows and is required for Deposit and Read; V28 Terminal read-only orientation may proceed from wallet identity alone, but repository/source-scope actions must stay blocked until GitHub is connected.
3. Email is optional and exists for notifications, Bitcode updates, and recovery/contact posture.

Implementation must therefore keep wallet auth enabled and top-most in Wallet, avoid the Ethereum provider path for Bitcoin identity, persist wallet-provider binding only through the wallet-auth route when backend session state is available, keep Profile from accepting unverifiable provider-managed signer assertions, and surface staging prerequisites clearly.
The live wallet selector must also be provider-explicit: the Wallet pane should disclose detected Bitcoin wallets and expose direct Xverse and Leather actions when both are installed. This avoids the observed QA failure where a silent or stalled Xverse handoff could make the single generic connect button appear inert while Leather was also available.
Non-mock QA requires a browser with Xverse and/or Leather installed and unlocked for the first pass; Xverse should be tested first on Testnet4, then Leather on its documented testnet lane. If only MetaMask's injected Ethereum provider is available, Bitcode must not open an Ethereum account prompt and may only stage the displayed Bitcoin address manually until a Bitcoin provider API is available. The `user_connections` provider-constraint migration and GitHub OAuth or GitHub personal-access-token credentials remain required for backend persistence and the second step.
The contained Auxillaries overlay is not the progressive onboarding wizard.
Wallet connection inside `/terminal?auxillary-open-to=wallet` must remain on Wallet, must not auto-advance to Externals, and must not call `/api/auxillaries/onboarding` when the overlay is being used as the commercial contained settings surface.
If Supabase staging credentials are missing or placeholder values, the wallet proof remains locally staged and the UI may show backend persistence pending, but the client must not emit noisy failed Supabase signup requests.

The May 9 follow-up QA tightened the connected-wallet chrome and ownership boundaries.
Profile must not render GitHub connection controls; it may point the operator to Externals after wallet identity exists.
Externals owns GitHub because repository scope is shared by Terminal, future Exchange rereads, and future interfaces.
The top chrome must use wallet identity as a sufficient signed posture for BTC/BTD balance display even before Supabase/email identity is present.
The BTD tracker hover/action area now identifies the connected wallet and opens the Wallet auxillary pane.
Externals must use that same wallet identity as a sufficient prerequisite to render GitHub connection controls; optional email/Supabase session state may improve persistence and notifications, but must not hide the second onboarding step after Bitcoin wallet identity is staged.
Verbose QA telemetry is allowed behind explicit flags so local testnet passes can observe provider detection, Leather/Xverse signing, local wallet persistence, user-data merge, navigation identity, and BTD auxillary entry without making normal production consoles noisy.

The May 12 Supabase auth correction makes signed Bitcoin wallet auth the session origin, not a post-hoc anonymous-session attachment.
Supabase built-in Web3 providers do not cover Bitcoin wallet providers, so V28 defines a Bitcode-owned custom OAuth2 provider named `custom:bitcode-bitcoin`.
The provider authorization page is `/tps/wallet/authorize`; it detects Bitcoin-capable browser wallets, captures a signed Bitcode Bitcoin authentication message, and redirects back to the Supabase callback with an authorization code.
The machine endpoints are `/api/wallet/oauth/token` and `/api/wallet/oauth/userinfo`.
Token exchange validates the configured OAuth client secret, allowed Supabase callback origin, and PKCE challenge when present.
UserInfo returns a stable Bitcoin subject and wallet claims (`bitcoin_address`, provider, network, auth/payment address, proof kind) with email optional.
After Supabase creates the session, the global wallet session bridge synchronizes the captured local wallet proof into `/api/wallet/authenticate` so the Supabase data realm can project wallet identity from the ledger-facing signed proof even when the callback lands on Terminal.
Sign-out clears both the Supabase auth session and the local staged wallet identity.

The May 13 Leather documentation ingestion formalizes Leather as a tested first-class V28 wallet adapter.
Leather injects `window.LeatherProvider` and exposes `request(method, params)`.
V28 implementation must use only the documented Bitcoin methods for Bitcode wallet work:

- `getAddresses` for active-account BTC addresses, locating `p2wpkh` and `p2tr` entries with `.find` rather than fixed indexes;
- `open` as an explicit wallet-opening utility only, not as proof of authentication;
- `signMessage` with explicit `paymentType`, `network`, and derived `account` when available for Bitcode challenge signing;
- `signPsbt` with hex PSBT payloads, optional `signAtIndex`, optional broadcast, and no server custody;
- `sendTransfer` for direct Bitcoin transfer requests when Terminal later needs a minimal BTC fee transaction path.

Leather Stacks methods are documented but outside V28 Bitcode wallet-auth acceptance unless a future Stacks bridge/version explicitly admits them.
The Leather docs expose `mainnet`, `testnet`, `signet`, `sbtcDevenv`, and `devnet`; V28 maps the staging Testnet4 operator lane to Leather's documented `testnet` parameter until Leather publishes a distinct Testnet4 enum.
Optional `@leather.io/rpc` typings may be adopted later, but V28 keeps local minimal request typings to avoid adding a dependency during MVP QA.
V28 still treats BIP322 signature verification as a captured-proof boundary (`server_signature_verifier_pending`) unless a verified server-side Bitcoin signature verifier is added before promotion; that verifier should become a V28 blocker only if signed-wallet identity is promoted from captured proof to cryptographic verification.

These changes remain V28 scope because they are MVP-readiness and trust issues.
The deeper Auxillaries version retains hierarchy, spacing, diagnostics, recovery, and provider-management expansion after V28 proves the contained shell, mocked prerequisite reads, fail-closed testnet-readiness, and no-console-error baseline.

## Promotion Review Basis

The V28 handoff is grounded in:

- `BITCODE_SPEC.txt` now pointing to `V27`.
- V27 promoted family: `BITCODE_SPEC_V27.md`, `BITCODE_SPEC_V27_DELTA.md`, `BITCODE_SPEC_V27_NOTES.md`, `BITCODE_SPEC_V27_PARITY_MATRIX.md`, and `BITCODE_SPEC_V27_PROVEN.md`.
- V27 closure proofs under `.bitcode/v27-*`.
- V26 promoted family: `BITCODE_SPEC_V26.md`, `BITCODE_SPEC_V26_DELTA.md`, `BITCODE_SPEC_V26_NOTES.md`, `BITCODE_SPEC_V26_PARITY_MATRIX.md`, and `BITCODE_SPEC_V26_PROVEN.md`.
- V26 supplementary protocol-demonstration docs such as `V26_APPLICATION_SYSTEMS.md`, `V26_PROOF_SURFACES.md`, and `V26_REFORM_STRATEGY.md`.
- Active source excluding `_legacy/**`.

## Review Findings Deferred To V28

These findings do not reopen V27.
They are V28 inputs because V27 closed the protocol law and minimum crypto-commercial rails, while V28 must make those rails feel complete inside the Terminal.

| Finding | Why it does not block V27 | V28 action |
| --- | --- | --- |
| V26 historical docs still cite old version-prefixed external-realization routes | V27 source routes are now unversioned and the V26 family is historical promotion evidence | Refresh or annotate V26 supplementary docs so current implementation references do not teach retired route paths |
| Active demonstration internals still carry `V24` names and environment variables around external realization | Route paths are unversioned and tests prove behavior; names are historical primitive identifiers, not current public API routes | Decide whether to repurpose/rename those primitives into versionless external-realization terminology or preserve them as historical witness modules with explicit notes |
| The V27 registry migration had not previously been applied in a live Supabase environment and generated DB types have not been refreshed | V27 proves migration/schema/ORM boundary and route behavior, not production DB application | V28 staging Supabase migration history now aligns for `001`, `002`, `003`, and RLS migration `20260510223914`; generated Supabase/database type refresh remains a follow-up before promotion |
| Live wallet adapter UX is still below the package/API signer-session law | V27 proves fail-closed signer sessions and BTC fee receipt lifecycle | Build Terminal wallet connection, network choice, PSBT handoff, signature review, and signer-session recovery UX |
| BTC broadcaster/observer credentials and signet/mainnet operational harnesses are not deployed | V27 proves readiness receipts, lanes, telemetry, and approval gates | Implement the Terminal-facing regtest/signet broadcaster observer, confirmation/replacement/reorg reads, and operator diagnostics |
| Mainnet value-bearing launch is still separate operational approval | V27 intentionally blocks value-bearing mainnet without approval root | Keep V28 testnet/signet by default; prepare but do not silently enable value-bearing mainnet |
| Terminal journal and reconciliation primitives are implemented but not yet the ordinary operator workflow | V27 proves receipt and API boundaries | Make journal diffs, stale projections, private/metaphysical facts, and repair receipts readable in Terminal transaction detail |
| Organization BTD usage remains outside core tokenomics | V27 closed tokenomics law without broad organization product usage | Define organization read-license usage, team wallet posture, treasury reads, and role-based Terminal decisions |
| MCP holding gates still read registry-derived read-right checks | V27 bounded the aggregate compatibility carrier and closed core registry law | Replace aggregate holding gates with AssetPack range/read-license/policy checks when Terminal work touches MCP-triggered actions |
| Physical compatibility carriers such as `user_credits`, `user_credit_usages`, and storage-edge `deliverables` still exist | V27 bounds them as noncanonical storage/read corridors | Hide them behind registry/AssetPack/Read/Fit abstractions in Terminal-facing routes and generated types |
| `shippable` remains as a Finish-delivered PR/asset-pack-output term in some UI/tests/stories | V27 route/tokenomics work does not require renaming every UI/styling/test fixture term | Reconfirm in V28 whether Terminal product language should keep `Shippable` for PR delivery only or replace it with AssetPack delivery/range language |
| Legal/access-policy templates remain incomplete | V27 proves policy id/hash and rights separation, not final legal forms | Draft Terminal-visible access-policy templates for owner-read, licensed-read, derivative use, redistribution, confidentiality, dispute, and takedown posture |
| Product telemetry sinks are configured as receipt/event boundaries, not production alert dashboards | V27 closes taxonomy and persistence | Add operator-facing Terminal health panels and alert sink integration for wallet, fee, ledger, journal, database, access, settlement, and upgrade failures |
| External VCS providers beyond GitHub remain incomplete or not started | V27 does not require broad third-party provider completion, and V28 is MVP QA | Keep V28 provider UX honest about GitHub-only readiness and hand off broader provider readiness to the later product version that owns the affected surface |
| Auxillaries still mixes old orbital-era shell styles with the active contained tabs-left experience | V27 closed protocol law, not full commercial application visual QA | Remove or strictly contain conflicting `orbital-*` layout/background classes from active Auxillaries auth/profile/readiness paths, preserve only reusable aesthetic pieces that do not control commercial layout, and prove with desktop/mobile screenshots |
| V26 proof generator and older promotion scripts still contain version-specific historical logic | V27 accepted generated-equivalent proof artifacts rather than fully modernizing promotion automation | Decide whether V28 should update proof generation for V28+ families or leave older promotion scripts as historical tooling |
| Some formal protocol package internals are freshly ported from the standalone demonstration | V28 now owns commercializing the Protocol implementation enough that commercial code must not depend on demonstration runtime code | Keep commercial UAPI imports on formal packages such as `@bitcode/protocol`, keep `protocol-demonstration` out of the workspace build graph, move required demonstration-derived behavior into packages/UAPI, and use the demonstration only as reference/proof witness |
| BNB Chain, opBNB, Binance Web3 Wallet, BEP-20, and BitVM bridge research are relevant but not current chain-of-record facts | V28 must avoid implying a public BTD deployment or native BNB Taproot/BitVM compatibility | Treat Bitcoin Taproot/PSBT/testnet as V28's practical crypto lane; record BSC/opBNB/Binance and BitVM bridge pilots as future bridge/distribution work unless a proof-bound testnet artifact exists |
| Top chrome can briefly show `Connect Wallet` while wallet/user data is still loading | V28 wallet identity is the origin point for Supabase synchronization and Terminal readiness | Treat top chrome wallet state as tri-state: reading, connected, disconnected. The disconnected CTA may render only after auxillary user data has settled. While unresolved, render an integrated loading indicator and emit QA telemetry so manual passes can distinguish slow readiness from missing identity. |
| Manual QA needs database-level evidence, not only screenshots | V28 is proving ledger/database synchronization posture before deeper deployment versions | Each wallet/GitHub/Terminal pass must collect client logs, server logs, network failures, and Supabase SQL query results for `auth.users`, `auth.identities`, `user_profiles`, `user_connections`, and repository inventory tables. Missing tables or permission errors are valid evidence and must be recorded, not hidden. |

## V28 Gate Sketch

V28 should not start by widening Exchange or repairing the website Conversations interface.
The minimum useful V28 gate plan is Protocol/Terminal-MVP-first:

1. **Gate 1: V28 Draft Opening And Promotion Review**
   - Confirm `BITCODE_SPEC.txt` points to `V27`.
   - Read V26 and V27 promoted families.
   - Convert this NOTES file into SPEC, DELTA, and PARITY only after source audit.

2. **Gate 2: Protocol/Terminal MVP QA Baseline**
   - QA primary active routes and navigation.
   - Prove top chrome wallet readiness as a tri-state loading/connected/disconnected surface so the wallet CTA does not appear before connection status is known.
   - Add client and server QA telemetry around wallet OAuth, wallet proof persistence, auxillary data reads, GitHub setup callbacks, and user-data cache revalidation.
   - Add Supabase SQL verification to manual QA steps so profile, wallet identity, provider connection, and GitHub installation synchronization are checked at the database layer.
   - Remove Auxillaries old orbital shell conflicts from active contained tabs-left paths.
   - Disable or hide Exchange and website Conversations from V28 QA.
   - Separate commercial runtime imports from the standalone protocol demonstration and remove the demonstration from the workspace build graph.
   - Reorder manual QA around natural operator progression and public-docs sequencing rather than broad surface sweeps.
   - Run each manual QA pass through Mock and Testnet-readiness lanes; record whether failures are product bugs, missing live credentials, or deferred deployment readiness.
   - Capture desktop/mobile visual proof for sign-in, create-account, signed-in profile, Terminal, Auxillaries, BTD range disclosure, MCP API readiness, and ChatGPT App readiness.

3. **Gate 3: Terminal Wallet, BTC Fee, And Read-Fit-Measuremint Workflow**
   - Terminal wallet connection and signer-session review.
   - BTC fee preparation, PSBT handoff, signature status, broadcast status, confirmation/replacement/reorg readout.
   - Read submission and Fit closure make synthetic measurement, measuremint entitlement, zero-cell/refit receipt, source roots, proof roots, and access policy visible.
   - BTD-AssetPack minting is testnet-ready and journaled even when ledger anchors are mocked or blocked.

4. **Gate 4: Terminal AssetPack Range Detail**
   - AssetPack range pages and Terminal transaction detail read registry-derived range, cells, ownership, policy hash, owner-read, licensed-read, and proof state.

5. **Gate 5: Terminal Journal Diff And Reconciliation**
   - Operator can see journal/ledger/database drift, blocking repairs, private canonical facts, and repair receipt history without reading raw JSON.

6. **Gate 6: Terminal Organization, MCP, ChatGPT App, And Access Policy**
   - Organization holdings, team roles, read-license usage, policy templates, MCP authorization checks, and ChatGPT App action checks become registry-derived.

7. **Gate 7: Terminal Operations And Testnet Readiness**
   - Regtest/signet harness, telemetry sinks, alert panels, upgrade readiness, and rollback posture become Terminal-operated.
   - Taproot/PSBT/BTC remains the V28 crypto lane; BSC/opBNB/Binance/BitVM bridge work is future bridge/distribution readiness unless proof-bound artifacts exist.
   - Terminal operational health now reads from package BTD primitives through
     `terminal-operational-health.ts`, then renders lane approval, telemetry,
     upgrade, generated type refresh, VCS, settlement-network, and synthetic
     testnet mint/reconciliation state in Terminal.
   - Reading pipeline test coverage becomes a gate contract: Read-Need,
     Finding Fits, depository search, embedding/vector search, sandbox harness,
     route preflight, Terminal stream adaptation, and demonstration local
     fit-finding suites must pass together.
   - Valid mocks must carry the same typed phase/agent/tool/PTRR/ThricifiedGeneration,
     prompt/context, parsed-output, usage/timing, and fail-closed envelopes as
     live Reading pipeline telemetry. Placeholder mocks are not acceptance
     evidence.

8. **Gate 8: V28 Metadevelopment And Promotion Proof**
   - Branching policy, gate branch naming, quality commit-message discipline,
     gate workflow checks, and V28 promotion workflow checks are documented and
     source-validated.
   - The V28 promotion workflow is maintained as the only path that advances
     `BITCODE_SPEC.txt`; it runs promotion-grade validation, executes the
     canonical promotion script, generates `BITCODE_SPEC_V28_PROVEN.md`, and
     commits promotion artifacts back to `version/v28`.
   - The parity matrix carries an explicit product-gate carryforward audit so
     Depositing, Read Request, Read-Need, Finding Fits, AssetPack preview,
     settlement, delivery, Terminal UX, documentation, proof coverage, and live
     validation work cannot be hidden as vague future cleanup.
   - V29 Terminal depth, V30 Protocol/BTD hardening, V31 Auxillaries depth, V32 provation/testing depth, V33 interface depth beyond the V28 MVP, V34 deployment depth, V35 telemetry/documenting depth, and V36+ Exchange/Conversations depth are explicitly staged rather than mixed into V28.

## Gate 8 metadevelopment closure notes

Gate 8 is not a commercial-product feature gate. It standardizes how the
remaining V28 gates close: gate-prefixed branches merge into `version/v28`,
the version branch is the only branch that can request promotion into `main`,
and promotion automation must either generate and commit the canonical proof
appendix or fail closed.

Gate 8 also separates promotion mechanics from product closure. Subsequent V28
gates still own the commercial product flow: source Depositing, Read Request,
Need synthesis/review/resynthesis, Finding Fits over the depository, source-safe
AssetPack preview, BTC settlement, read-license/right transfer, pull-request
delivery, Terminal usability, proof coverage, and local/live validation.

## Gate 9 depository evidence closure notes

Gate 9 closes the first product gate after metadevelopment by making Deposit
evidence reusable by later Reading gates. A deposited repository revision must
emit proof, measurement, reconciliation readback, lexical document, vector
document, and aggregate depository search roots. Terminal activity history must
persist those roots and project them back into the latest deposited source
revision. The Read/Fit harness must receive the same roots in its deposit
reference so Finding Fits can distinguish real proof-bearing deposited supply
from local placeholders.

The vector search document policy for V28 Gate 9 is `text-embedding-3-small`,
1536 dimensions, `deliverable_vectors`, `match_deliverable_vectors`, and cosine
distance. Gate 9 records the vector document as ready for embedding generation;
later Finding Fits and live validation gates own provider execution, ranking,
settlement, and protected-source disclosure boundaries.

## Gate 10 Read-Need comprehension closure notes

Gate 10 closes the first two enterprise Reading UX steps. The raw request is
stored as `bitcode.read.request` and embedded in the synthesized
`bitcode.read.need`. This keeps request capture auditable without allowing a
raw request to drive depository discovery.

ReadNeedComprehensionSynthesis route telemetry now carries a contract trace for
all request, comprehend, measure, and review phase PTRR agents, their four PTRR
steps, and the three ThricifiedGeneration identifiers under each step. The
route-level telemetry also includes prompt template, interpolated context, raw
structured response posture, parsed typed output, measurement root, review
state, and resynthesis lineage.

Resynthesis appends operator feedback and records the previous Need id. Need
acceptance computes an acceptance root and returns Finding Fits admission
evidence. Terminal uses that accepted Need as the only live harness input for
Finding Fits while keeping the previous measured-Read history path visible for
readback compatibility.

## Non-Goals For V28

- V28 does not implement or QA Exchange product behavior, broad order-book depth, external market routing, wrapper liquidity, or third-party marketplace integration.
- V28 does not implement or QA the website Conversations interface.
- V28 does not approve value-bearing mainnet launch.
- V28 does not redefine `$BTD` supply, measureminting, access-right, or ancestry law except through explicit V27 supersession.
- V28 does not treat storage-edge compatibility table names as product vocabulary.

## Required V28 Review Commands

Before V28 implementation closes, rerun at minimum:

- `cat BITCODE_SPEC.txt`
- `pnpm run check:v28-metadevelopment`
- `find apps/uapi/app/api -path '*v[0-9]*' -print | sort`
- `rg -n 'gap blocking|partial blocking|not started|not promoted|not generated yet' BITCODE_SPEC_V28*`
- `node scripts/promote-bitcode-canon.mjs --version V28 --commit HEAD --dry-run`
- `pnpm -C packages/api build`
- `pnpm -C packages/orm build`
- `npm --prefix protocol-demonstration run test:v27-crypto`
- `node --test --test-force-exit protocol-demonstration/test/v28-boundary-separation.test.js`
- `pnpm -C apps/uapi exec jest --runInBand tests/protocolCommercialBoundary.test.ts`
- Protocol/Terminal, Auxillaries, BTD, MCP API, and ChatGPT App-specific Jest/Playwright coverage once added
- `pnpm -C apps/uapi build`
- `git diff --check`
