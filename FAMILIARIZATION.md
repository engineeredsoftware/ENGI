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

When implementing: open the SPEC section for the gate, then the package path
named in G3-14 / source maps, then the experience unit under `uapi/components/`.

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
*-generics / primitive package     →  types, factories, composition combinators
generic-* packages                 →  reusable base implementations
domain package (e.g. asset-pack)   →  product-specific specializations
uapi                               →  HTTP + React adapters only
```

### 3.1 Agents

```
@bitcode/execution-generics     Execution + Executor (lowest runtime primitive)
        ↑
@bitcode/agent-generics         Agent : Executor, PTRR steps, failsafes, Thinkings
        ↑
@bitcode/generic-agents/*       Base agents (VCS, danger-wall, code-editor, …)
        ↑
@bitcode/pipeline-asset-pack    Deposit/read SDIVF agents (setup/discovery/…)
```

**PTRR** (Plan / Try / Refine / Retry) is the agent step model. Each step runs a
**Failsafes** sequence:

1. **PrepareConciseContext** — select execution-state *keys* (not values)
2. **ChunkThenSum** — task generation; chunk only if request too large
3. **StitchUntilComplete** — repair schema-incomplete/truncated output

Each failsafe’s generation is **Thinkings**: Reason → Judge → StructuredOutput.

Factories: `factoryAgent`, `factoryAgentWithPTRR` in `agent-generics`.

### 3.2 Tools

```
@bitcode/tools-generics         Tool abstract class, factoryTool, ToolUse → UsedTool
        ↑
@bitcode/generic-tools/*        Editing, VCS, web-search, LSP, multimodal, …
        ↑
pipeline-local tools            e.g. AssetPackLexicalDepositorySearchTool
```

### 3.3 Pipelines

```
@bitcode/pipelines-generics              Pipeline, PhaseDelegator, composition, streaming
        ↑
@bitcode/generic-pipelines-sdivf         SDIVF *base* loop (Setup-[DIV]*-Finish)
        ↑
@bitcode/pipeline-asset-pack             SynthesizeAssetPacks (deposit | read);
                                         future SettleAssetPacks extends SDIVF base
@bitcode/pipeline-hosts                  Inline host + Vercel Sandbox harness
```

**SDIVF** = Setup → Discovery → Implementation → Validation → Finish  
(Discovery/Implementation/Validation may loop up to `maxIterations`).

Package path: `packages/generic-pipelines/SDIVF/` (`@bitcode/generic-pipelines-sdivf`).
Product pipelines supply phase executors/agents; they do not reimplement the DIV loop.
`pipelines-generics` re-exports SDIVF for compatibility — prefer importing
`@bitcode/generic-pipelines-sdivf` in new code.

Product UI says **Pipeline**. Low-level packages may still say `execution` /
`Execution` — do **not** rename `execution-generics` blindly.

### 3.4 LLMs

```
@bitcode/llm-generics                    Provider-agnostic LLM call primitives
        ↑
@bitcode/generic-llms-{xai|openai|…}     Nested providers under packages/generic-llms/
@bitcode/generic-llms-defaults           Env-resolved default provider/model
        ↑
@bitcode/generic-llms                    registry/ aggregator (all providers)
```

`packages/generic-*` is always a **family of nested packages** (never a flat
single package). Example: `packages/generic-llms/{xAI,OpenAI,Anthropic,Google,defaults,registry}/`.

Deposit default model (V48 Gate 3): `grok-build-0.1` when `XAI_API_KEY` is set.
Inference is **non-configurable** inside the pipeline (mock at the provider
boundary in tests only).

### 3.5 Prompts

```
@bitcode/registry               Hierarchical typed registry primitive
        ↑
@bitcode/prompts                Prompt (Registry of PromptPart), formatters
        ├── parts/PromptPart.ts   Branded string type
        └── raw_promptparts/      ALL PromptPart source content in Bitcode
              ├── generic/        Shared base parts
              └── specific/       Domain-specific parts (large index)
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
├── AGENTS.md, README.md, FAMILIARIZATION.md   # this guide
├── BITCODE_SPEC*.md / BITCODE_SPEC.txt        # canon family
├── BITCODE_SPECIFYING.md
├── packages/                                  # domain monorepo (pnpm workspace)
├── uapi/                                      # Next.js commercial website
├── supabase/                                  # migrations, queries, seed
├── scripts/                                   # gate checkers, promotion, generators
├── .bitcode/                                  # generated structured artifacts
├── protocol-demonstration/                    # protocol realization (not V48 UI truth)
├── fixtures/                                  # JSON fixtures
├── internal-docs/                             # engineering docs
├── docs/                                      # public-facing API docs fragments
├── tests/                                     # root jest setup (limited)
├── _legacy/                                   # IGNORE — historical only
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
| `agent-generics` | Agent = Executor + PTRR + failsafes + generations |
| `tools-generics` | `Tool` class, factories, MCP bridges |
| `pipelines-generics` | Pipeline / PhaseDelegator primitives / stream hooks (re-exports SDIVF) |
| `generic-pipelines-sdivf` | SDIVF base loop (`packages/generic-pipelines/SDIVF`) |
| `llm-generics` | Pure LLM call contracts |
| `registry` | Hierarchical registry (Prompt is a Registry) |
| `prompts` | Prompt + PromptPart + **all** raw prompt parts |
| `context` | Prepared context types for failsafes |
| `logger` | Shared logging |

### 5.2 Generic implementations

| Package family | Responsibility |
| --- | --- |
| `generic-agents/*` | Nested base agents: VCS, danger-wall, code-editor, digester, web-research, … |
| `generic-tools/*` | Nested base tools: editing, git, VCS, LSP, web-search, repository-setup, … |
| `generic-pipelines/*` | Nested base pipelines: SDIVF, … |
| `generic-llms/*` | Nested providers (xAI, OpenAI, Anthropic, Google), defaults, registry aggregator |
| `generic-doc-comment-plugins/*` | Nested doc-comment plugins |

### 5.3 Product domain (AssetPack / BTD / market)

| Package | Responsibility |
| --- | --- |
| `pipelines/asset-pack` (`@bitcode/pipeline-asset-pack`) | **SynthesizeAssetPacks**, deposit options/policy/admission/earnings, depository search/supply, measurement catalogs, settlement/rights contracts, deposit agents |
| `pipeline-hosts` | Inline + Vercel Sandbox harness for decoupled runs |
| `btd` | BTD measurement, journal, authority, settlement, interface contracts, deployment posture helpers |
| `protocol` | Protocol-level types / commercial boundary helpers |
| `api` | Backend route orchestration modules (pipelines cancel/orphan, routes, VCS, conversations helpers) |

**Deposit domain modular layout (post-V48 modularization):**  
public entries remain stable (`./deposit-asset-pack-options`, `./depository-search`, …) while implementations split into `*-types.ts`, `*-helpers.ts`, and builders. Shared source-safe hash/root helpers live in `deposit-source-safe-utils.ts`.

### 5.4 Auth, identity, integrations

| Package | Responsibility |
| --- | --- |
| `auth` | Wallet local identity, Bitcoin wallet client, OAuth provider, Supabase auth redirect, QA telemetry |
| `github` / `gitlab` / `bitbucket` | VCS providers |
| `vcs` + `generic-tools/vcs` | VCS abstraction + tools |
| `git` | Git operation bridge |
| `supabase` | Supabase clients |
| `notion`, `figma`, `jira`, `circleci`, … | External service adapters |

### 5.5 Data, storage, infra

| Package | Responsibility |
| --- | --- |
| `orm` | DB access, generated types, profile contract, data-health |
| `files`, `browser-storage`, `artifacts` | File / storage helpers |
| `streams` | Streaming progress helpers |
| `aws`, `vercel`, `cloudflare`, `docker`, `kubernetes` | Host adapters |
| `postgresql`, `mysql`, `aurora-postgres` | DB drivers / helpers |
| `security`, `sentry`, `observability` | Security + telemetry |

### 5.6 UX-adjacent / interfaces

| Package | Responsibility |
| --- | --- |
| `conversations-generics` | Conversation domain types |
| `chatgptapp` | ChatGPT App MCP scaffolding (commercialization deferred) |
| `executions-mcp` | MCP server for executions |
| `templates-generics`, `attachments-generics` | Template / attachment types |
| `styling`, `responses`, `networking` | Shared UI/HTTP utilities |
| `models` | Pricing / model registry helpers |
| `testing` | Shared test frameworks |

### 5.7 What not to confuse

| Do not confuse | With |
| --- | --- |
| Product **Pipeline** UI | `execution-generics` PTRR executors |
| `generic-agents` base agents | Deposit agents under `pipeline-asset-pack/agents` |
| `protocol-demonstration/` | Live V48 website measurement source of truth |
| `_legacy/` | Anything current |

---

## 6. UAPI — how the website works

`uapi/` is the **Next.js App Router** commercial application.

### 6.1 Dependency direction (strict)

```
packages/*  (no React pages; no import of uapi)
     ↑
uapi/lib, uapi/networking, uapi/hooks   (thin adapters)
     ↑
uapi/components/shadcn     Shadcn*
     ↑
uapi/components/bitcode    Bitcode*  (theme, layout, pipeline chrome, auth, VCS)
     ↑
uapi/components/{experience}
     ↑
uapi/app/*                 page shells only
```

**Never:** experience → experience imports.  
**Never:** packages → uapi.  
**Never:** reintroduce `/terminal`.

### 6.2 Request path (typical deposit synthesis)

1. Browser: `DepositPageClient` → `POST /api/deposit/synthesize-options`
2. Route validates + **dispatches** harness (`dispatch-deposit-synthesis.ts`); returns `runId` immediately
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
- Domain law in `@bitcode/pipeline-asset-pack` + G3 SPEC sections

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
- **Sandbox:** Vercel Sandbox box with harness manifest + live runner template
  (`pipeline-hosts` asset-pack-harness modules)

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
2. `packages/pipelines/asset-pack/src/asset-packs-synthesis.ts` (barrel)  
3. `.../agents/{setup,discovery,implementation,validation}/deposit-*.ts`  
4. `packages/pipeline-hosts/src/asset-pack-harness.ts`  
5. `uapi/app/api/deposit/synthesize-options/route.ts` + `dispatch-deposit-synthesis.ts`  
6. `uapi/components/deposits/DepositPageClient/*`  

### 9.2 “How does an agent call an LLM?”

1. `execution-generics` Execution store  
2. `agent-generics` factoryAgentWithPTRR + substeps  
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

Update `FAMILIARIZATION.md` when:

- A new package family is introduced  
- Experience modularization changes the primary entry paths  
- Inheritance hierarchy gains a new layer  
- Product routes or host model change  

Prefer **accurate, short section edits** over rewriting the whole file each time.

---

## 12. Glossary (engineering)

| Term | Definition |
| --- | --- |
| Executor | Pure `(input, execution) → output` transform |
| Execution | Accumulating hierarchical state for a run |
| PhaseDelegator | Pipeline phase that resolves/runs agents |
| PTRR | Plan-Try-Refine-Retry agent steps |
| Thinkings | Reason → Judge → StructuredOutput generations |
| Failsafe | PCC / ChunkThenSum / Stitch context&size&schema guards |
| Lens / mode | deposit vs read variance on shared SynthesizeAssetPacks |
| Harness | Decoupled pipeline host (inline or sandbox) |
| Journal | BTD ledger rows / reconciliation |
| Parity matrix | Spec claim ↔ implementation ↔ test ledger |

---

*End of familiarization guide. For coding rules, obey `AGENTS.md` and the active SPEC first.*
