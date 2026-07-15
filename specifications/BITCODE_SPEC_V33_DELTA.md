# Bitcode Spec V33 Delta

## Status

- Version: `V33`
- V33 state: canonical promotion complete; this delta records the promoted V32-to-V33 interface-depth closure set
- Current canonical/latest target: `V33`
- Canonical proof-source commit: `6c3cc76c4a41bdbaf02c78334b3cd9c6fa3554b6`
- Prior canonical anchor: `BITCODE_SPEC_V32.md`
- Prior generated proof appendix: `BITCODE_SPEC_V32_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`, `.bitcode/v33-canon-posture-drift-report.json`, `.bitcode/v33-interface-contract-catalog.json`, `.bitcode/v33-mcp-api-tool-contracts.json`, `.bitcode/v33-chatgpt-app-action-contracts.json`, `.bitcode/v33-interface-authorization-policy.json`, `.bitcode/v33-read-license-assetpack-rights-contracts.json`, `.bitcode/v33-api-schema-compatibility-matrix.json`, `.bitcode/v33-interface-telemetry-proof-hooks.json`, `.bitcode/v33-interface-consumer-ux-regression-proof.json`, `.bitcode/v33-promotion-readiness-report.json`, V33 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V33_PROVEN.md` as the generated proof appendix for V33 promotion
- Source parity state: V33 source-side interface contract catalog, MCP tool contracts, ChatGPT App action contracts, authorization policy, Read license and AssetPack rights contracts, API schema compatibility matrix, interface telemetry proof hooks, consumer UX regression proof, workflow, and promotion surfaces are canonicalized in the promoted V33 file family
- Spec companion: `BITCODE_SPEC_V33.md`
- Notes companion: `BITCODE_SPEC_V33_NOTES.md`
- Parity companion: `BITCODE_SPEC_V33_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V33_PROVEN.md` only after V33 promotion
- Scope: V33 canonical delta for commercial interface depth over promoted V32 proof/testing canon

## Why V33 exists

V32 promoted proof and testing depth across Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, browser proof, readiness rehearsal, and promotion automation.
That made the core commercial system more provable.

V33 exists because external enterprise consumers still need a deeper, stable, source-safe interface layer beyond the V28 MCP API and ChatGPT App MVP.
MCP API, ChatGPT App, public API, and package consumers must share package-owned schemas, authorization policies, source-safe examples, compatibility tests, and telemetry/proof replay hooks instead of duplicating Terminal-local behavior.

## Accepted V33 decisions

- V32 remains active canon during V33 drafting.
- V33 gate branches are opened from `version/v33` and merged back only when their gate acceptance criteria are closed.
- V33 owns interface-depth: MCP API, ChatGPT App, public API, interface authorization policy, API schemas, examples, compatibility matrices, source-safe Read license contracts, AssetPack rights contracts, and interface telemetry/proof replay hooks.
- V33 does not reopen BTD supply law, Reading pipeline product law, Exchange product depth, website Conversations product depth, deployment operations depth, or broad telemetry/documentation programs.
- V33 interface contracts must be package-owned before they are exposed by MCP tools, ChatGPT App actions, public API routes, or Terminal handoffs.
- Interface responses must be source-safe before settlement and must fail closed on missing auth, missing wallet capability, missing read license, unpaid protected-source request, stale proof, projection drift, or incompatible schema.
- `InterfaceContractCatalog`, `InterfaceAuthorizationPolicy`, `ReadLicenseInterfaceContract`, `AssetPackRightsInterfaceContract`, `APISchemaCompatibilityMatrix`, `InterfaceTelemetryProofHook`, and `InterfaceConsumerUxRegressionProof` are the initial V33 contract anchors.

## Explicitly deferred

- V34 owns deployment, host capability, distributed execution, runtime/storage, environment lanes, CI/CD deployment approvals, rollback, upgrades, secret rotation, and repair playbooks beyond interface-owned hooks.
- V35 owns deeper telemetry/documentation programs, dashboards, alert runbooks, public docs breadth, incident response, and operator guides beyond interface-owned proof hooks.
- V36 owns deeper Exchange market behavior.
- V37 owns website Conversations product depth.
- Production-mainnet value-bearing launch remains explicitly blocked until a future promoted canon admits it.
- Bridge chain-of-record implementation remains out of V33.

## Pre-Implementation Sequence

1. Open `version/v33` from promoted `main`.
2. Open `v33/gate-1-interface-roadmap-opening` from `version/v33`.
3. Create the V33 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V32`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V32 is active canon, V33 is draft target, and V34-V37 scopes remain coherent.
5. Retarget gate-quality and canon-quality workflow posture checks to V32 active / V33 draft.
6. Add `check:v33-gate1` and a V33 Gate 1 checker.
7. Define V33 gates, acceptance criteria, carryforward parity rows, and post-V33 roadmap responsibilities.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v33`.

## Commit-Body Direction

V33 gate commit bodies should describe the closed gate, specification changes, implementation surfaces, tests, proof commands, and accepted boundaries.
The eventual V33 promotion commit body must name all closed V33 gates, generated interface proof artifacts, source-safe interface contracts, compatibility evidence, and the `BITCODE_SPEC.txt` pointer change from `V32` to `V33`.
It must explicitly defer V34 deployment depth, V35 telemetry/documentation breadth, V36 Exchange depth, V37 Conversations depth, bridge chain-of-record implementation, and value-bearing mainnet launch.

## Gate Delta

### Gate 1: V33 Interface Roadmap And Spec Opening

Gate 1 opens V33 correctly:

- V33 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V32`.
- README, roadmap, PR template, package docs, and workflows describe V32 active / V33 draft posture.
- `check:v33-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, interface-depth vocabulary, and promotion boundaries.
- The V33 gate list is explicit before interface implementation begins.

### Gate 2: Interface Inventory And Contract Catalog

Gate 2 inventories every active and deferred interface surface and creates the package-owned `InterfaceContractCatalog`.

Closure acceptance:

- MCP API, ChatGPT App, public API, Terminal handoff, package consumers, deferred Exchange hooks, and deferred Conversations hooks are enumerated;
- each row names owner package, action/tool/route id, schema id, auth policy, source-safety class, example fixture, validation command, compatibility status, and failure mode;
- deferred surfaces are represented as blocked or planned rows, not hidden confidence.

Implementation centers:

- `packages/btd/src/interface-contract-catalog.ts` owns the package source and deterministic row/catalog roots;
- `packages/btd/__tests__/interface-contract-catalog.test.ts` covers required rows, required fields, deferred blockers, duplicate/missing rows, and secret-shaped or protected-source text rejection;
- `.bitcode/v33-interface-contract-catalog.json` records source-safe Gate 2 artifact metadata, including `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, `package_consumer`, `exchange_hook`, and `conversations_hook`;
- `check:v33-gate2` validates source, tests, docs, workflow, generated artifact freshness, and `deferred_not_admitted` posture.

