# Bitcode Spec V33

## Status

- Version: `V33`
- V33 state: canonical promotion complete; V33 is the active commercial interface-depth canon and the V33 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V33`
- Canonical proof-source commit: `6c3cc76c4a41bdbaf02c78334b3cd9c6fa3554b6`
- Prior canonical anchor: `BITCODE_SPEC_V32.md`
- Prior generated proof appendix: `BITCODE_SPEC_V32_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`, `.bitcode/v33-canon-posture-drift-report.json`, `.bitcode/v33-interface-contract-catalog.json`, `.bitcode/v33-mcp-api-tool-contracts.json`, `.bitcode/v33-chatgpt-app-action-contracts.json`, `.bitcode/v33-interface-authorization-policy.json`, `.bitcode/v33-read-license-assetpack-rights-contracts.json`, `.bitcode/v33-api-schema-compatibility-matrix.json`, `.bitcode/v33-interface-telemetry-proof-hooks.json`, `.bitcode/v33-interface-consumer-ux-regression-proof.json`, `.bitcode/v33-promotion-readiness-report.json`, V33 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V33_PROVEN.md` as the generated proof appendix for V33 promotion
- Source parity state: V33 source-side interface contract catalog, MCP tool contracts, ChatGPT App action contracts, authorization policy, Read license and AssetPack rights contracts, API schema compatibility matrix, interface telemetry proof hooks, consumer UX regression proof, workflow, and promotion surfaces are canonicalized in the promoted V33 file family
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V32`
- Notes companion: `BITCODE_SPEC_V33_NOTES.md`
- Delta companion: `BITCODE_SPEC_V33_DELTA.md`
- Parity companion: `BITCODE_SPEC_V33_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V33_PROVEN.md` only after V33 promotion
- Scope: V33 canonical system specification for commercial interface depth over promoted MCP API, ChatGPT App, public API, package consumers, authorization, schemas, license/rights, telemetry, and source-safe consumer UX contracts
- Last fully realized canonical target preserved in source: `V33`

V33 begins from promoted V32.
V32 closed proof replay, deterministic generated artifacts, Reading pipeline proof coverage, interface regression, browser proof, readiness rehearsal, and promotion automation.
V33 uses that proof base to make external commercial interfaces mature enough for enterprise integration without reopening Reading law, BTD supply law, or deployment operations that belong to V34.

## Version executive summary

V33 is the interface-depth version.
It matures package-owned Protocol/BTD objects into stable contracts for MCP API, ChatGPT App, public API, and other non-Auxillaries non-website application consumers.
The work is commercial because these interfaces let enterprise systems read Bitcode without depending on Terminal internals.

V33 closes only when interface consumers can:

- discover source-safe actions, schemas, rights, fees, and proof roots;
- request Read, review synthesized Need, request Finding Fits, review AssetPack preview metadata, and settle through contract-shaped calls;
- receive fail-closed denials for missing auth, missing license, unpaid disclosure, unavailable wallet capability, policy refusal, and protected-source boundary violations;
- replay interface telemetry and proofs back to the same ledger, database, and object-storage truth that Terminal uses;
- rely on contract tests, examples, compatibility matrices, and promotion checks for every active interface.

## Canonical Bitcode executive summary

Bitcode measures technical knowledge, finds deposits that fit reviewed Reads, synthesizes source-bearing AssetPacks, and settles read rights in BTC with BTD range and rights receipts.
The active V32 canon remains:

- Deposits supply source material to the Bitcode depository.
- A Read Request is synthesized into a reviewed ReadNeed by `ReadNeedComprehensionSynthesis`.
- `ReadFitsFindingSynthesis` searches for plural threshold-passing fit deposits and synthesizes source-safe AssetPack preview records.
- Protected AssetPack source remains hidden before paid settlement.
- BTC is the fee asset and BTD range/read-license/right transfer is ledgerized.
- Paid settlement unlocks full AssetPack delivery, including pull-request delivery where applicable.

V33 does not redefine those laws.
V33 makes them consistently available through stable interface contracts.

## V33 source-of-truth hierarchy

The V33 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V32` until V33 promotion.
2. `BITCODE_SPEC_V33.md` during V33 drafting.
3. `BITCODE_SPEC_V33_NOTES.md`.
4. `BITCODE_SPEC_V33_DELTA.md`.
5. `BITCODE_SPEC_V33_PARITY_MATRIX.md`.
6. generated V33 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V33_PROVEN.md` only after promotion.
8. source implementation, tests, examples, public docs, internal docs, and QA evidence that realize this family.

Older specifications are provenance only.
They must not become hidden current-system law.

## V33 full-system, re-implementation, and audit rule

V33 must be re-implementable and auditable from its specification family without reading conversation history.
Every interface contract, tool, action, API route, schema, example, auth policy, denial mode, telemetry record, and proof replay hook must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V33 totality and precision enforcement rule

V33 fails closed when an interface exposes a Bitcode action without a package-owned contract, validation path, auth policy, source-safety class, and proof replay expectation.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions;
- interfaces are contract consumers, not owners of protocol truth.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V33 system goals, non-goals, and design principles

Goals:

- define an `InterfaceContractCatalog` over MCP API, ChatGPT App, public API, and package consumers;
- harden `InterfaceAuthorizationPolicy` as the fail-closed policy seam for every interface action;
- make `ReadLicenseInterfaceContract` and `AssetPackRightsInterfaceContract` explicit over Reading, preview, fee, settlement, BTD, and delivery surfaces;
- produce an `APISchemaCompatibilityMatrix` that binds schemas, examples, source-safety class, compatibility status, and consumer tests;
- add `InterfaceTelemetryProofHook` records that let interface activity replay to executions, ledger, database, object storage, and generated proof roots;
- mature MCP API tool discovery, action contracts, denied-state readability, and proof-root surfacing;
- mature ChatGPT App action contracts, examples, and source-safe response rendering;
- preserve Terminal and Auxillaries as product surfaces while making API/MCP/ChatGPT App reusable and package-owned.

Non-goals:

- no new BTD supply or tokenomics law;
- no rewrite of `ReadNeedComprehensionSynthesis` or `ReadFitsFindingSynthesis` product law;
- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no deployment host capability expansion beyond interface-owned hooks;
- no telemetry/documentation program breadth that belongs to V35;
- no value-bearing production-mainnet approval.

Design principles:

- contracts before examples;
- policy before action;
- source-safe preview before protected-source unlock;
- package-owned schemas before interface-local JSON shapes;
- replayable proof roots before dashboard-only observability;
- fail-closed denial with repair posture before partial success.

## V33 system architecture and layer boundaries

V33 preserves the V32 architecture:

- `packages/protocol` owns canon posture, spec-family checks, generated-proof helpers, and promotion-governance helper APIs;
- `packages/btd` owns BTD range, read-license, rights transfer, wallet capability, fee posture, settlement, access policy, and reconciliation primitives;
- `packages/api` owns JSON-safe reusable route contracts over package primitives;
- `packages/pipelines/asset-pack` owns Reading pipeline contracts and source-safe AssetPack preview objects;
- `packages/executions-mcp` owns MCP server contracts and tool exposure;
- `packages/chatgptapp` owns ChatGPT App action contracts and source-safe response rendering;
- `uapi` owns commercial product routes and user interfaces, but not protocol truth;
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- MCP tools and ChatGPT App actions must be generated or validated from package-owned interface contracts.
- API routes may orchestrate pipelines; pipeline packages remain reusable outside a single route.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, settlement posture, and denial reasons; they may not expose protected source before payment.
- Interface responses may expose proof roots and repair instructions; they must not expose secrets, service-role keys, wallet private material, provider tokens, raw protected prompts, or pre-settlement AssetPack source.
- MCP API tools must derive tool ids, descriptions, schema ids, proof-root fields, auth policy ids, denied states, examples, and source-safety posture from the package-owned `McpToolContract` registry, starting with `bitcode://pipelines/asset-pack/create`.

