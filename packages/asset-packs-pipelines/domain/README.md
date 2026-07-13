# AssetPack Pipeline

Canonical package owner for the Bitcode phased pipeline corridor.
This package turns a measured Bitcode Read into AssetPack synthesis artifacts,
Exchange-stored AssetPack evidence, and optional connected-interface
delivery-mechanism artifacts.

Active route and payload seams use Bitcode nouns: `definitionOfRead`, `read`,
`writtenAssetType`, `writtenAssets`, `Finish`, `Delivering`, and `SDIVF`.
Compatibility payload keys are subordinate mirrors and do not define product
semantics.

## SDIVF Shape

1. **Preprocess** - normalize the Read, source revision, delivery semantics, and depository search/ranking evidence.
2. **Setup** - repository context, Read comprehension, LSP/static measurement, and danger-wall admission.
3. **Discovery** - source-grounded research, codebase search, file selection, and approach planning.
4. **Implementation** - AssetPack synthesis artifacts using Divide, Apply, and Correct agents.
5. **Validation** - Read satisfaction, proof posture, and readiness-to-Finish checks.
6. **Finish** - save result state, summarize AssetPack evidence, and run Delivering when requested.

The `Discovery -> Implementation -> Validation` loop may iterate up to the
configured limit before Finish.

## Runtime Structure

```text
AssetPackPipeline (SDIVF with DIV iteration)
├── Preprocess
│ ├── Read and source-revision normalization
│ ├── Depository Finding Fits discovery
│ ├── Source-bound ranking
│ └── Fit result-state evidence
├── Setup
│ ├── VCS repository context
│ ├── Read comprehension
│ ├── LSP/static measurement
│ └── Danger-wall admission
├── [DIV loop]
│ ├── Discovery
│ ├── Implementation
│ └── Validation
└── Finish
 ├── Save AssetPack synthesis artifacts and Exchange evidence
 ├── Produce AssetPack completion summary
 └── Deliver AssetPacks or AssetPackPartials to connected destinations
```

## Usage

```typescript
import { assetPackPipeline } from '@bitcode/asset-packs-pipelines-domain';

const result = await assetPackPipeline({
 read: 'Add user authentication with JWT',
 repository: {
 url: 'https://github.com/acme/app',
 branch: 'main',
 },
 writtenAssetType: 'read-satisfaction-asset-pack',
 deliveryMechanismTemplate: 'pull-request',
}, execution);
```

## Depository Search

`runDepositorySearchForPipelineInput` is the package-level primitive for
commercial Read/Fit finding over deposited AssetPack supply. It normalizes
`depositoryAssets`, `depositCandidates`, or manifest-only `deposit` +
`sourceRevision` inputs, ranks candidates with deterministic lexical, unit,
repository, revision, artifact-kind, proof, and measurement signals, and stores:

- `depository/search.result`
- `depository/search.candidateRanking`
- `depository/search.selectedCandidates`
- `depository/search.embeddingPolicy`
- `fit.result`
- `fit.resultState`
- `fit.resultReasons`

Result states are fail-closed:

- `worthy_fit` only when a selected candidate is source-bound, semantically
 relevant, proof-bearing, and measurement-bearing.
- `no_worthy_fit` when searched deposits do not satisfy the Read.
- `blocked_readiness` when the Read is too broad, no depository assets are
 available, candidate evidence is missing proof/measurement, or mock/frontier
 leakage is detected.

Search providers can be added through the `DepositorySearchProvider` interface.
The default lexical provider is deterministic so QA can prove ranking and result
state without relying on model availability.

## Depository Supply Index

`buildDepositorySupplyIndex` is the source-safe package primitive that turns
deposited repository/material supply into searchable Depository records before
Finding Fits runs. A `DepositorySupplyIndex` contains `DepositorySupplyRecord`
entries with repository, branch, commit, proof root, measurement root,
reconciliation readback root, BTD range, depositor wallet boundary, source-safe
search documents, vector projection rows, storage readback posture, source-safe
compensation preview, and repair actions.