### Gate 3: MCP API Tool And Registry Contracts

Gate 3 hardens MCP API contracts.

Closure acceptance:

- MCP tool discovery is package-derived and source-safe;
- tool input/output schemas, auth policy, denial states, proof roots, and examples are covered by tests;
- MCP responses do not expose protected source before settlement.

Implementation centers:

- `packages/btd/src/mcp-tool-contract.ts` owns `McpToolContract`, `BTD_MCP_TOOL_CONTRACT_IDS`, and the deterministic registry builder for `bitcode://pipelines/asset-pack/create`;
- `packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts` derives the AssetPack create MCP tool id and description from `getBtdMcpToolContract` instead of duplicating interface truth;
- denied states include `SCHEMA_VALIDATION_FAILED`, `PROVIDER_BINDING_REQUIRED`, `INSUFFICIENT_PERMISSIONS`, `MISSING_API_KEY`, `RATE_LIMITED`, and `UNKNOWN_TOOL`;
- proof-root fields include `toolId`, `inputSchemaId`, `outputSchemaId`, `authPolicyId`, `requestRoot`, `responseRoot`, and `writeAdmission`;
- `.bitcode/v33-mcp-api-tool-contracts.json` records source-safe Gate 3 artifact metadata, including package-derived discovery, proof-root coverage, denied-state coverage, protected-source invisibility, and credential non-serialization;
- `check:v33-gate3` validates source, tests, docs, workflow, generated artifact freshness, and source-safe MCP metadata posture.

