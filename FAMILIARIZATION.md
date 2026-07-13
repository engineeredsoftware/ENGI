# Bitcode Codebase Familiarization Guide

Status: living map of the commercial Bitcode repository (V48 draft target; active
canon pointer on `main` is V47 until promotion).
Audience: humans and coding agents who need to read the tree file-by-file without
guessing architecture.

Companion docs (do not duplicate their contracts here):

| Doc | Role |
| --- | --- |
| `AGENTS.md` | Contributor / agent engineering law (gates, commits, Bezalel craft) |
| `BITCODE_SPEC.txt` | Active canon pointer |
| `BITCODE_SPEC_V48.md` (+ family) | Draft rebuild-alone SPEC for current work |
| `BITCODE_SPECIFYING.md` | Metaspec: Complete Implementation Derivability |
| `internal-docs/BITCODE_SOURCE_LAYOUT.md` | Filesystem / component unit contract |
| `internal-docs/TERMINOLOGY.md` | Product vs agent vocabulary |
| `uapi/ARCHITECTURE.md` | Next app architecture notes |
| `README.md` | Product entry + local dev |

---

## 0. How to use this document

Read in this order on a first pass:

1. **§1 Product model** — what Bitcode *is*
2. **§2 Spec-driven development** — where truth lives
3. **§3 Inheritance hierarchy** — the single most important engineering pattern
4. **§4 Repository map** — top-level tree
5. **§5 Packages catalog** — every package family
6. **§6 UAPI** — how the website works end-to-end
7. **§7 Experiences** — seven product surfaces + bases
8. **§8 Runtime / data / tests** — Supabase, hosts, CI
9. **§9 File-by-file reading paths** — recommended deep-dives by task
10. **§12 Terms appendix** — acronyms, hierarchy words, uapi concepts (lookup table)

When implementing: open the SPEC section for the gate, then the package path
named in G3-14 / source maps, then the experience unit under `uapi/components/`.
Use **§12** whenever an acronym or hierarchy name is unfamiliar.

---

## 1. Product model (one paragraph, then precision)

Bitcode **commoditizes technical knowledge as AssetPacks**: measured, source-safe
artifacts. **Depositors** connect source, synthesize options (SynthesizeAssetPacks
SDIVF), review, and admit packs to the **Depository**. **Readers** request a Read,
synthesize a Need, Finding Fits, preview source-safely, settle in **BTC-testnet**,
receive **BTD** rights, then entitled delivery.

| Term | Meaning |
| --- | --- |
| AssetPack | Always a *synthesized* artifact (patch descriptor + measurements + metadata), not a raw source slice |
| BTD | Weighted scalar knowledge-volume; after settlement, rights-bearing receipt |
| BTC | Settlement money; testnet-only value in V48 deployment |
| Measurement | Basis of price (absolute on deposit; Need-relative fit on read) |
| Pipeline | Product run language (UI tables, logs, history) |
| Journal | BTD ledger language |
| Terminal | **Deleted** product surface — do not reintroduce |

Launch routes: `/deposits`, `/reads`, `/packs`, Auxillaries, `/`, `/docs`.

---

## 2. Spec-driven development

### 2.1 Truth priority

1. `BITCODE_SPEC.txt` → active version id (promoted)
2. `BITCODE_SPEC_VN.md` — full-system rebuild law
3. `NOTES` — architecture intent (not stronger than SPEC)
4. `DELTA` — version decisions
5. `PARITY_MATRIX` — spec ↔ source ↔ tests ↔ gates
6. `_PROVEN_` + `.bitcode/vN-*` — generated proof artifacts

**Complete Implementation Derivability:** a reader must rebuild current Bitcode
from the active family alone — no silent inheritance from older specs or source.

### 2.2 Commit law

Every commit / gate PR title declares exactly one of:

- `(specification-only)`
- `(implementation-only)`
- `(specification-implementation)`

Example: `V48 (implementation-only): Extract ReadsNeedReviewPanel`.

### 2.3 Branches

- Version base: `version/v48`
- Gate branches: `v48/gate-N-topic`
- Never push product work straight to `main`
- Source paths are **unversioned** (no `api/v1`, no `v48-*` in identifiers)

---

## 3. The inheritance hierarchy (read this carefully)

Bitcode repeats one encapsulation pattern across agents, tools, pipelines, LLMs,
and prompts:

```
*-generics / primitive package → types, factories, composition combinators
generic-* packages → reusable base implementations
domain package (e.g. asset-pack) → product-specific specializations
uapi → HTTP + React adapters only
```

### 3.1 Agents

```
@bitcode/execution-generics Execution + Executor (lowest runtime primitive)
 ↑
@bitcode/agent-generics Agent : Executor, PTRR steps over generations
 ↑
@bitcode/generic-agents/* Base agents (VCS, danger-wall, code-editor, …)
 ↑
@bitcode/asset-packs-pipelines-domain Deposit/read SDIVF agents (setup/discovery/…)
```

### 3.1.1 Measurements

```
@bitcode/measurement-generics Measurement primitive vocabulary
 ↑
@bitcode/generic-measurements-measure-agent MeasureAgent (PTRR base)
@bitcode/generic-measurements-absolutes AbsolutesMeasureAgent
@bitcode/generic-measurements-needinesses Needinesses surface (Gate 4)
 ↑
@bitcode/generic-asset-packs-synthesis SynthesizeAssetPacksAbsolutesMeasureAgent + catalogs
@bitcode/generic-asset-packs-settle SettleAssetPacks* (Gate 6 surface)
 ↑
@bitcode/asset-packs-pipelines-domain SDIVF pipeline host (static-analysis tools, phases)
```

Package paths: `packages/measurement-generics/`, `packages/generic-measurements/*`
(incl. `tech-types/`), `packages/generic-asset-packs/{measured-patch,synthesis,settle}/`.

Hierarchy names: `Measurement` → `AbsolutesMeasureAgent` →
`SynthesizeAssetPacksAbsolutesMeasureAgent`.

### 3.1.2 Generations (FailsafeGeneration + ThinkingsGeneration)

```
Generation # primitive (@bitcode/generation-generics)
 ↑
FailsafeGeneration # base kinds: PCC / ChunkThenSum / Stitch
ThinkingsGeneration # base kinds: Reason → Judge → StructuredOutput
 ↑
@bitcode/generic-generations-failsafes failsafes/ — prepared-context + Failsafe surface
@bitcode/generic-generations-thinkings thinkings/ — Thinkings vocabulary surface
 ↑
@bitcode/agent-generics Agent primitive; LLM-bound generation factories
 ↑
@bitcode/generic-agents-ptrr PTRRAgent steps compose Failsafe + Thinkings
 ↑
product agents specialized prompts/tools (no reimplementation)
```

Package paths: `packages/generic-generations/{failsafes,thinkings}/`,
`packages/generic-agents/PTRR/`.

**PTRR** (Plan / Try / Refine / Retry) is the base Agent step model
(`@bitcode/generic-agents-ptrr`). Each step runs **FailsafeGeneration** kinds:

1. **PrepareConciseContext** — select execution-state *keys* (not values)
2. **ChunkThenSum** — task generation; chunk only if request too large
3. **StitchUntilComplete** — repair schema-incomplete/truncated output

Each FailsafeGeneration runs **ThinkingsGeneration**: Reason → Judge → StructuredOutput.
Tools run after failsafes (postprocess).

