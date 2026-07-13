# V26 Shippable Reform

## Status

- Scope: supplementary V26 reform note for the retained `packages/asset-packs-pipelines/domain/*` corridor
- Canonical pointer: `/Users/garrettmaring/Developer/ENGI/BITCODE_SPEC.txt -> V26`
- Purpose: use the non-Bitcode `deliverable` family as a trace surface while removing it from active Bitcode shippable semantics
- Generic strategy companion: `protocol-demonstration/V26_REFORM_STRATEGY.md`
- Pipeline phase companion: `protocol-demonstration/V26_PIPELINE_FINISH_REFORM.md`

## Rule

`deliverable` is not a Bitcode concept.
Within V26, `deliverable` is a trace word for non-Bitcode residue. It may appear only as a physical migration identifier in generated schema, third-party storage, or bounded promptpart source that has not yet been renamed at the storage/proof boundary. It must not remain as an active route, payload field, application data model, reusable infrastructure name, exported API alias, mock feature, template category, email-template identifier, or algorithmic branch.

The canonical Bitcode concepts are:
- `read`
  The measured or expressed target the system is trying to satisfy.
- `asset pack`
  The Bitcode-owned bundle/selection/materialization structure for source-bearing output.
- `AssetPack synthesis artifact`
  The Read-satisfying implementation-phase output synthesized by the AssetPack pipeline before Finish stores evidence or invokes a connected-interface handoff.
- `stored AssetPack evidence`
  The Exchange-rereadable evidence and receipt material saved by Finish for proof, settlement, Terminal reread, and later delivery.
- `AssetPack completion`
  The final Finish-owned reread payload for an AssetPack run. It replaces the non-Bitcode `finalWorkSummary` / `final_work_summary` concept and carries summary, `assetPackSynthesisArtifacts`, `writtenAssets`, `shippables`, `deliveryMechanism`, `read`, `writtenAssetType`, `assetPack`, `processingStats`, and `repoSnapshot`.
- `Shippable`
  A connected-interface object that Finish can deliver after AssetPack evidence exists. V26 commercial delivery supports GitHub pull-request Shippables only.
- `delivery mechanism`
  The destination-specific procedure, tool, and template used to deliver a Shippable to a third-party destination after validation. V26 admits only the pull-request delivery mechanism.

The V26 Shippable form is:
- a GitHub pull request

## Required mapping

The retained `packages/asset-packs-pipelines/domain/*` corridor is therefore interpreted as:
- `deliverable pipeline`
  non-Bitcode path naming for an AssetPack synthesis and stored-evidence corridor; active code should move toward AssetPack / Shippable route, type, and payload names rather than introducing new `deliverable` wrappers
- `deliverableType`
  removed as an active field; it may be searched only to find and reform stale request/delivery hint logic
- `DeliverableType`
  removed as an active package primitive; current source owns the canonical AssetPack written-asset kind through `AssetPackWrittenAssetType.ReadSatisfactionAssetPack`
- `searchRelevantDeliverables`
  removed as an active helper name; current source owns prior-run context search through `searchRelevantAssetPackEvidence`
- `comprehend-task`
  non-Bitcode step naming; active setup and prompt module entry points are removed in favor of `comprehend-read`
- former acceptance-field inputs
  historical carriers for expressed read, acceptance shape, and AssetPack expectation that are recorded in NOTES/DELTA rather than active AssetPack source semantics

## V26 reform requirement

