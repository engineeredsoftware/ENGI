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
| 1 | Every-call / every-pipeline LLM debug | **Partial** (Discovery codebase **agent closed** 1.D14–1.D-Agent; next inherent-regurgitation) |
| 2 | SDIVF deposit pipeline production-like accept | **Partial** (Setup closed; first Discovery agent closed) |
| 3 | SDIVF read pipeline production-like accept | Open (partial offline via §1.1) |
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

**Harnesses (movable marker — advance only after current §1 entry is Accepted):**

```bash
# Deposit (active progression 2026-07-16+)
pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm
# packages/pipeline-hosts/src/dev/run-local-deposit-pipeline-debug.ts

# Read (entry 1.1 landed; marker not yet advanced on this harness)
pnpm --filter @bitcode/pipeline-hosts run qa:read:debug-first-llm
# packages/pipeline-hosts/src/dev/run-local-read-pipeline-debug.ts
```

| Env | Deposit harness (current) | Notes |
| --- | --- | --- |
| `BITCODE_LLM_CALL_DEBUG` | `1` | Wire ledger on |
| `BITCODE_DEBUG_FORCE_CLONE_PTRR` | `1` | Force real clone PTRR agent |
| `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON` | `1` | Hard-stop **flag** name (historical); generation pin is separate |
| `BITCODE_DEBUG_STOP_PHASE` | **`discovery`** | Setup closed |
| `BITCODE_DEBUG_STOP_STEP` | **`plan`** | next agent Plan PCC reason |
| `BITCODE_DEBUG_STOP_FAILSAFE` | **`prepare_concise_context`** | PCC |
| `BITCODE_DEBUG_STOP_GENERATION` | **`reason`** | first Thinkings |
| `BITCODE_DEBUG_FORCE_CLONE_PTRR` | **`0`** | clone PTRR closed at 1.D9; host-adopt |
| `BITCODE_DEBUG_SETUP_SERIAL` | **`1`** | serial Setup wave-1 |
| `BITCODE_DEBUG_FAST_SETUP` | **`1`** | Discovery QA: skip re-PTRR obfuscations/LSP |
| `BITCODE_DEBUG_DISCOVERY_SERIAL` | **`1`** | serial Discovery wave-1 (no parallel race) |
| `BITCODE_DEBUG_STOP_AGENT_FILTER` | **`DepositInherentRegurgitation`** | second wave-1 agent |
| `BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS` | `900000` | full Plan+Try+Retry+Refine budget |
| `BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL` | anthropic / `claude-haiku-4-5` | |

**Artifact root:** `.tmp/llm-call-debug/<runId>/`  
**Deposit work root:** `.tmp/local-deposit-debug/`  
**Read work root:** `.tmp/local-read-debug/`  
**Ledger:** `ledger.jsonl` + `000N-request|response|abort-*.json` +
`VERBATIM_WIRE_REPORT.md`

**Living rules:**

1. Every marker move and every validated stop is recorded in this file in the
   **same change set** (do not advance the harness without a §1 row).
2. Each Accepted call-site must include **stability confidence**, **actual
   results** (usage, paths, schemas, verbatim or summarized completion), and a
   **detailed prompt + completion excellence breakdown** (not only a one-line
   table). Replies that argue “fully successful” must match what is written
   here.
3. **Commit message law for call-site QA commits** — subject or body **must**
   include the visible tag (so `git log --oneline` / short views show it).
   **No braces.** **Title Case** each token (acronyms like Pcc may stay short
   Title Case).

   Full form:

   ```text
   QA Pipeline Deposit|Read|Settle Phase Setup Agent Clone-Vcs Step Plan
   Failsafe Prepare-Concise-Context Thinking Judge Call-Site
   ```

   Short subject (preferred for oneline visibility):

   ```text
   V48 (spec-impl): QA Deposit Setup Clone-Vcs Plan Pcc Judge
   ```

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
- **prompt_excellence_breakdown:** (why system+user compose is correct / excellent)
- **completion_excellence_breakdown:** (why model output is correct / excellent)
- **stability_confidence:** (overall confidence 0..1 + what still residual)
- **stability_analysis:**
  - **schema_parse:**
  - **role_correctness:**
  - **task_quality:**
  - **prompt_hygiene:**
  - **regression_vs_prior:**
- **decision:** keep marker | move marker to …
- **artifacts:**
- **commit_tag:** QA Pipeline … Phase … Agent … Step … Failsafe … Thinking … Call-Site
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
| **thinking_return** | `ReasoningSchema` `{ analysis, reasoningItems[], conclusion, confidence, useTools? }` | **This call.** Field is `reasoningItems` (not `steps` — reserved for PTRR Step). Under PCC: omit `useTools`; do not emit `selectedKeys`. |

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

### 1.D1 Deposit · Setup · clone-vcs · Plan · PCC · reason

- **status:** **Accepted** (marker advanced to judge — see 1.D2)
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Prepare-Concise-Context Thinking Reason Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks` / host mode `asset_pack_pipeline`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **agent_registry_key:** `setup:clone-vcs-repository`
- **step:** plan
- **failsafe:** prepare_concise_context
- **thinking:** reason
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-0 → failsafe:prepare_concise_context → selection → seq-0 → thinkings:reason`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage (judge-stop re-run, reason leg):** 4502 in / 564 out / 5066 total tokens
- **abort_marker (when this was the stop):**
  `BITCODE_DEBUG_STOP_GENERATION=reason` + clone-vcs filter  
  → `hard-stop after plan/prepare_concise_context/reason`  
  throw: `__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__`

#### expected_schemas (reason)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return** | `ReasoningSchema` `{ analysis, reasoningItems[], conclusion, confidence, useTools? }` | **This call.** Field is **`reasoningItems`** (never `steps` — PTRR Step reserved). No `useTools`; no `selectedKeys`. |
| **failsafe_terminal** | `PCC_KEY_SELECTION_SCHEMA` | Not this call (structured_output). |
| **step_return** | `PlanStepOutputSchema` | End of full Plan only. |

#### tools

| | |
| --- | --- |
| **usable** | `asset-pack-clone-vcs-repository-tool` on plan node keys (`tools:usable`) |
| **selected (useTools)** | **none** (correct for Plan PCC reason) |
| **executed** | **none** |

#### actual results (reason completion)

Latest reason completion (judge-stop re-run) used valid `reasoningItems` and named keys grounded in the keys tree, e.g.:

- `deposit#repository`, `deposit#obfuscations`, `host#manifestRoot`, `host#sourceRevision`
- `pipeline#userId`, `deposit#permissibleSources` / `deposit#impermissibleSources`, `deposit#reference`
- `confidence`: ~0.92
- No clone attempt; no `selectedKeys`; no `useTools`

#### prompt_excellence_breakdown (reason)

| Layer on wire | Proven correct because |
| --- | --- |
| **Execution** | Appears **once** in pipeline composed block; not re-emitted on phase/agent/failsafe. |
| **Pipeline primitive** | Generic “You are in a Pipeline…” contract present. |
| **SDIVF base** | Setup→[DIV]*→Finish + Host law; product-agnostic base. |
| **Deposit product** | `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks` + Obfuscations steering + explicit “not the read pipeline” — dual-lens removed. |
| **Phase Setup** | Generic SDIVF Setup objective (no “Need or Obfuscations” dual) + deposit Setup specific roster. |
| **Agent / Plan** | Clone agent identity; Plan-only (“Plan the Try only; do not execute tools”). |
| **PCC failsafe** | CONTEXT FILTER; keys-only tree; ranking law; Thinkings roles stated. |
| **Reason generation** | Systematic reasoning + **`reasoningItems`** field instruction; ban SO-only fields. |

User body correctly forces: JSON schema for Reason; PCC key-selection only; path-form key names; omit tools/selectedKeys.

#### completion_excellence_breakdown (reason)

| Axis | Assessment |
| --- | --- |
| **Schema** | Valid Reasoning JSON with `reasoningItems[]` (not legacy `steps`). |
| **Role** | Stays in key-selection; does not clone; does not emit `selectedKeys`. |
| **Grounding** | Keys exist on `pipeline_execution_keys` (deposit/host/pipeline namespaces). |
| **PCC ranking** | Prioritizes repository + host workspace + source-safety over lineage/debug. |
| **Quality residual** | Later Judge correctly flagged count/consistency and soft auth justification — reason is strong but not perfect; that residual is **expected** and is scored at 1.D2. |

#### stability_analysis (reason)

| Axis | Result |
| --- | --- |
| **schema_parse** | Pass — ReasoningSchema. |
| **role_correctness** | Pass — PCC reason only. |
| **task_quality** | Pass — high-signal keys; residual polish deferred to Judge. |
| **prompt_hygiene** | Pass — hierarchy + deposit identity + `reasoningItems` vocabulary. |
| **regression_vs_prior** | Pass — dual-lens Setup prose gone; Step/field name collision fixed. |

#### stability_confidence

- **0.92** for accepting this call-site and advancing the marker.  
- Residual risk is **not** hierarchy/prompt attach (locked); residual is key-selection polish, validated next at Judge.

#### decision

- **Accepted** — advance marker to **judge** (same phase/step/failsafe/agent).

---

### 1.D2 Deposit · Setup · clone-vcs · Plan · PCC · judge

- **status:** **Accepted (fully successful call-site; ready for structured_output)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Prepare-Concise-Context Thinking Judge Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **agent_registry_key:** `setup:clone-vcs-repository`
- **step:** plan
- **failsafe:** prepare_concise_context
- **thinking:** judge
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-0 → failsafe:prepare_concise_context → selection → seq-1 → thinkings:judge`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 4753 in / 487 out / 5240 total tokens (judge call)
- **duration_ms:** ~6556 (judge call); ~14362 (plan step until abort)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 5`, `stopGeneration: judge`
- **abort_marker:**
  `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=1` + generation=**judge** + phase=setup + step=plan + failsafe=prepare_concise_context + agent filter `clone-vcs`  
  → `hard-stop after plan/prepare_concise_context/judge agent=asset-pack-clone-vcs-repository-agent`  
  throw: `__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__`  
  harness: `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm`

