# Bitcode Spec V35

## Status

- Version: `V35`
- V35 state: canonical promotion complete; V35 is the active telemetry and documentation depth canon and the V35 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V35`
- Canonical proof-source commit: `db74a494377c1f68d5354c3c2f24fb29c38906bb`
- Prior canonical anchor: `BITCODE_SPEC_V34.md`
- Prior generated proof appendix: `BITCODE_SPEC_V34_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v35-spec-family-report.json`, `.bitcode/v35-canonical-input-report.json`, `.bitcode/v35-canon-posture-drift-report.json`, `.bitcode/v35-documentation-surface-catalog.json`, `.bitcode/v35-telemetry-taxonomy-catalog.json`, `.bitcode/v35-public-docs-usage-guides.json`, `.bitcode/v35-operator-runbook-catalog.json`, `.bitcode/v35-docs-qa-alignment-report.json`, `.bitcode/v35-testnet-rollout-readiness-guide.json`, `.bitcode/v35-telemetry-documentation-interface-integration.json`, `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json`, `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json`, V35 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V35_PROVEN.md` as the generated proof appendix for V35 promotion
- Source parity state: V35 source-side documentation surface catalog, telemetry taxonomy catalog, public docs usage guides, operator runbook catalog, docs QA report, testnet rollout guide, telemetry documentation interface integration, local staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V35 file family
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V34`
- Notes companion: `BITCODE_SPEC_V35_NOTES.md`
- Delta companion: `BITCODE_SPEC_V35_DELTA.md`
- Parity companion: `BITCODE_SPEC_V35_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V35_PROVEN.md` only after V35 promotion
- Scope: V35 canonical system specification for telemetry and documentation depth over promoted documentation surfaces, telemetry taxonomy, public docs, runbooks, docs QA, rollout guides, interface integration, local/staging rehearsal, and promotion readiness
- Last fully realized canonical target preserved in source: `V35`

## Version executive summary

V35 is the telemetry and documentation depth version.
It turns the deployed V34 system into an understandable, supportable, inspectable, and testnet-rollout-ready product whose operational truth is visible through source-safe telemetry, internal codebase documentation, public `/docs`, dashboards, runbooks, incident response, operator escalation, and documentation QA.

Enterprise Bitcode operation must prove not only that the system can run, but that every operator, contributor, enterprise reader, depositor, interface consumer, and incident responder can understand the system from maintained docs and source-safe telemetry without reading conversation history, protected source, secret values, wallet private material, or unpaid AssetPack contents.

V35 closes only when operators and automated systems can:

- enumerate the documentation surface for source packages, routes, data models, proof artifacts, deployment lanes, and interface contracts;
- expose public `/docs` usage guidance for Terminal, Protocol, Auxillaries, MCP API, ChatGPT App, BTD, AssetPack ranges, reads, fees, and proof posture;
- define a source-safe telemetry taxonomy across pipelines, executions, PTRR agents, ThricifiedGenerations, tools, ledger operations, wallet operations, storage operations, interfaces, deployments, observers, repair jobs, docs QA, and promotion workflows;
- bind dashboards, alert runbooks, incident response, and operator escalation to telemetry events and proof roots;
- fail documentation QA when code, SPEC, parity, generated proof, public docs, internal docs, telemetry events, and deployment receipts drift.

## V35 telemetry and documentation spine

V35 adds documentation and telemetry contract objects over V34 deployment law:

- `TelemetryTaxonomyCatalog`: event family, event id, source surface, lifecycle stage, severity, source-safety class, redaction posture, correlation ids, proof root, storage target, dashboard panel, alert threshold, and repair/runbook link.
- `DocumentationSurfaceCatalog`: documentation surface id, audience, owner, source roots, public/private disclosure class, freshness checks, linked spec sections, linked generated artifacts, and test coverage.
- `DocsQaAlignmentReport`: code/spec/docs/proof alignment id, checked sources, expected tokens, stale-token blockers, generated artifact roots, public docs roots, internal docs roots, and fail-closed result.
- `OperatorRunbookCatalog`: alert id, runbook id, incident class, escalation path, commands, safe data allowed, forbidden data, proof roots, rollback/repair references, and post-incident documentation update requirements.
- `TestnetRolloutReadinessGuide`: onboarding path, operator path, enterprise reader path, depositor path, interface consumer path, environment lane references, wallet/settlement caveats, known blockers, and rehearsal evidence.

V35 does not replace V34 deployment contracts.
It documents, instruments, monitors, and validates them as user-facing and operator-facing truth.

## Canonical Bitcode executive summary

Bitcode measures technical knowledge, finds deposits that fit reviewed Reads, synthesizes source-bearing AssetPacks, and settles read rights in BTC with BTD range and rights receipts.
The active V34 canon remains:

- Deposits supply source material to the Bitcode depository.
- A Read Request is synthesized into a reviewed ReadNeed by `ReadNeedComprehensionSynthesis`.
- `ReadFitsFindingSynthesis` searches for plural threshold-passing fit deposits and synthesizes source-safe AssetPack preview records.
- Protected AssetPack source remains hidden before paid settlement.
- BTC is the fee asset and BTD range/read-license/right transfer is ledgerized.
- Paid settlement unlocks full AssetPack delivery, including pull-request delivery where applicable.

V35 does not redefine those laws.
V35 makes them deployable, observable, recoverable, and promotion-safe across concrete runtime lanes.

## V35 source-of-truth hierarchy

The V35 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V34` until V35 promotion.
2. `BITCODE_SPEC_V35.md` during V35 drafting.
3. `BITCODE_SPEC_V35_NOTES.md`.
4. `BITCODE_SPEC_V35_DELTA.md`.
5. `BITCODE_SPEC_V35_PARITY_MATRIX.md`.
6. generated V35 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V35_PROVEN.md` only after promotion.
8. source implementation, tests, examples, public docs, internal docs, and QA evidence that realize this family.

Older specifications are provenance only.
They must not become hidden current-system law.

## V35 full-system, re-implementation, and audit rule

V35 must be re-implementable and auditable from its specification family without reading conversation history.
Every documentation surface, telemetry event family, dashboard, alert, runbook, incident class, escalation path, docs QA check, rollout guide, interface integration, rehearsal, and promotion check must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V35 totality and precision enforcement rule

V35 fails closed when any observable or documented Bitcode surface lacks an explicit documentation owner, telemetry event family, source-safety class, redaction posture, proof root, freshness check, runbook or repair link where needed, and proof replay expectation.
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
- deployment lanes and receipts are inherited V34 runtime law, not source version names or dashboard-only assertions;
- documentation and telemetry contracts are package-owned proof surfaces, not prose-only dashboard assertions.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V35 system goals, non-goals, and design principles

Goals:

- define a `TelemetryTaxonomyCatalog` for source-safe runtime, pipeline, interface, ledger, wallet, storage, deployment, repair, documentation QA, and promotion events;
- define a `DocumentationSurfaceCatalog` for internal codebase docs and public `/docs` surfaces;
- define `DocsQaAlignmentReport` checks that fail closed on code/spec/docs/proof/generated-artifact drift;
- define `OperatorRunbookCatalog` coverage for dashboards, alert runbooks, incidents, escalation, repair, and post-incident documentation updates;
- define `TestnetRolloutReadinessGuide` material for developers, operators, enterprise readers, depositors, and interface consumers;
- make telemetry and documentation source-safe, disclosure-aware, proof-rooted, and tied to V34 deployment lanes and receipts.

Non-goals:

- no new BTD supply or tokenomics law;
- no rewrite of `ReadNeedComprehensionSynthesis` or `ReadFitsFindingSynthesis` product law;
- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no replacement of V34 host capability, deployment, storage, migration, secret, observer, repair, or rehearsal law;
- no value-bearing production-mainnet approval.

Design principles:

- source-safe telemetry before dashboard polish;
- maintained documentation before operator dependence;
- public docs disclose measurements and proofs, not protected source;
- internal docs teach source ownership without leaking secrets or wallet material;
- runbooks bind alerts to exact repair and escalation paths;
- documentation QA fails closed when source, specs, generated proofs, or docs drift.

## V35 system architecture and layer boundaries

V35 preserves the V34 architecture and adds telemetry/documentation ownership:

- `packages/protocol` owns canon posture, spec-family checks, generated-proof helpers, promotion-governance helper APIs, and deployment proof helper APIs.
- `packages/btd` owns BTD range, read-license, rights transfer, wallet capability, fee posture, settlement, access policy, reconciliation primitives, and value-lane admission boundaries.
- `packages/api` owns JSON-safe reusable route contracts over package primitives and must expose deployment posture only through source-safe schemas.
- `packages/pipelines/asset-pack` owns Reading pipeline contracts and source-safe preview outputs; runtime hosts may execute pipelines but must not redefine them.
- `packages/executions-mcp` owns MCP server contracts and tool exposure; MCP deployment posture must derive from package-owned contracts.
- `packages/chatgptapp` owns ChatGPT App action contracts and source-safe response rendering.
- `uapi` owns commercial product routes and user interfaces, but not protocol truth or deployment law.
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.
- deployment host services own runtime carriers, queues, observers, broadcasters, repair jobs, object storage, and environment variables through V34 contracts; V35 documents and instruments them.
- public `/docs` surfaces own enterprise-facing guidance but must derive from protocol/package truth.
- internal documentation surfaces own contributor/operator guidance but must remain source-rooted and freshness-checked.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- Deployment hosts may run pipelines, observers, broadcasters, and repair jobs; they must not create alternate Protocol/BTD or Reading law.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Object storage carries source-bearing AssetPacks, proof bundles, generated artifacts, and rollback material only under explicit disclosure and retention policy.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, settlement posture, and denial reasons; they may not expose protected source before payment.
- Interface responses may expose proof roots and repair instructions; they must not expose secrets, service-role keys, wallet private material, provider tokens, raw protected prompts, or pre-settlement AssetPack source.
- Value-bearing mainnet activity is blocked until a future canon admits it; V35 may define readiness and dry-run proof, not production value launch.

## V35 proof/test package API and inherited support canon

V35 treats package APIs as the source of telemetry and documentation truth.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, generated proof helpers, and V35 telemetry/documentation check helpers.
- `@bitcode/btd` owns rights, range, fee, wallet, access, treasury, reconciliation, and value-lane admission primitives.
- `@bitcode/api` owns reusable JSON contracts for public API consumers and source-safe telemetry/docs posture.
- `@bitcode/pipeline-asset-pack` owns Reading pipeline contract surfaces and source-safe preview outputs.
- MCP and ChatGPT App packages consume those contracts rather than inventing protocol-local shapes.

The commercial protocol package owns the active/draft posture while V35 is in flight:

- `ACTIVE_CANON_VERSION = 'V34'`;
- `DRAFT_TARGET_VERSION = 'V35'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers remain exported through the package index;
- package tests and V35 checks fail closed on direct demonstration-source imports and source-unsafe docs or telemetry output.

