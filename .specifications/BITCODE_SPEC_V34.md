# Bitcode Spec V34

## Status

- Version: `V34`
- V34 state: canonical promotion complete; V34 is the active deployment-depth canon and the V34 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V34`
- Canonical proof-source commit: `cb339f0407231855043dcf7174c384f1ab6bd16c`
- Prior canonical anchor: `BITCODE_SPEC_V33.md`
- Prior generated proof appendix: `BITCODE_SPEC_V33_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v34-spec-family-report.json`, `.bitcode/v34-canonical-input-report.json`, `.bitcode/v34-canon-posture-drift-report.json`, `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, `.bitcode/v34-distributed-execution-runtime-receipts.json`, `.bitcode/v34-deployment-storage-posture.json`, `.bitcode/v34-secret-rotation-boundary-operations.json`, `.bitcode/v34-migration-cicd-approval-gates.json`, `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json`, `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json`, `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json`, `.bitcode/v34-promotion-readiness-report.json`, V34 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V34_PROVEN.md` as the generated proof appendix for V34 promotion
- Source parity state: V34 source-side deployment host capability catalog, environment lane contracts, distributed execution runtime receipts, storage posture, secret rotation, migration CI/CD approval gates, runtime observer and repair jobs, rollback/upgrade/data repair playbooks, local/staging-testnet deployment rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V34 file family
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V33`
- Notes companion: `BITCODE_SPEC_V34_NOTES.md`
- Delta companion: `BITCODE_SPEC_V34_DELTA.md`
- Parity companion: `BITCODE_SPEC_V34_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V34_PROVEN.md` only after V34 promotion
- Scope: V34 canonical system specification for deployment depth over promoted host capabilities, environment lanes, distributed executions, storage posture, credential operations, migration approvals, observers, repair jobs, rehearsal, and promotion readiness
- Last fully realized canonical target preserved in source: `V34`

V34 begins from promoted V33.
V33 closed commercial interface-depth across MCP API, ChatGPT App, public API, package-owned schemas, authorization policy, Read license and AssetPack rights contracts, compatibility matrices, telemetry/proof hooks, consumer UX proof, and promotion readiness.
V34 makes that commercial system operator-deployable: explicit host capabilities, environment lanes, distributed execution receipts, storage durability, deployment approvals, rollback, upgrade, secret rotation, data repair, and staging-testnet rehearsal become current-system law.

## Version executive summary

V34 is the deployment-depth version.
It turns the proven V33 commercial interface system into an operator-deployable system whose runtime conditions are as explicit as its Protocol/BTD and interface contracts.
Enterprise Bitcode operation must prove where the system is running, what capabilities are available, which lane admits which value posture, where durable state is stored, how long-running work is receipted, how migrations and promotions are approved, and how failures are repaired without leaking secrets, wallet material, protected source, or unpaid AssetPack contents.

V34 closes only when deployment operators and automated systems can:

- identify every required host capability for website, API, MCP, ChatGPT App, workers, observers, broadcasters, proof services, and repair jobs;
- prove which environment lane is running: local, regtest, signet, staging-testnet, public testnet, mainnet-ready dry run, or value-bearing mainnet;
- run distributed pipeline, ledger, wallet, settlement, storage, proof, and repair work with typed execution receipts and replayable roots;
- validate deployment approvals, migrations, generated artifacts, secrets, and rollback readiness before traffic or value-bearing activity is admitted;
- rehearse local and staging-testnet deployment closure without exposing protected source, credentials, wallet private material, or unpaid AssetPack contents.

## Canonical Bitcode executive summary

Bitcode measures technical knowledge, finds deposits that fit reviewed Reads, synthesizes source-bearing AssetPacks, and settles read rights in BTC with BTD range and rights receipts.
The active V33 canon remains:

- Deposits supply source material to the Bitcode depository.
- A Read Request is synthesized into a reviewed ReadNeed by `ReadNeedComprehensionSynthesis`.
- `ReadFitsFindingSynthesis` searches for plural threshold-passing fit deposits and synthesizes source-safe AssetPack preview records.
- Protected AssetPack source remains hidden before paid settlement.
- BTC is the fee asset and BTD range/read-license/right transfer is ledgerized.
- Paid settlement unlocks full AssetPack delivery, including pull-request delivery where applicable.

V34 does not redefine those laws.
V34 makes them deployable, observable, recoverable, and promotion-safe across concrete runtime lanes.

## V34 source-of-truth hierarchy

The V34 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V33` until V34 promotion.
2. `BITCODE_SPEC_V34.md` during V34 drafting.
3. `BITCODE_SPEC_V34_NOTES.md`.
4. `BITCODE_SPEC_V34_DELTA.md`.
5. `BITCODE_SPEC_V34_PARITY_MATRIX.md`.
6. generated V34 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V34_PROVEN.md` only after promotion.
8. source implementation, tests, examples, public docs, internal docs, and QA evidence that realize this family.

Older specifications are provenance only.
They must not become hidden current-system law.

## V34 full-system, re-implementation, and audit rule

V34 must be re-implementable and auditable from its specification family without reading conversation history.
Every host capability contract, environment lane, distributed runtime receipt, storage carrier, deployment approval, rollback plan, migration gate, secret rotation path, repair job, and promotion check must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V34 totality and precision enforcement rule

V34 fails closed when any deployable Bitcode surface lacks an explicit host capability, environment-lane posture, runtime receipt shape, storage durability posture, migration/approval gate, rollback path, secret boundary, and proof replay expectation.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions;
- interfaces are contract consumers, not owners of protocol truth;
- deployment lanes are runtime postures, not source version names;
- deployment receipts are auditable runtime records, not dashboard-only assertions.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V34 system goals, non-goals, and design principles

Goals:

- define a `DeploymentHostCapabilityCatalog` over website, API, MCP, ChatGPT App, workers, observers, broadcasters, proof services, and repair jobs;
- define an `EnvironmentLaneContract` over local, regtest, signet, staging-testnet, public testnet, mainnet-ready dry run, and value-bearing mainnet;
- define `DistributedExecutionRuntimeReceipt` records for long-running pipeline, ledger, wallet, proof, object-storage, and repair work;
- define `DeploymentStoragePosture` for ledger-derived state, canonical database projection, object storage, proof artifacts, audit logs, and rollback material;
- define `MigrationApprovalGate` and deployment CI/CD approvals for schema mutation, generated artifacts, promotion commits, Vercel/Supabase lanes, and secret availability;
- define `SecretRotationPlan`, `RollbackUpgradeRepairPlaybook`, `RuntimeObserverRepairJob`, and `DeploymentReadinessRehearsal`;
- rehearse local and staging-testnet deployment readiness before value-bearing mainnet can be considered.

