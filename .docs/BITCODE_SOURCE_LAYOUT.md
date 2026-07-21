# Bitcode Source Layout And Modular Conventions

Status: active engineering convention aligned to V48 frontend architecture law
(`BITCODE_SPEC_V48.md` § Frontend component and naming architecture).

This document is the **filesystem contract** for maintainable Bitcode source.
Agents and humans follow it for new files and for refactors.

---

## 1. Layer rules (dependency direction)

```
packages/* (domain, pure, reusable)
 ↑
apps/uapi/lib, apps/uapi/networking, apps/uapi/hooks (thin Next/React adapters)
 ↑
apps/uapi/components/shadcn → Shadcn* primitives
 ↑
apps/uapi/components/bitcode → Bitcode* base (theme, pipeline, layout, auth)
 ↑
apps/uapi/components/{marketing|exchange|reads|deposits|docs|conversations|auxillaries}
 ↑
apps/uapi/app/{page shells} → compose only; no heavy logic
```

**Monorepo roots:** `packages/` (shared libs), `apps/` (uapi, mcp, chatgpt, claude),
`containers/` (`images/` for OCI appliances e.g. Pipeliner; `k8/` for Kubernetes manifests).

**Tooling homes (not product runtime):**

| Path | Role |
| --- | --- |
| `scripts/` | Durable automation: gate checkers, promotion, CI helpers |
| `.specifications/` | **All** living SPEC family docs (`BITCODE_SPEC*`, roadmap, specifying law) |
| `.docs/` | Engineering docs (layout, apps, familiarization, agent rules, api fragments) |
| `.qa/` | Version QA ledgers (`BITCODE_VN_QA.md`) |
| `.fixtures/` | Monorepo JSON fixtures (not nested package test `fixtures/`) |
| `.fundraising/` | Non-product fundraising materials |
| `tests/` | Shared Jest helpers (`jest.base.cjs`, package map, resolver) and root test stubs |
| `scripts/specifying/` | Repo specifying machine (`@bitcode/specifying`): gate generators, canon posture (law is `.specifications/BITCODE_SPECIFYING.md`) |
| `.codemods/` | **Temporary** one-off code-modification scripts for this repo (see `.codemods/README.md`) |
| `containers/images/` | OCI / appliance images (Pipeliner VCR, …) |
| `containers/k8/` | Kubernetes manifests (long-runner fleet, …) |

Do not nest temporary codemods under `apps/uapi` or other app packages. Prefer
deleting a codemod after its migration is merged and verified.

**Never:** experience → experience. **Never:** page client → another page client.
**Never:** packages → apps. **Never:** new product surface.

---

## 2. Experiences (7) + bases (2)

| Prefix | Route / role | Component home |
| --- | --- | --- |
| `Marketing*` | `/` landing | `apps/uapi/components/marketing/` |
| `Exchange*` (retired product name Packs; components under exchange/) | `/exchange` (`/packs` redirects) | `apps/uapi/components/exchange/` |
| `Reads*` | `/reads` | `apps/uapi/components/reads/` |
| `Deposits*` | `/deposits` | `apps/uapi/components/deposits/` |
| `Docs*` | `/docs` | `apps/uapi/components/docs/` |
| `Conversations*` | conversations (full UX post-V48) | `apps/uapi/components/conversations/` |
| `Auxillaries*` | identity / wallet / GitHub panes | `apps/uapi/components/auxillaries/` |
| `Shadcn*` | root primitives | `apps/uapi/components/shadcn/` |
| `Bitcode*` | shared base over Shadcn | `apps/uapi/components/bitcode/` |

Product run language is **Pipeline** (`BitcodePipeline*`, experience extensions).
Ledger language is **journal**. Agent packages may still say `execution-generics`.

### 2.1 Product naming law (Exchange vs DataPack vs Packs)