**Legacy naming :** `FailsafeGeneration`, `ThinkingsGeneration`, `SubStep` —
SubStep was the old term for Generation within a Step; Meta is not a term. Prefer
`FailsafeGeneration` / `ThinkingsGeneration`.

Prepared-context types (`PreparedContext`, `prepareConciseContext`, …) live with
**failsafes** (`@bitcode/generic-generations-failsafes`) — they select Execution
state **keys**, not a second state bag.

### 3.1.2b Execution / Executor hierarchy (no separate Context state)

```
@bitcode/execution-generics Execution (state primitive)
@bitcode/executor-generics Executor (sequence primitive)
 ↑
@bitcode/generic-executors sequential, parallel, pipe, retry, …
@bitcode/generic-executions process-root Execution helpers
 ↑
product pipelines / agents own Execution trees
```

Process defaults formerly called `GlobalContext` are a **process-root Execution**
(`initializeProcessRoot` / `getProcessRootExecution`). Prefer `@bitcode/generic-executions`;
Process-root helpers live in `@bitcode/generic-executions` (also re-exported from `@bitcode/execution-generics`). There is no `@bitcode/context-generics` dual.

LLM-bound failsafe/thinkings **factories** still execute via `AgentExecution`
inside `agent-generics` until inverted onto pure Execution + LLM registry.

| Layer | Type name | Factory / kinds |
| --- | --- | --- |
| Primitive | `Generation` | typed Executor |
| Base | `FailsafeGeneration` | PCC / ChunkThenSum / Stitch kinds |
| Base | `ThinkingsGeneration` | Reason / Judge / StructuredOutput kinds |
| Primitive | `Agent` | `factoryAgent`, `factoryQuickAgent` |
| Base + primitive | `PTRRAgent` | `factoryPTRRAgent` |
| Specific | product agents | specialized configs over `factoryPTRRAgent` |

### 3.1.3 AssetPacks (primitive → measured-patch → product)

```
@bitcode/asset-packs-generics AssetPack primitive (protocol minimum)
 ↑
@bitcode/generic-asset-packs-measured-patch MeasuredPatchAssetPack (only AP base)
@bitcode/generic-asset-packs-synthesis Synthesize measurement catalogs / Absolutes agent
@bitcode/generic-asset-packs-settle Settle product surface
 ↑
@bitcode/asset-packs-pipelines-* synthesize-deposits / -reads / settle-reads
@bitcode/asset-packs-pipelines-domain agents, tools, deposit options helpers
```

Package paths: `packages/asset-packs-generics/`, `packages/generic-asset-packs/*`.
Packages: `@bitcode/asset-packs-generics`, `@bitcode/generic-asset-packs-synthesis`, `@bitcode/generic-asset-packs-settle`.

| Layer | Type | Role |
| --- | --- | --- |
| Primitive | `AssetPack` | identity + source binding + patch descriptor + delivery |
| Base | `MeasuredPatchAssetPack` | + measurements, neediness, provenant paths |
| Product surfaces | synthesis / settle packages | catalogs + product measure agents |
| Product pipelines | deposit options / pipeline outputs | project from MeasuredPatchAssetPack |

### 3.1.4 Artifacts (primitive → types + storage providers)

```
@bitcode/artifact-generics Artifact + ArtifactStorage contract
 ↑
@bitcode/generic-artifacts-patch-kind type: path+op patch
@bitcode/generic-artifacts-aws-provider storage: S3
@bitcode/generic-artifacts-supabase-provider storage: Supabase
@bitcode/generic-artifacts-vercel-provider storage: Vercel Blob
 ↑
@bitcode/generic-artifacts-compose compose providers (aws → supabase → vercel)
@bitcode/generic-asset-packs-synthesis AssetPackPatchArtifact product
```

No standalone `@bitcode/aws` package — S3 for artifacts is `generic-artifacts-aws`.

| Layer | Type | Role |
| --- | --- | --- |
| Primitive | `Artifact` / `ArtifactStorage` | identity + storage contract |
| Type base | `PatchArtifact` | path+op patch envelope |
| Storage bases | aws / supabase / vercel | provider implementations |
| Product | `AssetPackPatchArtifact` | patch bound to `assetPackId` |

### 3.1.5 Attachments (primitive → file | external)

```
@bitcode/attachment-generics BaseAttachment; categories file|external
 ↑
@bitcode/generic-attachments-file FileAttachment
@bitcode/generic-attachments-external ExternalAttachment (Externals auxillary)
 ↑
@bitcode/attachments-generics composition barrel
```

| Category | Role |
| --- | --- |
| `file` | Direct uploads |
| `external` | Externals connections (GitHub, Jira, Notion, …) — not “integration” |

Removed: `vcs`, `url`. VCS attaches as **external**.

### 3.2.0 VCS


```
@bitcode/vcs-generics VCS primitives (AbstractVCSProvider, factory, service)
 ↑
@bitcode/generic-vcs-{github|gitlab|bitbucket} Provider bases (implements AbstractVCSProvider)
@bitcode/generic-vcs-git Git-shaped bridge over providers
 ↑
@bitcode/generic-tools-vcs / generic-agents-vcs / mcps-tools/{github,gitlab,bitbucket}
```

Package paths: `packages/vcs-generics/`, `packages/generic-vcs/*`.

**Law:** every VCS provider lives under `generic-vcs/<provider>` and extends
`VCSProvider` from `vcs-generics`. Shims `@bitcode/{vcs,github,gitlab,bitbucket,git}`
are removed — use hierarchy packages only.

### 3.2 Tools

```
@bitcode/tools-generics Tool abstract class, factoryTool, ToolUse → UsedTool
 ↑
@bitcode/generic-tools/* Editing, VCS, web-search, LSP, multimodal, …
 ↑
pipeline-local tools e.g. AssetPackLexicalDepositorySearchTool
```

### 3.2.1 Hosts

```
@bitcode/host-generics BitcodePipelineHost primitive
 ↑
@bitcode/generic-hosts-local LocalHost (default; was InlineHost)
@bitcode/generic-hosts-vercel-sandbox VercelSandboxHost / PipelineHost
 ↑
@bitcode/pipeline-hosts Host orchestration + composition re-exports
```

`BITCODE_PIPELINE_HOST`: unset|`local` (default; `local` only (no `inline`)) | `sandbox`.

### 3.2.2 MCP

```
@bitcode/mcp-generics MCP primitives (McpConfig, schema, validate)
 ↑
@bitcode/generic-mcps-bitcode Bitcode Exchange-facing MCP server
 ↑
@bitcode/mcp-generics / @bitcode/generic-mcps-bitcode composition re-exports (was packages/executions-mcp)
```

Package paths: `packages/mcp-generics/`, `packages/generic-mcps/bitcode/`.

### 3.3 Pipelines

**Hierarchy naming law:** names always encode full ancestry
(specific → base → primitive), never a leaf-only label.

| Layer | Type name | Factory (examples) |
| --- | --- | --- |
| Primitive | `Pipeline` | `factoryPipeline` |
| Base + primitive | `SDIVFPipeline` | `factorySDIVFPipeline`, `factorySDIVFPipelineFromExecutors` |
| Base + primitive | `SimplePipeline` | `factorySimplePipeline` (linear; like QuickAgent vs PTRR) |
| Specific + SDIVF | `SynthesizeDepositAssetPacksSDIVFPipeline` | `factorySynthesizeDepositAssetPacksSDIVFPipeline` |
| Specific + SDIVF | `SynthesizeReadAssetPacksSDIVFPipeline` | `factorySynthesizeReadAssetPacksSDIVFPipeline` |
| Specific + Simple | `SettleAssetPacksSimplePipeline` | `factorySettleAssetPacksSimplePipeline` |

