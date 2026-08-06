# Contributing to Bitcode

This guide is for **human developers** joining the commercial Bitcode monorepo.
It explains how work is specified, where code lives, how to run the app across
local / staging / sandbox hosts, and what “done” means for tests and proof.

| Start here | Then |
| --- | --- |
| This file | Day-to-day development |
| [`.docs/FAMILIARIZATION.md`](.docs/FAMILIARIZATION.md) | Package catalog, inheritance, experiences, request paths |
| [`.docs/AGENTS.md`](.docs/AGENTS.md) | Gate/commit law and craft expectations (agents + humans) |
| [`.docs/BITCODE_SOURCE_LAYOUT.md`](.docs/BITCODE_SOURCE_LAYOUT.md) | Filesystem / component unit contract |
| [`.specifications/BITCODE_SPEC.txt`](.specifications/BITCODE_SPEC.txt) | Active canon pointer |
| [`README.md`](README.md) | Product summary + quick start |

**Non-canonical:** README, this file, FAMILIARIZATION, ASSET_PACKS, and AGENTS
orient. If they conflict with the active or draft-target SPEC family, the
**SPEC wins**.

---

## 1. Product in one page

Bitcode turns technical knowledge into **AssetPacks** — always synthesized
artifacts (**patch + measurements + metadata**), never raw unpaid source as the
sellable unit.

| Actor | Path |
| --- | --- |
| Depositor | `/deposits` → connect source → SynthesizeDepositAssetPacks (SDIVF) → review → admit |
| Reader | `/reads` → Need → SynthesizeReadAssetPacks → select → SettleAssetPack → BTD rights → delivery |
| Operator | `/packs`, Auxillaries (wallet / GitHub / org), `/docs` |

- **Pipeline** = product run language (UI logs, history, host plans).
- **Journal** = BTD ledger language.
- Product routes: `/packs`, `/deposits`, `/reads`, `/docs`.
- Settlement money is **BTC-testnet** in current commercial posture; value-bearing
  mainnet is blocked until a future canon admits it.

Orientation only: [`.docs/ASSET_PACKS.md`](.docs/ASSET_PACKS.md).  
Binding law: `.specifications/BITCODE_SPEC_V48.md` (draft) / active `V47` family.

---

## 2. Specification-driven development

Bitcode is **specified before (or with) implementation**. You do not invent product
law from UI vibes or from older version folklore.

### 2.1 What “canon” means

| Term | Meaning |
| --- | --- |
| **Canon** | The single active system specification family that defines rebuildable product law |
| **Pointer** | `.specifications/BITCODE_SPEC.txt` — currently `V47` on promoted trees |
| **Draft target** | Next version family (e.g. **V48**) edited on `version/v48` while pointer stays on promoted version |
| **Family** | For version `VN`: `BITCODE_SPEC_VN.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`, optional `_PROVEN` |
| **Metaspec** | `.specifications/BITCODE_SPECIFYING.md` — how specifying works (Complete Implementation Derivability) |
| **Proof artifacts** | Generated under `.proofs/vN/` and PROVEN appendices — source-safe metadata only |

**Complete Implementation Derivability:** a competent reader must rebuild the
current system from the **active** (or explicitly draft-target) family alone —
no silent “remember V30 did X” or non-canonical guides carrying law.

Truth priority when working a draft gate:

1. Draft-target SPEC sections for that gate (e.g. V48 §G3)
2. Active promoted family for inherited law still in force
3. PARITY_MATRIX rows for that gate
4. NOTES for architecture intent (never stronger than SPEC)
5. Source + tests as the implementation of the above

### 2.2 Branches and pull requests

```
main                    # protected; promoted canon only
 └── version/v48        # draft-target base (current commercial draft work)
      └── v48/gate-N-<topic>   # one gate scope
```

1. Branch **from** `version/v48` (or the active draft version branch).
2. Name gate branches `v48/gate-N-short-topic`.
3. Close a gate only when acceptance is **implemented, specified, tested,
   documented, committed, pushed, and PR’d** into the version branch.
4. Promote the version branch → `main` only when **all** gates close and the
   promotion workflow advances the pointer.

