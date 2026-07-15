# Bitcode Spec V32

## Status

- Version: `V32`
- V32 state: canonical promotion complete; V32 is the active provation/testing canon and the V32 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V32`
- Canonical proof-source commit: `1ec49a9ed5fa5db1da5fbd2388e528b91b98321f`
- Prior canonical anchor: `BITCODE_SPEC_V31.md`
- Prior generated proof appendix: `BITCODE_SPEC_V31_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v32-spec-family-report.json`, `.bitcode/v32-canonical-input-report.json`, `.bitcode/v32-canon-posture-drift-report.json`, `.bitcode/v32-proof-coverage-matrix.json`, `.bitcode/v32-artifact-volatility-inventory.json`, `.bitcode/v32-deterministic-replay-report.json`, `.bitcode/v32-reading-pipeline-proof-coverage.json`, `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, `.bitcode/v32-interface-contract-regression-suite.json`, `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`, `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, `.bitcode/v32-promotion-proof-generation-hardening.json`, `.bitcode/v32-promotion-readiness-report.json`, V32 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V32_PROVEN.md` as the generated proof appendix for V32 promotion
- Source parity state: V32 source-side proof/test replay, generated artifacts, Reading pipeline proof coverage, ledger/BTD failure-state proof, interface regression, browser/accessibility/responsive/visual proof, readiness rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V32 file family
- State: draft target opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V31`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V32'`
- Primary scope: provation and testing deepening over the promoted V31 commercial baseline
- Prior active canon: `BITCODE_SPEC_V31.md`
- Notes companion: `BITCODE_SPEC_V32_NOTES.md`
- Delta companion: `BITCODE_SPEC_V32_DELTA.md`
- Parity companion: `BITCODE_SPEC_V32_PARITY_MATRIX.md`
- Generated proof appendix: none until V32 promotion
- Scope: V32 canonical system specification for provation/testing over promoted Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger/database/object-storage, and protocol-demonstration rails
- Last fully realized canonical target preserved in source: `V32`

V32 begins from promoted V31.
V31 hardened Auxillaries support/control over promoted Protocol, BTD, Terminal, Reading, and interface rails.
V32 deepens the proof and testing substrate across those surfaces so Bitcode can promote commercial behavior by evidence rather than by hand-audited confidence alone.

## Version executive summary

V32 is a provation-and-testing-deepening version.
It does not create a new protocol supply law, a new `$BTD` denomination, or a versioned implementation route family.
It turns V31's promoted commercial substrate into a stronger proof-bearing system:

- proof-family replay spans Terminal, Reading, Protocol/BTD, Auxillaries, MCP API, ChatGPT App, protocol-demonstration, ledger, database, object-storage, and promotion artifacts;
- deterministic generated artifacts become easier to regenerate, diff, inspect, and fail closed on stale or missing proof;
- scenario matrices cover success, no-worthy-fit, blocked-readiness, policy denial, settlement repair, disclosure denial, provider failure, ledger/database drift, and delivery failure states;
- browser, accessibility, responsive, and visual proof becomes repeatable enough to catch operator-facing regressions before promotion;
- testnet/mainnet-readiness rehearsal proves value-bearing boundaries without silently approving production-mainnet launch;
- CI/CD and local proof scripts become greenable, source-safe, and promotion-grade rather than ceremonial.

V32 closes only when proof and test coverage can explain the system's promoted behavior across commercial surfaces, generated artifacts, and failure modes, and when every V32 gate is specified, implemented, tested, documented, and promotion-ready.

## Canonical Bitcode executive summary

Bitcode is a protocol and commercial implementation for measuring technical knowledge, exchanging source-bearing AssetPacks, and settling rights through proof-backed Reading.
The active V31 canon remains:

- a Deposit supplies source material to the Bitcode depository;
- a Read Request is synthesized into a reviewed Need before any Finding Fits run;
- `ReadNeedComprehensionSynthesis` uses PTRR agents and ThricifiedGenerations to synthesize a precise Need;
- `ReadFitsFindingSynthesis` searches the depository for all threshold-passing fit deposits, uses those fits as synthesis context, and produces a source-safe AssetPack preview;
- protected AssetPack source remains hidden before settlement;
- BTC is the fee asset;
- BTD range/read-license/right transfer and delivery are ledgerized;
- paid settlement unlocks the full AssetPack as a pull request against the Reader's repository.

V32 does not redefine those laws.
V32 makes the proof/test rails around those protocol laws more precise, reproducible, auditable, and production-hardened.

## V32 source-of-truth hierarchy

