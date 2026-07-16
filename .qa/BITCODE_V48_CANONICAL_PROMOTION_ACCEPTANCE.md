# Bitcode V48 — Canonical Promotion Closure Acceptance Criteria

## Status

- **Version:** V48
- **Document role:** Acceptance ledger for **canonical promotion closure**
  (version-branch readiness toward `main` promotion). Complements
  [`.qa/BITCODE_V48_QA.md`](BITCODE_V48_QA.md) (gate-level experiential QA) and
  does **not** replace rebuild-alone law in `.specifications/BITCODE_SPEC_V48.md`.
- **Posture:** draft acceptance criteria; sections open until closed with
  evidence under this file or linked run artifacts.
- **Source-safety:** no secrets, protected source bodies, wallet material,
  service-role keys, or raw private customer payloads. LLM wire dumps may
  quote system/user prompts that contain only keys-only execution trees and
  public test fixtures (e.g. `sindresorhus/is-plain-obj`).

### Closure rules (document-wide)

1. Every acceptance section ends **Open** | **Partial** | **Closed**.
2. **Closed** requires: criterion text, proof command or artifact path, date,
   and reviewer (human or named agent session).
3. Live LLM call-by-call work uses a **movable abort marker**
   (`BITCODE_DEBUG_STOP_*`); the marker must not advance until the current
   call is accepted in §1.

---

## Sections (index)

| § | Topic | Status |
| --- | --- | --- |
| 1 | Every-call / every-pipeline LLM debug | **Partial** (entry 1.1 filled) |
| 2 | SDIVF deposit pipeline production-like accept | Open |
| 3 | SDIVF read pipeline production-like accept | Open |
| 4 | Settle Simple pipeline production-like accept | Open |
| 5 | Discovery law (wave-1 parallel → product search keys) | Open |
| 6 | PTRR base law (Plan → Try → Retry → Refine) | Open |
| 7 | Host selection (API/dispatch) vs SDIVF Setup phase | Open |
| 8 | Measurement hierarchy (Absolutes / Needinesses) | Open |
| 9 | Source-safety / obfuscations / catalog binding | Open |
| 10 | BTD / BTC-testnet settlement & ledger readback | Open |
| 11 | uapi routes (Packs / Deposits / Reads / Docs) green | Open |
| 12 | Spec family / promotion workflow green | Open |
| 13 | Residual risks & explicit non-goals | Open |

*(Sections 2–13 are placeholders for subsequent fills.)*

---

## §1 Every-call / every-pipeline LLM debug

### 1.0 Purpose and method

**Criterion:** Before V48 promotion, each LLM call that can fire on each
product pipeline (deposit SDIVF, read SDIVF, settle Simple) is inspected
call-by-call: wire prompt, completion, step/failsafe/thinking schemas, tools,
and stability — starting at Setup and advancing only after the current stop
is accepted.

**Harness (read first-LLM, current):**

```bash
pnpm run debug:read:first-llm
# packages/pipeline-hosts/src/dev/run-local-read-pipeline-debug.ts
```

| Env | Default / this pass |
| --- | --- |
| `BITCODE_LLM_CALL_DEBUG` | `1` |
| `BITCODE_DEBUG_FORCE_CLONE_PTRR` | `1` (force real clone PTRR agent) |
| `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON` | `1` |
| `BITCODE_DEBUG_STOP_PHASE` | `setup` |
| `BITCODE_DEBUG_STOP_STEP` | `plan` |
| `BITCODE_DEBUG_STOP_FAILSAFE` | `prepare_concise_context` |
| `BITCODE_DEBUG_STOP_GENERATION` | `reason` |
| `BITCODE_DEBUG_STOP_AGENT_FILTER` | `clone-vcs` |
| `BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` | anthropic / `claude-haiku-4-5` |

**Artifact root:** `.tmp/llm-call-debug/<runId>/`  
**Work root:** `.tmp/local-read-debug/`  
**Ledger:** `ledger.jsonl` + `000N-request|response|abort-*.json` +
`VERBATIM_WIRE_REPORT.md`