| Term | Means | Product UI / copy | Backend (current) |
| --- | --- | --- | --- |
| **Exchange** | Experience / route (activity ledger) | Nav, `/exchange`, `Exchange*` components | Not a domain package name |
| **DataPack(s)** | Full commodity name (was AssetPack) | Docs, CTAs, formal prose, filter labels | **Wire/package still AssetPack** (see §2.2) |
| **Packs** | Short commodity chip only (same object as DataPacks) | Settlement 2×2, “Packs' BTD Volume”, short triads | Do not invent `packs` package renames for this short form |

**Do not** expand short **Packs** → **DataPacks** in tight UI (chips already share the word *Packs*).  
**Do** rename experience **Packs** → **Exchange**.  
**Do** rename full commodity **AssetPack(s)** → **DataPack(s)** in user-facing product language.

### 2.2 Backend / wire naming scope (AssetPack → DataPack)

Backend rename is **not** the same pass as product UI. Inventory (order of magnitude):

| Layer | Examples | Rename cost | This product pass |
| --- | --- | --- | --- |
| **npm packages** | `@bitcode/asset-packs-pipelines-*`, `generic-asset-packs/*` | High — workspace renames + all imports | **Hold** |
| **TS exports** | `buildAssetPackSandboxHostPlan`, `AssetPackCommodityState*`, `DepositAssetPackOption` | High — dual export period | **Hold** (call sites keep package names) |
| **HTTP routes** | `/api/packs/*`, `/api/pipeline-host/asset-pack`, `/api/btd/asset-pack-*` | Medium — dual routes + clients | **Hold** |
| **Env** | `BITCODE_ASSET_PACK_*` | Medium — host/sandbox allowlists + deploy | **Hold** |
| **DB / storage** | `asset_pack_*` tables/columns/buckets, migration history | **Very high** — dual-write/read migrations | **Hold** |
| **Wire type ids** | `depository-assetpack`, `my-assetpacks`, `settled-assetpack` | High — stored activity + filters | **Hold** ids; **UI labels** already DataPacks |
| **MCP / ChatGPT / BTD schemas** | `deliver_asset_pack`, `synthesize-asset-packs-for-deposit` | High — external contract | **Hold** |
| **Prompts** | ~400 `AssetPack` hits under `packages/prompts` | Medium — generation quality | Follow-up with prompt versioning |
| **Pipeline hosts / Pipeliner image** | materialize paths, host plan mode `asset_pack_pipeline` | Medium — image rebuild | With package rename |

**Future backend migration (when chartered):** dual-read period → rename packages → dual HTTP aliases → env aliases → DB migration with dual columns or view mapping → drop AssetPack after QA. Never rewrite frozen migrations in place.

**Product UI pass (this work):** labels and experience names only; adapters keep importing AssetPack package APIs.

---

## 3. Component unit layout (required pattern)

Each non-trivial component owns a **directory** named after the component.
The entry file is **named** (`ComponentName.tsx`), **not** `index.tsx`.

```
apps/uapi/components/<layer-or-experience>/<ComponentName>/
 <ComponentName>.tsx # component entry (named file)
 <ComponentName>.types.ts # props / local types (optional if tiny)
 <ComponentName>.constants.ts # local constants (optional)
 hooks/ # hooks used only by this component
 use-<concern>.ts
 styles/ # CSS modules / local style helpers
 <ComponentName>.module.css
 __tests__/ # co-located unit tests
 <ComponentName>.test.tsx
 README.md # only when non-obvious composition
```

**Rules:**

1. **SRP** — one primary export / one reason to change per file.
2. **DRY** — shared pure logic → `models/`, experience `hooks/`, or `packages/`.
3. **Top-of-file overview** — every non-trivial `.ts`/`.tsx` starts with a short
 purpose comment (what, for whom, non-obvious constraints).
4. **Inline comments** — only for non-obvious invariants, source-safety, or QA tags.
5. **TypeScript** — prefer explicit props interfaces, discriminated unions,
 `readonly` where helpful; avoid `any` except at true boundaries.
6. **React** — extract hooks for stateful logic; keep render trees readable;
 co-locate styles; no prop drilling dumps when a hook or context is clearer.
7. **Tests** — co-located under `__tests__/` for unit behavior; app-level
 contracts may stay in `apps/uapi/tests/` when they prove routes/pages.

