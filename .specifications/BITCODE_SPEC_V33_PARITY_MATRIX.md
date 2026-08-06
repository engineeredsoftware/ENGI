# Bitcode Spec V33 Parity Matrix

## Status

- Version: `V33`
- V33 state: canonical promotion complete; V33 parity truth, generated interface artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V33`
- Canonical proof-source commit: `6c3cc76c4a41bdbaf02c78334b3cd9c6fa3554b6`
- Prior canonical anchor: `BITCODE_SPEC_V32.md`
- Prior generated proof appendix: `BITCODE_SPEC_V32_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v33/spec-family-report.json`, `.proofs/v33/canonical-input-report.json`, `.proofs/v33/canon-posture-drift-report.json`, `.proofs/v33/interface-contract-catalog.json`, `.proofs/v33/mcp-api-tool-contracts.json`, `.proofs/v33/chatgpt-app-action-contracts.json`, `.proofs/v33/interface-authorization-policy.json`, `.proofs/v33/read-license-assetpack-rights-contracts.json`, `.proofs/v33/api-schema-compatibility-matrix.json`, `.proofs/v33/interface-telemetry-proof-hooks.json`, `.proofs/v33/interface-consumer-ux-regression-proof.json`, `.proofs/v33/promotion-readiness-report.json`, V33 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V33_PROVEN.md` as the generated proof appendix for V33 promotion
- Source parity state: V33 source-side interface contract catalog, MCP tool contracts, ChatGPT App action contracts, authorization policy, Read license and AssetPack rights contracts, API schema compatibility matrix, interface telemetry proof hooks, consumer UX regression proof, workflow, and promotion surfaces are canonicalized in the promoted V33 file family
- Spec companion: `BITCODE_SPEC_V33.md`
- Notes companion: `BITCODE_SPEC_V33_NOTES.md`
- Delta companion: `BITCODE_SPEC_V33_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V33_PROVEN.md` only after V33 promotion
- Scope: V33 canonical parity ledger for commercial interface depth over promoted V32 proof/testing canon
- Last fully realized canonical target preserved in source: `V33`

## Purpose

The V33 parity matrix prevents interface work from becoming a set of local adapters.
Every V33 gate must name the package-owned contract, interface surface, schema, auth policy, source-safety class, example fixture, compatibility row, telemetry/proof hook, validation command, and failure or repair posture required for closure.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V32.md`
- `BITCODE_SPEC_V32_PROVEN.md`
- `BITCODE_SPEC_V33.md`
- `BITCODE_SPEC_V33_DELTA.md`
- `BITCODE_SPEC_V33_NOTES.md`
- `BITCODE_SPEC_V33_PARITY_MATRIX.md`
- `SPECIFICATIONS_ROADMAP.md`
- `README.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `packages/protocol/README.md`
- `protocol-demonstration/README.md`
- `packages/protocol/src/canon-posture.js`
- `protocol-demonstration/src/canon-posture.js`
- `scripts/check-v33-gate1-interface-roadmap-opening.mjs`

No `_legacy/` source is active source truth.