### 1.0.1 Entry template (use for every call)

Every stop uses the same fields:

```text
### 1.N <short title>

- **status:** Open | Partial | Accepted (ready to move marker) | Blocked
- **date:** YYYY-MM-DD
- **pipeline:**
- **pipeline_mode:** deposit | read | settle | other
- **phase:**
- **agent:**
- **agent_registry_key:**
- **step:** plan | try | retry | refine
- **failsafe:** prepare_concise_context | chunk_then_sum | stitch_until_complete | (none)
- **thinking:** reason | judge | structured_output
- **execution_path:**
- **provider / model:**
- **usage:** inputTokens / outputTokens / totalTokens
- **duration_ms:**
- **abort_marker:** (env + matched reason)
- **expected_schemas:**
  - **step_return:**
  - **failsafe_terminal:**
  - **thinking_return:**
- **tools:**
  - **usable:**
  - **selected (useTools):**
  - **executed:**
- **prompts_and_parts_considered:**
  - **phase:**
  - **agent:**
  - **step:**
  - **failsafe:**
  - **thinking:**
  - **user_prefix / body construction:**
- **final_compose_system:** (verbatim or path)
- **final_compose_user:** (verbatim or path)
- **contextful_inputs:** (what was interpolated / selection tree / prior usedTools)
- **completion_response:** (verbatim)
- **stability_analysis:**
  - **schema_parse:**
  - **role_correctness:**
  - **task_quality:**
  - **prompt_hygiene:**
  - **regression_vs_prior:**
- **decision:** keep marker | move marker to …
- **artifacts:**
```

---

### 1.1 Read · Setup · clone-vcs · Plan · PCC · reason

- **status:** **Accepted (ready to move marker to judge)** — first reason
  call is stable enough; marker intentionally held until human advances.
- **date:** 2026-07-16
- **pipeline:** SynthesizeReadAssetPacksSDIVF / `asset_pack` host mode
- **pipeline_mode:** read
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **agent_registry_key:** `setup:clone-vcs-repository`
- **step:** plan
- **failsafe:** prepare_concise_context
- **thinking:** reason
- **execution_path:**
  `pipeline:asset_pack → seq-1 → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-0 → failsafe:prepare_concise_context → selection → seq-0 → thinkings:reason`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 3227 / 572 / 3799 tokens
- **duration_ms:** ~7840 (reason call + abort)
- **abort_marker:**
  `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=1` + phase=setup + step=plan +
  failsafe=prepare_concise_context + generation=reason + agent filter `clone-vcs`  
  → `hard-stop after plan/prepare_concise_context/reason agent=asset-pack-clone-vcs-repository-agent`  
  throw: `__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__`

#### expected_schemas

| Layer | Schema | Notes |
| --- | --- | --- |
| **step_return** | `PlanStepOutputSchema` `{ approach, steps[], considerations? }` | End of Plan only (after PCC → chunk → stitch). **Not** this call. |
| **failsafe_terminal** | `PCC_KEY_SELECTION_SCHEMA` `{ selectedKeys: string[] }` | End of selection Thinkings **structured_output**, then value read-in. **Not** this call. |
| **thinking_return** | `ReasoningSchema` `{ analysis, steps[], conclusion, confidence, useTools? }` | **This call.** Under PCC: omit `useTools`; do not emit `selectedKeys`. |

#### tools

| | |
| --- | --- |
| **usable** | Agent declares `asset-pack-clone-vcs-repository-tool`; Plan does **not** execute tools. Usable list may appear under plan node keys tree. |
| **selected (useTools)** | **none** (correct for Plan PCC reason) |
| **executed** | **none** |

#### prompts_and_parts_considered

