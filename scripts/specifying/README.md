<!-- Lives at scripts/specifying (repo metadevelopment tooling, not a product package). -->

# @bitcode/specifying

> **Naming law (V48):** the whole monorepo **is** Bitcode protocol canon.
> This package is **`@bitcode/specifying`** — executable gate proof generators,
> canon posture, promotion helpers, and a transitional demo-engine bridge still
> used by a few UAPI routes. It is **not** a product package named “protocol.”
> Specifying *law* lives in root `BITCODE_SPECIFYING.md`; this package is the
> commercial *machine* that generates/checks `.proofs/*` artifacts and gate proofs.

Bitcode specifying tooling package (gate generators, canon posture, transitional demo-engine bridge). The monorepo itself is protocol canon.

**Meta specifying (historical freeze):** promoted version specs, proofs, and
version-bound checks are **immutable canon-at-that-time** — they must not be
edited to chase later tree moves. The **living full-system check** is only for
the current draft/active pointer and must be all-encompassing and completely
correct for present sole-canon. See `BITCODE_SPECIFYING.md` §4.3 and §13.1.
Era-pin shims under `test/era-pinned-*.js` skip superseded historical package
proofs with reason; they do not rewrite those proofs.

V29 Gate 8 made this package the package-native boundary for canonical helpers
that were originally ported from the standalone `protocol-demonstration`
witness. Commercial scripts, API/runtime code, and workflow checks must import
canon posture, spec-family checks, canonical-input checks, canon-drift checks,
and proven-generation helpers from `@bitcode/specifying` or
`scripts/specifying/src/index.js`.

The standalone `protocol-demonstration/` tree is **removed** (V48). Do not
reintroduce it. Historical specs may still mention it; living checks must not
require it.

Current exported commercial helpers include:

- active/draft canon posture (`V47` active, `V48` draft after V47 promotion);
- spec-family and canonical-input validation helpers;
- canon-posture drift reporting;
- `DocumentationSurfaceCatalog` helpers for V35 documentation surface proof;
- `TelemetryTaxonomyCatalog` helpers for V35 source-safe event family and redaction posture proof;
- `PublicDocsUsageGuideCatalog` helpers for V35 source-safe public docs usage and disclosure-boundary proof;
- `OperatorRunbookCatalog` helpers for V35 dashboard, alert, runbook, incident, and escalation proof;
- `DocsQaAlignmentReport` helpers for V35 code/spec/docs/proof/artifact/workflow alignment proof;
- `TestnetRolloutReadinessGuide` helpers for V35 contributor, operator, enterprise reader, depositor, interface consumer, lane, settlement caveat, blocker, and rehearsal rollout proof;
- `TelemetryDocumentationInterfaceIntegration` helpers for V35 product, Auxillaries, API, MCP API, ChatGPT App, package README, internal docs, and public docs event/proof/docs/runbook/redaction proof;
- `LocalStagingTelemetryDocumentationRehearsal` helpers for V35 local/staging-testnet documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA, incident drill, source-safe proof-root review, redacted screenshot/log roots, and blocked value-bearing mainnet proof;
- `ExchangeActivityBook` helpers for V36 market-wide activity rows, filters, detail sections, proof roots, event ids, redaction posture, and ledger/database projection references;
- `ExchangeIntent` and `ExchangeOrder` helpers for V36 buy/sell/bid/ask/cancel/accept/settle/history transition contracts, authority, idempotency, policy, fail-closed, replay, and source-safety posture;
- `ExchangeRightsTransferPreview` helpers for V36 BTD range identity, current owner, requested buyer, rights scope, settlement unlock, disclosure limit, owner-read, licensed-read, blocked transfer, and source-safety posture;
- `ExchangePricingQuote` helpers for V36 BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, quote root, and source-safety posture;
- `ExchangeSettlementReceipt` helpers for V36 payment observation, finality, rights-transfer receipt, ledger/database/object-storage reconciliation, delivery state, repair id, and source-safety posture;
- `ExchangeDisputeRepairCase` and `ExchangeRevenueRoute` helpers for V36 repair, escalation, revenue conservation, route allocation, and source-safety posture;
- `ExchangeUxProof` helpers for V36 Exchange route usability, product handoff, collapsed readable status, expanded source-safe detail, and telemetry dashboard proof roots;
- `ExchangeRehearsal` helpers for V36 local/staging-testnet Exchange rehearsal coverage, source-safe log/screenshot roots, ledger/database synchronization checks, and blocked value-bearing mainnet proof;
- `ConversationSession` route-history helpers for V37 route-local session identity, create/restore/branch/retry/redact/stream operations, proof roots, event ids, and persistence boundaries;
- `ConversationStreamEvent` helpers for V37 model deltas, tool calls, retrieval summaries, proof roots, retry states, completion decisions, error rows, collapsed readable status, expanded metadata, redaction posture, prompt/result disclosure posture, and fail-closed stream telemetry;
- `ConversationWritingWorkspace` helpers for V37 Read Request, Need feedback, AssetPack review note, and product handoff summary drafting modes, save/restore/summarize/handoff actions, route-local draft keys, keyboard/responsive fullscreen behavior, recovery states, proof roots, event ids, and source-safe handoff summaries;
- `ConversationSourceSelector` helpers for V37 repository, branch, commit, deposit, BTD range, AssetPack preview, document, and prior conversation selectors governed by account, organization, wallet, rights, settlement, disclosure, and policy posture with allowed, denied, and retry-required source-safe preview states;
- `ConversationProductHandoff` helpers for V37 Depositing, Reading, Finding Fits, Exchange, settlement, and delivery handoff workflows with conversation id, transaction id, repository anchor, source selector refs, source-safe summary, policy result, product route, transaction detail, proof roots, event ids, ledger boundary, wallet boundary, and product cockpit authority posture;
- `ConversationPersistencePrivacyRedaction` helpers for V37 public, user-visible, organization-visible, buyer-visible, reviewer-visible, and operator-only visibility tier separation, persist/restore/export/delete/retention/replay/incident repair postures, proof roots, event ids, and source-safe durable storage privacy;
- `ConversationTelemetryProofHooks` helpers for V37 session, message, stream, tool, source selector, product handoff, retry, error, and completion telemetry families with source-safe dashboard panels, runbook ids, correlation ids, proof roots, redaction posture, and protected-payload exclusion;
- `ConversationRehearsal` helpers for V37 local/staging-testnet conversation rehearsal coverage, source-safe log/screenshot roots, route/UI checks, telemetry roots, and blocked value-bearing mainnet proof;
- `V38InferenceSurfaceInventory` helpers for V38 Reading, Conversation, tool-definition prompt, interface entrypoint, prompt registry, and execution primitive inference-surface inventory;
- `V38PtrrFailsafeThricifiedStack` helpers for V38 practical PTRR agent stack proof, FailsafeGenerationSequence over ThricifiedGeneration binding, step-owned tool boundaries, source predicates, and source-safe generated metadata;
- `V38PromptBenchmarkReport` helpers for V38 source-safe PromptPart and complete Prompt benchmark coverage across Reading, Conversation, and tool-definition inference surfaces;
- `V38InferenceTelemetryDisclosureReport` helpers for V38 source-safe inference telemetry rows, disclosure tiers, raw provider response boundaries, schema verdicts, retry/repair posture, and rich stream UI/storage projection proof;
- `V38ReadFitsFindingSearchEmbeddings` helpers for V38 source-safe Finding Fits query plans, depository search channels, embedding policy, threshold ranking, selected-fit provenance, and search receipts;
- `V38InferencePromotionReadinessReport` helpers for V38 source-safe promotion readiness across inference artifacts, generated proof support, workflow posture, and V38 active / V39 draft runtime preparation;
- `V39DepositorySupplyIndexing` helpers for V39 source-safe Depository supply records, search documents, vector projections, storage readback posture, rights boundaries, repair actions, and Finding Fits handoff;
- `V39EnterpriseReadingUxState` helpers for V39 source-safe Reading stages, low-detail defaults, expandable detail, Conversation `readingStage` handoff, rich stream-log integration, component tests, and opt-in browser proof workflow posture;
- `V39ReadNeedReviewResynthesis` helpers for V39 source-safe ReadNeed review, feedback/resynthesis lineage, accepted-Need admission, rejected-Need posture, runtime storage projection, and telemetry receipt proof;
- `V39ReadFitsFindingRuntime` helpers for V39 source-safe Finding Fits runtime storage, many-candidate ranking, selected-fit provenance, replay receipts, repair posture, and active embedding policy proof;
- `V39AssetPackPreviewQuoteBoundary` helpers for V39 source-safe AssetPack preview, deterministic share-to-fee BTC quote, disclosure leak scanning, settlement instructions, delivery lock, replay receipt, and repair posture proof;
- `V39InterfaceConversationProductParity` helpers for V39 source-safe product, Conversation, public API, MCP API, ChatGPT App, and package-consumer Reading parity with no parallel authority or delivery bypass;
- `V39CommercialReadingPromotionReadinessReport` helpers for V39 source-safe commercial Reading promotion readiness across all V39 Reading artifacts, generated proof support, workflow posture, promotion dry-run support, and active V39 / draft V40 runtime preparation;
- `V41PromptPartPromptInventory` helpers for V41 source-safe raw PromptPart and composed Prompt catalogue rows, registry owners, prompt families, template variables, benchmark fixture ids, validation commands, and V42 MVP roadmap posture;
- `V41RegistryInterpolationContracts` helpers for V41 source-safe registry composition, interpolation key, execution ancestry, tool prompt injection, context handling, and parser target contracts;
- `V41ReadingPromptBenchmarkBaselines` helpers for V41 source-safe Reading prompt baseline rows across `ReadNeedComprehensionSynthesis`, `ReadFitsFindingSynthesis`, all five Reading UX steps, V38 benchmark fixtures, Gate 2 inventory roots, Gate 3 registry/interpolation roots, parser targets, deterministic scores, and source-safe disclosure tiers;
- `V41PromotionReadinessReport` helpers for V41 source-safe prompt-program promotion readiness across all V41 prompt artifacts, generated proof support, workflow posture, promotion dry-run support, and active V41 / draft V42 runtime preparation;
- `V42SettlementRightsDelivery` helpers for V42 source-safe BTC payment observation, finality gating, source-to-shares compensation, BTD read-right transfer, repository delivery unlock, ledger/database/object-storage reconciliation, product readback, and source-safe paid-boundary proof;
- `V42AiReadingDemonstration` helpers for V42 source-safe AI-reading demonstration proof: public-data-only baseline, reviewed local Need, local Finding Fits, source-safe AssetPack preview, AssetPack-enhanced AI answer, deterministic benchmark uplift, self-contained demonstration boundary, and workflow wiring;
- `V42LocalStagingMvpRehearsal` helpers for V42 source-safe local/staging-testnet full MVP rehearsal proof across Depositing, Reading, Finding Fits, preview/quote, settlement, BTD rights transfer, repository delivery, AI-reading uplift, telemetry/database readback, operator receipts, and blocked value-bearing mainnet;
- `V42PromotionReadinessReport` helpers for V42 source-safe promotion readiness across all V42 reliable MVP artifacts, generated proof support, workflow posture, promotion dry-run support, value-bearing mainnet blocking, and `V42` active, `V43` draft runtime preparation;
- `V43RouteVocabularyInventory` helpers for V43 source-safe route vocabulary inventory, source-safe file/token counts, `/exchange` to `/packs` planning, `/packs` to `/read` and `/deposit` planning, retained debug cockpit boundary, redirect compatibility, self-referential copy cleanup, and migration matrix proof;
- `V43PacksActivityMasterDetail` helpers for V43 source-safe PackActivity contracts, `/api/packs/activity`, `/packs` master-detail search/filter/sort/detail projection, proof roots, settlement/compensation/delivery/repair readback, and `/exchange` compatibility redirection;
- `V46PublicOperatorClaimBoundaries` helpers for V46 source-safe public/operator claim boundary metadata across public docs, landing, operator docs, README surfaces, workflow checks, and forbidden overclaim scans;
- `V46ProductRouteComprehensionReadback` helpers for V46 source-safe `/packs`, `/read`, and `/deposit` route comprehension metadata, low-detail defaults, expandable proof readback, route-owned state, and forbidden product-route overclaim scans;
- `V46InterfaceClaimContracts` helpers for V46 source-safe API/MCP, ChatGPT App, Bitcode Chat, and package-consumer claim contracts, proof-root projection, denied-state repair, no parallel state authority, and forbidden interface overclaim scans;
- `V46LocalInterfaceComprehensionRehearsal` helpers for V46 source-safe local docs, route, API/MCP, ChatGPT App, Bitcode Chat, proof telemetry, and repair readback rehearsal metadata over prior V46 claim and authority artifacts;
- canonical proven-generation helpers;
- the package app/server context used by commercial interfaces.

