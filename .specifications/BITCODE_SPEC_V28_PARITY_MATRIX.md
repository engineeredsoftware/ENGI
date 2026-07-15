# Bitcode Spec V28 Parity Matrix

## Status

- Version: `V28`
- V28 state: canonical promotion complete; V28 parity truth, product-gate audit, generated proof, and promotion automation are aligned
- Current canonical/latest target: `V28`
- Canonical proof-source commit: `1153286d0785b0d760ea392918575f0083cd570f`
- Prior canonical anchor: `BITCODE_SPEC_V27.md`
- Prior generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v28-spec-family-report.json`, `.bitcode/v28-canonical-input-report.json`, `.bitcode/v28-canon-posture-drift-report.json`, V28 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V28_PROVEN.md` as the generated proof appendix for V28 promotion
- Source parity state: V28 source-side Protocol, Terminal, Reading pipeline, MCP/ChatGPT App, proof, workflow, and promotion surfaces are canonicalized in the promoted V28 file family
- State: draft target parity matrix opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V27`
- Scope: V28 canonical parity ledger for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment
- Spec companion: `BITCODE_SPEC_V28.md`
- Notes companion: `BITCODE_SPEC_V28_NOTES.md`
- Delta companion: `BITCODE_SPEC_V28_DELTA.md`
- Generated proof appendix: none until V28 promotion
- Last fully realized canonical target preserved in source: `V28`

This matrix records the initial V28 source audit.
It separates V27-implemented primitive truth from V28 commercial Protocol/Terminal MVP QA work and later-version deferrals.

## Purpose

The V28 parity matrix keeps commercial Protocol/Terminal MVP QA tied to exact source surfaces.
It prevents draft work from claiming V28 closure when only V27 primitives exist.

## Audit Basis

Fresh audit inputs:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V27.md`
- `BITCODE_SPEC_V27_DELTA.md`
- `BITCODE_SPEC_V27_NOTES.md`
- `BITCODE_SPEC_V27_PARITY_MATRIX.md`
- `BITCODE_SPEC_V27_PROVEN.md`
- `BITCODE_SPEC_V28_NOTES.md`
- `protocol-demonstration/src/canon-posture.js`
- `protocol-demonstration/data/state.json`
- `protocol-demonstration/HOST_CAPABILITIES.json`
- `packages/btd/src/constants.ts`
- `packages/btd/src/supply.ts`
- `packages/btd/src/measuremint.ts`
- `packages/btd/src/semantic-volume.ts`
- `packages/btd/src/range.ts`
- `packages/btd/src/receipts.ts`
- `packages/btd/src/replay.ts`
- `packages/btd/src/allocation.ts`
- `packages/btd/src/access.ts`
- `packages/btd/src/ancestry.ts`
- `packages/btd/src/revenue.ts`
- `packages/btd/src/wallet.ts`
- `packages/btd/src/bitcoin-fees.ts`
- `packages/btd/src/bitcoin-provider.ts`
- `packages/btd/src/ledger-anchor.ts`
- `packages/btd/src/exchange.ts`
- `packages/btd/src/terminal-journal.ts`
- `packages/btd/src/reconciliation.ts`
- `packages/btd/src/deployment-lanes.ts`
- `packages/btd/src/telemetry.ts`
- `packages/btd/src/upgrade.ts`
- `packages/api/src/routes/btd-crypto.ts`
- `apps/uapi/app/api/btd/*`
- `apps/uapi/app/terminal/*`
- `apps/uapi/app/exchange/*`
- `apps/uapi/app/btd/[assetPackId]/page.tsx`
- `apps/uapi/app/auxillaries/*`
- `apps/uapi/app/executions/*`
- `apps/uapi/components/base/bitcode/btd/*`
- `internal-.docs/BITCODE_OPERATOR_EXPERIENCE.md`
- `internal-.docs/BITCODE_FRONTEND_ARCHITECTURE.md`
- `internal-.docs/BITCODE_AUXILLARIES_READINESS.md`
- `internal-.docs/BITCODE_EXCHANGE_DATABASE.md`
- `internal-.docs/INTEGRATIONS.md`

No `_legacy/` source is active source truth.

Audit query classes:

- active canonical pointer and draft target posture;
- V27 promoted tokenomics and crypto rails;
- Terminal, Auxillaries, executions, BTD route, MCP API, ChatGPT App, auth/readiness, and BTD component discovery;
- wallet, BTC fee, PSBT, signer, finality, ledger, journal, reconciliation, telemetry, upgrade, migration, AssetPack range, licensed read, Read, Fit, and organization readiness searches;
- route versioning scan under `apps/uapi/app/api`.

## Judgment Legend

- `implemented baseline`: present from V27 and suitable as a V28 starting point.
- `partial`: present but not Terminal-productized enough for V28 closure.
- `gap`: required by V28 and not yet implemented at the product/source level.
- `deferred`: intentionally owned by a later version.
- `closed`: satisfied for the current V28 draft-opening gate.

## Gate 1 Parity

| Requirement | Source evidence | Judgment |
| --- | --- | --- |
| Active canon remains V27 during V28 draft opening | `BITCODE_SPEC.txt` contains `V27` | closed |
| Runtime draft target moves to V28 | `protocol-demonstration/src/canon-posture.js` now declares V27 active canon and V28 draft target | closed |
| Static demo state mirrors V28 draft target | `protocol-demonstration/data/state.json` and `HOST_CAPABILITIES.json` now report V27 active / V28 draft | closed |
| BTD registry snapshots report the current posture | `packages/api/src/routes/btd-crypto.ts` reports V27 active / V28 draft | closed |
| V28 SPEC family exists as draft | `BITCODE_SPEC_V28.md`, DELTA, NOTES, and PARITY exist | closed |
| UAPI implementation routes remain unversioned | `find apps/uapi/app/api -path '*v[0-9]*' -print` returns empty | closed |
| V28 does not claim PROVEN before closure | no `BITCODE_SPEC_V28_PROVEN.md` is created in Gate 1 | closed |

## Staging-Testnet Minimal Commercial Parity Matrix

This table is the active V28 QA map for the real deployed staging-testnet path.
It links manual screenshots, console logs, server logs, Supabase SQL checks, and source audit findings to the protocol surface that must close before V28 promotion.

