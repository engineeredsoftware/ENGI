# Bitcode Spec V33 Notes

## Status

- Version: `V33`
- V33 state: canonical promotion complete; V33 notes record the accepted interface contract, policy, schema, telemetry, consumer UX, and promotion-readiness evidence
- Current canonical/latest target: `V33`
- Canonical proof-source commit: `6c3cc76c4a41bdbaf02c78334b3cd9c6fa3554b6`
- Prior canonical anchor: `BITCODE_SPEC_V32.md`
- Prior generated proof appendix: `BITCODE_SPEC_V32_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`, `.bitcode/v33-canon-posture-drift-report.json`, `.bitcode/v33-interface-contract-catalog.json`, `.bitcode/v33-mcp-api-tool-contracts.json`, `.bitcode/v33-chatgpt-app-action-contracts.json`, `.bitcode/v33-interface-authorization-policy.json`, `.bitcode/v33-read-license-assetpack-rights-contracts.json`, `.bitcode/v33-api-schema-compatibility-matrix.json`, `.bitcode/v33-interface-telemetry-proof-hooks.json`, `.bitcode/v33-interface-consumer-ux-regression-proof.json`, `.bitcode/v33-promotion-readiness-report.json`, V33 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V33_PROVEN.md` as the generated proof appendix for V33 promotion
- Source parity state: V33 source-side interface contract catalog, MCP tool contracts, ChatGPT App action contracts, authorization policy, Read license and AssetPack rights contracts, API schema compatibility matrix, interface telemetry proof hooks, consumer UX regression proof, workflow, and promotion surfaces are canonicalized in the promoted V33 file family
- Scope: V33 canonical notes for commercial interface depth over promoted V32 proof/testing canon
- Last fully realized canonical target preserved in source: `V33`

## Notes companion rule

This NOTES file is a working companion to `BITCODE_SPEC_V33.md`.
It records intent, risks, and carryforward reminders, but the SPEC, DELTA, PARITY, source, generated artifacts, and gate checkers carry binding closure.
Notes must never promote V33 by themselves and must never authorize direct work on `main`.

## Concise current-system reading

V32 is active canon.
It proves the commercial system across Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, browser proof, readiness rehearsal, and promotion automation.

V33 begins from that canon to deepen commercial interfaces beyond the V28 MVP.
The main question is whether enterprise consumers can operate Bitcode through MCP API, ChatGPT App, public API, and package contracts with the same source-safe law, proof roots, rights boundaries, and repair posture Terminal already exposes.

## Simplified-spec reading rule

Read V33 in this order:

1. `BITCODE_SPEC.txt` to confirm the active pointer is still `V32`.
2. `BITCODE_SPEC_V32.md` and `BITCODE_SPEC_V32_PROVEN.md` for active law and proof base.
3. `BITCODE_SPEC_V33.md` for draft target law.
4. `BITCODE_SPEC_V33_DELTA.md` for what changes from V32 to V33.
5. `BITCODE_SPEC_V33_PARITY_MATRIX.md` for gate and source parity.
6. This NOTES file for constraints, reminders, and deferred work.

Do not read `_legacy/` as active law.

## V33 gate plan

1. Gate 1: V33 Interface Roadmap And Spec Opening.
2. Gate 2: Interface Inventory And Contract Catalog.
3. Gate 3: MCP API Tool And Registry Contracts.
4. Gate 4: ChatGPT App Action And Tool Contracts.
5. Gate 5: Interface Authorization Policy Fail-Closed.
6. Gate 6: Read License And AssetPack Rights Interface Contracts.
7. Gate 7: API Schemas Examples And Compatibility Matrix.
8. Gate 8: Interface Telemetry And Proof Replay Hooks.
9. Gate 9: Interface Consumer UX Regression Proof.
10. Gate 10: V33 Promotion Readiness.

## Gate 5 working notes

Gate 5 owns the shared `InterfaceAuthorizationPolicy` primitive. The policy is
not an adapter convenience; it is the package-owned fail-closed admission object
for API, MCP, ChatGPT App, and Terminal handoffs. Gate 5 must keep readable
denial state available for missing/stale authority and keep locked source
blocked until read-license, AssetPack rights, settlement, wallet, organization,
and repair posture are all admitted.

## Gate 6 working notes

Gate 6 owns the shared `ReadLicenseInterfaceContract` and
`AssetPackRightsInterfaceContract` primitives. These contracts sit after
`InterfaceAuthorizationPolicy`: policy decides whether the interface action is
admissible, while the license/rights contracts decide what Reading state may be
shown or delivered. They must keep Read request roots, reviewed Need roots,
Finding Fits admission roots, source-safe preview roots, fee quote roots, BTD
ranges, BTC settlement finality, delivery admission, and rights transfer
projection together so API, MCP, ChatGPT App, and Terminal surfaces cannot
invent divergent paid/unpaid disclosure rules.

Pre-settlement preview is source-safe metadata only. Protected source remains
locked until BTC finality, paid unlock, BTD read-right state, delivery
admission, and rights transfer receipt all align. Generated artifacts must
never serialize protected source or credentials.

## Interface-depth notes

- MCP API and ChatGPT App are commercial interfaces, not demonstration surfaces.
- Public API route shapes must be versionless in source paths and package-owned in schemas.
- Interfaces must use Protocol/BTD/Reading primitives instead of recreating Terminal-only JSON shapes.
- Source-safe preview is admissible before settlement; protected AssetPack source is not.
- Denied states must be readable and repairable, not generic errors.
- Compatibility rows should be generated where possible and checked in CI.
- Examples must cover success, denied, blocked, stale, deferred, unpaid, and paid states without protected source leakage.

## Gate 2 closure note

Gate 2 introduces `InterfaceContractCatalog` in `packages/btd/src/interface-contract-catalog.ts`.
The catalog rows are `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, `package_consumer`, `exchange_hook`, and `conversations_hook`.
The first five rows are active contracts; `exchange_hook` and `conversations_hook` remain visible as `deferred_not_admitted` rows.
Every row names the package owner, action/tool/route id, schema id, auth policy id, source-safety class, example fixture path, validation command, compatibility status, failure mode, repair posture, telemetry proof hook id, and deterministic proof root.
The generated source-safe artifact is `.bitcode/v33-interface-contract-catalog.json`, checked by `check:v33-interface-contract-catalog` and `check:v33-gate2`.