V43 Gate 1 opens the Packs, Read, Deposit draft over `V42` active, `V43`
draft posture. It specifies `/exchange` to `/packs`, `/packs` separation
into `/read` and `/deposit`, agentic deposit AssetPack option synthesis,
searchable pack activity master-detail, source-safe option review, and product
UX cleanup through `check:v43-gate1`.

V43 Gate 2 adds `V43RouteVocabularyInventory` through
`scripts/specifying/src/canonical/v43-route-vocabulary-inventory.js`,
`scripts/specifying/test/v43-route-vocabulary-inventory.test.js`,
`.proofs/v43/route-vocabulary-inventory.json`,
`generate:v43-route-vocabulary-inventory`,
`check:v43-route-vocabulary-inventory`, and `check:v43-gate2`.
The artifact is source-safe metadata only: it records file paths, token counts,
category counts, migration rows, and proof roots, but never source snippets,
protected source, raw prompts, provider responses, unpaid AssetPack source,
credentials, wallet private material, or private settlement payloads.

V43 Gate 3 adds `V43PacksActivityMasterDetail` through
`scripts/specifying/src/canonical/v43-packs-activity-master-detail.js`,
`scripts/specifying/test/v43-packs-activity-master-detail.test.js`,
`.proofs/v43/packs-activity-master-detail.json`,
`generate:v43-packs-activity-master-detail`,
`check:v43-packs-activity-master-detail`, and `check:v43-gate3`. It binds
`PackActivityRecord`, `PacksActivityDetail`, `/api/packs/activity`, `/packs`,
`/exchange` compatibility redirection, search, filtering, sorting, proof-root
display, settlement/compensation/delivery/repair state readback, source-safe
metadata expansion, and no-source leak tests.

V43 Gate 4 adds `V43ReadRouteFiveStepUx` through
`scripts/specifying/src/canonical/v43-read-route-five-step-ux.js`,
`scripts/specifying/test/v43-read-route-five-step-ux.test.js`,
`.proofs/v43/read-route-five-step-ux.json`,
`generate:v43-read-route-five-step-ux`,
`check:v43-read-route-five-step-ux`, and `check:v43-gate4`. It binds
`ReadRouteSession`, `/read`, five-step Reading UX, Need review,
accepted-Need-gated Finding Fits, source-safe AssetPack preview, BTC
settlement/delivery posture, retained execution stream readback, route
navigation, and no-source leak tests.

V43 Gate 5 adds `V43DepositRouteOptions` through
`scripts/specifying/src/canonical/v43-deposit-route-options.js`,
`scripts/specifying/test/v43-deposit-route-options.test.js`,
`.proofs/v43/deposit-route-options.json`,
`generate:v43-deposit-route-options`,
`check:v43-deposit-route-options`, and `check:v43-gate5`. It binds
`DepositRouteSession`, `/deposit`, five-step Depositing UX,
`DepositAssetPackOptionSynthesis`, multiple source-safe AssetPack options,
demand signal roots, option measurement roots, retained deposit composer reuse,
route navigation, and no-source leak tests while leaving Gate 6 policy and Gate
7 admission/indexing deferred.

V43 Gate 6 adds `DepositAssetPackOptionPolicyReport` through
`scripts/specifying/src/canonical/v43-deposit-policy-compensation.js`,
`scripts/specifying/test/v43-deposit-policy-compensation.test.js`,
`.proofs/v43/deposit-policy-compensation.json`,
`generate:v43-deposit-policy-compensation`,
`check:v43-deposit-policy-compensation`, and `check:v43-gate6`. It binds
source criticality, likely demand, deterministic ROI, estimate-only BTD
potential, critical-source pre-admission blocking, and BTC source-to-shares
compensation route preview while keeping Gate 7 responsible for depositor
approval, admission, indexing, storage projection, telemetry, and `/packs`
activity synchronization.

V43 Gate 7 adds `DepositAssetPackOptionAdmissionReport` through
`scripts/specifying/src/canonical/v43-deposit-option-admission.js`,
`scripts/specifying/test/v43-deposit-option-admission.test.js`,
`.proofs/v43/deposit-option-admission.json`,
`generate:v43-deposit-option-admission`,
`check:v43-deposit-option-admission`, and `check:v43-gate7`. It binds
depositor approve/reject/resynthesis decisions, source-safe admission receipts,
Depository index/storage projections, BTC source-to-shares compensation preview
continuity, execution-stream telemetry, and `/packs` `depository-assetpack`
synchronization while keeping BTD mint, rights transfer, settlement broadcast,
and unpaid AssetPack source disclosure outside deposit-side admission.

V43 Gate 8 adds `V43RouteUxProductExcellence` through
`scripts/specifying/src/canonical/v43-route-ux-product-excellence.js`,
`scripts/specifying/test/v43-route-ux-product-excellence.test.js`,
`.proofs/v43/route-ux-product-excellence.json`,
`generate:v43-route-ux-product-excellence`,
`check:v43-route-ux-product-excellence`, and `check:v43-gate8`. It binds the
shared product route shell, Reading/Depositing step grid, loading/empty/error
state panels, progressive disclosure, concise route copy, focused route tests,
and workflow wiring for `/packs`, `/read`, and `/deposit` without exposing
protected source, unpaid AssetPack source, prompts, provider responses, wallet
private material, or private settlement payloads.

V43 Gate 9 adds `V43CrossRouteRehearsalTelemetryRepair` through
`scripts/specifying/src/canonical/v43-cross-route-rehearsal-telemetry-repair.js`,
`scripts/specifying/test/v43-cross-route-rehearsal-telemetry-repair.test.js`,
`.proofs/v43/cross-route-rehearsal-telemetry-repair.json`,
`scripts/rehearse-v43-cross-route-product-flow.mjs`,
`generate:v43-cross-route-rehearsal`, `check:v43-cross-route-rehearsal`, and
`check:v43-gate9`. It binds local/staging-testnet rehearsal rows for
`/deposit`, `/read`, `/packs`, telemetry/database readback,
ledger/database/storage synchronization, repair posture, settlement delivery,
and compensation readback while keeping receipts source-safe and value-bearing
mainnet execution blocked.

V43 Gate 10 adds `V43PromotionReadinessReport` through
`scripts/specifying/src/canonical/v43-promotion-readiness-report.js`,
`scripts/specifying/test/v43-promotion-readiness.test.js`,
`.proofs/v43/promotion-readiness-report.json`,
`generate:v43-promotion-readiness`, `check:v43-promotion-readiness`,
`check:v43-gate10`, and `v43-canon-promotion.yml`. It binds all V43 product
route artifacts, workflows, generated PROVEN support, promotion scripts,
source-safety checks, documentation evidence, and the `V43` active, `V44` draft
posture needed before canonical promotion.

V44 Gate 1 opens scaled engineering economy work over the promoted `V43`
active, `V44` draft posture. It wires `check:v44-gate1` and the V44
specification family for enterprise AssetPack portfolios, Pack market signals,
Reading demand signals, deposit supply opportunities, Reading budget policy,
AssetPack quote policy, BTD/BTC/source-to-shares accounting, contributor
compensation statements, organization policy, wallet authority, scaled
local/staging-testnet rehearsal, and `/packs`, `/read`, `/deposit` economic
operation. Gate 1 is specification/documentation/workflow posture only.