Any telemetry or documentation object used by more than one runtime lane, interface, package, docs surface, dashboard, or runbook must have a package-owned type, builder, parser, validator, source-safe fixture, example, compatibility row, replay command where relevant, and generated artifact before the gate that depends on it closes.

## V35 canonical domain model

V35 adds telemetry and documentation contract objects over V34 protocol and deployment truth:

- `TelemetryTaxonomyCatalog`: event family, event id, source surface, lifecycle stage, severity, lane, source-safety class, redaction posture, correlation ids, proof root, storage target, dashboard panel, alert threshold, and runbook link.
- `DocumentationSurfaceCatalog`: docs surface id, audience, owner, source roots, public/private disclosure class, freshness checks, linked spec sections, linked generated artifacts, route/package bindings, and proof coverage.
- `DocsQaAlignmentReport`: alignment id, checked source paths, spec tokens, public docs tokens, internal docs tokens, generated proof tokens, stale-token blockers, source-safe artifact roots, and fail-closed result.
- `OperatorRunbookCatalog`: alert id, runbook id, incident class, escalation path, command sequence, safe data allowed, forbidden data, proof roots, repair references, and post-incident documentation update requirements.
- `TestnetRolloutReadinessGuide`: developer path, operator path, enterprise reader path, depositor path, interface consumer path, environment lane references, wallet/settlement caveats, known blockers, and rehearsal evidence.
- `LocalStagingTelemetryDocumentationRehearsal`: local/staging-testnet lane id, documentation discovery phase, telemetry event emission phase, dashboard/runbook lookup phase, docs QA phase, incident drill phase, source-safe proof-root review phase, redacted screenshot/log roots, evidence roots, and blocked value-bearing mainnet posture.
- `DocumentationTelemetryPromotionReadinessReport`: Gate 10 artifact tying all V35 telemetry/documentation gates, generated proofs, workflows, docs QA, and promotion commands together.

Inherited V34 objects remain active: `Deposit`, `ReadRequest`, `ReadNeed`, `FindingFitsResult`, `AssetPackPreview`, `SettlementUnlock`, `BtcFeeQuote`, `BtdAssetPackMintReceipt`, `BtdReadReceipt`, `BtdRightsTransferReceipt`, `SourceToSharesProof`, `TerminalTransaction`, `McpToolContract`, `ChatGptAppActionContract`, `PublicApiRouteContract`, and `InterfaceTelemetryProofHook`.
Inherited V34 deployment objects remain active: `DeploymentHostCapabilityCatalog`, `EnvironmentLaneContract`, `DistributedExecutionRuntimeReceipt`, `DeploymentStoragePosture`, `MigrationApprovalGate`, `SecretRotationPlan`, `RuntimeObserverRepairJob`, `RollbackUpgradeRepairPlaybook`, `DeploymentReadinessRehearsal`, and `DeploymentPromotionReadinessReport`.

## V35 gate plan

V35 closes through ten gates:

1. **Gate 1: V35 Telemetry Documentation Roadmap And Spec Opening** opens the V35 family over V34 canon, updates `SPECIFICATIONS_ROADMAP.md`, documents V34 active / V35 draft posture, and wires `check:v35-gate1`.
2. **Gate 2: Documentation Surface Catalog** inventories internal codebase docs, public `/docs`, package docs, route docs, generated artifacts, API/interface docs, and owner/freshness posture through `DocumentationSurfaceCatalog`.
3. **Gate 3: Telemetry Taxonomy Event Schema And Redaction** defines `TelemetryTaxonomyCatalog` across pipelines, executions, PTRR agents, ThricifiedGenerations, tools, ledger, wallet, storage, interfaces, deployments, observers, repair jobs, docs QA, and promotion workflows.
4. **Gate 4: Public Docs Usage Guides** deepens public `/docs` guidance for Terminal, Protocol, Auxillaries, MCP API, ChatGPT App, BTD, AssetPack ranges, reads, fees, proof posture, and deferred Exchange/Conversations boundaries.
5. **Gate 5: Dashboards Alerts Runbooks Incident Escalation** binds telemetry taxonomy events to dashboard panels, alert thresholds, runbooks, incident classes, escalation paths, and post-incident docs updates through `OperatorRunbookCatalog`.
6. **Gate 6: Documentation QA Alignment Proofs** defines `DocsQaAlignmentReport` and fail-closed checks across code, SPEC, DELTA, NOTES, PARITY, PROVEN, generated artifacts, public docs, internal docs, and route/interface docs.
7. **Gate 7: Developer Operator Testnet Rollout Guides** creates `TestnetRolloutReadinessGuide` coverage for contributor onboarding, operator use, enterprise reader flows, depositor flows, interface consumers, environment lanes, wallet/settlement caveats, and known blockers.
8. **Gate 8: Telemetry Documentation Interface Integration** wires docs and telemetry contracts through Terminal, Auxillaries, API, MCP API, ChatGPT App, package READMEs, and source-safe route payloads without exposing protected source or secrets.
9. **Gate 9: Local Staging Telemetry Documentation Rehearsal** materializes `LocalStagingTelemetryDocumentationRehearsal` to rehearse local and staging-testnet telemetry/docs visibility, dashboard/runbook paths, docs QA, incident drills, source-safe proof roots, and blocked value-bearing mainnet posture.
10. **Gate 10: V35 Promotion Readiness** generates V35 telemetry/documentation proof artifacts, promotion readiness, active V35 / draft V36 posture, and canonical promotion support.