Non-goals:

- no new BTD supply or tokenomics law;
- no rewrite of `ReadNeedComprehensionSynthesis` or `ReadFitsFindingSynthesis` product law;
- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no broad telemetry/documentation program breadth that belongs to V35;
- no value-bearing production-mainnet approval.

Design principles:

- deployment law before deployment convenience;
- lane posture before runtime execution;
- durable receipts before dashboard-only observability;
- migration approval before schema mutation;
- secret rotation before credential aging becomes operational risk;
- rollback and repair posture before traffic or value-bearing activity.

## V34 system architecture and layer boundaries

V34 preserves the V33 architecture and adds deployment-depth ownership:

- `packages/protocol` owns canon posture, spec-family checks, generated-proof helpers, promotion-governance helper APIs, and deployment proof helper APIs.
- `packages/btd` owns BTD range, read-license, rights transfer, wallet capability, fee posture, settlement, access policy, reconciliation primitives, and value-lane admission boundaries.
- `packages/api` owns JSON-safe reusable route contracts over package primitives and must expose deployment posture only through source-safe schemas.
- `packages/pipelines/asset-pack` owns Reading pipeline contracts and source-safe preview outputs; runtime hosts may execute pipelines but must not redefine them.
- `packages/executions-mcp` owns MCP server contracts and tool exposure; MCP deployment posture must derive from package-owned contracts.
- `packages/chatgptapp` owns ChatGPT App action contracts and source-safe response rendering.
- `uapi` owns commercial product routes and user interfaces, but not protocol truth or deployment law.
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.
- deployment host services own runtime carriers, queues, observers, broadcasters, repair jobs, object storage, and environment variables, but only through V34 contracts.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- Deployment hosts may run pipelines, observers, broadcasters, and repair jobs; they must not create alternate Protocol/BTD or Reading law.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Object storage carries source-bearing AssetPacks, proof bundles, generated artifacts, and rollback material only under explicit disclosure and retention policy.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, settlement posture, and denial reasons; they may not expose protected source before payment.
- Interface responses may expose proof roots and repair instructions; they must not expose secrets, service-role keys, wallet private material, provider tokens, raw protected prompts, or pre-settlement AssetPack source.
- Value-bearing mainnet activity is blocked until a future canon admits it; V34 may define readiness and dry-run proof, not production value launch.

## V34 proof/test package API and inherited support canon

V34 treats package APIs as the source of deployment truth.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, generated proof helpers, and V34 deployment check helpers.
- `@bitcode/btd` owns rights, range, fee, wallet, access, treasury, reconciliation, and value-lane admission primitives.
- `@bitcode/api` owns reusable JSON contracts for public API consumers and source-safe deployment posture.
- `@bitcode/pipeline-asset-pack` owns Reading pipeline contract surfaces and source-safe preview outputs.
- MCP and ChatGPT App packages consume those contracts rather than inventing protocol-local shapes.

The commercial protocol package owns the active/draft posture while V34 is in flight:

- `ACTIVE_CANON_VERSION = 'V33'`;
- `DRAFT_TARGET_VERSION = 'V34'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers remain exported through the package index;
- package tests and V34 checks fail closed on direct demonstration-source imports.

Any deployment object used by more than one runtime lane must have a package-owned type, builder, parser, validator, source-safe fixture, example, compatibility row, replay command, and generated artifact before the gate that depends on it closes.

## V34 canonical domain model

V34 adds deployment-facing contract objects over V33 protocol truth:

- `DeploymentHostCapabilityCatalog`: host id, runtime surface, required packages, outbound network posture, secret requirements, storage carriers, observer/broadcaster capability, repair capability, proof output paths, and admission status.
- `EnvironmentLaneContract`: lane id, supported Bitcoin network posture, Supabase/Vercel project posture, value-bearing admission, data-retention policy, wallet policy, secret scope, and proof requirements.
- `DistributedExecutionRuntimeReceipt`: execution id, host id, lane id, work kind, command or pipeline id, start/finish timestamps, `routeHandlerBoundary`, input root, output root, log root, object-storage root, ledger/database projection roots, wallet operation root, proof root, PTRR agent fields, ThricifiedGeneration fields, tool id, and repair posture. Required work kinds are `pipeline_run`, `ptrr_agent`, `thricified_generation`, `tool_call`, `ledger_operation`, `wallet_operation`, `proof_generation`, `object_storage_write`, and `repair_job`; long-running work uses `request_response_not_required` rather than route-handler completion.
- `DeploymentStoragePosture`: ledger-derived state, canonical database projection, object storage, proof artifacts, audit logs, rollback material, retention class, encryption posture, and repair command.
- `MigrationApprovalGate`: migration id, schema migration approval, schema diff root, generated type refresh root, route scans, build/test gates, generated artifact freshness, Vercel and Supabase lane checks, promotion commit approval, dry-run result, reviewer approval, rollback plan, deployment lane admission, proof roots, and no secret values serialization.
- `SecretRotationPlan`: secret family, storage owner, rotation cadence, rotation command, blast-radius note, proof root, leak-response path, runtime availability check, CI masking posture, audit event, and no secret values serialization policy.
- `RuntimeObserverRepairJob`: observer id, broadcaster id, repair job id, trigger, allowed lane, proof root, and replay command.
- `RollbackUpgradeRepairPlaybook`: rollback id, upgrade id, repair id, state carriers, validation commands, operator approval, and fail-closed posture.
- `DeploymentReadinessRehearsal`: local rehearsal, staging-testnet rehearsal, proof bundle, source-safe screenshots or logs, and admission verdict.
- `DeploymentPromotionReadinessReport`: Gate 10 artifact tying all V34 deployment gates, generated proofs, workflows, and promotion commands together.

Inherited V33 objects remain active: `Deposit`, `ReadRequest`, `ReadNeed`, `FindingFitsResult`, `AssetPackPreview`, `SettlementUnlock`, `BtcFeeQuote`, `BtdAssetPackMintReceipt`, `BtdReadReceipt`, `BtdRightsTransferReceipt`, `SourceToSharesProof`, `TerminalTransaction`, `McpToolContract`, `ChatGptAppActionContract`, `PublicApiRouteContract`, and `InterfaceTelemetryProofHook`.

## V34 gate plan

V34 closes through ten gates:

1. **Gate 1: V34 Deployment Roadmap And Spec Opening** opens the V34 family over V33 canon, updates `SPECIFICATIONS_ROADMAP.md`, documents V33 active / V34 draft posture, and wires `check:v34-gate1`.
2. **Gate 2: Host Capability And Environment Lane Catalog** inventories runtime hosts, services, queues, observers, broadcasters, storage carriers, and lanes through `DeploymentHostCapabilityCatalog` and `EnvironmentLaneContract`. It is closed by `packages/btd/src/deployment-host-capability-catalog.ts`, `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, `packages/btd/__tests__/deployment-host-capability-catalog.test.ts`, and `pnpm run check:v34-gate2`.
3. **Gate 3: Distributed Execution Runtime Contracts** defines `DistributedExecutionRuntimeReceipt` for long-running pipeline, PTRR agent, ThricifiedGeneration, tool, ledger, wallet, proof, object-storage, and repair work. It is closed by `packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts`, `.bitcode/v34-distributed-execution-runtime-receipts.json`, `packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts`, and `pnpm run check:v34-gate3`.
4. **Gate 4: Ledger Database Object Storage Deployment Posture** hardens ledger-derived state, database projection, object storage, generated proof artifacts, audit logs, backup, retention, and rollback material. It is closed by `packages/btd/src/deployment-storage-posture.ts`, `.bitcode/v34-deployment-storage-posture.json`, `packages/btd/__tests__/deployment-storage-posture.test.ts`, and `pnpm run check:v34-gate4`; source-bearing AssetPack storage remains locked before settlement.
5. **Gate 5: Secret Rotation And Credential Boundary Operations** defines secret families, storage owners, rotation commands, leak-response posture, CI masking, and runtime availability checks. It is closed by `packages/btd/src/secret-rotation-plan.ts`, `.bitcode/v34-secret-rotation-boundary-operations.json`, `packages/btd/__tests__/secret-rotation-plan.test.ts`, and `pnpm run check:v34-gate5`; OpenAI, Supabase, Vercel, GitHub, wallet, object storage, webhook, MCP, and ChatGPT App families are cataloged with no secret values in tracked artifacts or logs.
6. **Gate 6: Migration CI/CD Deployment Approval Gates** hardens schema migration approval, generated type refresh, route scans, build/test gates, generated artifact freshness, promotion commit checks, Vercel/Supabase lane checks, and deployment blockers. It is closed by `packages/btd/src/migration-approval-gate.ts`, `.bitcode/v34-migration-cicd-approval-gates.json`, `packages/btd/__tests__/migration-approval-gate.test.ts`, `scripts/check-v34-gate6-migration-cicd-approval-gates.mjs`, and `pnpm run check:v34-gate6`; every row carries dry-run, reviewer approval, rollback, proof-root, workflow-binding, lane-admission, and no secret values serialization posture.
7. **Gate 7: Runtime Observers Broadcasters Repair Jobs** makes settlement observers, ledger broadcasters, finality watchers, database projection repair jobs, object-storage repair jobs, generated proof jobs, and queue consumers explicit deployment jobs with receipts. It is closed by `packages/btd/src/runtime-observer-repair-job.ts`, `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json`, `packages/btd/__tests__/runtime-observer-repair-job.test.ts`, `scripts/check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs`, and `pnpm run check:v34-gate7`; every row carries host capability ids, non-value lane contracts, runtime receipt work kinds, replay command, repair command, proof roots, and unsafe drift blocking posture.
8. **Gate 8: Rollback Upgrade Data Repair Playbooks** defines operator playbooks for rollback, upgrade, migration rollback, object-storage repair, database repair, ledger projection repair, secret rotation incident response, and generated artifact repair. It is closed by `packages/btd/src/rollback-upgrade-repair-playbook.ts`, `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json`, `packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts`, `scripts/check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs`, and `pnpm run check:v34-gate8`; every playbook names entry condition, operator approval, commands, verification commands, proof roots, fail-closed result, state carriers, recovery boundary, and non-value lane admission.
9. **Gate 9: Local Staging Testnet Deployment Rehearsal** proves local and staging-testnet deployment readiness using source-safe rehearsal logs, runtime receipts, and UI/API validation without value-bearing mainnet admission.
10. **Gate 10: V34 Promotion Readiness** generates V34 proof artifacts, promotion readiness, active V34 / draft V35 posture, and canonical promotion support.

## V34 whole Bitcode operator chain

The V34 operator chain keeps V33 behavior and adds deployable runtime receipts:

1. Depositor supplies source material.
2. Bitcode records source-safe deposit measurement and proof roots.
3. Deployment hosts prove lane posture through `EnvironmentLaneContract`.
4. Runtime hosts prove available capabilities through `DeploymentHostCapabilityCatalog`.
5. Reader requests a Read through Terminal, API, MCP API, or ChatGPT App.
6. `ReadNeedComprehensionSynthesis` synthesizes a ReadNeed for review.
7. Reader approves or requests regeneration of the ReadNeed.
8. `ReadFitsFindingSynthesis` searches the depository for plural threshold-passing deposits.
9. Distributed execution records pipeline, tool, agent, and storage roots through `DistributedExecutionRuntimeReceipt`.
10. Bitcode synthesizes a source-safe AssetPack preview and fee quote.
11. Reader reviews measurements, fit quality, policy posture, fee, and rights preview without protected source leakage.
12. Reader settles BTC fee and receives the BTD read/right transfer.
13. Observers, broadcasters, repair jobs, and storage carriers reconcile settlement, finality, rights, delivery, and proof state.
14. Bitcode unlocks full AssetPack delivery and records synchronized ledger, database, object-storage, execution, and interface proof state.

## V34 canonical subsystem surfaces

The V34 subsystem coverage is total across repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, and generated artifacts and canonical promotion.

### Depositing and asset supply

- Current canonical objects and emitted artifacts: `Deposit`, depository asset id, measurement roots, embedding document roots, host capability rows, and interface-safe deposit summaries.
- Current algorithms and derivation rules: source intake, measurement, proof-root generation, policy classification, depository indexing, and storage lane placement.
- Current invariants and fail-closed conditions: invalid deposit, missing source proof, unsupported provider, policy denial, storage carrier drift, or protected-source leakage blocks projection.
- Current proof obligations: deposit measurement proof, source-safety class, host capability, and object-storage posture.
- Current source-bearing implementation basis: commercial package and `uapi` routes, not `protocol-demonstration`.
- Current validating commands and parity basis: V33 canonical proofs plus V34 host capability and storage posture checks.
- Current accepted boundaries: V34 does not change deposit ownership law.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: `ReadRequest`, `ReadNeed`, `ReadNeedComprehensionSynthesis`, PTRR agents, ThricifiedGenerations, prompt/tool registry records, execution receipts, and source-safe interface summaries.
- Current algorithms and derivation rules: prompt-part composition, PTRR plan/try/refine/retry, judged reasoning, typed output, reviewed Need acceptance, and distributed runtime receipt emission.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing review, auth denial, lane denial, or missing runtime receipt blocks Finding Fits.
- Current proof obligations: interface request schema, Need response schema, telemetry root, runtime receipt, and denial repair path.
- Current source-bearing implementation basis: commercial Reading packages and API routes.
- Current validating commands and parity basis: V33 Reading pipeline proof plus V34 distributed execution contracts.
- Current accepted boundaries: V34 does not rewrite Reading pipeline law.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: `FindingFitsResult`, plural fit deposits, search roots, ranking roots, verification decisions, source-safe preview fit metadata, and object-storage roots.
- Current algorithms and derivation rules: recall, vector search, ranking, threshold filters, verification, synthesis context selection, and runtime receipt derivation.
- Current invariants and fail-closed conditions: no-worthy-fit, no-survivor asset pack, provider failure, policy denial, lane denial, or protected-source leak blocks preview.
- Current proof obligations: candidate inventory, ranking root, source-safety class, distributed execution receipt, and source-safe preview schema.
- Current source-bearing implementation basis: commercial asset-pack pipeline package.
- Current validating commands and parity basis: V33 proof coverage plus V34 runtime receipt and deployment rehearsal checks.
- Current accepted boundaries: V34 does not broaden pre-settlement disclosure.