V44 Gate 2 adds `V44EconomicDomainModel` through
`scripts/specifying/src/canonical/v44-economic-domain-model.js`,
`scripts/specifying/test/v44-economic-domain-model.test.js`,
`.proofs/v44/economic-domain-model.json`,
`generate:v44-economic-domain-model`, `check:v44-economic-domain-model`, and
`check:v44-gate2`. It binds source-safe economic object contracts, receipt
taxonomy ids, value labels, forbidden payload ids, package exports, workflow
checks, and generated artifact freshness for later `/packs`, `/read`, and
`/deposit` economic operation.

V44 Gate 3 adds `V44PacksPortfolioMarketIntelligence` through
`scripts/specifying/src/canonical/v44-packs-portfolio-market-intelligence.js`,
`scripts/specifying/test/v44-packs-portfolio-market-intelligence.test.js`,
`.proofs/v44/packs-portfolio-market-intelligence.json`,
`generate:v44-packs-portfolio-market-intelligence`,
`check:v44-packs-portfolio-market-intelligence`, and `check:v44-gate3`. It
binds `/api/packs/activity` and `/packs` to source-safe portfolio positions,
saved filters, organization views, demand/supply/unfit-Need market signals,
settlement and compensation facets, proof-root drilldown, and no-source-leak
tests.

V44 Gate 4 adds `V44ReadingBudgetQuotePolicy` through
`scripts/specifying/src/canonical/v44-reading-budget-quote-policy.js`,
`scripts/specifying/test/v44-reading-budget-quote-policy.test.js`,
`.proofs/v44/reading-budget-quote-policy.json`,
`generate:v44-reading-budget-quote-policy`,
`check:v44-reading-budget-quote-policy`, and `check:v44-gate4`. It binds
`/read` to source-safe Reading procurement governance: budget envelopes,
approval thresholds, quote expiry, deterministic measurement-weight-volume
share-to-fee policy, buyer authorization, wallet authority, BTC/BTD
settlement readiness blockers, pre-purchase review boundaries, route UI
readback, BTD fee/source-to-shares prerequisites, and source-safety tests.

V44 Gate 5 adds `V44DepositorEarningsSupplyOpportunities` through
`scripts/specifying/src/canonical/v44-depositor-earnings-supply-opportunities.js`,
`scripts/specifying/test/v44-depositor-earnings-supply-opportunities.test.js`,
`.proofs/v44/depositor-earnings-supply-opportunities.json`,
`generate:v44-depositor-earnings-supply-opportunities`,
`check:v44-depositor-earnings-supply-opportunities`, and `check:v44-gate5`.
It binds `/deposit` to source-safe Depositor earning supply intelligence:
likely demand, unfit Need opportunities, source criticality, ROI posture,
estimate-only BTC compensation ranges, source-to-shares proof boundaries,
earning statements, supply recommendations, route UI readback, and
source-safety tests.

V44 Gate 6 adds `V44BtdBtcCompensationStatements` through
`scripts/specifying/src/canonical/v44-btd-btc-compensation-statements.js`,
`scripts/specifying/test/v44-btd-btc-compensation-statements.test.js`,
`.proofs/v44/btd-btc-compensation-statements.json`,
`generate:v44-btd-btc-compensation-statements`,
`check:v44-btd-btc-compensation-statements`, and `check:v44-gate6`. It binds
settlement rights delivery boundaries to source-safe BTD range accounting, BTC
settlement observations, source-to-shares contributor compensation statements,
depositor earning summaries, treasury routes, ledger/database/object-storage
reconciliation, repair statements, `/packs` accounting readback, package
exports, workflow wiring, and source-safety tests.

V44 Gate 7 adds `V44OrganizationPolicyWalletAuthority` through
`scripts/specifying/src/canonical/v44-organization-policy-wallet-authority.js`,
`scripts/specifying/test/v44-organization-policy-wallet-authority.test.js`,
`.proofs/v44/organization-policy-wallet-authority.json`,
`generate:v44-organization-policy-wallet-authority`,
`check:v44-organization-policy-wallet-authority`, and `check:v44-gate7`. It
binds BTD Reading and deposit authority actions to source-safe organization
policy, budget approval, source criticality approval, spend/deposit limits,
wallet authority, `/read` and `/deposit` authority readback, `/packs`
governance readback, package exports, workflow wiring, and source-safety tests.

V44 Gate 8 adds `V44EnterpriseProductUx` through
`scripts/specifying/src/canonical/v44-enterprise-product-ux.js`,
`scripts/specifying/test/v44-enterprise-product-ux.test.js`,
`.proofs/v44/enterprise-product-ux.json`,
`generate:v44-enterprise-product-ux`,
`check:v44-enterprise-product-ux`, and `check:v44-gate8`. It binds shared
enterprise UX primitives, `/packs` dense economic operation, `/read`
procurement proof readback, `/deposit` synthesis/earnings/authority proof
readback, route tests, package exports, workflow wiring, generated artifact
freshness, and source-safety tests for the enterprise economic operation
surface.

V44 Gate 9 adds `V44ScaledNetworkRehearsal` through
`scripts/specifying/src/canonical/v44-scaled-network-rehearsal.js`,
`scripts/specifying/test/v44-scaled-network-rehearsal.test.js`,
`.proofs/v44/scaled-network-rehearsal.json`,
`generate:v44-scaled-network-rehearsal`,
`check:v44-scaled-network-rehearsal`, `rehearse:v44-scaled-network`, and
`check:v44-gate9`. It binds source-safe local and staging-testnet rehearsal
receipts for `/deposit`, `/read`, and `/packs`; 24 deposits, 18 Reads, 72 Fit
candidates, 18 quotes, 12 BTC settlement observations, 36 contributors, 8
repair cases, and 54 PackActivity rows; staging-testnet project
`tkpyosihuouusyaxtbau`; package exports; workflow wiring; generated artifact
freshness; and source-safety tests for scaled many-pack economic operation
without secret serialization or value-bearing mainnet admission.

V44 Gate 10 adds `V44PromotionReadinessReport` through
`scripts/specifying/src/canonical/v44-promotion-readiness-report.js`,
`scripts/specifying/test/v44-promotion-readiness.test.js`,
`.proofs/v44/promotion-readiness-report.json`,
`generate:v44-promotion-readiness`, `check:v44-promotion-readiness`,
`check:v44-gate10`, and `v44-canon-promotion.yml`. It binds all V44 gate
artifacts, source-safe promotion metadata, generated PROVEN support, promotion
script support, workflow posture, package exports, and the promoted
`V44` active, `V45` draft posture without serializing secrets, protected source,
unpaid AssetPack source, raw prompts, provider payloads, wallet private
material, private settlement payloads, live logs, or value-bearing mainnet
admission.

V45 Gate 17 adds `V45SourceSafeEndToEndRehearsal` through
`scripts/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js`,
`scripts/specifying/test/v45-source-safe-e2e-rehearsal.test.js`,
`.proofs/v45/source-safe-e2e-rehearsal.json`,
`generate:v45-source-safe-e2e-rehearsal`,
`check:v45-source-safe-e2e-rehearsal`, `rehearse:v45-source-safe-e2e`, and
`check:v45-gate17`. It binds source-safe local deterministic,
staging-testnet credentialed, and value-bearing mainnet-blocked rehearsal
lanes across deposit option synthesis, Depository admission, request Read,
review synthesized Need, request Finding Fits, preview, quote readiness, BTC
observation and rights delivery posture, source-to-shares compensation,
ledger/database/storage readback, browser receipt posture, and repair-state
behavior. Missing or contradictory evidence returns repair state rather than
success, and all source-bearing, prompt-bearing, provider, credential, wallet,
private settlement, live-log, and value-bearing mainnet payload classes remain
withheld.

V45 Gate 18 adds `V45PromotionReadinessReport` through
`scripts/specifying/src/canonical/v45-promotion-readiness-report.js`,
`scripts/specifying/test/v45-promotion-readiness.test.js`,
`.proofs/v45/promotion-readiness-report.json`,
`generate:v45-promotion-readiness`, `check:v45-promotion-readiness`, and
`check:v45-gate18`. It binds V45 proof-family artifacts, source-safe rehearsal,
draft `BITCODE_SPEC_V45_PROVEN.md` generation support,
`v45-canon-promotion.yml`, promotion dry-run support, workflow posture, package
exports, and `V45` active, `V46` draft runtime preparation while preserving the
same source, prompt, provider, credential, wallet-private, private-settlement,
live-log, and value-bearing mainnet exclusions.

V46 Gate 1 opens commercial protocol comprehension over active `V45` with the
V46 draft spec family and `check:v46-gate1`. It keeps V46 as draft-target
material while naming the public/operator/interface explanation scope.

V46 Gate 2 adds `V46ProtocolComprehensionObjectModel` through
`scripts/specifying/src/canonical/v46-protocol-comprehension-object-model.js`,
`scripts/specifying/test/v46-protocol-comprehension-object-model.test.js`,
`.proofs/v46/protocol-comprehension-object-model.json`,
`generate:v46-protocol-comprehension-object-model`,
`check:v46-protocol-comprehension-object-model`, and `check:v46-gate2`. It
binds the source-safe object model, claim categories, authority classes,
disclosure boundaries, forbidden claim collapses, package exports, workflow
checks, and generated artifact freshness for later public docs, route,
API/MCP, ChatGPT App, Bitcode Chat, proof readback, and launch-facing claim
work.

V46 Gate 3 adds `V46PublicOperatorClaimBoundaries` through
`scripts/specifying/src/canonical/v46-public-operator-claim-boundaries.js`,
`scripts/specifying/test/v46-public-operator-claim-boundaries.test.js`,
`.proofs/v46/public-operator-claim-boundaries.json`,
`generate:v46-public-operator-claim-boundaries`,
`check:v46-public-operator-claim-boundaries`, and `check:v46-gate3`.
Package consumers can call `buildV46PublicOperatorClaimBoundaries` to produce
source-safe public/operator claim boundary metadata for public docs, landing,
operator docs, README surfaces, workflow wiring, required copy anchors, and
forbidden overclaim scans without serializing protected source, unpaid
AssetPack source, raw prompts, raw provider responses, credentials, wallet
private material, or value-bearing mainnet authority.