**Barrels:** prefer **explicit imports** (no `export *` barrels) unless a
package public API requires a stable entry.

---

## 4. Experience module layout

```
apps/uapi/components/<experience>/
 README.md
 models/ # pure route models, formatters, explainers
 <experience>-route-model.ts
 <experience>-format.ts
 ...
 hooks/ # experience-wide hooks (not component-private)
 use-<experience>-pipeline-selection.ts
 constants/
 <experience>-constants.ts
 types/
 <experience>-types.ts
 <ComponentName>/ # co-located component units (see §3)
 ...
```

Page shells stay thin:

```
apps/uapi/app/<experience>/
 page.tsx # metadata + server shell
 <Experience>PageClient.tsx # orchestration only (providers, URL, sections)
```

**Deposit experience (V48 Phase 4 — modular rebuild target):**

```
apps/uapi/components/deposits/
 models/ # pure: route session, activity ledger, demand, status
 DepositPageClient/
 DepositPageClient.tsx # orchestration only
 hooks/ # live runs, demand, URL, synthesis activity, …
 DepositSourceSelection/
 DepositObfuscationsPanel/
 DepositDataPackOptions/
 DepositPipelinesMaster/
 DepositSynthesisTelemetry/
 DepositActivityLedgerDetail/
 DepositRouteStateAside/
```

**Packs experience (V48 Phase 4):**

```
apps/uapi/components/exchange/
 models/ # pure: exchange-format.ts, activity types
 ExchangePageClient/ + hooks/ # use-exchange-activity, use-exchange-route-params
 PacksPortfolioOverview/
 ExchangeActivityMaster/ # shell: filter bar + table + totals
 ExchangeActivityFilterBar/
 ExchangeActivityTable/
 ExchangeActivityDetail/ # shell: overview + measurements + sections
 ExchangeActivityDetailStates/
 ExchangeActivityDetailAccounting/
 ExchangeActivityDetailGovernance/
 ExchangeActivityDetailProofRoots/
 ExchangeDetailSection/
 ExchangeStatusPill/ # React status chip (not models/)
```

---

## 5. Bitcode base layout

```
apps/uapi/components/bitcode/
 README.md
 pipeline/ # shared pipeline table/log/telemetry/models
 models/
 cards/
 <ComponentName>/
 layout/
 auth/
 routes/
 vcs/
 ...
```

---

## 6. Packages layout (domain)

Packages hold **framework-agnostic** domain logic. Prefer existing packages;
add new packages when a domain is clearly shared and non-UI.

### 6.0 Hierarchy naming law (required)

**Anything based on, extending, or specializing a primitive must name the full
ancestry** in **types, factories, exports, and file names** — left→right
(primitive → base → specific). Leaf-only labels are illegal for layered types.

Anything based on the **Execution** primitive must include `Execution` in the
name (e.g. `ExecutionPipeline`, `ExecutionPipelineSDIVF`,
`ExecutionPipelineSDIVFExecutionPhaseDelegator`,
`ExecutionPipelineSimpleSettleDataPack`). Phases are exclusively an
`ExecutionPipelineSDIVF` concept (`ExecutionPipelineSDIVFExecutionPhase*`) and
live under `generic-pipelines/execution-pipeline-sdivf`, not `pipelines-generics`.

```
ExecutionPipeline # primitive (based on Execution)
ExecutionPipelineSDIVF # base + primitive
ExecutionPipelineSDIVFSynthesizeDataPacks # specific + base + primitive (left→right)
```

Files match the same order in kebab-case
(`execution-pipeline-sdivf-factory.ts`,
`execution-pipeline-sdivf-synthesize-reads-asset-packs-prompts.ts`).

Do not introduce leaf-only names (e.g. avoid `DataPackPipeline` when the type
is an `ExecutionPipelineSDIVF…`). The tree must use hierarchy names exclusively —
no short aliases, dual exports, or back-compat shims for renamed types.

### 6.1 Nested `generic-*` families (required)

Every `packages/generic-*` path is a **family folder**, not a single package.