The index deliberately keeps protected source outside the serialized record.
Lexical, metadata, measurement, and vector search documents use source-safe
titles, summaries, paths, symbol names, stack tags, constraints, and roots.
Rows with missing or invalid embeddings remain visible as repair posture through
`sync-active-embedding-vector-rows`; they are not treated as a fully searchable
vector corpus.

Each supply record also carries a `DepositorySupplyCompensationPreview`. That
preview tells the depositor how BTC can later route back through
source-to-shares if the deposit is selected into a paid AssetPack, while making
the pre-fit boundary explicit: deposit admission does not mint BTD, does not
transfer BTD rights, and does not expose protected source or unpaid
source-bearing AssetPack content. The preview records compensation route roots,
source-to-shares preview roots, ledger account keys such as pending claims and
eligible compensation routes, and repair posture when a depositor wallet,
proof, measurement, or searchability requirement is missing.

`depositorySupplyAssetsFromIndex` converts indexed records into source-safe
`DepositoryAsset` candidates for `ReadFitsFindingSynthesis`. This handoff lets
Finding Fits rank Depository supply without importing raw source text, unpaid
AssetPack source, credentials, wallet private material, or private settlement
payloads before the settlement boundary.

## ReadNeed review runtime

`ReadNeedReviewResynthesisRuntime` is the source-safe package primitive that
turns `ReadNeedComprehensionSynthesis` output into review-loop storage and
telemetry records. It projects the Read Request, current synthesized Need,
feedback history, resynthesis attempts, Need measurement inputs,
accepted-Need admission, rejected-Need posture, and telemetry receipts into
PipelineExecution-compatible storage records.

Finding Fits is admitted only when `acceptReadNeed` has produced an accepted
Need. Rejected or still-unreviewed Needs emit blockers and preserve feedback
for resynthesis. The runtime never serializes protected source, raw protected
prompts, raw provider responses, unpaid AssetPack source, credentials, wallet
private material, or private settlement payloads.

V42 Gate 4 binds this runtime into product closure through
`.bitcode/v42-readneed-review-resynthesis-product-closure.json` and
`check:v42-gate4`. That proof requires all four review actions
(`synthesize_read_need`, `resynthesize_read_need`, `accept_read_need`,
`reject_read_need`), PTRR/Failsafe/Thricified telemetry receipts, source-safe
storage projection, accepted-Need admission, rejected Need blockers, and
Terminal runtime readback before Finding Fits can run.

## ReadFitsFinding Runtime

`ReadFitsFindingRuntime` is the source-safe package primitive that turns
`ReadFitsFindingSynthesis` depository search into replayable commercial
evidence. It projects accepted-Need admission, source-safe query plans, search
channels, candidate ranking, selected-fit provenance, fit result evidence,
replay receipt, repair posture, and telemetry receipt records into
PipelineExecution-compatible storage.

The runtime preserves the active embedding policy
(`text-embedding-3-small`, 1536 dimensions, cosine
`match_deliverable_vectors`) and records a `ReadFitsFindingReplayReceipt` that
verifies query-plan, query, ranking, selected-fit provenance, embedding, and
candidate-count roots. It never serializes protected source, raw protected
prompts, raw provider responses, unpaid AssetPack source, credentials, wallet
private material, or private settlement payloads.

## AssetPack Preview Boundary

`AssetPackPreviewBoundary` is the source-safe package primitive that turns a
worthy Finding Fits result into a buyer-reviewable preview without
crossing the unpaid source boundary. It composes `AssetPackSourceSafePreview`,
selected-fit provenance, `AssetPackPreviewQuoteReceipt`,
`AssetPackDisclosureReview`, `AssetPackPreviewSettlementInstructions`,
`AssetPackPreviewDeliveryPosture`, `AssetPackPreviewReplayReceipt`, and repair
posture.