| Parity area | Source evidence | Current V28 judgment | Closure evidence required |
| --- | --- | --- | --- |
| BTC/D identity and wallet-backed session | `apps/uapi/app/api/wallet/_shared.ts`, `apps/uapi/app/api/wallet/authenticate/route.ts`, `apps/uapi/app/api/wallet/oauth/authorization-code/route.ts`, `apps/uapi/app/api/wallet/oauth/token/route.ts`, `apps/uapi/app/api/wallet/oauth/userinfo/route.ts`, `apps/uapi/lib/bitcoin-wallet-client.ts`, `apps/uapi/lib/bitcode-wallet-local.ts`, `packages/btd/src/wallet.ts`, `packages/btd/src/bitcoin-provider.ts`, `supabase/migrations/003_user_connections_provider_scope.sql`, `apps/uapi/tests/bitcoinWalletClient.test.ts` | closed for V28 testnet identity and fee-readiness | Live staging SQL confirmed `auth.users`, `auth.identities`, `user_profiles.settings.bitcodeProfile.walletBinding`, and `user_connections.provider='leather'` for the same wallet-backed user. Gate 12 readback confirms the reader BTC fee row and depositor/reader boundary evidence without server custody. |
| GitHub App and repository source scope | `apps/uapi/app/api/vcs/_shared.ts`, `apps/uapi/app/api/vcs/[provider]/callback/route.ts`, `apps/uapi/app/api/vcs/[provider]/setup/route.ts`, `apps/uapi/app/api/vcs/[provider]/repositories/route.ts`, `packages/api/src/vcs/github-service.ts`, Auxillaries Externals pane, `supabase/migrations/001_v26_production.sql` `user_connections` and `vcs_repositories` | staging prerequisite pass | May 14 live staging SQL confirmed GitHub installation `132358627`, account `engineeredsoftware`, provider-scoped connection data, and `public.vcs_repositories` rows including `engineeredsoftware/ENGI`. Terminal Deposit/Read must now prove that repository inventory is used as live source scope. |
| Terminal terminology parity | `BITCODE_SPEC_V28.md` terminology contract, `apps/uapi/app/terminal/terminal-workspace-copy.ts`, `apps/uapi/app/terminal/TerminalDepositComposer.tsx`, `apps/uapi/app/terminal/TerminalReadScenarioPanel.tsx`, `apps/uapi/components/base/bitcode/layout/bitcode-public-copy.ts`, Terminal/public-shell/docs tests, `supabase/migrations/20260515143000_v28_deposit_read_data_contract.sql` | closed for UI, docs, tests, API, ORM, demonstration, and data-contract carriers | Active V28 UI, docs, QA prose, OpenAPI, test-visible assertions, BTD journal kinds, ORM types, Supabase queries, and live schema use Deposit/Depositing and Read/Reading. The migration applied to staging renames range linkage to `read_id` and journal writes to `read_submission`; source audit has no exact retired Terminal-domain vocabulary outside excluded legacy/build artifacts. |
| PSQL/Supabase data reality | `supabase/migrations/001_v26_production.sql`, `002_v27_btd_crypto_registry.sql`, `003_user_connections_provider_scope.sql`, `20260514173000_enable_pipeline_runs_rls.sql`, `20260514175000_enable_pipeline_runtime_rls.sql`, `20260515143000_v28_deposit_read_data_contract.sql`, `packages/orm/src/data-health/*`, `packages/orm/scripts/run-data-health.ts`, `packages/orm/scripts/check-schema-types.ts`, `supabase/DATA_HEALTH.md`, `supabase/queries/*`, `scripts/verify-v28-pipeline-readback.mjs` | closed for Gate 7 readback | Staging database has the required auth/profile/connection/repository/BTD registry/journal/telemetry tables for this gate. REST and DB readback against staging-testnet report populated pipeline, generation, tool, BTD range, BTC fee, journal, anchor, ownership, read-license, and crypto telemetry rows for the completed source-bound run. |
| Fit-finding | `packages/pipelines/asset-pack/src/depository-search.ts`, `packages/pipeline-hosts`, `apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx`, `TerminalReadScenarioPanel.tsx`, `terminal-deposit-read-workbench.ts`, `terminal-read-scenarios.ts`, `protocol-demonstration/src/local-fit-finding.js` reference witness, V28 readback verifier | closed for current gate | Terminal simplest Read produces or reads Fit candidates, review decision, qualities, rejection/block reasons, source roots, proof/dedupe roots, query/ranking roots, embedding policy, and visible readiness state without relying on demonstration runtime imports. The Vercel Sandbox harness ran the real source-bound AssetPack pipeline and persisted phase, agent, generation, and tool evidence. |
| Single-deposit commercial Read/Fit QA | `BITCODE_SPEC_V28.md` single-deposit commercial Reading QA, `BITCODE_V28_QA.md` Pass 2B, `supabase/queries/v28_qa_terminal_06_read_fit_quality_after_read.sql`, `apps/uapi/tests/terminalActivityHistory.test.ts`, V28 readback verifier | closed for current gate | Against the current single deposited repository revision, Gate 7 proof shows Deposit before Read, Read before Fit, repository/branch/commit alignment, no `frontier/*` or source-overlay leakage, worthy-fit AssetPack synthesis, PR delivery, and honest settlement/finality readback. The fixture is ENGI, but the implementation remains source-generic. |
| AssetPack synthesis and deterministic pipeline configuration | `packages/pipelines/asset-pack`, `packages/pipeline-hosts`, `internal-.docs/ASSETPACK_EXECUTION.md`, `packages/protocol/src/canonical/run-artifacts.js`, `packages/btd/src/semantic-volume.ts`, `measuremint.ts`, `range.ts`, `receipts.ts`, `replay.ts`, `apps/uapi/app/api/btd/mint-draft/route.ts`, Terminal AssetPack components | closed for V28 bounded profile | Staging Read/Fit path creates and reads AssetPack evidence, semantic volume posture, range receipt, access-policy hash, and model/tool telemetry using protocol-specified pipeline configuration. Ledgerized synthesis uses registry-deterministic model posture; broad model selection is scoped away from ledgerized Reading. |
| Ledgerized journal and ledger anchors | `packages/btd/src/terminal-journal.ts`, `ledger-anchor.ts`, `reconciliation.ts`, `apps/uapi/app/api/btd/terminal-journal/route.ts`, `asset-pack-ledger-anchor/route.ts`, `ledger-database-reconciliation/route.ts`, `supabase/migrations/002_v27_btd_crypto_registry.sql`, V28 readback verifier | closed for current gate | Terminal shows journal rows for Read/Fit/AssetPack/BTC fee/anchor/reconciliation events, ledger anchor or blocked-readiness state is explicit, and SQL evidence in `btd_terminal_journal_entries`, `btd_asset_pack_ledger_anchors`, and reconciliation readback matches the UI. |
| BTC fee and testnet ledger path | `packages/btd/src/bitcoin-fees.ts`, `bitcoin-provider.ts`, `apps/uapi/app/api/btd/btc-fee-transaction/route.ts`, wallet client code, V28 readback verifier | closed for current gate | Testnet path prepares fee state, records no server custody, and writes/readbacks `btc_fee_transactions`; the completed Gate 7 run recorded a prepared reader BTC fee row with depositor/reader boundary evidence. |
| Pipeline runtime deployment reality | `packages/pipeline-hosts`, `apps/uapi/app/api/pipeline-harness/asset-pack/route.ts`, `apps/uapi/app/api/executions/*`, `apps/uapi/app/api/external-realization/route.ts`, `apps/uapi/app/api/make-bitcode-branch/route.ts`, `internal-.docs/DEPLOYMENT.md`, `internal-.docs/ASSETPACK_EXECUTION.md`, Terminal execution/readback components | closed for bounded profile | Staging logs show the runtime lane selected, Vercel Sandbox execution creates and exports artifacts, branch creation/PR delivery uses configured GitHub authority, and Terminal state identifies runtime/deployment blockers instead of falling back to mock success. Full-profile async completion remains a later V28 gate. |
| Telemetry, logging, and Sentry/alerting | `apps/uapi/lib/bitcode-qa-telemetry.ts`, `apps/uapi/lib/bitcode-server-telemetry.ts`, `apps/uapi/app/api/client-error/route.ts`, `packages/btd/src/telemetry.ts`, `packages/protocol/src/telemetry.js`, `btd_crypto_telemetry_events` migration, V28 readback verifier | closed for Gate 7 telemetry | Client/server verbose logs and persisted pipeline rows cover Terminal Read/Deposit, Finding Fits, AssetPack, ledger, and database sync for this gate; staging captures generation and tool telemetry without leaking secrets. Sentry/alert sink deepening remains a V35 documentation/telemetry concern. |
| MCP API and ChatGPT App parity | `packages/mcp`, `packages/chatgptapp`, UAPI MCP/ChatGPT App entrypoints, docs routes | closed for V28 MVP | MCP and ChatGPT App MVP read the same wallet, GitHub, access-policy, AssetPack, journal, and proof posture as Terminal and fail closed when prerequisites are absent. |
| Legacy residue awareness and cleaning | source scans for retired workspace routes, `orbitals` carriers, broad model-selection UI, Exchange/website Conversations links, versioned route families | closed for active V28 source | Active V28 paths have no versioned route/source naming, no retired workspace route, no active old orbital shell, no Exchange/Conversations dependency for V28 closure, and no user-driven ledgerized model selection. Deferred compatibility carriers are named and scoped. |