#### expected_schemas (judge)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return** | `JudgmentSchema` `{ quality, issues[], suggestions[], approved }` | **This call.** |
| **failsafe_terminal** | `PCC_KEY_SELECTION_SCHEMA` `{ selectedKeys }` | **Not** this call (structured_output next). |
| **step_return** | `PlanStepOutputSchema` | End of full Plan only. |

#### tools

| | |
| --- | --- |
| **usable** | clone tool registered on plan node (`tools:usable` in keys tree) |
| **selected (useTools)** | **none** (correct for Plan PCC judge) |
| **executed** | **none** |

#### contextful_inputs

- Judge user body includes prior **`reasoning`** object with `analysis` / `reasoningItems` / `conclusion` / `confidence` from reason gen.
- Same `pipeline_execution_keys` tree + PCC system law + preparation framing.
- Hierarchy system block includes deposit product identity (not dual lens) and generic Setup objective without Need/Obfuscations dual steering.

#### completion_response (verbatim)

```json
{
  "quality": 0.78,
  "issues": [
    "reasoning#reasoningItems includes 7 items but conclusion selects 8 keys (lists both obfuscations AND permissibleSources/impermissibleSources); inconsistency in reasoning count vs. final selection",
    "reasoning does not explicitly justify why deposit#reference is needed for 'audit trail' when it appears to be a run identifier already bound at pipeline level; unclear if this is task-coordinate ranking #1 or bookkeeping",
    "reasoning omits consideration of whether host#runId might be needed for workspace isolation or idempotent retry tracking in the Plan step",
    "reasoningItems#5 (pipeline#userId) states 'may need' but does not confirm whether VCS provider REST API authentication requires userId from pipeline context vs. Host-level credentials",
    "conclusion states 8 keys but reasoning#analysis paragraph mentions only 4 essential items (deposit reference/repository, host workspace/manifestRoot, host sourceRevision, pipeline userId); the 7 items list and final selection lack clear prioritization"
  ],
  "suggestions": [
    "Recount and reconcile: clarify whether 7 or 8 keys are selected; if 8, explain why in conclusion; if 7, remove one from reasoningItems or explicitly state it is lower-priority",
    "Validate deposit#reference necessity: confirm it is a task coordinate (ranking #1) or a pure bookkeeping artifact that violates minimality law; if bookkeeping, remove it",
    "Add explicit host#runId analysis: discuss whether workspace isolation or idempotent retry tracking requires this key in the Plan step context",
    "Strengthen auth binding justification: state whether VCS provider clone calls require pipeline#userId or whether Host-level credentials are sufficient; if the latter, omit pipeline#userId",
    "Reorder reasoning to match ranking law: list keys in order of ranking preference (#1 coordinates, #2 auth/binding, #3 tools), then confirm minimality against that order"
  ],
  "approved": false
}
```

#### prompt_excellence_breakdown (judge)

| Dimension | Why the prompt is correct / excellent |
| --- | --- |
| **Hierarchy composition** | Full EE walk on system: Execution×1 → Pipeline primitive → SDIVF base → deposit product → Phase setup → agent → Plan → PCC → Judge generation. No Execution re-emit on phase. |
| **Product identity** | Deposit-only product prose (`ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`); no dual Need/Obfuscations lens on generic Setup. |
| **Judge conditioning** | User is not empty “rate this”: includes preparation + PCC system law + full keys-only tree + **prior reasoning object** intact. Correct multi-gen continuity. |
| **Role boundaries** | System/user ban clone, tree dump, and `selectedKeys` on Judge. Narrow scoring contract, not a second Reason pass. |
| **Vocabulary** | Upstream uses `reasoningItems`; Judge schema is orthogonal (`quality`/`issues`/`suggestions`/`approved`). No PTRR Step collision. |
| **Operational path** | EE path ends at `selection/seq-1` + `thinkings:judge` after reason on `seq-0`; marker pin `generation=judge` matched exactly. |

#### completion_excellence_breakdown (judge)

| Dimension | Why the completion is correct / excellent |
| --- | --- |
| **Schema fidelity** | Valid JudgmentSchema only — no `selectedKeys`, no `useTools`, no task execution. |
| **Role fidelity** | Scores prior reason; does **not** re-pick keys or attempt clone. |
| **Grounding** | Issues cite concrete prior fields (count of `reasoningItems`, soft “may need” on `pipeline#userId`, weak `deposit#reference` rationale). Proves Judge read the reason object. |
| **PCC alignment** | Critique targets minimality, ranking order, bookkeeping vs coordinates — exact failsafe axes. |
| **Calibration** | `quality: 0.78` + `approved: false` is a real gate, not a rubber-stamp 1.0. Better for SO/retry than false approval. |
| **Downstream usefulness** | Suggestions are actionable for structured_output / refine (reconcile key count, drop bookkeeping, tighten auth). |
| **Process** | Hard-stop after Judge only; reason fully completed and available as input (`callCount: 5`). |

#### stability_analysis (judge)

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** — JudgmentSchema. |
| **role_correctness** | **Pass** — Judge only; multi-gen reason→judge continuity. |
| **task_quality** | **Pass** — substantive, law-aligned critique; non-approval is quality signal not harness failure. |
| **prompt_hygiene** | **Pass** — hierarchy + deposit identity + correct Judge conditioning. |
| **regression_vs_prior** | **Pass** — first multi-generation deposit stop; generation pin works beyond reason. |

#### stability_confidence

- **0.95** that this call-site is fully successful and the marker may advance to **structured_output**.  
- Residual: SO must emit only `{ selectedKeys }` using paths present on the keys tree; Judge’s `approved:false` is a quality input, not a blocker for accepting the Judge **call-site** itself.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — fully successful** (historical; marker advanced past Judge) |
| **next marker** | advanced → structured_output (see 1.D3) |
| **not yet** | Plan chunk/stitch; Try/clone tool; remaining Setup agents; Discovery+; full deposit accept |

#### artifacts (judge-stop era; superseded by SO-stop ledger)

| Kind | Path |
| --- | --- |
| Judge-era ledger | prior runs under `.tmp/llm-call-debug/` (wiped each harness re-run) |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D3 Deposit · Setup · clone-vcs · Plan · PCC · structured_output

- **status:** **Accepted (fully successful call-site; PCC selection Thinkings complete)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Prepare-Concise-Context Thinking Structured-Output Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **agent_registry_key:** `setup:clone-vcs-repository`
- **step:** plan
- **failsafe:** prepare_concise_context
- **thinking:** structured_output
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-0 → failsafe:prepare_concise_context → selection → seq-2 → thinkings:structured_output`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 5729 in / 85 out / 5814 total tokens (structured_output call)
- **duration_ms:** ~1083 (SO call); ~22092 (plan step until abort)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 7`, `stopGeneration: structured_output`
- **abort_marker:**
  `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=1` + generation=**structured_output** + phase=setup + step=plan + failsafe=prepare_concise_context + agent filter `clone-vcs`  
  → `hard-stop after plan/prepare_concise_context/structured_output agent=asset-pack-clone-vcs-repository-agent`  
  throw: `__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__`

#### expected_schemas (structured_output)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return / failsafe terminal (selection)** | `PCC_KEY_SELECTION_SCHEMA` `{ selectedKeys: string[] }` | **This call.** Only place `selectedKeys` is legal under PCC. |
| **step_return** | `PlanStepOutputSchema` | Still later (after chunk/stitch if any, end of Plan). |

#### tools

| | |
| --- | --- |
| **usable** | clone tool on plan node keys |
| **selected (useTools)** | **none** (correct — SO is key list only) |
| **executed** | **none** |

#### contextful_inputs

- Prior **`reasoning`** + **`judgment`** both present in user Selection input (Judge approved:false still feeds SO).
- Same `pipeline_execution_keys` keys-only tree.
- SO instructed to emit exactly `{ selectedKeys: string[] }` in path form `#namespace:key` / `#path#ns:key`.

#### completion_response (verbatim)

```json
{
  "selectedKeys": [
    "#deposit:repository",
    "#deposit:obfuscations",
    "#deposit:permissibleSources",
    "#deposit:impermissibleSources",
    "#host:manifestRoot",
    "#host:sourceRevision",
    "#host:userId"
  ]
}
```

#### prompt_excellence_breakdown (structured_output)

| Dimension | Why correct / excellent |
| --- | --- |
| **Hierarchy** | Same deposit EE walk; Execution once; phase no re-emit; product identity deposit-only. |
| **SO role** | Prompt pins SO as formatter of prior reason+judge into **selectedKeys only** — not a new free-form analysis, not clone. |
| **Conditioning** | User includes preparation + PCC law + keys tree + **reasoning** + **judgment** (including approved:false critiques). SO can incorporate Judge feedback. |
| **Schema pin** | User/system require single JSON object with `selectedKeys` path-form keys present on the tree. |
| **Path correctness** | Marker stop lands on `selection/seq-2` + `thinkings:structured_output` after reason (seq-0) and judge (seq-1). Full Thinkings triple complete. |

#### completion_excellence_breakdown (structured_output)

| Dimension | Why correct / excellent |
| --- | --- |
| **Schema** | Exactly `{ selectedKeys: string[] }` — no analysis, no issues, no useTools. |
| **Key presence** | All seven keys exist on the keys tree (`deposit.*`, `host.*`). No invented namespaces. |
| **Path form** | Uses law form `#namespace:key` (e.g. `#deposit:repository`), not bare shorthand only. |
| **Deposit correctness** | Prefers `#deposit:repository` over ambiguous `#read:request` (Judge critique addressed). |
| **Task coverage** | Repository coords + source-safety triad + host workspace + sourceRevision + host userId for auth binding — sufficient for Plan/Try clone without lineage/debug. |
| **Minimality** | 7 keys (within 3–8 guidance). Includes both permissible and impermissible Sources (Judge had asked to audit; SO kept explicit gates — defensible for deposit source-safety). |
| **Judge incorporation** | Resolved deposit vs read ambiguity toward deposit; used `#host:userId` (auth on host) rather than soft optional pipeline userId alone. |

#### stability_analysis (structured_output)

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** — PCC_KEY_SELECTION_SCHEMA shape. |
| **role_correctness** | **Pass** — SO only; no task execution. |
| **task_quality** | **Pass** — deposit-grounded, path-form keys, usable for value materialization next. |
| **prompt_hygiene** | **Pass** — full hierarchy + reason/judge continuity. |
| **regression_vs_prior** | **Pass** — first complete PCC Thinkings triple (reason→judge→SO) on deposit clone Plan. |