## V33 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V33.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v33/gate-1-interface-roadmap-opening` | closed | V33 family validates in draft mode over active V32 and `check:v33-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V32 active, V33 draft, and coherent V34-V37 responsibilities. |
| Interface contract catalog | Gate 2 | `packages/btd/src/interface-contract-catalog.ts`, `packages/btd/__tests__/interface-contract-catalog.test.ts`, `.proofs/v33/interface-contract-catalog.json`, `check:v33-gate2` | closed | Active and deferred interface surfaces have package-owned rows. |
| MCP API contracts | Gate 3 | `packages/btd/src/mcp-tool-contract.ts`, `packages/btd/__tests__/mcp-tool-contract.test.ts`, `packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts`, `packages/executions-mcp/src/mcp-server/src/__tests__/unit/mcp-tool-contract.test.ts`, `.proofs/v33/mcp-api-tool-contracts.json`, `check:v33-gate3` | closed | MCP tool discovery, schemas, auth, denied states, and proof roots are package-derived. |
| ChatGPT App contracts | Gate 4 | `packages/btd/src/chatgpt-app-action-contract.ts`, `packages/btd/__tests__/chatgpt-app-action-contract.test.ts`, `packages/chatgptapp/src/tools.ts`, `packages/chatgptapp/src/__tests__/chatgpt-action-contract.test.ts`, `.proofs/v33/chatgpt-app-action-contracts.json`, `check:v33-gate4` | closed | ChatGPT App actions match package-owned Read, Need, Finding Fits, preview, fee, settlement, and delivery contracts. |
| Interface authorization policy | Gate 5 | `packages/btd/src/interface-authorization-policy.ts`, `packages/btd/__tests__/interface-authorization-policy.test.ts`, `packages/api/src/routes/__tests__/btd-crypto.test.ts`, `packages/executions-mcp/src/mcp-server/src/__tests__/unit/pipeline-ingress-contract.test.ts`, `packages/chatgptapp/src/__tests__/tools.test.ts`, `apps/uapi/tests/terminalOrganizationAuthority.test.ts`, `.proofs/v33/interface-authorization-policy.json`, `check:v33-gate5` | closed | Interface auth and license denials fail closed with repair posture across API, MCP, ChatGPT App, and Terminal handoff fixtures. |
| Read license and AssetPack rights contracts | Gate 6 | `packages/btd/src/read-license-assetpack-rights-contract.ts`, `packages/btd/__tests__/read-license-assetpack-rights-contract.test.ts`, API/MCP/ChatGPT App/Terminal fixture tests, `.proofs/v33/read-license-assetpack-rights-contracts.json`, `check:v33-gate6` | closed | Source-safe preview, paid settlement, BTD rights, and delivery contracts are consistent across interfaces. |
| API schema compatibility | Gate 7 | `packages/btd/src/api-schema-compatibility-matrix.ts`, `packages/btd/__tests__/api-schema-compatibility-matrix.test.ts`, API/MCP/ChatGPT App/Terminal fixture tests, `.proofs/v33/api-schema-compatibility-matrix.json`, `check:v33-gate7` | closed | Schemas, examples, compatibility status, and validation commands are source-safe and versionless. |
| Interface telemetry proof hooks | Gate 8 | `packages/btd/src/interface-telemetry-proof-hook.ts`, `packages/btd/__tests__/interface-telemetry-proof-hook.test.ts`, API/MCP/ChatGPT App/Terminal fixture tests, `.proofs/v33/interface-telemetry-proof-hooks.json`, `check:v33-gate8` | closed | Interface actions replay to executions, ledger, database, object storage, generated proof, and root-set roots. |
| Interface consumer UX regression proof | Gate 9 | `packages/btd/src/interface-consumer-ux-regression-proof.ts`, `packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts`, API/MCP/ChatGPT App/Terminal fixture tests, `.proofs/v33/interface-consumer-ux-regression-proof.json`, `check:v33-gate9` | closed | Consumers see source-safe summaries, proof roots, fee/rights previews, and readable denials without protected-source or prompt-body overexposure. |
| Promotion readiness | Gate 10 | `scripts/generate-v33-promotion-readiness-report.mjs`, `scripts/check-v33-gate10-promotion-readiness.mjs`, `.proofs/v33/promotion-readiness-report.json`, `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `packages/protocol/src/canonical/proven-generator.js`, `.github/workflows/v33-canon-promotion.yml`, `check:v33-gate10` | closed | `version/v33` can promote only after all V33 gates pass and generated canon is source-safe. |

## V33 implementation checklist

| Area | Required V33 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V32` during V33 gate work | closed |
| Gate branch pattern | V33 work happens on `version/v33` or `v33/gate-N-*` branches | closed |
| Spec-family shape | V33 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v33-gate1` fails closed on stale posture, missing roadmap truth, or missing interface-depth scope | closed |
| Gate-quality workflow | Gate workflow validates V32 active / V33 draft posture and the V33 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V32 canon, V33 draft family when present, and V32/V33 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V32 active / V33 draft workflow | closed |
| Interface vocabulary | V33 spec family names MCP API, ChatGPT App, `InterfaceContractCatalog`, `InterfaceAuthorizationPolicy`, `ReadLicenseInterfaceContract`, `AssetPackRightsInterfaceContract`, `APISchemaCompatibilityMatrix`, `InterfaceTelemetryProofHook`, and `InterfaceConsumerUxRegressionProof` | closed |

## Gate 8 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned telemetry hook registry exists | `packages/btd/src/interface-telemetry-proof-hook.ts` exports `buildBtdInterfaceTelemetryProofHookRegistry`, hook builders, required interface ids, and required postures | drafted |
| Required interface surfaces are present | Hook rows cover `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, and `package_consumer` | drafted |
| Required replay postures are present | Hook rows cover `success`, `denied`, and `blocked` | drafted |
| Replay roots are complete | Each hook records request, response, ledger, database, object-storage, generated-proof, and root-set roots | drafted |
| Source-safe hook payloads are enforced | BTD tests reject secret-shaped strings, protected prompt bodies, and protected-source payload fields | drafted |
| Surface fixtures consume hook rows | API, MCP API, ChatGPT App, and Terminal tests call `buildBtdInterfaceTelemetryProofHookRegistry` or `getBtdInterfaceTelemetryProofHook` | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/interface-telemetry-proof-hooks.json` is produced by `generate:v33-interface-telemetry-proof-hooks` and checked by `check:v33-interface-telemetry-proof-hooks` | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate8`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 8 artifact | drafted |

