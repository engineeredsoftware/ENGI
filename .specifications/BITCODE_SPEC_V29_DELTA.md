# Bitcode Spec V29 Delta

## Status

- Version: `V29`
- V29 state: canonical promotion complete; this delta records the promoted V28-to-V29 Terminal transaction-depth and promotion-readiness closure set
- Current canonical/latest target: `V29`
- Canonical proof-source commit: `3cfa3e71ef553ecb25221ed7116e29eccbc4df24`
- Prior canonical anchor: `BITCODE_SPEC_V28.md`
- Prior generated proof appendix: `BITCODE_SPEC_V28_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v29/spec-family-report.json`, `.proofs/v29/canonical-input-report.json`, `.proofs/v29/canon-posture-drift-report.json`, V29 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V29_PROVEN.md` as the generated proof appendix for V29 promotion
- Source parity state: V29 source-side Terminal transaction, wallet/BTC, Reading observability, AssetPack disclosure, settlement repair, organization authority, UX proof, workflow, and promotion surfaces are canonicalized in the promoted V29 file family
- State: draft target delta opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V28`
- Scope: V29 canonical delta for Terminal transaction depth, operator recovery, wallet/BTC settlement operation, AssetPack disclosure and rights review, ledger/database reconciliation, organization permission decisions, and promotion-ready workflow proof over V28
- Spec companion: `BITCODE_SPEC_V29.md`
- Notes companion: `BITCODE_SPEC_V29_NOTES.md`
- Parity companion: `BITCODE_SPEC_V29_PARITY_MATRIX.md`
- Generated proof appendix: none until V29 promotion

## Why V29 exists

V28 canonically promoted the first commercial Bitcode Protocol and Terminal MVP:

- Depositing creates source-bound depository evidence.
- Read Request to Read-Need comprehension is formalized.
- Finding Fits searches the depository and synthesizes source-safe AssetPack previews.
- Settlement, read-license/right transfer, and PR delivery are specified and implemented at MVP depth.
- Gate, branch, commit, CI, and promotion governance are formalized.

V29 exists because the Terminal now needs enterprise operational depth.
The product must not merely complete the happy path; it must make every transaction state navigable, recoverable, provable, and comprehensible.

## Accepted V29 decisions

- V28 remains active canon during V29 drafting.
- V29 owns deeper Terminal workflows and transaction operation.
- V29 gate branches are opened from `version/v29` and merged back only when their gate acceptance criteria are closed.
- V29 preserves the V28 five-step Reading UX: request Read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, buy/settle.
- V29 deepens wallet, signer-session, BTC fee, PSBT, broadcast, replacement, reorg, blocked-readiness, and failure recovery in Terminal.
- V29 deepens AssetPack range detail, owner-read, licensed-read, denied-state, source-safe preview, paid unlock, and access-policy review.
- V29 deepens Terminal journal diffing, ledger/database/metaphysical separation, reconciliation repair, and proof-root surfacing.
- V29 deepens organization holdings, roles, read-license usage, and registry-derived permission decisions.
- V29 continues formalizing demonstration-origin commercial internals into packages and narrow APIs without importing `protocol-demonstration/` runtime code.
- V29 workflows and scripts must be retargeted to active V28 and draft V29.

## Explicitly deferred

- Exchange product/market depth remains beyond V29.
- Website Conversations product depth remains beyond V29.
- New `$BTD` supply law remains out of scope.
- Value-bearing mainnet launch remains separately approval-gated.
- Full provider-family completion remains out of scope unless a Terminal transaction gate requires a narrow hook.
- V30 remains the home for Protocol/BTD hardening discovered during V28/V29 when the hardening is not required to complete Terminal transaction depth.
- V31+ scopes remain future unless explicitly reopened by a later spec.

## Pre-Implementation Sequence