#### stability_confidence

- **0.94** that this call-site is fully successful and PCC **selection** Thinkings can close.  
- Residual (not SO call-site failures): post-SO value read-in; chunk_then_sum/stitch; Plan Try tool execution. Judge `approved:false` did not block a legal minimal key set.

#### prompt hygiene (post-1.D3; corrected 2026-07-16)

**Hierarchy law (corrected):** every call-site system walk still includes full ancestry
(Execution once → Pipeline → Phase → **Agent** → **Step** → active Failsafe → active Thinking).
Agent was **not** “wrongly on the path.” Capability prose like “three-way merge” is authored
on VCS agent promptparts; if too heavy, thin **authoring**, not drop Agent from the walk.

**Real hygiene fixes (kept):**

| Change | Effect |
| --- | --- |
| Lean `task` / preparation (**user** field only) | Short task identity — **not** a second full hierarchy copy in user JSON |
| Omit duplicate `system` essay in Reason user | PCC law already on hierarchical system |
| Judge user | Prior `reasoning` + keys (+ lean task) — no hierarchy re-dump |
| SO user | reason + judgment + keys; schema envelope **once** |
| SO instruction | No unconditional `useTools` on PCC (selectedKeys only) |
| Removed | Brittle keyword `trimHeavySystemProse`; temporary skip of Agent/Step nodes |

**PCC-specific adjustments (slight, not hierarchy amputation):** keys-only tree (no values);
generation schemas (Reasoning / Judgment / selectedKeys); **PCC SO** never useTools (not Plan/Try task SO — Try/Retry task SO may include useTools).

#### re-validation (2026-07-16, post hierarchy-walk restore)

Harness: `qa:deposit:debug-first-llm` · stopGeneration=`structured_output` · `debugStop: true` · callCount=7.

| Gen | system | user | usage (in/out/tot) | Completion |
| --- | --- | --- | --- | --- |
| reason | ~9020 | ~3821 | 3125 / 676 / 3801 | Valid Reasoning + `reasoningItems`; deposit/host keys |
| judge | ~8575 | ~6126 | 3543 / 357 / 3900 | Valid Judgment; quality 0.85; **approved: true** |
| structured_output | ~8640 | ~7735 | 3935 / 92 / 4027 | Valid `{ selectedKeys }` (8 path-form keys) |

**System walk (all 3 gens, 6 blocks):** Execution+Pipeline → Phase Setup → **Agent VCS** → **PTRR Plan** → PCC failsafe → active Thinking. Execution once. Agent/Step restored on path (hierarchy law).

**User hygiene (all 3):** lean `task` only (no hierarchy re-paste); `pipeline_execution_keys` present; no SECRET values; JSON-only once; SO never instructs useTools include-array.

**SO selectedKeys (verbatim this run):**
`#deposit:repository`, `#deposit:obfuscations`, `#deposit:permissibleSources`, `#deposit:impermissibleSources`, `#host:manifestRoot`, `#host:sourceRevision`, `#pipeline:input`, `#pipeline:userId`

**Authoring thin (2026-07-16, done):** VCS identity/role/instructions/capabilities/tools
shortened; VCS Plan no longer re-lists capabilities; DP clone step sets `step:purpose`
once (no label+details double). Residual: generic VCS still broader than pure clone
product if further specialization desired.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — fully successful** (incl. post-lean re-validation) |
| **next marker** | advanced → **chunk_then_sum** / **reason** (see 1.D4) |
| **next commit_tag (example)** | `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Reason Call-Site` |
| **not yet** | Chunk/stitch value materialization proof; Try/clone tool; remaining Setup; Discovery+ |

#### artifacts

| Kind | Path |
| --- | --- |
| Reason request | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0001-request-…-reason.json` |
| Reason response | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0002-response-…-reason.json` (4502/812/5314) |
| Judge request | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0003-request-…-judge.json` |
| Judge response | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0004-response-…-judge.json` (5001/676/5677) |
| SO request | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0005-request-…-structured_output.json` |
| SO response | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0006-response-…-structured_output.json` (5729/85/5814) |
| Abort | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0007-abort-…-structured_output.json` |
| Ledger | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/ledger.jsonl` |
| Verbatim report | `.tmp/local-deposit-debug/VERBATIM_WIRE_REPORT.md` |
| Summary | `.tmp/local-deposit-debug/debug-summary.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D4 Deposit · Setup · clone-vcs · Plan · ChunkThenSum · reason

- **status:** **Accepted (fully successful call-site; CS task reason)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Reason Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **agent_registry_key:** `setup:clone-vcs-repository`
- **step:** plan
- **failsafe:** chunk_then_sum
- **thinking:** reason
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-1 → failsafe:chunk_then_sum → gen-0 → seq-0 → thinkings:reason`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 4498 in / 788 out / 5286 total tokens (CS reason call)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 9`, `stopFailsafe: chunk_then_sum`, `stopGeneration: reason`
- **abort_marker:**
  `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=1` + generation=**reason** + phase=setup + step=plan + failsafe=**chunk_then_sum** + agent filter `clone-vcs`  
  → `hard-stop after plan/chunk_then_sum/reason agent=asset-pack-clone-vcs-repository-agent`  
  throw: `__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__`

#### expected_schemas (CS reason)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return** | `ReasoningSchema` `{ analysis, reasoningItems, conclusion, confidence, useTools? }` | **This call.** Plan reason must omit `useTools` (plan-only). |
| **failsafe role** | ChunkThenSum INPUT sizing (not PCC selection) | Single-pass when composed request fits; else chunk selectedContext + sum. |
| **step_return** | `PlanStepOutputSchema` | Later (after CS judge/SO + stitch if any). |

#### tools

| | |
| --- | --- |
| **usable** | clone tool on plan node keys |
| **selected (useTools)** | **omitted** (correct — Plan reason must not execute tools) |
| **executed** | **none** |

#### contextful_inputs

- Post-PCC payload: `selectedKeys` + `selectedContext` **values** present (read-in complete).
- This-run SO selectedKeys (5): `#host:manifestRoot`, `#host:sourceRevision`, `#deposit:repository`, `#deposit:obfuscations`, `#pipeline:input`.
- Host `sourceRevision` carries `sindresorhus/is-plain-obj` @ `main` @ `97f38e8836f86a642cce98fc6ab3058bc36df181`.
- Residual hygiene: user still serializes full task envelope **plus** selectedContext (some field overlap). Functional; lean-CS-user is a later optional polish.

#### completion_response (summary; schema-valid)

```json
{
  "analysis": "Setup Plan for clone strategy on sindresorhus/is-plain-obj; plan only, no tools…",
  "reasoningItems": [
    "fullName + commit SHA explicit",
    "provider=GitHub inferred",
    "Try: commit-pinned checkout; Retry: branch then shallow",
    "source-safety applies post-clone / synthesis; not a clone blocker for public repo",
    "tool: asset-pack-clone-vcs-repository-tool"
  ],
  "conclusion": "Plan Try with GitHub owner=sindresorhus name=is-plain-obj ref=commit SHA; fallbacks for Retry; no tools this step.",
  "confidence": 0.92
}
```

(`useTools` field **omitted**, not `[]` — preferred Plan hygiene.)

#### prompt_excellence_breakdown (CS reason)

| Dimension | Why correct / excellent |
| --- | --- |
| **Hierarchy law** | **6 blocks:** Execution+Pipeline → Phase Setup → **Agent VCS** → **PTRR Plan** → **ChunkThenSum failsafe law** → **Reason** thinking. Execution once. Agent/Step not amputated. |
| **Failsafe attach (fixed this stop)** | First CS stop found **no failsafe system node** (PCC had law attach; CS did not). Fixed: `factoryChunkThenSum` attaches `PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK` via `setSpecificExecution` (parity with PCC). Stitch attach added for the same law. |
| **Failsafe content** | Law states INPUT sizing after PCC read-in; single vs chunk+sum host behavior; Plan reason omit useTools; no selectedKeys re-emission. |
| **Role filter** | No PCC failsafe essay; no Stitch law; no Judge/SO generation text. |
| **Authoring thin** | No three-way merge; VCS/Plan stay lean (post-1.D3 thin authoring). |
| **Path correctness** | Stop lands on `plan/seq-1/failsafe:chunk_then_sum/gen-0/…/thinkings:reason` after PCC selection seq-0. |
| **forPreparation scope (fixed)** | `forPreparation` is PCC-only — CS budget measure no longer substitutes lean PCC task text for the hierarchical system size. |

#### completion_excellence_breakdown (CS reason)

| Dimension | Why correct / excellent |
| --- | --- |
| **Schema** | Valid Reasoning: analysis + reasoningItems + conclusion + confidence; no selectedKeys; no judgment fields. |
| **Role** | Plans Try tool strategy; does **not** call tools; omits useTools. |
| **Task quality** | Correct repo/owner/name/commit; GitHub provider; Retry ladder (commit → branch → shallow); workspacePath persistence intent. |
| **CS vs PCC** | Uses selectedContext values for coordinates; does not re-select keys; does not pretend to be PrepareConciseContext. |
| **Deposit mode** | Deposit attestation already true; clone framed as Setup workspace prep for Discovery, not proof generation. |

#### stability_analysis (CS reason)

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** |
| **role_correctness** | **Pass** — Plan task reason under CS, not PCC selection |
| **task_quality** | **Pass** — actionable clone plan for is-plain-obj |
| **prompt_hygiene** | **Pass** after failsafe-law attach; **user prepared-only lean closed** (see re-validation below) |
| **regression_vs_prior** | **Pass** — first deposit CS reason stop with full hierarchy incl. failsafe |

#### prompt hygiene (post-1.D4; CS prepared-only user)

| Change | Effect |
| --- | --- |
| CS Reason/Judge/SO user | `selectedKeys` + `selectedContext` (+ prior Thinkings) only — no pre-PCC envelope dump |
| CS measure + chunk base | Same lean prepared shape (measure matches wire) |
| Chunked path (canonical) | **Sequential** loop: slice + `priorChunkCompletions` → final sum over all completions |
| Empty selection | Still lean empty bag (no envelope fail-soft) |