## Enterprise Reading Pipeline Parity Matrix

This gate folds any prior V28 Reading, Terminal stream, pipeline harness, and
source-safe AssetPack closure gap into one acceptance surface. The two
commercial pipeline names are canonical for this gate:
`ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`.

| Pipeline / UX surface | Source evidence | Current V28 judgment | Closure evidence required |
| --- | --- | --- | --- |
| Five-step Terminal Reading UX | `apps/uapi/app/terminal/terminal-deposit-read-workbench.ts`, `apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx`, `apps/uapi/tests/terminalDepositReadWorkbench.test.ts`, local browser QA | closed for current gate | Terminal shows exactly: request Read, review synthesized Need, request Fit, review synthesized AssetPack, buy AssetPack/settle. Default state is low-detail and guided; all proof/telemetry/detail surfaces remain expandable. |
| `ReadNeedComprehensionSynthesis` contract inventory | `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`, `packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts` | implemented in gate branch | Contract declares four phases, four PTRR agents, sixteen PTRR steps, forty-eight ThricifiedGeneration units, four model-structured PTRR steps, zero tools, all ids prefixed by `ReadNeedComprehensionSynthesis`, return types, prompt registry ids, prompt template, stores, and telemetry fields. |
| `ReadNeedComprehensionSynthesis` prompt/return audit | `reading-pipeline-contract.ts`, `bounded-structured-inference.ts`, `read-review/route.ts`, `readReviewRoute.test.ts` | implemented in gate branch | One model prompt template is declared and test-audited: `ReadNeedComprehensionSynthesis.prompt.need-synthesis` returning `ReadNeed` through four PTRR steps. Telemetry must carry prompt template, interpolated context, raw response posture, parsed typed output, schema, phase, agent, PTRR step, ThricifiedGeneration ids, and measurement/review roots. |
| `ReadNeedComprehensionSynthesis` route telemetry | `apps/uapi/app/api/read-review/route.ts`, `apps/uapi/tests/api/readReviewRoute.test.ts` | implemented in gate branch | `/api/read-review` synthesis responses include pipeline name, phase id, agent id, PTRR step id, ThricifiedGeneration ids, prompt template, prompt input, interpolated context, raw output posture, parsed typed output, measurement root, review state, and next action. Acceptance responses include acceptance root and `ReadFitsFindingSynthesis` as next pipeline. |
| `ReadNeedComprehensionSynthesis` algorithmic precision | `packages/pipelines/asset-pack/src/read-need.ts`, `packages/pipelines/asset-pack/src/__tests__/read-need.test.ts`, live local `/api/read-review` OpenAI validation | closed for current gate | Need construction remains exact to the Read Request: requirements, non-goals/failure modes, source constraints, target artifact kinds, proof expectations, pricing measurement vector, weighted requested volume, feedback history, resynthesis attempts, and acceptance root. Tests reject raw Read-to-Fit execution when strict Need acceptance is required, and live local OpenAI synthesis returns a measured Need through all three ThricifiedGeneration stages. |
| `ReadFitsFindingSynthesis` contract inventory | `packages/pipelines/asset-pack/src/reading-pipeline-contract.ts`, `packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts` | implemented in gate branch | Contract declares seven phases, eight PTRR agents, thirty-two PTRR steps, ninety-six ThricifiedGeneration units, sixteen model-structured PTRR steps, four tools, all ids prefixed by `ReadFitsFindingSynthesis`, return types, prompt registry ids, prompt templates, stores, and telemetry fields. |
| `ReadFitsFindingSynthesis` prompt/return audit | `reading-pipeline-contract.ts`, setup/comprehension/synthesis/validation agents, `bounded-structured-inference.test.ts`, staging-testnet run `c38a98cf-403e-4fc7-9c9e-ba615d4af024` | closed for bounded profile | Four model prompt templates are declared and test-audited: setup plan, read comprehension, AssetPack synthesis, and fit-quality validation; each is exercised through Plan, Try, Refine, and Retry. Parsed return types are `PlanSchema`, `BoundedReadComprehensionSchema`, `AssetPackSynthesisOutput`, and `ReadyToFinishOutput`; staging-testnet readback proves model-generation rows, structured tool rows, and source-bound AssetPack completion for the bounded profile. |
| Prefix discipline below pipeline names | `reading-pipeline-contract.ts`, `reading-pipeline-contract.test.ts` | implemented in gate branch | Phase, agent, PTRR step, ThricifiedGeneration, tool, prompt, and telemetry identifiers are rejected unless nested under `ReadNeedComprehensionSynthesis` or `ReadFitsFindingSynthesis`; generic labels may remain only as UI summaries or typed payload keys, not as contract identifiers. |
| Depository Finding Fits discovery | `packages/pipelines/asset-pack/src/depository-search.ts`, `AssetPackLexicalDepositorySearchTool.ts`, `embedding-config.ts`, `depository-search*.test.ts`, `embedding-config.test.ts`, V28 readback verifier | closed for current gate | Accepted Need search covers lexical and vector contracts, source binding, proof/measurement/readback blockers, mock/frontier rejection, fit deposit ranking roots, query roots, worthy/no-worthy/blocked states, `fitDepositAssetIds`, `fitDeposits`, and compatibility selected-candidate aliases. Staging readback proves a worthy fit with query root, ranking root, selected candidate ids, and OpenAI `text-embedding-3-small` / 1536-dimensional policy. |
| AssetPack synthesis prompt telemetry | `bounded-structured-inference.ts`, setup/comprehension/synthesis agents, `packages/pipeline-hosts/src/asset-pack-harness.ts`, `apps/uapi/app/terminal/terminal-pipeline-harness-client.ts`, V28 readback verifier | closed for bounded profile | Every bounded inference stores prompt template, interpolated prompt/messages, raw model response, parsed typed output, usage, provider/model, phase, agent, and step. Harness stream events preserve those fields as expandable Terminal metadata. Full PTRR profile remains behind the async completion gate until its push/readback transport is implemented. Implementation uses discovered fit deposits as contextual knowledge inputs for source-safe AssetPack synthesis. |
| Source-safe preview and Share-to-Fee | `packages/pipelines/asset-pack/src/read-need.ts`, `postprocess.ts`, `apps/uapi/app/api/pipeline-harness/asset-pack/runner.ts`, `read-need.test.ts`, `pipelineHarnessRoute.test.ts`, V28 readback verifier | closed for current gate | Preview exposes Need/Fit measurements, admitted fit quality, fee quote/root, range projection, disclosure policy, access policy id/hash, settlement boundary, and locked source state without protected source leakage before settlement. |
| Buy AssetPack and settle | `apps/uapi/app/api/pipeline-harness/asset-pack/runner.ts`, BTD fee/range/journal/reconciliation primitives, Terminal preview/readback UI, V28 readback verifier | closed for current gate | Reader BTC payment, depositor ownership boundary, read-license rows, range readback, journal entries, ledger anchor or blocked readiness, database projection, reconciliation, and PR delivery target agree before unlock. Source-bound staging-testnet readback proves BTD range, BTC fee, ownership/license, journal, anchor, crypto telemetry, and PR delivery rows for the latest completed run. |
| Mock parity and typed envelopes | `reading-pipeline-contract.test.ts`, `bounded-structured-inference.test.ts`, UAPI route/stream tests, pipeline-host harness tests, package/UAPI focused suites | closed for current gate | Mocked phases emit the same pipeline, phase, agent, PTRR step, ThricifiedGeneration ids, prompt, tool, raw-output, parsed-output, timing/usage, and fail-closed envelopes as live bounded runs; untyped placeholders are not acceptance evidence. |
| Local live validation | `apps/uapi/package.json` `dev:staging`, `.env.local` staging-testnet env, Vercel Sandbox OIDC, OpenAI API, Supabase staging, `scripts/verify-v28-pipeline-readback.mjs` | closed for current gate | Local UAPI real OpenAI Read-Need synthesis and staging-testnet readback verifier prove request Read -> review Need -> request Fit -> review preview -> buy/settlement posture through the accepted source-bound run. Both REST and DB readback paths report `ready_for_v28_result_review`; the only warning is the intentionally substituted missing generic `phase_executions` table because the canonical deliverable phase hierarchy is populated. |