```
packages/generic-<family>/ # README only (no package.json)
 <ImplementorA>/ # nested package
 package.json # @bitcode/generic-<family>-…
 src/
 <ImplementorB>/
 ...
```

| Family | Nested examples | Package names |
| --- | --- | --- |
| `generic-agents/` | `PTRR/`, `vcs/`, `danger-wall/`, … | `@bitcode/generic-agents-ptrr`, `@bitcode/generic-agent-*` |
| `generic-tools/` | `files-maintaining/`, `vcs/`, … | `@bitcode/generic-tools-*` |
| `generic-pipelines/` | `execution-pipeline-sdivf/`, `execution-pipeline-simple/` | `@bitcode/generic-pipelines-execution-pipeline-sdivf`, `-simple` |
| `asset-packs-pipelines/` | `domain/` (all 3), `syntheses/domain/` (both synths), `syntheses/deposit/`, `syntheses/read/`, `settle/` | co-located product pipelines + tiered domain |

| `generic-llms/` | `xAI/`, `OpenAI/`, `Anthropic/`, `Google/`, `defaults/`, `registry/`, `models/` | `@bitcode/generic-llms-*` (+ aggregator) |
| `generic-generations/` | `failsafes/`, `thinkings/` | `@bitcode/generic-generations-*` |
| `generic-measurements/` | `measure-agent/`, `absolutes/`, `needinesses/`, `tech-types/` | `@bitcode/generic-measurements-*` |
| `generic-vcs/` | `github/`, `gitlab/`, `bitbucket/`, `git/` | `@bitcode/generic-vcs-*` |
| `vcs-generics/` | (package root) | `@bitcode/vcs-generics` |
| `host-generics/` | (package root) | `@bitcode/host-generics` |
| `generic-hosts/` | `Local/`, `VercelSandbox/` | `@bitcode/generic-hosts-*` |
| `mcp-generics/` | (package root) | `@bitcode/mcp-generics` |
| `generic-mcps/` | `bitcode/` | `@bitcode/generic-mcps-bitcode` |
| `asset-packs-generics/` | (package root) | `@bitcode/asset-packs-generics` |
| `generic-asset-packs/` | `synthesis/` (base of 3 products), `deposit-synthesized/`, `read-synthesized/`, `read-synthesized-settled/`, `synthesis/` (deprecated) | `@bitcode/generic-asset-packs-*` |
| `execution-generics/` | (package root) | `@bitcode/execution-generics` |
| `executor-generics/` | (package root) | `@bitcode/executor-generics` |
| `generic-executors/` | (package root) | `@bitcode/generic-executors` |
| `generic-executions/` | (package root) | `@bitcode/generic-executions` |
| `external-apps/` | `chatgpt/`, `claude/` | `@bitcode/external-apps-*` |
| `externals/` | `figma/`, `jira/`, `notion/`, `vercel/` | `@bitcode/externals-*` |
| `external-telemetry/` | `google/`, `sentry/`, `vercel/` | `@bitcode/external-telemetry-*` |
| `containerizations/` | `docker/`, `kubernetes/` | `@bitcode/containerizations-*` |
| `web-scrapers/` | `firecrawl/` | `@bitcode/web-scrapers-firecrawl` |
| `web-search/` | `multi/`, `exa/` | `@bitcode/web-search`, `-exa` |
| `ci/` | `circle/` | `@bitcode/ci-circle` |
| `email/` | `supabase/` | `@bitcode/email` |
| `linting/` | `eslint/` | `eslint-plugin-bitcode` |
| `host-commands/` | `grep/` | `@bitcode/host-commands-grep` |
| `security/` | `encryption/`, `credentials/`, `rate-limiting/`, … | `@bitcode/security-*` |
| `doc-comment-generics/` | (package root) | `@bitcode/doc-comment-generics` |
| `generic-doc-comments/` | `doc-code/`, `doc-developing/` | `@bitcode/generic-doc-comments-*` |
| `artifact-generics/` | (package root) | `@bitcode/artifact-generics` |
| `generic-artifacts/` | `patch/`, `aws/`, `supabase/`, `vercel/` | type + storage providers |
| `attachment-generics/` | (package root) | `@bitcode/attachment-generics` |
| `generic-attachments/` | `file/`, `external/` | `@bitcode/generic-attachments-*` |
| `files/` | (package root) | `@bitcode/files` |
| `file-editing/` | (package root) | `@bitcode/file-editing` |
| `file-refactoring/` | (package root) | `@bitcode/file-refactoring` |
| `obfuscation/` | (package root) | `@bitcode/obfuscation` |
| `conversations/` | (package root) | `@bitcode/conversations` |
| `api/` | `src/responses/`, `src/streams/`, routes | `@bitcode/api` (+ `/responses`, `/streams`) |