#### re-validation (2026-07-16, prepared-only user + sequential CS law)

Harness: `qa:deposit:debug-first-llm` · stopFailsafe=`chunk_then_sum` · stopGeneration=`reason` · `debugStop: true` · callCount=9.

| Metric | Pre-lean CS reason | Post-lean |
| --- | --- | --- |
| system chars | ~6733 | ~6791 (CS law still present) |
| user chars | ~8953 | **~5777** |
| user wire keys | full envelope + selected* | **`selectedKeys` + `selectedContext` only** |
| usage (in/out/tot) | 4498 / 788 / 5286 | **3404 / 715 / 4119** |
| completion | Plan clone; conf 0.92 | Plan clone from selectedContext; conf **0.95**; useTools omitted |

Nested bulk under a **selected** key (e.g. `#pipeline:input` → depositoryAssets) may still appear inside `selectedContext` — that is correct preparation, not envelope dual-dump.

#### stability_confidence

- **0.93** that this call-site is fully successful and the marker may advance to **CS judge**.  
- Residual (not blockers): CS judge/SO live proof; Stitch; Plan Try tool execution.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — fully successful** |
| **next marker** | advanced → **chunk_then_sum** / **judge** (see 1.D5) |
| **next commit_tag (example)** | `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Judge Call-Site` |
| **not yet** | CS SO; Stitch; Try/clone tool; remaining Setup; Discovery+ |

#### artifacts

| Kind | Path |
| --- | --- |
| CS reason request | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0007-request-…-chunk_then_sum-reason.json` |
| CS reason response | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0008-response-…-chunk_then_sum-reason.json` (4498/788/5286) |
| Abort | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0009-abort-…-chunk_then_sum-reason.json` |
| Ledger | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/ledger.jsonl` |
| Verbatim report | `.tmp/local-deposit-debug/VERBATIM_WIRE_REPORT.md` |
| Summary | `.tmp/local-deposit-debug/debug-summary.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D5 Deposit · Setup · clone-vcs · Plan · ChunkThenSum · judge

- **status:** **Accepted (fully successful call-site; CS task judge)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Judge Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **step:** plan
- **failsafe:** chunk_then_sum
- **thinking:** judge
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-1 → failsafe:chunk_then_sum → gen-0 → seq-1 → thinkings:judge`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 2593 in / 445 out / 3038 total tokens (CS judge call)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 11`, `stopFailsafe: chunk_then_sum`, `stopGeneration: judge`
- **abort_marker:**
  generation=**judge** + failsafe=**chunk_then_sum** + phase=setup + step=plan + agent filter `clone-vcs`  
  → `hard-stop after plan/chunk_then_sum/judge agent=asset-pack-clone-vcs-repository-agent`

#### expected_schemas (CS judge)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return** | `JudgmentSchema` `{ quality, issues, suggestions, approved }` | **This call.** |
| **prior** | Reasoning from CS reason | Conditioning input, not re-emitted |

#### tools

| | |
| --- | --- |
| **usable** | clone tool on plan node |
| **selected / executed** | **none** (Judge does not execute tools) |

#### contextful_inputs

- User wire keys: **`selectedKeys` + `selectedContext` + `reasoning`** only (prepared task path).
- Prior CS reason present with plan clone strategy (GitHub / sindresorhus/is-plain-obj / commit + fallbacks).
- No hierarchy re-paste; not PCC key-selection judge branch.

#### completion_response (summary)

```json
{
  "quality": 0.88,
  "issues": [
    "Provider inference assumes GitHub without explicit validation…",
    "Shallow clone depth tradeoff for later measurement…",
    "Auth fallback if public API unavailable…",
    "Obfuscation enforcement coordination across phases…"
  ],
  "suggestions": [
    "Confirm provider from naming/Host defaults…",
    "Document depth rationale…",
    "Auth fallback sequence…",
    "Phase handoff for obfuscation gate…",
    "Commit-vs-branch tradeoff in store…"
  ],
  "approved": true
}
```

#### prompt_excellence_breakdown (CS judge)

| Dimension | Why correct / excellent |
| --- | --- |
| **Hierarchy** | 6 blocks: Execution+Pipeline → Phase → Agent → Plan → **ChunkThenSum law** → **Judge** thinking. Execution once. |
| **Role filter** | Active Judge instruction only (no Reason thinking block); no PCC/Stitch leak. |
| **User prepared-only** | Wire keys exactly `selectedKeys`, `selectedContext`, `reasoning`. |
| **Path** | Stops on `gen-0/seq-1` judge after CS reason `seq-0`; callCount 11 = PCC×3 + CS reason + CS judge + abort. |

#### completion_excellence_breakdown (CS judge)

| Dimension | Why correct / excellent |
| --- | --- |
| **Schema** | Valid Judgment only — no analysis/selectedKeys leak. |
| **Role** | Scores prior **task** plan reasoning; does not re-plan clone or re-select keys. |
| **Quality** | quality 0.88; **approved: true** with constructive issues (provider assumption, shallow depth, auth, phase handoff) — appropriate residual critique, not hard fail. |
| **Task grounding** | Critiques land on the prior reason’s GitHub/shallow/auth claims against selectedContext. |

#### stability_analysis (CS judge)

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** |
| **role_correctness** | **Pass** — CS task judge, not PCC selection judge |
| **task_quality** | **Pass** — useful, proportional critique; approved |
| **prompt_hygiene** | **Pass** — prepared user + full hierarchy + CS law |
| **regression_vs_prior** | **Pass** — first CS judge stop after lean prepared user |

#### stability_confidence

- **0.94** that this call-site is fully successful and the marker may advance to **CS structured_output**.  
- Residual: CS SO must emit Plan step schema (not selectedKeys); approved:true is input, not a skip of SO.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — fully successful** |
| **next marker** | advanced → **chunk_then_sum** / **structured_output** (see 1.D6) |
| **next commit_tag (example)** | `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Structured-Output Call-Site` |
| **not yet** | CS SO live (now 1.D6); Stitch; Try/clone tool; remaining Setup; Discovery+ |

#### artifacts

| Kind | Path |
| --- | --- |
| CS judge request | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0009-request-…-chunk_then_sum-judge.json` |
| CS judge response | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0010-response-…-chunk_then_sum-judge.json` (2593/445/3038) |
| Abort | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0011-abort-…-chunk_then_sum-judge.json` |
| Summary | `.tmp/local-deposit-debug/debug-summary.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D6 Deposit · Setup · clone-vcs · Plan · ChunkThenSum · structured_output

- **status:** **Accepted (fully successful call-site; CS Plan Thinkings complete)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Failsafe Chunk-Then-Sum Thinking Structured-Output Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **step:** plan
- **failsafe:** chunk_then_sum
- **thinking:** structured_output
- **execution_path:**
  `pipeline:synthesize_deposit_asset_packs → seq-2 → phase:setup → seq-0 → agent:asset-pack-clone-vcs-repository-agent → plan → seq-1 → failsafe:chunk_then_sum → gen-0 → seq-2 → thinkings:structured_output`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 4305 in / 617 out / 4922 total tokens (CS SO call)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 13`, `stopFailsafe: chunk_then_sum`, `stopGeneration: structured_output`
- **abort_marker:**
  generation=**structured_output** + failsafe=**chunk_then_sum** + phase=setup + step=plan + agent filter `clone-vcs`  
  → `hard-stop after plan/chunk_then_sum/structured_output agent=asset-pack-clone-vcs-repository-agent`

#### expected_schemas (CS structured_output)

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return / step Plan** | `PlanStepOutputSchema` `{ approach, steps, considerations? }` | **This call.** Not PCC `{ selectedKeys }`. |
| **prior** | Reasoning + Judgment from CS reason/judge | User conditioning |

#### tools

| | |
| --- | --- |
| **usable** | clone tool on plan node |
| **selected / executed** | **none** (Plan SO must not emit useTools; schema has no useTools) |

#### contextful_inputs

- User wire keys: **`selectedKeys` + `selectedContext` + `reasoning` + `judgment`** only.
- Prior reason confidence ~0.95; judge quality ~0.92 **approved: true** with depth/auth/retry critiques.
- SO instructed to format plan schema from prior Thinkings + prepared context (not re-select keys).

#### completion_response (summary)

```json
{
  "approach": "Clone sindresorhus/is-plain-obj from GitHub via REST API at commit hash, fallback main, shallow clone; persist workspacePath/sourceRevision; source-safety post-checkout.",
  "steps": [
    "Resolve provider coords from #host:sourceRevision…",
    "Primary ref=commit; fallback=branch main…",
    "Prepare asset-pack-clone-vcs-repository-tool params…",
    "Retry: up to 2× exponential backoff; then branch main…",
    "Record workspacePath + sourceRevision metadata…",
    "Document impermissibleSources Host post-checkout filtering…"
  ],
  "considerations": [
    "Shallow vs full clone for measurement…",
    "Auth / Host token assumption…",
    "Optional HEAD validation…",
    "Idempotent adopt/re-clone…",
    "Plan only — Try executes clone…"
  ]
}
```

#### prompt_excellence_breakdown (CS SO)

| Dimension | Why correct / excellent |
| --- | --- |
| **Hierarchy** | 6 blocks: Execution+Pipeline → Phase → Agent → Plan → CS law → **SO** (“Format reasoning and judgment…”). |
| **Role** | SO formatter, not new free-form plan-from-scratch; not PCC selectedKeys. |
| **User prepared-only** | Wire keys exactly selectedKeys, selectedContext, reasoning, judgment. |
| **Path** | `gen-0/seq-2` after reason seq-0 + judge seq-1; full CS Thinkings triple complete. |
| **Schema pin** | PlanStepOutputSchema approach/steps/considerations — matches step law. |

#### completion_excellence_breakdown (CS SO)

| Dimension | Why correct / excellent |
| --- | --- |
| **Schema** | Valid PlanStepOutput; no selectedKeys, no useTools, no judgment fields. |
| **Judge incorporation** | Steps/considerations address auth, retry parameterization, shallow-clone tradeoff, source-safety handoff. |
| **Task quality** | Actionable Try strategy: GitHub, owner/name, commit primary, tool name, metadata persist. |
| **Plan-only** | Explicitly defers execution to Try; no tool invocation. |

