# Bitcode Spec V26

## Status

- Scope: V26 canonical system specification for Bitcode productionizing hardening, demonstration-to-application integration, application-facing UI replacement, interface hardening, and package-first repository refurbishment after V25 rename canon
- Current canonical/latest target: `V26`
- Canonical pointer: `BITCODE_SPEC.txt` -> `V26`
- Active canonical anchor: `BITCODE_SPEC_V26.md`
- Active generated proof appendix: `BITCODE_SPEC_V26_PROVEN.md`
- Canonical proof-source commit: `9d0733fed5f63d2f977900384d4103f9fd887f03`
- Prior canonical anchor: recorded in `BITCODE_SPEC_V26_NOTES.md` only; it is not active V26 truth
- Prior generated proof appendix: recorded in `BITCODE_SPEC_V26_NOTES.md` only; it is not active V26 truth
- Generated structured artifact inventory: active canonical `.bitcode/v19-*` reproducible reports, `.bitcode/v20-*` operator-quality reports, `.bitcode/v26-spec-family-report.json`, `.bitcode/v26-canonical-input-report.json`, `.bitcode/v26-gate-checkpoint-report.json`, `.bitcode/conversations-continuity-proof.json`, `.bitcode/runs-pipelines-totality-proof.json`, `.bitcode/persistence-schema-totality-proof.json`, `.bitcode/prompt-system-totality-proof.json`, `.bitcode/inference-implementation-records-proof.json`, `.bitcode/fourth-gate-reclosure-review-proof.json`, `.bitcode/source-to-shares-fifth-gate-proof.json`, `.bitcode/v26-product-readiness-audit.json`, `.bitcode/fifth-gate-closure-deepening-proof.json`, `.bitcode/fifth-gate-closure-proof.json`, `.bitcode/sixth-gate-mvp-closure-proof.json`, `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`, `.bitcode/prompt-space-completeness-proof.json`, `.bitcode/retained-package-admissibility-proof.json`, `.bitcode/system-reform-admissibility-proof.json`, `.bitcode/whole-repository-production-satisfaction-proof.json`, `.bitcode/v26-total-closure-proof.json`, and `BITCODE_SPEC_V26_PROVEN.md`
- Canonical companion delta: `BITCODE_SPEC_V26_DELTA.md`
- Canonical companion notes file: `BITCODE_SPEC_V26_NOTES.md`
- Canonical companion parity ledger: `BITCODE_SPEC_V26_PARITY_MATRIX.md`
- Canonical companion reform strategy supplement: `protocol-demonstration/V26_REFORM_STRATEGY.md`
- Canonical companion LSP measurement reform supplement: `protocol-demonstration/V26_LSP_MEASUREMENT_REFORM.md`
- Draft posture source: `protocol-demonstration/src/canon-posture.js` keeps `ACTIVE_CANON_VERSION = 'V26'` and `DRAFT_TARGET_VERSION = 'V27'`
- Source parity state: first-, second-, third-, fourth-, fifth-, sixth-, seventh-, and eighth-gate source work is materially present; fourth-gate retained-system convergence is promoted closed after explicit reopening review; fifth-gate minimum-functional closure, sixth-gate MVP closure, seventh-gate commercial testnet launch closure, prompt-space completeness, whole-repository production satisfaction, and V26 total closure are accepted by explicit generated verdicts
- V26 state: V26 is the singular active Bitcode canon and current productization target, with earlier through-fourth-gate promotion claims treated as overstated and effectively false, fourth gate promoted closed only through generated re-review/checkpoint proof, fifth gate closed by `.bitcode/fifth-gate-closure-proof.json`, sixth gate closed by `.bitcode/sixth-gate-mvp-closure-proof.json`, seventh gate closed by `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`, and eighth gate closed by `.bitcode/prompt-space-completeness-proof.json`, `.bitcode/whole-repository-production-satisfaction-proof.json`, and `.bitcode/v26-total-closure-proof.json`

## Acceptance and remaining-open state

V26 is not a rename-first version and it is not a light cleanup pass.
V26 is the productionizing hardening version that reorganizes Bitcode from a transitional demo/site split into a package-owned, application-native, live-operation-ready system.

With V26 active as the singular canon after fourth-gate promoted closure:
- V26 is active canonical truth,
- fourth-gate retained-system convergence has passing material proof-family evidence across conversations, runs/pipelines, persistence/schema, prompt-system, inference-record, retained-package, and reclosure-review proof surfaces,
- earlier through-fourth-gate promotion claims remain recorded as overstated and effectively false, but the reopened fourth gate is now promoted closed only by `.bitcode/fourth-gate-reclosure-review-proof.json` and `.bitcode/v26-gate-checkpoint-report.json`,
- fifth-gate source-to-shares, closure-deepening, and closure evidence now exists through `.bitcode/source-to-shares-fifth-gate-proof.json`, `.bitcode/fifth-gate-closure-deepening-proof.json`, and `.bitcode/fifth-gate-closure-proof.json`,
- fifth-gate minimum-functional Bitcode Exchange and Bitcode Terminal closure plus retained-system Bitcode purification are accepted at the V26 baseline and remain distinct from the separately proven MVP gate,
- sixth-gate minimal viable product elevation is accepted by `.bitcode/sixth-gate-mvp-closure-proof.json`,
- seventh-gate initial commercially-viable testnet live-launch refinement is accepted by `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`,
- eighth-gate whole-repository provation and final closure are accepted by `.bitcode/prompt-space-completeness-proof.json`, `.bitcode/whole-repository-production-satisfaction-proof.json`, and `.bitcode/v26-total-closure-proof.json`,
- the current source-bearing implementation basis now includes the landed package/app migration and retained-system material-proof surfaces cited below,
- and the V26 main spec remains full-system and re-implementation-grade even while later version work may reopen ownership after later-gate promotion.
- the retained active repository systems outside first-gate Bitcode ownership must be elevated to Bitcode-grade auditability, proof-bearing precision, and knowability rather than pulling Bitcode down to older application looseness.

## Version executive summary

V25 completed the current-facing Bitcode rename and BTD denomination shift while preserving the prior behavioral chain recorded in NOTES.

V26 opens because the renamed system still has an architectural split that is too large for a production-ready Bitcode:
- the standalone demonstration owner had to be removed as a top-level product owner,
- the preserved operator shell had to move into package/app ownership without losing its deterministic UX contract,
- the application route had to replace the embedded-demo posture,
- and several external and internal interfaces still remain short of the level expected of a live application.

V26 therefore centers eight coordinated gates:
1. first-gate ownership migration,
2. second-gate application UX/UI plus external interfacing hardening,
3. third-gate marketing refurbishment,
4. fourth-gate retained-system convergence and truthful reclosure-after-reopening discipline,
5. fifth-gate minimum-functional Bitcode Exchange and Bitcode Terminal closure together with maximally finished retained-system Bitcode purification,
6. sixth-gate minimal viable product elevation across Exchange, Terminal, Protocol, Proofs, and admitted interfaces,
7. seventh-gate initial commercially-viable testnet live-launch refinement,
8. eighth-gate whole-repository provation and final V26 closure.

V26 is the most complex canonical promotion in the repository because it simultaneously:
- elevates the demo into a Bitcode product/application on the path to minimum functionality, MVP, and eventual commercial testnet readiness,
- absorbs real-world inputs, outputs, and interface obligations into the canonical source map,
- reorganizes active source around tighter package/app abstractions and proof-bearing modular topology,
- and completes the repository-wide Bitcode transformation without relaxing spec-to-source parity density.

V27 then becomes the post-productization successor.
V26 must not be treated as a rename cleanup continuation; it is the full productization program that turns the retained repository into Bitcode-owned product truth through eighth-gate closure.

The intended result is not "micro-app the demo into `apps/uapi/`."
The intended result is:
- remove the standalone protocol demonstration directory as a primary product owner,
- land first-gate Bitcode ownership under `protocol-demonstration` plus app-owned route surfaces,
- preserve the useful Bitcode operator UX chain while replacing demonstration ownership first and deeper UI implementation second,
- remove the homepage embedded-demo posture in favor of a full-page application route,
- keep `/application` as the only primary Bitcode destination in the live app,
- keep orbitals and conversations as fullscreen application overlays rather than peer product destinations,
- port reusable executions/shippables master-detail patterns inward to `/application` instead of preserving them as the lasting product topology,
- keep the established navbar and app-shell navigation frame as the application-facing Bitcode frame,
- maximize precise reuse of the retained active package/app code where those owners fit the new Bitcode totality,
- and harden auth, GitHub, bitcoin, sidechain, repeated-read, compute, storage, telemetry, and reconciliation to a live-application-ready level.

The simplified-spec reading for V26 now lives inside `BITCODE_SPEC_V26_NOTES.md`.
It stays deliberately concise and diff-friendly there, while this main SPEC remains the implementation-grade source for Protocol, Product, Proof, package, interface, and gate behavior.

## V26 gate structure

V26 is now explicitly split into eight gates.

### First-gate

First-gate is the ownership migration gate.
It preserves the Bitcode shell experience while changing where that experience lives.
It also requires the preserved demonstration UX to read through the application as a production-initial Bitcode surface by using core app/component carriers rather than a standalone demo framing.

The current first-gate source file structure is:
- `protocol-demonstration/src/*`
- `protocol-demonstration/public/*`
- `protocol-demonstration/server.js`
- `protocol-demonstration/test/*`
- `apps/uapi/app/application/page.tsx`
- `apps/uapi/app/application/ApplicationPageClient.tsx`
- `apps/uapi/app/application/first-gate-styles/route.ts`
- `apps/uapi/app/api/state/route.ts`
- `apps/uapi/app/api/deposits/route.ts`
- `apps/uapi/app/api/make-bitcode-branch/route.ts`
- `apps/uapi/app/api/read-review/route.ts`
- `apps/uapi/app/api/reset/route.ts`
- `apps/uapi/app/api/bitcoin-demonstration-service/route.ts`
- `apps/uapi/app/api/auxillaries/data/route.ts`
- `apps/uapi/app/api/v24/external-realization/route.ts`
- `apps/uapi/app/api/v24/executors/[interfaceId]/route.ts`
- `apps/uapi/lib/bitcode-app-context.ts`

First-gate closure means:
- no standalone demonstration product directory remains,
- `/application` is the app-owned Bitcode carrier,
- the preserved shell DOM, interaction order, and API/state contract run from package/app owners,
- the application-owned Bitcode carrier can be reviewed coherently in mock mode without requiring live external data,
- and the homepage no longer embeds or foregrounds a standalone demo surface.

### Second-gate

Second-gate is the application UX/UI and external-interfacing hardening gate.
It does not reopen the first-gate ownership migration.
It replaces the preserved shell implementation with deeper native application-facing composition while keeping Bitcode semantics intact.
It hardens the live application-facing external interfacings up to stable readiness within the new `/application` expression.
Its aesthetic atmosphere remains the retained application design system, but the product itself is entirely Bitcode.
It also includes markdown and README refurbishment for the active route, orbital, execution, shared-component, package, and preserved protocol owners so the growing V26 system stays legible and provable.