| Layer | Sources (post V48 generations rename) |
| --- | --- |
| **phase** | Overlay only: `phase: setup` on clone agent Prompt registry. No separate phase carrier. |
| **agent** | VCS base: identity / role / instructions (`SYSTEM_PROMPT_VCS` — no embedded gen/failsafe). AssetPack overlay: identity, purpose, constraints, pipeline=`asset-pack`, phase=`setup` (`DP_CLONE_VCS_SYSTEM_PROMPT`). |
| **step** | Plan purpose only: `PLAN: Repository clone strategy` + details (plan Try / tool plan / Retry fallbacks). `step:purpose` preferred; gen/failsafe **not** re-embedded on step carrier. |
| **failsafe** | `PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT` (v0.70): CONTEXT FILTER, ranking (repo / sourceRevision / **manifestRoot** / input → auth → tools), omit lineage/debug, path form `#ns:key`, role split Reason/Judge/SO. Attached on failsafe parent for hierarchical system. |
| **thinking** | `PROMPTPART_GENERIC_AGENT_GENERATION_REASON` (v0.60): this generation only; no tools on PCC/Plan reason; no `selectedKeys`. Leaf injection via `factoryLLMGeneration` + path `…:generation:reason`. |
| **user_prefix / body** | JSON-only + ReasoningSchema shape prefix; then **PCC-specialized** body when input has `pipeline_execution_keys` + `preparation` (`factoryReason` in `generations/llm-bound-factories.ts`). |
| **compose filter** | `buildHierarchicalPrompt` role filter: drops sibling judge/SO and non-active failsafe parts from ancestors. |

#### final_compose_system

Verbatim (this pass, 4151 chars):

```text
Do not perform destructive operations; remain provider-agnostic; ensure idempotent retries; record repository coordinates for later phases

You are the AssetPack pipeline repository preparation agent

Clone provider repositories reliably, set a workspace path, and persist minimal metadata required for SDIVF Discovery

You are a VCS Operations Agent specialized in repository management using provider REST APIs, automated workflow execution via API webhooks and triggers, branch strategy implementation through API endpoints, conflict resolution via provider APIs, and CI/CD pipeline integration through webhook protocols and API integrations

Execute VCS workflows: validate repository state via API status endpoints, perform atomic commits through API operations with message standardization, handle merge conflicts using provider merge resolution APIs, automate branch cleanup via API management endpoints, and generate detailed operation logs with success/failure metrics and rollback capabilities through provider APIs

setup

asset-pack

Execute version control operations via provider REST APIs, manage branch workflows (VCSFlow/GitHub Flow/GitLab Flow), perform merge conflict resolution using API-based three-way merge algorithms, automate commit message validation through API endpoints, and integrate with remote repositories through authenticated API protocols

---

PLAN: Repository clone strategy
Plan the Try only (do not execute tools): decide provider, owner/name, branch/ref, and how Try will call asset-pack-clone-vcs-repository-tool; note fallback refs and shallow-clone options for Retry if Try fails

---

You are the PrepareConciseContext failsafe: a CONTEXT FILTER, not the task agent.
Input: `preparation` (what the agent step is trying to do), `system` (this failsafe law), and `pipeline_execution_keys` (FULL root execution state as KEYS ONLY — values are never shown).
In the keys tree: an ARRAY lists key names inside a namespace; a nested OBJECT is a child execution node.

Objective: select the MINIMAL sufficient set of keys whose VALUES subsequent failsafes (ChunkThenSum / Stitch) and the step need — nothing more.

Ranking (prefer earlier):
1) Task coordinates: repository owner/name/ref/provider, host sourceRevision, host workspace/manifestRoot, pipeline/read/deposit request input that parameterizes this step.
2) Auth or run binding only if the preparation clearly needs it (e.g. host/pipeline userId for provider clone).
3) Step-local usable tools listing only if planning tool use.
Omit by default: lineage, telemetry, debug flags, unrelated phase/agent state, pure bookkeeping.

Path form (required for structured_output later): '<execution-path>#<namespace>:<key>' where <execution-path> is '/'-joined node names from the tree (empty path → leading '#'). Example: '#host:manifestRoot', '#read:repository', '#host:sourceRevision'. Shorthand 'namespace#key' is accepted at runtime but prefer the law form. Never invent keys absent from pipeline_execution_keys.

Thinkings roles under this failsafe:
- Reason: analyze which keys matter and why (no selectedKeys field, no useTools, do not clone/execute the task).
- Judge: score that analysis for minimality and coverage (e.g. missing host#manifestRoot when planning a workspace clone).
- StructuredOutput: emit exactly { "selectedKeys": string[] } — the only place selectedKeys is legal.

Never attempt the agent task itself. Never dump the whole tree. Prefer 3–8 high-signal keys over broad selection.

---

Apply systematic logical reasoning for THIS generation only (Reason — not Judge, not StructuredOutput). Analyze the problem, list clear steps, conclude with the optimal approach, and set confidence in [0,1]. Tools: include useTools only when this step is expected to execute tools (Try/Retry task generations). Omit useTools entirely for PrepareConciseContext key-selection and other no-tool steps (Plan reason, Refine reason). Do not emit fields that belong to a later generation (e.g. do not emit selectedKeys — that is StructuredOutput under PCC; do not emit judgment fields). Stay inside the active failsafe objective stated in the system prompt.
```