**No lens:** deposit synthesis, read synthesis, and settle-reads are separate
packages under `packages/asset-packs-pipelines/*`.

```
@bitcode/pipelines-generics Pipeline primitive
 ↑
@bitcode/generic-pipelines-sdivf SDIVFPipeline base (Setup-[DIV]*-Finish)
@bitcode/generic-pipelines-simple SimplePipeline base (linear stages)
 ↑
@bitcode/asset-packs-pipelines-synthesize-deposits
@bitcode/asset-packs-pipelines-synthesize-reads
@bitcode/asset-packs-pipelines-settle-asset-packs # validate → BTC/BTD/rights → PR ship
@bitcode/asset-packs-pipelines-domain agents/tools/domain
@bitcode/pipeline-hosts Local host + Vercel Sandbox host
```

**SDIVF** = Setup → Discovery → Implementation → Validation → Finish
**Simple** = ordered linear stages (no DIV loop).

Deprecated short aliases (`synthesizeAssetPacksPipeline`, …) remain .

Product UI says **Pipeline**. Low-level packages may still say `execution` /
`Execution` — do **not** rename `execution-generics` blindly.

### 3.4 LLMs

```
@bitcode/llm-generics Provider-agnostic LLM call primitives
 ↑
@bitcode/generic-llms-{xai|openai|…} Nested providers under packages/generic-llms/
@bitcode/generic-llms-defaults Env-resolved default provider/model
 ↑
@bitcode/generic-llms registry/ aggregator (all providers)
```

`packages/generic-*` is always a **family of nested packages** (never a flat
single package). Example: `packages/generic-llms/{xAI,OpenAI,Anthropic,Google,defaults,registry}/`.

Deposit default model (V48 Gate 3): `grok-build-0.1` when `XAI_API_KEY` is set.
Inference is **non-configurable** inside the pipeline (mock at the provider
boundary in tests only).

### 3.5 Prompts

```
@bitcode/registry Hierarchical typed registry primitive
 ↑
@bitcode/prompts Prompt (Registry of PromptPart), formatters
 ├── parts/PromptPart.ts Branded string type
 └── raw_promptparts/ ALL PromptPart source content in Bitcode
 ├── generic/ Shared base parts
 └── specific/ Domain-specific parts (large index)
```

**Rule:** PromptPart *implementations* live in `packages/prompts` (or are
composed from parts registered there). Agents assemble `Prompt` registries;
they do not scatter ad-hoc mega-strings across the app without the registry.

### 3.6 Mental model one-liner

> **Primitive defines shape → generic package implements reusable base →
> product package specializes for deposit/read/settlement → uapi only renders
> and routes.**

---

## 4. Repository map (top level)

```
bitcode/
├── AGENTS.md, README.md, FAMILIARIZATION.md # this guide
├── BITCODE_SPEC*.md / BITCODE_SPEC.txt # canon family
├── BITCODE_SPECIFYING.md
├── packages/ # domain monorepo (pnpm workspace)
├── uapi/ # Next.js commercial website
├── supabase/ # migrations, queries, seed
├── scripts/ # gate checkers, promotion, generators
├── .bitcode/ # generated structured artifacts
├── protocol-demonstration/ # protocol realization (not V48 UI truth)
├── fixtures/ # JSON fixtures
├── internal-docs/ # engineering docs
├── docs/ # public-facing API docs fragments
├── tests/ # root jest setup (limited)
├── _legacy/ # IGNORE — historical only
└── codemod/, infra/, …
```

**pnpm workspace:** `packages/*` (+ nested), and `uapi` (app also listed for
workspace linking). Prefer `workspace:*` deps between packages.

---

## 5. Packages catalog

Grouped by role. Names are `@bitcode/<name>` unless noted.

### 5.1 Runtime primitives (learn first)

| Package | Responsibility |
| --- | --- |
| `execution-generics` | `Execution` state tree, `Executor`, sequential/parallel/pipe |
| `agent-generics` | Agent = Executor + PTRR composition over generations |
| `tools-generics` | `Tool` class, factories, MCP bridges |
| `pipelines-generics` | Pipeline / PhaseDelegator primitives / stream hooks (re-exports SDIVF) |
| `generic-pipelines-sdivf` | SDIVF base loop (`packages/generic-pipelines/SDIVF`) |
| `generation-generics` | Generation primitive + failsafe/thinkings enums |
| `generic-generations-failsafes` | Failsafe base + prepared-context types |
| `generic-generations-thinkings` | Thinkings base vocabulary surface |
| `measurement-generics` | Measurement primitive (spec, reading, output schemas) |
| `generic-measurements-measure-agent` | MeasureAgent PTRR base |
| `generic-measurements-absolutes` | AbsolutesMeasureAgent base |
| `generic-measurements-needinesses` | Needinesses framing surface (Gate 4) |
| `generic-measurements-tech-types` | Tech/stack signals as absolute measurement vocabulary |
| `asset-packs-generics` | AssetPack protocol primitive (`@bitcode/asset-packs-generics`) |
| `generic-asset-packs-synthesis` | Synthesize measurement catalogs + product AbsolutesMeasureAgent |
| `generic-asset-packs-settle` | Settle product surface (Gate 6) |
| `llm-generics` | Pure LLM call contracts |
| `generic-llms-models` | Model configs + USD pricing (`@bitcode/generic-llms-models`) |
| `registry` | Hierarchical registry (Prompt is a Registry) |
| `prompts` | Prompt + PromptPart + **all** raw prompt parts |
| `context-generics` | Process-root Execution helpers (prefer `@bitcode/generic-executions`) |
| `logger` | Shared logging |
| `files` | **File primitives** (`FilePath`, `FileOp`, `FileChange`, path + security helpers) |

### 5.2 Generic implementations and hierarchy families

| Package family | Responsibility |
| --- | --- |
| `generic-agents/*` | Nested base agents: VCS, danger-wall, code-editor, digester, web-research, … |
| `generic-tools/*` | Nested base tools: files-maintaining, git, VCS, LSP, web-search, … |
| `generic-pipelines/*` | Nested base pipelines: SDIVF, Simple |
| `generic-llms/*` | Nested providers (xAI, OpenAI, Anthropic, Google), defaults, registry, **models** |
| `generic-generations/*` | Nested generation bases: failsafes, thinkings |
| `generic-measurements/*` | Nested measurement bases: measure-agent, absolutes, needinesses, tech-types |
| `generic-asset-packs/*` | Measured-patch base + synthesis/settle product surfaces |
| `generic-vcs/*` | github, gitlab, bitbucket, git (`@bitcode/generic-vcs-*`) |
| `generic-hosts/*` | Local, VercelSandbox |
| `generic-artifacts/*` | patch type + aws/supabase/vercel storage |
| `generic-attachments/*` | file \| external attachment bases |
| `generic-doc-comments/*` | doc-code, doc-developing over `doc-comment-generics` |
| `generic-mcps/bitcode` | Exchange-facing MCP server |
| `doc-comment-generics` | Doc-comment plugin primitives |
| `file-editing` / `file-refactoring` | Atomic edits + symbol rename over `@bitcode/files` |
| `containerizations/*` | docker, kubernetes |
| `web-scrapers/firecrawl` | Firecrawl scrape/crawl/search client |
| `web-search/{multi,exa}` | Multi-provider orchestrator + Exa provider |
| `externals/*` | Figma, Jira, Notion, Vercel **deploy** API |
| `external-telemetry/*` | Google Analytics, Sentry, Vercel analytics |
| `external-apps/*` | chatgpt, claude host embeddings |
| `ci/circle` | CircleCI |
| `email/supabase` | Email via Supabase (`@bitcode/email`) |
| `linting/eslint` | `eslint-plugin-bitcode` |
| `host-commands/grep` | Host grep primitive |
| `security/*` | encryption, credentials, rate-limiting, audit, validation, headers, … |
| `obfuscation` | Privacy-preserving transforms |
| `conversations` | Conversation domain types |

