# V26 Proof Surfaces

## Status

- Scope: non-canonical supplementary proof and coverage map for V26
- Canonical pointer: `/Users/garrettmaring/Developer/ENGI/BITCODE_SPEC.txt -> V26`
- Next draft target: `BITCODE_SPEC_V27.md` (opened as draft; V26 remains active canon)
- Purpose: map new V26 code systems to proof/test/spec expectations while the largest convergence pass in repo history is underway

## Rule

This file is not canonical proof truth.
Canonical proof obligations live in:
- `BITCODE_SPEC_V26.md`
- `BITCODE_SPEC_V26_DELTA.md`
- `BITCODE_SPEC_V26_PARITY_MATRIX.md`
- and the generated proof appendices/report artifacts when V26 reaches closure

This document exists so V26 implementation can add new code without losing coverage discipline.

## Coverage principle

Any new or newly repurposed V26 system must have all three:
1. specification coverage
2. test coverage
3. proof-surface assignment

V26 does not allow large terminal glue layers to accumulate without explicit coverage expectations.
The provable space is expected to grow materially in V26 as more package code, commercial surfaces, and reused component/system carriers are admitted into the converged Bitcode system.

## Gate coverage map

### Gate 2: terminal UX/UI and external interfacings

Required system families:
- `/terminal` architecture framing
- native master-detail sections
- conversations overlay entry and app-owned routes
- auxillaries entry, compatibility orbital routing, and app-owned auxillary data
- app-owned VCS surfaces required for connections and repository context

Current active carriers:
- `uapi/app/terminal/TerminalOperatorCard.tsx`
- `uapi/app/terminal/terminal-operator-explainers.ts`
- `uapi/app/terminal/TerminalExperienceFrame.tsx`
- `uapi/app/terminal/TerminalCommandDeck.tsx`
- `uapi/app/terminal/TerminalActionWorkbenchCard.tsx`
- `uapi/app/terminal/TerminalExternalInterfacingPanel.tsx`
- `uapi/app/terminal/TerminalDepositReadWorkbench.tsx`
- `uapi/app/terminal/TerminalRepositoryContextPanel.tsx`
- `uapi/app/terminal/TerminalCoreNativeSections.tsx`
- `uapi/app/terminal/TerminalClosureNativeSections.tsx`
- `uapi/app/terminal/TerminalLiveSummaryStrip.tsx`
- `uapi/app/terminal/TerminalTransactionWorkspace.tsx`
- `uapi/app/terminal/TerminalTransactionDetailActionBar.tsx`
- `uapi/app/terminal/TerminalWorkspaceRail.tsx`
- `uapi/app/terminal/terminal-closure-state.ts`
- `uapi/app/terminal/terminal-external-runtime.ts`
- `uapi/app/terminal/terminal-live-summary.ts`
- `uapi/app/terminal/terminal-deposit-read-workbench.ts`
- `uapi/app/terminal/terminal-repository-context.ts`
- `uapi/app/terminal/terminal-transaction-query.ts`
- `uapi/app/api/conversations/*`
- `uapi/app/api/auxillaries/data/route.ts`
- `uapi/app/api/vcs/[provider]/*`
- `uapi/app/api/v24/external-realization/route.ts`
- `protocol-demonstration/src/client-entry.js`
- `protocol-demonstration/public/app.js`

Required coverage posture:
- spec:
  architecture, ownership, and acceptance described in `BITCODE_SPEC_V26*`
- tests:
  route tests, UI tests, and browser verification for active entry flows
- proof surface:
  parity ledger rows, explicit closure statements for second-gate acceptance, and generated checkpoint checks that include active README/markdown carriers

### Gate 3: marketing refurbishment

Required system families:
- public website refurbishment carriers
- mounted public-shell vocabulary carriers for landing, footer, `/docs`, and the compatibility `/demo-video` alias
- tooltip/help posture preservation
- separation between terminal acceptance and marketing iteration
- generated checkpoint artifacts that leave third-gate work explicit instead of implied complete

Required coverage posture:
- spec:
  third-gate scope, timing, and separation remain explicit in `BITCODE_SPEC_V26*`
- tests:
  mounted public-shell copy, CTA posture, and guide-route continuity are covered without making second-gate terminal acceptance depend on the full marketing backlog
- proof surface:
  first+second-gate closure artifacts must still report mounted third-gate start clearly while leaving broader marketing/public-shell refurbishment explicitly incomplete

### Gate 4: retained-system convergence

Required system families:
- conversations continuity
- runs and pipelines totalization
- Bitcode-native AssetPack and Shippable meaning
- PostgreSQL/Supabase persistence, `/edgetimes`, migrations, schema contracts, ORM/query carriers, and generated database types
- prompt abstraction and prompt-space routing
- retained package admissibility

Required coverage posture:
- spec:
  retained roles and convergence rules are explicit
- tests:
  retained packages and converged routes are covered by behavior tests