## V33 proof/test package API and inherited support canon

V33 treats package APIs as the source of interface truth.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture and generated proof helpers.
- `@bitcode/btd` owns rights, range, fee, wallet, access, treasury, and reconciliation primitives.
- `@bitcode/api` owns reusable JSON contracts for public API consumers.
- `@bitcode/pipeline-asset-pack` owns Reading pipeline contract surfaces and source-safe preview outputs.
- MCP and ChatGPT App packages consume those contracts rather than inventing protocol-local shapes.

The commercial protocol package owns the active/draft posture while V33 is in flight:

- `ACTIVE_CANON_VERSION = 'V32'`;
- `DRAFT_TARGET_VERSION = 'V33'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers remain exported through the package index;
- package tests and V33 checks fail closed on direct demonstration-source imports.

Any object used by more than one interface must have a package-owned type, builder, parser, validator, source-safe fixture, example, compatibility row, and replay command before the gate that depends on it closes.

## V33 canonical domain model

V33 adds interface-facing contract objects over V32 protocol truth:

- `InterfaceContractCatalog`: active interface ids, owners, actions/tools/routes, schemas, source-safety classes, examples, proof roots, and compatibility status.
- `InterfaceAuthorizationPolicy`: auth mode, issuer, organization/team/role requirements, wallet requirement, license requirement, protected-source policy, denial reason, and repair posture.
- `McpToolContract`: MCP tool id, input schema, output schema, auth policy, source-safety class, ledger/database proof bindings, denied-state rendering, proof-root field set, package-derived examples, and pre-settlement protected-source lock.
- `ChatGptAppActionContract`: ChatGPT App action id, UI response family, source-safe summary, structured result schema, repair instructions, and proof-root projection.
- `PublicApiRouteContract`: route id, method, schema, auth policy, idempotency, versionless path, rate/security posture, and example set.
- `ReadLicenseInterfaceContract`: Read request, reviewed ReadNeed, Finding Fits admission, source-safe preview, fee quote, license posture, unpaid denial, paid unlock, and proof root.
- `AssetPackRightsInterfaceContract`: AssetPack preview metadata, protected-source lock, BTD range/read-right state, BTC fee quote, settlement finality, delivery admission, and rights transfer projection.
- `APISchemaCompatibilityMatrix`: schema id, consumer surface, compatibility status, breaking-change policy, fixture path, example path, and validation command.
- `InterfaceTelemetryProofHook`: execution id, interface id, action id, request root, response root, denial or success posture, ledger/database/object-storage roots, and replay command.

Inherited V32 objects remain active: `Deposit`, `ReadRequest`, `ReadNeed`, `FindingFitsResult`, `AssetPackPreview`, `SettlementUnlock`, `BtcFeeQuote`, `BtdAssetPackMintReceipt`, `BtdReadReceipt`, `BtdRightsTransferReceipt`, `SourceToSharesProof`, `TerminalTransaction`, and Auxillaries readiness objects.

## V33 gate plan

V33 closes through ten gates:

1. **Gate 1: V33 Interface Roadmap And Spec Opening** opens the V33 family, makes `SPECIFICATIONS_ROADMAP.md` truthful after V32 promotion, and wires V33 Gate 1 checks.
2. **Gate 2: Interface Inventory And Contract Catalog** inventories active and deferred interface surfaces and creates the package-owned `InterfaceContractCatalog`.
3. **Gate 3: MCP API Tool And Registry Contracts** hardens MCP tool schemas, action discovery, policy denial, proof-root surfacing, and example replay through `McpToolContract` and `.bitcode/v33-mcp-api-tool-contracts.json`.
4. **Gate 4: ChatGPT App Action And Tool Contracts** hardens ChatGPT App action schemas, source-safe response rendering, denial readability, and examples.
5. **Gate 5: Interface Authorization Policy Fail-Closed** centralizes auth, organization, wallet, read-license, rights, and protected-source policy denials.
6. **Gate 6: Read License And AssetPack Rights Interface Contracts** proves source-safe preview, paid settlement, BTD rights, and delivery contracts across interfaces.
7. **Gate 7: API Schemas Examples And Compatibility Matrix** produces route schemas, examples, compatibility matrix rows, and contract tests.
8. **Gate 8: Interface Telemetry And Proof Replay Hooks** binds interface actions to executions, ledger, database, object storage, and generated proof replay hooks.
9. **Gate 9: Interface Consumer UX Regression Proof** proves MCP, ChatGPT App, public API, Terminal handoff, and denied-state readability through source-safe fixtures.
10. **Gate 10: V33 Promotion Readiness** generates V33 proof artifacts, promotion readiness, and active V33 / draft V34 posture.

### V33 Gate 5 Interface Authorization Policy Fail-Closed

Gate 5 makes `InterfaceAuthorizationPolicy` the shared package-owned policy object
for interface action admission. The policy covers auth issuer freshness,
organization/team/member/role posture, wallet capability, read-license posture,
AssetPack rights, locked-source disclosure, repair posture, readable denial
messages, repair actions, and proof roots. API, MCP, ChatGPT App, and Terminal
handoff tests must use shared policy fixtures instead of surface-local
authorization copies. Missing auth issuer, stale authority, missing organization
scope, missing wallet capability, unpaid read license, missing AssetPack rights,
and locked-source disclosure attempts fail closed before source-bearing output
can cross an interface boundary.

### V33 Gate 6 Read License And AssetPack Rights Interface Contracts

Gate 6 makes `ReadLicenseInterfaceContract` and
`AssetPackRightsInterfaceContract` the shared package-owned boundary objects for
paid/unpaid Reading across interfaces. `ReadLicenseInterfaceContract` binds the
Read request root, reviewed ReadNeed root, Finding Fits admission root,
source-safe preview root, fee quote root, read receipt root, interface
authorization policy root, license posture, disclosure state, delivery
admission state, protected-source visibility, denial codes, and proof root.
`AssetPackRightsInterfaceContract` binds the AssetPack preview metadata, BTD
range, token count, source-safe measurement root, fee quote root, BTC
settlement/finality posture, paid unlock root, delivery admission root, read
right state, rights-transfer receipt root, denial codes, source-safety posture,
and proof root.

The required fixtures are shared across API, MCP, ChatGPT App, and Terminal:
API and MCP admit source-safe preview only; ChatGPT App denies unpaid protected
source delivery with readable settlement/license/rights blockers; Terminal
admits delivery only after confirmed BTC finality, paid unlock, delivery
admission, and rights transfer. Pre-settlement protected source remains locked
in every fixture and in the generated artifact. Paid delivery may mark
`protectedSourceVisible: true` on the contract output only after the BTD
read/right transfer evidence is present; artifact payloads remain source-safe
metadata and never serialize protected source or credentials.

### V33 Gate 7 API Schemas Examples And Compatibility Matrix

Gate 7 makes `APISchemaCompatibilityMatrix` the shared package-owned schema
compatibility spine for public API routes, MCP API tool calls, ChatGPT App
actions, Terminal handoffs, and package consumers. Each row records a schema
id, request schema id, response schema id, consumer surface, route/tool/action
path, source-safety class, compatibility status, breaking-change policy,
source-safe example, fixture path, example path, validation command, and
deterministic row root. Required example postures are `success`, `denied`,
`blocked`, `stale`, and `deferred`; the matrix fails closed if any posture or
required consumer surface is absent.

The matrix enforces versionless interface path discipline. Public API paths may
use `/api/...`; MCP, ChatGPT App, Terminal handoff, and package consumer paths
use their interface URI families. No compatibility row may introduce `/vN/`,
gate-prefixed, or work-in-progress source identifiers. Deferred rows are
visible as `deferred_not_admitted`, not hidden, and must carry a deferred
reason. Matrix examples are source-safe metadata only and never serialize
protected AssetPack source or credentials.

### V33 Gate 8 Interface Telemetry And Proof Replay Hooks

Gate 8 makes `InterfaceTelemetryProofHook` the shared package-owned replay
contract for interface activity. Each hook records a hook id, interface id,
action id, execution id, execution family, success/denied/blocked posture,
request root, response root, ledger root, database root, object-storage root,
generated-proof root, root-set root, replay command, theorem label, witness
facts, source evidence, test evidence, and source-safety assertion. Hooks are
source-safe metadata only: they must not serialize credentials, protected
prompts, protected AssetPack source, private source text, or raw inference
payloads.

The required hook rows cover Terminal handoff, public API, MCP API, ChatGPT
App, and package consumer replay. The Terminal row proves unpaid preview
visibility is blocked until settlement and rights transfer. The public API row
proves missing read license or authority is denied. The MCP API row proves a
source-safe Reading pipeline command can replay to queue/admission roots. The
ChatGPT App row proves protected-source delivery remains blocked until reader
confirmation and paid rights exist. The package-consumer row proves downstream
consumers can replay package-owned hook metadata without importing surface
implementation internals.

The generated artifact `.bitcode/v33-interface-telemetry-proof-hooks.json`
serializes coverage over the required interface ids, postures, replay commands,
root kinds, surface test joins, and source-safety verdict. `check:v33-gate8`
fails closed when a required interface or posture is absent, generated output is
stale, hooks contain secret-shaped or protected-source-shaped content, surface
tests stop consuming the shared hooks, or the V33 spec family stops naming the
Gate 8 replay contract.

### V33 Gate 9 Interface Consumer UX Regression Proof

Gate 9 makes `InterfaceConsumerUxRegressionProof` the shared package-owned
operator-quality contract for interface consumers. Each row records the
consumer surface, action label, consumer path, readable posture, visibility
boundary, source-safe summary, proof roots, repair steps, fee/rights preview,
fixture path, replay command, denial or success summary, source-safety posture,
and deterministic row root. Rows are designed for users and integration
operators: collapsed interface views can show the action label, summary,
denial/success posture, and next repair step, while expanded metadata can show
roots and replay commands without exposing protected AssetPack source,
interpolated prompt bodies, credentials, or raw inference payloads.

The required rows cover public API denied read access, MCP API Finding Fits
admission, ChatGPT App blocked delivery, Terminal AssetPack preview handoff,
and package-consumer readback. Required capabilities are `action_label`,
`source_safe_summary`, `proof_roots`, `repair_steps`, `fee_rights_preview`, and
`denial_readability`. The proof fails closed if any required surface, posture,
or capability is absent; if a row omits proof roots, repair steps, or fee/rights
preview; if blocked/denied rows omit readable denial and denial code; or if any
row depends on brittle demonstration-only fixtures. The source-safe summary,
proof roots, repair steps, and fee/rights preview are readable without
overexposure.

The generated artifact `.bitcode/v33-interface-consumer-ux-regression-proof.json`
serializes the required consumer rows, readability coverage, source/test/docs
evidence, replay commands, and source-safety verdict. `check:v33-gate9` fails
closed when the generated artifact is stale, surface tests stop consuming the
shared proof, workflow or package scripts stop running Gate 9 checks, or the
V33 spec family stops naming `InterfaceConsumerUxRegressionProof`.

## V33 whole Bitcode operator chain

The V33 operator chain keeps V32 behavior and adds interface consistency:

1. Depositor supplies source material.
2. Bitcode records source-safe deposit measurement and proof roots.
3. Reader requests a Read through Terminal, API, MCP API, or ChatGPT App.
4. `ReadNeedComprehensionSynthesis` synthesizes a ReadNeed for review.
5. Reader approves or requests regeneration of the ReadNeed.
6. `ReadFitsFindingSynthesis` searches the depository for plural threshold-passing deposits.
7. Bitcode synthesizes a source-safe AssetPack preview and fee quote.
8. Reader reviews measurements, fit quality, policy posture, fee, and rights preview without protected source leakage.
9. Reader settles BTC fee and receives the BTD read/right transfer.
10. Bitcode unlocks full AssetPack delivery and records synchronized ledger, database, object-storage, execution, and interface proof state.

## V33 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: `Deposit`, depository asset id, measurement roots, embedding document roots, and interface-safe deposit summaries.
- Current algorithms and derivation rules: source intake, measurement, proof-root generation, policy classification, and depository indexing.
- Current invariants and fail-closed conditions: invalid deposit, missing source proof, unsupported provider, policy denial, or protected-source leakage blocks interface projection.
- Current proof obligations: deposit measurement proof, source-safety class, and interface projection test.
- Current source-bearing implementation basis: commercial package and `uapi` routes, not `protocol-demonstration`.
- Current validating commands and parity basis: V32 canonical proofs plus V33 Gate 2 interface catalog checks, including `.bitcode/v33-interface-contract-catalog.json`.
- Current accepted boundaries: V33 does not change deposit ownership law.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: `ReadRequest`, `ReadNeed`, `ReadNeedComprehensionSynthesis`, PTRR agents, ThricifiedGenerations, prompt/tool registry records, and source-safe interface summaries.
- Current algorithms and derivation rules: prompt-part composition, PTRR plan/try/refine/retry, judged reasoning, typed output, and reviewed Need acceptance.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing review, or auth denial blocks Finding Fits.
- Current proof obligations: interface request schema, Need response schema, telemetry root, and denial repair path.
- Current source-bearing implementation basis: commercial Reading packages and API routes.
- Current validating commands and parity basis: V32 Reading pipeline proof plus V33 interface contract tests.
- Current accepted boundaries: V33 does not rewrite Reading pipeline law.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: `FindingFitsResult`, plural fit deposits, search roots, ranking roots, verification decisions, and source-safe preview fit metadata.
- Current algorithms and derivation rules: recall, vector search, ranking, threshold filters, verification, and synthesis context selection.
- Current invariants and fail-closed conditions: no-worthy-fit, no-survivor asset pack, provider failure, policy denial, or protected-source leak blocks preview.
- Current proof obligations: candidate inventory, ranking root, source-safety class, and interface preview schema.
- Current source-bearing implementation basis: commercial asset-pack pipeline package.
- Current validating commands and parity basis: V32 proof coverage plus V33 Gate 6 rights preview tests.
- Current accepted boundaries: V33 does not broaden pre-settlement disclosure.

### Selection and materialization

- Current canonical objects and emitted artifacts: `AssetPackPreview`, protected AssetPack source lock, source-safe measurements, and delivery admission.
- Current algorithms and derivation rules: synthesis from fit deposits, preview projection, fee quote, paid unlock, and PR delivery after settlement.
- Current invariants and fail-closed conditions: unpaid disclosure, invalid fee quote, rights denial, object-storage drift, or delivery failure blocks source visibility.
- Current proof obligations: preview contract, delivery contract, object-storage root, and pull-request proof where applicable.
- Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `packages/api`, and `uapi`.
- Current validating commands and parity basis: V32 settlement and interface regression artifacts plus V33 Gate 6 checks.
- Current accepted boundaries: protected source is never an unpaid interface payload.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: `InterfaceAuthorizationPolicy`, organization authority, wallet capability, read-license posture, and denial repair record.
- Current algorithms and derivation rules: issuer validation, organization/team/role checks, wallet requirement checks, license checks, and protected-source policy.
- Current invariants and fail-closed conditions: authorization denial, stale session, missing wallet, missing license, service-secret exposure, or provider token exposure blocks action.
- Current proof obligations: denied-state examples, policy row, source-safety row, and audit root.
- Current source-bearing implementation basis: packages, API middleware, MCP auth, ChatGPT App action guards, and Terminal support surfaces.
- Current validating commands and parity basis: V31/V32 auth proof plus V33 Gate 5 checks.
- Current accepted boundaries: no secret material is serialized into interface responses or tracked artifacts.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe preview, disclosure policy, redacted response, paid unlock, and protected-source access record.
- Current algorithms and derivation rules: source-safe projection, redaction, preview measurement rendering, paid unlock verification, and response shaping.
- Current invariants and fail-closed conditions: public projection overexposure, unpaid protected-source request, incompatible consumer, or stale proof blocks disclosure.
- Current proof obligations: disclosure-boundary tests, preview examples, and paid/unpaid contrast fixtures.
- Current source-bearing implementation basis: BTD access primitives, API serializers, MCP tools, ChatGPT App renderers, and Terminal components.
- Current validating commands and parity basis: V32 disclosure tests plus V33 Gate 6 and Gate 9 checks.
- Current accepted boundaries: preview metadata may be public to the Reader; protected source requires settlement.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: `BtcFeeQuote`, settlement record, BTD receipts, rights transfer, source-to-shares proof, journal, and reconciliation record.
- Current algorithms and derivation rules: fee quote, wallet/PSBT posture, finality observation, BTD read/right transfer, source-to-shares allocation, and projection repair.
- Current invariants and fail-closed conditions: settlement conservation drift, invalid finality, underpayment, overpayment, projection drift, or delivery mismatch blocks unlock.
- Current proof obligations: fee/root consistency, ledger/database sync, reconciliation repair action, and interface replay hook.
- Current source-bearing implementation basis: `packages/btd`, ledger/database packages, and API surfaces.
- Current validating commands and parity basis: V32 settlement failure-state proof plus V33 Gate 8 replay hooks.
- Current accepted boundaries: production-mainnet value-bearing launch remains approval-gated outside V33.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: `InterfaceTelemetryProofHook`, execution record, ledger root, database root, object-storage root, generated proof artifact, and replay command.
- Current algorithms and derivation rules: request root, response root, event root, proof binding, replay command generation, and fail-closed stale-artifact detection.
- Current invariants and fail-closed conditions: stale promoted status truth, missing replay hook, source-unsafe proof artifact, or drift blocks promotion.
- Current proof obligations: generated artifact rows, command rows, proof roots, and compatibility rows.
- Current source-bearing implementation basis: protocol package helpers, `.bitcode/` artifacts, workflows, and V33 gate checkers.
- Current validating commands and parity basis: V32 promotion proof plus V33 Gate 8 and Gate 10 checks.
- Current accepted boundaries: generated artifacts are source-safe and do not print secrets or protected source.

## V33 proof-family canon

### Inference-synthesis

- proofArtifactPath: `.bitcode/v33-interface-inference-synthesis-proof.json`
- members: interface request synthesis, ReadNeed interface projection, AssetPack preview interface projection.
- theoremIds: interface-inference-typed-output, interface-inference-source-safe-response.
- replayStepIds: render schema, run fixture, parse result, compare proof roots.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`
- current member closure criteria: every inference-adjacent interface action names its pipeline, PTRR agent, step, sub-step, and typed result.
- current member verdict shape: pass, fail, blocked, or deferred with repair posture.
- current theorem-by-theorem closure reading: interface consumers never own inference law; they expose replayable typed projections.
- current theorem-to-replay grouping: request, response, telemetry, and proof-root replay.
- minimum artifact/replay binding set: spec-family report, canonical-input report, compatibility matrix, and interface telemetry hook.
- current proof-object fields: interfaceId, actionId, requestRoot, responseRoot, sourceSafetyClass, replayCommand.
- generated-artifact and test bindings: V33 source-safe interface artifacts through Gate 10, including `.bitcode/v33-promotion-readiness-report.json`.
- fail-closed conditions: missing schema, raw protected prompt, protected source, untyped output, or stale proof root.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v33-interface-prompt-completeness-proof.json`
- members: ReadNeed prompt projection, Finding Fits prompt projection, denial prompt summary.
- theoremIds: interface-prompts-redacted, interface-prompt-contract-complete.
- replayStepIds: prompt registry digest, context key inventory, redaction check, response fixture check.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`
- current member closure criteria: prompt templates and interpolated prompts are represented by source-safe digests and context keys where interfaces need auditability.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: interface observability does not mean prompt leakage.
- current theorem-to-replay grouping: prompt template digest, interpolated context keys, typed output.
- minimum artifact/replay binding set: prompt digest, context keys, action id, execution id.
- current proof-object fields: promptTemplateRoot, interpolatedContextKeys, responseRoot, redactionVerdict.
- generated-artifact and test bindings: V33 Gate 8 interface telemetry proof.
- fail-closed conditions: missing prompt digest, unredacted protected prompt, or untyped response.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v33-interface-static-code-analysis-proof.json`
- members: versionless routes, package-owned schemas, no demonstration imports, no secret literals.
- theoremIds: interface-routes-unversioned, interface-contracts-package-owned.
- replayStepIds: route scan, import scan, secret scan, schema export scan.
- witnessArtifactPaths: `.bitcode/v33-canonical-input-report.json`
- current member closure criteria: source keeps interface contracts package-owned and versionless.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: static checks enforce architecture before runtime tests.
- current theorem-to-replay grouping: route path, import path, schema path, test path.
- minimum artifact/replay binding set: source path, checker command, expected pattern, failure message.
- current proof-object fields: path, checkId, verdict, repairHint.
- generated-artifact and test bindings: V33 Gate 1 checker and later contract checkers.
- fail-closed conditions: versioned route, demonstration import, tracked secret, or local-only schema.

### Verification-decisions

- proofArtifactPath: `.bitcode/v33-interface-verification-decisions-proof.json`
- members: policy denial, source-safe preview, paid unlock, compatibility verdict.
- theoremIds: interface-denial-readable, interface-unlock-verified.
- replayStepIds: denied fixture, allowed fixture, paid fixture, stale fixture.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`
- current member closure criteria: every decision has machine-readable result plus operator-readable repair posture.
- current member verdict shape: allowed, denied, blocked, deferred, or repaired.
- current theorem-by-theorem closure reading: denial is a first-class interface result, not an exception-shaped accident.
- current theorem-to-replay grouping: auth, policy, license, rights, settlement, and source-safety.
- minimum artifact/replay binding set: decision id, cause, repair, proof root.
- current proof-object fields: decisionId, reason, repairAction, sourceSafetyClass.
- generated-artifact and test bindings: V33 Gate 5 and Gate 6.
- fail-closed conditions: ambiguous denial, missing repair, or source-unsafe allowed result.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v33-interface-selection-materialization-proof.json`
- members: selected fits, AssetPack preview, protected source lock, delivery admission.
- theoremIds: interface-preview-source-safe, interface-delivery-paid-only.
- replayStepIds: preview fixture, settlement fixture, delivery fixture.
- witnessArtifactPaths: `.bitcode/v33-canonical-input-report.json`
- current member closure criteria: interfaces expose preview metadata before payment and source delivery only after settlement.
- current member verdict shape: pass, fail, blocked, or deferred.
- current theorem-by-theorem closure reading: interface convenience never crosses the protected-source boundary.
- current theorem-to-replay grouping: fits, preview, fee, settlement, delivery.
- minimum artifact/replay binding set: AssetPack id, preview root, fee quote root, settlement root, delivery root.
- current proof-object fields: assetPackId, previewRoot, sourceLock, settlementState.
- generated-artifact and test bindings: V33 Gate 6.
- fail-closed conditions: unpaid source, missing fee quote, stale settlement, or delivery mismatch.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v33-interface-authorization-sensitive-flow-proof.json`
- members: API auth, MCP auth, ChatGPT App auth, organization authority, wallet capability, read-license policy.
- theoremIds: interface-auth-fail-closed, interface-secrets-not-serialized.
- replayStepIds: unauthenticated fixture, unauthorized fixture, authorized fixture, secret scan.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`
- current member closure criteria: every interface action has an `InterfaceAuthorizationPolicy`.
- current member verdict shape: allowed, denied, blocked, or deferred.
- current theorem-by-theorem closure reading: sensitive flow is governed by policy, not per-interface custom logic.
- current theorem-to-replay grouping: issuer, organization, wallet, license, rights, disclosure.
- minimum artifact/replay binding set: policy id, input root, denial reason, repair posture.
- current proof-object fields: authMode, policyId, denialReason, repairAction, sourceSafetyClass.
- generated-artifact and test bindings: V33 Gate 5.
- fail-closed conditions: missing auth policy, missing wallet, missing license, protected-source request, or secret exposure.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v33-interface-settlement-source-to-shares-proof.json`
- members: fee quote, BTD right transfer, source-to-shares projection, interface payment state.
- theoremIds: interface-settlement-root-stable, interface-rights-transfer-visible-after-finality.
- replayStepIds: quote fixture, payment fixture, finality fixture, drift fixture.
- witnessArtifactPaths: `.bitcode/v33-canonical-input-report.json`
- current member closure criteria: interface state matches ledger truth and repair posture.
- current member verdict shape: quoted, pending, final, drifted, repaired, or blocked.
- current theorem-by-theorem closure reading: interface payment status is a projection of ledger truth.
- current theorem-to-replay grouping: fee quote, PSBT, broadcast, finality, rights, delivery.
- minimum artifact/replay binding set: quote root, transaction root, finality root, rights root.
- current proof-object fields: quoteRoot, finalityState, rightsState, reconciliationState.
- generated-artifact and test bindings: V33 Gate 6 and Gate 8.
- fail-closed conditions: settlement conservation drift, projection drift, unpaid unlock, or unsupported network posture.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v33-interface-disclosure-boundary-proof.json`
- members: source-safe preview, unpaid denial, paid unlock, redacted examples.
- theoremIds: interface-preview-not-source, interface-paid-unlock-source.
- replayStepIds: preview render, unpaid source request, paid delivery request, redaction scan.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`
- current member closure criteria: protected source cannot appear before settlement.
- current member verdict shape: source-safe, denied, unlocked, or violation.
- current theorem-by-theorem closure reading: all interface consumers share one disclosure boundary.
- current theorem-to-replay grouping: preview, fee, settlement, access, delivery.
- minimum artifact/replay binding set: disclosure policy id, source-safety class, access state.
- current proof-object fields: disclosureState, sourceSafetyClass, accessPolicyId, deliveryAdmission.
- generated-artifact and test bindings: V33 Gate 6 and Gate 9.
- fail-closed conditions: public projection overexposure, unpaid source, stale rights, or missing redaction.