The current active second-gate source additions are now explicitly:
- `apps/uapi/app/application/ApplicationCommandDeck.tsx`
- `apps/uapi/app/application/ApplicationActionWorkbenchCard.tsx`
- `apps/uapi/app/application/ApplicationClosureControlDeck.tsx`
- `apps/uapi/app/application/ApplicationExperienceFrame.tsx`
- `apps/uapi/app/application/ApplicationExternalInterfacingPanel.tsx`
- `apps/uapi/app/application/ApplicationDepositComposer.tsx`
- `apps/uapi/app/application/ApplicationDepositReadWorkbench.tsx`
- `apps/uapi/app/application/ApplicationLiveSummaryStrip.tsx`
- `apps/uapi/app/application/ApplicationReadScenarioPanel.tsx`
- `apps/uapi/app/application/ApplicationRepositoryContextPanel.tsx`
- `apps/uapi/app/application/ApplicationSectionAtlas.tsx`
- `apps/uapi/app/application/ApplicationCoreNativeSections.tsx`
- `apps/uapi/app/application/ApplicationClosureNativeSections.tsx`
- `apps/uapi/app/application/ApplicationTransactionActivitySurface.tsx`
- `apps/uapi/app/application/ApplicationTransactionDetailActionBar.tsx`
- `apps/uapi/app/application/ApplicationTransactionDetailSurface.tsx`
- `apps/uapi/app/application/ApplicationTransactionDetailHero.tsx`
- `apps/uapi/app/application/ApplicationTransactionIdentityCard.tsx`
- `apps/uapi/app/application/ApplicationTransactionClosureCard.tsx`
- `apps/uapi/app/application/ApplicationTransactionsTable.tsx`
- `apps/uapi/app/application/ApplicationSupplySelectionPanel.tsx`
- `apps/uapi/app/application/application-core-surface.ts`
- `apps/uapi/app/application/application-shell-bridge.tsx`
- `apps/uapi/app/application/application-closure-controls.ts`
- `apps/uapi/app/application/application-closure-state.ts`
- `apps/uapi/app/application/application-deposit-composer.ts`
- `apps/uapi/app/application/application-external-runtime.ts`
- `apps/uapi/app/application/application-command-state.ts`
- `apps/uapi/app/application/application-section-atlas.ts`
- `apps/uapi/app/application/application-live-summary.ts`
- `apps/uapi/app/application/application-experience-architecture.ts`
- `apps/uapi/app/application/application-deposit-read-workbench.ts`
- `apps/uapi/app/application/application-read-scenarios.ts`
- `apps/uapi/app/application/application-run-activity.ts`
- `apps/uapi/app/application/application-transaction-source.ts`
- `apps/uapi/app/application/application-transaction-detail-snapshot.ts`
- `apps/uapi/app/application/application-transaction-detail.ts`
- `apps/uapi/app/application/application-repository-context.ts`
- `apps/uapi/app/application/application-shell-sections.ts`
- `apps/uapi/app/application/application-shell-reading.ts`
- `apps/uapi/app/application/application-supply-selection.ts`
- `apps/uapi/app/application/application-transaction-query.ts`
- `apps/uapi/app/application/application-transactions.ts`
- `apps/uapi/app/application/ApplicationWorkspaceRail.tsx`
- `apps/uapi/app/application/ApplicationTransactionWorkspace.tsx`
- `apps/uapi/app/application/ApplicationMockTransactionDetails.tsx`
- `apps/uapi/app/application/application-run-data.ts`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsTable.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsOverview.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsFilterBar.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsActiveFilters.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsDataTable.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsPagination.tsx`
- `apps/uapi/components/base/bitcode/execution/bitcode-transaction-data-mode.ts`
- `apps/uapi/components/base/bitcode/execution/BitcodeDetailRowList.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeMetricGrid.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeDetailCollection.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeDetailPanel.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeChipCloud.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeActionPillRow.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeInlineExplainer.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodeExecutionStreamPanel.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadRowsCard.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadCollectionCard.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadDetailCard.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadInspector.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadShape.tsx`
- `apps/uapi/components/base/bitcode/execution/BitcodePayloadTree.tsx`
- `apps/uapi/components/base/bitcode/execution/bitcode-transaction-active-filters.ts`
- `apps/uapi/components/base/bitcode/execution/bitcode-transaction-explainers.ts`
- `apps/uapi/components/base/bitcode/execution/bitcode-transaction-types.ts`
- `apps/uapi/app/api/conversations/route.ts`
- `apps/uapi/app/api/conversations/branch/route.ts`
- `apps/uapi/app/api/conversations/stream/route.ts`
- `apps/uapi/app/api/conversations/[conversationId]/stream/route.ts`
- `apps/uapi/app/api/vcs/[provider]/connection/route.ts`
- `apps/uapi/app/api/vcs/[provider]/oauth/route.ts`
- `apps/uapi/app/api/vcs/[provider]/connect-token/route.ts`
- `apps/uapi/app/api/vcs/[provider]/repositories/route.ts`
- `apps/uapi/app/conversations/components/ConversationsOverlay.tsx`
- `apps/uapi/tests/applicationRepositoryContext.test.ts`
- `apps/uapi/tests/applicationCommandState.test.ts`
- `apps/uapi/tests/applicationShellBridge.test.tsx`
- `apps/uapi/tests/applicationClosureControls.test.ts`
- `apps/uapi/tests/applicationCoreSurface.test.ts`
- `apps/uapi/tests/applicationDepositComposer.test.ts`
- `apps/uapi/tests/applicationExternalRuntime.test.ts`
- `apps/uapi/tests/applicationDepositReadWorkbench.test.ts`
- `apps/uapi/tests/applicationClosureState.test.ts`
- `apps/uapi/tests/applicationSectionAtlas.test.ts`
- `apps/uapi/tests/applicationLiveSummary.test.ts`
- `apps/uapi/tests/applicationReadScenarios.test.ts`
- `apps/uapi/tests/applicationTransactionActivity.test.ts`
- `apps/uapi/tests/applicationTransactionDetailSnapshot.test.ts`
- `apps/uapi/tests/applicationTransactionDetail.test.ts`
- `apps/uapi/tests/applicationTransactionQuery.test.ts`
- `apps/uapi/tests/applicationShellBridge.test.tsx`
- `apps/uapi/tests/applicationSupplySelection.test.ts`
- `apps/uapi/tests/applicationTransactions.test.ts`
- `apps/uapi/tests/protocol-demonstrationInlineExplainer.test.tsx`
- `apps/uapi/tests/protocol-demonstrationDetailRowList.test.tsx`
- `apps/uapi/tests/protocol-demonstrationMetricGrid.test.tsx`
- `apps/uapi/tests/protocol-demonstrationTransactionsFilterBar.test.tsx`
- `apps/uapi/tests/protocol-demonstrationTransactionsPagination.test.tsx`
- `apps/uapi/tests/protocol-demonstrationPayloadInspector.test.tsx`
- `apps/uapi/tests/api/executionsHistoryRoute.test.ts`
- `apps/uapi/tests/api/executionsHistoryRunRoute.test.ts`
- `apps/uapi/tests/usePipelineExecution.test.tsx`
- `apps/uapi/tests/api/externalRealizationRoute.test.ts`
- `protocol-demonstration/src/client-entry.js`
- `protocol-demonstration/public/app.js`
- `protocol-demonstration/public/index.html`
- `protocol-demonstration/public/styles.css`
- `apps/uapi/styles/orbital.css`
- `apps/uapi/styles/orbital-rings.css`
- `README.md`
- `apps/uapi/README.md`
- `protocol-demonstration/README.md`
- `apps/uapi/app/application/README.md`
- `apps/uapi/app/orbitals/README.md`
- `apps/uapi/components/base/bitcode/README.md`
- `apps/uapi/components/base/bitcode/execution/README.md`
- `protocol-demonstration/V26_APPLICATION_SYSTEMS.md`
- `protocol-demonstration/V26_PROOF_SURFACES.md`

### Third-gate

Third-gate is the marketing refurbishment gate.
It is separate from second-gate so the application surface and the marketing surface can be specified and accepted independently.
It refurbishes the public marketing page only after the application route and its hardening work are stable.
Its content spine is now a production-facing contract rather than a loose slogan set:
- where + when:
  engineering economy participants
- who:
  producers, consumers + investors, partners, researchers
- how:
  open, auditable, formal
- what:
  modular, observable, hackable
- why:
  throughput, quality, cost, trust

Third-gate must now also:
- inherit stabilized application language from second-gate rather than preserving demo narration,
- keep all public product language user-facing rather than gate-facing, canon-facing, or source-path-facing,
- align the landing, navigation, tooltip/help posture, and application shell mood into one thematic Bitcode system,
- preserve the strongest prior guidance UX, including rich tooltip content and resumable guide/draft posture,
- and prepare the public site to read as the outer frame of the production Bitcode application rather than as a detached marketing skin.

The current mounted third-gate start carriers are now explicitly:
- `apps/uapi/app/(root)/components/PublicShellFrame.tsx`
- `apps/uapi/app/(root)/components/MarketingLandingPage.tsx`
- `apps/uapi/app/(root)/components/landing/MarketingLandingHero.tsx`
- `apps/uapi/app/(root)/components/landing/MarketingLandingPillarCard.tsx`
- `apps/uapi/app/(root)/components/landing/MarketingLandingGuideCard.tsx`
- `apps/uapi/app/(root)/components/landing/MarketingLandingTerminalPreview.tsx`
- `apps/uapi/app/(root)/components/landing/marketing-landing-shared.tsx`
- `apps/uapi/app/(root)/components/PublicDocsPageContent.tsx`
- `apps/uapi/app/(root)/components/MarketingOperatorGuideCard.tsx`
- `apps/uapi/app/docs/page.tsx`
- `apps/uapi/app/demo-video/page.tsx`
- `apps/uapi/components/base/bitcode/layout/nav.tsx`
- `apps/uapi/components/base/bitcode/layout/NavBrand.tsx`
- `apps/uapi/components/base/bitcode/layout/footer.tsx`
- `apps/uapi/components/base/bitcode/layout/bitcode-public-copy.ts`
- `apps/uapi/components/base/bitcode/layout/bitcode-public-explainers.ts`

Those owners now carry the public-shell route and teaching vocabulary for:
- `Network`
- `Transactions`
- `Docs`
- `Auxillaries`
- with `deposit` / `read` still explained as the two main Bitcode actions inside `Transactions` and `Docs`

They also now carry the mounted public-shell chrome contract:
- explicit public-route navigation,
- stable public-route access CTAs,
- a real mounted `/docs` hub,
- a compatibility `/demo-video` alias that resolves back into docs-owned content,
- and live orbital-entry behavior on `/`, `/docs`, and `/demo-video` rather than page-local copy alone.

Mounted third-gate hardening must also retire stale public-shell residue from the live route owners:
- no live `coming-soon` component, class, or stylesheet naming in the mounted public shell,
- no unused access-gate or incantation code preserved inside the live landing owner,
- no oversized monolithic landing owner that keeps hero, guide, preview, and shared marketing-shell data fused into one file once those sections have stabilized enough to be assigned clearer Bitcode carriers,
- no ordered demo-era operator-guide media compatibility preserved in the stable walkthrough/docs route,
- no developer-path fallback copy when guide media is absent,
- and no public-shell information architecture that keeps docs trapped behind a one-off guide URL once the docs route exists.

Mounted third-gate public chrome should also prefer progressive simplification over extra menu state:
- responsive public-route nav should stack and wrap cleanly on smaller screens rather than introducing hamburger-only access for the primary Bitcode entry links,
- dense operator-preview content on the mounted landing should collapse into a compact public/mobile summary before wider-shell detail is shown,
- heavy ambient motion and backdrop effects on the mounted landing should suppress on smaller or reduced-motion shells before wider-screen theatrical treatment is shown,
- public-footer route links should collapse into clear mobile-first cards instead of cramped inline microcopy when the shell narrows,
- public protocol/version metadata should read as deliberate product chips rather than a trailing legal-text fragment on smaller shells,
- and public-route access CTAs should remain immediately visible without requiring additional taps to discover `Transactions`, `Docs`, or `Open Auxillaries`.

Third-gate acceptance is reached only when:
- public product copy no longer describes the system through demo, canon, gate, or implementation self-reference,
- the main public entry points inherit the same Deposit/Read, Transactions, conversations, and Auxillaries vocabulary used by the application,
- the mounted public shell clearly reads as `Network`, `Transactions`, `Docs`, and `Auxillaries` rather than drifting across overlapping `workspace`, `guide`, or terminal-only naming,
- selected `/application` and canonical `/auxillaries` review surfaces shown during third-gate hardening also keep that same `Transactions` / `Auxillaries` naming discipline instead of leaking `workspace` or `transaction terminal` residue,
- navigation, menus, notifications, and sticky behavior remain non-regressive while the public shell is cleaned up,
- tooltip/help content is preserved or improved rather than flattened during visual cleanup, including replacing thin browser `title` affordances with richer public-shell explainers where those entry points matter,
- the real `/docs` route resolves one Bitcode-owned walkthrough asset or fails closed into its user-facing fallback without carrying demo-era compatibility candidates,
- `/demo-video` remains only a compatibility alias into that docs-owned content,
- mounted public and selected application routes keep explicit `Bitcode Network`, `Bitcode Docs`, and `Bitcode Transactions` title posture instead of inheriting one global shell title,
- the public protocol reference resolves through the stable canonical pointer rather than a version-specific public spec URL,
- and third-gate can be proven without reopening second-gate application ownership work.

### Fourth-gate

Fourth-gate is the retained-system convergence gate.
It ports the retained non-Bitcode-first-gate application systems into the V26 Bitcode total system instead of leaving them as adjacent Bitcode-era reservoirs.
It was procedurally reopened because previous claims that this boundary had already been crossed were overstated and effectively false. V26 now promotes fourth gate closed only through the generated reclosure review and checkpoint that map all fourth-gate material criteria to proof-family evidence and detect no blocking fourth-gate deviance.
It includes:
- conversations and the chat-based / ChatGPT-like application interface,
- executions, runs, pipelines, and the Bitcode meaning of former deliverable-reading surfaces as AssetPack runs, stored evidence, and PR Shippables,
- PostgreSQL persistence and Supabase-hosted storage/API convergence, including the `/edgetimes` application/API posture,
- initial migration closure, active schema ownership, ORM/query-layer ownership, generated types, and their test/documentation/comment carriers,
- with the current retained persistence basis explicitly anchored in `supabase/migrations/001_v26_production.sql`, `packages/supabase/src/*`, `packages/orm/src/models/*`, `packages/orm/src/queries/*`, `packages/orm/src/types/database.generated.ts`, `packages/orm/src/types/database.ts`, and `packages/orm/scripts/generate-db-types.ts`, while `/edgetimes` and `/api/edgetimes` now act as the live fourth-gate storage/API witness for the promotion boundary,
- prompt abstraction and the proved prompt space,
- retained agent and tool abstraction layers where those remain useful,
- and retained package admissibility for the packages V26 keeps.

### Fifth-gate

Fifth-gate is not a substitute for a fourth-gate proof claim.
It is the minimum-functional Bitcode Exchange and Bitcode Terminal source-to-shares gate after fourth-gate promoted closure.
Fifth-gate proceeded after fourth-gate promoted closure and is accepted after the minimum-functional make-shares/use-shares baseline, interface parity, persistence, reform, and proof closure all carried final acceptance.
It includes:
- proof closure for the retained and repurposed whole repository that survives into V26 production canon rather than only the old demo-equivalent core,
- proof closure for migrations, schema contracts, ORM/query carriers, generated types, storage/API contracts, and retained package boundaries,
- the debug setting and floating debug widget,
- at minimum an environment toggle that switches environment posture and refreshes the application coherently,
- full production/staging/development mode completeness in the new application expression,
- explicit proof-family closure for second-gate and fourth-gate retained systems,
- second-gate and fourth-gate rename-completion follow-through where compatibility carriers are no longer justified,
- and final repo/spec/documentation cleanup needed for V26 promotion.

## V26 second-gate application design contract

Second-gate must be specified before it is implemented.
The design contract below is the minimum collaboration surface required before code moves beyond first-gate preservation.

### Required second-gate design artifacts

Before second-gate implementation is accepted, the draft must carry:
1. a section-by-section application wireframe pack for `/application`,
2. a semantic non-regression ledger for the carried first-gate Bitcode flow,
3. a component adoption matrix that maps each carried section onto route-local app composition and current `apps/uapi/components/base/*` carriers,
4. an external interfacing hardening matrix covering the application-facing GitHub/auth/bitcoin/sidechain/repeated-read/compute/storage surfaces,
5. a modular supplementary-doc rewrite map for non-canonical repository documents that must evolve alongside the converged Bitcode architecture,
6. and a second-gate acceptance matrix that separates UI acceptance from third-gate marketing work and fourth-gate cleanup work.

### Second-gate route and ownership frame

Second-gate keeps `/application` as the Bitcode route carrier.
It does not move the product to a different route and it does not reopen first-gate preserved protocol ownership.

Second-gate changes:
- the route-local rendering owner,
- the component composition strategy,
- the application-facing behavior of the route,
- and the stability of the route’s external interfacings.

Second-gate does not change:
- the core Bitcode operating semantics,
- the orbitals ownership rule,
- the first-gate route/API owner locations,
- or the fact that Bitcode remains the product identity while the aesthetic atmosphere stays aligned to the retained application design system.

### Second-gate primary route, navbar, and overlay rule

Second-gate locks the live Bitcode application posture as:
- `/application` is the only primary Bitcode destination,
- the retained navbar and app-shell navigation frame remain the integrated navigation carrier for Bitcode,
- shared workspace-route classification owns navbar surface posture and footer suppression for `/application`, `/auxillaries`, and `/conversations`, with `/orbitals/*` reduced to redirect-only compatibility,
- unauthenticated workspace chrome uses deliberate access/create-account actions rather than disabled marketing-era CTA behavior,
- signed-in orbital reopen actions use one shared orbitals-first entry contract rather than older account-named overlay aliases,
- orbitals remain the fullscreen orbital overlay owner entered from within `/application`,
- conversations remain a fullscreen conversational workspace entered from within `/application`,
- `/auxillaries/*` remains the canonical direct-route family for focused auxillary reads while `/orbitals/*` survives only as redirect-only compatibility,
- and current executions plus AssetPack/Shippable surfaces are treated as reusable master-detail reservoirs to port inward rather than as the final product topology.

Parallel routes may remain during convergence for compatibility and migration, but V26 does not treat them as the finished product posture once second-gate and fourth-gate are closed.

### Second-gate three-experience and two-action rule

The V26 application architecture is centered on exactly three main experiences:
1. `master detail`
2. `conversations`
3. `auxillaries`

For V26, those mean:
- `master detail`
  The primary Bitcode application workspace inside `/application`, carrying the deposit/read operating chain, a rich Bitcode activity ledger (`transactions` master surface), selected activity detail, AssetPack evidence, PR Shippables, proofs, history, and consequence reading.
- `conversations`
  The fullscreen conversational workspace entered from within `/application`, retaining chat-based and ChatGPT-like interaction, tool usage, and run/pipeline attachment as first-class Bitcode behavior.
- `auxillaries`
  The fullscreen auxillary workspace entered from within `/application`, retaining the ringed overlay experience while owning Connects, Interfaces, Profile, and `$BTD`.

V26 does not treat executions, former deliverable surfaces, proofs, history, auxillaries, or chat as separate peer product destinations once the converged architecture is closed.
Those surfaces must resolve into one of the three experiences above.

V26 also fixes Bitcode as one productized standard across protocol, product, and proofs:
- `what`
  A protocol, product, and proof system for measured shares of technical intelligence.
- `how`
  `Bitcode Mainnet`: a live Bitcode operating posture with exact BTC fee settlement, non-fungible `$BTD` share/read-right accounting, replayable tests, immutable witness artifacts, and auditable specification-bearing closure.
- `where`
  `Bitcode Exchange` as the backend implementation, surfaced through the `Bitcode Terminal` at `/application`, plus admitted APIs, `Bitcode MCP`, and third-party app surfaces such as the ChatGPT App.
- `who`
  Depositors or IP holders supplying technical intelligence, and readers or token factories consuming measured technical intelligence for product or enterprise acceleration.
- `why`
  To convert otherwise idle or undervalued technical intelligence into auditable income for depositors while steepening performance curves for readers through measured fit, selection, materialization, and settlement.

Stepwise guidance inside the second-gate application is specified as a user-facing Deposit + Read flow guide and resumable working-flow continuity, not as tutorial/demo residue.
That guide and the Terminal pulse must surface exact repository-reconnect-required and wallet-reconnect-required posture in the main `/application` view instead of flattening those states into generic review-only or draft-only language.
Visible mode-entry controls inside the live operator shell must also use user-facing deeper-mode wording rather than narrating fullscreen mechanics to the operator.

The V26 application is also centered on exactly two main actions:
1. `deposit`
2. `read`

For V26, those mean:
- `deposit`
  Repo supply, candidate deposits, artifact inventory, and the actions that place authenticated material into the Bitcode operating chain.
- `read`
  Scenario framing, measured demand, fit pressure, selection pressure, and the actions that make explicit what the system is trying to satisfy before settlement and proof closure.

The command frame, section decomposition, and master-detail workspace must make `deposit` and `read` legible as the two main Bitcode actions.
The read experience is the Bitcode activity ledger window inside `/application`, with `transactions` retained as the route/query-owned master-detail substructure id.
The write experience moves through `deposit`, `read`, and auxillaries/interfaces posture via conversations and auxillaries entered from application context.
Conversations are the canonical rich-input write carrier for V26. They must accept source attachments, asset-pack references, read-measurement intent, and output-destination or execution-target references as structured tokens or PromptPart-compatible parts rather than relying on plain-text-only prompting.
Message-level attachments and execution references remain the retained primitive abstractions for these writes; operator-facing copy should read them as Connects-bound inputs, asset-pack synthesis requests, and settlement or output destinations.
The non-mock App Router write carriers `/api/conversations/stream` and `/api/conversations/[conversationId]/stream` must therefore resolve or create a conversation, persist the user message, bind message-level attachments from the structured token set, start canonical agentic-execution rows when read-measurement or asset-pack intent is present, and persist the assistant reply against the same retained message plus `pipeline_run` primitives.
Those execution rows must persist a normalized `rich_input` summary that separately records source attachments, output destinations, asset-pack references, and read-measurement intents, because the Exchange and Terminal cannot prove source-to-shares write parity from raw chat text or opaque token arrays alone.
The fullscreen conversation overlay and its history rail must not remain local-storage-only residue: first write must bootstrap through the root stream route when no persisted conversation id exists yet, the returned `message_complete` envelope must promote draft conversation ids into persisted ids, `/api/conversations` must feed the persisted conversation history rail with message/attachment counts plus last-message previews, `/api/conversations/[conversationId]` must hydrate selected conversation detail for the master-detail read posture, and `/api/conversations/branch` must preserve source attachments, output destinations, and execution-reference attachments when a persisted conversation is forked for continued Read or AssetPack work.
Verification, branch artifacts, settlement, proofs, Shippables, and history remain required, but they are consequence and closure stages of the deposit/read chain rather than additional top-level actions.
Within that master-detail experience, V26 now treats `transactions`, `shippables`, `proofs`, and `history` as the four required substructures rather than as optional auxiliary panels; operator-facing copy should read these as the Bitcode activity ledger, Finish-delivered Shippables backed by AssetPack evidence, proofs, and history.
The transactions master itself must stay query-owned, searchable, filterable, and paginatable rather than falling back to component-local table state.
Selected-transaction proof, history, and identity detail must also support a reusable visual-vs-raw payload reading posture rather than leaving JSON-bearing detail stranded in ad hoc prose cards.
The auxillary ring model is also fixed for V26:
- `Connects` is the outer orbital and the closest retained canonical pane,
- `Interfaces` owns application visual/default-behavioral posture for master-detail, conversations, and related reads,
- `Profile` owns wallet identity, address posture, BTC fee-liquidity posture, organization roles, multi-sig membership, and authentication state,
- `$BTD` is the inner orbital for non-fungible share/read-right holdings, measured content-amount posture, wallet-adjacent BTC fee posture, advanced `$BTD` controls, and `$BTD`-specific master-detail defaults.

`Connects` also owns source-bearing inputability and interfacability for V26: GitHub attachment, repository scope, and future third-party bindings that Bitcode reuses for read measurement, asset-pack synthesis, settlement follow-through, and external application behavior.
SSO providers remain admissible auth-entry posture, but Bitcode must not transact or settle until at minimum wallet identity is bound in `Profile` and GitHub or equivalent repository scope is attached in `Connects`.

Signed-in orbital preference persistence is also application-owned for V26 through `/api/auxillaries/model-preferences`, and the active `Interfaces` and `$BTD` panes are no longer treated as transitional model or credits wrappers.
Contained orbital reads inside `/application` and direct orbital routes should now read through shared panel/tabs carriers rather than floating sequence cards plus older absolute-position ring-label furniture.
Profile-owned repository knowledge sharing should also fail closed through an app-owned orbital route carrier rather than falling through to missing-route HTML inside the contained workspace.

### Second-gate target file-structure direction

The second-gate target structure is:
- `apps/uapi/app/application/*`
  The only primary Bitcode destination and the master-detail carrier for deposit/read operations, a rich activity ledger (`transactions` table), selected activity detail, AssetPack evidence, PR Shippables, proofs, and history.
- `apps/uapi/components/base/bitcode/layout/nav.tsx`
  The retained navigation frame that continues to anchor the application.
- `apps/uapi/app/auxillaries/components/*`
  The auxillary overlay system mounted from within the application context.
- `apps/uapi/app/conversations/components/*`
  The fullscreen conversation system mounted from within the application context.
- `apps/uapi/app/executions/components/*`
  Master-detail, run-inspection, log, and Shippable/AssetPack-reading patterns to be ported into `/application`.
- `packages/api/src/routes/{shippables,conversations,executions}.ts`, `packages/api/src/conversations/*`, `packages/api/src/pipelines/*`
  Current route-orchestration carriers that continue to feed the converged application surfaces, with thin `apps/uapi/app/api/*` filesystem route bindings importing formal handlers from `packages/api` while deeper subsystem behavior stays in narrower package owners.
- `packages/prompts/src/*`, `packages/execution-generics/*`, `packages/conversations-generics/*`, `packages/pipelines/*`
  Retained package carriers that must be woven into the converged V26 Bitcode system with explicit roles and proof obligations.

### Second-gate application composition map

| Second-gate surface | Current semantic source | Second-gate target owner | Required semantic invariants | Required UI direction |
| --- | --- | --- | --- | --- |
| master-detail application workspace | `apps/uapi/app/application/*`, `apps/uapi/app/executions/*`, `packages/api/src/routes/shippables.ts` | `/application` as the single primary Bitcode workspace, with architecture framing in `ApplicationExperienceFrame.tsx`, a rich transaction-master carrier in `ApplicationTransactionsTable.tsx`, inward substructure composition in `ApplicationTransactionWorkspace.tsx`, and route-local composition in `ApplicationPageClient.tsx` | transactions, AssetPacks, Shippables, proofs, history, operating detail, route-owned pagination, and payload inspection remain accessible without leaving application context | read as the central Bitcode operator experience rather than a peer-route handoff |
| deposit action frame | `renderRepoInventory()`, `renderAssets()`, deposit form semantics, repo-auth session surfaces | route-local application sections and controls within the master-detail workspace, centered on `ApplicationCommandDeck.tsx`, `ApplicationSupplySelectionPanel.tsx`, `ApplicationExperienceFrame.tsx`, and `ApplicationCoreNativeSections.tsx` | authenticated repo supply, depositing, inventory browsing, and material submission remain explicit | the operator should clearly understand how to deposit material to Bitcode |
| deposit-side repository context | application-owned repository connection posture, provider choice, and selected repo supply before the deposit chain | `ApplicationRepositoryContextPanel.tsx`, `application-repository-context.ts`, `apps/uapi/app/api/vcs/[provider]/*`, and `VCSRepositorySelector.tsx` | repository connection posture, provider choice, and selected repository supply remain explicit without hiding behind the preserved shell | the operator should clearly understand which connected repository currently anchors Bitcode deposit-side supply |
| native deposit submission | preserved-shell deposit contract and app-owned `/api/deposits` carrier | `ApplicationDepositComposer.tsx`, `application-deposit-composer.ts`, and `apps/uapi/app/api/deposits/route.ts` | title/author inference, selected inventory continuity, raw fallback behavior, and deposit posting remain semantically aligned to Bitcode intake | the operator should be able to submit a Bitcode deposit from the application workspace without dropping back into the preserved shell form |
| shared shell bridge provider | per-component polling and shell-control refresh logic previously lived separately across second-gate carriers | `application-shell-bridge.tsx`, `protocol-demonstration/public/app.js`, and `protocol-demonstration/src/client-entry.js` | mounted-shell semantic state and control refresh remain centralized, exact, reusable across route-local application carriers, and fail closed during pre-mount or hot-reload rebuilds instead of crashing `/application` | the operator should experience one coherent Bitcode application state carrier rather than drifting per-panel refresh loops |
| command-state and control bridge | preserved-shell command posture and mutable operator actions exposed for native application composition without DOM scraping | `application-shell-bridge.tsx`, `protocol-demonstration/public/app.js`, `protocol-demonstration/src/client-entry.js`, `ApplicationCommandDeck.tsx`, and `application-command-state.ts` | scenario, projection, branch mode, flow-guide continuity, make-branch, and reset remain application-visible and semantically aligned to the preserved shell while preserved-shell tutorial fields survive only as compatibility input | the operator should experience a route-owned command surface rather than a DOM-proxy shell control strip |
| application section atlas bridge | route-local atlas previews previously depended on rendered shell panel text and card counting | `protocol-demonstration/public/app.js`, `protocol-demonstration/src/client-entry.js`, `ApplicationSectionAtlas.tsx`, and `application-section-atlas.ts` | atlas previews remain aligned to the real Bitcode body without reintroducing panel-markup scraping | the operator should experience a semantic application atlas rather than a DOM-era section mirror |
| core-state semantic snapshot bridge | preserved-shell operating, depositing, reading, and fit panels previously depended on rendered shell DOM for application-owned composition | `protocol-demonstration/public/app.js`, `protocol-demonstration/src/client-entry.js`, `ApplicationCoreNativeSections.tsx`, and `application-core-surface.ts` | route-local deposit/read and master-detail core sections read exact Bitcode surface truth without relying on rendered panel markup | the operator should experience native Bitcode core cards that stay semantically exact without DOM-era drift |
| deposit/read semantic snapshot bridge | preserved-shell semantic state and active operator selections exposed for native application composition without re-deriving Bitcode truth from generic markup | `protocol-demonstration/public/app.js`, `protocol-demonstration/src/client-entry.js`, `ApplicationDepositReadWorkbench.tsx`, `ApplicationSupplySelectionPanel.tsx`, `application-deposit-read-workbench.ts`, and `application-supply-selection.ts` | route-local V26 sections read exact Bitcode shell truth without mutating first-gate ownership or inventing alternate semantics | the operator should experience deeper native composition without semantic drift between preserved shell and application-owned sections |
| external interfacing posture | `renderOperatingPicture()`, `state.boundaryRealitySurface`, `latestRun.externalRealizationSummary`, and `apps/uapi/app/api/v24/external-realization/route.ts` | `ApplicationExternalInterfacingPanel.tsx`, `application-external-runtime.ts`, and the app-owned V24 route surface | environment mode, actuality disposition, boundary-only posture, live misconfiguration, and per-interface runtime state remain explicit and fail closed | the operator should clearly understand what is mocked, what is boundary-only, what is live-configured, and what is currently blocking |
| read action frame | `renderScenario()`, `renderFit()`, measured-demand and fit surfaces | route-local application sections and controls within the master-detail workspace, centered on `ApplicationCommandDeck.tsx`, `ApplicationReadScenarioPanel.tsx`, `ApplicationExperienceFrame.tsx`, and `ApplicationCoreNativeSections.tsx` | scenario framing, measured read, and fit pressure remain explicit before closure stages | the operator should clearly understand how to express and inspect read |
| deposit/read action detail | current shell-selected repo supply, measured demand, and fit intent carried into route-local application-owned action blocks | `ApplicationDepositReadWorkbench.tsx`, `ApplicationActionWorkbenchCard.tsx`, and `application-deposit-read-workbench.ts` | repository supply posture, measured read, and fit/closure intent remain explicit as the two main Bitcode actions | the operator should read deposit and read as dense application-grade action detail rather than preserved-shell-only panels |
| global navbar and app frame | `apps/uapi/components/base/bitcode/layout/nav.tsx`, current app shell carriers | integrated app-shell frame around `/application` | the established pre-Bitcode navigation frame remains intact while Bitcode stays the product identity | keep the familiar application frame and density, but make its labels and destinations fully Bitcode-first |
| shell frame, command rail, summary, hero posture | `apps/uapi/app/application/ApplicationPageClient.tsx`, `apps/uapi/app/application/ApplicationCommandDeck.tsx`, `apps/uapi/app/application/ApplicationLiveSummaryStrip.tsx`, `apps/uapi/app/application/application-command-state.ts`, `apps/uapi/app/application/application-live-summary.ts`, `protocol-demonstration/public/app.js` | route-local `apps/uapi/app/application/*` composition using current app shell carriers and the shell command/control bridge | scenario/projection/branch controls, run status, summary posture, exact settlement/repository reconnect posture, reset, and canon posture remain explicit and synchronized to the preserved shell | read as a first-class Bitcode application page instead of a carried static shell |
| flow-guide and explainer system | `protocol-demonstration/public/app.js` guide/explainer contract plus `application-flow-guide.ts` and `ApplicationFlowGuideCard.tsx` | route-local flow-guide/explainer composition plus current overlay primitives where appropriate | stepwise operator guidance, resumable working-flow continuity, targeted explainers, and exact reconnect-required readiness labels remain available while preserved-shell tutorial fields survive only as compatibility input | use current overlay and panel language without losing the guide’s operator-facing role |
| conversations fullscreen workspace | `apps/uapi/app/conversations/components/*`, `packages/api/src/routes/conversations.ts`, `packages/api/src/conversations/*` | application-mounted fullscreen overlay launched from `/application` | chat-based interaction, tool usage, route-orchestration continuity, and conversational continuity remain first-class without leaving application context | read as a fullscreen Bitcode conversation workspace over the application rather than as a separate product destination |
| operating picture | `renderOperatingPicture()` and related first-gate visual surfaces | route-local section atlas plus `ApplicationCoreNativeSections.tsx`, then later deeper app-native section composition | repo-supply to settlement reading remains the opening systems view | denser application-grade cards and system summaries, not a demo-only tableau |
| depositing and repo supply | `renderRepoInventory()`, `renderAssets()`, deposit form semantics | route-local section atlas plus `ApplicationCoreNativeSections.tsx`, `ApplicationSupplySelectionPanel.tsx`, `ApplicationDepositComposer.tsx`, and then route-local section plus current VCS/integration/input carriers | authenticated repo session, inventory filtering, deposit overrides, and raw fallback remain intact | application-grade form layout and inventory browsing using current input, card, and integration patterns |
| reading and measured demand | `renderScenario()`, read/measurement surfaces | route-local section atlas plus `ApplicationCoreNativeSections.tsx`, `ApplicationReadScenarioPanel.tsx`, and then route-local section with app-native panels | active scenario, benchmark/read framing, and measured-demand reading remain explicit | clearer scenario framing and demand readability while preserving semantic output |
| deposit-to-read fit | `renderFit()` and fit/asset-pack surfaces | route-local section atlas plus `ApplicationCoreNativeSections.tsx`, then route-local section with app-native comparison and explanation composition | fit must remain legible before proof/settlement | stronger decisive-vs-normalization readability using native comparison panels |
| ranked candidates and verification determinisms | `renderEvaluations()` and verification report surfaces | route-local section atlas plus `ApplicationClosureNativeSections.tsx` and `application-closure-state.ts`, then deeper route-local section composition using current execution/log/panel carriers where useful | ranking, use tiers, verification determinisms, and report reading remain intact | application-grade ranking and verification panels rather than preserved shell blocks |
| branch artifacts and materialization | `renderBranchArtifacts()` and artifact bundle surfaces | route-local section atlas plus `ApplicationClosureNativeSections.tsx` and `application-closure-state.ts`, then route-local section with package-fed artifact data and app-native detail panels | branch mode, projection visibility, artifact bundle reading, and materialization proof remain intact | clearer private-remediation workspace reading with richer panels and evidence grouping |
| settlement, proofs, and journal/accounting closure | `renderSettlement()` and settlement/proof visuals | route-local section atlas plus `ApplicationClosureNativeSections.tsx` and `application-closure-state.ts`, then route-local section with app-native proof/accounting composition | exact accounting, source-to-shares, proof family, and journal diff semantics remain intact | structured settlement/proof reading suitable for a production-initial application page |
| closure operation control | preserved-shell make-branch/reset/refresh posture previously lived only in shared command controls and underlying shell actions | `ApplicationClosureControlDeck.tsx`, `application-closure-controls.ts`, and the shell command/control bridge | branch execution, closure refresh, reset, and follow-through focus remain semantically aligned to Bitcode closure | the operator should experience a native closure operation deck rather than treating closure as an opaque lower-body shell action |
| ledger, run history, and policy surfaces | `renderLedger()` and policy/ledger/history visuals | route-local section atlas plus `ApplicationClosureNativeSections.tsx` and `application-closure-state.ts`, then route-local section plus application-owned execution/history linkages and reused execution carriers | ledger accounts, run history, and bounded proof metadata remain explicit | read as a live application workspace/history surface instead of a shell appendix |
| run detail and AssetPack/Shippable master-detail surfaces | `apps/uapi/app/executions/*`, `packages/api/src/routes/{shippables,executions}.ts`, execution/log/AssetPack/Shippable panels | inward-ported master-detail sections, drawers, and detail surfaces within `/application` | run inspection, logs, work updates, execution-history route-orchestration, AssetPack evidence, PR Shippables, and proof reading remain available without semantic loss | reuse the strongest execution plus AssetPack/Shippable interaction patterns inside `/application` rather than preserving peer destinations |
| orbitals relationship | `apps/uapi/app/auxillaries/*`, redirect-only `apps/uapi/app/orbitals/*`, `apps/uapi/app/api/auxillaries/data/route.ts`, and `apps/uapi/app/api/auxillaries/model-preferences/route.ts` | canonical auxillaries ownership with redirect-only orbital compatibility, stronger application-page entry points, pane rehabilitation, and signed-in preference coherence | auxillaries remain the Connects/Interfaces/Profile/`$BTD` owner, `Interfaces` and `$BTD` now read through application-owned panes instead of model or credits wrappers, contained auxillary rails now use shared panel/tabs carriers instead of older floating ring-label sequence furniture, and auxillaries are not flattened into `/application` | the ringed overlay stays intact and feels like the application’s auxillary layer |
| orbital preference persistence | signed-in orbital defaults historically depended on missing or demo-local save carriers | `apps/uapi/app/api/auxillaries/model-preferences/route.ts`, `OrbitalsInterfacesPane.tsx`, `OrbitalsBTDPane.tsx`, and shared orbital workspace carriers | authenticated read, lead/admin write, shared preference-card posture, and operator-facing default continuity remain explicit without reviving demo-era pane indirection | the operator should experience real orbital preference ownership rather than compatibility wrapper panes |

### Second-gate semantic non-regression rule

Second-gate implementation must preserve:
- scenario selection,
- projection selection,
- branch-mode selection,
- deposit submission and repo inventory filtering,
- read and fit interpretation,
- ranking and verification reading,
- branch artifact and materialization reading,
- settlement and exact-accounting reading,
- bounded proof and disclosure reading,
- flow-guide continuity fed from preserved-shell tutorial compatibility,
- and fail-closed boundary honesty.

If any of those semantics change, the change must be explicit in V26 rather than hidden inside UI refactoring.

### Second-gate external interfacing hardening scope

Second-gate must harden the application-facing external interfacings that are visible from or directly drive `/application`.
At minimum this includes:
- authenticated repo and GitHub-adjacent interaction carriers,
- account/auth-connected application entry posture,
- current bitcoin-demonstration-service and V24 external-realization route surfaces as they appear through the application page,
- compute/storage/repeated-read/sidechain boundary readability and failure posture,
- and application-visible error/loading/empty-state handling for those surfaces.

Second-gate stable readiness means:
- the route behaves coherently under the supported second-gate posture,
- external-boundary failures are legible and fail closed,
- the user can understand what is modeled, what is observed, and what remains boundary-only,
- and the new application page no longer reads like a preserved prototype shell with production concerns merely stapled onto it.

### Second-gate acceptance matrix

Second-gate is accepted only when all of the following hold:

1. Design acceptance
   - the section wireframe pack is approved,
   - the semantic non-regression ledger is explicit,
   - the component adoption matrix is explicit,
   - and the external interfacing hardening matrix is explicit.

2. UI acceptance
   - `/application` is primarily route-local app composition rather than a carried monolithic shell DOM/CSS contract,
   - `/application` is the only primary Bitcode destination,
   - `/application` clearly reads as the master-detail Bitcode workspace,
   - `/application` treats `transactionId` as the primary master-detail query carrier while continuing to accept inbound `runId` for compatibility convergence,
   - transaction selection plus rich master-table filter posture are route-owned and shareable through application query state instead of being trapped in local component state,
   - transaction-detail focus is route-owned and shareable through application query state rather than being trapped in local detail-surface state, with `transaction` as the preferred detail carrier and legacy `identity` accepted only for compatibility parsing,
   - selected-transaction closure rerun and detail refresh are available directly from the application-owned detail surface through the shell bridge,
   - selected-transaction closure, proofs, and history are explicit detail carriers inside `/application` rather than being buried under one closure pane or delegated back to shell-section follow-through,
   - the deposit-side application frame includes explicit repository connection posture and selected repository supply before the deposit chain,
   - the route-local command deck reads and drives scenario/projection/branch/flow-guide/reset posture through the shell bridge rather than direct DOM scraping,
   - route-local deposit submission is available through an application-owned Bitcode composer that posts to the app-owned deposit route and refreshes shell state coherently,
   - route-local read selection is available through an application-owned scenario carrier that drives active Bitcode read posture through the shell bridge,
   - route-local support rail and deposit-side supply terminal both use the same shared application-shell/help grammar as the rest of the application workspace rather than bespoke section shells,
   - the retained navbar frames the Bitcode application,
   - the page reads as Bitcode inside the app shell,
   - and the application aesthetic atmosphere is preserved without reverting product identity away from Bitcode.

3. UX acceptance
   - the three main experiences are legible as master detail, conversations, and orbitals,
   - the two main actions are legible as deposit and read,
   - repository connection posture and selected repository supply are legible as part of the deposit-side action frame,
   - route-local supply selection makes authenticated intake session, artifact filtering, search, and inventory selection explicit inside `/application`,
   - route-local deposit composition keeps title/author overrides, raw fallback content, and selected-inventory continuity explicit inside `/application`,
   - route-local read composition keeps active scenario choice, parser posture, closure count, and target-kind posture explicit inside `/application`,
   - route-local polling and shell-control refresh are centralized through `application-shell-bridge.tsx` rather than repeated independently across second-gate carriers,
   - route-local deposit/read action detail reads through the semantic shell snapshot bridge rather than generic shell markup,
   - transactions, shippables, proofs, and history are explicit as the four master-detail substructures inside `/application`,
   - the transactions master surface supports free-text search plus direct filtering by status, ownership, repository, participant, proof posture, and sort order,
   - visible operator copy stays user-referencing and does not narrate gates, routes, shell plumbing, mounted-state mechanics, or source-path internals back to the operator,
   - the repo-supply to settlement journey remains understandable,
   - conversations and orbitals are reachable as fullscreen overlays without abandoning application context,
   - selected-transaction detail and Shippable-reading workflows are available from within `/application` through master-detail reuse in both live and mock posture,
   - flow-guide and explainer guidance remain useful,
   - orbital entry and account state remain coherent with the application page,
   - shared orbital-entry copy remains coherent across application buttons, notifications, user-menu chrome, and focused orbital routes,
   - contained orbital access shells and focused orbital routes keep orbitals-first wording, read as contained orbital reads, and remain width-stable when entered from `/application` rather than regressing to generic workspace/settings/account furniture,
   - preserved-runtime help, reference chips, and telemetry labels stay Bitcode-facing instead of leaking canon, source-path, or standalone-demonstration language into operator-visible surfaces,
   - and first-gate semantic regressions are not introduced.

4. External hardening acceptance
   - the application-facing external interfacings used by the page are stable enough to be considered second-gate-ready,
   - the app-owned `/api/vcs/*` contract coherently feeds repository connection posture and repository selection inside `/application`,
   - the app-owned `/api/v24/external-realization` contract coherently feeds a native external-interfacing posture read inside `/application`,
   - boundary honesty remains explicit,
   - and failure states are deliberate rather than incidental.

5. Documentation and parity acceptance
   - second-gate repository/specification documents stay synchronized to active source state,
   - the active second-gate markdown set includes the root, package, route, and shared-component README carriers and is treated as required implementation scope rather than optional cleanup,
   - supplementary modular docs are identified wherever the canon is not the right long-form carrier,
   - active supplementary carriers such as `protocol-demonstration/V26_APPLICATION_SYSTEMS.md` and `protocol-demonstration/V26_PROOF_SURFACES.md` stay synchronized to the converged source topology,
   - `.bitcode/v26-gate-checkpoint-report.json` exists and records first-gate closure, second-gate closure readiness, and explicit third-gate preparation before final V26 promotion,
   - the active internal module namespace is `@bitcode/*` across package manifests, path aliases, and active source imports,
   - and new second-gate code systems are assigned proof/test/spec coverage rather than being treated as unproven incidental glue.

6. Separation acceptance
   - third-gate marketing work is not required for second-gate acceptance,
   - and fourth-gate debug/environment controls are not treated as substitutes for second-gate interface hardening.

### Second-gate implementation order

The intended second-gate implementation order is:
1. navbar/app-frame and shell-frame convergence,
2. guide/command/rail replacement,
3. depositing and repo-supply replacement,
4. reading and fit replacement,
5. ranking/verification replacement,
6. branch-artifact and settlement/proof replacement,
7. ledger/history/policy plus run-detail master-detail convergence,
8. orbitals and conversations overlay convergence tightening,
9. external interfacing hardening and final second-gate verification.

## V26 fourth-gate retained-system convergence contract

Fourth-gate ports the retained application systems into the Bitcode V26 total system instead of leaving them as neighboring platforms with only loose shared UI or API glue.

### Fourth-gate retained system owners

| Retained system | Current source basis | Fourth-gate target requirement |
| --- | --- | --- |
| conversations and chat-based application interface | `apps/uapi/app/conversations/components/*`, `packages/api/src/conversations/*`, `packages/conversations-generics/*` | remain first-class application interfaces and port onto the Bitcode V26 system model rather than sitting beside it |
| executions, runs, pipelines, and retained execution APIs | `apps/uapi/app/executions/*`, `apps/uapi/app/api/vcs/route.ts`, active `apps/uapi/app/api/templates/shippables/route.ts`, `apps/uapi/app/api/auxillaries/template-preferences/route.ts`, `packages/api/src/routes/shippables.ts`, `packages/api/src/pipelines/branch.ts`, `packages/execution-generics/*`, `packages/pipelines/*` | remain explicit merged-world `executions` primitives, with pipeline runs, read measurement, PR-only Shippable template personalization, and retained selectors/template personalization staying execution-shaped inside the broader `activity` family while old `/api/deliverables` and `/api/templates/deliverables` mounts are removed from active V26 |
| retained auxillaries routes, preferences, and companion panes | `apps/uapi/app/auxillaries/*`, redirect-only `apps/uapi/app/orbitals/*`, `apps/uapi/app/api/auxillaries/data/route.ts`, `apps/uapi/app/api/auxillaries/profile/route.ts`, `apps/uapi/app/api/auxillaries/connections/github/route.ts`, `apps/uapi/app/api/auxillaries/model-preferences/route.ts`, `apps/uapi/app/api/auxillaries/btd/route.ts`, `apps/uapi/app/api/auxillaries/usage/route.ts`, `apps/uapi/app/api/auxillaries/transactions/route.ts`, `apps/uapi/app/api/auxillaries/api-keys/route.ts`, `apps/uapi/app/api/auxillaries/user/data-share/route.ts` | converge on merged-world `auxillaries`: extra-network, non-transactional, still-proven user preference, interface, identity, external-connection, and BTD-throughput surfaces that remain around the Bitcode core without being treated as the network/activity center |
| PostgreSQL and Supabase persistence | `supabase/*`, `supabase/migrations/001_v26_production.sql`, `packages/supabase/src/*`, `packages/orm/src/models/*`, `packages/orm/src/queries/*`, `packages/orm/src/types/database.generated.ts`, `packages/orm/src/types/database.ts`, `packages/orm/scripts/generate-db-types.ts`, active database-facing API carriers, `/edgetimes`, and `/api/edgetimes` | converge on one explicit Bitcode persistence owner with active migrations, schema contracts, typed query ownership, generated database types, and application/API boundaries that are no longer informal |
| prompt abstraction and prompt space | `packages/prompts/src/*`, `apps/uapi/prompts/conversations-system-prompt.ts`, `protocol-demonstration/src/canonical/type-contracts.ts` | become the direct source of prompt text and prompt contracts across retained V26 systems, and weave into a proved prompt space |
| retained agent and tool abstractions | `packages/generic-agents/*`, `packages/git/*`, `packages/vcs/*`, related API/tool carriers | remain as retained abstractions only where V26 gives them a clear role inside conversations and pipeline capabilities |
| former `deliverable` semantics | `packages/api/src/routes/shippables.ts`, `apps/uapi/app/executions/*`, `packages/pipelines/asset-pack/*`, current execution components | are reformed under Bitcode V26 so `deliverable` remains only a trace/storage-boundary word while active route, payload, UI, notification, and template semantics are `AssetPack` plus Finish-delivered GitHub pull-request `Shippable`; see `protocol-demonstration/V26_SHIPPABLE_REFORM.md` |

### Fourth-gate convergence rules

Fourth-gate requires:
1. the conversations interface remains and ports into the Bitcode V26 system model,
2. the chat-based and ChatGPT-like application interaction model remains available as a fullscreen application mode entered from `/application` rather than being displaced by it,
3. non-chat and non-orbital execution surfaces converge onto a V26 runs/pipelines system centered inside `/application`,
4. retained `deliverable` semantics collapse into Bitcode V26 run/pipeline asset-pack and written-asset semantics,
5. all retained prompt text must route through prompt abstraction rather than ad hoc inline prompt strings,
6. the proved prompt space must cover retained conversation and pipeline prompts,
7. PostgreSQL and Supabase persistence, including `/edgetimes`, must have one explicit Bitcode V26 owner rather than floating across informal API glue,
8. `supabase/migrations/001_v26_production.sql`, `packages/supabase/src/*`, `packages/orm/src/models/*`, `packages/orm/src/queries/*`, `packages/orm/src/types/database.generated.ts`, `packages/orm/src/types/database.ts`, and `packages/orm/scripts/generate-db-types.ts` must be treated as explicit retained-system owners with tests, docs, comments, and proof coverage rather than incidental infrastructure residue,
9. retained agent/tool abstractions must have explicit V26 roles or be excluded from retained-package status,
10. retained tool and agent ports must be prompted and purposed for Bitcode canonical use, with systems such as Jira scoped first to read-ingestion and read-measurement reads rather than expansive settle-write semantics,
11. initial testnet-ready settle-write closure may remain Git/GH-branch/GH-PR centric even when later multi-surface settle writes are planned,
12. retained `/executions` APIs such as `/api/vcs`, active `/api/templates/shippables`, and `/api/auxillaries/template-preferences` are treated as explicit fourth-gate promotion-boundary owners rather than incidental glue, while `/api/templates/deliverables` is removed from active V26,
13. canonical auxillary APIs such as `/api/auxillaries/profile`, `/api/auxillaries/connections/github`, `/api/auxillaries/btd`, `/api/auxillaries/usage`, `/api/auxillaries/transactions`, and `/api/auxillaries/api-keys` are explicit active owners rather than latent pane-side assumptions,
14. retained `/executions` naming must remain `executions`, where Bitcode execution primitives, measured-read runs, and pipeline follow-through stay explicit inside the broader searchable `activity` family,
15. fourth-gate must also establish one shared activity vocabulary so transactions, executions, and user-facing notifications normalize through the same typed Bitcode activity model before later activity classes are admitted,
16. retained `/orbitals` naming must converge on merged-world `auxillaries`, where extra-network, non-transactional preference/interface/identity/connection surfaces stay proven without displacing the core network/activity topology, and `/orbitals/*` survives only as redirect-only compatibility into `/auxillaries/*`,
17. current executions and former deliverable-reading surfaces are treated as inward-ported master-detail/workspace reuse carriers rather than the lasting Bitcode topology,
18. and retained packages must be admitted intentionally rather than kept implicitly because they already exist.

### Fourth-gate material evidence and reclosure matrix

Fourth-gate material evidence is sufficient only when:
1. conversations, chat, and execution/runs surfaces still function as first-class application systems,
2. those systems are specified as Bitcode V26 systems rather than as adjacent Bitcode-era subsystems,
3. conversations operate as a fullscreen application mode and not as a separate product reservoir,
4. execution and AssetPack/Shippable master-detail patterns are ported inward to `/application`,
5. prompt abstraction is the direct source for retained prompt text,
6. persistence ownership across `supabase/*`, `packages/supabase/*`, storage-facing API carriers, and `/edgetimes` is explicit,
7. active migrations, schema contracts, ORM/query carriers, and generated types are explicit retained-system owners with test/spec/doc obligations,
8. retained package roles and boundaries are explicit,
9. former deliverable, run, and pipeline meaning are explicit under V26 as AssetPack run, stored evidence, and PR Shippable semantics,
10. retained tools and agents are Bitcode-purposed with prompt ownership and reader-first fourth-gate scope,
11. Git/GH-based settle-write carries the required initial testnet-ready asset settlement posture,
12. retained executions compatibility APIs are explicit promotion-boundary owners instead of invisible route glue,
13. canonical auxillary APIs are explicit active owners rather than latent pane-side dependencies,
14. retained `/executions` and `/orbitals` compatibility routes visibly teach `executions` and `auxillaries` as the merged-world target, with `/orbitals/*` reduced to redirect-only compatibility that no longer renders canonical HTML,
15. retained transaction, execution-event, and notification surfaces share one typed Bitcode activity vocabulary rather than drifting into separate activity semantics,
16. fourth-gate proof obligations are assigned to generated proof families rather than left informal,
17. and generated checkpoint/proven/promotion artifacts close fourth-gate procedural acceptance only after `.bitcode/fourth-gate-reclosure-review-proof.json` maps all criteria to generated proof-family evidence and records no blocking fourth-gate deviance, because passing material evidence alone is not the same thing as procedural closure.

## V26 fifth-through-eighth-gate closure contract

Fifth-gate is the minimum-functional Bitcode Exchange and Bitcode Terminal gate for V26, and it also owns the retained-system Bitcode purification baseline that must already be complete before V26 can claim a Bitcode-native product foundation.
Sixth-gate is the minimal viable product elevation gate for Exchange, Terminal, Protocol, Proofs, and admitted interfaces.
Seventh-gate is the initial commercially-viable testnet live-launch refinement gate.
Eighth-gate is the final whole-repository provation and closure gate for V26.
V26 is fully proven only after fourth-, fifth-, sixth-, seventh-, and eighth-gate closure all hold, with prompt-space completeness, whole-repository production satisfaction, and total V26 closure generated as explicit final verdicts for the systems V26 keeps.

### Fifth-gate minimum-functional north star

Fifth-gate is not closed by rename cleanup alone.
Its north star is the minimum functional Bitcode system:
- one system,
- Bitcode and only Bitcode in active product semantics,
- practically usable through the `Bitcode Terminal` and the protocol interfaces it exposes,
- explicit about what belongs to fifth-gate versus later quality/commercialization work,
- and already purified enough that retained repository systems no longer survive as a parallel product worldview on the live Bitcode path.

For V26, minimum functional Bitcode means the repository can do exactly two primary things:
1. make shares
2. use shares

`make shares` means:
- a depositor can bind admissible source material through `Connects`,
- express deposit/read posture through the Bitcode Terminal or the equivalent protocol write interface,
- trigger canonical read-measurement and branch-artifact execution on the retained execution substrate,
- review the synthesized Read after measurement and before fit search, with explicit accept, reject, and remeasure-with-feedback outcomes,
- synthesize asset-pack/share candidates with attached proof and history,
- and persist those results into the same activity/proof/history state read by the rest of the system.

`use shares` means:
- a reader or producer can read the Bitcode activity ledger,
- inspect selected activity, asset-pack outputs, proofs, and history,
- consume, route, trade, or produce against those outputs through the same Bitcode-owned state model,
- and carry settlement-follow-through or output-destination behavior without falling back to demo-only or compatibility-only paths.

The minimum functional system is therefore not website-only.
It is the joined deployment of:
- the `Bitcode Exchange` backend implementation,
- the `Bitcode Terminal` at `/application`,
- the active API surfaces,
- the admitted `Bitcode MCP` and ChatGPT-style app surfaces,
- the retained protocol/runtime owners that those interfaces read from and write to,
- and the `Bitcode Protocol` specification/proof/test family that audits those interfaces as one canonical system.

The commercial implementation is an extension of the demonstrated Bitcode protocol, not a parallel product that merely cites it.
When `protocol-demonstration/` defines low-level source-to-shares behavior, the commercial Exchange, Terminal, API, MCP, ChatGPT App, and package-owned surfaces must lift that behavior into production owners with parity tests and proof witnesses rather than rephrasing it as independent application logic.

Fifth-, sixth-, and seventh-gate readiness auditing must remain product-specific and honest.
`.bitcode/v26-product-readiness-audit.json` derives the current readiness map from the protocol-demonstration Exchange-lite implementation, the protocol-demonstration Terminal-lite shell UI, commercial `uapi` Exchange/Terminal surfaces, and `BITCODE_SPEC_V26_PARITY_MATRIX.md`.
That audit may prove the fifth-gate product baseline, sixth-gate MVP elevation, and seventh-gate commercial testnet launch posture as source-backed only when the explicit fifth-, sixth-, and seventh-gate closure proofs exist; final eighth-gate V26 closure remains owned by prompt-space completeness, whole-repository production satisfaction, and total-closure proofs rather than by product readiness alone.

The following are required for fifth-gate minimum functionality:
- activity-ledger master-detail read posture is searchable, filterable, paginatable, and stable,
- `/application` write surfaces for deposit, read, deposit, branch, and closure round-trip back into that same activity ledger through the app-owned `/api/executions/history` route family rather than leaving the Bitcode Terminal for a separate write/read model,
- when live protocol posture exists before retained execution-history persistence catches up, the Bitcode Terminal may project that posture into the same activity ledger as a protocol-owned live row rather than dropping back to review-only or mock-only state,
- measured Reads are reviewable after synthesis and before find-fit/settlement search; the accepted/rejected/remeasure-with-feedback state is emitted as `.bitcode/read-review.json`, `/api/read-review` returns an Exchange `readFittingReview` payload for the Terminal, and fit search is not admitted until review accepts the Read,
- conversations are a real rich-input write surface with source attachments, execution intent, and output destinations,
- Evidence Documents are the active V26 name for evidence-bearing context documents used by conversations, prompt overlays, template preferences, MCP resources, and product surfaces; `ai_document*` storage identifiers survive only as bounded physical Exchange persistence carriers where the current schema still requires them,
- auxillaries hold the real preconditions for transacting and settling,
- the top-right balance posture and `$BTD` auxillary read must distinguish BTC as fee liquidity from non-fungible `$BTD` as content-measured share/read-right holdings; replacing old credits with fungible `$BTD` spend semantics is not accepted V26 reform; later Terminal/Exchange issuance work must respect the fixed 21,000,000 `$BTD` mintable ceiling,
- wallet identity in `Profile` plus GitHub or equivalent repository scope in `Connects` are enforced as the minimum transactional readiness posture, while signed settlement requires live verified wallet-provider signing access rather than saved profile posture alone; settlement-bearing route admission must prove that the selected repository anchor belongs to the connected provider inventory, that the live repository-provider session remains valid, and that any saved verified wallet signer posture still resolves to a live wallet-provider signing session before deposit or branch materialization can proceed,
- protocol-owned routes like deposit and branch creation plus retained execution-history rows stay synchronized enough that a successful write can immediately be reread inside Bitcode Terminal detail,
- retained persistence, ORM/query, and route carriers form one coherent state model rather than separate demo/app interpretations,
- retained systems that survive into V26 are already cut, isolated, or Bitcode-purposed enough that they no longer teach or power a parallel product model,
- multi-agent execution toggles and multi-output pipeline selection are removed from the V26 live path rather than renamed into Bitcode product controls,
- computer-use is not a Terminal-facing execution option in V26; it is admitted only as an internal, registry-configured, server feature-flagged Read-measurement evidence primitive through `BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT`,
- and active product semantics teach Bitcode shares of technical intelligence rather than a loose generic developer or agentic platform.

The following are explicitly not required for fifth-gate closure:
- final financial-product aesthetic tightening and high-polish interface refinement; that is later quality/commercial-readiness work,
- broad computer-using agents or operator-visible computer-use controls; V26 performs only the basic internal Read-measurement reformation and defers full computer-use ability beyond V26,
- a `mainnet` split or post-testnet deployment posture; that belongs to later-version addition work beyond the V26 minimum-functional target,
- full `$BTD` tokenomics are V27 work, full Terminal actuality is V28 work, full Exchange market implementation is V29 work, external connections and interfaces including third-party integrations, MCP API, and ChatGPT App are V30 work, and the fully proven/tested/documented/shippable Proven Protocol line is V31 work; V26 must still scaffold these directions without presenting old credit purchase flows as current Bitcode truth,
- or whole-repository proof saturation beyond the closure families already assigned to V26 later gates.

### Fifth-gate accepted closure set

The accepted fifth-gate closure set must be read through the two north-star abilities above.

To close `make shares`, the repository ensures:
- repository anchoring, supply selection, read measurement, fit/settlement posture, deposit, branch creation, and closure controls can all write Bitcode activity back into the same ledger rather than stopping at preserved shell state,
- repository read carriers such as `/api/vcs/[provider]/repositories`, the repository-supply panel, and admitted auxillary repository-share views prefer stored connected-provider inventory when Exchange persistence already holds it, fall back to live provider inventory only when stored rows are absent, disclose that basis as `inventorySource` so read truth and write admission use the same repository-boundary semantics, and keep stored inventory readable inside `/application` even when a saved provider attachment has degraded to reconnect-required,
- the primary auxillary reread carrier at `/api/auxillaries/data` must reuse that same stored-first/live-fallback repository inventory contract, expose `repositoryInventorySource`, `repositoryConnectionStatus`, and `walletConnectionStatus`, and feed `Connects` plus `$BTD` with the same repository-scope and signer-session truth enforced by deposit and branch admission so stale saved provider sessions degrade to reconnect-required and saved verified wallet signer posture without a live provider session degrades to wallet reconnect required rather than reading as settlement-ready,
- the main `/application` route must derive transactional readiness from the strongest available repository carrier in order: route-local repository context first, auxillary reread second, and weak connection-presence fallback only when richer carriers are absent, so reconnect-required provider drift is not masked by stale cached validity,
- active `apps/uapi/app` owners are TypeScript-only canonical owners; duplicate JavaScript mirrors must not coexist beside TypeScript route entrypoints, route-local components, hooks, helper modules, or API shared carriers because that creates parallel active source and duplicate runtime ambiguity across the Bitcode Terminal, conversations, auxillaries, orbitals, and public-product corridors,
- read review is visible and replayable as the boundary between synthesized measurement and fitting, so bad or too-broad Reads can be rejected or remeasured with feedback before AssetPack selection,
- those writes stay source-bearing and rerunnable through the Bitcode Terminal and admitted API surfaces,
- and the retained execution substrate is teaching canonical Bitcode share-making semantics rather than generic transaction or pipeline posture.

To close `use shares`, the repository ensures:
- the Bitcode activity ledger is the dominant searchable, filterable, paginatable, stable master-detail read surface,
- selected activity detail exposes asset packs, proofs, history, and settlement follow-through without forcing a second primary surface,
- conversations, APIs, MCPs, and admitted third-party app interfaces can read and continue the same Bitcode-owned state,
- and auxillary readiness, wallet posture, repository scope, and destination routing remain part of the same system rather than side assumptions.

To close fifth-gate as a minimum-functional gate, the repository ensures:
- protocol-owned writes, retained execution-history rows, persisted conversation state, and `/application` rereads remain coherently synchronized,
- active product semantics teach Bitcode shares of technical intelligence and only Bitcode,
- repository-wide active-source health is stable enough to support the minimum-functional claim,
- retained-system Bitcode purification is already complete enough that the live Bitcode path reads as a Bitcode-native system rather than a renamed compatibility shell over unpurified centers,
- and the fifth-gate proof families can be generated without unresolved blockers in the required proof path.

### Fifth-gate exhaustive acceptance matrix

The fifth-gate closure work remains active and is governed by the following matrix.
This matrix is the complete planning surface for the minimum-functional Bitcode target.
Each row names:
- the required interface design visible to operators or admitted protocol consumers,
- the required implementation/parity condition in current source,
- the code families that must carry the behavior,
- and the closure evidence that accepts fifth gate.

| Acceptance domain | Required interface design (`SPEC`) | Required implementation/parity (`PARITY`) | Active source basis / owning families | Fifth-gate closure evidence |
| --- | --- | --- | --- | --- |
| Bitcode Terminal activity ledger | `/application` exposes one dominant searchable, filterable, paginatable activity ledger with stable selected-detail posture | list, filters, selection, and reread are one Bitcode-owned read model even when retained persistence lags | `apps/uapi/app/application/*`, retained execution-history readers, application transaction projection helpers | stable browser/read verification plus activity-ledger proof artifact coverage |
| Selected activity detail | selected activity exposes identity, stored AssetPack evidence, Finish-delivered Shippables, proofs, history, closure follow-through, and settlement posture without forcing a second primary product surface | selected-detail fallback can reread both persisted and projected protocol posture; no shell-only detail dependency remains | `apps/uapi/app/application/{ApplicationTransaction*,application-transaction-detail*,application-protocol-projection*}` | selected-detail proof coverage and deterministic detail snapshot tests |
| Deposit/read/write surfaces | `deposit`, `read`, `fit`, `deposit`, `branch`, and `closure` controls all write through the Bitcode Terminal rather than redirecting to a separate product model | every write materializes back into the same ledger with immediate rereadability | `apps/uapi/app/application/{ApplicationCommandDeck,ApplicationDepositReadWorkbench,ApplicationDepositComposer,ApplicationClosureControlDeck,ApplicationPageClient,application-activity-history}.tsx` | write-through proof, targeted route/browser checks, and ledger reread tests |
| Read review before fit search | synthesized Reads are presented for review after measurement and before fitting, with accept, reject, and remeasure-with-feedback outcomes plus a Terminal-readable Read-fitting admission surface | `.bitcode/read-review.json` records the reviewable Read, applied decision, source-to-shares focus, and fit-search admission state; candidate recall/ranking starts only after accepted review; the Bitcode Terminal closure map and native read-scenario controls must surface the review boundary before verification, fit search, and settlement reads; `/api/read-review` must expose the same reviewable Read, return `readFittingReview` with blocked/admitted fit stages and the present-fit settlement objective contract, and persist explicit accept/reject/remeasure decisions before `/api/make-bitcode-branch` can continue fitting; protocol-demonstration SPEC-IMPL and commercial repository SPEC-IMPL must be parity-tested at the route boundary so low-level Bitcode behavior, not route-local copy, drives production behavior; accepted commercial branch materialization must carry the same `.bitcode/read-review.json`, `.bitcode/source-to-shares.json`, `.bitcode/settlement-preview.json`, and `settlement-source-to-shares` fit-quality receipt evidence that the protocol implementation produces | `protocol-demonstration/src/canonical/read-measurement.js`, `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/bitcode-runtime.js`, `protocol-demonstration/server.js`, `protocol-demonstration/src/canonical/evaluation-materialization.js`, `protocol-demonstration/public/app.js`, `apps/uapi/app/api/read-review/route.ts`, `apps/uapi/app/api/make-bitcode-branch/route.ts`, `apps/uapi/app/application/{ApplicationReadScenarioPanel.tsx,application-read-scenarios.ts,application-closure-state.ts,ApplicationClosureNativeSections.tsx,application-section-atlas.ts}` | `protocol-demonstration/test/v26-read-review-source-to-shares.test.js`, `apps/uapi/tests/api/{readReviewRoute.test.ts,readReviewProtocolParity.test.ts}`, `apps/uapi/tests/applicationReadScenarios.test.ts`, branch-artifact required-path checks, proof-witness digest coverage, and `apps/uapi/tests/applicationClosureState.test.ts` / `apps/uapi/tests/applicationSectionAtlas.test.ts` |
| Operator guidance and explainer adjacency | the Bitcode Terminal exposes protocol-demonstration-style explainers adjacent to the fields and actions that matter, especially around read/write posture, repository anchoring, read/deposit controls, readiness, deposit provenance, and closure follow-through | inline and card-level explainers carry Bitcode-only semantics plus `Current source` and `Current canon` references so the operator can validate usage, provenance, and parity reality without leaving the active control | `apps/uapi/components/base/bitcode/execution/BitcodeInlineExplainer.tsx`, `apps/uapi/app/application/{application-workspace-explainers.ts,ApplicationExperienceFrame.tsx,ApplicationCommandDeck.tsx,ApplicationRepositoryContextPanel.tsx,ApplicationSupplySelectionPanel.tsx,ApplicationReadScenarioPanel.tsx,ApplicationDepositComposer.tsx,ApplicationClosureControlDeck.tsx}`, `protocol-demonstration/public/app.js` | explainer-reference tests, focused browser/usability verification, and proof-surface coverage for field/action adjacency |
| Conversations as Bitcode rich input | conversations are a first-class fullscreen and popup-capable Bitcode write surface with attachments, execution intent, destinations, and persisted reread | conversation routes no longer stop at mock-only or local-only state; first write, reread, destination roundtrip, and branched attachment continuity behave as one system | `apps/uapi/app/conversations/*`, `packages/api/src/conversations/*`, `packages/api/src/routes/conversations.ts`, `packages/conversations-generics/*` | conversations continuity proof family, route tests, and persisted overlay/readback checks |
| Auxillaries transactional readiness | `Profile`, `Connects`, `Interfaces`, and `$BTD` remain the real readiness carriers for wallet, repository, provider, and transactional posture | readiness state is not ornamental; it gates or informs transacting and settling behavior through shared state, active product controls carry repository-provider precision into the write route boundary, `/api/auxillaries/data` rereads repository scope with explicit `repositoryInventorySource` and `repositoryConnectionStatus`, and that same reread surface now carries `walletConnectionStatus` so `Connects` and `$BTD` distinguish saved verified signer posture from live wallet-provider signing access rather than teaching soft connection-only copy | `apps/uapi/app/auxillaries/*`, relevant `apps/uapi/app/api/auxillaries/*`, wallet/repository/VCS integration carriers | readiness proof and route/browser validation on the live auxillary pane owners |
| Repository anchor and VCS scope | repository anchoring is explicit, Bitcode-owned, and admitted through `Connects` / `/application` / API surfaces | repository context no longer depends on stale provider-caller drift; Bitcode read/write flows share one repository scope model, `/api/vcs/[provider]/repositories`, `/api/auxillaries/data`, and auxillary repository-share reads prefer stored connected-provider inventory before live fallback, disclose `inventorySource` or `repositoryInventorySource`, keep repository-supply inventory readable in `/application` even when the live provider session is reconnect-required, and route admission rejects both anchors outside the connected provider inventory and settlement-bearing requests whose saved provider attachment no longer validates against the live provider session | `packages/vcs/*`, `packages/github/*`, `packages/api/src/vcs/*`, `apps/uapi/app/api/{vcs,auxillaries}/*`, repository context application panels | repository-boundary compile health plus repository-anchor behavior proof |
| Wallet and signed transaction posture | fifth-gate interfaces explicitly teach the distinction between Profile-owned wallet identity, saved verified signer posture, live verified wallet-provider signing access, and signed transaction intent for Bitcode activity | manual wallet identity can enable drafting and reread, but signed settlement remains staged until live verified wallet-provider signing is present; saved verified signer posture by itself is not enough, so transaction readiness, route admission, `Connects`, and `$BTD` must surface `wallet reconnect required` when the saved signer survives but the live wallet-provider session does not | wallet/auth/profile carriers, `$BTD` pane owners, auxillary reread contracts, transaction readiness state readers/writers | readiness proof plus explicit route/interface acceptance coverage |
| Bitcode agentic execution | `ad hoc` remains the admitted live pipeline for conversation-driven agency, and future Bitcode pipelines are specified as Bitcode-owned actions/activity rather than deliverable/upgrades carry-over | retained pipeline implementations are reference-only unless explicitly repurposed; primitives survive, stale orchestration does not; multi-agent pipeline selection is removed rather than carried forward; computer-use is available only through the internal Read-measurement registry flag and is absent from implementation, validation, Finish/Delivering, and Terminal action controls | `packages/pipelines/*`, `packages/agent-generics/*`, `packages/tools-generics/*`, `packages/execution-generics/*`, `packages/generic-agents/*` where retained | runs/pipelines totality proof family, system-reform admissibility proof, active-product naming witnesses, and active-source compile/admissibility coverage |
| Execution-core primitive boundary | execution primitives, registries, prompts, sequence/state/sub-execution carriers, and provider abstractions remain the reusable Bitcode substrate, while retained orchestration families are taught as reference-only until explicitly repurposed | package headers, metadata, promptparts, and retained execution comments must not present SDIVS/PTRR/meta-phase deliverable families as the current Bitcode product implementation or preserve non-Bitcode platform narration in the live execution stack, and live execution/pipeline prompt classes must bind directly to prompt primitives rather than route through the retained raw-promptpart barrel | `packages/{execution-generics,agent-generics,pipelines-generics,pipelines/asset-pack,prompts,executions-mcp}/*` | active-source compile health plus package/spec/proof admissibility witnesses showing a clean primitive/reference split |
| Asset-pack/share synthesis | share candidates, proofs, history, AssetPack synthesis artifacts, stored AssetPack evidence, and connected-interface Shippables are represented as Bitcode outputs rather than generic outputs in operator teaching | retained execution substrate can still be reused, but output meaning is canonicalized to Bitcode shares, AssetPacks, synthesis artifacts, stored evidence, Shippables, destination mechanisms, and activity; old output nouns survive only as storage/proof trace boundaries | `/application` detail/read surfaces, retained execution and AssetPack evidence carriers, spec/proof families | proof surface coverage tying retained execution outputs to Bitcode share semantics |
| Settlement and follow-through | settlement posture, branch artifacts, proof state, quantized source-to-shares fit qualities, and closure metrics remain in the same Bitcode-owned reread model | closure-bearing writes persist meaningful follow-through instead of thin execution notes; selected detail can reconstruct saved settlement state; the native closure map shows the present-fit-for-settlement-review objective contract, source-to-shares ref, fit-quality hash, receipt refs, and fit-quality rows; receipts carry the same quantized fit-quality objective shown at present-fit-for-settlement-review time | `application-activity-history`, `application-transaction-detail-snapshot`, `application-closure-state`, closure/detail cards, retained execution-history rows, `protocol-demonstration/src/canonical/settlement.js`, `protocol-demonstration/public/app.js` | closure-follow-through persistence proof, reread tests, `apps/uapi/tests/applicationClosureState.test.ts`, `apps/uapi/tests/applicationTransactionDetail.test.ts`, and `v26-read-review-source-to-shares` receipt/proof coverage |
| API and third-party interface parity | active APIs, admitted `Bitcode MCP`, and third-party app surfaces are not parallel products; they are admitted interfaces over the same Bitcode Exchange state model that the Bitcode Terminal uses | API carriers are synchronized with terminal writes/reads and preserve Bitcode-only semantics; third-party MCPs plus repository/provider connections and attachments are admitted as ingress/input context, the Bitcode Exchange-facing MCP surface normalizes outputs toward asset-pack/share meaning, and the ChatGPT App surface fails closed on unconfirmed connected-interface writes while emitting write-admission receipts instead of owning Exchange state | `apps/uapi/app/api/*`, `packages/api/src/routes/*`, MCP/app integration carriers, ChatGPT-style surfaces, `packages/chatgptapp/src/{tools,server}.ts` | conversations continuity, application composition, runs/pipelines totality, ChatGPT App write-admission tests, and endpoint verification coverage |
| Retained-system Bitcode purification | fifth-gate is not closed while retained systems still survive as parallel live product logic; anything kept must already be cut, isolated, or Bitcode-purposed enough to fit the Bitcode-native baseline | retained web-search, webhook, generic-agent, generic-tool, and orchestration carriers no longer silently define or backdoor the live Bitcode product model even if some reference owners remain for later refinement; multi-agent is a cut execution concept, while use-computer is a bounded internal Read-measurement support primitive with broader capability deferred beyond V26 | retained packages/routes admitted by V26, especially search/webhook/agent/tool/pipeline carriers | system reform admissibility proof plus explicit kept/cut/isolated classification on the live path |
| Persistence/schema convergence | schema, ORM, migrations, Supabase carriers, and generated types form one coherent Bitcode storage interpretation | active persistence carriers cannot preserve null-key drift, stale naming, or separate demo/app meanings on the same records | `supabase/*`, `packages/supabase/*`, `packages/orm/*`, retained storage-facing route carriers | persistence and schema totality proof family plus filtered compile health on active storage corridors |
| Prompt-system explicitness | prompts, prompt parts, prompt execution, and retained prompt ports remain explicit infrastructure, not silent string debt | prompt space must be Bitcode-owned and compile/admissible even where old prompt reservoirs survive as references, and those retained reservoirs must stay off the live execution primitive path unless explicitly repurposed; retained PTRR agents on the active corridor must provide explicit Registry-backed `prompt` / `stepPrompts` carriers rather than relying on description strings alone | `packages/prompts/*`, prompt carriers in executions/agents/conversations/AssetPack corridors, `packages/pipelines/asset-pack/src/agents/{design/iterate-product-md-agent,digest/capture-learnings-agent,validation/asset-pack-ready-to-instruct-agent}.ts` | prompt-system totality, prompt-space completeness, and active `uapi` typecheck proofs |
| Active-source health | the active fifth-gate claim is invalid if the live Bitcode corridor still fails compile or runtime checks in admitted systems | targeted compile/runtime seams across application, conversations, executions, VCS, ORM, prompts, and retained package callers are brought to stable health | active `uapi` program, retained package corridors admitted by V26 | compile-health witness rows in parity/proof surfaces and required route/test checks |
| Environment/debug/proof closure | environment posture is explicit inside the application and proof generation is part of the gate, not a post-hoc narrative | debug controls, environment-mode truth, and required proof families are generated without unresolved blockers | debug widget, environment toggles, proof-generation scripts, `.bitcode/*` artifacts | environment-mode coherence plus fifth-gate proof-family generation |

### Fifth-gate commercial infrastructure and production architecture

Fifth-gate is also the point where V26 stops being describable as a route and UI convergence project alone.
To support the minimum-functional Bitcode Exchange and Bitcode Terminal claim, the repository must already describe and operate as a commercial product architecture with explicit product, infrastructure, persistence, execution, observability, and proof layers.

The production architecture is therefore fixed as the following joined system:

| Production layer | Required fifth-gate role | Active source basis / owning families | Required fifth-gate closure property |
| --- | --- | --- | --- |
| Product routes and operator surfaces | `/application`, `/conversations`, `/auxillaries`, `/(root)`, `/docs`, `/executions`, and admitted compatibility deep links are the only user-facing route owners of the Bitcode product model | `apps/uapi/app/application/*`, `apps/uapi/app/conversations/*`, `apps/uapi/app/auxillaries/*`, `apps/uapi/app/(root)/*`, `apps/uapi/app/docs/*`, `apps/uapi/app/executions/*` | no live route may teach a parallel product center or bypass Bitcode-owned semantics |
| App-owned protocol and ingress routes | the application owns HTTP and SSE admission into Bitcode Exchange state, including activity, state, deposits, Read review, branches, conversations, auxillaries, VCS, external-realization, executor, webhook, storage, and telemetry intake routes | `apps/uapi/app/api/{activity,state,deposits,read-review,make-bitcode-branch,conversations,auxillaries,vcs,v24,webhook,edgetimes,client-error,executions}/*` plus `packages/api/src/routes/*` | routes must be server-owned admission carriers, not thin client-only illusions, and must fail closed when readiness, policy, repository scope, or accepted Read-review admission is absent |
| Identity, readiness, and transactional admission | wallet identity, verified wallet-provider signing, repository anchoring, auth session posture, provider bindings, and `$BTD`/profile state compose one transactional admission model | `packages/{auth,btd,github,vcs}/*`, `apps/uapi/app/application/{bitcode-transaction-readiness,bitcode-transaction-route-readiness}.ts`, `apps/uapi/app/auxillaries/*`, related app/API auth routes | drafting, reread, and signed settlement must remain explicitly distinct, and settlement-bearing routes must not bypass server-owned `canSettle` checks |
| Persistence and state coherence | PostgreSQL/Supabase storage, ORM/query carriers, generated database types, storage-facing API routes, and execution/history rows form one Bitcode storage interpretation | `supabase/*`, `packages/{supabase,orm}/*`, `/edgetimes`, retained storage-facing route owners | Bitcode Exchange state may not split into route-local, shell-local, and persistence-local meanings on the same records |
| Execution, conversation, and prompt substrate | conversations, `ad hoc` execution, execution primitives, prompt parts, prompt execution, attachments, templates, tool calling, and pipeline compatibility carriers remain explicit infrastructure for Bitcode activity | `packages/{conversations-generics,execution-generics,executions-mcp,pipelines,pipelines-generics,prompts,agent-generics,attachments-generics,templates-generics,tools-generics,llm-generics,streams}/*` | primitives may survive, but retained orchestration reservoirs must not silently define the live product model, prompt-bearing inference carriers must compose through the public `@bitcode/prompts` boundary, and the Bitcode MCP corridor must remain auditable |
| External realization and settlement runtime | bitcoin, sidechain, repeated-read, compute, GitHub realization, storage publication, and settlement observation remain explicit production architecture rather than invisible demo substrate | `protocol-demonstration/src/canonical/{v23-bitcoin.js,v23-bitcoin-demonstration-service.js,v24-external-realization.js,v24-external-execution.js,v24-live-execution.js,v24-local-executors.js,v24-remote-adapters.js,settlement.js}`, `packages/github/*` | external realization, execution observation, and settlement proof must remain fail-closed even while ownership refits from demo-local reservoirs toward packages and app routes |
| Observability, error intake, and runtime health | runtime failures, telemetry, repository-health, logger, and operator-visible diagnostics remain part of the production contract rather than incidental engineering residue | `apps/uapi/app/api/client-error/route.ts`, `packages/{observability,logger,repository-health,testing}/*`, retained telemetry carriers in `protocol-demonstration` | the live Bitcode path must accept, classify, and audit errors and health posture without reverting to non-Bitcode diagnostics or silent client failures |
| Proof, generated evidence, and promotion control | generated proof families, spec-family reports, canonical-input reports, `_PROVEN_`, and promotion scripts are first-class production architecture because Bitcode requires a provable static codebase and deployed financial system | `.bitcode/*`, `BITCODE_SPEC_V26_PROVEN.md`, `scripts/{check-bitcode-canonical-inputs.mjs,check-bitcode-spec-family.mjs,generate-bitcode-proven.mjs}`, proof generators under `protocol-demonstration/src/canonical/*` | fifth-gate is invalid if the product architecture is not described, generated, and replayable as one witness-bearing system |

The production architecture above is constrained by the following fifth-gate rules:
- no write-bearing interface may rely on client-only readiness judgment when the server can determine readiness from auth, wallet, provider, and repository state;
- `/api/read-review` is the app-owned pre-fit admission boundary for measured Reads: `GET` presents the reviewable source-to-shares Read plus the Exchange `readFittingReview` contract before fitting, `POST` records accept/reject/remeasure-with-feedback decisions and updates that Read-fitting review state, and `/api/make-bitcode-branch` must fail closed when an explicit non-accept decision blocks fit search;
- dual SPEC-IMPL parity is required where low-level protocol behavior is already defined in `protocol-demonstration` but commercially exercised through `uapi` routes: at least one focused route-boundary test must prove the commercial repository preserves the protocol contract instead of shadowing it with route-local approximation before the behavior can count toward fifth-gate closure;
- repository anchor, wallet verification, and provider bindings must be legible at the product layer, enforced at the route layer, and explainable at the spec/proof layer using the same Bitcode semantics; for route admission that means the request-carried repository provider and repository anchor must resolve against stored connected-provider repository inventory when present, or a live connected-provider inventory read when persistence has not been synced yet;
- admitted `Bitcode MCP` write carriers must reject pipeline creation before queueing or reserving `BTD` whenever `pipelines.create` permission is absent or the repository/provider ingress is not coherently anchored by a matching repository connection or authenticated provider binding; accepted writes must return and queue an explicit write-admission receipt carrying `pipelines.create`, ingress basis, repository provider, repository anchor, input counts, and `asset_packs` output meaning;
- GitHub webhook carriers are ingress-only automation boundaries: labels and `@bitcode-*` comments may schedule an asset-pack pipeline, but successful telemetry must name `Trigger Asset-Pack Pipeline`, carry `github_webhook` ingress basis, `asset_packs` output meaning, and `ingress_only_automation_boundary` Exchange role; the active trigger command is `bitcode-asset-pack-trigger`;
- admitted ChatGPT App write carriers must reject GitHub, AWS, and Vercel connected-interface writes unless the tool payload carries `confirmed: true`; accepted writes must return a write-admission receipt with `explicit_user_confirmation`, `chatgpt_app`, source-to-shares scope, connected-interface target anchor, and delivery-mechanism output meaning rather than treating the ChatGPT App as an Exchange state owner; package-local proof must cover both schema-level confirmation requirements across every ChatGPT App write carrier and target-bound GitHub repository delivery receipts, not merely Vercel/AWS examples;
- admitted `Bitcode MCP` runtime registration for fifth-gate is the narrowed Exchange-facing tool set (`pipeline`, `analysis`, `intelligence`, `enterprise`, `lsp`, `observability`); `field-intelligence` is removed from Bitcode and documented only under `_legacy/field-intelligence`, while `monitoring`, `orchestration`, and Jira-specific tool carriers remain non-admitted/reference-only until they are rebuilt against the active package/runtime contracts;
- admitted commercial-infrastructure packages must also hold honest package-local typecheck boundaries; `executions-mcp` may traverse retained corridors like `vcs`, `notion`, `supabase`, and deliverable-tool wrappers, but those dependencies must resolve without Next-only runtime leakage, stale deep-import seams, or missing workspace dependencies;
- persistence/schema convergence requires explicit Bitcode ORM ownership for execution-storage tables that used to sit in the unresolved schema backlog: AssetPack vectors, phase execution, queued run jobs, on-the-fly instructions, stream logs, generated assets, activity events, error logs, and token costs must be represented by source-backed ORM model owners, public declaration surfaces, package-local tests, and generated proof rather than only appearing in Supabase migrations or generated database types;
- retained LSP infrastructure is admitted as static Read/AssetPack measurement evidence, not as a generic code-navigation product; `bitcode.lsp.measure-read-static.v26` is the canonical V26 role that feeds `ReadDescriptor.staticMeasurements`, measurement provenance, `.bitcode/measurement-receipts.json`, candidate ranking, AssetPack fit, and proof replay, and `protocol-demonstration/V26_LSP_MEASUREMENT_REFORM.md` fixes this repurposing rule for fifth-gate;
- `PromptPart`, `Prompt`, `PromptExecution`, and shared formatters are public Bitcode prompt infrastructure; active and admitted-support inference packages may consume them through the public `@bitcode/prompts` boundary and its stable narrow subpaths, may import raw prompt content through the explicit `@bitcode/prompts/raw_promptparts/*` subpath, but may not reach into `packages/prompts/src/*` internals or replace prompt-owned behavior with route-local ad hoc strings, and the active/support/reference prompt consumer map must stay explicit package-by-package rather than implicit in search results alone; reference-only prompt consumers and their test/build configs must also prefer the narrow public subpaths for `Prompt` and `PromptPart` so they do not silently couple themselves to the full root prompt barrel or preserve broad `@bitcode/prompts/* -> packages/prompts/src/*` catchalls when prompt execution ownership is not actually needed; admitted AssetPack prompt ports plus prompt-primitive support carriers in `tools-generics`, `llm-generics`, and `time` must likewise keep `Prompt`, `PromptPart`, and `PromptFormatter` on `@bitcode/prompts/{prompt,parts/PromptPart,formatters}` whenever they are not actually using the full root prompt barrel; execution-aware prompt carriers and broader active execution-bearing runtime carriers that only read prompt hierarchy, execution ancestry, or the base execution tree must likewise prefer `@bitcode/execution-generics/Execution` and `@bitcode/execution-generics/prompts/ExecutionPrompt` rather than a broad execution barrel when executor/combinator exports are not actually needed; prompt-bearing runtime carriers and adjacent execution/phase/diagnostic carriers that only read the base execution tree must stay loadable without transitively pulling storage, artifact, or logging reservoirs through a full execution barrel; the support primitives that those carriers rely on, including `@bitcode/execution-generics/{Execution,prompts/ExecutionPrompt}`, `@bitcode/registry`, `@bitcode/doc-comment/{base-plugin,types}`, `@bitcode/doc-code`, and `@bitcode/tools-generics`, must expose honest source-backed public package subpaths and direct dependency declarations rather than relying on repo-relative cross-package imports; the base `doc-comment` abstraction and `doc-code` tool-injection path may remain admitted support/compatibility infrastructure for build-time attachment of tool prompt descriptions into Bitcode agentic runs, while `generic-doc-comment-plugins`, `doc-comment` examples, and prompt-package developing experiments remain bounded under `protocol-demonstration/V26_DOC_COMMENT_REFORM.md`;
- the `packages/pipelines/asset-pack/*` corridor is the live AssetPack package owner and must carry semantic `definitionOfRead` / `read` / canonical `writtenAssetType = read-satisfaction-asset-pack` / `writtenAssetRequest` / `deliveryMechanismTemplate` / asset-pack snapshots at execution-store and postprocess boundaries so later-gate reform does not have to recover protocol meaning from old naming;
- package-owned AssetPack primitives must name current Bitcode concepts directly: written-asset type ownership is `AssetPackWrittenAssetType.ReadSatisfactionAssetPack`, not a live `DeliverableType` export or a four-label PR/review/issue/comment taxonomy, and discovery support searches prior run evidence through `searchRelevantAssetPackEvidence` with Bitcode-owned environment flags while any `deliverableType` or vector-RPC naming remains compatibility payload/storage detail only;
- the `packages/pipelines/asset-pack/*` corridor must resolve implementation and validation behavior from `read` plus the one canonical AssetPack written-asset kind, while `writtenAssetRequest` and `deliveryMechanismTemplate` remain bounded request/delivery hints only; in V26 the live meaning of that corridor is a Bitcode agentic pipeline run that satisfies a read, synthesizes AssetPack synthesis artifacts during Implementation, stores AssetPack evidence in Exchange-readable form during Finish, executes canonical `Finish` as the broad final phase, and uses `Delivering` only for GitHub pull-request Shippables layered on top of those stored AssetPack results; canonical implementation and validation registry keys must therefore use `implementation:asset-pack-synthesize-artifacts-agent` and `validation:validate-asset-pack-synthesis-artifacts`, with `writtenAssets` retained only as a semantic reread of AssetPack synthesis artifacts; `assetPackSynthesisArtifacts` must propagate as the primary structured artifact read surface through AssetPack completion, postprocess output, completion metadata, execution-history normalization, active streamed completion payloads, and Terminal stream parsing before any `writtenAssets` reread is used; `SDIVF` is the canonical phased implementation (`Setup -> [Discovery -> Implementation -> Validation]* -> Finish`) and the live AssetPack phase registry must not register `shipping:*` keys, type-keyed implementation agents, type-keyed validation agents, or a `shippingPhase` owner; read routes, workspace-run summaries, mock reread projections, and active UI detail surfaces should therefore prefer `assetPackSynthesisArtifacts` for Bitcode-owned summary/file-change/proof-evidence meaning, then semantic `writtenAssets`, then primary `shippables` and `deliveryMechanism`; `deliverableType` and `deliverables` must not remain active payload fields or fallback branches, and PR review, issue, comment, Jira, upload, or destination-specific branches are V27+ design-space rather than V26 behavior; active setup/prompt module paths should likewise prefer canonical `comprehend-read` carriers, and discovery outputs should mirror semantic `writtenAssets` / `readSatisfactionCriteria`, because V26 is shaping the protocol together with the commercial infrastructure into the first full-repository-as-proven-products Bitcode canon rather than leaving commercial surfaces as semantically secondary wrappers;
- AssetPack Finish/Delivering filesystem ownership must live under `agents/finish/*`, `agents/prompts/finalize-delivery-evidence-prompt.ts`, and `finish-delivery-agents.ts`; canonical Finish registry keys are `finish:*`, AssetPack-named delivery agents use `finish:asset-pack-*`, and old broad-phase shipping names are no longer accepted as active phase ownership, exported symbol ownership, prompt factory ownership, or tool-registry ownership;
- admitted `Bitcode MCP` workflow/development prompts and the `bitcode://pipelines/asset-pack/create` compatibility tool description must teach the live operation as a Bitcode asset-pack pipeline over source-to-shares needs, with compatibility URI/subtype names called out explicitly; package-local tests and generated source-content proof must render these prompt/tool surfaces and reject old output-pipeline wording as active MCP canon;
- operator-facing execution headers and the active AssetPack route/API surface must teach this corridor as asset-pack synthesis plus Finish-delivered Shippables; `/api/deliverables` is removed from active V26 source rather than retained as a compatibility mount;
- client-side execution hooks that submit AssetPack runs must describe the live behavior as Bitcode asset-pack pipeline submission, submit canonical `definitionOfRead` input naming, and keep tracked TypeScript source as the only active runtime owner;
- active streamed completion payloads and client-side stream parsing must preserve primary semantic `assetPackSynthesisArtifacts`, semantic `writtenAssets`, primary `shippables`, `deliveryMechanism`, `read`, `writtenAssetType`, and `assetPack` fields; `actions` may remain only as a command-result envelope and must not recreate a `deliverables` mirror;
- active route persistence must store preprocess snapshots and completion metadata under semantic `assetPackWrittenAsset` / `read` / `assetPack` / `writtenAssetType` aliases, so the commercial infrastructure itself shapes the protocol meaning at route entry and persistence time rather than only at final reread;
- telemetry, notifications, and email-subject copy must use AssetPack and Shippable event/template identifiers such as `asset_pack_*`; compatibility identifiers such as `deliverable_*` are not V26-active wrappers, and failure telemetry must keep AssetPack completion context available across success and catch paths so mid-run failures still emit Bitcode asset-pack metadata instead of losing source-to-shares context to route-local scoping;
- email-template filenames and identifiers must be AssetPack-native. Promptpart identifiers must also become AssetPack-native once a semantic mirror exists; compatibility-only `deliverable` PromptPart owners are removal targets, not V26 behavior;
- raw promptparts and promptpart-generation scripts for this corridor should likewise describe discovery/implementation/validation/finish in asset-pack-run, read-satisfaction, written-asset, Shippable, and delivery-mechanism terms. Phase-purpose raw PromptParts are already current AssetPack owners and therefore use `phase_assetpack{setup,discovery,implementation,validation,finish}` filesystem/export names rather than phase-level non-Bitcode names; pipeline-level raw PromptParts with semantic mirrors use `pipeline_assetpackrun_*` filesystem/export names, so `pipeline_deliverable_*` is a removed trace family rather than an active bounded identifier; discovery raw PromptParts with semantic mirrors use `agent_assetpackdiscovery{understandrequirements,analyzeparallel,assesscomplexity,planimplementation,comprehendattachments,selectfilesparallel}_*` filesystem/export names, so corresponding `agent_deliverablediscovery{analyze,analyzeparallel,assesscomplexity,planimplementation,understandrequirements,comprehendattachments,selectfilesparallel}` and `agent_deliverablesdiscimplplan_*` families are removed after their text is recut to Read requirements, repository evidence, proof evidence, complexity, Finish readiness, attachment evidence, written-asset synthesis, and AssetPack scope; old deliverable-type classifier PromptPart families are likewise removed once the canonical V26 owners are present (`writtenAssetType = read-satisfaction-asset-pack` and `deliveryMechanismTemplate = pull-request`); validation Ready-to-Finish prompt ownership is the single `assetpackvalidationreadytofinish_*` family, so pre-validation `readytofinish_*` and type-keyed code-change / code-change-review / design-document Ready-to-Finish raw families are removed rather than retained as compatibility aliases; implementation, validation, codebase-analysis, and system-level raw reservoirs are also removed once `assetpacksynthesizeartifacts`, AssetPack discovery, `assetpackvalidationreadytofinish`, and `asset_pack_system_*` owners exist, including `agent_deliverable{impl,implementation,validation}*`, `agent_deliverablesdiscoverycodebaseanalysis_*`, and `deliverables_system_*`; non-PR Finish delivery PromptPart reservoirs (`assetpackfinishsubmitreviewdelivery`, `assetpackfinishcreateissuedelivery`, and `assetpackfinishaddissuecommentdelivery`) are not V26-active because PR delivery is the only specified Finish delivery mechanism before later-version delivery-mechanism expansion; this includes deeper setup-comprehension, finish-finalization, Shippable-delivery evidence, implementation-divider, create-code-change, PR-packaging, and create-pull-request promptparts, which must no longer teach PR-first, deployment-ceremony-first, or pre-Bitcode semantics where Bitcode now requires read-first asset-pack synthesis plus delivery mechanisms; active setup prompt module paths must use `comprehend-read` carriers, `COMPREHENDREAD` base PromptPart constants, and AssetPack-native PromptPart names as they are recut, and former `deliverablesetup*` setup PromptPart families are no longer admitted after equivalent AssetPack-native setup, codebase, attachment, and repository owners exist;
- generic tool prompt reservoirs must follow the same semantic-mirror rule before promotion or broader reuse: `packages/generic-tools/read-comprehension` is the canonical Bitcode generic-tool package boundary for Read-comprehension support, its tools must be individually defined (`AnalyzeReadSemanticsTool`, `ExtractReadRequirementsTool`, `IdentifyReadConstraintsTool`, `GenerateReadSatisfactionCriteriaTool`, `ValidateReadComprehensionTool`, and `AnalyzeReadSatisfactionImplementationComplexityTool`) and only collected by `ReadComprehensionToolset`, noncanonical tool/prompt/primitive/schema/raw-PromptPart owners must be removed after read-first owners exist, and its `DocCodeToolPrompt` metadata, raw PromptParts, docs, and primitives must teach Bitcode Read comprehension, written-asset expectations, AssetPack context, delivery-mechanism boundaries, source-to-shares service questions, commercial accountability evidence, proof/verification needs, and TypeScript-only source discipline rather than task-first, cognitive, transcendent, or experimental non-Bitcode semantics;
- generic agent and web-search prompt reservoirs must follow the same semantic-mirror rule before promotion or broader reuse: `packages/generic-agents/read-comprehension` is admitted as the setup/pre-danger-wall PTRR agent that registers and composes the individual Read-comprehension tools before risk admission, `packages/generic-agents/web-researcher` is admitted only as discovery-phase web research for Bitcode read synthesis, `packages/generic-agents/web-search` plus `packages/generic-tools/web-search` are admitted only as lower-level source-attributed web-search/content-retrieval support for that discovery-phase read-synthesis corridor, and `packages/generic-agents/danger-wall` is admitted only as Bitcode read/AssetPack risk admission for unsafe mutation, private-data exposure, proof/evidence gaps, likely pipeline failure, AssetPack scope fit, delivery-mechanism fit, and manual-review triggers; none of these corridors may teach old scraping, generic security, content-safety, monitoring-product, canonical-read, proof, mutation, delivery, or live product ownership semantics;
- all prompt, tool, agentic, pipeline, MCP, and execution-bearing systems must satisfy the V26 inference specification in `protocol-demonstration/V26_INFERENCE_SYSTEMS.md`: each active or admitted-support corridor must state its canonical read, prompt surface, tool contract, agentic role, execution carrier, asset-pack effect, boundary posture, and verification evidence before it can be treated as live Bitcode behavior; this includes an implementation-record posture for prompt primitives, tool prompt infrastructure, agent infrastructure, pipeline infrastructure, conversation inference, asset-pack synthesis compatibility, read-comprehension reform, and MCP/external ingress so no prompt or tool behavior is accepted only because old code happens to exist;
- prompt reservoir and AssetPack package-local build configs are part of the proof boundary: they must declare direct workspace dependencies, verify source-backed exact prompt/tool subpaths without emitting generated artifacts into `src/`, and avoid declaration-file path aliases or broad prompt-source catchalls that hide stale prompt ownership;
- curated prompt-package root exports must name Bitcode-native prompt owners directly; repository-setup additions expose `PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_*` and must not retain `PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_DELIVERABLES_*` aliases after AssetPack mirrors exist;
- the `packages/pipelines/asset-pack/*` corridor must hydrate a registry-bearing pipeline runtime at entry even when admitted callers still enter through a bare `Execution`, so phase/agent/prompt/tool proof does not depend on implicit `PipelineExecution` caller assumptions;
- the `packages/pipelines/asset-pack/*` corridor must also hold an honest package-local typecheck boundary through the agent, MCP, VCS, prompt, and search support it still traverses, so fifth-gate no longer relies on runtime proof alone while the asset-pack written-asset corridor hides missing dependency links or loose cross-package typing; design/digest/validation PTRR agents that remain on this corridor must use local Bitcode `Prompt` / `PromptPart` composition with concrete plan/try/refine/retry Prompt registries, preserving compatibility registry IDs only as identifiers rather than as underspecified behavior;
- broad retained-system reform in V26 must follow the generic strategy fixed in `protocol-demonstration/V26_REFORM_STRATEGY.md`: classify the corridor first, add semantic mirrors before destructive rename, harden public package boundaries before wider consumer rollout, and add focused proof witnesses for each kept, repurposed, or cut corridor;
- former-name trace flags and compatibility aliases are acceptable fifth-gate tactics only when they prevent breakage while precise Bitcode names land; they are not closure evidence, and full V26 closure requires filesystem names, code names, prompt labels, doc-comments, comments, and specifications to remove former/compatibility-only/unspecified broad labels in favor of exact Bitcode objects and responsibilities;
- the admitted direct-product `uapi` corridor must also hold an honest local typecheck boundary across `/application`, `/conversations`, `/auxillaries`, `/(root)`, `/docs`, `/executions`, shared auth/UI primitives, and product visualization/effects carriers, so fifth-gate closure is not blocked by wrapper drift or stale public-shell compatibility seams;
- admitted APIs, MCPs, and third-party app surfaces are Bitcode Exchange interfaces, not sibling products, so they inherit the same readiness, persistence, proof, and disclosure boundaries;
- retained infrastructure packages may remain where they genuinely accelerate V26, but their role must be named as direct-product, support, ingress, compatibility, reference-only, or cut-target rather than left implicit;
- and observability, testing, proof generation, and generated appendix refresh are not optional afterthoughts because Bitcode’s commercial claim depends on provable runtime and deployment posture.

### Fifth-gate closure work packages

The exhaustive acceptance matrix is executed through the following work packages.
These are the complete planning units for fifth-gate.

1. `Bitcode Terminal read closure`
   - close activity-ledger search/filter/pagination/selection/detail stability
   - prove selected-detail persistence and projected-live fallback
   - prove authenticated `/api/activity` and `/api/executions/history{,/[:runId]}` reread against persisted execution rows, notifications, Finish `assetPackCompletion` payloads, repo snapshots, processing stats, and execution events rather than relying on mock-mode or unauthenticated fallback alone
2. `Bitcode Terminal write closure`
   - close deposit/read/fit/deposit/branch/closure write-through
   - prove immediate reread into the same ledger
3. `Conversation and ad hoc execution closure`
   - close rich-input, attachment, destination, persisted conversation, and `ad hoc` execution continuity
   - prove conversation-started executions carry normalized `rich_input` evidence for source attachments, output destinations, asset-pack references, and read-measurement intent
   - specify Bitcode-native future pipeline replacement while keeping retained implementations reference-only
4. `Transactional readiness closure`
   - close wallet, repository, provider, and signed-transaction readiness across `Profile`, `Connects`, `Interfaces`, and `$BTD`
   - prove that readiness is operative rather than decorative
5. `Repository and persistence closure`
   - close VCS/provider, ORM/schema, migration, and storage seams on the active Bitcode path
   - prove one coherent Bitcode state model
6. `Retained-system reform baseline and retained-package admissibility closure`
   - close prompt-system explicitness by requiring live inference packages to compose through `PromptPart`, `Prompt`, `PromptExecution`, and the public `@bitcode/prompts` boundary rather than private package reach-through
   - close the execution primitive/reference boundary so reusable execution infrastructure is kept and retained pipeline families are contained as references unless Bitcode explicitly repurposes them
   - close the broad retained-system reform baseline so retained search, webhook, agent, tool, and orchestration carriers are already cut, isolated, or Bitcode-repurposed on the live path
   - classify every active `packages/**/package.json` owner by generated package census as direct product, commercial infrastructure, ingress/support, compatibility, or reference-only, with no unclassified fallback package allowed for fifth-gate proof parity
7. `Proof and environment closure`
   - generate required fifth-gate proof families
   - close environment/debug mode coherence and remove unresolved blockers from the proof path

### Fifth-gate implementation ordering rule

The implementation order for fifth-gate is strict:
1. stabilize the Bitcode Terminal read/write loop,
2. stabilize conversations and `ad hoc` execution as the live agentic write surface,
3. stabilize transactional readiness and repository scope,
4. stabilize persistence/schema and active-source health,
5. stabilize the retained-system reform baseline and retained-package admissibility on the live path,
6. generate fifth-gate proofs and environment-mode closure,
7. and only then claim minimum-functional closure.

Later-gate polish, commercialization, and `mainnet` posture are not allowed to be used as substitutes for any row in the matrix above.

### Fifth-gate proof families required for Bitcode rename completion and system completeness

| Proof family | Required artifact path | Closure obligation | Current source basis |
| --- | --- | --- | --- |
| second-gate application composition | `.bitcode/application-composition-proof.json` | prove that `/application` is route-local application composition while preserving first-gate Bitcode semantics | `apps/uapi/app/application/*`, `protocol-demonstration/public/app.js` |
| conversations continuity | `.bitcode/conversations-continuity-proof.json` | prove that conversations and the chat-based interface remain first-class and correctly port into V26 Bitcode system semantics, including persisted rich-input execution evidence for source attachments, output destinations, asset-pack references, and Read-measurement intent | `apps/uapi/app/conversations/components/*`, `packages/api/src/routes/conversations.ts`, `packages/api/src/conversations/*`, `packages/conversations-generics/*` |
| runs and pipelines totality | `.bitcode/runs-pipelines-totality-proof.json` | prove that retained run/pipeline systems totalize Bitcode operations coherently, including Shippable/AssetPack meaning, Bitcode MCP write admission, third-party MCP ingress as input context, and the compatibility selectors still required to keep retained execution reads healthy without reintroducing active deliverables routes | `apps/uapi/app/executions/*`, `apps/uapi/app/api/vcs/route.ts`, active `apps/uapi/app/api/templates/shippables/route.ts`, `apps/uapi/app/api/auxillaries/template-preferences/route.ts`, `packages/api/src/routes/shippables.ts`, absence witnesses for removed `/api/templates/deliverables` and `packages/api/src/routes/deliverables.ts`, `packages/executions-mcp/src/mcp-server/src/{types/index.ts,tools/pipeline-tools.ts,pipeline-execution/adapter.ts,__tests__/unit/pipeline-ingress-contract.test.ts}`, `packages/pipelines/*`, `packages/execution-generics/*` |
| persistence and schema totality | `.bitcode/persistence-schema-totality-proof.json` | prove that PostgreSQL/Supabase persistence, `/edgetimes`, migrations, schema contracts, ORM/query carriers, and generated types form one coherent Bitcode storage system | `supabase/*`, `supabase/migrations/001_v26_production.sql`, `packages/supabase/src/*`, `packages/orm/src/models/*`, `packages/orm/src/queries/*`, `packages/orm/src/types/database.generated.ts`, `packages/orm/src/types/database.ts`, `packages/orm/scripts/generate-db-types.ts`, retained storage-facing API carriers, and generated database types |
| prompt system totality | `.bitcode/prompt-system-totality-proof.json` | prove that retained `PromptPart`/`Prompt`/`PromptExecution` carriers and non-Bitcode prompt ports remain explicit Bitcode-owned prompt infrastructure, that active inference packages consume those carriers through the public `@bitcode/prompts` boundary, and that the active/support/reference prompt consumer map remains explicit before later prompt-space completeness closure | `packages/prompts/src/*`, `packages/execution-generics/src/prompts/*`, `packages/agent-generics/src/prompts/*`, `packages/conversations-generics/src/prompts/*`, `protocol-demonstration/V26_PROMPT_SURFACES.md`, retained Jira prompt ports, and retained deliverable planning/measurement prompts |
| inference implementation records | `.bitcode/inference-implementation-records-proof.json` | prove that prompt, tool, agentic, execution, pipeline, conversation, asset-pack, read-comprehension, and MCP/external ingress systems are represented by structurally checked source-visible V26 inference implementation records with canonical read, nested implementation fields, source-backed implementation owners, boundary posture, typed verification evidence, and executable/generated verification footing | `protocol-demonstration/src/canonical/inference-implementation-records.js`, `protocol-demonstration/test/v26-inference-implementation-records.test.js`, and `protocol-demonstration/V26_INFERENCE_SYSTEMS.md` |
| fourth-gate reclosure review | `.bitcode/fourth-gate-reclosure-review-proof.json` | prove that the procedurally reopened fourth-gate claim has been re-reviewed against every material acceptance criterion, that earlier through-fourth-gate closure claims remain recorded as overstated, and that no blocking fourth-gate deviance remains before fifth-gate work resumes | generated proof-family evidence across application composition, conversations, runs/pipelines, persistence/schema, prompt-system, inference records, retained packages, and the V26 checkpoint |
| source-to-shares fifth-gate proof | `.bitcode/source-to-shares-fifth-gate-proof.json` | prove the fifth-gate make-shares/use-shares baseline around reviewable Reads, accepted-fit admission, app-owned route-level reread, Terminal selected-detail persistence, quantized source-to-shares fit qualities, settlement AssetPack receipts, private-file redaction in buyer state projection, and dual protocol/commercial SPEC-IMPL parity without itself claiming fourth-gate or fifth-gate procedural closure | `protocol-demonstration/src/canonical/{read-measurement,settlement,run-artifacts}.js`, `protocol-demonstration/test/v26-read-review-source-to-shares.test.js`, `apps/uapi/app/api/{read-review,state,make-bitcode-branch}/route.ts`, `apps/uapi/tests/api/readReviewProtocolParity.test.ts`, `apps/uapi/app/application/{application-closure-state,application-transaction-detail-snapshot}.ts`, `apps/uapi/tests/{applicationClosureState,applicationTransactionDetailSnapshot}.test.ts`, and pipeline Finish/Delivering reform carriers |
| fifth-gate closure deepening proof | `.bitcode/fifth-gate-closure-deepening-proof.json` | prove that fifth-gate closure evidence has deepened after fourth-gate promoted closure across Terminal read/write, conversations/execution continuity, repository scope, persistence/schema, retained-system reform, and proof/environment axes | source-to-shares proof, application composition, conversations, runs/pipelines, persistence/schema, prompt-system, inference-record, prompt-space baseline, retained-package, system-reform, and environment-mode proof families |
| fifth-gate closure proof | `.bitcode/fifth-gate-closure-proof.json` | prove that every fifth-gate closure queue row has source-level checks, generated proof artifacts, executable tests, and specification text aligned for minimum-functional Bitcode closure without claiming launch or total V26 completion | source-to-shares proof, fifth-gate closure deepening proof, product readiness audit, application composition, conversations, runs/pipelines, persistence/schema, environment-mode, retained-package, system-reform, and active naming proof carriers |
| sixth-gate MVP closure proof | `.bitcode/sixth-gate-mvp-closure-proof.json` | prove that fifth-gate acceptance holds and the post-fifth-gate product map, activity/transactions operator loop, conversations/ChatGPT-style interface, auxillaries readiness, admitted API/MCP/app interface parity, and MVP-quality architecture are source-checked and product-ready as the prerequisite proof for the separately generated seventh- and eighth-gate proof families | product readiness audit, application composition, source-to-shares proof, conversations continuity, runs/pipelines totality, persistence/schema, environment-mode, retained-package, system-reform, `apps/uapi/app/application/application-experience-architecture.ts`, and MVP source/test carriers |
| seventh-gate commercial testnet launch proof | `.bitcode/seventh-gate-commercial-testnet-launch-proof.json` | prove that fifth- and sixth-gate acceptance hold and that the product is refined into an initial commercially viable, testnet-first launch posture across Exchange, Terminal, Protocol, Proofs, API, MCP, admitted app surfaces, wallet/BTC/`$BTD`, repository scope, proof/state reread, operator flows, and no non-Bitcode compatibility fallback for core journeys | product readiness audit, sixth-gate MVP proof, application composition, source-to-shares proof, conversations continuity, runs/pipelines totality, persistence/schema, environment-mode, retained-package, system-reform, `apps/uapi/app/application/application-commercial-launch-readiness.ts`, and commercial launch source/test carriers |
| prompt space completeness | `.bitcode/prompt-space-completeness-proof.json` | close the eighth-gate prompt-space verdict over prompt primitives, active carriers, doc-code injection, asset-pack/read-comprehension compatibility, raw PromptPart runtime carry-through, app/MCP ingress, proof/spec tests, and final completeness dimensions | `packages/prompts/src/*`, `packages/{execution-generics,pipelines-generics,agent-generics,conversations-generics,tools-generics,doc-comment,doc-code}/*`, `packages/pipelines/asset-pack/*`, `packages/generic-tools/read-comprehension/*`, `packages/executions-mcp/*`, `apps/uapi/prompts/conversations-system-prompt.ts`, `protocol-demonstration/V26_{PROMPT_SURFACES,INFERENCE_SYSTEMS}.md`, and prompt proof tests |
| retained package admissibility | `.bitcode/retained-package-admissibility-proof.json` | prove that each kept non-Bitcode package has an explicit V26 role, primary role class, write boundary, proof obligation, justification, required source witness set, and retained port scope where applicable, while active-cut corridors such as field-intelligence remain outside live Bitcode source | retained `packages/*` admitted by V26 |
| environment mode coherence | `.bitcode/environment-mode-coherence-proof.json` | prove debug/environment controls and production/staging/development mode behavior are coherent and refresh safely | app shell, debug controls, environment toggles, route/API posture |
| fifth-gate system reform admissibility | `.bitcode/system-reform-admissibility-proof.json` | prove that retained agentic systems are already cut, isolated, or repurposed enough to satisfy the fifth-gate Bitcode-native baseline rather than surviving as unexamined parallel product logic | retained web-search, webhooks, generic agent/tool ports, executions-adjacent agentic packages, and other retained infrastructure still admitted after fourth-gate |
| whole-repository production satisfaction | `.bitcode/whole-repository-production-satisfaction-proof.json` | close the eighth-gate whole-repository production verdict across retained V26 routes, packages, components, proofs, docs, generated artifacts, connected interfaces, and reform evidence | all retained V26 routes, packages, components, proofs, docs, and generated artifacts |
| v26 total closure | `.bitcode/v26-total-closure-proof.json` | close the final eighth-gate definition-of-done so V26 promotion no longer depends on interpretive notes | all promoted V26 systems and generated artifacts |

### Fifth-gate formal acceptance rule

Fifth-gate is closed only when:
1. second-gate acceptance holds,
2. third-gate acceptance holds,
3. fourth-gate acceptance holds,
4. fifth-gate proof families are generated with explicit closure verdicts,
5. environment controls and environment-mode completeness are proven rather than assumed,
6. retained package admissibility is explicit,
7. the kept system is described totalistically enough that Bitcode-era and Bitcode-first-gate reservoirs no longer require informal interpretation to fit together,
8. unreplaced `engi` product naming is retired from active code, copy, and route teaching unless it remains as explicit historical lineage or a still-required structural namespace,
9. newly admitted application, API, MCP, prompt, interface, and retained package surfaces are proven to the same proof-bearing standard expected of the former top-level Bitcode demo core rather than being tolerated as lighter glue, with PARITY closure requiring specification text, generated proof artifacts, source-level proof checks, and executable tests where the surface carries make-share or use-share behavior,
10. backward-compatibility carriers are cut or clearly isolated as temporary fifth-gate retirement work rather than silently teaching the merged-world product model,
11. the minimum-functional north star is satisfied: the repository can make shares and use shares through Bitcode-owned interfaces, route-level reread, and state,
12. the Bitcode Terminal plus admitted API/MCP/app interfaces are coherently reading from and writing to the same protocol-owned system, including app-owned state reread after accepted source-to-shares branch materialization,
13. active product semantics teach Bitcode and only Bitcode rather than a generic developer-platform or agentic-platform identity,
14. retained systems are already cut, isolated, or Bitcode-repurposed enough that the live path reads as a new-world Bitcode product rather than a renamed compatibility stack,
15. and fifth-gate closure is not being falsely claimed by importing sixth-/seventh-/eighth-gate polish or post-V26 mainnet work into the acceptance boundary.

The current generated fifth-gate evidence includes an explicit closure verdict in `.bitcode/fifth-gate-closure-proof.json`.
Fifth gate is accepted at the minimum-functional Bitcode baseline.

### Sixth-gate formal acceptance rule

Sixth-gate is closed only when:
1. fifth-gate acceptance holds,
2. the Bitcode Exchange, Bitcode Terminal, Bitcode Protocol, proof families, and admitted API/MCP/app surfaces are stable enough to be called a minimal viable product rather than only a minimum-functional baseline,
3. the post-fifth-gate Bitcode application map is explicit and implemented as:
   - `activity`: the dominant master-detail transaction activity surface with searchable, filterable, live-updating tables and activity detail
   - `transactions`: the write-space for making transactions and executing deposit/read/system operations
   - `conversations`: the rich ChatGPT-style read/write Bitcode interface, popup-capable and fullscreen-capable, with tool registration kept aligned to the ChatGPT app surface
   - `auxillaries`: non-duplicative settings, preferences, connections, identity, and deep wallet/`$BTD` surfaces around the network core
4. the dominant read, write, readiness, proof, and interface paths are stable enough to support real repeated operator use on testnet,
5. admitted interface surfaces are no longer merely aligned in principle but demonstrably behave like one product,
6. quality, reliability, and operator usability are high enough that Bitcode can be presented as a minimal viable product rather than a canonical bring-up baseline,
7. and the repository-level architecture remains cleaner after MVP elevation, not broader or more compatibility-heavy.

The current generated sixth-gate evidence includes an explicit closure verdict in `.bitcode/sixth-gate-mvp-closure-proof.json`.
Sixth gate is accepted at the minimal viable product baseline.

### Seventh-gate formal acceptance rule

Seventh-gate is closed only when:
1. fifth-gate acceptance holds,
2. sixth-gate acceptance holds,
3. Bitcode is refined into an initial commercially-viable live-launch posture while remaining testnet-first,
4. the Exchange, Terminal, Protocol, Proofs, API, MCP, and admitted app surfaces are commercially legible and operationally credible together,
5. launch-critical readiness around wallet, settlement, repository scope, proof/state reread, and operator flows is refined beyond bare MVP sufficiency,
6. and the kept repository is ready for an initial commercial testnet launch without falling back to non-Bitcode compatibility explanations for core user journeys.

The current generated seventh-gate evidence includes an explicit closure verdict in `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`.
Seventh gate is accepted at the initial commercially viable testnet launch baseline and is a prerequisite for the generated eighth-gate closure verdicts.

### Eighth-gate formal acceptance rule

V26 is fully proven only when:
1. fifth-gate acceptance holds,
2. sixth-gate acceptance holds,
3. seventh-gate acceptance holds,
4. whole-repository production satisfaction is generated with an explicit closure verdict,
5. prompt space completeness and total repository closure proofs are generated with explicit closure verdicts,
6. the kept repository is application-ready Bitcode canon without legacy product naming or silent compatibility ownership,
7. and V26 total closure is explicit enough that promotion no longer depends on interpretive notes.

The current generated eighth-gate evidence includes explicit closure verdicts in `.bitcode/prompt-space-completeness-proof.json`, `.bitcode/whole-repository-production-satisfaction-proof.json`, and `.bitcode/v26-total-closure-proof.json`.
Eighth gate is accepted as whole-repository Bitcode provation and final V26 closure.

## Canonical Bitcode executive summary

The heading name remains a historical carrier required by the specifying contract.
The subject of V26 is Bitcode.

In V26, Bitcode remains:
1. a proof-bearing operating system for repo supply, measured read, fit, verification, selection, materialization, disclosure, settlement, and proof closure,
2. a system that already has rename closure from V25 and must preserve Bitcode and BTD posture during further reorganization,
3. a system that already has external-realization, proof, settlement, disclosure, and fail-closed semantics in source,
4. a system whose current operator story is useful but whose current ownership and presentation are transitional,
5. a system that must move from demonstration-owned and marketing-embedded posture to application-native posture,
6. a system that must keep repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence/stored AssetPack evidence plus Shippables, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, and generated artifacts and canonical promotion all explicitly in scope,
7. and a system that must now be legible as a real application rather than as an adjacent demonstration.

## source-of-truth hierarchy

Current truth order for the active V26 canon is:
1. `BITCODE_SPEC.txt`
2. `BITCODE_SPEC_V26.md`
3. `BITCODE_SPEC_V26_DELTA.md`
4. `BITCODE_SPEC_V26_PARITY_MATRIX.md`
5. `BITCODE_SPEC_V26_NOTES.md`
6. `BITCODE_SPEC_V26_PROVEN.md`
7. active canonical `.bitcode/v19-*`, `.bitcode/v20-*`, and `.bitcode/v26-*` artifacts
8. current source and tests explicitly referenced by active V26 canon
9. historical prior specs

V26 is therefore the active canonical runtime truth after fourth-, fifth-, sixth-, seventh-, and eighth-gate closure, with later-version reopening reserved for deliberately specified V27+ work.

## full-system, re-implementation, and audit rule

The promoted V26 main specification must be sufficient for:
- full-system re-implementation of current Bitcode behavior and the intended V26 ownership changes,
- audit recovery of the current proof contract, artifact model, and application/operator posture,
- and operator comprehension of the whole Bitcode chain without semantic dependence on prior versions.

That requirement applies to:
- repo supply and depositing,
- reading and measured demand,
- prompt/inference/evaluator ownership,
- deposit-to-read fit,
- recall and ranking,
- verification decisions,
- selection and materialization,
- branch artifacts and assetPackEvidence (stored AssetPack evidence), and Shippables,
- identity, authority, signing, and policy,
- sensitive data and confidentiality flows,
- projection, disclosure, and redaction,
- proof families, members, theorems, witnesses, and replay,
- settlement, source-to-shares, journals, and exact accounting,
- telemetry, persistence, state, and failure semantics,
- host/runtime capability truth,
- operator experience and pedagogy,
- validation and test stack,
- generated artifacts and canonical promotion,
- bitcoin mainchain execution,
- sidechain execution,
- repeated-read payment execution,
- compute-container execution,
- storage-container execution,
- GitHub live interface,
- auth and wallet connection,
- application-route integration,
- package extraction and repository ownership,
- marketing/product-surface routing,
- and full-canon specification completeness.

Neither `_PROVEN_`, parity, source, demo code, app code, packages, nor earlier specs are allowed to carry missing current-system meaning for promoted V26.

## totality and precision enforcement rule

V26 requires totality and precision rather than suggestive prose.

That means:
- every realized or target-realized external effect maps to named artifacts,
- every proof family maps to named witnessArtifactPaths, theoremIds, and replayStepIds,
- every route and ownership migration states whether it is current source truth, implemented prerequisite, or draft target,
- every generated artifact expectation maps to a regeneration and validation contract,
- every fail-closed condition is named,
- every acceptance boundary is explicit,
- and no part of the V26 reorganization is allowed to hide behind "integration" without naming the actual owner that will carry the behavior.

When V26 says "current source basis," it means current V25-era repo truth.
When V26 says "draft target owner," it means intended V26 ownership that is not yet promoted.
When V26 says "implemented prerequisite," it means existing source already supplies some of the behavior V26 intends to reorganize rather than invent.

## system goals, non-goals, and design principles

### Goals

1. Move the Bitcode operator experience from demonstration-owned posture to a first-class application page.
2. Remove homepage embedded-demo dependence and replace it with navigate-to product routing.
3. Preserve the current Bitcode operator UX chain while replacing the demonstration UI implementation with application-facing components.
4. Reassign Bitcode system ownership from demo-local concentration into package-owned and app-owned surfaces.
5. Converge GitHub, auth, and API production responsibilities onto the existing package/application architecture where those owners already fit.
6. Harden bitcoin, sidechain, repeated-read, compute, storage, telemetry, reconciliation, and auth/wallet interfaces to live-operation-ready posture.
7. Restore stronger repository-level architectural coherence so the repo again matches the fuller package-first pattern it already advertises.
8. Keep Bitcode and BTD rename closure stable while the system is reorganized.
9. Keep proof-bearing, fail-closed, exact-accounting, and disclosure-bounded semantics intact through the reorganization.
10. Produce a full-canon V26 specification family that can stand alone for re-implementation, audit, and promotion.
11. Keep the second-gate application atmosphere visually aligned with the retained pre-Bitcode design system even while the product naming and system identity are entirely Bitcode.
12. Add a debug-owned environment control surface before promotion so environment posture can be toggled and reviewed explicitly inside the application.
13. Make `/application` the only primary Bitcode destination while conversations and orbitals operate as fullscreen application overlays.
14. Port the strongest executions plus AssetPack/Shippable master-detail patterns into `/application` rather than preserving peer product destinations.
15. Maximize precise reuse of the active retained package/app code where those owners fit the Bitcode V26 total system.

### Non-goals

1. Re-opening the Bitcode or BTD rename as the center of the version.
2. Redesigning Bitcode economics or denomination behavior.
3. Treating the current demo UI shell as the long-term owner of the Bitcode application surface.
4. Treating a route move alone as sufficient V26 closure without ownership and hardening work.
5. Treating historical `_legacy/` code as active truth.

### Design principles

- Preserve the operator UX chain while replacing the operator UI owner.
- Prefer package-first ownership and explicit app composition over demo-local concentration.
- Keep `/application` as the single primary Bitcode destination and treat overlay/workspace systems as application-mounted modes.
- Pull the strongest existing execution, AssetPack/Shippable, conversation, and auxillary patterns inward rather than duplicating them.
- Reuse existing packages when the current owner already fits.
- Keep application routing and product posture explicit rather than iframe-dependent.
- Keep every external effect auditable and fail closed.
- Keep disclosure and proof boundaries intact while the app surface becomes more natural.
- Keep compatibility carriers stable unless V26 changes them explicitly.
- Do not derive current truth from `_legacy/`; forward-porting, when later reopened, must normalize into current owners.

## V26 productionizing workstreams

The four V26 workstreams are:

1. demonstration-to-application integration
2. marketing and application-facing UI refurbishment
3. interface and subsystem hardening
4. organizational refurbishment

Those workstreams are coordinated, not alternative options.
V26 is incomplete if any one of them is omitted from the promoted version center.

## system architecture and layer boundaries

V26 productionizing hardening is organized into ten interacting layers:

1. `core deterministic primitives and canonical vocabulary`
2. `package-owned Bitcode operating surfaces`
3. `package-owned artifacts, proof, projection, settlement, and external-realization layers`
4. `API composition and route-owned application orchestration`
5. `application-facing UI composition and operator route surfaces`
6. `marketing and navigation surfaces that lead into the application`
7. `identity, authorization, wallet, signing, and policy`
8. `bitcoin, sidechain, repeated-read, compute, storage, and GitHub live interfaces`
9. `telemetry, reconciliation, runtime posture, and generated evidence`
10. `promotion, validation, and canonical file-family governance`

The current source-bearing split across these layers is still imperfect:
- the former top-level demo owner still spans many of them at once,
- `apps/uapi/` carries marketing and app composition,
- `packages/*` already owns some production-grade responsibilities,
- and V26 exists to make those boundaries explicit rather than accidental.

The cross-cutting constraints over every layer are:
- Bitcode/BTD rename invariance,
- application-native operator posture,
- package-first ownership,
- proof-bearing auditable execution,
- fail-closed behavior,
- and generated-artifact plus promotion completeness.

## canonical domain model

The V26 canonical domain model includes the following object and surface classes:

- repo supply and depositing: authenticated repositories, deposits, deposit profiles, deposit envelopes, repo bindings, and GitHub installation context.
- reading and measured demand: read scenarios, benchmark/parser-derived demand, licensed query surfaces, and measured demand envelopes.
- prompt/inference/evaluator ownership: prompt families, prompt contracts, prompt surfaces, inference moments, parsed completion envelopes, evaluator manifests, and prompt lineage.
- deposit-to-read fit: fit explanations, candidate match scores, exclusion reasons, ranked candidates, and eligibility boundaries.
- recall and ranking: retrieval candidates, ranking receipts, use-tier signals, and candidate ordering stability.
- verification decisions: issuance, provenance, sufficiency, and issuer-policy decisions plus supporting receipts.
- selection and materialization: asset-pack locks, selected-source manifests, materialization proofs, branch artifact outputs, and application-visible operator artifacts.
- branch artifacts and assetPackEvidence/stored AssetPack evidence plus Shippables: `.bitcode/` outputs, witness manifests, generated reports, route-facing views, stored AssetPack evidence, and PR publication receipts.
- identity, authority, signing, and policy: identity bindings, authorization decisions, wallet connection, signer or treasury policy, GitHub App binding, and external execution policy.
- sensitive data and confidentiality flows: sensitive-data flow maps, disclosure classifications, retention policies, and publication controls.
- projection, disclosure, and redaction: principal-scoped views over public, reviewer, buyer, and internal surfaces.
- proof families, members, theorems, witnesses, and replay: proof object models, replay steps, artifact bindings, witness inventories, and theorem closure.
- settlement, source-to-shares, journals, and exact accounting: BTD-denominated allocation, settlement participation, accounting precision, journal diff, and settlement proof.
- telemetry, persistence, state, and failure semantics: telemetry summaries, execution manifests, route state, external execution state, retries, rollbacks, and reconciliation state.
- host/runtime capability truth: application posture, package posture, runtime posture, external capability truth, and mode-specific credentials.
- operator experience and pedagogy: product routing, full-page operator surfaces, proof/settlement inspection, and application-facing explanations.
- validation and test stack: local checks, strict spec conformance, package tests, API tests, application tests, and promotion regeneration.
- generated artifacts and canonical promotion: generated reports, `_PROVEN_` appendix, canonical input reports, parity ledgers, and promotion rules.

## whole Bitcode operator chain

The whole Bitcode operator chain in V26 is:
1. configure the active V26/V27 posture and route class,
2. bind the correct environment-mode identities and resources,
3. authenticate repo supply and candidate deposits,
4. measure read,
5. establish prompt/inference/evaluator ownership,
6. compute deposit-to-read fit,
7. execute recall and ranking,
8. issue verification decisions,
9. materialize the selected asset pack,
10. build branch artifacts, stored AssetPack evidence, and PR Shippables,
11. enforce identity, authority, signing, and policy,
12. enforce sensitive data and confidentiality flows,
13. project the result per principal,
14. settle source-to-shares and journals in BTD,
15. derive proof-family, witness, and replay closure,
16. execute Bitcoin mainchain, repeated-read, or sidechain interfaces when required,
17. execute compute-container and storage-container interfaces when required,
18. execute GitHub live interfaces when required,
19. expose the operator experience through the application-native Bitcode page rather than a demo-local shell,
20. reconcile telemetry, persistence, state, and failure semantics,
21. validate, regenerate, and decide canonical promotion.

The workflow stages remain:
- Openly writable,
- Measurably readable,
- Provable,
- Valuable.

## canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: repo supply and depositing are represented by authenticated repository bindings, deposit envelopes, `.bitcode/depositing-surface.json`, `.bitcode/github-boundary.json`, `.bitcode/github-live-session.json`, `.bitcode/github-inventory-fetch-receipt.json`, and `.bitcode/asset-pack.lock.json`.
- Current algorithms and derivation rules: Bitcode admits repo-addressable deposits, normalizes deposit identity against repo-authenticated supply, and carries deposit lineage forward into fit, verification, materialization, proof, and GitHub live mutation surfaces. V26 adds the requirement that the primary operator route consume those surfaces through package-owned and app-owned composition rather than directly through demo-local owners.
- Current invariants and fail-closed conditions: invalid deposit, stale repo addressing, missing GitHub inventory receipt, broken deposit lineage, or route-layer presentation that obscures deposit provenance fail closed.
- Current proof obligations: deposit provenance, asset identity stability, repo-authenticated supply closure, and deposit-to-asset-pack continuity must be replayable.
- Current source-bearing implementation basis: `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/run-artifacts.js`, `protocol-demonstration/src/canonical/surfaces.js`, `protocol-demonstration/src/canonical/v24-external-realization.js`, `protocol-demonstration/server.js`, and `packages/github`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/core.test.js`, `node --test protocol-demonstration/test/api.test.js`, and the V26 parity rows for application-native routing and package extraction.
- Current accepted boundaries: external GitHub execution remains deployment-configured and policy-bound; V26 accepts deposit supply only through emitted session, fetch, branch, and mutation receipts and does not treat `_legacy/` as active deposit truth.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: reading and prompt/inference/evaluator ownership are represented by `.bitcode/reading-surface.json`, `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/inference-moment-contracts.json`, `.bitcode/parsed-completion-envelopes.json`, and `.bitcode/eval-manifest.json`.
- Current algorithms and derivation rules: Bitcode measures read from benchmark, parser, and repo reality, maps prompts and inference moments to that read, and binds evaluator ownership to replayable contracts. V26 preserves those semantics while moving ownership toward package-backed canon and app/API composition.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, evaluator ambiguity, read drift, or route/UI layers that detach prompt lineage from read lineage fail closed.
- Current proof obligations: prompt family completeness, inference synthesis closure, and evaluator provenance must stay witness-bound and replayable.
- Current source-bearing implementation basis: `protocol-demonstration/src/canonical/prompting.js`, `protocol-demonstration/src/canonical/evaluation-materialization.js`, `protocol-demonstration/src/canonical/read-measurement.js`, `protocol-demonstration/src/bitcode-demo.js`, and the future draft target packages recorded in the V26 extraction matrix.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/core.test.js`, proof-family coverage inside the active test suite, and `node scripts/check-bitcode-spec-family.mjs --version V26`.
- Current accepted boundaries: third-party model execution counts only when it remains receipted, policy-bound, replayable, and normalized back into Bitcode artifacts regardless of whether the final owner is a package or an app/API surface.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: fit, recall, ranking, and verification are represented by `.bitcode/deposit-to-read-surface.json`, `.bitcode/match-report.json`, `.bitcode/verification-report.json`, `.bitcode/verification-receipts.json`, and `.bitcode/verification-decisions-proof.json`.
- Current algorithms and derivation rules: Bitcode computes deposit-to-read fit before deeper proof closure, then performs recall and ranking, and only then resolves verification decisions and use-tiering. V26 preserves that ordering and requires the app-native surface to present it without depending on demo-owned UI.
- Current invariants and fail-closed conditions: no-survivor asset pack, ranking inconsistency, verification decision drift, non-replayable verification receipts, or UI-layer loss of verification provenance fail closed.
- Current proof obligations: fit continuity, verification issuance/provenance/sufficiency closure, and ranked-candidate determinism must remain auditable.
- Current source-bearing implementation basis: `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/evaluation-materialization.js`, `protocol-demonstration/src/canonical/proof-materialization.js`, and `protocol-demonstration/src/canonical/surfaces.js`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/core.test.js`, `node --test protocol-demonstration/test/workflow.integration.test.js`, and proof-family closure under `Verification-decisions`.
- Current accepted boundaries: external ranking or inference services remain acceptable only when receipted and recovered into Bitcode artifacts through the current proof and execution contracts.

### Selection and materialization

- Current canonical objects and emitted artifacts: selection and materialization are represented by `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json`, `.bitcode/materialization-exclusions.json`, and `.bitcode/selection-and-materialization-proof.json`.
- Current algorithms and derivation rules: Bitcode materializes only selected assets, preserves exclusion reasons, binds materialized artifacts to bundle, branch, and proof identities, and in V26 must expose those outcomes through application-facing components rather than the demo-local UI shell.
- Current invariants and fail-closed conditions: materialization without selection closure, hidden exclusions, non-replayable selected-source lineage, or route/application drift from materialized truth fail closed.
- Current proof obligations: selected-set closure, materialized-source closure, visibility closure, and exclusion closure must all be witness-bound.
- Current source-bearing implementation basis: `protocol-demonstration/src/canonical/evaluation-materialization.js`, `protocol-demonstration/src/canonical/run-artifacts.js`, `protocol-demonstration/src/canonical/proof-materialization.js`, `protocol-demonstration/public/app.js`, and the V26 draft target application route owners.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/workflow.integration.test.js`, `node --test protocol-demonstration/test/e2e.test.js`, and parity rows for app-native UI replacement and package extraction.
- Current accepted boundaries: real GitHub branch publication is a separate live interface and must not be inferred from local materialization alone even after the app surface becomes native.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: identity, authorization, and sensitive flow are represented by `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/sensitive-data-flow.json`, `.bitcode/identity-authorization-proof.json`, `.bitcode/sensitive-data-flow-proof.json`, `.bitcode/authorization-and-sensitive-flow-proof.json`, `.bitcode/github-app-binding.json`, wallet-auth carriers in `packages/auth` and `packages/api`, and execution policy surfaces.
- Current algorithms and derivation rules: Bitcode derives authorization from issuer, signer, wallet, and policy roots, binds external execution to those roots, and routes sensitive data only through classified surfaces. V26 strengthens wallet connection and production auth posture and requires that the application-native Bitcode page operate inside that auth model.
- Current invariants and fail-closed conditions: authorization denial, stale signing roots, stale wallet verification, mis-bound GitHub App identities, or sensitive-flow leakage fail closed.
- Current proof obligations: identity closure, authorization closure, policy closure, wallet verification closure, and sensitive-flow closure must remain replayable across live interfaces.
- Current source-bearing implementation basis: `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js`, `protocol-demonstration/src/canonical/v24-external-realization.js`, `protocol-demonstration/src/canonical/v24-live-execution.js`, `packages/auth`, and `packages/api/src/routes/auth.ts`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/core.test.js`, `node --test protocol-demonstration/test/api.test.js`, and V26 parity rows for wallet/auth productionization.
- Current accepted boundaries: concrete signer topology, wallet provider details, and deployment auth infrastructure remain implementation choices so long as the receipt, policy, and fail-closed contracts are satisfied.

### Disclosure and projection

- Current canonical objects and emitted artifacts: disclosure and projection are represented by `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json`, `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json`, public/reviewer/buyer/internal projection views, and storage publication and retrieval receipts.
- Current algorithms and derivation rules: Bitcode projects public, reviewer, buyer, and internal surfaces from the same underlying artifact set and preserves bounded-public proof as the only public-safe external projection. V26 additionally requires that the application-native operator surface and refurbished marketing surfaces present these boundaries clearly.
- Current invariants and fail-closed conditions: public projection overexposure, mismatched redaction, storage publication beyond principal rights, retrieval without disclosure authorization, or product-surface copy that implies broader disclosure than policy allows fail closed.
- Current proof obligations: projection policy closure, bounded-public closure, redaction alignment, disclosure verdict alignment, and storage-publication alignment must remain auditable.
- Current source-bearing implementation basis: `protocol-demonstration/src/canonical/projections.js`, `protocol-demonstration/src/demo-shell-state.js`, `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/v24-external-execution.js`, `protocol-demonstration/src/canonical/v24-live-execution.js`, and `apps/uapi/app/(root)/components/MarketingLandingPage.tsx`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/api.test.js`, `node --test protocol-demonstration/test/e2e.test.js`, and disclosure-boundary proof-family closure.
- Current accepted boundaries: public chains and public storage surfaces may only carry bounded-public receipts or bounded-public anchor material, never licensed source or private proof payloads by default, and V26 marketing must not reintroduce disclosure ambiguity.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: settlement and exact accounting are represented by `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/accounting-precision-report.json`, `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json`, `.bitcode/settlement-source-to-shares-proof.json`, repeated-read payment receipts, bitcoin-network execution receipts, and sidechain execution receipts.
- Current algorithms and derivation rules: Bitcode allocates exact BTD base units, normalizes basis points deterministically, binds payment intent and observation to bundle and settlement identities, and finalizes journals only under policy-bound execution observation. V26 preserves that accounting core while moving runtime ownership out of demo-local concentration.
- Current terminology boundary: journal `debits` and `credits` inside settlement are exact accounting-entry semantics, not product denomination; live product balances, user-facing spend, route payloads, MCP metrics, and application language must distinguish BTC fee liquidity from non-fungible `$BTD` share/read-right holdings and measured content amount.
- Current invariants and fail-closed conditions: settlement conservation drift, missing execution receipt, journal finalization without observation, stale reconciliation, or cross-mode treasury drift fail closed.
- Current proof obligations: contribution totality, normalization exactness, journal completeness, settlement theorem integrity, and payment-observation coherence must remain replayable.
- Current source-bearing implementation basis: `protocol-demonstration/src/canonical/settlement.js`, `protocol-demonstration/src/settlement-structs.js`, `protocol-demonstration/src/canonical/v23-bitcoin.js`, `protocol-demonstration/src/canonical/v24-external-execution.js`, `protocol-demonstration/src/canonical/v24-live-execution.js`, and `protocol-demonstration/src/bitcode-demo.js`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/core.test.js`, `node --test protocol-demonstration/test/workflow.integration.test.js`, and parity rows for external hardening and package extraction.
- Current accepted boundaries: V26 may keep base-layer, sidechain, and repeated-read execution behind deployment configuration, but only where execution and observation receipts exist in source and remain tied to exact accounting.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof contract, witnesses, and replay are represented by `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json`, all proof-family artifacts, `.bitcode/external-realization-proof.json`, `.bitcode/container-reality-proof.json`, `.bitcode/github-live-interface-proof.json`, `.bitcode/external-telemetry-summary.json`, and the future V26 `_PROVEN_` appendix.
- Current algorithms and derivation rules: Bitcode binds every proof family to witnessArtifactPaths, theoremIds, replayStepIds, and artifact digests, then carries them into the system proof bundle and witness manifest for replay. V26 adds the requirement that the proof contract remain coherent while ownership moves from demo-local concentration to package and app layers.
- Current invariants and fail-closed conditions: missing witness artifacts, replay-step drift, container attestation drift, GitHub observation drift, stale generated appendix truth, or proof-family omission fail closed.
- Current proof obligations: proof-family closure, theorem closure, replay closure, witness manifest coherence, and proof-contract bundle coherence must remain exact.
- Current source-bearing implementation basis: `protocol-demonstration/src/canonical/proof-materialization.js`, `protocol-demonstration/src/canonical/run-artifacts.js`, `protocol-demonstration/src/canonical/v24-live-execution.js`, `protocol-demonstration/src/bitcode-demo.js`, and `scripts/check-bitcode-spec-family.mjs`.
- Current validating commands and parity basis: `node --test protocol-demonstration/test/proven-generator.test.js`, `node --test protocol-demonstration/test/v21-specifying.test.js`, `node scripts/check-bitcode-canonical-inputs.mjs`, `node scripts/check-bitcode-spec-family.mjs --version V26`, and later strict V26 conformance.
- Current accepted boundaries: V26 may reorganize owners and add or merge families, but promotion may not narrow away family detail carriers, witness expectations, or generated appendix obligations.

## V26 second-gate package extraction matrix

First-gate has already consolidated the prior standalone owner into `protocol-demonstration` plus app-owned route surfaces.
The following matrix now records the second-gate and later ownership map for splitting that first-gate owner into more deliberate subsystem packages.
These target owners remain draft targets, not yet promoted truth.

| Current source owner | Current responsibility | Draft V26 target owner | V26 extraction expectation | Priority |
| --- | --- | --- | --- | --- |
| `protocol-demonstration/src/canon-posture.js` | active-canon and draft-target posture shaping for the current demo runtime | `packages/bitcode-canon` | move Bitcode canon posture builders and shared operator posture labels into package-owned canon utilities consumed by app and tests | P0 |
| `protocol-demonstration/src/canonical/enums.js`, `protocol-demonstration/src/canonical/types.js`, `protocol-demonstration/src/canonical/type-contracts.ts`, `protocol-demonstration/src/canonical/proof-annotations.js` | closed-case vocabulary, contracts, theorem/proof helpers | `packages/bitcode-canon` | become the package-owned canonical vocabulary and proof-contract layer for Bitcode implementations | P0 |
| `protocol-demonstration/src/canonical/surfaces.js` | depositing, reading, fit, boundary, and GitHub operating surfaces | `packages/bitcode-operating-surfaces` | become package-owned system surface builders consumed by app routes and tests | P0 |
| `protocol-demonstration/src/canonical/run-artifacts.js` | pipeline telemetry, prompt implementation, proof bundle, deliverables, scenario fixture, and coverage report builders | `packages/bitcode-artifacts` | become package-owned artifact and report emitters rather than protocol-local helpers | P0 |
| `protocol-demonstration/src/canonical/read-measurement.js` | read measurement runtime and parser/analysis closure | `packages/bitcode-needs` | become the package-owned read-derivation implementation, with `packages/tech-types` remaining the canonical technology-vocabulary and signal-normalization dependency that classifies measured technical read, supplied assets, and dependent application/API/runtime surfaces without semantic drift or ad hoc stack-string drift | P0 |
| `protocol-demonstration/src/canonical/evaluation-materialization.js` | ranking, verification, use tiers, materialization, and asset-pack selection | `packages/bitcode-materialization` | become the package-owned selection and materialization runtime | P0 |
| `protocol-demonstration/src/canonical/settlement.js`, `protocol-demonstration/src/settlement-structs.js` | source-to-shares accounting, settlement participation, journal diff, and settlement artifacts | `packages/bitcode-settlement` | become the package-owned settlement and accounting subsystem | P0 |
| `protocol-demonstration/src/canonical/projections.js`, `protocol-demonstration/src/demo-shell-state.js` | projection policy, bounded public proof, redaction/disclosure proof, and projection-safe public-state shaping | `packages/bitcode-projections` | become package-owned projection and disclosure builders consumed by the application route and API | P0 |
| `protocol-demonstration/src/canonical/proof-materialization.js` | proof witness manifest, materialization proof, visibility proof, and exclusion closure | `packages/bitcode-proof` | become the package-owned proof and materialization subsystem | P0 |
| `protocol-demonstration/src/canonical/v23-bitcoin.js`, `protocol-demonstration/src/canonical/v23-bitcoin-demonstration-service.js`, `protocol-demonstration/src/canonical/v24-external-realization.js`, `protocol-demonstration/src/canonical/v24-external-execution.js`, `protocol-demonstration/src/canonical/v24-live-execution.js`, `protocol-demonstration/src/canonical/v24-local-executors.js`, `protocol-demonstration/src/canonical/v24-remote-adapters.js` | bitcoin, sidechain, repeated-read, compute, storage, and GitHub external-realization and execution contracts | `packages/bitcode-external-realization` plus `packages/github` where GitHub provider behavior belongs | move protocol-local external-interface ownership into package-backed runtime and adapter layers; GitHub provider logic converges on `packages/github` and related app/API owners | P0 |
| `protocol-demonstration/src/realization-profile.js`, `protocol-demonstration/src/policy-release.js`, `protocol-demonstration/src/receipt-schemas.js` | realization profiles, policy release carriers, and receipt-shape helpers | `packages/bitcode-canon` and `packages/bitcode-artifacts` | split between package-owned canon/profile truth and package-owned receipt and artifact schemas | P1 |
| `protocol-demonstration/src/demo-scenario.js`, `protocol-demonstration/src/seed.js`, seeded fixture and test-support surfaces | seeded scenarios and deterministic fixture posture | `packages/bitcode-scenarios` | preserve deterministic scenario and fixture truth in package-owned test and demo-fixture surfaces | P1 |
| `protocol-demonstration/src/bitcode-demo.js` | orchestration reservoir spanning the full Bitcode operating chain | distributed across the package owners above, with composition in `packages/api` and `apps/uapi/app/*` | shrink and eventually dissolve the monolithic reservoir into package-owned domain layers plus application/API composition | P0 |
| `protocol-demonstration/server.js` | standalone demo HTTP server and API composition | `packages/api` plus `uapi` application routes | move Bitcode API composition into package and app owners; the standalone demo server stops being the primary product surface | P0 |
| `protocol-demonstration/public/index.html`, `protocol-demonstration/public/app.js`, `protocol-demonstration/public/styles.css` | demo-owned UI shell and rendering | `apps/uapi/app/*` plus `apps/uapi/components/base/*` | replace the demo UI implementation with application-facing components while preserving operator UX | P0 |
| `protocol-demonstration/test/*` | demo-local runtime, proof, quality, and external-realization validation | package-local tests plus API and app integration tests | follow the extracted ownership model and keep fail-closed validation across package, API, and app layers | P0 |

## V26 package corridor role catalog

The extraction matrix above records the planned split of the preserved Bitcode reservoir.
V26 also needs a repository-wide package corridor catalog so package admissibility, commercial infrastructure posture, and proof coverage can be read at a glance.

Every package admitted to V26 must fit one primary role:
- `direct-product`
  Bitcode product logic or operator-facing system behavior.
- `commercial-infrastructure`
  storage, auth, execution, prompt, observability, or other runtime substrate required by the live Bitcode system.
- `ingress-or-support`
  external provider or support package that may feed the live Bitcode system without owning Bitcode Exchange semantics itself.
- `compatibility`
  a bounded transition carrier preserved for admitted callers during convergence.
- `reference-only`
  retained non-Bitcode implementation or tooling kept for acceleration, historical continuity, or bounded bring-up, but not as the live product worldview.

| Package corridor | Current package families | Primary V26 role | V26 production expectation |
| --- | --- | --- | --- |
| Product and route composition | `packages/{api,auth,btd,context,models,registry,responses}` | `direct-product` | these packages must teach Bitcode Exchange, Bitcode Terminal, readiness, account, and response semantics directly rather than indirectly through preserved demo naming or non-Bitcode abstractions |
| Repository, provider, and identity boundary | `packages/{github,vcs,git,gitlab,bitbucket,browser-storage,security}` | `commercial-infrastructure` plus `ingress-or-support` where provider-specific | repository and provider posture must stay explicit, typed, fail-closed, and aligned to Bitcode repository-anchor semantics instead of generic SCM connection posture |
| Persistence, schema, and storage | `packages/{supabase,orm,aurora-postgres,postgresql,mysql,files}` | `commercial-infrastructure` | storage packages must converge on one Bitcode data contract, with only one live interpretation of auth, profile, repository, activity, and settlement records |
| Execution, conversations, prompts, and attachments | `packages/{conversations-generics,execution-generics,executions-mcp,pipelines,pipelines-generics,prompts,agent-generics,attachments-generics,templates-generics,tools-generics,llm-generics,streams}` | `commercial-infrastructure` | these packages form the admitted execution substrate for conversations, `ad hoc`, prompt ownership, tool invocation, and Bitcode MCP behavior, with retained orchestration made explicit as reference-only where not yet repurposed |
| Artifact, proof, and code-analysis support | `packages/{artifacts,digest,errors,logger,observability,parsing,registry,repository-health,testing,tech-types,time,objects-arrays}` | `commercial-infrastructure` | artifacts, diagnostics, and structural helpers must remain source-bearing and proof-compatible rather than miscellaneous utility residue |
| Product UI and route support | `packages/{styling,middleware,notifications,email,networking}` | `ingress-or-support` | support packages may improve delivery, styling, notification, or network posture, but they may not define Bitcode semantics independently of app/API/proof ownership |
| External-provider and deployment integrations | `packages/{aws,circleci,cloudflare,docker,firebase,firecrawl,google-analytics,jira,kubernetes,notion,sentry,vercel}` | `ingress-or-support` or `reference-only` depending on live path classification | provider and deployment packages are admitted only when they are explicit ingress, telemetry, or support carriers rather than parallel control planes for Bitcode product state |
| Retained generic and transformation corridors | `packages/{generic-agents,generic-doc-comment-plugins,generic-llms,generic-tools,doc-code,doc-comment,editing,figma,lsp,multimodal-utils,obfuscate-generics,procurement,refactoring,web-search}` | mostly `reference-only` with explicit `ingress-or-support` exceptions | retained generic reservoirs may accelerate V26 only if their role is named in admissibility proof and they do not silently survive as the live Bitcode product center; the explicit support exceptions currently include the base `doc-comment` parsing primitive plus `doc-code` tool prompt injection where those are required to keep tool prompt descriptions attached and consumable in Bitcode agentic runs |

The package corridor catalog must stay synchronized with:
- the fifth-gate commercial architecture matrix,
- retained-package admissibility proof,
- system reform admissibility proof,
- active package README and supplementary architecture documents,
- and the parity judgments for package-specific compile health, interface ownership, and proof coverage.

## proof-family canon

The proof-family canon in V26 retains the core Bitcode families while V26 reorganizes the owners that produce them.
The family names below are the minimum V26 full-canon carriers even before promotion.

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| inference-synthesis | `.bitcode/inference-synthesis-proof.json` | moment-contract-closure, inference-payload-closure, implementation-surface-closure, parsed-envelope-consistency | inference_synthesis.contract_closure, inference_synthesis.payload_closure, inference_synthesis.parsed_envelope_consistency | inference-synthesis.moment-contracts, inference-synthesis.payload-replay, inference-synthesis.parsed-envelope-replay | `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-implementation-surface.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/inference-synthesis-proof.json` | `protocol-demonstration/src/canonical/evaluation-materialization.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| prompt-completeness | `.bitcode/prompt-completeness-proof.json` | member-set-reconciliation, parse-admissibility, consumer-closure, provenance-truth | prompt_completeness.member_set_reconciliation, prompt_completeness.consumer_closure, prompt_completeness.provenance_truth | prompt-completeness.member-set-reconciliation, prompt-completeness.parse-admissibility, prompt-completeness.consumer-closure, prompt-completeness.provenance-truth | `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/prompt-completeness-proof.json` | `protocol-demonstration/src/canonical/prompting.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| static-code-analysis | `.bitcode/static-measurement-proof.json` | stage-domain, stage-mapping, receipt-report-proof | static_code_analysis.stage_domain_purity, static_code_analysis.stage_mapping_closure, static_code_analysis.receipt_report_proof | static-code-analysis.stage-domain, static-code-analysis.stage-mapping, static-code-analysis.receipt-report-proof | `.bitcode/code-analysis-fact-registry.json`, `.bitcode/static-heuristics-registry.json`, `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-report.json`, `.bitcode/static-measurement-proof.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| verification-decisions | `.bitcode/verification-decisions-proof.json` | issuance-closure, provenance-closure, sufficiency-closure, issuer-policy-closure | verification_decisions.issuance_closure, verification_decisions.provenance_closure, verification_decisions.sufficiency_closure, verification_decisions.issuer_policy_closure | verification-decisions.stage-mapping, verification-decisions.use-tier-consequence | `.bitcode/verification-report.json`, `.bitcode/verification-receipts.json`, `.bitcode/verification-decisions-proof.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| selection-and-materialization | `.bitcode/selection-and-materialization-proof.json` | selected-asset-closure, lock-closure, materialized-source-closure, exclusion-closure, visibility-closure | selection_and_materialization.selected_asset_closure, selection_and_materialization.lock_closure, selection_and_materialization.materialized_source_closure, selection_and_materialization.exclusion_closure, selection_and_materialization.visibility_closure | selection-and-materialization.selected-set, selection-and-materialization.visibility | `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json`, `.bitcode/materialization-exclusions.json`, `.bitcode/materialization-visibility-proof.json`, `.bitcode/selection-and-materialization-proof.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| authorization-and-sensitive-flow | `.bitcode/authorization-and-sensitive-flow-proof.json` | identity-closure, authorization-closure, sensitive-flow-closure, policy-release-closure | authorization_and_sensitive_flow.identity_closure, authorization_and_sensitive_flow.authorization_closure, authorization_and_sensitive_flow.sensitive_flow_closure, authorization_and_sensitive_flow.policy_release_closure | authorization-and-sensitive-flow.identity-bindings, authorization-and-sensitive-flow.sensitive-flow | `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/sensitive-data-flow.json`, `.bitcode/identity-authorization-proof.json`, `.bitcode/sensitive-data-flow-proof.json`, `.bitcode/authorization-and-sensitive-flow-proof.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js`, `packages/auth` |
| settlement-source-to-shares | `.bitcode/settlement-source-to-shares-proof.json` | contribution-totality, clipping-determinism, normalization-exactness, participation-totality, allocation-conservation, quantized-fit-quality-receipting, journal-completeness | settlement_source_to_shares.contribution_totality, settlement_source_to_shares.normalization_exactness, settlement_source_to_shares.allocation_conservation, settlement_source_to_shares.quantized_fit_quality_receipting, settlement_source_to_shares.journal_completeness | settlement-source-to-shares.contribution-allocation, settlement-source-to-shares.journal-theorem | `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/settlement-preview.json`, `.bitcode/accounting-precision-report.json`, `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json`, `.bitcode/settlement-source-to-shares-proof.json` | `protocol-demonstration/src/canonical/settlement.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |
| disclosure-boundary | `.bitcode/disclosure-boundary-proof.json` | projection-policy-closure, bounded-public-closure, redaction-alignment, disclosure-verdict-alignment | disclosure_boundary.projection_policy_closure, disclosure_boundary.redaction_alignment, disclosure_boundary.disclosure_verdict_alignment | disclosure-boundary.policy-bounded-public, disclosure-boundary.redaction-disclosure | `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json`, `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/proof-materialization.js`, `protocol-demonstration/src/canonical/projections.js` |
| proof-contract | `.bitcode/proof-contract.json` | contract-materialization, evidence-chain, bundle-witness, family-closure | proof_contract.contract_materialization, proof_contract.evidence_chain_closure, proof_contract.bundle_witness, proof_contract.family_closure | proof-contract.contract-materialization, proof-contract.evidence-chain, proof-contract.bundle-witness | `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json` | `protocol-demonstration/src/bitcode-demo.js`, `protocol-demonstration/src/canonical/run-artifacts.js`, `protocol-demonstration/src/canonical/proof-materialization.js` |

### Inference-synthesis

- `proofArtifactPath:` `.bitcode/inference-synthesis-proof.json`
- `members:` `moment-contract-closure`, `inference-payload-closure`, `implementation-surface-closure`, `parsed-envelope-consistency`
- `theoremIds:` `inference_synthesis.contract_closure`, `inference_synthesis.payload_closure`, `inference_synthesis.parsed_envelope_consistency`
- `replayStepIds:` `inference-synthesis.moment-contracts`, `inference-synthesis.payload-replay`, `inference-synthesis.parsed-envelope-replay`
- `witnessArtifactPaths:` `.bitcode/inference-moment-contracts.json`, `.bitcode/inference-proofs.json`, `.bitcode/prompt-implementation-surface.json`, `.bitcode/parsed-completion-envelopes.json`, `.bitcode/inference-synthesis-proof.json`
- `current member closure criteria:` all moment contracts, inference payloads, implementation surfaces, and parsed envelopes resolve to the same read and prompt lineage even when the application owner changes.
- `current member verdict shape:` per-member pass/fail verdict with witness artifact refs, replay step refs, and failure reasons.
- `current theorem-by-theorem closure reading:` each theorem closes only when the same witness set supports contract, payload, and parsed-envelope coherence.
- `current theorem-to-replay grouping:` contract lineage groups under `moment-contracts`; payload and parsed-envelope coherence group under `payload-replay` and `parsed-envelope-replay`.
- `minimum artifact/replay binding set:` the listed witnessArtifactPaths plus the three replayStepIds are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` rendered into `BITCODE_SPEC_V26_PROVEN.md` family details and exercised by core, API, and package extraction validation.
- `fail-closed conditions:` missing inference proofs, prompt implementation drift, or parsed-envelope inconsistency fail closed.

### Prompt-completeness

- `proofArtifactPath:` `.bitcode/prompt-completeness-proof.json`
- `members:` `member-set-reconciliation`, `parse-admissibility`, `consumer-closure`, `provenance-truth`
- `theoremIds:` `prompt_completeness.member_set_reconciliation`, `prompt_completeness.consumer_closure`, `prompt_completeness.provenance_truth`
- `replayStepIds:` `prompt-completeness.member-set-reconciliation`, `prompt-completeness.parse-admissibility`, `prompt-completeness.consumer-closure`, `prompt-completeness.provenance-truth`
- `witnessArtifactPaths:` `.bitcode/prompt-family-registry.json`, `.bitcode/prompt-contracts.json`, `.bitcode/prompt-surfaces.json`, `.bitcode/prompt-completeness-proof.json`
- `current member closure criteria:` every prompt family declared for the run is registered, surfaced, consumed, provenance-bound, and exposed through the application-native operator experience without semantic loss.
- `current member verdict shape:` per-member pass/fail verdict with artifact refs, replay refs, and completeness failure reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires family registry, contract, surface, and consumer closure to agree.
- `current theorem-to-replay grouping:` completeness groups across reconciliation, parse admissibility, consumer closure, and provenance truth.
- `minimum artifact/replay binding set:` the listed prompt artifacts and replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` emitted as proof and rendered into generated proof-family inventory and theorem listings.
- `fail-closed conditions:` prompt contract incompleteness, missing surface coverage, or provenance mismatch fail closed.

### Static-code-analysis

- `proofArtifactPath:` `.bitcode/static-measurement-proof.json`
- `members:` `stage-domain`, `stage-mapping`, `receipt-report-proof`
- `theoremIds:` `static_code_analysis.stage_domain_purity`, `static_code_analysis.stage_mapping_closure`, `static_code_analysis.receipt_report_proof`
- `replayStepIds:` `static-code-analysis.stage-domain`, `static-code-analysis.stage-mapping`, `static-code-analysis.receipt-report-proof`
- `witnessArtifactPaths:` `.bitcode/code-analysis-fact-registry.json`, `.bitcode/static-heuristics-registry.json`, `.bitcode/measurement-receipts.json`, `.bitcode/static-measurement-report.json`, `.bitcode/static-measurement-proof.json`
- `current member closure criteria:` static facts, heuristics, receipts, and reports must reconcile to the same extracted code analysis domain regardless of whether the owner is still demo-local or has moved to packages.
- `current member verdict shape:` per-member pass/fail verdict with receipt refs, report refs, and failure reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires domain purity, stage mapping coherence, and report proof coherence.
- `current theorem-to-replay grouping:` stage purity groups under `stage-domain`; mapping and report closure group under `stage-mapping` and `receipt-report-proof`.
- `minimum artifact/replay binding set:` measurement receipts, analysis registries, report, and proof are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` surfaced in proof-family reports and exercised by core tests and specification quality checks.
- `fail-closed conditions:` measurement receipt absence or report and replay mismatch fail closed.

### Verification-decisions

- `proofArtifactPath:` `.bitcode/verification-decisions-proof.json`
- `members:` `issuance-closure`, `provenance-closure`, `sufficiency-closure`, `issuer-policy-closure`
- `theoremIds:` `verification_decisions.issuance_closure`, `verification_decisions.provenance_closure`, `verification_decisions.sufficiency_closure`, `verification_decisions.issuer_policy_closure`
- `replayStepIds:` `verification-decisions.stage-mapping`, `verification-decisions.use-tier-consequence`
- `witnessArtifactPaths:` `.bitcode/verification-report.json`, `.bitcode/verification-receipts.json`, `.bitcode/verification-decisions-proof.json`
- `current member closure criteria:` verification report, receipts, and issued decision families must reconcile to the same selected candidates and use-tier outcomes across package, API, and application layers.
- `current member verdict shape:` per-member pass/fail verdict with receipt refs and theorem refs.
- `current theorem-by-theorem closure reading:` issuance, provenance, sufficiency, and issuer-policy all require coherent receipt-backed verification results.
- `current theorem-to-replay grouping:` stage mapping and use-tier consequence replay cover all verification theorems.
- `minimum artifact/replay binding set:` verification report, verification receipts, proof artifact, and both replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` rendered into the generated proof appendix and exercised by workflow tests and app-route integration checks.
- `fail-closed conditions:` missing verification receipts or contradictory decisions fail closed.

### Selection-and-materialization

- `proofArtifactPath:` `.bitcode/selection-and-materialization-proof.json`
- `members:` `selected-asset-closure`, `lock-closure`, `materialized-source-closure`, `exclusion-closure`, `visibility-closure`
- `theoremIds:` `selection_and_materialization.selected_asset_closure`, `selection_and_materialization.lock_closure`, `selection_and_materialization.materialized_source_closure`, `selection_and_materialization.exclusion_closure`, `selection_and_materialization.visibility_closure`
- `replayStepIds:` `selection-and-materialization.selected-set`, `selection-and-materialization.visibility`
- `witnessArtifactPaths:` `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/selection-consistency-proof.json`, `.bitcode/materialization-proof.json`, `.bitcode/materialization-exclusions.json`, `.bitcode/materialization-visibility-proof.json`, `.bitcode/selection-and-materialization-proof.json`
- `current member closure criteria:` selected assets, locked pack, materialized sources, exclusions, and visibility summaries must all agree and remain faithfully exposed through the application-native operator route.
- `current member verdict shape:` per-member pass/fail verdict with witness refs and selection consistency reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires both selected-set and visibility replay to agree with materialized outputs.
- `current theorem-to-replay grouping:` selection theorems group under `selected-set`; visibility and exclusion theorems group under `visibility`.
- `minimum artifact/replay binding set:` lock, selected-source manifest, materialization proof, exclusions, visibility proof, and replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` generated proof appendix, branch artifact inventory, and end-to-end Bitcode route expectations.
- `fail-closed conditions:` materialization without selected-set closure or unexplained exclusions fail closed.

### Authorization-and-sensitive-flow

- `proofArtifactPath:` `.bitcode/authorization-and-sensitive-flow-proof.json`
- `members:` `identity-closure`, `authorization-closure`, `sensitive-flow-closure`, `policy-release-closure`
- `theoremIds:` `authorization_and_sensitive_flow.identity_closure`, `authorization_and_sensitive_flow.authorization_closure`, `authorization_and_sensitive_flow.sensitive_flow_closure`, `authorization_and_sensitive_flow.policy_release_closure`
- `replayStepIds:` `authorization-and-sensitive-flow.identity-bindings`, `authorization-and-sensitive-flow.sensitive-flow`
- `witnessArtifactPaths:` `.bitcode/identity-bindings.json`, `.bitcode/authorization-decisions.json`, `.bitcode/sensitive-data-flow.json`, `.bitcode/identity-authorization-proof.json`, `.bitcode/sensitive-data-flow-proof.json`, `.bitcode/authorization-and-sensitive-flow-proof.json`
- `current member closure criteria:` identity, authorization, wallet, and sensitive-flow artifacts must reconcile to the same policy and addressing roots.
- `current member verdict shape:` per-member pass/fail verdict with policy refs and witness refs.
- `current theorem-by-theorem closure reading:` theorem closure requires identity, authorization, wallet verification, and sensitive-data flow to agree without leakage.
- `current theorem-to-replay grouping:` identity closure groups under `identity-bindings`; flow and release closure group under `sensitive-flow`.
- `minimum artifact/replay binding set:` identity bindings, authorization decisions, sensitive-data flow, and both replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` generated proof appendix and authorization, wallet, and disclosure tests.
- `fail-closed conditions:` authorization denial, stale policy roots, stale wallet verification, or sensitive-flow mismatch fail closed.

### Settlement-source-to-shares

- `proofArtifactPath:` `.bitcode/settlement-source-to-shares-proof.json`
- `members:` `contribution-totality`, `clipping-determinism`, `normalization-exactness`, `participation-totality`, `allocation-conservation`, `quantized-fit-quality-receipting`, `journal-completeness`
- `theoremIds:` `settlement_source_to_shares.contribution_totality`, `settlement_source_to_shares.normalization_exactness`, `settlement_source_to_shares.allocation_conservation`, `settlement_source_to_shares.quantized_fit_quality_receipting`, `settlement_source_to_shares.journal_completeness`
- `replayStepIds:` `settlement-source-to-shares.contribution-allocation`, `settlement-source-to-shares.journal-theorem`
- `witnessArtifactPaths:` `.bitcode/source-to-shares.json`, `.bitcode/settlement-participation.json`, `.bitcode/settlement-preview.json`, `.bitcode/accounting-precision-report.json`, `.bitcode/journal-diff.json`, `.bitcode/journal-completeness-proof.json`, `.bitcode/settlement-proof.json`, `.bitcode/settlement-source-to-shares-proof.json`
- `current member closure criteria:` contributions, participation, quantized fit-quality presentation, receipt carry-through, exact BTD allocation, journals, and settlement proof must reconcile.
- `current member verdict shape:` per-member pass/fail verdict with artifact refs, theorem refs, and conservation failure reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires contribution totality, normalization exactness, conservation, quantized fit-quality receipting, and journal completeness to agree.
- `current theorem-to-replay grouping:` allocation and fit-quality presentation theorems group under `contribution-allocation`; journal theorems group under `journal-theorem`.
- `minimum artifact/replay binding set:` the full settlement artifact set and both replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` active settlement appendix renderings and core and workflow settlement tests.
- `fail-closed conditions:` settlement conservation drift or journal incompleteness fail closed.

### Disclosure-boundary

- `proofArtifactPath:` `.bitcode/disclosure-boundary-proof.json`
- `members:` `projection-policy-closure`, `bounded-public-closure`, `redaction-alignment`, `disclosure-verdict-alignment`
- `theoremIds:` `disclosure_boundary.projection_policy_closure`, `disclosure_boundary.redaction_alignment`, `disclosure_boundary.disclosure_verdict_alignment`
- `replayStepIds:` `disclosure-boundary.policy-bounded-public`, `disclosure-boundary.redaction-disclosure`
- `witnessArtifactPaths:` `.bitcode/projection-policy.json`, `.bitcode/bounded-public-proof.json`, `.bitcode/redaction-proof.json`, `.bitcode/disclosure-proof.json`, `.bitcode/disclosure-boundary-proof.json`
- `current member closure criteria:` projection policy, bounded-public proof, redaction, and disclosure verdicts must remain coherent per principal across packages, API, app, and marketing-facing surfaces.
- `current member verdict shape:` per-member pass/fail verdict with witness refs and leakage reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires policy, redaction, and disclosure surfaces to agree without public overexposure.
- `current theorem-to-replay grouping:` policy closure groups under `policy-bounded-public`; redaction and disclosure theorems group under `redaction-disclosure`.
- `minimum artifact/replay binding set:` projection policy, bounded-public proof, redaction proof, disclosure proof, and both replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` disclosure appendix renderings and API, route, and projection tests.
- `fail-closed conditions:` public projection overexposure or redaction mismatch fail closed.

### Proof-contract

- `proofArtifactPath:` `.bitcode/proof-contract.json`
- `members:` `contract-materialization`, `evidence-chain`, `bundle-witness`, `family-closure`
- `theoremIds:` `proof_contract.contract_materialization`, `proof_contract.evidence_chain_closure`, `proof_contract.bundle_witness`, `proof_contract.family_closure`
- `replayStepIds:` `proof-contract.contract-materialization`, `proof-contract.evidence-chain`, `proof-contract.bundle-witness`
- `witnessArtifactPaths:` `.bitcode/proof-contract.json`, `.bitcode/system-proof-bundle.json`, `.bitcode/proof-witness-manifest.json`
- `current member closure criteria:` proof contract, bundle, and witness manifest must agree over all included proof families while owners move from demo-local to package and app surfaces.
- `current member verdict shape:` per-member pass/fail verdict with witness refs and missing-family reasons.
- `current theorem-by-theorem closure reading:` theorem closure requires contract materialization, evidence chain integrity, and witness manifest coherence.
- `current theorem-to-replay grouping:` contract and evidence theorems group under `contract-materialization` and `evidence-chain`; witness closure groups under `bundle-witness`.
- `minimum artifact/replay binding set:` proof contract, system proof bundle, witness manifest, and three replay steps are mandatory.
- `current proof-object fields:` `proofFamily`, `proofHash`, `members`, `theoremVerdicts`, `artifactBindings`, `replayCatalog`, `failureReasons`.
- `generated-artifact and test bindings:` generated proof appendix plus proof generator and family report checks.
- `fail-closed conditions:` missing witness artifacts, missing family coverage, bundle incoherence, or stale promoted status truth fail closed.

## generated canon

### Inherited V19 reproducible-canon artifacts

V26 inherits the V19 reproducible-canon baseline as active generated evidence requirements for reproducibility, replay, and mutation visibility.

### Inherited V20 operator-quality artifacts

V26 inherits the V20 operator-quality baseline as active generated evidence requirements for operator quality, accessibility, performance, and projection sanity.

### Exact generated-artifact inventory matrix

Current V26 generated artifact inventories must cover:
- active inherited reproducible and operator-quality reports,
- `.bitcode/v26-spec-family-report.json`,
- `.bitcode/v26-canonical-input-report.json`,
- `.bitcode/v26-gate-checkpoint-report.json`,
- `.bitcode/application-composition-proof.json`,
- `.bitcode/conversations-continuity-proof.json`,
- `.bitcode/runs-pipelines-totality-proof.json`,
- `.bitcode/persistence-schema-totality-proof.json`,
- `.bitcode/prompt-system-totality-proof.json`,
- `.bitcode/inference-implementation-records-proof.json`,
- `.bitcode/fourth-gate-reclosure-review-proof.json`,
- `.bitcode/source-to-shares-fifth-gate-proof.json`,
- `.bitcode/v26-product-readiness-audit.json`,
- `.bitcode/fifth-gate-closure-deepening-proof.json`,
- `.bitcode/fifth-gate-closure-proof.json`,
- `.bitcode/sixth-gate-mvp-closure-proof.json`,
- `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`,
- `.bitcode/prompt-space-completeness-proof.json`,
- `.bitcode/retained-package-admissibility-proof.json`,
- `.bitcode/environment-mode-coherence-proof.json`,
- `.bitcode/system-reform-admissibility-proof.json`,
- `.bitcode/whole-repository-production-satisfaction-proof.json`,
- `.bitcode/v26-total-closure-proof.json`,
- and `BITCODE_SPEC_V26_PROVEN.md`.

### V26 specifying generated artifacts

V26 specifying artifacts are:
- `.bitcode/v26-spec-family-report.json`
- `.bitcode/v26-canonical-input-report.json`
- `.bitcode/v26-gate-checkpoint-report.json`
- `.bitcode/fourth-gate-reclosure-review-proof.json`
- `.bitcode/source-to-shares-fifth-gate-proof.json`
- `.bitcode/v26-product-readiness-audit.json`
- `.bitcode/fifth-gate-closure-deepening-proof.json`
- `.bitcode/fifth-gate-closure-proof.json`
- `.bitcode/sixth-gate-mvp-closure-proof.json`
- `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`
- `BITCODE_SPEC_V26_PROVEN.md`

### Shared generated-artifact fields

Shared generated-artifact fields must include version, proof-source commit, generation timestamp, target version, active pointer, structural verdict, and fail-closed reasons when not clean.

### Artifact-specific generated payload fields

Artifact-specific generated payload fields must include the structural report payload, canonical input report payload, and promoted appendix payload with exact family and run inventories.

### Artifact confidentiality and disclosability taxonomy

Generated artifacts are bounded-public unless they embed private witness inventories; generated proofs that expose private witnessArtifactPaths remain private-proof artifacts.

### Minimum generated appendix rendered contents

The promoted appendix must include:
- aggregate proof verdict,
- exact proof-family inventory,
- exact per-family member inventory,
- exact per-family theorem inventory,
- exact replay-step inventories and theorem bindings,
- witness artifact inventories,
- generated artifact inventories,
- scenario and run coverage matrices,
- proof-source commit,
- and fail closed when generated evidence is stale, missing, or inconsistent.

### Canonical regeneration and fail-closed posture

Canonical regeneration must fail closed when:
- the generated appendix is stale,
- the family report is stale,
- the canonical input report is stale,
- the pointer and target disagree,
- generated artifacts are used to compensate for missing main-spec meaning,
- or V26 draft claims exceed the generated evidence that actually exists.

## validation canon

The V26 validation canon includes:
- host-agnostic local pre-commit checks for spec-sensitive changes,
- strict versioned spec conformance for `spec: V26` commit titles,
- core, API, workflow, browser, and route integration tests,
- package extraction and ownership regression tests,
- auth and wallet validation,
- environment-mode matrix tests for production, staging, development, and mock,
- containerized CI or CD runs of strict spec conformance and full runtime tests,
- and promotion-time regeneration plus cleanliness checks.

Current validating commands and parity basis include:
- `node scripts/check-bitcode-canonical-inputs.mjs`
- `node scripts/check-bitcode-spec-family.mjs --version V26`
- `node scripts/run-bitcode-spec-quality.mjs --mode basic`
- `node --test protocol-demonstration/test/core.test.js`
- `node --test protocol-demonstration/test/api.test.js`
- `node --test protocol-demonstration/test/workflow.integration.test.js`
- `node --test protocol-demonstration/test/e2e.test.js`
- `node --test protocol-demonstration/test/v21-specifying.test.js protocol-demonstration/test/v22-canon-drift.test.js`

## promotion canon

V26 promotion requires all of the following:
- `BITCODE_SPEC.txt` advancing deliberately and only when V26 is the chosen active canon,
- `BITCODE_SPEC_V26.md`, `BITCODE_SPEC_V26_DELTA.md`, `BITCODE_SPEC_V26_PARITY_MATRIX.md`, and `BITCODE_SPEC_V26_PROVEN.md` agreeing,
- `.bitcode/v26-spec-family-report.json`, `.bitcode/v26-canonical-input-report.json`, and `.bitcode/v26-gate-checkpoint-report.json` existing and matching the promoted V26 structure,
- Bitcode application-native routing existing as source truth rather than as draft-target-only prose,
- package extraction and existing-package convergence being reflected in source sufficiently to satisfy the parity ledger,
- and no fail-closed condition remaining open for any interface V26 claims as hardened.

## appendices and canonical supporting material

The appendices in this main `SPEC` are part of canonical system meaning and are not optional supplements.

## Appendix A. Canonical type and surface catalog

The canonical type and surface catalog includes:
- run identity, read identity, deposit identity, bundle identity, projection principal, and settlement identity,
- BTD-denominated share and micro-unit carriers,
- public and private commitment-scope carriers,
- application-route and operator-surface carriers,
- bitcoin mainchain execution carriers,
- sidechain execution carriers,
- repeated-read payment carriers,
- compute-container execution carriers,
- storage-container publication and retrieval carriers,
- GitHub App, session, fetch, and mutation carriers,
- wallet and auth binding carriers,
- telemetry-policy and telemetry-summary carriers,
- proof-family objects, theorem verdicts, replay catalogs, and witness inventories.

## Appendix B. Proof family closure catalog

The proof family closure catalog in V26 contains:
- Inference-synthesis
- Prompt-completeness
- Static-code-analysis
- Verification-decisions
- Selection-and-materialization
- Authorization-and-sensitive-flow
- Settlement-source-to-shares
- Disclosure-boundary
- Proof-contract

Each family closes only when its witnessArtifactPaths, theoremIds, replayStepIds, and artifact bindings all reconcile.

## Appendix C. Generated artifact contract catalog

The generated artifact contract catalog covers:
- inherited reproducible-canon and operator-quality reports,
- `.bitcode/v26-spec-family-report.json`,
- `.bitcode/v26-canonical-input-report.json`,
- and `BITCODE_SPEC_V26_PROVEN.md`.

These generated artifact inventories must include generated artifact inventories and scenario and run coverage matrices and must fail closed when regeneration is stale.

## Appendix D. Validation and checking gate catalog

The validation and checking gate catalog includes:
- local pre-commit checks for host-agnostic basics,
- strict version and commit-title spec conformance,
- runtime, API, workflow, browser, and application-route tests,
- package extraction and auth or wallet hardening checks,
- containerized CI or CD full suites,
- promotion-time regeneration checks,
- and clean-environment promotion validation.

## Appendix E. Current canonical source map

The current canonical source map includes:
- `protocol-demonstration/src/canon-posture.js`
- `protocol-demonstration/src/bitcode-demo.js`
- `protocol-demonstration/src/canonical/run-artifacts.js`
- `protocol-demonstration/src/canonical/proof-materialization.js`
- `protocol-demonstration/src/canonical/settlement.js`
- `protocol-demonstration/src/canonical/projections.js`
- `protocol-demonstration/src/canonical/prompting.js`
- `protocol-demonstration/src/canonical/evaluation-materialization.js`
- `protocol-demonstration/src/canonical/read-measurement.js`
- `protocol-demonstration/src/canonical/v23-bitcoin.js`
- `protocol-demonstration/src/canonical/v24-external-realization.js`
- `protocol-demonstration/src/demo-shell-state.js`
- `protocol-demonstration/public/app.js`
- `protocol-demonstration/public/styles.css`
- `protocol-demonstration/server.js`
- `protocol-demonstration/test/*`
- `apps/uapi/app/application/page.tsx`
- `apps/uapi/app/application/ApplicationPageClient.tsx`
- `apps/uapi/app/application/first-gate-styles/route.ts`
- `apps/uapi/app/api/state/route.ts`
- `apps/uapi/app/api/deposits/route.ts`
- `apps/uapi/app/api/make-bitcode-branch/route.ts`
- `apps/uapi/app/api/read-review/route.ts`
- `apps/uapi/app/api/reset/route.ts`
- `apps/uapi/app/api/bitcoin-demonstration-service/route.ts`
- `apps/uapi/app/api/auxillaries/data/route.ts`
- `apps/uapi/app/api/v24/external-realization/route.ts`
- `apps/uapi/app/api/v24/executors/[interfaceId]/route.ts`
- `apps/uapi/lib/bitcode-app-context.ts`
- `apps/uapi/app/(root)/components/MarketingLandingPage.tsx`
- `apps/uapi/app/(root)/components/PublicShellFrame.tsx`
- `apps/uapi/app/(root)/components/MarketingOperatorGuideCard.tsx`
- `apps/uapi/app/demo-video/page.tsx`
- `apps/uapi/components/base/bitcode/layout/nav.tsx`
- `apps/uapi/components/base/bitcode/layout/NavBrand.tsx`
- `apps/uapi/components/base/bitcode/layout/footer.tsx`
- `apps/uapi/components/base/bitcode/layout/bitcode-public-copy.ts`
- `apps/uapi/components/base/README.md`
- `packages/github`
- `packages/auth`
- `packages/api`
- `scripts/check-bitcode-canonical-inputs.mjs`
- `scripts/check-bitcode-spec-family.mjs`

## Appendix F. Subsystem totality and derivability matrix

The subsystem totality and derivability matrix explicitly covers:
- repo supply and depositing
- reading and measured demand
- prompt/inference/evaluator ownership
- deposit-to-read fit
- recall and ranking
- verification decisions
- selection and materialization
- branch artifacts, stored AssetPack evidence, and PR Shippables
- identity, authority, signing, and policy
- sensitive data and confidentiality flows
- projection, disclosure, and redaction
- proof families, members, theorems, witnesses, and replay
- settlement, source-to-shares, journals, and exact accounting
- telemetry, persistence, state, and failure semantics
- host/runtime capability truth
- operator experience and pedagogy
- validation and test stack
- generated artifacts and canonical promotion
- bitcoin mainchain execution
- sidechain execution
- repeated-read payment execution
- compute-container execution
- storage-container execution
- github live interface
- auth and wallet connection
- application-route integration
- marketing and navigation routing
- package extraction and repository ownership

Every one of those subsystems must be derivable from the main `SPEC`, its appendices, and the active generated appendix after promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The canonical file-family and promotion contract catalog includes:
- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V26.md`
- `BITCODE_SPEC_V26_DELTA.md`
- `BITCODE_SPEC_V26_PARITY_MATRIX.md`
- `BITCODE_SPEC_V26_NOTES.md`
- `BITCODE_SPEC_V26_PROVEN.md`
- `.bitcode/v26-spec-family-report.json`
- `.bitcode/v26-canonical-input-report.json`

Promotion requires the pointer, posture, generated reports, `_PROVEN_` appendix, and source parity state to agree.

## Appendix H. Operator surface and quality contract catalog

The operator surface and quality contract catalog includes:
- full-page Bitcode application routing,
- application-facing component ownership under `apps/uapi/components/base/*`,
- operator explanation surfaces for supply, read, fit, verification, proof, and settlement,
- projection summaries and proof inspection views,
- settlement preview and audit views,
- telemetry summaries,
- accessibility, performance, and projection quality expectations,
- and operator-facing error posture for fail-closed conditions.

## Appendix I. Scenario, workflow, and cross-product contract catalog

The scenario, workflow, and cross-product contract catalog includes:
- `auth-issuer-rollback`
- `privacy-boundary-proof-export`
- `polyglot-gateway-benchmark-remediation`
- `auth-many-asset-normalization`
- `Targeted deposit`
- `Normalization deposit`
- `patch`
- `context`
- `public`
- `buyer`
- `reviewer`
- `internal`
- `Openly writable`
- `Measurably readable`
- `Provable`
- `Valuable`

V26 also crosses those scenarios over:
- `production`
- `staging`
- `development`
- `mock`

## Appendix J. Fail-closed contract and error posture matrix

The fail-closed contract and error posture matrix includes:
- `invalid deposit`
- `prompt contract incompleteness`
- `parsed-envelope inadmissibility`
- `no-survivor asset pack`
- `authorization denial`
- `public projection overexposure`
- `settlement conservation drift`
- `stale promoted status truth`
- `application-route ownership drift`
- `wallet verification drift`
- `package extraction parity drift`
- `standalone-demo posture regression`

Every named failure class is blocking for promotion when it applies to a claimed realized interface.

## Appendix K. Source-Bearing AssetPack And Artifact Contract Catalog

The source-bearing AssetPack and artifact contract catalog includes:
- `.bitcode/asset-pack.lock.json`
- `.bitcode/selected-source-material.json`
- `.bitcode/verification-report.json`
- `.bitcode/read-review.json`
- `.bitcode/source-to-shares.json`
- `.bitcode/settlement-preview.json`
- `.bitcode/projection-policy.json`
- `.bitcode/system-proof-bundle.json`
- `.bitcode/proof-contract.json`
- `.bitcode/proof-witness-manifest.json`
- `.bitcode/inference-synthesis-proof.json`
- `.bitcode/prompt-completeness-proof.json`
- `.bitcode/static-measurement-proof.json`
- `.bitcode/verification-decisions-proof.json`
- `.bitcode/selection-and-materialization-proof.json`
- `.bitcode/authorization-and-sensitive-flow-proof.json`
- `.bitcode/settlement-source-to-shares-proof.json`
- `.bitcode/disclosure-boundary-proof.json`
- `.bitcode/v26-spec-family-report.json`
- `.bitcode/v26-canonical-input-report.json`
- `BITCODE_SPEC_V26_PROVEN.md`

## accepted boundaries and reopen conditions

V26 accepts the following boundaries after fourth-, fifth-, sixth-, seventh-, and eighth-gate closure:
- V26 is active canonical truth with total V26 closure proven by the generated eighth-gate proof family.
- The useful Bitcode operator UX chain is preserved while the demonstration UI owner is replaced.
- Package extraction may proceed incrementally so long as parity truth keeps the gap explicit.
- Existing packages should be reused when they already fit the responsibility.
- No current source-bearing claim relies on `_legacy/`.

The following reopen conditions apply:
- if the chosen application route class proves wrong in source,
- if the extraction matrix requires materially different package topology,
- if auth, wallet, GitHub, or external hardening requirements force a broader or narrower version center,
- if a compatibility-carrier migration becomes central enough to require its own explicit restatement,
- if prior closure or promotion claims prove overstated and must be reopened procedurally,
- or if generated evidence and source truth diverge during promotion work.

## completion condition

V26 is complete only when:
1. V26-active discipline is preserved until deliberate V27 drafting and later promotion.
2. The four V26 workstreams are explicitly present in the promoted canon and reflected in source.
3. The Bitcode operator experience is a first-class application page rather than an embedded or standalone-primary demo.
4. Demonstration UX is preserved while demonstration UI is replaced by application-facing components.
5. Bitcode system ownership is materially re-homed into packages and app/API owners rather than remaining concentrated in the former top-level demo owner.
6. GitHub, auth, wallet, bitcoin, sidechain, repeated-read, compute, storage, telemetry, and reconciliation hardening are explicit, fail-closed, and test-backed.
7. `.bitcode/v26-spec-family-report.json`, `.bitcode/v26-canonical-input-report.json`, `.bitcode/v26-gate-checkpoint-report.json`, and `BITCODE_SPEC_V26_PROVEN.md` exist and agree with the promoted V26 main spec.
8. The promoted V26 main spec stands alone for re-implementation, audit, operator comprehension, and promotion without semantic dependence on prior versions.