#### stability_analysis (CS SO)

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** — PlanStepOutputSchema |
| **role_correctness** | **Pass** — CS task SO, not PCC SO |
| **task_quality** | **Pass** — deposit clone plan ready for Try |
| **prompt_hygiene** | **Pass** — prepared user + full hierarchy |
| **regression_vs_prior** | **Pass** — first complete CS Thinkings triple on deposit Plan |

#### stability_confidence

- **0.94** that this call-site is fully successful and Plan **CS selection→task Thinkings** can close.  
- Residual: Stitch if schema incomplete (this run schema-complete); Plan step return materialization; Try tool execution.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — fully successful** (CS Plan Thinkings complete) |
| **next marker** | advanced → Plan close via stitch pass-through + Try fence (see **1.D7**) |
| **next commit_tag (example)** | Plan-complete / Try fence tag |
| **not yet** | (superseded by 1.D7) |

#### artifacts

| Kind | Path |
| --- | --- |
| CS SO request | `.tmp/llm-call-debug/…/0011-request-…-chunk_then_sum-structured_output.json` |
| CS SO response | `.tmp/llm-call-debug/…/0012-response-…-chunk_then_sum-structured_output.json` (4305/617/4922) |
| Abort | `.tmp/llm-call-debug/…/0013-abort-…-chunk_then_sum-structured_output.json` |
| Summary | `.tmp/local-deposit-debug/debug-summary.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D7 Deposit · Setup · clone-vcs · **Plan step complete** (Stitch non-trigger + Try fence)

- **status:** **Accepted — Plan step fully complete**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Plan Complete`
- **proof method:** After §1.D1–1.D6 (Plan PCC + CS Thinkings), Stitch is often **zero-LLM**. Marker moved to first post-Plan LLM: **Try · prepare_concise_context · reason** as a **completion fence** (not full Try call-site acceptance).
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **phase:** setup · **agent:** `asset-pack-clone-vcs-repository-agent`
- **Plan step closed:** yes
- **Stitch:** `stitch_until_complete` ran · **`stitchCount: 0`** (schema-valid PlanStepOutput from CS SO — non-triggering pass-through, **no stitch LLM**)
- **harness result:** `ok: true`, `debugStop: true`, `callCount: 15`, `stopStep: try`, `stopFailsafe: prepare_concise_context`, `stopGeneration: reason`
- **abort:** `hard-stop after try/prepare_concise_context/reason agent=asset-pack-clone-vcs-repository-agent`

#### Plan LLM inventory (this run — complete)

| # | Failsafe | Thinking | Role |
| --- | --- | --- | --- |
| 1–2 | prepare_concise_context | reason | PCC key selection |
| 3–4 | prepare_concise_context | judge | PCC quality |
| 5–6 | prepare_concise_context | structured_output | `{ selectedKeys }` |
| 7–8 | chunk_then_sum | reason | task plan reasoning (prepared user) |
| 9–10 | chunk_then_sum | judge | task judgment |
| 11–12 | chunk_then_sum | structured_output | **PlanStepOutputSchema** |
| — | stitch_until_complete | _(none)_ | **stitchCount=0** pass-through |
| 13–14 | try / PCC | reason | **fence only** (Plan already closed) |
| 15 | abort | — | hard-stop |

**Plan request/response count:** 12 · **Stitch LLM count:** 0 · **Tools on Plan:** none (correct)

#### Plan terminal output (CS SO — schema-valid)

```json
{
  "approach": "Execute GitHub API-based clone of sindresorhus/is-plain-obj at commit …",
  "steps": ["… 9 actionable Try steps …"],
  "considerations": ["…"]
}
```

`PlanStepOutputSchema` parse: **Pass** → Stitch non-trigger is **correct law**, not a skip.

#### Stitch excellence (non-trigger path)

| Dimension | Result |
| --- | --- |
| **Trigger law** | Stitch only when truncated or schema-incomplete |
| **This run** | CS SO emitted complete `approach` + `steps` (+ considerations) → **0 stitch gens** |
| **Telemetry** | stdout: `failsafe: stitch_until_complete`, `stitchCount: 0` |
| **Regression risk avoided** | No infinite stitch; no discarded valid final output |

#### Plan step stability_confidence

- **0.95** that clone-vcs **Plan** is fully successful end-to-end under deposit debug force-PTRR.  
- Residual for **pipeline** (not Plan): Try tool execution, Retry/Refine, other Setup agents, Discovery+.

#### Try fence (not full Try accept)

| | |
| --- | --- |
| **status** | **Fence only** — proves Plan returned control to PTRR Try |
| **call** | Try · PCC · reason (selection Thinkings start) |
| **usage** | 4480 / 697 / 5177 · conf 0.92 · selects clone keys |
| **next progressive** | §1.D8+ Try PCC judge/SO → CS → tools |

#### decision

| | |
| --- | --- |
| **Plan step** | **Closed / Accepted** |
| **next marker** | Remain on **Try · PCC · reason** for progressive Try accept, or advance Try Thinkings |
| **not yet** | Try tools/clone; remaining Setup; Discovery+ |

#### artifacts

| Kind | Path |
| --- | --- |
| Plan CS SO | `.tmp/llm-call-debug/…/0012-response-…-plan-chunk_then_sum-structured_output.json` |
| Try fence request | `.tmp/llm-call-debug/…/0013-request-…-try-prepare_concise_context-reason.json` |
| Try fence response | `.tmp/llm-call-debug/…/0014-response-…-try-prepare_concise_context-reason.json` |
| Abort | `.tmp/llm-call-debug/…/0015-abort-…-try-…-reason.json` |
| Stitch telemetry | `.tmp/local-deposit-debug/pipeline.stdout.log` (`stitchCount: 0`) |
| Summary | `.tmp/local-deposit-debug/debug-summary.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### Plan step rollup (1.D1–1.D7) — excellence & improvements

| ID | Call-site | Confidence | Headline excellence |
| --- | --- | --- | --- |
| **1.D1** | PCC reason | ~0.92 | Keys-only selection reasoning; deposit-grounded |
| **1.D2** | PCC judge | ~0.95 | Judgment on minimality/coverage |
| **1.D3** | PCC SO | ~0.94 | `{ selectedKeys }` path-form only; no useTools |
| **1.D4** | CS reason | ~0.93 | Task plan from values; later **prepared-only user** |
| **1.D5** | CS judge | ~0.94 | Task critique; approved with constructive issues |
| **1.D6** | CS SO | ~0.94 | **PlanStepOutputSchema**; no selectedKeys leak |
| **1.D7** | Stitch 0 + Plan close | **0.95** | Schema-valid → zero stitch LLM; Try fence |

**Cross-cutting improvements landed during Plan progressive QA:**

1. **Hierarchy law restored** — full walk Execution→…→Failsafe→Thinking (never amputate Agent/Step).  
2. **Dual system/user law** — system = ancestry; user = generation payload only.  
3. **PCC lean user** — keys-only tree; lean task; **PCC SO** never useTools (`selectedKeys` only). Plan/Refine task SO also omit useTools; **Try/Retry task SO must allow useTools**.  
4. **CS failsafe law attach** + **forPreparation PCC-only** (budget measure correct).  
5. **CS prepared-only user** — `selectedKeys`+`selectedContext` (+ prior Thinkings); no envelope dual-dump.  
6. **CS sequential chunk loop** — slice + `priorChunkCompletions` → sum (parallel opt-in).  
7. **Thin VCS/Plan authoring** — no three-way merge soup.  
8. **Stitch non-trigger proven live** — `stitchCount: 0` after valid Plan SO.

**QA clarity:** Deposit marker is movable and ledger-backed; Plan closed by fencing first Try LLM rather than inventing a zero-call stitch stop.

---

### 1.D8 Deposit · Setup · clone-vcs · **Try** · PCC · reason

- **status:** **Accepted (fully successful call-site; Try PCC selection reason)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Step Try Failsafe Prepare-Concise-Context Thinking Reason Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **step:** **try**
- **failsafe:** prepare_concise_context
- **thinking:** reason
- **execution_path:**
  `…/agent:asset-pack-clone-vcs-repository-agent → try → … → failsafe:prepare_concise_context → selection → seq-0 → thinkings:reason`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 4480 in / 465 out / 4945 total (Try PCC reason)
- **harness:** `ok: true`, `debugStop: true`, `callCount: 15`, stopStep=`try`, stopFailsafe=`prepare_concise_context`, stopGeneration=`reason`
- **abort:** `hard-stop after try/prepare_concise_context/reason agent=asset-pack-clone-vcs-repository-agent`

#### expected_schemas

| Layer | Schema | Notes |
| --- | --- | --- |
| **thinking_return** | ReasoningSchema | PCC selection only — **not** clone task |
| **PCC terminal** | later SO `{ selectedKeys }` | Not this call |

#### tools

| | |
| --- | --- |
| **usable (Try step)** | clone tool on try node (system documents Try execution) |
| **this call useTools** | **omitted** (correct — PCC reason never selects tools) |
| **executed** | none |

#### contextful_inputs

- Lean PCC user: task identity (phase setup, agent clone-vcs, **PTRR step: try**) + `pipeline_execution_keys` (keys only).
- Full hierarchy system: Execution once + Setup + Agent VCS + **TRY** purpose + PCC law + Reason.
- Plan already complete (1.D1–1.D7); Try must select keys for **execution** of clone.

#### completion (summary)

Valid Reasoning: analysis + reasoningItems + conclusion + confidence **0.92**; **no selectedKeys**; **no useTools**.  
Candidates for SO: deposit repository + source-safety triad, host manifestRoot/sourceRevision, pipeline input/userId/synthesizeMode.  
Explicit: “No tools are invoked in this Reason generation.”

#### excellence

| Axis | Result |
| --- | --- |
| **schema_parse** | **Pass** |
| **role** | **Pass** — PCC key selection under **Try**, not Plan strategy, not clone execution |
| **task_quality** | **Pass** — deposit/host coords + safety for clone; omits lineage/debug |
| **prompt_hygiene** | **Pass** — 6-block hierarchy; keys-only user; no settleDelivery |
| **tools law** | **Pass** — PCC omits useTools; Try tool surface reserved for later CS task SO |

#### residual

- Conclusion text says “7 keys” while listing more namespaces (count soft inconsistency — SO will normalize).  
- Prefer `#host:sourceRevision` over empty `#deposit:repository` coordinates when SO runs (same as Plan PCC residual).