### Proof-contract

- proofArtifactPath: `.bitcode/v33-interface-proof-contract-proof.json`
- members: spec-family report, canonical-input report, interface catalog, compatibility matrix, telemetry proof hooks.
- theoremIds: interface-proof-replayable, interface-promotion-source-safe.
- replayStepIds: generate, check, replay, compare, promote.
- witnessArtifactPaths: `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`
- current member closure criteria: every active interface row has a replayable proof contract by V33 promotion.
- current member verdict shape: pass, fail, blocked, deferred, or promoted.
- current theorem-by-theorem closure reading: promotion depends on generated source-safe proof, not prose.
- current theorem-to-replay grouping: schema, example, test, telemetry, ledger, database, object storage.
- minimum artifact/replay binding set: generated artifact, proof-source commit, replay command, failure taxonomy.
- current proof-object fields: artifactPath, proofSourceCommit, replayCommand, verdict.
- generated-artifact and test bindings: V33 Gate 10.
- fail-closed conditions: missing generated artifact, stale proof-source commit, source-unsafe payload, or incomplete compatibility matrix.

## V33 generated canon

V33 generated canon includes specifying artifacts, interface gate artifacts, and the Gate 10 promotion readiness report.
Generated artifacts must be stable, source-safe, and explicitly tied to validation commands.

