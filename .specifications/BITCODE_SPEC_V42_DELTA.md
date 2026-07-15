# Bitcode Spec V42 Delta

## Status

- Version: `V42`
- V42 state: canonical promotion complete; this delta records the promoted V41-to-V42 reliable MVP experience closure set
- Current canonical/latest target: `V42`
- Canonical proof-source commit: `5c9c0270b9d864fe13b7e0a429700e1c9a7689d9`
- Prior canonical anchor: `BITCODE_SPEC_V41.md`
- Prior generated proof appendix: `BITCODE_SPEC_V41_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v42-spec-family-report.json`, `.bitcode/v42-canonical-input-report.json`, `.bitcode/v42-canon-posture-drift-report.json`, `.bitcode/v42-depositing-shortest-path.json`, `.bitcode/v42-reading-shortest-path-state-machine.json`, `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, `.bitcode/v42-readfitsfinding-preview-quote.json`, `.bitcode/v42-settlement-rights-delivery.json`, `.bitcode/v42-ai-reading-demonstration.json`, `.bitcode/v42-local-staging-mvp-rehearsal.json`, `.bitcode/v42-promotion-readiness-report.json`, V42 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V42_PROVEN.md` as the generated proof appendix for V42 promotion
- Source parity state: V42 source-side Depositing shortest path, Reading shortest path state machine, ReadNeed review/resynthesis closure, ReadFitsFinding preview and quote closure, settlement rights delivery, AI-reading demonstration, local/staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V42 file family
- Scope: V42 canonical delta for reliable MVP experience over promoted V41 prompt-program excellence canon

## Why V42 exists

V42 turns the promoted V39 Reading product, V40 testing depth, and V41 prompt-program excellence into a reliable MVP enterprise experience.
The version focuses on shortest-path Depositing, shortest-path Reading, settlement-gated AssetPack delivery, depositor compensation visibility, and an AI-reading dominant demonstration that proves AssetPacks improve an AI system beyond public-data-only baseline performance.

## Accepted V42 decisions

- V42 starts from active `V41` canon and keeps `BITCODE_SPEC.txt` at `V41` until promotion.
- V42 product work stays unversioned in source paths.
- Depositing must minimize the path to Depository admission proof and future compensation visibility.
- Reading must use five product steps: request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, and buy/settle/deliver AssetPack.
- `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` remain the formal Reading pipeline names.
- Source-bearing AssetPack content remains withheld until BTC settlement, BTD rights transfer, and storage/delivery reconciliation.
- The demonstration remains self-contained in `protocol-demonstration/` and must prove AI-reading value without importing commercial code.

## V42 gate plan

### Gate 1: MVP Experience Roadmap And Spec Opening

Open the V42 full specification family, roadmap, package script, workflow posture, documentation posture, branch convention, and checker.

### Gate 2: Depositing Shortest Path And Compensation Visibility

Implement and prove the shortest path from source material to Depository admission proof and later compensation readback.
Gate 2 now binds Depository admission proof to a source-safe compensation route preview, route/API readiness, Depository search documents, vector/storage projection, source-to-shares readback keys, Terminal activity/history/readback fields, and `.bitcode/v42-depositing-shortest-path.json`.
The compensation preview is deliberately pre-mint: it records BTC/source-to-shares eligibility if the deposit is selected into a later paid AssetPack, but it does not mint BTD, transfer rights, expose source, or allocate BTC before accepted Need-Fit and settlement.

### Gate 3: Reading Shortest Path State Machine

Implement and prove the five-step Reading product state machine with low-detail defaults and expandable proof/telemetry detail.
Gate 3 now binds route-owned Reading state to transaction recovery, `readingStage` route hydration, retry/restart posture, source-safe failure repair, accepted-Need blockers, source-safe preview blockers, rich execution stream readback, and `.bitcode/v42-reading-shortest-path-state-machine.json`.
The state machine keeps Terminal guided by default while preserving proof-on-expand detail for operators.

### Gate 4: ReadNeed Review And Resynthesis Product Closure