### Selection and materialization

- Current canonical objects and emitted artifacts: `AssetPackPreview`, protected AssetPack source lock, source-safe measurements, delivery admission, object-storage carrier record, and rollback material.
- Current algorithms and derivation rules: synthesis from fit deposits, preview projection, fee quote, paid unlock, storage, rollback materialization, and PR delivery after settlement.
- Current invariants and fail-closed conditions: unpaid disclosure, invalid fee quote, rights denial, object-storage drift, rollback gap, or delivery failure blocks source visibility.
- Current proof obligations: preview contract, delivery contract, object-storage root, rollback path, and pull-request proof where applicable.
- Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `packages/api`, and `uapi`.
- Current validating commands and parity basis: V33 rights/interface artifacts plus V34 storage and rehearsal checks.
- Current accepted boundaries: protected source is never an unpaid interface payload.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: `InterfaceAuthorizationPolicy`, organization authority, wallet capability, read-license posture, denial repair record, secret family, and rotation proof.
- Current algorithms and derivation rules: issuer validation, organization/team/role checks, wallet requirement checks, license checks, protected-source policy, secret availability, and rotation proof.
- Current invariants and fail-closed conditions: authorization denial, stale session, missing wallet, missing license, service-secret exposure, provider token exposure, stale secret, or missing rotation path blocks action.
- Current proof obligations: denied-state examples, policy row, source-safety row, secret boundary, and audit root.
- Current source-bearing implementation basis: packages, API middleware, MCP auth, ChatGPT App action guards, Terminal support surfaces, and deployment environment contracts.
- Current validating commands and parity basis: V33 auth proof plus V34 secret rotation and CI masking checks.
- Current accepted boundaries: no secret material is serialized into interface responses or tracked artifacts.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe preview, disclosure policy, redacted response, paid unlock, protected-source access record, projection receipt, and repair receipt.
- Current algorithms and derivation rules: source-safe projection, redaction, preview measurement rendering, paid unlock verification, response shaping, projection repair, and source-safe proof export.
- Current invariants and fail-closed conditions: public projection overexposure, unpaid protected-source request, incompatible consumer, stale proof, or stale projection blocks disclosure.
- Current proof obligations: disclosure-boundary tests, preview examples, paid/unpaid contrast fixtures, projection roots, and repair roots.
- Current source-bearing implementation basis: BTD access primitives, API serializers, MCP tools, ChatGPT App renderers, Terminal components, and repair jobs.
- Current validating commands and parity basis: V33 disclosure tests plus V34 observer/repair job checks.
- Current accepted boundaries: preview metadata may be public to the Reader; protected source requires settlement.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: `BtcFeeQuote`, settlement record, BTD receipts, rights transfer, source-to-shares proof, journal, reconciliation record, observer receipt, and broadcaster receipt.
- Current algorithms and derivation rules: fee quote, wallet/PSBT posture, finality observation, BTD read/right transfer, source-to-shares allocation, projection repair, and lane admission.
- Current invariants and fail-closed conditions: settlement conservation drift, invalid finality, underpayment, overpayment, projection drift, missing broadcaster receipt, or delivery mismatch blocks unlock.
- Current proof obligations: fee/root consistency, ledger/database sync, observer receipt, broadcaster receipt, reconciliation repair action, and interface replay hook.
- Current source-bearing implementation basis: `packages/btd`, ledger/database packages, deployment jobs, and API surfaces.
- Current validating commands and parity basis: V33 settlement proof plus V34 observer/broadcaster/repair job checks.
- Current accepted boundaries: production-mainnet value-bearing launch remains approval-gated outside V34.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: `InterfaceTelemetryProofHook`, execution record, ledger root, database root, object-storage root, generated proof artifact, runtime receipt, rehearsal log, and replay command.
- Current algorithms and derivation rules: request root, response root, event root, proof binding, replay command generation, rehearsal comparison, and fail-closed stale-artifact detection.
- Current invariants and fail-closed conditions: stale promoted status truth, missing replay hook, source-unsafe proof artifact, missing runtime receipt, or drift blocks promotion.
- Current proof obligations: generated artifact rows, command rows, proof roots, deployment receipt roots, and compatibility rows.
- Current source-bearing implementation basis: protocol package helpers, `.bitcode/` artifacts, workflows, V34 gate checkers, and deployment playbooks.
- Current validating commands and parity basis: V33 promotion proof plus V34 Gate 1 through Gate 10 checks.
- Current accepted boundaries: generated artifacts are source-safe and do not print secrets or protected source.

## V34 proof-family canon

### Inference-synthesis