## V33 promotion readiness canon

V33 Gate 10 closes when `version/v33` can promote to active V33 without direct `main` writes. The readiness report `.bitcode/v33-promotion-readiness-report.json` proves that all V33 interface artifacts are present, source-safe, parseable, and wired into gate checks, promotion checks, generated proof appendix support, and workflow validation. Promotion rewrites runtime posture from `V32` active / `V33` draft to `V33` active / `V34` draft and generates `BITCODE_SPEC_V33_PROVEN.md`; the resulting posture is V33 active / V34 draft.

Interface authorization promotion readiness also requires credential identifiers to stay outside BTD proof-root hashing. Interface adapters may retain API key record ids in adapter-local audit context, but BTD roots bind the authenticated principal, organization authority, wallet/license/rights state, protected-source visibility, and repair posture.

## V33 validation canon

Validation must include spec-family checks, canonical-input checks, canon-posture drift checks, V33 gate checks, package tests, interface contract tests, and source-safe example tests.
Every gate must name the command that proves closure.

## V33 promotion canon

V33 promotion may occur only after all V33 gates are closed and `version/v33` is requested into `main`.
Promotion rewrites `BITCODE_SPEC.txt` from `V32` to `V33`, generates `BITCODE_SPEC_V33_PROVEN.md`, records source-safe `.bitcode/v33-*` evidence, and prepares active V33 / draft V34 posture.