The deterministic quote uses the active share-to-fee formula
`sum(measurement.weight * measurement.volume * admitted_fit_quality)` with the
Need measurement vector, admitted fit quality, weighted admitted volume,
minimum sats, dust floor, and reader-wallet-before-broadcast posture. The
preview can show fit measurements, proof roots, quality reasons, score band,
selected fit deposit ids, quote, settlement instructions, and delivery posture.
It cannot show protected source, raw protected prompts, raw provider responses,
wallet private material, private settlement payloads, credentials, or unpaid
source-bearing AssetPack content. Pull-request delivery remains withheld until
BTC settlement, BTD rights transfer, and ledger/database/storage readback agree.

V42 Gate 5 binds this boundary into product closure through
`.bitcode/v42-readfitsfinding-preview-quote.json` and `check:v42-gate5`.
That proof requires accepted-Need admission, many-channel Depository search,
candidate ranking, selected-fit provenance, deterministic quote receipts,
source-safe disclosure review, settlement instructions, delivery lock, harness
route summaries, Terminal preview/quote/provenance readback, and focused
package/API/protocol tests before the paid boundary can proceed to Gate 6.

## Settlement Rights Delivery

`AssetPackSettlementRightsDeliveryBoundary` is the paid-boundary package
primitive that follows a source-safe preview. It observes BTC payment against
the deterministic quote, binds finality, allocates source-to-shares
compensation across selected fit deposits, builds BTD rights transfer and paid
read receipts, verifies settlement unlock readback, reconciles ledger,
database, and object-storage projections, and admits pull-request delivery only
when those receipts agree.

The boundary persists `asset-pack/settlement` records for payment observation,
finality, source-to-shares compensation, BTD receipts, delivery unlock,
ledger/database/storage reconciliation, replay, and repair posture. Its
serialized form is source-safe metadata: it may record that source-bearing
delivery is unlocked for the paid Reader, but it never serializes protected
source, raw protected prompts, raw provider responses, wallet private material,
private settlement payloads, credentials, or unpaid source-bearing AssetPack
content.

V42 Gate 6 binds Settlement Rights Delivery into product closure through
`.bitcode/v42-settlement-rights-delivery.json` and `check:v42-gate6`.
That proof requires paid BTC observation, finality gating, BTD rights transfer,
source-to-shares conservation, repository delivery unlock,
ledger/database/object-storage reconciliation, live harness materialization,
route readback, Terminal readback, focused package/API/protocol tests, and
source-safe docs before the paid AssetPack can cross the Reader visibility
boundary.

## Operational Telemetry Repair Readback

`ReadingOperationalTelemetryRepairReadback` is the source-safe package
primitive that makes the Reading flow observable and repairable after the
Need, Finding Fits, preview, settlement, and delivery boundaries have emitted
their receipts. It projects phase, PTRR agent, PTRR step,
`FailsafeGenerationSequence`, `ThricifiedGeneration`, `ToolExecution`,
storage, ledger, wallet, delivery, UI, and repair posture into
`ReadingOperationalTelemetryEvent` rows.

The operator readback persists under `reading/operational` with
`operatorReadback`, `streamEvents`, `runbookHooks`, `telemetryRoot`,
`repairRoot`, and `readbackRoot`. Events carry event ids, proof roots,
prompt-template identity, output schemas, return types, redaction posture,
prompt disclosure posture, result disclosure posture, and fail-closed state.
They are designed for the shared rich execution log, which can show compact
source-safe rows and expandable metadata without showing protected source,
raw protected prompts, raw interpolated prompts, raw provider responses,
unpaid AssetPack source, wallet private material, private settlement payloads,
or credentials.

## Interface Product Parity