- proofArtifactPath: `.bitcode/v34-deployment-inference-synthesis-proof.json`
- members: Reading pipeline deployment, AssetPack preview deployment, post-settlement delivery deployment.
- theoremIds: deployment-inference-runtime-receipted, deployment-inference-source-safe-response.
- replayStepIds: render schema, run fixture, parse result, compare proof roots.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`, `.bitcode/v34-canonical-input-report.json`
- current member closure criteria: every inference-adjacent deployed action names its pipeline, PTRR agent, step, sub-step, typed result, host id, lane id, and runtime receipt.
- current member verdict shape: pass, fail, blocked, or deferred with repair posture.
- current theorem-by-theorem closure reading: deployment hosts run inference law; they do not own inference law.
- current theorem-to-replay grouping: request, response, telemetry, runtime receipt, and proof-root replay.
- minimum artifact/replay binding set: spec-family report, canonical-input report, runtime receipt, and rehearsal log.
- current proof-object fields: hostId, laneId, executionId, actionId, requestRoot, responseRoot, sourceSafetyClass, replayCommand.
- generated-artifact and test bindings: V34 deployment artifacts through Gate 10, including `.bitcode/v34-promotion-readiness-report.json`.
- fail-closed conditions: missing schema, raw protected prompt, protected source, untyped output, missing runtime receipt, or stale proof root.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v34-deployment-prompt-completeness-proof.json`
- members: ReadNeed prompt projection, Finding Fits prompt projection, delivery prompt projection.
- theoremIds: deployment-prompts-redacted, deployment-prompt-contract-complete.
- replayStepIds: prompt registry digest, context key inventory, redaction check, response fixture check.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`
- current member closure criteria: prompt templates and interpolated prompts are represented by source-safe digests and context keys where deployment receipts need auditability.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: runtime observability does not mean prompt leakage.
- current theorem-to-replay grouping: prompt template digest, interpolated context keys, typed output, and runtime receipt.
- minimum artifact/replay binding set: prompt digest, context keys, action id, execution id, and host id.
- current proof-object fields: promptTemplateRoot, interpolatedContextKeys, responseRoot, redactionVerdict, laneId.
- generated-artifact and test bindings: V34 distributed execution runtime receipts.
- fail-closed conditions: missing prompt digest, unredacted protected prompt, untyped response, or missing lane posture.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v34-deployment-static-code-analysis-proof.json`
- members: versionless routes, deployment contract ownership, no demonstration imports, no secret literals.
- theoremIds: deployment-routes-unversioned, deployment-contracts-package-owned.
- replayStepIds: route scan, import scan, secret scan, schema export scan.
- witnessArtifactPaths: `.bitcode/v34-canonical-input-report.json`
- current member closure criteria: source keeps deployment contracts package-owned and versionless.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: static checks enforce architecture before runtime tests.
- current theorem-to-replay grouping: route path, import path, schema path, test path.
- minimum artifact/replay binding set: source path, checker command, expected pattern, failure message.
- current proof-object fields: path, checkId, verdict, repairHint.
- generated-artifact and test bindings: V34 Gate 1 checker and later deployment-depth checkers.
- fail-closed conditions: versioned route, demonstration import, tracked secret, or local-only deployment schema.

### Verification-decisions