#### final_compose_user

Structure (full 8605-char body in artifact files):

1. JSON-only header + ReasoningSchema shape  
2. PCC reason directives (minimal keys; prefer host/repo; no selectedKeys; no tools)  
3. `Selection input:` JSON:

```json
{
  "preparation": "<hierarchical agent+step+PCC law for the Plan clone task>",
  "system": "<PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT>",
  "pipeline_execution_keys": {
    "execution": ["lineage"],
    "pipeline": ["lineage", "family", "posture", "admittedSurface", "userId", "synthesizeMode", "productPipeline", "input"],
    "host": ["manifestRoot", "sourceRevision", "runId", "userId"],
    "read": ["request", "repository", "need"],
    "deposit": ["reference", "repository"],
    "read/need": ["accepted", "needId", "measurementRoot", "reviewState"],
    "config": ["debug"],
    "route/preprocessed": ["assetPackWrittenAsset"],
    "seq-0": { "…" },
    "seq-1": { "seq-0": { "agent:asset-pack-clone-vcs-repository-agent": { "plan": { "tools": ["usable"], "…" } } } }
  }
}
```

Full verbatim:  
`.tmp/llm-call-debug/pipeline-asset_pack/0001-request-setup-asset-pack-clone-vcs-repository-agent-plan-prepare_concise_context-reason.json`  
`.tmp/local-read-debug/VERBATIM_WIRE_REPORT.md`

#### contextful_inputs

| Input | Content |
| --- | --- |
| **preparation** | Clone agent identity/purpose/constraints + VCS ops + Plan purpose (plan tool use, no execute) + PCC law (also on system hierarchy) |
| **system** | PCC failsafe law (ranking, path form, roles) |
| **pipeline_execution_keys** | Full root keys-only tree at Setup clone Plan time (values **not** shown) |
| **prior usedTools** | none (first call) |
| **fixture** | Public repo `sindresorhus/is-plain-obj` @ `97f38e8836f8…`; `BITCODE_DEBUG_FORCE_CLONE_PTRR=1` |

#### completion_response

Verbatim (this pass):