**`*-generics` naming law:** use only when a corresponding `generic-*` implementor
family exists. Otherwise use a plain domain name (`obfuscation`, `conversations`).

**Do not** put a root `package.json` on a pure family folder (`generic-*`,
`externals/`, `web-search/`, …). Workspace globs are `packages/<family>/*`
(and deeper globs such as `packages/generic-tools/mcps-tools/*` when needed).
Security nests under `packages/security/*` with a thin composition barrel `@bitcode/security`.

```
packages/
 api/ # routes + responses/ + streams/ primitives
 auth/ # wallet, OAuth, auth redirect helpers
 asset-packs-generics/ # DataPack protocol primitive
 generic-asset-packs/ # synthesis, deposit/read/settled-read, settle
 asset-packs-pipelines/
   domain/              # shared by all 3 product pipelines
   syntheses/domain/    # shared by deposit + read synth only
   syntheses/deposit/   # deposit product package
   syntheses/read/      # read product package
   settle/              # settle product package
 pipelines-generics/ # Pipeline primitive
 generic-pipelines/execution-pipeline-sdivf/ # SDIVF base
 generic-llms/{xAI,OpenAI,…}/ # LLM providers + models/
 vcs-generics/ + generic-vcs/ # VCS hierarchy
 security/{encryption,…}/ # security subpackages
 files/ + file-editing/ # file primitives + mutations
 btd/ # BTD journal / settlement / authority
 prompts/ # Prompt + PromptPart + raw parts
 orm/ # data access
 ...
```

**Package file rules:** same SRP/DRY/comment discipline; unit tests in
`packages/<name>/__tests__/` or co-located `__tests__/`.

---

## 7. Full repository filesystem breakdown (canonical target)