**Canon law:** the current package tree is the one-and-only canon — no dual package
homes, no compatibility package aliases, no “compatibility remains for callers” layer.

**`*-generics` law:** use only when a matching `generic-*` implementor family exists
(e.g. `vcs-generics` + `generic-vcs/*`). Plain domains use plain names
(`obfuscation`, `conversations`, `file-editing`).

### 5.3 Product domain (AssetPack / BTD / market)

| Package | Responsibility |
| --- | --- |
| `asset-packs-pipelines/domain` (`@bitcode/asset-packs-pipelines-domain`) | **SynthesizeAssetPacks**, deposit options/policy/admission/earnings, depository search/supply, settlement/rights contracts, deposit agents |
| `asset-packs-pipelines/*` | Product SDIVF/Simple pipelines (synthesize-deposits/reads, settle-reads) |
| `pipeline-hosts` | AssetPack host orchestration barrel over `host-generics` + `generic-hosts/*` |
| `btd` | BTD measurement, journal, authority, settlement, interface contracts |
| `specifying` (`@bitcode/specifying`) | Gate proof generators, canon posture, promotion helpers, transitional demo-engine bridge. **Not** “the protocol” — the monorepo is protocol canon |
| `api` | Route orchestration **and** API primitives: `src/responses/`, `src/streams/` |

**Deposit domain modular layout:** public entries remain stable
(`./deposit-asset-pack-options`, `./depository-search`, …) while implementations
split into `*-types.ts`, `*-helpers.ts`, and builders. Shared source-safe hash/root
helpers live in `deposit-source-safe-utils.ts`.

### 5.4 Auth, identity, VCS, externals

| Package | Responsibility |
| --- | --- |
| `auth` | Wallet local identity, Bitcoin wallet client, OAuth, Supabase auth redirect |
| `vcs-generics` | VCS primitives (`AbstractVCSProvider`, factory, service) |
| `generic-vcs/*` | Provider implementations (github, gitlab, bitbucket, git) |
| `generic-tools/vcs` + `generic-agents-vcs` | VCS tools and agent (not providers) |
| `supabase` | Supabase clients (live data plane) |
| `externals/{figma,jira,notion,vercel}` | Third-party product APIs (not telemetry) |
| `figma` / `jira` / `notion` / `vercel` / `circleci` | composition re-exports of externals / ci |

### 5.5 Data, storage, security, telemetry

| Package | Responsibility |
| --- | --- |
| `orm` | DB access, generated types, profile contract, data-health |
| `files` | File path/op primitives for the monorepo |
| `file-editing` / `file-refactoring` | Atomic edit transactions; LSP rename |
| `artifacts` + `generic-artifacts/*` | Artifact compose + storage providers |
| `browser-storage` | Browser storage helpers |
| `api/src/streams` (`@bitcode/api/streams`) | Streaming progress helpers |
| `api/src/responses` (`@bitcode/api/responses`) | HTTP JSON/stream response helpers |
| `containerizations/{docker,kubernetes}` | Container runtime integrations |
| `web-scrapers/firecrawl` | Firecrawl client |
| `postgresql` | Optional DB MCP helper (not product storage) |
| `security/*` | Split security utilities; composition barrel `@bitcode/security` |
| `external-telemetry/*` | Google / Sentry / Vercel analytics adapters |
| `observability` | Product analytics composition over external-telemetry |

**Removed (do not reintroduce):** `digest`, `cloudflare`, `mysql`, `firebase`,
`aurora-postgres`, `aws` (as product package), `procurement`, `repository-health`,
`objects-arrays` (use **lodash** for deep equality / object helpers).

### 5.6 UX-adjacent / interfaces

| Package | Responsibility |
| --- | --- |
| `conversations` | Conversation domain types and agent/prompt substrate |
| `external-apps/chatgpt` | ChatGPT App MCP |
| `external-apps/claude` | Claude Code plugin scaffold |
| `mcp-generics` / `generic-mcps-bitcode` | MCP primitives + Exchange server |
| `mcp` / `mcp-server` | composition re-exports |
| `templates-generics` | **Shippable / evidence-document** templates in Supabase — **not** prompt templating |
| `attachment-generics` / `generic-attachments/*` | file \| external attachments |
| `styling`, `networking` | Shared UI/HTTP utilities |
| `testing` | Shared test frameworks |

### 5.7 What not to confuse

| Do not confuse | With |
| --- | --- |
| Product **Pipeline** UI | `execution-generics` PTRR executors |
| `generic-agents` base agents | Deposit agents under `pipeline-asset-pack/agents` |
| `@bitcode/specifying` | Specifying/gate-proof tooling (not a product “protocol” package; monorepo is canon) |
| `templates-generics` | Prompt formatting (`@bitcode/prompts`) |
| `externals/*` | `external-telemetry/*` (product APIs vs analytics) |
| `*-generics` alone | A full stack — expect a matching `generic-*` family when the name is used |
| `protocol-demonstration/` | Live V48 website measurement source of truth |
| `_legacy/` | Anything current |

---

## 6. UAPI — how the website works

`uapi/` is the **Next.js App Router** commercial application.

### 6.1 Dependency direction (strict)

```
packages/* (no React pages; no import of uapi)
 ↑
uapi/lib, uapi/networking, uapi/hooks (thin adapters)
 ↑
uapi/components/shadcn Shadcn*
 ↑
uapi/components/bitcode Bitcode* (theme, layout, pipeline chrome, auth, VCS)
 ↑
uapi/components/{experience}
 ↑
uapi/app/* page shells only
```

**Never:** experience → experience imports.
**Never:** packages → uapi.
**Never:** reintroduce `/terminal`.

### 6.2 Request path (typical deposit synthesis)

1. Browser: `DepositPageClient` → `POST /api/deposit/synthesize-options`
2. Route validates + **dispatches** host (`dispatch-deposit-synthesis.ts`); returns `runId` immediately
3. Host runs SynthesizeAssetPacks (inline Node or Vercel Sandbox)
4. Events stream to `execution_events` (source-safe filter)
5. Client tails via `usePipelineExecution` / SSE and resumes options from history

### 6.3 Key uapi directories

| Path | Role |
| --- | --- |
| `app/` | Routes, layouts, `api/*` HTTP adapters |
| `components/shadcn` | Root primitives (`Shadcn*`) |
| `components/bitcode` | App base (`Bitcode*`, pipeline table/log, auth, nav, VCS) |
| `components/{experience}` | Experience composition |
| `hooks/` | App-wide React hooks |
| `lib/` | Thin server/client helpers (often re-exports of packages) |
| `networking/` | API client wrappers |
| `tests/` | Jest allowlist-driven suite (`jest.config.cjs` explicit `testMatch`) |
| `mocking/` | Deterministic mock engines for UI proofs |

### 6.4 Component unit pattern