## Gate 9 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned consumer UX proof exists | `packages/btd/src/interface-consumer-ux-regression-proof.ts` exports `buildBtdInterfaceConsumerUxRegressionProof`, row builder, required surfaces, postures, and capabilities | drafted |
| Required consumer surfaces are present | Rows cover `public_api`, `mcp_api`, `chatgpt_app`, `terminal_handoff`, and `package_consumer` | drafted |
| Required readable postures are present | Rows cover `success_readable`, `denied_readable`, and `blocked_preview` | drafted |
| Required readability capabilities are present | Rows cover `action_label`, `source_safe_summary`, `proof_roots`, `repair_steps`, `fee_rights_preview`, and `denial_readability` | drafted |
| Source-safe consumer payloads are enforced | BTD tests reject secret-shaped strings, prompt bodies, protected-source payload fields, and demonstration-only fixtures | drafted |
| Surface fixtures consume proof rows | API, MCP API, ChatGPT App, and Terminal tests call `buildBtdInterfaceConsumerUxRegressionProof` or `getBtdInterfaceConsumerUxRegressionRow` | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/interface-consumer-ux-regression-proof.json` is produced by `generate:v33-interface-consumer-ux-regression-proof` and checked by `check:v33-interface-consumer-ux-regression-proof` | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate9`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 9 artifact | drafted |

## Gate 10 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Promotion readiness report exists | `.proofs/v33/promotion-readiness-report.json` is produced by `generate:v33-promotion-readiness` and checked by `check:v33-promotion-readiness` | closed |
| All V33 interface artifacts are covered | `scripts/generate-v33-promotion-readiness-report.mjs` scans Gate 2 through Gate 9 artifacts for presence, JSON parseability, and source safety | closed |
| Gate checker validates pre/post promotion posture | `scripts/check-v33-gate10-promotion-readiness.mjs` supports normal V32-draft mode and `--promotion-mode` V32/V33 posture | closed |
| Promotion command supports V33 | `scripts/promote-bitcode-canon.mjs` runs V33 gate checks, package tests, proof generation, runtime rewrite, promoted spec checks, and V33/V34 drift checks | closed |
| Spec-family promotion rewrite supports V33 | `scripts/prepare-bitcode-spec-family-promotion.mjs` rewrites V33 status, artifact inventory, source parity, proof-source commit, and promoted parity judgments | closed |
| Generated appendix supports V33 | `packages/protocol/src/canonical/proven-generator.js` builds `BITCODE_SPEC_V33_PROVEN.md` and `.proofs/v33/promotion-readiness-report.json` | closed |
| Workflows support V33 promotion | `.github/workflows/v33-canon-promotion.yml`, `bitcode-gate-quality.yml`, and `bitcode-canon-quality.yml` validate V33 before and after promotion | closed |
| Runtime posture advances to V34 draft | `prepare-bitcode-runtime-canon-promotion.mjs`, `packages/protocol/src/canon-posture.js`, `packages/protocol/data/state.json`, and `packages/protocol/README.md` carry V33 active / V34 draft after promotion | closed |