- proofArtifactPath: `.bitcode/v34-deployment-verification-decisions-proof.json`
- members: lane admission, migration approval, secret availability, rehearsal verdict.
- theoremIds: deployment-denial-readable, deployment-approval-verified.
- replayStepIds: denied fixture, allowed fixture, stale fixture, repaired fixture.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`
- current member closure criteria: every deployment decision has machine-readable result plus operator-readable repair posture.
- current member verdict shape: allowed, denied, blocked, deferred, or repaired.
- current theorem-by-theorem closure reading: denial is a first-class deployment result, not an exception-shaped accident.
- current theorem-to-replay grouping: host, lane, migration, secret, storage, receipt, and proof.
- minimum artifact/replay binding set: decision id, cause, repair, proof root.
- current proof-object fields: decisionId, reason, repairAction, sourceSafetyClass, laneId.
- generated-artifact and test bindings: V34 Gate 2, Gate 5, Gate 6, and Gate 9.
- fail-closed conditions: ambiguous denial, missing repair, source-unsafe allowed result, or value-bearing lane without admission.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v34-deployment-selection-materialization-proof.json`
- members: selected fits, AssetPack preview, protected source lock, delivery admission, storage carrier.
- theoremIds: deployment-preview-source-safe, deployment-delivery-paid-only.
- replayStepIds: preview fixture, settlement fixture, delivery fixture, storage fixture.
- witnessArtifactPaths: `.bitcode/v34-canonical-input-report.json`
- current member closure criteria: deployed interfaces expose preview metadata before payment and source delivery only after settlement and storage admission.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: deployment convenience never crosses the protected-source boundary.
- current theorem-to-replay grouping: fits, preview, fee, settlement, storage, delivery.
- minimum artifact/replay binding set: AssetPack id, preview root, fee quote root, settlement root, storage root, delivery root.
- current proof-object fields: assetPackId, previewRoot, sourceLock, settlementState, objectStorageRoot.
- generated-artifact and test bindings: V34 Gate 4 and Gate 9.
- fail-closed conditions: unpaid source, missing fee quote, stale settlement, storage drift, or delivery mismatch.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v34-deployment-authorization-sensitive-flow-proof.json`
- members: API auth, MCP auth, ChatGPT App auth, organization authority, wallet capability, secret rotation, read-license policy.
- theoremIds: deployment-auth-fail-closed, deployment-secrets-not-serialized.
- replayStepIds: unauthenticated fixture, unauthorized fixture, authorized fixture, secret scan.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`
- current member closure criteria: every deployed action has an auth policy, lane policy, and secret boundary.
- current member verdict shape: allowed, denied, blocked, or deferred.
- current theorem-by-theorem closure reading: sensitive flow is governed by policy and rotation, not per-host custom logic.
- current theorem-to-replay grouping: issuer, organization, wallet, license, rights, disclosure, lane, and secret family.
- minimum artifact/replay binding set: policy id, input root, denial reason, repair posture, secret family id.
- current proof-object fields: authMode, policyId, denialReason, repairAction, sourceSafetyClass, secretFamily.
- generated-artifact and test bindings: V34 Gate 5.
- fail-closed conditions: missing auth policy, missing wallet, missing license, protected-source request, stale secret, or secret exposure.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v34-deployment-settlement-source-to-shares-proof.json`
- members: fee quote, BTD right transfer, source-to-shares projection, observer receipt, broadcaster receipt.
- theoremIds: deployment-settlement-root-stable, deployment-rights-transfer-visible-after-finality.
- replayStepIds: quote fixture, payment fixture, finality fixture, drift fixture.
- witnessArtifactPaths: `.bitcode/v34-canonical-input-report.json`
- current member closure criteria: deployed payment state matches ledger truth and repair posture.
- current member verdict shape: quoted, pending, final, drifted, repaired, or blocked.
- current theorem-by-theorem closure reading: deployment payment status is a projection of ledger truth.
- current theorem-to-replay grouping: fee quote, PSBT, broadcast, finality, rights, delivery, and repair.
- minimum artifact/replay binding set: quote root, transaction root, finality root, rights root, observer root.
- current proof-object fields: quoteRoot, finalityState, rightsState, reconciliationState, broadcasterReceiptRoot.
- generated-artifact and test bindings: V34 Gate 7 and Gate 8.
- fail-closed conditions: settlement conservation drift, projection drift, unpaid unlock, unsupported network posture, or missing observer receipt.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v34-deployment-disclosure-boundary-proof.json`
- members: source-safe preview, unpaid denial, paid unlock, redacted examples, storage access.
- theoremIds: deployment-preview-not-source, deployment-paid-unlock-source.
- replayStepIds: preview render, unpaid source request, paid delivery request, redaction scan.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`
- current member closure criteria: protected source cannot appear before settlement in logs, storage carriers, generated proofs, or interface responses.
- current member verdict shape: source-safe, denied, unlocked, or violation.
- current theorem-by-theorem closure reading: all deployment carriers share one disclosure boundary.
- current theorem-to-replay grouping: preview, fee, settlement, access, storage, delivery.
- minimum artifact/replay binding set: disclosure policy id, source-safety class, access state, storage root.
- current proof-object fields: disclosureState, sourceSafetyClass, accessPolicyId, deliveryAdmission, storageCarrier.
- generated-artifact and test bindings: V34 Gate 4, Gate 5, Gate 8, and Gate 9.
- fail-closed conditions: public projection overexposure, unpaid source, stale rights, storage overexposure, or missing redaction.

### Proof-contract

- proofArtifactPath: `.bitcode/v34-deployment-proof-contract-proof.json`
- members: spec-family report, canonical-input report, host capability catalog, runtime receipts, storage posture, rehearsal proof.
- theoremIds: deployment-proof-replayable, deployment-promotion-source-safe.
- replayStepIds: generate, check, replay, compare, promote.
- witnessArtifactPaths: `.bitcode/v34-spec-family-report.json`, `.bitcode/v34-canonical-input-report.json`
- current member closure criteria: every active deployment row has a replayable proof contract by V34 promotion.
- current member verdict shape: pass, fail, blocked, deferred, or promoted.
- current theorem-by-theorem closure reading: promotion depends on generated source-safe proof, not prose.
- current theorem-to-replay grouping: host, lane, schema, example, test, telemetry, ledger, database, object storage.
- minimum artifact/replay binding set: generated artifact, proof-source commit, replay command, failure taxonomy.
- current proof-object fields: artifactPath, proofSourceCommit, replayCommand, verdict, laneId.
- generated-artifact and test bindings: V34 Gate 10.
- fail-closed conditions: missing generated artifact, stale proof-source commit, source-unsafe payload, incomplete deployment matrix, or missing rehearsal.

## V34 generated canon

V34 generated canon includes specifying artifacts, deployment-depth gate artifacts, runtime receipt artifacts, storage posture artifacts, rehearsal artifacts, and the Gate 10 promotion readiness report.
Generated artifacts must be stable, source-safe, and explicitly tied to validation commands.

## V34 promotion readiness canon

V34 Gate 10 closes when `version/v34` can promote to active V34 without direct `main` writes.
The readiness report `.bitcode/v34-promotion-readiness-report.json` proves that all V34 deployment artifacts are present, source-safe, parseable, wired into gate checks, wired into promotion checks, generated proof appendix support, and workflow validation.
Promotion rewrites runtime posture from `V33` active / `V34` draft to `V34` active / `V35` draft and generates `BITCODE_SPEC_V34_PROVEN.md`.
The exact post-promotion readiness posture token is V34 active / V35 draft.

## V34 validation canon

Validation must include spec-family checks, canonical-input checks, canon-posture drift checks, V34 gate checks, package tests, deployment contract tests, runtime receipt checks, storage posture checks, and source-safe rehearsal checks.
Every gate must name the command that proves closure.

## V34 promotion canon

V34 promotion may occur only after all V34 gates are closed and `version/v34` is requested into `main`.
Promotion rewrites `BITCODE_SPEC.txt` from `V33` to `V34`, generates `BITCODE_SPEC_V34_PROVEN.md`, records source-safe `.bitcode/v34-*` evidence, and prepares active V34 / draft V35 posture.

## V34 appendices and canonical supporting material

The appendices below are binding checklists for V34 draft work and later promotion.

## V34 accepted boundaries and reopen conditions

Accepted boundaries:

- V34 owns deployment-depth, host capability truth, environment lanes, runtime receipts, storage posture, approval gates, rollback, upgrade, secret rotation, repair jobs, staging-testnet rehearsal, and promotion readiness.
- V34 may add deployment-owned telemetry/proof hooks, but V35 owns broad documentation and observability programs.
- V34 keeps Exchange and website Conversations product depth deferred.
- V34 keeps production-mainnet value-bearing launch blocked unless a future canon explicitly admits it.

Reopen conditions:

- a deployment lane admits value-bearing mainnet without future-canon authorization;
- a runtime host runs a protected workflow without a host capability row, lane contract, or runtime receipt;
- a generated deployment proof artifact contains secrets, protected source, or stale proof roots;
- storage, ledger, database, object-storage, or execution receipts drift without repair posture.

## V34 completion condition

V34 is complete when all ten gates are closed, deployment host capability and environment lanes are package-owned and tested, distributed execution receipts record long-running Reading and settlement work, storage posture is durable and source-safe, secret rotation and migration approvals fail closed, observer/broadcaster/repair jobs are explicit, local and staging-testnet rehearsals pass, generated artifacts are stable, and promotion can safely make V34 the active canon.

Gate 6 closure means schema migration approval, generated type refresh, route scans, build/test gates, generated artifact freshness, Vercel lane checks, Supabase lane checks, and promotion commit approval are now package-owned through `MigrationApprovalGate`. Approval rows block deployment unless dry-run evidence, reviewer approval, rollback posture, proof roots, workflow binding, and non-value lane admission are present, and tracked artifacts contain no secret values.

Gate 7 closure means settlement observers, ledger broadcasters, finality watchers, database projection repair jobs, object-storage repair jobs, generated proof jobs, and queue consumers are now package-owned through `RuntimeObserverRepairJob`. Runtime jobs block unlock, delivery, broadcast, or projection when unsafe drift is detected, require replayable runtime receipt work kinds, and serialize only source-safe observer, broadcaster, repair, lane, and proof-root metadata.

Gate 8 closure means rollback, upgrade, migration rollback, object-storage repair, database repair, ledger projection repair, secret rotation incident response, and generated artifact repair are now package-owned through `RollbackUpgradeRepairPlaybook`. Playbooks require operator approval, command sequence, verification command, proof-root basis, source-safe state carriers, recovery boundaries, and fail-closed results; they do not admit value-bearing mainnet and they serialize no credentials, wallet material, protected source, or source-bearing AssetPack contents.

## Appendix A. Canonical type and surface catalog

Primary V34 types: `DeploymentHostCapabilityCatalog`, `EnvironmentLaneContract`, `DistributedExecutionRuntimeReceipt`, `DeploymentStoragePosture`, `MigrationApprovalGate`, `SecretRotationPlan`, `RuntimeObserverRepairJob`, `RollbackUpgradeRepairPlaybook`, `DeploymentReadinessRehearsal`, and `DeploymentPromotionReadinessReport`.
Primary surfaces: website, API, MCP API, ChatGPT App, workers, observers, broadcasters, repair jobs, ledger projection, database projection, object-storage projection, and proof replay.

Gate 2 catalog rows are package-owned source-safe metadata.
Required host row ids are `website`, `api`, `mcp_api`, `chatgpt_app`, `pipeline_workers`, `runtime_observers`, `ledger_broadcasters`, `proof_services`, `repair_jobs`, `object_storage`, `database_projection`, and `ledger_projection`.
Required lane row ids are `local`, `regtest`, `signet`, `staging-testnet`, `public-testnet`, `mainnet-ready-dry-run`, and `value-bearing-mainnet`.
The `value-bearing-mainnet` lane is visible as `blocked_future_canon_required`; it admits no runtime hosts and carries `mainnet_value_blocked` wallet policy.
Each host row names owner package, runtime surface, runtime carrier, packages, network posture, secret family names without values, storage carrier, observer/broadcaster/repair capability, validation path, failure mode, repair posture, telemetry proof hook id, and deterministic proof root.
Each lane row names Bitcoin network posture, Supabase and Vercel project posture, value-bearing admission, retention, wallet policy, secret scope, proof requirements, admitted hosts, failure mode, repair posture, telemetry proof hook id, and deterministic proof root.

## Appendix B. Proof family closure catalog

Every V34 proof family is replayable from generated artifacts and source-safe fixtures.

## Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v34-deployment-inference-synthesis-proof.json` | runtime inference receipts | deployment-inference-runtime-receipted | run fixture | `.bitcode/v34-spec-family-report.json` | V33 Reading plus V34 runtime receipts |
| Prompt-completeness | `.bitcode/v34-deployment-prompt-completeness-proof.json` | prompt digest receipts | deployment-prompts-redacted | redaction check | `.bitcode/v34-spec-family-report.json` | V33 prompt registry plus V34 lane receipts |
| Static-code-analysis | `.bitcode/v34-deployment-static-code-analysis-proof.json` | route and import scans | deployment-routes-unversioned | route scan | `.bitcode/v34-canonical-input-report.json` | source tree |
| Verification-decisions | `.bitcode/v34-deployment-verification-decisions-proof.json` | lane decisions | deployment-approval-verified | denied fixture | `.bitcode/v34-spec-family-report.json` | V34 lane and approval contracts |
| Selection-and-materialization | `.bitcode/v34-deployment-selection-materialization-proof.json` | storage materialization | deployment-delivery-paid-only | storage fixture | `.bitcode/v34-canonical-input-report.json` | V33 AssetPack plus V34 storage posture |
| Authorization-and-sensitive-flow | `.bitcode/v34-deployment-authorization-sensitive-flow-proof.json` | secret and auth rows | deployment-secrets-not-serialized | secret scan | `.bitcode/v34-spec-family-report.json` | V33 auth plus V34 rotation contracts |
| Settlement-source-to-shares | `.bitcode/v34-deployment-settlement-source-to-shares-proof.json` | settlement observers | deployment-settlement-root-stable | finality fixture | `.bitcode/v34-canonical-input-report.json` | V33 BTD settlement plus V34 observers |
| Disclosure-boundary | `.bitcode/v34-deployment-disclosure-boundary-proof.json` | storage disclosure | deployment-preview-not-source | redaction scan | `.bitcode/v34-spec-family-report.json` | V33 disclosure plus V34 storage |
| Proof-contract | `.bitcode/v34-deployment-proof-contract-proof.json` | promotion proof | deployment-proof-replayable | promote | `.bitcode/v34-spec-family-report.json` | V34 generated artifacts |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