### Gate 4: ChatGPT App Action And Tool Contracts

Gate 4 hardens ChatGPT App contracts.

Implementation centers:

- `packages/btd/src/chatgpt-app-action-contract.ts` owns `ChatGptAppActionContract`, `BTD_CHATGPT_APP_ACTION_CONTRACT_IDS`, and source-safe response rendering through `renderBtdChatGptAppSourceSafeResponse`;
- `packages/chatgptapp/src/tools.ts` derives Reading action tool names, descriptions, schemas, source-safe metadata, and denial repair posture from `buildBtdChatGptAppActionContractRegistry`;
- the package-owned action ids are `bitcode_request_read`, `bitcode_review_read_need`, `bitcode_request_finding_fits`, `bitcode_review_asset_pack_preview`, `bitcode_quote_asset_pack_fee`, `bitcode_settle_asset_pack`, and `bitcode_deliver_asset_pack`;
- denied states include `SCHEMA_VALIDATION_FAILED`, `MISSING_READER_SESSION`, `READ_NEED_REQUIRED`, `FINDING_FITS_REQUIRED`, `ASSET_PACK_PREVIEW_REQUIRED`, `FEE_QUOTE_REQUIRED`, `SETTLEMENT_REQUIRED`, `READ_LICENSE_REQUIRED`, `ORGANIZATION_AUTHORITY_REQUIRED`, and `CONFIRMATION_REQUIRED`;
- `.bitcode/v33-chatgpt-app-action-contracts.json` records source-safe Gate 4 action metadata, proof-root coverage, source-safe renderer coverage, denial repair coverage, and credential non-serialization;
- `check:v33-gate4` validates source, tests, docs, workflow, generated artifact freshness, and ChatGPT App source-safe action posture.

Closure acceptance:

- ChatGPT App actions use package-owned schemas and source-safe response renderers;
- denied-state readability and repair actions are tested;
- Read, Need, Finding Fits, preview, fee, settlement, and delivery actions match the same contracts used by API and MCP.

### Gate 5: Interface Authorization Policy Fail-Closed

Gate 5 centralizes interface authorization.

Closure acceptance:

- `InterfaceAuthorizationPolicy` covers auth issuer, organization/team/role, wallet capability, read-license posture, AssetPack rights, protected-source disclosure, and repair posture;
- API, MCP, ChatGPT App, and Terminal handoff tests share policy fixtures;
- missing or stale authority fails closed with readable denial.

Gate 5 implementation binds `InterfaceAuthorizationPolicy` to the BTD package,
publishes `.bitcode/v33-interface-authorization-policy.json`, and ensures MCP
pipeline writes plus ChatGPT App connected-interface writes carry the policy
root in write-admission metadata. The policy does not unlock source by itself:
locked AssetPack delivery still requires settlement, read-license evidence,
AssetPack rights, and an admitted interface action.

### Gate 6: Read License And AssetPack Rights Interface Contracts

Gate 6 proves paid/unpaid Reading boundaries across interfaces.

Closure acceptance:

- `ReadLicenseInterfaceContract` covers Read request, reviewed Need, Finding Fits admission, preview, fee quote, license posture, paid/unpaid denial, and proof root;
- `AssetPackRightsInterfaceContract` covers source-safe preview, BTD range/read-right state, BTC settlement, delivery admission, and rights transfer projection;
- pre-settlement protected source remains locked in all interface fixtures.

Gate 6 implementation binds both contracts to the BTD package, publishes
`.bitcode/v33-read-license-assetpack-rights-contracts.json`, and requires API,
MCP, ChatGPT App, and Terminal tests to consume shared fixtures. The API and
MCP fixtures prove source-safe preview before settlement. The ChatGPT App
fixture proves unpaid locked-source delivery is denied with settlement,
read-license, rights-transfer, and locked-source blockers. The Terminal fixture
proves delivery admission only after confirmed BTC finality, paid unlock,
rights transfer, and BTD read-right evidence. The artifact records only
source-safe metadata and explicitly proves protected source and credentials are
not serialized.