## Gate 2 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned catalog builder exists | `packages/btd/src/interface-contract-catalog.ts` exports `buildBtdInterfaceContractCatalog` and `BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS` | drafted |
| Active interface rows are named | `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, and `package_consumer` rows are active contracts | drafted |
| Deferred hooks stay visible | `exchange_hook` and `conversations_hook` rows are `deferred_not_admitted` rather than hidden | drafted |
| Row metadata is complete | each row includes owner package, action id, schema id, auth policy id, source-safety class, example fixture path, validation command, compatibility status, failure mode, repair posture, telemetry proof hook id, and proof root | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/interface-contract-catalog.json` is produced by `generate:v33-interface-contract-catalog` and checked by `check:v33-interface-contract-catalog` | drafted |
| Tests fail closed | `packages/btd/__tests__/interface-contract-catalog.test.ts` covers missing rows, duplicate rows, deferred-hook accidental admission, and secret-shaped or protected-source catalog text | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate2`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 2 contract | drafted |

## Gate 3 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned MCP contract builder exists | `packages/btd/src/mcp-tool-contract.ts` exports `buildBtdMcpToolContractRegistry`, `BTD_MCP_TOOL_CONTRACT_IDS`, and `getBtdMcpToolContract` | drafted |
| AssetPack create tool id is canonical | `bitcode://pipelines/asset-pack/create` is the required MCP API tool id | drafted |
| Tool schemas and auth are bound | `bitcode.mcp.assetPackCreate.input.v1`, `bitcode.mcp.assetPackCreate.output.v1`, `interface.authorization.pipeline-permission`, and `pipelines.create` are part of `McpToolContract` | drafted |
| Denied states are explicit | `SCHEMA_VALIDATION_FAILED`, `PROVIDER_BINDING_REQUIRED`, `INSUFFICIENT_PERMISSIONS`, `MISSING_API_KEY`, `RATE_LIMITED`, and `UNKNOWN_TOOL` are contract states | drafted |
| Proof and source-safety roots are explicit | proof-root fields include `toolId`, `inputSchemaId`, `outputSchemaId`, `authPolicyId`, `requestRoot`, `responseRoot`, and `writeAdmission`; source posture is `source-safe-preview-and-metadata-before-settlement` | drafted |
| MCP server consumes package contract | `packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts` uses `getBtdMcpToolContract`, `assetPackCreateContract.toolId`, and `assetPackCreateContract.description` | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/mcp-api-tool-contracts.json` is produced by `generate:v33-mcp-api-tool-contracts` and checked by `check:v33-mcp-api-tool-contracts` | drafted |
| Tests fail closed | BTD and MCP tests cover contract discovery, proof roots, denied states, invalid schema arguments, and protected-source invisibility | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate3`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 3 contract | drafted |

