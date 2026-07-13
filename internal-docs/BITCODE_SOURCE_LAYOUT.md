# Bitcode Source Layout And Modular Conventions

Status: active engineering convention aligned to V48 frontend architecture law
(`BITCODE_SPEC_V48.md` § Frontend component and naming architecture).

This document is the **filesystem contract** for maintainable Bitcode source.
Agents and humans follow it for new files and for refactors.

---

## 1. Layer rules (dependency direction)

```
packages/*  (domain, pure, reusable)
     ↑
uapi/lib, uapi/networking, uapi/hooks   (thin Next/React adapters)
     ↑
uapi/components/shadcn   →  Shadcn* primitives
     ↑
uapi/components/bitcode  →  Bitcode* base (theme, pipeline, layout, auth)
     ↑
uapi/components/{marketing|packs|reads|deposits|docs|conversations|auxillaries}
     ↑
uapi/app/{page shells}   →  compose only; no heavy logic
```

**Never:** experience → experience. **Never:** page client → another page client.
**Never:** packages → uapi. **Never:** new Terminal product surface.

---

## 2. Experiences (7) + bases (2)

| Prefix | Route / role | Component home |
| --- | --- | --- |
| `Marketing*` | `/` landing | `uapi/components/marketing/` |
| `Packs*` | `/packs` | `uapi/components/packs/` |
| `Reads*` | `/reads` | `uapi/components/reads/` |
| `Deposits*` | `/deposits` | `uapi/components/deposits/` |
| `Docs*` | `/docs` | `uapi/components/docs/` |
| `Conversations*` | conversations (full UX post-V48) | `uapi/components/conversations/` |
| `Auxillaries*` | identity / wallet / GitHub panes | `uapi/components/auxillaries/` |
| `Shadcn*` | root primitives | `uapi/components/shadcn/` |
| `Bitcode*` | shared base over Shadcn | `uapi/components/bitcode/` |

Product run language is **Pipeline** (`BitcodePipeline*`, experience extensions).
Ledger language is **journal**. Agent packages may still say `execution-generics`.

---

## 3. Component unit layout (required pattern)

Each non-trivial component owns a **directory** named after the component.
The entry file is **named** (`ComponentName.tsx`), **not** `index.tsx`.

```
uapi/components/<layer-or-experience>/<ComponentName>/
  <ComponentName>.tsx          # component entry (named file)
  <ComponentName>.types.ts     # props / local types (optional if tiny)
  <ComponentName>.constants.ts # local constants (optional)
  hooks/                       # hooks used only by this component
    use-<concern>.ts
  styles/                      # CSS modules / local style helpers
    <ComponentName>.module.css
  __tests__/                   # co-located unit tests
    <ComponentName>.test.tsx
  README.md                    # only when non-obvious composition
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
   contracts may stay in `uapi/tests/` when they prove routes/pages.

**Barrels:** prefer **explicit imports** (no `export *` barrels) unless a
package public API requires a stable entry.

---

## 4. Experience module layout

```
uapi/components/<experience>/
  README.md
  models/                      # pure route models, formatters, explainers
    <experience>-route-model.ts
    <experience>-format.ts
    ...
  hooks/                       # experience-wide hooks (not component-private)
    use-<experience>-pipeline-selection.ts
  constants/
    <experience>-constants.ts
  types/
    <experience>-types.ts
  <ComponentName>/             # co-located component units (see §3)
    ...
```

Page shells stay thin:

```
uapi/app/<experience>/
  page.tsx                     # metadata + server shell
  <Experience>PageClient.tsx   # orchestration only (providers, URL, sections)
```

**Deposit experience (V48 Phase 4 — modular rebuild target):**

```
uapi/components/deposits/
  models/                      # pure: route session, activity ledger, demand, status
  DepositPageClient/
    DepositPageClient.tsx      # orchestration only
    hooks/                     # live runs, demand, URL, synthesis activity, …
  DepositSourceSelection/
  DepositObfuscationsPanel/
  DepositAssetPackOptions/
  DepositPipelinesMaster/
  DepositSynthesisTelemetry/
  DepositActivityLedgerDetail/
  DepositRouteStateAside/
```

**Packs experience (V48 Phase 4):**

```
uapi/components/packs/
  models/                              # pure: packs-format.ts, activity types
  PacksPageClient/ + hooks/            # use-packs-activity, use-packs-route-params
  PacksPortfolioOverview/
  PacksActivityMaster/                 # shell: filter bar + table + totals
  PacksActivityFilterBar/
  PacksActivityTable/
  PacksActivityDetail/                 # shell: overview + measurements + sections
  PacksActivityDetailStates/
  PacksActivityDetailAccounting/
  PacksActivityDetailGovernance/
  PacksActivityDetailProofRoots/
  PacksDetailSection/
  PacksStatusPill/                     # React status chip (not models/)