The V32 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V31` until V32 promotion.
2. `BITCODE_SPEC_V32.md` during V32 drafting.
3. `BITCODE_SPEC_V32_NOTES.md`.
4. `BITCODE_SPEC_V32_DELTA.md`.
5. `BITCODE_SPEC_V32_PARITY_MATRIX.md`.
6. generated V32 artifacts under `.bitcode/` when produced.
7. `BITCODE_SPEC_V32_PROVEN.md` only after promotion.
8. source implementation, tests, internal docs, public docs, and QA evidence that realize this file family.

Older specifications are provenance only.
They must not be used as hidden current-system law.

## V32 full-system, re-implementation, and audit rule

V32 must be re-implementable and auditable from its specification family without reading conversation history.
Every proof family, test matrix, replay harness, scenario fixture, interface contract, failure-state proof, browser proof, readiness rehearsal, generated artifact, and promotion gate must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V32 totality and precision enforcement rule

V32 fails closed when a promoted behavior lacks enough proof/test evidence to reproduce, inspect, or explain it across the commercial system.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V32 system goals, non-goals, and design principles

Goals:

- inventory promoted proof families and assign required replay coverage across Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger, database, object storage, and protocol-demonstration;
- make generated proof artifacts deterministic, source-safe, regenerated by maintained scripts, and checked by CI;
- deepen Reading pipeline proof coverage for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, including PTRR agents, ThricifiedGenerations, prompt/tool registries, mock types, real-inference seams, telemetry, ledger, and delivery boundaries;
- deepen ledger, BTD, BTC fee, disclosure, rights transfer, reconciliation, and delivery failure-state tests;
- expand browser, accessibility, responsive, and visual regression proof for Terminal and Auxillaries operator surfaces;
- rehearse testnet/mainnet-readiness without admitting value-bearing launch;
- make promotion-proof generation and workflow validation easier to trust and debug.

Non-goals:

- no Exchange market-depth implementation except tests proving deferred boundaries;
- no website Conversations product-depth implementation except tests proving deferred boundaries;
- no new `$BTD` supply law;
- no value-bearing mainnet approval;
- no new provider completion outside proof/test coverage needed for existing V31 provider-readiness and recovery boundaries;
- no Terminal transaction law redesign;
- no direct runtime dependency on `protocol-demonstration/`.

Design principles:

- executable proof before prose confidence;
- typed readiness and policy objects before prose summaries;
- no protected source, provider token, wallet secret, or private prompt leakage;
- typed events over raw JSON as the operator and API contract;
- ledger truth, database projection, provider readback, and UI summaries remain synchronized but distinct;
- failures must name the blocking primitive and the repair path.

## V32 system architecture and layer boundaries

V32 preserves the V31 architecture:

- `packages/*` own protocol, BTD, pipeline, agent, prompt, tool, storage, and interface primitives;
- `packages/api` and `packages/orm` own reusable Auxillaries route contracts, profile/account hydration, organization records, and connection projections;
- `packages/pipelines/asset-pack` owns Reading pipelines and AssetPack synthesis logic;
- `packages/pipeline-hosts` owns Vercel Sandbox and host-lane execution harnesses;
- `packages/btd` owns BTD range, measuremint, BTC fee, wallet, access, ledger, reconciliation, and terminal-journal primitives;
- `uapi` owns commercial API routes, Terminal, Auxillaries, Exchange placeholders, Conversations, and operator UI surfaces;
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- API routes may orchestrate pipelines; pipeline packages must remain reusable outside a single route.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, and settlement posture; they may not expose protected source before payment.
- Auxillaries may expose provider status, account readiness, wallet capability, role/policy decisions, and recovery steps; it may not own Terminal transaction state, Exchange market state, or protected AssetPack source.

## V32 proof/test package API and inherited support canon

V32 treats `packages/protocol`, `packages/btd`, `packages/pipelines`, `packages/api`, `packages/orm`, `packages/vcs`, provider packages, `uapi`, MCP, ChatGPT App, and `protocol-demonstration` as proof/test substrates.
Promoted V31 Auxillaries package APIs remain inherited commercial surfaces that V32 must prove without turning proof work into new product-depth implementation.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, spec-family checks, generated-proof helpers, and promotion-governance helper APIs;
- `@bitcode/orm` owns profile/account hydration, wallet binding fields, user connections, organizations, organization members, BTD treasury rows, usage rows, and registry projections;
- `@bitcode/api` owns JSON-safe Auxillaries route contracts over package primitives, never hidden provider or policy logic;
- `@bitcode/btd` owns BTD range/read-license/right-transfer state, wallet capability, access policy, treasury posture, and reconciliation primitives consumed by Auxillaries panes;
- provider packages own connection capability descriptors and token-readiness evidence for their provider family;
- `apps/uapi/app/auxillaries` owns the product UI and user workflow, not the primitive policy derivation.

The commercial protocol package owns the active/draft posture while V32 is in flight:

- `ACTIVE_CANON_VERSION = 'V31'`;
- `DRAFT_TARGET_VERSION = 'V32'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers are exported through the package index;
- package tests and V32 checks fail closed on direct demonstration-source imports.

V32 must reduce ambiguous proof behavior.
Any object used as proof input across more than one route/interface must have a package-owned type, builder, parser, validator, source-safe fixture, and replay command before the gate that depends on it closes.

## V32 canonical domain model

The V32 domain model extends V31 operationally:

- `Deposit`: source supply with repository, branch, commit, depositor boundary, depository asset id, measurement, embedding document, and proof roots.
- `ReadRequest`: Reader-authored request with repository target, constraints, non-goals, desired artifact kinds, and context.
- `ReadNeed`: reviewed synthesis of the request, including requirements, exclusions, proof expectations, pricing vector, feedback lineage, and acceptance root.
- `FindingFitsResult`: all threshold-passing fit deposits, search roots, ranking roots, blockers, no-worthy-fit posture, and selected synthesis context.
- `AssetPackPreview`: source-safe measurements, quality score, disclosure policy, access policy, fee quote, range projection, and protected-source lock.
- `SettlementUnlock`: BTC fee proof, BTD range/read-license/right transfer, paid disclosure decision, delivery admission, and reconciliation state.
- `BtcFeeQuote`: deterministic BTC fee quote with quote root, measurement root, purpose, network, sats, pricing version, expiration, and lifecycle state.
- `WalletSignerSessionRecovery`: signer-session posture proving whether the Reader wallet can sign a PSBT without server custody.
- `BtcFeeNetworkPolicy`: proof-rooted environment and network admission posture over local, staging-testnet, and production-mainnet value-bearing BTC settlement.
- `BtcFeeTaprootPsbtPosture`: proof-rooted Taproot commitment, script path, PSBT handoff, broadcast observation, replacement, reorg, and finality posture.
- `BtcFeeOperationPosture`: operational state over quote, signer, network policy, Taproot/script posture, PSBT, broadcast, finality, replacement, reorg, failure, and blocked readiness.
- `BtdAssetPackMintReceipt`: typed receipt binding AssetPack id, BTD range, depositor ownership, source-safe preview root, mint measurement root, settlement conservation root, and ledger projection root.
- `BtdReadReceipt`: typed receipt binding Reader, read request, accepted Need, Finding Fits result root, source-safe preview root, paid/unpaid disclosure state, read-right state, and delivery admission.
- `BtdRightsTransferReceipt`: typed receipt binding BTC fee finality, BTD owner or license transition, range projection, paid unlock, delivery proof, and reconciliation status.
- `SourceToSharesProof`: deterministic contribution and settlement accounting proof over fit deposits, measurements, range slices, fee quote, conservation checks, zero-cell/refit tail state, and no-overpayment/no-underpayment invariants.
- `BridgeReadinessResearchPosture`: non-chain-of-record research record for Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future bridge paths, carrying feasibility, risk, current non-admission, and rereview triggers.
- `TerminalTransaction`: URL-addressable activity combining execution, pipeline, agent, tool, prompt, ledger, database, delivery, and proof state.
- `TerminalTransactionReadModel`: typed operator projection of a selected `TerminalTransaction`, including route state, active detail section, low-detail summary, section availability, expandable audit posture, and source-safe raw-payload boundary.
- `AuxillariesProfileState`: hydrated user profile, account identity, wallet binding, notification posture, model/template preferences, and source-safe profile completeness root.
- `AuxillariesConnectionReadiness`: provider connection capability, installation/account state, credential posture without secrets, required repair action, and provider-readiness root.
- `AuxillariesInterfaceAdmission`: admitted interface id, interface surface, auth mode, policy constraints, allowed actions, source-safe capability projection, and interface-admission root.
- `AuxillariesWalletBtdPaneState`: wallet capability, signer posture, BTD read-right summary, treasury summary, settlement readiness, no-custody posture, and BTD support root.
- `OrganizationPolicyAuthority`: organization, team, member role, explicit permission grants, wallet binding requirement, policy decision, denial reason, and authority root.
- `AuxillariesReadinessDiagnostic`: source-safe pane-scoped diagnostic, blocker id, severity, required action, repair route, retry policy, and proof root.
- `AuxillariesRecoveryRun`: user-initiated recovery attempt with target pane, repair action, before/after readiness roots, execution id, and outcome.
- `AuxillariesTelemetryProofHook`: source-safe telemetry/proof record over profile, connection, interface, wallet, organization, policy, readiness, and recovery subjects.

## V32 gate plan

V32 closes through ten gates:

1. **Gate 1: V32 Roadmap And Spec Opening** opens the V32 family, makes `SPECIFICATIONS_ROADMAP.md` truthful after V31 promotion, and wires V32 Gate 1 checks.
2. **Gate 2: Proof Matrix Inventory And Required Contexts** inventories all promoted proof/test surfaces, owners, fixtures, commands, generated artifacts, source-safety classes, and failure modes.
3. **Gate 3: Deterministic Replay Harness And Artifact Stability** hardens repeatable proof generation, stable JSON, volatility inventories, and stale-artifact failures.
4. **Gate 4: Reading Pipeline Proof Coverage** deepens `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` tests over phases, PTRR agents, steps, ThricifiedGenerations, prompts, tools, typed outputs, and telemetry.
5. **Gate 5: Ledger BTD Settlement Failure-State Coverage** expands BTC fee, BTD receipt, settlement, rights-transfer, reconciliation, disclosure, delivery, and projection drift proof.
6. **Gate 6: Interface Contract Regression Suites** hardens API, MCP, ChatGPT App, Terminal, Auxillaries, and deferred-interface contract tests.
7. **Gate 7: Browser Accessibility Responsive Visual Coverage** expands semantic browser, accessibility, responsive, and visual regression proof across Terminal and Auxillaries.
8. **Gate 8: Testnet And Mainnet Readiness Rehearsal** represents local, staging-testnet, production-mainnet, and offline lanes without admitting value-bearing launch.
9. **Gate 9: Promotion Proof Generation Hardening** improves dry-run/check generation, artifact-drift diagnostics, source-safe proof diffs, and PR-based promotion ergonomics.
10. **Gate 10: V32 Promotion Readiness** validates generated artifacts, V32 promotion workflow support, and post-promotion V32 active / V33 draft posture.

Gate 2 proof matrix precision:

- each promoted surface row names a package or interface owner, source fixture, replay command, expected artifact, source-safety class, and failure/repair posture;
- coverage gaps are represented as planned rows with blockers rather than silently omitted proof;
- Terminal, Reading, Protocol/BTD, Auxillaries, MCP, ChatGPT App, API, ledger, database, object storage, promotion, and protocol-demonstration all appear in the matrix.

Gate 2 closes the first V32 proof inventory with `.bitcode/v32-proof-coverage-matrix.json`.
That artifact is generated by `pnpm run generate:v32-proof-coverage-matrix` and checked by `pnpm run check:v32-gate2`.
Each row uses these required fields: owner package/interface, fixture, replay command, expected artifact, source-safety class, coverage status, required contexts, failure mode, and repair posture.
The required surface ids are `terminal`, `reading`, `protocol-btd`, `auxillaries`, `mcp`, `chatgpt-app`, `api`, `ledger`, `database`, `object-storage`, `promotion`, and `protocol-demonstration`.
The accepted source-safety class vocabulary is `source-safe-public`, `source-safe-internal`, `secret-presence-only`, `protected-source-locked`, `source-safe-generated-proof`, and `deferred-blocker`.
The accepted coverage-status vocabulary is `inherited-covered`, `v32-expansion-required`, and `planned-gap`.
Rows with `planned-gap` must name blockers so future gates inherit explicit missing proof rather than hidden confidence.

Gate 3 deterministic replay precision:

- generated JSON artifacts must sort keys or otherwise define deterministic ordering;
- volatile fields must be explicitly cataloged and normalized before equality checks;
- stale artifact checks must identify missing path, stale source commit, malformed schema, or source-safety violation separately.

Gate 3 closes the first V32 deterministic replay package with `.bitcode/v32-artifact-volatility-inventory.json` and `.bitcode/v32-deterministic-replay-report.json`.
Those artifacts are generated by `pnpm run generate:v32-deterministic-replay-artifacts` and checked by `pnpm run check:v32-gate3`.
The Gate 3 replay package regenerates `.bitcode/v32-proof-coverage-matrix.json`, compares two deterministic in-memory runs, records byte-level digest equality for generated proof artifacts, and requires stable JSON ordering for every generated artifact.
The volatility inventory classifies accepted `generatedAt` fields as context-bound using a fixed replay timestamp and fails closed when unaccepted random, nonce, UUID, timestamp, `createdAt`, or `updatedAt` fields appear.
The Gate 3 checker proves fail-closed behavior for `missing-path`, `stale-source-commit`, `malformed-schema`, `source-safety-violation`, and `unstable-json-order` cases.
No Gate 3 generated artifact may contain provider tokens, service keys, database passwords, OpenAI keys, Vercel tokens, Supabase service-role material, protected AssetPack source, private prompts, or pre-settlement AssetPack source.

Gate 4 Reading pipeline proof precision:

- `ReadNeedComprehensionSynthesis` coverage names phases, PTRR agents, PTRR steps, ThricifiedGenerations, prompt templates, prompt parts, tool calls, typed outputs, telemetry, and storage records;
- `ReadFitsFindingSynthesis` coverage names depository search, candidate recall, fit measurement, synthesis context, source-safe preview, protected-source lock, settlement boundary, and paid delivery proof;
- real-inference seams are validated by environment-gated tests and never commit OpenAI keys, Vercel tokens, Supabase secrets, protected source, private prompts, or pre-settlement AssetPack contents.

Gate 4 closes its source-safe Reading proof with `.bitcode/v32-reading-pipeline-proof-coverage.json`.
That artifact is generated by `pnpm run generate:v32-reading-pipeline-proof-coverage` and checked by `pnpm run check:v32-reading-pipeline-proof-coverage` plus `pnpm run check:v32-gate4`.
The artifact is contract metadata only: it records pipeline names, UX step ids, exact counts, phase coverage, PTRR agent coverage, model-structured PTRR step prompt digests, ThricifiedGeneration typed-output storage/telemetry, tool input/output telemetry, and accepted boundary assertions without storing protected source, private prompts, raw model payloads, or credentials.
Gate 4 requires exactly two Reading pipelines, eleven phases, twelve PTRR agents, forty-eight PTRR steps, one hundred forty-four ThricifiedGenerations, twenty model-structured PTRR steps, five prompt templates, and four tools.
The accepted boundary assertions are that accepted Needs gate Finding Fits, discovery returns plural `fit/deposits` and `fit/depositAssetIds`, implementation receives discovered fits context, source-safe preview precedes settlement, and pull-request delivery runs only after the settlement-bound preview.

Gate 5 ledger and settlement precision:

- BTC fee quote, Taproot/PSBT posture, network policy, finality, replacement, reorg, BTD mint/read/right-transfer receipts, ledger projection, database projection, object-storage delivery, and PR delivery must all have success, blocked, and repair-state tests where applicable;
- no failure-state test may expose protected AssetPack source before paid settlement;
- reconciliation evidence must bind deterministic repair roots.

Gate 5 closes its source-safe economic proof with `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`.
That artifact is generated by `pnpm run generate:v32-ledger-btd-settlement-failure-states` and checked by `pnpm run check:v32-ledger-btd-settlement-failure-states` plus `pnpm run check:v32-gate5`.
The focused test `packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts` proves BTC fee quote and PSBT phases, blocked-readiness receipts, BTD mint/read/rights-transfer receipts, BTD rights-transfer finality, source-to-shares conservation, settlement conservation drift, ledger/database/object-storage projection drift, staging-testnet readback blocking, encrypted protected-source storage, paid unlock, and pull-request delivery readback.
The generated artifact is economic proof metadata only: it records phase, receipt, drift, repair, source-to-shares, readback-key, and disclosability classes plus source/test digests; it must not store protected AssetPack source, wallet secrets, provider credentials, database passwords, private prompts, raw inference payloads, OpenAI keys, Vercel tokens, or Supabase secret material.

Gate 6 interface regression precision:

- API, MCP, ChatGPT App, Terminal, and Auxillaries contract tests must share source-safe fixtures where the same primitive appears across surfaces.
- Deferred Exchange and Conversations hooks remain represented as blocked/deferred contract rows; V32 does not implement their product depth.
- Authentication, authorization, policy denial, source-safety class, and protected-source non-disclosure must be asserted at route/tool boundaries.

Gate 6 closes its interface proof with `.bitcode/v32-interface-contract-regression-suite.json`.
That artifact is generated by `pnpm run generate:v32-interface-contract-regression-suites` and checked by `pnpm run check:v32-interface-contract-regression-suites` plus `pnpm run check:v32-gate6`.
The focused test `packages/btd/__tests__/v32-interface-contract-regression.test.ts` proves active contracts for `terminal`, `api`, `mcp`, `chatgpt_app`, and `auxillaries_hook`, plus blocked deferred contracts for `exchange_hook` and `conversations_hook`.
The generated artifact is source-safe interface contract proof metadata only: it records surface, fixture, shared primitive, auth-boundary, policy-denial, source-safety, protected-source nondisclosure, and deferred-blocker rows without storing protected AssetPack source, credentials, private prompts, raw inference payloads, wallet secrets, Vercel tokens, OpenAI keys, or Supabase secret material.

Gate 7 browser and visual proof precision:

- Browser proof must cover Terminal and Auxillaries default/guided/detail states across desktop and mobile viewports.
  Auxillaries browser proof uses the active Terminal-hosted entry points (`/terminal?auxillary-open-to=<pane>`), because `/auxillaries/*` remains a redirect/support carrier rather than a standalone application surface.
- Accessibility assertions must cover keyboard path, labels, focus state, status announcements, contrast-sensitive tokens, reduced-motion behavior, and overflow/wrapping.
- Visual proof must favor deterministic semantic checks and stable snapshots over brittle screenshot-only assertions.

Gate 7 closes its operator-surface proof with `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`.
That artifact is generated by `pnpm run generate:v32-browser-accessibility-responsive-visual-proof` and checked by `pnpm run check:v32-browser-accessibility-responsive-visual-proof` plus `pnpm run check:v32-gate7`.
The focused Jest contract `apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts` and browser proof `apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts` prove Terminal and Auxillaries default/guided/detail states, phone and desktop browser execution, keyboard path, landmark labels, focus state, status announcements, contrast-sensitive tokens, reduced-motion, overflow/wrapping, and `no-screenshot-only-approval` deterministic visual semantics.
The generated artifact is source-safe browser proof metadata only; it must not store protected AssetPack source, credentials, private prompts, raw inference payloads, wallet secrets, Vercel tokens, OpenAI keys, or Supabase secret material.

Gate 8 readiness rehearsal precision:

- Local, staging-testnet, production-mainnet, and offline/disabled lanes are typed readiness records.
- Secrets are classified by presence and purpose but are never printed in logs, generated artifacts, or UI metadata.
- Provider connectivity, ledger/database/object-storage posture, BTC network posture, rollback, and repair checks are source-safe.
- Production-mainnet remains blocked unless a future explicit launch gate admits value-bearing settlement.

Gate 8 source closure is `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, generated by `pnpm run generate:v32-testnet-mainnet-readiness-rehearsal` and checked by `pnpm run check:v32-testnet-mainnet-readiness-rehearsal` plus `pnpm run check:v32-gate8`.
The package source `packages/btd/src/testnet-mainnet-readiness-rehearsal.ts` owns the typed readiness records for `local`, `staging-testnet`, `production-mainnet`, and `offline-disabled`.
The focused test `packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts` proves lane shape, secret-presence-only handling, staging-testnet project boundary `tkpyosihuouusyaxtbau`, production-mainnet project boundary `rinalyjfecxnmyczrpzo`, disabled/offline fixture mode, and production-mainnet value-bearing block posture.
The artifact records readiness metadata, roots, source/test digests, provider connectivity classes, ledger/database/object-storage posture, BTC network posture, and rollback/repair checks only; it must never serialize credential values, raw provider payloads, protected source, or production-mainnet value-bearing approval.

Gate 9 promotion proof precision:

- V32 proof generation must support dry-run, check, and promotion modes.
- Promotion failures must identify stale posture, proven-stale output, artifact-drift, missing artifact, malformed payload, source-safety violation, or workflow branch mismatch distinctly.
- Check-mode failures must print source-safe generated artifact diffs: path, failure class, expected/actual digests, byte lengths, first differing line, and redacted line previews rather than whole generated files.
- Gate 9 source closure is `.bitcode/v32-promotion-proof-generation-hardening.json`, generated by `pnpm run generate:v32-promotion-proof-generation-hardening` and checked by `pnpm run check:v32-promotion-proof-generation-hardening` plus `pnpm run check:v32-gate9`.
- The focused protocol test `packages/protocol/test/v32-promotion-proof-generation.test.js` proves `generateCanonicalProvenMarkdown` can build a V32 proof package with the Gate 9 hardening artifact, source-safe generated artifact diffs, and direct-main-push denial.
- Promotion remains pull-request based; V32 must avoid unsafe direct `main` pushes.

V31 Protocol/BTD carryforward precision:

- V32 preserves V31 receipt, source-to-shares, bridge-readiness, Auxillaries, and Protocol/BTD telemetry law as active substrate.
- V32 proof/test work may read V31 BTD, fee, settlement, receipt, source-to-shares, bridge-readiness, Auxillaries, and telemetry objects through package-owned interfaces.
- V32 must not rederive or override V31 settlement, receipt, bridge, interface, or source-disclosure law.
- When V32 surfaces V31 substrate state in proof artifacts, it must present readiness, blockers, repair actions, and source-safe summaries rather than protected source or secrets.

## V32 whole Bitcode operator chain proof canon

The V32 whole-system proof chain follows the commercial Reading chain and the
inherited V31 Auxillaries control plane. V32 does not introduce a new product
path here; it makes the promoted path replayable, testable, and source-safe:

```text
Auxillaries readiness proof
  -> Profile/account completeness
  -> Provider connection readiness
  -> Interface admission
  -> Wallet/BTD readiness
  -> Organization/team/role/policy authority
  -> Deposit or select deposited source
  -> Request Read
  -> Synthesize and review Need
  -> Request Finding Fits
  -> Review source-safe AssetPack preview
  -> Prepare BTC fee and settlement
  -> Wallet signs or blocks explicitly
  -> Ledger/database/right-transfer reconciliation
  -> Paid delivery as pull request
  -> Terminal journal, proof, and repair follow-through
  -> Auxillaries recovery and readiness proof
```

Each transition must be observable as an execution, pipeline, PTRR agent, PTRR step, ThricifiedGeneration, tool call, ledger journal row, database projection, or repair receipt where applicable.

## V32 support-surface read-model proof canon

Auxillaries reading remains route-owned to the Auxillaries surface.
V32 proves that Profile, Connects, Interfaces, Wallet, BTD, organization, and policy panes receive typed read models from package/API contracts rather than rederiving readiness, permission, or settlement posture in component-local code.

Each pane read model must contain:

- pane identity, owner/principal, organization scope when present, status, timing, and proof posture;
- low-detail summary, readiness chips, blockers, and next admitted repair action sufficient for ordinary operation;
- expandable audit detail containing package object ids, root ids, projection counts, provider readback status, and route/write availability;
- explicit section availability: available, empty, blocked, retryable, repairable, or approval-required with a readable reason;
- source-safety posture proving provider tokens, wallet secrets, private prompts, service keys, database passwords, and protected AssetPack source are absent;
- deterministic route/query state so reloads return the same selected pane and detail posture.

The proof must show that each read model is deterministic from authenticated account state, package-owned Auxillaries objects, provider readback, ledger/BTD readiness, route query state, and data mode.
It must prove partial live readback shows blockers and retry actions rather than silently downgrading policy.

## V32 operator UX quality and browser-proof canon

Terminal is the primary Reading cockpit and Auxillaries is the enterprise support and control plane.
Both must be readable by default, keyboard reachable, responsive, accessible, and browser-proven.

The browser proof must cover:

- one named `main` landmark for the route;
- keyboard-reachable skip links to the active transaction or support pane;
- named navigation regions for Terminal Reading stages and Auxillaries panes;
- named active regions for guided low-detail summary, readiness blockers, and admitted actions;
- expandable audit metadata that does not require raw JSON for ordinary operation;
- explicit loading, empty, failed, blocked, retryable, repairable, approval-required, and source-safe states with `status` or `alert` semantics where appropriate;
- stable mobile and desktop layouts without nested cards, text overlap, or document-level horizontal overflow;
- accessible labels, focus order, state announcements, contrast, and reduced-motion posture where applicable.

Gate 7 proves those UX obligations.
Gate 9 then proves the telemetry and recovery evidence that lets users debug readiness from the interface rather than from browser network logs.

## V32 interface and support-surface contract proof

V32 adds proof that interface surfaces consume admitted Auxillaries and V31 Protocol/BTD objects instead of duplicating policy:

- `AuxillariesInterfaceAdmission` covers Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and future interface hooks.
- Each admission record names interface id, surface, auth mode, supported actions, required policy, source-safety class, blockers, readiness, and admission root.
- Terminal, API, MCP, and ChatGPT App may read interface admission to gate source-safe actions and protected actions.
- Exchange and Conversations remain deferred product-depth hooks, not admitted market or conversation implementation.
- The proof fails closed on missing auth mode, unsupported action, protected source, secrets, route-local policy copies, stale readiness, or missing policy root.
- The Auxillaries Interfaces pane renders the same admission records as a catalog: surface, auth mode, readiness, source-safety class, supported actions, currently admitted actions, policy requirements, blockers, and proof root. It does not recalculate policy locally.

## V32 local and staging promotion readiness canon

V32 promotion is admissible only when the version branch can prove both source
closure and promotion automation without relying on unstated operator memory.
Gate 10 owns that closure.

The promotion-readiness contract has five parts:

- all V32 gate scripts are invoked by gate-quality CI while `BITCODE_SPEC.txt`
  remains `V31`;
- gate-quality and canon-quality workflows also accept the promoted state after
  the V32 promotion workflow commits `BITCODE_SPEC.txt -> V32`;
- the canonical promotion command supports `--version V32`, validates the V32
  draft family, runs local proof suites, prepares V32 hand-authored status
  truth, prepares runtime canon posture for V32 active / V33 draft, generates
  `BITCODE_SPEC_V32_PROVEN.md`, writes `.bitcode/v32-*` proof artifacts, and
  then validates the promoted V32 family;
- the version-promotion workflow runs only for a `version/v32` pull request into
  `main`, validates the same proof surface, and commits the generated promotion
  artifacts back to the version branch;
- local and staging-testnet QA evidence remains source-safe: environment
  readiness, pipeline readback, Terminal browser proof, ledger/database
  reconciliation posture, protocol package posture, and promotion dry-run are
  named without committing secrets.

`packages/protocol/src/canon-posture.js` and
`packages/protocol/data/state.json` are commercial runtime posture carriers.
They must align to V31 active / V32 draft during Gate 10 work and be rewritten
to V32 active / V33 draft by promotion automation.
The Gate 10 checker is promotion-mode aware: it must accept the V31/V32 package
posture before the generated canon commit and the V32/V33 package posture after
the generated canon commit.

Gate 10 does not itself promote `BITCODE_SPEC.txt`.
It closes when `version/v32` can be pull-requested to `main` and the V32
promotion workflow has enough scripted proof to produce the standalone
canonical promotion commit.

Gate 10's source implementation is the V32 promotion-readiness control surface:
`scripts/check-v32-gate10-promotion-readiness.mjs`,
`scripts/promote-bitcode-canon.mjs`, `scripts/generate-bitcode-proven.mjs`,
`scripts/prepare-bitcode-spec-family-promotion.mjs`,
`scripts/prepare-bitcode-runtime-canon-promotion.mjs`,
`.github/workflows/v32-canon-promotion.yml`, `BITCODE_V32_QA.md`, and
`.bitcode/v32-promotion-readiness-report.json` must agree on the same V31
active / V32 draft pre-promotion surface and V32 active / V33 draft
post-promotion surface. The generated telemetry artifact is source-safe and
exists to bind Gate 9 proof/test artifacts into promotion proof without
exposing protected source or secrets.

## V32 Wallet/BTD proof coverage canon

Wallet and BTD support are ordinary Auxillaries panes, not opaque settlement footnotes.
The canonical wallet, signer, range, read-right, treasury, access, and settlement-readiness objects remain owned by `packages/btd`; V32 proves Auxillaries consumes and explains them instead of rederiving them.

The pane support model must contain:

- wallet capability and signer posture, including no-custody state and any required reconnect or authorization action;
- network policy posture over local, staging-testnet, and production-mainnet value-bearing approval;
- BTD range/read-right/treasury summary with source-safe roots and counts;
- settlement-readiness blockers, quote roots, finality state, and next admitted repair action when settlement support is relevant;
- organization treasury posture kept distinct from Exchange market state;
- explicit proof that no server component custodies private keys or displays wallet secrets.

Gate 5 proof coverage binds this model through `BtdWalletBtdSupportProjection` in `@bitcode/btd` and `AuxillariesWalletBtdPaneState` in the package-owned Auxillaries route contract.
The projection carries `walletCapabilityRoot` and `btdSupportRoot`, names signer capabilities such as message signing, PSBT signing, and rights transfer readiness, counts owner-read/licensed-read/pending/denied/unknown AssetPack read-right posture, sums range cells, and always marks `protectedSourceVisible: false` for pre-settlement support views.
Its treasury summary is account-scoped, no-custody, and explicitly `not_exchange_market_state`.

No server component may custody the Reader private key.
Server-side routes may prepare receipts, validate proofs, serialize quote/posture evidence, and persist registry rows only when explicitly requested.
They must not claim signature, broadcast, finality, settlement unlock, or rights transfer without matching receipt and readback evidence.

The Auxillaries Wallet and BTD panes are source-safe.
They may reveal capability labels, quote roots, state labels, txids, and readiness blockers.
They may not expose protected AssetPack source, wallet secrets, provider tokens, or private signing material.

## V32 readiness diagnostics and recovery proof canon

Readiness and recovery are ordinary Auxillaries workflows, not after-action support tasks.
V32 proves the canonical diagnostic and recovery model is produced from:

- profile/account facts: user identity, profile completeness, wallet binding, preferences, and notifications;
- provider facts: installation/account state, credential presence class, scopes class, readback state, and repair action;
- interface facts: admitted surface, auth mode, supported actions, required policy, and source-safety class;
- wallet/BTD facts: signer posture, no-custody posture, BTD range/read-right/treasury summary, and settlement-readiness blockers;
- organization facts: organization, team, role, grant set, policy id/hash, wallet binding requirement, decision, denial reason, and recovery route;
- source-safe telemetry facts: execution id, before/after readiness roots, evidence root, blocker, repair outcome, and retry policy.
- proof-hook facts: telemetry subject, theorem id, replay step id, evidence root, telemetry root, source-safety class, blocker id, repair outcome, and proof root.

Readiness is classified before repair:

- `profile_incomplete`;
- `provider_connection_blocked`;
- `interface_not_admitted`;
- `wallet_binding_required`;
- `btd_readiness_blocked`;
- `organization_policy_denied`;
- `role_or_grant_missing`;
- `multi_sig_readiness_blocked`;
- `recovery_readback_blocked`;
- `source_safety_violation`.

Repair actions are canonical and auditable:

- `complete_profile`;
- `repair_provider_connection`;
- `request_interface_admission`;
- `bind_wallet`;
- `refresh_btd_readback`;
- `request_role_or_grant`;
- `review_policy_denial`;
- `prepare_multi_sig_readiness`;
- `retry_recovery_readback`;
- `quarantine_source_unsafe_projection`.

The readiness state is one of ready, incomplete, retryable, repairable, approval-required, denied, or blocked.
Recovery runs are executions and must store source-safe before/after evidence.
They also carry evidence roots and telemetry roots so recovery readback can be joined to `AuxillariesTelemetryProofHook` without replaying private route internals.
They must never store service-role JWTs, Supabase secret keys, OpenAI keys, database passwords, wallet secrets, provider tokens, private prompts, or protected AssetPack source in tracked code, telemetry, UI metadata, or persisted proof payloads.

## V32 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: Deposit, depository asset, repository snapshot, source measurement, embedding document, source proof root, ownership boundary, deposit journal row.
- Current algorithms and derivation rules: repository inventory binds source branch/commit; deposit admission creates searchable lexical/vector evidence; depositor ownership stays separate from later Reader rights.
- Current invariants and fail-closed conditions: invalid deposit, missing repository commit, unavailable source material, or absent depositor boundary blocks Finding Fits.
- Current proof obligations: source measurement root, embedding policy root, repository snapshot root, and depositor boundary proof.
- Current source-bearing implementation basis: `apps/uapi/app/terminal`, commercial API routes, `packages/pipelines/asset-pack`, `packages/btd`, Supabase migrations, and readback scripts.
- Current validating commands and parity basis: V32 gate checks, V31 readback verifier until replaced, package tests, UAPI tests, and staging-testnet SQL/readback evidence.
- Current accepted boundaries: broader provider families remain staged unless Terminal requires a narrow GitHub-adjacent hook.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: ReadRequest, ReadNeed, prompt registry ids, PTRR agent ids, PTRR step ids, ThricifiedGeneration ids, raw output posture, parsed typed output, and acceptance root.
- Current algorithms and derivation rules: the Reader's request is not admitted to Finding Fits until `ReadNeedComprehensionSynthesis` synthesizes a Need and the user accepts it.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing Need review, or feedback lineage mismatch blocks Finding Fits.
- Current proof obligations: prompt template, interpolated prompt, input context, output schema, raw response posture, parsed output, usage, model identity, and acceptance root.
- Current source-bearing implementation basis: Reading pipeline contracts, bounded structured inference, read-review API route, Terminal Read UX, and tests.
- Current validating commands and parity basis: pipeline contract tests, route tests, prompt rendering/audit checks, local live OpenAI validation, and V32 gate checks.
- Current accepted boundaries: full-profile async push completion can deepen in V32 gates but cannot bypass source-safe preview or settlement boundaries.

#### V32 Reading pipeline observability canon

Reading pipeline observability is contract-projected, not ad hoc.
The asset-pack package owns the inventory for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, and live harness events must project back to that inventory whenever they are emitted.

The observable contract levels are:

- execution;
- phase;
- PTRR agent;
- PTRR step;
- ThricifiedGeneration;
- prompt;
- tool;
- raw output;
- parsed output.

For every live Reading stream event that can be associated with a contract, Terminal-visible telemetry carries:

- pipeline name;
- phase id;
- PTRR agent id;
- PTRR step id and step name;
- ThricifiedGeneration id and failsafe;
- prompt template id and generation prompt ids;
- tool id, input type, and output type when the event is tool-backed;
- declared return type and output schema;
- prompt template/interpolated prompt presence;
- reasoning, judgment, raw model response, and parsed typed output presence.

The Vercel Sandbox harness must export both the observability inventory and an observability coverage summary in its evidence artifact.
Coverage readback is not a settlement proof by itself; it is the operational proof that Terminal can debug a live Reading run without relying on browser network logs.
Failure to observe prompt, raw-output, parsed-output, or tool telemetry in a run that reaches those stages is a blocked-readiness signal for Gate 4+ QA.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: FindingFits query root, lexical search result, vector search result, fit deposit list, candidate score, ranking root, blocker list, and verification decision.
- Current algorithms and derivation rules: `ReadFitsFindingSynthesis` discovery searches the depository for all fits above threshold, ranks them, and uses fit deposits as contextual knowledge for AssetPack synthesis.
- Current invariants and fail-closed conditions: no-survivor asset pack, no-worthy-fit, mock/frontier source leakage, missing embedding policy, or missing candidate source root blocks implementation.
- Current proof obligations: search provider/tool ids, vector embedding policy, threshold, source roots, ranking roots, and selected-context root.
- Current source-bearing implementation basis: depository search tools, embedding configuration, AssetPack pipeline agents, and pipeline host harnesses.
- Current validating commands and parity basis: depository search tests, embedding tests, tool telemetry tests, staging readback, and Terminal stream tests.
- Current accepted boundaries: non-GitHub deposit providers are future unless required for a specific Terminal-owned repair.

### Selection and materialization

- Current canonical objects and emitted artifacts: AssetPack synthesis output, source-safe preview, delivery plan, branch artifact, pull-request delivery, branch artifacts and assetPackEvidence.
- Current algorithms and derivation rules: implementation uses discovered fit deposits as context; protected source is written only behind the paid unlock boundary; delivery materializes as a pull request after settlement.
- Current invariants and fail-closed conditions: unpaid preview cannot expose protected source; delivery cannot proceed without settlement unlock; branch identity must match ReadRequest repository context.
- Current proof obligations: synthesis prompt/output, preview policy, fee quote root, settlement unlock, delivery branch, PR id/url, and assetPackEvidence.
- Current source-bearing implementation basis: AssetPack pipeline postprocess, GitHub/VCS routes, pipeline host runner, Terminal delivery readback, and BTD package primitives.
- Current validating commands and parity basis: synthesis tests, source-leakage tests, route tests, PR delivery mocks/live checks, and V32 gate checks.
- Current accepted boundaries: full mainnet value delivery remains approval-gated.

#### V32 AssetPack disclosure rights canon

AssetPack disclosure is a first-class review object, not an incidental UI summary.
The preview before payment may show Need measurements, Finding Fits measurements, candidate ids, roots, score band, fee quote, range projection, access policy hash, and delivery target.
It must not show protected source content, the full patch, source-bearing manifest entries, or licensed read payload before the paid unlock is proven.

The disclosure review contract carries:

- `AssetPackSourceSafePreview`, which remains the source-safe preview envelope;
- `AssetPackDisclosureReview`, which binds preview id, AssetPack id, read-right state, source visibility, reader action, policy fields, range projection, roots, and protected-source leakage findings;
- owner-read, licensed-read, denied, and pending-settlement distinctions from BTD access primitives;
- paid unlock state from settlement readback;
- leakage review that fails closed when patch markers, source-code markers, or forbidden source-bearing fields appear in preview metadata.

Terminal must render disclosure review as an ordinary Reading stage surface.
Collapsed view shows visibility, reader action, policy root, review root, visible/withheld counts, leakage state, and source unlock state.
Expanded views may show the review metadata and roots, but they still may not reveal protected source before settlement.

Gate pull request titles are part of the same operator-quality posture.
Gate PRs into version branches must begin with the uppercase version and gate prefix, for example `V32 Gate 5: AssetPack Disclosure Rights And Preview Depth`, so gate history stays auditable from GitHub alone.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: wallet identity, signer session, GitHub connection, organization role, read-license, access-policy decision, permission proof.
- Current algorithms and derivation rules: registry-derived permissions decide whether an operator can read, pay, unlock, deliver, repair, or administer a transaction.
- Current invariants and fail-closed conditions: authorization denial, stale signer session, missing org role, or sensitive data projection mismatch blocks action.
- Current proof obligations: wallet signature proof, provider installation proof, role/license readback, policy id/hash, and denial reason.
- Current source-bearing implementation basis: wallet API, VCS API, BTD access primitives, Terminal permission UI, MCP/ChatGPT action gates.
- Current validating commands and parity basis: wallet tests, access tests, API route tests, Terminal permission tests, and staging auth readback.
- Current accepted boundaries: broad enterprise RBAC depth can expand inside V32 only when tied to Terminal transaction operation.

#### V32 organization interface authority canon

Organization permission authority is a BTD primitive, not a per-interface convention.
The canonical decision is `BtdOrganizationInterfaceAuthorityDecision`.
It binds actor id, organization id, organization role, organization permission grants, interface surface, action, wallet binding, registry read-access decision, settlement state, explicit confirmation state, repair approval state, target anchor, source visibility, and proof roots.

V32 Gate 6 proves the package-owned `BtdOrganizationPolicyAuthority` projection is the user and support-plane carrier around that decision.
The projection binds actor/account admission, organization id, team id, member id, role, raw permission grants, explicit grant set for the action, wallet-binding requirement/state, policy id/hash, interface surface, action, multi-sig readiness, policy decision, denial reason(s), recovery route, source visibility, and authority root.
Settlement-adjacent and protected-source actions fail closed when any of account admission, organization, role, explicit grant, wallet binding, policy identity/hash, multi-sig readiness, settlement/read-license state, confirmation, repair approval, or interface admission is missing or denied.
Auxillaries Profile/organization support and Terminal selected-activity authority must read the same object so support UI, transaction cockpit, telemetry, and proof hooks explain one shared policy state.

V31 defines the inherited action set that V32 proof coverage must keep coherent:

- `read_transaction`
- `request_read`
- `review_need`
- `request_finding_fits`
- `review_asset_pack_preview`
- `pay_btc_fee`
- `unlock_asset_pack_source`
- `deliver_asset_pack`
- `repair_projection`
- `administer_organization`

Each action has a minimum organization role, optional explicit permission grants, wallet-binding requirement, registry read-access requirement, settled-payment requirement, explicit-confirmation requirement, repair-approval requirement, and source-visibility result.
Protected-source actions fail closed unless role/grant, wallet binding, owner-read or licensed-read registry access, settlement, and interface admission all agree.
Source-safe preview actions may remain visible without protected source.

The same authority primitive must be used by:

- Terminal, as the ordinary permission explainer for selected activity detail;
- API routes, as the JSON-safe route decision for interface owners;
- MCP, as organization-scoped action authority over read-license and delivery operations;
- ChatGPT App, as connected-interface write admission over confirmed delivery writes;
- the sandbox harness, as emitted evidence for live Reading/AssetPack completion readback.

Authority proof roots include role root, permission root, read-access root, interface root, and aggregate authority root.
Terminal renders those roots with blockers and decision rows so operators can understand why a transaction can or cannot pay, unlock, deliver, repair, or administer without opening network logs.

### Disclosure and projection

- Current canonical objects and emitted artifacts: disclosure policy, projection policy, redaction decision, preview metadata, owner-read/licensed-read/denied state.
- Current algorithms and derivation rules: source-safe preview reveals measurements and rights posture, not protected AssetPack source; paid unlock changes the disclosability boundary.
- Current invariants and fail-closed conditions: public projection overexposure, missing projection policy, or unpaid source access blocks display and delivery.
- Current proof obligations: disclosure boundary proof, projection policy hash, redaction decision, and access readback.
- Current source-bearing implementation basis: BTD access/projection primitives, Terminal preview components, API route serializers, and tests.
- Current validating commands and parity basis: disclosure tests, UI tests, readback queries, and source leakage scans.
- Current accepted boundaries: public docs may summarize posture but must not expose private source.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC fee quote, PSBT, payment observation, settlement unlock, BTD range, source-to-shares, journal entry, ledger anchor, reconciliation report.
- Current algorithms and derivation rules: Share-to-Fee pricing is deterministic from measurement weights and measurement volume; BTC fee payment gates protected-source unlock and read-license/right transfer.
- Current invariants and fail-closed conditions: settlement conservation drift, missing payment proof, stale fee quote, unaccepted quote, missing signer capability, reorg, replacement, broadcast failure, or custody ambiguity blocks finality.
- Current proof obligations: quote root, signer recovery state, PSBT state, txid or blocked-readiness receipt, ledger anchor, source-to-shares report, and reconciliation result.
- Current source-bearing implementation basis: `packages/btd` fee/range/journal/reconciliation primitives, UAPI settlement routes, Terminal Wallet/BTC section, and Supabase projections.
- Current validating commands and parity basis: BTD tests, settlement route tests, Terminal wallet/BTC tests, staging ledger/database readback, and V32 gate checks.
- Current accepted boundaries: value-bearing mainnet stays outside V32 unless separately approved.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof family, member, theorem, witness artifact, replay step, generated proof appendix, validation report.
- Current algorithms and derivation rules: every promoted V32 claim needs a generated or executable witness, and every failure must preserve enough context for replay.
- Current invariants and fail-closed conditions: stale promoted status truth, missing witness, inconsistent proof root, or ungreen promotion validation blocks promotion.
- Current proof obligations: proof-family report, canonical input report, canon-posture drift report, promotion dry-run, generated appendix, and gate closure checks.
- Current source-bearing implementation basis: spec-family checker, canonical-input checker, promotion scripts, gate-quality workflows, and protocol-demonstration proof runtime.
- Current validating commands and parity basis: `check:spec-family`, V32 gate scripts, canon-posture drift checks, demonstration tests, package tests, and promotion workflow.
- Current accepted boundaries: V32 promotion automation may be hardened across gates but must be complete before `version/v32` merges to `main`.

## V32 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v32-inference-synthesis-proof.json` | prompt, model, parsed-output | prompt-complete, typed-output | render, infer, parse, persist | pipeline telemetry, route tests | Reading pipeline contracts |
| Prompt-completeness | `.bitcode/v32-prompt-completeness-proof.json` | prompt parts, templates, interpolations | no-hidden-prompt, context-bound | compose, render, record | prompt render outputs | prompt registry and tests |
| Static-code-analysis | `.bitcode/v32-static-code-analysis-proof.json` | source scans, route scans, import scans | no-versioned-routes, no-demo-import | scan, report | lint/typecheck outputs | scripts and CI |
| Verification-decisions | `.bitcode/v32-verification-decisions-proof.json` | Fit verification, preview verification | threshold, blocker, no-worthy-fit | search, rank, decide | depository search reports | asset-pack pipeline |
| Selection-and-materialization | `.bitcode/v32-selection-and-materialization-proof.json` | selected fits, delivery branch | paid-before-source, pr-delivery | synthesize, settle, deliver | AssetPack evidence, PR receipt | pipeline host and VCS routes |
| Authorization-and-sensitive-flow | `.bitcode/v32-authorization-and-sensitive-flow-proof.json` | wallet, org, license, policy | authorized-action, redaction | sign, authorize, project | wallet/access readbacks | BTD and UAPI |
| Settlement-source-to-shares | `.bitcode/v32-settlement-source-to-shares-proof.json` | fee, range, license, source shares | conservation, right-transfer | quote, pay, mint, reconcile | source-to-shares, fee receipt | BTD settlement primitives |
| Disclosure-boundary | `.bitcode/v32-disclosure-boundary-proof.json` | preview, paid unlock, denied state | no-prepay-source, paid-source | preview, unlock, read | projection-policy, leakage scans | access/projection code |
| Proof-contract | `.bitcode/v32-proof-contract.json` | families, theorems, witnesses | complete-family, replayable | generate, validate, promote | spec/proven artifacts | spec-family tools |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v32-inference-synthesis-proof.json`
- members: Reading Need synthesis, Finding Fits discovery, AssetPack synthesis, preview validation, settlement unlock inference.
- theoremIds: prompt-complete, typed-output, model-bound, telemetry-persisted.
- replayStepIds: render prompts, call model or mock, parse type, persist execution telemetry.
- witnessArtifactPaths: pipeline telemetry rows, prompt render artifacts, route test reports, staging readback.
- current member closure criteria: each inference point is a ThricifiedGeneration under a PTRR agent step with a schema-bound output.
- current member verdict shape: pass, fail, blocked, or accepted-boundary with evidence path.
- current theorem-by-theorem closure reading: no theorem is closed without prompt, input, raw output posture, parsed output, model id, and usage state.
- current theorem-to-replay grouping: prompt composition, model call, parse, persist, and UI projection.
- minimum artifact/replay binding set: execution id, pipeline id, phase id, PTRR agent id, PTRR step id, ThricifiedGeneration id, prompt id, model id, output schema id.
- current proof-object fields: proofFamily, memberId, theoremId, replayStepId, evidencePath, verdict, blocker.
- generated-artifact and test bindings: `.bitcode/v32-spec-family-report.json`, pipeline tests, route tests, and Terminal stream tests.
- fail-closed conditions: missing prompt, missing typed parse, hidden model id, or missing telemetry blocks promotion.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v32-prompt-completeness-proof.json`
- members: prompt part registry, prompt template registry, agent prompt registry, step prompt registry, sub-step prompt composition.
- theoremIds: every inference has a prompt template; every interpolated prompt is recorded; every schema is named.
- replayStepIds: collect prompt parts, compose prompt, interpolate context, record prompt payload.
- witnessArtifactPaths: rendered prompt files, telemetry rows, prompt tests.
- current member closure criteria: no inference occurs without a registered prompt path.
- current member verdict shape: pass, fail, blocked, accepted-boundary.
- current theorem-by-theorem closure reading: prompt completeness is required before parsed-envelope admissibility.
- current theorem-to-replay grouping: registry lookup, composition, interpolation, telemetry projection.
- minimum artifact/replay binding set: prompt ids, prompt part ids, context root, template text, interpolated text.
- current proof-object fields: promptId, templateId, contextRoot, inferenceId, schemaId, verdict.
- generated-artifact and test bindings: prompt inventory, prompt rendering tests, pipeline contract tests.
- fail-closed conditions: prompt contract incompleteness blocks the step.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v32-static-code-analysis-proof.json`
- members: route version scan, import boundary scan, source casing scan, lint, typecheck.
- theoremIds: no versioned active source, no demonstration runtime import, no casing drift.
- replayStepIds: scan files, compare rules, emit report.
- witnessArtifactPaths: CI logs, local command output, `.bitcode` reports.
- current member closure criteria: all required scans pass or name accepted compatibility exceptions.
- current member verdict shape: pass, fail, blocked.
- current theorem-by-theorem closure reading: source shape must match active canon posture.
- current theorem-to-replay grouping: route scan, import scan, lint/typecheck.
- minimum artifact/replay binding set: command, exit code, checked paths, violations.
- current proof-object fields: ruleId, path, result, evidence, blocker.
- generated-artifact and test bindings: gate-quality workflow and local gate scripts.
- fail-closed conditions: active versioned route, stale draft posture, or direct demo import blocks closure.

### Verification-decisions

- proofArtifactPath: `.bitcode/v32-verification-decisions-proof.json`
- members: candidate fit verification, preview verification, settlement readiness verification.
- theoremIds: threshold-admitted, no-worthy-fit-is-honest, blocked-readiness-is-explained.
- replayStepIds: search, rank, verify, decide.
- witnessArtifactPaths: search result rows, ranking roots, verification reports.
- current member closure criteria: every Fit decision has candidates, thresholds, roots, and reasons.
- current member verdict shape: worthy_fit, no_worthy_fit, blocked_readiness.
- current theorem-by-theorem closure reading: the decision must be derivable from stored candidates and Need measurements.
- current theorem-to-replay grouping: recall, ranking, scoring, verifier judgment.
- minimum artifact/replay binding set: Need id, deposit ids, scores, threshold, ranking root, verifier output.
- current proof-object fields: decision, candidates, roots, reasons, output schema.
- generated-artifact and test bindings: depository-search tests, staging readback, Terminal preview tests.
- fail-closed conditions: fabricated candidate, missing source root, or absent blocker reason.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v32-selection-and-materialization-proof.json`
- members: selected deposits, AssetPack synthesis, branch artifact, delivery PR.
- theoremIds: context-bound-synthesis, paid-before-source, delivery-target-matches-read.
- replayStepIds: select, synthesize, preview, unlock, deliver.
- witnessArtifactPaths: assetPackEvidence, delivery receipts, PR metadata.
- current member closure criteria: materialized source is never visible to Reader before paid unlock.
- current member verdict shape: preview_locked, unlock_ready, delivered, blocked.
- current theorem-by-theorem closure reading: selection and delivery must read back from settlement and source roots.
- current theorem-to-replay grouping: fit selection, synthesis, settlement unlock, VCS branch, PR creation.
- minimum artifact/replay binding set: fitDepositAssetIds, sourceRoot, settlementUnlockId, branch, pullRequest.
- current proof-object fields: selectedIds, previewPolicy, unlockDecision, deliveryReceipt, blocker.
- generated-artifact and test bindings: pipeline host tests, VCS tests, readback verifier.
- fail-closed conditions: unpaid source exposure, mismatched target repo, missing PR receipt.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v32-authorization-and-sensitive-flow-proof.json`
- members: wallet identity, signer session, provider connection, org role, read-license, policy decision.
- theoremIds: action-authorized, secret-not-projected, redaction-applied.
- replayStepIds: authenticate, authorize, project, redact.
- witnessArtifactPaths: wallet proof, connection rows, policy readback, redaction logs.
- current member closure criteria: sensitive data is only shown to authorized principals and only at the admitted boundary.
- current member verdict shape: authorized, denied, blocked, redacted.
- current theorem-by-theorem closure reading: an action cannot execute from UI intent alone.
- current theorem-to-replay grouping: identity proof, role/license lookup, policy decision, projection.
- minimum artifact/replay binding set: principal id, role/license ids, policy id/hash, decision.
- current proof-object fields: principal, policy, decision, reason, projectedFields.
- generated-artifact and test bindings: wallet/access tests, API tests, Terminal permission tests.
- fail-closed conditions: authorization denial or projection mismatch blocks action.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v32-settlement-source-to-shares-proof.json`
- members: fee quote, payment observation, BTD range, source-to-shares, read-license, journal.
- theoremIds: fee-conservation, range-conservation, license-transfer.
- replayStepIds: quote, prepare PSBT, observe payment, mint/transfer, reconcile.
- witnessArtifactPaths: `.bitcode/source-to-shares.json`, fee receipt, journal rows, ledger anchors.
- current member closure criteria: settlement must conserve BTC fee, BTD range, source shares, and right transfer.
- current member verdict shape: prepared, signed, broadcast, confirmed, blocked, reconciled.
- current theorem-by-theorem closure reading: no paid source unlock without fee and right-transfer readback.
- current theorem-to-replay grouping: quote root, payment path, ledger observation, BTD state, reconciliation.
- minimum artifact/replay binding set: fee quote root, payment receipt root, txid or blocked receipt, BTD range slice roots, contribution weights, conservation root, license id, journal id.
- current proof-object fields: quote, payment observation, fit deposits, contribution weights, range slices, settlement allocations, no-overpayment, no-underpayment, zero-cell/refit tail, ancestry evidence, reconciliation check, blocker.
- generated-artifact and test bindings: `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, BTD source-to-shares tests, V32 Gate 5 settlement failure-state tests, settlement route tests, staging readback.
- fail-closed conditions: settlement conservation drift, stale quote, or chain reorg.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v32-disclosure-boundary-proof.json`
- members: preview, projection policy, redaction, paid unlock, denied state.
- theoremIds: no-prepay-source, paid-reader-source, denied-state-no-source.
- replayStepIds: project preview, redact source, evaluate unlock, read source.
- witnessArtifactPaths: `.bitcode/projection-policy.json`, preview payloads, leakage scan reports.
- current member closure criteria: source-bearing content crosses visibility boundary only after paid unlock.
- current member verdict shape: preview, locked, unlocked, denied, blocked.
- current theorem-by-theorem closure reading: disclosure posture must be explainable from policy, payment, and license state.
- current theorem-to-replay grouping: preview, settlement, license, projection.
- minimum artifact/replay binding set: preview id, projection policy hash, settlement unlock id, license id.
- current proof-object fields: visibility, policy, redactions, unlock, blocker.
- generated-artifact and test bindings: disclosure tests, UI tests, source leakage scans.
- fail-closed conditions: public projection overexposure or unpaid protected-source access.

### Proof-contract

- proofArtifactPath: `.bitcode/v32-proof-contract.json`
- members: spec-family report, canonical input report, canon-posture drift report, promotion proof appendix.
- theoremIds: complete-family, valid-draft, valid-promotion.
- replayStepIds: validate family, validate inputs, validate posture, generate proven, promote.
- witnessArtifactPaths: `.bitcode/v32-spec-family-report.json`, `.bitcode/v32-canonical-input-report.json`, `BITCODE_SPEC_V32_PROVEN.md`.
- current member closure criteria: promotion cannot run unless all gate checks and generated proof inputs are green.
- current member verdict shape: draft-valid, promotion-ready, promoted, blocked.
- current theorem-by-theorem closure reading: generated canon must match the hand-authored spec family and source posture.
- current theorem-to-replay grouping: check, generate, dry-run promote, commit promote.
- minimum artifact/replay binding set: spec family files, generated reports, proof-source commit, promotion command.
- current proof-object fields: version, report, currentTarget, pointer, promotionCommit, verdict.
- generated-artifact and test bindings: spec-family checker, canonical-input checker, promotion workflow.
- fail-closed conditions: stale promoted status truth, missing generated appendix, or failed gate check.

## V32 generated canon

### Inherited V19 reproducible-canon artifacts

V32 continues the reproducible-canon requirement: generated reports must be deterministic, path-addressable, and promotion-bound.

### Inherited V20 operator-quality artifacts

V32 continues operator-quality proof: Terminal workflow claims must be backed by UI, accessibility, responsive, error-state, and browser evidence where applicable.

### Exact generated-artifact inventory matrix

| artifact | required in draft | required at promotion | purpose |
| --- | --- | --- | --- |
| `.bitcode/v32-spec-family-report.json` | yes | yes | validates the hand-authored V32 family shape |
| `.bitcode/v32-canonical-input-report.json` | yes | yes | records canonical input closure for active V31 plus V32 draft |
| `.bitcode/v32-canon-posture-drift-report.json` | gate-dependent | yes | proves runtime/docs active/draft posture |
| `.bitcode/v32-proof-coverage-matrix.json` | yes | yes | records source-safe V32 proof/test coverage inventory across promoted surfaces |
| `.bitcode/v32-artifact-volatility-inventory.json` | yes | yes | records V32 accepted volatile fields, stable ordering findings, source-safety verdict, and blocking volatility count |
| `.bitcode/v32-deterministic-replay-report.json` | yes | yes | records V32 deterministic replay byte comparisons and fail-closed artifact stability failure modes |
| `.bitcode/v32-reading-pipeline-proof-coverage.json` | yes | yes | records source-safe Reading pipeline coverage over phases, PTRR agents, ThricifiedGenerations, prompts, tools, telemetry, and settlement/disclosure boundaries |
| `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json` | yes | yes | records source-safe BTC fee, BTD receipt, source-to-shares, projection drift, repair action, paid unlock, and delivery failure-state coverage |
| `.bitcode/v32-interface-contract-regression-suite.json` | yes | yes | records source-safe interface contract regression fixtures, auth boundaries, policy denials, and deferred hook blockers |
| `.bitcode/v32-browser-accessibility-responsive-visual-proof.json` | yes | yes | records source-safe Terminal and Auxillaries browser, accessibility, responsive, and deterministic visual proof coverage |
| `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json` | yes | yes | records source-safe local, staging-testnet, production-mainnet, and offline-disabled readiness lanes with secret-presence-only posture |
| `.bitcode/v32-promotion-proof-generation-hardening.json` | yes | yes | records dry-run/check/promotion proof-generation modes, source-safe generated artifact diffs, failure taxonomy, and branch-protection posture |
| `.bitcode/v32-promotion-readiness-report.json` | yes | yes | records V32 Gate 10 promotion workflow, pre/post-promotion posture, generated-artifact policy, source-safe QA evidence, and branch-protection posture |
| `BITCODE_SPEC_V32_PROVEN.md` | no | yes | generated proof appendix for promoted V32 |

### V32 specifying generated artifacts

The minimum V32 generated set is `.bitcode/v32-spec-family-report.json`, `.bitcode/v32-canonical-input-report.json`, `.bitcode/v32-canon-posture-drift-report.json`, `.bitcode/v32-proof-coverage-matrix.json`, `.bitcode/v32-artifact-volatility-inventory.json`, `.bitcode/v32-deterministic-replay-report.json`, `.bitcode/v32-reading-pipeline-proof-coverage.json`, `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`, `.bitcode/v32-interface-contract-regression-suite.json`, `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`, `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`, `.bitcode/v32-promotion-proof-generation-hardening.json`, `.bitcode/v32-promotion-readiness-report.json`, and promotion-time `BITCODE_SPEC_V32_PROVEN.md`.

### Shared generated-artifact fields

Every generated artifact must include artifact id, schema id, version, current target, source commit, command, generated timestamp, verdict, inputs, and blockers.

### Artifact-specific generated payload fields

Spec-family reports include required file lists and section counts.
Canonical-input reports include active pointer, family paths, generated artifact paths, and proof appendix posture.
Canon-posture reports include active canon, draft target, runtime carrier paths, and drift failures.
Promotion reports include proof-source commit and promotion command.

### Artifact confidentiality and disclosability taxonomy

Generated artifacts are internal by default, reviewer-visible when they contain no secrets, public only when explicitly projected, buyer-visible only after paid unlock, and never allowed to leak protected source or secrets.

### Minimum generated appendix rendered contents

`BITCODE_SPEC_V32_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any required proof input is absent.

### Canonical regeneration and fail-closed posture

Generated canon must be regenerable from repository state.
Promotion must fail closed when any required report, witness, test, proof family, or source posture is stale.

## V32 validation canon

V32 validation is layered:

- spec-family and canonical-input checks for the V32 draft;
- canon-posture drift checks for V31 active and V32 draft;
- V32 gate-specific scripts;
- package lint, typecheck, and Jest suites;
- UAPI route/component tests;
- Terminal browser, accessibility, responsive, and error-state checks;
- local non-mocked OpenAI/Supabase/Vercel Sandbox validation for gates that touch live pipeline behavior;
- staging-testnet readback where ledger/database synchronization or delivery is claimed.

## V32 promotion canon

V32 promotes only through `version/v32` into `main`.
Promotion must:

1. pass every V32 gate check;
2. pass active V31 and draft V32 posture checks before promotion;
3. generate `.bitcode/v32-*` canonical reports;
4. generate `BITCODE_SPEC_V32_PROVEN.md`;
5. update runtime posture carriers from active V31/draft V32 to active V32/next draft;
6. commit `BITCODE_SPEC.txt` changing from `V31` to `V32`;
7. keep main protected by pull request and verified-signature rules.

## V32 appendices and canonical supporting material

The appendices below are binding draft structure for V32.
They name the proof, artifact, validation, source, workflow, and fail-closed surfaces that every later gate must keep synchronized.

## Appendix A. Canonical type and surface catalog

Canonical V32 type families:

- Reading: ReadRequest, ReadNeed, FindingFitsResult, AssetPackPreview, SettlementUnlock.
- Pipeline: execution, pipeline, phase, PTRR agent, PTRR step, ThricifiedGeneration, tool call, prompt record, parsed output.
- Terminal: TerminalTransaction, journal row, stream row, detail accordion, repair action.
- BTD: range, source-to-shares, access policy, read-license, BTC fee quote, payment observation, ledger anchor, reconciliation report.
- Delivery: branch artifact, AssetPack evidence, pull request, delivery repair receipt.

## Appendix B. Proof family closure catalog

Each proof family named in the proof-family canon must have members, theorems, replay steps, witness artifacts, generated artifacts, and fail-closed conditions before V32 promotion.

## Appendix C. Generated artifact contract catalog

The V32 generated-artifact contract is exactly the generated canon section above plus Appendix K source-bearing artifact constraints.

## Appendix D. Validation and checking gate catalog

Gate validation starts with `pnpm run check:v32-gate1`.
Later gates must add focused scripts before claiming implementation closure.
Promotion validation must run all V32 gate scripts, source scans, package tests, UAPI tests, demonstration proof checks, generated report checks, and diff hygiene.

## Appendix E. Current canonical source map

Source map:

- `BITCODE_SPEC.txt`: active canon pointer, still `V31` during V32 drafting.
- `BITCODE_SPEC_V32.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`: draft target family.
- `protocol-demonstration/src/canon-posture.js`: active/draft runtime posture carrier.
- `packages/pipelines/asset-pack`: Reading pipeline and AssetPack synthesis source.
- `packages/pipeline-hosts`: sandbox/harness execution source.
- `packages/btd`: BTD, BTC, rights, journal, and reconciliation primitives.
- `apps/uapi/app/terminal`: Terminal operator surface.
- `.github/workflows`: gate and promotion automation.

## Appendix F. Subsystem totality and derivability matrix

V32 must cover repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

The subsystem sections in the canonical subsystem surfaces chapter are the active derivability matrix rows for V32.

## Appendix G. Canonical file-family and promotion contract catalog

V32 file family:

- `BITCODE_SPEC_V32.md`
- `BITCODE_SPEC_V32_DELTA.md`
- `BITCODE_SPEC_V32_NOTES.md`
- `BITCODE_SPEC_V32_PARITY_MATRIX.md`
- future `BITCODE_SPEC_V32_PROVEN.md`
- `.bitcode/v32-spec-family-report.json`
- `.bitcode/v32-canonical-input-report.json`
- future `.bitcode/v32-canon-posture-drift-report.json`

## Appendix H. Operator surface and quality contract catalog

Terminal quality must include:

- URL-addressable transaction state;
- guided low-detail default path;
- expandable complete detail;
- readable live stream rows for pipeline, agent, tool, prompt, ledger, and delivery activity;
- keyboard and screen-reader usable controls;
- responsive layout;
- explicit empty, loading, blocked, failed, repaired, paid, and delivered states.

## Appendix I. Scenario, workflow, and cross-product contract catalog

V32 cross-product scenarios include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

These names are scenario/workflow coverage labels, not new product brands.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed states:

- invalid deposit blocks Finding Fits;
- prompt contract incompleteness blocks inference;
- parsed-envelope inadmissibility blocks typed pipeline output;
- no-survivor asset pack blocks preview and settlement;
- authorization denial blocks protected action;
- public projection overexposure blocks display;
- settlement conservation drift blocks unlock and delivery;
- stale promoted status truth blocks promotion.

Every fail-closed state must carry a readable Terminal blocker and a repair or retry posture when repair is allowed.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts include:

- `.bitcode/asset-pack.lock.json`
- `.bitcode/selected-source-material.json`
- `.bitcode/verification-report.json`
- `.bitcode/source-to-shares.json`
- `.bitcode/projection-policy.json`
- `.bitcode/system-proof-bundle.json`
- `BITCODE_SPEC_V32_PROVEN.md`

Before settlement, the Reader may see only source-safe preview metadata.
After settlement, the Reader may receive the full AssetPack source according to the paid read-license/right transfer and delivery policy.

## V32 accepted boundaries and reopen conditions

Accepted boundaries:

- V32 remains proof/test deepening over V31 commercial rails, not Exchange product depth.
- V32 may deepen MCP/ChatGPT only where contract regression proof requires shared permission truth.
- V32 may harden demonstration-origin commercial internals but must keep the demonstration standalone.
- V32 may use staging-testnet and local live validation; value-bearing mainnet remains separately approved.
- V32 promotion automation may be implemented across gates, but it must be complete before promotion.

Reopen conditions:

- V31 promoted law is found inconsistent with source behavior.
- Terminal exposes protected source before settlement.
- ledger/database projection contradicts settlement truth.
- organization permission decisions cannot be derived from registry/access policy state.
- gate workflow cannot fail closed for stale active/draft posture.

## V32 completion condition

V32 is complete only when:

- all gates in the V32 parity matrix are closed;
- proof coverage shows Auxillaries supports the inherited Profile, Connects, Interfaces, Wallet/BTD, organization, policy, readiness, and recovery workflows without duplicating primitive policy;
- live or bounded-real validation proves the claimed Reading/settlement/delivery paths;
- promotion workflows can promote only `version/v32`;
- generated V32 proof artifacts and `BITCODE_SPEC_V32_PROVEN.md` are produced;
- `BITCODE_SPEC.txt` changes from `V31` to `V32` only in the formal promotion commit.