## V33 appendices and canonical supporting material

The appendices below are binding checklists for V33 draft work and later promotion.

## V33 accepted boundaries and reopen conditions

Accepted boundaries:

- V33 owns interface-depth, not deployment-depth or telemetry-program breadth.
- V33 may add interface-owned telemetry/proof hooks, but V35 owns broad documentation and observability programs.
- V33 keeps Exchange and website Conversations product depth deferred.
- V33 keeps production-mainnet value-bearing launch blocked unless a future canon explicitly admits it.

Reopen conditions:

- an interface exposes protected source before settlement;
- an interface action lacks package-owned schema or auth policy;
- an MCP or ChatGPT App consumer diverges from package-owned Protocol/BTD truth;
- a generated interface proof artifact contains secrets, protected source, or stale proof roots.

## V33 completion condition

V33 is complete when all ten gates are closed, source-safe interface contracts are package-owned and tested, MCP API and ChatGPT App behavior is compatible with the public API and Terminal read model, denied states are readable and fail closed, proof hooks replay to ledger/database/object-storage truth, generated artifacts are stable, and promotion can safely make V33 the active canon.

## Appendix A. Canonical type and surface catalog

Primary V33 types: `InterfaceContractCatalog`, `InterfaceAuthorizationPolicy`, `McpToolContract`, `ChatGptAppActionContract`, `PublicApiRouteContract`, `ReadLicenseInterfaceContract`, `AssetPackRightsInterfaceContract`, `APISchemaCompatibilityMatrix`, and `InterfaceTelemetryProofHook`.
Primary surfaces: MCP API, ChatGPT App, public API, Terminal handoff, package consumers, ledger projection, database projection, object-storage projection, and proof replay.