```

---

## 5. Bitcode base layout

```
uapi/components/bitcode/
  README.md
  pipeline/                    # shared pipeline table/log/telemetry/models
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

Type, factory, and export names **always encode full inheritance ancestry**:

```
Pipeline                              # primitive
SDIVFPipeline                         # base + primitive
SynthesizeAssetPacksSDIVFPipeline     # specific + base + primitive
```

Do not introduce leaf-only names for layered types (e.g. avoid a product
pipeline named only `AssetPackPipeline` when it is an `…SDIVFPipeline`).
Deprecated short aliases may exist for compatibility; new code uses the
full hierarchy name.

### 6.1 Nested `generic-*` families (required)

Every `packages/generic-*` path is a **family folder**, not a single package.

```
packages/generic-<family>/          # README only (no package.json)
  <ImplementorA>/                   # nested package
    package.json                    # @bitcode/generic-<family>-…
    src/
  <ImplementorB>/
    ...
```

| Family | Nested examples | Package names |
| --- | --- | --- |
| `generic-agents/` | `PTRR/`, `vcs/`, `danger-wall/`, … | `@bitcode/generic-agents-ptrr`, `@bitcode/generic-agent-*` |
| `generic-tools/` | `web-search/`, `vcs/`, … | `@bitcode/generic-tools-*` |
| `generic-pipelines/` | `SDIVF/`, `Simple/` | `@bitcode/generic-pipelines-sdivf`, `-simple` |
| `asset-packs-pipelines/` | `synthesize-deposits/`, `synthesize-reads/`, `settle-reads/` | `@bitcode/asset-packs-pipelines-*` (`SDIVFPipeline`) |
| `generic-llms/` | `xAI/`, `OpenAI/`, `Anthropic/`, `Google/`, `defaults/`, `registry/` | `@bitcode/generic-llms-*` (+ aggregator `@bitcode/generic-llms`) |
| `generic-generations/` | `failsafes/`, `thinkings/` | `@bitcode/generic-generations-failsafes`, `-thinkings` |
| `generic-measurements/` | `measure-agent/`, `absolutes/`, `needinesses/` | `@bitcode/generic-measurements-*` |
| `generic-vcs/` | `github/`, `gitlab/`, `bitbucket/`, `git/` | `@bitcode/generic-vcs-*` |
| `vcs-generics/` | (package root) | `@bitcode/vcs-generics` |
| `host-generics/` | (package root) | `@bitcode/host-generics` |
| `generic-hosts/` | `Local/`, `VercelSandbox/` | `@bitcode/generic-hosts-*` |
| `mcp-generics/` | (package root) | `@bitcode/mcp-generics` |
| `generic-mcps/` | `bitcode/` | `@bitcode/generic-mcps-bitcode` |
| `asset-pack-generics/` | (package root) | `@bitcode/asset-pack-generics` |
| `generic-asset-packs/` | `measured-patch/` | `@bitcode/generic-asset-packs-measured-patch` |
| `asset-packs/` | `synthesis/`, `settle/` | `@bitcode/asset-packs-synthesis`, `-settle` |
| `execution-generics/` | (package root) | `@bitcode/execution-generics` (Execution state) |
| `executor-generics/` | (package root) | `@bitcode/executor-generics` (Executor type) |
| `generic-executors/` | (package root) | `@bitcode/generic-executors` (sequential, parallel, …) |
| `generic-executions/` | (package root) | `@bitcode/generic-executions` (process-root Execution) |
| `external-apps/` | `chatgpt/`, `claude/` | `@bitcode/external-apps-chatgpt`, `-claude` (host embeddings) |
| `containerizations/` | `docker/` | `@bitcode/containerizations-docker` |
| `files/` | (package root) | `@bitcode/files` (file path/op primitives for all packages) |
| `context-generics/` | (package root) | `@bitcode/context-generics` (BC only; no separate Context state) |
| `artifact-generics/` | (package root) | `@bitcode/artifact-generics` (Artifact + storage contract) |
| `generic-artifacts/` | `patch/`, `aws/`, `supabase/`, `vercel/` | type + storage providers |
| `artifacts/` | (package root) | `@bitcode/artifacts` (compose providers, BC) |
| `attachment-generics/` | (package root) | `@bitcode/attachment-generics` (file|external primitives) |
| `generic-attachments/` | `file/`, `external/` | `@bitcode/generic-attachments-*` |
| `attachments-generics/` | (package root) | BC barrel over attachment hierarchy |
| `generic-doc-comment-plugins/` | `doc-developing/` | `@bitcode/doc-comment-developing` |