**Never** push product work straight to `main`. Expect PRs + verified signatures
via the **Bitcode Core Contributions** ruleset.

### 2.3 Commit and PR messages (50/72 law)

Every commit / gate PR **subject** declares exactly one of:

| Token | Meaning |
| --- | --- |
| `(spec-only)` | Spec family / notes / roadmap only |
| `(impl-only)` | Code, tests, tooling, scripts only |
| `(spec-impl)` | Spec + implementation in lockstep |

**Message shape** (`.specifications/BITCODE_SPECIFYING.md` §2.8):

| Part | Rule |
| --- | --- |
| **Subject** (line 1) | ≤ **50** characters (soft) — readable in compact logs |
| **Blank line** | Required between subject and body when a body is present |
| **Body lines** | ≤ **72** characters each (hard) |

Examples:

```text
V48 Gate 3 (impl-only): Wire deposit cancel

Wire cancel into the pipeline host and add the
focused host route test.
```

```text
V48 Gate 4 (spec-only): Record read settle rows
V48 Gate 4 (spec-impl): Close need panel parity
```

**Subject truthfulness (scope class):** the subject must not imply a **default
product or system** change when the work is **debug / opt-in config / env /
flag / operator-only / test-only**. Name the scope class in the subject
(`debug env`, `flag`, `test`, `script`, …). Prefer those words over filler
under the 50-char soft budget.

| Poor (false system implication) | Better (true scope) |
| --- | --- |
| `…: Skip Thinkings Judge/SO` | `…: Skip Judge/SO debug env` |
| `…: Disable settle rehydrate` | `…: Gate settle rehydrate behind flag` |
| `…: Always use mock LLM` | `…: Mock LLM via debug env` |

Full lesson and table: [`.docs/AGENTS.md`](.docs/AGENTS.md) (commit subject
truthfulness). Spec law: [`.specifications/BITCODE_SPECIFYING.md`](.specifications/BITCODE_SPECIFYING.md) §2.8.

**Never** use expanded forms like `(specification-only)` in subjects. Put proof
commands and file lists in the **body** (wrapped at 72).

Gate PR titles follow the same subject shape:  
`V48 Gate N (impl-only): Short topical title`  
Version promotion PRs: uppercase version + “canonical promotion” wording.

Full craft rules: [`.docs/AGENTS.md`](.docs/AGENTS.md).  
Enforced by `.githooks/commit-msg` → `scripts/check-bitcode-commit-msg.mjs`.

### 2.4 QA finding tags

Inline comments that cite QA findings must use fully-qualified tags, e.g.
`V48-Gate3-F26-B`, matching a heading in `.qa/BITCODE_V48_QA.md`. Never bare
`F26-B` tags.

---

## 3. Repository map (where to put code)

```
packages/*          Domain, primitives, generic implementations, BTD, hosts, API
apps/uapi           Next.js website + HTTP APIs (primary commercial surface)
apps/mcp            Bitcode MCP server
apps/chatgpt        ChatGPT App surface
apps/claude         Claude App surface
.specifications/     Canon family (ONLY place for BITCODE_SPEC_* law)
scripts/            Canon checks, promotion, operators
scripts/specifying  Package-native proof / promotion readiness machine
supabase/           Migrations, local config, data-health
containers/         Pipeliner OCI image, long-runner Docker, k8s
.qa/                Version QA ledgers
.docs/              Non-canonical guides (FAMILIARIZATION, layout, APPS, …)
.fixtures/          Monorepo JSON fixtures
.fundraising/       Non-product fundraising materials
.codemods/          Temporary one-off codemods
.proofs/           Generated proof artifacts (versioned: `.proofs/v48/…`)
```

**Dependency direction (strict):**

```
packages (pure domain)
  → apps/uapi/lib, networking, hooks (thin adapters)
  → components/shadcn → Bitcode*
  → experiences: marketing | packs | reads | deposits | docs | conversations | auxillaries
  → app/* page shells only
```

**Hierarchy pattern** (the monorepo’s main engineering pattern):

```
*-generics / primitive  → types, factories, composition
generic-* packages      → reusable bases
product packages        → domain specializations (e.g. asset-packs-pipelines)
uapi / interfaces       → HTTP + React only
```