## V35 DocumentationSurfaceCatalog canon

Gate 2 materializes `DocumentationSurfaceCatalog` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-documentation-surface-catalog.json` carries `source-safe-documentation-surface-metadata` and proves twelve required documentation surface rows:

- `canonical_spec_family`
- `roadmap_contributor_governance`
- `internal_codebase_docs`
- `public_docs_surface`
- `package_readmes`
- `route_api_docs`
- `api_interface_docs`
- `generated_artifact_docs`
- `deployment_operations_docs`
- `telemetry_observability_docs`
- `demonstration_docs`
- `security_boundary_docs`

Every row names audience, owner, disclosure class, source roots, linked spec sections, linked generated artifacts, route or package bindings, proof coverage, forbidden content, freshness checks, and deterministic row root.
The catalog fails closed on missing source roots, stale source roots, `_legacy/` source roots, secret-shaped values, unsupported public disclosure, protected source, wallet private material, provider tokens, raw protected prompts, and unpaid AssetPack source.
The artifact is generated by `pnpm run generate:v35-documentation-surface-catalog`, checked by `pnpm run check:v35-documentation-surface-catalog`, closed by `pnpm run check:v35-gate2`, and exported by `@bitcode/protocol` through `buildDocumentationSurfaceCatalog`.

## V35 TelemetryTaxonomyCatalog canon

Gate 3 materializes `TelemetryTaxonomyCatalog` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-telemetry-taxonomy-catalog.json` carries `source-safe-telemetry-taxonomy-metadata` and proves fourteen required event-family rows:

- `pipeline`
- `execution`
- `ptrr_agent`
- `thricified_generation`
- `tool`
- `ledger`
- `wallet`
- `storage`
- `interface`
- `deployment`
- `observer`
- `repair`
- `docs_qa`
- `promotion`

Every row names event ids, source surface, lifecycle stage, severity, source-safety class, redaction posture, correlation ids, proof root fields, storage target, dashboard panel, alert threshold, runbook link, source roots, replay expectation, and deterministic row root.
Pipeline, PTRR agent, and ThricifiedGeneration rows preserve the formal abstraction vocabulary: executions are base runtime records, pipelines compose phases, agents are PTRR agents, PTRR steps remain the four formal steps, sub-steps are ThricifiedGenerations, tools are registry-backed calls, and prompts remain prompt-part and prompt-template registry compositions.
Telemetry payloads are source-safe metadata only.
They may carry event ids, correlation ids, proof roots, counts, state enums, policy ids, dashboard panel ids, and runbook ids.
They must not carry secret values, service key values, provider tokens, wallet private material, raw protected prompts, raw model responses with protected source, protected source payloads, or unpaid AssetPack source.
The catalog fails closed on missing event families, missing source roots, missing runbook links, missing dashboard panels, missing proof root fields, missing redaction posture, missing correlation ids, secret-shaped markers, protected source disclosure, wallet private material disclosure, raw protected prompts, and unpaid AssetPack source disclosure.
The artifact is generated by `pnpm run generate:v35-telemetry-taxonomy-catalog`, checked by `pnpm run check:v35-telemetry-taxonomy-catalog`, closed by `pnpm run check:v35-gate3`, and exported by `@bitcode/protocol` through `buildTelemetryTaxonomyCatalog`.

## V35 PublicDocsUsageGuideCatalog canon

Gate 4 materializes `PublicDocsUsageGuideCatalog` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-public-docs-usage-guides.json` carries `source-safe-public-docs-metadata` and proves twelve public usage guide rows:

- `terminal_usage`
- `protocol_usage`
- `auxillaries_usage`
- `mcp_api_usage`
- `chatgpt_app_usage`
- `btd_usage`
- `assetpack_ranges_usage`
- `reads_usage`
- `fees_usage`
- `proof_posture_usage`
- `exchange_deferred_boundary`
- `conversations_deferred_boundary`

Every row names public route, title, audience, usage intent, canonical truth, source roots, package surfaces, docs sections, proof signals, disclosure notes, allowed public content, forbidden public content, freshness checks, and deterministic guide root.
The catalog fails closed on missing `/docs` routes, missing source roots, stale spec bindings, `_legacy/` roots, secret-shaped values, protected source payloads, raw protected prompts, wallet private material, provider tokens, and unpaid AssetPack source.
Public docs may expose usage guidance, source-safe measurements, proof roots, policy state, fee and rights boundaries, readiness states, and public route links.
Public docs must not expose secret values, provider tokens, wallet private material, raw protected prompts, protected source payloads, or unpaid AssetPack source.
The settlement boundary is explicit: measurements and proof posture may be previewed before payment, but source-bearing AssetPack contents cross to the reader only after settlement and rights transfer.
V35 public docs catalog Exchange and Conversations usage while deeper Exchange and website Conversations product depth remains future-canon work.
The artifact is generated by `pnpm run generate:v35-public-docs-usage-guides`, checked by `pnpm run check:v35-public-docs-usage-guides`, closed by `pnpm run check:v35-gate4`, and exported by `@bitcode/protocol` through `buildPublicDocsUsageGuideCatalog`.

## V35 OperatorRunbookCatalog canon

Gate 5 materializes `OperatorRunbookCatalog` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-operator-runbook-catalog.json` carries `source-safe-runbook-metadata` and proves fourteen dashboard, alert, runbook, incident, and escalation rows derived from the fourteen `TelemetryTaxonomyCatalog` event families:

- `runbook.pipeline.execution-repair`
- `runbook.execution.orphan-repair`
- `runbook.inference.ptrr-agent-debug`
- `runbook.inference.generation-redaction`
- `runbook.tools.policy-denial`
- `runbook.ledger.reconciliation-repair`
- `runbook.wallet.signing-failure`
- `runbook.storage.object-repair`
- `runbook.interfaces.auth-denial`
- `runbook.deployment.lane-repair`
- `runbook.observer.finality-lag`
- `runbook.repair.failed`
- `runbook.docs.qa-repair`
- `runbook.promotion.blocked`

Every row binds a telemetry event family and event ids to a dashboard panel, alert id, alert threshold, runbook id, incident class, severity, escalation path, command sequence, verification commands, safe operator data, forbidden operator data, proof root basis, repair references, post-incident documentation updates, source-safety class, redaction posture, storage target, correlation ids, source roots, replay expectation, and deterministic runbook root.
Dashboard, alert, runbook, incident, and escalation posture must derive from telemetry taxonomy rows; they must not become dashboard-only assertions or operator folklore.
Operator runbook payloads may carry event ids, correlation ids, proof roots, state enums, policy ids, dashboard panel ids, runbook ids, and redacted error classes.
They must not carry secret values, privileged database key values, provider tokens, wallet private material, raw protected prompts, raw model responses with protected source, protected source payloads, or unpaid AssetPack source.
The catalog fails closed on missing telemetry event family bindings, missing runbook ids, missing dashboard panels, missing alert thresholds, missing incident classes, missing escalation paths, missing command sequences, missing verification commands, missing proof roots, missing post-incident documentation updates, missing forbidden-data boundaries, missing source roots, secret-shaped markers, protected source disclosure, wallet private material disclosure, raw protected prompts, and unpaid AssetPack source disclosure.
The artifact is generated by `pnpm run generate:v35-operator-runbook-catalog`, checked by `pnpm run check:v35-operator-runbook-catalog`, closed by `pnpm run check:v35-gate5`, and exported by `@bitcode/protocol` through `buildOperatorRunbookCatalog`.

## V35 DocsQaAlignmentReport canon