## Gate 3 closure note

Gate 3 introduces `McpToolContract` in `packages/btd/src/mcp-tool-contract.ts`.
The first required MCP API tool id is `bitcode://pipelines/asset-pack/create`.
The contract binds `bitcode.mcp.assetPackCreate.input.v1`, `bitcode.mcp.assetPackCreate.output.v1`, `interface.authorization.pipeline-permission`, `pipelines.create`, source-safety class `protected-source-locked`, and policy `source-safe-preview-and-metadata-before-settlement`.
Denied states are explicit and include `SCHEMA_VALIDATION_FAILED`, `PROVIDER_BINDING_REQUIRED`, `INSUFFICIENT_PERMISSIONS`, `MISSING_API_KEY`, `RATE_LIMITED`, and `UNKNOWN_TOOL`.
The MCP server consumes the package-owned contract through `getBtdMcpToolContract` for tool discovery, including tool id and description, while pre-settlement protected source remains invisible.
The generated source-safe artifact is `.bitcode/v33-mcp-api-tool-contracts.json`, checked by `check:v33-mcp-api-tool-contracts` and `check:v33-gate3`.

## Gate 4 closure note

Gate 4 introduces `ChatGptAppActionContract` in `packages/btd/src/chatgpt-app-action-contract.ts`.
The required ChatGPT App Reading action ids are `bitcode_request_read`, `bitcode_review_read_need`, `bitcode_request_finding_fits`, `bitcode_review_asset_pack_preview`, `bitcode_quote_asset_pack_fee`, `bitcode_settle_asset_pack`, and `bitcode_deliver_asset_pack`.
Each action binds package-owned input/output schemas, `interface.authorization.chatgpt-reading-action`, `chatgpt.reading.invoke`, a source-safe response renderer, proof-root projection, and readable repair posture.
Denied states include `SCHEMA_VALIDATION_FAILED`, `READ_NEED_REQUIRED`, `FINDING_FITS_REQUIRED`, `ASSET_PACK_PREVIEW_REQUIRED`, `FEE_QUOTE_REQUIRED`, `SETTLEMENT_REQUIRED`, `READ_LICENSE_REQUIRED`, `ORGANIZATION_AUTHORITY_REQUIRED`, and `CONFIRMATION_REQUIRED`.
The ChatGPT App tool registry consumes the package-owned contracts through `buildBtdChatGptAppActionContractRegistry`, while `renderBtdChatGptAppSourceSafeResponse` keeps locked AssetPack contents invisible.
The generated source-safe artifact is `.bitcode/v33-chatgpt-app-action-contracts.json`, checked by `check:v33-chatgpt-app-action-contracts` and `check:v33-gate4`.