Deep dive: FAMILIARIZATION §3–§7 · layout contract: BITCODE_SOURCE_LAYOUT.

**Paths are unversioned.** Do not invent `api/v1`, `v48-foo` modules, or dual
package homes. There is **no** root `uapi/` or `mcp/` symlink — use `apps/…`.

---

## 4. Local setup

### 4.1 Prerequisites

| Tool | Notes |
| --- | --- |
| **Node** | `>= 21` (`package.json` engines) |
| **pnpm** | See root `packageManager` (currently `pnpm@10.33.0`) |
| **Docker** | Local Supabase (`supabase start`) |
| **Git** | Signed commits if your org requires verified signatures |

```bash
pnpm install
```

Root convenience scripts:

```bash
pnpm run dev:local      # supabase + Next (filter bitcode-uapi)
pnpm run dev:remote     # Next only
pnpm run build:uapi
pnpm run typecheck:uapi
pnpm run lint:uapi
pnpm run test:uapi
```

Or:

```bash
pnpm -C apps/uapi run dev:remote
pnpm --filter bitcode-uapi run typecheck
```

### 4.2 Environment files

| File | Role |
| --- | --- |
| `apps/uapi/.env.example` | Documented template (commit) |
| `apps/uapi/.env.local` | **Your** secrets (never commit) |
| Root `.env.local` | Sometimes used by staging/host scripts — prefer uapi-local for app |

```bash
cp apps/uapi/.env.example apps/uapi/.env.local
```

**Never** commit API keys, service-role keys, GitHub private keys, or wallet
material. Prefer team secret stores / Vercel env for shared values.

### 4.3 Environment modes (mental model)

| Mode | Intent | Typical knobs |
| --- | --- | --- |
| **Mock UI** | Browse UX without live backends | `NEXT_PUBLIC_MASTER_MOCK_MODE=true`, feature mocks `true` |
| **Local full stack** | Supabase local + Next | `pnpm run dev:local`, local URL/keys |
| **Local app + staging DB** | Next local, remote Supabase project | `dev:remote` + remote `NEXT_PUBLIC_SUPABASE_*` |
| **Preview (Vercel)** | Deployed branch preview | Vercel envs; **sandbox** pipeline host forced |
| **Staging-testnet** | Near-production protocol posture | Testnet4 wallet, real inference, GitHub App, no mainnet value |
| **Production** | Live commercial site | Same host law as preview; still testnet settlement until canon says otherwise |

Detail: [`.docs/SUPABASE.md`](.docs/SUPABASE.md) · [`.docs/VERCEL.md`](.docs/VERCEL.md) ·
[`.docs/DEPLOYMENT.md`](.docs/DEPLOYMENT.md).

### 4.4 Core env groups (uapi)

Copy names from `.env.example`; this table is orientation only.

| Group | Variables (examples) | Notes |
| --- | --- | --- |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, JWT secret | Public vs service-role split; service role **server only** |
| **Auth / wallet** | `BITCODE_BITCOIN_OAUTH_*`, `NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4` | Custom OAuth provider `custom:bitcode-bitcoin` |
| **LLM** | `ANTHROPIC_API_KEY` / `XAI_API_KEY` / `OPENAI_API_KEY`, optional `BITCODE_LLM_PROVIDER`, `BITCODE_LLM_MODEL` | Default product bias: Anthropic Haiku unless overridden |
| **Real inference** | `BITCODE_ASSET_PACK_REAL_INFERENCE`, `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE` | Off by default in example; turn on for real deposit/read synthesis |
| **Pipeline host** | `BITCODE_PIPELINE_HOST=local\|sandbox`, `BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS` | **Serverless always sandbox** (`VERCEL=1` forces it) |
| **Pipeliner image** | `BITCODE_PIPELINE_SANDBOX_IMAGE` | VCR image for `Sandbox.create({ image })` |
| **GitHub App** | `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_PRIVATE_KEY`, webhook secret | **One shared app** for local/preview/staging/prod |
| **Mocks** | `NEXT_PUBLIC_MASTER_MOCK_MODE`, `NEXT_PUBLIC_ENABLE_MOCKS`, per-feature mocks | All default **false** when unset |