```
Experience/ComponentName/
 ComponentName.tsx
 hooks/
 styles/
 __tests__/
```

Named entry file — **not** `index.tsx`. Top-of-file overview comment on non-trivial modules.

### 6.5 Product language in UI

- Prefer `BitcodePipeline*`, `Deposits*`, `Reads*`, `Packs*`
- Ledger: journal vocabulary
- HTTP may still say `/api/executions/*` until consumer audit

---

## 7. Experiences (seven) + bases (two)

### 7.1 Marketing (`/`)

Landing, walkthrough, marketplace narrative, competitor tables, BTD education.
Home: `uapi/components/marketing/`. Large sections are modularized (data/helpers
+ co-located subcomponents under each `Marketing*Section/` directory); see
`uapi/components/marketing/README.md`. Screenshot shell composes hero gallery /
how-it-works / entrance hook; marketplace composes order book, ticker, candles,
detail, narrative, and action-pad units.

### 7.2 Deposits (`/deposits`)

IP-seller MVP. Modular reference experience:

- Page client orchestration + hooks (live runs, demand, synthesis lifecycle, …)
- Source selection, obfuscations, option cards, telemetry, pipelines master, aside
- Domain law in `@bitcode/asset-packs-pipelines-domain` + G3 SPEC sections

### 7.3 Reads (`/reads`)

IP-buyer path: Read request → Need → Fits → preview → settle → delivery.
Shares synthesis pipeline core; **read lens** / neediness finalization continues
in later V48 gates. Workbench panels under `Reads*` + `models/deposit-read-*`
(historical name; deposit+read shared workbench models).

**Reads modularization (entry paths):**

- Page orchestration: `uapi/components/reads/ReadPageClient/ReadPageClient.tsx`
 with hooks (`use-read-live-runs`, `use-read-url-navigation`,
 `use-read-pipeline-telemetry`, `use-read-session-projections`,
 `use-read-activity-recording`, `use-read-route-params`)
- Pipelines master-detail: `ReadsPipelinesSection` + `ReadsPipelineTelemetry`
- Route aside: `ReadsRouteStateAside` + pure rows in `models/read-route-rows.ts`
- Route model facade: `models/read-route-model.ts` (types in
 `read-route-session-types.ts`; procurement / fit / settlement builders
 co-located siblings)
- Enterprise reading steps: `enterprise-reading-ux-types.ts` +
 `enterprise-reading-ux-state.ts`
- Repository supply: `ReadsRepositoryContextPanel` + `use-reads-repository-vcs`
 + field grid / connection / supply / guidance units
- Scenario measurement: `ReadsReadScenarioPanel` + `use-read-scenario-actions`
 + fitting review / scenario list units
- Evidence rows: `deposit-read-evidence-*-rows.ts` facades under `models/`

### 7.4 Packs (`/packs`)

Network-scope PackActivity master-detail (ledgerized history).
**Not** personal pipeline activity (that is `/deposits`).

Home: `uapi/components/packs/`.

| Concern | Location |
| --- | --- |
| Page client (orchestration only) | `PacksPageClient/` + `hooks/use-packs-activity`, `use-packs-route-params` |
| Pure formatters / option catalogs | `models/packs-format.ts`, `models/packs-activity-types.ts` |
| Portfolio positions + market signals | `PacksPortfolioOverview/` |
| Master shell | `PacksActivityMaster/` composes filter bar + table + type totals |
| Filter bar / data grid | `PacksActivityFilterBar/`, `PacksActivityTable/` |
| Detail shell + sections | `PacksActivityDetail/` + `PacksActivityDetailStates/`, `…Accounting/`, `…Governance/`, `…ProofRoots/` |
| Shared chrome | `PacksDetailSection/`, `PacksStatusPill/` |
| Cross-route activity projection | `bitcode/activity/PackActivityModel/pack-activity-model` (leave under Bitcode; not packs-only) |

App shell: `uapi/app/packs/` re-exports the page client. Layout contract:
`internal-docs/BITCODE_SOURCE_LAYOUT.md` § Packs experience.

### 7.5 Docs (`/docs`)

Public documentation articles. Content is modular under
`docs/models/` (`bitcode-docs-types`, `bitcode-docs-helpers`, `content/*`) with
stable re-export `bitcode-docs-content.ts`. UI: thin `DocsArticlePage` plus
rail/card/specimen/API/manual subcomponents.

### 7.6 Conversations

Full commercial Conversations UX is **deferred post-V48**, but structure remains
under `uapi/components/conversations/`. Overlay orchestration is a thin shell
(<500) composing header/main-content/side-panels plus send + view-mode hooks;
rich-text input uses co-located serialize/render helpers; GitHub source selector
cascade lives in `use-github-source-selection`; edge-case handler is a facade
over network/data-integrity/performance/validation modules. Prefer `/packs` as
post-auth landing, not Terminal.

### 7.7 Auxillaries

Identity, wallet, GitHub externals, interfaces, organization/treasury panes.
Route: `/auxillaries/[pane]`. Overlays can open from product pages.

| Concern | Location under `uapi/components/auxillaries/` |
| --- | --- |
| Surface shell + step wiring | `AuxillariesSurface/` (`hooks/`, `models/`, dynamic pane imports) |
| Profile | `AuxillariesProfilePane/` + `Profile*Section/`, `OrganizationAuthoritySection/` |
| Wallet / BTD | `AuxillariesWalletPane/` + `WalletBtdPostureSection/`, `AuxillariesWalletConnectionPanel/` |
| Externals / GitHub | `AuxillariesExternalsPane/` + `ExternalsConnectedWorkspace/`, `ExternalsWalletRequiredGate/` |
| Interfaces | `AuxillariesInterfacesPane/` + `InterfaceAdmissionCatalog/` |
| Organization | `organization/OrganizationSettings/` (tab units) + `BTDTreasuryManagement/` |
| Shared chrome | `headers/`, `shared/` (tabs, stat grids, preference cards, workspace sections) |

Layout contract: `uapi/components/auxillaries/README.md` and
`internal-docs/BITCODE_SOURCE_LAYOUT.md`.

### 7.8 Bitcode base

Shared chrome: `Nav`, `AuthProvider`, `ProductRouteShell`, `BitcodePipelinesTable`,
`PipelineExecutionLog`, repository context models, shell bridge, VCS selectors.

### 7.9 Shadcn base

Radix/shadcn primitives re-exported with explicit `Shadcn` prefix direction
(rename may be ongoing).

---

## 8. Runtime, data, proof, tests

### 8.1 Supabase

Migrations under `supabase/migrations/`. Executions / events / BTD / connections
are core. Local vs staging-testnet vs production projects are documented in
`BITCODE_V48_QA.md` (do not mix project IDs casually).

### 8.2 Pipeline hosts

- **Inline:** Node process runs pipeline after dispatch (dev)
- **Sandbox:** Vercel Sandbox box with host manifest + live runner template
 (`pipeline-hosts` asset-pack-host modules)

### 8.3 Source-safety

All streamed/persisted LLM content passes **allowlist** metadata filters
(`sourceSafeStreamEvent` family). UI must never show unpaid source, raw prompts,
or provider payloads.

### 8.4 Tests

| Layer | Location |
| --- | --- |
| Package unit | `packages/<name>/src/__tests__` or co-located |
| UAPI unit/integration | `uapi/tests/*` (must be on jest `testMatch` allowlist) |
| Gate checkers | `scripts/check-v*-gate*.mjs`, `package.json` `check:v*` scripts |
| E2E | Playwright under uapi (opt-in heavy paths) |