Gate 6 materializes `DocsQaAlignmentReport` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-docs-qa-alignment-report.json` carries `source-safe-docs-qa-metadata` and proves ten documentation alignment rows:

- `spec_family_alignment`
- `roadmap_readme_alignment`
- `generated_artifact_inventory_alignment`
- `catalog_implementation_alignment`
- `public_docs_disclosure_alignment`
- `internal_docs_alignment`
- `route_docs_alignment`
- `interface_docs_alignment`
- `generated_proof_appendix_alignment`
- `workflow_checker_alignment`

Every row names alignment class, owner, checked sources, expected tokens, observed tokens, stale token blockers, generated artifacts, missing generated artifacts, unsupported disclosure claims, forbidden payload classes, validation command, repair command, fail-closed result, source evidence, and deterministic alignment root.
Docs QA covers code, SPEC, DELTA, NOTES, PARITY, generated proof posture, generated artifacts, public docs, internal docs, route docs, interface docs, package READMEs, and workflow checkers.
Docs QA payloads may carry file paths, token names, generated artifact paths, proof roots, and failure codes.
They must not carry secret values, provider tokens, wallet private material, raw protected prompts, protected source payloads, or unpaid AssetPack source.
The report fails closed on missing alignment ids, missing source roots, missing expected tokens, missing generated artifacts, unsupported disclosure claims, secret-shaped markers, protected source disclosure, wallet private material disclosure, raw protected prompts, and unpaid AssetPack source disclosure.
The artifact is generated by `pnpm run generate:v35-docs-qa-alignment-report`, checked by `pnpm run check:v35-docs-qa-alignment-report`, closed by `pnpm run check:v35-gate6`, and exported by `@bitcode/protocol` through `buildDocsQaAlignmentReport`.

## V35 TestnetRolloutReadinessGuide canon

Gate 7 materializes `TestnetRolloutReadinessGuide` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-testnet-rollout-readiness-guide.json` carries `source-safe-rollout-guide-metadata` and proves ten rollout guide rows:

- `contributor_onboarding`
- `local_development`
- `operator_use`
- `enterprise_reader_flow`
- `depositor_flow`
- `interface_consumer_flow`
- `environment_lane_posture`
- `wallet_settlement_caveats`
- `known_blockers`
- `rehearsal_evidence`

Every row names audience, purpose, lane ids, workflow stages, source roots, reproducible commands, source-safe guide examples, known blockers, rehearsal evidence, validation commands, allowed disclosure, forbidden disclosure, fail-closed result, source evidence, and deterministic guide root.
The guide distinguishes `local`, `staging-testnet`, `public-testnet`, `mainnet-ready-dry-run`, and `value-bearing-mainnet`.
The `value-bearing-mainnet` lane remains visible and explicitly blocked as `blocked_future_canon_required`; no V35 rollout guide may make value-bearing mainnet admissible.
Rollout guide payloads may carry lane ids, guide ids, route names, validation commands, proof roots, dashboard panel ids, runbook ids, redacted failure classes, public docs slugs, source-safe examples, known blocker names, and rehearsal evidence paths.
They must not carry secret values, provider tokens, wallet private material, raw protected prompts, protected source payloads, buyer repository private data, raw protected model responses, or unpaid AssetPack source.
The guide fails closed on missing guide ids, missing lane ids, missing source roots, missing reproducible commands, missing examples, missing known blockers, missing rehearsal evidence, missing validation commands, secret-shaped markers, protected source disclosure, wallet private material disclosure, raw protected prompts, unpaid AssetPack source disclosure, or any unblocked value-bearing mainnet posture.
The artifact is generated by `pnpm run generate:v35-testnet-rollout-readiness-guide`, checked by `pnpm run check:v35-testnet-rollout-readiness-guide`, closed by `pnpm run check:v35-gate7`, and exported by `@bitcode/protocol` through `buildTestnetRolloutReadinessGuide`.

## V35 TelemetryDocumentationInterfaceIntegration canon