## Gate 5 closure note

Gate 5 introduces `InterfaceAuthorizationPolicy` in `packages/btd/src/interface-authorization-policy.ts`.
The shared fixtures cover API request admission, MCP Finding Fits admission, ChatGPT App locked AssetPack delivery, Terminal BTC fee admission, stale authority denial, and unpaid delivery denial.
The policy records auth issuer freshness, organization/team/member/role posture, wallet capability, read-license posture, AssetPack rights, locked-source disclosure, repair posture, readable denial messages, repair actions, and deterministic policy roots.
MCP pipeline writes and ChatGPT App connected-interface writes carry `interfaceAuthorizationPolicy` metadata in write-admission output.
The generated source-safe artifact is `.bitcode/v33-interface-authorization-policy.json`, checked by `check:v33-interface-authorization-policy` and `check:v33-gate5`.

## Gate 6 closure note

Gate 6 introduces `ReadLicenseInterfaceContract` and
`AssetPackRightsInterfaceContract` in
`packages/btd/src/read-license-assetpack-rights-contract.ts`. The shared
fixtures cover API source-safe preview admission, MCP Finding Fits source-safe
preview admission, ChatGPT App unpaid delivery denial, and Terminal paid rights
delivery admission. The contracts record Read request roots, reviewed Need
roots, Finding Fits admission roots, source-safe preview roots, fee quote roots,
license posture, BTD range, read-right state, BTC settlement finality, delivery
admission, rights transfer projection, denial codes, source-safety posture, and
deterministic proof roots. The generated source-safe artifact is
`.bitcode/v33-read-license-assetpack-rights-contracts.json`, checked by
`check:v33-read-license-assetpack-rights-contracts` and `check:v33-gate6`.

## Gate 7 working notes

Gate 7 owns the shared `APISchemaCompatibilityMatrix` primitive. This matrix
is not an OpenAPI dump; it is Bitcode's package-owned compatibility spine for
the interface contracts that external consumers actually rely on. Each row
must name the schema id, request/response schema ids, consumer surface,
route/tool/action path, example posture, compatibility status,
breaking-change policy, fixture path, example path, validation command, and
source-safety posture.

The required example postures are `success`, `denied`, `blocked`, `stale`, and
`deferred`. Deferred rows remain explicit and source-safe rather than hidden.
No row may introduce a versioned `/vN/`, gate-prefixed, or work-in-progress
source identifier. Protected AssetPack source and credentials must remain
absent from row examples and generated artifacts.

## Gate 7 closure note

Gate 7 introduces `APISchemaCompatibilityMatrix` in
`packages/btd/src/api-schema-compatibility-matrix.ts`. The shared rows cover
public API registry success, public API mint-draft denial, public API stale
organization authority denial, MCP API AssetPack creation success, ChatGPT App
blocked delivery, Terminal blocked preview handoff, and a deferred
package-consumer Exchange hook. API, MCP, ChatGPT App, and Terminal tests
consume the shared rows. The generated source-safe artifact is
`.bitcode/v33-api-schema-compatibility-matrix.json`, checked by
`check:v33-api-schema-compatibility-matrix` and `check:v33-gate7`.

## Gate 8 working notes

Gate 8 owns the shared `InterfaceTelemetryProofHook` primitive. This hook is
not an observability dump; it is Bitcode's source-safe replay spine for proving
that interface activity can be traced back to executions and forward to ledger,
database, object-storage, generated-proof, and root-set evidence. Each hook
must remain package-owned and consumable by Terminal, public API, MCP API,
ChatGPT App, and package consumers without importing those surface
implementations into the BTD package.