V46 Gate 4 adds `V46ProductRouteComprehensionReadback` through
`scripts/specifying/src/canonical/v46-product-route-comprehension-readback.js`,
`scripts/specifying/test/v46-product-route-comprehension-readback.test.js`,
`.proofs/v46/product-route-comprehension-readback.json`,
`generate:v46-product-route-comprehension-readback`,
`check:v46-product-route-comprehension-readback`, and `check:v46-gate4`. It
binds `/packs`, `/read`, and `/deposit` to source-safe low-detail defaults,
route-owned state, expandable proof readback, Reading and Depositing five-step
flows, Packs search/filter/sort, proof-root readback, settlement/delivery
boundaries, contributor compensation readback, and no-source/no-secret product
route scans.

V46 Gate 5 adds `V46InterfaceClaimContracts` through
`scripts/specifying/src/canonical/v46-interface-claim-contracts.js`,
`scripts/specifying/test/v46-interface-claim-contracts.test.js`,
`.proofs/v46/interface-claim-contracts.json`,
`generate:v46-interface-claim-contracts`,
`check:v46-interface-claim-contracts`, and `check:v46-gate5`. It binds public
API schema compatibility, MCP tool contracts, ChatGPT App action contracts,
Bitcode Chat conversation/stream/handoff contracts, and package-consumer read
contracts to source-safe `InterfaceClaim` rows, proof-root projection,
denied-state repair, no parallel state authority, package exports, and
no-source/no-secret interface scans.

V46 Gate 6 adds `V46ProofReadbackOperatorExplanation` through
`scripts/specifying/src/canonical/v46-proof-readback-operator-explanation.js`,
`scripts/specifying/test/v46-proof-readback-operator-explanation.test.js`,
`.proofs/v46/proof-readback-operator-explanation.json`,
`generate:v46-proof-readback-operator-explanation`,
`check:v46-proof-readback-operator-explanation`, and `check:v46-gate6`. It
distinguishes canonical/generated proof, execution/workflow receipts, ledger
journals, database projections, object-storage roots, telemetry streams,
wallet/provider receipts, repository delivery receipts, and repair
reconciliation receipts without creating parallel state authority or exposing
private payloads.

V46 Gate 7 adds `V46LocalInterfaceComprehensionRehearsal` through
`scripts/specifying/src/canonical/v46-local-interface-comprehension-rehearsal.js`,
`scripts/specifying/test/v46-local-interface-comprehension-rehearsal.test.js`,
`.proofs/v46/local-interface-comprehension-rehearsal.json`,
`generate:v46-local-interface-comprehension-rehearsal`,
`check:v46-local-interface-comprehension-rehearsal`, and `check:v46-gate7`.
It rehearses local .docs/landing, `/packs`, `/read`, `/deposit`, API/MCP,
ChatGPT App, Bitcode Chat, proof telemetry, and repair readback against Gate 2
through Gate 6 generated artifacts while remaining local-only and
source-safe.

V46 Gate 8 adds `V46PromotionReadinessReport` through
`scripts/specifying/src/canonical/v46-promotion-readiness-report.js`,
`scripts/specifying/test/v46-promotion-readiness.test.js`,
`.proofs/v46/promotion-readiness-report.json`,
`generate:v46-promotion-readiness`, `check:v46-promotion-readiness`, and
`check:v46-gate8`. It binds the accepted V46 protocol comprehension artifacts,
generated `BITCODE_SPEC_V46_PROVEN.md` support, `v46-canon-promotion.yml`,
promotion dry-run support, workflow posture, package exports, and the promoted
`V46` active, `V47` draft runtime preparation without serializing protected
source, unpaid AssetPack source, raw prompts, provider payloads, credentials,
wallet private material, private settlement payloads, live logs, or
value-bearing mainnet authority.

V47 Gate 10 adds `V47PromotionReadinessReport` through
`scripts/specifying/src/canonical/v47-promotion-readiness-report.js`,
`scripts/specifying/test/v47-promotion-readiness.test.js`,
`.proofs/v47/promotion-readiness-report.json`,
`generate:v47-promotion-readiness`, `check:v47-promotion-readiness`, and
`check:v47-gate10`. It binds the accepted V47 commercial website testnet
launch artifacts, generated `BITCODE_SPEC_V47_PROVEN.md` support,
`v47-canon-promotion.yml`, promotion dry-run support, workflow posture,
package exports, and the promoted `V47` active, `V48` draft runtime
preparation without serializing protected source, unpaid AssetPack source,
raw prompts, provider payloads, credentials, wallet private material, or
private settlement payloads.