V34 preserves inherited generated appendix structure and source-safe generated artifact inventories.

### Inherited V20 operator-quality artifacts

V34 preserves operator-quality proof output expectations and extends them to deployment operations.

### Exact generated-artifact inventory matrix

| artifactPath | owner | sourceSafety | validation |
| --- | --- | --- | --- |
| `.bitcode/v34-spec-family-report.json` | protocol | source-safe | `node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33` |
| `.bitcode/v34-canonical-input-report.json` | protocol | source-safe | `node scripts/check-bitcode-canonical-inputs.mjs --current-target V33` |
| `.bitcode/v34-deployment-host-capability-catalog.json` | btd | source-safe-deployment-host-capability-metadata | `pnpm run check:v34-host-capability-environment-lanes` |
| `.bitcode/v34-environment-lane-contracts.json` | btd | source-safe-environment-lane-contract-metadata | `pnpm run check:v34-host-capability-environment-lanes` |
| `.bitcode/v34-distributed-execution-runtime-receipts.json` | pipeline-hosts | source-safe-distributed-execution-runtime-receipts | `pnpm run check:v34-distributed-execution-runtime-receipts` |
| `.bitcode/v34-deployment-storage-posture.json` | btd | source-safe-deployment-storage-posture-metadata | `pnpm run check:v34-deployment-storage-posture` |
| `.bitcode/v34-secret-rotation-boundary-operations.json` | btd | source-safe-secret-rotation-boundary-metadata | `pnpm run check:v34-secret-rotation-boundary-operations` |
| `.bitcode/v34-migration-cicd-approval-gates.json` | btd | source-safe-migration-cicd-approval-gate-metadata | `pnpm run check:v34-migration-cicd-approval-gates` |
| `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json` | btd | source-safe-runtime-observer-repair-job-metadata | `pnpm run check:v34-runtime-observers-broadcasters-repair-jobs` |
| `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json` | btd | source-safe-rollback-upgrade-repair-playbook-metadata | `pnpm run check:v34-rollback-upgrade-data-repair-playbooks` |
| `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json` | btd | source-safe-deployment-readiness-rehearsal-metadata | `pnpm run check:v34-local-staging-testnet-deployment-rehearsal` |
| `.bitcode/v34-promotion-readiness-report.json` | protocol | source-safe-deployment-promotion-readiness-metadata | `pnpm run check:v34-gate10` |

### V34 specifying generated artifacts