Provider precedence for default LLM when `BITCODE_LLM_PROVIDER` is unset is
defined in `@bitcode/generic-llms` defaults (anthropic → google → openai by key
presence). Do not assume host shell keys match CI.

---

## 5. Data planes: local Supabase vs preview/staging

### 5.1 Fully local

```bash
# From repo with Docker running
pnpm run dev:local
# or:
pnpm -C apps/uapi run dev:local   # supabase start & next
pnpm -C apps/uapi run dev:stop
```

- Migrations: `supabase/migrations/` (active SQL only).
- Types: `pnpm -C packages/orm run generate-types` (local gen).
- Health: `pnpm -C packages/orm run data-health` (see `supabase/DATA_HEALTH.md`).

### 5.2 Local Next + remote Supabase (common for “real auth”)

1. Point `NEXT_PUBLIC_SUPABASE_*` at the **staging** (or team-shared) project.
2. `pnpm run dev:remote`.
3. Ensure OAuth redirect allow-lists include `http://127.0.0.1:3000/...` callback
   paths used by `/tps/supabase/callback` and wallet authorize routes.

### 5.3 Vercel Preview / staging-testnet

| Concern | Expectation |
| --- | --- |
| Project root | Vercel **Root Directory** = `apps/uapi` |
| Pipeline host | Sandbox (not LocalHost) |
| Pipeliner | Image ref via `BITCODE_PIPELINE_SANDBOX_IMAGE` |
| Supabase | Shared staging project env on the deployment |
| Settlement | Testnet4; mainnet value blocked |
| Secrets | Vercel project env / OIDC for sandbox create |

Use **Preview** for integration that needs multi-user URLs and production-like
host constraints. Use **local** for fast UI/package iteration.

---

## 6. Pipeline hosts and containerizations

### 6.1 Host selection law

| Host | When |
| --- | --- |
| **LocalHost** | Default on developer machines (`BITCODE_PIPELINE_HOST=local` or unset) |
| **Vercel Sandbox** | Serverless/preview/prod; optional from laptop with Vercel auth |

LocalHost must **not** be the production path for untrusted customer clone/work.

Packages:

- `@bitcode/host-generics` — host primitives
- `@bitcode/generic-hosts/*` — Local / VercelSandbox bases
- `@bitcode/pipeline-hosts` — product host orchestration

### 6.2 Pipeliner image (consistent runs across machines)

**Pipeliner** (`containers/images/pipeliner`, package `@bitcode/pipeline-image`) is
the OCI appliance used when Sandbox runs deposit/read synthesis:

1. `Sandbox.create({ image: <pipeliner> })` — **image-only** (no create-time customer git).
2. Host writes run manifest + clone env.
3. In-box Setup clones the **customer** repo with install token.
4. Pipeline runners stream telemetry; box is ephemeral.

| | |
| --- | --- |
| Registry (example) | `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner` |
| Docs | [`containers/images/pipeliner/README.md`](containers/images/pipeliner/README.md) |
| Related | [`.docs/VERCEL.md`](.docs/VERCEL.md), [`containers/README.md`](containers/README.md) |

Other container surfaces: long-runner Dockerfiles under `containers/`, k8s under
`containers/k8/`, and `packages/containerizations/*` (docker/kubernetes helpers).

**Why this matters for contributors:** two laptops and a Vercel Preview should
run the **same** pipeline program inside Pipeliner when host=`sandbox`, instead
of each machine inventing a different install graph.

---

## 7. Edge case: GitHub App development

Bitcode uses a **single shared GitHub App**
(`https://github.com/apps/bitcode-github-auxiliary` by default) for **all**
environments — local, preview, staging, production. Do **not** invent a separate
“staging-only” App unless product law explicitly changes.

### 7.1 Credentials

Set the same family of vars everywhere (see `.env.example`):

- `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`
- `GITHUB_PRIVATE_KEY` — PEM contents / escaped PEM / base64 PEM (**not** a local file path)
- `GITHUB_WEBHOOK_SECRET`
- Optional public URL override: `NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL`

