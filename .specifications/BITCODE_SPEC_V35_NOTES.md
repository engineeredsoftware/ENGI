# Bitcode Spec V35 Notes

## Status

- Version: `V35`
- V35 state: canonical promotion complete; V35 notes record the accepted documentation, telemetry, docs QA, rollout, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V35`
- Canonical proof-source commit: `db74a494377c1f68d5354c3c2f24fb29c38906bb`
- Prior canonical anchor: `BITCODE_SPEC_V34.md`
- Prior generated proof appendix: `BITCODE_SPEC_V34_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v35-spec-family-report.json`, `.bitcode/v35-canonical-input-report.json`, `.bitcode/v35-canon-posture-drift-report.json`, `.bitcode/v35-documentation-surface-catalog.json`, `.bitcode/v35-telemetry-taxonomy-catalog.json`, `.bitcode/v35-public-docs-usage-guides.json`, `.bitcode/v35-operator-runbook-catalog.json`, `.bitcode/v35-docs-qa-alignment-report.json`, `.bitcode/v35-testnet-rollout-readiness-guide.json`, `.bitcode/v35-telemetry-documentation-interface-integration.json`, `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json`, `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json`, V35 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V35_PROVEN.md` as the generated proof appendix for V35 promotion
- Source parity state: V35 source-side documentation surface catalog, telemetry taxonomy catalog, public docs usage guides, operator runbook catalog, docs QA report, testnet rollout guide, telemetry documentation interface integration, local staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V35 file family
- Scope: V35 canonical notes for telemetry and documentation depth over promoted V34 deployment-depth canon
- Last fully realized canonical target preserved in source: `V35`

## Notes companion rule

This file is planning memory for the active V35 draft family.
Requirements are binding only when they are also represented in `BITCODE_SPEC_V35.md`, `BITCODE_SPEC_V35_DELTA.md`, `BITCODE_SPEC_V35_PARITY_MATRIX.md`, source, tests, generated artifacts, and gate checks.

## Concise current-system reading

V34 is the active canon.
It proved deployment depth: host capabilities, environment lanes, distributed execution runtime receipts, storage posture, secret rotation, migration approval, observers, broadcasters, repair jobs, rollback/upgrade/data repair playbooks, local/staging-testnet rehearsal, and promotion readiness.

V35 owns telemetry and documentation depth.
The commercial Bitcode system must now be understandable, monitorable, supportable, source-safe, and testnet-rollout ready without changing V34 Protocol/BTD, Reading, interface, or deployment law.

## Simplified-spec reading rule

Read the system as:

1. V34 defines where and how Bitcode may run.
2. V35 defines how that system is documented, telemeterized, monitored, supported, and rolled out to testnet users.
3. Public docs are not proof unless they are backed by source roots, spec roots, generated artifacts, and docs QA.
4. A dashboard is not proof unless its panels derive from `TelemetryTaxonomyCatalog` events and proof roots.
5. Value-bearing mainnet remains blocked until a future canon admits it.

## V35 gate plan

1. Gate 1: V35 Telemetry Documentation Roadmap And Spec Opening.
2. Gate 2: Documentation Surface Catalog.
3. Gate 3: Telemetry Taxonomy Event Schema And Redaction.
4. Gate 4: Public Docs Usage Guides.
5. Gate 5: Dashboards Alerts Runbooks Incident Escalation.
6. Gate 6: Documentation QA Alignment Proofs.
7. Gate 7: Developer Operator Testnet Rollout Guides.
8. Gate 8: Telemetry Documentation Interface Integration.
9. Gate 9: Local Staging Telemetry Documentation Rehearsal.
10. Gate 10: V35 Promotion Readiness.

## Telemetry and documentation depth notes