**Do not** put a root `package.json` on the family folder. Workspace globs are
`packages/generic-<family>/*` (and deeper globs such as
`packages/generic-tools/mcps-tools/*` when needed).

```
packages/
  api/                         # route handlers, orchestration
    src/
      pipelines/
        cancel.ts
        orphan-sweep.ts
      routes/
      ...
  auth/                        # wallet, OAuth provider, auth redirect helpers
    src/
      wallet-local → bitcode-wallet-local.ts
      bitcoin-wallet-client.ts
      ...
  observability/
    src/
      product-analytics.ts
  btd/                         # BTD measurement, journal, settlement, authority
  pipelines-generics/          # Pipeline / PhaseDelegator primitives
  generic-pipelines/SDIVF/     # SDIVF base Pipeline (extends pipelines-generics)
  generic-llms/{xAI,OpenAI,…}/ # nested LLM providers + registry aggregator
  pipelines/asset-pack/        # SynthesizeAssetPacks (extends SDIVF base)
  agent-generics/              # PTRR agents (not product “Pipeline” UI)
  execution-generics/          # low-level executor primitives
  prompts/
  orm/
  ...
```

**Package file rules:** same SRP/DRY/comment discipline; unit tests in
`packages/<name>/__tests__/` or co-located `__tests__/`.

---

## 7. Full repository filesystem breakdown (canonical target)