1. Open `version/v29` from promoted `main`.
2. Open `v29/gate-1-objectives-and-gating` from `version/v29`.
3. Create the V29 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V28`.
4. Retarget gate-quality and canon-quality workflow posture checks from V27/V28 to V28/V29.
5. Add a V29 Gate 1 checker and package script.
6. Define V29 gates, acceptance criteria, and carryforward parity rows.
7. Validate spec family, canonical inputs, canon posture, workflows, and diff hygiene.
8. Push the gate branch and open a pull request to `version/v29`.

## Commit-Body Direction

V29 gate commit bodies should describe the closed gate, the spec-family changes, the implementation surfaces, the validation commands, and any accepted boundaries.
The eventual V29 promotion commit body must name the Terminal transaction-depth surfaces, list all closed V29 gates, cite generated proof artifacts, state that `BITCODE_SPEC.txt` advances from `V28` to `V29`, and explicitly defer Exchange/Conversations/value-bearing-mainnet work.

## Gate Delta

### Gate 1: V29 Objectives And Gating

Gate 1 opens V29 correctly:

- V29 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V28`.
- README and workflows describe V28 active / V29 draft posture.
- `check:v29-gate1` validates branch naming, spec family, notes, parity, workflow posture, and promotion boundaries.
- The V29 gate list is explicit before product implementation begins.

### Gate 2: Terminal Transaction Read Models And Navigation

Gate 2 owns URL-addressable transaction state, Terminal state machine, detail panes, execution-to-transaction read models, low-detail defaults, expandable detail, and no raw-JSON dependency for ordinary operators.

Closure acceptance:

- the Terminal writes a selected transaction id into the route whenever live, projected, or review-fallback activity is selectable;
- former `runId` links continue resolving but are rewritten to `transactionId`;
- a typed `TerminalTransactionReadModel` derives the selected activity's low-detail operator summary, section navigation, active detail focus, and expandable audit posture;
- Shippables, identity, closure, proofs, history, journal, activity stream, and console sections expose availability, target ids, route hrefs, and blocking reasons without raw JSON inspection;
- console detail is blocked outside live execution-history mode rather than presented as an inert or misleading section;
- unit tests cover route recovery, section availability, legacy query migration, low-detail defaults, and filter/pagination preservation;
- V29 SPEC, DELTA, NOTES, PARITY, Terminal README, package scripts, and gate-quality workflow name the Gate 2 closure surface.

### Gate 3: Wallet Signer Session And BTC Fee Operations

Gate 3 owns wallet connection depth, signer-session recovery, BTC fee quote lifecycle, PSBT handoff, broadcast/finality/replacement/reorg/failure states, blocked-readiness receipts, and no server-custody posture.

Closure acceptance:

- `packages/btd` defines `BtcFeeQuote`, `WalletSignerSessionRecovery`, `BtcFeeBlockedReadinessReceipt`, and `BtcFeeOperationPosture`.
- BTC fee quotes have deterministic quote roots, accepted/expired/superseded/failed lifecycle transitions, BTC-only fee asset, and measurement-root pricing posture.
- Signer recovery distinguishes missing, prepared, stored reconnect, expired, revoked, failed, network mismatch, capability missing, server-custody rejected, and live authorized states.
- BTC fee operation posture maps accepted quote, PSBT-ready, signed, broadcast, confirmed, replaced, reorged, failed, and blocked states into next actions and settlement booleans.
- The BTC fee API serializes operation posture and accepts JSON-safe quote carriers without mutating registry rows unless explicitly requested.
- Terminal adds a Wallet/BTC transaction detail section with source-safe metrics, rows, blockers, quote root, signer session, PSBT handoff, txid, finality, and server-custody posture.
- Gate-quality CI runs the Gate 3 checker plus BTD operation and Terminal Wallet/BTC tests.

### Gate 4: Reading Transaction Recovery And Pipeline Observability