### 7.2 Installations and local dev

1. Install the App on the GitHub account/org that owns test repos.
2. Complete Auxillaries → Externals (or equivalent connect flow) so Bitcode stores
   installation linkage for the signed-in user.
3. Callback / setup routes live under uapi TPS / GitHub install paths — redirects
   must allow your local origin (`127.0.0.1`).
4. For monorepos, prefer **Permissible sources** during deposit smoke so synthesis
   stays bounded.

### 7.3 Common pitfalls

| Symptom | Check |
| --- | --- |
| Empty branches/commits | Installation / token reconnect; Auxillaries GitHub connection status |
| Works on Preview, not local | Callback URLs / cookie domain / `127.0.0.1` vs `localhost` mismatch |
| Sandbox clone fails | Install token scope, private key format, host clone env inside Pipeliner |
| Mock repos only | Mocks still enabled (`NEXT_PUBLIC_MOCK_GITHUB_*`) |

Connected-services orientation: [`.docs/BITCODE_CONNECTED_SERVICES.md`](.docs/BITCODE_CONNECTED_SERVICES.md).

---

## 8. Testing, documenting, and proving

### 8.0 Package co-location and core vs edges

**Package co-location (required):** unit tests live in the package that **owns**
the unit under test. Do not put package A’s suite under package B because B is a
consumer (e.g. parsing tests belong in `packages/parsing/`, not
`agent-generics`; PCC belongs in `packages/generic-generations/failsafes/`).

**Implementer exception:** when package B *implements for itself* a base or
specific class from a primitive/base in A, B’s specialization tests co-locate in
B. A’s base tests stay in A. Do not re-host A’s base suite under B.

Package tests (backend first; other packages migrate progressively) are also
split so **core behavior stays obvious** while edge coverage can grow without
burying it.

| Category | Role | Growth |
| --- | --- | --- |
| **Core** | Default / happy-path behavior — a new reader should learn the package from these files alone | Stable unless core API/behavior changes |
| **Edges** | Exhaustive edges: failures, bounds, debug env, odd inputs, regression pins | Grows continuously |

**Physical law (folder + filename both required):**

```text
packages/<pkg>/src/__tests__/
  core/<topic>.core.test.ts
  edges/<topic>.edges.test.ts
  support/                    # fixtures only
```

| Script | Meaning |
| --- | --- |
| `pnpm -C packages/<pkg> test` | **Both** core and edges (commit / CI bar) |
| `test:core` / `test:edges` | Convenience filters — **not** a way to skip edges before commit |

**Heuristic:** if it teaches “how this package works by default,” it is **core**.
If it pins a corner, flag, failure, or bug, it is **edges**.

When reorganizing a package, also **elevate** tests: clearer `describe`/`it`
names, remove stale or redundant cases, keep core files short and didactic.

**Pilots:** `@bitcode/agent-generics` (composition only); `@bitcode/parsing`;
`@bitcode/generic-generations-failsafes` (PCC + prepared-context);
`@bitcode/generic-agents-agent-measure` / `absolutes`;
`@bitcode/parsing`. Other packages adopt the same layout when next touched.
Full agent law: `.docs/AGENTS.md`.

### 8.1 REQUIRED: never commit until full local CI is completely green

**Never commit** (and **never push**) until the living required CI surface has
been **run on the final tree** and is **completely green**. Partial smoke is
iteration only — not a commit bar.

**All commits must be green for production deployment.** A red commit is
undeployable debt. Do not rely on “CI will catch it after push.”

### 8.1.0 REQUIRED: agents — commit messages and push permission

Coding agents working in this repo must additionally obey:

| Law | Detail |
| --- | --- |
| **Commit message approval** | Before every `git commit`, the agent must draft the **full subject and body**, present them to the human, and wait for **explicit approval** of that title and body (or a human-edited version). Do not invent and land a message unilaterally. |
| **One approval = one message** | Approving a draft authorizes that message only. Amending or rewriting the subject/body needs a new approval. |
| **No default push** | Agents must **never** `git push` (or force-push / publish) unless the human **specifically and temporarily** authorizes a push for the current task (e.g. “push this”). That consent does not carry to later commits or sessions. |
| **Still after CI green** | Message approval and any authorized push still require green `pnpm run ci:local` (and the rest of §8.1 / §8.1.1). |

