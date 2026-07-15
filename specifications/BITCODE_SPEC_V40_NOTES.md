# Bitcode Spec V40 Notes

## Status

- Version: `V40`
- V40 state: canonical promotion complete; V40 notes record accepted test inventory, unit coverage, API integration, Reading pipeline integration, Conversation/Terminal integration, browser proof, ledger/storage synchronization, local/staging rehearsal, prompt benchmark smoke, and promotion-readiness evidence
- Current canonical/latest target: `V40`
- Canonical proof-source commit: `a5d169eda05cceb66b78f268e888b10c42542aaa`
- Prior canonical anchor: `BITCODE_SPEC_V39.md`
- Prior generated proof appendix: `BITCODE_SPEC_V39_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v40-spec-family-report.json`, `.bitcode/v40-canonical-input-report.json`, `.bitcode/v40-canon-posture-drift-report.json`, `.bitcode/v40-test-inventory-coverage-matrix.json`, `.bitcode/v40-unit-coverage-inventory.json`, `.bitcode/v40-api-integration-contracts.json`, `.bitcode/v40-reading-pipeline-integration-coverage.json`, `.bitcode/v40-conversation-terminal-integration.json`, `.bitcode/v40-browser-e2e-visual-proof.json`, `.bitcode/v40-ledger-storage-sync.json`, `.bitcode/v40-local-staging-rehearsal-automation.json`, `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json`, `.bitcode/v40-promotion-readiness-report.json`, V40 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V40_PROVEN.md` as the generated proof appendix for V40 promotion
- Source parity state: V40 source-side test inventory, unit coverage, API integration contracts, Reading pipeline integration, Conversation/Terminal integration, browser E2E visual proof, ledger/database/storage synchronization, local/staging rehearsal automation, prompt benchmark smoke, workflow, and promotion surfaces are canonicalized in the promoted V40 file family
- Scope: V40 canonical notes for exhaustive commercial application testing over promoted V39 commercial Reading readiness canon
- Last fully realized canonical target preserved in source: `V40`

## Notes companion rule

These notes clarify V40 testing intent.
They are binding for V40 gate work while `BITCODE_SPEC.txt` remains `V39`, but the active canon remains V39 until V40 promotion.

## Concise current-system reading

V39 is active canon.
V40 is the draft target for exhaustive commercial application testing.
V41 is the next planned target and must focus singularly on Prompt and PromptPart implementation quality.

## Simplified-spec reading rule

Read V40 as: make Bitcode's commercial application provably tested across the whole product and infrastructure surface before changing prompt content deeply in V41.

## V40 testing emphasis

V40 must cover:

- browser E2E across all rich website interactions and state possibilities;
- visual and screenshot comparison proof;
- accessibility and responsive proof;
- API and route integration contracts;
- pipeline primitive tests and real Reading pipeline implementation tests;
- conversation integration and telemetry tests;
- ledger, database, object-storage, wallet, settlement, rights transfer, and delivery synchronization tests;
- unit tests for packages, primitives, isolated implementations, and real commercial implementations;
- prompt benchmark smoke proof to prepare V41.

## V41 prompt-program boundary

V41 should focus on Prompt and PromptPart implementation.
Every raw PromptPart and composed Prompt should be examined, benchmarked, semantically repartitioned where useful, retitled where useful, rewritten where benchmark evidence supports it, catalogued, and tied to inference callsites.
V41 treats prompts as programs: every prompt part, composition, interpolation binding, registry edge, benchmark fixture, and inference consumer must be precise enough to review, test, compare, and improve deliberately.
The primary V41 hardening surface is the Reading inference system, including `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`; conversational interactions and other inference points must receive the same prompt-catalogue treatment after the Reading spine is accounted.
V38's inference correctness hardening provides the call-stack scaffolding, and V40's benchmark/test work provides the measurement base that makes V41 prompt rewrites auditable instead of stylistic.
V40 should make those benchmarks runnable and trustworthy, not consume the prompt-rewrite scope.
V41 must therefore treat prompt improvement as implementation work, not copy editing: raw PromptParts, composed Prompts, prompt registry edges, interpolation variables, benchmark fixtures, benchmark outputs, and downstream parsed return types are all part of the program surface.

## Candidate V40 workstreams

- Gate 1 opens specification, roadmap, workflow, and checker posture.
- Gate 2 inventories the whole test surface and missing coverage.
- Gate 3 closes unit coverage breadth.
- Gate 4 closes API and route integrations.
- Gate 5 closes Reading pipeline integration coverage.
- Gate 6 closes Conversation and Terminal integration coverage.
- Gate 7 closes browser, visual, accessibility, responsive, and screenshot proof.
- Gate 8 closes ledger/database/storage/wallet/delivery synchronization.
- Gate 9 closes local and staging-testnet rehearsals.
- Gate 10 closes prompt benchmark smoke and V41 readiness.
- Gate 11 closes promotion readiness.

## Gate 2 implementation notes

Gate 2 is closed by `V40TestInventoryCoverageMatrix`.
Its generated `.bitcode/v40-test-inventory-coverage-matrix.json` artifact names every major V40 testing surface, owner gate, source roots, command ids, generated artifact target, coverage tier, and missing-coverage closure gate.
This is an inventory and planning proof, not a substitute for the later Gate 3 through Gate 10 implementations.

## Gate 3 implementation notes

Gate 3 is closed by `V40UnitCoverageInventory`.
Its generated `.bitcode/v40-unit-coverage-inventory.json` artifact binds critical unit surfaces to package names, source roots, test paths, commands, and covered verdicts.
The covered surfaces include protocol report builders, BTD ledger/settlement/right primitives, prompt composition, PTRR agents, registry-backed tools, execution lineage, generic pipelines, Reading AssetPack units, pipeline hosts, isolated interface helpers, utility packages, and the demonstration/commercial boundary.
No missing, blocked, or exempt critical unit surface is allowed in the Gate 3 artifact.

## Gate 4 implementation notes

Gate 4 is closed by `V40ApiIntegrationContracts`.
Its generated `.bitcode/v40-api-integration-contracts.json` artifact binds critical API route integration contracts to route families, source roots, test paths, command ids, and covered verdicts.
The covered surfaces include UAPI Reading/pipeline routes, execution stream routes, Conversation routes, Auxillaries/Orbitals routes, VCS/wallet/webhook routes, public activity/template routes, package API route orchestration, package API Conversation/pipeline routes, MCP execution interface contracts, and ChatGPT App action contracts.
No missing, blocked, or exempt critical API route integration contract surface is allowed in the Gate 4 artifact.

## Gate 5 implementation notes

Gate 5 is closed by `V40ReadingPipelineIntegrationCoverage`.
Its generated `.bitcode/v40-reading-pipeline-integration-coverage.json` artifact binds Reading pipeline integration coverage to nine source-safe rows: pipeline contract topology, `ReadNeedComprehensionSynthesis` runtime, `ReadFitsFindingSynthesis` search runtime, PTRR agent implementation integration, preview/settlement/delivery boundaries, telemetry/repair readback, Terminal API harness integration, primitive/host integration, and local/staging rehearsal integration.
The focused asset-pack package test runs a deterministic Reading path through accepted Need synthesis, many-fit Depository search, `worthy_fit` runtime evidence, source-safe AssetPack preview, settlement/right-transfer delivery boundary, and source-safe observability coverage.
The artifact records expected totals of two Reading pipelines, eleven phases, twelve PTRR agents, forty-eight PTRR steps, one hundred forty-four ThricifiedGeneration records, and four tool surfaces.
No missing, blocked, or exempt critical Reading integration row is allowed in the Gate 5 artifact, and prompt content rewriting remains deferred to V41.

## Gate 6 implementation notes

Gate 6 is closed by `V40ConversationTerminalIntegration`.
Its generated `.bitcode/v40-conversation-terminal-integration.json` artifact binds Conversation and Terminal integration coverage to eight source-safe rows: Terminal handoff route contracts, Conversation stream events projected into rich execution logs, route/API persistence and branch contracts, writing/source selector handoff, Terminal Reading state readback, Terminal harness log streaming, transaction-cockpit authority boundaries, and rehearsal/docs/interface parity.
The focused UAPI test executes the cross-surface path from a Conversation `finding_fits` handoff into Terminal query parsing, enterprise Reading `request-fit` state, Conversation stream tool-call log metadata, and Terminal harness stream projection.
No missing, blocked, or exempt critical Conversation/Terminal integration row is allowed in the Gate 6 artifact; Conversation may carry source-safe intent only, while Terminal remains the transaction, wallet, ledger, settlement, and delivery cockpit.
Prompt and PromptPart rewriting remains deferred to V41.

## Gate 7 implementation notes

Gate 7 is closed by `V40BrowserE2eVisualProof`.
Its generated `.bitcode/v40-browser-e2e-visual-proof.json` artifact binds browser E2E, visual, accessibility, and responsive proof to eight source-safe rows: Terminal enterprise Reading and transaction flow, Conversations writing/stream-log flow, Auxillaries contained-pane accessibility flow, Exchange BTD market and rights flow, Docs public learning routes, canonical viewport overflow proof, screenshot/trace baseline proof, and keyboard/landmark/status accessibility proof.
The app-owned `BITCODE_BROWSER_PROOF_CONTRACT` summarizes five product surfaces, thirteen route states, eighteen interaction states, four canonical viewports, eight accessibility assertions, and five visual proof strategies.
The focused browser spec covers five-stage Reading, selected activity detail, Conversation source-safe handoff, Exchange rights review, Docs navigation, Auxillaries live regions, reduced motion, and horizontal overflow limits under local mock data.
No missing, blocked, or exempt critical browser proof row is allowed in the Gate 7 artifact, and screenshot-only approval is explicitly rejected.

## Gate 8 implementation notes

Gate 8 is closed by `V40LedgerStorageSync`.
Its generated `.bitcode/v40-ledger-storage-sync.json` artifact binds ledger, database, object-storage, wallet, settlement, BTD rights, source-to-shares compensation, repair, and delivery synchronization to ten source-safe rows.
The app-owned `BITCODE_LEDGER_STORAGE_SYNC_CONTRACT` summarizes settlement source-to-shares, no-custody wallet authority, and post-settlement pull-request delivery surfaces with explicit delivery visibility boundaries.
The focused tests prove the existing AssetPack settlement delivery boundary, BTD BTC fee/wallet/reconciliation/source-to-shares primitives, Terminal wallet/journal/detail readbacks, and source-safe UAPI contract.
No missing, blocked, or lane-skipped critical synchronization row is allowed in the Gate 8 artifact; source-bearing delivery stays locked until payment, finality, compensation, BTD rights, and projection reconciliation agree.

## Gate 9 implementation notes

Gate 9 is closed by `V40LocalStagingRehearsalAutomation`.
Its generated `.bitcode/v40-local-staging-rehearsal-automation.json` artifact binds local and staging-testnet rehearsal automation to ten source-safe rows covering operator lane receipts, lane-bound secret-family checks, Vercel Sandbox harness execution, database stream/readback, five-stage Reading rehearsal, ledger/storage/wallet/delivery continuity, value-bearing mainnet blocking, and proof/workflow wiring.
The operator command `rehearse:v40-local-staging` emits receipts from environment presence only; secret values, protected source, raw prompts, raw provider responses, unpaid AssetPack source, wallet private material, private settlement payloads, and live log payloads are absent from the generated artifact and receipts.
Live execution remains dry-run by default and requires `BITCODE_V40_REHEARSAL_EXECUTE=1` before delegating to the Vercel Sandbox AssetPack harness.
Staging-testnet receipts bind Supabase project `tkpyosihuouusyaxtbau`, REST host `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`, real inference, and database event streaming/readback.

## Gate 10 implementation notes

Gate 10 is closed by `V40PromptBenchmarkSmokeV41Readiness`.
Its generated `.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json` artifact binds prompt benchmark smoke coverage to ten source-safe rows: benchmark report command execution, deterministic PromptPart smoke execution, deterministic composed Prompt smoke execution, V38 benchmark inventory binding, Reading prompt fixtures, Conversation and tool prompt fixtures, source-safe no-rewrite boundary, V41 prompt-program worklist, workflow wiring, and proof-system wiring.
The `prompt-benchmark:smoke` command uses a local source-safe mock provider and records benchmark scores, fixture roots, and package benchmark report counts without serializing raw prompt text, protected PromptPart source, raw provider responses, credentials, wallet private material, private settlement payloads, or unpaid AssetPack source.
Gate 10 exists to make prompt and PromptPart benchmarking runnable and auditable before V41; every prompt semantic repartition, retitle, rewrite, catalogue improvement, interpolation binding review, and callsite-quality benchmark remains V41 work.

## Gate 11: V40 Promotion Readiness

Gate 11 is closed by `V40PromotionReadinessReport`.
Its generated `.bitcode/v40-promotion-readiness-report.json` artifact binds every V40 testing gate artifact, `BITCODE_SPEC_V40_PROVEN.md`, `v40-canon-promotion.yml`, gate-quality and canon-quality workflow posture, V40 promotion script support, spec-family promotion rewriting, runtime posture rewriting, and the active V40 / draft V41 post-promotion state.
The report is source-safe metadata only: it names artifact paths, digests, evidence tokens, validation commands, and pass/fail posture, but it does not serialize secrets, protected source, raw protected prompts, raw provider responses, unpaid AssetPack source, wallet private material, private settlement payloads, or value-bearing mainnet admission.
Gate 11 makes V40 promotable only through the version branch pull request into `main`; direct `main` pushes remain inadmissible.