```
bitcode/
├── AGENTS.md                          # agent/contributor engineering rules
├── README.md                          # product + layout pointer
├── FAMILIARIZATION.md                 # full codebase walkthrough (packages + uapi)
├── BITCODE_SPEC.txt                   # active canon pointer (main)
├── BITCODE_SPEC_V48.md                # draft rebuild-alone SPEC (+ family)
├── BITCODE_SPECIFYING.md
├── internal-docs/
│   ├── BITCODE_SOURCE_LAYOUT.md       # this file
│   ├── BITCODE_FRONTEND_ARCHITECTURE.md
│   ├── TERMINOLOGY.md
│   └── ...
├── packages/                          # domain packages (no React pages)
│   ├── api/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── pipelines/
│   │       │   ├── cancel.ts
│   │       │   └── orphan-sweep.ts
│   │       ├── routes/
│   │       ├── conversations/
│   │       └── ...
│   ├── auth/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── bitcode-wallet-local.ts
│   │       ├── bitcoin-wallet-client.ts
│   │       ├── bitcoin-wallet-oauth-provider.ts
│   │       ├── supabase-auth-redirect.ts
│   │       └── qa-telemetry.ts
│   ├── observability/
│   │   └── src/
│   │       ├── product-analytics.ts
│   │       └── ...
│   ├── btd/
│   │   └── src/
│   │       ├── journal.ts
│   │       ├── operational-health.ts
│   │       └── ...
│   ├── pipelines-generics/            # Pipeline / PhaseDelegator primitives
│   ├── generic-pipelines/
│   │   └── SDIVF/                     # @bitcode/generic-pipelines-sdivf base
│   ├── generic-llms/                  # nested LLM providers (no family package.json)
│   │   ├── xAI/                       # @bitcode/generic-llms-xai
│   │   ├── OpenAI/                    # @bitcode/generic-llms-openai
│   │   ├── Anthropic/                 # @bitcode/generic-llms-anthropic
│   │   ├── Google/                    # @bitcode/generic-llms-google
│   │   ├── defaults/                  # @bitcode/generic-llms-defaults
│   │   └── registry/                  # @bitcode/generic-llms (aggregator)
│   ├── generation-generics/           # Generation primitive vocabulary
│   ├── generic-generations/
│   │   ├── failsafes/                 # @bitcode/generic-generations-failsafes
│   │   └── thinkings/                 # @bitcode/generic-generations-thinkings
│   ├── measurement-generics/          # Measurement primitive vocabulary
│   ├── generic-measurements/
│   │   ├── measure-agent/             # MeasureAgent PTRR base
│   │   ├── absolutes/                 # AbsolutesMeasureAgent
│   │   └── needinesses/               # Needinesses surface (Gate 4)
│   ├── asset-packs/
│   │   ├── synthesis/                 # SynthesizeAssetPacks measurements/catalogs
│   │   └── settle/                    # SettleAssetPacks product surface
│   ├── pipelines/
│   │   └── asset-pack/                # SynthesizeAssetPacks (extends SDIVF)
│   ├── agent-generics/
│   ├── execution-generics/
│   ├── prompts/
│   └── ...
├── uapi/                              # Next.js interface owner
│   ├── ARCHITECTURE.md
│   ├── README.md
│   ├── app/                           # App Router — thin shells + API
│   │   ├── page.tsx                   # Marketing entry
│   │   ├── (root)/                    # Marketing sections (migrate → components/marketing)
│   │   ├── packs/
│   │   │   ├── page.tsx
│   │   │   └── PacksPageClient.tsx
│   │   ├── deposits/
│   │   │   ├── page.tsx
│   │   │   └── DepositPageClient.tsx  # orchestration only
│   │   ├── reads/
│   │   │   ├── page.tsx
│   │   │   └── ReadPageClient.tsx
│   │   ├── docs/
│   │   ├── conversations/
│   │   ├── auxillaries/
│   │   │   ├── page.tsx
│   │   │   ├── [pane]/
│   │   │   └── components/            # migrate → components/auxillaries
│   │   └── api/                       # thin adapters over @bitcode/api
│   ├── components/
│   │   ├── README.md                  # layer + co-location rules
│   │   ├── shadcn/                    # Shadcn* primitives
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   ├── bitcode/                   # Bitcode* base
│   │   │   ├── pipeline/
│   │   │   │   ├── models/            # pure pipeline models
│   │   │   │   ├── cards/
│   │   │   │   ├── BitcodePipelinesTable/
│   │   │   │   │   ├── BitcodePipelinesTable.tsx
│   │   │   │   │   └── __tests__/
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   ├── auth/
│   │   │   ├── routes/
│   │   │   └── ...
│   │   ├── marketing/
│   │   ├── packs/
│   │   ├── reads/
│   │   │   ├── README.md
│   │   │   ├── models/
│   │   │   │   ├── read-format.ts
│   │   │   │   ├── read-route-model.ts
│   │   │   │   ├── enterprise-reading-ux-state.ts
│   │   │   │   ├── deposit-read-workbench.ts
│   │   │   │   └── read-scenarios.ts
│   │   │   ├── hooks/                 # experience-wide hooks
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── ReadsDepositReadWorkbench/
│   │   │   │   ├── ReadsDepositReadWorkbench.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── styles/
│   │   │   │   └── __tests__/
│   │   │   ├── ReadsRepositoryContextPanel/
│   │   │   └── ReadsReadScenarioPanel/
│   │   ├── deposits/
│   │   │   ├── README.md
│   │   │   ├── models/
│   │   │   ├── hooks/
│   │   │   ├── constants/
│   │   │   ├── types/
│   │   │   ├── DepositSourceSelection/
│   │   │   │   ├── DepositSourceSelection.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── styles/
│   │   │   │   └── __tests__/
│   │   │   └── DepositObfuscationsPathIcons/
│   │   ├── docs/
│   │   ├── conversations/
│   │   └── auxillaries/
│   │       ├── AuxillariesOpenButton/
│   │       │   ├── AuxillariesOpenButton.tsx
│   │       │   └── __tests__/
│   │       └── ...
│   ├── hooks/                         # cross-experience React hooks only
│   ├── lib/                           # Next glue; re-exports packages when possible
│   ├── middleware/
│   ├── networking/
│   ├── types/
│   ├── tests/                         # route/page contracts, e2e helpers
│   └── stories/
├── scripts/                           # gate checkers, promotion, tooling
├── supabase/
└── _legacy/                           # historical specs only — do not implement from
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

- `app/terminal/` or new `/terminal` product routes
- `index.tsx` as the primary component entry (use named file)
- God clients that own models + UI + fetch + formatting in one file
- Cross-experience imports
- Versioned path names (`v48-*`, `api/v1`) unless explicitly directed
- Implementing from `_legacy/` or superseded SPEC files

---

## 10. Migration posture

**V48 modular co-location is the active layout.** Component units use
`ComponentName/ComponentName.tsx` under:

- `uapi/components/shadcn/` — primitives (`Button/Button.tsx`, …)
- `uapi/components/bitcode/` — shared base (pipeline, auth, layout, …)
- `uapi/components/{marketing,packs,reads,deposits,docs,conversations,auxillaries}/`

`uapi/app/*` route files are thin shells (metadata + Suspense + re-exports).
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