### Gate 7: API Schemas Examples And Compatibility Matrix

Gate 7 creates the schema compatibility spine.

Closure acceptance:

- `APISchemaCompatibilityMatrix` records schema ids, consumer surfaces, examples, breaking-change policy, compatibility status, fixture paths, and validation commands;
- examples exist for success, denied, blocked, stale, and deferred states;
- versionless API path discipline remains enforced.

Gate 7 implementation binds `APISchemaCompatibilityMatrix` to the BTD package,
publishes `.bitcode/v33-api-schema-compatibility-matrix.json`, and requires API,
MCP, ChatGPT App, and Terminal tests to consume shared rows. The matrix records
public API routes, MCP API tool URI, ChatGPT App action URI, Terminal handoff
URI, and a deferred package-consumer hook. It fails closed when required
consumer surfaces or example postures are missing, rejects protected-source or
secret-shaped example payloads, and rejects versioned, gate-prefixed, or
work-in-progress interface paths.

### Gate 8: Interface Telemetry And Proof Replay Hooks

Gate 8 binds interface actions to proof replay.

Closure acceptance:

- `InterfaceTelemetryProofHook` records execution id, interface id, action id, request root, response root, ledger/database/object-storage roots, denial or success posture, and replay command;
- hooks are source-safe and do not print secrets, protected prompts, or protected source;
- proof replay joins Terminal, API, MCP, and ChatGPT App activity consistently.

V33 Gate 8 Interface Telemetry And Proof Replay Hooks implementation binds
`InterfaceTelemetryProofHook` to the BTD package, publishes
`.bitcode/v33-interface-telemetry-proof-hooks.json`, and requires public API,
MCP API, ChatGPT App, Terminal, and package-consumer tests to consume the shared
hook registry. Hook rows cover success, denied, and blocked postures; include
request/response, ledger, database, object-storage, generated-proof, and
root-set roots; carry replay commands for the exact validation tests; and fail
closed when secret-shaped strings, protected prompt bodies, protected source
payloads, missing interface coverage, missing posture coverage, or stale
generated artifacts appear.

### Gate 9: Interface Consumer UX Regression Proof

Gate 9 proves consumer readability and handoff quality.

Closure acceptance:

- MCP API, ChatGPT App, public API examples, Terminal handoff, and denied states have regression proof;
- source-safe summary, proof roots, repair steps, and fee/rights preview are readable without overexposure;
- interface consumer tests avoid brittle demo-only behavior.

V33 Gate 9 Interface Consumer UX Regression Proof implementation binds
`InterfaceConsumerUxRegressionProof` to the BTD package, publishes
`.bitcode/v33-interface-consumer-ux-regression-proof.json`, and requires public
API, MCP API, ChatGPT App, Terminal, and package-consumer tests to consume the
shared proof rows. Rows cover public API denied read access, MCP API Finding
Fits readability, ChatGPT App blocked delivery, Terminal AssetPack preview
handoff, and package-consumer readback. The proof records action labels,
source-safe summaries, proof roots, repair steps, fee/rights previews, replay
commands, readable denial or success summaries, and source-safety posture; it
fails closed when required surfaces, postures, capabilities, proof roots,
repair steps, fee/rights previews, readable denial fields, or demonstration
independence are missing.

### Gate 10: V33 Promotion Readiness

Gate 10 owns final generated proof, promotion workflow support, source-safe `.bitcode/v33-promotion-readiness-report.json`, and V33 closure.

Closure acceptance:

- V33 promotion checks validate all gate artifacts, interface contracts, compatibility matrices, telemetry proof hooks, and generated proof appendix support;
- promotion scripts support V33 command planning, dry-run, generated proof output, and derived promotion commit body generation;
- MCP and other interface adapters keep credential record identifiers in adapter-local audit context rather than hashing them into BTD authorization proof roots;
- promotion workflow can rewrite active V33 / draft V34 posture;
- `version/v33` can be requested into `main` only after all V33 gates close.