Human contributors follow §8.1 CI law; the table above is agent-operator law (see also `.docs/AGENTS.md`).

### 8.1.1 REQUIRED: full green CI before any production redeploy

**Never redeploy production** (Vercel Production promote, production domain cutover,
or shipping a new production Pipeliner image tag) until living CI is **fully green**
on the **exact commit SHA** you will ship.

| Law | Detail |
| --- | --- |
| **When** | Before **every** production redeploy — not only first ship of a gate |
| **SHA** | The deployed commit must match a tree that has passed the living bar **after the last edit** on that SHA |
| **Local** | Re-run the full §8.1 mirror on that tree until every command exits 0 |
| **GitHub** | Required application CI on that SHA / PR must be green (`ci.yml` lint-build; plus `test-mocks` or other required jobs when branch protection demands them) |
| **Partial smoke** | Focused Jest alone is **not** a redeploy bar — same as it is not a commit bar |
| **Pipeliner** | If production sandbox uses a sha-tagged image, rebuild/push that image from a commit that already satisfies this bar; do not tag production from a red tree |
| **Ban** | Redeploying “while CI is still running,” redeploying a SHA that only had smoke green, or redeploying local-unpushed work that never hit required CI |

Focused checks while iterating are fine. **Production redeploy requires full green.**

| Law | Detail |
| --- | --- |
| **When** | **Before every `git commit`** that may land on a shared branch, gate PR, or production path |
| **What** | Same living checks application CI expects — full `lint-build` mirror, not “only my test file” |
| **Bar** | ESLint, TypeScript (`tsc --noEmit`), Next build, and **package/Jest suites for every package you touched** must pass with green exit codes |
| **Deploy** | Only green commits are production-eligible; see **§8.1.1** — every production redeploy needs full green on the ship SHA; promotion to `main` also needs the version **promotion** workflow green |
| **Ban** | Committing known red typecheck/lint/build, or committing without re-running checks after the last edit |

**Required local mirror (enforced by `.githooks/pre-commit`):**

```bash
pnpm run hooks:install   # once per clone — sets core.hooksPath=.githooks
pnpm run ci:local        # full living mirror; must exit 0 before every commit
# Faster iteration only (not a commit bar):
pnpm run ci:local:lint-build
pnpm run ci:local:list   # print step ids without running
```

`pnpm run ci:local` mirrors casing-check, bitcode-canon-quality **Spec Basics**
(active + draft family/posture, promotion readiness, and every present
`scripts/check-v{N}-gate*.mjs` for the draft target), bitcode-gate-quality
(typecheck + package tests + staged harness), and `ci.yml` lint-build +
test-mocks. Opt-in surfaces (full DB E2E, CodeQL, Super Linter, Long-Runner
ECR, gate browser-proof) stay optional.

Pre-commit runs `node scripts/run-bitcode-local-ci.mjs --mode full` then
spec-sensitive basics. A red mirror blocks commit by default.

**Operator escape hatch** (not a substitute for green CI on shared/production
work; value must be exactly `1`):

```bash
# Skip only the living local CI validation suite (still runs spec basics)
BITCODE_SKIP_PRE_COMMIT_CI=1 git commit -m "..."

# Skip the entire pre-commit hook (CI + spec basics)
BITCODE_SKIP_PRE_COMMIT=1 git commit -m "..."
```

Manual lint-build fragment (subset of `ci:local`, not a substitute):

```bash
pnpm install --frozen-lockfile   # when lockfile changed
pnpm run build:eslint-plugin
pnpm -C apps/uapi run lint
pnpm -C apps/uapi exec tsc --noEmit   # required even if “only packages/*” changed
pnpm -C apps/uapi run build
```

**Why uapi `tsc` even for package-only edits:** Next/uapi typecheck pulls
workspace packages (e.g. `@bitcode/agent-generics`). CI failed red on
`llm-bound-factories.ts` when package TS errors were not caught before commit
because the full local mirror was not re-run on the final tree.