### 8.5 Generated canon

`.bitcode/vN-*.json` + `BITCODE_SPEC_VN_PROVEN.md` are generated; do not hand-edit
as if they were source of product law.

---

## 9. File-by-file reading paths (by task)

### 9.1 “How does deposit synthesis work?”

1. `BITCODE_SPEC_V48.md` §G3-1…G3-15
2. `packages/asset-packs-pipelines/domain/src/asset-packs-synthesis.ts` (barrel)
3. `.../agents/{setup,discovery,implementation,validation}/deposit-*.ts`
4. `packages/pipeline-hosts/src/asset-pack-host.ts`
5. `uapi/app/api/deposit/synthesize-options/route.ts` + `dispatch-deposit-synthesis.ts`
6. `uapi/components/deposits/DepositPageClient/*`

### 9.2 “How does an agent call an LLM?”

1. `execution-generics` Execution store
2. `agent-generics` factoryPTRRAgent + substeps
3. `prompts` Prompt registry + raw_promptparts
4. `generic-llms` provider
5. Stream path: pipelines-generics streaming → source-safe filter → uapi log

### 9.3 “How does /packs show ledger state?”

1. `pack-activity-model`
2. `GET /api/packs/activity` (api package / uapi route)
3. `PacksPageClient` + master/detail units

### 9.4 “Where do I put new pure logic?”

- Shared non-React → new or existing `packages/*`
- Experience-only pure → `uapi/components/<exp>/models/`
- React stateful → co-located `hooks/`
- Never dump into page clients

### 9.5 “Where must I not look?”

- `_legacy/`
- Superseded `BITCODE_SPEC_V{n<draft}.md` as live product law
- `protocol-demonstration/` as V48 measurement canon (realization only)

---

## 10. Encapsulation patterns (quick reference)

| Pattern | Where |
| --- | --- |
| Executor composition | `execution-generics` sequential/parallel/pipe |
| Agent PTRR | `agent-generics` |
| Phase pipeline | `generic-pipelines-sdivf` base (via `pipelines-generics` primitives) |
| Registry hierarchy | `registry` → `Prompt` |
| Source-safe allowlist | pipeline streaming + deposit UI contracts |
| Thin HTTP route | validate → dispatch → return id; long work off-request |
| Experience isolation | no cross-experience imports |
| Named component units | `ComponentName/ComponentName.tsx` |
| Spec ↔ implementation commits | category parenthetical every commit |

---

## 11. Maintenance of this guide

**Specifying law** (`BITCODE_SPECIFYING.md` §16.3.1): this file **must** be
kept up to date with structural changes. Stale content here is a defect relative
to Complete Implementation Derivability.

Update `FAMILIARIZATION.md` when:

- A new package family, nested `generic-*` package, or product pipeline is introduced or removed
- Experience modularization changes the primary entry paths
- Inheritance hierarchy gains, loses, or renames a layer
- Product routes, host model, or public navigation posture change
- Catalog paths, package names, or hierarchy diagrams would otherwise go stale
- A new acronym, product term, or hierarchy word appears in SPEC/source — add it to **§12 Terms appendix**

Prefer **accurate, short section edits** over rewriting the whole file each time.
Land the edit with the structural change (same commit or accompanying
`specification-implementation` / documentation commit).

---

## 12. Terms appendix

Lookup dictionary for this guide and the commercial tree. Prefer these spellings
in new code and docs. Deeper product law lives in the SPEC; packaging law in
`internal-docs/BITCODE_SOURCE_LAYOUT.md`; agent step vocabulary also in
`internal-docs/TERMINOLOGY.md`.

### 12.1 Acronyms and abbreviations

| Term | Expansion / meaning |
| --- | --- |
| **API** | Application Programming Interface — here usually HTTP route handlers in `packages/api` and thin `uapi/app/api/*` bindings. |
| **BTC** | Bitcoin (currency). V48 settlement money is **BTC-testnet** only (no mainnet value). |
| **BTD** | Bitcode’s weighted knowledge-volume unit: measured basis of price; after settlement, a rights-bearing receipt (ledger language is **journal**). |
| **CI** | Continuous Integration — GitHub Actions gate/promotion workflows; also `packages/ci/circle` (CircleCI provider). |
| **CSP** | Content Security Policy — browser security headers (`@bitcode/security-headers`). |
| **CSRF** | Cross-Site Request Forgery protection (`@bitcode/security-headers`). |
| **DIV** | Middle loop of **SDIVF**: Discover → Implement → Validate (may iterate). |
| **E2E** | End-to-end tests (browser/API full flows); often opt-in in CI. |
| **LLM** | Large Language Model — providers under `packages/generic-llms/*`. |
| **LSP** | Language Server Protocol — code intelligence; used by file-refactoring / code-editor tools. |
| **MCP** | Model Context Protocol — tool/server embedding surface (`mcp-generics`, `generic-mcps-bitcode`, ChatGPT App). |
| **ORM** | Object-relational mapping package (`@bitcode/orm`) — DB access, not product law. |
| **PCC** | **Prepare Concise Context** — first FailsafeGeneration kind: select Execution state *keys* (not values). |
| **PR** | Pull request — GitHub/GitLab/Bitbucket shippable; also “gate PR” into `version/vN`. |
| **PTRR** | **Plan → Try → Refine → Retry** — base agent step model (`@bitcode/generic-agents-ptrr`). |
| **QA** | Quality assurance — interactive ledgers (`BITCODE_V48_QA.md`), runbooks, findings tags `V48-GateN-F*`. |
| **RLS** | Row Level Security — Supabase/Postgres access policies. |
| **SDIV** | Informal shorthand for the SDIVF middle phases (Discover–Implement–Validate). Prefer **SDIVF** for the full pipeline shape. |
| **SDIVF** | **Setup → [Discover → Implement → Validate]\* → Finish** — base product pipeline shape (`SDIVFPipeline`). |
| **SSE** | Server-Sent Events — one way clients receive streaming pipeline telemetry. |
| **SRP** | Single Responsibility Principle — one primary reason to change per component/file unit. |
| **UI / UX** | User interface / user experience — React under `uapi/components/*`. |
| **UAPI** | The Next.js commercial app at `uapi/` (routes, components, thin adapters). |
| **VCS** | Version Control System — providers under `vcs-generics` + `generic-vcs/*`. |

### 12.2 Product domain (market / settlement)