Gate 2 `InterfaceContractCatalog` rows are package-owned source-safe metadata.
The required row ids are `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, `package_consumer`, `exchange_hook`, and `conversations_hook`.
Each row names an owner package, action/tool/route id, schema id, auth policy id, source-safety class, example fixture path, validation command, compatibility status, failure mode, repair posture, telemetry proof hook id, and deterministic proof root.
The `exchange_hook` and `conversations_hook` rows are visible as `deferred_not_admitted` rather than hidden.

Gate 3 `McpToolContract` rows are package-owned source-safe MCP API metadata.
The required first tool id is `bitcode://pipelines/asset-pack/create`.
The contract binds `bitcode.mcp.assetPackCreate.input.v1`, `bitcode.mcp.assetPackCreate.output.v1`, `interface.authorization.pipeline-permission`, `pipelines.create`, `protected-source-locked`, `source-safe-preview-and-metadata-before-settlement`, proof-root fields, request/response roots, and denied states including `SCHEMA_VALIDATION_FAILED` and `PROVIDER_BINDING_REQUIRED`.
MCP discovery must consume this contract instead of repeating tool ids or descriptions locally.

Gate 7 `APISchemaCompatibilityMatrix` rows are package-owned source-safe
schema compatibility metadata. The required consumer surfaces are `public_api`,
`mcp_api`, `chatgpt_app`, `terminal_handoff`, and `package_consumer`. The
required example postures are `success`, `denied`, `blocked`, `stale`, and
`deferred`. Each row binds schema ids, request/response schema ids, a
versionless path or interface URI, compatibility status, breaking-change
policy, example path, fixture path, validation command, protected-source
visibility, and deterministic row root. Deferred rows remain visible as
`deferred_not_admitted`; active rows must never carry versioned `/vN/`,
gate-prefixed, or work-in-progress paths.