Gate / version work also needs the living **active + draft** quality surface
(`bitcode-gate-quality` / `bitcode-canon-quality` — not frozen prior-era
`check-vN-*` suites). See §8.4 CI surfaces and `.docs/AGENTS.md`.

| Allowed | Not allowed as commit bar |
| --- | --- |
| One-test smoke **while iterating** | Committing after only that smoke |
| Fixing red CI, then re-running full mirror | “Lint was green an hour ago” without re-run |
| Amending after full green | Pushing red and hoping GitHub fails for you |

### 8.2 Expectations by change type

| Change | Minimum bar |
| --- | --- |
| Pure package logic | Co-located unit tests; package typecheck if present |
| UAPI UI / route | Focused Jest; typecheck + lint for uapi |
| Gate closure | Spec/parity/QA updates as required by gate; package + specifying checks |
| Host / pipeline | Domain + pipeline-hosts tests; real inference opt-in only when intended |
| Canon promotion | Version promotion workflow + PROVEN generation (not a casual PR) |
| **Any commit** | **§8.1 full green** — living lint/typecheck/build (+ focused tests) before commit |

### 8.3 Useful commands

```bash
# UAPI
pnpm -C apps/uapi run typecheck
pnpm -C apps/uapi run lint
# Focused Jest — use `exec jest`; pass flags with no bare `--` separator
pnpm -C apps/uapi exec jest --runInBand --testPathPattern='deposit'
pnpm -C apps/uapi exec jest --testPathPattern='marketingLandingPage|navBrand'

# Core packages (examples)
pnpm --filter @bitcode/btd test
pnpm --filter @bitcode/agent-generics test
pnpm --filter @bitcode/asset-packs-pipelines-domain test
pnpm --filter @bitcode/pipeline-hosts test

# Specifying / proof machine
pnpm --filter @bitcode/specifying test
pnpm --filter @bitcode/specifying typecheck

# Living required gates: ACTIVE + DRAFT only (today V47 + V48).
# Do not re-run or re-edit scripts/check-v28-* … prior-era suites for current green.
# Law: .specifications/BITCODE_SPECIFYING.md §4.3 / §13.1
node scripts/check-bitcode-canonical-inputs.mjs --current-target V47
node scripts/check-bitcode-spec-family.mjs --version V47 --mode promoted --current-target V47
node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V47 --draft-target V48
node scripts/check-bitcode-spec-family.mjs --version V48 --mode draft --current-target V47

# Spec quality helper (active + draft only)
node scripts/run-bitcode-spec-quality.mjs --mode basic
```

**uapi Jest CLI pitfall (do not repeat):** never run

```bash
# BAD — bare `--` after `test` mangles flags into the path pattern
pnpm -C apps/uapi test -- --testPathPattern='marketingLandingPage' --passWithNoTests=false
```

Jest then prints something like `Pattern: --testPathPattern=…|…` / **No tests found**
and exits 1 even though the suite exists. That is a **false red**, not a missing
test. Prefer:

```bash
# GOOD
pnpm -C apps/uapi exec jest --testPathPattern='marketingLandingPage'
# or, without a bare `--`:
pnpm -C apps/uapi test --testPathPattern='marketingLandingPage'
```

Agents: same rule is mirrored in `.docs/AGENTS.md` (living CI block).

```bash
# UI SSOT + casing
pnpm run verify:ui
bash scripts/find-uppercase-raw-promptparts.sh
bash scripts/check-import-casing.sh
```

### 8.4 CI surfaces

| Workflow | Role |
| --- | --- |
| `ci.yml` | Application CI on every push/PR — **lint, typecheck, build**, mock Jest (E2E/DB heavier jobs may be gated) |
| `bitcode-gate-quality.yml` | Gate PRs into `version/**` — **active + draft** canon posture/family, living packages, uapi, specifying (not prior-era `check-vN-*` matrices) |
| `bitcode-canon-quality.yml` | Repository-wide living greenability during draft work (active + draft) |
| `vN-canon-promotion.yml` | Version → `main` **promotion** workflow (pointer + promotion-grade validations) |