Historical V39 promotion moved this package through the `V39` active, `V40`
draft posture. V40 promotion has since advanced the current package posture to
`V40` active, `V41` draft.
V40 Gate 1 treated this package as promotion-critical runtime posture and opened
the exhaustive testing specification family for active V39 / draft V40 work.
`scripts/specifying/src/canon-posture.js` and `scripts/specifying/data/state.json`
must remain aligned to `V40` active, `V41` draft after V40 promotion.
V40 Gate 1 is wired through `check:v40-gate1` and documents the exact browser
E2E, visual/screenshot, API integration, pipeline integration, Conversation and
product integration, unit coverage, ledger/database/storage synchronization,
local/staging rehearsal, prompt benchmark smoke, and V41 prompt-program
readiness scope that later V40 gates must implement.
After V40 promotion this package is in the `V40` active, `V41` draft posture.
V41 Gate 1 is wired through `check:v41-gate1` and opens the prompt-program
specification family: every raw PromptPart, composed Prompt, registry binding,
interpolation contract, inference callsite, benchmark fixture, parsed return
type, and source-safe telemetry projection must become enumerable before later
V41 gates rewrite Reading, Conversation, tool-definition, or interface prompts.
V41 Gate 2 adds `V41PromptPartPromptInventory` through
`scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js`,
`scripts/specifying/test/v41-promptpart-prompt-inventory.test.js`,
`.proofs/v41/promptpart-prompt-inventory.json`,
`generate:v41-prompt-inventory`, `check:v41-prompt-inventory`, and
`check:v41-gate2`.
The artifact is source-safe metadata only and currently catalogues 1,459 raw
PromptPart rows plus 105 composed Prompt rows before any V41 prompt rewrite is
admitted.
It also records V42's planned MVP experience focus: shortest-path Depositing,
shortest-path Reading, and the AI-reading dominant demonstration.
V41 Gate 3 adds `V41RegistryInterpolationContracts` through
`scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js`,
`scripts/specifying/test/v41-registry-interpolation-contracts.test.js`,
`.proofs/v41/registry-interpolation-contracts.json`,
`generate:v41-registry-interpolation-contracts`,
`check:v41-registry-interpolation-contracts`, and `check:v41-gate3`.
The artifact is source-safe metadata only and currently covers 12
registry/interpolation rows with 65 passing source predicates across Prompt
registry totality, TemplatedPromptPart interpolation, PTRR agent/step prompt
composition, FailsafeGenerationSequence context handling, ThricifiedGeneration
final prompt resolution, execution ancestry overlays, tool doc-code prompt
injection, Reading parser targets, Finding Fits search contracts, AssetPack
synthesis/finishing parser targets, and Gate 2 inventory binding.
V41 Gate 4 adds `V41ReadingPromptBenchmarkBaselines` through
`scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js`,
`scripts/specifying/test/v41-reading-prompt-benchmark-baselines.test.js`,
`.proofs/v41/reading-prompt-benchmark-baselines.json`,
`generate:v41-reading-prompt-benchmark-baselines`,
`check:v41-reading-prompt-benchmark-baselines`, and `check:v41-gate4`.
The artifact is source-safe metadata only and currently covers 10 Reading
baseline rows with 120 passing predicates across both Reading pipelines, all
five Reading UX steps, parser targets, fixtures, source-safe scores, and
pre-rewrite disclosure tiers.
V41 Gate 5 adds `V41ReadNeedPromptHardening` through
`scripts/specifying/src/canonical/v41-readneed-prompt-hardening.js`,
`scripts/specifying/test/v41-readneed-prompt-hardening.test.js`,
`.proofs/v41/readneed-prompt-hardening.json`,
`generate:v41-readneed-prompt-hardening`,
`check:v41-readneed-prompt-hardening`, and `check:v41-gate5`.
The artifact is source-safe metadata only and currently covers 7
ReadNeedComprehensionSynthesis hardening rows with 63 passing predicates across
exact Read Request boundary, source constraints, strict return types,
review/resynthesis gates, telemetry redaction, PTRR/Failsafe/Thricified
composition, read-comprehension tool prompt alignment, and Gate 2 through Gate
4 dependency roots.
V41 Gate 6 adds `V41ReadFitsFindingPromptHardening` through
`scripts/specifying/src/canonical/v41-readfitsfinding-prompt-hardening.js`,
`scripts/specifying/test/v41-readfitsfinding-prompt-hardening.test.js`,
`.proofs/v41/readfitsfinding-prompt-hardening.json`,
`generate:v41-readfitsfinding-prompt-hardening`,
`check:v41-readfitsfinding-prompt-hardening`, and `check:v41-gate6`.
The artifact is source-safe metadata only and currently covers 8
ReadFitsFindingSynthesis hardening rows with 76 passing predicates across
accepted-Need integrity, many-candidate Depository search, embeddings and
provider-ranking policy, selected-fit provenance, AssetPack context synthesis,
source-safe preview and quote disclosure, post-settlement rights/delivery
boundaries, telemetry redaction, and Gate 2 through Gate 5 dependency roots.
V41 Gate 7 adds `V41ConversationToolInterfacePromptRewrite` through
`scripts/specifying/src/canonical/v41-conversation-tool-interface-prompt-rewrite.js`,
`scripts/specifying/test/v41-conversation-tool-interface-prompt-rewrite.test.js`,
`.proofs/v41/conversation-tool-interface-prompt-rewrite.json`,
`generate:v41-conversation-tool-interface-prompt-rewrite`,
`check:v41-conversation-tool-interface-prompt-rewrite`, and `check:v41-gate7`.
The artifact is source-safe metadata only and currently covers 9 rewrite rows
with 60 passing predicates across Conversation PTRR PromptParts, product
conversation system prompts, rich execution-log disclosure metadata,
DocCodeToolPrompt and ToolPromptRegistry hierarchy, MCP API/public API tool
schema posture, ChatGPT App action/tool prompt posture, product/public
summary source-safety, V38 Conversation/tool parity, and Gate 2 through Gate 6
dependency roots.
V41 Gate 8 adds `V41PromptProgramBenchmarkReport` through
`scripts/specifying/src/canonical/v41-prompt-program-benchmark-report.js`,
`scripts/specifying/test/v41-prompt-program-benchmark-report.test.js`,
`.proofs/v41/prompt-program-benchmark-report.json`,
`generate:v41-prompt-program-benchmark-report`,
`check:v41-prompt-program-benchmark-report`, and `check:v41-gate8`.
The artifact is source-safe metadata only and currently binds 9 benchmark
telemetry rows across post-rewrite prompt deltas, Reading benchmark deltas,
Conversation/tool/interface deltas, prompt registry lineage, Failsafe and
ThricifiedGeneration receipts, parsed-output schema verdicts, rich stream
telemetry, repair hooks, and V38/V39/V40 plus V41 Gate 2 through Gate 7
dependency roots.
V41 Gate 9 adds `V41PromotionReadinessReport` through
`scripts/specifying/src/canonical/v41-promotion-readiness-report.js`,
`scripts/specifying/test/v41-promotion-readiness.test.js`,
`.proofs/v41/promotion-readiness-report.json`,
`generate:v41-promotion-readiness`, `check:v41-promotion-readiness`, and
`check:v41-gate9`.
The report closes promotion readiness for the `V41` active, `V42` draft posture
by binding all V41 prompt-program artifacts, `BITCODE_SPEC_V41_PROVEN.md`,
`v41-canon-promotion.yml`, gate/canon workflow support, promotion scripts,
runtime canon rewriting, dry-run promotion, source-safety, and value-bearing
mainnet blocking without serializing raw prompts, provider responses, protected
source, credentials, private settlement payloads, wallet material, or unpaid
AssetPack source.
V42 Gate 1 is wired through `check:v42-gate1` and opens the reliable MVP
experience specification family for the `V41` active, `V42` draft posture:
shortest-path Depositing with Depository admission proof and later BTC
compensation visibility; shortest-path Reading through Read Request, reviewed
Need, Finding Fits, source-safe AssetPack preview, BTD/BTC settlement, rights
transfer, and repository delivery; and an AI-reading dominant standalone
demonstration that proves an AssetPack can improve an AI system beyond a
public-data-only baseline.
V42 Gate 2 adds `V42DepositingShortestPath` through
`scripts/specifying/src/canonical/v42-depositing-shortest-path.js`,
`scripts/specifying/test/v42-depositing-shortest-path.test.js`,
`.proofs/v42/depositing-shortest-path.json`, and `check:v42-gate2`.
It proves deposit route readiness, Depository search/vector/storage projection,
source-safe compensation preview roots, source-to-shares ledger readback keys,
product compensation visibility, and the pre-mint/no-pre-settlement-source
boundary.
V42 Gate 3 adds the V42 Reading shortest path state machine,
`V42ReadingShortestPathStateMachine`, through
`scripts/specifying/src/canonical/v42-reading-shortest-path-state-machine.js`,
`scripts/specifying/test/v42-reading-shortest-path-state-machine.test.js`,
`.proofs/v42/reading-shortest-path-state-machine.json`, and
`check:v42-gate3`. It proves the five-step Reading path, transaction/stage
route persistence, accepted-Need gating, restart/retry/failure repair,
low-detail proof-on-expand UI posture, rich Reading pipeline telemetry
readback, activity/workbench readback, and source-safe disclosure boundaries.
V42 Gate 4 adds `V42ReadNeedReviewResynthesisProductClosure` through
`scripts/specifying/src/canonical/v42-readneed-review-resynthesis-product-closure.js`,
`scripts/specifying/test/v42-readneed-review-resynthesis-product-closure.test.js`,
`.proofs/v42/readneed-review-resynthesis-product-closure.json`, and
`check:v42-gate4`. It proves ReadNeed review/resynthesis product closure:
source-safe Read Request and Need storage, feedback lineage, Need measurement,
accepted-Need admission, rejected Need blockers, PTRR/Failsafe/Thricified
telemetry receipts, `/api/read-review` action coverage, product runtime
readback, and source-safe disclosure boundaries.
V42 Gate 5 adds `V42ReadFitsFindingPreviewQuote` through
`scripts/specifying/src/canonical/v42-readfitsfinding-preview-quote.js`,
`scripts/specifying/test/v42-readfitsfinding-preview-quote.test.js`,
`.proofs/v42/readfitsfinding-preview-quote.json`, and `check:v42-gate5`.
It proves accepted-Need-gated Finding Fits, many-channel Depository search,
candidate ranking, selected-fit provenance, source-safe AssetPack preview,
deterministic share-to-fee quote receipts, disclosure review, settlement
instructions, delivery lock, harness route summaries, product
preview/quote/provenance readback, and no pre-settlement protected source or
unpaid AssetPack source exposure.
V42 Gate 6 adds `V42SettlementRightsDelivery` through
`scripts/specifying/src/canonical/v42-settlement-rights-delivery.js`,
`scripts/specifying/test/v42-settlement-rights-delivery.test.js`,
`.proofs/v42/settlement-rights-delivery.json`,
`generate:v42-settlement-rights-delivery`,
`check:v42-settlement-rights-delivery`, and `check:v42-gate6`.
The artifact is source-safe metadata only and covers paid quote observation,
BTC/testnet finality, BTD rights transfer, paid read receipts,
source-to-shares compensation conservation, repository pull-request delivery
unlock, ledger/database/object-storage reconciliation, fail-closed repair
posture, harness route summaries, product settlement readback, and workflow
proof wiring without serializing protected source, unpaid AssetPack source,
wallet private material, private settlement payloads, credentials, raw
protected prompts, or raw provider responses.
V42 Gate 7 adds `V42AiReadingDemonstration` through
`scripts/specifying/src/canonical/v42-ai-reading-demonstration.js`,
`scripts/specifying/test/v42-ai-reading-demonstration.test.js`,
`.proofs/v42/ai-reading-demonstration.json`,
`generate:v42-ai-reading-demonstration`,
`check:v42-ai-reading-demonstration`, and `check:v42-gate7`.
The artifact is source-safe metadata only and covers the self-contained
`protocol-demonstration/` AI-reading loop: public-data-only baseline, reviewed
local Need, local Depository fit selection, AssetPack preview, AssetPack-
enhanced answer, deterministic benchmark uplift, settlement-gated source
visibility, and workflow proof wiring.
V42 Gate 8 adds `V42LocalStagingMvpRehearsal` through
`scripts/specifying/src/canonical/v42-local-staging-mvp-rehearsal.js`,
`scripts/specifying/test/v42-local-staging-mvp-rehearsal.test.js`,
`.proofs/v42/local-staging-mvp-rehearsal.json`,
`rehearse:v42-local-staging`,
`generate:v42-local-staging-mvp-rehearsal`,
`check:v42-local-staging-mvp-rehearsal`, and `check:v42-gate8`.
The artifact is source-safe metadata only and binds Gates 2 through 7 into the
local/staging full MVP rehearsal: deposit source, request read, review
synthesized Need, request Finding Fits, review source-safe AssetPack preview
and quote, buy/settle, receive repository delivery, inspect telemetry/database
readback, and keep value-bearing mainnet blocked.
V42 Gate 9 adds `V42PromotionReadinessReport` through
`scripts/specifying/src/canonical/v42-promotion-readiness-report.js`,
`scripts/specifying/test/v42-promotion-readiness.test.js`,
`.proofs/v42/promotion-readiness-report.json`,
`generate:v42-promotion-readiness`, `check:v42-promotion-readiness`, and
`check:v42-gate9`.
The report closes the reliable MVP promotion path by binding all V42 gate
artifacts, `BITCODE_SPEC_V42_PROVEN.md`, `v42-canon-promotion.yml`,
promotion scripts, runtime canon rewriting, dry-run promotion, source-safety,
value-bearing mainnet blocking, and the `V42` active, `V43` draft posture
without serializing protected source, credentials, private settlement payloads,
wallet material, raw protected prompts, raw provider responses, or unpaid
AssetPack source.
V40 Gate 2 adds `V40TestInventoryCoverageMatrix` through
`scripts/specifying/src/canonical/v40-test-inventory-coverage-matrix.js`,
`scripts/specifying/test/v40-test-inventory-coverage-matrix.test.js`,
`.proofs/v40/test-inventory-coverage-matrix.json`, and `check:v40-gate2`.
The artifact is source-safe metadata only and inventories owners, commands,
source roots, generated artifact targets, and closure gates for each V40 testing
surface before the later gates implement deeper coverage.
V40 Gate 3 adds `V40UnitCoverageInventory` through
`scripts/specifying/src/canonical/v40-unit-coverage-inventory.js`,
`scripts/specifying/test/v40-unit-coverage-inventory.test.js`,
`.proofs/v40/unit-coverage-inventory.json`, and `check:v40-gate3`.
The artifact is source-safe metadata only and closes the unit layer for critical
packages, primitives, isolated implementations, Reading AssetPack units,
interface helpers, and the demonstration boundary.
V40 Gate 4 adds `V40ApiIntegrationContracts` through
`scripts/specifying/src/canonical/v40-api-integration-contracts.js`,
`scripts/specifying/test/v40-api-integration-contracts.test.js`,
`.proofs/v40/api-integration-contracts.json`, and `check:v40-gate4`.
The artifact is source-safe metadata only and closes API, UAPI, MCP, ChatGPT
App, persistence, authorization, and response-schema integration contract
coverage.
V40 Gate 5 adds `V40ReadingPipelineIntegrationCoverage` through
`scripts/specifying/src/canonical/v40-reading-pipeline-integration-coverage.js`,
`scripts/specifying/test/v40-reading-pipeline-integration-coverage.test.js`,
`.proofs/v40/reading-pipeline-integration-coverage.json`, and
`check:v40-gate5`.
The artifact is source-safe metadata only and closes integration coverage for
the real Reading pipeline topology, Need runtime, Finding Fits search runtime,
PTRR agents, preview/settlement/delivery boundaries, telemetry/readback,
product harness, generic primitives, host harnesses, and local/staging
rehearsal linkage.
V40 Gate 6 adds `V40ConversationTerminalIntegration` through
`scripts/specifying/src/canonical/v40-conversation-terminal-integration.js`,
`scripts/specifying/test/v40-conversation-terminal-integration.test.js`,
`.proofs/v40/conversation-terminal-integration.json`, and
`check:v40-gate6`.
The artifact is source-safe metadata only and closes integration coverage for
Conversation handoff route contracts, Conversation stream-to-rich-log
projection, route/API persistence and branch contracts, writing/source selector
handoff, Reading state readback, product harness log streaming,
transaction-cockpit authority boundaries, and rehearsal/docs/interface parity.
V40 Gate 7 adds `V40BrowserE2eVisualProof` through
`scripts/specifying/src/canonical/v40-browser-e2e-visual-proof.js`,
`scripts/specifying/test/v40-browser-e2e-visual-proof.test.js`,
`.proofs/v40/browser-e2e-visual-proof.json`, and `check:v40-gate7`.
The artifact is source-safe metadata only and closes browser E2E, visual,
accessibility, responsive, interaction-state, screenshot/trace, and overflow
coverage for product, Conversations, Auxillaries, Exchange, and Docs.
V40 Gate 8 adds `V40LedgerStorageSync` through
`scripts/specifying/src/canonical/v40-ledger-storage-sync.js`,
`scripts/specifying/test/v40-ledger-storage-sync.test.js`,
`.proofs/v40/ledger-storage-sync.json`, and `check:v40-gate8`.
The artifact is source-safe metadata only and closes ledger, database,
object-storage, wallet, settlement, BTD rights, source-to-shares compensation,
repair, product readback, and post-settlement pull-request delivery
synchronization coverage.
V40 Gate 9 adds `V40LocalStagingRehearsalAutomation` through
`scripts/specifying/src/canonical/v40-local-staging-rehearsal-automation.js`,
`scripts/specifying/test/v40-local-staging-rehearsal-automation.test.js`,
`.proofs/v40/local-staging-rehearsal-automation.json`, and `check:v40-gate9`.
The artifact is source-safe metadata only and closes local/staging-testnet
operator receipts, lane-bound secret-family checks, explicit live-execution
opt-in, Vercel Sandbox harness evidence and telemetry capture, staging-testnet
database stream/readback binding, Reading rehearsal continuity, synchronization
continuity, and value-bearing mainnet blocking.
V40 Gate 10 adds `V40PromptBenchmarkSmokeV41Readiness` through
`scripts/specifying/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js`,
`scripts/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js`,
`.proofs/v40/prompt-benchmark-smoke-v41-readiness.json`, and
`check:v40-gate10`.
The artifact is source-safe metadata only and closes PromptPart and composed
Prompt benchmark smoke coverage before V41 by binding deterministic local smoke
receipts, the package benchmark report command, V38 benchmark inventory
evidence, workflow wiring, and the V41 prompt-program worklist without
rewriting prompt content or serializing raw prompt/provider payloads.
V40 Gate 11 adds `V40PromotionReadinessReport` through
`scripts/specifying/src/canonical/v40-promotion-readiness-report.js`,
`scripts/specifying/test/v40-promotion-readiness.test.js`,
`.proofs/v40/promotion-readiness-report.json`, `v40-canon-promotion.yml`, and
`check:v40-gate11`.
The report closes promotion readiness for the `V40` active, `V41` draft posture
by binding every V40 testing artifact, generated proof support, gate/canon
workflow support, promotion scripts, runtime canon rewriting, dry-run promotion,
and source-safe value-bearing mainnet blocking.
V39 Gate 1 is wired through `check:v39-gate1` and documents the exact
Depository supply, five-step enterprise Reading UX, ReadNeed review,
ReadFitsFinding runtime, AssetPack preview, deterministic BTC quote, BTD rights
transfer, post-settlement delivery, ledger/database/storage synchronization,
operational telemetry/repair, interface parity, and local/staging rehearsal
scope that later V39 gates must implement.
V39 Gate 2 adds `V39DepositorySupplyIndexing` through
`scripts/specifying/src/canonical/v39-depository-supply-indexing.js` and the
source-safe generated artifact `.proofs/v39/depository-supply-indexing.json`.
The supply indexing report proves `DepositorySupplyIndex` lifecycle receipts,
source-safe search documents, active embedding/vector projection, retained
Supabase storage readback posture, depositor/Reader settlement boundary,
deterministic repair actions, and Finding Fits source-safe handoff. The
maintained commands are `pnpm run generate:v39-depository-supply-indexing` and
`pnpm run check:v39-gate2`.
V39 Gate 3 adds `V39EnterpriseReadingUxState` through
`scripts/specifying/src/canonical/v39-enterprise-reading-ux-state.js` and the
source-safe generated artifact `.proofs/v39/enterprise-reading-ux-state.json`.
The UX state report proves five Reading stages, source-safe disclosure
defaults, Conversation `readingStage` handoff/readback, rich execution stream
integration, component tests, and opt-in browser proof workflow wiring. The
maintained commands are `pnpm run generate:v39-enterprise-reading-ux-state` and
`pnpm run check:v39-gate3`.
V39 Gate 4 adds `V39ReadNeedReviewResynthesis` through
`scripts/specifying/src/canonical/v39-read-need-review-resynthesis.js` and the
source-safe generated artifact `.proofs/v39/read-need-review-resynthesis.json`.
The report proves Read Request persistence, synthesized Need storage, feedback
and resynthesis lineage, Need measurement storage, accepted-Need admission,
rejected-Need posture, source-safe telemetry receipts, route/runtime storage
projection tests, and workflow wiring. The maintained commands are
`pnpm run generate:v39-read-need-review-resynthesis` and
`pnpm run check:v39-gate4`.
V39 Gate 5 adds `V39ReadFitsFindingRuntime` through
`scripts/specifying/src/canonical/v39-read-fits-finding-runtime.js` and the
source-safe generated artifact `.proofs/v39/read-fits-finding-runtime.json`.
The report proves accepted-Need-only Finding Fits admission, source-safe query
plans, seven search channels, many-candidate ranking, selected-fit provenance,
active OpenAI embedding policy, replay receipts, repair posture, runtime
storage projection, package tests, protocol tests, and workflow wiring. The
maintained commands are `pnpm run generate:v39-read-fits-finding-runtime` and
`pnpm run check:v39-gate5`.
V39 Gate 6 adds `V39AssetPackPreviewQuoteBoundary` through
`scripts/specifying/src/canonical/v39-assetpack-preview-quote-boundary.js` and
the source-safe generated artifact
`.proofs/v39/assetpack-preview-quote-boundary.json`. The report proves
source-safe AssetPack preview measurements, selected-fit provenance,
deterministic share-to-fee BTC quote, disclosure leak scanning, reader payment
settlement instructions, withheld pull-request delivery posture, replay
receipt, repair posture, package tests, protocol tests, and workflow wiring.
The maintained commands are
`pnpm run generate:v39-assetpack-preview-quote-boundary` and
`pnpm run check:v39-gate6`.
V39 Gate 7 adds `V39SettlementRightsDelivery` through
`scripts/specifying/src/canonical/v39-settlement-rights-delivery.js` and the
source-safe generated artifact `.proofs/v39/settlement-rights-delivery.json`.
The report proves BTC payment observation/finality, source-to-shares
compensation, BTD rights transfer/read receipts, settlement unlock,
ledger/database/object-storage reconciliation, post-settlement pull-request
delivery unlock, replay, repair posture, package tests, protocol tests, and
workflow wiring. The maintained commands are
`pnpm run generate:v39-settlement-rights-delivery` and
`pnpm run check:v39-gate7`.
V39 Gate 8 adds `V39OperationalTelemetryRepairReadback` through
`scripts/specifying/src/canonical/v39-operational-telemetry-repair-readback.js`
and the source-safe generated artifact
`.proofs/v39/operational-telemetry-repair-readback.json`. The report proves
Reading operational stream events, operator readback, proof roots, runbook
hooks, source-safe disclosure posture, rich execution-log rendering, package
tests, UI tests, protocol tests, and workflow wiring. The maintained commands
are `pnpm run generate:v39-operational-telemetry-repair-readback` and
`pnpm run check:v39-gate8`.
V39 Gate 9 adds `V39InterfaceConversationProductParity` through
`scripts/specifying/src/canonical/v39-interface-conversation-product-parity.js`
and the source-safe generated artifact
`.proofs/v39/interface-conversation-product-parity.json`. The report proves
product authority, Conversation handoff, public API, MCP API, ChatGPT App,
and package-consumer parity rows, accepted-Need gating, source-safe preview,
settlement unlock, BTD rights, delivery boundaries, package tests, interface
tests, protocol tests, and workflow wiring. The maintained commands are
`pnpm run generate:v39-interface-conversation-product-parity` and
`pnpm run check:v39-gate9`.
V39 Gate 10 adds `V39LocalStagingReadingRehearsal` through
`scripts/specifying/src/canonical/v39-local-staging-reading-rehearsal.js` and
the source-safe generated artifact
`.proofs/v39/local-staging-reading-rehearsal.json`. The report proves local
and staging-testnet lane readback, all five Reading stages, many-fit
Depository search, source-safe preview, settlement rights delivery, rich
telemetry readback, interface no-bypass posture, ledger/database/storage
synchronization, blocked value-bearing mainnet admission, package tests,
protocol tests, and workflow wiring. The maintained commands are
`pnpm run generate:v39-local-staging-reading-rehearsal` and
`pnpm run check:v39-gate10`.
V38 Gate 1 is wired through `check:v38-gate1` and documents the exact
PipelineExecution, PTRR agent, Plan/Try/Refine/Retry, FailsafeGenerationSequence,
ThricifiedGeneration, ToolExecution, DocCodeToolPrompt, Reading pipeline,
depository-search, embedding policy, prompt benchmarking, and source-safe
telemetry scope that later V38 gates must implement.
V38 Gate 2 adds `V38InferenceSurfaceInventory` through
`scripts/specifying/src/canonical/inference-surface-inventory.js` and the
source-safe generated artifact `.proofs/v38/inference-surface-inventory.json`.
The inventory covers `ReadNeedComprehensionSynthesis`,
`ReadFitsFindingSynthesis`, Website Conversations, tool-definition prompts,
interface entrypoints, prompt registry coverage, and execution primitives as
`source-safe-inference-surface-metadata`, with 52 PTRR steps, 156
Failsafe/Thricified chains, and 468 provider-call slots. The maintained commands
are `pnpm run generate:v38-inference-surface-inventory`,
`pnpm run check:v38-inference-surface-inventory`, and
`pnpm run check:v38-gate2`.
V38 Gate 3 adds `V38PtrrFailsafeThricifiedStack` through
`scripts/specifying/src/canonical/ptrr-failsafe-thricified-stack.js` and the
source-safe generated artifact `.proofs/v38/ptrr-failsafe-thricified-stack.json`.
The stack contract covers `factoryPTRRAgent`, Plan/Try/Refine/Retry,
`FailsafeGenerationSequence`, `ThricifiedGeneration`, substep prompt/context
telemetry, step-owned tool postprocess boundaries, and Gate 2's 52 PTRR steps /
156 Failsafe sequences / 156 ThricifiedGeneration chains / 468 provider-call
slots as `source-safe-ptrr-failsafe-thricified-stack-metadata`. The maintained
commands are `pnpm run generate:v38-ptrr-failsafe-thricified-stack`,
`pnpm run check:v38-ptrr-failsafe-thricified-stack`, and
`pnpm run check:v38-gate3`.
V38 Gate 4 adds `V38PromptBenchmarkReport` through
`scripts/specifying/src/canonical/prompt-benchmark-report.js` and the
source-safe generated artifact `.proofs/v38/prompt-benchmark-report.json`.
The Prompt benchmarking report covers benchmark infrastructure, generic
PTRR/Failsafe/ThricifiedGeneration PromptParts,
`ReadNeedComprehensionSynthesis` PromptParts, `ReadFitsFindingSynthesis`
PromptParts, complete Reading Prompt registries, Website Conversation Prompts,
and DocCodeToolPrompt surfaces as `source-safe-prompt-benchmark-metadata`.
The maintained commands are `pnpm run generate:v38-prompt-benchmark-report`,
`pnpm run check:v38-prompt-benchmark-report`, and `pnpm run check:v38-gate4`.
V38 Gate 5 adds `V38InferenceTelemetryDisclosureReport` through
`scripts/specifying/src/canonical/inference-telemetry-disclosure-report.js` and
the source-safe generated artifact `.proofs/v38/disclosure-boundary-report.json`.
The telemetry disclosure report covers phase, agent, PTRR step, Failsafe,
ThricifiedGeneration, tool, prompt template, interpolated prompt, raw provider
response root, parsed output shape, schema verdict, retry, repair, and stream UI
projection rows as `source-safe-inference-telemetry-disclosure-metadata`. The
disclosure tier contract exposes source-safe roots, ids, presence flags, typed
shapes, and fail-closed states while keeping raw provider response content, raw
protected prompts, protected source, unpaid AssetPack source, credentials,
private wallet material, and private settlement payloads private or blocked.
The maintained commands are
`pnpm run generate:v38-inference-telemetry-disclosure-report`,
`pnpm run check:v38-inference-telemetry-disclosure-report`, and
`pnpm run check:v38-gate5`.
V38 Gate 6 adds `V38ReadNeedComprehensionInferenceHardening` through
`scripts/specifying/src/canonical/read-need-comprehension-inference-hardening.js`
and the source-safe generated artifact
`.proofs/v38/read-need-comprehension-inference-hardening.json`.
The hardening report proves ReadNeedComprehensionSynthesis request
normalization, Need comprehension, Need measurement, Need review, and
source-safe inference receipt coverage. The receipt binds 4 phases, 4 PTRR
agents, 16 PTRR steps, 48 Failsafe sequences, 48 ThricifiedGeneration chains,
144 provider-call slots, prompt ids, interpolation keys, output schemas,
telemetry ids, and roots while preserving protected source and raw provider
response privacy.
The maintained commands are
`pnpm run generate:v38-read-need-comprehension-inference-hardening`,
`pnpm run check:v38-read-need-comprehension-inference-hardening`, and
`pnpm run check:v38-gate6`.
V38 Gate 7 adds `V38ReadFitsFindingSearchEmbeddings` through
`scripts/specifying/src/canonical/read-fits-finding-search-embeddings.js` and
the source-safe generated artifact
`.proofs/v38/read-fits-finding-search-embeddings.json`.
The search report proves accepted-Need admission, source-safe query planning,
many-fit depository discovery, active OpenAI embedding/vector policy,
threshold verification, selected-fit provenance, and source-safe search
receipt coverage. The receipt binds 7 phases, 8 PTRR agents, 32 PTRR steps, 96
Failsafe sequences, 96 ThricifiedGeneration chains, 288 provider-call slots, 4
tool contracts, 7 search channels, 12 default selected-candidate slots,
embedding policy, query roots, ranking roots, candidate counts, and provenance
roots while preserving protected source and raw provider response privacy.
The maintained commands are
`pnpm run generate:v38-read-fits-finding-search-embeddings`,
`pnpm run check:v38-read-fits-finding-search-embeddings`, and
`pnpm run check:v38-gate7`.
V38 Gate 8 adds `V38AssetPackSynthesisEconomicTraceability` through
`scripts/specifying/src/canonical/assetpack-synthesis-economic-traceability.js`
and the source-safe generated artifact
`.proofs/v38/assetpack-synthesis-economic-traceability.json`.
The economic traceability report proves selected-fit handoff into AssetPack
synthesis, source-safe preview, deterministic BTC quote, BTD mint/read/rights
receipts, source-to-shares contributor allocation, settlement unlock,
post-settlement delivery, ledger/database reconciliation, repair actions, and
harness evidence projection while preserving protected source and private
settlement payload privacy.
The maintained commands are
`pnpm run generate:v38-assetpack-synthesis-economic-traceability`,
`pnpm run check:v38-assetpack-synthesis-economic-traceability`, and
`pnpm run check:v38-gate8`.
V38 Gate 9 adds `V38ConversationToolPromptInferenceParity` through
`scripts/specifying/src/canonical/conversation-tool-prompt-inference-parity.js`
and the source-safe generated artifact
`.proofs/v38/conversation-tool-prompt-inference-parity.json`.
The parity report proves comprehensive and quick-response Conversation PTRR
variations, Conversation agent/step prompt registries, typed output schemas,
source-safe stream telemetry, rich execution-log UI rendering,
DocCodeToolPrompt formatting, ToolPromptRegistry hierarchy, ChatGPT App
doc-code prompt carriers, read-access checks, organization-authority checks,
and interface no-bypass posture while preserving protected source, raw prompt,
raw provider response, credential, private wallet, private settlement, and
unpaid AssetPack privacy.
The maintained commands are
`pnpm run generate:v38-conversation-tool-prompt-inference-parity`,
`pnpm run check:v38-conversation-tool-prompt-inference-parity`, and
`pnpm run check:v38-gate9`.
V38 Gate 10 adds `V38LocalStagingInferenceDepositorySearchRehearsal` through
`scripts/specifying/src/canonical/local-staging-inference-depository-search-rehearsal.js`
and the source-safe generated artifact
`.proofs/v38/local-staging-inference-depository-search-rehearsal.json`.
The rehearsal report proves local and staging-testnet lanes for Vercel Sandbox
harness opt-in, bounded real-inference route preflight, Supabase readback,
ReadNeedComprehensionSynthesis, ReadFitsFindingSynthesis, many-fit depository
search, source-safe AssetPack preview, telemetry streaming/readback,
ledger/database posture, and blocked production-mainnet value-bearing
admission while preserving protected source, raw prompt, raw provider response,
live log payload, credential, wallet, private settlement, and unpaid AssetPack
privacy.
The maintained commands are
`pnpm run generate:v38-local-staging-inference-depository-search-rehearsal`,
`pnpm run check:v38-local-staging-inference-depository-search-rehearsal`, and
`pnpm run check:v38-gate10`.
V38 Gate 11 adds `V38InferencePromotionReadinessReport` through
`scripts/specifying/src/canonical/inference-promotion-readiness-report.js`
and the source-safe generated artifact
`.proofs/v38/promotion-readiness-report.json`.
The promotion readiness report proves every V38 inference artifact is covered,
parseable, and source-safe; binds `BITCODE_SPEC_V38_PROVEN.md` generation
support, `v38-canon-promotion.yml`, promotion command dry-run support,
gate/canon workflow posture, and runtime preparation for `V38` active, `V39` draft;
and blocks value-bearing mainnet admission while preserving protected
source, raw protected prompt, raw provider response, credential, wallet,
private settlement, and unpaid AssetPack privacy.
The maintained commands are
`pnpm run generate:v38-promotion-readiness`,
`pnpm run check:v38-promotion-readiness`, and `pnpm run check:v38-gate11`.
V39 Gate 11 adds `V39CommercialReadingPromotionReadinessReport` through
`scripts/specifying/src/canonical/v39-commercial-reading-promotion-readiness-report.js`
and the generated source-safe artifact `.proofs/v39/promotion-readiness-report.json`.
The report verifies all V39 commercial Reading artifacts are covered, parseable,
and source-safe; binds `BITCODE_SPEC_V39_PROVEN.md` generation support,
`v39-canon-promotion.yml`, promotion command dry-run support, gate/canon
workflow posture, and runtime preparation for `V39` active, `V40` draft; and
blocks value-bearing mainnet admission while preserving protected source, raw
protected prompt, raw provider response, credential, wallet, private settlement,
and unpaid AssetPack privacy. Use `pnpm run generate:v39-promotion-readiness`,
`pnpm run check:v39-promotion-readiness`, and `pnpm run check:v39-gate11`.
V37 Gate 1 opens the Website Conversations spec family and `check:v37-gate1`.
V37 Gate 2 adds source-safe `ConversationSession` route-history contracts
through `buildConversationSessionRouteHistory` and
`.proofs/v37/conversation-session-route-history.json`.
The route-history artifact covers create, restore, branch, retry, redact, and
stream operations while keeping conversation state route-local rather than
global ledger truth.
V37 Gate 3 adds source-safe `ConversationStreamEvent` stream UI/event contracts
through `buildConversationStreamEventContract` and
`.proofs/v37/conversation-stream-event-contract.json`.
The stream event artifact covers model delta, tool call, retrieval summary,
proof root, retry state, completion decision, and error row events while
keeping stream telemetry source-safe and compatible with the shared rich
execution log UI.
V37 Gate 4 adds source-safe `ConversationWritingWorkspace` fullscreen composer
contracts through `buildConversationWritingWorkspace` and
`.proofs/v37/conversation-writing-workspace.json`.
The writing workspace artifact covers Read Request, Need feedback, AssetPack
review note, and product handoff summary modes with save, restore, summarize,
and handoff actions while keeping emitted summaries source-safe and keeping
product as transaction authority.
V37 Gate 5 adds source-safe `ConversationSourceSelector` context-policy
contracts through `buildConversationSourceSelector` and
`.proofs/v37/conversation-source-selector.json`. The source selector artifact
covers repository, branch, commit, deposit, BTD range, AssetPack preview,
document, and prior conversation selectors with account, organization, wallet,
rights, settlement, disclosure, and policy governance while keeping protected
source and unpaid AssetPack source outside Conversations.
V37 Gate 6 adds source-safe `ConversationProductHandoff` transaction handoff
contracts through `buildConversationProductHandoff` and
`.proofs/v37/conversation-product-handoff.json`. The handoff artifact covers
Depositing, Reading, Finding Fits, Exchange, settlement, and delivery
workflows while preserving route context and keeping ledger writes, wallet
signing, protected source, and unpaid AssetPack source outside Conversations.
V37 Gate 7 adds source-safe `ConversationPersistencePrivacyRedaction` durable
storage privacy contracts through
`buildConversationPersistencePrivacyRedaction` and
`.proofs/v37/conversation-persistence-privacy-redaction.json`. The
persistence privacy artifact covers every visibility tier, persist message,
restore history, export history, delete history, retain history, replay
history, and incident repair while redacting protected prompts, protected model
responses, protected source, secrets, wallet private material, and unpaid
AssetPack source before storage or source-safe export.
V37 Gate 8 adds source-safe `ConversationTelemetryProofHooks` dashboard and
runbook contracts through `buildConversationTelemetryProofHooks` and
`.proofs/v37/conversation-telemetry-proof-hooks.json`. The telemetry proof
artifact covers session, message, stream, tool, source selector, product
handoff, retry, error, and completion families while keeping raw protected
prompts, protected source, protected model responses, provider tokens, wallet
private material, settlement private payloads, ledger authority, wallet
signing authority, and unpaid AssetPack source out of telemetry.
V37 Gate 9 adds source-safe `ConversationRehearsal` local/staging proof
contracts through `buildConversationRehearsal` and
`.proofs/v37/conversation-rehearsal.json`. Local and staging-testnet
rehearsals exercise chat, streaming, writing, source selector, product
handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots
are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet
blocking are visible through `source-safe-conversation-rehearsal-metadata`.
V37 Gate 10 adds source-safe `ConversationPromotionReadinessReport`
promotion readiness contracts through `buildConversationPromotionReadinessReport`
and `.proofs/v37/promotion-readiness-report.json`. The readiness report
covers all V37 Conversation artifacts, generated `BITCODE_SPEC_V37_PROVEN.md`
support, `v37-canon-promotion.yml`, promotion dry-run support, and runtime
posture preparation from `V36` active, `V37` draft to `V37` active, `V38`
draft after V37 promotion while keeping credentials, protected source, raw
protected prompts, unpaid AssetPack source, and wallet private material out of
generated metadata.
This Gate 10 posture is `V37` active, `V38` draft after V37 promotion.