```json
{
  "analysis": "The preparation task is repository cloning for AssetPack pipeline discovery. It requires: (1) repository coordinates (owner/name/ref/provider) to decide clone strategy and call the VCS tool; (2) workspace path to set clone destination; (3) source revision for branch/ref fallback planning; (4) authentication binding if provider clone requires userId. The task explicitly plans Try/Retry with fallback refs and shallow-clone options, so it needs structured repository metadata and host workspace context. Lineage, telemetry, debug, and unrelated phase state are omitted per the ranking rule.",
  "steps": [
    "Identify rank-1 task coordinates: #read:repository (owner/name/ref/provider for clone decision), #host:sourceRevision (branch/ref fallback planning), #host:manifestRoot (workspace destination for clone)",
    "Identify rank-1 pipeline input: #pipeline:input (request that parameterizes this step, e.g. which repo to clone)",
    "Identify rank-2 auth binding: #pipeline:userId or #host:userId (if provider clone requires authentication; VCS Operations Agent mentions authenticated API protocols)",
    "Identify rank-3 tools listing: #agent:asset-pack-clone-vcs-repository-agent→plan→tools:usable (tools available for Try/Retry planning)",
    "Rank minimality: 5–6 keys are sufficient (repository coords, workspace, revision, input, userId, tools). Omit lineage, family, posture, debug, unrelated phases, and phase-state bookkeeping.",
    "Verify coverage: repository owner/name/ref/provider, workspace path, source revision, pipeline input request, auth userId, and available tools all present and necessary for subsequent Plan/Try failsafes."
  ],
  "conclusion": "Select minimal 6 keys covering repository coordinates (#read:repository), workspace (#host:manifestRoot), source revision (#host:sourceRevision), pipeline input parameterization (#pipeline:input), auth binding (#pipeline:userId), and tools listing (#agent:asset-pack-clone-vcs-repository-agent→plan→tools:usable). These are necessary and sufficient for Plan to decide provider/owner/name/branch/ref and for Try to execute the clone tool with fallback strategy and idempotent retry logic. Omit all lineage, telemetry, debug, posture, and unrelated phase state.",
  "confidence": 0.92
}
```

#### stability_analysis

| Axis | Assessment |
| --- | --- |
| **schema_parse** | **Pass.** Fits `ReasoningSchema` (analysis / steps / conclusion / confidence). No illegal `selectedKeys`. No `useTools`. Markdown fence stripped by `parseResponse`. |
| **role_correctness** | **Pass.** Reasons about key selection only; does not clone; does not invent SO output. |
| **task_quality** | **Pass (strong).** Prefers `#host:manifestRoot`, `#read:repository`, `#host:sourceRevision`, `#pipeline:input`; omits lineage/debug. Optional tools usable path is narrative (not law-form); still grounded. |
| **prompt_hygiene** | **Pass vs pre-fix.** System ~4.1k (was ~6.7k); no Judge/SO soup on reason system stack; PCC ranking on hierarchical system. Residual: VCS boilerplate still long; tools path form non-canonical. |
| **regression_vs_prior** | **Improved.** Pre-prompt-fix: lineage-heavy keys, often `selectedKeys` on reason, missing `manifestRoot`. Post-fix (2026-07-16 re-run after commits `a29efa05` / `fc58d5ac` / `e1ffcce9`): stable high-signal set @ confidence 0.92. |
| **implementation_stack** | Factories live at `packages/agent-generics/src/generations/llm-bound-factories.ts` (substeps retired). PTRR order Plan→Try→Retry→Refine. |

#### decision

| | |
| --- | --- |
| **decision** | **Accepted for progression.** Keep marker until human advances. |
| **next marker** | Same phase/step/failsafe/agent; set `BITCODE_DEBUG_STOP_GENERATION=judge` (inspect reason+judge pair). |
| **not yet** | structured_output `{ selectedKeys }`; Plan chunk/stitch; Try/Retry/Refine; other Setup agents; deposit/settle pipelines. |

#### artifacts

| Kind | Path |
| --- | --- |
| Request | `.tmp/llm-call-debug/pipeline-asset_pack/0001-request-setup-asset-pack-clone-vcs-repository-agent-plan-prepare_concise_context-reason.json` |
| Response | `.tmp/llm-call-debug/pipeline-asset_pack/0002-response-setup-asset-pack-clone-vcs-repository-agent-plan-prepare_concise_context-reason.json` |
| Abort | `.tmp/llm-call-debug/pipeline-asset_pack/0003-abort-setup-asset-pack-clone-vcs-repository-agent-plan-prepare_concise_context-reason.json` |
| Ledger | `.tmp/llm-call-debug/pipeline-asset_pack/ledger.jsonl` |
| Verbatim report | `.tmp/local-read-debug/VERBATIM_WIRE_REPORT.md` |
| Summary | `.tmp/local-read-debug/debug-summary.json` |
| Re-run | `pnpm run debug:read:first-llm` |

