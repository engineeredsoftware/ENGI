# Bitcode Spec V39 Delta

## Status

- Version: `V39`
- V39 state: canonical promotion complete; this delta records the promoted V38-to-V39 commercial Reading readiness closure set
- Current canonical/latest target: `V39`
- Canonical proof-source commit: `1fe583d781bd24f340e5bb89ecc67ef740cf018c`
- Draft proof-source commit: unbound until V39 promotion
- Prior canonical anchor: `BITCODE_SPEC_V38.md`
- Prior generated proof appendix: `BITCODE_SPEC_V38_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v39-spec-family-report.json`, `.bitcode/v39-canonical-input-report.json`, `.bitcode/v39-canon-posture-drift-report.json`, `.bitcode/v39-depository-supply-indexing.json`, `.bitcode/v39-enterprise-reading-ux-state.json`, `.bitcode/v39-read-need-review-resynthesis.json`, `.bitcode/v39-read-fits-finding-runtime.json`, `.bitcode/v39-assetpack-preview-quote-boundary.json`, `.bitcode/v39-settlement-rights-delivery.json`, `.bitcode/v39-operational-telemetry-repair-readback.json`, `.bitcode/v39-interface-conversation-product-parity.json`, `.bitcode/v39-local-staging-reading-rehearsal.json`, `.bitcode/v39-promotion-readiness-report.json`, V39 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V39_PROVEN.md` as the generated proof appendix for V39 promotion
- Source parity state: V39 source-side Depository supply indexing, enterprise Reading UX, ReadNeed review/resynthesis, ReadFitsFinding runtime, AssetPack preview/quote, settlement rights delivery, operational telemetry repair readback, interface parity, local/staging rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V39 file family
- Spec companion: `BITCODE_SPEC_V39.md`
- Notes companion: `BITCODE_SPEC_V39_NOTES.md`
- Parity companion: `BITCODE_SPEC_V39_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md` only after V39 promotion
- Scope: V39 canonical delta for commercial Reading readiness over promoted V38 inference correctness canon

## Why V39 exists

V38 promoted inference correctness.
It made pipeline execution, PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration, prompt benchmarking, source-safe inference telemetry, and Reading fit-search primitives exact enough to use as production-grade infrastructure.

V39 exists because Bitcode now needs the full enterprise Reading path to become commercially reliable.
V39 closes product runtime gaps across Depository supply indexing, Read Request capture, reviewable ReadNeed synthesis and resynthesis, Finding Fits across many candidate deposits, source-safe AssetPack preview, deterministic BTC quote, BTD rights transfer, post-settlement delivery, ledger/database/storage synchronization, repair, and interface parity.

## Accepted V39 decisions

- V38 remains active canon during V39 drafting.
- V39 gate branches are opened from `version/v39` and merged back only when their gate acceptance criteria are closed.
- V39 owns commercial Reading readiness across Terminal, Conversation, MCP/API, ChatGPT App, package contracts, Depository, ledger, database, storage, wallet, and delivery surfaces.
- V38 inference law remains binding: PTRR agent steps use `FailsafeGenerationSequence` above `ThricifiedGeneration`, tools are step-owned, prompt registry composition is preserved, and telemetry disclosure tiers govern all inference evidence.
- `ReadNeedComprehensionSynthesis` must become a persisted review/resynthesis loop whose accepted Need gates Finding Fits.
- `ReadFitsFindingSynthesis` must discover many candidate deposits above threshold before AssetPack synthesis and settlement handoff.
- Fit-finding must preserve the active OpenAI embedding policy (`text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors`) unless a replacement is explicitly specified, tested, and migrated.
- Source-bearing AssetPack delivery is forbidden before settlement unlock and BTD rights transfer.

## Explicitly deferred

- Production-mainnet value-bearing launch remains blocked.
- Bridge chain-of-record implementation remains deferred.
- V39 does not reopen BTD supply law, Exchange law, or Bitcoin settlement law except for inference and fit-finding traceability needed by AssetPack preview and post-settlement delivery.
- New LlamaIndex, Pinecone, or provider-specific search channels may be specified only after boundaries, credentials, storage, telemetry, and tests are explicit.

## Pre-Implementation Sequence

1. Open `version/v39` from promoted `main`.
2. Open `v39/gate-1-commercial-reading-roadmap-opening` from `version/v39`.
3. Create the V39 SPEC, DELTA, NOTES, and PARITY family while preserving `BITCODE_SPEC.txt -> V38`.
4. Refresh `SPECIFICATIONS_ROADMAP.md` so V38 is active canon, V39 is draft target, and post-V39 work remains coherent.
5. Retarget gate-quality and canon-quality workflow posture checks to V38 active / V39 draft.
6. Add `check:v39-gate1` and a V39 Gate 1 checker.
7. Define V39 gates, acceptance criteria, carryforward parity rows, and promotion boundaries.
8. Validate spec family, canonical inputs, canon posture, workflows, roadmap truth, README/docs, and diff hygiene.
9. Push the gate branch and open a pull request to `version/v39`.

## Commit-Body Direction

V39 gate commit bodies should describe the closed gate, product surface, pipeline/runtime changes, generated proof artifacts, tests, telemetry/disclosure boundaries, and accepted deferrals.
The eventual V39 promotion commit body must name all closed V39 gates, generated commercial Reading proof artifacts, Depository indexing evidence, ReadNeed and ReadFitsFinding runtime evidence, AssetPack preview/quote evidence, settlement/delivery evidence, telemetry/repair evidence, local/staging rehearsal proof, promotion workflow evidence, and the `BITCODE_SPEC.txt` pointer change from `V38` to `V39`.

## Gate Delta

### Gate 1: V39 Commercial Reading Roadmap And Spec Opening

Gate 1 opens V39 correctly:

- V39 SPEC, DELTA, NOTES, and PARITY files exist.
- `BITCODE_SPEC.txt` remains `V38`.
- README, roadmap, PR template, package docs, demonstration docs, and workflows describe V38 active / V39 draft posture.
- `check:v39-gate1` validates branch naming, spec family, notes, parity, roadmap truth, workflow posture, inference vocabulary, depository-search vocabulary, and promotion boundaries.
- The V39 gate list is explicit before inference implementation begins.

### Gate 2: Depository Supply Indexing And Searchable Deposit Lifecycle

Closure acceptance:

- deposited source materials are measurable, indexable, vector-searchable, metadata-searchable, rights-aware, and repairable;
- deposit lifecycle receipts bind repository/deposit anchors, measurement roots, embedding roots, ownership boundaries, and source-safe telemetry;
- `pnpm run check:v39-gate2` validates package-backed source, generated artifact freshness, tests, and workflow wiring without exposing protected source or credentials.

Closure implementation:

- V39 Gate 2 package source is `packages/pipelines/asset-pack/src/depository-supply-index.ts`.
- `DepositorySupplyIndex` and `DepositorySupplyRecord` normalize deposited source supply into source-safe lifecycle receipts with repository, branch, commit, proof, measurement, reconciliation readback, BTD range, depositor wallet, and source-safe search document roots.
- Source-safe search documents are lexical, metadata, measurement, and vector projections. They carry source-safe text roots, source path roots, symbol roots, constraint roots, and active vector policy metadata without protected source text.
- Vector projection preserves OpenAI `text-embedding-3-small`, 1536 dimensions, cosine `match_deliverable_vectors`; pending or invalid vector rows emit repair actions.
- Storage projection binds the retained physical `deliverables` and `deliverable_vectors` tables to the active AssetPack evidence semantics.
- `ReadFitsFindingSynthesis` consumes `DepositorySupplyIndex` through `depositorySupplyAssetsFromIndex`, preserving source-safe handoff into candidate recall and ranking.
- The deterministic artifact path is `.bitcode/v39-depository-supply-indexing.json`; `pnpm run check:v39-gate2` validates artifact freshness, protocol tests, package tests, source-safety markers, docs, and workflow wiring.

### Gate 3: Enterprise Reading UX State Machine

Closure acceptance:

- Terminal implements the five-step enterprise Reading flow: request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, buy and settle;
- each step has clear low-detail default UI and expandable source-safe detail;
- `pnpm run check:v39-gate3` validates state contracts, component tests, browser proof, and disclosure boundaries.

Closure implementation:

- Gate 3 defines `TerminalEnterpriseReadingUxState` as the Terminal-owned
  route/UI state contract for the five Reading stages.
- The state contract defaults to low-detail guidance, preserves expandable
  source-safe detail, and forbids protected source, raw protected prompts, raw
  provider responses, unpaid AssetPack source, wallet private material,
  private settlement payloads, and ledger write authority.
- Conversation handoff now serializes source-safe `readingStage` route intent
  and `terminalEnterpriseReadingStage` metadata while Terminal keeps authority.
- The Terminal workbench renders stable `terminal-enterprise-reading-step-*`
  stage rows, state chips, blockers, and source-safe detail accordions.
- `ReadFitsFindingSynthesis` telemetry continues to stream through the rich
  execution log with pipeline phase, PTRR, Failsafe, ThricifiedGeneration, tool,
  prompt, and schema metadata.
- The deterministic proof artifact is
  `.bitcode/v39-enterprise-reading-ux-state.json`; `pnpm run check:v39-gate3`
  validates artifact freshness, protocol tests, focused UAPI tests, source-safe
  disclosure, route contracts, stream-log integration, docs, and workflow
  wiring.

### Gate 4: ReadNeed Review, Resynthesis, And Admission Runtime

Closure acceptance:

- `ReadNeedComprehensionSynthesis` persists Read Requests, synthesized Needs, feedback, resynthesis attempts, Need measurements, accepted-Need admission, rejected-Need posture, and source-safe telemetry receipts;
- Finding Fits remains blocked until a reviewed Need is accepted;
- `pnpm run check:v39-gate4` validates pipeline contracts, storage, telemetry, UI, tests, artifact freshness, and workflow wiring.

Closure implementation:

- Gate 4 defines package-backed `ReadNeedReviewResynthesisRuntime` source,
  deterministic `.bitcode/v39-read-need-review-resynthesis.json`, pipeline
  runtime tests, route tests for `synthesize_read_need`,
  `resynthesize_read_need`, `accept_read_need`, and `reject_read_need`, and
  accepted-Need admission tests. Route payloads include `readNeedReviewRuntime`,
  `storageProjection`, `runtimeSummary`, and Finding Fits admission readback.

### Gate 5: ReadFitsFinding Runtime, Ranking, And Replay

Closure acceptance:

- Finding Fits uses inference-derived queries and depository search tools across lexical, symbolic, path, metadata, measurement, embedding/vector, and provider-specific channels;
- candidate deposits above threshold are ranked, verified, replayable, and traceable into selected-fit provenance;
- `pnpm run check:v39-gate5` validates search tools, embeddings, ranking, thresholding, replay receipts, tests, and generated evidence.

Closure implementation:

- Gate 5 defines package-backed `ReadFitsFindingRuntime` source,
  deterministic `.bitcode/v39-read-fits-finding-runtime.json`, package tests
  for many-fit search, blocked admission, storage projection, replay, and
  source-safe summaries, and protocol tests for the generated proof artifact.
  Runtime payloads include `ReadFitsFindingReplayReceipt`,
  `ReadFitsFindingStorageRecord`, `ReadFitsFindingTelemetryReceipt`, and
  `ReadFitsFindingRepairPosture`. The runtime binds accepted-Need admission,
  source-safe query plan, ranking evidence, selected-fit provenance, active
  embedding policy, and repair posture without exposing protected source or
  unpaid AssetPack source.

### Gate 6: AssetPack Preview, Quote, And Disclosure Boundary

Closure acceptance:

- source-safe AssetPack preview exposes measurements, fit reasons, selected-fit provenance, proof roots, quality posture, deterministic BTC quote, and delivery posture;
- source-bearing AssetPack content remains blocked until settlement unlock;
- `pnpm run check:v39-gate6` validates quote determinism, preview disclosure, leak scanning, tests, and generated evidence.

Closure implementation:

- Gate 6 package source is `packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts`.
- `AssetPackPreviewBoundary` persists source-safe preview, fit measurement, selected-fit provenance, deterministic BTC quote, disclosure review, settlement instructions, delivery posture, replay receipt, and repair posture records.
- `AssetPackPreviewQuoteReceipt` preserves the deterministic `sum(measurement.weight * measurement.volume * admitted_fit_quality)` share-to-fee formula with minimum sats, dust floor, quote root, and reader-wallet-before-broadcast posture.
- Focused package tests cover deterministic quote replay, blocked no-worthy-fit repair posture, protected-source leak fail-closed review, and postprocess storage projection.
- The generated proof artifact is `.bitcode/v39-assetpack-preview-quote-boundary.json`; `pnpm run check:v39-gate6` validates artifact freshness, protocol tests, package tests, source safety, docs, and workflow wiring.

### Gate 7: Settlement, BTD Rights Transfer, And Delivery

Closure acceptance:

- BTC settlement observation, finality, BTD rights transfer, source-to-shares compensation, post-settlement delivery, and repair paths are auditable;
- ledger, database, and object-storage projections remain synchronized or repairable;
- `pnpm run check:v39-gate7` validates settlement, rights, delivery, repair, and synchronization evidence.

Closure implementation:

- Gate 7 package source is `packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts`.
- `AssetPackSettlementRightsDeliveryBoundary` composes `BtdRightsTransferReceipt`, `BtdReadReceipt`, `SourceToSharesProof`, `AssetPackSettlementUnlock`, `LedgerDatabaseReconciliationReport`, and source-safe delivery unlock receipts.
- BTC payment observation, finality, source-to-shares conservation, BTD rights transfer, read receipt, delivery unlock, ledger/database/object-storage reconciliation, replay, repair, and storage projection records are persisted under `asset-pack/settlement`.
- Delivery unlock emits only proof and pull-request posture before source-bearing delivery is admitted to the paid Reader; the boundary never serializes protected source, private wallet material, private settlement payloads, credentials, raw protected prompts, raw provider responses, or unpaid AssetPack source.
- Focused package tests cover confirmed settlement delivery, underpayment blocking, missing finality blocking, projection drift repair, and persistence.
- The generated proof artifact is `.bitcode/v39-settlement-rights-delivery.json`; `pnpm run check:v39-gate7` validates artifact freshness, protocol tests, package tests, source safety, docs, staging-testnet project ref, and workflow wiring.

### Gate 8: Operational Telemetry, Repair, And Operator Readback

Closure acceptance:

- Reading telemetry streams source-safe phase, agent, step, Failsafe, ThricifiedGeneration, tool, storage, ledger, wallet, delivery, and UI events;
- operator readback binds proof roots, runbook hooks, repair commands, and failure posture;
- `pnpm run check:v39-gate8` validates telemetry contracts, UI readback, repair proof, and source-safe disclosure.

Closure implementation:

- Gate 8 package source is `packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts`.
- `ReadingOperationalTelemetryRepairReadback` emits `ReadingOperationalTelemetryEvent`, `ReadingOperationalOperatorReadback`, `ReadingOperationalTelemetryStorageRecord`, and `ReadingOperationalRepairRunbookHook` projections under `reading/operational`.
- Event kinds are phase, PTRR agent, PTRR step, Failsafe, ThricifiedGeneration, ToolExecution, storage, ledger, wallet, delivery, UI, and repair; each event carries proof roots plus prompt/result disclosure posture.
- The rich execution log and header accept direct Reading operational telemetry payloads and render pipeline, phase, agent, step, Failsafe, generation, tool, schema, event, proof, redaction, prompt disclosure, result disclosure, and fail-closed posture.
- Focused package tests cover complete settled stream coverage, BTC-finality repair, and persistence; focused UI tests cover direct Reading telemetry rendering.
- The generated proof artifact is `.bitcode/v39-operational-telemetry-repair-readback.json`; `pnpm run check:v39-gate8` validates artifact freshness, protocol tests, package tests, UI tests, docs, source safety, and workflow wiring.

### Gate 9: Interface And Conversation Product Parity

Closure acceptance:

- Conversation, MCP/API, ChatGPT App, and package-facing interfaces obey the same Reading authority as Terminal;
- no interface bypasses accepted-Need gating, source-safe preview, settlement unlock, BTD rights, or delivery boundaries;
- `pnpm run check:v39-gate9` validates interface contract tests, Conversation handoff tests, and no-bypass posture.

Closure implementation:

- `ReadingInterfaceProductParity` is implemented in `packages/pipelines/asset-pack/src/reading-interface-product-parity.ts` and persisted under `reading/interfaces`.
- Terminal, Conversation, public API, MCP API, ChatGPT App, and package consumers have parity rows with `sameAuthorityAsTerminal: true`, `parallelAuthorityCreated: false`, accepted-Need gating, source-safe preview, settlement unlock, BTD rights, and delivery-boundary checks.
- The parity primitive composes BTD interface catalog, read-license/AssetPack-rights contracts, telemetry proof hooks, and interface consumer UX proof roots.
- Focused package, Conversation, MCP, ChatGPT App, protocol, and checker tests cover no-bypass posture.
- The generated proof artifact is `.bitcode/v39-interface-conversation-product-parity.json`; `pnpm run check:v39-gate9` validates artifact freshness, protocol tests, package tests, interface tests, docs, source safety, and workflow wiring.

### Gate 10: Local And Staging Commercial Reading Rehearsal

Closure acceptance:

- local and staging-testnet rehearsals run the five-step Reading flow with real non-mocked inference where credentials are available;
- rehearsals cover Depository search, source-safe preview, telemetry streaming/readback, ledger/database/storage synchronization, PR delivery posture, and blocked production-mainnet value-bearing admission;
- `pnpm run check:v39-gate10` validates rehearsal evidence and workflow wiring.

Closure implementation:

- Gate 10 defines package-backed `ReadingLocalStagingRehearsal` source,
  deterministic `.bitcode/v39-local-staging-reading-rehearsal.json`, package
  tests, protocol tests, workflow wiring, and `check:v39-gate10`.
- The rehearsal binds local and staging-testnet lanes, the five Reading
  stages, many-fit Depository search, source-safe preview, deterministic BTC
  quote, settlement rights delivery, rich telemetry readback, interface
  no-bypass posture, and ledger/database/storage synchronization by proof
  roots.
- The staging-testnet lane is anchored to Supabase project
  `tkpyosihuouusyaxtbau` and REST host
  `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`; local/staging
  credentials remain in untracked env files or host runtime only.
- The artifact is source-safe metadata only: protected source, raw prompts,
  raw provider responses, unpaid AssetPack source, wallet private material,
  private settlement payloads, credentials, live log payloads, and
  value-bearing mainnet admission are all excluded.

### Gate 11: V39 Promotion Readiness

Closure acceptance:

- all V39 gates are closed;
- V39 generated proof appendix support exists;
- promotion workflow validates V39 and commits only the canonical pointer and generated promotion artifacts;
- `pnpm run check:v39-gate11` validates promotion readiness, source-safety, generated artifacts, and V39 draft posture preparation.

Closure implementation:

- Pending Gate 11 work must define the package-backed commercial Reading promotion readiness report, V39 promotion workflow, promotion command support, generated proof appendix support, active V39 / draft V40 post-promotion posture, and blocked value-bearing mainnet evidence.
- `V39CommercialReadingPromotionReadinessReport` is implemented in `packages/protocol/src/canonical/v39-commercial-reading-promotion-readiness-report.js` and generates `.bitcode/v39-promotion-readiness-report.json`.
- The generated artifact is `source-safe-commercial-reading-promotion-readiness-metadata` and covers all V39 Gate 2 through Gate 10 artifacts, `BITCODE_SPEC_V39_PROVEN.md` generation support, `v39-canon-promotion.yml`, gate/canon workflow posture, promotion dry-run support, source-safety checks, and value-bearing mainnet blocking.
- promotion scripts support V39 through `node scripts/promote-bitcode-canon.mjs --version V39 --commit HEAD --dry-run`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs --version V39 --next-draft V40`, `packages/protocol/src/canonical/proven-generator.js`, and `pnpm run check:v39-gate11`.