Gate 4 owns deep Terminal visibility over `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, including execution, phase, PTRR agent, PTRR step, ThricifiedGeneration, prompt, tool, output, and typed parse telemetry.

Closure acceptance:

- `@bitcode/pipeline-asset-pack` exposes a Reading pipeline observability inventory and `ReadingPipelineTelemetryProjection` over the existing Reading pipeline contracts.
- The inventory accounts for both Reading pipelines, 11 phases, 12 PTRR agents, 48 PTRR steps, 144 ThricifiedGenerations, all registered prompt templates, all ThricifiedGeneration prompt ids, and the four Finding Fits tools.
- The Vercel Sandbox harness annotates stream events with pipeline name, phase id, PTRR agent id, PTRR step id, ThricifiedGeneration id, prompt template id, generation prompt ids, tool id, output schema, return type, and prompt/raw/parsed/tool evidence posture.
- Harness evidence includes Reading observability inventory and coverage readback so local/staging failures show exactly which telemetry levels were not observed.
- Terminal converts harness SSE events into the shared execution log shape with contract-aware execution state, summary rows, and expandable metadata for prompt template, interpolated prompt, raw response, parsed typed output, tools, and output schema.
- Gate-quality CI runs the Gate 4 checker plus focused asset-pack, pipeline-host, Terminal harness, and execution-log header tests.

### Gate 5: AssetPack Disclosure Rights And Preview Depth

Gate 5 owns AssetPack range detail, owner-read/licensed-read/denied-state flows, source-safe preview, disclosure policy review, paid unlock state, and protected-source leakage tests.

Closure acceptance:

- `@bitcode/pipeline-asset-pack` exposes `AssetPackDisclosureReview` as the first-class review object between source-safe preview and paid source unlock.
- The disclosure review binds preview id, AssetPack id, BTD read-right state, source visibility, reader action, policy fields, range projection, proof roots, fee quote root, and protected-source leakage review.
- Protected source leakage detection fails closed for source-bearing field names, patch markers, and source-code markers inside pre-settlement preview metadata.
- AssetPack postprocessing and the Vercel Sandbox harness store `assetPackDisclosureReview`, `asset-pack/preview.disclosureReview`, and `asset-pack/preview.disclosureReviewRoot` alongside source-safe preview evidence.
- BTD tests cover owner-read, licensed-read, and denied-state boundaries so paid unlock cannot blur ownership, license, and denial semantics.
- Terminal renders disclosure review as part of the source-safe preview surface with visibility, reader action, policy root, review root, visible/withheld counts, leakage state, and source unlock state before raw evidence.
- Gate-quality CI enforces focused disclosure tests and gate PR titles beginning with the uppercase version and gate prefix, such as `V29 Gate 5: AssetPack Disclosure Rights And Preview Depth`.

### Gate 6: Settlement Reconciliation And Repair

Gate 6 owns ledger/database/metaphysical separation, journal diffing, reconciliation repair actions, proof-root surfacing, settlement conservation drift handling, and delivery recovery.

Closure acceptance:

- `@bitcode/btd` reconciliation reports carry `state`, `driftKindCounts`, `repairActions`, deterministic proof roots, and settlement conservation status while preserving private metaphysical canonical facts.
- Projection repair receipts classify missing database projections, ledger-root mismatches, ledger-finality mismatches, database-only orphan projections, and settlement conservation drift.
- Repair actions use canonical action kinds: retry database readback, project ledger fact, update finality state, quarantine database projection, pause settlement unlock, and recover delivery.
- The Vercel Sandbox pipeline harness records `ledgerDatabaseReconciliation` evidence after settlement/readback and emits reconciliation state plus repair-action counts in telemetry.
- Terminal journal detail renders drift classes, blocking reasons, ledger observed facts, database projected facts, metaphysical canonical facts, Terminal journal entries, repair actions, proof roots, and repair receipts without requiring browser-network inspection.
- Focused BTD, API, pipeline-harness, and Terminal tests prove repair classification, conservation drift blocking, delivery recovery visibility, and proof-root projection.
- `check:v29-gate6` and the gate-quality workflow fail closed when Gate 6 specification, implementation, tests, or workflow wiring is missing.

### Gate 7: Organization Permissions And Interface Authority

Gate 7 owns organization holdings, roles, read-license usage, registry-derived permission decisions, MCP/ChatGPT action authority alignment, and Terminal permission explainers.

Closure acceptance:

- `packages/btd/src/authority.ts` defines the shared organization/interface authority primitive, action requirements, registry holdings/read-license summary, source visibility, and proof roots.
- BTD tests prove organization holdings, active/expired/revoked read-license usage, paid delivery admission, unpaid unlock denial, and unsupported ChatGPT administration denial.
- `packages/api/src/routes/btd-crypto.ts` exposes JSON-safe organization authority decisions and `apps/uapi/app/api/btd/organization-interface-authority/route.ts` binds the route.
- MCP auth can require interface authority after registry-derived owner-read or licensed-read evidence.
- ChatGPT App connected-interface write carriers require explicit confirmation, registry read-access evidence, and organization authority evidence before write execution.
- The sandbox harness emits `organizationAuthority` evidence alongside settlement unlock and ledger/database reconciliation.
- Terminal adds an Authority detail section rendering decision rows, blockers, and proof roots from the same payload.
- `pnpm run check:v29-gate7` passes with focused BTD, API, MCP, ChatGPT App, pipeline-hosts, and UAPI tests.

### Gate 8: Demonstration-Origin Commercial Formalization

Gate 8 owns cleanup of freshly ported demonstration-origin internals into package-native APIs, no demonstration runtime imports, durable package tests, and updated internal/public documentation.

Closure acceptance:

- `@bitcode/protocol` exports active/draft canon posture, spec-family checks, canonical-input checks, canon-posture-drift checks, and canonical proven-generation helpers through the package index and type declarations.
- Root scripts for spec quality, spec-family validation, canonical-input validation, canon-posture drift, pre-commit posture, and proven generation import those helpers from the protocol package instead of `protocol-demonstration/src/*`.
- Commercial/runtime source scans fail closed on direct imports from standalone demonstration source.
- The protocol package records active V28 / draft V29 posture while V29 is being developed.
- Protocol package tests prove exported helpers, posture, provenance-helper availability, repository-revision deposit behavior, and direct demonstration-source import boundaries.
- Gate-quality CI runs the Gate 8 checker, protocol package typecheck/test, and the UAPI commercial protocol boundary test.
- V29 SPEC, DELTA, NOTES, PARITY, protocol package README, package scripts, and gate-quality workflow name the Gate 8 formalization boundary.

### Gate 9: Terminal UX Quality And Browser Proof

Gate 9 owns accessibility, responsive layout, copy/prose clarity, empty/loading/blocked/failed states, Playwright coverage, and visual/browser verification for the complete Terminal transaction cockpit.

Closure acceptance:

- Terminal exposes one named cockpit `main` landmark, a keyboard-reachable skip link to the selected transaction workspace, named regions for the transaction workspace and selected activity detail, and accessible controls for route-owned detail sections.
- The default operator path remains low-detail: activity summary, selected result digest, section availability, blockers, and source-safe preview metadata are readable before raw payload expansion.
- Loading, empty, failed, blocked, and source-safe preview states are represented by typed UI states with `status` or `alert` semantics where appropriate, not only by browser-network inspection.
- The complete cockpit is responsive across phone, tablet, laptop, and widescreen viewports without document-level horizontal overflow; table overflow remains contained inside the table scroller.
- Browser proof is executable through a focused Playwright spec that opens Terminal in deterministic mock mode, verifies landmarks, skip navigation, blocked Console posture, source-safe detail, route-owned selection, and responsive readability.
- Focused Jest coverage proves the UI state contract and the exported browser-proof contract that CI and documentation name.
- `check:v29-gate9` fails closed unless V29 specification, Terminal README, Terminal UX contract, Jest tests, Playwright spec, package scripts, and gate-quality workflow all name the Gate 9 browser-proof surface.

### Gate 10: Local And Staging Promotion Readiness

Gate 10 owns non-mocked local validation, staging-testnet readback, generated proof artifacts, V29 promotion workflow support, promotion dry-run, and final version branch readiness.

Closure acceptance:

- `check:v29-gate10` validates the V29 promotion-readiness surface from a clean
  Gate 10 branch and can run in `--promotion-mode` after `BITCODE_SPEC.txt`
  advances to `V29`, including the promoted V29 active / V30 draft protocol
  package posture.
- Gate-quality CI invokes all V29 gate scripts while V29 is still a draft and
  switches to promoted V29 validation after the promotion workflow writes the
  canonical pointer commit.
- Canon-quality CI validates either V28 active / V29 draft posture or V29 active
  / V30 draft posture so the version branch remains green before and after
  promotion automation commits generated canon.
- `promote:canon -- --version V29 --commit <sha> --dry-run` renders a V29
  command plan naming all local proof suites, staging-testnet readback
  verifier, Terminal browser proof, generated `.proofs/v29/*` reports,
  `BITCODE_SPEC_V29_PROVEN.md`, and promoted-family checks.
- `.github/workflows/v29-canon-promotion.yml` runs only for `version/v29`
  pull requests into `main`, validates the source branch, runs promotion-grade
  proof, and commits the generated V29 promotion artifacts back to `version/v29`.
- `prepare-bitcode-spec-family-promotion.mjs` rewrites V29 hand-authored status
  truth and the promoted V29 implementation matrix/checklist judgments for
  promoted mode.
- `prepare-bitcode-runtime-canon-promotion.mjs` rewrites both standalone
  demonstration posture and commercial `packages/protocol` posture for V29
  active / V30 draft.
- `BITCODE_V29_QA.md`, README, V29 SPEC, DELTA, NOTES, PARITY, package scripts,
  and workflows describe local/staging readiness without committing secrets or
  staging credentials.