Gate 8 materializes `TelemetryDocumentationInterfaceIntegration` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-telemetry-documentation-interface-integration.json` carries `source-safe-interface-integration-metadata` and proves eight active interface rows:

- `terminal`
- `auxillaries`
- `api`
- `mcp_api`
- `chatgpt_app`
- `package_readmes`
- `internal_docs`
- `public_docs`

Every row names integration surface, owner, docs links, event families, event ids, proof root fields, runbook links, redaction posture, correlation ids, source roots, route payload surfaces, validation commands, allowed payload fields, forbidden payload classes, fail-closed result, source evidence, and deterministic integration root.
Interface payloads may expose event ids, proof roots, docs links, runbook links, redaction posture, correlation ids, state labels, summary counts, and source-safety class when those fields help an operator or interface consumer move from a visible state to a documented repair path.
They must not carry secret values, provider tokens, wallet private material, protected source payloads, raw protected prompts, raw protected model responses with protected source, buyer repository private data, or unpaid AssetPack source.
Terminal, Auxillaries, API, MCP API, ChatGPT App, package README, internal docs, and public docs must consume package-owned documentation and telemetry contracts rather than route-local or interface-local copies.
The integration fails closed on missing interface rows, missing source roots, missing docs links, missing event ids, missing proof root fields, missing runbook links, missing redaction posture, secret-shaped markers, protected source disclosure, wallet private material disclosure, raw protected prompts, raw protected model responses with source, buyer repository private data, or unpaid AssetPack source disclosure.
The artifact is generated by `pnpm run generate:v35-telemetry-documentation-interface-integration`, checked by `pnpm run check:v35-telemetry-documentation-interface-integration`, closed by `pnpm run check:v35-gate8`, and exported by `@bitcode/protocol` through `buildTelemetryDocumentationInterfaceIntegration`.

## V35 LocalStagingTelemetryDocumentationRehearsal canon

Gate 9 materializes `LocalStagingTelemetryDocumentationRehearsal` as package-owned protocol truth.
The deterministic artifact `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json` carries `source-safe-rehearsal-metadata` and proves six required rehearsal rows:

- `local_telemetry_documentation_rehearsal`
- `staging_testnet_telemetry_documentation_rehearsal`
- `dashboard_runbook_lookup_rehearsal`
- `docs_qa_incident_drill`
- `source_safe_proof_root_review`
- `value_bearing_mainnet_blocked_rehearsal`

Each row binds lane id, documentation surface ids, interface ids, telemetry event families, event ids, proof root fields, dashboard panel ids, runbook links, docs QA ids, rollout guide ids, validation commands, evidence roots, redacted screenshot/log roots, incident classes, and source-safety posture.
Local and staging-testnet rehearsal rows must include documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA review, incident drill, and source-safe proof-root review.
Mainnet-ready dry-run review may inspect proof roots without value-bearing unlock; value-bearing mainnet remains visible and blocked.
Rehearsal payloads may expose lane ids, event ids, proof roots, docs links, runbook ids, dashboard ids, incident classes, redaction posture, source-safety class, and summary counts.
They must not carry secret values, provider tokens, wallet private material, protected source payloads, raw protected prompts, raw protected model responses with protected source, buyer repository private data, or unpaid AssetPack source.
The artifact is generated by `pnpm run generate:v35-local-staging-telemetry-documentation-rehearsal`, checked by `pnpm run check:v35-local-staging-telemetry-documentation-rehearsal`, closed by `pnpm run check:v35-gate9`, and exported by `@bitcode/protocol` through `buildLocalStagingTelemetryDocumentationRehearsal`.

## V35 whole Bitcode operator chain

The V35 operator chain keeps V34 behavior and adds source-safe documentation and telemetry visibility:

1. Depositor supplies source material.
2. Bitcode records source-safe deposit measurement and proof roots.
3. Deployment hosts keep lane posture through inherited `EnvironmentLaneContract`.
4. Runtime hosts keep available capability truth through inherited `DeploymentHostCapabilityCatalog`.
5. Reader requests a Read through Terminal, API, MCP API, or ChatGPT App.
6. `ReadNeedComprehensionSynthesis` synthesizes a ReadNeed for review.
7. Reader approves or requests regeneration of the ReadNeed.
8. `ReadFitsFindingSynthesis` searches the depository for plural threshold-passing deposits.
9. Distributed execution records pipeline, tool, agent, and storage roots through inherited `DistributedExecutionRuntimeReceipt`.
10. Bitcode synthesizes a source-safe AssetPack preview and fee quote.
11. Reader reviews measurements, fit quality, policy posture, fee, and rights preview without protected source leakage.
12. Reader settles BTC fee and receives the BTD read/right transfer.
13. Observers, broadcasters, repair jobs, and storage carriers reconcile settlement, finality, rights, delivery, and proof state through inherited V34 deployment law.
14. Bitcode unlocks full AssetPack delivery and records synchronized ledger, database, object-storage, execution, interface, telemetry, and docs QA proof state.

## V35 canonical subsystem surfaces

The V35 subsystem coverage is total across repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, and generated artifacts and canonical promotion.

### Depositing and asset supply

- Current canonical objects and emitted artifacts: `Deposit`, depository asset id, measurement roots, embedding document roots, host capability rows, and interface-safe deposit summaries.
- Current algorithms and derivation rules: source intake, measurement, proof-root generation, policy classification, depository indexing, and storage lane placement.
- Current invariants and fail-closed conditions: invalid deposit, missing source proof, unsupported provider, policy denial, storage carrier drift, or protected-source leakage blocks projection.
- Current proof obligations: deposit measurement proof, source-safety class, host capability, and object-storage posture.
- Current source-bearing implementation basis: commercial package and `uapi` routes, not `protocol-demonstration`.
- Current validating commands and parity basis: V34 canonical proofs plus V35 host capability and storage posture checks.
- Current accepted boundaries: V35 does not change deposit ownership law.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: `ReadRequest`, `ReadNeed`, `ReadNeedComprehensionSynthesis`, PTRR agents, ThricifiedGenerations, prompt/tool registry records, execution receipts, and source-safe interface summaries.
- Current algorithms and derivation rules: prompt-part composition, PTRR plan/try/refine/retry, judged reasoning, typed output, reviewed Need acceptance, and distributed runtime receipt emission.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing review, auth denial, lane denial, or missing runtime receipt blocks Finding Fits.
- Current proof obligations: interface request schema, Need response schema, telemetry root, runtime receipt, and denial repair path.
- Current source-bearing implementation basis: commercial Reading packages and API routes.
- Current validating commands and parity basis: V34 Reading pipeline proof plus V35 distributed execution contracts.
- Current accepted boundaries: V35 does not rewrite Reading pipeline law.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: `FindingFitsResult`, plural fit deposits, search roots, ranking roots, verification decisions, source-safe preview fit metadata, and object-storage roots.
- Current algorithms and derivation rules: recall, vector search, ranking, threshold filters, verification, synthesis context selection, and runtime receipt derivation.
- Current invariants and fail-closed conditions: no-worthy-fit, no-survivor asset pack, provider failure, policy denial, lane denial, or protected-source leak blocks preview.
- Current proof obligations: candidate inventory, ranking root, source-safety class, distributed execution receipt, and source-safe preview schema.
- Current source-bearing implementation basis: commercial asset-pack pipeline package.
- Current validating commands and parity basis: V34 proof coverage plus V35 runtime receipt and deployment rehearsal checks.
- Current accepted boundaries: V35 does not broaden pre-settlement disclosure.

### Selection and materialization

- Current canonical objects and emitted artifacts: `AssetPackPreview`, protected AssetPack source lock, source-safe measurements, delivery admission, object-storage carrier record, and rollback material.
- Current algorithms and derivation rules: synthesis from fit deposits, preview projection, fee quote, paid unlock, storage, rollback materialization, and PR delivery after settlement.
- Current invariants and fail-closed conditions: unpaid disclosure, invalid fee quote, rights denial, object-storage drift, rollback gap, or delivery failure blocks source visibility.
- Current proof obligations: preview contract, delivery contract, object-storage root, rollback path, and pull-request proof where applicable.
- Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `packages/api`, and `uapi`.
- Current validating commands and parity basis: V34 rights/interface artifacts plus V35 storage and rehearsal checks.
- Current accepted boundaries: protected source is never an unpaid interface payload.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: `InterfaceAuthorizationPolicy`, organization authority, wallet capability, read-license posture, denial repair record, secret family, and rotation proof.
- Current algorithms and derivation rules: issuer validation, organization/team/role checks, wallet requirement checks, license checks, protected-source policy, secret availability, and rotation proof.
- Current invariants and fail-closed conditions: authorization denial, stale session, missing wallet, missing license, service-secret exposure, provider token exposure, stale secret, or missing rotation path blocks action.
- Current proof obligations: denied-state examples, policy row, source-safety row, secret boundary, and audit root.
- Current source-bearing implementation basis: packages, API middleware, MCP auth, ChatGPT App action guards, Terminal support surfaces, and deployment environment contracts.
- Current validating commands and parity basis: V34 auth proof plus V35 secret rotation and CI masking checks.
- Current accepted boundaries: no secret material is serialized into interface responses or tracked artifacts.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe preview, disclosure policy, redacted response, paid unlock, protected-source access record, projection receipt, and repair receipt.
- Current algorithms and derivation rules: source-safe projection, redaction, preview measurement rendering, paid unlock verification, response shaping, projection repair, and source-safe proof export.
- Current invariants and fail-closed conditions: public projection overexposure, unpaid protected-source request, incompatible consumer, stale proof, or stale projection blocks disclosure.
- Current proof obligations: disclosure-boundary tests, preview examples, paid/unpaid contrast fixtures, projection roots, and repair roots.
- Current source-bearing implementation basis: BTD access primitives, API serializers, MCP tools, ChatGPT App renderers, Terminal components, and repair jobs.
- Current validating commands and parity basis: V34 disclosure tests plus V35 observer/repair job checks.
- Current accepted boundaries: preview metadata may be public to the Reader; protected source requires settlement.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: `BtcFeeQuote`, settlement record, BTD receipts, rights transfer, source-to-shares proof, journal, reconciliation record, observer receipt, and broadcaster receipt.
- Current algorithms and derivation rules: fee quote, wallet/PSBT posture, finality observation, BTD read/right transfer, source-to-shares allocation, projection repair, and lane admission.
- Current invariants and fail-closed conditions: settlement conservation drift, invalid finality, underpayment, overpayment, projection drift, missing broadcaster receipt, or delivery mismatch blocks unlock.
- Current proof obligations: fee/root consistency, ledger/database sync, observer receipt, broadcaster receipt, reconciliation repair action, and interface replay hook.
- Current source-bearing implementation basis: `packages/btd`, ledger/database packages, deployment jobs, and API surfaces.
- Current validating commands and parity basis: V34 settlement proof plus V35 observer/broadcaster/repair job checks.
- Current accepted boundaries: production-mainnet value-bearing launch remains approval-gated outside V35.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: `InterfaceTelemetryProofHook`, execution record, ledger root, database root, object-storage root, generated proof artifact, runtime receipt, rehearsal log, and replay command.
- Current algorithms and derivation rules: request root, response root, event root, proof binding, replay command generation, rehearsal comparison, and fail-closed stale-artifact detection.
- Current invariants and fail-closed conditions: stale promoted status truth, missing replay hook, source-unsafe proof artifact, missing runtime receipt, or drift blocks promotion.
- Current proof obligations: generated artifact rows, command rows, proof roots, deployment receipt roots, and compatibility rows.
- Current source-bearing implementation basis: protocol package helpers, `.bitcode/` artifacts, workflows, V35 gate checkers, and deployment playbooks.
- Current validating commands and parity basis: V34 promotion proof plus V35 Gate 1 through Gate 10 checks.
- Current accepted boundaries: generated artifacts are source-safe and do not print secrets or protected source.

## V35 proof-family canon

### Inference-synthesis

- proofArtifactPath: `.bitcode/v35-telemetry-docs-inference-synthesis-proof.json`
- members: Reading pipeline deployment, AssetPack preview deployment, post-settlement delivery deployment.
- theoremIds: deployment-inference-runtime-receipted, deployment-inference-source-safe-response.
- replayStepIds: render schema, run fixture, parse result, compare proof roots.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`, `.bitcode/v35-canonical-input-report.json`
- current member closure criteria: every inference-adjacent deployed action names its pipeline, PTRR agent, step, sub-step, typed result, host id, lane id, and runtime receipt.
- current member verdict shape: pass, fail, blocked, or deferred with repair posture.
- current theorem-by-theorem closure reading: deployment hosts run inference law; they do not own inference law.
- current theorem-to-replay grouping: request, response, telemetry, runtime receipt, and proof-root replay.
- minimum artifact/replay binding set: spec-family report, canonical-input report, runtime receipt, and rehearsal log.
- current proof-object fields: hostId, laneId, executionId, actionId, requestRoot, responseRoot, sourceSafetyClass, replayCommand.
- generated-artifact and test bindings: V35 telemetry/documentation artifacts through Gate 10, including `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json`.
- fail-closed conditions: missing schema, raw protected prompt, protected source, untyped output, missing runtime receipt, or stale proof root.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v35-telemetry-docs-prompt-completeness-proof.json`
- members: ReadNeed prompt projection, Finding Fits prompt projection, delivery prompt projection.
- theoremIds: deployment-prompts-redacted, deployment-prompt-contract-complete.
- replayStepIds: prompt registry digest, context key inventory, redaction check, response fixture check.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`
- current member closure criteria: prompt templates and interpolated prompts are represented by source-safe digests and context keys where deployment receipts need auditability.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: runtime observability does not mean prompt leakage.
- current theorem-to-replay grouping: prompt template digest, interpolated context keys, typed output, and runtime receipt.
- minimum artifact/replay binding set: prompt digest, context keys, action id, execution id, and host id.
- current proof-object fields: promptTemplateRoot, interpolatedContextKeys, responseRoot, redactionVerdict, laneId.
- generated-artifact and test bindings: V35 distributed execution runtime receipts.
- fail-closed conditions: missing prompt digest, unredacted protected prompt, untyped response, or missing lane posture.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v35-telemetry-docs-static-code-analysis-proof.json`
- members: versionless routes, deployment contract ownership, no demonstration imports, no secret literals.
- theoremIds: deployment-routes-unversioned, deployment-contracts-package-owned.
- replayStepIds: route scan, import scan, secret scan, schema export scan.
- witnessArtifactPaths: `.bitcode/v35-canonical-input-report.json`
- current member closure criteria: source keeps deployment contracts package-owned and versionless.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: static checks enforce architecture before runtime tests.
- current theorem-to-replay grouping: route path, import path, schema path, test path.
- minimum artifact/replay binding set: source path, checker command, expected pattern, failure message.
- current proof-object fields: path, checkId, verdict, repairHint.
- generated-artifact and test bindings: V35 Gate 1 checker and later telemetry/documentation checkers.
- fail-closed conditions: versioned route, demonstration import, tracked secret, or local-only deployment schema.

### Verification-decisions

- proofArtifactPath: `.bitcode/v35-telemetry-docs-verification-decisions-proof.json`
- members: lane admission, migration approval, secret availability, rehearsal verdict.
- theoremIds: deployment-denial-readable, deployment-approval-verified.
- replayStepIds: denied fixture, allowed fixture, stale fixture, repaired fixture.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`
- current member closure criteria: every deployment decision has machine-readable result plus operator-readable repair posture.
- current member verdict shape: allowed, denied, blocked, deferred, or repaired.
- current theorem-by-theorem closure reading: denial is a first-class deployment result, not an exception-shaped accident.
- current theorem-to-replay grouping: host, lane, migration, secret, storage, receipt, and proof.
- minimum artifact/replay binding set: decision id, cause, repair, proof root.
- current proof-object fields: decisionId, reason, repairAction, sourceSafetyClass, laneId.
- generated-artifact and test bindings: V35 Gate 2, Gate 5, Gate 6, and Gate 9.
- fail-closed conditions: ambiguous denial, missing repair, source-unsafe allowed result, or value-bearing lane without admission.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v35-telemetry-docs-selection-materialization-proof.json`
- members: selected fits, AssetPack preview, protected source lock, delivery admission, storage carrier.
- theoremIds: deployment-preview-source-safe, deployment-delivery-paid-only.
- replayStepIds: preview fixture, settlement fixture, delivery fixture, storage fixture.
- witnessArtifactPaths: `.bitcode/v35-canonical-input-report.json`
- current member closure criteria: deployed interfaces expose preview metadata before payment and source delivery only after settlement and storage admission.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: deployment convenience never crosses the protected-source boundary.
- current theorem-to-replay grouping: fits, preview, fee, settlement, storage, delivery.
- minimum artifact/replay binding set: AssetPack id, preview root, fee quote root, settlement root, storage root, delivery root.
- current proof-object fields: assetPackId, previewRoot, sourceLock, settlementState, objectStorageRoot.
- generated-artifact and test bindings: V35 Gate 4 and Gate 9.
- fail-closed conditions: unpaid source, missing fee quote, stale settlement, storage drift, or delivery mismatch.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v35-telemetry-docs-authorization-sensitive-flow-proof.json`
- members: API auth, MCP auth, ChatGPT App auth, organization authority, wallet capability, secret rotation, read-license policy.
- theoremIds: deployment-auth-fail-closed, deployment-secrets-not-serialized.
- replayStepIds: unauthenticated fixture, unauthorized fixture, authorized fixture, secret scan.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`
- current member closure criteria: every deployed action has an auth policy, lane policy, and secret boundary.
- current member verdict shape: allowed, denied, blocked, or deferred.
- current theorem-by-theorem closure reading: sensitive flow is governed by policy and rotation, not per-host custom logic.
- current theorem-to-replay grouping: issuer, organization, wallet, license, rights, disclosure, lane, and secret family.
- minimum artifact/replay binding set: policy id, input root, denial reason, repair posture, secret family id.
- current proof-object fields: authMode, policyId, denialReason, repairAction, sourceSafetyClass, secretFamily.
- generated-artifact and test bindings: V35 Gate 5.
- fail-closed conditions: missing auth policy, missing wallet, missing license, protected-source request, stale secret, or secret exposure.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v35-telemetry-docs-settlement-source-to-shares-proof.json`
- members: fee quote, BTD right transfer, source-to-shares projection, observer receipt, broadcaster receipt.
- theoremIds: deployment-settlement-root-stable, deployment-rights-transfer-visible-after-finality.
- replayStepIds: quote fixture, payment fixture, finality fixture, drift fixture.
- witnessArtifactPaths: `.bitcode/v35-canonical-input-report.json`
- current member closure criteria: deployed payment state matches ledger truth and repair posture.
- current member verdict shape: quoted, pending, final, drifted, repaired, or blocked.
- current theorem-by-theorem closure reading: deployment payment status is a projection of ledger truth.
- current theorem-to-replay grouping: fee quote, PSBT, broadcast, finality, rights, delivery, and repair.
- minimum artifact/replay binding set: quote root, transaction root, finality root, rights root, observer root.
- current proof-object fields: quoteRoot, finalityState, rightsState, reconciliationState, broadcasterReceiptRoot.
- generated-artifact and test bindings: V35 Gate 7 and Gate 8.
- fail-closed conditions: settlement conservation drift, projection drift, unpaid unlock, unsupported network posture, or missing observer receipt.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v35-telemetry-docs-disclosure-boundary-proof.json`
- members: source-safe preview, unpaid denial, paid unlock, redacted examples, storage access.
- theoremIds: deployment-preview-not-source, deployment-paid-unlock-source.
- replayStepIds: preview render, unpaid source request, paid delivery request, redaction scan.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`
- current member closure criteria: protected source cannot appear before settlement in logs, storage carriers, generated proofs, or interface responses.
- current member verdict shape: source-safe, denied, unlocked, or violation.
- current theorem-by-theorem closure reading: all deployment carriers share one disclosure boundary.
- current theorem-to-replay grouping: preview, fee, settlement, access, storage, delivery.
- minimum artifact/replay binding set: disclosure policy id, source-safety class, access state, storage root.
- current proof-object fields: disclosureState, sourceSafetyClass, accessPolicyId, deliveryAdmission, storageCarrier.
- generated-artifact and test bindings: V35 Gate 4, Gate 5, Gate 8, and Gate 9.
- fail-closed conditions: public projection overexposure, unpaid source, stale rights, storage overexposure, or missing redaction.