`ReadingInterfaceProductParity` is the source-safe package primitive that
keeps Terminal, Conversation, public API, MCP API, ChatGPT App, and
package-facing consumers on one Reading authority. Terminal remains the
transaction authority. Conversation is a Terminal-delegated handoff. Package
consumers receive contract readback only. API, MCP, and ChatGPT surfaces reuse
BTD interface catalog, read-license/AssetPack-rights, telemetry hook, and
consumer UX proof roots.

The parity rows are persisted under `reading/interfaces` with `productParity`,
`parityRows`, `noBypassReadback`, `interfaceRoots`, `sourceSafety`, and
`parityRoot`. Each row proves accepted-Need gating, Finding Fits admission,
source-safe preview, settlement unlock, BTD rights, authorized delivery, no
parallel authority, and source-bearing delivery locked before settlement and
rights transfer. The source-safe artifact is
`.bitcode/v39-interface-conversation-product-parity.json`, checked by
`pnpm run check:v39-gate9`.

## Reading Local/Staging Rehearsal

`ReadingLocalStagingRehearsal` is the source-safe package primitive that binds
local and staging-testnet rehearsal readback to the complete five-step Reading
flow: request read, review synthesized Need, request Finding Fits, review
source-safe AssetPack preview, and buy/settle. It composes
`ReadNeedReviewResynthesisRuntime`, `ReadFitsFindingRuntime`,
`AssetPackPreviewBoundary`, `AssetPackSettlementRightsDeliveryBoundary`,
`ReadingOperationalTelemetryRepairReadback`, and
`ReadingInterfaceProductParity` by proof root.

The rehearsal rows are persisted under `reading/rehearsal` with
`localStagingRehearsal`, `rehearsalRows`, `laneReadback`, `stageReadback`,
`sourceSafety`, and `proofRoots`. Staging-testnet is anchored to Supabase
project `tkpyosihuouusyaxtbau` and REST host
`https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`. Generated rehearsal
evidence is metadata only: protected source, raw protected prompts, raw
interpolated prompts, raw provider responses, unpaid AssetPack source, wallet
private material, private settlement payloads, credentials, and live log
payloads are not serialized. Value-bearing mainnet admission remains blocked.
The source-safe artifact is `.bitcode/v39-local-staging-reading-rehearsal.json`,
checked by `pnpm run check:v39-gate10`.

V42 Gate 8 reuses `ReadingLocalStagingRehearsal` as the package proof body for
the reliable MVP local/staging full rehearsal. The V42 artifact
`.bitcode/v42-local-staging-mvp-rehearsal.json` binds that package model to
the closed V42 Depositing, Reading state, ReadNeed review/resynthesis, Finding
Fits preview/quote, settlement rights delivery, and AI-reading demonstration
artifacts. Use `pnpm run rehearse:v42-local-staging` for source-safe operator
receipts and `pnpm run check:v42-gate8` for the full proof. Staging-testnet is
bound to Supabase project `tkpyosihuouusyaxtbau`; value-bearing mainnet stays
blocked, and generated rehearsal material remains metadata-only.

### Vector Embedding Contract

Depository vector recall uses the shared AssetPack embedding contract:

- provider: OpenAI embeddings API
- default model: `text-embedding-3-small`
- request shape: `{ model, input, encoding_format: 'float', dimensions: 1536 }`
- storage dimensions: `1536`
- max input: `8192` tokens per embedding request
- vector store: `deliverable_vectors.embedding`
- match RPC: `match_deliverable_vectors`
- distance/index: cosine similarity through `ivfflat` with `vector_cosine_ops`

`BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_MODEL` and
`BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_DIMENSIONS` may override the model and
dimension only for a rebuilt vector space. Mixed model/dimension rows are not a
commercially admissible search corpus. The default remains dimension-compatible
with the existing Supabase `vector(1536)` schema.

## Canonical Boundary

The package root and `runSDIVFPipeline` are the active AssetPack entry points.
The active phase registry is SDIVF and Finish-owned; non-Finish phase aliases
are not active product semantics.