---

### 1.2 … (next entries)

_Template ready. Next expected fill:_

- **1.2** Read · Setup · clone-vcs · Plan · PCC · **judge**  
- **1.3** Read · Setup · clone-vcs · Plan · PCC · **structured_output**  
- **1.4+** Plan chunk / stitch · Try · Retry · Refine · remaining Setup · Discovery · … · deposit · settle  

---

## §2–§13 (placeholders)

### §2 SDIVF deposit pipeline production-like accept

- **status:** Open  
- **criterion:** (TBD) full Setup→…→Finish deposit run under LocalHost / production-like accept script with real inference profile.  
- **proof:** (TBD)

### §3 SDIVF read pipeline production-like accept

- **status:** Open (partial offline via §1 first-LLM only)  
- **criterion:** (TBD) full read SDIVF beyond Setup first reason.  
- **proof:** (TBD)

### §4 Settle Simple pipeline production-like accept

- **status:** Open

### §5 Discovery law (wave-1 parallel → product search keys)

- **status:** Open  
- **note:** Implementation commits landed wave-1 then search keys; acceptance still needs live proof rows.

### §6 PTRR base law (Plan → Try → Retry → Refine)

- **status:** Open (impl present: `factoryPTRRAgent` order + Plan/Refine no tools; needs cross-pipeline live proof)

### §7 Host selection (API/dispatch) vs SDIVF Setup phase

- **status:** Open (clarified 2026-07-16 — naming only; see below)
- **Do not conflate:**
  | Term | Layer | Who / when |
  | --- | --- | --- |
  | **Host** (`local` / `sandbox`) | Dispatch / API route **before** the pipeline process runs | `selectDepositHostKind()` (and read equivalent); serverless → always sandbox + Pipeliner image |
  | **Pipeliner** | Appliance image / runtime environment | Sandbox (or Docker parity) provides monorepo + runners; customer tree not on image create |
  | **Setup** | **SDIVF phase 1** inside the already-running pipeline | Clone-vcs agent ensures **this-run working tree** on that Host (adopt / in-box clone / tool) |
- **Law (SPEC G3-4 + Pipeliner README):** Host is selected and provisioned at dispatch; pipeline agents assume Host capabilities are present. Setup does **not** choose LocalHost vs sandbox — it only uses Host-supplied clone/adopt paths and tools.
- **Debug note:** `BITCODE_DEBUG_FORCE_CLONE_PTRR` is a **dev-only** bypass of Host short-circuits so the Setup **clone agent** exercises full PTRR + clone tool. It is not Host selection.

### §8 Measurement hierarchy (Absolutes / Needinesses)

- **status:** Open

### §9 Source-safety / obfuscations / catalog binding

- **status:** Open

### §10 BTD / BTC-testnet settlement & ledger readback

- **status:** Open

### §11 uapi routes (Packs / Deposits / Reads / Docs) green

- **status:** Open

### §12 Spec family / promotion workflow green

- **status:** Open

### §13 Residual risks & explicit non-goals

- **status:** Open  
- **known residual from §1.1:** tools key path form; VCS system prompt length; deposit/settle not yet in call-by-call ledger.

---

## Change log

| Date | Change |
| --- | --- |
| 2026-07-16 | Document created. §1 method + entry **1.1** (read clone Plan PCC reason) filled from live `pnpm run debug:read:first-llm` after commits retiring substeps, PTRR order, and PCC prompt work. |
| 2026-07-16 | §7 retitled: Host selection (API/dispatch) **vs** SDIVF Setup phase — naming clarification only; no host-selection bug found in read synthesize path from this audit. |