## Gate 4 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned ChatGPT action contract builder exists | `packages/btd/src/chatgpt-app-action-contract.ts` exports `buildBtdChatGptAppActionContractRegistry`, `BTD_CHATGPT_APP_ACTION_CONTRACT_IDS`, and `renderBtdChatGptAppSourceSafeResponse` | drafted |
| Reading action sequence is canonical | `bitcode_request_read`, `bitcode_review_read_need`, `bitcode_request_finding_fits`, `bitcode_review_asset_pack_preview`, `bitcode_quote_asset_pack_fee`, `bitcode_settle_asset_pack`, and `bitcode_deliver_asset_pack` are required action ids | drafted |
| Schemas and auth are bound | every `ChatGptAppActionContract` carries input/output schema ids, `interface.authorization.chatgpt-reading-action`, `chatgpt.reading.invoke`, and source-safe renderer id | drafted |
| Denied states are explicit and repairable | `SCHEMA_VALIDATION_FAILED`, `READ_NEED_REQUIRED`, `FINDING_FITS_REQUIRED`, `ASSET_PACK_PREVIEW_REQUIRED`, `FEE_QUOTE_REQUIRED`, `SETTLEMENT_REQUIRED`, `READ_LICENSE_REQUIRED`, `ORGANIZATION_AUTHORITY_REQUIRED`, and `CONFIRMATION_REQUIRED` are readable repair states | drafted |
| ChatGPT App consumes package contract | `packages/chatgptapp/src/tools.ts` uses `buildBtdChatGptAppActionContractRegistry`, derives tool schemas, and returns `renderBtdChatGptAppSourceSafeResponse` metadata | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/chatgpt-app-action-contracts.json` is produced by `generate:v33-chatgpt-app-action-contracts` and checked by `check:v33-chatgpt-app-action-contracts` | drafted |
| Tests fail closed | BTD and ChatGPT tests cover action registration, schemas, proof roots, accepted source-safe render output, denied repair actions, and secret-shaped source text rejection | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate4`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 4 contract | drafted |

## Gate 5 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned policy builder exists | `packages/btd/src/interface-authorization-policy.ts` exports `buildBtdInterfaceAuthorizationPolicy`, `buildBtdInterfaceAuthorizationPolicyFixtures`, and `renderBtdInterfaceAuthorizationDeniedState` | drafted |
| Required surfaces share fixtures | API, MCP, ChatGPT App, and Terminal tests call `getBtdInterfaceAuthorizationPolicyFixture` for shared fixture ids | drafted |
| Auth issuer and organization scope are first-class | policy output records auth issuer freshness plus organization, team, member, and role posture | drafted |
| Wallet, read-license, rights, and locked disclosure are first-class | policy output records wallet capability, read-license posture, AssetPack rights, and locked-source disclosure posture | drafted |
| Missing/stale authority fails closed | stale authority fixture returns `STALE_AUTHORITY`, readable denial, repair action, and denied-state rendering | drafted |
| Protected AssetPack delivery stays locked until paid/righted | unpaid ChatGPT delivery fixture returns `READ_LICENSE_REQUIRED`, `ASSET_PACK_RIGHTS_REQUIRED`, and `PROTECTED_SOURCE_DISCLOSURE_BLOCKED` | drafted |
| Interface writes carry policy roots | MCP pipeline writes and ChatGPT App connected-interface writes include `interfaceAuthorizationPolicy` metadata in write admission | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/interface-authorization-policy.json` is produced by `generate:v33-interface-authorization-policy` and checked by `check:v33-interface-authorization-policy` | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate5`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 5 contract | drafted |

## Gate 6 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned read-license contract exists | `packages/btd/src/read-license-assetpack-rights-contract.ts` exports `buildBtdReadLicenseInterfaceContract` and shared fixture builders | drafted |
| Package-owned AssetPack rights contract exists | `packages/btd/src/read-license-assetpack-rights-contract.ts` exports `buildBtdAssetPackRightsInterfaceContract` and the shared registry | drafted |
| Required surfaces share fixtures | API, MCP, ChatGPT App, and Terminal tests call `getBtdReadLicenseAssetPackRightsInterfaceFixture` for shared fixture ids | drafted |
| Preview stays source-safe before settlement | API and MCP fixtures admit `source_safe_preview_admitted` / `preview_admitted` with `protectedSourceVisible: false` | drafted |
| Unpaid delivery fails closed | ChatGPT App unpaid delivery fixture returns settlement, read-license, rights-transfer, and locked-source blockers | drafted |
| Paid delivery requires finality and rights transfer | Terminal fixture admits delivery only after confirmed BTC finality, paid unlock, delivery admission, and rights-transfer receipt | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/read-license-assetpack-rights-contracts.json` is produced by `generate:v33-read-license-assetpack-rights-contracts` and checked by `check:v33-read-license-assetpack-rights-contracts` | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate6`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 6 contract | drafted |