| Term | Meaning |
| --- | --- |
| **AssetPack** | Always a *synthesized* measured artifact (patch descriptor + measurements + metadata), never a raw source slice. |
| **Admit / admission** | Accept a synthesized AssetPack option into the **Depository** (deposit path). |
| **Auxillaries** | Side panes: wallet identity, GitHub/org connections, externals (experience prefix `Auxillaries*`). |
| **BTC-testnet** | Settlement money rail in V48 — testnet value only; production-like protocol behavior. |
| **Depository** | Market inventory of admitted AssetPacks available for reading/settlement. |
| **Depositor** | Party who connects source, synthesizes options, and admits packs. |
| **Demand** | Reader-side need signal; may be **Unestimatable** when supply cannot ground a price. |
| **Deposit** | IP-seller path: connect source → synthesize options → review → admit. Route `/deposits`. |
| **Delivery** | Post-settlement entitled handoff of AssetPack material under rights. |
| **Finding Fits** | Read path step: match Need against Depository supply. |
| **Forced Inclusions / Exclusions** | Deposit inputs that force path include/exclude sets (and secret exclusion). |
| **Journal** | BTD ledger language (rows, reconciliation) — not “Pipeline”. |
| **Measurement** | Grounded basis of price: absolute on deposit; Need-relative fit on read. |
| **Need** | Reader-side demand descriptor synthesized for finding fits. |
| **Obfuscations** | Deposit input that withholds/transforms sensitive material; empty → skip Setup LLM (Gate 3). |
| **Packs** | Master-detail portfolio / activity history experience (`/packs`, `Packs*`). |
| **Preview (source-safe)** | Show allowed AssetPack disclosure without leaking unpaid/protected source. |
| **Read** | Buyer path: Need → Finding Fits → settle → delivery. Route `/reads`. |
| **Reader** | Party who settles for AssetPack rights. |
| **Rights** | Post-settlement BTD-backed entitlement to delivery/use under policy. |
| **Settle / settlement** | BTC-testnet payment + rights issuance for a chosen fit. |
| **Shippable** | Deliverable artifact shape (e.g. PR) — product template domain in `templates-generics`. |
| **Source-safe** | Never product-expose protected/raw source, unpaid packs, raw prompts, credentials, private settlement payloads. |
| **SynthesizeAssetPacks** | Deposit (and related) SDIVF product pipeline that produces measured AssetPack options. |
| **Terminal** | **Deleted** product surface — do not reintroduce `/terminal` or Terminal-named product UI. |
| **Unestimatable** | Honest demand/price outcome when Depository supply cannot ground a figure (not invented %). |

### 12.3 Hierarchy packaging (`*-generics` / `generic-*`)

| Term | Meaning |
| --- | --- |
| **`*-generics` package** | Primitive layer: types, contracts, factories, abstract bases (e.g. `vcs-generics`, `asset-packs-generics`). Use **only** when a matching `generic-*` implementor family exists. |
| **`generic-*` family** | Folder of nested implementor packages (no root `package.json` on the family folder), e.g. `generic-vcs/{github,gitlab,…}`. |
| **Hierarchy naming law** | Type/export names encode full ancestry: primitive → base → specific (e.g. `SynthesizeDepositAssetPacksSDIVFPipeline`). |
| **Primitive** | Lowest shared vocabulary (e.g. `Pipeline`, `Execution`, `AssetPack`, `FilePath`). |
| **Base (implementor)** | Reusable middle layer in `generic-*/*` (e.g. `MeasuredPatchAssetPack`, `SDIVFPipeline`, `LocalHost`). |
| **Product / specific** | Bitcode product specialization (pipelines, agents, experience UI). |
| **Family folder** | Directory that groups nested packages; itself is not a package (except rare composition barrels like `@bitcode/security`). |
| **Workspace package** | A `package.json` with `@bitcode/…` (or `eslint-plugin-bitcode`) name in the pnpm workspace. |

### 12.4 Execution, agents, generations, tools

| Term | Meaning |
| --- | --- |
| **Agent** | An **Executor** specialized for LLM-bound PTRR work (`agent-generics`). |
| **ChunkThenSum** | FailsafeGeneration kind for large inputs: chunk then summarize/complete. |
| **Execution** | Accumulating hierarchical run state (not a separate “Context” product state). |
| **Executor** | Pure transform `(input, execution) → output` (or equivalent composition). |
| **FailsafeGeneration** | Parent generation kinds inside a PTRR step: PCC, ChunkThenSum, StitchUntilComplete. |
| **Generation** | Primitive unit of LLM/work generation inside a step (`generation-generics`). |
| **Process-root Execution** | Process defaults (`@bitcode/generic-executions`) — not a parallel Context bag. |
| **Judge** | ThinkingsGeneration kind: evaluate intermediate reasoning. |
| **PhaseDelegator** | Pipeline phase that resolves and runs agents/tools for that phase. |
| **Prepared context** | Failsafe selection of Execution **keys** (noise reduction), not a second state bag. |
| **Process-root Execution** | Root Execution for the process (`initializeProcessRoot` / `getProcessRootExecution`). |
| **PTRRAgent** | Agent whose steps are Plan/Try/Refine/Retry (`factoryPTRRAgent`). |
| **QuickAgent** | Lighter agent factory path (non-PTRR or reduced steps); contrast `PTRRAgent`. |
| **Reason** | ThinkingsGeneration kind: produce intermediate reasoning. |
| **StitchUntilComplete** | FailsafeGeneration kind: repair incomplete/truncated structured output. |
| **StructuredOutput** | ThinkingsGeneration kind: emit schema-shaped final output. |
| **ThinkingsGeneration** | Child kinds of each failsafe: Reason → Judge → StructuredOutput. |
| **Tool** | Callable capability (`tools-generics` / `generic-tools/*`); Agent uses `ExecutionTool` + registry. |
| **Tool postprocess** | After Failsafe×Thinkings: `factoryToolsExecution` if `output.useTools?.length`. |
| **useTools** | Planned invocations from structured output: `{ name, input, reason }[]`. |
| **usedTools** | Results: `{ tool, input?, output?, error? }[]` for telemetry + later steps. |
| **Doc interpolation** | Usable tools' DocCodeToolPrompt text → prompt path `auto:tools_doc_code_tools`. |
| **Results interpolation** | Prior usedTools → prompt path `auto:tools_results`. |
| **formatUsableTools** | Renders DocCodeToolPrompt docs for an array of Tool instances. |
| **AgentToolsRegistry** | Hierarchical tool lookup (`getTool` / `getUsableTools` / `restrictTo`). |

Guide: `packages/agent-generics/TOOLS-IN-PTRR.md`.

### 12.5 Pipelines, hosts, measurements, AssetPack layers

| Term | Meaning |
| --- | --- |
| **AbsolutesMeasureAgent** | Measurement base for absolute (deposit-side) categories. |
| **AssetPackId** | Stable identity for an AssetPack primitive. |
| **Host** | Where a pipeline runs: Local (default) or Vercel Sandbox — **not** “Harness”. |
| **InlineHost** | Legacy name; prefer **LocalHost** (`generic-hosts-local`; `inline` env alias). |
| **LocalHost** | In-process default pipeline host. |
| **MeasuredPatchAssetPack** | Only AssetPack **base**: measured + source-safe patch over the AssetPack primitive. |
| **Needinesses** | Read-side measurement framing (relative to Need). |
| **Pipeline** | Product run language (UI tables, logs, history) and/or `pipelines-generics` primitive. |
| **PipelineHost / BitcodePipelineHost** | Host contract (`host-generics`). |
| **SimplePipeline** | Linear stage pipeline base (contrast SDIVF). |
| **SDIVFPipeline** | Pipeline base implementing Setup-[DIV]*-Finish. |
| **SynthesizeDepositAssetPacksSDIVFPipeline** | Deposit synthesis product pipeline (`asset-packs-pipelines/synthesize-deposits`). |
| **SynthesizeReadAssetPacksSDIVFPipeline** | Read synthesis product pipeline (`asset-packs-pipelines/synthesize-reads`). |
| **SettleAssetPacksSimplePipeline** | Settlement Simple pipeline (`asset-packs-pipelines/settle-asset-packs`). |
| **VercelSandboxHost** | Decoupled Firecracker/sandbox host for pipeline boxes. |
| **maxIterations** | SDIVF loop bound; Gate 3 deposit synthesis uses **1**. |

### 12.6 Files, artifacts, attachments, VCS, integrations