- proof surface:
  retained systems are named in the eventual V26 proof family rather than implied
  current live fourth-gate promotion-boundary owners include `uapi/app/conversations/page.tsx`, `uapi/app/conversations/ConversationsRouteClient.tsx`, `uapi/app/executions/page.tsx`, `uapi/app/executions/[runId]/page.tsx`, `uapi/app/api/executions/route.ts`, `uapi/app/api/vcs/route.ts`, active `uapi/app/api/templates/shippables/route.ts`, compatibility `uapi/app/api/templates/deliverables/route.ts`, `uapi/app/api/auxillaries/template-preferences/route.ts`, `uapi/app/api/auxillaries/profile/route.ts`, `uapi/app/api/auxillaries/connections/github/route.ts`, `uapi/app/api/auxillaries/btd/route.ts`, `uapi/app/api/auxillaries/usage/route.ts`, `uapi/app/api/auxillaries/transactions/route.ts`, `uapi/app/api/auxillaries/api-keys/route.ts`, `uapi/app/edgetimes/edgetimes-topology.ts`, `uapi/app/edgetimes/EdgetimesPageContent.tsx`, `uapi/app/edgetimes/page.tsx`, `uapi/app/api/edgetimes/route.ts`, and the focused route/API tests proving those surfaces
  active API-boundary proof now also includes the route-owner split for conversations: `uapi/app/api/conversations/{route,branch/route,stream/route,[conversationId]/stream/route}.ts` must stay as thin interface bindings over `packages/api/src/routes/conversations.ts`, while deeper conversation behavior remains in `packages/api/src/conversations/*` rather than drifting back into the Next.js filesystem routes; route bindings may use the specific `@bitcode/api/src/routes/conversations` entry rather than an eager top-level API barrel when isolated loading is required
  active API-boundary proof now also includes the route-owner split for executions history: `uapi/app/api/executions/{route.ts,history/route.ts,history/[runId]/route.ts}` must stay as thin interface bindings over `packages/api/src/routes/{shippables,executions}.ts`, while execution-history normalization and persistence orchestration remain in the API package rather than drifting back into app-owned route files; route bindings may use specific `@bitcode/api/src/routes/{shippables,executions}` entries when isolated loading is required
  current generated fourth-gate promotion proofs are `.bitcode/conversations-continuity-proof.json`, `.bitcode/runs-pipelines-totality-proof.json`, `.bitcode/persistence-schema-totality-proof.json`, `.bitcode/prompt-system-totality-proof.json`, `.bitcode/inference-implementation-records-proof.json`, `.bitcode/retained-package-admissibility-proof.json`, `.bitcode/fourth-gate-reclosure-review-proof.json`, and `.bitcode/v26-gate-checkpoint-report.json`
  fourth-gate reclosure proof must keep the earlier overstated promotion claim visible, map every material acceptance criterion to generated evidence, and report no blocking fourth-gate deviance before the gate checkpoint marks fourth gate promoted closed and fifth-gate work proceeds
  retained-package admissibility now also has to state retained port roles explicitly, including Jira as reader-first read ingestion and Git/GH as the initial settle-write boundary; the generated proof now adds a whole-`packages/` census so every active package manifest has a role classification, file witness, write boundary, and zero-unclassified-package result instead of relying on selective exemplar admissions
  retained MCP proof carriers are now explicit too: `packages/executions-mcp/src/mcp-server/src/__tests__/{tools/MCPToolsTestSuite.test.ts,integration/mcp-server.test.ts,unit/auth.test.ts}` must stay green against the current server surface and must not emit lingering Jest open-handle warnings, with imported singleton intervals handled as real runtime teardown obligations rather than ignored test noise
  active email-template carriers are explicit fifth-gate witnesses too: `supabase/config.toml`, `supabase/templates/{magic_link,confirm,password_recovery,email_change,invite,newsletter,deliverable_*}.html`, and the active shippable-route email vars in `packages/api/src/routes/shippables.ts` must converge on Bitcode naming and current placeholder contracts rather than leaving `Engi` product copy in live email/auth flows
  active AssetPack package primitives are explicit fifth-gate witnesses too: `packages/pipelines/asset-pack/src/types/AssetPackWrittenAssetType.ts`, `packages/pipelines/asset-pack/src/semantic-resolution.ts`, `packages/pipelines/asset-pack/src/tools/search.ts`, and `uapi/tests/searchRelevantAssetPackEvidence.test.ts` must keep written-asset type ownership and prior-run evidence search named as Bitcode AssetPack behavior, with `deliverableType` and vector-RPC naming treated only as compatibility payload/storage detail
  persistence proof now also includes explicit execution-storage ORM parity: `packages/orm/src/models/bitcode-execution-storage.ts`, `packages/orm/src/models/bitcode-execution-storage.d.ts`, `packages/orm/src/client.ts`, `packages/orm/src/client.d.ts`, `packages/orm/src/index.d.ts`, `packages/orm/src/models/index.ts`, and `packages/orm/src/__tests__/bitcode-execution-storage.test.ts` must keep former unresolved storage tables mapped to active Bitcode ORM owners, including the `deliverable_run_phases -> phase_executions` bridge and the public `BitcodeOrmClient` surface
  fifth-gate active-product naming witnesses now also cover the retained `@bitcode/prompts` package so prompt-system code, metadata, and promptpart identity text do not silently regress back to `Engi` naming after fourth-gate promotion
  fifth-gate active-product naming witnesses now also cover prompt-system JS carry-through and review-tooling carriers such as `packages/prompts/src/{index.js,parts/PromptPart.js}`, `scripts/phase2-naming-compliance.py`, and `scripts/code-review/{REVIEW_EXCELLENCE_GUIDE.md,reviews/review_prompt_primitives_evolution*.sh}`, so generated JS comments, script-owned repo paths, and review references to current `raw_promptparts/*` files cannot silently preserve old-brand wording or dead prompt filenames
  fifth-gate prompt/inference witnesses now also cover the retained `danger-wall` corridor as Bitcode read/AssetPack risk-admission support through `packages/generic-agents/danger-wall/*`, `packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_*`, `protocol-demonstration/test/v26-danger-wall-agent-compatibility.test.js`, and `protocol-demonstration/src/canonical/inference-implementation-records.js`, so old generic security, content-safety, and monitoring-product semantics cannot silently survive in a live retained setup gate
  package-by-package prompt consumer mapping is now also explicit in `protocol-demonstration/V26_PROMPT_SURFACES.md`, and active app configs such as `uapi/tsconfig.json` no longer keep `@bitcode/prompts/src/*` compatibility aliases on the live path
  fifth-gate active-product naming witnesses now also cover prompt/tooling repair scripts such as `scripts/{fix-remaining-imports,fix-barrel-imports,fix-multiline-imports,fix-corrupted-imports}.sh` and `scripts/code-review/base-review.sh`, so active script repair targets and review output paths cannot silently preserve `@engi/*` rewrite contracts or `/tmp/engi_review_*` runtime artifacts
  fifth-gate active-product naming witnesses now also cover maintenance validation and cleanup carriers such as `scripts/verify-asset-pack-quality.sh`, `scripts/{cleanup_remaining_docs.py,cleanup_outdated_docs.py,cleanup-outdated-docs.sh}`, and `protocol-demonstration/CHECKLIST.md`, so active operator validation logic, cleanup target lists, and demo-checklist guidance cannot silently preserve `@engi/*`, `engi-demo`, `Make ENGI branch`, or `ENGI_*` document targets
  fifth-gate active-product naming witnesses now also cover live public-shell style carriers and retained package surfaces such as `@bitcode/chatgptapp`, `@bitcode/web-search`, `@bitcode/streams`, and `@bitcode/email`, with the expectation that user-facing strings, active identifiers, package docs, and canonical package comments all converge on Bitcode naming rather than lingering old-brand residue
  fifth-gate active-product naming witnesses now also cover mounted public-shell teaching carriers and retained package docs such as `uapi/app/(root)/components/{MarketingFeaturesGrid,MarketingComputeSection,MarketingCompetitorTableSection,MarketingMarketplaceSection}.tsx`, `uapi/app/orbitals/components/OrbitalsConnectsOrbitalEmailConnection.tsx`, and `packages/{web-search,registry}/*`, so public demo-like terminal strings, active classnames/comments, and retained registry/web-search docs cannot silently drift back to old-brand wording
  fifth-gate active-product naming witnesses now also cover user-facing package API route strings in `packages/api/src/routes/*`, so auth welcome flows, ChatGPT success messages, and deliverables permission guidance cannot silently keep old-brand naming while the mounted product surfaces read as Bitcode
  fifth-gate active-product naming witnesses now also cover retained shared contracts such as `@bitcode/errors` and direct consumers like `packages/api/src/routes/shippables.ts`, compatibility `packages/api/src/routes/deliverables.ts`, and `uapi/app/error.tsx`, so exported symbols, docs, and active error teaching cannot silently keep old branded error-contract naming after promotion
  fifth-gate active-product naming witnesses now also cover live webhook and mock-system carriers such as `uapi/app/api/webhook/{route,verify}.ts`, `uapi/tests/webhookRoute.test.ts`, `uapi/mocking/index.ts`, `uapi/mocking/integration/MockProvider.tsx`, `uapi/mocking/generators/ComprehensiveMockDataGenerators.ts`, `uapi/mocking/{README.md,INTEGRATION_GUIDE.md,QUICK_START_*.md,COMPREHENSIVE_SYSTEM_SUMMARY.md,validate-system.js}`, and `uapi/mocking/scripts/*`, so trigger labels, comment commands, browser debug globals, shipped operator docs, and script ownership paths cannot silently drift back to `engi-*`, `__engiMock*`, or stale `app/mocking` product truth
  fifth-gate active-product naming witnesses now also cover canonical auxillary-pane ownership and retained LLM harness config, including `uapi/app/auxillaries/components/AuxillariesSurface.tsx`, `uapi/app/auxillaries/components/Auxillaries{Profile,Connects,Interfaces,BTD}Pane.tsx`, `uapi/app/orbitals/components/Orbitals{Profile,Connects,Interfaces,BTD}Pane.tsx`, `packages/llm-generics/{jest.config.cjs,tsconfig.test.json,__mocks__/*,README.md}`, `jest.base.cjs`, and `pnpm-workspace.yaml`, so active route ownership and workspace test/runtime config cannot silently preserve orbitals-pane implementation ownership, `engi-*` mock filenames, `@engi` transform allowlists, or dead Engi-era workspace entries
  fifth-gate active-product naming witnesses now also cover shipped JS/runtime carry-through and Storybook/docs carriers such as `packages/{errors,logger,observability}/*.js`, `packages/{security,multimodal-utils,tech-types,supabase}/*`, and active `uapi/stories/*`, so generated runtime artifacts, package docs/comments, and operator-facing story/example copy cannot silently preserve `@engi/*`, `Engi`, or Engi-branded sample values after Bitcode promotion
  fifth-gate active-product naming witnesses now also cover canonical auxillary step aliases and retained teaching/example carriers such as `uapi/app/auxillaries/components/Auxillaries{Credits,Connects,Models,ProfileStep}.tsx`, active test imports under `uapi/tests/{creditsStep*,connectionsStep*,modelsStep*,profileStep*,orbitals*}.tsx`, retained docs/examples in `packages/{doc-comment,figma,generic-tools,system-grep,testing,executions-mcp}/*`, and active e2e/story fixtures like `uapi/tests/e2e/conversation-digest-pipeline.test.ts`, `uapi/tests/e2e/fixtures/stories/killBug.json`, and `uapi/stories/{SourceDivider,SourceConfig}.stories.tsx`, so fifth-gate proof covers canonical auxillary ownership in tests and the remaining sample-product teaching layer rather than stopping at runtime/package code alone
  fifth-gate active-product naming witnesses now also cover the Bitcode root spec/toolchain family and the auxiliary-focused story/test import layer, so `BITCODE_SPEC*.md`, `BITCODE_SPEC.txt`, `scripts/*bitcode*.mjs`, and active Storybook/test carriers such as `uapi/stories/{LoginPane,OnboardingPane,user/Auth,user/Onboarding}.stories.*` plus `uapi/tests/{orbitalsPaneTabs,orbitalsWorkspacePanels,orbitalPaneMeta}.test.*` cannot silently regress to root `ENGI_SPEC*` paths or compatibility `orbitals` imports when canonical auxillary carriers already exist
  fifth-gate active-product naming witnesses now also cover non-_legacy historical path carriers such as `BITCODE_{V10,V11}_PREP_MEMO.md` and `protocol-demonstration/BITCODE_DEMO_SPEC_V15*.md`, so root/package historical docs do not keep teaching `ENGI_*` filenames outside `_legacy/`
  fifth-gate active-product naming witnesses now also cover canonical auxillary lower-level implementation carriers such as `uapi/app/auxillaries/components/{headers/*,shared/*,models/*,AuxillariesDataSharingPanel.tsx,auxillary-pane-explainers.ts,profile-pane.module.css}`, so canonical pane files do not silently keep orbitals-owned header/shared/model/data-share/explainer imports after the auxillary surface has already become the active owner
  fifth-gate active-product naming witnesses now also cover retained orbitals lower-level compatibility carriers such as `uapi/app/orbitals/components/{headers/*,shared/*,models/*,OrbitalsDataSharingPanel.tsx,orbital-pane-explainers.ts}`, so those paths remain thin compatibility re-exports rather than silently preserving duplicate live implementations after canonical auxillary equivalents exist
  fifth-gate active-product naming witnesses now also cover canonical auxillary onboarding/data contracts and active external-realization witnesses such as `uapi/app/auxillaries/auxillary-onboarding-contract.ts`, `uapi/app/api/auxillaries/{onboarding,data}/route.ts`, `uapi/hooks/useUserData.ts`, `uapi/app/auxillaries/components/AuxillariesSurface.tsx`, `uapi/tests/{orbitalsOnboardingRoute,userDataRoute,api/externalRealizationRoute,terminalExternalRuntime}.test.ts`, and active Bitcode operating docs like `protocol-demonstration/{CHECKLIST,SCRIPT,BITCODE_DEMO_SPEC_V15,SPEC_V6_GAP_ANALYSIS}.md`, so payload aliases, schema-backed onboarding semantics, env witnesses, and branch-artifact naming cannot silently preserve `models/credits`, `ENGI_V24_*`, or `ENGI_READ.md`
  fifth-gate active-product naming witnesses now also cover live Bitcode-core read-materialization and external-executor carriers such as `protocol-demonstration/src/canonical/{read-measurement,run-artifacts,v24-local-executors,v24-remote-adapters}.js` and `protocol-demonstration/test/{api,workflow.integration}.test.js`, so emitted read artifacts, V24 env controls, local executor schemes, and Bitcode-core sample branch/runtime refs cannot silently preserve `ENGI_READ.md`, `ENGI_V24_*`, `engi-local://*`, `engi-review/*`, or other Engi-branded active protocol examples
  fifth-gate active-product naming witnesses now also cover active draft/env/measuring contracts and ChatGPT app type carriers such as `protocol-demonstration/data/state.json`, `internal-docs/{BITCODE_LLM_REGISTRY,SECURITY,BITCODE_PROTOCOL_THESIS}.md`, `tsconfig.json`, `uapi/tsconfig.json`, `packages/procurement/src/quality-assessment.ts`, and `packages/external-apps/chatgpt/src/types/protocol-demonstration__*.d.ts`, so live V27 draft paths, LLM/MCP env docs, thesis constants, measuring helpers, and filesystem-level type carriers cannot silently preserve `ENGI_SPEC_V27*`, `ENGI_LLM_*`, `ENGI_ENABLE_MCP_*`, `measureEngi`, or `engi__*.d.ts`
  fifth-gate active-product naming witnesses now also cover active canon-posture carriers such as `protocol-demonstration/src/{canon-posture.js,canonical/v22-canon-posture.js}` and `protocol-demonstration/test/canon-posture.test.js`, so the live V26/V27 runtime/report surface reads `BITCODE_SPEC.txt` and `BITCODE_SPEC_{V26,V27,*}` rather than preserving `ENGI_SPEC.txt` or `ENGI_SPEC_V26/V27*` in current canonical posture truth
  fifth-gate active-product naming witnesses now also cover active historical promotion-proof carriers such as `protocol-demonstration/test/v22-canon-drift.test.js`, so the historical V23/V24/V25 promotion family keeps using the current `scripts/{check,prepare,promote}-bitcode-*.mjs` toolchain and `protocol-demonstration/*` runtime fixtures while limiting old ENGI-spec fixture paths to `_legacy/ENGI_SPEC_*`
  fifth-gate active-product naming witnesses now also cover the non-_legacy historical matrix/doc family under `protocol-demonstration/{SPEC_V7_COVERAGE_MATRIX,SPEC_V8_COVERAGE_MATRIX,SPEC_V9_IMPLEMENTATION_MATRIX,SPEC_V10_IMPLEMENTATION_MATRIX,SPEC_V11_IMPLEMENTATION_MATRIX,SPEC_V12_IMPLEMENTATION_MATRIX,SPEC_V13_IMPLEMENTATION_MATRIX,SPEC_V14_IMPLEMENTATION_MATRIX,SPEC_V15_IMPLEMENTATION_MATRIX,BITCODE_DEMO_SPEC_V15}.md`, so preserved lineage does not continue teaching live `ENGI_SPEC.txt`, `make-engi-branch`, `engi-demo/`, or canonical ENGI wording outside `_legacy/`
  fifth-gate active-product naming witnesses now also cover the preserved protocol-owner root-sibling move, so `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, `protocol-demonstration/src/canonical/{v21-specifying,proven-generator,v22-canon-posture}.js`, `.github/workflows/bitcode-canon-quality.yml`, `.gitignore`, and `protocol-demonstration/test/{canon-posture,v22-canon-drift,v26-canon-language,v26-active-product-naming}.test.js` cannot silently regress to `packages/bitcode` or `engi-demo` as active filesystem truth after the preserved protocol owner moved to the root-sibling `protocol-demonstration/`
  fifth-gate active-product naming witnesses now also cover live env examples, Storybook config, internal docs, and the canon-quality workflow such as `.env`, `.env.local`, `.v26.env`, `uapi/.env`, `uapi/.storybook/{main,preview}.tsx`, `internal-docs/{README,BITCODE_INTERFACE_STYLE,BITCODE_EXECUTION_WORK_SUMMARIES,DEPLOYMENT}.md`, and `.github/workflows/protocol-demonstration-canon-quality.yml`, so checked-in env examples, Storybook aliases/comments, internal-doc teaching, and CI paths cannot silently preserve `ENGI_*`, `@engi/*`, Engi-branded headings, or `engi-demo` workflow segments after the active Bitcode cut-over
  fifth-gate active-product naming witnesses now also cover live marketing/style/operator carriers such as `uapi/app/(root)/components/{MarketingFeatureBento,MarketingFeatureList,MarketingHeadlessMobileShowcase,MarketingSteps,MarketingTestimonialsCTA}.tsx`, `uapi/{components/base/README.md,styles/{CONSOLIDATED_SYSTEM_GUIDE,orbital}.css,tailwind.config.ts,public/email-logo.svg,stories/email-templates/*}`, `uapi/scripts/long-runner-worker.ts`, `Dockerfile.long-runner`, `packages/styling/README.md`, `packages/generic-tools/lsp-query/src/prompts/lsp-context-awareness-composition.ts`, `.ai/PRODUCT.md`, `INVESTOR_MEMO.md`, `VULNERABILITY_AUDIT_2026-04-02.md`, and `.sales/INTRO_PAMPHLET.md`, so active repository truth does not preserve `Engi`, `engi.dev`, `api.engi.sh`, `engi/long-runner`, or `engi/` path ownership after Bitcode cut-over
  fifth-gate active-product naming witnesses now also cover active integration/example/doc carriers such as `internal-docs/{BITCODE_API,BITCODE_CONNECTED_SERVICES,BITCODE_INTERFACE_STYLE}.md`, `packages/mysql/README.md`, and `uapi/mocking/generators/ComprehensiveMockDataGenerators.ts`, so Bitcode-owned API hosts, auxillaries ownership, marketplace preview hosts, and package descriptions do not silently regress to `api.engi.software`, orbitals-owned connects-pane references, `marketplace.engi.com`, or `ENGI platform` wording
  fifth-gate active-product naming witnesses now also cover active platform-package and auxillary-teaching carriers such as `packages/{auth,postgresql,jira,supabase}/README.md`, `packages/supabase/src/client.ts`, `packages/templates-generics/{src/types.ts,package.json}`, `internal-docs/BITCODE_INTERFACE_STYLE.md`, and `uapi/mocking/{README.md,COMPREHENSIVE_SYSTEM_SUMMARY.md,generators/ComprehensiveMockDataGenerators.ts}`, so Bitcode platform ownership and User Auxillaries wording do not silently regress to `ENGI platform`, `engi system`, or `User Orbital`
  fifth-gate active-product naming witnesses now also cover active protocol/demo telemetry and root-artifact teaching carriers such as `protocol-demonstration/src/{demo-scenario,canonical/v23-bitcoin-demonstration-service,canonical/v20-quality}.js`, `README.md`, `packages/observability/README.md`, `packages/time/README.md`, and `packages/tools-generics/src/{Tool,doc-code-tool/index}.ts`, so Bitcode-owned telemetry ids, stubbed bitcoin carrier ids/examples, generated appendix names, `.bitcode/*` root artifact teaching, and shared package comments/docs do not silently regress to `engi.*`, `tb1qengi*`, `lnbcrt1engi*`, `make ENGI branch`, `.engi/*`, or `ENGI platform`
  fifth-gate active-product naming witnesses now also cover active package-readme and V20 quality-proof carry-through carriers such as `packages/{google-analytics,tech-types,sentry,kubernetes,logger,orm,streams}/README.md`, `packages/orm/src/index.ts`, `scripts/code-review/{README.md,base-review.sh}`, and `protocol-demonstration/test/{v20-quality-summary,v20-operator-transcript}.test.js`, so Bitcode-owned platform wording, read-measurement grounding for `tech-types`, Bitcode review-framework headings, and the historically correct `_legacy/ENGI_SPEC_V20_PROVEN.md` appendix expectation do not silently regress to `ENGI platform`, `ENGI ORM`, `ENGI CODE REVIEW FRAMEWORK`, or stale generated-appendix names in active docs and proof carriers
  fifth-gate proof now also covers direct `tech-types` package usability through `packages/tech-types/{src/tech.ts,src/uniqueTech.ts,src/signals.ts,src/signals-runtime.js,README.md,src/__tests__/tech-types.test.ts,jest.config.cjs,tsconfig.json}`, so the read-measurement vocabulary package remains actually consumable by dependents with a pragmatic `TechType` surface, curated unique-tech helper closure, package-owned signal normalization, and package-local proof instead of carrying misleading examples or unmaterializable type contracts.
  fifth-gate proof now also covers protocol read-measurement follow-through into that package surface through `protocol-demonstration/src/{bitcode-demo.js,canonical/read-measurement.js}` and `protocol-demonstration/test/core.test.js`, requiring canonical `technologyProfile` emission rather than ad hoc stack-hint-only closure.
  fifth-gate proof now also covers the first dependent package hop beyond that normalization boundary through `packages/generic-agents/tech-types-identifier/{src/index.ts,src/technology-profile-contract.ts,src/__tests__/technology-profile-contract.test.ts,README.md}` and `protocol-demonstration/test/v26-active-product-naming.test.js`, so downstream agent packages keep `technologyProfile` as the canonical output envelope instead of re-fragmenting it into local stack-only schemas.
  fifth-gate proof now also covers the constrained dependent-package compile chain for that same example surface through `./node_modules/.bin/tsc -p packages/generic-agents/tech-types-identifier/tsconfig.json --noEmit`, with the shared closure explicitly admitted in `packages/{orm,pipelines-generics,streams,supabase}/*`; the example is not considered closed if its package-local test passes but the actual dependent compile path is still broken.
  fifth-gate proof now also covers the canonical `$BTD` package/terminal balance surface through `packages/{btd,api,digest,web-search,orm}/*`, `uapi/{app/api/auxillaries,app/terminal,app/executions,tests,components/base/bitcode/{btd,execution,inputs},stories/BTDInvestmentExperience.stories.tsx,.env.example,README.md,app/orbitals/README.md}/*`, and `protocol-demonstration/test/v26-active-product-naming.test.js`, so active Bitcode package imports, ORM model owners, route payloads, measured-BTD transaction/workspace processing stats, BTD share/read-right carriers, and public-shell wording do not silently regress to credit-bucket semantics.
  fifth-gate proof now also covers canonical in-product BTD acquisition and BTD-notification execution through `uapi/components/base/bitcode/btd/{btd-tracker,BTDPrices}.tsx`, `uapi/app/(root)/components/MarketingPricingSection.tsx`, `/auxillaries/btd`, `uapi/networking/api-client.ts`, and `supabase/templates/{low_btd_reminder,out_of_btd,btd_transfer}.html`, so the live BTC→BTD acquisition/balance/transfer flow no longer routes through `app/_legacy`, checkout/Stripe route owners, or old `credit-transfer` / `low-credits-reminder` / `out-of-credits` naming.
  fifth-gate proof now also covers canonical organization treasury and interface-readiness posture through `uapi/app/{auxillaries/components/organization/{BTDTreasuryManagement,OrganizationSettings}.tsx,orbitals/components/organization/OrganizationSettings.tsx,(root)/components/MarketingSetupForm.tsx}` and `protocol-demonstration/test/v26-active-product-naming.test.js`, so active organization-facing treasury guidance stays wallet/BTC/`$BTD`/Connects-native, Stripe-backed credit purchase scaffolding stays deleted, and `uapi/app/_legacy` remains absent.
  fifth-gate proof now also covers canonical auxillary runtime selectors through `uapi/app/auxillaries/components/{AuxillariesProvider,AuxillariesSurface,AuxillariesContent}.tsx`, `uapi/app/auxillaries/components/shared/AuxillariesPaneTabs.tsx`, `uapi/components/base/bitcode/nav/AuxillariesUseButton.tsx`, `uapi/styles/{orbital-global,orbital}.css`, `uapi/tests/auxillariesProvider.test.tsx`, and the active auxillary Playwright specs, so the live runtime/test interface uses `auxillaries-*` portal/open/button/label selectors and portal ids rather than preserving `data-orbital-testid`, `orbital-portal`, `orbital-open`, `orbital-label-active`, or `__orbitalPrefetched`.
  fifth-gate proof now also covers active E2E onboarding and auxillary proof carriers through `uapi/tests/e2e/{auxillaries.helpers,auxillaries.profile,auxillaries.connections.flows,auxillaries.interfaces.flows,auxillaries.navigation,auxillaries.btd.flows,auxillaries.btd.interval.active,auxillaries.btd.chart.nodata,account.btd.visual,onboarding.visual,onboarding-full-flow}.spec.ts`, so active Playwright filenames, onboarding-state helpers, test titles, and snapshot ids teach auxillaries and `$BTD` rather than preserving `orbital.*` and `credits.*` as active Bitcode product truth.
  fifth-gate proof now also covers devex-side package and mock closure through `uapi/package.json`, absent `uapi/{package-lock.json,pnpm-lock.yaml}`, and `uapi/mocking/*`, so nested lockfiles, deleted checkout remnants, and `USER_CREDITS` / `ORGANIZATION_CREDITS` / `CREDIT_TRANSACTIONS` cannot silently reintroduce Stripe or credit-era truth after the live Bitcode surface has been cut to wallet/BTC/`$BTD`.
  fifth-gate proof now also covers MCP-side `$BTD` holding-read and BTC-fee settlement semantics through `packages/executions-mcp/src/mcp-server/src/{types,auth/middleware,pipeline-execution/adapter,tools/pipeline-tools,tools/orchestration-tools,resources/*,__tests__/*,docs/openapi-generator.ts,server.ts}`, requiring `btdBalance`, `manageBtdHoldings`, `minimumBtdHolding`, `measuredBtdEstimate`, `measuredBtd`, `feeAsset`, and BTC-fee reference fields across auth, execution, metrics, fixtures, and published machine-interface surfaces rather than preserving `creditBalance`, `manageCredits`, `estimatedBtd`, `btdUsed`, or `creditsUsed` as live Bitcode truth.
  fifth-gate proof now also covers Bitcode acquisition and asset-pack execution storytelling through `uapi/app/(root)/components/MarketingBtdInvestmentExperience.tsx`, `packages/executions-mcp/src/mcp-server/{ARCHITECTURE.md,docs/public/mcp-overview.md,src/__tests__/fixtures/MCPTestFixtures.ts,src/__tests__/tools/MCPToolsTestSuite.test.ts}`, `uapi/stories/conversations/{RichTextInput,Pickers,PipelineIntegration,CompleteSystem}.stories.tsx`, and `uapi/tests/api/deliverables.test.ts`, so wallet-gated BTC settlement, GitHub-before-transacting posture, asset-pack execution, and `$BTD` planning remain the active interface story rather than Stripe checkout or credit-era investment narration.
  fifth-gate proof also preserves the settlement accounting boundary: `protocol-demonstration/src/canonical/settlement.js` may keep journal `debits` and `credits` only as exact accounting-entry semantics, while product-denominated balance, spend, UI, route, and MCP carriers stay BTC/`$BTD`.
  fifth-gate active-product naming witnesses now also cover preserved-protocol runtime posture carriers such as `protocol-demonstration/{src/bitcode-demo.js,src/canon-posture.js,test/e2e.test.js}`, so active runtime branch namespaces, operator wait states, and canon/spec-family posture remain Bitcode-only and do not silently regress to `engi/remediation-*` or an `ENGI_SPEC` fallback in live runtime and interface proof
  fifth-gate active-product naming witnesses now also cover the canonical auxillary-onboarding contract and reserved read-measurement teaching layer such as `uapi/app/{terminal/terminal-run-data.ts,api/auxillaries/onboarding/route.ts,api/auxillaries/notifications/_shared.ts}`, `uapi/hooks/useConversationStream.ts`, `uapi/mocking/middleware/MockMiddleware.ts`, `uapi/tests/{orbitalsOnboardingRoute,terminalTransactions}.test.ts`, and `internal-docs/{BITCODE_AUXILLARIES_READINESS,BITCODE_CONNECTED_SERVICES,BITCODE_FRONTEND_ARCHITECTURE,BITCODE_EXCHANGE_DATABASE,BITCODE_API,BITCODE_EXECUTIONS,BITCODE_AGENTIC_EXECUTION,BITCODE_INTERFACE_STYLE}.md`, so active Bitcode proof also guards the canonical pane payloads, unauthorized onboarding response shape, and read-measurement placeholder posture instead of leaving stale step-only or Measure wording behind in code/docs/tests

### Gate 5: minimum-functional Bitcode Exchange, Bitcode Terminal, and broad retained-system reform baseline

Required system families:
- minimum-functional Exchange/Terminal read-write closure
- post-measurement pre-fit Read review with accept/reject/remeasure-with-feedback admission through protocol artifacts, app API, and Terminal controls
- present-fit-for-settlement-review surfaces with quantized source-to-shares fit qualities carried into settlement receipts
- Terminal closure-map presentation of Read review before verification plus present-fit-for-settlement-review fit qualities inside the settlement card and selected-detail payload
- environment/debug coherence
- production/staging/development mode completeness
- migration/schema/type/API closure for retained storage systems
- retained-package admissibility proof
- retained kept/cut/isolated reform baseline
- explicit removal proof for non-Bitcode multi-agent / multi-output execution controls and internal-only `use-computer` Read-measurement admission under `BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT`
- active-source product naming retirement
- fifth-gate closure witnesses for retained app/package/runtime carriers
- proof-bearing closure for newly admitted terminal, API, MCP, prompt, ChatGPT-app, and retained package systems at the same standard as the earlier proved Bitcode core
- generated fifth-gate source-to-shares proof through `.bitcode/source-to-shares-fifth-gate-proof.json`, explicitly covering the make-shares/use-shares baseline as a source-to-shares input to fifth-gate procedural closure
- generated fifth-gate closure-deepening proof through `.bitcode/fifth-gate-closure-deepening-proof.json`, explicitly recording post-fourth-gate-promotion evidence across Terminal, Exchange, persistence/schema, reform, proof, and environment axes
- generated fifth-gate closure proof through `.bitcode/fifth-gate-closure-proof.json`, explicitly accepting the six fifth-gate closure rows as the minimum-functional prerequisite for later gates
- generated sixth-gate MVP closure proof through `.bitcode/sixth-gate-mvp-closure-proof.json`, explicitly accepting the eight MVP closure rows as the prerequisite for commercial testnet launch
- generated seventh-gate commercial testnet launch proof through `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`, explicitly accepting the eight launch rows before the now-closed eighth-gate provation family
- protocol proof closure for `.bitcode/read-review.json`, `.bitcode/settlement-preview.json`, `.bitcode/source-to-shares.json`, settlement AssetPack fit-quality receipts, and `settlement_source_to_shares.quantized_fit_quality_receipting`
- terminal/API proof closure for `protocol-demonstration/public/app.js`, `protocol-demonstration/server.js`, `uapi/app/api/read-review/route.ts`, `uapi/app/api/make-bitcode-branch/route.ts`, `uapi/app/terminal/TerminalReadScenarioPanel.tsx`, `uapi/app/terminal/terminal-closure-state.ts`, `TerminalClosureNativeSections.tsx`, `terminal-section-atlas.ts`, `terminal-transaction-detail.ts`, and `terminal-activity-history.ts` so review admission and quantized fit-quality rows remain reviewable, writable, parity-tested against protocol behavior, and readable through the Bitcode Terminal and app API rather than only through raw artifacts

Required coverage posture:
- spec:
  final closure conditions are explicit
- tests:
  mode behavior, naming-retirement witnesses, pre-fit read review, quantized fit-quality receipting, and closure gates are exercised
- proof surface:
  generated V26 proof appendix and reports become fifth-gate blockers

### Gate 6: minimal viable product elevation

Required system families:
- explicit post-fifth-gate Bitcode Terminal map:
  - `activity`
  - `transactions`
  - `conversations`
  - `auxillaries`
- MVP quality/reread/operator-stability elevation across Exchange, Terminal, Protocol, Proofs, API, MCP, and admitted app surfaces
- ChatGPT-style parity expectations for the in-app conversations surface and the retained ChatGPT app surface

Required coverage posture:
- spec:
  MVP elevation obligations are explicit and closed by `.bitcode/sixth-gate-mvp-closure-proof.json`
- tests:
  MVP product paths are exercised as one coherent Bitcode product rather than a minimum-functional bring-up baseline
- proof surface:
  sixth-gate MVP closure proof explicitly names what was elevated beyond fifth-gate minimum functionality

### Gate 7: initial commercially-viable testnet live-launch refinement

Required system families:
- commercially-credible operator and launch posture on testnet
- Exchange/Terminal/Protocol/Proof/API/MCP/app alignment as one launch-ready product story
- live-launch quality refinement beyond MVP sufficiency

Required coverage posture:
- spec:
  commercial testnet refinement obligations are explicit and closed by `.bitcode/seventh-gate-commercial-testnet-launch-proof.json`
- tests:
  launch-critical operator and interface paths are exercised as one product story
- proof surface:
  seventh-gate commercial testnet launch proof explicitly names what was refined beyond MVP quality: product readiness, testnet-first boundary, commercial story, wallet/settlement/repository readiness, proof/state reread, connected interfaces, and retired non-Bitcode core-journey explanations

### Gate 8: whole-repository provation and final V26 closure

Required system families:
- whole-repository production satisfaction
- prompt-space completeness
- total V26 closure
- final terminal/API/MCP/ChatGPT-surface alignment

Required coverage posture:
- spec:
  total repository closure is explicit
- tests:
  whole-repository final witnesses exercise the kept V26 system as one Bitcode terminal
- proof surface:
  generated V26 proof appendix and reports are eighth-gate final closure evidence

## Immediate V26 code-system assignments

Current active assignments:
- `uapi/app/api/vcs/[provider]/connection/route.ts`
  test coverage:
  route response tests and browser verification through orbitals
  proof surface:
  second-gate external interfacing hardening and parity matrix
- `uapi/app/api/vcs/[provider]/repositories/route.ts`
  test coverage:
  route response tests and repository-selector behaviors
  proof surface:
  second-gate deposit-side repository context readiness
- `uapi/app/terminal/TerminalRepositoryContextPanel.tsx`
  test coverage:
  browser verification plus repository-selection helper coverage
  proof surface:
  second-gate deposit-side repository context readiness inside `/terminal`
- `protocol-demonstration/public/app.js`
  test coverage:
  semantic snapshot bridge verification through route-local normalization tests and live terminal checks
  proof surface:
  second-gate admissible shell snapshot and shell control exposure for native terminal composition
- `protocol-demonstration/src/client-entry.js`
  test coverage:
  semantic snapshot bridge exercised by terminal-owned deposit/read normalization, shell-bridge tests, and live `/terminal` review
  proof surface:
  second-gate package-to-terminal bridge for mounted-shell semantic state and command/intake control, including host-wait and fail-closed snapshot reads during bootstrap windows
- `uapi/app/terminal/terminal-shell-bridge.tsx`
  test coverage:
  `uapi/tests/terminalShellBridge.test.tsx`
  proof surface:
  centralized mounted-shell polling and control refresh for second-gate terminal carriers, including fail-closed refresh behavior during pre-mount and hot-reload rebuild windows
- `uapi/app/api/executions/_shared.ts`
  test coverage:
  `uapi/tests/api/executionsHistoryRoute.test.ts`, `uapi/tests/api/executionsHistoryRunRoute.test.ts`, and `uapi/tests/usePipelineExecution.test.tsx`
  proof surface:
  normalized current execution-history payload shape shared by the transaction master, selected-transaction detail, and retained execution readers
- `uapi/app/api/executions/history/route.ts`
  test coverage:
  `uapi/tests/api/executionsHistoryRoute.test.ts`
  proof surface:
  current app-owned execution-history collection route for transaction-master hydration, including anonymous-safe empty GET posture
- `uapi/app/api/executions/history/[runId]/route.ts`
  test coverage:
  `uapi/tests/api/executionsHistoryRunRoute.test.ts` and `uapi/tests/usePipelineExecution.test.tsx`
  proof surface:
  current app-owned selected-execution history route for selected-transaction detail and retained execution activity hydration, including anonymous-safe empty GET posture
- `uapi/app/api/client-error/route.ts`
  test coverage:
  `uapi/tests/api/clientErrorRoute.test.ts`
  proof surface:
  second-gate runtime-health intake so client-side terminal failures are accepted by an app-owned carrier instead of 404ing
- `uapi/app/auxillaries/components/AuxillariesProfilePane.tsx`
  test coverage:
  live `/terminal` verification with fullscreen orbitals entry exercised from the running app
  proof surface:
  second-gate orbitals renderability from `/terminal`, including the active data-sharing pane hookup required to avoid missing-overlay crashes
- `uapi/app/auxillaries/components/AuxillariesProvider.tsx`
  test coverage:
  `uapi/tests/auxillariesProvider.test.tsx` plus live `/terminal` verification with auxillaries entry exercised from the running app
  proof surface:
  second-gate fullscreen auxillaries portal readiness from `/terminal`, including first-open rendering when the shared event bridge fires before the overlay container would otherwise be visible to React
- `uapi/app/api/auxillaries/model-preferences/route.ts`
  test coverage:
  `uapi/tests/api/userModelPreferencesRoute.test.ts`
  proof surface:
  second-gate terminal-owned signed-in orbital preference persistence, including authenticated read posture, lead/admin write posture, mock-mode fallback, and app-owned save ownership for orbital defaults
- `uapi/app/api/auxillaries/user/data-share/route.ts`
  test coverage:
  `uapi/tests/api/orbitalsUserDataShareRoute.test.ts`
  proof surface:
  second-gate profile-owned repository knowledge-sharing carrier so contained orbital routes fail closed to JSON instead of missing-route HTML during onboarding and review posture
- `uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx`
  test coverage:
  `uapi/tests/orbitalsInterfacesPane.test.tsx`
  proof surface:
  second-gate `Interfaces` orbital ownership, including shared orbital workspace section, stat, and preference carriers plus model, prompt, and operator-default posture
- `uapi/app/auxillaries/components/AuxillariesBTDPane.tsx`
  test coverage:
  `uapi/tests/orbitalsBTDPane.test.tsx`
  proof surface:
  second-gate `$BTD` orbital ownership, including wallet and share posture, settlement and history return defaults, and app-owned preference saving through the orbital route carrier
- `uapi/components/base/bitcode/layout/nav.tsx`
  test coverage:
  `uapi/tests/navWorkspaceChrome.test.tsx` plus live `/terminal` verification
  proof surface:
  second-gate workspace-chrome discipline for unauthenticated Terminal and orbital routes, replacing disabled marketing CTA behavior with deliberate access/create-account actions
- `uapi/components/base/bitcode/layout/user-menu.tsx`
  test coverage:
  `uapi/tests/userMenu.test.tsx`
  proof surface:
  second-gate signed-in workspace chrome discipline so Auxillaries stay user-facing as `Open Auxillaries fullscreen` with the fixed Connects/Interfaces/Profile/$BTD ring model and the shared retained `orbitals` entry alias instead of settings/account wording
- `uapi/app/orbitals/components/OrbitalsLoginPane.tsx`, `uapi/app/orbitals/components/OrbitalsContent.tsx`, `uapi/app/orbitals/components/shared/OrbitalsPaneTabs.tsx`, `uapi/app/orbitals/components/shared/OrbitalsWorkspacePanels.tsx`, `uapi/app/orbitals/OrbitalsRouteClient.tsx`
  test coverage:
  `uapi/tests/orbitalsLoginPane.test.tsx`, `uapi/tests/orbitalsContent.test.tsx`, `uapi/tests/orbitalsWorkspacePanels.test.tsx`, `uapi/tests/orbitalsRouteClient.test.tsx`, and `uapi/tests/orbitalPaneMeta.test.ts`
  proof surface:
  second-gate orbitals-first access-shell discipline so contained entry and focused orbital routes preserve Connects/Interfaces/Profile/$BTD language, keep a contained operator shell with contained orbital reads, route contained rails through shared panel/tabs carriers instead of older floating ring-label sequence furniture, and retain shared fullscreen/open/return wording instead of generic workspace/settings/account furniture
- `uapi/components/base/bitcode/notifications/NotificationsWidget.tsx`
  test coverage:
  `uapi/tests/notificationsWidget.test.tsx`
  proof surface:
  second-gate operator-facing notification posture so proof closure, repository activity, and review prompts remain part of the workspace chrome rather than generic account furniture, and signed-in follow-through reopens Orbitals instead of the sign-up window
- `uapi/styles/orbital.css`
  test coverage:
  live browser verification on `host.docker.internal:3000/terminal?...` and `host.docker.internal:3000/auxillaries/profile`
  proof surface:
  second-gate contained-operator-shell stability so terminal-opened orbitals no longer collapse back to modal-width access furniture and both contained/direct orbital surfaces stay renderable with no error-level console output
- `uapi/components/base/bitcode/layout/workspace-surface.ts`
  test coverage:
  `uapi/tests/workspaceSurface.test.ts`
  proof surface:
  shared second-gate route classification for terminal/orbital/conversation chrome, including footer suppression on operator routes and stable navbar-surface selection
- `protocol-demonstration/public/app.js`
  test coverage:
  live `/terminal` verification through the preserved runtime tooltip/footer layer and
  `protocol-demonstration/test/v26-public-copy.test.js`
  proof surface:
  preserved-runtime user-facing copy discipline, including live-surface/reference-topic tooltip labels, friendly reference-chip naming, and removal of demo-era language from visible help surfaces
- `protocol-demonstration/public/telemetry.js`
  test coverage:
  `protocol-demonstration/test/v26-public-copy.test.js`
  proof surface:
  preserved-runtime telemetry labeling discipline so operator-visible diagnostics report as `[bitcode-runtime]` instead of leaking `[engi-demo]`
- `protocol-demonstration/public/index.html`
  test coverage:
  live `/terminal` verification through the preserved runtime drawer and direct runtime load expectations
  proof surface:
  preserved-runtime HTML parity for closure-runtime, flow-guide, deposit, read, AssetPack, and Shippable wording so direct runtime inspection does not regress to prototype/tutorial copy
- `uapi/app/terminal/terminal-command-state.ts`
  test coverage:
  `uapi/tests/terminalCommandState.test.ts`
  proof surface:
  deterministic normalization of shell command posture, flow-guide continuity, preserved-shell tutorial compatibility input, and option sets into route-local terminal command state
- `uapi/app/terminal/TerminalCommandDeck.tsx`, `uapi/app/terminal/TerminalLiveSummaryStrip.tsx`, `uapi/app/terminal/TerminalSectionAtlas.tsx`, `uapi/app/terminal/TerminalPreservedShellSurface.tsx`, `uapi/app/terminal/TerminalTransactionWorkspace.tsx`, `uapi/app/terminal/terminal-run-data.ts`, `uapi/app/orbitals/components/OrbitalsInterfacesPane.tsx`, `uapi/app/orbitals/components/OrbitalsBTDPane.tsx`, `uapi/app/orbitals/components/OrbitalsModelsPane.tsx`, `uapi/components/base/bitcode/notifications/notification-presentation.ts`, `uapi/components/base/bitcode/layout/user-menu.tsx`
  test coverage:
  `uapi/tests/terminalCommandPresentation.test.ts`,
  `uapi/tests/terminalFlowGuide.test.ts`,
  `uapi/tests/terminalWorkspaceRailCard.test.tsx`,
  `uapi/tests/orbitalsInterfacesPane.test.tsx`,
  `uapi/tests/orbitalsBTDPane.test.tsx`,
  `uapi/tests/orbitalsContent.test.tsx`,
  `uapi/tests/orbitalsRouteClient.test.tsx`,
  `uapi/tests/notificationsWidget.test.tsx`,
  `uapi/tests/userMenu.test.tsx`
  proof surface:
  third-gate review-surface wording discipline on active `/terminal` and canonical `/auxillaries` carriers so visible product copy reads as `Transactions` and `Auxillaries` rather than lingering `workspace` / `transaction terminal` residue, while laptop-width transactions reading stays centered on the main column until the support rail expands at `2xl`
- `uapi/app/terminal/TerminalOperatorCard.tsx`
  test coverage:
  `uapi/tests/terminalOperatorCard.test.tsx`
  proof surface:
  second-gate shared terminal workspace shell/help carrier for route-local workspace framing, reusable header posture, and user-facing copy discipline
- `.bitcode/v26-gate-checkpoint-report.json`
  test coverage:
  `protocol-demonstration/test/proven-generator.test.js`
  proof surface:
  explicit first+second-gate closure witness for the near-term V26 commit boundary, including third-gate preparation posture before full V26 promotion
- `README.md`, `uapi/README.md`, `protocol-demonstration/README.md`, `uapi/app/terminal/README.md`, `uapi/app/auxillaries/README.md`, `uapi/app/orbitals/README.md`, `uapi/components/base/bitcode/README.md`, `uapi/components/base/bitcode/execution/README.md`
  test coverage:
  generated file-presence checks inside `.bitcode/v26-gate-checkpoint-report.json` plus spec-family validation
  proof surface:
  second-gate documentation/refurbishment closure for the active Bitcode root, route, orbital, execution, shared-component, and package owners
- `uapi/app/(root)/components/MarketingLandingPage.tsx`, `uapi/app/(root)/components/landing/MarketingLandingHero.tsx`, `uapi/app/(root)/components/landing/MarketingLandingPillarCard.tsx`, `uapi/app/(root)/components/landing/MarketingLandingGuideCard.tsx`, `uapi/app/(root)/components/landing/MarketingLandingTerminalPreview.tsx`, `uapi/app/(root)/components/landing/marketing-landing-shared.tsx`, `uapi/components/base/bitcode/layout/footer.tsx`, `uapi/components/base/bitcode/layout/bitcode-public-copy.ts`, `uapi/app/(root)/components/PublicDocsPageContent.tsx`, `uapi/app/docs/page.tsx`, `uapi/app/demo-video/page.tsx`, `uapi/app/(root)/components/MarketingOperatorGuideCard.tsx`, `uapi/app/(root)/components/marketing-operator-guide-assets.ts`
  test coverage:
  `uapi/tests/marketingLandingPage.test.tsx`, `uapi/tests/footerPublicShell.test.tsx`, `uapi/tests/marketingOperatorGuideCard.test.tsx`, `uapi/tests/publicDocsPageContent.test.tsx`, and `uapi/tests/e2e/landing.mobile-scroll.spec.ts`
  proof surface:
  mounted third-gate public-shell start, including shared `Network` / `Transactions` / `Docs` / `Auxillaries` vocabulary, a real `/docs` public teaching surface with route cards and inline widgets, guest auxillary-entry CTA posture, a landing shell that no longer carries live `ComingSoon*` owners or `coming-soon-*` stylesheet imports, a mounted landing owner that now delegates hero/guide/preview/shared data into clearer carriers, a progressive terminal preview that collapses into a compact public/mobile summary before wider-shell detail, landing ambience that suppresses orbital rings/pointer glow/oversized blur on smaller or reduced-motion shells, and a docs-owned walkthrough path that no longer narrates Bitcode through demo-era or developer-path copy or preserve ordered demo-era guide-media compatibility
- `uapi/app/(root)/components/PublicShellFrame.tsx`, `uapi/components/base/bitcode/layout/nav.tsx`, `uapi/components/base/bitcode/layout/NavBrand.tsx`, `uapi/components/base/bitcode/layout/workspace-surface.ts`, `uapi/components/base/bitcode/layout/footer.tsx`, `uapi/components/base/bitcode/layout/bitcode-public-explainers.ts`
  test coverage:
  `uapi/tests/navPublicShell.test.tsx`, `uapi/tests/navBrand.test.tsx`, and `uapi/tests/navWorkspaceChrome.test.tsx`
  proof surface:
  mounted third-gate public-route chrome, including live Bitcode nav on `/`, `/docs`, and `/demo-video`, stable public-route entry links, shared public-shell explainers for key entry links and the protocol reference, explicit `Bitcode Network` / `Bitcode Docs` / `Bitcode Transactions` route-title posture, a protocol-spec link that resolves through the stable canonical pointer instead of a version-specific public spec URL, a mobile-first footer card/chip posture that keeps route links and protocol/version metadata legible on narrow shells, public-shell orbital access that opens the contained Bitcode overlay instead of stopping at page-local CTA copy, a responsive stacked public-nav posture that avoids hiding the primary entry paths behind extra menu state, and a compatibility `/demo-video` alias that resolves back into docs-owned content
- `uapi/app/terminal/TerminalWorkspaceRailCard.tsx`
  test coverage:
  `uapi/tests/terminalWorkspaceRailCard.test.tsx`
  proof surface:
  second-gate compact shared terminal-shell/help carrier for the right-rail posture, including explainer continuity and user-facing copy framing
- `uapi/app/terminal/terminal-operator-explainers.ts`
  test coverage:
  consumed through component tests and lint plus live `/terminal` verification
  proof surface:
  shared terminal explainer catalog for deposit, read, deposit, closure, and workspace-map help posture carried forward into the production terminal
- `uapi/app/terminal/TerminalCommandDeck.tsx`
  test coverage:
  lint plus live `/terminal` verification through the shell command/control bridge
  proof surface:
  second-gate terminal-owned command posture for scenario, projection, branch mode, guide continuity, reset, and branch creation
- `uapi/app/terminal/terminal-live-summary.ts`
  test coverage:
  `uapi/tests/terminalLiveSummary.test.ts`
  proof surface:
  deterministic normalization of the shell summary bridge into route-local terminal operating posture
- `uapi/app/terminal/TerminalLiveSummaryStrip.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with route-local summary posture mounted
  proof surface:
  second-gate terminal-owned operating summary reading from semantic shell state rather than rendered shell cards
- `uapi/app/terminal/terminal-section-atlas.ts`
  test coverage:
  `uapi/tests/terminalSectionAtlas.test.ts`
  proof surface:
  deterministic normalization of section-atlas previews from semantic core and closure bridges into route-local terminal navigation state
- `uapi/app/terminal/TerminalSectionAtlas.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with semantic atlas cards mounted
  proof surface:
  second-gate terminal-owned section atlas reading from semantic bridges rather than rendered shell panel markup
- `uapi/app/terminal/TerminalSupplySelectionPanel.tsx`
  test coverage:
  `uapi/tests/terminalSupplySelection.test.ts` for normalized supply-selection state plus lint and live `/terminal` verification for the shared operator-shell framing
  proof surface:
  second-gate deposit-side supply terminal with shared terminal-shell/help posture, user-facing copy discipline, and explicit auth/filter/search/inventory continuity inside `/terminal`
- `uapi/app/terminal/terminal-core-surface.ts`
  test coverage:
  `uapi/tests/terminalCoreSurface.test.ts`
  proof surface:
  deterministic normalization of operating, depositing, reading, and fit semantics from the shell snapshot into route-local terminal core panels
- `uapi/app/terminal/TerminalCoreNativeSections.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with core panels mounted from the semantic bridge
  proof surface:
  second-gate terminal-owned master-detail core composition reading from the semantic `coreSurface` bridge instead of rendered shell DOM
- `uapi/app/terminal/terminal-deposit-read-workbench.ts`
  test coverage:
  `uapi/tests/terminalDepositReadWorkbench.test.ts`
  proof surface:
  deterministic normalization of deposit, read, and fit action detail from the shell snapshot into route-local Bitcode terminal composition
- `uapi/app/terminal/TerminalDepositReadWorkbench.tsx`
  test coverage:
  browser verification and UI review around route-local deposit/read action detail
  proof surface:
  second-gate terminal-owned action detail for repository supply, measured demand, and fit intent
- `uapi/app/terminal/TerminalActionWorkbenchCard.tsx`
  test coverage:
  `uapi/tests/terminalActionWorkbenchCard.test.tsx`
  proof surface:
  retained late-stage design-system card reuse under Bitcode-owned action composition, now grounded in shared execution-level metric, row, and chip carriers
- `uapi/app/terminal/terminal-transactions.ts`
  test coverage:
  `uapi/tests/terminalTransactions.test.ts`
  proof surface:
  deterministic normalization and filtering of Bitcode Terminal executions into a searchable master-detail table carrier, including raw-pipeline-to-agentic-execution normalization, participant/proof-posture filters, and explicit sort posture
- `packages/api/src/executions/agentic-execution.ts`, `packages/api/src/routes/executions.ts`, `uapi/app/terminal/TerminalPageClient.tsx`, and `uapi/components/base/bitcode/layout/{bitcode-public-copy,bitcode-public-explainers}.ts`
  test coverage:
  `uapi/tests/{terminalTransactions,navPublicShell,footerPublicShell,marketingLandingPage,marketingOperatorGuideCard,edgetimesPageContent,conversationsRouteClient,orbitalsRouteClient}.test.*`
  proof surface:
  one shared agentic-execution grammar now repurposes the retained pipeline substrate into canonical Bitcode Terminal execution labels, lenses, proof posture, and closure focus across API history rows, `/terminal`, and the public shell
- `packages/api/src/executions/agentic-execution.ts`, `packages/api/src/routes/executions.ts`, `uapi/networking/api-client.ts`, `uapi/hooks/useExecutionState.ts`, `uapi/app/executions/components/ExecutionsPageClient.tsx`, and `uapi/components/base/bitcode/layout/sidebars/left-sidebar.tsx`
  test coverage:
  focused lint on retained execution carriers plus `uapi/tests/terminalSurfaceCopy.test.ts`
  proof surface:
  canonical `agentic-execution:branch-artifact` route/query posture now reaches the retained `/executions` surface and live callers while mapping back onto the preserved raw `pipeline:*` storage substrate, proving that Bitcode product routing can be canonical without discarding the reusable execution implementation basis
- `uapi/app/terminal/terminal-workspace-explainers.ts`, `uapi/app/terminal/{TerminalCommandDeck.tsx,TerminalTransactionWorkspace.tsx,terminal-flow-guide.ts,terminal-command-presentation.ts,TerminalCoreNativeSections.tsx,TerminalDepositComposer.tsx,TerminalPreservedShellSurface.tsx}`, `uapi/components/base/bitcode/execution/{BitcodeTransactionsTable.tsx,bitcode-transaction-explainers.ts}`, and `uapi/app/auxillaries/components/{auxillary-pane-explainers.ts,AuxillariesBTDPane.tsx}`
  test coverage:
  `uapi/tests/terminalSurfaceCopy.test.ts`
  proof surface:
  active `/terminal`, retained `/executions`, and auxillary product copy now teach the `Bitcode Terminal` directly instead of a generic `transactions surface`, and the visible explainer/detail layer now reads as Bitcode activity plus asset-pack/proof/history consequence rather than raw transaction/deliverable product wording
- `uapi/app/terminal/{terminal-run-data.ts,TerminalLiveSummaryStrip.tsx,TerminalTransactionActivitySurface.tsx,terminal-workspace-copy.ts}`, `uapi/app/auxillaries/components/auxillary-pane-meta.ts`, and `uapi/app/api/conversations/_shared.ts`
  test coverage:
  `uapi/tests/{terminalTransactions,terminalTransactionDetail,terminalTransactionDetailSnapshot,terminalTransactionSource,bitcodeDetailPanel}.test.*`
  proof surface:
  active mock-run, detail-snapshot, and conversation-support carriers now keep branch-artifact execution typing and Bitcode Terminal wording canonical instead of teaching raw AssetPack-compatibility route strings or generic transaction-surface language in the review substrate
- `BITCODE_SPEC_V26.md`, `uapi/app/terminal/{TerminalDepositReadWorkbench.tsx,TerminalReadScenarioPanel.tsx,TerminalClosureNativeSections.tsx,terminal-workspace-copy.ts,page.tsx}`, and `uapi/app/auxillaries/components/{AuxillariesConnectsPane.tsx,auxillary-pane-meta.ts,headers/AuxillariesConnectsPaneHeader.tsx}`
  test coverage:
  `uapi/tests/{terminalSurfaceCopy,connectionsStep.static}.test.*`
  proof surface:
  active V26 specification and live deposit/read/connects carriers now teach Bitcode as protocol, product, and proofs across `Bitcode Mainnet`, the `Bitcode Terminal`, read measurement, asset-pack synthesis, settlement follow-through, and wallet-plus-GitHub transacting prerequisites instead of generic transaction or deliverable posture
  active V26 specification and live deposit/read/connects carriers now teach Bitcode as protocol, product, and proofs across `Bitcode Mainnet`, the `Bitcode Terminal`, read measurement, asset-pack synthesis, settlement follow-through, and wallet-plus-GitHub transacting prerequisites instead of generic transaction or deliverable posture
- `uapi/app/terminal/{TerminalTransactionDetailSurface.tsx,TerminalTransactionDetailHero.tsx,TerminalTransactionIdentityCard.tsx,TerminalTransactionClosureCard.tsx,TerminalTransactionProofsCard.tsx,TerminalTransactionHistoryCard.tsx,TerminalTransactionDetailActionBar.tsx,TerminalClosureControlDeck.tsx,TerminalTransactionActivitySurface.tsx,TerminalExperienceFrame.tsx,TerminalWorkspaceRail.tsx,TerminalMockTransactionDetails.tsx,terminal-command-presentation.ts,terminal-flow-guide.ts,README.md}`, `uapi/components/base/bitcode/execution/{BitcodeTransactionsTable.tsx,BitcodeTransactionsActiveFilters.tsx,BitcodeTransactionsOverview.tsx,README.md}`, and `uapi/app/terminal/terminal-transaction-detail.ts`
  test coverage:
  `uapi/tests/{terminalTransactionDetail,terminalTransactionDetailCards,terminalCommandPresentation,terminalWorkspaceRailCard,bitcodeTransactionsOverview,bitcodeDetailRowList,bitcodePayloadRowsCard,bitcodePayloadDetailCard,bitcodeDetailPanel}.test.*`
  proof surface:
  the selected-activity detail family and shared execution/activity-ledger carriers now teach Bitcode activity, activity identity, asset packs, inline proof/history closure, and Bitcode Terminal ledger posture instead of selected-transaction / deliverable operator wording while the retained route ids and payload substrate remain reusable underneath
- `uapi/app/terminal/TerminalTransactionsTable.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with the transactions master surface mounted
  proof surface:
  second-gate terminal-owned orchestration of transaction selection, `transactionId` route posture, filter state, active-filter chip posture, and route-owned pagination
- `uapi/app/terminal/terminal-transaction-source.ts`
  test coverage:
  `uapi/tests/terminalTransactionSource.test.ts`
  proof surface:
  deterministic resolution of `live`, `mock-review`, and `review-fallback` transaction-source posture from live history plus the selected transaction URL, so explicit mock review URLs fail over to interactive review state instead of emptying `/terminal`
- `uapi/app/terminal/terminal-transaction-query.ts`
  test coverage:
  `uapi/tests/terminalTransactionQuery.test.ts`
  proof surface:
  deterministic parsing, persistence, compatibility fallback, detail-focus persistence, `transaction`-preferred detail routing, shared default filter/pagination carriers, route-owned pagination carriers, and reset behavior for route-owned transaction query state
- `uapi/components/base/bitcode/execution/bitcode-transaction-active-filters.ts`
  test coverage:
  `uapi/tests/protocol-demonstrationTransactionActiveFilters.test.ts`
  proof surface:
  deterministic normalization of non-default transaction filters into readable active-filter chips plus one-at-a-time default reset behavior
- `uapi/components/base/bitcode/execution/BitcodeTransactionsActiveFilters.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationTransactionsActiveFilters.test.tsx`
  proof surface:
  reusable active-filter chip carrier for the Bitcode Terminal, keeping the shaped master window explicit and individually clearable
- `uapi/app/terminal/TerminalTransactionDetailActionBar.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with route-owned detail focus and closure actions mounted
  proof surface:
  terminal-owned detail interaction and closure follow-through inside the selected-transaction carrier
- `uapi/app/terminal/terminal-transaction-detail.ts`
  test coverage:
  `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  deterministic closure follow-through normalization for inline settlement metrics, proof families, branch artifacts, recent transaction history, and reusable closure raw-payload inspection
- `uapi/app/terminal/TerminalTransactionClosureCard.tsx`
  test coverage:
  `uapi/tests/terminalTransactionDetailCards.test.tsx`
  proof surface:
  explicit closure summary and settlement/branch follow-through carrier inside selected-transaction detail, including the shared visual-vs-raw payload posture
- `uapi/app/terminal/TerminalTransactionProofsCard.tsx`
  test coverage:
  `uapi/tests/terminalTransactionDetailCards.test.tsx`
  proof surface:
  explicit proofs detail carrier inside selected-transaction detail
- `uapi/app/terminal/TerminalTransactionHistoryCard.tsx`
  test coverage:
  `uapi/tests/terminalTransactionDetailCards.test.tsx`
  proof surface:
  explicit history detail carrier inside selected-transaction detail
- `uapi/components/base/bitcode/execution/BitcodeDetailCollection.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationDetailCollection.test.tsx`
  proof surface:
  reusable execution-level carrier for proof/history-style transaction detail collections
- `uapi/components/base/bitcode/execution/BitcodeDetailPanel.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationDetailPanel.test.tsx`
  proof surface:
  reusable execution-level carrier for master-detail substructure preview panels inside the Bitcode transaction workspace
- `uapi/app/terminal/TerminalTransactionClosureCard.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with inline closure follow-through mounted in selected-transaction detail
  proof surface:
  terminal-owned lower closure reading inside the selected-transaction carrier rather than shell-section-only follow-through
- `uapi/components/base/bitcode/execution/BitcodeTransactionsTable.tsx`
  test coverage:
  lint plus terminal-level verification through the route-local transactions carrier
  proof surface:
  reusable base-component table carrier for searchable Bitcode transaction master-detail UI
- `uapi/components/base/bitcode/execution/BitcodeTransactionsOverview.tsx`
  test coverage:
  lint plus terminal-level verification through the transactions master carrier
  proof surface:
  reusable overview metrics and mode posture carrier for transaction-master SRP decomposition
- `uapi/components/base/bitcode/execution/BitcodeTransactionsFilterBar.tsx`
  test coverage:
  lint plus `uapi/tests/terminalTransactions.test.ts` and `uapi/tests/protocol-demonstrationTransactionsFilterBar.test.tsx`
  proof surface:
  reusable field-filter and sort-control carrier for transaction-master SRP decomposition, including explicit accessible control naming under shared explainers
- `uapi/components/base/bitcode/execution/BitcodeTransactionsDataTable.tsx`
  test coverage:
  lint plus terminal-level verification through the transactions master carrier
  proof surface:
  reusable row-selection and detail-entry carrier for transaction-master SRP decomposition, including shared header explainers
- `uapi/components/base/bitcode/execution/BitcodeTransactionsPagination.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationTransactionsPagination.test.tsx`
  proof surface:
  reusable pagination carrier for the route-owned Bitcode transactions master surface, including shared page-size explainers
- `uapi/components/base/bitcode/execution/bitcode-transaction-data-mode.ts`
  test coverage:
  `uapi/tests/protocol-demonstrationTransactionDataMode.test.ts`
  proof surface:
  typed source-mode contract for transaction overview, support-rail labeling, and review-fallback posture across the Bitcode transaction workspace
- `uapi/components/base/bitcode/execution/BitcodeInlineExplainer.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationInlineExplainer.test.tsx`
  proof surface:
  reusable second-gate explainer/tooltip carrier for the Bitcode Terminal
- `uapi/components/base/bitcode/execution/BitcodePayloadInspector.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadInspector.test.tsx`
  proof surface:
  reusable visual-vs-raw payload carrier with copy support, payload metadata, structured payload summaries, and shared explainers for selected-transaction detail
- `uapi/components/base/bitcode/execution/BitcodePayloadShape.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadShape.test.tsx`
  proof surface:
  reusable structured payload summary carrier for selected-transaction detail, exposing root kind, top-level counts, and previewable field/item posture before raw JSON inspection
- `uapi/components/base/bitcode/execution/BitcodePayloadTree.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadTree.test.tsx`
  proof surface:
  reusable bounded nested payload-tree carrier for selected-transaction detail, exposing structural JSON fields and types before raw inspection
- `uapi/components/base/bitcode/execution/BitcodeDetailRowList.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationDetailRowList.test.tsx`
  proof surface:
  reusable key-value row carrier for SRP-aligned selected-transaction identity and closure reading
- `uapi/components/base/bitcode/execution/BitcodeMetricGrid.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationMetricGrid.test.tsx`
  proof surface:
  reusable metric-grid carrier for selected-transaction overview and closure follow-through
- `uapi/components/base/bitcode/execution/BitcodeChipCloud.tsx`
  test coverage:
  browser verification and card-level integration through `uapi/tests/terminalTransactionDetailCards.test.tsx`
  proof surface:
  reusable chip-cloud carrier for branch artifacts and later selected-transaction detail token clouds
- `uapi/components/base/bitcode/execution/BitcodeActionPillRow.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationActionPillRow.test.tsx`
  proof surface:
  reusable action-pill carrier for selected-transaction verification, settlement, branch, and history follow-through inside transaction detail
- `uapi/components/base/bitcode/execution/BitcodeExecutionStreamPanel.tsx`
  test coverage:
  `uapi/tests/bitcodeExecutionStreamPanel.test.tsx`
  proof surface:
  reusable execution-stream carrier for shared header/log/work-update composition across `/terminal`, conversations, and `/executions`
- `uapi/components/base/bitcode/execution/bitcode-transaction-explainers.ts`
  test coverage:
  covered indirectly through `uapi/tests/protocol-demonstrationInlineExplainer.test.tsx`, `uapi/tests/protocol-demonstrationTransactionsFilterBar.test.tsx`, `uapi/tests/protocol-demonstrationPayloadInspector.test.tsx`, `uapi/tests/protocol-demonstrationPayloadShape.test.tsx`, and `uapi/tests/protocol-demonstrationPayloadTree.test.tsx`
  proof surface:
  centralized explainer-copy contract for transaction filters, headers, pagination, raw payload posture, structured payload posture, and nested payload-tree posture
- `uapi/components/base/bitcode/execution/BitcodePayloadDetailCard.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadDetailCard.test.tsx`
  proof surface:
  reusable selected-transaction card shell that composes payload inspection and action pills into one execution-level carrier
- `uapi/components/base/bitcode/execution/BitcodePayloadRowsCard.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadRowsCard.test.tsx`
  proof surface:
  reusable payload-plus-rows carrier for selected-transaction identity and other row-shaped Bitcode detail cards
- `uapi/components/base/bitcode/execution/BitcodePayloadCollectionCard.tsx`
  test coverage:
  `uapi/tests/protocol-demonstrationPayloadCollectionCard.test.tsx`
  proof surface:
  reusable payload-plus-collection carrier for proof/history and other list-shaped Bitcode detail cards
- `uapi/components/base/bitcode/execution/bitcode-transaction-types.ts`
  test coverage:
  imported through `uapi/tests/terminalTransactions.test.ts`, `uapi/tests/terminalTransactionQuery.test.ts`, and `uapi/tests/protocol-demonstrationTransactionsPagination.test.tsx`
  proof surface:
  typed base-component contract for transaction-master filtering, overview, pagination, and row-selection carriers
- `uapi/app/terminal/terminal-supply-selection.ts`
  test coverage:
  `uapi/tests/terminalSupplySelection.test.ts`
  proof surface:
  deterministic normalization of authenticated intake session, artifact filter, search, and selected inventory entries into route-local terminal intake state
- `uapi/app/terminal/TerminalSupplySelectionPanel.tsx`
  test coverage:
  lint plus live `/terminal` verification through the shell command/control bridge
  proof surface:
  second-gate terminal-owned deposit-side intake control for session binding, inventory filtering, search, and artifact selection
- `uapi/app/terminal/terminal-deposit-composer.ts`
  test coverage:
  `uapi/tests/terminalDepositComposer.test.ts`
  proof surface:
  deterministic normalization of deposit-auth session defaults, selected inventory continuity, and signer/source-repo defaults into route-local deposit-composer state
- `uapi/app/terminal/TerminalDepositComposer.tsx`
  test coverage:
  lint plus localhost route verification with the app-owned deposit carrier present in `/terminal`
  proof surface:
  second-gate terminal-owned native deposit submission against the app-owned Bitcode intake route
- `uapi/app/terminal/terminal-read-scenarios.ts`
  test coverage:
  `uapi/tests/terminalReadScenarios.test.ts`
  proof surface:
  deterministic normalization of active scenario cards, parser posture, closure counts, and target-kind counts into route-local read-scenario state
- `uapi/app/terminal/TerminalReadScenarioPanel.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with route-local scenario selection mounted, `uapi/tests/api/{readReviewRoute.test.ts,readReviewProtocolParity.test.ts}`, and `protocol-demonstration/test/v26-read-review-source-to-shares.test.js`
  proof surface:
  second/fifth-gate terminal-owned native read selection and pre-fit Read-review controls through the Bitcode shell control bridge and app-owned `/api/read-review` boundary
- `uapi/app/terminal/terminal-closure-state.ts`
  test coverage:
  `uapi/tests/terminalClosureState.test.ts`
  proof surface:
  deterministic normalization of verification, branch, settlement, and ledger semantics from the shell snapshot into terminal-owned closure state
- `uapi/app/terminal/TerminalClosureNativeSections.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with native closure cards mounted
  proof surface:
  second-gate terminal-owned closure composition reading from the semantic `closureSurface` bridge instead of rendered shell DOM
- `uapi/app/terminal/terminal-closure-controls.ts`
  test coverage:
  `uapi/tests/terminalClosureControls.test.ts`
  proof surface:
  deterministic normalization of closure execution, reset, refresh, and follow-through posture from the command and closure semantic bridges
- `uapi/app/terminal/TerminalClosureControlDeck.tsx`
  test coverage:
  lint plus localhost `/terminal` verification with route-local closure operation controls mounted
  proof surface:
  second-gate terminal-owned closure operation deck rather than implicit preserved-shell action ownership
- `uapi/app/terminal/TerminalExternalInterfacingPanel.tsx`
  test coverage:
  browser/API verification plus runtime-normalization helper coverage
  proof surface:
  second-gate boundary honesty and external-interfacing stable readiness inside `/terminal`
- `uapi/app/terminal/terminal-repository-context.ts`
  test coverage:
  `uapi/tests/terminalRepositoryContext.test.ts`
  proof surface:
  deterministic repository-provider normalization and selected-repository derivation for the deposit-side terminal frame
- `uapi/app/terminal/terminal-external-runtime.ts`
  test coverage:
  `uapi/tests/terminalExternalRuntime.test.ts`
  proof surface:
  deterministic runtime-state normalization and blocking-interface classification for the terminal-owned external posture carrier
- `uapi/app/api/vcs/[provider]/oauth/route.ts`
  test coverage:
  route behavior tests and redirect contract checks
  proof surface:
  second-gate auth/VCS interface admissibility
- `uapi/app/api/vcs/[provider]/connect-token/route.ts`
  test coverage:
  route response tests for mock mode and error/success handling
  proof surface:
  second-gate external interfacing hardening and fallback-connect behavior
- `uapi/app/api/v24/external-realization/route.ts`
  test coverage:
  route response tests for app-owned runtime posture and live localhost verification
  proof surface:
  second-gate external interfacing hardening and native boundary-actuality terminal read
- `uapi/app/terminal/TerminalTransactionWorkspace.tsx`
  test coverage:
  browser verification and UI coverage around transactions, AssetPacks, proofs, and history
  proof surface:
  second-gate master-detail substructure closure
- `uapi/app/terminal/terminal-transaction-detail-snapshot.ts`
  test coverage:
  `uapi/tests/terminalTransactionDetailSnapshot.test.ts`
  proof surface:
  deterministic normalization of selected-transaction history payloads into terminal-owned AssetPack/proof/history detail
- `uapi/app/terminal/terminal-transaction-detail.ts`
  test coverage:
  `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  deterministic normalization of selected-transaction overview, identity, and closure-read rows into SRP-aligned detail modules
- `uapi/app/terminal/terminal-run-activity.ts`
  test coverage:
  `uapi/tests/terminalTransactionActivity.test.ts`
  proof surface:
  deterministic normalization of retained execution events into terminal-owned Bitcode run-activity detail
- `uapi/components/base/bitcode/activity/bitcode-activity-model.ts`
  test coverage:
  `uapi/tests/bitcodeActivityModel.test.ts`
  proof surface:
  shared fourth-gate activity vocabulary bridging transactions, retained execution primitives, and personal notification activity before later public/personal system usage joins the same family
- `uapi/app/executions/page.tsx`, `uapi/app/executions/[runId]/page.tsx`, `uapi/app/auxillaries/[pane]/page.tsx`, `uapi/app/orbitals/*/page.tsx`
  test coverage:
  route metadata verification plus live browser checks on retained compatibility routes
  proof surface:
  fourth-gate merged-world naming discipline so retained `/executions` teaches explicit executions primitives inside `activity`, canonical `/auxillaries/*` teaches `auxillaries`, and retained `/orbitals/*` is reduced to redirect-only compatibility that no longer renders canonical HTML
- `uapi/app/terminal/TerminalTransactionDetailSurface.tsx`
  test coverage:
  browser verification and UI coverage around live and mock selected-transaction detail rendering
  proof surface:
  second-gate selected-transaction terminal ownership rather than mock-only inward reuse
- `uapi/app/terminal/TerminalTransactionDetailHero.tsx`
  test coverage:
  lint plus `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  reusable overview carrier for selected-transaction detail SRP decomposition
- `uapi/app/terminal/TerminalTransactionIdentityCard.tsx`
  test coverage:
  lint plus `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  reusable identity/read carrier for selected-transaction detail SRP decomposition
- `uapi/app/terminal/TerminalTransactionClosureCard.tsx`
  test coverage:
  lint plus `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  reusable closure/read-follow-through carrier for selected-transaction detail SRP decomposition
- `uapi/app/terminal/TerminalTransactionActivitySurface.tsx`
  test coverage:
  browser verification and UI coverage around central activity/log/work-update rendering
  proof surface:
  second-gate elevation of retained execution/log carriers into Bitcode terminal ownership
- `uapi/app/conversations/components/ConversationsOverlay.tsx`
  test coverage:
  browser verification and conversations route tests
  proof surface:
  second-gate overlay continuity and fourth-gate conversations retention

## Whole-repository proof closure

V26 proof closure must extend beyond the former demo core.

Required closure posture:
- the retained and repurposed whole repository that remains in V26 production canon must be proven up to Bitcode-grade satisfaction
- any package, component family, route carrier, or terminal subsystem kept for V26 must have explicit spec, test, and proof-surface ownership
- proof closure may no longer terminate at the old `engi-demo` equivalent core alone; it must close over the production Terminal and surviving packages as one Bitcode system

## Fifth-gate runtime/env naming closure

- `packages/logger/{src/logger.ts,src/logger.js,package.json}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate runtime contract closure so active logging, sidecar emission, and sync helpers converge on `BITCODE_*` env keys, `.bitcode_logs`, and Bitcode-facing package metadata
- `packages/agent-generics/{README.md,TLDR.md,src/diagnostics/config.ts,src/diagnostics/instrumentation.ts,src/execution/AgentExecution.ts,src/agents/factories.ts,src/steps/thricified-generation.ts,src/steps/failsafe-sequence.ts,src/substeps/factories.ts,src/phaseHelpers/normalizeStepName.ts}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate debug and diagnostics contract closure so active PTRR debugging and docs converge on `BITCODE_*` flags and Bitcode-facing runtime teaching
- `packages/pipelines/asset-pack/{src/preprocess.ts,src/__dev__/bringup-demo.ts,src/__tests__/metrics-output.test.ts,src/agents/setup/asset-pack-setup-plan-agent.ts,src/agents/finish/asset-pack-finish-create-pull-request-delivery-agent.ts}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate AssetPack pipeline closure so active bring-up, default branch naming, and LLM env contracts read as Bitcode instead of their old-brand predecessors
- `packages/parsing/src/parsing.ts`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate parsing/runtime closure so prompt logging obeys the Bitcode env/debug contract
- `packages/vercel/{src/index.ts,README.md}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate retained package fixture/doc closure so Bitcode-facing ChatGPT App and Vercel fixture surfaces no longer present old-brand team/org/product strings
- `packages/external-apps/chatgpt/{src/{tools.ts,server.ts,__tests__/{tools.test.ts,yapperFlow.test.ts}},README.md,DEMO.md,TLDR.md}`
  test coverage:
  `packages/external-apps/chatgpt/src/__tests__/{tools.test.ts,yapperFlow.test.ts}`
  proof surface:
  fifth-gate ChatGPT App interface-parity closure so GitHub/AWS/Vercel writes reject unconfirmed tool payloads, declare schema-level confirmation requirements, accept only `confirmed: true`, return target-bound `writeAdmission` receipts including GitHub repository delivery, and remain connected-interface delivery mechanisms over Bitcode source-to-shares work rather than owning Exchange state
- `packages/generic-tools/{repository-setup/package.json,repository-setup/src/index.ts,simple-system-text-search/src/index.ts,simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts,files-maintaining/src/index.ts,git-interactor/src/index.ts}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate retained tool-package closure so active package metadata and doc-code teaching no longer present old-brand product identity, and so grep-backed search is admitted only as Bitcode repository-evidence support rather than broad codebase intelligence
- `packages/generic-agents/text-searcher/{package.json,README.md,src/index.ts,src/prompts/*}`
  test coverage:
  `protocol-demonstration/test/v26-text-searcher-agent-compatibility.test.js`
  proof surface:
  fifth-gate retained agent-package closure so the old text-searcher corridor is admitted only as Bitcode repository-evidence search support with canonical aliases, V26 prompt metadata, and evidence-only source-grounding semantics
- `packages/generic-agents/web-researcher/{package.json,README.md,src/index.*,src/schemas.*,src/prompts/*,src/__tests__/*}` plus `packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_*`
  test coverage:
  `protocol-demonstration/test/v26-web-researcher-agent-compatibility.test.js`
  proof surface:
  fifth-gate retained agent-package closure so the old web-researcher corridor is admitted only as Bitcode discovery-phase read-synthesis web research with canonical aliases, V26 prompt metadata, TS/JS package-runtime and PromptPart carry-through, source-attributed schemas, local compatibility tests, and auxiliary source-context semantics
- `packages/generic-agents/web-search/{package.json,README.md,src/index.*,src/prompts/*}`, `packages/generic-tools/web-search/{README.md,src/index.*,src/prompts/*}`, and `packages/prompts/src/raw_promptparts/specific/{promptpart_specific_agent_websearch_*,promptpart_specific_agent_web_search_*,promptpart_specific_tool_websearch_*,promptpart_specific_tool_getcontents_*,promptpart_specific_tool_multiprovidersearch_*,promptpart_specific_tool_websearchtool_*}`
  test coverage:
  `protocol-demonstration/test/v26-web-search-support-compatibility.test.js`
  proof surface:
  fifth-gate retained lower-level search-tool closure so old web-search compatibility carriers are admitted only as source-attributed discovery-phase read-synthesis evidence support with V26 prompt metadata, DocCode tool prompt injection, TS/JS PromptPart carry-through, source-quality/volatility/proof-boundary wording, and canonical `bitcodeReadSynthesisWebSearch` ownership
- `uapi/{config/features.ts,app/hero-client.tsx,app/(root)/components/MarketingScreenshotSection.tsx,styles/conversations.css,styles/orbital.css,components/base/bitcode/layout/footer.tsx,app/fill-gaps.tsx,tests/footerPublicShell.test.tsx}`
  test coverage:
  `uapi/tests/footerPublicShell.test.tsx`, targeted `next lint`, and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate active front-end runtime closure so live globals, animation identifiers, CSS selectors, and public outbound references no longer carry unreplaced old-brand product naming or social-handle residue
- `packages/{conversations-generics/src/agent/ConversationAgent.ts,lsp/src/index.ts,files/src/securityUtils.ts,generic-llms/src/providers/{google.ts,openai.ts,anthropic.ts},generic-llms/tests/unit/registry.test.ts,web-search/src/orchestrator.ts} + uapi/hooks/useConversationStream.ts`
  test coverage:
  `packages/generic-llms/tests/unit/registry.test.ts` and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate shared-runtime identity closure so inherited conversational agents, repo-root helpers, LLM mock gating, and search reservation globals converge on Bitcode-facing naming and env contracts
- `packages/{api/src/routes/user.ts,doc-code/jest.config.cjs,doc-code/__mocks__/protocol-demonstration-tools-generics.ts,generic-doc-comment-plugins/doc-developing/package.json,supabase/src/{index.js,streams.js}} + uapi/{app/executions/hooks/usePersistedState.ts,hooks/usePatternRecognition.ts,mocking/generators/ComprehensiveMockDataGenerators.ts}`
  test coverage:
  `uapi/tests/{apiKeysRoutes,mcpSmoke}.test.ts`, targeted `next lint`, and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate runtime-contract closure so active API-key prefixes, persisted browser-storage keys, pattern-learning keys, mock API-key fixtures, doc-code harness mocks, and shipped Supabase JS artifacts all converge on Bitcode naming instead of carrying silent old-brand residue
- `protocol-demonstration/{src/bitcode-demo.js,src/attestation-model.js,data/state.json,test/core.test.js}`
  test coverage:
  `protocol-demonstration/test/{core.test.js,v26-active-product-naming.test.js}`
  proof surface:
  fifth-gate Bitcode-core identity closure so shipped attestation kinds, policy release ids, system-principal classes, provenance seeds, and retained state-store payloads no longer carry `engi-*` runtime truth inside the promoted Bitcode core
- `protocol-demonstration/{src/canonical/read-measurement.js,src/canonical/run-artifacts.js,src/canonical/v24-local-executors.js,src/canonical/v24-remote-adapters.js,src/canonical/v24-external-realization.js,test/core.test.js,test/api.test.js,test/workflow.integration.test.js}`
  test coverage:
  `protocol-demonstration/test/{api.test.js,core.test.js,workflow.integration.test.js,v26-active-product-naming.test.js}`
  proof surface:
  fifth-gate external-realization and read-materialization contract closure so active env controls, local executor schemes, GitHub sample bindings, read artifacts, and Bitcode-core sample branch/runtime refs converge on `BITCODE_V24_*`, `bitcode-local://*`, Bitcode-owned refs, and `BITCODE_READ.md` instead of preserving pre-Bitcode env ids, legacy read filenames, or old-brand active protocol examples inside promoted runtime and proof carriers
- `{Makefile,docs/api/conversations-openapi.yaml,packages/email/README.md,uapi/.env.example,internal-docs/{BITCODE_AUXILLARIES_READINESS,BITCODE_FRONTEND_ARCHITECTURE,BITCODE_EXCHANGE_DATABASE}.md,.ai/PRODUCT.md}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`, `scripts/check-bitcode-spec-family.mjs`, `scripts/check-bitcode-canonical-inputs.mjs`, and `scripts/generate-bitcode-proven.mjs`
  proof surface:
  fifth-gate helper/documentation closure so root helpers, OpenAPI metadata, onboarding docs, internal architecture guides, and package usage examples teach Bitcode/auxillaries/current V26 onboarding and app posture instead of preserving old-brand, compatibility-route, or V26 wording in active proof-bearing carriers
- `{package.json,pnpm-lock.yaml,.eslintrc.cjs,scripts/start-bitcode-mcp.sh,packages/eslint-plugin-bitcode/*}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate workspace/package-path closure so the root monorepo id, workspace lock links, root ESLint plugin/rule namespace, MCP launcher script path, runtime log flag, and lint-plugin package/docs all converge on Bitcode naming instead of preserving old script paths or old plugin package ids in active filesystem and package carriers
- `{PRODUCT.md,internal-docs/{BITCODE_TERMINAL_OPERATOR_EXPERIENCE,INTEGRATIONS,BITCODE_CONVERSATIONS,BITCODE_API}.md,scripts/phase2-complete.sh}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate product/integration documentation closure so top-level product teaching, codeless-customer framing, conversations/API/integration docs, and operator scripts all use Bitcode naming, Bitcode-owned sample orgs/buckets, current share symbols, and repo-relative script paths instead of preserving old-brand product claims or hard-coded historical repo locations
- `{internal-docs/{BITCODE_CONNECTED_SERVICES,DOC-CODING,BITCODE_PROMPT_SYSTEM}.md,packages/executions-mcp/src/mcp-server/src/types/index.ts,packages/orm/src/types/database.generated.ts}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate prompt/example/runtime-path closure so internal prompt docs, integration notes, MCP repository-context examples, and generated ORM type output all use Bitcode-owned identities and repo-root examples instead of preserving old mock-route names, old branded prompt constants, stale repo paths, or stray generator banner text in active proof-bearing carriers
- `{packages/executions-mcp/src/mcp-server/{docs/public/{mcp-overview,mcp-api-reference}.md,src/docs/{mcp-spec-generator,openapi-generator}.ts,deployment/kubernetes/deployment.yaml},packages/security/README.md,packages/testing/src/prompt-quality-framework/README.md,packages/web-search/README.md}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate MCP/security/testing/web-search public-carrier closure so shipped MCP guides, generator examples, Kubernetes deployment specs, support addresses, testing-framework docs, and web-search setup instructions all use Bitcode-owned extension ids, webhook paths, deployment namespaces, action/image refs, documentation links, and repo clone paths instead of preserving `engi.*`, `engi/mcp-*`, `security@engi.com`, `docs.engi.ai`, or `github.com/engi/engi` in active operator/public teaching
- `{protocol-demonstration/src/receipt-schemas.js,protocol-demonstration/test/{v20-quality-fixture,contract-change-ledger,e2e}.js,.github/workflows/web-search-production.yml,scripts/user_deletion_function_with_cascading_cleanup.sql}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate protocol/workflow residue closure so preserved protocol schema URIs, quality-fixture generator ids, historical promotion-test commands, Playwright tempdir seeds, web-search deployment domains, and operator-email examples all converge on Bitcode naming and protocol-demonstration ownership instead of preserving `engi.software`, `engi-demo`, `promote-engi-canon`, `generate-engi-proven`, `staging.engi.com`, `engi.com`, or `@engi.software` in active runtime-adjacent carriers
- `{internal-docs/{TERMINOLOGY,BITCODE_ARCHITECTURE_PATTERNS,PERFORMANCE,BITCODE_VERIFICATION,BITCODE_PROTOCOL_THESIS}.md,uapi/ARCHITECTURE.md}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate terminology/architecture documentation closure so active terminology, patterns, performance, testing, philosophy, and UAPI architecture guides all teach Bitcode and auxillary-facing architecture instead of preserving Engi-branded headings, repo descriptions, or orbital wording in live implementation guidance
- `protocol-demonstration/{SCRIPT,SCRIPT_SHORT,SPEC_V6_GAP_ANALYSIS,SPEC_V6_COVERAGE_MATRIX,ARCHITECTURE_MAP}.md`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate proof-teaching demo-document closure so active Bitcode demo scripts, gap-analysis guidance, and architecture-map docs teach Bitcode-owned demo identity, Bitcode branch CTAs, current API route names, and Bitcode package lineage instead of preserving `ENGI`, `Make ENGI branch`, `make-engi-branch`, or `engi-demo/` in still-active operator and reviewer materials
- `protocol-demonstration/src/{bitcode-core,ranking-explainer,benchmark-model,seed,policy-release,server-ranking,attestation-model}.js`, `protocol-demonstration/src/canonical/{surfaces,v20-quality,v23-bitcoin}.js`, and `protocol-demonstration/ARCHITECTURE_MAP.md`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate Bitcode-core primitive ownership closure so the shared core owner, telemetry namespaces, policy ids, seeded org ids, executor-class ids, architecture-map paths, and `bitcode-system:*` principal refs all converge on Bitcode naming instead of preserving `engi-core.js`, `engi.*`, `engi-policy-*`, `engi-demo.*`, or `engi-system:*` in active runtime truth
- `{protocol-demonstration/src/{demo-scenario,canonical/v23-bitcoin-demonstration-service,canonical/v20-quality}.js,README.md,packages/{observability,time}/README.md,packages/tools-generics/src/{Tool,doc-code-tool/index}.ts}`
  test coverage:
  `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate protocol/demo telemetry and root-artifact teaching closure so active telemetry ids, stubbed bitcoin carrier ids/examples, operator transcript appendix references, root repository-map artifact names, and shared package comments/docs all converge on Bitcode naming instead of preserving `engi.*`, `tb1qengi*`, `lnbcrt1engi*`, `make ENGI branch`, `ENGI_SPEC_V20_PROVEN.md`, `.engi/*`, or `ENGI platform` in live runtime and operator-facing teaching
- `{packages/{google-analytics,tech-types,sentry,kubernetes,logger,orm,streams}/README.md,packages/orm/src/index.ts,scripts/code-review/{README.md,base-review.sh},protocol-demonstration/test/{v20-quality-summary,v20-operator-transcript}.test.js}`
  test coverage:
  `protocol-demonstration/test/{v20-quality-summary,v20-operator-transcript,v26-active-product-naming}.test.js`
  proof surface:
  fifth-gate package-readme and V20 quality-proof carry-through closure so active package docs, ORM entry comments, review-framework carriers, and V20 quality/acceptance tests all converge on Bitcode-owned platform wording, explicit read-measurement grounding for `tech-types`, and the historically correct `_legacy/ENGI_SPEC_V20_PROVEN.md` appendix path rather than preserving `ENGI platform`, `ENGI ORM`, `ENGI CODE REVIEW FRAMEWORK`, or stale generated-appendix names in active docs and proof-bearing tests
- `packages/digest/{caching/index.ts,caching/__tests__/caching.test.ts,run/digest.ts,run/__tests__/generateDigest.test.ts,jest.config.cjs,tsconfig.test.json,__mocks__/protocol-demonstration/logger.ts,__mocks__/lib/git/git.ts,service/README.md}`
  test coverage:
  `packages/digest/caching/__tests__/caching.test.ts`, `packages/digest/run/__tests__/generateDigest.test.ts`, and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate digest runtime-path closure so cache roots, digest output dirs, clone dirs, logger mock paths, and service docs all converge on `/tmp/protocol-demonstration/*` and canonical Bitcode mock ownership instead of preserving `/tmp/engi/*` or `__mocks__/engi/*` in active runtime and test carriers
- `{uapi/app/conversations/{ConversationsRouteClient.tsx,README.md},uapi/app/conversations/components/{ConversationsOverlay.tsx,ConversationsEnhancedRichTextInput.tsx,ConversationsList.tsx,ConversationsSidebarLogs.tsx},uapi/app/api/conversations/_shared.ts,uapi/tests/{conversationsRouteClient,conversationMockShared}.test.ts*}`
  test coverage:
  `uapi/tests/{conversationsRouteClient,conversationMockShared}.test.ts*` and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate conversations write-surface closure so the Bitcode Terminal fullscreen route, mock stream carrier, rich-input labels, and execution-log selectors now teach source attachments, asset packs, output destinations, and canonical `agentic-execution:*` posture while preserving retained deliverable/measure primitives as the compatibility substrate
- `{packages/api/src/routes/conversations.ts,packages/api/src/conversations/{messages.ts,attachments.ts},uapi/tests/{api/conversationThreadStreamRoute.test.ts,api/chatStreamRoute.test.ts,conversationMessages.test.ts}}`
  test coverage:
  `uapi/tests/api/conversationThreadStreamRoute.test.ts`, `uapi/tests/api/chatStreamRoute.test.ts`, and `uapi/tests/conversationMessages.test.ts`
  proof surface:
  fifth-gate non-mock conversations write-path closure so the App Router conversation stream carriers now resolve or create conversations, persist user writes, bind structured-token attachments through retained message primitives, and start canonical agentic-execution rows with normalized `rich_input` evidence for source attachments, output destinations, asset-pack references, and Read-measurement intent on the preserved execution substrate instead of failing closed at `501`
- `{packages/api/src/{routes/conversations.ts,conversations/conversations.ts},uapi/app/api/conversations/[conversationId]/route.ts,uapi/hooks/{useConversationPages.ts,useConversationStream.ts},uapi/app/conversations/components/{ConversationsOverlay.tsx,hooks/useChatState.ts},uapi/tests/{api/conversationsRouteRead.test.ts,useConversationStream.firstWrite.test.ts}}`
  test coverage:
  `uapi/tests/api/conversationsRouteRead.test.ts` and `uapi/tests/useConversationStream.firstWrite.test.ts`
  proof surface:
  fifth-gate persisted-conversation overlay closure so the Bitcode Terminal fullscreen write surface now bootstraps first write through the root conversation stream, promotes draft chat ids into persisted conversation ids from the streamed `message_complete` envelope, hydrates its history rail from `/api/conversations` with counts and last-message previews, and reads selected conversation detail through `/api/conversations/[conversationId]` instead of remaining a local-storage-only compatibility shell
- `{uapi/app/conversations/components/{ConversationsEnhancedRichTextInput.tsx,ConversationsOverlay.tsx,conversation-chat-mapping.ts},uapi/tests/{conversationsEnhancedRichTextInput.test.tsx,conversationsOverlayMapping.test.ts}}`
  test coverage:
  `uapi/tests/conversationsEnhancedRichTextInput.test.tsx` and `uapi/tests/conversationsOverlayMapping.test.ts`
  proof surface:
  fifth-gate conversations destination-roundtrip closure so Bitcode Terminal rich input now serializes `!` selections as canonical output-destination tokens, persisted conversation detail rehydrates source/destination/execution attachments back into chat tokens for stable reread, and execution follow-through from the fullscreen overlay points back into the Bitcode activity ledger at `/terminal` rather than teaching the retained `/executions` peer surface as the primary destination
- `{uapi/app/terminal/{TerminalPageClient.tsx,TerminalCommandDeck.tsx,TerminalDepositComposer.tsx,TerminalClosureControlDeck.tsx,TerminalTransactionWorkspace.tsx,TerminalTransactionDetailSurface.tsx,terminal-activity-history.ts},uapi/tests/terminalActivityHistory.test.ts}`
  test coverage:
  `uapi/tests/terminalActivityHistory.test.ts`
  proof surface:
  fifth-gate terminal write-through closure so Bitcode Terminal command, deposit, closure, and selected-detail actions now record canonical Bitcode activity rows into retained execution history, immediately select those rows back into `/terminal`, and teach the terminal ledger as the reread surface instead of leaving protocol writes trapped in preserved shell controls or separate execution routes
- `{uapi/app/terminal/{TerminalPageClient.tsx,TerminalDepositReadWorkbench.tsx,TerminalReadScenarioPanel.tsx,TerminalSupplySelectionPanel.tsx,TerminalActionWorkbenchCard.tsx,terminal-activity-history.ts},uapi/tests/terminalActivityHistory.test.ts}`
  test coverage:
  `uapi/tests/terminalActivityHistory.test.ts`
  proof surface:
  fifth-gate deposit-read workbench closure so Bitcode Terminal deposit-side selection, active read measurement, and fit/settlement posture can all be explicitly recorded back into the same Bitcode activity ledger, keeping repository/supply/read/fit decision boundaries on the protocol-owned write/read path rather than leaving them as preserved-shell-only state
- `{uapi/app/terminal/{TerminalPageClient.tsx,TerminalRepositoryContextPanel.tsx,TerminalExternalInterfacingPanel.tsx,terminal-activity-history.ts},uapi/tests/terminalActivityHistory.test.ts}`
  test coverage:
  `uapi/tests/terminalActivityHistory.test.ts`
  proof surface:
  fifth-gate repository-anchor and boundary-readiness closure so the Bitcode Terminal panels that establish repository supply anchoring and external-interface honesty can now be recorded into the same Bitcode activity ledger as the rest of the write surfaces, instead of remaining read-only orientation panels outside the protocol-owned reread path
- `{uapi/lib/bitcode-transaction-readiness.ts,uapi/app/terminal/{TerminalPageClient.tsx,TerminalCommandDeck.tsx,TerminalClosureControlDeck.tsx,TerminalDepositComposer.tsx,TerminalFlowGuideCard.tsx,terminal-flow-guide.ts},uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx,uapi/tests/{bitcodeTransactionReadiness.test.ts,terminalFlowGuide.test.ts}}`
  test coverage:
  `uapi/tests/bitcodeTransactionReadiness.test.ts` and `uapi/tests/terminalFlowGuide.test.ts`
  proof surface:
  fifth-gate transactional-readiness closure so wallet identity in `Profile`, verified wallet-provider signing access, repository scope in `Connects`, and a selected repository anchor in the Bitcode Terminal now resolve through one shared review-only-vs-transactable contract, with deposit/branch/closure-bearing actions failing closed on that contract while read/review continuity remains available and signed settlement remains staged until verified signing is present
- `{packages/orm/src/{profile-contract.ts,models/user-profiles.ts},packages/api/src/routes/{auxillaries.ts,user.ts,auth.ts},uapi/app/api/auxillaries/profile/route.ts,uapi/app/auxillaries/components/{AuxillariesSurface.tsx,AuxillariesProfilePane.tsx,AuxillariesBTDPane.tsx},uapi/hooks/useUserData.ts,uapi/tests/{userProfileRoute.test.ts,userDataRoute.test.ts}}`
  test coverage:
  `uapi/tests/userProfileRoute.test.ts` and `uapi/tests/userDataRoute.test.ts`
  proof surface:
  fifth-gate profile-wallet-binding persistence closure so Profile-owned wallet identity, organization/profile extras, and auxillary reread now persist through `user_profiles.settings.bitcodeProfile`, the active auxillary/profile routes read `user_profiles` by its real `id` key instead of stale `user_id` drift, hydrated compatibility fields reread that one Exchange-owned settings carrier back into the Bitcode Terminal, `Connects`, and `$BTD`, and active wallet status no longer collapses manual identity and verified signing into the same fake `bound` posture
- `{uapi/components/base/bitcode/execution/BitcodeInlineExplainer.tsx,uapi/app/terminal/{terminal-workspace-explainers.ts,TerminalExperienceFrame.tsx,TerminalCommandDeck.tsx,TerminalRepositoryContextPanel.tsx,TerminalSupplySelectionPanel.tsx,TerminalReadScenarioPanel.tsx,TerminalDepositComposer.tsx,TerminalClosureControlDeck.tsx},uapi/tests/{terminalSurfaceCopy.test.ts,bitcodeInlineExplainer.test.tsx}}`
  test coverage:
  `uapi/tests/terminalSurfaceCopy.test.ts` and `uapi/tests/bitcodeInlineExplainer.test.tsx`
  proof surface:
  fifth-gate operator-guidance adjacency closure so the Bitcode Terminal now carries protocol-demonstration-style field- and action-adjacent explainers for read/write posture, repository anchoring, supply selection, read measurement, readiness, deposit provenance, and closure follow-through, with `Current source` and `Current canon` references preserved directly in the inline help contract
- `{uapi/app/terminal/{TerminalPageClient.tsx,TerminalTransactionWorkspace.tsx,terminal-transaction-source.ts,terminal-protocol-projection.ts,terminal-run-data.ts},uapi/tests/{terminalTransactionSource.test.ts,terminalProtocolProjection.test.ts}}`
  test coverage:
  `uapi/tests/terminalTransactionSource.test.ts` and `uapi/tests/terminalProtocolProjection.test.ts`
  proof surface:
  fifth-gate protocol-ledger state-unification closure so the Bitcode Terminal central ledger can project live protocol posture into the same searchable master-detail activity window, suppress review-fallback collapse when protocol state is present, and carry a projected-detail snapshot on protocol rows so selected detail keeps repository/deposit/read/fit/supply posture even before retained execution-history persistence catches up
- `{protocol-demonstration/{server.js,src/{bitcode-demo.js,bitcode-runtime.js,index.d.ts},test/v26-read-review-source-to-shares.test.js},uapi/{app/api/{read-review,state,make-bitcode-branch}/route.ts,app/terminal/TerminalReadScenarioPanel.tsx,lib/bitcode-app-context.ts,tests/api/{readReviewRoute.test.ts,readReviewProtocolParity.test.ts}}}`
  test coverage:
  `node --test protocol-demonstration/test/v26-read-review-source-to-shares.test.js`, `uapi/tests/api/{readReviewRoute.test.ts,readReviewProtocolParity.test.ts}`, and `pnpm exec tsc --noEmit --pretty false --project tsconfig.json` from `uapi`
  proof surface:
  fifth-gate pre-fit Read-review API/control closure so the protocol runtime can present a measured source-to-shares Read before fit search, app-owned `/api/read-review` can record accept/reject/remeasure-with-feedback decisions, explicit non-accept decisions fail closed before branch materialization, accepted `/api/make-bitcode-branch` responses carry source-to-shares artifacts plus present-fit settlement and quantized fit-quality receipt evidence, `/api/state?principal=buyer` rereads the accepted Read-review plus source-to-shares settlement posture from app-owned state after branch materialization without exposing raw private branch files, the generated source-to-shares proof now checks those state-route test assertions directly rather than treating file presence as sufficient, the commercial route boundary is parity-tested against the protocol implementation, and the Bitcode Terminal exposes the same review boundary from native read-scenario controls rather than leaving review admission as artifact-only proof
- `{uapi/app/terminal/{TerminalClosureNativeSections.tsx,terminal-closure-state.ts,terminal-transaction-detail-snapshot.ts,terminal-activity-history.ts},uapi/tests/{terminalClosureState.test.ts,terminalTransactionDetailSnapshot.test.ts,terminalActivityHistory.test.ts}}`
  test coverage:
  `uapi/tests/{terminalClosureState.test.ts,terminalTransactionDetailSnapshot.test.ts,terminalActivityHistory.test.ts}`
  proof surface:
  fifth-gate Terminal package/interface PARITY closure for source-to-shares reads so native closure panels normalize Read-review admission, present-fit settlement review, objective-contract rows, source-to-shares refs, fit-quality hashes, fit-quality detail rows, proof-family posture, and selected-detail persistence as one use-share read model; `.bitcode/source-to-shares-fifth-gate-proof.json` now includes source-content checks over these Terminal read assertions rather than accepting file presence alone
- `{uapi/app/terminal/{TerminalCommandDeck.tsx,TerminalClosureControlDeck.tsx,TerminalTransactionDetailSurface.tsx,terminal-activity-history.ts,terminal-transaction-detail-snapshot.ts,terminal-transaction-detail.ts},uapi/tests/{terminalActivityHistory.test.ts,terminalTransactionDetailSnapshot.test.ts,terminalTransactionDetail.test.ts}}`
  test coverage:
  `uapi/tests/terminalActivityHistory.test.ts`, `uapi/tests/terminalTransactionDetailSnapshot.test.ts`, and `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  fifth-gate closure-follow-through persistence closure so branch/closure/detail-triggered Bitcode writes now persist settlement metrics, branch artifacts, proof families, and recent history into Finish `assetPackCompletion` payloads, allowing the Bitcode Terminal selected-detail surface to reread closure posture from saved activity rows instead of depending on a still-live shell snapshot
- `{packages/api/src/{executions/agentic-execution.ts,conversations/streaming.ts,routes/{auth.ts,shippables.ts}},packages/vcs/src/service.ts,uapi/{hooks/useConversationStream.ts,types/{next-server-compat.d.ts,supabase-js-compat.d.ts},tsconfig.json},uapi/tests/{useConversationStream.firstWrite.test.ts,api/{chatStreamRoute.test.ts,conversationThreadStreamRoute.test.ts}}}`
  test coverage:
  `uapi/tests/useConversationStream.firstWrite.test.ts`, `uapi/tests/api/chatStreamRoute.test.ts`, and `uapi/tests/api/conversationThreadStreamRoute.test.ts`
  proof surface:
  fifth-gate active-source compile-health closure for the live Bitcode stream/auth/AssetPack corridor so canonical execution typing, SSE tracking, retained route handlers, and VCS service wiring now compile through the active `uapi` program instead of remaining blocked on old Next-host assumptions, schema drift, or downlevel iteration mismatches
- `{packages/api/src/routes/shippables.ts,packages/pipelines/asset-pack/src/agents/{design/iterate-product-md-agent.ts,digest/capture-learnings-agent.ts,validation/asset-pack-ready-to-instruct-agent.ts}}`
  test coverage:
  `pnpm exec tsc --noEmit --pretty false --project tsconfig.json` from `uapi`, plus `node --check` on the mirrored JavaScript carriers
  proof surface:
  fifth-gate prompt-carrier and failure-telemetry compile-health closure so design/digest/validation PTRR agents now provide explicit Bitcode `Prompt` / `PromptPart` system and step registries, and active Shippable route failure telemetry keeps semantic `read`, `writtenAssetType`, and `assetPack` context available across catch paths
- `{packages/api/src/conversations/{attachments.ts,conversations.ts},uapi/components/base/bitcode/{execution/{github-selectors.tsx,pipeline-execution-log.tsx,TagOverflowList.tsx},icons/LogoIcon.tsx,typing-animation.tsx,layout/{nav.tsx,sidebars/left-sidebar.tsx}},uapi/config/features.ts,uapi/tests/{navPublicShell.test.tsx,navWorkspaceChrome.test.tsx}}`
  test coverage:
  `uapi/tests/navPublicShell.test.tsx` and `uapi/tests/navWorkspaceChrome.test.tsx`
  proof surface:
  fifth-gate active-source shell and conversation-helper compile-health closure so live conversation persistence helpers, GitHub execution selectors, execution-log rendering, shell feature-flag aliases, and core Bitcode shell components now typecheck cleanly under the active `uapi` program instead of remaining blocked on implicit-any residue, missing selector bindings, or shell-prop mismatches
- `{packages/api/src/vcs/github-service.ts,packages/artifacts/src/artifacts.ts,packages/browser-storage/src/{persisted-state.ts,storage-manager.ts},uapi/types/{supabase-js-compat.d.ts,react-compat.d.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the repository-scope VCS, artifact-storage, and browser-storage corridor
  proof surface:
  fifth-gate repository-scope compile-health closure so active GitHub repository service wiring, artifact storage fallback persistence, and browser-storage synchronization helpers now typecheck cleanly under the active `uapi` program instead of remaining blocked on optional-token narrowing, missing Supabase storage typing, or DOM/react compatibility drift
- `{packages/generic-tools/vcs/src/index.ts}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained repository-scope VCS tool package
  proof surface:
  fifth-gate retained VCS tool-package compile-health closure so repository listing, pull-request, issue, comment, branch, and file helpers now resolve through the actual async Supabase/VCS connection abstractions instead of remaining blocked on stale connection-manager methods, stale connection shape assumptions, or `Tool.use` contract drift
- `{packages/prompts/src/{index.ts,raw_promptparts/**/*},packages/executions-mcp/{src/index.ts,README.md},packages/pipelines/asset-pack/src/agents/setup/initialize-mcps-tools-agent.ts}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the prompt-space and MCP primitive corridor
  proof surface:
  fifth-gate prompt-and-execution primitive compile-health closure so the raw promptpart reservoir no longer compiles as a duplicate-import global-script swarm, live execution/pipeline prompt classes no longer route through the retained prompt barrel, and the retained `@bitcode/mcp` primitive no longer drags an unnecessary schema dependency into the active compile path, keeping prompt-system explicitness and MCP config normalization admissible as Bitcode-owned primitives