```
bitcode/
├── AGENTS.md # agent/contributor engineering rules
├── README.md # product + layout pointer
├── .docs/FAMILIARIZATION.md # full codebase walkthrough (packages + uapi)
├── BITCODE_SPEC.txt # active canon pointer (main)
├── BITCODE_SPEC_V48.md # draft rebuild-alone SPEC (+ family)
├── BITCODE_SPECIFYING.md
├── .docs/
│ ├── BITCODE_SOURCE_LAYOUT.md # this file
│ ├── BITCODE_FRONTEND_ARCHITECTURE.md
│ ├── TERMINOLOGY.md
│ └── ...
├── packages/ # domain packages (no React pages)
│ ├── api/
│ │ └── src/
│ │ ├── index.ts
│ │ ├── pipelines/
│ │ │ ├── cancel.ts
│ │ │ └── orphan-sweep.ts
│ │ ├── routes/
│ │ ├── conversations/
│ │ └── ...
│ ├── auth/
│ │ └── src/
│ │ ├── index.ts
│ │ ├── bitcode-wallet-local.ts
│ │ ├── bitcoin-wallet-client.ts
│ │ ├── bitcoin-wallet-oauth-provider.ts
│ │ ├── supabase-auth-redirect.ts
│ │ └── qa-telemetry.ts
│ ├── observability/
│ │ └── src/
│ │ ├── product-analytics.ts
│ │ └── ...
│ ├── btd/
│ │ └── src/
│ │ ├── journal.ts
│ │ ├── operational-health.ts
│ │ └── ...
│ ├── pipelines-generics/ # ExecutionPipeline primitives only (no phases)
│ ├── generic-pipelines/
│ │ ├── execution-pipeline-sdivf/ # SDIVF base + ExecutionPipelineSDIVFExecutionPhase*
│ │ └── execution-pipeline-simple/ # linear stages base
│ ├── generic-llms/ # nested LLM providers (no family package.json)
│ │ ├── xAI/ # @bitcode/generic-llms-xai
│ │ ├── OpenAI/ # @bitcode/generic-llms-openai
│ │ ├── Anthropic/ # @bitcode/generic-llms-anthropic
│ │ ├── Google/ # @bitcode/generic-llms-google
│ │ ├── defaults/ # @bitcode/generic-llms-defaults
│ │ └── registry/ # @bitcode/generic-llms (aggregator)
│ ├── generation-generics/ # Generation primitive vocabulary
│ ├── generic-generations/
│ │ ├── failsafes/ # @bitcode/generic-generations-failsafes
│ │ └── thinkings/ # @bitcode/generic-generations-thinkings
│ ├── measurement-generics/ # Measurement primitive vocabulary
│ ├── generic-measurements/
│ │ ├── measure-agent/ # MeasureAgent PTRR base
│ │ ├── absolutes/ # AbsolutesMeasureAgent
│ │ └── needinesses/ # Needinesses surface (Gate 4)
│ ├── asset-packs/
│ │ ├── synthesis/ # SynthesizeDataPacks measurements/catalogs
│ │ └── settle/ # SettleDataPack product surface
│ ├── pipelines/
│ │ └── asset-pack/ # SynthesizeDataPacks (extends SDIVF)
│ ├── agent-generics/
│ ├── execution-generics/
│ ├── prompts/
│ └── ...
├── apps/uapi/ # Next.js interface owner
│ ├── ARCHITECTURE.md
│ ├── README.md
│ ├── app/ # App Router — thin shells + API
│ │ ├── page.tsx # Marketing entry
│ │ ├── (root)/ # Marketing sections (migrate → components/marketing)
│ │ ├── packs/
│ │ │ ├── page.tsx
│ │ │ └── ExchangePageClient.tsx
│ │ ├── deposits/
│ │ │ ├── page.tsx
│ │ │ └── DepositPageClient.tsx # orchestration only
│ │ ├── reads/
│ │ │ ├── page.tsx
│ │ │ └── ReadPageClient.tsx
│ │ ├── .docs/
│ │ ├── conversations/
│ │ ├── auxillaries/
│ │ │ ├── page.tsx
│ │ │ ├── [pane]/
│ │ │ └── components/ # migrate → components/auxillaries
│ │ └── api/ # thin adapters over @bitcode/api
│ ├── components/
│ │ ├── README.md # layer + co-location rules
│ │ ├── shadcn/ # Shadcn* primitives
│ │ │ ├── button.tsx
│ │ │ └── ...
│ │ ├── bitcode/ # Bitcode* base
│ │ │ ├── pipeline/
│ │ │ │ ├── models/ # pure pipeline models
│ │ │ │ ├── cards/
│ │ │ │ ├── BitcodePipelinesTable/
│ │ │ │ │ ├── BitcodePipelinesTable.tsx
│ │ │ │ │ └── __tests__/
│ │ │ │ └── ...
│ │ │ ├── layout/
│ │ │ ├── auth/
│ │ │ ├── routes/
│ │ │ └── ...
│ │ ├── marketing/
│ │ ├── packs/
│ │ ├── reads/
│ │ │ ├── README.md
│ │ │ ├── models/
│ │ │ │ ├── read-format.ts
│ │ │ │ ├── read-route-model.ts
│ │ │ │ ├── enterprise-reading-ux-state.ts
│ │ │ │ ├── deposit-read-workbench.ts
│ │ │ │ └── read-scenarios.ts
│ │ │ ├── hooks/ # experience-wide hooks
│ │ │ ├── constants/
│ │ │ ├── types/
│ │ │ ├── ReadsDepositReadWorkbench/
│ │ │ │ ├── ReadsDepositReadWorkbench.tsx
│ │ │ │ ├── hooks/
│ │ │ │ ├── styles/
│ │ │ │ └── __tests__/
│ │ │ ├── ReadsRepositoryContextPanel/
│ │ │ └── ReadsReadScenarioPanel/
│ │ ├── deposits/
│ │ │ ├── README.md
│ │ │ ├── models/
│ │ │ ├── hooks/
│ │ │ ├── constants/
│ │ │ ├── types/
│ │ │ ├── DepositSourceSelection/
│ │ │ │ ├── DepositSourceSelection.tsx
│ │ │ │ ├── hooks/
│ │ │ │ ├── styles/
│ │ │ │ └── __tests__/
│ │ │ └── DepositObfuscationsPathIcons/
│ │ ├── .docs/
│ │ ├── conversations/
│ │ └── auxillaries/
│ │ ├── AuxillariesOpenButton/
│ │ │ ├── AuxillariesOpenButton.tsx
│ │ │ └── __tests__/
│ │ └── ...
│ ├── hooks/ # cross-experience React hooks only
│ ├── lib/ # Next glue; re-exports packages when possible
│ ├── middleware/
│ ├── networking/
│ ├── types/
│ ├── tests/ # route/page contracts, e2e helpers
│ └── .storybook/stories/
├── .specifications/ # all living BITCODE_SPEC* family documents
├── .docs/ # engineering docs (AGENTS, APPS, FAMILIARIZATION, layout, …)
├── .qa/ # version QA ledgers
├── .fixtures/ # monorepo JSON fixtures
├── .fundraising/ # non-product fundraising materials
├── tests/ # shared Jest helpers + root test stubs
├── scripts/ # durable gate checkers, promotion, tooling
│   └── specifying/ # @bitcode/specifying machine (not product domain)
├── .codemods/ # temporary one-off codemods (see .codemods/README.md)
├── containers/
│   ├── images/ # OCI appliances (pipeliner, …)
│   ├── k8/ # Kubernetes manifests
│   └── Dockerfile.long-runner* # long-runner images
├── supabase/
```