### Proof-contract

- proofArtifactPath: `.bitcode/v35-telemetry-docs-proof-contract-proof.json`
- members: spec-family report, canonical-input report, host capability catalog, runtime receipts, storage posture, rehearsal proof.
- theoremIds: deployment-proof-replayable, deployment-promotion-source-safe.
- replayStepIds: generate, check, replay, compare, promote.
- witnessArtifactPaths: `.bitcode/v35-spec-family-report.json`, `.bitcode/v35-canonical-input-report.json`
- current member closure criteria: every active deployment row has a replayable proof contract by V35 promotion.
- current member verdict shape: pass, fail, blocked, deferred, or promoted.
- current theorem-by-theorem closure reading: promotion depends on generated source-safe proof, not prose.
- current theorem-to-replay grouping: host, lane, schema, example, test, telemetry, ledger, database, object storage.
- minimum artifact/replay binding set: generated artifact, proof-source commit, replay command, failure taxonomy.
- current proof-object fields: artifactPath, proofSourceCommit, replayCommand, verdict, laneId.
- generated-artifact and test bindings: V35 Gate 10.
- fail-closed conditions: missing generated artifact, stale proof-source commit, source-unsafe payload, incomplete deployment matrix, or missing rehearsal.

## V35 generated canon

V35 generated canon includes specifying artifacts, documentation surface artifacts, telemetry taxonomy artifacts, docs QA artifacts, dashboard/runbook artifacts, rollout guide artifacts, interface integration artifacts, rehearsal artifacts, and the Gate 10 promotion readiness report.
Generated artifacts must be stable, source-safe, and explicitly tied to validation commands.