## Gate 7 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Package-owned schema matrix exists | `packages/btd/src/api-schema-compatibility-matrix.ts` exports `buildBtdApiSchemaCompatibilityMatrix`, row builders, required consumer surfaces, and required example postures | drafted |
| Required consumer surfaces are present | Matrix rows cover `public_api`, `mcp_api`, `chatgpt_app`, `terminal_handoff`, and `package_consumer` | drafted |
| Required example postures are present | Matrix rows cover `success`, `denied`, `blocked`, `stale`, and `deferred` | drafted |
| Versionless path discipline is enforced | `assertVersionlessPath` rejects `/vN/`, gate-prefixed, and work-in-progress interface paths; BTD tests cover rejection | drafted |
| Source-safe examples are enforced | BTD tests reject protected-source visibility and secret-shaped example payloads | drafted |
| Surface fixtures consume matrix rows | API, MCP, ChatGPT App, and Terminal tests call `buildBtdApiSchemaCompatibilityMatrix` or `getBtdApiSchemaCompatibilityRow` | drafted |
| Generated artifact is source-safe and deterministic | `.proofs/v33/api-schema-compatibility-matrix.json` is produced by `generate:v33-api-schema-compatibility-matrix` and checked by `check:v33-api-schema-compatibility-matrix` | drafted |
| Workflow and spec-family wiring exists | `check:v33-gate7`, `.github/workflows/bitcode-gate-quality.yml`, and `packages/protocol/src/canonical/v21-specifying.js` include the Gate 7 matrix | drafted |

## Gate 1 Parity

| Requirement | Source evidence | Current V33 judgment |
| --- | --- | --- |
| Active canon remains V32 during V33 draft opening | `BITCODE_SPEC.txt` contains `V32` | drafted |
| Runtime draft target is V33 | `packages/protocol/src/canon-posture.js` and `protocol-demonstration/src/canon-posture.js` declare V32 active and V33 draft | drafted |
| V33 SPEC family exists as draft | `BITCODE_SPEC_V33.md`, DELTA, NOTES, and PARITY | drafted |
| Roadmap is current | `SPECIFICATIONS_ROADMAP.md` states V32 active canon, V33 active draft target, and V34-V37 scopes | drafted |
| Gate-quality workflow is V33-aware | `.github/workflows/bitcode-gate-quality.yml` | drafted |
| Canon-quality workflow is V33-aware | `.github/workflows/bitcode-canon-quality.yml` | drafted |
| README reflects V32/V33 posture | `README.md` | drafted |
| PR template reflects V33 gate titles | `.github/pull_request_template.md` | drafted |
| V33 Gate 1 checker exists | `scripts/check-v33-gate1-interface-roadmap-opening.mjs` and package script | drafted |

## V33 accepted boundaries

- V33 owns interface-depth and interface-owned proof hooks.
- V34 owns deployment, host capability, distributed execution, environment lanes, rollback, upgrades, and secret rotation.
- V35 owns broad telemetry/documentation programs, dashboards, docs, incidents, operator guides, and rollout material.
- V36 owns deeper Exchange.
- V37 owns website Conversations.
- V33 does not authorize value-bearing production-mainnet launch.
- V33 does not expose protected AssetPack source before settlement through any interface.

## V33 completion condition

V33 is complete when all ten V33 gates are closed, source-safe interface contracts are package-owned and tested, MCP API and ChatGPT App behavior matches public API and Terminal handoff contracts, interface authorization and rights denials fail closed, schema compatibility evidence is generated, interface telemetry proof hooks replay to ledger/database/object-storage truth, and V33 promotion can generate `BITCODE_SPEC_V33_PROVEN.md` plus source-safe `.proofs/v33/*` artifacts.