Gate 9 exact rehearsal statement: local and staging-testnet rehearsals exercise chat, streaming, writing, source selector, product handoff, restore, retry, redaction, and error flows. Rehearsal logs/screenshots are source-safe. Route/UI checks, telemetry roots, and value-bearing mainnet blocking are visible.
V36 Gate 2 adds the source-safe Exchange activity book through
`buildExchangeActivityBook` and `.proofs/v36/exchange-activity-book.json`.
The activity detail never exposes protected source or unpaid AssetPack content.
V36 Gate 3 adds source-safe Exchange intent/order contracts through
`buildExchangeIntentOrderContracts` and
`.proofs/v36/exchange-intent-order-contracts.json`.
Each transition names actor principal, organization role, wallet posture,
authority proof, idempotency key, policy decision, and fail-closed result.
The order history is replayable without private wallet material or secrets.
V36 Gate 4 adds source-safe Exchange rights-transfer review through
`buildExchangeRightsTransferReview` and
`.proofs/v36/exchange-rights-transfer-review.json`.
`ExchangeRightsTransferPreview` names BTD range identity, current owner,
requested buyer, rights scope, settlement unlock condition, and disclosure
limit while distinguishing owner-read, licensed-read, and blocked transfer.
AssetPack source is hidden until paid settlement and rights transfer are
complete.
V36 Gate 5 adds source-safe Exchange pricing through
`buildExchangePricingQuote` and
`.proofs/v36/pricing-liquidity-fee-quote.json`.
`ExchangePricingQuote` names BTC amount, measurement weight, measurement volume, liquidity band, wrapper analysis, treasury route, depositor route, reader route, and quote root.
The source-safe verdict is `source-safe-exchange-pricing-quote-metadata`;
wrapper analysis cannot make BTD range cells fungible chain-of-record assets,
and underpayment, overpayment, stale quote, or unsupported network posture fails closed.
V36 Gate 6 adds source-safe Exchange settlement reconciliation through
`buildExchangeSettlementReconciliation` and
`.proofs/v36/exchange-settlement-reconciliation.json`.
`ExchangeSettlementReceipt` binds payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id.
The source-safe verdict is
`source-safe-exchange-settlement-reconciliation-metadata`; observers and repair jobs reconcile database projections to ledger truth, and settlement finality and delivery are auditable.
V36 Gate 7 adds source-safe Exchange dispute repair and revenue routing through
`buildExchangeDisputeRepairRevenueRoute` and
`.proofs/v36/exchange-dispute-repair-revenue-route.json`.
`ExchangeDisputeRepairCase` covers stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch.
`ExchangeRevenueRoute` covers depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof.
The source-safe verdict is
`source-safe-exchange-dispute-repair-revenue-route-metadata`; runbooks and repair commands are source-safe and proof-rooted.