## V35 promotion readiness canon

V35 Gate 10 closes when `version/v35` can promote to active V35 without direct `main` writes.
The readiness report `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json` proves that all V35 telemetry/documentation artifacts are present, source-safe, parseable, wired into gate checks, wired into promotion checks, generated proof appendix support, and workflow validation.
Promotion rewrites runtime posture from `V34` active / `V35` draft to `V35` active / `V36` draft and generates `BITCODE_SPEC_V35_PROVEN.md`.
The exact post-promotion readiness posture token is active V35 / draft V36.
The promotion script validation token is V35 active / draft V36.

## V35 validation canon

Validation must include spec-family checks, canonical-input checks, canon-posture drift checks, V35 gate checks, package tests, documentation catalog tests, telemetry taxonomy tests, docs QA checks, runbook checks, interface integration checks, and source-safe rehearsal checks.
Every gate must name the command that proves closure.

## V35 promotion canon

V35 promotion may occur only after all V35 gates are closed and `version/v35` is requested into `main`.
Promotion rewrites `BITCODE_SPEC.txt` from `V34` to `V35`, generates `BITCODE_SPEC_V35_PROVEN.md`, records source-safe `.bitcode/v35-*` evidence, and prepares active V35 / draft V36 posture.

## V35 appendices and canonical supporting material

The appendices below are binding checklists for V35 draft work and later promotion.

## V35 accepted boundaries and reopen conditions

Accepted boundaries:

- V35 owns telemetry and documentation depth, source-safe observability, documentation QA, dashboards, runbooks, incidents, onboarding, rollout guides, and promotion readiness.
- V35 preserves V34 deployment-depth law and may add telemetry/docs overlays for deployment receipts, but it does not rename V34 deployment contracts as V35 work.
- V35 keeps Exchange and website Conversations product depth deferred.
- V35 keeps production-mainnet value-bearing launch blocked unless a future canon explicitly admits it.

Reopen conditions:

- a documentation surface exposes protected source, secrets, wallet private material, or unpaid AssetPack contents;
- a telemetry event serializes raw protected prompts, source-bearing AssetPack contents, or secret-shaped values;
- a dashboard, alert, runbook, incident class, or escalation path is not tied to `TelemetryTaxonomyCatalog`;
- docs, generated proofs, generated artifacts, telemetry events, or implementation source drift without docs QA failure.

## V35 completion condition

V35 is complete when all ten gates are closed, documentation surfaces are package-owned and freshness-checked, telemetry taxonomy events are source-safe and proof-rooted, public `/docs` and internal docs derive from source truth, dashboards/alerts/runbooks/incidents/escalations derive from telemetry rows, docs QA fails closed on drift, rollout guides are usable, local/staging telemetry-documentation rehearsals pass, generated artifacts are stable, and promotion can safely make V35 the active canon.

## Appendix A. Canonical type and surface catalog

Primary V35 types: `TelemetryTaxonomyCatalog`, `DocumentationSurfaceCatalog`, `DocsQaAlignmentReport`, `OperatorRunbookCatalog`, `TestnetRolloutReadinessGuide`, `TelemetryDocumentationInterfaceIntegration`, `LocalStagingTelemetryDocumentationRehearsal`, and `DocumentationTelemetryPromotionReadinessReport`.
Primary surfaces: internal codebase docs, public `/docs`, package READMEs, route docs, generated artifact docs, dashboards, alerts, runbooks, incident records, Terminal, Auxillaries, API, MCP API, ChatGPT App, and promotion workflows.

Gate 2 catalog rows are package-owned source-safe documentation metadata.
Required documentation surface groups are internal codebase docs, public `/docs`, package docs, route docs, generated artifact docs, API/interface docs, dashboard/runbook docs, and rollout guides.
Gate 3 telemetry rows cover pipeline, execution, PTRR agent, ThricifiedGeneration, tool, ledger, wallet, storage, interface, deployment, observer, repair, docs QA, and promotion event families.
Every V35 row names source owner, audience, disclosure class, proof root, freshness check, validation command, redaction posture where relevant, and forbidden data.

## Appendix B. Proof family closure catalog

Every V35 proof family is replayable from generated artifacts and source-safe fixtures.

## Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v35-telemetry-docs-inference-synthesis-proof.json` | runtime inference receipts | deployment-inference-runtime-receipted | run fixture | `.bitcode/v35-spec-family-report.json` | V34 Reading plus V35 runtime receipts |
| Prompt-completeness | `.bitcode/v35-telemetry-docs-prompt-completeness-proof.json` | prompt digest receipts | deployment-prompts-redacted | redaction check | `.bitcode/v35-spec-family-report.json` | V34 prompt registry plus V35 lane receipts |
| Static-code-analysis | `.bitcode/v35-telemetry-docs-static-code-analysis-proof.json` | route and import scans | deployment-routes-unversioned | route scan | `.bitcode/v35-canonical-input-report.json` | source tree |
| Verification-decisions | `.bitcode/v35-telemetry-docs-verification-decisions-proof.json` | lane decisions | deployment-approval-verified | denied fixture | `.bitcode/v35-spec-family-report.json` | V35 lane and approval contracts |
| Selection-and-materialization | `.bitcode/v35-telemetry-docs-selection-materialization-proof.json` | storage materialization | deployment-delivery-paid-only | storage fixture | `.bitcode/v35-canonical-input-report.json` | V34 AssetPack plus V35 storage posture |
| Authorization-and-sensitive-flow | `.bitcode/v35-telemetry-docs-authorization-sensitive-flow-proof.json` | secret and auth rows | deployment-secrets-not-serialized | secret scan | `.bitcode/v35-spec-family-report.json` | V34 auth plus V35 rotation contracts |
| Settlement-source-to-shares | `.bitcode/v35-telemetry-docs-settlement-source-to-shares-proof.json` | settlement observers | deployment-settlement-root-stable | finality fixture | `.bitcode/v35-canonical-input-report.json` | V34 BTD settlement plus V35 observers |
| Disclosure-boundary | `.bitcode/v35-telemetry-docs-disclosure-boundary-proof.json` | storage disclosure | deployment-preview-not-source | redaction scan | `.bitcode/v35-spec-family-report.json` | V34 disclosure plus V35 storage |
| Proof-contract | `.bitcode/v35-telemetry-docs-proof-contract-proof.json` | promotion proof | deployment-proof-replayable | promote | `.bitcode/v35-spec-family-report.json` | V35 generated artifacts |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