## V28 Metadevelopment Parity Matrix

Gate 8 closes repository operating standards before the remaining V28 product
gates continue. These rows are about how Bitcode development is promoted,
proved, and merged; they do not replace the commercial product closure gates.

| Gate 8 metadevelopment surface | Source evidence | Current V28 judgment | Closure evidence required |
| --- | --- | --- | --- |
| Branching and gate workflow standard | `README.md`, `AGENTS.md`, protected `main`, branch examples `version/v28` and `v28/gate-N-*` | closed for Gate 8 | Work is integrated through version branches and gate-numbered branches; direct `main` pushes are out of workflow; each gate PR merges to the version branch before promotion. |
| Commit quality and contribution discipline | `README.md`, `AGENTS.md`, `scripts/check-bitcode-commit-msg.mjs`, `scripts/check-bitcode-pre-commit.mjs` | closed for Gate 8 | Commits are quality-grouped and descriptively titled; spec-relevant changes are recognized by pre-commit checks; generic `wip v28` messages are no longer the normal standard. |
| Gate-quality workflow | `.github/workflows/bitcode-gate-quality.yml`, `scripts/check-v28-metadevelopment-readiness.mjs` | closed for Gate 8 | Gate branches and version PRs run draft canon posture, metadevelopment readiness, dry-run promotion plan, casing/import checks, package typechecks/tests, focused UAPI tests, demonstration QA, and diff hygiene. |
| Canonical promotion automation | `.github/workflows/v28-canon-promotion.yml`, `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, `scripts/generate-bitcode-proven.mjs` | closed for Gate 8 | Only `version/v28` pull requests into `main` can run the V28 promotion workflow; the workflow executes the canonical promotion script, generates `BITCODE_SPEC_V28_PROVEN.md`, prepares runtime/spec-family posture, and commits promotion artifacts plus the pointer change. |
| Metadevelopment readiness check | `scripts/check-v28-metadevelopment-readiness.mjs`, `package.json` `check:v28-metadevelopment` | closed for Gate 8 | The check fails closed when branch policy, workflow policy, promotion script usage, unversioned-route posture, deterministic ledgerized model posture, or carryforward audit sections are missing. |
| Deterministic ledgerized model posture | `apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx`, `apps/uapi/app/auxillaries/components/models/GlobalModelSelection.tsx`, `apps/uapi/tests/orbitalsInterfacesPane.test.tsx`, `apps/uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts` | closed for Gate 8 | Active Interfaces UX no longer exposes broad apply-to-all model choice; ledgerized Reading persists `registry_deterministic` posture; remaining model choice is scoped to non-ledgerized conversation-only surfaces. |
| Remaining product-gate audit | `BITCODE_SPEC_V28.md`, `BITCODE_SPEC_V28_NOTES.md`, this parity matrix | closed for Gate 8 | Later commercial-product work is explicitly carried forward by surface, next gate, required implementation, required tests/proofs, and local/live validation evidence. |

## V28 Product-Gate Carryforward Audit

The following rows define what remains after Gate 8. Each surface must be closed
by a later V28 gate before `version/v28` can be promoted to `main`.

| Carryforward surface | Next gate | Required commercial implementation | Required proof/test coverage | Carryforward closure requirement |
| --- | --- | --- | --- | --- |
| Source Depositing and depository evidence | Gate 9 | Repository inventory, deposit admission, source measurement, depository asset rows, lexical/vector search documents, depositor wallet boundary, source proof roots, execution-history projection, and Terminal deposit history. | Protocol deposit evidence tests, depository-search tests, pipeline harness deposit-root propagation tests, staging-testnet SQL/readback queries, Terminal UX tests, and no demonstration runtime imports. | A user can deposit real source material and see source-bound evidence persisted, searchable, journaled, root-projected into Finding Fits, and owned by the depositor boundary. |
| Read Request capture | Gate 10 | Enterprise Read Request form/state, repository target, source branch/commit context, constraints, non-goals, desired artifact types, and feedback history, encoded as `bitcode.read.request` inside the Need. | UAPI route tests, Terminal form tests, typed Read Request schema tests, prompt/context interpolation tests, `check:v28-gate10`. | Raw requests are persisted as requests only; they do not directly trigger Finding Fits until a reviewed Need exists. |
| Read-Need synthesis, review, and resynthesis | Gate 10 | `ReadNeedComprehensionSynthesis` execution over PTRR agents and ThricifiedGenerations, contract trace telemetry, reviewable Need object, operator feedback, resynthesis attempts, acceptance root, and blocked-readiness reasons. | Pipeline contract tests, prompt/return audits, mocked typed-envelope tests, route resynthesis tests, live local OpenAI validation, Terminal stream/accordion tests. | A Reader can accept or resynthesize the Need; accepted Need truth becomes the only input admitted to Finding Fits. |
| Finding Fits over the depository | Gate 11 | `ReadFitsFindingSynthesis.discovery` searches lexical/vector deposits, ranks all threshold-passing fits, records fit deposits, query/ranking roots, blockers, and no-worthy-fit outcomes. | Depository search tests, embedding policy tests, tool telemetry tests, staging-testnet readback verifier, mock/live parity tests. | Discovery returns all fit deposits above threshold and never invents source outside the depository. |
| AssetPack synthesis and preview | Gate 11 | Implementation phase uses fit deposits as context, synthesizes AssetPack measurements, source-safe preview, quality score, disclosure policy, and Share-to-Fee quote without protected source leakage. | AssetPack synthesis tests, disclosure-boundary tests, prompt telemetry tests, UI preview tests, source leakage scans. | Reader sees enough measured fit confidence to decide whether to settle, without seeing the protected AssetPack source before payment. |
| BTC settlement and read-license/right transfer | Gate 12 | Fee quote/root, PSBT/finality posture, BTC payment row, BTD range/ownership/license rows, depositor/reader boundary, settlement blockers, and reconciliation. | BTD package tests, API route tests, staging-testnet ledger/database readback, reconciliation tests, wallet/signing failure tests. | Payment transfers read rights/license according to the committed policy and never grants unpaid protected-source visibility. |
| AssetPack delivery as pull request | Gate 12 | Protected-source unlock after settlement, GitHub branch/PR creation, delivery journal rows, readback of PR identity, and delivery failure repair path. | GitHub/VCS route tests, sandbox harness tests, PR delivery mock/live tests, Terminal journal tests. | Paid Reader receives the full AssetPack as a pull request against the requested repository and commit context. |
| Terminal five-step Reading UX | Gates 10-12 | Guided low-detail default flow: request Read, review Need, request Fit, review preview, buy/settle, with expandable full telemetry and proof detail. | Playwright/Jest Terminal tests, log stream tests, responsive screenshots, accessibility checks, local dev browser QA. | Enterprise Reader can complete the core Reading flow without raw JSON while still being able to inspect all proof metadata. |
| Documentation and protocol precision | Gates 9-13 | Public docs, internal docs, V28 SPEC/DELTA/NOTES/PARITY updates, API docs, QA instructions, staging-testnet SQL/readback instructions. | Spec-family checks, docs tests, diff hygiene, generated proof appendix, source-to-spec parity review. | Documentation accurately matches implemented behavior and names remaining V29+ deferrals without hiding V28 blockers. |
| Full demonstration proof-suite alignment | Gate 13 | Refresh the older demonstration proof-member, theorem, public-projection, and V26-proven expectations so they match the active V27/V28 posture or are explicitly retired from V28 promotion proof. | `npm --prefix protocol-demonstration run test`, proof-member/theorem matrix counts, public projection spine assertions, and V26/V28 proven-generator assertions. | The complete demonstration suite is either green under the promoted V28 proof model or every intentionally retired legacy assertion is replaced by a narrower current-canon proof. |
| Local and staging-testnet validation | Gate 13 | Local non-mocked OpenAI/Supabase/Vercel Sandbox validation plus staging-testnet readback evidence for complete Depositing -> Reading -> settlement -> PR delivery. | `check:v28-metadevelopment`, package tests, UAPI tests, build, demonstration tests, `qa:v28:pipeline-readback`, browser QA, SQL ledger/readback queries. | `version/v28` is promotion-ready only when local and staging-testnet evidence prove the full commercial product flow. |

Gate 11 closure narrows the two Gate 11 carryforward rows to source-safe
preview readiness: Finding Fits discovery must now produce canonical
`ReadFitsFindingSynthesis.tool.lexical-depository-search` and
`ReadFitsFindingSynthesis.tool.vector-depository-search` telemetry, all
threshold-passing `fitDepositAssetIds`, query/ranking roots, and embedding
policy posture. AssetPack postprocess must derive a source-safe preview and
Share-to-Fee quote from the accepted Need and Finding Fits result, exposing only
measurements, roots, score bands, candidate ids, proof posture, ownership
boundary, settlement boundary, and BTC quote before settlement. Gate 12 remains
responsible for paid unlock, rights transfer, ledger reconciliation, and PR
delivery.

Gate 12 closure narrows the two Gate 12 carryforward rows to paid-unlock
readiness: settlement must produce a typed
`bitcode.asset-pack.settlement-unlock` decision from ledger settlement evidence,
readback booleans, and delivery posture. Protected source can become available
only when BTC fee, BTD range, ownership event, read-license row, mint receipt,
ledger anchor, Terminal journal, crypto telemetry, and pull-request delivery
read back together. Terminal must show the unlock state, read-license id, BTC
fee receipt id, ledger status, and PR target without treating unpaid preview
metadata as source access.

Gate 13 closure closes the two final carryforward rows by making promotion
readiness executable: the full `protocol-demonstration` suite is green under
the active V27/V28 posture, the staging-testnet readback verifier is required
for complete Depositing -> Reading -> settlement -> delivery evidence through
the Supabase Data API, bounded DB readback remains available for stricter local
network lanes, and the promotion workflow validates every Gate 9-13 check
before it can promote `version/v28` into `main`. Older demonstration matrices
now track the current proof catalog counts and the V26-proven generator no
longer overstates superseded promotion readiness while V27 remains the active
canon pointer.

## V28 implementation matrix

| Area | Current source evidence | Judgment | Gate owner |
| --- | --- | --- | --- |
| Protocol/Terminal MVP route QA | `/`, `/terminal`, `/auxillaries/*`, `/btd/[assetPackId]`, MCP API, ChatGPT App, and the public `/docs` article map are the V28 route QA scope; prior Exchange and website Conversations E2E coverage is historical/deferred and is not required for V28 closure; the prior generic workspace route is fully retired and redirects to `/terminal`. Gate-quality and promotion workflows now prove the narrowed V28 Terminal/Protocol/Auxillaries/BTD/MCP/ChatGPT/docs surface without depending on Exchange or website Conversations. | closed | Gate 2 / Gate 13 |
| Signed-in BTD balance widget uses V28 commercial semantics | `apps/uapi/components/base/bitcode/btd/btd-tracker.tsx`, `apps/uapi/components/base/bitcode/layout/nav.tsx`, `apps/uapi/hooks/useUserData.ts`, `packages/api/src/routes/auxillaries-contract.ts`, `protocol-demonstration/test/v28-commercial-mvp-qa.test.js`, manual QA screenshots May 6 2026 | closed | Gate 2 |
| BTD balance widget opens wallet-owned Wallet auxillary state | `apps/uapi/components/base/bitcode/btd/btd-tracker.tsx`, `apps/uapi/components/base/bitcode/layout/nav.tsx`, `protocol-demonstration/test/v28-commercial-mvp-qa.test.js`; connected wallet identity replaces Exchange-oriented acquisition, clicking opens the Wallet auxillary pane, and Exchange acquisition is deferred beyond V35. | closed | Gate 2 / Gate 13 |
| Auxillaries old orbital shell conflicts removed from active contained tabs-left experience | Source routes all portal overlays through the contained shell, removes selector lane-label duplication, moves overlay controls top-right, removes visible auxillary Save buttons in favor of autosave, stabilizes first-open Profile scroll, removes the notification footer Auxillaries launcher, reserves selector hover headroom, makes Bitcoin wallet identity the first required Wallet action, makes GitHub second for Deposit/Read repository scope in Externals, makes email optional Profile posture, promotes BTD/BTC stat hierarchy, moves stat explanations to tooltips/accessibility labels, and keeps the shared Terminal/Protocol activity table grammar in the Wallet pane. Automated smoke and gate-quality checks confirm non-mock contained-shell parity for the V28 active surface. | closed | Gate 2 / Gate 13 |
| Wallet-first Bitcoin authentication | `apps/uapi/app/auxillaries/components/AuxillariesWalletPane.tsx`, `apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx`, `apps/uapi/app/api/wallet/authenticate/route.ts`, `apps/uapi/lib/bitcoin-wallet-client.ts`, `apps/uapi/lib/bitcode-wallet-local.ts`, `apps/uapi/tests/bitcoinWalletClient.test.ts`, `apps/uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts`, `supabase/migrations/003_user_connections_provider_scope.sql`, `apps/uapi/tests/api/walletAuthenticateRoute.test.ts`; implemented and unit-tested for Bitcoin-provider admission, Xverse/Sats Connect priority, Leather direct-provider support, provider-specific Wallet actions, payment/auth address distinction, and persistence posture, with local staging fallback when backend auth is unavailable. Browser smoke with a stubbed Leather provider verifies the click path calls `getAddresses` and `signMessage`; contained Auxillaries suppresses progressive onboarding completion during Wallet connection and does not call onboarding persistence. MetaMask's Ethereum provider is explicitly rejected for this Bitcoin identity path. | closed | Gate 2 / Gate 3 / Gate 13 |
| Active Auxillaries naming avoids `orbitals` residue | `apps/uapi/config/featureFlags.ts`, `apps/uapi/lib/mock-review-mode.ts`, `apps/uapi/app/terminal/TerminalOpenAuxillariesButton.tsx`, `apps/uapi/components/base/bitcode/layout/user-menu.tsx`, and related tests use Auxillaries naming; redirect-only `/orbitals/*` compatibility and inert stylesheet carriers remain bounded as compatibility/styling, not active V28 product vocabulary. | closed | Gate 2 / Gate 13 |
| Standalone demonstration and commercial protocol source are separated | `packages/protocol` is the formal commercial protocol package; `apps/uapi/package.json` depends on `@bitcode/protocol`; `pnpm-workspace.yaml` no longer includes `protocol-demonstration`; `apps/uapi/tests/protocolCommercialBoundary.test.ts` and `protocol-demonstration/test/v28-boundary-separation.test.js` lock no commercial imports from the standalone demonstration and no demonstration runtime imports from commercial packages/UAPI. Demonstration-derived behavior needed by Terminal/MCP/ChatGPT lives in packages/UAPI, not runtime imports from `protocol-demonstration/`. | closed | Gate 2 / Gate 8 / Gate 13 |
| Terminal big-picture operator orientation | `/terminal`, `apps/uapi/app/terminal/TerminalTransactionWorkspace.tsx`, `apps/uapi/app/terminal/TerminalMvpMap.tsx`, `apps/uapi/components/base/bitcode/execution/BitcodeTransactionsOverview.tsx`, and `apps/uapi/tests/e2e/commercial-mvp.terminal.spec.ts` frame Terminal as recent/scoped Deposit/Read activity plus selected result, not Exchange master-detail; bare `/terminal` no longer auto-mutates during public nav while explicit route context remains addressable, and the old Terminal route redirects without becoming a canonical product route. | closed | Gate 2 / Gate 3 / Gate 13 |
| Source names remain implicitly versioned to active canon | `AGENTS.md`, `apps/uapi/app/terminal/demonstration-witness-scoped-styles/route.ts`, `apps/uapi/app/terminal/demonstration-witness-styles/route.ts`, `apps/uapi/app/terminal/demonstration-witness-scoped-styles/route.ts`, `apps/uapi/app/terminal/demonstration-witness-styles/route.ts`, `apps/uapi/app/terminal/demonstration-witness-theme-overrides.ts`, and `apps/uapi/tests/demonstrationWitnessScopedStylesRoute.test.ts` replace explicit gate-named stylesheet route/source carriers with precise unversioned demonstration-witness names. | closed | Gate 2 |
| Exchange product scope | `apps/uapi/app/exchange/*` and Exchange-specific E2E coverage exist from earlier V28 work. V28 must disable/hide Exchange in QA and must not require Exchange route/product behavior for closure; deeper Exchange scope is deferred beyond V35. | accepted boundary | V36+ |
| Website Conversations product scope | `apps/uapi/app/conversations/*` and Conversations-specific E2E coverage exist from earlier V28 work. V28 must disable/hide website Conversations in QA and must not require Conversations route/product behavior for closure; deeper Conversations scope is deferred beyond V35. | accepted boundary | V36+ |
| Terminal wallet connection and signer-session review | `packages/btd/src/wallet.ts`; profile and wallet API readiness helpers | implemented prerequisite | Gate 3 |
| BTC fee PSBT handoff and finality display | `packages/btd/src/bitcoin-fees.ts`, `bitcoin-provider.ts`, `/api/btd/btc-fee-transaction` | implemented prerequisite | Gate 3 |
| Read review before Fit review | application/executions Read components and internal Terminal notes | implemented prerequisite | Gate 3 |
| semantic-volume and measuremint display | `semantic-volume.ts`, `measuremint.ts`, mint draft route | implemented prerequisite | Gate 3 |
| access policy id/hash shown before commitment | V27 access primitives and `/btd/[assetPackId]` disclosure route | implemented prerequisite | Gate 3 |
| AssetPack range detail from registry state | `range.ts`, registry route, `/btd/[assetPackId]` | implemented prerequisite | Gate 4 |
| owner-read/licensed-read/denied branches | `access.ts`, read-access route, licensed-read revenue route | implemented prerequisite | Gate 4 |
| Terminal journal rows as transaction detail | `packages/api/src/routes/executions.ts`, `apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts`, `apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx`, `terminal-journal.ts` | implemented | Gate 5 |
| ledger/database reconciliation as operator read | `apps/uapi/app/terminal/terminal-journal-reconciliation.ts`, reconciliation repair table readback, `reconciliation.ts` | implemented | Gate 5 |
| organization holdings and read-license usage from registry | `packages/btd/src/access.ts`, `packages/api/src/routes/__tests__/btd-crypto.test.ts`, `packages/executions-mcp/src/mcp-server/src/auth/middleware.ts`, and registry readback models separate range, ownership, and read-license evidence. | closed | Gate 6 |
| MCP authorization based on range/read-license/policy truth | `packages/executions-mcp/src/mcp-server/src/auth/middleware.ts` rejects aggregate BTD holding thresholds and validates owner-read or licensed-read requirements from registry rows. | closed | Gate 6 |
| ChatGPT App authorization based on range/read-license/policy truth | `packages/chatgptapp/src/tools.ts` and `packages/chatgptapp/src/__tests__/tools.test.ts` require explicit confirmation plus typed owner-read or licensed-read evidence before connected-interface writes. | closed | Gate 6 |
| Deterministic model posture for ledgerized synthesis | `apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx` removes broad model selection from the active Interfaces pane, persists `ledgerizedPipelineModels: "registry_deterministic"`, and scopes model selection to non-ledgerized conversation-only surfaces. | closed | Gate 8 |
| access-policy legal templates | `packages/btd/src/access.ts` and `packages/btd/__tests__/btd.test.ts` cover owner-read, licensed-read, derivative use, redistribution, confidentiality, dispute, and takedown posture. | closed | Gate 6 |
| deployment lanes and telemetry surfaced in Terminal | `packages/btd/src/terminal-operational-health.ts`, `deployment-lanes.ts`, `telemetry.ts`, `apps/uapi/app/terminal/TerminalOperationalHealthPanel.tsx`, `apps/uapi/tests/terminalOperationalHealthPanel.test.tsx` | implemented | Gate 7 |
| migration/type refresh visible as readiness | `terminal-operational-health.ts` builds upgrade readiness from `upgrade.ts` and exposes migration root, rollback root, approval root, and generated type refresh posture in Terminal. | implemented | Gate 7 |
| GitHub-only provider readiness disclosed | `terminal-operational-health.ts` marks GitHub ready and GitLab, Bitbucket, generic Git future-scoped for Terminal Reading; Terminal renders the provider states. | implemented | Gate 7 |
| BTD-AssetPack testnet minting and ledgerized synthetic measurement | `terminal-operational-health.ts` builds a synthetic testnet AssetPack readback using measuremint, range allocation, mint receipt, Terminal journal rows, Bitcoin Taproot ledger anchor, observed/projected ledger facts, and reconciliation; `packages/btd/__tests__/terminal-operational-health.test.ts` proves diff/repair shape. | implemented | Gate 3 / Gate 5 / Gate 7 |
| Taproot/BNB/Binance research posture | Terminal operational health marks Bitcoin Taproot/PSBT ready and BSC, opBNB, and Binance Web3 Wallet disabled until a later Protocol gate admits proof-bound artifacts. | accepted boundary | Gate 7 / V36+ |

## V28 implementation checklist

| Area | Required V28 result | Judgment |
| --- | --- | --- |
| Terminal operations | lane approval posture, broadcaster/observer telemetry, upgrade/migration/generated-type refresh, GitHub-only VCS posture, Bitcoin Taproot/PSBT readiness, disabled Binance-family pilots, and synthetic testnet mint/read reconciliation are rendered from package primitives | implemented |
| Draft family | SPEC, DELTA, NOTES, PARITY exist | closed |
| Canon posture | V27 active / V28 draft in source posture carriers | closed |
| Routes | unversioned UAPI route scan passes | closed |
| Commercial Protocol/Terminal QA | primary route, auth, Auxillaries, BTD range, Terminal, MCP/ChatGPT App, docs article map, responsive health, URL-addressable Terminal filters, consent persistence, and stitched navigation/interaction coverage are narrowed to V28 scope after Exchange/Conversations deferral. | closed |
| Auxillaries shell | contained tabs-left active experience without orbital layout collision, no visible auxillary Save buttons, stable first-open pane scroll, top-right overlay controls, no notification-footer Auxillaries launcher, Wallet-first authentication, Externals-second source-provider order, Externals rendering from wallet identity before optional email/Supabase persistence, optional Profile email-third posture, consistent mock/non-mock pane order, and Wallet pane BTD activity/table readability. | closed |
| Exchange MVP | no longer part of V28; deferred beyond V35. | accepted boundary |
| Terminal master-detail correction | Terminal presents itself as a Deposit/Read operator surface with recent/scoped activity results; Exchange remains deferred beyond V35 and does not own V28 promotion proof. | closed |
| Terminal clickable affordance | Known no-op or ambiguous click targets in the V28 active Terminal path are fixed or rendered as static proof/status surfaces, and clickable controls are visually distinguishable from static badges/chips. | closed |
| Exchange selected activity detail completeness | no longer part of V28; deferred beyond V35. | accepted boundary |
| Conversations route QA | no longer part of V28; deferred beyond V35. | accepted boundary |
| Terminal wallet | wallet and signer-session UX built over V27 primitives | closed |
| Terminal BTC fees | PSBT/finality UX built over V27 primitives | closed |
| Terminal Read/Fit | Read, Fit, semantic volume, measuremint, policy UX | closed |
| Terminal range/read | AssetPack range and read-right detail | closed |
| Terminal journal/reconcile | selected transaction Journal section separates ledger observations, database projections, canonical roots, repair receipts, and blocking drift reasons | closed |

## Later-Version Deferrals

| Finding | Current disposition |
| --- | --- |
| Broad Exchange market depth, high-volume order book, wrappers, third-party market routing, and Exchange MVP/deepening | deferred beyond V35 |
| Website Conversations interface, conversation stream UI, and Conversations-to-Terminal workflow | deferred beyond V35 |
| Deeper Terminal transaction operation beyond MVP QA | deferred to V29 |
| Auxillaries expansion beyond active-shell cleanup | deferred to V31 |
| Bitbucket, GitLab, Azure DevOps, generic Git, webhook abstraction, and provider feature detection | deferred to the later product version that owns the affected commercial surface unless V28 commercial-app QA requires a narrow readiness hook |
| MCP API and ChatGPT App MVP | retained in V28 |
| Interface maturation beyond the V28 MCP API and ChatGPT App MVP | deferred to V33 |
| Deeper provation and testing | deferred to V32 |
| Deeper deployment | deferred to V34 |
| Deeper telemetry and documenting | deferred to V35 |
| Value-bearing mainnet launch | blocked until explicit operational approval root |

## accepted boundaries

- V28 is commercial Protocol/Terminal MVP first.
- V29 owns deeper Terminal workflows.
- V30 is reserved for Protocol/BTD hardening discovered during V28/V29.
- V31 owns deeper Auxillaries.
- V32 owns deeper provation and testing.
- V33 owns deeper Interfaces.
- V34 owns deeper Deployment.
- V35 owns deeper telemetry and documenting.
- V36+ owns deeper Exchange and website Conversations.
- value-bearing mainnet launch remains separately gated.

## completion condition

V28 parity closes when every V28 implementation matrix row is `closed` or explicitly `deferred`, the V28 proof appendix exists, required tests/builds pass, and `BITCODE_SPEC.txt` is promoted only at final V28 closure.

## V28 Proof Expectations

Before V28 promotion:

- `BITCODE_SPEC_V28_PROVEN.md` must be generated or manually bound to accepted proof artifacts.
- package/API/ORM/protocol-demonstration tests must pass.
- Terminal UI tests or Playwright checks must cover wallet, BTC fee, Read/Fit, range, read-right, journal, reconciliation, and operational health flows.
- the V28 commercial-MVP E2E runner must pass serially with deterministic Terminal, Auxillaries, BTD, MCP API, and ChatGPT App readiness mocks; Exchange and website Conversations suites must be split or excluded from V28 proof.
- commercial provider packages must declare the runtime SDK bindings they require directly, so dev-server provider module-resolution warnings are not normalized as QA noise.
- `pnpm -C apps/uapi build` must pass.
- `find apps/uapi/app/api -path '*v[0-9]*' -print | sort` must remain empty.
- `git diff --check` must pass.