The required replay postures are `success`, `denied`, and `blocked`. Hooks may
name action ids, execution ids, root ids, replay commands, theorem labels, and
test/source evidence, but must not include secret-shaped strings, protected
prompt bodies, protected AssetPack source, private source payloads, or raw
inference contents. Surface tests should prove they consume the shared hooks
instead of inventing parallel replay metadata.

## Gate 8 closure note

V33 Gate 8 Interface Telemetry And Proof Replay Hooks introduces
`InterfaceTelemetryProofHook` in
`packages/btd/src/interface-telemetry-proof-hook.ts`. The shared rows cover
Terminal blocked preview handoff, public API denied readback, MCP API successful
Reading pipeline ingress, ChatGPT App blocked protected-source delivery, and
package-consumer contract replay. API, MCP, ChatGPT App, Terminal, and BTD
tests consume the shared registry. The generated source-safe artifact is
`.bitcode/v33-interface-telemetry-proof-hooks.json`, checked by
`check:v33-interface-telemetry-proof-hooks` and `check:v33-gate8`.

## Gate 9 working notes

Gate 9 owns the shared `InterfaceConsumerUxRegressionProof` primitive. This
proof is the consumer-readable layer over the prior V33 contract work: it does
not redefine authorization, rights, telemetry, or schema law, but proves that
each interface can present the action label, source-safe summary, proof roots,
repair steps, fee/rights preview, and readable denied or blocked state without
overexposure.

The required rows cover public API denied read access, MCP API Finding Fits
readability, ChatGPT App blocked AssetPack delivery, Terminal preview handoff,
and package-consumer contract readback. Rows must not expose protected
AssetPack source, prompt bodies, credentials, raw inference payloads, or
demonstration-only fixtures.

## Gate 9 closure notes

V33 Gate 9 Interface Consumer UX Regression Proof introduces
`InterfaceConsumerUxRegressionProof` in
`packages/btd/src/interface-consumer-ux-regression-proof.ts`. API, MCP,
ChatGPT App, Terminal, and BTD tests consume the shared proof rows. The
generated source-safe artifact is
`.bitcode/v33-interface-consumer-ux-regression-proof.json`, checked by
`check:v33-interface-consumer-ux-regression-proof` and `check:v33-gate9`.

## Gate 10: V33 Promotion Readiness

Gate 10 owns the final V33 readiness proof, not new interface product law. The
source-safe `.bitcode/v33-promotion-readiness-report.json` must prove that all
V33 interface artifacts are present, parseable, source-safe, and wired into
gate checks, generated appendix support, `v33-canon-promotion.yml`, and
promotion command planning. The promotion boundary rewrites package runtime
posture from active V32 / draft V33 to active V33 / draft V34, generates
`BITCODE_SPEC_V33_PROVEN.md`, and preserves the no-direct-main-push branch
discipline.

The Gate 10 checker is `check:v33-gate10`. It must pass both before promotion
with `BITCODE_SPEC.txt` pointing at `V32` and after promotion with the pointer
at `V33`.

Promotion readiness also requires interface authorization proof roots to avoid
hashing credential record identifiers as proof material. Interface adapters keep
API key record ids in their own audit context; BTD authorization roots bind the
authenticated principal, organization authority, wallet/license/rights state,
and source-visibility decision.

## Carryforward from V32

V33 inherits these V32 truths:

- `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` are the active Reading pipelines.
- agents are PTRR agents;
- PTRR sub-steps are ThricifiedGenerations;
- source-safe AssetPack preview remains separate from paid full-source delivery;
- BTC fee, BTD read/right transfer, ledger truth, database projection, object-storage delivery, and PR delivery remain synchronized but distinct;
- staging-testnet and production-mainnet remain separate operational lanes;
- production-mainnet value-bearing launch is not admitted by V33 opening.

## Explicit deferrals

- V34 owns deployment, host capability, distributed execution, runtime/storage, deployment approvals, rollback, upgrades, secret rotation, and repair playbooks.
- V35 owns broad telemetry/documentation, public docs, dashboards, runbooks, incident response, operator guides, and rollout material.
- V36 owns deeper Exchange.
- V37 owns website Conversations.

## Return To V32

If V33 work threatens active protocol law, protected-source boundaries, BTD settlement invariants, or generated proof stability, return to V32 canon and write the conflict as a V33 gate blocker instead of silently changing source behavior.