V35 preserves inherited generated appendix structure and source-safe generated artifact inventories.

### Inherited V20 operator-quality artifacts

V35 preserves operator-quality proof output expectations and extends them to deployment operations.

### Exact generated-artifact inventory matrix

| artifactPath | owner | sourceSafety | validation |
| --- | --- | --- | --- |
| `.bitcode/v35-spec-family-report.json` | protocol | source-safe | `node scripts/check-bitcode-spec-family.mjs --version V35 --mode draft --current-target V34` |
| `.bitcode/v35-canonical-input-report.json` | protocol | source-safe | `node scripts/check-bitcode-canonical-inputs.mjs --current-target V34` |
| `.bitcode/v35-documentation-surface-catalog.json` | protocol | source-safe-documentation-surface-metadata | `pnpm run check:v35-gate2` |
| `.bitcode/v35-telemetry-taxonomy-catalog.json` | protocol | source-safe-telemetry-taxonomy-metadata | `pnpm run check:v35-gate3` |
| `.bitcode/v35-public-docs-usage-guides.json` | protocol | source-safe-public-docs-metadata | `pnpm run check:v35-gate4` |
| `.bitcode/v35-operator-runbook-catalog.json` | protocol | source-safe-runbook-metadata | `pnpm run check:v35-gate5` |
| `.bitcode/v35-docs-qa-alignment-report.json` | protocol | source-safe-docs-qa-metadata | `pnpm run check:v35-gate6` |
| `.bitcode/v35-testnet-rollout-readiness-guide.json` | protocol | source-safe-rollout-guide-metadata | `pnpm run check:v35-gate7` |
| `.bitcode/v35-telemetry-documentation-interface-integration.json` | protocol | source-safe-interface-integration-metadata | `pnpm run check:v35-gate8` |
| `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json` | protocol | source-safe-rehearsal-metadata | `pnpm run check:v35-gate9` |
| `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json` | protocol | source-safe-promotion-readiness-metadata | `pnpm run check:v35-gate10` |

### V35 specifying generated artifacts

Gate 1 requires `.bitcode/v35-spec-family-report.json` and `.bitcode/v35-canonical-input-report.json` to be declared.
Gate 2 requires `.bitcode/v35-documentation-surface-catalog.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate2`.
Gate 3 requires `.bitcode/v35-telemetry-taxonomy-catalog.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate3`.
Gate 4 requires `.bitcode/v35-public-docs-usage-guides.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate4`.
Gate 5 requires `.bitcode/v35-operator-runbook-catalog.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate5`.
Gate 6 requires `.bitcode/v35-docs-qa-alignment-report.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate6`.
Gate 7 requires `.bitcode/v35-testnet-rollout-readiness-guide.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate7`.
Gate 8 requires `.bitcode/v35-telemetry-documentation-interface-integration.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate8`.
Gate 9 requires `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate9`.
Gate 10 requires `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json` to be generated, source-safe, deterministic, and checked by `pnpm run check:v35-gate10`.

### Shared generated-artifact fields

Every V35 generated artifact carries artifact id, generatedAt, proof-source commit, active canon target, draft target, source safety class, validation command, and fail closed when the artifact is stale or source-unsafe.

### Artifact-specific generated payload fields

Telemetry/documentation artifacts additionally carry docs surface id, event family id, event id, dashboard panel id, alert id, runbook id, incident class, docs QA alignment id, rollout guide id, interface surface id, rehearsal id, source-safety class, and redaction posture when applicable.

### Artifact confidentiality and disclosability taxonomy

Artifacts are public, internal, buyer-visible, reviewer-visible, or operator-only.
Public anchors must not leak non-disclosable artifacts, secrets, protected source, raw protected prompts, wallet private material, or service-role credentials.

### Minimum generated appendix rendered contents

The generated appendix must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any artifact is missing or stale.

### Canonical regeneration and fail-closed posture

Canonical regeneration fails closed when generated inputs drift, source safety fails, required artifacts are absent, validation commands fail, or promotion posture is stale.

## Appendix D. Validation and checking gate catalog

Gate 1 validation is `pnpm run check:v35-gate1`.
Gate 2 validation is `pnpm run check:v35-gate2`, with artifact freshness checked by documentation surface generation and focused package coverage.
Gate 3 validation is `pnpm run check:v35-gate3`, with artifact freshness checked by telemetry taxonomy generation and focused package coverage.
Gate 10 validation is `pnpm run check:v35-gate10`, with artifact freshness checked by `DocumentationTelemetryPromotionReadinessReport` generation, package coverage, and canonical promotion dry-run coverage through `node scripts/promote-bitcode-canon.mjs --version V35 --commit HEAD --dry-run`.
The gate-quality workflow also runs spec-family, canonical-input, canon-posture drift, and diff hygiene checks.
Gate 10 keeps promotion blocked when telemetry/documentation artifacts, generated proof support, workflow bindings, runtime posture rewrite support, source safety, or promotion command planning are missing.

## Appendix E. Current canonical source map

- `BITCODE_SPEC.txt` points to active V34 during V35 drafting.
- `BITCODE_SPEC_V34.md` and `BITCODE_SPEC_V34_PROVEN.md` are the prior canonical anchor and proof appendix.
- `BITCODE_SPEC_V35.md`, notes, delta, and parity are the draft family.
- `packages/protocol/src/canon-posture.js`, `protocol-demonstration/src/canon-posture.js`, and `packages/protocol/data/state.json` carry V34 active / V35 draft posture.
- `_legacy/` is historical only.

## Appendix F. Subsystem totality and derivability matrix

Every V35 telemetry/documentation object must derive from source, spec, generated artifact, test, and replay command.
No documentation surface, telemetry event, dashboard, runbook, incident escalation, operator guide, validation and test stack, generated artifact, or canonical promotion row may be asserted by prose alone.

## Appendix G. Canonical file-family and promotion contract catalog

The V35 file family is `BITCODE_SPEC_V35.md`, `BITCODE_SPEC_V35_NOTES.md`, `BITCODE_SPEC_V35_DELTA.md`, `BITCODE_SPEC_V35_PARITY_MATRIX.md`, and eventually `BITCODE_SPEC_V35_PROVEN.md`.
Promotion rewrites `BITCODE_SPEC.txt` only after promotion-grade validations pass on `version/v35`.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include GitHub workflows, local scripts, Vercel deployments, Supabase lanes, object-storage carriers, CLI proof commands, Terminal runtime views, MCP API actions, ChatGPT App actions, public API routes, dashboards, runbooks, public docs, and internal docs.
Quality contracts require greenable CI, deterministic generated artifacts, readable docs/runbook posture, source-safe logs, and no direct `main` pushes.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Required cross-product scenarios remain active for auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.
V35 adds telemetry/documentation rehearsal scenarios that prove docs discovery, telemetry event review, dashboard/runbook lookup, incident drill, local/staging-testnet operation, and blocked value-bearing mainnet posture.

## Appendix J. Fail-closed contract and error posture matrix

V35 preserves existing fail-closed causes: invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.
V35 adds telemetry/documentation-specific causes: missing docs owner, missing docs freshness root, missing telemetry taxonomy row, missing redaction posture, stale public docs, stale internal docs, dashboard/runbook drift, incident escalation gap, rehearsal failure, and value-bearing mainnet blocked.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts remain governed by `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V35_PROVEN.md`.
V35 adds documentation and telemetry proof around those artifacts; it does not make protected source visible before settlement.