Implement and prove reviewed synthesized Need flow, feedback/resynthesis, accepted-Need admission, storage projection, telemetry, and UI readback.
Gate 4 now binds `ReadNeedReviewResynthesisRuntime` (`readNeedReviewRuntime` route payloads), all four ReadNeed actions, source-safe storage projection, accepted and rejected review states, PTRR/Failsafe/Thricified telemetry receipts, Terminal runtime/storage/telemetry readback, `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, and `check:v42-gate4`.

### Gate 5: ReadFitsFinding AssetPack Preview And Quote Closure

Implement and prove many-candidate Depository search, selected-fit provenance, source-safe AssetPack preview, deterministic BTD/BTC quote, and no pre-settlement source leakage.
Gate 5 now binds `ReadFitsFindingRuntime`, many-channel Depository search, `AssetPackPreviewBoundary`, quote receipt readback, selected-fit provenance, settlement instructions, delivery posture, harness evidence summaries, Terminal preview/quote/provenance rows, `.bitcode/v42-readfitsfinding-preview-quote.json`, and `check:v42-gate5`.

### Gate 6: Settlement Rights Transfer And Repository Delivery Closure

Implement and prove purchase, settlement observation, BTD rights transfer, source unlock, repository pull request delivery, compensation accounting, and repair posture.
Gate 6 now binds settlement rights transfer through `AssetPackSettlementRightsDeliveryBoundary` to the live harness, route summary, Terminal readback, source-to-shares conservation, BTD read/right receipts, and ledger/database/object-storage reconciliation through `.bitcode/v42-settlement-rights-delivery.json`.

### Gate 7: AI-Reading Dominant Demonstration MVP

Implement and prove the standalone demonstration where deposited technical intelligence improves an AI system beyond a public-data-only baseline.
Gate 7 now binds the local AI-reading demonstration runtime, public-data-only baseline, reviewed Need, local Depository fit selection, source-safe AssetPack preview, AssetPack-enhanced answer, deterministic basis-point uplift, settlement-gated source boundary, `.bitcode/v42-ai-reading-demonstration.json`, and `check:v42-gate7`.

### Gate 8: Local And Staging-Testnet Full MVP Rehearsal

Run and prove the complete MVP path locally and in staging-testnet with value-bearing mainnet blocked.
Gate 8 now binds staging-testnet full MVP rehearsal to the local lane, Vercel Sandbox operator receipt posture, Supabase project `tkpyosihuouusyaxtbau`, Gates 2 through 7 generated artifacts, `ReadingLocalStagingRehearsal`, source-safe telemetry/database readback, ledger/database/storage reconciliation, post-settlement repository delivery, `.bitcode/v42-local-staging-mvp-rehearsal.json`, `rehearse:v42-local-staging`, and `check:v42-gate8`.
The rehearsal artifact is metadata only and does not serialize secrets, protected source, raw prompts, raw provider responses, unpaid AssetPack source, wallet private material, private settlement payloads, or live rehearsal logs.

### Gate 9: V42 Promotion Readiness

Bind every V42 product artifact, workflow, generated proof, promotion command, source-safety result, and active V42 / draft V43 runtime posture.
Gate 9 now closes through `.bitcode/v42-promotion-readiness-report.json`.
The report proves all V42 gate artifacts are covered, parseable, source-safe, workflow-bound, generated-proof-bound, and blocked from value-bearing mainnet admission.
The promotion scripts support V42 through `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, and `.github/workflows/v42-canon-promotion.yml`.
After promotion, the maintained runtime posture is V42 active / draft V43.

## Explicitly deferred

- V43+ agentic deposit AssetPack option synthesis remains deferred.
- `/terminal` is not split into `/read` and `/deposit` during V42.
- `/exchange` is not renamed to `/packs` during V42.
- V43+ must take the route-vocabulary cleanup seriously: `/packs` replaces Exchange as the searchable master-detail activity route, including route names, component prefixes, tests, docs, and product vocabulary, while `/read` and `/deposit` become the short core paths for buying and selling AssetPacks.
- `/packs` must cover all pack activity, including deposited AssetPack options, Depository admission, Finding Fits previews, settled Need-Fit AssetPacks, quotes, rights transfers, compensation posture, delivery, proofs, and repair.
- `/packs` master view must support column sorting, filtering, and search over measurements, synthesized AssetPack titles and descriptions, values, activity or transaction type, settlement posture, compensation state, and proof roots; the detail view must expose selected source-safe activity data with expandable telemetry, ledger, database, storage, and proof metadata.
- `/deposit` must evolve beyond manual admission into an agentic connected-repository flow where Bitcode proposes source-safe deposit AssetPack options from enterprise code, depositor instructions, Depository state, and Reading demand; enterprises review measurements, likely demand, likely positive ROI, and sub-criticality before approval.
- `/read` must own the shortest Reading path without requiring the old Terminal cockpit as the default experience.
- Outside public documentation, product copy should not compensate for unclear flows with self-referential explanations; V43+ UX should use route structure, concise labels, progressive disclosure, and rich reusable themed components to make core behavior legible.
- Production-mainnet value-bearing operation remains blocked unless a later promoted canon explicitly admits it.
- V42 Gate 1 does not change route behavior, pipeline behavior, settlement behavior, or demonstration behavior.

## Pre-Implementation Sequence

1. Open `version/v42` and `v42/gate-1-mvp-experience-roadmap-opening`.
2. Keep `BITCODE_SPEC.txt` at `V41`.
3. Add the V42 spec family and Gate 1 checker.
4. Update roadmap, docs, package scripts, and workflows for active V41 / draft V42.
5. Validate V42 draft family and V41 active posture.

## Commit-Body Direction

V42 commits should name the product path, protocol object, pipeline or route ownership, source-safety boundary, generated artifact or checker, and tests run.