V36 Gate 8 adds source-safe Exchange UX proof through `buildExchangeUxProof`
and `.proofs/v36/exchange-ux-proof.json`.
`ExchangeUxProof` covers market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state.
product can hand off to Exchange without losing transaction context.
collapsed UI gives readable status and expanded UI exposes source-safe detail.
Exchange telemetry dashboards remain source-safe and proof-rooted.
The source-safe verdict is `source-safe-exchange-ux-proof-metadata`.

V36 Gate 9 adds source-safe Exchange rehearsal through
`buildExchangeRehearsal` and `.proofs/v36/exchange-rehearsal.json`.
`ExchangeRehearsal` proves that local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows.
It proves that rehearsal logs/screenshots are source-safe.
It also proves that ledger/database synchronization and value-bearing mainnet blocking are visible.
The source-safe verdict is `source-safe-exchange-rehearsal-metadata`.

Historical promotion posture remains reproducible. V34 Gate 10 accepted the
`V34` active, `V35` draft posture for deployment-depth promotion and remains
validated by `check:v34-gate10` and `v34-canon-promotion.yml` as promoted
history.

V35 Gate 2 adds the source-safe documentation surface catalog through
`buildDocumentationSurfaceCatalog` and
`.proofs/v35/documentation-surface-catalog.json`.
V35 Gate 3 adds the source-safe telemetry taxonomy catalog through
`buildTelemetryTaxonomyCatalog` and
`.proofs/v35/telemetry-taxonomy-catalog.json`.
V35 Gate 4 adds the source-safe public docs usage guide catalog through
`buildPublicDocsUsageGuideCatalog` and
`.proofs/v35/public-docs-usage-guides.json`.
V35 Gate 5 adds the source-safe operator runbook catalog through
`buildOperatorRunbookCatalog` and
`.proofs/v35/operator-runbook-catalog.json`.
V35 Gate 6 adds the source-safe docs QA alignment report through
`buildDocsQaAlignmentReport` and
`.proofs/v35/docs-qa-alignment-report.json`.
V35 Gate 7 adds the source-safe testnet rollout readiness guide through
`buildTestnetRolloutReadinessGuide` and
`.proofs/v35/testnet-rollout-readiness-guide.json`.
V35 Gate 8 adds the source-safe telemetry documentation interface integration
report through `buildTelemetryDocumentationInterfaceIntegration` and
`.proofs/v35/telemetry-documentation-interface-integration.json`.
V35 Gate 9 adds the source-safe local/staging telemetry documentation rehearsal
through `buildLocalStagingTelemetryDocumentationRehearsal` and
`.proofs/v35/local-staging-telemetry-documentation-rehearsal.json`.
V37 gates add Conversations helpers without importing
`protocol-demonstration/src/*`.

V35 Gate 10 closed the package/runtime promotion boundary and the V35 promotion
workflow rewrote the package posture to `V35` active, `V36` draft after
promotion validations and generated proof output passed. V36 promotion rewrote
this package to `V36` active, `V37` draft only after all Exchange gates closed.
V36 Gate 10 closes that Exchange promotion boundary through package-owned
`ExchangePromotionReadinessReport`, `.proofs/v36/promotion-readiness-report.json`,
`check:v36-gate10`, and `v36-canon-promotion.yml`. The post-promotion posture is
`V36` active, `V37` draft, and the generated evidence remains source-safe.
V37 promotion will eventually rewrite this package to `V37` active, `V38` draft
only after all Conversations gates close.

The package boundary is enforced by `scripts/specifying` tests, the UAPI
commercial protocol boundary test, and V37 gate checks.