| Term | Meaning |
| --- | --- |
| **Artifact** | Stored deliverable blob/envelope with identity + storage contract. |
| **ArtifactStorage** | Provider contract (S3 / Supabase / Vercel Blob under `generic-artifacts/*`). |
| **Attachment** | Message/pack attachment; categories **file** \| **external** only. |
| **External (attachment)** | Attachment bound to an Externals connection (GitHub, Jira, …). |
| **File (attachment)** | Direct file upload attachment. |
| **FileChange / FileOp / FilePath** | File primitives in `@bitcode/files`. |
| **File-editing** | Atomic transactional edits (`@bitcode/file-editing`). |
| **File-refactoring** | Symbol rename / multi-file refactors (`@bitcode/file-refactoring`). |
| **PatchArtifact** | Path+op patch artifact type base. |
| **Provider (VCS)** | Concrete VCS implementor under `generic-vcs/*` extending `vcs-generics`. |
| **Externals** | Product integrations family (`packages/externals/*`) — not telemetry. |
| **External-telemetry** | Analytics adapters (Google, Sentry, Vercel analytics). |
| **Containerizations** | Docker/Kubernetes family. |
| **Web-scrapers / web-search** | Firecrawl client family; multi-provider + Exa search family. |

### 12.7 UAPI and UI architecture

| Term | Meaning |
| --- | --- |
| **Bitcode\*** | Shared app base components over Shadcn (`uapi/components/bitcode`). |
| **BitcodePipeline\*** | Shared pipeline chrome (table, log, telemetry) — product run UI language. |
| **Component unit** | Directory `ComponentName/ComponentName.tsx` + optional `hooks/`, `styles/`, `__tests__/`. Not `index.tsx`. |
| **Experience** | One of seven product UI domains: Marketing, Packs, Reads, Deposits, Docs, Conversations, Auxillaries. |
| **Experience → experience** | **Forbidden** import direction. |
| **Page shell** | Thin `uapi/app/*` file: metadata + composition only; no heavy logic. |
| **Page client** | Client orchestration component (providers, URL, section wiring). |
| **Packages → uapi** | **Forbidden** — domain packages must not import the Next app. |
| **Shadcn\*** | Root UI primitives (`uapi/components/shadcn`). |
| **Theme / layout / auth (Bitcode base)** | Shared chrome: nav, branding, auth panes, pipeline cards. |
| **`uapi/lib`, `networking`, `hooks`** | Thin Next/React adapters over packages. |
| **DepositPageClient / PacksPageClient / …** | Experience page orchestrators. |
| **Master-detail** | UI pattern: list/master + detail pane (deposits options, packs activity). |
| **NavBrand** | Top nav brand cluster (logo marks + BITCODE wordmark). |
| **Product analytics** | Composed tracking via `observability` + `external-telemetry/*`. |

### 12.8 Spec, proof, process, and quality

| Term | Meaning |
| --- | --- |
| **Active canon** | Version pointed by `BITCODE_SPEC.txt` on `main` (currently V47 until V48 promotion). |
| **Canon / canonical** | Spec family + proven artifacts treated as rebuild law for a version. |
| **Canon at that time** | Frozen promoted era (specs + proofs + version-bound checks) — never rewritten for later tree drift (`BITCODE_SPECIFYING.md` §4.3). |
| **Complete Implementation Derivability** | A reader rebuilds current Bitcode from the active family alone (`BITCODE_SPECIFYING.md`). |
| **DELTA** | Version decision log (`BITCODE_SPEC_VN_DELTA.md`). |
| **Draft target** | Version under construction (V48 on `version/v48`) — not yet `BITCODE_SPEC.txt` pointer. |
| **Era-pin** | Skip-with-reason for historical package proofs when current realization superseded that era (do not rewrite the frozen proof). |
| **Gate** | Bounded acceptance slice (e.g. V48 Gate 3); branch `v48/gate-N-topic`. |
| **Gate PR** | Pull request closing a gate into the version branch. |
| **Living full-system check** | All-encompassing, completely correct validation for the **current** draft/active pointer only (`BITCODE_SPECIFYING.md` §13.1). |
| **NOTES** | Architecture intent ledger (`BITCODE_SPEC_VN_NOTES.md`) — weaker than SPEC body. |
| **Parity matrix** | Spec claim ↔ source ↔ tests ↔ gates ledger. |
| **Promotion** | Version PR to `main` after all gates closed; updates `BITCODE_SPEC.txt` pointer under workflow rules. |
| **PROVEN** | Generated proof appendix / `.bitcode/vN-*` artifacts. |
| **QA finding tag** | Fully-qualified `V48-GateN-F*` in code comments and QA ledger (never bare `F26-B`). |
| **Spec family** | Hand-authored SPEC + DELTA + NOTES + PARITY (+ PROVEN) for a version. |
| **`(specification-only)` / `(implementation-only)` / `(specification-implementation)`** | Required commit/PR category labels after the version/gate prefix. |
| **Source-bearing** | Implementation that proves a SPEC claim (listed in G3-14 / parity). |
| **Version branch** | Long-lived draft line `version/v48` (not product source versioning). |

### 12.9 Prompts, docs, templates (do not mix)

| Term | Meaning |
| --- | --- |
| **Doc-comment** | Build-time comment plugin system (`doc-comment-generics` + `generic-doc-comments/*`). |
| **Doc-code** | Build-time injection of prompts onto tool instances from `@doc-code-*` comments. |
| **Prompt** | Registry-based prompt object (`@bitcode/prompts`). |
| **PromptPart** | Branded immutable string fragment for prompt composition. |
| **Raw promptpart** | Checked-in prompt fragment modules under `prompts/src/raw_promptparts`. |
| **templates-generics** | **Shippable / evidence-document** Supabase templates — **not** LLM prompt formatting. |

### 12.10 Security, observability, misc packages

| Term | Meaning |
| --- | --- |
| **Audit (security)** | Structured security/compliance event log (`security-audit`). |
| **Credentials (security)** | Lifecycle/rotation of secrets (`security-credentials`). |
| **Encryption (security)** | Encrypt/decrypt credential material (`security-encryption`). |
| **Observability** | Product analytics composition over external-telemetry (+ tracing hooks). |
| **Rate limiting** | Abuse prevention middleware (`security-rate-limiting`). |
| **Sentry / GA / Vercel analytics** | Live under `external-telemetry/*` . |
| **Supabase** | Live data plane (Auth + Postgres); not optional product storage. |

### 12.11 Quick disambiguation

| Do not say / do | Prefer |
| --- | --- |
| “Context” as product run state | **Execution** (process-root Execution for process defaults) |
| “Harness” for run boxes | **Host** (LocalHost / VercelSandboxHost) |
| “Terminal” product UI | Experiences on `/deposits`, `/reads`, `/packs`, … |
| “Pipeline” for BTD ledger rows | **Journal** |
| Leaf-only type names for layered types | Full hierarchy names (`…SDIVFPipeline`, `…AbsolutesMeasureAgent`) |
| New `*-generics` without `generic-*` peers | Plain domain package name |
| `templates-generics` as prompt system | `@bitcode/prompts` |
| `externals` vs telemetry | `externals/*` = product APIs; `external-telemetry/*` = analytics |
| Import experience → experience | Shared Bitcode base or packages only |
| Reintroduce `digest` / `mysql` / `cloudflare` product packages | Current hierarchy or explicit removal list in §5.5 |

---

*End of familiarization guide. For coding rules, obey `AGENTS.md` and the active SPEC first.*