- `DocumentationSurfaceCatalog` makes docs surfaces explicit: internal codebase docs, public `/docs`, package READMEs, route docs, generated artifact docs, API/interface docs, operator docs, and contributor docs.
- `TelemetryTaxonomyCatalog` makes event families explicit across pipelines, executions, PTRR agents, ThricifiedGenerations, tools, ledger operations, wallet operations, storage operations, interfaces, deployments, observers, repair jobs, docs QA, and promotion workflows.
- `PublicDocsUsageGuideCatalog` makes enterprise-facing `/docs` usage guides explicit across Terminal, Protocol, Auxillaries, MCP API, ChatGPT App, BTD, AssetPack ranges, Reads, fees, proof posture, Exchange deferred boundary, and Conversations deferred boundary.
- `DocsQaAlignmentReport` must fail closed on stale docs, stale spec tokens, stale generated proof references, missing source roots, or public docs that expose protected source.
- `OperatorRunbookCatalog` binds dashboards, alerts, incidents, escalation, repair commands, and post-incident documentation updates to telemetry taxonomy rows.
- `TestnetRolloutReadinessGuide` carries contributor, local development, operator, enterprise reader, depositor, interface consumer, lane posture, wallet/settlement caveat, known blocker, and rehearsal evidence paths for local, staging-testnet, public testnet, mainnet-ready dry run, and blocked value-bearing mainnet use.
- `TelemetryDocumentationInterfaceIntegration` binds Terminal, Auxillaries, API, MCP API, ChatGPT App, package READMEs, internal docs, and public docs to event ids, proof roots, docs links, runbook links, redaction posture, correlation ids, and source-safe interface payload boundaries.
- `LocalStagingTelemetryDocumentationRehearsal` binds local and staging-testnet documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA, incident drill, source-safe proof-root review, redacted screenshot/log roots, and blocked value-bearing mainnet posture.
- Gate 10: V35 Promotion Readiness closes `DocumentationTelemetryPromotionReadinessReport` with `.bitcode/v35-documentation-telemetry-promotion-readiness-report.json`, active V35 / draft V36 runtime posture preparation, generated proof appendix support, promotion workflow wiring, package test coverage, source-safe artifact coverage, and `check:v35-gate10`.
- V35 public docs can expose measurements, proof posture, fee/right boundaries, setup steps, and known blockers; they cannot expose secrets, wallet private material, protected source, raw prompts containing protected data, or unpaid AssetPack source.
- Gate 2 closes `DocumentationSurfaceCatalog` with `.bitcode/v35-documentation-surface-catalog.json`, `source-safe-documentation-surface-metadata`, package export `buildDocumentationSurfaceCatalog`, package test coverage, and `check:v35-gate2`.
- Gate 3 closes `TelemetryTaxonomyCatalog` with `.bitcode/v35-telemetry-taxonomy-catalog.json`, `source-safe-telemetry-taxonomy-metadata`, package export `buildTelemetryTaxonomyCatalog`, package test coverage, redaction posture for every event family, ThricifiedGeneration inference telemetry boundaries, and `check:v35-gate3`.
- Gate 4 closes `PublicDocsUsageGuideCatalog` with `.bitcode/v35-public-docs-usage-guides.json`, `source-safe-public-docs-metadata`, package export `buildPublicDocsUsageGuideCatalog`, package test coverage, public disclosure-limit docs content, and `check:v35-gate4`.
- Gate 5 closes `OperatorRunbookCatalog` with `.bitcode/v35-operator-runbook-catalog.json`, `source-safe-runbook-metadata`, package export `buildOperatorRunbookCatalog`, package test coverage, dashboard/alert/runbook derivation from telemetry taxonomy rows, incident escalation paths, operator command sequences, forbidden-data boundaries, post-incident documentation update requirements, and `check:v35-gate5`.
- Gate 6 closes `DocsQaAlignmentReport` with `.bitcode/v35-docs-qa-alignment-report.json`, `source-safe-docs-qa-metadata`, package export `buildDocsQaAlignmentReport`, package test coverage, stale token blockers, generated artifact inventory checks, source-root evidence, unsupported disclosure claim blockers, workflow/checker wiring, and `check:v35-gate6`.
- Gate 7 closes `TestnetRolloutReadinessGuide` with `.bitcode/v35-testnet-rollout-readiness-guide.json`, `source-safe-rollout-guide-metadata`, package export `buildTestnetRolloutReadinessGuide`, package test coverage, source-safe examples, reproducible commands, rollout lane distinctions, known blockers, rehearsal evidence, value-bearing mainnet blocking, workflow/checker wiring, and `check:v35-gate7`.
- Gate 8 closes `TelemetryDocumentationInterfaceIntegration` with `.bitcode/v35-telemetry-documentation-interface-integration.json`, `source-safe-interface-integration-metadata`, package export `buildTelemetryDocumentationInterfaceIntegration`, package test coverage, Terminal/Auxillaries/API/MCP API/ChatGPT App/package README/internal docs/public docs integration rows, source-safe payload fields, forbidden-data boundaries, workflow/checker wiring, and `check:v35-gate8`.
- Gate 9 closure: `LocalStagingTelemetryDocumentationRehearsal` closes with `.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json`, `source-safe-rehearsal-metadata`, package export `buildLocalStagingTelemetryDocumentationRehearsal`, package test coverage, local/staging-testnet rehearsal rows, dashboard/runbook lookup, docs QA incident drill, proof-root review, visible value-bearing mainnet blocking, workflow/checker wiring, and `check:v35-gate9`.

## Inherited deployment-depth notes

- V34 already owns host capability, environment lane, distributed runtime receipt, storage posture, secret rotation, migration approval, runtime observer/repair, rollback/upgrade, rehearsal, and deployment promotion readiness law.
- V35 reuses those deployment objects as inherited source truth when documenting runtime lanes, telemetry events, runbooks, dashboards, operator guides, and rollout guides.
- V35 must not rename V34 deployment artifacts as V35 gate artifacts. New V35 generated artifacts are telemetry/documentation artifacts: documentation surface catalog, telemetry taxonomy catalog, public docs guide inventory, operator runbook catalog, docs QA alignment report, testnet rollout readiness guide, interface integration report, rehearsal report, and documentation/telemetry promotion readiness report.
- Value-bearing mainnet remains blocked by inherited V34 deployment law and is documented in V35 only as blocked future-canon posture.

## Boundaries

V35 documents and instruments the proven commercial system.
It must not replace V34 interface contracts or V35 telemetry/documentation breadth.
It may expose source-safe deployment facts through docs and telemetry, but V34 remains the deployment-depth canon.

## Return To V35

Future V35 gates should begin by reading `BITCODE_SPEC.txt`, this notes file, the delta, and the parity matrix.
They should then close one telemetry/documentation contract slice at a time with source, tests, generated artifacts, workflow support, and clear promotion readiness.