## Appendix B. Proof family closure catalog

The V33 proof-family catalog is the nine-family catalog in `V33 proof-family canon`.

## Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v33-interface-inference-synthesis-proof.json` | interface request synthesis | interface-inference-typed-output | render-schema, run-fixture | `.bitcode/v33-spec-family-report.json` | V33 draft interface contracts |
| Prompt-completeness | `.bitcode/v33-interface-prompt-completeness-proof.json` | prompt projection | interface-prompts-redacted | digest, redact, compare | `.bitcode/v33-spec-family-report.json` | V32 Reading proof |
| Static-code-analysis | `.bitcode/v33-interface-static-code-analysis-proof.json` | routes, imports, schemas | interface-routes-unversioned | route-scan, import-scan | `.bitcode/v33-canonical-input-report.json` | source tree |
| Verification-decisions | `.bitcode/v33-interface-verification-decisions-proof.json` | policy decisions | interface-denial-readable | denied-fixture, allowed-fixture | `.bitcode/v33-spec-family-report.json` | V33 policy contract |
| Selection-and-materialization | `.bitcode/v33-interface-selection-materialization-proof.json` | preview, delivery | interface-preview-source-safe | preview, settlement, delivery | `.bitcode/v33-canonical-input-report.json` | V32 AssetPack proof |
| Authorization-and-sensitive-flow | `.bitcode/v33-interface-authorization-sensitive-flow-proof.json` | auth and license | interface-auth-fail-closed | unauth, denied, allowed | `.bitcode/v33-spec-family-report.json` | V33 auth policy |
| Settlement-source-to-shares | `.bitcode/v33-interface-settlement-source-to-shares-proof.json` | fee and rights | interface-settlement-root-stable | quote, finality, rights | `.bitcode/v33-canonical-input-report.json` | V32 BTD proof |
| Disclosure-boundary | `.bitcode/v33-interface-disclosure-boundary-proof.json` | preview and unlock | interface-preview-not-source | preview, unpaid, paid | `.bitcode/v33-spec-family-report.json` | V33 rights contracts |
| Proof-contract | `.bitcode/v33-interface-proof-contract-proof.json` | generated artifacts | interface-proof-replayable | generate, check, replay | `.bitcode/v33-spec-family-report.json` | V33 gates |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

V33 inherits the V19 reproducible-canon expectation that generated artifacts are deterministic, replayable, and fail closed on stale status truth.

### Inherited V20 operator-quality artifacts

V33 inherits the V20 operator-quality expectation that interface-facing proof is inspectable and useful to operators, not only machine-readable.

### Exact generated-artifact inventory matrix

| Artifact | Producer | Checker | Source-safety class | Status |
| --- | --- | --- | --- | --- |
| `.bitcode/v33-spec-family-report.json` | spec-family report builder | `check-bitcode-spec-family` | source-safe-generated-proof | draft-required |
| `.bitcode/v33-canonical-input-report.json` | canonical-input report builder | `check-bitcode-canonical-inputs` | source-safe-generated-proof | draft-required |
| `.bitcode/v33-interface-contract-catalog.json` | `scripts/generate-v33-interface-contract-catalog.mjs` | `check:v33-interface-contract-catalog` and `check:v33-gate2` | source-safe-interface-contract-catalog-metadata | Gate 2 required |
| `.bitcode/v33-mcp-api-tool-contracts.json` | `scripts/generate-v33-mcp-api-tool-contracts.mjs` | `check:v33-mcp-api-tool-contracts` and `check:v33-gate3` | source-safe-mcp-api-tool-contract-metadata | Gate 3 required |
| `.bitcode/v33-chatgpt-app-action-contracts.json` | `scripts/generate-v33-chatgpt-app-action-contracts.mjs` | `check:v33-chatgpt-app-action-contracts` and `check:v33-gate4` | source-safe-chatgpt-app-action-contract-metadata | Gate 4 required |
| `.bitcode/v33-interface-authorization-policy.json` | `scripts/generate-v33-interface-authorization-policy.mjs` | `check:v33-interface-authorization-policy` and `check:v33-gate5` | source-safe-interface-authorization-policy-metadata | Gate 5 required |
| `.bitcode/v33-read-license-assetpack-rights-contracts.json` | `scripts/generate-v33-read-license-assetpack-rights-contracts.mjs` | `check:v33-read-license-assetpack-rights-contracts` and `check:v33-gate6` | source-safe-read-license-assetpack-rights-metadata | Gate 6 required |
| `.bitcode/v33-api-schema-compatibility-matrix.json` | `scripts/generate-v33-api-schema-compatibility-matrix.mjs` | `check:v33-api-schema-compatibility-matrix` and `check:v33-gate7` | source-safe-api-schema-compatibility-metadata | Gate 7 required |
| `.bitcode/v33-interface-telemetry-proof-hooks.json` | `scripts/generate-v33-interface-telemetry-proof-hooks.mjs` | `check:v33-interface-telemetry-proof-hooks` and `check:v33-gate8` | source-safe-interface-telemetry-proof-hook-metadata | Gate 8 required |
| `.bitcode/v33-interface-consumer-ux-regression-proof.json` | `scripts/generate-v33-interface-consumer-ux-regression-proof.mjs` | `check:v33-interface-consumer-ux-regression-proof` and `check:v33-gate9` | source-safe-interface-consumer-ux-regression-metadata | Gate 9 required |

### V33 specifying generated artifacts

