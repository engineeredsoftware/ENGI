# Bitcode Spec V41 Notes

## Status

- Version: `V41`
- V41 state: canonical promotion complete; V41 notes record accepted prompt inventory, registry/interpolation, Reading baselines, ReadNeed and ReadFitsFinding prompt hardening, Conversation/tool/interface prompt rewrite, benchmark telemetry, and promotion-readiness evidence
- Current canonical/latest target: `V41`
- Canonical proof-source commit: `70be3860a54ff3dd3da5c0cac2c5b854a12910e1`
- Canonical pointer: `BITCODE_SPEC.txt` -> `V40`
- Prior canonical anchor: `BITCODE_SPEC_V40.md`
- Prior generated proof appendix: `BITCODE_SPEC_V40_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v41-spec-family-report.json`, `.bitcode/v41-canonical-input-report.json`, `.bitcode/v41-canon-posture-drift-report.json`, `.bitcode/v41-promptpart-prompt-inventory.json`, `.bitcode/v41-registry-interpolation-contracts.json`, `.bitcode/v41-reading-prompt-benchmark-baselines.json`, `.bitcode/v41-readneed-prompt-hardening.json`, `.bitcode/v41-readfitsfinding-prompt-hardening.json`, `.bitcode/v41-conversation-tool-interface-prompt-rewrite.json`, `.bitcode/v41-prompt-program-benchmark-report.json`, `.bitcode/v41-promotion-readiness-report.json`, V41 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V41_PROVEN.md` as the generated proof appendix for V41 promotion
- Source parity state: V41 source-side PromptPart and Prompt inventory, registry interpolation contracts, Reading baselines, ReadNeedComprehensionSynthesis prompt hardening, ReadFitsFindingSynthesis prompt hardening, Conversation/tool/interface prompt rewrite, prompt benchmark telemetry report, workflow, and promotion surfaces are canonicalized in the promoted V41 file family
- Draft target posture: V41 Gate 1 creates the full SPEC, DELTA, NOTES, and PARITY family.
- Scope: V41 canonical notes for prompt-program excellence over promoted V40 exhaustive commercial application testing canon
- Last fully realized canonical target preserved in source: `V41`

## Notes companion rule

This notes companion records the working prompt-program plan and simplified reading for V41.
It does not override `BITCODE_SPEC_V41.md`.
Prompt content changes remain blocked until the relevant catalogue and benchmark gates admit them.

## Gate 5 ReadNeed prompt hardening note

Gate 5 is the first admitted semantic rewrite gate.
It rewrites ReadNeedComprehensionSynthesis PromptParts so the agent synthesizes exactly and only the user's Read Request, preserves repository/branch/commit and policy context, keeps Finding Fits/BTC/BTD/delivery claims out of Need comprehension until review acceptance, and keeps protected source and unpaid AssetPack source private.

## Gate 6 ReadFitsFinding prompt hardening note

Gate 6 is the first admitted semantic rewrite of Finding Fits after accepted-Need hardening.
It rewrites ReadFitsFindingSynthesis PromptParts and bounded inference prompts so the pipeline searches broadly through the Depository, selects every qualifying fit above threshold, preserves query/ranking/selected-fit provenance roots, synthesizes only source-safe AssetPack context before settlement, and keeps source-bearing delivery, BTD rights transfer, BTC finality claims, wallet private material, and settlement private payloads out of reader-visible surfaces until post-payment unlock.
The package-backed hardening artifact currently emits 7 source-safe rows and 63 passing source predicates across prompt rewrite boundary, PTRR/Failsafe/Thricified composition, strict typed return parsing, source constraints, review/resynthesis, telemetry redaction, and read-comprehension tool prompt alignment.
The report is metadata-only: ids, hashes, counts, fixtures, parser targets, predicate verdicts, and dependency roots are allowed; raw prompt payloads, interpolated prompts, provider responses, private context, protected source, credentials, and unpaid AssetPack source remain private.

## Gate 8 implementation notes

Gate 8 makes the post-rewrite prompt benchmark and telemetry readback source-checkable.
It emits `V41PromptProgramBenchmarkReport` as `.bitcode/v41-prompt-program-benchmark-report.json`, binding V38 prompt benchmark rows, V38 inference telemetry disclosure, V38 PTRR/Failsafe/Thricified stack proof, V38 ReadFitsFinding search embeddings, V39 operational telemetry repair readback, V40 prompt benchmark smoke readiness, and V41 Gate 2 through Gate 7 artifacts.
The report records prompt-program artifact ids, telemetry receipt ids, metric ids, source hashes, source-safe benchmark delta posture, predicate verdicts, and dependency roots only.
It intentionally does not serialize raw prompt text, interpolated prompts, raw provider responses, protected prompts, protected source, private context, credentials, wallet private material, settlement private payloads, or unpaid AssetPack source.

## Gate 9: V41 Promotion Readiness Notes

Gate 9 emits `V41PromotionReadinessReport` as `.bitcode/v41-promotion-readiness-report.json`.
It binds all V41 prompt-program artifacts, source and documentation evidence, `v41-canon-promotion.yml`, gate/canon workflow posture, `BITCODE_SPEC_V41_PROVEN.md` generation support, promotion dry-run support, and active V41 / draft V42 runtime preparation.
It remains metadata-only and source-safe: ids, hashes, counts, paths, verdicts, proof roots, and source-safe summaries may be public, while raw prompt text, interpolated prompts, provider responses, protected prompts, protected source, private context, credentials, wallet material, settlement private payloads, and unpaid AssetPack source stay private.

## Gate 2 prompt inventory note

Gate 2 makes the first prompt-program catalogue concrete.
The package-backed inventory currently emits 1,459 raw PromptPart rows and 105 composed Prompt rows with source path, source hash, registry owner, semantic purpose id, prompt family ids, composed prompt memberships, template variable names, benchmark fixture ids, disclosure tier, validation command, and source-safe raw-payload exclusions.
This is an inventory and admission artifact, not a rewrite artifact.

## V42 forward roadmap note

V42 is re-roadmapped as the MVP experience version after V41.
Its focus is shortest-path Depositing, shortest-path Reading, and a strong AI-reading dominant demonstration where any deposit source can contribute proprietary or otherwise non-public training, prompt, context, or evaluation material to an AssetPack that measurably improves an AI system beyond public-data-only performance.
Depositing must minimize the path to admitting source material and later receiving BTC compensation when the deposit participates in a synthesized AssetPack.
Reading must minimize the path from Read Request to synthesized Need review/resynthesis, Finding Fits, source-safe AssetPack preview, BTD/BTC purchase and settlement, and repository delivery.
V42 must keep depositor compensation, reader purchase, BTD/AssetPack rights, and repository delivery visible in the shortest path without widening V41 beyond Prompt and PromptPart excellence.

## V43+ agentic depositing roadmap note

V43 or a later explicitly opened version should evolve the deposit side from manual source admission into an agentic AssetPack option experience for enterprises that own connected codebases.
The central object is a deposit AssetPack option: an unminted AssetPack in all but BTD, synthesized from proprietary or otherwise non-public source material and held for enterprise review before Depository admission.
BTD remains minted only when an industrial Need-Fit is made for a Reader; the deposit-side option is not BTD yet, but it is shaped as an AssetPack candidate so that future Finding Fits can search, rank, synthesize from, and compensate it cleanly.

Bitcode Agents installed in an enterprise repository should compare three live contexts:

- the enterprise's connected codebase and its evolving source/measurement state;
- the existing Bitcode Depository and pre-existing deposits/AssetPacks;
- current and historical Reading activity that indicates demand for technical knowledge.

The deposit-side synthesis pipeline should propose AssetPack options only when the option appears sub-critical to the enterprise, not likely to leak strategic or protected IP the enterprise would not sell, and likely positive ROI after considering development cost, uniqueness, expected demand, and likely future BTD mint value.
Those criteria must be configurable and promptable by the enterprise, but the default UX should minimize manual decision-making by surfacing clear approve/reject options with source-safe measurements, demand evidence, criticality assessment, ROI posture, and compensation route expectations.
Approved options enter the Bitcode Depository and become eligible for Read-Need Finding Fits; rejected options remain out of the Depository and must not be searched or disclosed.

That version should also split the product navigation now concentrated in `/terminal`.
`/read` should own Read Request submission, synthesized Need review/resynthesis, Finding Fits, source-safe AssetPack preview, purchase, settlement, and repository delivery.
`/deposit` should own connected repository state, agentic deposit AssetPack option synthesis, manual reruns reflecting the latest connected repositories and Bitcode state, approve/reject review, Depository admission, and later compensation readback.
`/exchange` should be renamed to `/packs` across routes, code naming, docs, and operator vocabulary, because the product object is AssetPacks and BTD rights rather than a generic exchange abstraction.

## Gate 3 registry and interpolation contract note

Gate 3 makes the prompt registry call chain source-checkable before prompt rewrites.
The package-backed contract currently emits 12 rows and 65 source predicates for Prompt registry totality, TemplatedPromptPart interpolation, PTRR agent and step prompt composition, FailsafeGenerationSequence context handling, ThricifiedGeneration final prompt resolution, execution ancestry overlays, tool doc-code prompt injection, Reading parser targets, Finding Fits search and embedding contracts, AssetPack synthesis and finishing parser targets, and Gate 2 inventory binding.
The artifact records ids, source paths, hashes, predicate verdicts, parser target ids, interpolation key ids, and ancestry frame ids only; it does not serialize raw prompt text, provider responses, private context, credentials, or unpaid AssetPack source.

## Gate 4 Reading benchmark baseline note

Gate 4 makes Reading prompt quality source-checkable before prompt rewrites.
The package-backed baseline currently emits 10 rows and 120 source predicates for Read Request-to-Need synthesis, Need review/resynthesis, Need measurement and quote posture, Finding Fits query synthesis, many-candidate ranking, AssetPack synthesis context, source-safe AssetPack preview, settlement/rights/delivery, telemetry summaries, and failure/repair prompts.
The artifact binds both Reading pipelines, all five Reading UX steps, Gate 2 prompt inventory, Gate 3 registry/interpolation contracts, V38 benchmark fixtures, V40 prompt smoke readiness, parser target ids, and source-safe score metadata only; it does not serialize raw prompt text, interpolated prompts, provider responses, private context, protected source, credentials, or unpaid AssetPack source.

## Concise current-system reading

Bitcode is active at V40.
V41 now drafts the next canon: every PromptPart and composed Prompt must become catalogue-visible, benchmarkable, registry-bound, interpolation-checked, parser-typed, and source-safe.
The first priority is Reading through `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`; Conversation, tool-definition, and interface prompts follow with the same discipline.
Gate 7 currently applies that discipline to Conversation, tool-definition, MCP API, ChatGPT App, public API, Terminal, and other interface prompts with source-safe rows for route authority, source selection, rich stream-log disclosure, tool schemas, parsed return types, and no protected prompt/source/settlement/wallet/unpaid AssetPack payload serialization.

## Simplified-spec reading rule

Read V41 as prompts as programs.
If a prompt cannot be found in the catalogue, traced through a registry, benchmarked against fixtures, tied to a parsed return type, and projected source-safely into telemetry, it is not V41-ready.

## Notes-only draft rule

This heading is retained as historical context only.
V41 is no longer notes-only after Gate 1; the full V41 specification family is the draft target.

## Deferred from V40

V40 deliberately stopped at exhaustive commercial application testing, browser proof, integration coverage, ledger/storage synchronization, local/staging rehearsal automation, and prompt benchmark smoke.
V41 inherits that tested base and now concentrates on prompts as programs.

Deferred V41 work must account for:

- Bitcoin: prompt changes must preserve BTC fee, settlement, rights, and disclosure boundaries.
- GitHub: prompt changes must preserve source-safe pull-request delivery and repository-bound Reading context.
- compute: prompt benchmarks and inference callsite audits must remain runnable in local and staged compute lanes.
- storage: prompt catalogues, benchmark outputs, and telemetry roots must avoid serializing protected prompt payloads, raw provider responses, secrets, or unpaid AssetPack source.
- build/process: V41 must add gate checks, package tests, generated reports, and workflow coverage before any prompt rewrite is considered closed.

## Candidate V41 workstreams

- Open the V41 full specification family and roadmap gate plan.
- Catalogue every raw PromptPart and every composed Prompt used by Reading, Conversation, tool-definition, and interface inference.
- Audit every registry edge, interpolation variable, prompt template, context binding, benchmark fixture, benchmark output, inference callsite, and parsed return type.
- Repartition PromptParts into meaningfully benchmarkable semantic units where the current division hides testable purpose.
- Retitle and rewrite PromptParts and Prompts only where benchmark and callsite evidence show measurable quality or maintainability improvement.
- Harden Prompt and PromptPart benchmark commands so smoke, focused, and promotion suites can compare prompt-program behavior without exposing protected content.
- Prioritize `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, then apply the same catalogue and benchmark discipline to Conversation and other inference prompts.

## Non-goals during V41 opening

- Do not change prompt content before V41 Gate 1 defines the full gate plan and proof surfaces.
- Do not expose protected prompts, raw provider responses, secrets, wallet material, unpaid AssetPack source, private settlement payloads, or source-bearing delivery content in generated artifacts or tests.
- Do not weaken V38 inference call-stack requirements or V40 testing requirements to make prompt changes easier.
- Do not reopen V40 testing gates unless V41 finds a concrete regression that must be repaired before prompt-program work can proceed.