#### stability_confidence

- **0.93** that this Try PCC reason call-site is successful; marker may advance to **Try PCC judge**.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted** (historical) |
| **next marker** | advanced → full agent end (see **1.D9**) |
| **not yet** | (closed by 1.D9) remaining Setup agents |

#### artifacts

| Kind | Path |
| --- | --- |
| Request | `.tmp/llm-call-debug/…/0013-request-…-try-prepare_concise_context-reason.json` |
| Response | `.tmp/llm-call-debug/…/0014-response-…-try-prepare_concise-context-reason.json` |
| Abort | `.tmp/llm-call-debug/…/0015-abort-…-try-…-reason.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D9 Deposit · Setup · clone-vcs · **Agent end** (Plan→Try→Retry→Refine CS SO)

- **status:** **Accepted (clone-vcs agent complete under progressive marker)**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Clone-Vcs Agent End Plan Try Retry Refine`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **phase:** setup
- **agent:** `asset-pack-clone-vcs-repository-agent`
- **step / failsafe / thinking (stop):** **refine** / **chunk_then_sum** / **structured_output**
- **execution_path (abort):**
  `…/agent:asset-pack-clone-vcs-repository-agent → refine → failsafe:chunk_then_sum → gen-0 → seq-2 → thinkings:structured_output`
- **provider / model:** anthropic / `claude-haiku-4-5`
- **harness:** `ok: true`, `debugStop: true`, **`callCount: 49`**, stopStep=`refine`, stopFailsafe=`chunk_then_sum`, stopGeneration=`structured_output`
- **abort:** `hard-stop after refine/chunk_then_sum/structured_output agent=asset-pack-clone-vcs-repository-agent`

#### coverage (single agent-end run)

| PTRR step | PCC (R/J/SO) | CS (R/J/SO) | Tools postprocess |
| --- | --- | --- | --- |
| **Plan** | ✓ | ✓ PlanStepOutput (approach/steps) | none (correct) |
| **Try** | ✓ | ✓ agent schema + **useTools** | **yes** — `asset-pack-clone-vcs-repository-tool` |
| **Retry** | ✓ (includes try tools:used keys) | ✓ real `workspacePath` under `/var/folders/…/bitcode-clone-…` | yes when selected |
| **Refine** | ✓ | ✓ agent return (stop here) | none (correct; no postprocess) |

Stitch: non-triggering (schema-valid CS SO; stitchCount=0).

#### critique → fix (this agent session)

| Defect | Fix |
| --- | --- |
| VCS system “DevOps soup” (Jenkins/Gerrit) | Thin Host-bound VCS prose |
| PCC ranking preferred null deposit shells | Prefer `#host:sourceRevision` / workspace; Plan PCC SO now selects host keys first |
| Try/Retry `useTools` never executed | (1) hoist `reasoning.useTools` → tools postprocess; (2) add optional `useTools` on clone agent schema; (3) **tool not registered** — missing `__docCodePrompt` aborted whole tool loop; per-tool fail-soft + attach prompt |
| Clone tool `undefined.length` on agent-shaped input | Rewrite AssetPack clone tool to accept `{provider,owner,name,ref}` and git-https clone |
| Try SO stuck pre-tool | Tools postprocess folds successful `workspacePath` into step `output` |
| Settlement/delivery on synth | Already purged (no `settleDelivery` / `settlementBoundary` on wire) |

#### excellence (agent end)

| Axis | Result |
| --- | --- |
| **hierarchy** | **Pass** — Pipeline→Phase→Agent→Step→Failsafe→Thinking; Execution once |
| **dual law** | **Pass** — PCC keys-only user; CS prepared `selectedKeys`+`selectedContext` |
| **useTools law** | **Pass** — Plan/PCC omit; Try reason+SO select catalog tool; Refine no postprocess |
| **tools execute** | **Pass** — postprocess runs; real temp workspace from clone tool |
| **settle ban** | **Pass** — no settleDelivery on synth wire |
| **prompt hygiene** | **Pass** — thin VCS; no Jenkins soup |

#### residual (non-blocking for agent-end accept)

- Refine CS may still invent wrong tool name (`cloneRepositoryTool`) or pending status in SO text (no tools postprocess on Refine — final return quality, not execution).  
- Thin VCS string intermittent on some system walks (agent still has VCS Operations identity).  
- Many non-clone tools still lack `__docCodePrompt` (logged skip at preprocess; catalog partially populated).  
- Next progressive marker: next Setup agent or Discovery (not further clone-vcs gens).

#### stability_confidence

- **0.90** that clone-vcs agent end (Plan→Try→Retry→Refine CS SO, 49 calls, tools postprocess) is successful for V48 progressive deposit QA.

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted — clone-vcs agent complete** |
| **next marker** | next Setup agent **or** Discovery (leave refine/CS/SO until next agent starts) |
| **not yet** | initialize-lsp / mcps / comprehend-obfuscations / danger-wall; Discovery |

#### artifacts

| Kind | Path |
| --- | --- |
| Work root | `.tmp/local-deposit-debug/` |
| Wire report | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/VERBATIM_WIRE_REPORT.md` |
| Ledger | `…/ledger.jsonl` (49 entries) |
| Abort | `…/0049-abort-…-refine-chunk_then_sum-structured_output.json` |
| Re-run | `pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm` |

---

### 1.D10 Deposit · Setup · comprehend-obfuscations · Plan · PCC · reason

- **status:** **Accepted**
- **date:** 2026-07-16
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Obfuscations Step Plan Failsafe Prepare-Concise-Context Thinking Reason Call-Site`
- **pipeline:** `ExecutionPipelineSDIVFSynthesizeDepositAssetPacks`
- **pipeline_mode:** deposit
- **phase:** setup
- **agent:** `DepositInputComprehensionAgent` (`setup:comprehend-obfuscations`)
- **step / failsafe / thinking:** **plan** / **prepare_concise_context** / **reason**
- **provider / model:** anthropic / `claude-haiku-4-5`
- **harness:** `ok: true`, `debugStop: true`, stopAgent=`DepositInputComprehension`
- **abort:** `0052-abort-…-depositinputcomprehensionagent-plan-prepare_concise_context-reason.json`
- **usage:** inputTokens≈9893, outputTokens≈488

#### coverage

| Axis | Result |
| --- | --- |
| **hierarchy** | **Pass** — Execution → Pipeline → SDIVF → deposit product → Setup → agent → Plan → PCC → Reason. Settlement ban present (synth only). |
| **dual law** | **Pass** — user is keys-only selection task + `pipeline_execution_keys`; values not shown. |
| **useTools law** | **Pass** — PCC reason omits `useTools`; user forbids tool selection. |
| **product identity** | **Pass** — deposit Obfuscations steering; not read Need dual. |
| **key selection** | **Pass** — 8 keys: deposit obfuscations/permissible/impermissible/reference/repository + host manifestRoot/sourceRevision + pipeline input. Confidence 0.95. |

#### critique

| Finding | Severity | Disposition |
| --- | --- | --- |
| Parallel Setup wave continues after agent-filter hard-stop (LSP ran full PTRR to call ~99 while abort was call 52) | medium | Note: parallel sibling leakage; stop is per-agent not whole pipeline |
| `pipeline_execution_keys.deposit` lacks `sourceCheckoutCatalog` (agent needs catalog paths for Try) | medium | Residual — Host/deposit preprocess must surface catalog keys before CS |
| One “Need or …” string residue in hierarchy walk | low | Non-blocking hygiene |

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted** |
| **next marker** | Obfuscations Plan PCC **judge** (1.D11), then finish this agent |
| **not yet** | LSP agent formal accept; MCP; danger-wall; Discovery |

#### artifacts

| Kind | Path |
| --- | --- |
| Request | `…/0050-request-…-depositinputcomprehensionagent-plan-prepare_concise_context-reason.json` |
| Response | `…/0051-response-…-depositinputcomprehensionagent-plan-prepare_concise_context-reason.json` |
| Abort | `…/0052-abort-…` |

---

### 1.D11 Deposit · Setup · comprehend-obfuscations · Plan · PCC · judge

- **status:** **Accepted**
- **date:** 2026-07-17
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Obfuscations Step Plan Failsafe Prepare-Concise-Context Thinking Judge Call-Site`
- **agent:** `DepositInputComprehensionAgent`
- **step / failsafe / thinking:** plan / prepare_concise_context / **judge**
- **harness:** host-adopt clone (`FORCE_CLONE_PTRR=0`), `BITCODE_DEBUG_SETUP_SERIAL=1`, `callCount: 5`, `debugStop: true`
- **usage:** judge completion present; `approved: false` with grounded issues (expected Judge posture)

#### coverage

| Axis | Result |
| --- | --- |
| **hierarchy** | **Pass** — same deposit Setup Plan PCC stack as 1.D10 |
| **dual law** | **Pass** — Judge conditions on prior reason + keys tree |
| **grounding** | **Pass** — flags over-select (`#repository:provider`, weak `#pipeline:synthesizeMode`), missing `#host:sourceRevision`, optional catalog body loaders |
| **useTools** | **Pass** — Judge does not select tools |

#### decision

| | |
| --- | --- |
| **this stop** | **Accepted** (Judge may disapprove; call-site is valid) |
| **next marker** | Plan PCC **structured_output** (1.D12) |
| **harness note** | After 1.D9 keep `FORCE_CLONE_PTRR=0` + `SETUP_SERIAL=1` for Setup wave-1 |

---

### 1.D12 Deposit · Setup · comprehend-obfuscations · Plan · PCC · structured_output

- **status:** **Accepted**
- **date:** 2026-07-17
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Obfuscations Step Plan Failsafe Prepare-Concise-Context Thinking Structured-Output Call-Site`
- **selectedKeys (actual):** `#deposit:obfuscations`, `#deposit:sourceCheckoutCatalog`, `#deposit:permissibleSources`, `#deposit:impermissibleSources`, `#host:sourceRevision`, `#repository:workspacePath`
- **callCount:** 7 · `debugStop: true`
- **decision:** **Accepted** — Plan PCC closed; residual key polish absorbed at CS/Try