Where physical storage identifiers still include `deliverable` during V26:
- the live Bitcode meaning is a read-satisfying agentic pipeline run, not a product concept named `deliverable`
- active code must translate those physical identifiers at the storage edge and must not re-export them into client contracts, route contracts, template APIs, notification APIs, or UI props
- each run synthesizes AssetPack synthesis artifacts and stores AssetPack evidence before producing a PR Shippable
- the canonical broad final phase is now `Finish`; old `Shipping` phase names are reform history and may not remain as active AssetPack phase, registry, tool, or store ownership
- `Delivering` is the narrower Finish subresponsibility that provides AssetPack-backed Shippables to third-party tools and destinations; V26 supports the GitHub pull-request path only
- the Finish phase emits `shippables` as connected-interface objects such as `Shippable.GitHubPullRequest`; `deliverables` must not be emitted as a retained mirror on new V26 writes
- spec text must teach `asset pack`, `AssetPack synthesis artifact`, `stored AssetPack evidence`, `Shippable`, and `delivery mechanism` as the Bitcode semantics
- comments, descriptions, and exported names inside the retained corridor should use `comprehend read` where behavior is about Read understanding
- execution stores and postprocessed artifacts must use semantic `read`, canonical `writtenAssetType = read-satisfaction-asset-pack`, `writtenAssetRequest`, `deliveryMechanismTemplate = pull-request`, `assetPackCompletion`, `assetPackSynthesisArtifacts`, `writtenAssets`, `shippables`, and `deliveryMechanism` so later-gate reform does not have to recover meaning from non-Bitcode keys
- internal implementation and validation logic must resolve one canonical AssetPack synthesis kind from `read` and proof evidence; Finish/Delivering must resolve the single V26 `pull-request` delivery mechanism, so the retained corridor shapes live protocol behavior through Bitcode's commercial infrastructure rather than silently recentering non-Bitcode `deliverableType` logic
- package-owned filesystem and export names must prefer current Bitcode objects before compatibility payloads: `packages/asset-packs-pipelines/domain/src/types/AssetPackWrittenAssetType.ts` owns written-asset kinds, `searchRelevantAssetPackEvidence` owns prior AssetPack evidence lookup, and stale `DeliverableType.ts` / `searchRelevantDeliverables` / shipping-wrapper test files are not active V26 surfaces
- read routes, workspace-run summaries, mock reread projections, and active UI detail surfaces should prefer primary `assetPackSynthesisArtifacts` for Bitcode-owned AssetPack artifact/evidence and file-change meaning, expose `writtenAssets` only as a semantic reread of those artifacts, and expose `shippables` / `deliveryMechanism` only for the PR delivery object
- the operator-facing executions header and active route/API surface must teach this corridor as asset-pack synthesis plus Finish/Delivering mechanisms; `/api/deliverables` compatibility mounting is removed from active V26 source
- streamed completion payloads must emit primary `assetPackSynthesisArtifacts` plus semantic `writtenAssets`, `shippables`, `deliveryMechanism`, `read`, `writtenAssetType`, and `assetPack` fields; `actions` may remain only as the command-result envelope, not as a `deliverables` mirror
- active route persistence must store route-preprocess snapshots and completion metadata under semantic `assetPackWrittenAsset` / `read` / `assetPack` / `writtenAssetType` aliases, so route entry, persistence, and reread all carry Bitcode-owned meaning instead of public compatibility route naming
- telemetry, notifications, email subjects, and email-template IDs must use AssetPack and Shippable names; compatibility identifiers are not V26-active wrappers
- active notification run types must use `asset-pack` and `read-measurement`, link into `/executions/:runId` as the Terminal execution bridge, and render user-facing copy as AssetPack or Read-measurement execution status rather than route/table compatibility nouns
- active support rails must now follow the same noun/verb discipline: streams expose `createShippablesStream`, branch helpers expose `branchAssetPackRun`, MCP exposes `AssetPackPipelineToolSchema` and `PipelineNameValues = ['asset-pack']`, UI and Storybook owners live under `shippables`, drymock scenarios live under `asset-pack-scenarios`, and Finish agents deliver Shippables rather than "shipping deliverables"
- active mock infrastructure is TypeScript source only for core owners (`core`, `engines`, `generators`, `integration`, `middleware`, `types`, and `index`); generated JavaScript mirrors in those source directories are removed from proof ownership, while hand-authored setup/validation scripts remain support tooling
- active operational scripts must likewise use AssetPack evidence names first; retained storage table names may remain only as literal Exchange compatibility boundaries, not script names, logs, variables, or package commands
- email-template filenames and identifiers must be AssetPack-native; raw PromptPart identifiers must likewise move to AssetPack-native owners once an equivalent Bitcode object exists, rather than remaining as bounded `deliverable` proof inputs
- retained raw promptparts and promptpart-generation scripts should describe the corridor in asset-pack-run, read-satisfaction, AssetPack synthesis artifact, stored-evidence, Shippable, and delivery-mechanism terms; where compatibility filenames and identifiers still include `deliverable`, they are active removal targets once a semantic mirror exists
- pipeline-level raw PromptParts now use `promptpart_specific_pipeline_assetpackrun_*` filesystem/export names and one canonical `read-satisfaction-asset-pack` written-asset type; `promptpart_specific_pipeline_deliverable_*` and four-way `code-change` / `code-review` / `design-change` / `design-review` prompt ownership are removal targets, not active compatibility carriers
- core discovery and implementation-planning raw PromptParts with semantic mirrors use `promptpart_specific_agent_assetpackdiscovery{understandrequirements,analyzeparallel,assesscomplexity,planimplementation}_*` filesystem/export names; `promptpart_specific_agent_deliverablediscovery{analyze,analyzeparallel,assesscomplexity,planimplementation,understandrequirements}_*` and `promptpart_specific_agent_deliverablesdiscimplplan_*` are removed after prompt text is recut to Read requirements, written-asset synthesis, repository evidence, proof evidence, complexity, validation criteria, and Finish readiness
- attachment-comprehension and file-selection discovery raw PromptParts now use `promptpart_specific_agent_assetpackdiscovery{comprehendattachments,selectfilesparallel}_*` filesystem/export names; `promptpart_specific_agent_deliverablediscovery{comprehendattachments,selectfilesparallel}_*` is removed after the prompt text is recut to attachment evidence, Read satisfaction, proof evidence, and AssetPack scope
- type-classification raw PromptParts such as `promptpart_specific_agent_deliverablesdiscidentifytype_*`, `promptpart_specific_agent_determinedeliverabletype_*`, and the misspelled `promptpart_specific_agent_determinedelieverabletype_*` are removed once V26 has canonical `writtenAssetType = read-satisfaction-asset-pack` and `deliveryMechanismTemplate = pull-request` owners
- phase-purpose, setup-comprehension, finish-finalization, asset-pack-system, implementation planning, PR-packaging, create-pull-request, and validation-ready-to-Finish promptparts must not teach deployment-ceremony-first or four-type implementation semantics where Bitcode now requires read-first AssetPack synthesis artifacts plus PR Shippables
- the validation Ready-to-Finish raw PromptPart owner is now the single `promptpart_specific_agent_assetpackvalidationreadytofinish_*` family; pre-validation `promptpart_specific_agent_readytofinish_*` and type-keyed `readytofinish{codechange,codechangereview,designdocument,designdocumentreview}` / `assetpackvalidationreadytofinish{codechange,codechangereview,designdocument,designdocumentreview}` families are removed from raw files, barrels, runtime JS, generator scripts, and proof tests
- phase-purpose raw PromptParts are current Bitcode AssetPack owners, not retained deliverable wrappers: `promptpart_specific_phase_assetpack{setup,discovery,implementation,validation,finish}_purpose_corestatement.ts` own the Setup/Discovery/Implementation/Validation/Finish phase labels, while `phase_deliverable*` and phase-level shipping PromptPart filenames are removed from active source
- admitted MCP workflow/development prompt templates and the retained `bitcode://pipelines/asset-pack/create` tool description must follow the same rule: rendered prompt text should call the live behavior a Bitcode asset-pack pipeline over source-to-shares needs, while retained URI and subtype names are labeled compatibility surfaces rather than active product canon
- all active AssetPack-family raw PromptPart doc-comment metadata must use Bitcode-native intent and version language across agent, phase, pipeline, tool, setup, discovery, implementation, validation, and Finish delivery files; `Agent semantic unit`, `Define purpose of ... deliverables`, `Adds Deliverables-specific ...`, and `Canonical deliverables ...` metadata strings may not survive as active metadata even when a bounded compatibility filename remains
- AssetPack substep PromptParts such as `*_substep_reason`, `*_substep_prepare_concise_context`, `*_substep_chunk_then_sum`, `*_substep_tools_execution`, `*_substep_structured_output`, `*_substep_stitch_until_complete`, and `*_substep_judge` must no longer use generic non-Bitcode agent phrasing; each substep must explicitly carry Bitcode read, written-asset, asset-pack, proof-evidence, Shippable, delivery-mechanism, and execution-history reread semantics appropriate to its role
- old `promptpart_specific_agent_deliverable{impl,implementation,validation}*`, `promptpart_specific_agent_deliverablesdiscoverycodebaseanalysis_*`, and `promptpart_specific_deliverables_system_*` reservoirs are removed after AssetPack synthesis, AssetPack discovery, AssetPack validation, and `asset_pack_system_*` owners exist
- non-PR Finish delivery PromptPart reservoirs (`assetpackfinishsubmitreviewdelivery`, `assetpackfinishcreateissuedelivery`, and `assetpackfinishaddissuecommentdelivery`) are removed for V26; only pull-request delivery is an active Finish delivery mechanism until later-version delivery-mechanism expansion is deliberately specified
- retained raw PromptPart TypeScript files, generated declaration metadata, and runtime JavaScript carry-through must remain parseable and content-equivalent after broad reform, so malformed benchmark score metadata or stale runtime PromptPart strings cannot preserve non-Bitcode behavior after canonical source text has moved
- AssetPack substep doc-comment metadata must also be reauthored as Bitcode metadata: `current_version` may not carry pre-Bitcode lineage, and each `intent` must describe the read-first AssetPack synthesis / stored-evidence / proof / delivery-mechanism role rather than only restating bounded compatibility file names
- setup/bootstrap entry points and prompt ports must use canonical `comprehend-read` module paths, `COMPREHENDREAD` base PromptParts, recut `ASSETPACKSETUPCOMPREHENDREAD` PromptParts, and AssetPack-native setup PromptParts for clone, risk admission, LSP evidence, and iteration readiness (`ASSETPACKSETUPCLONEREPOSITORY`, `ASSETPACKPIPELINE_CLONEVCSREPOSITORY`, `ASSETPACKSETUPDANGERWALL`, `ASSETPACKSETUPINITIALIZELSP`, and `ASSETPACKSETUPREADYTOITERATE`); discovery carriers should admit semantic `read` / `writtenAssetType` directly, with `asset-pack-comprehend-read-agent` and AssetPack setup prompts acting as active setup owners; once an old raw PromptPart family has an AssetPack-native semantic mirror, as with `deliverablesetupcomprehendtask -> assetpacksetupcomprehendread` and the setup analyze-codebase / familiarize-attachments / prepare-repository wrappers now covered by active analyze-codebase, attachment-comprehension, clone-repository, LSP, danger-wall, and ready-to-iterate owners, the old family is removed from raw files, package barrels, tests, and runtime JS rather than retained as a compatibility export
- reusable prompt package root exports must also follow the same discipline: repository-setup additions expose `PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_*` when a curated root export is needed, while `PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_DELIVERABLES_*` is not retained as a public compatibility alias
- retained maintenance/audit scripts that operate on this corridor must resolve active paths from the repository root, inspect current raw PromptPart locations, and teach `comprehend-read` / asset-pack-run semantics instead of hard-coded non-Bitcode checkouts or `comprehend-task` ownership
- retained repair, generation, and export-verification scripts must use the active `raw_promptparts` filesystem, `PROMPTPART_*` constants, portable shell/Python path resolution, and Bitcode asset-pack prompt semantics instead of the removed `raw/specific` prompt tree or non-Bitcode `@engi` import expectations
- retained discovery outputs should expose semantic `writtenAssets` / `readSatisfactionCriteria` directly so downstream Bitcode reread does not depend on non-Bitcode labels
- retained corridor entry initialization must also hydrate a registry-bearing pipeline execution context when callers still enter through a bare `Execution`, so the commercial runtime remains phase/agent/prompt/tool legible instead of depending on hidden `PipelineExecution` assumptions
- the retained package itself must clear an honest local typecheck boundary through the MCP/VCS/prompt/search support graph it still traverses, so runtime proof and asset-pack semantics are backed by a truthful source boundary rather than broad monorepo success alone
- filesystem ownership has crossed the fifth-gate threshold for this corridor: `packages/pipelines/asset-pack` and `@bitcode/pipeline-asset-pack` are the live owners, `packages/pipelines/deliverable` is removed from active source, and generated JavaScript is not allowed under the AssetPack package `src/` tree
- once a trace has identified the equivalent Bitcode object, destructive cleanup is preferred over aliases; aliases are temporary aids, not retained V26 behavior
- old names may remain only as bounded raw PromptPart, table, generated-schema, or migration-boundary literals when active code names expose canonical Bitcode meaning first and the old name is not emitted as a new active payload field
- `SDIVS` / `shipping` compatibility APIs are reform residue outside active AssetPack Finish ownership; active AssetPack phase, registry, tool, and store code must use `SDIVF` / `finish` behavior directly
- former-name exports are not admissible as V26 implementation after their Bitcode replacement exists; full V26 closure requires removing these aliases rather than treating compatibility as canon
- active route logs, execution type, lineage, `/api/templates/shippables`, header props, streaming parser names, generated co-located JS cleanup, and client payload fields must use `asset-pack` / `AssetPack completion` / `shippable` source names; `/api/templates/deliverables` is not an active V26 wrapper

## V27+ Design Space

Generic third-party delivery mechanisms are a later-version design space. Reusable infrastructure may be shaped so that a future delivery mechanism can be added deliberately, but V26 must not register, advertise, type, test, or emit issue, review, comment, Jira, upload, or destination-specific delivery branches as commercial behavior.

## Non-goal

This supplement does not claim that the retained corridor is already the final Bitcode-native implementation.
It only defines how the retained family must be interpreted and repurposed during V26 so that compatibility reuse does not silently overwrite Bitcode meaning.