---

## 8. Naming conventions

| Kind | Pattern | Example |
| --- | --- | --- |
| Component file | `PascalCase.tsx` matching directory | `DepositSourceSelection.tsx` |
| Hook file | `use-<kebab-concern>.ts` | `use-deposit-pipeline-selection.ts` |
| Pure model | `<domain>-<role>.ts` | `pipeline-activity-history.ts` |
| Constants | `<domain>-constants.ts` | `deposit-constants.ts` |
| Test | `<ComponentName>.test.tsx` or `<module>.test.ts` | co-located |
| Symbol prefix | Experience or layer | `Reads*`, `Bitcode*`, `Shadcn*` |

---

## 9. What is forbidden

- `product experience components/` or new `/exchange` product routes
- `index.tsx` as the primary component entry (use named file)
- God clients that own models + UI + fetch + formatting in one file
- Cross-experience imports
- Versioned path names (`v48-*`, `api/v1`) unless explicitly directed
- Implementing from superseded SPEC files or removed historical trees

---

## 10. Migration posture

**V48 modular co-location is the active layout.** Component units use
`ComponentName/ComponentName.tsx` under:

- `apps/uapi/components/shadcn/` — primitives (`Button/Button.tsx`, …)
- `apps/uapi/components/bitcode/` — shared base (pipeline, auth, layout, …)
- `apps/uapi/components/{marketing,packs,reads,deposits,docs,conversations,auxillaries}/`

`apps/uapi/app/*` route files are thin shells (metadata + Suspense + re-exports).
Page clients live under the matching experience component tree.

When touching a remaining large monofile, extract pure helpers and section
components into co-located units in the same change if scope stays bounded.

Agents: after structural moves, update imports, co-locate or retarget tests,
and keep typecheck/jest greenable.

---

## 11. Package layer notes

- Domain packages under `packages/*` own pure logic; never import from `uapi`.
- Generated artifacts (e.g. ORM `database.generated.ts`) stay whole; do not hand-split.
- Prefer extracting new package modules over growing god files when logic is reusable.