---

### 1.D13 Deposit · Setup · comprehend-obfuscations · **Agent end**

- **status:** **Accepted**
- **date:** 2026-07-17
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Obfuscations Agent End`
- **harness:** host-adopt + serial Setup; `callCount: 49`; stop refine/CS/SO
- **terminal SO:** comprehension maps secrets redaction → `.npmrc` + credential concepts; honorNotes present
- **PTRR:** Plan→Try→Retry→Refine observed (tools empty; correct — no tools on this agent)
- **decision:** **Accepted — obfuscations agent complete**
- **next:** initialize-lsp agent end (1.D-L)

---

### 1.D-L Deposit · Setup · initialize-lsp · **Agent end**

- **status:** **Accepted with residual**
- **date:** 2026-07-17
- **commit_tag:** `QA Pipeline Deposit Phase Setup Agent Initialize-Lsp Agent End`
- **agent:** `asset-pack-initialize-lsp-agent`
- **stop:** refine / chunk_then_sum / structured_output · `callCount` ~97 (includes prior Setup agents)
- **terminal SO:** `initialized: false` with workspace rootUri set (host checkout path present); capabilities empty
- **residual (pre-fix):** agent map was empty / phantom tool names. **Post-fix (2026-07-17):** Setup registers named LSP suite (`lsp-workspace-symbols`, …), primes registry for Discovery, initialize-lsp agent binds real tools. `@bitcode/lsp` in-process `createConnection` still lacks transport (session start may error); tools remain registered for subsequent phases — re-open under Discovery when live symbol queries must succeed end-to-end.
- **decision:** **Accepted for Setup progression** (tool plane wired for subsequent phases)

### 1.D-M Deposit · Setup · initialize-mcps-tools · deterministic

- **status:** **Accepted**
- **agent:** `setup:asset-pack-initialize-mcps-tools-agent` (single-step, no LLM)
- **evidence:** serial Setup order runs MCP before obfuscations/LSP; pipeline reaches Discovery without MCP throw when no route mcpConfig
- **decision:** **Accepted** (no-op normalize path is valid for deposit debug fixture)

### 1.D-W Deposit · Setup · danger-wall · deterministic

- **status:** **Accepted**
- **agent:** `setup:danger-wall` (deterministic admission)
- **evidence:** with fixture obfuscations text + successful DepositInputComprehension guidance store, phase advances past danger-wall into Discovery (agents registered and LLM-called)
- **decision:** **Accepted**

### 1.D-Setup · **Setup phase closed**

- **status:** **Closed** (2026-07-17)
- **roster:** clone-vcs (1.D1–1.D9) → MCP (1.D-M) → obfuscations (1.D10–1.D13) → LSP (1.D-L) → danger-wall (1.D-W)
- **harness law for continuation:**
  - `BITCODE_DEBUG_FORCE_CLONE_PTRR=0` after 1.D9
  - `BITCODE_DEBUG_SETUP_SERIAL=1` for progressive stops
  - `BITCODE_LLM_CALL_TIMEOUT_MS=0` when Judge/CS can exceed 180s
- **layout fixes during Setup QA:** host import split (all-3 / synth / product); zod on read package; serial Setup debug flag; discovery registration import path; codebase-analysis-helpers package export
- **next progressive marker:** Discovery · `DepositInherentRegurgitationAgent` Plan PCC reason

### 1.D14 Deposit · Discovery · comprehend-codebase · Plan · PCC · reason

- **status:** **Accepted (fully successful call-site; ready for Plan PCC judge)**
- **date:** 2026-07-17
- **pipeline:** synthesize-deposit-asset-packs
- **pipeline_mode:** deposit
- **phase:** discovery
- **agent:** `DepositCodebaseComprehensionAgent`
- **agent_registry_key:** `discovery:comprehend-codebase`
- **step:** plan
- **failsafe:** prepare_concise_context
- **thinking:** reason
- **execution_path:** `…/phase:discovery/seq-0/…/agent:DepositCodebaseComprehensionAgent/plan/…/failsafe:prepare_concise_context/selection/…/thinkings:reason`
- **provider / model:** anthropic / `claude-haiku-4-5-20251001`
- **usage:** 8797 in / 941 out / 9738 total
- **abort_marker:** matched — hard-stop after plan/prepare_concise_context/reason agent=DepositCodebaseComprehensionAgent
- **expected_schemas:**
  - **step_return:** `PlanStepOutputSchema` (later CS SO — not this call)
  - **failsafe_terminal:** `PCC_KEY_SELECTION_SCHEMA` `{ selectedKeys }` (later SO)
  - **thinking_return:** `ReasoningSchema` `{ analysis, reasoningItems[], conclusion, confidence }` — **this call**
- **tools:**
  - **usable:** catalog present on keys tree; Plan PCC must not select
  - **selected (useTools):** **none** (correct — omitted)
  - **executed:** none
- **prompts_and_parts_considered:**
  - **phase:** Discovery law (map/search; no Implementation writes)
  - **agent:** Host checkout comprehension (measurements, LSP, tree, key files)
  - **step:** Plan strategy only
  - **failsafe:** PCC keys-only selection
  - **thinking:** Reason (not Judge/SO)
- **contextful_inputs:** keys-only tree with host/deposit/setup/discovery namespaces; parallel sibling regurgitation keys visible in tree
- **completion_response:** (see artifacts) — analysis + 11 reasoningItems; conclusion recommends **9 keys** (`#host:sourceRevision`, `#host:manifestRoot`, deposit obfuscations/path gates + `sourceCheckoutCatalog`, `#discovery:sourceMeasurements`, `#pipeline:input`, `#repository:provider`); confidence **0.92**; **no useTools**; **no selectedKeys**
- **prompt_excellence_breakdown:**
  - Role filter correct for PCC reason; user forbids tools/selectedKeys
  - Hierarchy includes Execution→SDIVF→Discovery→agent→Plan→PCC→Reason
  - Residual hygiene: system ~27k with large tool docs (LSP + depository search) on a no-tool PCC reason — same class as Setup residual; not a role failure
- **completion_excellence_breakdown:**
  - Correct PCC ranking (host coords > null shells; source-safety; catalog)
  - Minimal count stated (9); omits lineage/debug/tools
  - Slight over-include: `#discovery:sourceMeasurements` may be empty at Plan start (wave-1 self) — acceptable for strategy; SO can drop empty
- **stability_confidence:** **0.91**
- **stability_analysis:**
  - **schema_parse:** Pass — ReasoningSchema shape
  - **role_correctness:** Pass — Plan PCC reason only
  - **task_quality:** Pass — deposit Discovery grounded
  - **prompt_hygiene:** Partial — tool catalog bloat on system
  - **regression_vs_prior:** Pass — first Discovery LLM after Setup closed
- **decision:** move marker to Plan PCC **judge** (1.D15)
- **artifacts:** `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/0002-request-…codebase…reason.json`, `0005-response-…`, `0006-abort-…`
- **commit_tag:** QA Deposit Discovery Codebase Plan Pcc Reason Call-Site
- **harness fixes landed with this stop:**
  - `BITCODE_DEBUG_FAST_SETUP=1` — skip re-PTRR obfuscations/LSP after Setup closed (stores admissible guidance for danger-wall)
  - Discovery wave-1 serial when `BITCODE_DEBUG_SETUP_SERIAL` / `BITCODE_DEBUG_DISCOVERY_SERIAL` — prevents parallel regurgitation racing past abort
- **Depository search (wave-2; critical for Read Needs) — impl improvements this pass:**
  - Need-first `buildDepositorySearchQueryPlan` (full phrase + tokens; path stems secondary for `read-need-fits`)
  - Phrase-weighted lexical scoring; tool accepts `needText` / `product`
  - Read Need-fits agent uses shared planner; unit tests green

### 1.D15 Deposit · Discovery · comprehend-codebase · Plan · PCC · judge

- **status:** **Accepted**
- **date:** 2026-07-17
- **usage:** ~9.1k in / ~565 out (live stop; serial fast Setup)
- **abort:** hard-stop after plan/prepare_concise_context/judge
- **thinking_return:** JudgmentSchema — `approved: false` with count/hygiene critiques (valid call-site; same law as Setup 1.D2)
- **role:** Pass — PCC quality judge on prior reason; no selectedKeys/useTools
- **stability_confidence:** **0.93**
- **decision:** advance to 1.D16 SO
- **commit_tag:** QA Deposit Discovery Codebase Plan Pcc Judge Call-Site

### 1.D16 Deposit · Discovery · comprehend-codebase · Plan · PCC · structured_output

- **status:** **Accepted** (PCC selection Thinkings complete)
- **date:** 2026-07-17
- **usage:** 9486 in / 120 out
- **completion:** `{ selectedKeys: [ #host:sourceRevision, #host:manifestRoot, #deposit:obfuscations, #deposit:permissibleSources, #deposit:impermissibleSources, #seq-2#…#setup:asset-pack-initialize-mcps-tools-agent#agent#output, #discovery:sourceMeasurements ] }` — 7 keys; **no useTools**
- **residuals:** MCP agent-output path is odd (fast-setup empty MCP); `sourceCheckoutCatalog` not in selectedKeys this stop — CS still received catalog via host/deposit resolution (verified in CS reason grounding)
- **stability_confidence:** **0.90**
- **decision:** advance to CS reason (1.D17)
- **commit_tag:** QA Deposit Discovery Codebase Plan Pcc Structured-Output Call-Site

### 1.D17 Deposit · Discovery · comprehend-codebase · Plan · CS · reason

- **status:** **Accepted**
- **date:** 2026-07-17
- **failsafe:** chunk_then_sum
- **usage:** ~10.0–10.4k in / ~890–1052 out
- **role:** Pass — Plan **task** reason (strategy for knowledge map), not PCC selection; **useTools omitted** (Plan)
- **task quality:** Grounded in is-plain-obj checkout (15 paths, samples, measurements, obfuscations); deposit-correct
- **stability_confidence:** **0.92**
- **decision:** advance to CS judge
- **commit_tag:** QA Deposit Discovery Codebase Plan Cs Reason Call-Site

### 1.D18 Deposit · Discovery · comprehend-codebase · Plan · CS · judge