Gate 1 requires `.bitcode/v34-spec-family-report.json` and `.bitcode/v34-canonical-input-report.json` to be declared.
Gate 2 requires `.bitcode/v34-deployment-host-capability-catalog.json` and `.bitcode/v34-environment-lane-contracts.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate2`.
Gate 3 requires `.bitcode/v34-distributed-execution-runtime-receipts.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate3`, with receipt coverage for `pipeline_run`, `ptrr_agent`, `thricified_generation`, `tool_call`, `ledger_operation`, `wallet_operation`, `proof_generation`, `object_storage_write`, and `repair_job`.
Gate 4 requires `.bitcode/v34-deployment-storage-posture.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate4`, with ledger-derived state, database projection, object storage, proof artifacts, audit logs, backups, rollback material, retention, encryption, and source-bearing AssetPack lock coverage.
Gate 5 requires `.bitcode/v34-secret-rotation-boundary-operations.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate5`, with OpenAI, Supabase, Vercel, GitHub, wallet, object storage, webhook, MCP, and ChatGPT App secret-family coverage and no secret values in generated artifacts or logs.
Gate 6 requires `.bitcode/v34-migration-cicd-approval-gates.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate6`, with schema migration approval, generated type refresh, route scans, build/test gates, generated artifact freshness, Vercel/Supabase lane checks, promotion commit approval, reviewer approval, rollback, dry-run, proof-root, workflow-binding, and no secret values coverage.
Gate 7 requires `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate7`, with settlement observers, ledger broadcasters, finality watchers, database projection repair, object-storage repair, generated proof jobs, queue consumers, runtime receipt, replay command, repair command, and unsafe drift coverage.
Gate 8 requires `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate8`, with rollback, upgrade, migration rollback, object-storage repair, database repair, ledger projection repair, secret rotation incident response, generated artifact repair, operator approval, command, verification, proof-root, fail-closed, and non-value lane coverage.
Gate 9 requires `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate9`, with `DeploymentReadinessRehearsal` rows for local full-stack deployment rehearsal, staging-testnet full-stack deployment rehearsal, and value-bearing mainnet blocked rehearsal. The rehearsal covers Terminal, public API, MCP API, ChatGPT App, Reading pipeline execution receipts, settlement/finality simulation, storage posture, repair posture, source-safe logs, proof-rooted screenshots or logs, validation commands, proof roots, and value-bearing mainnet blocking.
Gate 10 requires `.bitcode/v34-promotion-readiness-report.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v34-gate10`, with coverage for every V34 deployment artifact, V34 promotion command planning, generated appendix support, workflow support, source-safe report metadata, and active V34 / draft V35 post-promotion posture.

### Shared generated-artifact fields

Every V34 generated artifact carries artifact id, generatedAt, proof-source commit, active canon target, draft target, source safety class, validation command, and fail closed when the artifact is stale or source-unsafe.

### Artifact-specific generated payload fields

Deployment artifacts additionally carry host id, lane id, storage carrier, execution id, observer id, broadcaster id, repair id, migration id, secret family id, rollback id, and rehearsal id when applicable.

### Artifact confidentiality and disclosability taxonomy

Artifacts are public, internal, buyer-visible, reviewer-visible, or operator-only.
Public anchors must not leak non-disclosable artifacts, secrets, protected source, raw protected prompts, wallet private material, or service-role credentials.

### Minimum generated appendix rendered contents

The generated appendix must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any artifact is missing or stale.

### Canonical regeneration and fail-closed posture

Canonical regeneration fails closed when generated inputs drift, source safety fails, required artifacts are absent, validation commands fail, or promotion posture is stale.

## Appendix D. Validation and checking gate catalog

Gate 1 validation is `pnpm run check:v34-gate1`.
Gate 2 validation is `pnpm run check:v34-gate2`, with artifact freshness checked by `pnpm run check:v34-host-capability-environment-lanes` and focused package coverage in `packages/btd/__tests__/deployment-host-capability-catalog.test.ts`.
Gate 3 validation is `pnpm run check:v34-gate3`, with artifact freshness checked by `pnpm run check:v34-distributed-execution-runtime-receipts` and focused package coverage in `packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts`.
Gate 10 validation is `pnpm run check:v34-gate10`, with artifact freshness checked by `pnpm run check:v34-promotion-readiness`, package coverage in `packages/btd/__tests__/deployment-promotion-readiness-report.test.ts`, and canonical promotion dry-run coverage through `node scripts/promote-bitcode-canon.mjs --version V34 --commit HEAD --dry-run`.
The gate-quality workflow also runs spec-family, canonical-input, canon-posture drift, and diff hygiene checks.
Gate 10 keeps promotion blocked when deployment artifacts, generated proof support, workflow bindings, runtime posture rewrite support, source safety, or promotion command planning are missing.

## Appendix E. Current canonical source map

- `BITCODE_SPEC.txt` points to active V33 during V34 drafting.
- `BITCODE_SPEC_V33.md` and `BITCODE_SPEC_V33_PROVEN.md` are the prior canonical anchor and proof appendix.
- `BITCODE_SPEC_V34.md`, notes, delta, and parity are the draft family.
- `packages/protocol/src/canon-posture.js`, `protocol-demonstration/src/canon-posture.js`, and `packages/protocol/data/state.json` carry V33 active / V34 draft posture.
- `_legacy/` is historical only.

## Appendix F. Subsystem totality and derivability matrix

Every V34 deployment object must derive from source, spec, generated artifact, test, and replay command.
No host/runtime capability truth, operator experience and pedagogy, validation and test stack, generated artifacts and canonical promotion, or telemetry, persistence, state, and failure semantics row may be asserted by prose alone.

## Appendix G. Canonical file-family and promotion contract catalog

The V34 file family is `BITCODE_SPEC_V34.md`, `BITCODE_SPEC_V34_NOTES.md`, `BITCODE_SPEC_V34_DELTA.md`, `BITCODE_SPEC_V34_PARITY_MATRIX.md`, and eventually `BITCODE_SPEC_V34_PROVEN.md`.
Promotion rewrites `BITCODE_SPEC.txt` only after promotion-grade validations pass on `version/v34`.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include GitHub workflows, local scripts, Vercel deployments, Supabase lanes, object-storage carriers, CLI proof commands, Terminal runtime views, MCP API actions, ChatGPT App actions, and public API routes.
Quality contracts require greenable CI, deterministic generated artifacts, readable repair posture, source-safe logs, and no direct `main` pushes.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Required cross-product scenarios remain active for auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.
V34 adds deployment rehearsal scenarios that prove local, staging-testnet, public testnet, mainnet-ready dry run, and blocked value-bearing mainnet posture.

## Appendix J. Fail-closed contract and error posture matrix

V34 preserves existing fail-closed causes: invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.
V34 adds deployment-specific causes: missing host capability, missing environment lane, missing runtime receipt, stale secret, migration approval denial, object-storage drift, observer drift, broadcaster drift, rollback gap, rehearsal failure, and value-bearing mainnet blocked.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts remain governed by `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V34_PROVEN.md`.
V34 adds deployment storage posture and runtime receipt proof around those artifacts; it does not make protected source visible before settlement.