V33 starts with `.bitcode/v33-spec-family-report.json` and `.bitcode/v33-canonical-input-report.json`.
Gate 2 adds `.bitcode/v33-interface-contract-catalog.json`, which serializes source-safe `InterfaceContractCatalog` metadata for `terminal_handoff`, `public_api`, `mcp_api`, `chatgpt_app`, `package_consumer`, `exchange_hook`, and `conversations_hook` with deferred hooks marked `deferred_not_admitted`.
Gate 3 adds `.bitcode/v33-mcp-api-tool-contracts.json`, which serializes source-safe `McpToolContract` metadata for `bitcode://pipelines/asset-pack/create`, including schema ids, denied states, proof-root fields, examples, package-derived discovery posture, and protected-source invisibility.
Gate 4 adds `.bitcode/v33-chatgpt-app-action-contracts.json`, which serializes source-safe `ChatGptAppActionContract` metadata for `bitcode_request_read`, `bitcode_review_read_need`, `bitcode_request_finding_fits`, `bitcode_review_asset_pack_preview`, `bitcode_quote_asset_pack_fee`, `bitcode_settle_asset_pack`, and `bitcode_deliver_asset_pack`, including package-owned schemas, source-safe response renderers, proof-root projection, readable denial states such as `READ_LICENSE_REQUIRED`, and repair actions.
Gate 5 adds `.bitcode/v33-interface-authorization-policy.json`, which serializes source-safe `InterfaceAuthorizationPolicy` metadata for API, MCP, ChatGPT App, and Terminal handoff fixtures, including auth issuer freshness, organization/team/role posture, wallet capability, read-license posture, AssetPack rights, locked-source disclosure, repair posture, readable denial, and missing/stale authority fail-closed coverage.
Gate 6 adds `.bitcode/v33-read-license-assetpack-rights-contracts.json`, which serializes source-safe `ReadLicenseInterfaceContract` and `AssetPackRightsInterfaceContract` metadata for API, MCP, ChatGPT App, and Terminal fixtures, including Read request roots, reviewed Need roots, Finding Fits admission, source-safe preview, fee quote, BTD range, read-right state, BTC settlement finality, delivery admission, rights transfer projection, paid/unpaid denial, and protected-source non-serialization.
Gate 7 adds `.bitcode/v33-api-schema-compatibility-matrix.json`, which serializes source-safe `APISchemaCompatibilityMatrix` metadata for public API, MCP API, ChatGPT App, Terminal handoff, and package consumer rows, including schema ids, request/response schema ids, success/denied/blocked/stale/deferred examples, compatibility status, breaking-change policy, fixture paths, validation commands, and versionless path discipline.
Gate 8 adds `.bitcode/v33-interface-telemetry-proof-hooks.json`, which serializes source-safe `InterfaceTelemetryProofHook` metadata for Terminal handoff, public API, MCP API, ChatGPT App, and package consumer replay hooks, including interface ids, action ids, execution ids, success/denied/blocked posture, request/response roots, ledger/database/object-storage/generated-proof/root-set roots, replay commands, theorem labels, witness facts, source evidence, test evidence, and source-safety verdicts.
Gate 9 adds `.bitcode/v33-interface-consumer-ux-regression-proof.json`, which serializes source-safe `InterfaceConsumerUxRegressionProof` metadata for public API denied states, MCP API Finding Fits readability, ChatGPT App blocked delivery, Terminal preview handoff, and package-consumer readback, including action labels, source-safe summaries, proof roots, repair steps, fee/rights previews, replay commands, and demonstration-independent fixture proof.
Later gates may add promotion readiness artifacts.

### Shared generated-artifact fields

Shared fields include artifact id, schema id, proof-source commit, generatedAt classification, source-safety class, input paths, validation command, and aggregate proof verdict.

### Artifact-specific generated payload fields

Artifact-specific fields include exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, and compatibility matrix rows.

### Artifact confidentiality and disclosability taxonomy

The taxonomy includes source-safe-public, source-safe-internal, secret-presence-only, protected-source-locked, source-safe-generated-proof, and deferred-blocker.

### Minimum generated appendix rendered contents

`BITCODE_SPEC_V33_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when generated proof is missing, stale, incomplete, or source-unsafe.

### Canonical regeneration and fail-closed posture

V33 promotion must fail closed when generated artifacts are missing, stale, source-unsafe, incompatible with the current proof-source commit, or inconsistent with `BITCODE_SPEC.txt`.

## Appendix D. Validation and checking gate catalog

V33 validation includes `check-bitcode-spec-family`, `check-bitcode-canonical-inputs`, `check-bitcode-canon-posture-drift`, `check:v33-gate1`, `check:v33-gate2`, `check:v33-gate3`, `check:v33-gate4`, `check:v33-gate5`, `check:v33-gate6`, `check:v33-gate7`, `check:v33-gate8`, later gate-specific checkers, package tests, interface contract tests, and promotion workflow checks.

## Appendix E. Current canonical source map

Current source maps:

- Protocol posture: `packages/protocol/src/canon-posture.js`
- Demonstration posture: `protocol-demonstration/src/canon-posture.js`
- BTD primitives: `packages/btd`
- Reading pipeline package: `packages/pipelines/asset-pack`
- API contracts: `packages/api`
- MCP server: `packages/executions-mcp/src/mcp-server`
- ChatGPT App package: `packages/chatgptapp`
- Product UI: `uapi`
- Demonstration boundary: `protocol-demonstration`

## Appendix F. Subsystem totality and derivability matrix

V33 keeps these subsystem coverage phrases active: repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The V33 family is `BITCODE_SPEC_V33.md`, `BITCODE_SPEC_V33_DELTA.md`, `BITCODE_SPEC_V33_NOTES.md`, `BITCODE_SPEC_V33_PARITY_MATRIX.md`, `.bitcode/v33-spec-family-report.json`, `.bitcode/v33-canonical-input-report.json`, and eventual `BITCODE_SPEC_V33_PROVEN.md`.

## Appendix H. Operator surface and quality contract catalog

Operator quality in V33 means interface consumers can see clear action names, denied-state reasons, repair steps, proof roots, schema examples, compatibility statements, and source-safe previews without needing Terminal internals.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Required cross-product scenarios remain represented: auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, Valuable.

## Appendix J. Fail-closed contract and error posture matrix

V33 interfaces fail closed for invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, stale promoted status truth, missing schema, missing auth policy, unpaid protected-source request, and stale proof roots.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing artifacts remain controlled by `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and eventual `BITCODE_SPEC_V33_PROVEN.md`.
V33 interface previews must expose source-safe measurements and rights posture while protected source remains locked until settlement.