- **status:** **Accepted**
- **date:** 2026-07-17
- **usage:** ~11.2–11.5k in / ~388–463 out
- **completion:** Judgment quality ~0.88–0.92; issues about emitting comprehension schema early (correctly deferred to Plan SO / later Try) — call-site valid
- **stability_confidence:** **0.93**
- **decision:** advance to CS SO
- **commit_tag:** QA Deposit Discovery Codebase Plan Cs Judge Call-Site

### 1.D19 Deposit · Discovery · comprehend-codebase · Plan · CS · structured_output

- **status:** **Accepted** (Plan CS Thinkings complete)
- **date:** 2026-07-17
- **usage:** 11903 in / 983 out
- **thinking_return / step Plan:** `PlanStepOutputSchema` `{ approach, steps[] }` — strategy for knowledge-map synthesis; **not** PCC selectedKeys
- **role:** Pass — Plan task SO; no tools
- **stability_confidence:** **0.93**
- **decision:** Stitch next (often zero-LLM)
- **commit_tag:** QA Deposit Discovery Codebase Plan Cs Structured-Output Call-Site

### 1.D20–1.D22 Deposit · Discovery · comprehend-codebase · Plan · Stitch · (reason/judge/SO)

- **status:** **Accepted (zero-LLM fence)** — same pattern as Setup 1.D7
- **date:** 2026-07-17
- **evidence:** stop `failsafe=stitch_until_complete` `generation=reason` produced **no** stitch wire files; pipeline advanced to **Try** PCC (and beyond when unstopped). Single-pass CS composed request fit host budget → Stitch not required.
- **decision:** Plan step **closed**. Marker → **Try · PCC · reason** (1.D23)
- **commit_tag:** QA Deposit Discovery Codebase Plan Stitch Fence Call-Site

### 1.D-Plan · **Plan step closed** (comprehend-codebase first step, 9 sites)

| # | ID | Site | Status |
|---|-----|------|--------|
| 1 | 1.D14 | PCC reason | Accepted |
| 2 | 1.D15 | PCC judge | Accepted |
| 3 | 1.D16 | PCC SO | Accepted |
| 4 | 1.D17 | CS reason | Accepted |
| 5 | 1.D18 | CS judge | Accepted |
| 6 | 1.D19 | CS SO | Accepted |
| 7–9 | 1.D20–22 | Stitch | Zero-LLM fence Accepted |

### 1.D23 Deposit · Discovery · comprehend-codebase · **Try** · PCC · reason

- **status:** **Accepted**
- **date:** 2026-07-17
- **usage:** ~10.1k in / ~944 out
- **role:** Pass — Try PCC key selection; prioritizes host coords, source-safety, **sourceCheckoutCatalog**, **#discovery:usableToolNames**, workspacePath
- **useTools:** omitted (correct for PCC)
- **stability_confidence:** **0.92**
- **decision:** advance to Try PCC judge
- **commit_tag:** QA Deposit Discovery Codebase Try Pcc Reason Call-Site

### 1.D24 Deposit · Discovery · comprehend-codebase · Try · PCC · judge

- **status:** **Accepted**
- **date:** 2026-07-17
- **usage:** ~10.7k in / ~589 out
- **completion:** Judgment quality ~0.78; critiques on path form / host runId — call-site valid
- **stability_confidence:** **0.92**
- **commit_tag:** QA Deposit Discovery Codebase Try Pcc Judge Call-Site

### 1.D25 Deposit · Discovery · comprehend-codebase · Try · PCC · structured_output

- **status:** **Accepted** (Try PCC selection complete)
- **date:** 2026-07-17
- **usage:** 11363 in / 102 out
- **selectedKeys (8):** `#host:manifestRoot`, `#host:sourceRevision`, deposit obfuscations + path gates + **sourceCheckoutCatalog**, `#repository:workspacePath`, **`#discovery:usableToolNames`**
- **no useTools** (PCC law)
- **stability_confidence:** **0.93**
- **commit_tag:** QA Deposit Discovery Codebase Try Pcc Structured-Output Call-Site

### 1.D26 Deposit · Discovery · comprehend-codebase · Try · CS · reason

- **status:** **Accepted** — multi-tool Try strategy **proven**
- **date:** 2026-07-17
- **usage:** ~11.2k in / ~2990 out (large useTools payload)
- **useTools:** **18** calls — `host-workspace-read-file`×5, `host-workspace-run-command`×4, `host-workspace-list-dir`×2, `lsp-workspace-symbols`×2, `lsp-document-symbols`×2, `lsp-hover`/`definition`/`references`
- **diversity:** same tools with different paths/queries (index.js, test.js, index.d.ts, package.json, .github/, git log/show, rg, multiple LSP positions)
- **confidence:** 0.95
- **stability_confidence:** **0.94**
- **residual fixed after:** host tools accept `workspacePath` alias for `workspaceRoot` (models emit Path)
- **commit_tag:** QA Deposit Discovery Codebase Try Cs Reason Call-Site

### 1.D27 Deposit · Discovery · comprehend-codebase · Try · CS · judge

- **status:** **Accepted**
- **date:** 2026-07-17
- **usage:** ~12.3k in / ~625 out
- **quality:** ~0.88 — valid task judge on multi-tool plan
- **stability_confidence:** **0.92**
- **commit_tag:** QA Deposit Discovery Codebase Try Cs Judge Call-Site

### 1.D28 Deposit · Discovery · comprehend-codebase · Try · CS · structured_output

- **status:** **Accepted** (Try task SO + tools postprocess)
- **date:** 2026-07-17
- **usage:** ~15.4k in / ~3560 out (comprehension + useTools re-emit)
- **completion:** full `comprehension` map for is-plain-obj + **useTools 18** (hoist/postprocess)
- **role:** Pass — Try SO may include useTools; tools postprocess runs after failsafes
- **stability_confidence:** **0.93**
- **commit_tag:** QA Deposit Discovery Codebase Try Cs Structured-Output Call-Site

### 1.D29–1.D31 Deposit · Discovery · comprehend-codebase · Try · Stitch

- **status:** **Accepted (zero-LLM fence)**
- **evidence:** no stitch wire files; pipeline advanced to Retry after Try CS
- **commit_tag:** QA Deposit Discovery Codebase Try Stitch Fence Call-Site

### 1.D32–1.D37 Deposit · Discovery · comprehend-codebase · **Retry** · PCC+CS (Stitch fence)

- **status:** **Accepted** (full Retry Thinkings observed end-to-end)
- **date:** 2026-07-17
- **Retry CS reason useTools:** **12** additional (read-file×4, list-dir×2, run-command×3, LSP symbols)
- **Retry CS SO:** comprehension refreshed; residual toolsUsed field sometimes labels seed context (non-blocking)
- **Stitch:** zero-LLM
- **stability_confidence:** **0.90**
- **commit_tag:** QA Deposit Discovery Codebase Retry Step Call-Site

### 1.D38–1.D43 Deposit · Discovery · comprehend-codebase · **Refine** · PCC+CS (Stitch fence)

- **status:** **Accepted**
- **date:** 2026-07-17
- **useTools:** omitted on Refine (correct — Refine has no tools postprocess)
- **Refine CS SO:** polished source-safe knowledge map (is-plain-obj type-guard utility)
- **Stitch:** zero-LLM
- **stability_confidence:** **0.92**
- **commit_tag:** QA Deposit Discovery Codebase Refine Step Call-Site

### 1.D-Agent · **DepositCodebaseComprehensionAgent closed**

- **status:** **Closed** (2026-07-17)
- **roster:** Plan 1.D14–22 → Try 1.D23–31 → Retry 1.D32–37 → Refine 1.D38–43
- **proof highlights:**
  - Multi-tool Try with **18** useTools (LSP + host read/list/run) and diversified parameters
  - Retry added **12** more tool selections
  - Refine polished without tools
  - Host tools registry + `workspacePath` alias; full LSP suite registered for agent
- **next progressive marker:** Discovery wave-1 sibling **`DepositInherentRegurgitationAgent`** Plan PCC reason  
  (then wave-2 **search-depository-for-deposit-relevants**)

### 1.2+ Read next / Deposit next

- **1.D44** Discovery · inherent-regurgitation · Plan · PCC · reason  
- **1.2** Read · Setup · clone-vcs · Plan · PCC · **judge**  
- **later** Discovery wave-2 · search-depository (deposit relevants / read Need-fits) live tool proof  

---

## §2–§13 (placeholders)

### §2 SDIVF deposit pipeline production-like accept

- **status:** **Partial**  
- **criterion:** full Setup→…→Finish deposit run under LocalHost / production-like accept with real inference; until then, §1 deposit call-by-call rows are the progressive proof.  
- **proof (current):** Setup closed; Discovery **codebase comprehension agent closed** (1.D14–1.D-Agent).  
  Multi-tool Try proven (18 useTools). Harness: fast Setup + serial Discovery.

### §3 SDIVF read pipeline production-like accept

- **status:** Open (partial offline via §1.1 first reason)  
- **criterion:** (TBD) full read SDIVF beyond Setup first reason.  
- **proof:** §1.1 Accepted (reason); read harness not yet advanced to judge.

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
| 2026-07-16 | **1.D9** clone-vcs agent end Accepted: marker refine/CS/SO; useTools hoist + clone tool registration/git-https; tools postprocess merges workspacePath. |
| 2026-07-17 | **1.D10–1.D13** obfuscations Plan PCC R/J/SO + agent end; host-adopt after clone; `BITCODE_DEBUG_SETUP_SERIAL`; layout host import + zod + discovery register path fixes. |
| 2026-07-17 | **1.D-L / 1.D-M / 1.D-W** LSP agent end (residual uninitialized), MCP + danger-wall Accepted; **Setup phase closed**. Marker → Discovery 1.D14. |
| 2026-07-17 | **1.D14** Discovery codebase Plan PCC reason Accepted. Fast Setup + Discovery serial harness; Need-first depository search query plan. Marker → 1.D15 judge. |
| 2026-07-17 | **1.D15–1.D22** Plan step closed (PCC R/J/SO, CS R/J/SO, Stitch zero-LLM fence). Marker → Try PCC reason 1.D23. |
| 2026-07-17 | **1.D23–1.D-Agent** Codebase agent closed (Try 18 tools, Retry 12, Refine). Marker → inherent-regurgitation. |
