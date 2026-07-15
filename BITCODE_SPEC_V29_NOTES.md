# Bitcode Spec V29 Notes

## Status

- Version: `V29`
- V29 state: canonical promotion complete; V29 notes record the accepted Terminal-depth, local/staging, and promotion-readiness evidence
- Current canonical/latest target: `V29`
- Canonical proof-source commit: `3cfa3e71ef553ecb25221ed7116e29eccbc4df24`
- Prior canonical anchor: `BITCODE_SPEC_V28.md`
- Prior generated proof appendix: `BITCODE_SPEC_V28_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v29-spec-family-report.json`, `.bitcode/v29-canonical-input-report.json`, `.bitcode/v29-canon-posture-drift-report.json`, V29 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V29_PROVEN.md` as the generated proof appendix for V29 promotion
- Source parity state: V29 source-side Terminal transaction, wallet/BTC, Reading observability, AssetPack disclosure, settlement repair, organization authority, UX proof, workflow, and promotion surfaces are canonicalized in the promoted V29 file family
- Scope: V29 canonical notes for Terminal transaction depth, local/staging readiness, and promotion automation over V28
- Last fully realized canonical target preserved in source: `V29`

## Notes companion rule

This file is a required companion to `BITCODE_SPEC_V29.md`.
It may carry planning detail, QA observations, and simplified reading, but it must not override the main V29 SPEC.
Binding V29 requirements must be reflected in SPEC, DELTA, and PARITY before a gate closes.

## Concise current-system reading

V28 is active canon.
V29 is the current draft target and owns deeper Terminal transaction operation over the promoted V28 commercial Reading system.

The V28 system already defines:

- source Depositing into the Bitcode depository;
- Read Request to reviewed Read-Need comprehension;
- Finding Fits over fit deposits in the depository;
- source-safe AssetPack preview before settlement;
- BTC fee posture, BTD range/read-license/right transfer, and delivery;
- ledger/database reconciliation, telemetry, and promotion governance at MVP depth.

V29's job is to make those flows operationally excellent in Terminal: recoverable, navigable, typed, inspectable, accessible, and promotion-proven.

## Simplified-spec reading rule

For a simplified reading of V29:

1. V28 is the current law.
2. V29 does not change the law of BTD supply, BTC fee asset, or source-safe paid unlock.
3. V29 improves how a commercial operator uses Terminal to carry a transaction from readiness through paid delivery and repair.
4. If a Terminal state is important for money, source visibility, rights, proof, or delivery, it must be visible, typed, and recoverable.
5. `BITCODE_SPEC.txt` must remain `V28` until the V29 promotion workflow commits the canonical pointer change.

## V29 gate plan

1. **Gate 1: V29 Objectives And Gating**
   - Open the V29 spec family.
   - Retarget workflows and branch/readme posture to active V28 / draft V29.
   - Add a Gate 1 checker and define all V29 gates.

2. **Gate 2: Terminal Transaction Read Models And Navigation**
   - Build URL-addressable Terminal transaction state, typed read models, default-low-detail navigation, and expandable detail panes.
   - Acceptance detail: selected transactions must recover through `transactionId`, detail focus must recover through `transactionDetail`, the first selectable row must write itself into a bare Terminal URL, and the operator-facing model must expose section summaries and blockers before raw payloads.

3. **Gate 3: Wallet Signer Session And BTC Fee Operations**
   - Deepen signer-session recovery, BTC fee quote, PSBT handoff, broadcast, replacement, reorg, failure, and blocked-readiness states.
   - Acceptance detail: BTC quote lifecycle and signer recovery are package-owned primitives; API responses expose JSON-safe operation posture; Terminal exposes Wallet/BTC as a route-owned transaction detail section with blockers before raw payloads.

4. **Gate 4: Reading Transaction Recovery And Pipeline Observability**
   - Make `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` execution telemetry fully readable in Terminal at execution, phase, PTRR agent, PTRR step, ThricifiedGeneration, prompt, tool, raw output, and parsed output levels.
   - Acceptance detail: the asset-pack package owns the observability inventory/projection; the sandbox harness stamps live stream events with contract identifiers and coverage; Terminal renders those identifiers in the shared execution stream header, row summary, and expandable metadata.

5. **Gate 5: AssetPack Disclosure Rights And Preview Depth**
   - Deepen source-safe preview, AssetPack range detail, owner-read/licensed-read/denied state, disclosure policy review, paid unlock, and source-leakage tests.

6. **Gate 6: Settlement Reconciliation And Repair**
   - Make ledger/database/metaphysical separation, journal diffing, reconciliation repair, proof roots, and delivery recovery ordinary Terminal workflows.

7. **Gate 7: Organization Permissions And Interface Authority**
   - Deepen org holdings, roles, read-license usage, registry-derived permission decisions, and MCP/ChatGPT action authority parity.

8. **Gate 8: Demonstration-Origin Commercial Formalization**
   - Continue moving freshly ported internals into package-native APIs and durable tests while preserving the standalone demonstration boundary.

9. **Gate 9: Terminal UX Quality And Browser Proof**
   - Close accessibility, responsive, copy, loading/empty/error/blocked states, browser checks, and Playwright coverage for the complete Terminal cockpit.
   - Acceptance detail: the Terminal page exposes a named cockpit `main`, skip navigation into the selected transaction workspace, named workspace/detail regions, source-safe low-detail defaults, explicit state semantics, and deterministic Playwright coverage for landmarks, blocked Console posture, route-owned selection, and phone/tablet/laptop/widescreen readability.

10. **Gate 10: Local And Staging Promotion Readiness**
    - Run non-mocked local validation, staging-testnet readback, generated proof artifacts, promotion dry-run, and `version/v29` promotion readiness.

## Gate 10 working notes

Gate 10 is the final V29 gate before the version branch can be requested into
`main`.
It is not a product redesign gate.
It proves that every preceding Terminal-depth gate is promotable and that the
automation can safely advance canon.

Accepted Gate 10 posture:

- V29 remains draft while Gate 10 is implemented; `BITCODE_SPEC.txt` stays
  `V28` until the V29 promotion workflow creates the canonical promotion commit.
- Gate-quality CI runs the Gate 10 checker and remains greenable before and
  after promotion by branching on the active pointer.
- Canon-quality CI similarly accepts V28/V29 draft posture before promotion and
  V29/V30 promoted posture after promotion.
- `promote-bitcode-canon.mjs` supports V29 and names every required local proof
  suite, the staging-testnet readback verifier, Terminal browser proof, runtime
  posture preparation, generated proof creation, and promoted-family validation.
- `.github/workflows/v29-canon-promotion.yml` owns the `version/v29` to `main`
  promotion proof and generated-artifact commit.
- `packages/protocol/src/canon-posture.js`, `packages/protocol/data/state.json`,
  and the standalone demonstration posture are kept aligned so local/staging
  readback does not present stale active/draft truth.
- The V29 QA ledger records staging-testnet readback expectations and required
  local proof commands without writing environment values into tracked files.

Gate 10 completion condition:

- `pnpm run check:v29-gate10` passes.
- `npm run promote:canon -- --version V29 --commit HEAD --dry-run` prints a V29
  promotion plan.
- The focused local suites named by the gate checker pass or are intentionally
  delegated to the promotion workflow with documented rationale.
- The gate branch is committed, pushed, and pull-requested into `version/v29`.

## Gate 1 closure notes

Gate 1 is complete only when the V29 family exists, validates, and is wired to CI.
It intentionally does not claim Terminal product closure.

Gate 1 accepted evidence:

- `BITCODE_SPEC_V29.md`, DELTA, NOTES, and PARITY exist.
- `BITCODE_SPEC.txt` remains `V28`.
- workflows and README describe V28 active / V29 draft posture.
- `pnpm run check:v29-gate1` validates branch, posture, workflow, docs, and spec-family shape.

## Gate 2 working notes

Gate 2 closes the first product-source V29 slice.
Its read model is intentionally not a new protocol primitive and not a versioned API route.
It is the Terminal projection that lets operators recover, share, and inspect a selected transaction without depending on browser network logs or raw JSON.

The low-detail default should answer:

- which transaction is selected;
- whether the selected detail section is available, empty, or blocked;
- where to navigate next inside the transaction;
- which facts are proof, ledger, database, delivery, or execution facts;
- whether deeper audit payloads exist behind an expansion.

The detailed view may still carry raw payload accordions for audit, but the ordinary collapsed view must be typed and readable.

## Gate 3 working notes

Gate 3 makes wallet and BTC fee operation readable and typed before the later settlement-repair gate.

Accepted Gate 3 posture:

- BTC fee quote lifecycle and quote-root derivation live in `packages/btd`.
- Signer-session recovery is explicit and never implies server custody.
- PSBT, signed, broadcast, confirmed, replaced, reorged, failed, and blocked readiness are represented as operation posture, not prose-only route errors.
- The BTC fee API can serialize the operation posture and normalize JSON-safe quote carriers.
- Terminal has a Wallet/BTC detail section so fee readiness is visible before raw ledger payload inspection.
- Gate 3 does not implement settlement reconciliation repair; Gate 6 owns drift repair and ledger/database reconciliation action depth.

## Gate 4 working notes

Gate 4 makes Reading pipeline telemetry readable without changing the underlying execution primitive names.
Execution remains the base primitive, Reading pipelines compose phases, each phase owns PTRR agents, each PTRR agent owns plan/try/refine/retry steps, and each step carries ThricifiedGeneration prompt/output evidence.

Accepted Gate 4 posture:

- `reading-pipeline-contract.ts` remains the source of pipeline, phase, PTRR agent, PTRR step, ThricifiedGeneration, prompt, tool, and return-type contracts.
- `reading-pipeline-observability.ts` projects live stream events onto those contracts and reports observability coverage.
- The sandbox harness records contract-aware telemetry events and stores coverage in exported evidence.
- Terminal's live harness stream shows pipeline, phase id, PTRR agent, PTRR step, ThricifiedGeneration, prompt, tool, output schema, raw output posture, and parsed typed output posture through the shared execution log components.
- Gate 4 does not implement disclosure-depth unlock, settlement repair, organization authority, or full browser proof; later gates own those slices.

## Gate 5 working notes

Gate 5 makes AssetPack disclosure a package-owned contract instead of a Terminal-only summary.
The Reading pipeline may synthesize the AssetPack and compute its measurements before payment, but protected source remains withheld until the BTD read-right state and settlement unlock prove that the reader owns or is licensed to read the AssetPack source.

Accepted Gate 5 posture:

- `AssetPackSourceSafePreview` remains the pre-payment preview envelope.
- `AssetPackDisclosureReview` binds source visibility, reader action, policy roots, range projection, fee quote root, and protected-source leakage review to that preview.
- Source visibility has distinct `withheld_before_settlement`, `available_after_settlement`, and `denied` states.
- Reader action has distinct `pay_to_unlock`, `read_as_owner`, `read_as_licensee`, and `blocked` states.
- Leakage review scans preview metadata for source-bearing field names, patch markers, and source-code markers and fails closed before the preview is shown.
- Postprocessing and the sandbox harness store disclosure review evidence next to source-safe preview evidence so database/ledger readback can explain paid unlock state without exposing protected source.
- Terminal renders disclosure review as the ordinary Reading preview surface and keeps expandable raw metadata behind the same source-safe boundary.
- Gate pull request titles must carry the uppercase version and gate prefix so gate closure can be audited from GitHub history.
- Gate 5 does not implement reconciliation repair, organization authority, full settlement UI depth, or browser proof; later V29 gates own those slices.

## Gate 6 working notes

Gate 6 hardens the settlement truth boundary after source-safe preview and before paid unlock/delivery are treated as admissible.

Implementation notes:

- Reconciliation must always separate ledger-observed facts from database-projected facts and private metaphysical canonical facts.
- Metaphysical facts remain private root commitments; they are not rendered as protected source.
- Repair receipts classify drift, while repair actions describe the operational next step.
- Settlement conservation drift is not a warning; it blocks unlock because BTC debit/credit truth must conserve before BTD rights are transferred or source is delivered.
- Delivery recovery is surfaced only after settlement is aligned and delivery evidence exists but the pull-request shippable is not visible in the transaction read model.

Operator notes:

- Terminal journal detail is the ordinary repair cockpit for this gate: drift classes, blockers, repair actions, proof roots, journal entries, and repair receipts must be visible without opening network logs.
- Raw payload remains audit material, not the primary operator interface.

## Gate 7 working notes

Gate 7 makes organization authority package-owned and interface-shared.

Accepted Gate 7 posture:

- BTD authority evaluates Terminal, API, MCP, and ChatGPT App surfaces against the same action requirement table.
- Registry-derived organization holdings and read-license usage are summarized as authority evidence, not aggregate spendable balance.
- Protected-source actions require owner-read or licensed-read access plus settled payment where the action crosses the source boundary.
- ChatGPT App writes remain impossible without explicit user confirmation, read-access evidence, and organization authority evidence.
- MCP can request interface authority after its existing permission and read-access checks.
- Terminal exposes authority as a normal selected-activity detail section with collapsed metrics, blockers, decision rows, proof roots, and raw payload.
- Sandbox harness output carries `organizationAuthority` so staging-testnet Reading runs can be debugged from Terminal.

Gate 7 completion condition:

- `pnpm run check:v29-gate7` passes.
- Focused BTD, API, MCP, ChatGPT App, pipeline-hosts, and UAPI tests cover the authority primitive and interface surfaces.
- Spec, delta, notes, parity, Terminal README, package scripts, and gate-quality workflow name the Gate 7 closure surface.

## Gate 8 working notes

Gate 8 is a commercial-source boundary cleanup gate.
Earlier versions intentionally kept some proof and canon helpers close to the standalone demonstration so the minimal witness could remain easy to audit.
V29 keeps that witness, but the commercial repository now needs package-native imports for every helper used by scripts, workflows, Terminal, APIs, and promotion checks.

Accepted Gate 8 posture:

- `@bitcode/protocol` is the package boundary for canonical posture, spec-family, canonical-input, canon-posture-drift, and proven-generation helpers.
- `protocol-demonstration/` remains executable as a standalone minimal witness and may remain cited in proof inventories.
- Commercial/runtime code and root scripts must not import from `protocol-demonstration/src/*`.
- The protocol package posture must say active V28 and draft V29 until promotion.
- The protocol package tests own the durable import-boundary scan so future gates cannot silently regress into demonstration runtime imports.
- Gate-quality CI must run protocol package typecheck/test, the Gate 8 checker, and the UAPI commercial protocol boundary test.

Gate 8 completion condition:

- `pnpm run check:v29-gate8` passes.
- Protocol package tests pass.
- The spec family, package README, root scripts, and CI all name and enforce the package-native boundary.

## Gate 9 working notes

Gate 9 closes the Terminal cockpit quality slice.
It treats UX quality as protocol evidence: operators must be able to read the transaction state, section availability, source-safe preview posture, blocked actions, and activity stream without relying on browser network logs.

Accepted surfaces:

- `apps/uapi/app/terminal/terminal-ux-browser-proof.ts` records the browser-proof contract: required landmarks, state semantics, viewports, route checks, and evidence files.
- `TerminalPageClient.tsx` owns the named cockpit `main` landmark and skip link.
- `TerminalTransactionWorkspace.tsx` owns the named transaction workspace region, loading/empty/error semantics, and selected result status.
- `TerminalTransactionDetailSurface.tsx`, `TerminalTransactionDetailHero.tsx`, and `TerminalTransactionDetailActionBar.tsx` own the selected activity detail region, low-detail source-safe header, section controls, blocked Console posture, and action errors.
- `BitcodeTransactionsTable.tsx` and `BitcodeTransactionsDataTable.tsx` keep transaction table overflow contained while exposing loading, empty, error, and selectable-row states to tests and assistive technology.
- `apps/uapi/tests/terminalUxBrowserProof.test.tsx` proves the typed state contract.
- `apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts` proves the cockpit in a real browser in deterministic mock mode.

Gate 9 accepted boundaries:

- Gate 9 does not redesign the five-step Reading product flow; it makes the current transaction cockpit accessible and provable.
- Gate 9 does not reveal protected AssetPack source before settlement.
- Gate 9 does not add versioned routes, gate-named runtime routes, or work-in-progress source identifiers.
- Gate 9 does not require live staging credentials; Gate 10 owns non-mocked local/staging promotion readiness.

Gate 9 completion condition:

- `pnpm run check:v29-gate9` passes.
- Focused UAPI Jest coverage and Terminal Playwright browser proof pass locally.
- Gate-quality CI invokes the Gate 9 checker, focused Jest test, and focused Playwright browser proof.

## Later-version boundaries

- V30 remains reserved for Protocol/BTD hardening that is not necessary to close Terminal transaction depth.
- V31+ scopes remain future unless a later spec family reopens them.
- Exchange and website Conversations remain outside V29 product depth.
- Value-bearing mainnet remains separately approved.