- `{packages/execution-generics/src/{index.ts,executors/conditional_executor.ts},packages/agent-generics/src/index.ts,packages/pipelines-generics/src/{index.ts,phases/phase-factory.ts,phases/sdivf-factory.ts,gate-system/meta-phase-orchestrator.ts},packages/pipelines/asset-pack/package.json,packages/executions-mcp/src/mcp-server/{src/index.ts,package.json},packages/prompts/src/raw_promptparts/specific/promptpart_specific_pipeline_deliverable_purpose_corestatement.ts}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the execution-core package corridor
  proof surface:
  fifth-gate execution primitive/reference admissibility closure so canonical Bitcode execution primitives remain teachable reusable infrastructure, while retained SDIVF/PTRR/meta-phase and AssetPack compatibility families are explicitly contained as reference orchestration instead of being narrated as the live Bitcode product implementation
- `{packages/executions-mcp/{README.md,src/mcp-server/{README.md,src/{index.ts,server.ts,types/index.ts,pipeline-execution/adapter.ts},docs/{public/mcp-overview.md,openapi/bitcode-mcp-openapi.json},package.json}}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the MCP interface corridor
  proof surface:
  fifth-gate MCP interface-precision closure so primitive `@bitcode/mcp` utilities stay distinct from the Bitcode Exchange-facing MCP server, the active docs/source carriers teach `Bitcode Protocol` / `Bitcode Exchange` / `Bitcode Terminal` as one canonical hierarchy, third-party MCPs plus repository/provider connections and attachments are modeled as ingress/input context, and retained compatibility outputs are normalized toward Bitcode asset-pack meaning instead of remaining generic egress
- `{packages/executions-mcp/src/mcp-server/src/{types/index.ts,tools/pipeline-tools.ts,pipeline-execution/adapter.ts,__tests__/unit/pipeline-ingress-contract.test.ts}}`
  test coverage:
  `packages/executions-mcp/src/mcp-server/src/__tests__/unit/pipeline-ingress-contract.test.ts`
  proof surface:
  fifth-gate Bitcode MCP write-acceptance closure so the live AssetPack tool schema admits explicit repository/provider connection ingress, third-party MCP repository and attachment context is proven as input-only ingress, queued and completed MCP responses preserve normalized `interfaceSurface` plus `inputContext`, accepted writes return and queue an explicit `writeAdmission` receipt, and output meaning stays asset-pack-normalized at the active tool boundary rather than only in notes or retained execution metadata
- `{packages/executions-mcp/src/mcp-server/src/{prompts/{workflow-prompts,development-prompts}.ts,tools/pipeline-tools.ts,__tests__/unit/prompt-asset-pack-canon.test.ts}}`
  test coverage:
  `packages/executions-mcp/src/mcp-server/src/__tests__/unit/prompt-asset-pack-canon.test.ts`
  proof surface:
  fifth-gate Bitcode MCP prompt-canon closure so rendered workflow/development prompts and the compatibility-mounted pipeline tool description teach Bitcode asset-pack pipeline execution over source-to-shares needs, keep `bitcode://pipelines/asset-pack/create` plus subtype names as compatibility surfaces, and prevent old output-pipeline wording from remaining active MCP canon
- `{uapi/app/api/webhook/{route,verify}.ts,uapi/tests/{webhookRoute.test.ts,api/webhookSignature.test.ts}}`
  test coverage:
  `uapi/tests/webhookRoute.test.ts` and `uapi/tests/api/webhookSignature.test.ts`
  proof surface:
  fifth-gate webhook-ingress closure so GitHub labels and `@bitcode-*` comments schedule asset-pack pipeline automation as ingress-only Bitcode activity, emit `Trigger Asset-Pack Pipeline` telemetry with `github_webhook` ingress and `asset_packs` output meaning, and use `bitcode-asset-pack-trigger` as the active command
- `uapi/hooks/useExecutionState.{ts,js}`
  test coverage:
  generated source-content proof plus active UAPI execution route tests
  proof surface:
  fifth-gate client execution-hook closure so the active execution caller teaches Bitcode AssetPack pipeline submission, uses canonical `definitionOfRead` input-key naming, and carries the same debug semantics in the tracked JavaScript mirror
- `{uapi/app/terminal/{TerminalCommandDeck.tsx,TerminalClosureControlDeck.tsx,TerminalTransactionDetailSurface.tsx,terminal-activity-history.ts,terminal-transaction-detail-snapshot.ts,terminal-transaction-detail.ts},uapi/tests/{terminalActivityHistory.test.ts,terminalTransactionDetailSnapshot.test.ts,terminalTransactionDetail.test.ts}}`
  test coverage:
  `uapi/tests/terminalActivityHistory.test.ts`, `uapi/tests/terminalTransactionDetailSnapshot.test.ts`, and `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  fifth-gate persisted-closure-panel reread closure so the Bitcode Terminal selected-detail surface can reconstruct verification, branch, settlement, and ledger panels from persisted activity rows when live shell state is absent, reducing the split between runtime shell truth and saved activity truth
- `{uapi/app/terminal/{TerminalTransactionActivitySurface.tsx,TerminalTransactionDetailSurface.tsx,terminal-activity-history.ts,terminal-transaction-detail-snapshot.ts,terminal-transaction-detail.ts},uapi/tests/{terminalTransactionActivitySurface.test.tsx,terminalActivityHistory.test.ts,terminalTransactionDetailSnapshot.test.ts,terminalTransactionDetail.test.ts}}`
  test coverage:
  `uapi/tests/terminalTransactionActivitySurface.test.tsx`, `uapi/tests/terminalActivityHistory.test.ts`, `uapi/tests/terminalTransactionDetailSnapshot.test.ts`, and `uapi/tests/terminalTransactionDetail.test.ts`
  proof surface:
  fifth-gate persisted-share-use reread closure so saved repository-anchor, deposit, read, fit, and supply-selection posture now survives into selected detail and the Bitcode activity tab when no live execution stream is available, keeping the Bitcode Terminal ledger readable as one state system instead of a shell-plus-ledger split
- `{packages/agent-generics/src/{diagnostics/instrumentation.ts,steps/{failsafe-sequence.ts,thricified-generation.ts},substeps/factories.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained agent-generics diagnostics/failsafe/thricified corridor
  proof surface:
  fifth-gate retained runtime-contract compile-health closure so the active agent-generics corridor no longer preserves duplicate diagnostic-context merges, same-shape `sequential(...)` typing assumptions across heteromorphic generation/failsafe executors, or non-storable `unknown` validation payload writes in the Bitcode execution path
- `{packages/vcs/src/{connections.ts,provider.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained VCS connection/provider corridor
  proof surface:
  fifth-gate retained repository-boundary compile-health closure so VCS connection persistence now normalizes JSON-backed `connection_data` before token/install-id access and writes, legacy installation auth maps back into canonical `VCSAuth`, and the abstract provider base no longer claims interface conformance it does not actually declare
- `{packages/generic-tools/{files-maintaining/src/index.ts,multimodal-processing/src/{MultimodalProcessingTool.ts,processing.ts},repository-setup/src/index.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained generic-tool caller corridor
  proof surface:
  fifth-gate retained caller-contract compile-health closure so file-maintaining uses the canonical pipelines-generics entrypoint, multimodal-processing uses the actual Bitcode `factoryTool` contract plus typed optional Figma context, and repository-setup no longer preserves the half-ported provider/auth shape assumptions that sat above the reusable VCS abstraction layer
- `{packages/generic-tools/{mcps-tools/jira/src/index.ts,multimodal-processing/src/index.ts,use-computer/src/index.ts},packages/pipelines/asset-pack/src/tools/{BitcodeReadMeasurementComputerUseTool.ts,index.ts},packages/api/src/routes/shippables.ts,uapi/app/executions/components/{ExecutionsPageClient.tsx,ExecutionsToggleButtons.tsx},uapi/components/base/bitcode/execution/{toggle-buttons.tsx,execution-option-toggle.tsx}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained Jira/multimodal/use-computer caller corridor
  proof surface:
  fifth-gate retained caller-contract compile-health and reform closure so Jira tool execution no longer preserves nullable connection or optional-started worklog drift, multimodal-processing re-exports only the kept factory-tool surface, shell-execution tools plus the deliverable wrapper use the actual Bitcode `Tool` property contract instead of the older schema-class pattern, use-computer is admitted only as internal Read-measurement evidence behind `BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT`, and old Terminal/API multi-agent plus compute toggles are removed rather than preserved as V26 controls
- `{packages/pipelines/asset-pack/src/{tools/{AssetPackCloneVCSRepositoryTool.ts,AssetPackMultimodalProcessingTool.ts,AssetPackAudioComprehensionTool.ts,AssetPackImageComprehensionTool.ts,AssetPackPDFComprehensionTool.ts,AssetPackVideoComprehensionTool.ts,index.ts},agents/finish/deliver-asset-pack-to-destination-agent.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the Bitcode asset-pack tool wrapper and Finish/Delivering corridor
  proof surface:
  fifth-gate caller-contract compile-health closure so asset-pack tool wrappers now forward through the current single-input Bitcode tool contract, optional validation/Delivering tools no longer leak `undefined` into typed registries, and the Finish agent no longer preserves raw-string prompt-part drift or duplicate-Zod output-schema identity mismatches
- `{packages/pipelines/asset-pack/src/{agents/{implementation/*.ts,setup/asset-pack-comprehend-read-agent.ts},phases/{setup.ts,design.ts,digest.ts,discovery.ts,implementation.ts,index.ts},index.ts,preprocess.ts,postprocess.ts},packages/pipelines-generics/src/{execution/PipelineExecutor.ts,phases/sdivf-factory.ts,streaming/pipeline-stream-integration.ts}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the AssetPack phase/index/setup corridor
  proof surface:
  fifth-gate caller-contract compile-health closure so the AssetPack bring-up path no longer preserves dead declarative phase-runner metadata, unsupported PTRR config keys, wrong discovery-registration aliases, `PipelineExecution` over-narrowing in `createPhaseRunner`, or stale setup-schema default variance where the active AssetPack corridor rereads through the Bitcode pipeline primitives
- `{packages/{generic-agents/vcs/src/index.ts,github/src/providers/github-provider.ts,orm/src/models/{user-btd-transactions.ts,asset-pack-evidence.ts,notifications.ts}}}`
  test coverage:
  filtered `tsc` verification over the active `uapi` program for the retained repository-boundary VCS and ORM persistence corridor
  proof surface:
  fifth-gate retained repository/persistence compile-health closure so the VCS agent layer no longer uses schema values as types, the GitHub provider now emits canonical `VCSCommit.parents` and a synchronous webhook-verification contract, and the active `$BTD` transaction plus AssetPack-evidence/notification ORM carriers no longer preserve implicit-`any` reducers or null-key statistics drift
- `{packages/pipelines/asset-pack/src/__tests__/metrics-output.test.ts,packages/prompts/{README.md,src/{index.ts,formatters/hierarchical.ts}},scripts/{generate-massive-prompt-parts.ts,normalize-asset-pack-promptparts.mjs},uapi/tests/runner.agent.test.ts}`
  test coverage:
  focused source-residue scans over retained non-prompt infrastructure plus active AssetPack prompt scaffolding, followed by package-local type/protocol checks
  proof surface:
  fifth-gate output-noun and phase-residue closure so reusable prompt infrastructure now demonstrates AssetPack PromptPart imports and `pipeline:asset-pack` paths, curated prompt-package root exports use `PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_*` rather than public `DELIVERABLES` aliases, generated prompt scaffolding no longer emits old completion-field names as prompt content, the prompt normalization helper no longer classifies broad pipeline completion by the old phase token, active runner fixtures use `finish` rather than `shipping`, and AssetPack metrics tests only accept canonical `phase_executions` / `step_executions` writes rather than treating removed storage-table aliases as success
- `{packages/pipelines/asset-pack/src/agents/prompts/asset-pack-comprehend-read-agent-prompts.ts,packages/prompts/src/{index.ts,index.d.ts,raw_promptparts/specific/{index.ts,promptpart_specific_agent_assetpacksetupcomprehendread_*}},protocol-demonstration/test/v26-shippable-reform.test.js,protocol-demonstration/V26_SHIPPABLE_REFORM.md}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js` and `pnpm -C packages/pipelines/asset-pack typecheck`
  proof surface:
  fifth-gate prompt-reservoir recut closure for the active AssetPack setup/comprehend-read overlay so live prompt code imports `assetpacksetupcomprehendread` raw PromptParts, the old setup-comprehension file family is removed instead of aliased, superseded `deliverablesetup{comprehendtask,analyzecodebase,familiarizeattachments,preparerepository}` raw PromptPart families and root/barrel exports are removed after semantic mirror closure, the new attachment-evidence refinement PromptPart has TypeScript and runtime JavaScript parity, and the reform note now treats old setup-comprehension PromptPart names as removal targets rather than active module paths
- `{packages/pipelines/asset-pack/src/agents/prompts/{clone-vcs-repository-prompt.ts,asset-pack-vcs-clone-repository-agent-prompts.ts},packages/prompts/src/{index.ts,index.d.ts,raw_promptparts/specific/{index.ts,promptpart_specific_agent_assetpacksetupclonerepository_*,promptpart_specific_agent_assetpackpipeline_clonevcsrepository_*}},protocol-demonstration/test/v26-shippable-reform.test.js,protocol-demonstration/V26_SHIPPABLE_REFORM.md}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js` and `pnpm -C packages/pipelines/asset-pack typecheck`
  proof surface:
  fifth-gate prompt-reservoir recut closure for active AssetPack setup clone-repository prompts so live code imports `assetpacksetupclonerepository` and `assetpackpipeline_clonevcsrepository` raw PromptParts, old `deliverablesetupclonerepository` / `deliverablespipeline_clonevcsrepository` file families are removed instead of aliased, and the runtime clone PromptPart text teaches an AssetPack repository clone tool rather than a deliverables clone tool
- `{packages/pipelines/asset-pack/src/agents/prompts/{danger-wall-prompt.ts,initialize-lsp-prompt.ts,ready-to-iterate-prompt.ts},packages/prompts/src/{index.ts,index.d.ts,raw_promptparts/specific/{index.ts,promptpart_specific_agent_assetpacksetupdangerwall_*,promptpart_specific_agent_assetpacksetupinitializelsp_*,promptpart_specific_agent_assetpacksetupreadytoiterate_*}},protocol-demonstration/test/v26-shippable-reform.test.js,protocol-demonstration/V26_SHIPPABLE_REFORM.md,protocol-demonstration/src/canonical/proven-generator.js}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js` and `pnpm -C packages/pipelines/asset-pack typecheck`
  proof surface:
  fifth-gate prompt-reservoir recut closure for active AssetPack setup safety, LSP evidence, and readiness prompts so live code imports `assetpacksetupdangerwall`, `assetpacksetupinitializelsp`, and `assetpacksetupreadytoiterate` raw PromptParts, old `deliverablesetupdangerwall` / `deliverablesetupinitializelsp` / `deliverablesetupreadytoiterate` file families are removed instead of aliased, canonical proof inventory points at the recut LSP PromptPart path, and setup structured-output PromptParts describe PR Delivering rather than broad shipping
- `{packages/generic-tools/read-comprehension/{README.md,package.json,src/{index.ts,ReadComprehensionToolset.ts,read-comprehension-primitives.ts,read-comprehension-schemas.ts,prompts/index.ts,prompts/*Read*DocCodeToolPrompt.ts}},packages/generic-agents/read-comprehension/{README.md,package.json,src/index.ts},protocol-demonstration/test/{v26-read-comprehension-reform.test.js,v26-prompt-system-boundary.test.js},protocol-demonstration/src/canonical/{proven-generator.js,inference-implementation-records.js}}`
  test coverage:
  `protocol-demonstration/test/v26-read-comprehension-reform.test.js`, `protocol-demonstration/test/v26-prompt-system-boundary.test.js`, and `pnpm -C packages/generic-tools/read-comprehension run build`
  proof surface:
  fifth-gate read-comprehension reform closure so the generic-tool and setup-agent packages now expose only read-first tool, prompt, primitive, schema, and agent owners; removed pre-reform files are absence witnesses rather than compatibility evidence, generated JavaScript remains absent from both `src/` directories, and proof inventories cite the canonical owners instead of deleted wrappers
- `{packages/prompts/src/raw_promptparts/specific/{index.ts,promptpart_specific_pipeline_assetpackrun_*,promptpart_specific_agent_assetpackdiscoveryplanimplementation_*,promptpart_specific_agent_assetpackvalidationreadytofinish_*},scripts/{generate-asset-pack-promptparts.ts,prompt-audit.sh,enrich-doc-intents.mjs},protocol-demonstration/test/v26-shippable-reform.test.js,protocol-demonstration/{V26_SHIPPABLE_REFORM.md,V26_PROMPT_SURFACES.md,V26_INFERENCE_SYSTEMS.md}}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js`
  proof surface:
  fifth-gate pipeline, implementation-planning, type-classification, and validation-ready-to-Finish PromptPart recut closure so active pipeline raw owners use `pipeline_assetpackrun_*`, active implementation-planning raw owners use `agent_assetpackdiscoveryplanimplementation_*`, active readiness validation raw owners use `agent_assetpackvalidationreadytofinish_*`, old `pipeline_deliverable_*`, `agent_deliverablesdiscimplplan_*`, `agent_deliverablesdiscidentifytype_*`, `agent_determinedeliverabletype_*`, misspelled `agent_determinedelieverabletype_*`, pre-validation `agent_readytofinish_*`, and type-keyed Ready-to-Finish file/export families are absence witnesses rather than compatibility aliases, and the written-asset prompt text exposes the single V26 `read-satisfaction-asset-pack` kind while treating pull requests as Finish delivery mechanisms
- `{packages/pipelines/asset-pack/src/agents/prompts/{understand-requirements-prompt.ts,analyze-parallel-prompt.ts,assess-complexity-prompt.ts,plan-implementation-prompt.ts,comprehend-attachments-prompt.ts,select-files-parallel-prompt.ts},packages/prompts/src/raw_promptparts/specific/{index.ts,promptpart_specific_agent_assetpackdiscoveryunderstandrequirements_*,promptpart_specific_agent_assetpackdiscoveryanalyzeparallel_*,promptpart_specific_agent_assetpackdiscoveryassesscomplexity_*,promptpart_specific_agent_assetpackdiscoveryplanimplementation_*,promptpart_specific_agent_assetpackdiscoverycomprehendattachments_*,promptpart_specific_agent_assetpackdiscoveryselectfilesparallel_*},protocol-demonstration/test/v26-shippable-reform.test.js,protocol-demonstration/{V26_SHIPPABLE_REFORM.md,V26_PROMPT_SURFACES.md}}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js` and `pnpm -C packages/pipelines/asset-pack typecheck`
  proof surface:
  fifth-gate discovery PromptPart recut closure so active discovery prompt builders import `assetpackdiscoveryunderstandrequirements`, `assetpackdiscoveryanalyzeparallel`, `assetpackdiscoveryassesscomplexity`, `assetpackdiscoveryplanimplementation`, `assetpackdiscoverycomprehendattachments`, and `assetpackdiscoveryselectfilesparallel` raw owners; old `deliverablediscovery{analyze,analyzeparallel,assesscomplexity,planimplementation,understandrequirements,comprehendattachments,selectfilesparallel}` file/export families are absence witnesses, and the prompt literals teach Read requirements, repository evidence, proof evidence, complexity, Finish readiness, attachment evidence, and AssetPack scope instead of generic modification work
- `{packages/prompts/src/raw_promptparts/specific/{index.ts,promptpart_specific_agent_assetpacksynthesizeartifacts_*,promptpart_specific_agent_assetpackvalidationreadytofinish_*,promptpart_specific_agent_assetpackfinishcreatepullrequestdelivery_*,promptpart_specific_agent_assetpackfinishfinalizedeliveryevidence_*,promptpart_specific_asset_pack_system_ultra_critical_reflection.*},scripts/{normalize-asset-pack-promptparts.mjs,prompt-audit.sh},protocol-demonstration/test/{v26-shippable-reform.test.js,v26-active-product-naming.test.js},protocol-demonstration/{V26_SHIPPABLE_REFORM.md,V26_PROMPT_SURFACES.md}}`
  test coverage:
  `protocol-demonstration/test/v26-shippable-reform.test.js` and `protocol-demonstration/test/v26-active-product-naming.test.js`
  proof surface:
  fifth-gate aggressive PromptPart reservoir cleanup so old `agent_deliverable{impl,implementation,validation}*`, `agent_deliverablesdiscoverycodebaseanalysis_*`, and `deliverables_system_*` raw files/runtime mirrors/barrel exports are removed once AssetPack synthesis, AssetPack discovery, AssetPack validation, and `asset_pack_system` owners exist; non-PR Finish delivery reservoirs (`assetpackfinishsubmitreviewdelivery`, `assetpackfinishcreateissuedelivery`, `assetpackfinishaddissuecommentdelivery`) are cut from V26 prompt audit and raw PromptPart ownership so the active Finish delivery mechanism remains pull-request Shippables only
- `{BITCODE_SPEC_V26_PARITY_MATRIX.md,.bitcode/{fifth-gate-closure-deepening-proof.json,fifth-gate-closure-proof.json,sixth-gate-mvp-closure-proof.json,seventh-gate-commercial-testnet-launch-proof.json,v26-product-readiness-audit.json}}`
  test coverage:
  source review against the formal fifth-gate acceptance rule and generated readiness/closure-axis artifacts
  proof surface:
  current fifth-gate closure queue confirmation, sixth-gate MVP closure proof, and seventh-gate commercial testnet launch proof so accepted closure is explicitly bound to whole Terminal read/write acceptance, conversations/ad hoc parity, transactional readiness runtime proof, persistence runtime acceptance, non-Bitcode reform saturation, proof/promotion closure, MVP product readiness, explicit Terminal map, activity/transactions repeated-operator loop, conversations ChatGPT-style parity, auxillaries readiness, admitted interface convergence, clean architecture, testnet-first launch boundary, wallet/BTC/`$BTD` launch readiness, proof/state reread, connected-interface launch alignment, and retirement of non-Bitcode compatibility explanations; eighth-gate provation remains downstream and cannot be substituted for launch closure evidence

## Module namespace proof note

V26 also now treats the `@bitcode/*` module namespace as part of the active proof surface.
That means:
- new active imports must use `@bitcode/*`,
- new workspace package names must use `@bitcode/*`,
- and lingering older ENGI-scoped or other non-Bitcode module references in active source are parity drift, not harmless style debt.