**Before every commit:** run the application living checks in §8.1 on the
**final tree** until every command exits green. Do **not** treat “CI will catch
it,” “I’ll fix in the next commit,” or “only a package file changed so tsc is
optional” as substitutes. Production deployment assumes every landed commit was
commit-bar green.

**Before every production redeploy:** re-confirm full green on the **ship SHA**
(§8.1.1). A green commit from yesterday is not enough if later commits on the
deployed branch are untested or red.

**Historical freeze:** after promotion, version-bound checkers and era proofs are
immutable. New drafts may break them; leave them untouched and unrequired.
Living full-system checks for the current active + draft pair must be
exhaustive for present sole-canon. See `.specifications/BITCODE_SPECIFYING.md`
§4.3 and §13.1, and `.docs/AGENTS.md`.

Heavy suites (full browser E2E, Storybook, super-linter, advanced CodeQL) are
**opt-in** via repository variables until maintained for required protection.

### 8.5 Source-safety

Never product-expose:

- protected / raw source  
- unpaid AssetPack source  
- raw prompts / raw provider responses  
- credentials, wallet private material, private settlement payloads  

Stream telemetry through `sourceSafeStreamEvent`. Prefer **Unestimatable** over
invented demand numbers.

### 8.6 Documentation when structure moves

If you change package families, inheritance, experience entry paths, product
routes, or other structure FAMILIARIZATION teaches, update
`.docs/FAMILIARIZATION.md` in the **same** change set (SPECIFYING §16.3.1).

---

## 9. Key architectures (cheat sheet)

| Pattern | Where to learn |
| --- | --- |
| Spec → parity → source → tests | SPECIFYING + PARITY_MATRIX |
| `*-generics` → `generic-*` → product | FAMILIARIZATION §3 |
| Agent = Executor + PTRR (Failsafe + Thinkings) | FAMILIARIZATION §3.1 |
| AssetPack absolute catalog + SDIVF | SPEC V48 measurement + G3; ASSET_PACKS orient |
| Host Local vs Sandbox | VERCEL.md §2; pipeline-hosts package |
| Pipeliner appliance | `containers/images/pipeliner/README.md` |
| Seven experiences + Bitcode/Shadcn bases | SOURCE_LAYOUT + FAMILIARIZATION §7 |
| BTD journal vs Pipeline runs | TERMINOLOGY.md |
| Public claim boundaries | V46+ public/operator claim docs; never treat marketing as law |

---

## 10. Suggested first week

1. Read SPEC pointer + V48 STATUS / product routes (or current draft family).
2. Skim FAMILIARIZATION §1–§4 and SOURCE_LAYOUT §1.
3. `pnpm install`, mock-mode `dev:remote`, click `/deposits` `/reads` `/packs`.
4. Run uapi typecheck + a focused Jest path; run BTD tests.
5. Pick a **small** gate-scoped issue on `version/v48`; open a gate branch.
6. Land one `(impl-only)` PR with tests; read gate-quality output.
7. Optionally: enable real inference + GitHub App on a tiny repo smoke per
   `.qa/BITCODE_V48_QA.md`.

---

## 11. Getting help

| Question | Look first |
| --- | --- |
| What is product law? | `.specifications/BITCODE_SPEC_V*.md` for the gate |
| Where does package X live? | FAMILIARIZATION §5 |
| How do components nest? | SOURCE_LAYOUT + `apps/uapi/components/README.md` |
| Supabase / auth | SUPABASE.md, AUTH packages |
| Deploy / sandbox | VERCEL.md, DEPLOYMENT.md |
| Security / secrets / source-safety | [`.docs/SECURITY.md`](.docs/SECURITY.md), CONTRIBUTING §8.5 |
| Interactive QA steps | `.qa/BITCODE_V48_QA.md` (or current version ledger) |
| Proof machine APIs | `scripts/specifying/README.md` |

When blocked on secrets or external install rights, stop and ask — do not fake
live GitHub tokens, mainnet value, or service-role keys into client bundles.

---

## 12. License / contribution boundary

This monorepo is the commercial Bitcode product source. Contributions must follow
gate/version workflow, source-safety, and specification-driven development as
described above. Prefer small, reviewable, proven changes over speculative rewrites.
